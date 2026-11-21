# The phone sells Life Plus through the store (F-20, phone half)

Branch `fix-billing-phone`, from `v26-integration` after the server half joined. With the server's record already in, this finishes the building part of P1 item F-20. What's left is switching it on with Edem's accounts.

## What changed

**RevenueCat's SDK.** `react-native-purchases` 11.0.1, pinned. It is the newest release more than two weeks old, MIT-licensed, and now on the reference list and in the third-party notices (the owner chose RevenueCat on 20 Nov). It starts only when the build carries RevenueCat's public SDK key for its store (`EXPO_PUBLIC_REVENUECAT_IOS_KEY`, `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`). Those keys are made to ship inside apps: they can read offerings and make purchases for that phone, nothing more. RevenueCat's secret keys never go in the app. No build has a key yet, and the web never does.

**Who RevenueCat thinks you are.** Signed in, RevenueCat knows the person by Life's own user id (a random number from `GET /me`, never a name or email), so the server can match its events. A purchase made before signing in moves to the account on sign-in. Signing out signs RevenueCat out too.

**The paywall** (Life Plus, the board's `plus`):

- Prices come from the store, in the person's own currency, never from Life's figures. The "Save" chip is worked out from the two store prices.
- A free trial is offered only when the store says this person can still have one: Google Play leaves the free phase out for someone who has had it, and on iOS RevenueCat checks eligibility per product. With a trial, the button reads "Start free trial", and the screen says how long it is, what it costs afterwards, that it renews until cancelled, and that cancelling before the end means no charge.
- Restore Purchases asks the store for an earlier purchase on this Apple or Google account.
- Links to the terms and privacy policy sit under the button, as Apple asks. The terms link opens About with the terms unfolded.
- If the store can't be reached, the price line says so and Subscribe waits. A payment waiting for approval (a parent's, say) is told apart from a failed one, and tapping away from the store's sheet isn't treated as a failure.

**Settings and the Life Plus page.** The row and the chip under your name read where you stand: "Free trial · ends 28 Nov 2026", "Yearly · renews 14 Nov 2027", "Payment didn’t go through · update it in the App Store", "Ended · subscribe again", or "Not subscribed · see Life Plus". The page shows the plan, the store's price, when the trial ends or the plan renews, and, on a yearly plan, which month of twelve. "Switch plan" and "Cancel Life Plus" open the App Store's or Google Play's own subscription page: Life never cancels anything itself. Nothing says "Free" any more, which never fitted a paid-only app.

**Builds without billing.** A real build without a key never pretends to sell: Subscribe says "Subscriptions aren’t connected in this build yet, so nothing was charged." and Restore says the same. Only the sample account counts as a member, so a release build can't show a subscription nobody bought. Sample builds keep the board's preview, so the designs can still be reviewed.

## Screenshots

From the release web build (`EXPO_PUBLIC_SAMPLE_DATA=0`, no key), light and dark:

- `paywall-not-connected`: the paywall after tapping Subscribe, with the note and the terms and privacy links.
- `life-plus-not-on`: the Life Plus page for an account with no subscription.

The live states (store prices, trial wording, renewal dates) need RevenueCat's keys and a store sandbox, so they can only be seen on TestFlight once F-20 goes live.

## Checks

- **Tests:** `tests/launch/billing-phone.test.ts` is new (15 tests). It checks the store-price plans, trial eligibility on iOS and Google Play, trial wording, each standing (trial, paid, not renewing, payment trouble, ended, none), purchase outcomes (cancelled, pending, failed), that nothing says "Free", that a build without billing never pretends, the paywall's links and trial wording, that cancelling opens the store, that no key is written into the code, the pinned SDK, and that phone and server use the same entitlement. The About test follows the terms link.
- **Full suite:** 902 tests pass with Postgres.
- **Typecheck:** clean.
- **Bundles:** the iOS, Android and web exports build.
- **Not yet on a phone.** The SDK is native, so the first EAS build compiles it. No config plugin is needed; RevenueCat's Android library brings the billing permission.

## For Edem

- **Trial length.** Still open: 7 or 14 days. The app reads it from the store, so it's set once in App Store Connect and Play Console.
- **Where the paywall sits.** The board's paywall has "Skip", which fits an app with a free plan. Paid only, the question is when someone meets it: at the end of setup (start the trial before Today), or when the first paid thing is used. I've kept the board's screens and placement and haven't moved anything. Tell me which you want.
- **To go live:** create the RevenueCat project, an entitlement called `life`, and products named `life_annual` and `life_monthly` (the app reads the period from the name) at £79.99 a year and £7.99 a month; put the two public SDK keys in `eas.json` for preview and production; put the webhook signing secret on the server; and turn on `BILLING_ENFORCED=1` once a TestFlight purchase has gone through end to end.

## Known limits

- Switching between yearly and monthly happens on the store's subscription page, not inside Life.
- The month-of-twelve dots count back from the renewal date, so they can be a day out near a month's end.
