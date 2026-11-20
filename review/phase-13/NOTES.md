# Phase 13 · The V26 design system

Branch `phase-13-v26-design-system`, from `phase-12-v25-best-of`. Gate 13: the owner reviews `/design` (or `/design?only=v26` for the V26 pieces alone) before any screen is restyled.

## What was built
- **Tokens** (`tokens.ts`): type `display` (Medium 34/39, −1.1), plus `heading`, `rowTitle`, `bodyL`, `label` and two variants the board needed that the plan didn't list: `bodyMedium` (Medium 15/22) and `headlineMedium` (Medium 20/26, for "I’m arriving calm."). Area tints `tint.{you,home,work,money,health,goal}` for light and dark; `photo.{onPhoto,onPhoto2,fill,ink,shade}`; scrims `photoScrims.{fade,card,deck}`; `floatLift` and `sheetShadow`; `space.tile` (10); radius `tile`, `photo`, `tail`; the board's component sizes. Text tones `inverse2` and `photoInk`. `Icon` takes a `strokeWidth` (2 inside display sentences, as the board does).
- **New components**, in `src/design/components/V26*.tsx`: `RoundButton`, `SectionHead`, `Footer`, `LifeSays`, `DashPager`, `Badge`, `PhotoCard`, `PhotoGrid`, `PhotoFill`, `FullPhotoScreen`, `TintCard`, `DotStrip`, `DotGrid`, `BecomingScale`, `NormalBandChart`, `Sparkline`, `BandLine`, `CapsuleBars`, `CapsulePairs`, `SleepTracks`, `Accordion`, `AccordionGroup`, `KeyValue`, `WheelPicker`, `Field`, `VoiceNote`, `TileGrid` (two or three to a row), `MoveDeck`, `DecideRow`, `DecisionDrawer`, `FeelField`, `FeelingDrawer`, `ArrivingCard`, and the `photos` set (the board's pictures, copied from `review/v26/img`).
- **Existing components extended**: `TopBar`, `Dock`, `StatusPill`, `Ticks`, `ListRow`, `DateRow`, `Checklist`, `ChoiceCard`, `MetricTile` (including a slim tile for Body's three-in-a-row), `MiniBars`, `TrendLine`, `Hypnogram`, `Toggle`, `Slider`, `Segmented`, `ChipGroup`, `CountStepper`, `PersonAvatar`, `UserBubble`, `LifeReply`, `BigMic`, `Waveform`, `ActivityTimeline`, `TwoTone`, `Sheet`.
- **`FeelField`**: `moodAt` is copied exactly from `kit.js`, so the board and the app pick the same mood for the same point. The gallery lists each mood's resting point. Gesture Handler pan, Reanimated springs, a selection haptic on each change of mood, a crossfading photograph. Reduce Motion: the dots stay still and the photograph swaps instantly. Screen readers step through the moods with increment and decrement.
- **Gallery**: `src/design/V26Gallery.tsx`, linked from `src/app/design.tsx`, 19 sections in board copy, light and dark side by side. Interactive states work in place (accordion, check rows, deck, drawer and undo, feeling drawer, controls, mic).
- `COMPONENTS.md` has a "V26 additions" section, one row per piece.

## How screens will pick up the V26 look
Existing components keep their V23 look unless a screen asks for V26 with a `look` prop (or the named variant: `Dock variant="float"`, `Ticks variant="ruler"`, `TwoTone size="display"`). That keeps the ~230 V23 screens unchanged until Phases 14 to 20 restyle them. Once every screen passes `look`, the defaults can flip and the V23 branches can go.

Changed in place, so V23 screens see them now:
- `Sheet` gains `sheetShadow` (handle and 28pt corners were already there).
- `TwoTone` statement icons draw at stroke 2, as on the board.

## Differences from the board, and why
- The selected wheel option is 16pt (`title`), the board 17pt. No 17pt variant exists; adding one would be a new font size.
- The field value uses the existing Medium 16/21 (`greeting`); the board sets Medium 16 on a 24 line. Same size and weight, 3pt less height per field, with no new line height added.
- `FeelField` works out each dot's lean from its real pixel position, so the lean is the same shape at any field size.
- `MoveDeck` shows one card resting behind by default, as the Today board does. The plan says two; `behind={2}` gives two and the gallery shows both.
- `MoveDeck` is new rather than built on `PeekStack`: the deck's swipe, knob and fly-off share little with the peek stack, and extending it would have changed V23 screens.
- The front card tilts a little as you drag it. The board is a still picture, so this is our addition.
- `Hypnogram` totals are computed from the night's stretches. On the board's sample they come to REM 2h 10m and Light 3h 35m, while the board's key says 1h 50m and 3h 40m. Owner decision 2 covers numbers that disagree.
- Inline icons in a display sentence stay with their word, as the board's `nw` pairs do. Native uses a word joiner; the web build needs `white-space: nowrap` on that phrase.

## Checks
- `npx tsc --noEmit -p .`: passes.
- `npx expo export --platform ios`: passes. `npx expo export --platform android`: passes.

## Screenshots
40 images in this folder: `design-v26-<section>.light.png` and `.dark.png`, one per gallery section plus the heading. There is no simulator in a cloud session, so they come from a web export. `/design` only opens in development builds, so the export was `npx expo export --platform web --dev`, served locally and captured with Playwright at 390pt wide, 2x. Every section rendered on web. Haptics don't fire on web. Stills can't show gestures, so a Playwright pass on the same export swiped the deck (1 of 3 became 2 of 3), dragged the feeling orb from calm to restless, opened an accordion section and filed through the drawer to its Undo. All four worked with no page errors. Nothing has been tried on a phone yet.

## Not done in this phase
- No screens restyled; that starts in Phase 14.
- `SCREENS.md`: Phase 13 has no rows of its own, so nothing was ticked.
- Where the board's photographs come from, and their licences, isn't recorded. They're copied from `review/v26/img` as they stand.

## Open owner decisions (BUILD_V26.md section 0)
None of these block Phase 13. Listed so they stay visible.
1. Keep or drop the 8 new-idea screens (`x-…`). Blocks only those screens.
2. Numbers that disagree on the board (load, rent, calories, the bill countdown, Rent vs buy, Lifetime ISA, onboarding steps, and the sleep totals above). Seed data decides for now; must be settled before Phase 26.
3. life Plus price: £48 a year or £59.99. Phase 19.
4. Body, revisit: accepted "for now". The 60 to 70 readiness band is a placeholder; decide whether Readiness uses the same band chart. Phase 16, with a reminder when it starts.
5. API host. Phase 21.
6. Accounts: Better Auth or Neon Auth. Phase 21.
7. Model providers and keys for evals. Phase 24.
8. Accounts only the owner can create (Neon, Expo/EAS, Apple, Google Play, WHOOP, Oura, Sentry). Phases 21, 26, 30.
