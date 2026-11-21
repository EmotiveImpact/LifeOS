import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { createApi } from '../../apps/api/src/app';
import { createAuth } from '../../apps/api/src/auth';
import { sql } from '../../apps/api/src/db/kit';
import { consume, pruneLimits, signInLimits, type SignInAlert } from '../../apps/api/src/limits';
import { adminUrl, freshDatabase } from './support';

/**
 * Fix F-11 (DPIA risk 13): limits on sign-in codes per email address and per network address, limits on guesses,
 * and an alert on many failed codes. The counts live in Postgres, so every server instance shares them.
 */
const base = 'http://life.test';
const SECRET = 'a-test-secret-that-is-at-least-32-characters-long';
const MINUTE = 60_000, HOUR = 60 * MINUTE;

describe('sign-in limits in the source', () => {
  const read = (path: string) => readFileSync(new URL(`../../${path}`, import.meta.url), 'utf8');

  test('production and the local server turn the limits on', () => {
    expect(read('apps/api/src/handler.ts')).toContain('limits: {},');
    expect(read('apps/api/src/server.ts')).toContain('limits: {},');
  });

  test('the daily sweep clears old counters', () => {
    expect(read('apps/api/src/app.ts')).toContain('pruneLimits(db.db, now())');
  });

  test('the phone tells a long hold apart from a short one', () => {
    const account = read('apps/mobile/src/services/account.ts');
    expect(account).toContain("response.status === 429 && Number(response.headers.get('x-retry-after') ?? 0) > 120) return 'held'");
    expect(account).toContain('Try again in an hour.');
  });

  test('the limits are the ones the notes give', () => {
    expect(signInLimits).toEqual({
      codesPerAddress: { window: 3600, max: 5 },
      codesPerNetwork: { window: 3600, max: 30 },
      guessesPerAddress: { window: 3600, max: 10 },
      failedEverywhere: { window: 600, max: 25 },
      failedForAddress: { window: 3600, max: 6 },
    });
  });
});

describe.skipIf(!adminUrl)('sign-in limits with Postgres', () => {
  let env: Awaited<ReturnType<typeof freshDatabase>>;
  let now = Date.parse('2026-11-21T09:00:00.000Z');
  const clock = () => now;
  const alerts: SignInAlert[] = [];
  const codes = new Map<string, string>();
  let api: (request: Request) => Promise<Response>;
  let second: (request: Request) => Promise<Response>;

  const make = () => createApi({ db: env.db, auth: createAuth({ db: env.db.db, secret: SECRET, baseURL: base, sendCode: async (email, code) => { codes.set(email, code); }, limits: { now: clock, alert: a => alerts.push(a) } }) });
  const post = (path: string, body: unknown, ip: string, via = api) => via(new Request(`${base}${path}`, {
    method: 'POST', body: JSON.stringify(body),
    headers: { 'content-type': 'application/json', origin: 'life://', 'x-forwarded-for': ip },
  }));
  const send = (email: string, ip: string, via = api) => post('/auth/email-otp/send-verification-otp', { email, type: 'sign-in' }, ip, via);
  const guess = (email: string, otp: string, ip: string) => post('/auth/sign-in/email-otp', { email, otp }, ip);
  const wrong = (email: string) => codes.get(email) === '000000' ? '111111' : '000000';

  beforeAll(async () => {
    env = await freshDatabase();
    api = make();
    second = make();
  });
  afterAll(async () => { await env?.drop(); });

  test('an address gets five codes an hour, then a pause it can read, then five more', async () => {
    const email = 'ama@example.com';
    for (let i = 0; i < 5; i++) {
      expect((await send(email, `198.51.100.${10 + i}`)).status).toBe(200);
      now += MINUTE;
    }
    const held = await send(email, '198.51.100.20');
    expect(held.status).toBe(429);
    expect(Number(held.headers.get('x-retry-after'))).toBeGreaterThan(120);
    expect(((await held.json()) as { code?: string }).code).toBe('TOO_MANY_CODES');
    now += HOUR;
    expect((await send(email, '198.51.100.21')).status).toBe(200);
  });

  test('a network address gets thirty codes an hour, across addresses', async () => {
    now += 2 * HOUR;
    const ip = '203.0.113.7';
    for (let i = 0; i < 30; i++) {
      expect(`${i} ${(await send(`person${i}@example.com`, ip)).status}`).toBe(`${i} 200`);
      now += 21_000; // under Better Auth's own burst limit of three a minute
    }
    expect((await send('person30@example.com', ip)).status).toBe(429);
    expect((await send('person30@example.com', '203.0.113.8')).status).toBe(200);
  });

  test('every server shares the counts, because they live in Postgres', async () => {
    now += 2 * HOUR;
    const email = 'kofi@example.com';
    for (let i = 0; i < 3; i++) { expect((await send(email, `192.0.2.${i + 1}`)).status).toBe(200); now += MINUTE; }
    for (let i = 0; i < 2; i++) { expect((await send(email, `192.0.2.${i + 11}`, second)).status).toBe(200); now += MINUTE; }
    expect((await send(email, '192.0.2.21', second)).status).toBe(429);
  });

  test('an address can try ten codes an hour, and six failures write one alert for it', async () => {
    now += 2 * HOUR;
    alerts.length = 0;
    const email = 'esi@example.com';
    expect((await send(email, '198.51.100.40')).status).toBe(200);
    for (let i = 0; i < 10; i++) {
      const res = await guess(email, wrong(email), `198.51.100.${41 + i}`);
      expect([400, 403]).toContain(res.status);
      now += MINUTE;
    }
    const held = await guess(email, codes.get(email)!, '198.51.100.60');
    expect(held.status).toBe(429);
    expect(held.headers.get('set-auth-token')).toBeNull();
    expect(alerts).toEqual([{ kind: 'failed-codes', scope: 'address', count: 6, minutes: 60, who: expect.stringMatching(/^[0-9a-f]{8}$/) }]);
  });

  test('a code that works still signs in under the limits', async () => {
    now += 2 * HOUR;
    const email = 'yaw@example.com';
    expect((await send(email, '198.51.100.70')).status).toBe(200);
    const res = await guess(email, codes.get(email)!, '198.51.100.71');
    expect(res.status).toBe(200);
    expect(res.headers.get('set-auth-token')).toBeTruthy();
  });

  test('25 failed codes in ten minutes, across addresses, write one alert', async () => {
    now += 2 * HOUR;
    alerts.length = 0;
    for (let i = 0; i < 30; i++) {
      const res = await guess(`stranger${i}@example.com`, '123456', `10.1.0.${i + 1}`);
      expect(res.status).not.toBe(200);
      now += 10_000;
    }
    expect(alerts).toEqual([{ kind: 'failed-codes', scope: 'everywhere', count: 25, minutes: 10 }]);
  });

  test('the counters hold no email or network address', async () => {
    const rows = await env.db.db.execute(sql`select key from auth_limits`);
    const keys = ((Array.isArray(rows) ? rows : (rows as { rows: unknown[] }).rows) as { key: string }[]).map(r => r.key);
    expect(keys.length).toBeGreaterThan(10);
    for (const key of keys) {
      expect(key).toMatch(/^[a-z-]+:[0-9a-f]{32}$/);
      expect(key).not.toContain('@');
      expect(key).not.toContain('198.51.100');
    }
  });

  test('requests that arrive together can’t slip past the limit', async () => {
    const results = await Promise.all(Array.from({ length: 12 }, () => consume(env.db.db, 'test:together', { window: 3600, max: 5 }, now)));
    expect(results.filter(r => r.allowed)).toHaveLength(5);
  });

  test('the sweep deletes counters from more than a day ago, and keeps today’s', async () => {
    await consume(env.db.db, 'test:old', { window: 60, max: 1 }, now - 3 * 24 * HOUR);
    await consume(env.db.db, 'test:fresh', { window: 60, max: 1 }, now);
    expect(await pruneLimits(env.db.db, now)).toBeGreaterThanOrEqual(1);
    const rows = await env.db.db.execute(sql`select key from auth_limits where key like 'test:%' order by key`);
    const keys = ((Array.isArray(rows) ? rows : (rows as { rows: unknown[] }).rows) as { key: string }[]).map(r => r.key);
    expect(keys).toContain('test:fresh');
    expect(keys).not.toContain('test:old');
  });
});
