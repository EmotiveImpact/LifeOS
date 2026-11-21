# The server keeps its own record of each subscription (F-20, server half)

Branch `fix-billing-server`, from `v26-integration` after support mail joined. It builds the server half of P1 item F-20: Life's own record of who is in a trial or subscribed, kept from RevenueCat, and a switch that makes the routes that cost money need one. The phone half (the SDK, the paywall, Restore Purchases) comes next. Nothing here needs Edem's accounts to build or test, and nothing changes for anyone until the switch is turned on.

## What changed

**Life's own record.** A new table, `subscriptions`, holds one row per person: the plan, the store, when access ends, whether it renews and whether a payment failed. It never holds a price, currency, country, receipt or card. Deleting the account deletes the row, and "export everything" now includes it.

**RevenueCat's webhook.** `POST /billing/revenuecat` takes RevenueCat's events:

- It checks RevenueCat's HMAC-SHA256 signature over the raw body, and refuses one that's wrong or more than five minutes old. Without a signing secret the route answers 503.
- Events name the person by Life's own user id (a random number, never a name or email), which the phone will give RevenueCat after sign-in. RevenueCat's anonymous ids are never matched, and an event for nobody Life knows is acknowledged and dropped, so RevenueCat doesn't keep retrying it.
- It handles a trial starting, a trial becoming paid, renewals, turning renewal off (access lasts to the end of the period), refunds (access ends at once), a failed payment (access lasts through the store's grace period), a restore onto another account, and plan changes.
- Each row remembers the newest event applied, so a retry changes nothing and an older event arriving late can't undo a newer one.
- Sandbox purchases (TestFlight, Play's internal testing) count only when the server is told to.

**Where someone stands.** `GET /billing/status` answers `none`, `trial`, `active`, `grace` or `ended`, with the end date, whether it renews, and whether the server is enforcing.

**The switch.** With `BILLING_ENFORCED=1`, these need a trial or a subscription, and answer 402 `SUBSCRIPTION_REQUIRED` otherwise:

- `POST /ai/run`
- `POST /memory/search`
- `GET /wearables/samples`, and connecting WHOOP or Oura

Everything else stays open: sync both ways, export, deletion, reading your memories, disconnecting a wearable. A lapsed trial never strands anyone's data, and the rights to export and delete never depend on paying.

**Settings** (in `apps/api/.env.example`): `REVENUECAT_WEBHOOK_SECRET`, `REVENUECAT_ENTITLEMENT` (default `life`), `BILLING_ENFORCED` (default off) and `BILLING_SANDBOX` (default off).

**Documents.** The privacy policy's Payments section and retention table, and processing row 14 in the record of processing, describe the record. The app's About text and the website were rebuilt from the policy. The fix list moves the server half to Fixed and keeps F-20 open for the phone.

## Checks

- **Tests:** `tests/api/billing.test.ts` is new (16 tests). Without a database it checks the signature (good, wrong secret, changed body, too old, missing), the webhook's 503 and 401, which routes need a subscription, the settings' defaults, and that the record has no payment columns. With Postgres it runs each lifecycle above through the real tables, enforcement on and off, the export, a signed request through the API, and the row going when the account is deleted.
- **Full suite:** 887 tests pass with Postgres.
- **Typecheck:** the API and the app are clean.
- **Bundles:** the iOS and Android exports build.
- **Migration:** `apps/api/drizzle/0007_subscriptions.sql` creates the table and grants it to `life_api`. Run `bun run db:migrate` in `apps/api` before deploying.

## For Edem

- **Which routes need a subscription** is my choice: the ones that cost money per use (AI, memory search, wearables). Sync and storage stay open so nobody's data is stuck behind a payment. Tell me if you want sync closed too after a trial ends.
- **The trial length** is still open (7 or 14 days). The server doesn't need it: the store's own trial sets the end date.
- **To go live** (with F-20's phone half): create the RevenueCat project, an entitlement called `life` and the two products at £7.99 a month and £79.99 a year; turn on the webhook with signing, pointing at `/billing/revenuecat`; put the signing secret in `REVENUECAT_WEBHOOK_SECRET`; then set `BILLING_ENFORCED=1` once the paywall ships. TestFlight's server can set `BILLING_SANDBOX=1`.

## Known limits

- The record is built from events. If a webhook were lost entirely, the row could be out of date until the next event. A later step can ask RevenueCat's REST API for the current state when an event arrives, using a server-only secret key.
- Family Sharing and promotional grants are taken as RevenueCat reports them; neither has been tried against a real store.
