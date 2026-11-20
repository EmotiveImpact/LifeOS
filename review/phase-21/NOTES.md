# Phase 21 · API, Neon and accounts

Branch `phase-21-api-auth`, from `v26-integration` (05a2f57). The server is built and tested end to end on a local Postgres. Nothing has been created on Neon or any host yet: that waits on Edem's answer to the server card (decisions 5, 6 and 8).

## What was built

| Part | Where |
|---|---|
| One Web-standard handler, `createApi({ db, auth, now, corsOrigins })`, so it runs on Bun locally and on any host that speaks `fetch` | `apps/api/src/app.ts` |
| Local server (any Postgres; sign-in codes printed instead of emailed) | `apps/api/src/server.ts` |
| Production handler (Neon serverless driver, built once per instance) | `apps/api/src/handler.ts` |
| Settings, validated with zod; a missing secret stops start-up and names the setting, never its value | `apps/api/src/env.ts`, `apps/api/.env.example` |
| Sign-in: Better Auth with email codes, Apple and Google ID tokens, bearer sessions | `apps/api/src/auth.ts` |
| Server tables and migrations | `apps/api/src/db/schema.ts`, `apps/api/drizzle/` |
| Sealing for wearable and bank tokens (AES-256-GCM) | `apps/api/src/seal.ts` |
| Phone sign-in over plain `fetch`; session in SecureStore | `apps/mobile/src/services/account.ts`, `sessionStore*.ts` |
| CI: the API's typecheck and tests against a throwaway Postgres 16.15 | `.github/workflows/ci.yml` |

### Routes

- `GET /health` is open. `/auth/*` is Better Auth's own routes.
- Everything else checks the session **before** routing and answers 401 without one, so an unknown path reveals nothing.
- `GET /me` returns `{ userId }`. `POST /devices` registers a phone (`id`, `platform`, `name`). Any `user_id` in a body is ignored; identity only ever comes from the session.
- Sync routes come in Phase 22.

### Tables

- Every phone table in `apps/mobile/src/data/schema.ts` is mirrored with the same names and columns. JSON becomes `jsonb`, booleans `boolean`, reals `double precision`, and timestamps stay ISO text as on the phone, so a row travels unchanged. `tests/api/schema.test.ts` fails if the two drift.
- Every user row has `user_id` (deleting a user deletes their rows) and a `deleted_at` tombstone.
- Server only: `users`, `sessions`, `accounts`, `verifications` (Better Auth), `devices`, `sync_ops` (the opaque, monotonic sync cursor is its `seq`), `oauth_tokens` (sealed), `lesson_cache`, `scene_cache` (nothing personal), `ai_usage` (the cost ledger).
- `memory` is mirrored from the phone with `embedding` as `jsonb` for now. Edem chose on 20 November to own the memory layer rather than use mem0, so Phase 25 adds pgvector and rewrites that table.

### Row-level security

- `drizzle/0001_row_level_security.sql` turns on **and forces** row-level security on every user table, with one policy: `user_id = current_setting('app.user_id', true)`.
- `withUser(userId, work)` sets `app.user_id` inside a transaction, so it can't leak to the next request on a pooled connection.
- The API connects as `life_api` (no superuser, no BYPASSRLS) and **refuses to start** if its role could bypass the policies (`assertRowSecurity`).

### Sign-in

- **Email:** the phone asks for a code, the server emails six digits (10 minutes), and the code signs in or creates the account.
- **Apple and Google:** the phone sends the ID token from the native sheet and the server verifies it with Apple's or Google's keys.
- The same verified email through Apple, Google or a code is one person with one `userId` (account linking).
- Sessions are bearer tokens from the `set-auth-token` header, never cookies. The phone keeps the token in SecureStore. The web preview keeps it in memory only, so a refresh signs out.
- Browsers may call only from `TRUSTED_ORIGINS`; the CORS headers expose `set-auth-token` and never allow credentials. Phones send no Origin and need no CORS (tested).

### The phone

- **The sign-in sheet** now has three steps:
  - the ways in;
  - "Your email" and "Send me a code";
  - "Check your email" with a six-digit code field. The keyboard offers the code from Mail.
- Wrong codes, too many tries and no connection each get one plain line. Screens: `signin-*.light.png` and `signin-*.dark.png` here, and `/mnt/project-files/v26-review/phase-21/signin-sheet.jpg`.
- After sign-in the phone registers itself (`POST /devices`) with a random device id kept in SecureStore.
- **Welcome back** (signed out) uses the same service. If Apple or Google isn't available yet, it opens the sign-in sheet for email.
- **With no API configured**, sign-in stays a local preview as before: dev builds, screenshots, and `EXPO_PUBLIC_LIFE_API_URL` unset. The code step accepts any six digits there.
- `setBrainSessionProvider` now gets the real session, so the brain's cloud calls carry it once the API is live.

## Checks

- `TEST_DATABASE_URL=… bun test tests/api/`: **25 pass** (schema parity, row-level security, sign-in, browsers, settings). Without a database the 17 database tests skip and the rest pass.
- Root `bun test`: everything else unchanged and passing.
- `apps/api`: `bun run typecheck` clean. `apps/mobile`: `npx tsc --noEmit -p .` clean, plus iOS and Android `expo export`.
- **End to end in a browser:** local API on a migrated database as `life_api`, and the app's web dev server pointed at it. The flow was email, then a wrong code (400, plain line shown), then the right code from the server log. Results: 200, device registered (201), sheet closed, and `devices` holds the row under the new user.
- `drizzle-kit generate` reports no drift between `schema.ts` and the migrations.

## Run it locally

```sh
cd apps/api && bun install
cp .env.example .env                     # fill DATABASE_URL (as life_api), BETTER_AUTH_SECRET, TOKEN_KEY
DATABASE_URL=<owner url> bun run db:migrate
bun run dev                              # http://127.0.0.1:8787, sign-in codes print here
# the app: EXPO_PUBLIC_LIFE_API_URL=http://127.0.0.1:8787 npx expo start
```

## Waiting on Edem

1. **The server card** (decisions 5, 6, 8). The plan's defaults are Vercel functions, Better Auth and a Neon project in London with a branch per phase. When answered: create the Neon project and the `phase-21` branch, create the `life_api` role, migrate, and run the tests against it.
2. **An email service for sign-in codes** (for example Resend or Postmark). Until then the production handler refuses to send codes, and the local server prints them.
3. **Apple and Google accounts.** Sign in with Apple needs an Apple Developer account and a Services ID. Google needs OAuth client IDs for iOS and Android. Both need values in the host's settings.
4. **Two phone modules for the native Apple and Google sheets**: `expo-apple-authentication` (an Expo SDK 58 module) and a Google sign-in module. They aren't in the plan's library list, so they aren't installed. The server side is done and tested; the phone has a hook for them (`setIdTokenSource`). Until then a live account signs in by email.
5. **Sign out and "your account" in Settings** have no board design yet.
6. **CI runs** once the repository is public (Edem's answer on 20 November).

## Notes for later phases

- **Phase 22 (sync).** Add a `consents` table on the phone and server (kind, version, scope, given_at, withdrawn_at), as Phase 20 asked, and sync it. The phone needs a second migration, since the first is already on installed phones. Edem's answer 4 belongs here too: health memories stay on the phone unless the person says yes to syncing them, stated plainly.
- **Phase 24 (AI)** fills `ai_usage`. **Phase 25** replaces `memory.embedding` with pgvector.
- Better Auth is pinned at 1.7.25 to match the 14 November reference pin; 1.7.27 came out on 20 November.
