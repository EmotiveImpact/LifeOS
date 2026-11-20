# Engine maths: health, food and the day planner

Branch: `claude/project-thread-d9kohu`, cut from `phase-18-v26-learn`. Pushed, no pull request.

All of this lives in `packages/core` and is pure calculation: no screens were touched, so it merges cleanly beside the screen threads. Phase 26, 27 and 29 wire these functions into Body, Fuel, Today and Plan when they land.

## What was built

**Time zones and "today"** (`packages/core/src/time/zone.ts`, gap 14)
- One set of helpers for "what day is it for you", built only on `Intl.DateTimeFormat`, so it runs on Hermes with no extra library.
- Your day starts at 04:00 local, so a 01:30 log still counts as last night. Sleep belongs to the day you wake up on.
- Clock changes are handled both ways (the missing hour in March, the repeated hour in October), and 08:00 stays 08:00 after them.
- Travel: a jump of two hours or more counts as a time-zone move, and those nights are left out of the regularity score.

**Health** (`packages/core/src/health/`, Phase 26's core half)
- Your normal: median and spread over recent days, with sensible floors so one odd night doesn't swing it.
- Readiness, as SPEC §3.3 describes: HRV 40%, resting heart rate 25%, sleep 25%, breathing rate 10%, last 7 days against the last 60. It says "calibrating" until there are 14 days of data, so the empty state never shows a fake score. Each driver reports whether it helped or hurt and by how much, which feeds "Why this score?".
- Readiness normal range: computed from your own history, which replaces the 60 to 70 placeholder in decision 4.
- Sleep need, sleep debt (a 7-night ledger that pays back when you sleep longer), tonight's need, a bedtime plan, and a Sleep Regularity Index.
- Load: Banister TRIMP from heart rate or zone minutes, shown on the 0 to 21 scale, a daily sweet spot that moves with readiness, an 8-week view and the acute to chronic ratio.
- Stress through the day from heart rate against your resting rate, scored 0 to 3.
- Body signals: skin temperature, breathing rate, resting heart rate and blood oxygen, each against your own last 28 days. When two or more drift the wrong way together, that's the illness signal: life suggests taking it easy and points to NHS 111. It never diagnoses.
- Habit strength (gap 13): a rise towards automatic over about 66 days, a miss costs a little, two misses cost more, and at most three new habits at once.
- Raw samples from Apple Health, WHOOP or Oura are normalised, sleep sessions are stitched together, naps are spotted and days summarised.

**Food** (`packages/core/src/food/`, Phase 27)
- Daily targets: energy use (Mifflin-St Jeor plus activity from your real load), a calorie target that never asks for more than 1% of body weight lost a week, a safe floor, protein, fibre 30 g, fat share and the 14 units a week alcohol guide. Under 18s get no food targets at all, in line with the 18+ check.
- Meal fit score out of 10 (energy, protein, fibre, balance) with one or two short tips. It reproduces the board's 8.4 for Ama's lunch.
- A low-intake safeguard: a week under 1,200 kcal raises a gentle check-in, never a target.
- Recipe ranking by how well each fills what's left of today.

**Day planner and notifications** (`packages/core/src/day/`, Phase 29)
- Today's plan: one next move, two worth doing, the rest in Plan, each with a plain "why".
- The rules: a deadline inside 24 hours always comes first; low readiness allows one demanding move and moves the rest to tomorrow; feeling driven on a high day puts the bigger move first; three short nights bring the health stack, caffeine cut-off and nothing new after 20:00; drained shows only what's due this week, with no glimpses; payday, a hard day with little eaten, and a habit one miss from two each bring their card; illness points to NHS 111; a weekday that has felt heavy three weeks running is planned light.
- Learning what you actually do: a small Thompson-sampling model per kind of move and kind of day. Moves you keep doing rise, untried ones still get a chance, and old evidence fades. A nudge you keep ignoring slips down.
- Notifications: one a day at most from life, never between 21:00 and 08:00, the most important wins the day, and anything that would arrive too late to help is dropped rather than sent late. The cap follows the zone you're in when travelling. A permission you declined is asked about again at most once a month.

## Checks

- 149 new tests (time 21, health 83, food 20, day 25). Full suite: 242 pass, 0 fail.
- Mobile type check passes.
- iOS and Android bundles both build (8.8 MB each).
- Ideas ported from Atria (MIT) are credited in the file headers; Atria is already in `THIRD_PARTY_NOTICES.md`.

## Where the engine and the board disagree

These are the places where the real maths gives a different number from the design board. I kept the engine's answer in each case; the board's sample numbers can follow it when Phase 26 and 27 wire real data.

1. **Today's load (decision 2).** Load on the 0 to 21 scale isn't additive: two sessions are combined as effort first and then scaled, so 2.1 and 4.1 don't make 6.2. This settles the 11.4 versus 6.2 clash in favour of one number from the day's total effort.
2. **Sleep debt.** The ledger pays back when you sleep longer than you need, so Ama's sample week comes out at 89 minutes, against 130 on the board.
3. **Ama's food targets.** With her chosen goal (active, losing 0.5 kg a week) the engine gives 2,050 kcal against the board's 2,300, energy use 2,624 against 2,800, and protein 119 g against 140 g. The safe floor of 1,500 matches. These come from the same formula the app already uses, so the numbers agree across screens.
4. **Load sweet spot.** Without a history the default is 9.9 to 12.4, against 11 to 14 on the board. Once there are 14 days of real data it comes from your own usual load.
5. **Readiness may react slowly.** SPEC compares the last 7 days with the last 60. That's steady, but a sudden bad night moves the score less than some people expect. Worth tuning once real data comes in.

## Choices I made that you may want to change

- Your day starts at 04:00. It's a single constant, so it's easy to move.
- Reminders you ask for yourself (the bedtime reminder, 45 minutes before bed) go at the time you chose, even in quiet hours, and don't use up life's one a day.
- A wearable's own recovery score, when there is one, counts for 25% of readiness.
- Naps count at 90% towards sleep, and your sleep need learns from well-rested nights by meeting them halfway between 8 hours and your typical night, inside the NHS 7 to 9 hours (both from Atria).
- On a hard day, each load point above 10 adds 4 minutes to tonight's sleep need. That figure is ours, not from a study, so it's one to tune.

## Not done here

- Screens are untouched. The screen threads own them, and decision 2 has to be settled before real numbers go in.
- Spaced-repetition recall for lessons (FSRS) belongs with Learn, so it isn't in this branch.
- The branch name follows this session's rules rather than the `phase-NN-name` style; rename on merge if you prefer.
