# Real accounts start empty (fix F-01)

Branch `fix-empty-life`, from `v26-integration` after Phase 31 and the new orb and docked search. This was the one build fix blocking the beta: release builds started with Ama's life.

## What changed

**The starting life.** Release builds now start with nothing of anyone else's:

- no profile, Aim, records, people, habits, memories or body numbers (`apps/mobile/src/state/empty.ts`);
- the empty profile sets every "needs" flag off, so the engine never suggests a stranger's tax fix or hospital referral;
- erasing your data goes back to the empty life, not to Ama's.

Development builds keep Ama's life, as Edem asked. The build profiles now say so outright:

- `production` sets `EXPO_PUBLIC_SAMPLE_DATA=0`;
- `preview` and `e2e` set it to `1`, as the beta plan already described.

**Day one.** I mapped every screen a real account can reach by tapping from the four tabs (a crawler on the release web build), then compared each one's text with the sample build. These were made only of Ama's figures, and now show a day-one state with one way in, "Talk to Life", in the shape of the board's day-one Plan:

- Money, and the Money area;
- the Home, Work and Health areas (Health keeps its link to Body);
- the tax check, which is where Plan's first mission, "Find money you're owed", leads;
- the 30-day cash plan;
- this month's gambit and the earned glimpse, whose suggestions were Ama's;
- the health stack (Ama's supplements, and "your last test was low");
- ask through a lens, whose answers were worked from Ama's rebate;
- your body clock, which showed Ama's result before any questions.

**Past day one.** A second pass used an account with a few things filed: a name, a city, an income, two records, an Aim, meals on three days and three weigh-ins. These now read that account's own data:

- **Plan** shows the engine's open missions, and how many things Life knows in each area. The sample's rent rise, invoices, council tax request and heart referral are gone. Nothing shows as waiting on a reply until Life can track one.
- **Your Aim** shows your own words and today's move from your missions. It no longer borrows Ama's deposit progress.
- **Fuel:**
  - the week shows what you logged each day, then your target;
  - progress shows your own weigh-ins, your average from logged days, and how close each logged day was;
  - Weight draws only your weigh-ins. It now keeps one a day, so a trend can form;
  - meal timing shows your eating window. It no longer claims a link to sleep;
  - food quality gives the target and what counts, and says plants aren't counted yet;
  - quick log's Recent lists your own last meals.
- **From Life** says nothing is new and keeps the weekly recap. The orb rests for a real account.
- **Routines** says nothing is running yet, and lists the two that start once Life knows the payday and bills.
- **The share card** says only what happened ("My first week with Life" until something does).
- **Missions** use the engine's own steps. The sample's P800 reference and £1,240 of kit are gone.
- **Body numbers** show your own, or a dash with what would fill it.
- **Add people** starts with typing a name. The contacts list was a sample: no phone contacts are read yet.
- **Writing your Aim** offers no suggestions, because they were Ama's ("from what Life already knows").
- **Smaller things:**
  - Ask about structure uses the profit you tried, never £0;
  - the experiments offer "A fixed bedtime" instead of Ama's 22:45;
  - What can I cook starts on High-protein, not Ama's Halal;
  - Filed from chat points to What Life knows instead of Ama's council tax;
  - Your levels climbs toward your own Aim, not Ama's first home, and level-up no longer quotes her deposit;
  - the growth path no longer says you've kept a payday sweep for three months;
  - Values offers five to start from, to put in your own order, instead of calling them your sorted top five;
  - an empty Documents page says "Nothing here yet" instead of "No to act on. No sorted."

**Onboarding.** Every new account passes these, so they mattered most:

- **Building your plan** showed Ama's findings: £840 back from HMRC for 2024/25. It now lists only what the engine finds from your answers, and says "Nothing urgent" when that's all there is.
- **Your first move** said your payslip shows an emergency tax code. It now starts where the day-one Plan does: "Find money you're owed".
- **The nudge example** no longer mentions Ama's P87 form.
- "I want to" shows Select until you choose, like the other two questions.
- The body steppers start from a typical figure (170 cm, 70 kg, 85 cm). Continue keeps the height and weight on screen. The optional waist is kept only if you change it. Untouched measures show "Add".

## Screenshots

Two sheets, in light and dark (`empty-life-light.jpg`, `empty-life-dark.jpg`):

- **Day one**, a real account with nothing filed:
  - Plan;
  - the Money, Home, Health and Work areas;
  - the tax check;
  - From Life and Routines;
  - Body numbers;
  - Add people and Writing your Aim;
  - the share card;
  - onboarding's first question and body numbers.
- **A few things filed:**
  - Plan and the Aim;
  - the gambit;
  - Fuel's progress, week, meal timing and food quality;
  - quick log.

## Checks

- **Tests:** `bun test` with Postgres passes. `tests/launch/empty-life.test.ts` is new (36 tests).
- **Typecheck:** clean.
- **Bundles:** the iOS, Android and web exports build.
- **Crawls of the release web build:**
  - all 203 routes with an empty life: no crashes, no "NaN" or "undefined";
  - every screen reachable by tapping, empty and with a few things filed, including inside Plan's collapsed sections: no sample names or figures;
  - every onboarding screen, compared line by line with the sample build.
  - The only sample text left is the Talk tab's sample talk on the web, which says so on screen.

## For Edem

- **Phone contacts** (new F-39). Reading the phone's contacts needs `expo-contacts`, which isn't on the reference list. Should I add it? Until then people are typed in.
- **No new screens were designed.** The day-one state reuses the board's day-one Plan shape and words ("Nothing here yet."). If you'd like each area to look different on day one, that's a design pass.

## Known limits

- **Money, Home, Work and Health have no real source yet** (new F-37 and F-38). They stay in their day-one state after someone tells Life about them, until those pages read what was filed. Telling Life still files records, which show in What Life knows and on Plan's area tiles, and feed the engine's missions.
- **The Aim has no measure of progress** (new F-58), so it shows no percentage, and the gambit and glimpse wait for one.
- **Fuel's insights need real sources** (new F-59): plant counts, processing, and late meals against sleep.
- **A few screens nothing links to yet still hold sample figures**, for example the morning brief and the preview of Today's numbers. So do the passport and car insurance examples behind an empty Documents page, and the letter scan, which labels itself a sample. Only a deep link reaches them (new F-64).
- **The widget, watch and lock-screen previews show the sample.** They are previews of surfaces the native build adds later.
- **The Talk tab on the web plays a sample talk**, because the web has no on-device speech. It says so on screen. Phones use real speech.
