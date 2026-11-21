# life — Every screen to build

> Generated from board v17 (`design-board/life-design-board-v17.html`). **This is the build checklist.** One row per board screen: build it, match the board, tick it. Nothing outside this list gets built; nothing on it gets redesigned.
> Open the board, find the screen by its key (each phone has id `s-<key>`), and match it: layout, copy, spacing, imagery, motion.
**224 screens** (221 from the board, plus the 18+ check and health consent from the gap list, and Life+ at the end of setup, which is the board's life+ as a full screen). Routes use expo-router; sheets use `presentation: 'formSheet'`, full-screen flows `fullScreenModal`. States are not routes: they're how their parent screen looks in that state.

Tick legend: `[ ]` not started · `[~]` built, needs polish · `[x]` matches the board in light and dark

V26 marker: **V26** after a screen's name means it has been rebuilt to the V26 board (`review/v26/board.html`, BUILD_V26.md Track A). The tick column still records the V23 build.


## First open (16)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `welcome` | Welcome **V26** | Full screen | first launch | `/(flows)/onboarding/welcome` · fullScreenModal |
| [x] | `agecheck` | Your date of birth (18+ check) **V26** | Full screen | Welcome, before setup (gap list, Edem 20 Nov) | `/(flows)/onboarding/agecheck` · fullScreenModal |
| [x] | `question` | One question at a time **V26** | Full screen | Welcome | `/(flows)/onboarding/question` · fullScreenModal |
| [x] | `tell` | Or just tell life **V26** | Full screen | Welcome → “Or just tell life” | `/(flows)/onboarding/tell` · fullScreenModal |
| [x] | `building` | Building your plan **V26** | Full screen | end of setup | `/(flows)/onboarding/building` · fullScreenModal |
| [x] | `where` | Where do you live? **V26** | Full screen | setup | `/(flows)/onboarding/where` · fullScreenModal |
| [x] | `signin` | Save your progress **V26** | Sheet | after the plan is built | `/(sheets)/signin` · formSheet |
| [x] | `healthconsent` | Your health data (consent) **V26** | Full screen | setup after where you live, Body, or Settings (gap list, Edem 20 Nov) | `/(flows)/onboarding/healthconsent` · fullScreenModal |
| [x] | `healthprimer` | Before Apple Health asks **V26** | Full screen | setup or Body | `/(flows)/onboarding/healthprimer` · fullScreenModal |
| [x] | `notifprimer` | One nudge a day, at most **V26** | Full screen | setup | `/(flows)/onboarding/notifprimer` · fullScreenModal |
| [x] | `micprimer` | Before the mic asks **V26** | Full screen | first Talk | `/(flows)/onboarding/micprimer` · fullScreenModal |
| [x] | `camprimer` | Before the camera asks **V26** | Full screen | first snap or scan | `/(flows)/onboarding/camprimer` · fullScreenModal |
| [x] | `calprimer` | Before the calendar asks **V26** | Full screen | setup or Calendar-aware day | `/(flows)/onboarding/calprimer` · fullScreenModal |
| [x] | `devicesetup` | Connect what you wear **V26** | Full screen | setup | `/(flows)/onboarding/devicesetup` · fullScreenModal |
| [x] | `firstmove` | Your first move **V26** | Full screen | end of setup | `/(flows)/onboarding/firstmove` · fullScreenModal |
| [x] | `measuresetup` | Your body, in three numbers **V26** | Full screen | setup, after where you live | `/(flows)/onboarding/measuresetup` · fullScreenModal |

## Tab 1 · Today (13)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `today` | Today (home) **V26** | Tab | tab bar | `/(tabs)/today` |
| [x] | `nudge` | Nudge **V26** | Card / notification | Today or Lock Screen | the Tax check (`taxcheck?state=code`) and Talk |
| [x] | `pulse` | Pulse **V26** | Sheet | Today check-in | `/(sheets)/pulse` · formSheet |
| [x] | `checkin` | Checking in **V26** | Sheet | Today | `/(sheets)/checkin` · formSheet |
| [x] | `customise` | Customise Today **V26** | Sheet | Today → edit | `/(sheets)/customise` · formSheet |
| [x] | `routines` | Your routines **V26** | Push | Today → routines | `/today/routines` |
| [x] | `why` | Why am I seeing this? **V26** | Sheet | “Why am I seeing this?” on any card | `/(sheets)/why` · formSheet |
| [x] | `calendar` | Calendar-aware day **V26** | Push | Today → day strip | `/today/calendar` |
| [x] | `morningbrief` | Morning brief **V26** | Sheet | first open of the day | `/(sheets)/morningbrief` · formSheet |
| [x] | `evening` | Close the day **V26** | Sheet | evening notification or Today | `/(sheets)/evening` · formSheet |
| [x] | `inbox` | From life **V26** | Push | bell on Today | `/today/inbox` |
| [x] | `search` | Search everything **V26** | Overlay | pull down on Today | overlay on Today |
| [x] | `focus` | Focus session **V26** | Full screen | Today or a calendar gap | `/(flows)/focus` · fullScreenModal |

## Talk and file (8)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `talk` | Talk **V26** | Full screen | hold the Talk button | `/(flows)/talk` · fullScreenModal |
| [x] | `understood` | Understood **V26** | Sheet | after Talk | `/(sheets)/understood` · formSheet |
| [x] | `ask` | Ask, then file **V26** | Full screen | Chat → a question | `/(flows)/ask` · fullScreenModal |
| [x] | `attach` | Attach **V26** | Full screen | + in Chat | `/(flows)/attach` · fade (owner feedback) |
| [x] | `scan` | Letter, understood **V26** | Full screen | + → Scan a letter | `/(flows)/scan` · fullScreenModal |
| [x] | `chat` | Chat **V26** | Full screen | tap the Talk button | `/(flows)/chat` · fullScreenModal |
| [x] | `chathistory` | Your conversations **V26** | Push | Chat → ⋯ | `/talk/chathistory` |
| [x] | `editfiled` | Edit what life filed **V26** | Sheet | tap any filed item | `/(sheets)/editfiled` · formSheet |

## Tab 2 · Plan (11)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `plan` | Plan **V26** | Tab | tab bar | `/(tabs)/plan` |
| [x] | `mission` | Mission **V26** | Push | any mission | `/plan/mission` |
| [x] | `draft` | Draft message **V26** | Sheet | a mission step | `/(sheets)/draft` · formSheet |
| [x] | `ttk` | Things to know **V26** | Push | Plan → Things to know | `/plan/ttk` |
| [x] | `history` | Missions history **V26** | Push | Missions → Cleared | `/plan/history` |
| ⏸ | `doitforme` | **Parked, don't build.** Do it for me | Sheet | “Do it for me” on a step or bill | `/(sheets)/doitforme` · formSheet |
| [x] | `missions` | All missions **V26** | Push | Plan → Missions | `/plan/missions` |
| [x] | `newgoal` | Add something **V26** | Sheet | + on Plan | `/(sheets)/newgoal` · formSheet |
| [x] | `areahome` | Area: Home **V26** | Push | Plan → Home | `/plan/areahome` |
| [x] | `areahealth` | Area: Health **V26** | Push | Plan → Health | `/plan/areahealth` |
| [x] | `areawork` | Area: Work **V26** | Push | Plan → Work | `/plan/areawork` |

## Your Chief Aim (4)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `aimnew` | Write your Aim **V26** | Full screen | setup or Plan → Aim | `/(flows)/aimnew` · fullScreenModal |
| [x] | `aim` | Your Aim **V26** | Push | Aim pinned on Plan | `/plan/aim/aim` |
| [x] | `gambit` | This month's gambit **V26** | Push | Aim → this month | `/plan/aim/gambit` |
| [x] | `glimpse` | A glimpse, earned **V26** | Full screen | earned, on Today | `/(flows)/glimpse` · fullScreenModal |

## Plan · Money (8)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `money` | Money **V26** | Push | Money area | `/plan/money/money` |
| [x] | `subs` | Subscriptions **V26** | Push | Money → Subscriptions | `/plan/money/subs` |
| [x] | `area` | Area: Money **V26** | Push | Plan → Money | `/plan/money/area` |
| [x] | `txn` | A payment **V26** | Push | Money → a payment | `/plan/money/txn` |
| [x] | `bill` | A bill **V26** | Push | Money → a bill | `/plan/money/bill` |
| [x] | `budget` | Budget **V26** | Push | Money → Budget | `/plan/money/budget` |
| [x] | `networth` | Net worth **V26** | Push | Money → Net worth | `/plan/money/networth` |
| [x] | `connectbank` | Connect your bank **V26** | Full screen | Money → Connect | `/(flows)/connectbank` · fullScreenModal |

## Plan · Documents and renewals (3)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `vault` | Documents and renewals **V26** | Push | Plan → Documents | `/plan/documents/vault` |
| [x] | `docdetail` | Passport **V26** | Push | Documents → a document | `/plan/documents/docdetail` |
| [x] | `renewal` | Renewal: car insurance **V26** | Push | Documents or Today, when it’s time | `/plan/documents/renewal` |

## The toolkit (13)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `cashplan` | 30-day cash plan **V26** | Push | Toolkit | `/plan/tools/cashplan` |
| [x] | `taxcheck` | Tax & NI check **V26** | Push | Toolkit or Money | `/plan/tools/taxcheck` |
| [x] | `income` | Income & structure **V26** | Push | Toolkit or Work | `/plan/tools/income` |
| [x] | `rentbuy` | Rent vs buy **V26** | Push | Toolkit or Home | `/plan/tools/rentbuy` |
| [x] | `blood` | Bloodwork reader **V26** | Push | Toolkit or Health | `/plan/tools/blood` |
| [x] | `protect` | Protection review **V26** | Push | Toolkit | `/plan/tools/protect` |
| [x] | `growth` | Growth path **V26** | Push | Toolkit | `/plan/tools/growth` |
| [x] | `bedrooms` | Your next home: bedrooms **V26** | Push | Toolkit or Home | `/plan/tools/bedrooms` |
| [x] | `buffer` | How big a buffer? **V26** | Push | Toolkit or Money | `/plan/tools/buffer` |
| [x] | `unlock` | Locked tool **V26** | Sheet | a locked tool | `/(sheets)/unlock` · formSheet |
| [x] | `decisions` | Bigger decisions **V26** | Push | Toolkit → Bigger decisions | `/plan/tools/decisions` |
| [x] | `tools` | All tools **V26** | Push | Plan → Toolkit | `/plan/tools/tools` |
| [x] | `healthstack` | Health stack **V26** | Push | Toolkit or Health | `/plan/tools/healthstack` |

## Body (35)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `body` | Body **V26** | Push | Plan → Body or Today’s body card | `/plan/body/body` |
| [x] | `devices` | Connect devices **V26** | Push | Body → Sources | `/plan/body/devices` |
| [x] | `readiness` | Readiness **V26** | Push | Body | `/plan/body/readiness` |
| [x] | `sleep` | Sleep **V26** | Push | Body | `/plan/body/sleep` |
| [x] | `load` | Load **V26** | Push | Body | `/plan/body/load` |
| [x] | `trends` | Trends **V26** | Push | Body | `/plan/body/trends` |
| [x] | `hrv` | Metric detail: HRV **V26** | Push | Readiness → HRV | `/plan/body/hrv` |
| [x] | `signals` | Body signals **V26** | Push | Body | `/plan/body/signals` |
| [x] | `stress` | Stress today **V26** | Push | Body | `/plan/body/stress` |
| [x] | `breathe` | Breathe **V26** | Full screen | Stress or a nudge | `/(flows)/breathe` · fullScreenModal |
| [x] | `journal` | Evening journal **V26** | Sheet | evening | `/(sheets)/journal` · formSheet |
| [x] | `insights` | Journal insights **V26** | Push | Journal | `/plan/body/insights` |
| [x] | `workout` | Live workout **V26** | Full screen | start a workout | `/(flows)/workout` · fullScreenModal |
| [x] | `detected` | Workouts we spotted **V26** | Push | Body | `/plan/body/detected` |
| [x] | `sleepplan` | Sleep planner **V26** | Push | Sleep | `/plan/body/sleepplan` |
| [x] | `math` | How scores work **V26** | Push | any score → How it works | `/plan/body/math` |
| [x] | `coach` | Ask about your body **V26** | Full screen | Body → Ask | `/(flows)/coach` · fullScreenModal |
| [x] | `forecast` | Tomorrow's forecast **V26** | Push | Readiness | `/plan/body/forecast` |
| [x] | `cycle` | Cycle-aware readiness **V26** | Push | Body (opt-in) | `/plan/body/cycle` |
| [x] | `fitnessage` | Fitness age **V26** | Push | Body | `/plan/body/fitnessage` |
| [x] | `sources` | One picture from all your devices **V26** | Push | Body → Sources | `/plan/body/sources` |
| [x] | `cgm` | Glucose, after meals **V26** | Push | Body (with a sensor) | `/plan/body/cgm` |
| [x] | `basics` | Water, sitting and recovery **V26** | Push | Body | `/plan/body/basics` |
| [x] | `sleepnight` | One night **V26** | Push | Sleep → a night | `/plan/body/sleepnight` |
| [x] | `workoutdetail` | A past workout **V26** | Push | Load → a workout | `/plan/body/workoutdetail` |
| [x] | `weight` | Weight and body **V26** | Push | Body | `/plan/body/weight` |
| [x] | `bmi` | BMI and waist, explained **V26** | Push | Body numbers → BMI | `/plan/body/bmi` |
| [x] | `strain` | Today’s target load **V26** | Push | Body → Load | `/plan/body/strain` |
| [x] | `zones` | Your heart-rate zones **V26** | Push | Load → Zones | `/plan/body/zones` |
| [x] | `illness` | Something may be coming on **V26** | Card / push | Today, when signals rise | the Tax check (`taxcheck?state=code`) and Talk |
| [x] | `breathlib` | Breathing library **V26** | Push | Body → Breathe | `/plan/body/breathlib` |
| [x] | `provenance` | Where this number came from **V26** | Sheet | tap any score | `/(sheets)/provenance` · formSheet |
| [x] | `regularity` | Sleep regularity **V26** | Push | Sleep → Regularity | `/plan/body/regularity` |
| [x] | `loadtrend` | Training load trend **V26** | Push | Load → Trend | `/plan/body/loadtrend` |
| [x] | `healthdigest` | Your body this week **V26** | Push | Sunday, on Today | `/plan/body/healthdigest` |

## Plan · Body · Fuel (28)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `snap` | Snap a meal **V26** | Full screen | Fuel → camera | `/(flows)/snap` · fullScreenModal |
| [x] | `confirm` | Confirm the meal **V26** | Sheet | after a snap | `/(sheets)/confirm` · formSheet |
| [x] | `fuel` | Fuel **V26** | Push | Body → Fuel | `/plan/body/fuel/fuel` |
| [x] | `mealresult` | Meal, logged **V26** | Push | after confirming | `/plan/body/fuel/mealresult` |
| [x] | `cook` | What can I cook? **V26** | Push | Fuel → What can I cook? | `/plan/body/fuel/cook` |
| [x] | `mealplan` | A week of meals **V26** | Push | Fuel → Week | `/plan/body/fuel/mealplan` |
| [x] | `sayit` | Say what you ate **V26** | Sheet | Fuel → Say it | `/(sheets)/sayit` · formSheet |
| [x] | `foodday` | A day of food **V26** | Push | Fuel → a day | `/plan/body/fuel/foodday` |
| [x] | `barcode` | Scan a barcode **V26** | Full screen | Fuel → barcode | `/(flows)/barcode` · fullScreenModal |
| [x] | `foodsearch` | Search for a food **V26** | Push | Fuel → search | `/plan/body/fuel/foodsearch` |
| [x] | `fuelhome` | Fuel, at a glance **V26** | Push | Body → Fuel | `/plan/body/fuel/fuelhome` |
| [x] | `fuelgoal` | Your food targets **V26** | Push | Fuel → Targets | `/plan/body/fuel/fuelgoal` |
| [x] | `savedmeals` | Saved meals **V26** | Push | Fuel → Saved | `/plan/body/fuel/savedmeals` |
| [x] | `fuelprogress` | Food and weight, over time **V26** | Push | Fuel → Progress | `/plan/body/fuel/fuelprogress` |
| [x] | `exerciseadd` | Exercise, added back **V26** | Push | Fuel → Settings | `/plan/body/fuel/exerciseadd` |
| [x] | `fuelplan` | Your plan is ready **V26** | Full screen | end of food setup | `/(flows)/fuelplan` · fullScreenModal |
| [x] | `weighin` | Log your weight **V26** | Sheet | Fuel → Weight or Today | `/(sheets)/weighin` · formSheet |
| [x] | `labelscan` | Scan a nutrition label **V26** | Full screen | Snap → Label | `/(flows)/labelscan` · fullScreenModal |
| [x] | `menuscan` | What should I order? **V26** | Push | Snap → Menu | `/plan/body/fuel/menuscan` |
| [x] | `fixwords` | Fix it in your own words **V26** | Sheet | a logged meal → Fix | `/(sheets)/fixwords` · formSheet |
| [x] | `nutrients` | Everything you ate today **V26** | Push | Fuel → Nutrients | `/plan/body/fuel/nutrients` |
| [x] | `describeexercise` | Describe a workout **V26** | Sheet | Fuel or Load → + Activity | `/(sheets)/describeexercise` · formSheet |
| [x] | `weekbudget` | Your week, not just today **V26** | Push | Fuel → Week | `/plan/body/fuel/weekbudget` |
| [x] | `mealtiming` | Meals and your sleep **V26** | Push | Fuel → Insights | `/plan/body/fuel/mealtiming` |
| [x] | `foodquality` | Food quality **V26** | Push | Fuel → Insights | `/plan/body/fuel/foodquality` |
| [x] | `alcohol` | Alcohol **V26** | Push | Fuel → Alcohol | `/plan/body/fuel/alcohol` |
| [x] | `quicklog` | Log in two taps **V26** | Sheet | + on Fuel | `/(sheets)/quicklog` · formSheet |
| [x] | `importfood` | Bring your history **V26** | Push | Fuel → Settings → Import | `/plan/body/fuel/importfood` |

## Plan · Body · Habits (3)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `habits` | Habits **V26** | Push | Body → Habits | `/plan/body/habits/habits` |
| [x] | `habitnew` | New habit **V26** | Sheet | Habits → + | `/(sheets)/habitnew` · formSheet |
| [x] | `strength` | Habit strength **V26** | Push | a habit | `/plan/body/habits/strength` |

## Learn from the best (10)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `library` | Learn **V26** | Push | Plan → Learn | `/plan/learn/library` |
| [x] | `lens` | A lens **V26** | Push | Learn → a lens | `/plan/learn/lens` |
| [x] | `idea` | An idea, in 60 seconds **V26** | Full screen | Learn or Today | `/(flows)/idea` · fullScreenModal |
| [x] | `lensask` | Ask through a lens **V26** | Full screen | a lens → Ask | `/(flows)/lensask` · fullScreenModal |
| [x] | `recall` | Quick recall **V26** | Sheet | Today, when due | `/(sheets)/recall` · formSheet |
| [x] | `learning` | Ideas into action **V26** | Push | Learn → Into action | `/plan/learn/learning` |
| [x] | `teach` | Teach it back **V26** | Full screen | end of an idea | `/(flows)/teach` · fullScreenModal |
| [x] | `hill` | Lens: definiteness of purpose **V26** | Push | Learn or Aim | `/plan/learn/hill` |
| [x] | `learned` | What you’ve learned **V26** | Push | Learn → What you’ve learned | `/plan/learn/learned` |
| [x] | `drawkit` | Pictures that teach **V26** | Push | Learn → Pictures | `/plan/learn/drawkit` |

## Teach me (11)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `teachoffer` | Teach me, right where it’s needed **V26** | Button | anywhere a new term appears | the Tax check (`taxcheck?state=code`) and Talk |
| [x] | `lessonready` | Your lesson, ready **V26** | Full screen | Teach me | `/(flows)/teach/lessonready` · fullScreenModal |
| [x] | `bite` | A bite: one idea, one picture **V26** | Full screen | lesson | `/(flows)/teach/bite` · fullScreenModal |
| [x] | `predict` | Guess first, then see **V26** | Full screen | lesson | `/(flows)/teach/predict` · fullScreenModal |
| [x] | `puzzle` | One quick puzzle **V26** | Full screen | lesson | `/(flows)/teach/puzzle` · fullScreenModal |
| [x] | `lessonrecap` | The whole idea, in three lines **V26** | Full screen | lesson | `/(flows)/teach/lessonrecap` · fullScreenModal |
| [x] | `tellback` | Tell it back to life **V26** | Full screen | lesson | `/(flows)/teach/tellback` · fullScreenModal |
| [x] | `gaps` | What you got, and the one gap **V26** | Full screen | after telling back | `/(flows)/teach/gaps` · fullScreenModal |
| [x] | `gotit` | You’ve got it **V26** | Full screen | end of lesson | `/(flows)/teach/gotit` · fullScreenModal |
| [x] | `teachplay` | Play the whole lesson **V26** | Prototype | the whole flow | reference only |
| [x] | `bitedrawn` | A bite, drawn live **V26** | Full screen | lesson | `/(flows)/teach/bitedrawn` · fullScreenModal |

## Tab 3 · You (10)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `you` | You **V26** | Tab | tab bar | `/(tabs)/you` |
| [x] | `household` | Household **V26** | Sheet | your details → lives with | `/(sheets)/household` · formSheet |
| [x] | `mood` | Mood over time **V26** | Push | You → Mood | `/you/mood` |
| [x] | `children` | Children **V26** | Sheet | your details | `/(sheets)/children` · formSheet |
| [x] | `knows` | What life knows **V26** | Push | You → What life knows | `/you/knows` |
| [x] | `levels` | Your levels **V26** | Push | You → Levels | `/you/levels` |
| [x] | `experiment` | Experiment: caffeine **V26** | Push | You → Experiments | `/you/experiment` |
| [x] | `memory` | What life remembers **V26** | Push | You → What life remembers | `/you/memory` |
| [x] | `shared` | Shared life **V26** | Push | You → Shared | `/you/shared` |
| [x] | `profile` | Your details **V26** | Push | You → your details | `/you/profile` |

## You · Know yourself (6)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `tests` | Know yourself **V26** | Push | You → Know yourself | `/you/self/tests` |
| [x] | `testq` | One statement at a time **V26** | Full screen | Know yourself → a test | `/(flows)/testq` · fullScreenModal |
| [x] | `bigfive` | Your personality **V26** | Push | end of the personality test | `/you/self/bigfive` |
| [x] | `chronotype` | Your body clock **V26** | Push | Know yourself | `/you/self/chronotype` |
| [x] | `values` | What matters most **V26** | Push | Know yourself | `/you/self/values` |
| [x] | `measures` | Your body numbers **V26** | Push | You → Body numbers | `/you/self/measures` |

## You · People and dates (5)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `people` | Your people **V26** | Push | You → People | `/you/people/people` |
| [x] | `person` | A person **V26** | Push | People → a person | `/you/people/person` |
| [x] | `addperson` | Add people from contacts **V26** | Sheet | People → + | `/(sheets)/addperson` · formSheet |
| [x] | `birthdaynudge` | A birthday, on Today **V26** | Card | Today, 4 days before | component on Today / anywhere |
| [x] | `dates` | Important dates **V26** | Push | People → Dates | `/you/people/dates` |

## You · Settings and account (15)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `plus` | life+ **V26** | Sheet | a locked feature or Settings | `/(sheets)/plus` · formSheet |
| [x] | `settings` | Settings **V26** | Push | You → Settings | `/you/settings/settings` |
| [x] | `notifs` | Notifications **V26** | Push | Settings | `/you/settings/notifs` |
| [x] | `ondevice` | Private mode: AI on your phone **V26** | Push | Settings → Private mode | `/you/settings/ondevice` |
| [x] | `yourai` | Your data in your AI **V26** | Push | Settings → Your AI | `/you/settings/yourai` |
| [x] | `appearance` | Look, sound and feel **V26** | Push | Settings | `/you/settings/appearance` |
| [x] | `services` | Connected services **V26** | Push | Settings | `/you/settings/services` |
| [x] | `privacy` | Your data **V26** | Push | Settings | `/you/settings/privacy` |
| [x] | `deleteacct` | Delete your account **V26** | Push | Your data | `/you/settings/deleteacct` |
| [x] | `subscription` | Your life+ **V26** | Push | Settings → life+ | `/you/settings/subscription` |
| [x] | `plusstart` | life+ to start (the board's life+ as a full screen: the end of setup, Edem 21 Nov 2026, and opening Life with no plan) | Full screen | Save your progress, or opening Life | `/(flows)/plusstart` · fullScreenModal |
| [x] | `plussuccess` | Welcome to life+ **V26** | Full screen | after subscribing | `/(flows)/plussuccess` · fullScreenModal |
| [x] | `help` | Help **V26** | Push | Settings | `/you/settings/help` |
| [x] | `legal` | About life **V26** | Push | Settings | `/you/settings/legal` |
| [x] | `aimodels` | What stays on your phone **V26** | Push | Private mode → What downloads | `/you/settings/aimodels` |

## Grow (4)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `recap` | Weekly recap **V26** | Full screen | Sunday, on Today | `/(flows)/moments/recap` · fullScreenModal |
| [x] | `vantage` | Vantage point **V26** | Full screen | when earned | `/(flows)/moments/vantage` · fullScreenModal |
| [x] | `levelup` | Level up **V26** | Full screen | when earned | `/(flows)/moments/levelup` · fullScreenModal |
| [x] | `yourbirthday` | Your year **V26** | Full screen | your birthday, on Today | `/(flows)/moments/yourbirthday` · fullScreenModal |

## States (12)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `emptytoday` | Today, on day one **V26** | State | Today on day one | state of its parent screen |
| [x] | `offline` | Offline and errors **V26** | State | no connection | state of its parent screen |
| [x] | `loadingtoday` | Today, loading **V26** | State | Today while loading | state of its parent screen |
| [x] | `emptyplan` | Plan, on day one **V26** | State | Plan on day one | state of its parent screen |
| [x] | `emptybody` | Body, with no device **V26** | State | Body with no device | state of its parent screen |
| [x] | `connectfail` | A device stopped syncing **V26** | State | Body when a device stops syncing | state of its parent screen |
| [x] | `support` | Need support now **V26** | Push | You → Help, or offered when needed | `/states/support` |
| [x] | `permdenied` | A permission you said no to **V26** | State | a declined permission | state of its parent screen |
| [x] | `syncissue` | Two phones disagree **V26** | Sheet | two devices disagree | `/(sheets)/syncissue` · formSheet |
| [x] | `aidown` | life’s AI is having a moment **V26** | State | AI unavailable | state of its parent screen |
| [x] | `forceupdate` | Update needed **V26** | Full screen | old version | `/(flows)/forceupdate` · fullScreenModal |
| [x] | `signedout` | Welcome back **V26** | State | after sign-out or new phone | state of its parent screen |

## Outside the app (6)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [~] | `widgets` | Widgets and Live Activity **V26** | Home / Lock Screen | iOS | platform target (Home / Lock Screen) · drawn preview at `/outside/widgets` (development builds); native target in Phase 29 |
| [x] | `sharecard` | Weekly recap, shared **V26** | Sheet | Weekly recap → Share | `/(sheets)/sharecard` · formSheet, then the system share sheet |
| [~] | `watch` | Watch companion **V26** | Watch | Apple Watch / Wear OS | platform target (Watch) · drawn preview at `/outside/watch` (development builds); native target in Phase 29 |
| [~] | `lockpush` | Notifications **V26** | Notification | Lock Screen | platform target (Notification) · drawn preview at `/outside/lockpush` (development builds); native target in Phase 29 |
| [~] | `androidwidget` | Android widgets **V26** | Home screen | Android | platform target (Home screen) · drawn preview at `/outside/androidwidget` (development builds); native target in Phase 29 |
| [~] | `siri` | Siri and Shortcuts **V26** | Voice | Siri / Assistant | platform target (Voice) · drawn preview at `/outside/siri` (development builds); native target in Phase 29 |

## The orb and motion (3)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `orb` | The orb, evolving **V26** | Component | everywhere | `/outside/orb` (development builds), linked from `/design` |
| [x] | `topbars` | The top bar, everywhere **V26** | Component | everywhere | `/outside/topbars` (development builds), linked from `/design` |
| [x] | `orbnext` | Orb states, next **V26** | Component | everywhere | `/outside/orbnext` (development builds), linked from `/design` |

