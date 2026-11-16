# life — Implementation References

> **What this is:** the open-source code worth learning from, mapped to each part of life, with **exact files** and a **licence rule** for each.
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
| On-device AI (option) | [software-mansion/react-native-executorch](https://github.com/software-mansion/react-native-executorch) | ⚠️ check (not detected) | Alternative to llama.rn; confirm the licence before use |
| Local-first DB | [Nozbe/WatermelonDB](https://github.com/Nozbe/WatermelonDB) | MIT | Alternative to expo-sqlite for large health time series |
| Sync to Postgres (Neon) | [powersync-ja/powersync-js](https://github.com/powersync-ja/powersync-js) | Apache-2.0 | Only if our own push/pull sync gets hard: local-first SQLite ↔ Postgres (MASTER_PLAN §3.1) |
| Auth | [better-auth/better-auth](https://github.com/better-auth/better-auth) | MIT | Sign in with Apple, Google, email in our API, with Neon Postgres |
| Wearable aggregator (self-hosted) | [the-momentum/open-wearables](https://github.com/the-momentum/open-wearables) | MIT | One API for many wearables (Garmin, Polar, Suunto…) without paying Terra; evaluate for Phase 4b v2 |
| AI memory | [mem0ai/mem0](https://github.com/mem0ai/mem0) | Apache-2.0 | Patterns for long-term personal memory; map to FiledRecord (DESIGN §20) |
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
| Finance app | [maybe-finance/maybe](https://github.com/maybe-finance/maybe) | 🟡 AGPL-3.0 | Ideas only: net-worth timeline, account grouping |
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
