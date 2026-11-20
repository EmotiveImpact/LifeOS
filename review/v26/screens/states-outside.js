// life · V26 — States, and life outside the app. Written against review/v26/KIT.md.
// States are drawn as states of their parent screen (its bar, its shape). Outside-the-app screens draw the real surface.
(() => {
  'use strict';
  const K = window.L26;
  const { ic, img, status, round, rootBar, pushBar, sheetBar, dock, foot, btn, secHead, orb, ruler, dots, toggle, bubble, caps } = K;

  // One-off styles: loading blocks, the camera frame, the two-date choice, and the surfaces outside the app
  // (widget frames, the Dynamic Island, lock-screen notifications, the share card, the watch, Android shapes).
  K.addCss('.so-', `
.so-above { position: relative; z-index: 2; }
.so-sk { display: block; flex: none; background: var(--surface2); animation: so-breathe 1.8s ease-in-out infinite; }
.so-deep { background: var(--surface3); }
.so-late { animation-delay: .35s; }
.so-lines { display: grid; gap: 13px; margin-top: 10px; padding: 6px 0 7px; }
@keyframes so-breathe { 50% { opacity: .5; } }
@media (prefers-reduced-motion: reduce) { .so-sk { animation: none; } }
.so-stale .num { color: var(--quiet); }
.so-stale .th i { background: var(--surface3); }
.so-finder { position: relative; height: 250px; border-radius: 28px; overflow: hidden; background: var(--surface2) center 60%/cover no-repeat; box-shadow: var(--shadow); display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; }
.so-finder::after { content: ""; position: absolute; inset: 0; background: var(--panel); }
.so-finder > * { position: relative; z-index: 1; }
.so-corner { position: absolute; width: 26px; height: 26px; }
.so-corner::before, .so-corner::after { content: ""; position: absolute; left: 0; top: 0; border-radius: 2px; background: var(--on-photo); }
.so-corner::before { width: 26px; height: 3px; }
.so-corner::after { width: 3px; height: 26px; }
.so-c1 { left: 18px; top: 18px; }
.so-c2 { right: 18px; top: 18px; transform: rotate(90deg); }
.so-c3 { right: 18px; bottom: 18px; transform: rotate(180deg); }
.so-c4 { left: 18px; bottom: 18px; transform: rotate(270deg); }
.so-app { width: 72px; height: 72px; border-radius: 22px; background: var(--surface); box-shadow: var(--shadow); display: grid; place-items: center; color: var(--ink); }
.so-pair { display: flex; gap: 10px; }
.so-choice { flex: 1; display: flex; flex-direction: column; gap: 4px; padding: 14px 16px 16px; border-radius: 20px; background: var(--surface2); color: var(--ink); }
.so-choice small { font-size: 13px; line-height: 18px; font-weight: 500; color: var(--ink2); }
.so-choice[aria-pressed="true"] { background: var(--ink); color: var(--canvas); }
.so-choice[aria-pressed="true"] small { color: var(--canvas); opacity: .7; }
.so-urgent { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 16px; border-radius: 20px; background: var(--surface2); }
.so-w { display: flex; flex-direction: column; background-color: var(--surface); color: var(--ink); border-radius: 26px; padding: 16px; box-shadow: var(--float); }
.so-md { width: 330px; height: 159px; }
.so-sm { width: 159px; height: 159px; }
.so-ring { position: relative; flex: none; display: grid; place-items: center; }
.so-ring i { position: absolute; border-radius: 50%; background: var(--surface3); }
.so-ring i.on { background: var(--ac, var(--ink)); }
.so-night .so-ring i { background: var(--photo-fill); }
.so-night .so-ring i.on { background: var(--on-photo); }
.so-steps { display: flex; align-items: center; gap: 5px; }
.so-steps i { width: 8px; height: 8px; border-radius: 50%; background: var(--surface3); }
.so-steps i.on { background: var(--ink); }
.so-steps i.now { background: var(--ember); }
.so-night .so-steps i { background: var(--photo-fill); }
.so-night .so-steps i.on { background: var(--on-photo); }
.so-night .so-steps i.now { background: var(--ember); }
.so-island { position: absolute; z-index: 5; top: 11px; left: 12px; width: calc(100% - 24px); display: block; border-radius: 38px; padding: 14px 20px 16px; }
.so-apps { display: flex; justify-content: space-between; }
.so-icon { width: 60px; height: 60px; border-radius: 16px; background: var(--photo-fill); display: grid; place-items: center; flex: none; }
.so-pages { position: relative; z-index: 2; flex: none; display: flex; justify-content: center; gap: 6px; padding: 14px 0; }
.so-pages i { width: 6px; height: 6px; border-radius: 50%; background: var(--photo-fill); }
.so-pages i.on { background: var(--on-photo); }
.so-homebar { position: relative; z-index: 2; flex: none; display: flex; align-items: center; justify-content: space-between; height: 88px; margin: 0 12px 12px; padding: 0 20px; border-radius: 32px; background: var(--photo-fill); }
.so-lockhead { position: relative; z-index: 2; flex: none; padding-top: 28px; text-align: center; color: var(--on-photo); }
.so-lockfoot { position: relative; z-index: 2; flex: none; display: flex; justify-content: space-between; padding: 0 36px 14px; }
.so-lockfoot span { width: 50px; height: 50px; border-radius: 50%; background: var(--photo-fill); color: var(--on-photo); display: grid; place-items: center; }
.so-homeind { position: relative; z-index: 2; flex: none; width: 134px; height: 5px; border-radius: 3px; background: var(--on-photo); margin: 0 auto 9px; }
.so-note { display: flex; align-items: flex-start; gap: 12px; padding: 14px; border-radius: 24px; background: var(--surface); color: var(--ink); box-shadow: var(--float); }
.so-mark { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; flex: none; }
.so-share { position: relative; height: 470px; padding: 20px; border-radius: 28px; overflow: hidden; background: var(--surface2) center bottom/cover no-repeat; box-shadow: var(--float); }
.so-week { display: flex; gap: 5px; }
.so-week i { width: 10px; height: 10px; border-radius: 50%; background: var(--photo-fill); }
.so-week i.on { background: var(--on-photo); }
.so-made { position: absolute; left: 16px; bottom: 16px; display: inline-flex; align-items: center; gap: 6px; height: 30px; padding: 0 12px 0 6px; border-radius: 999px; background: var(--on-photo); color: #0D0E10; font-size: 11px; line-height: 13px; font-weight: 600; letter-spacing: .1px; }
.so-wrist { position: relative; flex: none; width: 236px; padding: 44px 0; }
.so-strap { position: absolute; left: 40px; right: 40px; height: 72px; background: var(--quiet); }
.so-top { top: 0; border-radius: 20px 20px 0 0; }
.so-bot { bottom: 0; border-radius: 0 0 20px 20px; }
.so-case { position: relative; width: 236px; height: 284px; padding: 12px; border-radius: 64px; background: var(--surface3); box-shadow: var(--float); }
.so-crown { position: absolute; right: -6px; top: 82px; width: 9px; height: 38px; border-radius: 4px; background: var(--surface3); }
.so-side { position: absolute; right: -3px; top: 142px; width: 5px; height: 58px; border-radius: 3px; background: var(--surface3); }
.so-face { width: 100%; height: 100%; padding: 18px 18px 16px; border-radius: 52px; display: flex; flex-direction: column; }
.so-done { display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; height: 44px; margin-top: 10px; border-radius: 22px; background: var(--on-photo); color: #0D0E10; font-size: 15px; line-height: 22px; font-weight: 600; }
.so-done.so-on { background: var(--photo-fill); color: var(--on-photo); }
.so-comps { display: flex; justify-content: center; gap: 14px; }
.so-comp { display: flex; flex-direction: column; align-items: center; gap: 8px; width: 96px; text-align: center; }
.so-disc { width: 64px; height: 64px; border-radius: 50%; background-color: var(--surface); box-shadow: var(--shadow); color: var(--ink); display: grid; place-items: center; }
.so-punch { width: 14px; height: 14px; border-radius: 50%; background: #0D0E10; }
.so-tick { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; flex: none; width: 72px; height: 72px; border-radius: 24px; background: var(--ink); color: var(--canvas); font-size: 13px; line-height: 18px; font-weight: 600; }
.so-tick.so-on { background: var(--gain-tint); color: var(--gain); }
.so-dot { width: 56px; height: 56px; border-radius: 50%; background: var(--photo-fill); display: grid; place-items: center; flex: none; }
.so-search { display: flex; align-items: center; justify-content: space-between; height: 52px; margin-top: 18px; padding: 0 18px; border-radius: 26px; background: var(--photo-fill); color: var(--on-photo); }
.so-gest { position: relative; z-index: 2; flex: none; width: 108px; height: 4px; border-radius: 2px; background: var(--on-photo); margin: 14px auto 10px; }
.so-night { background: #0D0E10; color: var(--on-photo); }
`);

  /* ── Small parts shared by several screens ───────────── */
  // The orb on a photograph or on an always-dark surface (the kit's orb() is ink).
  const orbOn = (state, size, tone = 'var(--on-photo)') => `<span data-orb="${state}" data-size="${size}" style="width:${size}px;height:${size}px;display:block;flex:none;color:${tone}"></span>`;
  // A percentage as a ring of the orb's dots.
  function ring(pct, size, n, inner = '') {
    const d = Math.max(4, Math.round(size / 12)), R = size / 2 - d / 2, on = Math.round(pct / 100 * n);
    const pts = Array.from({ length: n }, (_, k) => {
      const a = k / n * Math.PI * 2 - Math.PI / 2;
      return `<i class="${k < on ? 'on' : ''}" style="left:${(size / 2 + Math.cos(a) * R - d / 2).toFixed(1)}px;top:${(size / 2 + Math.sin(a) * R - d / 2).toFixed(1)}px;width:${d}px;height:${d}px"></i>`;
    }).join('');
    return `<span class="so-ring" style="width:${size}px;height:${size}px">${pts}${inner}</span>`;
  }
  const areaDot = a => `<span style="display:inline-block;flex:none;width:6px;height:6px;border-radius:50%;background:var(--a-${a});vertical-align:1px"></span>`;
  const onPhotoBtn = (label, icon) => `<button class="btn press mt16" style="background:var(--on-photo);color:#0D0E10">${label}${icon ? ' ' + ic(icon, 's18') : ''}</button>`;
  const lockHead = () => `<div class="so-lockhead"><span class="title">Monday 16 November</span><div class="xl" style="margin-top:2px">9:41</div></div>`;
  const lockFoot = () => `<div class="so-lockfoot"><span>${ic('bulb', 's18')}</span><span>${ic('camera', 's18')}</span></div><div class="so-homeind"></div>`;
  const lifeMark = () => `<span class="so-mark so-night">${orbOn('ring', 22)}</span>`;

  /* ══ STATES ═════════════════════════════════════════════ */

  /* ── Today, on day one ───────────────────────────────── */
  function emptyToday() {
    return `${status()}${rootBar('Today', 'Mon 16 Nov', round('search', { label: 'Search' }) + round('bell', { label: 'From life' }))}
    <div class="scroll"><div class="rise">
      <div class="eyebrow-row"><span class="eyebrow">Welcome, Ama</span><span class="chip q">Day 1</span></div>
      <p class="display">Nothing here yet. <b class="nw">${ic('mic')}Talk for a minute</b> and life will <b>fill this in.</b></p>
      <div class="sec-head" style="margin-top:24px"><h4>Your first move</h4><span class="link">About a minute</span></div>
      <div class="deck" style="height:250px;margin-top:0"><span class="deck-back"></span>
        <div class="deck-card" style="${img('walk')};background-position:center 44%"><span class="chip onphoto" style="align-self:flex-start">Say it out loud</span><span class="copy"><b style="font-size:30px;line-height:34px;letter-spacing:-.9px">Tell life what’s going on</b><span>Rent, a letter, a birthday. life files it.</span></span></div>
      </div>
      <button class="btn press mt16">${ic('mic', 's18')}Talk to life</button>
      <p class="callout mt12" style="text-align:center">Nothing is saved until you say so.</p>
      <div class="card mt24"><div class="between"><span class="title">life knows you</span><span class="title">0%</span></div>${ruler(0)}<p class="callout" style="margin-top:10px">Your moves, questions and things to know will appear here.</p></div>
    </div></div>${dock('Today')}`;
  }

  /* ── Today, loading: the shape of Today, arriving ────── */
  const sk = (w, h, r, more = '', cls = '') => `<span class="so-sk ${cls}" style="width:${w};height:${h}px;border-radius:${r}px;${more}"></span>`;
  function loadingToday() {
    const tileSk = late => `<div class="tile">${sk('56%', 10, 5, 'margin:4px 0', late)}${sk('48%', 26, 9, 'margin:19px 0 5px', late)}${sk('80%', 10, 5, 'margin:6px 0 4px', late)}</div>`;
    return `${status()}<header class="bar"><div class="bar-id"><span class="orb22" data-orb="thinking"></span><b>Today</b><span>Mon 16 Nov</span></div><div class="acts">${round('search', { label: 'Search' })}${round('bell', { label: 'From life' })}</div></header>
    <div class="scroll" data-set="landed"><div>
      <div class="eyebrow-row"><span class="eyebrow">Good morning, Ama</span>${sk('118px', 25, 13, '', 'so-deep')}</div>
      <div class="so-lines">${sk('92%', 26, 10, '', 'so-deep')}${sk('70%', 26, 10, '', 'so-deep')}${sk('86%', 26, 10, '', 'so-deep')}${sk('48%', 26, 10, '', 'so-deep')}</div>
      <div class="checked mt20">${sk('32px', 32, 16)}<span class="line">${sk('58%', 10, 5, 'margin:5px 0')}${sk('84%', 10, 5, 'margin:9px 0 4px')}</span>${sk('48px', 10, 5)}</div>
      <div class="sec-head" style="margin-top:24px">${sk('36%', 13, 6, 'margin:4px 0', 'so-deep')}${sk('14%', 10, 5, '', 'so-deep')}</div>
      <div class="deck" style="height:262px;margin-top:0"><span class="deck-back"></span><span class="so-sk so-deep so-late" style="position:absolute;left:0;right:0;top:20px;bottom:0;border-radius:28px"></span></div>
      <div class="decide plain">${sk('48px', 40, 20, '', 'so-deep so-late')}${sk('76px', 48, 24, '', 'so-deep so-late')}${sk('48px', 40, 20, '', 'so-deep so-late')}</div>
      <div class="sec-head">${sk('16%', 13, 6, 'margin:4px 0', 'so-deep so-late')}${sk('40%', 10, 5, '', 'so-deep so-late')}</div>
      <div class="tiles">${tileSk('so-late')}${tileSk('so-late')}</div>
    </div></div>${dock('Today')}`;
  }
  // Tap the page and Today lands in the same shape. After that it is the real Today, with its own controls.
  function loadingOrLanded(s) {
    if (s && K.screens.today) { try { return K.screens.today.build(s === 'landed' ? 'later' : s); } catch { /* fall back to the loading shape */ } }
    return loadingToday();
  }

  /* ── Plan, on day one ────────────────────────────────── */
  function emptyPlan() {
    const area = (photo, name, pos) => `<button class="pcard press" style="${img(photo)};height:150px;background-position:${pos}"><span class="topline"></span><span class="copy"><b style="font-size:20px;line-height:26px;letter-spacing:-.4px">${name}</b></span></button>`;
    return `${status()}${rootBar('Plan', '', round('search', { label: 'Search' }) + round('add', { label: 'Add to plan' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow"><span class="star"></span>Your plan · day one</span>
      <p class="display"><b>Nothing here yet.</b> Missions appear as life finds things worth doing.</p>
      <div class="pcard mt24" style="${img('letter')};height:270px;background-position:center 58%">
        <span class="topline"><span class="chip onphoto">Suggested first mission · 5 min</span></span>
        <span class="copy"><b>Find money you’re owed</b><span>Tax rebates, refunds, unclaimed schemes</span>${onPhotoBtn('Start', 'arrow')}</span>
      </div>
      ${secHead('Your areas', 'No missions yet')}
      <div class="pgrid">${area('payslip', 'Money', 'center 85%')}${area('movein', 'Home', 'center 82%')}${area('walk', 'Body', 'center 48%')}${area('areawork', 'Work', 'center 80%')}</div>
    </div></div>${dock('Plan')}`;
  }

  /* ── Body, with no device ────────────────────────────── */
  function emptyBody() {
    const live = (photo, pos, label, value, sub) => `<button class="pcard press" style="${img(photo)};height:200px;background-position:${pos}"><span class="topline"><span class="chip onphoto">${label}</span></span><span class="copy"><b style="font-size:32px;line-height:36px;letter-spacing:-1.1px">${value}</b><span>${sub}</span></span></button>`;
    const adds = (name, needs) => `<div style="padding:10px"><small>${name}</small><b style="color:var(--quiet)">–</b><small style="font-weight:500;color:var(--quiet);margin-top:2px">${needs}</small></div>`;
    return `${status()}${pushBar('Body', round('arrowUp', { label: 'Share' }))}
    <div class="scroll"><div class="rise">
      <span class="chip q">From your phone</span>
      <p class="display"><b>Good enough to start.</b> A watch or ring adds more.</p>
      <div class="pgrid mt24">${live('walk', 'center 46%', 'Steps today', '6,240', 'Counted by your phone')}${live('bedroom', '30% 62%', 'Sleep, estimated', '~7h', 'From when your phone is untouched')}</div>
      <div class="tile mt12"><span class="th"><span>A watch or ring adds</span><em>Device</em></span>
        <div class="subtiles">${adds('Readiness', 'Needs heart-rate variability')}${adds('Sleep stages', 'Needs a watch or ring')}${adds('Load', 'Needs heart rate')}</div></div>
      <p class="callout mt16">Wellness guidance from your own readings, not a diagnosis.</p>
    </div></div>${foot(btn('Connect a device', { icon: 'watch' }))}`;
  }

  /* ── A device stopped syncing ────────────────────────── */
  function connectFail() {
    const stale = (label, unit) => `<div class="tile so-stale"><span class="th"><span><i></i>${label}</span><em>${unit}</em></span><span class="num">–</span><span class="sub">Last: yesterday</span></div>`;
    return `${status()}${pushBar('Body', round('arrowUp', { label: 'Share' }))}
    <div class="scroll"><div class="rise">
      <span class="chip q">${ic('clock', 's14')}Oura · yesterday</span>
      <p class="display"><b>Oura</b> hasn’t synced <b>since yesterday.</b></p>
      <div class="pcard mt24" style="${img('bedroom')};height:236px;background-position:center 52%">
        <span class="topline"><span class="chip onphoto">The fix that usually works</span></span>
        <span class="copy"><b style="font-size:20px;line-height:26px;letter-spacing:-.4px">Open the Oura app once to send last night’s sleep.</b>${onPhotoBtn('Open Oura', 'arrow')}</span>
      </div>
      <div class="tiles mt12">${stale('Readiness', '/100')}${stale('Sleep', '/8h 05m')}
        <button class="tile wide tint home press"><span class="th"><span style="display:flex;align-items:center;gap:8px"><span class="badge">${ic('food', 's18')}</span>Fuel</span><em>/2,300 kcal</em></span><span class="num">1,420</span><span class="meter"><i style="width:62%;background:var(--ac)"></i></span><span class="sub" style="margin-top:10px">Logged by you, so still up to date.</span></button>
      </div>
      <p class="callout mt16">Wellness guidance from your own readings, not a diagnosis.</p>
    </div></div>`;
  }

  /* ── Offline: Money, from what was saved ─────────────── */
  function offline() {
    const days = Array.from({ length: 14 }, (_, k) => k < 12 ? 'on' : 'miss');
    const saved = (photo, pos, title, sub, amount) => `<button class="row press"><span class="thumb" style="${img(photo)};background-position:${pos}"></span><span class="mid"><b>${title}</b><span>${sub}</span></span><span class="end">${amount}</span></button>`;
    return `${status()}${pushBar('Money', round('more', { label: 'More' }))}
    <div class="scroll"><div class="rise">
      <p class="statement">You’re <b>offline.</b> Showing what was saved <b>2h ago.</b></p>
      <div class="card tint money mt20">
        <div class="between"><span style="display:flex;align-items:center;gap:10px"><span class="badge">${ic('wallet', 's18')}</span><span class="callout">All accounts</span></span><span class="callout">Updated 2h ago</span></div>
        <div class="xl" style="margin-top:14px">£2,340<span style="color:var(--ink2)">.50</span></div>
      </div>
      <div class="card mt12">
        <div class="between"><span class="micro">Last 14 days</span><span class="micro">2 not synced yet</span></div>
        <div class="mt12">${dots(days, 14)}</div>
        <div class="headline mt20">Couldn’t reach your bank</div>
        <p class="body" style="margin-top:4px">Your last 2 days of transactions haven’t synced. Nothing is lost, and life will try again when you’re back online.</p>
        <button class="btn press mt16">${ic('repeat', 's18')}Try again</button>
      </div>
      ${secHead('Saved on this phone')}
      <div class="card pad16 rows">${saved('terrace', '70% center', 'Rent', 'Standing order · yesterday', '£1,150.00')}${saved('payslip', 'center 82%', 'Moved to buffer', 'Payday sweep', '£180.00')}</div>
    </div></div>`;
  }

  /* ── A permission you said no to ─────────────────────── */
  function permDenied() {
    return `${status()}${pushBar('', '', 'close')}
    <div class="scroll"><div class="rise">
      <div class="so-finder" style="${img('letter')}"><i class="so-corner so-c1"></i><i class="so-corner so-c2"></i><i class="so-corner so-c3"></i><i class="so-corner so-c4"></i>
        <span class="so-app">${ic('camera')}</span><span class="chip onphoto">Camera off</span></div>
      <p class="t30 mt24">The camera is off for life</p>
      <p class="body mt8">To snap meals and letters, turn on the camera for life in Settings. <b>Everything else works without it.</b></p>
      <div class="card pad16 mt20"><div class="row" style="min-height:0;padding:0"><span class="ic">${ic('camera', 's18')}</span><span class="mid"><b>Camera</b><span>Settings · life</span></span>${toggle(false, 'Camera, in Settings')}</div></div>
    </div></div>
    ${foot(btn('Open Settings') + `<button class="callout" style="text-align:center">Not now</button>`)}`;
  }

  /* ── Two devices disagree ────────────────────────────── */
  function syncIssue(ipad) {
    const choice = (day, where, on, set) => `<button class="so-choice press" aria-pressed="${on}" data-set="${set}"><small>${where}</small><span class="xl">${day}<small>th</small></span></button>`;
    return `${status()}
    <div class="scroll dim" style="flex:1;overflow:hidden">
      <span class="eyebrow mt8">Safe to spend this month</span>
      <div class="xl" style="margin-top:8px">£290</div>
      <p class="body mt8">Your buffer covers <b>1.3 months</b> of essentials.</p>
      <div class="card mt20"><span class="title">Next 30 days</span><div class="mt12">${caps([{ l: '16 Nov', in: 0, out: 310 }, { l: '23 Nov', in: 2410, out: 1150, now: true }, { l: '30 Nov', in: 0, out: 388 }, { l: '7 Dec', in: 0, out: 152 }, { l: '14 Dec', in: 0, out: 120 }])}</div></div>
    </div>
    <div class="sheet"><div class="handle" style="margin-bottom:18px"></div>
      <div class="between" style="align-items:flex-start"><p class="statement">Which <b class="nw">${ic('calendar')}pay day</b> is right?</p>${round('close', { cls: 'sm', label: 'Decide later' })}</div>
      <p class="body mt8">You changed it on two devices while offline: the 28th here, the 25th on your iPad.</p>
      <div class="so-pair mt16">${choice(28, 'This phone', !ipad, '')}${choice(25, 'Your iPad', ipad, '25')}</div>
      <button class="btn press mt16">Keep the ${ipad ? '25th' : '28th'}</button>
      <p class="callout mt12" style="text-align:center">life never drops a change without asking.</p>
    </div>`;
  }

  /* ── life’s AI is having a moment ────────────────────── */
  function aiDown(queued) {
    const msg = 'Can I claim my software on the P87?';
    const still = (photo, pos, name) => `<button class="ptile press" style="${img(photo)};background-position:${pos}"><b>${name}</b></button>`;
    return `${status()}${pushBar('Chat', round('clock', { label: 'Conversations' }), 'close')}
    <div class="scroll" style="display:flex;flex-direction:column"><div class="rise" style="display:flex;flex-direction:column;flex:1">
      ${orb('ring', 48)}
      <p class="display" style="margin-top:16px">Chat is <b>paused</b> for a few minutes.</p>
      <p class="body mt12">Your plan, tools and Body <b>all still work</b>. Anything you send now will be answered as soon as it’s back.</p>
      <div class="micro mt24">STILL WORKING</div>
      <div class="hscroll" style="margin-top:12px">${still('desk', '74% center', 'Today')}${still('payslip', 'center 80%', 'Missions')}${still('work', 'center', 'Tools')}${still('run', 'center 62%', 'Body')}</div>
      <div style="flex:1;min-height:20px"></div>
      ${queued ? `<div class="chatcol">${bubble(msg)}<span style="align-self:flex-end;display:flex;gap:6px"><span class="chip q">${ic('clock', 's14')}Queued · answered when chat is back</span><button class="chip press" data-set="">Undo</button></span></div>` : ''}
    </div></div>
    ${queued
      ? foot(`<div class="composer"><p class="q">Ask anything</p><span class="round sm">${ic('arrowUp', 's16')}</span></div>`)
      : foot(`<div class="composer"><p>${msg}<span class="caret"></span></p></div>${btn('Send it anyway, answer later', { set: 'queued' })}`)}`;
  }

  /* ── Update needed ───────────────────────────────────── */
  function forceUpdate() {
    const last = Array.from({ length: 12 }, () => 'on'), next = Array.from({ length: 12 }, (_, k) => k ? '' : 'now');
    return `${status()}${pushBar('', '', 'close')}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('payslip')};height:270px;background-position:center 86%">
        <span class="topline"><span class="chip onphoto">A quick update</span></span>
        <span class="copy"><b style="font-size:30px;line-height:34px;letter-spacing:-.9px">The new tax year started.</b><span>This version still uses last year’s rules.</span></span>
      </div>
      <div class="card mt12">
        <div class="between"><span class="micro">Last tax year</span><span class="micro">The rules on this phone</span></div>
        <div class="mt12">${dots(last, 12)}</div>
        <div class="between mt20"><span class="micro">This tax year</span><span class="micro">Began 6 April</span></div>
        <div class="mt12">${dots(next, 12)}</div>
      </div>
      <p class="callout mt16">The update takes a minute, and keeps your numbers right.</p>
    </div></div>
    ${foot(btn('Update life', { icon: 'arrowDown' }))}`;
  }

  /* ── Welcome back ────────────────────────────────────── */
  function signedOut() {
    return `<div class="full-photo fade" style="${img('journal')};background-position:42% center"></div>
    ${status('on-photo')}
    <header class="bar on-photo"><div class="bar-id" style="color:var(--on-photo)"><span class="orb22" data-orb="ring" style="color:var(--on-photo)"></span><b style="color:var(--on-photo);font-size:20px;letter-spacing:-.4px">life</b></div></header>
    <div style="flex:1"></div>
    <div class="on-photo" style="position:relative;z-index:2;padding:0 20px 30px">
      <p class="display" style="font-size:46px;line-height:48px;letter-spacing:-2.07px;font-weight:600"><b>Welcome back.</b></p>
      <p class="statement" style="font-size:21px;line-height:28px;letter-spacing:-.35px;margin-top:12px">Sign in to bring back your <b>plan</b>, <b>missions</b> and <b>history</b>.</p>
      <button class="btn press mt24" style="height:56px;background:var(--on-photo);color:#0D0E10">Continue with Apple</button>
      <button class="callout mt16" style="display:block;width:100%;text-align:center;color:var(--on-photo);font-weight:600">Start fresh</button>
      <p class="callout mt16" style="text-align:center;color:var(--on-photo2)">Data on this phone is never mixed with someone else’s.</p>
    </div>`;
  }

  /* ── Need support now: plain, serious, nothing extra ─── */
  function support() {
    const line = (name, number, how, action, first) => `<div class="card pad16 between" style="align-items:flex-end"><div><div class="callout">${name}</div><div class="num" style="margin-top:4px">${number}</div><div class="callout" style="margin-top:2px">${how}</div></div><button class="btn press ${first ? '' : 'ghost'} sm" style="width:auto;padding:0 22px">${action}</button></div>`;
    return `${status()}${pushBar('Support')}
    <div class="scroll"><div class="rise">
      <p class="display"><b>You don’t have to sort this alone.</b></p>
      <p class="body mt12">These are free, confidential and open any time.</p>
      <div class="gap8 mt24">
        ${line('Samaritans', '116 123', 'Call · any time', 'Call', true)}
        ${line('Shout', '85258', 'Text SHOUT to 85258', 'Text')}
        ${line('NHS 111', '111', 'Choose the mental health option', 'Call')}
      </div>
      <div class="so-urgent mt12"><div><div class="callout">If you’re in danger right now</div><div class="headline" style="margin-top:2px">Call 999.</div></div><button class="btn press ghost sm" style="width:auto;padding:0 22px;background:var(--surface)">Call</button></div>
      <p class="callout mt20">life will go quiet on nudges for a few days unless you say otherwise.</p>
    </div></div>`;
  }

  /* ══ OUTSIDE THE APP ════════════════════════════════════ */

  /* ── iOS: Home Screen widgets, and the Live Activity ─── */
  function widgets(lock) {
    const wall = `<div class="full-photo fade" style="${img('calmdesk')}"></div>`;
    const steps = `<span class="so-steps"><i class="on"></i><i class="now"></i><i></i></span>`;
    if (lock) return `${wall}${status('on-photo')}${lockHead()}
      <div style="flex:1"></div>
      <button class="so-w so-above press" data-set="" style="width:346px;margin:0 12px 16px;padding:16px 18px 18px" aria-label="Live Activity. Back to the Home Screen">
        <span class="between"><span class="micro">${orb('working', 20)}HMRC rebate</span><span class="chip">est. £840 back</span></span>
        <span class="headline" style="margin-top:12px">Add £1,240 of software and kit</span>
        <span class="between" style="margin-top:10px"><span class="callout">Step 2 of 3</span>${steps}</span>
      </button>${lockFoot()}`;
    return `${wall}${status('on-photo')}
      <button class="so-island so-night press" data-set="lock" aria-label="Live Activity: HMRC rebate. Show it on the Lock Screen">
        <span class="between"><span style="display:flex;align-items:center;gap:8px;font-size:14px;font-weight:600">${orbOn('working', 22)}HMRC rebate</span><span style="font-size:14px;font-weight:600">est. £840</span></span>
        <span class="title" style="display:block;margin-top:10px">Add £1,240 of software and kit</span>
        <span class="between" style="margin-top:8px"><span class="callout" style="color:var(--on-photo2)">Step 2 of 3</span>${steps}</span>
      </button>
      <div class="so-above" style="flex:1;min-height:0;display:flex;flex-direction:column;gap:12px;padding:82px 20px 0">
        <div class="so-w so-md">
          <div class="between"><span class="micro">${orb('ring', 18)}Today’s move</span><span class="chip">est. £840 back</span></div>
          <div style="flex:1"></div>
          <div class="t30">Finish the P87</div>
          <div class="between" style="margin-top:6px"><span class="callout" style="display:inline-flex;align-items:center;gap:6px">${ic('clock', 's16')}Takes 6 min</span><span class="round sm solid">${ic('arrow', 's16')}</span></div>
        </div>
        <div style="display:flex;gap:12px">
          <div class="so-w so-sm tint health"><span class="micro">${areaDot('health')}Readiness</span><div style="flex:1;display:grid;place-items:center">${ring(72, 96, 20, '<b class="num">72</b>')}</div></div>
          <div class="so-w so-sm tint work">
            <span class="micro">${areaDot('work')}Sleep</span><span class="headline" style="margin-top:2px">7h 10m</span>
            <span style="flex:1"></span>
            <span class="micro">${areaDot('home')}Fuel<span style="margin-left:auto;color:var(--quiet)">/2,300 kcal</span></span><span class="headline" style="margin-top:2px">1,420</span>
            <span class="meter" style="margin-top:6px"><i style="width:62%"></i></span>
          </div>
        </div>
        <div class="so-apps" style="margin-top:10px"><span class="so-icon so-night">${orbOn('ring', 30)}</span><span class="so-icon"></span><span class="so-icon"></span><span class="so-icon"></span></div>
      </div>
      <div class="so-pages"><i class="on"></i><i></i></div>
      <div class="so-homebar"><span class="so-icon"></span><span class="so-icon"></span><span class="so-icon"></span><span class="so-icon"></span></div>`;
  }

  /* ── Weekly recap, shared ────────────────────────────── */
  function shareCard(hidden) {
    const nights = '1101110'.split('').map(b => `<i class="${b === '1' ? 'on' : ''}"></i>`).join('');
    return `${status()}${sheetBar('Share your week')}
    <div class="scroll"><div class="rise">
      <div class="so-share on-photo" style="${img('sky')}">
        <div class="between"><span class="chip onphoto">Week 46</span>${hidden ? '' : `<span class="so-week">${nights}</span>`}</div>
        <p class="display" style="font-size:30px;line-height:35px;letter-spacing:-.9px;margin-top:14px">${hidden
          ? 'I cleared <b>missions</b>, slept <b>well</b> most nights and kept <b>my habits</b>.'
          : 'I cleared <b>3 missions</b>, slept <b>7h+</b> 5 nights and kept <b>3 habits</b>.'}</p>
        <span class="so-made">${orbOn('ring', 18, '#0D0E10')}Made with life</span>
      </div>
      <p class="callout mt12" style="text-align:center">Nothing personal on the card. No £ amounts unless you choose.</p>
    </div></div>
    <div class="foot" style="flex-direction:row"><button class="btn ghost press" data-set="${hidden ? '' : 'hidden'}" style="width:auto;padding:0 18px">${hidden ? 'Show numbers' : 'Hide numbers'}</button><button class="btn press">${ic('arrowUp', 's18')}Share</button></div>`;
  }

  /* ── Watch companion ─────────────────────────────────── */
  function watch(done) {
    const comp = (inner, label, cls = '') => `<div class="so-comp"><span class="so-disc ${cls}">${inner}</span><span class="callout">${label}</span></div>`;
    return `${status()}
    <div class="scroll" style="display:flex;flex-direction:column;align-items:center;justify-content:center">
      <span class="eyebrow">Apple Watch · Wear OS</span>
      <div class="so-wrist mt16"><i class="so-strap so-top"></i><i class="so-strap so-bot"></i>
        <div class="so-case"><i class="so-crown"></i><i class="so-side"></i>
          <div class="so-face so-night">
            <div class="between"><span style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600">${orbOn(done ? 'done' : 'ring', 20)}life</span><span style="font-size:13px;font-weight:600;font-variant-numeric:tabular-nums">9:41</span></div>
            <div class="micro" style="color:var(--on-photo2);margin-top:14px">${done ? '' : '<span class="sig"></span>'}Today’s move</div>
            <div class="headline" style="margin-top:4px">Finish the P87</div>
            <div style="flex:1"></div>
            <div style="display:flex;align-items:center;gap:10px">${ring(72, 40, 12, '<b style="font-size:13px;font-weight:600">72</b>')}<span style="font-size:13px;line-height:18px;font-weight:600">Readiness</span></div>
            <button class="so-done press ${done ? 'so-on' : ''}" data-set="${done ? '' : 'done'}">${ic('check', 's18')}${done ? 'Marked as done' : 'Done'}</button>
          </div>
        </div>
      </div>
      <div class="so-comps mt20">
        ${comp(ring(74, 48, 12, '<b style="font-size:13px;font-weight:600">72</b>'), 'Readiness 72', 'tint health')}
        ${comp(`<span class="so-steps"><i class="on"></i><i class="on"></i><i class="${done ? 'on' : ''}"></i></span>`, done ? '3 of 3 done' : '2 of 3 done')}
        ${comp(orb('ring', 30), 'Breathe')}
      </div>
      <p class="callout mt20" style="text-align:center">Never more than one nudge an hour on the wrist.</p>
    </div>`;
  }

  /* ── Notifications, on the Lock Screen ───────────────── */
  function lockPush() {
    const note = (title, when, text, photo, pos, extra = '') => `<div class="so-note">${lifeMark()}<div style="flex:1;min-width:0">
      <div class="between" style="align-items:baseline"><b class="title">${title}</b><span class="callout">${when}</span></div>
      <div style="display:flex;align-items:flex-start;gap:10px;margin-top:2px"><p class="body" style="flex:1;font-size:14px;line-height:20px">${text}</p><span class="thumb" style="${img(photo)};background-position:${pos};width:40px;height:40px"></span></div>${extra}</div></div>`;
    return `<div class="full-photo fade" style="${img('calm')};background-size:auto 170%;background-position:73% 100%"></div>
    ${status('on-photo')}${lockHead()}
    <div style="flex:1"></div>
    <div class="so-above" style="display:flex;flex-direction:column;gap:8px;padding:0 12px 16px">
      ${note('You’re likely owed £840', 'now', 'A tax rebate is waiting. One form, about 6 minutes.', 'payslip', 'center 82%', `<button class="btn press ghost sm mt12">Start the claim</button>`)}
      <span class="micro" style="color:var(--on-photo);padding:8px 8px 0">Earlier</span>
      ${note('20 free minutes', 'Yesterday', 'A short walk fits before 14:00.', 'walk', 'center 36%')}
      ${note('Council tax due 1 December', 'Sat', '£148 · paid by Direct Debit, nothing to do.', 'letter', 'center 62%')}
    </div>${lockFoot()}`;
  }

  /* ── Android: Material You widgets ───────────────────── */
  function android(s) {
    const done = s.includes('d'), shown = s.includes('s'), flip = f => s.includes(f) ? s.replace(f, '') : s + f;
    return `<div class="full-photo" style="${img('sky')};background-size:auto 230%;background-position:35% 0"></div>
    <div class="status on-photo"><span>9:41</span><i class="so-punch"></i><span class="sys"><em></em><i></i></span></div>
    <div class="so-above on-photo" style="flex:1;min-height:0;display:flex;flex-direction:column;padding:20px 20px 0">
      <span class="t30">Mon 16 Nov</span>
      <div class="so-w mt24" style="border-radius:28px;padding:18px 18px 18px 20px;flex-direction:row;align-items:center;gap:14px">
        <div style="flex:1;min-width:0"><span class="micro">${orb('ring', 18)}life · today’s move</span><span class="headline" style="display:block;margin-top:8px${done ? ';color:var(--ink2)' : ''}">Finish the P87</span></div>
        <button class="so-tick press ${done ? 'so-on' : ''}" data-set="${flip('d')}" aria-label="${done ? 'Done. Undo' : 'Mark as done'}">${ic('check')}<span>Done</span></button>
      </div>
      <div style="display:flex;gap:12px;margin-top:12px">
        <div class="so-w so-sm tint health" style="border-radius:50%;align-items:center;justify-content:center;padding:0">${ring(72, 128, 24, '<span style="text-align:center"><b class="num" style="display:block">72</b><span class="micro" style="justify-content:center">Readiness</span></span>')}</div>
        <button class="so-w so-sm tint money press" data-set="${flip('s')}" style="border-radius:28px" aria-label="${shown ? 'Hide the amount' : 'Show the amount'}">
          <span class="micro">${areaDot('money')}Left to spend</span>
          <span style="flex:1"></span>
          <span class="num">${shown ? '£290' : '£•••'}</span>
          <span class="callout" style="display:flex;align-items:center;gap:6px;margin-top:6px">${ic(shown ? 'eye' : 'eyeOff', 's16')}${shown ? 'Tap to hide' : 'Hidden. Tap to show'}</span>
        </button>
      </div>
      <div style="flex:1"></div>
      <div class="so-apps"><span class="so-dot so-night">${orbOn('ring', 28)}</span><span class="so-dot"></span><span class="so-dot"></span><span class="so-dot"></span></div>
      <div class="so-search">${ic('search', 's18')}${ic('mic', 's18')}</div>
    </div>
    <div class="so-gest"></div>`;
  }

  /* ── Siri and Shortcuts ──────────────────────────────── */
  function siri() {
    const say = t => `<span class="chip" style="height:32px;padding:0 12px;font-size:13px;background:var(--photo-fill);color:var(--on-photo)">${t}</span>`;
    return `<div class="full-photo fade" style="${img('vantage')}"></div>
    ${status('on-photo')}
    <div class="so-above on-photo" style="flex:1;min-height:0;display:flex;flex-direction:column;padding:28px 20px 0">
      <span class="eyebrow" style="color:var(--on-photo2)">${ic('mic', 's16')}Hey Siri</span>
      <p class="display">“Tell life the <b class="nw">${ic('calendar')}dentist</b> is on <b>Friday at 3</b>”</p>
      <div style="flex:1"></div>
      <div class="so-w" style="border-radius:24px;flex-direction:row;align-items:flex-start;gap:12px">
        ${orb('done', 28)}
        <div style="flex:1;min-width:0"><div class="between"><span class="micro">life</span><span class="chip done">${ic('check', 's14')}Filed</span></div>
          <div class="title" style="margin-top:6px">Filed: Dentist · Friday 15:00</div>
          <div class="callout" style="margin-top:4px">${areaDot('health')} Added to Health · reminder Thursday evening</div></div>
      </div>
      <div class="micro" style="color:var(--on-photo2);margin-top:22px">ALSO WORKS</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:10px">${say('“What’s my move today?”')}${say('Log water')}${say('Start a check-in')}${say('Read my brief')}</div>
    </div>
    <div class="so-homeind" style="margin-top:22px"></div>`;
  }

  /* ── Registry ─────────────────────────────────────────── */
  K.screen('emptytoday', { from: '3, 18, 14', note: 'Day one of Today: the briefing invites a minute of talk, the first move is a photograph in front, and the meter starts at zero.', build: emptyToday });
  K.screen('offline', { from: '16, 5, 12', note: 'Money from what was saved: the figure stays, 14 days as dots with the 2 unsynced left open, and one retry.', build: offline });
  K.screen('loadingtoday', { from: '3, 18, 12', note: 'Today arriving: soft blocks hold its shape while the orb in the bar thinks. Tap the page to watch it land.', build: loadingOrLanded });
  K.screen('emptyplan', { from: '17, 15, 14', note: 'Day one of Plan: one suggested mission as a photograph, then your four areas waiting as pictures.', build: emptyPlan });
  K.screen('emptybody', { from: '14, 12', note: 'Body from the phone alone: steps and a sleep estimate as two photographs, then what a watch or ring would add.', build: emptyBody });
  K.screen('permdenied', { from: '6, 14', note: 'The viewfinder, switched off, with the one switch to flip in Settings. Everything else still works.', build: permDenied });
  K.screen('syncissue', { from: '21, 6', note: 'A sheet that asks one thing: two dates side by side, and you pick. Tap the 25th.', build: s => syncIssue(s === '25') });
  K.screen('aidown', { from: '9, 15', note: 'Chat says it is paused, shows what still works as pictures, and queues your message. Tap the button.', build: s => aiDown(s === 'queued') });
  K.screen('forceupdate', { from: '5, 14', note: 'Why the update matters, counted in months: last tax year full, the new one just begun.', build: forceUpdate });
  K.screen('signedout', { from: '10', note: 'The front door again: one photograph, Welcome back, one button, or start fresh.', build: signedOut });
  K.screen('connectfail', { from: '12, 14', note: 'Body when Oura goes quiet: the one fix in front, the affected readings resting with their last sync, Fuel still live.', build: connectFail });
  K.screen('support', { from: '12', note: 'The serious one, kept plain: three free helplines with the number as the biggest thing on each, then 999.', build: support });
  K.screen('widgets', { from: '12, 5, 19', note: 'Today’s move, readiness as a ring of the orb’s dots, and the Live Activity in the Dynamic Island. Tap the island for the Lock Screen.', build: s => widgets(s === 'lock') });
  K.screen('sharecard', { from: '2, 3, 5', note: 'The week as one sentence over friends and sky, nights slept as dots. Tap Hide numbers.', build: s => shareCard(s === 'hidden') });
  K.screen('watch', { from: '5, 12', note: 'One move, readiness as a ring of dots, and a tick on the wrist, with the three complications below. Tap Done.', build: s => watch(s === 'done') });
  K.screen('lockpush', { from: '18, 10', note: 'Three notifications on the Lock Screen: short, specific, each with its picture, the newest with its one action.', build: lockPush });
  K.screen('androidwidget', { from: '12, 5', note: 'Material shapes, life’s type: a move with a tick, readiness in a circle, money hidden until you tap.', build: s => android(s || '') });
  K.screen('siri', { from: '10, 3, 7', note: 'What you said as the big sentence, what life filed as one card, and the other things you can ask.', build: siri });
})();
