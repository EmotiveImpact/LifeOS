# Phase 26 · Real health readings

Branch `phase-26-health`, from `v26-integration` after the check-in drawer fixes (cde7742). Apple Health, Health Connect, WHOOP and Oura now feed Body. Nothing was read from a real phone or wearable account here: the phone readers are tested against the shapes the two libraries return, and WHOOP and Oura against stand-ins for their APIs.

## What was built

**The engine, finished for real days** (`packages/core/src/health`)
- **Reading windows** (`days.ts`). The first read goes back 60 days, plus 12 hours so the first night is whole. Later reads start from the day before the last one, so a late-syncing watch is caught.
- **Merging days.** A read replaces the days it covered and keeps the rest. Days older than 120 are dropped from the phone.
- **Wrist temperature.** A watch's overnight reading becomes a change against your own last 28 nights, once there are 7.
- **Stress through the day.** Half hours of heart rate while you're still, from the start of the life day.
  - A reading counts as still when fewer than 40 steps were taken in the 15 minutes before it and the 5 after, so the heart rate settling after a walk isn't stress.
  - A half hour counts when two of its readings are still, so a trip to the kettle doesn't lose it.
- **Body's numbers** (`body.ts`). One call gives readiness, its normal range, sleep, load, stress, signals and the week of each reading. Each part is empty when its readings are missing, never zero.
  - Your readiness normal now comes from your own last 60 days of scores. It replaces the fixed 60 to 70 once you have real readings. The sample life keeps the board's figures, as you asked.

**WHOOP and Oura through the life API** (`apps/api/src/wearables.ts`)
- Both connect on their own sign-in page (official OAuth). **Never Bluetooth.**
- The server keeps only the sealed tokens. Readings pass straight through to the phone and aren't stored.
- Sign-in is protected by a signed, single-use code that expires after 10 minutes.
- A token close to expiry is refreshed. A connection that's been revoked asks you to connect again; a service that's down makes the phone wait and try later.
- Disconnecting deletes the tokens and tells WHOOP or Oura to revoke them.

**The phone** (`apps/mobile/src/services/health`)
- **Readers.** Apple Health on iPhone (`@kingstinct/react-native-healthkit`) and Health Connect on Android (`react-native-health-connect`). Each phone bundle carries only its own.
- **Only with a yes.** Nothing is read without the recorded health yes. Only the kinds switched on in the yes and in Devices are asked for.
- **When it reads.** On opening, on coming back to the front, after connecting something, and at most every 15 minutes otherwise.
- **Whole or nothing.** If one source fails, nothing stored changes and the next read covers the same days again.
- **Where it lives.** Health stays in the phone's own encrypted state. Withdrawing the yes clears it and disconnects WHOOP and Oura.
- **Choosing a source.** When two devices disagree about a measure, Sources lets you pick which one wins from then on.

**The screens** (`screens/v26/bodyreal.tsx`)
- **Real readings.** Body, Readiness, Sleep, Load, Body signals, Stress and Sources draw from your readings once they arrive.
- **Missing parts.** A part with nothing yet says what it needs (for example "Needs heart readings from a watch or ring").
- **Before readiness starts.** It shows "Learning your normal" with how many of the 14 days are in.
- **Sleep stages.** Real readings give stage totals, not a timeline, so last night shows as one bar split by stage.
- **Charts.** A day with no reading is drawn as a gap, never as zero.
- **No sample numbers on a real account.** Body pages not yet drawn from readings say so plainly.
  - Before, a production build could show Ama's figures on Trends, HRV, Forecast and others.
- **Devices.** It now connects Apple Health or Health Connect, WHOOP and Oura, and shows "Connect again" when a wearable needs it.

## Screenshots

These are a web build with 60 days of made-up Apple Watch readings, put through the real phone pipeline (raw readings, then ingest, then Body).
- `body-1/2/3.light.png`, `body-1.dark.png`: Body. Readiness is below normal after a short week, there are 5h 50m of sleep debt, and last night is shown by stage.
- `readiness-1`: the four inputs against your own normal.
- `sleep-1`, `sleep-2`: tonight's bedtime, last night, the week against your need, and consistency.
- `load`: today against the sweet spot your readiness sets.
- `stress-1`: half hours while still, with the gaps where you were moving.
- `signals`: wrist temperature, breathing, resting heart rate and blood oxygen against your range.
- `sources`, `devices-1`, `later`, `body-learning` (9 days in), `body-none` (a yes, nothing read yet).

Sheets for a quick look: `v26-review/phase-26/body-real-light.jpg` and `body-real-dark-and-states.jpg`.

## For Edem to decide

1. **WHOOP and Oura developer apps (decision 8).** Register life with both, then put these in the API host:
   - `WHOOP_CLIENT_ID`, `WHOOP_CLIENT_SECRET`, `OURA_CLIENT_ID`, `OURA_CLIENT_SECRET` and `PUBLIC_URL`.
   - Redirect address for each: `${PUBLIC_URL}/wearables/whoop/callback` and `/wearables/oura/callback`.

   Until then their Connect buttons note your interest, as before.
2. **The sample figures (decision 2).** The sample life still shows the board's numbers, readiness 60 to 70 included, as you asked until production. Real accounts use the engine.
3. **Health sync switch.** Still design first. The server's `daily_health` table is ready but unused, so nothing about health leaves the phone.
4. **Readiness tuning.** The engine follows the spec. On the made-up data, a week a little short on sleep took readiness from the 60s to the low 40s. Real readings will show whether the spread needs softening; it's a constant in `readiness.ts`.

## Checks

- **`bun test` with Postgres: 643 pass, 0 fail.** New tests:
  - `tests/health/ingest.test.ts`: 11 (read windows, merging, wrist temperature, stress and the walk to the kettle)
  - `tests/health/body.test.ts`: 10 (nothing yet, learning, your own normal, a stale reading, sleep debt, load, illness, stress)
  - `tests/api/wearables.test.ts`: 10 (signed sign-in, sealed tokens, single use, refresh, reconnect, disconnect revokes)
  - `tests/phone/health.test.ts`: 8 (both libraries' shapes, only kinds switched on, backfill then incremental, a failed source loses nothing)
- **Typecheck** is clean for the app and the API.
- **Bundles.** The iOS, Android and web exports build. The iOS bundle carries the Apple Health reader only and Android the Health Connect one.
- **Native set-up** checked with `expo config`:
  - the Health permission text on iPhone;
  - the nine Health Connect read permissions;
  - Android's minimum version raised to 8.0 (API 26), which Health Connect needs.

## Libraries added (pinned)

- `@kingstinct/react-native-healthkit` 16.2.0 (MIT).
- `react-native-health-connect` 4.1.3 (MIT).
- `react-native-nitro-modules` 0.37.2 (MIT), the native bridge the Apple Health library requires.

The two health libraries are named in `IMPLEMENTATION_REFERENCES.md` and `vendor/REFERENCES.lock.md`. The bridge isn't named there because it's a required part of the first, so it's listed here for you to see. Reading health needs a development build; Expo Go and the web preview read nothing.

## Known limits

- **A wearable that's down delays everything.** Reads are whole or nothing, so an offline WHOOP also holds back the phone's own readings until it answers.
- **WHOOP's load.** Only WHOOP's sleep and recovery come in for now, so load needs heart rate from the phone or Oura. WHOOP cycles and workouts can follow.
- **A forwarded sign-in link** would still work within its 10 minutes. Tying it to the browser that started it can follow.
- **The WHOOP revoke address** is from their documentation and needs a check once the developer app exists.
- **Stress needs heart rate through the day.** Apple Watch samples it every few minutes; some bands sample less often, which leaves more gaps.
