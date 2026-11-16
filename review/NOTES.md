# Track A — review notes

## Built
- All **220 unparked board entries**: **196 exact app routes** plus inline cards, overlays, parent states, platform previews and design-gallery references. `doitforme` remains parked and has no route.
- All **42 component additions** are exported through `@/design` and demonstrated in `/design`, including LifeOrb v6 and all five puzzle kinds.
- **Full Fenny Drawing Kit:** all **30 devices and 208 objects** ported from the owner’s code at `fc32865ed16f` into `src/learn/scene`; clean/hand-drawn, build-in, slider changes and Reduce Motion. Skia runs on the UI thread. The quick lesson keeps its separate simple pictures.
- Local seed state, persistence and navigation are wired. Existing tax, income, housing, level, score and health-target calculations use `packages/core`; no engine logic changed.

## Evidence
- **214 entries are `[x]` for the reviewed Track A UI; six native platform targets remain `[~]` with individual reasons on their checklist rows.** This does not claim real integrations or device-performance testing.
- Every chapter passed `npx tsc --noEmit -p .`; the completed fidelity pass also typechecks.
- Local Expo preview: **196/196 routes rendered in dark and 196/196 in light**, at **393 × 852**, with **zero captured runtime errors**, **zero horizontal page overflows**, and 393pt-wide screen roots. Dark roots used `#08090A`/`#141517`; light roots used `#F7F7F8`/`#FFFFFF`.
- The full drawing gallery rendered **30/30 devices in dark/clean and 30/30 in light/hand-drawn**, with no drawing warnings or errors. All 208 objects are selectable in the gallery.
- Manual rendered checks against the board corrected: fixed headers and 44pt targets; Today’s root title/greeting and single-line metrics; 20/26 lesson headings; boxed tax-code picture and guess chips; tell-back dialogue; photo-sheet chrome; cover sizing/scrims/paper buttons; image settle/drift; card shadows; rounded flow diagrams; and Fuel’s default 1,240-left counter.
- Font and layout inspection confirmed Inter, the board’s 20pt gutters, 120pt Fuel ring, 20/26 lesson headings, and 13/18 single-line Today metric labels. Hand-drawn switching uses the real Skia canvas, not an SVG placeholder.
- `react-native-web@0.21.4` and `@shopify/react-native-skia@2.14.0` were installed only after explicit approval, pinned exactly, with lifecycle scripts disabled. CanvasKit WASM is served from localhost, not a CDN.
- No unit tests, end-to-end tests, screenshot jobs, backend, real AI calls or real health/bank integrations were run. Native performance/accessibility testing remains Track B; no device FPS measurement is claimed.

## Local stubs / [~] reasons
- First open, Talk, scans, food recognition and teaching feedback: permission/auth/voice/OCR/AI boundaries return visible local samples. Nothing is recorded, uploaded or silently filed.
- Body/Fuel/experiments/personality: observations and unimplemented score/target/projection algorithms are clearly labelled seed previews. Local controls, portions, checkoffs, timers and saved state work; actual health ingestion/scoring and validated interpretation remain Track B.
- Banks, billing, connected services, downloads, memory retrieval and sync: local interface previews only. No credentials, charges, downloads or remote accounts are created. Typed DELETE resets local sample data only.
- `widgets`, `sharecard`, `watch`, `lockpush`, `androidwidget`, `siri`: their layouts are available in `/design`; native extension registration/delivery is not built in Track A.
- Parent states remain states of their existing routes, not invented screens: `emptytoday`, `loadingtoday`, `emptyplan`, `emptybody`, `connectfail`, `offline`, `permdenied`, `aidown`, `signedout` are selected by the corresponding `state` query and shown in `/design`.
- Money figures differ from illustrative board amounts where the existing engine has no matching rebate model; the app does not invent a confirmed entitlement. Tax, income and housing outputs stay engine-derived.

## Workflow
- Worked on the existing `master` branch as requested; chapter commits use `screens: <chapter>`. No new branch or remote server was created.
- The first closure was premature: it established route/build coverage, not rendered fidelity. The approval, full Skia port and dual-theme rendered review above close those identified gaps; platform and integration stubs remain explicit.
- Final iOS/Android exports after the fidelity pass: pending below.
