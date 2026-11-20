import { createApi } from './app';
import { createAuth } from './auth';
import { assertRowSecurity, neonDb } from './db/client';
import { readEnv } from './env';

/**
 * The production handler: Neon, Better Auth and the routes, built once per server instance from the environment.
 * Any host that calls `fetch(request)` can serve it (Vercel functions by default, decision 5).
 */
let built: Promise<(request: Request) => Promise<Response>> | null = null;

export function handler(request: Request): Promise<Response> {
  built ??= (async () => {
    const env = readEnv();
    const db = await neonDb(env.DATABASE_URL);
    await assertRowSecurity(db.db);
    const origins = env.TRUSTED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);
    const auth = createAuth({
      db: db.db, secret: env.BETTER_AUTH_SECRET, baseURL: env.BETTER_AUTH_URL,
      trustedOrigins: origins,
      sendCode: async () => { throw new Error('Email sign-in codes need an email provider (open owner decision)'); },
      apple: env.APPLE_CLIENT_ID ? { clientId: env.APPLE_CLIENT_ID, clientSecret: env.APPLE_CLIENT_SECRET, appBundleIdentifier: env.APPLE_APP_BUNDLE_IDENTIFIER } : undefined,
      google: env.GOOGLE_CLIENT_ID ? { clientId: env.GOOGLE_CLIENT_ID, clientSecret: env.GOOGLE_CLIENT_SECRET } : undefined,
    });
    return createApi({ db, auth, corsOrigins: origins });
  })();
  return built.then(serve => serve(request));
}
