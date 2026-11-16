import { useMemo, useRef, type ReactNode } from 'react';
import { PanResponder, View } from 'react-native';
import Animated, { LinearTransition, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { Text } from '../Text';
import { feedback } from '../feedback';
import { useCalmMotion, useTokens } from '../theme';
import { durations, space, springs, touch } from '../tokens';

/** The board's drag handle, with a real move gesture and accessible reordering. */
export function ReorderRow({ label, index, count, onMove, children }: { label: string; index: number; count: number; onMove: (from: number, to: number) => void; children: ReactNode }) {
  const t = useTokens(), calm = useCalmMotion(), height = useRef<number>(touch.min), y = useSharedValue(0);
  const props = useRef({ index, count, onMove, calm });
  props.current = { index, count, onMove, calm };
  const reset = () => { y.value = props.current.calm ? withTiming(0, { duration: durations.quick }) : withSpring(0, springs.smooth); };
  const responder = useMemo(() => PanResponder.create({
    onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > space.xs && Math.abs(gesture.dy) > Math.abs(gesture.dx),
    onPanResponderGrant: () => feedback.select(),
    onPanResponderMove: (_, gesture) => { const p = props.current; y.value = Math.max(-p.index * height.current, Math.min((p.count - 1 - p.index) * height.current, gesture.dy)); },
    onPanResponderRelease: (_, gesture) => { const p = props.current, to = Math.max(0, Math.min(p.count - 1, p.index + Math.round(gesture.dy / height.current))); if (to !== p.index) { y.value = 0; p.onMove(p.index, to); } else reset(); },
    onPanResponderTerminationRequest: () => false,
    onShouldBlockNativeResponder: () => true,
    onPanResponderTerminate: reset,
  }), []);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }], zIndex: y.value === 0 ? 0 : 1 }));
  return <Animated.View layout={calm ? undefined : LinearTransition.springify().damping(springs.smooth.damping).stiffness(springs.smooth.stiffness)} onLayout={event => { height.current = Math.max(touch.min, event.nativeEvent.layout.height); }} style={[{ flexDirection: 'row', alignItems: 'center', gap: space.xxs, backgroundColor: t.surface }, style]}>
    <View {...responder.panHandlers} accessible accessibilityRole="adjustable" accessibilityLabel={`Order ${label}`} accessibilityValue={{ min: 1, max: count, now: index + 1 }} accessibilityActions={[{ name: 'decrement', label: 'Move up' }, { name: 'increment', label: 'Move down' }]} onAccessibilityAction={event => { const to = Math.max(0, Math.min(count - 1, index + (event.nativeEvent.actionName === 'decrement' ? -1 : 1))); if (to !== index) { feedback.select(); onMove(index, to); } }} style={{ width: touch.min, minHeight: touch.min, marginLeft: -space.sm, marginRight: -space.xs, justifyContent: 'center', alignItems: 'center' }}><Text variant="callout" tone="ink2">⋮⋮</Text></View>
    <View style={{ flex: 1 }}>{children}</View>
  </Animated.View>;
}
