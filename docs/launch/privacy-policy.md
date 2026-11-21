# Life privacy policy

**Draft for legal review.** Version 1, [date]. Words in [square brackets] are for the owner to fill in before this is published.

Life is a phone app that helps you plan your day and keep on top of your health, money and life admin. This policy explains what Life does with information about you, where it goes, how long it stays and what you can do about it. It is written to be read, so it uses plain words. Where it says "we", it means [Company name], the company that makes Life.

## The short version

- Life works on your phone first. Everything you give it is kept there, in an encrypted database.
- Readings from Apple Health, Health Connect and anything you wear stay on your phone. They are never backed up to our servers.
- If you sign in, a copy of the rest of your life in Life (your profile, plans, records, people, habits, meals and body numbers) is backed up, encrypted, in the UK, so it survives a new phone and reaches your other phone.
- When Life needs a cloud AI model to answer you, it asks first. Health details travel only when your yes covers them. Private mode keeps everything on the phone.
- We never sell your data, never use it for advertising and never use it to train AI models.
- You can see, download, correct and delete what Life holds, from inside the app.

## Who we are

[Company name] is the controller of your personal data for Life. We are registered in [England and Wales] under company number [number], at [registered address]. Our registration with the Information Commissioner's Office is [ICO registration number].

To ask anything about your data, email [privacy@domain]. A person reads every message and replies within [one working day], and we answer formal requests within one month.

## Who Life is for

Life is for adults. It asks for your date of birth when you first open it. If you are under 18, it stops there. It keeps the fact that it stopped, so a different date can't simply be tried, but it does not keep the date you entered.

## What Life holds, and where

### Kept only on your phone

These never leave your phone:

- **Readings from Apple Health or Health Connect**: sleep, heart rate, heart rate variability, resting heart rate, breathing rate, blood oxygen, skin temperature, steps and active energy. Life reads only the kinds you switch on, and only after you have said yes to Life using health data. It never writes to Apple Health or Health Connect.
- **Moods, journal entries, chat history and drafts.**
- **Your voice.** When you talk to Life, your words are turned into text on the phone itself (on iPhone, Apple's on-device speech recognition; on Android, the phone's offline speech recognition where it has it). On an Android phone without offline speech, Android's own speech service may handle the audio under Google's terms. Audio never reaches us.
- **Your calendar.** Life reads only when you are busy, so it can fit nudges around your day. It never reads what your events are called, where they are or who is in them, and it never changes your calendar.
- **What Life learns about your habits**: which suggestions you take or pass, when you tend to do things, and the log of nudges it has sent.
- **Your phone's permissions**, such as whether you allowed notifications or the camera.

The database on your phone is encrypted with SQLCipher. Its key is kept in your phone's secure storage (the Keychain on iPhone, the Keystore on Android). The database is left out of iCloud and other phone backups, so health data is never stored in iCloud; signing in is how a new phone gets your life back.

### Backed up when you sign in

Signing in is optional. You can use Life without an account and keep everything on the phone. If you sign in with Apple, Google or an emailed code, Life backs up a copy of the following, so you can restore it on a new phone and see it on another phone of yours:

- **Your account**: your email address, and your name if Apple or Google passes it on.
- **Your profile**: name, date of birth, town or city and postcode, household, work status and income, pay day, and the answers you give about your values, personality and when you work best.
- **Your body numbers**: height, weight, waist, body fat, sex at birth and, if you give it, your ethnicity, which some healthy ranges depend on. These count as health data, and ethnicity is also special category data.
- **Your food**: meals you log and the targets Life works out with you. These count as health data.
- **Your plans and records**: your Aim, missions and their steps, bills, subscriptions, renewals, documents, dates, appointments, habits and what you've learned.
- **People** you add: their names, how you know them and dates such as birthdays.
- **Memories**: short notes Life keeps so it doesn't have to ask twice. Memories about your health stay on the phone unless you switch on backing them up.
- **Your settings and choices**, including your yes or no to health data and to cloud AI, with the date you gave it.

This copy is held in a Postgres database run by Neon in London, and reached through Life's server hosted by Vercel in [London]. Each person's rows are locked to that person by the database itself (row-level security). Data is encrypted in transit and at rest.

The server also keeps a record of each sign-in session (the address it came from and the app version) while the session lasts, and a list of your signed-in phones with their notification addresses.

### Photos and letters

When you photograph a meal, a food label or a letter, Life uploads it to our file storage ([Cloudflare R2 / Amazon S3] in [the EU / the UK]) using a link that works for five minutes. A photo Life only needs to read is deleted as soon as it has been read, and in any case within a day. A letter or document you choose to keep stays until you delete it or your account. A photo sent for reading also goes to an AI model for that one reading.

### Barcodes

When you scan a barcode, your phone asks Open Food Facts, a free food database, about that one barcode. Open Food Facts sees the barcode and your phone's internet address, as any website would. It receives nothing else from Life. Food facts are © Open Food Facts contributors, under the Open Database Licence.

### Wearables

If you connect WHOOP or Oura, you sign in on their own website and choose what to share. Life's server keeps the access key they issue, sealed with AES-256 encryption, so it can fetch your readings. Readings pass through the server to your phone and are never stored on our servers. Disconnecting deletes the key. WHOOP and Oura handle your data under their own privacy policies. Life never connects to a WHOOP strap directly over Bluetooth.

## How Life uses AI

Life uses AI to understand what you tell it, file it in the right place, explain your plan, draft letters, build lessons and read photos of meals and letters.

**On the phone first.** Where your phone has built-in AI (Apple Intelligence on recent iPhones), Life uses it. On phones without it, Life can download a small open model over Wi-Fi. Both run entirely on the phone.

**The cloud, with your yes.** Some jobs need a larger model. Before Life sends anything to one, it asks. You can say yes for one request, or give a standing yes in Settings for particular jobs. A standing yes lasts up to 12 months, ends at once if you take it back, and lapses if this policy changes in a way you should agree to again. Health details are only sent when your yes names health.

**Private mode** keeps every AI job on your phone, whatever you said yes to before.

**What is sent.** Only what the job needs: your request and the facts from your life that it depends on. Your phone leaves out anything your yes doesn't cover. Requests go through Life's server, which checks your yes again and then sends the request to one of these providers:

| Provider | Where it processes | Used for |
|---|---|---|
| Anthropic (Claude models) | United States | Most jobs |
| [OpenAI] | [United States] | [A second choice when Anthropic is busy] |
| [Google (Gemini models), through Google Cloud's EU endpoint] | [European Union] | [A second choice for some jobs] |

We use these providers' business services under contracts that forbid them from training models on your data. [We have zero data retention agreements with each of them, so they do not keep requests after answering.] [If not yet in place: They may keep requests for up to 30 days for safety monitoring, then delete them.]

**What we keep.** For each cloud request, our server records which job it was, which model answered, how many words (tokens) it used and what it cost, so we can keep costs fair and spot problems. We do not keep the words of the request or the answer on the server.

**If you sound like you are in distress**, Life notices on the phone and again on the server, and shows ways to get support straight away. It doesn't send those words to an AI model and doesn't file them.

**Decisions.** Life suggests moves, plans and food targets. It doesn't make decisions about you that have legal or similarly significant effects, and you can always change or ignore what it suggests.

## Optional sharing you can switch on or off

- **Share how much gets done.** Off unless you switch it on in Your data. Once a week, Life sends one number: how many moves you finished that week, the week itself and whether you use an iPhone or an Android phone. No name, account, device or time travels with it. Our server adds it to a running tally and keeps nothing that says whose it was. Switching it off stops it and forgets the count kept on your phone.
- **Crash reports.** When Life crashes, it can send a report to Sentry, a service that collects crash reports, so we can fix the problem. A report says what broke and where in Life's code. It does not include your name, your account, what you typed, what is on your screen, your requests or your data. Crash reports from inside the phone's native code carry Sentry's random install number. You can switch crash reports off in Your data. [Owner decision: on unless switched off, or off until you say yes.]
- **Notifications.** If you allow them, Life sends at most one nudge a day, plus deadlines you ask for. To reach your phone, our server sends the nudge through Expo's notification service to Apple or Google. A nudge never names a money or health matter, so what shows on a locked screen stays general.

## Payments

[When billing is built:] Life is a paid app with a free trial. Apple or Google takes the payment, and we never see your card. We use RevenueCat to check that your subscription is active. RevenueCat receives an anonymous number for your account and the receipt from Apple or Google, and keeps a history of your purchases. Apple and Google handle payments under their own privacy policies.

## Why we are allowed to use your data

UK data protection law says we must have a lawful basis for each use. Ours are:

| What | Lawful basis |
|---|---|
| Running Life, your account, backup, sync between your phones and support | Contract: it is the service you asked for |
| Health data (body numbers, meals, readings, health memories) | Your explicit consent. You give it on the health data screen, and you can take it back there or in Settings at any time |
| Sending a request to a cloud AI model | Your consent, given for that request or as a standing yes. For health details, your explicit consent |
| Ethnicity, if you give it | Your explicit consent |
| The weekly count | Your consent, by switching it on |
| Crash reports | [Our legitimate interest in keeping Life working / your consent, depending on the owner's decision] |
| Keeping Life secure and preventing misuse, including the cost ledger | Our legitimate interest in running a safe, affordable service |
| Keeping records the law requires, and answering legal requests | Legal obligation |

Taking back consent does not make earlier use unlawful, but Life stops straight away. Taking back your health data yes stops Life reading or using health data, and you can delete what it holds.

## Who else handles your data

We use these companies to run Life. Each acts only on our instructions, under a data processing agreement, and may not use your data for its own purposes.

| Company | What it does | Where |
|---|---|---|
| Vercel | Hosts Life's server | [London, UK] (US company) |
| Neon | Runs the database for backups and sync | London, UK (US company) |
| [Cloudflare / Amazon Web Services] | Stores photos and letters | [EU / UK] |
| Anthropic | AI models | United States |
| [OpenAI] | [AI models] | [United States] |
| [Google Cloud] | [AI models] | [EU] |
| [Email provider] | Sends sign-in codes | [Region] |
| Expo | Delivers notifications | United States |
| Sentry | Crash reports, if on | [EU (Germany)] |
| [RevenueCat] | [Checks subscriptions] | [United States] |

Apple and Google also receive data when you use their services through Life (Sign in with Apple, Google sign-in, Apple Health, Health Connect, notifications and payments). They handle it as independent controllers under their own policies. The same goes for WHOOP, Oura and Open Food Facts when you choose to use them.

We will share data with the police, a regulator or a court only when the law requires it, and we will tell you unless the law forbids that.

## Data leaving the UK

Some of the companies above process data in the United States or the European Union. The EU has UK adequacy, so data can go there with the same protection. For the United States, we rely on the UK Extension to the EU-US Data Privacy Framework where the company is certified, and otherwise on the UK International Data Transfer Addendum to the EU's standard contractual clauses. You can ask us for a copy of these safeguards.

## How long we keep things

| What | How long |
|---|---|
| Everything on your phone | Until you delete it, delete your account or delete the app |
| Your backed-up life | While your account is open |
| After you delete your account | Sessions end at once. Your account closes and can be reopened by signing in within 30 days. After 30 days every row and file is deleted. Backups of the database roll off within [7] days after that |
| Sign-in codes | 10 minutes |
| Counts of sign-in attempts, to stop people guessing codes (kept as scrambled values, never your email or network address) | A day |
| Sign-in sessions | Until you sign out, or 7 days after you last used Life |
| Photos only needed for reading | Deleted once read, and within a day at most |
| Kept letters and documents | Until you delete them or your account |
| The cost ledger for AI requests | While your account is open |
| Wearable access keys | Until you disconnect, or delete your account |
| Crash reports | [90] days |
| Emails to support | [Two years] after we last hear from you |
| The weekly tally | Kept, because it holds nothing about you |

## Keeping it safe

- The database on your phone is encrypted, and its key never leaves the phone's secure storage.
- Everything between your phone and our server is encrypted with TLS.
- On the server, each person's rows can only be read with that person's session, enforced by the database itself. Wearable keys are sealed with AES-256-GCM. Secret keys for outside services live only on the server, never in the app.
- Links to photos last five minutes and allow one thing on one file.
- Only [named role] can reach the production database, and every reach is logged.

If something goes wrong that puts your rights at risk, we will tell the ICO within 72 hours and tell you without delay.

## Your rights

You have the right to:

- **See your data.** You, Settings, Your data, See it all.
- **Take a copy.** Your data, Download everything gives you one file, in JSON. Signed in, you can also ask for everything the server holds.
- **Correct it.** Every record in Life can be edited.
- **Delete it.** Forget a single memory, delete a record, or delete your account from Your data, Delete my account. You can also ask on the web at [domain/delete] or by email.
- **Take back consent** to health data, cloud AI, the weekly count or crash reports, at any time, in Settings.
- **Object** to uses based on our legitimate interests, and **ask us to restrict** what we do while a question is settled.
- **Complain.** Please tell us first at [privacy@domain]. You can also complain to the Information Commissioner's Office at ico.org.uk or on 0303 123 1113.

We don't charge for any of this.

## What we never do

- Sell your data.
- Use it for advertising, or let advertisers into Life.
- Use your data to train AI models, ours or anyone else's.
- Track you across other apps and websites.
- Store health data in iCloud.

## Changes

If we change this policy, we will say so in Life before the change takes effect. If a change affects what you agreed to, Life will ask again, and your earlier standing yes to cloud AI lapses until you do.

## Contact

[Company name], [registered address]. Email [privacy@domain].
