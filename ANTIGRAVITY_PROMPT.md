You are building **life**, an Expo app in `apps/mobile`. Claude designed it and will review your work at each gate.

**Read these first, in this order:**
0. `MASTER_PLAN.md`: the order of everything, the stack (Neon, voice, AI models) and the decisions log.
1. `BUILD_PLAN.md`: the phases, tasks, acceptance criteria and 🛑 review gates. **This is your job list.**
2. `SPEC.md`: **how everything works**: the Life Engine, health (devices, readiness, sleep, food, habits), learning (Feynman + spaced recall), the behaviour of every component and screen, the data model, and blind spots with decisions.
3. `IMPLEMENTATION_REFERENCES.md`: the open-source repos and **exact files** to learn from for each feature, with licence rules (🟢 use, 🟡 ideas only, 🔴 don't touch). **Never copy 🟡 or 🔴 code.**
4. `DESIGN.md`: the rules. Every section is numbered (§). Later sections override earlier ones; the key ones are §25–§28 (look), §29 + §32 (screens), §40 (Pulse = dot field), §42 (motion), §43 (no glass or blur), §44 (generic imagery for v1).
5. The visual target: **`design-board/life-design-board-v13.html`, every screen (119): Teach me lessons, WHOOP-style health for any wearable, smarter food, every next-level feature, levels and the component library.** It supersedes v1–v12 wherever they differ.
5b. `MOTION.md`: how every screen moves from state to state. The board's "Play the whole lesson" screen shows the transitions working.
6. `apps/mobile/src/design/`: the design system that already exists, and `/design`, the live component gallery.

**How to work:**
- Do **one phase at a time**, on its own branch, exactly as BUILD_PLAN.md describes. Create each phase branch from `design-system-handoff` (or from the previous approved phase).
- Use only `@/design` components and tokens. Numbers come from `packages/core`. Don't change engine logic.
- At the end of each phase, run the Definition of Done, save light and dark screenshots plus `NOTES.md` in `review/phase-N/`, commit, and **stop**. Say "Phase N ready for Claude review" and wait.
- If something in the plan is unclear or conflicts with DESIGN.md, write it in `NOTES.md` and make the safest choice. Don't invent new styles.

Start with **Phase 1 — Foundations**.
