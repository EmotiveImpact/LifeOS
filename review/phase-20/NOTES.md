# Phase 20 · First open, States, Outside the app, the orb

Branch `phase-20-v26-first-open-states`, from `phase-18-v26-learn`. 35 board screens rebuilt to V26, plus three items from the gap list that Edem approved on 20 November: an 18+ age check, a recorded health-data consent step, and phone only.

## What was built

| Chapter | Screens | Where |
|---|---|---|
| First open (16) | welcome, **agecheck** (new), question, tell, building, where, **healthconsent** (new), healthprimer, notifprimer, micprimer, camprimer, calprimer, devicesetup, firstmove, measuresetup, signin | `src/screens/v26/firstopen.tsx` |
| States (12) | emptytoday, loadingtoday, emptyplan, emptybody (plus "health is off"), connectfail, offline, permdenied, syncissue, aidown, forceupdate, signedout, support | `src/screens/v26/states.tsx` |
| Outside the app (6) | widgets (Home Screen, and Lock Screen Live Activity), sharecard, watch, lockpush, androidwidget, siri | `src/screens/v26/outside.tsx` |
| The orb (3) | orb, topbars, orbnext | `src/screens/v26/outside.tsx` |

Words and figures that no engine produces yet (helplines, sample sync figures, the setup order, the share-card week) live in `src/state/firstopen.ts`, not inline in screens. `Onboarding.tsx`, `States.tsx`, `Outside.tsx` and the six parent switches (Today, Plan, Body, Money, Talk, Fuel) only dispatch. The V23 `ParentStateContent` is gone; `/design` now links to every real V26 state and preview instead of drawing copies.

**Setup order:** Welcome, date of birth, one question, where you live, health data consent, body numbers, what you wear, Apple Health, nudges, your Aim, building your plan, save your progress, your first move. Saying no to health data skips straight from consent to nudges.

## The 18+ age check (new)

- One neutral question, "When were you born?", three number fields. It never says the age limit up front, so it doesn't invite a made-up year. Impossible dates and future dates get one plain line.
- Adults: the date of birth goes on the profile (`profile.dateOfBirth`, which the phone store already maps to `date_of_birth`) and `profile.age` is set from it. The result is recorded as `choices['age-check']` = `{ result, at }`.
- Under 18: a calm stop screen ("life is for adults, for now") with Childline (0800 1111). Their date of birth is **not** kept, only the fact and the time. The answer is remembered, so going back and typing another year doesn't get round it.
- Skip on Welcome still goes through the check. A real account that finished setup without a check (or with an under-18 answer) is sent to it when the app opens (`(tabs)/index.tsx`). The sample life in development builds is an adult and skips it.
- This is a self-declared check, which is what SPEC 9.20 and the stores expect at launch; it is not identity verification.

## Health data consent (new)

- Health data is special category data under UK GDPR, so life asks for a clear, separate yes before it reads or keeps any: body numbers, sleep, heart and workouts, and what you log. The screen says what it covers and what life promises, and has three states: asking, "You said yes on 20 November 2026", and "You took your yes back".
- The yes is recorded as `choices['health-consent']` = `{ version, at, scope, types, from }`. The four kinds (sleep, heart, workouts, food) come from the Apple Health switches; changing a switch updates the record. "Not now" records `health-consent-declined`.
- **Withdrawing** clears the yes, records the time, and switches off the health and device flags. Every Body page that reads health data (all of Body except breathing, devices, sources and provenance) then shows "Body is off" with one button back to consent. Tested in the browser: agree, withdraw, then Readiness shows "Body is off".
- Opens from setup, from Body (`healthconsent?next=body`) and, once Phase 19 links it, from Settings. Withdrawal must be as easy as saying yes, so it sits on the same screen.
- No schema change before Phase 21. Phase 21 should add a `consents` table (kind, version, scope, given_at, withdrawn_at) and sync it, and Phase 26 must check `healthAllowed()` before reading HealthKit or Health Connect. Today's Body tiles still show sample numbers in development builds after a withdrawal; real accounts have none to show until Phase 26, which must respect the same check.

## Phone only

`app.json` now has `ios.supportsTablet: false`, so the App Store build is iPhone only. Expo has no matching Android switch: exclude tablets in the Play Console device catalogue (or with a `<supports-screens>` rule in a config plugin) before the first Play upload. Orientation was already portrait. iPad can come back later by flipping the flag and testing the wider layouts.

## Real accounts meet the empty states on their own

- Today and Plan show their day-one states for a real account (no sample life) until the first thing of its own is filed (`isDayOne`). Previews: `today?state=emptytoday`, `plan?state=emptyplan`.
- Body shows "health is off" until consent, then the phone-only state with dashes (never a 0 dressed up as a reading) until Phase 26 brings readings.
- A declined camera now lands on "The camera is off for life" whenever Snap opens, not only on the preview link. "Open Settings" asks the phone directly if it never asked before, otherwise opens Settings, and coming back with the camera on goes straight to the camera.
- Support quietens nudges for three days (`choices['nudges-quiet-until']`).
- Chat paused queues messages on the phone (`choices['chat-queue']`) with an Undo. Sending the queue when chat is back belongs to Phase 24/25 (BUILD_V26 edge case 3).

## Distress on "Or just tell life"

Asked for by the brain rules thread: if what someone types or says on setup's Tell screen matches the brain's self-harm check, nothing is filed and the app opens Support, as Talk does. The check (`needsSupport` in `state/firstopen.ts`) copies the regular expression in `runBrain` today. When the brain rules branch exports its own check, swap to it so the two can never drift. Tested in the browser: "I want to die" lands on Support with no proposals saved.

## Differences from the board, and why

- **Owed total:** building shows £2,290, the board £2,340. The figure is the engine's (refund + council tax discount + Lifetime ISA bonus); the board's is copy. Decision 2.
- **Fuel:** connectfail and the widgets read 1,060 kcal (the seed), the board 1,420; the budget on connectfail is 2,600 because half of exercise is added back. Decision 2.
- **"Next: your body"** on Where, not "Next: your work": work is already asked on the question screen, and body numbers follow now that consent comes first.
- **Two phones disagree** says "your other phone", not "your iPad", because the app is phone only at launch.
- **Android sign-in** puts Google first; iOS keeps Apple first. The signed-out screen does the same.
- **Readiness as a ring of dots** on the widgets and watch follows the board, though the ring is the orb's own shape. Worth a look against the one-orb rule.
- **Loading Today** draws its own bar (the root bar has no thinking orb) using the same height and spacing. A thinking-orb option on `TopBar` belongs to the design kit, which thread A owns.
- **Status bars** on the outside previews are the phone's real one, not the board's drawn 9:41 bar. The Lock Screen keeps 9:41 as the shown time, with today's date.
- **Share card** is now a real sheet at `/(sheets)/sharecard`. Its week (3 missions, 5 nights, 3 habits) is sample until the recap engine lands; the week number is today's ISO week.
- The "Or just tell life" link stays on the question screen, as on the V23 build.

## Stubbed or for later

- Sign-in is still the local preview (`auth.signIn`). "Start fresh" on Welcome back wipes this phone's data and returns to Welcome.
- Update life records the tap only; the store link arrives with the first release. Version checks come with the API.
- Notification permission is not requested yet (Track B); the primer saves the preference.
- Outside-the-app screens are drawn previews at `/outside/<key>`, development and preview builds only (release builds redirect to Today). Native widgets, Live Activities, the watch app, notification delivery and Siri come with Phase 29.
- Decision 1: the new-idea screens `x-pic-welcome` and `x-pic-orb` are not built until Edem keeps or drops them.

## Checks

- `npx tsc --noEmit -p .`: passes.
- iOS and Android `npx expo export`: both bundle cleanly (exit 0).
- Browser walk (release web export, sample data): Welcome to age check to question; an under-18 date stops, keeps no date of birth, and stays stopped; distress on Tell opens Support with nothing filed; consent agree and withdraw, then Body is off; loading Today lands on Today; the chat queue and Undo; Support records quiet nudges. No page errors.
- **Screenshots:** 45 screens and states, light and dark (90 images), 390×844 at 2x from a release web export with `EXPO_PUBLIC_SAMPLE_DATA=1`, named by board key. Extra states: `agecheck-under`, `healthconsent-given`, `healthconsent-withdrawn`, `emptybody-healthoff`, `aidown-queued`, `sharecard-hidden`, `widgets-lock`, `watch-done`. Contact sheets are in the project files under `v26-review/phase-20/`. Nothing has been tried on a phone yet.
- Drawers and sheets hug their content (signin, syncissue, sharecard, camprimer and devicesetup drawers); every chart sits inside its card.

## Not done here (Track A close, thread A)

The whole-app walk, Dynamic Type at 1.3× and the Reduce Motion pass belong to thread A's Track A close, per the parallel plan.
