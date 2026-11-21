# Data protection impact assessment: Life

**Draft for the owner's review and sign-off, and for legal review.** Version 1, 21 November 2026. It follows the ICO's DPIA template. Words in [square brackets] are for the owner to fill in.

## Step 1. Why a DPIA is needed

Life processes health data, which is special category data under Article 9 of the UK GDPR, for everyone who uses its Body, Fuel and readiness features. It also uses AI models to understand and act on what people tell it, combines several kinds of personal information (health, money, people, plans) into one picture of a person's life, and learns patterns of behaviour to time its nudges. The ICO's list of processing likely to result in high risk includes:

- special category data on a large scale;
- innovative technology (AI models, including third-party ones);
- combining and matching data from several sources (phone health data, wearables, what people say, photos);
- tracking behaviour (what moves a person takes or passes, and when).

Any one of these would make a DPIA advisable. Together they make one required before beta testers share real health data.

## Step 2. The processing

### Nature

**Collection.** People type or say things to Life, answer setup questions, log meals, photograph meals and letters, connect Apple Health, Health Connect, WHOOP or Oura, and allow calendar access. Life itself derives readiness, load, stress, food targets, plans and memories from these.

**Storage.** On the phone, in an SQLCipher-encrypted database whose key sits in the Keychain or Keystore. If the person signs in, a copy of their tables is pushed to a Postgres database (Neon, London) through Life's API (Vercel). Photos and letters go to S3-compatible object storage, briefly or until deleted.

**Use.** Planning the day; filing what people say as records; calculating food targets and healthy ranges; estimating tax and benefits; drafting letters; building lessons; timing at most one nudge a day.

**AI.** Phone models first. Cloud models (Anthropic, and possibly OpenAI and Google) only with the person's yes for that request or a standing yes by job. Health details only under a yes that names health. Private mode keeps everything on the phone. The server re-checks consent, private mode and allowances, and records cost but not content.

**Sharing.** Processors only (hosting, database, storage, AI, email, push, crash reports, subscriptions). Nothing is sold, used for advertising or used for training.

**Deletion.** In the app, per memory, per record, or the whole account (30-day grace, then every row and file goes; backups roll off afterwards).

**Data flow, in one line per path:**

| Path | Data | Leaves the phone? |
|---|---|---|
| Apple Health, Health Connect to Life | Sleep, heart, HRV, breathing, SpO2, skin temperature, steps, active energy | No |
| WHOOP, Oura to Life | Sleep, recovery, readiness, activity | Through the API, not stored there |
| Calendar to Life | Busy start and end times only | No |
| Voice to Life | Audio, transcribed on the phone | No (Android may use the system's speech service without an offline pack) |
| Life to backup | Profile, body numbers, meals, records, people, habits, plans, memories (not health memories), settings and consents | Yes, if signed in |
| Life to AI provider | The request and the facts it needs | Yes, with consent, per request or standing |
| Life to storage | Meal photos, labels, letters | Yes, deleted once read unless kept |
| Life to Open Food Facts | One barcode | Yes, straight from the phone |
| Life to Sentry | What broke and where, scrubbed | Yes, if crash reports are on and the build carries a DSN |
| Life to the weekly tally | Week, count, platform | Yes, only if switched on; anonymous |
| Life to Expo push | A nudge's text and the phone's push token | Yes, if notifications are on |

### Scope

**Data.** Identity and contact (email, name); profile (date of birth, town and postcode, household, work, income, pay day, values, personality answers); health (body numbers, sex at birth, meals, food targets, sensor readings, moods, journal, health memories); ethnicity (optional, for healthy ranges); money (income, bills, subscriptions, tax estimates); people (names, relations, birthdays); documents (types, dates; photos of letters if kept); behaviour (moves taken or passed, timing); technical (session IP address and user agent, device ids, push tokens, cost ledger).

**Volume.** Beta: 20 to 50 adults in the UK. Launch: [expected people in year one]. Each person can generate thousands of rows a year, most of them health readings that stay on the phone.

**Retention.** As in the privacy policy: while the account is open; 30 days after deletion; backups roll off within [7] days of that.

**Geography.** People in the UK. Servers in London. AI providers in the US (and the EU for Google).

### Context

- People choose Life and pay for it after a trial. They expect it to know a lot about them, which is the point of the product, and they have been told it works on the phone first.
- Some people will be vulnerable: under financial pressure, with a health condition, with an eating disorder history, or in distress. Life is adults only, but the age check relies on the date of birth people enter.
- People expect their health data to stay private. The app makes promises about this on several screens ("Kept on this phone, encrypted", "Never in iCloud, never for ads, never sold").
- AI is new and its use of personal data is a public concern. Apple's App Review rules (5.1.2(i)) require clear disclosure and permission before personal data goes to a third-party AI.
- Life is a small company's product. Security relies on platform protections, row-level security and a small number of people with access.

### Purposes

To help people plan their days and manage their health, money and life admin in one place, with answers grounded in their own information. Benefits to the person: less mental load, deadlines caught, money found, plans that fit their energy. Benefit to us: a product people pay for.

## Step 3. Consultation

- **People who use Life.** The five-person onboarding test and the beta (20 to 50 people) will include questions on whether the privacy promises are clear and believed. [Record findings here after beta week 2.]
- **Security.** [A security review before beta, covering secrets, dependencies, row-level security and the API.]
- **Legal.** [Name of the adviser who reviewed this DPIA, the privacy policy and the terms, and the date.]
- **Processors.** Data processing agreements and zero data retention terms with every processor that holds personal data (owner task).
- **DPO.** [Whether a data protection officer is needed: Article 37 requires one where core activities involve large-scale processing of special category data. At beta scale this is unlikely to apply; review at launch.]

## Step 4. Necessity and proportionality

| Question | Answer |
|---|---|
| Lawful basis | Contract for the service; explicit consent (Article 9(2)(a)) for health data and ethnicity; consent for cloud AI, the weekly count and notifications; legitimate interests for security and the cost ledger. See the record of processing |
| Does the processing achieve the purpose? | Yes. Planning around sleep needs sleep data; food targets need body numbers; filing needs the words |
| Is there a less intrusive way? | Largely taken already: readings stay on the phone, AI runs on the phone first, the calendar is read for busy times only, the weekly count is anonymous, crash reports are scrubbed. The remaining choice is whether body numbers and meals should be backed up by default when someone signs in (Risk 3) |
| Data minimisation | The calendar gives start and end only. Photos are deleted once read. AI requests carry only the facts the job needs. The cost ledger holds no content. The weekly tally holds no person |
| Accuracy | Every record can be edited. Nothing is filed until confirmed. AI answers must trace numbers to facts |
| Information to people | Privacy policy; the health data screen; per-request and standing AI consent; Your data |
| Rights | Export (one JSON file), edit, forget a memory, delete a record, delete the account in the app and on the web, withdraw each consent |
| Processors | Data processing agreements with each; none may use data for its own purposes |
| International transfers | UK Extension to the EU-US Data Privacy Framework where certified, otherwise the IDTA or Addendum |

## Step 5. Risks

Likelihood: remote, possible, probable. Severity: minimal, significant, severe. Overall: low, medium, high.

| # | Risk to people | Likelihood | Severity | Overall |
|---|---|---|---|---|
| 1 | A breach of the server database exposes health, money and personal details of signed-in people | Possible | Severe | High |
| 2 | Health details reach a cloud AI provider without valid explicit consent, or are kept or used for training by the provider | Possible | Severe | High |
| 3 | The app's promise that health data is "kept on this phone" is broader than reality: body numbers and meals are backed up when someone signs in | Probable | Significant | High |
| 4 | A lost, stolen or shared phone exposes someone's life in Life | Possible | Significant | Medium |
| 5 | AI or rules give harmful guidance: a wrong health reading, a food target that harms someone with an eating disorder, a wrong tax estimate, or a missed sign of crisis | Possible | Severe | High |
| 6 | Life infers sensitive things people didn't tell it (religion from meals, a health condition from habits, sexuality from people) and keeps or shares them | Possible | Significant | Medium |
| 7 | A child uses Life by entering a false date of birth | Possible | Significant | Medium |
| 8 | Data is kept longer than needed: the sync log holds earlier versions of rows, and deleted accounts remain in database backups | Probable | Minimal | Medium |
| 9 | Wearable access keys are stolen and used to read someone's WHOOP or Oura data | Remote | Significant | Low |
| 10 | Notifications show sensitive details on a lock screen | Possible | Significant | Medium |
| 11 | Crash reports carry personal data to Sentry | Possible | Significant | Medium |
| 12 | Someone with access at Life or a processor reads people's data | Remote | Severe | Medium |
| 13 | Account takeover through a sign-in code (forwarded, guessed or intercepted email) | Possible | Severe | High |
| 14 | One phone's settings or permissions reach another phone, or a second account on a shared phone merges into the first | Possible | Significant | Medium |
| 15 | The anonymous weekly count is linked back to a person | Remote | Minimal | Low |

## Step 6. Measures

| # | Measures in place | Further measures | Effect | Residual | Approved |
|---|---|---|---|---|---|
| 1 | Row-level security on every person's table, enforced by Postgres and checked at start-up (the API refuses to run as a superuser); TLS; encryption at rest (Neon, storage); secrets only on the server; wearable keys sealed with AES-256-GCM; signed five-minute links; readings never backed up | Security review before beta; restrict production access to [named role] with logged access; uptime and anomaly alerts; Neon IP allow list; consider encrypting body numbers and meals with a key held on the phone (client-side encryption) | Reduced | Medium | [ ] |
| 2 | Per-request or standing consent by job and location; health only under a grant naming health; phone strips what consent doesn't cover; server re-checks consent from its own synced copy, never from the request; private mode; grants expire after 12 months and lapse when the policy version changes; revoked grants kept as a record | Zero data retention agreements with each provider before beta; business terms that forbid training; keep Google on its EU endpoint only; confirm each provider's DPF certification | Reduced | Low | [ ] |
| 3 | The health data screen and sign-in screen now say what is backed up (changed in Phase 31) | **Owner decision:** keep backing up body numbers and meals on sign-in and say so (A), or keep them on the phone unless a "Back up health data" switch is on (B, recommended, one build step) | Reduced | Low with B, Medium with A | [ ] |
| 4 | SQLCipher database, key in Keychain or Keystore for this phone only; the database is left out of iCloud and Android backups (Phase 31); phone passcode and biometrics; private mode | An optional Face ID or fingerprint lock for Life; hide numbers on open | Reduced | Low | [ ] |
| 5 | Wellness and guidance framing on every relevant screen; numbers only from traced facts; nothing filed until confirmed; estimates labelled; crisis words detected on the phone and on the server, with support shown and nothing sent to a model; adults only; hide numbers; food targets have safe floors | Safety evaluation set run before each model change; an eating disorder screening question before food targets, with a gentler mode; clinical review of readiness and food target wording; MHRA check that Life is not a medical device | Reduced | Medium | [ ] |
| 6 | Memories are visible, editable and forgettable; a forgotten memory is wiped on the server, not hidden; no profiling for ads | Brain rule: never store an inference about a special category unless the person said it; show "why Life thinks this" on each memory | Reduced | Low | [ ] |
| 7 | Date of birth check at first open; an under-18 result is kept so another date can't simply be tried; the date itself isn't kept; App Store and Play age ratings | Store age rating set to the highest available; monitor support for signs of under-18 users | Reduced | Low | [ ] |
| 8 | Account deletion removes the sync log with every other row; a forgotten memory's earlier versions are dropped | Sync log compaction (snapshot rows, trim old ops) once accounts are large; record Neon's point-in-time restore window and keep it at [7] days; a deletion log so restored backups can be re-purged | Reduced | Low | [ ] |
| 9 | Keys sealed with AES-256-GCM using a server-only key; one-time signed OAuth state; disconnect deletes the key and revokes it at the provider | Tie the OAuth sign-in to the browser that started it; key rotation procedure | Reduced | Low | [ ] |
| 10 | At most one nudge a day; quiet hours | Check every nudge template for health or money detail on the lock screen; default to "hide preview" wording for sensitive kinds | Reduced | Low | [ ] |
| 11 | No personal data, tracing, replay, screenshots or view hierarchy; user, request, extras and device name removed; breadcrumbs keep only the kind of step; a switch to turn off | Use Sentry's EU region; owner decision on default (on unless off, or off until yes, per PECR) | Reduced | Low | [ ] |
| 12 | Row-level security means even the API only sees one person at a time; no admin screens | Named access list; least privilege roles; Neon and Vercel audit logs reviewed monthly | Reduced | Low | [ ] |
| 13 | Six-digit codes valid for 10 minutes; limited attempts; Sign in with Apple and Google as alternatives | Rate limit code requests per address and per IP; alert on many failed attempts; tell the person by email when a new phone signs in | Reduced | Medium | [ ] |
| 14 | Phone-only choices never sync (Phase 30) | Clear the phone before signing in to a different account | Reduced | Low | [ ] |
| 15 | The tally holds week, platform and count only; the session is checked and not stored | None | Accepted | Low | [ ] |

## Step 7. Sign-off

| Item | Name and date | Notes |
|---|---|---|
| Measures approved by | [Owner] | Integrate actions into the beta plan and fix list |
| Residual risks approved by | [Owner] | If any residual risk stays high, consult the ICO before processing |
| DPO advice | [Name or "not appointed"] | |
| Legal review | [Adviser] | |
| Consultation responses reviewed | [Owner] | After beta week 2 |
| Next review | [Date, and whenever a new processor, AI provider or kind of data is added] | Bump `CONSENT_POLICY_VERSION` when people should agree again |

## Actions before beta

1. Owner decision on Risk 3 (A or B).
2. Data processing agreements and zero data retention with each processor.
3. Security review.
4. Sentry EU region, and a decision on the crash reports default.
5. Rate limits on sign-in codes.
6. Lock screen wording check for nudges.
7. ICO fee paid and registration number added to the privacy policy.
