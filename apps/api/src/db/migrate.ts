import { SQL } from 'bun';
import { drizzle } from 'drizzle-orm/bun-sql';
import { migrate } from 'drizzle-orm/bun-sql/migrator';

/** Applies `drizzle/` to DATABASE_URL (a local Postgres or a Neon branch), row-level security included. */
export async function migrateTo(url: string) {
  const client = new SQL(url);
  try { await migrate(drizzle({ client }), { migrationsFolder: new URL('../../drizzle', import.meta.url).pathname }); }
  finally { await client.close(); }
}

if (import.meta.main) {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');
  await migrateTo(url);
  console.log('migrated');
}
