// life · V26 — Body readings, habits and Know yourself. Written against review/v26/KIT.md.
(() => {
  'use strict';
  const K = window.L26;
  const { ic, img, status, round, pushBar, sheetBar, foot, btn, secHead, chip, orb, says, row, tile, metric, pick, toggle, seg, days14, line } = K;

  K.addCss('.bb-', `
.bb-head { display: flex; align-items: center; gap: 10px; font-size: 14px; line-height: 20px; font-weight: 600; }
.bb-ticks { position: relative; height: 14px; margin-top: 8px; }
.bb-ticks span { position: absolute; top: 0; transform: translateX(-50%); font-size: 11px; line-height: 13px; font-weight: 600; color: var(--ink2); font-variant-numeric: tabular-nums; white-space: nowrap; }
.bb-range { position: relative; height: 16px; border-radius: 8px; background: var(--surface2); margin-top: 16px; }
.bb-range i { position: absolute; top: 0; bottom: 0; border-radius: 8px; background: var(--ink); opacity: .2; }
.bb-range b { position: absolute; top: -4px; width: 24px; height: 24px; margin-left: -12px; border-radius: 50%; background: var(--surface); box-shadow: inset 0 0 0 7px var(--ink); }
.bb-range.bb-ont { background: var(--surface); }
.bb-range.bb-ont i { background: var(--ac); opacity: .4; }
.bb-ages { display: grid; grid-template-columns: repeat(11, 1fr); margin-top: 20px; }
.bb-ages span { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 8px; height: 48px; font-size: 11px; line-height: 13px; font-weight: 600; color: var(--quiet); font-variant-numeric: tabular-nums; }
.bb-ages i { width: 12px; height: 12px; margin: 5px 0; border-radius: 50%; background: var(--surface3); }
.bb-ages .bb-mid i { background: var(--ink2); }
.bb-ages .bb-fit i { width: 22px; height: 22px; margin: 0; background: var(--ember); }
.bb-ages .bb-you i { width: 22px; height: 22px; margin: 0; background: none; box-shadow: inset 0 0 0 3px var(--ink); }
.bb-ages .bb-fit, .bb-ages .bb-you { color: var(--ink); }
.bb-rc { display: flex; align-items: center; gap: 10px; min-height: 42px; font-size: 15px; line-height: 22px; letter-spacing: -.12px; color: var(--ink2); }
.bb-rc i { flex: 1; height: 4px; background: radial-gradient(circle, var(--surface3) 1.6px, transparent 2px) left center/10px 4px repeat-x; }
.bb-rc b { display: inline-flex; align-items: center; gap: 8px; color: var(--ink); font-weight: 600; }
.bb-src + .bb-src { margin-top: 10px; }
.bb-src .bb-rc { min-height: 30px; }
.bb-src strong { color: var(--ink); font-weight: 600; white-space: nowrap; }
.bb-src b { white-space: nowrap; }
.bb-duel { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 16px; }
.bb-duel div { border-radius: 16px; padding: 12px 14px 14px; background: var(--surface); }
.bb-duel small { display: flex; align-items: center; justify-content: space-between; font-size: 13px; line-height: 18px; font-weight: 500; color: var(--ink2); }
.bb-duel b { display: block; margin-top: 6px; font-size: 24px; line-height: 31px; font-weight: 600; letter-spacing: -.53px; font-variant-numeric: tabular-nums; }
.bb-duel .bb-used { background: var(--ink); color: var(--canvas); }
.bb-duel .bb-used small { color: var(--canvas); }
.bb-deci { display: flex; gap: 3px; height: 28px; margin-top: 14px; }
.bb-deci i { flex: 1; border-radius: 2px; background: var(--surface); }
.bb-deci i.bb-on { background: var(--ac); }
.bb-hyp { display: grid; grid-template-columns: 44px 1fr; gap: 8px 10px; align-items: center; margin-top: 16px; }
.bb-hyp small { font-size: 11px; line-height: 13px; font-weight: 600; color: var(--ink2); }
.bb-lane { position: relative; height: 16px; border-radius: 8px; background: var(--surface); }
.bb-lane i { position: absolute; top: 0; bottom: 0; min-width: 5px; border-radius: 8px; background: var(--ac); opacity: .4; }
.bb-lane.bb-deep i { opacity: 1; }
.bb-low { display: flex; align-items: center; gap: 6px; font-size: 11px; line-height: 13px; font-weight: 600; color: var(--ink2); white-space: nowrap; }
.bb-low i { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--ink); }
.bb-split { display: flex; gap: 4px; height: 16px; margin-top: 14px; }
.bb-split i { border-radius: 8px; background: var(--ac); }
.bb-zone { display: grid; grid-template-columns: 88px 1fr 50px; gap: 10px; align-items: center; padding: 8px 0; }
.bb-zone b { display: block; font-size: 15px; line-height: 21px; font-weight: 600; letter-spacing: -.15px; }
.bb-zone small { font-size: 13px; line-height: 18px; font-weight: 500; color: var(--ink2); font-variant-numeric: tabular-nums; }
.bb-zone i { display: block; height: 24px; min-width: 24px; border-radius: 12px; background: var(--ac); opacity: .35; }
.bb-zone.bb-now i { opacity: 1; }
.bb-zone em { font-style: normal; text-align: right; font-size: 15px; font-weight: 600; font-variant-numeric: tabular-nums; }
.bb-gauge { display: flex; align-items: flex-end; gap: 3px; height: 64px; margin-top: 16px; }
.bb-gauge i { flex: 1; height: 34px; border-radius: 2px; background: var(--surface); }
.bb-gauge i.bb-on { height: 64px; background: var(--ink); }
.bb-gauge i.bb-aim { height: 64px; background: var(--ac); }
.bb-sigrow { margin-top: 16px; }
.bb-sigrow strong { font-size: 15px; line-height: 21px; font-weight: 600; letter-spacing: -.15px; }
.bb-sigrow span { font-size: 13px; line-height: 18px; color: var(--ink2); font-variant-numeric: tabular-nums; }
.bb-sigrow .bb-range { margin-top: 8px; }
.bb-sig { width: 6px; height: 6px; border-radius: 50%; background: var(--ember); }
.bb-breath { display: flex; flex-direction: column; width: 100%; min-height: 172px; padding: 14px 16px 16px; border-radius: 20px; background-color: var(--surface); box-shadow: var(--shadow); }
.bb-breath .title { margin-top: auto; }
.bb-pat { display: flex; align-items: center; gap: 4px; height: 56px; margin: 6px 0; }
.bb-pat i { flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--ink); }
.bb-pat i.bb-h { background: none; box-shadow: inset 0 0 0 2px var(--ink2); }
.bb-pat i.bb-o { background: var(--surface3); }
.bb-pat i.bb-big { width: 14px; height: 14px; }
.bb-pat i.bb-long { width: 48px; border-radius: 4px; }
.bb-pat i.bb-x { background: none; }
.bb-pat.bb-box { display: grid; grid-template-columns: repeat(5, 8px); align-content: center; }
.bb-pat.bb-rows { flex-direction: column; align-items: flex-start; justify-content: center; }
.bb-pat.bb-rows span { display: flex; gap: 3px; }
.bb-pat.bb-rows i { width: 7px; height: 7px; }
.bb-pat.bb-fine { gap: 3px; }
.bb-pat.bb-fine i { width: 7px; height: 7px; }
.bb-pat.bb-onp { height: 20px; margin: 0 0 10px; }
.bb-pat.bb-onp i { background: var(--on-photo); }
.bb-pat.bb-onp i.bb-o { background: var(--on-photo2); }
.bb-cmp { margin-top: 12px; }
.bb-cmp small { display: block; font-size: 13px; line-height: 18px; font-weight: 500; color: var(--ink2); }
.bb-cmp span { display: flex; align-items: center; gap: 4px; margin-top: 6px; }
.bb-cmp i { height: 18px; border-radius: 9px; background: var(--ink); opacity: .2; }
.bb-cmp b { width: 20px; height: 18px; border-radius: 9px; background: var(--ink); }
.bb-cmp em { margin-left: 6px; font-style: normal; font-size: 13px; line-height: 18px; font-weight: 600; }
.bb-d14 { display: flex; gap: 3px; margin-top: 8px; }
.bb-d14 i { width: 6px; height: 6px; border-radius: 50%; background: var(--photo-fill); }
.bb-d14 i.bb-on { background: var(--on-photo); }
.bb-blank { display: inline-block; width: 112px; height: 28px; border-radius: 10px; background: var(--surface3); vertical-align: -4px; }
.bb-shelf { display: flex; flex-direction: column; width: 100%; border-radius: 20px; overflow: hidden; background-color: var(--surface); box-shadow: var(--shadow); }
.bb-shelf .bb-ph { display: flex; align-items: flex-start; height: 92px; padding: 10px; background: var(--surface2) center/cover no-repeat; }
.bb-shelf .bb-tx { display: block; padding: 12px 14px 14px; }
.bb-shelf b { display: block; font-size: 16px; line-height: 21px; font-weight: 600; letter-spacing: -.22px; }
.bb-shelf small { display: block; margin-top: 2px; font-size: 11px; line-height: 13px; font-weight: 600; letter-spacing: .1px; color: var(--quiet); }
.bb-shelf em { display: block; margin-top: 8px; font-style: normal; font-size: 13px; line-height: 18px; color: var(--ink2); }
.bb-likert { position: relative; display: flex; align-items: center; justify-content: space-between; height: 60px; }
.bb-likert::before { content: ""; position: absolute; left: 28px; right: 28px; top: 28px; height: 4px; background: radial-gradient(circle, var(--surface3) 1.6px, transparent 2px) left center/10px 4px repeat-x; }
.bb-likert button { position: relative; display: grid; place-items: center; width: 44px; height: 44px; border-radius: 50%; background: var(--surface); box-shadow: var(--shadow); color: var(--canvas); }
.bb-likert button.bb-l2 { width: 56px; height: 56px; }
.bb-likert button.bb-l0 { width: 36px; height: 36px; }
.bb-likert button[aria-pressed="true"] { background: var(--ink); }
.bb-tr + .bb-tr { margin-top: 18px; }
.bb-tr strong { font-size: 15px; line-height: 21px; font-weight: 600; letter-spacing: -.15px; }
.bb-tr span { font-size: 13px; line-height: 18px; color: var(--ink2); }
.bb-trait { position: relative; display: flex; align-items: center; justify-content: space-between; height: 22px; margin-top: 8px; }
.bb-trait i { width: 5px; height: 5px; border-radius: 50%; background: var(--ac); opacity: .4; }
.bb-trait i.bb-avg { width: 2px; height: 18px; border-radius: 1px; background: var(--ink2); opacity: 1; }
.bb-trait em { position: absolute; top: 2px; width: 18px; height: 18px; margin-left: -9px; border-radius: 50%; background: var(--ink); }
.bb-so { display: flex; align-items: center; gap: 6px; margin-top: 6px; }
.bb-day { position: relative; height: 56px; margin-top: 16px; border-radius: 18px; background: var(--surface); }
.bb-day span { position: absolute; top: 6px; bottom: 6px; display: grid; place-items: center; border-radius: 12px; background: var(--t); color: var(--ink); }
.bb-day span.bb-deep { background: var(--ac); color: var(--surface); }
`);

  /* ── Small parts shared by these screens ─────────────── */
  const r1 = n => Math.round(n * 10) / 10;
  const svg = (h, label, inner) => `<svg class="caps" style="height:${h}px" viewBox="0 0 330 ${h}" role="img" aria-label="${label}">${inner}</svg>`;
  const head = (icon, label, right = '') => `<div class="between"><span class="bb-head"><span class="badge">${ic(icon, 's18')}</span>${label}</span>${right}</div>`;
  const figure = (value, unit, chipHtml) => `<div class="between" style="align-items:flex-end;margin-top:6px"><div class="xl">${value}${unit ? `<small>${unit}</small>` : ''}</div><span style="margin-bottom:10px">${chipHtml}</span></div>`;
  const ticks = marks => `<div class="bb-ticks" aria-hidden="true">${marks.map(([p, t]) => `<span style="left:${p}%${p === 0 ? ';transform:none' : p === 100 ? ';transform:translateX(-100%)' : ''}">${t}</span>`).join('')}</div>`;
  const range = (from, to, at, onTint) => `<div class="bb-range ${onTint ? 'bb-ont' : ''}" aria-hidden="true"><i style="left:${from}%;width:${r1(to - from)}%"></i><b style="left:${at}%"></b></div>`;
  const small = 'font-size:16px;line-height:21px;letter-spacing:-.22px';
  const mid = 'font-size:20px;line-height:26px;letter-spacing:-.4px';

  /* ── Fitness age ─────────────────────────────────────── */
  function fitnessage() {
    const ages = Array.from({ length: 11 }, (_, k) => 20 + k).map(a => `<span class="${a === 24 ? 'bb-fit' : a === 27 ? 'bb-you' : a > 24 && a < 27 ? 'bb-mid' : ''}"><i></i>${a}</span>`).join('');
    return `${status()}${pushBar('Fitness age', round('info', { label: 'How fitness age works' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">You’re 27. Your fitness age:</span>
      ${figure('24', '', chip('Estimate', 'q'))}
      <div class="bb-ages" aria-hidden="true">${ages}</div>
      <div class="legend mt12"><span><i style="background:var(--ember)"></i>Fitness age</span><span><i style="box-shadow:inset 0 0 0 2px var(--ink)"></i>Your age</span></div>
      <p class="statement mt20"><b>Two Zone 2 sessions a week</b> would likely take <b>another year off</b> by spring.</p>
      <div class="card tint health mt20">${head('heart', 'Last 6 months', '<span class="callout">Lower is fitter</span>')}
        <div class="mt12">${line([25.3, 25.2, 25, 24.7, 24.3, 24], 25, 25.3, { h: 96, color: 'var(--ac)', band: 'var(--surface)', label: 'Fitness age over the last six months, falling to 24' })}</div>
        <div class="times"><span>Jun</span><span>Nov</span></div>
        <p class="callout mt8">The band is where you were from June to August.</p></div>
      ${secHead('What moves it')}
      <div class="gap8">
        ${metric({ icon: 'pulse', name: 'VO₂ max', value: '44', unit: 'ml/kg/min', tag: ic('arrowUp', 's14') + '2', tone: 'done', delta: 'From Apple Watch', series: [42, 42, 43, 43, 44, 44], lo: 41.5, hi: 43 })}
        ${metric({ icon: 'heart', name: 'Resting heart rate', value: '54', unit: 'bpm', tag: ic('arrowDown', 's14') + '3', tone: 'done', delta: 'Lower usually means fitter', series: [57, 57, 56, 55, 55, 54], lo: 55.5, hi: 57.5 })}
        ${metric({ icon: 'walk', name: 'Zone 2 minutes', value: '160', unit: 'a week', tag: 'Keep it up', delta: 'Easy, steady effort', series: [140, 150, 145, 155, 165, 160], lo: 140, hi: 158 })}
      </div>
      <p class="callout mt16">An estimate from your VO₂ max, resting heart rate and activity. It goes down as your fitness improves.</p>
    </div></div>`;
  }

  /* ── Sources: one picture from all your devices ──────── */
  function sources() {
    const src = (name, dev, why, when) => `<div class="bb-src"><div class="bb-rc"><strong>${name}</strong><i></i><b>${dev}</b></div><div class="between"><span class="callout">${why}</span>${chip(when, 'q')}</div></div>`;
    return `${status()}${pushBar('Your sources')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">One picture from all your devices</span>
      <p class="display"><b>Five measures</b>, each from the device that <b>reads it best</b>.</p>
      <div class="card pad16 mt24"><div class="between"><span class="micro">Measure and source</span><span class="micro">Last synced</span></div>
        <div class="mt12">${src('Sleep', 'Oura ring', 'Best overnight', '07:02')}${src('HRV', 'Oura ring', 'Measured all night', '07:02')}${src('Workouts and heart rate', 'Garmin watch', 'Chest-strap accurate', '08:52')}${src('Steps', 'iPhone', 'Always with you', 'Just now')}${src('Weight', 'Smart scale', 'Via Apple Health', 'Yesterday')}</div></div>
      <div class="card tint work mt12">${head('moon', 'They disagreed last night', chip('Sleep'))}
        <div class="bb-duel"><div class="bb-used"><small>Oura ${ic('check', 's14')}</small><b>7h 12m</b></div><div><small>Garmin</small><b>7h 48m</b></div></div>
        <div class="mt16">${says('life used Oura: rings track sleep more closely than watches for most people.')}</div>
        <button class="link ink mt12" style="font-weight:600">Change it any time ${ic('chev', 's16')}</button></div>
    </div></div>`;
  }

  /* ── Glucose, after meals ────────────────────────────── */
  function glucose() {
    const H = 132, pts = [[6, 5.1], [7.4, 5], [8.2, 6.1], [9.2, 5.2], [11, 5], [12.6, 5.2], [13.5, 8.1], [14.6, 5.5], [16, 5.1], [18.6, 5.2], [19.4, 5.9], [20.3, 5.3], [22, 5.1]];
    const x = t => r1((t - 6) / 16 * 330), y = v => r1(H - 10 - (v - 4) / 4.6 * (H - 34));
    const P = pts.map(([t, v]) => [x(t), y(v)]);
    let d = `M${P[0][0]} ${P[0][1]}`;
    for (let k = 1; k < P.length - 1; k++) d += ` Q${P[k][0]} ${P[k][1]} ${r1((P[k][0] + P[k + 1][0]) / 2)} ${r1((P[k][1] + P[k + 1][1]) / 2)}`;
    d += ` L${P[P.length - 1][0]} ${P[P.length - 1][1]}`;
    const mark = (meal, at, v, text) => `<circle cx="${x(meal)}" cy="${H - 4}" r="3" fill="var(--ink)"/><text x="${x(at)}" y="${r1(y(v) - 8)}" text-anchor="middle" font-size="11" font-weight="600" fill="var(--ink)">${text}</text>`;
    return svg(H, 'Glucose through today: steady, apart from a bigger rise after lunch', `<rect x="0" y="${y(6.9)}" width="330" height="${r1(y(4.4) - y(6.9))}" rx="12" fill="var(--surface)"/><path d="${d}" fill="none" stroke="var(--ac)" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>${mark(12.67, 13.5, 7.6, 'Lunch')}${mark(18.75, 19.4, 6.1, 'Dinner, then a walk')}`);
  }
  function cgm() {
    return `${status()}${pushBar('Glucose', round('info', { label: 'About glucose' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Today · from your glucose sensor</span>
      <p class="display"><b>Steady</b> most of the day. One <b>bigger rise</b> after lunch.</p>
      <div class="card tint home mt24">${head('pulse', 'Glucose, lined up with your meals')}
        <div class="mt12">${glucose()}</div>
        ${ticks([[0, '6am'], [37.5, '12pm'], [75, '6pm']])}
        <p class="callout mt12">The band is your usual range. Dots mark when you ate.</p></div>
      <div class="pgrid mt12">
        <button class="pcard press" style="${img('food')};height:176px;background-position:38% 42%"><span class="topline"><span class="chip onphoto">Rise</span></span><span class="copy"><b style="${small}">Lunch: white rice bowl</b><span>Bigger rise, back to normal in 2h</span></span></button>
        <button class="pcard press" style="${img('walk')};height:176px;background-position:center 25%"><span class="topline"><span class="chip onphoto">Steady</span></span><span class="copy"><b style="${small}">Dinner, then a 10-min walk</b><span>Barely moved</span></span></button>
      </div>
      <div class="mt16">${says('The walk after dinner may be what kept you steady.')}</div>
      <p class="callout mt16">Wellness, not medical advice. life never diagnoses or advises on medication. Talk to your GP about anything worrying.</p>
    </div></div>`;
  }

  /* ── Water, sitting and recovery ─────────────────────── */
  function basics(s) {
    const litres = s === 'glass' ? 1.6 : s === 'bottle' ? 1.9 : 1.4, on = Math.round(litres * 10);
    return `${status()}${pushBar('Body basics')}
    <div class="scroll"><div class="rise">
      <p class="display"><b class="nw">${ic('water')}${litres} L</b> of 2.6 so far. Sitting for <b class="nw">${ic('clock')}1h 50m</b>. Recovery is <b>better than usual</b>.</p>
      <div class="card tint work mt24">${head('water', 'Water', '<span class="callout">of 2.6 L today</span>')}
        <div class="between mt12" style="align-items:flex-end"><span><span class="num">${litres}</span><span class="callout"> L</span></span>${chip((2.6 - litres).toFixed(1) + ' L to go')}</div>
        <div class="bb-deci" aria-hidden="true">${Array.from({ length: 26 }, (_, k) => `<i class="${k < on ? 'bb-on' : ''}"></i>`).join('')}</div>
        <p class="callout mt12">Higher today: you trained and it’s warm.</p>
        <div class="between mt16" style="gap:8px">${btn('+ Glass', { ghost: true, sm: true, set: 'glass' })}${btn('+ Bottle', { ghost: true, sm: true, set: 'bottle' })}</div></div>
      <button class="pcard press mt12" style="${img('desk')};height:150px;background-position:50% 30%"><span class="topline"><span class="chip onphoto">Sitting · 1h 50m</span></span><span class="copy"><b style="${mid}">A 3-minute walk now</b><span>Free in your calendar until 14:00.</span></span></button>
      <div class="mt12">${metric({ icon: 'heart', name: 'Heart-rate recovery', value: '31', unit: 'bpm', tag: 'Personal baseline', delta: 'Drop in the first minute after your run. Better than your 3-month average (27).', series: [26, 28, 27, 29, 28, 30, 31], lo: 25.5, hi: 28.5 })}</div>
      <p class="callout mt16">life never nudges you to move in the middle of a meeting.</p>
    </div></div>`;
  }

  /* ── One night, in stages ────────────────────────────── */
  const NIGHT = [['A', 5], ['L', 18], ['D', 34], ['L', 22], ['R', 12], ['L', 30], ['D', 30], ['L', 26], ['R', 22], ['A', 4], ['L', 20], ['D', 18], ['L', 42], ['R', 30], ['L', 40], ['D', 10], ['L', 22], ['R', 40], ['A', 4], ['L', 24]];
  function stages() {
    const total = NIGHT.reduce((sum, [, m]) => sum + m, 0), lanes = { A: '', R: '', L: '', D: '' };
    let at = 0;
    for (const [stage, m] of NIGHT) { lanes[stage] += `<i style="left:${r1(at / total * 100)}%;width:${r1(m / total * 100)}%"></i>`; at += m; }
    return `<div class="bb-hyp">${[['A', 'Awake'], ['R', 'REM'], ['L', 'Light'], ['D', 'Deep']].map(([k, n]) => `<small>${n}</small><div class="bb-lane ${k === 'D' ? 'bb-deep' : ''}">${lanes[k]}</div>`).join('')}<small></small><div class="bb-low" style="padding-left:calc(51.2% - 4px)"><i></i>49 bpm · 03:10</div></div>`;
  }
  function sleepnight() {
    return `${status()}${pushBar('Monday night')}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('bedroom')};height:230px;background-position:center 58%"><span class="topline"><span class="chip onphoto">23:18 → 06:51</span><span class="chip onphoto">Personal baseline</span></span><span class="copy"><b style="font-size:56px;line-height:58px;letter-spacing:-2.5px">7h 20m</b><span>Asleep · 94% of need</span></span></div>
      <p class="statement mt16"><b>94% of what you needed</b>, with <b>more deep sleep</b> than usual.</p>
      <div class="card tint work mt20">${head('moon', 'The night in stages', '<span class="callout">Deep picked out</span>')}
        ${stages()}
        <div class="times" style="padding-left:54px"><span>23:18</span><span>06:51</span></div></div>
      <div class="tiles mt12">
        ${tile({ label: 'Deep sleep', value: '1h 32m', sub: 'Above usual', plain: true })}
        ${tile({ label: 'Lowest heart rate', value: '49', small: 'bpm', sub: 'At 03:10', plain: true })}
      </div>
      <div class="card pad16 between mt12"><span><span class="micro">You noted, in your journal</span><span class="title" style="display:block;margin-top:4px">No caffeine after 2pm</span></span>${chip('Helped', 'done')}</div>
    </div></div>`;
  }

  /* ── A past workout, told as a short story ───────────── */
  function workoutdetail() {
    return `${status()}${pushBar('Run · Sunday')}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('run')};height:250px;background-position:center 73%"><span class="topline"><span class="chip onphoto">Mostly Zone 2</span></span><span class="copy"><b style="font-size:44px;line-height:48px;letter-spacing:-1.32px">5.2 km</b><span>28:40 · 5:31 /km</span></span></div>
      <p class="statement mt16">A <b>moderate load</b>, more than half of it easy, and your heart <b>settled fast</b> afterwards.</p>
      <div class="tl mt24">
        <div class="tl-item done"><div class="when">YOUR HEART, DURING</div>
          <div class="card tint goal pad16 mt8"><div class="cols" style="grid-template-columns:repeat(3,1fr)"><div><small>Zone 2</small><b>58%</b></div><div><small>Zone 3</small><b>30%</b></div><div><small>Zone 4</small><b>12%</b></div></div>
            <div class="bb-split" aria-hidden="true"><i style="flex:58"></i><i style="flex:30;opacity:.55"></i><i style="flex:12;opacity:.28"></i></div></div></div>
        <div class="tl-item done"><div class="when">THE MINUTE AFTER</div><p>Your heart rate dropped <b>31 bpm</b> in one minute.</p><span class="chip done" style="margin-top:8px">Good recovery</span></div>
        <div class="tl-item done"><div class="when">WHAT IT ADDED</div><p><b>11.4</b> load, a moderate day.</p></div>
      </div>
    </div></div>`;
  }

  /* ── Weight: a trend, not a daily verdict ────────────── */
  function weightChart() {
    const H = 130, n = 28, min = 73.4, max = 76.2;
    const tr = k => 75.36 - .0429 * k + .06 * Math.sin(k / 4), day = k => tr(k) + .34 * Math.sin(k * 2.3) + .2 * Math.cos(k * 1.1);
    const x = k => r1(8 + k * 314 / (n - 1)), y = v => r1(H - 8 - (v - min) / (max - min) * (H - 16));
    const ks = Array.from({ length: n }, (_, k) => k);
    const ribbon = ks.map(k => `${x(k)},${y(tr(k) + .5)}`).concat(ks.slice().reverse().map(k => `${x(k)},${y(tr(k) - .5)}`)).join(' ');
    return svg(H, 'Daily weigh-ins and the 7-day trend over four weeks', `<polygon points="${ribbon}" fill="var(--surface)" stroke="var(--surface)" stroke-width="10" stroke-linejoin="round"/>${ks.filter(k => k % 9 !== 5).map(k => `<circle cx="${x(k)}" cy="${y(day(k))}" r="2.6" fill="var(--ac)" opacity=".45"/>`).join('')}<polyline points="${ks.map(k => `${x(k)},${y(tr(k))}`).join(' ')}" fill="none" stroke="var(--ac)" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${x(n - 1)}" cy="${y(tr(n - 1))}" r="5" fill="var(--ac)"/>`);
  }
  function weight() {
    return `${status()}${pushBar('Weight')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">7-day trend</span>
      ${figure('74.2', 'kg', chip(ic('arrowDown', 's14') + '0.3 this week', 'q'))}
      <p class="statement mt12">A <b>trend</b>, not a daily verdict, so <b>water and salt</b> don’t mislead you.</p>
      <div class="card tint you mt20">${head('trend', 'Last 4 weeks')}
        <div class="mt12">${weightChart()}</div>
        <div class="times"><span>4 weeks ago</span><span>Today</span></div>
        <p class="callout mt12">Dots are daily weigh-ins; the line is the trend. The band is your normal day-to-day swing.</p></div>
      <div class="card pad16 between mt12"><span><span class="title" style="display:block">Show on Today</span><span class="callout">Off unless you ask</span></span>${toggle(false, 'Show on Today')}</div>
      <p class="callout mt16">Optional and hidden by default. life never puts your weight on Today unless you turn this on.</p>
    </div></div>`;
  }

  /* ── BMI and waist, explained ────────────────────────── */
  function bmi() {
    return `${status()}${pushBar('BMI and waist')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Waist-to-height · the better guide</span>
      ${figure('0.49', '', chip('Healthy', 'done'))}
      <p class="statement mt12">Your waist is <b>under half your height</b>, a <b>better guide</b> than BMI.</p>
      <div class="card tint you mt20">${head('person', 'Waist-to-height', '<span class="callout">84 cm ÷ 172 cm</span>')}
        ${range(0, 42.9, 40, true)}${ticks([[0, '0.35'], [42.9, '0.5'], [71.4, '0.6'], [100, '0.7']])}
        <p class="callout mt12">Under 0.5 is the healthy range.</p></div>
      <div class="card mt12"><div class="between"><span class="title">BMI</span>${chip('Rough guide', 'q')}</div>
        <div class="num mt8">25.1</div>
        ${range(13.2, 47.4, 47.9)}${ticks([[0, '16'], [13.2, '18.5'], [47.4, '25'], [73.7, '30'], [100, '35']])}
        <p class="callout mt12">Just over 25, but your waist and resting heart rate look healthy. Muscle weighs more than fat, and BMI can’t tell them apart.</p></div>
      <div class="card pad16 rows mt12">${row('info', 'Thresholds differ by background', 'NHS guidance sets lower BMI thresholds for some heritages. life uses them once you’ve told it yours.')}</div>
      <p class="callout mt16">Wellness information, not a diagnosis. Talk to your GP about weight or health concerns.</p>
    </div></div>`;
  }

  /* ── Today's target load ─────────────────────────────── */
  function strain() {
    const gauge = Array.from({ length: 42 }, (_, k) => `<i class="${k < 12 ? 'bb-on' : k >= 22 && k < 28 ? 'bb-aim' : ''}"></i>`).join('');
    return `${status()}${pushBar('Today’s load', round('info', { label: 'How load works' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Today so far</span>
      ${figure('6.2', '/21', chip('Aim for 11–14', 'live'))}
      <p class="statement mt12">You’re <b>well recovered</b>. Aim for <b>11–14</b> today.</p>
      <div class="card tint goal mt20">${head('fitness', 'Where you are, and the band', '<span class="callout">from readiness</span>')}
        <div class="bb-gauge" aria-hidden="true">${gauge}</div>${ticks([[0, '0'], [33.3, '7'], [66.7, '14'], [100, '21']])}
        <p class="callout mt12">Stay in the band and you build fitness without digging into recovery.</p></div>
      <button class="pcard press mt12" style="${img('run')};height:150px;background-position:center 55%"><span class="topline"><span class="chip onphoto">Lands you in the band</span></span><span class="copy"><b style="${mid}">A 35-minute run in zone 2</b><span>From 6.2 into your 11–14</span></span></button>
      <div class="card pad16 rows mt12">${row('walk', 'Morning walk', '08:10', '<span class="end">2.1</span>')}${row('fitness', 'Cycle to work', '08:50', '<span class="end">4.1</span>')}</div>
    </div></div>`;
  }

  /* ── Heart-rate zones ────────────────────────────────── */
  function zones() {
    const z = (n, bpm, min) => `<div class="bb-zone ${n === 2 ? 'bb-now' : ''}"><span><b>Zone ${n}</b><small>${bpm} bpm</small></span><span><i style="width:${r1(min / 164 * 100)}%"></i></span><em>${min}<small> min</small></em></div>`;
    return `${status()}${pushBar('Heart-rate zones')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">This week · 293 minutes in your zones</span>
      <p class="display"><b>164 minutes</b> in Zone 2, the quiet engine of fitness.</p>
      <div class="card tint goal mt24">${head('heart', 'Time in each zone', '<span class="callout">this week</span>')}
        <div class="mt8">${z(5, '176–190', 8)}${z(4, '162–175', 22)}${z(3, '148–161', 41)}${z(2, '134–147', 164)}${z(1, '120–133', 58)}</div></div>
      <div class="tiles mt12">
        ${tile({ label: 'Resting rate', value: '54', small: 'bpm', sub: 'Measured at rest', plain: true })}
        ${tile({ label: 'Highest recorded', value: '190', small: 'bpm', sub: 'Your own maximum', plain: true })}
      </div>
      <p class="callout mt16">Zones use your resting rate (54) and your highest recorded (190): set from you, not a formula for an average person.</p>
    </div></div>`;
  }

  /* ── Something may be coming on ──────────────────────── */
  function illness() {
    const sig = (name, value, at) => `<div class="bb-sigrow"><div class="between"><strong>${name}</strong><span>${value}</span></div>${range(18, 56, at, true)}</div>`;
    return `${status()}${pushBar('Body signals')}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('bedroom')};height:210px;background-position:center 82%"><span class="topline"><span class="chip onphoto"><i class="bb-sig"></i>3 signals above your normal</span></span><span class="copy"><b style="text-wrap:balance">Something may be coming on</b><span>Take it easy today.</span></span></div>
      <div class="card tint health mt12">${head('pulse', 'Three signals, at once', chip('High'))}
        ${sig('Skin temperature', '+0.6 °C above normal', 79)}${sig('Resting heart rate', '61 bpm, usual 54', 84)}${sig('Breathing rate', '16.8, usual 14.6', 81)}
        <p class="callout mt16">The shaded part of each line is your normal.</p></div>
      <div class="card mt12"><div class="bb-head">${orb('done', 22)}life has made today lighter</div>
        <div class="cols mt16" style="grid-template-columns:repeat(3,1fr)"><div><small>Workout</small><b>Thursday</b><span>Moved</span></div><div><small>Bed by</small><b>22:30</b><span>Tonight</span></div><div><small>Water</small><b>Extra</b><span>Today</span></div></div></div>
      <p class="callout mt16">life never names an illness. Not medical advice. If you feel unwell, contact NHS 111 or your GP.</p>
    </div></div>`;
  }

  /* ── Breathing library ───────────────────────────────── */
  function breathlib() {
    const dot = (c = '') => `<i class="${c}"></i>`;
    const box = ['', '', '', '', 'bb-h', 'bb-h', 'bb-x', 'bb-x', 'bb-x', 'bb-h', 'bb-h', 'bb-x', 'bb-x', 'bb-x', 'bb-h', 'bb-h', 'bb-x', 'bb-x', 'bb-x', 'bb-h', 'bb-h', 'bb-o', 'bb-o', 'bb-o', 'bb-o'];
    const pat = {
      sigh: `<span class="bb-pat bb-onp" aria-hidden="true">${dot('bb-big')}${dot()}${dot('bb-o bb-long')}</span>`,
      box: `<span class="bb-pat bb-box" aria-hidden="true">${box.map(dot).join('')}</span>`,
      resonance: `<span class="bb-pat bb-fine" aria-hidden="true">${Array.from({ length: 12 }, (_, k) => dot(k % 2 ? 'bb-o' : '')).join('')}</span>`,
      f478: `<span class="bb-pat bb-rows" aria-hidden="true"><span>${dot().repeat(4)}</span><span>${dot('bb-h').repeat(7)}</span><span>${dot('bb-o').repeat(8)}</span></span>`,
      down: `<span class="bb-pat" aria-hidden="true">${[16, 14, 12, 10, 8, 7, 6, 5].map(d => `<i style="width:${d}px;height:${d}px"></i>`).join('')}</span>`,
    };
    const card = (what, dots, name, how, cls = '') => `<button class="bb-breath press ${cls}"><span class="micro">${what}</span>${dots}<span class="title">${name}</span><span class="callout" style="margin-top:2px">${how}</span></button>`;
    return `${status()}${pushBar('Breathe')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Five short patterns, each for a different moment</span>
      <button class="pcard press mt12" style="${img('breathe')};height:230px;background-position:center 41%"><span class="topline"><span class="chip onphoto">Fastest way to calm down · 1 min</span><span class="round" style="background:var(--on-photo);color:#0D0E10">${ic('play', 's18')}</span></span><span class="copy">${pat.sigh}<b>Physiological sigh</b><span>Two breaths in, one long out</span></span></button>
      <div class="pgrid mt12">
        ${card('Steady focus', pat.box, 'Box breathing', '4 in · 4 hold · 4 out · 4 hold')}
        ${card('Raises HRV over time', pat.resonance, 'Resonance', '6 breaths a minute · 5 min')}
        ${card('Before sleep', pat.f478, '4-7-8', 'In 4 · hold 7 · out 8')}
        ${card('After a workout', pat.down, 'Heart-rate down', 'Follows your live heart rate', 'tint health')}
      </div>
      <div class="legend mt16"><span><i style="background:var(--ink)"></i>In</span><span><i style="box-shadow:inset 0 0 0 2px var(--ink2)"></i>Hold</span><span><i style="background:var(--surface3)"></i>Out</span></div>
      <p class="callout mt12">With a watch on, heart-rate down paces your breathing to bring your heart rate down.</p>
    </div></div>`;
  }

  /* ── Where this number came from ─────────────────────── */
  function provenance() {
    const rc = (label, value) => `<div class="bb-rc"><span>${label}</span><i></i><b>${value}</b></div>`;
    const sure = '<span class="days14" style="margin-top:0" aria-hidden="true"><i class="on"></i><i class="on"></i><i class="on"></i></span>';
    return `${status()}<div class="dim">${pushBar('Readiness', round('info', { label: 'How this is worked out' }))}</div>
    <div class="scroll dim" style="flex:1;overflow:hidden">
      <div class="between" style="align-items:flex-end"><div class="xl">72<small>/100</small></div><span class="chip done" style="margin-bottom:10px">Above your baseline</span></div>
      <p class="statement mt12">A good day for your <b>harder workout</b> or the <b>bigger decision</b>.</p>
    </div>
    <div class="sheet"><div style="margin:0 -20px">${sheetBar('About this number')}</div>
      <span class="eyebrow">HRV last night</span>
      ${figure('62', 'ms', chip('Personal baseline'))}
      <div class="mt12">${rc('Source', 'Oura ring')}${rc('Last synced', chip('07:02 today', 'done'))}${rc('Readings used', '312 beats over 5 hours')}${rc('Compared with', 'Your last 60 nights')}${rc('Confidence', 'High' + sure)}</div>
      <button class="btn press mt16">How HRV is worked out ${ic('arrow', 's18')}</button></div>`;
  }

  /* ── Sleep regularity ────────────────────────────────── */
  function regChart() {
    const H = 172, L = 44, y = h => r1(8 + h / 12 * 138), col = (330 - L) / 7, bw = 22;
    const nights = [[2.33, 9.75], [2.17, 9.67], [2.58, 9.83], [2.25, 9.75], [2.5, 9.75], [3.83, 11.17], [3.5, 11]], days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return svg(H, 'Bedtime to wake time for each night this week, against your weekday rhythm', `<rect x="${L}" y="${y(2.33)}" width="${330 - L}" height="${r1(y(9.75) - y(2.33))}" rx="12" fill="var(--surface)"/>${[[0, '21:00'], [6, '03:00'], [12, '09:00']].map(([h, t]) => `<text x="0" y="${y(h) + 4}" font-size="11" font-weight="600" fill="var(--ink2)">${t}</text>`).join('')}${nights.map(([bed, wake], k) => { const cx = r1(L + col * k + col / 2); return `<rect x="${r1(cx - bw / 2)}" y="${y(bed)}" width="${bw}" height="${r1(y(wake) - y(bed))}" rx="11" fill="var(--ac)" opacity="${k > 4 ? 1 : .35}"/><text x="${cx}" y="${H - 4}" text-anchor="middle" font-size="11" font-weight="600" fill="var(--${k > 4 ? 'ink' : 'ink2'})">${days[k]}</text>`; }).join('')}`);
  }
  function regularity() {
    return `${status()}${pushBar('Regularity')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Sleep regularity</span>
      ${figure('78', '/100', chip('Weekend shift 1h 20m', 'live'))}
      <p class="statement mt12">Keeping <b>Saturday’s wake</b> within an hour of weekdays would lift <b>Monday’s readiness</b>.</p>
      <div class="card tint work mt20">${head('moon', 'Bed to wake, this week')}
        <div class="mt12">${regChart()}</div>
        <p class="callout mt12">The band is your weekday rhythm. A weekend lie-in shows up as a shift, like a little jet lag.</p></div>
      <div class="mt16">${says('Going to bed and waking at similar times matters almost as much as hours.')}</div>
    </div></div>`;
  }

  /* ── Training load trend ─────────────────────────────── */
  function loadChart() {
    const v = [50, 54, 49, 57, 60, 59, 63, 67], H = 140, base = H - 22, sc = (base - 6) / 84, col = 330 / v.length, bw = 26, labels = ['28 Sep', '', '', '', '26 Oct', '', '', 'This week'];
    return svg(H, 'Weekly training load for eight weeks, with this week inside the sweet spot', `<rect x="0" y="${r1(base - 77.7 * sc)}" width="330" height="${r1(29.9 * sc)}" rx="12" fill="var(--surface)"/>${v.map((n, k) => { const cx = col * k + col / 2, h = r1(n * sc), last = k === v.length - 1; return `<rect x="${r1(cx - bw / 2)}" y="${r1(base - h)}" width="${bw}" height="${h}" rx="13" fill="var(--ac)" opacity="${last ? 1 : .35}"/>${labels[k] ? `<text x="${last ? 330 : r1(cx)}" y="${H - 4}" text-anchor="${last ? 'end' : 'middle'}" font-size="11" font-weight="600" fill="var(--${last ? 'ink' : 'ink2'})">${labels[k]}</text>` : ''}`; }).join('')}`);
  }
  function loadtrend() {
    return `${status()}${pushBar('Load trend')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">This week vs your usual</span>
      ${figure('1.12', '', chip('Sweet spot', 'done'))}
      <p class="statement mt12">This week is <b>12% above</b> your last four. <b>Fitness builds safely</b> here.</p>
      <div class="card tint goal mt20">${head('fitness', 'Weekly load, 8 weeks')}
        <div class="mt12">${loadChart()}</div>
        <p class="callout mt12">The band is this week’s sweet spot: 0.8 to 1.3 times your last four weeks.</p></div>
      <div class="tiles mt12">
        ${tile({ label: 'Sweet spot', value: '0.8–1.3', sub: 'Fitness builds safely', plain: true })}
        ${tile({ label: 'Take care above', value: '1.5', sub: 'Injury risk climbs', plain: true })}
      </div>
    </div></div>`;
  }

  /* ── Your body this week ─────────────────────────────── */
  function healthdigest() {
    return `${status()}${pushBar('This week')}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('sunday')};height:160px;background-position:center 75%"><span class="topline"><span class="chip onphoto">Sunday</span></span><span class="copy"><b>Your body this week</b><span>Three wins, one thing to watch, one pattern to try.</span></span></div>
      <div class="card tint health mt12">${head('check', 'Three wins')}
        <div class="cols mt16" style="grid-template-columns:repeat(3,1fr)"><div><small>Slept 7h+</small><b>5 nights</b><span>Best week this month</span></div><div><small>Zone 2</small><b>164 min</b><span>Above your goal</span></div><div><small>Resting rate</small><b>Down 2</b><span>Fitness is building</span></div></div></div>
      <div class="card pad16 mt12"><div class="micro"><span class="sig"></span>Watch</div><p class="body ink mt8">Saturday bedtime was 2 hours later than usual.</p></div>
      <div class="card mt12"><div class="micro">A pattern in your data</div>
        <p class="statement mt8">On days you walk <b>8,000+ steps</b>, you sleep <b>24 minutes longer</b>.</p>
        <div class="bb-cmp" aria-hidden="true"><small>Other days</small><span><i style="width:76%"></i></span></div>
        <div class="bb-cmp" aria-hidden="true"><small>Days with 8,000+ steps</small><span><i style="width:76%"></i><b></b><em>+24 min</em></span></div></div>
    </div></div>${foot(btn('Try it for two weeks'))}`;
  }

  /* ── Habits ──────────────────────────────────────────── */
  function habits(rescued) {
    const d14 = bits => `<span class="bb-d14" aria-hidden="true">${bits.split('').map(b => `<i class="${b === '1' ? 'bb-on' : ''}"></i>`).join('')}</span>`;
    const done = (photo, pos, day, name, facts, bits) => `<button class="pcard press" style="${img(photo)};height:210px;background-position:${pos}"><span class="topline"><span class="chip onphoto">${ic('check', 's14')}Day ${day}</span></span><span class="copy"><b style="${small}">${name}</b><span>${facts}</span>${d14(bits)}</span></button>`;
    const front = rescued
      ? `<div class="card mt24"><div class="between"><span class="micro">Tonight</span>${chip('Set for 23:15', 'done')}</div>
          <div class="headline" style="margin-top:10px">In bed by 23:15</div>
          <p class="body" style="margin-top:4px">That still counts. Missing one day doesn’t reset you.</p>
          <button class="btn ghost sm press mt16" data-set="">Change</button></div>`
      : `<div class="card mt24"><div class="between"><span class="micro"><span class="sig"></span>Never miss twice</span><span class="callout">Day 12 · 11 of last 14</span></div>
          <div class="headline" style="margin-top:10px">In bed by 22:50</div>
          <p class="callout" style="margin-top:2px">After brushing my teeth, I will put my phone on the charger in the kitchen.</p>
          ${days14('11101111101110')}
          <p class="body mt12">You missed last night. Tonight, just aim for <b>23:15</b>. That still counts.</p>
          <button class="btn press mt16" data-set="rescued">Okay, 23:15</button>
          <button class="link mt12" style="width:100%;justify-content:center">Skip tonight</button></div>`;
    return `${status()}${pushBar('Habits', round('add', { label: 'New habit' }))}
    <div class="scroll"><div class="rise">
      <p class="display"><b>3 habits</b>, <b>2 done</b> today. Water before coffee is <b>close to automatic</b>.</p>
      ${front}
      <div class="pgrid mt12">
        ${done('gotit', 'center 100%', 41, 'Water before coffee', '13 of last 14 · feels automatic 4/5 · from Apple Health', '11111101111111')}
        ${done('walk', 'center 100%', 23, '10 minutes of daylight', '12 of last 14 days', '11101111011111')}
      </div>
      <div class="card mt12"><div class="micro">Every 2 weeks</div>
        <p class="statement mt8">How automatic does <b>10 minutes of daylight</b> feel?</p>
        <div class="mt16">${seg(['1', '2', '3', '4', '5'], -1)}</div>
        <div class="between mt8"><span class="callout">I have to remember</span><span class="callout">It just happens</span></div></div>
      <p class="callout mt16">Habits take about 66 days on average to feel automatic, some sooner, some later (Lally et al., 2010). Missing one day doesn’t reset you.</p>
    </div></div>`;
  }

  /* ── New habit, built as a sentence ──────────────────── */
  function habitnew(where) {
    const places = ['in the kitchen', 'at my desk', 'in the bedroom'];
    const last = where
      ? `<button class="pick press" data-set="">Where<span class="set">${where} ${ic('more', 's16')}</span></button>
         <div class="card pad16 between"><span><span class="title" style="display:block">Mark done automatically</span><span class="callout">When Apple Health shows it (if it can)</span></span>${toggle(true, 'Auto-complete')}</div>`
      : `<div class="card pad16"><div class="between"><span class="title">Where</span><span class="callout">Tap one</span></div>
         <div class="filters mt12" style="flex-wrap:wrap">${places.map(p => `<button aria-pressed="false" data-set="${p}">${p}</button>`).join('')}</div></div>`;
    return `${status()}${sheetBar('New habit')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow"><span class="star"></span>Start tiny · your habit</span>
      <p class="display">After <b>the kettle boils</b>, I will <b>drink a glass of water</b> ${where ? `<b>${where}</b>.` : '<span class="bb-blank"></span>'}</p>
      <p class="body mt12">Pick a moment that already happens every day, then attach something that takes under two minutes.</p>
      <div class="gap8 mt20">${pick('After…', 'the kettle boils', true)}${pick('I will…', 'drink a glass of water', true)}${last}</div>
    </div></div>
    ${foot(`<button class="btn press" ${where ? '' : 'style="opacity:.35"'}>Start this habit</button><span class="callout" style="text-align:center">You have 2 of 3 new-habit slots in use.</span>`)}`;
  }

  /* ── Know yourself: the shelf of tests ───────────────── */
  function tests() {
    const t = (photo, pos, state, name, what, why) => `<button class="bb-shelf press"><span class="bb-ph" style="${img(photo)};background-position:${pos}"><span class="chip onphoto">${state === 'Done' ? ic('check', 's14') : ''}${state}</span></span><span class="bb-tx"><b>${name}</b><small>${what}</small><em>${why}</em></span></button>`;
    return `${status()}${pushBar('')}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('journal')};height:220px;background-position:center 51%"><span class="topline"><span class="chip onphoto">2 of 4 done</span></span><span class="copy"><b style="font-size:34px;line-height:39px;letter-spacing:-1.1px">Know yourself</b><span>So life can fit you, not the average person.</span></span></div>
      <div class="pgrid mt12">
        ${t('desk', '78% 30%', 'Done', 'Personality', 'The Big Five · 10 min', 'How life words nudges, and how much it nudges')}
        ${t('calmdesk', 'center 92%', 'Done', 'Your body clock', 'Morning or evening type · 2 min', 'When life plans focus, workouts and wind-down')}
        ${t('freedom', 'center 78%', 'Start · 3 min', 'What matters most', 'Values', 'Shapes your Aim and bigger decisions')}
        ${t('payslip', 'center 89%', 'Start · 3 min', 'You and money', 'Money mindset', 'How life talks about spending and saving')}
      </div>
      <p class="callout mt16">Your answers stay private and you can retake or delete them any time.</p>
    </div></div>`;
  }

  /* ── One statement at a time ─────────────────────────── */
  function testq(picked) {
    const labels = ['Not like me at all', 'Not really', 'Somewhat', 'Mostly', 'Very like me'], size = ['bb-l2', '', 'bb-l0', '', 'bb-l2'];
    return `${status()}${pushBar('Personality', '<span class="callout" style="align-self:center">14 / 50</span>', 'close')}
    <div class="scroll" style="display:flex;flex-direction:column">
      <div class="bar-track"><i style="width:28%"></i></div>
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center">
        <span class="eyebrow">How well does this describe you?</span>
        <p class="display" style="font-size:40px;line-height:44px;letter-spacing:-1.4px"><b>I get chores done right away.</b></p>
      </div>
      <div class="bb-likert" role="group" aria-label="How well this describes you">${labels.map((l, k) => `<button class="press ${size[k]}" data-set="${k}" aria-pressed="${k === picked}" aria-label="${l}">${k === picked ? ic('check', 's18') : ''}</button>`).join('')}</div>
      <div class="between mt12"><span class="callout">Not like me at all</span><span class="callout">Very like me</span></div>
      <p class="headline" style="text-align:center;margin-top:20px;min-height:26px">${picked >= 0 ? labels[picked] : ''}</p>
    </div>`;
  }

  /* ── Your personality: five plain lines ──────────────── */
  function bigfive() {
    const trait = (name, plain, at, so) => `<div class="bb-tr"><div class="between"><strong>${name}</strong><span>${plain}</span></div><div class="bb-trait" aria-hidden="true">${Array.from({ length: 25 }, (_, k) => `<i class="${k === 12 ? 'bb-avg' : ''}"></i>`).join('')}<em style="left:${at}%"></em></div><p class="callout bb-so">${ic('arrow', 's14')}${so}</p></div>`;
    return `${status()}${pushBar('Personality', round('arrowUp', { label: 'Share' }))}
    <div class="scroll"><div class="rise">
      <div class="eyebrow"><span class="thumb" style="${img('desk')};width:28px;height:28px;border-radius:50%;background-position:92% center"></span>Ama · the Big Five</div>
      <p class="display">You’re <b>curious</b> and <b>warm</b>, you <b>follow through</b>, and you recharge <b>on your own</b>.</p>
      <div class="card tint you mt24">
        ${trait('Openness', 'Curious, likes new ideas', 80, 'life offers more experiments and new ideas')}
        ${trait('Conscientiousness', 'Organised, follows through', 74, 'Fewer reminders; plans stay as you set them')}
        ${trait('Extraversion', 'Energised by people', 26, 'Suggestions that work solo come first')}
        ${trait('Agreeableness', 'Warm, cooperative', 76, 'Drafts stay friendly but firm when money’s at stake')}
        ${trait('Stress sensitivity', 'Feels pressure strongly', 64, 'Gentler wording, and one thing at a time on hard days')}
      </div>
      <p class="callout mt16">The middle line is the average person; the words sit at the high end. No trait is good or bad, and none is a type or a label.</p>
    </div></div>`;
  }

  /* ── Your body clock ─────────────────────────────────── */
  function chronotype() {
    const block = (left, width, icon, cls = '') => `<span class="${cls}" style="left:${left}%;width:${width}%">${ic(icon, 's16')}</span>`;
    return `${status()}${pushBar('Body clock')}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('calmdesk')};height:200px;background-position:center 76%"><span class="topline"><span class="chip onphoto">You’re a</span></span><span class="copy"><b style="font-size:30px;line-height:34px;letter-spacing:-.9px;text-wrap:balance">Moderate morning type</b><span>Your sleep agrees: you’re usually asleep by 23:20.</span></span></div>
      <div class="card tint work mt12">${head('sun', 'Your day, placed where it works')}
        <div class="bb-day" aria-hidden="true">${block(2.9, 11.8, 'fitness')}${block(17.6, 17.6, 'bulb', 'bb-deep')}${block(64.7, 11.8, 'fitness')}${block(90.4, 8.4, 'moon')}</div>
        ${ticks([[0, '6am'], [35.3, '12pm'], [70.6, '6pm'], [100, '11pm']])}</div>
      <div class="card pad16 rows mt12">${row('bulb', 'Deep work', '9:00 – 12:00, your sharpest hours', ' ')}${row('fitness', 'Workouts', 'Morning or early evening', ' ')}${row('bell', 'Nudges', 'Never after 21:30', ' ')}${row('moon', 'Wind-down', 'Starts 22:30', ' ')}</div>
      <p class="callout mt16">From five questions, confirmed against your real sleep.</p>
    </div></div>`;
  }

  /* ── What matters most ───────────────────────────────── */
  function values() {
    const val = (n, word, photo, h, pos, type) => `<button class="pcard press" style="${img(photo)};height:${h}px;background-position:${pos};flex-direction:row;align-items:flex-end"><b style="${type};font-weight:600">${word}</b><span class="chip onphoto">${n}</span></button>`;
    return `${status()}${pushBar('Values', round('swap', { label: 'Reorder your values' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Your top five · sorted from 20 cards</span>
      <div class="gap8 mt12">
        ${val('01', 'Freedom', 'freedom', 150, 'center 65%', 'font-size:46px;line-height:48px;letter-spacing:-2.07px')}
        ${val('02', 'Family', 'siblings', 116, 'center 51%', 'font-size:34px;line-height:39px;letter-spacing:-1.1px')}
        ${val('03', 'Growth', 'aimwrite', 96, 'center 49%', 'font-size:30px;line-height:34px;letter-spacing:-.9px')}
        ${val('04', 'Security', 'keyshome', 80, 'center 82%', 'font-size:24px;line-height:31px;letter-spacing:-.53px')}
        ${val('05', 'Creativity', 'areawork', 68, 'center 54%', mid)}
      </div>
      <div class="card mt12"><div class="micro">How life uses this</div>
        <div class="mt12">${says('When a choice is close, life shows which option fits <b>Freedom</b> and <b>Family</b> best, not just which pays more.')}</div>
        <p class="callout mt12">They sit under your Chief Aim.</p></div>
    </div></div>`;
  }

  /* ── Your body numbers ───────────────────────────────── */
  function measures() {
    const n = (label, value, unit, sub) => `<div><div class="micro">${label}</div><div class="num" style="margin-top:8px">${value}${unit ? `<span class="callout"> ${unit}</span>` : ''}</div><p class="callout" style="margin-top:2px">${sub}</p></div>`;
    const pair = (a, b) => `<div class="mt16" style="display:grid;grid-template-columns:1fr 1fr;gap:16px">${a}${b}</div>`;
    const ask = (name, changes, value) => `<button class="pick press" style="height:68px;gap:12px"><span style="display:block;font-weight:600;color:var(--ink)">${name}<span class="callout" style="display:block;font-weight:500;color:var(--ink2)">${changes}</span></span><span class="set" style="flex:none">${value} ${ic('more', 's16')}</span></button>`;
    return `${status()}${pushBar('Body numbers')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Everything life knows about your body</span>
      <p class="display"><b>Ten numbers.</b> Each shows where it’s from and what it changes.</p>
      <div class="card tint you mt24">${head('trend', 'Smart scale', '<span class="callout">updates itself</span>')}
        ${pair(n('Weight · 7-day trend', '74.2', 'kg', 'Changes food targets, load, BMI'), n('Body fat', '22', '%', 'Trend only; scales vary'))}</div>
      <div class="card tint health mt12">${head('watch', 'Apple Watch', '<span class="callout">updates itself</span>')}
        ${pair(n('Resting heart rate', '54', 'bpm', 'Changes readiness, zones'), n('VO₂ max', '44', '', 'Changes fitness age'))}</div>
      <div class="tiles mt12">
        ${tile({ label: 'BMI', unit: 'Calculated', value: '25.1', sub: 'A rough screen only' })}
        ${tile({ label: 'Activity level', unit: 'Weekly', value: 'Active', sub: 'Measured. Changes food targets' })}
      </div>
      ${secHead('You tell life', 'asked about once a month')}
      <div class="gap8">
        ${ask('Height', 'Changes food targets, BMI, load', '172 cm')}
        ${ask('Waist', 'Waist-to-height, better than BMI', '84 cm')}
        ${ask('Blood pressure', 'You or a cuff. Health check-ins', '118 / 76')}
        ${ask('Sex at birth', 'Cycle, ranges, food targets', 'Female')}
      </div>
      <div class="mt16">${btn('BMI and waist, explained', { ghost: true, icon: 'chev', trail: true })}</div>
    </div></div>`;
  }

  /* ── Registry ────────────────────────────────────────── */
  K.screen('fitnessage', { from: '5, 20, 13', note: 'One figure, the three-year gap drawn in dots, then the six-month fall and the three readings that move it.', build: fitnessage });
  K.screen('sources', { from: '2, 16', note: 'A receipt of which device feeds each number and when it last synced, then last night’s disagreement settled side by side.', build: sources });
  K.screen('cgm', { from: '14, 20, 13', note: 'The day’s curve against your usual range, then the two meals as photographs: one rise, one steady.', build: cgm });
  K.screen('basics', { from: '3, 12, 14', note: 'A briefing with the three basics inside it, water counted in tenths of a litre, a nudge to stand, recovery against your baseline. Tap + Glass.', build: basics });
  K.screen('sleepnight', { from: '14, 13, 20', note: 'The night on the bedroom photograph, then the stages as four lanes with deep sleep picked out.', build: sleepnight });
  K.screen('workoutdetail', { from: '14, 19', note: 'The run as a photograph and one figure, then a three-beat story: your heart during, the minute after, what it added.', build: workoutdetail });
  K.screen('weight', { from: '20, 13', note: 'One figure, why it is a trend, weigh-ins as dots inside your normal swing, and the switch that keeps it off Today.', build: weight });
  K.screen('bmi', { from: '20, 12', note: 'Waist-to-height leads as the big figure. BMI sits below it, smaller, marked as a rough guide.', build: bmi });
  K.screen('strain', { from: '12, 13, 14', note: 'Where you are on 0 to 21 in tall ticks with today’s band picked out, and the one run that lands you in it.', build: strain });
  K.screen('zones', { from: '16, 13', note: 'The week’s minutes as five capsules with Zone 2 picked out, and the two heart rates your zones are set from.', build: zones });
  K.screen('illness', { from: '14, 20, 12', note: 'Said gently on a calm photograph: three signals beyond your normal, then the three things life changed today.', build: illness });
  K.screen('breathlib', { from: '15, 5, 14', note: 'The quickest pattern in front on a photograph, four more as tiles, each drawn in dots for in, hold and out.', build: breathlib });
  K.screen('provenance', { from: '2, 21', note: 'A receipt for one number over the dimmed score: source, freshness, readings, baseline and confidence.', build: provenance });
  K.screen('regularity', { from: '16, 13, 20', note: 'One figure, the weekend shift as the signal, and seven nights drawn bed to wake against your weekday rhythm.', build: regularity });
  K.screen('loadtrend', { from: '16, 13, 12', note: 'One ratio, eight weeks of load with this week inside the sweet-spot band, and the two thresholds as tiles.', build: loadtrend });
  K.screen('healthdigest', { from: '13, 14, 16', note: 'Sunday on one page: three wins in clean columns, one thing to watch, one pattern, one experiment to try.', build: healthdigest });
  K.screen('habits', { from: '18, 5, 14, 1', note: 'Tonight’s rescue in front with the only button, the two done habits as photographs with 14 days of dots, then one question. Tap Okay.', build: s => habits(s === 'rescued') });
  K.screen('habitnew', { from: '3, 6, 21', note: 'The habit is a sentence you finish: two parts set, the last one asked with three choices. Tap a place.', build: habitnew });
  K.screen('tests', { from: '15, 14, 10', note: 'A photograph and the promise, then four tests on a shelf, each with what life does with the answer.', build: tests });
  K.screen('testq', { from: '4, 1, 6', note: 'One statement, very large, and a five-step line from not like me to very like me. Tap a circle.', build: s => testq(s === '' ? -1 : Number(s)) });
  K.screen('bigfive', { from: '3, 1, 5', note: 'You in one sentence, then five dotted lines with the average marked and what life now does for each.', build: bigfive });
  K.screen('chronotype', { from: '14, 13, 16', note: 'Your type on a morning photograph, the day as one strip with deep work picked out, then the four timings.', build: chronotype });
  K.screen('values', { from: '15, 10, 3', note: 'Five values as five photographs, each smaller than the last, with the word set large on it.', build: values });
  K.screen('measures', { from: '12, 13, 6', note: 'Numbers that update themselves, grouped by the device they come from, then the four you tell life as soft rows.', build: measures });
})();
