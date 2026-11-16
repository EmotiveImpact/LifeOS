import { afterEach, describe, expect, test } from 'bun:test';
import { Database } from 'bun:sqlite';
import { LifeDataStore, type OutboxOp } from '../../apps/mobile/src/data/store';
import { drizzleMigrations } from '../../apps/mobile/src/data/migrations';
import { tableNames } from '../../apps/mobile/src/data/schema';
import type { SqlDriver, SqlExecutor, SqlValue } from '../../apps/mobile/src/data/driver';

const databases: Database[] = [];
function driver() {
  const db = new Database(':memory:'); databases.push(db);
  let tail = Promise.resolve<unknown>(undefined);
  const raw: SqlExecutor = {
    exec: async sql => { db.exec(sql); },
    run: async (sql, values = []) => { db.query(sql).run(...values); },
    all: async <T extends Record<string, unknown>>(sql: string, values: SqlValue[] = []) => db.query(sql).all(...values) as T[],
  };
  const queue = <T>(fn: () => Promise<T>) => { const task = tail.then(fn); tail = task.catch(() => {}); return task; };
  const adapter: SqlDriver = {
    exec: sql => queue(() => raw.exec(sql)), run: (sql, values) => queue(() => raw.run(sql, values)), all: (sql, values) => queue(() => raw.all(sql, values)),
    transaction: body => queue(async () => { db.exec('BEGIN IMMEDIATE'); try { const value = await body(raw); db.exec('COMMIT'); return value; } catch (error) { db.exec('ROLLBACK'); throw error; } }),
    close: async () => { /* afterEach owns this in-memory connection. */ },
  };
  return { adapter, db };
}
async function fixture(userId = 'owner') { const { adapter, db } = driver(); return { store: await new LifeDataStore(adapter, userId).initialise(), adapter, db }; }
const uuid = () => crypto.randomUUID();
const projection = () => ({
  profile: { name: 'Ama', city: 'London', country: 'UK', householdSize: 1, workStatus: 'sole-trader', annualIncome: 48000 },
  weightKg: 74.2, heightCm: 172, waistCm: 84,
  prefs: { look: 'mix', sounds: true, haptics: true, handDrawn: false, hideNumbers: false, notifications: true, privateMode: true, dark: true, addback: 'Half' },
  records: [{ id: 'known', kind: 'fact', label: 'Known fact', area: 'you', status: 'confirmed', source: { type: 'talk' } }, { id: 'proposal', kind: 'fact', label: 'Not yet confirmed', status: 'proposed' }],
  proposals: [{ id: 'new', status: 'proposed', label: 'Private pending fact' }],
  aim: { what: 'A first home', when: '2029' }, meals: [{ id: 'meal-one', name: 'Oats', at: '08:00', items: [{ name: 'Oats', grams: 100, kcal: 380, protein: 12, carbs: 60, fat: 7, fibre: 10, confidence: 1 }] }],
  habits: [{ id: 'water', name: 'Water', cue: 'After the kettle', autoComplete: true, last14: Array(14).fill(true) }],
  people: [{ id: 'kwame', name: 'Grandpa Kwame', relation: 'Grandpa', date: '14 December', note: 'Remembered quietly' }],
  learned: ['Tax codes'], memories: [{ id: 'memory-one', text: 'Your rent changes in March', source: 'Talk' }], completed: ['task-one'], missionSteps: { 'task-one-0': true },
  flags: { preserved: true }, choices: { 'selected-meal': 'meal-one' }, drafts: { personal: 'Unsent text' }, pulseLog: [{ moodId: 'calm' }], onboardingDone: true,
});
afterEach(() => { for (const db of databases.splice(0)) db.close(); });

describe('local SQLite repositories', () => {
  test('Drizzle migration prepares every statement separately, as Expo requires', () => {
    const db = new Database(':memory:'); databases.push(db);
    for (const statement of drizzleMigrations.migrations.m0000.split('--> statement-breakpoint')) db.query(statement).run();
    const names = (db.query("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[]).map(r => r.name);
    for (const name of [...tableNames, 'outbox', 'local_state', 'sync_cursor']) expect(names).toContain(name);
  });
  test('creates every specified table and records the migration once', async () => {
    const { store, db } = await fixture(); await store.initialise();
    const names = (db.query("SELECT name FROM sqlite_master WHERE type='table'").all() as { name: string }[]).map(r => r.name);
    for (const name of tableNames) expect(names).toContain(name);
    expect(db.query('SELECT count(*) n FROM __drizzle_migrations').get()).toEqual({ n: 1 });
  });
  test('row and outbox write commit together; invalid FK rolls both back', async () => {
    const { store } = await fixture();
    const row = await store.repos.record.put({ kind: 'fact', fields: { label: 'A fact' } });
    expect((await store.pending())[0].payload.id).toBe(row.id);
    await expect(store.atomic(async tx => { await tx.put('record', { kind: 'fact', fields: { label: 'Should rollback' } }); await tx.put('habit_log', { habit_id: uuid(), date: '2026-11-16', done: true }); })).rejects.toThrow();
    expect(await store.repos.record.list()).toHaveLength(1); expect(await store.pending()).toHaveLength(1);
  });
  test('scopes every read and rejects cross-user mutations', async () => {
    const { store, adapter } = await fixture('first'), second = await new LifeDataStore(adapter, 'second').initialise();
    const row = await store.repos.person.put({ name: 'Private person' });
    expect(await second.repos.person.list()).toEqual([]); expect(await second.repos.person.get(row.id)).toBeNull();
    await expect(second.repos.person.put({ id: row.id, name: 'Overwrite' })).rejects.toThrow();
    await expect(store.repos.person.put({ user_id: 'second', name: 'Wrong owner' })).rejects.toThrow();
    await expect(store.repos.person.put({ name: 'Invalid timestamp', deleted_at: 'not-a-date' })).rejects.toThrow('Invalid deletion timestamp');
    expect((await store.repos.person.get(row.id))?.name).toBe('Private person');
  });
  test('unchanged writes do not multiply outbox entries', async () => {
    const { store } = await fixture(); const row = await store.repos.record.put({ kind: 'fact', fields: { value: 1 } });
    await store.repos.record.put({ id: row.id, kind: 'fact', fields: { value: 1 } });
    expect(await store.pending()).toHaveLength(1);
  });
  test('legacy import is atomic and idempotent, and draft facts are local-only', async () => {
    const { store } = await fixture();
    expect(await store.importLegacyOnce(projection())).toBe(true);
    const count = (await store.pending()).length;
    expect(await store.importLegacyOnce(projection())).toBe(false); expect(await store.pending()).toHaveLength(count);
    const records = await store.repos.record.list();
    expect(records.filter(r => (r.fields as any).label === 'Not yet confirmed')).toEqual([]);
    expect(JSON.stringify(await store.pending())).not.toContain('Private pending fact');
    expect(JSON.stringify(await store.pending())).not.toContain('Unsent text');
  });
  test('round-trips the screen projection, including habit preferences and UI drafts', async () => {
    const { store } = await fixture(); await store.importLegacyOnce(projection());
    const loaded = await store.loadProjection<any>();
    expect(loaded.profile.name).toBe('Ama'); expect(loaded.profile.annualIncome).toBe(48000);
    expect(loaded.habits[0].autoComplete).toBe(true); expect(loaded.habits[0].last14).toEqual(Array(14).fill(true));
    expect(loaded.meals[0].id).toBe('meal-one'); expect(loaded.choices['selected-meal']).toBe('meal-one');
    expect(loaded.flags.preserved).toBe(true); expect(loaded.drafts.personal).toBe('Unsent text'); expect(loaded.proposals[0].label).toBe('Private pending fact');
    expect(loaded.memories[0].id).toBe('memory-one'); expect(loaded.completed).toEqual(['task-one']); expect(loaded.missionSteps['task-one-0']).toBe(true);
    const dates = await store.repos.important_date.list(); expect(dates[0].kind).toBe('memorial'); expect(dates[0].reminder).toBeNull();
    await store.commitProjection(loaded);
    expect((await store.loadProjection<any>()).memories).toHaveLength(1);
  });
  test('subsequent commits update domain rows and retain unrelated health samples', async () => {
    const { store } = await fixture(); await store.importLegacyOnce(projection());
    await store.repos.health_sample.put({ type: 'steps', start: '2026-11-16', value: 1234 });
    const next = await store.loadProjection<any>(); next.profile.householdSize = 3; next.records.push({ id: 'second', kind: 'fact', status: 'confirmed', label: 'Confirmed' });
    await store.commitProjection(next);
    expect((await store.loadProjection<any>()).profile.householdSize).toBe(3); expect(await store.repos.health_sample.list()).toHaveLength(1);
    expect((await store.repos.record.list()).some(r => (r.fields as any).label === 'Confirmed')).toBe(true);
  });
  test('soft deletion produces a content-free sync tombstone and remains scoped', async () => {
    const { store } = await fixture(); const row = await store.repos.memory.put({ text: 'Private memory' }); await store.repos.memory.remove(row.id);
    expect(await store.repos.memory.get(row.id)).toBeNull(); expect(await store.repos.memory.list({ includeDeleted: true })).toHaveLength(1);
    const op = (await store.pending()).at(-1)!; expect(op.op).toBe('delete'); expect(JSON.stringify(op.payload)).not.toContain('Private memory');
  });
});
describe('offline sync and export/delete', () => {
  test('without a transport it stays offline and retains operations', async () => {
    const { store } = await fixture(); await store.repos.record.put({ kind: 'fact' });
    expect(await store.sync()).toEqual({ status: 'offline', pending: 1 });
  });
  test('acknowledgements clear only sent IDs; cursor is persisted with pulls', async () => {
    const { store } = await fixture(); await store.repos.record.put({ kind: 'fact' });
    const cursors: (string | null)[] = [];
    const transport = { push: async (_user: string, ops: OutboxOp[]) => ({ acknowledged: ops.map(o => o.id) }), pull: async (_user: string, cursor: string | null) => { cursors.push(cursor); return { changes: [], cursor: 'next' }; } };
    expect(await store.sync(transport)).toEqual({ status: 'synced', pending: 0 }); await store.sync(transport); expect(cursors).toEqual([null, 'next']);
  });
  test('transport failure never discards the outbox', async () => {
    const { store } = await fixture(); await store.repos.record.put({ kind: 'fact' });
    await expect(store.sync({ push: async () => { throw Error('offline'); }, pull: async () => ({ changes: [], cursor: null }) })).rejects.toThrow('offline');
    expect(await store.pending()).toHaveLength(1);
  });
  test('invalid cross-user pull rolls back rows and cursor', async () => {
    const { store, db } = await fixture(); const at = '2026-11-16T00:00:00.000Z';
    await expect(store.sync({ push: async () => ({ acknowledged: [] }), pull: async () => ({ cursor: 'bad', changes: [{ table: 'record', op: 'upsert', row: { id: uuid(), user_id: 'other', created_at: at, updated_at: at, deleted_at: null, kind: 'fact' } }] }) })).rejects.toThrow('Invalid remote row');
    expect(await store.repos.record.list()).toEqual([]); expect(db.query('SELECT * FROM sync_cursor').all()).toEqual([]);
  });
  test('a newer pending local edit wins over an older remote value', async () => {
    const { store } = await fixture(); const row = await store.repos.record.put({ kind: 'fact', fields: { value: 'local' } });
    await store.sync({ push: async () => ({ acknowledged: [] }), pull: async () => ({ cursor: 'one', changes: [{ table: 'record', op: 'upsert', row: { ...row, updated_at: '2020-01-01T00:00:00.000Z', fields: { value: 'remote' } } }] }) });
    expect((await store.repos.record.get(row.id))?.fields).toEqual({ value: 'local' });
  });
  test('repeated deletion retains unacknowledged tombstones and stale-version guards', async () => {
    const { store } = await fixture(); const row = await store.repos.record.put({ kind: 'fact', fields: { label: 'Gone' } });
    await store.deleteEverything(); const before = await store.pending(); await store.deleteEverything();
    expect(await store.pending()).toHaveLength(before.length);
    await store.sync({ push: async (_user, ops) => ({ acknowledged: ops.map(o => o.id) }), pull: async () => ({ cursor: 'one', changes: [] }) });
    await store.deleteEverything();
    await store.sync({ push: async () => ({ acknowledged: [] }), pull: async () => ({ cursor: 'two', changes: [{ table: 'record', op: 'upsert', row }] }) });
    expect(await store.repos.record.list()).toEqual([]);
  });
  test('export includes this user only and delete purges content without resurrection', async () => {
    const { store, adapter } = await fixture(); await store.importLegacyOnce(projection());
    const second = await new LifeDataStore(adapter, 'other').initialise(); await second.repos.record.put({ kind: 'fact', fields: { label: 'Other user' } });
    const before = await store.exportEverything(); expect(JSON.stringify(before)).not.toContain('Other user');
    const old = (before.tables.record ?? [])[0]; expect(old).toBeDefined();
    const deletion = await store.deleteEverything(); expect(deletion.queuedDeletes).toBeGreaterThan(0); expect(await store.loadProjection()).toBeNull();
    expect(await store.importLegacyOnce(projection())).toBe(false); expect(await second.repos.record.list()).toHaveLength(1);
    expect(JSON.stringify(await store.exportEverything())).not.toContain('Unsent text'); expect(JSON.stringify(await store.pending())).not.toContain('Known fact');
    await store.sync({ push: async (_user, ops) => ({ acknowledged: ops.map(o => o.id) }), pull: async () => ({ cursor: 'replayed', changes: [{ table: 'record', op: 'upsert', row: old }] }) });
    expect(await store.repos.record.list()).toEqual([]);
  });
});
