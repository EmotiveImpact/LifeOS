// life · V26 — Plan · Body · Fuel. Picture-forward: every meal on screen is its photograph. Written against review/v26/KIT.md.
(() => {
  'use strict';
  const K = window.L26;
  const { ic, img, status, round, pushBar, sheetBar, foot, btn, secHead, chip, orb, says, ruler, row, tile, toggle, slider, stepper, seg, wheel, bubble, dots, month, bars, line } = K;

  // The kit has no camera furniture, day columns, sum or week strip. Everything else below is kit classes.
  K.addCss('.fu-', `
.fu-view { flex: 1; min-height: 0; position: relative; z-index: 2; }
.fu-frame { position: absolute; pointer-events: none; }
.fu-frame svg { position: absolute; width: 34px; height: 34px; fill: none; stroke: var(--on-photo); stroke-width: 4; stroke-linecap: round; }
.fu-frame svg:nth-child(1) { left: 0; top: 0; }
.fu-frame svg:nth-child(2) { right: 0; top: 0; transform: rotate(90deg); }
.fu-frame svg:nth-child(3) { right: 0; bottom: 0; transform: rotate(180deg); }
.fu-frame svg:nth-child(4) { left: 0; bottom: 0; transform: rotate(270deg); }
.fu-frame.fu-ink svg { stroke: #0D0E10; }
.fu-tag { position: absolute; display: inline-flex; align-items: center; gap: 6px; height: 28px; padding: 0 11px 0 9px; border-radius: 999px; background: var(--on-photo); color: #0D0E10; font-size: 13px; font-weight: 600; white-space: nowrap; box-shadow: var(--shadow); }
.fu-tag i { width: 6px; height: 6px; border-radius: 50%; background: #0D0E10; }
.fu-tag em { font-style: normal; font-weight: 500; opacity: .6; }
.fu-tag.fu-ink { background: #0D0E10; color: var(--on-photo); }
.fu-tag.fu-ink i { background: var(--on-photo); }
.fu-modes { display: flex; justify-content: center; gap: 2px; width: fit-content; margin: 0 auto; padding: 4px; border-radius: 999px; background: #0D0E10; }
.fu-modes button { height: 34px; padding: 0 10px; border-radius: 999px; font-size: 13px; font-weight: 600; color: var(--on-photo); }
.fu-modes button[aria-pressed="true"] { background: var(--on-photo); color: #0D0E10; }
.fu-shutter { width: 76px; height: 76px; border-radius: 50%; display: grid; place-items: center; flex: none; box-shadow: inset 0 0 0 4px var(--on-photo); }
.fu-shutter span { display: block; width: 60px; height: 60px; border-radius: 50%; background: var(--on-photo); }
.fu-caret { display: inline-block; width: 2px; height: 28px; margin-left: 3px; background: var(--ember); vertical-align: -4px; }
.fu-day { flex: 0 0 148px; background: var(--surface); border-radius: 20px; box-shadow: var(--shadow); padding: 14px 14px 16px; }
.fu-day small { display: block; margin-top: 12px; font-size: 11px; line-height: 13px; font-weight: 600; color: var(--ink2); }
.fu-day b { display: block; font-size: 14px; line-height: 20px; font-weight: 600; }
.fu-sum { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 6px; align-items: start; }
.fu-sum b { display: block; font-size: 24px; line-height: 31px; letter-spacing: -.53px; font-weight: 600; font-variant-numeric: tabular-nums; }
.fu-sum small { display: block; font-size: 11px; line-height: 14px; font-weight: 600; color: var(--ink2); }
.fu-sum i { font-style: normal; font-size: 24px; line-height: 31px; color: var(--quiet); }
.fu-split { display: flex; gap: 3px; height: 14px; }
.fu-split i { border-radius: 7px; }
.fu-week { display: grid; grid-template-columns: repeat(7, 1fr); gap: 6px; text-align: center; }
.fu-week i { display: grid; place-items: center; aspect-ratio: 1; border-radius: 50%; background: var(--surface2); font-style: normal; font-size: 13px; font-weight: 600; font-variant-numeric: tabular-nums; }
.fu-week i.fu-on { background: var(--ink); color: var(--canvas); }
.fu-week small { display: block; margin-top: 6px; font-size: 11px; font-weight: 600; color: var(--quiet); }
.fu-menu { position: absolute; left: 36px; right: 36px; background: var(--on-photo); color: #0D0E10; border-radius: 6px; padding: 16px 18px 18px; box-shadow: var(--float); transform: rotate(-2deg); }
.fu-menu b { display: block; text-align: center; font-size: 11px; line-height: 13px; letter-spacing: 2px; font-weight: 600; opacity: .6; }
.fu-menu span { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-top: 14px; font-size: 13px; line-height: 18px; font-weight: 600; }
.fu-pin { width: 20px; height: 20px; border-radius: 50%; display: grid; place-items: center; flex: none; font-style: normal; font-size: 11px; font-weight: 600; background: #0D0E10; color: var(--on-photo); }
.fu-pin.fu-best { background: var(--ember); color: #08090A; }
.fu-cal i.fu-off { background: var(--surface3); }
.fu-ahead { opacity: .45; }
.fu-blank { visibility: hidden; }
.fu-today { box-shadow: inset 0 0 0 2px var(--ember); }
`);

  /* ── Shared pieces ───────────────────────────────────── */
  /** Crop a 2:3 photograph so the point (fx, fy) sits at the centre of a box, at `zoom` × the box width. `r` is the box's height ÷ width. */
  const crop = (name, fx, fy, zoom = 1, r = 1) => {
    const z = Math.max(zoom, r / 1.5, 1), hy = 1.5 * z / r, pct = v => Math.round(Math.max(0, Math.min(1, v)) * 100);
    const x = z > 1 ? (z * fx - .5) / (z - 1) : .5, y = hy > 1 ? (hy * fy - .5) / (hy - 1) : .5;
    return `${img(name)};background-size:${Math.round(z * 100)}% auto;background-position:${pct(x)}% ${pct(y)}%`;
  };
  const bowl = (z, r) => crop('food', .46, .475, z, r);
  const yoghurt = (z, r) => crop('breakfast', .44, .59, z, r);
  const apple = (z, r) => crop('snack', .47, .53, z, r);
  const wrap = (z, r) => crop('wrap', .43, .61, z, r);

  const tag = t => `<span class="chip onphoto">${t}</span>`;
  const plus = `<span class="round sm" style="background:var(--on-photo);color:#0D0E10">${ic('add', 's16')}</span>`;
  const SM = ' style="font-size:16px;line-height:21px;letter-spacing:-.22px"';
  /** A photograph card. `sm` sets the smaller title for two-up cards. */
  const pcard = (photo, h, top, title, sub = '', sm = false, attrs = '') => `<button class="pcard press" ${attrs} style="${photo};height:${h}px"><span class="topline">${top}</span><span class="copy"><b${sm ? SM : ''}>${title}</b>${sub ? `<span>${sub}</span>` : ''}</span></button>`;
  const prow = (photo, title, sub, end = '') => `<button class="row press"><span class="thumb" style="${photo}"></span><span class="mid"><b>${title}</b><span>${sub}</span></span>${end || `<span class="chev">${ic('chev', 's16')}</span>`}</button>`;
  const cols3 = cells => `<div class="cols" style="grid-template-columns:repeat(3,1fr)">${cells.map(([l, v, s]) => `<div><small>${l}</small><b>${v}</b>${s ? `<span>${s}</span>` : ''}</div>`).join('')}</div>`;
  const softChip = (html, attrs = '') => `<button class="chip press" ${attrs} style="height:36px;font-size:14px;font-weight:500;padding:0 14px 0 10px;background:var(--surface);box-shadow:var(--shadow)">${html}</button>`;

  // Camera furniture, shared by the capture screens.
  const onRound = (icon, label, solid) => `<button class="round press" style="background:var(--${solid ? 'on-photo' : 'photo-fill'});color:${solid ? '#0D0E10' : 'var(--on-photo)'}" aria-label="${label}">${ic(icon, 's18')}</button>`;
  const camBar = (left, label, right) => `<header class="bar on-photo">${left}<span class="chip onphoto" style="height:28px;font-size:13px;padding:0 12px 0 8px"><span data-orb="searching" data-size="16" style="width:16px;height:16px;display:block;color:#0D0E10"></span>${label}</span>${right}</header>`;
  const modes = active => `<div class="fu-modes" role="group" aria-label="Camera mode">${['Photo', 'Barcode', 'Label', 'Menu', 'Type'].map(m => `<button class="press" aria-pressed="${m === active}">${m}</button>`).join('')}</div>`;
  const frame = (pos, ink) => `<div class="fu-frame ${ink ? 'fu-ink' : ''}" style="${pos}" aria-hidden="true">${'<svg viewBox="0 0 34 34"><path d="M3 31V13A10 10 0 0 1 13 3h18"/></svg>'.repeat(4)}</div>`;
  const topBand = `<div class="panel" style="width:100%;bottom:auto;height:102px"></div>`;

  /* ── 1. Snap a meal ──────────────────────────────────── */
  K.screen('snap', {
    from: '14, 10',
    note: 'The bowl fills the screen. life names what it sees as you hold still; one shutter, five modes, and a sheet that says portions are estimates.',
    build: () => `<div class="full-photo fade" style="${crop('food', .47, .47, 1.5, 824 / 370)}"></div>
    ${status('on-photo')}${camBar(onRound('close', 'Close', true), 'Hold steady', onRound('sun', 'Light'))}
    <div class="fu-view">${frame('left:14px;right:14px;top:8px;bottom:8px')}
      <span class="fu-tag" style="left:140px;top:167px"><i></i>Egg <em>~50g</em></span>
      <span class="fu-tag" style="left:150px;top:290px"><i></i>Salmon <em>~120g</em></span>
      <span class="fu-tag" style="left:208px;top:396px"><i></i>Rice <em>~150g</em></span>
      <span class="fu-tag" style="left:64px;top:372px"><i></i>Avocado <em>~50g</em></span>
    </div>
    <div class="on-photo" style="flex:none;position:relative;z-index:2;padding:0 20px 18px">${modes('Photo')}
      <div style="display:flex;align-items:center;justify-content:center;gap:36px;margin-top:16px">${onRound('images', 'Choose a photo')}<button class="fu-shutter press" aria-label="Take photo"><span></span></button>${onRound('mic', 'Say it instead')}</div></div>
    <div class="sheet"><div class="handle"></div>
      <div class="body" style="display:flex;gap:10px;margin-top:16px">${orb('searching', 20)}<span class="ink">life sees 4 things so far: egg, salmon, avocado and rice.</span></div>
      <p class="callout mt8">Portions are estimates. You can adjust them next.</p></div>`,
  });

  /* ── 2. Confirm the meal: the honesty step ───────────── */
  K.screen('confirm', {
    from: '14, 21',
    note: 'Nothing is logged yet. Each item is shown as its own piece of your photo with grams you can change; the total follows.',
    build: () => {
      const item = (fx, fy, z, name, grams, kcal, open) => `<div class="row"><span class="thumb" style="${crop('food', fx, fy, z)}"></span><span class="mid"><b>${name}</b><span>${kcal} kcal</span></span><button class="chip press" style="height:32px;font-size:13px;padding:0 10px 0 12px${open ? ';background:var(--ink);color:var(--canvas)' : ''}">${grams}g ${ic('more', 's14')}</button></div>${open ? `<div style="padding:0 2px 10px 60px">${slider(33)}<div class="times" style="margin-top:0"><span>75g</span><span>300g</span></div></div>` : ''}`;
      return `<div class="full-photo fade" style="${crop('food', .5, .4, 1.3, 170 / 370)};bottom:auto;height:170px"></div>
      ${status('on-photo')}
      <div style="height:76px;flex:none"></div>
      <div class="sheet" style="flex:1;min-height:0;display:flex;flex-direction:column">
        <div class="handle"></div>
        <div class="between" style="height:52px;flex:none"><span style="width:40px"></span><b class="title">Lunch · 12:40</b>${round('close', { label: 'Close' })}</div>
        <div class="between" style="align-items:flex-end"><div><span class="eyebrow">This meal</span><div class="xl" style="margin-top:4px">642<small>kcal</small></div></div><div style="text-align:right;margin-bottom:6px"><span class="callout">Protein</span><div class="headline">43g</div></div></div>
        <p class="callout mt8">${chip('Estimate', 'q')} Adjust anything that looks off.</p>
        <div class="rows mt8" style="flex:1;min-height:0;overflow:hidden">
          ${item(.565, .52, 2.6, 'Salmon', 120, 247)}${item(.7, .635, 4.2, 'Rice', 150, 195, true)}${item(.295, .6, 3.6, 'Avocado', 50, 80)}${item(.17, .47, 4.2, 'Edamame', 40, 48)}${item(.435, .387, 4, 'Egg', 50, 72)}
        </div>
        <button class="btn press" style="flex:none">Log meal</button>
        <p class="callout" style="text-align:center;margin-top:10px">Nothing is logged until you say so.</p>
      </div>`;
    },
  });

  /* ── 3. Fuel: the hub, in numbers or in words ────────── */
  K.screen('fuel', {
    from: '3, 14, 12, 17',
    note: 'The hub. One sentence, the latest meal as the picture with today’s targets under it, then doors to the rest. Tap “Hide numbers” to read the day in words.',
    build: s => {
      const w = s === 'words', word = ' style="font-size:14px;line-height:20px;letter-spacing:-.1px;margin-top:4px"';
      const col = (label, value, of, said) => `<div><small>${label}</small>${w ? `<b${word}>${said}</b>` : `<b>${value}</b><span>${of}</span>`}</div>`;
      return `${status()}${pushBar('', `<button class="chip press" data-set="${w ? '' : 'words'}" style="height:32px;padding:0 12px">${ic(w ? 'eye' : 'eyeOff', 's14')}${w ? 'Show numbers' : 'Hide numbers'}</button>`)}
      <div class="scroll"><div class="rise">
        <span class="eyebrow">Fuel · today</span>
        <p class="display">${w ? `About <b>a third</b> of today’s energy is still to come. <b>Protein</b> is nearly there.` : `<b>880 kcal</b> left today. <b>Protein</b> is nearly there.`}</p>
        <div class="hero mt24">
          <span class="photo" style="${crop('food', .5, .42, 1.3, 190 / 330)}"><span class="copy"><small>Lunch · 12:40</small><b>Salmon rice bowl</b><span>${w ? 'The biggest meal so far' : '705 kcal · 49g protein'}</span></span></span>
          <div class="below"><div class="between"><span class="headline">${w ? 'About two thirds of today' : `1,420 <span class="q" style="font-weight:500">of 2,300 kcal</span>`}</span>${w ? '' : `<span class="title">62%</span>`}</div>
            ${ruler(62)}
            <div class="cols" style="grid-template-columns:repeat(3,1fr);margin-top:14px">${col('Protein', '82g', 'of 100g', 'Nearly there')}${col('Fibre', '18g', 'of 30g', 'Over halfway')}${col('Water', '1.2 L', 'of 2.5 L', 'Under half')}</div></div>
        </div>
        ${secHead('Also today', `${ic('add', 's16')}Snap a meal`)}
        <div class="pgrid">
          <button class="tile tint home press" style="min-height:170px"><span class="th"><span class="badge">${ic('mic', 's18')}</span><em>08:10 · said</em></span><span style="margin-top:auto"><b class="title" style="display:block">Oats, banana, milk</b><span class="sub" style="display:block">${w ? 'A steady start' : '410 kcal · 16g protein'}</span></span></button>
          ${pcard(yoghurt(1.4, 170 / 160), 170, tag('16:00'), 'Greek yoghurt, berries', w ? 'A light snack' : '305 kcal · 17g protein', true)}
        </div>
        <div class="card pad16 rows mt12">
          ${prow(crop('cook', .5, .5, 1.15), 'What can I cook?', 'From what’s in your kitchen')}
          ${prow(crop('sunday', .5, .83, 1.6), 'This week’s meals', 'Seven days and a shopping list')}
          ${prow(wrap(1.6), 'Saved meals', 'Log one again in a tap')}
          ${row('trend', 'Progress', 'Food and weight, over time')}
        </div>
        <p class="callout mt16">Targets come from your details and activity. Calorie features are for adults only.</p>
      </div></div>`;
    },
  });

  /* ── 4. What can I cook? ─────────────────────────────── */
  K.screen('cook', {
    from: '14, 18, 15',
    note: 'Your photo beside what life found in it, your diet as chips, then the recipe that fits today best in front and the next one under it.',
    build: () => `${status()}${pushBar('What can I cook?', round('camera', { label: 'Snap the fridge or cupboard again' }))}
    <div class="scroll"><div class="rise">
      <div class="pgrid">
        <div class="pcard" style="${crop('cook', .66, .416, 3.3, 200 / 160)};height:200px"><span class="topline">${tag('Your photo')}</span><span class="copy"><b${SM}>6 things found</b><span>Or just say what’s in.</span></span></div>
        <div class="tile tint home" style="min-height:200px"><span class="th"><span>Found in your photo</span></span><span style="display:block;margin-top:8px">${['Chicken thighs', 'Chickpeas', 'Spinach', 'Eggs', 'Rice', 'Black beans'].map(f => `<b style="display:block;font-size:14px;line-height:23px;font-weight:600">${f}</b>`).join('')}</span></div>
      </div>
      <div class="hscroll mt16"><div class="filters" role="group" style="flex:none">${['Halal', 'Vegetarian', 'Vegan', 'High-protein', 'Dairy-free', 'Keto'].map((f, k) => `<button aria-pressed="${k === 0}">${f}</button>`).join('')}</div></div>
      <p class="statement mt20">Fits what’s left today: <b>680 kcal</b> and <b>18g protein</b>.</p>
      <div class="card next mt16">
        <div class="between" style="margin-top:0"><span class="micro"><span class="sig"></span>Best fit · 1 of 2</span>${chip('Halal')}</div>
        <div class="headline">Chicken, chickpea and spinach stew</div>
        <p class="body">25 min · <b>610 kcal</b> · <b>46g protein</b></p>
        <button class="btn press">See the recipe ${ic('arrow', 's18')}</button>
      </div>
      <button class="card pad16 press mt12" style="display:flex;align-items:center;gap:12px"><span style="flex:1;min-width:0"><span class="title" style="display:block">Egg and black bean breakfast wrap</span><span class="callout">10 min · 480 kcal · 29g protein</span></span>${chip('Halal')}<span class="chev">${ic('chev', 's16')}</span></button>
    </div></div>`,
  });

  /* ── 5. A week of meals ──────────────────────────────── */
  K.screen('mealplan', {
    from: '14, 17, 11',
    note: 'Tonight’s meal is the picture. The week sits underneath as day columns you swipe through, with the cost said plainly.',
    build: () => {
      const day = (d, when, meals) => `<div class="fu-day"><div class="between"><span class="title">${d}</span><span class="callout">${when}</span></div>${['Breakfast', 'Lunch', 'Dinner'].map((m, k) => `<small>${m}</small><b>${meals[k]}</b>`).join('')}</div>`;
      return `${status()}${pushBar('This week’s meals', round('more', { label: 'Preferences and budget' }))}
      <div class="scroll"><div class="rise">
        ${seg(['Plan', 'Shopping list'], 0)}
        <p class="statement mt20">About <b>£38</b> for the week. Fits <b>2,100 kcal</b> and <b>100g protein</b>.</p>
        <div class="mt16">${pcard(crop('food', .58, .56, 1.5, 190 / 330), 190, `${tag('Tonight · Monday dinner')}${tag('Halal')}`, 'Salmon bowl', 'One tap logs it when you eat it.')}</div>
        ${secHead('The week', 'Mon to Sun')}
        <div class="hscroll" style="padding-bottom:18px">
          ${day('Mon', 'Today', ['Overnight oats', 'Chicken stew', 'Salmon bowl'])}${day('Tue', '17 Nov', ['Egg wrap', 'Leftover stew', 'Chickpea curry'])}${day('Wed', '18 Nov', ['Greek yoghurt', 'Tuna salad', 'Turkey chilli'])}${day('Thu', '19 Nov', ['Overnight oats', 'Leftover chilli', 'Stir-fry'])}
        </div>
      </div></div>`;
    },
  });

  /* ── 6. Say what you ate ─────────────────────────────── */
  K.screen('sayit', {
    from: '19, 7, 12',
    note: 'The orb listens and your words are the screen. What life heard becomes two cards you can edit before anything is logged.',
    build: () => `${status()}${sheetBar('Say what you ate')}
    <div class="scroll"><div class="rise">
      <div style="display:grid;place-items:center;padding-top:4px">${orb('listening', 72)}</div>
      <p class="callout" style="text-align:center;margin-top:4px">Listening…</p>
      <p class="display" style="margin-top:16px">I had a <b>chicken wrap</b> and a <b>large oat latte</b> around 1.</p>
      <div class="pgrid mt24">
        ${pcard(wrap(1.5, 150 / 160), 150, tag('Chicken wrap'), '520 kcal', '1 wrap · 32g protein')}
        <button class="tile tint home press" style="min-height:150px"><span class="th"><span>Oat latte, large</span></span><span style="margin-top:auto"><span class="num" style="display:block">180<small>kcal</small></span><span class="sub" style="display:block">1 cup · 4g protein</span></span></button>
      </div>
      <p class="callout mt12" style="text-align:center">Tap either one to edit it.</p>
      <div class="body mt12" style="display:flex;gap:10px"><span class="ink" style="display:grid;flex:none;margin-top:2px">${ic('shield', 's18')}</span><span class="callout">Your voice is turned into text on your phone. Nothing is recorded or sent.</span></div>
    </div></div>
    ${foot(btn('Log 700 kcal') + btn('Say it again', { ghost: true, icon: 'mic' }))}`,
  });

  /* ── 7. A day of food, as a diary ────────────────────── */
  K.screen('foodday', {
    from: '19, 14',
    note: 'The day as a diary: each meal is its photograph on a timeline with its kcal, and dinner is the one open step.',
    build: () => {
      const meal = (when, photo, h, name, kcal) => `<div class="tl-item done"><div class="when">${when}</div>${pcard(photo, h, `<span></span>${tag(kcal + ' kcal')}`, name, '', true)}</div>`;
      return `${status()}${pushBar('Today’s food', round('calendar', { label: 'Another day' }))}
      <div class="scroll"><div class="rise">
        <div class="card pad16 tint home">${cols3([['Energy', '1,640', 'of 2,300 kcal'], ['Protein', '112g', 'of 140g'], ['Fibre', '21g', 'of 30g']])}</div>
        <div class="tl mt24">
          ${meal('BREAKFAST · 08:10', yoghurt(1.05, 116 / 304), 116, 'Greek yoghurt, berries, oats', '420')}
          ${meal('LUNCH · 12:40', bowl(1.1, 150 / 304), 150, 'Salmon rice bowl', '705')}
          ${meal('SNACK · 16:00', apple(1.05, 116 / 304), 116, 'Apple and peanut butter', '285')}
          <div class="tl-item now"><div class="when">DINNER</div><p>Not logged yet.</p>
            <div class="card pad16 mt12">${says('Snap it, say it or pick a saved meal when you eat.')}<button class="btn press mt16">${ic('camera', 's18')}Add dinner</button></div></div>
        </div>
        <p class="callout mt20">Tap a meal to change a portion or swap an item.</p>
      </div></div>`;
    },
  });

  /* ── 8. Scan a barcode ───────────────────────────────── */
  K.screen('barcode', {
    from: '14, 21',
    note: 'Point at the pack. The marks close on the barcode, the exact label loads, you choose the portion and it’s logged.',
    build: () => `<div class="full-photo" style="${crop('label', .513, .95, 1.5, 620 / 370)};bottom:auto;height:620px"></div>${topBand}
    ${status('on-photo')}${camBar(onRound('close', 'Close', true), 'Point at the barcode', onRound('sun', 'Light'))}
    <div class="fu-view">${frame('left:168px;top:249px;width:140px;height:96px', true)}
      <span class="fu-tag fu-ink" style="left:196px;top:211px">${ic('check', 's14')}Found</span>
      <div style="position:absolute;left:20px;right:20px;bottom:18px">${modes('Barcode')}</div></div>
    <div class="sheet"><div class="handle"></div>
      <div class="row mt8"><span class="thumb" style="${crop('label', .51, .6, 2.2)}"></span><span class="mid"><b>Oat milk, 1 L</b><span>250 ml · 120 kcal · 1g protein</span></span></div>
      <button class="pick press" style="background:var(--surface2);box-shadow:none;margin-top:4px">Portion<span class="set">250 ml ${ic('more', 's16')}</span></button>
      <button class="btn press mt12">Log 120 kcal</button>
      <p class="callout mt12">The label comes from Open Food Facts. Foods you’ve scanned before work offline.</p></div>`,
  });

  /* ── 9. Search for a food ────────────────────────────── */
  K.screen('foodsearch', {
    from: '15, 14',
    note: 'Search opens on your own meals as photographs and the foods you often have. Tap “banana” to see results, recent first.',
    build: s => {
      const typed = s === 'banana';
      const pt = (photo, label) => `<button class="ptile press" style="${photo}"><b>${label}</b></button>`;
      const hit = (name, sub) => `<div class="row"><span class="mid"><b>${name}</b><span>${sub}</span></span><button class="round sm press" aria-label="Add ${name}">${ic('add', 's16')}</button></div>`;
      const head = `${status()}${pushBar('Find food', round('camera', { label: 'Scan instead' }))}`;
      if (typed) return `${head}<div class="scroll"><div class="rise">
        <div class="between" style="height:48px"><span class="t30" style="display:flex;align-items:center;gap:10px;font-weight:500">${ic('search')}<span>banana<span class="fu-caret"></span></span></span><button class="round sm solid press" data-set="" aria-label="Clear">${ic('close', 's16')}</button></div>
        <div class="micro mt20">RECENT</div>
        <div class="card pad16 rows mt12">${hit('Banana, medium', '89 kcal · 1.1g protein')}</div>
        <div class="micro mt24">EVERYTHING</div>
        <div class="card pad16 rows mt12">${hit('Banana bread, slice', '326 kcal')}${hit('Banana, dried', '346 kcal per 100g')}${hit('Banana smoothie', 'Pret · 240 kcal')}</div>
        <p class="callout mt16">From UK CoFID and Open Food Facts. Your recent and favourite foods come first.</p>
      </div></div>`;
      return `${head}<div class="scroll"><div class="rise">
        <button class="t30 q press" data-set="banana" style="display:flex;align-items:center;gap:10px;font-weight:500;height:48px;width:100%"><span class="ink" style="display:grid">${ic('search')}</span>Search foods</button>
        <div class="micro mt20">YOUR MEALS</div>
        <div class="hscroll mt12">${pt(yoghurt(1.9, 150 / 112), 'Usual breakfast')}${pt(bowl(1.6, 150 / 112), 'Salmon rice bowl')}${pt(wrap(2, 150 / 112), 'Chicken wrap')}${pt(apple(1.7, 150 / 112), 'Apple and peanut butter')}</div>
        <div class="micro mt32">YOU OFTEN HAVE</div>
        <div class="mt12" style="display:flex;flex-wrap:wrap;gap:8px">${softChip(`${ic('search', 's16')}banana`, 'data-set="banana"')}${['oat flat white', 'protein bar', 'Greek yoghurt', 'protein shake', 'oat latte'].map(t => softChip(`${ic('add', 's16')}${t}`)).join('')}</div>
        <div class="micro mt32">RECENT</div>
        <div class="card pad16 rows mt12">${hit('Banana, medium', '89 kcal · 1.1g protein')}</div>
      </div></div>`;
    },
  });

  /* ── 10. Fuel, at a glance ───────────────────────────── */
  K.screen('fuelhome', {
    from: '14, 12, 13',
    note: 'What’s left today as one figure, the day’s meals as photographs, macros as three calm tiles, and one button to snap the next meal.',
    build: () => {
      const macro = (label, value, of, pct) => `<div class="tile" style="min-height:0;padding:12px 12px 14px"><span class="th"><span>${label}</span></span><span class="headline" style="margin-top:8px">${value}</span><span class="sub">of ${of}</span><span class="meter"><i style="width:${pct}%"></i></span></div>`;
      return `${status()}${pushBar('', round('calendar', { label: 'Today’s food' }) + round('add', { label: 'Quick log' }))}
      <div class="scroll"><div class="rise">
        <span class="eyebrow">Fuel · Monday</span>
        <div class="xl" style="margin-top:6px">1,240<small>kcal left today</small></div>
        <div class="mt16">${cols3([['Eaten', '1,060'], ['Burned', '+300'], ['Water', '1.4 L']])}</div>
        <div class="mt20">${pcard(bowl(1.05, 200 / 330), 200, tag('Lunch · 12:40'), 'Salmon rice bowl', '640 kcal')}</div>
        <div class="pgrid mt12">
          ${pcard(yoghurt(1.4, 1), 160, tag('Breakfast · 08:10'), 'Yoghurt, berries, oats', '420 kcal', true)}
          <button class="tile tint home press" style="min-height:160px"><span class="th"><span class="badge">${ic('add', 's18')}</span></span><span style="margin-top:auto"><b class="title" style="display:block">Add a meal</b><span class="sub" style="display:block">Snap, scan, say or search</span></span></button>
        </div>
        <div class="tiles mt12" style="grid-template-columns:repeat(3,1fr);gap:8px">${macro('Protein', '112g', '140g', 80)}${macro('Carbs', '150g', '260g', 58)}${macro('Fat', '48g', '75g', 64)}</div>
      </div></div>
      <div class="foot"><div style="display:flex;gap:8px"><button class="btn ghost press" style="width:auto;padding:0 18px">${ic('grid', 's18')}Scan</button><button class="btn press">${ic('camera', 's18')}Snap a meal</button></div></div>`;
    },
  });

  /* ── 11. Your food targets ───────────────────────────── */
  K.screen('fuelgoal', {
    from: '21, 6, 12',
    note: 'Goal, weight and pace as three small choices, then the maths as one sum, so the target never feels like magic.',
    build: () => `${status()}${pushBar('Targets')}
    <div class="scroll"><div class="rise">
      ${seg(['Lose', 'Keep', 'Gain'], 0)}
      <div class="eyebrow mt24" style="justify-content:center">Target weight</div>
      <div class="mt8">${stepper('70', 'kg')}</div>
      <div class="eyebrow mt24" style="justify-content:center">Pace</div>
      <div class="mt8">${wheel(['Gentle', 'Steady · 0.5 kg a week', 'Faster'], 1)}</div>
      <p class="callout mt12" style="text-align:center">About 9 weeks, so mid-January.</p>
      <div class="card tint home mt24"><div class="micro">THE MATHS</div>
        <div class="fu-sum mt12"><span><b>2,800</b><small>what your body uses</small></span><i>−</i><span><b>500</b><small>for your pace</small></span><i>=</i><span><b>2,300</b><small>daily calories</small></span></div>
        <p class="callout mt16">Your body uses about 2,800 a day, from your height, weight, age and activity. 500 less loses about half a kilo a week.</p></div>
      <div class="tiles mt12">${tile({ label: 'Protein', unit: '1.9 g per kg', value: '140', small: 'g', plain: true })}${tile({ label: 'Fibre', unit: 'a day', value: '30', small: 'g', plain: true })}</div>
      <p class="callout mt16">Targets never go below a healthy floor, and pace is capped.</p>
    </div></div>`,
  });

  /* ── 12. Saved meals ─────────────────────────────────── */
  K.screen('savedmeals', {
    from: '14, 15',
    note: 'Four meals, each one its photograph with the kcal on it and a plus to log it again. The one without a photo is a plain row.',
    build: () => `${status()}${pushBar('', round('add', { label: 'Save a meal' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Saved meals</span>
      <p class="display"><b>Four meals</b> you have often. One tap logs them again.</p>
      <div class="mt20">${pcard(yoghurt(1, 190 / 330), 190, `${tag('420 kcal')}${plus}`, 'Usual breakfast', 'Yoghurt, berries, oats')}</div>
      <div class="pgrid mt12">
        ${pcard(bowl(1.25, 170 / 160), 170, `${tag('705 kcal')}${plus}`, 'Salmon rice bowl', 'From Itsu', true)}
        ${pcard(wrap(1.55, 170 / 160), 170, `${tag('560 kcal')}${plus}`, 'Chicken wrap', 'Homemade', true)}
      </div>
      <button class="card pad16 press mt12" style="display:flex;align-items:center;gap:12px"><span class="badge" style="background:var(--surface2)">${ic('water', 's18')}</span><span style="flex:1"><span class="title" style="display:block">Protein shake</span><span class="callout">Whey + oat milk · 240 kcal</span></span><span class="round sm">${ic('add', 's16')}</span></button>
    </div></div>`,
  });

  /* ── 13. Food and weight, over time ──────────────────── */
  K.screen('fuelprogress', {
    from: '20, 5, 12',
    note: 'One figure for the change, your trend drawn against a safe pace, then November as days: close to target or not, and never red.',
    build: () => {
      const cells = [...Array(6).fill('fu-blank'), ...'110111101111011'.split('').map(b => b === '1' ? 'on' : 'fu-off'), 'fu-today', ...Array(14).fill('fu-ahead')];
      return `${status()}${pushBar('Progress', round('arrowUp', { label: 'Share' }))}
      <div class="scroll"><div class="rise">
        <div class="eyebrow-row"><span class="eyebrow">Down since October</span>${chip('On track · 14 Jan', 'done')}</div>
        <div class="xl" style="margin-top:6px">2.4<small>kg</small></div>
        <p class="statement mt12">You’ve averaged <b>2,240 kcal</b> a day, and your trend has followed.</p>
        <div class="card tint health mt20"><div class="between"><span class="title">Weight trend</span><span class="callout">74.0 kg now</span></div>
          <div class="mt12">${line([76.4, 76, 75.7, 75.2, 74.9, 74.5, 74], 71.9, 74.9, { h: 120, color: 'var(--ac)', band: 'var(--surface)', label: 'Weight trend since October, inside the range a safe pace would give' })}</div>
          <div class="times"><span>Early Oct</span><span>Today</span></div>
          <p class="callout mt8">The pale band is where a safe pace, a quarter to three quarters of a kilo a week, would have you by now.</p></div>
        <div class="tiles mt12">${tile({ label: 'Average', unit: '/2,300', value: '2,240', small: 'kcal', sub: 'eaten a day', plain: true })}${tile({ label: 'This week', unit: 'trend', value: '−0.5', small: 'kg', sub: 'a bit faster than planned', plain: true })}</div>
        <div class="card mt12"><div class="between"><span class="title">November</span><span class="legend"><span><i style="background:var(--ink)"></i>Close</span><span><i style="background:var(--surface3)"></i>Further off</span></span></div>
          <div class="fu-cal mt16">${month(cells)}</div>
          <p class="callout mt16">How close each day was to your target. No day is marked as bad. Today is ringed.</p></div>
      </div></div>`;
    },
  });

  /* ── 14. Exercise, added back ────────────────────────── */
  K.screen('exerciseadd', {
    from: '14, 16, 12',
    note: 'How much of a workout comes back to today, shown plainly: what the watch says and what life adds. Tap None, Half or All.',
    build: s => {
      const k = s === 'none' ? 0 : s === 'all' ? 2 : 1, f = [0, .5, 1][k], back = n => '+' + Math.round(n * f);
      const why = ['Workouts won’t change today’s calories. Your target stays as it is.', 'Watches often overestimate, so <b>half</b> is the safer default.', 'Everything your watch counts comes back. Watches often <b>overestimate</b>.'][k];
      return `${status()}${pushBar('Exercise calories')}
      <div class="scroll"><div class="rise">
        <span class="eyebrow">Added back to today</span>
        <div class="between" style="align-items:flex-end;margin-top:6px"><div class="xl">${back(600)}<small>kcal</small></div><span class="callout" style="margin-bottom:8px">Your watch says 600</span></div>
        <p class="statement mt12">${why}</p>
        <div class="seg mt20" role="group">${['None', 'Half', 'All'].map((o, n) => `<button data-set="${['none', '', 'all'][n]}" aria-pressed="${n === k}">${o}</button>`).join('')}</div>
        <div class="pgrid mt16">
          ${pcard(crop('run', .36, .62, 1.6, 180 / 160), 180, tag('Run · 35 min'), `${back(410)} kcal`, 'Watch says 410 kcal')}
          ${pcard(crop('walk', .56, .5, 1.3, 180 / 160), 180, tag('Walk · 40 min'), `${back(190)} kcal`, 'Watch says 190 kcal')}
        </div>
        <p class="callout mt16">Shown plainly, so the counter never feels like magic. You can change this any time.</p>
      </div></div>`;
    },
  });

  /* ── 15. Your plan is ready: a moment ────────────────── */
  K.screen('fuelplan', {
    from: '2, 5, 21',
    note: 'A moment under open sky. One sentence, the nine weeks ahead as dots with the goal picked out, three targets and one button.',
    build: () => {
      const path = `<svg viewBox="0 0 330 76" style="display:block;width:100%;height:auto" role="img" aria-label="Nine weeks from today to 70 kg, around 14 January">${Array.from({ length: 10 }, (_, k) => { const x = 8 + k * 314 / 9, y = 26 + k * 3.2; return k === 9 ? `<circle cx="${x}" cy="${y}" r="7" fill="var(--ember)"/>` : `<circle cx="${x}" cy="${y}" r="${k ? 4 : 6}" fill="var(--on-photo)" opacity="${k ? .55 : 1}"/>`; }).join('')}<text x="2" y="70" font-size="11" font-weight="600" fill="var(--on-photo)">Today</text><text x="328" y="14" text-anchor="end" font-size="11" font-weight="600" fill="var(--on-photo)">14 Jan · 70 kg</text><text x="328" y="70" text-anchor="end" font-size="11" font-weight="600" fill="var(--on-photo2)">one dot a week</text></svg>`;
      const f = (label, value) => `<div class="field"><small>${label}</small><b>${value}</b></div>`;
      return `<div class="full-photo" style="${img('sky')};background-size:auto 200%;background-position:30% 0"></div>
      ${status('on-photo')}
      <header class="bar on-photo"><span></span>${onRound('close', 'Close')}</header>
      <div class="scroll on-photo" style="position:relative;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:12px">
        <span data-orb="done" data-size="56" style="width:56px;height:56px;display:block;flex:none;color:var(--on-photo)"></span>
        <p class="display" style="font-size:46px;line-height:48px;letter-spacing:-2.07px;font-weight:600;margin-top:20px"><b>Your plan is ready.</b></p>
        <p class="statement" style="margin-top:12px">At half a kilo a week you’d reach <b>70 kg</b> around <b>14 January</b>.</p>
        <div class="mt24">${path}</div>
        <div class="gapdots"></div>
        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px">${f('Calories', '2,300')}${f('Protein', '140 g')}${f('Fibre', '30 g')}</div>
        <span class="callout" style="color:var(--on-photo2);display:block;margin-top:16px">You can change your goal or pace any time. Targets never go below a healthy floor.</span>
      </div>
      <div class="foot" style="background:none;flex-direction:row;position:relative;z-index:2"><button class="btn press" style="background:var(--photo-fill);color:var(--on-photo);width:auto;padding:0 22px">Adjust</button><button class="btn press" style="background:var(--on-photo);color:#0D0E10">Start</button></div>`;
    },
  });

  /* ── 16. Log your weight ─────────────────────────────── */
  K.screen('weighin', {
    from: '20, 21',
    note: 'The trend leads, not the daily number. Fourteen weigh-ins against your own band, then this morning’s figure and one button.',
    build: () => `${status()}${sheetBar('Weight')}
    <div class="scroll"><div class="rise">
      <div class="eyebrow-row"><span class="eyebrow">Your trend</span>${chip('On track · 14 Jan', 'done')}</div>
      <div class="xl" style="margin-top:6px">74.0<small>kg</small></div>
      <p class="body mt8">Down <b>0.5</b> this week. A bit faster than planned, which is fine.</p>
      <div class="card tint health mt16">${line([74.9, 74.6, 75, 74.5, 74.7, 74.3, 74.6, 74.2, 74.4, 74, 74.3, 73.9, 74.1, 73.8], 73.7, 74.3, { h: 112, color: 'var(--ac)', band: 'var(--surface)', label: 'Daily weigh-ins over 14 days against your trend' })}
        <div class="times"><span>2 weeks ago</span><span>This morning</span></div>
        <p class="callout mt8">Daily numbers move about. The pale band is your trend, give or take a normal day.</p></div>
      <div class="card pad16 mt12"><div class="between">${round('remove', { label: 'Lower' })}<span style="text-align:center"><span class="micro" style="justify-content:center">THIS MORNING</span><span class="num" style="display:block;margin-top:4px">73.8<small style="font-size:13px;font-weight:500;letter-spacing:0;color:var(--ink2);margin-left:3px">kg</small></span></span>${round('add', { label: 'Higher' })}</div></div>
    </div></div>
    ${foot(btn('Log it'))}`,
  });

  /* ── 17. Scan a nutrition label ──────────────────────── */
  K.screen('labelscan', {
    from: '14, 21',
    note: 'The marks hold the label, life reads the per-100g values off it, and the sheet asks one thing: how much did you have?',
    build: () => `<div class="full-photo" style="${crop('label', .554, .617, 1.75, 660 / 370)};bottom:auto;height:660px"></div>${topBand}
    ${status('on-photo')}${camBar(onRound('close', 'Close', true), 'Reading the label…', onRound('sun', 'Light'))}
    <div class="fu-view">${frame('left:68px;top:6px;width:232px;height:388px')}
      <span class="fu-tag fu-ink" style="left:96px;top:70px"><i></i>Energy <em>412 kcal</em></span>
      <span class="fu-tag fu-ink" style="left:96px;top:156px"><i></i>Carbohydrate <em>52 g</em></span>
      <span class="fu-tag fu-ink" style="left:96px;top:242px"><i></i>Protein <em>11 g</em></span>
    </div>
    <div class="sheet"><div class="handle"></div>
      <div class="between" style="align-items:flex-end;margin-top:14px"><div><span class="eyebrow">Granola, 45 g</span><div class="xl" style="margin-top:4px">185<small>kcal</small></div></div><span class="callout" style="margin-bottom:8px">412 kcal per 100 g</span></div>
      <div class="mt12">${seg(['30 g', '45 g', '60 g', 'Other'], 1)}</div>
      <button class="btn press mt12">Log 185 kcal</button>
      <p class="callout" style="margin-top:10px">Read on your phone, per 100 g: fat 16 g (saturates 3.1 g), carbohydrate 52 g (sugars 21 g), protein 11 g, salt 0.4 g.</p></div>`,
  });

  /* ── 18. What should I order? ────────────────────────── */
  K.screen('menuscan', {
    from: '14, 18, 21',
    note: 'Your photo of the menu, numbered by how well each dish fits what’s left today. The answer is the sentence; the rest are estimates, clearly marked.',
    build: () => {
      const dish = (n, name, best) => `<span>${name}<i class="fu-pin ${best ? 'fu-best' : ''}">${n}</i></span>`;
      const other = (n, name, sub, verdict) => `<div class="row"><i class="fu-pin" style="background:var(--surface2);color:var(--ink)">${n}</i><span class="mid"><b>${name}</b><span>${sub}</span></span>${chip(verdict, 'q')}</div>`;
      return `<div class="full-photo fade" style="${img('breakfast')};background-size:210% auto;background-position:100% 0;bottom:auto;height:440px"></div>
      ${status('on-photo')}
      <header class="bar on-photo">${onRound('back', 'Back', true)}${tag('3 dishes read from the menu')}${onRound('camera', 'Snap it again', true)}</header>
      <div style="height:280px;flex:none;position:relative;z-index:2">${frame('left:22px;right:22px;top:26px;bottom:30px')}
        <div class="fu-menu" style="top:62px"><b>MAINS</b>${dish(1, 'Grilled chicken, rice and greens', true)}${dish(2, 'Halloumi wrap')}${dish(3, 'Beef burger and fries')}</div></div>
      <div class="sheet" style="flex:1;min-height:0;display:flex;flex-direction:column;padding-top:20px">
        <span class="eyebrow">You have about 1,240 kcal and 28 g protein left today.</span>
        <p class="statement mt8">Order the <b>grilled chicken, rice and greens</b>.</p>
        <div class="mt12" style="display:flex;gap:8px">${chip('Best fit', 'live')}${chip('~620 kcal · 48 g protein')}</div>
        <div class="rows mt8">${other(2, 'Halloumi wrap', '~710 kcal · 28 g protein', 'Good')}${other(3, 'Beef burger and fries', '~1,150 kcal · 42 g protein', 'Over today’s budget')}</div>
        <div style="flex:1"></div>
        <p class="callout">Restaurant portions vary; these are estimates.</p>
      </div>`;
    },
  });

  /* ── 19. Fix it in your own words ────────────────────── */
  K.screen('fixwords', {
    from: '7, 19',
    note: 'Say what’s different. Your words stay on screen in two tones, each item shows before and after, and the total follows.',
    build: () => {
      const diff = (name, was, now, delta) => `<div class="row"><span class="mid"><b>${name}</b><span>${was} → <em class="ink" style="font-style:normal;font-weight:600">${now}</em></span></span><span class="end">${delta}<span class="callout" style="margin-left:3px">kcal</span></span></div>`;
      return `${status()}${sheetBar('Fix the estimate')}
      <div class="scroll"><div class="rise">
        <div style="display:flex;align-items:center;gap:10px">${orb('ring', 28)}<span class="callout">You said</span></div>
        <p class="statement mt12"><b>Half the rice</b>, <b>no sauce</b>, and it was <b>extra chicken</b>.</p>
        <div class="between mt24" style="align-items:flex-end"><div><span class="eyebrow">New total</span><div class="xl" style="margin-top:4px">610<small>kcal</small></div></div><span class="chip q" style="margin-bottom:10px">3 things changed</span></div>
        <div class="card pad16 rows mt16">${diff('Rice', '200 g', '100 g', '−130')}${diff('Teriyaki sauce', '30 g', '0', '−60')}${diff('Chicken', '120 g', '180 g', '+95')}</div>
        <p class="callout mt12">Corrections teach life your usual portions.</p>
      </div></div>
      ${foot(btn('Looks right') + `<button class="callout" style="display:flex;align-items:center;justify-content:center;gap:6px">${ic('mic', 's14')}Say it again</button>`)}`;
    },
  });

  /* ── 20. Everything you ate today ────────────────────── */
  K.screen('nutrients', {
    from: '3, 12, 20',
    note: 'One suggestion leads, with its picture. Then every nutrient as calm ticks against the UK reference intake. No red.',
    build: () => {
      const nut = (name, value, pct, note, sig) => `<div style="padding:10px 0"><div class="between"><span class="title" style="font-size:15px">${sig ? `<i style="display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--ember);margin-right:7px;vertical-align:2px"></i>` : ''}${name}</span><span class="callout" style="font-variant-numeric:tabular-nums">${value}</span></div>${ruler(pct, 30)}${note ? `<p class="callout mt8">${note}</p>` : ''}</div>`;
      return `${status()}${pushBar('Nutrients', round('info', { label: 'About reference intakes' }))}
      <div class="scroll"><div class="rise">
        <span class="eyebrow">Everything you ate today</span>
        <p class="display"><b>Iron</b> has been low most days. Add <b>beans, lentils or greens</b>.</p>
        <button class="card pad16 press mt20" style="display:flex;align-items:center;gap:12px"><span class="thumb" style="${crop('cook', .77, .705, 3.4)};width:56px;height:56px"></span><span style="flex:1"><span class="title" style="display:block">Beans, lentils or greens</span><span class="callout">Good sources of iron, and easy to add at dinner.</span></span></button>
        <div class="card mt12"><div class="micro">TODAY</div>
          ${nut('Fibre', '21 / 30 g', 70)}${nut('Sugar', '48 / 90 g', 53, 'Free sugars: 22 g of 30 g')}${nut('Salt', '4.1 / 6 g', 68)}${nut('Saturated fat', '14 / 20 g', 70)}</div>
        <div class="card mt12"><div class="micro">THIS WEEK, ON AVERAGE</div>
          ${nut('Iron', '9.2 / 14.8 mg', 62, 'Low most days: add beans, lentils or greens', true)}${nut('Calcium', '820 / 700 mg', 100)}${nut('Vitamin D', '3 / 10 µg', 30, 'Normal in winter: a supplement is advised Oct–Mar')}</div>
        <p class="callout mt16">Reference intakes for adults (UK). Not medical advice.</p>
      </div></div>`;
    },
  });

  /* ── 21. Describe a workout ──────────────────────────── */
  K.screen('describeexercise', {
    from: '7, 12, 19',
    note: 'No watch on? Say what you did. Your words on the right, life’s estimate as three plain numbers, and your choice of what comes back to Fuel.',
    build: () => `${status()}${sheetBar('Add activity')}
    <div class="scroll"><div class="rise">
      <div class="chatcol">${bubble('30 minutes of five-a-side, quite hard')}</div>
      <div class="mt20">${says('Here’s what I worked out. Change anything that’s off.')}</div>
      <div class="card tint goal mt12">
        <div class="between"><span class="headline">Football (five-a-side)</span></div>
        <div class="mt8" style="display:flex;gap:8px">${chip('30 min')}${chip('Vigorous')}</div>
        <div class="between mt20" style="align-items:flex-end"><div><span class="eyebrow">Estimated</span><div class="xl" style="margin-top:4px">~330<small>kcal</small></div></div><div style="text-align:right;margin-bottom:6px"><span class="callout">Load</span><div class="headline">9.5</div></div></div>
      </div>
      <div class="card pad16 mt12"><div class="between"><span class="title">Added back to Fuel</span><span class="title">+165 kcal</span></div>
        <div class="mt12">${seg(['None', 'Half', 'All'], 1)}</div></div>
      <p class="callout mt12">An estimate from standard activity tables, not a measurement.</p>
    </div></div>
    ${foot(btn('Add it'))}`,
  });

  /* ── 22. Your week, not just today ───────────────────── */
  K.screen('weekbudget', {
    from: '16, 12, 14',
    note: 'The week as one figure and seven bars with Saturday picked out. The birthday dinner is a photograph, and the balancing is said in a sentence.',
    build: () => `${status()}${pushBar('This week')}
    <div class="scroll"><div class="rise">
      <div class="eyebrow-row"><span class="eyebrow">Week so far</span>${chip('On track', 'done')}</div>
      <div class="xl" style="margin-top:6px">11,240<small>/ 16,100 kcal</small></div>
      <div class="card tint home mt20">${bars([2210, 2300, 2180, 2350, 2200, 2710, 2150], { labels: ['M', 'T', 'W', 'T', 'F', 'S', 'S'], now: 5, h: 132, color: 'var(--ac)', dim: .35, label: 'Calories by day this week, with Saturday planned higher and Sunday lighter' })}
        <p class="callout mt8">Monday to Friday are eaten. Saturday and Sunday are the plan.</p></div>
      <div class="mt12">${pcard(crop('birthday', .55, .62, 1, 176 / 330), 176, tag('Saturday'), 'Saturday is a birthday dinner', 'life will keep Sunday and Monday about 150 lighter, so the week still balances.', true)}</div>
      <div class="card pad16 between mt12"><span><span class="title" style="display:block">Carry unused calories to the weekend</span><span class="callout">Your choice. Off until you turn it on.</span></span>${toggle(false, 'Carry over')}</div>
    </div></div>`,
  });

  /* ── 23. Meals and your sleep ────────────────────────── */
  function windowChart() {
    const days = [['Mon', 8.17, 19.67], ['Tue', 7.83, 21.5], ['Wed', 8.33, 20.17], ['Thu', 8, 19.83], ['Fri', 9, 22.17], ['Sat', 10, 21.67], ['Sun', 9.5, 20]];
    const x = t => Math.round((36 + (t - 6) * 254 / 18) * 10) / 10, gx = x(21);
    return `<svg viewBox="0 0 290 196" style="display:block;width:100%;height:auto" role="img" aria-label="Your eating window on each of the last 7 days, with 21:00 marked">${Array.from({ length: 20 }, (_, k) => `<circle cx="${gx}" cy="${20 + k * 8}" r="1.3" fill="var(--quiet)"/>`).join('')}<circle cx="${gx}" cy="8" r="3.5" fill="var(--ember)"/><text x="${gx - 8}" y="12" text-anchor="end" font-size="11" font-weight="600" fill="var(--ink)">21:00</text>${days.map(([d, a, b], k) => { const late = b > 21, y = 24 + k * 22; return `<text x="0" y="${y + 9}" font-size="11" font-weight="600" fill="var(--${late ? 'ink' : 'ink2'})">${d}</text><rect x="${x(a)}" y="${y}" width="${Math.round((x(b) - x(a)) * 10) / 10}" height="10" rx="5" fill="var(--ac)" opacity="${late ? 1 : .4}"/>`; }).join('')}${[['06:00', 36, 'start'], ['15:00', x(15), 'middle'], ['24:00', 290, 'end']].map(([t, px, a]) => `<text x="${px}" y="192" text-anchor="${a}" font-size="11" font-weight="600" fill="var(--quiet)">${t}</text>`).join('')}</svg>`;
  }
  K.screen('mealtiming', {
    from: '3, 20, 16',
    note: 'The pattern is the sentence, in your own numbers. Under it, seven days of when you ate, with the three late dinners picked out.',
    build: () => `${status()}${pushBar('Meal timing', round('info', { label: 'How life found this' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Meals and your sleep</span>
      <p class="display">When dinner ends <b>after 21:00</b>, you sleep <b class="nw">${ic('moon')}31 minutes</b> <b>less</b> and your HRV is <b>lower</b>.</p>
      <div class="card tint work mt24"><div class="between"><span class="title">Eating window</span><span class="callout">last 7 days</span></div>
        <div class="mt12">${windowChart()}</div></div>
      <p class="callout mt12">A pattern in your own numbers, not a diagnosis.</p>
    </div></div>
    ${foot(btn('Try finishing by 20:30 for two weeks'))}`,
  });

  /* ── 24. Food quality ────────────────────────────────── */
  K.screen('foodquality', {
    from: '5, 14, 12',
    note: 'Not how much, but what. Nineteen plants of thirty as dots under a table full of them, then your food as one split bar.',
    build: () => `${status()}${pushBar('Food quality')}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${crop('sunday', .5, .85, 1, 210 / 330)};height:210px"><span class="topline">${tag('This week')}</span><span class="copy"><b>19 different plants</b><span>30 is a good target for gut health.</span></span></div>
      <div class="card mt12">${dots(Array.from({ length: 30 }, (_, k) => k < 19 ? 'on' : ''), 10)}
        <div class="between mt16"><span class="callout ink">19 so far</span><span class="callout">11 to go</span></div>
        <p class="callout mt8">Herbs, nuts, seeds and spices all count.</p></div>
      <div class="card mt12"><div class="between"><span class="title">What your food was made of</span><span class="callout">this week</span></div>
        <div class="fu-split mt16" aria-hidden="true"><i style="flex:58;background:var(--ink)"></i><i style="flex:20;background:var(--ink2)"></i><i style="flex:22;background:var(--surface3)"></i></div>
        <div class="mt16">${cols3([['Whole', '58%', 'or barely processed'], ['Processed', '20%', ''], ['Ultra-processed', '22%', '']])}</div></div>
    </div></div>`,
  });

  /* ── 25. Alcohol ─────────────────────────────────────── */
  K.screen('alcohol', {
    from: '12, 5, 20',
    note: 'Units this week as one figure and fourteen blocks, the week with its drink-free days, quick adds, and what your own nights show.',
    build: () => {
      const add = (name, units) => softChip(`${ic('add', 's16')}${name}<b style="font-weight:600;margin-left:2px">${units}</b>`);
      const week = [['M', ''], ['T', '2.3'], ['W', ''], ['T', ''], ['F', '4.4'], ['S', '2.3'], ['S', '']];
      return `${status()}${pushBar('Alcohol', round('info', { label: 'About the guideline' }))}
      <div class="scroll"><div class="rise">
        <div class="eyebrow-row"><span class="eyebrow">This week</span>${chip('4 drink-free days', 'done')}</div>
        <div class="xl" style="margin-top:6px">9<small>/ 14 units</small></div>
        ${ruler(64, 14)}
        <p class="callout mt12">The UK guideline is no more than 14 units a week, spread out, with drink-free days.</p>
        <div class="fu-week mt24">${week.map(([d, u]) => `<span><i class="${u ? 'fu-on' : ''}">${u}</i><small>${d}</small></span>`).join('')}</div>
        <div class="micro mt24">ADD A DRINK</div>
        <div class="mt12" style="display:flex;flex-wrap:wrap;gap:8px">${add('Pint of beer', '2.3')}${add('Glass of wine', '2.1')}${add('Single spirit', '1')}</div>
        <div class="card tint health mt24"><div class="micro">FROM 11 NIGHTS OF YOUR DATA</div><p class="statement mt8">After <b>4+ units</b>, your HRV is <b>18% lower</b> the next morning.</p></div>
        <p class="callout mt16">If you’re worried about your drinking, Drinkline: <b class="ink">0300 123 1110</b>.</p>
      </div></div>`;
    },
  });

  /* ── 26. Log in two taps ─────────────────────────────── */
  K.screen('quicklog', {
    from: '21, 14, 15',
    note: 'A fast sheet over Fuel. Your usual meals are pictures to tap, small things are chips, ordered for the time of day. Tap the breakfast.',
    build: s => {
      const logged = s === 'logged';
      const small = (name, kcal) => softChip(`${ic('add', 's16')}${name}<b style="font-weight:600;margin-left:2px">${kcal}</b>`);
      return `${status()}
      <div class="scroll dim" style="flex:1;overflow:hidden">
        <span class="eyebrow" style="margin-top:8px">Fuel · Monday</span>
        <div class="xl" style="margin-top:6px">1,240<small>kcal left today</small></div>
        <div class="mt16">${cols3([['Eaten', '1,060'], ['Burned', '+300'], ['Water', '1.4 L']])}</div>
        <div class="mt20">${pcard(bowl(1.05, 200 / 330), 200, tag('Lunch · 12:40'), 'Salmon rice bowl', '640 kcal')}</div>
      </div>
      <div class="sheet"><div class="handle"></div>
        <div class="between" style="height:52px"><span class="title">Quick log</span>${round('close', { cls: 'sm', label: 'Close' })}</div>
        ${seg(['Recent', 'Usual', 'Quick add'], 0)}
        <div class="micro mt16">${logged ? `<span style="color:var(--gain);display:grid">${ic('check', 's14')}</span>USUAL BREAKFAST LOGGED · 420 KCAL` : 'ORDERED FOR THIS TIME OF DAY'}</div>
        <div class="pgrid mt12">
          ${pcard(yoghurt(1.4, 150 / 160), 150, logged ? `<span class="chip onphoto" style="color:#0B7A55">${ic('check', 's14')}Logged</span>` : `${tag('420 kcal')}${plus}`, 'Usual breakfast', 'Yoghurt, berries, oats', true, `data-set="${logged ? '' : 'logged'}"`)}
          ${pcard(crop('food', .52, .5, 1.6, 150 / 160), 150, `${tag('705 kcal')}${plus}`, 'Salmon rice bowl', '', true)}
        </div>
        <div class="mt12" style="display:flex;flex-wrap:wrap;gap:8px">${small('Oat flat white', 'Pret · 140')}${small('Banana', '89')}${small('Protein bar', 'Grenade · 220')}</div>
      </div>`;
    },
  });

  /* ── 27. Bring your history ──────────────────────────── */
  K.screen('importfood', {
    from: '6, 8',
    note: 'One sentence on why, three places your history might live, and the privacy line said once. Nothing is shown as connected until you do it.',
    build: () => {
      const src = (icon, name, sub, act) => `<button class="card pad16 press" style="display:flex;align-items:center;gap:12px"><span class="badge" style="background:var(--surface2)">${ic(icon, 's18')}</span><span style="flex:1;min-width:0"><span class="title" style="display:block">${name}</span><span class="callout">${sub}</span></span><span class="chip">${act}</span></button>`;
      return `${status()}${pushBar('Import')}
      <div class="scroll"><div class="rise">
        <span style="width:72px;height:72px;border-radius:22px;background:var(--surface);box-shadow:var(--shadow);display:grid;place-items:center;color:var(--ink);margin-top:8px">${ic('arrowDown')}</span>
        <p class="display" style="margin-top:20px">Start from <b>your real history</b>, not from zero.</p>
        <p class="body mt12">Bring your past food and weight from another app, so life’s targets and patterns begin with what you’ve already logged.</p>
        <div class="gap8 mt24">${src('heart', 'Apple Health', 'Food and weight from other apps', 'Connect')}${src('doc', 'MyFitnessPal', 'Export a CSV, then pick it here', 'Choose file')}${src('doc', 'Lose It', 'Export a CSV, then pick it here', 'Choose file')}</div>
        <div class="body mt20" style="display:flex;gap:10px"><span class="ink" style="display:grid;flex:none;margin-top:2px">${ic('shield', 's18')}</span><span><b>Your data stays yours.</b> Imports are read once and stored on your phone.</span></div>
      </div></div>`;
    },
  });
})();
