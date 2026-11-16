import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Path, Rect, Line } from 'react-native-svg';
import Animated, { useAnimatedProps, useSharedValue, withSpring } from 'react-native-reanimated';
import { Text } from '../Text';
import { Press } from '../Press';
import { useCalmMotion, useTokens } from '../theme';
import { areaColors, motion, radius, space } from '../tokens';
import { RollingNumeral } from './Story';

const ACircle = Animated.createAnimatedComponent(Circle);
export function ProgressRing({ value, max = 100, size = 120, label, display, color }: { value: number; max?: number; size?: number; label?: string; display?: string; color?: string }) {
  const t = useTokens(), calm = useCalmMotion(), progress = useSharedValue(calm ? value / max : 0);
  const r = (size - 10) / 2, circumference = 2 * Math.PI * r;
  useEffect(() => { progress.value = calm ? value / max : withSpring(value / max, motion.smooth); }, [value, max, calm, progress]);
  const props = useAnimatedProps(() => ({ strokeDashoffset: circumference * (1 - Math.max(0, Math.min(1, progress.value))) }));
  return <View style={{ width: size, height: size }} accessible accessibilityRole="progressbar" accessibilityLabel={label} accessibilityValue={{ min: 0, max, now: value, text: display }}>
    <Svg width={size} height={size}><Circle cx={size / 2} cy={size / 2} r={r} stroke={t.surface2} strokeWidth={10} fill="none" /><ACircle cx={size / 2} cy={size / 2} r={r} stroke={color ?? t.ink} strokeWidth={10} fill="none" strokeDasharray={`${circumference} ${circumference}`} animatedProps={props} strokeLinecap="round" rotation={-90} origin={`${size / 2}, ${size / 2}`} /></Svg>
    <View style={[StyleSheet.absoluteFill, { justifyContent: 'center', alignItems: 'center' }]}><Text variant="numeralL">{display ?? Math.round(value).toLocaleString('en-GB')}</Text>{label ? <Text variant="callout" tone="ink2">{label}</Text> : null}</View>
  </View>;
}
export type BarDatum = { label: string; value: number; max: number; unit?: string; note?: string };
export function NutrientBar({ label, value, max, unit = '', note, color }: BarDatum & { color?: string }) {
  const t = useTokens();
  return <View style={{ gap: space.xxs }} accessible accessibilityLabel={`${label}: ${value} of ${max} ${unit}${note ? `. ${note}` : ''}`}>
    <View style={s.between}><Text variant="body">{label}</Text><Text variant="callout" tone="ink2">{`${value} / ${max}${unit}`}</Text></View>
    <View style={[s.track, { backgroundColor: t.surface2 }]}><View style={{ width: `${Math.max(0, Math.min(100, value / Math.max(1, max) * 100))}%`, height: '100%', borderRadius: radius.full, backgroundColor: color ?? t.ink }} /></View>
    {note ? <Text variant="callout" tone="ink2">{note}</Text> : null}
  </View>;
}
export function MacroBars({ items }: { items: BarDatum[] }) {
  const t = useTokens(), colors = [t.gain, areaColors[t.scheme].work, areaColors[t.scheme].home];
  return <View style={{ flex: 1, gap: space.xs }}>{items.map((v, i) => <NutrientBar key={v.label} {...v} color={colors[i]} />)}</View>;
}
export function ScoreBadge({ value, max = 10 }: { value: number; max?: number }) {
  const t = useTokens();
  return <View style={{ width: 72, height: 72, borderRadius: radius.lg, backgroundColor: t.gainTint, alignItems: 'center', justifyContent: 'center' }}><Text variant="numeralL" tone="gain">{value}</Text><Text variant="callout" tone="ink2">{`of ${max}`}</Text></View>;
}
/** One time axis, one series, with directly inspectable readings. No dual scales. */
export function TrendLine({ values, labels, height = 96, band, color, unit = '', label = 'Trend', min, max }: { values: number[]; labels?: string[]; height?: number; band?: [number, number]; color?: string; unit?: string; label?: string; min?: number; max?: number }) {
  const t = useTokens(), [selected, setSelected] = useState<number | null>(null), calm = useCalmMotion();
  const lo = min ?? Math.min(...values) - 1, hi = max ?? Math.max(...values) + 1, range = hi - lo || 1;
  const px = (i: number) => 6 + i / Math.max(1, values.length - 1) * 288, py = (v: number) => height - 8 - (v - lo) / range * (height - 16);
  const points = values.map((v, i) => [px(i), py(v)]);
  const path = points.map(([x, y], i) => i === 0 ? `M${x},${y}` : `C${(points[i - 1][0] + x) / 2},${points[i - 1][1]} ${(points[i - 1][0] + x) / 2},${y} ${x},${y}`).join(' ');
  return <View style={{ gap: space.xxs }} accessibilityLabel={`${label}. ${values.map((v, i) => `${labels?.[i] ?? i + 1}: ${v}${unit}`).join(', ')}`}>
    <Svg width="100%" height={height} viewBox={`0 0 300 ${height}`}>
      {band ? <Rect x={0} y={py(band[1])} width={300} height={Math.max(0, py(band[0]) - py(band[1]))} fill={t.surface2} rx={radius.xs} /> : null}
      <Path d={path} fill="none" stroke={color ?? t.ink} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {selected !== null ? <><Line x1={px(selected)} x2={px(selected)} y1={0} y2={height} stroke={t.ink2} strokeWidth={1} /><Circle cx={px(selected)} cy={py(values[selected])} r={4} fill={color ?? t.ink} /></> : null}
    </Svg>
    <View style={[StyleSheet.absoluteFill, { flexDirection: 'row', bottom: space.lg }]}>{values.map((v, i) => <Press key={i} haptic="select" onPress={() => setSelected(selected === i ? null : i)} accessibilityLabel={`${labels?.[i] ?? `Reading ${i + 1}`}: ${v}${unit}`} style={{ flex: 1 }} />)}</View>
    <View style={s.between}><Text variant="callout" tone="ink2">{selected === null ? labels?.[0] ?? '' : labels?.[selected] ?? `Reading ${selected + 1}`}</Text><Text variant="callout" tone="ink2">{selected === null ? labels?.[labels.length - 1] ?? '' : `${values[selected]}${unit}`}</Text></View>
  </View>;
}
export function ProjectionChart({ values, start, end, unit = ' kg' }: { values: number[]; start: string; end: string; unit?: string }) {
  return <TrendLine values={values} labels={values.map((_, i) => i === 0 ? start : i === values.length - 1 ? end : '')} unit={unit} label="Projection, an estimate" />;
}
export function ZoneBars({ zones }: { zones: { name: string; range: string; minutes: number }[] }) {
  const t = useTokens(), colors = [t.ember, areaColors[t.scheme].health, t.gain, areaColors[t.scheme].work, t.ink2], max = Math.max(1, ...zones.map(z => z.minutes));
  return <View style={{ gap: space.sm }}>{zones.map((z, i) => <View key={z.name} style={{ gap: space.xxs }}><View style={s.between}><Text variant="body">{z.name}<Text variant="callout" tone="ink2">{`  ${z.range} bpm`}</Text></Text><Text variant="callout" tone="ink2">{`${z.minutes} min`}</Text></View><View style={[s.track, { backgroundColor: t.surface2 }]}><View style={{ height: '100%', width: `${z.minutes / max * 100}%`, backgroundColor: colors[i], borderRadius: radius.full }} /></View></View>)}</View>;
}
export function Hypnogram({ segments, start, end }: { segments: { stage: 'awake' | 'rem' | 'light' | 'deep'; minutes: number }[]; start: string; end: string }) {
  const t = useTokens(), levels = { awake: 0, rem: 1, light: 2, deep: 3 }, colors = { awake: t.ember, rem: areaColors[t.scheme].health, light: areaColors[t.scheme].work, deep: t.ink2 }, total = segments.reduce((a, b) => a + b.minutes, 0);
  let x = 0;
  return <View style={{ gap: space.xs }} accessibilityLabel={`Sleep stages from ${start} to ${end}. ${segments.map(v => `${v.stage}, ${v.minutes} minutes`).join('. ')}`}>
    <Svg width="100%" height={112} viewBox="0 0 300 112">{segments.map((v, i) => { const w = v.minutes / total * 300, at = x; x += w; return <Rect key={i} x={at} y={levels[v.stage] * 25 + 4} width={Math.max(1, w - 1)} height={22} rx={3} fill={colors[v.stage]} />; })}</Svg>
    <View style={s.between}><Text variant="callout" tone="ink2">{start}</Text><Text variant="callout" tone="ink2">{end}</Text></View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.sm }}>{(['deep', 'rem', 'light', 'awake'] as const).map(stage => <View key={stage} style={s.inline}><View style={[s.dot, { backgroundColor: colors[stage] }]} /><Text variant="callout" tone="ink2">{stage === 'rem' ? 'REM' : stage}</Text></View>)}</View>
  </View>;
}
export type WindowDatum = { day: string; start: number; end: number; highlight?: boolean };
export function RegularityChart({ windows }: { windows: WindowDatum[] }) { return <TimeWindows windows={windows} min={21} max={33} labels={['21:00', '03:00', '09:00']} />; }
export function EatingWindow({ windows }: { windows: WindowDatum[] }) { return <TimeWindows windows={windows} min={6} max={24} labels={['06:00', '15:00', '00:00']} />; }
function TimeWindows({ windows, min, max, labels }: { windows: WindowDatum[]; min: number; max: number; labels: string[] }) {
  const t = useTokens();
  return <View style={{ gap: space.xs }}>{windows.map(w => <View key={w.day} style={s.inline} accessible accessibilityLabel={`${w.day}, ${w.start} to ${w.end}`}><Text variant="callout" tone="ink2" style={{ width: 32 }}>{w.day}</Text><View style={{ flex: 1, height: 16 }}><View style={{ position: 'absolute', left: `${(w.start - min) / (max - min) * 100}%`, width: `${(w.end - w.start) / (max - min) * 100}%`, height: 8, top: 4, borderRadius: radius.full, backgroundColor: w.highlight ? t.ember : areaColors[t.scheme].work }} /></View></View>)}<View style={[s.between, { marginLeft: space.xxl }]}>{labels.map(l => <Text key={l} variant="callout" tone="ink2">{l}</Text>)}</View></View>;
}
export function HeatGrid({ values, columns = 7, label = 'Calendar' }: { values: (number | null)[]; columns?: number; label?: string }) {
  const t = useTokens(), [selected, setSelected] = useState<number | null>(null);
  return <View style={{ gap: space.xs }}><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xxs }}>{values.map((v, i) => <Press key={i} haptic="select" onPress={() => setSelected(i)} accessibilityLabel={`${label}, day ${i + 1}, ${v === null ? 'not yet' : `${Math.round(v * 100)} percent`}`} style={{ width: `${100 / columns - 1.5}%`, aspectRatio: 1, borderRadius: radius.xs, backgroundColor: t.surface2, overflow: 'hidden' }}>{v === null ? null : <View style={[StyleSheet.absoluteFill, { backgroundColor: t.gain, opacity: .2 + v * .5 }]} />}</Press>)}</View>{selected !== null ? <Text variant="callout" tone="ink2">{`Day ${selected + 1} · ${values[selected] === null ? 'Not yet' : `${Math.round((values[selected] ?? 0) * 100)}%`}`}</Text> : null}</View>;
}
export function WeekBars({ values, target, labels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] }: { values: number[]; target: number; labels?: string[] }) {
  const t = useTokens(), [selected, setSelected] = useState<number | null>(null), max = Math.max(target * 1.2, ...values);
  return <View style={{ gap: space.xs }}><View style={{ height: 112, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around' }}>
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: target / max * 96, height: 8, backgroundColor: t.surface2, borderRadius: radius.xs }} />
    {values.map((v, i) => <Press key={i} onPress={() => setSelected(i)} accessibilityLabel={`${labels[i]}, ${v}, target ${target}`} style={{ flex: 1, height: 112, justifyContent: 'flex-end', alignItems: 'center' }}><View style={{ width: 22, height: Math.max(2, v / max * 96), backgroundColor: i === selected ? t.ember : t.ink, borderTopLeftRadius: 4, borderTopRightRadius: 4 }} /></Press>)}
  </View><View style={{ flexDirection: 'row' }}>{labels.map((v, i) => <Text key={i} variant="callout" tone="ink2" align="center" style={{ flex: 1 }}>{v}</Text>)}</View>{selected !== null ? <Text variant="callout" tone="ink2">{`${values[selected].toLocaleString('en-GB')} · target ${target.toLocaleString('en-GB')}`}</Text> : null}</View>;
}
export function ShareBar({ items }: { items: { label: string; value: number }[] }) {
  const t = useTokens(), colors = [t.gain, t.ink2, t.surface3], total = items.reduce((a, v) => a + v.value, 0) || 1;
  return <View style={{ gap: space.sm }}><View style={{ flexDirection: 'row', height: 18, gap: 2, borderRadius: radius.xs, overflow: 'hidden' }}>{items.map((v, i) => <View key={v.label} accessibilityLabel={`${v.label}, ${Math.round(v.value / total * 100)} percent`} style={{ flex: v.value, backgroundColor: colors[i % colors.length] }} />)}</View>{items.map((v, i) => <View key={v.label} style={s.between}><View style={s.inline}><View style={[s.dot, { backgroundColor: colors[i % colors.length] }]} /><Text variant="body">{v.label}</Text></View><Text variant="callout" tone="ink2">{`${Math.round(v.value / total * 100)}%`}</Text></View>)}</View>;
}
export function StatTile({ label, value, unit, note }: { label: string; value: string | number; unit?: string; note?: string }) {
  const t = useTokens();
  return <View style={{ flex: 1, backgroundColor: t.surface, borderRadius: radius.md, padding: space.sm, gap: space.xxs }}><Text variant="callout" tone="ink2">{label}</Text>{typeof value === 'number' ? <RollingNumeral value={value} size="l" /> : <Text variant="title">{value}{unit ? ` ${unit}` : ''}</Text>}{note ? <Text variant="callout" tone="ink2">{note}</Text> : null}</View>;
}
const s = StyleSheet.create({ between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.xs }, inline: { flexDirection: 'row', alignItems: 'center', gap: space.xs }, track: { height: 6, borderRadius: radius.full, overflow: 'hidden' }, dot: { width: 6, height: 6, borderRadius: radius.full } });
