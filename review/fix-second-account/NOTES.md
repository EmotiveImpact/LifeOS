# A second account never merges into the first (F-43)

Branch `fix-second-account`, from `v26-integration` at 8f6f522.

## What was wrong

Life remembers which account a phone's life belongs to. When someone signed in with a different account on the same phone (a partner borrowing it, or one person with two accounts), Life moved everything already on the phone onto the new account's ids and queued it to send. The first account's meals, records, people, memories and drafts would have joined the second account on the server.

## What changed

**Signing in asks first.** When the account signing in isn't the one whose life is on the phone, Life asks before anything changes:

- "Another account is on this phone"
- "Signing in takes that account’s life off this phone, so the two never mix. What it backed up stays in its account; anything it hadn’t backed up yet goes."
- **Not now** signs the new account out again and leaves the phone as it was.
- **Use this account** goes on.

It asks on both ways in: Save your progress during setup, and Welcome back after signing out.

**Going on erases the other account's copy first.** Every row on the phone, the queue of changes waiting to send, the sync position and Life's own notes about the phone are deleted before the new account's life is pulled down (`eraseThisPhone`, the same step closing an account uses). Nothing is queued for either account, so no deletes reach the first account's server copy and nothing of the first account reaches the second. The other account's chat attachments and profile photo go with its rows.

**Nothing changes for one person.** The same account signing in again keeps everything. A phone nobody has signed in on still moves what was set up onto the account, as before.

## Screenshots

None. The question is the phone's own alert, which the web preview can't show, and the web preview keeps no account on the phone, so it never asks. Needs a check on a phone (below).

## Checks

- **Tests:** `tests/data/account-switch.test.ts` is new, with 7 tests:
  - a second account erases the first's rows and unsent changes, and says it switched;
  - the second account's own life then loads cleanly;
  - the same account signing in again keeps everything;
  - a first sign-in keeps what was set up on the phone;
  - both sign-in screens ask before joining;
  - Not now signs out and changes nothing;
  - the other account's files go too.
- **Full suite:** 930 pass, 0 fail.
- **Typecheck:** clean.
- **Bundles:** iOS and Android export.

**Check on a phone:** sign in as one account, add a meal, sign out, sign in as another. Life should ask, and after Use this account the meal should be gone and the second account's life should load. Then sign back in as the first account and confirm the meal is still there if it had synced.

## For Edem

- **The question uses the phone's own alert.** The board has no screen for this, and an alert is the smallest change that can't be missed. If you'd rather it were a Life sheet, that's a design step.
- **Unsent changes from the first account are lost.** Once the first account has signed out, the phone can no longer send for it. The alert says so. Sync runs every few seconds while signed in, so this is only what changed in the last moments before signing out.
