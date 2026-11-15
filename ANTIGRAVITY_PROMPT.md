You are building the visual layer of `life`, an Expo app in `apps/mobile` (Expo SDK 58, expo-router, HeroUI Native, Uniwind/Tailwind v4, Reanimated 4, Gesture Handler, expo-haptics, expo-blur, @gorhom/bottom-sheet). Business logic lives in `packages/core`. Don't change its logic. You may only rewrite user-facing strings there to match the voice rules.

**Your spec is `DESIGN.md` at the repo root. Read all of it before writing any code.** It turns the 16 images in `design-references/` into one design language. Where an image disagrees with DESIGN.md, DESIGN.md wins. For a visual target, open `design-board/life-design-board.html` in a browser. It shows five screens (Today, Plan, Mission detail, Money, You) built only from DESIGN.md, with working stacks, stepper, scrubber and sounds. Match its look and feel natively. Read §2 "Harmony decisions" twice: it says exactly which parts of each reference to keep and which to drop. Don't invent new colours, fonts, progress styles or components. If you need something DESIGN.md doesn't cover, add it to DESIGN.md first, in the same style, and then build it.

Work in these phases, in order. Finish each phase completely before starting the next.

**Phase 0: safety**
1. If the repo has no git, run `git init`. Commit everything as "Snapshot before design system".
2. Commit at the end of every phase with a clear message.

**Phase 1: tokens and fonts**
1. Put every colour token from DESIGN.md §3.1 into `apps/mobile/src/global.css` as CSS variables, with light and dark variants. Map HeroUI's `--background/--surface/--foreground/--muted/--accent` to them.
2. Create `apps/mobile/src/design/tokens.ts` exporting the same values plus the type scale (§4), spacing, radius, shadow (§5) and motion springs (§7) as typed constants. Colours exist in exactly these two places.
3. Load Instrument Serif, Inter (400/500/600) and JetBrains Mono with `@expo-google-fonts`. Hold the splash screen until they're loaded.
4. Create `Text` primitives, one per type style (`Numeral`, `TitleSerif`, `Statement`, `Headline`, `Title`, `Body`, `Callout`, `Mono`, `Unit`). Screens must use these and never set font sizes directly.

**Phase 2: components and design gallery. STOP for review when done.**
1. Build all 21 components from DESIGN.md §6 in `apps/mobile/src/design/`. They take props only, with no store access.
2. Implement press-scale, haptics (§8) and Reduce Motion support inside the components, so screens get them for free.
3. Create a dev-only route `/design` that shows every component and variant, in light and dark side by side, with realistic `life` content (HMRC rebate, GP referral, Start Up Loan, £ amounts).
4. Run the app and take screenshots of the gallery in light and dark. Check each one against DESIGN.md §12. Fix what fails.
5. **Stop here.** Report what you built and where the screenshots are. Don't build screens until the gallery is approved.

**Phase 3: screens** (after approval)
1. Build the routes in DESIGN.md §11 with expo-router: a `(tabs)` group with the custom floating `Dock`, plus `onboarding/*`, `mission/[id]`, `money`, `health`, and `membership` as a modal.
2. Wire them to `packages/core` and `src/state/useLifeStore.tsx`: real eligible tasks, the score, completing tasks, persistence with AsyncStorage. Every button must do something real. No dead ends, and no "coming soon".
3. Fold the existing `src/sheets/*` content into the new screens using the new components. Delete the old styling instead of keeping both.

**Phase 4: motion and sound**
1. Add the shared transitions (mission card → detail header, and the score), the number roll, the peek-stack reorder, and the dock hiding on scroll (§7).
2. Add the four sounds (§9) with `expo-audio`. If you have no licensed files, write `apps/mobile/scripts/make-sounds.mjs` to synthesise them as specified. Add Sound, Haptics and "Hide balances" toggles in You → Settings, persisted.

**Phase 5: QA**
1. Screenshot every screen in light and dark, at the default text size and at 1.3× Dynamic Type, with Reduce Motion both on and off.
2. Go through the §12 checklist for each screen. Also grep the code for raw hex values, `border-`, `ring-`, Tailwind palette colours (`emerald-`, `rose-`, `indigo-`…), font sizes below 13, and the banned words in §10. Fix every hit.
3. Run `npm run typecheck` in `apps/mobile`, and the tests in `tests/`. Both must pass.
4. Report what was done, list anything you couldn't do and why, and give the screenshot folder path.

Quality bar: this should look and feel like a premium, Apple Design Award–level iOS app. It should be calm, certain and alive. When you have to choose between adding something and making the existing thing better, make it better.
