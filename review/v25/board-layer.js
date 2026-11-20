// V25 board layer. Runs after the V23 library has rendered all 221 screens.
(() => {
  'use strict';
  const V = window.LIFE_V25, D = window.LIFE_V25_BOARD, root = document.documentElement;
  if (!V || !D) throw new Error('V25 data missing');
  const isDark = () => root.getAttribute('data-theme') ? root.getAttribute('data-theme') === 'dark' : !matchMedia('(prefers-color-scheme: light)').matches;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* 0. Page text. The V23 library rewrites its own intro after load, so V25's goes on top here. */
  const mark = document.querySelector('.mark');
  if (mark && mark.lastElementChild) mark.lastElementChild.textContent = 'Complete visual board · V25 · for your approval';
  const lead = document.querySelector('.p-lead');
  if (lead) lead.innerHTML = D.lead;
  const showcase = document.getElementById('v21-showcase');
  if (showcase) {
    const set = (sel, text) => { const n = showcase.querySelector(sel); if (n) n.textContent = text; };
    set('.eyebrow', 'V25 · redesigned from the best of every version');
    set('.h-sec', 'Today, Plan, You and Talk.');
    set('.p-sec', 'The four screens you live in, rebuilt from v17’s richness, V19’s order, the calmer mockup’s icons and contrast, and V24’s photographs. Tap them: the check-in collapses, Plan’s filters work, and every row opens the screen it leads to.');
    const note = showcase.querySelector('.v21-board-note');
    if (note) note.innerHTML = '<strong>Naming:</strong> the home heading stays Today; renaming it to life is still your call. <strong>Status:</strong> these are design screens for your approval, not an installed app update.';
    showcase.querySelectorAll('.v23-app-proof').forEach(n => n.remove());
  }
  document.querySelectorAll('.shot-cap .v19-ref-label').forEach(n => { n.textContent = 'V25'; });

  /* 1. The four redesigned screens, each in its own isolated surface. */
  const hosts = [];
  for (const key of Object.keys(V.screens)) {
    const shot = document.getElementById('s-' + key);
    if (!shot) throw new Error('V25 screen missing from the library: ' + key);
    const screen = shot.querySelector('.screen');
    screen.innerHTML = '';
    screen.classList.add('v25-host-screen');
    const host = document.createElement('div');
    host.className = 'v25-host';
    host.dataset.v25Screen = key;
    screen.append(host);
    const sr = host.attachShadow({ mode: 'open' });
    sr.innerHTML = '<style>' + D.css + '</style><div class="screen" data-screen="' + key + '">' + V.screens[key]() + '</div>';
    V.mountOrbs(sr);
    sr.addEventListener('click', e => {
      if (V.interact(e)) { e.stopPropagation(); return; }
      const j = e.target.closest('[data-jump]');
      if (j && typeof window.jump === 'function') { e.stopPropagation(); window.jump(j.dataset.jump); }
    });
    hosts.push(host);
    const cap = shot.querySelector('.shot-cap'), note = D.redesigned[key];
    if (cap && note) {
      const title = cap.querySelector(':scope > b'), desc = title && title.nextElementSibling;
      if (title) title.innerHTML = '<span class="v25-tag new">V25</span>' + esc(note.title);
      if (desc) desc.textContent = note.note;
    }
  }
  const syncTheme = () => hosts.forEach(h => { h.dataset.theme = isDark() ? 'dark' : 'light'; });
  new MutationObserver(syncTheme).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  matchMedia('(prefers-color-scheme: light)').addEventListener('change', syncTheme);
  syncTheme();

  /* 2. Photographs where a screen has none (V24's images, kept). */
  const photoAdded = [];
  for (const [key, photo] of Object.entries(D.photos)) {
    const shot = document.getElementById('s-' + key);
    if (!shot) continue;
    const screen = shot.querySelector('.screen');
    if (screen.querySelector('[style*="background-image"], img, .t-cover, .t-band')) continue;
    const content = screen.querySelector('.v21-content') || screen.querySelector('.scroll, .pad');
    if (!content) continue;
    const pic = document.createElement('div');
    pic.className = 'v25-photo';
    pic.setAttribute('aria-hidden', 'true');
    pic.style.cssText = 'height:168px;border-radius:20px;background:var(--surface-2) center/cover no-repeat;margin:0 0 16px;flex:none;background-image:url("' + window.LIFE_V25_IMG[photo] + '")';
    content.prepend(pic);
    photoAdded.push(key);
  }

  /* 3. Review controls on every screen, saved in this browser. */
  const STORE = 'life-v25-review';
  let review = {};
  try { review = JSON.parse(localStorage.getItem(STORE) || '{}') || {}; } catch { review = {}; }
  const save = () => { try { localStorage.setItem(STORE, JSON.stringify(review)); } catch { /* private window: keep in memory */ } tally(); };
  const shots = [...document.querySelectorAll('.shot')];
  const titles = Object.fromEntries(D.rows.map(r => [r.key, r.title]));
  function paint(shot) {
    const key = shot.id.slice(2), r = review[key] || {};
    const box = shot.querySelector('.v25-review');
    if (!box) return;
    if (r.verdict) { box.dataset.verdict = r.verdict; shot.dataset.v25Verdict = r.verdict; } else { delete box.dataset.verdict; delete shot.dataset.v25Verdict; }
    box.querySelectorAll('[data-v25-verdict]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.v25Verdict === r.verdict)));
    const note = box.querySelector('textarea');
    note.hidden = r.verdict !== 'fix';
    if (document.activeElement !== note) note.value = r.note || '';
  }
  for (const shot of shots) {
    const key = shot.id.slice(2);
    const box = document.createElement('div');
    box.className = 'v25-review';
    const ref = D.refs[key];
    box.innerHTML = '<div class="v25-review-btns" role="group" aria-label="Review ' + esc(titles[key] || key) + '"><button type="button" data-v25-verdict="ok">Approve</button><button type="button" data-v25-verdict="fix">Needs work</button></div>' +
      '<textarea aria-label="What should change on ' + esc(titles[key] || key) + '?" placeholder="What should change?" hidden></textarea>' +
      (ref ? '<p class="v25-ref">Draws on <b>' + esc(ref) + '</b></p>' : '') +
      (photoAdded.includes(key) ? '<p class="v25-ref">V25 adds a photograph here.</p>' : '');
    (shot.querySelector('.shot-cap') || shot).append(box);
    paint(shot);
  }
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-v25-verdict]');
    if (!b) return;
    e.stopPropagation();
    const shot = b.closest('.shot'), key = shot.id.slice(2), cur = review[key] || {};
    const verdict = cur.verdict === b.dataset.v25Verdict ? undefined : b.dataset.v25Verdict;
    review[key] = { ...cur, verdict };
    if (!verdict && !review[key].note) delete review[key];
    paint(shot); save();
    if (verdict === 'fix') shot.querySelector('.v25-review textarea').focus();
  }, true);
  document.addEventListener('input', e => {
    const t = e.target.closest('.v25-review textarea');
    if (!t) return;
    const key = t.closest('.shot').id.slice(2);
    review[key] = { ...(review[key] || {}), note: t.value };
    save();
  });

  /* 4. The tally: progress, filters, next unreviewed and copy-to-Claude. */
  const bar = document.createElement('div');
  bar.className = 'v25-tally';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Your review');
  bar.innerHTML = '<span><strong data-n="done">0</strong><span class="q"> of ' + shots.length + ' reviewed · </span><strong data-n="ok">0</strong><span class="q"> approved · </span><strong data-n="fix">0</strong><span class="q"> need work</span></span>' +
    '<button type="button" data-v25-filter="open" aria-pressed="false">Hide approved</button><button type="button" data-v25-filter="fix" aria-pressed="false">Only needs work</button>' +
    '<button type="button" data-v25-next>Next to review</button><button type="button" class="primary" data-v25-copy>Copy for Claude</button>';
  document.body.append(bar);
  function tally() {
    const vals = Object.values(review);
    bar.querySelector('[data-n="ok"]').textContent = vals.filter(v => v.verdict === 'ok').length;
    bar.querySelector('[data-n="fix"]').textContent = vals.filter(v => v.verdict === 'fix').length;
    bar.querySelector('[data-n="done"]').textContent = vals.filter(v => v.verdict).length;
  }
  tally();
  bar.addEventListener('click', e => {
    const f = e.target.closest('[data-v25-filter]');
    if (f) {
      const on = f.getAttribute('aria-pressed') !== 'true';
      bar.querySelectorAll('[data-v25-filter]').forEach(x => x.setAttribute('aria-pressed', 'false'));
      document.body.classList.remove('v25-only-open', 'v25-only-fix');
      if (on) { f.setAttribute('aria-pressed', 'true'); document.body.classList.add(f.dataset.v25Filter === 'open' ? 'v25-only-open' : 'v25-only-fix'); }
      return;
    }
    if (e.target.closest('[data-v25-next]')) {
      const next = shots.find(s => !(review[s.id.slice(2)] || {}).verdict);
      if (next) { next.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' }); next.classList.remove('flash'); void next.offsetWidth; next.classList.add('flash'); }
      return;
    }
    if (e.target.closest('[data-v25-copy]')) {
      const lines = ['V25 board review'];
      const ok = shots.map(s => s.id.slice(2)).filter(k => (review[k] || {}).verdict === 'ok');
      const fix = shots.map(s => s.id.slice(2)).filter(k => (review[k] || {}).verdict === 'fix');
      const open = shots.length - ok.length - fix.length;
      lines.push('Approved (' + ok.length + '): ' + (ok.join(', ') || '—'));
      lines.push('Needs work (' + fix.length + '):');
      fix.forEach(k => lines.push('- ' + k + ' (' + (titles[k] || k) + '): ' + ((review[k].note || '').trim() || 'no note')));
      lines.push('Not reviewed yet: ' + open);
      const text = lines.join('\n');
      const done = () => {
        const dlg = document.createElement('div');
        dlg.className = 'v25-copied';
        dlg.innerHTML = '<div><b>Copied. Paste this to Claude.</b><textarea readonly></textarea><button type="button" class="primary">Close</button></div>';
        dlg.querySelector('textarea').value = text;
        dlg.addEventListener('click', ev => { if (ev.target === dlg || ev.target.closest('button')) dlg.remove(); });
        document.body.append(dlg);
        dlg.querySelector('textarea').select();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, done); else done();
    }
  });

  window.__V25_AUDIT = {
    version: 25,
    renderedScreens: shots.length,
    uniqueKeys: new Set(shots.map(s => s.id)).size,
    redesigned: hosts.map(h => h.dataset.v25Screen),
    photographsAdded: photoAdded,
    referenceTags: shots.filter(s => D.refs[s.id.slice(2)]).length,
    reviewControls: document.querySelectorAll('.v25-review').length,
    missingKeys: D.rows.map(r => r.key).filter(k => !document.getElementById('s-' + k)),
  };
})();
