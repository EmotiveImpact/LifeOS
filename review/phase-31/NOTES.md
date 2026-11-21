# Phase 31 · Beta and launch

Branch `phase-31-launch`, from `v26-integration` at the Phase 30 join (ddb99c8). This phase writes everything the stores, the law and the testers need, checked against what the app and the API really do, and lists what still stands between Life and beta. It ends at the launch review with Edem.

Nothing here has been submitted, published or sent anywhere. No owner accounts exist yet, so there are no TestFlight or Play builds.

## What was built

**Launch documents** (`docs/launch/`, index in its README). All drafts; the legal ones need a lawyer.

| Document | What |
|---|---|
| Privacy policy | Plain words. Grounded in the real flows: what stays on the phone, what is backed up when you sign in, each outside service, retention, rights |
| Terms | UK consumer terms, wellness and money framing, the subscription, Apple's required terms |
| DPIA | ICO template, 15 risks with measures and residual risk, sign-off table |
| Record of processing | Article 30, 15 activities, processor list |
| Store privacy | Apple App Privacy, Google Data safety, Health Connect declarations, HealthKit notes |
| App Review notes | Text to paste for both stores, and where Life stands on each rule |
| Store listing | Name options, descriptions, keywords, screenshot plan |
| Support page | The FAQ, with crisis numbers |
| Beta plan | Builds, testers, what we learn without analytics, schedule, the bar for launch |
| Fix list | 60 items by priority, from every phase's known limits and this phase's findings |

**A small website** (`apps/site/`). Home, privacy, terms, support and **account deletion on the web**, which Google Play requires. No framework, fonts, trackers or cookies. The privacy, terms and support pages are generated from the Markdown, so there is one source.

- **Web deletion works end to end**, checked against the local API: the app signed up and registered a phone, then the page sent a code, refused a wrong one, took the right one, closed the account, and the app's old session stopped working (401). The account is set to go after 30 days.

**In the app**

- **About shows the real terms and privacy policy** (it said "Full terms are published before launch"). They are generated from the same Markdown. Tapping a row opens its text below the rows, as the board's Terms row already did. The privacy policy ends with a link to Your data.
- **Copy that promised too much now matches the app:**
  - the health data screen said "Kept on this phone, encrypted". Body numbers and meals are backed up when someone signs in, so it now says readings stay on the phone and body numbers and meals back up only if you sign in;
  - the sign-in screen says what signing in backs up.
- **Backups could lock people out.** The database key stays on the phone that made it, so restoring an iPhone or Android backup brought the database without its key, and Life refused to open. The database is now kept out of device backups:
  - iPhone: the app's native module marks its folder at start-up;
  - Android: automatic backup is off.

  Signing in is the way to restore. This also keeps health data out of iCloud, as the policy says.
- Permission prompts and the home screen name say "Life" (they said "life").
- Open Food Facts is credited in the open-source notices, as its licence asks.

**Store screenshots** (`review/phase-31/store/`)

- What: eight frames, each a caption above the real screen, taken from the release web build with the sample life.
- Sizes: 1320 × 2868 for the App Store's 6.9-inch iPhone, and 1080 × 1920 for Play, plus Play's 1024 × 500 feature graphic.
- How: `apps/mobile/scripts/store-shots.cjs` makes them again whenever a screen changes.

## Found on the way

These matter most for the launch review:

1. **Release builds start with Ama's life.** The app's starting state is her profile, Aim, records, people, habits, memories and body numbers, even without sample data switched on. Beta testers would see a stranger's life. This blocks beta (fix F-01).
2. **The app icon is Expo's template**, a grey grid with circles (F-21).
3. **Support reaches nobody.** "Email us" and "Report a problem" only remember the tap. Testers need it (F-10).
4. **There is no billing yet.** The beta doesn't need it, but the stores do. Life Plus still says "Free · see what Life Plus adds" (F-20).
5. **Health Connect** can open Life to show why it reads health data. Life opens Today when it should show the privacy policy (F-25).

## Screenshots

- **What's in the folder:**
  - `about-terms`, `about-terms-subscription`, `about-privacy`, `about-privacy-processors`: the About screen;
  - `healthconsent`, `signin`: the corrected copy;
  - `site-index`, `site-privacy`, `site-delete`: the website.

  Each comes in light and dark.
- **Sheets:**
  - `launch-light.jpg` and `launch-dark.jpg`;
  - `store-sheet.jpg`, the App Store set.
- **Copies:** in project files at `v26-review/phase-31/`.

## 🛑 For the launch review with Edem

**Decisions**

1. **Health backup** (DPIA risk 3). Body numbers and meals are backed up when someone signs in. Choose one:
   - **A.** Keep backing them up, and say so. The copy already says so.
   - **B, recommended.** Keep them on the phone unless a "Back up health data" switch is on. That fits your 20 November decision that health stays on the phone unless people choose otherwise. It is one build step.
2. **Store name.** Three options are in store-listing.md, recommending "Life: Day Planner". Needs a UK trademark check.
3. **Trial length**: 7 or 14 days. It appears in the terms, the support page and the store text.
4. **"Connect your bank"** carries a Preview chip and connects nothing. Apple rejects placeholders. Choose one:
   - hide it in release builds (recommended);
   - keep it.
5. **Crash reports default.** Still open from Phase 30: on unless switched off, or off until yes.
6. **A review account** for Apple and Google, with a fixed code. Reviewers can use Sign in with Apple instead. Do you want one?

**Only you can do these** (P0 in fix-list.md)

- **Accounts:** Apple Developer and App Store Connect, Google Play Console (check whether it is personal or organisation), and EAS.
- **Server:** the Neon and Vercel production setup, and an email sender for codes.
- **Sign-in and services:**
  - Sign in with Apple and Google;
  - AI keys with zero data retention and data processing agreements;
  - Sentry in its EU region.
- **Domain:** a domain with privacy and support addresses, then publish `apps/site`.
- **ICO fee:** pay the data protection fee (reminder from the launch checklist).
- **Apple's Small Business Program:** enrol, then apply for Private Cloud Compute (reminder you asked for). Enrol 1 to 2 months before launch, because the 15% rate starts after a delay.
- **Legal review** of the privacy policy, terms and DPIA, then fill the placeholders.
- **Testers:** recruit 20 to 50. Start the waitlist on the site.

**What I'll build next, unless you say otherwise.** None of these needs your accounts to start:

1. F-01, real accounts starting empty (it blocks beta);
2. support that reaches a person (F-10), once there is an address;
3. code rate limits (F-11);
4. billing with RevenueCat behind Life's own record (F-20). It can be built and tested without keys, as Sentry was;
5. then the rest of the plan review's gaps.

## Checks

- **`bun test` with Postgres: 780 pass, 0 fail.** `tests/launch/site.test.ts` is new (12 tests). It checks that:
  - the site and the app's text match the Markdown;
  - the parser works;
  - About shows the real text;
  - links between pages work;
  - web deletion makes the app's calls;
  - every Health Connect permission is declared;
  - every outside service the API can use is named in the policy;
  - the HealthKit text quoted for reviewers is the shipped one;
  - the database stays out of backups;
  - the prompts say "Life";
  - the documents have no em or en dashes.
- **Typecheck:** clean for the app and the API.
- **Android manifest:** checked through Expo's config: `android:allowBackup="false"`.
- **Bundles:** the iOS, Android and web exports build.
- **Not compiled here:** the iPhone backup change (Swift) needs a development build. Check it on a device: back up and restore, then confirm Life opens to Welcome back.

## Known limits

- **The legal documents are drafts by an engineer, not a lawyer.** They follow the ICO's guidance and the stores' rules as I understand them. Treat the DPIA's risk ratings as a starting point.
- **Store answers assume zero data retention with the AI providers.** Without it, the content of AI requests counts as collected (see store-privacy.md).
- **The privacy policy names OpenAI and Google as possible AI providers** because the API can use them. Remove whichever isn't used.
- **The website's deletion form only shows once its API address is set.** Until then it offers email.
- **Sign-in codes by email can't reach people who hid their address with Apple** until the sending domain is registered with Apple's relay (F-04).
