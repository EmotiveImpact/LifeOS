# Phase 14 · Today and Talk

Branch `phase-14-v26-today-talk`, from `phase-13-v26-design-system`. 21 screens rebuilt to the V26 board: Tab 1 · Today (13) and Talk and file (8).

## What was built
- **The pattern for every later chapter.** `src/screens/v26/kit.tsx` holds the board's page anatomy as small pieces (`Page`, `Display`, `Statement`, `Body`, `Callout`, `Eyebrow`, `Micro`, `RowsCard`, `Row`, `Chip`, `Btn`, `QuietLink`, `Hero`, `Timeline`, `SheetHandle` and friends). `Page` picks the top bar from how the screen opens (`screens[key].kind`: Tab root, Sheet handle, Full screen close, Push back), keeps it outside the scroll view, and adds the board's `.foot` and drawer slots. Each chapter's screens live in one file (`v26/today.tsx`, `v26/talk.tsx`); the old switch files (`Today.tsx`, `Talk.tsx`) now only dispatch to them, so routes and navigation are unchanged.
- **Copy with bright words:** `RichText` (`src/design/RichText.tsx`) reads the board's `{bright}` and `{@icon bright}` braces, so screens keep the board's sentences as written.
- **Today:** the two-tone briefing in `display` with inline icons; the feeling check rises as `FeelingDrawer` on the first open of the day and waits as one `ArrivingCard` when closed; after "Set today's pace" the moves arrive as a `MoveDeck` (tick or cross), then "Your day · N moves" with the first move ready. Move order and the briefing per mood come from `src/state/today.ts` (`moveOrder`, `todayBrief`), never the screen. Decisions reset each morning (`today-moves` stores `<day>|<y/n…>`). The dock floats (`Dock variant="float"`).
- **Talk:** the live filing plays. Words arrive every 850 ms, recognised phrases light up and bump their area tile (You, Home, Work, Money, Health, Goals), then one `DecisionDrawer` asks to file, with Undo after filing. When the phone has an on-device recogniser, Talk uses it and lights phrases the extractor finds; otherwise it plays the board's talk, labelled as a sample. The stream sits behind `voice.ts` (`SAMPLE_TALK`, `sampleStream`, `chunkTranscript`).
- **The rest of both chapters**, row by row: nudge, pulse, checking in, customise, routines, why, calendar-aware day, morning brief, close the day, inbox, search, focus; understood, ask then file, attach, letter understood, chat, your conversations, edit what life filed.
- Small design-system additions the screens needed: `TopBar` takes a node as an action and a `titleNode`; `StatusPill` and photo chips take a dot; `PhotoCard` takes object chips, a right chip, a top-right node, a lead line and children; `V26Row` takes a lead node; `TintCard` now honours a caller's padding and radius on web too.
- `TodayHome.tsx` (the V23 home) is removed; nothing imported it after the switch.

## Sample data (owner instruction, 20 Nov)
Ama's sample life stays in development builds so the app can be seen as designed. `src/state/sample.ts` exposes `SHOW_SAMPLES` (on in dev, off in release, `EXPO_PUBLIC_SAMPLE_DATA=1|0` overrides). In this phase it gates the content that exists only to show the design: Chat's played sample thread and the sample cards in Your conversations. A real account starting empty (no Ama, no seed records) is Track B work (Phases 21, 22 and 31), recorded in project memory so later phases keep to it.

## Stubbed
- Talk without an on-device recogniser plays the sample talk; filing it files the four sample details.
- Letter, understood: a sample letter (no camera, OCR or bank link). "Set up the direct debit" only saves a reminder flag.
- Calendar-aware day: a sample day shape (busy or free only). No calendar is read.
- Morning brief "Listen": no audio yet (Phase 28).
- Focus: a local timer; notifications are not actually silenced.
- Search: the board's areas, asked-most chips and four results from the seed, filtered as you type; the full index comes with Phase 25.

## Differences from the board, and why
- **Numbers follow the seed and the engine** where the board's figures disagree (owner decision 2): load 6.2 (board 11.4), fuel 1,060 eaten (board 1,420), sleep debt 2h 10m (board 2h 40m), and the carbs and fat left that follow from those.
- Morning brief and Close the day set their big lines in `display` (34). The board uses 30 and 44, which aren't type sizes in the system.
- Understood keeps a primary "File N details" above the composer so filing never depends on typing.
- Letter, understood says "Sample scan" in its eyebrow so a person can tell it isn't their letter.
- Inbox has a quiet "Read all" chip in the top bar, which clears the bell's dot.
- Customise's preview uses tinted cards so the live preview reads as Today's Body snapshot.
- Search's "Search" is a real text field set in the board's quiet title style.
- "Level 1 · Stabilize" on Today comes from the engine's level names in `packages/core`. It's American spelling; engine logic isn't changed in Track A, so it's flagged here.

## Checks
- `npx tsc --noEmit -p .`: passes.
- `npx expo export --platform ios`: passes. `npx expo export --platform android`: passes.

## Screenshots
52 images, light and dark, named by board key. Extra states: `today` (drawer open, first open of the day), `today-later` (drawer closed, waiting card), `today-checked` (after setting the pace, the deck), `today-day` (moves decided, "Your day"), `talk` (mid-filing, about five seconds in), `talk-review`, `talk-filed`.

There's no simulator in a cloud session, so they come from a web export served locally and captured with Playwright at 390×844, 2x. The dev web export splits route groups into chunks with clashing names, so these came from a release web export with `EXPO_PUBLIC_SAMPLE_DATA=1`. Every screen rendered on web with no page errors. Web shows the browser's focus ring on the focused field (Search, Nudge's close), which phones don't draw. Haptics don't fire on web. Nothing has been tried on a phone yet.

## Open owner decisions (BUILD_V26.md section 0)
1. Keep or drop the 8 new-idea screens. 2. Numbers that disagree on the board (above). 3. life Plus price. 4. Body, accepted "for now". 5. API host. 6. Accounts: Better Auth or Neon Auth. 7. Model providers and keys. 8. Accounts only the owner can create. None block this phase.

Phonon (Phase 28): the model's release download and repository need the owner's access, so it's blocked until then; recorded for Phase 28.
