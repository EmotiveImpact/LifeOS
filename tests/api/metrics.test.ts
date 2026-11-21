import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { createApi } from '../../apps/api/src/app';
import { createAuth } from '../../apps/api/src/auth';
import { getTableConfig } from '../../apps/api/src/db/kit';
import { weeklyMoves } from '../../apps/api/src/db/schema';
import { adminUrl, freshDatabase } from './support';

/**
 * Phase 30's north star: moves finished per week. A phone shares one number per finished week, only when the person
 * has switched it on. The server keeps a tally per week, platform and count, and never who sent it.
 */
const base = 'http://life.test';

describe('the weekly tally', () => {
  test('holds no person: no user, device, address or time beyond the week', () => {
    const columns = getTableConfig(weeklyMoves).columns.map(c => c.name).sort();
    expect(columns).toEqual(['moves', 'platform', 'reports', 'week']);
  });
});

describe.skipIf(!adminUrl)('sharing a week’s count through the API', () => {
  let env: Awaited<ReturnType<typeof freshDatabase>>;
  const now = Date.parse('2026-11-30T09:00:00.000Z'); // Monday of 2026-W49
  const codes = new Map<string, string>();
  let api: (request: Request) => Promise<Response>;
  beforeAll(async () => {
    env = await freshDatabase();
    const auth = createAuth({ db: env.db.db, secret: 'test-secret-that-is-long-enough-for-better-auth', baseURL: base, sendCode: async (email, code) => { codes.set(email, code); } });
    api = createApi({ db: env.db, auth, now: () => now });
  });
  afterAll(async () => { await env?.drop(); });
  const call = (path: string, body: unknown, token?: string) => api(new Request(`${base}${path}`, { method: 'POST', headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) }));
  async function signIn(email: string) {
    await call('/auth/email-otp/send-verification-otp', { email, type: 'sign-in' });
    const res = await call('/auth/sign-in/email-otp', { email, otp: codes.get(email) });
    return res.headers.get('set-auth-token')!;
  }
  const tally = async () => (await env.db.db.select().from(weeklyMoves)).map(r => ({ ...r })).sort((a, b) => `${a.week}${a.platform}${a.moves}`.localeCompare(`${b.week}${b.platform}${b.moves}`));

  test('needs a session, so strangers can’t fill it', async () => {
    expect((await call('/metrics/moves', { week: '2026-W48', moves: 5, platform: 'ios' })).status).toBe(401);
  });

  test('adds one to the tally for that week, platform and count, and stores nothing of the sender', async () => {
    const ama = await signIn('ama@example.com'), kofi = await signIn('kofi@example.com');
    expect((await call('/metrics/moves', { week: '2026-W48', moves: 5, platform: 'ios', user_id: 'someone', device: 'abc' }, ama)).status).toBe(204);
    expect((await call('/metrics/moves', { week: '2026-W48', moves: 5, platform: 'ios' }, kofi)).status).toBe(204);
    expect((await call('/metrics/moves', { week: '2026-W47', moves: 0, platform: 'android' }, kofi)).status).toBe(204);
    expect(await tally()).toEqual([
      { week: '2026-W47', platform: 'android', moves: 0, reports: 1 },
      { week: '2026-W48', platform: 'ios', moves: 5, reports: 2 },
    ]);
    expect(JSON.stringify(await tally())).not.toMatch(/ama|kofi|someone|abc/);
  });

  test('only a finished week, from the last few, with a count in range', async () => {
    const yaw = await signIn('yaw@example.com');
    for (const body of [
      { week: '2026-W49', moves: 3, platform: 'ios' }, // this week isn't finished
      { week: '2026-W50', moves: 3, platform: 'ios' }, // the future
      { week: '2026-W40', moves: 3, platform: 'ios' }, // too long ago
      { week: '2026-W48', moves: 100, platform: 'ios' },
      { week: '2026-W48', moves: -1, platform: 'ios' },
      { week: '2026-W48', moves: 2.5, platform: 'ios' },
      { week: '2026-W48', moves: 3, platform: 'web' },
      { week: 'last week', moves: 3, platform: 'ios' },
    ]) expect((await call('/metrics/moves', body, yaw)).status).toBe(400);
  });
});
