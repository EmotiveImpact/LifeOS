# The sync log keeps one change per row (F-42)

Branch `fix-sync-compaction`, from `v26-integration` at 95b6190.

## What was wrong

The server keeps a log of every change a phone sends, and phones pull from it.

- The log was never trimmed, so it grew with every edit.
- A new phone, or one signing in again, pulled every edit ever made, oldest first, to rebuild the same rows.
- The DPIA's risk 8 also notes that the log held earlier versions of rows longer than needed.

## What changed

**Each row keeps only its winning change.** The daily sweep now compacts the sync log of one seventh of accounts, so each account is compacted once a week. For every row, it keeps only the change that wins:

- the newest `updated_at`;
- a delete wins a tie, as the server already decides;
- then the latest to arrive.

Every other change to that row goes, but only once it is more than a day old. That way a phone part-way through pulling sees the log it started on.

**Every phone still ends with the same rows.**

- A phone that hasn't pulled the winning change yet still gets it.
- A phone that already has it loses nothing.
- The changes that go could never alter a phone's copy, because a phone keeps the newer edit too.
- A delete stays in the log, so an older edit arriving later from a phone that was offline still can't bring the row back.

**It runs with row-level security on.** Each account is compacted as that person, through the same `withUser` as every other read and write. The API still never uses a role that bypasses row-level security. One account failing doesn't stop the rest, and the sweep's reply now includes `sync: { accounts, ops, failed }`.

**The DPIA** risk 8 now lists weekly compaction as in place. Recording Neon's restore window and a deletion log for restored backups remain open.

## Screenshots

None. This is server-side, and nothing on the phone changes.

## Checks

- **Tests:** `tests/api/sync.test.ts` has 3 new tests, run against Postgres:
  - each row keeps only its winning change: three edits, a delete, and an older edit that arrived late. Nothing from the last day goes. Afterwards a new phone pulls one change per row and ends with the same rows, a phone that had pulled only the first change ends the same, and the server's own rows are untouched;
  - a delete still stops an older edit that arrives after compaction;
  - the sweep compacts only today's seventh of accounts, each as that person.
- **Full suite:** 942 pass, 0 fail.
- **API typecheck:** clean.
- **The app:** unchanged. Its typecheck and bundles passed before this branch, and no phone file changed since.

**Found on the way.** Under the Bun SQL driver the tests use, `jsonb` is stored as a JSON string, not an object, so `payload->>'updated_at'` reads nothing there. The compaction reads the field either way. Production's Neon driver stores objects. Nothing else reads payload fields in SQL today.

## For Edem

Nothing to decide.
