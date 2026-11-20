# Phase 27 · Food

Branch `phase-27-food`, from `v26-integration` at the Life naming change (3da3bc8), then joined after the orb's return (272e485). Meals can now be read from a photo by Life's AI, packs looked up by barcode in Open Food Facts, and nutrition labels read from a photo. A real account's targets come from the food engine and the body profile. No real photo was sent to a real model here: the providers are tested against stand-ins, and the screenshots use a stand-in Life API.

## What was built

**Targets from what's stored** (`packages/core/src/food/plan.ts`)
- **The plan row.** `food_target` (goal, target weight, pace, exercise added back) becomes the engine's goal. Pace is kilos a week, never below 0 or above 1, and the engine caps it again at 1% of body weight.
- **The body profile.** Age, sex at birth, height, weight and activity. Anything missing is named, so the screen can ask for exactly that.
  - Without sex at birth, the midpoint of the two formulas is used with the higher floor of the two, and the screen is told it was assumed.
- **Evidence from health.** A watch's active energy over the last 14 finished days (at least 7) beats the activity level you chose. Without it, usual Load and steps over 28 days are used. Today is left out because it isn't over.
- **Exercise added back.** Today's measured active energy, with only the part above your usual day coming back when what you use already counts it.
- **Under 18.** No calorie targets at all.

**Barcodes and Open Food Facts** (`packages/core/src/food/foodfacts.ts`, `apps/mobile/src/services/food.ts`)
- **Check digit first.** EAN-13, EAN-8, UPC-A and GTIN-14 are checked before any lookup, so a misread code never leaves the phone.
- **UPC-A and EAN-13.** A 12-digit code is also tried with a leading zero, and the other way round.
- **Only the code goes.** The phone asks Open Food Facts for one product by its code and only the fields Life reads. Nothing about you is sent. The phone names itself as `Life/1.0` with the repo link, as Open Food Facts asks.
- **Read with care.** kJ becomes kcal, sodium becomes salt, the first brand is kept, and drinks are per 100 ml. Anything missing or odd is "not found", never a product with zero calories.
- **Portions.** Around one serving when the pack gives one (two thirds, one, four thirds), otherwise 50, 100 and 150 g or 150, 250 and 330 ml.
- **Credit.** Every product sheet ends "Food facts from Open Food Facts, under the Open Database Licence."

**Photos to the vision model** (`packages/brain`, `apps/api`)
- **One photo, food job only.** A request may carry one JPEG, PNG or WebP photo, and only for the `food` job. Anything else is refused before any model.
- **Never stored.** The photo travels inside the request, goes to the vision model as an image beside the words, and is gone when the answer comes back. The usage ledger holds no trace of it. No file storage was needed.
- **Each provider.** Anthropic gets an image block, OpenAI an input image (with `store: false`), Google inline data. Jobs without a photo are sent exactly as before.
- **Size.** Photos are made small on the phone (longest side 1,280 px, JPEG quality 70, about 130 KB in the test run). The API refuses a body over 3.5 MB with "too large".
- **Checked answers.** A meal comes back as items with grams and figures per 100 g; a label as figures per 100 g or 100 ml. Each set must add up: parts no heavier than the whole, sugars within carbohydrate, saturates within fat, and energy within 25% (meals) or 35% (labels) of what its protein, carbohydrate, fat and fibre give.

**The phone** (`screens/v26/fuel.tsx`, `fuelmore.tsx`, `state/fuel.ts`)
- **Snap.** Choose or take a photo, then Life asks "Send this photo to Life's AI?" for that one photo. Only after the OK does it go. The photo stays in view behind the sheet while it's read, then the parts open for you to check.
  - A part the model gave no figures for keeps its name and amount, says "No figures yet" and is left out of the total until you add them.
  - Private mode, or a build with no Life API, never sends a photo: you add the parts yourself.
- **Barcode.** On iPhone the camera reads EAN-13, EAN-8 and UPC-E. Everywhere, you can type the numbers. A found product opens with its portions; an unknown one offers "Read the label instead".
- **Label.** Photograph the nutrition table, give the same OK, and the figures open as a product credited to your photo, with "Check it against the pack".
- **Targets on a real account.** Fuel, Fuel at a glance, Today's food, Today's Fuel tile, Body's Fuel card and the meal result use the engine's figures.
  - Without height or weight, there are no targets at all, never the sample's. Fuel says "Add your height and weight and Life works out your targets. What you log still counts", with a way to Body numbers, and the tiles show what's eaten so far.
- **The targets screen** shows the engine's maths for the goal and pace you're choosing: what your body uses, the change for your pace, your own floor, protein and fibre. When the floor or the 1% cap slows the pace, it says so.
- **Meal result.** The fit score and tips come from the engine against this meal's share of the day.
- **The sample life is unchanged.** It keeps the board's figures (2,600 budget, fit 8.4, sample bowl, oat milk and granola) unless real health readings arrive, as you asked.

## Screenshots

390 × 844. Every screen is here in light, and seven in dark (`fuel-no-targets`, `fuel-real-1`, `mealresult-fit-1`, `snap-ask`, `snap-confirm`, `barcode-found`, `label-found`); the dark sheet has all of them. Real-account screens use a development web build with no sample life and a stand-in Life API that answers like the real one; Open Food Facts answers are stand-ins too.
- `fuel-no-targets`, `fuelhome-no-targets`: a real account with no height yet and two meals logged.
- `fuel-real-1/2`: the same account with its details, on the engine's 2,200 kcal.
- `mealresult-fit-1/2`: the lunch scored against its share of the day, with tips.
- `fuelgoal-real-1/2`: losing half a kilo a week towards 70 kg, with the engine's maths.
- `snap-ask`, `snap-reading`, `snap-confirm`, `snap-confirm-2`: a photo of a bowl, the OK for that photo, reading, then four parts to check (one with no figures yet).
- `barcode-typed`, `barcode-found`, `barcode-missing`: a typed oat drink code found in Open Food Facts, and a code it doesn't know.
- `label-ask`, `label-found`: a label photo, the OK, then the figures as a product.
- `sample-fuel`, `sample-barcode`, `sample-mealresult`: the sample life, unchanged.

Sheets for a quick look: `v26-review/phase-27/food-light.jpg` and `food-dark.jpg`.

## For Edem to decide

1. **Android barcode scanning.** The iPhone reads barcodes with VisionCamera alone. Android needs its ML Kit plug-in (`react-native-vision-camera-barcode-scanner`), which isn't in the plan's library list, so I didn't add it. Until then Android types the code. Say yes and I'll add it, pinned.
2. **Photos inline, never stored.** A meal or label photo goes inside the request and is never kept, so no file storage (R2 or S3) is needed for food. If you'd like photos kept with meals on the server later, that's a separate choice with its own consent.
3. **Open Food Facts from the phone.** The phone asks Open Food Facts directly, sending only the code. Going through the Life API instead would hide the phone's address from them but adds a hop; I'd keep it direct.
4. **Libraries added.** VisionCamera 5.2.4 (named in the plan) and Nitro Image 0.15.2, which VisionCamera requires. Both MIT and pinned.
5. **The sample figures.** The sample life keeps the board's food numbers, as you asked until production.

## Checks

- **`bun test` with Postgres: 719 pass, 0 fail.** New tests:
  - `tests/food/plan.test.ts`: 17 (reading the stored rows, evidence from health, targets, missing details, under 18)
  - `tests/food/foodfacts.test.ts`: 18 (check digits, UPC-A and EAN-13, reading products, portions, labels, meals from a photo, energy checks)
  - `tests/brain/food-photo.test.ts` and `tests/api/food-photo.test.ts`: one photo, food job only, each provider's image format, the ledger holds no photo, too large refused
- **Typecheck** is clean for the app and the API.
- **Bundles.** The iOS, Android and web exports build. The camera scanner is in the iPhone bundle only.
- **The stand-in run** confirmed the photo arrives as a JPEG of about 170,000 base64 characters, with the OK for that request and no facts or memories beside it.

## Known limits

- **Height, weight and age on a fresh account** still start from the sample's until the empty life for beta 1 lands. Once they start empty, Fuel asks for them as shown.
- **Search by name** in Open Food Facts isn't wired yet; Search still uses Life's own food list.
- **Barcode scanning needs a development build.** Expo Go and the web preview type the code.
- **Model accuracy** on real plates is untested here. Portions are labelled estimates and nothing is logged until you confirm.
