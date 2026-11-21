# Nudges keep money and health off the lock screen (fix F-28)

Branch `fix-lock-screen-nudges`, from `v26-integration` after the Health Connect fix. It closes P1 item F-28 and DPIA risk 10's further measure.

## What I checked

Life schedules every nudge on the phone, from one place (`dayNudges` in `packages/core/src/day/nudges.ts`). The server sends none yet. These are all the templates:

| Nudge | Before | Risk |
|---|---|---|
| Today's move, with a calendar | "You’ve got 20 free minutes. *{move}* fits." | The move's name |
| Today's move, without one | "Today’s move: *{move}*." | The move's name |
| A deadline | "*{thing}* is due tomorrow at 12:00." | The thing's name |
| A habit at risk | "One miss is normal. *{habit}* today keeps it going." | The habit's name |
| Things to recall | "2 things are ready to recall. It takes a few minutes." | None |
| The weekly recap | "Your week is ready to look back on." | None |
| Bedtime (only if you asked) | "Bedtime in 45 minutes." | None |
| The evening check-in | "What’s most important to you tomorrow?" or "Pick up where you left off?" | None |

No template held a figure of its own. The risk was the names: a mission such as "Claim your tax refund" or "Chase the referral", a step someone typed ("Pay £500 off the card"), or a habit ("Take your tablets").

## What changed

**Names from money or health stay off.** A move, deadline or habit is named only when both are true:

- it isn't from money or health. The phone knows a move's part of life from the mission or the plan it came from;
- its name has no money figure, tax form, money trouble or health word. `lockScreenSafe` checks this, with its word lists beside it.

Otherwise the nudge says the same thing without the name:

| Nudge | Without the name |
|---|---|
| Today's move, with a calendar | "You’ve got 20 free minutes. Your next move fits." |
| Today's move, without one | "Today’s move is ready when you are." |
| A deadline | "Something is due tomorrow at 12:00." |
| A habit at risk | "One miss is normal. Today keeps your habit going." |

Everything else keeps its name, so "Today’s move: Call Grandma Efua." still reads as before. Tapping a nudge opens the same screen either way.

**Android hides the text on a secure lock screen.** The nudge channel is now private: a locked phone shows that Life sent something, and the words appear once it's unlocked. iPhones already show previews only when unlocked, unless the person changes that.

**Documents.** The privacy policy says nudges never name a money or health matter, and the DPIA's risk 10 lists what's in place. The app's About text and the website were rebuilt.

## Screenshots

None. No screen changed: nudges show only in the phone's own notification list.

## Checks

- **Tests:** `tests/day/lockscreen.test.ts` is new (7 tests). It runs every template with 14 sensitive names and checks each nudge the day can send. The existing move test now uses a name that isn't sensitive. The full suite passes (863 tests with Postgres).
- **Typecheck:** clean.
- **Bundles:** the iOS, Android and web exports build.

## For Edem

Nothing to decide. If you'd rather every nudge stayed general, whatever it's about, that's a one-line change.

## Known limits

- **A medicine's own name isn't recognised.** A habit called "Take metformin" passes the word check. Android's private channel still hides it on a secure lock screen; on an iPhone with previews set to always show, it would show.
- **Deadlines have no source yet** (F-50), so no deadline nudge is sent today. The template is ready for when they do.

## Also on this branch

**Erasing your data removes your photo too.** The You tab's new photo lives on the phone outside the database, so "Erase" in Settings left it behind. The erase now removes it with everything else. `tests/launch/empty-life.test.ts` checks it.
