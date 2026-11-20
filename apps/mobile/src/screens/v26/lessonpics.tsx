/**
 * The lesson pictures, drawn as the board draws them (FENNY_LEARNING.md §4): one idea per picture, one line weight,
 * round ends, one lit thing (ember is the thing that changes), clean or hand-drawn. Ported from the board's `pen()`.
 */
import type { ReactElement, ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect, Text as SvgText, TSpan } from 'react-native-svg';
import { fonts, useTokens } from '@/design';
import { lessonNumbers } from '@/state/learn';

type Tokens = ReturnType<typeof useTokens>;
type Tone = 'ink' | 'lit' | 'q' | 'soft' | 'ink2';
type TextOpts = { anchor?: 'start' | 'middle' | 'end'; size?: number; weight?: 500 | 600; fill?: string };

const r1 = (n: number) => Math.round(n * 10) / 10;

/** One pen for every picture. `hand` gives lines, boxes and rings the marker wobble; fills, text and curves stay clean. */
function makePen(t: Tokens, hand = false) {
  let n = 0, key = 0;
  const wob = (s: number, sd: number) => 2 * (0.55 * Math.sin(0.085 * s + sd) + 0.25 * Math.sin(0.21 * s + 1.7 * sd));
  const run = (x1: number, y1: number, x2: number, y2: number) => {
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
  const tone = (tn?: Tone) => (tn === 'lit' ? t.ember : tn === 'q' ? t.inkQuiet : tn === 'soft' ? t.surface3 : tn === 'ink2' ? t.ink2 : t.ink);
  const st = (tn?: Tone, fill?: string, dotted?: boolean) => ({
    fill: fill ?? 'none', stroke: tone(tn), strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, strokeDasharray: dotted ? '1 7' : undefined,
  });
  const P = {
    line: (x1: number, y1: number, x2: number, y2: number, tn?: Tone, dotted?: boolean) => <Path key={key++} d={`M${r1(x1)} ${r1(y1)}${run(x1, y1, x2, y2)}`} {...st(tn, undefined, dotted)} />,
    poly: (pts: number[][], tn?: Tone, fill?: string) => <Path key={key++} d={`M${pts[0][0]} ${pts[0][1]}${pts.slice(1).map((q, k) => run(pts[k][0], pts[k][1], q[0], q[1])).join('')}`} {...st(tn, fill)} />,
    shape: (pts: number[][], tn?: Tone, fill?: string) => <Path key={key++} d={`M${pts[0][0]} ${pts[0][1]}${pts.map((q, k) => { const z = pts[(k + 1) % pts.length]; return run(q[0], q[1], z[0], z[1]); }).join('')}Z`} {...st(tn, fill)} />,
    box: (bx: number, by: number, w: number, h: number, r: number, tn?: Tone, fill?: string, dotted?: boolean) => {
      const x = r1(bx), y = r1(by), X = r1(bx + w), Y = r1(by + h);
      const d = `M${r1(x + r)} ${y}${run(x + r, y, X - r, y)}Q${X} ${y} ${X} ${r1(y + r)}${run(X, y + r, X, Y - r)}Q${X} ${Y} ${r1(X - r)} ${Y}${run(X - r, Y, x + r, Y)}Q${x} ${Y} ${x} ${r1(Y - r)}${run(x, Y - r, x, y + r)}Q${x} ${y} ${r1(x + r)} ${y}Z`;
      return <Path key={key++} d={d} {...st(tn, fill, dotted)} />;
    },
    ring: (cx: number, cy: number, r: number, tn?: Tone, fill?: string) => {
      if (!hand || r < 8) return <Circle key={key++} cx={cx} cy={cy} r={r} {...st(tn, fill)} />;
      const sd = ++n * 1.9;
      const pts = Array.from({ length: 30 }, (_, k) => { const a = k / 30 * Math.PI * 2, rr = r + 1.3 * (0.55 * Math.sin(2 * a + sd) + 0.25 * Math.sin(5 * a + 1.7 * sd)); return `${r1(cx + rr * Math.cos(a))} ${r1(cy + rr * Math.sin(a))}`; });
      return <Path key={key++} d={`M${pts.join('L')}Z`} {...st(tn, fill)} />;
    },
    dot: (cx: number, cy: number, r: number, tn?: Tone) => <Circle key={key++} cx={cx} cy={cy} r={r} fill={tone(tn)} />,
    halo: (x: number, y: number, w: number, h: number, r: number) => <Rect key={key++} x={x} y={y} width={w} height={h} rx={r} fill={t.emberTint} />,
    glow: (cx: number, cy: number, r: number) => <Circle key={key++} cx={cx} cy={cy} r={r} fill={t.emberTint} />,
    head: (x: number, y: number, a: number, tn?: Tone) => <Path key={key++} d={`M${r1(x - 6 * Math.cos(a - 0.6))} ${r1(y - 6 * Math.sin(a - 0.6))}L${r1(x)} ${r1(y)}L${r1(x - 6 * Math.cos(a + 0.6))} ${r1(y - 6 * Math.sin(a + 0.6))}`} {...st(tn)} />,
    arrow: (x1: number, y1: number, x2: number, y2: number, tn?: Tone) => <G key={key++}>{P.line(x1, y1, x2, y2, tn)}{P.head(x2, y2, Math.atan2(y2 - y1, x2 - x1), tn)}</G>,
    text: (x: number, y: number, s: string, o: TextOpts = {}) => (
      <SvgText key={key++} x={x} y={y} textAnchor={o.anchor ?? 'middle'} fontSize={o.size ?? 11} fontFamily={(o.weight ?? 600) === 600 ? fonts.sansSemibold : fonts.sansMedium} fontWeight={String(o.weight ?? 600) as '600'} fill={o.fill ?? t.ink2}>{s}</SvgText>
    ),
    /** A big figure in the picture (the code itself). */
    big: (x: number, y: number, s: ReactElement | string, size: number, fill: string, anchor: 'start' | 'end' = 'start', spacing = 0) => (
      <SvgText key={key++} x={x} y={y} textAnchor={anchor} fontSize={size} fontFamily={fonts.sansSemibold} fontWeight="600" letterSpacing={spacing} fill={fill}>{s}</SvgText>
    ),
    k: () => key++,
  };
  return P;
}

/** A drawn picture at the width it's given, keeping its shape. */
export function Pic({ w, h, label, children, style }: { w: number; h: number; label?: string; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ width: '100%', aspectRatio: w / h }, style]} accessible={!!label} accessibilityRole={label ? 'image' : undefined} accessibilityLabel={label}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`}>{children}</Svg>
    </View>
  );
}

const money = (n: number) => `£${n.toLocaleString('en-GB')}`;

/** The barbell: a heavy safe side, a small bold side, nothing in the middle. */
export function PicBarbell({ hand }: { hand?: boolean }) {
  const t = useTokens(), p = makePen(t, hand);
  return (
    <Pic w={330} h={112} label="A barbell: a heavy safe side, a small bold side and nothing in the middle">
      {p.line(20, 44, 310, 44)}{p.box(34, 4, 24, 80, 10, 'ink', t.surface2)}{p.box(62, 14, 14, 60, 7, 'ink', t.surface2)}
      {p.halo(264, 12, 36, 64, 18)}{p.box(275, 24, 14, 40, 7, 'lit', t.ember)}
      {p.text(34, 106, 'Very safe', { anchor: 'start', size: 13, fill: t.ink })}
      {p.text(172, 68, 'Nothing in the middle', { fill: t.inkQuiet })}
      {p.text(300, 106, 'Small bold bets', { anchor: 'end', size: 13, fill: t.emberText })}
    </Pic>
  );
}

/** Three lines meet the same shock: one breaks, one carries on, one climbs. */
export function PicStress({ hand }: { hand?: boolean }) {
  const t = useTokens(), p = makePen(t, hand);
  return (
    <Pic w={330} h={112} label="Under the same stress one line breaks, one carries on and one gets stronger">
      {[55, 165, 275].map(x => p.line(x, 10, x, 80, 'q', true))}
      {p.line(16, 44, 50, 44)}{p.line(60, 50, 68, 60)}{p.line(74, 68, 79, 79)}
      {p.line(126, 44, 204, 44)}
      {p.line(236, 44, 268, 44)}{p.glow(313, 15, 13)}
      <Path d="M276 43Q300 38 312 17" fill="none" stroke={t.ember} strokeWidth={2} strokeLinecap="round" />{p.dot(313, 15, 4.5, 'lit')}
      {p.text(55, 102, 'Breaks')}{p.text(165, 102, 'Survives')}{p.text(275, 102, 'Gets stronger', { fill: t.emberText })}
    </Pic>
  );
}

/** Drift on the left, one aim on the right: every arrow starts to point the same way. */
export function PicAim({ hand }: { hand?: boolean }) {
  const t = useTokens(), p = makePen(t, hand), T = [292, 54];
  const drift = [[28, 36, 50, 24], [62, 60, 46, 80], [86, 26, 106, 42], [98, 76, 122, 72], [134, 48, 128, 22]];
  const aimed = [[190, 20], [182, 56], [194, 92], [232, 32], [236, 80]].map(([x, y]) => { const a = Math.atan2(T[1] - y, T[0] - x); return p.arrow(x, y, r1(x + 26 * Math.cos(a)), r1(y + 26 * Math.sin(a))); });
  return (
    <Pic w={330} h={130} label="Scattered arrows on the left, arrows all pointing at one aim on the right">
      {drift.map(d => p.arrow(d[0], d[1], d[2], d[3], 'q'))}{aimed}
      {p.glow(T[0], T[1], 15)}{p.dot(T[0], T[1], 6, 'lit')}
      {p.text(80, 122, 'Drifting')}{p.text(242, 122, 'One aim, read every day', { fill: t.emberText })}
    </Pic>
  );
}

/** A small part of a sum as the capped bet; the rest stays put. */
export function PicCap({ total, bet }: { total: number; bet: number }) {
  const t = useTokens(), p = makePen(t);
  return (
    <Pic w={290} h={62} label={`${money(bet)} of an estimated ${money(total)} rebate as a small, capped bet`}>
      {p.text(0, 12, `Your rebate, est. ${money(total)}`, { anchor: 'start', size: 13, fill: t.ink })}{p.text(290, 12, money(bet), { anchor: 'end', size: 13, fill: t.emberText })}
      {p.box(1, 22, 288, 20, 10, 'ink', t.surface2)}{p.halo(256, 16, 37, 32, 14)}{p.box(263, 22, 26, 20, 8, 'lit', t.ember)}
      {p.text(0, 58, 'Stays safe', { anchor: 'start' })}{p.text(290, 58, 'A small, capped bet', { anchor: 'end' })}
    </Pic>
  );
}

/** Bite 1: the code in two parts. The letter is the lit thing. */
export function PicParts() {
  const t = useTokens(), p = makePen(t), L = lessonNumbers;
  return (
    <Pic w={330} h={150} label={`The code ${L.code} in two parts: the number is tax-free pay, the letter is the rule`}>
      {p.halo(178, 12, 46, 66, 14)}
      {p.big(170, 66, L.number, 56, t.ink, 'end', -2)}{p.big(186, 66, L.letter, 56, t.ember)}
      {p.poly([[42, 86], [42, 93], [170, 93], [170, 86]])}{p.line(106, 93, 106, 102)}
      {p.poly([[186, 86], [186, 93], [216, 93], [216, 86]], 'lit')}{p.line(201, 93, 201, 102, 'lit')}
      {p.text(106, 122, 'Tax-free pay', { size: 13, fill: t.ink })}{p.text(106, 141, `add a 0: ${money(L.allowance)}`, { size: 13, weight: 500 })}
      {p.text(186, 122, 'The letter', { anchor: 'start', size: 13, fill: t.emberText })}{p.text(186, 141, `${L.letter} = the standard one`, { anchor: 'start', size: 13, weight: 500 })}
    </Pic>
  );
}

/** Bite 2, guess first: the second bar stays a dotted question until you answer. */
export function PicGuess({ seen }: { seen: boolean }) {
  const t = useTokens(), p = makePen(t), L = lessonNumbers, x0 = 20, W = 290, w2 = Math.round(W * L.lower / L.allowance);
  return (
    <Pic w={330} h={seen ? 132 : 112} label={seen ? `With ${L.lowerCode}, ${money(L.allowance - L.lower)} more of your pay is taxed than with ${L.code}` : 'Two codes side by side. The second is hidden until you guess'}>
      {p.text(x0, 14, L.code, { anchor: 'start', size: 13, fill: t.ink })}{p.text(310, 14, `${money(L.allowance)} tax-free`, { anchor: 'end' })}
      {p.box(x0, 22, W, 20, 10, 'ink', t.surface2)}
      {p.text(x0, 72, L.lowerCode, { anchor: 'start', size: 13, fill: t.ink })}
      {seen ? <G>
        {p.text(310, 72, `${money(L.lower)} tax-free`, { anchor: 'end' })}
        {p.halo(x0 + w2 - 2, 74, W - w2 + 8, 32, 12)}{p.box(x0 + w2 + 4, 80, W - w2 - 4, 20, 8, 'lit', t.ember)}{p.box(x0, 80, w2, 20, 10, 'ink', t.surface2)}
        {p.text(310, 124, `${money(L.allowance - L.lower)} more of your pay is taxed`, { anchor: 'end', fill: t.emberText })}
      </G> : <G>{p.text(310, 72, 'more tax, or less?', { anchor: 'end' })}{p.box(x0, 80, W, 20, 10, 'q', undefined, true)}</G>}
    </Pic>
  );
}

/** Bite 3: the right code meets the dotted line; the emergency code overshoots it. */
export function PicWrong() {
  const t = useTokens(), p = makePen(t), L = lessonNumbers;
  const months = (x: number, over: boolean) => Array.from({ length: 6 }, (_, k) => (
    <G key={p.k()}>{over ? <Rect x={x + k * 21} y={52} width={12} height={20} rx={5} fill={t.ember} /> : null}{p.box(x + k * 21, 80, 12, 34, 5, 'ink', t.surface2)}</G>
  ));
  return (
    <Pic w={330} h={118} label="Monthly tax with the right code meets the right amount. With the emergency code it goes over">
      {p.text(16, 11, 'Right code', { anchor: 'start' })}{p.text(186, 11, 'Emergency code', { anchor: 'start' })}
      {p.big(16, 36, L.code, 20, t.ink, 'start', -0.4)}
      {p.big(186, 36, <><TSpan>{`${L.code} `}</TSpan><TSpan fill={t.ember}>M1</TSpan></>, 20, t.ink, 'start', -0.4)}
      {p.line(16, 76, 139, 76, 'q', true)}{p.line(186, 76, 309, 76, 'q', true)}
      {p.text(139, 67, 'the right amount', { anchor: 'end', fill: t.inkQuiet })}
      {months(16, false)}{months(186, true)}
    </Pic>
  );
}

/**
 * Bite 2, drawn live: the flow builds as it is read. `step` is how much is drawn (1 the parts, 2 this month's pay,
 * 3 take off one twelfth, 4 tax the rest); the lit box is the sentence being read.
 */
export function PicFlow({ hand, step = 4 }: { hand?: boolean; step?: number }) {
  const t = useTokens(), p = makePen(t, hand), L = lessonNumbers;
  const at = (s: number) => (step >= s ? 1 : 0);
  return (
    <Pic w={330} h={176} label={`A flow: this month’s pay, take off one twelfth of the tax-free amount, then tax the rest, about ${money(L.twelfth)} a month`}>
      {p.text(18, 14, `${money(L.allowance)} tax-free, in 12 parts`, { anchor: 'start' })}
      {p.halo(12, 20, 32, 32, 10)}{p.box(18, 26, 20, 20, 6, 'lit', t.ember)}
      {Array.from({ length: 11 }, (_, i) => p.box(18 + (i + 1) * 24.8, 26, 20, 20, 6))}
      <G opacity={at(3)}>
        <Path d="M28 52V70Q28 78 36 78H163Q171 78 171 86V98" fill="none" stroke={t.ember} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />{p.head(171, 99, Math.PI / 2, 'lit')}
      </G>
      <G opacity={at(2)}>{p.box(18, 104, 88, 48, 12)}{p.text(62, 125, 'This month’s', { fill: t.ink })}{p.text(62, 140, 'pay', { fill: t.ink })}{p.arrow(110, 128, 122, 128)}</G>
      <G opacity={at(3)}>
        {p.halo(122, 98, 98, 60, 16)}{p.box(128, 104, 86, 48, 12, 'lit', t.surface)}{p.text(171, 125, 'Take off', { fill: t.emberText })}{p.text(171, 140, 'one twelfth', { fill: t.emberText })}
        {p.line(218, 128, 225, 128, 'lit')}{p.dot(229, 128, 3.5, 'lit')}
        {p.text(171, 172, `about ${money(L.twelfth)} a month`, { fill: t.emberText })}
      </G>
      <G opacity={step >= 4 ? 1 : step >= 3 ? 0.35 : 0}>{p.box(238, 104, 74, 48, 12, 'q', undefined, true)}{p.text(275, 125, 'Tax', { fill: t.inkQuiet })}{p.text(275, 140, 'the rest', { fill: t.inkQuiet })}</G>
    </Pic>
  );
}

/** How the telling went: the links said well, and the one still open (lit). */
export function PicChain({ links }: { links: { label: string; ok: boolean }[] }) {
  const t = useTokens(), p = makePen(t), xs = [58, 162, 264];
  const tick = (x: number) => <Path key={p.k()} d={`M${x - 4} 26l3 3 5-6`} fill="none" stroke={t.surface} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />;
  const gap = links.findIndex(l => !l.ok);
  return (
    <Pic w={330} h={80} label={links.map(l => `${l.label}, ${l.ok ? 'said well' : 'the gap'}`).join('; ')}>
      {p.line(70, 26, 150, 26, links[1].ok ? 'ink' : 'q', !links[1].ok)}{p.line(176, 26, 250, 26, links[2].ok ? 'ink' : 'q', !links[2].ok)}
      {links.map((l, i) => l.ok
        ? <G key={p.k()}>{p.dot(xs[i], 26, 10, 'ink')}{tick(xs[i])}</G>
        : <G key={p.k()}>{i === gap ? p.glow(xs[i], 26, 17) : null}{p.ring(xs[i], 26, 9, i === gap ? 'lit' : 'q', t.surface)}</G>)}
      {links.map((l, i) => p.text(xs[i], 56, l.label, { size: 13, fill: !l.ok && i === gap ? t.emberText : t.ink }))}
      {links.map((l, i) => p.text(xs[i], 73, l.ok ? 'said well' : i === gap ? 'the gap' : 'still to say'))}
    </Pic>
  );
}

/* Small pictures: one per bite, reused on the cover and the recap. */
export type MiniName = 'parts' | 'twelfth' | 'wrong';
export function Mini({ name, width = 110 }: { name: MiniName; width?: number }) {
  const t = useTokens(), p = makePen(t), L = lessonNumbers;
  const body = name === 'parts'
    ? <G>{p.big(70, 34, L.number, 24, t.ink, 'end', -0.5)}{p.big(75, 34, L.letter, 24, t.ember)}{p.poly([[14, 42], [14, 47], [70, 47], [70, 42]])}{p.poly([[75, 42], [75, 47], [90, 47], [90, 42]], 'lit')}</G>
    : name === 'twelfth'
      ? <G>{Array.from({ length: 12 }, (_, k) => <Rect key={k} x={r1(7 + k * 8.2)} y={10} width={6} height={20} rx={3} fill={k ? t.ink : t.ember} opacity={k ? 0.22 : 1} />)}{p.poly([[7, 37], [7, 42], [103, 42], [103, 37]])}{p.text(55, 56, '÷ 12')}</G>
      : <G>{p.halo(60, 14, 42, 32, 10)}<SvgText x={56} y={36} textAnchor="end" fontSize={16} fontFamily={fonts.sansSemibold} fontWeight="600" fill={t.ink2}>{L.code}</SvgText>{p.big(64, 38, 'M1', 24, t.ember)}{p.line(12, 51, 98, 51, 'q', true)}</G>;
  const height = Math.round(width * 60 / 110);
  return <View style={{ width, height }} importantForAccessibility="no-hide-descendants"><Svg width={width} height={height} viewBox="0 0 110 60">{body}</Svg></View>;
}

/* Eight of the kit's thirty devices. Each has exactly one lit thing. */
export type DeviceName = 'flow' | 'cycle' | 'compare' | 'layers' | 'timeline' | 'venn' | 'funnel' | 'things';
export function Device({ name, hand }: { name: DeviceName; hand?: boolean }) {
  const t = useTokens(), p = makePen(t, hand);
  const body: Record<DeviceName, () => ReactElement> = {
    flow: () => <G>{p.box(4, 24, 28, 24, 7)}{p.arrow(36, 36, 46, 36)}{p.box(50, 24, 28, 24, 7)}{p.arrow(82, 36, 92, 36)}{p.halo(91, 19, 38, 34, 12)}{p.box(96, 24, 28, 24, 7, 'lit', t.ember)}</G>,
    cycle: () => <G>{p.ring(66, 36, 24)}{([[86.8, 24, 1.05], [66, 60, Math.PI], [45.2, 24, -1.05]] as const).map(h => p.head(h[0], h[1], h[2]))}{p.ring(86.8, 48, 6, 'ink', t.surface)}{p.ring(45.2, 48, 6, 'ink', t.surface)}{p.glow(66, 12, 12)}{p.dot(66, 12, 6.5, 'lit')}</G>,
    compare: () => <G>{p.line(22, 62, 110, 62)}{p.box(38, 32, 20, 30, 6)}{p.halo(68, 8, 34, 58, 12)}{p.box(75, 14, 20, 48, 6, 'lit', t.ember)}</G>,
    layers: () => <G>{[50, 37].map(y => p.shape([[26, y], [66, y - 12], [106, y], [66, y + 12]], 'ink', t.surface))}<Ellipse cx={66} cy={24} rx={48} ry={19} fill={t.emberTint} />{p.shape([[26, 24], [66, 12], [106, 24], [66, 36]], 'lit', t.ember)}</G>,
    timeline: () => <G>{p.line(10, 36, 122, 36)}{[24, 54, 112].map(x => p.ring(x, 36, 5.5, 'ink', t.surface))}{p.glow(84, 36, 13)}{p.dot(84, 36, 6.5, 'lit')}</G>,
    venn: () => <G><Path d="M66 19A22 22 0 0 1 66 53A22 22 0 0 1 66 19Z" fill={t.ember} />{p.ring(52, 36, 22)}{p.ring(80, 36, 22)}</G>,
    funnel: () => <G>{p.box(14, 6, 104, 14, 7)}{p.box(32, 27, 68, 14, 7)}{p.halo(44, 43, 44, 24, 12)}{p.box(50, 48, 32, 14, 7, 'lit', t.ember)}</G>,
    things: () => <G>
      {p.poly([[10, 36], [26, 22], [42, 36]])}{p.poly([[14, 36], [14, 56], [38, 56], [38, 36]])}{p.poly([[23, 56], [23, 46], [29, 46], [29, 56]])}
      {p.ring(66, 40, 16)}{p.line(66, 40, 66, 30)}{p.line(66, 40, 73, 44)}
      {p.line(94, 60, 100, 16)}{p.line(114, 60, 120, 16)}{p.line(95.2, 51.2, 115.2, 51.2)}{p.line(97, 38, 117, 38)}{p.halo(93, 17, 31, 15, 7)}{p.line(98.8, 24.8, 118.8, 24.8, 'lit')}
    </G>,
  };
  return <Pic w={132} h={72}>{body[name]()}</Pic>;
}

/** The picture for an idea, by name. */
export type IdeaPicture = 'barbell' | 'stress' | 'aim' | DeviceName;
export function IdeaPic({ name, hand }: { name: IdeaPicture; hand?: boolean }) {
  if (name === 'barbell') return <PicBarbell hand={hand} />;
  if (name === 'stress') return <PicStress hand={hand} />;
  if (name === 'aim') return <PicAim hand={hand} />;
  return <View style={{ paddingHorizontal: '18%' }}><Device name={name} hand={hand} /></View>;
}
