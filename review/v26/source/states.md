# States

Source content from the V23 board (the established screens). Tags in [brackets] are the old style names: t-display = big number, t-statement = two-tone sentence, t-title1 = title, btn = button, chip = chip.

## emptytoday — Today, on day one  (State · opens from Today on day one)
about: 201 | New in v10 | Today, on day one | The empty state: nothing filed yet, so Today shows one sentence, one clear action, and a skeleton of what will appear. Never a blank screen. | empty states · SPEC §7 | State
- [tnum] 9:41
- [span] Your life, connected
- [v21-page-title] Today
- [t-callout] Monday, 16 Nov
- [t-title1] Welcome, Ada
- [t-statement] Nothing here yet.
- [t-statement] Talk for a minute
- [t-statement] and life will fill this in.
- [btn] Talk to life
- [t-callout] Your moves, questions and things to know will appear here.
- [button·icon] Today
- [button·span] Today
- [button·icon] Plan
- [button·span] Plan
- [button·icon] You
- [button·span] You
- [button·icon] Talk
- [button·span] Talk

## offline — Offline and errors  (State · opens from no connection)
about: 202 | New in v10 | Offline and errors | No signal: cached data with "Updated 2h ago". A failed sync: what happened, data kept, one retry. Never a dead end. | offline / error states · local-first | State
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Offline and errors
- [t-callout] You're offline. Showing what was saved 2h ago.
- [t-title1] Money
- [t-callout] All accounts · updated 2h ago
- [t-display] £2,340
- [t-display] .50
- [t-title3] Couldn't reach your bank
- [t-body] Your last 2 days of transactions haven't synced. Nothing is lost, and life will try again when you're back online.
- [btn] Try again
- [t-body] Rent
- [t-callout] Standing order · yesterday
- [t-title3] £1,150.00
- [t-body] Moved to buffer
- [t-callout] Payday sweep
- [t-title3] £180.00

## loadingtoday — Today, loading  (State · opens from Today while loading)
about: 203 | New in v14 | Today, loading | While Today builds, hairline placeholders hold the exact shape of what’s coming, so nothing jumps when it lands. If it takes more than a second, the orb becomes a sphere. | Skeleton · LifeOrb sphere after 1s | State
- [tnum] 9:41
- [span] Your life, connected
- [v21-page-title] Today
- [button·icon] Today
- [button·span] Today
- [button·icon] Plan
- [button·span] Plan
- [button·icon] You
- [button·span] You
- [button·icon] Talk
- [button·span] Talk

## emptyplan — Plan, on day one  (State · opens from Plan on day one)
about: 204 | New in v14 | Plan, on day one | Before there are missions, Plan isn’t blank: it shows the areas, the first tool unlocked at level 1, and one suggested mission. | empty state · level 1 | State
- [tnum] 9:41
- [span] Your life, connected
- [v21-page-title] Today
- [t-callout] Plan
- [t-title1] Nothing here yet
- [t-body] Missions appear as life finds things worth doing.
- [t-callout] Suggested first mission
- [t-body] Find money you’re owed
- [t-callout] Tax rebates, refunds, unclaimed schemes · 5 min
- [btn] Start
- [t-body] Money
- [t-callout] No missions yet
- [t-body] Home
- [t-callout] No missions yet
- [t-body] Body
- [t-callout] No missions yet
- [t-body] Work
- [t-callout] No missions yet
- [button·icon] Today
- [button·span] Today
- [button·icon] Plan
- [button·span] Plan
- [button·icon] You
- [button·span] You
- [button·icon] Talk
- [button·span] Talk

## emptybody — Body, with no device  (State · opens from Body with no device)
about: 205 | New in v14 | Body, with no device | Without a watch or ring, Body still works from the phone: steps, a sleep estimate from when the phone is untouched, and check-ins. It says plainly what a device would add. | phone-only mode · HealthKit steps · honesty badges | State
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Body, with no device
- [t-callout] Body
- [t-title1] From your phone
- [t-body] Good enough to start. A watch or ring adds more.
- [t-title2] 6,240
- [t-callout] Steps today
- [t-title2] ~7h
- [t-callout] Sleep, estimated
- [t-body] Readiness
- [t-callout] Needs heart-rate variability
- [t-callout] Device
- [t-body] Sleep stages
- [t-callout] Needs a watch or ring
- [t-callout] Device
- [t-body] Load
- [t-callout] Needs heart rate
- [t-callout] Device
- [btn] Connect a device

## permdenied — A permission you said no to  (State · opens from a declined permission)
about: 206 | New in v14 | A permission you said no to | If a permission was declined, the feature explains what’s missing and links straight to the right Settings page. It never nags; it asks once more only when you tap the feature. | Linking.openSettings() | State
- [tnum] 9:41
- [button·icon] Back
- [v21-title] A permission you said no to
- [t-title1] The camera is off for life
- [t-body] To snap meals and letters, turn on the camera for life in Settings. Everything else works without it.
- [btn] Open Settings

## syncissue — Two phones disagree  (Sheet · opens from two devices disagree)
about: 207 | New in v14 | Two phones disagree | If the same thing was changed on two devices offline, life shows both and lets you pick. It never silently loses your change. | sync conflict · last-writer shown, user picks | Sheet
- [tnum] 9:41
- [button·icon] Close
- [v21-title] Which one is right?
- [t-body] You changed your pay day on two phones while offline: the 28th here, the 25th on your iPad.
- [btn] Keep the 28th

## aidown — life’s AI is having a moment  (State · opens from AI unavailable)
about: 208 | New in v14 | life’s AI is having a moment | When the AI service is down, everything that doesn’t need it still works: Today, missions, tools, Body. Chat and Teach me say so plainly and queue your message. | ai fallback · queued messages · status | State
- [tnum] 9:41
- [button·icon] Back
- [v21-title] life’s AI is having a moment
- [t-title1] Chat is paused for a few minutes
- [t-body] Your plan, tools and Body all still work. Anything you send now will be answered as soon as it’s back.
- [btn] Send it anyway, answer later

## forceupdate — Update needed  (Full screen · opens from old version)
about: 209 | New in v14 | Update needed | Only when an old version would give wrong numbers (for example, a new tax year). Says why, and goes to the store. | min-version gate · tax-year rules | Full screen
- [tnum] 9:41
- [button·icon] Close
- [v21-title] Update needed
- [t-title1] A quick update
- [t-body] The new tax year started, and this version still uses last year’s rules. The update takes a minute.
- [btn] Update life

## signedout — Welcome back  (State · opens from after sign-out or new phone)
about: 210 | New in v14 | Welcome back | After signing out, or on a new phone: sign in and everything comes back, or start fresh. Data on this phone is never mixed with someone else’s. | Better Auth session · restore | State
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Welcome back
- [t-title1] Welcome back
- [t-body] Sign in to bring back your plan, missions and history.
- [btn] Continue with Apple

## connectfail — A device stopped syncing  (State · opens from Body when a device stops syncing)
about: 211 | New in v14 | A device stopped syncing | If a device hasn’t sent data for a day, Body says so on the affected scores (greyed, with the last sync time) and offers the one fix that usually works. | sync health · last sample age · honesty badges | State
- [tnum] 9:41
- [v21-title] Body
- [t-body] Oura hasn’t synced since yesterday
- [t-callout] Open the Oura app once to send last night’s sleep.
- [btn] Open Oura
- [t-body] Readiness
- [t-callout] Last: yesterday
- [t-title1] —

## support — Need support now  (Push · opens from You → Help, or offered when needed)
about: 212 | New in v15 | Need support now | Always one tap away (You → Help), and offered gently if what you write or say sounds like you’re really struggling. Real people, free, 24 hours. life never tries to be your therapist. | safety (SPEC §3.7) · distress signal in journal/Talk → offer, never diagnose | Push
- [tnum] 9:41
- [button·icon] Back
- [v21-title] Support
- [t-title1] You don’t have to sort this alone
- [t-body] These are free, confidential and open any time.
- [t-body] Samaritans
- [t-callout] Call 116 123 · any time
- [tag] Call
- [t-body] Shout
- [t-callout] Text SHOUT to 85258
- [tag] Text
- [t-body] NHS 111
- [t-callout] Choose the mental health option
- [tag] Call
- [t-body] If you’re in danger right now
- [t-callout] Call 999.
- [t-callout] life will go quiet on nudges for a few days unless you say otherwise.
