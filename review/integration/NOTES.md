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
| 20 Nov, ~23:25 UTC | `phase-29-day-engine` (fast-forward: the day engine on Today, local nudges, read-only calendar, background work) | see `git log` | 743 tests with Postgres, app typecheck, iOS and Android bundles |
| 21 Nov, ~00:40 UTC | `phase-30-quality` (fast-forward: screen readers, calm motion, Android back, paged long lists, phone-only choices, the weekly count of finished moves, crash reports off until a DSN, Maestro flows; run `npm install` in `apps/mobile` for Sentry, and migrate the API database for `0005_weekly_moves`) | ac95388 | 768 tests with Postgres, app and API typecheck, iOS, Android and web bundles |
| 21 Nov, ~01:05 UTC | `phase-31-launch` (fast-forward: launch documents in `docs/launch`, the website in `apps/site` with deletion on the web, real terms and privacy policy under About, the database kept out of device backups, store screenshots; nothing to install or migrate, and after editing the launch Markdown run `bun apps/site/build.ts`) | 359c1aa | 780 tests with Postgres, app and API typecheck, iOS, Android and web bundles |
| 21 Nov, ~02:10 UTC | `claude/project-thread-8i27bq` (fast-forward: the orb spins once for something new and rests otherwise, inside the same disc as the other round buttons, with an ember dot only under Reduce Motion; search moves to `screens/v26/search.tsx` with the field docked above the keyboard, and Today, Plan and the day-one Plan open it as `SearchModal`) | d671d04 | 780 tests with Postgres, app typecheck, iOS, Android and web bundles |
| 21 Nov, ~02:40 UTC | `claude/project-thread-8i27bq` (fast-forward: the orb's red dot, ten dots for ten areas with the newest note's area leading in ember; the Reduce Motion badge goes, since the red dot covers it; Today's bar passes the Money area until real notes pass their own) | 357eef7 | 780 tests with Postgres, app typecheck, iOS and Android bundles |
| 21 Nov, ~02:40 UTC | `claude/project-thread-8i27bq` (fast-forward: the orb holds still for something new, the lit areas glow ember and pulse in turn, newest first; `LifeOrb` takes `marks` and the top bar takes `areas`) | e6411fc | 780 tests with Postgres, app typecheck, iOS and Android bundles |
| 21 Nov, ~02:40 UTC | `fix-empty-life` (fast-forward, fix F-01: release builds start with an empty life and erase returns to it; `production` sets `EXPO_PUBLIC_SAMPLE_DATA=0`, `preview` and `e2e` set `1`; screens made only of sample figures show a day-one state, the rest read the account's own data; onboarding shows only what the engine finds; real accounts keep the orb at rest; weigh-ins are stored one a day as `weight-YYYY-MM-DD`; nothing to install or migrate) | ca4e9c4 | 839 tests with Postgres, app typecheck, iOS, Android and release web bundles, crawls of the release web build empty and filled |
| 21 Nov, ~02:45 UTC | `claude/project-thread-8i27bq` (fast-forward after a merge of integration: the orb breathes in its news state as it does at rest, while the lit area dots pulse in turn) | 471ae8f | 839 tests with Postgres, app typecheck, iOS and Android bundles |
| 21 Nov, ~02:55 UTC | `fix-sign-in-limits` (fast-forward, fix F-11: hourly limits on sign-in codes per email and network address and on guesses, counted in Postgres as keyed hashes, Better Auth's burst limits in the same table, an `auth alert` log line on many failed codes, the phone's longer-pause words; migrate the API database for `0006_sign_in_limits`) | b697f71 | 852 tests with Postgres, app and API typecheck, iOS, Android and release web bundles |
| 21 Nov, ~02:58 UTC | `fix-health-rationale` (fast-forward, fix F-25: Health Connect's rationale and Android's permission-usage alias open About with the privacy policy unfolded, through a check and an event in the app's Android module; nothing to install or migrate, and the Kotlin compiles on the first EAS Android build) | f95e6a4 | 856 tests with Postgres, app typecheck, iOS, Android and release web bundles |
| 21 Nov, ~03:05 UTC | `claude/project-thread-8i27bq` (fast-forward: the You tab shows your face, your photo or your initial with a thin ring when open; Your details can add, change or remove the photo, which stays on the phone in `services/profilePhoto.ts` and is never synced; no new native dependencies) | c749085 | 856 tests with Postgres, app typecheck, iOS and Android bundles |
| 21 Nov, ~03:10 UTC | `fix-lock-screen-nudges` (fast-forward, fix F-28: a move, deadline or habit from money or health, or whose name carries a money figure, tax form or health word, is nudged without its name; Android's nudge channel hides the text on a secure lock screen; erasing your data now removes the You tab's photo too) | see `git log` | 863 tests with Postgres, app typecheck, iOS, Android and web bundles |
| 21 Nov, ~03:15 UTC | `claude/project-thread-8i27bq` (fast-forward: the You tab's photo stays out of iCloud and computer backups, beside the database folder; the photo is stored by file name so updates keep it; a native iOS build is needed for it to take effect), plus a test update for the new backup helper | 8003423 | 863 tests with Postgres, app typecheck, iOS and Android bundles |
| 21 Nov, ~03:17 UTC | `claude/project-thread-9pucu2` (merged with integration, then fast-forward: the app opens on the intro again, as the opening tab is no longer hidden from the router; Welcome becomes a calm three-scene intro with no bounce, which Reduce Motion cross-fades and a screen reader holds still; review builds with the sample life can start from the beginning once per build (`EXPO_PUBLIC_FRESH_START`), never a real build; the TestFlight workflow, still run by hand only, gains a "start from the beginning" box) | 9bce4b8 | 863 tests with Postgres, app typecheck, iOS and Android bundles |
| 21 Nov, ~03:25 UTC | `fix-support-mail` (fast-forward, F-10's build work: Help's Email us and Report a number open a new email to `EXPO_PUBLIC_SUPPORT_EMAIL` with Life's version and the phone's system and nothing else about the person; without an address, which is every build until F-09, Help says support isn't connected) | see `git log` | 871 tests with Postgres, app typecheck, iOS, Android and web bundles |
| 21 Nov, ~03:50 UTC | `fix-billing-server` (fast-forward, F-20's server half: a signed RevenueCat webhook keeps Life's own `subscriptions` record, with no price, card or receipt; `GET /billing/status`; the export includes it; `BILLING_ENFORCED=1` makes AI, memory search and wearables need a trial or subscription, off by default; migration `0007_subscriptions` to run before deploying) | see `git log` | 887 tests with Postgres, API and app typecheck, iOS and Android bundles |

## Screenshots

`privacy`, `privacy-yes`, `consent-from-settings`, `profile`, `recap-share` (light).
