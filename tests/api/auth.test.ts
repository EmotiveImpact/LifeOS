import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { createApi } from '../../apps/api/src/app';
import { createAuth } from '../../apps/api/src/auth';
import { devices } from '../../apps/api/src/db/schema';
import { adminUrl, freshDatabase, makeUser } from './support';

const base = 'http://life.test';
/** Stand-ins for Apple's and Google's ID tokens: "<provider>:<subject>:<email>". Production verifies real ones with the providers' keys. */
const fakeIdToken = (provider: 'apple' | 'google') => ({
  clientId: `life-${provider}-test`,
  verifyIdToken: async (token: string) => token.startsWith(`${provider}:`),
  getUserInfo: async (tokens: { idToken?: string }) => {
    const [, sub, email] = (tokens.idToken ?? '').split(':');
    return sub && email ? { user: { id: sub, email, name: 'Ama', emailVerified: true }, data: { sub, email } } : null;
  },
});

describe('the API without a database', () => {
  const api = createApi({
    db: { db: null as never, withUser: async () => { throw new Error('no database here'); } },
    auth: { handler: async () => new Response('auth', { status: 200 }), getPrincipal: async () => null },
    now: () => Date.parse('2026-11-20T09:00:00.000Z'),
  });

  test('GET /health returns ok without auth', async () => {
    const res = await api(new Request(`${base}/health`));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, at: '2026-11-20T09:00:00.000Z' });
  });

  test('every other route returns 401 without a session, known or not', async () => {
    for (const [method, path] of [['GET', '/me'], ['POST', '/devices'], ['GET', '/sync/pull'], ['GET', '/nothing-here'], ['DELETE', '/account']]) {
      const res = await api(new Request(`${base}${path}`, { method }));
      expect(`${method} ${path} ${res.status}`).toBe(`${method} ${path} 401`);
      expect(await res.json()).toEqual({ error: 'UNAUTHENTICATED' });
    }
  });

  test('a made-up bearer token is no session', async () => {
    const res = await api(new Request(`${base}/me`, { headers: { authorization: 'Bearer not-a-session' } }));
    expect(res.status).toBe(401);
  });
});

describe('browsers', () => {
  const api = createApi({
    db: { db: null as never, withUser: async () => { throw new Error('no database here'); } },
    auth: { handler: async () => new Response('{}', { status: 200, headers: { 'set-auth-token': 't' } }), getPrincipal: async () => null },
    corsOrigins: ['https://web.life.test'],
  });

  test('a trusted origin may call, and read its session token', async () => {
    const preflight = await api(new Request(`${base}/auth/sign-in/email-otp`, { method: 'OPTIONS', headers: { origin: 'https://web.life.test', 'access-control-request-method': 'POST' } }));
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get('access-control-allow-origin')).toBe('https://web.life.test');
    expect(preflight.headers.get('access-control-allow-headers')).toContain('authorization');
    expect(preflight.headers.get('access-control-allow-credentials')).toBeNull();
    const res = await api(new Request(`${base}/auth/sign-in/email-otp`, { method: 'POST', headers: { origin: 'https://web.life.test' } }));
    expect(res.headers.get('access-control-allow-origin')).toBe('https://web.life.test');
    expect(res.headers.get('access-control-expose-headers')).toBe('set-auth-token, life-model, life-tier, x-retry-after');
  });

  test('any other origin gets no CORS headers, and still no data without a session', async () => {
    const preflight = await api(new Request(`${base}/me`, { method: 'OPTIONS', headers: { origin: 'https://evil.test' } }));
    expect(preflight.headers.get('access-control-allow-origin')).toBeNull();
    const res = await api(new Request(`${base}/me`, { headers: { origin: 'https://evil.test' } }));
    expect(res.status).toBe(401);
    expect(res.headers.get('access-control-allow-origin')).toBeNull();
  });
});

describe.skipIf(!adminUrl)('sign-in with Better Auth', () => {
  let env: Awaited<ReturnType<typeof freshDatabase>>;
  let api: (request: Request) => Promise<Response>;
  const codes = new Map<string, string>();
  const post = (path: string, body: unknown, token?: string) => api(new Request(`${base}${path}`, {
    method: 'POST', body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', origin: 'life://', ...(token ? { authorization: `Bearer ${token}` } : {}) },
  }));
  const me = async (token: string) => { const res = await api(new Request(`${base}/me`, { headers: { authorization: `Bearer ${token}` } })); return { status: res.status, body: await res.json() as { userId?: string } }; };
  const tokenOf = async (res: Response) => { expect(res.status).toBe(200); const token = res.headers.get('set-auth-token'); expect(token).toBeTruthy(); return token!; };

  beforeAll(async () => {
    env = await freshDatabase();
    const auth = createAuth({
      db: env.db.db, secret: 'a-test-secret-that-is-at-least-32-characters-long', baseURL: base,
      sendCode: async (email, code) => { codes.set(email, code); },
      apple: fakeIdToken('apple'), google: fakeIdToken('google'),
    });
    api = createApi({ db: env.db, auth });
  });
  afterAll(async () => { await env?.drop(); });

  const emailSignIn = async (email: string) => {
    expect((await post('/auth/email-otp/send-verification-otp', { email, type: 'sign-in' })).status).toBe(200);
    expect(codes.get(email)).toMatch(/^\d{6}$/);
    return tokenOf(await post('/auth/sign-in/email-otp', { email, otp: codes.get(email) }));
  };

  test('a wrong code signs nobody in', async () => {
    await post('/auth/email-otp/send-verification-otp', { email: 'kofi@example.com', type: 'sign-in' });
    const wrong = codes.get('kofi@example.com') === '000000' ? '111111' : '000000';
    const res = await post('/auth/sign-in/email-otp', { email: 'kofi@example.com', otp: wrong });
    expect(res.status).not.toBe(200);
    expect(res.headers.get('set-auth-token')).toBeNull();
  });

  test('a session from Apple, Google or email sign-in resolves to one userId', async () => {
    const byEmail = await me(await emailSignIn('ama@example.com'));
    expect(byEmail.status).toBe(200);
    expect(byEmail.body.userId).toBeTruthy();
    const byApple = await me(await tokenOf(await post('/auth/sign-in/social', { provider: 'apple', idToken: { token: 'apple:001234.apple:ama@example.com' } })));
    const byGoogle = await me(await tokenOf(await post('/auth/sign-in/social', { provider: 'google', idToken: { token: 'google:1098:ama@example.com' } })));
    expect(byApple.body.userId).toBe(byEmail.body.userId!);
    expect(byGoogle.body.userId).toBe(byEmail.body.userId!);
  });

  test('a forged Apple token is refused', async () => {
    const res = await post('/auth/sign-in/social', { provider: 'apple', idToken: { token: 'google:999:ama@example.com' } });
    expect(res.status).not.toBe(200);
  });

  test('a request body carrying user_id is ignored', async () => {
    const token = await emailSignIn('esi@example.com');
    const esi = (await me(token)).body.userId!;
    const someoneElse = await makeUser(env.db, 'someone@example.com');
    const id = crypto.randomUUID();
    const res = await post('/devices', { id, platform: 'ios', name: 'Esi’s iPhone', user_id: someoneElse, userId: someoneElse }, token);
    expect(res.status).toBe(201);
    const mine = await env.db.withUser(esi, tx => tx.select().from(devices));
    expect(mine.map(d => d.id)).toEqual([id]);
    expect(await env.db.withUser(someoneElse, tx => tx.select().from(devices))).toEqual([]);
  });

  test('a device id that belongs to someone else is refused, not taken over', async () => {
    const first = await emailSignIn('yaw@example.com'), second = await emailSignIn('abena@example.com');
    const id = crypto.randomUUID();
    expect((await post('/devices', { id, platform: 'android' }, first)).status).toBe(201);
    expect((await post('/devices', { id, platform: 'ios' }, second)).status).toBe(403);
  });

  test('the phone signs in the way React Native sends it: no Origin header, token in set-auth-token', async () => {
    const phone = (path: string, body: unknown) => api(new Request(`${base}${path}`, { method: 'POST', body: JSON.stringify(body), headers: { 'content-type': 'application/json' } }));
    expect((await phone('/auth/email-otp/send-verification-otp', { email: 'adjoa@example.com', type: 'sign-in' })).status).toBe(200);
    const res = await phone('/auth/sign-in/email-otp', { email: 'adjoa@example.com', otp: codes.get('adjoa@example.com') });
    const token = await tokenOf(res);
    const body = await res.json() as { user?: { id?: string; email?: string } };
    expect(body.user?.email).toBe('adjoa@example.com');
    expect((await me(token)).body.userId).toBe(body.user!.id!);
  });

  test('signing out ends the session', async () => {
    const token = await emailSignIn('kwame@example.com');
    expect((await me(token)).status).toBe(200);
    expect((await post('/auth/sign-out', {}, token)).status).toBe(200);
    expect((await me(token)).status).toBe(401);
  });
});
