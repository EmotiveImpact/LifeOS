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
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';
import { useCalmMotion, useTokens } from '../theme';
import { motion } from '../tokens';

/**
 * LifeOrb: the life symbol, evolving (MOTION.md §3.2, DESIGN.md §6.21).
 *
 *  ring    The everyday mark: 12 dots on a circle, slow spin. Default everywhere.
 *  sphere  life is working (> 1s: building a plan or lesson, checking schemes). The ring lifts
 *          into a sphere of dots that turns in 3D; near dots are bigger and brighter.
 *  core    life is listening or speaking. The sphere keeps turning and an ember core glows
 *          in the centre, breathing with `level` (0–1, the voice level).
 *  done    The dots gather into a tight bright cluster, then the orb settles back to ring.
 *
 * The evolution is rare on purpose: only real work or voice triggers it, so it stays special.
 * Same on iOS and Android (Reanimated UI-thread maths, no native 3D). Reduce Motion: no turning,
 * no morph; the state shows as a static ring, sphere or core.
 */
export type OrbState = 'ring' | 'sphere' | 'core' | 'done';

const N = 42; // dots on the sphere; the first 12 also form the ring
const RING = 12;
const TILT = 0.38; // radians the sphere leans towards you
const FOCAL = 2.6; // perspective strength (bigger = flatter)

/** Evenly spread points on a unit sphere (Fibonacci lattice). */
const SPHERE = Array.from({ length: N }, (_, i) => {
  const y = 1 - (2 * (i + 0.5)) / N;
  const rr = Math.sqrt(1 - y * y);
  const th = i * Math.PI * (3 - Math.sqrt(5));
  return { x: Math.cos(th) * rr, y, z: Math.sin(th) * rr };
});

export function LifeOrb({ size = 56, state = 'ring', level, color }: { size?: number; state?: OrbState; level?: SharedValue<number>; color?: string }) {
  const t = useTokens();
  const calm = useCalmMotion();
  const spin = useSharedValue(0); // radians, ring spin and sphere turn
  const morph = useSharedValue(state === 'ring' ? 0 : 1); // 0 ring → 1 sphere
  const core = useSharedValue(state === 'core' ? 1 : 0);
  const gather = useSharedValue(0);

  useEffect(() => {
    if (calm) {
      cancelAnimation(spin);
    } else {
      const fast = state === 'sphere' || state === 'core';
      spin.value = withRepeat(withTiming(spin.value + Math.PI * 2, { duration: fast ? 5200 : 12000, easing: Easing.linear }), -1, false);
    }
    const to = (v: SharedValue<number>, n: number) => {
      v.value = calm ? n : withSpring(n, motion.smooth);
    };
    to(morph, state === 'ring' ? 0 : 1);
    to(core, state === 'core' ? 1 : 0);
    if (state === 'done') {
      gather.value = calm ? 0 : withSpring(1, motion.bouncy);
      const id = setTimeout(() => {
        gather.value = withSpring(0, motion.smooth);
        morph.value = withSpring(0, motion.smooth);
      }, 700);
      return () => clearTimeout(id);
    }
    gather.value = withSpring(0, motion.snappy);
  }, [state, calm, spin, morph, core, gather]);

  const dot = Math.max(2.6, size / 13);
  const R = size / 2 - dot;
  const ink = color ?? t.ink;

  return (
    <View style={{ width: size, height: size }} accessibilityRole="image" accessibilityLabel={label(state)}>
      <CoreGlow size={size} core={core} level={level} ember={t.ember} />
      {SPHERE.map((p, i) => (
        <OrbDot key={i} i={i} p={p} R={R} size={size} dot={dot} color={ink} spin={spin} morph={morph} gather={gather} core={core} />
      ))}
    </View>
  );
}

function label(s: OrbState) {
  return s === 'sphere' ? 'life is working' : s === 'core' ? 'life is listening' : s === 'done' ? 'Done' : 'life';
}

function OrbDot({ i, p, R, size, dot, color, spin, morph, gather, core }: {
  i: number; p: { x: number; y: number; z: number }; R: number; size: number; dot: number; color: string;
  spin: SharedValue<number>; morph: SharedValue<number>; gather: SharedValue<number>; core: SharedValue<number>;
}) {
  const inRing = i < RING;
  const style = useAnimatedStyle(() => {
    // Ring position (flat, spinning).
    const a = (i / RING) * Math.PI * 2 + spin.value;
    const rx = inRing ? Math.cos(a) * R : 0;
    const ry = inRing ? Math.sin(a) * R : 0;
    const ringOpacity = inRing ? 0.35 + 0.65 * (i / RING) : 0;
    // Sphere position: turn around Y, lean around X, then project.
    const c = Math.cos(spin.value), s = Math.sin(spin.value);
    const x1 = p.x * c + p.z * s;
    const z1 = -p.x * s + p.z * c;
    const ct = Math.cos(TILT), st = Math.sin(TILT);
    const y2 = p.y * ct - z1 * st;
    const z2 = p.y * st + z1 * ct;
    const persp = FOCAL / (FOCAL - z2);
    const shrink = 1 - 0.55 * gather.value;
    const sx = x1 * R * 0.92 * persp * shrink;
    const sy = y2 * R * 0.92 * persp * shrink;
    const depth = (z2 + 1) / 2; // 0 back → 1 front
    const m = morph.value;
    const behindCore = depth < 0.5 ? 1 - 0.5 * core.value : 1; // dots behind the core fade a little
    return {
      zIndex: depth < 0.5 ? 0 : 2, // core sits at 1: inside the sphere
      opacity: (ringOpacity * (1 - m) + (0.18 + 0.82 * depth) * m) * behindCore,
      transform: [
        { translateX: rx * (1 - m) + sx * m },
        { translateY: ry * (1 - m) + sy * m },
        { scale: ((1 - m) + (0.55 + 0.75 * depth) * m) * (1 - 0.22 * core.value) },
      ],
    };
  });
  return (
    <Animated.View
      style={[{ position: 'absolute', left: size / 2 - dot / 2, top: size / 2 - dot / 2, width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color }, style]}
    />
  );
}

/** The ember core: a soft solid sphere (radial fill, no blur or glass), breathing with the voice level. */
function CoreGlow({ size, core, level, ember }: { size: number; core: SharedValue<number>; level?: SharedValue<number>; ember: string }) {
  const style = useAnimatedStyle(() => {
    const l = level ? level.value : 0;
    return { zIndex: 1, opacity: core.value, transform: [{ scale: (0.26 + 0.2 * core.value) * (1 + 0.16 * l) }] };
  });
  return (
    <Animated.View pointerEvents="none" style={[{ position: 'absolute', left: 0, top: 0, width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Defs>
          <RadialGradient id="lifeCore" cx="42%" cy="38%" r="60%">
            <Stop offset="0" stopColor="#FFE3D6" stopOpacity="1" />
            <Stop offset="0.45" stopColor={ember} stopOpacity="1" />
            <Stop offset="1" stopColor={ember} stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#lifeCore)" />
      </Svg>
    </Animated.View>
  );
}
