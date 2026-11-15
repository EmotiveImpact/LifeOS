# life — Build Plan (v1)

> **Who does what:** Antigravity builds each phase. **Claude reviews** at every 🛑 gate before the next phase starts.
> **Sources of truth:** `SPEC.md` (how it works: engine, health, learning, behaviour, data, blind spots), `DESIGN.md` (rules, numbered §) and **`design-board/life-design-board-v9.html`** (every screen; the visual target). If this plan and DESIGN.md disagree, DESIGN.md wins; flag it.
> **The app:** `apps/mobile` (Expo SDK 58, expo-router, Reanimated 4, Gesture Handler). Logic: `packages/core` (don't change its logic; strings only).

---

## Ground rules (every phase)

1. **Branch per phase:** `phase-N-short-name`. Commit small. Never commit to `main` directly.
2. **Use the design system.** Import from `@/design` (21 components + `PulseField`, `ImageTreatment`, `storyImage`, `feedback`, `Text`). No raw hex, no Tailwind palette colours, no font sizes outside `Text` variants. If a component is missing, add it to `src/design/` first.
3. **Numbers come from `packages/core`.** Never hard-code a £ figure in a screen.
4. **No glass, no blur, no mesh gradient on the Pulse** (§40, §43). Solid surfaces and hairlines.
5. **Motion = the five habits** (§42): springs, interruptible gestures, grow-from-tap, stagger, rolling numbers. Haptics and sound only via `feedback.*`.
6. **Both platforms.** Every phase must build for iOS **and** Android.
7. **Imagery v1 is a generic, diverse mixed cast** (see §44). Don't build the "Who should appear" question yet.

### Definition of done (run before every 🛑 gate)
```bash
cd apps/mobile
npx tsc --noEmit -p .
npx expo export --platform ios --output-dir /tmp/life-ios && rm -rf /tmp/life-ios
npx expo export --platform android --output-dir /tmp/life-android && rm -rf /tmp/life-android
```
Then save screenshots (simulator/emulator, **light + dark**) of every screen touched in `review/phase-N/` and write `review/phase-N/NOTES.md`: what was built, what's stubbed, anything that deviates from DESIGN.md and why. Commit, then **stop**.

---

## Current state (already done)

- `src/design/`: tokens (v4 Inter, dark-first, no glass), Text, Press, feedback (haptics + 4 sounds) and **every component v9 uses**. Assemble screens from these and don't rebuild them:
  - Base: Card, Button, StatusPill, MetricRow, PromptBanner, ChoiceCard, Ticks, CapsuleMeter, StageStepper, ActivityTimeline, WeekStrip, TwoTone, PeekStack, MoneyFigure, RollingNumeral, Countdown, LedgerRow, NudgeCard, DottedOrb, Dock, Sheet
  - Instruments and controls: **CountStepper** (SPEC §6.1), PulseField / PulseCheckIn, Slider, Toggle, Segmented, ChipGroup, ControlRow
  - Lists: ListRow, RowGroup, Checklist, NewTag, ToolTile, InsightCard, RecordRow, ChangeSummary
  - Body: MetricTile, RangeBar, StageBar, MiniBars, HabitRow, FoodItemRow
  - Talk and chat: Transcript, Waveform, BigMic, FilingTray, UserBubble, LifeReply, FileCard, Composer, AttachMenu
  - Growth and imagery: Ridge, IntroCarousel, ImageTreatment, PhotoChip, storyImage
  - All of them are live in the `/design` gallery, and they build for iOS and Android.
- `src/app/design.tsx`: the dev-only gallery at `/design`. Use it to check components.
- `assets/images/scenes/`: 29 photos. `assets/sounds/`: 4 WAVs.
- The existing `(tabs)` screens and `src/sheets/*` are **old** and get replaced phase by phase.

---

## Phase 1 — Foundations
**Goal:** the app shell runs on the new system.
- Root layout: `useLifeFonts()` + keep the splash until loaded; `SheetProvider`; status bar follows the scheme.
- Replace `(tabs)/_layout.tsx` with a custom tab bar using `Dock` (§6.12, §43 solid): **Today · Plan · You** + a **Talk** mic button. The tab bar hides on scroll down.
- Store additions in `useLifeStore` (persisted with AsyncStorage): `filedRecords: FiledRecord[]` (§20), `chiefAim: ChiefAim | null` (§37), `pulseLog: {at, moodId, x, y}[]`, `pictures: { look: 'places' | 'mix' | Look, glimpses: boolean, followMood: boolean }` (default **`'mix'`**: diverse cast, §44), `feedbackPrefs` (wire into `setFeedbackPrefs`).
- Empty placeholder screens for every route in §29 + §32 so navigation works end to end.
**Acceptance:** the app opens to Today on both platforms; tabs switch with the selection haptic; the dark/light toggle works; `/design` still works.
🛑 **Gate 1: Claude reviews the shell, store shape and navigation.**

## Phase 1b — Platform (SPEC §7, §8, §9.2–9.3)
- **EAS dev builds** for iOS + Android (HealthKit/Health Connect need them; Expo Go is no longer enough).
- **Supabase**: Sign in with Apple + Google, row-level security, edge functions for AI and OAuth (WHOOP/Oura). No API keys in the app.
- **Local-first storage** with `expo-sqlite` (the source of truth) + queued sync; migrate the AsyncStorage store.
- `src/services/ai.ts` interface (talk, ask, extract, food, grade) with schema-validated JSON, plus a stub implementation.
- Consent screens per data type; privacy policy page; "What life knows" export/delete wired to the DB.
**Acceptance:** sign in, kill the app, reinstall, sign in → data returns; offline edits sync later.
🛑 **Gate 1b**

## Phase 2 — The core: Today, Plan, You (§29 #05–07, §22, §37 pinned Aim)
- **Today:** the Aim pin (when an Aim exists) → date + level pill → two-tone brief from the engine → "life knows you" meter → **life is asking** (one question at a time, chips) → **Things to know** row → "To reach level N" gates (`computeLifeLevelState.toAdvance`) → Worth doing today (missions) → the Today's idea card. One image max: the mood card (§36).
- **Plan:** monthly gambit, area chips (LIFE_AREAS), missions list, toolkit grid with locked tiles.
- **You:** score + streak, understanding per area, rows to Household, Mood history, Learning, Settings.
**Acceptance:** all data is live from engine + store; answering a question files a record and raises "life knows you".
🛑 **Gate 2**

## Phase 3 — Missions and memory (#16–18)
- Mission detail: StageStepper, reference + copy, why, steps, the Draft sheet (editable, copy, open in Mail), activity timeline, one primary action; completing it fires `feedback.cleared()`.
- Draft message sheet. Things to know (filter by area, source on every card).
- Shared transition: mission card → detail (§42 #3).
🛑 **Gate 3**

## Phase 4 — Pulse, mood and instruments (#13–15, M1, §40)
- Pulse screen with `PulseCheckIn`; saves to `pulseLog`; sets `focusBias`; Today's card uses `storyImage(pictures.look, mood.moment)`.
- Mood over time (14-day bars + patterns). Household `CountStepper` (big number, figures, `getCrowdUnlockSummary`).
- Nudge: local notification (max 1/day, quiet hours) → nudge screen with inline steps. Permission is asked only after the first nudge-worthy find.
🛑 **Gate 4**

## Phase 4b — Body: devices, sleep, readiness, load (SPEC §2.1, §3.1–3.4, §3.7)
- HealthKit (`@kingstinct/react-native-healthkit`) + Health Connect (`react-native-health-connect`); WHOOP + Oura OAuth via edge functions. Normalise into `HealthSample` → `DailyHealth`.
- Screens: Body home, Readiness (14-day calibration, drivers), Sleep (need, debt, consistency, target bedtime), Load, Trends, Devices.
- `planToday()` uses readiness, sleep debt and load (SPEC §1.1), with "Why am I seeing this?" on each decision.
- Safety escalation for repeated low moods (§3.7).
**Acceptance:** real data from at least one iPhone + one Android device; scores match hand-calculated test fixtures; unit tests for readiness, sleep need and debt.
🛑 **Gate 4b (includes a health-copy safety review)**

## Phase 4c — Fuel: photo food logging (SPEC §3.5)
Camera → `ai.food()` → item + portion confirm/edit → CoFID / USDA / Open Food Facts → daily totals vs Mifflin-St Jeor targets; barcode scan; "hide numbers" mode; 18+ gate; low-intake safeguard + Beat signposting.
🛑 **Gate 4c (includes safety review)**

## Phase 4d — Habits (SPEC §3.6)
Tiny version + implementation intention ("After… I will… at…"), max 3 new habits, never-miss-twice rescue, auto-complete from data, automaticity check-ins every 2 weeks → graduation; ~66-day median timeline copy (remove all "14 days" claims).
🛑 **Gate 4d**

## Phase 5 — Talk, file, ask (#08–12, §19–21)
- Build an **`ai` service interface** (`src/services/ai.ts`): `talk(transcript) → FiledRecord[]`, `ask(question, context) → {answer, records}`. v1 implementation = wrap `processLifeOSMessage` + rule-based extraction. Leave a clear seam for a real model later.
- Talk: live transcript (expo-speech-recognition or a stub with typed input), recognised phrases fly into the Filing tray, then **Understood** (proposed → confirmed, Remove/Undo). Nothing is filed silently.
- Ask → answer with engine numbers → FileCard. Attach menu (solid dim, no blur) → Letter understood (stub OCR OK; real VisionKit later).
🛑 **Gate 5**

## Phase 6 — Onboarding + Chief Aim (#01–04, §37)
- Welcome (cover image: a generic/places or mixed-cast frame), destination question, "Or just tell life" (→ Talk), Building your plan (live engine scan).
- `aim/new`: 4 steps with a live statement + suggestions; `aim`: statement, read ritual (morning/night + streak), progress, breakdown, edit with history.
🛑 **Gate 6**

## Phase 7 — Toolkit (#19–29), level-gated
L1: 30-day cash plan, Tax & NI. L2: Money (ledger, scrubber, hide balances), Subscriptions, Health stack. L3: Income & structure (`compareUKBusinessStructures`), Rent vs buy (`compareRentAndBuy`), Bloodwork (`interpretLabResult`). L4: Protection, Growth path. Accuracy rules §31: "Estimate / not advice", health never diagnoses.
🛑 **Gate 7**

## Phase 8 — Learn (§32)
Library, Lens (THINKER_ATEAM + Napoleon Hill), Idea in 60 seconds (3 cards → action → files an insight), **Teach it back (Feynman loop with `ai.grade`, SPEC §4.2)**, Ask through a lens, Recall (**FSRS** scheduling), Ideas into action. **Never quote, never impersonate.**
🛑 **Gate 8**

## Phase 9 — Grow + account (#30–34)
Weekly recap (PeekStack), Vantage point (ridge + gates), Level up (IntroCarousel, once per level, `feedback.cleared`), life+ (never blocks level 1), Settings (appearance, sound, haptics, hide balances, nudges, pictures: follow mood / glimpses, connected services, what life knows, export, delete).
🛑 **Gate 9**

## Phase 10 — Polish and ship-readiness
Motion pass (§42 on every screen), Reduce Motion, Dynamic Type 1.3×, VoiceOver labels, empty/error/offline states, an Android pass (back gesture, edge-to-edge, ripple-free presses), performance (lists virtualised, images sized).
🛑 **Gate 10: final review against DESIGN.md §12 checklist.**

---

## Later (not v1)
Real AI model behind `ai.ts` (the interface ships in 1b) · Aggregator for long-tail devices (Terra/Junction/ROOK) · Open Banking / NHS / HMRC connections · VisionKit OCR · Live Activities + widgets · **"Pictures that look like you"** (§41, behind the `picturesLikeMe` flag, after full image coverage and user testing) · other countries · Commune-style shared households.

---

## What Claude checks at each gate
1. Definition of done passed (typecheck + both bundles) — Claude re-runs it.
2. Screenshots vs the board and DESIGN.md: type scale, colours, spacing, one image max, solid surfaces, no glass.
3. Engine wiring: no hard-coded numbers; records filed correctly.
4. Motion/haptics/sound via the design system only.
5. Copy: plain, specific, no banned words (§10), accuracy rules (§31).
6. Fixes are listed in `review/phase-N/CLAUDE_REVIEW.md`. Antigravity fixes them before the next phase.
