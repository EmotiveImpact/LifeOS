# life — Every screen to build

> Generated from board v17 (`design-board/life-design-board-v17.html`). **This is the build checklist.** One row per board screen: build it, match the board, tick it. Nothing outside this list gets built; nothing on it gets redesigned.
> Open the board, find the screen by its key (each phone has id `s-<key>`), and match it: layout, copy, spacing, imagery, motion.
**221 screens.** Routes use expo-router; sheets use `presentation: 'formSheet'`, full-screen flows `fullScreenModal`. States are not routes: they're how their parent screen looks in that state.

Tick legend: `[ ]` not started · `[~]` built, needs polish · `[x]` matches the board in light and dark


## First open (14)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [~] | `welcome` | Welcome | Full screen | first launch | `/(flows)/onboarding/welcome` · fullScreenModal |
| [~] | `question` | One question at a time | Full screen | Welcome | `/(flows)/onboarding/question` · fullScreenModal |
| [~] | `tell` | Or just tell life | Full screen | Welcome → “Or just tell life” | `/(flows)/onboarding/tell` · fullScreenModal |
| [~] | `building` | Building your plan | Full screen | end of setup | `/(flows)/onboarding/building` · fullScreenModal |
| [~] | `where` | Where do you live? | Full screen | setup | `/(flows)/onboarding/where` · fullScreenModal |
| [~] | `signin` | Save your progress | Sheet | after the plan is built | `/(sheets)/signin` · formSheet |
| [~] | `healthprimer` | Before Apple Health asks | Full screen | setup or Body | `/(flows)/onboarding/healthprimer` · fullScreenModal |
| [~] | `notifprimer` | One nudge a day, at most | Full screen | setup | `/(flows)/onboarding/notifprimer` · fullScreenModal |
| [~] | `micprimer` | Before the mic asks | Full screen | first Talk | `/(flows)/onboarding/micprimer` · fullScreenModal |
| [~] | `camprimer` | Before the camera asks | Full screen | first snap or scan | `/(flows)/onboarding/camprimer` · fullScreenModal |
| [~] | `calprimer` | Before the calendar asks | Full screen | setup or Calendar-aware day | `/(flows)/onboarding/calprimer` · fullScreenModal |
| [~] | `devicesetup` | Connect what you wear | Full screen | setup | `/(flows)/onboarding/devicesetup` · fullScreenModal |
| [~] | `firstmove` | Your first move | Full screen | end of setup | `/(flows)/onboarding/firstmove` · fullScreenModal |
| [~] | `measuresetup` | Your body, in three numbers | Full screen | setup, after where you live | `/(flows)/onboarding/measuresetup` · fullScreenModal |

## Tab 1 · Today (13)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [~] | `today` | Today (home) | Tab | tab bar | `/(tabs)/today` |
| [~] | `nudge` | Nudge | Card / notification | Today or Lock Screen | component on Today / anywhere |
| [~] | `pulse` | Pulse | Sheet | Today check-in | `/(sheets)/pulse` · formSheet |
| [~] | `checkin` | Checking in | Sheet | Today | `/(sheets)/checkin` · formSheet |
| [~] | `customise` | Customise Today | Sheet | Today → edit | `/(sheets)/customise` · formSheet |
| [~] | `routines` | Your routines | Push | Today → routines | `/today/routines` |
| [~] | `why` | Why am I seeing this? | Sheet | “Why am I seeing this?” on any card | `/(sheets)/why` · formSheet |
| [~] | `calendar` | Calendar-aware day | Push | Today → day strip | `/today/calendar` |
| [~] | `morningbrief` | Morning brief | Sheet | first open of the day | `/(sheets)/morningbrief` · formSheet |
| [~] | `evening` | Close the day | Sheet | evening notification or Today | `/(sheets)/evening` · formSheet |
| [~] | `inbox` | From life | Push | bell on Today | `/today/inbox` |
| [~] | `search` | Search everything | Overlay | pull down on Today | overlay on Today |
| [~] | `focus` | Focus session | Full screen | Today or a calendar gap | `/(flows)/focus` · fullScreenModal |

## Talk and file (8)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [~] | `talk` | Talk | Full screen | hold the Talk button | `/(flows)/talk` · fullScreenModal |
| [~] | `understood` | Understood | Sheet | after Talk | `/(sheets)/understood` · formSheet |
| [~] | `ask` | Ask, then file | Full screen | Chat → a question | `/(flows)/ask` · fullScreenModal |
| [~] | `attach` | Attach | Sheet | + in Chat | `/(sheets)/attach` · formSheet |
| [~] | `scan` | Letter, understood | Full screen | + → Scan a letter | `/(flows)/scan` · fullScreenModal |
| [~] | `chat` | Chat | Full screen | tap the Talk button | `/(flows)/chat` · fullScreenModal |
| [~] | `chathistory` | Your conversations | Push | Chat → ⋯ | `/talk/chathistory` |
| [~] | `editfiled` | Edit what life filed | Sheet | tap any filed item | `/(sheets)/editfiled` · formSheet |

## Tab 2 · Plan (11)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [~] | `plan` | Plan | Tab | tab bar | `/(tabs)/plan` |
| [~] | `mission` | Mission | Push | any mission | `/plan/mission` |
| [~] | `draft` | Draft message | Sheet | a mission step | `/(sheets)/draft` · formSheet |
| [~] | `ttk` | Things to know | Push | Plan → Things to know | `/plan/ttk` |
| [~] | `history` | Missions history | Push | Missions → Cleared | `/plan/history` |
| ⏸ | `doitforme` | **Parked, don't build.** Do it for me | Sheet | “Do it for me” on a step or bill | `/(sheets)/doitforme` · formSheet |
| [~] | `missions` | All missions | Push | Plan → Missions | `/plan/missions` |
| [~] | `newgoal` | Add something | Sheet | + on Plan | `/(sheets)/newgoal` · formSheet |
| [~] | `areahome` | Area: Home | Push | Plan → Home | `/plan/areahome` |
| [~] | `areahealth` | Area: Health | Push | Plan → Health | `/plan/areahealth` |
| [~] | `areawork` | Area: Work | Push | Plan → Work | `/plan/areawork` |

## Your Chief Aim (4)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [~] | `aimnew` | Write your Aim | Full screen | setup or Plan → Aim | `/(flows)/aimnew` · fullScreenModal |
| [~] | `aim` | Your Aim | Push | Aim pinned on Plan | `/plan/aim/aim` |
| [~] | `gambit` | This month's gambit | Push | Aim → this month | `/plan/aim/gambit` |
| [~] | `glimpse` | A glimpse, earned | Full screen | earned, on Today | `/(flows)/glimpse` · fullScreenModal |

## Plan · Money (8)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [~] | `money` | Money | Push | Money area | `/plan/money/money` |
| [~] | `subs` | Subscriptions | Push | Money → Subscriptions | `/plan/money/subs` |
| [~] | `area` | Area: Money | Push | Plan → Money | `/plan/money/area` |
| [~] | `txn` | A payment | Push | Money → a payment | `/plan/money/txn` |
| [~] | `bill` | A bill | Push | Money → a bill | `/plan/money/bill` |
| [~] | `budget` | Budget | Push | Money → Budget | `/plan/money/budget` |
| [~] | `networth` | Net worth | Push | Money → Net worth | `/plan/money/networth` |
| [~] | `connectbank` | Connect your bank | Full screen | Money → Connect | `/(flows)/connectbank` · fullScreenModal |

## Plan · Documents and renewals (3)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [~] | `vault` | Documents and renewals | Push | Plan → Documents | `/plan/documents/vault` |
| [~] | `docdetail` | Passport | Push | Documents → a document | `/plan/documents/docdetail` |
| [~] | `renewal` | Renewal: car insurance | Push | Documents or Today, when it’s time | `/plan/documents/renewal` |

## The toolkit (13)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [~] | `cashplan` | 30-day cash plan | Push | Toolkit | `/plan/tools/cashplan` |
| [~] | `taxcheck` | Tax & NI check | Push | Toolkit or Money | `/plan/tools/taxcheck` |
| [~] | `income` | Income & structure | Push | Toolkit or Work | `/plan/tools/income` |
| [~] | `rentbuy` | Rent vs buy | Push | Toolkit or Home | `/plan/tools/rentbuy` |
| [~] | `blood` | Bloodwork reader | Push | Toolkit or Health | `/plan/tools/blood` |
| [~] | `protect` | Protection review | Push | Toolkit | `/plan/tools/protect` |
| [~] | `growth` | Growth path | Push | Toolkit | `/plan/tools/growth` |
| [~] | `bedrooms` | Your next home: bedrooms | Push | Toolkit or Home | `/plan/tools/bedrooms` |
| [~] | `buffer` | How big a buffer? | Push | Toolkit or Money | `/plan/tools/buffer` |
| [~] | `unlock` | Locked tool | Sheet | a locked tool | `/(sheets)/unlock` · formSheet |
| [~] | `decisions` | Bigger decisions | Push | Toolkit → Bigger decisions | `/plan/tools/decisions` |
| [~] | `tools` | All tools | Push | Plan → Toolkit | `/plan/tools/tools` |
| [~] | `healthstack` | Health stack | Push | Toolkit or Health | `/plan/tools/healthstack` |

## Body (35)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [~] | `body` | Body | Push | Plan → Body or Today’s body card | `/plan/body/body` |
| [~] | `devices` | Connect devices | Push | Body → Sources | `/plan/body/devices` |
| [~] | `readiness` | Readiness | Push | Body | `/plan/body/readiness` |
| [~] | `sleep` | Sleep | Push | Body | `/plan/body/sleep` |
| [~] | `load` | Load | Push | Body | `/plan/body/load` |
| [~] | `trends` | Trends | Push | Body | `/plan/body/trends` |
| [~] | `hrv` | Metric detail: HRV | Push | Readiness → HRV | `/plan/body/hrv` |
| [~] | `signals` | Body signals | Push | Body | `/plan/body/signals` |
| [~] | `stress` | Stress today | Push | Body | `/plan/body/stress` |
| [~] | `breathe` | Breathe | Full screen | Stress or a nudge | `/(flows)/breathe` · fullScreenModal |
| [~] | `journal` | Evening journal | Sheet | evening | `/(sheets)/journal` · formSheet |
| [~] | `insights` | Journal insights | Push | Journal | `/plan/body/insights` |
| [~] | `workout` | Live workout | Full screen | start a workout | `/(flows)/workout` · fullScreenModal |
| [~] | `detected` | Workouts we spotted | Push | Body | `/plan/body/detected` |
| [~] | `sleepplan` | Sleep planner | Push | Sleep | `/plan/body/sleepplan` |
| [~] | `math` | How scores work | Push | any score → How it works | `/plan/body/math` |
| [~] | `coach` | Ask about your body | Full screen | Body → Ask | `/(flows)/coach` · fullScreenModal |
| [~] | `forecast` | Tomorrow's forecast | Push | Readiness | `/plan/body/forecast` |
| [~] | `cycle` | Cycle-aware readiness | Push | Body (opt-in) | `/plan/body/cycle` |
| [~] | `fitnessage` | Fitness age | Push | Body | `/plan/body/fitnessage` |
| [~] | `sources` | One picture from all your devices | Push | Body → Sources | `/plan/body/sources` |
| [~] | `cgm` | Glucose, after meals | Push | Body (with a sensor) | `/plan/body/cgm` |
| [~] | `basics` | Water, sitting and recovery | Push | Body | `/plan/body/basics` |
| [~] | `sleepnight` | One night | Push | Sleep → a night | `/plan/body/sleepnight` |
| [~] | `workoutdetail` | A past workout | Push | Load → a workout | `/plan/body/workoutdetail` |
| [~] | `weight` | Weight and body | Push | Body | `/plan/body/weight` |
| [~] | `bmi` | BMI and waist, explained | Push | Body numbers → BMI | `/plan/body/bmi` |
| [~] | `strain` | Today’s target load | Push | Body → Load | `/plan/body/strain` |
| [~] | `zones` | Your heart-rate zones | Push | Load → Zones | `/plan/body/zones` |
| [~] | `illness` | Something may be coming on | Card / push | Today, when signals rise | component on Today / anywhere |
| [~] | `breathlib` | Breathing library | Push | Body → Breathe | `/plan/body/breathlib` |
| [~] | `provenance` | Where this number came from | Sheet | tap any score | `/(sheets)/provenance` · formSheet |
| [~] | `regularity` | Sleep regularity | Push | Sleep → Regularity | `/plan/body/regularity` |
| [~] | `loadtrend` | Training load trend | Push | Load → Trend | `/plan/body/loadtrend` |
| [~] | `healthdigest` | Your body this week | Push | Sunday, on Today | `/plan/body/healthdigest` |

## Plan · Body · Fuel (28)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [~] | `snap` | Snap a meal | Full screen | Fuel → camera | `/(flows)/snap` · fullScreenModal |
| [~] | `confirm` | Confirm the meal | Sheet | after a snap | `/(sheets)/confirm` · formSheet |
| [~] | `fuel` | Fuel | Push | Body → Fuel | `/plan/body/fuel/fuel` |
| [~] | `mealresult` | Meal, logged | Push | after confirming | `/plan/body/fuel/mealresult` |
| [~] | `cook` | What can I cook? | Push | Fuel → What can I cook? | `/plan/body/fuel/cook` |
| [~] | `mealplan` | A week of meals | Push | Fuel → Week | `/plan/body/fuel/mealplan` |
| [~] | `sayit` | Say what you ate | Sheet | Fuel → Say it | `/(sheets)/sayit` · formSheet |
| [~] | `foodday` | A day of food | Push | Fuel → a day | `/plan/body/fuel/foodday` |
| [~] | `barcode` | Scan a barcode | Full screen | Fuel → barcode | `/(flows)/barcode` · fullScreenModal |
| [~] | `foodsearch` | Search for a food | Push | Fuel → search | `/plan/body/fuel/foodsearch` |
| [~] | `fuelhome` | Fuel, at a glance | Push | Body → Fuel | `/plan/body/fuel/fuelhome` |
| [~] | `fuelgoal` | Your food targets | Push | Fuel → Targets | `/plan/body/fuel/fuelgoal` |
| [~] | `savedmeals` | Saved meals | Push | Fuel → Saved | `/plan/body/fuel/savedmeals` |
| [~] | `fuelprogress` | Food and weight, over time | Push | Fuel → Progress | `/plan/body/fuel/fuelprogress` |
| [~] | `exerciseadd` | Exercise, added back | Push | Fuel → Settings | `/plan/body/fuel/exerciseadd` |
| [~] | `fuelplan` | Your plan is ready | Full screen | end of food setup | `/(flows)/fuelplan` · fullScreenModal |
| [~] | `weighin` | Log your weight | Sheet | Fuel → Weight or Today | `/(sheets)/weighin` · formSheet |
| [~] | `labelscan` | Scan a nutrition label | Full screen | Snap → Label | `/(flows)/labelscan` · fullScreenModal |
| [~] | `menuscan` | What should I order? | Push | Snap → Menu | `/plan/body/fuel/menuscan` |
| [~] | `fixwords` | Fix it in your own words | Sheet | a logged meal → Fix | `/(sheets)/fixwords` · formSheet |
| [~] | `nutrients` | Everything you ate today | Push | Fuel → Nutrients | `/plan/body/fuel/nutrients` |
| [~] | `describeexercise` | Describe a workout | Sheet | Fuel or Load → + Activity | `/(sheets)/describeexercise` · formSheet |
| [~] | `weekbudget` | Your week, not just today | Push | Fuel → Week | `/plan/body/fuel/weekbudget` |
| [~] | `mealtiming` | Meals and your sleep | Push | Fuel → Insights | `/plan/body/fuel/mealtiming` |
| [~] | `foodquality` | Food quality | Push | Fuel → Insights | `/plan/body/fuel/foodquality` |
| [~] | `alcohol` | Alcohol | Push | Fuel → Alcohol | `/plan/body/fuel/alcohol` |
| [~] | `quicklog` | Log in two taps | Sheet | + on Fuel | `/(sheets)/quicklog` · formSheet |
| [~] | `importfood` | Bring your history | Push | Fuel → Settings → Import | `/plan/body/fuel/importfood` |

## Plan · Body · Habits (3)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [~] | `habits` | Habits | Push | Body → Habits | `/plan/body/habits/habits` |
| [~] | `habitnew` | New habit | Sheet | Habits → + | `/(sheets)/habitnew` · formSheet |
| [~] | `strength` | Habit strength | Push | a habit | `/plan/body/habits/strength` |

## Learn from the best (10)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [~] | `library` | Learn | Push | Plan → Learn | `/plan/learn/library` |
| [~] | `lens` | A lens | Push | Learn → a lens | `/plan/learn/lens` |
| [~] | `idea` | An idea, in 60 seconds | Full screen | Learn or Today | `/(flows)/idea` · fullScreenModal |
| [~] | `lensask` | Ask through a lens | Full screen | a lens → Ask | `/(flows)/lensask` · fullScreenModal |
| [~] | `recall` | Quick recall | Sheet | Today, when due | `/(sheets)/recall` · formSheet |
| [~] | `learning` | Ideas into action | Push | Learn → Into action | `/plan/learn/learning` |
| [~] | `teach` | Teach it back | Full screen | end of an idea | `/(flows)/teach` · fullScreenModal |
| [~] | `hill` | Lens: definiteness of purpose | Push | Learn or Aim | `/plan/learn/hill` |
| [~] | `learned` | What you’ve learned | Push | Learn → What you’ve learned | `/plan/learn/learned` |
| [~] | `drawkit` | Pictures that teach | Push | Learn → Pictures | `/plan/learn/drawkit` |

## Teach me (11)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [~] | `teachoffer` | Teach me, right where it’s needed | Button | anywhere a new term appears | component on Today / anywhere |
| [~] | `lessonready` | Your lesson, ready | Full screen | Teach me | `/(flows)/teach/lessonready` · fullScreenModal |
| [~] | `bite` | A bite: one idea, one picture | Full screen | lesson | `/(flows)/teach/bite` · fullScreenModal |
| [~] | `predict` | Guess first, then see | Full screen | lesson | `/(flows)/teach/predict` · fullScreenModal |
| [~] | `puzzle` | One quick puzzle | Full screen | lesson | `/(flows)/teach/puzzle` · fullScreenModal |
| [~] | `lessonrecap` | The whole idea, in three lines | Full screen | lesson | `/(flows)/teach/lessonrecap` · fullScreenModal |
| [~] | `tellback` | Tell it back to life | Full screen | lesson | `/(flows)/teach/tellback` · fullScreenModal |
| [~] | `gaps` | What you got, and the one gap | Full screen | after telling back | `/(flows)/teach/gaps` · fullScreenModal |
| [~] | `gotit` | You’ve got it | Full screen | end of lesson | `/(flows)/teach/gotit` · fullScreenModal |
| [~] | `teachplay` | Play the whole lesson | Prototype | the whole flow | reference only |
| [~] | `bitedrawn` | A bite, drawn live | Full screen | lesson | `/(flows)/teach/bitedrawn` · fullScreenModal |

## Tab 3 · You (10)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [~] | `you` | You | Tab | tab bar | `/(tabs)/you` |
| [~] | `household` | Household | Sheet | your details → lives with | `/(sheets)/household` · formSheet |
| [~] | `mood` | Mood over time | Push | You → Mood | `/you/mood` |
| [~] | `children` | Children | Sheet | your details | `/(sheets)/children` · formSheet |
| [~] | `knows` | What life knows | Push | You → What life knows | `/you/knows` |
| [~] | `levels` | Your levels | Push | You → Levels | `/you/levels` |
| [~] | `experiment` | Experiment: caffeine | Push | You → Experiments | `/you/experiment` |
| [~] | `memory` | What life remembers | Push | You → What life remembers | `/you/memory` |
| [~] | `shared` | Shared life | Push | You → Shared | `/you/shared` |
| [~] | `profile` | Your details | Push | You → your details | `/you/profile` |

## You · Know yourself (6)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [~] | `tests` | Know yourself | Push | You → Know yourself | `/you/self/tests` |
| [~] | `testq` | One statement at a time | Full screen | Know yourself → a test | `/(flows)/testq` · fullScreenModal |
| [~] | `bigfive` | Your personality | Push | end of the personality test | `/you/self/bigfive` |
| [~] | `chronotype` | Your body clock | Push | Know yourself | `/you/self/chronotype` |
| [~] | `values` | What matters most | Push | Know yourself | `/you/self/values` |
| [~] | `measures` | Your body numbers | Push | You → Body numbers | `/you/self/measures` |

## You · People and dates (5)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [ ] | `people` | Your people | Push | You → People | `/you/people/people` |
| [ ] | `person` | A person | Push | People → a person | `/you/people/person` |
| [ ] | `addperson` | Add people from contacts | Sheet | People → + | `/(sheets)/addperson` · formSheet |
| [ ] | `birthdaynudge` | A birthday, on Today | Card | Today, 4 days before | component on Today / anywhere |
| [ ] | `dates` | Important dates | Push | People → Dates | `/you/people/dates` |

## You · Settings and account (14)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [ ] | `plus` | life+ | Sheet | a locked feature or Settings | `/(sheets)/plus` · formSheet |
| [ ] | `settings` | Settings | Push | You → Settings | `/you/settings/settings` |
| [ ] | `notifs` | Notifications | Push | Settings | `/you/settings/notifs` |
| [ ] | `ondevice` | Private mode: AI on your phone | Push | Settings → Private mode | `/you/settings/ondevice` |
| [ ] | `yourai` | Your data in your AI | Push | Settings → Your AI | `/you/settings/yourai` |
| [ ] | `appearance` | Look, sound and feel | Push | Settings | `/you/settings/appearance` |
| [ ] | `services` | Connected services | Push | Settings | `/you/settings/services` |
| [ ] | `privacy` | Your data | Push | Settings | `/you/settings/privacy` |
| [ ] | `deleteacct` | Delete your account | Push | Your data | `/you/settings/deleteacct` |
| [ ] | `subscription` | Your life+ | Push | Settings → life+ | `/you/settings/subscription` |
| [ ] | `plussuccess` | Welcome to life+ | Full screen | after subscribing | `/(flows)/plussuccess` · fullScreenModal |
| [ ] | `help` | Help | Push | Settings | `/you/settings/help` |
| [ ] | `legal` | About life | Push | Settings | `/you/settings/legal` |
| [ ] | `aimodels` | What stays on your phone | Push | Private mode → What downloads | `/you/settings/aimodels` |

## Grow (4)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [ ] | `recap` | Weekly recap | Full screen | Sunday, on Today | `/(flows)/moments/recap` · fullScreenModal |
| [ ] | `vantage` | Vantage point | Full screen | when earned | `/(flows)/moments/vantage` · fullScreenModal |
| [ ] | `levelup` | Level up | Full screen | when earned | `/(flows)/moments/levelup` · fullScreenModal |
| [ ] | `yourbirthday` | Your year | Full screen | your birthday, on Today | `/(flows)/moments/yourbirthday` · fullScreenModal |

## States (12)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [ ] | `emptytoday` | Today, on day one | State | Today on day one | state of its parent screen |
| [ ] | `offline` | Offline and errors | State | no connection | state of its parent screen |
| [ ] | `loadingtoday` | Today, loading | State | Today while loading | state of its parent screen |
| [ ] | `emptyplan` | Plan, on day one | State | Plan on day one | state of its parent screen |
| [ ] | `emptybody` | Body, with no device | State | Body with no device | state of its parent screen |
| [ ] | `connectfail` | A device stopped syncing | State | Body when a device stops syncing | state of its parent screen |
| [ ] | `support` | Need support now | Push | You → Help, or offered when needed | `/states/support` |
| [ ] | `permdenied` | A permission you said no to | State | a declined permission | state of its parent screen |
| [ ] | `syncissue` | Two phones disagree | Sheet | two devices disagree | `/(sheets)/syncissue` · formSheet |
| [ ] | `aidown` | life’s AI is having a moment | State | AI unavailable | state of its parent screen |
| [ ] | `forceupdate` | Update needed | Full screen | old version | `/(flows)/forceupdate` · fullScreenModal |
| [ ] | `signedout` | Welcome back | State | after sign-out or new phone | state of its parent screen |

## Outside the app (6)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [ ] | `widgets` | Widgets and Live Activity | Home / Lock Screen | iOS | platform target (Home / Lock Screen) |
| [ ] | `sharecard` | Weekly recap, shared | Share sheet | Weekly recap → Share | platform target (Share sheet) |
| [ ] | `watch` | Watch companion | Watch | Apple Watch / Wear OS | platform target (Watch) |
| [ ] | `lockpush` | Notifications | Notification | Lock Screen | platform target (Notification) |
| [ ] | `androidwidget` | Android widgets | Home screen | Android | platform target (Home screen) |
| [ ] | `siri` | Siri and Shortcuts | Voice | Siri / Assistant | platform target (Voice) |

## The orb and motion (3)

| ✓ | Key | Screen | Opens as | From | Route |
|---|---|---|---|---|---|
| [ ] | `orb` | The orb, evolving | Component | everywhere | `@/design` + `/design` |
| [ ] | `topbars` | The top bar, everywhere | Component | everywhere | `@/design` + `/design` |
| [ ] | `orbnext` | Orb states, next | Component | everywhere | `@/design` + `/design` |

