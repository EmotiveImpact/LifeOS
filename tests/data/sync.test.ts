import { describe, expect, test } from 'bun:test';
import { LifeDataStore, type OutboxOp, type SyncTransport } from '../../apps/mobile/src/data/store';
import { createHttpTransport } from '../../apps/mobile/src/data/httpTransport';
import { stableId } from '../../apps/mobile/src/data/ids';
import { memoryDriver } from '../support/sqlite';

/** The phone's half of sync on in-memory SQLite. tests/api/sync-phones.test.ts runs the same store against the real API. */
const store = async (id = 'phone') => new LifeDataStore(memoryDriver().driver, id).initialise();
const uuidV = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const life = (extra: Record<string, unknown> = {}) => ({
  profile: { name: 'Ama' }, prefs: {}, records: [], meals: [{ id: 'oats', name: 'Oats', at: '08:00', items: [] }],
  habits: [{ id: 'water', name: 'Water', last14: [...Array(13).fill(undefined), true] }], people: [{ id: 'kofi', name: 'Kofi', date: '3 May' }],
  learned: [], memories: [{ id: 'iron', text: 'Low iron in March', source: 'Talk', category: 'Body' }, { id: 'rent', text: 'Rent on the 1st', source: 'Talk', category: 'Money' }],
  completed: [], missionSteps: {}, choices: {}, flags: {}, onboardingDone: true, ...extra,
});
const quiet = (over: Partial<SyncTransport> = {}): SyncTransport => ({ push: async (_u, ops) => ({ acknowledged: ops.map(o => o.id) }), pull: async () => ({ changes: [], cursor: null }), ...over });

describe('the outbox', () => {
  test('drains only what the server acknowledged', async () => {
    const s = await store();
    for (let i = 0; i < 3; i++) await s.repos.record.put({ kind: 'fact', fields: { i } });
    const [first] = await s.pending();
    await s.sync(quiet({ push: async () => ({ acknowledged: [first.id] }) }));
    const left = await s.pending();
    expect(left).toHaveLength(2);
    expect(left.map(o => o.id)).not.toContain(first.id);
  });

  test('a refused op is set aside, not retried forever', async () => {
    const s = await store();
    await s.repos.record.put({ kind: 'fact' });
    const [op] = await s.pending();
    await s.sync(quiet({ push: async () => ({ acknowledged: [], rejected: [{ id: op.id, reason: 'FORBIDDEN' }] }) }));
    expect(await s.pending()).toEqual([]);
    expect(await s.readLocal('sync-rejected')).toEqual([{ id: op.id, reason: 'FORBIDDEN', table: 'record', rowId: op.rowId }]);
  });

  test('a server that acknowledges ops it was never sent is refused', async () => {
    const s = await store();
    await s.repos.record.put({ kind: 'fact' });
    await expect(s.sync(quiet({ push: async () => ({ acknowledged: [crypto.randomUUID()] }) }))).rejects.toThrow('Invalid sync acknowledgement');
    expect(await s.pending()).toHaveLength(1);
  });
});

describe('pulling', () => {
  test('keeps asking while the server has more, and stops if the cursor doesn’t move', async () => {
    const s = await store(), seen: (string | null)[] = [];
    await s.sync(quiet({ pull: async (_u, cursor) => { seen.push(cursor); const n = Number(cursor ?? 0) + 1; return { changes: [], cursor: String(n), more: n < 3 }; } }));
    expect(seen).toEqual([null, '1', '2']);
    const stuck: (string | null)[] = [];
    await s.sync(quiet({ pull: async (_u, cursor) => { stuck.push(cursor); return { changes: [], cursor: '3', more: true }; } }));
    expect(stuck).toHaveLength(1);
  });
});

describe('health memories', () => {
  test('stay out of the outbox until their switch is on; turning it off asks the server to forget them', async () => {
    const s = await store();
    await s.commitProjection(life());
    const memoryOps = (ops: OutboxOp[]) => ops.filter(o => o.table === 'memory').map(o => (o.payload.text as string));
    expect(memoryOps(await s.pending())).toEqual(['Rent on the 1st']);
    await s.setHealthMemorySync(true);
    expect(memoryOps(await s.pending()).sort()).toEqual(['Low iron in March', 'Rent on the 1st']);
    await s.sync(quiet());
    await s.setHealthMemorySync(false);
    const forgotten: string[][] = [];
    await s.sync(quiet({ forget: async (_u, table, ids) => { expect(table).toBe('memory'); forgotten.push(ids); } }));
    const iron = (await s.repos.memory.list()).find(m => m.text === 'Low iron in March')!;
    expect(forgotten).toEqual([[iron.id]]);
    expect(await s.readLocal('forget-pending')).toBeNull();
    // Later edits to it stay on the phone.
    await s.repos.memory.put({ id: iron.id, text: 'Iron fine in June' });
    expect(memoryOps(await s.pending())).toEqual([]);
  });
});

describe('ids across phones', () => {
  test('the same thing gets the same id on every phone of an account, and a different one in another account', () => {
    const one = stableId('account-1', 'food_entry', 'oats');
    expect(one).toMatch(uuidV);
    expect(stableId('account-1', 'food_entry', 'oats')).toBe(one);
    expect(stableId('account-2', 'food_entry', 'oats')).not.toBe(one);
    expect(stableId('account-1', 'food_entry', 'toast')).not.toBe(one);
    expect(stableId('account-1', 'record', 'oats')).not.toBe(one);
  });

  test('signing in moves this phone’s rows to the account’s ids, and the rows that point at them follow', async () => {
    const s = await store();
    await s.commitProjection(life());
    await s.sync(quiet());
    await s.adoptAccount('account-1', { restore: false });
    const habit = (await s.repos.habit.list())[0], logs = await s.repos.habit_log.list(), meal = (await s.repos.food_entry.list())[0];
    expect(habit.id).toBe(stableId('account-1', 'habit', 'water'));
    expect(meal.id).toBe(stableId('account-1', 'food_entry', 'oats'));
    expect(logs.length).toBeGreaterThan(0);
    expect(logs.every(l => l.habit_id === habit.id)).toBe(true);
    expect((await s.repos.important_date.list())[0].person_id).toBe(stableId('account-1', 'person', 'kofi'));
    expect(await s.repos.food_entry.list()).toHaveLength(1);
    // The moved rows are queued for the server; the old ids leave without a tombstone.
    const ops = await s.pending();
    expect(ops.some(o => o.rowId === meal.id && o.op === 'upsert')).toBe(true);
    expect(ops.some(o => o.op === 'delete')).toBe(false);
    // The screen still reads the same life. (The first save after a reload tidies a few rows' shape; after that,
    // saving the reloaded screen queues nothing, so two phones can't keep echoing each other.)
    await s.commitProjection(await s.loadProjection());
    const settled = (await s.pending()).length;
    await s.commitProjection(await s.loadProjection());
    expect((await s.pending()).length).toBe(settled);
    expect((await s.loadProjection<Record<string, any>>())?.meals[0].name).toBe('Oats');
  });

  test('after the account closes, erasing the phone queues nothing that could empty the account later', async () => {
    const s = await store();
    await s.commitProjection(life());
    await s.adoptAccount('account-1', { restore: false });
    await s.sync(quiet());
    await s.repos.record.put({ kind: 'fact' });
    await s.eraseThisPhone();
    expect(await s.pending()).toEqual([]);
    expect(await s.repos.profile.list()).toEqual([]);
    expect(await s.repos.record.list()).toEqual([]);
    expect(await s.readLocal('account-id')).toBeNull();
    // Erasing with deleteEverything, by contrast, sends a delete for every row.
    await s.commitProjection(life());
    await s.deleteEverything();
    expect((await s.pending()).every(o => o.op === 'delete')).toBe(true);
  });

  test('restoring onto a phone with nothing of its own clears its starter rows first', async () => {
    const s = await store();
    await s.commitProjection(life({ onboardingDone: false }));
    await s.adoptAccount('account-1', { restore: true });
    expect(await s.repos.profile.list()).toEqual([]);
    expect(await s.pending()).toEqual([]);
    expect(await s.readLocal('account-id')).toBe('account-1');
    // Signing in again to the same account is a no-op.
    await s.repos.record.put({ kind: 'fact' });
    await s.adoptAccount('account-1', { restore: true });
    expect(await s.repos.record.list()).toHaveLength(1);
  });
});

describe('the HTTP transport', () => {
  test('if a later batch fails, the batches the server already stored still count', async () => {
    const s = await store();
    for (let i = 0; i < 5; i++) await s.repos.record.put({ kind: 'fact', fields: { i } });
    let calls = 0;
    const transport = createHttpTransport({
      base: 'http://life.test', token: async () => 'token', deviceId: async () => 'device', batch: 2,
      fetch: async (url, init) => {
        if (url.endsWith('/sync/pull')) return Response.json({ changes: [], cursor: null, more: false });
        if (++calls > 1) throw new TypeError('Network request failed');
        const { operations } = JSON.parse(String(init.body)) as { operations: OutboxOp[] };
        expect(new Headers(init.headers).get('authorization')).toBe('Bearer token');
        return Response.json({ acknowledged: operations.map(o => o.id), rejected: [] });
      },
    });
    await s.sync(transport);
    expect(await s.pending()).toHaveLength(3);
  });

  test('signed out means no request at all', async () => {
    let called = false;
    const transport = createHttpTransport({ base: 'http://life.test', token: async () => null, deviceId: async () => 'device', fetch: async () => { called = true; return new Response(); } });
    await expect(transport.pull('phone', null)).rejects.toThrow('Signed out');
    expect(called).toBe(false);
  });
});
