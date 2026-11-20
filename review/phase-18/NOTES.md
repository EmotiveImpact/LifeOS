# Phase 18 · Learn and Teach me

Branch `phase-18-v26-learn`, from `phase-17-v26-fuel`. 21 screens rebuilt to the V26 board: Learn from the best (10) and Teach me (11).

## What was built
- **Two chapter files** on the Phase 14 pattern: `v26/learn.tsx` (library, a lens, an idea, ask through a lens, quick recall, ideas into action, teach it back, Napoleon Hill, what you've learned, pictures that teach) and `v26/teach.tsx` (the offer, the lesson's cover, the three bites, the guess, the puzzle, the recap, telling it back, the gap, you've got it, the bite drawn live). `Learn.tsx` and `Teach.tsx` only dispatch. Routes are unchanged.
- **The lesson pictures** in `v26/lessonpics.tsx`, ported from the board's pen: one line weight, round ends, one lit thing in ember, clean or hand-drawn (the marker wobble on lines, boxes and rings). The barbell, fragile to antifragile, drift against one aim, the capped bet, the code in two parts, the guess, the wrong code, the payday flow drawn step by step, the chain of what you told back, the three small bite pictures and eight of the kit's devices.
- **Board-only words and figures** live in `src/state/learn.ts`, never in a screen: the six ideas and what each one opens, the ten lenses, Taleb's page, collections, the recall question and ladder, the lens answers, the barbell check, Hill's principles, the devices, the lesson and its links. Money comes from the engine through the seed: the £840 rebate, the 1.3-month buffer, the £80 capped bet, your allowance and the twelfth taken off each payday.
- **One new type style**, `huge` (44/48 semibold), for the lesson's cover, the recap and "You've got it".
- `Page` gained `statusInk` for a dark status bar over a light photograph (the lesson's cover and "You've got it").

## Real use, not just looks
- **The library** searches ideas and thinkers, opens any lens (Napoleon Hill has his own page) and any collection. "Follow" on a lens is kept.
- **An idea** saves for later (the book round) and **Use it today** opens the tool it belongs to (the cash plan, subscriptions, your buffer, the tax check, protection, routines) and counts the idea as applied everywhere: the library's "applied" chip, the "for where you are" cards and Ideas into action.
- **Ask through a lens** switches between Taleb, Housel and Munger, each answer worked out from your rebate and buffer. Save keeps the decision on the phone, and the composer asks anything else in chat.
- **Quick recall** moves the barbell up the ladder when you're right (1, 3, 7, 21, 60 days) and back to tomorrow when you're not, and the "due today" counts on the library and the shelf follow it.
- **Teach it back** checks your own words on the phone: which of the three parts you covered turn bright, and the one part to add (the "medium risk" middle) shows only if you left it out. The microphone uses the phone's speech recogniser; the web preview asks you to type.
- **Napoleon Hill** ticks his four principles from your own Chief Aim: what you want, the date, what you'll give, and whether you read it morning and night today.
- **Pictures that teach** switches the ideas' pictures (on an idea, a lens and Napoleon Hill) between clean lines and hand-drawn.
- **Teach me** starts from the Tax check: Plan's "Check your tax code" opens `taxcheck?state=code`, the code on your payslip with Teach me in the same card. The cover builds for a moment, then the bites. The guess, the puzzle and the bite drawn live all work, and Replay redraws the bite.
- **Telling it back** listens through the microphone, or you can type. life asks its one question after your first turn, and when you tap the orb your words are checked for the three links (the number, what M1 means, how to fix it). The things you said well come back quoted in your own words, and the gap opens to its explanation with Show me.
- **You've got it** springs in with the bouncy spring and plays the cleared sound, marks tax codes as learned, books the recall three days out, and goes straight to your tax check.
- Real accounts (no sample life) start with nothing applied, an empty shelf and no streak, each with a plain line instead of a zero.

## Stubbed
- Lessons are the tax-code lesson for now; the brain writes lessons for any term in Phase 25. Telling it back is checked on the phone (and through the existing local `analyseTeachBack`), not by a model.
- Ideas into action's "worth about £1,210 a year" and the results beside each idea are sample figures (dev builds only).
- A decision saved from Ask through a lens is kept on the phone; Money doesn't list saved decisions yet.
- Napoleon Hill's "read it twice a day" reads today's Aim reads; there is no reminder yet (Phase 29).

## Differences from the board, and why
- **Numbers follow the seed** (owner decision 2). Tax so far this year shows £2,034 and National Insurance £813: the sample payslip is £30,000 a year, seven paydays since April. The board shows £3,912 and £1,488.
- "For where you are" keeps the board's tags (Applied, In progress, New) in dev builds and turns a card to Applied once you use the idea.
- The idea screen has a quiet "Explain it in your own words" under the note, so Teach it back is reachable from the barbell.
- `teachoffer` is a Button on the board ("anywhere a new term appears"); it renders as the Tax check at `taxcheck?state=code`, which is where the board draws it. `teachplay` is the board's prototype of the whole flow and has no screen of its own.
- The bite drawn live comes after the first bite (bite, drawn live, guess, puzzle), so the lesson has one route through it. It starts hand-drawn as on the board and remembers if you switch to clean lines.
- The library's lenses row shows the ten thinkers as initials; tapping Napoleon Hill opens his page, the others open their lens. Lenses other than Taleb show the ideas life has for them so far.

## Your design rules (20 Nov)
- **Drawers fit their content.** The idea's drawer, the lesson's cover and "You've got it" are only as tall as what's in them; the photograph takes the rest. The recall sheet is a real sheet that hugs its content.
- **Pictures stay inside their panels** in light and dark: every drawing sits in its white panel with room around it.

## Checks
- `npx tsc --noEmit -p .`: passes.
- `npx expo export --platform ios`: passes. `npx expo export --platform android`: passes.

## Screenshots
58 images, light and dark, named by board key, from a release web export with `EXPO_PUBLIC_SAMPLE_DATA=1` captured at 390×844, 2x (no simulator in a cloud session). Extra states: `recall-right`, `recall-wrong`, `teach-checked`, `drawkit-hand`, `lessonready-building`, `predict-more`, `puzzle-details`, `tellback-done` and `bitedrawn-clean`. `teachoffer` is the Tax check at `taxcheck?state=code`. Every screen rendered with no page errors. Nothing has been tried on a phone yet.

## Open owner decisions (BUILD_V26.md section 0)
- Decision 2 (numbers that disagree on the board) is settled by the seed for Track A, as noted; it must be settled before Phase 26 wires real numbers.
