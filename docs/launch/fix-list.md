# Fix list

Version 1, 21 November 2026. Everything known that stands between Life and beta, then launch. Gathered from every phase's known limits, the plan review gaps list, the launch documents and a fresh look at the app in Phase 31. Beta testers' reports join this list, triaged the same way.

**Priorities.** P0 blocks beta (real people on TestFlight and Play internal testing). P1 blocks store launch. P2 soon after launch. P3 later.
**Who.** Edem: only the owner can do it (accounts, money, decisions, legal). Build: code we can do now.

## P0: before beta

| # | What | Who | Source |
|---|---|---|---|
| F-02 | Accounts: Apple Developer and the App Store Connect app record, Google Play Console (check whether it is a personal or organisation account), Expo and the EAS project (`eas init`) | Edem | Section 0 |
| F-03 | The server: the Neon project in London, the Vercel host, the production settings (`BETTER_AUTH_SECRET`, `TOKEN_KEY`, `JOBS_SECRET`, `TRUSTED_ORIGINS`), migrations, and a daily call to `/jobs/sweep` | Edem's card, then Build | Phase 21 and 23 |
| F-04 | An email sender for sign-in codes, with the domain's SPF and DKIM records, and the sending domain registered with Apple's private email relay (so people who hide their email still get codes) | Edem chooses, Build wires `sendCode` | Phase 21; still open |
| F-05 | Sign in with Apple and Google credentials | Edem | Phase 21 |
| F-06 | AI provider keys, with data processing agreements and zero data retention | Edem | Section 0 item 7 |
| F-07 | Sign off the DPIA, including the **backup decision**: body numbers and meals are backed up when someone signs in. Keep that and say so (copy now says so), or keep them on the phone unless a "Back up health data" switch is on (recommended) | Edem | DPIA risk 3 |
| F-08 | Pay the ICO data protection fee and add the registration number to the privacy policy | Edem | Launch checklist |
| F-09 | A domain, with privacy and support addresses; publish `apps/site` there (TestFlight's external testing and both stores ask for a privacy policy link) | Edem, then Build | Launch checklist |
| F-10 | **Support needs its address.** Help now opens a mail to the support address with the app version (see Fixed below), but no build has an address yet, so Help says support isn't connected. Set `EXPO_PUBLIC_SUPPORT_EMAIL` for the preview and production profiles in `eas.json` once F-09 gives the domain, and make sure that mailbox is read | Build, once F-09 gives an address | Phase 31 |
| F-12 | A security review: secrets, dependencies, row-level security, the API | Edem arranges, Build fixes | DPIA risk 1 |
| F-13 | Sentry: create the organisation and project in Sentry's EU region, put the DSN in EAS, and decide the default (on unless switched off, or off until yes) | Edem | Phase 30 decisions 1 and 2 |

## P1: before store launch

| # | What | Who | Source |
|---|---|---|---|
| F-20 | **Billing, the phone half.** The server half is done (see Fixed below). Still to build: RevenueCat's SDK in the app, a paywall with price, period, trial and links to the terms and privacy policy, Restore Purchases, and signing RevenueCat in with Life's user id. Life Plus still reads "Free · see what Life Plus adds", which doesn't fit a paid-only app. Going live needs Edem's RevenueCat account, the store products, and `REVENUECAT_WEBHOOK_SECRET` and `BILLING_ENFORCED=1` on the server | Build (needs Edem's RevenueCat account to go live) | Plan gaps 6 |
| F-21 | **The app icon is Expo's template.** A real icon and splash are needed, at 1024 × 1024 with no transparency, plus Android's adaptive icon | Edem or a designer | Phase 31 |
| F-22 | The store name and a UK trademark check. Options in store-listing.md | Edem | Launch checklist |
| F-23 | Legal review of the privacy policy, terms and DPIA. Fill every [placeholder], remove the "Draft" lines, then run `bun apps/site/build.ts` so the app and the site match | Edem's adviser, then Build | Phase 31 |
| F-26 | "Connect your bank" carries a Preview chip and connects nothing. App Review rejects placeholder features. Hide it in release builds until Open Banking is real, or keep it and explain | Edem decides | App Review 2.1 |
| F-27 | Confirm the export compliance answer (`ITSAppUsesNonExemptEncryption: false` with SQLCipher) | Edem's adviser | App Review notes |
| F-29 | The web deletion page needs the API's address in `delete.html` and the site's address in the API's `TRUSTED_ORIGINS` | Edem's settings | Phase 31 |
| F-30 | If the Play account is personal: a closed test with at least 12 testers for 14 days before production | Edem | Play policy |
| F-31 | Store forms: App Privacy, Data safety, Health Connect declarations, health apps and financial features declarations, age ratings, target audience. Answers drafted in store-privacy.md | Edem | Phase 31 |
| F-32 | On devices: the Maestro flows, VoiceOver and TalkBack by ear, crash delivery, a 60 fps profile (the mood field redraws 168 dots per drag move) | Build, on devices | Phase 30 limits |
| F-33 | Notifications on devices: the permission prompts, delivery at the planned times, a tap opening the right screen, background wakes | Build, on devices | Phase 29 limits |
| F-34 | Sentry's Expo plugin and source map upload, so crash reports are readable | Build, after F-13 | Phase 30 |
| F-35 | Refresh the store screenshots if F-01 or F-20 changes a screen in them (`scripts/store-shots.cjs`) | Build | Phase 31 |
| F-36 | The 2027/28 tax year starts on 6 April 2027. UK rules are fixed at 2026/27 in `packages/core/src/data/finance.ts` | Build, before April | Plan gaps 11 |
| F-37 | **Money needs a real source.** The Money pages (balances, payments, budget, net worth, bills, the 30-day cash plan and the buffer) were built on the sample life's figures, so since F-01 a real account sees Money's day-one state. Start with what people tell Life (pay day, rent, bills as records), then read-only Open Banking | Build; Open Banking needs Edem's provider choice | F-01 |
| F-38 | **Home, Work and Health need real figures too.** The same holds for those three areas and the tools behind them (rent vs buy, bedrooms, bloodwork, invoices): a real account sees each area's day-one state until Life has heard about it | Build | F-01 |
| F-39 | Adding people from the phone's contacts needs a contacts library (`expo-contacts`), which isn't on the reference list. Until Edem decides, a real account types people in | Edem decides, then Build | F-01 |

## P2: soon after launch

| # | What | Source |
|---|---|---|
| F-40 | Android speech only prefers the offline recogniser. On a phone without the offline pack, Android's own service may handle the audio (the privacy policy says so). Consider requiring offline speech | Phase 31 |
| F-41 | Sessions keep the network address they came from. Consider turning off address tracking in Better Auth, for data minimisation | DPIA |
| F-42 | The sync log grows forever; a new phone pulls from the beginning. Compact it once accounts are large | Phase 22 |
| F-43 | Signing in to a second account on the same phone merges the first account's rows into it. Clear the phone first | Phase 22 |
| F-44 | The account export lists files but doesn't include them | Phase 23 |
| F-45 | Two simultaneous AI requests can both use the last call of an allowance; a timed-out call isn't in the cost ledger; allowances use rolling windows, not calendar days | Phase 24 |
| F-46 | The AI queue retries on a timer, not when the connection returns; a rare double answer if the app is killed between an answer arriving and being saved (de-duplicate by request id) | Phase 25 |
| F-47 | Life doesn't yet answer "you used to…" from closed memories | Phase 25 |
| F-48 | One wearable that's down holds back the phone's own readings; WHOOP cycles and workouts aren't read yet; a forwarded wearable sign-in link works for 10 minutes; check WHOOP's revoke address | Phase 26 |
| F-49 | Search Open Food Facts by name; check the food model's accuracy on real plates | Phase 27 |
| F-50 | Deadlines and recall nudges have no stored source yet; Today's opening line on a real account is plain | Phase 29 |
| F-51 | Six screens have no heading (camera, barcode scanner, focus and workout timers, a chat thread, the lock screen preview) | Phase 30 |
| F-52 | People who keep Life on the phone get no cloud AI, because the API needs an account. Decide whether that's right | Plan gaps 4 |
| F-53 | The "Sync health memories" switch exists in the data layer but has no place in Settings | Phase 22 |
| F-54 | An optional Face ID or fingerprint lock for Life | DPIA risk 4 |
| F-55 | Tell people by email when a new phone signs in to their account | DPIA risk 13 |
| F-56 | An eating disorder screening question before food targets, with a gentler mode | DPIA risk 5 |
| F-57 | Writing your Aim offers no suggestions in a real account (the board's were the sample life's). Suggest from what Life knows once it knows something | F-01 |
| F-58 | **Progress toward the Aim has no measure yet.** A real account's Aim shows its own words and today's move, without a percentage. The month's gambit and the earned glimpse wait for that measure (their suggestions were the sample life's), and show a day-one state until then | F-01 |
| F-59 | **Fuel's insights need real sources.** Plant variety and how processed food was aren't counted from logged meals, and the link between late meals and sleep isn't drawn. A real account sees the target and its own eating window instead | F-01 |
| F-64 | **Screens nothing links to yet still hold sample figures**: the morning brief, the preview of Today's numbers, the passport and car insurance examples behind Documents, and the letter scan (labelled a sample). Give each a real or day-one state before anything links to it, and before the widget, watch and lock-screen previews become real surfaces | F-01 |

## P3: later

| # | What | Source |
|---|---|---|
| F-60 | Phonon, the on-device iPhone voice, waits for access | Phase 28 |
| F-61 | Content: the Learn library, Teach me topics and Help's written answers need an owner | Plan gaps 12 |
| F-62 | Moods, journal entries, chat history and drafts stay on one phone and aren't in the export. If they ever sync, update the privacy policy and store answers first | Plan gaps 5 |
| F-63 | The photographs from the board have no recorded source or licence | Phase 13 |

## Fixed in Phase 31

- The About screen shows the full terms and privacy policy, generated from `docs/launch` (it used to say "Full terms are published before launch").
- The health data screen promised "Kept on this phone". It now says readings stay on the phone and body numbers and meals are backed up only if you sign in. The sign-in screen says what is backed up.
- Permission prompts and the home screen name now write "Life" (they said "life").
- Open Food Facts is credited in the open-source notices.
- **Restoring a phone backup could lock people out**, because the database key stays on the phone that made it. The database is now left out of iCloud and computer backups on iPhone (the app's native module marks its folder at start-up) and Android's automatic backup is off, so signing in is the way to restore. Was F-24, from plan gaps 10. **Check on a device:** back up and restore an iPhone, and confirm Life opens to Welcome back rather than a storage error.

## Fixed after Phase 31

- **Real accounts start empty** (was F-01, P0). Release builds start with no profile, Aim, records, people, habits, memories or body numbers (`apps/mobile/src/state/empty.ts`), and erasing your data goes back to that, not to the sample. The store build sets `EXPO_PUBLIC_SAMPLE_DATA=0`; preview and e2e builds keep the sample life for reviews and automated flows. Screens made only of sample figures now show a day-one state with one way in (Talk to Life): Money, the Money, Home, Work and Health areas, the tax check behind Plan's first mission, and the 30-day cash plan. From Life, Routines and the share card show only what is real; missions use the engine's own steps; Body numbers show your own or a dash; Add people starts with typing; onboarding's body steppers start from a typical figure and save only what you keep. Past day one, Plan shows the engine's open missions and how much Life knows in each area, the Aim shows your own words without the sample's deposit, and Fuel's week, progress, weight and quick log read your own meals and weigh-ins (Weight now keeps one weigh-in a day). Onboarding's Building your plan and first move no longer show the sample's rebate or emergency tax code, and the health stack, lens answers and body clock show a day-one state.
- **Sign-in codes are limited** (was F-11, P0). An email address can ask for 5 codes an hour and try 10, a network address can ask for 30 codes an hour, and each code still allows 3 tries. Better Auth's burst limits now count in Postgres too, so every server instance shares them. The counters hold keyed hashes, never an email or network address, and the daily sweep deletes them after a day (`apps/api/src/limits.ts`, migration `0006_sign_in_limits`). 25 failed codes in 10 minutes, or 6 for one address in an hour, write one `auth alert` line to the log. A refusal is a 429 with `X-Retry-After`; the phone says to try again in an hour when the pause is long. The privacy policy, DPIA and record of processing say so. Still for Edem: a log alert on `auth alert` at the host, with F-03.
- **Health Connect's question opens the privacy policy** (was F-25, P1). When Health Connect opens Life to show why it reads health data (the rationale action through Android 13, the permission-usage alias from Android 14), Life opens About with the privacy policy unfolded instead of Today, whether Life was closed or already open. The app's Android module reports the launch (`launchedForHealthRationale`, and a `healthRationale` event for a new intent); `services/healthRationale.ts` opens the page. Still to check on a phone, with F-32.
- **Nudges keep money and health off the lock screen** (was F-28, P1). Every template was checked. A move, deadline or habit is named only when it isn't from money or health and its name has no money figure, tax form, money trouble or health word (`lockScreenSafe` in `packages/core/src/day/nudges.ts`); otherwise the nudge says the same thing without the name ("Today’s move is ready when you are."). Android's nudge channel hides the text on a secure lock screen. A medicine's own name in a habit isn't recognised as health; Android's setting covers that case.
- **Help writes to a person** (F-10's build work, P0). "Email us" and "Report a number" open a new email in the phone's mail app, to the address in `EXPO_PUBLIC_SUPPORT_EMAIL`, with a subject, a few prompts for a wrong number, and one line with Life's version and the phone's system. Nothing else about the person goes in (`apps/mobile/src/services/support.ts`). Without an address, or without a mail app, Help says so under the button instead of pretending a message went. The privacy policy and record of processing already cover emails to support. Still to do: the address itself, in F-10 above.
- **The server keeps its own record of each subscription** (F-20's server half, P1). RevenueCat's webhook (`POST /billing/revenuecat`, signed with HMAC-SHA256 and refused if the signature is wrong or over five minutes old) keeps a `subscriptions` row per person: plan, store, when access ends, whether it renews and whether a payment failed, and never a price, card or receipt (`apps/api/src/billing.ts`, migration `0007_subscriptions`). Trials, renewals, cancellations, refunds, the store's grace period, restores onto another account and late or repeated events are handled. `GET /billing/status` tells the phone where it stands, and the export includes the record. With `BILLING_ENFORCED=1`, AI, memory search and wearables need a trial or a subscription; sync, export, deletion and everything else stay open, so a lapsed trial never strands anyone's data. Sandbox purchases count only with `BILLING_SANDBOX=1`. The privacy policy and record of processing describe the record.
