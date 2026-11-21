import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { createApi } from '../../apps/api/src/app';
import { eq } from '../../apps/api/src/db/kit';
import { oauthTokens } from '../../apps/api/src/db/schema';
import { sealer } from '../../apps/api/src/seal';
import { fromOura, fromWhoop, readState, signState, stageBlocks, type WearableOptions } from '../../apps/api/src/wearables';
import { adminUrl, freshDatabase, makeUser } from './support';

/**
 * BUILD_V26 Phase 26: WHOOP and Oura through their official OAuth APIs, never Bluetooth. Tested against stand-ins for
 * the two services: no developer apps exist yet (decision 8), so nothing here reaches WHOOP or Oura.
 */
const base = 'http://life.test';
const NOW = Date.parse('2026-11-20T12:00:00.000Z');
const KEY = btoa(String.fromCharCode(...new Uint8Array(32).map((_, i) => i + 1)));

describe('the signed state', () => {
  test('says who and which wearable, only until it expires, and nothing can be changed in it', async () => {
    const token = await signState('k', { u: 'ama', p: 'whoop', n: 'n'.repeat(24), e: NOW + 60_000 });
    expect(await readState('k', token, NOW)).toMatchObject({ u: 'ama', p: 'whoop' });
    expect(await readState('k', token, NOW + 60_001)).toBeNull();
    expect(await readState('other', token, NOW)).toBeNull();
    const [body, mac] = token.split('.');
    const forged = btoa(atob(body.replace(/-/g, '+').replace(/_/g, '/')).replace('ama', 'kofi')).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(await readState('k', `${forged}.${mac}`, NOW)).toBeNull();
  });
});

describe('readings as samples', () => {
  const sleep = { id: 'b1e3', start: '2026-11-19T23:00:00.000Z', end: '2026-11-20T07:00:00.000Z', nap: false, score_state: 'SCORED', score: { respiratory_rate: 15.2, stage_summary: { total_in_bed_time_milli: 28_800_000, total_awake_time_milli: 1_800_000, total_light_sleep_time_milli: 14_400_000, total_slow_wave_sleep_time_milli: 5_400_000, total_rem_sleep_time_milli: 7_200_000 } } };
  test('WHOOP: a night’s stage totals become one night, and the recovery sits inside it', () => {
    const samples = fromWhoop([sleep, { ...sleep, id: 'x', score_state: 'PENDING_SCORE' }], [{ sleep_id: 'b1e3', score_state: 'SCORED', score: { recovery_score: 71, resting_heart_rate: 54, hrv_rmssd_milli: 62.5, spo2_percentage: 96.4, skin_temp_celsius: 33.9 } }]);
    const asleep = samples.filter(s => s.type === 'sleep' && s.stage !== 'awake').reduce((m, s) => m + (Date.parse(s.end as string) - Date.parse(s.start as string)) / 60_000, 0);
    expect(asleep).toBe(450);
    expect(samples.find(s => s.type === 'hrv')).toMatchObject({ value: 62.5, method: 'rmssd', start: '2026-11-20T06:59:00.000Z', source: { id: 'whoop', kind: 'wearable' } });
    expect(samples.map(s => s.type)).toEqual(expect.arrayContaining(['recoveryScore', 'restingHeartRate', 'oxygenSaturation', 'skinTemperature', 'respiratoryRate']));
  });
  test('Oura: sleep, readiness, activity, heart rate and blood oxygen, and a rest period is left out', () => {
    const samples = fromOura({
      sleep: [{ type: 'long_sleep', bedtime_start: '2026-11-19T22:45:00.000Z', bedtime_end: '2026-11-20T06:45:00.000Z', latency: 600, light_sleep_duration: 14_400, deep_sleep_duration: 5_400, rem_sleep_duration: 6_000, average_hrv: 48, average_breath: 14.8, lowest_heart_rate: 52, readiness: { temperature_deviation: 0.2 } }, { type: 'rest', bedtime_start: '2026-11-20T13:00:00.000Z', bedtime_end: '2026-11-20T13:20:00.000Z' }],
      readiness: [{ day: '2026-11-20', score: 82, timestamp: '2026-11-20T04:00:00+00:00' }],
      activity: [{ day: '2026-11-20', steps: 6400, active_calories: 310, timestamp: '2026-11-20T04:00:00+00:00' }],
      heartrate: [{ bpm: 61, source: 'awake', timestamp: '2026-11-20T09:00:00+00:00' }],
      spo2: [{ day: '2026-11-20', spo2_percentage: { average: 97.1 } }],
    });
    expect(samples.filter(s => s.type === 'sleep')[0]).toMatchObject({ stage: 'awake', end: '2026-11-19T22:55:00.000Z' });
    expect(samples.some(s => s.type === 'sleep' && s.start === '2026-11-20T13:00:00.000Z')).toBe(false);
    expect(samples.find(s => s.type === 'skinTemperatureDelta')?.value).toBe(0.2);
    expect(samples.find(s => s.type === 'oxygenSaturation')).toMatchObject({ start: '2026-11-20T05:00:00', value: 97.1 });
    expect(samples.map(s => s.type)).toEqual(expect.arrayContaining(['hrv', 'respiratoryRate', 'restingHeartRate', 'recoveryScore', 'steps', 'activeEnergy', 'heartRate']));
  });
  test('stage blocks never run past the end of the night', () => {
    const blocks = stageBlocks({ id: 'x', kind: 'wearable' }, 0, 60 * 60_000, { light: 50, deep: 30, rem: 10 });
    expect(Math.max(...blocks.map(b => Date.parse(b.end as string)))).toBe(60 * 60_000);
  });
});

describe.skipIf(!adminUrl)('connecting through the API', () => {
  let env: Awaited<ReturnType<typeof freshDatabase>>;
  let api: (request: Request) => Promise<Response>;
  let ama: string, kofi: string;
  const calls: { url: string; body?: string; auth?: string | null }[] = [];
  let tokenStatus = 200, expiresIn = 3600, dataStatus = 200;
  const standIn: typeof fetch = (async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input);
    calls.push({ url, body: typeof init?.body === 'string' ? init.body : undefined, auth: new Headers(init?.headers).get('authorization') });
    if (url.endsWith('/oauth2/token') || url.endsWith('/oauth/token')) {
      const grant = new URLSearchParams(String(init?.body)).get('grant_type');
      return new Response(JSON.stringify({ access_token: grant === 'refresh_token' ? 'access-2' : 'access-1', refresh_token: grant === 'refresh_token' ? 'refresh-2' : 'refresh-1', expires_in: expiresIn, scope: 'offline read:sleep' }), { status: tokenStatus });
    }
    if (url.includes('/developer/v2/activity/sleep')) return new Response(JSON.stringify({ records: [{ id: 'n1', start: '2026-11-19T23:00:00.000Z', end: '2026-11-20T07:00:00.000Z', nap: false, score_state: 'SCORED', score: { stage_summary: { total_light_sleep_time_milli: 14_400_000, total_slow_wave_sleep_time_milli: 5_400_000, total_rem_sleep_time_milli: 7_200_000 } } }], next_token: null }), { status: dataStatus });
    if (url.includes('/developer/v2/recovery')) return new Response(JSON.stringify({ records: [], next_token: null }), { status: dataStatus });
    if (url.includes('/developer/v2/user/access')) return new Response(null, { status: 204 });
    return new Response('{}', { status: 404 });
  }) as typeof fetch;
  const call = (path: string, user: string | null, init: RequestInit = {}) => api(new Request(`${base}${path}`, { ...init, headers: { 'content-type': 'application/json', ...(user ? { authorization: `Bearer as:${user}` } : {}) } }));
  const connect = async (user: string) => {
    const res = await call('/wearables/whoop/connect', user, { method: 'POST' });
    expect(res.status).toBe(200);
    return new URL((await res.json() as { url: string }).url);
  };

  beforeAll(async () => {
    env = await freshDatabase();
    ama = await makeUser(env.db, 'ama@example.com');
    kofi = await makeUser(env.db, 'kofi@example.com');
    const wearables: WearableOptions = { apps: { whoop: { clientId: 'life-client', clientSecret: 'shh-secret' } }, publicUrl: base, sealer: await sealer(KEY), stateKey: KEY, fetch: standIn };
    api = createApi({ db: env.db, now: () => NOW, wearables, auth: { handler: async () => new Response(null, { status: 404 }), getPrincipal: async req => { const m = /^Bearer as:(.+)$/.exec(req.headers.get('authorization') ?? ''); return m ? { userId: m[1] } : null; } } });
  });
  afterAll(async () => { await env?.drop(); });

  test('connecting needs a session; a wearable without a developer app says so', async () => {
    expect((await call('/wearables/whoop/connect', null, { method: 'POST' })).status).toBe(401);
    expect((await call('/wearables/oura/connect', ama, { method: 'POST' })).status).toBe(503);
    expect(await (await call('/wearables', ama)).json()).toEqual({ available: ['whoop'], connections: [] });
  });

  test('WHOOP connects with the official sign-in, the tokens are sealed, and the secret never reaches the phone', async () => {
    const url = await connect(ama);
    expect(url.origin + url.pathname).toBe('https://api.prod.whoop.com/oauth/oauth2/auth');
    expect(url.searchParams.get('redirect_uri')).toBe(`${base}/wearables/whoop/callback`);
    expect(url.searchParams.get('scope')).toContain('offline');
    expect(url.toString()).not.toContain('shh-secret');
    const back = await api(new Request(`${base}/wearables/whoop/callback?code=abc&state=${encodeURIComponent(url.searchParams.get('state')!)}`));
    expect(back.status).toBe(200);
    expect(back.headers.get('content-type')).toContain('text/html');
    expect(await back.text()).toContain('WHOOP is connected');
    const [row] = await env.db.withUser(ama, tx => tx.select().from(oauthTokens).where(eq(oauthTokens.provider, 'whoop')));
    expect(row.access_token).toStartWith('v1.');
    expect(row.access_token).not.toContain('access-1');
    expect(calls.find(c => c.url.endsWith('/oauth2/token'))?.body).toContain('client_secret=shh-secret');
    expect(((await (await call('/wearables', ama)).json()) as { connections: { provider: string }[] }).connections.map(c => c.provider)).toEqual(['whoop']);
    // Nobody else sees the connection.
    expect(((await (await call('/wearables', kofi)).json()) as { connections: unknown[] }).connections).toEqual([]);
  });

  test('a state works once, and a declined or forged one connects nothing', async () => {
    const url = await connect(kofi);
    const state = encodeURIComponent(url.searchParams.get('state')!);
    expect((await api(new Request(`${base}/wearables/whoop/callback?error=access_denied&state=${state}`))).status).toBe(400);
    // The decline used the state up: the same link can't connect afterwards.
    expect(await (await api(new Request(`${base}/wearables/whoop/callback?code=abc&state=${state}`))).text()).toContain('expired or was already used');
    expect((await api(new Request(`${base}/wearables/whoop/callback?code=abc&state=nonsense`))).status).toBe(400);
    expect(((await (await call('/wearables', kofi)).json()) as { connections: unknown[] }).connections).toEqual([]);
  });

  test('readings pass through as samples and are never stored; an expired token is refreshed once', async () => {
    expect((await call('/wearables/samples?from=10&to=5', ama)).status).toBe(400);
    expect((await call(`/wearables/samples?from=0&to=${NOW}`, ama)).status).toBe(400);
    const from = NOW - 2 * 86_400_000;
    const first = await (await call(`/wearables/samples?from=${from}&to=${NOW}`, ama)).json() as { samples: { type: string; source: { id: string } }[]; problems: unknown[] };
    expect(first.problems).toEqual([]);
    expect(first.samples.filter(s => s.type === 'sleep').length).toBeGreaterThan(0);
    expect(calls.find(c => c.url.includes('/activity/sleep'))?.auth).toBe('Bearer access-1');
    // Expire it: the next read refreshes first and keeps the new refresh token.
    await env.db.withUser(ama, tx => tx.update(oauthTokens).set({ expires_at: new Date(NOW - 1) }).where(eq(oauthTokens.provider, 'whoop')));
    calls.length = 0;
    await call(`/wearables/samples?from=${from}&to=${NOW}`, ama);
    expect(calls.filter(c => c.url.endsWith('/oauth2/token'))).toHaveLength(1);
    expect(calls.find(c => c.url.includes('/activity/sleep'))?.auth).toBe('Bearer access-2');
  });

  test('a token WHOOP refuses asks the person to connect again; WHOOP being down is only a wait', async () => {
    dataStatus = 401;
    expect(((await (await call(`/wearables/samples?from=${NOW - 86_400_000}&to=${NOW}`, ama)).json()) as { problems: unknown[] }).problems).toEqual([{ provider: 'whoop', problem: 'reconnect' }]);
    dataStatus = 503;
    expect(((await (await call(`/wearables/samples?from=${NOW - 86_400_000}&to=${NOW}`, ama)).json()) as { problems: unknown[] }).problems).toEqual([{ provider: 'whoop', problem: 'unavailable' }]);
    dataStatus = 200;
  });

  test('disconnecting revokes at WHOOP and deletes the tokens', async () => {
    calls.length = 0;
    expect((await call('/wearables/whoop/disconnect', ama, { method: 'POST' })).status).toBe(200);
    expect(calls.some(c => c.url.endsWith('/developer/v2/user/access'))).toBe(true);
    expect(await env.db.withUser(ama, tx => tx.select().from(oauthTokens))).toEqual([]);
    expect((await call('/wearables/whoop/disconnect', ama, { method: 'POST' })).status).toBe(404);
  });
});
