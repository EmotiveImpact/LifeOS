/**
 * WHOOP and Oura through their official OAuth APIs (BUILD_V26 Phase 26). Never Bluetooth: a WHOOP strap is never
 * read directly (SPEC §9.26).
 *
 * The person connects from the phone: `POST /wearables/{provider}/connect` returns the provider's sign-in page with a
 * signed, single-use state; the provider sends the browser back to `GET /wearables/{provider}/callback`, which swaps
 * the code for tokens, seals them (src/seal.ts) and stores them. The client secret never leaves this server.
 *
 * Readings pass through and are never stored here: `GET /wearables/samples` fetches from each connected provider and
 * returns them as the engine's `HealthSample`, and the phone summarises them with its own readings. Health data stays
 * on the phone (owner decision, 20 Nov); the server keeps only the sealed tokens.
 *
 * Endpoints and fields follow developer.whoop.com (v2) and cloud.ouraring.com/docs (v2), read on 20 Nov 2026. Both
 * need developer apps only the owner can create (decision 8), so nothing here has called the real services yet.
 */
import type { HealthSample, HealthSource } from '@life/core';
import { z } from 'zod';
import type { Db } from './db/client';
import { eq } from './db/kit';
import { oauthTokens } from './db/schema';

export const PROVIDERS = ['whoop', 'oura'] as const;
export type Provider = (typeof PROVIDERS)[number];
export const isProvider = (v: unknown): v is Provider => typeof v === 'string' && (PROVIDERS as readonly string[]).includes(v);

export interface ProviderApp { clientId: string; clientSecret: string }
export type Sealer = { seal(plain: string): Promise<string>; open(sealed: string): Promise<string> };

export interface WearableOptions {
  apps: Partial<Record<Provider, ProviderApp>>;
  /** The API's public origin; the providers send people back to `${publicUrl}/wearables/{provider}/callback`. */
  publicUrl: string;
  sealer: Sealer;
  /** Signs the OAuth state. */
  stateKey: string;
  /** A stand-in for tests. */
  fetch?: typeof fetch;
}

interface ProviderSpec {
  name: string;
  authorize: string;
  token: string;
  scope: string;
  revoke: (accessToken: string) => { url: string; init: RequestInit };
}

export const SPECS: Record<Provider, ProviderSpec> = {
  whoop: {
    name: 'WHOOP',
    authorize: 'https://api.prod.whoop.com/oauth/oauth2/auth',
    token: 'https://api.prod.whoop.com/oauth/oauth2/token',
    // `offline` is what returns a refresh token.
    scope: 'offline read:recovery read:sleep read:cycles read:workout',
    revoke: token => ({ url: 'https://api.prod.whoop.com/developer/v2/user/access', init: { method: 'DELETE', headers: { authorization: `Bearer ${token}` } } }),
  },
  oura: {
    name: 'Oura',
    authorize: 'https://cloud.ouraring.com/oauth/authorize',
    token: 'https://api.ouraring.com/oauth/token',
    scope: 'daily heartrate spo2 personal',
    revoke: token => ({ url: `https://api.ouraring.com/oauth/revoke?access_token=${encodeURIComponent(token)}`, init: { method: 'GET' } }),
  },
};

const WHOOP_API = 'https://api.prod.whoop.com/developer/v2';
const OURA_API = 'https://api.ouraring.com/v2/usercollection';
/** A connection waits this long for the provider to send the browser back. */
export const STATE_TTL_MS = 10 * 60_000;
/** The furthest back one samples request may reach: the phone's 60-day backfill and a day either side. */
export const MAX_SPAN_MS = 62 * 86_400_000;
const pending = (p: Provider) => `pending:${p}`;

/* ───────────────────────── State ───────────────────────── */

const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const fromB64url = (text: string) => Uint8Array.from(atob(text.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));

async function hmac(key: string, data: string): Promise<string> {
  const k = await crypto.subtle.importKey('raw', new TextEncoder().encode(`life-wearable-state:${key}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return b64url(new Uint8Array(await crypto.subtle.sign('HMAC', k, new TextEncoder().encode(data))));
}

const StatePayload = z.object({ u: z.string().min(1), p: z.enum(PROVIDERS), n: z.string().min(16), e: z.number() });
type State = z.infer<typeof StatePayload>;

export async function signState(key: string, state: State): Promise<string> {
  const body = b64url(new TextEncoder().encode(JSON.stringify(state)));
  return `${body}.${await hmac(key, body)}`;
}

export async function readState(key: string, token: string, now: number): Promise<State | null> {
  const [body, mac] = token.split('.');
  if (!body || !mac) return null;
  const expected = await hmac(key, body);
  if (expected.length !== mac.length) return null;
  let diff = 0;
  for (let i = 0; i < mac.length; i++) diff |= mac.charCodeAt(i) ^ expected.charCodeAt(i);
  if (diff) return null;
  try {
    const parsed = StatePayload.safeParse(JSON.parse(new TextDecoder().decode(fromB64url(body))));
    return parsed.success && parsed.data.e > now ? parsed.data : null;
  } catch { return null; }
}

/* ───────────────────────── Connecting ───────────────────────── */

export const redirectUri = (options: WearableOptions, provider: Provider) => `${options.publicUrl.replace(/\/$/, '')}/wearables/${provider}/callback`;

/** The provider's sign-in page for this person, with a state that works once, for ten minutes. */
export async function connectUrl(db: Db, options: WearableOptions, userId: string, provider: Provider, now: number): Promise<string | null> {
  const app = options.apps[provider];
  if (!app) return null;
  const nonce = b64url(crypto.getRandomValues(new Uint8Array(18)));
  const state = await signState(options.stateKey, { u: userId, p: provider, n: nonce, e: now + STATE_TTL_MS });
  const sealed = await options.sealer.seal(nonce);
  const at = new Date(now);
  await db.withUser(userId, tx => tx.insert(oauthTokens)
    .values({ id: crypto.randomUUID(), user_id: userId, provider: pending(provider), access_token: sealed, expires_at: new Date(now + STATE_TTL_MS), created_at: at, updated_at: at })
    .onConflictDoUpdate({ target: [oauthTokens.user_id, oauthTokens.provider], set: { access_token: sealed, expires_at: new Date(now + STATE_TTL_MS), updated_at: at } }));
  const url = new URL(SPECS[provider].authorize);
  url.search = new URLSearchParams({ response_type: 'code', client_id: app.clientId, redirect_uri: redirectUri(options, provider), scope: SPECS[provider].scope, state }).toString();
  return url.toString();
}

const TokenReply = z.object({ access_token: z.string().min(1), refresh_token: z.string().min(1).optional(), expires_in: z.number().positive().optional(), scope: z.string().optional() });
type Tokens = z.infer<typeof TokenReply>;

async function tokenRequest(options: WearableOptions, provider: Provider, body: Record<string, string>): Promise<Tokens | null> {
  const app = options.apps[provider];
  if (!app) return null;
  const doFetch = options.fetch ?? fetch;
  const res = await doFetch(SPECS[provider].token, { method: 'POST', headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' }, body: new URLSearchParams({ ...body, client_id: app.clientId, client_secret: app.clientSecret }).toString() });
  if (!res.ok) return null;
  const parsed = TokenReply.safeParse(await res.json().catch(() => null));
  return parsed.success ? parsed.data : null;
}

async function store(db: Db, options: WearableOptions, userId: string, provider: Provider, tokens: Tokens, now: number, keepRefresh?: string | null) {
  const access = await options.sealer.seal(tokens.access_token);
  const refresh = tokens.refresh_token ? await options.sealer.seal(tokens.refresh_token) : keepRefresh ?? null;
  const expires = tokens.expires_in ? new Date(now + tokens.expires_in * 1000) : null;
  const at = new Date(now);
  await db.withUser(userId, tx => tx.insert(oauthTokens)
    .values({ id: crypto.randomUUID(), user_id: userId, provider, access_token: access, refresh_token: refresh, expires_at: expires, scope: tokens.scope ?? SPECS[provider].scope, created_at: at, updated_at: at })
    .onConflictDoUpdate({ target: [oauthTokens.user_id, oauthTokens.provider], set: { access_token: access, refresh_token: refresh, expires_at: expires, scope: tokens.scope ?? SPECS[provider].scope, updated_at: at } }));
}

export type CallbackResult = { ok: true; provider: Provider } | { ok: false; reason: 'bad-state' | 'declined' | 'exchange-failed' | 'not-configured' };

/** The provider sent the browser back: check the state once, swap the code, seal and keep the tokens. */
export async function finishConnect(db: Db, options: WearableOptions, provider: Provider, params: URLSearchParams, now: number): Promise<CallbackResult> {
  if (!options.apps[provider]) return { ok: false, reason: 'not-configured' };
  const state = await readState(options.stateKey, params.get('state') ?? '', now);
  if (!state || state.p !== provider) return { ok: false, reason: 'bad-state' };
  // Single use: the waiting row is removed whatever happens next.
  const waiting = await db.withUser(state.u, async tx => {
    const rows = await tx.select().from(oauthTokens).where(eq(oauthTokens.provider, pending(provider)));
    if (rows.length) await tx.delete(oauthTokens).where(eq(oauthTokens.provider, pending(provider)));
    return rows[0] ?? null;
  });
  if (!waiting || (waiting.expires_at && waiting.expires_at.getTime() <= now)) return { ok: false, reason: 'bad-state' };
  if (await options.sealer.open(waiting.access_token).catch(() => null) !== state.n) return { ok: false, reason: 'bad-state' };
  const code = params.get('code');
  if (!code) return { ok: false, reason: 'declined' };
  const tokens = await tokenRequest(options, provider, { grant_type: 'authorization_code', code, redirect_uri: redirectUri(options, provider) });
  if (!tokens) return { ok: false, reason: 'exchange-failed' };
  await store(db, options, state.u, provider, tokens, now);
  return { ok: true, provider };
}

/** The connections this person has, without tokens. */
export async function listConnections(db: Db, options: WearableOptions, userId: string) {
  const rows = await db.withUser(userId, tx => tx.select({ provider: oauthTokens.provider, scope: oauthTokens.scope, created_at: oauthTokens.created_at }).from(oauthTokens));
  return {
    available: PROVIDERS.filter(p => !!options.apps[p]),
    connections: rows.filter(r => isProvider(r.provider)).map(r => ({ provider: r.provider as Provider, name: SPECS[r.provider as Provider].name, since: r.created_at.toISOString(), scope: r.scope })),
  };
}

/** Stops the connection: the provider is asked to revoke access (best effort) and the sealed tokens are deleted. */
export async function disconnect(db: Db, options: WearableOptions, userId: string, provider: Provider): Promise<boolean> {
  const row = await db.withUser(userId, async tx => {
    const rows = await tx.select().from(oauthTokens).where(eq(oauthTokens.provider, provider));
    await tx.delete(oauthTokens).where(eq(oauthTokens.provider, provider));
    return rows[0] ?? null;
  });
  if (!row) return false;
  try {
    const token = await options.sealer.open(row.access_token);
    const { url, init } = SPECS[provider].revoke(token);
    await (options.fetch ?? fetch)(url, init);
  } catch { /* already gone at the provider, or unreachable: the tokens are deleted here either way */ }
  return true;
}

/* ───────────────────────── Readings ───────────────────────── */

export const SamplesQuery = z.object({ from: z.coerce.number().int().nonnegative(), to: z.coerce.number().int().positive() })
  .refine(q => q.to > q.from && q.to - q.from <= MAX_SPAN_MS, 'span');

export type Problem = { provider: Provider; problem: 'reconnect' | 'unavailable' };

/** A fresh access token, refreshing it first when it has expired. Null when the person must connect again. */
async function accessToken(db: Db, options: WearableOptions, userId: string, provider: Provider, now: number): Promise<string | null | 'gone'> {
  const [row] = await db.withUser(userId, tx => tx.select().from(oauthTokens).where(eq(oauthTokens.provider, provider)));
  if (!row) return 'gone';
  if (!row.expires_at || row.expires_at.getTime() > now + 60_000) return options.sealer.open(row.access_token);
  if (!row.refresh_token) return null;
  const refresh = await options.sealer.open(row.refresh_token);
  const tokens = await tokenRequest(options, provider, { grant_type: 'refresh_token', refresh_token: refresh, ...(provider === 'whoop' ? { scope: 'offline' } : {}) });
  if (!tokens) return null;
  // Both providers' refresh tokens work once: the new one is kept straight away.
  await store(db, options, userId, provider, tokens, now, row.refresh_token);
  return tokens.access_token;
}

class ProviderDown extends Error {}
class Unauthorised extends Error {}

async function getJson(options: WearableOptions, url: string, token: string): Promise<Record<string, unknown>> {
  const res = await (options.fetch ?? fetch)(url, { headers: { authorization: `Bearer ${token}`, accept: 'application/json' } });
  if (res.status === 401 || res.status === 403) throw new Unauthorised();
  if (!res.ok) throw new ProviderDown();
  return await res.json() as Record<string, unknown>;
}

/** Every page of a collection: WHOOP pages with `nextToken`, Oura with `next_token`. At most 40 pages. */
async function pages(options: WearableOptions, base: string, params: Record<string, string>, token: string, pageParam: 'nextToken' | 'next_token'): Promise<Record<string, unknown>[]> {
  const out: Record<string, unknown>[] = [];
  let next: string | null = null;
  for (let i = 0; i < 40; i++) {
    const url = new URL(base);
    url.search = new URLSearchParams({ ...params, ...(next ? { [pageParam]: next } : {}) }).toString();
    const body = await getJson(options, url.toString(), token);
    const rows = (body.records ?? body.data) as Record<string, unknown>[] | undefined;
    out.push(...(Array.isArray(rows) ? rows : []));
    next = typeof body.next_token === 'string' && body.next_token ? body.next_token : null;
    if (!next) break;
  }
  return out;
}

const num = (v: unknown): number | undefined => (typeof v === 'number' && Number.isFinite(v) ? v : undefined);
const str = (v: unknown): string | undefined => (typeof v === 'string' && v ? v : undefined);
const obj = (v: unknown): Record<string, unknown> => (v && typeof v === 'object' ? v as Record<string, unknown> : {});

/**
 * A night given only as stage totals, laid out as blocks from bedtime so the engine can join them into one night:
 * time to fall asleep, then light, deep and REM, then the rest awake. The totals are exact; the order is a layout.
 */
export function stageBlocks(source: HealthSource, start: number, end: number, minutes: { latency?: number; light: number; deep: number; rem: number }): HealthSample[] {
  const out: HealthSample[] = [];
  let at = start + (minutes.latency ?? 0) * 60_000;
  if (at > start) out.push({ type: 'sleep', stage: 'awake', start: new Date(start).toISOString(), end: new Date(at).toISOString(), value: 1, source });
  for (const stage of ['light', 'deep', 'rem'] as const) {
    const ms = minutes[stage] * 60_000;
    if (ms <= 0) continue;
    const to = Math.min(end, at + ms);
    out.push({ type: 'sleep', stage, start: new Date(at).toISOString(), end: new Date(to).toISOString(), value: 1, source });
    at = to;
  }
  if (end > at) out.push({ type: 'sleep', stage: 'awake', start: new Date(at).toISOString(), end: new Date(end).toISOString(), value: 1, source });
  return out;
}

const point = (type: HealthSample['type'], at: number, value: number | undefined, source: HealthSource, extra: Partial<HealthSample> = {}): HealthSample[] =>
  value === undefined ? [] : [{ type, start: new Date(at).toISOString(), end: new Date(at).toISOString(), value, source, ...extra }];

const WHOOP_SOURCE: HealthSource = { id: 'whoop', kind: 'wearable', name: 'WHOOP' };
const OURA_SOURCE: HealthSource = { id: 'oura', kind: 'wearable', name: 'Oura' };

/** WHOOP's scored sleeps and recoveries as samples. Recovery readings are placed inside the night they came from. */
export function fromWhoop(sleeps: readonly Record<string, unknown>[], recoveries: readonly Record<string, unknown>[]): HealthSample[] {
  const out: HealthSample[] = [];
  const nights = new Map<string, { start: number; end: number }>();
  for (const s of sleeps) {
    if (s.score_state !== 'SCORED') continue;
    const start = Date.parse(str(s.start) ?? ''), end = Date.parse(str(s.end) ?? '');
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;
    const score = obj(s.score), stages = obj(score.stage_summary);
    const min = (k: string) => (num(stages[k]) ?? 0) / 60_000;
    out.push(...stageBlocks(WHOOP_SOURCE, start, end, { light: min('total_light_sleep_time_milli'), deep: min('total_slow_wave_sleep_time_milli'), rem: min('total_rem_sleep_time_milli') }));
    const mid = start + (end - start) / 2;
    out.push(...point('respiratoryRate', mid, num(score.respiratory_rate), WHOOP_SOURCE));
    if (str(s.id) && s.nap !== true) nights.set(str(s.id)!, { start, end });
  }
  for (const r of recoveries) {
    if (r.score_state !== 'SCORED') continue;
    const night = nights.get(str(r.sleep_id) ?? '');
    const at = night ? night.end - 60_000 : Date.parse(str(r.created_at) ?? '');
    if (!Number.isFinite(at)) continue;
    const score = obj(r.score);
    out.push(
      ...point('recoveryScore', at, num(score.recovery_score), WHOOP_SOURCE),
      ...point('restingHeartRate', at, num(score.resting_heart_rate), WHOOP_SOURCE),
      ...point('hrv', at, num(score.hrv_rmssd_milli), WHOOP_SOURCE, { method: 'rmssd' }),
      ...point('oxygenSaturation', at, num(score.spo2_percentage), WHOOP_SOURCE),
      ...point('skinTemperature', at, num(score.skin_temp_celsius), WHOOP_SOURCE, { unit: 'degC' }),
    );
  }
  return out;
}

/** Oura's sleeps, readiness, activity, heart rate and blood oxygen as samples. */
export function fromOura(input: { sleep: readonly Record<string, unknown>[]; readiness: readonly Record<string, unknown>[]; activity: readonly Record<string, unknown>[]; heartrate: readonly Record<string, unknown>[]; spo2: readonly Record<string, unknown>[] }): HealthSample[] {
  const out: HealthSample[] = [];
  for (const s of input.sleep) {
    if (!['long_sleep', 'sleep', 'late_nap'].includes(str(s.type) ?? '')) continue;
    const start = Date.parse(str(s.bedtime_start) ?? ''), end = Date.parse(str(s.bedtime_end) ?? '');
    if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) continue;
    const min = (k: string) => (num(s[k]) ?? 0) / 60;
    out.push(...stageBlocks(OURA_SOURCE, start, end, { latency: min('latency'), light: min('light_sleep_duration'), deep: min('deep_sleep_duration'), rem: min('rem_sleep_duration') }));
    if (s.type === 'late_nap') continue;
    const mid = start + (end - start) / 2;
    out.push(
      ...point('hrv', mid, num(s.average_hrv), OURA_SOURCE, { method: 'rmssd' }),
      ...point('respiratoryRate', mid, num(s.average_breath), OURA_SOURCE),
      ...point('restingHeartRate', end - 60_000, num(s.lowest_heart_rate), OURA_SOURCE),
      ...point('skinTemperatureDelta', mid, num(obj(s.readiness).temperature_deviation), OURA_SOURCE),
    );
  }
  for (const r of input.readiness) {
    const at = Date.parse(str(r.timestamp) ?? '');
    if (Number.isFinite(at)) out.push(...point('recoveryScore', at, num(r.score), OURA_SOURCE));
  }
  for (const a of input.activity) {
    const at = Date.parse(str(a.timestamp) ?? '');
    if (!Number.isFinite(at)) continue;
    out.push(...point('steps', at, num(a.steps), OURA_SOURCE), ...point('activeEnergy', at, num(a.active_calories), OURA_SOURCE, { unit: 'kcal' }));
  }
  for (const h of input.heartrate) {
    const at = Date.parse(str(h.timestamp) ?? '');
    if (Number.isFinite(at)) out.push(...point('heartRate', at, num(h.bpm), OURA_SOURCE));
  }
  // A daily average with no time: placed early on its morning in the phone's own zone (no offset), inside the night.
  for (const s of input.spo2) {
    const day = str(s.day), value = num(obj(s.spo2_percentage).average);
    if (day && value !== undefined) out.push({ type: 'oxygenSaturation', start: `${day}T05:00:00`, end: `${day}T05:00:00`, value, source: OURA_SOURCE });
  }
  return out;
}

const isoDay = (ms: number) => new Date(ms).toISOString().slice(0, 10);

async function readProvider(options: WearableOptions, provider: Provider, token: string, from: number, to: number): Promise<HealthSample[]> {
  if (provider === 'whoop') {
    const range = { start: new Date(from).toISOString(), end: new Date(to).toISOString(), limit: '25' };
    const [sleeps, recoveries] = await Promise.all([pages(options, `${WHOOP_API}/activity/sleep`, range, token, 'nextToken'), pages(options, `${WHOOP_API}/recovery`, range, token, 'nextToken')]);
    return fromWhoop(sleeps, recoveries);
  }
  // Oura's day ranges include the end date; the day before `from` brings in the night that ends inside the range.
  const days = { start_date: isoDay(from - 86_400_000), end_date: isoDay(to) };
  const [sleep, readiness, activity, heartrate, spo2] = await Promise.all([
    pages(options, `${OURA_API}/sleep`, days, token, 'next_token'),
    pages(options, `${OURA_API}/daily_readiness`, days, token, 'next_token'),
    pages(options, `${OURA_API}/daily_activity`, days, token, 'next_token'),
    pages(options, `${OURA_API}/heartrate`, { start_datetime: new Date(from).toISOString(), end_datetime: new Date(to).toISOString() }, token, 'next_token'),
    pages(options, `${OURA_API}/daily_spo2`, days, token, 'next_token'),
  ]);
  return fromOura({ sleep, readiness, activity, heartrate, spo2 });
}

/** Readings from every connected wearable between `from` and `to`. Nothing is stored. */
export async function wearableSamples(db: Db, options: WearableOptions, userId: string, from: number, to: number, now: number): Promise<{ samples: HealthSample[]; problems: Problem[] }> {
  const { connections } = await listConnections(db, options, userId);
  const samples: HealthSample[] = [], problems: Problem[] = [];
  for (const { provider } of connections) {
    if (!options.apps[provider]) { problems.push({ provider, problem: 'unavailable' }); continue; }
    try {
      const token = await accessToken(db, options, userId, provider, now);
      if (token === 'gone') continue;
      if (!token) { problems.push({ provider, problem: 'reconnect' }); continue; }
      samples.push(...(await readProvider(options, provider, token, from, to)).filter(s => { const at = Date.parse(s.start as string); return !Number.isFinite(at) || (at >= from - 86_400_000 && at <= to); }));
    } catch (error) {
      problems.push({ provider, problem: error instanceof Unauthorised ? 'reconnect' : 'unavailable' });
    }
  }
  return { samples, problems };
}

/** The page the browser lands on after connecting. Plain words, no scripts, nothing about the person. */
export function callbackPage(result: CallbackResult): Response {
  const name = result.ok ? SPECS[result.provider].name : null;
  const [title, words] = result.ok
    ? [`${name} is connected`, 'You can go back to life now. Your readings arrive the next time life opens.']
    : result.reason === 'declined'
      ? ['Not connected', 'Nothing was shared. You can try again from Devices in life.']
      : ['That didn’t work', 'The link had expired or was already used. Start again from Devices in life.'];
  const html = `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${title}</title>`
    + '<style>body{font-family:-apple-system,system-ui,sans-serif;margin:0;padding:48px 24px;background:#f6f4ef;color:#1b1b1a}h1{font-size:28px;font-weight:600;letter-spacing:-0.5px;margin:0 0 12px}p{font-size:17px;line-height:1.5;color:#55534f;margin:0}@media (prefers-color-scheme:dark){body{background:#121211;color:#f2f0ea}p{color:#b5b2aa}}</style>'
    + `</head><body><h1>${title}</h1><p>${words}</p></body></html>`;
  return new Response(html, { status: result.ok ? 200 : 400, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'" } });
}
