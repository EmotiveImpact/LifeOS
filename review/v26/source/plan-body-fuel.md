# Plan · Body · Fuel

Source content from the V23 board (the established screens). Tags in [brackets] are the old style names: t-display = big number, t-statement = two-tone sentence, t-title1 = title, btn = button, chip = chip.

## snap — Snap a meal  (Full screen · opens from Fuel → camera)
about: 110 | Unlocks at level 2 | Snap a meal | Point the camera at your food. life spots each item and estimates the portion, and you confirm or adjust before anything is logged. Barcodes work too. | ai.food(photo) → CoFID / USDA / Open Food Facts | Full screen
- [tnum] 9:41
- [row] Hold steady
- [span] Egg · ~50g
- [span] Salmon · ~120g
- [span] Avocado · ~50g
- [span] Rice · ~150g
- [row] Photo
- [row] Barcode
- [row] Type
- [button·icon] Take photo
- [t-callout] Portions are estimates. You can adjust them next.

## confirm — Confirm the meal  (Sheet · opens from after a snap)
about: 111 | Unlocks at level 2 | Confirm the meal | Each item with a portion slider; calories and protein update as you adjust. Nothing is logged until you say so. | FoodEntry { items[], confirmed } | Sheet
- [tnum] 9:41
- [button·icon] Close
- [v21-title] Lunch · 12:40
- [t-callout] This meal
- [t-title2] 642 kcal
- [t-callout] Protein
- [t-title2] 43g
- [t-callout] Estimate. Adjust anything that looks off.
- [t-body] Salmon
- [t-callout] 120g · 247 kcal
- [t-body] Rice
- [t-callout] 150g · 195 kcal
- [t-body] Avocado
- [t-callout] 50g · 80 kcal
- [t-body] Edamame
- [t-callout] 40g · 48 kcal
- [t-body] Egg
- [t-callout] 50g · 72 kcal
- [btn] Log meal

## fuel — Fuel  (Push · opens from Body → Fuel)
about: 112 | Unlocks at level 2 | Fuel | Today against targets set from your age, height, weight and activity. Switch on "Hide numbers" and it shows balance in words instead, with no calorie counts. | Mifflin-St Jeor × activity · CoFID · safety floors | Push
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Fuel
- [button·chipb] Hide numbers
- [t-callout] Energy
- [t-callout] 1420 of 2100 kcal
- [t-callout] Protein
- [t-callout] 82 of 100g
- [t-callout] Fibre
- [t-callout] 18 of 30g
- [t-callout] Water
- [t-callout] 1.2 of 2.5 L
- [t-title3] Today
- [button·t-callout] + Snap a meal
- [t-callout] 08:10
- [t-body] Oats, banana, milk
- [t-callout] 410 kcal · 16g protein
- [t-body] Salmon rice bowl
- [t-callout] 705 kcal · 49g protein
- [t-callout] 16:00
- [t-body] Greek yoghurt, berries
- [t-callout] 305 kcal · 17g protein
- [t-callout] Targets come from your details and activity. Calorie features are for adults only.

## mealresult — Meal, logged  (Push · opens from after confirming)
about: 113 | Unlocks at level 2 | New in v12 | Meal, logged | After you confirm, the meal gets a fit score (0–10) for how well it fits your targets today, never a moral judgement, plus one or two short tips. Hidden in "Hide numbers" mode. | NutritionInfo { macros, fitScore, tips } · Cal-AI shape
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Your meal
- [t-title2] Salmon rice bowl
- [t-callout] 705 kcal · logged just now
- [t-title2] 8
- [row] /10
- [t-callout] Protein
- [t-title3] 49g
- [t-callout] Carbs
- [t-title3] 62g
- [t-callout] Fat
- [t-title3] 28g
- [t-callout] Fibre
- [t-title3] 9g
- [t-callout] The score is about your targets today, not "good" or "bad" food.
- [t-title3] Why it fits
- [t-body] Protein: half of today's target in one meal
- [t-callout] Great on a training day
- [t-body] Fibre is still low for today
- [t-callout] Add veg or beans at dinner
- [t-callout] Tip

## cook — What can I cook?  (Push · opens from Fuel → What can I cook?)
about: 114 | Unlocks at level 2 | New in v12 | What can I cook? | Snap the fridge or cupboard (or just say what's in it), choose a dietary filter, and get three recipes that fit what's left of today's targets. | ai.food(photo, mode: ingredients) · dietary filters
- [tnum] 9:41
- [button·icon] Back
- [v21-title] What can I cook?
- [t-body] Found in your photo
- [t-callout] Chicken thighs, chickpeas, spinach, eggs, rice, black beans
- [button·chipb] Halal
- [button·chipb] Vegetarian
- [button·chipb] Vegan
- [button·chipb] High-protein
- [button·chipb] Dairy-free
- [button·chipb] Keto
- [t-callout] Fits what's left today: 680 kcal · 18g protein
- [t-title3] Chicken, chickpea and spinach stew
- [button·t-callout] 25 min · 610 kcal · 46g protein
- [button·tag] Halal
- [t-title3] Egg and black bean breakfast wrap
- [button·t-callout] 10 min · 480 kcal · 29g protein
- [button·tag] Halal

## mealplan — A week of meals  (Push · opens from Fuel → Week)
about: 115 | Unlocks at level 3 | New in v12 | A week of meals | A 7-day plan from your preferences, budget and targets, and a shopping list grouped by aisle. One tap logs a planned meal when you eat it. | mealPlan · shopping list
- [tnum] 9:41
- [button·icon] Back
- [v21-title] This week's meals
- [button·segm] Plan
- [button·segm] Shopping list
- [t-title3] Mon
- [t-callout] Breakfast
- [t-body] Overnight oats
- [t-callout] Lunch
- [t-body] Chicken stew
- [t-callout] Dinner
- [t-body] Salmon bowl
- [t-title3] Tue
- [t-callout] Breakfast
- [t-body] Egg wrap
- [t-callout] Lunch
- [t-body] Leftover stew
- [t-callout] Dinner
- [t-body] Chickpea curry
- [t-title3] Wed
- [t-callout] Breakfast
- [t-body] Greek yoghurt
- [t-callout] Lunch
- [t-body] Tuna salad
- [t-callout] Dinner
- [t-body] Turkey chilli
- [t-title3] Thu
- [t-callout] Breakfast
- [t-body] Overnight oats
- [t-callout] Lunch
- [t-body] Leftover chilli
- [t-callout] Dinner
- [t-body] Stir-fry
- [t-callout] Halal · about £38 for the week · fits 2,100 kcal / 100g protein

## sayit — Say what you ate  (Sheet · opens from Fuel → Say it)
about: 116 | Unlocks at level 2 | New in v12 | Say what you ate | "I had a chicken wrap and a latte": life turns speech into items to confirm. Transcription runs on the phone (whisper.rn), so your voice never leaves it. | whisper.rn on-device · ai.food(text)
- [tnum] 9:41
- [button·icon] Close
- [v21-title] Say what you ate
- [t-callout] Listening…
- [t-statement] I had a
- [t-statement] chicken wrap
- [t-statement] and a
- [t-statement] large oat latte
- [t-statement] around 1.
- [t-body] Chicken wrap
- [t-callout] 1 wrap · 520 kcal · 32g protein
- [tag] Edit
- [t-body] Oat latte, large
- [t-callout] 1 cup · 180 kcal · 4g protein
- [tag] Edit
- [t-callout] Your voice is turned into text on your phone. Nothing is recorded or sent.
- [btn] Log 700 kcal
- [btn] Say it again

## foodday — A day of food  (Push · opens from Fuel → a day)
about: 117 | New in v14 | A day of food | Every meal for one day, editable: tap a meal to change a portion or swap an item. The day’s targets show at the top, in “Hide numbers” mode as words. | FoodEntry[] · daily targets | Push
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Today’s food
- [t-title3] 1,640
- [t-callout] of 2,300 kcal
- [t-title3] 112g
- [t-callout] of 140g protein
- [t-title3] 21g
- [t-callout] of 30g fibre
- [t-callout] Breakfast · 08:10
- [t-body] Greek yoghurt, berries, oats
- [t-mono] 420
- [t-callout] Lunch · 12:40
- [t-body] Salmon rice bowl
- [t-mono] 705
- [t-callout] Snack · 16:00
- [t-body] Apple and peanut butter
- [t-mono] 285
- [t-callout] Dinner
- [t-body] Not logged yet
- [t-mono] —

## barcode — Scan a barcode  (Full screen · opens from Fuel → barcode)
about: 118 | New in v14 | Scan a barcode | Point at a barcode and the exact label loads from Open Food Facts. Choose the portion and it’s logged. Works offline for foods you’ve scanned before. | VisionCamera code scanner · openfoodfacts-js (data ODbL) | Full screen
- [tnum] 9:41
- [span] Point at the barcode
- [t-body] Oat milk, 1 L
- [tag] Found
- [t-callout] 250 ml · 120 kcal · 1g protein

## foodsearch — Search for a food  (Push · opens from Fuel → search)
about: 119 | New in v14 | Search for a food | When there’s no photo or barcode: type it. Results come from UK CoFID and Open Food Facts, with your recent and favourite foods first. | CoFID · USDA FDC · Open Food Facts | Push
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Find food
- [row] ⌕
- [t-body] banana
- [t-callout] Recent
- [t-body] Banana, medium
- [t-callout] 89 kcal · 1.1g protein
- [li] +
- [t-callout] Everything
- [t-body] Banana bread, slice
- [t-callout] 326 kcal
- [li] +
- [t-body] Banana, dried
- [t-callout] 346 kcal per 100g
- [li] +
- [t-body] Banana smoothie
- [t-callout] Pret · 240 kcal
- [li] +

## fuelhome — Fuel, at a glance  (Push · opens from Body → Fuel)
about: 120 | New in v17 | Fuel, at a glance | The Cal AI-style home for food: a big “left today” counter, protein, carbs and fat rings, water, and the day’s meals. One big + to snap, scan, say or search. In “Hide numbers” mode it shows words and balance instead. | Fuel home · CalorieRing · MacroRing · FoodEntry[] · targets from packages/core | Push
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Fuel
- [t-title1] 1,240
- [t-callout] left today
- [t-callout] Protein
- [t-mono] 112 / 140g
- [t-callout] Carbs
- [t-mono] 150 / 260g
- [t-callout] Fat
- [t-mono] 48 / 75g
- [t-callout] Eaten
- [t-title3] 1,060
- [t-callout] Burned
- [t-title3] +300
- [t-callout] Water
- [t-title3] 1.4 L
- [t-body] Breakfast · 420
- [t-callout] Yoghurt, berries, oats
- [t-callout] 08:10
- [t-body] Lunch · 640
- [t-callout] Salmon rice bowl
- [t-callout] 12:40
- [btn] Snap a meal
- [btn] Scan

## fuelgoal — Your food targets  (Push · opens from Fuel → Targets)
about: 121 | New in v17 | Your food targets | Set the goal (lose, keep or gain), a target weight and a pace, and life works out daily calories and macros from your body numbers and activity, showing the maths. Safe floors are built in: it won’t go below what’s healthy, and pace is capped. | Mifflin-St Jeor × activity · pace cap 0.25–0.75 kg/wk · safety floors (SPEC §3.5) | Push
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Targets
- [button·segm] Lose
- [button·segm] Keep
- [button·segm] Gain
- [t-callout] Target weight
- [t-title2] 70 kg
- [t-callout] Pace
- [t-body] 0.5 kg a week
- [row] Gentle
- [row] Steady
- [row] Faster
- [t-callout] About 9 weeks, so mid-January.
- [t-callout] Your body uses about 2,800 a day (from your height, weight, age and activity). 500 less loses about half a kilo a week.
- [t-body] Daily calories
- [t-callout] 2,300 kcal
- [t-body] Protein
- [t-callout] 140 g · 1.9 g per kg
- [t-body] Fibre
- [t-callout] 30 g

## savedmeals — Saved meals  (Push · opens from Fuel → Saved)
about: 122 | New in v17 | Saved meals | Meals you eat often, saved with one tap after logging. Re-log in one tap, with the portion adjusted. The quickest path for most days. | SavedMeal { items, defaultPortion } · quick log | Push
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Saved meals
- [t-body] Usual breakfast
- [t-callout] Yoghurt, berries, oats · 420 kcal
- [li] +
- [t-body] Salmon rice bowl
- [t-callout] From Itsu · 705 kcal
- [li] +
- [t-body] Chicken wrap
- [t-callout] Homemade · 560 kcal
- [li] +
- [t-body] Protein shake
- [t-callout] Whey + oat milk · 240 kcal
- [li] +

## fuelprogress — Food and weight, over time  (Push · opens from Fuel → Progress)
about: 123 | New in v17 | Food and weight, over time | Your weight trend beside your average intake, so you can see cause and effect, plus a month of days marked by how close you were to target (never red, never shamed). | weight trend × intake · adherence calendar | Push
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Progress
- [t-callout] Down since October
- [t-title1] 2.4 kg
- [t-callout] Avg 2,240 kcal
- [t-callout] November

## exerciseadd — Exercise, added back  (Push · opens from Fuel → Settings)
about: 124 | New in v17 | Exercise, added back | Choose whether workouts add calories back to today. Default is half, because watches tend to overestimate what you burn. Shown plainly so the counter never feels like magic. | active energy × 0.5 (default) · HKQuantityTypeActiveEnergyBurned | Push
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Exercise calories
- [t-body] Run · 35 min
- [t-callout] Watch says 410 kcal
- [t-callout] +205
- [t-body] Walk · 40 min
- [t-callout] Watch says 190 kcal
- [t-callout] +95
- [button·segm] None
- [button·segm] Half
- [button·segm] All
- [t-callout] Watches often overestimate, so half is the safer default.

## fuelplan — Your plan is ready  (Full screen · opens from end of food setup)
about: 125 | New in v17 | Your plan is ready | The Cal AI-style moment at the end of food setup: your daily targets and a line showing where your weight is heading and when you’d reach your goal at a safe pace. Adjust anything before you start. | food_target · projection from pace · Mifflin-St Jeor × activity | Full screen
- [tnum] 9:41
- [button·icon] Close
- [v21-title] Your plan is ready
- [t-title1] Your plan is ready
- [t-body] At half a kilo a week you’d reach 70 kg around
- [t-body] 14 January
- [t-body] .
- [t-callout] Calories
- [t-title3] 2,300
- [t-callout] Protein
- [t-title3] 140 g
- [t-callout] Fibre
- [t-title3] 30 g
- [t-callout] You can change your goal or pace any time. Targets never go below a healthy floor.
- [btn] Start

## weighin — Log your weight  (Sheet · opens from Fuel → Weight or Today)
about: 126 | New in v17 | Log your weight | One tap to log, with the trend (not the daily number) leading. Shows whether you’re on track for your goal date and how much the pace has changed. Can come from a smart scale automatically. | weight log · 7-day trend · projection to goal · HealthKit bodyMass | Sheet
- [tnum] 9:41
- [button·icon] Close
- [v21-title] Weight
- [t-callout] This morning
- [row] −
- [t-display] 73.8
- [t-callout] kg
- [row] +
- [btn] Log it
- [t-body] On track
- [tag] 14 Jan
- [t-callout] Trend: 74.0 kg, down 0.5 this week. A bit faster than planned, which is fine.

## labelscan — Scan a nutrition label  (Full screen · opens from Snap → Label)
about: 127 | New in v17 | Scan a nutrition label | Point at the label on the back of a pack: life reads per-100g values, asks how much you had, and logs it exactly. Better than a photo guess for packaged food. | VisionCamera + text recognition (on device) · per 100 g → portion | Full screen
- [tnum] 9:41
- [div] Nutrition
- [span] Energy
- [span] 412 kcal
- [span] Fat
- [span] 16 g
- [span] of which saturates
- [span] 3.1 g
- [span] Carbohydrate
- [span] 52 g
- [span] of which sugars
- [span] 21 g
- [span] Protein
- [span] 11 g
- [span] Salt
- [span] 0.4 g
- [div] per 100 g
- [span] Reading the label…
- [t-body] Granola, 45 g
- [t-title3] 185 kcal
- [button·segm] 30 g
- [button·segm] 45 g
- [button·segm] 60 g
- [button·segm] Other

## menuscan — What should I order?  (Push · opens from Snap → Menu)
about: 128 | Unlocks at level 3 | New in v17 | What should I order? | Snap a restaurant menu: life estimates each dish and ranks them by how well they fit what’s left of today, with a plain reason. Estimates, clearly labelled. | ai.food(photo, mode: menu) · ranked by remaining targets
- [tnum] 9:41
- [button·icon] Back
- [v21-title] From the menu
- [t-callout] You have about 1,240 kcal and 28 g protein left today.
- [t-body] Grilled chicken, rice and greens
- [tag] Best fit
- [t-callout] ~620 kcal · 48 g protein
- [t-body] Halloumi wrap
- [tag] Good
- [t-callout] ~710 kcal · 28 g protein
- [t-body] Beef burger and fries
- [tag] Over today’s budget
- [t-callout] ~1,150 kcal · 42 g protein
- [t-callout] Restaurant portions vary; these are estimates.

## fixwords — Fix it in your own words  (Sheet · opens from a logged meal → Fix)
about: 129 | New in v17 | Fix it in your own words | If the photo guess is off, just say what’s different: “half the rice, no sauce, extra chicken”. The items update in front of you and you confirm. Corrections teach life your usual portions. | ai.food(correction) · item diff · portion memory | Sheet
- [tnum] 9:41
- [button·icon] Close
- [v21-title] Fix the estimate
- [t-body] Half the rice, no sauce, and it was extra chicken.
- [t-body] New total
- [t-title2] 610 kcal
- [t-body] Rice
- [t-callout] 200 g → 100 g
- [t-mono] − 130 kcal
- [t-body] Teriyaki sauce
- [t-callout] 30 g → 0
- [t-mono] − 60 kcal
- [t-body] Chicken
- [t-callout] 120 g → 180 g
- [t-mono] + 95 kcal
- [btn] Looks right

## nutrients — Everything you ate today  (Push · opens from Fuel → Nutrients)
about: 130 | Unlocks at level 2 | New in v17 | Everything you ate today | Beyond calories and macros: sugar, salt, saturated fat and fibre against UK reference intakes, plus key vitamins and minerals. Calm bars, no red, with one suggestion when something is consistently low. | nutrients from CoFID / Open Food Facts · UK reference intakes
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Nutrients
- [t-body] Fibre
- [t-mono] 21 / 30 g
- [t-body] Sugar
- [t-mono] 48 / 90 g
- [t-callout] Free sugars: 22 g of 30 g
- [t-body] Salt
- [t-mono] 4.1 / 6 g
- [t-body] Saturated fat
- [t-mono] 14 / 20 g
- [t-callout] This week, on average
- [t-body] Iron
- [t-mono] 9.2 / 14.8 mg
- [t-callout] Low most days: add beans, lentils or greens
- [t-body] Calcium
- [t-mono] 820 / 700 mg
- [t-body] Vitamin D
- [t-mono] 3 / 10 µg
- [t-callout] Normal in winter: a supplement is advised Oct–Mar
- [t-callout] Reference intakes for adults (UK). Not medical advice.

## describeexercise — Describe a workout  (Sheet · opens from Fuel or Load → + Activity)
about: 131 | New in v17 | Describe a workout | No watch on? Just say what you did: “30 minutes of five-a-side, quite hard”. life estimates the effort and calories (MET-based) and adds it to Load and, if you choose, back to Fuel. | ai.extract(activity) · MET tables · Load | Sheet
- [tnum] 9:41
- [button·icon] Close
- [v21-title] Add activity
- [t-body] 30 minutes of five-a-side, quite hard
- [t-body] Football (five-a-side)
- [t-callout] 30 min · vigorous
- [t-body] Estimated
- [t-callout] ~330 kcal · load 9.5
- [t-body] Added back to Fuel
- [t-callout] Half: +165 kcal
- [btn] Add it

## weekbudget — Your week, not just today  (Push · opens from Fuel → Week)
about: 132 | Unlocks at level 3 | New in v17 | Your week, not just today | A weekly view: eat a bit more at Saturday’s dinner, and life gently balances the other days so the week still lands on target. No “you went over” red. | weekly budget · rollover (opt-in) · smoothing over remaining days
- [tnum] 9:41
- [button·icon] Back
- [v21-title] This week
- [t-callout] Week so far
- [t-title1] 11,240
- [t-callout] / 16,100
- [tag] On track
- [row] M
- [row] T
- [row] W
- [row] T
- [row] F
- [row] S
- [t-body] Saturday is a birthday dinner
- [t-callout] life will keep Sunday and Monday about 150 lighter, so the week still balances.
- [t-body] Carry unused calories to the weekend
- [button·icon] Carry over

## mealtiming — Meals and your sleep  (Push · opens from Fuel → Insights)
about: 133 | Unlocks at level 3 | New in v17 | Meals and your sleep | When you eat, matched with how you slept. Late, heavy dinners showing up in your sleep data is one of the clearest patterns life finds, and it says so with your own numbers. | meal times × sleep score · CorrelationEngine · eating window
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Meal timing
- [t-statement] When dinner ends
- [t-statement] after 21:00
- [t-statement] , you sleep
- [t-statement] 31 minutes less
- [t-statement] and your HRV is
- [t-statement] lower
- [t-statement] .
- [t-callout] Eating window, last 7 days
- [t-mono] Mon
- [t-mono] Tue
- [t-mono] Wed
- [t-mono] Thu
- [t-mono] Fri
- [t-mono] Sat
- [t-mono] Sun
- [row] 06:00
- [row] 15:00
- [row] 24:00
- [btn] Try finishing by 20:30 for two weeks

## foodquality — Food quality  (Push · opens from Fuel → Insights)
about: 134 | Unlocks at level 3 | New in v17 | Food quality | Not just how much, but what: the share of your food that’s whole or minimally processed versus ultra-processed, and how many different plants you ate this week (30 is a good target for gut health). | NOVA classification (Open Food Facts) · plant diversity count
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Food quality
- [t-callout] This week
- [row] Whole · 58%
- [row] Processed · 20%
- [row] Ultra-processed · 22%
- [t-body] Different plants
- [t-title2] 19
- [t-callout] / 30
- [t-callout] Herbs, nuts, seeds and spices all count.

## alcohol — Alcohol  (Push · opens from Fuel → Alcohol)
about: 135 | Unlocks at level 2 | New in v17 | Alcohol | Units this week against the UK guideline (no more than 14 a week, spread out, with drink-free days), and what drinking did to your sleep and readiness, from your own data. Logged in a tap or by saying it. | UK CMO guideline 14 units/week · sleep/HRV correlation
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Alcohol
- [t-callout] This week
- [t-title1] 9
- [t-callout] / 14 units
- [tag] 4 drink-free days
- [chipb] + Pint of beer
- [t-mono] 2.3
- [chipb] + Glass of wine
- [t-mono] 2.1
- [chipb] + Single spirit
- [t-mono] 1
- [t-body] After 4+ units, your HRV is 18% lower the next morning
- [t-callout] From 11 nights of your data.
- [t-callout] If you’re worried about your drinking, Drinkline: 0300 123 1110.

## quicklog — Log in two taps  (Sheet · opens from + on Fuel)
about: 136 | New in v17 | Log in two taps | The fastest path: recent foods, your usual meals, and quick-add calories when you just want a number down. Ordered by time of day, so breakfast things come first in the morning. | recent + frequent FoodEntry · time-of-day ranking · quick add | Sheet
- [tnum] 9:41
- [button·icon] Close
- [v21-title] Quick log
- [button·segm] Recent
- [button·segm] Usual
- [button·segm] Quick add
- [t-body] Oat flat white
- [t-callout] Pret · 140 kcal
- [li] +
- [t-body] Usual breakfast
- [t-callout] Yoghurt, berries, oats · 420
- [li] +
- [t-body] Banana
- [t-callout] 89 kcal
- [li] +
- [t-body] Protein bar
- [t-callout] Grenade · 220
- [li] +
- [t-body] Salmon rice bowl
- [t-callout] 705 kcal
- [li] +

## importfood — Bring your history  (Push · opens from Fuel → Settings → Import)
about: 137 | New in v17 | Bring your history | Coming from MyFitnessPal, Lose It or Apple Health? Import your past food and weight so life’s targets and patterns start from your real history, not from zero. | CSV import (MyFitnessPal, Lose It) · HealthKit dietary samples | Push
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Import
- [t-body] Your data stays yours. Imports are read once and stored on your phone.
- [t-body] Apple Health
- [t-callout] Food and weight from other apps
- [tag] Connect
- [t-body] MyFitnessPal
- [t-callout] Export a CSV, then pick it here
- [tag] Choose file
- [t-body] Lose It
- [t-callout] Export a CSV, then pick it here
- [tag] Choose file
