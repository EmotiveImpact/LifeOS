// life · V26 screens · Body, the next tap from Body and Readiness (17 screens). Written against review/v26/KIT.md, picture-forward.
(() => {
  'use strict';
  const K = window.L26;
  const { ic, img, status, round, pushBar, sheetBar, foot, btn, secHead, chip, orb, ruler, row, tile, metric, kv, toggle, seg, acc, bubble, dots, bars, line } = K;

  /* One-off parts the kit does not have: a sleep stage strip, a band behind bars, a small
     "where you sit in your own range" gauge, a two-way bar, big toggle tags and a cycle strip.
     Inside a tinted card they draw in that card's area colour (--ac); elsewhere in ink. */
  K.addCss('.ba-', `
.ba-axis { display: flex; justify-content: space-between; margin-top: 6px; font-size: 11px; line-height: 13px; font-weight: 600; letter-spacing: .1px; color: var(--quiet); }
.ba-axis b { font-weight: 600; color: var(--ink); }
.ba-stages { display: flex; align-items: flex-end; gap: 2px; height: 60px; }
.ba-stages i { min-width: 3px; border-radius: 4px; }
.ba-s-deep { background: var(--ac, var(--ink)); }
.ba-s-rem { background: var(--ac, var(--ink)); opacity: .6; }
.ba-s-light { background: var(--ac, var(--ink)); opacity: .3; }
.ba-s-awake { background: var(--ink2); opacity: .45; }
.ba-key { display: inline-block; width: 8px; height: 8px; border-radius: 50%; flex: none; }
.ba-legend { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.ba-legend small { display: flex; align-items: center; gap: 5px; font-size: 11px; line-height: 13px; font-weight: 600; letter-spacing: .1px; color: var(--ink2); }
.ba-legend b { display: block; margin-top: 4px; font-size: 16px; line-height: 21px; font-weight: 600; letter-spacing: -.22px; color: var(--ink); font-variant-numeric: tabular-nums; }
.ba-legend em { display: block; font-style: normal; font-size: 13px; line-height: 18px; color: var(--ink2); }
.ba-plot { position: relative; z-index: 0; margin: 0 -20px; }
.ba-band { position: absolute; z-index: -1; border-radius: 10px; background: var(--surface); }
.ba-split { display: flex; gap: 3px; height: 12px; }
.ba-split i { min-width: 4px; border-radius: 6px; background: var(--ac, var(--ink)); }
.ba-day { position: relative; z-index: 0; display: flex; align-items: flex-end; gap: 3px; height: 96px; }
.ba-day i { flex: 1; min-height: 4px; border-radius: 4px; background: var(--ac, var(--ink)); opacity: .35; }
.ba-day .ba-hot { opacity: 1; }
.ba-range { display: block; position: relative; height: 16px; }
.ba-range::before { content: ""; position: absolute; left: 0; right: 0; top: 6px; height: 4px; border-radius: 2px; background: var(--surface2); }
.ba-range b { position: absolute; top: 0; height: 16px; border-radius: 8px; background: var(--surface3); }
.ba-range i { position: absolute; top: 3px; width: 10px; height: 10px; border-radius: 50%; background: var(--ac, var(--ink)); transform: translateX(-5px); }
.ba-ontint::before { background: var(--surface); }
.ba-ontint b { background: var(--surface); }
.ba-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.ba-tag { display: inline-flex; align-items: center; gap: 6px; height: 40px; padding: 0 15px; border-radius: 999px; background: var(--surface); box-shadow: var(--shadow); font-size: 15px; font-weight: 600; letter-spacing: -.15px; }
.ba-tag[aria-pressed="true"] { background: var(--ink); color: var(--canvas); box-shadow: none; }
.ba-tag.ba-quiet { background: var(--surface2); color: var(--ink2); box-shadow: none; }
.ba-ask { display: inline-flex; align-items: center; height: 40px; padding: 0 14px; border-radius: 999px; background: var(--surface); box-shadow: var(--shadow); font-size: 14px; font-weight: 500; letter-spacing: -.12px; }
.ba-eff { padding-top: 14px; }
.ba-bal { position: relative; height: 10px; margin-top: 8px; border-radius: 5px; background: var(--surface); }
.ba-bal::before { content: ""; position: absolute; left: 50%; top: -3px; width: 2px; height: 16px; margin-left: -1px; border-radius: 1px; background: var(--ink2); opacity: .35; }
.ba-bal i { position: absolute; top: 0; height: 10px; border-radius: 5px; }
.ba-pos { left: 50%; background: var(--ac, var(--ink)); }
.ba-neg { right: 50%; background: var(--ink2); }
.ba-zones { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
.ba-zones span { display: grid; place-items: center; height: 44px; border-radius: 14px; background: var(--surface2); font-size: 13px; font-weight: 600; color: var(--ink2); }
.ba-zones .ba-here { background: var(--ember); color: #08090A; }
.ba-air { display: grid; place-items: center; margin: 0 auto; border-radius: 50%; background: var(--surface3); }
.ba-air .ba-air { background: var(--surface); box-shadow: var(--shadow); }
.ba-night { position: relative; height: 36px; border-radius: 12px; background: var(--surface); }
.ba-night i { position: absolute; top: 6px; bottom: 6px; border-radius: 8px; background: var(--ac, var(--ink)); }
.ba-night .ba-doze { opacity: .45; }
.ba-night .ba-bell { top: 13px; bottom: 13px; width: 10px; border-radius: 50%; background: var(--ink2); transform: translateX(-5px); }
.ba-sum { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; color: var(--quiet); }
.ba-cyc { display: flex; gap: 8px; }
.ba-ph { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
.ba-ph span { display: flex; gap: 3px; }
.ba-ph i { flex: 1; aspect-ratio: 1; border-radius: 50%; background: var(--ac, var(--ink2)); opacity: .28; }
.ba-ph i.on { background: var(--ink); opacity: 1; }
.ba-ph i.now { background: var(--ember); opacity: 1; }
.ba-ph small { font-size: 11px; line-height: 13px; font-weight: 600; letter-spacing: .1px; color: var(--ink2); white-space: nowrap; }
.ba-cur small { color: var(--ink); }
`);

  /* ── Small parts shared by this chapter ──────────────── */
  const axis = (labels, lastInk) => `<div class="ba-axis">${labels.map((l, k) => lastInk && k === labels.length - 1 ? `<b>${l}</b>` : `<span>${l}</span>`).join('')}</div>`;
  /** Where a reading sits in your own range: the soft band is normal, each dot is a reading. Positions are 0–100. */
  const gauge = (lo, hi, at, onTint) => `<span class="ba-range ${onTint ? 'ba-ontint' : ''}" aria-hidden="true"><b style="left:${lo}%;width:${hi - lo}%"></b>${[].concat(at).map(p => `<i style="left:${p}%"></i>`).join('')}</span>`;
  const fig = (value, chipHtml = '') => `<div class="between" style="align-items:flex-end"><div class="xl">${value}</div>${chipHtml ? `<span style="margin-bottom:10px">${chipHtml}</span>` : ''}</div>`;
  /** A tinted chart card's heading: round badge, title, and what the band means. */
  const head = (icon, title, right = '') => `<div class="between"><span style="display:flex;align-items:center;gap:10px"><span class="badge">${ic(icon, 's18')}</span><span class="title">${title}</span></span>${right ? `<span class="callout">${right}</span>` : ''}</div>`;
  const tinted = (html, area) => html.replace(/class="(tile|card) /, `class="$1 tint ${area} `);
  const small = 'font-size:16px;line-height:21px;letter-spacing:-.22px';
  const r1 = n => Math.round(n * 10) / 10;

  /* ── 1. Connect devices ──────────────────────────────── */
  function devices() {
    const sw = (label, on) => `<div class="between" style="min-height:44px"><span class="body ink">${label}</span>${toggle(on, label)}</div>`;
    const src = (icon, name, gives, act) => `<div class="card pad16" style="flex:0 0 158px;display:flex;flex-direction:column"><span class="thumb" style="display:grid;place-items:center">${ic(icon)}</span><span class="title" style="margin-top:12px">${name}</span><span class="callout" style="margin-top:2px;flex:1">${gives}</span><button class="btn ghost sm press" style="margin-top:14px">${act}</button></div>`;
    return `${status()}${pushBar('Devices')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Body · connections</span>
      <p class="display">Bring your data in. <b>life reads only what you allow.</b></p>
      <p class="body mt12">Health data stays on your phone, never goes to iCloud and is never used for ads.</p>
      <div class="card tint health mt24">
        <div class="between" style="align-items:flex-start"><span style="display:flex;gap:12px"><span class="badge">${ic('heart', 's18')}</span><span><span class="title" style="display:block">Apple Health</span><span class="callout" style="display:block;margin-top:2px">Sleep, heart, HRV, workouts, steps, food</span></span></span>${chip('On', 'done')}</div>
        <div class="micro mt20">WHAT LIFE CAN READ · ONE BY ONE</div>
        <div class="mt8">${sw('Sleep', true)}${sw('Heart rate and HRV', true)}${sw('Workouts and steps', true)}${sw('Food and water', true)}${sw('Weight', false)}</div>
      </div>
      ${secHead('Add another', 'when you’re ready')}
      <div class="hscroll" style="padding-bottom:18px">${src('watch', 'WHOOP', 'Recovery, strain, sleep', 'Connect')}${src('moon', 'Oura', 'Readiness, sleep, temperature', 'Connect')}${src('pulse', 'Heart-rate strap', 'Any Bluetooth strap: Polar, Garmin, Wahoo', 'Pair')}</div>
      <p class="callout">WHOOP and Oura connect through your account with them. Only a heart-rate strap pairs over Bluetooth.</p>
      ${secHead('Already works')}
      <div class="card pad16 rows">${row('watch', 'Garmin, Fitbit, Samsung and more', 'Through Apple Health or Health Connect', chip('Works', 'q'))}${row('layers', 'Health Connect', 'The same on Android phones', chip('Android', 'q'))}${row('add', 'Manual', 'Sleep times, weight, water, workouts', chip('Always', 'q'))}</div>
      <p class="callout mt16">Disconnect any time. Ask, and life deletes everything it imported.</p>
    </div></div>`;
  }

  /* ── 2. Sleep: the figure, tonight as a photograph, the night in stages, the week against your need ─ */
  const NIGHT = [['awake', 14], ['light', 25], ['deep', 35], ['light', 20], ['rem', 15], ['light', 30], ['deep', 25], ['light', 25], ['rem', 25], ['awake', 8], ['light', 35], ['deep', 20], ['light', 30], ['rem', 30], ['awake', 7], ['light', 30], ['rem', 40], ['light', 25], ['awake', 5]];
  const TALL = { deep: 100, rem: 64, light: 36, awake: 12 };
  function sleep() {
    const strip = `<div class="ba-stages" role="img" aria-label="Last night in stages, from 23:20 to 06:45">${NIGHT.map(([s, m]) => `<i class="ba-s-${s}" style="flex:${m} 1 0px;height:${TALL[s]}%"></i>`).join('')}</div>`;
    const key = (s, name, time) => `<div><small><i class="ba-key ba-s-${s}"></i>${name}</small><b>${time}</b></div>`;
    return `${status()}${pushBar('Sleep', round('info', { label: 'How sleep is scored' }))}
    <div class="scroll"><div class="rise">
      ${fig('7<small>h</small> 10<small>m</small>', chip('Needed about 8h 05m', 'q'))}
      <p class="statement mt12">This week’s debt is <b>2h 40m</b>. <b>Tonight can pay some back.</b></p>
      <button class="pcard press mt20" style="${img('bedroom')};height:176px;background-position:center 52%"><span class="topline"><span class="chip onphoto">Tonight</span><span class="chip onphoto">${ic('bell', 's14')}Reminder 22:05</span></span><span class="copy"><b>In bed by 22:50</b><span>Pays back 40 minutes of debt</span></span></button>
      <div class="card tint work mt12">
        ${head('moon', 'Last night', 'taller is deeper')}
        <div class="mt16">${strip}</div>
        ${axis(['23:20', '06:45'])}
        <div class="ba-legend mt16">${key('deep', 'Deep', '1h 20m')}${key('rem', 'REM', '1h 50m')}${key('light', 'Light', '3h 40m')}${key('awake', 'Awake', '20m')}</div>
      </div>
      <div class="card mt12">
        <div class="between"><span class="title">Last 7 nights</span><span class="callout">band = what you needed</span></div>
        <div class="mt8">${line([8.0, 7.5, 8.2, 7.67, 7.32, 8.4, 7.17], 7.83, 8.25, { h: 104, label: 'Hours asleep on each of the last 7 nights, against what you needed' })}</div>
        ${axis(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], true)}
        <p class="callout mt12">3 nights reached your need. The other 4 add up to the 2h 40m.</p>
      </div>
      <div class="tiles mt12">
        ${tile({ plain: true, label: 'Sleep performance', value: '89', small: '%', sub: 'Asleep ÷ needed' })}
        ${tile({ plain: true, label: 'Fell asleep in', value: '14', small: 'min', sub: 'From Apple Health' })}
        ${tile({ wide: true, label: 'Consistency', unit: 'Work on it', value: '±38', small: 'min', sub: 'How far your bedtime moves, night to night', extra: `<span style="display:block;margin-top:14px">${gauge(30, 70, [39.5, 73.2, 32.6, 60.5, 82.6, 24.7, 36.8])}</span>${axis(['earlier', 'your usual window', 'later'])}` })}
      </div>
      <p class="callout mt16">Most adults need 7–9 hours (NHS). life learns your own need from mornings you feel rested.</p>
    </div></div>`;
  }

  /* ── 3. Load: the week as bars, today's sweet spot behind them ─ */
  function load() {
    const y = v => r1(120 - v * 114 / 21);
    const zone = (z, mins) => `<span><small>${z}</small><b>${mins}</b></span>`;
    const did = (photo, crop, when, what, n) => `<button class="pcard press" style="${img(photo)};height:170px;${crop}"><span class="topline"><span class="chip onphoto">${when}</span></span><span class="copy"><b style="${small}">${what}</b><span>Load ${n}</span></span></button>`;
    return `${status()}${pushBar('Load', round('info', { label: 'How load works' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Today so far</span>
      ${fig('11.4<small>/21</small>', chip('In today’s range', 'done'))}
      <p class="statement mt12">Today’s sweet spot is <b>11–14</b>, set by your readiness of <b>72</b>. <b>You’re in it</b>, so the rest of today can be easy.</p>
      <div class="card tint goal mt20">
        ${head('fitness', 'This week', 'band = sweet spot')}
        <div class="ba-plot mt8"><span class="ba-band" style="left:8px;right:8px;top:${y(13)}px;height:${r1(y(8) - y(13))}px"></span>${bars([9.8, 6.2, 12.6, 4.1, 14.9, 7.3, 11.4], { labels: ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Today'], now: 6, max: 21, h: 140, color: 'var(--ac)', dim: .35, label: 'Load on each of the last 7 days, with today’s sweet spot of 8 to 13 shaded' })}</div>
        <p class="callout mt8">The band moves with your readiness each morning.</p>
      </div>
      ${secHead('What made it', 'from Apple Health')}
      <div class="pgrid">${did('run', 'background-size:150%;background-position:25% 55%', '07:10', 'Run · 32 min', '6.1')}${did('walk', 'background-position:center 54%', '12:30', 'Walk · 45 min', '2.3')}</div>
      <div class="card pad16 mt12">${row('walk', 'Everyday movement', '8,240 steps', '<span class="end">3.0</span>')}</div>
      <button class="card press mt12">
        <span class="between"><span class="title">Time in heart-rate zones</span><span class="chev">${ic('chev', 's16')}</span></span>
        <span class="ba-split mt16">${[[38, .2], [24, .4], [11, .6], [4, .8], [0, 1]].map(([m, o]) => `<i style="flex:${m} 1 0px;opacity:${o}"></i>`).join('')}</span>
        <span class="ba-legend mt12" style="grid-template-columns:repeat(5,1fr)">${zone('Z1', '38m')}${zone('Z2', '24m')}${zone('Z3', '11m')}${zone('Z4', '4m')}${zone('Z5', '0m')}</span>
      </button>
      <p class="callout mt16">An estimate of effort, not a fitness test.</p>
    </div></div>`;
  }

  /* ── 4. Trends: the pattern leads, three readings side by side, two more as pictures ─ */
  function trends() {
    const seen = (photo, crop, when, what) => `<button class="pcard press" style="${img(photo)};height:190px;${crop}"><span class="topline"><span class="chip onphoto">Pattern</span></span><span class="copy"><b style="${small}">${when}</b><span>${what}</span></span></button>`;
    return `${status()}${pushBar('Trends')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow"><span class="star"></span>life noticed a pattern</span>
      <p class="display">After <b>7+ hours</b> of sleep, your readiness tends to be <b>9 points higher</b> the next day.</p>
      ${secHead('Side by side', 'against your normal')}
      ${seg(['4 weeks', '3 months'], 0)}
      <div class="gap8 mt12">
        ${metric({ icon: 'moon', name: 'Sleep', value: '7h 38m', unit: 'a night', tag: 'Below need', tone: 'q', delta: 'Your need is about 8h 05m', series: [7.3, 7.9, 7.4, 7.6, 7.2, 8.0, 7.5, 7.75], lo: 7.83, hi: 8.25 })}
        ${metric({ icon: 'heart', name: 'Readiness', value: '61', unit: 'average', tag: 'Steady', tone: 'q', delta: 'Inside your normal range', series: [58, 63, 55, 66, 61, 57, 64, 66], lo: 55, hi: 66 })}
        ${metric({ icon: 'sun', name: 'Mood', value: '3.5', unit: 'of 5', tag: 'Steady', tone: 'q', delta: '1 = drained, 5 = driven', series: [3, 4, 3, 4, 2, 4, 4, 4], lo: 3, hi: 4.2 })}
      </div>
      ${secHead('Also noticed')}
      <div class="pgrid">${seen('bedroom', 'background-position:center 60%', 'Mondays', 'You tend to feel drained after short Sunday nights')}${seen('run', 'background-size:150%;background-position:25% 68%', 'Training days', 'Your protein tends to fall short')}</div>
      <p class="callout mt16">Patterns, not proof. life looks at your own data only.</p>
    </div></div>`;
  }

  /* ── 5. One metric in full: HRV ──────────────────────── */
  const HRV30 = [55, 57, 53, 56, 58, 54, 45, 52, 56, 59, 55, 57, 50, 54, 58, 56, 53, 57, 46, 53, 56, 58, 56, 49, 52, 47, 55, 51, 54, 58];
  function hrv() {
    const mover = (d, t, n) => `<div class="row"><span class="datebox"><b>${d}</b><small>ms</small></span><span class="mid"><b>${t}</b><span>${n}</span></span></div>`;
    return `${status()}${pushBar('Heart rate variability', round('info', { label: 'About HRV' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">${ic('shield', 's14')}Personal baseline · overnight</span>
      ${fig('58<small>ms</small>', chip('Above your normal', 'done'))}
      <p class="statement mt12">Above your normal range of <b>47–56 ms</b>. Higher than usual often means your body has <b>recovered well</b>.</p>
      <div class="card tint health mt20">
        ${head('pulse', '30 days', 'avg 54 · band = your normal')}
        <div class="mt8">${line(HRV30, 47, 56, { h: 130, color: 'var(--ac)', band: 'var(--surface)', label: 'Heart rate variability over 30 days, against your normal range of 47 to 56 milliseconds' })}</div>
        ${axis(['18 Oct', '1 Nov', 'Today'], true)}
      </div>
      ${secHead('What moves yours', 'from your journal')}
      <div class="card pad16 rows">${mover('−9', 'Alcohol the night before', '12 nights')}${mover('+6', 'In bed before 23:00', '18 nights')}${mover('−4', 'Hard workout the day before', '9 days')}</div>
      <div class="card pad16 mt12">${kv('Source', 'Apple Watch via Apple Health')}${kv('Measured', 'Overnight')}${kv('Measure', 'SDNN*')}
        <button class="row press" style="min-height:56px"><span class="mid"><b>How it’s calculated</b><span>Methods and evidence</span></span><span class="chev">${ic('chev', 's16')}</span></button></div>
      <p class="callout mt16">*Apple Health reports SDNN; Oura and chest straps give beat-to-beat data for RMSSD. life only compares like with like, against your own baseline.</p>
    </div></div>`;
  }

  /* ── 6. Body signals: four small tiles, each against your own range ─ */
  function signals(drift) {
    const S = drift
      ? [['Skin temperature', '+0.6', '°C', 'vs your normal', 90, true], ['Breathing rate', '15.9', '/min', 'normal 14.6–15.2', 94, true], ['Resting heart rate', '61', 'bpm', 'normal 54–57', 96, true], ['Blood oxygen', '96', '%', 'normal 95–98%', 43, false]]
      : [['Skin temperature', '+0.1', '°C', 'vs your normal', 57, false], ['Breathing rate', '14.8', '/min', 'normal 14.6–15.2', 43, false], ['Resting heart rate', '54', 'bpm', 'normal 54–57', 32, false], ['Blood oxygen', '96', '%', 'normal 95–98%', 43, false]];
    const sig = ([name, value, unit, sub, at, off]) => `<div class="tile" style="padding:12px 12px 14px;min-height:0"><span class="th"><span>${name}</span></span><span class="num">${value}<small>${unit}</small></span><span class="sub">${sub}</span><span style="display:block;margin-top:14px">${gauge(30, 70, at)}</span><span class="chip ${off ? '' : 'q'}" style="align-self:flex-start;margin-top:12px">${off ? 'Off normal' : 'In range'}</span></div>`;
    const swap = (set, icon, title, sub) => `<button class="card pad16 press mt12" data-set="${set}" style="display:flex;align-items:center;gap:12px"><span class="thumb" style="display:grid;place-items:center">${ic(icon, 's18')}</span><span style="flex:1"><span class="title" style="display:block">${title}</span><span class="callout">${sub}</span></span><span class="chev">${ic('chev', 's16')}</span></button>`;
    return `${status()}${pushBar('Body signals')}
    <div class="scroll"><div class="rise">
      ${drift
        ? `<span class="eyebrow"><span class="star"></span>How a flag looks · sample from Sat 7 Nov</span>
      <p class="display"><b>3 signals</b> are off your normal. <b>Take it easy today.</b></p>
      <p class="body mt12">This can happen when you’re coming down with something, after alcohol, or after a very hard day. <b>If you feel unwell, call NHS 111.</b></p>`
        : `<span class="eyebrow">Against your own normal · Apple Health</span>
      <p class="display">All <b>4 signals</b> are inside <b>your normal range</b> today.</p>`}
      <div class="card tint health mt20" style="padding:12px">
        <div style="padding:4px 4px 0">${head('pulse', 'Where you sit', 'band = your own range')}</div>
        <div class="tiles mt12" style="gap:8px">${S.map(sig).join('')}</div>
      </div>
      ${drift ? swap('', 'check', 'Back to today', 'All 4 signals in range') : swap('drift', 'info', 'When signals drift', 'life tells you gently. It often comes before feeling ill.')}
      <p class="callout mt16">Not a medical device. life compares you only with yourself and never diagnoses.</p>
    </div></div>`;
  }

  /* ── 7. Stress today: the day in half hours, against where you usually sit ─ */
  const DAY = [.6, .8, 1.2, 1.1, .9, 1.3, 1.5, 1.2, .8, .7, 1.4, 2.6, 2.9, 2.5, 1.7, 1.3, 1.1, 1.4, 1.6, 1.2, .9, .7, 1.0, 1.2, 1.4];
  function stress() {
    return `${status()}${pushBar('Stress', round('info', { label: 'How stress works' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Right now</span>
      ${fig('1.4<small>/3</small>', chip('Low · estimate', 'q'))}
      <p class="statement mt12">Mostly calm today, with one busy stretch from <b>13:30 to 15:00</b>. <b>Two minutes of slow breathing</b> can help you reset.</p>
      <div class="card tint you mt20">
        ${head('pulse', 'Every 30 min', '0 calm · 3 high')}
        <div class="ba-day mt16" role="img" aria-label="Stress level every 30 minutes from 08:00 to 20:00, against your usual range"><span class="ba-band" style="left:0;right:0;bottom:17%;height:37%"></span>${DAY.map((v, k) => `<i class="${k >= 11 && k <= 13 ? 'ba-hot' : ''}" style="height:${Math.round(v / 3 * 100)}%"></i>`).join('')}</div>
        ${axis(['08:00', '14:00', '20:00'])}
        <p class="callout mt12">The band is where you usually sit while still. One stretch rose above it.</p>
      </div>
      <div class="tiles mt12">
        ${tile({ plain: true, label: 'Busiest stretch', unit: 'High', value: '52', small: 'min', sub: '13:30 – 15:00' })}
        ${tile({ plain: true, label: 'Time calm today', unit: '62%', value: '6h 10m', extra: ruler(62, 18) })}
      </div>
      <button class="pcard press mt12" style="${img('breathe')};height:170px;background-position:center 36%"><span class="topline"><span class="chip onphoto">A reset</span><span class="round" style="background:var(--on-photo);color:#0D0E10">${ic('play', 's18')}</span></span><span class="copy"><b>Breathe for 2 minutes</b><span>About 6 slow breaths a minute</span></span></button>
      <p class="callout mt16">Heart rate also rises with excitement, caffeine and movement, so treat this as a hint, not a fact.</p>
    </div></div>`;
  }

  /* ── 8. Breathe: the photograph sets the room, the orb is the guide ─ */
  function breathe(s) {
    const go = s === 'go', done = s === 'done', halo = go ? 196 : 152;
    const cue = done ? 'Two minutes, done.' : go ? 'Breathe in' : 'Ready when you are';
    const sub = done ? '12 slow breaths, at about 6 a minute.' : go ? 'Through your nose, for 5' : 'In through your nose for 5, out slowly for 5.';
    const action = done ? btn('Done', { set: '' }) : go ? btn('End early', { ghost: true, set: 'done' }) : btn('Start', { icon: 'play', set: 'go' });
    return `<div class="full-photo fade" style="${img('breathe')};bottom:auto;height:400px;background-position:center 22%"></div>
    ${status('on-photo')}
    <header class="bar on-photo"><button class="round press" style="background:var(--on-photo);color:#0D0E10" aria-label="Close">${ic('close', 's18')}</button><span style="display:flex;gap:8px"><span class="chip onphoto">${ic('heart', 's14')}72 bpm</span><span class="chip onphoto">6 breaths a minute</span></span></header>
    <div style="height:240px;flex:none"></div>
    <div class="sheet" style="flex:1;min-height:0;display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:24px">
      <p class="t30">${cue}</p>
      <p class="callout" style="margin-top:6px">${sub}</p>
      <div style="flex:1;min-height:0;width:100%;display:grid;place-items:center"><div class="ba-air" style="width:${halo}px;height:${halo}px"><div class="ba-air" style="width:128px;height:128px">${orb(done ? 'done' : go ? 'listening' : 'ring', 88)}</div></div></div>
      <div class="xl">${go ? '1:24' : '2:00'}</div>
      <p class="callout mt8">Live heart rate from Apple Watch or a Bluetooth strap.</p>
      <div style="width:100%;margin-top:16px">${action}</div>
    </div>`;
  }

  /* ── 9. Evening journal: tags you tap, counted in dots ── */
  const TAGS = ['Alcohol', 'Caffeine after 2pm', 'Screens in bed', 'Late meal', 'Morning daylight', 'Hydrated', 'Meditated', 'Travelled', 'Sick or run down'];
  function journal(s) {
    const saved = s.startsWith('saved'), bits = (s.replace('saved', '') || '010011000').split('');
    const now = bits.join(''), flip = k => bits.map((b, j) => j === k ? (b === '1' ? '0' : '1') : b).join('');
    const cells = Array.from({ length: 14 }, (_, k) => k < 9 ? 'on' : k === 9 ? (saved ? 'on' : 'now') : '');
    return `${status()}${sheetBar('Journal')}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('journal')};height:160px;background-position:center 40%"><span class="topline"><span class="chip onphoto">Tonight · 10 seconds</span></span><span class="copy"><b>What happened today?</b></span></div>
      <div class="ba-tags mt20">${TAGS.map((t, k) => `<button class="ba-tag press" data-set="${flip(k)}" aria-pressed="${bits[k] === '1'}">${bits[k] === '1' ? ic('check', 's16') : ''}${t}</button>`).join('')}<button class="ba-tag ba-quiet press">${ic('add', 's16')}Add your own</button></div>
      <div class="card mt20">
        <div class="between"><span class="title">${saved ? '10' : '9'} of 14 evenings logged</span><span class="callout">${saved ? '4' : '5'} to go</span></div>
        <div class="mt16">${dots(cells, 14)}</div>
        <p class="callout mt12">Unlocks insights after 2 weeks. Private: your answers stay on this phone.</p>
      </div>
    </div></div>${foot(saved ? btn('Saved for tonight', { icon: 'check', ghost: true, set: now }) : btn('Save tonight', { set: 'saved' + now }))}`;
  }

  /* ── 10. Journal insights: what tends to help, what tends to cost ─ */
  function insights() {
    const eff = (name, v, days) => `<div class="ba-eff"><div class="between"><span class="body ink">${name} <span class="q">· ${days} days</span></span><b class="title">${v > 0 ? '+' : '−'}${Math.abs(v)}</b></div><div class="ba-bal"><i class="${v > 0 ? 'ba-pos' : 'ba-neg'}" style="width:${r1(Math.abs(v) / 14 * 50)}%"></i></div></div>`;
    return `${status()}${pushBar('What helps you')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Your readiness, the day after</span>
      <p class="display">After <b>alcohol</b>, readiness tends to be <b>14 lower</b>. <b>Bed before 11</b> adds about <b>11</b>.</p>
      <div class="card tint health mt24">
        <div class="between"><span class="micro">TENDS TO HELP</span><span class="micro">POINTS OF READINESS</span></div>
        ${eff('In bed before 23:00', 11, 18)}${eff('Morning daylight', 6, 22)}${eff('Hydrated', 4, 25)}
        <div class="micro mt24">TENDS TO COST</div>
        ${eff('Screens in bed', -5, 20)}${eff('Caffeine after 2pm', -7, 15)}${eff('Alcohol', -14, 12)}
        <div class="ba-axis" style="margin-top:14px"><span>lower</span><span>days without it</span><span>higher</span></div>
      </div>
      <p class="callout mt16">Readiness on the day after, vs days without it. Patterns, not proof. life waits for 8 days of a tag before it shows one.</p>
    </div></div>`;
  }

  /* ── 11. Live workout: the run fills the top, big timer, heart rate, zone ─ */
  function workout(s) {
    const paused = s === 'paused';
    const loadTile = tinted(tile({ plain: true, label: 'Load so far', unit: 'target 11–14 today', value: '6.5', small: '/21', extra: `<span style="display:block;margin-top:12px">${gauge(38.1, 61.9, 31, true)}</span>${axis(['0', 'the band is today’s target', '21'])}` }), 'goal');
    return `<div class="full-photo fade" style="${img('run')};bottom:auto;height:430px;background-position:center 80%"></div>
    ${status('on-photo')}
    <header class="bar on-photo"><span class="chip onphoto">${ic('fitness', 's14')}Run</span><span class="chip onphoto">${ic('pulse', 's14')}Polar H10 · Bluetooth</span></header>
    <div class="on-photo" style="height:232px;flex:none;position:relative;z-index:2;padding:8px 20px 0;text-align:right">
      <span class="callout" style="color:var(--on-photo2)">${paused ? 'Paused' : 'Moving time'}</span>
      <div class="xl" style="margin-top:2px">24:10</div>
    </div>
    <div class="sheet" style="flex:1;min-height:0;display:flex;flex-direction:column;padding-top:20px">
      <div class="between" style="align-items:flex-end"><div><div class="micro">HEART RATE</div><div style="display:flex;align-items:baseline;gap:5px;margin-top:4px"><span class="num">157</span><span class="callout">bpm</span></div></div><span class="title" style="margin-bottom:6px">Zone 3</span></div>
      <div class="ba-zones mt12">${['Z1', 'Z2', 'Z3', 'Z4', 'Z5'].map(z => `<span class="${z === 'Z3' ? 'ba-here' : ''}">${z}</span>`).join('')}</div>
      <div class="mt16">${loadTile}</div>
      <div style="flex:1;min-height:12px"></div>
      <div class="player" style="justify-content:center;margin-top:0"><button class="big press" data-set="${paused ? '' : 'paused'}" aria-label="${paused ? 'Resume' : 'Pause'}">${ic(paused ? 'play' : 'pause')}</button></div>
      <div style="margin-top:10px">${btn('End workout', { ghost: true })}</div>
    </div>`;
  }

  /* ── 12. Workouts we spotted: one at a time, one decision ─ */
  const SPOTTED = [
    { name: 'Run', mins: '32 min', when: '07:10', bpm: 'avg 148 bpm', load: '6.1', types: ['Run', 'Walk', 'Gym', 'Other'], hr: [64, 66, 68, 96, 128, 142, 149, 152, 150, 151, 147, 149, 138, 104, 86, 76, 72, 70], lo: 58, hi: 76, ends: ['06:55', '07:55'] },
    { name: 'Cycle', mins: '21 min', when: '18:20', bpm: 'avg 131 bpm', load: '3.4', types: ['Cycle', 'Walk', 'Gym', 'Other'], hr: [70, 72, 74, 98, 118, 128, 133, 135, 131, 134, 126, 104, 88, 80, 76], lo: 60, hi: 80, ends: ['18:10', '18:55'] },
  ];
  const KIND = { Run: ['a run', 'run', 'background-position:center 53%'], Walk: ['a walk', 'walk', 'background-position:center 34%'], Cycle: ['a ride'], Gym: ['a gym session'], Other: ['something else'] };
  function detected(s) {
    if (s === 'done') return `${status()}${pushBar('Spotted activity')}
    <div class="scroll" style="display:flex;flex-direction:column"><div class="rise" style="flex:1;display:flex;flex-direction:column;justify-content:center">
      <div style="display:grid;place-items:center">${orb('done', 72)}</div>
      <p class="display" style="text-align:center;margin-top:20px"><b>Both sorted.</b> Nothing else is waiting.</p>
      <div class="card pad16 rows mt24">${SPOTTED.map(a => row('fitness', `${a.name} · ${a.mins}`, `${a.when} · ${a.bpm}`, `<span class="end">${a.load}</span>`)).join('')}</div>
      <p class="callout mt16" style="text-align:center">life asks once about each one, then leaves it.</p>
    </div></div>
    <div class="drawer"><h3>Logged.</h3><p>2 workouts are in today’s load.</p><div class="decide"><button class="side press" data-set="" style="width:auto;padding:0 18px;font-size:14px;font-weight:600">Undo</button></div></div>`;
    const p = (s || '0.0').split('.'), k = Number(p[0]), t = Number(p[1]), a = SPOTTED[k], b = SPOTTED[1];
    const type = a.types[t], [as, photo, crop] = KIND[type], facts = `${a.when} · ${a.mins} · ${a.bpm}`;
    const top = photo
      ? `<div class="pcard" style="${img(photo)};height:150px;border-radius:14px;${crop}"><span class="topline"><span class="chip onphoto">Spotted · ${k + 1} of 2</span><span class="chip onphoto">load ${a.load}</span></span><span class="copy"><b>${type}?</b><span>${facts}</span></span></div>`
      : `<div class="tile tint goal" style="min-height:150px;border-radius:14px;box-shadow:none;justify-content:space-between"><span class="between"><span class="chip" style="background:var(--surface)">Spotted · ${k + 1} of 2</span><span class="chip" style="background:var(--surface)">load ${a.load}</span></span><span style="display:flex;align-items:center;gap:12px"><span class="badge">${ic('fitness', 's18')}</span><span><b class="headline" style="display:block">${type}?</b><span class="callout">${facts}</span></span></span></div>`;
    return `${status()}${pushBar('Spotted activity')}
    <div class="scroll"><div class="rise">
      ${k ? `<span class="chip done">${ic('check', 's14')}1 of 2 logged</span>` : ''}
      <p class="display">Looks like you moved <b>twice</b> without logging it.</p>
      <div class="stack mt20" ${k ? 'style="padding-top:0"' : ''}>
        ${k ? '' : `<div class="peek" style="top:18px;left:10px;right:10px"><span>${b.name}? · ${b.when} · ${b.mins}</span><span>2</span></div>`}
        <div class="card" style="padding:12px">
          ${top}
          <div class="mt12">${line(a.hr, a.lo, a.hi, { h: 70, label: 'Heart rate during the spotted activity, against your usual range at rest' })}</div>
          <div class="ba-axis"><span>${a.ends[0]}</span><span>band = your usual at rest</span><span>${a.ends[1]}</span></div>
          <div class="filters mt16">${a.types.map((n, j) => `<button data-set="${k}.${j}" aria-pressed="${j === t}">${n}</button>`).join('')}</div>
        </div>
      </div>
    </div></div>
    <div class="drawer"><h3>Log this as ${as}?</h3><p>${a.mins} · load ${a.load}. You decide.</p><div class="decide"><button class="side press" aria-label="Not a workout">${ic('close', 's18')}</button><i class="dotsep"></i><i class="dotsep"></i><button class="knob press" data-set="${k ? 'done' : '1.0'}" aria-label="Confirm">${ic('check')}</button><i class="dotsep"></i><i class="dotsep"></i><button class="side press" aria-label="Ask life first">${ic('help', 's18')}</button></div></div>`;
  }

  /* ── 13. Sleep planner: the answer on the photograph, then two small choices ─ */
  const WAKES = [390, 420, 450, 480];
  const RECS = [['Minimum', 420, 'gets you by'], ['Enough', 485, 'your usual need'], ['Full recovery', 525, 'pays back today’s debt']];
  function sleepplan(s) {
    const p = (s || '1.1').split('.'), w = Number(p[0]), r = Number(p[1]), rem = p[2] === 'r';
    const st = (w2, r2, rem2) => `${w2}.${r2}${rem2 ? '.r' : ''}`;
    const fmt = m => { const t = ((m % 1440) + 1440) % 1440; return String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0'); };
    const dur = m => m < 60 ? `${m} min` : `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
    const wake = WAKES[w], [, need, why] = RECS[r], bed = wake - need - 14;
    const rel = t => { const d = (((t - 1260) % 1440) + 1440) % 1440; return d > 720 ? 0 : d; }, pos = t => r1(rel(t) / 7.2);
    const gap = rel(bed) - 110;
    const habit = gap === 0 ? 'right on your usual 22:50' : `${dur(Math.abs(gap))} ${gap < 0 ? 'earlier' : 'later'} than your usual 22:50`;
    const slot = k => WAKES[k] === undefined ? '<button aria-pressed="false" style="visibility:hidden" tabindex="-1">00:00</button>' : `<button data-set="${st(k, r, rem)}" aria-pressed="${k === w}">${fmt(WAKES[k])}</button>`;
    const stop = (label, time) => `<div><small>${label}</small><b>${time}</b></div>`;
    return `${status()}${pushBar('Plan tonight')}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('bedroom')};height:186px;background-position:center 80%"><span class="topline"><span class="chip onphoto">Be in bed by</span></span><span class="copy"><b style="font-size:56px;line-height:58px;letter-spacing:-2.5px;font-variant-numeric:tabular-nums">${fmt(bed)}</b><span>Includes 14 min to fall asleep · ${habit}</span></span></div>
      <div class="card pad16 tint work mt12">
        <div class="ba-night" role="img" aria-label="Tonight: in bed at ${fmt(bed)}, up at ${fmt(wake)}"><i class="ba-bell" style="left:${pos(bed - 45)}%"></i><i class="ba-doze" style="left:${pos(bed)}%;width:${r1(pos(bed + 14) - pos(bed) + 1.6)}%"></i><i style="left:${pos(bed + 14)}%;width:${r1(pos(wake) - pos(bed + 14))}%"></i></div>
        <div class="ba-legend" style="margin-top:14px">${stop('Reminder', fmt(bed - 45))}${stop('In bed', fmt(bed))}${stop('Asleep by', fmt(bed + 14))}${stop('Up', fmt(wake))}</div>
      </div>
      <div class="micro mt20">I NEED TO WAKE AT</div>
      <div class="wheel mt8" style="padding:8px 0">${[w - 1, w, w + 1].map(slot).join('')}</div>
      <div class="micro mt16">HOW RECOVERED</div>
      <div class="seg mt8" role="group">${RECS.map((o, k) => `<button data-set="${st(w, k, rem)}" aria-pressed="${k === r}">${o[0]}</button>`).join('')}</div>
      <p class="callout mt8" style="text-align:center">${dur(need)} asleep · ${why}</p>
    </div></div>${foot(rem ? btn(`Reminder set for ${fmt(bed - 45)}`, { icon: 'check', ghost: true, set: st(w, r, false) }) : btn('Remind me 45 min before', { icon: 'bell', set: st(w, r, true) }))}`;
  }

  /* ── 14. How scores work: one score opened up, the rest a tap away ─ */
  function math() {
    const how = (parts, text, based) => `${parts ? `<div class="ba-sum">${parts.map(p => chip(p)).join(ic('add', 's14'))}</div>` : ''}<p class="body ${parts ? 'mt12' : ''}">${text}</p><p class="callout mt8">Based on: ${based}</p>`;
    const part = (o, name, pct, sub) => `<div><small><i class="ba-key" style="background:var(--ac);opacity:${o}"></i>${name}</small><b>${pct}</b><em>${sub}</em></div>`;
    return `${status()}${pushBar('How scores work')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">${ic('shield', 's14')}Body · the maths</span>
      <p class="display"><b>Nothing is a black box.</b> Every number compares you with yourself.</p>
      <div class="card tint health mt24">
        <div class="between"><span style="display:flex;align-items:center;gap:10px"><span class="badge">${ic('heart', 's18')}</span><span class="title">Readiness</span></span><span class="chip" style="background:var(--surface)">Personal baseline</span></div>
        <div class="ba-split mt16" role="img" aria-label="Readiness is 40% heart rate variability, 25% resting heart rate, 25% sleep and 10% breathing rate">${[[40, 1], [25, .65], [25, .42], [10, .24]].map(([f, o]) => `<i style="flex:${f} 1 0px;opacity:${o}"></i>`).join('')}</div>
        <div class="ba-legend mt12">${part(1, 'HRV', '40%', 'vs 60 days')}${part(.65, 'Resting', '25%', 'heart rate')}${part(.42, 'Sleep', '25%', 'performance')}${part(.24, 'Breath', '10%', 'rate')}</div>
        <p class="callout mt16">Shown after 14 days. Based on: HRV time-domain standards (Task Force, 1996)</p>
      </div>
      <p class="body mt20">Badges show how far to trust each one. They change as life checks each score against reference devices.</p>
      <div class="mt16">
        ${acc('HRV', 'Personal baseline', how(null, 'RMSSD from beat-to-beat data, or SDNN where only that is available; never mixed.', 'Task Force, 1996'))}
        ${acc('Load', 'Estimate', how(null, 'Heart-rate-zone minutes weighted by zone, scaled 0–21.', 'Karvonen heart-rate reserve; Edwards TRIMP'))}
        ${acc('Sleep need', 'Estimate', how(['Your learned baseline', 'A third of recent debt', 'A load adjustment'], 'For you tonight that comes to about <b>8h 05m</b>.', 'Population range 7–9 h (NHS)'), true)}
        ${acc('Body signals', 'Personal baseline', how(null, 'Each signal’s distance from your own normal range.', 'Personal baseline z-scores'))}
        ${acc('Stress', 'Estimate', how(null, 'Heart rate above resting with lower HRV while still.', 'Estimate; checked against how you say you felt'))}
      </div>
      <p class="callout mt16">Not a medical device. Not affiliated with any wearable brand.</p>
    </div></div>`;
  }

  /* ── 15. Ask about your body: an answer that shows its numbers ─ */
  function coach() {
    const used = (name, value, sub) => `<div><small>${name}</small><b>${value}</b><em>${sub}</em></div>`;
    return `${status()}${pushBar('Ask about your body', round('clock', { label: 'Earlier questions' }), 'close')}
    <div class="scroll"><div class="rise chatcol">
      <span class="micro" style="justify-content:center">SAT 7 NOV · 08:12</span>
      ${bubble('Why do I feel flat today?')}
      <div>
        <div class="eyebrow">${orb('ring', 18)}life</div>
        <p class="statement mt8">Three things line up: <b class="nw">${ic('moon')}5h 50m of sleep</b>, a <b>late caffeine</b> tag, and your <b>skin temperature</b> is up 0.6°C. <b>Keep today light.</b></p>
      </div>
      <div class="card pad16 tint health">
        <div class="micro">THE NUMBERS I USED</div>
        <div class="ba-legend mt12" style="grid-template-columns:repeat(3,1fr)">${used('Sleep · Low', '5h 50m', 'need 8h 05m')}${used('Readiness · Low', '41', 'below your normal')}${used('Signals · Watch', '3', 'off normal')}</div>
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:8px">${['Make today lighter', 'Plan tonight’s sleep', 'Am I getting ill?'].map(t => `<button class="ba-ask press">${t}</button>`).join('')}</div>
    </div></div>
    <div class="foot" style="padding-top:0"><div class="composer"><p class="q">Ask about your body</p><button class="round sm solid press" aria-label="Talk instead">${ic('mic', 's16')}</button></div><span class="callout" style="text-align:center">Health answers use your data and NHS guidance. If you feel unwell, call NHS 111.</span></div>`;
  }

  /* ── 16. Tomorrow's forecast: tonight's choice, tomorrow's range ─ */
  const BEDS = [['22:45', 68, 'High enough for your run', 'run', 'background-position:center 53%'], ['23:30', 61, 'Fine for a normal day', 'desk', 'background-position:center'], ['00:30', 52, 'Plan a lighter day', 'calmdesk', 'background-position:center 85%']];
  function forecast(s) {
    const k = Number(s) || 0, [bedtime, score, means, photo, crop] = BEDS[k];
    const past = [58, 63, 55, 66, 61, 64, 72], days = ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Today'];
    const x = i => 10 + i * 31, y = v => r1(118 - (v - 45) / 35 * 104), xt = 248;
    const ray = (v, on) => `<line x1="${x(6)}" y1="${y(72)}" x2="${xt}" y2="${y(v)}" stroke="var(--ac)" opacity="${on ? 1 : .3}" stroke-width="2" stroke-linecap="round"/>`;
    const fan = `<svg class="caps" style="height:150px" viewBox="0 0 290 150" role="img" aria-label="Readiness over the last 7 days against your normal range, and tomorrow’s estimate for three bedtimes">
      <rect x="0" y="${y(66)}" width="290" height="${r1(y(55) - y(66))}" rx="10" fill="var(--surface)"/>
      <rect x="${xt - 9}" y="${r1(y(68) - 9)}" width="18" height="${r1(y(52) - y(68) + 18)}" rx="9" fill="var(--ac)" opacity=".22"/>
      ${BEDS.map((o, j) => j === k ? '' : ray(o[1], false)).join('')}${ray(score, true)}
      <polyline points="${past.map((v, i) => x(i) + ',' + y(v)).join(' ')}" fill="none" stroke="var(--ac)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
      <circle cx="${x(6)}" cy="${y(72)}" r="5" fill="var(--ac)"/>
      ${BEDS.map((o, j) => `<circle cx="${xt}" cy="${y(o[1])}" r="${j === k ? 6 : 3.5}" fill="var(--${j === k ? 'ember' : 'ink2'})"/><text x="${xt + 16}" y="${r1(y(o[1]) + 4)}" font-size="11" font-weight="600" fill="var(--${j === k ? 'ink' : 'quiet'})">${o[1]}</text>`).join('')}
      ${days.map((d, i) => `<text x="${x(i)}" y="146" text-anchor="middle" font-size="11" font-weight="600" fill="var(--quiet)">${d}</text>`).join('')}
      <text x="${xt}" y="146" text-anchor="middle" font-size="11" font-weight="600" fill="var(--ink)">Tomorrow</text>
    </svg>`;
    return `${status()}${pushBar('Tomorrow', round('info', { label: 'How the forecast works' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Tomorrow’s readiness</span>
      ${fig(`<small style="margin:0 6px 0 0">about</small>${score}`, chip('Estimate', 'q'))}
      <div class="pcard mt16" style="${img(photo)};height:156px;${crop}"><span class="topline"><span class="chip onphoto">If you’re in bed by ${bedtime}</span></span><span class="copy"><b>${means}</b><span>Tomorrow’s readiness should be about ${score}.</span></span></div>
      <div class="card tint health mt12">
        ${fan}
        <p class="callout mt8">The band is your normal range. Tomorrow can land from 52 to 68. An estimate from your last 60 nights.</p>
      </div>
      <div class="micro mt20">IN BED BY</div>
      <div class="seg mt8" role="group">${BEDS.map((o, j) => `<button data-set="${j}" aria-pressed="${j === k}">${o[0]}</button>`).join('')}</div>
    </div></div>${foot(btn('Plan tonight', { icon: 'moon' }))}`;
  }

  /* ── 17. Cycle-aware readiness: kind and plain ───────── */
  function cycle() {
    let day = 0;
    const strip = [['Period', 5], ['Follicular', 8], ['Ovul.', 3], ['Luteal', 12]].map(([name, n]) => {
      const cells = Array.from({ length: n }, () => { day += 1; return `<i class="${day < 22 ? 'on' : day === 22 ? 'now' : ''}"></i>`; }).join('');
      return `<div class="ba-ph ${name === 'Luteal' ? 'ba-cur' : ''}" style="flex:${n} 1 0px"><span>${cells}</span><small>${name}</small></div>`;
    }).join('');
    const expected = `<span class="chip q" style="align-self:flex-start;margin-top:12px">Expected</span>`;
    return `${status()}${pushBar('Cycle')}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('walk')};height:236px;background-position:center 42%"><span class="topline"><span class="chip onphoto">Day 22 · from Apple Health</span><span class="chip onphoto">${ic('eyeOff', 's14')}Private</span></span><span class="copy"><b style="font-size:30px;line-height:34px;letter-spacing:-.9px">Luteal phase</b><span>A good day for steady effort. Sleep need is about 20 minutes higher this week.</span></span></div>
      <div class="card tint health mt12">
        ${head('calendar', 'Day 22', 'each dot is a day')}
        <div class="ba-cyc mt16" role="img" aria-label="Day 22 of your cycle, in the luteal phase">${strip}</div>
      </div>
      <div class="tiles mt12">
        ${tile({ plain: true, label: 'Skin temperature', value: '+0.3', small: '°C', sub: 'Normal for this phase, so not flagged', extra: expected })}
        ${tile({ plain: true, label: 'Resting heart rate', value: '+3', small: 'bpm', sub: 'Normal for this phase', extra: expected })}
        ${tile({ plain: true, wide: true, label: 'Readiness', unit: '/100', value: '64', sub: 'Compared with your luteal-phase baseline' })}
      </div>
      <p class="callout mt16">Off by default. Stays on your phone. Not for contraception or diagnosis.</p>
    </div></div>`;
  }

  K.screen('devices', { from: '17, 12', note: 'The one source that is on leads, softly tinted, with a switch for each kind of data. Other sources are grouped by what they need from you.', build: devices });
  K.screen('sleep', { from: '20, 12, 14', note: 'One figure, tonight as a photograph of the bedroom, the night as a skyline of stages, then the week against what you needed.', build: sleep });
  K.screen('load', { from: '16, 13, 14', note: 'One figure, the week as bars with today’s sweet spot as a band behind them, and what made today’s number as two photographs.', build: load });
  K.screen('trends', { from: '3, 20, 14', note: 'The strongest pattern is the sentence. Sleep, readiness and mood sit side by side against your normal; two more patterns are pictures.', build: trends });
  K.screen('hrv', { from: '20, 13', note: 'One reading in full: the figure, 30 days against your normal band, what moves it, and where it came from.', build: hrv });
  K.screen('signals', { from: '12, 13, 20', note: 'Four small tiles, each showing where you sit in your own range. Tap the last row to see the gentle flag when three drift.', build: s => signals(s === 'drift') });
  K.screen('stress', { from: '20, 13, 14', note: 'One figure, the day in half hours against where you usually sit, and the breathing reset as a photograph to tap.', build: stress });
  K.screen('breathe', { from: '14, 4, 9', note: 'A calm photograph on top, then air: the orb is the breathing guide and the time is the only figure. Tap Start, then End early.', build: breathe });
  K.screen('journal', { from: '11, 5, 14', note: 'One question on a photograph, tags you tap on and off, and 14 dots counting evenings logged. Tap a tag, then Save.', build: journal });
  K.screen('insights', { from: '3, 16, 13', note: 'What the journal found, as one sentence and a two-way chart: what tends to help and what tends to cost.', build: insights });
  K.screen('workout', { from: '14, 4, 12', note: 'The run fills the top with a big timer on the sky. Below: heart rate, the current zone picked out, load against today’s target. Tap pause.', build: workout });
  K.screen('detected', { from: '18, 19, 14', note: 'Spotted workouts come one at a time, as a photograph with the heart-rate trace, and the dark drawer asks once. Tap Walk, then the tick twice.', build: detected });
  K.screen('sleepplan', { from: 'video, 14, 6', note: 'The bedtime is the answer, on the photograph. Pick a wake time and how recovered you want to be, and it works itself out.', build: sleepplan });
  K.screen('math', { from: '17, 13', note: 'Readiness opened up as a weighted bar, then every other score in a section that opens. Tap a section.', build: math });
  K.screen('coach', { from: '7, 3, 9', note: 'Your question, life’s answer as one sentence, then the numbers it used and three next steps.', build: coach });
  K.screen('forecast', { from: '20, 16, 14', note: 'The week so far fans out into tomorrow’s range, and a photograph shows what that day is good for. Tap a bedtime.', build: forecast });
  K.screen('cycle', { from: '14, 5, 12', note: 'The phase in plain words on a photograph, the cycle counted in dots, and the changes that are expected so are not flagged.', build: cycle });
})();
