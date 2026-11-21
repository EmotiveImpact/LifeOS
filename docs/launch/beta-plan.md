# Beta plan

**Draft.** Version 1, 21 November 2026. How Life gets from here to 20 to 50 people using it on their own phones, what we learn from them, and when it's ready for the stores.

## Before the first tester

Everything marked P0 in [fix-list.md](fix-list.md). In short:

1. **Owner accounts and settings:** Apple Developer, App Store Connect, Play Console, EAS, the Neon and Vercel production setup, an email sender, Sign in with Apple and Google, AI keys with zero retention, Sentry, the domain.
2. **Legal:** the DPIA signed off (with the backup decision), the ICO fee paid, the privacy policy published at a real address.
3. **Build:** real accounts start empty (F-01), support reaches a person (F-10), sign-in code rate limits (F-11), then a security review (F-12).

Billing is not needed for the beta. TestFlight and Play testing tracks don't charge, and testers use the full app.

## Builds

| Track | Profile | How it gets there | Who | Review |
|---|---|---|---|---|
| iPhone, internal | `production` (store build) | `eas build -p ios --profile production`, then `eas submit -p ios` to TestFlight | Up to 100 people on the App Store Connect team | None |
| iPhone, external | the same build | A TestFlight group with a public link | Up to 10,000 testers | Apple's Beta App Review, usually within a day, once per version |
| Android, internal | `production` | `eas build -p android --profile production`, then `eas submit -p android` (the internal track, as a draft, set in `eas.json`) | Up to 100 testers by email list | None |
| Android, closed | the same build | Promote to a closed testing track | Any number, by list or Google Group | Google's review |
| Simulators and Maestro | `e2e` | `eas build --profile e2e` | Us | n/a |

Release builds start with an empty life. The `preview` and `e2e` profiles carry Ama's sample life for reviews and automated flows, never for testers.

**Over-the-air updates.** The app checks for updates on launch (`expo-updates`, runtime version by fingerprint). JavaScript-only fixes go out with `eas update --channel production` during the beta; anything native needs a new build.

**If the Play account is personal**, Google needs a closed test with at least 12 testers opted in for 14 days in a row before it allows production. Start the closed track by week 2 so the 14 days finish with the beta.

## Who

**Number:** 5 in week 1, 20 by week 2, up to 50 by week 4.

**Mix:** iPhone and Android, roughly as the UK splits (about half each); people with an Apple Watch, WHOOP or Oura, and people with nothing on their wrist; renters and owners; employed and self-employed; a range of ages over 18; people who are comfortable with apps and people who aren't; at least two who use VoiceOver, TalkBack or large text.

**Not:** anyone under 18; anyone currently in treatment for an eating disorder (food targets aren't built for that yet, fix F-56).

**Where from:** the waitlist on the website, friends of friends, and one or two communities that match the mix. Each tester gets the beta note below before an invitation.

## What testers are told

> Thanks for trying Life before anyone else. It's a test version, so some things will break, and we'll fix them fast.
>
> - Use it with your real life, as much or as little as you like. Your data is handled exactly as the privacy policy says: it stays on your phone unless you sign in, readings from Apple Health, Health Connect and what you wear never leave it, and we never sell it or use it to train AI.
> - We can't see inside your Life. We only know what you tell us, what the crash reports say (if they're on), and the weekly count (if you switch it on).
> - Tell us anything: Help, Email us in the app, or reply to the invite. Screenshots help.
> - Life is wellness guidance, not medical care, and money guidance, not financial advice.
> - You can delete your account at any time in You, Settings, Your data.
> - The beta is free. [When the beta ends, testers get [three months] free.]

## How we learn

We have no analytics in the app, by design. What we know comes from:

| Source | What it tells us |
|---|---|
| Sentry crash reports (where on) | Crash-free sessions per version, the crashes to fix first |
| The weekly count (for testers who switch it on) | Moves finished per week: the north star |
| TestFlight feedback (screenshot and comment) and Play's tester feedback | Bugs and confusion, in the moment |
| Support email | Everything else |
| Five observed onboarding sessions in week 1 (video call, screen shared, the tester thinks aloud) | Where people hesitate, what they misread |
| A short check-in at the end of weeks 2 and 4 (five questions) | Whether Life helps, what they'd miss, whether the privacy promises are clear and believed |
| The server's own health: uptime, error rate, AI spend per day | Whether the service holds up |

**The five questions:**

1. In the last week, did Life help you do something you'd otherwise have put off? What?
2. What did you open Life for most?
3. What confused or annoyed you?
4. Do you trust what Life does with your data? Why, or why not?
5. If Life disappeared tomorrow, how would you feel? (Very disappointed, somewhat disappointed, not disappointed)

## Triage

Every report becomes a row in the fix list, with a priority:

- **P0, stop the beta:** data loss, a privacy promise broken, health or money guidance that could harm, a crash at open. Fix the same day, ship by update or new build, tell the testers affected.
- **P1, fix this week:** a crash elsewhere, a flow people can't finish, wrong numbers.
- **P2, fix before launch:** confusing copy, layout faults, slowness.
- **P3, later:** ideas.

## Schedule

| Week | What |
|---|---|
| 0 | P0 fixes; internal builds on our own phones; Maestro on simulators; VoiceOver and TalkBack by ear |
| 1 | 5 testers; the five observed onboarding sessions; fix what they find |
| 2 | 20 testers; the closed Play track starts if needed; first check-in |
| 3 | Billing in a TestFlight build (sandbox purchases), so the paywall is tested before launch |
| 4 | Up to 50 testers; second check-in; store listing, screenshots and forms ready |
| 5 | Launch review with Edem: go, or another round |

## Ready for the stores when

- Crash-free sessions at 99.5% or better over the last week of the beta.
- No P0 or P1 open.
- At least 4 of the 5 observed testers finish onboarding without help.
- Sync checked by at least five testers with two phones, or a phone and a reinstall.
- VoiceOver and TalkBack pass a run through onboarding, Today, Talk and Your data.
- At least 40% of testers answer "very disappointed" to question 5 (the usual sign that a product is wanted).
- The privacy policy, terms and DPIA are signed off, and every placeholder is filled.
- Billing works with sandbox purchases on both platforms, including restore and cancel.
- The store forms match store-privacy.md and the app as built.
