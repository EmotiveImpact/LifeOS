# life — Every screen to build

> Generated from board v17 (`design-board/life-design-board-v17.html`). **This is the build checklist.** One row per board screen: build it, match the board, tick it. Nothing outside this list gets built; nothing on it gets redesigned.
> Open the board, find the screen by its key (each phone has id `s-<key>`), and match it: layout, copy, spacing, imagery, motion.
**221 screens.** Routes use expo-router; sheets use `presentation: 'formSheet'`, full-screen flows `fullScreenModal`. States are not routes: they're how their parent screen looks in that state.

Tick legend: `[ ]` not started · `[~]` built, needs polish · `[x]` matches the board in light and dark

V26 marker: **V26** after a screen's name means it has been rebuilt to the V26 board (`review/v26/board.html`, BUILD_V26.md Track A). The tick column still records the V23 build.


## First open (14)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `welcome` | Welcome | Full screen | first launch | `/(flows)/onboarding/welcome` · fullScreenModal |
| [x] | `question` | One question at a time | Full screen | Welcome | `/(flows)/onboarding/question` · fullScreenModal |
| [x] | `tell` | Or just tell life | Full screen | Welcome → “Or just tell life” | `/(flows)/onboarding/tell` · fullScreenModal |
| [x] | `building` | Building your plan | Full screen | end of setup | `/(flows)/onboarding/building` · fullScreenModal |
| [x] | `where` | Where do you live? | Full screen | setup | `/(flows)/onboarding/where` · fullScreenModal |
| [x] | `signin` | Save your progress | Sheet | after the plan is built | `/(sheets)/signin` · formSheet |
| [x] | `healthprimer` | Before Apple Health asks | Full screen | setup or Body | `/(flows)/onboarding/healthprimer` · fullScreenModal |
| [x] | `notifprimer` | One nudge a day, at most | Full screen | setup | `/(flows)/onboarding/notifprimer` · fullScreenModal |
| [x] | `micprimer` | Before the mic asks | Full screen | first Talk | `/(flows)/onboarding/micprimer` · fullScreenModal |
| [x] | `camprimer` | Before the camera asks | Full screen | first snap or scan | `/(flows)/onboarding/camprimer` · fullScreenModal |
| [x] | `calprimer` | Before the calendar asks | Full screen | setup or Calendar-aware day | `/(flows)/onboarding/calprimer` · fullScreenModal |
| [x] | `devicesetup` | Connect what you wear | Full screen | setup | `/(flows)/onboarding/devicesetup` · fullScreenModal |
| [x] | `firstmove` | Your first move | Full screen | end of setup | `/(flows)/onboarding/firstmove` · fullScreenModal |
| [x] | `measuresetup` | Your body, in three numbers | Full screen | setup, after where you live | `/(flows)/onboarding/measuresetup` · fullScreenModal |

## Tab 1 · Today (13)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `today` | Today (home) **V26** | Tab | tab bar | `/(tabs)/today` |
| [x] | `nudge` | Nudge **V26** | Card / notification | Today or Lock Screen | component on Today / anywhere |
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
| [x] | `plan` | Plan | Tab | tab bar | `/(tabs)/plan` |
| [x] | `mission` | Mission | Push | any mission | `/plan/mission` |
| [x] | `draft` | Draft message | Sheet | a mission step | `/(sheets)/draft` · formSheet |
| [x] | `ttk` | Things to know | Push | Plan → Things to know | `/plan/ttk` |
| [x] | `history` | Missions history | Push | Missions → Cleared | `/plan/history` |
| ⏸ | `doitforme` | **Parked, don't build.** Do it for me | Sheet | “Do it for me” on a step or bill | `/(sheets)/doitforme` · formSheet |
| [x] | `missions` | All missions | Push | Plan → Missions | `/plan/missions` |
| [x] | `newgoal` | Add something | Sheet | + on Plan | `/(sheets)/newgoal` · formSheet |
| [x] | `areahome` | Area: Home | Push | Plan → Home | `/plan/areahome` |
| [x] | `areahealth` | Area: Health | Push | Plan → Health | `/plan/areahealth` |
| [x] | `areawork` | Area: Work | Push | Plan → Work | `/plan/areawork` |

## Your Chief Aim (4)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `aimnew` | Write your Aim | Full screen | setup or Plan → Aim | `/(flows)/aimnew` · fullScreenModal |
| [x] | `aim` | Your Aim | Push | Aim pinned on Plan | `/plan/aim/aim` |
| [x] | `gambit` | This month's gambit | Push | Aim → this month | `/plan/aim/gambit` |
| [x] | `glimpse` | A glimpse, earned | Full screen | earned, on Today | `/(flows)/glimpse` · fullScreenModal |

## Plan · Money (8)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `money` | Money | Push | Money area | `/plan/money/money` |
| [x] | `subs` | Subscriptions | Push | Money → Subscriptions | `/plan/money/subs` |
| [x] | `area` | Area: Money | Push | Plan → Money | `/plan/money/area` |
| [x] | `txn` | A payment | Push | Money → a payment | `/plan/money/txn` |
| [x] | `bill` | A bill | Push | Money → a bill | `/plan/money/bill` |
| [x] | `budget` | Budget | Push | Money → Budget | `/plan/money/budget` |
| [x] | `networth` | Net worth | Push | Money → Net worth | `/plan/money/networth` |
| [x] | `connectbank` | Connect your bank | Full screen | Money → Connect | `/(flows)/connectbank` · fullScreenModal |

## Plan · Documents and renewals (3)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `vault` | Documents and renewals | Push | Plan → Documents | `/plan/documents/vault` |
| [x] | `docdetail` | Passport | Push | Documents → a document | `/plan/documents/docdetail` |
| [x] | `renewal` | Renewal: car insurance | Push | Documents or Today, when it’s time | `/plan/documents/renewal` |

## The toolkit (13)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `cashplan` | 30-day cash plan | Push | Toolkit | `/plan/tools/cashplan` |
| [x] | `taxcheck` | Tax & NI check | Push | Toolkit or Money | `/plan/tools/taxcheck` |
| [x] | `income` | Income & structure | Push | Toolkit or Work | `/plan/tools/income` |
| [x] | `rentbuy` | Rent vs buy | Push | Toolkit or Home | `/plan/tools/rentbuy` |
| [x] | `blood` | Bloodwork reader | Push | Toolkit or Health | `/plan/tools/blood` |
| [x] | `protect` | Protection review | Push | Toolkit | `/plan/tools/protect` |
| [x] | `growth` | Growth path | Push | Toolkit | `/plan/tools/growth` |
| [x] | `bedrooms` | Your next home: bedrooms | Push | Toolkit or Home | `/plan/tools/bedrooms` |
| [x] | `buffer` | How big a buffer? | Push | Toolkit or Money | `/plan/tools/buffer` |
| [x] | `unlock` | Locked tool | Sheet | a locked tool | `/(sheets)/unlock` · formSheet |
| [x] | `decisions` | Bigger decisions | Push | Toolkit → Bigger decisions | `/plan/tools/decisions` |
| [x] | `tools` | All tools | Push | Plan → Toolkit | `/plan/tools/tools` |
| [x] | `healthstack` | Health stack | Push | Toolkit or Health | `/plan/tools/healthstack` |

## Body (35)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `body` | Body | Push | Plan → Body or Today’s body card | `/plan/body/body` |
| [x] | `devices` | Connect devices | Push | Body → Sources | `/plan/body/devices` |
| [x] | `readiness` | Readiness | Push | Body | `/plan/body/readiness` |
| [x] | `sleep` | Sleep | Push | Body | `/plan/body/sleep` |
| [x] | `load` | Load | Push | Body | `/plan/body/load` |
| [x] | `trends` | Trends | Push | Body | `/plan/body/trends` |
| [x] | `hrv` | Metric detail: HRV | Push | Readiness → HRV | `/plan/body/hrv` |
| [x] | `signals` | Body signals | Push | Body | `/plan/body/signals` |
| [x] | `stress` | Stress today | Push | Body | `/plan/body/stress` |
| [x] | `breathe` | Breathe | Full screen | Stress or a nudge | `/(flows)/breathe` · fullScreenModal |
| [x] | `journal` | Evening journal | Sheet | evening | `/(sheets)/journal` · formSheet |
| [x] | `insights` | Journal insights | Push | Journal | `/plan/body/insights` |
| [x] | `workout` | Live workout | Full screen | start a workout | `/(flows)/workout` · fullScreenModal |
| [x] | `detected` | Workouts we spotted | Push | Body | `/plan/body/detected` |
| [x] | `sleepplan` | Sleep planner | Push | Sleep | `/plan/body/sleepplan` |
| [x] | `math` | How scores work | Push | any score → How it works | `/plan/body/math` |
| [x] | `coach` | Ask about your body | Full screen | Body → Ask | `/(flows)/coach` · fullScreenModal |
| [x] | `forecast` | Tomorrow's forecast | Push | Readiness | `/plan/body/forecast` |
| [x] | `cycle` | Cycle-aware readiness | Push | Body (opt-in) | `/plan/body/cycle` |
| [x] | `fitnessage` | Fitness age | Push | Body | `/plan/body/fitnessage` |
| [x] | `sources` | One picture from all your devices | Push | Body → Sources | `/plan/body/sources` |
| [x] | `cgm` | Glucose, after meals | Push | Body (with a sensor) | `/plan/body/cgm` |
| [x] | `basics` | Water, sitting and recovery | Push | Body | `/plan/body/basics` |
| [x] | `sleepnight` | One night | Push | Sleep → a night | `/plan/body/sleepnight` |
| [x] | `workoutdetail` | A past workout | Push | Load → a workout | `/plan/body/workoutdetail` |
| [x] | `weight` | Weight and body | Push | Body | `/plan/body/weight` |
| [x] | `bmi` | BMI and waist, explained | Push | Body numbers → BMI | `/plan/body/bmi` |
| [x] | `strain` | Today’s target load | Push | Body → Load | `/plan/body/strain` |
| [x] | `zones` | Your heart-rate zones | Push | Load → Zones | `/plan/body/zones` |
| [x] | `illness` | Something may be coming on | Card / push | Today, when signals rise | component on Today / anywhere |
| [x] | `breathlib` | Breathing library | Push | Body → Breathe | `/plan/body/breathlib` |
| [x] | `provenance` | Where this number came from | Sheet | tap any score | `/(sheets)/provenance` · formSheet |
| [x] | `regularity` | Sleep regularity | Push | Sleep → Regularity | `/plan/body/regularity` |
| [x] | `loadtrend` | Training load trend | Push | Load → Trend | `/plan/body/loadtrend` |
| [x] | `healthdigest` | Your body this week | Push | Sunday, on Today | `/plan/body/healthdigest` |

## Plan · Body · Fuel (28)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `snap` | Snap a meal | Full screen | Fuel → camera | `/(flows)/snap` · fullScreenModal |
| [x] | `confirm` | Confirm the meal | Sheet | after a snap | `/(sheets)/confirm` · formSheet |
| [x] | `fuel` | Fuel | Push | Body → Fuel | `/plan/body/fuel/fuel` |
| [x] | `mealresult` | Meal, logged | Push | after confirming | `/plan/body/fuel/mealresult` |
| [x] | `cook` | What can I cook? | Push | Fuel → What can I cook? | `/plan/body/fuel/cook` |
| [x] | `mealplan` | A week of meals | Push | Fuel → Week | `/plan/body/fuel/mealplan` |
| [x] | `sayit` | Say what you ate | Sheet | Fuel → Say it | `/(sheets)/sayit` · formSheet |
| [x] | `foodday` | A day of food | Push | Fuel → a day | `/plan/body/fuel/foodday` |
| [x] | `barcode` | Scan a barcode | Full screen | Fuel → barcode | `/(flows)/barcode` · fullScreenModal |
| [x] | `foodsearch` | Search for a food | Push | Fuel → search | `/plan/body/fuel/foodsearch` |
| [x] | `fuelhome` | Fuel, at a glance | Push | Body → Fuel | `/plan/body/fuel/fuelhome` |
| [x] | `fuelgoal` | Your food targets | Push | Fuel → Targets | `/plan/body/fuel/fuelgoal` |
| [x] | `savedmeals` | Saved meals | Push | Fuel → Saved | `/plan/body/fuel/savedmeals` |
| [x] | `fuelprogress` | Food and weight, over time | Push | Fuel → Progress | `/plan/body/fuel/fuelprogress` |
| [x] | `exerciseadd` | Exercise, added back | Push | Fuel → Settings | `/plan/body/fuel/exerciseadd` |
| [x] | `fuelplan` | Your plan is ready | Full screen | end of food setup | `/(flows)/fuelplan` · fullScreenModal |
| [x] | `weighin` | Log your weight | Sheet | Fuel → Weight or Today | `/(sheets)/weighin` · formSheet |
| [x] | `labelscan` | Scan a nutrition label | Full screen | Snap → Label | `/(flows)/labelscan` · fullScreenModal |
| [x] | `menuscan` | What should I order? | Push | Snap → Menu | `/plan/body/fuel/menuscan` |
| [x] | `fixwords` | Fix it in your own words | Sheet | a logged meal → Fix | `/(sheets)/fixwords` · formSheet |
| [x] | `nutrients` | Everything you ate today | Push | Fuel → Nutrients | `/plan/body/fuel/nutrients` |
| [x] | `describeexercise` | Describe a workout | Sheet | Fuel or Load → + Activity | `/(sheets)/describeexercise` · formSheet |
| [x] | `weekbudget` | Your week, not just today | Push | Fuel → Week | `/plan/body/fuel/weekbudget` |
| [x] | `mealtiming` | Meals and your sleep | Push | Fuel → Insights | `/plan/body/fuel/mealtiming` |
| [x] | `foodquality` | Food quality | Push | Fuel → Insights | `/plan/body/fuel/foodquality` |
| [x] | `alcohol` | Alcohol | Push | Fuel → Alcohol | `/plan/body/fuel/alcohol` |
| [x] | `quicklog` | Log in two taps | Sheet | + on Fuel | `/(sheets)/quicklog` · formSheet |
| [x] | `importfood` | Bring your history | Push | Fuel → Settings → Import | `/plan/body/fuel/importfood` |

## Plan · Body · Habits (3)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `habits` | Habits | Push | Body → Habits | `/plan/body/habits/habits` |
| [x] | `habitnew` | New habit | Sheet | Habits → + | `/(sheets)/habitnew` · formSheet |
| [x] | `strength` | Habit strength | Push | a habit | `/plan/body/habits/strength` |

## Learn from the best (10)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `library` | Learn | Push | Plan → Learn | `/plan/learn/library` |
| [x] | `lens` | A lens | Push | Learn → a lens | `/plan/learn/lens` |
| [x] | `idea` | An idea, in 60 seconds | Full screen | Learn or Today | `/(flows)/idea` · fullScreenModal |
| [x] | `lensask` | Ask through a lens | Full screen | a lens → Ask | `/(flows)/lensask` · fullScreenModal |
| [x] | `recall` | Quick recall | Sheet | Today, when due | `/(sheets)/recall` · formSheet |
| [x] | `learning` | Ideas into action | Push | Learn → Into action | `/plan/learn/learning` |
| [x] | `teach` | Teach it back | Full screen | end of an idea | `/(flows)/teach` · fullScreenModal |
| [x] | `hill` | Lens: definiteness of purpose | Push | Learn or Aim | `/plan/learn/hill` |
| [x] | `learned` | What you’ve learned | Push | Learn → What you’ve learned | `/plan/learn/learned` |
| [x] | `drawkit` | Pictures that teach | Push | Learn → Pictures | `/plan/learn/drawkit` |

## Teach me (11)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `teachoffer` | Teach me, right where it’s needed | Button | anywhere a new term appears | component on Today / anywhere |
| [x] | `lessonready` | Your lesson, ready | Full screen | Teach me | `/(flows)/teach/lessonready` · fullScreenModal |
| [x] | `bite` | A bite: one idea, one picture | Full screen | lesson | `/(flows)/teach/bite` · fullScreenModal |
| [x] | `predict` | Guess first, then see | Full screen | lesson | `/(flows)/teach/predict` · fullScreenModal |
| [x] | `puzzle` | One quick puzzle | Full screen | lesson | `/(flows)/teach/puzzle` · fullScreenModal |
| [x] | `lessonrecap` | The whole idea, in three lines | Full screen | lesson | `/(flows)/teach/lessonrecap` · fullScreenModal |
| [x] | `tellback` | Tell it back to life | Full screen | lesson | `/(flows)/teach/tellback` · fullScreenModal |
| [x] | `gaps` | What you got, and the one gap | Full screen | after telling back | `/(flows)/teach/gaps` · fullScreenModal |
| [x] | `gotit` | You’ve got it | Full screen | end of lesson | `/(flows)/teach/gotit` · fullScreenModal |
| [x] | `teachplay` | Play the whole lesson | Prototype | the whole flow | reference only |
| [x] | `bitedrawn` | A bite, drawn live | Full screen | lesson | `/(flows)/teach/bitedrawn` · fullScreenModal |

## Tab 3 · You (10)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `you` | You | Tab | tab bar | `/(tabs)/you` |
| [x] | `household` | Household | Sheet | your details → lives with | `/(sheets)/household` · formSheet |
| [x] | `mood` | Mood over time | Push | You → Mood | `/you/mood` |
| [x] | `children` | Children | Sheet | your details | `/(sheets)/children` · formSheet |
| [x] | `knows` | What life knows | Push | You → What life knows | `/you/knows` |
| [x] | `levels` | Your levels | Push | You → Levels | `/you/levels` |
| [x] | `experiment` | Experiment: caffeine | Push | You → Experiments | `/you/experiment` |
| [x] | `memory` | What life remembers | Push | You → What life remembers | `/you/memory` |
| [x] | `shared` | Shared life | Push | You → Shared | `/you/shared` |
| [x] | `profile` | Your details | Push | You → your details | `/you/profile` |

## You · Know yourself (6)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `tests` | Know yourself | Push | You → Know yourself | `/you/self/tests` |
| [x] | `testq` | One statement at a time | Full screen | Know yourself → a test | `/(flows)/testq` · fullScreenModal |
| [x] | `bigfive` | Your personality | Push | end of the personality test | `/you/self/bigfive` |
| [x] | `chronotype` | Your body clock | Push | Know yourself | `/you/self/chronotype` |
| [x] | `values` | What matters most | Push | Know yourself | `/you/self/values` |
| [x] | `measures` | Your body numbers | Push | You → Body numbers | `/you/self/measures` |

## You · People and dates (5)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `people` | Your people | Push | You → People | `/you/people/people` |
| [x] | `person` | A person | Push | People → a person | `/you/people/person` |
| [x] | `addperson` | Add people from contacts | Sheet | People → + | `/(sheets)/addperson` · formSheet |
| [x] | `birthdaynudge` | A birthday, on Today | Card | Today, 4 days before | component on Today / anywhere |
| [x] | `dates` | Important dates | Push | People → Dates | `/you/people/dates` |

## You · Settings and account (14)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `plus` | life+ | Sheet | a locked feature or Settings | `/(sheets)/plus` · formSheet |
| [x] | `settings` | Settings | Push | You → Settings | `/you/settings/settings` |
| [x] | `notifs` | Notifications | Push | Settings | `/you/settings/notifs` |
| [x] | `ondevice` | Private mode: AI on your phone | Push | Settings → Private mode | `/you/settings/ondevice` |
| [x] | `yourai` | Your data in your AI | Push | Settings → Your AI | `/you/settings/yourai` |
| [x] | `appearance` | Look, sound and feel | Push | Settings | `/you/settings/appearance` |
| [x] | `services` | Connected services | Push | Settings | `/you/settings/services` |
| [x] | `privacy` | Your data | Push | Settings | `/you/settings/privacy` |
| [x] | `deleteacct` | Delete your account | Push | Your data | `/you/settings/deleteacct` |
| [x] | `subscription` | Your life+ | Push | Settings → life+ | `/you/settings/subscription` |
| [x] | `plussuccess` | Welcome to life+ | Full screen | after subscribing | `/(flows)/plussuccess` · fullScreenModal |
| [x] | `help` | Help | Push | Settings | `/you/settings/help` |
| [x] | `legal` | About life | Push | Settings | `/you/settings/legal` |
| [x] | `aimodels` | What stays on your phone | Push | Private mode → What downloads | `/you/settings/aimodels` |

## Grow (4)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `recap` | Weekly recap | Full screen | Sunday, on Today | `/(flows)/moments/recap` · fullScreenModal |
| [x] | `vantage` | Vantage point | Full screen | when earned | `/(flows)/moments/vantage` · fullScreenModal |
| [x] | `levelup` | Level up | Full screen | when earned | `/(flows)/moments/levelup` · fullScreenModal |
| [x] | `yourbirthday` | Your year | Full screen | your birthday, on Today | `/(flows)/moments/yourbirthday` · fullScreenModal |

## States (12)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `emptytoday` | Today, on day one | State | Today on day one | state of its parent screen |
| [x] | `offline` | Offline and errors | State | no connection | state of its parent screen |
| [x] | `loadingtoday` | Today, loading | State | Today while loading | state of its parent screen |
| [x] | `emptyplan` | Plan, on day one | State | Plan on day one | state of its parent screen |
| [x] | `emptybody` | Body, with no device | State | Body with no device | state of its parent screen |
| [x] | `connectfail` | A device stopped syncing | State | Body when a device stops syncing | state of its parent screen |
| [x] | `support` | Need support now | Push | You → Help, or offered when needed | `/states/support` |
| [x] | `permdenied` | A permission you said no to | State | a declined permission | state of its parent screen |
| [x] | `syncissue` | Two phones disagree | Sheet | two devices disagree | `/(sheets)/syncissue` · formSheet |
| [x] | `aidown` | life’s AI is having a moment | State | AI unavailable | state of its parent screen |
| [x] | `forceupdate` | Update needed | Full screen | old version | `/(flows)/forceupdate` · fullScreenModal |
| [x] | `signedout` | Welcome back | State | after sign-out or new phone | state of its parent screen |

## Outside the app (6)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [~] | `widgets` | Widgets and Live Activity | Home / Lock Screen | iOS | platform target (Home / Lock Screen) · UI preview only; native target in Track B |
| [~] | `sharecard` | Weekly recap, shared | Share sheet | Weekly recap → Share | platform target (Share sheet) · UI preview only; native target in Track B |
| [~] | `watch` | Watch companion | Watch | Apple Watch / Wear OS | platform target (Watch) · UI preview only; native target in Track B |
| [~] | `lockpush` | Notifications | Notification | Lock Screen | platform target (Notification) · UI preview only; native target in Track B |
| [~] | `androidwidget` | Android widgets | Home screen | Android | platform target (Home screen) · UI preview only; native target in Track B |
| [~] | `siri` | Siri and Shortcuts | Voice | Siri / Assistant | platform target (Voice) · UI preview only; native target in Track B |

## The orb and motion (3)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [x] | `orb` | The orb, evolving | Component | everywhere | `@/design` + `/design` |
| [x] | `topbars` | The top bar, everywhere | Component | everywhere | `@/design` + `/design` |
| [x] | `orbnext` | Orb states, next | Component | everywhere | `@/design` + `/design` |

