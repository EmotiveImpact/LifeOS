// life · V26 screens: You · Settings and account, You · People and dates. Written against review/v26/KIT.md.
// Settings stay calm and typographic. People and dates are the photographic part: real people are shown as photographs.
(() => {
  'use strict';
  const K = window.L26;
  const { ic, img, status, round, rootBar, pushBar, sheetBar, dock, foot, btn, secHead, chip, orb, says, row, acc, toggle, seg, field, avatar, bubble, dots, voice } = K;

  // One-off pieces the kit has no class for: the phone drawn as a solid slab (Private mode), the two small
  // phone previews (Look, sound and feel), a numbered day in the month grid (Dates) and the tint tiles on the sky (Welcome to life Plus).
  K.addCss('.sp-', `
    .sp-phone { background: var(--inverse); color: var(--on-inverse); border-radius: 36px; padding: 14px 20px 20px; }
    .sp-isl { display: block; width: 72px; height: 20px; border-radius: 10px; background: var(--inverse-fill); margin: 0 auto 18px; }
    .sp-lab { font-size: 11px; line-height: 13px; font-weight: 600; letter-spacing: .1px; color: var(--inverse2); padding-bottom: 4px; }
    .sp-job { display: flex; align-items: center; gap: 12px; padding: 9px 0; }
    .sp-jic { width: 40px; height: 40px; border-radius: 12px; background: var(--inverse-fill); display: grid; place-items: center; flex: none; }
    .sp-job b { display: block; font-size: 15px; line-height: 21px; font-weight: 600; letter-spacing: -.15px; }
    .sp-job small { display: block; font-size: 13px; line-height: 18px; color: var(--inverse2); }
    .sp-stage { display: block; width: 100%; height: 196px; padding: 16px 20px 0; border-radius: 20px; background: var(--surface3); overflow: hidden; }
    .sp-mini { display: flex; flex-direction: column; gap: 6px; height: 100%; padding: 14px 12px 0; border-radius: 20px 20px 0 0; }
    .sp-lt { background: var(--on-photo); color: #0D0E10; }
    .sp-dk { background: #0D0E10; color: var(--on-photo); }
    .sp-mini i { display: block; height: 8px; border-radius: 4px; background: currentColor; }
    .sp-mini .sp-soft { opacity: .32; }
    .sp-mini .sp-sig { width: 8px; background: var(--ember); margin-bottom: 4px; }
    .sp-mini .sp-slab { height: 18px; border-radius: 6px; }
    .sp-shot { display: block; height: 54px; border-radius: 10px; margin-top: 6px; background: var(--surface3) center/cover no-repeat; }
    .sp-day { font-style: normal; font-size: 11px; line-height: 22px; font-weight: 600; text-align: center; color: var(--canvas); font-variant-numeric: tabular-nums; }
    .sp-open { display: flex; flex-direction: column; gap: 12px; padding: 14px 16px 16px; border-radius: 20px; background: var(--photo-fill); color: var(--on-photo); font-size: 15px; line-height: 21px; font-weight: 600; letter-spacing: -.15px; }
  `);

  const chev = `<span class="chev">${ic('chev', 's16')}</span>`;
  /** An icon kept with the first word of a bright phrase, so the sentence still wraps naturally. */
  const iw = (icon, word) => `<span class="nw">${ic(icon)}${word}</span>`;
  /** A row that ends in a switch. Kit rows are buttons, so a switch row is a div. */
  const swRow = (icon, title, sub, on) => `<div class="row"${sub ? '' : ' style="min-height:56px"'}><span class="ic">${ic(icon, 's18')}</span><span class="mid"><b>${title}</b>${sub ? `<span>${sub}</span>` : ''}</span>${toggle(on, title)}</div>`;
  const lineRow = (icon, title) => `<button class="row press" style="min-height:56px"><span class="ic">${ic(icon, 's18')}</span><span class="mid"><b>${title}</b></span>${chev}</button>`;
  /** A small round photograph of someone: the same few photographs, cropped to the face. */
  const face = (photo, crop, size = 40) => `<span class="thumb" style="${img(photo)};${crop};width:${size}px;height:${size}px;border-radius:50%"></span>`;
  const FACE = {
    ama: ['desk', 'background-size:auto 130%;background-position:88% 10%'],
    kofi: ['siblings', 'background-size:440%;background-position:42% 46%'],
    mum: ['birthday', 'background-size:420%;background-position:45% 55%'],
    priya: ['people', 'background-size:250%;background-position:0% 33%'],
    sam: ['friends', 'background-size:300%;background-position:62% 94%'],
    kwame: ['calm', 'background-size:300%;background-position:71% 64%'],
    tom: ['bench', 'background-size:280%;background-position:60% 46%'],
  };

  /* ── Settings: the hub ───────────────────────────────── */
  function settings() {
    return `${status()}${pushBar('Settings')}
    <div class="scroll"><div class="rise">
      <button class="card pad16 press" style="display:flex;align-items:center;gap:14px">${face(...FACE.ama, 72)}<span style="flex:1;min-width:0"><span class="headline" style="display:block">Ama</span><span class="callout" style="display:block">Designer · London</span><span style="display:block;margin-top:8px">${chip('life Plus · Active')}</span></span>${chev}</button>
      <p class="display" style="margin-top:24px">life sends <b>${iw('bell', '1')} nudge a day</b>, has <b>${iw('swap', '4')} connections</b> on and sells <b>${iw('shield', 'nothing')}</b>.</p>
      <div class="mt24">
        ${acc('How life behaves', 4, row('bell', 'Notifications', 'At most 1 a day · 9am–7pm') + row('sun', 'Look, sound and feel', 'Light · sounds and haptics on') + row('images', 'Pictures', 'Mixed cast · follows your mood') + row('food', 'Calorie numbers', 'Shown · switch to balance-only'), true)}
        ${acc('What life can reach', 3, row('swap', 'Connected services', '4 on · bank not connected') + row('shield', 'Private mode', 'AI kept on this phone · 174 MB') + row('spark', 'Your AI', 'Read-only · last used 2h ago'))}
        ${acc('Your data and account', 4, row('folder', 'What life knows', '214 records · see and edit everything') + row('arrowDown', 'Export your data', 'A copy of everything, as a file') + row('wallet', 'life Plus', 'Yearly · renews 14 Nov 2027') + row('trash', 'Delete everything', 'This can’t be undone'))}
        ${acc('Help and about', 2, row('help', 'Help', 'Ask life how anything works') + row('info', 'About life', 'Version 1.0 (214)'))}
      </div>
    </div></div>`;
  }

  /* ── Notifications: two limits, then what can reach you ─ */
  function notifs() {
    const hours = Array.from({ length: 24 }, (_, h) => `<i class="${h < 8 || h >= 21 ? 'on' : ''}"></i>`).join('');
    return `${status()}${pushBar('Notifications')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">5 of 6 kinds are on</span>
      <p class="display">At most <b>${iw('bell', '1')} nudge a day</b>, and <b>${iw('moon', 'nothing')} at night</b>.</p>
      <div class="card mt24">
        <div class="micro">NUDGES A DAY, AT MOST</div>
        <div class="between" style="align-items:flex-end;margin-top:6px"><div class="xl">1<small>a day</small></div><div style="width:150px;margin-bottom:8px">${seg(['1', '2', '3'], 0)}</div></div>
        <p class="callout mt8">Sent between 9am and 7pm. Too many? Turn it down here.</p>
        <div class="micro mt24">QUIET HOURS</div>
        <div class="ruler" aria-hidden="true">${hours}</div>
        <div class="between mt8"><span class="callout">00:00</span><span class="callout">12:00</span><span class="callout">24:00</span></div>
        <div class="between mt16"><span style="display:flex;gap:8px"><button class="chip press">From 21:00</button><button class="chip press">Until 08:00</button></span><span class="callout">11 quiet hours</span></div>
      </div>
      <p class="callout mt12">life learns your timing. You always have the final say.</p>
      ${secHead('What can reach you')}
      <div class="micro">TO DO</div>
      <div class="card pad16 rows mt8">${swRow('arrow', 'Today’s move', 'The one nudge a day', true)}${swRow('clock', 'Deadlines under 24 hours', 'Always calm, never at night', true)}</div>
      <div class="micro mt20">BODY AND HABITS</div>
      <div class="card pad16 rows mt8">${swRow('moon', 'Bedtime reminder', '45 minutes before your target', true)}${swRow('repeat', 'Habit rescue', 'After one missed day', true)}</div>
      <div class="micro mt20">LOOKING BACK, LOOKING IN</div>
      <div class="card pad16 rows mt8">${swRow('chart', 'Weekly recap', 'Sunday evening', true)}${swRow('bulb', 'Learn: recall', 'A 20-second question', false)}</div>
    </div></div>`;
  }

  /* ── Private mode: what stays inside the phone, drawn as the phone ─ */
  function ondevice() {
    const job = (icon, t, s) => `<div class="sp-job"><span class="sp-jic">${ic(icon, 's18')}</span><span><b>${t}</b><small>${s}</small></span></div>`;
    return `${status()}${pushBar('Private mode', round('info', { label: 'How Private mode works' }))}
    <div class="scroll"><div class="rise">
      <p class="display" style="margin-top:4px"><b>Three jobs</b> stay on this phone. <b>Two</b> still ask before using the cloud.</p>
      <div class="card pad16 between mt24"><span><span class="title" style="display:block">Keep AI on this phone</span><span class="callout">174 MB on this phone · built-in AI found</span></span>${toggle(true, 'Keep AI on this phone')}</div>
      <div class="sp-phone mt12"><span class="sp-isl"></span><div class="sp-lab">ON YOUR PHONE · NOTHING LEAVES</div>
        ${job('mic', 'Turning your voice into text', 'Talk, journal, tell-back')}${job('folder', 'Filing what you say', 'Bills, dates, people')}${job('doc', 'Short drafts and replies', 'Slower than the cloud')}</div>
      <div class="micro mt24">STILL ASKS BEFORE USING THE CLOUD</div>
      <div class="card pad16 rows mt8">${row('book', 'Building a new lesson', 'Needs a bigger model', chip('Asks', 'q'))}${row('camera', 'Reading a photo of a meal', 'Needs vision', chip('Asks', 'q'))}</div>
      <div class="mt20">${says('Your numbers always come from life’s own engine, never from a guess by the AI.')}</div>
    </div></div>${foot(btn('What gets downloaded', { icon: 'arrow', trail: true }))}`;
  }

  /* ── Your AI: a drawing of who asks whom, then what it may see ─ */
  function yourai() {
    const scope = (icon, t, on) => `<div class="row" style="min-height:56px"><span class="ic">${ic(icon, 's18')}</span><span class="mid"><b>${t}</b></span>${toggle(on, t)}</div>`;
    const node = inner => `<span class="chip" style="height:40px;padding:0 16px 0 10px;font-size:14px;gap:8px">${inner}</span>`;
    return `${status()}${pushBar('Your AI', round('info', { label: 'How the connection works' }))}
    <div class="scroll"><div class="rise">
      <div style="display:flex;gap:6px;margin-top:4px">${chip('Read-only')}${chip('Last used 2h ago', 'q')}</div>
      <p class="t30 mt16">Ask your usual assistant. It answers from life.</p>
      <div class="flow mt20"><div class="said-box">“How did I sleep this month?”</div><span class="down">${ic('arrowDown', 's16')}</span>
        ${node(ic('spark', 's18') + 'Your usual assistant')}<span class="down">${ic('arrowDown', 's16')}</span>
        ${node(orb('ring', 22) + 'life answers, read-only')}</div>
      <p class="body mt16">A private connection (MCP). <b>You pick exactly what it can see</b>, and can switch it off any time.</p>
      ${secHead('What it can see', '3 of 5 on')}
      <div class="card pad16 rows">${scope('moon', 'Sleep, readiness and workouts', true)}${scope('repeat', 'Habits and streaks', true)}${scope('chart', 'Spending by category', false)}${scope('calendar', 'Missions and deadlines', true)}${scope('book', 'Journal entries', false)}</div>
      <div class="card pad16 mt12"><div class="micro">CONNECTION ADDRESS</div><div class="between mt8"><span class="title" style="font-variant-numeric:tabular-nums">mcp.life.app/u/••••••</span><button class="chip press">${ic('copy', 's14')}Copy</button></div></div>
    </div></div>${foot(btn('Switch off and revoke', { ghost: true }))}`;
  }

  /* ── Look, sound and feel: pick between two small phones ─ */
  function appearance(dark) {
    const mini = (cls, photo) => `<span class="sp-mini ${cls}"><i class="sp-sig"></i><i style="width:92%"></i><i class="sp-soft"></i><i style="width:58%"></i><span class="sp-shot" style="${img(photo)}"></span><i class="sp-slab"></i></span>`;
    const option = (label, cls, photo, on, set) => `<button class="press" data-set="${set}" style="display:block" aria-pressed="${on}"><span class="sp-stage">${mini(cls, photo)}</span><span class="between" style="margin-top:10px;padding:0 4px"><span class="title${on ? '' : ' q'}">${label}</span><span class="tick ${on ? 'on' : ''}">${on ? ic('check', 's14') : ''}</span></span></button>`;
    return `${status()}${pushBar('Look, sound and feel')}
    <div class="scroll"><div class="rise">
      <p class="display" style="margin-top:4px"><b>${iw(dark ? 'moon' : 'sun', dark ? 'Dark' : 'Light')}</b>, with <b>sounds</b> and <b>haptics</b> on. Pictures <b>follow your mood</b>.</p>
      <div class="mt24" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">${option('Light', 'sp-lt', 'calmdesk', !dark, '')}${option('Dark', 'sp-dk', 'vantage', dark, 'dark')}</div>
      <div class="card pad16 mt16"><div class="row" style="min-height:44px;padding:0"><span class="mid"><b>Match my phone</b><span>Follows your phone’s light and dark setting</span></span>${toggle(false, 'Match my phone')}</div></div>
      <div class="tiles mt12">
        <div class="tile" style="min-height:0"><span class="between">${ic('bell')}${toggle(true, 'Sounds')}</span><span class="title" style="margin-top:14px">Sounds</span><span class="sub">On</span></div>
        <div class="tile" style="min-height:0"><span class="between">${ic('pulse')}${toggle(true, 'Haptics')}</span><span class="title" style="margin-top:14px">Haptics</span><span class="sub">On</span></div>
      </div>
      ${secHead('Pictures')}
      <div class="card pad16 rows">
        <div class="row"><span class="thumb" style="${img('walk')}"></span><span class="mid"><b>Pictures follow your mood</b><span>A mixed cast, in daylight</span></span>${toggle(true, 'Pictures follow your mood')}</div>
        <div class="row"><span class="thumb" style="${img('keyshome')}"></span><span class="mid"><b>Glimpses of your Aim</b><span>Unlocked as you get closer</span></span>${toggle(true, 'Glimpses of your Aim')}</div>
        ${swRow('bulb', 'Hand-drawn diagrams in lessons', 'In Teach me', true)}
      </div>
      <div class="card pad16 mt12">${swRow('eyeOff', 'Hide balances', 'Covers money figures on screen', false)}</div>
      <p class="callout mt16">Reduce Motion follows your phone’s setting.</p>
    </div></div>`;
  }

  /* ── Connected services: each connection as a calm tile ─ */
  function services() {
    const conn = (name, dot, shares, when) => `<button class="tile press"><span class="th"><span><i style="background:var(--a-${dot})"></i>${name}</span><em>On</em></span><span class="headline" style="margin-top:14px">${shares}</span><span class="sub" style="margin-top:auto;padding-top:10px">${when}</span></button>`;
    return `${status()}${pushBar('Connected', round('add', { label: 'Add a connection' }))}
    <div class="scroll"><div class="rise">
      <p class="display" style="margin-top:4px"><b>4 connections</b> are on. Your <b>${iw('wallet', 'bank')}</b> isn’t one of them.</p>
      <div class="tiles mt24">
        ${conn('Apple Health', 'health', 'Sleep, heart, workouts', 'Synced 2 min ago')}
        ${conn('Oura', 'you', 'Sleep, HRV', 'Synced 07:02')}
        ${conn('Calendar', 'work', 'Busy times only', 'Synced just now')}
        ${conn('Your AI (MCP)', 'home', 'Read-only', 'Last used 2h ago')}
        <div class="tile wide" style="min-height:0"><span class="th"><span><i style="background:var(--a-money)"></i>Bank</span><em>Not connected</em></span><span class="between" style="margin-top:12px"><span class="body">Open Banking, read-only.</span><button class="btn ghost sm press" style="width:auto;padding:0 18px">Add</button></span></div>
      </div>
      <p class="callout mt16">Disconnecting takes one tap. You choose whether to delete what came from it too.</p>
    </div></div>`;
  }

  /* ── Your data: the promise first, then your copy ────── */
  function privacy() {
    return `${status()}${pushBar('Your data')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">${ic('shield', 's14')}The promise</span>
      <p class="display">We never <b>sell your data</b>, <b>use it for ads</b>, or <b>train AI on it</b> without asking.</p>
      <div class="card mt24"><div class="between" style="align-items:flex-start"><div><div class="micro">WHAT LIFE KNOWS</div><div class="xl" style="margin-top:6px">214<small>records</small></div></div>${chip('All editable')}</div>
        <p class="body mt8">Your copy, your facts. <b>See it, take it, delete it.</b></p>
        <div class="mt16" style="display:flex;gap:8px"><button class="btn ghost press" style="width:auto;padding:0 18px">See it all</button>${btn('Download everything', { icon: 'arrowDown' })}</div>
        <p class="callout mt12">One file with all your data, as JSON and CSV.</p></div>
      ${secHead('How it is looked after')}
      <div class="card pad16 rows">${row('shield', 'Backed up', 'Encrypted, in the UK and EU')}${row('people', 'Who helps run life', 'Hosting, AI, email · 4 companies')}</div>
      <button class="row press mt32"><span class="ic">${ic('trash', 's18')}</span><span class="mid"><b>Delete my account</b><span>30 days to change your mind</span></span>${chev}</button>
    </div></div>`;
  }

  /* ── Delete your account: plain words, one armed action ─ */
  function deleteacct(typed) {
    return `${status()}${pushBar('')}
    <div class="scroll"><div class="rise">
      <p class="t30" style="margin-top:4px">Delete your account?</p>
      <p class="body mt8">Read this once. <b>After 30 days it can’t be undone.</b></p>
      <div class="micro mt32">DELETED</div>
      <p class="statement mt8"><b>Everything you’ve told life</b>, your health data and your chats.</p>
      <div class="micro mt24">KEPT</div>
      <p class="statement mt8"><b>Nothing</b>, unless a life Plus refund is owed.</p>
      <div class="micro mt24">GRACE PERIOD</div>
      <p class="statement mt8"><b>30 days</b> to change your mind.</p>
      <div class="mt12">${dots(Array(30).fill(''), 15)}</div>
      <button class="card pad16 between press mt24"><span><span class="title" style="display:block">Download my data first</span><span class="callout">One file with everything in it</span></span><span class="round">${ic('arrowDown', 's18')}</span></button>
    </div></div>
    <div class="foot"><button class="press" data-set="${typed ? '' : 'typed'}" style="display:block;width:100%">${field('Type DELETE to confirm', typed ? 'DELETE' : '', 'DELETE')}</button>
      ${typed ? `<button class="btn press">Delete account</button>` : `<button class="btn ghost" style="color:var(--quiet)" aria-disabled="true">Delete account</button>`}
      <span class="callout" style="text-align:center">${typed ? 'Your account closes today. 30 days to change your mind.' : 'The button wakes when you type DELETE.'}</span></div>`;
  }

  /* ── Your life Plus: Ama, pleased; the price; the year in twelve dots ─ */
  function subscription() {
    return `${status()}${pushBar('life Plus')}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('gotit')};height:200px;background-position:center 37%"><span class="topline"><span class="chip onphoto">Active</span></span><span class="copy"><b>Your life Plus</b><span>Yearly plan</span></span></div>
      <div class="between" style="align-items:flex-end;margin-top:20px"><div class="xl">£48<small>a year</small></div><span class="chip" style="margin-bottom:10px">£4 a month · saves 33%</span></div>
      <div class="card mt16"><div class="between"><span class="micro">RENEWS</span><span class="title">14 Nov 2027</span></div><div class="mt16">${dots(['on', ...Array(11).fill('')], 12)}</div><p class="callout mt16">Month 1 of 12. Paid once a year.</p></div>
      <p class="statement mt24">Includes <b>${iw('grid', 'every')} tool</b> at every level, <b>${iw('repeat', 'your')} routines</b>, <b>${iw('book', 'unlimited')} Teach me</b> and <b>${iw('shield', 'Private')} mode</b>.</p>
    </div></div>
    ${foot(`${btn('Switch to monthly · £6 a month', { ghost: true })}<button class="callout" style="text-align:center">Cancel life Plus</button><span class="micro" style="justify-content:center;color:var(--quiet)">One tap, then managed by the App Store</span>`)}`;
  }

  /* ── Welcome to life Plus: a moment, under an open sky ── */
  function plussuccess() {
    const open = (icon, t) => `<span class="sp-open">${ic(icon)}${t}</span>`;
    return `<div class="full-photo" style="${img('sky')};background-size:auto 200%;background-position:40% 0"></div>
    ${status('on-photo')}
    <header class="bar on-photo"><span></span><button class="round press" style="background:var(--photo-fill);color:var(--on-photo)" aria-label="Close">${ic('close', 's18')}</button></header>
    <div class="scroll on-photo" style="position:relative;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;padding-bottom:12px">
      <div class="rise" style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        <span data-orb="done" data-size="72" style="width:72px;height:72px;display:block;color:var(--on-photo);grid-column:1 / -1"></span>
        <p class="display" style="grid-column:1 / -1;font-size:46px;line-height:48px;letter-spacing:-2.07px;font-weight:600;margin-top:10px"><b>You’re on life Plus.</b></p>
        <p class="statement" style="grid-column:1 / -1;font-size:21px;line-height:28px;letter-spacing:-.35px;margin-bottom:14px">Thank you, Ama. <b>Four things just opened.</b></p>
        ${open('grid', 'Every tool unlocked')}${open('repeat', 'Your routines')}${open('book', 'Unlimited Teach me')}${open('shield', 'Private mode')}
      </div>
    </div>
    <div class="foot" style="background:none;position:relative;z-index:2"><button class="btn press" style="background:var(--on-photo);color:#0D0E10">Back to what I was doing</button></div>`;
  }

  /* ── Help: a question box, then the three likeliest answers ─ */
  function help() {
    return `${status()}${pushBar('Help')}
    <div class="scroll"><div class="rise">
      <div style="display:grid;place-items:center;padding-top:12px">${orb('ring', 56)}</div>
      <p class="t30" style="text-align:center;margin-top:18px">Ask life how anything works</p>
      <div class="composer mt20"><p class="q"><span class="caret" style="margin-right:6px"></span>Type your question</p><button class="round sm solid press" aria-label="Ask">${ic('arrowUp', 's16')}</button></div>
      <div class="micro mt32">ASKED MOST</div>
      <div class="mt12">
        ${acc('How life picks your moves', '2 min', `<p class="body">life weighs what’s due, what you’re owed and what moves your Aim, then shows the one move that fits the time you have. <b>Tap “Why this?” on any move</b> to see its reason.</p><button class="link ink mt12" style="font-weight:600">Read the guide ${ic('chev', 's16')}</button>`, true)}
        ${acc('How scores work', '', `<p class="body">Readiness, sleep and load are worked out from your own readings and shown against <b>your own normal</b>. Wellness guidance, not a diagnosis.</p>`)}
        ${acc('Report a wrong number', '', `<p class="body">Tell us which number looks off. <b>It goes to a person</b> on the team.</p><button class="btn ghost sm press mt12">Report a number</button>`)}
      </div>
      <button class="card pad16 press mt12" style="display:flex;align-items:center;gap:12px"><span class="row" style="min-height:0;padding:0;width:auto"><span class="ic">${ic('people', 's18')}</span></span><span style="flex:1"><span class="title" style="display:block">Email us</span><span class="callout">A person replies within a day</span></span>${chev}</button>
    </div></div>`;
  }

  /* ── About life: the mark, the two promises, three tidy rows ─ */
  function legal() {
    return `${status()}${pushBar('About')}
    <div class="scroll"><div class="rise">
      <div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding-top:16px">
        <span style="width:72px;height:72px;border-radius:22px;background:var(--surface);box-shadow:var(--shadow);display:grid;place-items:center;color:var(--ink)">${orb('ring', 34)}</span>
        <span class="t30 mt16">life</span>
        <span class="callout" style="font-variant-numeric:tabular-nums;margin-top:2px">Version 1.0 (214)</span>
      </div>
      <p class="display" style="text-align:center;margin-top:32px"><b>${iw('heart', 'Wellness')}</b>, not medical. <b>${iw('cash', 'Guidance')}</b>, not advice.</p>
      <p class="body" style="text-align:center;margin-top:12px">life helps you notice and decide. It doesn’t diagnose, and it isn’t a financial adviser.</p>
      <div class="card pad16 rows mt32">${lineRow('doc', 'Terms')}${lineRow('shield', 'Privacy policy')}${row('layers', 'Open-source notices', '38 libraries · MIT and Apache')}</div>
    </div></div>`;
  }

  /* ── What stays on your phone: one size, then the four parts ─ */
  function aimodels() {
    const part = (text, uses) => `<p class="body">${text}</p><div class="mt12" style="display:flex;flex-wrap:wrap;gap:6px;align-items:center"><span class="callout" style="margin-right:2px">Used for</span>${uses.map(u => chip(u)).join('')}</div>`;
    return `${status()}${pushBar('On this phone')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow" style="margin-top:4px">On this iPhone</span>
      <div class="between" style="align-items:flex-end;margin-top:8px"><div class="xl">174<small>MB</small></div><span class="chip" style="margin-bottom:10px">Built-in AI found</span></div>
      <p class="statement mt12">This iPhone brings <b>its own AI</b>, so life downloads only <b>what’s missing</b>.</p>
      <div class="card mt20">
        <div class="between"><span class="callout ink">This iPhone</span><span class="callout ink">174 MB</span></div><div class="meter" style="margin-top:8px"><i style="width:12%"></i></div>
        <div class="between mt16"><span class="callout">A phone with no built-in AI</span><span class="callout">about 1 to 2 GB</span></div><div class="meter" style="margin-top:8px"><i style="width:100%;background:var(--quiet)"></i></div>
      </div>
      <div class="mt12">
        ${acc('Your voice in', '0–150 MB', part('Built into iOS 26, and Android where available. Otherwise Whisper (whisper.rn).', ['Talk', 'Journal', 'Tell it back']), true)}
        ${acc('life’s voice out', '~24 MB +', part('Phonon on iPhone, speaking as Maeve. Kitten TTS Nano elsewhere.', ['Brief', 'Lessons', 'Replies']))}
        ${acc('Thinking and filing', '0–1.1 GB', part('Apple’s on-device model on Apple Intelligence phones with iOS 26, or Gemini Nano on supported Android. Otherwise a small open model, such as Qwen3 1.7B (4-bit), through llama.rn.', ['Filing', 'Short drafts', 'Tips']))}
        ${acc('Memory search', '~30–90 MB', part('A small embedding model.', ['Finding what life remembers']))}
      </div>
      <p class="callout mt16">Downloads over Wi-Fi, can be removed any time, and are checked against life’s tests before each update. Reading a photo and building a new lesson still ask before using the cloud.</p>
    </div></div>`;
  }

  /* ── Your people: photographs, with whoever is next in front ─ */
  function people() {
    const small = 'font-size:16px;line-height:21px;letter-spacing:-.22px';
    const card = (photo, crop, tag, name, sub) => `<button class="pcard press" style="${img(photo)};height:176px;${crop}"><span class="topline"><span class="chip onphoto">${tag}</span></span><span class="copy"><b style="${small}">${name}</b><span>${sub}</span></span></button>`;
    return `${status()}${pushBar('', round('calendar', { label: 'Dates' }) + round('add', { label: 'Add someone' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Your people · 3 dates coming up</span>
      <p class="display"><b>12 people</b> you want to show up for.</p>
      <div class="deck" style="height:372px">
        <span class="deck-back b2" style="${img('people')}"></span><span class="deck-back" style="${img('birthday')};background-position:center 55%"></span>
        <button class="deck-card press" style="${img('siblings')};background-position:center 42%">
          <span class="chip onphoto" style="align-self:flex-start"><i style="width:6px;height:6px;border-radius:50%;background:var(--ember)"></i>Next · Saturday 18 Nov</span>
          <span class="between" style="align-items:flex-end"><span class="copy"><b style="font-size:34px;line-height:39px;letter-spacing:-1.1px">Kofi turns 31</b><span>Your brother · card by Wednesday</span></span><span class="round" style="background:var(--on-photo);color:#0D0E10">${ic('arrow', 's18')}</span></span>
        </button>
      </div>
      ${secHead('After Kofi', 'See all 12')}
      <div class="pgrid">
        ${card('birthday', 'background-size:150%;background-position:35% 67%', '29 Nov', 'Mum', 'Birthday · reminder a week before')}
        ${card('people', 'background-position:center 40%', '2 Dec', 'Priya', 'Birthday')}
        ${card('friends', 'background-size:200%;background-position:69% 100%', '9 Jan', 'Sam', 'Anniversary · 5 years')}
        ${card('sunday', 'background-position:center 90%', 'In touch', 'Grandma Efua', 'Called 2 weeks ago')}
      </div>
      <button class="card pad16 press mt12" style="display:flex;align-items:center;gap:12px">${face(...FACE.tom, 48)}<span style="flex:1"><span class="title" style="display:block">Tom</span><span class="callout">Haven’t spoken in 6 weeks</span></span>${chip('Say hello')}</button>
      <p class="callout mt12">Gentle “it’s been a while” nudges are opt-in, person by person.</p>
    </div></div>`;
  }

  /* ── A person: the photograph and the date lead, the birthday is a small case ─ */
  function person() {
    return `<div class="full-photo fade" style="${img('siblings')};bottom:auto;height:470px;background-position:center bottom"></div>
    ${status('on-photo')}
    <header class="bar on-photo"><button class="round press" style="background:var(--on-photo);color:#0D0E10" aria-label="Back">${ic('back', 's18')}</button><button class="chip onphoto press" style="height:40px;padding:0 16px;font-size:14px">Edit</button></header>
    <div class="on-photo" style="height:262px;flex:none;position:relative;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;padding:0 20px 18px">
      <span class="callout" style="color:var(--on-photo)">Kofi · your brother · 18 Nov</span>
      <p class="display" style="font-size:44px;line-height:48px;letter-spacing:-1.32px;margin-top:6px"><b>Saturday,</b> turning <b>31.</b></p>
    </div>
    <div class="scroll" style="position:relative;z-index:2;background:var(--canvas);border-radius:28px 28px 0 0;padding-top:24px"><div class="rise">
      <div class="tl">
        <div class="tl-item done"><div class="when">AUGUST · IN A CHAT</div><p>You mentioned Ghana match tickets.</p><div class="mt8">${chip(ic('gift', 's14') + 'Gift idea')}</div></div>
        <div class="tl-item done"><div class="when">SEPTEMBER · IN TALK</div><p>“His old one’s falling apart.”</p>${voice('Talk')}
          <button class="card pad16 press mt12" style="display:flex;align-items:center;gap:12px"><span class="thumb" style="${img('run')}"></span><span style="flex:1"><span class="title" style="display:block">Running vest</span><span class="callout">Gift idea, from what you said</span></span>${chev}</button></div>
        <div class="tl-item now"><div class="when">BY WEDNESDAY</div><p>Order a card, so it lands for Saturday.</p>
          <div class="card pad16 mt12"><span class="chip live">Birthday plan · step 1 of 3</span><p class="body mt8">Second-class post takes until Friday.</p><button class="btn press mt16">Order a card ${ic('arrow', 's18')}</button></div></div>
        <div class="tl-item later"><div class="when">BEFORE SATURDAY</div><p>Get the gift, from your two ideas.</p></div>
        <div class="tl-item later"><div class="when">SATURDAY MORNING</div><p>Message on the day. life drafts it, you send it.</p>
          <div class="chatcol mt12">${bubble('Happy birthday, Kofi! Hope 31 starts well. Call you tonight.')}</div><span class="callout" style="display:block;margin-top:8px;text-align:right">A first draft. Yours to change.</span></div>
      </div>
      <div class="card pad16 rows mt24">${row('mic', 'Last spoke', 'Sunday · phone call', '<span></span>')}${swRow('repeat', 'Remind me to call', 'Every 2 weeks', true)}</div>
    </div></div>`;
  }

  /* ── Add people: a sheet, from contacts or typed in ──── */
  function addperson(typed) {
    const tab = `<div class="seg" role="group"><button aria-pressed="${!typed}" data-set="">From contacts</button><button aria-pressed="${typed}" data-set="type">Type it in</button></div>`;
    const contact = (init, name, sub, on) => `<button class="row press">${avatar(init)}<span class="mid"><b>${name}</b><span>${sub}</span></span><span class="tick ${on ? 'on' : ''}">${on ? ic('check', 's14') : ''}</span></button>`;
    const body = typed
      ? `<div class="gap12 mt16">${field('Name', '', 'Their name')}${field('Who they are to you', '', 'Brother, friend, neighbour')}${field('A date to keep', '', 'Birthday, anniversary, or one to mark quietly')}</div>
        <div class="card pad16 mt12">${swRow('bell', 'Nudge me to stay in touch', 'Off unless you switch it on', false)}</div>`
      : `<p class="callout mt16">life reads only the people you tick, and only their name and dates.</p>
        <div class="card pad16 rows mt12">${contact('KM', 'Kofi Mensah', 'Birthday 18 Nov', true)}${contact('PS', 'Priya Shah', 'Birthday 2 Dec', true)}${contact('EM', 'Efua Mensah', 'No birthday saved', true)}${contact('DO', 'Daniel Okafor', 'Birthday 30 Apr', false)}${contact('HL', 'Hannah Lee', 'No birthday saved', false)}</div>
        <div class="mt12">${field('Efua’s birthday', '', 'Add it now, or tell life later')}</div>`;
    return `${status()}${sheetBar('Add people')}
    <div class="scroll"><div class="rise">
      <p class="statement" style="margin-top:8px">Who do you want to <b>show up for?</b></p>
      <div class="mt16">${tab}</div>
      ${body}
    </div></div>
    ${foot(typed
      ? btn('Add this person') + `<span class="callout" style="text-align:center">Gift ideas and notes can come later. Just tell life.</span>`
      : btn('Add 3 people') + `<span class="callout" style="text-align:center">Birthdays already in your contacts come straight across.</span>`)}`;
  }

  /* ── A birthday, on Today: the photograph is the move in front ─ */
  function birthdaynudge() {
    const side = 'width:auto;padding:0 16px;font-size:14px;font-weight:600';
    return `${status()}${rootBar('Today', 'Mon 16 Nov', round('search', { label: 'Search' }) + round('bell', { label: 'From life', dot: true }))}
    <div class="scroll"><div class="rise">
      <div class="eyebrow-row"><span class="eyebrow">Good morning, Ama</span><button class="chip press">Level 1 · Stabilize</button></div>
      <p class="display"><b>${iw('gift', 'Kofi')} turns 31</b> on Saturday. Post his card <b>today</b>.</p>
      <div class="sec-head" style="margin-top:24px"><h4>Today’s moves</h4><span class="link">1 of 3</span></div>
      <div class="deck" style="height:300px;margin-top:0"><span class="deck-back" style="${img('payslip')}"></span>
        <div class="deck-card" style="${img('birthday')};background-position:center 80%"><span class="chip onphoto" style="align-self:flex-start">Saturday · Kofi turns 31</span><span class="copy"><b style="font-size:30px;line-height:34px;letter-spacing:-.9px">Order his card today</b><span>Second-class post arrives by Friday.</span></span></div>
      </div>
      <div class="decide plain"><button class="side press" style="${side}">Gift ideas</button><i class="dotsep"></i><button class="knob press" aria-label="Done">${ic('check')}</button><i class="dotsep"></i><button class="side press" style="${side}">Not today</button></div>
      <p class="callout mt12" style="text-align:center">Tap the tick when it’s ordered.</p>
      <div class="mt20">${says('On Saturday morning life will draft a message for you to send.')}</div>
    </div></div>${dock('Today')}`;
  }

  /* ── Important dates: one month of days, then every date with its face ─ */
  function dates(m) {
    const months = { '': { name: 'November', lead: 2, days: 30, marks: [18, 29] }, dec: { name: 'December', lead: 4, days: 31, marks: [2, 14] }, jan: { name: 'January', lead: 0, days: 31, marks: [9] } };
    const key = months[m] ? m : '', cur = months[key];
    const cells = Array.from({ length: cur.lead + cur.days }, (_, k) => {
      const d = k - cur.lead + 1;
      if (d < 1) return '<i style="background:none"></i>';
      if (key === '' && d === 18) return '<i class="sp-day" style="background:var(--ember);color:#08090A">18</i>';
      return cur.marks.includes(d) ? `<i class="on sp-day">${d}</i>` : '<i></i>';
    }).join('');
    const tabs = [['', 'Nov'], ['dec', 'Dec'], ['jan', 'Jan']].map(([k, l]) => `<button aria-pressed="${key === k}" data-set="${k}">${l}</button>`).join('');
    const legend = `${key === '' ? '<span><i style="background:var(--ember)"></i>Next</span>' : ''}<span><i style="background:var(--ink)"></i>A date you keep</span>`;
    const date = (day, mon, title, sub, who) => `<button class="row press"><span class="datebox"><b>${day}</b><small>${mon}</small></span><span class="mid"><b>${title}</b><span>${sub}</span></span>${face(...FACE[who])}</button>`;
    return `${status()}${pushBar('Dates', round('add', { label: 'Add a date' }))}
    <div class="scroll"><div class="rise">
      <p class="display" style="margin-top:4px"><b>5 dates</b> in the next eight weeks. <b>${iw('gift', 'Kofi’s')}</b> is first, on <b>Saturday</b>.</p>
      <div class="card mt24"><div class="seg" role="group">${tabs}</div>
        <div class="month mt16">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => `<small>${d}</small>`).join('')}${cells}</div>
        <div class="between mt16"><span class="legend">${legend}</span><span class="callout">${cur.marks.length} in ${cur.name}</span></div></div>
      <div class="micro mt24">NOVEMBER</div>
      <div class="card pad16 rows mt8">${date('18', 'NOV', 'Kofi’s birthday', 'Turning 31 · card by Wed', 'kofi')}${date('29', 'NOV', 'Your mum’s birthday', 'Reminder a week before', 'mum')}</div>
      <div class="micro mt20">DECEMBER</div>
      <div class="card pad16 rows mt8">${date('02', 'DEC', 'Priya’s birthday', 'From your contacts', 'priya')}${date('14', 'DEC', 'Grandpa Kwame', 'Remembered quietly · no reminder', 'kwame')}</div>
      <div class="micro mt20">JANUARY</div>
      <div class="card pad16 rows mt8">${date('09', 'JAN', 'Anniversary with Sam', '5 years', 'sam')}</div>
      <p class="callout mt16">Each date can have its own reminder, or none.</p>
    </div></div>`;
  }

  K.screen('settings', { from: '17, 3', note: 'Your account, one sentence that says how life is set right now, then four groups that open one at a time.', build: settings });
  K.screen('notifs', { from: '12, 5', note: 'The two limits in one card (how many, and the quiet hours as 24 ticks), then switches grouped by meaning.', build: notifs });
  K.screen('ondevice', { from: '8, 19', note: 'The phone drawn as a solid slab holding the three jobs that never leave it; the two that ask sit outside.', build: ondevice });
  K.screen('yourai', { from: '8, 9', note: 'A drawing of who asks whom, then exactly what your assistant may read, switch by switch.', build: yourai });
  K.screen('appearance', { from: '12, 15', note: 'Light and dark as two small phones you pick between, then sound, touch and pictures. Tap a phone.', build: s => appearance(s === 'dark') });
  K.screen('services', { from: '12, 3', note: 'Each connection is a calm tile: what it shares in big type, when it last synced. The bank is honestly off.', build: services });
  K.screen('privacy', { from: '3, 12', note: 'Opens on the promise in one big sentence, then your 214 records with one download button.', build: privacy });
  K.screen('deleteacct', { from: '5, 17', note: 'Plain words: what goes, what stays, 30 days as 30 dots. The button only wakes when DELETE is typed. Tap the field.', build: s => deleteacct(s === 'typed') });
  K.screen('subscription', { from: '14, 3, 5', note: 'Ama, pleased, on the plan card; the price as the one figure; the year as twelve dots; what it includes as one sentence.', build: subscription });
  K.screen('plussuccess', { from: '2', note: 'A moment under open sky: the orb lands, one line of thanks, the four things that just opened.', build: plussuccess });
  K.screen('help', { from: '7, 17, 9', note: 'Opens on a question box, then the three likeliest answers, then a real person by email.', build: help });
  K.screen('legal', { from: '6, 17', note: 'The mark, the version, the two plain promises in big type, and three tidy rows.', build: legal });
  K.screen('aimodels', { from: '20, 17', note: 'One size for this iPhone against a phone with no built-in AI, then the four parts with their sizes.', build: aimodels });
  K.screen('people', { from: '18, 14, 15', note: 'Photographs of your people: Kofi in front with the next two resting behind, then everyone coming up as picture cards.', build: people });
  K.screen('person', { from: '14, 19', note: 'Ama and Kofi fill the top, with the date as the hero. Below, the birthday as a small case: what you said, the card, the gift, the draft.', build: person });
  K.screen('addperson', { from: '6, 11', note: 'A sheet that asks one thing. Tick contacts, or type someone in. Tap the two tabs.', build: s => addperson(s === 'type') });
  K.screen('birthdaynudge', { from: '18, 14, 19', note: 'Today with the birthday as the move in front: the family photograph, one step, one tick.', build: birthdaynudge });
  K.screen('dates', { from: '21, 5', note: 'A month of days with only the dates you keep filled in, then every date with its face. Tap a month.', build: dates });
})();
