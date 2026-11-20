# Phase 23 · Files, push and your data

Branch `phase-23-files-push-account`, from `v26-integration` after the nav bar and Talk fixes. All of it is tested against the real API, Better Auth and Postgres, with a stand-in bucket that checks signatures and expiry the way S3 and R2 do. It goes live once the server is hosted and a bucket exists.

## What was built

**Files** (`apps/api/src/storage.ts`, `apps/api/src/account.ts`)
- `POST /files/sign` gives a signed link that works for five minutes.
  - Upload: `{ action: 'upload', kind, contentType, keep? }`. The kinds are `meal_photo`, `letter` and `document`; the types are JPEG, PNG, HEIC, WebP and PDF.
  - Read: `{ action: 'read', id }`.
- The server chooses every key: `tmp/<user>/<id>`, or `keep/<user>/<id>` when the person keeps the file. A key or owner in the request is ignored.
- An upload link only accepts the content type it was signed for.
- Another person's file looks exactly like one that doesn't exist (404). Row-level security on the new `files` table makes sure of that.
- `POST /files/delete` removes a file once it has been read.
- A file that isn't kept goes a day later anyway. Each person's leftovers are tidied on their next file request, and the bucket's `tmp/` lifecycle rule is the backstop.
- The signer is plain Web Crypto, so there is no SDK. It reproduces AWS's own documented example signature exactly.

**Push**
- `POST /push/register` takes `{ device, token }` and accepts Expo push tokens only.
- It works only on the caller's own phones. `null` turns push off.
- On the phone, `registerPushToken()` is ready, but nothing calls it yet. The token comes from `expo-notifications`, which arrives with Phase 29's notifications.

**Your data**
- `GET /account/export` downloads one JSON file containing:
  - the account and its sign-in methods;
  - every phone table's rows, tombstones included;
  - phones, files (details only), AI usage and connected services.
- Sealed wearable and bank tokens are never exported.
- `POST /account/delete` needs `{ confirm: 'DELETE' }`. It then:
  1. ends every session at once, on every phone;
  2. stops push;
  3. closes the account.
- **Signing in again within 30 days keeps everything.**
- After 30 days, `POST /jobs/sweep` hard deletes everything: the files in storage first, then the person, which removes every row by cascade. That covers memories, health, sync history, phones and files.
- The sweep needs its own secret (`JOBS_SECRET`), and the host's scheduler calls it daily. The local server sweeps hourly by itself.
- New settings, all optional: `STORAGE_*`, `ACCOUNT_GRACE_DAYS` (default 30; 0 deletes at once) and `JOBS_SECRET`.
- A blank line in `.env` counts as unset, so an empty `ACCOUNT_GRACE_DAYS=` can never mean "delete at once".

**In the app** (`screens/v26/settings.tsx`, `services/account.ts`)
- **Download my data**: when signed in, the file holds this phone's copy and the account's copy. If the server can't be reached, the file says so and still contains the phone's copy.
- **Delete account**: when signed in, the server closes the account first.
  - The phone changes nothing until the server says yes. Offline, it says nothing was deleted.
  - Once closed, the phone is erased without queueing deletes (`store.eraseThisPhone`). Erasing in the old way queues a delete for every row, so signing back in within the 30 days would have emptied the account the person chose to keep. A test now covers this.
- With no account, everything lives on the phone, so the screen no longer promises a grace period it can't keep. It says "It can't be undone" and "Only on this phone". The sample build keeps the board's copy.
- The armed line now says how to change your mind: "Your account closes today. Sign in again within 30 days to keep it."

## For Edem to decide

1. **R2 or S3.** Both work unchanged. R2 has no download fees, which suits photos. Whichever you choose:
   - make one private bucket;
   - give the bucket a rule that expires `tmp/` after 1 day;
   - put the five `STORAGE_*` values in the host.
2. **Grace period.** BUILD_V26 says "hard delete". The board's delete screen promises 30 days to change your mind. I built both: the account closes at once, then the hard delete follows 30 days later. If you'd rather delete at once, set `ACCOUNT_GRACE_DAYS=0` and change the screen's words.
3. **The daily sweep** needs the host's scheduler (Vercel Cron or similar). This waits on the server card.
4. **Refund wording.** The screen says "Nothing kept, unless a refund is owed". With RevenueCat and the App Store, refunds go through Apple and Google, so this line may want new words when billing lands.

## Checks

- `bun test` with `TEST_DATABASE_URL`: **529 pass, 0 fail**.
  - `tests/api/files-account.test.ts` has 13 tests, including the four the plan names: `signed URLs expire`, `a user can't sign another user's file`, `export contains every table's rows for that user only`, and `delete removes rows, files and memories, and the session ends`.
  - It also covers keep-or-delete after reading, push on your own phones only, signing back in within 30 days, and an immediate delete with no grace period.
  - A mutation check confirmed the tests fail when any of these is broken: ending sessions, removing files, the sign-in-keeps-it hook, keeping tokens out of the export, or the file tidy.
  - A new phone test covers erasing after the account closes. A new settings test covers blank `.env` lines.
- The migration test now reads every migration, so `files` must have row-level security.
- Typecheck is clean for the app and the API. The iOS, Android and web bundles export.
- Screenshots: `delete-screens.jpg` shows, in order, with an account (light, dark) and with no account (typed, untyped).

## Known limits

- The export lists files but doesn't contain them. A kept letter is fetched from the app with a fresh link.
- The export leaves out the sync change log (`sync_ops`): it holds earlier versions of the same rows. It is still deleted with the account.
- Temporary files are tidied per person when they next use files, plus the bucket rule. There is no cross-account sweep, because row-level security hides other people's files from the API, and that is deliberate.
- When the phone is signed in, a closed account's session token is forgotten. If the token had already expired, the screen asks the person to sign in again before deleting.
