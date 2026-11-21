# Unlinked screens without sample figures (F-64)

Branch `fix-unlinked-samples`, from `v26-integration` after Life Plus at the end of setup joined. F-01 made real accounts start empty. This fix covers the screens it left: ones that nothing links to yet but still held Ama's figures, and the letter scan a real account could reach from Documents. Each now has a real or day-one state on a real account. Sample builds keep the board's versions.

## What changed

**Morning brief.** A real account's brief is built from what Life knows:

- last night's sleep from this phone, and how recovered the person is once there are enough readings;
- the day's first move, and how many more follow.

With nothing planned it says "Nothing planned yet. Tell Life what's going on and it plans the day." The greeting uses the person's name only when they've given one. The pretend Listen control, a 20-second waveform with nothing behind it, is gone until Life can read the brief aloud itself. The sample's sleep, bill, run and flat never show.

**The preview of Today's numbers** (Customise) shows what Today will show, which on a real account means this phone's readings, or a dash until there are some. Fuel shows what has been logged today.

**Documents and renewals.** Documents start empty for a real account, so the detail and renewal pages can only be reached from a link elsewhere. They now show the day-one shape:

- Tell Life about a document
- Talk to Life
- Scan a document

They never show the sample passport or the car insurance renewal.

**Scanning a letter.** "Scan a document" in Documents led a real account to the sample Lambeth council tax bill. It now opens the real choice of camera, photos or files, and takes what you pick into a chat, where Life reads it with you. Nothing is filed until you confirm. This is the same attach screen Talk already uses; only its heading and what happens afterwards change.

**Kept on purpose.** The camera's permission primer still shows a meal with its calories and protein, under the label "What Life would read · an example". It explains what the camera is for and doesn't claim to be the person's data.

## Screenshots

From the release web build (`EXPO_PUBLIC_SAMPLE_DATA=0`), a real account on day one, light and dark:

- `morningbrief`
- `customise` (Today's numbers)
- `docdetail` (the renewal page looks the same)
- `scan`

Each page was checked for Ama, Lambeth, Passport, Car insurance, "first home", "20-minute run" and Listen. None appeared.

## Checks

- **Tests:** `tests/launch/unlinked-samples.test.ts` is new, with 9 tests:
  - the brief's real version, its sources, and no sample words or Listen;
  - plain names and moves inside the brief's line;
  - the preview using real readings;
  - the documents' day-one state;
  - the real scan into a chat;
  - the primer's example label.
- **Full suite, typecheck and bundles:** see the integration notes for the join.

## For Edem

Nothing to decide. When Life can read the brief aloud on the phone (Phase 28's voice), Listen can come back with a real recording behind it.
