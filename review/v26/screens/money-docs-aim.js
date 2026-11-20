// life · V26 — Plan · Money, Documents and renewals, Your Chief Aim. Written against review/v26/KIT.md.
// Picture-forward: real things (a payslip, a letter, a passport, the shopping, the front door) are photographs.
(() => {
  'use strict';
  const K = window.L26;
  const { ic, img, status, round, pushBar, textBar, foot, btn, secHead, chip, orb, says, ruler, row, pick, check, kv, toggle, seg, dots, caps, line } = K;

  K.addCss('.mda-', `
    .mda-split { display: flex; gap: 3px; height: 12px; }
    .mda-split i { display: block; min-width: 8px; border-radius: 999px; background: var(--ink); }
    .mda-pmeter { display: block; height: 6px; margin-top: 10px; border-radius: 999px; background: var(--photo-fill); overflow: hidden; }
    .mda-pmeter i { display: block; height: 100%; border-radius: 999px; background: var(--ember); }
    .mda-blank { display: inline-block; width: 84px; height: 16px; border-radius: 999px; background: var(--surface3); vertical-align: -1px; }
    .mda-blank.mda-now { background: var(--ember); }
    .mda-strip { height: 132px; background: var(--surface2) center/cover no-repeat; }
  `);

  /* Small pieces shared by this chapter */
  const BIG = 'font-size:44px;line-height:48px;letter-spacing:-1.32px';
  const MID = 'font-size:20px;line-height:26px;letter-spacing:-.4px';
  const pp = p => `<span style="font-size:24px;letter-spacing:-.53px">.${p}</span>`;                                   // pence on a photograph
  const np = p => `<span style="font-size:16px;letter-spacing:0;color:var(--ink2)">.${p}</span>`;                      // pence beside a tile figure
  const dot = token => `<i style="width:6px;height:6px;border-radius:50%;background:var(--${token});flex:none"></i>`;
  const ph = (name, pos = '') => `<span class="thumb" style="${img(name)}${pos ? `;background-position:${pos}` : ''}"></span>`;
  const box = inner => `<span class="thumb" style="display:grid;place-items:center;font-size:16px;font-weight:600">${inner}</span>`;
  const item = (lead, title, sub, end = '', attrs = '') => `<button class="row press" ${attrs}>${lead}<span class="mid"><b>${title}</b><span>${sub}</span></span>${end}</button>`;
  const amt = t => `<span class="end">${t}</span>`;
  const skyRound = (icon, label) => `<button class="round press" style="background:var(--photo-fill);color:var(--on-photo)" aria-label="${label}">${ic(icon, 's18')}</button>`;

  /* ── Money: the hub ──────────────────────────────────── */
  function money() {
    const acct = (label, unit, whole, p, sub, wide = false) => `<button class="tile ${wide ? 'wide' : ''} press"><span class="th"><span>${label}</span><em>${unit}</em></span><span class="num">£${whole}${np(p)}</span><span class="sub">${sub}</span></button>`;
    return `${status()}${pushBar('Money', round('eye', { label: 'Hide balance' }))}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('payslip')};height:270px;background-position:center 100%">
        <span class="topline"><span class="chip onphoto">Today · all accounts</span><span class="chip onphoto">${ic('arrowUp', 's14')}12.4%</span></span>
        <span class="copy"><b style="${BIG}">£2,340${pp('50')}</b><span>+£260.20 this month</span></span>
      </div>
      <div class="card tint money mt12">
        <div class="between"><span class="title">This month</span><span class="legend"><span><i style="background:var(--ink)"></i>In</span><span><i style="background:var(--ink2)"></i>Out</span></span></div>
        <div class="mt12">${caps([{ l: '2 Nov', in: 0, out: 298.4 }, { l: '9 Nov', in: 0, out: 335.08 }, { l: '16 Nov', in: 0, out: 310 }, { l: '23 Nov', in: 2410.66, out: 1206.98, now: true }])}</div>
        <p class="callout mt8"><span class="ink">£2,410.66 in</span> and £2,150.46 out so far. Payday landed today.</p>
      </div>
      ${secHead('Accounts', 'adds up to £2,340.50')}
      <div class="tiles">
        ${acct('Everyday', '·· 4821', '612', '40', 'Day-to-day spending')}
        ${acct('Bills pot', 'standing orders', '1,148', '10', 'Rent and bills leave here')}
        ${acct('Buffer', 'payday sweep', '580', '00', '£180.00 moved in today', true)}
      </div>
      ${secHead('Today', `All payments ${ic('chev', 's16')}`)}
      <div class="card pad16 rows">
        ${item(ph('payslip', 'center 78%'), 'Salary · Acme Ltd', 'Income', amt('+£2,410.66'))}
        ${item(ph('terrace', '70% center'), 'Rent', 'Standing order', amt('£1,150.00'))}
        ${item(box(ic('swap', 's18')), 'Moved to buffer', 'Payday sweep', amt('£180.00'))}
        ${item(box('A'), 'Adobe Creative Cloud', 'Subscription', amt('£56.98'))}
      </div>
      ${secHead('More in Money')}
      <div class="card pad16 rows">
        ${row('wallet', 'Budget', '£612 left to spend in November')}
        ${row('repeat', 'Subscriptions', '£91.95 a month · 2 not used')}
        ${row('trend', 'Net worth', '£23,480 · up £6,120 this year')}
        ${row('shield', 'Connect your bank', 'Read-only', chip('Preview', 'q'))}
      </div>
      <p class="callout mt16">Balances are the ones you’ve given life. No bank is connected. Guidance, not advice.</p>
    </div></div>`;
  }

  /* ── Subscriptions ───────────────────────────────────── */
  function subs() {
    const idle = (name, days, price) => `<div class="tile"><span class="th"><span class="ink" style="font-weight:600">${name}</span><span class="chip live">Not used</span></span><span class="num">${days}<small>days</small></span><span class="sub">£${price} a month</span><button class="btn ghost sm press" style="margin-top:14px">Cancel</button></div>`;
    return `${status()}${pushBar('Subscriptions', round('more', { label: 'More' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Checked every quarter</span>
      <p class="display"><b>£383.76 a year</b> goes on two things you <b>haven’t used</b> in 60 days.</p>
      <div class="card tint money mt24">
        <div class="between"><span class="title">Every month</span><span class="title">£91.95</span></div>
        <div class="mda-split mt12"><i style="flex:5997"></i><i style="flex:3198;background:var(--ember)"></i></div>
        <div class="between mt8"><span class="callout">In use £59.97</span><span class="callout" style="color:var(--ember-text)">Not used £31.98</span></div>
      </div>
      ${secHead('Not being used', '£31.98 a month')}
      <div class="tiles">${idle('Netflix', 74, '12.99')}${idle('Gym Group', 61, '18.99')}</div>
      <button class="card pad16 press mt12" style="display:flex;align-items:center;gap:12px">${ph('keyshome', 'center 78%')}<span style="flex:1"><span class="micro">If you let both go</span><span class="title" style="display:block;margin-top:2px">£31.98 a month more for your flat</span></span><span class="chev">${ic('chev', 's16')}</span></button>
      ${secHead('Still in use', '£59.97 a month')}
      <div class="card pad16 rows">
        ${item(box('A'), 'Adobe Creative Cloud', 'Renews in 4 days', amt('£56.98'))}
        ${item(box('i'), 'iCloud+ 200GB', 'Renews 2 Dec', amt('£2.99'))}
      </div>
      <p class="callout mt16">life opens the provider’s cancel page. Nothing is cancelled without you.</p>
    </div></div>`;
  }

  /* ── Area: Money ─────────────────────────────────────── */
  function area() {
    return `${status()}${pushBar('', round('more', { label: 'More' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">${dot('a-money')}Money · how strong</span>
      <p class="display"><b>Building.</b> Buffer at <b>1.3 months</b>, tax <b>up to date</b>, <b>1 rebate</b> in progress.</p>
      ${secHead('Missions', '2 active')}
      <div class="pgrid">
        <button class="pcard press" style="${img('payslip')};height:200px;background-position:center 100%"><span class="topline"><span class="chip onphoto">${dot('ember')}Live</span></span><span class="copy"><b style="${MID}">HMRC tax rebate</b><span>est. £840 · one form to go</span></span></button>
        <button class="pcard press" style="${img('keyshome')};height:200px;background-position:center 92%"><span class="topline"><span class="chip onphoto">To do</span></span><span class="copy"><b style="${MID}">Lifetime ISA</b><span>25% bonus</span></span></button>
      </div>
      ${secHead('Routines', '1 running')}
      <div class="card pad16 rows">${row('repeat', 'Payday sweep', 'Next 28 Nov', chip('Active'))}</div>
      ${secHead('Tools')}
      <div class="card pad16 rows">
        ${row('cash', '30-day cash plan', 'Safe to spend this month: £290')}
        ${row('wallet', 'Money and ledger', '£2,340.50 across 3 accounts')}
        ${row('repeat', 'Subscriptions', '£91.95 a month')}
      </div>
      <p class="callout mt16">Progress, not a score. life works it out from what you’ve told it.</p>
    </div></div>`;
  }

  /* ── A payment: a receipt, centred ───────────────────── */
  function txn() {
    return `${status()}${pushBar('Payment', round('more', { label: 'More' }))}
    <div class="scroll"><div class="rise">
      <div class="mda-strip" style="${img('cook')};height:140px;border-radius:24px;box-shadow:var(--shadow);background-position:center 36%"></div>
      <div style="display:flex;flex-direction:column;align-items:center;margin-top:16px">
        <span class="eyebrow">Tesco · 14 Nov, 18:22</span>
        <div class="xl" style="margin-top:6px">£42<span style="font-size:24px;letter-spacing:-.53px;color:var(--ink2)">.17</span></div>
        <span class="chip q" style="margin-top:10px">${ic('repeat', 's14')}About weekly · normal</span>
      </div>
      <div class="tile wide tint money mt20" style="min-height:0">
        <span class="th"><span>Groceries this month</span><em>of £240</em></span>
        <span class="between" style="align-items:flex-end"><span class="num">£186</span><span class="chip done" style="margin-bottom:6px">On track</span></span>
        <span class="meter"><i style="width:77.5%;background:var(--ac)"></i></span>
      </div>
      <div class="gap12 mt12">${pick('Category', 'Groceries', true)}${pick('Repeats', 'About weekly', true)}</div>
      <p class="callout mt12" style="text-align:center">Change the category once and life remembers.</p>
    </div></div>
    ${foot(btn('Split with Sam', { icon: 'people' }))}`;
  }

  /* ── A bill ──────────────────────────────────────────── */
  function bill() {
    return `${status()}${pushBar('Council tax', round('more', { label: 'More' }))}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('letter')};height:240px;background-position:center 64%">
        <span class="topline"><span class="datebox" style="background:var(--on-photo);color:#0D0E10"><b>01</b><small style="color:#0D0E10">DEC</small></span><span class="chip onphoto">In 16 days</span></span>
        <span class="copy"><b style="${BIG}">£148${pp('00')}</b><span>a month · Direct Debit · due 1st</span></span>
      </div>
      <div class="card mt12">
        <span class="chip live">You could pay £37 less a month</span>
        <p class="statement mt12">You live alone, so the <b>25% single person discount</b> applies.</p>
        <div class="mt16">${says('I’ll fill in the council’s form, show it to you, then send it and watch for the reply.')}</div>
        <button class="btn press mt16">Claim it for me</button>
        <p class="callout mt12" style="text-align:center">About £111 a month if the council agrees. Nothing is sent without your OK.</p>
      </div>
      <div class="card mt12">
        <div class="between"><span class="title">Last 12 months</span><span class="callout">12 paid by Direct Debit</span></div>
        <div class="mt16">${dots(Array(12).fill('on'), 12)}</div>
        <div class="month" style="grid-template-columns:repeat(12,1fr);gap:7px;margin-top:8px">${'DJFMAMJJASON'.split('').map(m => `<small>${m}</small>`).join('')}</div>
      </div>
      <p class="callout mt16">An estimate from what you’ve told life. Your council decides. Guidance, not advice.</p>
    </div></div>`;
  }

  /* ── Budget ──────────────────────────────────────────── */
  function budget() {
    const env = (name, left, of, spent, pct) => `<button class="tile press"><span class="th"><span>${name}</span><em>of £${of}</em></span><span class="num">£${left}<small>left</small></span><span class="meter"><i style="width:${pct}%"></i></span><span class="sub" style="margin-top:8px">£${spent} spent</span></button>`;
    const days = Array.from({ length: 30 }, (_, k) => (k < 14 ? 'on' : ''));
    return `${status()}${pushBar('November', `<button class="txt">Edit</button>`)}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Budget · every pound has a job</span>
      <p class="display"><b>£612</b> left to spend, with <b>16 days</b> to go.</p>
      <div class="mt20">${dots(days, 15)}</div>
      <div class="between mt8"><span class="callout">14 days gone</span><span class="callout">30 Nov</span></div>
      ${secHead('Flexible spending', 'drag to move money')}
      <button class="pcard press" style="${img('friends')};height:180px;background-position:center 66%">
        <span class="topline"><span class="chip onphoto">${dot('ember')}£8 left</span></span>
        <span class="copy"><b>Going out</b><span>£142 of £150</span><span class="mda-pmeter"><i style="width:95%"></i></span></span>
      </button>
      <div class="tiles mt12">${env('Groceries', 54, 240, 186, 77.5)}${env('Transport', 72, 120, 48, 40)}</div>
      ${secHead('Already covered')}
      <div class="card pad16 rows">
        ${item(ph('terrace', '70% center'), 'Rent', '£950 of £950', chip('Covered', 'done'))}
        ${item(ph('payslip', 'center 78%'), 'Tax pot', '£680 of £680', chip('Covered', 'done'))}
      </div>
      <p class="callout mt16">Worked out from the payments you’ve given life. Guidance, not advice.</p>
    </div></div>`;
  }

  /* ── Net worth ───────────────────────────────────────── */
  function networth() {
    const year = [17360, 17810, 18240, 18900, 19350, 19980, 20410, 21050, 21620, 22310, 22870, 23480];
    const part = (token, label, value) => kv(`<span style="display:inline-flex;align-items:center;gap:8px">${dot(token)}${label}</span>`, value);
    return `${status()}${pushBar('Net worth', round('eye', { label: 'Hide numbers' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Everything you own, minus everything you owe</span>
      <div class="xl" style="margin-top:8px">£23,480</div>
      <div class="mt8" style="display:flex;gap:8px"><span class="chip done">${ic('arrowUp', 's14')}£6,120 this year</span></div>
      <div class="card tint money mt20">
        <div class="between"><span class="title">The trend leads</span><span class="callout">12 months</span></div>
        <div class="mt12">${line(year, 17260, 17460, { h: 150, color: 'var(--ac)', band: 'var(--surface)', label: 'Net worth from December to November, rising from £17,360 to £23,480' })}</div>
        <div class="times"><span>Dec</span><span>Nov</span></div>
        <p class="callout mt8">The pale line is where you began the year: £17,360.</p>
      </div>
      <div class="card mt12">
        <div class="between"><span class="title">What makes it up</span><span class="callout">own, then owe</span></div>
        <div class="mda-split mt16"><i style="flex:12400"></i><i style="flex:14880;background:var(--ink2)"></i><i style="flex:3800;background:var(--surface3);margin-left:8px"></i></div>
        <div class="mt12">${part('ink', 'Savings and ISA', '£12,400')}${part('ink2', 'Pension', '£14,880')}${part('surface3', 'Student loan', '− £3,800')}</div>
        <p class="callout" style="margin-top:2px">The student loan doesn’t act like debt. Repayments move with what you earn.</p>
      </div>
      <p class="callout mt16">Pensions and property count. Values are the last ones you gave life. Guidance, not advice.</p>
    </div></div>`;
  }

  /* ── Connect your bank: a permission primer, and a preview ── */
  function connectbank() {
    const bank = n => `<button class="chip press" style="height:36px;font-size:14px;font-weight:500;padding:0 14px">${n}</button>`;
    const fact = (icon, t, s) => row(icon, t, s, '<span></span>');
    return `${status()}${pushBar('', chip('Preview', 'q'), 'close')}
    <div class="scroll"><div class="rise">
      <span style="width:64px;height:64px;border-radius:20px;background:var(--surface);box-shadow:var(--shadow);display:grid;place-items:center;color:var(--ink)">${ic('shield')}</span>
      <p class="display" style="margin-top:16px">See <b>all your money</b> in one place.</p>
      <p class="body mt8">Read-only, through a regulated Open Banking provider. <b>This is a preview:</b> connecting isn’t switched on yet.</p>
      <div class="card pad16 rows mt20">${fact('eye', 'Read-only', 'life can’t move money')}${fact('shield', 'Your login stays with your bank', 'You approve in your bank’s app')}${fact('clock', 'Ends after 90 days', 'Renew in one tap')}</div>
      <div class="micro mt24">BANKS YOU’LL BE ABLE TO CHOOSE</div>
      <div class="mt12"><div class="hscroll">${['Monzo', 'Starling', 'Barclays', 'HSBC', 'Lloyds', 'Nationwide'].map(bank).join('')}</div></div>
    </div></div>
    ${foot(btn('Choose your bank') + `<button class="callout" style="text-align:center">Not now</button>`)}`;
  }

  /* ── Documents and renewals ──────────────────────────── */
  function vault() {
    const doc = (top, small, title, sub, end) => `<button class="row press"><span class="datebox"><b>${top}</b>${small ? `<small>${small}</small>` : ''}</span><span class="mid"><b>${title}</b><span>${sub}</span></span>${end}</button>`;
    const when = t => `<span class="callout">${t}</span>`;
    return `${status()}${pushBar('', round('search', { label: 'Search documents' }) + round('add', { label: 'Add a document' }))}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Documents and renewals</span>
      <p class="display"><b>One</b> to act on. <b>Five</b> sorted.</p>
      <div class="stack mt24">
        <div class="peek"><span>Railcard · expires 3 Mar</span><span>3</span></div>
        <div class="peek"><span>Car MOT · due 12 Jan</span><span>2</span></div>
        <div class="card next" style="padding:0;overflow:hidden">
          <div class="mda-strip" style="${img('letter')};background-position:center 61%"></div>
          <div style="padding:4px 20px 20px">
            <div class="between"><div class="micro"><span class="sig"></span>To act on · 1 of 3</div><span class="chip">Renews 14 Feb</span></div>
            <div class="headline">Car insurance</div>
            <p class="body">Compare from <b>22 Jan</b>. Prices are usually lowest about three weeks before renewal.</p>
            <button class="btn press">See the renewal plan ${ic('arrow', 's18')}</button>
          </div>
        </div>
      </div>
      ${secHead('Filed', '5 sorted')}
      <button class="pcard press" style="${img('passport')};height:170px;background-position:center 83%">
        <span class="topline"><span class="chip onphoto">In 21 months</span><span class="chip onphoto">${ic('check', 's14')}Copy saved</span></span>
        <span class="copy"><b style="${MID}">Passport</b><span>Expires Aug 2027</span></span>
      </button>
      <div class="card pad16 rows mt12">
        ${doc('12', 'JAN', 'Car MOT', 'Due 12 Jan · book from 12 Dec', when('8 weeks'))}
        ${doc('03', 'MAR', 'Railcard', 'Expires 3 Mar', when('15 weeks'))}
        ${doc('2031', '', 'Driving licence photo', 'Expires 2031', chip('Sorted', 'done'))}
        ${doc('OCT', '2027', 'TV Licence', 'Paid to Oct 2027', chip('Sorted', 'done'))}
      </div>
      <div class="mt16">${btn('Scan a document', { icon: 'camera', ghost: true })}</div>
    </div></div>`;
  }

  /* ── Passport: one document as a case ────────────────── */
  function docdetail() {
    const months = Array.from({ length: 21 }, (_, k) => `<i class="${k >= 14 ? 'on' : ''}"></i>`).join('');
    return `${status()}${pushBar('Passport', round('more', { label: 'More' }))}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img('passport')};height:300px;background-position:center 100%">
        <span class="topline"><span class="chip onphoto">Expires 12 Aug 2027</span><span class="chip onphoto">${ic('check', 's14')}Copy saved</span></span>
        <span class="copy"><b style="${BIG}">21 months</b><span>left on your passport. Nothing to do yet.</span></span>
      </div>
      <div class="card mt12">
        <div class="between"><span class="title">The countdown</span><span class="callout">one dot a month</span></div>
        <div class="dots mt16" style="grid-template-columns:repeat(21,1fr);gap:4px" aria-hidden="true">${months}</div>
        <div class="between mt12"><span class="callout">14 quiet months</span><span class="callout ink">Feb to Aug 2027: renew</span></div>
      </div>
      ${secHead('When to act')}
      <div class="tl">
        <div class="tl-item done"><div class="when">YOUR COPY</div><p>Photo page saved, encrypted.</p></div>
        <div class="tl-item now"><div class="when">FEBRUARY 2027</div><p>life will remind you.</p>
          <div class="card pad16 mt12"><div class="between"><span class="title">Reminder set</span>${toggle(true, 'Remind me in February 2027')}</div><p class="callout mt8">Six months before expiry, with time to spare for summer travel.</p></div></div>
        <div class="tl-item later"><div class="when">WHEN YOU RENEW</div><p>Renew online at GOV.UK. Allow about 3 weeks.</p><span class="callout" style="display:block;margin-top:2px">Cost: check the current fee on GOV.UK.</span></div>
        <div class="tl-item later"><div class="when">12 AUG 2027</div><p>Your passport expires.</p></div>
      </div>
    </div></div>`;
  }

  /* ── Renewal: car insurance ──────────────────────────── */
  function renewal() {
    const step = (t, s) => check(`${t}<span class="callout" style="display:block">${s}</span>`);
    return `${status()}${pushBar('', round('more', { label: 'More' }))}
    <div class="scroll"><div class="rise">
      <div class="eyebrow-row"><span class="eyebrow">Car insurance · renews 14 February</span><span class="chip live">Best window</span></div>
      <p class="display">Compare from <b>22 January</b>, when prices are usually <b>lowest.</b></p>
      <div class="pgrid mt24">
        <div class="pcard" style="${img('letter')};height:200px;background-position:center 72%"><span class="topline"><span class="chip onphoto">Your renewal</span></span><span class="copy"><b>£612.00</b><span>a year with your current insurer</span></span></div>
        <div class="tile tint money" style="min-height:200px"><span class="th"><span>A better quote</span></span><span style="margin-top:22px">${orb('ring', 44)}</span><span class="sub" style="margin-top:auto">Not found yet. life looks from 22 Jan, when you say. You choose.</span></div>
      </div>
      <p class="callout mt12">Prices are usually lowest around three weeks before renewal.</p>
      ${secHead('Three steps', 'tick as you go')}
      <div class="card pad16">${step('Compare quotes', 'From 22 January')}${step('Switch or haggle', 'Your insurer often matches')}${step('Turn off auto-renew', 'By 13 February')}</div>
    </div></div>
    ${foot(btn('Compare quotes', { icon: 'search' }) + `<span class="callout" style="text-align:center">Guidance, not advice. Nothing switches without you.</span>`)}`;
  }

  /* ── Write your Aim: one question at a time ──────────── */
  function aimnew(filled) {
    const blank = now => `<i class="mda-blank ${now ? 'mda-now' : ''}"></i>`;
    return `${status()}${textBar(ic('close', 's18') + 'Close', '1 of 4')}
    <div class="scroll" style="display:flex;flex-direction:column"><div class="rise" style="display:flex;flex-direction:column;flex:1">
      <div class="hero">
        <div class="mda-strip" style="${img('desk')};height:128px;background-position:center 50%"></div>
        <div class="below"><span class="eyebrow">Your Chief Aim</span><p class="display" style="margin-top:6px">What, <b>exactly?</b></p><p class="body mt8">Make it concrete enough that you’d know the day you’ve got it.</p></div>
      </div>
      <div class="composer mt12"><p>${filled ? 'Own a two-bed flat in South London' : '<span class="q">Say it or type it</span>'}<span class="caret"></span></p><button class="round sm press" aria-label="Talk instead of typing">${ic('mic', 's16')}</button></div>
      <div class="mt12">${filled
        ? `<button class="chip done press" data-set="" style="height:34px;padding:0 12px">${ic('check', 's14')}From what life already knows · undo</button>`
        : `<button class="chip press" data-set="filled" style="height:34px;padding:0 12px 0 8px;gap:8px">${orb('ring', 18)}Suggest: Own a two-bed flat in South London</button>`}</div>
      <div style="flex:1;min-height:20px"></div>
      <span class="eyebrow">Your Aim, so far</span>
      <p class="statement mt8">By ${blank(false)}, I will ${filled ? '<b>own a two-bed flat in South London</b>' : blank(true)}. In return I will ${blank(false)}. My plan: ${blank(false)}.</p>
    </div></div>
    ${foot(btn(filled ? 'Next: by when?' : 'Next', { icon: 'arrow', trail: true }))}`;
  }

  /* ── Your Aim: her sentence on the sky above her own front door ── */
  function aim(read) {
    const days = Array.from({ length: 21 }, (_, k) => (k < 20 || read ? 'on' : 'now'));
    return `<div class="full-photo" style="${img('keyshome')};bottom:auto;height:740px;background-size:522px auto;background-position:70% 0"></div>
    ${status('on-photo')}
    <header class="bar on-photo">${skyRound('back', 'Back')}<div class="acts">${skyRound('arrowUp', 'Share')}${skyRound('more', 'More')}</div></header>
    <div class="on-photo" style="flex:none;height:200px;padding:6px 20px 0;position:relative;z-index:2">
      <span class="eyebrow" style="color:var(--on-photo)">Chief Aim · 24% there</span>
      <p class="display">By <b>June 2029</b>, I will <b>own a two-bed flat in South London.</b></p>
    </div>
    <div class="scroll" style="padding:0;position:relative;z-index:2">
      <div style="height:392px"></div>
      <div class="sheet rise" style="background:var(--canvas)">
        <div class="handle" style="margin-bottom:14px"></div>
        <div class="between" style="align-items:flex-end"><div class="xl">£11,760</div><span class="callout" style="margin-bottom:10px;text-align:right">of £49,000 · <b class="ink">24%</b></span></div>
        ${ruler(24)}
        <span class="eyebrow mt32">In your words</span>
        <p class="statement mt8">In return I will <b>save £800 a month and grow my design rate by 20%</b>. My plan: <b>Lifetime ISA first, then a mortgage in principle by 2028</b>.</p>
        <div class="card mt24">
          <div class="between" style="align-items:flex-start">
            <div><div class="micro">READ IT TODAY</div><div class="headline" style="margin-top:8px">Day 21 streak</div><p class="callout" style="margin-top:2px">${read ? 'Read twice today. See you in the morning.' : 'Morning done. Twenty seconds tonight.'}</p></div>
            <div style="width:104px;flex:none">${dots(days, 7)}</div>
          </div>
          <div class="mt16" style="display:flex;gap:8px"><span class="btn ghost" style="width:auto;padding:0 16px;flex:none">${ic('check', 's18')}Morning</span>${read
            ? `<button class="btn ghost press" data-set="">${ic('check', 's18')}Tonight</button>`
            : `<button class="btn press" data-set="read">Read tonight</button>`}</div>
        </div>
        ${secHead('How it breaks down')}
        <div class="card pad16 rows">
          ${item(ph('payslip', 'center 78%'), 'Today’s move', 'Finish the P87, £840 to the deposit', chip('6 min'))}
          ${item(ph('aimdesk', 'center 66%'), 'This month’s gambit', 'Move £800 into the Lifetime ISA', chip('Nov', 'q'))}
        </div>
        <button class="link ink mt20" style="font-weight:600">Edit your Aim ${ic('chev', 's16')}</button>
        <p class="callout" style="margin-top:4px">Aims can change, and life keeps the history.</p>
      </div>
    </div>`;
  }

  /* ── This month's gambit: the plan in a few moves ────── */
  const GAMBITS = [
    { photo: 'payslip', pos: 'center 45%', a: 'claim every £ I’m owed', b: 'start a 3-month buffer', t1: 'Claim every £ I’m owed', s1: 'Start with the P87: est. £840 back, one form to go.', t2: 'Start a 3-month buffer', s2: 'Your buffer covers 1.3 months today.' },
    { photo: 'keyshome', pos: 'center 100%', a: 'open a Lifetime ISA', b: 'move £800 in', t1: 'Open a Lifetime ISA', s1: 'A 25% bonus on what you save for a first home.', t2: 'Move £800 in', s2: 'This month’s saving toward the deposit.' },
    { photo: 'desk', pos: '100% center', a: 'raise my design rate by 10%', b: 'send 3 proposals', t1: 'Raise my design rate by 10%', s1: 'Half of the 20% in your Aim.', t2: 'Send 3 proposals', s2: 'At the new rate.' },
  ];
  function gambit(k) {
    const g = GAMBITS[k] || GAMBITS[0];
    const note = t => `<span class="callout" style="display:block;margin-top:2px">${t}</span>`;
    const option = (o, n) => item(ph(o.photo, o.photo === 'desk' ? '78% center' : 'center 78%'), o.t1, `then ${o.t2.charAt(0).toLowerCase()}${o.t2.slice(1)}`, n === k ? `<span class="tick on">${ic('check', 's14')}</span>` : '<span class="tick"></span>', `data-set="${n}"`);
    return `${status()}${pushBar('', round('more', { label: 'More' }))}
    <div class="scroll"><div class="rise">
      <div class="pcard" style="${img(g.photo)};height:260px;background-position:${g.pos}">
        <span class="topline"><span class="chip onphoto">November · for your Aim</span></span>
        <span class="on-photo" style="display:block"><span class="statement" style="display:block">I want to <b>${g.a}</b> and <b>${g.b}</b> this month.</span></span>
      </div>
      ${secHead('This month’s gambit, in moves')}
      <div class="tl">
        <div class="tl-item now"><div class="when">FIRST</div><p>${g.t1}</p>${note(g.s1)}</div>
        <div class="tl-item later"><div class="when">THEN</div><p>${g.t2}</p>${note(g.s2)}</div>
        <div class="tl-item later"><div class="when">WEEKLY CHECK-IN</div><p>Two minutes with life, at a time you choose.</p><div class="mt12">${seg(['Fri 18:00', 'Sat 10:00', 'Sat 17:00', 'Sun 19:00'], 0)}</div></div>
      </div>
      ${secHead('Suggestions from your Aim', 'tap to swap')}
      <div class="card pad16 rows">${GAMBITS.map(option).join('')}</div>
    </div></div>
    ${foot(btn('Commit to this'))}`;
  }

  /* ── A glimpse, earned ───────────────────────────────── */
  function glimpse() {
    const earned = (t, sub) => `<div style="display:flex;gap:10px;align-items:flex-start"><span class="ink" style="margin-top:1px">${ic('checkCircle', 's16')}</span><span class="callout"><span class="ink">${t}</span><br>${sub}</span></div>`;
    return `<div class="full-photo" style="${img('keyshome')};background-size:623px auto;background-position:-62px -333px"></div>
    ${status('on-photo')}
    <header class="bar on-photo"><span class="chip onphoto" style="box-shadow:var(--shadow)">Glimpse · 1 of 3</span><button class="round press" style="background:var(--on-photo);color:#0D0E10;box-shadow:var(--shadow)" aria-label="Close">${ic('close', 's18')}</button></header>
    <div style="flex:1"></div>
    <div class="sheet" style="padding-top:18px">
      <span class="eyebrow">Earned · your Aim, first home, 2029</span>
      <p class="display" style="font-size:46px;line-height:48px;letter-spacing:-2.07px;font-weight:600;margin-top:8px"><b>Your own<br>front door.</b></p>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px">${earned('Opened your Lifetime ISA', '+25% on every £ you save')}${earned('Buffer reached 1 month', 'The safe side of your barbell')}</div>
      <div class="between" style="margin-top:14px"><span class="callout"><span class="ink">Next glimpse at 60%</span><br>Run your rent vs buy numbers</span><button class="btn press" style="width:auto;padding:0 20px;flex:none">Keep going ${ic('arrow', 's18')}</button></div>
    </div>`;
  }

  K.screen('money', { from: '14, 16, 12', note: 'The payslip photograph carries the one big figure, then the month in and out by week, accounts as tiles and today’s payments.', build: money });
  K.screen('subs', { from: '3, 12', note: 'The yearly cost of what you don’t use is the sentence; the two unused ones are tiles counted in days, each with its own Cancel.', build: subs });
  K.screen('area', { from: '17, 14, 15', note: 'How strong in one sentence, missions as two photographs, then the routine and the tools.', build: area });
  K.screen('txn', { from: '14, 12', note: 'The shopping is the picture and the amount sits on it; below, where it lands in this month’s groceries.', build: txn });
  K.screen('bill', { from: '14, 9, 5', note: 'The letter with its date box and amount, then the saving life found and what it will do, in its own voice.', build: bill });
  K.screen('budget', { from: '5, 12, 14', note: 'The month in dots, the tight envelope picked out as a photograph, the rest as calm tiles with meters.', build: budget });
  K.screen('networth', { from: '20, 13, 16', note: 'One figure, then the line leads on a soft green card, then what it is made of in one bar.', build: networth });
  K.screen('connectbank', { from: '6, 9', note: 'A permission primer that says plainly it is a preview: what life could read, and what it never does.', build: connectbank });
  K.screen('vault', { from: '18, 14, 17', note: 'The one renewal to act on sits in front with its letter; the passport is a photograph, the rest count down in date boxes.', build: vault });
  K.screen('docdetail', { from: '14, 5, 19', note: 'The passport itself with the countdown on it, one dot a month, then a timeline of when to act.', build: docdetail });
  K.screen('renewal', { from: '16, 11, 3', note: 'What you pay now beside the better quote still to find, then three steps to tick off.', build: renewal });
  K.screen('aimnew', { from: '6, 7, 11', note: 'One question, an answer life can suggest, and your statement building underneath. Tap the suggestion.', build: s => aimnew(s === 'filled') });
  K.screen('aim', { from: '2, 10, 5', note: 'Your sentence on the sky above your own front door. Pull the sheet up for progress, what it takes and the daily reading. Tap Read tonight.', build: s => aim(s === 'read') });
  K.screen('gambit', { from: '19, 14, 21', note: 'The month’s sentence on a photograph, then the plan in three moves. Tap a suggestion to swap it.', build: s => gambit(Number(s) || 0) });
  K.screen('glimpse', { from: '10, 14, 2', note: 'An earned moment: the door and the keys fill the screen, and a sheet says exactly what earned it.', build: glimpse });
})();
