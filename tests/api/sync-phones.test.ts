import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { createApi } from '../../apps/api/src/app';
import { eq } from '../../apps/api/src/db/kit';
import { memory as serverMemory, record as serverRecord, syncOps } from '../../apps/api/src/db/schema';
import { LifeDataStore } from '../../apps/mobile/src/data/store';
import { createHttpTransport } from '../../apps/mobile/src/data/httpTransport';
import { memoryDriver } from '../support/sqlite';
import { adminUrl, freshDatabase, makeUser } from './support';

/**
 * Two phones, each with its own SQLite and the real store, projection and HTTP transport, syncing through the real
 * API and Postgres. Each phone has its own clock, so "newer" is decided on purpose.
 */
const base = 'http://life.test';
type Life = Record<string, any>;
const life = (): Life => ({
  profile: { name: 'Ama', city: 'London', country: 'UK', householdSize: 1, workStatus: 'sole-trader', annualIncome: 48000 },
  weightKg: 74.2, heightCm: 172, waistCm: 84,
  prefs: { look: 'mix', sounds: true, haptics: true, handDrawn: false, hideNumbers: false, notifications: true, privateMode: false },
  records: [{ id: 'rent', kind: 'fact', label: 'Rent goes up in March', area: 'money', status: 'confirmed', source: { type: 'talk' } }],
  aim: { what: 'A first home', when: '2029' },
  meals: [{ id: 'oats', name: 'Oats', at: '08:00', items: [{ name: 'Oats', grams: 100, kcal: 380, protein: 12, carbs: 60, fat: 7, fibre: 10, confidence: 1 }] }],
  habits: [{ id: 'water', name: 'Water', cue: 'After the kettle', autoComplete: true, last14: Array(14).fill(true) }],
  people: [{ id: 'kofi', name: 'Kofi', relation: 'Brother', date: '3 May' }, { id: 'esi', name: 'Esi', relation: 'Friend' }],
  learned: ['Tax codes'],
  memories: [{ id: 'm-rent', text: 'Rent is due on the 1st', source: 'Talk', category: 'Money' }, { id: 'm-iron', text: 'Low iron in March', source: 'Talk', category: 'Body' }],
  completed: [], missionSteps: {},
  choices: { 'payday-day': '25', appearance: 'System' }, flags: { 'signin-asked': true }, drafts: { note: 'only on this phone' }, onboardingDone: true,
});
const blank = (): Life => ({ profile: { name: '' }, prefs: {}, records: [], meals: [], habits: [], people: [], learned: [], memories: [], completed: [], missionSteps: {}, choices: {}, flags: {}, drafts: {}, onboardingDone: false });

describe.skipIf(!adminUrl)('two phones through the real API', () => {
  let env: Awaited<ReturnType<typeof freshDatabase>>;
  let api: (request: Request) => Promise<Response>;
  let account: string, other: string;
  let failAfterServer = false;

  beforeAll(async () => {
    env = await freshDatabase();
    account = await makeUser(env.db, 'ama@example.com');
    other = await makeUser(env.db, 'kofi@example.com');
    api = createApi({
      db: env.db,
      auth: { handler: async () => new Response(null, { status: 404 }), getPrincipal: async req => { const m = /^Bearer as:(.+)$/.exec(req.headers.get('authorization') ?? ''); return m ? { userId: m[1] } : null; } },
    });
  });
  afterAll(async () => { await env?.drop(); });

  async function phone(localId: string, start: number) {
    const { driver } = memoryDriver();
    let now = start;
    const store = await new LifeDataStore(driver, localId, () => crypto.randomUUID(), () => now).initialise();
    const device = crypto.randomUUID();
    const transport = createHttpTransport({
      base, token: async () => `as:${account}`, deviceId: async () => device, batch: 7,
      fetch: async (url, init) => {
        const response = await api(new Request(url, init));
        // The server did the work, then the connection dropped before the phone heard back.
        if (failAfterServer && url.endsWith('/sync/push')) throw new TypeError('Network request failed');
        return response;
      },
    });
    return {
      store, transport,
      tick: (minutes = 1) => { now += minutes * 60_000; },
      sync: () => store.sync(transport),
      load: () => store.loadProjection<Life>(),
    };
  }

  test('a new phone gets the whole life back, and the two then stay in step', async () => {
    const a = await phone('phone-a', Date.UTC(2026, 10, 20, 9));
    await a.store.commitProjection(life());
    await a.store.adoptAccount(account, { restore: false });
    expect((await a.sync()).pending).toBe(0);

    // Phone B is new: a blank start, then "Welcome back" signs in and restores.
    const b = await phone('phone-b', Date.UTC(2026, 10, 20, 10));
    await b.store.commitProjection(blank());
    await b.store.adoptAccount(account, { restore: true });
    await b.sync();
    const restored = await b.load();
    expect(restored?.profile.name).toBe('Ama');
    expect(restored?.onboardingDone).toBe(true);
    expect(restored?.choices).toEqual({ 'payday-day': '25', appearance: 'System' });
    expect(restored?.meals.map((m: Life) => m.name)).toEqual(['Oats']);
    expect(restored?.people.map((p: Life) => p.name).sort()).toEqual(['Esi', 'Kofi']);
    expect(restored?.records.find((r: Life) => r.id === 'rent')?.label).toBe('Rent goes up in March');
    // Drafts stay on the phone they were typed on: B keeps its own (empty) ones.
    expect(restored?.drafts).toEqual({});
    // The health memory stayed on phone A.
    expect(restored?.memories.map((m: Life) => m.text)).toEqual(['Rent is due on the 1st']);

    // B renames the meal and saves its whole screen state, as the app does.
    b.tick(); await b.store.commitProjection({ ...restored, meals: [{ ...restored!.meals[0], name: 'Porridge' }] });
    await b.sync(); await a.sync();
    const onA = await a.load();
    expect(onA?.meals.map((m: Life) => m.name)).toEqual(['Porridge']);
    // Nothing doubled on either phone.
    expect((await a.store.repos.food_entry.list())).toHaveLength(1);
    expect((await b.store.repos.food_entry.list())).toHaveLength(1);
    expect((await a.store.repos.profile.list())).toHaveLength(1);
    expect((await b.store.repos.person.list())).toHaveLength(2);

    // A removes Esi; B hears about it.
    a.tick(); await a.store.commitProjection({ ...onA, people: onA!.people.filter((p: Life) => p.id !== 'esi') });
    await a.sync(); await b.sync();
    expect((await b.load())?.people.map((p: Life) => p.name)).toEqual(['Kofi']);
  });

  test('both phones change the same thing: the newer edit wins on both', async () => {
    const a = await phone('phone-c', Date.UTC(2026, 10, 21, 9));
    await a.store.commitProjection(life()); await a.store.adoptAccount(account, { restore: false }); await a.sync();
    const b = await phone('phone-d', Date.UTC(2026, 10, 21, 9));
    await b.store.commitProjection(blank()); await b.store.adoptAccount(account, { restore: true }); await b.sync();
    const startA = (await a.load())!, startB = (await b.load())!;

    a.tick(5); await a.store.commitProjection({ ...startA, profile: { ...startA.profile, city: 'Leeds' } });
    b.tick(9); await b.store.commitProjection({ ...startB, profile: { ...startB.profile, city: 'Accra' } });
    await a.sync(); await b.sync(); await a.sync();
    expect((await a.load())?.profile.city).toBe('Accra');
    expect((await b.load())?.profile.city).toBe('Accra');
    // A saves something else before its screen reloads. Its screen still shows Leeds, which must not undo B's edit.
    a.tick(1); await a.store.commitProjection({ ...startA, profile: { ...startA.profile, city: 'Leeds' }, weightKg: 73 });
    await a.sync(); await b.sync();
    for (const p of [a, b]) {
      const seen = (await p.load())!;
      expect(seen.profile.city).toBe('Accra');
      expect(seen.weightKg).toBe(73);
    }
  });

  test('sync picks up after a dropped connection without doubling anything', async () => {
    const a = await phone('phone-e', Date.UTC(2026, 10, 22, 9));
    await a.store.commitProjection(life()); await a.store.adoptAccount(account, { restore: false });
    const queued = (await a.store.pending()).length;
    failAfterServer = true;
    await expect(a.sync()).rejects.toThrow('Network request failed');
    failAfterServer = false;
    expect((await a.store.pending()).length).toBe(queued);
    const before = await env.db.withUser(account, tx => tx.select().from(syncOps));
    expect((await a.sync()).pending).toBe(0);
    const after = await env.db.withUser(account, tx => tx.select().from(syncOps));
    // The first batch reached the server before the drop; sending it again stored nothing new.
    expect(new Set(after.map(op => op.id)).size).toBe(after.length);
    expect(after.length).toBe(before.length + queued - 7);
  });

  test('health memories reach the server only while their switch is on, and leave it when turned off', async () => {
    const a = await phone('phone-f', Date.UTC(2026, 10, 23, 9));
    await a.store.commitProjection(life()); await a.store.adoptAccount(account, { restore: false }); await a.sync();
    const ironId = (await a.store.repos.memory.list()).find(m => m.text === 'Low iron in March')!.id;
    const onServer = async () => (await env.db.withUser(account, tx => tx.select().from(serverMemory).where(eq(serverMemory.id, ironId)))).length;
    expect(await onServer()).toBe(0);
    await a.store.setHealthMemorySync(true); await a.sync();
    expect(await onServer()).toBe(1);
    await a.store.setHealthMemorySync(false); await a.sync();
    expect(await onServer()).toBe(0);
    // And it is still on the phone.
    expect((await a.store.repos.memory.get(ironId))?.text).toBe('Low iron in March');
  });

  test('a refused op leaves the outbox instead of being retried forever', async () => {
    const kofisRow = crypto.randomUUID(), at = '2026-11-20T09:00:00.000Z';
    await env.db.withUser(other, tx => tx.insert(serverRecord).values({ id: kofisRow, user_id: other, created_at: at, updated_at: at, kind: 'fact', fields: { note: 'Kofi’s' } }));
    const a = await phone('phone-g', Date.UTC(2026, 10, 24, 9));
    await a.store.adoptAccount(account, { restore: false });
    await a.store.repos.record.put({ id: kofisRow, kind: 'fact', fields: { note: 'not yours' } });
    expect((await a.sync()).pending).toBe(0);
    expect(await a.store.readLocal('sync-rejected')).toEqual([expect.objectContaining({ reason: 'FORBIDDEN', table: 'record', rowId: kofisRow })]);
    expect((await env.db.withUser(other, tx => tx.select().from(serverRecord).where(eq(serverRecord.id, kofisRow))))[0].fields).toEqual({ note: 'Kofi’s' });
  });
});
