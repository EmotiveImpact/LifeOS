import { z } from 'zod';

/**
 * The API's settings, read once at start-up. A missing or malformed secret stops the server before it takes a
 * request, and the error names the setting, never its value. Secrets live only in the host's environment
 * (BUILD_V26 global rules); the phone never sees any of these.
 */
/** An empty line in `.env` (`NAME=`) means unset, never an empty value: `ACCOUNT_GRACE_DAYS=` must not mean 0. */
const unsetIfBlank = <T extends z.ZodType>(inner: T) => z.preprocess(v => (v === '' ? undefined : v), inner);

const schema = z.object({
  DATABASE_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32, 'at least 32 characters'),
  BETTER_AUTH_URL: z.string().url(),
  /** Seals wearable and bank tokens at rest: 32 random bytes, base64. */
  TOKEN_KEY: z.string().refine(v => { try { return atob(v).length === 32; } catch { return false; } }, '32 bytes, base64'),
  /** Origins allowed to call sign-in, comma separated. The phone's scheme is always allowed. */
  TRUSTED_ORIGINS: z.string().default(''),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_CLIENT_SECRET: z.string().optional(),
  APPLE_APP_BUNDLE_IDENTIFIER: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  /** Object storage for meal photos and letters (R2 or S3). Without these, file routes answer 503. */
  STORAGE_ENDPOINT: unsetIfBlank(z.string().url().optional()),
  STORAGE_BUCKET: z.string().optional(),
  STORAGE_REGION: z.string().optional(),
  STORAGE_ACCESS_KEY_ID: z.string().optional(),
  STORAGE_SECRET_ACCESS_KEY: z.string().optional(),
  /** Days between "Delete account" and the hard delete. The delete screen promises 30. */
  ACCOUNT_GRACE_DAYS: unsetIfBlank(z.coerce.number().int().min(0).max(90).default(30)),
  /** The scheduler's secret for `POST /jobs/sweep`. Without it the sweep route stays closed. */
  JOBS_SECRET: unsetIfBlank(z.string().min(32, 'at least 32 characters').optional()),
  /** Model providers (decision 7). Each key switches on that provider's models in `src/models/registry.ts`. */
  ANTHROPIC_API_KEY: unsetIfBlank(z.string().min(10).optional()),
  OPENAI_API_KEY: unsetIfBlank(z.string().min(10).optional()),
  /** Gemini API key: trial data only. Real people's data goes through Google Cloud's EU endpoint (owner decision). */
  GEMINI_API_KEY: unsetIfBlank(z.string().min(10).optional()),
  PORT: z.coerce.number().int().positive().default(8787),
});

export type Env = z.infer<typeof schema>;

export function readEnv(source: Record<string, string | undefined> = process.env): Env {
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const names = [...new Set(parsed.error.issues.map(issue => `${issue.path.join('.')} (${issue.message})`))];
    throw new Error(`The API can't start. Missing or invalid settings: ${names.join(', ')}`);
  }
  return parsed.data;
}
