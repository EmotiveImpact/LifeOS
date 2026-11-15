import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';
import { useCalmMotion, useTokens } from '../theme';
import { motion } from '../tokens';

/**
 * LifeOrb v2: the life mark, evolving (MOTION.md §3.2, DESIGN.md §47).
 *
 * The ring IS the equator of a globe of dots, seen from straight above.
 *  ring    The everyday mark: the 12 equator dots, flat, slow spin.
 *  sphere  life is working (> 1s). The view tilts to 24° and the other latitude rings fade in:
 *          a globe of dots turning in 3D. Near dots bigger and brighter, the back half faint.
 *  voice   Listening or speaking. The globe stays, and a soft wave travels across the dots,
 *          driven by `level` (0–1). No glowing core.
 *  done    The dots gather to the centre, then the globe tilts back into the ring.
 *
 * Under 40pt it only ever draws the ring (the globe needs room). Reduce Motion: no turning, no morph.
 * Same on iOS and Android: plain Reanimated maths on the UI thread.
 */
export type OrbState = 'ring' | 'sphere' | 'voice' | 'done';

type Pt = { x: number; y: number; z: number; ring: boolean; ringIndex: number; la: number; lo: number };

/** Latitude rings of dots; the equator has 24, every other one doubles as the 12-dot ring. */
const POINTS: Pt[] = (() => {
  const out: Pt[] = [];
  for (const la of [-72, -54, -36, -18, 0, 18, 36, 54, 72]) {
    const r = Math.cos((la * Math.PI) / 180);
    const n = la === 0 ? 24 : Math.max(6, Math.round(24 * r));
    for (let k = 0; k < n; k++) {
      const lo = (k / n) * Math.PI * 2 + ((la / 18) % 2 ? Math.PI / n : 0);
      out.push({ x: Math.cos(lo) * r, y: Math.sin((la * Math.PI) / 180), z: Math.sin(lo) * r, ring: la === 0 && k % 2 === 0, ringIndex: k / 2, la, lo });
    }
  }
  return out;
})();
const RING_ONLY = POINTS.filter((p) => p.ring);

export function LifeOrb({ size = 56, state = 'ring', level, color }: { size?: number; state?: OrbState; level?: SharedValue<number>; color?: string }) {
  const t = useTokens();
  const calm = useCalmMotion();
  const small = size < 40;
  const spin = useSharedValue(0);
  const morph = useSharedValue(state === 'ring' || small ? 0 : 1);
  const voice = useSharedValue(state === 'voice' ? 1 : 0);
  const gather = useSharedValue(0);
  const clock = useSharedValue(0);

  useEffect(() => {
    if (calm) {
      cancelAnimation(spin);
      cancelAnimation(clock);
    } else {
      const perTurn = state === 'ring' || small ? 12000 : 8700;
      spin.value = withRepeat(withTiming(spin.value + Math.PI * 2, { duration: perTurn, easing: Easing.linear }), -1, false);
      clock.value = withRepeat(withTiming(clock.value + 1000, { duration: 1000 * 1000, easing: Easing.linear }), -1, false);
    }
    const to = (v: SharedValue<number>, n: number, cfg: { duration: number; dampingRatio: number } = motion.smooth) => {
      v.value = calm ? n : withSpring(n, cfg);
    };
    to(morph, state === 'ring' || small ? 0 : 1);
    to(voice, state === 'voice' ? 1 : 0);
    if (state === 'done') {
      to(gather, 1, motion.bouncy);
      const id = setTimeout(() => {
        to(gather, 0);
        to(morph, 0);
      }, 850);
      return () => clearTimeout(id);
    }
    to(gather, 0, motion.snappy);
  }, [state, calm, small, spin, morph, voice, gather, clock]);

  const dot = Math.max(1.4, size / 44);
  const R = (size / 2) * 0.84;
  const ink = color ?? t.ink;
  const pts = small ? RING_ONLY : POINTS;

  return (
    <View style={{ width: size, height: size }} accessibilityRole="image" accessibilityLabel={label(state)}>
      {pts.map((p, i) => (
        <OrbDot key={i} p={p} R={R} size={size} dot={dot} color={ink} spin={spin} morph={morph} voice={voice} gather={gather} clock={clock} />
      ))}
    </View>
  );
}

function label(s: OrbState) {
  return s === 'sphere' ? 'life is working' : s === 'voice' ? 'life is listening' : s === 'done' ? 'Done' : 'life';
}

function OrbDot({ p, R, size, dot, color, spin, morph, voice, gather, clock }: {
  p: Pt; R: number; size: number; dot: number; color: string;
  spin: SharedValue<number>; morph: SharedValue<number>; voice: SharedValue<number>; gather: SharedValue<number>; clock: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const m = morph.value;
    const tSec = clock.value;
    // Voice: a wave travels across the globe, nudging dots outwards.
    const w = voice.value * 0.07 * Math.sin((p.la / 18) * 1.3 + p.lo * 2 - tSec * 5) * (0.6 + 0.4 * Math.sin(tSec * 1.7));
    const rr = (1 + w) * (1 - 0.5 * gather.value);
    const c = Math.cos(spin.value), s = Math.sin(spin.value);
    const x1 = (p.x * c + p.z * s) * rr;
    const z1 = (-p.x * s + p.z * c) * rr;
    const y1 = p.y * rr;
    // Tilt: 90° (looking down the pole, the equator is a flat ring) → 24° (a globe).
    const tilt = ((90 - 66 * m) * Math.PI) / 180;
    const ct = Math.cos(tilt), st = Math.sin(tilt);
    const y2 = y1 * ct - z1 * st;
    const z2 = y1 * st + z1 * ct;
    const persp = 3 / (3 - z2);
    const depth = (z2 / Math.max(rr, 0.01) + 1) / 2;
    const sphereA = 0.05 + 0.95 * Math.pow(depth, 2.2);
    const ringA = p.ring ? 0.35 + 0.65 * (p.ringIndex / 12) : 0;
    const opacity = p.ring ? ringA * (1 - m) + sphereA * m : sphereA * Math.pow(m, 1.5);
    const scale = (p.ring ? 1.75 * (1 - m) : 0) + (0.45 + 0.85 * depth) * m;
    return {
      zIndex: Math.round(depth * 10),
      opacity,
      transform: [{ translateX: x1 * R * persp }, { translateY: y2 * R * persp }, { scale: Math.max(0.01, scale) }],
    };
  });
  return (
    <Animated.View
      style={[{ position: 'absolute', left: size / 2 - dot, top: size / 2 - dot, width: dot * 2, height: dot * 2, borderRadius: dot, backgroundColor: color }, style]}
    />
  );
}
