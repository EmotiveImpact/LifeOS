# Two questions at once can't both take the last AI call (F-45)

Branch `fix-ai-allowance-race`, from `v26-integration` at 2e59104.

## What was wrong

F-45 listed three things.

1. **The last call could be taken twice.** Two questions sent at the same moment could both read "one call left" and both run, because the allowance was read, then the model ran, and only then was the call written down.
2. **A timed-out call cost nothing in Life's books.** When a model ran out of time, nothing was written, though the provider may still charge for what it read. So the monthly spending cap undercounted.
3. **Allowances use rolling windows.** They count the last 24 hours and the last 30 days, not calendar days. This one is a choice, not a bug, so it stays open (see For Edem).

## What changed

**One call is reserved before the model runs.** Reading the allowance, checking it and reserving one call now happen in a single database transaction, and only one request per person goes through that step at a time (a Postgres advisory lock on the person). A second question sent at the same moment sees the first one's reservation, and is refused if that was the last call.

- When the answer comes back, the reservation is replaced by what was actually billed, in one transaction. A question that ends with nothing billed just removes it.
- If the server stops part-way, the reservation stops counting after ten minutes.
- A resend (F-46) reserves without using the allowance, as before.

**A call stopped part-way is written down.** If a model is stopped because the time ran out or the phone hung up, the ledger gets a `stopped` row:

- input tokens are estimated from what was sent, at four characters a token, and photos aren't counted, so it is a low estimate;
- output tokens are zero.

It counts toward the monthly spending cap, but never against the person's allowance, because they got nothing for it.

## Screenshots

None. This is server-side, and nothing on the phone changes.

## Checks

- **Tests:** `tests/api/ai.test.ts`:
  - **new:** with one call left, a second question sent while the first is still being answered is refused, and afterwards there is one billed row and no reservation left behind;
  - **new:** a reservation left by a request that never finished stops counting after ten minutes;
  - **changed:** a timed-out model still changes nothing on the person's tables. The ledger now keeps one `stopped` row with an estimated cost, and the person's one fast call for the day is still there.
- **Full suite:** 945 pass, 0 fail.
- **API typecheck:** clean.
- **The app:** unchanged.

## For Edem

- **Calendar days or rolling windows?** Allowances count the last 24 hours (the last 30 days for the top tier). The phone says "today’s AI allowance". Two options:
  - keep rolling windows and change the words to "in the last day" (recommended, because it needs nothing from the phone);
  - count from 04:00 in the person's time zone, which needs the phone to send its time zone.

  F-45 now holds only this question.
