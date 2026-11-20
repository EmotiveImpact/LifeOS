// life · V26 — Today, Plan and You: the screens one tap in from the three tabs. Written against review/v26/KIT.md.
(() => {
  'use strict';
  const K = window.L26;
  const { ic, img, status, round, rootBar, pushBar, textBar, sheetBar, foot, btn, secHead, chip, orb, says, ruler, row, thumbRow, tile, pick, check, acc, seg, stepper, field, avatar, bubble, dots, wave } = K;

  /* One-off styles. The kit has no week strip, day ribbon, year strip, level path, people row or swipe row. */
  K.addCss('.tp-', `
    .tp-week { display: flex; gap: 10px; }
    .tp-week span { display: flex; flex-direction: column; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: var(--on-photo2); }
    .tp-week i { width: 24px; height: 24px; border-radius: 50%; background: var(--photo-fill); }
    .tp-week .tp-on i { background: var(--on-photo); }
    .tp-mini { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .tp-mini div { background-color: var(--surface); border-radius: 16px; box-shadow: var(--shadow); padding: 10px 14px 12px; }
    .tp-mini .tp-wide { grid-column: 1 / -1; }
    .tp-mini small { display: block; font-size: 11px; font-weight: 600; color: var(--ink2); }
    .tp-mini b { display: block; font-size: 20px; line-height: 26px; font-weight: 600; letter-spacing: -.4px; font-variant-numeric: tabular-nums; }
    .tp-grip { width: 12px; height: 19px; flex: none; background: radial-gradient(circle, var(--quiet) 1.4px, transparent 1.9px) 0 0 / 6px 6.4px; }
    .tp-year { display: grid; grid-template-columns: repeat(12, 1fr); gap: 4px; margin-top: 16px; }
    .tp-year span { display: flex; flex-direction: column; align-items: center; gap: 6px; font-size: 11px; font-weight: 600; color: var(--quiet); }
    .tp-year i { width: 14px; height: 14px; border-radius: 50%; background: var(--surface3); }
    .tp-year .tp-on i { background: var(--ink); }
    .tp-year .tp-next i { background: var(--ember); }
    .tp-year .tp-next { color: var(--ink); }
    .tp-sigs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
    .tp-sigs div { background-color: var(--surface2); background-size: cover; border-radius: 16px; padding: 12px 10px 12px 12px; position: relative; overflow: hidden; }
    .tp-sigs small { display: block; font-size: 11px; font-weight: 600; color: var(--ink2); position: relative; }
    .tp-sigs b { display: block; font-size: 20px; line-height: 26px; font-weight: 600; letter-spacing: -.4px; margin-top: 6px; font-variant-numeric: tabular-nums; position: relative; }
    .tp-sigs span { display: block; font-size: 11px; line-height: 14px; font-weight: 500; color: var(--ink2); margin-top: 2px; position: relative; }
    .tp-sigs .tp-pic { color: var(--on-photo); }
    .tp-sigs .tp-pic::before { content: ""; position: absolute; inset: 0; background: var(--panel); }
    .tp-sigs .tp-pic small { color: var(--on-photo2); }
    .tp-sigs .tp-pic span { color: var(--on-photo2); }
    .tp-day { display: grid; grid-template-columns: 44px 1fr; gap: 6px 10px; }
    .tp-day time { font-size: 13px; line-height: 18px; font-weight: 500; color: var(--ink2); font-variant-numeric: tabular-nums; padding-top: 8px; }
    .tp-blk { border-radius: 14px; background: var(--surface3); padding: 8px 14px; font-size: 13px; line-height: 18px; font-weight: 500; color: var(--ink2); }
    .tp-soft { background: var(--surface2); }
    .tp-free { background: none; color: var(--quiet); }
    .tp-gap { background: var(--ember-tint); color: var(--ink); padding: 12px 12px 12px 14px; display: flex; align-items: center; gap: 12px; }
    .tp-scrim { position: absolute; left: 0; right: 0; bottom: 0; height: 70%; z-index: 1; background: linear-gradient(to bottom, transparent, var(--panel) 45%); }
    .tp-listen { display: flex; align-items: center; gap: 10px; padding: 8px 16px 8px 8px; border-radius: 999px; background: var(--photo-fill); color: var(--on-photo); font-size: 13px; font-weight: 500; width: fit-content; font-variant-numeric: tabular-nums; }
    .tp-play { width: 36px; height: 36px; border-radius: 50%; background: var(--on-photo); color: #0D0E10; display: grid; place-items: center; }
    .tp-listen .wave i { background: var(--on-photo2); }
    .tp-ticks { display: flex; gap: 8px; }
    .tp-ticks span { width: 34px; height: 34px; border-radius: 50%; background: var(--on-photo); color: #0D0E10; display: grid; place-items: center; }
    .tp-ticks .tp-moved { background: var(--photo-fill); color: var(--on-photo); }
    .tp-note { background: var(--surface2); border-radius: 16px; padding: 14px 16px; font-size: 15px; line-height: 22px; }
    .tp-note i { display: inline-block; width: 2px; height: 18px; background: var(--ember); vertical-align: -3px; margin-left: 1px; }
    .tp-unread { display: inline-block; width: 6px; height: 6px; border-radius: 50%; background: var(--ember); flex: none; }
    .tp-sess { display: flex; gap: 10px; justify-content: center; }
    .tp-sess i { width: 12px; height: 12px; border-radius: 50%; background: var(--surface3); }
    .tp-sess .tp-on { background: var(--ink); }
    .tp-sess .tp-now { background: var(--ember); }
    .tp-letter p { font-size: 16px; line-height: 24px; letter-spacing: -.2px; color: var(--ink2); }
    .tp-letter p + p { margin-top: 12px; }
    .tp-letter b { color: var(--ink); font-weight: 500; }
    .tp-vs { display: grid; gap: 6px; margin-top: 12px; }
    .tp-vs span { display: flex; align-items: center; height: 28px; border-radius: 14px; padding: 0 12px; font-size: 11px; font-weight: 600; background: var(--surface); color: var(--ink2); white-space: nowrap; }
    .tp-vs .tp-now { background: var(--ink); color: var(--canvas); }
    .tp-mood { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; }
    .tp-mood small { font-size: 11px; font-weight: 600; color: var(--quiet); text-align: center; }
    .tp-mood i { aspect-ratio: 1; border-radius: 50%; background: var(--surface2) center / cover no-repeat; }
    .tp-mood .tp-d { box-shadow: inset 0 0 0 3px var(--ember); }
    .tp-mood .tp-x { background: none; box-shadow: inset 0 0 0 2px var(--surface3); }
    .tp-mood .tp-f { transform: scale(.3); }
    .tp-face { width: 16px; height: 16px; border-radius: 50%; background: var(--surface3) center / cover no-repeat; flex: none; margin-left: -4px; }
    .tp-crowd { display: flex; justify-content: center; align-items: flex-end; gap: 2px; height: 60px; color: var(--ink); }
    .tp-crowd span { display: grid; place-items: center; }
    .tp-crowd svg { width: 46px; height: 46px; stroke-width: 1.4; }
    .tp-kids svg { width: 34px; height: 34px; }
    .tp-crowd .tp-empty { color: var(--surface3); }
    .tp-in { animation: tp-in 420ms cubic-bezier(.2,.9,.3,1.2) both; }
    @keyframes tp-in { from { opacity: 0; transform: translateX(28px) scale(.7); } }
    .tp-path svg { width: 100%; height: 168px; display: block; overflow: visible; }
    .tp-lv { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 6px; }
    .tp-lv span { font-size: 11px; line-height: 14px; font-weight: 600; color: var(--quiet); text-align: center; }
    .tp-lv .tp-here { color: var(--ink); }
    .tp-swipe { position: relative; border-radius: 16px; background: var(--surface2); }
    .tp-forget { position: absolute; right: 0; top: 0; bottom: 0; width: 84px; display: grid; place-items: center; font-size: 13px; font-weight: 600; color: var(--ember-text); }
    .tp-swipe .row { position: relative; background: var(--surface); border-radius: 16px; padding: 8px 12px; transform: translateX(-84px); box-shadow: var(--shadow); }
    .tp-split { display: flex; gap: 3px; height: 14px; margin-top: 14px; }
    .tp-split i { border-radius: 7px; background: var(--surface); }
    .tp-split .tp-a { background: var(--ink); }
    .tp-split .tp-s { background: var(--ac); }
    .tp-duo { display: flex; }
    .tp-duo .avatar + .avatar { margin-left: -16px; background: var(--surface3); box-shadow: inset 0 0 0 3px var(--canvas); }
  `);

  /* Small local helpers */
  const photoBtn = (icon, label) => `<button class="round press" style="background:var(--on-photo);color:#0D0E10" aria-label="${label}">${ic(icon, 's18')}</button>`;
  const numRow = (n, title, sub, end = '') => `<div class="row"><span class="ic" style="font-size:15px;font-weight:600">${n}</span><span class="mid"><b>${title}</b>${sub ? `<span>${sub}</span>` : ''}</span>${end}</div>`;
  const icBox = icon => `<span class="row" style="min-height:0;padding:0;width:auto"><span class="ic">${ic(icon, 's18')}</span></span>`;
  const areaChips = (opts, active = 0) => `<div class="filters" role="group" style="overflow-x:auto;margin:0 -20px;padding:0 20px;scrollbar-width:none">${opts.map((o, k) => `<button style="flex:none" aria-pressed="${k === active}">${o}</button>`).join('')}</div>`;
  const softChips = list => `<div style="display:flex;flex-wrap:wrap;gap:8px">${list.map(t => `<button class="chip press">${t}</button>`).join('')}</div>`;
  const areaDot = a => `<i style="width:6px;height:6px;border-radius:50%;background:var(--a-${a});flex:none"></i>`;
  const SMALL = 'font-size:16px;line-height:21px;letter-spacing:-.22px';
  /** A card with its photograph down the left edge. */
  const picCard = (photo, pos, inner, cls = '') => `<button class="card press ${cls}" style="padding:0;display:flex;overflow:hidden"><span style="${img(photo)};background-size:cover;background-position:${pos};width:104px;flex:none"></span><span style="flex:1;min-width:0;padding:14px 16px 16px">${inner}</span></button>`;
  /** Today, as the page a sheet rises over. */
  const todayBar = () => `${status()}${rootBar('Today', 'Mon 16 Nov', round('search', { label: 'Search' }) + round('bell', { label: 'From life', dot: true }))}`;
  const todayStrip = brief => `<div class="scroll dim" style="overflow:hidden"><div class="eyebrow-row"><span class="eyebrow">Good morning, Ama</span><span class="chip">Level 1 · Stabilize</span></div><p class="display">${brief}</p></div>`;
  const BRIEF = `Your <b class="nw">${ic('doc')}tax rebate</b> is <b class="nw">one form</b> away. <b class="nw">${ic('calendar')}Council tax</b> is due in <b class="nw">15 days</b>.`;

  /* ═══ TODAY ═══════════════════════════════════════════ */

  /* Nudge: the notification, opened */
  function nudge(s) {
    const later = s === 'later';
    // Why now, as the day it found the gap in. The free slot is the one in ember.
    const day = `<div class="tl">
        <div class="tl-item done"><div class="when">09:00</div><p>Design review</p></div>
        <div class="tl-item ${later ? 'later' : 'now'}"><div class="when">13:40 · ${later ? 'LEFT FREE' : 'FREE FOR 20 MINUTES'}</div><p>${later ? 'You chose to keep this one clear.' : '<b>This is the gap.</b> Three steps fit inside it.'}</p></div>
        <div class="tl-item later"><div class="when">14:00</div><p>Deep work</p></div>
        ${later ? '<div class="tl-item now"><div class="when">18:00 · MOVED HERE</div><p><b>Claim your tax rebate.</b> About 6 minutes.</p></div>' : ''}
      </div>`;
    return `${status()}${pushBar('', chip(later ? 'Moved to 6pm' : 'Free 13:40 to 14:00', later ? 'q' : 'live'), 'close')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">${orb('ring', 18)}life · ${later ? 'noted' : 'just now'}</span>
      ${later
        ? `<p class="display">Moved to <b class="nw">${ic('clock')}6pm</b>. The <b>P87</b> and your <b>£840</b> will keep.</p>
           <p class="body mt12">life writes first <b>at most once a day</b>, so nothing else is coming before then.</p>`
        : `<p class="display">You’re free until <b class="nw">${ic('clock')}2pm</b>. The <b class="nw">${ic('doc')}P87</b> is all that stands between you and <b>£840</b>.</p>
           <p class="body mt12">Three steps, about <b>6 minutes</b>.</p>`}
      <div class="hero mt24"><span class="photo" style="${img('payslip')};height:156px;background-position:center 78%"><span class="copy"><small>Tax rebate · HMRC</small><b style="font-size:20px;line-height:26px;letter-spacing:-.4px">Claim your tax rebate</b></span></span>
        <div class="below rows" style="padding:6px 16px 8px">
          ${numRow(1, 'Sign in to Government Gateway', '', '<span class="callout">1 min</span>')}
          ${numRow(2, 'Add £1,240 of software and kit', '', '<span class="callout">3 min</span>')}
          ${numRow(3, 'Submit and save the reference', '', '<span class="callout">2 min</span>')}
        </div></div>
      ${secHead(later ? 'Your day now' : 'Why now', 'Your day')}
      <div class="card pad16">${day}</div>
      ${secHead('Already in hand')}
      <div class="rows">
        ${thumbRow('payslip', 'Your payslip', 'Filed · shows the emergency code', '<span class="chip q">Ready</span>')}
        ${row('folder', 'Receipts for £1,240', 'Software and kit · already added up', '<span class="chip q">Ready</span>')}
      </div>
      ${secHead('After you send it')}
      <div class="card pad16"><p class="body"><b>life keeps watch for the reply</b> and tells you when the £840 is on its way. You don’t have to chase it.</p></div>
      <p class="callout mt16">One nudge a day at most, and never between 9pm and 8am.</p>
    </div></div>
    ${later
      ? foot(btn('Do it now instead', { ghost: true, set: '' }))
      : foot(btn('Start step 1', { icon: 'arrow', trail: true }) + `<div style="display:flex;gap:8px">${btn('At 6pm', { ghost: true, sm: true, set: 'later' })}${btn('Not this week', { ghost: true, sm: true })}</div>`)}`;
  }

  /* Pulse: Today's feeling check on its own, as the drawer it is. The kit's field, at its most exact size. */
  function pulse(state) {
    if (state.startsWith('set')) {
      const m = K.MOODS[state.split(':')[1]] || K.MOODS.calm;
      return `${todayBar()}${todayStrip(BRIEF)}
      <div class="sheet"><div class="handle" style="margin-bottom:14px"></div>
        <div class="pcard" style="${img(m.photo)};height:230px"><span class="topline"><span class="chip onphoto">${ic('check', 's14')}Checked in · 9:41</span></span><span class="copy"><b>Arriving ${m.name.toLowerCase()}</b><span>${m.head}</span></span></div>
        <p class="statement mt16">Today is <b>set around it</b>.</p>
        <p class="body mt8">${m.line}</p>
        <div class="mt16" style="display:flex;gap:8px"><button class="btn ghost press" style="width:auto;padding:0 20px" data-set="">Change</button>${btn('Back to Today')}</div>
      </div>`;
    }
    const m = K.MOODS.calm;
    return `${todayBar()}${todayStrip(BRIEF)}
    <div class="sheet"><div class="handle" style="margin-bottom:14px"></div>
      <div class="between"><p class="statement">How are you <b>arriving?</b></p>${round('close', { label: 'Not now', cls: 'sm' })}</div>
      <div class="mt12">${K.feel('calm', { h: 300 })}</div>
      <p class="headline mt16" style="font-weight:500;color:var(--ink2)">I’m arriving <b class="ink" style="font-weight:500" data-feel-word>calm</b>.</p>
      <p class="callout mt8" data-feel-line>${m.head} ${m.line}</p>
      <button class="btn press mt16" data-feel-set="set:" data-set="set:calm">Set today’s pace</button>
    </div>`;
  }

  /* Checking in: a heavy week, and where real support is */
  function checkin() {
    const days = ['T', 'W', 'T', 'F', 'S', 'S', 'M'], heavy = '1011011';
    return `${status()}${sheetBar('Checking in')}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('breathe')};height:150px;background-position:center 30%;margin-top:4px"><span class="topline"><span class="chip onphoto">The last 7 days</span></span>
        <div class="tp-week" aria-hidden="true">${days.map((d, k) => `<span class="${heavy[k] === '1' ? 'tp-on' : ''}"><i></i>${d}</span>`).join('')}</div></div>
      <p class="statement mt16">You’ve felt drained or anxious on <b>5 of the last 7 days</b>. That’s a lot to carry.</p>
      <p class="body mt12">life can make the next few days lighter. And if it would help to talk to someone:</p>
      <div class="card pad16 rows mt16">
        ${row('heart', 'Samaritans · 116 123', 'Free, any time, about anything', chip('24/7', 'q'))}
        ${row('help', 'NHS 111', 'Urgent help when it isn’t an emergency', chip('Any time', 'q'))}
        ${row('person', 'Your GP', 'For ongoing support')}
      </div>
      <p class="callout mt16">life isn’t a medical service. If you’re in danger right now, call 999.</p>
    </div></div>
    ${foot(btn('Make this week lighter') + `<button class="callout" style="text-align:center">I’m okay, just a busy week</button>`)}`;
  }

  /* Customise Today: the preview is the hero, the order is yours */
  function customise() {
    const chosen = ['Readiness', 'Sleep', 'Fuel', 'Load', 'Stress'];
    return `${status()}${sheetBar('Today’s numbers')}
    <div class="scroll"><div class="rise">
      <p class="statement" style="margin-top:4px">Up to <b>five numbers</b> on Today, in <b>your order</b>.</p>
      <div class="between mt20"><span class="micro">PREVIEW</span><span class="callout">5 of 5 chosen</span></div>
      <div class="tp-mini mt8">
        <div class="tint health"><small>Readiness</small><b>72</b></div><div class="tint work"><small>Sleep</small><b>7h 10m</b></div>
        <div class="tp-wide"><small>Fuel</small><b>1,420</b></div>
        <div><small>Load</small><b>11.4</b></div><div><small>Stress · estimate</small><b>1.4</b></div>
      </div>
      <p class="callout mt8">Updates Today’s Body snapshot as you change it.</p>
      <div class="card pad16 rows mt16">${chosen.map(n => `<div class="row" style="min-height:46px;padding:3px 0"><span class="tp-grip" aria-hidden="true"></span><span class="mid"><b>${n}</b></span><button class="round sm press" aria-label="Take ${n} off Today">${ic('remove', 's16')}</button></div>`).join('')}</div>
      <div class="micro mt20">MORE NUMBERS · TAKE ONE OFF TO ADD ANOTHER</div>
      <div class="mt8" style="display:flex;flex-wrap:wrap;gap:8px">${['HRV', 'Resting heart rate', 'Steps', 'Body signals'].map(t => `<button class="chip q press">${ic('add', 's14')}${t}</button>`).join('')}</div>
    </div></div>${foot(btn('Done'))}`;
  }

  /* Routines: each one drawn across the year ahead */
  function routines() {
    const year = (on, next) => `<div class="tp-year" aria-hidden="true">${'NDJFMAMJJASO'.split('').map((m, k) => `<span class="${k === next ? 'tp-next' : on.includes(k) ? 'tp-on' : ''}"><i></i>${m}</span>`).join('')}</div>`;
    const all = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const one = (photo, when, name, what, strip) => `<div class="between"><span class="micro">${when}</span>${chip('Active', 'done')}</div>
        <div style="display:flex;align-items:center;gap:12px;margin-top:12px"><span class="thumb" style="${img(photo)};background-position:center 75%"></span><div><div class="headline">${name}</div><p class="callout">${what}</p></div></div>${strip}`;
    return `${status()}${pushBar('Routines')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Jobs that repeat, kept in order</span>
      <p class="display"><b>2 routines</b> running. The next one is <b class="nw">${ic('wallet')}payday</b>, in <b class="nw">12 days</b>.</p>
      <div class="card mt24">${one('payslip', 'Every month · next 28 Nov', 'Payday sweep', 'Move what’s left after bills into your buffer.', year(all, 0))}</div>
      <div class="card mt12">${one('letter', 'Every year · next April', 'Annual NI and tax check', 'Check last year against your HMRC record.', year([5], -1))}</div>
      ${secHead('Available at level 3')}
      <div class="card pad16 rows">
        ${row('heart', 'Care review', 'Every year, you pick the month · bloodwork and a GP check-in', chip('Level 3', 'q'))}
        ${row('repeat', 'Subscription check', 'Every 3 months · cancel what you don’t use', chip('Level 3', 'q'))}
      </div>
    </div></div>`;
  }

  /* Why am I seeing this: the decision, the three signals, and a way back */
  function why(s) {
    const back = s === 'back';
    return `${todayBar()}${todayStrip(back ? `Your <b class="nw">${ic('doc')}P87</b> is back on <b>today</b>. About <b class="nw">6 minutes</b>.` : `Today is <b>lighter</b>. <b>One small task</b>, and the P87 waits until tomorrow.`)}
    <div class="sheet"><div class="handle" style="margin-bottom:16px"></div>
      <div class="between"><span class="eyebrow">${orb('ring', 18)}Why today is lighter</span>${round('close', { label: 'Close', cls: 'sm' })}</div>
      <p class="statement mt12">${back ? `Put back. <b>The P87</b> is on <b>today</b> again, as it was.` : `life moved <b>the P87</b> to tomorrow and kept <b>one small task</b> today.`}</p>
      <div class="micro mt20">THE THREE SIGNALS IT USED</div>
      <div class="tp-sigs mt8">
        <div class="tint health"><small>Readiness</small><b>41</b><span>Low for you</span></div>
        <div class="tint work"><small>Sleep</small><b>5h 50m</b><span>Need was 8h 05m</span></div>
        <div class="tp-pic" style="${img(K.MOODS.drained.photo)};background-position:center 72%"><small>Pulse</small><b>Drained</b><span>This morning</span></div>
      </div>
      <p class="callout mt12">Your HRV is below your normal range of 47 to 56.</p>
      <div class="mt20" style="display:flex;gap:8px"><button class="btn ghost press" style="width:auto;padding:0 20px" data-set="${back ? '' : 'back'}">${back ? 'Undo' : 'Put it back'}</button>${btn(back ? 'Done' : 'Keep it lighter', { set: back ? 'back' : '' })}</div>
    </div>`;
  }

  /* Calendar-aware day: the day's shape, busy or free, and the one gap */
  function calendar() {
    const blk = (t, cls, h, label) => `<time>${t}</time><div class="tp-blk ${cls}" style="min-height:${h}px">${label}</div>`;
    return `${status()}${pushBar('Your day')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Mon 16 Nov · 6h 20m booked</span>
      <p class="display">A <b>busy day</b>. life found <b>${ic('clock')}one 20-minute gap</b> for the <b>P87</b>.</p>
      <div class="tp-day mt24">
        ${blk('09:00', '', 52, 'Busy')}
        ${blk('10:30', 'tp-free', 30, 'Free')}
        ${blk('11:00', '', 68, 'Busy')}
        ${blk('13:00', 'tp-soft', 34, 'Lunch')}
        <time style="color:var(--ink)">13:40</time><div class="tp-blk tp-gap"><span style="flex:1"><span class="micro"><span class="sig"></span>FREE · 20 MIN</span><b class="title" style="display:block;margin-top:6px">life will nudge you here</b><span style="display:block;margin-top:2px;color:var(--ink2)">Finish the P87.</span></span><span class="thumb" style="${img('payslip')};background-position:center 75%"></span></div>
        ${blk('14:00', '', 96, 'Busy')}
        ${blk('17:30', 'tp-soft', 34, 'Run')}
      </div>
      <p class="callout mt16">life only reads when you’re busy or free, never the details of your events.</p>
    </div></div>`;
  }

  /* Morning brief: a moment. One photograph, three lines, one way in */
  function morningbrief() {
    return `<div class="full-photo fade" style="${img('calmdesk')}"></div><div class="tp-scrim"></div>
    ${status('on-photo')}
    <header class="bar on-photo"><span class="chip onphoto">Tuesday · 07:12</span>${photoBtn('close', 'Close')}</header>
    <div style="flex:1"></div>
    <div class="on-photo" style="position:relative;z-index:2;padding:0 20px 10px">
      <span class="title">Good morning, Ama</span>
      <p class="display" style="font-size:30px;line-height:36px;letter-spacing:-.9px;margin-top:8px">You slept <b class="nw">${ic('moon')}7h 20m</b>, and you’re <b>well recovered</b>. Today: <b class="nw">${ic('doc')}one bill</b> and a <b class="nw">${ic('walk')}20-minute run</b>. One step closer to your <b class="nw">${ic('home')}first home</b>.</p>
      <button class="tp-listen press mt20" aria-label="Listen to your brief, 20 seconds"><span class="tp-play">${ic('play', 's16')}</span>${wave(20)}<span>Listen · 0:20</span></button>
    </div>
    <div class="foot" style="background:none;position:relative;z-index:2"><button class="btn press" style="background:var(--on-photo);color:#0D0E10">Start the day</button></div>`;
  }

  /* Close the day: a moment at dusk. Ticks, what moved, one line */
  function evening() {
    const did = (t, area) => `<div class="row" style="min-height:46px;padding:4px 0"><span class="tick on">${ic('check', 's14')}</span><span class="mid"><b>${t}</b></span><span class="callout">${area}</span></div>`;
    return `<div class="full-photo fade" style="${img('calm')};bottom:auto;height:480px;background-position:center 100%"></div>
    ${status('on-photo')}
    <header class="bar on-photo"><span class="chip" style="background:var(--photo-fill);color:var(--on-photo)">Tuesday, done</span>${photoBtn('close', 'Close')}</header>
    <div class="on-photo" style="flex:1;min-height:0;position:relative;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;padding:0 20px 24px">
      <div class="tp-ticks" aria-hidden="true"><span>${ic('check', 's18')}</span><span>${ic('check', 's18')}</span><span>${ic('check', 's18')}</span><span class="tp-moved">${ic('arrow', 's18')}</span></div>
      <p class="display" style="font-size:44px;line-height:48px;letter-spacing:-1.32px;margin-top:16px"><b>3 of 4 moves.</b> A good day.</p>
    </div>
    <div class="sheet" style="padding-top:10px">
      ${did('Paid the energy bill', 'Money')}${did('20-minute run', 'Body')}${did('Read your Aim', 'Aim')}
      <div class="row" style="min-height:52px;padding:4px 0"><span class="tick">${ic('arrow', 's14')}</span><span class="mid"><b>Call the dentist</b><span>Moved to tomorrow, 9:30</span></span><span class="callout">Tomorrow</span></div>
      <div class="micro mt12">ONE LINE ABOUT TODAY?</div>
      <div class="tp-note mt8">Felt sharper after the run.<i></i></div>
      <div class="mt16">${btn('Close the day')}</div>
    </div>`;
  }

  /* From life: what's new in front as a photograph, the rest as pictures of what they're about */
  function inbox() {
    return `${status()}${pushBar('From life', `<button class="chip press">Read all</button>`)}
    <div class="scroll"><div class="rise">
      <p class="display" style="margin-top:4px"><b>2 new</b> from life. Nothing important lives only here.</p>
      <div class="stack mt24" style="padding-top:28px">
        <div class="peek"><span style="display:flex;align-items:center;gap:6px"><i class="tp-unread"></i>20 free minutes before 14:00</span><span>Nudge · 11:20</span></div>
        <button class="pcard press" style="${img('payslip')};height:236px;background-position:center 70%">
          <span class="topline"><span class="chip onphoto"><i class="tp-unread"></i>New · 2h ago</span><span class="chip onphoto">Tax rebate</span></span>
          <span class="copy"><b>You’re likely owed £840</b><span>From work expenses you told life about. One form claims it.</span></span>
        </button>
      </div>
      ${secHead('Earlier')}
      <div class="card pad16 rows">
        ${thumbRow('bedroom', 'Your sleep was 40 min short', 'Body · today, 07:05')}
        ${thumbRow('cook', 'Sam added 2 things to shopping', 'Shared · yesterday')}
        ${thumbRow('journal', 'Weekly recap is ready', 'Grow · Sunday')}
      </div>
    </div></div>`;
  }

  /* Focus session: one figure, the orb turning, nothing else */
  function focus(s) {
    const paused = s === 'paused';
    return `${status()}${textBar('Deep work', '2 of 3')}
    <div class="scroll" style="display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center">
      ${orb(paused ? 'ring' : 'thinking', 150)}
      <div class="xl" style="margin-top:28px">38:06</div>
      <p class="callout" style="margin-top:6px">${paused ? 'Paused. Still yours when you’re back.' : 'left in this block'}</p>
      <div class="tp-sess mt24" role="img" aria-label="Block 2 of 3"><i class="tp-on"></i><i class="tp-now"></i><i></i></div>
      <p class="title mt24">Portfolio case study</p>
      <span class="chip q" style="margin-top:10px">${ic('moon', 's14')}Notifications quiet</span>
    </div>
    ${foot(btn(paused ? 'Resume' : 'Pause', { icon: paused ? 'play' : 'pause', set: paused ? '' : 'paused' }) + `<button class="callout" style="text-align:center">End early</button>`)}`;
  }

  K.screen('nudge', { from: '3, 14, 11', note: 'The notification, opened: why now in one sentence, the form as a photograph with its three timed steps, then the gap in your day, what’s already in hand and what happens after. Tap “At 6pm”.', build: nudge });
  K.screen('pulse', { from: '19, 5, the video', note: 'Today’s feeling check on its own: the same drawer over Today, with the field at its largest. Move the orb, then set the pace.', build: pulse, mount: (el, state) => state.startsWith('set') ? null : K.feelMount(el) });
  K.screen('checkin', { from: '5, 14', note: 'A quiet photograph carrying the last seven days as dots, five of them heavy, then where real support is. Never a diagnosis.', build: checkin });
  K.screen('customise', { from: '12, 11', note: 'A live preview of Today’s tiles on top, your five in order below, the rest waiting as chips.', build: customise });
  K.screen('routines', { from: '5, 17', note: 'Each routine drawn across the year ahead in dots, with the next payday picked out.', build: routines });
  K.screen('why', { from: 'the video, 12', note: 'A sheet over Today: what life changed, the three signals it used (the mood as its photograph), and a way to put it back. Tap “Put it back”.', build: why });
  K.screen('calendar', { from: '19, 16', note: 'The day’s shape as a ribbon of busy and free, with the one 20-minute gap picked out. Events show as “Busy” because life never reads their details.', build: calendar });
  K.screen('morningbrief', { from: '10, 3, 2', note: 'A moment: morning light edge to edge, the brief as one sentence with icons in it, listen or start.', build: morningbrief });
  K.screen('evening', { from: '2, 14, 11', note: 'A moment at dusk: four ticks and a big line, then what you did, what moved and one line to keep.', build: evening });
  K.screen('inbox', { from: '18, 14', note: 'What’s new sits in front as a photograph with the next one behind it; earlier things are pictures of what they’re about.', build: inbox });
  K.screen('focus', { from: '4, 9', note: 'The orb is the picture: it turns as a sphere over one figure. Three dots count the blocks. Tap Pause.', build: focus });

  /* ═══ PLAN ════════════════════════════════════════════ */

  /* Draft message: the letter itself, with your details picked out */
  function draft() {
    return `${status()}${sheetBar('Draft message')}
    <div class="scroll"><div class="rise">
      <div class="card pad16" style="display:flex;align-items:center;gap:12px;margin-top:4px"><span class="thumb" style="${img('payslip')};background-position:center 75%"></span><span style="flex:1"><span class="title" style="display:block">Tax rebate</span><span class="callout">Already filled in with your details</span></span>${chip('Ready', 'done')}</div>
      <div class="gap8 mt12">${field('To', 'HMRC · PAYE enquiries')}${field('Subject', 'P800 refund: bank transfer')}</div>
      <div class="card mt12 tp-letter">
        <p><b>Hello,</b></p>
        <p>I’m following up on my P800 calculation for <b>2024/25</b> (ref <b>P800-7Q2-K41</b>). I’ve also submitted form <b>P87</b> today for <b>£1,240</b> of work equipment and software.</p>
        <p>Please pay the refund by <b>bank transfer</b> to the account on my Personal Tax Account.</p>
        <p>Thank you,<br><b>Ama Mensah</b><br>NI QQ 12 34 56 C</p>
      </div>
      <p class="callout mt12">Tap the text to edit. life never sends anything without you.</p>
    </div></div>
    <div class="foot" style="flex-direction:row"><button class="btn ghost press" style="width:auto;padding:0 20px">${ic('copy', 's18')}Copy</button>${btn('Open in Mail', { icon: 'arrow', trail: true })}</div>`;
  }

  /* Things to know: each insight is a picture of where it came from, with its one figure */
  function ttk() {
    const know = (photo, pos, dot, src, fig, unit, text) => picCard(photo, pos, `<span class="micro">${areaDot(dot)}${src}</span><span class="num" style="display:block;margin-top:8px">${fig}<small style="font-size:13px;letter-spacing:0;font-weight:500;color:var(--ink2);margin-left:4px">${unit}</small></span><span class="callout" style="display:block;margin-top:4px">${text}</span>`, 'mt12');
    return `${status()}${pushBar('Things to know')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow"><span class="star"></span>3 new</span>
      <p class="display">What life has <b>found for you</b>, and <b>where it came from</b>.</p>
      <div class="mt20">${areaChips(['All', 'You', 'Home', 'Work', 'Money', 'Health', 'Goals'])}</div>
      <button class="pcard press mt16" style="${img('payslip')};height:220px;background-position:center 72%"><span class="topline"><span class="chip onphoto">Money · from your talk · 12 Nov</span></span><span class="copy"><b style="font-size:44px;line-height:48px;letter-spacing:-1.32px">£840</b><span>You’re likely owed a tax rebate for 2024/25 work expenses.</span></span></button>
      ${know('bench', 'center 30%', 'health', 'Health · illustrative saved referral', '11', 'weeks', 'You have been waiting for a referral. Check its status with the provider; no expiry has been verified.')}
      ${know('letter', 'center 60%', 'home', 'Home · from a letter you scanned', '25%', 'off', 'Living alone gets 25% off council tax. Takes 4 minutes to apply.')}
      <div class="card mt12" style="background:var(--surface2);box-shadow:none"><span class="micro">${ic('book', 's14')}How the world works · Money mechanics</span><p class="statement mt8"><b>Tax relief is applied, not given.</b></p><p class="body mt8">Most reliefs only reach you if you claim them. HMRC won’t add work expenses you never told them about.</p></div>
    </div></div>`;
  }

  /* Missions history: the total under an open sky, then what it's made of */
  function history() {
    const h = (photo, t, s, end) => thumbRow(photo, t, s, `<span class="end">${end}</span>`);
    return `${status()}${pushBar('Cleared')}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('sky')};height:220px;background-position:center 8%"><span class="topline"><span class="chip onphoto">${ic('check', 's14')}5 cleared</span></span><span class="copy"><span>Found and claimed since joining</span><b style="font-size:56px;line-height:58px;letter-spacing:-2.5px;font-variant-numeric:tabular-nums">£3,343<small style="font-size:20px;letter-spacing:-.4px;color:var(--on-photo2)">.00</small></b></span></div>
      <p class="statement mt20"><b>The total keeps growing.</b> This is what it’s made of.</p>
      <div class="micro mt20">NOVEMBER</div>
      <div class="card pad16 rows mt8">
        ${h('payslip', 'HMRC tax rebate', 'Cleared 22 Nov', '£840')}
        ${h('letter', 'Council tax review', 'Cleared 3 Nov · confirmed correct', '£0')}
        ${h('freedom', 'Cancelled 2 subscriptions', 'Cleared 1 Nov', '£383/yr')}
      </div>
      <div class="micro mt20">OCTOBER</div>
      <div class="card pad16 rows mt8">
        ${h('aimdesk', 'Payday sweep set up', 'Cleared 28 Oct', '£180/mo')}
        ${thumbRow('walk', 'GP blood test booked', 'Cleared 20 Oct', chip('Health', 'q'))}
      </div>
      <p class="callout mt16">Each figure is the outcome you recorded when it cleared.</p>
    </div></div>`;
  }

  /* Do it for me (parked): the plan as a short trail, what it will never do, and one dark drawer to decide */
  function doitforme() {
    const step = (n, t, s) => `<div class="tl-item"><div class="when">STEP ${n}</div><p>${t}</p><span class="callout">${s}</span></div>`;
    return `${status()}${sheetBar('Cancel Streamly')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow" style="margin-top:4px">${orb('ring', 18)}life can do this for you</span>
      <p class="display">Cancel <b>Streamly</b>, save <b class="nw">£10.99</b> a month.</p>
      <div class="tl mt24">
        ${step(1, 'Open your Streamly account page', 'Using the sign-in you approve')}
        ${step(2, 'Choose “Cancel membership”', 'No offers accepted')}
        ${step(3, 'Save the confirmation', 'Filed to Money → Subscriptions')}
      </div>
      <div class="card pad16 mt24" style="display:flex;gap:12px;align-items:flex-start">${icBox('shield')}<span style="flex:1"><span class="title" style="display:block">It will never</span><span class="callout" style="display:block;margin-top:2px">Pay for anything, type a password for you, or accept new terms without asking.</span></span></div>
    </div></div>
    <div class="drawer"><h3>Let life cancel it?</h3><p>Approve and life does it. Or do it yourself.</p>
      <div class="decide"><button class="side press" aria-label="I’ll do it myself">${ic('close', 's18')}</button><i class="dotsep"></i><i class="dotsep"></i><button class="knob press" aria-label="Approve and do it">${ic('check')}</button><i class="dotsep"></i><i class="dotsep"></i><button class="side press" aria-label="Ask life first">${ic('help', 's18')}</button></div></div>`;
  }

  /* All missions: the counts as dots, today's in front as a photograph, the rest as pictures */
  function missions() {
    const cells = Array.from({ length: 17 }, (_, k) => k < 11 ? 'on' : k < 13 ? 'miss' : k === 13 ? 'now' : '');
    return `${status()}${pushBar('Missions', round('add', { label: 'Add a mission' }))}
    <div class="scroll"><div class="rise">
      <p class="display" style="margin-top:4px"><b>4 need you.</b> 2 are waiting, 11 are cleared.</p>
      <div class="mt16">${dots(cells, 17)}</div>
      <div class="mt20">${seg(['All', 'Money', 'Home', 'Body'])}</div>
      <button class="pcard press mt16" style="${img('payslip')};height:210px;background-position:center 72%"><span class="topline"><span class="chip onphoto"><i class="tp-unread"></i>Today · step 2 of 4</span><span class="chip onphoto">£840</span></span><span class="copy"><b>Claim your tax rebate</b><span>Money · one form left</span></span></button>
      <div class="pgrid mt12">
        <button class="pcard press" style="${img('work')};height:170px"><span class="topline"><span class="chip onphoto">This week</span></span><span class="copy"><b style="${SMALL}">Register as self-employed</b><span>Money · due 5 Oct</span></span></button>
        <button class="pcard press" style="${img('walk')};height:170px;background-position:center 30%"><span class="topline"><span class="chip onphoto">This week</span></span><span class="copy"><b style="${SMALL}">Book a GP blood test</b><span>Body · 10 min</span></span></button>
      </div>
      ${secHead('Waiting, not forgotten', '2')}
      <div class="card pad16 rows">${thumbRow('letter', 'Council tax discount', 'Sent 3 Nov · reply in about 2 weeks', chip('Waiting', 'q'))}</div>
      <button class="card pad16 press mt12" style="display:flex;align-items:center;justify-content:space-between"><span class="title">11 cleared</span><span class="link">What they were worth ${ic('chev', 's16')}</span></button>
    </div></div>`;
  }

  /* Add something: you say it, life shows the goal it would make and the first move */
  function newgoal() {
    return `${status()}${sheetBar('A new goal', round('mic', { label: 'Say it', cls: 'sm' }))}
    <div class="scroll"><div class="rise">
      <div class="chatcol" style="margin-top:4px">${bubble('I want to move out of my parents’ by next summer')}</div>
      <span class="eyebrow mt20">${orb('ring', 18)}life would make this</span>
      <div class="pcard mt12" style="${img('bedroom')};height:190px;background-position:center 78%"><span class="topline"><span class="chip onphoto">Goal · 3 steps</span></span><span class="copy"><b>Move out by July 2027</b></span></div>
      <div class="tl mt20">
        <div class="tl-item now"><div class="when">FIRST MOVE</div><p>Work out what you can afford</p></div>
        <div class="tl-item"><div class="when">THEN</div><p>Save a £2,400 deposit and first month</p></div>
        <div class="tl-item"><div class="when">THEN</div><p>Check renter schemes in your area</p></div>
      </div>
      <div class="micro mt20">OR START FROM</div>
      <div class="mt8">${softChips(['Clear a debt', 'Get fitter', 'Start a business', 'Learn to invest'])}</div>
    </div></div>${foot(btn('Add to Plan'))}`;
  }

  /* Area: Home. The photograph is the page's top; the page rises over it */
  function areahome() {
    return `<div class="full-photo fade" style="${img('areahome')};bottom:auto;height:340px;background-position:center 42%"></div>
    ${status('on-photo')}
    <header class="bar on-photo">${photoBtn('back', 'Back')}${photoBtn('more', 'More')}</header>
    <div class="on-photo" style="height:200px;flex:none;position:relative;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;padding:0 20px 28px">
      <span class="chip onphoto" style="align-self:flex-start">Area · Steady</span>
      <div style="font-size:44px;line-height:48px;letter-spacing:-1.32px;font-weight:600;margin-top:10px">Home</div>
      <span class="callout" style="color:var(--on-photo2)">Renting now. Aim: your own place by June 2029.</span>
    </div>
    <div class="scroll" style="background:var(--canvas);border-radius:28px 28px 0 0;position:relative;z-index:2;padding-top:20px;margin-top:-12px"><div class="rise">
      <button class="card tint home press"><span class="between"><span class="micro">Deposit plan</span><span class="title">24%</span></span><span class="headline" style="display:block;margin-top:10px">£11,760 of £49,000</span>${ruler(24)}<span class="callout" style="display:block;margin-top:8px">£800 a month</span></button>
      <div class="card pad16 rows mt12">${thumbRow('letter', 'Council tax discount', 'Mission · waiting on reply', chip('Waiting', 'q'))}</div>
      <div class="pgrid mt12">
        <button class="pcard press" style="${img('bedroom')};height:170px;background-position:center 75%"><span class="topline"><span class="chip onphoto">Tool · level 2</span></span><span class="copy"><b style="${SMALL}">Your next home: bedrooms</b></span></button>
        <button class="pcard press" style="${img('keyshome')};height:170px;background-position:58% 68%"><span class="topline"><span class="chip onphoto">Idea · 60 seconds</span></span><span class="copy"><b style="${SMALL}">Lifetime ISA</b></span></button>
      </div>
    </div></div>`;
  }

  /* Area: Health. The admin side; the photograph is the door to Body */
  function areahealth() {
    return `${status()}${pushBar('', round('more', { label: 'More' }))}
    <div class="scroll"><div class="rise">
      <div class="eyebrow-row"><span class="eyebrow">Area · Health</span>${chip('Good', 'done')}</div>
      <p class="display"><b>The admin of staying well.</b> GP, prescriptions, dentist, tests.</p>
      <button class="checkin press mt24" style="${img('run')};height:176px;background-position:center 52%"><span class="copy"><b>Body</b><span>How you feel day to day lives here.</span></span><span class="go">${ic('arrow', 's18')}</span></button>
      <div class="card mt12"><div style="display:flex;gap:12px;align-items:center"><span class="thumb" style="${img('walk')};background-position:center 30%"></span><span style="flex:1"><span class="micro"><span class="sig"></span>Mission · 10 min</span><span class="title" style="display:block;margin-top:4px">Book a GP blood test</span></span></div><div class="mt16">${btn('Open mission', { icon: 'arrow', trail: true })}</div></div>
      <div class="tiles mt12">
        ${tile({ label: 'Dentist check-up', value: 'March', sub: 'When it’s due' }).replace('class="tile ', 'class="tile tint health ')}
        ${tile({ label: 'Prescriptions', value: '£60', small: 'a year', sub: 'Prepayment could save this' }).replace('class="tile ', 'class="tile tint money ')}
      </div>
      <div class="card pad16 rows mt12">${row('doc', 'Bloodwork reader', 'Tool', chip('Level 3', 'q'))}</div>
      <p class="callout mt16">Wellness admin from what you’ve told life, not medical advice.</p>
    </div></div>`;
  }

  /* Area: Work. The photograph stands beside the two numbers that matter */
  function areawork() {
    return `${status()}${pushBar('', round('more', { label: 'More' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Area · Work</span>
      <p class="display"><b>Freelance designer.</b> Aim: <b>£70k</b> by next year.</p>
      <div class="mt24" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <div class="pcard" style="${img('areawork')};background-size:auto 150%;background-position:42% 86%"><span class="topline"><span class="chip onphoto">Progress</span></span><span class="copy"><b>Building</b></span></div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${tile({ label: 'Unpaid invoices', unit: '3', value: '£2,400', sub: 'Invoice tracker' }).replace('class="tile ', 'class="tile tint work ')}
          ${tile({ label: 'Self-employed', value: '5 Oct', sub: 'Register by then' })}
        </div>
      </div>
      <div class="mt12">
        ${acc('Missions', 1, `<div class="rows">${thumbRow('payslip', 'Register as self-employed', 'Due 5 Oct')}</div>`, true)}
        ${acc('Tools', 2, `<div class="rows">${thumbRow('work', 'Income and structure', 'Sole trader or Ltd?')}${thumbRow('aimdesk', 'Invoice tracker', '3 unpaid · £2,400')}</div>`)}
        ${acc('Ideas', 1, `<div class="rows">${thumbRow('calmdesk', 'Deep work', 'Idea · Cal Newport lens')}</div>`)}
      </div>
    </div></div>`;
  }

  K.screen('draft', { from: '7, 11', note: 'The letter itself is the screen, with the details life filled in picked out in ink. Copy it or open it in Mail.', build: draft });
  K.screen('ttk', { from: '14, 12, 15', note: 'Each insight is a picture of where it came from with its one figure: £840 leads, then the referral and the letter, then the idea behind them.', build: ttk });
  K.screen('history', { from: '2, 14', note: 'The total sits under an open sky, the same sky a mission clears on. Below, each cleared thing with what it was worth.', build: history });
  K.screen('doitforme', { from: '19, 3', note: 'Parked. Kept as a design only: the three steps as a trail, what life will never do, and one dark drawer to approve or do it yourself.', build: doitforme });
  K.screen('missions', { from: '5, 18, 14', note: 'Seventeen dots say where everything stands. Today’s mission leads as a photograph; the next two sit beside each other.', build: missions });
  K.screen('newgoal', { from: '7, 19, 14', note: 'You say it in your own words; life shows the goal it would make as a picture, with the first move picked out.', build: newgoal });
  K.screen('areahome', { from: '10, 14, 17', note: 'The photograph is the top of the page and the page rises over it: deposit, what’s waiting, then a tool and an idea as pictures.', build: areahome });
  K.screen('areahealth', { from: '17, 12, 3', note: 'Health is the admin of staying well. The running photograph is the door to Body; one mission, two calm tiles.', build: areahealth });
  K.screen('areawork', { from: '17, 12, 14', note: 'The photograph stands beside the two numbers that matter, then missions, tools and ideas open one at a time.', build: areawork });

  /* ═══ YOU ═════════════════════════════════════════════ */

  /* Count steppers: the kit stepper, with the board's data-set wired to its two buttons */
  const stepSet = (n, unit, lo, hi) => stepper(n, unit)
    .replace('aria-label="Fewer"', `aria-label="Fewer" data-set="${Math.max(lo, n - 1)}"`)
    .replace('aria-label="More"', `aria-label="More" data-set="${Math.min(hi, n + 1)}+"`);
  const count = (s, def, lo, hi) => { const v = parseInt(s, 10); return Number.isFinite(v) ? Math.max(lo, Math.min(hi, v)) : def; };

  /* Household: a sheet over your details. A person steps in each time you tap plus */
  function household(s) {
    const n = count(s, 1, 1, 6), added = s.endsWith('+');
    const line = n === 1 ? 'Living alone: you may get 25% off council tax.' : `${n} at home: the 25% single person discount usually stops.`;
    const crowd = Array.from({ length: n }, (_, k) => `<span class="${added && k === n - 1 ? 'tp-in' : ''}">${ic('person')}</span>`).join('');
    return `${status()}${pushBar('Your details', `<button class="chip press">Edit</button>`)}
    <div class="scroll dim" style="overflow:hidden">
      <div style="display:flex;align-items:center;gap:14px;margin-top:8px"><span class="thumb" style="${img('desk')};width:56px;height:56px;border-radius:50%"></span><span><span class="headline" style="display:block">Ama Mensah</span><span class="callout">Level 1 · Stabilize</span></span></div>
      <div class="gap12 mt24">${pick('Lives in', 'Hackney, London', true)}${pick('Lives with', n === 1 ? 'Just me' : `${n - 1} ${n === 2 ? 'other' : 'others'}`, true)}</div>
    </div>
    <div class="sheet"><div class="handle" style="margin-bottom:16px"></div>
      <p class="statement">How many people live <b>in your home</b>, counting you?</p>
      <div class="tp-crowd mt20" aria-hidden="true">${crowd}</div>
      <div class="mt8">${stepSet(n, n === 1 ? 'person' : 'people', 1, 6)}</div>
      <div class="mt20">${says(line)}</div>
      <div class="mt20">${btn('Save household')}</div>
    </div>`;
  }

  /* Children: the same instrument on its own page of air, with smaller figures */
  function children(s) {
    const n = count(s, 0, 0, 5), added = s.endsWith('+');
    const line = n === 0 ? 'None: nothing extra to claim here.' : `${n} ${n === 1 ? 'child' : 'children'}: you may be able to claim Child Benefit. life will check.`;
    const crowd = n ? Array.from({ length: n }, (_, k) => `<span class="${added && k === n - 1 ? 'tp-in' : ''}">${ic('person')}</span>`).join('') : `<span class="tp-empty">${ic('person')}</span>`;
    return `${status()}${sheetBar('Children')}
    <div class="scroll" style="display:flex;flex-direction:column">
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center">
        <p class="display" style="text-align:center;margin-top:0">How many <b>children under 16</b> live with you?</p>
        <div class="tp-crowd tp-kids mt32" aria-hidden="true">${crowd}</div>
        <div class="mt12">${stepSet(n, '', 0, 5)}</div>
      </div>
      ${says(line)}
    </div>${foot(btn('Save'))}`;
  }

  /* Mood over time: three weeks by weekday, each day the photograph of how you arrived */
  function mood() {
    const M = K.MOODS;
    const weeks = [['drained', 'calm', 'calm', 'driven', 'calm', '', 'peaceful'], ['drained', 'calm', 'anxious', 'calm', 'driven', 'calm', ''], ['drained']];
    const cell = id => id ? `<i class="${id === 'drained' ? 'tp-d' : ''}" style="${img(M[id].photo)};background-position:center 40%" title="${M[id].name}"></i>` : `<i class="tp-x" title="No check-in"></i>`;
    const grid = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => `<small>${d}</small>`).join('') + weeks.map(w => w.map(cell).join('')).join('') + '<i class="tp-f"></i>'.repeat(6);
    const key = Object.keys(M).map(id => `<span class="chip q"><i class="tp-face" style="${img(M[id].photo)};background-position:center 40%"></i>${M[id].name}</span>`).join('');
    return `${status()}${pushBar('How you’ve been')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">12 check-ins · last 14 days</span>
      <p class="display">Mostly <b>calm</b>, but <b>drained on Mondays</b> for three weeks running.</p>
      <div class="tp-mood mt24" role="img" aria-label="Three weeks of check-ins by weekday. Each Monday was drained.">${grid}</div>
      <div class="mt16" style="display:flex;flex-wrap:wrap;gap:6px">${key}</div>
      ${secHead('What life noticed')}
      <div class="card pad16 rows">
        ${thumbRow(M.drained.photo, 'Mondays are heavy', 'After Sundays with less than 6 hours’ sleep', chip('Pattern', 'q'))}
        ${thumbRow(M.calm.photo, 'Calmer after admin days', 'Clearing a mission lifts the next day', chip('Pattern', 'q'))}
        ${thumbRow(M.peaceful.photo, 'Keeping Mondays light', 'life now plans one small task for Mondays', chip('Applied', 'done'))}
      </div>
    </div></div>${foot(btn('Check in now'))}`;
  }

  /* What life knows: the trust screen. How much per area, then each fact with its source and a way out */
  function knows() {
    const areas = [['You', 'you', 70], ['Home', 'home', 55], ['Work', 'work', 40], ['Money', 'money', 75], ['Health', 'health', 45], ['Goals', 'goal', 30]];
    const fact = (photo, t, s) => `<div class="row"><span class="thumb" style="${img(photo)}"></span><span class="mid"><b>${t}</b><span>${s}</span></span><button class="chip q press">Remove</button></div>`;
    return `${status()}${pushBar('What life knows', round('info', { label: 'How life uses this' }))}
    <div class="scroll"><div class="rise">
      <p class="display" style="margin-top:4px"><b>214 things</b>, all from you or sources you connected.</p>
      <div class="card mt24"><div class="between"><span class="title">What life understands</span><span class="title">64%</span></div>
        ${areas.map(([n, a, p]) => `<div class="between" style="margin-top:10px"><span class="callout ink" style="width:62px;display:flex;align-items:center;gap:7px">${areaDot(a)}${n}</span><span style="flex:1;margin-top:-12px">${ruler(p, 24)}</span><span class="callout" style="width:32px;text-align:right">${p}%</span></div>`).join('')}</div>
      <div class="mt20">${areaChips(['All', 'You', 'Home', 'Work', 'Money', 'Health', 'Goals'])}</div>
      <div class="card pad16 rows mt12">
        ${fact('terrace', 'Age 27, London', 'From your talk · 12 Nov')}
        ${fact('keys', 'Rent £1,150 a month', 'From your talk · 12 Nov')}
        ${fact('letter', 'Heart referral, 11 weeks', 'From a referral you saved')}
        ${fact('bedroom', 'Average sleep 6h 58m', 'From Apple Health')}
        ${fact('keyshome', 'Own a two-bed flat by June 2029', 'Your Chief Aim')}
      </div>
      <p class="callout mt16">Delete everything removes your data from this phone and life’s servers. It can’t be undone.</p>
    </div></div>
    ${foot(btn('Export everything', { icon: 'arrowUp' }) + `<button class="callout" style="text-align:center">Delete everything</button>`)}`;
  }

  /* Your levels: four levels as a climbing path toward the photograph of where you're going */
  function levels() {
    const xs = [36, 109, 181, 254], ys = [134, 100, 66, 32];
    let trail = '';
    for (let k = 0; k < 3; k++) for (let j = 2; j <= 5; j++) trail += `<circle cx="${(xs[k] + (xs[k + 1] - xs[k]) * j / 7).toFixed(1)}" cy="${(ys[k] + (ys[k + 1] - ys[k]) * j / 7).toFixed(1)}" r="2.6" fill="var(--surface3)"/>`;
    const nodes = xs.map((x, k) => k === 0
      ? `<circle cx="${x}" cy="${ys[k]}" r="22" fill="var(--ember)"/><text x="${x}" y="${ys[k] + 6}" text-anchor="middle" font-size="16" font-weight="600" fill="var(--canvas)">1</text>`
      : `<circle cx="${x}" cy="${ys[k]}" r="17" fill="var(--surface3)"/><text x="${x}" y="${ys[k] + 5}" text-anchor="middle" font-size="14" font-weight="600" fill="var(--ink2)">${k + 1}</text>`).join('');
    const locked = (line, list) => `<p class="body">${line}</p>${list.map(t => `<div class="callout" style="display:flex;gap:8px;margin-top:8px">${ic('add', 's14')}<span>${t}</span></div>`).join('')}`;
    return `${status()}${pushBar('Your levels')}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('keyshome')};height:170px;background-position:55% 62%"><span class="topline"><span class="chip onphoto">Season 1 · Nov to Feb</span></span><span class="copy"><span>Climbing toward</span><b>Your first home</b></span></div>
      <div class="card mt12"><div class="between"><span class="title">Four levels this season</span><span class="callout">3 moves to Level 2</span></div>
        <div class="tp-path mt8"><svg viewBox="0 0 290 168" role="img" aria-label="Four levels as a climbing path. You are on level 1.">${trail}${nodes}</svg></div>
        <div class="tp-lv"><span class="tp-here">Stabilize</span><span>Set your routines</span><span>Build momentum</span><span>Expand your options</span></div></div>
      <div class="card mt12"><div class="micro">LEVEL 1 · YOU ARE HERE</div>
        <div class="headline" style="margin-top:10px">Stabilize</div>
        <p class="body" style="margin-top:4px">Know where your cash is going; handle anything time-sensitive.</p>
        <div class="mt8">${check('Save your 30-day cash plan')}${check('Review this year’s tax')}${check('Handle the hospital referral')}</div>
        <div class="micro mt12">UNLOCKS</div>
        <div class="mt8" style="display:flex;flex-wrap:wrap;gap:6px">${['30-day cash plan', 'Tax check', 'Sleep basics', '1 habit', 'Room for error', 'Remove before you add'].map(t => chip(t, 'q')).join('')}</div></div>
      <div class="mt12">
        ${acc('2 · Set your routines', '', locked('Bills, care and recurring costs on a routine you can keep.', ['Money ledger, subscriptions', 'Body: readiness, fuel, journal, 3 habits', 'Routines: payday sweep, annual tax check']))}
        ${acc('3 · Build momentum', '', locked('Use the breathing room for one bigger decision, safely.', ['Rent vs buy, income structure, bloodwork', 'Load, trends, journal insights, Teach it back', 'Routines: care review, subscription check']))}
        ${acc('4 · Expand your options', '', locked('Build assets, improve your safety nets, review what works.', ['Protection review, growth path', 'Advanced sleep planning, habit graduation', 'Season reset: your new normal becomes level 1']))}
      </div>
      <p class="callout mt16">Each level unlocks tools, routines and ideas when they become useful. Areas show progress, not separate levels.</p>
    </div></div>`;
  }

  /* Experiment: one change, fourteen days in dots, then now against your own baseline */
  function experiment() {
    const cells = Array.from({ length: 14 }, (_, k) => k < 8 ? 'on' : k === 8 ? 'now' : '');
    const vs = (name, now, base, a, b) => `<div><span class="callout ink" style="font-weight:600">${name}</span><div class="tp-vs" style="margin-top:8px"><span class="tp-now" style="width:${a}%">Now · ${now}</span><span style="width:${b}%">Baseline · ${base}</span></div></div>`;
    return `${status()}${pushBar('Experiment', round('more', { label: 'More' }))}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('calmdesk')};height:200px;background-position:center 84%"><span class="topline"><span class="chip onphoto">Day 9 of 14</span><span class="chip onphoto">Looking promising</span></span><span class="copy"><b>No caffeine after 12</b><span>5 more days until you know</span></span></div>
      <div class="mt16">${dots(cells, 14)}</div>
      ${secHead('So far', 'against your own baseline')}
      <div class="card tint work gap12">
        ${vs('Time to fall asleep', '14 min', '22 min', 64, 100)}
        ${vs('Deep sleep', '1h 22m', '1h 05m', 100, 79)}
        ${vs('Readiness', '66', '59', 100, 89)}
      </div>
      <div class="mt20">${says('5 more days and life will tell you if it’s a real effect for you or just noise.')}</div>
      <div class="micro mt24">NEXT IDEAS TO TEST</div>
      <div class="mt8">${softChips(['Morning daylight', 'Bedtime 22:45', 'No screens in bed'])}</div>
      <p class="callout mt16">One experiment at a time keeps the result clear. Wellness guidance, not a diagnosis.</p>
    </div></div>`;
  }

  /* What life remembers: what it used today as pictures, the rest with a swipe to forget */
  function memory() {
    const used = (photo, pos, t, s) => `<button class="pcard press" style="${img(photo)};flex:0 0 200px;width:200px;height:190px;background-position:${pos}"><span class="topline"><span class="chip onphoto">Used today</span></span><span class="copy"><b style="${SMALL}">${t}</b><span>${s}</span></span></button>`;
    const mem = (photo, t, s) => `<div class="row"><span class="thumb" style="${img(photo)}"></span><span class="mid"><b>${t}</b><span>${s}</span></span></div>`;
    return `${status()}${pushBar('', round('search', { label: 'Search memories' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">What life remembers</span>
      <p class="display"><b>24 things.</b> life used <b>3</b> of them today.</p>
      <div class="hscroll mt20" style="padding-bottom:16px">
        ${used('run', 'center 45%', 'Prefers morning workouts', 'From 6 workouts')}
        ${used('payslip', 'center 75%', 'Paid on the 28th', 'From your payslip')}
        ${used('bedroom', 'center 75%', 'Sleeps worse after late coffee', 'From an experiment')}
      </div>
      <div class="mt8">${seg(['All', 'Money', 'Body', 'People'])}</div>
      <div class="between mt20"><span class="micro">OTHER MEMORIES</span><span class="callout">Swipe to forget</span></div>
      <div class="tp-swipe mt8"><span class="tp-forget">Forget</span>${mem('birthday', 'Sister’s birthday, 3 March', 'You told life · Talk, Sep')}</div>
      <div class="card pad16 rows mt8">${mem('cook', 'Doesn’t eat pork', 'You told life · Fuel')}${mem('keyshome', 'Wants to buy a home by June 2029', 'Your Aim')}</div>
      <p class="callout mt16">life never remembers health details or money in ways you can’t see here.</p>
    </div></div>`;
  }

  /* Shared life: two people, the one thing you're building together, and what never leaves your side */
  function shared() {
    return `${status()}${pushBar('', round('add', { label: 'Share something' }))}
    <div class="scroll"><div class="rise">
      <div class="tp-duo" style="margin-top:4px">${avatar('A', true)}${avatar('S', true)}</div>
      <p class="display"><b>You and Sam</b> share <b>4 things</b>. The rest stays yours.</p>
      <div class="hero mt24"><span class="photo" style="${img('movein')};height:150px;background-position:center 72%"><span class="copy"><small>Joint goal</small><b>Deposit for a home</b></span></span>
        <div class="below tint home"><div class="between"><span class="headline">£14,200 of £30,000</span><span class="title">47%</span></div>
          <div class="tp-split" aria-hidden="true"><i class="tp-a" style="flex:8600"></i><i class="tp-s" style="flex:5600"></i><i style="flex:15800"></i></div>
          <div class="legend mt12"><span><i style="background:var(--ink)"></i>You £8,600</span><span><i style="background:var(--ac)"></i>Sam £5,600</span></div></div></div>
      <div class="card pad16 rows mt12">
        ${thumbRow('letter', 'Council tax', 'Due 1st · Sam pays', chip('Shared', 'q'))}
        ${thumbRow('home', 'Energy bill', '£96 · split 50/50', chip('Shared', 'q'))}
        ${thumbRow('cook', 'Shopping list', '6 items · Sam added 2', chip('Shared', 'q'))}
      </div>
      <div class="card pad16 mt12" style="background:var(--surface2);box-shadow:none;display:flex;gap:12px;align-items:flex-start">${ic('eyeOff')}<span style="flex:1"><span class="title" style="display:block">Never shared</span><span class="callout" style="display:block;margin-top:2px">Your health, journal, Pulse, and personal spending.</span></span></div>
    </div></div>`;
  }

  /* Your details: you as a photograph and one sentence, then what each detail changes */
  function profile() {
    return `${status()}${pushBar('Your details', `<button class="chip press">Edit</button>`)}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('desk')};height:200px;margin-top:4px"><span class="topline"><span class="chip onphoto">Level 1 · Stabilize</span></span><span class="copy"><b>Ama Mensah</b><span>Born 14 March 1999</span></span></div>
      <p class="statement mt20">You’re <b>27</b>, a <b class="nw">${ic('briefcase')}freelance designer</b> in <b class="nw">${ic('home')}Hackney</b>, living <b>on your own</b> and paid on the <b class="nw">${ic('calendar')}28th</b>.</p>
      <div class="micro mt24">WHAT EACH ONE CHANGES</div>
      <div class="card pad16 rows mt8">
        ${thumbRow('birthday', 'Birthday · 14 March 1999', 'Age rules, and your birthday recap')}
        ${thumbRow('terrace', 'Lives in · Hackney, London', 'Council tax, schemes')}
        ${thumbRow('work', 'Work · Freelance designer', 'Tax and structure')}
        ${thumbRow('home', 'Lives with · Just me', 'Discounts, benefits')}
        ${thumbRow('payslip', 'Pay day · 28th', 'When nudges land')}
      </div>
    </div></div>`;
  }

  K.screen('household', { from: 'the video, 6', note: 'One small question over your details. A person steps in each time you tap plus, and life says at once what the number changes.', build: household });
  K.screen('mood', { from: '5, 14, 1', note: 'Three weeks by weekday, each day shown as the photograph of how you arrived. The three drained Mondays are ringed.', build: mood });
  K.screen('children', { from: '6, the video', note: 'The same count instrument on a page of air, with smaller figures. Tap plus and one steps in.', build: children });
  K.screen('knows', { from: '5, 14, 17', note: 'The trust screen: how much life understands per area in ticks, then each fact as a picture with its source and a Remove.', build: knows });
  K.screen('levels', { from: '14, 5, 17', note: 'The four levels as a climbing path of dots toward the photograph of your first home. Level 1 is open; the rest unfold.', build: levels });
  K.screen('experiment', { from: '14, 5, 16', note: 'One change, fourteen days in dots, then now against your own baseline as paired bars. Plain about what is not known yet.', build: experiment });
  K.screen('memory', { from: '14, 15, 18', note: 'What life used today leads as three pictures; the rest sit below, one caught mid-swipe to show how to forget.', build: memory });
  K.screen('shared', { from: '14, 16, 12', note: 'Two people, the one goal you’re building together with each share drawn, the bills you split, and what never leaves your side.', build: shared });
  K.screen('profile', { from: '14, 3, 17', note: 'You as a photograph and one sentence, then each detail with what it changes, so it never reads as a form.', build: profile });
})();
