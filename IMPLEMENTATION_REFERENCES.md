# life — Implementation References

> **What this is:** the open-source code worth learning from, mapped to each part of life, with **exact files** and a **licence rule** for each.
> **Pinned:** every repo here is locked to an exact commit in `vendor/REFERENCES.lock.md`. Atria's files are copied in `vendor/atria/` (MIT), Cal-AI's in `vendor/calai/` (MIT), and the owner's Fenny code in `vendor/fenny/`.
> Read alongside `SPEC.md` (what to build) and `BUILD_PLAN.md` (when). Licences were checked on GitHub on 15 Nov 2026; re-check before shipping.

## Licence rules (read first)

| Rule | Licences | What you may do |
|---|---|---|
| 🟢 **Use** | MIT, Apache-2.0 | Install as a dependency, or copy code with the copyright notice kept. Add to `THIRD_PARTY_NOTICES.md`. |
| 🟡 **Ideas only** | GPL-3.0, AGPL-3.0 | Read to understand the approach, then **write our own implementation**. Never copy code; copying would force life to be open-sourced. |
| 🔴 **Look, don't touch** | PolyForm Noncommercial, no licence | Commercial use of the code isn't allowed at all. You can learn *what* they compute from docs and behaviour. Don't copy code or structure. |
| ⛔ **Never** | Reverse-engineered device protocols (e.g. WHOOP BLE) | Breaks the maker's Terms of Service (SPEC §9.26). |

---

## 1. Platform: libraries we install 🟢

| Area | Repo | Licence | Use for |
|---|---|---|---|
| Apple Health | [kingstinct/react-native-healthkit](https://github.com/kingstinct/react-native-healthkit) | MIT | Sleep, HR, HRV, workouts, nutrition reads; observer queries for background updates |
| Android Health | [matinzd/react-native-health-connect](https://github.com/matinzd/react-native-health-connect) | MIT | Health Connect parity with HealthKit |
| Bluetooth HR straps | [dotintent/react-native-ble-plx](https://github.com/dotintent/react-native-ble-plx) | Apache-2.0 | Standard Heart Rate Profile (0x180D) for live workouts, with R-R intervals for HRV |
| Camera + barcodes | [margelo/react-native-vision-camera](https://github.com/margelo/react-native-vision-camera) | MIT | Food photo, barcode, letter scanning |
| Spaced recall | [open-spaced-repetition/ts-fsrs](https://github.com/open-spaced-repetition/ts-fsrs) | MIT | Recall scheduling for Learn (SPEC §4) |
| Food database | [openfoodfacts/openfoodfacts-js](https://github.com/openfoodfacts/openfoodfacts-js) | Apache-2.0 | Barcode → nutrition (data is ODbL: attribute Open Food Facts) |
| On-device transcription | [mybigday/whisper.rn](https://github.com/mybigday/whisper.rn) | MIT | Talk offline and privately (whisper.cpp) |
| On-device LLM (option) | [mybigday/llama.rn](https://github.com/mybigday/llama.rn) | MIT | Small private model for extraction and coach drafts when offline |
| On-device AI (option) | [software-mansion/react-native-executorch](https://github.com/software-mansion/react-native-executorch) | MIT (LICENSE checked 20 Nov 2026) | Alternative to llama.rn |
| Local-first DB | [Nozbe/WatermelonDB](https://github.com/Nozbe/WatermelonDB) | MIT | Alternative to expo-sqlite for large health time series |
| Sync to Postgres (Neon) | [powersync-ja/powersync-js](https://github.com/powersync-ja/powersync-js) | Apache-2.0 | Only if our own push/pull sync gets hard: local-first SQLite ↔ Postgres (MASTER_PLAN §3.1) |
| Auth | [better-auth/better-auth](https://github.com/better-auth/better-auth) | MIT | Sign in with Apple, Google, email in our API, with Neon Postgres |
| Wearable aggregator (self-hosted) | [the-momentum/open-wearables](https://github.com/the-momentum/open-wearables) | MIT | One API for many wearables (Garmin, Polar, Suunto…) without paying Terra; evaluate for Phase 4b v2 |
| AI memory | [mem0ai/mem0](https://github.com/mem0ai/mem0) | Apache-2.0 | Reference only since 20 Nov 2026, when we chose our own memory layer behind `memory.ts`. Read it for fact extraction and add/update/delete prompts. See §7.1 for the stronger references |
| App framework | [expo/expo](https://github.com/expo/expo) | MIT | Examples for config plugins, EAS builds, background tasks |

## 2. Health and WHOOP-style scoring

### 🟢 Atria — [adidshaft/atria](https://github.com/adidshaft/atria) (MIT, Swift) · the best licensed reference
Port the *logic* to TypeScript in `packages/core/src/health/`, keeping the MIT notice.

| life feature | Atria files (`Atria/Atria/…`) |
|---|---|
| HRV (RMSSD, qualification, freshness) | `HRV.swift`, `Metrics.swift`, tests `AtriaHRVQualificationTests.swift`, `AtriaHRVDisplayFreshnessTests.swift` |
| Night baseline / personal normal | `AtriaNightBaseline.swift`, `AtriaBaselineEvidenceTests.swift` |
| Readiness drivers ("Why") | `AtriaRecoveryDrivers.swift`, `AtriaRecoveryDetailPresentationTests.swift` |
| Strain / load + pacing to target | `AtriaStrainLoadModel.swift`, `AtriaStrainPacing.swift`, `AtriaStrainRecoveryComboChart.swift` |
| Sleep need, debt, planner | `AtriaSleepBudget.swift`, `AtriaSleepPlanner.swift`, `AtriaSleepPlannerCharts.swift` |
| Sleep stages + hypnogram | `AtriaSleepHypnogram.swift`, `AtriaSleepStageRows.swift`, `AtriaSleepMotionQuiescence.swift` |
| Naps / daytime sleep | `AtriaDaytimeQuiescentSleepDetector.swift` |
| Auto-detected walks/workouts | `AtriaWalkBoutDetector.swift`, `AtriaDetectionLog.swift`, `AtriaDetectedActivityReviewTests.swift` |
| Journal + insights | `AtriaJournalStore.swift`, `AtriaJournalInsights.swift`, `AtriaJournalTab.swift` |
| Honesty badges / provenance | `AtriaMetricConfidencePresentation.swift`, `AtriaMetricProvenanceCard.swift`, `AtriaAboutMetricSheet.swift` |
| Coach from your data | `AtriaOnDeviceCoach.swift`, `AtriaAICoach.swift` |
| Metric validation plan | `docs/METRIC_VALIDATION_PLAN.md` (copy the *process* for our badges) |
| Test strategy | `AtriaTests/*` (about 150 focused tests: mirror the style for our scores) |

### 🔴 NOOP — [ryanbr/noop](https://github.com/ryanbr/noop) (**PolyForm Noncommercial**, Swift) · look, don't touch
The widest feature set of any of these projects. Use the **list of engines** as a roadmap of what to build ourselves; never open-copy the code. Engines in `Packages/StrandAnalytics/Sources/StrandAnalytics/` worth matching with our own implementations:
`ReadinessEngine`, `RecoveryForecast`, `StrainScorer`, `TrainingLoadEngine`, `HRZones`, `HeartRateRecovery`, `SleepDebt`, `SleepStagerV2`, `CircadianEngine`, `DaytimeStress`, `StressOnsetDetector`, `IllnessSignalEngine`, `SkinTempDisplay`, `CyclePhaseEngine`, `FitnessAgeEngine`, `HydrationGoal`, `SedentaryDetector`, `AutoWorkoutDetector`, `WorkoutTypeClassifier`, `BreathProtocolCatalog`, `ResonanceEngine`, `HRDownPacer`, `CorrelationEngine`, `DoseResponseEngine`, `BehaviorInsights`, `WeeklyDigest`, `ScoreConfidence`, `MetricArbitrationPolicy` (picking the best source when two devices disagree).
Also notable: an **MCP server** (`Packages/NoopLocalAccess`) that lets AI assistants query your own data, plus Apple Watch breathe/workout views.

### 🟡 OpenStrap Edge — [OpenStrap/edge](https://github.com/OpenStrap/edge) (AGPL-3.0, Flutter) · ideas only
`docs/FEATURES.md` (feature inventory), `docs/proposals/whoop-spo2.md`, `docs/proposals/vendor-staged-sleep.md` (using a vendor's sleep stages vs your own), the Android widgets (`android/.../SleepWidgetProvider.kt`), and `HealthConnectSleepWriter.kt` (writing sleep back to Health Connect).

### 🟢 Signal processing (offline validation, not in the app)
[neuropsychology/NeuroKit](https://github.com/neuropsychology/NeuroKit) (MIT) and [paulvangentcom/heartrate_analysis_python](https://github.com/paulvangentcom/heartrate_analysis_python) (MIT): check our HRV and HR algorithms against recorded data in `tools/validation/` notebooks.

## 3. Food (Fuel)

### 🟢 Cal-AI — [ovishkh/Cal-AI](https://github.com/ovishkh/Cal-AI) (MIT, Flutter) · a small student project; ideas and data shapes
| Take | File |
|---|---|
| Nutrition result shape: food name, calories, macros (protein/carbs/fat/fibre), **health score**, description, **tips** | `lib/models/nutrition_info.dart` |
| Vision prompt → structured JSON (Gemini; we use our AI service) | `lib/services/gemini_api.dart` |
| Result card + macro chart | `lib/widgets/nutrition_card.dart`, `lib/widgets/nutrition_chart.dart` |
| **Recipes from a photo of ingredients**, dietary filters (Halal, Keto, High-protein…), **weekly meal plans**, voice input | `README.md` feature list, `lib/screens/calorie_ai.dart` |
Our version adds: the confirm/edit step, UK CoFID / Open Food Facts lookups, personal targets and safety rules (SPEC §3.5).

## 4. Habits, money, learning

| Area | Repo | Licence | Take |
|---|---|---|---|
| Habits | [iSoron/uhabits](https://github.com/iSoron/uhabits) (Loop) | 🟡 GPL-3.0 | Ideas only: the **habit strength score** (an exponential moving average that forgives misses), frequency targets ("3 times a week"), history heatmap |
| Budgeting | [actualbudget/actual](https://github.com/actualbudget/actual) | 🟢 MIT | Envelope budgeting model, local-first sync, bank-import parsers, rules engine |
| Finance app | [maybe-finance/maybe](https://github.com/maybe-finance/maybe) | 🟡 AGPL-3.0 | Ideas only: net-worth timeline, account grouping. **Archived July 2025**; the maintained fork is [we-promise/sure](https://github.com/we-promise/sure) (also AGPL, §7.5) |
| Device companion UX | [Freeyourgadget/Gadgetbridge](https://codeberg.org/Freeyourgadget/Gadgetbridge) | 🟡 AGPL-3.0 | Ideas only: pairing flows, user-controlled data |

## 5. Teach me — your own Feynman app ✅ (your code: copy freely)
[EmotiveImpact/Feynman-voice-app](https://github.com/EmotiveImpact/Feynman-voice-app). The owner has OK'd reuse. **A copy of every file below is in `vendor/fenny/`** (docs, api, scene, teach, ui). Rewrite in life's tokens and naming; drop its glass and colours. Read `FENNY_LEARNING.md` first.

| life feature | Files |
|---|---|
| Lesson builder (bites, pictures, puzzles, levels, caching, model fallback) | `apps/api/src/lesson.ts` |
| Curious-friend teaching moves, "Teach me" offer line | `apps/api/src/policy.ts`, `docs/conversation-engine.md` |
| Strengths + gaps analysis, "Show me" | `apps/api/src/review.ts`, `docs/behavioural-design.md` |
| Lesson film, guess-before-reveal | `apps/mobile/src/teach/TeachMode.tsx`, `teach/Picture.tsx`, `teach/Puzzle.tsx`, `teach/Slider.tsx` |
| Drawn pictures (Fenny Drawing Kit: 30 devices, 208 things, hand-drawn mode) | `vendor/fenny/scene/draw.ts`, `things.ts`, `types.ts`, `SceneView.tsx`; scene writer `vendor/fenny/api/scene.ts` |
| Motion springs (now `motion` in tokens.ts) | `apps/mobile/src/ui/motion.ts` |
| On-device speech (Phonon) and voice providers | the Phonon Expo module and the voice services in `apps/api` |

## 6. How to use this in the build
- Each BUILD_PLAN phase lists the references it needs. Antigravity reads the files above **before** implementing that feature.
- Ported logic lives in `packages/core/src/health/*` with a header comment naming the source repo, file and licence.
- Maintain `THIRD_PARTY_NOTICES.md` for every 🟢 item used.
- Claude checks at each gate that no 🟡/🔴 code was copied.

## 7. Repo sweep (20 Nov 2026)
About 90 repos checked for activity, quality and licence; the strongest are below and pinned in `vendor/REFERENCES.lock.md` under "Repo sweep pins". **Nothing here is installed or copied yet.** 🟢 means the code may be ported with the notice kept (header comment plus `THIRD_PARTY_NOTICES.md`); 🟡 means read for ideas only. Installing any of these as a package still needs the usual approval and an exact version pin. Ranked shortlist and new feature ideas: `/mnt/project-files/repo-sweep/README.md`.

### 7.1 Memory and the AI brain
| Area | Repo | Licence | Take |
|---|---|---|---|
| Memory engine (best fit) | [vectorize-io/hindsight](https://github.com/vectorize-io/hindsight) | 🟢 MIT | Postgres + pgvector memory, so it maps onto Neon. Retain, recall and reflect; typed facts (world vs experience); observations consolidated with evidence quotes and a proof count; four-way recall (meaning, keywords, links, time) merged by reciprocal rank fusion, then reranked. Files: `hindsight-api-slim/hindsight_api/engine/memories/pg/consolidation.py`, `hindsight-api-slim/hindsight_api/engine/search/fusion.py`, `hindsight-docs/docs/developer/retrieval.md` |
| Facts that change over time | [getzep/graphiti](https://github.com/getzep/graphiti) | 🟢 Apache-2.0 | Bi-temporal facts (`valid_at` / `invalid_at`): a contradicted fact is closed, never deleted, so "rent goes up in March" and "I moved in June" stay true for their dates. Files: `graphiti_core/utils/maintenance/edge_operations.py`, `graphiti_core/edges.py` |
| Readable, portable memory | [EverMind-AI/EverOS](https://github.com/EverMind-AI/EverOS) | 🟢 Apache-2.0 | Memory kept as Markdown the user owns and can export. Keeps the person's episodes and profile apart from the agent's own lessons; repeated wins become reusable skills. Fits "What life remembers". Files: `src/everos/memory/strategies/extract_user_profile.py`, `src/everos/memory/models.py` |
| Model adapters | [vercel/ai](https://github.com/vercel/ai) | 🟢 Apache-2.0 | Provider-agnostic calls and zod structured output; pattern for `apps/api/src/models` and the brain router. Folder: `packages/ai` |
| Model trials | [promptfoo/promptfoo](https://github.com/promptfoo/promptfoo) | 🟢 MIT | Eval runner and side-by-side model comparison for `tools/evals` and `tiers.json` (Evalite is archived, so use this) |

### 7.2 On-device AI and voice
| Area | Repo | Licence | Take |
|---|---|---|---|
| One interface, phone or cloud | [callstackincubator/ai](https://github.com/callstackincubator/ai) | 🟢 MIT | On-device models in React Native behind the Vercel AI SDK interface, including Apple Foundation Models. Lets the brain swap phone and cloud models without new code |
| Keep AI on this phone | [a-ghorbani/pocketpal-ai](https://github.com/a-ghorbani/pocketpal-ai) | 🟢 MIT | A shipped React Native app on llama.rn + whisper.rn + TTS: model download, storage and memory checks, chat UX. Files: `src/store/ModelStore.ts`, `src/store/ASRStore.ts` |
| Faster speech to text | [moonshine-ai/moonshine](https://github.com/moonshine-ai/moonshine) | 🟢 MIT (code and English models) | Streaming on-device transcription, quicker than Whisper on short clips. Candidate for Talk. The older non-English models use a non-commercial licence: avoid those |
| Offline voice fallback | [XDcobra/react-native-sherpa-onnx](https://github.com/XDcobra/react-native-sherpa-onnx) | 🟢 MIT | Offline speech to text, text to speech (Kokoro) and voice activity detection on iOS and Android, for phones where Phonon isn't available. Upstream `k2-fsa/sherpa-onnx` is Apache-2.0 |

### 7.3 Planning, focus and self-experiments
| Area | Repo | Licence | Take |
|---|---|---|---|
| Experiments and tripwires | [Lethe044/hermes-life-os](https://github.com/Lethe044/hermes-life-os) | 🟢 MIT | Self-experiments with before/after averages, effect size and a verdict (at least 3 days a side); tripwires such as "tell me if sleep is under 6h for 3 days"; lagged correlations (at least 4 days, \|r\| ≥ 0.4); workload forecast, estimate accuracy, time budgets, weekly review. Files: `demo/experiments.py`, `demo/tripwires.py`, `demo/analytics.py`, `demo/patterns.py` |
| Ranking tasks | [GothenburgBitFactory/taskwarrior](https://github.com/GothenburgBitFactory/taskwarrior) | 🟢 MIT | Urgency as a weighted sum with tunable coefficients (due 12, blocking 8, age 2, waiting −3, blocked −5, plus priority). A tested reference for the `planToday()` score. Files: `src/Task.cpp`, `test/urgency.test.py` |
| Day timeline | [super-productivity/super-productivity](https://github.com/super-productivity/super-productivity) | 🟢 MIT | Tasks laid out beside calendar events, timeboxing, break reminders, an anti-procrastination nudge and focus mode |
| Proper N-of-1 trials | [studyu-health/studyu](https://github.com/studyu-health/studyu) | 🟢 MIT | How to design and analyse a one-person trial (phases, randomised order, outcome check). Grounds the Experiments feature. Flutter |

### 7.4 Habits, health and mind
| Area | Repo | Licence | Take |
|---|---|---|---|
| Habit score we can port | [FriesI23/mhabit](https://github.com/FriesI23/mhabit) | 🟢 Apache-2.0 | Forgiving habit score with separate models for "do" and "don't" habits; a permissive alternative to Loop's GPL score. Files: `lib/models/_score/calculator.dart`, `docs/wiki/Design꞉-Habit-Score.md` |
| What predicts what | [meltforce/FreeReps](https://github.com/meltforce/FreeReps) | 🟢 MIT | Correlation explorer (Pearson r at four lags) and an MCP server that lets an AI read your own health data. Files: `server/web/src/utils/stats.ts`, `server/web/src/pages/CorrelationPage.tsx`, `docs/mcp-server.md` |
| Exercise library | [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db) | 🟢 Unlicense (public domain) | 800+ exercises with images, muscles and equipment, for Body workouts. Files: `dist/exercises.json`, `schema.json` |
| Mood statistics | [mrzmyr/pixy-mood-tracker-app](https://github.com/mrzmyr/pixy-mood-tracker-app) | 🟢 MIT | Expo app: mood with tags, averages, peaks and highlight cards, for Pulse. Files: `src/features/statistics/mood-avg.ts`, `src/features/statistics/mood-peaks.ts`, `src/app/(app)/statistics/highlights.tsx` |
| Thought records | [arktnld/cbt-llm-kit](https://github.com/arktnld/cbt-llm-kit) | 🟢 MIT | Data for a 12-step thought record, 13 thinking traps and 19 emotions. Wellbeing support only; keep clear of diagnosis. Files: `data/schema.json`, `data/questions.json` |

### 7.5 Money, home and admin
| Area | Repo | Licence | Take |
|---|---|---|---|
| UK tax and benefits rules | [PolicyEngine/policyengine-uk](https://github.com/PolicyEngine/policyengine-uk) | 🟡 AGPL-3.0 | Ideas only: rules stored by date with links to the law, for a "money you could be missing" check and rules by tax year. Their hosted API is an option that copies no code. Example: `policyengine_uk/parameters/gov/hmrc/income_tax/rates/uk.yaml` |
| Shared costs | [spliit-app/spliit](https://github.com/spliit-app/spliit) | 🟢 MIT | Balances and the fewest payments to settle up, with tests. Files: `src/lib/balances.ts`, `src/lib/balances.test.ts` |
| Bills that creep up | [polius/Wally](https://github.com/polius/Wally) | 🟢 MIT | Recurring bills with price rises flagged, a month-in-review recap, household split by income. Files: `api/routers/recurring_transactions.py`, `api/models/recurring_transactions.py` |
| Home admin | [ulsklyc/yuvomi](https://github.com/ulsklyc/yuvomi) | 🟢 MIT | Household modules: things you own with warranty and receipt, document expiry, pantry dates, birthdays, reminders. Files: `server/services/inventory-deadlines.js`, `public/utils/inventory-warranty.js`, `server/services/notifications.js` |
| Letters that file themselves | [clusterzx/paperless-ai](https://github.com/clusterzx/paperless-ai) | 🟢 MIT | AI titles, tags and files each document, then lets you ask questions across them |
| Finance app (Maybe's fork) | [we-promise/sure](https://github.com/we-promise/sure) | 🟡 AGPL-3.0 | Ideas only: the live fork of Maybe (net worth, accounts, budgets) |

### 7.6 Dates, people and learning
| Area | Repo | Licence | Take |
|---|---|---|---|
| Dates in plain words | [wanasit/chrono](https://github.com/wanasit/chrono) | 🟢 MIT | Parses "next Friday", "end of March" on the phone, for Talk filing and important dates. File: `src/locales/en/index.ts` |
| Repeating dates | [jkbrzt/rrule](https://github.com/jkbrzt/rrule) | 🟢 BSD-3-Clause | Standard repeat rules (RFC 5545) for bills, renewals and birthdays. Mature and quiet. File: `src/rrule.ts` |
| People who matter | [monicahq/monica](https://github.com/monicahq/monica) | 🟡 AGPL-3.0 | Ideas only: how you met, last contact, gifts, money owed, life events, reminders |
| Teach it back | [nagisanzenin/engram](https://github.com/nagisanzenin/engram) | 🟢 MIT | Free recall checked against the source, and curricula built from first principles. Files: `docs/03-architecture.md`, `pi/prompts/review.md` |

### 7.7 Phone building blocks
| Area | Repo | Licence | Take |
|---|---|---|---|
| Letter scanning | [WebsiteBeaver/react-native-document-scanner-plugin](https://github.com/WebsiteBeaver/react-native-document-scanner-plugin) | 🟢 MIT | Edge detection and perspective correction for Documents |
| Charts | [FormidableLabs/victory-native-xl](https://github.com/FormidableLabs/victory-native-xl) | 🟢 MIT | Skia charts sized to their container, which suits the "charts sit fully inside their box" rule. Alternative: `margelo/react-native-graph` (MIT) |

### Looked at, not pinned
- `letta-ai/letta` (Apache-2.0): now a landing page; the code moved to `letta-ai/letta-code`. The memory-blocks idea is noted in the sweep README.
- `bloodyhealth/drip` (GPL-3.0): GitHub mirror last updated 2022. Ideas only for transparent cycle maths.
- `andymatuschak/orbit` (mostly Apache-2.0): quiet since 2024. The idea of review prompts inside reading is noted.
- `mattpocock/evalite`: archived; use promptfoo.
- `mrousavy/react-native-vision-camera` now lives at `margelo/react-native-vision-camera` (same project).
