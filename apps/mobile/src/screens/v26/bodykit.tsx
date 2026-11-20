/**
 * Small pieces the Body chapter shares (board `body-a.js`, `body-b.js`): a tinted chart card's heading, axis labels,
 * "where you sit in your own range", tick labels, a dotted receipt line and the big figure with its chip.
 * Everything draws from `@/design` tokens; charts measure their width so strokes never stretch.
 */
import { useCallback, useState, type ReactNode } from 'react';
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import { Badge, Text, photo, radius, space, useTokens } from '@/design';
import type { GlyphName } from '@/design';

/** Measures a box so a chart can draw at its real width. */
export function useWidth(): [number, (e: LayoutChangeEvent) => void] {
  const [w, setW] = useState(0);
  const onLayout = useCallback((e: LayoutChangeEvent) => { const next = Math.round(e.nativeEvent.layout.width); setW(c => (c === next ? c : next)); }, []);
  return [w, onLayout];
}

/** Renders its child at the measured width (nothing until it's known). */
export function Measure({ height, children, label, style }: { height: number; children: (w: number) => ReactNode; label?: string; style?: StyleProp<ViewStyle> }) {
  const [w, onLayout] = useWidth();
  return <View onLayout={onLayout} style={[{ height }, style]} accessible={!!label} accessibilityRole={label ? 'image' : undefined} accessibilityLabel={label}>{w ? children(w) : null}</View>;
}

/** A tinted chart card's heading (board `head`): round badge, title, and what the band means on the right. */
export function Head({ icon, title, right }: { icon: GlyphName; title: string; right?: ReactNode }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.xs }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.tile, flexShrink: 1 }}>
        <Badge icon={icon} />
        <Text variant="title" numberOfLines={1} style={{ flexShrink: 1 }}>{title}</Text>
      </View>
      {typeof right === 'string' ? <Text variant="callout" tone="ink2" numberOfLines={1} style={{ flexShrink: 1 }}>{right}</Text> : right ?? null}
    </View>
  );
}

/** Labels spread under a chart (board `.ba-axis`, `.times`); the last in ink when it's today. */
export function Axis({ labels, lastInk, style }: { labels: string[]; lastInk?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }, style]}>
      {labels.map((l, k) => <Text key={k} variant="micro" tone={lastInk && k === labels.length - 1 ? 'ink' : 'quiet'}>{l}</Text>)}
    </View>
  );
}

/** Where readings sit in your own range (board `gauge`): the soft band is normal, each dot a reading. Positions 0–100. */
export function Gauge({ lo, hi, at, onTint, color, style }: { lo: number; hi: number; at: number | number[]; onTint?: boolean; color?: string; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  const dots = Array.isArray(at) ? at : [at];
  return (
    <View style={[{ height: 16 }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={{ position: 'absolute', left: 0, right: 0, top: 6, height: 4, borderRadius: 2, backgroundColor: onTint ? t.surface : t.surface2 }} />
      <View style={{ position: 'absolute', top: 0, height: 16, left: `${lo}%`, width: `${hi - lo}%`, borderRadius: 8, backgroundColor: onTint ? t.surface : t.surface3 }} />
      {dots.map((p, i) => <View key={i} style={{ position: 'absolute', top: 3, left: `${Math.max(0, Math.min(100, p))}%`, marginLeft: -5, width: 10, height: 10, borderRadius: 5, backgroundColor: color ?? t.ink }} />)}
    </View>
  );
}

/** A range with your mark on it (board `.bb-range`): the band is the healthy or usual part, the knob is you. */
export function RangeMark({ from, to, at, onTint, color, style }: { from: number; to: number; at: number; onTint?: boolean; color?: string; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  return (
    <View style={[{ height: 16, borderRadius: 8, backgroundColor: onTint ? t.surface : t.surface2, marginTop: space.md }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={{ position: 'absolute', top: 0, bottom: 0, left: `${from}%`, width: `${to - from}%`, borderRadius: 8, backgroundColor: onTint ? (color ?? t.ink) : t.ink, opacity: onTint ? 0.4 : 0.2 }} />
      <View style={{ position: 'absolute', top: -4, left: `${Math.max(0, Math.min(100, at))}%`, marginLeft: -12, width: 24, height: 24, borderRadius: 12, backgroundColor: t.ink, alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: t.surface }} />
      </View>
    </View>
  );
}

/** Tick labels placed along a range (board `.bb-ticks`): [position 0–100, label]. */
export function Ticks({ marks, style }: { marks: [number, string][]; style?: StyleProp<ViewStyle> }) {
  const W = 64;
  return (
    <View style={[{ height: 14, marginTop: space.xs }, style]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {marks.map(([p, label]) => (
        <Text key={label} variant="micro" tone="ink2" align={p === 0 ? 'left' : undefined}
          style={{ position: 'absolute', top: 0, width: W, left: `${p}%`, marginLeft: p === 0 ? 0 : p === 100 ? -W : -W / 2, textAlign: p === 0 ? 'left' : p === 100 ? 'right' : 'center' }}>{label}</Text>
      ))}
    </View>
  );
}

/** A receipt line (board `.bb-rc`): the label, a dotted leader, the value in ink. */
export function Leader({ label, value, strong, style }: { label: string; value: ReactNode; strong?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: space.tile, minHeight: 42 }, style]}>
      <Text variant={strong ? 'buttonCompact' : 'body'} tone={strong ? 'ink' : 'ink2'} numberOfLines={1}>{label}</Text>
      <View style={{ flex: 1, height: 4, overflow: 'hidden', flexDirection: 'row', gap: 7, alignItems: 'center' }}>
        {Array.from({ length: 40 }, (_, i) => <View key={i} style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: t.surface3 }} />)}
      </View>
      {typeof value === 'string' ? <Text variant="buttonCompact" numberOfLines={1}>{value}</Text> : value}
    </View>
  );
}

/** The board's big figure (`.xl`): numbers at 56pt, the words between them small and quiet ("7h 10m"); a scale after a slash stays small ("11.4/21"). */
export function XL({ text, size = 'xl', onPhoto }: { text: string; size?: 'xl' | 'num'; onPhoto?: boolean }) {
  const slash = text.indexOf('/');
  const head = slash > 0 ? text.slice(0, slash) : text, scale = slash > 0 ? text.slice(slash) : '';
  const parts = head.match(/[+−-]?\d[\d.,:]*|[^\d+−-]+|[+−-]/g) ?? [head];
  const big = size === 'xl' ? 'numeralXl' : 'numeralL';
  const small = (s: string, i: number) => <Text key={i} variant="unit" tone="ink2" style={[{ marginLeft: i ? space.xxs : 0, marginRight: i ? 0 : 6 }, onPhoto ? { color: photo.onPhoto2 } : null]}>{s}</Text>;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', flexWrap: 'nowrap' }} accessible accessibilityLabel={text}>
      {parts.map((p, i) => /\d/.test(p)
        ? <Text key={i} variant={big} style={onPhoto ? { color: photo.onPhoto } : null}>{p}</Text>
        : small(p.trim(), i))}
      {scale ? small(scale, parts.length) : null}
    </View>
  );
}

/** The big figure with its chip resting on the right (board `fig`, `figure`). */
export function FigRow({ text, chip, style }: { text: string; chip?: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: space.sm, marginTop: 6 }, style]}>
      <XL text={text} />
      {chip ? <View style={{ marginBottom: space.tile }}>{chip}</View> : null}
    </View>
  );
}

/** Dots for a fortnight on a photograph (board `.bb-d14`): done in paper, the rest faint. */
export function PhotoDots({ days }: { days: boolean[] }) {
  return (
    <View style={{ flexDirection: 'row', gap: 3, marginTop: space.xs }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {days.map((on, i) => <View key={i} style={{ width: 6, height: 6, borderRadius: radius.full, backgroundColor: on ? photo.onPhoto : photo.fill }} />)}
    </View>
  );
}
