import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { APIError, createAuthMiddleware, getIP, isAPIError } from 'better-auth/api';
import { bearer, emailOTP } from 'better-auth/plugins';
import { eq } from 'drizzle-orm';
import type { Database } from './db/client';
import * as schema from './db/schema';
import { consume, limitKey, limitStorage, logAlert, signInLimits, type LimitRule, type SignInAlert } from './limits';

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
  /**
   * Sign-in limits over an hour, per email address and per network address, with alerts on many failed codes
   * (`src/limits.ts`). Production always passes this. Without it, Better Auth keeps only its own burst limits.
   */
  limits?: { now?: () => number; alert?: (alert: SignInAlert) => void };
};

const SEND = '/email-otp/send-verification-otp', VERIFY = '/sign-in/email-otp';
const emailOf = (body: unknown) => typeof (body as { email?: unknown })?.email === 'string' ? (body as { email: string }).email.trim().toLowerCase() : '';

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
    // Signing in again during the grace period after "Delete account" keeps the account (Phase 23).
    databaseHooks: { session: { create: { after: async session => { await options.db.delete(schema.accountClosures).where(eq(schema.accountClosures.user_id, session.userId)); } } } },
    plugins: [
      // The phone keeps the session token in its secure store and sends it as a bearer token, no cookies.
      bearer(),
      emailOTP({ otpLength: 6, expiresIn: 600, allowedAttempts: 3, sendVerificationOTP: async ({ email, otp }) => options.sendCode(email, otp) }),
    ],
    ...(options.limits ? signInGuards(options.db, options.secret, options.limits) : {}),
  });
  return {
    handler: request => auth.handler(request),
    async getPrincipal(request) {
      const session = await auth.api.getSession({ headers: request.headers });
      return session?.user?.id ? { userId: session.user.id } : null;
    },
  };
}

/**
 * Fix F-11: Better Auth's burst limits move from one server's memory into Postgres, and two hooks add the hourly
 * limits and the alerts. A refusal is a 429 with `X-Retry-After` in seconds, which the phone reads.
 */
function signInGuards(db: Database, secret: string, limits: NonNullable<AuthOptions['limits']>) {
  const now = limits.now ?? Date.now, alert = limits.alert ?? logAlert;
  const count = async (kind: string, value: string, rule: LimitRule) => consume(db, await limitKey(secret, kind, value), rule, now());
  const refuse = (retryAfter: number | null) => {
    throw new APIError('TOO_MANY_REQUESTS', { message: 'Too many sign-in codes for now. Try again later.', code: 'TOO_MANY_CODES' }, { 'X-Retry-After': String(retryAfter ?? 3600) });
  };
  return {
    rateLimit: { enabled: true, customStorage: limitStorage(db, secret, now) },
    hooks: {
      before: createAuthMiddleware(async ctx => {
        if (ctx.path !== SEND && ctx.path !== VERIFY) return;
        const email = emailOf(ctx.body);
        if (!email) return;
        if (ctx.path === SEND) {
          const network = (ctx.request ? getIP(ctx.request, ctx.context.options) : null) ?? 'unknown';
          const [address, net] = [await count('codes-address', email, signInLimits.codesPerAddress), await count('codes-network', network, signInLimits.codesPerNetwork)];
          if (!address.allowed || !net.allowed) refuse(Math.max(address.retryAfter ?? 0, net.retryAfter ?? 0));
        } else {
          const guesses = await count('guesses-address', email, signInLimits.guessesPerAddress);
          if (!guesses.allowed) refuse(guesses.retryAfter);
        }
      }),
      after: createAuthMiddleware(async ctx => {
        if (ctx.path !== VERIFY || !isAPIError(ctx.context.returned)) return;
        const returned = ctx.context.returned as { statusCode?: number };
        // Only a code that didn't work counts, not a refusal from the limits above.
        if (returned.statusCode === 429) return;
        const email = emailOf(ctx.body);
        const everywhere = await count('failed', 'everywhere', signInLimits.failedEverywhere);
        if (everywhere.count === signInLimits.failedEverywhere.max) alert({ kind: 'failed-codes', scope: 'everywhere', count: everywhere.count, minutes: signInLimits.failedEverywhere.window / 60 });
        if (!email) return;
        const key = await limitKey(secret, 'failed-address', email);
        const mine = await consume(db, key, signInLimits.failedForAddress, now());
        if (mine.count === signInLimits.failedForAddress.max) alert({ kind: 'failed-codes', scope: 'address', count: mine.count, minutes: signInLimits.failedForAddress.window / 60, who: key.slice(-8) });
      }),
    },
  };
}
