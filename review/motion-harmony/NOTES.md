# Calm motion and one look across the app

Branch: `claude/project-thread-8i27bq` (20 Nov 2026). Built on top of the bar, Talk and menus work. Not merged yet.

## What changed

**1. Nothing wobbles any more.** The bounce came from five places, and all five are fixed:

- Every button used a springy release that overshot and shook slightly when you let go. It now settles straight back.
- The "bouncy" setting overshot by about a quarter. It now lands softly with almost no overshoot.
- Lists that reflow, chips that appear and the talk tiles used a default springy entrance. They now glide in and stop.
- A few things grew in from 60% or 70% of their size, which reads as a pop. Now nothing starts smaller than 90%.
- The orb's "done" moment over-gathered. It now settles with a small, soft give.

**2. Things arrive the iPhone way.** One shared way of arriving: a short fade, a small rise and a tiny grow, on a smooth spring that doesn't bounce. Drawers (the check-in drawer, the "File these?" and "Log this?" drawers) rise from the bottom edge, and when their words change they cross-fade instead of jumping. Menus drop from the button that opened them.

**3. The web preview now moves like the phone.** Pages you open slide in from the right, and full-screen moments rise from the bottom. Before, the preview showed a blank screen for about a third of a second on every page open, then the page popped in. Pages now show straight away. (On the phone, iOS and Android do their own native page transitions, so nothing changes there.)

**4. One look across the app.** The big 34pt opening sentence now appears only on Today, Plan and You, plus full-screen moments and photo heroes. Pages you open from them (Body, Budget, Missions, What life knows, Your day and the rest) use a calmer 24pt sentence, the way iPhone apps use a large title on the main tabs and a smaller one deeper in. The useful part of each page now starts higher on the screen.

**5. HeroUI is gone.** The old HeroUI kit has been taken out of the app: its setup, its styles, the unused screens that relied on it, and three packages. A note in the repo's design rules says not to use it again.

Pictures in this folder:

- `1-calmer-titles-before-after.jpg`: five deeper pages, before and after.
- `2-menu-motion.jpg`: the menu opening, frame by frame.
- `3-page-motion.jpg`: a page opening in the web preview, frame by frame.
- `4-dark.jpg`: six screens in dark mode.
- `5-eighteen-screens.jpg`: eighteen screens after the change.

## Still to do on your side

The "expo-heroui-builder" skill lives in your Claude account, so I can't delete it. To remove it: in Claude, open Settings, then Capabilities (or Skills), find "expo-heroui-builder" and delete it. Until then I won't use it for this app.

## Checks

- Type check passes. iPhone and Android bundles build. The web preview builds and was checked on 24 screens at iPhone size, light and dark.
- No engine, data or sync files touched.

## Not changed (still on the shortlist)

The bigger redesigns from the earlier list are untouched and still need your pick: a simpler Today, Plan showing what's waiting first, You leading with what life knows, fewer stock photos, keeping the bar on deeper pages, and one Talk screen for speaking and typing.
