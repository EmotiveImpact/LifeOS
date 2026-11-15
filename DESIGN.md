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
  - Light shadow: `0 12 32 rgba(20,20,23,0.12)`; dark: no shadow, use `surface-3` + `expo-blur` (intensity 40, tint dark).
- **Blur:** the dock and sheet backdrops use `BlurView`. Nothing else blurs.

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
12. **`Dock`**: floating pill, bottom inset 12 + safe area, blur background, 4 items. Active = inverted capsule containing icon + label. Inactive = icon only, `ink-2`. Hides on scroll down and returns on scroll up (spring).
13. **`Button`**: `primary` = full-width pill, height 56, `ink` fill with paper text (on an atmosphere it inverts to paper fill with ink text). `secondary` = `surface-2` pill. `link` = underlined callout text. Exactly one primary per screen.
14. **`ChoiceCard`**: onboarding option (ref 01). Radio + `title` + `callout` description. When selected, the card reveals a photo on its right half behind a scrim and flips to paper text, with a spring and a selection haptic.
15. **`PromptBanner`**: translucent warm card (Growth atmosphere at 20%) with a small icon + label ("Inspiration", "Check-in"), a `title`, a callout subtitle, and a `♡` save toggle (ref 16).
16. **`LedgerRow`**: 44px icon circle (`surface-2`, or `gain-tint` for money in) + title + right-aligned amount (whole part ink, decimals quiet) with a sub-amount (ref 06).
17. **`MoneyFigure`**: serif whole part + quiet decimals + optional delta pill (`▲ 12.4%` in gain). Includes an `eye` toggle that masks the value as `••••` with a crossfade, and the setting persists (ref 09).
18. **`StatusPill`**: callout text on a tint. Kinds: `neutral` (`surface-2`/`ink-2`), `live` (`ember-tint`/`ember-text`), `done` (`gain-tint`/`gain`).
19. **`Countdown`**: relative time label (`in 1h 15m`, `in 3 days`). Below 24h it renders in `ember-text`. Updates every minute.
20. **`Sheet`**: `@gorhom/bottom-sheet` with top radius `xl`, a grabber (36×5, `surface-3`), backdrop at 35% `canvas` + blur, snap points `[55%, 92%]`.
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
