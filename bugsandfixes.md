# Bugs and fixes — V22

Guiding principle: make the next useful thing clear, keep the person in control, and let every detail earn its place.

Seven bounded passes: visual homepage → shared language/chrome → daily lifecycle → money/actions/documents → body/habits/learning → verification/motion → delivery. Existing master checkout; no commit, push, production connection or TestFlight upload.

## Ledger

| ID | Status | Defect / limitation | Cause, correction, evidence |
|---|---|---|---|
| V22-01 | Fixed; device acceptance pending | Photographic pages have opaque light top-bar backgrounds. | Board V21 header sets background to page colour; shared mobile TopBar implementation being inspected. V22 board uses the photo behind its chrome; native shared Screen/TopBar correction implemented; actual light/dark Expo Aim preview confirms transparent chrome. |
| V22-02 | Fixed | V21 homepage uses miniature card text/actions instead of the calmer reference weight. | V22 homepage restores 24/31 editorial type, 20/26 next action, 13/18 support text, 44pt targets, 50pt CTA and 190pt photo. Rendered at 393pt; primary action fits and the remaining feed scrolls above navigation. |
| V22-03 | Fixed | Completed daily check-in remains a repeated homepage demand in the app. | Local-day completion and skip are distinct, saves upsert the day, midnight/foreground/greeting boundaries refresh the UI. Pulse save/return and retained receipt verified in preview. |
| V22-04 | Blocked integration | Health, steps, bank sync, live AI and restrictions are not established by design previews. | Preserve honest local/demo states. No production setup, phone restriction or unsupported success claims. |
| V22-05 | Pending native verification | Browser checks cannot prove iPhone/Android safe-area, native speech/model modules, encryption or on-device performance. | Both platform JS bundles pass; 20 actual Expo routes checked at 393pt in light mode, with dark/light image-header checks. Signed native build remains on hold. |

## Iterations

- Pass 1 complete: V22 homepage target drawn and delivered; original 221 screens preserved. Fixed a builder injection issue (the legacy board omits an explicit closing head tag, so V22 styles now insert after the last stylesheet).
- Pass 2 implemented: shared native top bars use 44pt/20pt icon geometry, balanced non-overlapping titles, image-aware backgrounds; cards use 20pt default padding, rows have bounded long values, buttons grow for Dynamic Type, Reduce Motion never springs a released press. Combined mobile typecheck passes.
- Pass 3 complete: real Today composition, five default signals, local-day check-in and one-question receipt, completion gives space back. The header uses the actual local date; the board retains its labelled illustrative day. Pulse save/return and persisted receipt verified.
- Pass 4 complete: Money, toolkit, missions and documents — 28 branches changed, six intentionally retained; contextual records, honest external-action states and urgent/waiting structure.
- Pass 5 complete: all 66 Body/Fuel/Habit keys reviewed (17 composition changes, 24 disclosure/copy changes, 25 retentions); personal/learning/settings family refined, with reasons and limits in specialist JSON reports.
- Pass 6 complete: combined semantic typecheck; both platform JS exports; 20 actual Expo route checks at 393pt without horizontal page overflow; light/dark image-header evidence; fresh integration review followed by three corrections. Habit-cell top range is 0px across all histories; targets are 44pt; actual day-hook execution schedules at the next noon/evening/midnight boundary in three controlled-clock checks.
- Pass 7 complete: final V22 board and defect ledger delivered. No native build, commit, push or upload.

## Screen-family findings

Statuses below reflect implemented source changes; platform/device acceptance remains separate.

### Money

- **V22-M01 — fixed:** Unused subscriptions were buried and their fake cancel action claimed Opened. **Correction:** Unused records now precede renewals; each action opens an explicit local cancellation preview, preserving the existing flags without claiming provider access.
- **V22-M02 — fixed:** Bank selection looked like connection success despite no authentication. **Correction:** Preview-bank CTA and the returning money-screen notice explicitly describe sample balances and no connected bank; selection, flag and route survive.
- **V22-M03 — fixed:** Every ledger detail claimed grocery categorisation and weekly grocery behaviour. **Correction:** Selected payment infers its initial category; grocery-specific facts stay with the Tesco sample, while other ledger records retain their own direction and type. Category editing and local splitting remain.
- **V22-M04 — fixed:** Historical balance dates were detached from the seed date and invalid saved indices could produce undefined figures. **Correction:** Scrubber dates derive from seed.date and the existing history length; indices are finite, rounded and bounded.
- **V22-M05 — fixed:** Completed missions appeared in active lists and submitted sample work was mixed with urgent next actions. **Correction:** Active filtering excludes cleared IDs; needs-you missions are urgency-ordered and waiting sample HMRC work has its own section. Local history remains reversible.
- **V22-M06 — fixed:** Any tax-category mission inherited the P800 refund, reference and draft. **Correction:** P800-specific presentation now applies only to uk-hmrc-tax-code; other missions retain their own core estimates, steps, explanation and drafts.
- **V22-M07 — fixed:** Level-labelled decision cards bypassed the existing unlock flow; toolkit counts described thirteen records while only eight were shown. **Correction:** Decision navigation uses the existing unlock choices and open-early path; directory counts derive from its actual eight-tool list, with a useful empty-search state.
- **V22-M08 — fixed:** Every document borrowed passport-only GOV.UK renewal facts, and renewal-preview/removal actions had no useful visible result. **Correction:** Passport keeps GOV.UK timing and fee caveats; other documents use their issuer/reference. Renewal preview is visibly local, copy removal is per-document and undoable, and encryption/reminders are not claimed live.
- **V22-M09 — fixed:** Supplement timing claimed No clashes without an interaction check. **Correction:** Removed the unsupported status, retained doses, iron GP flag and pharmacist caveat, and explicitly identified the example as not an interaction check.
- **V22-M10 — fixed:** Results, inputs and next actions were separated by repetitive cards or squeezed horizontal content. **Correction:** Cash input sits beside its result; income conclusion precedes the two-option comparison; housing shortfall precedes projection; mission steps are vertical; ledger/budget/history read as open records; insurance urgency leads the archive and renewal screen. Long title/status pairs wrap using existing tokens.
- **V22-M11 — fixed:** A blank intention could be explicitly filed, and the home council-tax link could reopen a different selected mission. **Correction:** Blank Add is disabled and guarded; the home and Money-area council/HMRC links select their intended existing mission IDs. No proposal auto-filing was added.

### Body

- **V22-BODY-01 — fixed:** Sleep was crowded into an equal half-width score tile despite being the actionable shortfall. **Correction:** Full-width Sleep with paired readiness/load and an early Plan tonight action.
- **V22-BODY-02 — fixed:** Sources always claimed Oura was used after selecting Garmin, and called a watch chest-strap accurate. **Correction:** Reflect the saved preference, remove the accuracy guarantee and state no real arbitration occurs.
- **V22-BODY-03 — fixed:** Meal editing showed fixed Lunch/12:40 and historical meals said logged just now. **Correction:** Use the editing/selected meal identity and stored time; leave selected IDs, copies, portion snapshots and log/update logic unchanged.
- **V22-BODY-04 — fixed:** Blanket bedtime rescue appeared before unrelated habits, including when the bedtime habit was already complete. **Correction:** Attach rescue only to the unfinished missed bedtime habit; stable entry ordering prevents completion-driven row reshuffles.
- **V22-BODY-05 — fixed:** Sample food plan guaranteed healthy-floor enforcement that is not implemented. **Correction:** Explicitly illustrative plan and safety-check limitation, with the original adult gate retained.
- **V22-BODY-06 — fixed:** Weekly food copy promised automatic compensation despite rollover being off and no recalculation running. **Correction:** Neutral dinner context and honest saved-preference-only disclosure; weekly numbers unchanged.
- **V22-BODY-07 — fixed:** Static meal tips asserted high protein and low daily fibre for every selected meal. **Correction:** Keep actual selected-meal nutrients, then offer general protein/fibre support without pretending those tips were calculated.
- **V22-BODY-08 — limited:** Every score opens the existing example HRV provenance sheet rather than a metric-specific receipt. **Correction:** Label it explicitly as an HRV example and disclose seeded health values upfront; retain routes. Real per-metric provenance remains Track B.

### Personal

- **V22-P01 — fixed:** Today's Aim action was buried behind the full promise, reading ritual and deposit detail. **Correction:** Photographic lead retained; today's P87 move now precedes the editorial promise, monthly gambit, quieter reading ritual and progress.
- **V22-P02 — fixed:** Aim's streak label counted distinct days rather than a consecutive streak; gambit could save a different default from the displayed text. **Correction:** Honest days-read label; shared displayed/saved gambit value, saved commitment reused, empty submissions disabled.
- **V22-P03 — fixed:** Learning discovery, results and recall actions competed with lenses, streaks and sideways statuses. **Correction:** Level-appropriate syllabus follows the photo; real-life uses precede lens ideas; result ledger precedes streak; recall-due records lead with statuses below titles.
- **V22-P04 — fixed:** Praise preceded the actionable explanation gap. **Correction:** Both tax and barbell feedback lead with the existing Show me interaction; quote and explicitly sample praise remain quieter below. Fenny pictures, controls and geometry remain unchanged.
- **V22-P05 — fixed:** Tell-back could lose an explanation after an unavailable-analysis error, permit repeated submissions, and present inserted sample text as Talk instead. **Correction:** Draft saved as typed and before submission; concurrent submissions blocked; provider error preserved inline; voice control explicitly labelled as a sample. No successful AI result is fabricated.
- **V22-P06 — fixed:** Completion claimed any tax code could now be read and a recall was actually booked. **Correction:** Scoped learning claim to practice; booking labelled recall preview. Teaching invitation separated from evidence and standalone fallback uses shared Screen chrome.
- **V22-P07 — fixed:** Long personality names, provenance and status lines competed horizontally with values. **Correction:** Open trait readings put names above unchanged TraitBar geometry; values become open ranked rows; body ledger grouped into measurements, heart/fitness and profile/targets with source below label. Level labels and AI capability statuses also stack.
- **V22-P08 — fixed:** Birthdays used contradictory fixed days/Saturday copy and upcoming dates skipped nearer people. **Correction:** Annual date parsing and UTC countdowns use the explicit 16 November 2026 seed snapshot. Upcoming people and month agendas sort chronologically; Kofi is Wednesday 18 November, not Saturday. Memorials retain no-reminder treatment.
- **V22-P09 — fixed:** Adding already-saved contacts promised an inflated added count; contact edits could retain another person's draft. **Correction:** Only genuinely new selected contacts are counted/added, already-added labels are visible, person drafts follow identity, and missing selection has an honest empty state.
- **V22-P10 — fixed:** Settings formed an undifferentiated long ledger and lengthy labels could squeeze switches. **Correction:** Existing settings grouped by appearance, connections, privacy/data and support; picture/lesson settings separated from sound/touch; switch columns cannot shrink; all existing preferences and destinations retained.
- **V22-P11 — fixed:** Private-mode, export and support copy implied capabilities not actually connected. **Correction:** Voice and drafts reflect existing capability checks, no silent cloud fallback is promised, export describes local JSON sharing, and support indicates no delivery before activation.
- **V22-P12 — fixed:** Experiment and level-intro copy implied causal conclusions and automatic transfers from local preview data. **Correction:** Observations described as samples rather than causal evidence; payday and sleep introductions explicitly preview integrations; actual money calculations and engine gates retained.

## Shared integration findings

- **V22-S01 — fixed:** Passive Section metadata looked clickable even with no handler. It is now plain callout text; only actual actions use Button.
- **V22-S02 — fixed:** Saved Pulse history from any day triggered a permanent homepage mood photo. Local-day completion now creates a small receipt; opening Pulse alone does not complete it, and a skip is distinct from a check-in.
- **V22-S03 — fixed:** Answering a question invented a five-point understanding increase and immediately demanded another. Answers now upsert one confirmed local record, update its real count, and give the remainder of the day back without fabricated score changes.
- **V22-S04 — fixed:** Main Today copy invented a referral expiry, used a frozen date and excluded Stress from its default four readings. The current local date, recurring next bill date, waiting referral and five-signal selection are used; observations stay labelled samples.
- **V22-S05 — fixed:** Short native portrait photos cropped the person away from the board’s focal position. NextMoveCard now uses an explicit 0.76 vertical focal point with measured cover geometry, preserving the frame size.
- **V22-S06 — fixed:** No-access health UI displayed fabricated phone steps/sleep; AI-down UI promised a background answer with no queue; focus claimed silenced notifications. No-access values are unavailable, error recovery returns to Chat, and focus describes only its actual timer.
- **V22-S07 — fixed:** Demo permission/bank/debit actions used live-success verbs. Preview-only controls now state sample/preview/reminder behavior; no provider or OS permission is claimed by a local flag. Native voice still uses its real availability/permission boundary.
- **V22-S08 — fixed in integration:** Intermediate Money nullish-expression and Fuel unclosed-View syntax during parallel editing were corrected by the file owners. Combined semantic mobile typecheck passed after integration.
- **V22-S09 — fixed:** Button fixed heights could clip larger text, header action labels could compete with absolute-centred titles, and a habit check had a 22pt touch height. Buttons now grow from 50pt, push titles use measured balanced slots, and the habit target has 44pt height with expanded width hit area.

## Final integration review

- **V22-R01 — fixed:** Enlarged today habit target vertically displaced its 22pt visual cell by 11pt. History row now centres every wrapper; 44pt target retained.
- **V22-R02 — fixed:** New life-knows-you link had an 18pt target. It and the level link now have a 44pt minimum.
- **V22-R03 — fixed:** Greeting stayed frozen past noon/evening in a continuously active session. Refresh now schedules at the next noon, 18:00 or midnight boundary and on foreground, without polling.
- **V22-R04 — corrected:** Restored check-in/completion receipts replayed a fade-in on navigation, making saved state briefly faint. Persistent receipt content is now steady on entry; action feedback remains in Press, native transitions and LifeOrb, not content visibility.

## Remaining application/content blockers

- **V22-OPEN-01 — open:** The seeded lens catalogue still reuses the existing Taleb/single-idea route for other thinkers. Correct per-topic authored lessons and destinations are not supplied by V22’s visual pass. Do not claim complete curriculum functionality.
- **V22-OPEN-02 — limited:** Health score provenance is an explicitly labelled HRV example, not a real receipt for every metric. Real source arbitration, timestamps and per-metric calculation provenance need the integration layer.
- **V22-OPEN-03 — blocked integration:** Actual HealthKit/Health Connect/steps, bank/OAuth/HMRC/NHS, notification delivery, cloud auth/sync, model/Phonon installation, real adaptive teaching/FSRS, billing/trials, cross-account sharing and device restrictions remain unavailable or unvalidated. No connection was attempted. Local calculations, reviewed records, local inputs and local timers remain usable.
- **V22-OPEN-04 — physical-device verification pending:** GitHub/Xcode 26.6 successfully compiled, archived, signed and uploaded the V22 iOS app, including LifeIntelligence and SQLCipher. Physical-device safe-area/Dynamic Type/Reduce Motion/audio/camera/speech/performance acceptance is still pending; a signed archive is not that evidence.
- **V22-NATIVE-01 — resolved in hosted build; local simulator remains unavailable (17 Nov 2026):** The local iPhone simulator attempt was cancelled for disk pressure, but GitHub run `44084883459` regenerated the native project, installed current pods, compiled the new native module, exported and signed the IPA, and uploaded it successfully. Local Xcode 16.2 was not used to infer compatibility.

- **V22-NATIVE-02 — first-boot storage pressure; attempt cancelled:** Simulator first boot reduced free disk from 3.7 GiB to about 47 MiB. The new device occupied 327 MiB; the much larger increase was OS-managed swap, with new swapfile timestamps during boot. On the user’s cleanup request, the new device was shut down/deleted, newly started simulator services terminated, the Expo preview stopped and only our temporary V22 JS export directories removed. Existing iOS runtime, app source, personal files and unrelated processes were retained. Active swap files were NOT deleted; save work/stop running jobs and restart macOS for safe OS-managed recovery.

## Original calmer mockup restoration — local changes after TestFlight build 4

- **CALM-01 — fixed locally:** The original owner-authored SVG family had been substituted with Ionicons. `design/Icon.tsx` now renders the exact 18 original paths through the existing native SVG library; utility symbols use the same 24-unit round-cap outline grammar. Home/layers/person/microphone, header actions, buttons, rows, controls, utilities and the legacy StyledIonicons wrapper now use this renderer. No icon-font dependency or new library was added.
- **CALM-02 — fixed locally:** The native two-tone context used `inkQuiet` instead of the reference’s readable `ink2`. The reference’s existing 24/31 medium briefing and 30/34 semibold title sizes remain unchanged; no blanket bolding. The utility CSS surface/ink/font path now mirrors the same palette instead of a separate stone/System theme.
- **CALM-03 — fixed locally:** Today’s action and photograph had been merged, losing the reference’s hierarchy. Restored the compact action card, trailing arrow, contextual Why disclosure and separate 190pt photo. Level, full Aim/progress, five signals, knowledge, daily question, due/waiting items, completion/undo and all day-tool destinations are retained.
- **CALM-04 — fixed locally:** Plan and You had reverted to tool/performance dashboards. Plan restores the editorial opening, grouped ready/waiting work and two compact tools; all missions, areas and the rest of the toolkit remain reachable. You restores its level/focus overview and personal/information groups; detailed score, streak and knowledge remain under See your progress, with every prior route retained.
- **CALM-05 — corrected during verification:** Passing `accessible={false}` through native SVG’s web renderer emitted a DOM warning. Decorative icons no longer pass boolean DOM accessibility props; parent controls keep their existing accessibility labels. Native rendering remains vectors on both platforms.
- **Verification:** 18 exact original icon paths checked against a portable fixture extracted from the unchanged mockup; navigation aliases, reference type sizes and muted colours checked. Forty focused reference/brain/API tests, mobile typecheck and both iOS/Android JavaScript exports pass. Actual dark/light preview confirms the original muted colours, 24pt medium briefing, exact rendered navigation paths and restored compositions. Why disclosure, Plan area filtering, retained progress detail and the full tool catalogue were exercised. These changes are not yet committed or uploaded; installed TestFlight build 4 is unchanged.

## V23 board checkpoint checks
- **V23-BOARD-01 — fixed:** Namespacing the original mockup’s SVG elements initially omitted its global fill/stroke rule. Restored fill-none/currentColor/1.6 stroke explicitly; dark/light inspection confirms readable icons. The inherited green profile avatar is corrected to the reference’s neutral surface.
- **V23-BOARD-02 — accounted, not hidden:** All 221 original keys are present once. The parked screen, teaching-player reference, six platform previews and parent-rendered entries have explicit statuses. The existing full BirthdayCard currently has no app caller; that gap is recorded in its screen-accounting row rather than claimed complete.
- **V23-BOARD-03 — verified:** Earlier V22 and original calmer files retain their SHA-256 hashes. All 221 rendered screens and accounting rows pass uniqueness/presence checks; both themes have zero detected geometry errors; full-size inspection and accounting search work.

## TestFlight release gate — build 4 (delivery history)

- **V22-REL-01 — fixed before upload:** Common crisis language could fall through to an unavailable model. Deterministic local support routing now covers “want to die”, suicide, not wanting to be alive and existing variants; regression tests pass.
- **V22-REL-02 — fixed before upload:** Forgotten memories and removed attachments could survive in context or a pending consent snapshot. Context now filters forgotten IDs, external requests strip file metadata/unread files, pending consent is intersected with current data, and removing an attachment cancels pending consent.
- **V22-REL-03 — fixed before upload:** Picker cache URIs could expire and failed deletion could orphan private files. Selected files now copy into the app-owned documents directory; removal deletes the owned copy before state changes and remains retryable on failure.
- **V22-REL-04 — fixed before upload:** Manual voice stop could lose the final native transcript, and onboarding could continue recording behind review. Final stop text is preserved and the microphone is stopped before proposing or opening review.
- **V22-REL-05 — fixed before upload:** Unsupported “submitted” action claims, stale Aim dates/mission selection/meal edit state, referral expiry copy, and blocked local Teach flow were corrected with rules-backed or explicit local behavior.
- **V22-REL-06 — fixed before upload:** Expo Doctor found missing `expo-asset` and SDK drift. A clean `npm ci` now resolves the SDK 58 set; TypeScript 6, Expo Doctor 20/20, autolinking, and iOS/Android exports pass.
- **V22-REL-07 — fixed after clean-CI reproduction:** GitHub’s first corrected run lacked a tracked `*.css` declaration under TypeScript 6. The declaration is tracked and a clean-checkout simulation passes.
- **V22-REL-08 — delivered:** Commit `cf603d8` built on Xcode 26.6. GitHub run `44084883459` passed clean install, typecheck, prebuild, pods, signed archive/export and Apple upload. App Store Connect build `03cc86ae-1c55-4d8d-a948-bb3f7645657e` is `VALID`, `IN_BETA_TESTING`, assigned to **Life Internal Testers**, auto-notify enabled, and not expired.
