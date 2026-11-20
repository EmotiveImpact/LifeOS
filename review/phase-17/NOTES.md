# Phase 17 · Fuel

Branch `phase-17-v26-fuel`, from `phase-16-v26-body`. 28 screens rebuilt to the V26 board: Plan · Body · Fuel.

## What was built
- **Two chapter files** on the Phase 14 pattern: `v26/fuel.tsx` (snap, confirm, Fuel, the logged meal, Fuel at a glance, a day of food, quick log, saved meals, search, barcode, label, menu, say it, fix in words) and `v26/fuelmore.tsx` (what can I cook, the week of meals, targets, your plan, progress, exercise added back, describe a workout, weigh-in, nutrients, the week's budget, meal timing, food quality, alcohol, import). `Fuel.tsx` only dispatches and keeps the under-18 guard and the camera-permission state. `FuelExtras.tsx` is gone. Routes are unchanged.
- **One food day for the whole app** in `src/state/fuel.ts`: `useFuelDay()` merges the sample diary (dev builds only) with what you log today, and works out eaten, burned, added back, the day's budget, what's left, water and macros. Today's Fuel tile, Body's Fuel card and every Fuel screen read it, so logging a meal moves all of them. Meals are kept per day.
- **Board-only figures** live in `src/state/fuel.ts`, never in a screen: where the camera tags sit, the item crops, recipes, the week of meals and its shopping list, what life heard you say, the oat milk barcode, the granola label, the menu, the week's budget, meal timing, food quality, alcohol, progress and the calorie floor.
- **Meals as photographs** wherever the board shows them. A meal you snap keeps its own photo; one you say, scan or search is a tinted card with its icon. `PhotoFill` gained a zoom so each item's thumbnail shows its own piece of the lunch photo, as on the board.

## Real use, not just looks
- **Snap** opens the phone's camera (the shutter) or your photos, keeps the picture with the meal and goes to Confirm. Confirm sets each portion on a slider and the totals follow. Log puts the meal on today; Edit on a logged meal saves changes.
- **Say it** finds the foods in what you typed or said and logs them. **Fix in words** understands half, no or without, double, extra or more, and less ("Half the rice, no egg").
- **Search** finds foods, sets a portion and logs it, or adds it to the meal you're confirming. **Quick log** has Recent, Usual and Quick add.
- **Saved meals**: save any logged meal from its menu, open one to preview it, and log it in one tap. A logged meal can also be removed from today.
- **Targets** works out your daily calories from what your body uses and your pace, never below 1,500 a day, and **Your plan** saves it. **Exercise added back** (all, half or none) changes the day's budget everywhere. **Describe a workout** turns "45 minutes of tennis" into calories and load from your weight.
- **Water**, **weigh-in**, **alcohol** (drinks per day), **the week of meals** (log tonight's dinner in one tap) and **import** (counts the rows of a CSV you pick) all save on the phone.
- **Hide numbers** (on Fuel's bar, or in Settings) turns every Fuel number into words: "More than half of today's energy is still to come."
- Real accounts (no sample life, `SHOW_SAMPLES` off) start with an empty day, a plain viewfinder with no tags, and no watch calories.

## Stubbed
- Recognising a meal returns the sample lunch's items for now; real recognition comes with the brain (Phases 24 and 25).
- Barcode, label and menu scanning need a camera library the app doesn't have yet (Track B). In dev builds they show the board's sample result; real accounts see a short "coming in the next camera update" note.
- Speech for Say it is native only; the web preview asks you to type.
- Import counts the rows in your file; it doesn't read them into the diary yet.
- Apple Health and Health Connect only note that you want them (Phase 26).
- "Try it for two weeks" on meal timing opens Experiments; nothing is scheduled yet.

## Differences from the board, and why
- **Numbers follow the seed** (owner decision 2). Today you've eaten 1,060 kcal (usual breakfast 420 plus the salmon bowl 640), the same figure as Today in Phase 14. The board shows 1,420 on one screen and 1,060 on another.
- The day's budget is 2,300 plus half of today's 600 burned, so 2,600, with 1,540 left (board 1,240 left and "of 2,300"). Added back is shown plainly as "+300".
- Protein reads 73 g of 140 g from what's logged (breakfast 30 g, the bowl 43 g). The seed's older 112 g isn't used by any Fuel screen now.
- Today's exercise is Body's morning walk and ride to work plus moving about, so Fuel and Body agree (board: a 35-minute run and a 40-minute walk).
- An egg is 70 kcal in the seed now, so the bowl adds up to its 640.
- Today and Body changed to read the shared food day, so their Fuel figures match Fuel's.
- Added for reachability: the Fuel hub has a "More about your food" list (nutrients, timing, quality, alcohol, progress, the week, import), menu scanning has an "I'll have this" button that logs the best dish, and What can I cook shows each recipe's steps.
- The week's budget says Sunday will be about 150 lighter after Saturday's birthday dinner, worked out from the plan rather than the board's wording.

## Checks
- `npx tsc --noEmit -p .`: passes.
- `npx expo export --platform ios`: passes. `npx expo export --platform android`: passes.

## Screenshots
74 images, light and dark, named by board key, from a release web export with `EXPO_PUBLIC_SAMPLE_DATA=1` captured at 390×844, 2x (no simulator in a cloud session). Extra states: `confirm-portion` (a portion open), `fuel-words` (Hide numbers), `mealresult-saved` (a saved meal before logging), `foodsearch-banana`, `exerciseadd-none`, `exerciseadd-all`, `quicklog-logged`, and `today-fuel` and `body-fuel` showing the shared food day. Every screen rendered with no page errors. Sheets show as full pages on web, and the camera screens show the sample photo where the phone would show the live camera. Nothing has been tried on a phone yet.

## Open owner decisions (BUILD_V26.md section 0)
- Decision 2 (numbers that disagree on the board) is settled by the seed for Track A, as noted; it must be settled before Phase 26 wires real numbers.
- Decision 4 (Body accepted "for now") is unchanged; see Phase 16's notes.
