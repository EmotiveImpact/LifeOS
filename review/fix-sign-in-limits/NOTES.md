# Sign-in codes are limited (fix F-11)

Branch `fix-sign-in-limits`, from `v26-integration` after the empty-life fix. It closes P0 item F-11 and the first part of DPIA risk 13: someone guessing, or flooding, sign-in codes.

## What changed

**Limits over an hour.** Better Auth already refused bursts (three codes a minute from one network address). These add longer limits:

| What | Limit |
|---|---|
| Codes for one email address | 5 an hour |
| Codes from one network address | 30 an hour, since a phone network or an office can put many people behind one |
| Tries for one email address | 10 an hour |
| Tries for one code | 3, then it stops working (Better Auth's own rule, now set outright) |

A six-digit code has a million possibilities, so 10 tries an hour leaves a guesser almost no chance.

**Counted in the database.** The counts live in a new table, `auth_limits`, so every server instance shares them. Better Auth's burst limits now use the same table: before, each instance kept its own count in memory, which a serverless host spreads across many instances.

**Nothing personal kept.** Each counter's key is a keyed hash of the email or network address, made with the server's secret, so the table never holds either. The daily sweep (`POST /jobs/sweep`) deletes counters older than a day.

**An alert on many failed codes.** 25 failed codes in 10 minutes across everyone, or 6 for one address in an hour, write one line to the server log:

```
auth alert {"kind":"failed-codes","scope":"everywhere","count":25,"minutes":10}
```

It names no one. For one address it adds `who`, eight characters of the keyed hash, so repeated alerts for the same address can be matched.

**What the phone says.** A refusal is a 429 with `X-Retry-After` in seconds. A short pause keeps the old words ("Too many tries. Wait a minute, then send a new code."). A pause of more than two minutes now says:

> That’s a lot of codes in a short time, so Life is pausing sign-in to keep your account safe. Try again in an hour.

**Documents.** The privacy policy's retention table, the record of processing and the DPIA's risk 13 now describe the counters. The app's About text and the website were rebuilt from the policy (`bun apps/site/build.ts`).

## Screenshots

`signin-held.light.jpg` and `signin-held.dark.jpg`: the sign-in sheet when the server holds sign-in for an hour. Taken from the release web build against a stand-in server that refuses every code request.

## Checks

- **Tests:** `bun test` with Postgres passes (852 tests). `tests/api/limits.test.ts` is new (13 tests). With a real database it covers:
  - the address, network address and guess limits;
  - counts shared between two server instances;
  - twelve requests at once against a limit of five, where exactly five get through;
  - both alerts, each written once;
  - a correct code still signing in;
  - counters holding no email or network address;
  - the sweep deleting old counters and keeping today's.
- **Typecheck:** the API and the app are clean.
- **Migration:** `apps/api/drizzle/0006_sign_in_limits.sql` creates the table and grants it to `life_api`. Run `bun run db:migrate` in `apps/api` before deploying.

## For Edem

- **The alert needs somewhere to go.** The log line is there, but nobody hears it until the host watches for it. When the server is set up (F-03), add a log alert on `auth alert` in Vercel (or a log drain), sending to your email. I've added this to the fix list entry.
- **The limits are my choice**, matching the DPIA's wording ("per address and per IP"). Tell me if you'd like them looser or tighter.

## Known limits

- **Telling people about a new sign-in** is still open (F-55, DPIA risk 13's other half). It needs the email sender (F-04).
- **Network addresses come from `x-forwarded-for`.** Vercel sets that header itself. Behind any other proxy, set Better Auth's `advanced.ipAddress` options to match, or the network limit treats every request as coming from one place.
