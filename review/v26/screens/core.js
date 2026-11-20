// life · V26 — the first screens, built directly from the references. These are the exemplars: read them before writing a new screen.
(() => {
  'use strict';
  const K = window.L26;
  const { ic, img, esc, status, round, rootBar, pushBar, textBar, dock, ruler, row, days14, dots, secHead, orb, wave, spark, caps, scale } = K;

  /* ── 1. Today: how you’re arriving comes first, then today’s moves as cards you take or leave ── */
  const BRIEF = {
    calm: `Your <b class="nw">${ic('doc')}tax rebate</b> is <b class="nw">one form</b> away. <b class="nw">${ic('calendar')}Council tax</b> is due in <b class="nw">15 days</b>.`,
    driven: `You’ve got energy. <b class="nw">${ic('doc')}Two moves</b> today clear your <b class="nw">tax rebate</b> and set the month.`,
    restless: `Let’s burn it off. <b class="nw">${ic('check')}Three quick wins</b> first, then the <b class="nw">tax form</b> if you fancy it.`,
    anxious: `Let’s make it smaller. Only <b class="nw">${ic('calendar')}one date</b> matters this week, and it’s <b class="nw">15 days</b> away.`,
    drained: `Going gently today. Only <b class="nw">${ic('calendar')}council tax</b> has a date, and it’s <b class="nw">15 days</b> away.`,
    peaceful: `A steady day. <b class="nw">${ic('walk')}Your walk</b> comes first. The <b class="nw">tax form</b> can wait until this afternoon.`,
  };
  const MOVES = [
    { t: 'Claim your tax rebate', s: 'One form · about 6 min', v: 'est. £840 back', photo: 'payslip' },
    { t: 'Check your tax code', s: 'Start with your payslip · 4 min', v: 'Keeps the right tax coming off', photo: 'letter' },
    { t: 'Set your cash plan', s: 'Know what the month needs · 10 min', v: '£290 safe to spend', photo: 'work' },
  ];
  const moveOrder = mood => ['drained', 'anxious'].includes(mood) ? [1, 0, 2] : mood === 'restless' ? [1, 2, 0] : [0, 1, 2];
  function today(state) {
    const top = `${status()}${rootBar('Today', 'Mon 16 Nov', round('search', { label: 'Search' }) + round('bell', { label: 'From life', dot: true }))}`;
    const greet = `<div class="eyebrow-row"><span class="eyebrow">Good morning, Ama</span><button class="chip press">Level 1 · Stabilize</button></div>`;
    // '' = first open of the day: the feeling check rises as a drawer. 'open|…' reopens it over wherever you were.
    let open = false, s = state;
    if (s === '') { open = true; s = 'later'; }
    if (s.startsWith('open|')) { open = true; s = s.slice(5) || 'later'; }
    const parts = s.split(':'), checked = parts[0] === 'checked', mood = checked ? parts[1] : 'calm', dec = (checked ? parts[2] : parts[1]) || '';
    const base = checked ? `checked:${mood}` : 'later', m = K.MOODS[mood] || K.MOODS.calm, ord = moveOrder(checked ? mood : 'calm'), k = dec.length;
    let moves;
    if (k < MOVES.length) {
      const mv = MOVES[ord[k]], next = MOVES[ord[(k + 1) % MOVES.length]];
      moves = `<div class="sec-head" style="margin-top:24px"><h4>Today’s moves</h4><span class="link">${k + 1} of ${MOVES.length}</span></div>
        <div class="deck" style="height:262px;margin-top:0">${k < MOVES.length - 1 ? `<span class="deck-back" style="${img(next.photo)}"></span>` : ''}
          <div class="deck-card" style="${img(mv.photo)}"><span class="chip onphoto" style="align-self:flex-start">${mv.s}</span><span class="copy"><b style="font-size:30px;line-height:34px;letter-spacing:-.9px">${mv.t}</b><span>${mv.v} · for your first home</span></span></div>
        </div>
        <div class="decide plain"><button class="side press" data-set="${base}:${dec}n" aria-label="Not today">${ic('close', 's18')}</button><i class="dotsep"></i><i class="dotsep"></i><span class="knob">${ic('swap')}</span><i class="dotsep"></i><i class="dotsep"></i><button class="side press" data-set="${base}:${dec}y" aria-label="Take it on today">${ic('check', 's18')}</button></div>
        <p class="callout mt12" style="text-align:center">Right to take it on today. Left to leave it for another day.</p>`;
    } else {
      const chosen = ord.filter((_, i) => dec[i] === 'y').map(i => MOVES[i]);
      moves = chosen.length
        ? `<div class="sec-head" style="margin-top:24px"><h4>Your day · ${chosen.length} ${chosen.length === 1 ? 'move' : 'moves'}</h4><button class="link" data-set="${base}">Choose again</button></div>
          <div class="card next"><div class="micro"><span class="sig"></span>First</div><div class="headline">${chosen[0].t}</div><p class="body">${chosen[0].s} · <b>${chosen[0].v}</b></p><button class="btn press">Continue ${ic('arrow', 's18')}</button>
            ${chosen.slice(1).map(c => `<div class="row" style="margin-top:8px;min-height:0"><span class="thumb" style="${img(c.photo)};width:40px;height:40px"></span><span class="mid"><b>${c.t}</b><span>${c.s}</span></span><span class="callout">Then</span></div>`).join('')}</div>`
        : `<div class="card mt20"><div class="headline">Nothing taken on today.</div><p class="body mt8">That’s allowed. Your moves keep until tomorrow.</p><button class="link ink mt12" data-set="${base}" style="font-weight:600">Choose again ${ic('chev', 's16')}</button></div>`;
    }
    // The feeling check lives on the page as one small card. It opens the drawer; it never takes the page over.
    const arrive = checked
      ? `<button class="checked press mt20" data-set="open|${s}"><span class="thumb" style="${img(m.photo)};width:40px;height:40px"></span><span class="line"><b>Arriving ${m.name.toLowerCase()}</b><span>${m.head} Today is set around it.</span></span><span class="link">Change</span></button>`
      : `<button class="checked press mt20" data-set="open|${s}"><span class="round sm"><span data-orb="ring" data-size="18" style="width:18px;height:18px;display:block"></span></span><span class="line"><b>How are you arriving?</b><span>A quick check-in, whenever you’re ready.</span></span><span class="link">Check in</span></button>`;
    const page = `${greet}
      <p class="display">${BRIEF[checked ? mood : 'calm']}</p>
      ${arrive}
      ${moves}
      <div class="sec-head"><h4>Body</h4><span class="link">Apple Health · 6 min ago</span></div>
      <div class="tiles">
        <button class="tile press"><span class="th"><span><i style="background:var(--a-health)"></i>Readiness</span><em>/100</em></span><span class="num">72</span><span class="sub">Well recovered</span></button>
        <button class="tile press"><span class="th"><span><i style="background:var(--a-work)"></i>Sleep</span><em>/8h</em></span><span class="num">7h 10m</span><span class="sub">2h 40m short this week</span></button>
        <button class="tile wide press"><span class="th"><span><i style="background:var(--a-home)"></i>Fuel</span><em>/2,300 kcal</em></span><span class="num">1,420</span><span class="meter"><i style="width:62%"></i></span>
          <span class="subtiles"><span><small>Protein</small><b>28g left</b></span><span><small>Carbs</small><b>98g left</b></span><span><small>Fat</small><b>31g left</b></span></span></button>
        <button class="tile press"><span class="th"><span><i style="background:var(--a-goal)"></i>Load</span><em>/21</em></span><span class="num">11.4</span><span class="sub">In today’s range</span></button>
        <button class="tile press"><span class="th"><span><i style="background:var(--a-you)"></i>Stress</span><em>/3</em></span><span class="num">1.4</span><span class="sub">Low</span></button>
      </div>
      <div class="card mt32">
        <div class="eyebrow"><span class="orb22" data-orb="ring" style="width:18px;height:18px"></span>life is asking</div>
        <p class="statement mt8">Are you registered for <b>Self Assessment?</b></p>
        <div class="between mt16"><button class="btn ghost sm press">Yes</button><button class="btn ghost sm press">Not yet</button><button class="btn ghost sm press">Not sure</button></div>
      </div>
      <div class="sec-head"><h4>Coming up</h4><span class="link">Calendar ${ic('chev', 's16')}</span></div>
      <div class="card pad16 rows">
        <button class="row press"><span class="datebox"><b>18</b><small>NOV</small></span><span class="mid"><b>Kofi’s birthday</b><span>Turning 31 · running vest idea</span></span><span class="callout">Sat</span></button>
        <button class="row press"><span class="datebox"><b>01</b><small>DEC</small></span><span class="mid"><b>Council tax</b><span>£148 · Direct Debit</span></span><span class="callout">15 days</span></button>
        <button class="row press"><span class="datebox"><b>12</b><small>JAN</small></span><span class="mid"><b>Car MOT due</b><span>Book from 12 Dec</span></span><span class="callout">8 weeks</span></button>
      </div>
      <button class="card pad16 press mt12" style="display:flex;align-items:center;gap:12px"><span class="thumb" style="${img('keyshome')}"></span><span style="flex:1"><span class="micro">Your Aim · 24% there</span><span class="title" style="display:block;margin-top:2px">Own a two-bed flat by June 2029</span></span><span class="chev">${ic('chev', 's16')}</span></button>
      <button class="card press mt12"><span class="between"><span class="title">life knows you</span><span class="title">64%</span></span>${ruler(64)}<span class="callout" style="display:block;margin-top:10px">214 things filed from your words and records.</span></button>
`;
    if (open) return `${top}<div class="scroll dim" style="overflow:hidden"><div>${page}</div></div>
      <div class="sheet"><div class="handle" style="margin-bottom:14px"></div>
        <div class="between"><p class="statement">How are you <b>arriving?</b></p>${round('close', { label: 'Not now', cls: 'sm' }).replace('<button', `<button data-set="${s}"`)}</div>
        <div class="mt12">${K.feel(mood, { h: 232 })}</div>
        <p class="headline mt16" style="font-weight:500;color:var(--ink2)">I’m arriving <b class="ink" style="font-weight:500" data-feel-word>${m.name.toLowerCase()}</b>.</p>
        <p class="callout mt8" data-feel-line>${m.head} ${m.line}</p>
        <button class="btn press mt16" data-feel-set="checked:" data-set="checked:${mood}">Set today’s pace</button>
      </div>`;
    return `${top}<div class="scroll"><div class="rise">${page}</div></div>${dock('Today')}`;
  }

  /* ── 2. Plan ─────────────────────────────────────────── */
  function plan() {
    const area = (photo, name, tag, line) => `<button class="pcard press" style="${img(photo)};height:168px"><span class="topline"><span class="chip onphoto">${tag}</span></span><span class="copy"><b style="font-size:20px;line-height:26px;letter-spacing:-.4px">${name}</b><span>${line}</span></span></button>`;
    return `${status()}${rootBar('Plan', '', round('search', { label: 'Search' }) + round('add', { label: 'Add to plan' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow"><span class="star"></span>Your plan</span>
      <p class="display"><b>Everything you’re managing.</b> Not everything to do today.</p>
      <button class="pcard press mt24" style="${img('keyshome')};height:232px;background-position:center 66%"><span class="topline"><span class="chip onphoto">Chief Aim · June 2029</span><span class="chip onphoto">24%</span></span><span class="copy"><b>A two-bed flat of my own</b><span>£11,760 of £49,000 · £800 a month</span></span></button>
      ${K.secHead('Your areas', 'All six')}
      <div class="pgrid">
        ${area('areahome', 'Home', '1 situation', 'Rent up in March')}
        ${area('payslip', 'Money', '2 ready', 'Tax code · cash plan')}
        ${area('walk', 'Health', '1 ready', 'Walk · day 38 of 66')}
        ${area('areawork', 'Work', '3 unpaid', 'Invoices · £2,400')}
      </div>
      <div class="mt24">
        <div class="acc" open><button class="acc-head" data-acc><b>Ready when you are<span>3</span></b><span class="round sm">${ic('remove', 's16')}</span></button><div class="acc-body rows">
          ${row('doc', 'Check your tax code', 'Start with your payslip · 4 min')}${row('wallet', 'Set your cash plan', 'Know what the month needs')}${row('walk', 'Your morning walk', 'Day 38 of about 66')}</div></div>
        <div class="acc"><button class="acc-head" data-acc><b>Situations<span>1</span></b><span class="round sm">${ic('add', 's16')}</span></button><div class="acc-body">
          <button class="row press"><span class="thumb" style="${img('keys')}"></span><span class="mid"><b>My rent is going up</b><span>From March · 2 open steps</span></span><span class="chev">${ic('chev', 's16')}</span></button></div></div>
        <div class="acc"><button class="acc-head" data-acc><b>Waiting, not forgotten<span>2</span></b><span class="round sm">${ic('add', 's16')}</span></button><div class="acc-body rows">
          ${row('doc', 'Council tax request', 'Sent 9 Nov · waiting for a reply', '<span class="chip q">Waiting</span>')}${row('heart', 'Heart referral', 'About 11 weeks · life keeps watch', '<span class="chip q">Waiting</span>')}</div></div>
        <div class="acc"><button class="acc-head" data-acc><b>Your tools<span>12</span></b><span class="round sm">${ic('add', 's16')}</span></button><div class="acc-body rows">
          ${row('cash', '30-day cash plan', 'Money')}${row('home', 'Rent vs buy', 'Home')}${row('calculator', 'Tax check', 'Money')}</div></div>
      </div>
    </div></div>${dock('Plan')}`;
  }

  /* ── 3. You ──────────────────────────────────────────── */
  function you() {
    return `${status()}${rootBar('You', '', `<button class="round press" aria-label="Your profile" style="font-size:14px;font-weight:600">A</button>` + round('gear', { label: 'Settings' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Ama · Designer · London</span>
      <p class="display"><b>Your life, coming together.</b> At your own pace.</p>
      <div class="card mt24"><div class="between" style="align-items:flex-start"><div><div class="micro">Your level</div><div class="xl" style="margin-top:6px">1<small>Stabilize</small></div></div><span class="chip">3 moves to Level 2</span></div>${ruler(40)}<button class="link ink mt12" style="font-weight:600">See your progress ${ic('chev', 's16')}</button></div>
      <div class="ptiles mt12"><button class="ptile press" style="${img('home')}"><b>Home</b></button><button class="ptile press" style="${img('work')}"><b>Work</b></button><button class="ptile press" style="${img('people')}"><b>People</b></button></div>
      <div class="card mt12"><div class="micro">Who you’re becoming · asked every few check-ins</div><p class="statement mt8"><b>“I look after future me.”</b></p>${scale([52, 70, 64, 88, 80])}<p class="callout mt12">Your last 5 reflections lean yes.</p></div>
      <div class="tiles mt12">
        <button class="tile press"><span class="th"><span>life knows you</span><em>64%</em></span><span class="num">214</span><span class="sub">things filed</span></button>
        <button class="tile press"><span class="th"><span>Streak</span><em>best 11</em></span><span class="num">4<small>days</small></span>${days14('11011101101111')}</button>
      </div>
      <div class="card pad16 rows mt12">${row('home', 'Your household', 'The people and place you call home.')}${row('heart', 'Body and habits', 'Sleep, movement and small routines.')}${row('people', 'People and dates', 'The people you want to show up for.')}${row('book', 'Your learning', 'Ideas you can actually use.')}</div>
    </div></div>${dock('You')}`;
  }

  /* ── 4. Talk: you speak, life listens, and each thing files into its place as you say it ── */
  const SAID = [['My rent goes up ', ''], ['in March', 'home', 'Rent up from March'], ['. I found the letter, ', ''], ['the review is on the 3rd', 'home', 'Review date · 3 March'], ['. It’s ', ''], ['Kofi’s birthday on Saturday', 'you', 'Kofi’s birthday · Sat'], [' and I still need a card. I’ve been ', ''], ['sleeping badly this week', 'health', 'Sleeping badly this week'], ['.', '']];
  const AREAS = [['you', 'You'], ['home', 'Home'], ['work', 'Work'], ['money', 'Money'], ['health', 'Health'], ['goal', 'Goals']];
  const said = () => SAID.map(([t, a, label]) => a ? `<b class="w got" data-area="${a}" data-label="${esc(label)}">${t}</b>` : `<span class="w">${t}</span>`).join('');
  const areas = () => `<div class="areas">${AREAS.map(([a, name]) => { const items = SAID.filter(x => x[1] === a); return `<div class="area ${items.length ? 'has' : ''}" data-area="${a}"><small><i style="background:var(--a-${a})"></i>${name}<em>${items.length || ''}</em></small><span>${items.length ? items[items.length - 1][2] : 'Nothing yet'}</span></div>`; }).join('')}</div>`;
  function talk(state) {
    const head = `${status()}${pushBar('Talk', round('clock', { label: 'Conversations' }), 'close')}`;
    const orbState = state === 'filed' ? 'done' : state === 'review' ? 'ring' : 'listening';
    const label = state === 'filed' ? 'Filed' : state === 'review' ? 'Here’s what I heard' : 'Listening';
    const body = `<div class="scroll"><div class="rise">
      <button class="press" data-set="" aria-label="Play it again" style="display:grid;place-items:center;width:100%;padding:4px 0 0;color:var(--ink)"><span data-orb="${orbState}" data-size="88" style="width:88px;height:88px;display:block"></span></button>
      <p class="callout" style="text-align:center;margin-top:4px" data-talk-label>${label}</p>
      <p class="statement said mt16">${said()}</p>
      <div class="sec-head" style="margin-top:22px"><h4>Filing into place</h4><span class="link" data-talk-count>4 found</span></div>
      ${areas()}
    </div></div>`;
    if (state === 'review') return `${head}${body}<div class="drawer"><h3>File these 4 details?</h3><p>Into Home, You and Health. You decide.</p><div class="decide"><button class="side press" data-set="" aria-label="Leave them">${ic('close', 's18')}</button><i class="dotsep"></i><i class="dotsep"></i><button class="knob press" data-set="filed" aria-label="File all four">${ic('check')}</button><i class="dotsep"></i><i class="dotsep"></i><button class="side press" aria-label="Go through them one by one">${ic('help', 's18')}</button></div></div>`;
    if (state === 'filed') return `${head}${body}<div class="drawer"><h3>Filed.</h3><p>4 details are in their places. Your rent situation has a new date.</p><div class="decide"><button class="side press" data-set="review" style="width:auto;padding:0 18px;font-size:14px;font-weight:600">Undo</button></div></div>`;
    return `${head}${body}<div class="foot" style="align-items:center"><div class="between" style="gap:22px">${round('more', { label: 'Type instead' })}<button class="round solid press" data-set="review" aria-label="Stop and review" style="width:72px;height:72px">${ic('stop')}</button>${round('pause', { label: 'Pause' })}</div><span class="callout">Tap stop when you’re done. Nothing is saved yet.</span></div>`;
  }
  /** Plays the listening demo: words arrive, recognised phrases light up and drop into their area. */
  function talkMount(el, state) {
    if (state !== '' || matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
    const words = [...el.querySelectorAll('.said .w')], count = el.querySelector('[data-talk-count]'), label = el.querySelector('[data-talk-label]');
    const tiles = Object.fromEntries([...el.querySelectorAll('.area')].map(t => [t.dataset.area, t]));
    let timer = null, found = 0, secs = 0, k = 0, started = false;
    const reset = () => { words.forEach(w => { w.classList.add('off'); w.classList.remove('got'); }); Object.values(tiles).forEach(t => { t.classList.remove('has', 'hit'); t.querySelector('em').textContent = ''; t.querySelector('span').textContent = 'Nothing yet'; }); count.textContent = 'Listening'; };
    const step = () => {
      secs += 1; label.textContent = 'Listening · 0:' + String(secs).padStart(2, '0');
      if (k >= words.length) { clearInterval(timer); label.textContent = 'Paused · tap stop to review'; return; }
      const w = words[k++]; w.classList.remove('off');
      if (w.dataset.area) setTimeout(() => {
        const t = tiles[w.dataset.area]; if (!t) return;
        w.classList.add('got'); found += 1; count.textContent = found + ' found';
        t.classList.add('has', 'hit'); t.querySelector('em').textContent = (Number(t.querySelector('em').textContent) || 0) + 1; t.querySelector('span').textContent = w.dataset.label;
        setTimeout(() => t.classList.remove('hit'), 900);
      }, 450);
    };
    reset();
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting && !started) { started = true; timer = setInterval(step, 850); } }, { threshold: .55 });
    io.observe(el);
    // Some hosts never deliver intersection callbacks to a background page: start anyway when the screen is on show.
    const nudge = setTimeout(() => { const r = el.getBoundingClientRect(); if (!started && r.top < innerHeight && r.bottom > 0) { started = true; timer = setInterval(step, 850); } }, 1400);
    return () => { clearInterval(timer); clearTimeout(nudge); io.disconnect(); };
  }

  /* ── 5. Mission, told as a timeline ──────────────────── */
  function mission() {
    return `${status()}${pushBar('', round('more', { label: 'More' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Money · HMRC</span>
      <p class="display"><b>Tax rebate.</b> About <b>£840</b> back, one form to go.</p>
      <div class="tl mt24">
        <div class="tl-item done"><div class="when">THU 12 NOV</div><p>life noticed an emergency tax code on your March payslip.</p></div>
        <div class="tl-item done"><div class="when">FRI 13 NOV</div><p>“I think I overpaid when I changed jobs.”</p><div class="voice"><span class="round sm solid">${ic('play', 's14')}</span>${wave(22)}<span>0:34</span></div></div>
        <div class="tl-item now"><div class="when">TODAY</div><p>One form left.</p>
          <div class="card pad16 mt12"><span class="chip live">Finish the P87 · 6 min</span><p class="body mt8">Sign in to Government Gateway, add your software and kit, then submit.</p><button class="btn press mt16">Continue ${ic('arrow', 's18')}</button></div></div>
        <div class="tl-item later"><div class="when">ABOUT 22 NOV</div><p>HMRC replies. life will watch for it and tell you.</p></div>
      </div>
      <div class="card pad16 between mt24"><span><span class="micro">Reference</span><span class="title" style="display:block;margin-top:4px;font-variant-numeric:tabular-nums">P800-7Q2-K41</span></span><button class="chip press">${ic('copy', 's14')}Copy</button></div>
    </div></div>`;
  }

  /* ── 6. Cash plan ────────────────────────────────────── */
  function cashplan() {
    return `${status()}${pushBar('30-day cash plan', round('more', { label: 'More' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Safe to spend this month</span>
      <div class="xl" style="margin-top:8px">£290</div>
      <p class="body mt8">Your buffer covers <b>1.3 months</b> of essentials.</p>
      <div class="card mt20"><div class="between"><span class="title">Next 30 days</span><span class="legend"><span><i style="background:var(--ink)"></i>In £2,410</span><span><i style="background:var(--ink2)"></i>Out £2,120</span></span></div>
        <div class="mt12">${caps([{ l: '16 Nov', in: 0, out: 310 }, { l: '23 Nov', in: 2410, out: 1150, now: true }, { l: '30 Nov', in: 0, out: 388 }, { l: '7 Dec', in: 0, out: 152 }, { l: '14 Dec', in: 0, out: 120 }])}</div>
        <p class="callout mt8">Payday lands 28 Nov. Rent leaves the same week.</p></div>
      <div class="card pad16 rows mt12">${row('home', 'Essential bills', 'Rent, council tax, utilities, phone', '<span class="end">£1,820</span>')}${row('shield', 'Tax set-aside', 'For your Self Assessment', '<span class="end">£300</span>')}</div>
    </div></div><div class="foot"><button class="btn press">Save my cash plan</button></div>`;
  }

  /* ── 7. A moment: marked as cleared, under an open sky ─ */
  function cleared() {
    return `<div class="full-photo" style="${img('sky')};background-size:auto 190%;background-position:35% 0"></div>
    ${status('on-photo')}
    <div style="position:relative;z-index:2;margin:-4px 14px 0;height:34px;border-radius:0 0 22px 22px;background:var(--surface)"><div class="handle" style="position:absolute;left:50%;bottom:10px;margin:0 0 0 -18px"></div></div>
    <div class="scroll on-photo" style="position:relative;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:16px">
      <span style="width:48px;height:48px;border-radius:14px;background:var(--on-photo);color:#0D0E10;display:grid;place-items:center">${ic('doc')}</span>
      <p class="display" style="margin-top:16px">Mark your <b class="nw">tax rebate</b> from <b class="nw">${ic('shield')}HMRC</b> as cleared?</p>
      <span class="callout" style="color:var(--on-photo2);display:block;margin-top:8px">Reference P800-7Q2-K41</span>
      <div class="field mt24"><small>Paid into</small><b>Everyday ·· 4821</b></div>
      <div class="gapdots"></div>
      <div class="field"><small>Amount</small><b>£840.00</b></div>
    </div>
    <div class="foot" style="background:none;flex-direction:row;position:relative;z-index:2"><button class="btn press" style="background:var(--photo-fill);color:var(--on-photo)">Not yet</button><button class="btn press" style="background:var(--on-photo);color:#0D0E10">${ic('check', 's18')}Cleared</button></div>`;
  }

  /* ── 8. Search ───────────────────────────────────────── */
  function search() {
    const chip = (icon, t) => `<button class="chip press" style="height:36px;font-size:14px;font-weight:500;padding:0 14px 0 10px;background:var(--surface);box-shadow:var(--shadow)">${ic(icon, 's16')}${t}</button>`;
    return `${status()}
    <header class="bar" style="height:64px"><span class="t30 q" style="display:flex;align-items:center;gap:10px;font-weight:500"><span class="ink">${ic('search')}</span>Search</span>${round('close', { cls: 'solid', label: 'Close search' })}</header>
    <div class="scroll"><div class="rise">
      <div class="micro mt8">YOUR AREAS</div>
      <div class="hscroll mt12"><button class="ptile press" style="${img('home')}"><b>Home</b></button><button class="ptile press" style="${img('work')}"><b>Work</b></button><button class="ptile press" style="${img('run')}"><b>Body</b></button><button class="ptile press" style="${img('people')}"><b>People</b></button><button class="ptile press" style="${img('bench')}"><b>Learn</b></button></div>
      <div class="micro mt32">ASKED MOST</div>
      <div class="mt12" style="display:flex;flex-wrap:wrap;gap:8px">${chip('doc', 'tax code')}${chip('home', 'council tax')}${chip('moon', 'sleep')}${chip('wallet', 'rent')}${chip('gift', 'Kofi’s birthday')}${chip('folder', 'passport')}${chip('food', 'lunch')}</div>
      <div class="micro mt32">FROM YOUR LIFE</div>
      <div class="gap8 mt12">
        <button class="card pad16 press" style="display:flex;align-items:center;gap:12px"><span class="datebox"><b>01</b><small>DEC</small></span><span style="flex:1"><span class="title" style="display:block">Council tax</span><span class="callout">Money · £148 · due in 15 days</span></span></button>
        <button class="card pad16 press" style="display:flex;align-items:center;gap:12px"><span class="row" style="min-height:0;padding:0;width:auto"><span class="ic">${ic('camera', 's18')}</span></span><span style="flex:1"><span class="title" style="display:block">Council tax letter</span><span class="callout">Scan · yesterday</span></span></button>
        <button class="card pad16 press" style="display:flex;align-items:center;gap:12px"><span class="row" style="min-height:0;padding:0;width:auto"><span class="ic">${ic('doc', 's18')}</span></span><span style="flex:1"><span class="title" style="display:block">Tax code 1257L</span><span class="callout">Money · from your payslip</span></span></button>
      </div>
    </div></div>`;
  }

  /* ── 9. Body ─────────────────────────────────────────── */
  function body() {
    // Readiness against your own normal: the shaded band is your usual range, each dot a day, today the big one.
    const norm = (vals, lo, hi) => {
      const W = 318, H = 150, top = 22, bot = 28, min = 52, max = 76, x = k => 96 + k * (W - 114) / (vals.length - 1), y = v => top + (max - v) / (max - min) * (H - top - bot);
      const days = ['M', 'T', 'W', 'T', 'F', 'S', 'Today'], last = vals.length - 1;
      let out = `<rect x="0" y="${y(hi).toFixed(1)}" width="${W}" height="${(y(lo) - y(hi)).toFixed(1)}" rx="10" fill="var(--surface2)"/>`;
      out += `<text x="8" y="${(y(hi) + 15).toFixed(1)}" font-size="11" font-weight="600" fill="var(--quiet)">your normal</text>`;
      vals.forEach((v, k) => { const t = k === last; out += `<circle cx="${x(k).toFixed(1)}" cy="${y(v).toFixed(1)}" r="${t ? 8 : 5}" fill="var(--ink)" opacity="${t ? 1 : .32}"/>${t ? `<text x="${x(k).toFixed(1)}" y="${(y(v) - 14).toFixed(1)}" text-anchor="middle" font-size="13" font-weight="600" fill="var(--ink)">72</text>` : ''}<text x="${x(k).toFixed(1)}" y="${H - 6}" text-anchor="middle" font-size="11" font-weight="600" fill="var(--${t ? 'ink' : 'quiet'})">${days[k]}</text>`; });
      return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;overflow:visible" aria-label="Readiness this week against your normal range">${out}</svg>`;
    };
    // Last night as a strip: one block per stretch, deeper sleep sits lower and darker.
    const night = () => {
      const seq = [['l', 15], ['d', 45], ['l', 30], ['r', 20], ['l', 35], ['d', 25], ['l', 25], ['r', 30], ['w', 8], ['l', 40], ['d', 10], ['r', 35], ['l', 30], ['w', 7], ['r', 25], ['l', 35], ['w', 5], ['r', 20], ['l', 5]];
      const lv = { w: [0, 'var(--quiet)', .55], r: [1, 'var(--ink)', .45], l: [2, 'var(--ink)', .22], d: [3, 'var(--ink)', 1] };
      const W = 318, row = 16, gap = 8, H = 4 * row + 3 * gap, tot = seq.reduce((s, x) => s + x[1], 0); let x = 0, out = [0, 1, 2, 3].map(l => `<rect x="0" y="${l * (row + gap)}" width="${W}" height="${row}" rx="8" fill="var(--surface2)"/>`).join('');
      for (const [s, m] of seq) { const w = m / tot * W, [l, f, o] = lv[s]; out += `<rect x="${(x + .6).toFixed(1)}" y="${l * (row + gap)}" width="${Math.max(2, w - 1.2).toFixed(1)}" height="${row}" rx="5" fill="${f}" opacity="${o}"/>`; x += w; }
      return `<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block" aria-label="Last night's sleep stages">${out}</svg>`;
    };
    const slim = (label, num, sub, chart) => `<button class="tile press" style="min-height:0;padding:14px 12px 12px"><span class="th"><span>${label}</span></span><span style="display:block;font-size:20px;line-height:26px;letter-spacing:-.4px;font-weight:600;margin-top:8px;white-space:nowrap;font-variant-numeric:tabular-nums">${num}</span><span class="callout">${sub}</span><span style="display:block;margin-top:10px">${chart}</span></button>`;
    const why = (icon, name, val, sub, tag) => row(icon, name, sub, `<span style="text-align:right;flex:none"><b style="display:block;font-size:15px;font-weight:600;font-variant-numeric:tabular-nums">${val}</b><span class="chip q" style="margin-top:4px">${tag}</span></span>`);
    const habitRow = (name, cue, bits) => `<span style="display:block;padding:9px 0"><span class="between"><b style="font-size:14px;line-height:20px;font-weight:600">${name}</b><span class="callout">${cue}</span></span>${days14(bits)}</span>`;
    const key = (lab, val, o) => `<span><span style="display:inline-block;width:8px;height:8px;border-radius:3px;background:${o};margin-right:6px"></span><small style="font-size:11px;font-weight:600;color:var(--ink2)">${lab}</small><b style="display:block;font-size:14px;font-weight:600;margin-top:2px">${val}</b></span>`;
    return `${status()}${pushBar('Body', round('arrowUp', { label: 'Share' }))}
    <div class="scroll"><div class="rise">
      <span class="chip q">Apple Health · 6 min ago</span>
      <p class="display">You’re <b>well recovered</b>, but <b>2h 40m short</b> on sleep this week.</p>
      <div class="card mt24" style="padding:18px 18px 16px"><span class="micro">Readiness</span>
        <div style="display:flex;align-items:flex-end;gap:14px;margin-top:10px"><span class="xl">72</span><span style="padding-bottom:8px"><b class="title" style="display:block">Above your normal</b><span class="callout">Best day this week</span></span></div>
        <div class="mt16">${norm([58, 64, 55, 70, 62, 66, 72], 60, 70)}</div>
        <p class="callout mt8">Your normal is <b style="color:var(--ink);font-weight:600">60 to 70</b>, from your last 60 days. A good day for an easy walk.</p></div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px">
        ${slim('Sleep', '7h 10m', 'of 8h 05m', K.bars([6.2, 7.1, 6.8, 7.5, 7.2, 8.1, 7.2], { w: 90, h: 50, dim: .16 }))}
        ${slim('Load', '11.4', 'aim 11–14', K.line([6, 9, 12.5, 8, 10, 13, 11.4], 11, 14, { w: 90, h: 30 }))}
        ${slim('Stress', '1.4', 'low', K.line([1.9, 1.3, 2.2, 1.6, 1.2, 1.5, 1.4], 1, 2, { w: 90, h: 30 }))}
      </div>
      ${secHead('Last night', 'Sleep')}
      <div class="card pad16"><div class="between"><span class="callout">23:20</span><span class="callout">Asleep 7h 10m · 89%</span><span class="callout">06:45</span></div>
        <div class="mt12">${night()}</div>
        <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px">${key('Deep', '1h 20m', 'var(--ink)')}${key('REM', '1h 50m', 'color-mix(in srgb, var(--ink) 45%, transparent)')}${key('Light', '3h 40m', 'color-mix(in srgb, var(--ink) 22%, transparent)')}${key('Awake', '20m', 'color-mix(in srgb, var(--quiet) 55%, transparent)')}</div></div>
      ${secHead('Why you’re recovered', 'Readiness')}
      <div class="card pad16" style="padding-top:4px;padding-bottom:4px"><div class="rows">
        ${why('pulse', 'Heart rate variability', '58 ms', '6 ms above your normal', 'Better')}
        ${why('heart', 'Resting heart rate', '54 bpm', '2 bpm below your normal', 'Better')}
      </div></div>
      ${secHead('Fuel', 'Log food')}
      <button class="pcard press" style="${img('food')};height:176px"><span class="topline"><span class="chip onphoto">62% of today</span><span class="chip onphoto">880 left</span></span><span class="copy"><b>1,420 <small style="font-size:15px;font-weight:500;letter-spacing:0">of 2,300 kcal</small></b><span>Protein 28g left · Carbs 98g left · Fat 31g left</span></span></button>
      ${secHead('Tonight')}
      <div class="card pad16"><div class="between" style="gap:12px"><span><b class="title" style="display:block">In bed by 22:50</b><span class="callout">Pays back 40 minutes of this week’s 2h 40m</span></span><span class="chip q">${ic('bell', 's14')}22:05</span></div></div>
      <div class="card pad16 mt12"><span class="eyebrow">${orb('ring', 18)}life noticed</span><p class="body mt8">On days you walk <b>8,000+ steps</b>, you sleep <b>24 minutes longer</b>.</p><button class="link ink mt12" style="font-weight:600">Try it for two weeks ${ic('chev', 's16')}</button></div>
      ${secHead('Habits today', '2 of 3')}
      <div class="card pad16" style="padding-top:8px;padding-bottom:8px">${habitRow('Water before coffee', 'After the kettle boils', '11111101111111')}${habitRow('10 minutes of daylight', 'After breakfast', '11101111011011')}${habitRow('In bed by 22:50', 'After brushing teeth', '11011110110100')}</div>
      <p class="callout mt16">Wellness guidance from your own readings, not a diagnosis.</p>
    </div></div>`;
  }

  /* ── 10. Readiness: every number against your own normal ─ */
  function readiness() {
    const m = (icon, name, val, unit, tag, cls, delta, v, lo, hi) => `<button class="metric press"><span class="name"><span>${ic(icon, 's18')}${name}</span><span class="chip ${cls}">${tag}</span></span><span><span class="val">${val}<small>${unit}</small></span><span class="delta" style="display:block">${delta}</span></span>${spark(v, lo, hi)}</button>`;
    return `${status()}${pushBar('Readiness', round('info', { label: 'How this is worked out' }))}
    <div class="scroll"><div class="rise">
      <div class="between" style="align-items:flex-end"><div class="xl">72<small>/100</small></div><span class="chip done" style="margin-bottom:10px">Above your baseline</span></div>
      <p class="statement mt12">A good day for your <b>harder workout</b> or the <b>bigger decision</b>.</p>
      <div class="sec-head" style="margin-top:28px"><h4>Why</h4><span class="link">against your 60-day normal</span></div>
      <div class="gap8">
        ${m('pulse', 'Heart rate variability', '58', 'ms', 'Better', 'done', '6 ms above your normal', [49, 52, 47, 55, 51, 54, 58], 47, 56)}
        ${m('heart', 'Resting heart rate', '54', 'bpm', 'Better', 'done', '2 bpm below your normal', [57, 58, 56, 57, 55, 56, 54], 55, 59)}
        ${m('moon', 'Sleep performance', '89', '%', 'Steady', 'q', 'Asleep 7h 10m of 8h 05m', [80, 92, 84, 95, 88, 100, 89], 82, 96)}
        ${m('water', 'Breathing rate', '14.8', '/min', 'Steady', 'q', 'Unchanged from yesterday', [14.6, 14.9, 14.7, 14.8, 14.6, 14.8, 14.8], 14.2, 15.2)}
      </div>
      <p class="callout mt16">The shaded band is your own normal range. Wellness guidance, not a diagnosis.</p>
    </div></div>`;
  }

  /* ── 11. Meal result ─────────────────────────────────── */
  function meal() {
    return `<div class="full-photo fade" style="${img('food')};bottom:auto;height:430px;background-position:38% 42%"></div>
    ${status('on-photo')}
    <header class="bar on-photo"><span class="chip" style="background:var(--on-photo);color:#0D0E10">Lunch · 12:40</span><button class="round press" style="background:var(--on-photo);color:#0D0E10" aria-label="Close">${ic('close', 's18')}</button></header>
    <div style="height:206px;flex:none;position:relative;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;padding:0 20px 18px" class="on-photo"><span class="chip done" style="align-self:flex-start;background:var(--on-photo);color:#0B7A55">Fits today · 8.4</span><div class="t30" style="margin-top:10px;font-size:34px;line-height:39px;letter-spacing:-1.1px">Salmon rice bowl</div><span class="callout" style="color:var(--on-photo2)">From Itsu · saved meal</span></div>
    <div class="sheet" style="flex:1;min-height:0;display:flex;flex-direction:column;padding-top:22px">
      <div class="between" style="align-items:flex-end"><div class="xl">705<small>kcal</small></div><span class="callout" style="margin-bottom:8px">1,595 left today</span></div>
      <div class="cols mt20"><div><small>Protein</small><b>49g</b><span>35%</span></div><div><small>Carbs</small><b>62g</b><span>24%</span></div><div><small>Fat</small><b>28g</b><span>37%</span></div><div><small>Fibre</small><b>9g</b><span>30%</span></div></div>
      <p class="callout mt8">Percentages are of your day’s targets.</p>
      <div class="body mt16" style="display:flex;gap:10px"><span class="orb22" data-orb="ring" style="width:20px;height:20px;flex:none;margin-top:1px"></span><span class="ink">Strong on protein. Add greens tonight to reach your fibre.</span></div>
      <div style="flex:1"></div>
      <div style="display:flex;gap:8px;padding-bottom:0"><button class="btn ghost press" style="width:auto;padding:0 18px">Edit</button><button class="btn press">Log meal</button></div>
    </div>`;
  }

  /* ── 12. A habit, counted in dots ────────────────────── */
  function habit() {
    const cells = Array.from({ length: 66 }, (_, k) => k === 37 ? 'now' : k < 37 ? (k === 17 || k === 30 ? 'miss' : 'on') : '');
    return `${status()}${pushBar('', round('more', { label: 'More' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Morning walk · after breakfast</span>
      <p class="display">Day <b>38</b> of about <b>66</b>. It’s becoming automatic.</p>
      <div class="card mt24">${dots(cells, 11)}<div class="between mt16"><span class="callout">2 misses, forgiven</span><span class="callout">28 days to go</span></div></div>
      <div class="tiles mt12">
        <div class="tile"><span class="th"><span>Strength</span><em>/100</em></span><span class="num">71</span><span class="sub">A miss cost 2 points, not the streak</span></div>
        <div class="tile"><span class="th"><span>This week</span><em>5 of 7</em></span><span class="num">4<small>day streak</small></span>${days14('11011101101111')}</div>
      </div>
      <div class="card mt12"><div class="micro">Who you’re becoming</div><p class="statement mt8"><b>Did today’s walk feel like you?</b></p>${scale([40, 55, 62, 70, 78])}</div>
    </div></div><div class="foot"><button class="btn press">${ic('check', 's18')}Done today</button></div>`;
  }

  /* ── 13. Lesson player ───────────────────────────────── */
  function lesson() {
    return `${status()}<div class="handle"></div>
    <div class="scroll" style="display:flex;flex-direction:column;padding-top:18px">
      <span class="eyebrow">Teach me · bite 1 of 3</span>
      <span class="title" style="margin-top:2px">Tax codes</span>
      <p class="display" style="font-size:40px;line-height:44px;letter-spacing:-1.4px;margin-top:14px"><b>What your tax code really means</b></p>
      <div style="flex:1;min-height:28px;display:grid;place-items:center"><div style="text-align:center"><div style="font-size:44px;line-height:48px;letter-spacing:-1.32px;font-weight:600;font-variant-numeric:tabular-nums">1257<span style="color:var(--ember)">L</span></div><div class="between" style="gap:28px;margin-top:8px"><span class="callout">Tax-free pay</span><span class="callout" style="color:var(--ember-text)">The letter</span></div></div></div>
      <span class="callout">A code, not a tax rate</span>
      <div class="bar-track mt8"><i style="width:35%"></i></div>
      <div class="times"><span>0:42</span><span>−1:18</span></div>
      <div class="player"><button class="round press" aria-label="Save">${ic('book', 's18')}</button><button class="skip press" aria-label="Back 15 seconds">${ic('repeat')}15</button><button class="big press" aria-label="Pause">${ic('pause')}</button><button class="skip press" aria-label="Forward 15 seconds">${ic('repeat')}15</button><button class="round press" aria-label="Show me the picture">${ic('images', 's18')}</button></div>
      <div class="between mt32"><span class="title">Notes</span><span class="chev">${ic('more', 's18')}</span></div>
      <p class="body mt8">Your code tells your employer <b>how much you can earn tax-free</b>. 1257L means <b>£12,570 a year</b> before any tax is taken.</p>
    </div>`;
  }

  /* ── 14. What life understood, and fixing it ─────────── */
  function understood() {
    return `${status()}${pushBar('', round('arrowUp', { label: 'Share' }) + round('more', { label: 'More' }))}
    <div class="scroll"><div class="rise">
      <p class="t30">What life understood from your talk</p>
      <span class="eyebrow mt8">${ic('clock', 's14')}Today, 18:12 · ${ic('home', 's14')}Home</span>
      <div class="mt16" style="display:flex;gap:8px"><span class="chip">Summary ${ic('down', 's14')}</span><span class="chip q">2 details</span></div>
      <div class="title mt24">Overview</div>
      <p class="body mt8">You found the rent letter. The rent rises <b>from March</b> and there’s a <b>review date</b> you can use to respond. You’d like to compare it with your budget before replying.</p>
      <div class="card pad16 rows mt16">${row('doc', 'Rent letter', 'Document · My rent is going up')}${row('calendar', '3 May', 'Review date', '<span class="chip live">Check this</span>')}</div>
    </div></div>
    <div class="foot" style="padding-top:0"><div class="composer"><p>Fix: the review is on 3 March, not May<span class="caret"></span></p><button class="round sm solid press" aria-label="Send">${ic('arrowUp', 's16')}</button></div></div>`;
  }

  /* ── 15. Your Aim, in your own words ─────────────────── */
  function aimfeel() {
    const check = (t, on) => `<button class="check press ${on ? 'on' : ''}"><span class="tick ${on ? 'on' : ''}">${on ? ic('check', 's14') : ''}</span><span>${t}</span></button>`;
    return `${status()}${pushBar('', round('arrowUp', { label: 'Share' }) + round('more', { label: 'More' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow" style="justify-content:center">Your Aim · written 12 November</span>
      <p class="t30 mt16">I want a home that <i>feels</i> like…</p>
      <div class="mt12">${check('Space to breathe')}${check('Morning light in the kitchen')}${check('A table big enough for Sunday lunch')}</div>
      <div class="micro mt24">WHAT GETS YOU THERE</div>
      <div class="mt8">${check('Open a Lifetime ISA', true)}${check('Save £800 a month')}${check('Mortgage in principle by 2028')}</div>
      <div class="photo mt20" style="${img('keyshome')};height:150px;background-position:center 62%"><span class="copy"><small>A glimpse · unlocked at 25%</small><b style="font-size:20px;line-height:26px">1% to go</b></span></div>
    </div></div>
    <div class="dock" style="grid-template-columns:auto auto;justify-content:space-between;padding:8px 20px 26px"><div class="dock-pill">${['checkCircle', 'attach', 'mic', 'spark'].map(n => `<button class="press" style="min-width:48px;padding:0 12px" aria-label="${n}">${ic(n)}</button>`).join('')}</div><div class="dock-pill"><button class="press" style="min-width:48px;padding:0 12px" aria-label="New note">${ic('add')}</button></div></div>`;
  }

  /* ── 16. One small question: how much time today? ────── */
  function timetoday(pick = 1) {
    const cells = Array.from({ length: 35 }, (_, k) => (k >= 2 && k <= 6 && k !== 5) || (k >= 7 && k <= 13) || k === 14 || k === 15 ? 'on' : '');
    return `${status()}
    <div class="scroll dim" style="flex:1;overflow:hidden">
      <div style="display:flex;align-items:baseline;gap:8px;margin-top:8px"><span class="xl" style="color:var(--gain)">4</span><span class="headline">day streak</span></div>
      <p class="statement mt16">Today, <b>${ic('doc')}one form</b> is waiting. You still have <b>${ic('calendar')}15 days</b> on council tax and <b>${ic('heart')}1 rest day</b> left.</p>
      <div class="month mt24">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => `<small>${d}</small>`).join('')}${cells.map(c => `<i class="${c}"></i>`).join('')}</div>
    </div>
    <div class="sheet"><div class="handle" style="margin-bottom:18px"></div>
      <p class="statement">How much <b>${ic('clock')}time</b> do you have today?</p>
      <div class="wheel mt16">${['About 5 minutes', 'About 15 minutes', 'About 30 minutes'].map((t, k) => `<button data-set="${k}" aria-pressed="${k === pick}">${t}</button>`).join('')}</div>
      <p class="callout mt12" style="text-align:center">${['life will show one quick win.', 'Enough for the P87. life will line it up.', 'The P87, then your cash plan.'][pick]}</p>
      <button class="btn press mt16">Show my move</button></div>`;
  }

  /* ── 17. Welcome ─────────────────────────────────────── */
  function welcome() {
    return `<div class="full-photo fade" style="${img('friends')};background-position:42% center"></div>
    ${status('on-photo')}
    <header class="bar on-photo"><div class="bar-id" style="color:var(--on-photo)"><span class="orb22" data-orb="ring" style="color:var(--on-photo)"></span><b style="color:var(--on-photo);font-size:20px;letter-spacing:-.4px">life</b></div><button class="txt" style="color:var(--on-photo)">Skip</button></header>
    <div style="flex:1"></div>
    <div class="on-photo" style="position:relative;z-index:2;padding:0 20px 34px">
      <p class="display" style="font-size:46px;line-height:48px;letter-spacing:-2.07px;font-weight:600"><b>Life, handled.</b></p>
      <p class="statement" style="font-size:21px;line-height:28px;letter-spacing:-.35px;margin-top:12px">life finds <b>what you’re owed</b>, <b>what’s due</b> and <b>what’s next</b>.</p>
      <div class="between mt32"><span class="dash"><i class="on"></i><i></i><i></i></span><button class="round press" style="width:56px;height:56px;background:var(--on-photo);color:#0D0E10" aria-label="Get started">${ic('arrow')}</button></div>
    </div>`;
  }

  /* ── 18. How life works, in life's own voice ─────────── */
  function howitworks() {
    return `${status()}${textBar(ic('back', 's18') + 'Back', 'Skip')}
    <div class="scroll" style="display:flex;flex-direction:column"><div class="rise" style="display:flex;flex-direction:column;flex:1">
      <p class="t30" style="text-align:center;margin-top:8px">Say it once.<br>life files it.</p>
      <p class="body" style="text-align:center;margin-top:8px">Talk for a minute. You’ll see everything life understood before anything is saved.</p>
      <div class="flow mt24"><div class="said-box">“My rent goes up in March, and Kofi’s birthday is Saturday.”</div><span class="down">${ic('arrowDown', 's16')}</span>
        <span class="chip" style="height:40px;padding:0 16px 0 10px;font-size:14px;gap:8px"><span data-orb="listening" data-size="22" style="width:22px;height:22px;display:block;color:var(--ink)"></span>life listens</span><span class="down">${ic('arrowDown', 's16')}</span>
        <div style="display:flex;gap:8px"><span class="chip"><i style="width:6px;height:6px;border-radius:50%;background:var(--a-home)"></i>Plan</span><span class="chip"><i style="width:6px;height:6px;border-radius:50%;background:var(--a-you)"></i>Dates</span><span class="chip"><i style="width:6px;height:6px;border-radius:50%;background:var(--a-money)"></i>Money</span></div></div>
      <div style="flex:1;min-height:20px"></div>
      <div style="display:flex;gap:12px;align-items:flex-start"><span data-orb="thinking" data-size="36" style="width:36px;height:36px;display:block;flex:none;color:var(--ink)"></span><p class="statement" style="font-size:20px;line-height:26px;letter-spacing:-.4px"><b>I adapt to you,</b> not the other way round.</p></div>
    </div></div>
    <div class="foot"><div class="pager"><button class="back press" aria-label="Back">${ic('back', 's18')}</button><button class="btn press">Next ${ic('arrow', 's18')}</button></div></div>`;
  }

  /* ── 19. One question at a time ──────────────────────── */
  function question() {
    return `${status()}${textBar(ic('back', 's18') + 'Back', '1 of 3')}
    <div class="scroll" style="display:flex;flex-direction:column">
      <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:6px">
        <span style="width:72px;height:72px;border-radius:22px;background:var(--surface);box-shadow:var(--shadow);display:grid;place-items:center;color:var(--ink)"><span data-orb="ring" data-size="34" style="width:34px;height:34px;display:block"></span></span>
        <span class="title mt16">Welcome to life</span>
        <p class="display" style="margin-top:4px"><b>What would make the biggest difference this year?</b></p>
      </div>
      <div class="gap12"><button class="pick press">I want to<span class="set">Buy my first home ${ic('more', 's16')}</span></button><button class="pick press">I live in<span>Select ${ic('more', 's16')}</span></button><button class="pick press">My work is<span>Select ${ic('more', 's16')}</span></button></div>
    </div><div class="foot"><button class="btn press">Next: where you live</button></div>`;
  }

  /* ── 20. life Plus ───────────────────────────────────── */
  function plus() {
    return `${status()}${textBar(ic('back', 's18') + 'Back', 'Skip')}
    <div class="scroll" style="display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:8px">
      <span class="title">life Plus</span>
      <p class="display" style="margin-top:6px">Unlock <b>${ic('mic')}unlimited Talk</b>, <b>${ic('book')}every lesson</b>, <b>${ic('repeat')}your routines</b> and more.</p>
      <button class="pick press mt24" style="height:72px"><span style="display:block;font-weight:600;color:var(--ink)">Annual<span class="callout" style="display:block;font-weight:500;color:var(--ink2)">£48 a year · £4 a month</span></span><span class="chip live">Save 33%</span></button>
    </div>
    <div class="foot"><button class="btn press" style="height:56px">Subscribe</button><button class="callout" style="text-align:center">Restore purchases</button><span class="micro" style="justify-content:center;color:var(--quiet)">Recurring billing · cancel any time</span></div>`;
  }


  K.screen('today', { from: '3, 17, 18, 12, 19, video', note: 'The feeling check rises as a drawer over Today, so the page itself stays as it is. Move the orb around the card; the picture and the word change with you. Close it and it waits as one small card. Then today’s moves are cards: tick to take one on, cross to leave it.', build: today, mount: (el, state) => (state === '' || state.startsWith('open|')) ? K.feelMount(el) : null });
  K.screen('plan', { from: '17, 15, 18, 11', note: 'Your Aim and your areas as photographs you tap into, each saying what’s ready. Then sections that open one at a time. Tap a section.', build: plan });
  K.screen('you', { from: '1, 5, 12', note: 'Level as a big figure, your three areas, who you’re becoming, streak in dots.', build: you });
  K.screen('talk', { from: '19, 2, 7', note: 'You speak, life listens. Each thing lights up and drops into its place as you say it. Stop, and one drawer asks whether to file. Tap the orb to play it again.', build: talk, mount: talkMount });
  K.screen('mission', { from: '19, 17', note: 'A dated timeline with your voice note and the one step that’s left.', build: mission });
  K.screen('cashplan', { from: '16', note: 'One figure, then money in and out by week with payday week picked out.', build: cashplan });
  K.screen('search', { from: '15', note: 'Opens on your areas as photographs, what you ask most, then results.', build: search });
  K.screen('body', { from: '20, 12, 5, 14', note: 'Readiness against your own normal: the shaded band is your usual range and each dot a day. Sleep, load and stress in one row, last night drawn, why you’re recovered, then food, tonight, one pattern and habits.', build: body });
  K.screen('readiness', { from: '20', note: 'One figure, what to do with it, then why: each driver against your normal.', build: readiness });
  K.screen('mealresult', { from: '14', note: 'The photograph leads. Four clean columns, one tip from life.', build: meal });
  K.screen('strength', { from: '5, 1, video', note: '66 dots, 38 lived, 2 misses forgiven. Then: did it feel like you?', build: habit });
  K.screen('teachplay', { from: '4', note: 'A huge title, the drawn picture, one big control, notes in two tones.', build: lesson });
  K.screen('understood', { from: '7', note: 'The summary stays put. Fix it by typing one line.', build: understood });
  K.screen('welcome', { from: '10', note: 'One photograph edge to edge, words low and left, one round arrow.', build: welcome });
  K.screen('question', { from: '6', note: 'The mark, one question, three soft rows.', build: question });
  K.screen('plus', { from: '3', note: 'The offer as one sentence with icons inside it. One price, one button.', build: plus });
  // New ideas, not in the screen list yet (keys start with x-).
  K.screen('x-cleared', { title: 'Marked as cleared', from: '2', note: 'A moment. One sentence with the names inside it, on open sky.', build: cleared });
  K.screen('x-timetoday', { title: 'How much time today?', from: 'the video', note: 'Your streak, a month of days, and a sheet that asks one thing. Tap a time.', build: s => timetoday(s === '' ? 1 : Number(s)) });
  K.screen('x-howitworks', { title: 'How life works', from: '8, 9', note: 'A drawing of what life does, then life speaking for itself.', build: howitworks });
  K.screen('x-aimfeel', { title: 'Your Aim, in your words', from: '11', note: 'What it should feel like, what gets you there, tools floating in pills.', build: aimfeel });
})();
