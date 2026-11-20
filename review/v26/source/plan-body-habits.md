# Plan · Body · Habits

Source content from the V23 board (the established screens). Tags in [brackets] are the old style names: t-display = big number, t-statement = two-tone sentence, t-title1 = title, btn = button, chip = chip.

## habits — Habits  (Push · opens from Body → Habits)
about: 138 | Unlocks at level 1 | Habits | Each habit has a tiny version and an "after… I will…" cue. Shows the last 14 days, rescues a miss before it becomes two, and checks how automatic it feels. | Habit { tinyVersion, cue, log, automaticity } | Push
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Habits
- [button·icon] New habit
- [button·button] +
- [t-statement] 3 habits,
- [t-statement] 2 done today
- [t-statement] .
- [t-statement] Water before coffee
- [t-statement] is close to automatic.
- [t-title3] In bed by 22:50
- [t-callout] After brushing my teeth, I will put my phone on the charger in the kitchen.
- [row] 11 of last 14 days
- [row] Day 12 · missed yesterday
- [t-callout] Never miss twice
- [t-body] You missed "In bed by 22:50" last night. Tonight, just aim for 23:15. That still counts.
- [button·chipb] Okay, 23:15
- [button·chipb] Skip tonight
- [t-title3] Water before coffee
- [tag] from Apple Health
- [t-callout] After the kettle boils, I will drink a glass of water, in the kitchen.
- [row] 13 of last 14 days
- [row] Day 41 · feels automatic 4/5
- [t-title3] 10 minutes of daylight
- [t-callout] After breakfast, I will step outside for 10 minutes.
- [row] 12 of last 14 days
- [row] Day 23
- [t-callout] Every 2 weeks
- [t-title3] How automatic does "10 minutes of daylight" feel?
- [button·chipb] 1
- [button·chipb] 2
- [button·chipb] 3
- [button·chipb] 4
- [button·chipb] 5
- [row] I have to remember
- [row] It just happens
- [t-callout] Habits take about 66 days on average to feel automatic, some sooner, some later (Lally et al., 2010). Missing one day doesn't reset you.

## habitnew — New habit  (Sheet · opens from Habits → +)
about: 139 | Unlocks at level 1 | New habit | Build it as a sentence: after an existing cue, I will do a tiny action, in a place. Start tiny, then grow it once it feels automatic. Up to 3 new habits at a time. | implementation intentions · Tiny Habits | Sheet
- [tnum] 9:41
- [button·icon] Close
- [v21-title] New habit
- [t-title1] Start tiny
- [t-body] Pick a moment that already happens every day, then attach something that takes under two minutes.
- [t-callout] Your habit
- [t-statement] After
- [t-statement] the kettle boils
- [t-statement] , I will
- [t-statement] drink a glass of water
- [t-statement] in the kitchen.
- [t-callout] After…
- [button·chipb] I wake up
- [button·chipb] the kettle boils
- [button·chipb] I sit at my desk
- [button·chipb] I brush my teeth
- [t-callout] I will…
- [button·chipb] drink a glass of water
- [button·chipb] do 2 push-ups
- [button·chipb] read one page
- [button·chipb] write one line
- [t-callout] Where
- [button·chipb] in the kitchen
- [button·chipb] at my desk
- [button·chipb] in the bedroom
- [t-body] Mark done automatically
- [t-callout] When Apple Health shows it (if it can)
- [button·icon] Auto-complete
- [btn] Start this habit
- [t-callout] You have 2 of 3 new-habit slots in use.

## strength — Habit strength  (Push · opens from a habit)
about: 140 | Unlocks at level 2 | New in v13 | Habit strength | Streaks punish one bad day. Strength doesn’t: it grows with every repeat and fades slowly when you miss, so one missed day costs a little, not everything. Habits take about 66 days on average to feel automatic. | HabitStrength (exponential average, forgives misses) · Loop habit idea (GPL, ideas only) · SPEC §11 #13
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Morning walk
- [button·icon] How strength works
- [t-callout] Strength
- [t-display] 71
- [t-display] %
- [tag] Day 38 of about 66
- [t-body] You missed Saturday
- [t-callout] Strength dipped from 73% to 71%. One walk today puts it back.
- [t-callout] Last 10 weeks
