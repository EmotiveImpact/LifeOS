# Phase 19 · You, Know yourself, People, Settings, Grow

Branch `phase-19-v26-you`, from `phase-18-v26-learn`. 39 screens rebuilt to the V26 board: You (10), Know yourself (6), People and dates (5), Settings and account (14) and Grow (4).

## What was built
- **Five chapter files** on the Phase 14 pattern: `v26/you.tsx`, `v26/self.tsx`, `v26/people.tsx`, `v26/settings.tsx` and `v26/grow.tsx`. `You.tsx`, `Self.tsx`, `People.tsx`, `Settings.tsx` and `Grow.tsx` only dispatch. Routes are unchanged.
- **Board-only words and figures** live in three new state files, never in a screen: `state/you.ts` (your areas, who you're becoming, the streak, the mood weeks, the level plan and the words for each gate, the experiment, the four tests and their statements, the Big Five and body clock readings, your weeks, the vantage and level-up words), `state/people.ts` (the face crops, the photographs, the dates counted from the sample's day, Kofi's birthday case and the contacts) and `state/settings.ts` (the life Plus price and what it opens, the notification kinds, quiet hours, the private-mode jobs, what your AI may read, the connections, the four on-phone parts and the help answers).
- **The birthday on Today** (`birthdaynudge`, a card, not a route): when someone's birthday is four days away or less, Today leads with it. The sentence becomes "Kofi turns 31 on Wednesday. Post his card today.", and the family photograph sits in front of the deck with one step and one tick. `today?state=birthday` previews it.
- Display and Statement gained `center` (the help and about pages), and TwoTone gained `align`.

## Real use, not just looks
- **You** shows your level from the engine with its ruler; the chip opens the vantage point, and "See your progress" opens your levels. The A round opens your details and the gear opens Settings.
- **Household and children** are counted with the stepper and saved to your profile (children also sets whether you have dependents). The line under the count says what it changes, such as the 25% council tax discount for living alone.
- **Mood over time** draws your own check-ins, three weeks Monday first. Check in now opens the feeling check.
- **What life knows**: Remove takes a fact out, and Undo puts it back. Filters narrow it by area. Export everything shares the whole file. Delete everything opens the account deletion.
- **Your levels**: the gates for your level come from the engine, and each one opens its tool. The other levels open one at a time.
- **What life remembers**: search, filter, and swipe a memory to forget it. The first row peeks once to show the swipe.
- **Your details**: Edit and Done save your name and city, and the rows open children and body numbers.
- **Know yourself**: the personality test asks the 50 public-domain IPIP statements one at a time. Each answer is saved and the next question follows on its own, and the end opens your personality. The money test asks five. Values reorder by tapping and are kept. Body numbers save height, waist, blood pressure and sex at birth in place.
- **Your people** puts the next birthday in front. Tap a person for their page: the photograph takes what the drawer leaves, Kofi's birthday is a small case (ideas you mentioned, the card, the gift, the draft), and the call reminder and edits are kept. Add people ticks contacts or takes a name typed in, and asks for a missing birthday. Dates switches month on the real calendar.
- **Settings** opens on one sentence that says how life is set right now (nudges, connections, nothing sold), then four groups that open one at a time. Every switch writes the same preference or flag as before: sounds, haptics, pictures, glimpses, hand-drawn lessons, hide balances, calorie numbers, private mode, the six notification kinds, quiet hours (tap From or Until to step through the hours) and the five things your AI may read.
- **Look, sound and feel**: tap a small phone to switch light and dark, or follow the phone.
- **Private mode and What stays on your phone** check this phone's built-in AI and speech before saying what's available. They don't assume it.
- **Your AI** copies the connection address and switches the connection off or back on.
- **Delete your account** wakes its button only when DELETE is typed, then clears this phone's data and goes back to Welcome.
- **life Plus**: Subscribe opens Welcome to life Plus, and your plan, Settings and the card on Settings all follow it. Cancel is kept.
- **Weekly recap** brings a week behind to the front with a tap and shares the week. **Vantage point** lists the engine's gates as a climb, and Take the next step opens the next one. **Level up** has four pages, plays the cleared sound and remembers you've seen it. **Your year** shows your year in four figures.
- Real accounts (no sample life) start empty: no photograph of you (your initial instead), no connections, a free plan, no experiment or shared life, this week only in the recap, and a plain line where a sample figure would be.

## Stubbed
- **No billing yet.** Subscribe, Restore purchases and Cancel are kept on the phone; RevenueCat comes with the gaps work after Phase 31. The App Store line is the board's words.
- No notification is scheduled (Phase 29). The connection address is a preview, and no MCP server exists yet (Phase 24).
- Report a number and Email us note that you asked; nothing is sent until support is connected.
- The 174 MB on-phone size is the board's figure until the Phase 28 download manager measures it.

## Differences from the board, and why
- **life Plus shows £48 a year (£4 a month, saves 33%)**, the board's price, because owner decision 3 is still open (the old board said £59.99). It reads from `seed.membership`, so one change sets it everywhere.
- **The real calendar decides weekdays.** Kofi's 18 November is a Wednesday in 2026, so the birthday move says "on Wednesday" where the board says Saturday, and the post line follows the days left.
- The level ruler uses the engine's progress for your level; the board shows 40%.
- What life remembers counts the memories you keep plus the three used today; the board shows 24.
- Dates counts Efua's 14 December from the seed as well as the board's five.
- Level up opens on the level you've just reached; `levelup?state=2` previews the board's Level 2.
- Private mode's info round opens What stays on your phone; Your AI's explains the connection in a short note.

## Your design rules (20 Nov)
- **Drawers fit their content.** A person's page, the vantage point and your year are drawn with the drawer only as tall as what's in it; the photograph takes the rest. Household, children, add people and life Plus are sheets that hug their content.
- **Drawings stay inside their boxes** in light and dark: the level path, the comparison bars, the hours ruler, the small phones and the month grid all sit inside their cards.

## Also fixed on the way
- **A paper chip in a photo bar now sits centred** beside its round button (it was pinned to the top of the bar). This fixes the same thing on Phase 18's "You've got it".
- A timeline step with no label no longer leaves an empty line above its words.
- The engine's gate "Handle Hospital Referral" reads "Handle your hospital referral".

## Checks
- `npx tsc --noEmit -p .`: passes.
- `npx expo export --platform ios`: passes. `npx expo export --platform android`: passes.

## Screenshots
104 images, light and dark, named by board key, from a release web export with `EXPO_PUBLIC_SAMPLE_DATA=1` captured at 390×844, 2x (no simulator in a cloud session). Extra states: `you-2`, `levels-2`, `people-2`, `notifs-2` and `yourai-2` (scrolled), `profile-edit`, `testq-picked` (question 14 answered), `person-mum` (a person without a birthday case), `addperson-type`, `birthdaynudge` (Today at `today?state=birthday`), `dates-dec`, `appearance-dark`, `deleteacct-typed` and `recap-w45`. `levelup` is `levelup?state=2`. Every screen rendered with no page errors. Nothing has been tried on a phone yet.

## Open for Edem
- **Decision 3, the life Plus price** (BUILD_V26.md section 0): £48 a year is shown until you choose between £48 and £59.99.
- **A standing AI consent switch in Settings.** The brain side exists (`packages/brain/src/consent.ts`, from the brain rules work), but the board has no design for it yet, so Settings doesn't show one. Once it's drawn, it belongs in "What life can reach".
