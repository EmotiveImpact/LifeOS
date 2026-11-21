# Record of processing activities: Life

**Draft.** Article 30 UK GDPR. Version 1, 21 November 2026. Keep this up to date whenever a processor, kind of data or purpose changes.

**Controller:** [Company name], [registered address], ICO registration [number]. **Contact:** [privacy@domain]. **DPO:** [not appointed, see the DPIA].

**Data subjects:** people who use Life (adults in the UK); people they add to Life (names, relations, dates); people who email support.

## Activities

| # | Activity | Purpose | Data | Lawful basis | Where held | Recipients | Transfers | Retention | Security |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Running Life on the phone | Plan the day, keep records, show health, money and food | Everything the person gives Life and what Life derives | Contract; explicit consent for health data | The person's phone only | None | None | Until the person deletes it | SQLCipher, key in Keychain or Keystore |
| 2 | Accounts and sign-in | Let people sign in with Apple, Google or an emailed code | Email, name (if given), provider account id, session IP address and user agent, sign-in codes | Contract | Neon (London) | Vercel, Neon, [email provider], Apple, Google | US companies, UK data centres; [email provider region] | Account: while open plus 30 days. Sessions: 7 days after last use. Codes: 10 minutes | TLS; row-level security |
| 3 | Backup and sync between the person's phones | Restore on a new phone; keep two phones the same | Profile, body numbers, sex at birth, ethnicity (optional), meals and food targets, records, missions, habits, people, plans, memories (not health memories unless switched on), settings, consents, the sync log | Contract; explicit consent for health data and ethnicity | Neon (London) | Vercel, Neon | As above | While the account is open, plus 30 days; backups roll off within [7] days after | Row-level security on every table; encryption at rest |
| 4 | Photos and letters | Read meals, labels and letters; keep documents the person chooses to keep | Images and PDFs | Contract; explicit consent where a photo shows food or health | [R2 / S3] ([region]) | Vercel, [storage provider], the AI provider for that reading | [Region] | Deleted once read, within a day at most; kept files until deleted | Server-chosen keys; five-minute signed links; encryption at rest |
| 5 | Cloud AI | Understand, file, explain, draft, teach and read photos when the phone's model isn't enough | The request and the facts the job needs; health details only under consent that names health | Consent (per request or standing); explicit consent for health details | Not stored by us beyond the answer | Anthropic, [OpenAI], [Google Cloud EU] | US (DPF or IDTA); EU | Providers: [zero retention / up to 30 days]. Us: not kept | Consent checked on the phone and the server; private mode |
| 6 | AI cost ledger | Fair allowances and a spending cap; spot misuse | Job, model, tier, outcome, token counts, cost, time | Legitimate interests | Neon (London) | Vercel, Neon | As in 2 | While the account is open | Row-level security |
| 7 | Wearables | Bring WHOOP and Oura readings to the phone | OAuth tokens (sealed); readings pass through only | Explicit consent | Neon (tokens only) | WHOOP, Oura (independent controllers) | US | Tokens until disconnect or account deletion | AES-256-GCM sealing; signed one-time OAuth state |
| 8 | Notifications | Deliver at most one nudge a day and chosen deadlines | Push token, device id, the nudge text | Consent (system permission) | Neon (token) | Expo, Apple, Google | US | Until notifications are turned off or the device signs out | Token per device; row-level security |
| 9 | Weekly count of finished moves | Measure whether Life helps (north star) | Week, platform, count | Consent (opt-in switch) | Neon (`weekly_moves`) | Vercel, Neon | As in 2 | Kept; holds no personal data | No person stored; session checked only to keep out strangers |
| 10 | Crash reports | Find and fix crashes | Error type, stack trace, app version, OS, Sentry's random install id; scrubbed of user, request, extras and device name | [Legitimate interests / consent: owner decision] | Sentry ([EU]) | Sentry | [None if EU region] | [90] days | Scrubbing before send; a switch to turn off |
| 11 | Barcode lookups | Find a packaged food | A barcode (and the phone's IP address, seen by the service) | Contract | Not held by us | Open Food Facts (independent controller) | France | Not held by us | Barcode only; generic user agent |
| 12 | Account export and deletion | Rights of access, portability and erasure | Everything the server holds for the person | Legal obligation | Neon, storage | None | None | Deletion after 30 days' grace | Session required; the export leaves out sealed tokens |
| 13 | Support | Answer questions and problems | Email address, what the person writes, attachments | Legitimate interests; contract | [Mailbox provider] | [Mailbox provider] | [Region] | [Two years] after last contact | [Mailbox security] |
| 14 | Subscriptions [when built] | Check entitlement; trials, renewals, refunds | Anonymous app user id, store receipts, purchase history | Contract; legal obligation (tax records) | RevenueCat; Apple; Google | RevenueCat, Apple, Google | US | [RevenueCat retention]; Apple and Google under their own policies | Server-side entitlement check |
| 15 | Age check | Keep Life to adults | An under-18 result (the date of birth isn't kept if under 18) | Legal obligation and legitimate interests | The phone | None | None | Until the app is deleted | On the phone only |

## Processors

| Processor | Service | DPA signed | Zero retention / no training | Transfer mechanism |
|---|---|---|---|---|
| Vercel Inc. | API hosting | [ ] | n/a | DPF / IDTA |
| Neon Inc. (Databricks) | Postgres, London | [ ] | n/a | DPF / IDTA |
| [Cloudflare / AWS] | Object storage | [ ] | n/a | [EU jurisdiction / UK region] |
| Anthropic PBC | AI models | [ ] | [ ] | DPF / IDTA |
| [OpenAI] | AI models | [ ] | [ ] | DPF / IDTA |
| [Google Cloud] | AI models, EU endpoint | [ ] | [ ] | EU adequacy |
| [Email provider] | Sign-in codes | [ ] | n/a | [ ] |
| 650 Industries (Expo) | Push delivery; builds | [ ] | n/a | DPF / IDTA |
| Functional Software (Sentry) | Crash reports | [ ] | n/a | EU region |
| [RevenueCat] | Subscriptions | [ ] | n/a | DPF / IDTA |
