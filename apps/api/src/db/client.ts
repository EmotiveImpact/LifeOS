import { sql } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';
import * as schema from './schema';

export type Schema = typeof schema;
export type Database = PgDatabase<PgQueryResultHKT, Schema>;

/**
 * The database as the API uses it. Reads and writes of a person's rows go through `withUser`, which opens a
 * transaction and sets `app.user_id` for it; row-level security then shows and accepts only that person's rows.
 * `db` itself is for the auth tables and shared caches, which aren't per person.
 */
export interface Db {
  db: Database;
  withUser<T>(userId: string, work: (tx: Database) => Promise<T>): Promise<T>;
}

export function scoped(db: Database): Db {
  return {
    db,
    withUser: (userId, work) => {
      if (!userId) throw new Error('withUser needs a user');
      return db.transaction(async tx => {
        await tx.execute(sql`select set_config('app.user_id', ${userId}, true)`);
        return work(tx as unknown as Database);
      });
    },
  };
}

/** Neon in production: a pooled connection over WebSockets, which supports the transactions `withUser` needs. */
export async function neonDb(url: string): Promise<Db> {
  const [{ Pool }, { drizzle }] = await Promise.all([import('@neondatabase/serverless'), import('drizzle-orm/neon-serverless')]);
  return scoped(drizzle({ client: new Pool({ connectionString: url }), schema }) as unknown as Database);
}

/**
 * Refuses to serve if the API's database role could skip row-level security (a superuser, or a role with
 * BYPASSRLS). The API must connect as `life_api`, never as the owner it migrates with.
 */
export async function assertRowSecurity(db: Database): Promise<void> {
  const result = await db.execute(sql`select (rolsuper or rolbypassrls) as bypass, current_user as role from pg_roles where rolname = current_user`);
  const rows = (Array.isArray(result) ? result : (result as { rows?: unknown[] }).rows ?? []) as { bypass: boolean; role: string }[];
  if (!rows.length || rows[0].bypass) throw new Error(`The API's database role ${rows[0]?.role ?? ''} can bypass row-level security; connect as life_api`);
}
