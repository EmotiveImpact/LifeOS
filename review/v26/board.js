// life · V26 board: wires the page up. The markup comes from board-markup.js, and in the bundled
// board.html every screen is already written into the page, so nothing here is needed to see them.
// This file adds what moves: the orb, tap-through states, the review buttons and dark mode.
(() => {
  'use strict';
  const K = window.L26, C = window.L26_CATALOGUE, B = window.L26_BOARD, $ = id => document.getElementById(id);
  const { esc, ic } = K, { extras, done } = B;
  const params = new URLSearchParams(location.search);
  const only = (params.get('only') || '').split(',').filter(Boolean);
  const bare = params.has('bare');
  if (params.get('theme')) document.documentElement.dataset.theme = params.get('theme');
  if (params.has('noanim')) { const st = document.createElement('style'); st.textContent = '.rise>*{animation:none!important}'; document.head.append(st); }
  if (bare) document.body.classList.add('bare');

  if (!bare) {
    if (!$('refs').children.length) $('refs').innerHTML = B.refs();
    if (!$('moves').children.length) $('moves').innerHTML = B.moves();
    $('progress').textContent = B.progress;
  }
  const jump = $('jump');
  if (jump && !only.length) {
    if (jump.options.length < 2) jump.insertAdjacentHTML('beforeend', B.jump());
    jump.onchange = () => { const s = $(jump.value); if (s) s.scrollIntoView({ block: 'start' }); };
  }
  // board.html arrives with every screen already drawn. The dev page and the check view draw them here.
  if (only.length) $('screens').innerHTML = B.screens({ only });
  else if (!$('screens').children.length) $('screens').innerHTML = B.screens();

  function mountOrbs(root) {
    root.querySelectorAll('[data-orb]').forEach(el => {
      if (el.dataset.mounted) return;
      el.dataset.mounted = '1';
      window.mountOrb(el, Number(el.dataset.size) || el.getBoundingClientRect().width || 22, el.dataset.orb);
    });
  }
  function build(slotEl, state, keepScroll) {
    const key = slotEl.dataset.key, def = K.screens[key];
    if (!def) return;
    const screen = slotEl.querySelector('.screen'), sc = screen.querySelector('.scroll'), top = keepScroll && sc ? sc.scrollTop : 0;
    if (screen._stop) { screen._stop(); screen._stop = null; }
    slotEl.dataset.state = state || '';
    try { screen.innerHTML = def.build(state || ''); } catch (err) { screen.innerHTML = `<div class="pending"><b>Could not draw ${esc(key)}</b><span>${esc(err.message)}</span></div>`; console.error('V26 screen failed: ' + key, err); }
    if (keepScroll) { screen.querySelectorAll('.rise').forEach(n => n.classList.remove('rise')); const s2 = screen.querySelector('.scroll'); if (s2) s2.scrollTop = top; }
    mountOrbs(screen);
    if (def.mount) screen._stop = def.mount(screen, state || '') || null;
    slotEl.dataset.built = '1';
  }
  const slots = [...document.querySelectorAll('.slot')];
  const io = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting && !e.target.dataset.built) build(e.target, ''); }), { rootMargin: '900px 400px' });
  slots.forEach(s => { if (K.screens[s.dataset.key]) { if (only.length) build(s, ''); else io.observe(s); } });
  // Fallback for hosts that do not deliver intersection callbacks: build what is near the viewport on scroll.
  if (!only.length) {
    let wait = null;
    const sweep = () => { wait = null; slots.forEach(s => { if (s.dataset.built || !K.screens[s.dataset.key]) return; const r = s.getBoundingClientRect(); if (r.bottom > -900 && r.top < innerHeight + 900) build(s, ''); }); };
    addEventListener('scroll', () => { if (!wait) wait = setTimeout(sweep, 120); }, { passive: true });
    setTimeout(sweep, 300);
  }
  // Orbs inside a screen are mounted when that screen is built. Only the board's own are mounted here.
  [...document.querySelectorAll('[data-orb]')].filter(el => !el.closest('.slot')).forEach(el => mountOrbs(el.parentNode));

  /* In-screen interactions shared by every screen */
  $('screens').addEventListener('click', e => {
    const screen = e.target.closest('.screen');
    if (!screen) return;
    const set = e.target.closest('[data-set]');
    if (set) return build(screen.closest('.slot'), set.dataset.set, true);
    const a = e.target.closest('[data-acc]');
    if (a) {
      const acc = a.parentElement, open = !acc.hasAttribute('open');
      acc.parentElement.querySelectorAll(':scope > .acc').forEach(x => { x.removeAttribute('open'); x.querySelector('.round').innerHTML = ic('add', 's16'); });
      if (open) { acc.setAttribute('open', ''); acc.querySelector('.round').innerHTML = ic('remove', 's16'); }
      return;
    }
    const one = e.target.closest('.filters button, .wheel button, .seg button');
    if (one) one.parentElement.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === one)));
    const sw = e.target.closest('.sw');
    if (sw) sw.setAttribute('aria-pressed', String(sw.getAttribute('aria-pressed') !== 'true'));
    const chk = e.target.closest('.check');
    if (chk) { const on = !chk.classList.contains('on'); chk.classList.toggle('on', on); const t = chk.querySelector('.tick'); t.classList.toggle('on', on); t.innerHTML = on ? ic('check', 's14') : ''; }
  });

  /* Review, saved in this browser */
  const STORE = 'life-v26-review';
  let review = {};
  try { review = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch { review = {}; }
  const paint = s => { const t = s.querySelector('.rv textarea'); if (!t) return; const r = review[s.dataset.key] || {}; if (r.verdict) s.dataset.verdict = r.verdict; else delete s.dataset.verdict; t.hidden = r.verdict !== 'fix'; if (document.activeElement !== t) t.value = r.note || ''; };
  const tally = () => { if (bare) return; const v = Object.values(review); $('n-ok').textContent = v.filter(x => x.verdict === 'ok').length; $('n-fix').textContent = v.filter(x => x.verdict === 'fix').length; };
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(review)); } catch { /* keep in memory */ } tally(); };
  slots.forEach(paint); tally();
  document.addEventListener('click', e => {
    const b = e.target.closest('.rv [data-v]');
    if (b) { const s = b.closest('.slot'), k = s.dataset.key, cur = review[k] || {}; review[k] = { ...cur, verdict: cur.verdict === b.dataset.v ? undefined : b.dataset.v }; paint(s); save(); if (review[k].verdict === 'fix') s.querySelector('.rv textarea').focus(); return; }
    const th = e.target.closest('[data-theme-set]');
    if (th) { document.documentElement.dataset.theme = th.dataset.themeSet; document.querySelectorAll('[data-theme-set]').forEach(x => x.setAttribute('aria-pressed', String(x === th))); return; }
    if (e.target.closest('#next')) { const n = slots.find(s => K.screens[s.dataset.key] && !(review[s.dataset.key] || {}).verdict); if (n) n.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
    if (e.target.closest('#copy')) {
      const live = slots.filter(s => K.screens[s.dataset.key]);
      const ok = live.filter(s => (review[s.dataset.key] || {}).verdict === 'ok').map(s => s.dataset.key);
      const fix = live.filter(s => (review[s.dataset.key] || {}).verdict === 'fix');
      const text = ['V26 review', 'Approved (' + ok.length + '): ' + (ok.join(', ') || '—'), 'Needs work (' + fix.length + '):', ...fix.map(s => '- ' + s.dataset.key + ' (' + s.dataset.name + '): ' + ((review[s.dataset.key].note || '').trim() || 'no note')), 'Not reviewed yet: ' + (live.length - ok.length - fix.length)].join('\n');
      const show = () => { const d = document.createElement('div'); d.className = 'copied'; d.innerHTML = '<div><b>Copied. Paste this to Claude.</b><textarea readonly></textarea><button type="button">Close</button></div>'; d.querySelector('textarea').value = text; d.addEventListener('click', ev => { if (ev.target === d || ev.target.closest('button')) d.remove(); }); document.body.append(d); d.querySelector('textarea').select(); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(show, show); else show();
    }
  });
  document.addEventListener('input', e => { const t = e.target.closest('.rv textarea'); if (!t) return; const k = t.closest('.slot').dataset.key; review[k] = { ...(review[k] || {}), note: t.value }; save(); });
  window.__V26 = { buildAll: () => slots.forEach(s => { if (!s.dataset.built && K.screens[s.dataset.key]) build(s, ''); }), catalogue: C.rows.length, redesigned: done, extras: extras.length, slots: slots.length, missing: C.rows.filter(r => !K.screens[r.key]).map(r => r.key) };
})();
