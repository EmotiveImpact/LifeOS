import { SQL } from 'bun';
import { drizzle } from 'drizzle-orm/bun-sql';
import * as schema from './schema';
import { scoped, type Database, type Db } from './client';

/** Any Postgres through Bun's own client: the local server and the tests. Production on Neon uses `neonDb`. */
export function bunDb(url: string): Db & { close(): Promise<void> } {
  const client = new SQL(url);
  return { ...scoped(drizzle({ client, schema }) as unknown as Database), close: () => client.close() };
}
