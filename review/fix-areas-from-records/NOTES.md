# F-38, first part: Home, Work and Health from what you tell Life

Branch `fix-areas-from-records`, from `v26-integration` at 943251f (after F-37). Fix list row F-38 (P1, Build).

## What was wrong

On a real account, Home, Work and Health always showed day one ("Nothing here yet"), even after someone told Life they live alone, that they're self-employed, or that the dentist is on 4 December. Plan already counted those ("4 things Life knows" under Home), so the area page contradicted it. Appointments and documents also lost their dates when filed, so nothing could say what was coming up.

## What changed

**Records keep their details.** `proposalRecord` now keeps every record kind's details (an appointment's or document's date as well as a bill's payee and amount), so they sync with the record.

**Each area from what you've told Life** (`apps/mobile/src/state/areaKnown.ts`, `AreaKnownV26` in `plan.tsx`). Once Life knows anything filed under Home, Work or Health, the area shows:
- the headline: the lead fact (Home: how you live; Work: how you work) and the next date, or "Dentist is next, in 13 days";
- coming up: appointments and documents still ahead, soonest first, counted in days when the day is known ("May 2027" stays a month);
- what Life knows: each record with the words it came from, and Change (opens What Life knows, where anything can be removed);
- Tell Life more (Talk).

Health keeps its Body card and "Wellness admin from what you've told Life, not medical advice." Rent stays in Money. Until Life knows something about an area, it keeps its day one, exactly as before.

**Dates without a year.** "Dentist on 1 November" said on 20 October is 1 November this year, and once that has passed it drops off Coming up (it stays in What Life knows). It never rolls forward to next year, so Life never shows a date nobody said.

The sample life (dev and review builds) is unchanged.

## Not in this part

The tools behind the areas (rent vs buy, bedrooms, bloodwork, invoices) still open their day-one state on a real account. Each needs its own real source, so the F-38 row stays open for them. Missions stay on Plan's "Ready when you are" list, not on the area pages, because the engine's categories don't map cleanly onto the six areas.

## Checks

- 968 tests pass with Postgres (9 new in `tests/launch/areas-from-records.test.ts`; two source checks in `empty-life.test.ts` updated).
- App and API typechecks are clean. iOS and Android bundles build.
- Screens checked in a web build with the sample off, from a life made by putting real sentences through Talk's rules (lives alone, boiler service, MOT, home insurance, self-employed, an interview, the dentist, rent). Pictures: `areahome.jpg`, `areawork.jpg`, `areahealth.jpg`, `plan.jpg`, and `contact-sheet.jpg`.

## For Edem

No decision needed.
