# Phase 30 · Quality

Branch `phase-30-quality`, from `v26-integration` at the Phase 29 join (fe147a8). This phase makes Life usable with a screen reader and large text, keeps motion calm everywhere, readies Android, pages long lists, stops phone-only choices from syncing, and adds the north-star count, crash reports and end-to-end flows.

Nothing here has run on a real phone. There is no device or simulator in this workspace. The Maestro flows were replayed step by step against the web preview of the same code, and VoiceOver and TalkBack behaviour was checked through the accessibility tree the preview exposes.

## What was built

**Screen readers** (`design/a11y.tsx`, the row, card, tile and photo components)
- **Controls inside rows and cards.** On iPhone, a row read as one element hides everything inside it. So:
  - a row that ends in a switch is now the switch itself (double tap flips it);
  - a row or card that holds a button offers it as a named action (swipe up or down with VoiceOver, the actions menu on TalkBack), and a double tap still opens the row;
  - cards, tiles and timeline steps that hold their own controls are read part by part, so every control can be reached.
- **Headings.** Each screen's opening sentence, the big titles, the sheet questions ("How are you arriving?", "Which is right?") and the small section labels are headings, so the rotor can jump between them.
- **Photos** that only set the mood are hidden from screen readers.
- **Drag controls** (the mood field, the lesson scrubber) answer swipe up and down.
- **Fields** are named once. The caption above a text field no longer reads out as well as the field.
- **The walk of all 207 screens**, before and after:

| Check | Before | After |
|---|---|---|
| Controls with no name | 1 | 0 |
| A button inside a button | 8 | 1, offered as an action on phones |
| Photos read out | 63 | 0 |
| Screens with no heading | 63 | 6: the camera, the barcode scanner, the focus and workout timers, a chat thread, the lock screen preview |
| Controls a phone would hide | 99 | 56, all checked: steppers, where Fewer and More are the stepper's own swipe actions, and groups that carry a name but aren't read as one |

**Large text** (Dynamic Type and Android font size)
- Text follows the phone's size up to 1.3 times, as before. Every text field now has the same cap, and a test keeps it so.
- At 1.3 times, 68 more lines end in "…" in the web preview. Figures and button labels shrink to fit on phones instead (the preview can't show that). Readings now do this too. The rest are one-line names in tiles and chips, which end in "…" by design.
- Nothing runs off the screen except rows that scroll sideways.

**Motion** (MOTION.md)
- Every spring settles without bouncing. Durations come from the motion tokens, and every animation has a calm path for Reduce Motion.
- `tests/design/quality.test.ts` keeps it that way:
  - no React Native `Animated` or `LayoutAnimation`;
  - no hand-written springs or bouncy presets;
  - linear easing only for the loading shimmer;
  - every file that animates has a calm path.

**Android**
- The predictive back gesture is on. Edge-to-edge insets were already handled, and every overlay closes with the back gesture.

**Performance**
- Long lists (what Life knows, memories, people, a chat, chat history) show 40 at a time. The next 40 arrive as you reach the end, and a "Show 40 more" link at the foot does the same for VoiceOver, TalkBack or a keyboard.
- Photos are decoded at the size they're shown.

**Phone-only choices** (`data/projection.ts`)
- Phase 29's notes said what Life learns stays on the phone, but choices were travelling in the synced settings row. They no longer do. These stay on the phone that made them:
  - its permissions;
  - what Life learned of the moves you take or pass;
  - the nudge log and the push token mark;
  - messages waiting for a connection;
  - the weekly count and the two new switches.
- This also fixes a cross-phone bug: one phone's yes to the calendar or camera used to arrive on the other.
- Two repository tests cover it.

**The north star: moves finished per week** (`core/day/metrics.ts`, `services/moves.ts`, `api/src/metrics.ts`)
- **Off until you switch it on** in Your data ("Share how much gets done"). Switching it off again forgets the count.
- **Counted on the phone:** a mission step ticked, a step of the plan done, a habit done today. Only changes made on that phone count, so what sync brings in from your other phone isn't counted twice.
- **Shared once per finished week**, up to four weeks back, as three things: the week (`2026-W47`, in your own time zone, from 04:00), the count (99 at most) and iPhone or Android. No name, account, device id or time.
- **The server keeps a tally, not a log.** It adds the report to a row of week, kind of phone and count (`weekly_moves`), and nothing says whose it was. The session is checked only to keep strangers from filling the tally.
- **The server refuses** the current week, future weeks, weeks older than about five, counts outside 0 to 99, and the web preview.
- **Checked end to end** against the local API: signed in with a code, a finished week was taken, this week was refused, and the row holds no person.

**Crash reports** (`services/crashes.native.ts`)
- **Library.** `@sentry/react-native` 8.28.0, the version Expo SDK 58 names (MIT, pinned, credited).
- **When it runs.** It starts only when the build carries `EXPO_PUBLIC_SENTRY_DSN` and the person hasn't switched crash reports off. The web preview never sends.
- **What a report holds:** what broke and where in the code.
  - Off: personal data, tracing, replay, screenshots, the view hierarchy and accessibility ids.
  - Removed from each report: the user, the request, extras and the device's name.
  - Breadcrumbs keep the kind of step and drop its words: no log lines, taps, typed text or query strings.
- **Native crashes.** Crashes inside native code are sent by Sentry's native SDKs, which the app's own scrubbing doesn't reach. They carry Sentry's random install id and no names.
- **Without a DSN** nothing starts, and the switch row is hidden. Sample builds show it so it can be reviewed.
- **Not added yet:** the Expo config plugin and source map upload. Both need the owner's Sentry organisation and project.

**Maestro flows** (`apps/mobile/.maestro`, see its README)

| Flow | Path |
|---|---|
| `onboarding.yaml` | First open to Today: age check, first question, where you live, health and nudges for later, an Aim, the plan, keeping it on the phone |
| `talk-file.yaml` | Talk, stop, "File these 4 details?", File all, Undo offered |
| `snap-meal.yaml` | Fuel, Snap a meal, the camera primer, choose a photo, check the portions, Log meal |
| `lesson.yaml` | Teach me tax codes: bites, the guess, the puzzle, the recap, telling it back by typing, the gap |
| `sync/phone-a.yaml`, `sync/phone-b.yaml` | Phone A sets up, signs in by email, adds someone. Phone B signs in to the same account and finds them. `sync/run.sh` runs both against the local API. |

- **How the flows tap.** They use the words on screen, so they double as a check that controls have names. The fields they type into have test ids: the date of birth, email, code, a person's name and relation, and the teach-back box.
- **The `e2e` build profile** in `eas.json` makes a simulator build and an APK with the sample life, opening straight into the app.
- **The sign-in code.** `sync/codes.js` reads the code the local API prints to its own log, so the two-phone flow can type it. It reads nothing else, and the hosted API never prints codes.
- **Checked here.** All four flows and phone A passed a step-by-step replay in the web preview. The device-only steps (permissions, the system photo picker, the code reader) were skipped there.
- **`tests/phone/maestro.test.ts`** checks that every file a flow runs exists and every id it taps is still in the app.

## Screenshots

These come from a release web build with the sample life, 390 × 844, light and dark. The sheets are in project files: `v26-review/phase-30/quality-light.jpg` and `quality-dark.jpg`.
- `privacy-top`: Your data.
- `privacy-switches-off`: How it is looked after, with the two new switches. The count is off and crash reports are on.
- `privacy-moves-on`: the weekly count switched on.
- `signin-email`: the email step the sync flow uses.
- `talk-filed`, `meal-confirm`, `lesson-gap`: where three of the flows land.

## For Edem to decide

1. **Sentry account** (section 0, item 8). Create the organisation and project, and put the DSN in the EAS environment as `EXPO_PUBLIC_SENTRY_DSN`. I'll then add Sentry's Expo plugin so stack traces are readable.
2. **Crash reports default.** I built them on unless switched off, as most apps do. UK rules on storing or reading information on a phone may want a yes first. Ask whoever advises on PECR, and I'll flip it to off until yes if so.
3. **The weekly count** is off until yes, the cautious choice. Check the wording ("Share how much gets done", "One number a week, never who it's from").
4. **Where Maestro runs.** The options are EAS Workflows' Maestro step, Maestro Cloud, or locally on a Mac. Each needs an `e2e` build first.
5. **The count's endpoint needs a session**, so strangers can't fill the tally. The session is never stored with the count. The alternative is no session at all, which anyone could post to.

## Checks

- **`bun test` with Postgres: 768 pass, 0 fail.** New this phase:
  - `tests/design/quality.test.ts` (9): motion rules, named and capped text fields, swipe actions on drag controls, reading a control out of a row;
  - `tests/day/metrics.test.ts` (7): the week a move counts in, what counts, the weekly log;
  - `tests/api/metrics.test.ts` (4): no person stored, sign-in needed, the tally, refused weeks and counts;
  - `tests/phone/maestro.test.ts` (3);
  - two more in `tests/data/local-store.test.ts`.
- **Typecheck** is clean for the app and the API.
- **Bundles.** The iOS, Android and web exports build.
- **The database** gains migration `0005_weekly_moves`, which grants the `life_api` role what it needs.
- **The accessibility and large-text walks** cover all 207 screens, with the results above.

## Known limits

- **Not yet run on a phone:** VoiceOver and TalkBack by ear, the Maestro flows on devices, crash delivery, and a 60 fps profile. The mood field redraws its 168 dots on each drag move, which is the first thing to profile.
- **The system photo picker's labels** differ between OS versions. If `snap-meal.yaml` can't pick the photo, check its label with `maestro hierarchy`.
- **On a phone with on-device speech**, Talk listens instead of playing the sample, and `talk-file.yaml` needs someone to speak.
- **Six screens have no heading** (listed above). Most are full-screen tools with no title.
