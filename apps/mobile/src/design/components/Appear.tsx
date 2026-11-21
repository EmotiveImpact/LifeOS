import { useEffect, type ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSpring, withTiming } from 'react-native-reanimated';
import { useCalmMotion } from '../theme';
import { durations, motion } from '../tokens';

/**
 * How anything arrives in life, the Apple way (MOTION.md §1): it fades in while rising a few points and growing from
 * 98%, on the no-bounce `smooth` spring. Nothing pops in and nothing wobbles. With Reduce Motion it is a quick fade.
 *
 * `rise` is how far it travels up (a drawer from the bottom edge travels further than a line of text). `from: 'right'`
 * slides it in from the side instead, as a pushed screen does. Give it a `key` that changes to play it again when the
 * content changes (a drawer's new question, a new step).
 */
export function Appear({ children, rise = 10, from = 'below', delay = 0, style }: { children: ReactNode; rise?: number; from?: 'below' | 'right' | 'none'; delay?: number; style?: StyleProp<ViewStyle> }) {
  const calm = useCalmMotion();
  const p = useSharedValue(0);
  useEffect(() => {
    p.value = withDelay(delay, calm ? withTiming(1, { duration: durations.quick }) : withSpring(1, motion.smooth));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const anim = useAnimatedStyle(() => {
    const k = 1 - p.value;
    if (calm || from === 'none') return { opacity: Math.min(1, p.value * 1.5) };
    return {
      opacity: Math.min(1, p.value * 1.5),
      transform: from === 'right' ? [{ translateX: k * rise }] : [{ translateY: k * rise }, { scale: 0.98 + 0.02 * p.value }],
    };
  });
  return <Animated.View style={[style, anim]}>{children}</Animated.View>;
}
