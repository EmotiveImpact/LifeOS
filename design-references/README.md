# `life` Design Reference Archive

Permanent collection of all UI, motion, typography, and layout inspiration references provided during development — curated for direct handoff to **Claude** and **Codex**.

---

## Screen Catalog (`01` – `14`)

### Batch 1 & 2 (Already Implemented Across `life`)
1. `01-onboarding-goals-split.jpg` — Atmospheric goal splash + crisp `01 — 02 03` single-choice onboarding cards (`IntakeState.tsx`)
2. `02-membership-subscribe-dark.jpg` — Ember-textured dark membership overlay with `33% OFF` badge & side-by-side plan selector (`MembershipSheet.tsx`)
3. `03-ingredient-actives-bezel.jpg` — Titanium bezel framing + crisp pill breakdown cards (`HealthStackSheet.tsx`, `TaskReadingSheet.tsx`)
4. `04-editorial-science-dark.jpg` — Atmospheric portrait top fading smoothly into hairline editorial breakdown (`PortalSpotlightState.tsx`)
5. `05-threshold-four-states-dark.jpg` — Phase header + 3-column metrics + `Four Areas. One Plan.` progress rings + bottom `◆ life+ · Manage` bar (`HubState.tsx`, `WebAppShell.tsx`)
6. `06-emerald-ledger-transactions.jpg` — Emerald-obsidian balance header + interactive tick timeline scrubber + rising `Cashflow & Sweeps` drawer (`CashflowLedgerSheet.tsx`)
7. `07-cosmos-daily-visualisation.jpg` — Starry atmospheric header + grounding bar + horizontal portrait cards `level-up protocols` (`AuraSearchState.tsx`)
8. `08-morning-brief-week-agenda.jpg` — `Mon •` matte morning narrative with inline schedule/habit counters & steps/sleep stats + light rounded 7-day calendar drawer (`TodayBriefSheet.tsx`)

### Batch 3 (`09` – `14` · Next Design & Engineering Extractions for Claude & Codex)
9. `09-step-tracker-status-pill-card.jpg` — **Balance Card Privacy + Multi-Stage Admin Tracking**
   - Horizontal 3-node milestone progress bar (`Started -> Submitted -> Cleared`) + status badge + copyable reference ID + chronological activity feed + balance visibility eye (`👁`).
   - **Apply to `life`**: Add 3-step live application progress + timestamped log timeline inside `TaskReadingSheet.tsx` and Home mission cards (e.g. HMRC Rebate, GP eConsult, Start Up Loan, Passport/LISA); add balance show/hide eye inside `CashflowLedgerSheet.tsx` & Hero metric tile.
10. `10-editorial-cards-gradient-widgets.png` — **Time-Stamped Proactive Nudge Stack & Dotted Orb Cards**
    - Three stacked borderless cards pairing monospace timestamps (`15:33 12.05`) with: (a) warm gradient hero evening reset card, (b) crisp white photo-right document checklist (`"Documents for..."`), and (c) crisp prompt + our **Dotted Orb (`DottedOrbIcon`)** symbol (`"Ventilate the room now"` / daily micro-action).
    - **Apply to `life`**: Proactive widget-style nudge deck on Home/Explore using `DottedOrbIcon` for 1-tap biological & admin nudges + document-readiness photo cards.
11. `11-routine-streak-ticks-stack.jpg` — **30-Tick New-Normal Streak Gauge & Morning/Evening Protocol Stack**
    - Horizontal capsule Readiness meter (`70/100`), vertical **30-tick habit lock-in gauge** (`4/30 — Most see results after 14 days`), **Morning Routine / Evening Routine** rows with micro icon cards, subtle category tags, and `(i)` explainer buttons + floating 3-pill bottom bar.
    - **Apply to `life`**: Upgrade `HealthStackSheet.tsx` & `LevelsThinkersSheet.tsx` with the 30-tick "New Normal Lock-In" gauge and split `Morning Protocol` (500ml water, sunlight, protein) vs `Evening Protocol` (Zone 2, caffeine cutoff, sleep window) with inline `(i)` science rule cards.
12. `12-slate-timeline-calendar-cards.jpg` — **Grouped Agenda + Event Dots + Relative Countdowns**
    - Soft cool-slate to warm-stone ambient top + calendar scope filter pill (`All Calendar v`) + **multi-dot density indicators** below each weekday pill (`08 Mon ••`, active `09 Tue —`) + grouped agenda cards with category pills, clean strikethrough completed items, inline person avatar, and **relative countdowns (`in 1hr 15min`)** beneath exact times.
    - **Apply to `life`**: Upgrade `TodayBriefSheet.tsx` with category filter pill, per-day deadline dots, completed strikethrough styling, and live `in X hours / days` countdowns on bills & calls.
13. `13-hourly-timeblock-sprint-planner.jpg` — **Completed Counter Header + Black Capsule Week Bar + Hourly Cards**
    - High-contrast top header with `✓ Completed — 24` win tally + black pill week strip (`[Th 9]` popped white circle) + hourly time gutter paired with multi-column metadata cards (`Status`, `Docs %`, `Priority` dot, `People`) and center quick-add `+` FAB.
    - **Apply to `life`**: Inspire Focus / Deep-Work sprint planning (`Focus` mode inside `TodayBriefSheet` or Weekly Sprint planner) showing lifetime completed moves count + hourly timeblocks for money admin, deep work, and training.
14. `14-conversational-digest-stacked-cards.jpg` — **Calming Conversational Digest + Stacked Tactile Notification Cards**
    - Selective-contrast triage sentence (`muted grey` low-stress context paired with **bold black highlighted keywords** and inline provider/sender avatars: `"Nothing urgent right now — HMRC awaits [confirm] & your GP sent [slots]"`), sitting above color-coded **stacked peeking notification cards** fanning up from the bottom!
    - **Apply to `life`**: Create an elevated **"Morning Triage" / Inbox** mode in `PortalSpotlightState` (`urgent-alert`) or Home Header: calm selective-contrast sentence summarizing what matters today + interactive fanned stack of provider/thinker cards (`HMRC`, `GP`, `Bank`, `Start Up Loans`) where tapping any peeking header pulls that card to the front.
15. `15-weekly-digest-stacked-metrics.jpg` — **Weekly Progress Stack + Two-Tone Trend Sentence**
    - Vertically stacked light editorial cards fanning upward (each backing card = a prior week), overlapped brand icon + avatar pair, and a crisp two-tone narrative summary with inline `↑`/`↓` comparison arrows (`"7 ↑ days, with 7 ↓ new entries and 8m 23s ↓ of writing time"`).
    - **Apply to `life`**: Build the **Weekly Review / New Normal Recap Deck** inside `LevelsThinkersSheet.tsx` & Coach summaries — stacking Week 1 / Week 2 / Week 3 progress cards showing hydrated days, buffer surplus added, and completed moves with delta arrows (`Ray Dalio: Pain + Reflection = Progress`).
16. `16-dark-planning-prompts-monthly-goal.jpg` — **Today Planning Header, Warm Gradient Thinker Prompts & Selective-Contrast Monthly Goal**
    - Matte dark planning view (`Today • Wednesday` + `[Planning]` capsule), compact `< M T [W] T F S S >` week strip with subtle orange milestone ring on future anchor day, two moody warm-amber & crimson translucent cards (`Inspiration: The "Parking Lot" Method ♡` + `Check-in: The Hemingway bridge ♡`), an elevated `Your monthly goal` card using soft muted phrasing + crisp white action clauses, a `Nearest session` footer (`Saturday 17:00 [Edit]`), and 3 circular dock buttons.
    - **Apply to `life`**: Pair **A-Team Wisdom Prompts** (e.g., *Cal Newport — Deep Work / Naval — Leverage*) and **Check-In Reflections** as saveable (`♡`) translucent amber/crimson banners inside `TodayBriefSheet.tsx` Dark Mode / `Explore`, above an editable two-tone **"Your Monthly Gambit"** commitment statement and `Nearest session` countdown.

---

## Claude & Codex Handoff Summary

- Remember core rules across all changes: keep brand strictly lowercase **`life`**, zero borders (`no border-*` or `ring-*` utilities — use tonal surfaces `#F6F6F7`/`#FFFFFF` light and `#16161B`/`#202026` dark), `Instrument Serif` display numbers/headings, minimum `13px` body text inside screens/sheets, and full Light/Dark mode parity.
- All `16` screens (`01`–`16`) are archived cleanly in `/Users/augustusedem/LifeOS/design-references/`, raw uploads live in `design-references/raw/`, and motion clips live in `design-references/videos/`.
