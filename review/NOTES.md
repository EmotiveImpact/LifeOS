# Track A — review notes

## Visual controls and iPhone build preparation
- The three named visual gaps are implemented: native drag/accessibility reordering updates and persists Today’s metrics; memory filters use category metadata that round-trips through SQLite; lab graphics use supplied report intervals, explicitly labelled illustrative examples, or an unknown-interval state without inventing clinical cutoffs. Optional bounds/units are validated when entered.
- `ReorderRow` and `LabRange` are exported in `@/design` and demonstrated in `/design`. Browser preview entry layouts no longer remain stuck hidden in backgrounded panes; iOS/Android spring/fade entry motion is unchanged.
- Observed at 393×852: dragging Readiness below Sleep updated both saved order and preview; People memory filter showed only Kofi; a supplied 50–125 nmol/L interval persisted and displayed on Vitamin D; dark range graphics and metric handles rendered without horizontal overflow. Screenshot: `review/fidelity/lab-ranges.dark.jpg`. Review-origin data was backed up/restored; main app data untouched.
- Mobile typecheck passed. Focused real-SQLite repository checks passed 16/16 with 109 assertions, including memory source/category round-trip. Latest JS exports passed: iOS3,306 modules at `/tmp/life-visual-finish-ios-1794832822`, Android3,305 modules at `/tmp/life-visual-finish-android-1794832822`, combined exit0. These do not establish a successful native Xcode compile.
- Native preparation completed: SDK-pinned `expo-dev-client@58.0.20`, generated iOS workspace with SQLCipher enabled, CocoaPods installation (127 pods), `ios:device` and development-server scripts. Native folders are reproducible/generated and ignored, not a new branch.
- Actual native compile FAILED before compilation with Xcode exit70: generic iOS destination was ineligible because Xcode reports iOS18.2 platform support not installed. Xcode16.2 is present and meets this RN package’s stated minimum16.1. No iPhone is currently detected, and disk free space is only about10.8GB. No large Apple platform download or unrelated file cleanup was attempted.
- To test natively: free enough disk space for the Apple platform and build, install missing iOS18.2 support in Xcode, connect/unlock/trust the iPhone, enable Developer Mode, and select an Apple signing team. Then run the prepared local development server and `npm run ios:device`. No App Store release or external backend is needed. SQLCipher runtime verification remains blocked until that build can run.
- UI-only testing is available in Safari on the same Wi-Fi via the Mac’s existing web preview. It does NOT test SQLCipher/native health/haptics.

## Parallel visual / local-data wave — first local slice implemented
- Explicit user request to run both tracks in parallel overrides the earlier sequencing gate; existing `master` and no-external-services constraints remain.
- Two disjoint visual workers corrected the owned screen compositions/navigation; main supplied shared image-height/progress/header APIs, vertical payday/equal-code pictures, flexible range bands and reference-specific health fixtures. This is progress, not full visual sign-off: the workers did not render every key in both themes.
- Track B local foundation: 22 domain tables, Drizzle migrations, area repositories, atomic outbox, user-scoped offline transport/cursors, legacy import, projection reconstruction, local export/delete. Native SQLCipher + SecureStore key initialization fails closed; there is no native plaintext fallback.
- Existing screen/store API now projects native SQLite data. Writes are serialized; migration removes the legacy plaintext copy only after read-back; deletion does not immediately autosave demo defaults. Web remains a separately labelled AsyncStorage preview adapter.
- Verified locally: combined mobile typecheck and diff check passed; real in-memory SQLite repository suite 16/16 tests, 107 assertions passed. iOS export 3,304 modules at `/tmp/life-local-wave-ios-1794829428`; Android 3,303 modules at `/tmp/life-local-wave-android-1794829428`; combined exit 0. Web appearance change persisted and survived reload.
- Native runtime limit: Xcode 16.2 is installed, but `simctl` lists no available devices. SQLCipher/key/migration code has NOT been exercised in a native development build. Do not treat JS exports or Bun SQLite checks as proof of native encryption.
- The named ordering/range/filter gaps are addressed in the follow-through above. Full dual-theme/native visual approval still requires review on the actual app; these changes alone do not establish it.
- No remote database, API/auth server, provider OAuth, real AI, billing, cloud build or deployment was started. This is the first local Track B foundation, not completed Track B or full Phase 1b acceptance.

## Follow-up UI wiring corrections
- Fixed all five reported findings: the Fuel age guard now covers every route (including FuelExtras), the routing hook is unconditional, diary rows select stable meal IDs, portion edits use the actual draft's nutrition snapshot, and new habits persist `autoComplete`.
- Local browser checks: opening “Earlier oats” with a later apple present selected `review-old`; barcode oat milk at 378g retained 181.44 kcal and 1.512g protein (scaled from 120 kcal/1g per 250g); the saved habit contained `autoComplete: true`; direct food search at age 17 rendered the no-numbers fallback. Review-only fixture was backed up and restored; main app state untouched.
- No new screens, libraries, engine changes, real integrations or automated test suites. Automatic completion remains a stored preference until the Track B health interface is connected.
- The prior source fingerprint in `RENDER_EVIDENCE.json` describes the earlier parity commit, not these subsequent corrections. Refreshed mobile typecheck and both exports passed: iOS 3,143 modules at `/tmp/life-track-a-fuel-fixes-ios`; Android 3,142 modules at `/tmp/life-track-a-fuel-fixes-android`; combined exit 0.

## Built
- 220 unparked board entries: 196 exact app routes plus inline cards, overlays, parent states, gallery references and platform previews. `doitforme` remains parked without a route.
- All 45 addition rows in `COMPONENTS.md` are exported through `@/design` and demonstrated in `/design`; the additional camera surface matches the board rather than using a story card.
- LifeOrb v6 and the full owner-authorised Fenny Skia port: 30 devices, 208 objects, clean/hand-drawn, build-in, changes and Reduce Motion. No imports from `vendor/`.
- Local seed state, persistence, native push/sheet/flow navigation and first-use consent entry/return paths. Legacy placeholder tab URLs redirect to the specified Plan routes; only the seed provider drives the new app.
- Existing core supplies tax, income, housing, life level/score and health-target calculations; `packages/core` is unchanged.

## Evidence and scope
- Each chapter typechecked. Final source also passed `npx tsc --noEmit -p .` and `git diff --check`.
- Earlier route/runtime coverage: 196/196 routes in dark and light at 393×852, and 30/30 drawing devices in dark/clean and light/hand-drawn. This historical pass alone was insufficient evidence of content parity.
- `BOARD_PARITY.json` records the follow-through: 29 corrected routes compared with screen-specific board content in both themes; no missing listed fields, no horizontal page overflow after the photo-clipping fix, and no captured JavaScript runtime errors. New-habit full-slot/two-slot states were also inspected.
- Specific rendered values include the £2,340.50 account strip, £290 cash plan, £23,480 net worth, core-derived £840 PAYE example, £50k structure comparison and £425k ten-year housing comparison. The £2,500 monthly payslip context is separate from freelance annual income.
- Camera/meal composition now uses full-frame capture, 74pt shutter, 150pt confirmation photo and 190pt result photo; Body has the compact daily checklist and 44pt two-column action grid. Working screens use the board’s single-colour radial/dot fields, not blur or mesh.
- Interactive checks: council-tax mission selection; both toolkit entry points; all 12 people and quiet memorial; microphone/camera primers; Devices consent/back stack; proposed vs confirmed records; actual meal logging; correct habit graduation and two available slots.
- A fresh read-only reviewer inspected the final patch. Important findings were fixed and exercised: wrong mission selection, missing toolkit links and hidden stored people. Meal-list/detail consistency and the duplicate Devices return were also corrected. The existing Dates selection callbacks now select their actual person; non-Kofi profiles do not inherit Kofi’s gift/history text.
- Browser automation emitted vibration-policy messages for synthetic clicks; these were not JavaScript crashes. Native haptic feel/FPS/full accessibility are not claimed from browser inspection.
- Final native export details are recorded in `RENDER_EVIDENCE.json` after reading both completed outputs. These are Hermes exports, not signed store builds.

## Local stubs / remaining [~]
- `widgets`, `sharecard`, `watch`, `lockpush`, `androidwidget`, `siri`: layouts exist in `/design`; native extension registration/delivery remains Track B. These remain six platform-preview limitations; additional visual follow-through is listed above.
- Auth, voice, OCR, AI, banks, billing, health/provider connections, downloads, memory retrieval and sync are local interface previews. No credentials, charges, remote accounts or real integrations were created. Audio is not recorded/uploaded; proposed facts are persisted only on explicit confirmation.
- Health/Fuel/experiment/personality scores and projections without an existing core model remain sample observations/previews. The strength view explicitly says the real forgiving model is Track B.
- Understanding is paged repository fixture metadata (64%/214 total with eight loaded example records), not the core’s different area-readiness metric. Local confirmation/question feedback updates that UI stub; real facts coverage/counting and complete remote exports remain Track B.
- Parent states stay on their existing routes via `state`: emptytoday, loadingtoday, emptyplan, emptybody, connectfail, offline, permdenied, aidown, signedout. No invented routes.

## Rulings and reference differences
- Ruling: work on existing `master`, no new branch — explicit owner instruction overrides the normal phase-branch rule.
- Ruling: no unit/E2E/screenshot jobs or test refactors — Track A light checks override the skills’ general testing workflow. Manual preview inspection is not a screenshot suite.
- Ruling: sum the displayed subscription line items — they total £91.95, with £31.98 unused, not the board’s inconsistent £86.40/£31.97. Forcing the headline would introduce wrong arithmetic.
- Ruling: retain core precision — the structure comparison gives £861 after fees from unrounded values (the board shows £860); life score is the actual core result, not a forced illustrative 72. NI quotes and the P800 example are explicitly not live HMRC verification.
- Ruling: reference phones depict different moments — initial household is one; confirming the sample Talk changes it to three. The standalone 705-kcal meal differs from the 642-kcal photo draft; actual logging and corresponding list/detail keep the same chosen total. Three active habits disable creation; graduation exposes the board’s two-slot state.
- Ruling: preserve listed navigation where the static phone omits its entrance — quiet existing-component rows retain access to Bigger decisions, comparison questions and the other specified destinations. All stored people remain accessible, not truncated to the five reference examples.
- Ruling: keep fit language accurate for the current 140g protein target — “a good part,” not “half,” for the 49g sample meal.
- Review boundaries accepted: real integrations/models and native performance are intentionally Track B, not unfinished attempts to call external services. Full visual/native performance is not established by a source-only review; its scope was correctness of the final patch.

## Workflow
- Chapter commits use `screens: <chapter>`; final corrections and evidence are committed on the existing branch. Nothing pushed or published.
- The unchanged v17 board is served at the local preview root and remains open with 221 phones. Only the separate review origin’s demo fixture was refreshed; the main app’s saved state was not reset.
- Approved pinned packages remain `react-native-web@0.21.4` and `@shopify/react-native-skia@2.14.0`, installed with lifecycle scripts disabled. CanvasKit WASM is local, not CDN-hosted.
- No real AI calls or screenshot jobs were started. Track B has now begun with the owner-authorized local foundation above; only its focused repository checks were run.
