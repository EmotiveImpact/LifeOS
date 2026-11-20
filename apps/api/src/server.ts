import { createApi } from './app';
import { createAuth } from './auth';
import { bunDb } from './db/bun';
import { assertRowSecurity } from './db/client';
import { readEnv } from './env';

/** The local server: any Postgres (a local one or a Neon branch), with sign-in codes printed here instead of emailed. */
const env = readEnv();
const db = bunDb(env.DATABASE_URL);
await assertRowSecurity(db.db);
const origins = env.TRUSTED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);
const auth = createAuth({
  db: db.db, secret: env.BETTER_AUTH_SECRET, baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: origins,
  sendCode: async (email, code) => { console.log(`sign-in code for ${email}: ${code}`); },
  apple: env.APPLE_CLIENT_ID ? { clientId: env.APPLE_CLIENT_ID, clientSecret: env.APPLE_CLIENT_SECRET, appBundleIdentifier: env.APPLE_APP_BUNDLE_IDENTIFIER } : undefined,
  google: env.GOOGLE_CLIENT_ID ? { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } : undefined,
});
const server = Bun.serve({ port: env.PORT, fetch: createApi({ db, auth, corsOrigins: origins }) });
console.log(`life API on ${server.url}`);
