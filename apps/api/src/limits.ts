import { lt, sql } from 'drizzle-orm';
import type { Database } from './db/client';
import { authLimits } from './db/schema';

/**
 * Sign-in limits (fix F-11, DPIA risk 13). Better Auth already refuses bursts from one network address; these add
 * limits over an hour, which hold across every server instance because the counts live in Postgres.
 *
 * - Codes: an email address can ask for 5 codes an hour, and a network address for 30 (several people can share
 *   one, on a phone network or in an office).
 * - Guesses: an address can try 10 codes an hour. Each code also allows only 3 tries before it stops working.
 * - Alerts: 25 failed codes across all addresses in 10 minutes, or 6 for one address in an hour, write one
 *   `auth alert` line to the log, once per window. The host's log alerts can watch for it.
 */
export type LimitRule = { window: number; max: number };

export const signInLimits = {
  codesPerAddress: { window: 3600, max: 5 },
  codesPerNetwork: { window: 3600, max: 30 },
  guessesPerAddress: { window: 3600, max: 10 },
  failedEverywhere: { window: 600, max: 25 },
  failedForAddress: { window: 3600, max: 6 },
} satisfies Record<string, LimitRule>;

/** One sign-in alert. It names no address: `who` is a short keyed hash, enough to see that alerts repeat. */
export type SignInAlert = { kind: 'failed-codes'; scope: 'everywhere' | 'address'; count: number; minutes: number; who?: string };

/** Counters older than a day are gone; no window is longer than an hour. */
const KEEP_MS = 24 * 3600 * 1000;

/**
 * Counts one request against `key` in a fixed window of `rule.window` seconds, in a single statement, so requests
 * that arrive together on different servers can't all slip under the limit. A window that has passed starts again.
 */
export async function consume(db: Database, key: string, rule: LimitRule, now: number): Promise<{ allowed: boolean; count: number; retryAfter: number | null }> {
  const at = new Date(now), cutoff = new Date(now - rule.window * 1000);
  const result = await db.execute(sql`
    insert into ${authLimits} (key, count, window_start) values (${key}, 1, ${at})
    on conflict (key) do update set
      count = case when ${authLimits.window_start} <= ${cutoff} then 1 else ${authLimits.count} + 1 end,
      window_start = case when ${authLimits.window_start} <= ${cutoff} then ${at} else ${authLimits.window_start} end
    returning count, window_start`);
  const rows = (Array.isArray(result) ? result : (result as { rows?: unknown[] }).rows ?? []) as { count: number | string; window_start: string | Date }[];
  const count = Number(rows[0]?.count ?? 1);
  const started = new Date(rows[0]?.window_start ?? at).getTime();
  const allowed = count <= rule.max;
  return { allowed, count, retryAfter: allowed ? null : Math.max(1, Math.ceil((started + rule.window * 1000 - now) / 1000)) };
}

/** A keyed hash, so the table never holds an email or network address. */
export async function limitKey(secret: string, kind: string, value: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${kind}\u0000${value}`)));
  return `${kind}:${[...mac.slice(0, 16)].map(b => b.toString(16).padStart(2, '0')).join('')}`;
}

/** Better Auth's own burst limits, kept in the same table instead of one server's memory. */
export function limitStorage(db: Database, secret: string, now: () => number = Date.now) {
  return {
    consume: async (key: string, rule: LimitRule) => {
      const { allowed, retryAfter } = await consume(db, await limitKey(secret, 'burst', key), rule, now());
      return { allowed, retryAfter };
    },
  };
}

/** Deletes counters whose windows ended long ago. The daily sweep calls it. */
export async function pruneLimits(db: Database, now: number): Promise<number> {
  const gone = await db.delete(authLimits).where(lt(authLimits.window_start, new Date(now - KEEP_MS))).returning({ key: authLimits.key });
  return gone.length;
}

/** The default alert: one line for the host's logs, with nothing that identifies the person. */
export const logAlert = (alert: SignInAlert) => { console.error('auth alert', JSON.stringify(alert)); };
