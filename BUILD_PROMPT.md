# The build prompt

Paste the block below into **Codex**, **Hydrogen** or any coding agent, with this repository open (branch `design-system-handoff`). It works for each phase: change the phase number when you move on.

---

```text
You are building "life", an Expo app (iOS + Android) in apps/mobile of this repository.
Everything is already designed and specified. Your job is to build it faithfully, one phase at a time.

First, read AGENTS.md at the repo root and follow it exactly. Then read, in order:
MASTER_PLAN.md, BUILD_PLAN.md, SPEC.md, DESIGN.md (sections 45–47 are the final rules),
MOTION.md, IMPLEMENTATION_REFERENCES.md, and open design-board/life-design-board-v16.html
in a browser. That board is the visual target: 188 screens organised by tab, and under every
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

## After each phase
1. Tell Claude: "Phase N is ready, review it." Claude re-runs the checks, compares the screenshots with the board and writes `review/phase-N/CLAUDE_REVIEW.md` with fixes.
2. Give the builder: "Fix everything in review/phase-N/CLAUDE_REVIEW.md, then stop."
3. Once it's approved, paste the prompt again with the next phase number (1 → 1b → 2 → 3 → 4 → 4b → 4c → 4d → 5 → 6 → 7 → 8 → 8b → 9 → 10 → 11 → 12 → 13).

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
| `IMPLEMENTATION_REFERENCES.md` | Repos to learn from, licences |
| `design-board/life-design-board-v16.html` | Every screen (open in a browser) |
| `apps/mobile/src/design/` | The design system in code (tokens, components, TopBar, LifeOrb, feedback) |
| `apps/mobile/assets/` | Photos and sounds |
| `packages/core` | The engine |
