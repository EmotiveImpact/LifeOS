import { eq, inArray } from 'drizzle-orm';
import { z } from 'zod';
import type { Db } from './db/client';
import { subscriptions, users } from './db/schema';

/**
 * Billing (fix F-20). Life is paid only, with a free trial (Edem, 20 Nov 2026). Apple or Google takes the payment;
 * RevenueCat checks the store's receipts and tells this server what changed through a signed webhook. The server
 * keeps its own record of each person's subscription (`subscriptions`), so it never has to ask RevenueCat during a
 * request, and decides from that record whether the routes that cost money are open.
 *
 * - The webhook is signed with HMAC-SHA256 over `<timestamp>.<raw body>` (RevenueCat's `X-RevenueCat-Webhook-Signature`).
 *   Without a signing secret it answers 503; a bad or old signature answers 401.
 * - Events name the person by Life's own user id: the phone signs RevenueCat in with it after Life's sign-in.
 *   Anonymous RevenueCat ids are never matched, and an event for nobody Life knows is acknowledged and dropped.
 * - Each row remembers the newest event applied, so a retry or a late, older event can't undo a newer one.
 * - Nothing about payment is kept: no price, currency, country, receipt or card. Only the store, the product and dates.
 * - Enforcement is a switch, off until the stores and RevenueCat are live. With it on, only the routes that cost money
 *   need a subscription. Sync, export, deletion and the rest stay open, so a lapsed trial never strands anyone's data.
 */
export type BillingOptions = {
  /** RevenueCat's webhook signing secret. Without it the webhook answers 503. */
  webhookSecret?: string;
  /** The RevenueCat entitlement that unlocks Life. */
  entitlement?: string;
  /** Whether the routes that cost money need a subscription. Off until billing is live. */
  enforce?: boolean;
  /** Whether sandbox purchases count (TestFlight and Play's internal testing). Off in production. */
  sandbox?: boolean;
};

export const DEFAULT_ENTITLEMENT = 'life';

/** Routes that call paid services on someone's behalf. Everything else stays open without a subscription. */
export const PAID_ROUTES: ReadonlySet<string> = new Set([
  'POST /ai/run',
  'POST /memory/search',
  'GET /wearables/samples',
  'POST /wearables/whoop/connect',
  'POST /wearables/oura/connect',
]);

/** How long a signature stays good: clock skew and the POST itself, not RevenueCat's retry window. */
const SIGNATURE_TOLERANCE_S = 300;

const ids = z.array(z.string()).nullish();
const ms = z.number().int().nullish();
const Payload = z.object({
  api_version: z.string().optional(),
  event: z.object({
    id: z.string().min(1),
    type: z.string().min(1),
    event_timestamp_ms: z.number().int(),
    app_user_id: z.string().nullish(),
    original_app_user_id: z.string().nullish(),
    aliases: ids,
    product_id: z.string().nullish(),
    new_product_id: z.string().nullish(),
    period_type: z.string().nullish(),
    store: z.string().nullish(),
    environment: z.string().nullish(),
    entitlement_id: z.string().nullish(),
    entitlement_ids: ids,
    expiration_at_ms: ms,
    grace_period_expiration_at_ms: ms,
    cancel_reason: z.string().nullish(),
    transferred_from: ids,
    transferred_to: ids,
  }),
});
export type BillingEvent = z.infer<typeof Payload>['event'];

/** What the phone and the API see of a subscription. */
export type SubscriptionState = {
  /** none: never subscribed. trial: in the free trial. active: paid. grace: a payment failed and the store is retrying. ended: lapsed. */
  status: 'none' | 'trial' | 'active' | 'grace' | 'ended';
  active: boolean;
  renews: boolean;
  product: string | null;
  store: string | null;
  expiresAt: string | null;
  sandbox: boolean;
};

const hex = (bytes: ArrayBuffer) => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, '0')).join('');

function sameHex(given: string, expected: string): boolean {
  let diff = given.length ^ expected.length;
  for (let i = 0; i < expected.length; i++) diff |= (given.charCodeAt(i) || 0) ^ expected.charCodeAt(i);
  return diff === 0;
}

/** Checks RevenueCat's `t=<seconds>,v1=<hex>` signature over the raw body. */
export async function verifySignature(rawBody: string, header: string | null, secret: string, now: number): Promise<boolean> {
  if (!header) return false;
  const parts = Object.fromEntries(header.split(',').map(part => { const at = part.indexOf('='); return [part.slice(0, at).trim(), part.slice(at + 1).trim()]; }));
  const t = Number(parts.t), given = parts.v1;
  if (!Number.isSafeInteger(t) || !given || Math.abs(now / 1000 - t) > SIGNATURE_TOLERANCE_S) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const expected = hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${parts.t}.${rawBody}`)));
  return sameHex(given.toLowerCase(), expected);
}

/** Life's user id among the ids RevenueCat gives, if Life knows it. Anonymous RevenueCat ids are skipped. */
async function findUser(db: Db, candidates: (string | null | undefined)[]): Promise<string | null> {
  const named = [...new Set(candidates.filter((id): id is string => !!id && !id.startsWith('$RCAnonymousID')))];
  if (!named.length) return null;
  const known = new Set((await db.db.select({ id: users.id }).from(users).where(inArray(users.id, named))).map(u => u.id));
  return named.find(id => known.has(id)) ?? null;
}

type Row = typeof subscriptions.$inferSelect;
type Change = Partial<Omit<Row, 'user_id' | 'event_at' | 'updated_at'>>;

/** Events that start or extend access, with the date access now ends. */
const GRANTS = new Set(['INITIAL_PURCHASE', 'RENEWAL', 'PRODUCT_CHANGE', 'UNCANCELLATION', 'SUBSCRIPTION_EXTENDED', 'TEMPORARY_ENTITLEMENT_GRANT', 'REFUND_REVERSED', 'NON_RENEWING_PURCHASE']);

/** How one event changes the record, or null when it doesn't touch it. */
function changeFor(event: BillingEvent): Change | null {
  const at = event.event_timestamp_ms;
  const date = (value: number | null | undefined) => (value == null ? null : new Date(value));
  const identity = {
    ...(event.new_product_id ?? event.product_id ? { product: (event.new_product_id ?? event.product_id)! } : {}),
    ...(event.period_type ? { period: event.period_type } : {}),
    ...(event.store ? { store: event.store } : {}),
    ...(event.environment ? { sandbox: event.environment === 'SANDBOX' } : {}),
  };
  if (GRANTS.has(event.type)) {
    // A one-off purchase with no expiry never ends; every other grant carries its end date.
    const ends = event.expiration_at_ms != null ? { expires_at: date(event.expiration_at_ms) } : event.type === 'NON_RENEWING_PURCHASE' ? { expires_at: null } : {};
    return { ...identity, ...ends, renews: event.type !== 'NON_RENEWING_PURCHASE', billing_issue: false };
  }
  switch (event.type) {
    case 'CANCELLATION':
      // Turning off renewal keeps access to the end of the period. A refund (CUSTOMER_SUPPORT) ends it now.
      return event.cancel_reason === 'CUSTOMER_SUPPORT'
        ? { ...identity, renews: false, expires_at: new Date(Math.min(event.expiration_at_ms ?? at, at)) }
        : { ...identity, renews: false, ...(event.expiration_at_ms != null ? { expires_at: date(event.expiration_at_ms) } : {}) };
    case 'EXPIRATION':
      return { ...identity, renews: false, billing_issue: false, expires_at: new Date(Math.min(event.expiration_at_ms ?? at, at)) };
    case 'BILLING_ISSUE': {
      // The store retries the payment; access lasts to the end of the grace period, if the store gives one.
      const ends = event.grace_period_expiration_at_ms ?? event.expiration_at_ms;
      return { ...identity, billing_issue: true, ...(ends != null ? { expires_at: date(ends) } : {}) };
    }
    case 'SUBSCRIPTION_PAUSED':
      return { ...identity, renews: false };
    default:
      return null;
  }
}

/** Writes one change onto a person's record, unless a newer event is already there. */
async function write(db: Db, userId: string, change: Change, eventAt: Date, now: number): Promise<boolean> {
  const [current] = await db.db.select().from(subscriptions).where(eq(subscriptions.user_id, userId));
  if (current && current.event_at.getTime() > eventAt.getTime()) return false;
  if (!current && (!change.product || !change.period || !change.store)) return false; // nothing to build a record from
  const row = {
    product: change.product ?? current!.product,
    period: change.period ?? current!.period,
    store: change.store ?? current!.store,
    sandbox: change.sandbox ?? current?.sandbox ?? false,
    expires_at: change.expires_at !== undefined ? change.expires_at : current?.expires_at ?? null,
    renews: change.renews ?? current?.renews ?? true,
    billing_issue: change.billing_issue ?? current?.billing_issue ?? false,
    event_at: eventAt,
    updated_at: new Date(now),
  };
  await db.db.insert(subscriptions).values({ user_id: userId, ...row }).onConflictDoUpdate({ target: subscriptions.user_id, set: row });
  return true;
}

export type WebhookOutcome = { applied: boolean; reason?: 'test' | 'sandbox' | 'other-entitlement' | 'unknown-person' | 'ignored-type' | 'stale' | 'unreadable' };

/** Applies one RevenueCat event to Life's record. Never throws for an event it can't use: RevenueCat would only retry it. */
export async function applyEvent(db: Db, body: unknown, options: BillingOptions, now: number): Promise<WebhookOutcome> {
  const parsed = Payload.safeParse(body);
  if (!parsed.success) return { applied: false, reason: 'unreadable' };
  const event = parsed.data.event, eventAt = new Date(event.event_timestamp_ms);
  if (event.type === 'TEST') return { applied: false, reason: 'test' };
  if (event.environment === 'SANDBOX' && !options.sandbox) return { applied: false, reason: 'sandbox' };
  const entitlement = options.entitlement ?? DEFAULT_ENTITLEMENT;
  const named = event.entitlement_ids ?? (event.entitlement_id ? [event.entitlement_id] : null);
  if (named && named.length && !named.includes(entitlement)) return { applied: false, reason: 'other-entitlement' };

  if (event.type === 'TRANSFER') {
    // The purchases moved to another account (a restore on a phone signed in as someone else).
    const to = await findUser(db, event.transferred_to ?? []);
    const from = await findUser(db, event.transferred_from ?? []);
    if (!to) return { applied: false, reason: 'unknown-person' };
    const [moving] = from ? await db.db.select().from(subscriptions).where(eq(subscriptions.user_id, from)) : [];
    if (!moving) return { applied: false, reason: 'unknown-person' };
    const { user_id: _from, event_at: _at, updated_at: _updated, ...carried } = moving;
    const moved = await write(db, to, carried, eventAt, now);
    if (moved && from !== to) await db.db.delete(subscriptions).where(eq(subscriptions.user_id, from!));
    return moved ? { applied: true } : { applied: false, reason: 'stale' };
  }

  const change = changeFor(event);
  if (!change) return { applied: false, reason: 'ignored-type' };
  const userId = await findUser(db, [event.app_user_id, event.original_app_user_id, ...(event.aliases ?? [])]);
  if (!userId) return { applied: false, reason: 'unknown-person' };
  return await write(db, userId, change, eventAt, now) ? { applied: true } : { applied: false, reason: 'stale' };
}

/** A person's subscription as of `now`. */
export async function subscriptionState(db: Db, userId: string, now: number, options: BillingOptions = {}): Promise<SubscriptionState> {
  const [row] = await db.db.select().from(subscriptions).where(eq(subscriptions.user_id, userId));
  if (!row || (row.sandbox && !options.sandbox)) return { status: 'none', active: false, renews: false, product: null, store: null, expiresAt: null, sandbox: false };
  const active = row.expires_at === null || row.expires_at.getTime() > now;
  const status = !active ? 'ended' : row.billing_issue ? 'grace' : row.period === 'TRIAL' ? 'trial' : 'active';
  return { status, active, renews: active && row.renews, product: row.product, store: row.store, expiresAt: row.expires_at?.toISOString() ?? null, sandbox: row.sandbox };
}

/** The webhook route: checks the signature over the raw body, then applies the event. */
export async function handleWebhook(db: Db, request: Request, options: BillingOptions | undefined, now: number): Promise<{ status: number; body: unknown }> {
  if (!options?.webhookSecret) return { status: 503, body: { error: 'BILLING_NOT_CONFIGURED' } };
  const raw = await request.text();
  if (!await verifySignature(raw, request.headers.get('x-revenuecat-webhook-signature'), options.webhookSecret, now)) return { status: 401, body: { error: 'BAD_SIGNATURE' } };
  let body: unknown = null;
  try { body = JSON.parse(raw); } catch { /* answered below */ }
  const outcome = await applyEvent(db, body, options, now);
  // Only what happened, never who: the log names no person.
  if (outcome.reason === 'unknown-person' || outcome.reason === 'unreadable') console.warn('billing event not applied', outcome.reason);
  return { status: 200, body: outcome };
}
