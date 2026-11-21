import { purgeClosedAccounts } from './account';
import { createApi } from './app';
import { createAuth } from './auth';
import { bunDb } from './db/bun';
import { assertRowSecurity } from './db/client';
import { billingFromEnv, readEnv, wearableApps } from './env';
import { pruneLimits } from './limits';
import { sealer } from './seal';
import { modelsFromEnv } from './models/registry';
import { storageFromEnv } from './storage';

/** The local server: any Postgres (a local one or a Neon branch), with sign-in codes printed here instead of emailed. */
const env = readEnv();
const db = bunDb(env.DATABASE_URL);
await assertRowSecurity(db.db);
const origins = env.TRUSTED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);
const auth = createAuth({
  db: db.db, secret: env.BETTER_AUTH_SECRET, baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: origins,
  sendCode: async (email, code) => { console.log(`sign-in code for ${email}: ${code}`); },
  limits: {},
  apple: env.APPLE_CLIENT_ID ? { clientId: env.APPLE_CLIENT_ID, clientSecret: env.APPLE_CLIENT_SECRET, appBundleIdentifier: env.APPLE_APP_BUNDLE_IDENTIFIER } : undefined,
  google: env.GOOGLE_CLIENT_ID ? { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } : undefined,
});
const storage = storageFromEnv(env);
const server = Bun.serve({ port: env.PORT, fetch: createApi({ db, auth, corsOrigins: origins, storage, graceDays: env.ACCOUNT_GRACE_DAYS, jobsSecret: env.JOBS_SECRET, ai: { models: modelsFromEnv(env) }, wearables: { apps: wearableApps(env), publicUrl: env.PUBLIC_URL ?? env.BETTER_AUTH_URL, sealer: await sealer(env.TOKEN_KEY), stateKey: env.TOKEN_KEY }, billing: billingFromEnv(env) }) });
// Locally the server runs its own hourly sweep; a hosted server's scheduler calls POST /jobs/sweep instead.
setInterval(() => { void purgeClosedAccounts(db, storage, Date.now()).then(() => pruneLimits(db.db, Date.now())).catch(error => console.error('sweep failed', error)); }, 60 * 60 * 1000);
console.log(`life API on ${server.url}${storage ? '' : ' (no file storage set up)'}`);
