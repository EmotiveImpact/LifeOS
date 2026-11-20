# Life: an honest audit

20 November 2026, evening. I went through the live preview, about 40 screens side by side, the code behind them, the build plan and the latest repo pass. It's in five parts: what I fixed tonight, your design questions, where the app doesn't match itself, what's built but not switched on, and what's still to build.

## 1. Fixed tonight

1. **The check-in drawer no longer jumps.** Each feeling now has one short line ("Good energy. Put it into one big move."), and the drawer keeps the height of the longest one, so nothing below moves as you drag the orb. The words cross-fade softly when the feeling changes. Picture: `1-check-in-steady.jpg`.
2. **The motion now works both ways in the preview.** You were right that it wasn't finished. Pages faded in when they opened but vanished in one frame when you went back, and sheets opened over a blank grey screen. Now:
   - a page you close slides away to the right and the page underneath slides back in;
   - a sheet rises over the page you were on, which stays in view behind a soft dim;
   - closing a sheet drops it away while the dim fades.

   Picture: `2-closing-motion.jpg`. On the phone itself, iOS and Android already do this natively.
3. **A "words only" switch.** Settings, Look, sound and feel, Words: "Icons in sentences". Switch it off and every sentence shows words only. Picture: `3-icons-or-words.jpg`.
4. **Two small mismatches.** Today named your level with one ladder (Stabilize, Protect, Build, Grow, Free) while Your levels used another (Stabilise, Set your routines, Build momentum, Expand your options). Today now uses the Your levels names, and "Stabilize" is spelt the British way everywhere.

## 2. Your design questions

**Should icons inside sentences be a constant across the app?** Yes, with a rule. Right now they appear in about 46 sentences, mostly on Today and in Settings, and almost nowhere in Body, Money or Plan, so they feel random. My rule:
- put them in every page's opening sentence;
- use at most two per sentence;
- only put them beside a thing you could open: a bill, a document, a date, a person, a place.

On iPhone they could use Apple's own symbols (`expo-symbols`), so they match the rest of the phone.

**Should people be able to turn them into plain text?** Yes, and that's now built (see above). It's on by default.

**Do we need titles on each page?** Keep them, and make them consistent:
- **Today, Plan and You:** keep the page name small in the top bar.
- **Pages opened from them:** keep a short centred title, the way iPhone apps do ("Sleep", "Budget", "Net worth"). Today 117 of these pages have a title and 36 don't, which is part of why things feel uneven.
- **The small grey line above the opening sentence:** use it only for a fact, such as when something was last updated or where it came from. Drop it where it just repeats the title. For example, "Budget · every pound has a job" sits under the title "November".
- **Full-screen moments and photo pages:** stay without a title.

**Do we need "life" and its icon on each page?** No. I'd take the orb out of the top bar on every page. Then the orb only shows where life is speaking or listening: Talk, the check-in, "life would make this", suggestions. That gives the orb one clear meaning.

**Should "life" be capitals with a little space between the letters?** For the logo, yes. Use L I F E in spaced capitals wherever the name stands on its own: the welcome screen, sign-in, the Plus screen and About. Inside sentences I'd write "Life" with a capital L, as a name: "Life found one 20-minute gap". Two reasons:
- a lower-case "life" at the start of a sentence reads like a typo, and 25 sentences do that now;
- spaced capitals in the middle of a sentence are slow to read, and VoiceOver reads them out letter by letter.

This changes a rule in the design book, which says the name is always lower case, so it's your call. Picture: `4-life-name-options.jpg` shows the app now, my recommendation, and spaced capitals everywhere.

## 3. Where the app doesn't match itself

Most important first.

1. **Pages open in three different ways.** About 120 open with a big sentence, about 31 with a huge number (£290, £23,480, 7h 10m) and a dozen with a full photo. Rule: one sentence for most pages. A big number only where the number is the whole point: net worth, safe to spend, sleep. A photo only for the person's own things.
2. **Stock photos carry meanings that clash.** There are 87 photo cards using 121 different stock photos. The same desk with an orange mug stands for a tax reserve, a tax rebate and feeling calm. For a real person these will look generic and repeat. Keep photos for the person's own things (meals, documents, their Aim). Use a simple icon tile with a real number everywhere else.
3. **Titles and grey lines.** Covered above: 36 pages have no title, and some grey lines repeat the title.
4. **Icons in sentences.** On some pages and not others (above).
5. **"life" in lower case at the start of sentences.** 25 places (above).
6. **The main button moves around.** Some pages pin it to the bottom (Export everything, Check in now). Others put it inside a card halfway down (Order a card, "Okay, 23:15"). Rule: the page's one main action is pinned to the bottom, and actions on a single card stay in the card as smaller buttons.
7. **Top-right buttons.** Better since the last round, but still a mix of round icons and loose words ("Edit", "Read all", "Show all") and one chip ("Hide numbers"). Rule: a round icon where the icon is obvious, and a plain word otherwise, both in the same style.
8. **The bottom bar disappears on deeper pages.** So Talk is one tap from Today and two from anywhere else. Every iPhone app keeps it. (On the earlier shortlist.)
9. **Talk and Chat are two screens.** Speaking and typing have different layouts. One "Talk to life" screen where you can do either would be easier to learn. (On the earlier shortlist.)

## 4. What could be better

- **Today does too much.** It has two big sentences, the check-in, a swipe deck that needs instructions, body tiles, a question, what's coming up and your Aim. On the first open each day, the check-in drawer also covers the whole screen. I'd lead with the one next thing, make the check-in a small card, and turn the swipe deck into a short list.
- **Plan's first screen is mostly a photo** of your Aim, so you can't see what's waiting without scrolling.
- **You reads like a magazine cover.** It has a level card, photo tiles with no information and a slider. It should lead with what life knows about you, and the people and dates that matter.
- **Body's readiness is still a placeholder.** The "60 to 70" normal band stays until real health data arrives.
- **Feel on iPhone.** The "…" menus are our own imitation. Apple's real menus (through `zeego`) and smooth keyboard handling (`react-native-keyboard-controller`) would close most of the remaining "not quite Apple" gap.

## 5. Built, but not switched on

1. **The core loops were built but missing from the app you're trying.** Planning tomorrow in the evening, "I've got a few minutes", "pick up where you left off" and the step-by-step weekly recap were built and tested (30 tests) on their own branch but never merged. Update, 21:57: the build has now merged them, along with Phase 26 (real health data). They'll show in the preview after its next redeploy.
2. **Seven finished screens have no way in:** Morning brief, Today's numbers, Fitness age, Glucose, Fuel home, the breathing library, and the page for managing life Plus.
3. **Notifications.** The engine already picks the day's one check-in, but nothing sends it until the day-engine phase.
4. **The calendar** is still the sample day, labelled as sample.
5. **Accounts and sync** are built, but real sign-in waits on the server setup (Vercel, Better Auth, Neon London) and an email sender for sign-in codes.
6. **Talk and chat** use the real brain in the code. The preview plays Ama's sample conversation, and real speech needs the voice phase.

## 6. Still to build

- **Phase 26:** real health data (Apple Health, Health Connect, WHOOP, Oura): merged at 21:57.
- **Phase 27:** food photos, barcode and labels.
- **Phase 28:** voice, including life's own voice on iPhone.
- **Phase 29:** the day engine, notifications, widgets, Live Activity, the watch and Siri.
- **Phase 30:** quality: VoiceOver, larger text, Android, speed, crash reports.
- **Phase 31:** beta and launch.

Waiting on you: free trial length (7 or 14 days), the server setup card, the email service, and the launch accounts list.

## 7. The repo list, second pass

The repos thread has just finished a second pass, which pins 12 more repos and names the exact files to take (see `repo-sweep/README.md`). Nothing from any of the 42 pins has been copied in yet. Three of them answer tonight's feedback directly, so I'd take them first:
- `zeego` gives Apple's real menus for the "…" button;
- `react-native-keyboard-controller` gives smooth keyboard movement;
- `expo-symbols` gives Apple's symbols inside sentences.

After those come the memory ones (Hindsight's fact extraction, Graphiti's "has this fact gone out of date?") and Actual's recurring-bill finder.

## What I'd do next, in order

1. ~~Merge the core loops into the main build.~~ Done at 21:57.
2. Settle the name and orb (one tap on the card I've sent).
3. One consistency pass across every page: opener rule, titles, icons in every opening sentence, the main button at the bottom, and "Life" as a name.
4. Apple's menus, symbols and keyboard handling.
5. Replace decorative stock photos with icon tiles and real numbers.
6. Keep the bar on deeper pages, and merge Talk and Chat.
7. Then the remaining phases, 26 to 31.
