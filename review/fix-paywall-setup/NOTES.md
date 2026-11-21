# Setup ends on Life Plus (F-20)

Branch `fix-paywall-setup`, from `v26-integration` at e56b172. Edem chose where a new person meets Life Plus on 21 Nov 2026 at 03:45: at the end of setup.

## What changed

**Where setup ends.** After "Save your progress" is answered, setup goes to Life Plus as a full screen, then on to "Start with two minutes" and Today. Life Plus comes after sign-in so the store purchase is tied to the account from the start.

**With billing on, there is no way past it except a plan.** The full screen has no Back or Skip, the Android back button does nothing, and the screen can't be swiped away. What it does have:

- Subscribe, or Start free trial when the store offers this person one
- Restore purchases
- Terms and Privacy
- Your data, which opens the screen where you can download everything or delete your account. Apple asks that deleting an account is always possible, so it stays one tap away.

A started plan goes on to the first move.

**Opening Life checks again.** When Life opens or comes back to the front, it asks the store where this person stands. Someone with no plan meets the same screen. That covers someone who skipped setup from the welcome screen, someone who closed Life at the paywall, and someone whose trial or plan has ended. For an ended plan the screen says "Your Life Plus has ended." and that everything they told Life is still there, so they can subscribe again or take a copy. After subscribing, they see the welcome to Life Plus.

**When Life won't ask:**

- Only the store's definite answer counts. Offline, or if the store can't be reached, Life stays open, and the server still checks paid features itself once `BILLING_ENFORCED` is on.
- Payment trouble (the store retrying a card) keeps Life open.
- The 18+ check always comes first.

**Setup counts as done when Life Plus opens.** If someone closes Life there, they come back to Life Plus, not to the start of setup.

**Builds without billing keep Skip.** Every build today has no RevenueCat key, so the screen keeps the board's Back and Skip, and Skip goes on to the first move. TestFlight testers and the web preview are never stopped. The new screen is the board's Life Plus shown full screen with its own headline ("Your plan is ready. Life Plus opens all of Life.", or the trial's length when there is one). Because a full screen has room, it also lists what Life Plus includes, in the same words as the Your Life Plus page.

## Screenshots

From the release web build (`EXPO_PUBLIC_SAMPLE_DATA=0`, no key), walking from Building your plan with Save your progress answered:

- `setup-ends-on-plus` (light and dark): Life Plus at the end of setup. Back and Skip show because this build can't sell.
- `then-first-move`: Skip goes on to the first move.

The version without Back or Skip, and the ended screen, need a build with a RevenueCat key, so they can only be seen on TestFlight once billing is switched on.

## Checks

- **Tests:** `tests/launch/billing-phone.test.ts` now has 22 tests, 7 of them new. The new ones check:
  - when Life asks (none and ended yes; trial, paid, payment trouble and no answer no);
  - that setup goes to Life Plus and the first move follows a started plan;
  - that with billing on there's no Back, Skip, back button or swipe, and Your data is linked;
  - that a build without billing keeps Skip;
  - that the check on opening needs billing, finished setup and the 18+ check;
  - the ended wording;
  - the route.
- **Walked in the browser:** Building your plan, then See my plan, Life Plus, Skip, and the first move. Setup is saved as done once Life Plus opens.
- **Full suite, typecheck and bundles:** see the integration notes for the join.

## For Edem

- **Trial length** is still open (7 or 14 days). It's set in App Store Connect and Play Console, and the screen reads it from the store.
- **Nothing to switch on yet.** This takes effect only when billing goes live (F-20's to-do list in the fix list).
