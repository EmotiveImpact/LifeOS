# Phase 15 · Plan, Money, Documents, Chief Aim, Toolkit

Branch `phase-15-v26-plan`, from `phase-14-v26-today-talk`. 38 screens rebuilt to the V26 board (the 39th row, `doitforme`, is parked and not built): Tab 2 · Plan (10), Your Chief Aim (4), Plan · Money (8), Documents and renewals (3), the toolkit (13).

## What was built
- **Four chapter files** on the Phase 14 pattern: `v26/plan.tsx`, `v26/money.tsx` (Money and Documents), `v26/aim.tsx`, `v26/toolkit.tsx`. `Plan.tsx`, `Money.tsx`, `Documents.tsx`, `Aim.tsx` and `Toolkit.tsx` now only dispatch to them, keeping the empty-plan and offline states. Routes are unchanged.
- **Plan** as the owner liked it: the Chief Aim as one photo card with its progress, "Your areas" as four photographs each saying what's ready, then four sections that open one at a time (ready, situations, waiting, tools). No filter chips. Each section ends with a quiet link so Things to know, All missions, All tools and Documents are reachable from Plan.
- **Mission** as a dated timeline with the voice note and the step card (ticks save, Continue opens GOV.UK's P87 page for the tax rebate, otherwise the draft), the reference with Copy, and an actions card from the bar.
- **Money** on the payslip photograph with the balance and pence, this month in and out by week, accounts as tiles, today's payments and the rest of Money. The eye hides every figure. Subscriptions, Area: Money, a payment, a bill, the budget (the tightest envelope as a photograph, sliders under Edit), net worth (trend line and what it's made of) and Connect your bank (a preview that keeps your bank choice).
- **Documents**: the one renewal in front with the next two peeking behind it, the passport as a photograph, the rest in date boxes; the document page counts months in dots with a reminder switch; the renewal page has its three ticks.
- **Chief Aim**: one question at a time with a suggestion and the sentence building underneath; your Aim on the sky above the front door with the sheet rising over it, the reading streak and "Read tonight"; this month's gambit with three suggestions and the check-in time; the earned glimpse.
- **Toolkit**: every tool keeps its engine wiring (`compareUKBusinessStructures`, `compareRentAndBuy`, `getProtectionChecklist`, `LAB_GUIDES` and `interpretLabResult`, the cash plan saved to `profile.runway`, buffer months, bedrooms, structure profit, unlock flags).
- **Shared pieces** added to `v26/kit.tsx`: `BigPhoto` (one big figure on a photograph), `PeekStack`, `Legend`, `Cols`, `Shelf` and `PhotoTile`, `Box`.
- **Board-only figures** live in `src/state/plan.ts` (invoices, cash weeks, month weeks, net worth year, NI years, gambits, blood tile positions, document dates, the fourteen tools), never in a screen.
- Design system: `type.numeralPhoto` (44/48, the board's figure on a photograph; same values as `diagramCode`, which is reserved for the lesson picture). `V26Tile` sets a unit starting with "." (pence) without a space.

## Real use, not just looks
- Ticking mission steps, clearing, drafts, budgets, categories, splitting, reading your Aim, the gambit, reminders, renewal steps, lab results, protection checks, the cash plan, buffer target and bedrooms all save on the phone.
- Subscriptions: Cancel opens the provider's own page first; only "I've cancelled it" marks it cancelled, with Undo under the bar's menu. Nothing is cancelled for you.
- Documents show only in development builds (`SHOW_SAMPLES`); a real account starts with none until Track B adds scanning and storage.

## Stubbed
- No bank connection: Connect your bank is a preview and says so. "All payments" opens the budget, the closest list there is.
- Renewal "Compare quotes" sets life to look from 22 January; no quotes are fetched.
- Bill "Claim it for me" opens the council-tax mission; nothing is sent.
- Health stack is the board's example stack; its + opens Talk.
- Glimpse's two earned lines are the board's; earning glimpses is Track B.

## Differences from the board, and why
- **Numbers follow the seed and the engine** (owner decision 2): Ama is level 1, so the toolkit says "5 tools unlocked. 9 more" (board 8 and 6); the passport has 9 months left from the seed date (board 21); protection has 5 checks from the engine (board 4); income structure keeps £861 more (board £860); Missions counts the engine's open tasks.
- Protection's gap card says "Talk it through" instead of "See the 2 quotes": no quotes exist, so the board's "2 quotes found" would be untrue.
- Bedrooms says "Illustrative prices for now." The board's "life uses live prices" isn't true yet.
- Tax & NI's line under £840 says where the figure comes from (your P800 and work costs) instead of "Checked against your Personal Tax Account", since life doesn't sign in to HMRC; the info button explains this.
- Your Aim's streak counts days in a row ending today or yesterday. The seed's reading log ends on the seed date, so screenshots taken today show "21 days read" rather than "Day 21 streak".
- Bars with only "More" on the board open something real: "Why these show here" on areas and bills, the actions card on Mission, Document and Your Aim, cancelled subscriptions on Subscriptions.
- Vault, Rent vs buy and All tools each gained one row the board doesn't draw (search and add in the bar, a bedrooms row, a Bigger decisions row) so every screen in the chapter can be reached.

## Checks
- `npx tsc --noEmit -p .`: passes.
- `npx expo export --platform ios`: passes. `npx expo export --platform android`: passes.

## Screenshots
84 images, light and dark, named by board key, from a release web export with `EXPO_PUBLIC_SAMPLE_DATA=1` captured at 390×844, 2x (no simulator in a cloud session). Extra states: `plan-full`, `mission-full`, `money-full` (whole page), `aimnew` (empty) and `aimnew-filled` (after tapping the suggestion). Every screen rendered with no page errors. Sheets (draft, newgoal, unlock) show as full pages on web. Web draws a resize handle on multi-line fields, which phones don't. Nothing has been tried on a phone yet.

## Open owner decisions (BUILD_V26.md section 0)
None block this phase. Body was accepted "for now" (decision 4); a reminder comes with Phase 16.
