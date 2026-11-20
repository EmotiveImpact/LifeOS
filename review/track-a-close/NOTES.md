# Track A close

Branch `track-a-close`, from `v26-integration` after Phases 18, 19, 20, engine maths and brain rules were merged. The last Track A job in the parallel plan: walk the whole app, Reduce Motion, text size, both bundles.

## What was checked

| Check | How | Result |
|---|---|---|
| Every route opens | All 207 routes in `navigation/screens.ts` (15 entries are cards or states, not routes), release web build with the sample life, page errors and near-blank screens recorded | No errors, no blank screens, no wrong landings |
| A brand-new account | The same 207 routes in a build with the sample life off (`EXPO_PUBLIC_SAMPLE_DATA=0`) and setup done | No errors. The 8 "outside the app" previews go to Today, as Phase 20 intends (they are development previews) |
| Reduce Motion | Every file that animates (24) read for its guard | Every animation either checks `useCalmMotion` or uses Reanimated's default, which follows the system setting. Nothing to fix |
| Largest text size | The largest size life follows is 1.3x (`maxTextScale` in `design/Text.tsx`). The web can't read the system setting, so a review build previews it with `EXPO_PUBLIC_TEXT_SCALE=1.3`. A script listed every line of text that is cut short at 1.3x but not at normal size | 86 places before, 58 after; nothing new cut at normal size |
| Both bundles | `expo export` for iOS and Android | Both pass |

## Fixed

- **Text fields** (27) had no cap on text size, so at the largest system sizes they grew past the rest of the screen. They now stop at the same 1.3x as all other text.
- **Shared pieces** that cut words off at large sizes:
  - Section headings may take two lines.
  - Tile labels may take two lines ("Resting heart rate", "Skin temperature"), and the big figure shrinks to fit on the phone instead of ending in "…".
  - Button and segment labels shrink a little on the phone rather than cutting off ("Download everything", "Sat 17:00").
  - Body's chart heading puts its caption under the title when both don't fit ("Where you sit", then "band = your own range"), where before both were cut.
  - Photo cards keep their board height but grow if large text needs more room.
- **Devices:** "Add another" was three squeezed tiles ("Heart-r…" even at normal size). It is now a scrolling shelf, as on the board.
- **Sleep stages:** "Awake" broke over two lines at large sizes; the label column is wider.
- **On this phone:** the storage rows ran past the card edge at large sizes; the label now wraps.
- **Real accounts on Your details** saw Ama's photograph, "Freelance designer" and "28th" as their own. They now see a desk photograph, their work status ("Self-employed") and their pay day from routines, or "Not set". The Big Five page drops Ama's face for real accounts.

## What's left, on purpose

- The 58 remaining large-text cuts are mostly second lines on cards that are capped at two lines by design (mission and protect card subtitles, library cards), plus figures, buttons and segments that shrink on a real phone but can't on the web (`adjustsFontSizeToFit` is native only).
- A brand-new account still starts from the sample profile's name and age, and many screens still read sample figures. That is the "your own data" work in wave 4 of the parallel plan (after sync), when real accounts switch the sample life off everywhere.

## Screenshots

`*.normal.light.png` (normal size, unchanged from the board), `*.largest.light.png` (1.3x after the fixes), `*.largest-before.light.png` (1.3x before), `profile.empty-account` and `bigfive.empty-account`.
