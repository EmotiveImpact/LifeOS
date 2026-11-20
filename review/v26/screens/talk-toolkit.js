// life · V26 — Talk and file, and the toolkit. Written against review/v26/KIT.md (picture-forward).
(() => {
  'use strict';
  const K = window.L26;
  const { ic, img, status, round, rootBar, pushBar, sheetBar, foot, btn, secHead, chip, orb, says, ruler, row, acc, kv, slider, stepper, bubble, dots, check, filters } = K;

  // One-off pieces the kit has no word for: the scan frame and its pins, filed chips, sentence tokens, a lab range, doors, a capsule row.
  K.addCss('.tt-', `
    .tt-dot { display:inline-block; width:6px; height:6px; border-radius:50%; flex:none; }
    .tt-end { margin-top:auto; padding-top:14px; }
    .tt-sug.chip { height:36px; padding:0 14px; font-size:14px; font-weight:500; background:var(--surface); box-shadow:var(--shadow); flex:none; }
    .tt-pname { display:block; font-size:20px; line-height:26px; font-weight:600; letter-spacing:-.4px; }
    .tt-chips { display:flex; flex-wrap:wrap; gap:6px; margin-top:10px; }
    .tt-dimchip.chip { background:var(--photo-fill); color:var(--on-photo); }
    .tt-dark.status { color:#0D0E10; }
    .tt-view { position:relative; z-index:2; flex:1; min-height:150px; }
    .tt-frame { position:absolute; pointer-events:none; color:#0D0E10; }
    .tt-frame i { position:absolute; width:26px; height:26px; }
    .tt-frame i::before, .tt-frame i::after { content:""; position:absolute; left:0; top:0; background:currentColor; border-radius:2px; }
    .tt-frame i::before { width:26px; height:4px; }
    .tt-frame i::after { width:4px; height:26px; }
    .tt-frame i:nth-child(1) { left:0; top:0; }
    .tt-frame i:nth-child(2) { right:0; top:0; }
    .tt-frame i:nth-child(2)::after { left:auto; right:0; }
    .tt-frame i:nth-child(3) { left:0; bottom:0; }
    .tt-frame i:nth-child(3)::before { top:auto; bottom:0; }
    .tt-frame i:nth-child(4) { right:0; bottom:0; }
    .tt-frame i:nth-child(4)::before { top:auto; bottom:0; }
    .tt-frame i:nth-child(4)::after { left:auto; right:0; }
    .tt-pin { position:absolute; display:inline-flex; align-items:center; gap:7px; height:30px; padding:0 13px; border-radius:999px; background:#0D0E10; color:var(--on-photo); font-size:13px; line-height:18px; font-weight:600; white-space:nowrap; box-shadow:var(--float); font-variant-numeric:tabular-nums; }
    .tt-pin small { font-size:11px; font-weight:600; color:var(--on-photo2); }
    .tt-filed { display:flex; flex-wrap:wrap; justify-content:flex-end; gap:6px; margin-top:-6px; }
    .tt-filed .chip { background:var(--surface); box-shadow:var(--shadow); transition:background .25s, color .25s; }
    .tt-filed .chip.tt-hit { background:var(--ink); color:var(--canvas); }
    .tt-step { transition:opacity .4s, transform .4s; }
    .tt-step.tt-off { opacity:0; transform:translateY(10px); }
    .tt-checking { display:flex; align-items:center; gap:10px; }
    .tt-checking.tt-hide { display:none; }
    .tt-sent.statement { line-height:46px; }
    .tt-tok { display:inline-block; height:36px; line-height:36px; padding:0 10px; border-radius:12px; background:var(--surface2); color:var(--ink); }
    .tt-tok.tt-on { background:var(--ember-tint); color:var(--ember-text); }
    .tt-said { background:var(--surface2); border-radius:16px; padding:12px 16px; font-size:15px; line-height:22px; letter-spacing:-.12px; }
    .tt-said small { display:block; font-size:11px; line-height:13px; font-weight:600; letter-spacing:.1px; color:var(--ink2); margin-bottom:4px; }
    .tt-years { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; }
    .tt-years div { display:flex; flex-direction:column; padding:12px 14px 14px; border-radius:16px; background:var(--surface); box-shadow:var(--shadow); }
    .tt-years small { font-size:11px; line-height:13px; font-weight:600; color:var(--ink2); }
    .tt-years b { font-size:20px; line-height:26px; font-weight:600; letter-spacing:-.4px; margin-top:10px; font-variant-numeric:tabular-nums; }
    .tt-years span { font-size:13px; line-height:18px; color:var(--ink2); }
    .tt-years .tt-now { background:var(--ink); color:var(--canvas); }
    .tt-years .tt-now small, .tt-years .tt-now span { color:var(--canvas); opacity:.66; }
    .tt-ac .ruler i.on { background:var(--ac); }
    .tt-range { position:relative; display:block; height:14px; margin-top:14px; }
    .tt-range::before { content:""; position:absolute; left:0; right:0; top:5px; height:4px; border-radius:2px; background:var(--surface3); }
    .tt-range span { position:absolute; top:3px; height:8px; border-radius:4px; background:var(--quiet); opacity:.45; }
    .tt-range i { position:absolute; top:0; width:14px; height:14px; margin-left:-7px; border-radius:50%; background:var(--ink); box-shadow:inset 0 0 0 3px var(--surface); }
    .tt-range .tt-flag { background:var(--ember); }
    .tt-doors { display:flex; justify-content:center; gap:12px; }
    .tt-doors i { position:relative; width:44px; height:66px; border-radius:22px 22px 6px 6px; background:var(--surface3); }
    .tt-doors i.on { background:var(--ink); }
    .tt-doors i::after { content:""; position:absolute; right:9px; top:36px; width:5px; height:5px; border-radius:50%; background:var(--surface); }
    .tt-cap.row { min-height:68px; padding:10px 20px 10px 10px; border-radius:999px; background:var(--surface); box-shadow:var(--shadow); }
    .tt-cap .ic { width:48px; height:48px; border-radius:50%; }
    .tt-lens { display:flex; align-items:center; gap:5px; margin-top:4px; font-weight:600; }
    .tt-min { display:flex; align-items:center; gap:4px; margin-top:3px; font-size:11px; line-height:13px; font-weight:600; color:var(--on-photo2); }
  `);

  const small = 'font-size:16px;line-height:21px;letter-spacing:-.22px';
  const big = 'font-size:34px;line-height:39px;letter-spacing:-1.1px';
  const dot = (colour, style = '') => `<i class="tt-dot" style="background:var(--${colour});${style}"></i>`;
  const onRound = icon => `<span class="round sm" style="background:var(--on-photo);color:#0D0E10">${ic(icon, 's16')}</span>`;
  const areaTile = (a, name, n, text) => `<div class="area has" style="background:var(--surface2);box-shadow:none"><small>${dot('a-' + a)}${name}<em>${n}</em></small><span>${text}</span></div>`;

  /* ── Ask, then file ──────────────────────────────────── */
  function ask(saved) {
    return `${status()}${pushBar('Ask life', round('clock', { label: 'Your conversations' }), 'close')}
    <div class="scroll"><div class="rise">
      <div class="chatcol">${bubble('Should I go limited company or stay a sole trader?')}</div>
      <div class="pcard mt16" style="${img('gotit')};height:214px;background-position:center 39%"><span class="topline"><span class="chip onphoto"><span data-orb="ring" data-size="14" style="width:14px;height:14px;display:block;flex:none;color:#0D0E10"></span>life, from your numbers</span></span><span class="copy"><span>For now,</span><b>stay a sole trader.</b></span></div>
      <p class="body mt12">At your <b>£48k</b> profit, the two come out within about <b>£100 a year</b>, and a company adds around <b>£1,000</b> in accountant fees.</p>
      <div class="card pad16 tint work mt16">
        <div class="between"><span class="micro">Take-home per year · 2026/27</span>${chip('Engine estimate')}</div>
        <div class="mt8">${kv('Sole trader', '£36,868')}${kv('Limited company', '£36,962')}</div>
      </div>
    </div></div>
    <div class="drawer">${saved
      ? `<h3>Saved to Work.</h3><p>life will bring it back if profit passes £60k.</p><div class="decide"><button class="side press" data-set="" style="width:auto;padding:0 18px;font-size:14px;font-weight:600">Undo</button></div>`
      : `<h3>Save this to Work?</h3><p>As a decision to revisit if profit passes £60k.</p><div class="decide"><button class="side press" aria-label="Not now">${ic('close', 's18')}</button><i class="dotsep"></i><i class="dotsep"></i><button class="knob press" data-set="saved" aria-label="Save to Work">${ic('check')}</button><i class="dotsep"></i><i class="dotsep"></i><button class="side press" aria-label="Ask a follow-up">${ic('mic', 's18')}</button></div>`}</div>`;
  }

  /* ── Attach ──────────────────────────────────────────── */
  function attach() {
    const opt = (photo, pos, icon, t, s) => `<button class="pcard press" style="${img(photo)};height:138px;background-position:${pos}"><span class="topline">${onRound(icon)}</span><span class="copy"><b style="${small}">${t}</b><span>${s}</span></span></button>`;
    return `${status()}${pushBar('Attach', '', 'close')}
    <div class="scroll"><div class="rise">
      <p class="display"><b>Add something</b> to the conversation.</p>
      <button class="pcard press mt20" style="${img('letter')};height:204px;background-position:center 60%"><span class="topline"><span class="chip onphoto">life reads it for you</span>${onRound('camera')}</span><span class="copy"><b>Scan a letter</b><span>Use your camera. life files what matters.</span></span></button>
      <div class="pgrid" style="margin-top:10px">${opt('food', '38% 42%', 'camera', 'Camera', 'Take a photo')}${opt('siblings', 'center 42%', 'images', 'Photos', 'Choose an image')}${opt('passport', 'center 70%', 'folder', 'Files', 'Choose a document')}${opt('breathe', 'center 34%', 'pulse', 'How I’m feeling', 'Open Pulse')}</div>
      <p class="callout mt16">Read, review, then confirm. Nothing is filed until you say so.</p>
    </div></div>`;
  }

  /* ── Letter, understood ──────────────────────────────── */
  function scan() {
    const pin = (l, v, style) => `<span class="tt-pin" style="${style}"><small>${l}</small>${v}</span>`;
    return `<div class="full-photo" style="${img('letter')};bottom:auto;height:560px;background-size:469px auto;background-position:-71px -174px"></div>
    ${status('tt-dark')}
    <header class="bar"><span class="chip" style="background:#0D0E10;color:var(--on-photo)">Council tax bill · Lambeth</span><button class="round press" style="background:#0D0E10;color:var(--on-photo)" aria-label="Close">${ic('close', 's18')}</button></header>
    <div class="tt-view"><span class="tt-frame" style="left:22px;right:78px;top:8px;bottom:14px" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
      ${pin('Amount', '£1,812.00', 'left:60px;top:80px')}${pin('Due', '1 Dec 2026 · 10 instalments', 'left:70px;top:118px')}${pin('Band', 'C', 'left:80px;top:156px')}</div>
    <div class="sheet">
      <div class="handle" style="margin-bottom:16px"></div>
      <div class="between"><span class="eyebrow">Scanned just now · LBL-7741-0092</span>${chip(ic('check', 's14') + 'Read', 'done')}</div>
      <p class="statement mt12" style="font-size:20px;line-height:26px;letter-spacing:-.4px">You’re billed as a shared household, but you told me you <b>live with 2 flatmates</b>. That’s right, so <b>no discount</b>. If one moves out, you’ll get <b>25% off.</b></p>
      <div class="micro mt20">Filed into your life</div>
      <div class="areas mt8" style="grid-template-columns:1fr 1fr">${areaTile('money', 'Money', 1, '£181.20 a month from 1 Dec. Added to your cash plan.')}${areaTile('home', 'Home', 1, 'Watch for a household change. life will remind you.')}</div>
      <div class="mt16" style="display:flex;gap:8px"><button class="btn ghost press" style="width:auto;padding:0 16px;flex:none" aria-label="Ask life about this letter">Ask life</button><button class="btn press">Set up the direct debit</button></div>
    </div>`;
  }

  /* ── Chat: the typed thread. What you say is filed as you say it ── */
  function chat() {
    const sug = t => `<button class="chip press tt-sug">${t}</button>`;
    const filed = (a, t) => `<button class="chip press">${dot('a-' + a)}${t}</button>`;
    const title = `<button class="press" data-set="" aria-label="Play it again" style="display:inline-flex;align-items:center;gap:8px;font-weight:600">${orb('ring', 18)}life</button>`;
    return `${status()}${pushBar(title, round('more', { label: 'Your conversations' }), 'close')}
    <div class="scroll"><div class="chatcol">
      <div class="bubble tt-step" data-step="1">I’m 27, in London, and I just went freelance. What should I sort first?</div>
      <div class="tt-filed tt-step" data-step="2">${filed('you', 'Filed to You · 27, London')}${filed('work', 'Filed to Work · went freelance')}</div>
      <span class="callout tt-checking tt-hide">${orb('searching', 20)}Checking London schemes and the NHS…</span>
      <p class="statement tt-step" data-step="3">Congrats on going freelance. Two things <b>matter this week</b>: register for <b>Self Assessment</b> by 5 October, and start a <b>tax pot</b> so January isn’t a shock.</p>
      <div class="pgrid tt-step" data-step="4">
        <button class="pcard press" style="${img('payslip')};height:184px;background-position:center 82%"><span class="topline"><span class="chip onphoto">${dot('ember')}Due 5 Oct</span></span><span class="copy"><b style="${small}">Register as self-employed</b><span>10 minutes on GOV.UK · life drafts every answer</span></span></button>
        <button class="tile tint money press"><span class="th"><span>Tax pot</span></span><span class="num">25%</span><span class="sub">Set aside from each invoice</span><span class="tt-end"><span class="meter" style="display:block;margin-top:0"><i style="width:25%;background:var(--ac)"></i></span><span class="callout" style="display:block;margin-top:8px">≈ £680 a month</span></span></button>
      </div>
    </div></div>
    <div class="foot" style="padding-top:0">
      <div class="hscroll">${['What’s urgent?', 'How am I doing?', 'My money', 'Teach me Self Assessment'].map(sug).join('')}</div>
      <div class="composer" style="align-items:center;padding:8px 8px 8px 10px"><button class="round sm press" aria-label="Attach">${ic('add', 's16')}</button><p class="q">Message life, or hold the mic</p><button class="round solid press" aria-label="Hold to talk" style="width:44px;height:44px">${ic('mic', 's18')}</button></div>
    </div>`;
  }
  /** Plays the thread once: your message lands, what life understood is filed, life checks, then answers. */
  function chatMount(el, state) {
    const reveal = () => { el.querySelectorAll('.tt-off').forEach(n => n.classList.remove('tt-off')); const c = el.querySelector('.tt-checking'); if (c) c.classList.add('tt-hide'); };
    try {
      if (state !== '' || typeof matchMedia !== 'function' || matchMedia('(prefers-reduced-motion: reduce)').matches) return null;
      if (typeof location !== 'undefined' && /[?&]noanim\b/.test(location.search)) return null;
      const steps = [...el.querySelectorAll('[data-step]')], checking = el.querySelector('.tt-checking'), chips = [...el.querySelectorAll('.tt-filed .chip')];
      if (!steps.length || !checking) return null;
      const timers = [];
      let started = false;
      const at = (ms, fn) => timers.push(setTimeout(fn, ms));
      const show = n => steps.forEach(s => { if (Number(s.dataset.step) <= n) s.classList.remove('tt-off'); });
      const play = () => {
        if (started) return;
        started = true;
        at(200, () => show(1));
        at(900, () => { show(2); chips.forEach((c, k) => { at(k * 260, () => c.classList.add('tt-hit')); at(k * 260 + 800, () => c.classList.remove('tt-hit')); }); });
        at(2000, () => checking.classList.remove('tt-hide'));
        at(3600, () => { checking.classList.add('tt-hide'); show(3); });
        at(4200, () => show(4));
      };
      steps.forEach(s => s.classList.add('tt-off'));
      const io = typeof IntersectionObserver === 'function' ? new IntersectionObserver(es => { if (es[0].isIntersecting) play(); }, { threshold: .55 }) : null;
      if (io) io.observe(el);
      // Some hosts never deliver intersection callbacks to a background page: start anyway when the screen is on show.
      const nudge = setTimeout(() => { const r = el.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) play(); }, 1400);
      return () => { timers.forEach(clearTimeout); clearTimeout(nudge); if (io) io.disconnect(); };
    } catch (err) { reveal(); return null; }
  }

  /* ── Your conversations ──────────────────────────────── */
  function chathistory() {
    const card = (photo, pos, h, tag, title, n) => `<button class="pcard press" style="${img(photo)};height:${h}px;background-position:${pos}"><span class="topline"><span class="chip onphoto">${tag}</span></span><span class="copy"><b style="${small}">${title}</b><span>Filed ${n}</span></span></button>`;
    return `${status()}${pushBar('', round('search', { label: 'Search conversations' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Talk · your conversations</span>
      <p class="display"><b>5 conversations.</b> 12 things filed.</p>
      <div class="mt16">${filters(['All', 'Chat', 'Talk', 'Scan'])}</div>
      <button class="pcard press mt16" style="${img('desk')};height:176px;background-position:78% center"><span class="topline"><span class="chip onphoto">Latest · Chat · today 09:12</span><span class="chip onphoto">Filed 3</span></span><span class="copy"><b>Going freelance</b><span>“What should I sort first?”</span></span></button>
      <div class="pgrid" style="margin-top:10px">${card('letter', 'center 62%', 150, 'Scan · yesterday', 'Council tax letter', 2)}${card('bedroom', 'center 70%', 150, 'Talk · Monday', 'How I slept this week', 1)}${card('birthday', 'center 62%', 140, 'Talk · Sunday', 'Sister’s birthday plans', 2)}${card('terrace', '72% center', 140, 'Chat · last week', 'Rent vs buy', 4)}</div>
      <p class="callout mt16">Nothing here is needed to use life. Everything useful is already filed in its place.</p>
    </div></div>`;
  }

  /* ── Edit what life filed ────────────────────────────── */
  function editfiled() {
    const tok = (t, on) => `<button class="tt-tok press ${on ? 'tt-on' : ''}">${t}</button>`;
    const said = '…and the council tax is £148 a month, due on the 1st.';
    return `${status()}<div class="dim">${pushBar('life', round('more', { label: 'More' }), 'close')}</div>
    <div class="scroll dim" style="flex:1;overflow:hidden"><div class="chatcol">${bubble(said)}<div class="tt-filed"><span class="chip">${dot('a-money')}Filed to Money · council tax, £148 a month</span></div></div></div>
    <div class="sheet"><div style="margin:0 -20px">${sheetBar('Filed from chat')}</div>
      <p class="statement tt-sent mt8">${tok('Council tax')} is ${tok('£148 a month', true)}, due on the ${tok('1st of each month')}, filed in ${tok('Money → Bills')}.</p>
      <div class="micro mt20" style="justify-content:center">Amount, a month</div>
      <div class="mt8">${stepper('£148')}</div>
      <div class="tt-said mt20"><small>You said</small>“${said}”</div>
      <div class="mt16">${btn('Save')}</div>
      <div class="between mt12"><button class="callout ink press" style="font-weight:600">Unfile this</button><span class="callout">life learns from the correction.</span></div>
    </div>`;
  }

  /* ── Tax and NI check ────────────────────────────────── */
  function taxcheck() {
    const years = Array.from({ length: 35 }, (_, k) => k === 5 ? 'now' : k < 10 ? 'on' : '');
    return `${status()}${pushBar('Tax &amp; NI', round('info', { label: 'How this is checked' }))}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('payslip')};height:204px;background-position:center 86%"><span class="topline"><span class="chip onphoto">Money · HMRC</span><span class="chip onphoto">2024/25 · P800</span></span><span class="copy"><span>You overpaid. Owed to you:</span><b style="${big}">£840 back</b><span>Checked against your Personal Tax Account.</span></span></div>
      <div class="tt-years mt12">
        <div><small>2022/23</small><b>OK</b><span>Settled</span></div>
        <div><small>2023/24</small><b>OK</b><span>Settled</span></div>
        <div class="tt-now"><small>2024/25</small><b>£840</b><span>P800 · overpaid</span></div>
      </div>
      <div class="card tint money mt12">
        <div class="between"><span class="title">National Insurance record</span>${chip('35 needed')}</div>
        <div class="mt16">${dots(years, 12)}</div>
        <div class="legend mt12"><span><i style="background:var(--ink)"></i>9 qualifying years</span><span><i style="background:var(--ember)"></i>1 gap · 2021/22</span></div>
        <p class="body mt12">Filling it costs roughly <b>£900</b> and adds about <b>£340 a year</b> to your State Pension, for life. life checks the exact figure with HMRC first.</p>
      </div>
    </div></div>${foot(btn('Check if it’s worth filling'))}`;
  }

  /* ── Income and structure ────────────────────────────── */
  function income() {
    return `${status()}${pushBar('Income &amp; structure', round('info', { label: 'How this is worked out' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Sole trader or limited company</span>
      <p class="display">After fees, <b>staying a sole trader</b> keeps about <b>£860 more.</b></p>
      <div class="hero mt20">
        <div class="photo" style="${img('desk')};height:124px;background-position:center 18%"><span class="copy"><small>Annual profit · drag to try another</small><b>£50,000</b></span></div>
        <div class="below">${slider(42)}
          <div class="cols" style="grid-template-columns:1fr 1fr;margin-top:14px"><div><small>Sole trader</small><b>£38,268</b><span>take-home</span></div><div><small>Limited company</small><b>£38,408</b><span>before ~£1,000 fees</span></div></div></div>
      </div>
      <p class="callout mt12">Take-home per year · tax year 2026/27 · before ~£1,000 accountant fees for a company</p>
      <p class="callout mt16">An estimate from life’s engine, not tax advice. life suggests speaking to an accountant before switching.</p>
    </div></div>`;
  }

  /* ── Rent vs buy ─────────────────────────────────────── */
  function rentbuy() {
    return `${status()}${pushBar('Rent vs buy', round('info', { label: 'How the model works' }))}
    <div class="scroll"><div class="rise">
      <p class="statement">Over 10 years, buying a <b>£425k</b> flat leaves you about <b>£45,600 better off</b> than renting and investing the difference.</p>
      <div class="sec-head" style="margin-top:20px;align-items:center"><h4>Wealth after 10 years</h4>${chip('Engine model', 'q')}</div>
      <div class="pgrid">
        <div class="pcard" style="${img('terrace')};height:186px;background-position:36% center"><span class="topline"><span class="chip tt-dimchip">Rent + invest</span></span><span class="copy"><b>£207.8k</b><span>Renting, investing the difference</span></span></div>
        <div class="pcard" style="${img('keyshome')};height:186px;background-position:center 78%"><span class="topline"><span class="chip onphoto">${ic('check', 's14')}Buy</span></span><span class="copy"><b>£253.4k</b><span>About £45,600 more</span></span></div>
      </div>
      <div class="card mt12">
        <div class="between">${chip('Not yet', 'live')}<span class="callout">£2,340 of the £49k you need</span></div>
        ${ruler(5)}
        <p class="body mt12">A Lifetime ISA adds <b>25%</b> to what you save. Want a plan?</p>
        <button class="btn press mt16">Make a plan</button>
      </div>
      <div class="card pad16 mt12">
        <div class="cols" style="grid-template-columns:repeat(3,1fr)"><div><small>Mortgage</small><b>£1,938</b><span>a month</span></div><div><small>Cash needed</small><b>£49,000</b><span>10% deposit + costs</span></div><div><small>Rent today</small><b>£1,150</b><span>a month</span></div></div>
        <p class="callout mt12">£382.5k at 4.5% over 30 years. Rent rising 4% a year in the model.</p>
      </div>
      <p class="callout mt16">A model from life’s engine, not financial advice.</p>
    </div></div>`;
  }

  /* ── Bloodwork reader ────────────────────────────────── */
  function blood() {
    const m = (name, tag, tone, val, unit, pos) => `<button class="tile press"><span class="th"><span>${name}</span>${chip(tag, tone)}</span><span class="num">${val}<small>${unit}</small></span><span class="tt-range"><span style="left:30%;width:46%"></span><i class="${tone === 'live' ? 'tt-flag' : ''}" style="left:${pos}%"></i></span></button>`;
    return `${status()}${pushBar('Bloodwork', round('info', { label: 'How life reads results' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Health · 3 Nov · your last test</span>
      <p class="display"><b>2 of 4 in range.</b> Two worth a word with your <b>GP.</b></p>
      <div class="tiles mt24">${m('Vitamin D', 'Low', 'live', '38', 'nmol/L', 14)}${m('Ferritin', 'In range', 'q', '64', 'µg/L', 53)}${m('HbA1c', 'In range', 'q', '36', 'mmol/mol', 45)}${m('ApoB', 'High end', '', '1.1', 'g/L', 73)}</div>
      <p class="callout mt12">Each dot sits against the lab’s usual range.</p>
      <div class="card pad16 tint health mt16"><div class="micro">What to ask your GP</div>
        <div class="mt8">${check('<b>Vitamin D.</b> NHS advice is 10 micrograms (400 IU) a day in autumn and winter. Ask your GP if it stays low.')}${check('<b>ApoB.</b> Worth discussing with your GP at your next review.')}</div></div>
    </div></div>${foot(btn('Add a result', { icon: 'add' }) + `<span class="callout" style="text-align:center">life explains results, it doesn’t diagnose. Always check with your GP.</span>`)}`;
  }

  /* ── Protection review ───────────────────────────────── */
  function protect() {
    const item = (on, t, s, tag, tone) => `<button class="row press"><span class="tick ${on ? 'on' : ''}">${on ? ic('check', 's14') : ''}</span><span class="mid"><b>${t}</b><span>${s}</span></span>${chip(tag, tone)}</button>`;
    return `${status()}${pushBar('Protection', '')}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('siblings')};height:204px;background-position:center 46%"><span class="topline"><span class="chip onphoto">Level 4 · your downside</span><span class="chip onphoto">1 of 4 done</span></span><span class="copy"><b>Protect what you’ve built</b><span>Four checks, about 20 minutes in total.</span></span></div>
      <div class="card mt12">
        <div class="between">${chip('Gap', 'live')}<span class="callout">Start here</span></div>
        <div class="headline mt12">Income protection</div>
        <p class="body" style="margin-top:4px">Self-employed: <b>no sick pay.</b> 2 quotes found.</p>
        <button class="btn press mt16">See the 2 quotes ${ic('arrow', 's18')}</button>
      </div>
      <div class="card pad16 rows mt12">${item(false, 'Pension nomination', 'Who gets your pension if you die', '5 min', '')}${item(false, 'A simple will', 'Usually £150–£300 with a solicitor', 'To do', 'q')}${item(true, 'Emergency contacts', 'In your phone’s Medical ID', 'Done', 'done')}</div>
    </div></div>`;
  }

  /* ── Growth path ─────────────────────────────────────── */
  function growth() {
    const lesson = (photo, pos, t, min) => `<button class="ptile press" style="${img(photo)};flex-basis:150px;background-position:${pos}"><b>${t}<span class="tt-min">${ic('play', 's14')}${min}</span></b></button>`;
    return `${status()}${pushBar('', round('more', { label: 'More' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Level 4 · growth path</span>
      <p class="display">You’ve kept your <b>payday sweep</b> for <b>3 months</b>. Next: <b>raise your rate.</b></p>
      <div class="pcard mt20" style="${img('journal')};height:284px;background-position:center 60%">
        <span class="topline"><span class="chip onphoto">This week’s check-in</span><span class="chip onphoto">${dot('ember')}Due Sun</span></span>
        <span style="display:block"><b class="tt-pname">What did you do this week that future-you will thank you for?</b><span class="tt-chips">${['Saved more', 'Learned something', 'Rested properly'].map(t => `<button class="chip onphoto press">${t}</button>`).join('')}</span></span>
      </div>
      ${secHead('Lessons', '2 of 6')}
      <div class="hscroll">${lesson('areawork', 'center 55%', 'Pricing your work', '6 min')}${lesson('friends', 'center', 'Asking for a rate rise', '5 min')}${lesson('freedom', 'center 70%', 'Building a second income', '8 min')}</div>
      <button class="btn ghost press mt20">${ic('repeat', 's18')}Knocked off course? Reset in 3 steps</button>
    </div></div>`;
  }

  /* ── Your next home: bedrooms ────────────────────────── */
  function bedrooms() {
    return `${status()}${pushBar('Your next home', '')}
    <div class="scroll" style="display:flex;flex-direction:column"><div class="rise" style="display:flex;flex-direction:column;flex:1">
      <div class="pcard" style="${img('bedroom')};height:236px;flex:none;background-position:center 76%"><span class="topline"><span class="chip onphoto">Rent vs buy · bedrooms</span></span><span class="copy"><span>A 2-bed in South London is around</span><b style="${big}">£425k</b><span>Deposit at 10%: £43k</span></span></div>
      <div class="card mt12" style="flex:1;display:flex;flex-direction:column;justify-content:center">
        <div class="title" style="text-align:center">How many bedrooms do you need?</div>
        <div class="tt-doors mt20" aria-hidden="true"><i class="on"></i><i class="on"></i><i></i><i></i></div>
        <div class="mt20">${stepper('2', 'bedrooms')}</div>
      </div>
      <p class="callout mt12" style="text-align:center">Illustrative. life uses live prices.</p>
    </div></div>${foot(btn('Use this'))}`;
  }

  /* ── How big a buffer? ───────────────────────────────── */
  function buffer() {
    return `${status()}${pushBar('How big a buffer?', '')}
    <div class="scroll"><div class="rise">
      <div class="card tint money tt-ac">
        <span class="eyebrow">30-day cash plan · your target</span>
        <div class="xl" style="margin-top:8px">£5,460</div>
        <p class="body mt8">At <b>£180 a month</b>, you get there in <b>18 months</b>.</p>
        ${ruler(43)}
        <div class="between mt8"><span class="callout">£2,340 now · covers 1.3 months</span><span class="callout">43%</span></div>
      </div>
      <div class="card mt12">
        <div class="title" style="text-align:center">How many months of essentials do you want saved?</div>
        <div style="width:216px;margin:20px auto 0">${dots(['on', 'on', 'on', '', '', ''], 6)}</div>
        <div class="mt20">${stepper('3', 'months')}</div>
      </div>
      <div class="card pad16 mt12">${kv('Your essentials', '£1,820 a month')}${kv('3 months of them', '£5,460')}${kv('Your payday sweep', '£180 a month')}</div>
    </div></div>${foot(btn('Set my target'))}`;
  }

  /* ── Locked tool ─────────────────────────────────────── */
  function unlock() {
    return `${status()}<div class="dim">${rootBar('Plan', '', round('search', { label: 'Search' }) + round('add', { label: 'Add to plan' }))}</div>
    <div class="scroll dim" style="flex:1;overflow:hidden">
      <span class="eyebrow"><span class="star"></span>Your plan</span>
      <div class="mt16">${acc('Your tools', 12, `<div class="rows">${row('cash', '30-day cash plan', 'Money')}${row('home', 'Rent vs buy', 'Home', chip('Level 3', 'q'))}${row('calculator', 'Tax check', 'Money')}</div>`, true)}</div>
    </div>
    <div class="sheet"><div style="margin:0 -20px">${sheetBar('Locked tool')}</div>
      <div class="pcard" style="${img('terrace')};height:140px;margin-top:4px"><span class="topline"><span class="chip onphoto">Home · level 3</span></span><span class="copy"><b>Rent vs buy opens at level 3</b></span></div>
      <p class="body mt12">It’s most useful once your buffer and tax are sorted, because the numbers depend on them. <b>Two steps to go:</b></p>
      <div class="mt8">${check('Review this year’s tax')}${check('Book your heart referral')}</div>
      <div class="mt12">${btn('Show me the steps')}</div>
      <button class="btn ghost press mt8">Open it early anyway</button>
      <p class="callout mt12" style="text-align:center">Levels guide. They never lock you out of your own data.</p>
    </div>`;
  }

  /* ── Bigger decisions ────────────────────────────────── */
  function decisions() {
    const later = (photo, pos, t, s, lens, lvl) => `<button class="row press"><span class="thumb" style="${img(photo)};background-position:${pos}"></span><span class="mid"><b>${t}</b><span>${s}</span><span class="tt-lens">${ic('book', 's14')}${lens}</span></span>${chip(lvl, 'q')}</button>`;
    return `${status()}${pushBar('Bigger decisions', '')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">One bigger move per level</span>
      <p class="display"><b>One at a time,</b> when you have the room for it.</p>
      <div class="stack mt24">
        <div class="peek"><span>Protect your income</span><span>3</span></div>
        <div class="peek"><span>Sole trader or limited?</span><span>2</span></div>
        <div class="card next" style="padding:0;overflow:hidden">
          <div class="photo" style="${img('keyshome')};height:124px;border-radius:0;align-items:flex-start;background-position:center 80%"><span class="chip onphoto" style="position:relative;z-index:1;margin:14px 16px">Opens at level 3</span></div>
          <div style="padding:16px 20px 20px">
            <div class="micro"><span class="sig"></span>Your next bigger decision · 1 of 4</div>
            <div class="headline">Rent vs buy</div>
            <p class="body">Run the real numbers for your first home</p>
            <button class="btn press">Run the numbers ${ic('arrow', 's18')}</button>
            <div class="between"><span class="callout">${ic('book', 's16')}Housel · room for error</span><span class="callout">Taught through a lens</span></div>
          </div>
        </div>
      </div>
      ${secHead('Resting behind it', 'Opens by level')}
      <div class="card pad16 rows">${later('desk', '76% center', 'Sole trader or limited?', 'See which keeps more of your profit', 'Munger · invert', 'Level 3')}${later('siblings', 'center 40%', 'Protect your income', 'Cover for when you can’t work', 'Taleb · remove what can ruin you', 'Level 4')}${later('freedom', 'center 75%', 'Second income stream', 'Turn a skill into something that earns while you sleep', 'Naval · leverage', 'Level 4')}</div>
    </div></div>`;
  }

  /* ── All tools ───────────────────────────────────────── */
  function tools() {
    const open = t => `<span class="chip onphoto">${t}</span>`;
    const later = t => `<span class="chip tt-dimchip">${t}</span>`;
    const area = (photo, pos, h, name, count, chips) => `<button class="pcard press" style="${img(photo)};height:${h}px;background-position:${pos}"><span class="topline"><span class="chip tt-dimchip">${count}</span></span><span style="display:block"><b class="tt-pname">${name}</b><span class="tt-chips">${chips}</span></span></button>`;
    const wait = (photo, pos, t, why, lvl) => `<button class="row press"><span class="thumb" style="${img(photo)};background-position:${pos}"></span><span class="mid"><b>${t}</b><span>${why}</span></span>${chip(lvl, 'q')}</button>`;
    return `${status()}${pushBar('', round('search', { label: 'Search tools' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Plan · your toolkit</span>
      <p class="display"><b>8 tools unlocked.</b> 6 more as you level up.</p>
      ${ruler(57, 14)}
      <div class="mt20">${area('payslip', 'center 86%', 168, 'Money', '3 open', open('30-day cash plan') + open('Tax &amp; NI check') + open('Subscriptions'))}</div>
      <div class="pgrid" style="margin-top:10px">${area('keyshome', 'center 74%', 150, 'Home', '1 open', open('Rent vs buy'))}${area('desk', '76% center', 150, 'Work', '1 open', open('Income &amp; structure'))}</div>
      <div style="margin-top:10px">${area('walk', 'center 36%', 168, 'Health', '1 open · 1 later', open('Health stack') + later('Bloodwork reader · level 3'))}</div>
      ${secHead('As you level up', 'Worth the wait')}
      <div class="card pad16 rows">${wait('run', 'center', 'Bloodwork reader', 'A plain-English read of each marker', 'Level 3')}${wait('siblings', 'center 42%', 'Protection review', 'The safety nets most people never check', 'Level 4')}</div>
    </div></div>`;
  }

  /* ── Health stack ────────────────────────────────────── */
  function healthstack() {
    const cap = (icon, t, s, end) => `<button class="row tt-cap press"><span class="ic">${ic(icon)}</span><span class="mid"><b>${t}</b><span>${s}</span></span>${end}</button>`;
    return `${status()}${pushBar('Health stack', round('add', { label: 'Add to your stack' }))}
    <div class="scroll"><div class="rise">
      ${chip(ic('check', 's14') + 'Timing · no clashes', 'done')}
      <p class="display"><b>Nothing clashes.</b> One thing to raise with your <b>GP.</b></p>
      <div class="gap8 mt20">${cap('sun', 'Vitamin D', 'Morning · Oct–Mar', '<span class="end">1,000 IU</span>')}${cap('fitness', 'Creatine', 'Any time', '<span class="end">5 g</span>')}${cap('water', 'Iron', 'Your last test was low', chip('Talk to GP', 'live'))}</div>
      <div class="mt16">${says('Take iron away from tea or coffee: they reduce how much you absorb.')}</div>
      <div class="pcard mt16" style="${img('food')};height:150px;background-position:38% 45%"><span class="topline"><span class="chip onphoto">Worth knowing</span></span><span class="copy"><b style="font-size:20px;line-height:26px;letter-spacing:-.4px">Your diet already covers B12 and omega-3 most days.</b></span></div>
      <p class="callout mt12">Wellness information, not medical advice. Check medicines with a pharmacist.</p>
    </div></div>`;
  }

  K.screen('ask', { from: '7, 14, 19', note: 'Your question, the answer set on a photograph, the two figures it came from, then one drawer to file it. Tap the tick.', build: s => ask(s === 'saved') });
  K.screen('attach', { from: '15, 14', note: 'Opens on pictures. Scan a letter leads as the tall card, with four quieter ways to add under it.', build: attach });
  K.screen('scan', { from: '14, 2, 19', note: 'The letter fills the frame with what life read pinned to it. The sheet says what it means and shows it dropping into Money and Home.', build: scan });
  K.screen('chat', { from: '7, 19, 12', note: 'The typed thread. Your message lands, what life understood is filed to its area, life checks, then answers with live cards. The mic is always offered. Tap the orb to play it again.', build: chat, mount: chatMount });
  K.screen('chathistory', { from: '14, 15', note: 'Every conversation as a photograph of what it was about, newest tall in front, each with what it filed.', build: chathistory });
  K.screen('editfiled', { from: '2, 7', note: 'The filed detail reads as one sentence. Tap the part that is wrong and change only that.', build: editfiled });
  K.screen('taxcheck', { from: '14, 5, 16', note: 'What you are owed, set on the payslip. Three tax years at a glance, then your NI record as 35 dots with the gap picked out.', build: taxcheck });
  K.screen('income', { from: '3, 12', note: 'The verdict as a sentence, then one slider for profit with both structures side by side under it.', build: income });
  K.screen('rentbuy', { from: '14, 12, 16', note: 'One sentence, then renting and buying as two photographs with buying picked out, how far the deposit is, and what the model assumes.', build: rentbuy });
  K.screen('blood', { from: '20, 12', note: 'Four markers as tiles, each dot placed against the usual range, then what to ask your GP.', build: blood });
  K.screen('protect', { from: '10, 11', note: 'The people it is for come first. The one gap is a card with the only button, then three checks with round ticks.', build: protect });
  K.screen('growth', { from: '1, 14, 15', note: 'Where you stand in one sentence, this week’s one question on a photograph, then lessons as a shelf of pictures.', build: growth });
  K.screen('bedrooms', { from: '14, 6, 21', note: 'The price sits on a bedroom. Doors count the rooms and one stepper changes the answer.', build: bedrooms });
  K.screen('buffer', { from: '5, 12, 21', note: 'The target as one figure and how far along you are, then months counted in dots with one stepper.', build: buffer });
  K.screen('unlock', { from: '21, 11', note: 'A short sheet over Plan: the tool as a photograph, why it opens later, the two steps left, and a way in anyway.', build: unlock });
  K.screen('decisions', { from: '18, 17', note: 'One bigger decision in front with its picture and its lens, the others resting behind it until their level.', build: decisions });
  K.screen('tools', { from: '15, 17, 12', note: 'Fourteen ticks, eight lit. Tools sit on a photograph of their area: bright ones open now, faint ones show their level.', build: tools });
  K.screen('healthstack', { from: '13, 14', note: 'The clash check as one sentence, what you take as three capsule rows, one tip from life, and your food doing its part.', build: healthstack });
})();
