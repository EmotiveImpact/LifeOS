import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { PanResponder, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { Icon as Ionicons } from '../Icon';
import { feedback } from '../feedback';
import { Press } from '../Press';
import { Callout, Text } from '../Text';
import { useCalmMotion, useTokens } from '../theme';
import { areaColors, durations, radius, springs } from '../tokens';

/* ───────────────────────── CountStepper (SPEC §6.1) ───────────────────────── */

export type CountGlyph = 'people' | 'doors' | 'dots' | 'none';

export type CountStepperProps = {
  value: number;
  onChange: (n: number) => void;
  /** The question, e.g. "How many people live with you?" */
  question: string;
  /** What the number changes, e.g. "Living alone: you may get 25% off council tax." */
  consequence?: (n: number) => string;
  min?: number;
  /** The top value shows as "16+". */
  max?: number;
  /** People figures only for people (§6.1). Doors for bedrooms, dots for days and other counts. */
  glyph?: CountGlyph;
};

/**
 * The count instrument: a big number, − / +, a glyph row and a live consequence line.
 * Use only for small whole numbers that change something real (SPEC §6.1). Never for money.
 */
export function CountStepper({ value, onChange, question, consequence, min = 0, max = 16, glyph = 'people' }: CountStepperProps) {
  const t = useTokens();
  const calm = useCalmMotion();
  const set = (n: number) => {
    const next = Math.max(min, Math.min(max, n));
    if (next !== value) {
      feedback.select();
      onChange(next);
    }
  };
  const ac = areaColors[t.scheme];
  const palette = [ac.you, ac.home, ac.work, ac.money, ac.health, t.ink2];
  const shown = Math.min(value, max);
  return (
    <View
      style={{ alignItems: 'center', gap: 14 }}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={question}
      accessibilityValue={{ min, max, now: value, text: value >= max ? `${max} or more` : String(value) }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => set(value + (e.nativeEvent.actionName === 'increment' ? 1 : -1))}
    >
      {glyph !== 'none' ? (
        <View style={styles.glyphs}>
          {Array.from({ length: shown }, (_, i) => (
            <Animated.View key={i} entering={calm ? FadeIn.duration(durations.quick) : FadeInDown.springify().damping(14)}>
              {glyph === 'people' ? (
                <View style={{ alignItems: 'center', gap: 3 }}>
                  <View style={{ width: 11, height: 11, borderRadius: 4, backgroundColor: palette[i % palette.length] }} />
                  <View style={{ width: shown > 10 ? 10 : 14, height: 28 + ((i * 7) % 16), borderTopLeftRadius: 5, borderTopRightRadius: 5, borderBottomLeftRadius: 3, borderBottomRightRadius: 3, backgroundColor: palette[i % palette.length] }} />
                </View>
              ) : glyph === 'doors' ? (
                <View style={{ width: 16, height: 26, borderRadius: 3, backgroundColor: t.surface3, alignItems: 'flex-end', justifyContent: 'center', paddingRight: 3 }}>
                  <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: t.ink2 }} />
                </View>
              ) : (
                <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: t.ink }} />
              )}
            </Animated.View>
          ))}
        </View>
      ) : null}
      <Text variant="title" align="center">
        {question}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
        <RoundButton icon="remove" label="Fewer" disabled={value <= min} onPress={() => set(value - 1)} />
        <Text variant="numeralXl" align="center" style={{ fontSize: 104, lineHeight: 108, letterSpacing: -6, minWidth: 150 }}>
          {value >= max ? `${max}` : value}
          {value >= max ? (
            <Text variant="headline" tone="ink2">
              +
            </Text>
          ) : null}
        </Text>
        <RoundButton icon="add" label="More" disabled={value >= max} onPress={() => set(value + 1)} />
      </View>
      {consequence ? (
        <Animated.View key={value} entering={FadeIn.duration(durations.item)} style={{ minHeight: 36, maxWidth: 300 }}>
          <Callout tone="ink2" align="center">
            {consequence(value)}
          </Callout>
        </Animated.View>
      ) : null}
    </View>
  );
}

function RoundButton({ icon, label, disabled, onPress }: { icon: 'add' | 'remove'; label: string; disabled?: boolean; onPress: () => void }) {
  const t = useTokens();
  return (
    <Press haptic={null} onPress={onPress} disabled={disabled} accessibilityLabel={label} style={[styles.round, { backgroundColor: t.surface2, opacity: disabled ? 0.35 : 1 }]}>
      <Ionicons name={icon} size={24} color={t.ink} />
    </Press>
  );
}

/* ───────────────────────── Slider ───────────────────────── */

export type SliderProps = {
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (v: number) => void;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
};

/** Track + square-ish thumb. Selection haptic on each step (throttled). Used for portions, income, cash plan. */
export function Slider({ value, min, max, step = 1, onChange, accessibilityLabel, style }: SliderProps) {
  const t = useTokens();
  const [w, setW] = useState(0);
  const last = useRef(0);
  const frac = max > min ? (value - min) / (max - min) : 0;
  const pick = (x: number) => {
    if (!w) return;
    const raw = min + Math.max(0, Math.min(1, x / w)) * (max - min);
    const v = Math.round(raw / step) * step;
    if (v !== value) {
      onChange(v);
      const now = Date.now();
      if (now - last.current > 40) {
        last.current = now;
        feedback.select();
      }
    }
  };
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => pick(e.nativeEvent.locationX),
        onPanResponderMove: (e) => pick(e.nativeEvent.locationX),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [w, value, min, max, step],
  );
  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setW(e.nativeEvent.layout.width)}
      {...responder.panHandlers}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={{ min, max, now: value }}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => onChange(Math.max(min, Math.min(max, value + (e.nativeEvent.actionName === 'increment' ? step : -step))))}
      style={[{ height: 32, justifyContent: 'center' }, style]}
    >
      <View style={{ height: 4, borderRadius: 2, backgroundColor: t.surface3 }}>
        <View style={{ width: `${frac * 100}%`, height: 4, borderRadius: 2, backgroundColor: t.ink }} />
      </View>
      <View pointerEvents="none" style={[styles.thumb, { left: Math.max(0, frac * w - 11) }]} />
    </View>
  );
}

/* ───────────────────────── Toggle ───────────────────────── */

export function Toggle({ value, onChange, accessibilityLabel }: { value: boolean; onChange: (v: boolean) => void; accessibilityLabel: string }) {
  const t = useTokens(), calm = useCalmMotion();
  const x = useSharedValue(value ? 18 : 0);
  useEffect(() => {
    x.value = calm ? value ? 18 : 0 : withSpring(value ? 18 : 0, springs.snappy);
  }, [value, calm, x]);
  const knob = useAnimatedStyle(() => ({ transform: [{ translateX: x.value }] }));
  return (
    <Press
      haptic="select"
      pressScale={0.97}
      onPress={() => onChange(!value)}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      style={{ width: 44, height: 26, borderRadius: 13, padding: 3, backgroundColor: value ? t.ember : t.surface3 }}
    >
      <Animated.View style={[{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#FFFFFF' }, knob]} />
    </Press>
  );
}

/* ───────────────────────── Segmented ───────────────────────── */

export function Segmented<T extends string>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  const t = useTokens();
  return (
    <View style={[styles.seg, { backgroundColor: t.surface2 }]} accessibilityRole="tablist">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Press
            key={o.value}
            haptic="select"
            onPress={() => onChange(o.value)}
            accessibilityRole="tab"
            accessibilityState={{ selected: on }}
            style={[styles.segItem, on && { backgroundColor: t.surface }]}
          >
            <Callout tone={on ? 'ink' : 'ink2'}>{o.label}</Callout>
          </Press>
        );
      })}
    </View>
  );
}

/* ───────────────────────── Chips (single-select) ───────────────────────── */

export function ChipGroup<T extends string>({ options, value, onChange, wrap = true }: { options: { value: T; label: string }[]; value: T | null; onChange: (v: T) => void; wrap?: boolean }) {
  const t = useTokens();
  return (
    <View style={{ flexDirection: 'row', flexWrap: wrap ? 'wrap' : 'nowrap', gap: 6 }}>
      {options.map((o) => {
        const on = o.value === value;
        return (
          <Press
            key={o.value}
            haptic="select"
            onPress={() => onChange(o.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected: on }}
            style={[styles.chip, { backgroundColor: on ? t.ink : t.surface2, borderColor: on ? t.ink : t.line }]}
          >
            <Text variant="callout" style={{ fontSize: 14, color: on ? t.canvas : t.ink }}>
              {o.label}
            </Text>
          </Press>
        );
      })}
    </View>
  );
}

/** A row with a label on the left and any control on the right (Toggle, value, chevron). */
export function ControlRow({ label, sub, children }: { label: string; sub?: string; children: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 48, paddingVertical: 8 }}>
      <View style={{ flex: 1, gap: 2 }}>
        <Text variant="body" style={{ fontFamily: 'Inter_500Medium' }}>
          {label}
        </Text>
        {sub ? <Callout tone="ink2">{sub}</Callout> : null}
      </View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  glyphs: { minHeight: 84, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', gap: 4, flexWrap: 'wrap' },
  round: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  thumb: { position: 'absolute', top: 5, width: 22, height: 22, borderRadius: 7, backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 3, shadowOffset: { width: 0, height: 1 }, elevation: 3 },
  seg: { flexDirection: 'row', padding: 3, borderRadius: radius.md },
  segItem: { flex: 1, height: 34, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  chip: { height: 38, paddingHorizontal: 14, borderRadius: radius.sm, justifyContent: 'center' },
});
