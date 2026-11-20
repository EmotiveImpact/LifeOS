# Phase 16 · Body and Habits

Branch `phase-16-v26-body`, from `phase-15-v26-plan`. 38 screens rebuilt to the V26 board: Body (35) and Plan · Body · Habits (3).

## Reminder for the owner: Body was accepted "for now" (decision 4)
You accepted Body "for now" and asked to be reminded. Two things are still open:
- **The readiness normal range.** The 60 to 70 band is a placeholder (`state/body.ts`, `readiness.normal`) until the engine learns each person's range from 60 days (Phase 26).
- **Readiness and the band chart.** Body's readiness card uses the band chart (shaded normal, a dot a day, today largest). The Readiness screen follows the board instead: the score, a chip in the same words ("Above your normal"), then four readings, each drawn against its own shaded normal. Say if you'd rather the Readiness screen open with the same band chart as Body.

## What was built
- **Three chapter files** on the Phase 14 pattern: `v26/body.tsx` (Body, readiness, devices, sleep, load, trends, HRV, signals and the illness flag, stress, breathe, journal, insights, live workout, spotted workouts, sleep planner, how scores work, ask about your body, forecast, cycle), `v26/health.tsx` (fitness age, sources, glucose, the basics, one night, a past workout, weight, BMI, today's load, zones, breathing library, the number's receipt, regularity, load trend, the week) and `v26/habits.tsx`. `Body.tsx` and `Habits.tsx` only dispatch; `HealthDetails.tsx` (and its old `IllnessCard`) is gone. Routes are unchanged.
- **Small Body pieces** in `v26/bodykit.tsx`: chart heading, axis labels, "where you sit in your own range", range with your mark, ticks, the dotted receipt line, the big figure with small units and a small scale ("72/100"), photo dots. Charts measure their width so strokes never stretch.
- **Board-only figures** live in `src/state/body.ts`, never in a screen, and agree with `seed.health`: readiness week and normal, what drives it, last night in stages, the week of sleep, Monday night, regularity, the sleep plan, the forecast, load and zones, stress in half hours, body signals, journal effects, spotted workouts, the past run, fitness, sources, glucose, weight days, the cycle, trends, the week's digest, the habit-strength sample.
- **Body** keeps BUILD_V26's order: briefing, readiness on the band chart, Sleep, Load and Stress as slim tiles, last night as four tracks, why you're recovered (HRV 58 ms, resting heart rate 54 bpm, the same figures as Readiness), Fuel as a photograph below the recovery numbers, Tonight, one pattern, habits with their 14 dots.
- **Habits**: tonight's rescue in front (never miss twice: "Okay, 23:15" saves a gentler bedtime, Skip tonight hides it), the other habits as photographs with 14 days of dots, then the fortnightly "how automatic" question, which saves onto the habit. **New habit** is one sentence you finish: the place is blank until you tap one, and Start stays off until then. **Strength** draws every day so far in dots (today in ember, misses as quiet rings), the strength and this week's streak, "did it feel like you?" with Not really and Yes, and Done today in the footer. The bar's menu graduates a habit to a routine, or stops it.

## Real use, not just looks
- Saves on the phone: which health data life may read, devices you want, the sleep source when two disagree, water (+ Glass, + Bottle against the engine's water target), the stand-up walk, the evening journal (tags and your own), the breathing pattern and length, the sleep planner (wake time, how recovered, the reminder), the forecast bedtime, spotted workouts confirmed or dismissed (with undo), a finished workout, cycle-aware readiness (opt in and out), weight on Today, habit ticks, the rescue time, automaticity, "felt like you" answers, graduating or stopping a habit, and new habits.
- Breathe runs for real: the halo follows the chosen pattern (still under Reduce Motion), the timer counts down, and ending early says "Done for now."
- The live workout timer runs; End saves it and opens the workout.
- BMI and waist-to-height are worked out from your saved height, weight and waist. Weight's chart follows your latest weigh-in.
- Real accounts (no sample life, `SHOW_SAMPLES` off) see Body's empty state.

## Stubbed
- Every health reading is sample data until Phase 26 reads Apple Health, Health Connect, WHOOP and Oura. No device is connected; Connect and Pair only note that you want it.
- Habit strength for your own habits is a simple estimate from the last 14 days and the day count. The forgiving model (a miss costs a little, never the streak) is Track B (plan-gaps item 13).
- The weekly pattern's "Try it for two weeks" opens Experiments; nothing is scheduled yet.
- Ask about your body sends your question to the chat screen; answers come with the brain (Phases 24 and 25).

## Differences from the board, and why
- **Numbers follow the seed** (owner decision 2): today's load is 6.2 everywhere (the board's Body says 11.4), made of the morning walk (2.1) and the ride to work (4.1). HRV is 58 ms against a 52 ms normal on every screen (the board shows 62 on the receipt). Sleep need is 8h, so Monday's 7h 20m is 92% of need (board 94%) and the planner puts bedtime at 22:46 for a 07:00 wake. The week's four short nights add up to the seed's 2h 10m of debt. Water's target is the engine's (2.5 L; board 2.6).
- Seed values aligned to the board where nothing else used them: HRV 58 and its 52 baseline, breathing rate 14.8, fitness age 24.
- Spotted workouts end with "2 workouts saved to today" rather than a new load figure, because load isn't recomputed from them yet.
- The illness flag (`illness`) has no route of its own, so it opens from Body signals (`signals?state=illness`) and from the drift view's "What life changes on a day like this".
- New-habit slots count habits still being built: one that feels automatic (4 or 5 of 5) frees its slot. That matches the board's "2 of 3 slots in use" with three habits, one of them nearly automatic.
- Weight gained a quiet "BMI and waist, explained" link so BMI can be reached before Body numbers (Phase 19) is built.
- Today's load heading reads "Where you are" with "band = today's aim": the board's longer heading didn't fit a 390-wide phone beside its note.
- Strength's streak counts today only once it's done, so the sample shows a 3-day streak until you tap Done today (board 4).

## Checks
- `npx tsc --noEmit -p .`: passes.
- `npx expo export --platform ios`: passes. `npx expo export --platform android`: passes.

## Screenshots
86 images, light and dark, named by board key, from a release web export with `EXPO_PUBLIC_SAMPLE_DATA=1` captured at 390×844, 2x (no simulator in a cloud session). Extra states: `body-empty`, `signals-drift`, `illness`, `cycle-on`, `habits-rescued`, `habitnew-filled`. Every screen rendered with no page errors. Sheets (journal, provenance, habitnew) show as full pages on web, and flows draw no status bar, so photographs run to the top edge. Nothing has been tried on a phone yet.

## Open owner decisions (BUILD_V26.md section 0)
- Decision 4, above: the readiness normal range and whether Readiness opens with the band chart.
- Decision 2 (numbers that disagree on the board) is settled by the seed for Track A, as noted; it must be settled before Phase 26 wires real numbers.
