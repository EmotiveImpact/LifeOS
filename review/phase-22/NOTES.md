# Phase 22 · Sync

Branch `phase-22-sync`, from `v26-integration` after Phase 21 and the price change. Phones push their outbox to the life API and pull the account's other changes by cursor. Everything is tested against the real API and Postgres. It goes live once the server is hosted (the server card) and sign-in has an email service.

## The rules

| Rule | How |
|---|---|
| Push is idempotent | An op's id is unique per person (`sync_ops_user_op`). Pushing it again stores nothing and is acknowledged again. |
| Newer edit wins | Each row keeps the larger `updated_at`, whatever order ops arrive in. Phones apply the same rule to what they pull. |
| Deletes win | A tombstone wins a tie. An older edit arriving after a delete never brings the row back, even if the server never held the row. |
| Other people's rows | Row-level security refuses the op. It is rejected on its own; the rest of the batch still lands, and nothing of it is kept. |
| Cursor | `sync_ops.seq`: opaque to the phone and only ever increasing. A pull skips the caller's own device (`life-device` header) but still moves past it. Pages hold 500 ops, and the phone keeps asking while `more` is true. |
| Identity | Rows are stored under the session's user. Pulled rows carry no `user_id`; the phone gives them its local scope. |
| Bad ops | Each op is checked against the server's columns (types, required fields, exact ISO times, row id matches the payload). A bad op is rejected alone. Rejected ops leave the phone's outbox, and the last 50 are kept in `sync-rejected` for support, so they aren't retried forever. |

## What was built

- **Server** (`apps/api/src/sync.ts`, routes in `app.ts`):
  - `POST /sync/push` (at most 500 ops) answers `{ acknowledged, rejected }`.
  - `GET /sync/pull?cursor=&limit=` answers `{ changes, cursor, more }`.
  - `POST /sync/forget` removes the server's copy of health memories and their ops, without a tombstone reaching other phones.
  - Migration `0002_sync.sql` makes op ids unique per person and indexes ops by row.
- **Phone transport** (`apps/mobile/src/data/httpTransport.ts`): bearer session, device header, batches of 200. If a later batch fails, the batches already stored still count.
- **Phone store** (`data/store.ts`): rejected ops, paging, the health-memory switch, and two new jobs.
  - `move` gives a row a new id, and rows that point at it follow.
  - `clearForRestore` clears a phone before a restore.
- **The same thing has the same id on every phone** (`data/ids.ts`, `data/projection.ts`):
  - Screen entities are keyed like `profile:main` or `food_entry:<meal id>`. Their ids come from hashing that key with the account id, so two phones' copies merge instead of doubling.
  - Signing in moves a phone's existing rows to the account's ids (`adoptAccount`).
- **Saving only what changed.** The screen saves its whole state at once. The projection now writes only entities that changed since its last save, so a stale screen can't undo a newer edit pulled from another phone (`projection-hashes`). A mutation check confirmed the two-phone test fails without this.
- **Settings travel with the account.** Choices, flags and "setup done" now live in the prefs row, so a restored phone has them. Drafts, proposals and conversations stay on the phone they were made on.
- **In the app** (`state/SeedProvider.tsx`):
  - Sync runs when the app opens, when it comes back to the front, and 3 seconds after each change. The network part runs beside the local saves, never in their queue.
  - When sync brings something in, the screen reloads. If the person has unsaved changes, it waits until they are saved.
- **Sign-in:**
  - **Save your progress** (during setup or later) merges this phone into the account.
  - **Welcome back** restores the account onto the phone. If the account has nothing yet, setup starts as usual.

## Health memories (Edem's answer 4)

- Memories marked as Body (or `source.health`) don't enter the outbox while **Sync health memories** is off, and it is off by default.
- Turning it on queues every health memory. Turning it off stops queuing them and asks the server to forget its copies. The phone keeps its own.
- The switch has an API (`store.setHealthMemorySync`) but **no screen yet**. It belongs next to the AI consent switch under "What life can reach", and both are design first, as Edem asked. The wording to use is in `ai-system/life-ai-system.md`.

## Checks

- `bun test` with `TEST_DATABASE_URL`: **514 pass, 0 fail**. That includes:
  - `tests/api/sync.test.ts`: 13 server tests;
  - `tests/api/sync-phones.test.ts`: 5 tests with two real phone stores through the real API;
  - `tests/data/sync.test.ts`: 10 phone-side tests.
- Without a database the 40 database tests skip, and 482 pass.
- Every test the plan asked for is covered: the same op twice, the cursor skipping the caller's own ops, newer edit wins on both phones, delete beats older edit, another person's row rejected, outbox drains only after acknowledgement, and resuming after a dropped connection without duplicates.
- Typecheck clean for the app and the API (the API's includes the phone store via the tests). iOS, Android and web bundles export. A web smoke walk (Today, sign-in, Settings, Memories) found no errors.

## Known limits and open items

- **The web preview doesn't sync**: it keeps its state in browser storage, not the phone's database.
- **The op log grows.** A new phone pulls from the beginning. Compaction (snapshotting rows and trimming old ops) can come once accounts are large.
- **Signing in to a second account on the same phone** would merge the first account's rows into it. Switching accounts should clear the phone first. Not designed yet.
- **Merging during setup.** If someone sets up again on a reinstalled phone and then saves progress into an account that already has a life, the two merge entity by entity, newer edit winning. Welcome back is the clean restore path.
- **Consents table.** Phase 20 asked for one. Consent records now sync inside the prefs row's choices, which covers restore. A dedicated table can still come with Phase 23's export and delete.
- Live use needs the server card answered (Neon project and host), an email service for codes, and Phase 21's Apple and Google items.
