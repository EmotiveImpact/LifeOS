# v26-integration

One branch that holds every finished phase, merged in a fixed order, with the checks re-run after each merge. Nothing goes to `master`.

## Merge order so far (20 November 2026)

| # | Branch | What it brings | Checks after the merge |
|---|---|---|---|
| 1 | `phase-18-v26-learn` | Learn and Teach me (21 screens), drawer and chart fixes | carried in by Phase 19 |
| 2 | `phase-19-v26-you` | You, Know yourself, People, Settings, Grow (39 screens) | typecheck, both bundles |
| 3 | `phase-20-v26-first-open-states` | First open, States, Outside the app, the orb (35 screens), the 18+ check, health consent, phone only | mobile typecheck, root `tsc -b`, 93 tests, iOS and Android bundles |
| 4 | `claude/project-thread-d9kohu` (engine maths) | readiness, sleep debt, load band, illness signal, food targets, the day planner, the notification cap | merged with 5 |
| 5 | `claude/project-thread-yniozi` (brain rules and CI) | crisis check and its test set, proposal schema, standing AI consent, router tiers, `eas.json`, CI, over-the-air updates | mobile typecheck, root `tsc -b`, 461 tests, iOS and Android bundles |

No merge conflicts. Phase 20 added routes, so the typed route file needs regenerating before the mobile typecheck (`npx expo start` once, or any dev run).

## Joined up after the merges

- **One crisis check.** Setup's "Or just tell life" used a copy of the old regular expression. It now calls the brain's `detectCrisis`, the same check `runBrain` runs before any model, so the two can't drift.
- **Health data in Settings.** Your data has a Health data row showing the recorded answer ("You said yes on 20 November 2026", "Not asked yet", "Off · you said not now", or "You took your yes back"). It opens the consent screen with `next=settings`, so agreeing or saying not now returns to Settings, and withdrawing happens on that same screen.
- **Recap Share** opens the share card sheet, where numbers can be hidden before anything leaves the phone, instead of sharing a bare sentence.
- **Date of birth.** Your details and the birthday screen read the date the age check stores (`profile.dateOfBirth`). The sample life keeps Ama's board date; a real account without one shows "Not set".

## Notes for later phases

- `expo-updates` is configured (`runtimeVersion` from the fingerprint, check on load) but needs an EAS project before updates can be published (decision 8).
- Root `tsc -b` needs the root workspace installed (`npm install` at the repository root); the mobile app keeps its own `node_modules`.

## Later merges

| When | Branch | Commit | Checks |
|---|---|---|---|
| 20 Nov, ~19:30 UTC | `phase-21-api-auth` (fast-forward) | af82517 | 25 API tests on Postgres 16, root `bun test`, API and app typecheck, iOS and Android bundles |
| 20 Nov, ~19:45 UTC | `v26-owner-answers` (fast-forward) | see `review/owner-answers/NOTES.md` | app typecheck, root `bun test`, iOS, Android and web bundles |
| 20 Nov, ~19:50 UTC | `phase-22-sync` (fast-forward) | 3b1972d | 514 tests with Postgres, app and API typecheck, iOS, Android and web bundles |
| 20 Nov, ~19:55 UTC | `claude/project-thread-8i27bq` (merge, nav bar and Talk) | f4f9b53 | 514 tests with Postgres, app and API typecheck, iOS, Android and web bundles |
| 20 Nov, ~20:05 UTC | `phase-23-files-push-account` (fast-forward) | ca591df | 529 tests with Postgres, app and API typecheck, iOS, Android and web bundles |
| 20 Nov, ~20:20 UTC | `claude/project-thread-8i27bq` (merge, calm motion and one look; HeroUI removed, so run `npm install` in `apps/mobile`) | 6bb06bc | 529 tests with Postgres, app typecheck, iOS and Android bundles |
| 20 Nov, ~20:40 UTC | `phase-24-brain-router` (fast-forward) | 707d085 | 564 tests with Postgres, app and API typecheck, iOS and Android bundles |
| 20 Nov, ~21:03 UTC | `phase-25-brain-jobs` (fast-forward) | 531b073 | 604 tests with Postgres, app and API typecheck, iOS and Android bundles |
| 20 Nov, ~21:35 UTC | `claude/project-thread-8i27bq` (fast-forward, steady check-in drawer, closing motion on the web, words-only switch, Stabilise) | cde7742 | 604 tests with Postgres, app typecheck, iOS, Android and web bundles |
| 20 Nov, ~22:00 UTC | `phase-26-health` (fast-forward) | 4f1a269 | 643 tests with Postgres, app and API typecheck, iOS, Android and web bundles |
| 20 Nov, ~22:15 UTC | `claude/project-thread-txkwqs` (merge, core loops: evening planning, "I've got a few minutes", resume, step recap) | b311f66 | 674 tests with Postgres, app and API typecheck, iOS, Android and web bundles |
| 20 Nov, ~22:05 UTC | Fix on `v26-integration`: stop tracking two `node_modules` links the core loops merge committed (root `.gitignore` now ignores links too) | e90e1b3 | 674 tests with Postgres, app typecheck |
| 20 Nov, ~22:20 UTC | `claude/project-thread-8i27bq` (fast-forward, Life as the name, L I F E as the logo) | 3da3bc8 | 674 tests with Postgres, app typecheck, iOS and Android bundles |
| 20 Nov, ~22:28 UTC | `claude/project-thread-8i27bq` (fast-forward, the orb back at the right of Today, Plan and You, opening From Life) | 272e485 | 674 tests with Postgres, app typecheck, iOS and Android bundles |
| 20 Nov, ~22:50 UTC | `phase-27-food` (merge of integration, then fast-forward: food from photos, barcodes and labels, real targets) | see `git log` | 719 tests with Postgres, app and API typecheck, iOS, Android and web bundles |

## Screenshots

`privacy`, `privacy-yes`, `consent-from-settings`, `profile`, `recap-share` (light).
