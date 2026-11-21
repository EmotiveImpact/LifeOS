# App Review notes

**Draft.** What to paste into App Store Connect's review notes and Google Play's app access section, and the store rules Life has to meet. Version 1, 21 November 2026.

## Notes for Apple's reviewer (paste into App Review Information)

> Life is a personal planner for adults in the UK. It brings health, money and life admin into one daily plan. It is wellness guidance, not a medical device, and money guidance, not regulated financial advice; both are stated in the app (You, Settings, About) and in the terms.
>
> **Signing in.** Life works without an account: on the "Save your progress" step, tap "Not now, keep it on this phone". To try backup and the cloud features, use Sign in with Apple. [If a review account is set up: or the email review@domain with the code 000000 typed on the code screen.]
>
> **Age.** Life asks for a date of birth at first open and is for people 18 and over. Any adult date works.
>
> **HealthKit.** Life reads sleep, heart rate, heart rate variability, resting heart rate, breathing rate, blood oxygen, wrist temperature, steps and active energy, only the kinds the person switches on, after a separate yes to health data. It never writes to HealthKit. Readings stay on the phone; they are not sent to our servers, stored in iCloud, used for advertising or sold. To see it: during setup choose "I agree" on "Can Life use your health data?", then on "Plan around how you actually slept" tap "I agree, continue". Today and Body then use the readings.
>
> **AI.** Life uses the phone's built-in Apple Intelligence where available. For larger jobs it asks before sending anything to a third-party AI provider (Anthropic), and lets people give a standing yes by job in Settings. Health details go only under a yes that names health. Private mode keeps everything on the phone. This follows guideline 5.1.2(i).
>
> **Camera, microphone, photos, calendar, notifications.** Each is asked for only when the person uses the feature: the camera to photograph a meal, a label or a letter, or to scan a barcode; the microphone to talk to Life (speech is turned into text on the phone); photos to attach one; the calendar to see when the person is busy (never what events are); notifications for at most one nudge a day.
>
> **Account deletion.** You, Settings, Your data, Delete my account. The account closes at once and is deleted after 30 days.
>
> **Subscriptions.** [When billing is built:] Life is paid, with a free trial of [7 / 14] days, then £7.99 a month or £79.99 a year. The paywall shows the price, period, trial terms, and links to the terms and privacy policy; Restore Purchases is on the paywall and in Settings, Life Plus.
>
> **Contact during review:** [name], [phone], [email].

## Google Play: App access

> Life works without an account. On "Save your progress", tap "Not now, keep it on this phone". To try backup and the cloud features, use "Continue with Google". [Review account if set up.] People must enter an adult date of birth at first open.

## Rules Life has to meet, and where it stands

### Apple

| Guideline | What it asks | Where Life stands |
|---|---|---|
| 1.4.1 Medical | No unproven medical claims; remind people to see a doctor | Wellness framing on About, the health data screen and the terms. Readiness, load and stress are labelled estimates. **Check** every Body and readiness screen for wording that sounds diagnostic |
| 2.1 App completeness | No placeholders, demo content or broken links | **Fix before submission:** the "Connect your bank" row and screen carry a "Preview" chip; hide them in release builds until Open Banking is real. The Terms row now shows the full terms (Phase 31). Support's "Email us" must open a real address. The app icon is still Expo's template |
| 2.3 Accurate metadata | Screenshots show the app in use | The store screenshots come from the app's own screens (sample life) |
| 3.1.1 In-app purchase | Digital subscriptions through Apple | **Not built.** Billing is the next build item after Phase 31 |
| 3.1.2 Subscriptions | Clear price, period, trial, auto-renewal, links to terms and privacy in the app and in metadata; Restore Purchases | **Not built.** The current Life Plus screens say "Free · see what Life Plus adds", which no longer fits a paid-only app |
| 4.2 Minimum functionality | More than a website | Yes |
| 4.8 Login services | Sign in with Apple wherever Google sign-in is offered | Yes |
| 5.1.1(i) Privacy policy | Linked in App Store Connect and inside the app | In the app: You, Settings, About, Privacy policy (Phase 31). URL: [owner] |
| 5.1.1(v) Account deletion | In the app | Yes |
| 5.1.2(i) Data sharing and AI | Disclose and get permission before personal data goes to a third-party AI | Yes: per-request and standing consent, health only when named, private mode |
| 5.1.3 Health | No HealthKit data in iCloud, no advertising use, no false data, a privacy policy | Yes. Read only |
| Export compliance | Encryption questions | `ITSAppUsesNonExemptEncryption` is false. Life encrypts its own database with SQLCipher and uses TLS. **Confirm** with an adviser that this qualifies for the exemption for encryption used only to protect the person's own data; if not, set it to true and file the annual self-classification |
| Age rating | Answer the questionnaire | Health and wellness topics (infrequent, mild); no user-generated content shared with others; no unrestricted web. Life itself enforces 18+. **Choose the highest age rating the questionnaire allows**, since the age check relies on what people enter |
| iPad | Phone-only apps aren't reviewed for iPad layout | `supportsTablet` is false |

### Google Play

| Policy | What it asks | Where Life stands |
|---|---|---|
| Health Connect | A declaration per permission, a privacy policy covering Health Connect, and the permissions rationale screen | Declarations drafted in store-privacy.md. **Fix:** when Health Connect opens Life to show the rationale, Life opens Today; it should open the privacy policy |
| Health apps declaration | Declare health features | Wellness: fitness, sleep, nutrition |
| Financial features declaration | Declare finance features | Personal budgeting and tax estimates only |
| Account deletion | In the app, and a web page | In the app; the web page is drafted in `apps/site/delete.html` |
| Data safety | Accurate form | Drafted in store-privacy.md |
| Target audience | Ages | 18 and over |
| Testing | New personal developer accounts must run a closed test with at least 12 testers for 14 days before production | **Owner:** check the account type. See beta-plan.md |
| Predictive back, edge-to-edge | Android 15 and 16 behaviour | Done in Phase 30 |

## Things a reviewer might trip on

1. **Sample data.** Release builds start empty; Ama's sample life only appears in development and preview builds. A reviewer sees the empty states and their own entries. **Blocker:** some screens still start from the sample's numbers on a fresh account (Phase 27 and 29 known limits). The empty life has to land before beta.
2. **Email codes.** Reviewers can't receive a code at their own address unless an email sender is set up. Sign in with Apple avoids the problem. A review account with a fixed code is an option (see below).
3. **AI allowances.** A reviewer who tries many cloud requests could reach a daily allowance. The allowances are well above normal use.
4. **The server.** If the API is down during review, sign-in and cloud AI fail. Set up uptime alerts before submitting.

## A review account (optional)

If you want reviewers to have a ready account, the API could accept one fixed address with a fixed code (for example, `review@domain` with `000000`), set by two server settings and switched off after review. It holds only sample data. This isn't built: say if you want it.
