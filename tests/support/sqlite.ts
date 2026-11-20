import { Database } from 'bun:sqlite';
import type { SqlDriver, SqlExecutor, SqlValue } from '../../apps/mobile/src/data/driver';

/** An in-memory SQLite with the same one-at-a-time queue as the phone's driver, for store and sync tests. */
export function memoryDriver() {
  const db = new Database(':memory:');
  let tail = Promise.resolve<unknown>(undefined);
  const raw: SqlExecutor = {
    exec: async sql => { db.exec(sql); },
    run: async (sql, values = []) => { db.query(sql).run(...values); },
    all: async <T extends Record<string, unknown>>(sql: string, values: SqlValue[] = []) => db.query(sql).all(...values) as T[],
  };
  const queue = <T>(fn: () => Promise<T>) => { const task = tail.then(fn); tail = task.catch(() => {}); return task; };
  const driver: SqlDriver = {
    exec: sql => queue(() => raw.exec(sql)), run: (sql, values) => queue(() => raw.run(sql, values)), all: (sql, values) => queue(() => raw.all(sql, values)),
    transaction: body => queue(async () => { db.exec('BEGIN IMMEDIATE'); try { const value = await body(raw); db.exec('COMMIT'); return value; } catch (error) { db.exec('ROLLBACK'); throw error; } }),
    close: async () => { db.close(); },
  };
  return { driver, db };
}
