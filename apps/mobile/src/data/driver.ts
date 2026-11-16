export type SqlValue = string | number | null | Uint8Array;
export interface SqlExecutor {
  exec(sql: string): Promise<void>;
  run(sql: string, values?: SqlValue[]): Promise<void>;
  all<T extends Record<string, unknown> = Record<string, unknown>>(sql: string, values?: SqlValue[]): Promise<T[]>;
}
/** Adapters must serialize transactions and rollback on any thrown error. */
export interface SqlDriver extends SqlExecutor {
  transaction<T>(body: (tx: SqlExecutor) => Promise<T>): Promise<T>;
  close(): Promise<void>;
}
