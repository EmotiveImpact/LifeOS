# AGENTS.md — building **life**

Instructions for any coding agent working in this repo (Codex reads this file automatically; Hydrogen, Antigravity and others: read it first).

## What this is
**life** is an Expo app (iOS + Android) in `apps/mobile`. Engine logic lives in `packages/core`. The design, spec and plan are finished; your job is to **build it, phase by phase**, exactly as specified. Claude reviews every phase at a 🛑 gate before the next one starts.

## Read in this order before writing code
0. **`BUILD_V26.md`: the current job list (20 Nov 2026).** It replaces the phase list in `BUILD_PLAN.md` for everything still to do, and the V26 board (`review/v26/board.html`) replaces the v17 board as the visual target. Where this file and `BUILD_V26.md` differ on order or target, `BUILD_V26.md` wins.
1. `MASTER_PLAN.md`: order of everything, stack (Neon, voice, AI models), decisions log.
2. `BUILD_PLAN.md`: **your job list**. Phases, tasks, acceptance criteria, gates.
3. `SPEC.md`: how everything works (engine, health, learning, data model, blind spots).
4. `DESIGN.md`: the rules. Later sections override earlier ones. Key: §25–28 look, §43 no glass, §44 imagery, **§45–48 (final rules: no borders, shadows, orb family, top bar, pictures)**.
4b. **`SYSTEM_DESIGN.md`**: how everything connects (phone layers, database schema, sync, API, AI router, health and food pipelines). Build the data layer exactly as §4.
4c. **`FENNY_LEARNING.md`**: the teaching language (method, conversation rules, the Fenny Drawing Kit). Source code to port is in `vendor/fenny/` (the owner's own code; port it, don't import from it).
5. `MOTION.md`: how every screen moves, state to state.
6. `IMPLEMENTATION_REFERENCES.md`: which open-source files to learn from and what each licence allows. **Every repo is pinned to an exact commit in `vendor/REFERENCES.lock.md`**; MIT code we port is copied into `vendor/atria/`, `vendor/calai/`, and the owner's Fenny code into `vendor/fenny/`. Never import from `vendor/`; port it and credit it in `THIRD_PARTY_NOTICES.md`.
6a. **`SCREENS.md`**: every one of the 221 screens as a checklist (key, how it opens, from where, route). **This is the job list for Track A.**
6b. **`COMPONENTS.md`**: what exists in `@/design` and the 34 components still to build. Build a phase's components first, show them in `/design`, then build its screens.
7. **`design-board/life-design-board-v17.html`**: every screen (221), organised by tab, each saying **how it opens and from where**. Open it in a browser. It's the visual target and supersedes all earlier boards.
8. `apps/mobile/src/design/`: the design system that already exists. The `/design` route is a live gallery of every component.

## Hard rules
- **One phase per branch** (`phase-N-short-name`), branched from `master` or the last approved phase. Never commit to `main`.
- **Use the design system.** Import from `@/design`. No raw hex colours, no new font sizes, no new spacing scales. If a component is missing, add it to `src/design/components/` first and show it in `/design`.
- **Numbers come from `packages/core`.** Never hard-code a £ figure, score or target in a screen. Don't change engine logic.
- **No glass, no blur, no mesh gradients.** Solid surfaces only.
- **No borders or dividers, ever** (DESIGN §47–48): surfaces separate by fill; cards get `cardShadow`; list rows separate by spacing. Only state indicators (current step, today) draw lines.
- **The top bar never moves** (DESIGN §46). Use `TopBar` (`root | push | sheet | flow`) *outside* the ScrollView; pick the kind from how the screen opens (the board shows it under every screen). Never two bars on one screen.
- **The orb is `LifeOrb` v6** (`ring | thinking | working | searching | listening | done`), one family of the ring's dots; port it from the board's `mountOrb` (DESIGN §48, MOTION.md).
- **Motion via springs from `tokens.motion`**, haptics and sounds only via `feedback.*`. Respect Reduce Motion (`useCalmMotion`).
- **Both platforms, every phase.** iOS and Android must both bundle.
- **Licences:** 🟢 MIT/Apache may be used with notices; 🟡 GPL/AGPL ideas only; 🔴 no licence or non-commercial, don't touch. The owner's own Feynman-voice-app code may be reused. **Never read a WHOOP strap over Bluetooth.**
- **Health is wellness, not diagnosis. Money is guidance, not advice.** Copy rules: DESIGN §10, §31.
- **Secrets never in the app.** AI keys and OAuth live in the API (MASTER_PLAN §3.1).


## Build mode: UI first, the whole app, no straying (read this twice)
The owner wants the **entire app built and looking premium first**. Testing and real integrations come after.

**Track A — the whole app, UI-complete (do this first, all of it):**
1. Build the missing components in `COMPONENTS.md`, then every screen in **`SCREENS.md`**, chapter by chapter in that order. Tick each row as you finish it.
2. Data comes from `packages/core` (real calculations) plus a **seed store** (`apps/mobile/src/state/seed.ts`) holding realistic sample data matching the board's copy (Ama, her payslip, Kofi's birthday, the salmon bowl…). No backend, no HealthKit, no AI calls in Track A: stub them behind the interfaces in `SYSTEM_DESIGN.md` so they can be swapped later.
3. Wire **all navigation** exactly as each row's "Opens as / From / Route" says, so the app can be walked end to end.
4. **Checks in Track A are light on purpose:** run `npx tsc --noEmit -p .` after each chapter and keep it green; run one iOS and one Android `expo export` at the end of Track A. **No unit tests, no end-to-end tests, no screenshot runs, no test refactors** until Track A is complete.

**Track B — make it real (only after Track A is done and reviewed):** database and sync, API and auth, health integrations, AI jobs, the Fenny drawing kit port, then tests (engine tests, repository tests, Maestro flows), accessibility and performance.

**Do not stray:**
- Build only what's in `SCREENS.md` and `COMPONENTS.md`. **No new screens, no new features, no redesigns, no "improvements"** to layout, copy or colours. If the board shows it, match it; if it doesn't, don't add it.
- **Never invent styles.** Every colour, size, radius, shadow, spring and sound comes from `@/design` tokens. If you need something that isn't there, add it to the design system to match the board, then use it.
- Don't refactor working code, don't rename files the plan names, don't add libraries outside `IMPLEMENTATION_REFERENCES.md` / `vendor/REFERENCES.lock.md` (pin exact versions if you add one), don't write long docs. Keep notes to `review/NOTES.md`.
- When the board and a doc disagree, **the board wins** for looks, `DESIGN.md` §45–48 win for rules. If still unsure: pick the option closest to the board, note it in one line, and keep going. Never stop to ask about looks.
- Don't spend more than a few minutes on any one problem in Track A: stub it, mark the row `[~]`, note why, and move on.

## Premium, every screen (the bar to clear before ticking a row)
- **Matches the board** in light and dark: same layout, copy, spacing (20 pt side padding, the 4/8 rhythm), same type styles (Inter, the `Text` variants only), same imagery treatment.
- **The one-signal rule:** neutral surfaces, ink text, ember only for the one thing that matters on the screen. No borders or dividers; cards have `cardShadow`; one primary button per screen.
- **The top bar never moves** and is the right kind (`TopBar`: root, push, sheet, flow) for how the screen opens.
- **It feels alive:** every press uses `Press` (scale 0.97, spring) with the right `feedback.*` haptic; content enters with `motion.rise` and a stagger; numbers roll; sheets and pushes use native transitions; moments (done, level up, You've got it) use the bouncy spring and their sound. All per `MOTION.md`.
- **The orb** is `LifeOrb` v6 in the right state (ring idle, thinking while working, searching while checking, listening while you talk, done on finish).
- **Real-feeling content:** no lorem ipsum, no "Item 1", no empty grey boxes. Use the seed data and the board's copy, including £ figures from `packages/core`.
- **Edges handled:** safe areas, Dynamic Type up to 1.3× doesn't break the layout, Reduce Motion falls back to fades, long names truncate gracefully, empty and loading states exist where the board shows them.
- **60 fps:** lists virtualised, images sized, no layout jumps when data lands.

## Commands
```bash
cd apps/mobile
npm install
npx tsc --noEmit -p .                                   # typecheck
npx expo export --platform ios --output-dir /tmp/life-ios && rm -rf /tmp/life-ios
npx expo export --platform android --output-dir /tmp/life-android && rm -rf /tmp/life-android
npx expo start                                          # run (dev build needed for HealthKit / Health Connect)
```

## Definition of done (Track B phases; Track A uses the light checks above)
1. Typecheck and both bundles pass.
2. Light and dark screenshots of every screen you touched in `review/phase-N/`, named by the board's screen key (e.g. `today.dark.png`).
3. `review/phase-N/NOTES.md`: what you built, what's stubbed, anything that differs from the board or DESIGN.md and why.
4. Commit, then **stop** and say: "Phase N ready for review." Do not start the next phase.

## When unsure
Write the question in `NOTES.md`, make the safest choice that matches the board, and keep going. Don't invent new styles.
