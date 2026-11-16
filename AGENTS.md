# AGENTS.md — building **life**

Instructions for any coding agent working in this repo (Codex reads this file automatically; Hydrogen, Antigravity and others: read it first).

## What this is
**life** is an Expo app (iOS + Android) in `apps/mobile`. Engine logic lives in `packages/core`. The design, spec and plan are finished; your job is to **build it, phase by phase**, exactly as specified. Claude reviews every phase at a 🛑 gate before the next one starts.

## Read in this order before writing code
1. `MASTER_PLAN.md`: order of everything, stack (Neon, voice, AI models), decisions log.
2. `BUILD_PLAN.md`: **your job list**. Phases, tasks, acceptance criteria, gates.
3. `SPEC.md`: how everything works (engine, health, learning, data model, blind spots).
4. `DESIGN.md`: the rules. Later sections override earlier ones. Key: §25–28 look, §43 no glass, §44 imagery, **§45–48 (final rules: no borders, shadows, orb family, top bar, pictures)**.
4b. **`SYSTEM_DESIGN.md`**: how everything connects (phone layers, database schema, sync, API, AI router, health and food pipelines). Build the data layer exactly as §4.
4c. **`FENNY_LEARNING.md`**: the teaching language (method, conversation rules, the Fenny Drawing Kit). Source code to port is in `vendor/fenny/` (the owner's own code; port it, don't import from it).
5. `MOTION.md`: how every screen moves, state to state.
6. `IMPLEMENTATION_REFERENCES.md`: which open-source files to learn from and what each licence allows.
7. **`design-board/life-design-board-v17.html`**: every screen (207), organised by tab, each saying **how it opens and from where**. Open it in a browser. It's the visual target and supersedes all earlier boards.
8. `apps/mobile/src/design/`: the design system that already exists. The `/design` route is a live gallery of every component.

## Hard rules
- **One phase per branch** (`phase-N-short-name`), branched from `design-system-handoff` or the last approved phase. Never commit to `main`.
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

## Commands
```bash
cd apps/mobile
npm install
npx tsc --noEmit -p .                                   # typecheck
npx expo export --platform ios --output-dir /tmp/life-ios && rm -rf /tmp/life-ios
npx expo export --platform android --output-dir /tmp/life-android && rm -rf /tmp/life-android
npx expo start                                          # run (dev build needed for HealthKit / Health Connect)
```

## Definition of done (every phase, before you stop)
1. Typecheck and both bundles pass.
2. Light and dark screenshots of every screen you touched in `review/phase-N/`, named by the board's screen key (e.g. `today.dark.png`).
3. `review/phase-N/NOTES.md`: what you built, what's stubbed, anything that differs from the board or DESIGN.md and why.
4. Commit, then **stop** and say: "Phase N ready for review." Do not start the next phase.

## When unsure
Write the question in `NOTES.md`, make the safest choice that matches the board, and keep going. Don't invent new styles.
