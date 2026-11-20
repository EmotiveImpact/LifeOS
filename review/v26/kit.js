// life · V26 kit. Shared helpers and the screen registry. See KIT.md.
(() => {
  'use strict';
  const I = window.LIFE_ICONS;
  const ic = (n, c = '') => `<svg class="i ${c}" viewBox="0 0 24 24" aria-hidden="true">${I[n] || ''}</svg>`;
  const JPG = ['food', 'sky', 'run', 'keyshome', 'journal', 'friends', 'bench', 'birthday', 'gotit', 'aimwrite', 'areahome', 'areawork', 'aimdesk', 'movein', 'sunday', 'freedom', 'calmdesk', 'vantage', 'calm', 'breakfast', 'wrap', 'snack', 'cook', 'label', 'payslip', 'letter', 'passport', 'bedroom', 'walk', 'breathe', 'siblings'];
  const img = n => `background-image:url('img/${n}.${JPG.includes(n) ? 'jpg' : 'webp'}')`;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ── Kit ─────────────────────────────────────────────── */
  const status = (cls = '') => `<div class="status ${cls}"><span>9:41</span><div class="island"></div><span class="sys"><em></em><i></i></span></div>`;
  const round = (icon, opt = {}) => `<button class="round press ${opt.cls || ''}" aria-label="${opt.label || icon}">${ic(icon, 's18')}${opt.dot ? '<span class="dot"></span>' : ''}</button>`;
  const rootBar = (label, sub, acts) => `<header class="bar"><div class="bar-id"><span class="orb22" data-orb="ring"></span><b>${label}</b>${sub ? `<span>${sub}</span>` : ''}</div><div class="acts">${acts}</div></header>`;
  const pushBar = (title, right = '', left = 'back') => `<header class="bar push">${round(left, { label: left === 'back' ? 'Back' : 'Close' })}<b>${title}</b><div class="acts">${right}</div></header>`;
  const textBar = (l, r) => `<header class="bar"><button class="txt">${l}</button><button class="txt">${r}</button></header>`;
  const dock = active => `<nav class="dock" aria-label="life"><div class="dock-pill">${[['Today', 'home'], ['Plan', 'layers'], ['You', 'person'], ['Talk', 'mic']].map(([t, i]) => `<button class="press" ${t === active ? 'aria-current="page"' : ''} aria-label="${t}">${ic(i)}<span>${t}</span></button>`).join('')}</div></nav>`;
  const ruler = (pct, n = 36) => `<div class="ruler" aria-hidden="true">${Array.from({ length: n }, (_, k) => `<i class="${k < Math.round(pct / 100 * n) ? 'on' : ''}"></i>`).join('')}</div>`;
  const row = (icon, title, sub, end = '') => `<button class="row press"><span class="ic">${ic(icon, 's18')}</span><span class="mid"><b>${title}</b><span>${sub}</span></span>${end || `<span class="chev">${ic('chev', 's16')}</span>`}</button>`;
  const days14 = bits => `<div class="days14" aria-hidden="true">${bits.split('').map(b => `<i class="${b === '1' ? 'on' : ''}"></i>`).join('')}</div>`;
  const dots = (cells, cols) => `<div class="dots" style="grid-template-columns:repeat(${cols},1fr)" aria-hidden="true">${cells.map(c => `<i class="${c}"></i>`).join('')}</div>`;
  const wave = n => `<span class="wave" aria-hidden="true">${Array.from({ length: n }, (_, k) => `<i style="height:${4 + Math.round(Math.abs(Math.sin(k * 1.7) * Math.cos(k * .6)) * 14)}px"></i>`).join('')}</span>`;
  function spark(v, lo, hi) {
    const W = 118, H = 44, pad = 6, min = Math.min(...v, lo), max = Math.max(...v, hi);
    const x = k => pad + k * (W - pad * 2) / (v.length - 1), y = n => H - pad - (n - min) / (max - min || 1) * (H - pad * 2);
    return `<svg class="spark" viewBox="0 0 ${W} ${H}" aria-hidden="true"><rect x="0" y="${y(hi)}" width="${W}" height="${y(lo) - y(hi)}" rx="6" fill="var(--surface2)"/><polyline points="${v.map((n, k) => x(k) + ',' + y(n)).join(' ')}" fill="none" stroke="var(--ink)" stroke-width="1.6" stroke-linejoin="round"/>${v.map((n, k) => `<circle cx="${x(k)}" cy="${y(n)}" r="${k === v.length - 1 ? 3.6 : 2.6}" fill="${k === v.length - 1 ? 'var(--ink)' : 'var(--surface)'}" stroke="var(--ink)" stroke-width="1.6"/>`).join('')}</svg>`;
  }
  function caps(weeks) {
    const W = 330, H = 150, mid = 82, max = Math.max(...weeks.flatMap(w => [w.in, w.out])), col = W / weeks.length, bw = 34, sc = 72 / max;
    return `<svg class="caps" viewBox="0 0 ${W} ${H}" role="img" aria-label="Money coming in and going out, by week">${weeks.map((w, k) => {
      const cx = col * k + col / 2, hi = Math.max(w.in * sc, 8), ho = Math.max(w.out * sc, 8);
      return `${w.in ? `<rect x="${cx - bw / 2}" y="${mid - 3 - hi}" width="${bw}" height="${hi}" rx="${Math.min(15, hi / 2)}" fill="var(--ink)" opacity="${w.now ? 1 : .22}"/>` : `<circle cx="${cx}" cy="${mid - 8}" r="3" fill="var(--surface3)"/>`}<rect x="${cx - bw / 2}" y="${mid + 3}" width="${bw}" height="${ho}" rx="${Math.min(15, ho / 2)}" fill="var(--ink2)" opacity="${w.now ? .9 : .25}"/><text x="${cx}" y="${H - 2}" text-anchor="middle" font-size="11" font-weight="600" fill="var(--${w.now ? 'ink' : 'quiet'})">${w.l}</text>`;
    }).join('')}</svg>`;
  }
  const scale = (marks) => `<div class="scale" aria-hidden="true"><span class="track"></span>${[0, 25, 50, 75, 100].map(p => `<span class="tick" style="left:${p}%"></span>`).join('')}${marks.map((p, k) => `<span class="mark ${k < marks.length - 1 ? 'old' : ''}" style="left:${p}%"></span>`).join('')}</div><div class="scale-ends"><span>NO</span><span>YES</span></div>`;


  /* ── More helpers ─────────────────────────────────────── */
  const sheetBar = (title, right = '') => `<div class="handle"></div><header class="bar push" style="grid-template-columns:40px 1fr 40px"><span>${right}</span><b>${title}</b>${round('close', { label: 'Close' })}</header>`;
  const foot = html => `<div class="foot">${html}</div>`;
  const btn = (label, o = {}) => `<button class="btn press ${o.ghost ? 'ghost' : ''} ${o.sm ? 'sm' : ''}" ${o.set !== undefined ? `data-set="${o.set}"` : ''}>${o.icon && !o.trail ? ic(o.icon, 's18') : ''}${label}${o.icon && o.trail ? ic(o.icon, 's18') : ''}</button>`;
  const secHead = (title, link = '') => `<div class="sec-head"><h4>${title}</h4>${link ? `<span class="link">${link}</span>` : ''}</div>`;
  const chip = (text, tone = '') => `<span class="chip ${tone}">${text}</span>`;
  const orb = (state = 'ring', size = 22) => `<span data-orb="${state}" data-size="${size}" style="width:${size}px;height:${size}px;display:block;flex:none;color:var(--ink)"></span>`;
  const says = text => `<div class="body" style="display:flex;gap:10px">${orb('ring', 20)}<span class="ink">${text}</span></div>`;
  const tile = o => `<${o.plain ? 'div' : 'button'} class="tile ${o.wide ? 'wide' : ''} ${o.plain ? '' : 'press'}"><span class="th"><span>${o.dot ? `<i style="background:var(--a-${o.dot})"></i>` : ''}${o.label}</span>${o.unit ? `<em>${o.unit}</em>` : ''}</span>${o.value !== undefined ? `<span class="num">${o.value}${o.small ? `<small>${o.small}</small>` : ''}</span>` : ''}${o.sub ? `<span class="sub">${o.sub}</span>` : ''}${o.extra || ''}</${o.plain ? 'div' : 'button'}>`;
  const metric = o => `<button class="metric press"><span class="name"><span>${o.icon ? ic(o.icon, 's18') : ''}${o.name}</span>${o.tag ? `<span class="chip ${o.tone || 'q'}">${o.tag}</span>` : ''}</span><span><span class="val">${o.value}<small>${o.unit || ''}</small></span><span class="delta" style="display:block">${o.delta || ''}</span></span>${spark(o.series, o.lo, o.hi)}</button>`;
  const dateRow = (day, mon, title, sub, when = '') => `<button class="row press"><span class="datebox"><b>${day}</b><small>${mon}</small></span><span class="mid"><b>${title}</b><span>${sub}</span></span>${when ? `<span class="callout">${when}</span>` : ''}</button>`;
  const thumbRow = (photo, title, sub, end = '') => `<button class="row press"><span class="thumb" style="${img(photo)}"></span><span class="mid"><b>${title}</b><span>${sub}</span></span>${end || `<span class="chev">${ic('chev', 's16')}</span>`}</button>`;
  const pick = (label, value, set = false) => `<button class="pick press">${label}<span class="${set ? 'set' : ''}">${value} ${ic('more', 's16')}</span></button>`;
  const check = (text, on = false) => `<button class="check press ${on ? 'on' : ''}"><span class="tick ${on ? 'on' : ''}">${on ? ic('check', 's14') : ''}</span><span>${text}</span></button>`;
  const acc = (title, count, body, open = false) => `<div class="acc" ${open ? 'open' : ''}><button class="acc-head" data-acc><b>${title}${count !== '' && count !== undefined ? `<span>${count}</span>` : ''}</b><span class="round sm">${ic(open ? 'remove' : 'add', 's16')}</span></button><div class="acc-body">${body}</div></div>`;
  const kv = (label, value) => `<div class="between" style="padding:7px 0"><span class="body">${label}</span><span class="title" style="font-size:15px">${value}</span></div>`;
  const voice = time => `<div class="voice"><span class="round sm solid">${ic('play', 's14')}</span>${wave(22)}<span>${time}</span></div>`;
  const month = cells => `<div class="month">${['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => `<small>${d}</small>`).join('')}${cells.map(c => `<i class="${c}"></i>`).join('')}</div>`;
  /** Tall bars for a week or a set of readings. `now` is the index picked out in ink. */
  function bars(values, o = {}) {
    const W = o.w || 330, H = o.h || 120, max = Math.max(...values, o.max || 0), col = W / values.length, bw = Math.min(30, col - 8), now = o.now ?? values.length - 1;
    return `<svg class="caps" style="height:${H}px" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || 'Chart')}">${values.map((v, k) => { const h = Math.max(6, v / max * (H - 26)); return `<rect x="${col * k + col / 2 - bw / 2}" y="${H - 20 - h}" width="${bw}" height="${h}" rx="${Math.min(bw / 2, h / 2)}" fill="${o.color || 'var(--ink)'}" opacity="${k === now ? 1 : (o.dim ?? .2)}"/>${o.labels ? `<text x="${col * k + col / 2}" y="${H - 4}" text-anchor="middle" font-size="11" font-weight="600" fill="var(--${k === now ? 'ink' : 'quiet'})">${o.labels[k]}</text>` : ''}`; }).join('')}</svg>`;
  }
  /** A wide trend line with the shaded band for the person's own normal range. */
  function line(values, lo, hi, o = {}) {
    const W = o.w || 330, H = o.h || 120, pad = 10, min = Math.min(...values, lo), max = Math.max(...values, hi);
    const x = k => pad + k * (W - pad * 2) / (values.length - 1), y = n => H - pad - (n - min) / (max - min || 1) * (H - pad * 2);
    return `<svg class="caps" style="height:${H}px" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || 'Trend against your normal range')}"><rect x="0" y="${y(hi)}" width="${W}" height="${y(lo) - y(hi)}" rx="10" fill="${o.band || 'var(--surface2)'}"/><polyline points="${values.map((n, k) => x(k) + ',' + y(n)).join(' ')}" fill="none" stroke="${o.color || 'var(--ink)'}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/><circle cx="${x(values.length - 1)}" cy="${y(values[values.length - 1])}" r="5" fill="${o.color || 'var(--ink)'}"/></svg>`;
  }

  const toggle = (on = false, label = 'Toggle') => `<button class="sw" role="switch" aria-pressed="${on}" aria-label="${esc(label)}"></button>`;
  const slider = pct => `<div class="slider" aria-hidden="true"><span class="tr"></span><span class="fl" style="width:${pct}%"></span><span class="kn" style="left:${pct}%"></span></div>`;
  const stepper = (value, unit = '') => `<div class="stepper">${round('remove', { label: 'Fewer' })}<span class="xl">${value}${unit ? `<small>${unit}</small>` : ''}</span>${round('add', { label: 'More' })}</div>`;
  const seg = (opts, active = 0) => `<div class="seg" role="group">${opts.map((o, k) => `<button aria-pressed="${k === active}">${o}</button>`).join('')}</div>`;
  const filters = (opts, active = 0) => `<div class="filters" role="group">${opts.map((o, k) => `<button aria-pressed="${k === active}">${o}</button>`).join('')}</div>`;
  const wheel = (opts, active = 1) => `<div class="wheel">${opts.map((o, k) => `<button aria-pressed="${k === active}">${o}</button>`).join('')}</div>`;
  const field = (label, value, placeholder = '') => `<div class="field-in"><small>${label}</small><b class="${value ? '' : 'ph'}">${value || placeholder}</b></div>`;
  const avatar = (text, lg = false) => `<span class="avatar ${lg ? 'lg' : ''}">${text}</span>`;
  const bubble = text => `<div class="bubble">${text}</div>`;

  /* ── The feeling check: move the orb around a card until it feels right ── */
  const MOODS = {
    calm: { name: 'Calm', photo: 'desk', head: 'A clear head today.', line: 'Good day for the form you’ve been putting off.', at: [.72, .52] },
    driven: { name: 'Driven', photo: 'run', head: 'You’ve got energy.', line: 'Put it into your one bigger move.', at: [.74, .2] },
    restless: { name: 'Restless', photo: 'walk', head: 'Let’s burn it off.', line: 'Three five-minute wins first.', at: [.26, .2] },
    anxious: { name: 'Anxious', photo: 'breathe', head: 'Let’s make it smaller.', line: 'Only what’s due this week is showing.', at: [.22, .52] },
    drained: { name: 'Drained', photo: 'calm', head: 'Go gently today.', line: 'One small thing, then rest.', at: [.26, .84] },
    peaceful: { name: 'Peaceful', photo: 'journal', head: 'A soft, steady day.', line: 'Health and home come first.', at: [.74, .84] },
  };
  const moodAt = (x, y) => y < .36 ? (x < .5 ? 'restless' : 'driven') : y < .68 ? (x < .42 ? 'anxious' : 'calm') : (x < .5 ? 'drained' : 'peaceful');
  /** The field. Pair it with elements marked data-feel-word, data-feel-line and a button with data-feel-set="prefix". */
  const feel = (id = 'calm', o = {}) => `<div class="feel ${o.tall ? 'tall' : ''}" ${o.h ? `style="height:${o.h}px"` : ''} data-feel="${id}" role="slider" tabindex="0" aria-label="How you are arriving. Move around to find it." aria-valuetext="${MOODS[id].name}">
    <span class="feel-photo on" style="${img(MOODS[id].photo)}"></span><span class="feel-photo"></span>
    <span class="feel-dots" aria-hidden="true">${'<i></i>'.repeat(o.tall ? 165 : 110)}</span>
    <span class="feel-ax t">Energised</span><span class="feel-ax b">Drained</span><span class="feel-ax l">Tense</span><span class="feel-ax r">Easy</span>
    <span class="feel-orb" data-orb="ring" data-size="26" style="left:${MOODS[id].at[0] * 100}%;top:${MOODS[id].at[1] * 100}%"></span></div>`;
  function feelMount(root) {
    const f = root.querySelector('.feel');
    if (!f) return null;
    const dots = [...f.querySelectorAll('.feel-dots i')], handle = f.querySelector('.feel-orb'), layers = [...f.querySelectorAll('.feel-photo')], cols = 11, rows = dots.length / cols;
    let cur = f.dataset.feel, top = 0, pos = MOODS[cur].at.slice(), down = false;
    function place(x, y) {
      x = Math.min(.95, Math.max(.05, x)); y = Math.min(.94, Math.max(.06, y)); pos = [x, y];
      handle.style.left = x * 100 + '%'; handle.style.top = y * 100 + '%';
      const w = f.clientWidth || 330, h = f.clientHeight || 280;
      dots.forEach((d, k) => { const cx = (k % cols + .5) / cols, cy = (Math.floor(k / cols) + .5) / rows, near = Math.max(0, 1 - Math.hypot((cx - x) * w, (cy - y) * h) / 118); d.style.transform = 'scale(' + (.55 + near * near * 2.2).toFixed(2) + ')'; d.style.opacity = (.2 + near * .8).toFixed(2); });
      const id = moodAt(x, y);
      if (id === cur) return;
      cur = id; f.dataset.feel = id; const m = MOODS[id];
      top = 1 - top; layers[top].setAttribute('style', img(m.photo)); layers[top].classList.add('on'); layers[1 - top].classList.remove('on');
      f.setAttribute('aria-valuetext', m.name);
      root.querySelectorAll('[data-feel-word]').forEach(n => { n.textContent = m.name.toLowerCase(); });
      root.querySelectorAll('[data-feel-line]').forEach(n => { n.textContent = m.head + ' ' + m.line; });
      root.querySelectorAll('[data-feel-set]').forEach(n => { n.dataset.set = n.dataset.feelSet + id; });
    }
    const at = e => { const r = f.getBoundingClientRect(); place((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height); };
    const pd = e => { down = true; if (f.setPointerCapture) { try { f.setPointerCapture(e.pointerId); } catch { /* not capturable */ } } at(e); e.preventDefault(); };
    const pm = e => { if (down) at(e); }, pu = () => { down = false; };
    const key = e => { const step = { ArrowLeft: [-.08, 0], ArrowRight: [.08, 0], ArrowUp: [0, -.08], ArrowDown: [0, .08] }[e.key]; if (step) { place(pos[0] + step[0], pos[1] + step[1]); e.preventDefault(); } };
    f.addEventListener('pointerdown', pd); f.addEventListener('pointermove', pm); f.addEventListener('pointerup', pu); f.addEventListener('pointercancel', pu); f.addEventListener('keydown', key);
    place(pos[0], pos[1]);
    return () => { f.removeEventListener('pointerdown', pd); f.removeEventListener('pointermove', pm); f.removeEventListener('pointerup', pu); f.removeEventListener('pointercancel', pu); f.removeEventListener('keydown', key); };
  }

  /* ── Registry ─────────────────────────────────────────── */
  const screens = {}, styles = [];
  function screen(key, def) {
    if (screens[key]) throw new Error('Screen registered twice: ' + key);
    if (typeof def.build !== 'function') throw new Error('Screen needs build(): ' + key);
    screens[key] = def;
  }
  /** One-off styles for a chapter. Every selector must start with the chapter prefix, e.g. `.fu-`. Tokens only. */
  function addCss(prefix, css) { styles.push({ prefix, css }); if (typeof document !== 'undefined' && document.head) { const st = document.createElement('style'); st.dataset.v26 = prefix; st.textContent = css; document.head.append(st); } }

  window.L26 = { ic, img, esc, status, round, rootBar, pushBar, textBar, sheetBar, dock, foot, btn, secHead, chip, orb, says, ruler, row, thumbRow, dateRow, tile, metric, pick, check, acc, kv, voice, toggle, slider, stepper, seg, filters, wheel, field, avatar, bubble, days14, dots, month, wave, spark, caps, bars, line, scale, MOODS, moodAt, feel, feelMount, screen, addCss, screens, styles };
})();
