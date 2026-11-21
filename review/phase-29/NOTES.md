# Phase 29 · The day engine, notifications and the outside of the app

Branch `phase-29-day-engine`, from `v26-integration` at the Phase 27 join (b5b6d8c). The planner, the learner and the notification cap already existed as maths from the engine thread. This phase gives them real inputs, puts them on Today, and adds the phone's side: local nudges, the calendar (read only) and background work.

Nothing here has run on a real phone yet. Notifications, the calendar and background work need a development build. The web preview has none of them.

## What was built

**Today's moves from what you have** (`packages/core/src/day/candidates.ts`, `apps/mobile/src/state/dayplan.ts`)
- **Where moves come from:**
  - each priority on today's plan offers its next unticked step;
  - missions you've started and not finished;
  - birthdays and anniversaries inside a week (never memorial dates);
  - habits not done yet today.
- **Nothing is made up.** A real account with nothing planned or started has no moves.
- **What you chose comes first.** A step from your own plan gets a boost as big as a deadline's urgency, and says "On your plan for today."
- **The shape of the day:**
  - readiness, sleep over three nights and the illness signal come from Body, only with a health yes and readings;
  - today's mood comes from Pulse;
  - habits one miss from a second come from Habits;
  - "For your Aim" tags moves when the Aim is about money or a home.
- **What you tend to do** is learned from the moves you take or pass (Thompson sampling, per kind of move and kind of day).
  - It is kept only on this phone.
  - It grows with evidence. With nothing learned yet, the rules alone decide, so a new life isn't shuffled at random.
  - Draws repeat all day, so Today's order holds still.

**Today on a real account** (`screens/v26/dayengine.tsx`, `today.tsx`)
- **The deck.** The board's move deck now holds the engine's moves:
  - the chip says where each move came from and how long it takes;
  - the line under the title names the priority it serves.
- **Take or pass.** Each choice is remembered for the day and teaches the learner. "Choose again" clears the day's choices.
- **Opening line.** It comes from the plan, for example "3 moves today, starting with Sign in to Government Gateway", or "Nothing's pressing today" when there's nothing.
- **Continue** opens the mission, Habits or Your people, or the step's own screen. A step with no screen starts on Today with a Done.
- **"Why am I seeing this?"** lists the rules that shaped today, then each move's reasons, and what Life has learned once it has seen enough.
- **Body tiles show your own numbers, never the sample's.**
  - With readings, they come from the engine.
  - Without, they show a dash and what's needed.
  - The link says when Health was last read, or "Connect".
- **Coming up and the Aim card.** Coming up lists dates from Your people in the next 60 days. The Aim card shows your Aim without the sample's percentage.
- **The sample life is unchanged.** It keeps the board's three moves.
- **Day one is unchanged.** Talk to Life stays the first move until something is filed.

**Notifications** (`core/day/nudges.ts`, `services/notifications.native.ts`, `services/nudges.ts`)

| Kind | When | Words |
|---|---|---|
| Today's move | The first free stretch it fits, 09:00 to 19:00, or 12:30 without a calendar | "You've got 20 free minutes. Finish the P87 fits." / "Today's move: Call Grandma Efua." |
| Deadline | 24 hours before, or now if that has passed | "Your car insurance is due tomorrow at 12:00." |
| Habit rescue | 18:00 | "One miss is normal. Morning walk today keeps it going." |
| Recall | 12:00 | "One thing is ready to recall. It takes a minute." |
| Weekly recap | Sunday 18:00 | "Your week is ready to look back on." |
| Bedtime | 45 minutes before tonight's bedtime from Sleep | "Bedtime in 45 minutes." |
| Evening question | 20:00, as your check-in style says | "What's most important to you tomorrow?" |

- **The cap.** One nudge a day at most. A deadline under a day sits beside it (SPEC: "max 1 nudge/day + time-critical deadlines"). The bedtime reminder is yours, so it never uses up the day's one.
- **Quiet hours** come from Settings (21:00 to 08:00 unless you change them), and switching them off is honoured.
- **Your switches.** Kinds switched off in Settings never come. Recall starts off, as the board shows.
- **Planned again from scratch** whenever the day changes: a plan, a tick, a habit, a mood, a setting. It also replans when the app opens or comes to the front, and from the background.
  - What already went out today counts towards the cap.
  - A small log on the phone keeps the last fortnight, for the cap and for fatigue.
- **Quiet and private.** No sound, no badge, and an Android channel called "Nudges".
  - Nothing about your day goes to a server to be sent back: the phone schedules its own.
  - A nudge never carries a health or money figure, so a locked screen stays general. The primer's example nudge on a real account now reads like a real one, without the £ figure. The sample keeps the board's line.
- **A tap opens the screen the nudge names.** Opening a move nudge is remembered, so moves you open aren't held back as ignored.
- **Push tokens** go to the server (`/push/register`) only when you're signed in and the build has an EAS project id. There's no project id yet, so nothing is sent.

**Calendar, read only** (`services/calendar.native.ts`)
- After the primer's yes and the phone's own prompt, Life reads only start and end times.
  - Titles, places, notes and people are never read into Life.
  - Free, cancelled and all-day events don't count as busy.
- **Android.** Write access is blocked in the build (`blockedPermissions`), and the unused Reminders text is removed on iPhone.
- **"Your day"** on a real account shows today's busy and free stretches, times only, and marks where Life will nudge.
  - Without a yes, it explains and offers to ask.
  - On the web, it says the calendar works on your phone.

**Background work** (`services/background.native.ts`, `core/day/jobs.ts`)
- **One task, at most every 15 minutes.** The phone decides exactly when. Each wake does only what's due:
  - health, with your yes;
  - sync, when you're signed in;
  - the nudges for today and tomorrow. This one step covers the morning plan, the evening question, habits, recall, the recap and birthdays.
- **Registered only while needed.** The task is registered while nudges or health reading are on.
- **Nothing written over.** Anything background work saves is marked, and the app reloads it on coming to the front.
- **Failures wait.** A job that fails (a locked phone, no connection) waits for the next wake.

**Permissions on screen** (`firstopen.tsx`, `settings.tsx`)
- **The primers ask the phone.** "Turn on nudges" and "Allow calendar access" now ask the phone itself. A no is remembered.
- **Settings, Notifications** offers "Turn on nudges" when they're off. When the phone has them off for Life, it says so, with Open Settings.

## Screenshots

These show a real account (a release web build with no sample life), 390 × 844, light and dark. The sheets are in project files: `v26-review/phase-29/day-light.jpg` and `day-dark.jpg`.
- `today-real-top`: a planned day's opening line and plan.
- `today-real-deck`: the deck from the plan.
- `today-real-chosen`: after taking two moves and passing one.
- `today-real-body`: Body tiles with no readings yet.
- `today-real-unplanned`: nothing planned and nothing known.
- `why-real`: "Why am I seeing this?"
- `calendar-web`: Your day in the web preview.
- `notifs-off`: Notifications with nudges off.
- `notifprimer-real`: the primer's example nudge.
- `sample-today`: the sample life, unchanged.

## Widgets, Live Activity, watch and Siri: not built, for Edem

- **Widgets and the Live Activity.** `expo-widgets` (Expo SDK 58, MIT, part of expo/expo) builds iPhone widgets and Live Activities from Expo UI.
  - It needs `@expo/ui` and an App Group (for example `group.app.life.os`) set up on the Apple Developer account.
  - It can only be checked with Xcode on a Mac.
  - My proposal: a small widget with today's move and Readiness, and a Live Activity for a started step ("Pick up where you left off", with Done).
  - The data for both already exists (`buildDay`).
- **Watch and Siri** need native Swift targets: a watch app, and App Intents for Siri and Shortcuts.
  - Expo has no first-party way. The usual route is `@bacons/apple-targets`, which isn't in the reference list.
- **Until then**, the UI previews in `outside.tsx` stay as they are.

## For Edem to decide

1. **Deadlines beside the daily nudge.** I read the SPEC's "max 1 nudge/day + time-critical deadlines" as deadlines under a day sitting outside the one-a-day cap, up to three a day. Say if you'd rather they share the one.
2. **Widgets and the Live Activity.** Set up an App Group on the Apple Developer account and say yes to `expo-widgets` with `@expo/ui`, pinned. I'll build them.
3. **Watch and Siri.** Add `@bacons/apple-targets`, or keep both for after launch.
4. **Push.** Server push needs an EAS project id in the app config. Local nudges work without it.
5. **The primer's example** on real accounts drops the £ figure, so no nudge ever shows money on a locked screen.
6. **Background health reading** uses the same yes. HealthKit's own background delivery stays off (`background: false`), so readings arrive when iOS wakes Life and the phone is unlocked.

## Checks

- **`bun test` with Postgres: 743 pass, 0 fail.** The new file `tests/day/dayengine.test.ts` has 24 tests:
  - free time from busy times;
  - moves from the plan, missions, dates and habits;
  - what you chose comes first, also with nothing learned;
  - every nudge's words and times, switched-off kinds, and no health or money figures;
  - the phone's schedule: one a day, deadlines beside it, quiet hours you set, the bedtime reminder;
  - fatigue, the day's random draws, and background jobs.
- **Typecheck** is clean for the app. The API is unchanged.
- **Bundles.** The iOS and Android exports build, and both include the background task.
- **Libraries.** expo-notifications 58.1.9, expo-background-task 58.0.13, expo-task-manager 58.0.14, expo-calendar 58.0.8 and expo-device 58.0.5 (all MIT, Expo SDK 58, pinned), credited in `THIRD_PARTY_NOTICES.md`.

## Known limits

- **Deadlines and recall** have no stored source yet: renewals and bills don't carry dates, and there are no recall cards. Their nudges are built and tested, and stay quiet until those exist.
- **Habits and people** on a fresh account start from the sample until the empty life for beta 1. Only birthdays and anniversaries are dated.
- **Today's opening line on a real account** is simple. It doesn't yet weave in the sample's richer briefings (payday, council tax).
- **On-device checks to do on a development build:** the permission prompts, delivery at the planned times, a tap opening the right screen, and background wakes.
