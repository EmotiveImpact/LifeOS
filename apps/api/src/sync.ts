import { and, asc, eq, gt, gte, inArray, ne, sql } from 'drizzle-orm';
import { getTableConfig, type PgTable } from 'drizzle-orm/pg-core';
import type { Database, Db } from './db/client';
import { phoneTables, syncOps, users } from './db/schema';

/**
 * Sync (BUILD_V26 Phase 22, SYSTEM_DESIGN §4). Phones push the ops in their outbox and pull everyone else's by cursor.
 *
 * - Push is idempotent by op id: the same op twice is stored once and acknowledged both times.
 * - Per row, the newer `updated_at` wins. A delete is a tombstone that also wins a tie, and an older edit that
 *   arrives after a delete never brings the row back.
 * - Each op is applied in its own savepoint, so one bad op is rejected without losing the rest of the batch. An op
 *   that names another person's row is refused by row-level security and rejected.
 * - The cursor is the server's `sync_ops.seq`, opaque to the phone and only ever increasing. A pull skips the
 *   caller's own device, and always moves the cursor past what it looked at.
 * - `user_id` never comes from the phone: rows are stored under the session's user, and pulled rows carry none.
 * - The log is compacted once a week per account (fix F-42): for each row only the winning op stays, so a new phone
 *   pulls one op per row rather than every edit ever made.
 */

export type TableName = keyof typeof phoneTables;
export type PushOp = { id: string; table: TableName; rowId: string; op: 'upsert' | 'delete'; payload: Record<string, unknown>; at: string };
export type Rejection = { id: string; reason: 'INVALID' | 'FORBIDDEN' };
export type PullChange = { table: TableName; op: 'upsert' | 'delete'; row: Record<string, unknown> };

export const MAX_PUSH = 500;
export const MAX_PULL = 500;

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
/** The phone's own test: an ISO instant exactly as `toISOString()` writes it, so text order is time order. */
const iso = (value: unknown): value is string => typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
const META = new Set(['id', 'user_id', 'created_at', 'updated_at', 'deleted_at']);

type Column = { name: string; type: string; notNull: boolean };
const specs = Object.fromEntries(Object.entries(phoneTables).map(([name, table]) => [name, {
  table: table as unknown as PgTable & Record<string, never>,
  columns: getTableConfig(table as unknown as PgTable).columns.map(c => ({ name: c.name, type: c.columnType, notNull: c.notNull })) as Column[],
}])) as Record<TableName, { table: PgTable & Record<string, never>; columns: Column[] }>;
/** Tables whose server copies a person can ask to be forgotten without a tombstone reaching their other phones. */
export const forgettable = new Set<TableName>(['memory']);
/** Tables whose content goes when the row is deleted: the tombstone keeps only its dates, and the earlier ops that
 * carried the words are dropped, so a forgotten memory is gone from the server, not hidden. */
export const wipedOnDelete = new Set<TableName>(['memory']);
export const isTable = (name: unknown): name is TableName => typeof name === 'string' && Object.hasOwn(specs, name);

function fits(column: Column, value: unknown): boolean {
  if (value === null || value === undefined) return !column.notNull;
  switch (column.type) {
    case 'PgJsonb': return true;
    case 'PgBoolean': return typeof value === 'boolean';
    case 'PgDoublePrecision': return typeof value === 'number' && Number.isFinite(value);
    case 'PgInteger': return typeof value === 'number' && Number.isInteger(value) && Math.abs(value) <= 2147483647;
    default: return typeof value === 'string' && value.length <= 100_000;
  }
}

/** Checks one op from the phone. Returns the op in the server's shape, or null if anything is off. */
export function readOp(raw: unknown): PushOp | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const op = raw as Record<string, unknown>;
  if (typeof op.id !== 'string' || !uuid.test(op.id) || !isTable(op.table) || (op.op !== 'upsert' && op.op !== 'delete') || !iso(op.at)) return null;
  const payload = op.payload;
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return null;
  const row = payload as Record<string, unknown>;
  if (typeof row.id !== 'string' || !uuid.test(row.id) || op.rowId !== row.id) return null;
  if (!iso(row.created_at) || !iso(row.updated_at) || (row.deleted_at != null && !iso(row.deleted_at))) return null;
  if ((op.op === 'delete') !== (row.deleted_at != null)) return null;
  const { columns } = specs[op.table];
  const known = new Map(columns.map(c => [c.name, c]));
  for (const key of Object.keys(row)) if (!known.has(key)) return null;
  // A delete carries only the row's metadata (the phone strips the content), so only an upsert needs every column.
  for (const column of columns) {
    if (META.has(column.name)) continue;
    if (op.op === 'delete' && !(column.name in row)) continue;
    if (!fits(column, row[column.name])) return null;
  }
  return { id: op.id, table: op.table, rowId: row.id, op: op.op, payload: row, at: op.at };
}

/** Postgres's "insufficient privilege" (42501), which row-level security raises, possibly wrapped by the driver. */
export function refusedByPolicy(error: unknown): boolean {
  for (let e = error as { code?: unknown; errno?: unknown; cause?: unknown } | undefined, depth = 0; e && depth < 4; e = e.cause as typeof e, depth++) {
    if (e.code === '42501' || e.errno === '42501') return true;
  }
  return false;
}

/** A transaction from `withUser`; nested `transaction()` calls on it are savepoints. */
type Tx = Database;

async function apply(tx: Tx, userId: string, op: PushOp) {
  const { table, columns } = specs[op.table];
  const t = table as unknown as Record<string, any>;
  if (op.op === 'upsert') {
    // An older edit that arrives after a delete of a row this server never held must not bring it back.
    const later = await tx.select({ seq: syncOps.seq }).from(syncOps)
      .where(and(eq(syncOps.table_name, op.table), eq(syncOps.row_id, op.rowId), eq(syncOps.op, 'delete'), gte(syncOps.at, op.payload.updated_at as string), ne(syncOps.id, op.id))).limit(1);
    if (later.length) return;
    const row = Object.fromEntries(columns.map(c => [c.name, op.payload[c.name] ?? null]));
    row.user_id = userId;
    const set = Object.fromEntries(columns.filter(c => c.name !== 'id' && c.name !== 'user_id').map(c => [c.name, sql.raw(`excluded."${c.name}"`)]));
    await tx.insert(table).values(row as never).onConflictDoUpdate({
      target: t.id, set: set as never,
      setWhere: sql`${t.updated_at} < excluded.updated_at OR (${t.updated_at} = excluded.updated_at AND excluded.deleted_at IS NOT NULL AND ${t.deleted_at} IS NULL)`,
    });
    return;
  }
  const at = op.payload.updated_at as string, deletedAt = op.payload.deleted_at as string;
  await tx.update(table).set({ updated_at: at, deleted_at: deletedAt } as never)
    .where(and(eq(t.id, op.rowId), sql`(${t.updated_at} < ${at} OR (${t.updated_at} = ${at} AND ${t.deleted_at} IS NULL))`));
  if (wipedOnDelete.has(op.table)) {
    const content = Object.fromEntries(columns.filter(c => !META.has(c.name)).map(c => [c.name, null]));
    await tx.update(table).set(content as never).where(and(eq(t.id, op.rowId), sql`${t.deleted_at} IS NOT NULL`));
    await tx.delete(syncOps).where(and(eq(syncOps.table_name, op.table), eq(syncOps.row_id, op.rowId), eq(syncOps.op, 'upsert'), sql`${syncOps.at} <= ${deletedAt}`));
  }
}

/** Stores and applies a batch of ops for one person. */
export async function push(tx: Tx, userId: string, deviceId: string | null, raw: unknown[]): Promise<{ acknowledged: string[]; rejected: Rejection[] }> {
  const acknowledged: string[] = [], rejected: Rejection[] = [];
  for (const item of raw) {
    const op = readOp(item);
    if (!op) { rejected.push({ id: typeof (item as { id?: unknown })?.id === 'string' ? (item as { id: string }).id : '', reason: 'INVALID' }); continue; }
    try {
      await tx.transaction(async sp => {
        const stored = await sp.insert(syncOps).values({ id: op.id, user_id: userId, device_id: deviceId, table_name: op.table, row_id: op.rowId, op: op.op, payload: { ...op.payload, user_id: undefined }, at: op.at })
          .onConflictDoNothing({ target: [syncOps.user_id, syncOps.id] }).returning({ seq: syncOps.seq });
        if (stored.length) await apply(sp, userId, op);
      });
      acknowledged.push(op.id);
    } catch (error) {
      if (!refusedByPolicy(error)) throw error;
      rejected.push({ id: op.id, reason: 'FORBIDDEN' });
    }
  }
  return { acknowledged, rejected };
}

/** Changes after the cursor from this person's other devices, oldest first. */
export async function pull(tx: Tx, deviceId: string | null, cursor: number, limit = MAX_PULL): Promise<{ changes: PullChange[]; cursor: string | null; more: boolean }> {
  const rows = await tx.select({ seq: syncOps.seq, device_id: syncOps.device_id, table_name: syncOps.table_name, op: syncOps.op, payload: syncOps.payload })
    .from(syncOps).where(gt(syncOps.seq, cursor)).orderBy(asc(syncOps.seq)).limit(limit + 1);
  const page = rows.slice(0, limit);
  const changes = page.filter(r => deviceId === null || r.device_id !== deviceId).map(r => {
    const { user_id: _owner, ...row } = r.payload as Record<string, unknown>;
    return { table: r.table_name as TableName, op: r.op as 'upsert' | 'delete', row };
  });
  const last = page.at(-1)?.seq;
  return { changes, cursor: last !== undefined ? String(last) : cursor > 0 ? String(cursor) : null, more: rows.length > limit };
}

/** Removes the server's copy of some rows, and their ops, without telling the person's other phones to delete them. */
export async function forget(tx: Tx, table: TableName, ids: string[]): Promise<number> {
  const t = specs[table].table as unknown as Record<string, any>;
  const gone = await tx.delete(specs[table].table).where(inArray(t.id, ids)).returning({ id: t.id });
  await tx.delete(syncOps).where(and(eq(syncOps.table_name, table), inArray(syncOps.row_id, ids)));
  return gone.length;
}

/** Ops that arrived in the last day are never compacted, so a phone part-way through a pull sees the log it started on. */
export const COMPACT_AFTER_MS = 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Compacts one person's sync log (fix F-42). For each row only the op that wins remains: the newest `updated_at`,
 * a delete winning a tie (as `apply` decides), then the latest to arrive. Every phone still ends with the same rows:
 * one whose cursor is before the winner pulls it, and one past it already has it. The losers it drops could never
 * change a phone's copy, because a phone keeps the newer edit too. Returns how many ops went.
 */
/** The row's `updated_at` inside an op's payload, whether the driver stored the payload as an object or as JSON text. */
const updatedAt = sql`coalesce(${syncOps.payload}->>'updated_at', (${syncOps.payload}#>>'{}')::jsonb->>'updated_at')`;
export async function compact(tx: Tx, now: number): Promise<number> {
  const before = new Date(now - COMPACT_AFTER_MS).toISOString();
  const gone = await tx.delete(syncOps).where(sql`${syncOps.seq} IN (
    SELECT ranked.seq FROM (
      SELECT ${syncOps.seq} AS seq, ${syncOps.received_at} AS received_at, row_number() OVER (
        PARTITION BY ${syncOps.table_name}, ${syncOps.row_id}
        ORDER BY ${updatedAt} DESC NULLS LAST, (${syncOps.op} = 'delete') DESC, ${syncOps.seq} DESC
      ) AS rank
      FROM ${syncOps}
    ) ranked
    WHERE ranked.rank > 1 AND ranked.received_at < ${before}::timestamptz
  )`).returning({ seq: syncOps.seq });
  return gone.length;
}

/** Which day of the week an account's log is compacted on, from its id. */
export const compactionDay = (userId: string) => [...userId].reduce((hash, c) => (hash * 31 + c.charCodeAt(0)) >>> 0, 7) % 7;

/**
 * The daily sweep's part (fix F-42): today's seventh of accounts, each as that person, with row-level security on.
 * One account failing doesn't stop the rest.
 */
export async function compactSyncLogs(db: Db, now: number): Promise<{ accounts: number; ops: number; failed: number }> {
  const today = Math.floor(now / DAY_MS) % 7;
  const people = await db.db.select({ id: users.id }).from(users);
  let accounts = 0, ops = 0, failed = 0;
  for (const { id } of people) {
    if (compactionDay(id) !== today) continue;
    try { ops += await db.withUser(id, tx => compact(tx, now)); accounts++; }
    catch (error) { failed++; console.error('sync compaction failed', error instanceof Error ? error.message : error); }
  }
  return { accounts, ops, failed };
}
