import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { createApi } from '../../apps/api/src/app';
import { createAuth } from '../../apps/api/src/auth';
import { eq, getTableConfig, sql } from '../../apps/api/src/db/kit';
import { accountClosures, devices, files, memory, oauthTokens, phoneTables, syncOps, users } from '../../apps/api/src/db/schema';
import { presign, s3Storage } from '../../apps/api/src/storage';
import { fakeBucket } from '../support/bucket';
import { adminUrl, freshDatabase } from './support';

/**
 * BUILD_V26 Phase 23: signed links to object storage, push tokens, and a person's data as one export or gone for good.
 * Storage is a stand-in that checks signatures and expiry the way S3 and R2 do (tests/support/bucket.ts).
 */
const base = 'http://life.test';
const config = { endpoint: 'https://files.life.test', bucket: 'life-files', region: 'auto', accessKeyId: 'test-key', secretAccessKey: 'test-secret' };
const MINUTE = 60_000, DAY = 24 * 60 * MINUTE;

describe('signed links', () => {
  test('match the presigned GET AWS documents', async () => {
    const url = await presign(
      { endpoint: 'https://s3.amazonaws.com', bucket: 'examplebucket', region: 'us-east-1', accessKeyId: 'AKIAIOSFODNN7EXAMPLE', secretAccessKey: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY' },
      { method: 'GET', key: 'test.txt', expiresIn: 86400, at: new Date('2013-05-24T00:00:00Z') },
    );
    expect(url).toBe('https://examplebucket.s3.amazonaws.com/test.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20130524T000000Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404');
  });

  test('work until they expire, then the store refuses them', async () => {
    let now = Date.parse('2026-11-20T09:00:00.000Z');
    const bucket = fakeBucket(config, () => now);
    const storage = s3Storage({ ...config, fetch: bucket.fetch }, () => now);
    const put = await storage.sign('PUT', 'tmp/u/one', { expiresIn: 300, contentType: 'image/jpeg' });
    expect((await bucket.fetch(put, { method: 'PUT', headers: { 'content-type': 'image/jpeg' }, body: 'jpeg' })).status).toBe(200);
    now += 5 * MINUTE + 1000;
    expect((await bucket.fetch(put, { method: 'PUT', headers: { 'content-type': 'image/jpeg' }, body: 'jpeg' })).status).toBe(403);
  });

  test('a changed link, or a file of another type, is refused', async () => {
    const now = Date.parse('2026-11-20T09:00:00.000Z');
    const bucket = fakeBucket(config, () => now);
    const storage = s3Storage({ ...config, fetch: bucket.fetch }, () => now);
    const put = await storage.sign('PUT', 'tmp/u/one', { expiresIn: 300, contentType: 'image/jpeg' });
    expect((await bucket.fetch(put, { method: 'PUT', headers: { 'content-type': 'text/html' }, body: '<script>' })).status).toBe(403);
    expect((await bucket.fetch(put.replace('tmp/u/one', 'keep/u/one'), { method: 'PUT', headers: { 'content-type': 'image/jpeg' }, body: 'jpeg' })).status).toBe(403);
    expect((await bucket.fetch(put.replace('X-Amz-Expires=300', 'X-Amz-Expires=99999'), { method: 'PUT', headers: { 'content-type': 'image/jpeg' }, body: 'jpeg' })).status).toBe(403);
    expect(bucket.objects.size).toBe(0);
  });

  test('without storage set up, file routes say so instead of failing', async () => {
    const api = createApi({ db: { db: null as never, withUser: async () => { throw new Error('no database here'); } }, auth: { handler: async () => new Response(null, { status: 404 }), getPrincipal: async () => ({ userId: 'u' }) } });
    const res = await api(new Request(`${base}/files/sign`, { method: 'POST', body: JSON.stringify({ action: 'upload', kind: 'letter', contentType: 'image/jpeg' }) }));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: 'STORAGE_NOT_CONFIGURED' });
  });

  test('the jobs route needs its own secret, and is closed when none is set', async () => {
    const make = (jobsSecret?: string) => createApi({ db: { db: null as never, withUser: async () => { throw new Error('no database here'); } }, auth: { handler: async () => new Response(null, { status: 404 }), getPrincipal: async () => ({ userId: 'u' }) }, jobsSecret });
    const sweep = (api: ReturnType<typeof make>, token?: string) => api(new Request(`${base}/jobs/sweep`, { method: 'POST', headers: token ? { authorization: `Bearer ${token}` } : {} }));
    expect((await sweep(make())).status).toBe(401);
    expect((await sweep(make(), 'anything')).status).toBe(401);
    expect((await sweep(make('s'.repeat(40)), 'wrong')).status).toBe(401);
  });
});

describe.skipIf(!adminUrl)('files, push and your data through the API', () => {
  let env: Awaited<ReturnType<typeof freshDatabase>>;
  let now = Date.parse('2026-11-20T09:00:00.000Z');
  const clock = () => now;
  const bucket = fakeBucket(config, clock);
  const storage = s3Storage({ ...config, fetch: bucket.fetch }, clock);
  const codes = new Map<string, string>();
  const JOBS = 'a-jobs-secret-only-the-host-cron-knows';
  let api: (request: Request) => Promise<Response>;
  let instant: (request: Request) => Promise<Response>;

  beforeAll(async () => {
    env = await freshDatabase();
    const auth = createAuth({ db: env.db.db, secret: 'test-secret-that-is-long-enough-for-better-auth', baseURL: base, sendCode: async (email, code) => { codes.set(email, code); } });
    api = createApi({ db: env.db, auth, now: clock, storage, jobsSecret: JOBS });
    instant = createApi({ db: env.db, auth, now: clock, storage, graceDays: 0 });
  });
  afterAll(async () => { await env?.drop(); });

  const call = (path: string, init: { token?: string; body?: unknown; method?: string; via?: typeof api } = {}) => (init.via ?? api)(new Request(`${base}${path}`, {
    method: init.method ?? (init.body === undefined ? 'GET' : 'POST'),
    headers: { 'content-type': 'application/json', ...(init.token ? { authorization: `Bearer ${init.token}` } : {}) },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  }));
  async function signIn(email: string) {
    expect((await call('/auth/email-otp/send-verification-otp', { body: { email, type: 'sign-in' } })).status).toBe(200);
    const res = await call('/auth/sign-in/email-otp', { body: { email, otp: codes.get(email) } });
    expect(res.status).toBe(200);
    const token = res.headers.get('set-auth-token')!;
    const me = await call('/me', { token });
    return { token, userId: ((await me.json()) as { userId: string }).userId };
  }
  async function upload(token: string, extra: Record<string, unknown> = {}) {
    const res = await call('/files/sign', { token, body: { action: 'upload', kind: 'letter', contentType: 'image/jpeg', ...extra } });
    expect(res.status).toBe(201);
    const signed = await res.json() as { id: string; url: string; method: string; headers: Record<string, string>; expiresAt: string };
    expect((await bucket.fetch(signed.url, { method: signed.method, headers: signed.headers, body: 'a scanned letter' })).status).toBe(200);
    return signed;
  }
  const keysOf = (userId: string) => [...bucket.objects.keys()].filter(k => k.includes(userId));
  /** One row in every phone table, written as that person (row-level security on). */
  async function fillEveryTable(userId: string) {
    const at = new Date(now).toISOString(), ids: Record<string, string> = {};
    for (const [name, table] of Object.entries(phoneTables)) {
      const id = crypto.randomUUID();
      const required = Object.fromEntries(getTableConfig(table).columns.filter(c => c.notNull && !['id', 'user_id', 'created_at', 'updated_at'].includes(c.name)).map(c => [c.name, 'x']));
      await env.db.withUser(userId, tx => tx.insert(table).values({ id, user_id: userId, created_at: at, updated_at: at, ...required } as never));
      ids[name] = id;
    }
    return ids;
  }
  const rowsFor = async (userId: string) => {
    const counts: Record<string, number> = {};
    for (const [name, table] of Object.entries({ ...phoneTables, devices, files, sync_ops: syncOps, oauth_tokens: oauthTokens })) {
      counts[name] = (await env.db.withUser(userId, tx => tx.select({ n: sql<number>`count(*)::int` }).from(table)))[0].n;
    }
    return counts;
  };

  test('signed URLs expire', async () => {
    const { token } = await signIn('ama@example.com');
    const res = await call('/files/sign', { token, body: { action: 'upload', kind: 'meal_photo', contentType: 'image/jpeg' } });
    const signed = await res.json() as { id: string; url: string; method: string; headers: Record<string, string>; expiresAt: string };
    expect(Date.parse(signed.expiresAt) - now).toBe(5 * MINUTE);
    expect(signed.headers).toEqual({ 'content-type': 'image/jpeg' });
    now += 5 * MINUTE + 1000;
    expect((await bucket.fetch(signed.url, { method: 'PUT', headers: signed.headers, body: 'too late' })).status).toBe(403);

    const kept = await upload(token, { keep: true });
    const read = await (await call('/files/sign', { token, body: { action: 'read', id: kept.id } })).json() as { url: string; expiresAt: string };
    expect(await (await bucket.fetch(read.url)).text()).toBe('a scanned letter');
    now += 5 * MINUTE + 1000;
    expect((await bucket.fetch(read.url)).status).toBe(403);
  });

  test('a user can’t sign another user’s file', async () => {
    const ama = await signIn('ama@example.com'), kofi = await signIn('kofi@example.com');
    const letter = await upload(ama.token, { keep: true });
    for (const body of [{ action: 'read', id: letter.id }]) expect((await call('/files/sign', { token: kofi.token, body })).status).toBe(404);
    expect((await call('/files/delete', { token: kofi.token, body: { id: letter.id } })).status).toBe(404);
    expect(bucket.objects.has(`keep/${ama.userId}/${letter.id}`)).toBe(true);
    // Where a file goes is decided by the server: a key or owner in the request is ignored.
    const mine = await upload(kofi.token, { key: `keep/${ama.userId}/${letter.id}`, user_id: ama.userId });
    expect(bucket.objects.has(`tmp/${kofi.userId}/${mine.id}`)).toBe(true);
    expect((await call('/files/sign', { token: ama.token, body: { action: 'read', id: letter.id } })).status).toBe(200);
  });

  test('a letter is deleted after reading unless it is kept', async () => {
    const { token, userId } = await signIn('esi@example.com');
    const read = await upload(token);
    const row = (await env.db.withUser(userId, tx => tx.select().from(files).where(eq(files.id, read.id))))[0];
    expect(row.keep).toBe(false);
    expect(row.delete_after?.getTime()).toBe(now + DAY);
    expect((await call('/files/delete', { token, body: { id: read.id } })).status).toBe(200);
    expect(bucket.objects.has(`tmp/${userId}/${read.id}`)).toBe(false);
    expect(await env.db.withUser(userId, tx => tx.select().from(files).where(eq(files.id, read.id)))).toEqual([]);

    const kept = await upload(token, { keep: true });
    expect((await env.db.withUser(userId, tx => tx.select().from(files).where(eq(files.id, kept.id))))[0].delete_after).toBeNull();
    // A temporary file nobody came back for is gone a day later, the next time this person uses files.
    const forgotten = await upload(token);
    now += DAY + MINUTE;
    await upload(token);
    expect(bucket.objects.has(`tmp/${userId}/${forgotten.id}`)).toBe(false);
    expect(bucket.objects.has(`keep/${userId}/${kept.id}`)).toBe(true);
    expect(await env.db.withUser(userId, tx => tx.select().from(files).where(eq(files.id, forgotten.id)))).toEqual([]);
  });

  test('push tokens attach only to your own phones', async () => {
    const ama = await signIn('ama@example.com'), kofi = await signIn('kofi@example.com');
    const phone = crypto.randomUUID();
    expect((await call('/devices', { token: ama.token, body: { id: phone, platform: 'ios' } })).status).toBe(201);
    expect((await call('/push/register', { token: ama.token, body: { device: phone, token: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]' } })).status).toBe(200);
    const stored = async () => (await env.db.withUser(ama.userId, tx => tx.select().from(devices).where(eq(devices.id, phone))))[0].push_token;
    expect(await stored()).toBe('ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]');
    expect((await call('/push/register', { token: kofi.token, body: { device: phone, token: 'ExponentPushToken[kofikofikofi]' } })).status).toBe(404);
    expect((await call('/push/register', { token: ama.token, body: { device: phone, token: 'not a push token' } })).status).toBe(400);
    expect(await stored()).toBe('ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]');
    expect((await call('/push/register', { token: ama.token, body: { device: phone, token: null } })).status).toBe(200);
    expect(await stored()).toBeNull();
  });

  test('export contains every table’s rows for that user only', async () => {
    const ama = await signIn('ama@example.com'), kofi = await signIn('kofi@example.com');
    const amas = await fillEveryTable(ama.userId), kofis = await fillEveryTable(kofi.userId);
    await env.db.withUser(ama.userId, tx => tx.insert(oauthTokens).values({ id: crypto.randomUUID(), user_id: ama.userId, provider: 'whoop', access_token: 'sealed-access-token', refresh_token: 'sealed-refresh-token', scope: 'read:recovery' }));
    const res = await call('/account/export', { token: ama.token });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-disposition')).toContain('attachment');
    const text = await res.text(), body = JSON.parse(text) as { format: string; account: { id: string; email: string }; tables: Record<string, { id: string }[]>; connections: { provider: string }[]; files: unknown[]; devices: unknown[] };
    expect(body.format).toBe('life-export');
    expect(body.account).toMatchObject({ id: ama.userId, email: 'ama@example.com' });
    expect(Object.keys(body.tables).sort()).toEqual(Object.keys(phoneTables).sort());
    for (const name of Object.keys(phoneTables)) expect(body.tables[name].map(r => r.id)).toContain(amas[name]);
    for (const id of [kofi.userId, ...Object.values(kofis)]) expect(text).not.toContain(id);
    expect(body.connections).toEqual([expect.objectContaining({ provider: 'whoop' })]);
    expect(text).not.toContain('sealed-access-token');
    expect(text).not.toContain('sealed-refresh-token');
    expect(body.files.length).toBeGreaterThan(0);
    expect(body.devices.length).toBeGreaterThan(0);
  });

  test('each file still kept comes with a download link in the export, for 7 days or until it goes (F-44)', async () => {
    const { token } = await signIn('ama@example.com');
    const kept = await upload(token, { keep: true }), passing = await upload(token);
    type Listed = { id: string; download: string | null; downloadUntil: string | null; key?: unknown };
    const exported = async () => (await (await call('/account/export', { token })).json() as { files: Listed[]; about: string });
    const body = await exported();
    const mine = (id: string) => body.files.find(f => f.id === id)!;
    expect(await (await bucket.fetch(mine(kept.id).download!)).text()).toBe('a scanned letter');
    expect(Date.parse(mine(kept.id).downloadUntil!) - now).toBe(7 * DAY);
    // A file that goes after a day has a link that ends when it does.
    expect(Date.parse(mine(passing.id).downloadUntil!) - now).toBeLessThanOrEqual(DAY);
    expect(await (await bucket.fetch(mine(passing.id).download!)).text()).toBe('a scanned letter');
    // Storage keys stay on the server, and the note says how the links work.
    expect(body.files.every(f => f.key === undefined)).toBe(true);
    expect(body.about).toContain('download link');
    // After 7 days the link no longer works; exporting again gives a new one.
    now += 7 * DAY + MINUTE;
    expect((await bucket.fetch(mine(kept.id).download!)).status).toBe(403);
    const again = (await exported()).files.find(f => f.id === kept.id)!;
    expect(await (await bucket.fetch(again.download!)).text()).toBe('a scanned letter');
    // A file past its time has no link.
    expect((await exported()).files.find(f => f.id === passing.id)?.download ?? null).toBeNull();
  });

  test('delete removes rows, files and memories, and the session ends', async () => {
    const yaw = await signIn('yaw@example.com'), second = await signIn('yaw@example.com'), kofi = await signIn('kofi@example.com');
    await fillEveryTable(yaw.userId);
    await env.db.withUser(yaw.userId, tx => tx.insert(memory).values({ id: crypto.randomUUID(), user_id: yaw.userId, created_at: new Date(now).toISOString(), updated_at: new Date(now).toISOString(), text: 'Low iron in March' }));
    await call('/devices', { token: yaw.token, body: { id: crypto.randomUUID(), platform: 'android' } });
    await upload(yaw.token, { keep: true }); await upload(yaw.token);
    expect(keysOf(yaw.userId)).toHaveLength(2);
    const kofiBefore = await rowsFor(kofi.userId);

    expect((await call('/account/delete', { token: yaw.token, body: {} })).status).toBe(400);
    const closed = await call('/account/delete', { token: yaw.token, body: { confirm: 'DELETE' } });
    expect(closed.status).toBe(200);
    expect(await closed.json()).toEqual({ closed: true, deleteAfter: new Date(now + 30 * DAY).toISOString() });
    // Every session ends at once, on every phone.
    expect((await call('/me', { token: yaw.token })).status).toBe(401);
    expect((await call('/me', { token: second.token })).status).toBe(401);

    // After the grace period the account and everything in it go for good.
    now += 30 * DAY + MINUTE;
    const swept = await call('/jobs/sweep', { method: 'POST', token: JOBS });
    expect(swept.status).toBe(200);
    expect(await swept.json()).toMatchObject({ purged: 1 });
    expect(Object.values(await rowsFor(yaw.userId)).every(n => n === 0)).toBe(true);
    expect(await env.db.withUser(yaw.userId, tx => tx.select().from(memory))).toEqual([]);
    expect(await env.db.db.select().from(users).where(eq(users.id, yaw.userId))).toEqual([]);
    expect(await env.db.db.select().from(accountClosures)).toEqual([]);
    expect(keysOf(yaw.userId)).toEqual([]);
    // Nobody else lost anything.
    expect(await rowsFor(kofi.userId)).toEqual(kofiBefore);
    expect((await call('/me', { token: kofi.token })).status).toBe(200);
  });

  test('signing in again within 30 days keeps the account', async () => {
    const abena = await signIn('abena@example.com');
    const ids = await fillEveryTable(abena.userId);
    expect((await call('/account/delete', { token: abena.token, body: { confirm: 'DELETE' } })).status).toBe(200);
    now += 10 * DAY;
    const back = await signIn('abena@example.com');
    expect(back.userId).toBe(abena.userId);
    now += 25 * DAY;
    expect(await (await call('/jobs/sweep', { method: 'POST', token: JOBS })).json()).toMatchObject({ purged: 0 });
    const body = await (await call('/account/export', { token: back.token })).json() as { tables: Record<string, { id: string }[]> };
    expect(body.tables.record.map(r => r.id)).toContain(ids.record);
  });

  test('with no grace period set, delete is immediate', async () => {
    const adjoa = await signIn('adjoa@example.com');
    await fillEveryTable(adjoa.userId);
    await upload(adjoa.token, { keep: true });
    expect((await call('/account/delete', { via: instant, token: adjoa.token, body: { confirm: 'DELETE' } })).status).toBe(200);
    expect(Object.values(await rowsFor(adjoa.userId)).every(n => n === 0)).toBe(true);
    expect(await env.db.db.select().from(users).where(eq(users.id, adjoa.userId))).toEqual([]);
    expect(keysOf(adjoa.userId)).toEqual([]);
    expect((await call('/me', { token: adjoa.token })).status).toBe(401);
  });
});
