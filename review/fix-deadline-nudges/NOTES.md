# F-50, deadlines: nudges from what you tell Life

Branch `fix-deadline-nudges`, from `v26-integration` at cc8ae93 (after F-38). Fix list row F-50 (P2).

## What was wrong

Settings has "Deadlines under 24 hours", on by default, and the day engine knows how to send one (Phase 29). But the app always passed it an empty list, so it never fired. Since F-38, records keep the dates people tell Life, so there is now a source.

## What changed

- `recordDeadlines` (`apps/mobile/src/state/areaKnown.ts`) reads the confirmed records: appointments and documents on a known day that is still ahead, and bills with a due day (the next one), within the week.
- The day plan passes them to the nudges (`nudgesFor` in `dayplan.ts`).
- A deadline can be all day (`allDay` in `packages/core/src/day/nudges.ts`): with no time said, the nudge names the day only ("Boiler service is due tomorrow."), so Life never shows a time nobody said. Timing still works from 09:00 that day, so it arrives the day before.
- Titles read naturally: "Boiler service", "Home insurance renewal", "MOT expiry", "Dentist", "Interview", the bill's payee.
- Privacy as F-28 set: health appointments and bills are private, so the lock screen says "Something is due tomorrow at 15:00." Other titles also pass the lock-screen word check.
- Nothing is sent for a month on its own ("MOT expires December 2026"), a date more than a week off, or an appointment that has passed.

Quiet hours, the daily cap for deadlines and the Settings switch all apply as before.

## Not in this part

Recall nudges still have no stored source (learning has no recall schedule yet), and Today's opening line on a real account is still plain. Both stay on the F-50 row.

## Checks

- 973 tests pass with Postgres (5 new in `tests/launch/deadline-nudges.test.ts`; the day engine's tests unchanged and passing).
- App and API typechecks are clean. iOS and Android bundles build.
- Notifications can't be seen in a web build, so this was checked through the day engine directly; on a phone it needs the F-33 device pass like every nudge.

## For Edem

No decision needed.
