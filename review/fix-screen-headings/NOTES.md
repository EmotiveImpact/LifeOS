# Every screen has a heading (F-51)

Branch `fix-screen-headings`, from `v26-integration` after F-64 joined.

Phase 30's walk of every screen found six without a heading. On those, VoiceOver's rotor and TalkBack's headings menu had nothing to jump to. Each now has one, taken from what's already on the screen. Nothing looks different.

| Screen | Its heading |
|---|---|
| Camera (photo of a meal) | The words in the bar, such as "Hold steady" or "Reading…" |
| Barcode scanner | "Point at the barcode", "Looking it up…" or "Type the code" |
| Label scanner | "Point at the label" or "Reading the label…" (it uses the same bar) |
| Focus timer | What you're working on |
| Workout timer | The kind of workout and whether it's running, such as "Run, moving time" |
| A chat thread | Its title, "Life, your conversations". The clock button on the right still opens your conversations. |
| Lock screen previews | The date at the top |

## Checks

- **In the browser:** each of the six screens, opened in the sample web build, now has exactly one heading, and none raised an error.
- **Tests:** `tests/design/headings.test.ts` is new, with 5 tests, one per change.
- **Full suite, typecheck and bundles:** see the integration notes for the join.
- **Still to check on phones by ear:** VoiceOver and TalkBack (F-32).

## Noticed on the way

The focus timer still shows the sample's "Portfolio case study" and a 38-minute block. On a real account nothing links to it: only the sample calendar opens it. It needs a real version before anything does, like the screens in F-64.
