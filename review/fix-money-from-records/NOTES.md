# F-37, first part: Money from what you tell Life

Branch `fix-money-from-records`, from `v26-integration` at 47914c5. Fix list row F-37 (P1, Build).

## What was wrong

Since F-01 a real account starts empty, and every Money page was built on the sample life's figures, so a real account always saw Money's day one. That held even after someone told Life their rent: Plan said "1 thing Life knows" under Money, and Money still said "Nothing here yet". Pay day couldn't be told at all, though Money, Routines and Your details all ask for it. Bills and subscriptions lost their payee, how often and due day when filed, so nothing could add them up.

## What changed

**Talk files a pay day.** A new `payday` field in the brain (`packages/brain`): "I get paid on the 28th", "I'm paid monthly on the 25th", "my pay day is the first of the month", "my salary lands on the 15th of each month". A day of the month only. "On Fridays", "every two weeks", "the 25th of November", questions and maybes file nothing. A model can propose one too, but only a day said in the quote, beside a pay word. Confirming it sets `profile.payDay` (the `pay_day` column the data layer already had).

**Bills and subscriptions keep their details.** `proposalRecord` now copies the payee or service, amount, how often and due day onto the record (`details`), so they sync with it.

**Money for a real account** (`apps/mobile/src/state/moneyKnown.ts`, `MoneyKnownV26` in `money.tsx`). Once Life knows any of pay, pay day, rent, bills or subscriptions, Money and the Money area show:
- the headline: what's left each month after rent, bills and subscriptions (when pay is known), or what goes out, or the take-home;
- the month card: going out each month, split into rent, bills and subscriptions, and the engine's take-home estimate from the pay you said;
- coming up: pay day and bills with a due day, soonest first, with how many days away;
- what Life knows: pay, pay day, rent, each bill, and subscriptions (opens Subscriptions);
- Tell Life more (Talk) and Connect your bank (still Preview).

Nothing is guessed. Take-home is used only when pay was said. A bill said without how often counts as monthly and its row says "counted as monthly". Until Life knows something, Money keeps its day one.

**Subscriptions** shows the ones told to Life, marked in use, because Life can't see what's used and so never says "not used". A real account's page adds up what's paid ("£275.76 a year goes on two subscriptions") instead of the sample's "Everything you pay for, you use", and doesn't promise a cancel page it doesn't have. Cancelling one saves only that one onto the profile.

**Your details** shows the pay day Life was told.

The sample life (dev and review builds) is unchanged.

## Not in this part

Balances, payments, the budget, net worth, bills' history and the 30-day cash plan still need read-only Open Banking, which waits on your choice of Open Banking provider. Those pages keep their day-one state on a real account. Routines still waits: it needs routines built on the pay day and bills, which is a bigger piece.

## Checks

- 959 tests pass with Postgres (14 new in `tests/launch/money-from-records.test.ts`; two source checks in `empty-life.test.ts` updated).
- App and API typechecks are clean. iOS and Android bundles build.
- Screens checked in a web build with the sample off, from a life made by putting real sentences through Talk's rules ("I earn £30,000 a year", "I get paid on the 28th", "My rent is £1,150 a month", council tax, broadband, the TV licence, Netflix, Spotify). Pictures: `full-money.jpg`, `full-subs.jpg`, `few-money.jpg` (rent only), `full-plan.jpg`, and `contact-sheet.jpg`.

## For Edem

No decision needed for this part. An Open Banking provider is what the rest of Money needs.
