import { SQL } from 'bun';
import { bunDb } from '../../apps/api/src/db/bun';
import { migrateTo } from '../../apps/api/src/db/migrate';

/**
 * A throwaway Postgres database per test file: migrated as the owner, then used through the `life_api` role,
 * which can't bypass row-level security, exactly as in production. Set TEST_DATABASE_URL to a Postgres the tests
 * may create databases and roles on (CI runs one; locally any Postgres 16 works). Without it the database tests skip.
 */
export const adminUrl = process.env.TEST_DATABASE_URL;

export async function freshDatabase() {
  if (!adminUrl) throw new Error('TEST_DATABASE_URL is not set');
  const name = `life_test_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
  const admin = new SQL(adminUrl);
  await admin.unsafe(`CREATE DATABASE ${name}`);
  await admin.unsafe(`DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'life_api') THEN CREATE ROLE life_api LOGIN PASSWORD 'life_api_test' NOSUPERUSER NOBYPASSRLS; END IF; END $$;`);
  const ownerUrl = withDatabase(adminUrl, name);
  await migrateTo(ownerUrl);
  const apiUrl = withDatabase(adminUrl, name, 'life_api', 'life_api_test');
  const db = bunDb(apiUrl);
  return {
    db,
    ownerUrl,
    async drop() {
      await db.close();
      await admin.unsafe(`DROP DATABASE IF EXISTS ${name} WITH (FORCE)`);
      await admin.close();
    },
  };
}

function withDatabase(url: string, database: string, user?: string, password?: string) {
  const u = new URL(url);
  u.pathname = `/${database}`;
  if (user) { u.username = user; u.password = password ?? ''; }
  return u.toString();
}

/** A user row straight into the auth table (no row-level security there), for tests that don't need sign-in. */
export async function makeUser(db: Awaited<ReturnType<typeof freshDatabase>>['db'], email: string) {
  const { users } = await import('../../apps/api/src/db/schema');
  const id = crypto.randomUUID();
  await db.db.insert(users).values({ id, email, name: email.split('@')[0], emailVerified: true });
  return id;
}
