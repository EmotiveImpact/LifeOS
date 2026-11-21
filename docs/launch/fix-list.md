# Fix list

Version 1, 21 November 2026. Everything known that stands between Life and beta, then launch. Gathered from every phase's known limits, the plan review gaps list, the launch documents and a fresh look at the app in Phase 31. Beta testers' reports join this list, triaged the same way.

**Priorities.** P0 blocks beta (real people on TestFlight and Play internal testing). P1 blocks store launch. P2 soon after launch. P3 later.
**Who.** Edem: only the owner can do it (accounts, money, decisions, legal). Build: code we can do now.

## P0: before beta

| # | What | Who | Source |
|---|---|---|---|
| F-01 | **Real accounts start with Ama's sample life.** The app's starting state (`initial` in `SeedProvider.tsx`) is Ama's profile, Aim, records, people, habits, memories and body numbers, even in release builds. Beta testers would see a stranger's life. Release builds must start empty and show the board's empty states | Build | Plan gaps 1; Phase 27 and 29 limits |
| F-02 | Accounts: Apple Developer and the App Store Connect app record, Google Play Console (check whether it is a personal or organisation account), Expo and the EAS project (`eas init`) | Edem | Section 0 |
| F-03 | The server: the Neon project in London, the Vercel host, the production settings (`BETTER_AUTH_SECRET`, `TOKEN_KEY`, `JOBS_SECRET`, `TRUSTED_ORIGINS`), migrations, and a daily call to `/jobs/sweep` | Edem's card, then Build | Phase 21 and 23 |
| F-04 | An email sender for sign-in codes, with the domain's SPF and DKIM records, and the sending domain registered with Apple's private email relay (so people who hide their email still get codes) | Edem chooses, Build wires `sendCode` | Phase 21; still open |
| F-05 | Sign in with Apple and Google credentials | Edem | Phase 21 |
| F-06 | AI provider keys, with data processing agreements and zero data retention | Edem | Section 0 item 7 |
| F-07 | Sign off the DPIA, including the **backup decision**: body numbers and meals are backed up when someone signs in. Keep that and say so (copy now says so), or keep them on the phone unless a "Back up health data" switch is on (recommended) | Edem | DPIA risk 3 |
| F-08 | Pay the ICO data protection fee and add the registration number to the privacy policy | Edem | Launch checklist |
| F-09 | A domain, with privacy and support addresses; publish `apps/site` there (TestFlight's external testing and both stores ask for a privacy policy link) | Edem, then Build | Launch checklist |
| F-10 | **Support doesn't reach anyone yet.** Help's "Email us" and "Report a problem" only remember the tap. Testers need a way to tell us things: open a mail to the support address, with the app version | Build, once F-09 gives an address | Phase 31 |
| F-11 | Rate limits on sign-in code requests, per address and per network address, and an alert on many failed codes | Build | DPIA risk 13 |
| F-12 | A security review: secrets, dependencies, row-level security, the API | Edem arranges, Build fixes | DPIA risk 1 |
| F-13 | Sentry: create the organisation and project in Sentry's EU region, put the DSN in EAS, and decide the default (on unless switched off, or off until yes) | Edem | Phase 30 decisions 1 and 2 |

## P1: before store launch

| # | What | Who | Source |
|---|---|---|---|
| F-20 | **Billing.** RevenueCat, a paywall with price, period, trial and links to the terms and privacy policy, Restore Purchases, and the API checking entitlement. Life Plus still reads "Free · see what Life Plus adds", which doesn't fit a paid-only app | Build (needs Edem's RevenueCat account to go live) | Plan gaps 6 |
| F-21 | **The app icon is Expo's template.** A real icon and splash are needed, at 1024 × 1024 with no transparency, plus Android's adaptive icon | Edem or a designer | Phase 31 |
| F-22 | The store name and a UK trademark check. Options in store-listing.md | Edem | Launch checklist |
| F-23 | Legal review of the privacy policy, terms and DPIA. Fill every [placeholder], remove the "Draft" lines, then run `bun apps/site/build.ts` so the app and the site match | Edem's adviser, then Build | Phase 31 |
| F-25 | When Health Connect opens Life to show why it reads health data, Life should open the privacy policy, not Today | Build | Google Health Connect policy |
| F-26 | "Connect your bank" carries a Preview chip and connects nothing. App Review rejects placeholder features. Hide it in release builds until Open Banking is real, or keep it and explain | Edem decides | App Review 2.1 |
| F-27 | Confirm the export compliance answer (`ITSAppUsesNonExemptEncryption: false` with SQLCipher) | Edem's adviser | App Review notes |
| F-28 | Check every nudge template for health or money details that would show on a lock screen | Build | DPIA risk 10 |
| F-29 | The web deletion page needs the API's address in `delete.html` and the site's address in the API's `TRUSTED_ORIGINS` | Edem's settings | Phase 31 |
| F-30 | If the Play account is personal: a closed test with at least 12 testers for 14 days before production | Edem | Play policy |
| F-31 | Store forms: App Privacy, Data safety, Health Connect declarations, health apps and financial features declarations, age ratings, target audience. Answers drafted in store-privacy.md | Edem | Phase 31 |
| F-32 | On devices: the Maestro flows, VoiceOver and TalkBack by ear, crash delivery, a 60 fps profile (the mood field redraws 168 dots per drag move) | Build, on devices | Phase 30 limits |
| F-33 | Notifications on devices: the permission prompts, delivery at the planned times, a tap opening the right screen, background wakes | Build, on devices | Phase 29 limits |
| F-34 | Sentry's Expo plugin and source map upload, so crash reports are readable | Build, after F-13 | Phase 30 |
| F-35 | Refresh the store screenshots if F-01 or F-20 changes a screen in them (`scripts/store-shots.cjs`) | Build | Phase 31 |
| F-36 | The 2027/28 tax year starts on 6 April 2027. UK rules are fixed at 2026/27 in `packages/core/src/data/finance.ts` | Build, before April | Plan gaps 11 |

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
