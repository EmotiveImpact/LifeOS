import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { bearer, emailOTP } from 'better-auth/plugins';
import type { Database } from './db/client';
import * as schema from './db/schema';

/** Who is calling. Only ever taken from the session, never from a request body (BUILD_V26 Phase 21). */
export type Principal = { userId: string };

/**
 * Sign-in as the API sees it. Better Auth sits behind this (decision 6's default) so Neon Auth could replace it
 * without touching the routes or the tests.
 */
export interface Auth {
  /** Better Auth's own routes under `/auth/*`: email codes, Apple and Google ID tokens, sign-out. */
  handler(request: Request): Promise<Response>;
  getPrincipal(request: Request): Promise<Principal | null>;
}

type IdTokenProvider = {
  clientId: string;
  clientSecret?: string;
  appBundleIdentifier?: string;
  /** Overrides for tests and local runs only. In production the provider's own keys verify the token. */
  verifyIdToken?: (token: string, nonce?: string) => Promise<boolean>;
  getUserInfo?: (tokens: { idToken?: string }) => Promise<{ user: { id: string; email: string; name?: string; emailVerified: boolean; image?: string }; data: Record<string, unknown> } | null>;
};

export type AuthOptions = {
  db: Database;
  secret: string;
  baseURL: string;
  trustedOrigins?: string[];
  /** Sends the six-digit sign-in code. The email provider is still an open owner decision; see review/phase-21/NOTES.md. */
  sendCode: (email: string, code: string) => Promise<void>;
  apple?: IdTokenProvider;
  google?: IdTokenProvider;
};

export function createAuth(options: AuthOptions): Auth {
  const providers: Record<string, IdTokenProvider> = {};
  if (options.apple) providers.apple = options.apple;
  if (options.google) providers.google = options.google;
  const auth = betterAuth({
    secret: options.secret,
    baseURL: options.baseURL,
    basePath: '/auth',
    // The phone signs in natively (Sign in with Apple, Google's SDK, an emailed code), so its scheme is trusted.
    trustedOrigins: ['life://', ...(options.trustedOrigins ?? [])],
    database: drizzleAdapter(options.db, { provider: 'pg', schema: { user: schema.users, session: schema.sessions, account: schema.accounts, verification: schema.verifications } }),
    advanced: { database: { generateId: () => crypto.randomUUID() } },
    // Apple, Google and an emailed code for the same verified address are one person, one userId.
    account: { accountLinking: { enabled: true, trustedProviders: ['apple', 'google', 'email-otp'] } },
    socialProviders: providers,
    plugins: [
      // The phone keeps the session token in its secure store and sends it as a bearer token, no cookies.
      bearer(),
      emailOTP({ otpLength: 6, expiresIn: 600, sendVerificationOTP: async ({ email, otp }) => options.sendCode(email, otp) }),
    ],
  });
  return {
    handler: request => auth.handler(request),
    async getPrincipal(request) {
      const session = await auth.api.getSession({ headers: request.headers });
      return session?.user?.id ? { userId: session.user.id } : null;
    },
  };
}
