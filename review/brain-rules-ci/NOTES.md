# Brain safety rules, filing schema and CI

20 November 2026 · branch `claude/project-thread-yniozi`, from `phase-18-v26-learn` · wave 1, thread E of `v26-review/parallel-plan.md`

## In short

- **Crisis check.** A proper crisis-language check now runs before anything else in chat, Talk filing and the lesson tell-back, with its own set of 149 cases (97 that must be flagged, 52 everyday phrases that must not be). It never calls a model, and Talk and tell-back open the `support` screen.
- **Talk can file real life.** Bills, subscriptions, birthdays and anniversaries, people, document expiries and appointments, on top of the old eight profile facts. A model's proposal is now accepted when everything in it appears in the words it quotes, so a model can file what the patterns missed but still can't invent anything.
- **One output shape per job.** Drafts, lessons, tell-back analysis, Show me, meal photos and a new `read-document` job each have a checked shape. Drafts and lessons may now use dates, reference numbers and small counts that come from what you said.
- **Standing AI consent.** A revocable OK by job and by where the model runs, so cloud answers don't need a fresh OK every time. Health details need a grant that names health.
- **Router tiers.** Jobs start at fast, strong, top or vision; chat climbs to strong for careful work and to top for big decisions. A tier table (the future `tiers.json`) moves jobs and orders models, and allowances are checked before any model call.
- **Release plumbing.** `eas.json` with development, preview and production profiles, `expo-updates` configured, and CI on every push: typecheck, all tests, and the iOS and Android bundles.

Checks: typecheck clean, `bun test tests/` 312 pass (was 93), iOS and Android bundles export. All three were run here; the first GitHub run didn't start (see item 1 under "Needs Edem").

## What was built

### Crisis-language check · `packages/brain/src/safety.ts`

- Covers suicide, self-harm, overdose, worry about someone else, and feeling unsafe at home. Two levels: concern and urgent (a plan, a method, the means to hand, a time, or harm already done).
- Reads typed text and speech the same way: masked spellings (k\*ll, su1cidal), spaced letters, stretched letters, and speech without apostrophes (cant, dont). Common idioms are removed first (killing myself laughing, suicide squad, overdosed on chocolate).
- A denial still gets support ("I'm not suicidal but…"). A miss costs far more than a false alarm.
- Scanned all 5,354 strings of board and seed copy: no false alarms.
- The fixed replies match the board's `support` screen: Samaritans 116 123, Shout 85258, NHS 111 (mental health option), 999. Feeling unsafe adds the National Domestic Abuse Helpline (0808 2000 247) and the silent 999 option (press 55). Each reply carries the lines with ready `tel:` and `sms:` links and `route: '/states/support'`.
- It runs before input validation, so a very long message in distress still gets support.
- Case set: `tools/evals/crisis/cases.jsonl`. Add a line to add a case.

### Filing schema · `packages/brain/src/proposals.ts`, `jobs.ts`

- `Proposal` gains six record kinds (`bill`, `subscription`, `date`, `person`, `document`, `appointment`) with typed `details`. Old proposals still load unchanged.
- A proposal passes when its quote appears in what you said (or a file you shared), and every number, name, month and "how often" in it appears in that quote. Questions and hypotheticals never pass. Profile facts keep their old limits (age 18 to 120 and so on).
- The rules now file, offline: "Kofi's birthday is 3 March", "My council tax is £142 a month, due on the 1st", "Netflix is £10.99 a month", "My passport expires in August 2027", "I have a dentist appointment on 4 December at 3pm", "My sister is called Efua".
- Only `ask`, `extract` and `read-document` may propose changes; coaching and explanations can't.
- In the app, the new kinds become `FiledRecord`s of kind `fact` with their own ids, so they confirm and become memories through the existing flow.

### Standing consent · `packages/brain/src/consent.ts`

- A grant records when, which jobs (or all), which places (server, cloud), whether it covers health, and the policy version. It expires after 12 months, lapses when `CONSENT_POLICY_VERSION` changes, and revokes at once; revoked grants stay as the record of what was agreed.
- Health records and Body memories are now marked `sensitivity: 'health'` in the app's brain context, so they only leave the phone under a grant that names health or that request's own OK.
- Private mode still keeps everything on the phone whatever was granted.

### Router tiers · `packages/brain/src/router.ts`

- Starting tiers: extract and chat fast; coach, plan-explain, draft, lesson, analyse, Show me and read-document strong; food vision. A photo or scan for read-document goes to vision.
- Chat goes to strong for "explain", "step by step", long messages, shared files or long threads, and to top for big decisions (job offers, moving, buying or renting, mortgages, redundancy, divorce, tax and benefits).
- The tier table is validated before use. Within each place (phone, then server, then cloud), models are tried in the table's order, so the next model answers when the winner is down.
- A used-up top allowance drops to strong and tells the person; any other used-up tier stops before a model is called.
- The 45-second model timeout can be set per run (`timeoutMs`), and a timed-out model leaves nothing changed.
- `fitContext` trims old messages, then the least relevant memories, for the phone's small window (Apple's on-device model is set to 8,000 characters). It never cuts a document; it skips the phone instead.

### Release plumbing

- `apps/mobile/eas.json`: `development` (dev client, internal), `development-simulator`, `preview` (internal, Android APK), `production` (store, build number from EAS). Each sets an update channel, an EAS environment, and `EXPO_PUBLIC_APP_ENV`.
- `expo-updates@58.0.22` added; `runtimeVersion` uses the fingerprint policy; updates check on launch and apply next time. Updates stay off until an update URL exists (see below), so nothing changes for the TestFlight build.
- `.github/workflows/ci.yml`: on every push and pull request (screenshots and Markdown-only changes skipped), typecheck plus `bun test tests/`. The iOS and Android bundles run in parallel on pull requests, pushes to `master` and manual runs, so branch pushes cost one job of Actions minutes, not three. No secrets used.

## Files outside `packages/brain`

Kept small, and away from the lines other threads are changing:

- `apps/mobile/src/services/ai.ts`, `local.ts`: Talk filing goes through the crisis check first and returns `support`.
- `apps/mobile/src/services/brainState.ts`: the new kinds map to records.
- `apps/mobile/src/services/brainContext.ts`: health marking.
- `apps/mobile/src/services/brain.ts`: the phone model's context size.
- `apps/mobile/src/screens/v26/talk.tsx` (two places) and `teach.tsx` (one line): distress opens `support` instead of filing or grading.
- `apps/mobile/app.json`: `runtimeVersion` and `updates`, added above the `ios` block so they don't touch `supportsTablet`.
- `apps/mobile/package.json`, `package-lock.json`, `eas.json`, `.github/workflows/ci.yml`, `vendor/REFERENCES.lock.md`.

## For whoever merges

- `Tier` gains `top`. `Field` gains six kinds. `Proposal` gains optional `details`. `Request` gains optional `grants`; `Fact` and `Memory` gain optional `sensitivity`. `ModelAdapter` gains optional `tiers` and `maxContextChars`. `runBrain` gains an optional fourth argument `{ route, now }`. All additive.
- Chat (`ask`) now starts in the fast tier; it was strong. The route label on rules answers changes to match.
- Model proposals no longer have to equal a rules finding.

## Needs Edem, or another thread

1. **GitHub Actions minutes.** The first CI run (20 Nov, 18:18) failed in two seconds on all three jobs with no runner assigned and no log, while the same action pins and `ubuntu-latest` ran fine in the TestFlight workflow on 17 Nov. That pattern means GitHub refused to start the jobs, which on a private repository is almost always the monthly Actions allowance or spending limit (macOS runs for TestFlight count ten times). On GitHub, open Settings, then Billing and licensing, then Usage, and raise the Actions budget or wait for the monthly reset. The workflow itself is fine; re-run it from the Actions tab once minutes are available.
2. **Expo account and project** (decision 8). Run `eas init`, then `eas update:configure`: that adds the project id and update URL, and over-the-air updates switch on by themselves. Before the first EAS iOS build, run `eas build:version:set` to above TestFlight build 22.
3. **Settings toggle for standing AI consent.** The brain side is done; it needs a board design and your OK before a screen is built (Settings belongs to the Phase 19 thread).
4. **Onboarding "Just tell life"** (First open thread): distress now files nothing there, but the screen should also open `support`, as Talk does. One line.
5. **Chat bubble:** the support reply shows the numbers in text. A "Need support now" button on that bubble, opening the screen, is screen work and isn't done.
6. **Safeguarding review** of the crisis wording and rules before beta (SPEC 9.8). English only for now.
7. **Phase 21 and 24 server:** check consent against the server's own copy of the ledger, never the grants a request carries; write `tiers.json` from evals; feed real allowances to the router. The free-tier allowance (about 10 fast requests a day was suggested) is still your call.
8. **Force update:** the `forceupdate` screen's minimum-version check needs the API (Phase 21).
9. **Test and live API split:** `EXPO_PUBLIC_LIFE_API_URL` goes in each EAS environment once Phase 21 picks the host.
