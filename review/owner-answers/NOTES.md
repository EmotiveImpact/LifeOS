# Edem's answers, 20 November 2026

Branch `v26-owner-answers`, from `v26-integration` after Phase 21. Edem's answers to the open questions (`/mnt/project-files/questions-for-edem.md`), and what each means for the build.

## Done here

- **life Plus price (9): £7.99 a month, £79.99 a year.** `seed.membership` now holds 7.99 and 79.99, and the life Plus screens show pence. Annual works out at £6.67 a month, saving 17% on twelve monthly payments. On the subscription screen the "£6.67 a month · saves 17%" chip now wraps under the figure instead of running off the edge. The board still shows £48. Screens: `plus.light.png`, `subscription.light.png`, `subscription.dark.png`.

## Carried into later phases

- **(2) CI** runs once the repository is public.
- **(3) Own the memory layer**, not mem0. Phase 25 is rewritten to match: pgvector in our Neon database, replacing `memory.embedding` (jsonb for now).
- **(4) Health memories stay on the phone; the cloud only with consent.** Say so plainly so people can choose to sync. This lands in Phase 22 (sync), with the `consents` table Phase 20 asked for.
- **(12) AI consent switch in Settings** and **(14) to-dos, a calendar life can write to, and health admin**: design first, then build.
- **(13) The day starts at 04:00**, with a Settings option to change it. The engine already takes the start as a parameter (`lifeDay(at, zone, dayStartsAt)` in `packages/core/src/time/zone.ts`). The setting needs threading through the core callers and a Settings row, which is in the gaps backlog.
- **(11)** Keep the readiness placeholder (60 to 70 "normal") until production.
- **(5), (7), (8) and (10)** need a plainer explanation for Edem. They change nothing in the build yet.
