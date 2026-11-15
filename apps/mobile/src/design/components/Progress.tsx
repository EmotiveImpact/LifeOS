import { useEffect, useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  Easing,
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { feedback } from '../feedback';
import { Press } from '../Press';
import { Body, Callout, Mono, Text } from '../Text';
import { useCalmMotion, useTokens } from '../theme';
import { durations, onAtmosphere, radius, springs } from '../tokens';

/* ───────────────────────── 5. Ticks ───────────────────────── */

export type TicksProps = {
  count: number;
  /** How many are filled (streak/meter). */
  filled?: number;
  variant?: 'streak' | 'meter' | 'scrubber';
  /** For `scrubber`: the selected index. */
  activeIndex?: number;
  /** For `scrubber`: called as the user drags across ticks. */
  onScrub?: (index: number) => void;
  /** For `scrubber`: label in the floating pill above the handle ("Tue · 16 Nov"). */
  scrubLabel?: string;
  onAtmosphere?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
};

/** DESIGN.md §6.5: the one progress language. Thin ticks; the active one is ember and taller. */
export function Ticks({ count, filled = 0, variant = 'streak', activeIndex, onScrub, scrubLabel, onAtmosphere: onAtmos, style, accessibilityLabel }: TicksProps) {
  const t = useTokens();
  const empty = onAtmos ? onAtmosphere.tickEmpty : t.surface3;
  const full = onAtmos ? onAtmosphere.tickFilled : t.ink;
  const [width, setWidth] = useState(0);
  const lastHaptic = useRef(0);
  const lastIndex = useRef(activeIndex ?? -1);

  const pick = (x: number) => {
    if (!onScrub || width <= 0) return;
    const i = Math.max(0, Math.min(count - 1, Math.round((x / width) * (count - 1))));
    if (i !== lastIndex.current) {
      lastIndex.current = i;
      onScrub(i);
      const now = Date.now();
      if (now - lastHaptic.current > 40) {
        lastHaptic.current = now;
        feedback.select();
      }
    }
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => variant === 'scrubber',
        onMoveShouldSetPanResponder: () => variant === 'scrubber',
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => pick(e.nativeEvent.locationX),
        onPanResponderMove: (e) => pick(e.nativeEvent.locationX),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [variant, width, count, onScrub],
  );

  const scrub = variant === 'scrubber';
  const baseH = scrub ? 12 : 20;
  const ticks = Array.from({ length: count }, (_, i) => {
    let bg = empty;
    let h = baseH;
    let w = 2;
    if (scrub) {
      if (i % 5 === 0) h = 18;
      if (i === activeIndex) {
        bg = onAtmos ? onAtmosphere.text : t.ink;
        h = 40;
        w = 8;
      }
    } else if (i < filled - 1 || (i === filled - 1 && filled === count)) {
      bg = full;
    } else if (i === filled - 1) {
      bg = t.ember;
      h = Math.round(baseH * 1.6);
    }
    return <View key={i} style={{ width: w, height: h, borderRadius: w / 2, backgroundColor: bg }} />;
  });

  const handleX = scrub && width > 0 && activeIndex !== undefined ? (activeIndex / (count - 1)) * width : 0;

  return (
    <View
      style={[{ paddingTop: scrub && scrubLabel ? 44 : 0 }, style]}
      accessibilityRole={scrub ? 'adjustable' : 'progressbar'}
      accessibilityLabel={accessibilityLabel}
      accessibilityValue={scrub ? { text: scrubLabel } : { min: 0, max: count, now: filled }}
    >
      {scrub && scrubLabel && width > 0 ? (
        <View style={[styles.datePill, { left: Math.max(0, Math.min(width - 120, handleX - 60)), backgroundColor: onAtmos ? onAtmosphere.glass : t.surface2 }]}>
          <Callout tone={onAtmos ? 'paper' : 'ink'} numberOfLines={1}>
            {scrubLabel}
          </Callout>
        </View>
      ) : null}
      <View
        onLayout={(e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width)}
        {...(scrub ? responder.panHandlers : {})}
        style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: scrub ? 44 : Math.round(baseH * 1.6) }}
      >
        {ticks}
      </View>
    </View>
  );
}

/* ───────────────────────── 6. CapsuleMeter ───────────────────────── */

export function CapsuleMeter({ value, caption, onAtmosphere: onAtmos, style }: { value: number; caption?: string; onAtmosphere?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  const calm = useCalmMotion();
  const [w, setW] = useState(0);
  const fill = useSharedValue(0);
  useEffect(() => {
    const target = Math.max(0, Math.min(1, value)) * w;
    fill.value = calm ? withTiming(target, { duration: durations.quick }) : withSpring(target, springs.smooth);
  }, [value, w, calm, fill]);
  const anim = useAnimatedStyle(() => ({ width: fill.value }));
  return (
    <View style={[{ gap: 8 }, style]} accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }}>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: 30, borderRadius: radius.full, backgroundColor: onAtmos ? onAtmosphere.tickEmpty : t.surface3, overflow: 'hidden' }}>
        <Animated.View style={[{ height: '100%', borderRadius: radius.full, backgroundColor: onAtmos ? onAtmosphere.text : t.ink }, anim]} />
      </View>
      {caption ? <Callout tone={onAtmos ? 'paper2' : 'ink2'}>{caption}</Callout> : null}
    </View>
  );
}

/* ───────────────────────── 10. StageStepper ───────────────────────── */

export type Stage = { label: string; timestamp?: string };

/**
 * DESIGN.md §6.10: Started → Submitted → Cleared. Stages before `current` are done,
 * `current` gets the ember ring and a halo, later ones are empty. `current >= stages.length` = all done.
 */
export function StageStepper({ stages, current, style }: { stages: Stage[]; current: number; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  const calm = useCalmMotion();
  const n = stages.length;
  const progress = useSharedValue(0);
  const [w, setW] = useState(0);
  useEffect(() => {
    const frac = n <= 1 ? 1 : Math.min(1, Math.max(0, current) / (n - 1));
    progress.value = calm ? withTiming(frac, { duration: durations.quick }) : withSpring(frac, springs.smooth);
  }, [current, n, calm, progress]);
  const lineStyle = useAnimatedStyle(() => ({ width: progress.value * Math.max(0, w - 28) }));

  return (
    <View style={style} accessibilityRole="progressbar" accessibilityLabel={`Stage ${Math.min(current + 1, n)} of ${n}: ${stages[Math.min(current, n - 1)]?.label}`}>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={[styles.track, { backgroundColor: t.surface3, width: Math.max(0, w - 28) }]} />
        <Animated.View style={[styles.track, { backgroundColor: t.ink }, lineStyle]} />
        {stages.map((s, i) => {
          const state = i < current ? 'done' : i === current ? 'current' : 'todo';
          const align = i === 0 ? 'flex-start' : i === n - 1 ? 'flex-end' : 'center';
          return (
            <View key={s.label} style={{ alignItems: align, gap: 6, flex: 1 }}>
              <StepNode state={state} />
              <Text variant="callout" style={{ fontFamily: 'Inter_600SemiBold' }} align={i === n - 1 ? 'right' : i === 0 ? 'left' : 'center'}>
                {s.label}
              </Text>
              {s.timestamp ? <Mono tone="ink2">{s.timestamp}</Mono> : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function StepNode({ state }: { state: 'done' | 'current' | 'todo' }) {
  const t = useTokens();
  const calm = useCalmMotion();
  const halo = useSharedValue(0);
  useEffect(() => {
    if (state === 'current' && !calm) {
      halo.value = 0;
      halo.value = withRepeat(withTiming(1, { duration: 1800, easing: Easing.out(Easing.quad) }), -1, false);
    } else {
      cancelAnimation(halo);
      halo.value = 0;
    }
  }, [state, calm, halo]);
  const haloStyle = useAnimatedStyle(() => ({ opacity: 0.7 * (1 - halo.value), transform: [{ scale: 1 + halo.value * 0.9 }] }));
  return (
    <View style={{ width: 28, height: 28 }}>
      {state === 'current' ? <Animated.View style={[styles.node, { borderWidth: 3, borderColor: t.ember, position: 'absolute' }, haloStyle]} /> : null}
      <View
        style={[
          styles.node,
          state === 'done' && { backgroundColor: t.ink },
          state === 'current' && { backgroundColor: t.canvas, borderWidth: 3, borderColor: t.ember },
          state === 'todo' && { backgroundColor: t.surface3 },
        ]}
      >
        {state === 'done' ? <Ionicons name="checkmark" size={15} color={t.canvas} /> : null}
      </View>
    </View>
  );
}

/* ───────────────────────── 11. ActivityTimeline ───────────────────────── */

export type ActivityItem = { time: string; date?: string; text: string; done?: boolean };

export function ActivityTimeline({ items, style }: { items: ActivityItem[]; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  return (
    <View style={style}>
      {items.map((it, i) => (
        <View key={`${it.time}-${i}`} style={{ flexDirection: 'row', gap: 10, paddingBottom: i === items.length - 1 ? 0 : 18 }}>
          <View style={{ width: 70 }}>
            <Mono>{it.time}</Mono>
            {it.date ? <Mono tone="ink2" style={{ marginTop: 2 }}>{it.date}</Mono> : null}
          </View>
          <View style={{ width: 20, alignItems: 'center' }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: it.done === false ? t.surface3 : t.ink, alignItems: 'center', justifyContent: 'center' }}>
              {it.done === false ? null : <Ionicons name="checkmark" size={12} color={t.canvas} />}
            </View>
            {i < items.length - 1 ? <View style={{ flex: 1, width: 0, borderLeftWidth: 1.5, borderStyle: 'dotted', borderColor: t.inkQuiet, marginTop: 4, marginBottom: -14 }} /> : null}
          </View>
          <Body style={{ flex: 1 }}>{it.text}</Body>
        </View>
      ))}
    </View>
  );
}

/* ───────────────────────── 4. WeekStrip ───────────────────────── */

export type WeekStripProps = {
  /** Any date in the week to show; the strip starts on that week's Monday. */
  week: Date;
  selected: Date;
  onSelect: (d: Date) => void;
  today?: Date;
  /** Deadlines per day, keyed `YYYY-MM-DD`; shows up to 3 dots. */
  density?: Record<string, number>;
  /** A future day to ring in ember (e.g. a session). */
  anchor?: Date;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
};

const WD = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
export const dayKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const sameDay = (a?: Date, b?: Date) => !!a && !!b && dayKey(a) === dayKey(b);

/** DESIGN.md §6.4: the single week strip used everywhere. */
export function WeekStrip({ week, selected, onSelect, today = new Date(), density = {}, anchor, onPrevWeek, onNextWeek }: WeekStripProps) {
  const t = useTokens();
  const monday = new Date(week);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2 }}>
      {onPrevWeek ? (
        <Press haptic="select" onPress={onPrevWeek} accessibilityLabel="Previous week" style={styles.chev}>
          <Ionicons name="chevron-back" size={18} color={t.ink2} />
        </Press>
      ) : null}
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
        {days.map((d, i) => {
          const sel = sameDay(d, selected);
          const isToday = sameDay(d, today);
          const isAnchor = sameDay(d, anchor);
          const dots = Math.min(3, density[dayKey(d)] ?? 0);
          const fg = sel ? t.canvas : t.ink;
          return (
            <Press
              key={dayKey(d)}
              haptic="select"
              onPress={() => onSelect(d)}
              accessibilityLabel={d.toDateString()}
              accessibilityState={{ selected: sel }}
              style={{ width: 42, minHeight: 64, paddingVertical: 8, borderRadius: radius.sm, alignItems: 'center', gap: 4, backgroundColor: sel ? t.ink : 'transparent' }}
            >
              <Text variant="micro" style={{ color: sel ? t.canvas : t.ink2, opacity: sel ? 0.7 : 1 }}>
                {WD[i]}
              </Text>
              <View style={isAnchor && !sel ? { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: t.ember, alignItems: 'center', justifyContent: 'center', marginVertical: -4 } : undefined}>
                <Text variant="title" style={{ color: fg }}>
                  {d.getDate()}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 3, height: 4 }}>
                {isToday ? <View style={[styles.dot, { backgroundColor: t.ember }]} /> : null}
                {Array.from({ length: Math.max(0, dots - (isToday ? 1 : 0)) }, (_, j) => (
                  <View key={j} style={[styles.dot, { backgroundColor: sel ? t.canvas : t.inkQuiet, opacity: sel ? 0.7 : 1 }]} />
                ))}
              </View>
            </Press>
          );
        })}
      </View>
      {onNextWeek ? (
        <Press haptic="select" onPress={onNextWeek} accessibilityLabel="Next week" style={styles.chev}>
          <Ionicons name="chevron-forward" size={18} color={t.ink2} />
        </Press>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  datePill: { position: 'absolute', top: 0, width: 120, height: 32, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  track: { position: 'absolute', top: 12.5, left: 14, height: 3, borderRadius: 2 },
  node: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 4, height: 4, borderRadius: 2 },
  chev: { width: 28, height: 44, alignItems: 'center', justifyContent: 'center' },
});
