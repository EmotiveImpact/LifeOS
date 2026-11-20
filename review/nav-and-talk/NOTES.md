# Bottom bar, Talk to life and the three dots

Branch: `claude/project-thread-8i27bq` (from `v26-integration`, 20 Nov 2026). Not merged yet.

## What changed

**1. The steady bottom bar is back.** The V26 board swapped the full-width bar for a floating pill that only names the tab you're on. The app now uses the full-width bar again: fixed at the bottom, Today, Plan, You and Talk all named, same on every main screen.

**2. Talk catches things again, in one tap.** Tapping Talk used to open a typed chat. Now it opens the voice screen, where what you say drops into You, Home, Work, Money, Health and Goals as you speak, and nothing is saved until you say "File all". The first time, iPhone asks for the microphone. Hold Talk to type instead, or tap the keyboard button on the Talk screen. In the web preview, where the phone's speech can't run, Talk plays the labelled sample so the filing can still be seen.

**3. The three dots now mean one thing: a menu.** They were on about 20 screens doing about 20 different things, and where they did open options, the options appeared as a card inside the page. Now:

- Where the button did one thing, it shows that thing: a clock for your past conversations, an "i" for "why does this show here", Edit/Done for changes, a keyboard for "type instead", sliders for meal preferences, the eye for hiding balances, and words ("Levels", "Your Aim", "Show cancelled") where an icon would be a guess.
- Where there are several actions (a mission, a meal, a habit, a document, your Aim), the dots stay and open a small menu that drops from the button, the way iPhone apps such as Notes and Files do it. Delete-type actions are in the signal colour, and a tap anywhere else closes it.

Pictures: `1-bar-and-talk.light.jpg` / `.dark.jpg` and `2-three-dots.light.jpg` / `.dark.jpg` in this folder.

## Checks

- Typecheck green; iOS and Android bundles build; web preview export builds.
- No engine, data or sync files touched.

## Not done (needs Edem's yes)

- The bar still disappears when you open a detail page (Money, a mission, a document), so Talk is one tap from Today, Plan and You and two from deeper pages. iPhone apps normally keep the tab bar on detail pages. Doing that means moving about 118 pages under their tabs, which is its own careful piece of work. It's item 6 below.

## Are these screens our best? My honest list

The Body pages, Talk and the new menus are strong: clear numbers, one job per screen. These are the ones I'd improve first, most important first.

1. **Today.** It tries to do everything: two big sentences, a check-in card, a swipe deck of "moves" that needs a line of instructions to explain left and right, then body tiles, a question, what's coming up and your Aim. On the first open of each day a check-in drawer covers the whole screen, bar included. I'd lead with the one next thing, make the check-in a small card instead of a takeover, and turn the swipe deck into a short list with "Do today" and "Later".
2. **The big opening sentence on nearly every screen.** A 34pt two-tone sentence fills the top third of almost every page. It's lovely on Today and tiring everywhere else, it makes pages look alike, and it pushes the useful part below the fold. I'd keep it for Today and use plain titles elsewhere.
3. **Plan.** The sentence and a huge photo of the Aim take the whole first screen, so you can't see what's waiting without scrolling. The earlier Plan (a "Ready when you are" list and a "Waiting, not forgotten" list) showed real things straight away. I'd bring that back under the V26 look.
4. **You.** Same pattern: sentence, a level card with a barcode-style bar, photo tiles for Home, Work and People that carry no information, then a slider. It reads like a magazine cover more than "your stuff". I'd lead with what life knows about you and the people and dates that matter.
5. **Stock photos used as decoration.** Area tiles, mission cards and the You tiles use lifestyle photos that say nothing about the person, and for a real user they'll look generic and repeat. I'd keep photos only where they're the person's own (a meal, a document scan, their Aim) and use simple icon tiles with a real number elsewhere.
6. **Keep the bar on deeper pages.** As above: open anything and the bar vanishes, which is unlike iPhone apps and makes Talk harder to reach. A navigation change, on its own branch.
7. **Talk and Chat as one screen.** Speaking and typing are two different screens with different layouts (a mic inside chat, a keyboard inside Talk). One "Talk to life" screen where you can speak or type, with the filing tiles showing either way, would be simpler to learn.

Nothing on this list is started. Say which ones to do and I'll design them first, then build.
