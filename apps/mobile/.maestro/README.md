# Maestro flows

End-to-end flows for Life on a phone or simulator (BUILD_V26 Phase 30). They tap what a person taps, by the words on
screen or a field's test id, so they double as a check that every control has a name.

| Flow | What it proves |
|---|---|
| `onboarding.yaml` | First open to Today: age check, first question, where you live, health and nudges left for later, an Aim, the plan, keeping everything on the phone. |
| `talk-file.yaml` | Talk, stop, review what Life heard, file it all, Undo offered. |
| `snap-meal.yaml` | Fuel, Snap a meal, choose a photo, check the portions, log it. |
| `lesson.yaml` | Teach me tax codes from the tax check: bites, the guess, the puzzle, the recap, telling it back, the gap. |
| `sync/` | Two phones, one account: phone A adds someone, phone B signs in and finds them. |

`common/` holds the shared steps (a whole first open, signing in by email, getting past today's prompt).

## The build they run against

The flows expect Ama's sample life, so use a build with `EXPO_PUBLIC_SAMPLE_DATA=1` that opens straight into the app
(not the development launcher). The `e2e` profile in `eas.json` makes one: an iOS simulator build and an Android APK.

```sh
eas build --profile e2e --platform ios      # or android
maestro test .maestro                        # the four flows in config.yaml
maestro test .maestro/lesson.yaml            # one flow
```

On a phone without on-device speech (simulators, most emulators), Talk plays its labelled sample talk, which is what
`talk-file.yaml` files. On a phone with speech, it listens instead, and the flow needs someone to speak.

`snap-meal.yaml` adds `media/meal.jpg` to the device and picks it in the system photo picker. The picker's labels
differ between OS versions: if the pick step fails, check the newest photo's label with `maestro hierarchy`.

## Two phones

`sync/run.sh` starts the local API, a small reader for the sign-in codes the local API prints (`sync/codes.js`, which
reads that log and nothing else), then runs phone A and phone B in turn. It needs two booted devices with a
development build pointing at `http://localhost:8787`, and a Postgres set up as in `review/phase-21/NOTES.md`:

```sh
DEVICE_A=<udid> DEVICE_B=<udid> MIGRATE_URL=postgres://owner@… DATABASE_URL=postgres://life_api@… .maestro/sync/run.sh
```

## Checked here, without a device

`tests/phone/maestro.test.ts` checks that every file a flow runs exists and every id it taps is a `testID` in the app.
Each flow was also replayed step by step against the web preview of the same code (labels, ids and the path through
the screens); the device-only steps (permissions, the system photo picker, the sign-in code reader) were skipped there.
