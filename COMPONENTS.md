# life — Component inventory

> What exists in code today, and what the board (v17) uses that still has to be built. **Build every "To build" component into `apps/mobile/src/design/components/` and show it in `/design` before the screens that need it.** Specs live in DESIGN.md / MOTION.md; the board's code is the visual reference for each one.

## Status at a glance (16 Nov 2026)
- **Pre-existing components: 62** (all exported from `@/design`, all typecheck, both platforms bundle).
- **Track A additions: all 45 rows below implemented and exported from `@/design`, with examples in `/design`.** LifeOrb is now v6. SceneView is the full owner-authorised Skia port: all 30 devices and 208 objects, clean or hand-drawn, with all-device gallery controls.
- **Screens: all 220 unparked board entries have UI implementations or explicitly noted platform/state previews.** See `SCREENS.md` and `review/NOTES.md` for `[~]` limitations.

## In code ✅
Surfaces and type: `Text`, `Title`, `TitleSerif`, `Headline`, `Statement`, `Body`, `Callout`, `Mono`, `Unit`, `Numeral`, `Press`, `Card` (no border, `cardShadow`), `Button`, `StatusPill`, `MetricRow`, `PromptBanner`, `ChoiceCard`, `Atmosphere`
Progress and story: `Ticks`, `CapsuleMeter`, `StageStepper`, `ActivityTimeline`, `WeekStrip`, `TwoTone`, `PeekStack`, `PeekHeader`, `RollingNumeral`, `MoneyFigure`, `Countdown`, `LedgerRow`, `NudgeCard`
Chrome: `TopBar` (fixed: root, push, sheet, flow), `Dock` (owner-approved full-width bottom bar; all four labels visible), `Sheet`, `DottedOrb`, `LifeOrb` (**v6, ported from board mountOrb**)
Controls: `CountStepper`, `Slider`, `Toggle`, `Segmented`, `ChipGroup`, `ControlRow`
Lists and body: `ListRow`, `RowGroup` (no dividers), `Checklist`, `NewTag`, `ToolTile`, `InsightCard`, `RecordRow`, `ChangeSummary`, `HabitRow`, `FoodItemRow`, `MiniBars`, `RangeBar`, `StageBar`, `MetricTile`
Talk: `Waveform`, `BigMic`, `Transcript`, `FilingTray`, `UserBubble`, `LifeReply`, `FileCard`, `Composer`, `AttachMenu`
Mood and imagery: `PulseField`, `PulseCheckIn`, `MOODS`, `ImageTreatment`, `PhotoChip`, `IntroCarousel`, `Ridge`
V22: `NextMoveCard` — 190pt focal-aware photograph, readable next-move identity and one 50pt action; implemented in `Imagery.tsx`, exported via `@/design`, shown in `/design`.
Calmer restoration: `Icon` — the 18 exact owner-authored SVG paths from the original calmer mockup, with matching utility outlines; replaces icon-font rendering across the app and is shown in `/design`. `ToolTile compact` matches the reference’s 88pt shortcut tiles.

## Track A additions 🔨 (implemented; Track B integrations noted in review/NOTES.md)
| Component | What it is | Used on | Phase |
|---|---|---|---|
| `LifeOrb` v6 | One family of the ring's dots: ring, thinking (clear sphere), working (clockwork), searching (web of lines), listening, done (gather) | orb, orbnext, chat, loading | 1 |
| `ChatIsland` | Dynamic-Island-style pill that grows into a card with the orb while life checks things | chat | 5 |
| `ReorderRow` | Drag handle with native gesture and accessible move actions | customise | Visual follow-through |
| `LabRange` | Supplied lab interval, clearly labelled illustrative preview, or unknown-range state | blood | Visual follow-through |
| `CameraViewport` | Ungraded full-frame local camera surface and portion labels (needed to match `snap`, not a story card) | snap | Track A fidelity |
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
| `NutrientBar` | Nutrient against its reference intake, calm (no red), optional note | nutrients | 4c |
| `LabelScanOverlay` | Camera overlay that highlights the label row being read | labelscan | 4c |
| `WeightLogger` | Big stepper + trend + on-track tag | weighin | 4c |
| `ProjectionChart` | Line from today to goal date with both ends labelled | fuelplan | 4c |
| `WeekBars` | Seven day bars with a target band | weekbudget | 4c |
| `EatingWindow` | First-to-last meal per day on one time axis, late meals in ember | mealtiming | 4c |
| `ShareBar` | One bar split into shares with labels (food quality) | foodquality | 4c |
| `ModelCard` | An on-device model: name, size, what it does | aimodels | 11 |
| `StatTile` | Small number + label tile (eaten, burned, water; your year) | fuelhome, yourbirthday | 4c |
