# life — Motion

> **What this is:** how every screen moves from state to state, on iPhone and Android.
> Read with `DESIGN.md` §38 and §42 (effects and motion) and §43 (no glass). The playable lesson on the v13 board ("Play the whole lesson") shows these transitions working.
> Tokens live in `apps/mobile/src/design/tokens.ts` (`motion`, `springs`, `durations`). Feedback (haptics + sounds) lives in `feedback.ts`.

## 1. Principles

1. **Motion explains, it doesn't decorate.** Something moves only to show where it came from, where it went, or that it changed.
2. **Springs, not curves.** Everything uses springs so it can be interrupted mid-flight and still feels physical. No linear easing, ever.
3. **Things come from where you touched.** A tapped card expands into its screen; a sheet rises from the button that opened it; a ticked item collapses where it was.
4. **One hero per transition.** Only one thing makes a big move; everything else fades or shifts by ≤ 14 px.
5. **Feel and sound go with motion.** Every state change that matters has a haptic, and the big moments have a sound (`feedback.ts`). They fire when the motion *lands*, not when it starts.
6. **Same on both platforms.** Reanimated 4 springs on iOS and Android. Only the system-owned parts differ (back gesture, sheets' grabber, haptic engine strength).
7. **Reduce Motion is a first-class mode.** When on (`useCalmMotion()`), every move becomes a 160 ms cross-fade, nothing scales, and numbers appear without rolling. Haptics stay.
8. **No glass, no blur, no parallax tricks.** Depth comes from hairlines and a 2% scale, not from blur (DESIGN §43).

## 2. Tokens

| Token | Value | Use |
|---|---|---|
| `motion.smooth` | spring 550 ms, damping ratio 0.85 | Screens, sheets, cards expanding, anything large |
| `motion.snappy` | spring 350 ms, damping ratio 0.9 | Presses, toggles, segmented controls, chips, list items |
| `motion.bouncy` | spring 600 ms, damping ratio 0.7 | Only for earned moments: tick landing, "You've got it", level up |
| `motion.rise` | 420 ms: opacity 0→1, y 14→0, scale 0.98→1 | Content entering a screen |
| `motion.stagger` | 60 ms | Items entering one after another (max 6 staggered, the rest arrive together) |
| `durations.quick` | 160 ms | Cross-fades, Reduce Motion fallback |
| `durations.roll` | 600 ms | RollingNumeral and MoneyFigure count-ups |
| Press | scale 0.97 on press-in (snappy), back on release | Every `Press` |

Reanimated usage: `withSpring(v, motion.smooth)`; entering animations: `FadeIn.springify().duration(550).dampingRatio(0.85)` style builders, or a shared `riseIn(delay)` helper built from `motion.rise`.

## 3. The building blocks

> **The top bar never moves** (DESIGN §46). Navigation transitions move the content, never the header of the screen you're on; scroll never changes the header.

### 3.1 Navigation

| From → to | Motion | Feedback |
|---|---|---|
| Tab → tab (Today, Plan, You) | Cross-fade 160 ms, content rises 6 px. No sliding between tabs. | `select` |
| Push (list → detail) | Native stack push on both platforms (iOS slide, Android predictive back). Content inside rises in. | none |
| Card → its screen (shared element) | The card's frame expands into the new screen with `motion.smooth`; its title moves to the header. Back reverses it into the same card. | `open` |
| Modal sheet | Rises from the bottom with `motion.smooth`; the screen behind dims to 40% (no blur). Drag down to close, velocity-aware. | `open` on open |
| Full-screen flow (onboarding, lesson, check-in) | Fades up from the button that started it; steps inside slide horizontally 36 px with a scale of 0.98 (see the playable lesson). | `select` per step |
| Close (×) | Reverse of how it opened. | none |

### 3.2 Components

| Component | States | Motion |
|---|---|---|
| Button | idle → pressed → loading → done | Press scale 0.97 (snappy). Loading: label fades, DottedOrb spins in place. Done: label swaps to "✓ Done" with a bouncy tick. |
| Toggle / Segmented / ChipGroup | off ↔ on | Thumb or highlight slides with snappy; colour follows. `select`. |
| Ticks | empty → active → filled | The active tick pulses once a second (opacity 0.6↔1). Filling: scales 0.6→1 with bouncy. `complete` on the last tick. |
| CapsuleMeter / StageBar | value change | Width animates with smooth. Never jumps. |
| Checklist / HabitRow | todo → done | Box fills (bouncy), text greys and strikes through left to right (240 ms), row stays put. `complete`. |
| NudgeCard | idle → dragging → done / dismissed | Follows the finger; past 40% it commits with velocity; done collapses the height with smooth. `complete` or `snap`. |
| RollingNumeral / MoneyFigure | old → new value | Digits roll for 600 ms, decimals quieter. Reduce Motion: swap instantly. |
| LifeOrb (`Orb.tsx`, v6) | ring · thinking · working · searching · listening · done | One family made of the ring's dots (DESIGN §48). The ring always spins underneath (one clockwise lap per 12 s). Changing state: each dot travels from where it is to its new place, ease-in-out over 720 ms, 38 ms apart in ring order (extra dots 120 ms later), so 3D states collapse straight back into the spinning circle. Done: dots gather to 38% radius with a springy overshoot over ~450 ms, brighten, then open back out (~1 s total). Reduce Motion: states shown still, no travel. |
| FilingTray | item arrives | Phrase lifts out of the transcript and flies to its row (smooth), row count rolls. `file`. |
| Card (complete) | open → cleared | Gain-green tint washes in from the left, then the card collapses. `cleared` sound. |
| Toast / banner | in → out | Drops 8 px from the top with smooth, leaves after 3 s by fading up. |
| PulseField (mood dots) | mood change | Dots drift to the new colour field over 900 ms (smooth), no flashing. |
| Image (cover / band) | enter | Image fades from 0 and settles from scale 1.04 → 1 over 900 ms. Text rises in after 120 ms. |

### 3.3 Moments (the only places `bouncy` is allowed)

| Moment | Choreography | Feedback |
|---|---|---|
| Mission cleared | Card washes green → tick lands (bouncy) → card collapses → the day's ticks fill one more. | `cleared` |
| You've got it (Teach me) | Band image settles → title rises → ticks fill one by one (60 ms) → recall line fades in. | `complete` |
| Level up | Screen dims → DottedOrb gathers to centre → level number rolls → light-field glow blooms (opacity only) → new unlocks rise in one by one. | `brief` |
| Habit milestone | The HabitRow tick lands bouncy, strength figure rolls up. | `complete` |
| Aim read | Each line of the Aim brightens in order as you read (word stagger 30 ms). | none |

## 4. Every screen, state by state

Each screen lists its **states** and how it moves between them. "Enter" is how the screen arrives; "Rise" means `motion.rise` with stagger.

### Arrive
| Screen | States → transitions |
|---|---|
| Welcome | enter: cover image settles, title rises, button last. Tap → question (horizontal step). |
| One question at a time | answering → answered: chosen card fills (snappy), others fade to 40%, then auto-advance after 350 ms. Progress line grows (smooth). |
| Or just tell life | idle → listening (orb listens, waveform) → transcribing (words fade in at 30 ms) → understood (phrases light up). |
| Where do you live · Sign in · Primers | Sheet-style steps; primer explains, then the system prompt appears. Never animate over a system dialog. |
| Building your plan | Checklist items rise in one by one as each check finishes (real progress, not a timer). Done → crossfade to Today. |

### The core
| Screen | States → transitions |
|---|---|
| Today | loading (skeleton hairlines) → ready (rise, stagger) → move done (card clears) → all done (ticks complete, `brief`). Pull to refresh: orb spins. |
| Today, day one | Empty → first move appears with rise. |
| Plan | Tabs of missions/tools; switching segments cross-fades the list. Locked tool → unlock sheet. |
| You | Sections rise. "What life knows" opens as a push. |
| Area (e.g. Money) · Routines · Calendar-aware day | Push. Gap rows highlight in ember when tapped (snappy). |
| Why am I seeing this? | Sheet. Reasons rise in order of weight. |

### Aim
| Screen | States → transitions |
|---|---|
| Write your Aim | typing → suggestion appears below (rise) → saved (`file`, card shrinks into the Aim pill). |
| Your Aim · Gambit · Glimpse | Aim read moment (§3.3). Glimpse: image settles, line by line text. |

### Talk and file
| Screen | States → transitions |
|---|---|
| Talk | idle → listening → thinking → replying → filed. Orb states per §3.2; filing tray rows fly in (`file`). |
| Understood | Rows rise; each can be tapped to edit (inline expand, smooth). |
| Ask, then file · Attach · Letter scan | Attach menu: sheet. Scan: camera full-screen, the found letter snaps to its corners (snappy), then fields fill in one by one. |

### Nudges and instruments
| Screen | States → transitions |
|---|---|
| Nudge | Swipe states per NudgeCard. Lock-screen version uses the system's own animations. |
| Pulse | idle → choosing (dots drift) → saved (`file`). |
| Household · Children · Bedrooms · Buffer | CountStepper: number rolls; +/− press scale; the outcome line updates with a cross-fade. |
| Mood over time · Shared life | Charts draw left to right over 600 ms on first view only. |

### Body
| Screen | States → transitions |
|---|---|
| Body home | Readiness ring fills from 0 (smooth), metric tiles rise. |
| Connect devices | each device: off → connecting (orb) → connected (tick lands). |
| Readiness · Sleep · Load · HRV · Signals · Stress · Forecast · Cycle · Fitness age · Sources · Glucose · Basics | Charts draw on first view; switching ranges (4 weeks / 3 months) morphs bars to new heights (smooth), never redraws from zero. |
| Breathe | Guided circle grows on in-breath, shrinks on out-breath (sine, not spring; this is the one exception), light haptic at each turn. |
| Live workout | Heart-rate number rolls each second (no bounce); zone colour cross-fades. Live Activity mirrors it. |
| Snap a meal → Confirm → Meal logged | camera → analysing (orb thinks over the photo) → confirm (items rise, each editable) → logged (score rolls, `file`). |
| Habits · New habit · Habit strength | Tick per §3.2. Strength figure rolls. Heatmap cells fade in by week. |
| Evening journal · Insights · Coach | Journal toggles snappy; insights rise. Coach is a Talk thread. |

### Missions and memory
| Screen | States → transitions |
|---|---|
| Mission | StageStepper advances (smooth), the active stage pulses. Cleared → moment (§3.3). |
| Draft message | Draft types in at 30 ms per word, then is editable. Send → `file`, collapses into the timeline. |
| Do it for me | review → approved → running (each step ticks as it really completes) → done (`cleared`). Cancel at any point rolls back the visible state. |
| What life remembers | Swipe a memory to forget: row slides out, list closes the gap (smooth). |

### Toolkit
| Screen | States → transitions |
|---|---|
| Every tool | Inputs change → result figure rolls (600 ms). Locked → unlock sheet with a gentle shake of the lock (snappy, 2 cycles) only if you tap it again. |

### Learn and Teach me
| Screen | States → transitions |
|---|---|
| Learn · Lens · Idea · Ask through a lens | Lens tiles rise; an idea's three cards page horizontally with smooth. |
| Teach me button (anywhere) | appears with rise when life detects something new to you. Tap → the button's frame expands into the full-screen lesson (shared element, smooth, `open`). |
| Lesson ready | Orb thinks while building (real progress), bite list rises one by one, level selector is a segmented control. |
| Bite | Picture builds as you read: each part fades and rises in order (stagger 120 ms); key words brighten. Next → horizontal step. |
| Guess first | choosing → chosen (fills snappy) → reveal: the picture builds in under the question (rise), answer line in green or neutral. `complete` if right, `select` if not. |
| Puzzle | answering → answered: right answer turns green with a tick (bouncy), the chosen wrong one greys. Never shakes, never red. |
| Recap | Lines land one by one with a tick (650 ms apart). |
| Tell it back | Orb listens; your words appear as you speak; life's question fades in under them; the waveform follows your voice. |
| How you did | Strengths rise first, then the one gap. "Show me" expands the card inline (smooth). |
| You've got it | The moment (§3.3), then two buttons rise. "Check my tax code now" returns to the screen that started the lesson with a reverse shared-element. |
| What you've learned · Quick recall | List rises. Recall cards flip with a 3D-free cross-fade (no rotation). |

### Grow, states and account
| Screen | States → transitions |
|---|---|
| Weekly recap | PeekStack: tap a card to bring it forward (smooth). Share → share sheet. |
| Vantage · Level up · Your levels | Level up per §3.3. |
| Experiment · Bigger decisions | Result reveals after the experiment ends, never mid-way. |
| Offline and errors | Banner drops in; retry button shows orb while retrying. |
| Widgets · Live Activity · Watch | System animations only; content updates cross-fade. |
| life+ · Settings · Notifications · Private mode · Your AI · Knows | Toggles snappy; download progress uses a CapsuleMeter. |

## 5. Platform notes

- **iOS:** use native stack (`expo-router` Stack) for pushes so the back-swipe is real. Haptics via `expo-haptics` (selection, impact light/medium, notification success).
- **Android:** predictive back is on; let the native stack own it. Haptics are weaker on many phones, so the sound matters more there; keep sounds on by default, respecting silent mode.
- **Both:** run all springs on the UI thread (Reanimated worklets). Target 60 fps on a mid-range Android (e.g. Pixel 6a) and 120 fps on ProMotion iPhones. Test every moment with Reduce Motion on.

## 6. About "the Apple animation skill"

There's no Apple-motion skill installed in this setup. This file is that skill for life: the springs come from your Feynman app's `motion.ts`, the behaviour follows Apple's Human Interface Guidelines on motion (purposeful, interruptible, honours Reduce Motion), and it applies equally on Android. Antigravity builds to this file; Claude checks it at every gate (the "Motion pass" in the board's to-do list).
