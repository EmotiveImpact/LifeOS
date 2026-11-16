# life — Component inventory

> What exists in code today, and what the board (v17) uses that still has to be built. **Build every "To build" component into `apps/mobile/src/design/components/` and show it in `/design` before the screens that need it.** Specs live in DESIGN.md / MOTION.md; the board's code is the visual reference for each one.

## Status at a glance (16 Nov 2026)
- **Components in code: 62** (all exported from `@/design`, all typecheck, both platforms bundle).
- **Components the board uses that aren't in code yet: 34** (below).
- **Screens built as real app screens: 0 of 207.** The app still has the old placeholder tabs and the `/design` gallery. Every board screen is Codex's work, phase by phase (BUILD_PLAN.md).

## In code ✅
Surfaces and type: `Text`, `Title`, `TitleSerif`, `Headline`, `Statement`, `Body`, `Callout`, `Mono`, `Unit`, `Numeral`, `Press`, `Card` (no border, `cardShadow`), `Button`, `StatusPill`, `MetricRow`, `PromptBanner`, `ChoiceCard`, `Atmosphere`
Progress and story: `Ticks`, `CapsuleMeter`, `StageStepper`, `ActivityTimeline`, `WeekStrip`, `TwoTone`, `PeekStack`, `PeekHeader`, `RollingNumeral`, `MoneyFigure`, `Countdown`, `LedgerRow`, `NudgeCard`
Chrome: `TopBar` (fixed: root, push, sheet, flow), `Dock`, `Sheet`, `DottedOrb`, `LifeOrb` (**v5, needs the v6 port**)
Controls: `CountStepper`, `Slider`, `Toggle`, `Segmented`, `ChipGroup`, `ControlRow`
Lists and body: `ListRow`, `RowGroup` (no dividers), `Checklist`, `NewTag`, `ToolTile`, `InsightCard`, `RecordRow`, `ChangeSummary`, `HabitRow`, `FoodItemRow`, `MiniBars`, `RangeBar`, `StageBar`, `MetricTile`
Talk: `Waveform`, `BigMic`, `Transcript`, `FilingTray`, `UserBubble`, `LifeReply`, `FileCard`, `Composer`, `AttachMenu`
Mood and imagery: `PulseField`, `PulseCheckIn`, `MOODS`, `ImageTreatment`, `PhotoChip`, `IntroCarousel`, `Ridge`

## To build 🔨 (name · what it is · first board screens that use it · phase)
| Component | What it is | Used on | Phase |
|---|---|---|---|
| `LifeOrb` v6 | One family of the ring's dots: ring, thinking (clear sphere), working (clockwork), searching (web of lines), listening, done (gather) | orb, orbnext, chat, loading | 1 |
| `ChatIsland` | Dynamic-Island-style pill that grows into a card with the orb while life checks things | chat | 5 |
| `SearchField` | Rounded search input with clear and voice | search, chathistory, foodsearch | 2 |
| `Skeleton` | Shape-matched loading placeholders | loadingtoday | 2 |
| `SheetOverImage` | Sheet header for a photo sheet: light grab handle + close disc, no bar | plus, morningbrief | 1 |
| `HonestyBadge` | Personal baseline / Estimate / Validated | readiness, hrv, fitnessage, bmi | 4b |
| `ProgressRing` | Ring counter with centre number (calories left, readiness) | fuelhome, readiness | 4b, 4c |
| `MacroBars` | Labelled protein / carbs / fat bars | fuelhome | 4c |
| `ScoreBadge` | Meal fit score square (0–10) | mealresult | 4c |
| `TrendLine` | Smooth line chart with optional dots and band | weight, networth, fuelprogress, cgm | 4b |
| `Hypnogram` | Sleep stages over the night | sleepnight | 4b |
| `ZoneBars` | Five heart-rate zones with time in each | zones, workoutdetail | 4b |
| `RegularityChart` | A week of sleep windows on one time axis | regularity | 4b |
| `HeatGrid` | Calendar heatmap (habit strength, adherence) | strength, fuelprogress | 4c, 4d |
| `BarcodeFrame` | Camera overlay with scan line | barcode | 4c |
| `BreathPacer` | Growing/shrinking circle with haptic turns | breathe, breathlib | 4b |
| `CalendarDay` | Busy / free / nudge blocks (no edge stripes) | calendar | 11 |
| `LessonBar` | Segmented lesson progress (done, current in ember) | bite, predict, puzzle, tests | 8b |
| `LessonPicture` | Quick-lesson pictures: parts, flow, compare | bite, predict, puzzle | 8b |
| `GuessReveal` | Predict-before-reveal card | predict | 8b |
| `LessonPuzzle` | true/false, choose, fill the gap, order, match; never punishes | puzzle | 8b |
| `RecapList` | Lines that land one by one with a tick | recap | 8b |
| `TellBack` | Live transcript + life's curious question + waveform | tellback | 8b |
| `GapCard` | Strengths quoted, one gap, Show me | gaps | 8b |
| `SceneView` | Fenny Drawing Kit renderer (Skia, clean or hand-drawn) for bigger lessons | drawkit, bitedrawn | 8b |
| `LikertScale` | Five full-width answers for one statement | testq | 8c |
| `TraitBar` | Trait line against the average, with what life changes | bigfive | 8c |
| `PersonAvatar` | Initial on area colour (no border) | people, person, shared | 8c |
| `DateRow` | A person's date with a calm countdown (no countdown for memorials) | people, dates | 8c |
| `DocumentRow` | Document with expiry and best time to act | vault | 8c |
| `FocusTimer` | Big countdown with the orb | focus | 8c |
| `WatchFace` | Watch companion layout (watchOS / Wear OS targets) | watch | 11 |
| `NotificationPreview` | How a push looks, for the notifications settings | lockpush, notifs | 9 |
| `StatTile` | Small number + label tile (eaten, burned, water; your year) | fuelhome, yourbirthday | 4c |
