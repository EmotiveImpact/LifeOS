# life — Build Plan (v1)

> **Start with `MASTER_PLAN.md`** (order, stack, decisions). **Motion:** `MOTION.md` (every screen, state to state).
> **Who does what:** Antigravity builds each phase. **Claude reviews** at every 🛑 gate before the next phase starts.
> **Code references:** `IMPLEMENTATION_REFERENCES.md`: which open-source repos and exact files to study per feature, and what each licence allows. **Read the relevant section before building a feature.**
> **Sources of truth:** `SPEC.md` (how it works: engine, health, learning, behaviour, data, blind spots), `DESIGN.md` (rules, numbered §) and **`design-board/life-design-board-v17.html`** (207 screens, organised by tab, each with how it opens) (every screen, the visual target, plus the component library). If this plan and DESIGN.md disagree, DESIGN.md wins; flag it.
> **The app:** `apps/mobile` (Expo SDK 58, expo-router, Reanimated 4, Gesture Handler). Logic: `packages/core` (don't change its logic; strings only).

---

## Build order (decided 16 Nov 2026): UI first
**Track A** builds the whole app's UI first, every screen in `SCREENS.md` with seed data and stubs, light checks only (AGENTS.md "Build mode: UI first"). **Track B** then makes it real phase by phase below (platform, health, AI, Fenny kit) and adds the tests. The phases below still describe *what* each area needs; in Track A only their screens and components are built.

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
- **Components before screens:** each phase starts by building the `COMPONENTS.md` "To build" rows tagged with its phase, shown in `/design`.
- **Design-system updates first (DESIGN §45–48):** no borders or dividers anywhere, cards get `cardShadow`; `TopBar` on every route (fixed, never moves); **port `LifeOrb` v6** to Reanimated from the board's `mountOrb` (v17 board, search `LifeOrb v6`): states `ring | thinking | working | searching | listening | done`, every state made of the ring's dots, every change the dots travelling one after another (720 ms, 38 ms stagger), done = gather with a springy overshoot. Show all states in `/design`.
**Acceptance:** the app opens to Today on both platforms; tabs switch with the selection haptic; the dark/light toggle works; `/design` still works.
🛑 **Gate 1: Claude reviews the shell, store shape and navigation.**

## Phase 1b — Platform (SPEC §7, §8, §9.2–9.3)
- **EAS dev builds** for iOS + Android (HealthKit/Health Connect need them; Expo Go is no longer enough).
- **Neon** (MASTER_PLAN §3.1): Postgres with a branch per phase, our own TypeScript serverless API, **Better Auth** (or Neon's auth) for Sign in with Apple + Google + email, row-level security as a second lock, object storage for photos. AI and OAuth (WHOOP/Oura) run in the API. No API keys in the app.
- `src/services/voice.ts` interface (speech to text, text to speech, live) with on-device first (whisper.rn / Phonon) and a cloud fallback (MASTER_PLAN §3.2).
- `tools/evals/`: the eval harness that picks a model per AI job (MASTER_PLAN §3.3).
- **Local-first storage** with `expo-sqlite` (the source of truth) + queued sync; migrate the AsyncStorage store.
- Database schema and repositories exactly as **`SYSTEM_DESIGN.md` §4** (Drizzle migrations), outbox + sync client (§2), API skeleton with `/sync`, `/ai/*` stubs, `/oauth/*`, `/files/sign` (§3).
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

## Phase 4b — Body: devices, sleep, readiness, load (SPEC §2.1, §3.1–3.4, §3.7, §3.8 · refs: Atria (MIT, port logic), react-native-healthkit, react-native-health-connect, ble-plx)
- HealthKit (`@kingstinct/react-native-healthkit`) + Health Connect (`react-native-health-connect`); WHOOP + Oura OAuth via edge functions. Normalise into `HealthSample` → `DailyHealth`.
- Screens: Body home, Readiness (14-day calibration, drivers), Sleep (need, debt, consistency, target bedtime), Load, Trends, Devices.
- `planToday()` uses readiness, sleep debt and load (SPEC §1.1), with "Why am I seeing this?" on each decision.
- Safety escalation for repeated low moods (§3.7).
**Acceptance:** real data from at least one iPhone + one Android device; scores match hand-calculated test fixtures; unit tests for readiness, sleep need and debt.
- **v17 additions (board v17, SYSTEM_DESIGN §5 health flow):** Body numbers + BMI and waist explained (`body_profile`; NICE lower BMI thresholds when the user has shared their background), Today’s target load (strain band from readiness), Heart-rate zones (Karvonen), Something may be coming on (skin temp + RHR + resp together), Breathing library + heart-rate-down pacer, Where this number came from (provenance on every score), Sleep regularity, Training load trend (acute:chronic), Your body this week (digest + one correlation). Port logic from Atria (MIT) where listed in IMPLEMENTATION_REFERENCES; NOOP is ideas only.
- **v11 functions (SPEC §3.8):** metric detail with honesty badges, How scores work, Body signals, Stress, Breathe, Journal + insights, Live workout (BLE Heart Rate Profile via `react-native-ble-plx`), auto-detected workouts, Sleep planner, Customise Today, Body coach. **Never connect to WHOOP straps over BLE.**
🛑 **Gate 4b (includes a health-copy safety review)**

## Phase 4c — Fuel: photo food logging (SPEC §3.5, §3.5b · refs: Cal-AI, openfoodfacts-js, vision-camera, whisper.rn)
Camera → `ai.food()` → item + portion confirm/edit → CoFID / USDA / Open Food Facts → daily totals vs Mifflin-St Jeor targets; barcode scan; "hide numbers" mode; 18+ gate; low-intake safeguard + Beat signposting.
- **Cal AI-style counters (board v17):** Fuel at a glance (big "left today" ring, protein/carbs/fat bars, eaten / burned / water), Your food targets (goal, target weight, pace capped 0.25–0.75 kg/wk, the maths shown, safe floors), Saved meals (one-tap re-log), Food and weight over time (trend + adherence month, never red), Exercise added back (none / half / all, default half), plus the v12 screens (meal result + fit score, what can I cook, week of meals, say what you ate, food day, barcode, search).
- **Cal AI level (board v17c):** Your plan is ready (projection to goal date), Log your weight (trend + on track), Scan a nutrition label (on-device text recognition, per 100 g → portion), What should I order? (menu photo, ranked by remaining targets), Fix it in your own words (correction → item diff, learns portions), Everything you ate today (sugar, salt, saturated fat, fibre + iron, calcium, vitamin D vs UK reference intakes), Describe a workout (MET estimate → Load and optional add-back), Your week (weekly budget, opt-in rollover), Meals and your sleep (eating window × sleep), Food quality (NOVA shares + 30 plants a week), Alcohol (UK 14 units, drink-free days, effect on HRV, Drinkline signpost), Log in two taps (recent / usual / quick add), Bring your history (MyFitnessPal / Lose It CSV, Apple Health).
🛑 **Gate 4c (includes safety review)**

## Phase 4d — Habits (SPEC §3.6 · refs: Loop habit strength (ideas only, GPL))
Tiny version + implementation intention ("After… I will… at…"), max 3 new habits, never-miss-twice rescue, auto-complete from data, automaticity check-ins every 2 weeks → graduation; ~66-day median timeline copy (remove all "14 days" claims).
🛑 **Gate 4d**

## Phase 5 — Talk, file, ask (#08–12, §19–21)
- Build an **`ai` service interface** (`src/services/ai.ts`): `talk(transcript) → FiledRecord[]`, `ask(question, context) → {answer, records}`. v1 implementation = wrap `processLifeOSMessage` + rule-based extraction. Leave a clear seam for a real model later.
- Talk: live transcript (expo-speech-recognition or a stub with typed input), recognised phrases fly into the Filing tray, then **Understood** (proposed → confirmed, Remove/Undo). Nothing is filed silently.
- Ask → answer with engine numbers → FileCard. Attach menu (solid dim, no blur) → Letter understood (stub OCR OK; real VisionKit later).
🛑 **Gate 5**

## Phase 6 — Onboarding + Chief Aim (#01–04, §37)
- Include the v17 setup step **Your body, in three numbers** (height, weight, optional waist; metric/imperial; skippable) and the permission primers (mic, camera, calendar, health, notifications).
- Welcome (cover image: a generic/places or mixed-cast frame), destination question, "Or just tell life" (→ Talk), Building your plan (live engine scan).
- `aim/new`: 4 steps with a live statement + suggestions; `aim`: statement, read ritual (morning/night + streak), progress, breakdown, edit with history.
🛑 **Gate 6**

## Phase 7 — Toolkit (#19–29), level-gated
L1: 30-day cash plan, Tax & NI. L2: Money (ledger, scrubber, hide balances), Subscriptions, Health stack. L3: Income & structure (`compareUKBusinessStructures`), Rent vs buy (`compareRentAndBuy`), Bloodwork (`interpretLabResult`). L4: Protection, Growth path. Accuracy rules §31: "Estimate / not advice", health never diagnoses.
🛑 **Gate 7**

## Phase 8 — Learn (§32)
Library, Lens (THINKER_ATEAM + Napoleon Hill), Idea in 60 seconds (3 cards → action → files an insight), **Teach it back (Feynman loop with `ai.grade`, SPEC §4.2)**, Ask through a lens, Recall (**FSRS** scheduling), Ideas into action. **Never quote, never impersonate.**
🛑 **Gate 8**

## Phase 8b — Teach me (SPEC §4.4 · MASTER_PLAN §3.5 · refs: your Feynman-voice-app `apps/api/src/lesson.ts`, `policy.ts`, `review.ts`, `apps/mobile/src/teach/*`, `ui/motion.ts`)
**Read `FENNY_LEARNING.md` first. Two sizes of lesson:** build the quick lesson first (the standard Teach me screens, unchanged), then the bigger Fenny lesson on top (Deep level, "Go deeper", Learn's longer ideas). Port the Fenny Drawing Kit from `vendor/fenny/scene/*` (Skia; life tokens; 30 devices, 208 things, hand-drawn wobble behind `prefs.handDrawn`, Settings toggle), the conversation policy (`vendor/fenny/api/policy.ts`), lesson writer + scenes (`api/lesson.ts`, `api/scene.ts`), analysis (`api/review.ts`) and the lesson film, puzzles and slider (`vendor/fenny/teach/*`). The lesson engine (`ai.lesson`, `ai.analyse`, `ai.showMe`), the `TeachMeButton` (appears for any term not yet in the user's LearningRecord, and in Talk when they sound unsure), and the 10 Teach me screens on the v14 board: offer → lesson ready → bites with pictures → guess first → puzzle → recap → tell it back → how you did → You've got it → What you've learned, plus the playable flow as the motion reference. Life's tokens only (drop the Feynman app's glass and colours). Every lesson ends by returning to the action that needed it.
🛑 **Gate 8b**

## Phase 8c — Know yourself, people and documents (board v17 chapters "You · Know yourself", "You · People and dates", "Plan · Documents and renewals")
Big Five (IPIP, public domain), body clock (rMEQ + sleep midpoint), values card sort, money mindset; each result changes engine behaviour as the screens say. People, person page, contacts import (selected only), birthday nudge 4 days before, important dates (memorial: no reminders); documents and renewals with `act_from` timing; Need support now; Focus session; Your year on your birthday.
🛑 **Gate 8c**

## Phase 9 — Grow + account (#30–34) + levels (SPEC §5 decision: Your levels, Routines, Bigger decisions, Area pages, Missions history, "Why am I seeing this?")
Weekly recap (PeekStack), Vantage point (ridge + gates), Level up (IntroCarousel, once per level, `feedback.cleared`), life+ (never blocks level 1), Settings (appearance, sound, haptics, hide balances, nudges, pictures: follow mood / glimpses, connected services, what life knows, export, delete).
🛑 **Gate 9**

## Phase 10 — Polish and ship-readiness
Motion pass (**every transition in MOTION.md**, §42), Reduce Motion, Dynamic Type 1.3×, VoiceOver labels, empty/error/offline states, an Android pass (back gesture, edge-to-edge, ripple-free presses), performance (lists virtualised, images sized).
🛑 **Gate 10: final review against DESIGN.md §12 checklist.**

---

## Phase 11 — Next level (SPEC §11)
Calendar awareness, Experiments, Recovery forecast, Cycle-aware readiness, Fitness age first; then Watch companion, Private mode (on-device AI), What life remembers, Your data in your AI (MCP, read-only), One picture from all your devices, Glucose, Habit strength, Water/sitting/recovery, Shared life. All on the board. ("Do it for me" is parked; skip it.)
🛑 **Gate 11**

## Phase 12 — Beta
TestFlight + Play internal testing with 20–50 people; crash reporting; privacy-preserving analytics (north star: moves completed per week); fix list.
🛑 **Beta review**

## Phase 13 — Launch
Store listings and screenshots from the board, privacy labels, health and money review notes, support page.

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
