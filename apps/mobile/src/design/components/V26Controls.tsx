import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { feedback } from '../feedback';
import { Press } from '../Press';
import { Text } from '../Text';
import { useCalmMotion, useTokens } from '../theme';
import { cardShadow, floatLift, motion, radius, space } from '../tokens';
import { RoundButton } from './V26Chrome';

/* ───────────────────────── Switch (board `sw`) ───────────────────────── */

/** 46×28, surface3 off and ink on; a 22pt knob that slides on a spring (instant under Reduce Motion). No ember. */
export function SwitchV26({ value, onChange, accessibilityLabel, style }: { value: boolean; onChange: (v: boolean) => void; accessibilityLabel: string; style?: StyleProp<ViewStyle> }) {
  const t = useTokens(), calm = useCalmMotion();
  const x = useSharedValue(value ? 18 : 0);
  useEffect(() => { x.value = calm ? (value ? 18 : 0) : withSpring(value ? 18 : 0, motion.snappy); }, [value, calm, x]);
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <Press haptic="select" pressScale={0.97} onPress={() => onChange(!value)} accessibilityRole="switch" accessibilityState={{ checked: value }} accessibilityLabel={accessibilityLabel} hitSlop={8}
      style={[styles.sw, { backgroundColor: value ? t.ink : t.surface3 }, style]}>
      <Animated.View style={[styles.knob, { backgroundColor: value ? t.canvas : t.surface, ...cardShadow(t.scheme) }, knob]} />
    </Press>
  );
}

/* ───────────────────────── Slider (board `slider`) ───────────────────────── */

export type SliderV26Props = { value: number; min: number; max: number; step?: number; onChange: (v: number) => void; accessibilityLabel: string; style?: StyleProp<ViewStyle> };

/** A 4pt track in surface3 with the ink fill and a round 24pt knob on the floating lift. Selection haptic per step. */
export function SliderV26({ value, min, max, step = 1, onChange, accessibilityLabel, style }: SliderV26Props) {
  const t = useTokens();
  const [w, setW] = useState(0);
  const last = useRef(0);
  const frac = max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0;
  const pick = (x: number) => {
    if (!w) return;
    const v = Math.round((min + Math.max(0, Math.min(1, x / w)) * (max - min)) / step) * step;
    if (v === value) return;
    onChange(v);
    const now = Date.now();
    if (now - last.current > 40) { last.current = now; feedback.select(); }
  };
  const responder = useMemo(() => PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderTerminationRequest: () => false,
    onPanResponderGrant: e => pick(e.nativeEvent.locationX),
    onPanResponderMove: e => pick(e.nativeEvent.locationX),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [w, value, min, max, step]);
  return (
    <View onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)} {...responder.panHandlers}
      accessible accessibilityRole="adjustable" accessibilityLabel={accessibilityLabel} accessibilityValue={{ min, max, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={e => onChange(Math.max(min, Math.min(max, value + (e.nativeEvent.actionName === 'increment' ? step : -step))))}
      style={[{ height: 28 }, style]}>
      <View pointerEvents="none" style={[styles.track, { right: 0, backgroundColor: t.surface3 }]} />
      <View pointerEvents="none" style={[styles.track, { width: frac * w, backgroundColor: t.ink }]} />
      <View pointerEvents="none" style={[styles.sliderKnob, { left: frac * w - 12, backgroundColor: t.surface, ...floatLift(t.scheme) }]} />
    </View>
  );
}

/* ───────────────────────── Segmented (board `seg`) ───────────────────────── */

/** Options in a surface2 tray; the chosen one lifts onto a white pill. 34pt tall, 13pt semibold. */
export function SegmentedV26<T extends string>({ options, value, onChange, style }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  return (
    <View style={[styles.seg, { backgroundColor: t.surface2 }, style]} accessibilityRole="tablist">
      {options.map(o => {
        const on = o.value === value;
        return (
          <Press key={o.value} haptic="select" onPress={() => onChange(o.value)} accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={o.label}
            style={[styles.segItem, on ? { backgroundColor: t.surface, ...cardShadow(t.scheme) } : null]}>
            <Text variant="label" tone={on ? 'ink' : 'ink2'} numberOfLines={1}>{o.label}</Text>
          </Press>
        );
      })}
    </View>
  );
}

/* ───────────────────────── Filters (board `filters`) ───────────────────────── */

/** Single-choice pills: 13pt, surface2 with ink2 words; the chosen one ink with canvas words. */
export function FilterChips<T extends string>({ options, value, onChange, wrap = false, style }: { options: { value: T; label: string }[]; value: T | null; onChange: (v: T) => void; wrap?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  return (
    <View style={[{ flexDirection: 'row', flexWrap: wrap ? 'wrap' : 'nowrap', gap: space.xs }, style]} accessibilityRole="radiogroup">
      {options.map(o => {
        const on = o.value === value;
        return (
          <Press key={o.value} haptic="select" onPress={() => onChange(o.value)} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={o.label}
            style={[styles.filter, { backgroundColor: on ? t.ink : t.surface2 }]}>
            <Text variant="callout" numberOfLines={1} style={{ color: on ? t.canvas : t.ink2 }}>{o.label}</Text>
          </Press>
        );
      })}
    </View>
  );
}

/* ───────────────────────── Stepper (board `stepper`) ───────────────────────── */

/** Round minus, the number at 56pt with a small unit, round plus; 28pt apart. For one number at a time. */
export function CompactStepper({ value, onChange, min = 0, max = 99, step = 1, unit, label, format }: { value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number; unit?: string; label: string; format?: (n: number) => string }) {
  const set = (n: number) => {
    const next = Math.max(min, Math.min(max, Math.round(n * 1000) / 1000));
    if (next !== value) onChange(next);
  };
  const shown = format ? format(value) : String(value);
  return (
    <View style={styles.stepper} accessible accessibilityRole="adjustable" accessibilityLabel={label} accessibilityValue={{ min, max, now: value, text: unit ? `${shown} ${unit}` : shown }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]} onAccessibilityAction={e => set(value + (e.nativeEvent.actionName === 'increment' ? step : -step))}>
      <RoundButton icon="remove" label="Fewer" onPress={() => set(value - step)} disabled={value <= min} />
      <Text variant="numeralXl">{shown}{unit ? <Text variant="unit" tone="ink2">{` ${unit}`}</Text> : null}</Text>
      <RoundButton icon="add" label="More" onPress={() => set(value + step)} disabled={value >= max} />
    </View>
  );
}

const styles = StyleSheet.create({
  sw: { width: 46, height: 28, borderRadius: radius.full, padding: 3 },
  knob: { width: 22, height: 22, borderRadius: 11 },
  track: { position: 'absolute', left: 0, top: 12, height: 4, borderRadius: 2 },
  sliderKnob: { position: 'absolute', top: 2, width: 24, height: 24, borderRadius: 12 },
  seg: { flexDirection: 'row', gap: 4, padding: 4, borderRadius: radius.md },
  segItem: { flex: 1, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xxs },
  filter: { paddingVertical: space.xs, paddingHorizontal: 14, borderRadius: radius.full },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 28 },
});
