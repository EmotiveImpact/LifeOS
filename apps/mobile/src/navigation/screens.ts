/** Exact route catalogue from SCREENS.md. States and components are not routes. */
export const screens = {
  "welcome": {
    "key": "welcome",
    "title": "Welcome",
    "kind": "Full screen",
    "from": "first launch",
    "route": "/(flows)/onboarding/welcome",
    "chapter": "First open"
  },
  "agecheck": {
    "key": "agecheck",
    "title": "Your date of birth",
    "kind": "Full screen",
    "from": "Welcome (18+ check, gap list)",
    "route": "/(flows)/onboarding/agecheck",
    "chapter": "First open"
  },
  "question": {
    "key": "question",
    "title": "One question at a time",
    "kind": "Full screen",
    "from": "Welcome",
    "route": "/(flows)/onboarding/question",
    "chapter": "First open"
  },
  "tell": {
    "key": "tell",
    "title": "Or just tell life",
    "kind": "Full screen",
    "from": "Welcome → “Or just tell life”",
    "route": "/(flows)/onboarding/tell",
    "chapter": "First open"
  },
  "building": {
    "key": "building",
    "title": "Building your plan",
    "kind": "Full screen",
    "from": "end of setup",
    "route": "/(flows)/onboarding/building",
    "chapter": "First open"
  },
  "where": {
    "key": "where",
    "title": "Where do you live?",
    "kind": "Full screen",
    "from": "setup",
    "route": "/(flows)/onboarding/where",
    "chapter": "First open"
  },
  "signin": {
    "key": "signin",
    "title": "Save your progress",
    "kind": "Sheet",
    "from": "after the plan is built",
    "route": "/(sheets)/signin",
    "chapter": "First open"
  },
  "healthconsent": {
    "key": "healthconsent",
    "title": "Your health data",
    "kind": "Full screen",
    "from": "setup, Body or Settings (consent, gap list)",
    "route": "/(flows)/onboarding/healthconsent",
    "chapter": "First open"
  },
  "healthprimer": {
    "key": "healthprimer",
    "title": "Before Apple Health asks",
    "kind": "Full screen",
    "from": "setup or Body",
    "route": "/(flows)/onboarding/healthprimer",
    "chapter": "First open"
  },
  "notifprimer": {
    "key": "notifprimer",
    "title": "One nudge a day, at most",
    "kind": "Full screen",
    "from": "setup",
    "route": "/(flows)/onboarding/notifprimer",
    "chapter": "First open"
  },
  "micprimer": {
    "key": "micprimer",
    "title": "Before the mic asks",
    "kind": "Full screen",
    "from": "first Talk",
    "route": "/(flows)/onboarding/micprimer",
    "chapter": "First open"
  },
  "camprimer": {
    "key": "camprimer",
    "title": "Before the camera asks",
    "kind": "Full screen",
    "from": "first snap or scan",
    "route": "/(flows)/onboarding/camprimer",
    "chapter": "First open"
  },
  "calprimer": {
    "key": "calprimer",
    "title": "Before the calendar asks",
    "kind": "Full screen",
    "from": "setup or Calendar-aware day",
    "route": "/(flows)/onboarding/calprimer",
    "chapter": "First open"
  },
  "devicesetup": {
    "key": "devicesetup",
    "title": "Connect what you wear",
    "kind": "Full screen",
    "from": "setup",
    "route": "/(flows)/onboarding/devicesetup",
    "chapter": "First open"
  },
  "firstmove": {
    "key": "firstmove",
    "title": "Your first move",
    "kind": "Full screen",
    "from": "end of setup",
    "route": "/(flows)/onboarding/firstmove",
    "chapter": "First open"
  },
  "measuresetup": {
    "key": "measuresetup",
    "title": "Your body, in three numbers",
    "kind": "Full screen",
    "from": "setup, after where you live",
    "route": "/(flows)/onboarding/measuresetup",
    "chapter": "First open"
  },
  "today": {
    "key": "today",
    "title": "Today (home)",
    "kind": "Tab",
    "from": "tab bar",
    "route": "/(tabs)/today",
    "chapter": "Tab 1 · Today"
  },
  "nudge": {
    "key": "nudge",
    "title": "Nudge",
    "kind": "Card / notification",
    "from": "Today or Lock Screen",
    "route": null,
    "chapter": "Tab 1 · Today"
  },
  "pulse": {
    "key": "pulse",
    "title": "Pulse",
    "kind": "Sheet",
    "from": "Today check-in",
    "route": "/(sheets)/pulse",
    "chapter": "Tab 1 · Today"
  },
  "checkin": {
    "key": "checkin",
    "title": "Checking in",
    "kind": "Sheet",
    "from": "Today",
    "route": "/(sheets)/checkin",
    "chapter": "Tab 1 · Today"
  },
  "customise": {
    "key": "customise",
    "title": "Customise Today",
    "kind": "Sheet",
    "from": "Today → edit",
    "route": "/(sheets)/customise",
    "chapter": "Tab 1 · Today"
  },
  "routines": {
    "key": "routines",
    "title": "Your routines",
    "kind": "Push",
    "from": "Today → routines",
    "route": "/today/routines",
    "chapter": "Tab 1 · Today"
  },
  "why": {
    "key": "why",
    "title": "Why am I seeing this?",
    "kind": "Sheet",
    "from": "“Why am I seeing this?” on any card",
    "route": "/(sheets)/why",
    "chapter": "Tab 1 · Today"
  },
  "calendar": {
    "key": "calendar",
    "title": "Calendar-aware day",
    "kind": "Push",
    "from": "Today → day strip",
    "route": "/today/calendar",
    "chapter": "Tab 1 · Today"
  },
  "morningbrief": {
    "key": "morningbrief",
    "title": "Morning brief",
    "kind": "Sheet",
    "from": "first open of the day",
    "route": "/(sheets)/morningbrief",
    "chapter": "Tab 1 · Today"
  },
  "evening": {
    "key": "evening",
    "title": "Close the day",
    "kind": "Sheet",
    "from": "evening notification or Today",
    "route": "/(sheets)/evening",
    "chapter": "Tab 1 · Today"
  },
  "inbox": {
    "key": "inbox",
    "title": "From life",
    "kind": "Push",
    "from": "bell on Today",
    "route": "/today/inbox",
    "chapter": "Tab 1 · Today"
  },
  "search": {
    "key": "search",
    "title": "Search everything",
    "kind": "Overlay",
    "from": "pull down on Today",
    "route": null,
    "chapter": "Tab 1 · Today"
  },
  "focus": {
    "key": "focus",
    "title": "Focus session",
    "kind": "Full screen",
    "from": "Today or a calendar gap",
    "route": "/(flows)/focus",
    "chapter": "Tab 1 · Today"
  },
  "talk": {
    "key": "talk",
    "title": "Talk",
    "kind": "Full screen",
    "from": "hold the Talk button",
    "route": "/(flows)/talk",
    "chapter": "Talk and file"
  },
  "understood": {
    "key": "understood",
    "title": "Understood",
    "kind": "Sheet",
    "from": "after Talk",
    "route": "/(sheets)/understood",
    "chapter": "Talk and file"
  },
  "ask": {
    "key": "ask",
    "title": "Ask, then file",
    "kind": "Full screen",
    "from": "Chat → a question",
    "route": "/(flows)/ask",
    "chapter": "Talk and file"
  },
  "attach": {
    "key": "attach",
    "title": "Attach",
    "kind": "Full screen",
    "from": "+ in Chat",
    "route": "/(flows)/attach",
    "chapter": "Talk and file"
  },
  "scan": {
    "key": "scan",
    "title": "Letter, understood",
    "kind": "Full screen",
    "from": "+ → Scan a letter",
    "route": "/(flows)/scan",
    "chapter": "Talk and file"
  },
  "chat": {
    "key": "chat",
    "title": "Chat",
    "kind": "Full screen",
    "from": "tap the Talk button",
    "route": "/(flows)/chat",
    "chapter": "Talk and file"
  },
  "chathistory": {
    "key": "chathistory",
    "title": "Your conversations",
    "kind": "Push",
    "from": "Chat → ⋯",
    "route": "/talk/chathistory",
    "chapter": "Talk and file"
  },
  "editfiled": {
    "key": "editfiled",
    "title": "Edit what life filed",
    "kind": "Sheet",
    "from": "tap any filed item",
    "route": "/(sheets)/editfiled",
    "chapter": "Talk and file"
  },
  "plan": {
    "key": "plan",
    "title": "Plan",
    "kind": "Tab",
    "from": "tab bar",
    "route": "/(tabs)/plan",
    "chapter": "Tab 2 · Plan"
  },
  "mission": {
    "key": "mission",
    "title": "Mission",
    "kind": "Push",
    "from": "any mission",
    "route": "/plan/mission",
    "chapter": "Tab 2 · Plan"
  },
  "draft": {
    "key": "draft",
    "title": "Draft message",
    "kind": "Sheet",
    "from": "a mission step",
    "route": "/(sheets)/draft",
    "chapter": "Tab 2 · Plan"
  },
  "ttk": {
    "key": "ttk",
    "title": "Things to know",
    "kind": "Push",
    "from": "Plan → Things to know",
    "route": "/plan/ttk",
    "chapter": "Tab 2 · Plan"
  },
  "history": {
    "key": "history",
    "title": "Missions history",
    "kind": "Push",
    "from": "Missions → Cleared",
    "route": "/plan/history",
    "chapter": "Tab 2 · Plan"
  },
  "missions": {
    "key": "missions",
    "title": "All missions",
    "kind": "Push",
    "from": "Plan → Missions",
    "route": "/plan/missions",
    "chapter": "Tab 2 · Plan"
  },
  "newgoal": {
    "key": "newgoal",
    "title": "Add something",
    "kind": "Sheet",
    "from": "+ on Plan",
    "route": "/(sheets)/newgoal",
    "chapter": "Tab 2 · Plan"
  },
  "areahome": {
    "key": "areahome",
    "title": "Area: Home",
    "kind": "Push",
    "from": "Plan → Home",
    "route": "/plan/areahome",
    "chapter": "Tab 2 · Plan"
  },
  "areahealth": {
    "key": "areahealth",
    "title": "Area: Health",
    "kind": "Push",
    "from": "Plan → Health",
    "route": "/plan/areahealth",
    "chapter": "Tab 2 · Plan"
  },
  "areawork": {
    "key": "areawork",
    "title": "Area: Work",
    "kind": "Push",
    "from": "Plan → Work",
    "route": "/plan/areawork",
    "chapter": "Tab 2 · Plan"
  },
  "aimnew": {
    "key": "aimnew",
    "title": "Write your Aim",
    "kind": "Full screen",
    "from": "setup or Plan → Aim",
    "route": "/(flows)/aimnew",
    "chapter": "Your Chief Aim"
  },
  "aim": {
    "key": "aim",
    "title": "Your Aim",
    "kind": "Push",
    "from": "Aim pinned on Plan",
    "route": "/plan/aim/aim",
    "chapter": "Your Chief Aim"
  },
  "gambit": {
    "key": "gambit",
    "title": "This month's gambit",
    "kind": "Push",
    "from": "Aim → this month",
    "route": "/plan/aim/gambit",
    "chapter": "Your Chief Aim"
  },
  "glimpse": {
    "key": "glimpse",
    "title": "A glimpse, earned",
    "kind": "Full screen",
    "from": "earned, on Today",
    "route": "/(flows)/glimpse",
    "chapter": "Your Chief Aim"
  },
  "money": {
    "key": "money",
    "title": "Money",
    "kind": "Push",
    "from": "Money area",
    "route": "/plan/money/money",
    "chapter": "Plan · Money"
  },
  "subs": {
    "key": "subs",
    "title": "Subscriptions",
    "kind": "Push",
    "from": "Money → Subscriptions",
    "route": "/plan/money/subs",
    "chapter": "Plan · Money"
  },
  "area": {
    "key": "area",
    "title": "Area: Money",
    "kind": "Push",
    "from": "Plan → Money",
    "route": "/plan/money/area",
    "chapter": "Plan · Money"
  },
  "txn": {
    "key": "txn",
    "title": "A payment",
    "kind": "Push",
    "from": "Money → a payment",
    "route": "/plan/money/txn",
    "chapter": "Plan · Money"
  },
  "bill": {
    "key": "bill",
    "title": "A bill",
    "kind": "Push",
    "from": "Money → a bill",
    "route": "/plan/money/bill",
    "chapter": "Plan · Money"
  },
  "budget": {
    "key": "budget",
    "title": "Budget",
    "kind": "Push",
    "from": "Money → Budget",
    "route": "/plan/money/budget",
    "chapter": "Plan · Money"
  },
  "networth": {
    "key": "networth",
    "title": "Net worth",
    "kind": "Push",
    "from": "Money → Net worth",
    "route": "/plan/money/networth",
    "chapter": "Plan · Money"
  },
  "connectbank": {
    "key": "connectbank",
    "title": "Connect your bank",
    "kind": "Full screen",
    "from": "Money → Connect",
    "route": "/(flows)/connectbank",
    "chapter": "Plan · Money"
  },
  "vault": {
    "key": "vault",
    "title": "Documents and renewals",
    "kind": "Push",
    "from": "Plan → Documents",
    "route": "/plan/documents/vault",
    "chapter": "Plan · Documents and renewals"
  },
  "docdetail": {
    "key": "docdetail",
    "title": "Passport",
    "kind": "Push",
    "from": "Documents → a document",
    "route": "/plan/documents/docdetail",
    "chapter": "Plan · Documents and renewals"
  },
  "renewal": {
    "key": "renewal",
    "title": "Renewal: car insurance",
    "kind": "Push",
    "from": "Documents or Today, when it’s time",
    "route": "/plan/documents/renewal",
    "chapter": "Plan · Documents and renewals"
  },
  "cashplan": {
    "key": "cashplan",
    "title": "30-day cash plan",
    "kind": "Push",
    "from": "Toolkit",
    "route": "/plan/tools/cashplan",
    "chapter": "The toolkit"
  },
  "taxcheck": {
    "key": "taxcheck",
    "title": "Tax & NI check",
    "kind": "Push",
    "from": "Toolkit or Money",
    "route": "/plan/tools/taxcheck",
    "chapter": "The toolkit"
  },
  "income": {
    "key": "income",
    "title": "Income & structure",
    "kind": "Push",
    "from": "Toolkit or Work",
    "route": "/plan/tools/income",
    "chapter": "The toolkit"
  },
  "rentbuy": {
    "key": "rentbuy",
    "title": "Rent vs buy",
    "kind": "Push",
    "from": "Toolkit or Home",
    "route": "/plan/tools/rentbuy",
    "chapter": "The toolkit"
  },
  "blood": {
    "key": "blood",
    "title": "Bloodwork reader",
    "kind": "Push",
    "from": "Toolkit or Health",
    "route": "/plan/tools/blood",
    "chapter": "The toolkit"
  },
  "protect": {
    "key": "protect",
    "title": "Protection review",
    "kind": "Push",
    "from": "Toolkit",
    "route": "/plan/tools/protect",
    "chapter": "The toolkit"
  },
  "growth": {
    "key": "growth",
    "title": "Growth path",
    "kind": "Push",
    "from": "Toolkit",
    "route": "/plan/tools/growth",
    "chapter": "The toolkit"
  },
  "bedrooms": {
    "key": "bedrooms",
    "title": "Your next home: bedrooms",
    "kind": "Push",
    "from": "Toolkit or Home",
    "route": "/plan/tools/bedrooms",
    "chapter": "The toolkit"
  },
  "buffer": {
    "key": "buffer",
    "title": "How big a buffer?",
    "kind": "Push",
    "from": "Toolkit or Money",
    "route": "/plan/tools/buffer",
    "chapter": "The toolkit"
  },
  "unlock": {
    "key": "unlock",
    "title": "Locked tool",
    "kind": "Sheet",
    "from": "a locked tool",
    "route": "/(sheets)/unlock",
    "chapter": "The toolkit"
  },
  "decisions": {
    "key": "decisions",
    "title": "Bigger decisions",
    "kind": "Push",
    "from": "Toolkit → Bigger decisions",
    "route": "/plan/tools/decisions",
    "chapter": "The toolkit"
  },
  "tools": {
    "key": "tools",
    "title": "All tools",
    "kind": "Push",
    "from": "Plan → Toolkit",
    "route": "/plan/tools/tools",
    "chapter": "The toolkit"
  },
  "healthstack": {
    "key": "healthstack",
    "title": "Health stack",
    "kind": "Push",
    "from": "Toolkit or Health",
    "route": "/plan/tools/healthstack",
    "chapter": "The toolkit"
  },
  "body": {
    "key": "body",
    "title": "Body",
    "kind": "Push",
    "from": "Plan → Body or Today’s body card",
    "route": "/plan/body/body",
    "chapter": "Body"
  },
  "devices": {
    "key": "devices",
    "title": "Connect devices",
    "kind": "Push",
    "from": "Body → Sources",
    "route": "/plan/body/devices",
    "chapter": "Body"
  },
  "readiness": {
    "key": "readiness",
    "title": "Readiness",
    "kind": "Push",
    "from": "Body",
    "route": "/plan/body/readiness",
    "chapter": "Body"
  },
  "sleep": {
    "key": "sleep",
    "title": "Sleep",
    "kind": "Push",
    "from": "Body",
    "route": "/plan/body/sleep",
    "chapter": "Body"
  },
  "load": {
    "key": "load",
    "title": "Load",
    "kind": "Push",
    "from": "Body",
    "route": "/plan/body/load",
    "chapter": "Body"
  },
  "trends": {
    "key": "trends",
    "title": "Trends",
    "kind": "Push",
    "from": "Body",
    "route": "/plan/body/trends",
    "chapter": "Body"
  },
  "hrv": {
    "key": "hrv",
    "title": "Metric detail: HRV",
    "kind": "Push",
    "from": "Readiness → HRV",
    "route": "/plan/body/hrv",
    "chapter": "Body"
  },
  "signals": {
    "key": "signals",
    "title": "Body signals",
    "kind": "Push",
    "from": "Body",
    "route": "/plan/body/signals",
    "chapter": "Body"
  },
  "stress": {
    "key": "stress",
    "title": "Stress today",
    "kind": "Push",
    "from": "Body",
    "route": "/plan/body/stress",
    "chapter": "Body"
  },
  "breathe": {
    "key": "breathe",
    "title": "Breathe",
    "kind": "Full screen",
    "from": "Stress or a nudge",
    "route": "/(flows)/breathe",
    "chapter": "Body"
  },
  "journal": {
    "key": "journal",
    "title": "Evening journal",
    "kind": "Sheet",
    "from": "evening",
    "route": "/(sheets)/journal",
    "chapter": "Body"
  },
  "insights": {
    "key": "insights",
    "title": "Journal insights",
    "kind": "Push",
    "from": "Journal",
    "route": "/plan/body/insights",
    "chapter": "Body"
  },
  "workout": {
    "key": "workout",
    "title": "Live workout",
    "kind": "Full screen",
    "from": "start a workout",
    "route": "/(flows)/workout",
    "chapter": "Body"
  },
  "detected": {
    "key": "detected",
    "title": "Workouts we spotted",
    "kind": "Push",
    "from": "Body",
    "route": "/plan/body/detected",
    "chapter": "Body"
  },
  "sleepplan": {
    "key": "sleepplan",
    "title": "Sleep planner",
    "kind": "Push",
    "from": "Sleep",
    "route": "/plan/body/sleepplan",
    "chapter": "Body"
  },
  "math": {
    "key": "math",
    "title": "How scores work",
    "kind": "Push",
    "from": "any score → How it works",
    "route": "/plan/body/math",
    "chapter": "Body"
  },
  "coach": {
    "key": "coach",
    "title": "Ask about your body",
    "kind": "Full screen",
    "from": "Body → Ask",
    "route": "/(flows)/coach",
    "chapter": "Body"
  },
  "forecast": {
    "key": "forecast",
    "title": "Tomorrow's forecast",
    "kind": "Push",
    "from": "Readiness",
    "route": "/plan/body/forecast",
    "chapter": "Body"
  },
  "cycle": {
    "key": "cycle",
    "title": "Cycle-aware readiness",
    "kind": "Push",
    "from": "Body (opt-in)",
    "route": "/plan/body/cycle",
    "chapter": "Body"
  },
  "fitnessage": {
    "key": "fitnessage",
    "title": "Fitness age",
    "kind": "Push",
    "from": "Body",
    "route": "/plan/body/fitnessage",
    "chapter": "Body"
  },
  "sources": {
    "key": "sources",
    "title": "One picture from all your devices",
    "kind": "Push",
    "from": "Body → Sources",
    "route": "/plan/body/sources",
    "chapter": "Body"
  },
  "cgm": {
    "key": "cgm",
    "title": "Glucose, after meals",
    "kind": "Push",
    "from": "Body (with a sensor)",
    "route": "/plan/body/cgm",
    "chapter": "Body"
  },
  "basics": {
    "key": "basics",
    "title": "Water, sitting and recovery",
    "kind": "Push",
    "from": "Body",
    "route": "/plan/body/basics",
    "chapter": "Body"
  },
  "sleepnight": {
    "key": "sleepnight",
    "title": "One night",
    "kind": "Push",
    "from": "Sleep → a night",
    "route": "/plan/body/sleepnight",
    "chapter": "Body"
  },
  "workoutdetail": {
    "key": "workoutdetail",
    "title": "A past workout",
    "kind": "Push",
    "from": "Load → a workout",
    "route": "/plan/body/workoutdetail",
    "chapter": "Body"
  },
  "weight": {
    "key": "weight",
    "title": "Weight and body",
    "kind": "Push",
    "from": "Body",
    "route": "/plan/body/weight",
    "chapter": "Body"
  },
  "bmi": {
    "key": "bmi",
    "title": "BMI and waist, explained",
    "kind": "Push",
    "from": "Body numbers → BMI",
    "route": "/plan/body/bmi",
    "chapter": "Body"
  },
  "strain": {
    "key": "strain",
    "title": "Today’s target load",
    "kind": "Push",
    "from": "Body → Load",
    "route": "/plan/body/strain",
    "chapter": "Body"
  },
  "zones": {
    "key": "zones",
    "title": "Your heart-rate zones",
    "kind": "Push",
    "from": "Load → Zones",
    "route": "/plan/body/zones",
    "chapter": "Body"
  },
  "illness": {
    "key": "illness",
    "title": "Something may be coming on",
    "kind": "Card / push",
    "from": "Today, when signals rise",
    "route": null,
    "chapter": "Body"
  },
  "breathlib": {
    "key": "breathlib",
    "title": "Breathing library",
    "kind": "Push",
    "from": "Body → Breathe",
    "route": "/plan/body/breathlib",
    "chapter": "Body"
  },
  "provenance": {
    "key": "provenance",
    "title": "Where this number came from",
    "kind": "Sheet",
    "from": "tap any score",
    "route": "/(sheets)/provenance",
    "chapter": "Body"
  },
  "regularity": {
    "key": "regularity",
    "title": "Sleep regularity",
    "kind": "Push",
    "from": "Sleep → Regularity",
    "route": "/plan/body/regularity",
    "chapter": "Body"
  },
  "loadtrend": {
    "key": "loadtrend",
    "title": "Training load trend",
    "kind": "Push",
    "from": "Load → Trend",
    "route": "/plan/body/loadtrend",
    "chapter": "Body"
  },
  "healthdigest": {
    "key": "healthdigest",
    "title": "Your body this week",
    "kind": "Push",
    "from": "Sunday, on Today",
    "route": "/plan/body/healthdigest",
    "chapter": "Body"
  },
  "snap": {
    "key": "snap",
    "title": "Snap a meal",
    "kind": "Full screen",
    "from": "Fuel → camera",
    "route": "/(flows)/snap",
    "chapter": "Plan · Body · Fuel"
  },
  "confirm": {
    "key": "confirm",
    "title": "Confirm the meal",
    "kind": "Sheet",
    "from": "after a snap",
    "route": "/(sheets)/confirm",
    "chapter": "Plan · Body · Fuel"
  },
  "fuel": {
    "key": "fuel",
    "title": "Fuel",
    "kind": "Push",
    "from": "Body → Fuel",
    "route": "/plan/body/fuel/fuel",
    "chapter": "Plan · Body · Fuel"
  },
  "mealresult": {
    "key": "mealresult",
    "title": "Meal, logged",
    "kind": "Push",
    "from": "after confirming",
    "route": "/plan/body/fuel/mealresult",
    "chapter": "Plan · Body · Fuel"
  },
  "cook": {
    "key": "cook",
    "title": "What can I cook?",
    "kind": "Push",
    "from": "Fuel → What can I cook?",
    "route": "/plan/body/fuel/cook",
    "chapter": "Plan · Body · Fuel"
  },
  "mealplan": {
    "key": "mealplan",
    "title": "A week of meals",
    "kind": "Push",
    "from": "Fuel → Week",
    "route": "/plan/body/fuel/mealplan",
    "chapter": "Plan · Body · Fuel"
  },
  "sayit": {
    "key": "sayit",
    "title": "Say what you ate",
    "kind": "Sheet",
    "from": "Fuel → Say it",
    "route": "/(sheets)/sayit",
    "chapter": "Plan · Body · Fuel"
  },
  "foodday": {
    "key": "foodday",
    "title": "A day of food",
    "kind": "Push",
    "from": "Fuel → a day",
    "route": "/plan/body/fuel/foodday",
    "chapter": "Plan · Body · Fuel"
  },
  "barcode": {
    "key": "barcode",
    "title": "Scan a barcode",
    "kind": "Full screen",
    "from": "Fuel → barcode",
    "route": "/(flows)/barcode",
    "chapter": "Plan · Body · Fuel"
  },
  "foodsearch": {
    "key": "foodsearch",
    "title": "Search for a food",
    "kind": "Push",
    "from": "Fuel → search",
    "route": "/plan/body/fuel/foodsearch",
    "chapter": "Plan · Body · Fuel"
  },
  "fuelhome": {
    "key": "fuelhome",
    "title": "Fuel, at a glance",
    "kind": "Push",
    "from": "Body → Fuel",
    "route": "/plan/body/fuel/fuelhome",
    "chapter": "Plan · Body · Fuel"
  },
  "fuelgoal": {
    "key": "fuelgoal",
    "title": "Your food targets",
    "kind": "Push",
    "from": "Fuel → Targets",
    "route": "/plan/body/fuel/fuelgoal",
    "chapter": "Plan · Body · Fuel"
  },
  "savedmeals": {
    "key": "savedmeals",
    "title": "Saved meals",
    "kind": "Push",
    "from": "Fuel → Saved",
    "route": "/plan/body/fuel/savedmeals",
    "chapter": "Plan · Body · Fuel"
  },
  "fuelprogress": {
    "key": "fuelprogress",
    "title": "Food and weight, over time",
    "kind": "Push",
    "from": "Fuel → Progress",
    "route": "/plan/body/fuel/fuelprogress",
    "chapter": "Plan · Body · Fuel"
  },
  "exerciseadd": {
    "key": "exerciseadd",
    "title": "Exercise, added back",
    "kind": "Push",
    "from": "Fuel → Settings",
    "route": "/plan/body/fuel/exerciseadd",
    "chapter": "Plan · Body · Fuel"
  },
  "fuelplan": {
    "key": "fuelplan",
    "title": "Your plan is ready",
    "kind": "Full screen",
    "from": "end of food setup",
    "route": "/(flows)/fuelplan",
    "chapter": "Plan · Body · Fuel"
  },
  "weighin": {
    "key": "weighin",
    "title": "Log your weight",
    "kind": "Sheet",
    "from": "Fuel → Weight or Today",
    "route": "/(sheets)/weighin",
    "chapter": "Plan · Body · Fuel"
  },
  "labelscan": {
    "key": "labelscan",
    "title": "Scan a nutrition label",
    "kind": "Full screen",
    "from": "Snap → Label",
    "route": "/(flows)/labelscan",
    "chapter": "Plan · Body · Fuel"
  },
  "menuscan": {
    "key": "menuscan",
    "title": "What should I order?",
    "kind": "Push",
    "from": "Snap → Menu",
    "route": "/plan/body/fuel/menuscan",
    "chapter": "Plan · Body · Fuel"
  },
  "fixwords": {
    "key": "fixwords",
    "title": "Fix it in your own words",
    "kind": "Sheet",
    "from": "a logged meal → Fix",
    "route": "/(sheets)/fixwords",
    "chapter": "Plan · Body · Fuel"
  },
  "nutrients": {
    "key": "nutrients",
    "title": "Everything you ate today",
    "kind": "Push",
    "from": "Fuel → Nutrients",
    "route": "/plan/body/fuel/nutrients",
    "chapter": "Plan · Body · Fuel"
  },
  "describeexercise": {
    "key": "describeexercise",
    "title": "Describe a workout",
    "kind": "Sheet",
    "from": "Fuel or Load → + Activity",
    "route": "/(sheets)/describeexercise",
    "chapter": "Plan · Body · Fuel"
  },
  "weekbudget": {
    "key": "weekbudget",
    "title": "Your week, not just today",
    "kind": "Push",
    "from": "Fuel → Week",
    "route": "/plan/body/fuel/weekbudget",
    "chapter": "Plan · Body · Fuel"
  },
  "mealtiming": {
    "key": "mealtiming",
    "title": "Meals and your sleep",
    "kind": "Push",
    "from": "Fuel → Insights",
    "route": "/plan/body/fuel/mealtiming",
    "chapter": "Plan · Body · Fuel"
  },
  "foodquality": {
    "key": "foodquality",
    "title": "Food quality",
    "kind": "Push",
    "from": "Fuel → Insights",
    "route": "/plan/body/fuel/foodquality",
    "chapter": "Plan · Body · Fuel"
  },
  "alcohol": {
    "key": "alcohol",
    "title": "Alcohol",
    "kind": "Push",
    "from": "Fuel → Alcohol",
    "route": "/plan/body/fuel/alcohol",
    "chapter": "Plan · Body · Fuel"
  },
  "quicklog": {
    "key": "quicklog",
    "title": "Log in two taps",
    "kind": "Sheet",
    "from": "+ on Fuel",
    "route": "/(sheets)/quicklog",
    "chapter": "Plan · Body · Fuel"
  },
  "importfood": {
    "key": "importfood",
    "title": "Bring your history",
    "kind": "Push",
    "from": "Fuel → Settings → Import",
    "route": "/plan/body/fuel/importfood",
    "chapter": "Plan · Body · Fuel"
  },
  "habits": {
    "key": "habits",
    "title": "Habits",
    "kind": "Push",
    "from": "Body → Habits",
    "route": "/plan/body/habits/habits",
    "chapter": "Plan · Body · Habits"
  },
  "habitnew": {
    "key": "habitnew",
    "title": "New habit",
    "kind": "Sheet",
    "from": "Habits → +",
    "route": "/(sheets)/habitnew",
    "chapter": "Plan · Body · Habits"
  },
  "strength": {
    "key": "strength",
    "title": "Habit strength",
    "kind": "Push",
    "from": "a habit",
    "route": "/plan/body/habits/strength",
    "chapter": "Plan · Body · Habits"
  },
  "library": {
    "key": "library",
    "title": "Learn",
    "kind": "Push",
    "from": "Plan → Learn",
    "route": "/plan/learn/library",
    "chapter": "Learn from the best"
  },
  "lens": {
    "key": "lens",
    "title": "A lens",
    "kind": "Push",
    "from": "Learn → a lens",
    "route": "/plan/learn/lens",
    "chapter": "Learn from the best"
  },
  "idea": {
    "key": "idea",
    "title": "An idea, in 60 seconds",
    "kind": "Full screen",
    "from": "Learn or Today",
    "route": "/(flows)/idea",
    "chapter": "Learn from the best"
  },
  "lensask": {
    "key": "lensask",
    "title": "Ask through a lens",
    "kind": "Full screen",
    "from": "a lens → Ask",
    "route": "/(flows)/lensask",
    "chapter": "Learn from the best"
  },
  "recall": {
    "key": "recall",
    "title": "Quick recall",
    "kind": "Sheet",
    "from": "Today, when due",
    "route": "/(sheets)/recall",
    "chapter": "Learn from the best"
  },
  "learning": {
    "key": "learning",
    "title": "Ideas into action",
    "kind": "Push",
    "from": "Learn → Into action",
    "route": "/plan/learn/learning",
    "chapter": "Learn from the best"
  },
  "teach": {
    "key": "teach",
    "title": "Teach it back",
    "kind": "Full screen",
    "from": "end of an idea",
    "route": "/(flows)/teach",
    "chapter": "Learn from the best"
  },
  "hill": {
    "key": "hill",
    "title": "Lens: definiteness of purpose",
    "kind": "Push",
    "from": "Learn or Aim",
    "route": "/plan/learn/hill",
    "chapter": "Learn from the best"
  },
  "learned": {
    "key": "learned",
    "title": "What you’ve learned",
    "kind": "Push",
    "from": "Learn → What you’ve learned",
    "route": "/plan/learn/learned",
    "chapter": "Learn from the best"
  },
  "drawkit": {
    "key": "drawkit",
    "title": "Pictures that teach",
    "kind": "Push",
    "from": "Learn → Pictures",
    "route": "/plan/learn/drawkit",
    "chapter": "Learn from the best"
  },
  "teachoffer": {
    "key": "teachoffer",
    "title": "Teach me, right where it’s needed",
    "kind": "Button",
    "from": "anywhere a new term appears",
    "route": null,
    "chapter": "Teach me"
  },
  "lessonready": {
    "key": "lessonready",
    "title": "Your lesson, ready",
    "kind": "Full screen",
    "from": "Teach me",
    "route": "/(flows)/teach/lessonready",
    "chapter": "Teach me"
  },
  "bite": {
    "key": "bite",
    "title": "A bite: one idea, one picture",
    "kind": "Full screen",
    "from": "lesson",
    "route": "/(flows)/teach/bite",
    "chapter": "Teach me"
  },
  "predict": {
    "key": "predict",
    "title": "Guess first, then see",
    "kind": "Full screen",
    "from": "lesson",
    "route": "/(flows)/teach/predict",
    "chapter": "Teach me"
  },
  "puzzle": {
    "key": "puzzle",
    "title": "One quick puzzle",
    "kind": "Full screen",
    "from": "lesson",
    "route": "/(flows)/teach/puzzle",
    "chapter": "Teach me"
  },
  "lessonrecap": {
    "key": "lessonrecap",
    "title": "The whole idea, in three lines",
    "kind": "Full screen",
    "from": "lesson",
    "route": "/(flows)/teach/lessonrecap",
    "chapter": "Teach me"
  },
  "tellback": {
    "key": "tellback",
    "title": "Tell it back to life",
    "kind": "Full screen",
    "from": "lesson",
    "route": "/(flows)/teach/tellback",
    "chapter": "Teach me"
  },
  "gaps": {
    "key": "gaps",
    "title": "What you got, and the one gap",
    "kind": "Full screen",
    "from": "after telling back",
    "route": "/(flows)/teach/gaps",
    "chapter": "Teach me"
  },
  "gotit": {
    "key": "gotit",
    "title": "You’ve got it",
    "kind": "Full screen",
    "from": "end of lesson",
    "route": "/(flows)/teach/gotit",
    "chapter": "Teach me"
  },
  "teachplay": {
    "key": "teachplay",
    "title": "Play the whole lesson",
    "kind": "Prototype",
    "from": "the whole flow",
    "route": null,
    "chapter": "Teach me"
  },
  "bitedrawn": {
    "key": "bitedrawn",
    "title": "A bite, drawn live",
    "kind": "Full screen",
    "from": "lesson",
    "route": "/(flows)/teach/bitedrawn",
    "chapter": "Teach me"
  },
  "you": {
    "key": "you",
    "title": "You",
    "kind": "Tab",
    "from": "tab bar",
    "route": "/(tabs)/you",
    "chapter": "Tab 3 · You"
  },
  "household": {
    "key": "household",
    "title": "Household",
    "kind": "Sheet",
    "from": "your details → lives with",
    "route": "/(sheets)/household",
    "chapter": "Tab 3 · You"
  },
  "mood": {
    "key": "mood",
    "title": "Mood over time",
    "kind": "Push",
    "from": "You → Mood",
    "route": "/you/mood",
    "chapter": "Tab 3 · You"
  },
  "children": {
    "key": "children",
    "title": "Children",
    "kind": "Sheet",
    "from": "your details",
    "route": "/(sheets)/children",
    "chapter": "Tab 3 · You"
  },
  "knows": {
    "key": "knows",
    "title": "What life knows",
    "kind": "Push",
    "from": "You → What life knows",
    "route": "/you/knows",
    "chapter": "Tab 3 · You"
  },
  "levels": {
    "key": "levels",
    "title": "Your levels",
    "kind": "Push",
    "from": "You → Levels",
    "route": "/you/levels",
    "chapter": "Tab 3 · You"
  },
  "experiment": {
    "key": "experiment",
    "title": "Experiment: caffeine",
    "kind": "Push",
    "from": "You → Experiments",
    "route": "/you/experiment",
    "chapter": "Tab 3 · You"
  },
  "memory": {
    "key": "memory",
    "title": "What life remembers",
    "kind": "Push",
    "from": "You → What life remembers",
    "route": "/you/memory",
    "chapter": "Tab 3 · You"
  },
  "shared": {
    "key": "shared",
    "title": "Shared life",
    "kind": "Push",
    "from": "You → Shared",
    "route": "/you/shared",
    "chapter": "Tab 3 · You"
  },
  "profile": {
    "key": "profile",
    "title": "Your details",
    "kind": "Push",
    "from": "You → your details",
    "route": "/you/profile",
    "chapter": "Tab 3 · You"
  },
  "tests": {
    "key": "tests",
    "title": "Know yourself",
    "kind": "Push",
    "from": "You → Know yourself",
    "route": "/you/self/tests",
    "chapter": "You · Know yourself"
  },
  "testq": {
    "key": "testq",
    "title": "One statement at a time",
    "kind": "Full screen",
    "from": "Know yourself → a test",
    "route": "/(flows)/testq",
    "chapter": "You · Know yourself"
  },
  "bigfive": {
    "key": "bigfive",
    "title": "Your personality",
    "kind": "Push",
    "from": "end of the personality test",
    "route": "/you/self/bigfive",
    "chapter": "You · Know yourself"
  },
  "chronotype": {
    "key": "chronotype",
    "title": "Your body clock",
    "kind": "Push",
    "from": "Know yourself",
    "route": "/you/self/chronotype",
    "chapter": "You · Know yourself"
  },
  "values": {
    "key": "values",
    "title": "What matters most",
    "kind": "Push",
    "from": "Know yourself",
    "route": "/you/self/values",
    "chapter": "You · Know yourself"
  },
  "measures": {
    "key": "measures",
    "title": "Your body numbers",
    "kind": "Push",
    "from": "You → Body numbers",
    "route": "/you/self/measures",
    "chapter": "You · Know yourself"
  },
  "people": {
    "key": "people",
    "title": "Your people",
    "kind": "Push",
    "from": "You → People",
    "route": "/you/people/people",
    "chapter": "You · People and dates"
  },
  "person": {
    "key": "person",
    "title": "A person",
    "kind": "Push",
    "from": "People → a person",
    "route": "/you/people/person",
    "chapter": "You · People and dates"
  },
  "addperson": {
    "key": "addperson",
    "title": "Add people from contacts",
    "kind": "Sheet",
    "from": "People → +",
    "route": "/(sheets)/addperson",
    "chapter": "You · People and dates"
  },
  "birthdaynudge": {
    "key": "birthdaynudge",
    "title": "A birthday, on Today",
    "kind": "Card",
    "from": "Today, 4 days before",
    "route": null,
    "chapter": "You · People and dates"
  },
  "dates": {
    "key": "dates",
    "title": "Important dates",
    "kind": "Push",
    "from": "People → Dates",
    "route": "/you/people/dates",
    "chapter": "You · People and dates"
  },
  "plus": {
    "key": "plus",
    "title": "life+",
    "kind": "Sheet",
    "from": "a locked feature or Settings",
    "route": "/(sheets)/plus",
    "chapter": "You · Settings and account"
  },
  "settings": {
    "key": "settings",
    "title": "Settings",
    "kind": "Push",
    "from": "You → Settings",
    "route": "/you/settings/settings",
    "chapter": "You · Settings and account"
  },
  "notifs": {
    "key": "notifs",
    "title": "Notifications",
    "kind": "Push",
    "from": "Settings",
    "route": "/you/settings/notifs",
    "chapter": "You · Settings and account"
  },
  "ondevice": {
    "key": "ondevice",
    "title": "Private mode: AI on your phone",
    "kind": "Push",
    "from": "Settings → Private mode",
    "route": "/you/settings/ondevice",
    "chapter": "You · Settings and account"
  },
  "yourai": {
    "key": "yourai",
    "title": "Your data in your AI",
    "kind": "Push",
    "from": "Settings → Your AI",
    "route": "/you/settings/yourai",
    "chapter": "You · Settings and account"
  },
  "appearance": {
    "key": "appearance",
    "title": "Look, sound and feel",
    "kind": "Push",
    "from": "Settings",
    "route": "/you/settings/appearance",
    "chapter": "You · Settings and account"
  },
  "services": {
    "key": "services",
    "title": "Connected services",
    "kind": "Push",
    "from": "Settings",
    "route": "/you/settings/services",
    "chapter": "You · Settings and account"
  },
  "privacy": {
    "key": "privacy",
    "title": "Your data",
    "kind": "Push",
    "from": "Settings",
    "route": "/you/settings/privacy",
    "chapter": "You · Settings and account"
  },
  "deleteacct": {
    "key": "deleteacct",
    "title": "Delete your account",
    "kind": "Push",
    "from": "Your data",
    "route": "/you/settings/deleteacct",
    "chapter": "You · Settings and account"
  },
  "subscription": {
    "key": "subscription",
    "title": "Your life+",
    "kind": "Push",
    "from": "Settings → life+",
    "route": "/you/settings/subscription",
    "chapter": "You · Settings and account"
  },
  "plussuccess": {
    "key": "plussuccess",
    "title": "Welcome to life+",
    "kind": "Full screen",
    "from": "after subscribing",
    "route": "/(flows)/plussuccess",
    "chapter": "You · Settings and account"
  },
  "help": {
    "key": "help",
    "title": "Help",
    "kind": "Push",
    "from": "Settings",
    "route": "/you/settings/help",
    "chapter": "You · Settings and account"
  },
  "legal": {
    "key": "legal",
    "title": "About life",
    "kind": "Push",
    "from": "Settings",
    "route": "/you/settings/legal",
    "chapter": "You · Settings and account"
  },
  "aimodels": {
    "key": "aimodels",
    "title": "What stays on your phone",
    "kind": "Push",
    "from": "Private mode → What downloads",
    "route": "/you/settings/aimodels",
    "chapter": "You · Settings and account"
  },
  "recap": {
    "key": "recap",
    "title": "Weekly recap",
    "kind": "Full screen",
    "from": "Sunday, on Today",
    "route": "/(flows)/moments/recap",
    "chapter": "Grow"
  },
  "vantage": {
    "key": "vantage",
    "title": "Vantage point",
    "kind": "Full screen",
    "from": "when earned",
    "route": "/(flows)/moments/vantage",
    "chapter": "Grow"
  },
  "levelup": {
    "key": "levelup",
    "title": "Level up",
    "kind": "Full screen",
    "from": "when earned",
    "route": "/(flows)/moments/levelup",
    "chapter": "Grow"
  },
  "yourbirthday": {
    "key": "yourbirthday",
    "title": "Your year",
    "kind": "Full screen",
    "from": "your birthday, on Today",
    "route": "/(flows)/moments/yourbirthday",
    "chapter": "Grow"
  },
  "emptytoday": {
    "key": "emptytoday",
    "title": "Today, on day one",
    "kind": "State",
    "from": "Today on day one",
    "route": null,
    "chapter": "States"
  },
  "offline": {
    "key": "offline",
    "title": "Offline and errors",
    "kind": "State",
    "from": "no connection",
    "route": null,
    "chapter": "States"
  },
  "loadingtoday": {
    "key": "loadingtoday",
    "title": "Today, loading",
    "kind": "State",
    "from": "Today while loading",
    "route": null,
    "chapter": "States"
  },
  "emptyplan": {
    "key": "emptyplan",
    "title": "Plan, on day one",
    "kind": "State",
    "from": "Plan on day one",
    "route": null,
    "chapter": "States"
  },
  "emptybody": {
    "key": "emptybody",
    "title": "Body, with no device",
    "kind": "State",
    "from": "Body with no device",
    "route": null,
    "chapter": "States"
  },
  "connectfail": {
    "key": "connectfail",
    "title": "A device stopped syncing",
    "kind": "State",
    "from": "Body when a device stops syncing",
    "route": null,
    "chapter": "States"
  },
  "support": {
    "key": "support",
    "title": "Need support now",
    "kind": "Push",
    "from": "You → Help, or offered when needed",
    "route": "/states/support",
    "chapter": "States"
  },
  "permdenied": {
    "key": "permdenied",
    "title": "A permission you said no to",
    "kind": "State",
    "from": "a declined permission",
    "route": null,
    "chapter": "States"
  },
  "syncissue": {
    "key": "syncissue",
    "title": "Two phones disagree",
    "kind": "Sheet",
    "from": "two devices disagree",
    "route": "/(sheets)/syncissue",
    "chapter": "States"
  },
  "aidown": {
    "key": "aidown",
    "title": "life’s AI is having a moment",
    "kind": "State",
    "from": "AI unavailable",
    "route": null,
    "chapter": "States"
  },
  "forceupdate": {
    "key": "forceupdate",
    "title": "Update needed",
    "kind": "Full screen",
    "from": "old version",
    "route": "/(flows)/forceupdate",
    "chapter": "States"
  },
  "signedout": {
    "key": "signedout",
    "title": "Welcome back",
    "kind": "State",
    "from": "after sign-out or new phone",
    "route": null,
    "chapter": "States"
  },
  "widgets": {
    "key": "widgets",
    "title": "Widgets and Live Activity",
    "kind": "Home / Lock Screen",
    "from": "iOS",
    "route": "/outside/widgets",
    "chapter": "Outside the app"
  },
  "sharecard": {
    "key": "sharecard",
    "title": "Weekly recap, shared",
    "kind": "Sheet",
    "from": "Weekly recap → Share",
    "route": "/(sheets)/sharecard",
    "chapter": "Outside the app"
  },
  "watch": {
    "key": "watch",
    "title": "Watch companion",
    "kind": "Watch",
    "from": "Apple Watch / Wear OS",
    "route": "/outside/watch",
    "chapter": "Outside the app"
  },
  "lockpush": {
    "key": "lockpush",
    "title": "Notifications",
    "kind": "Notification",
    "from": "Lock Screen",
    "route": "/outside/lockpush",
    "chapter": "Outside the app"
  },
  "androidwidget": {
    "key": "androidwidget",
    "title": "Android widgets",
    "kind": "Home screen",
    "from": "Android",
    "route": "/outside/androidwidget",
    "chapter": "Outside the app"
  },
  "siri": {
    "key": "siri",
    "title": "Siri and Shortcuts",
    "kind": "Voice",
    "from": "Siri / Assistant",
    "route": "/outside/siri",
    "chapter": "Outside the app"
  },
  "orb": {
    "key": "orb",
    "title": "The orb, evolving",
    "kind": "Component",
    "from": "everywhere",
    "route": "/outside/orb",
    "chapter": "The orb and motion"
  },
  "topbars": {
    "key": "topbars",
    "title": "The top bar, everywhere",
    "kind": "Component",
    "from": "everywhere",
    "route": "/outside/topbars",
    "chapter": "The orb and motion"
  },
  "orbnext": {
    "key": "orbnext",
    "title": "Orb states, next",
    "kind": "Component",
    "from": "everywhere",
    "route": "/outside/orbnext",
    "chapter": "The orb and motion"
  }
} as const;
export type ScreenKey = keyof typeof screens;
