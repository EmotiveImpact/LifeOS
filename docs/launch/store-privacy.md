# Store privacy answers

**Draft.** Answers for App Store Connect's App Privacy section and Google Play's Data safety form, with the health declarations both stores ask for. Version 1, 21 November 2026.

Both stores count data as "collected" when it leaves the phone and is kept longer than it takes to answer the request. Data handled only on the phone is not collected. That is why readings from Apple Health and Health Connect, the calendar, voice, moods and the journal appear nowhere below.

Two owner items change these answers:

1. **Zero data retention with the AI providers.** With it, a cloud AI request is processed and not kept, so neither store counts it as collected. Without it, the provider keeps requests for up to 30 days, and the content of requests (User Content, Health, Financial Info) must be declared as collected for App Functionality. The answers below assume zero retention is in place before submission.
2. **The Risk 3 decision in the DPIA.** If body numbers and meals stay on the phone unless a backup switch is on, they are still declared (because some people will switch it on), marked optional.

## Apple: App Privacy

**Tracking:** No. Life doesn't link data with other companies' data for advertising, or share it with data brokers.

**Privacy policy URL:** [https://domain/privacy]. **Privacy choices URL (optional):** [https://domain/delete].

| Apple data type | Collected | Linked to the person | Tracking | Purposes | What it is in Life |
|---|---|---|---|---|---|
| Contact Info: Name | Yes | Yes | No | App Functionality | Name in the profile, and from Apple or Google sign-in if shared |
| Contact Info: Email Address | Yes | Yes | No | App Functionality | Sign-in and account |
| Health & Fitness: Health | Yes | Yes | No | App Functionality | Body numbers (height, weight, waist, body fat, sex at birth), meals and food targets, backed up when signed in |
| Health & Fitness: Fitness | No | | | | Steps, active energy and workouts stay on the phone |
| Financial Info: Other Financial Info | Yes | Yes | No | App Functionality | Income, bills, subscriptions and tax details people enter, backed up when signed in |
| Financial Info: Payment Info | No | | | | Apple takes payment; Life never sees cards |
| Sensitive Info | Yes | Yes | No | App Functionality | Ethnicity, only if given, for healthy ranges |
| Location: Precise or Coarse | No | | | | Life never reads the phone's location. Town and postcode are typed by the person and declared as Other User Content |
| Contacts | No | | | | Life doesn't read the address book. People added by hand are Other User Content |
| User Content: Photos or Videos | Yes | Yes | No | App Functionality | Meal and label photos (deleted once read, within a day) and letters people choose to keep |
| User Content: Audio Data | No | | | | Speech is turned into text on the phone |
| User Content: Customer Support | Yes | Yes | No | App Functionality | Emails to support |
| User Content: Other User Content | Yes | Yes | No | App Functionality | Profile answers, records, plans, missions, habits, people, memories, documents and settings |
| Identifiers: User ID | Yes | Yes | No | App Functionality | Account id |
| Identifiers: Device ID | Yes | Yes | No | App Functionality | Life's own id for each signed-in phone, and its push token |
| Purchases: Purchase History | Yes, once billing is built | Yes | No | App Functionality | Subscription status through RevenueCat |
| Usage Data: Product Interaction | Yes, optional | No | No | Analytics | The weekly count of finished moves, off unless switched on, anonymous |
| Usage Data: Advertising Data | No | | | | |
| Diagnostics: Crash Data | Yes | No | No | App Functionality | Sentry crash reports, scrubbed, with a random install id |
| Diagnostics: Performance Data | No | | | | Tracing is off |
| Browsing History, Search History | No | | | | |
| Surroundings, Body | No | | | | |

**Notes for whoever fills this in:**

- Apple asks per data type whether it is "used to track you". Every answer is No.
- "Linked to you" is Yes for everything held with the account. The weekly count and crash reports are not linked: the count holds no person, and crash reports carry only Sentry's random install id.
- If the person never signs in, Life collects almost nothing (crash reports and, if switched on, the weekly count). Apple's form has no way to say "only when signed in", so declare the signed-in case.

### HealthKit

- Entitlement: HealthKit, read only. `NSHealthUpdateUsageDescription` is off, so Life never writes.
- Usage text: "Life reads only the sleep, heart and activity you switch on, to show your readiness and plan your day. It stays on your phone."
- Types read: sleep analysis, heart rate, heart rate variability, resting heart rate, respiratory rate, oxygen saturation, wrist temperature, step count, active energy.
- No HealthKit data is stored in iCloud, used for advertising, sold, or sent to our servers.
- Clinical health records: not used.

## Google Play: Data safety

**Does your app collect or share any of the required user data types?** Yes.
**Is all of the user data collected by your app encrypted in transit?** Yes.
**Do you provide a way for users to request that their data is deleted?** Yes: in the app (You, Settings, Your data, Delete my account) and on the web at [https://domain/delete].
**Data shared with third parties:** None. Processors acting for us, and transfers the person starts (WHOOP, Oura), don't count as sharing.

| Play category: type | Collected | Shared | Optional | Ephemeral | Purposes |
|---|---|---|---|---|---|
| Personal info: Name | Yes | No | Yes | No | App functionality, Account management |
| Personal info: Email address | Yes | No | Yes (only with an account) | No | App functionality, Account management |
| Personal info: User IDs | Yes | No | Yes | No | App functionality, Account management |
| Personal info: Address | No | | | | Town and postcode are "Other info" |
| Personal info: Race and ethnicity | Yes | No | Yes | No | App functionality (healthy ranges) |
| Personal info: Other info | Yes | No | Yes | No | App functionality (date of birth, town, postcode, household, work) |
| Financial info: Other financial info | Yes | No | Yes | No | App functionality |
| Financial info: Purchase history | Yes, once billing is built | No | No | No | App functionality, Account management |
| Health and fitness: Health info | Yes | No | Yes | No | App functionality (body numbers, meals, food targets) |
| Health and fitness: Fitness info | No | | | | Health Connect and wearable readings stay on the phone; wearable readings pass through the server without being kept |
| Photos and videos: Photos | Yes | No | Yes | No | App functionality |
| Files and docs | Yes | No | Yes | No | App functionality (letters kept as PDFs) |
| Audio | No | | | | On-device speech |
| Calendar | No | | | | Read on the phone, busy times only |
| Contacts | No | | | | |
| App activity: Other user-generated content | Yes | No | Yes | No | App functionality (records, plans, people, memories) |
| App activity: App interactions | Yes | No | Yes | No | Analytics (the weekly count, opt-in, anonymous) |
| App info and performance: Crash logs | Yes | No | Yes | No | App functionality (Sentry) |
| Device or other IDs | Yes | No | Yes | No | App functionality (device id, push token) |
| Location | No | | | | |
| Messages, Web browsing, Installed apps | No | | | | |

### Health Connect

Google needs a declaration for each Health Connect permission, a privacy policy that covers Health Connect data, and a screen in the app that shows the rationale (the "permissions rationale" activity).

| Permission | Why Life needs it |
|---|---|
| READ_SLEEP | Plans the day around last night's sleep; readiness |
| READ_HEART_RATE | Readiness, load and stress through the day |
| READ_HEART_RATE_VARIABILITY | Readiness and recovery |
| READ_RESTING_HEART_RATE | Readiness baseline |
| READ_RESPIRATORY_RATE | Readiness signal during sleep |
| READ_OXYGEN_SATURATION | Readiness signal during sleep |
| READ_SKIN_TEMPERATURE | Readiness signal during sleep |
| READ_STEPS | Daily activity and load |
| READ_ACTIVE_CALORIES_BURNED | Food targets that follow the day's activity |

All read only, all kept on the phone, none sent to our servers, none used for advertising. **Check before submission:** that the Android build has the permissions rationale activity Health Connect requires (`react-native-health-connect`'s config plugin adds an intent filter for `androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE`; confirm it is in the generated manifest and that it opens the privacy policy).

### Other Play declarations

- **Health apps declaration:** Life is a wellness app (fitness, sleep, nutrition). Not a medical device, not clinical, no regulated medical functions.
- **Financial features declaration:** Life offers personal budgeting and tax estimates. It doesn't offer loans, banking, payments, trading, insurance or crypto. No bank connection at launch.
- **Target audience:** 18 and over only.
- **Ads:** None.
- **Account deletion:** in the app and on the web page.
- **Government app:** No.
