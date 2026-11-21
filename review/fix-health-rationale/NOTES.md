# Health Connect's question opens the privacy policy (fix F-25)

Branch `fix-health-rationale`, from `v26-integration` after the sign-in limits. It closes P1 item F-25, which Google's Health Connect policy asks for.

## What changed

Health Connect can open Life to show why it reads health data. Through Android 13 that comes from the link on its permission screen; from Android 14 it also comes from Android's privacy dashboard. Both land on Life's main activity, which used to open Today.

Life now opens **About with the privacy policy unfolded**, whether Life was closed or already running:

- The app's own Android module (`life-intelligence`) says whether Life was launched for this (`launchedForHealthRationale`). When Health Connect asks while Life is open, it sends a `healthRationale` event.
- `services/healthRationale.ts` listens for both, on Android only, and opens About with `open=privacy`.
- About reads that and starts with the policy open, instead of all three texts folded.

The policy's own words about Health Connect were already there.

## Screenshots

`about-privacy.light.jpg` and `about-privacy.dark.jpg`: About opened the way Health Connect opens it, scrolled to the policy. Taken from the release web build at `/you/settings/legal?open=privacy`, since the web has no Health Connect.

## Checks

- **Tests:** `tests/launch/health-rationale.test.ts` is new (4 tests). It checks that Health Connect's plugin adds both ways in, that the module recognises both, and that the app opens About with the policy. The full suite passes (856 tests with Postgres).
- **Typecheck:** clean.
- **Bundles:** the iOS, Android and web exports build.
- **Not yet run on a phone.** The Kotlin change is small, but it hasn't been compiled here, since this machine has no Android SDK. The first EAS Android build compiles it, and the on-device pass (F-32) should open Life from Health Connect's permission screen and from the privacy dashboard.

## For Edem

Nothing to decide.

## Known limits

- About opens at its top, with the policy unfolded under the three rows. On a small phone the policy's first lines may sit just below the fold. If Google's reviewer wants the policy to fill the screen at once, a policy-only page is a small follow-up.
