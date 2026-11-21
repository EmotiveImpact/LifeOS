# Store screenshots retaken, always in the morning (F-35)

Branch `fix-store-shots`, from `v26-integration` at 4c65264.

## What I found

F-35 asked for the store screenshots to be retaken if F-01 or F-20 changed a screen in them.

- **F-01 and F-20 didn't change any of the eight.** F-01 only changes real accounts, and the store set uses the sample life. F-20's Life Plus screen isn't in the set.
- **The clock was showing.** The shots took the time from whenever they were made. Phase 31's set said "Breakfast · 00:56" on the meal screen and "Before you sleep" on Today, which looks odd in a store listing.

## What changed

**The screenshot script fixes the phone's clock at 08:10 that morning in London**, whenever the shots are taken (`apps/mobile/scripts/store-shots.cjs`). Timers keep running, so screens still settle as usual.

**The set is retaken** in `review/phase-31/store/`, where `docs/launch/README.md` already points. Three of the eight changed:

- `1-today`: the morning card ("This morning, what's most important to you today?") in place of the evening one;
- `5-meal`: "Breakfast · 08:10";
- `7-plan`: the bottom bar's You tab shows the person's initial, as the app does now.

The other five, and Play's feature graphic, came out identical. The sizes are unchanged: 1320 × 2868 for the App Store, 1080 × 1920 for Play, and 1024 × 500 for the feature graphic.

## Screenshots

`contact-sheet.jpg` shows all eight App Store frames side by side. The full-size files are in `review/phase-31/store/`.

## Checks

- Built the sample web preview (`EXPO_PUBLIC_SAMPLE_DATA=1`) and ran the script against it.
- Compared every frame with Phase 31's set by eye.
- Checked the output sizes.

## For Edem

Nothing to decide. The script makes them again whenever a screen in the set changes.
