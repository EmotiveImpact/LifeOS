# life · Build plan from the V26 board to launch

> **For agentic workers:** this file is the job list. Work one phase at a time, on its own branch, and stop at each 🛑 gate for the owner's review. Inside a phase, use superpowers:executing-plans (or superpowers:subagent-driven-development for the bigger Track B phases). Steps use checkbox (`- [ ]`) syntax so progress is visible.
>
> **This file replaces the phase list in `BUILD_PLAN.md`** for everything still to do. `BUILD_PLAN.md`, `MASTER_PLAN.md`, `SPEC.md`, `SYSTEM_DESIGN.md`, `DESIGN.md` and `MOTION.md` stay the references for *how* things work. Where they disagree with this file or the V26 board on looks, the board wins (AGENTS.md).

**Goal:** ship **life** on iPhone and Android, with every screen matching the V26 board, backed by a real database, accounts and sync, and a real brain.

**Architecture:** the phone is the source of truth (SQLite + an outbox, already built). The server (`apps/api`) does accounts, sync, AI, wearable OAuth and anything with a secret, on Neon Postgres. Every number comes from `packages/core`; the brain (`packages/brain`) only explains, files and drafts, and its answers are schema-checked.

**Tech stack:** Expo SDK 58, expo-router, Reanimated 4, Skia, Drizzle (SQLite on the phone, Postgres on the server), Neon, Better Auth, zod, Bun for local API runs and tests.

**Visual target:** `review/v26/board.html` (one file; open it in any browser). Find a screen by its key: `review/v26/board.html?only=<key>&bare=1&noanim=1`, and its source with `grep -n "K.screen('<key>'" review/v26/screens/*.js`.

---

## 0. Where things stand (20 Nov 2026)

| Area | State |
|---|---|
| **Board** | V26: all 221 catalogue screens redesigned, plus 8 new ideas (`x-…`). Rule checker passes: `node review/v26/tools/check.mjs`. Only 6 screens carry the owner's mark so far (welcome, question, measuresetup approved; today, firstmove, nudge "needs work", the last two since redone). |
| **App screens** | About 230 screens exist in `apps/mobile/src/app` and `src/screens`, built to the **V23** look and shipped as TestFlight build 22 (`SCREENS.md`: 215 `[x]`, 6 `[~]` platform previews). They need restyling to V26, not building from nothing. |
| **Design system** | `apps/mobile/src/design`: tokens, `Text`, `Press`, `feedback`, `TopBar`, `LifeOrb` v6 and about 107 components, all in the `/design` gallery. V26 needs the additions in Phase 13. |
| **Phone data** | Done: `src/data/schema.ts` (21 tables per SYSTEM_DESIGN §4), migrations, repositories, an outbox (`OutboxOp`) and a `SyncTransport` interface with `push` and `pull`. No server to talk to yet. |
| **Engine** | `packages/core/src/data/*`: finance, housing, health, growth, onboarding, weekly recap, `lifeosEngine`. Health scores (readiness against your normal, sleep need and debt, load band) are not real calculations yet. |
| **Brain** | `packages/brain/src/*`: request/response types, safety routing (self-harm language goes to support, never a model), careful statement extraction, lexical memory lookup, lesson and teach-back shapes, output validation with `{{fact:id}}` placeholders. Tests: `tests/brain/runtime.test.ts`, `state.test.ts`. No real model connected. |
| **API** | Only a local harness, **not committed** (`apps/api/`, `tests/brain/api.test.ts` stay on the owner's machine). A cloud session starts without it, so Phase 21 builds the API in `apps/api` from this plan. If the owner commits the harness first, build on it instead. |
| **Tooling** | `.github/workflows/ios-testflight.yml` (manual TestFlight build). No `tools/evals` yet. |

### Decisions the owner still has to make (ask; don't guess)
Each is tagged with the phase it blocks. Until answered, build the board as it stands and note the open point in that phase's `NOTES.md`.

1. **The 8 new-idea screens** (`x-cleared`, `x-timetoday`, `x-howitworks`, `x-aimfeel`, `x-pic-ideas`, `x-pic-fuel`, `x-pic-welcome`, `x-pic-orb`): keep or drop. Kept ones get a row in `SCREENS.md`. *(Blocks: building those 8 only.)*
2. **Numbers that disagree on the board:** today's load 11.4 (Body) vs 6.2 (target load); rent £950 (Budget) vs £1,150 (Money ledger); calories eaten 1,420 (Fuel) vs 1,060 (Fuel home, quick log); next bill in 16 days vs 15 (Today); Rent vs buy open in the toolkit but locked to level 3 on its own page; Lifetime ISA state across area, gambit and glimpse; onboarding step counts. *(Blocks: nothing in Track A, because seed data decides; must be settled before Phase 26 wires real numbers.)*
3. **life Plus price:** £48 a year on the board, £59.99 on the old board. *(Phase 19.)*
4. **Body, revisit:** the owner accepted Body "for now" and asked to be reminded. The 60–70 readiness normal range is a placeholder until the engine computes it; decide whether the Readiness screen uses the same band chart. *(Phase 16.)*
5. **API host:** Vercel functions (default), Cloudflare Workers or a small server (Fly). *(Phase 21.)*
6. **Accounts:** Better Auth (default) or Neon Auth, after a one-day spike. *(Phase 21.)*
7. **Model providers and keys** to test in evals (for example Anthropic, OpenAI, Google), stored only in the API's environment. *(Phase 24.)*
8. **Accounts only the owner can create:** Neon, Expo/EAS, Apple Developer, Google Play Console, WHOOP and Oura developer apps, Sentry. *(Phases 21, 26, 30.)*

---

## Global constraints (every phase)

Copied from AGENTS.md and the V26 decisions. A phase that breaks one of these doesn't pass its gate.

- **One phase per branch**, named below, branched from the last approved phase (the first from `phase-12-v25-best-of`, which holds the V26 board). Never commit to `main` or `master`.
- **Design system only:** import from `@/design`. No raw hex, no new font sizes, no new spacing scales. Missing piece → add it to `src/design/components/`, show it in `/design`, then use it.
- **Numbers come from `packages/core`.** Never hard-code a £ figure, score or target in a screen. Don't change engine logic in Track A.
- **No glass, no blur, no mesh gradients.** No borders or dividers, ever: separate by fill and spacing; cards get `cardShadow`. Only state indicators (current step, today) draw lines.
- **The top bar never moves.** `TopBar` (`root | push | sheet | flow`) outside the ScrollView, chosen by how the screen opens.
- **One orb family:** `LifeOrb` v6 (`ring | thinking | working | searching | listening | done`). Nothing else may look like the orb (this is why Body's readiness is not a ring of dots).
- **Inter only, the `Text` variants only.** One signal colour (ember) for the one thing that matters; one primary button per screen.
- **V26 lessons from the owner:**
  - Picture-forward in our own colours: real things on screen (meals, areas, people, documents, moods) get photographs.
  - **No panel over a photograph,** see-through or solid. A full-screen moment uses the Welcome treatment: photograph edge to edge with the soft fade, big words low and left, one round arrow, a dash pager.
  - The feeling check is never a swipe card. It rises as a drawer over Today and waits as one small card when closed. Today's moves are the swipe cards, and they come after it.
  - Talk always shows the live filing (words arrive, recognised phrases light up and drop into area tiles), not just a summary.
  - Food sits below the recovery numbers on Body, not in between them.
- **Motion** via springs from `tokens.motion`, haptics and sound only via `feedback.*`, Reduce Motion respected (`useCalmMotion`).
- **Both platforms, every phase:** iOS and Android must both bundle.
- **Licences:** 🟢 MIT/Apache with a notice in `THIRD_PARTY_NOTICES.md`; 🟡 GPL/AGPL ideas only; 🔴 don't touch. Never import from `vendor/`; port it. New libraries: only ones in `IMPLEMENTATION_REFERENCES.md` / `vendor/REFERENCES.lock.md`, or named in this plan, pinned to an exact version.
- **Health is wellness, not diagnosis. Money is guidance, not advice.** Copy rules: DESIGN §10, §31.
- **Secrets never in the app.** **Never read a WHOOP strap over Bluetooth.**

### Checks
**Track A phases (13–20)** stay light on purpose (AGENTS.md):
```bash
cd apps/mobile && npx tsc --noEmit -p .
```
after each chapter, and both bundles at each gate:
```bash
cd apps/mobile
npx expo export --platform ios --output-dir /tmp/life-ios && rm -rf /tmp/life-ios
npx expo export --platform android --output-dir /tmp/life-android && rm -rf /tmp/life-android
```
No new unit tests, end-to-end tests or test refactors in Track A.

**Track B phases (21 on)** are test-first: write the failing test, watch it fail, write the code, watch it pass, commit. Existing tests must stay green: `bun test tests/`.

### Every gate (🛑)
1. Checks above pass. 2. Light and dark screenshots of every screen touched, named by board key (`today.dark.png`), in `review/phase-N/`. In a cloud session without a simulator, capture them from a web export (`npx expo export --platform web`, served locally, 390×844) and say so in the notes; if a screen can't render on web, list it. 3. `review/phase-N/NOTES.md`: what was built, what's stubbed, every difference from the board and why, open owner decisions. 4. Tick rows in `SCREENS.md`. 5. Commit, push the branch, then **stop** and say "Phase N ready for review."

---

## Review focus (most likely to bite a real person)

These are the inputs and conditions no single phase owns. Each line names the phase whose checks cover it.

1. **Long names and big text:** a long first name, a long mission title or Dynamic Type at 1.3× must truncate or wrap without overlapping the fixed top bar or the dock. *(Every Track A gate: screenshot Today, Plan, You and one sheet at 1.3×.)*
2. **First run with nothing:** no health data, no device, no money facts. Every screen that shows numbers needs its empty state from the board (`emptytoday`, `emptyplan`, `emptybody`), never a 0 dressed up as a reading. *(Phase 20 builds them; Phase 26 must keep them when real data is missing.)*
3. **Offline and AI down:** filing, asking and lessons queue with the board's "will answer when back" state, and nothing is lost when the app closes mid-request. *(Phase 25 test: `queues an extract request offline and sends it once on reconnect`.)*
4. **Two phones, one person:** the same row edited on two devices, and a delete on one while the other edits. Last write wins by `updated_at`, deletes are tombstones, and nothing duplicates. *(Phase 22 tests.)*
5. **Distress in Talk or chat:** self-harm language always routes to support without a model call, in every channel (typed, spoken, lesson tell-back). *(Existing tests in `tests/brain/runtime.test.ts`; Phase 24 adds the same check for voice transcripts.)*

---

# Track A · Every screen to the V26 board (Phases 13–20)

**How a screen gets restyled:** open its key in the board, read its source in `review/v26/screens/*.js`, find its route in `SCREENS.md`, then rebuild that route from `@/design` components. Copy, numbers and photographs match the board; seed data comes from `apps/mobile/src/state/seed.ts` (extend it to match the board's copy). Keep the existing route, navigation and state wiring; replace the layout. When the board's markup uses an inline style, the matching value is already a token (the board's `v26.css` mirrors `tokens.ts`).

| V26 source file | Chapters it holds |
|---|---|
| `screens/core.js` | 20 key screens: today, plan, you, talk, mission, cashplan, search, body, readiness, mealresult, strength, teachplay, understood, welcome, question, plus, and 4 new ideas |
| `screens/first-open.js` | First open, the orb and motion |
| `screens/states-outside.js` | States, outside the app |
| `screens/today-plan-you.js` | The rest of Tab 1 Today, Tab 2 Plan, Tab 3 You |
| `screens/talk-toolkit.js` | Talk and file, the toolkit |
| `screens/money-docs-aim.js` | Money, documents and renewals, your Chief Aim |
| `screens/body-a.js`, `body-b.js` | Body (35) and habits |
| `screens/fuel.js` | Plan · Body · Fuel |
| `screens/learn-teach-grow.js` | Learn, Teach me, Grow |
| `screens/settings-people.js` | Know yourself, people and dates, settings and account |
| `screens/picture.js` | 4 picture-forward new ideas |

## Phase 13 · The V26 design system
**Branch:** `phase-13-v26-design-system` · **Then** 🛑 Gate 13 (the owner reviews `/design`).

Build every V26 piece into `@/design` and show each in `/design` with its states, light and dark, before any screen uses it. The board's `review/v26/kit.js` is the reference implementation of each piece (HTML); port the look and behaviour, not the code.

**Files:**
- Modify: `apps/mobile/src/design/tokens.ts` (type `display`; area tints; photo values), `apps/mobile/src/design/index.ts` (exports), `apps/mobile/src/design/TrackAGallery.tsx` or a new `V26Gallery.tsx` linked from `src/app/design.tsx`
- Create or extend, in `apps/mobile/src/design/components/`: the files named in the table
- Modify: `COMPONENTS.md` (add a "V26 additions" section, one row per piece)

**Tokens to add** (values copied from `review/v26/v26.css`, which mirrors the current tokens):
- `type.display`: Inter Medium 34/39, letter spacing −1.1; bold spans use ink, the rest ink2 (the two-tone briefing).
- Area tints `tint.{you,home,work,money,health,goal}` for light and dark, as the board's `--t-*` values.
- `photo.fill`, `photo.onPhoto`, `photo.onPhoto2` (the board's `--photo-fill`, `--on-photo`, `--on-photo2`), and the two scrims (`fade`: the Welcome fade; `card`: the photo-card fade).

**Kit helper → design system component:**

| Board helper (`kit.js`) | Component in `@/design` | Exists? | What changes |
|---|---|---|---|
| `status`, `rootBar`, `pushBar`, `textBar`, `sheetBar` | `TopBar` | yes | Root bar: orb + title + date, round icon buttons on the right |
| `round` | `RoundButton` | new | 40 pt circle on surface2, optional ember dot, `sm` 32 pt |
| `dock` | `Dock` | extend | **Floating pill** resting on the canvas, current tab named (board wins over the earlier full-width dock) |
| `btn`, `foot` | `Button`, `Footer` | extend | One primary, ghost and small variants; footer pinned above the safe area |
| `secHead` | `SectionHead` | new | 16/21 title with an optional link on the right |
| `chip` | `StatusPill` | extend | Tones `q` (quiet) and `live`; `onPhoto` variant on photo fill |
| `orb`, `says` | `LifeOrb`, `LifeSays` | `LifeOrb` yes | `LifeSays`: eyebrow with the orb, "life · just now" |
| `ruler` | `Ticks` | yes | Restyle to the board's ruler |
| `row`, `thumbRow`, `dateRow`, `kv`, `check`, `pick` | `ListRow`, `DateRow`, `Checklist`, `ChoiceCard` | yes | Round icon well, photo thumb variant, no dividers |
| `acc` | `Accordion` | new | Sections that open one at a time with a round plus/minus |
| `tile`, `metric` | `MetricTile` | extend | Calm white tile: label with area dot, unit, big figure, meaning, a week chart, one note |
| `days14`, `dots`, `month` | `DotStrip`, `DotGrid` | new | Counted days in the orb's chunky dots |
| `bars`, `spark`, `caps` | `MiniBars` | extend | Width-aware bars with today solid; capsule pairs for money in and out |
| `line` | `TrendLine` | extend | Band for "your normal", today's dot, width-aware |
| — (Body) | `NormalBandChart` | new | Readiness against your own normal: shaded band, a dot per day, today largest and labelled (Body, Readiness) |
| — (Body) | `Hypnogram` | extend | Last night as four tracks (awake, REM, light, deep) on surface2 rails, with a totals key |
| `scale` | `BecomingScale` | new | NO to YES line for "who you're becoming" (You, Morning walk) |
| `toggle`, `slider`, `stepper`, `seg`, `filters`, `wheel`, `field` | `Toggle`, `Slider`, `CountStepper`, `Segmented`, `ChipGroup`, `WheelPicker`, `Field` | most yes | Restyle; `WheelPicker` and `Field` new |
| `avatar`, `bubble`, `voice`, `wave` | `PersonAvatar`, `UserBubble`/`LifeReply`, `BigMic`, `Waveform` | yes | Restyle to the board |
| `.pcard`, `.pgrid` (CSS) | `PhotoCard`, `PhotoGrid` | new | Photograph card with a top line of chips and copy low on the card fade; grid of two |
| `.full-photo` + Welcome | `FullPhotoScreen` | new | The Welcome treatment, for every full-screen moment |
| `.deck`, `.decide` | `MoveDeck` | extend `PeekStack` | Today's moves: one card in front, two resting behind; tick takes it on, cross leaves it; swipe with the same result |
| `.drawer` | `DecisionDrawer` | new | Dark drawer that asks one thing (leave it, ask, file) |
| `.sheet` | `Sheet` | yes | Restyle: handle, 28 pt top radius |
| `feel`, `feelMount`, `MOODS`, `moodAt` | `FeelField`, `FeelingDrawer` | replaces `PulseField` look | Photograph under an 11-column dot field; drag the orb handle; six moods (calm, driven, restless, anxious, drained, peaceful) from `moodAt(x, y)`; the word, line and photo change as you move; haptic tick on mood change; Reduce Motion: no lean, instant swaps |
| `.tl` (CSS) | `ActivityTimeline` | yes | Dot spine (no line), done/now/later states |
| `.tint` (CSS) | `TintCard` | new | Soft area colour for chart cards where the board uses it (not on Body) |

- [ ] Add the tokens; typecheck.
- [ ] Build each new component and extend each existing one in the table; add each to the gallery with every state.
- [ ] `FeelField`: port `moodAt` exactly from `kit.js` so the board and app pick the same mood for the same point; gesture with Gesture Handler, motion with Reanimated springs.
- [ ] Update `COMPONENTS.md`.
- [ ] Checks, screenshots of the gallery, `review/phase-13/NOTES.md`, commit, push, 🛑 stop.

## Phase 14 · Today and Talk (21 screens) — the pattern
**Branch:** `phase-14-v26-today-talk` · **Rows:** `SCREENS.md` "Tab 1 · Today" (13) and "Talk and file" (8). **Source:** `core.js` (today, talk, plus, understood), `today-plan-you.js`, `talk-toolkit.js`.

This phase sets the pattern every later chapter copies, so it gets the most care.

- [ ] **Today** (`today`): two-tone briefing in `display` with inline icons; the feeling check rises as a `FeelingDrawer` on the first open of the day (state `''`), waits as one small card when closed ("How are you arriving? · Check in" / "Arriving calm · Change"); after setting the pace, today's moves arrive as a `MoveDeck` (tick/cross), then "Your day · N moves" with the first move ready. Move order follows the mood, as `moveOrder()` in `core.js` does, through a function in `packages/core` or `src/state` (not in the screen).
- [ ] **Talk** (`talk`): the live state plays: words arrive about every 850 ms, recognised phrases light up and bump their area tile (You, Home, Work, Money, Health, Goals), then one `DecisionDrawer` asks to file. Review and filed states as on the board. Stub the transcript stream behind `voice.ts`.
- [ ] The rest of both chapters, row by row.
- [ ] Checks, screenshots (include Today in all three states and Talk mid-filing), notes, tick rows, commit, push, 🛑 stop.

## Phase 15 · Plan, Money, Documents, Chief Aim, Toolkit (39 screens)
**Branch:** `phase-15-v26-plan` · **Rows:** "Tab 2 · Plan" (11), "Your Chief Aim" (4), "Plan · Money" (8), "Plan · Documents and renewals" (3), "The toolkit" (13). **Source:** `core.js` (plan, mission, cashplan, search), `today-plan-you.js`, `money-docs-aim.js`, `talk-toolkit.js`.

- [ ] **Plan** (`plan`): the Chief Aim as one `PhotoCard` with progress on it; "Your areas" as a `PhotoGrid` of four (Home, Money, Health, Work, each saying what's ready); then `Accordion` sections (ready, situations, waiting, tools). No filter chips. The owner liked this design.
- [ ] Every other row in the five chapters.
- [ ] Gate as above.

## Phase 16 · Body and Habits (38 screens)
**Branch:** `phase-16-v26-body` · **Rows:** "Body" (35), "Plan · Body · Habits" (3). **Source:** `core.js` (body, readiness, strength), `body-a.js`, `body-b.js`.

- [ ] **Body** (`body`), in this order: briefing; readiness as `NormalBandChart` in a card (big figure, "Above your normal", the week against the shaded band); Sleep, Load and Stress as three slim `MetricTile`s in one row; "Last night" `Hypnogram`; "Why you're recovered" (HRV 58 ms, resting heart rate 54 bpm, matching `readiness`); Fuel as a `PhotoCard` below the recovery numbers; Tonight; one pattern life noticed; habits with `DotStrip`. **Remind the owner** that Body was accepted "for now" (decision 4) when this phase starts.
- [ ] Every other row; Readiness uses the same normal-band language as Body.
- [ ] Gate as above.

## Phase 17 · Fuel (28 screens)
**Branch:** `phase-17-v26-fuel` · **Rows:** "Plan · Body · Fuel" (28). **Source:** `core.js` (mealresult), `fuel.js`.

- [ ] Meals and food as photographs everywhere the board shows them; camera surfaces (`snap`, `barcode`, `labelscan`) on `CameraViewport` with the board's on-photo chips.
- [ ] Every row. Gate as above.

## Phase 18 · Learn and Teach me (21 screens)
**Branch:** `phase-18-v26-learn` · **Rows:** "Learn from the best" (10), "Teach me" (11). **Source:** `core.js` (teachplay), `learn-teach-grow.js`.

- [ ] Ideas as picture cards (the first one tall), lesson screens with `LessonBar`, `LessonPicture`, `GuessReveal`, `LessonPuzzle`, `RecapList`, `TellBack`, `GapCard`, restyled to the board. "You've got it" uses the bouncy spring and its sound.
- [ ] Every row. Gate as above.

## Phase 19 · You, Know yourself, People, Settings, Grow (39 screens)
**Branch:** `phase-19-v26-you` · **Rows:** "Tab 3 · You" (10), "You · Know yourself" (6), "You · People and dates" (5), "You · Settings and account" (14), "Grow" (4). **Source:** `core.js` (you), `today-plan-you.js`, `settings-people.js`, `learn-teach-grow.js`.

- [ ] Level as a big figure, your areas, `BecomingScale` ("who you're becoming"), streak in `DotStrip`.
- [ ] life Plus: price per decision 3 (board shows £48 a year); benefits list "your routines", not the parked "Do it for me".
- [ ] Every row. Gate as above.

## Phase 20 · First open, States, Outside the app, the orb (35 screens) — Track A closes
**Branch:** `phase-20-v26-first-open-states` · **Rows:** "First open" (14), "States" (12), "Outside the app" (6), "The orb and motion" (3). **Source:** `core.js` (welcome, question), `first-open.js`, `states-outside.js`.

- [ ] **Welcome** (approved), **First move** and every full-screen moment on `FullPhotoScreen`. First move: the payslip photograph edge to edge, "Start with two minutes.", one button.
- [ ] Empty, loading, offline and error states exactly as the board; widgets, watch, lock screen and Siri stay UI previews (native targets in Phase 29).
- [ ] Kept new-idea screens (decision 1), if any, with `SCREENS.md` rows added.
- [ ] **Track A close:** the whole app walks end to end along every "Opens as / From"; Dynamic Type 1.3× on Today, Plan, You and one sheet; Reduce Motion falls back to fades; both bundles pass.
- [ ] Gate as above, then 🛑 **Track A review**: the owner walks the app (TestFlight via the existing workflow, if they want a build) before Track B starts.

---

# Track B · Make it real (Phases 21–31)

Track B is test-first. Each phase lists its tests by name and what they must assert; write each test before its code.

## Phase 21 · API, Neon and accounts
**Branch:** `phase-21-api-auth` · **Needs:** decisions 5, 6, 8 (Neon project and a branch per phase; the host).

**Files:**
- Create: `apps/api/package.json`, `apps/api/src/app.ts` (a Web-standard `fetch(request): Promise<Response>` handler, so it runs on Bun locally and on the chosen host), `apps/api/src/server.ts` (local Bun server), `apps/api/src/env.ts` (validated with zod; fails fast on missing secrets), `apps/api/src/auth.ts`, `apps/api/src/db/schema.ts`, `apps/api/src/db/client.ts`, `apps/api/drizzle/` (migrations), `apps/api/.env.example`
- Libraries (pin exact versions; add to `vendor/REFERENCES.lock.md`): `better-auth`, `zod`, `drizzle-orm` (already used on the phone), `drizzle-kit`, `@neondatabase/serverless`
- Test: `tests/api/auth.test.ts`, `tests/api/schema.test.ts`

**Interfaces produced:**
- `createApi(options: { db: Db; auth: Auth; now?: () => number }): (request: Request) => Promise<Response>`
- `getPrincipal(request: Request): Promise<{ userId: string } | null>` — identity only from the session, never from a request body.
- Server tables: every phone table in `apps/mobile/src/data/schema.ts` mirrored in Postgres (same names and columns, `user_id` on every row, `deleted_at` tombstones), plus `users`, `devices`, `sync_ops`, `oauth_tokens` (encrypted), `lesson_cache`, `scene_cache`, `ai_usage`, `memory` (pgvector, Phase 25).
- Row-level security on every user table: `user_id = current_setting('app.user_id')`, set per request inside the transaction.

- [ ] Tests first: `GET /health returns ok without auth`; `every other route returns 401 without a session`; `a session from Apple, Google or email sign-in resolves to one userId`; `a request body carrying user_id is ignored`; `row-level security hides another user's rows even with a forged query`; `schema.test: every phone table has a server table with the same columns`.
- [ ] Implement until green. Neon branch `phase-21`. Phone: `signin` sheet calls the real sign-in; tokens in SecureStore.
- [ ] `review/phase-21/NOTES.md`, commit, push, 🛑 stop.

## Phase 22 · Sync
**Branch:** `phase-22-sync`

**Interfaces:**
- Consumes: phone `SyncTransport` (`push(userId, operations: OutboxOp[]) → { acknowledged: string[] }`, `pull(userId, cursor) → { changes: RemoteChange[]; cursor }`), `OutboxOp` from `apps/mobile/src/data/store.ts`.
- Produces: `POST /sync/push` (body `{ operations: OutboxOp[] }`), `GET /sync/pull?cursor=` (returns changes after the cursor, excluding the caller's own device's ops), and `apps/mobile/src/data/httpTransport.ts` implementing `SyncTransport`.
- Rules: push is idempotent by op `id`; per row, the newer `updated_at` wins; deletes are tombstones that also win over older upserts; the cursor is an opaque, monotonic server sequence.

- [ ] Tests first (`tests/api/sync.test.ts`, `tests/data/sync.test.ts` on in-memory SQLite): `pushing the same op twice stores it once`; `pull returns ops after the cursor and not the caller's own`; `two devices edit one row: newer updated_at wins on both`; `a delete on one device beats an older edit on the other`; `an op for another user's row is rejected`; `the outbox drains only after acknowledgement`; `sync resumes after a dropped connection without duplicates`.
- [ ] Implement; background sync on app foreground and after each write batch.
- [ ] Gate.

## Phase 23 · Files, push and your data
**Branch:** `phase-23-files-push-account`

- [ ] `POST /files/sign` (short-lived upload and read URLs; object storage per MASTER_PLAN §3.1; meal photos and letters deleted after reading unless kept), `POST /push/register`, `GET /account/export` (everything, as JSON), `POST /account/delete` (hard delete, all tables and files).
- [ ] Tests first: `signed URLs expire`; `a user can't sign another user's file`; `export contains every table's rows for that user only`; `delete removes rows, files and memories, and the session ends`.
- [ ] Wire Settings → export and delete. Gate.

## Phase 24 · The brain: router, models and evals
**Branch:** `phase-24-brain-router` · **Needs:** decision 7.

**Files:**
- Modify: `packages/brain/src/runtime.ts`, `types.ts` (add tier routing; keep every existing rule)
- Create: `apps/api/src/models/` (one adapter per provider, each implementing the existing `ModelAdapter`: `{ id, location, jobs, available(), generate(request, signal) }`), `apps/api/src/router.ts`, `apps/api/src/tiers.json` (job → model, written by evals), `POST /ai/run`, `GET /ai/capabilities`
- Create: `tools/evals/<job>/cases.jsonl` (30–50 real examples with the right answer, per job), `tools/evals/run.ts` (scores quality, cost and latency per model; writes the winners to `tiers.json`)
- Test: `tests/brain/router.test.ts`, `tests/api/ai.test.ts`

**Rules kept from the existing brain (tests already cover some):** private mode never leaves the phone; remote calls need consent naming the model's location; self-harm language routes to support without a model; outputs are schema-checked and numbers appear only as `{{fact:id}}` placeholders filled from engine facts; per-user rate limits and an AI cost ledger (`ai_usage`), durable, not in memory.

- [ ] Tests first: `a job routes to its tier's model from tiers.json`; `private mode returns PRIVATE_MODE and calls no model`; `missing consent returns CONSENT_REQUIRED`; `an answer containing a raw £ figure not from facts is rejected`; `a timed-out model leaves nothing changed`; `usage is recorded per user and job`; `a voice transcript with self-harm language routes to support`.
- [ ] Adapters for the providers chosen; evals for `extract` and `ask` first; tiers picked by evals, not by preference.
- [ ] Gate (include the eval table in the notes).

## Phase 25 · The brain's jobs and memory
**Branch:** `phase-25-brain-jobs`

| Job | Tier | Where it's used | Output (schema in `packages/brain/src/types.ts`) |
|---|---|---|---|
| `extract` | fast | Talk, chat: file what you said | proposed records with the quoted evidence; nothing saved until confirmed |
| `ask` | strong | Ask, chat | answer with citations to facts and records |
| `draft` | strong | Missions | letters, emails, forms, editable |
| `coach`, `plan-explain` | strong | Body coach, "Why am I seeing this?" | explanation of engine reasons, never new numbers |
| `lesson`, `analyse`, `showMe` | strong | Teach me | the Feynman lesson shape (MASTER_PLAN §3.5), teach-back gaps |
| `food` | vision | Snap a meal | items with confidence, for the user to confirm |

- [ ] Memory (mem0-style, open source, self-hosted on Neon pgvector, MASTER_PLAN §3.3c): add from confirmed conversations, search per reply, list, edit and delete from "What life remembers"; one space per user; on-device embeddings in private mode.
- [ ] Offline queue on the phone: AI requests wait with the board's state and send once on reconnect.
- [ ] Tests first, per job: `extract never saves without confirmation`; `ask cites only supplied sources`; `lesson matches the lesson schema`; `food items carry confidence`; `memory search returns only this user's memories`; `a deleted memory is never used again`; `queues an extract request offline and sends it once on reconnect`.
- [ ] Wire Talk, chat, Ask, missions, Teach me and Snap to the real jobs. Gate.

## Phase 26 · Real health data and real Body numbers
**Branch:** `phase-26-health` · **Needs:** decision 2 settled; WHOOP/Oura developer apps (decision 8).

- [ ] Ingest from Apple Health (`@kingstinct/react-native-healthkit`) and Health Connect (`react-native-health-connect`) since the last anchor; arbitration picks one source per metric; daily summaries and 28/60-day baselines.
- [ ] Engine (`packages/core`, new `health/*`, test-first): readiness against your normal (this replaces Body's placeholder 60–70 band), sleep need and debt, load and its target band, stress, illness signal, regularity. Port logic only from MIT references (Atria) with notices.
- [ ] WHOOP and Oura through their official OAuth APIs in the API, never Bluetooth.
- [ ] Empty states stay when data is missing. Gate.

## Phase 27 · Food, camera and barcode
**Branch:** `phase-27-food` — photo logging through the `food` job, barcode and label lookup (Open Food Facts), targets from `food_target` and the body profile, fit score and tips. Tests first for target maths in `packages/core`. Gate.

## Phase 28 · Voice
**Branch:** `phase-28-voice` — `voice.ts`: on-device speech to text first (OS recogniser, whisper.rn fallback), Phonon for life's voice on iPhone (port from `vendor/fenny/voice/`), Kitten TTS Nano elsewhere; Talk's live filing on real speech. Gate.

## Phase 29 · The day engine, notifications and the outside of the app
**Branch:** `phase-29-day-engine` — `planToday()` as rules plus scores, then a contextual bandit (Thompson sampling) that learns which moves this person does, with reasons stored for "Why am I seeing this?"; background tasks (health, sync, morning plan, evening wrap, recall, renewals, birthdays); local notifications (one a day at most, quiet hours 21:00–08:00); calendar awareness (read only); widgets, Live Activity, watch and Siri targets. Tests first for the planner and the notification cap. Gate.

## Phase 30 · Quality
**Branch:** `phase-30-quality` — Maestro flows (onboarding, Talk → file, snap a meal, a lesson, sync on two devices), repository tests, the full MOTION.md pass, VoiceOver and TalkBack labels, Dynamic Type, Android pass (back gesture, edge to edge), performance (virtualised lists, sized images, 60 fps), Sentry, privacy-preserving analytics (north star: moves completed per week). Gate.

## Phase 31 · Beta and launch
**Branch:** `phase-31-launch` — TestFlight and Play internal testing with 20–50 people, a fix list, store listings and screenshots from the board, privacy labels, health and money review notes, privacy policy, terms and a DPIA (health is special-category data under UK GDPR), support page. 🛑 **Launch review** with the owner.

---

## Self-review (done when this plan was written)
- **Coverage:** every chapter in `SCREENS.md` (221 rows) sits in exactly one Track A phase: 21 + 39 + 38 + 28 + 21 + 39 + 35 = 221. Every SYSTEM_DESIGN piece (API routes, Neon tables, sync, auth, files, push, AI router, memory, wearables, health, food, voice, jobs, observability, testing) has a Track B phase.
- **Names used across phases:** `SyncTransport`, `OutboxOp`, `RemoteChange` (existing, phone), `ModelAdapter` (existing, brain), `createApi`, `getPrincipal`, `tiers.json`, `NormalBandChart`, `FeelField`, `FeelingDrawer`, `MoveDeck`, `PhotoCard`, `FullPhotoScreen` are each defined once above and reused with the same names.
- **Open points are decisions, not gaps:** the owner list in section 0.

---

## Starting a cloud session (paste this)

> You're building **life**, an Expo app (`apps/mobile`) with its engine in `packages/core` and its brain in `packages/brain`. Read `AGENTS.md`, then **`BUILD_V26.md`** (the job list), then the references it names. The visual target is `review/v26/board.html`: open a screen with `?only=<key>&bare=1&noanim=1` and read its source in `review/v26/screens/*.js`.
>
> Start at the first phase in `BUILD_V26.md` that isn't approved yet (check `review/phase-N/NOTES.md` and the branches). Create that phase's branch from the last approved one (the first from `phase-12-v25-best-of`). Follow the global constraints exactly. Don't make the owner decisions in section 0 yourself: build the board as it stands, note the open point, and keep going.
>
> When the phase is done, run its checks, save screenshots and `review/phase-N/NOTES.md`, tick `SCREENS.md`, commit, push the branch, and stop with "Phase N ready for review." Don't start the next phase until the owner approves.
