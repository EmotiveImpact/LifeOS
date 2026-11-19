(() => {
  'use strict';
  const I = window.LIFE_ICONS;
  const ic = (name, cls = '') => `<svg class="i ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[name] || ''}</svg>`;
  const img = name => `background-image:url('${(window.LIFE_V25_IMG && window.LIFE_V25_IMG[name]) || 'img/' + name + '.webp'}')`;
  const J = key => `data-jump="${key}"`;

  // Sample data, matching apps/mobile/src/state/seed.ts and the board copy.
  const D = {
    date: 'Monday, 16 Nov', name: 'Ama', level: 'Level 1', stage: 'Stabilize',
    aim: 'Own a two-bed flat by June 2029', aimPct: 24, saved: '£11,760', goal: '£49,000', monthly: '£800',
    rebate: '£840', readiness: 72, sleep: '7h 10m', load: '11.4', stress: '1.4', fuel: '1,420',
    knows: 64, records: 214,
  };

  const status = () => `<div class="status"><span>9:41</span><div class="island"></div><span class="sys"><em></em><i></i></span></div>`;
  const tabs = active => `<nav class="tabs" aria-label="life">${[['Today', 'home'], ['Plan', 'layers'], ['You', 'person'], ['Talk', 'mic']]
    .map(([t, i]) => `<button class="press" data-tab="${t}" data-jump="${t.toLowerCase()}" ${t === active ? 'aria-current="page"' : ''}>${ic(i)}${t}</button>`).join('')}</nav>`;
  const ruler = (pct, n = 40) => `<div class="ruler" aria-hidden="true">${Array.from({ length: n }, (_, k) => `<i class="${k < Math.round(pct / 100 * n) ? 'on' : ''}"></i>`).join('')}</div>`;
  const row = (icon, title, sub, extra = '', area = '', to = '') => `<button class="row press" ${area ? `data-area="${area}"` : ''} ${to ? J(to) : ''}><span class="ic">${ic(icon, 's18')}</span><span class="mid"><b>${title}</b><span>${sub}</span></span>${extra || `<span class="chev">${ic('chev', 's16')}</span>`}</button>`;

  /* ── Today ─────────────────────────────────────────── */
  function today(checked) {
    const checkin = checked
      ? `<div class="checked settle"><span class="tick">${ic('check', 's16')}</span><span class="line"><b>Feeling calm · checked in</b><span>A clear head today. Good day for the form.</span></span><button class="change" data-checkin="undo">Change</button></div>`
      : `<button class="checkin press" data-checkin="do" style="${img('desk')}"><span class="copy"><b>How are you arriving?</b><span>A quick check-in, if you want.</span></span><span class="go">${ic('arrow', 's18')}</span></button>`;
    return `${status()}
      <header class="topbar"><div><div class="date">${D.date}</div><h2>Today</h2></div>
        <div class="acts"><button class="icon-btn press" ${J('search')} aria-label="Search">${ic('search', 's18')}</button><button class="icon-btn press" ${J('inbox')} aria-label="Notifications">${ic('bell', 's18')}<span class="dot"></span></button></div></header>
      <div class="scroll"><div class="rise">
        <div class="greet"><span>Good morning, ${D.name}</span><button class="chip ink press" ${J('levels')}>${D.level} · ${D.stage}</button></div>
        <p class="statement">Your rebate is <b>one form away</b>. Your council tax bill is due in <b>15 days</b>.</p>
        <div class="stack" style="margin-top:20px">
          <div class="card next">
            <div class="micro"><span class="sig"></span>Your next move</div>
            <div class="title">Claim your tax rebate</div>
            <p class="body">One form · about 6 min · <span class="money">est. ${D.rebate} back</span></p>
            <button class="btn press" ${J('mission')}>Continue ${ic('arrow', 's18')}</button>
            <div class="foot"><button class="callout" ${J('aim')}>${ic('home', 's16')}For your first home</button><button class="callout why">Why this?</button></div>
          </div>
          ${checkin}
          <button class="card tight aim press" ${J('aim')}><span class="thumb" style="${img('terrace')}"></span>
            <span class="mid"><span class="micro">Your Aim · ${D.aimPct}% there</span><span class="title" style="display:block">${D.aim}</span><span class="bar"><i style="width:${D.aimPct}%"></i></span></span>
            <span class="chev">${ic('chev', 's16')}</span></button>
        </div>
        <section class="section">
          <div class="sec-head"><h4>Body at a glance</h4><button class="link" ${J('sources')}>Apple Health · 6 min ago</button></div>
          <button class="card press" ${J('body')} style="width:100%">
            <p class="glance-brief">You’re <b>well recovered</b>, but <b>2h 40m short</b> on sleep this week.</p>
            <div class="glance">
              <div><small>Readiness</small><strong>${D.readiness}</strong><em>/100</em></div>
              <div><small>Sleep</small><strong>${D.sleep}</strong><em>need 8h</em></div>
              <div><small>Load</small><strong>${D.load}</strong><em>/21</em></div>
              <div><small>Stress</small><strong>${D.stress}</strong><em>/3 · low</em></div>
              <div><small>Fuel</small><strong>${D.fuel}</strong><em>kcal</em></div>
            </div>
          </button>
        </section>
        <section class="section">
          <div class="card asking">
            <div class="who"><span class="orb-sm" data-orb="ring"></span><span class="micro">life is asking</span></div>
            <p class="q">Are you registered for Self Assessment?</p>
            <p class="body" style="margin-top:4px">It decides how your rebate is claimed.</p>
            <div class="answers"><button class="btn ghost compact press">Yes</button><button class="btn ghost compact press">Not yet</button><button class="btn ghost compact press">Not sure</button></div>
          </div>
        </section>
        <section class="section">
          <div class="sec-head"><h4>Coming up</h4><button class="link" ${J('calendar')}>Calendar ${ic('chev', 's16')}</button></div>
          <div class="card dates">
            <button class="date-row press" ${J('person')}><span class="datebox soon"><b>18</b><small>NOV</small></span><span class="mid"><b>Kofi’s birthday</b><span>Turning 31 · running vest idea</span></span><span class="when">Sat</span></button>
            <button class="date-row press" ${J('bill')}><span class="datebox"><b>01</b><small>DEC</small></span><span class="mid"><b>Council tax</b><span>£148 · Direct Debit</span></span><span class="when">15 days</span></button>
            <button class="date-row press" ${J('renewal')}><span class="datebox"><b>12</b><small>JAN</small></span><span class="mid"><b>Car MOT due</b><span>Book from 12 Dec</span></span><span class="when">8 weeks</span></button>
          </div>
        </section>
        <section class="section">
          <button class="card press" ${J('knows')} style="width:100%">
            <div class="knows"><span class="title">life knows you</span><span class="title num">${D.knows}%</span></div>
            ${ruler(D.knows)}
            <p class="callout" style="margin-top:10px">${D.records} things filed from your words and records.</p>
          </button>
        </section>
      </div></div>
      ${tabs('Today')}`;
  }

  /* ── Plan ──────────────────────────────────────────── */
  function plan() {
    return `${status()}
      <header class="topbar"><h2>Plan</h2><div class="acts"><button class="icon-btn press" ${J('search')} aria-label="Search">${ic('search', 's18')}</button><button class="icon-btn press" ${J('newgoal')} aria-label="Add">${ic('add', 's18')}</button></div></header>
      <div class="scroll"><div class="rise">
        <p class="statement" style="margin-top:4px"><b>Everything you’re managing.</b> Not everything to do today.</p>
        <button class="hero press" ${J('aim')} style="margin-top:20px;width:100%;display:block">
          <span class="photo" style="${img('terrace')}"><span class="copy"><small>Chief Aim</small><b>A two-bed flat of my own</b><span>South London · June 2029</span></span></span>
          <span class="below" style="display:block"><span class="meter"><b>${D.saved} saved</b><span class="title num">${D.aimPct}%</span></span>${ruler(D.aimPct)}<span class="callout" style="display:block;margin-top:8px">of a ${D.goal} deposit · ${D.monthly} a month</span></span>
        </button>
        <div class="filters" role="group" aria-label="Filter by area">${['All', 'Money', 'Home', 'Body'].map((f, i) => `<button data-filter="${f.toLowerCase()}" aria-pressed="${i === 0}">${f}</button>`).join('')}</div>
        <section class="section" style="margin-top:20px">
          <div class="sec-head"><h4>Ready when you are</h4></div>
          <div class="card list rows">
            ${row('doc', 'Check your tax code', 'Start with your payslip · 4 min', '', 'money', 'taxcheck')}
            ${row('wallet', 'Set your cash plan', 'Know what the month needs', '', 'money', 'cashplan')}
            ${row('walk', 'Your morning walk', 'Day 38 of about 66', '', 'body', 'habits')}
          </div>
        </section>
        <section class="section" data-area="home">
          <div class="sec-head"><h4>Situations</h4><button class="link" ${J('missions')}>All ${ic('chev', 's16')}</button></div>
          <button class="card press" ${J('mission')} style="width:100%">
            <span class="situation"><span class="thumb" style="${img('keys')}"></span><span class="mid" style="flex:1"><span class="title" style="display:block">My rent is going up</span><span class="callout">From March · 2 open steps</span></span><span class="chev">${ic('chev', 's16')}</span></span>
            <span class="step" style="display:block"><span class="micro">Next step</span><b>Find the review date in your tenancy agreement</b></span>
          </button>
        </section>
        <section class="section">
          <div class="sec-head"><h4>Waiting, not forgotten</h4></div>
          <div class="card list rows">
            ${row('doc', 'Council tax request', 'Sent 9 Nov · waiting for a reply', '<span class="chip">Waiting</span>', 'money', 'bill')}
            ${row('heart', 'Heart referral', 'About 11 weeks · we’ll keep watch', '<span class="chip">Waiting</span>', 'body', 'areahealth')}
          </div>
          <p class="note">Waiting items don’t compete with things you can act on.</p>
        </section>
        <section class="section">
          <div class="sec-head"><h4>Your tools</h4><button class="link" ${J('tools')}>All tools ${ic('chev', 's16')}</button></div>
          <div class="tools">
            <button class="tool press" ${J('cashplan')}>${ic('cash')}<b>30-day cash plan</b></button>
            <button class="tool press" ${J('rentbuy')}>${ic('home')}<b>Rent vs buy</b></button>
            <button class="tool press" ${J('taxcheck')}>${ic('calculator')}<b>Tax check</b></button>
            <button class="tool press" ${J('tools')}>${ic('grid')}<b>Everything else</b></button>
          </div>
        </section>
      </div></div>
      ${tabs('Plan')}`;
  }

  /* ── You ───────────────────────────────────────────── */
  function you() {
    return `${status()}
      <header class="topbar"><h2>You</h2><div class="acts"><button class="avatar press" ${J('profile')}>A</button><button class="icon-btn press" ${J('settings')} aria-label="Settings">${ic('gear', 's18')}</button></div></header>
      <div class="scroll"><div class="rise">
        <p class="statement" style="margin-top:4px"><b>Your life, coming together.</b> At your own pace.</p>
        <div class="card" style="margin-top:20px">
          <div class="headline">A steadier foundation.</div>
          <dl class="found"><dt>Your level</dt><dd>${D.stage} · ${D.level}</dd><dt>Your focus</dt><dd>Your first home</dd><dt>Streak</dt><dd>4 days</dd></dl>
          <button class="see press" ${J('levels')}>See your progress ${ic('chev', 's16')}</button>
        </div>
        <div class="tiles" style="margin-top:12px">
          <button class="tile press" ${J('areahome')} style="${img('home')}"><b>Home</b></button>
          <button class="tile press" ${J('areawork')} style="${img('work')}"><b>Work</b></button>
          <button class="tile press" ${J('people')} style="${img('people')}"><b>People</b></button>
        </div>
        <section class="section">
          <div class="sec-head"><h4>What life knows</h4><button class="link" ${J('knows')}>Review ${ic('chev', 's16')}</button></div>
          <div class="card">
            <div class="split"><div><strong>${D.records}</strong><span class="callout">saved records</span></div><div><strong>${D.knows}%</strong><span class="callout">of your profile filled in</span></div></div>
            ${ruler(D.knows)}
          </div>
        </section>
        <section class="section">
          <div class="sec-head"><h4>From your words</h4></div>
          <button class="card press" ${J('memory')} style="width:100%"><span class="micro"><span class="orb-sm" data-orb="ring" style="width:14px;height:14px"></span>From Talk · 12 Nov</span><p class="quote">“My rent goes up in March.”</p><span class="callout" style="display:block;margin-top:8px">Filed in My rent is going up</span></button>
        </section>
        <section class="section">
          <div class="card list rows">
            ${row('home', 'Your household', 'The people and place you call home.', '', '', 'household')}
            ${row('heart', 'Body and habits', 'Sleep, movement and small routines.', '', '', 'habits')}
            ${row('people', 'People and dates', 'The people you want to show up for.', '', '', 'dates')}
            ${row('book', 'Your learning', 'Ideas you can actually use.', '', '', 'learning')}
          </div>
        </section>
      </div></div>
      ${tabs('You')}`;
  }

  /* ── Talk ──────────────────────────────────────────── */
  function talk() {
    return `${status()}
      <header class="topbar flow"><button class="icon-btn press" ${J('today')} aria-label="Close">${ic('close', 's18')}</button><h3>Talk</h3><button class="icon-btn press" ${J('chathistory')} aria-label="Conversations">${ic('clock', 's18')}</button></header>
      <div class="scroll"><div class="rise">
        <div class="talk-orb"><span data-orb="listening" data-size="96" style="width:96px;height:96px;display:block"></span></div>
        <p class="listening">Listening · 0:14</p>
        <p class="said">I found the rent letter. <mark>The review is on 3 March.</mark></p>
        <div class="reply"><span class="orb-sm" data-orb="ring"></span><span>I can keep that date with your rent situation.</span></div>
        <div class="card" style="margin-top:20px">
          <div class="headline">Ready to file</div>
          <p class="callout">My rent is going up</p>
          <div class="fact"><span class="ic">${ic('doc', 's16')}</span>Document<strong>Rent letter</strong></div>
          <div class="fact"><span class="ic">${ic('calendar', 's16')}</span>Review date<strong>3 March</strong></div>
          <button class="btn press" ${J('understood')} style="margin-top:18px">Review 2 details ${ic('arrow', 's18')}</button>
          <p class="callout" style="margin-top:10px;text-align:center">Nothing is saved until you say so.</p>
        </div>
        <section class="section" style="margin-top:24px">
          <div class="sec-head"><h4>Filing into place</h4><span class="link">2 today</span></div>
          <div class="filing">
            ${[['You', 'you', '—'], ['Home', 'home', '2 new'], ['Work', 'work', '—'], ['Money', 'money', '—'], ['Health', 'health', '—'], ['Goals', 'goal', '—']]
              .map(([t, a, n]) => `<div><small><i style="background:var(--a-${a})"></i>${t}</small><span>${n}</span></div>`).join('')}
          </div>
        </section>
      </div></div>
      <div class="composer"><button class="icon-btn press" ${J('attach')} aria-label="Attach">${ic('add', 's18')}</button><button class="field" ${J('chat')}>Message life</button><button class="mic press" ${J('micprimer')} aria-label="Talk">${ic('mic')}</button></div>`;
  }

  function mountOrbs(root) {
    root.querySelectorAll('[data-orb]').forEach(el => {
      if (el.dataset.mounted) return;
      el.dataset.mounted = '1';
      const size = Number(el.dataset.size) || el.getBoundingClientRect().width || 20;
      window.mountOrb(el, size, el.dataset.orb);
    });
  }

  /** In-screen interactions shared by the standalone mockup and the full board. Returns true when handled. */
  function interact(e) {
    const c = e.target.closest('[data-checkin]');
    if (c) {
      const screen = c.closest('.screen');
      const scroll = screen.querySelector('.scroll').scrollTop;
      screen.innerHTML = today(c.dataset.checkin === 'do');
      screen.querySelector('.rise').classList.remove('rise');
      screen.querySelector('.scroll').scrollTop = scroll;
      mountOrbs(screen);
      return true;
    }
    const f = e.target.closest('[data-filter]');
    if (f) {
      const screen = f.closest('.screen');
      screen.querySelectorAll('[data-filter]').forEach(b => b.setAttribute('aria-pressed', String(b === f)));
      const want = f.dataset.filter;
      screen.querySelectorAll('[data-area]').forEach(el => { el.hidden = want !== 'all' && el.dataset.area !== want; });
      screen.querySelectorAll('.section').forEach(sec => {
        const items = sec.querySelectorAll('.rows [data-area]');
        if (items.length) sec.hidden = [...items].every(i => i.hidden);
      });
      return true;
    }
    return false;
  }

  window.LIFE_V25 = { screens: { today: () => today(false), plan, you, talk }, mountOrbs, interact };

  // Standalone mockup (review/v25/index.html). The full board uses window.LIFE_V25 instead.
  const board = document.getElementById('board');
  if (!board) return;
  const slots = [
    { id: 'today', title: 'Today', note: 'v17’s briefing and depth, in V19’s order. One next move, then the check-in photo.', html: () => today(false) },
    { id: 'today-after', title: 'Today · after check-in', note: 'The check-in shrinks to one quiet line and gives the space back.', html: () => today(true) },
    { id: 'plan', title: 'Plan', note: 'The Aim photograph leads; ready, situations and waiting are grouped, not competing.', html: plan },
    { id: 'you', title: 'You', note: 'Level and focus first, V24’s Home / Work / People photographs, then what life knows.', html: you },
    { id: 'talk', title: 'Talk', note: 'The orb listens; what you say becomes a card you approve before anything is filed.', html: talk },
  ];
  board.innerHTML = slots.map(s => `<article class="slot" id="slot-${s.id}"><div class="phone"><div class="screen" data-screen="${s.id}">${s.html()}</div></div><div class="slot-cap"><b>${s.title}</b><span>${s.note}</span></div></article>`).join('');
  mountOrbs(document);
  board.addEventListener('click', e => {
    if (interact(e)) return;
    const t = e.target.closest('[data-tab]');
    if (t) document.getElementById('slot-' + t.dataset.tab.toLowerCase()).scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  });
  document.querySelectorAll('[data-theme-set]').forEach(b => b.addEventListener('click', () => {
    document.documentElement.dataset.theme = b.dataset.themeSet;
    document.querySelectorAll('[data-theme-set]').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
  }));
})();
