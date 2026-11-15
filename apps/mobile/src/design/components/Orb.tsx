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
 * LifeOrb v5: the original ring, which goes 3D only while life is thinking (DESIGN.md §47, MOTION.md §3.2).
 *
 * The mark: 10 dots on a circle, each brighter than the last (a tail), travelling ALONG the circle
 * clockwise, one lap every 12 s. That flow never changes, in any state.
 *  ring      The everyday mark. Also used while idle.
 *  thinking  Only while life is working something out (> 1 s). The same ring leans back 52° and its lean
 *            slowly swings round (one sweep every 16 s), like a plate spinning; dots keep flowing round.
 *            Near dots a little bigger and brighter. `rings={2}` adds a second ring crossing it.
 *  voice     The flat ring; the dots pulse one after another (1.2 s cycle, 0.1 s apart).
 *  done      Lies flat again (back to ring).
 * Reduce Motion: no flow, no wobble; the state shows as a still ring or a still tilted ring.
 */
export type OrbState = 'ring' | 'thinking' | 'voice' | 'done';

const N = 10;
const LAP_MS = 12000;
const SWEEP_MS = 16000;
const LEAN = (52 * Math.PI) / 180;

export function LifeOrb({ size = 56, state = 'ring', rings = 1, color }: { size?: number; state?: OrbState; rings?: 1 | 2; color?: string }) {
  const t = useTokens();
  const calm = useCalmMotion();
  const spin = useSharedValue(0);
  const sweep = useSharedValue(0);
  const clock = useSharedValue(0);
  const tilt = useSharedValue(state === 'thinking' ? 1 : 0);
  const voice = useSharedValue(state === 'voice' ? 1 : 0);

  useEffect(() => {
    if (calm) {
      cancelAnimation(spin);
      cancelAnimation(sweep);
      cancelAnimation(clock);
    } else {
      spin.value = withRepeat(withTiming(spin.value + Math.PI * 2, { duration: LAP_MS, easing: Easing.linear }), -1, false);
      sweep.value = withRepeat(withTiming(sweep.value + Math.PI * 2, { duration: SWEEP_MS, easing: Easing.linear }), -1, false);
      clock.value = withRepeat(withTiming(clock.value + 1000, { duration: 1000 * 1000, easing: Easing.linear }), -1, false);
    }
  }, [calm, spin, sweep, clock]);

  useEffect(() => {
    const target = state === 'thinking' ? 1 : 0;
    tilt.value = calm ? target : withSpring(target, motion.smooth);
    voice.value = calm ? (state === 'voice' ? 1 : 0) : withSpring(state === 'voice' ? 1 : 0, motion.snappy);
  }, [state, calm, tilt, voice]);

  const dot = Math.max(2.6, size / 12);
  const R = size / 2 - Math.max(2, size / 14) - dot / 2;
  const ink = color ?? t.ink;
  const dots = [];
  for (let ri = 0; ri < rings; ri++) for (let k = 0; k < N; k++) dots.push({ ri, k });

  return (
    <View style={{ width: size, height: size }} accessibilityRole="image" accessibilityLabel={state === 'thinking' ? 'life is thinking' : state === 'voice' ? 'life is listening' : 'life'}>
      {dots.map(({ ri, k }) => (
        <OrbDot key={`${ri}-${k}`} ri={ri} k={k} R={R} size={size} dot={dot} color={ink} spin={spin} sweep={sweep} clock={clock} tilt={tilt} voice={voice} />
      ))}
    </View>
  );
}

function OrbDot({ ri, k, R, size, dot, color, spin, sweep, clock, tilt, voice }: {
  ri: number; k: number; R: number; size: number; dot: number; color: string;
  spin: SharedValue<number>; sweep: SharedValue<number>; clock: SharedValue<number>; tilt: SharedValue<number>; voice: SharedValue<number>;
}) {
  const style = useAnimatedStyle(() => {
    const m = tilt.value;
    const e = m * m * (3 - 2 * m);
    const show = ri === 0 ? 1 : Math.pow(m, 1.3);
    // Travel along the ring: the original flow.
    const a = (k / N) * Math.PI * 2 + spin.value + ri * Math.PI;
    // Lean the ring back, then swing the lean round.
    const beta = LEAN * e;
    const cx = Math.cos(a);
    const cy = Math.sin(a) * Math.cos(beta);
    const z = Math.sin(a) * Math.sin(beta);
    const phi = sweep.value * m + ri * (Math.PI / 2);
    const X = cx * Math.cos(phi) - cy * Math.sin(phi);
    const Y = cx * Math.sin(phi) + cy * Math.cos(phi);
    const persp = 3.4 / (3.4 - z);
    const depth = (1 + z) / 2;
    // The tail, or the original one-after-another pulse while listening.
    const tail = 0.3 + 0.7 * (k / N);
    const ph = (((clock.value / 1.2 - k * 0.1) % 1) + 1) % 1;
    const pulse = 0.25 + 0.75 * (0.5 - 0.5 * Math.cos(ph * Math.PI * 2));
    const v = voice.value;
    return {
      zIndex: Math.round(depth * 10),
      opacity: (tail * (1 - v) + pulse * v) * (1 - m * 0.55 * (1 - depth)) * show,
      transform: [{ translateX: X * R * persp }, { translateY: Y * R * persp }, { scale: 1 - m * (1 - (0.78 + 0.34 * depth)) }],
    };
  });
  return (
    <Animated.View
      style={[{ position: 'absolute', left: size / 2 - dot / 2, top: size / 2 - dot / 2, width: dot, height: dot, borderRadius: dot / 2, backgroundColor: color }, style]}
    />
  );
}
