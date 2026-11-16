# life — Master Plan

> **The plan above all the other plans.** Start here. It says what life is, where every decision lives, which tech we're using and why, and the order everything happens in, from design to launch.
> Last updated 15 Nov 2026 (design v14).

---

## 1. What we're building, in one paragraph

**life** is an everything app that levels people up: money and admin, body, learning and the one aim that ties them together. Each day it picks the few moves that matter most, explains why, helps you do them (or does them for you, with your OK), and teaches you anything you don't know at the moment you need it. Calm, precise, Linear-grade design; Inter; dark-first; no glass; vibrant imagery only at the moments that earn it. iPhone and Android, from one Expo codebase.

## 2. Where everything lives

| File | What it decides | Who reads it |
|---|---|---|
| **MASTER_PLAN.md** (this) | Order, stack, decisions, launch | Everyone, first |
| `BUILD_PLAN.md` | Phase-by-phase tasks, acceptance and 🛑 gates | Antigravity (the job list) |
| `SPEC.md` | How everything works: engine, health, learning, data, blind spots | Antigravity, Codex |
| `DESIGN.md` | The look and the rules (§1–§44) | Everyone building screens |
| `MOTION.md` | How every screen moves, state to state | Everyone building screens |
| `SYSTEM_DESIGN.md` | How everything connects: phone layers, schema, sync, API, AI router, pipelines | Builders, first thing in Phase 1b |
| `FENNY_LEARNING.md` + `vendor/fenny/` | The teaching language and the owner's Fenny code to port | Phase 8b |
| `IMPLEMENTATION_REFERENCES.md` | Which repos and files to learn from, and licence rules | Before each feature |
| `design-board/life-design-board-v17.html` | **Every screen (188), organised by tab**, the component library and the to-do list | The visual target |
| `AGENTS.md` | Rules and commands every builder reads first | Codex, Hydrogen, any builder |
| `BUILD_PROMPT.md` | The prompt to paste, per phase | You |
| `apps/mobile/src/design/` | The design system in code (tokens, 70+ components, feedback) | Every screen imports from here |
| `packages/core` | The engine: every number in the app | Never hard-code a figure |

**Who does what:** Codex (or Hydrogen / Antigravity) builds each phase from `BUILD_PROMPT.md` → Claude reviews at every gate, fixes, and does the visual polish (look, feel, sound, motion).

## 3. Stack decisions

### 3.1 Backend: Neon, not Supabase
**Decision:** Neon (serverless Postgres) + our own small API + a separate auth library.
- **Why Neon:** plain Postgres with **a database branch per build phase and per pull request** (Antigravity can't break real data), scales to zero when idle, cheap to start, no lock-in (it's just Postgres).
- **What Supabase gave us that we now add ourselves:** auth, storage and serverless functions.
  - **Auth:** Better Auth (MIT, open source), running in our API, with Sign in with Apple, Google and email. Neon also offers managed auth; pick one at Phase 1b after a one-day spike, both are fine.
  - **API:** TypeScript serverless functions (the same shape as `apps/api` in your Feynman app). All AI keys and wearable OAuth (WHOOP, Oura) live here, never in the app.
  - **Files:** object storage (Cloudflare R2 or S3) for meal photos and scanned letters, encrypted, with short-lived signed links.
  - **Security:** every table has `user_id`; the API checks it on every request **and** Postgres row-level security enforces it as a second lock.
- **Sync:** the phone is the source of truth (`expo-sqlite`), with a queue of changes pushed to the API. Start with our own simple push/pull; switch to PowerSync (Apache-2.0, works with any Postgres) only if conflicts get hard.
- **Health data** is encrypted at rest, never used for ads, never put in iCloud, and the user can export or delete it all from Settings.

### 3.2 Voice
Behind one interface, `src/services/voice.ts`, so we can swap providers without touching screens.

| Job | First choice | Fallback | Notes |
|---|---|---|---|
| Speech to text | On-device: whisper.rn (MIT), or the phone's own speech recogniser | A cloud transcription model via our API | On-device = private and free; cloud for long or noisy audio |
| Text to speech (life speaking) | **Phonon**, your own on-device module (from the Feynman app) | A cloud voice (e.g. Cartesia, which your Feynman app already supports) | Phonon is iOS today; Android needs the fallback or a port |
| Live back-and-forth (Tell it back, Coach) | A realtime voice model via our API (e.g. Gemini Live, already wired in your Feynman app) | Turn-based: speech to text → model → speech | Turn-based ships first; realtime is an upgrade |

### 3.3 AI models: model-agnostic, chosen per job by tests
`src/services/ai.ts` already defines the jobs (talk, ask, extract, food, grade). We add **lesson, analyse, showMe, plan-explain**. The API routes each job to a model **tier**, never to a hard-coded model:

| Tier | Jobs | What matters |
|---|---|---|
| Fast | Filing what you say, extracting dates and bills, food tips, nudge copy | Speed, cost, strict JSON |
| Strong | Building lessons, gap analysis, coach answers, "Bigger decisions" | Reasoning, plain words, following our rules |
| Vision | Meal photos, letters, payslips | Reading images accurately |
| Voice | Live tell-back | Low latency |
| On device | Private mode (SPEC §11 #7) | Runs offline on the phone |

**How we choose:** for every job, a small **eval set** (30–50 real examples with the right answers) lives in `tools/evals/`. Any new model, including Google's newest Gemini, Claude, GPT or an open model, gets run against it, and wins the tier only if it's better on quality, cost and speed. Your Feynman app already runs Claude with an OpenAI fallback and Gemini for live voice, so the routing pattern exists.

**On Google's latest model:** I can't confirm which release you mean from here, so I won't make claims about it. Gemini models have historically been strong at **vision, long documents and live voice**, which makes them good candidates for meal photos, letter scanning and Tell it back. Put it through the evals; don't lock in.

**Rules that never change, whatever the model:** numbers come from `packages/core`, never from the model. Outputs are schema-checked JSON. Money is guidance, not advice; health is wellness, not diagnosis. No training on user data without opt-in.

### 3.4 A "decision model": yes, but in the right place
Two different things get called decision models, and life uses both carefully:
1. **Deciding what you see today** (`planToday()`): **not** an LLM. Rules + scores from the engine pick candidate moves, then a small **learning layer (a contextual bandit, e.g. Thompson sampling)** learns which kind of nudge, at what time, actually gets done by *you*. It starts rule-based and switches learning on after about two weeks of data (SPEC §4.3). It's explainable: "Why am I seeing this?" shows the reasons.
2. **Helping you make a big decision** ("Bigger decisions", rent vs buy, job offers): a **reasoning model** in the Strong tier lays out options, criteria and scenarios, but every figure comes from the engine's calculators, and it ends with "what would change the answer", not a verdict.

### 3.5 Teach me (from your Feynman app)
Your Feynman app's lesson engine comes across, rewritten in life's language and code style (you've OK'd using its code):
- **Lesson shape** (`lesson.ts`): `{ idea, bites[2–3], recap, explainBack }`; each bite has short text, one **picture** (flow, compare, cycle, layers, parts) and one **puzzle** (true/false, choose, fill the gap, order, match). Levels: Simple, Standard, Deep.
- **Teaching moves** (`policy.ts`): life listens like a curious friend: asks why and what if, says "I'm lost" when you're vague, never explains for you. After you're stuck twice it offers a short "Show me", then "now tell me in your own words".
- **One guess per lesson** (from TeachMode): predict before the reveal.
- **Analysis** (`review.ts`): what you explained well, quoted in your words, then the gaps, with the one you said felt shakiest first.
- **Where Teach me appears:** any term life shows that isn't in your `LearningRecord` yet (tax code, ISA, HRV, sleep debt…), and in Talk when you sound unsure. Lessons use your own numbers (your payslip, your sleep), are cached per topic + level, and end by sending you back to the action that needed the knowledge.
- **The feeling at the end:** "You've got it", what you can now do, ticks, and a recall booked (FSRS). Learning that leads to an action is marked "Led to: …".
- **Visual language:** we take its motion springs and calm pacing; we **drop** its glass and its colours, and use life's tokens.

## 4. The order of everything

Phases run one at a time, each on its own branch, each ending at a 🛑 gate where Claude reviews.

| # | Phase | Ends with |
|---|---|---|
| 0 | **Design** (done: board v14, DESIGN, SPEC, MOTION, references, design system in code) | This plan |
| 1 | Foundations: shell, tabs, store, every route | Gate 1 |
| 1b | **Platform: EAS dev builds, Neon + API + auth, local-first SQLite, `ai.ts` + `voice.ts` interfaces, eval harness** | Gate 1b |
| 2 | The core: Today, Plan, You | Gate 2 |
| 3 | Missions and memory | Gate 3 |
| 4 | Pulse, mood and instruments | Gate 4 |
| 4b–4d | Body (devices, sleep, readiness, load) · Fuel · Habits | Gates 4b–4d |
| 5 | Talk, file, ask (voice service live) | Gate 5 |
| 6 | Onboarding + Chief Aim | Gate 6 |
| 7 | Toolkit, level-gated | Gate 7 |
| 8 | Learn | Gate 8 |
| **8b** | **Teach me: lesson engine, Fenny Drawing Kit (clean or hand-drawn), the Teach me screens, the button everywhere** | Gate 8b |
| 8c | Know yourself, people and dates, documents and renewals | Gate 8c |
| 9 | Grow, account, levels | Gate 9 |
| 10 | Polish: the full **MOTION.md** pass, accessibility, Android pass, performance | Gate 10 |
| 11 | Next level: calendar, experiments, forecast, cycle, fitness age, then watch, private mode, memory, Do it for me, your AI (MCP), all your devices, glucose, habit strength, body basics, shared life | Gate 11 |
| 12 | **Beta:** TestFlight + Play internal testing, 20–50 people, analytics, crash reporting, fix list | Beta review |
| 13 | **Launch:** App Store + Play, privacy labels, health and money review notes, website, support | Launch |

**Run alongside the phases (not blocking):**
- **Content:** 30 seeded Teach me topics, the Learn library (~40 ideas), question bank, copy deck, tax-year rules.
- **Imagery and sound:** app icon and splash, more story frames (each reviewed by a person), store screenshots from the board, Android icons.
- **Legal and trust:** privacy policy and terms, DPIA (health is special-category data under UK GDPR), health/money copy review, App Store privacy labels.
- **Evals:** grow `tools/evals/` with every phase that adds an AI job.

## 5. Every gate checks the same things
1. Typecheck + iOS and Android bundles pass (Claude re-runs them).
2. Screens match the v14 board and DESIGN.md, light and dark.
3. Motion matches MOTION.md, with Reduce Motion on and off.
4. No hard-coded numbers; records filed correctly; nothing 🟡/🔴 copied.
5. Copy is plain, specific and within the accuracy rules.
6. Fixes listed in `review/phase-N/CLAUDE_REVIEW.md` before the next phase starts.

## 6. What you need to set up (only you can)
- Free disk space: at least 5 GB for cloud builds, about 15 GB for local builds.
- Apple Developer account (paid yearly), Expo/EAS account (free), Google Play Console (one-off fee).
- **Neon account** (free to start).
- API keys for the model providers you want to test, stored only in the API's environment, never in the app.
- WHOOP and Oura developer apps (official APIs only; never read a WHOOP strap over Bluetooth).

## 7. Decisions log
| Date | Decision |
|---|---|
| 15 Nov 2026 | Home-first, not chat-first. Inter. No glass, no blur. Pulse is a dot field. |
| 15 Nov 2026 | Generic diverse cast for v1 imagery; "pictures like me" later behind a flag. |
| 15 Nov 2026 | Four life levels from the engine (Stabilize → Expand your options); areas get progress, not levels. |
| 15 Nov 2026 | WHOOP-style functions from any wearable via official APIs and health platforms; no reverse-engineered protocols. |
| 15 Nov 2026 | Habit formation shown as ~66 days on average, not 14 or 21. |
| 15 Nov 2026 | **Neon + Better Auth (or Neon's auth) replaces Supabase.** |
| 15 Nov 2026 | **Voice behind `voice.ts`: on-device first, Phonon for speech, cloud fallback.** |
| 15 Nov 2026 | **Models chosen per job by evals; no lock-in. Today's plan is decided by rules + a bandit, not an LLM.** |
| 15 Nov 2026 | **Teach me comes from the Feynman app, in life's language.** |
| 16 Nov 2026 | **v17: orb is one family of the ring's dots (thinking, working, searching, listening, done); no dividers, card shadows; Fenny teaching language + drawing kit; body numbers; health features from the repos; Cal AI counters; SYSTEM_DESIGN.md.** |
| 15 Nov 2026 | **v16: orb v2 (globe, no core); no borders anywhere (owner's decision); AGENTS.md + BUILD_PROMPT.md for any builder.** |
| 15 Nov 2026 | **v14: no borders on buttons (avatars and cards keep theirs); the orb evolves ring → sphere → core; chat restored; board organised by navigation; 188 screens.** |
