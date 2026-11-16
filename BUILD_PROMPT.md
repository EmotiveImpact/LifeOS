# The build prompt

## ⭐ Use this one: build the whole app, UI first

Paste into **Codex** (or any builder) with this repo open on branch `design-system-handoff`. It builds every screen with the same design language before any testing or real integrations, and it's written to stop it wandering off.

```text
You are building "life", an Expo app for iOS and Android in apps/mobile. Everything is already designed.
Your job is to build ALL of it, faithfully, looking and feeling premium. You are not designing anything.

1. Read AGENTS.md completely, twice. Follow "Build mode: UI first", "Do not stray" and "Premium, every
   screen" exactly. Then read DESIGN.md (§45–48 are final), MOTION.md, COMPONENTS.md and SCREENS.md.
   Skim SYSTEM_DESIGN.md (only so your stubs have the right shapes).
2. Open design-board/life-design-board-v17.html in a browser and keep it open. It is the visual truth.
   Every screen in SCREENS.md is a phone on that board with id "s-<key>".
3. Create branch build/ui-complete from design-system-handoff.
4. TRACK A, in this order, without stopping to ask:
   a. Build every component in COMPONENTS.md "To build" (LifeOrb v6 first, ported from the board's
      mountOrb), each shown in the /design gallery.
   b. Create the seed store (apps/mobile/src/state/seed.ts) with the board's sample people, numbers and
      copy; real figures come from packages/core.
   c. Build every screen in SCREENS.md, chapter by chapter in order, wiring each route exactly as listed.
      Match the board in light and dark. Tick the row ([x] or [~] with a one-line note).
   d. After each chapter: npx tsc --noEmit -p . must be green. Commit "screens: <chapter>".
5. Do NOT: write tests, run screenshot jobs, build the backend, call real APIs, add features or screens,
   change the design, refactor working code, or add unlisted libraries. If something blocks you for more
   than a few minutes, stub it, mark the row [~], note why in review/NOTES.md, and move on.
6. At the end of Track A: run one iOS and one Android expo export, make them pass, update
   review/NOTES.md (what's [~] and why) and reply exactly: "Track A complete: the whole app is built."
   Then stop. Track B (making it real, then testing) starts only after review.
```

When it says "Track A complete", tell Claude: **"Review Track A."** Claude walks the app against the board screen by screen, fixes the look and feel, and writes the Track B list.

---


Paste the block below into **Codex**, **Hydrogen** or any coding agent, with this repository open (branch `design-system-handoff`). It works for each phase: change the phase number when you move on.

---

```text
You are building "life", an Expo app (iOS + Android) in apps/mobile of this repository.
Everything is already designed and specified. Your job is to build it faithfully, one phase at a time.

First, read AGENTS.md at the repo root and follow it exactly. Then read, in order:
MASTER_PLAN.md, BUILD_PLAN.md, SYSTEM_DESIGN.md, SPEC.md, DESIGN.md (sections 45–48 are the final rules),
MOTION.md, FENNY_LEARNING.md, IMPLEMENTATION_REFERENCES.md, and open design-board/life-design-board-v17.html
in a browser. That board is the visual target: 221 screens organised by tab, and under every
screen it says how it opens (tab, push, sheet, full screen) and where from.

Build PHASE 1 from BUILD_PLAN.md now (then stop):
- Create branch phase-1-foundations from design-system-handoff.
- Use only components and tokens from apps/mobile/src/design (import from "@/design").
  If something is missing, add it to the design system first and show it in the /design gallery.
- Every screen uses TopBar (root | push | sheet | flow) outside its ScrollView. The header never moves.
- Every number comes from packages/core. No glass, no blur. No borders anywhere.
- It must typecheck and bundle for both iOS and Android.

When the phase is done:
1. Run the Definition of Done in AGENTS.md (typecheck + both expo exports).
2. Save light and dark screenshots of every screen you touched to review/phase-1/, named by board key.
3. Write review/phase-1/NOTES.md: what you built, what's stubbed, and any differences from the board and why.
4. Commit on the branch and reply exactly: "Phase 1 ready for review." Then stop. Do not start Phase 2.

If anything is unclear, write the question in NOTES.md, choose the option that best matches the
board, and continue. Do not invent new visual styles.
```

---

## Older: phase-by-phase overnight run (Track B)

Paste this instead when you want Codex to keep going without waiting for review. It stacks one branch per phase, checks itself after each, and only stops if it's genuinely blocked. Claude reviews all of it in the morning.

```text
You are building "life", an Expo app (iOS + Android) in apps/mobile. Read AGENTS.md first and follow it
exactly, then MASTER_PLAN.md, BUILD_PLAN.md, SYSTEM_DESIGN.md, SPEC.md, DESIGN.md (45–48 are final),
MOTION.md, FENNY_LEARNING.md and IMPLEMENTATION_REFERENCES.md. Open design-board/life-design-board-v17.html
in a browser: it is the visual target (221 screens, each says how it opens and from where).

OVERNIGHT MODE. Build these phases in order, without waiting for review between them:
  1 → 1b → 2 → 3 → 4 → 4b → 4c → 4d
For each phase:
  a. Branch phase-N-<name> from the previous phase's branch (phase 1 from design-system-handoff).
  b. Build exactly what BUILD_PLAN.md lists for the phase, using only @/design components and tokens,
     the TopBar rule, LifeOrb v6 (port from the board's mountOrb), no borders or dividers, card shadows,
     numbers from packages/core, the schema in SYSTEM_DESIGN.md §4.
  c. Run the Definition of Done in AGENTS.md (typecheck + iOS and Android expo export). Fix until green.
  d. Write review/phase-N/NOTES.md (built, stubbed, differences from the board and why) and save light
     and dark screenshots of touched screens if a simulator is available; if not, say so in NOTES.md.
  e. Commit and move straight on to the next phase.
Stop early only if: a phase needs a secret or account you don't have (API keys, Apple, Neon), a
dependency won't install, or the Definition of Done can't be made green after a real attempt. Then write
review/BLOCKED.md with exactly what you need, and stop.
At the end, write review/OVERNIGHT.md: each phase, its branch, status, and anything you guessed.
Never push to main, never delete anything you didn't create, never put secrets in the app.
```

In the morning, tell Claude: "Review the overnight run." Claude reads `review/OVERNIGHT.md`, checks each branch in order and writes the fix lists.

---

## After each phase
1. Tell Claude: "Phase N is ready, review it." Claude re-runs the checks, compares the screenshots with the board and writes `review/phase-N/CLAUDE_REVIEW.md` with fixes.
2. Give the builder: "Fix everything in review/phase-N/CLAUDE_REVIEW.md, then stop."
3. Once it's approved, paste the prompt again with the next phase number (1 → 1b → 2 → 3 → 4 → 4b → 4c → 4d → 5 → 6 → 7 → 8 → 8b → 8c → 9 → 10 → 11 → 12 → 13).

## Codex or Hydrogen?
- **Codex** reads `AGENTS.md` automatically and is good at long, well-specified tasks in a repo. Use it as the main builder.
- **Hydrogen:** I don't know this tool's exact setup, so point it at `AGENTS.md` first. The prompt above doesn't depend on any one tool.
- Either way, keep **one builder per phase branch** so two agents never edit the same files.

## The files to hand over
The whole repository, on branch `design-system-handoff`. The important ones:

| File | What it is |
|---|---|
| `AGENTS.md` | Rules and commands for the builder (read first) |
| `BUILD_PROMPT.md` | This prompt |
| `MASTER_PLAN.md` | Order, stack, decisions |
| `BUILD_PLAN.md` | Phases and gates |
| `SPEC.md` | How everything works |
| `DESIGN.md` · `MOTION.md` | Look and movement rules |
| `SYSTEM_DESIGN.md` | How everything connects, and the database schema |
| `FENNY_LEARNING.md` · `vendor/fenny/` | The teaching language and the owner's code to port |
| `IMPLEMENTATION_REFERENCES.md` | Repos to learn from, licences |
| `design-board/life-design-board-v17.html` | Every screen (open in a browser) |
| `apps/mobile/src/design/` | The design system in code (tokens, components, TopBar, LifeOrb, feedback) |
| `apps/mobile/assets/` | Photos and sounds |
| `packages/core` | The engine |
