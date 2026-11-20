// life · V26 — Learn from the best, Teach me, Grow. Written against review/v26/KIT.md.
// Ideas, lenses and moments lead with photographs. Lesson pictures stay drawn, after FENNY_LEARNING.md §4:
// one idea per picture, one line weight, round ends, one lit thing (ember is the thing that changes), clean or hand-drawn.
(() => {
  'use strict';
  const K = window.L26;
  const { ic, img, status, round, rootBar, pushBar, foot, btn, secHead, chip, orb, says, row, thumbRow, tile, bubble, dots, days14, filters } = K;

  K.addCss('.lt-', `
.lt-pic { display: block; width: 100%; height: auto; overflow: visible; }
.lt-mini { display: block; overflow: visible; flex: none; }
.lt-panel { background: var(--surface); border-radius: 20px; box-shadow: var(--shadow); padding: 16px 0 14px; }
.lt-art { display: grid; place-items: center; height: 80px; border-radius: 14px; background: var(--surface2); }
.lt-sig { width: 6px; height: 6px; border-radius: 50%; background: var(--ember); display: inline-block; flex: none; }
.lt-face { width: 56px; height: 56px; border-radius: 50%; background: var(--surface); box-shadow: var(--shadow); display: grid; place-items: center; font-size: 16px; font-weight: 600; letter-spacing: -.22px; color: var(--ink); flex: none; }
.lt-lens { flex: 0 0 60px; display: flex; flex-direction: column; align-items: center; gap: 8px; font-size: 13px; line-height: 18px; font-weight: 500; color: var(--ink2); }
.lt-shelf > .pcard { flex: 0 0 150px; }
.lt-shelf.lt-wide > .pcard { flex-basis: 196px; }
.lt-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.lt-opt { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 54px; padding: 10px 16px; border-radius: 16px; background: var(--surface2); font-size: 15px; line-height: 21px; font-weight: 600; letter-spacing: -.15px; }
.lt-opt.lt-card { background: var(--surface); box-shadow: var(--shadow); }
.lt-opt.lt-right { background: var(--gain-tint); box-shadow: none; }
.lt-opt.lt-rest { color: var(--quiet); }
.lt-opt .callout { margin-left: auto; white-space: nowrap; }
.lt-opt .tick { background: var(--gain); color: var(--canvas); }
.lt-ladder { display: flex; gap: 6px; }
.lt-ladder span { flex: 1; height: 32px; border-radius: 10px; background: var(--surface2); display: grid; place-items: center; font-size: 11px; font-weight: 600; color: var(--quiet); font-variant-numeric: tabular-nums; }
.lt-ladder span.lt-at { background: var(--ink); color: var(--canvas); }
.lt-paper { background: var(--surface); border-radius: 20px; box-shadow: var(--shadow); padding: 20px; font-size: 20px; line-height: 28px; letter-spacing: -.4px; font-weight: 500; color: var(--ink); }
.lt-paper.lt-marked { color: var(--ink2); }
.lt-paper b { color: var(--ink); font-weight: 500; }
.lt-caret { display: inline-block; width: 2px; height: 20px; background: var(--ember); vertical-align: -3px; margin-left: 2px; }
.lt-steps { flex: none; display: flex; gap: 4px; padding: 0 20px 10px; }
.lt-steps .bar-track { flex: 1; height: 4px; }
.lt-bite { flex: 0 0 178px; background: var(--surface); border-radius: 20px; box-shadow: var(--shadow); padding: 10px 10px 14px; display: flex; flex-direction: column; }
.lt-bite small { font-size: 11px; line-height: 13px; font-weight: 600; letter-spacing: .1px; color: var(--ink2); margin-top: 12px; padding: 0 4px; }
.lt-bite b { font-size: 15px; line-height: 21px; font-weight: 600; letter-spacing: -.15px; margin-top: 4px; padding: 0 4px; }
.lt-bite span { font-size: 13px; line-height: 18px; color: var(--ink2); padding: 0 4px; }
.lt-dev { background: var(--surface); border-radius: 20px; box-shadow: var(--shadow); padding: 14px 14px 16px; display: flex; flex-direction: column; }
.lt-dev b { font-size: 15px; line-height: 21px; font-weight: 600; letter-spacing: -.15px; margin-top: 10px; }
.lt-dev small { font-size: 13px; line-height: 18px; color: var(--ink2); margin-top: 2px; }
.lt-line { display: flex; gap: 14px; align-items: flex-start; }
.lt-line + .lt-line { margin-top: 18px; }
.lt-line .tick { margin-top: 3px; }
.lt-strip { display: flex; align-items: center; justify-content: space-between; color: var(--quiet); }
.lt-strip .lt-art { width: 94px; height: 62px; background: var(--surface); box-shadow: var(--shadow); }
.lt-strip .lt-mini { width: 84px; height: auto; }
.lt-quote { display: flex; gap: 12px; align-items: flex-start; font-size: 16px; line-height: 24px; font-weight: 500; letter-spacing: -.22px; }
.lt-two { display: grid; grid-template-columns: 170px 1fr; padding: 8px 16px 0; font-size: 13px; line-height: 18px; color: var(--ink2); }
.lt-two span { padding-right: 14px; }
.lt-offer { display: flex; align-items: center; gap: 12px; width: 100%; padding: 12px 14px 12px 12px; border-radius: 20px; background: var(--surface); box-shadow: var(--float); }
.lt-seat { width: 48px; height: 48px; border-radius: 14px; background: var(--surface2); display: grid; place-items: center; flex: none; }
.lt-tap { display: grid; place-items: center; border-radius: 50%; }
.lt-offer.lt-in { background: var(--surface2); box-shadow: none; }
.lt-in .lt-seat { background: var(--surface); }
.lt-photo { display: block; position: relative; background: var(--surface2) center/cover no-repeat; }
.lt-pin { position: absolute; left: 14px; top: 14px; }
.lt-ink { color: #0D0E10; }
.lt-lift { position: relative; z-index: 2; background: var(--canvas); border-radius: 28px 28px 0 0; padding-top: 20px; }
`);

  /* ── Shared pieces ───────────────────────────────────── */
  const SMALL = 'font-size:16px;line-height:21px;letter-spacing:-.22px';
  const MID = 'font-size:20px;line-height:26px;letter-spacing:-.4px';
  const BIG = 'font-size:34px;line-height:39px;letter-spacing:-1.1px';
  const HUGE = 'font-size:44px;line-height:48px;letter-spacing:-1.32px;font-weight:600';
  const MOMENT = 'font-size:46px;line-height:48px;letter-spacing:-2.07px;font-weight:600';
  const sig = '<i class="lt-sig"></i>';
  const onp = t => `<span class="chip onphoto">${t}</span>`;
  const shut = solid => `<button class="round press" style="background:var(--${solid ? 'on-photo' : 'photo-fill'});color:${solid ? '#0D0E10' : 'var(--on-photo)'}" aria-label="Close">${ic('close', 's18')}</button>`;
  const next = (label = 'Next') => btn(label, { icon: 'arrow', trail: true });
  const quiet = (label, set) => `<button class="callout" style="text-align:center"${set === undefined ? '' : ` data-set="${set}"`}>${label}</button>`;
  /** A photograph card. o: pos, cls, style, b (title style), still (not pressable). */
  const pcard = (photo, h, top, title, sub = '', o = {}) => {
    const tag = o.still ? 'div' : 'button';
    return `<${tag} class="pcard ${o.still ? '' : 'press'} ${o.cls || ''}" style="${img(photo)};height:${h}px${o.pos ? `;background-position:${o.pos}` : ''}${o.style ? `;${o.style}` : ''}"><span class="topline">${top}</span><span class="copy"><b${o.b ? ` style="${o.b}"` : ''}>${title}</b>${sub ? `<span>${sub}</span>` : ''}</span></${tag}>`;
  };

  /* ── The drawing kit, in life's colours ──────────────── */
  const r1 = n => Math.round(n * 10) / 10;
  const DOTTED = 'stroke-dasharray="1 7"';
  /** One pen for every picture. `hand` gives lines, boxes and rings the marker wobble; fills, text and curves stay clean. */
  function pen(hand = false) {
    let n = 0;
    const wob = (s, sd) => 2 * (0.55 * Math.sin(0.085 * s + sd) + 0.25 * Math.sin(0.21 * s + 1.7 * sd));
    const run = (x1, y1, x2, y2) => {
      const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
      if (!hand || len < 12) return `L${r1(x2)} ${r1(y2)}`;
      const steps = Math.max(3, Math.round(len / 4)), sd = ++n * 2.3;
      let d = '';
      for (let k = 1; k <= steps; k++) {
        const s = len * k / steps, off = wob(s, sd) * Math.min(1, s / 9, (len - s) / 9);
        d += `L${r1(x1 + dx * k / steps - dy / len * off)} ${r1(y1 + dy * k / steps + dx / len * off)}`;
      }
      return d;
    };
    const tone = t => ({ lit: 'var(--ember)', q: 'var(--quiet)', soft: 'var(--surface3)', ink2: 'var(--ink2)' })[t] || 'var(--ink)';
    const st = (t, fill, extra) => `fill="${fill || 'none'}" stroke="${tone(t)}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"${extra ? ` ${extra}` : ''}`;
    const P = {
      line: (x1, y1, x2, y2, t, extra) => `<path d="M${r1(x1)} ${r1(y1)}${run(x1, y1, x2, y2)}" ${st(t, '', extra)}/>`,
      poly: (pts, t, fill, extra) => `<path d="M${pts[0][0]} ${pts[0][1]}${pts.slice(1).map((q, k) => run(pts[k][0], pts[k][1], q[0], q[1])).join('')}" ${st(t, fill, extra)}/>`,
      shape: (pts, t, fill) => `<path d="M${pts[0][0]} ${pts[0][1]}${pts.map((q, k) => { const z = pts[(k + 1) % pts.length]; return run(q[0], q[1], z[0], z[1]); }).join('')}Z" ${st(t, fill)}/>`,
      box: (bx, by, w, h, r, t, fill, extra) => {
        const x = r1(bx), y = r1(by), X = r1(bx + w), Y = r1(by + h);
        return `<path d="M${r1(x + r)} ${y}${run(x + r, y, X - r, y)}Q${X} ${y} ${X} ${r1(y + r)}${run(X, y + r, X, Y - r)}Q${X} ${Y} ${r1(X - r)} ${Y}${run(X - r, Y, x + r, Y)}Q${x} ${Y} ${x} ${r1(Y - r)}${run(x, Y - r, x, y + r)}Q${x} ${y} ${r1(x + r)} ${y}Z" ${st(t, fill, extra)}/>`;
      },
      ring: (cx, cy, r, t, fill, extra) => {
        if (!hand || r < 8) return `<circle cx="${cx}" cy="${cy}" r="${r}" ${st(t, fill, extra)}/>`;
        const sd = ++n * 1.9;
        const pts = Array.from({ length: 30 }, (_, k) => { const a = k / 30 * Math.PI * 2, rr = r + 1.3 * (0.55 * Math.sin(2 * a + sd) + 0.25 * Math.sin(5 * a + 1.7 * sd)); return `${r1(cx + rr * Math.cos(a))} ${r1(cy + rr * Math.sin(a))}`; });
        return `<path d="M${pts.join('L')}Z" ${st(t, fill, extra)}/>`;
      },
      dot: (cx, cy, r, t) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${tone(t)}"/>`,
      halo: (x, y, w, h, r) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="var(--ember-tint)"/>`,
      glow: (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="var(--ember-tint)"/>`,
      head: (x, y, a, t) => `<path d="M${r1(x - 6 * Math.cos(a - 0.6))} ${r1(y - 6 * Math.sin(a - 0.6))}L${r1(x)} ${r1(y)}L${r1(x - 6 * Math.cos(a + 0.6))} ${r1(y - 6 * Math.sin(a + 0.6))}" ${st(t)}/>`,
      arrow: (x1, y1, x2, y2, t, extra) => P.line(x1, y1, x2, y2, t, extra) + P.head(x2, y2, Math.atan2(y2 - y1, x2 - x1), t),
      text: (x, y, s, o = {}) => `<text x="${x}" y="${y}" text-anchor="${o.anchor || 'middle'}" font-size="${o.size || 11}" font-weight="${o.weight || 600}" fill="${o.fill || 'var(--ink2)'}">${s}</text>`,
    };
    return P;
  }
  const INK = 'var(--ink)', LIT = 'var(--ember-text)';
  const svg = (w, h, body, label) => `<svg class="lt-pic" viewBox="0 0 ${w} ${h}" role="img" aria-label="${label}">${body}</svg>`;

  /** The barbell: a heavy safe side, a small bold side, nothing in the middle. */
  function picBarbell() {
    const p = pen();
    return svg(330, 112,
      p.line(20, 44, 310, 44)
      + p.box(34, 4, 24, 80, 10, 'ink', 'var(--surface2)') + p.box(62, 14, 14, 60, 7, 'ink', 'var(--surface2)')
      + p.halo(264, 12, 36, 64, 18) + p.box(275, 24, 14, 40, 7, 'lit', 'var(--ember)')
      + p.text(34, 106, 'Very safe', { anchor: 'start', size: 13, fill: INK })
      + p.text(172, 68, 'Nothing in the middle', { fill: 'var(--quiet)' })
      + p.text(300, 106, 'Small bold bets', { anchor: 'end', size: 13, fill: LIT }),
      'A barbell: a heavy safe side, a small bold side and nothing in the middle');
  }

  /** Three lines meet the same shock: one breaks, one carries on, one climbs. */
  function picStress() {
    const p = pen();
    return svg(330, 112,
      [55, 165, 275].map(x => p.line(x, 10, x, 80, 'q', DOTTED)).join('')
      + p.line(16, 44, 50, 44) + p.line(60, 50, 68, 60) + p.line(74, 68, 79, 79)
      + p.line(126, 44, 204, 44)
      + p.line(236, 44, 268, 44) + p.glow(313, 15, 13)
      + `<path d="M276 43Q300 38 312 17" fill="none" stroke="var(--ember)" stroke-width="2" stroke-linecap="round"/>` + p.dot(313, 15, 4.5, 'lit')
      + p.text(55, 102, 'Breaks') + p.text(165, 102, 'Survives') + p.text(275, 102, 'Gets stronger', { fill: LIT }),
      'Under the same stress one line breaks, one carries on and one gets stronger');
  }

  /** Drift on the left, one aim on the right: every arrow starts to point the same way. */
  function picAim() {
    const p = pen(), T = [292, 54];
    const drift = [[28, 36, 50, 24], [62, 60, 46, 80], [86, 26, 106, 42], [98, 76, 122, 72], [134, 48, 128, 22]];
    const aimed = [[190, 20], [182, 56], [194, 92], [232, 32], [236, 80]].map(([x, y]) => { const a = Math.atan2(T[1] - y, T[0] - x); return p.arrow(x, y, r1(x + 26 * Math.cos(a)), r1(y + 26 * Math.sin(a))); });
    return svg(330, 130,
      drift.map(d => p.arrow(d[0], d[1], d[2], d[3], 'q')).join('') + aimed.join('')
      + p.glow(T[0], T[1], 15) + p.dot(T[0], T[1], 6, 'lit')
      + p.text(80, 122, 'Drifting') + p.text(242, 122, 'One aim, read every day', { fill: LIT }),
      'Scattered arrows on the left, arrows all pointing at one aim on the right');
  }

  /** £80 of the rebate as the capped bet; the rest stays put. */
  function picCap() {
    const p = pen();
    return svg(290, 62,
      p.text(0, 12, 'Your rebate, est. £840', { anchor: 'start', size: 13, fill: INK }) + p.text(290, 12, '£80', { anchor: 'end', size: 13, fill: LIT })
      + p.box(1, 22, 288, 20, 10, 'ink', 'var(--surface2)') + p.halo(256, 16, 37, 32, 14) + p.box(263, 22, 26, 20, 8, 'lit', 'var(--ember)')
      + p.text(0, 58, 'Stays safe', { anchor: 'start' }) + p.text(290, 58, 'A small, capped bet', { anchor: 'end' }),
      '£80 of an estimated £840 rebate as a small, capped bet');
  }

  /** Bite 1: the code in two parts. The letter is the lit thing. */
  function picParts() {
    const p = pen();
    return svg(330, 150,
      p.halo(178, 12, 46, 66, 14)
      + `<text x="170" y="66" text-anchor="end" font-size="56" font-weight="600" letter-spacing="-2" fill="var(--ink)" style="font-variant-numeric:tabular-nums">1257</text><text x="186" y="66" font-size="56" font-weight="600" fill="var(--ember)">L</text>`
      + p.poly([[42, 86], [42, 93], [170, 93], [170, 86]]) + p.line(106, 93, 106, 102)
      + p.poly([[186, 86], [186, 93], [216, 93], [216, 86]], 'lit') + p.line(201, 93, 201, 102, 'lit')
      + p.text(106, 122, 'Tax-free pay', { size: 13, fill: INK }) + p.text(106, 141, 'add a 0: £12,570', { size: 13, weight: 500 })
      + p.text(186, 122, 'The letter', { anchor: 'start', size: 13, fill: LIT }) + p.text(186, 141, 'L = the standard one', { anchor: 'start', size: 13, weight: 500 }),
      'The code 1257L in two parts: the number is tax-free pay, the letter is the rule');
  }

  /** Bite 2, guess first: the second bar stays a dotted question until you answer. */
  function picGuess(seen) {
    const p = pen(), x0 = 20, W = 290, w2 = Math.round(W * 11000 / 12570);
    return svg(330, seen ? 132 : 112,
      p.text(x0, 14, '1257L', { anchor: 'start', size: 13, fill: INK }) + p.text(310, 14, '£12,570 tax-free', { anchor: 'end' })
      + p.box(x0, 22, W, 20, 10, 'ink', 'var(--surface2)')
      + p.text(x0, 72, '1100L', { anchor: 'start', size: 13, fill: INK })
      + (seen
        ? p.text(310, 72, '£11,000 tax-free', { anchor: 'end' })
          + p.halo(x0 + w2 - 2, 74, W - w2 + 8, 32, 12) + p.box(x0 + w2 + 4, 80, W - w2 - 4, 20, 8, 'lit', 'var(--ember)') + p.box(x0, 80, w2, 20, 10, 'ink', 'var(--surface2)')
          + p.text(310, 124, '£1,570 more of your pay is taxed', { anchor: 'end', fill: LIT })
        : p.text(310, 72, 'more tax, or less?', { anchor: 'end' }) + p.box(x0, 80, W, 20, 10, 'q', '', DOTTED)),
      seen ? 'With 1100L, £1,570 more of your pay is taxed than with 1257L' : 'Two codes side by side. The second is hidden until you guess');
  }

  /** Bite 3: the right code meets the dotted line; the emergency code overshoots it. */
  function picWrong() {
    const p = pen();
    const months = (x, over) => Array.from({ length: 6 }, (_, k) => (over ? `<rect x="${x + k * 21}" y="52" width="12" height="20" rx="5" fill="var(--ember)"/>` : '') + p.box(x + k * 21, 80, 12, 34, 5, 'ink', 'var(--surface2)')).join('');
    return svg(330, 118,
      p.text(16, 11, 'Right code', { anchor: 'start' }) + p.text(186, 11, 'Emergency code', { anchor: 'start' })
      + `<text x="16" y="36" font-size="20" font-weight="600" letter-spacing="-.4" fill="var(--ink)">1257L</text><text x="186" y="36" font-size="20" font-weight="600" letter-spacing="-.4" fill="var(--ink)">1257L <tspan fill="var(--ember)">M1</tspan></text>`
      + p.line(16, 76, 139, 76, 'q', DOTTED) + p.line(186, 76, 309, 76, 'q', DOTTED)
      + p.text(139, 67, 'the right amount', { anchor: 'end', fill: 'var(--quiet)' })
      + months(16, false) + months(186, true),
      'Monthly tax with the right code meets the right amount. With the emergency code it goes over');
  }

  /** Bite 2, drawn live: the flow builds as it is read. The lit box is the sentence being read. */
  function picFlow(hand) {
    const p = pen(hand);
    let parts = '';
    for (let k = 1; k < 12; k++) parts += p.box(18 + k * 24.8, 26, 20, 20, 6);
    return svg(330, 176,
      p.text(18, 14, '£12,570 tax-free, in 12 parts', { anchor: 'start' })
      + p.halo(12, 20, 32, 32, 10) + p.box(18, 26, 20, 20, 6, 'lit', 'var(--ember)') + parts
      + `<path d="M28 52V70Q28 78 36 78H163Q171 78 171 86V98" fill="none" stroke="var(--ember)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>` + p.head(171, 99, Math.PI / 2, 'lit')
      + p.box(18, 104, 88, 48, 12) + p.text(62, 125, 'This month’s', { fill: INK }) + p.text(62, 140, 'pay', { fill: INK })
      + p.arrow(110, 128, 122, 128)
      + p.halo(122, 98, 98, 60, 16) + p.box(128, 104, 86, 48, 12, 'lit', 'var(--surface)') + p.text(171, 125, 'Take off', { fill: LIT }) + p.text(171, 140, 'one twelfth', { fill: LIT })
      + p.line(218, 128, 225, 128, 'lit') + p.dot(229, 128, 3.5, 'lit')
      + p.box(238, 104, 74, 48, 12, 'q', '', DOTTED) + p.text(275, 125, 'Tax', { fill: 'var(--quiet)' }) + p.text(275, 140, 'the rest', { fill: 'var(--quiet)' })
      + p.text(171, 172, 'about £1,047 a month', { fill: LIT }),
      'A flow: this month’s pay, take off one twelfth of the tax-free amount, then tax the rest');
  }

  /** How the telling went: two links said well, one still open. */
  function picChain() {
    const p = pen(), tk = x => `<path d="M${x - 4} 26l3 3 5-6" fill="none" stroke="var(--surface)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>`;
    return svg(330, 80,
      p.line(70, 26, 150, 26) + p.line(176, 26, 250, 26, 'q', DOTTED)
      + p.dot(58, 26, 10, 'ink') + tk(58) + p.dot(162, 26, 10, 'ink') + tk(162)
      + p.glow(264, 26, 17) + p.ring(264, 26, 9, 'lit', 'var(--surface)')
      + p.text(58, 56, 'The number', { size: 13, fill: INK }) + p.text(162, 56, 'What M1 means', { size: 13, fill: INK }) + p.text(264, 56, 'How to fix it', { size: 13, fill: LIT })
      + p.text(58, 73, 'said well') + p.text(162, 73, 'said well') + p.text(264, 73, 'the gap'),
      'Two parts explained well, one gap left: how to fix a wrong code');
  }

  /* Small pictures: one per bite, reused on the cover and the recap. */
  const MINI = {
    parts: p => `<text x="70" y="34" text-anchor="end" font-size="24" font-weight="600" letter-spacing="-.5" fill="var(--ink)">1257</text><text x="75" y="34" font-size="24" font-weight="600" fill="var(--ember)">L</text>` + p.poly([[14, 42], [14, 47], [70, 47], [70, 42]]) + p.poly([[75, 42], [75, 47], [90, 47], [90, 42]], 'lit'),
    twelfth: p => Array.from({ length: 12 }, (_, k) => `<rect x="${r1(7 + k * 8.2)}" y="10" width="6" height="20" rx="3" fill="var(--${k ? 'ink' : 'ember'})"${k ? ' opacity=".22"' : ''}/>`).join('') + p.poly([[7, 37], [7, 42], [103, 42], [103, 37]]) + p.text(55, 56, '÷ 12'),
    wrong: p => p.halo(60, 14, 42, 32, 10) + `<text x="56" y="36" text-anchor="end" font-size="16" font-weight="600" fill="var(--ink2)">1257L</text><text x="64" y="38" font-size="24" font-weight="600" fill="var(--ember)">M1</text>` + p.line(12, 51, 98, 51, 'q', DOTTED),
  };
  const mini = name => `<svg class="lt-mini" viewBox="0 0 110 60" width="110" height="60" aria-hidden="true">${MINI[name](pen())}</svg>`;

  /* Eight of the kit's thirty devices. Each has exactly one lit thing. */
  const DEVICE = {
    flow: p => p.box(4, 24, 28, 24, 7) + p.arrow(36, 36, 46, 36) + p.box(50, 24, 28, 24, 7) + p.arrow(82, 36, 92, 36) + p.halo(91, 19, 38, 34, 12) + p.box(96, 24, 28, 24, 7, 'lit', 'var(--ember)'),
    cycle: p => p.ring(66, 36, 24) + [[86.8, 24, 1.05], [66, 60, Math.PI], [45.2, 24, -1.05]].map(h => p.head(h[0], h[1], h[2])).join('') + p.ring(86.8, 48, 6, 'ink', 'var(--surface)') + p.ring(45.2, 48, 6, 'ink', 'var(--surface)') + p.glow(66, 12, 12) + p.dot(66, 12, 6.5, 'lit'),
    compare: p => p.line(22, 62, 110, 62) + p.box(38, 32, 20, 30, 6) + p.halo(68, 8, 34, 58, 12) + p.box(75, 14, 20, 48, 6, 'lit', 'var(--ember)'),
    layers: p => [50, 37].map(y => p.shape([[26, y], [66, y - 12], [106, y], [66, y + 12]], 'ink', 'var(--surface)')).join('') + `<ellipse cx="66" cy="24" rx="48" ry="19" fill="var(--ember-tint)"/>` + p.shape([[26, 24], [66, 12], [106, 24], [66, 36]], 'lit', 'var(--ember)'),
    timeline: p => p.line(10, 36, 122, 36) + [24, 54, 112].map(x => p.ring(x, 36, 5.5, 'ink', 'var(--surface)')).join('') + p.glow(84, 36, 13) + p.dot(84, 36, 6.5, 'lit'),
    venn: p => `<path d="M66 19A22 22 0 0 1 66 53A22 22 0 0 1 66 19Z" fill="var(--ember)"/>` + p.ring(52, 36, 22) + p.ring(80, 36, 22),
    funnel: p => p.box(14, 6, 104, 14, 7) + p.box(32, 27, 68, 14, 7) + p.halo(44, 43, 44, 24, 12) + p.box(50, 48, 32, 14, 7, 'lit', 'var(--ember)'),
    things: p => p.poly([[10, 36], [26, 22], [42, 36]]) + p.poly([[14, 36], [14, 56], [38, 56], [38, 36]]) + p.poly([[23, 56], [23, 46], [29, 46], [29, 56]])
      + p.ring(66, 40, 16) + p.line(66, 40, 66, 30) + p.line(66, 40, 73, 44)
      + p.line(94, 60, 100, 16) + p.line(114, 60, 120, 16) + p.line(95.2, 51.2, 115.2, 51.2) + p.line(97, 38, 117, 38) + p.halo(93, 17, 31, 15, 7) + p.line(98.8, 24.8, 118.8, 24.8, 'lit'),
  };
  const device = (name, hand) => `<svg class="lt-pic" viewBox="0 0 132 72" aria-hidden="true">${DEVICE[name](pen(hand))}</svg>`;

  /* ══ Learn from the best ═══════════════════════════════ */

  const LENSES = [['NR', 'Naval'], ['NT', 'Nassim'], ['MH', 'Morgan'], ['CM', 'Charlie'], ['JC', 'James'], ['CN', 'Cal'], ['PA', 'Peter'], ['AH', 'Andrew'], ['RS', 'Ramit'], ['NH', 'Napoleon']];
  const SETS = [['payslip', 'Money psychology', '6 ideas', 'center 78%'], ['letter', 'Risk', '5 ideas', ''], ['freedom', 'Wealth &amp; leverage', '5 ideas · L3', ''], ['walk', 'Habits &amp; focus', '7 ideas', ''], ['run', 'Health', '6 ideas', 'center 62%'], ['journal', 'Thinking clearly', '4 ideas', '']];

  /* ── Learn: a wall of ideas, each one a photograph ───── */
  function library() {
    return `${status()}${pushBar('', round('search', { label: 'Search ideas' }))}
    <div class="scroll"><div class="rise">
      <div class="eyebrow-row"><span class="eyebrow">Learn from the best</span>${chip('7 applied')}</div>
      <p class="display">Ideas from people who’ve <b>thought hardest</b>, in <b class="nw">${ic('clock')}60 seconds</b>.</p>
      ${pcard('bench', 300, `<span class="chip onphoto">${sig}Today’s idea · 60 sec</span>${onp('Taleb')}`, 'The barbell', 'Keep most of your money boringly safe so you can afford a few small, bold bets.', { pos: 'center 55%', cls: 'mt20' })}
      ${secHead('Lenses', '10 thinkers')}
      <div class="hscroll">${LENSES.map(([i, n]) => `<button class="lt-lens press"><span class="lt-face">${i}</span>${n}</button>`).join('')}</div>
      ${secHead('For where you are', 'Level 1')}
      <div class="pgrid">
        ${pcard('calmdesk', 180, onp('Applied'), 'Remove before you add', 'You cancelled Netflix', { b: SMALL })}
        ${pcard('sunday', 180, onp('In progress'), 'Room for error', 'Your buffer', { b: SMALL, pos: 'center 75%' })}
        ${pcard('aimdesk', 140, onp('New · 60 sec'), 'Invert the problem', '', { b: SMALL, style: 'grid-column:1 / -1' })}
      </div>
      ${secHead('Your learning')}
      <div class="tiles">${tile({ label: 'Into action', unit: '4 thinkers', value: '7', small: 'applied', sub: 'Worth about £1,210 a year' })}${tile({ label: 'Learned', unit: 'this month', value: '7', small: 'ideas', sub: '2 recalls due today' })}</div>
      <div class="card pad16 rows mt12">${row('images', 'Pictures that teach', '30 devices, clean lines or hand-drawn')}</div>
      ${secHead('Collections')}
      <div class="pgrid">${SETS.map(([p, t, n, pos]) => pcard(p, 124, onp(n), t, '', { b: SMALL, pos })).join('')}</div>
      <p class="callout mt20">Ideas are explained in life’s own words, not quoted. Read the originals for the full picture.</p>
    </div></div>`;
  }

  /* ── A lens: one thinker, their view, their ideas ────── */
  function lens() {
    const idea = (photo, tag, title, pos, locked) => pcard(photo, 200, onp(tag), title, '', { b: SMALL, pos, cls: locked ? 'dim' : '' });
    return `${status()}${pushBar('', `<button class="chip press">${ic('add', 's14')}Follow</button>`)}
    <div class="scroll"><div class="rise">
      ${pcard('run', 280, `<span class="lt-face">NT</span>${onp('Lens · 2 of 5 ideas')}`, 'Nassim Taleb', 'Risk &amp; antifragility', { still: true, pos: 'center 62%', b: BIG })}
      <p class="statement mt24">Some things break under stress, some survive it, and some <b>get stronger.</b> Build a life that <b>gains from surprises</b> instead of fearing them.</p>
      <div class="lt-panel mt20">${picStress()}</div>
      ${secHead('Ideas', '2 of 5 · more unlock as you grow')}
      <div class="hscroll lt-shelf" style="padding-bottom:22px">
        ${idea('calmdesk', 'Applied', 'Remove before you add')}${idea('bench', 'In progress', 'The barbell', 'center 55%')}${idea('letter', '60 sec', 'Fragile, robust, antifragile')}${idea('friends', 'Level 3', 'Skin in the game', '', true)}${idea('terrace', 'Level 4', 'The Lindy effect', '', true)}
      </div>
      <div class="title mt12">Where life uses this lens</div>
      <div class="card pad16 rows mt12">${row('cash', '30-day cash plan', 'The safe side of your barbell')}${row('repeat', 'Subscriptions', 'Remove before you add')}${row('shield', 'Protection review', 'Fix the things that could ruin you', chip('L4', 'q'))}</div>
      ${secHead('Read the originals')}
      <div class="card pad16 rows">${row('book', 'Antifragile', 'Book · the core of this lens')}${row('book', 'Skin in the Game', 'Book')}</div>
      <p class="callout mt16">Ideas are explained in life’s own words, not quoted. Read the originals for the full picture.</p>
    </div></div>${foot(next('Ask through this lens'))}`;
  }

  /* ── An idea, in 60 seconds ──────────────────────────── */
  function idea() {
    return `<div class="full-photo fade" style="${img('bench')};bottom:auto;height:330px;background-position:center 65%"></div>
    ${status('on-photo')}
    <header class="bar on-photo">${onp('Nassim Taleb · Risk')}<div class="acts"><button class="round press" style="background:var(--photo-fill);color:var(--on-photo)" aria-label="Save for later">${ic('book', 's18')}</button>${shut(true)}</div></header>
    <div class="on-photo" style="height:190px;flex:none;position:relative;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;padding:0 20px 20px"><span class="callout" style="color:var(--on-photo2)">An idea, in 60 seconds</span><div class="display" style="${MOMENT};margin-top:6px"><b>The barbell</b></div></div>
    <div class="sheet" style="flex:1;min-height:0;display:flex;flex-direction:column;padding-top:22px">
      <div class="micro">THE IDEA</div>
      <p class="statement mt8">Put most of what you have somewhere <b>boringly safe,</b> and a small part into <b>bold bets</b> with a capped downside. Avoid the <b>“medium risk” middle</b> that can quietly blow up.</p>
      <div style="flex:1;min-height:10px"></div>
      ${picBarbell()}
      <div style="flex:1;min-height:10px"></div>
      <button class="btn press">Use it today ${ic('arrow', 's18')}</button>
      <p class="callout mt12" style="text-align:center">Opens your 30-day cash plan: the safe side of your barbell.</p>
    </div>`;
  }

  /* ── Ask through a lens ──────────────────────────────── */
  function lensask() {
    return `${status()}${pushBar('Ask through a lens', '', 'close')}
    <div class="scroll"><div class="rise">
      <div class="chatcol">${bubble('Should I put my £840 rebate into crypto?')}</div>
      <div class="micro mt24">SEE IT THROUGH</div>
      <div class="mt8">${filters(['Taleb', 'Housel', 'Munger'], 0)}</div>
      <div class="eyebrow mt24">${orb('ring', 18)}life, through Taleb’s lens</div>
      <p class="statement mt8">First ask what could <b>ruin you</b>. You have <b>1.3 months</b> of buffer and a tax bill coming. Crypto with your rebate is fine only as a <b>small, capped bet</b>: say £80 of it, never the lot.</p>
      <div class="card mt20">${picCap()}</div>
      <div class="card pad16 between mt12"><span class="body">Save this to <b>Money</b> as a decision?</span><button class="btn ghost sm press" style="width:auto;padding:0 18px">Save</button></div>
      <p class="callout mt16">General guidance using your numbers, not regulated financial advice. life speaks in its own voice, never as the thinker.</p>
    </div></div>
    <div class="foot" style="padding-top:0"><div class="composer"><p class="q">Ask anything else</p><button class="round sm solid press" aria-label="Talk">${ic('mic', 's16')}</button></div></div>`;
  }

  /* ── Quick recall: one card, guess, then see ─────────── */
  function recall(s) {
    const opts = [['bold', 'The bold bets'], ['safe', 'The safe side'], ['even', 'A bit of both, evenly']];
    const done = opts.some(o => o[0] === s), right = s === 'safe', at = done && right ? 1 : 0;
    const opt = ([k, t]) => !done
      ? `<button class="lt-opt press" data-set="${k}">${t}</button>`
      : `<button class="lt-opt press ${k === 'safe' ? 'lt-right' : 'lt-rest'}" data-set="">${k === 'safe' ? `<span class="tick on">${ic('check', 's14')}</span>` : ''}<span>${t}</span>${k === s && !right ? '<span class="callout">Your guess</span>' : ''}</button>`;
    return `${status()}<div class="dim">${rootBar('Today', 'Mon 16 Nov', round('search', { label: 'Search' }) + round('bell', { label: 'From life' }))}</div>
    <div class="scroll dim" style="flex:1;overflow:hidden"><span class="eyebrow">Good morning, Ama</span><p class="display">Your <b>tax rebate</b> is <b>one form</b> away. <b>Council tax</b> is due in <b>15 days</b>.</p></div>
    <div class="sheet"><div class="handle" style="margin-bottom:14px"></div>
      ${pcard('bench', 108, `<span class="chip onphoto">${sig}Recall · 20 seconds</span><button class="round sm press" style="background:var(--photo-fill);color:var(--on-photo)" aria-label="Close">${ic('close', 's16')}</button>`, 'The barbell', '', { still: true, pos: 'center 50%', b: SMALL, style: 'border-radius:20px' })}
      <p class="statement mt16">With the barbell, <b>what do you fill first?</b></p>
      <div class="gap8 mt16">${opts.map(opt).join('')}</div>
      <div class="mt12">${done
        ? says(right ? 'Yes. Boringly safe first, so you can afford a few small, bold bets.' : 'It’s the safe side. Boringly safe first, so the bold bets can stay small.')
        : `<p class="callout">life’s forgotten this one. Can you remind it?</p>`}</div>
      <div class="between mt16"><span class="callout">Next recall</span><span class="callout ink">${done ? (right ? 'in 3 days' : 'tomorrow, nothing lost') : 'the gap grows when you get it right'}</span></div>
      <div class="lt-ladder mt8">${['1d', '3d', '7d', '21d', '60d'].map((d, k) => `<span class="${k === at ? 'lt-at' : ''}">${d}</span>`).join('')}</div>
      ${done ? `<button class="btn press mt16">Done</button>` : ''}
    </div>`;
  }

  /* ── Ideas into action ───────────────────────────────── */
  function learning() {
    const lived = new Set([3, 6, 10, 13, 17, 20, 24, 25, 28]);
    const cells = Array.from({ length: 30 }, (_, k) => k === 29 ? 'now' : lived.has(k) ? 'on' : '');
    const res = (photo, title, sub, worth) => thumbRow(photo, title, sub, `<span class="end">${worth}</span>`);
    return `${status()}${pushBar('Your learning')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Ideas into action · worth about</span>
      <div class="xl" style="margin-top:8px">£1,210<small>a year</small></div>
      <p class="statement mt12">You’ve applied <b>7 ideas</b> from <b>4 thinkers</b>.</p>
      <div class="card mt24"><div class="between"><span class="title">Learning streak</span><span class="callout">9 of 30 days</span></div><div class="mt16">${dots(cells, 10)}</div><p class="callout mt16">Measured by what it changed, not by pages read.</p></div>
      ${secHead('Idea → result', `All 7 ${ic('chev', 's16')}`)}
      <div class="card pad16 rows">
        ${res('calmdesk', 'Remove before you add', 'Cancelled 2 unused subscriptions', '£383/yr')}
        ${res('sunday', 'Room for error', 'Buffer up to 1.3 months', '£580')}
        ${res('work', 'Make it automatic', 'Payday sweep set up', '£180/mo')}
        ${res('aimdesk', 'Invert the problem', 'Found the £840 rebate', '£840')}
      </div>
    </div></div>${foot(btn('Find your next idea'))}`;
  }

  /* ── Teach it back: the Feynman step, typed ──────────── */
  function teach(s) {
    const checked = s === 'checked', ok = t => chip(ic('check', 's14') + t, 'done');
    return `${status()}${pushBar('', `<span class="callout">Step 4 of 4</span>`, 'close')}
    <div class="scroll"><div class="rise">
      <div style="display:flex;align-items:center;gap:10px"><span class="thumb" style="${img('bench')};width:40px;height:40px;border-radius:50%;background-position:center 45%"></span><span><span class="title" style="display:block">The barbell</span><span class="callout">Nassim Taleb · Risk</span></span></div>
      <p class="display" style="margin-top:16px">${checked ? '<b>Nearly all of it.</b> One part to add.' : '<b>Teach it back.</b> Explain the barbell to a friend in two or three sentences.'}</p>
      <div class="lt-paper mt24 ${checked ? 'lt-marked' : ''}">${checked
        ? 'Keep most of your money <b>really safe</b>, like a buffer, and only put <b>a small bit into risky stuff</b>, so <b>a bad bet can’t wreck you</b>.'
        : 'Keep most of your money really safe, like a buffer, and only put a small bit into risky stuff, so a bad bet can’t wreck you.<span class="lt-caret"></span>'}</div>
      ${checked
        ? `<div class="lt-tags mt16">${ok('Safe side first')}${ok('A small bold part')}${ok('Capped downside')}</div>
          <div class="card pad16 mt16"><span class="chip live">One part to add</span><p class="body mt8">The <b>“medium risk” middle</b>. You didn’t say to avoid it, and it’s the part that can quietly blow up.</p></div>
          <div class="mt16">${says('The barbell is booked in for a quick recall tomorrow.')}</div>`
        : `<p class="callout mt12">Talk or type. Your own words are the point.</p>`}
    </div></div>
    ${checked
      ? foot(btn('Re-read that part') + quiet('Explain it again', ''))
      : `<div class="foot"><div class="pager"><button class="back press" aria-label="Talk instead">${ic('mic', 's18')}</button><button class="btn press" data-set="checked">Check my explanation</button></div></div>`}`;
  }

  /* ── Lens: definiteness of purpose (Napoleon Hill) ───── */
  function hill() {
    const pr = (title, sub, mine, on) => `<button class="check press ${on ? 'on' : ''}"><span class="tick ${on ? 'on' : ''}">${on ? ic('check', 's14') : ''}</span><span style="flex:1">${title}<span class="callout" style="display:block">${sub}</span></span>${mine ? `<span class="chip q" style="margin-top:2px">${mine}</span>` : ''}</button>`;
    return `${status()}${pushBar('')}
    <div class="scroll"><div class="rise">
      ${pcard('aimwrite', 250, `${onp('Lens · Napoleon Hill')}<span class="lt-face">NH</span>`, 'Definiteness of purpose', '', { still: true, pos: 'center 58%', b: BIG })}
      <p class="statement mt24">Most people drift because they <b>never decide</b>. Pick one aim, give it a <b>date</b> and a <b>price</b>, and look at it <b>every day</b>, so your choices start pointing the same way.</p>
      <div class="lt-panel mt20">${picAim()}</div>
      ${secHead('Four principles', '3 of 4 in your Aim')}
      <div class="card pad16">
        ${pr('Decide exactly what you want', 'Something you could photograph', 'A two-bed flat', true)}
        ${pr('Set a date', 'Deadlines turn wishes into plans', 'June 2029', true)}
        ${pr('Name what you’ll give', 'Effort, money, time', '£800 a month', true)}
        ${pr('Read it twice a day', 'Morning and night, about 20 seconds', '', false)}
      </div>
      <p class="callout mt16">From the ideas in Think and Grow Rich (1937), explained in life’s words. Related lenses: Clear, Munger.</p>
    </div></div>${foot(next('Read your Aim'))}`;
  }

  /* ── What you’ve learned: a shelf you slide along ────── */
  function learned() {
    const c = (photo, tag, title, from, pos) => pcard(photo, 252, onp(tag), title, from, { b: MID, pos });
    return `${status()}${pushBar('')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">What you’ve learned</span>
      <p class="display"><b>7 ideas</b> this month. <b>2 recalls</b> due today.</p>
      <div class="micro mt24"><span class="sig"></span>DUE TODAY FIRST, THEN THE REST OF YOUR SHELF</div>
      <div class="hscroll lt-shelf lt-wide mt12" style="padding-bottom:22px">
        ${c('breathe', 'Recall due today', 'Heart rate variability', 'From Body · Tuesday')}
        ${c('bedroom', 'Recall due today', 'Sleep debt', 'From Body · 2 weeks ago')}
        ${c('payslip', 'Led to action', 'Tax codes', 'From your payslip · today<br>Led to: checked your code', 'center 75%')}
        ${c('sunday', 'Led to action', 'Emergency buffer', 'From your cash plan · last week<br>Led to: £600 set aside', 'center 75%')}
        ${c('bench', 'Sticking well', 'The barbell', 'Lens · Taleb · last week', 'center 55%')}
      </div>
      <div class="card pad16">${says('I’ve forgotten two of these. Can you remind me? It takes a minute.')}</div>
      <p class="callout mt16">Each card says where it came up and what it led you to do. Learning that changes nothing doesn’t count.</p>
    </div></div>${foot(btn('Do today’s 2 recalls · 1 min'))}`;
  }

  /* ── Pictures that teach: the drawing kit ────────────── */
  const DEVICES = [['flow', 'Flow', 'How one thing leads to the next'], ['cycle', 'Cycle', 'A loop that repeats'], ['compare', 'Compare', 'Two options, side by side'], ['layers', 'Layers', 'What sits on what'], ['timeline', 'Timeline', 'When things happen'], ['venn', 'Venn', 'Where two things overlap'], ['funnel', 'Funnel', 'Narrowing down'], ['things', 'Things', 'Drawn objects, 208 of them']];
  function drawkit(s) {
    const hand = s === 'hand';
    return `${status()}${pushBar('')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Pictures that teach · 30 devices</span>
      <p class="display"><b>One idea</b> per picture. <b>One thing</b> lit.</p>
      <p class="body mt12">One line weight, round ends. <b>Ember is the thing that changes.</b> Lines draw themselves on, then rest.</p>
      <div class="seg mt20" role="group"><button aria-pressed="${!hand}" data-set="">Clean lines</button><button aria-pressed="${hand}" data-set="hand">Hand-drawn</button></div>
      <div class="tiles mt12">${DEVICES.map(([k, t, sub]) => `<div class="lt-dev">${device(k, hand)}<b>${t}</b><small>${sub}</small></div>`).join('')}</div>
      <p class="callout mt16">Also in the kit: graph, balance, stairs, spectrum, pair, tree, test, threshold, units, crowd, grid, wave, mirror, stack, radial, cutaway, sankey, fan, spiral, zoom, brace and map.</p>
      <p class="callout mt8">For the bigger lessons. The quick Teach me keeps its simple pictures.</p>
    </div></div>`;
  }

  /* ══ Teach me ══════════════════════════════════════════ */

  const lessonBar = n => `${pushBar('Tax codes', `<span class="callout" style="font-variant-numeric:tabular-nums">${n} / 3</span>`, 'close')}<div class="lt-steps">${[1, 2, 3].map(k => `<span class="bar-track"><i style="width:${k < n ? 100 : k === n ? 55 : 0}%"></i></span>`).join('')}</div>`;

  /* ── Teach me, right where it's needed ───────────────── */
  function teachoffer() {
    return `${status()}${pushBar('Tax &amp; NI check', round('info', { label: 'How this is worked out' }))}
    <div class="scroll"><div class="rise">
      <div class="hero">
        <div class="lt-photo" style="${img('payslip')};height:164px;background-position:center 80%"><span class="chip onphoto lt-pin">From your last payslip</span></div>
        <div class="below">
          <div class="eyebrow-row"><span class="eyebrow">Your tax code</span>${chip('Check this', 'live')}</div>
          <div class="xl" style="margin-top:6px">1257L M1</div>
          <p class="body mt8">Your last payslip shows an <b>emergency code</b>. You may be paying too much tax.</p>
          <button class="lt-offer lt-in press mt16"><span class="lt-seat">${orb('ring', 26)}</span><span style="flex:1"><span class="title" style="display:block">Teach me tax codes</span><span class="callout">3 bites · about 2 minutes</span></span><span class="round solid">${ic('arrow', 's18')}</span></button>
        </div>
      </div>
      <div class="tiles mt12">${tile({ label: 'Tax so far this year', value: '£3,912', sub: 'On track', plain: true })}${tile({ label: 'National Insurance', value: '£1,488', sub: 'Class 1', plain: true })}</div>
      ${secHead('It also appears in Talk')}
      <div class="card"><div class="eyebrow">${orb('ring', 18)}life, when you sound unsure</div>
        <p class="statement mt8" style="${MID}">No worries, this sounds new to you. Want a <b>two-minute lesson</b> first, then tell me in your own words?</p>
        <div class="between mt16"><button class="btn ghost sm press">Teach me</button><button class="btn ghost sm press">Not now</button></div></div>
    </div></div>`;
  }

  /* ── Your lesson, ready: the cover ───────────────────── */
  function lessonready(s) {
    const bites = [['parts', 'The code is two parts', 'A number and a letter'], ['twelfth', 'How it works each payday', 'With one guess from you'], ['wrong', 'When it goes wrong', 'And how to spot it']];
    if (s === 'building') return `${status()}${pushBar('', '', 'close')}
    <div class="scroll" style="display:flex;flex-direction:column" data-set="">
      <div style="flex:1;display:grid;place-items:center;min-height:300px">${orb('working', 220)}</div>
      <span class="eyebrow">Teach me · a few seconds</span>
      <p class="display">Building your lesson from <b>your own payslip.</b></p>
      <p class="body mt12">Three bites, each with one picture and one quick puzzle.</p>
    </div>`;
    return `<div class="full-photo" style="${img('payslip')};bottom:auto;height:262px;background-position:center 78%"></div>
    ${status('lt-ink')}
    <header class="bar"><button class="chip onphoto press" data-set="building">Teach me · your lesson is ready</button>${shut(true)}</header>
    <div style="height:130px;flex:none"></div>
    <div class="scroll lt-lift">
      <div class="display" style="${HUGE};margin-top:0"><b>What your tax code means</b></div>
      <p class="callout mt8">Using your own payslip, so the numbers are real.</p>
      <div class="hscroll mt20" style="padding-bottom:22px">${bites.map(([m, t, sub], k) => `<div class="lt-bite"><div class="lt-art">${mini(m)}</div><small>BITE ${k + 1} OF 3</small><b>${t}</b><span>${sub}</span></div>`).join('')}</div>
      <div class="seg" role="group">${['Simple', 'Standard', 'Deep'].map((o, k) => `<button aria-pressed="${k === 1}">${o}</button>`).join('')}</div>
    </div>
    ${foot(btn('Start · about 2 min', { icon: 'play' }) + quiet('Save for later'))}`;
  }

  /* ── A bite: one idea, one picture ───────────────────── */
  function bite() {
    return `${status()}${lessonBar(1)}
    <div class="scroll"><div class="rise">
      <p class="display" style="margin-top:6px"><b>The code is two parts</b></p>
      <div class="lt-panel mt20">${picParts()}</div>
      <p class="statement mt24">The <b>number</b> is how much you can earn <b>tax-free</b>, without the last zero. The <b>letter</b> tells your employer which rules apply to you.</p>
    </div></div>${foot(next())}`;
  }

  /* ── Guess first, then see ───────────────────────────── */
  function predict(s) {
    const seen = s === 'more' || s === 'less', right = s === 'more';
    return `${status()}${lessonBar(2)}
    <div class="scroll" style="display:flex;flex-direction:column"><div class="rise" style="display:flex;flex-direction:column;flex:1">
      <span class="title">How it works each payday</span>
      <p class="body mt8">Each month your employer takes off <b>one twelfth</b> of your tax-free amount, then taxes the rest.</p>
      <div class="lt-panel mt16">${picGuess(seen)}</div>
      <div style="flex:1;min-height:20px"></div>
      ${seen
        ? `<span class="chip ${right ? 'done' : 'q'}" style="align-self:flex-start">${right ? 'You guessed it' : 'A good guess. It goes the other way.'}</span><p class="display"><b>More tax.</b> A smaller number means less of your pay is tax-free.</p>`
        : `<span class="eyebrow"><span class="star"></span>Your guess, before you see</span><p class="display">If your code were <b>1100L</b> instead of <b>1257L</b>, would you pay <b>more tax or less?</b></p>`}
    </div></div>
    ${seen
      ? foot(next() + quiet('Guess again', ''))
      : `<div class="foot" style="flex-direction:row"><button class="btn ghost press" data-set="more">${ic('arrowUp', 's18')}More</button><button class="btn ghost press" data-set="less">${ic('arrowDown', 's18')}Less</button></div>`}`;
  }

  /* ── One quick puzzle ────────────────────────────────── */
  function puzzle(s) {
    const opts = [['little', 'It means you’ve paid too little'], ['details', 'Your employer doesn’t have your details yet'], ['self', 'You’re self-employed']];
    const done = opts.some(o => o[0] === s);
    const opt = ([k, t]) => !done
      ? `<button class="lt-opt lt-card press" data-set="${k}">${t}</button>`
      : `<button class="lt-opt lt-card press ${k === 'details' ? 'lt-right' : 'lt-rest'}" data-set="">${k === 'details' ? `<span class="tick on">${ic('check', 's14')}</span>` : ''}<span>${t}</span>${k === s && k !== 'details' ? '<span class="callout">Your pick</span>' : ''}</button>`;
    return `${status()}${lessonBar(3)}
    <div class="scroll"><div class="rise">
      <span class="title">When it goes wrong</span>
      <div class="lt-panel mt12">${picWrong()}<div class="lt-two"><span>Tax-free part used each month</span><span>Often too much tax, until it’s fixed</span></div></div>
      <span class="eyebrow mt24">Pick one</span>
      <p class="statement mt8"><b>“M1”</b> at the end of a code most often means…</p>
      <div class="gap8 mt16">${opts.map(opt).join('')}</div>
      <div class="mt12">${done
        ? says(`${s === 'details' ? 'That’s it.' : 'It’s the middle one.'} M1 is a stopgap while your employer waits for your details, so it’s worth checking.`)
        : `<p class="callout">A wrong answer costs nothing. You’ll see why either way.</p>`}</div>
    </div></div>${done ? foot(next('See the recap')) : ''}`;
  }

  /* ── The whole idea, in three lines ──────────────────── */
  function lessonrecap() {
    const li = t => `<div class="lt-line"><span class="tick on">${ic('check', 's14')}</span><p class="statement">${t}</p></div>`;
    return `${status()}${pushBar('Recap', '', 'close')}
    <div class="scroll" style="display:flex;flex-direction:column"><div class="rise" style="display:flex;flex-direction:column;flex:1">
      <span class="eyebrow">Tax codes · the whole idea, in three lines</span>
      <p class="display" style="${HUGE};margin-top:8px"><b>So, in short</b></p>
      <div class="lt-strip mt20"><div class="lt-art">${mini('parts')}</div>${ic('chev', 's16')}<div class="lt-art">${mini('twelfth')}</div>${ic('chev', 's16')}<div class="lt-art">${mini('wrong')}</div></div>
      <div class="mt24">
        ${li('The <b>number</b> is your tax-free pay, without the last zero.')}
        ${li('Each payday, <b>a twelfth</b> comes off before tax.')}
        ${li('A letter like <b>M1</b> means a stopgap, so <b>check it</b>.')}
      </div>
      <div style="flex:1;min-height:20px"></div>
      ${says('This is the thing you’ll tell back in a moment.')}
    </div></div>${foot(btn('Now tell it back', { icon: 'mic' }))}`;
  }

  /* ── Tell it back to life ────────────────────────────── */
  function tellback(s) {
    const bar = pushBar('Your turn', `<span class="callout" style="font-variant-numeric:tabular-nums">0:41</span>`, 'close');
    if (s === 'done') return `${status()}${bar}
    <div class="scroll" style="display:flex;flex-direction:column">
      <div style="flex:1;display:grid;place-items:center;min-height:260px">${orb('thinking', 220)}</div>
      <span class="eyebrow">Thinking about what you said</span>
      <p class="display">Finding what you <b>explained well.</b></p>
      <p class="body mt12">Your own words come first. Then the one gap, if there is one.</p>
    </div>${foot(quiet('Keep talking', ''))}`;
    return `${status()}${bar}
    <div class="scroll"><div class="rise">
      <p class="display" style="margin-top:6px">Tell me what a <b>tax code</b> is, like I’ve <b>never heard of one.</b></p>
      <div class="chatcol mt24">
        ${bubble('It’s like… the number is how much you earn before tax kicks in, so 1257 is about twelve and a half grand. And the letter is the type.')}
        ${says('Oh nice. So why would the letter matter if the number’s the same?')}
        ${bubble('Because M1 means they’re guessing, so you can end up paying too much…')}
      </div>
    </div></div>
    <div class="foot" style="align-items:center;gap:4px;padding-top:4px"><button class="lt-tap press" data-set="done" aria-label="I’m done">${orb('listening', 150)}</button><span class="callout">Tap when you’re done</span></div>`;
  }

  /* ── What you got, and the one gap ───────────────────── */
  function gaps() {
    const q = t => `<div class="lt-quote"><span class="tick on">${ic('check', 's14')}</span><p>${t}</p></div>`;
    return `${status()}${pushBar('How you did', '', 'close')}
    <div class="scroll"><div class="rise">
      <span class="eyebrow">Tax codes · told back in 0:41</span>
      <p class="display">You’ve got <b>most of it.</b> One gap left.</p>
      <div class="lt-panel mt20">${picChain()}</div>
      <div class="card mt12"><div class="micro">YOU EXPLAINED WELL, IN YOUR WORDS</div><div class="gap12 mt12">${q('“the number is how much you earn before tax kicks in”')}${q('“M1 means they’re guessing”')}</div></div>
      <div class="card mt12"><span class="chip live">One gap</span><div class="headline mt12">What to do about a wrong code</div><p class="body mt8">You spotted the problem. The last step is how to fix it.</p></div>
    </div></div>${foot(btn('Show me') + `<span class="callout" style="text-align:center">A short explanation. Then you tell it in your own words.</span>`)}`;
  }

  /* ── You've got it ───────────────────────────────────── */
  function gotit() {
    const fact = (icon, html) => `<p class="body" style="display:flex;align-items:center;gap:10px">${ic(icon, 's18')}<span>${html}</span></p>`;
    return `<div class="full-photo" style="${img('gotit')};bottom:auto;height:440px;background-position:center top"></div>
    ${status('lt-ink')}
    <header class="bar">${onp('Learned · tax codes')}${shut(true)}</header>
    <div style="height:304px;flex:none"></div>
    <div class="sheet" style="flex:1;min-height:0;display:flex;flex-direction:column;padding-top:22px">
      ${orb('done', 44)}
      <p class="display" style="${HUGE};margin-top:12px"><b>You’ve got it.</b></p>
      <p class="statement" style="font-size:21px;line-height:28px;letter-spacing:-.35px;margin-top:10px">You can now <b>read any tax code</b>, and you know <b>what to do when one is wrong</b>.</p>
      <div class="gap8 mt16">${fact('book', '<b>7</b> ideas learned this month')}${fact('repeat', 'Quick recall booked: <b>Thursday</b>, then next week')}</div>
      <div style="flex:1;min-height:12px"></div>
      <button class="btn press">Check my tax code now ${ic('arrow', 's18')}</button>
      <button class="callout mt12" style="text-align:center">Back to Today</button>
    </div>`;
  }

  /* ── A bite, drawn live ──────────────────────────────── */
  function bitedrawn(s) {
    const hand = s !== 'clean';
    return `${status()}${lessonBar(2)}
    <div class="scroll"><div class="rise">
      <div class="between"><span class="title">How it works each payday</span><button class="round sm press" aria-label="Replay the drawing">${ic('repeat', 's16')}</button></div>
      <div class="seg mt12" role="group"><button aria-pressed="${!hand}" data-set="clean">Clean lines</button><button aria-pressed="${hand}" data-set="">Hand-drawn</button></div>
      <div class="lt-panel mt12">${picFlow(hand)}</div>
      <p class="statement mt20">Each month your employer takes off <b>one twelfth</b> of your tax-free amount, then <b>taxes the rest</b>.</p>
      <p class="callout mt12">Each sentence draws the next part. The lit box is the one being read.</p>
    </div></div>${foot(next())}`;
  }

  /* ══ Grow ══════════════════════════════════════════════ */

  /* ── Weekly recap: this week in front, older weeks behind ─ */
  const WEEKS = {
    now: { tag: 'This week · 10 – 16 Nov', photo: 'sunday', pos: 'center 78%', line: `You cleared <b class="nw">${ic('checkCircle')}3 missions</b> and moved <b class="nw">${ic('wallet')}£180</b> to your buffer.` },
    w45: { tag: 'Week 45 · 3 – 9 Nov', photo: 'bedroom', pos: 'center', line: `You found <b class="nw">${ic('cash')}£840</b> and slept <b class="nw">${ic('moon')}7.1h</b> a night.` },
    w44: { tag: 'Week 44 · 27 Oct – 2 Nov', photo: 'desk', pos: 'center', line: `You cleared <b class="nw">${ic('checkCircle')}1</b> mission.` },
  };
  function recap(s) {
    const key = WEEKS[s] ? s : 'now', w = WEEKS[key], behind = ['w44', 'w45', 'now'].filter(k => k !== key);
    const stat = (label, value, up, extra = '', wide = false) => `<div class="tile ${wide ? 'wide' : ''}"><span class="th"><span>${label}</span><span class="chip done">${ic('arrowUp', 's14')}${up}</span></span><span class="num">${value}</span>${extra}</div>`;
    return `${status()}${pushBar('Weekly recap', round('arrowUp', { label: 'Share' }), 'close')}
    <div class="scroll"><div class="rise">
      <div class="between"><span class="t30">Your weeks</span><span class="callout">Every Sunday</span></div>
      <div class="stack mt20">
        ${behind.map(k => `<div class="peek press" data-set="${k === 'now' ? '' : k}"><span>${WEEKS[k].tag}</span><span>${ic('up', 's14')}</span></div>`).join('')}
        <div class="hero" style="position:relative"><div class="lt-photo" style="${img(w.photo)};height:170px;background-position:${w.pos}"><span class="chip onphoto lt-pin">${w.tag}</span></div><div class="below"><p class="display" style="margin-top:0">${w.line}</p></div></div>
      </div>
      ${key === 'now'
        ? `<div class="tiles mt12">${stat('Missions cleared', '3', '2')}${stat('Moved to buffer', '£180', '')}${stat('Health stack days', '4<small>of 7</small>', '4', days14('1011010'), true)}</div>`
        : `<p class="callout mt16" style="text-align:center">Tap a week behind the card to bring it forward.</p>`}
      <div class="card mt12"><div class="eyebrow">${orb('ring', 18)}Reflection from life</div><p class="statement mt8">Progress came from <b>small, repeated steps</b>, not one big push.</p></div>
    </div></div>`;
  }

  /* ── Vantage point ───────────────────────────────────── */
  function vantage() {
    return `<div class="full-photo" style="${img('vantage')};bottom:auto;height:700px;background-position:20% center"></div>
    ${status('on-photo')}
    <header class="bar on-photo">${onp('You’re at Level 1 · Stabilize')}${shut(false)}</header>
    <div class="on-photo" style="position:relative;z-index:2;padding:8px 20px 0">
      <span class="callout" style="color:var(--on-photo2)">Your next vantage point</span>
      <div class="display" style="${HUGE};margin-top:6px"><b>Set your routines</b></div>
      <p class="body" style="color:var(--on-photo2);margin-top:10px"><b style="color:var(--on-photo)">Level 2.</b> From here: your routines, your money in full view, and your health stack.</p>
    </div>
    <div style="flex:1"></div>
    <div class="sheet" style="padding-top:22px">
      <div class="between"><span class="title">To get there</span><span class="callout">1 of 3</span></div>
      <div class="tl mt16">
        <div class="tl-item done"><p>Save your 30-day cash plan</p></div>
        <div class="tl-item now"><p>Review this year’s tax</p></div>
        <div class="tl-item later"><p>Book your heart referral</p></div>
      </div>
      <button class="btn press mt20">Take the next step ${ic('arrow', 's18')}</button>
    </div>`;
  }

  /* ── Level up: the biggest moment in the app ─────────── */
  function levelup() {
    return `<div class="full-photo" style="${img('sky')};background-size:auto 215%;background-position:35% 0"></div>
    ${status('on-photo')}
    <header class="bar on-photo">${onp('Level 2 unlocked')}<span class="dash"><i class="on"></i><i></i><i></i><i></i></span></header>
    <div class="on-photo" style="flex:1;min-height:0;position:relative;z-index:2;display:flex;flex-direction:column;padding:0 20px 8px">
      <div style="flex:1;display:grid;place-items:center"><span data-orb="done" data-size="180" style="width:180px;height:180px;display:block;color:var(--on-photo)"></span></div>
      <p class="display" style="${MOMENT}"><b>You’re on stable ground.</b></p>
      <p class="statement" style="font-size:21px;line-height:28px;letter-spacing:-.35px;margin-top:12px">Your cash plan is saved and <b>nothing is overdue</b>. Next, life puts <b>bills and care on a routine</b>.</p>
    </div>
    <div class="foot" style="background:none;flex-direction:row;position:relative;z-index:2"><button class="btn press" style="background:var(--photo-fill);color:var(--on-photo)">Show me</button><button class="btn press" style="background:var(--on-photo);color:#0D0E10">Next ${ic('arrow', 's18')}</button></div>`;
  }

  /* ── Your year, on your birthday ─────────────────────── */
  function yourbirthday() {
    const fig = (label, value) => `<div class="tile" style="min-height:92px"><span class="th"><span>${label}</span></span><span class="num" style="margin-top:10px">${value}</span></div>`;
    return `<div class="full-photo fade" style="${img('birthday')};bottom:auto;height:470px;background-position:center 85%"></div>
    ${status('lt-ink')}
    <header class="bar">${onp('14 March')}${shut(true)}</header>
    <div class="on-photo" style="height:338px;flex:none;position:relative;z-index:2;display:flex;flex-direction:column;justify-content:flex-end;padding:0 20px 24px"><div class="display" style="${HUGE}"><b>Happy birthday, Ama.</b></div></div>
    <div class="scroll lt-lift">
      <div class="between"><span class="title">Your 27th year</span><span class="callout">52 weeks, all lived</span></div>
      <div class="mt12">${dots(Array.from({ length: 52 }, () => 'on'), 26)}</div>
      <div class="tiles mt16">${fig('Missions cleared', '41')}${fig('Found or saved', '£3,180')}${fig('Ideas learned', '26')}${fig('Closer to your Aim', '+38%')}</div>
      <div class="mt16">${says('Here’s to the year ahead, and the home you’re building towards.')}</div>
    </div>`;
  }

  /* ── Register ────────────────────────────────────────── */
  K.screen('library', { from: '14, 15, 12', note: 'A wall of ideas as photographs: today’s is tall, then thinkers as initials, ideas for your level and collections.', build: library });
  K.screen('lens', { from: '14, 17, 15', note: 'One thinker: a photograph for their view, the idea drawn in three lines, their ideas as a shelf that unlocks as you grow.', build: lens });
  K.screen('idea', { from: '14, 4', note: 'The photograph leads, the title is huge, the idea is one two-tone sentence with its drawing, and one button: use it today.', build: idea });
  K.screen('lensask', { from: '7, 3', note: 'Your question, three lenses to see it through, and life’s answer with your numbers drawn as one capped slice.', build: lensask });
  K.screen('recall', { from: '21, 14', note: 'A sheet over Today: the idea’s picture, one question, three guesses. Tap one to see the answer and the gap grow.', build: recall });
  K.screen('learning', { from: '5, 12, 14', note: 'What your learning changed: one figure, 30 days in dots, then each idea beside its real result.', build: learning });
  K.screen('teach', { from: '11, 7', note: 'A page for your own words. Tap Check and what you covered turns bright, with the one part to add.', build: teach });
  K.screen('hill', { from: '14, 11, 17', note: 'Napoleon Hill’s idea: a photograph, one sentence, a drawing of drift against one aim, and four principles ticked from your own Aim.', build: hill });
  K.screen('learned', { from: '14, 15, 18', note: 'A shelf of what you’ve learned as photographs, recalls due first, each saying where it came up and what it led to.', build: learned });
  K.screen('drawkit', { from: '8, 12', note: 'Eight of the kit’s thirty devices, each with one lit thing. Switch between clean lines and hand-drawn.', build: drawkit });
  K.screen('teachoffer', { from: '14, 12, 9', note: 'The Tax check with your payslip in view. Teach me sits in the same card as the code it explains, and again in Talk.', build: teachoffer });
  K.screen('lessonready', { from: '4, 14', note: 'The lesson’s cover: your payslip, a huge title, three bites each with its own drawing, and how deep to go. Tap the chip to watch it being built.', build: lessonready });
  K.screen('bite', { from: '4, 8', note: 'One idea, one picture: the code split into its two parts with the letter lit, then two sentences.', build: bite });
  K.screen('predict', { from: '6, 8', note: 'Guess before you see. The second bar is a dotted question until you tap More or Less.', build: predict });
  K.screen('puzzle', { from: '6, 16', note: 'Two codes drawn side by side, then one pick-one question. A wrong pick is never punished. Tap an answer.', build: puzzle });
  K.screen('lessonrecap', { from: '11, 3', note: 'The three bites in one row of pictures, then the whole idea as three ticked lines.', build: lessonrecap });
  K.screen('tellback', { from: '9, 19', note: 'You explain, life listens and asks one curious question. Tap the orb when you’re done and it becomes the picture, thinking.', build: tellback });
  K.screen('gaps', { from: '19, 7', note: 'Kind first: what you said well, in your own words, then the one gap drawn as the open link in a chain.', build: gaps });
  K.screen('gotit', { from: '10, 2', note: 'The earned moment: her photograph fills the top, then three big words, what you can now do, and straight back to the action.', build: gotit });
  K.screen('bitedrawn', { from: '8, 4', note: 'A bite drawn live in the hand-drawn mode: the lit box is the sentence being read, the next box is still to come.', build: bitedrawn });
  K.screen('recap', { from: '18, 3, 12', note: 'This week as a photograph and one sentence with its icons, older weeks resting behind. Tap a week behind to bring it forward.', build: recap });
  K.screen('vantage', { from: '10, 19', note: 'Where you stand and the next point ahead, over the hilltop. Three steps as a climb, the next one lit.', build: vantage });
  K.screen('levelup', { from: '2, 9', note: 'The biggest moment: open sky, the orb complete, one sentence at 46 points.', build: levelup });
  K.screen('yourbirthday', { from: '10, 5, 12', note: 'life wishes you a happy birthday: the photograph, 52 weeks lived in dots, and your year in four calm figures.', build: yourbirthday });
})();
