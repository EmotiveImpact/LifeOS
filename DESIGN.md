# `life` — Design Language v1

> The single source of truth for how `life` looks, moves, sounds and speaks.
> Every screen in `apps/mobile` (Expo) is built from this file. If a reference image
> disagrees with this file, **this file wins**. If you need something this file
> doesn't cover, add it here first and then build it.

---

## 0. The idea in one paragraph

`life` finds the money, care and opportunities you're owed and walks you through claiming them.
It should feel like a **calm, expensive private advisor**: quiet paper-like surfaces, one warm
signal colour, editorial serif numbers, and sentences that read like a person briefing you.
Colour and drama live in **atmosphere** (photos and gradients at the top of a screen) — never in
the chrome. Everything you tap feels physical: springs, haptics, and a handful of soft sounds.

**Three words:** calm · certain · alive.

---

## 1. The five signatures (what makes it `life` and nothing else)

These five devices repeat across the whole app. They are the brand. Use them everywhere they fit
and invent nothing that competes with them.

| # | Signature | What it is | From refs |
|---|-----------|------------|-----------|
| 1 | **Two-tone sentence** | Prose where the quiet context is muted grey and the parts that matter are full ink, sometimes with inline icons/avatars. The main way `life` talks to you. | 01, 08, 14, 15, 16 |
| 2 | **Atmosphere → Paper** | A photo or domain gradient fills the top ~40% of a hero screen and dissolves into the flat paper surface where the content sits. | 01, 02, 04, 06, 07, 12, 16 |
| 3 | **Ticks** | One progress language: thin vertical tick marks. Used for streaks (30 ticks), the score bar, timeline scrubbing and the onboarding scan. | 06, 11 |
| 4 | **Serif numerals** | Every important number (score, money, streak, countdown hero) is set in Instrument Serif with a small sans denominator/unit. | 11, brand |
| 5 | **Peek stack** | Cards that fan behind each other with only their headers peeking; tap a header and it springs to the front. Used for the morning triage and the weekly recap. | 14, 15 |

---

## 2. Harmony decisions (where the references disagree)

The 16 references come from different apps. This is how they're unified — follow the right-hand column.

| Reference does… | `life` does instead |
|---|---|
| 05 uses progress **rings** | Ticks or the capsule meter. No rings anywhere. |
| 02 uses **outlined** plan cards; 09 uses **blue** status pills; 13 a **purple** FAB; 14 **purple/pink** cards | No borders and no extra hues. Selection = surface inversion (ink fill, paper text). Status pills are tonal. Stack cards take muted domain tints (§3.3). |
| 04 uses a heavy condensed display face; 07 sets every heading in lowercase | Display = Instrument Serif. Sentence case everywhere. Only the wordmark `life` is lowercase. |
| 08, 12, 13, 16 each have a **different week strip** | One `WeekStrip` component (§6.4) with light/dark variants. |
| 10 uses monospace for titles | Mono is **only** for timestamps and reference IDs. |
| 05 orange, 06 emerald, 08 red dot, 16 amber/crimson | One signal colour (**ember**) + one money colour (**gain**). All other colour comes from atmospheres and photos. |
| 11, 05 put lots of small labels in boxes | Labels sit directly on the surface. Max two nesting levels: screen → card → tile. |

---

## 3. Colour

### 3.1 Core tokens

| Token | Light | Dark | Use |
|---|---|---|---|
| `canvas` | `#F6F5F1` | `#0E0E11` | Screen background (warm stone / near-black) |
| `surface` | `#FFFFFF` | `#18181D` | Cards, sheets |
| `surface-2` | `#EFECE6` | `#222228` | Tiles inside cards, chips, inputs |
| `surface-3` | `#E7E3DC` | `#2C2C34` | Pressed state, tracks, unselected ticks |
| `ink` | `#141417` | `#F4F3EE` | Primary text, primary buttons, selected states |
| `ink-2` | `#5E5D65` | `#A9A7B0` | Body/secondary text (AA ≥ 4.5 on all surfaces) |
| `ink-quiet` | `#8A8890` | `#75737C` | **Only** the muted half of a two-tone sentence at ≥ 20px, and placeholders |
| `ember` | `#E8553A` | `#FF6A3D` | The one signal: "now", "live", deadlines < 24h, today's dot, active tick. Fills/dots/rings only |
| `ember-text` | `#C8391E` | `#FF6A3D` | Ember when it has to be text (AA-checked) |
| `ember-tint` | `#E8553A` @ 12% | `#FF6A3D` @ 16% | Background of urgent status pills |
| `gain` | `#0B7A5A` | `#2FD39F` | Money in, success, "cleared". Never decorative |
| `gain-tint` | `#0B7A5A` @ 10% | `#2FD39F` @ 14% | Success pill backgrounds, deposit icon circles |
| `scrim` | `rgba(14,14,17,0.55)` | same | Behind text placed on photos |

Rules:
- **Never** use Tailwind palette colours (`emerald-500`, `rose-600`, `indigo-*`…) or raw hex in components. Tokens only.
- No `border-*`, `ring-*` or `outline-*` styling. Separation comes from tone, spacing, or a hairline divider (`surface-3`, 1px) inside lists only.
- Ember appears **at most twice** per screen. If everything is urgent, nothing is.
- Light and dark must be fully equivalent. Every screen is checked in both.

### 3.2 Contrast floor
Body text ≥ 4.5:1. Large text (≥ 20px) and graphic marks ≥ 3:1. `ink-quiet` fails AA at small sizes on purpose — so it is banned below 20px.

### 3.3 Domain atmospheres
Colour that carries feeling lives here. One atmosphere per screen, top of the screen only, and it always fades into `canvas`.

| Domain | Atmosphere (top → fade) | Photo mood | Refs |
|---|---|---|---|
| **Money & Work** | `#0B2A26` → `#0E0E11` (obsidian-emerald) | — gradient + tick scrubber | 06 |
| **Health** | `#6E5F55` → `#1A1716` (warm bronze stone) | soft skin/linen/morning light | 11 |
| **Admin & Gov** | `#8D9AA3` → `#D9CFC3` (slate → stone) | quiet architecture, paper | 12 |
| **Growth** | `#FF4A1C` → `#120806` (ember dusk) | silhouettes, horizons, fire | 05, 16 |
| **Calm / night** | starfield photo → `#0E0E11` | cosmos | 07 |

Text on an atmosphere is always paper-white (`#F4F3EE`) and sits on a gradient scrim strong enough for 4.5:1.
Stack and prompt cards (§6.7, §6.15) may use their domain's atmosphere at **15–25% opacity** over `surface` as a tint.

---

## 4. Typography

Fonts (load with `expo-font` / `@expo-google-fonts/*`; block the splash screen until loaded):
- **Display:** Instrument Serif (Regular, Italic)
- **UI:** Inter (400, 500, 600)
- **Mono:** JetBrains Mono (400): timestamps and reference IDs only

| Style | Font | Size / line | Tracking | Use |
|---|---|---|---|---|
| `numeral-xl` | Serif | 64 / 64 | -1.5 | Hero score, hero balance |
| `numeral-l` | Serif | 40 / 44 | -0.8 | Card-level numbers (streak, value) |
| `title-serif` | Serif | 30 / 34 | -0.4 | Screen titles ("Today", "Check in") |
| `statement` | Inter 500 | 28 / 34 | -0.6 | Two-tone sentences (§6.2) |
| `headline` | Inter 600 | 22 / 28 | -0.4 | Card titles on heroes, mission names |
| `title` | Inter 600 | 17 / 22 | -0.2 | Card titles, list item titles |
| `body` | Inter 400 | 15 / 22 | 0 | Paragraphs |
| `callout` | Inter 500 | 13 / 18 | 0 | Meta, captions, pills, labels (**the minimum size**) |
| `mono` | JetBrains Mono | 13 / 16 | 0 | `08:30 · 12.05`, `PAQ-327-P21` |
| `unit` | Inter 500 | 13 / 16 | 0 | The `/100`, `/30`, `.50` attached to serif numerals |

Rules:
- **Minimum 13px**, everywhere. The only exceptions are the weekday initials in `WeekStrip` and the dock labels (11px, 600).
- **Sentence case.** No ALL-CAPS section labels. Wordmark is always lowercase `life`.
- Serif is for **numbers and screen titles only**. Never serif for body or buttons.
- Money: whole part in `ink`, decimals in `ink-quiet` (`£12,847` + `.50`). Units/denominators are sans `unit` style, top-aligned.
- Dynamic Type: support scaling up to 1.3× without clipping (use `maxFontSizeMultiplier={1.3}` on display styles).

---

## 5. Space, shape, depth

- **Grid:** 4pt. Screen gutter **20**. Card padding **20**. Gap between cards **12**. Gap between sections **32**. Touch targets ≥ **44×44**.
- **Radius:** `xs 10` (pills inside tiles) · `sm 14` (tiles, inputs, choice-card media) · `md 20` (inner cards) · `lg 28` (cards) · `xl 36` (sheet top corners, phone-edge cards) · `full` (buttons, chips, dock). **Nested rule:** inner radius = outer radius − padding.
- **Depth:** cards are **flat** (tonal). Only floating things cast shadow: dock, FAB, sheets, the front card of a peek stack.
  - Light shadow: `0 12 32 rgba(20,20,23,0.12)`; dark: no shadow, the floating element sits on `surface-3` with a hairline.
- **No blur, no glass, anywhere** (§43). Floating elements are solid surfaces with a hairline and, in light mode, a soft shadow.

---

## 6. Components (one canonical version of each)

Build these in `apps/mobile/src/design/` with no business logic. Screens compose them; screens never restyle them.

1. **`Atmosphere`**: props `domain | imageSource`, `height` (default 42% of the screen). Renders the photo/gradient, a bottom fade into `canvas`, and the top safe-area scrim. Content can overlap its bottom edge by 24px (a card sliding up out of the atmosphere, like refs 06 and 08).
2. **`TwoTone`**: props `segments: Array<{ text, tone: 'quiet' | 'ink', icon?, avatar? }>`, `size: 'statement' | 'headline'`. Inline icons/avatars are 1em, vertically centred, with 4px spacing. Words animate in a 30ms-per-word stagger the first time a screen appears.
3. **`Card`**: `surface`, radius `lg`, padding 20, no border, no shadow. Variants: `default`, `tinted(domain)`, `inverted` (ink background, paper text, the ref 09 balance card).
4. **`WeekStrip`**: 7 days with `< >` paging. Day = weekday initial (11px) + date numeral. Selected = inverted rounded-square tile (radius `sm`). Today = ember dot under the date. Up to 3 density dots for deadlines. An optional ember ring marks an anchor day (e.g. a session). Swipe pages weeks; each day change fires a selection haptic.
5. **`Ticks`**: props `count`, `filled`, `variant: 'streak' | 'meter' | 'scrubber'`. Ticks 2px wide, 4px gap, rounded tops. Filled = `ink` (or paper on an atmosphere), empty = `surface-3`, the active tick = `ember` and 1.6× taller. `scrubber` is draggable, fires a selection haptic per tick (throttled to 1 per 40ms) and shows a floating date pill above it (ref 06).
6. **`CapsuleMeter`**: horizontal pill track (`surface-3`) with a fill (`ink`) and a caption under it ("Your money admin is looking good"). Used next to serif numerals (ref 11).
7. **`PeekStack`**: up to 4 cards. The back cards offset −10px Y and scale −0.04 each, and show only their header row. Tapping a peeking header springs it to the front (§7). Swiping the front card down sends it to the back. The front card gets the floating shadow.
8. **`NudgeCard`**: mono timestamp, then a `title` of up to 3 lines, then right-side media: a photo thumbnail (radius `sm`), the `DottedOrb` symbol, or nothing. Variant `hero` takes a full domain gradient (ref 10, card 1). Swipe left to snooze 1 day, right to complete.
9. **`MetricRow`**: 3 equal tiles (`surface-2`, radius `md`), each with a callout label above a `title` value (ref 05).
10. **`StageStepper`**: 3 nodes (`Started → Submitted → Cleared`, or custom labels), each with a mono timestamp. Done = ink filled check node. Current = ember ring node with a pulsing halo (respects Reduce Motion). Future = `surface-3` node. Connector line: ink up to the current node, `surface-3` after it (ref 09).
11. **`ActivityTimeline`**: rows with a mono time and date in a left gutter, a check node on a dotted vertical line, and body text (ref 09 right).
12. **`Dock`**: floating pill, bottom inset 12 + safe area, solid `surface` background with hairline, 4 items. Active = inverted capsule containing icon + label. Inactive = icon only, `ink-2`. Hides on scroll down and returns on scroll up (spring).
13. **`Button`**: `primary` = full-width pill, height 56, `ink` fill with paper text (on an atmosphere it inverts to paper fill with ink text). `secondary` = `surface-2` pill. `link` = underlined callout text. Exactly one primary per screen.
14. **`ChoiceCard`**: onboarding option (ref 01). Radio + `title` + `callout` description. When selected, the card reveals a photo on its right half behind a scrim and flips to paper text, with a spring and a selection haptic.
15. **`PromptBanner`**: translucent warm card (Growth atmosphere at 20%) with a small icon + label ("Inspiration", "Check-in"), a `title`, a callout subtitle, and a `♡` save toggle (ref 16).
16. **`LedgerRow`**: 44px icon circle (`surface-2`, or `gain-tint` for money in) + title + right-aligned amount (whole part ink, decimals quiet) with a sub-amount (ref 06).
17. **`MoneyFigure`**: serif whole part + quiet decimals + optional delta pill (`▲ 12.4%` in gain). Includes an `eye` toggle that masks the value as `••••` with a crossfade, and the setting persists (ref 09).
18. **`StatusPill`**: callout text on a tint. Kinds: `neutral` (`surface-2`/`ink-2`), `live` (`ember-tint`/`ember-text`), `done` (`gain-tint`/`gain`).
19. **`Countdown`**: relative time label (`in 1h 15m`, `in 3 days`). Below 24h it renders in `ember-text`. Updates every minute.
20. **`Sheet`**: `@gorhom/bottom-sheet` with top radius `xl`, a grabber (36×5, `surface-3`), backdrop: solid dim at 35% (no blur), snap points `[55%, 92%]`.
21. **`DottedOrb`**: the brand symbol (a ring of dots, ref 10). Idle = slow 12s rotation. "Thinking" = dots pulse in sequence. Also used as the Ask tab icon and the loading state.

Each component has a story in the **design gallery** route (`/design`, dev-only) showing every variant in light and dark.

---

## 7. Motion

Use `react-native-reanimated` 4 (springs and layout animations) and `react-native-gesture-handler`.

| Token | Spec | Use |
|---|---|---|
| `spring.snappy` | damping 20, stiffness 260, mass 1 | presses, chips, toggles, tick active |
| `spring.smooth` | damping 26, stiffness 170 | cards moving, stack reorder, dock hide/show |
| `spring.sheet` | damping 30, stiffness 200 | sheets, screen-level transitions |
| `fade.quick` | 160ms, `Easing.out(Easing.cubic)` | text swaps, masks |
| `enter.item` | opacity 0→1, translateY 8→0, 240ms, stagger 40ms (max 6 items) | list/card entrance |

Rules:
- **Press:** everything tappable scales to 0.97 on press-in (`spring.snappy`) and back on release. No opacity flashes.
- **Shared transitions:** mission card → mission detail (the card grows into the atmosphere header), and the score numeral moves between Today and You.
- **Numbers roll:** serif numerals count up/down over 600ms with ease-out whenever their value changes.
- **No cross-fade flicker:** a screen change is a native stack push or a tab switch. Never fade from a partially transparent state.
- **Reduce Motion** (`AccessibilityInfo.isReduceMotionEnabled`): replace movement with `fade.quick`, and stop the orb rotation and halo pulse.

---

## 8. Haptics (`expo-haptics`)

| Moment | Haptic |
|---|---|
| Tab change, chip, week day, choice card, tick scrub | `selectionAsync` |
| Open a card / mission | `impactAsync(Light)` |
| Sheet snaps to a point | `impactAsync(Medium)` |
| Task completed, mission stage advanced | `notificationAsync(Success)` |
| A deadline < 24h appears on screen for the first time today | `notificationAsync(Warning)` |
| Destructive confirm | `notificationAsync(Error)` |

Haptics are on by default and can be switched off in **You → Settings**. Never fire more than one haptic per gesture.

---

## 9. Sound (`expo-audio`)

Sound is rare and precious — four sounds, no more. Warm, soft, acoustic (felt piano, marimba, glass), never digital beeps.

| File | Length | Character | When |
|---|---|---|---|
| `tap.wav` | ≤ 60ms | soft felt "tock" | Primary button press only |
| `complete.wav` | ≤ 500ms | two notes rising a fifth (e.g. C5→G5), marimba | Task completed |
| `cleared.wav` | ≤ 900ms | three-note rising arpeggio with a short glass shimmer | Mission reaches **Cleared** / money confirmed |
| `brief.wav` | ≤ 1.5s | airy pad swell, very quiet | First open of the morning brief each day |

Rules:
- Peak at −14 dBFS, all four loudness-matched, 44.1kHz mono WAV in `apps/mobile/assets/sounds/`.
- **Respect the silent switch** (`playsInSilentMode: false`), and mix with other audio, never interrupting the user's music.
- Sounds always pair with their haptic. They're on by default and can be switched off in Settings, separately from haptics.
- If no licensed audio is available, synthesise the four files with a small Node script (sine + triangle partials, 5ms attack, exponential decay) committed in `apps/mobile/scripts/make-sounds.mjs`.

---

## 10. Voice & copy

`life` sounds like a sharp, kind friend who has already done the reading.

- **Specific beats vague:** "Your GP referral expires in 9 days." not "Health action needed."
- **Calm by default:** start triage with what's *not* urgent ("Nothing pressing today —").
- **Second person, present tense, sentence case.** No exclamation marks except in a celebration.
- **No system-speak.** Banned: "Life Graph updated", "Awakening · Action Ready", "Co-pilot draft", "module", "triage signals", "recalculated", "eligible tasks".
  Use: "Saved", "You're on track", "Draft message", "Your areas", "Worth doing today".
- **Numbers always:** amounts (£), days left, minutes needed ("Takes 6 min").
- **Buttons are verbs + object:** "Book appointment", "Copy draft", "Mark as sent". Never "OK", "Submit", "Continue" alone.

Examples of the two-tone voice:
> <quiet>Good morning, Ada. Nothing urgent —</quiet> **your HMRC rebate** <quiet>is waiting on</quiet> **one form** <quiet>and</quiet> **2 GP slots** <quiet>opened this week.</quiet>

> <quiet>This week you</quiet> **cleared 3 ↑** <quiet>missions and moved</quiet> **£180 ↑** <quiet>to your buffer.</quiet>

---

## 11. App structure (what each screen is made of)

**Dock (4 tabs):** `Today` · `Plan` · `Ask` (DottedOrb icon) · `You`

| Screen | Built from | Refs |
|---|---|---|
| **Onboarding: welcome** | Full-bleed photo atmosphere, `statement` two-tone headline, primary "Get started", link "I already have an account" | 01 L |
| **Onboarding: questions** | Progress `01 — 02 03` (mono), `statement` two-tone question, 3–4 `ChoiceCard`s, primary "Next: …" verb button | 01 R |
| **Onboarding: scanning** | `DottedOrb` thinking + `Ticks` meter filling + a two-tone sentence that builds as findings arrive ("Found **£2,340** you may be owed…") | 06, 10 |
| **Today** | Header `Mon ●` + date (right, ink-2) → `TwoTone` brief → steps/sleep inline stats → `PeekStack` of today's items (HMRC, GP, Bank…) → `WeekStrip` + "Up next" list with `Countdown`s → `NudgeCard` deck → 1–2 `PromptBanner`s | 08, 14, 12, 10, 16 |
| **Plan** | `title-serif` "Plan" → **Monthly gambit** (`TwoTone` statement in a `Card`, editable) → `MetricRow` (This week / Value found / On-time) → "Your areas" (Money & Work · Health · Growth · Levels, each a tinted card with a `CapsuleMeter`) → Missions list (cards with `StageStepper` mini + `Countdown`) | 16, 05, 09 |
| **Mission detail** (stack push) | `Atmosphere` (domain/photo) with `headline` + `StatusPill` → `StageStepper` → reference ID (mono, copy with haptic) → "What to do" horizontal tiles of steps (ref 03 actives) → **Draft message** sheet (copy / share) → `ActivityTimeline` → one primary CTA | 04, 09, 03 |
| **Money** (from the Plan area card) | Emerald `Atmosphere` + `MoneyFigure` with eye + `Ticks` scrubber + a "Cashflow" sheet that slides up over it with `LedgerRow`s grouped by Today/Yesterday | 06, 09 |
| **Health routine** (from the Plan area card) | Bronze `Atmosphere` → Score `70/100` + `CapsuleMeter` → Day streak `4/30` + `Ticks` streak ("Most see results after 14 days") → Morning / Evening routine cards with tag pills and `(i)` explainers | 11 |
| **Ask** | Chat. `life` replies in two-tone prose with inline mission cards. A composer pill with attach (camera / photos / files). The `DottedOrb` thinking state while replying | 14 |
| **You** | Serif score hero + `Ticks` streak → **Weekly recap** `PeekStack` (one card per week, two-tone deltas with ↑↓) → Settings (Appearance, Sound, Haptics, Hide balances) → Membership | 15, 11 |
| **Membership** (sheet/modal) | Growth atmosphere (ember photo), `headline` centred, two plan tiles (selected = inverted, `33% off` pill on annual), primary "Start membership", link "Maybe later", legal callout | 02 |

---

## 12. Definition of done (every screen, both themes)

- [ ] Only tokens: no raw hex or Tailwind palette colours in screens or components
- [ ] No borders/rings/outlines; separation by tone and space
- [ ] No text under 13px (except week-strip initials and dock labels)
- [ ] Serif only on numbers and screen titles
- [ ] Exactly one primary button; ember used ≤ 2 times
- [ ] Every tappable element: scale press + correct haptic; ≥ 44pt target; `accessibilityLabel`
- [ ] Light and dark screenshots both look intentional
- [ ] Reduce Motion and Dynamic Type 1.3× tested
- [ ] Copy passes §10 (no banned words, verbs on buttons, numbers present)

---

# v2: chat-first, grows with you

> v2 changes §11 (app structure). Everything in §1–§10 still applies. Visual target:
> `design-board/life-design-board-v2.html` (seven live screens, the growth model, and the feature inventory).

## 13. The two principles

1. **The conversation is the home.** life opens on a clean chat. The Island shows what life is checking. Replies are calm two-tone prose (no bubble) with live cards inside: missions, steppers, money, drafts. Every other tab is one tap away, and chat is one tap from every tab via the **AskBar**.
2. **It grows with the user.** The app reveals itself by **level** (`computeLifeLevelState`): 1 Starting out → 2 Stabilize → 3 Set your routines → 4 Build momentum. Nothing appears before it's useful. Locked tools are visible as quiet outlines with "Level N", so the path ahead is clear but never noisy.

## 14. Inputs are instruments, not forms

Anything life needs to know is asked inside the chat or a sheet using a tactile instrument:

| Instrument | Asks | Feel | Replaces |
|---|---|---|---|
| **PulseField** | "How are you arriving?" | Drag across a dot matrix. Dots swell near your finger, and colour and word change by mood. A selection haptic fires on each mood change. Sets `pulse.focusBias`, which reorders Today | DotMatrixPulseSheet |
| **CountStepper** | "How many people live with you?" | A huge serif number with ± buttons. A figure steps in per person (spring pop), capped at 16+, with a live consequence line underneath (`getCrowdUnlockSummary`) | CrowdStepperSheet |
| **AttachMenu** | Documents | The thread dims (solid overlay, no blur) and options spring up one after another: **Scan a letter** (hero), Camera, Photos, Files, How I'm feeling. Parsed docs patch the profile and unlock tasks | BlurIntakeOverlay |
| **ChoiceCard** | Onboarding questions | One question at a time. After onboarding, remaining questions trickle into chat as chips | IntakeState / ProgressiveQuestion |

## 15. New components (add to `apps/mobile/src/design`)

`Island` (pill → card with a rotating dot globe + status text; opens while life works, closes when the reply lands) · `ChatThread`, `UserBubble`, `LifeReply` (two-tone prose + inline cards + chips) · `Composer` (pill input, + attach, send; send becomes a mic when empty) · `AttachMenu` · `PulseField` · `CountStepper` · `AskBar` (replaces the Dock: orb + "Ask life anything…" + 3 mini tabs) · `LevelPath` + `GateList` (checkable gates; when the last gate is ticked → level up) · `IntroCarousel` (segmented bars over gradient art, title, body, Next / Show me; used for level-ups and life+) · `ToolTile` (unlocked / locked "Level N") · `NewTag` (ember "New at level N", fades after first visit).

## 16. App structure v2 (replaces §11)

**AskBar tabs:** Today · Plan · You, with **Chat** opened from the bar's text field (or the orb) as a full-screen stack route.

| Screen | Contents | Level |
|---|---|---|
| **Chat** | Island · thread · Composer with AttachMenu. Opening message is today's brief + top mission card + chips | 1 |
| **Today** | `Mon ●` header + level pill → two-tone brief → **To move up** GateList → Worth doing today → (L2) Your routines → (L3) One bigger decision → (L4) This month's gambit · PromptBanners | 1, grows |
| **Plan** | Area chips (Money, Work, Home, Health, Relationships, Life admin) → Missions → **Toolkit** grid of ToolTiles | 1, tools unlock |
| **Mission detail** | as §11 (atmosphere, StageStepper, steps, Draft message, timeline) | 1 |
| **Money** | as §11 (emerald atmosphere, ledger, scrubber, privacy eye) | 2 |
| **Health stack / Bloodwork** | bronze atmosphere, AM/PM routines, ticks, lab reader | 2 / 3 |
| **You** | Score + streak, Household (CountStepper), Pulse history, Weekly recap PeekStack (L3), Settings | 1 |
| **Level up** | IntroCarousel, one page per unlock, with the cleared sound. Shown once per level | 2+ |
| **Membership** | IntroCarousel variant + plan tiles (ember atmosphere). Never blocks level 1 | — |

## 17. Feature inventory: nothing gets lost

| Existing | v2 home | Level |
|---|---|---|
| ChatState + processLifeOSMessage | Chat (home), AskBar everywhere | 1 |
| ScanningState + DynamicIsland | Island in chat | 1 |
| BlurIntakeOverlay + SAMPLE_EVIDENCE_DOCS | AttachMenu → Scan a letter | 1 |
| DotMatrixPulseSheet | PulseField (morning check-in, attach) | 1 |
| CrowdStepperSheet | CountStepper (You → Home, inline in chat) | 1 |
| IntakeState + ProgressiveQuestion | Onboarding + chat chips | 1 |
| HubState + TodayBriefSheet | Today | 1 |
| PortalSpotlightState + TaskReadingSheet | Mission detail + Draft sheet | 1 |
| TaskDeckState + TaskAuraState | Plan → Missions | 1 |
| RunwayCalculatorSheet | Toolkit → 30-day cash plan (L1 gate) | 1 |
| MoneyWorkStackSheet | Toolkit → Tax & NI, Subscriptions; Money | 1–2 |
| CashflowLedgerSheet | Money screen | 2 |
| HealthStackSheet | Toolkit → Health stack | 2 |
| Operating rules (normals) | Today → Your routines | 2–3 |
| IncomeDecisionPanel | Toolkit → Income & structure | 3 |
| HousingDecisionTools | Toolkit → Rent vs buy (3), Mortgage vs invest (4) | 3–4 |
| BloodworkPanel | Toolkit → Bloodwork reader | 3 |
| weeklyRecap | You → Weekly recap | 3 |
| GameOfLifeSheet + chapters | LevelPath + IntroCarousel | 2+ |
| LevelsThinkersSheet (THINKER_ATEAM) | PromptBanners + Toolkit → Thinkers | 4 |
| GrowthPathSheet + GrowthCheckIns | Toolkit → Growth path; check-ins in chat | 4 |
| STAGE_GAMBITS | Today "One bigger decision" + Monthly gambit | 3–4 |
| MembershipSheet | Membership modal | — |
| PRESET_PROFILES / StudioSidebar | Dev-only debug menu + /design gallery | dev |

## 18. Chat rules

- life never uses a bubble. It writes like a person: two-tone, short, specific, with numbers.
- At most **one card** and **up to 4 chips** per reply. Cards are the real components (StageStepper, MoneyFigure, CountStepper…), not screenshots of them.
- The Island opens with a specific verb ("Checking HMRC records…", "Reading the letter…") for ≥ 900ms, then closes as the reply rises in (`enter.item`).
- User messages: `surface` bubble on the right, radius 20, `body` text, soft shadow in light only.
- The composer's send button fires the `primary` feedback, a reply arriving fires `tap`, and a task completed from chat fires `complete`.

---

# v3: home-first; talk, file, guide

> **v3 supersedes v2 where they disagree:** life is NOT chat-first. §13.1 ("the conversation is the home") and the
> Chat row of §16 are replaced by this section. v2's growth model, instruments, toolkit and inventory (§13.2, §14, §15, §17) all still apply.
> Visual target: `design-board/life-design-board-v3.html`.

## 19. The model

**Home (Today) is the core screen.** Chat and Talk are a two-way channel layered on top of it:
- **life → you (get you moving):** life writes first, at the right moment, with a reason, a time cost and a value ("You've got 20 free minutes. Finish the P87 and £840 starts moving."). The steps open inline.
- **you → life (figure things out):** you ask or brain-dump by voice or text. life answers with your real numbers.
- **Everything said is filed back into the app** as typed records, so the app understands you and the conversation always leaves something behind.

**The loop:** Talk → File → Know → Ask → Nudge → Rise (to the next vantage point = level).

## 20. Filed records (data model for the builder)

Every recognised piece of a talk/chat becomes one record:

```ts
type FiledRecord = {
  id: string;
  kind: 'fact' | 'insight' | 'mission' | 'decision' | 'goal' | 'answer';
  area: 'you' | 'home' | 'work' | 'money' | 'health' | 'goal'; // maps onto LIFE_AREAS
  label: string;            // "Lives with 2 flatmates"
  value?: string | number;  // 3
  profilePatch?: Partial<UserProfile>;   // reuse processLifeOSMessage's extraction
  taskId?: string;          // when it creates or updates a mission
  source: { type: 'talk' | 'chat' | 'question' | 'document' | 'record'; at: string; excerpt?: string };
  status: 'proposed' | 'confirmed' | 'removed';
};
```

- Records start as `proposed` and become `confirmed` on **Looks right**. Nothing is filed silently.
- **Understanding** = the share of each area's key questions that have confirmed records. It's shown on Home as "life knows you NN%" and per area on You. The gaps become life's next questions.

## 21. New screens

| Screen | What it is | Components |
|---|---|---|
| **Talk** (full-screen layer from the AskBar mic) | Live transcript, quiet ink with recognised phrases highlighted in their area colour. Each recognised phrase **flies as a chip** into the **Filing tray** (6 area tiles with counts) with a soft `file` sound + selection haptic. Waveform, timer, big mic with an ember halo while listening | `Transcript`, `FilingTray`, `FlyChip`, `Waveform`, `BigMic` |
| **Understood** (after every talk) | "Here's what I understood. Remove anything I got wrong." A list of records → destination, each with Remove/Undo, then a "What this changed" summary (new missions, understanding Δ, unlocks) and **Looks right** | `RecordRow`, `ChangeSummary` |
| **Ask / Chat** | Your question → life's answer with real numbers → a **FileCard**: "Save this to Work as a decision to revisit in April?" | `UserBubble`, `LifeReply`, `FileCard` |
| **Nudge** | A push notification (≤ 1/day) opens a short life message with the steps inline (checkable) + primary "Start step 1" + "At 6pm" / "Not this week" (these train timing) | `NudgeMessage`, `StepChecklist` |
| **Things to know** | The app's memory. Insight cards: area dot · source ("From your talk · 12 Nov") · serif value · one-line meaning. Filter by area | `InsightCard`, area filter chips |
| **Vantage point** | Levels drawn as a ridge you climb (ember dusk atmosphere). Current peak in paper, next peak in ember with a pulse. "To get there" gates, then "Take the next step" | `Ridge`, `GateList` |

## 22. Home (Today) v3 order

`Mon ●` + level pill → two-tone brief → **life knows you** meter → **life is asking** (one question card, answered with chips/instruments; it slides out on answer, adds an insight and raises understanding) → **Things to know** (horizontal insight cards, newest first) → **Worth doing today** → level sections (v2 §16) → PromptBanners.
AskBar: orb + "Talk to life…" (opens Chat) + Today/Plan mini tabs + a **mic** button (opens Talk).

## 23. Sound additions

Add a fifth, tiny sound: `file.wav` (≤ 120ms, two soft high sine blips, −20 dBFS). It plays when a record lands in the tray or an answer is filed. Always paired with a `select` haptic.

## 24. Rules

- Home is the core. Talk and Chat always close back to Home.
- Never file silently. Every record shows its source and can be removed.
- One question at a time on Home, and always an instrument, never a form.
- Nudges: at most 1 a day, each with a reason, time cost and value.
- The climb is always visible: the level pill on Home, and the vantage screen one tap away.

---

# v4: Inter, dark-first, hairline depth

> **v4 is the current visual language. It overrides §3–§5 wherever they disagree.** The product model (v3 §19–§24),
> growth (v2 §13.2, §14, §17), components, motion, haptics and sound all carry over.
> Visual target: `design-board/life-design-board-v4.html` (8 screens at true 393×852).
> Code: `apps/mobile/src/design/tokens.ts` and `fonts.ts` already use v4.

## 25. Type: Inter only

- **One family: Inter** (`@expo-google-fonts/inter` 400/500/600/700) plus **JetBrains Mono** for IDs and times. **Instrument Serif is removed.**
- Weight and tracking do the work the serif used to. Big type is set tight; numbers use **tabular figures**.

| Style | Size/line | Weight | Tracking |
|---|---|---|---|
| display (hero numbers) | 56/58 | 600 | −0.045em, tnum |
| numeral-l | 32/36 | 600 | −0.035em, tnum |
| title-1 (screen titles) | 30/34 | 600 | −0.03em |
| statement (two-tone) | 24/31 | 500 | −0.022em |
| title-2 | 20/26 | 600 | −0.02em |
| title-3 | 16/21 | 600 | −0.014em |
| body | 15/22 | 400 | −0.008em |
| callout (minimum) | 13/18 | 500 | −0.003em |
| mono | 12.5/16 | 400 | 0 |

## 26. Colour: dark-first, one signal

| Token | Dark (default) | Light |
|---|---|---|
| canvas | `#08090A` | `#F7F7F8` |
| surface | `#141517` | `#FFFFFF` |
| surface-2 | `#1B1C1F` | `#F3F3F5` |
| surface-3 | `#26272B` | `#E6E6EA` |
| line (hairline) | `rgba(255,255,255,.07)` | `rgba(13,14,16,.08)` |
| ink | `#F7F8F8` | `#0D0E10` |
| ink-2 | `#8A8F98` | `#5C6068` |
| ink-quiet (two-tone, ≥20px only) | `#62666D` | `#8B8F97` |
| ember | `#FF6B3D` | `#E5532B` |
| ember-text | `#FF7A50` | `#C2410C` |
| gain | `#3DD68C` | `#0B7A55` |

**Area colours** (you/home/work/money/health/goal) appear only as 6px dots, filing chips and the one glow per screen. See `areaColors` in tokens.ts.

## 27. Depth, shape, atmosphere

- **Hairline depth replaces "no borders".** Surfaces get a 1px `line` edge (+ a faint top highlight in dark). Separation inside cards uses 1px `line` dividers.
- **Radius:** tag 7 · tile 10–12 · **button 14** (slabs, not pills) · card 20 · sheet 28. Pills are only for tags and chips.
- **Checks are 7px-radius squares** (like a real checklist). Stepper nodes are 8px-radius squares; the current node has an ember ring with a soft glow.
- **Light fields replace photo atmospheres:** one radial glow per screen in the domain colour (ember / money / work…) at the top, over a faint 14px dot grid that fades out. No full-bleed photos or sunsets.
- **Floating elements** (AskBar, notifications): solid `surface` + 1px hairline + soft shadow (light mode). No blur, no translucency.

## 28. Evolved, not copied

- Kept as ours: the loop, two-tone sentences, ticks, dotted orb, instruments, levels as vantage points.
- Evolved: photo atmospheres → light fields; pill buttons → slabs; no borders → hairlines; big rounded cards → precise 20/12 radii; circle checks → squares; Island → a quiet status, no globe.
- Dropped: Instrument Serif, warm stone paper, stock-photo cards, 1:1 reference layouts, decorative card gradients.

---

# v5: the complete screen catalogue

> **This is the build list.** 40 screens in 9 chapters (see §32 for the Learn chapter and mood history added after the first v5), in the v4 visual language (§25–§28) and the v3 product model (§19–§24).
> Visual target: `design-board/life-design-board-v5.html` (system map, every screen interactive, coverage table).
> Calculator figures on the board come from `packages/core` (tax year 2026/27). Screens must call the engine, never hard-code numbers.

## 29. Screens (expo-router)

| # | Screen | Route (suggested) | Level | Engine / existing function |
|---|---|---|---|---|
| **1 · Arrive** |||||
| 01 | Welcome | `onboarding/index` | — | IntakeState |
| 02 | One question at a time (destinations) | `onboarding/question/[n]` | — | ProgressiveQuestion · LIFE_DESTINATIONS · ONBOARDING_QUESTIONS |
| 03 | Or just tell life | `onboarding/tell` | — | Talk → processLifeOSMessage |
| 04 | Building your plan | `onboarding/building` | — | ScanningState · getEligibleTasks |
| **2 · Core (tabs)** |||||
| 05 | Today (home) | `(tabs)/index` | — | HubState · TodayBriefSheet · computeLifeLevelState |
| 06 | Plan | `(tabs)/plan` | — | TaskDeckState · LIFE_AREAS · STAGE_GAMBITS · toolkit |
| 07 | You | `(tabs)/you` | — | computeLifeScore · understanding per area |
| **3 · Talk and file** |||||
| 08 | Talk | `talk` (full-screen modal) | — | processLifeOSMessage → FiledRecord |
| 09 | Understood | `talk/review` | — | FiledRecord proposed → confirmed |
| 10 | Ask, then file | `chat` | — | compareUKBusinessStructures etc. + FileCard |
| 11 | Attach | sheet over `chat` | — | BlurIntakeOverlay |
| 12 | Letter, understood | `documents/[id]` | — | SAMPLE_EVIDENCE_DOCS · profilePatch · unlocksTaskId |
| **4 · Nudges and instruments** |||||
| 13 | Nudge | notification → `nudge/[id]` | — | operating rules · notifications |
| 14 | Pulse | `pulse` (sheet) | — | DotMatrixPulseSheet · focusBias |
| 15 | Household | `household` (sheet) | — | CrowdStepperSheet · getCrowdUnlockSummary |
| **5 · Missions and memory** |||||
| 16 | Mission | `mission/[id]` | — | PortalSpotlightState · TaskReadingSheet |
| 17 | Draft message | `mission/[id]/draft` (sheet) | — | copilotDraft |
| 18 | Things to know | `know` | — | FiledRecord · WORLD_RULES · DAILY_PRACTICAL_NOTES |
| **6 · Toolkit** |||||
| 19 | 30-day cash plan | `tools/cash-plan` | 1 | RunwayCalculatorSheet |
| 20 | Tax & NI check | `tools/tax` | 1 | MoneyWorkStackSheet · tax record |
| 21 | Money | `tools/money` | 2 | CashflowLedgerSheet · getAvailableBankAccounts |
| 22 | Subscriptions | `tools/subscriptions` | 2 | DEFAULT_SUBSCRIPTIONS |
| 23 | Health stack | `tools/health` | 2 | HealthStackSheet · computeHealthTargets |
| 24 | Income & structure | `tools/income` | 3 | compareUKBusinessStructures |
| 25 | Rent vs buy (+ mortgage vs invest) | `tools/home` | 3 (4) | compareRentAndBuy · compareMortgageAndInvest |
| 26 | Bloodwork reader | `tools/bloodwork` | 3 | BloodworkPanel · LAB_GUIDES · interpretLabResult |
| 27 | Protection review | `tools/protection` | 4 | getProtectionChecklist |
| 28 | Growth path | `tools/growth` | 4 | GrowthPathSheet · GROWTH_CHECK_INS · RESET_STEPS |
| 29 | ~~Thinkers~~ → replaced by the Learn chapter (§32) | — | — | — |
| **7 · Grow** |||||
| 30 | Weekly recap | `recap` | 3 | buildWeeklyRecapDeck |
| 31 | Vantage point | `vantage` | — | computeLifeLevelState.toAdvance |
| 32 | Level up | `level-up` (modal, once per level) | 2+ | computeGameChapter |
| **8 · Account** |||||
| 33 | life+ | `plus` (modal) | — | MembershipSheet (never blocks level 1) |
| 34 | Settings | `settings` | — | prefs · getConnectedPortals · export/delete |

## 30. Build order

1. Tabs shell + Today + Plan + You (05–07) wired to the store and engine.
2. Talk → Understood → Things to know (08, 09, 18) with the FiledRecord model (§20).
3. Mission + Draft (16, 17), then Nudge (13).
4. Onboarding (01–04).
5. Toolkit, level by level: L1 (19, 20) → L2 (21–23) → L3 (24–26, 30) → L4 (27–29).
6. Instruments (14, 15), Attach + Letter (11, 12), Ask (10).
7. Vantage + Level up (31, 32), life+ and Settings (33, 34).

## 31. Accuracy rules

- Every money figure comes from `packages/core` at render time. Show "Estimate" and "not tax advice" on tax and structure tools.
- Health screens explain and refer ("ask your GP"). They never diagnose. Use NHS guidance where it exists.
- Thinkers' ideas are paraphrased in life's voice. Don't quote them.


## 32. Learn from the best (+ mood history)

Experts are **lenses**, not quotes. Each thinker in `THINKER_ATEAM` (Naval, Taleb, Housel, Munger, Clear, Newport, Attia, Huberman, Sethi…) is a way of looking at the user's own situation. Learning is measured by what it changed.

| # | Screen | Route | Level | Engine |
|---|---|---|---|---|
| L1 | Learn (library): today's idea, lenses row, "For where you are", collections | `learn` (also Plan → Toolkit → Learn) | 1 | THINKER_ATEAM · gambits.thinkerId |
| L2 | A lens (thinker page): their view in plain words, ideas (level-gated), where life uses this lens, books to read | `learn/lens/[id]` | 1 | ThinkerWisdom.coreIdea · appliedRule · linkUrl |
| L3 | An idea in 60 seconds: 3 cards (the idea → in your life with real numbers → do this) + a simple diagram. Finishing files an insight and opens the linked tool | `learn/idea/[id]` | per idea | FiledRecord kind `insight` |
| L4 | Ask through a lens: lens chips (e.g. Taleb / Housel / Munger) re-frame life's answer to your question | chat with `lens` param | 1 | processLifeOSMessage + appliedRule |
| L5 | Quick recall: one question a few days later, with spaced intervals (1d → 3d → 7d → 21d → 60d) | `learn/recall` | 1 | recall schedule on FiledRecord |
| L6 | Ideas into action: applied ideas → linked results (£ saved, routines set), learning streak | `learn/progress` | 1 | FiledRecord + weeklyRecap |
| M1 | Mood over time: 14-day coloured bars from Pulse check-ins, patterns life noticed and what it changed | `pulse/history` | 1 | PulseFeeling history · focusBias |

Placement: a **Today's idea** card on Today (after Things to know); "Your learning" and "How you've been" rows on You.

Rules:
- **Never quote** the thinkers. Explain each idea in life's voice and credit the thinker and book. Link to their own sources.
- **Never impersonate.** "life, through Taleb's lens" applies an idea to the user's numbers. It never speaks *as* the person.
- Every idea ends in **one action** linked to a real tool, mission or routine. Money ideas carry "general guidance, not regulated financial advice", and health ideas defer to NHS guidance and the GP.
- Ideas are **level-gated** like tools (e.g. Taleb's "Skin in the game" at L3, "Lindy" at L4), so the library grows with the user.

---

# v6: imagery

> Visual target: `design-board/life-design-board-v6.html`. The images are in `apps/mobile/assets/images/scenes/` (JPEG, 1200px, about 90 KB each).
> Full-resolution originals: `design-references/generated/`. They were generated for life through the gpt-image bridge.

## 33. Where photos go (and where they never do)

Photography is only for **threshold moments**. Everywhere the user works, the app stays clean (v4 light fields).

| Treatment | What | Screens |
|---|---|---|
| **Cover** | Full-bleed over the top ~70%, fading to `canvas`. Type sits in the photo's calm area | Welcome (01) · life+ (33) · Level up (32), with one image per page |
| **Hero band** | Photo across the top ~44% (360–470pt), behind the title only. Content starts on plain background | Goal missions (e.g. first home) · Lens page (L2) · Vantage point (31) |
| **Card image** | A photo inside one card with a bottom scrim; text in paper white | Today's idea on Today (05) · Learn hero (L1) · the selected goal card in onboarding (02) |
| **Wallpaper** | Outside the app only | The lock screen behind a nudge · weekly recap share card |

**Never:** on working screens (Today's lists, Plan, tools, money, settings, forms); behind chat or Talk; more than one image per screen; faces or stock clichés; text over a busy area; hand-graded images.

**The set** (one art direction: quiet cinematic 35mm, a single warm ember light against cool shadow, a small subject, a calm top, a dark base):
`welcome` (arrival) · `home` (first-home goal) · `learn` (ideas) · `vantage` (the climb, level up) · `calm` (health and rest) · `plus` (life+).
New images must follow the same prompt recipe. See the `STYLE` string in the generation command in this session's history, summarised here: *"quiet cinematic editorial photography, 35mm, fine grain, muted desaturated palette with a single warm ember-orange light against cool near-black shadows, lots of negative space, subject small in frame, calm top two-thirds for text, dark lower third, no text, no faces, portrait 2:3"*.

## 34. Grade and implementation

- One component, `<ImageTreatment kind="cover" | "band" | "card" source={…} height={…}>`, built on **expo-image** (`contentFit="cover"`, `transition={400}`, blurhash placeholder) + **expo-linear-gradient** scrims.
- Grade in code: saturation 0.85 and contrast 1.02 (or bake them once at export) + a 12% grain overlay. Never grade images one by one.
- Scrims: top `rgba(8,9,10,.45)` → 0 by 22%. Bottom → `canvas` at 100%. Text on an image must reach 4.5:1.
- Type on images is paper `#F7F8F8` (72% / 50% for the softer tones). Buttons: paper primary, solid dark secondary (`rgba(8,9,10,.6)` → use `surface` at 100% on scrim areas). Never ember text on a photo.
- Motion: a slow drift, scaling 1.00 → 1.06 over 24s, alternating. Off with Reduce Motion.
- Light mode: images keep their dark grade; only the bottom fade ends in the light canvas. Use light status-bar content over covers and bands.
- Fallback: show the domain light field until the image loads, and if it fails. Layout never depends on the photo.

---

# v7: Aim, adaptive imagery, Apple-native effects

> Visual target: `design-board/life-design-board-v7.html`. All 17 images are in `apps/mobile/assets/images/scenes/` (originals in `design-references/generated/`).
> **v7 relaxes v6's "no faces" rule for direction B only.**

## 35. Four art directions, each with a job

| Dir | Look | Job | Files |
|---|---|---|---|
| A · Quiet (v6) | Dark, cinematic, one ember light | Low moods, night, rest | `welcome` `learn` `calm` `vantage` `home` `plus` |
| **B · Daylight** | Bright sun, vivid blue sky, real people, real joy (Commune energy) | **Brand:** Welcome, life+, level-up, share cards. Faces allowed | `b-welcome` `b-home` `b-health` |
| **C · Colour field** | One everyday object on a bold saturated colour, studio light | **Tools and Learn** headers/cards. Each area owns a colour and an object | `c-home` (orange/keys) `c-growth` (cobalt/plant) `c-health` (lime/shoes) |
| **D · Glimpses** | Bright, believable scenes of a better everyday life | **Growth system:** mood images and earned glimpses of the Aim | `d-drained` `d-calm` `d-glimpse-home` `d-glimpse-freedom` `d-glimpse-sunday` |

v6 placement rules (§33) still apply: Cover / Hero band / Card image only, at most one per screen, never on working screens, chat or Talk.

## 36. Mood-adaptive imagery and glimpses

- Every image is tagged `{ direction, moods[], areas[], aims[], minProgress, minLevel }`.
- **Today's card:** choose by the latest Pulse mood first (drained/anxious → soft D or A; calm → D calm; driven → B energy).
- **Glimpses** (pictures of the user's own Chief Aim) appear only when **earned**: progress toward the Aim ≥ 40% *or* a mission cleared this week, **and** the mood isn't drained or anxious. At most one a day.
- A glimpse always says **why it appeared** (the actions that earned it) and **what it's tied to** (the Aim). Glimpses never depict anything the user hasn't stated as their aim.
- Settings: "Show glimpses" toggle (default on). With Reduce Motion, glimpses crossfade without drift.

## 37. Chief Aim

The idea of a *definite major aim*, popularised by Napoleon Hill (*Think and Grow Rich*, 1937), explained in life's own words (no quotes).

- **Hierarchy:** Chief Aim (years) → this month's gambit → today's moves. Every mission can be tagged "for your Aim".
- **Write your Aim** (`aim/new`): 4 steps, one at a time: *what exactly* · *by when* · *what you'll give for it* · *your first plan*. The statement builds live; life suggests answers from FiledRecords; voice input supported.
  Statement format: "By {when}, I will {what}. In return I will {give}. My plan: {plan}."
- **Your Aim** (`aim`): the statement over its glimpse (hero band), a twice-daily **read** ritual (morning/night, with a streak), progress toward the aim (ticks), the breakdown (gambit → today's move), and edit (with history kept).
- **Today:** a one-line Aim card pinned at the top (thumbnail + "Your Aim · N% there").
- **Learn:** a lens, "Napoleon Hill · Definiteness of purpose", with 4 checkable principles ending in *Write your Aim* / *Read your Aim*. Related lenses: Clear, Munger.
- Data: `ChiefAim { what, when, give, plan, createdAt, history[], readLog[] }`, which feeds glimpse selection and gambit suggestions.

## 38. Apple-native effects (all available for SDK 58, checked on npm)

| Effect | Package | Use in life |
|---|---|---|
| ~~Liquid Glass~~ | — | **Removed (§43).** Standard solid native tabs/AskBar. |
| SF Symbols, animated | `expo-symbols` | All icons. Bounce on tap, pulse while waiting, variable colour while syncing, replace on state change |
| Mesh gradients | `expo-mesh-gradient` | ~~Pulse~~ **Not for the mood check-in (see §40).** Optional for the Aim and life+ backgrounds only |
| Native SwiftUI controls | `@expo/ui` | Aim date picker, cash plan slider, toggles, menus |
| Shaders and particles | `@shopify/react-native-skia` | Film grain, glow, level-up particles |
| Illustrations | `rive-react-native` / `lottie-react-native` | Small animated moments (empty states, success) |
| Images | `expo-image` | All photography: blurhash placeholder, 400ms transition |
| Widgets + Live Activities | `@bacons/apple-targets` + ActivityKit | Home Screen "today's move" widget; mission progress live in the **Dynamic Island** and on the Lock Screen |

## 39. Still to bring in (see the v7 board, section 05)

Now: Sign in with Apple and sync · notification strategy · privacy by design · real connections (Open Banking, NHS, HMRC, VisionKit OCR) · the AI layer behind talk/file/ask/lens · empty, error and offline states.
Later: accessibility pass · regulated-wording review · respectful analytics · other countries · App Store assets · shared life (Commune-style households).


---

# v8: one story, pictures that look like you, motion

> Visual target: `design-board/life-design-board-v8.html`. Story images: `apps/mobile/assets/images/scenes/p{1,2,3}-{drained,calm,driven,home}.jpg`.

## 40. Pulse stays the dot field

The mood check-in is **always the v5 dot field** (§14, `DotMatrixPulseSheet` design): a 12×14 grid, dots swell (radius 1.1 → 7.6) within ~95pt of the finger in the mood's colour, the word and hint update live, and a selection haptic fires on each mood change. **No mesh gradients on the Pulse.** After it's set, Today's image follows the mood (§36).

## 41. Images as one story, opt-in representation

- **One protagonist.** All story images show the *same person*: the user's chosen look. They are frames of one life, not unrelated stock.
- **The four frames** (the same scenes for every look): `drained` (rainy window seat, tea) · `calm` (sunny desk, notebook) · `driven` (riverside run) · `home` (their own green front door, keys in hand: the glimpse).
- **Threads that connect every frame:** the same warm golden daylight grade · the same 35mm eye-level camera · **the protagonist always wears ember-orange** (the app's signal colour) · the same places recurring (flat, desk, river, front door).
- **New scenes** must reuse the same prompt recipe (see the generation command used for `img3`): `"Series style, one frame from a continuous photo story about the same person: bright warm natural daylight… the protagonist always wears something soft ember-orange…"`, rendered for every supported look.
- **Pictures that look like you (opt-in):**
  - Asked once in onboarding ("Who should appear in your pictures?"), optional and skippable, with **"Someone like me" · "Mix it up" · "Places only"** given equal weight.
  - "Someone like me" asks about **appearance, not ethnic labels**: a skin-tone swatch (6), how you present (woman / man / non-binary / rather not say) and an age range.
  - **Never infer** appearance from a name, photo, voice or location.
  - **Scenes never vary by appearance.** Only the person in the frame changes.
  - **Stored on the device only**, used for nothing except choosing images, never sent to analytics. Treat it as special-category-adjacent under UK GDPR, so get explicit consent, and let people change or clear it in Settings → Pictures (images update immediately).
  - "Places only" uses people-free frames (`d-drained`, `d-calm`, `d-glimpse-freedom`, `d-glimpse-home`).
  - Coverage plan: generate each frame for a range of looks (at least 6 skin tones × 3 presentations × 2 age bands) before launch; the 3 looks in `img3` are the proof of concept.

## 42. Motion, the Apple way, on iOS and Android

The feel comes from five habits, all built with **Reanimated 4 + Gesture Handler** (both already installed) so iOS and Android match:

1. **Springs, not timed curves.** `withSpring({ duration: 350–500, dampingRatio: 0.75–0.9 })`, the same model as SwiftUI's `.spring(response:dampingFraction:)`.
2. **Interruptible and gesture-driven.** Anything you can see move, you can grab mid-flight. On release, hand the gesture velocity to the spring (cards, sheets, the peek stack, the scrubber).
3. **Grow from what you tapped.** Shared element transitions (mission card → mission detail, the Today's idea card → Idea, the Aim card → Your Aim). Nothing appears from nowhere.
4. **Settle in, one after another.** Lists use `FadeInDown.springify().delay(i * 40)`, capped at 6 items.
5. **Numbers roll.** Spring-driven counting with tabular figures (score, money, progress).

Platform pairs (same intent, native on each):

| Effect | iOS | Android |
|---|---|---|
| Animated icons | SF Symbols via `expo-symbols` | Material Symbols, animated with Reanimated |
| Glass | — removed (§43) | — removed (§43) |
| Particles, grain, glow | Skia | Skia |
| Illustrated moments | Rive | Rive |
| Live progress outside the app | Live Activities / Dynamic Island | Ongoing notification with progress + Glance widget |
| Haptics | `expo-haptics` | `expo-haptics` |

Reduce Motion: springs become 160ms fades, drift and particles stop, and shared transitions crossfade.


## 43. No glass (final)

**No Liquid Glass, no blur, no frosted or translucent surfaces, on any platform.** It's tighter, faster on Android, and more legible.
- AskBar, Dock, sheets, notifications, chips over images: **solid** `surface` / `surface-2` with a 1px `line` hairline. Over photos, use a solid near-black chip (`#0D0E10` at 100%) with paper text, or paper with ink text.
- Sheet and overlay backdrops: a solid dim (`rgba(0,0,0,.45)` dark, `rgba(13,14,16,.3)` light).
- Remove `expo-glass-effect`, NativeTabs glass and `expo-blur` from the plan. Motion (§42) carries the premium feel.

## 44. Imagery for v1: generic first

- **v1 ships without "pictures that look like you", but with a diverse mixed cast.** Default `pictures.look = 'mix'`: each story moment shows a different person, so people of every race and gender appear across the app (`storyImage('mix', moment)`). 'places' stays available as an option. The per-look architecture (`Look`, `SCENES`) stays for v2.
- The "Who should appear in your pictures?" question (§41) stays behind a `picturesLikeMe` feature flag, **off**, until: every frame is generated for full coverage (≥6 skin tones × 3 presentations × 2 age bands), each image is checked by a human for awkward or stereotyped poses, and it has been tested with real users.
- **Never ask for race or ethnicity.** If enabled later, ask about appearance only (§41).

## 45. v14 refinements (final)
- **No borders on buttons.** Secondary buttons, square icon buttons, chips and plain tags are solid `surface-2` with no hairline. Cards, list groups, icon tiles and **avatars keep their hairline or ring**, because there the edge does a job (separating stacked surfaces, framing a face).
- **The orb evolves** (MOTION.md §3.2, `LifeOrb`): ring → sphere → core → done. Ring everywhere by default; sphere only for real work over a second; core only for voice; never decorative.
- **Imagery for Learn and moments** is the diverse daylight cast (people mid-moment: understanding, deciding, moving in), never a colour-field still life. The plant-on-blue `c-growth` frame is retired.
- **Chat is back** as the Talk button's tap action: a clean thread, the Island growing into a card with the sphere orb while life checks things, two-tone replies with live cards inside, suggestion chips. Hold the button to talk.
- **The board is organised by navigation** (tab → area → screen), and every screen states how it opens and where from. Build routes from that, not from feature names.

## 46. The top bar (final): it never moves
- **The header is fixed.** Same place and same height on every screen of its kind. Only the content scrolls underneath. No collapsing large titles, no titles fading in, no bar sliding away, no hairline appearing on scroll. (`TopBar.tsx`, sits outside the ScrollView.)
- **Which bar is decided by how the screen opened:**
  - **Root** (Today, Plan, You): eyebrow + large title on the left, at most two icon buttons on the right. Today: search, From life (bell). Plan: add. You: your avatar, settings.
  - **Push**: back · centred title · **one** smart action or nothing. Edit on a person or profile, ⓘ on any score, + on a list, Share on a recap, ⋯ only for objects with several actions (mission, bill, chat, document).
  - **Sheet**: grabber, title on the left, close (or one text action like Done) on the right.
  - **Full-screen flow**: close · progress · step count (onboarding, lessons, tests, focus).
  - **Over a photo**: the push bar with its buttons on solid dark discs; still fixed.
- Never two bars on one screen. The board applies this rule to every screen automatically from its "opens from" type.

## 47. v16 (final): the globe, and borders on trial
- **LifeOrb v2.** The ring *is* the equator of a globe of dots, seen from straight above. Working: the view tilts to 24° and the other latitude rings fade in, so it becomes a globe turning in 3D, with near dots bigger and brighter and the back half faint. Voice: a soft wave travels across the dots with the voice level. **The glowing ember core is gone.** Done: dots gather, then it tilts back to the ring. Under 40pt it's always the ring. (`Orb.tsx`, board screen "The orb, evolving".)
- **Borders on trial.** The board now shows every screen with **no borders at all** (cards, icon tiles, avatars, inputs), and a **Borders** toggle in its top controls brings the hairlines back to compare. The owner decides; until then the code keeps card and avatar hairlines as they are, and buttons and chips have none (§45).
