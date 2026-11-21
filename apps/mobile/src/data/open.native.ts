import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { tables } from './schema';
import { drizzleMigrations } from './migrations';
import { LifeDataStore } from './store';
import type { SqlDriver, SqlExecutor, SqlValue } from './driver';

const open = new Map<string, Promise<{ store: LifeDataStore; orm: ReturnType<typeof drizzle<typeof tables>> }>>();
const executor = (db: SQLite.SQLiteDatabase): SqlExecutor => ({
  exec: sql => db.execAsync(sql),
  run: async (sql, values = []) => { await db.runAsync(sql, values); },
  all: <T extends Record<string, unknown>>(sql: string, values: SqlValue[] = []) => db.getAllAsync<T>(sql, values),
});

/** A single keyed connection and one queue prevent any query from leaking into
 * another caller's transaction. Expo's exclusive helper opens a NEW unkeyed
 * connection, so it cannot be used for SQLCipher transactions here. */
function nativeDriver(db: SQLite.SQLiteDatabase, onClose: () => void): SqlDriver {
  let tail: Promise<unknown> = Promise.resolve(), closed = false;
  let closing: Promise<void> | null = null;
  const raw = executor(db);
  const enqueue = <T>(work: () => Promise<T>): Promise<T> => {
    const result = tail.then(() => { if (closed) throw new Error('Local database is closed'); return work(); });
    tail = result.catch(() => {}); return result;
  };
  return {
    exec: sql => enqueue(() => raw.exec(sql)), run: (sql, values) => enqueue(() => raw.run(sql, values)),
    all: (sql, values) => enqueue(() => raw.all(sql, values)),
    transaction: body => enqueue(async () => {
      await raw.exec('BEGIN IMMEDIATE');
      try { const result = await body(raw); await raw.exec('COMMIT'); return result; }
      catch (error) { try { await raw.exec('ROLLBACK'); } catch { /* Preserve the original failure. */ } throw error; }
    }),
    close: () => closing ?? (closing = enqueue(async () => { await db.closeAsync(); closed = true; onClose(); })),
  };
}

/**
 * Removes a local scope's database file and its key, for a review build starting from the beginning
 * (`state/freshStart.ts`). Best effort: the fresh start moves to a new scope, which never reads the old file.
 */
export async function forgetLocalData(userId: string) {
  if (!userId || open.has(userId)) return;
  const scope = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, userId);
  await SQLite.deleteDatabaseAsync(`life-${scope}.db`).catch(() => {});
  await SecureStore.deleteItemAsync(`life.database.${scope}.v1`).catch(() => {});
}

export function openLocalData(userId: string) {
  if (!userId || userId.length > 200) return Promise.reject(new Error('A local user scope is required'));
  const existing = open.get(userId); if (existing) return existing;
  const promise = initialise(userId).catch(error => { open.delete(userId); throw error; });
  open.set(userId, promise); return promise;
}
async function initialise(userId: string) {
  if (!await SecureStore.isAvailableAsync()) throw new Error('Secure key storage is unavailable; refusing plaintext storage');
  const scope = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, userId);
  const keyName = `life.database.${scope}.v1`;
  let key = await SecureStore.getItemAsync(keyName);
  if (key === null) {
    key = Array.from(await Crypto.getRandomBytesAsync(32), byte => byte.toString(16).padStart(2, '0')).join('');
    await SecureStore.setItemAsync(keyName, key, { keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY });
  }
  if (!/^[0-9a-f]{64}$/i.test(key)) throw new Error('Invalid local database key; refusing to open storage');
  const database = await SQLite.openDatabaseAsync(`life-${scope}.db`, { useNewConnection: true });
  try {
    const version = await database.getFirstAsync<Record<string, unknown>>('PRAGMA cipher_version');
    if (!version || !Object.values(version).some(value => typeof value === 'string' && value.length)) throw new Error('SQLCipher is unavailable. A native development build with useSQLCipher is required; plaintext fallback is disabled.');
    await database.execAsync(`PRAGMA key = "x'${key}'";`);
    await database.getFirstAsync('SELECT count(*) FROM sqlite_master'); // Verify the key before any migration or health write.
    await database.execAsync('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL;');
    const orm = drizzle(database, { schema: tables });
    await migrate(orm, drizzleMigrations);
    const driver = nativeDriver(database, () => open.delete(userId));
    const store = await new LifeDataStore(driver, userId, Crypto.randomUUID).initialise();
    return { store, orm };
  } catch (error) { await database.closeAsync().catch(() => {}); throw error; }
}
