import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useAnimatedProps, useAnimatedStyle, useFrameCallback, useSharedValue, type SharedValue } from 'react-native-reanimated';
import Svg, { Line } from 'react-native-svg';
import { useCalmMotion, useTokens } from '../theme';

/** Port of board v17 mountOrb: the same thirty dots travel between every state.
 * Original ring, Fibonacci sphere, clockwork, searching web, voice and spring gather.
 * Geometry and animation run on Reanimated's UI thread; no JS animation timer. */
/** `news` and `rest` belong to the orb in the top bar (Edem, 21 Nov 2026). Both hold the ring still with the first
 * dot at the top, so each dot keeps its area's place, and both breathe slowly. In `news` the dots of the areas with
 * something new also light up red and pulse one after another. */
export type OrbState = 'ring' | 'thinking' | 'working' | 'searching' | 'listening' | 'done' | 'voice' | 'news' | 'rest';
type Point = { x: number; y: number; z: number; alpha: number; scale: number };
const STATES = ['ring', 'thinking', 'working', 'searching', 'listening', 'done', 'news', 'rest'] as const;
/** Laps a second: the everyday ring one lap in 12 s; the top bar's two states hold still. */
const LAPS = [1 / 12, 1 / 12, 1 / 12, 1 / 12, 1 / 12, 1 / 12, 0, 0];
/** Something new: each lit dot pulses for PULSE_S in turn, then the ring waits PAUSE_S before the next round. */
const PULSE_S = .8, PAUSE_S = 1;
const BREATH_S = 5;
const NONE: number[] = [];
/** Ten dots, ten areas of a life (Edem, 21 Nov 2026). Each ring dot belongs to one area, clockwise from the top in this
 * order; when Life has something new, that area's dot lights up red. */
export const ORB_AREAS = ['money', 'home', 'work', 'body', 'food', 'people', 'admin', 'learning', 'goals', 'you'] as const;
export type OrbArea = (typeof ORB_AREAS)[number];
export const ORB_AREA_NAMES: Record<OrbArea, string> = { money: 'Money', home: 'Home', work: 'Work', body: 'Body', food: 'Food', people: 'People', admin: 'Admin', learning: 'Learning', goals: 'Goals', you: 'You' };
const sphere = (n: number) => Array.from({ length: n }, (_, i) => {
  const y = 1 - 2 * (i + .5) / n, r = Math.sqrt(1 - y * y), a = i * Math.PI * (3 - Math.sqrt(5));
  return [Math.cos(a) * r, y, Math.sin(a) * r];
});
const SPHERE = sphere(30), SEARCH = sphere(10);
const NEIGHBOURS = SEARCH.map((a, i) => SEARCH.map((b, j) => ({ j, d: a.reduce((s, v, k) => s + v * b[k], 0) })).filter(v => v.j !== i).sort((a, b) => b.d - a.d).slice(0, 3).map(v => v.j));
const PAIRS = Array.from({ length: 10 }, (_, a) => Array.from({ length: 9 - a }, (_, i) => [a, a + i + 1])).flat();
const ALine = Animated.createAnimatedComponent(Line);
function target(state: number, k: number, r: number, t: number, spin: number, voice: number, head: number, trail: number[], marks: number[] = []): Point {
  'worklet';
  const i = k % 10, a = i / 10 * Math.PI * 2 + spin, tail = .3 + .7 * i / 10;
  const ring = { x: Math.cos(a) * r, y: Math.sin(a) * r, z: .5, alpha: k < 10 ? tail : 0, scale: 1 };
  if (state === 0 || state === 5) return ring;
  if (state === 6 || state === 7) {
    // The top bar: still, first dot at twelve o'clock, so a dot's place is its area. Both states breathe; with
    // something new, the lit dots also pulse red one after another on top of the breath (Edem, 21 Nov).
    const b = i / 10 * Math.PI * 2 - Math.PI / 2;
    const breath = .5 - .5 * Math.cos(t / BREATH_S * Math.PI * 2), rr = r * (.84 + .16 * breath);
    const at = state === 6 && k < 10 ? marks.indexOf(i) : -1;
    if (at < 0) return { x: Math.cos(b) * rr, y: Math.sin(b) * rr, z: .5, alpha: k < 10 ? .4 + .32 * breath : 0, scale: .9 + .1 * breath };
    const cycle = marks.length * PULSE_S + PAUSE_S, inCycle = t % cycle, turn = Math.floor(inCycle / PULSE_S);
    const env = turn === at ? Math.pow(Math.sin((inCycle - at * PULSE_S) / PULSE_S * Math.PI), 2) : 0;
    return { x: Math.cos(b) * rr, y: Math.sin(b) * rr, z: 1, alpha: .9 + .1 * env, scale: 1.12 + .06 * breath + .6 * env };
  }
  if (state === 2) {
    if (k < 10) { const b = a + t / 12 * Math.PI * 2 * 1.2; return { ...ring, x: Math.cos(b) * r, y: Math.sin(b) * r }; }
    if (k >= 21) return { ...ring, alpha: 0 };
    const inner = k >= 17, j = k - (inner ? 17 : 10), n = inner ? 4 : 7;
    const b = j / n * Math.PI * 2 + (inner ? t / 3.4 : -t / 5.2) * Math.PI * 2, rr = r * (inner ? .27 : .6);
    return { x: Math.cos(b) * rr, y: Math.sin(b) * rr, z: .5, alpha: .3 + .7 * j / n, scale: inner ? .66 : .82 };
  }
  if (state === 4) {
    const push = voice * (.35 + .65 * (.5 + .5 * Math.sin(t * 6 - i * .9))), rr = r * (1 + .24 * push);
    return { x: Math.cos(a) * rr, y: Math.sin(a) * rr, z: .5, alpha: k < 10 ? .78 + .22 * push : 0, scale: 1 + .35 * push };
  }
  if (state === 3 && k >= 10) return { ...ring, alpha: 0 };
  const p = state === 1 ? SPHERE[k] : SEARCH[k], angle = t * (state === 1 ? .42 : .3), tilt = state === 1 ? .32 : .35;
  const x = p[0] * Math.cos(angle) + p[2] * Math.sin(angle), z1 = -p[0] * Math.sin(angle) + p[2] * Math.cos(angle);
  const y = p[1] * Math.cos(tilt) - z1 * Math.sin(tilt), z = p[1] * Math.sin(tilt) + z1 * Math.cos(tilt), depth = (z + 1) / 2, pr = 3.2 / (3.2 - z);
  const ti = trail.indexOf(k), hop = k === head ? 1 : ti >= 0 ? .8 - ti * .14 : .3;
  return { x: x * r * pr * (state === 1 ? .96 : 1), y: y * r * pr * (state === 1 ? .96 : 1), z: depth,
    alpha: state === 1 ? (.1 + .9 * Math.pow(depth, 1.5)) * (.82 + .18 * (.5 + .5 * Math.sin(t * 2.2 + k * 1.37))) : hop * (.45 + .55 * depth),
    scale: state === 1 ? .5 + .62 * depth : (.78 + .34 * depth) * (k === head ? 1.15 : 1) };
}
export function LifeOrb({ size = 56, state = 'ring', color, rings: _rings, marks, markColor }: {
  size?: number; state?: OrbState; color?: string; rings?: 1 | 2;
  /** Ring dots (0 to 9, see ORB_AREAS) drawn in `markColor`: the areas with something new, newest first. In `news` they pulse in this order. */
  marks?: number[]; markColor?: string;
}) {
  const tokens = useTokens(), calm = useCalmMotion(), ink = color ?? tokens.ink;
  const dot = Math.max(2.6, size / 12), r = size / 2 - Math.max(2, size / 14) - dot / 2;
  const initialMode = STATES.indexOf(state === 'voice' ? 'listening' : state);
  const lit = marks ?? NONE, litKey = lit.join(',');
  const initialPoints = Array.from({ length: 30 }, (_, k) => target(initialMode, k, r, 0, 0, .5, 0, [], lit));
  const mode = useSharedValue(initialMode);
  const points = useSharedValue<Point[]>(initialPoints);
  const frozen = useSharedValue(initialPoints), elapsed = useSharedValue(2000), time = useSharedValue(0), spin = useSharedValue(0);
  const head = useSharedValue(0), trail = useSharedValue<number[]>([]), edges = useSharedValue<Record<string, number>>({});
  const hopAt = useSharedValue(0), gather = useSharedValue(0), velocity = useSharedValue(0), voice = useSharedValue(0);
  const laps = useSharedValue(LAPS[initialMode] ?? 1 / 12), markAt = useSharedValue<number[]>(lit);
  useEffect(() => {
    frozen.value = points.value;
    mode.value = STATES.indexOf(state === 'voice' ? 'listening' : state);
    elapsed.value = calm ? 2000 : 0;
    markAt.value = lit;
    if (calm) points.value = Array.from({ length: 30 }, (_, k) => target(mode.value, k, r, 0, 0, .5, 0, [], lit));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- litKey stands for lit
  }, [state, calm, r, mode, elapsed, frozen, points, litKey, markAt]);
  const frame = useFrameCallback(f => {
    const dt = Math.min(50, f.timeSincePreviousFrame ?? 16), factor = dt / 16;
    time.value += dt / 1000; elapsed.value += dt;
    const t = time.value, m = mode.value;
    // The speed eases toward each state's own pace (about 0.4 s), so the ring never jerks into a spin or stops dead.
    laps.value += ((LAPS[m] ?? 1 / 12) - laps.value) * Math.min(1, .045 * factor);
    spin.value += dt / 1000 * laps.value * Math.PI * 2 * (m === 4 ? 1 - .85 * Math.min(1, elapsed.value / 700) : 1);
    voice.value += ((m === 4 ? .25 + .75 * Math.pow(Math.abs(Math.sin(t * 1.7) * Math.sin(t * .61 + .9)), .6) : 0) - voice.value) * .2;
    const goal = m === 5 && elapsed.value < 450 ? 1 : 0;
    velocity.value = (velocity.value + (goal - gather.value) * .16 * factor) * Math.pow(.6, factor);
    gather.value += velocity.value * factor;
    if (m === 3 && t - hopAt.value > .55) {
      hopAt.value = t;
      let nb = NEIGHBOURS[head.value].filter(j => !trail.value.includes(j));
      if (!nb.length) nb = NEIGHBOURS[head.value];
      const nx = nb[Math.floor(t * 7.31) % nb.length];
      edges.value = { ...edges.value, [`${Math.min(head.value, nx)}-${Math.max(head.value, nx)}`]: t };
      trail.value = [head.value, ...trail.value].slice(0, 3); head.value = nx;
    }
    if (m !== 3 && elapsed.value > 700) { edges.value = {}; trail.value = []; }
    const gr = 1 - .62 * Math.max(-.2, gather.value), gg = Math.min(1, Math.max(0, gather.value));
    points.value = Array.from({ length: 30 }, (_, k) => {
      const to = target(m, k, r, t, spin.value, voice.value, head.value, trail.value, markAt.value);
      const u = Math.max(0, Math.min(1, (elapsed.value - k % 10 * 38 - (k >= 10 ? 120 : 0)) / 720));
      const e = u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2, from = frozen.value[k] ?? to;
      const p = { x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e, z: from.z + (to.z - from.z) * e,
        alpha: from.alpha + (to.alpha - from.alpha) * e, scale: from.scale + (to.scale - from.scale) * e };
      return { ...p, x: p.x * gr, y: p.y * gr, alpha: p.alpha * (1 - gg) + (k < 10 ? .95 * gg : 0), scale: p.scale * (1 + .2 * gg) };
    });
  }, false);
  useEffect(() => { frame.setActive(!calm); return () => frame.setActive(false); }, [frame, calm]);
  return <View style={{ width: size, height: size }} accessibilityRole="image" accessibilityLabel={state === 'ring' || state === 'rest' ? 'Life' : state === 'news' ? 'Life, something new' : `Life is ${state === 'voice' ? 'listening' : state}`}>
    <Svg width={size} height={size} style={{ position: 'absolute' }} pointerEvents="none">
      {PAIRS.map(([a, b]) => <OrbEdge key={`${a}-${b}`} a={a} b={b} points={points} edges={edges} time={time} size={size} color={ink} dot={dot} />)}
    </Svg>
    {Array.from({ length: 30 }, (_, k) => <OrbDot key={k} k={k} points={points} size={size} dot={dot} color={k < 10 && lit.includes(k) && markColor ? markColor : ink} />)}
  </View>;
}
function OrbDot({ k, points, size, dot, color }: { k: number; points: SharedValue<Point[]>; size: number; dot: number; color: string }) {
  const style = useAnimatedStyle(() => { const p = points.value[k]; return { opacity: p.alpha, zIndex: Math.round(p.z * 10), transform: [{ translateX: p.x }, { translateY: p.y }, { scale: p.scale }] }; });
  return <Animated.View style={[{ position: 'absolute', left: size / 2 - dot / 2, top: size / 2 - dot / 2, width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color }, style]} />;
}
function OrbEdge({ a, b, points, edges, time, size, color, dot }: { a: number; b: number; points: SharedValue<Point[]>; edges: SharedValue<Record<string, number>>; time: SharedValue<number>; size: number; color: string; dot: number }) {
  const props = useAnimatedProps(() => {
    const born = edges.value[`${a}-${b}`], A = points.value[a], B = points.value[b], age = time.value - (born ?? 0), progress = Math.min(1, age / .35);
    return { x1: size / 2 + A.x, y1: size / 2 + A.y, x2: size / 2 + A.x + (B.x - A.x) * progress, y2: size / 2 + A.y + (B.y - A.y) * progress,
      opacity: born === undefined ? 0 : Math.max(.34, .85 - Math.max(0, age - 1.2) * .35) * (.5 + .5 * (A.z + B.z) / 2) };
  });
  return <ALine animatedProps={props} stroke={color} strokeWidth={Math.max(1, dot / 3.6)} strokeLinecap="round" />;
}
