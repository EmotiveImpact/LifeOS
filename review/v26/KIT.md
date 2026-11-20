# life · V26 — design brief and kit

You are redesigning screens of **life**, an app that looks after someone's whole life: money, home, work, health, food, habits, learning, people and dates. It finds what you're owed, what's due and what's next. The sample person is **Ama** (27, self-employed designer, London, saving for a first home).

The owner rejected earlier boards as lazy. They then supplied 20 reference screens and a video. V26 is built from those. Your screens will sit beside the 20 already built in `screens/core.js`. **Read that file first; it is the standard.** If a screen you write would look weaker next to those, it isn't finished.

## What the owner's references share (their taste)
- **Type is the hero.** One large two-tone sentence carries the screen, with small icons set inside it. A short label sits above it. Lots of air.
- **Few things per screen.** One clear focal object: a sentence, one big figure, or a photograph.
- **One black slab button.** Round icon buttons. Soft rounded rows and tiles.
- **Numbers as calm tiles**: label, target, one big figure.
- **Dots and grids for days lived.** Ticks for percentages.
- **Photographs do a job**: food fills the screen, search opens on pictures, moments get a sky.
- **One small question at a time**, in a sheet or drawer.

## Rules that cannot be broken (the owner set these)
1. **Inter only.** Never set `font-family`.
2. **No blur, no glass, no mesh or decorative gradients.** Solid fills only. (Photo scrims and the dot spine are in the kit already.)
3. **No borders or dividers, ever.** Things separate by fill, card shadow and spacing.
4. **One signal colour: ember.** Use it for the *one* thing that matters on a screen (a dot, a chip, the current step). Never decorate with it. `--gain` (green) is only for "done" or "better".
5. **Tokens only.** No hex, rgb or hsl. Use `var(--ink)`, `var(--ink2)`, `var(--quiet)`, `var(--surface)`, `var(--surface2)`, `var(--surface3)`, `var(--canvas)`, `var(--ember)`, `var(--ember-text)`, `var(--ember-tint)`, `var(--gain)`, `var(--gain-tint)`, `var(--on-photo)`, `var(--on-photo2)`, `var(--photo-fill)`, area dots `var(--a-you|home|work|money|health|goal)`. Dark text on a photo button may use `#0D0E10`.
6. **Type scale only**: 11, 13, 14, 15, 16, 20, 21, 24, 30, 32, 34, 44, 46, 56. Prefer the classes; avoid inline `font-size`.
7. **One primary button per screen** (`.btn` without `ghost`). Everything else is `ghost`, a link or a round button.
8. **The top bar never moves** and sits outside the scroll area. Pick it from how the screen opens (see Anatomy).
9. **The orb is one family**: `orb('ring' | 'thinking' | 'working' | 'searching' | 'listening' | 'done', size)`. Ring when idle, thinking while it works, listening while you talk, done on finish.
10. **Health is wellness, not diagnosis. Money is guidance, not advice.** Never claim a live bank, HMRC, NHS or device connection the source doesn't show. Keep the source's "sample" and "estimate" honesty.
11. **Real content.** No lorem ipsum, no "Item 1". Use the screen's real copy and numbers from your source file. UK English. Plain words. No em dashes in copy; use a full stop, comma or colon.
12. **Daylight photography**, people of all backgrounds, never stereotyped poses. Use only the photos listed below.

## Owner update: go picture-forward (this overrides "most screens need no photo")
After seeing the first screens the owner said: take the references' **picture-heavy approach**, in our own colours. So:
- **Wherever something real is on screen, show it as a photograph**: a meal, an area of life, a person, an idea, a document, a mood, a place. Hubs get a photo hero. Lists of real things become photo cards or `thumbRow`s, not icon rows. Icon rows are for settings and abstract things.
- **Photo cards**: `<button class="pcard press" style="${img('food')};height:230px"><span class="topline"><span class="chip onphoto">Lunch · 12:40</span></span><span class="copy"><b>Salmon rice bowl</b><span>705 kcal</span></span></button>`. Two-up: wrap in `<div class="pgrid">` and use heights 150 to 190. On small cards set the `<b>` to `font-size:16px;line-height:21px;letter-spacing:-.22px`. Vary `background-position` so a repeated photo doesn't look repeated.
- **Soft colour on chart cards**: add `tint` plus an area (`you home work money health goal`) to a `.tile` or `.card`: `<button class="tile tint health press">`. Draw that card's chart in the same colour: `bars(values, { color: 'var(--ac)', dim: .35 })`, `line(values, lo, hi, { color: 'var(--ac)', band: 'var(--surface)' })`. A round `<span class="badge">${ic('heart', 's18')}</span>` holds the icon. Use tints on body, fuel and money readings; one or two tinted cards per screen, not every card.
- **Ember is still the one signal.** Tints are quiet backgrounds, not alerts.
- Still no blur, no glass, no serif, no borders. A flat `<div class="panel"></div>` over a `full-photo` is the allowed way to seat text on a photograph's side.
- See `screens/picture.js` for five worked examples (body, food, ideas, areas, welcome).

## The twelve moves (use them; cite them in `from`)
1. **The briefing is the hero**: a 34pt two-tone sentence with icons inside it (`.display`).
2. **One move in front**: the next thing as a card, others resting behind (`.stack` + `.peek`).
3. **Numbers as calm tiles** (`tile()`, `.tiles`).
4. **Dots for counted days** (`dots()`, `days14()`, `month()`); ticks (`ruler()`) for percentages.
5. **A case is a timeline** (`.tl`), with `voice()` notes where someone spoke.
6. **One question, one gesture**: a dark `.drawer` with leave / ask / do.
7. **Moments get a sky**: `full-photo` with `sky`, one sentence, used only for moments (done, cleared, level up).
8. **Photographs do work**: full-bleed, `ptile` tiles, `.hero`.
9. **Your own normal on every chart**: `spark()`, `line()`, `metric()` with the shaded band; `caps()` and `bars()` for pairs and weeks.
10. **Who you're becoming**: the NO–YES `scale()`.
11. **Floating dock and round controls**: `dock()` (root tabs only), `round()`.
12. **Ask one small thing**: `.sheet`, `.wheel`, `pick()`.

The 21 references, for `from`: 1 Identity reflection · 2 Agreement under a sky · 3 Joi Pro · 4 Neuecast · 5 Stoic dots · 6 Oppie · 7 AI summary editing · 8 Pocket · 9 Zero · 10 ALONE · 11 Notes checklist · 12 Health overview tiles · 13 Health at a glance · 14 Kiwifruit · 15 Grocery search · 16 Materials dashboard (capsule pairs) · 17 Villa (two-tone heading, accordions) · 18 Saved emails (stack) · 19 Mike's case (timeline, drawer) · 20 Body metrics (sparklines) · 21 the 7-day-streak video. Write `from: '12, 20'`.

## Anatomy of a screen
The phone's inner screen is **370 × 824**. Content width inside `.scroll` is **330**. A screen is a string of HTML:

```
status()                       // always first (use status('on-photo') over a photograph)
<bar>                          // see below
<div class="scroll"><div class="rise"> … </div></div>
<foot | dock | drawer | sheet> // optional, fixed at the bottom
```

Choose the bar from the catalogue's "opens as":
- **Tab** → `rootBar(label, sub, acts)` and `dock(active)`. Only Today, Plan and You are tabs.
- **Push** → `pushBar(title, rightActs)` (back on the left). Leave the title `''` when a big heading follows.
- **Sheet** → `sheetBar(title)` (handle, title, close). Keep sheets short: one question.
- **Full screen / flow** → `pushBar(title, right, 'close')` or `textBar('Back', '2 of 3')`.
- **State / overlay of a parent** → draw the parent's bar and show the state in the body.
- Over a full photograph: `<header class="bar on-photo">…</header>`.

Lengths that fit: a `.display` sentence up to about 75 characters (5 lines). `.statement` up to about 110. Two `.tiles` per row. Four `.cols` per row. Show 3 to 5 rows of a list, not 12.

## Helpers (all on `window.L26`)
```
ic(name, cls?)                 icon svg. cls: 's18' | 's16' | 's14'
img(name)                      returns a style string: background-image:url(...)
status(cls?)                   status bar
round(icon, {label, dot, cls}) round icon button. cls: 'sm' | 'solid'
rootBar(label, sub, actsHtml)  tab bar header with the orb
pushBar(title, rightHtml, left='back')
textBar(leftHtml, rightHtml)   quiet text buttons (Back / Skip / "2 of 3")
sheetBar(title, rightHtml?)    handle + title + close
dock(active)                   'Today' | 'Plan' | 'You' | 'Talk'
foot(html)                     fixed bottom area
btn(label, {icon, trail, ghost, sm, set})   slab button. trail puts the icon after the label
secHead(title, link?)          section heading inside a scroll
chip(text, tone?)              tone: '' | 'live' (ember) | 'done' (green) | 'q' (quiet)
orb(state, size)               the orb
says(text)                     life speaking: small orb + one ink line
ruler(pct, n=36)               tick ruler for a percentage
row(icon, title, sub, endHtml?)        list row; default end is a chevron
thumbRow(photo, title, sub, end?)      list row with a photo thumbnail
dateRow(day, mon, title, sub, when?)   list row with a date box
tile({label, dot, unit, value, small, sub, wide, plain, extra})   metric tile; dot is an area name
metric({icon, name, value, unit, tag, tone, delta, series, lo, hi})  reading with sparkline and normal band
pick(label, value, set?)       soft select row
check(text, on?)               round checkbox row (toggles on tap)
acc(title, count, bodyHtml, open?)     accordion section (one open at a time)
kv(label, value)               label … value line
voice('0:34')                  voice note pill
toggle(on, label)              switch
slider(pct)                    slider at a percentage
stepper(value, unit?)          round minus, big figure, round plus
seg(options, activeIndex)      segmented control
filters(options, activeIndex)  chip filters
wheel(options, activeIndex)    three-option wheel picker
field(label, value, placeholder?)   text field
avatar(text, large?)           initials circle
bubble(text)                   the person's message; put messages in <div class="chatcol">
days14('11011101101111')       14 small dots
dots(cells, cols)              dot grid; cells are '' | 'on' | 'miss' | 'now'
month(cells)                   7-column month grid; cells '' | 'on'
spark(values, lo, hi)          small sparkline with band
line(values, lo, hi, {h, label})       wide trend with band
bars(values, {labels, now, h, max, label})   tall capsule bars, one picked out
caps([{l, in, out, now}])      in/out capsule pairs
scale([..5 positions 0–100])   NO–YES line; last mark is the newest
esc(text)                      escape text
```

## Classes worth knowing
- Type: `.eyebrow` (13, quiet label; add `<span class="star"></span>` for an ember dot) · `.display` (34, two-tone: wrap the bright words in `<b>`, put `ic()` inside the `<b>`; add `class="nw"` to keep an icon with its word) · `.statement` (24, two-tone) · `.t30` · `.headline` (20) · `.title` (16) · `.body` (15, quiet; `<b>` is ink) · `.callout` (13) · `.micro` (11 caps-style label; `<span class="sig"></span>` is an ember dot) · `.xl` (56 figure, `<small>` for the unit) · `.num` (32 figure) · `.ink` / `.q` colour helpers.
- Layout: `.between` · `.mt8 .mt12 .mt16 .mt20 .mt24 .mt32` · `.gap8 .gap12` · `.rows` · `.tiles` · `.cols` (4 clean columns: `<div><small>Label</small><b>49g</b><span>35%</span></div>`).
- Surfaces: `.card` (`.pad16`) · `.hero` (photo on top, `.below` text) · `.photo` (rounded photograph with `.copy`) · `.ptile` / `.ptiles` / `.hscroll` (photo tiles) · `.full-photo` (`.fade` adds the scrim) · `.sheet` · `.drawer` · `.acc`.
- Controls: `.btn` (`.ghost`, `.sm`) · `.round` · `.chip` · `.filters` (chips that toggle) · `.seg` (segmented control) · `.wheel` · `.pick` · `.check` · `.composer` · `.pager`.
- Data: `.tile` · `.subtiles` · `.meter` · `.ruler` · `.dots` · `.days14` · `.month` · `.metric` · `.scale` · `.bar-track` + `.times` · `.legend`.
- Story: `.stack` + `.peek` · `.tl` + `.tl-item` (`.done`, `.now`, `.later`; inside: `.when`, `<p>`) · `.voice` · `.checkin` / `.checked` · `.datebox` · `.thumb`.
- Interaction (the board handles these for you): `data-set="state"` re-draws the screen with `build(state)`; `data-acc` on an accordion head; buttons inside `.filters`, `.seg`, `.wheel` toggle `aria-pressed`; `.check` toggles.

## Recipes by kind of screen
Pick the recipe that fits the screen's job, then make it specific. **Vary them**: a chapter where every screen is "sentence plus list" has failed.

- **Hub** (a chapter's home: Fuel, Money, Learn, Settings): eyebrow, `.display` sentence that states where things stand, one hero (a tile group, a photo `.hero` or one `.xl` figure), then 3 to 5 rows or `acc()` sections.
- **A reading** (sleep, HRV, load, stress, weight): `.xl` figure with a `chip`, one `.statement` saying what to do about it, a `.card` with `line()` or `bars()` and a one-line caption, `metric()` rows for drivers, then one quiet honesty line. Charts always show the person's own normal.
- **A list or archive** (history, missions, vault, people, saved meals): `.t30` or `.display` heading with the count in it, `.filters`, then `row` / `thumbRow` / `dateRow` inside one or two `.card pad16 rows`. Group by meaning ("Ready", "Waiting"), not alphabet.
- **A question or step** (onboarding, new habit, new aim, a test question): `textBar('Back', '2 of 4')`, the question as a `.display`, then `pick()`, `.wheel`, `.seg` or `check()`; `foot(btn('Next'))`.
- **A permission primer**: a 72px rounded tile with the icon or orb, a `.display` saying what life reads and what it never does, three `row()`s of what you get, `foot(btn('Allow …') + a quiet "Not now" link)`.
- **A moment** (level up, got it, first move, recap, birthday): `full-photo` (sky or a fitting photograph) or lots of air, `orb('done', 72)`, one `.display` (up to 46px for the biggest moments), one action. These are rare; make them feel earned.
- **A sheet**: `sheetBar`, one `.statement` question, one control, one button.
- **Capture** (camera, barcode, label, scan): `full-photo` of the subject, a framing guide drawn with your `addCss` (corner marks, no border boxes), one big round shutter, mode `chip`s, a `.sheet` peeking up with what life sees.
- **A state** (offline, empty, denied, signed out): calm and centred: orb, `.t30`, one `.body` line that says what still works, one button and one link. Never an error-red screen.
- **A conversation** (chat, ask, coach): the person's words in a right-aligned `.card pad16`, life's words as `says()` or `.statement` with no bubble, suggested `chip`s, `.composer` in the foot.
- **A case** (renewal, document, draft): `.tl` timeline or a `.hero`, the one next step as an embedded card with the only primary button.
- **Outside the app** (widgets, watch, lock screen, Siri): a `full-photo` wallpaper (`vantage`, `calmdesk`, `sky`) and the surface drawn with kit tiles; use `addCss` for the watch or widget frame.
- **A lesson step**: big title, a simple drawn picture (inline SVG, ink strokes, ember for the one key part), guess-before-reveal with two `ghost` buttons, progress as a `.seg` or `.bar-track`.

## Photos (`img(name)`)
`desk` Ama at her desk, warm light · `terrace` London terrace houses · `home` front door detail · `work` desk still life with clock · `people` two friends laughing · `keys` keys close-up · `keyshome` hand holding keys at a green front door · `food` salmon rice bowl from above · `sky` open blue sky with a little cloud · `run` woman running on a coast path · `journal` woman writing by a window · `friends` two friends talking at a street table · `bench` man on a park bench with his phone · `birthday` family around a birthday cake · `gotit` woman leaning back, pleased, at her desk · `aimwrite` woman writing at a terrace table · `areahome` couple carrying boxes into a flat · `areawork` man at a creative desk · `aimdesk` open notebook on a desk · `movein` couple with boxes outside a house · `sunday` lunch table in a garden · `freedom` laptop on a terrace by the sea · `calmdesk` window desk, soft light · `vantage` hilltop at sunset (dark) · `calm` sea at dusk (dark). New: `breakfast` yoghurt, berries and oats bowl from above · `wrap` chicken salad wrap on a plate · `snack` sliced apple with peanut butter · `cook` raw ingredients on a counter (salmon, rice, avocado, eggs) · `label` hand holding a food pack showing its label and barcode · `payslip` pay document beside a laptop and tea · `letter` hand holding an opened letter by a front door · `passport` navy passport with a folder and glasses · `bedroom` calm bedroom in morning light · `walk` Ama walking in a park with a coffee · `breathe` woman sitting cross-legged by a sunny window · `siblings` Ama laughing with her brother Kofi on a street.

Use a photograph when it does a job. Most screens need none.

## Icons (`ic(name)`)
home layers person mic search bell chev arrow doc gift heart book spark check gear wallet back up down arrowDown swap close add remove more calendar clock shield info help checkCircle closeCircle circle copy eye eyeOff camera folder images attach briefcase cash calculator chart trend repeat bulb people pulse moon sun water fitness walk watch food trash play pause stop arrowUp grid

## Writing your file
```js
// screens/<your-file>.js
(() => {
  'use strict';
  const K = window.L26;
  const { ic, img, status, pushBar, foot, btn, tile, row, chip, secHead, line } = K;

  // One-off styles only when the kit truly lacks something. Prefix every selector.
  K.addCss('.sl-', `.sl-stage { height: 14px; border-radius: 7px; background: var(--ink); }`);

  K.screen('sleep', {
    from: '20, 12',
    note: 'One figure, what to do tonight, the week against your need, then the night in stages.',
    build: () => `${status()}${pushBar('Sleep', K.round('info', { label: 'How this is worked out' }))}
      <div class="scroll"><div class="rise"> … </div></div>`,
  });
})();
```
- `key` must be the catalogue key. `note` is one plain sentence for the owner. `from` cites references.
- For a screen with two states, read the argument: `build: s => s === 'done' ? … : …` and put `data-set="done"` on the control.
- Write **only your own file**. Do not edit `kit.js`, `v26.css`, `core.js`, `board.js` or anyone else's file. If the kit lacks something, use `addCss` with your prefix and say so in your report.
- Do not open a browser or start a server. Check your work with:
  `node review/v26/tools/check.mjs screens/<your-file>.js --expect key1,key2,…`
  It must end with **0 errors**. Fix warnings unless you can say why not.

## Before you say you're done
Go through each screen and ask: What is the one thing this screen is for, and is it the biggest thing on it? Is there air around it? Is there exactly one primary action? Did I keep the real copy and numbers? Would the owner see the reference in it? If any screen is just "a heading and a list of rows", redesign it.
