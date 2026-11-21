import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createApi } from '../../apps/api/src/app';
import { PAID_ROUTES, applyEvent, subscriptionState, verifySignature, type BillingOptions } from '../../apps/api/src/billing';
import { eq, getTableConfig } from '../../apps/api/src/db/kit';
import { subscriptions, users } from '../../apps/api/src/db/schema';
import { readEnv } from '../../apps/api/src/env';
import { adminUrl, freshDatabase, makeUser } from './support';

/**
 * Fix F-20, the server half. RevenueCat tells Life what changed in a subscription through a signed webhook; Life keeps
 * its own record and, once billing is live, opens the routes that cost money only to people in a trial or subscribed.
 */
const SECRET = 'whsec-a-test-signing-secret';
const DAY = 24 * 3600 * 1000;
const base = 'http://life.test';

async function sign(body: string, secret: string, atMs: number) {
  const t = Math.floor(atMs / 1000);
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${body}`)));
  return `t=${t},v1=${[...mac].map(b => b.toString(16).padStart(2, '0')).join('')}`;
}

const noDb = { db: null as never, withUser: async () => { throw new Error('no database here'); } };
const fakeAuth = { handler: async () => new Response(null, { status: 404 }), getPrincipal: async (r: Request) => { const id = /^Bearer (.+)$/.exec(r.headers.get('authorization') ?? '')?.[1]; return id ? { userId: id } : null; } };

describe('RevenueCat’s signature', () => {
  const now = Date.parse('2026-11-21T09:00:00Z');
  const body = JSON.stringify({ api_version: '1.0', event: { id: 'evt-test', type: 'TEST', event_timestamp_ms: now, app_user_id: 'someone', environment: 'PRODUCTION' } });

  test('a signature over the exact body, made in the last five minutes, is accepted', async () => {
    expect(await verifySignature(body, await sign(body, SECRET, now), SECRET, now)).toBe(true);
    expect(await verifySignature(body, await sign(body, SECRET, now - 290_000), SECRET, now)).toBe(true);
  });

  test('another secret, a changed body, an old signature or a missing one is refused', async () => {
    expect(await verifySignature(body, await sign(body, 'another-secret-entirely', now), SECRET, now)).toBe(false);
    expect(await verifySignature(body.replace('"TEST"', '"RENEWAL"'), await sign(body, SECRET, now), SECRET, now)).toBe(false);
    expect(await verifySignature(body, await sign(body, SECRET, now - 400_000), SECRET, now)).toBe(false);
    expect(await verifySignature(body, null, SECRET, now)).toBe(false);
    expect(await verifySignature(body, 'v1=abc', SECRET, now)).toBe(false);
  });

  test('the webhook is closed without a secret, and refuses a bad signature before reading the event', async () => {
    const post = (billing?: BillingOptions, signature?: string) => createApi({ db: noDb, auth: fakeAuth, billing, now: () => now })(new Request(`${base}/billing/revenuecat`, { method: 'POST', body, headers: signature ? { 'x-revenuecat-webhook-signature': signature } : {} }));
    expect((await post()).status).toBe(503);
    expect((await post({ webhookSecret: SECRET })).status).toBe(401);
    expect((await post({ webhookSecret: SECRET }, await sign(body, 'another-secret-entirely', now))).status).toBe(401);
    // A good signature on a test event never touches the database.
    expect(await (await post({ webhookSecret: SECRET }, await sign(body, SECRET, now))).json()).toEqual({ applied: false, reason: 'test' });
  });
});

describe('what needs a subscription', () => {
  test('only the routes that cost money; sync, export, deletion and the rest stay open', () => {
    expect([...PAID_ROUTES].sort()).toEqual(['GET /wearables/samples', 'POST /ai/run', 'POST /memory/search', 'POST /wearables/oura/connect', 'POST /wearables/whoop/connect']);
    for (const open of ['GET /sync/pull', 'POST /sync/push', 'GET /account/export', 'POST /account/delete', 'GET /memory', 'GET /billing/status', 'POST /wearables/whoop/disconnect']) expect(PAID_ROUTES.has(open)).toBe(false);
  });

  test('enforcement is off until it is switched on, and both servers read the settings', () => {
    const env = readEnv({ DATABASE_URL: 'postgres://x/y', BETTER_AUTH_SECRET: 'x'.repeat(32), BETTER_AUTH_URL: 'https://api.life.test', TOKEN_KEY: btoa('k'.repeat(32)) });
    expect([env.BILLING_ENFORCED, env.BILLING_SANDBOX, env.REVENUECAT_WEBHOOK_SECRET]).toEqual(['0', '0', undefined]);
    const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');
    expect(read('apps/api/src/handler.ts')).toContain('billing: billingFromEnv(env)');
    expect(read('apps/api/src/server.ts')).toContain('billing: billingFromEnv(env)');
    expect(read('apps/api/.env.example')).toContain('REVENUECAT_WEBHOOK_SECRET=');
  });

  test('the record keeps no price, currency, country, receipt or card', () => {
    expect(getTableConfig(subscriptions).columns.map(c => c.name).sort()).toEqual(['billing_issue', 'event_at', 'expires_at', 'period', 'product', 'renews', 'sandbox', 'store', 'updated_at', 'user_id']);
  });
});

describe.skipIf(!adminUrl)('subscriptions with Postgres', () => {
  let env: Awaited<ReturnType<typeof freshDatabase>>;
  const start = Date.parse('2026-11-21T09:00:00Z');
  let now = start;
  const options: BillingOptions = { webhookSecret: SECRET, sandbox: false };
  let n = 0;
  /** A RevenueCat event, as its webhook sends it. */
  const event = (userId: string, type: string, extra: Record<string, unknown> = {}) => ({
    api_version: '1.0',
    event: { id: `evt-${++n}`, type, event_timestamp_ms: now, app_user_id: userId, original_app_user_id: '$RCAnonymousID:1f2e', aliases: ['$RCAnonymousID:1f2e', userId], product_id: 'life_monthly', period_type: 'NORMAL', store: 'APP_STORE', environment: 'PRODUCTION', entitlement_ids: ['life'], price: 7.99, currency: 'GBP', country_code: 'GB', ...extra },
  });
  const state = (userId: string, o: BillingOptions = options) => subscriptionState(env.db, userId, now, o);

  beforeAll(async () => { env = await freshDatabase(); });
  afterAll(async () => { await env?.drop(); });

  test('a trial starts, turns into a paid month, and stays active', async () => {
    const ama = await makeUser(env.db, 'ama@example.com');
    expect((await state(ama)).status).toBe('none');
    expect(await applyEvent(env.db, event(ama, 'INITIAL_PURCHASE', { period_type: 'TRIAL', expiration_at_ms: now + 7 * DAY }), options, now)).toEqual({ applied: true });
    expect(await state(ama)).toEqual({ status: 'trial', active: true, renews: true, product: 'life_monthly', store: 'APP_STORE', expiresAt: new Date(start + 7 * DAY).toISOString(), sandbox: false });
    now += 7 * DAY;
    await applyEvent(env.db, event(ama, 'RENEWAL', { expiration_at_ms: now + 30 * DAY, is_trial_conversion: true }), options, now);
    expect(await state(ama)).toMatchObject({ status: 'active', active: true, renews: true });
  });

  test('turning off renewal keeps access to the end of the period, then it ends', async () => {
    now = start;
    const kofi = await makeUser(env.db, 'kofi@example.com');
    await applyEvent(env.db, event(kofi, 'INITIAL_PURCHASE', { expiration_at_ms: now + 30 * DAY }), options, now);
    now += DAY;
    await applyEvent(env.db, event(kofi, 'CANCELLATION', { cancel_reason: 'UNSUBSCRIBE', expiration_at_ms: start + 30 * DAY }), options, now);
    expect(await state(kofi)).toMatchObject({ status: 'active', active: true, renews: false });
    now = start + 30 * DAY + 1;
    await applyEvent(env.db, event(kofi, 'EXPIRATION', { expiration_reason: 'UNSUBSCRIBE', expiration_at_ms: start + 30 * DAY }), options, now);
    expect(await state(kofi)).toMatchObject({ status: 'ended', active: false, renews: false });
  });

  test('a refund ends access at once', async () => {
    now = start;
    const esi = await makeUser(env.db, 'esi@example.com');
    await applyEvent(env.db, event(esi, 'INITIAL_PURCHASE', { product_id: 'life_yearly', expiration_at_ms: now + 365 * DAY }), options, now);
    now += 3 * DAY;
    await applyEvent(env.db, event(esi, 'CANCELLATION', { product_id: 'life_yearly', cancel_reason: 'CUSTOMER_SUPPORT', expiration_at_ms: start + 365 * DAY }), options, now);
    expect(await state(esi)).toMatchObject({ status: 'ended', active: false, expiresAt: new Date(now).toISOString() });
  });

  test('a failed payment keeps access through the store’s grace period, and a renewal clears it', async () => {
    now = start;
    const yaw = await makeUser(env.db, 'yaw@example.com');
    await applyEvent(env.db, event(yaw, 'INITIAL_PURCHASE', { expiration_at_ms: now + 30 * DAY }), options, now);
    now = start + 30 * DAY;
    await applyEvent(env.db, event(yaw, 'BILLING_ISSUE', { expiration_at_ms: now, grace_period_expiration_at_ms: now + 16 * DAY }), options, now);
    expect(await state(yaw)).toMatchObject({ status: 'grace', active: true });
    now += 2 * DAY;
    await applyEvent(env.db, event(yaw, 'RENEWAL', { expiration_at_ms: start + 60 * DAY }), options, now);
    expect(await state(yaw)).toMatchObject({ status: 'active', active: true });
  });

  test('a late, older event can’t undo a newer one, and a retry changes nothing', async () => {
    now = start;
    const abena = await makeUser(env.db, 'abena@example.com');
    const purchase = event(abena, 'INITIAL_PURCHASE', { expiration_at_ms: now + 30 * DAY });
    now += DAY;
    const cancel = event(abena, 'CANCELLATION', { cancel_reason: 'UNSUBSCRIBE', expiration_at_ms: start + 30 * DAY });
    // The cancellation arrives first, then the purchase it followed: the older purchase can't turn renewal back on.
    expect(await applyEvent(env.db, cancel, options, now)).toEqual({ applied: true });
    expect(await applyEvent(env.db, purchase, options, now)).toEqual({ applied: false, reason: 'stale' });
    // RevenueCat retries with the same id and time; applying it again leaves the same record.
    expect(await applyEvent(env.db, cancel, options, now)).toEqual({ applied: true });
    expect(await state(abena)).toMatchObject({ active: true, renews: false });
  });

  test('sandbox purchases, other entitlements, anonymous ids, strangers and tests change nothing', async () => {
    now = start;
    const kwame = await makeUser(env.db, 'kwame@example.com');
    const grant = { expiration_at_ms: now + 30 * DAY };
    expect(await applyEvent(env.db, event(kwame, 'INITIAL_PURCHASE', { ...grant, environment: 'SANDBOX' }), options, now)).toEqual({ applied: false, reason: 'sandbox' });
    expect(await applyEvent(env.db, event(kwame, 'INITIAL_PURCHASE', { ...grant, entitlement_ids: ['something_else'] }), options, now)).toEqual({ applied: false, reason: 'other-entitlement' });
    expect(await applyEvent(env.db, event('$RCAnonymousID:9a8b', 'INITIAL_PURCHASE', { ...grant, aliases: ['$RCAnonymousID:9a8b'] }), options, now)).toEqual({ applied: false, reason: 'unknown-person' });
    expect(await applyEvent(env.db, event(crypto.randomUUID(), 'INITIAL_PURCHASE', grant), options, now)).toEqual({ applied: false, reason: 'unknown-person' });
    expect(await applyEvent(env.db, event(kwame, 'SUBSCRIBER_ALIAS'), options, now)).toEqual({ applied: false, reason: 'ignored-type' });
    expect(await applyEvent(env.db, { nonsense: true }, options, now)).toEqual({ applied: false, reason: 'unreadable' });
    expect((await state(kwame)).status).toBe('none');
    // A TestFlight build's server counts sandbox purchases when told to.
    expect(await applyEvent(env.db, event(kwame, 'INITIAL_PURCHASE', { ...grant, environment: 'SANDBOX' }), { ...options, sandbox: true }, now)).toEqual({ applied: true });
    expect((await state(kwame)).status).toBe('none');
    expect(await state(kwame, { ...options, sandbox: true })).toMatchObject({ status: 'active', sandbox: true });
  });

  test('a restore on another account moves the subscription there', async () => {
    now = start;
    const from = await makeUser(env.db, 'efua@example.com'), to = await makeUser(env.db, 'efua.work@example.com');
    await applyEvent(env.db, event(from, 'INITIAL_PURCHASE', { expiration_at_ms: now + 30 * DAY }), options, now);
    now += DAY;
    expect(await applyEvent(env.db, { api_version: '1.0', event: { id: 'evt-transfer', type: 'TRANSFER', event_timestamp_ms: now, transferred_from: [from], transferred_to: [to], store: 'APP_STORE', environment: 'PRODUCTION' } }, options, now)).toEqual({ applied: true });
    expect((await state(from)).status).toBe('none');
    expect(await state(to)).toMatchObject({ status: 'active', product: 'life_monthly' });
  });

  test('once enforced, AI needs a trial or subscription, while sync, export and deletion stay open', async () => {
    now = start;
    const api = (enforce: boolean) => createApi({ db: env.db, auth: fakeAuth, billing: { ...options, enforce }, now: () => now });
    const call = (enforce: boolean, userId: string, method: string, path: string, body?: unknown) => api(enforce)(new Request(`${base}${path}`, { method, headers: { authorization: `Bearer ${userId}`, 'content-type': 'application/json' }, body: body === undefined ? undefined : JSON.stringify(body) }));
    const nana = await makeUser(env.db, 'nana@example.com');
    expect((await call(true, nana, 'POST', '/ai/run', { job: 'ask', text: 'hello' })).status).toBe(402);
    expect(await (await call(true, nana, 'POST', '/ai/run', { job: 'ask', text: 'hello' })).json()).toEqual({ error: 'SUBSCRIPTION_REQUIRED' });
    expect((await call(true, nana, 'POST', '/memory/search', { query: 'rent' })).status).toBe(402);
    expect((await call(false, nana, 'POST', '/ai/run', { job: 'ask', text: 'hello' })).status).not.toBe(402);
    for (const [method, path] of [['GET', '/sync/pull'], ['GET', '/account/export'], ['GET', '/memory'], ['GET', '/billing/status']] as const) expect(`${path} ${(await call(true, nana, method, path)).status}`).toBe(`${path} 200`);
    await applyEvent(env.db, event(nana, 'INITIAL_PURCHASE', { period_type: 'TRIAL', expiration_at_ms: now + 7 * DAY }), options, now);
    expect((await call(true, nana, 'POST', '/ai/run', { job: 'ask', text: 'hello' })).status).not.toBe(402);
    expect(await (await call(true, nana, 'GET', '/billing/status')).json()).toMatchObject({ status: 'trial', active: true, enforced: true });
    const exported = await (await call(true, nana, 'GET', '/account/export')).json() as { subscription: Record<string, unknown> };
    expect(exported.subscription).toMatchObject({ product: 'life_monthly', period: 'TRIAL', store: 'APP_STORE', renews: true });
    now += 8 * DAY;
    expect((await call(true, nana, 'POST', '/ai/run', { job: 'ask', text: 'hello' })).status).toBe(402);
  });

  test('a signed webhook through the API applies the event', async () => {
    now = start;
    const adjoa = await makeUser(env.db, 'adjoa@example.com');
    const body = JSON.stringify(event(adjoa, 'INITIAL_PURCHASE', { period_type: 'TRIAL', expiration_at_ms: now + 7 * DAY }));
    const res = await createApi({ db: env.db, auth: fakeAuth, billing: options, now: () => now })(new Request(`${base}/billing/revenuecat`, { method: 'POST', body, headers: { 'content-type': 'application/json', 'x-revenuecat-webhook-signature': await sign(body, SECRET, now) } }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ applied: true });
    expect((await state(adjoa)).status).toBe('trial');
  });

  test('deleting the account deletes the subscription record', async () => {
    const gone = await makeUser(env.db, 'gone@example.com');
    await applyEvent(env.db, event(gone, 'INITIAL_PURCHASE', { expiration_at_ms: now + 30 * DAY }), options, now);
    await env.db.db.delete(users).where(eq(users.id, gone));
    expect(await env.db.db.select().from(subscriptions).where(eq(subscriptions.user_id, gone))).toEqual([]);
  });
});
