import { adoptAccount, importLegacyProjection, loadProjection, commitProjection } from './projection';
import { columns, isTable, tableNames, type DataRow, type TableName } from './schema';
import { migrationSql, migrationVersion } from './migrations';
import type { SqlDriver, SqlExecutor, SqlValue } from './driver';

export type OutboxOp = { id: string; user_id: string; table: TableName; rowId: string; op: 'upsert' | 'delete'; payload: DataRow; at: string };
export type RemoteChange = { table: TableName; op: 'upsert' | 'delete'; row: DataRow };
/** An op the server refused for good (malformed, or naming a row that isn't this person's). It leaves the outbox. */
export type RejectedOp = { id: string; reason: string };
export interface SyncTransport {
  push(userId: string, operations: OutboxOp[]): Promise<{ acknowledged: string[]; rejected?: RejectedOp[] }>;
  /** `more` asks for another page straight away. */
  pull(userId: string, cursor: string | null): Promise<{ changes: RemoteChange[]; cursor: string | null; more?: boolean }>;
  /** Removes the server's copy of some rows without a tombstone reaching other phones (health memories, Phase 22). */
  forget?(userId: string, table: TableName, ids: string[]): Promise<void>;
}
export type SyncResult = { status: 'offline' | 'synced'; pending: number; applied: number };

/** Health memories stay on this phone unless the person turns on "Sync health memories" (owner decision 4, 20 Nov). */
export const HEALTH_MEMORY_SYNC = 'sync-health-memories';
export const isHealthMemory = (table: TableName, row: Record<string, unknown>) => {
  if (table !== 'memory' || !row.source || typeof row.source !== 'object') return false;
  const source = row.source as Record<string, unknown>;
  return source.health === true || source.area === 'health' || source.category === 'Body';
};
const MAX_PULL_PAGES = 50, KEEP_REJECTED = 50;
export type Repository = {
  get(id: string): Promise<DataRow | null>;
  list(options?: { includeDeleted?: boolean }): Promise<DataRow[]>;
  put(value: Record<string, unknown> & { id?: string }): Promise<DataRow>;
  remove(id: string): Promise<void>;
};
export interface WriteTransaction {
  put(table: TableName, value: Record<string, unknown> & { id?: string }): Promise<DataRow>;
  remove(table: TableName, id: string): Promise<void>;
  local(key: string, value: unknown): Promise<void>;
  readLocal<T>(key: string): Promise<T | null>;
  /** Gives a row a new id (signing in moves screen entities to the account's ids). Rows pointing at it follow. */
  move(table: TableName, from: string, to: string): Promise<void>;
  has(table: TableName, id: string): Promise<boolean>;
}
/** Columns that point at another row, which follow it when it moves. */
const pointers: Partial<Record<TableName, { column: string; table: TableName }[]>> = {
  habit: [{ column: 'habit_id', table: 'habit_log' }], person: [{ column: 'person_id', table: 'important_date' }], mission: [{ column: 'mission_id', table: 'mission_step' }],
};
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
export const object = (value: unknown): Record<string, unknown> => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Expected a JSON object');
  return value as Record<string, unknown>;
};
const quote = (name: string) => `"${name}"`;
const iso = (value: unknown) => typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
const encode = (table: TableName, value: Record<string, unknown>) => columns[table].map(c => {
  const v = value[c.key] ?? null;
  if (c.json) return v === null ? null : JSON.stringify(v);
  if (c.boolean) return v === null ? null : v ? 1 : 0;
  if (typeof v === 'number' && !Number.isFinite(v)) throw new Error(`Invalid ${table}.${c.key}`);
  if (v !== null && typeof v !== 'string' && typeof v !== 'number') throw new Error(`Invalid ${table}.${c.key}`);
  return v as SqlValue;
});
const decode = (table: TableName, raw: Record<string, unknown>): DataRow => Object.fromEntries(columns[table].map(c => [c.key, raw[c.key] == null ? null : c.json ? JSON.parse(String(raw[c.key])) : c.boolean ? Boolean(raw[c.key]) : raw[c.key]])) as DataRow;

/** Local domain writes and their outbox operation are always one SQLite transaction. */
export class LifeDataStore {
  readonly repos: Record<TableName, Repository>;
  readonly areas: Record<string, Partial<Record<TableName, Repository>>>;
  private lastStamp = 0;
  private syncFlight: Promise<SyncResult> | null = null;
  constructor(readonly driver: SqlDriver, readonly userId: string, private readonly makeId: () => string = () => globalThis.crypto.randomUUID(), private readonly clock: () => number = () => Date.now()) {
    if (!userId || userId.length > 200) throw new Error('A local user scope is required');
    this.repos = Object.fromEntries(tableNames.map(table => [table, { get: (id: string) => this.get(table, id), list: (options?: { includeDeleted?: boolean }) => this.list(table, options), put: (value: Record<string, unknown> & { id?: string }) => this.atomic(tx => tx.put(table, value)), remove: (id: string) => this.atomic(tx => tx.remove(table, id)) }])) as Record<TableName, Repository>;
    this.areas = {
      profile: { profile: this.repos.profile, body_profile: this.repos.body_profile, prefs: this.repos.prefs },
      records: { record: this.repos.record }, missions: { mission: this.repos.mission, mission_step: this.repos.mission_step },
      health: { health_sample: this.repos.health_sample, daily_health: this.repos.daily_health, baseline: this.repos.baseline },
      food: { food_entry: this.repos.food_entry, food_target: this.repos.food_target, saved_meal: this.repos.saved_meal },
      habits: { habit: this.repos.habit, habit_log: this.repos.habit_log }, learning: { learning_record: this.repos.learning_record },
      people: { person: this.repos.person, important_date: this.repos.important_date }, documents: { document: this.repos.document },
      money: { record: this.repos.record, mission: this.repos.mission },
    };
  }
  async initialise() {
    await this.driver.exec('PRAGMA foreign_keys = ON;');
    await this.driver.transaction(async tx => {
      await tx.exec('CREATE TABLE IF NOT EXISTS __drizzle_migrations (id INTEGER PRIMARY KEY AUTOINCREMENT, hash TEXT NOT NULL, created_at NUMERIC);');
      const applied = await tx.all('SELECT id FROM __drizzle_migrations WHERE created_at = ?', [migrationVersion]);
      if (!applied.length) { await tx.exec(migrationSql); await tx.run('INSERT INTO __drizzle_migrations(hash, created_at) VALUES (?, ?)', ['life-local-platform-v1', migrationVersion]); }
    });
    return this;
  }
  private stamp(after?: string) { this.lastStamp = Math.max(this.clock(), this.lastStamp + 1, after ? Date.parse(after) + 1 : 0); return new Date(this.lastStamp).toISOString(); }
  private id(value = this.makeId()) { if (!uuid.test(value)) throw new Error('Row and operation IDs must be UUIDs'); return value; }
  private check(table: string): asserts table is TableName { if (!isTable(table)) throw new Error('Unknown sync table'); }
  private async read(tx: SqlExecutor, table: TableName, id: string) {
    const rows = await tx.all(`SELECT * FROM ${quote(table)} WHERE id = ? AND user_id = ?`, [id, this.userId]);
    return rows[0] ? decode(table, rows[0]) : null;
  }
  async get(table: TableName, id: string) { this.check(table); const row = await this.read(this.driver, table, id); return row?.deleted_at ? null : row; }
  async list(table: TableName, options: { includeDeleted?: boolean } = {}) { this.check(table); return (await this.driver.all(`SELECT * FROM ${quote(table)} WHERE user_id = ?${options.includeDeleted ? '' : ' AND deleted_at IS NULL'} ORDER BY created_at, id`, [this.userId])).map(r => decode(table, r)); }
  private async writeRaw(tx: SqlExecutor, table: TableName, row: DataRow) {
    const names = columns[table].map(c => c.key);
    await tx.run(`INSERT INTO ${quote(table)} (${names.map(quote).join(',')}) VALUES (${names.map(() => '?').join(',')}) ON CONFLICT(id) DO UPDATE SET ${names.filter(n => n !== 'id' && n !== 'user_id').map(n => `${quote(n)}=excluded.${quote(n)}`).join(',')} WHERE ${quote(table)}.user_id = excluded.user_id`, encode(table, row));
  }
  private async enqueue(tx: SqlExecutor, table: TableName, row: DataRow, op: 'upsert' | 'delete') {
    if (isHealthMemory(table, row) && !await this.readLocal<boolean>(HEALTH_MEMORY_SYNC, tx)) return;
    const payload = op === 'delete' ? { id: row.id, user_id: row.user_id, created_at: row.created_at, updated_at: row.updated_at, deleted_at: row.deleted_at } : row;
    await tx.run('INSERT INTO outbox(id,user_id,table_name,row_id,op,payload,at) VALUES (?,?,?,?,?,?,?)', [this.id(), this.userId, table, row.id, op, JSON.stringify(payload), row.updated_at]);
  }
  private async put(tx: SqlExecutor, table: TableName, value: Record<string, unknown> & { id?: string }) {
    this.check(table);
    const keys = new Set(columns[table].map(c => c.key));
    if (Object.keys(value).some(key => !keys.has(key))) throw new Error(`Unknown ${table} field`);
    if (value.user_id !== undefined && value.user_id !== this.userId) throw new Error('Cross-user write refused');
    if (value.deleted_at != null && !iso(value.deleted_at)) throw new Error('Invalid deletion timestamp');
    const id = this.id(value.id);
    const owner = (await tx.all(`SELECT user_id FROM ${quote(table)} WHERE id = ?`, [id]))[0];
    if (owner && owner.user_id !== this.userId) throw new Error('Row ID unavailable');
    const previous = await this.read(tx, table, id);
    const blank = Object.fromEntries(columns[table].map(c => [c.key, null]));
    const row = { ...blank, ...previous, ...value, id, user_id: this.userId, created_at: previous?.created_at ?? this.stamp(), updated_at: previous?.updated_at ?? '', deleted_at: value.deleted_at ?? null } as DataRow;
    // Ignore metadata when deciding whether a projection produces a real domain change.
    if (previous && JSON.stringify(encode(table, { ...row, updated_at: previous.updated_at })) === JSON.stringify(encode(table, previous))) return previous;
    row.updated_at = this.stamp(previous?.updated_at);
    await this.writeRaw(tx, table, row); await this.enqueue(tx, table, row, row.deleted_at ? 'delete' : 'upsert');
    return row;
  }
  private async remove(tx: SqlExecutor, table: TableName, id: string) {
    this.check(table); const row = await this.read(tx, table, id); if (!row || row.deleted_at) return;
    const at = this.stamp(row.updated_at); const deleted = { ...row, updated_at: at, deleted_at: at };
    await this.writeRaw(tx, table, deleted); await this.enqueue(tx, table, deleted, 'delete');
  }
  async atomic<T>(body: (tx: WriteTransaction) => Promise<T>): Promise<T> {
    return this.driver.transaction(tx => body({ put: (table, value) => this.put(tx, table, value), remove: (table, id) => this.remove(tx, table, id), local: (key, value) => this.writeLocal(tx, key, value), readLocal: key => this.readLocal(key, tx), move: (table, from, to) => this.move(tx, table, from, to), has: async (table, id) => { this.check(table); return !!await this.read(tx, table, id); } }));
  }
  /**
   * Moves a row to a new id: the new row is queued for sync, and the old one goes without a tombstone, since only
   * this phone ever held it (moves happen once, at first sign-in, before anything was pushed). If the new id is
   * already here (pulled from another phone), the newer of the two is kept.
   */
  private async move(tx: SqlExecutor, table: TableName, from: string, to: string) {
    this.check(table); this.id(to);
    if (from === to) return;
    const old = await this.read(tx, table, from);
    if (!old) return;
    const there = await this.read(tx, table, to);
    const owner = (await tx.all(`SELECT user_id FROM ${quote(table)} WHERE id = ?`, [to]))[0];
    if (owner && owner.user_id !== this.userId) throw new Error('Row ID unavailable');
    if (!there || there.updated_at < old.updated_at) {
      const row = { ...old, id: to, updated_at: this.stamp(there?.updated_at && there.updated_at > old.updated_at ? there.updated_at : old.updated_at) } as DataRow;
      await this.writeRaw(tx, table, row); await this.enqueue(tx, table, row, row.deleted_at ? 'delete' : 'upsert');
    }
    for (const p of pointers[table] ?? []) {
      for (const child of (await tx.all(`SELECT * FROM ${quote(p.table)} WHERE user_id = ? AND ${quote(p.column)} = ?`, [this.userId, from])).map(r => decode(p.table, r))) {
        const row = { ...child, [p.column]: to, updated_at: this.stamp(child.updated_at) } as DataRow;
        await this.writeRaw(tx, p.table, row); await this.enqueue(tx, p.table, row, row.deleted_at ? 'delete' : 'upsert');
      }
    }
    await tx.run('DELETE FROM outbox WHERE user_id = ? AND table_name = ? AND row_id = ?', [this.userId, table, from]);
    await tx.run(`DELETE FROM ${quote(table)} WHERE id = ? AND user_id = ?`, [from, this.userId]);
  }
  /**
   * Restoring onto a phone that has nothing of its own yet: its starter rows and queued ops go, and the next pull
   * starts from the beginning, so the account's life comes back whole instead of being overwritten by a blank one.
   */
  async clearForRestore() {
    await this.driver.transaction(async tx => {
      await tx.run('DELETE FROM outbox WHERE user_id = ?', [this.userId]);
      for (const table of [...tableNames].reverse()) await tx.run(`DELETE FROM ${quote(table)} WHERE user_id = ?`, [this.userId]);
      await tx.run('DELETE FROM sync_cursor WHERE user_id = ?', [this.userId]);
      for (const key of ['projection-ids', 'projection-entities', 'projection-habit-logs', 'projection-hashes']) await tx.run('DELETE FROM local_state WHERE user_id = ? AND key = ?', [this.userId, key]);
    });
  }
  private async writeLocal(tx: SqlExecutor, key: string, value: unknown) { await tx.run('INSERT INTO local_state(user_id,key,value) VALUES (?,?,?) ON CONFLICT(user_id,key) DO UPDATE SET value=excluded.value', [this.userId, key, JSON.stringify(value)]); }
  async readLocal<T>(key: string, tx: SqlExecutor = this.driver): Promise<T | null> { const rows = await tx.all('SELECT value FROM local_state WHERE user_id = ? AND key = ?', [this.userId, key]); return rows[0] ? JSON.parse(String(rows[0].value)) as T : null; }
  async pending() { return (await this.driver.all('SELECT * FROM outbox WHERE user_id = ? ORDER BY at,id', [this.userId])).map(r => ({ id: String(r.id), user_id: String(r.user_id), table: r.table_name as TableName, rowId: String(r.row_id), op: r.op as 'upsert' | 'delete', payload: JSON.parse(String(r.payload)) as DataRow, at: String(r.at) })); }
  async sync(transport?: SyncTransport): Promise<SyncResult> {
    if (!transport) return { status: 'offline' as const, pending: (await this.pending()).length, applied: 0 };
    if (this.syncFlight) return this.syncFlight;
    this.syncFlight = this.runSync(transport).finally(() => { this.syncFlight = null; });
    return this.syncFlight;
  }
  /** Turns "Sync health memories" on (queues every health memory) or off (stops queuing them and asks the server to forget its copies). */
  async setHealthMemorySync(on: boolean) {
    await this.driver.transaction(async tx => {
      await this.writeLocal(tx, HEALTH_MEMORY_SYNC, on);
      const rows = (await tx.all('SELECT * FROM memory WHERE user_id = ?', [this.userId])).map(r => decode('memory', r)).filter(r => isHealthMemory('memory', r));
      if (on) {
        for (const row of rows) await this.enqueue(tx, 'memory', row, row.deleted_at ? 'delete' : 'upsert');
        await this.writeLocal(tx, 'forget-pending', null);
      } else {
        for (const row of rows) await tx.run('DELETE FROM outbox WHERE user_id = ? AND table_name = ? AND row_id = ?', [this.userId, 'memory', row.id]);
        const already = await this.readLocal<string[]>('forget-pending', tx) ?? [];
        await this.writeLocal(tx, 'forget-pending', [...new Set([...already, ...rows.map(r => r.id)])]);
      }
    });
  }
  private async runSync(transport: SyncTransport): Promise<SyncResult> {
    const forgetting = await this.readLocal<string[]>('forget-pending');
    if (forgetting?.length && transport.forget) {
      for (let i = 0; i < forgetting.length; i += 500) await transport.forget(this.userId, 'memory', forgetting.slice(i, i + 500));
      await this.driver.transaction(tx => this.writeLocal(tx, 'forget-pending', null));
    }
    const batch = await this.pending();
    if (batch.length) {
      const { acknowledged, rejected = [] } = await transport.push(this.userId, batch);
      const sent = new Set(batch.map(op => op.id));
      if (!Array.isArray(acknowledged) || acknowledged.some(id => !sent.has(id))) throw new Error('Invalid sync acknowledgement');
      if (!Array.isArray(rejected) || rejected.some(r => !r || !sent.has(r.id))) throw new Error('Invalid sync rejection');
      await this.driver.transaction(async tx => {
        for (const id of acknowledged) await tx.run('DELETE FROM outbox WHERE id = ? AND user_id = ?', [id, this.userId]);
        if (!rejected.length) return;
        // A refused op would be refused again forever; keep a short record of it here instead of retrying.
        const kept = await this.readLocal<(RejectedOp & { table: string; rowId: string })[]>('sync-rejected', tx) ?? [];
        for (const r of rejected) {
          const op = batch.find(o => o.id === r.id)!;
          kept.push({ id: r.id, reason: String(r.reason), table: op.table, rowId: op.rowId });
          await tx.run('DELETE FROM outbox WHERE id = ? AND user_id = ?', [r.id, this.userId]);
        }
        await this.writeLocal(tx, 'sync-rejected', kept.slice(-KEEP_REJECTED));
      });
    }
    let applied = 0;
    for (let page = 0; page < MAX_PULL_PAGES; page++) {
      const { applied: count, more } = await this.pullOnce(transport);
      applied += count;
      if (!more) break;
    }
    return { status: 'synced' as const, pending: (await this.pending()).length, applied };
  }
  private async pullOnce(transport: SyncTransport) {
    const cursorRow = (await this.driver.all('SELECT cursor FROM sync_cursor WHERE user_id = ?', [this.userId]))[0];
    const response = await transport.pull(this.userId, cursorRow?.cursor == null ? null : String(cursorRow.cursor));
    if (!Array.isArray(response.changes) || response.cursor !== null && typeof response.cursor !== 'string') throw new Error('Invalid sync response');
    let applied = 0;
    await this.driver.transaction(async tx => {
      const hardDeleted = await this.readLocal<Record<string, string>>('hard-deleted-versions', tx) ?? {};
      // Deferred FKs permit related records to arrive in either order within one pull batch.
      for (const change of response.changes) {
        this.check(change.table); if (change.op !== 'upsert' && change.op !== 'delete') throw new Error('Invalid sync operation');
        const row = object(change.row) as DataRow; this.id(row.id);
        if (row.user_id !== this.userId || !iso(row.updated_at) || !iso(row.created_at) || row.deleted_at != null && !iso(row.deleted_at)) throw new Error('Invalid remote row');
        if (Object.keys(row).some(k => !columns[change.table].some(c => c.key === k))) throw new Error('Unknown remote field');
        if (hardDeleted[`${change.table}:${row.id}`] >= row.updated_at) continue;
        const pending = await tx.all('SELECT at FROM outbox WHERE user_id = ? AND table_name = ? AND row_id = ? AND at >= ? LIMIT 1', [this.userId, change.table, row.id, row.updated_at]);
        const current = await this.read(tx, change.table, row.id);
        if (pending.length || current && current.updated_at >= row.updated_at) continue;
        const owner = (await tx.all(`SELECT user_id FROM ${quote(change.table)} WHERE id = ?`, [row.id]))[0];
        if (owner && owner.user_id !== this.userId) throw new Error('Row ID unavailable');
        if (change.op === 'delete' && !row.deleted_at) throw new Error('Missing remote tombstone');
        const blank = Object.fromEntries(columns[change.table].map(c => [c.key, null]));
        await this.writeRaw(tx, change.table, { ...blank, ...current, ...row } as DataRow);
        applied++;
      }
      await tx.run('INSERT INTO sync_cursor(user_id,cursor) VALUES (?,?) ON CONFLICT(user_id) DO UPDATE SET cursor=excluded.cursor', [this.userId, response.cursor]);
    });
    // Another page only if the server says so and the cursor moved, so a confused server can't loop us.
    const before = cursorRow?.cursor == null ? null : String(cursorRow.cursor);
    return { applied, more: response.more === true && response.cursor !== before };
  }
  async exportEverything() {
    return this.driver.transaction(async tx => {
      const data: Partial<Record<TableName, DataRow[]>> = {};
      for (const table of tableNames) data[table] = (await tx.all(`SELECT * FROM ${quote(table)} WHERE user_id = ? ORDER BY id`, [this.userId])).map(r => decode(table, r));
      const local = (await tx.all('SELECT key,value FROM local_state WHERE user_id = ?', [this.userId])).map(r => ({ key: r.key, value: JSON.parse(String(r.value)) }));
      return { version: 1, user_id: this.userId, tables: data, local };
    });
  }
  async deleteEverything() {
    return this.driver.transaction(async tx => {
      const tombstones: { table: TableName; row: DataRow }[] = [];
      for (const table of tableNames) for (const row of await tx.all(`SELECT id,user_id,created_at,updated_at FROM ${quote(table)} WHERE user_id = ?`, [this.userId])) { const at = this.stamp(String(row.updated_at)); tombstones.push({ table, row: { ...row, updated_at: at, deleted_at: at } as DataRow }); }
      const versions = await this.readLocal<Record<string, string>>('hard-deleted-versions', tx) ?? {};
      const oldDeletes = await tx.all('SELECT * FROM outbox WHERE user_id = ? AND op = ?', [this.userId, 'delete']);
      const newKeys = new Set(tombstones.map(({ table, row }) => `${table}:${row.id}`));
      await tx.run('DELETE FROM outbox WHERE user_id = ?', [this.userId]);
      for (const table of tableNames) await tx.run(`DELETE FROM ${quote(table)} WHERE user_id = ?`, [this.userId]);
      await tx.run('DELETE FROM local_state WHERE user_id = ?', [this.userId]);
      for (const op of oldDeletes) {
        if (newKeys.has(`${op.table_name}:${op.row_id}`)) continue;
        await tx.run('INSERT INTO outbox(id,user_id,table_name,row_id,op,payload,at) VALUES (?,?,?,?,?,?,?)', [String(op.id), this.userId, String(op.table_name), String(op.row_id), 'delete', String(op.payload), String(op.at)]);
      }
      for (const { table, row } of tombstones) { await this.enqueue(tx, table, row, 'delete'); versions[`${table}:${row.id}`] = row.updated_at; }
      await this.writeLocal(tx, 'hard-deleted-versions', versions);
      await this.writeLocal(tx, 'legacy-imported', true);
      return { queuedDeletes: tombstones.length + oldDeletes.filter(op => !newKeys.has(`${op.table_name}:${op.row_id}`)).length };
    });
  }
  async hasLegacyImport() { return Boolean(await this.readLocal('legacy-imported')); }
  importLegacyOnce(input: unknown, sourceKey = 'life_track_a_v17') { return importLegacyProjection(this, input, sourceKey); }
  loadProjection<T>() { return loadProjection<T>(this); }
  commitProjection(input: unknown) { return commitProjection(this, input); }
  adoptAccount(accountId: string, options: { restore: boolean }) { return adoptAccount(this, accountId, options); }
  close() { return this.driver.close(); }
}
