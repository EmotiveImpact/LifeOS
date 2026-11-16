# life — Product & System Spec (v1.0)

> **What this is:** everything figured out before the build. How the parts work together, how every component behaves, the full health layer, the learning engine, the data model, and the blind spots with a decision for each.
> **How to use it:** `BUILD_PLAN.md` says *when* to build each thing. `DESIGN.md` says *how it looks*. **This file says *how it works*.** Where they disagree on behaviour, this file wins; on looks, DESIGN.md wins.

---

## 0. The promise, and the line we hold

**life is the everything app that actually does things:** it understands your money, health, work, home and growth, connects them, tells you the one next move, and teaches you why, so you level up.

**The line:** life does *not* try to show everything at once. An everything app fails when it feels like one. The answer, used throughout this spec, is three rules:
1. **One thing at a time.** Today shows *one* next move, *one* question, *one* image.
2. **Earn complexity.** New tools appear only at the level where they're useful (§5).
3. **Everything connects behind the scenes, not on screen.** The engine joins sleep, money, mood and habits; the user just sees a better Today.

---

## 1. The Life Engine — how everything works together

```
SIGNALS ──────────▶ UNDERSTANDING ──────────▶ DECISIONS ──────────▶ ACTIONS ──────▶ OUTCOMES
wearables, sleep,     FiledRecords, personal     Today's plan, the      missions, habits,   done / skipped /
food, mood (Pulse),   baselines, the Chief Aim,  one next move,         drafts, routines,   results (£, sleep,
money, documents,     levels, area understanding nudges, level gates,   lessons             readiness)
talk, answers                                    images, lessons
        ▲                                                                                      │
        └──────────────────────────── LEARNING: adjust weights, timing, difficulty ◀──────────┘
```

### 1.1 Daily plan generator (`planToday()`)
Runs on open, on new signals, and at 05:00 local time. Inputs → output:

| Input | Effect on Today |
|---|---|
| **Readiness** (§3.3) low (<34) | Cap Today at 1 demanding task; push the hard mission to tomorrow; suggest the rest habit |
| Readiness high (≥67) + mood driven | Lead with the "one bigger move" (gambit) |
| **Sleep debt** ≥ 3h over 3 nights | Health stack nudge + caffeine cut-off reminder; no new commitments after 20:00 |
| **Pulse** drained/anxious | Only items due ≤ 7 days; gentle copy; soft image; no glimpses |
| **Deadline** < 24h | Always shown first, whatever the mood (with calm copy) |
| **Payday** detected | Payday sweep routine appears |
| Strain high + calories < 70% of target | "Fuel" nudge (eat before the evening) |
| Habit at risk of a 2nd miss | "Never miss twice" card (§3.6) |
| Chief Aim exists | Tag the move that serves it: "For your Aim" |

**Ranking:** `score = urgency × 3 + aimFit × 2 + value(£ or health) × 1.5 + ease(mood, readiness) × 1 − fatigue(recent nudges)`. Top 1 = "next move", next 2 = "worth doing today". Everything else lives in Plan.

### 1.2 Cross-domain rules (examples the engine must support)
- Bad sleep ×3 → lower Today's load **and** explain why in one line ("You've slept 5h 40m on average, so today is lighter").
- Rebate cleared → £ goes to deposit → Aim progress updates → may unlock a glimpse (DESIGN.md §36).
- Mood drained 3 Mondays running → Mondays planned light by default (shown in Mood over time).
- Self-employed + no pension record → pension question queued in "life is asking".
- Training load up + protein under target 4 days → protein habit suggested.

### 1.3 Explainability rule
**Every automated decision shows "Why am I seeing this?"** (one sentence + the signals used). No black boxes.

---

## 2. Signals & integrations

### 2.1 Health data sources (priority order)
| Source | How | Notes |
|---|---|---|
| **Apple Health (HealthKit)** | `@kingstinct/react-native-healthkit` (Expo config plugin) | Sleep stages, HR, HRV (SDNN on Apple), resting HR, respiratory rate, steps, workouts, active energy, nutrition. **Needs a dev build (EAS), not Expo Go.** Apple rule: health data can't be used for ads and **mustn't be stored in iCloud**. |
| **Android Health Connect** | `react-native-health-connect` + its Expo config plugin | Same categories; per-type permissions; dev build required. |
| **WHOOP** | WHOOP developer API (OAuth) via our backend | Recovery, strain, sleep, cycles, workouts. Use their scores *as inputs*, labelled "from WHOOP". |
| **Oura** | Oura API v2 (OAuth) | Readiness, sleep, HRV (rMSSD), temperature deviation. |
| **Garmin / Fitbit / others** | One aggregator: **Terra**, **Junction (formerly Vital)** or **ROOK** | Garmin's own API needs partner approval; an aggregator gives breadth fast. Decision in §9.4. |
| Manual | Quick entries | Sleep times, weight, water, mood, workouts: always possible, never required. |

**Normalise everything** into `HealthSample { type, start, end, value, unit, source, confidence }`. Deduplicate by priority: device-native > wearable API > aggregator > manual.

### 2.2 Money, admin, documents
- Open Banking (read-only) via a regulated provider (e.g. TrueLayer / Plaid UK) — later phase.
- HMRC, NHS: deep links + document scanning now; APIs where available later.
- Documents: camera → on-device OCR (Apple VisionKit / ML Kit on Android) → `ai.extract()` → FiledRecords.

### 2.3 Permissions behaviour
Ask **in context, one at a time, after showing value** ("Connect Apple Health so Today can plan around your sleep"). A declined permission → the feature degrades to manual input, never nags more than once a month.

---

## 3. Health, maximised

### 3.1 Principles
- **Your baseline, not the population's.** All scores compare you to your own rolling baselines (7-day vs 30–60-day), shown with ranges.
- **Wellness, not medicine.** No diagnosis, no medical claims (avoids UK MHRA "software as a medical device"). Clear "talk to your GP" paths.
- **Honest estimates.** Every derived score says it's an estimate and shows its inputs.

### 3.2 Screens (new chapter "Body", reached from Today and You)
| Screen | What it shows |
|---|---|
| **Body (home)** | Readiness · Sleep · Load · Fuel, each one line + tick bar; today's suggestion ("Easy day: 30-min walk, bed by 22:45") |
| **Readiness** | Score 0–100 with the drivers (HRV vs baseline, resting HR vs baseline, sleep performance, respiratory rate), 30-day trend, what to do |
| **Sleep** | Last night: in-bed / asleep, stages timeline (if available), consistency (bed/wake variance), sleep need vs got, debt over 7 days, tonight's target bedtime |
| **Load** | Day load 0–21-style scale from heart-rate zones (TRIMP-style), workouts, recommended load band for today given readiness |
| **Fuel (food log)** | Photo log (§3.5), barcode, quick add; daily kcal/protein/fibre/water vs personal targets; meal timeline |
| **Habits** | The tracker (§3.6) |
| **Trends** | Weekly and monthly: sleep, readiness, load, weight, habits, mood overlaid (correlations shown carefully: "tends to", never "causes") |
| **Devices** | Connected sources, last sync, data types granted, disconnect |

Naming: **our own names** (Readiness, Load, Fuel). Never use WHOOP's or Oura's trademarks for our scores.

### 3.3 Readiness (0–100) — v1 model
`readiness = 100 × weighted_mean( z→pct(HRV_7d vs HRV_60d) 0.40, z→pct(−RHR_7d vs RHR_60d) 0.25, sleepPerformance 0.25, z→pct(−RespRate) 0.10 )`, clipped; needs **≥ 14 days** of data before showing a number (before that: "Calibrating, 9 of 14 days"). Bands: 0–33 low · 34–66 moderate · 67–100 high. If WHOOP/Oura provides its own recovery/readiness, show theirs as a source and use it as an input. Keep the model explainable; tune it later with data (§9.6).

### 3.4 Sleep
- **Sleep need** = personal baseline need (start 8h, learn from well-rested days) + debt repayment (spread over 3 nights) + load adjustment.
- **Sleep performance** = asleep ÷ need. **Consistency** = SD of bed and wake times (lower is better).
- Guidance based on NHS advice (most adults 7–9h), light exposure in the morning, caffeine cut-off. Bedtime nudge 45 min before target, only if the user opts in.

### 3.5 Fuel — photo food logging (Cal AI-style)
1. Snap → `ai.food(photo)` (vision model on our backend) returns items + estimated portions + confidence.
2. Map items to a nutrition database: **UK CoFID (McCance & Widdowson)**, **USDA FoodData Central**, **Open Food Facts** (barcodes).
3. **Always show a confirm/edit step** (portion slider per item). Photo estimates are typically off by ±20–30%, so the UI says "estimate".
4. Targets: BMR via **Mifflin-St Jeor** × activity (from Load) ± goal; protein 1.2–1.6 g/kg for active adults; fibre 30g (UK guidance).
5. **Safety (non-negotiable):** a "hide calories, show balance" mode; no red numbers, no streak-shaming; minimum target floors; if intake < 1,200 kcal for 7+ days or the user's language suggests distress → gentle check-in + signpost to **Beat** (UK eating-disorder charity). Not available to under-18s.

### 3.5b Fuel upgrades from Cal-AI (v12)
Ideas from [ovishkh/Cal-AI](https://github.com/ovishkh/Cal-AI) (MIT), rebuilt our way:
- **Meal result** after confirm: name, kcal, protein/carbs/fat/fibre, a **meal score (0–10)** for how well it fits *your* targets (not a moral judgement), and 1–2 short tips. Hidden in "Hide numbers" mode.
- **What can I cook?** Photo of the fridge or cupboard (or say it) → 3 recipes that fit today's remaining targets, with a dietary filter (**Halal**, Vegetarian, Vegan, High-protein, Keto, Dairy-free, plus allergies).
- **Week of meals + shopping list:** a 7-day plan from preferences and budget, with a shopping list grouped by aisle. One tap logs a planned meal.
- **Say it:** "I had a chicken wrap and a latte" → items to confirm (whisper.rn on device).
- Safety rules from §3.5 still apply (adults only, no shaming, low-intake safeguard).

### 3.6 Habits — the tracker
Grounded in research, built to *stick*:
- **Tiny first** (Fogg, *Tiny Habits*, B = MAP): every habit starts as a 2-minute version.
- **Implementation intentions** (Gollwitzer & Sheeran 2006 meta-analysis: medium-to-large effect): each habit is set up as "**After** [cue], **I will** [tiny action] **at** [place]".
- **Realistic timeline:** habits take a median of **~66 days** to feel automatic, ranging widely (18–254, Lally et al. 2010). Copy must say this. **Remove "most see results after 14 days"** wherever it appears.
- **Never miss twice:** one miss is normal; streaks show "13 of last 14", not a broken chain. A second consecutive miss triggers a gentle rescue card.
- **Automaticity check-in** every 2 weeks: "How automatic does this feel?" (1–5). At 4+ for 2 checks → habit "graduates" to a routine (and can level up).
- **Linked to signals:** habits can auto-complete from data (sleep ≥ 7h, steps ≥ 8k, protein logged, money moved).
- **Max 3 active new habits** at a time (more lowers success).
- UI: ticks per day (our progress language), the cue sentence, the tiny version, and "make it bigger" once it's automatic.

### 3.7 Health safety & escalation
- Repeated drained/anxious Pulses (5 of 7 days) or crisis language in Talk → a calm check-in + signposts: **NHS 111**, **Samaritans 116 123** (UK, free, 24/7), "talk to your GP". Never diagnose; never only an app response.
- Lab results: explain + "ask your GP" (already in §31 accuracy rules).


### 3.8 WHOOP-style functions, for any wearable (v11)
Taken as **ideas** from open-source WHOOP companions (NOOP, OpenStrap Edge, Atria) and rebuilt in life's design language. **life never connects to a WHOOP strap directly over Bluetooth**: that relies on reverse engineering and breaks WHOOP's Terms of Service. WHOOP users connect through the official WHOOP API (§2.1); everyone else uses Apple Health, Health Connect, Oura, or a standard Bluetooth heart-rate strap.

| Function | Screen | Data | Method |
|---|---|---|---|
| Metric detail (every metric) | HRV and others | any | value, personal normal range (shaded), 30-day trend, journal drivers, source, honesty badge |
| **Honesty badges** | everywhere | — | *Validated* (checked against a reference device) · *Personal baseline* · *Estimate*. Badges upgrade as each score passes validation (Atria's approach) |
| **How scores work** | `body/math` | — | every formula + citation (HRV: Task Force 1996; zones: Karvonen %HRR; load: Edwards TRIMP); no black boxes (NOOP's "transparent math") |
| **Body signals** | `body/signals` | skin temp, respiration, RHR, SpO₂ | deviation from personal baseline; ≥2 drifting together → gentle "take it easy" + NHS 111. Wellness only |
| **Stress (0–3)** | `body/stress` | HR, HRV, motion | HR above resting + lower HRV while still; labelled Estimate; offers Breathe |
| **Breathe** | `body/breathe` | live HR optional | resonance breathing ~6 breaths/min, 2 min; shows HR change |
| **Journal + insights** | `body/journal`, `body/insights` | user tags | evening tags → per-tag difference in next-day readiness, min 8 samples, "tends to" |
| **Live workout** | `body/workout` | Apple Watch / Wear OS / **Bluetooth Heart Rate Profile (0x180D)** straps | live HR, zone, load vs today's target. Library: `react-native-ble-plx` (MIT) |
| **Auto-detected workouts** | `body/detected` | HR + accelerometer | ask once; confirm, change type, or dismiss |
| **Sleep planner** | `body/sleepplan` | sleep need + debt | wake time + goal (Full recovery / Enough / Minimum) → bedtime incl. sleep latency |
| **Customise Today** | `body/customise` | prefs | up to 4 body numbers on Today |
| **Body coach** | `body/coach` | DailyHealth | Ask grounded in your data; cites the numbers it used |

**Licences (verified):** OpenStrap Edge is **AGPL-3.0** (ideas only); **NOOP is PolyForm Noncommercial** (no commercial use of its code at all, so look but don't copy); Atria is **MIT** (port its logic with attribution). Exact files: `IMPLEMENTATION_REFERENCES.md`. NeuroKit2 (MIT, Python) is for validating algorithms offline against recorded data. The 7 open-hardware projects (HealthyPi, ZSWatch, etc.) are parked: a possible future life wearable, separate from the app.

---

## 4. Learning — teach so it sticks

### 4.1 Methods (research-backed)
- **Feynman loop:** read the idea → **teach it back** in your own words (voice or text) → life spots the gap → re-read just that part → simplify → done.
- **Retrieval practice** (the testing effect, Roediger & Karpicke 2006) and **spaced repetition** (Cepeda et al. 2006): recall cards scheduled with **FSRS** (open-source scheduler).
- **Application over consumption:** every idea ends in one real action in the app; learning is measured by results (DESIGN.md §32).
- **Self-Determination Theory** (autonomy, competence, relatedness) shapes tone: choice, visible progress, never guilt.

### 4.2 The Feynman screen ("Teach it back")
After an idea's 3 cards: "Explain the barbell to a friend in 2–3 sentences." → `ai.grade(explanation, idea)` returns `{ covered: [...], missing: [...], misconception?: string }` → shows the gaps as highlighted chips → "Re-read this bit" → retry → "You've got it" files a `learning` record and schedules recall.

### 4.4 Teach me (lessons on demand)
From the Feynman-voice-app (the owner's own code), rewritten in life's language. See MASTER_PLAN §3.5 and the v13 board chapter "Teach me".
- **Trigger:** a `TeachMeButton` appears next to any term life shows that isn't in the user's `LearningRecord` (glossary terms are tagged in copy), and Talk offers "Want a two-minute lesson first?" when the user sounds unsure.
- **Build:** `ai.lesson({ topic, idea, said?, level })` → `{ idea, bites[2–3]: { title, text, picture { kind: flow|compare|cycle|layers|parts|none, labels }, caption, puzzle { kind: true_false|choose|fill_gap|order|match, prompt, options, answer, why } }, recap, explainBack }`. Uses the user's own numbers from the engine; cached per topic + level.
- **Flow:** bites (one asks for a guess before the reveal) → recap → tell it back (life asks why / what if, never explains) → `ai.analyse` (strengths quoted in their words, then gaps, the shakiest first) → optional `ai.showMe(gap)` then "now tell me in your own words" → You've got it → FSRS recall booked → back to the action that started it.
- **Never:** punish a wrong answer, show red, or count learning that leads nowhere as progress.

### 4.3 Personalisation ("deep learning", used responsibly)
- **LLM** (via backend) for language: talk extraction, Q&A with engine numbers, food photos, teach-back grading, drafts. Structured JSON outputs only, validated by schema; money/health answers grounded in engine data, never free-form numbers.
- **Statistical models on device** for health baselines (rolling means/SD), correlations, and readiness: explainable and private.
- **Bandit learning** for nudge timing and which next move to suggest (learns from done/skipped/snoozed). Start rule-based; switch on learning after enough data.
- **No training on user data** without explicit opt-in. Everything personal stays scoped to that user.

---

## 5. Levels — how the everything app stays simple
| Level | Unlocks (in addition to v5 §29) |
|---|---|
| 1 Starting out | Today, Pulse, Talk, missions, cash plan, tax check, **sleep basics, 1 habit** |
| 2 Stabilize | Money ledger, subscriptions, **Body home, Readiness (after 14d), Fuel, up to 3 habits** |
| 3 Set routines | Income, rent vs buy, bloodwork, **Load, Trends, Teach it back** |
| 4 Build momentum | Protection, growth path, **advanced sleep (debt planning), habit graduation chains** |

Users can always **open any tool early** from Plan ("Unlock early" with a one-line warning). Levels guide; they don't lock people out of their own data.

---

**Decision (v11): one life level, not one per area.**
- The engine's 4 levels (`computeLifeLevelState`): **1 Stabilize · 2 Set your routines · 3 Build momentum · 4 Expand your options**. Use these exact names everywhere.
- **Seasons:** after level 4, a new season starts and the new normal becomes level 1 again (`advanceOperatingRule` keeps routines running), so there's always a next vantage point.
- **Chapters (`computeGameChapter`) are folded in**: the user's destination is the *theme* of the climb ("Climbing toward: your first home"), not a second ladder.
- **Areas get progress, not levels**: each life area page shows how strong it is (ticks), plus its missions, routines and tools. Only one thing in the app is called a "level".
- Screens: Your levels (`grow/levels`), Routines (`routines`), Bigger decisions (`grow/decisions`), Area pages (`area/[id]`), Vantage point, Level up.

## 6. Behaviour spec — components

Every interactive component implements these states: **default · pressed · disabled · loading · error · empty** (where relevant), plus **Reduce Motion** and **VoiceOver/TalkBack** labels.

| Component | Behaviour |
|---|---|
| **Press** (all tappables) | Scale 0.97 on a spring; haptic per kind; min target 44pt; disabled = 40% opacity, no haptic; long-press only where documented |
| **Button** | Primary: one per screen; loading = spinner replaces label, width locked; success = brief check, then the next state; errors show inline below, never toasts only |
| **Card** (`onPress`) | Opens with shared transition; swipe actions only on NudgeCard |
| **TwoTone** | Enters once per screen visit; re-renders without animation on data change |
| **Ticks** | Streak/meter are read-only; scrubber: drag with a 40ms-throttled haptic, snap on release, VoiceOver adjustable (± one tick) |
| **CapsuleMeter / numbers** | Spring to new values; announce changes politely to screen readers |
| **StageStepper** | Advances only via a confirmed action; current node halo pauses with Reduce Motion |
| **WeekStrip** | Tap selects; swipe pages weeks; density dots from deadlines + habits |
| **PeekStack** | Tap a back card → front; swipe front down → back; max 4 visible |
| **NudgeCard** | Swipe right = done (success haptic + sound), left = snooze 1 day; undo toast for 5s |
| **PulseField** | Drag/tap anywhere; mood change = selection haptic; saving writes `pulseLog` and re-plans Today |
| **ChoiceCard** | Single-select radio group; selection haptic; VoiceOver "1 of 5, selected" |
| **Sheet** | Snap 55/92%; drag to dismiss; backdrop tap closes; unsaved edits ask before closing |
| **Dock / AskBar** | Hides on scroll down, returns on scroll up or tap near the bottom; Talk opens full-screen |
| **ImageTreatment** | Shows the domain light field until loaded; 400ms fade; Reduce Motion = no drift |
| **Countdown** | Updates each minute; under 24h turns ember; past due = "overdue" in calm copy |
| **MoneyFigure / LedgerRow** | Respect `hideBalances` everywhere instantly |
| **Habit row** (new) | Tap = done today (complete haptic); long-press = edit; auto-done from data shows a small "from Apple Health" |
| **Food item row** (new) | Portion slider (0.25× steps), swap item, delete; totals update live |

### 6.1 The count instrument (CountStepper) — where it's used
The household stepper is one use of a general **count instrument**: a big number, − / +, and a **live consequence line** that says what the number changes. Use it only when (a) the answer is a small whole number (0–16+), and (b) the number **changes something real** the user should see straight away. Never for money (use the slider or keypad).

| Question | Where | What the consequence line says (engine) |
|---|---|---|
| **People in your home** | You → Home, onboarding, Talk follow-up | Council tax single-person discount (25%), Marriage Allowance, HMO/band checks (`getCrowdUnlockSummary`) |
| **Children under 16** | You → Home | Child Benefit, Tax-Free Childcare, 15/30 free hours |
| **Bedrooms you need** | Rent vs buy, Aim | Price range and deposit for that size in your area |
| **Income sources / jobs** | You → Work | Self Assessment needed?, tax code check |
| **Training days a week** | Body → Load, habit setup | Recommended load and protein target |
| **Alcohol units a week** | Body (optional, private) | NHS guidance is to keep to 14 units a week, spread over 3+ days |
| **Months of buffer you want** | 30-day cash plan, Aim | Target £ and when you'll reach it |

Glyphs: **people figures only for people** (household, children). Other counts use a matching quiet glyph row (doors for bedrooms, dots for days) or just the number. Haptic: selection tick per step; the consequence line updates with a soft crossfade.

## 7. Behaviour spec — screens & system

**Every screen has four designed states:** loading (skeleton in the real layout, no spinners in the middle of the page) · empty (one sentence + one action) · error (what happened + retry, data kept) · offline (cached data + "updated 2h ago").

System behaviours:
- **Undo** for every destructive or filing action (5s), plus the history in "What life knows".
- **Sync**: local-first; writes queue offline and sync later; conflicts resolve by last-write with a per-field merge for lists.
- **Notifications:** max 1 nudge/day + time-critical deadlines; quiet hours default 21:00–08:00; each notification type can be switched off; every nudge deep-links to the exact screen.
- **Time & dates:** the user's timezone; "today" rolls over at 04:00 for sleep logic.
- **Background:** health sync on app open + background fetch (iOS limits apply); never drain battery.
- **Rate limits & cost:** AI calls are batched; food photos compressed to ~1024px before upload.

---

## 8. Data model (additions)
> The full schema (tables, fields, sync rules) is in **`SYSTEM_DESIGN.md` §4**, including `body_profile` (height, weight, waist, body fat, sex at birth, activity, units) and the v17 tables (people, dates, documents, saved meals, food targets).


```ts
type HealthSample = { id; type: 'sleep'|'hr'|'hrv'|'rhr'|'resp'|'steps'|'workout'|'energy'|'weight'|'water'|'nutrition'; start; end; value: number; unit; source: 'healthkit'|'healthconnect'|'whoop'|'oura'|'aggregator'|'manual'; confidence: number };
type DailyHealth = { date; sleep?: { inBed; asleep; stages?; bedtime; wake; performance; need; debt }; readiness?: { score; drivers }; load?: { score; zones }; fuel?: { kcal; protein; fibre; waterMl; targets } };
type Habit = { id; name; tinyVersion; cue: string; place?: string; schedule: 'daily'|{ days: number[] }; autoFrom?: { type; threshold }; createdAt; status: 'active'|'graduated'|'paused'; log: { date; done: boolean; source: 'manual'|'auto' }[]; automaticity: { date; score: 1|2|3|4|5 }[] };
type FoodEntry = { id; at; photoUri?; items: { name; dbId; grams; kcal; protein; carbs; fat; fibre; confidence }[]; confirmed: boolean };
type LearningRecord = { ideaId; source: 'library'|'teachme'; topic?: string; level?: 'simple'|'standard'|'deep'; origin?: { screen; recordId? }; readAt; guess?: { correct: boolean }; puzzles?: { kind; correct: boolean }[]; teachBack?: { text; covered: string[]; missing: string[] }; fsrs: { due; stability; difficulty }; applied?: { recordId; result } };
// plus existing: FiledRecord (DESIGN §20), ChiefAim (§37), pulseLog, pictures prefs
```
**Storage:** on device (SQLite via `expo-sqlite`) as the source of truth; encrypted backup/sync to the backend (§9.2). Health data is **never** put in iCloud and never used for ads.

---

## 9. Blind spots — and the decision for each

| # | Blind spot | Risk | Decision |
|---|---|---|---|
| 9.1 | **Everything-app overload** | Users bounce in week 1 | One move at a time, level-gated (§0, §5); usability-test onboarding with 5 people before beta |
| 9.2 | **No backend yet** | No accounts, sync, AI, OAuth for WHOOP/Oura | **Neon** (serverless Postgres, a branch per phase) + our own TypeScript API + Better Auth (or Neon's auth): Sign in with Apple/Google/email; row-level security as a second lock; AI and OAuth in the API; client never holds API keys (MASTER_PLAN §3.1) |
| 9.3 | **Health data law** | UK GDPR special-category data; Apple/Google health policies | Explicit consent per data type; DPIA before beta; privacy policy in plain words; health data never in iCloud, never for ads; export + delete everything |
| 9.4 | **Device breadth vs effort** | Garmin needs partner approval; many APIs | v1: HealthKit + Health Connect (covers most wearables via the phone) + WHOOP + Oura direct. v2: an aggregator for the long tail |
| 9.5 | **Medical-device creep** | Readiness/lab advice → MHRA scope | Wellness framing, no diagnosis, referral language; legal review of health copy before launch |
| 9.6 | **Score credibility** | A made-up readiness score = trust loss | Personal baselines, 14-day calibration, show drivers; validate against WHOOP/Oura scores on internal testers; publish a "How scores work" page |
| 9.7 | **Food-logging harm** | Disordered eating | Safety rules in §3.5; 18+ only for calorie features; "hide numbers" mode |
| 9.8 | **Mental-health moments** | Crisis language in Talk/Pulse | Escalation path §3.7; never AI-only responses to crisis |
| 9.9 | **AI hallucination** | Wrong £ or health claims | Engine-grounded numbers; JSON schemas; refuse when unsure; "Estimate, not advice" labels (DESIGN §31) |
| 9.10 | **AI cost per user** | Margins | Batch calls, cache, small models for extraction, larger only for vision/teach-back; per-user monthly budget; life+ covers heavy use |
| 9.11 | **Rules go stale** | Tax/benefit rules change every April | `packages/core` rules versioned by tax year with a yearly update checklist + tests; show "rules for 2026/27" |
| 9.12 | **Wrong habit science in copy** | Credibility | Replace "results after 14 days" with the ~66-day median (Lally 2010) everywhere |
| 9.13 | **Notification fatigue** | Uninstalls | 1/day cap, bandit timing, easy per-type off switches, weekly "too many?" check |
| 9.14 | **Battery & background limits** | iOS throttles background work | Sync on open + background fetch; no constant polling; HealthKit observer queries only for sleep/workouts |
| 9.15 | **Offline & sync conflicts** | Lost data | Local-first SQLite + queued writes (§7) |
| 9.16 | **Accessibility** | Excludes users; store risk | Dynamic Type, screen readers, Reduce Motion, contrast; an a11y pass every gate |
| 9.17 | **Android parity** | iOS-first drift | Android build + screenshots at every gate; Health Connect parity |
| 9.18 | **Testing** | Regressions in money/health maths | Unit tests for engine + scores (Bun tests exist); Maestro end-to-end flows for core journeys |
| 9.19 | **Measuring success** | Building blind | North star: **weekly moves completed per active user**; plus 7/30-day retention, £ found/claimed, habit graduation rate, readiness trend; privacy-preserving analytics (PostHog EU or similar), opt-out |
| 9.20 | **Minors** | Legal + safety | 18+ at launch (age gate) |
| 9.21 | **Copyright** | Thinkers' ideas, images | Paraphrase only (§32); generated images owned/licensed; keep prompts and originals in `design-references/generated/` |
| 9.22 | **Representation** | Stereotyped or awkward images | Diverse cast now (§44); human review of every person image before it ships |
| 9.23 | **Monetisation fit** | Paywall blocks core value | Level 1 free forever; life+ = devices, AI-heavy features (food photos, teach-back), advanced health |
| 9.24 | **Support & trust** | No help path | In-app "Report a problem" with logs (opt-in); a "How life works" help section |
| 9.26 | **Reverse-engineered wearables** | WHOOP ToS breach, App Review rejection, legal risk | Never read WHOOP straps over BLE. Official WHOOP API + HealthKit/Health Connect + standard BLE heart-rate straps only. Take ideas, not AGPL/unlicensed code |
| 9.25 | **Disk space on the dev Mac** | Builds fail | Free ≥ 30 GB before Phase 1 (EAS dev builds + Android tooling are large) |

---

## 10. What this adds to the build (see BUILD_PLAN.md)
New phases: **Platform** (backend, auth, SQLite, sync, dev builds), **Body** (devices, readiness, sleep, load, trends), **Fuel** (photo food log), **Habits**, **Teach it back**. Health & safety reviews are part of their gates.


---

## 11. Emerging and missing — what takes life to the next level

Found by comparing life with the strongest open-source projects (see `IMPLEMENTATION_REFERENCES.md`) and what's emerging in 2026. Ordered by impact.

| # | Feature | Why it matters | Build with |
|---|---|---|---|
| 1 | **Calendar awareness** (missing!) | Nudges promise "you've got 20 free minutes", which needs the calendar. Also lighter Todays on busy days | `expo-calendar` (read-only, opt-in) |
| 2 | **Experiments (n-of-1)** | "Try no caffeine after 12 for 14 days": life measures the effect on *your* sleep and readiness and tells you if it worked. Turns advice into personal evidence | Journal + correlation; NOOP's `DoseResponseEngine` idea |
| 3 | **Recovery forecast** | "If you're in bed by 22:45, tomorrow's readiness should be about 68." Makes tonight's choice visible | Readiness model + sleep plan; NOOP `RecoveryForecast` idea |
| 4 | **Cycle-aware readiness** | Half of users: hormonal cycles shift HRV, temperature and RHR. Baselines and guidance should respect the phase (opt-in, private) | HealthKit cycle tracking; NOOP `CyclePhaseEngine` idea |
| 5 | **Fitness age / VO₂ max** | One motivating number that improves with training | HealthKit VO₂max; NOOP `FitnessAgeEngine` idea |
| 6 | **Watch companion** | Breathe, live workout and today's move on the wrist (Apple Watch + Wear OS) | `@bacons/apple-targets` watch target; NOOP watch views idea |
| 7 | **On-device AI** | Talk transcription and basic extraction stay on the phone: private, fast, works offline | `whisper.rn`, `llama.rn` |
| 8 | **Long-term memory** | life remembers context across months ("you said rent goes up in March") with sources and delete | FiledRecord + mem0 patterns |
| 9 | **"Do it for me", with approval** (⏸ parked 16 Nov 2026; if revived, email/letter tasks first) | Agentic actions: life pre-fills the form, drafts the email, opens the cancel page. You approve every step; nothing is sent automatically | AI service + deep links; approval gate in UI |
| 10 | **Your data in your AI** | Let people ask ChatGPT or Claude about their own life data through a local, permissioned connection | MCP server pattern (NOOP `NoopLocalAccess` idea) |
| 11 | **Unified wearables, self-hosted** | Garmin, Polar, Suunto and more without paying an aggregator per user | `open-wearables` (MIT) |
| 12 | **Metabolic (CGM)** | Consumer glucose sensors (via HealthKit) + Fuel = how meals affect *you* | HealthKit blood glucose |
| 13 | **Habit strength score** | Forgiving progress (Loop's approach): misses lower it a little, they don't reset it | Our own EMA (Loop is GPL: ideas only) |
| 14 | **Hydration, sedentary and heart-rate recovery** | Small daily signals people actually act on | HealthKit + simple rules |
| 15 | **Shared life (Commune-style)** | Households share bills, chores, goals; partners share a Chief Aim | Shared spaces in Postgres with per-member scopes (later) |

v12 board shows #1–#5 and the Fuel upgrades as screens.
