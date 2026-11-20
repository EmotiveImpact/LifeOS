// life · V26 — First open, and the orb and top bar pages. Written against review/v26/KIT.md.
(() => {
  'use strict';
  const K = window.L26;
  const { ic, img, status, round, rootBar, pushBar, textBar, sheetBar, foot, btn, chip, orb, toggle, stepper } = K;

  const back = ic('back', 's18') + 'Back';
  const notNow = (label = 'Not now') => `<button class="callout press" style="text-align:center">${label}</button>`;
  const small = 'font-size:16px;line-height:21px;letter-spacing:-.22px';
  const onDisc = 'background:var(--on-photo);color:#0D0E10';

  // One-off styles the kit lacks: the big mic, the photo rail, a camera framing guide, a tape of ticks, hour labels, a busy block.
  K.addCss('.fo-', `
    .fo-stage { flex: 1; min-height: 148px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
    .fo-mic { width: 72px; height: 72px; }
    .fo-mic .i { width: 28px; height: 28px; }
    .fo-rail { padding-bottom: 18px; margin-bottom: -14px; }
    .fo-rail .pcard { flex: 0 0 150px; height: 176px; border-radius: 20px; }
    .fo-wrap { flex-wrap: wrap; }
    .fo-opt { min-height: 54px; padding: 3px 0; }
    .fo-opt .ic { width: 36px; height: 36px; }
    .fo-tile { width: 72px; height: 72px; border-radius: 22px; background: var(--surface); box-shadow: var(--shadow); display: grid; place-items: center; color: var(--ink); }
    .fo-busy { height: 36px; border-radius: 12px; background: var(--surface2); display: flex; align-items: center; padding: 0 14px; margin-top: 2px; font-size: 13px; font-weight: 600; color: var(--ink2); }
    .fo-hours { position: relative; height: 14px; margin-top: 6px; }
    .fo-hours span { position: absolute; top: 0; transform: translateX(-50%); font-size: 11px; line-height: 13px; font-weight: 600; color: var(--quiet); font-variant-numeric: tabular-nums; white-space: nowrap; }
    .fo-tape { display: flex; align-items: flex-end; justify-content: space-between; height: 28px; }
    .fo-tape i { width: 2px; height: 10px; border-radius: 1px; background: var(--quiet); }
    .fo-tape .fo-five { height: 18px; background: var(--ink2); }
    .fo-tape .fo-here { width: 3px; height: 28px; background: var(--ember); }
    .fo-view { position: relative; z-index: 2; flex: none; height: 260px; }
    .fo-c { position: absolute; width: 26px; height: 26px; }
    .fo-c::before, .fo-c::after { content: ""; position: absolute; background: var(--on-photo); border-radius: 2px; }
    .fo-c::before { width: 26px; height: 3px; }
    .fo-c::after { width: 3px; height: 26px; }
    .fo-c1 { left: 28px; top: 8px; }
    .fo-c1::before, .fo-c1::after { left: 0; top: 0; }
    .fo-c2 { right: 28px; top: 8px; }
    .fo-c2::before, .fo-c2::after { right: 0; top: 0; }
    .fo-c3 { left: 28px; bottom: 76px; }
    .fo-c3::before, .fo-c3::after { left: 0; bottom: 0; }
    .fo-c4 { right: 28px; bottom: 76px; }
    .fo-c4::before, .fo-c4::after { right: 0; bottom: 0; }
    .fo-read { position: absolute; left: 20px; right: 20px; bottom: 16px; }
    .fo-spec { padding: 4px 0; overflow: hidden; }
    .fo-play { display: block; width: 120px; height: 120px; color: var(--ink); }
  `);

  /* ── Or just tell life ───────────────────────────────── */
  const TOPICS = [
    ['terrace', '66% center', 'Where you live and who with'],
    ['desk', '88% center', 'What you do for work'],
    ['payslip', 'center bottom', 'Anything worrying you about money'],
    ['walk', 'center 15%', 'Health things you’ve been putting off'],
    ['keyshome', 'center 90%', 'Where you want to be in a few years'],
  ];
  function tell(state) {
    const on = state !== 'idle';
    return `${status()}${textBar(back, 'Type instead')}
    <div class="scroll" style="display:flex;flex-direction:column"><div class="rise" style="display:flex;flex-direction:column;flex:1">
      <span class="eyebrow">Faster than questions</span>
      <p class="display"><b>Tell life about you,</b> in your own words.</p>
      <div class="fo-stage">${orb(on ? 'listening' : 'ring', 116)}<span class="micro">${on ? '<span class="sig"></span>Listening · 0:14' : 'Tap to start talking'}</span></div>
      <div class="between"><span class="micro">LIFE SUGGESTS</span>${on ? '<span class="micro">2 of 5 heard</span>' : ''}</div>
      <div class="hscroll fo-rail" style="margin-top:12px">${TOPICS.map(([p, pos, t], k) => `<button class="pcard press" style="${img(p)};background-position:${pos}"><span class="topline">${on && k < 2 ? `<span class="chip onphoto">${ic('check', 's14')}Heard</span>` : '<span></span>'}</span><span class="copy"><b style="${small}">${t}</b></span></button>`).join('')}</div>
    </div></div>
    <div class="foot" style="align-items:center;gap:12px"><button class="round ${on ? 'solid' : ''} press fo-mic" data-set="${on ? 'idle' : ''}" aria-label="${on ? 'Listening. Tap when you’re done' : 'Start talking'}" aria-pressed="${on}">${ic('mic')}</button>
      <div style="text-align:center"><p class="callout ink">Talk for a minute and life will set itself up.</p><p class="callout" style="text-wrap:balance">You’ll see everything it understood before anything is saved.</p></div></div>`;
  }

  /* ── Building your plan ──────────────────────────────── */
  const FOUND = [
    ['payslip', 'center bottom', '£840 back', 'Your tax record', 'HMRC · 2024/25'],
    ['terrace', '72% center', '25% off', 'Council tax discounts', 'London · single occupancy'],
    ['walk', 'center 30%', 'Urgent', 'NHS waiting times', 'Cardiology · Guy’s'],
    ['keyshome', 'center 88%', '2 found', 'Schemes you qualify for', 'Start Up Loans · LISA'],
  ];
  const urgentDot = '<i style="width:6px;height:6px;border-radius:50%;background:var(--ember)"></i>';
  function planBody(done) {
    return `<div style="display:flex;align-items:center;gap:14px">${orb(done ? 'done' : 'working', 52)}<div><div class="micro">${done ? '5 OF 5 CHECKED' : 'CHECKING 5 OF 5'}</div><div class="title" style="margin-top:4px">Your monthly costs</div><div class="callout">Rent, bills, subscriptions${done ? ' · Mapped' : ''}</div></div></div>
      <p class="display">Found <b class="nw">£2,340</b> you may be owed, <b>1 urgent deadline</b> and <b class="nw">6 things</b> to set up.</p>
      <div class="pgrid" style="margin-top:14px">${FOUND.map(([p, pos, tag, t, sub]) => `<button class="pcard press" style="${img(p)};height:150px;background-position:${pos}"><span class="topline"><span class="chip onphoto">${tag === 'Urgent' ? urgentDot : ''}${tag}</span></span><span class="copy"><b style="${small}">${t}</b><span>${sub}</span></span></button>`).join('')}</div>`;
  }
  function building(state) {
    const done = state === 'done';
    return `${status()}${pushBar('Building your plan', '', 'close')}
    <div class="scroll"><div class="rise">${planBody(done)}</div></div>
    ${foot((done ? btn('See my plan', { icon: 'arrow', trail: true, set: '' }) : btn('See my plan', { ghost: true, set: 'done' })) + '<span class="callout" style="text-align:center;text-wrap:balance">Estimates from what you told life and published rules, not a link to HMRC or the NHS.</span>')}`;
  }

  /* ── Where do you live? ──────────────────────────────── */
  const CITIES = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Bristol', 'Cardiff', 'Belfast'];
  function where(state) {
    const k = Number(state) || 0;
    return `${status()}${textBar(back, '2 of 3')}
    <div class="scroll" style="display:flex;flex-direction:column">
      <div class="rise">
        <p class="display" style="margin-top:8px"><b>Where do you live?</b></p>
        <p class="body mt8">Your area sets <b>council tax</b>, your <b>NHS trust</b>, <b>local schemes</b> and <b>what homes cost</b>.</p>
      </div>
      <div style="flex:1;min-height:20px"></div>
      <div class="pcard" style="${img(k === 0 ? 'terrace' : 'home')};height:190px;flex:none"><span class="topline"><span class="chip onphoto">${ic('home', 's14')}Your area</span></span><span class="copy"><b>${CITIES[k]}</b><span>Only your area is stored, never your exact address.</span></span></div>
      <div class="filters fo-wrap mt12" role="group">${CITIES.map((c, n) => `<button data-set="${n}" aria-pressed="${n === k}">${c}</button>`).join('')}</div>
      <button class="pick press mt12" style="flex:none"><span>${ic('search', 's18')}Search a town or postcode</span></button>
    </div>${foot(btn('Next: your work'))}`;
  }

  /* ── Save your progress (a sheet over the finished plan) ─ */
  function signin() {
    return `${status()}
    <div class="dim" style="flex:1;min-height:0;overflow:hidden;display:flex;flex-direction:column">${pushBar('Building your plan', '', 'close')}<div class="scroll" style="overflow:hidden">${planBody(true)}</div></div>
    <div class="sheet">
      <div style="margin:0 -20px">${sheetBar('Save your progress')}</div>
      <p class="statement"><b>Keep your plan safe.</b> Sign in so it survives a new phone.</p>
      <p class="body mt8">life never posts anything and never sells your data.</p>
      <div class="mt20">${btn('Continue with Apple')}</div>
      <div class="micro" style="justify-content:center;margin-top:16px">OR CONTINUE WITH</div>
      <div class="between mt8" style="gap:8px">${btn('Google', { ghost: true })}${btn('Email', { ghost: true })}</div>
      <button class="callout ink press" style="display:block;width:100%;text-align:center;margin-top:18px">Not now, keep it on this phone</button>
    </div>`;
  }

  /* ── Before Apple Health asks ────────────────────────── */
  const HEALTH = [
    ['bedroom', 'center 73%', 'Sleep', 'For your sleep need, debt and bedtime', true],
    ['breathe', 'center 36%', 'Heart rate and HRV', 'For your readiness score', true],
    ['run', 'center 64%', 'Workouts and steps', 'For your load', true],
    ['breakfast', 'center 73%', 'Food and water', 'Only if you log them elsewhere', false],
  ];
  function healthprimer() {
    return `${status()}${pushBar('', '', 'close')}
    <div class="scroll"><div class="rise">
      <p class="display" style="margin-top:4px">Plan around <b>how you actually slept.</b></p>
      <p class="body mt8">Connect Apple Health and Today gets lighter after a bad night, and harder when you’re ready for it.</p>
      <div class="pgrid mt16">${HEALTH.map(([p, pos, t, why, on]) => `<div class="pcard" style="${img(p)};height:156px;background-position:${pos}"><span class="topline"><span></span>${toggle(on, t)}</span><span class="copy"><b style="${small}">${t}</b><span>${why}</span></span></div>`).join('')}</div>
      <p class="callout mt12">Stays on your phone. Never in iCloud, never for ads. Change it any time in Settings.</p>
    </div></div>
    ${foot(btn('Continue') + notNow())}`;
  }

  /* ── One nudge a day, at most ────────────────────────── */
  function notifprimer() {
    const hours = Array.from({ length: 24 }, (_, h) => h === 13 ? '<i style="background:var(--ember)"></i>' : `<i class="${h >= 8 && h < 21 ? 'on' : ''}"></i>`).join('');
    return `${status()}${pushBar('', '', 'close')}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('calmdesk')};height:196px;background-position:center 70%">
        <div class="card pad16" style="color:var(--ink);box-shadow:var(--float)"><div class="between"><span class="callout ink" style="display:flex;align-items:center;gap:8px;font-weight:600">${orb('ring', 20)}life</span><span class="callout">now</span></div><p class="body ink" style="margin-top:6px">You’ve got 20 free minutes. Finish the P87 and £840 starts moving.</p></div>
        <span class="copy"><span>An example nudge</span></span>
      </div>
      <p class="display" style="margin-top:20px">Can life <b>tap you on the shoulder?</b></p>
      <p class="body mt8">One nudge a day at most, only when it’s worth it. Never between 9pm and 8am.</p>
      <div class="card pad16 mt16">
        <div class="between"><span><span class="title" style="display:block">Quiet hours</span><span class="callout">21:00–08:00</span></span>${toggle(true, 'Quiet hours')}</div>
        <div class="ruler" aria-hidden="true">${hours}</div>
        <div class="fo-hours" aria-hidden="true"><span style="left:33.3%">08:00</span><span style="left:56.3%;color:var(--ember-text)">1 nudge</span><span style="left:87.5%">21:00</span></div>
        <div class="between mt16"><span class="title">Deadlines under 24 hours</span>${toggle(true, 'Deadline alerts')}</div>
      </div>
    </div></div>
    ${foot(btn('Turn on nudges') + notNow())}`;
  }

  /* ── Before the mic asks ─────────────────────────────── */
  function micprimer() {
    return `${status()}${pushBar('', '', 'close')}
    <div class="scroll" style="display:flex;flex-direction:column">
      <div style="flex:1;min-height:220px;display:grid;place-items:center">${orb('listening', 220)}</div>
      <span class="eyebrow">${ic('mic', 's14')}Before the mic asks</span>
      <p class="display"><b>Talk to life,</b> out loud.</p>
      <p class="body mt8">life only listens <b>while you’re talking to it</b>. Your voice becomes <b>text on your phone</b> where it can, and the recording is <b>never kept</b>.</p>
    </div>
    ${foot(btn('Allow the microphone', { icon: 'mic' }) + notNow('I’ll type instead'))}`;
  }

  /* ── Before the camera asks ──────────────────────────── */
  function camprimer() {
    const use = (p, pos, t, sub) => `<div class="row"><span class="thumb" style="${img(p)};background-position:${pos}"></span><span class="mid"><b>${t}</b><span>${sub}</span></span></div>`;
    return `<div class="full-photo fade" style="${img('food')};bottom:auto;height:392px;background-position:center 56%"></div>
    ${status('on-photo')}
    <header class="bar on-photo"><span class="chip onphoto">${ic('camera', 's14')}Before the camera asks</span><button class="round press" style="${onDisc}" aria-label="Close">${ic('close', 's18')}</button></header>
    <div class="fo-view"><i class="fo-c fo-c1"></i><i class="fo-c fo-c2"></i><i class="fo-c fo-c3"></i><i class="fo-c fo-c4"></i>
      <div class="fo-read"><div class="micro" style="color:var(--on-photo2)">WHAT LIFE WOULD READ · AN EXAMPLE</div><div style="display:flex;gap:6px;margin-top:8px"><span class="chip onphoto">Salmon rice bowl</span><span class="chip onphoto">705 kcal</span><span class="chip onphoto">49g protein</span></div></div></div>
    <div class="sheet" style="flex:1;min-height:0;display:flex;flex-direction:column;padding-top:22px">
      <p class="display" style="margin-top:0">Snap it, and <b>life reads it.</b></p>
      <div class="rows mt8">${use('food', 'center', 'Meals', 'Calories and protein in a snap')}${use('letter', 'center 90%', 'Letters and payslips', 'Dates, amounts, what to do')}${use('label', 'center 80%', 'Barcodes', 'Exact food labels')}</div>
      <div style="flex:1"></div>
      <p class="callout">Photos are read, then deleted unless you keep them.</p>
      <button class="btn press mt12">Allow the camera</button>
      <button class="callout press" style="text-align:center;margin-top:10px">Not now</button>
    </div>`;
  }

  /* ── Before the calendar asks ────────────────────────── */
  function calprimer() {
    return `${status()}${pushBar('', '', 'close')}
    <div class="scroll"><div class="rise">
      <span class="fo-tile">${ic('calendar')}</span>
      <p class="display" style="margin-top:16px">Nudges that <b>fit your day.</b></p>
      <p class="body mt8">life looks at <b>when you’re busy</b>, never at what the meeting is about, and <b>never changes your calendar</b>.</p>
      <div class="card mt20">
        <div class="between"><span class="micro">WHAT LIFE SEES</span><span class="micro">READ ONLY</span></div>
        <div class="tl mt12">
          <div class="tl-item done"><div class="when">09:00</div><div class="fo-busy">Busy</div></div>
          <div class="tl-item now"><div class="when">13:40</div><div class="between"><p class="ink" style="font-weight:600">20 free minutes</p><span class="chip live">Nudge here</span></div></div>
          <div class="tl-item done"><div class="when">14:00</div><div class="fo-busy">Busy</div></div>
        </div>
      </div>
    </div></div>
    ${foot(btn('Allow calendar access') + notNow())}`;
  }

  /* ── Connect what you wear ───────────────────────────── */
  const WEAR = [
    ['watch', 'Apple Watch', 'via Apple Health', 'Connect Apple Watch'],
    ['circle', 'Oura ring', 'Oura account', 'Connect Oura ring'],
    ['pulse', 'WHOOP', 'WHOOP account', 'Connect WHOOP'],
    ['fitness', 'Garmin, Fitbit, Polar…', 'via Apple Health or Health Connect', 'Connect through Apple Health'],
    ['walk', 'Just my phone', 'Steps and sleep estimates', 'Carry on with my phone'],
  ];
  function devicesetup(state) {
    const k = Number(state) || 0;
    return `<div class="full-photo" style="${img('run')};bottom:auto;height:400px;background-position:center 30%"></div>
    ${status('on-photo')}
    <header class="bar on-photo"><button class="txt" style="color:var(--on-photo)">${back}</button><button class="txt" style="color:var(--on-photo)">Skip</button></header>
    <div class="on-photo" style="flex:none;height:230px;position:relative;z-index:2;padding:4px 20px 0">
      <p class="display" style="margin-top:0"><b>Do you wear anything?</b></p>
    </div>
    <div class="sheet" style="flex:1;min-height:0;display:flex;flex-direction:column;padding-top:18px">
      <p class="callout">life reads sleep, heart rate and workouts from it. You can add more later.</p>
      <div class="rows" style="margin-top:6px">${WEAR.map(([i, t, sub], n) => `<button class="row press fo-opt" data-set="${n}" aria-pressed="${n === k}"><span class="ic">${ic(i, 's18')}</span><span class="mid"><b>${t}</b><span>${sub}</span></span><span class="tick ${n === k ? 'on' : ''}">${n === k ? ic('check', 's14') : ''}</span></button>`).join('')}</div>
      <div style="flex:1"></div>
      <button class="btn press">${WEAR[k][3]}</button>
      <p class="callout" style="text-align:center;text-wrap:balance;margin-top:10px">Anything connected starts building your personal baseline tonight.</p>
    </div>`;
  }

  /* ── Your first move (a moment) ──────────────────────── */
  function firstmove() {
    return `<div class="full-photo fade" style="${img('payslip')};background-position:center"></div>
    ${status('on-photo')}
    <header class="bar on-photo"><div class="bar-id" style="color:var(--on-photo)"><span class="orb22" data-orb="done" style="color:var(--on-photo)"></span><b style="color:var(--on-photo);font-size:20px;letter-spacing:-.4px">life</b></div><button class="round press" style="background:var(--photo-fill);color:var(--on-photo)" aria-label="Close">${ic('close', 's18')}</button></header>
    <div style="flex:1"></div>
    <div class="on-photo rise" style="position:relative;z-index:2;padding:0 20px 20px">
      <span class="chip onphoto">${ic('clock', 's14')}Your first move · 2 minutes</span>
      <p class="display" style="font-size:46px;line-height:48px;letter-spacing:-2.07px;font-weight:600;margin-top:14px"><b>Start with two minutes.</b></p>
      <p class="statement" style="font-size:21px;line-height:28px;letter-spacing:-.35px;margin-top:12px"><b>Check your tax code.</b> Your payslip shows an emergency code, so you might be <b>owed money</b>.</p>
    </div>
    <div class="foot" style="background:none;position:relative;z-index:2"><button class="btn press" style="height:56px;${onDisc}">Do it now ${ic('arrow', 's18')}</button><button class="callout press" style="text-align:center;color:var(--on-photo)">Go to Today</button></div>`;
  }

  /* ── Your body, in three numbers ─────────────────────── */
  const BODY = {
    h: { name: 'Height', n: 1, m: ['172', 'cm', 172], i: ['5<small>ft</small> 8', 'in', 68] },
    w: { name: 'Weight', n: 2, m: ['74', 'kg', 74], i: ['11<small>st</small> 9', 'lb', 163] },
    s: { name: 'Waist', n: 3, m: ['84', 'cm', 84], i: ['33', 'in', 33] },
  };
  function measuresetup(state) {
    const parts = (state || 'h-m').split('-'), a = BODY[parts[0]] ? parts[0] : 'h', u = parts[1] === 'i' ? 'i' : 'm';
    const now = BODY[a], [val, unit, base] = now[u];
    const tape = Array.from({ length: 41 }, (_, k) => `<i class="${k === 20 ? 'fo-here' : (base - 20 + k) % 5 === 0 ? 'fo-five' : ''}"></i>`).join('');
    const rest = Object.keys(BODY).filter(key => key !== a).map(key => { const o = BODY[key], [v, un] = o[u]; return `<button class="tile press" data-set="${key}-${u}" style="min-height:0"><span class="th"><span>${o.name}</span>${key === 's' ? '<em>optional</em>' : ''}</span><span class="num">${v}<small>${un}</small></span></button>`; }).join('');
    return `${status()}${textBar(back, 'Skip')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Your body</span>
      <p class="display">Your body, in <b>three numbers.</b></p>
      <p class="body mt8">So food targets and health ranges fit you, not an average person.</p>
      <div class="seg mt16" role="group"><button data-set="${a}-m" aria-pressed="${u === 'm'}">Metric</button><button data-set="${a}-i" aria-pressed="${u === 'i'}">Imperial</button></div>
      <div class="card tint health mt12">
        <div class="between"><span class="micro">${now.name.toUpperCase()}${a === 's' ? ' · OPTIONAL' : ''}</span><span class="micro">${now.n} OF 3</span></div>
        <div class="mt12">${stepper(val, unit)}</div>
        <div class="fo-tape mt16" aria-hidden="true">${tape}</div>
      </div>
      <div class="tiles" style="margin-top:10px">${rest}</div>
    </div></div>${foot(btn('Continue'))}`;
  }

  /* ── The orb: six states ─────────────────────────────── */
  const STATES = [
    ['ring', 'Ring', 'The everyday mark: tab bar, headers, small sizes.', 'Default'],
    ['thinking', 'Thinking', 'Only while life is working something out.', 'Over 1s'],
    ['working', 'Working', 'While life builds or files something in front of you.', ''],
    ['searching', 'Searching', 'While life checks or looks something up.', ''],
    ['listening', 'Listening', 'While you talk. It moves with your voice.', 'A pulse'],
    ['done', 'Done', 'On finish. Dots gather in, then open back out.', '1s'],
  ];
  function orbPage() {
    return `${status()}${pushBar('The orb')}
    <div class="scroll"><div class="rise">
      <p class="display" style="margin-top:4px"><b>One ring of 10 dots.</b> Six states.</p>
      <div class="tiles mt16">${STATES.map(([st, name, when, tag]) => `<div class="tile"><span class="between" style="align-items:flex-start">${orb(st, 60)}${tag ? chip(tag, 'q') : ''}</span><span class="title" style="margin-top:12px">${name}</span><span class="sub">${when}</span></div>`).join('')}</div>
      <p class="callout mt12">One lap every 12 seconds. With Reduce Motion, each state is shown still.</p>
    </div></div>`;
  }

  /* ── The top bar: decided by how the screen opened ───── */
  function topbars() {
    const spec = (kind, rule, bar) => `<div class="between mt16"><span class="micro">${kind}</span><span class="micro" style="color:var(--quiet)">${rule}</span></div><div class="card fo-spec mt8">${bar}</div>`;
    return `${status()}${pushBar('The top bar')}
    <div class="scroll"><div class="rise">
      <p class="display" style="margin-top:4px">One rule for the top: <b>how it opened.</b></p>
      ${spec('ROOT · TODAY, PLAN, YOU', 'Two buttons at most', rootBar('Today', 'Mon 16 Nov', round('search', { label: 'Search' }) + round('bell', { label: 'From life', dot: true })))}
      ${spec('PUSH', 'Back, title, one smart action or none', pushBar('Readiness', round('info', { label: 'How this is worked out' })))}
      ${spec('SHEET', 'A handle, a title, close', sheetBar('Add something'))}
      ${spec('FULL-SCREEN FLOW', 'Back or close, and a step count', textBar(back, '2 of 3'))}
      <div class="between mt16"><span class="micro">OVER A PHOTOGRAPH</span><span class="micro" style="color:var(--quiet)">Same bar, on solid discs</span></div>
      <div class="pcard mt8" style="${img('terrace')};height:84px;padding:6px 0 0;border-radius:20px;justify-content:flex-start"><header class="bar push on-photo"><button class="round press" style="${onDisc}" aria-label="Back">${ic('back', 's18')}</button><b>Home</b><div class="acts"><button class="round press" style="${onDisc}" aria-label="More">${ic('more', 's18')}</button></div></header></div>
      <p class="callout mt16">Never two bars. Never more than one action on a pushed screen. The bar never moves.</p>
    </div></div>`;
  }

  /* ── Orb states, next: watch the ring become each one ── */
  const NEXT = [
    ['thinking', 'Thinking', 'Your dots form <b>a clear sphere</b>, turning, the near side brighter.'],
    ['working', 'Working', 'Your circle <b>speeds up</b>; smaller rings of the same dots turn inside, like clockwork.'],
    ['searching', 'Searching', 'Your dots spread over a sphere; <b>each hop draws a line</b> to the next, building a web of connections.'],
    ['listening', 'Listening', 'Your ring <b>stops and pays attention</b>, moving out and in with your voice.'],
  ];
  function orbnext(state) {
    const k = Number(state) || 0, [st, name, how] = NEXT[k];
    return `${status()}${pushBar('Orb states')}
    <div class="scroll"><div class="rise">
      <p class="display" style="margin-top:4px"><b>One family.</b> Same dots as your ring.</p>
      <div class="seg mt16" role="group">${NEXT.map(([, n], i) => `<button data-set="${i}" aria-pressed="${i === k}">${n}</button>`).join('')}</div>
      <button class="fo-stage press" data-set="${k}" aria-label="Play it again" style="width:100%;margin-top:12px"><span class="fo-play" data-play="${st}"></span><span class="micro">Ring ${ic('arrow', 's14')} ${name} ${ic('arrow', 's14')} Done</span></button>
      <p class="statement mt8">${how}</p>
      <div class="card pad16 mt16"><div class="between"><span class="micro">AT REAL SIZES</span><span class="micro" style="color:var(--quiet)">22 · 36 · 56 · 88</span></div>
        <div class="between" style="align-items:flex-end;margin-top:12px;padding:0 10px">${[22, 36, 56, 88].map(z => orb(st, z)).join('')}</div></div>
      <p class="callout mt12">Every change is the dots travelling one after another, so any 3D state collapses straight back into your spinning circle.</p>
    </div></div>`;
  }
  /** Plays ring → state → done on the stage orb, on a loop. Still under Reduce Motion. */
  function orbnextMount(el) {
    try {
      const stage = el.querySelector('[data-play]');
      if (!stage || typeof window.mountOrb !== 'function') return null;
      const st = stage.dataset.play, o = window.mountOrb(stage, 120, 'ring');
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) { o.set(st); return null; }
      let alive = true, timers = [];
      const run = () => { if (!alive) return; o.set(st); timers = [setTimeout(() => { if (alive) o.set('done'); }, 3800), setTimeout(run, 5800)]; };
      timers = [setTimeout(run, 800)];
      return () => { alive = false; timers.forEach(clearTimeout); };
    } catch (err) { return null; }
  }

  K.screen('tell', { from: '15, 4, 8', note: 'The orb listens, and what to cover is a rail of photographs that life ticks off as it hears them. One big mic: tap it.', build: tell });
  K.screen('building', { from: '14, 17, 9', note: 'life works beside what it has found: one sentence for the total, four photographs for the findings. Tap the button to see it finish.', build: building });
  K.screen('where', { from: '6, 15, 10', note: 'One question, your area as a photograph, eight quick answers and a search. Tap a city.', build: where });
  K.screen('signin', { from: 'the video, 3', note: 'A short sheet over the finished plan: one slab, two quiet options, and a way to stay on this phone.', build: signin });
  K.screen('healthprimer', { from: '12, 14', note: 'Each kind of data is a photograph with its own switch, so you choose type by type before Apple Health asks.', build: healthprimer });
  K.screen('notifprimer', { from: '10, 5, the video', note: 'An example nudge on a photograph, then the day as 24 ticks: quiet hours in grey, the one nudge in ember.', build: notifprimer });
  K.screen('micprimer', { from: '9, 4', note: 'The orb is the picture, listening. One promise in two tones and one button.', build: micprimer });
  K.screen('camprimer', { from: '14, 15', note: 'A viewfinder on the salmon bowl with what life would read, then the three things worth snapping, each as a photograph.', build: camprimer });
  K.screen('calprimer', { from: '19', note: 'Your day as life sees it: busy blocks with no names, and the one free gap picked out.', build: calprimer });
  K.screen('devicesetup', { from: '10, 6, 11', note: 'The question sits on open sky above a runner and her watch; five soft choices below. Tap one and the button follows.', build: devicesetup });
  K.screen('firstmove', { from: '10, 14', note: 'The end of setup, in the same treatment as Welcome: your payslip edge to edge, the first move in one big line, one button.', build: firstmove });
  K.screen('measuresetup', { from: '12, 5, the video', note: 'One number at a time on a tape of ticks, the other two resting as tiles. Tap a tile, or switch units.', build: measuresetup });
  K.screen('orb', { from: '5, 9', note: 'The six states side by side, each one live, with its name and when it is used.', build: orbPage });
  K.screen('topbars', { from: '17, 10', note: 'How a screen opened decides its bar: the five bars as live examples, each with its rule.', build: topbars });
  K.screen('orbnext', { from: '9, 5', note: 'Pick a state and watch the ring become it, finish and settle back. Then the same state at the sizes the app uses.', build: orbnext, mount: orbnextMount });
})();
