# Real accounts start empty (fix F-01)

Branch `fix-empty-life`, from `v26-integration` after Phase 31. This was the one build fix blocking the beta: release builds started with Ama's life.

## What changed

**The starting life.** Release builds now start with nothing of anyone else's:

- no profile, Aim, records, people, habits, memories or body numbers (`apps/mobile/src/state/empty.ts`);
- the empty profile sets every "needs" flag off, so the engine never suggests a stranger's tax fix or hospital referral;
- erasing your data goes back to the empty life, not to Ama's.

Development builds keep Ama's life, as Edem asked. The build profiles now say so outright:

- `production` sets `EXPO_PUBLIC_SAMPLE_DATA=0`;
- `preview` and `e2e` set it to `1`, as the beta plan already described.

**Screens made only of sample figures.** I mapped every screen a real account can reach by tapping from the four tabs (a crawler on the release web build), then compared each one's text with the sample build. These still showed Ama's figures to a real account, and now show a day-one state with one way in, "Talk to Life", in the shape of the board's day-one Plan:

- Money, and the Money area;
- the Home, Work and Health areas (Health keeps its link to Body);
- the tax check, which is where Plan's first mission, "Find money you're owed", leads;
- the 30-day cash plan.

Others now show only what is real:

- **From Life** says nothing is new and keeps the weekly recap. The orb's dot no longer lights for a real account.
- **Routines** says nothing is running yet, and lists the two that start once Life knows the payday and bills.
- **The share card** says only what happened ("My first week with Life" until something does).
- **Missions** use the engine's own steps. The sample's P800 reference and £1,240 of kit are gone.
- **Body numbers** show your own, or a dash with what would fill it.
- **Add people** starts with typing a name. The contacts list was a sample: no phone contacts are read yet.
- **Writing your Aim** offers no suggestions, because they were Ama's ("from what Life already knows").
- **Ask about structure** uses the profit you tried, never £0.

**Onboarding**

- "I want to" shows Select until you choose, like the other two questions.
- The body steppers start from a typical figure (170 cm, 70 kg, 85 cm). Continue keeps the height and weight on screen. The optional waist is kept only if you change it. Untouched measures show "Add".

## Screenshots

The day-one screens, in light and dark. Each is a real account with nothing filed:

- Plan;
- the Money, Home, Health and Work areas;
- the tax check;
- From Life and Routines;
- Body numbers;
- Add people and Writing your Aim;
- the share card;
- onboarding's first question and body numbers.

Sheets: `empty-life-light.jpg` and `empty-life-dark.jpg`.

## Checks

- **Tests:** `bun test` with Postgres passes. `tests/launch/empty-life.test.ts` is new (20 tests).
- **Typecheck:** clean.
- **Bundles:** the iOS, Android and web exports build.
- **Crawls of the release web build with an empty life:**
  - all 203 routes: no crashes, no "NaN" or "undefined";
  - every screen reachable by tapping: no sample names or figures;
  - a second pass with a few things filed (a name, a city, an income, one record) does the same.

## For Edem

- **Phone contacts** (new F-39). Reading the phone's contacts needs `expo-contacts`, which isn't on the reference list. Should I add it? Until then people are typed in.
- **No new screens were designed.** The day-one state reuses the board's day-one Plan shape and words ("Nothing here yet."). If you'd like each area to look different on day one, that's a design pass.

## Known limits

- **Money, Home, Work and Health have no real source yet** (new F-37 and F-38). They stay in their day-one state after someone tells Life about them, until those pages read what was filed. Telling Life still files records, which show in What Life knows and feed the engine's missions.
- **Deep screens a real account can't reach by tapping still hold sample figures**, for example budget, net worth and rent vs buy. They open only from the pages above. A deep link could still reach them.
- **The Talk tab on the web plays a sample talk**, because the web has no on-device speech. It says so on screen. Phones use real speech.
