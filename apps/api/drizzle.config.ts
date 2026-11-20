import { defineConfig } from 'drizzle-kit';

/** `bun run db:generate` writes SQL migrations from `src/db/schema.ts` into `drizzle/`. Row-level security is a hand-written migration alongside them. */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL ?? 'postgres://localhost/life' },
});
