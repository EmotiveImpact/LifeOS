// Builds the repeated pieces of the mockups: phone frames, icons and the ten-dot orb.
const ICONS = {
  check: '<path d="M20 6 9 17l-5-5"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11"/>',
  phone: '<rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
  download: '<path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/>',
  ask: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2.5 21.5Z"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.3 2.4c-.5.2-.8.6-.8 1.1v.5"/><path d="M12 16.5h.01"/>',
  ban: '<circle cx="12" cy="12" r="9"/><path d="m5.7 5.7 12.6 12.6"/>',
  heart: '<path d="M22 12h-4l-3 8L9 4l-3 8H2"/>',
  mic: '<rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M19 10.5v1a7 7 0 0 1-14 0v-1"/><path d="M12 18.5v3"/>',
  arrow: '<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  swap: '<path d="m16 3 4 4-4 4"/><path d="M20 7H4"/><path d="m8 21-4-4 4-4"/><path d="M4 17h16"/>',
  file: '<path d="M14.5 2.5H7a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M14 2.5V7h5"/><path d="M9 13h6"/><path d="M9 17h6"/>',
  cal: '<rect x="3.5" y="4.5" width="17" height="16" rx="2.5"/><path d="M8 2.5v4M16 2.5v4M3.5 10h17"/>',
  moon: '<path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z"/>',
  layers: '<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 13 9 5 9-5"/>',
  shield: '<path d="M12 21.5c4-1.5 7.5-4.2 7.5-9V5.8L12 3 4.5 5.8v6.7c0 4.8 3.5 7.5 7.5 9Z"/><path d="m9 12 2 2 4-4"/>',
  bell: '<path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 7.5 2.5 7.5h-17S6 15 6 9Z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  menu: '<path d="M4 8h16"/><path d="M4 16h16"/>',
};
const STATUS = '<svg viewBox="0 0 70 12" fill="currentColor"><rect x="0" y="7.5" width="3" height="4" rx="1"/><rect x="4.6" y="5.5" width="3" height="6" rx="1"/><rect x="9.2" y="3.2" width="3" height="8.3" rx="1"/><rect x="13.8" y="0.8" width="3" height="10.7" rx="1"/>' +
  '<path d="M29 3.2c2.3 0 4.4.9 6 2.4l1.2-1.2A10.2 10.2 0 0 0 29 1.5c-2.8 0-5.3 1.1-7.2 2.9L23 5.6c1.6-1.5 3.7-2.4 6-2.4Zm0 3.3c1.4 0 2.6.5 3.6 1.4l1.2-1.2A6.9 6.9 0 0 0 29 4.8c-1.9 0-3.6.7-4.8 1.9l1.2 1.2c1-.9 2.2-1.4 3.6-1.4Zm0 3.3c.5 0 .9.2 1.2.5L29 11.5l-1.2-1.2c.3-.3.7-.5 1.2-.5Z"/>' +
  '<rect x="42.5" y="1" width="23" height="10.5" rx="3.2" fill="none" stroke="currentColor" stroke-opacity=".4"/><rect x="44.5" y="3" width="17" height="6.5" rx="1.6"/><path d="M67.2 4.6c.8.3 1.3 1 1.3 1.7s-.5 1.4-1.3 1.7Z" fill-opacity=".45"/></svg>';

document.querySelectorAll('[data-phone]').forEach((el) => {
  const w = el.dataset.w || 320;
  el.classList.add('phone');
  el.style.setProperty('--w', w + 'px');
  if (el.dataset.sb) el.style.setProperty('--sb', el.dataset.sb);
  const over = el.hasAttribute('data-over') ? ' over' : '';
  const ink = el.dataset.sbink ? ` style="color:${el.dataset.sbink}"` : '';
  el.innerHTML = `<div class="screen"><div class="island"></div><div class="sb${over}"${ink}><span>9:41</span>${STATUS}</div><img src="/assets/img/screen-${el.dataset.phone}.webp" alt=""></div>`;
});

document.querySelectorAll('svg[data-ic]').forEach((el) => {
  el.setAttribute('viewBox', '0 0 24 24');
  el.classList.add('ic');
  el.innerHTML = ICONS[el.dataset.ic] || '';
});

// The orb: ten dots on a still ring, the first at 12 o'clock, one per area. Lit areas glow ember.
const AREAS = ['Money', 'Home', 'Work', 'Body', 'Food', 'People', 'Admin', 'Learning', 'Goals', 'You'];
document.querySelectorAll('[data-orb]').forEach((el) => {
  const size = +el.dataset.orb;
  const lit = (el.dataset.lit || '').split(',').filter(Boolean).map(Number);
  const dot = +(el.dataset.dot || size * 0.06);
  const ring = size / 2 - dot * 1.6;
  const labels = el.hasAttribute('data-labels');
  const ink = el.dataset.ink || 'currentColor';
  const ember = el.dataset.ember || '#E5532B';
  const pad = labels ? 120 : dot * 2;
  const box = size + pad * 2;
  const c = box / 2;
  let s = `<svg viewBox="0 0 ${box} ${box}" width="${box}" height="${box}" style="overflow:visible" aria-hidden="true">`;
  let ringSvg = '', labelSvg = '', order = 0;
  s += `<defs><radialGradient id="glow${size}"><stop offset="0" stop-color="${ember}" stop-opacity=".55"/><stop offset="1" stop-color="${ember}" stop-opacity="0"/></radialGradient></defs>`;
  AREAS.forEach((name, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / 10;
    const x = c + ring * Math.cos(a), y = c + ring * Math.sin(a);
    const on = lit.includes(i);
    if (on) ringSvg += `<circle class="pulse" style="animation-delay:${(order++) * 0.8}s" cx="${x}" cy="${y}" r="${dot * 3.2}" fill="url(#glow${size})"/>`;
    ringSvg += `<circle cx="${x}" cy="${y}" r="${dot}" fill="${on ? ember : ink}" ${on ? '' : `fill-opacity="${el.dataset.dim || 0.9}"`}/>`;
    if (labels) {
      const lr = ring + dot + 30;
      const lx = c + lr * Math.cos(a), ly = c + lr * Math.sin(a);
      const anchor = Math.abs(Math.cos(a)) < 0.2 ? 'middle' : Math.cos(a) > 0 ? 'start' : 'end';
      labelSvg += `<text x="${lx}" y="${ly}" dy="0.35em" text-anchor="${anchor}" class="orb-label${on ? ' on' : ''}">${name}</text>`;
    }
  });
  s += `<g class="ring">${ringSvg}</g>${labelSvg}</svg>`;
  el.innerHTML = s;
});

// ---- Working parts ----
const still = location.search.includes('still');

// Top bar: a soft shadow once the page moves.
const bar = document.querySelector('.bar');
if (bar) {
  const onScroll = () => bar.classList.toggle('scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// Phone menu.
const menuBtn = document.querySelector('.menu-btn');
const panel = document.querySelector('.menu-panel');
if (menuBtn && panel) {
  const set = (open) => {
    panel.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('svg').innerHTML = ICONS[open ? 'x' : 'menu'];
  };
  menuBtn.addEventListener('click', () => set(!panel.classList.contains('open')));
  panel.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => set(false)));
}

// Waitlist forms. Previews only: nothing is sent or saved.
document.querySelectorAll('form[data-waitlist]').forEach((form) => {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = form.querySelector('input');
    if (!input.checkValidity()) { input.reportValidity(); return; }
    form.classList.add('done');
    form.innerHTML = `<div class="thanks" role="status"><svg viewBox="0 0 24 24" class="ic">${ICONS.check}</svg>You’re on the list. We’ll email you the day Life opens.</div>`;
    const note = form.nextElementSibling;
    if (note && note.classList.contains('fine')) note.textContent = 'Preview only: this address hasn’t been sent or saved anywhere.';
  });
});

// Monthly or yearly.
document.querySelectorAll('[data-plans]').forEach((box) => {
  const amt = box.querySelector('[data-amt]'), per = box.querySelector('[data-per]');
  const plans = {
    yearly: ['£79.99', 'a year', '£6.67 a month, billed yearly. Or £7.99 month to month.'],
    monthly: ['£7.99', 'a month', 'Cancel any time. Or £79.99 a year, which works out at £6.67 a month.'],
  };
  box.querySelectorAll('[data-plan]').forEach((b) => b.addEventListener('click', () => {
    box.querySelectorAll('[data-plan]').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', String(x === b)); });
    const [p, unit, line] = plans[b.dataset.plan];
    amt.innerHTML = `${p}<small>${unit}</small>`;
    per.textContent = line;
  }));
});

// Move deck: tick takes it on, cross leaves it, swap shows another.
document.querySelectorAll('[data-deck]').forEach((deck) => {
  const cards = [...deck.querySelectorAll('.photo')];
  const hint = document.querySelector('[data-deck-hint]');
  let i = cards.findIndex((c) => c.classList.contains('on'));
  const words = { take: 'Taken on. It’s in today’s plan.', leave: 'Left for another day.', swap: 'Here’s another move.' };
  document.querySelectorAll('[data-deck-act]').forEach((b) => b.addEventListener('click', () => {
    cards[i].classList.remove('on');
    i = (i + 1) % cards.length;
    cards[i].classList.add('on');
    if (hint) hint.textContent = words[b.dataset.deckAct];
  }));
});

// Arrivals as the page scrolls.
const appearSel = ['section .eyebrow', 'section .sh', 'section .sl', '.step', '.areas .photo', '.feature .copy', '.feature .art', '.private', '.plan', '.included', '.faq .q',
  '.talk .pic', '.filedlist .row', '.arealist', '.sleep', '.band', '.cols .c', '.price', '.how .c', '.phones', '.notes .n', '.bento .t', '.plist .p', '.notify [data-orb]'];
if (!still && 'IntersectionObserver' in window) {
  const els = document.querySelectorAll(appearSel.join(','));
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
  }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  els.forEach((el) => {
    const sibs = [...el.parentElement.children].filter((c) => c.matches(appearSel.join(',')));
    el.style.transitionDelay = Math.min(sibs.indexOf(el), 5) * 70 + 'ms';
    el.setAttribute('data-appear', '');
    io.observe(el);
  });
}
