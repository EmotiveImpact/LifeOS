import { useCallback, useState } from 'react';
import { View, type LayoutChangeEvent, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Circle, G, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import { Text } from '../Text';
import { useTokens } from '../theme';
import { fonts, radius, space } from '../tokens';

/** Measures a box's width so a chart can draw at its real size (no stretched strokes). */
function useWidth(initial = 0): [number, (e: LayoutChangeEvent) => void] {
  const [w, setW] = useState(initial);
  const onLayout = useCallback((e: LayoutChangeEvent) => { const next = Math.round(e.nativeEvent.layout.width); setW(c => c === next ? c : next); }, []);
  return [w, onLayout];
}

const fmtMinutes = (m: number) => m >= 60 ? `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`.replace(' 00m', '') : `${m}m`;

/* ───────────────────────── DotStrip (board `days14`) ───────────────────────── */

/** Counted days as a row of the orb's dots: done in ink, the rest quiet. Pass `'11011101101111'` or booleans. */
export function DotStrip({ days, label, style }: { days: string | boolean[]; label?: string; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  const bits = typeof days === 'string' ? days.split('').map(b => b === '1') : days;
  const done = bits.filter(Boolean).length;
  return (
    <View style={[{ flexDirection: 'row', gap: space.xxs }, style]} accessible accessibilityRole="image" accessibilityLabel={label ?? `${done} of the last ${bits.length} days`}>
      {/* 8pt dots that shrink together (staying round) when the row is narrower than 14 of them, as in a half-width tile. */}
      {bits.map((on, i) => <View key={i} style={{ flex: 1, maxWidth: 8, aspectRatio: 1, borderRadius: radius.full, backgroundColor: on ? t.ink : t.surface3 }} />)}
    </View>
  );
}

/* ───────────────────────── DotGrid (board `dots`, `month`) ───────────────────────── */

export type DotCell = '' | 'on' | 'miss' | 'now';

/**
 * Counted days in chunky dots (`dots`): lived days in ink, a missed day as a quiet ring (drawn with fill, not a border),
 * today in ember. Or a month (`month`): seven columns of soft rounded days under M T W T F S S.
 * `holeColor` is the surface the grid sits on (default the card's `surface`).
 */
export function DotGrid({ cells, columns = 11, variant = 'dots', holeColor, label, style }: { cells: DotCell[]; columns?: number; variant?: 'dots' | 'month'; holeColor?: string; label?: string; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  const [w, onLayout] = useWidth();
  const cols = variant === 'month' ? 7 : columns;
  const gap = variant === 'month' ? 6 : 7;
  const size = w ? (w - gap * (cols - 1)) / cols : 0;
  const lived = cells.filter(c => c === 'on' || c === 'now').length, missed = cells.filter(c => c === 'miss').length;
  return (
    <View onLayout={onLayout} style={style} accessible accessibilityRole="image" accessibilityLabel={label ?? `${lived} days lived${missed ? `, ${missed} missed` : ''}, of ${cells.length}`}>
      {variant === 'month' ? <View style={{ flexDirection: 'row', gap, marginBottom: gap }}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <Text key={i} variant="micro" tone="quiet" align="center" style={{ width: size || undefined, flex: size ? undefined : 1 }}>{d}</Text>)}
      </View> : null}
      {size ? <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap }}>
        {cells.map((c, i) => variant === 'month'
          ? <View key={i} style={{ width: size, height: 22, borderRadius: radius.xs, backgroundColor: c === 'on' || c === 'now' ? t.ink : t.surface2 }} />
          : <View key={i} style={{ width: size, height: size, borderRadius: radius.full, backgroundColor: c === 'on' ? t.ink : c === 'now' ? t.ember : t.surface3, alignItems: 'center', justifyContent: 'center' }}>
            {c === 'miss' ? <View style={{ width: size - 4, height: size - 4, borderRadius: radius.full, backgroundColor: holeColor ?? t.surface }} /> : null}
          </View>)}
      </View> : null}
    </View>
  );
}

/* ───────────────────────── BecomingScale (board `scale`) ───────────────────────── */

/** "Who you're becoming": a NO to YES line with five ticks. Older answers are small and quiet; the newest is large, in ink. */
export function BecomingScale({ marks, ends = ['NO', 'YES'], label, style }: { marks: number[]; ends?: [string, string]; label?: string; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  const newest = marks[marks.length - 1] ?? 50;
  return (
    <View style={style} accessible accessibilityRole="image" accessibilityLabel={label ?? `Your last ${marks.length} answers, newest ${newest >= 50 ? 'leaning yes' : 'leaning no'}`}>
      <View style={{ height: 34, marginTop: 18 }}>
        <View style={{ position: 'absolute', left: 0, right: 0, top: 16, height: 2, borderRadius: 1, backgroundColor: t.surface3 }} />
        {[0, 25, 50, 75, 100].map(p => <View key={p} style={{ position: 'absolute', left: `${p}%`, top: 10, width: 2, height: 14, marginLeft: -1, borderRadius: 1, backgroundColor: t.surface3 }} />)}
        {marks.map((p, i) => {
          const last = i === marks.length - 1, d = last ? 16 : 10;
          return <View key={i} style={{ position: 'absolute', left: `${Math.max(0, Math.min(100, p))}%`, top: last ? 9 : 12, width: d, height: d, marginLeft: -d / 2, borderRadius: radius.full, backgroundColor: last ? t.ink : t.inkQuiet }} />;
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: space.xxs }}>
        <Text variant="micro" tone="ink">{ends[0]}</Text><Text variant="micro" tone="ink">{ends[1]}</Text>
      </View>
    </View>
  );
}

/* ───────────────────────── NormalBandChart (Body, Readiness) ───────────────────────── */

export type NormalBandChartProps = {
  /** One reading a day, oldest first; the last is today. */
  values: number[];
  /** The person's own normal range, low and high. */
  normal: [number, number];
  /** Day labels under the dots; the last is today. */
  labels?: string[];
  /** The label above today's dot. Defaults to today's value. */
  todayLabel?: string;
  /** The value range the chart spans. Defaults to a little beyond the readings and the band. */
  domain?: [number, number];
  bandLabel?: string;
  height?: number;
  accessibilityLabel?: string;
};

/**
 * A reading against your own normal: the shaded band is your usual range, each dot a day, today the largest and labelled.
 * Not a ring of dots: nothing but the orb may look like the orb.
 */
export function NormalBandChart({ values, normal, labels = ['M', 'T', 'W', 'T', 'F', 'S', 'Today'], todayLabel, domain, bandLabel = 'your normal', height = 150, accessibilityLabel }: NormalBandChartProps) {
  const t = useTokens();
  const [W, onLayout] = useWidth();
  const [lo, hi] = normal;
  const min = domain?.[0] ?? Math.min(lo, ...values) - 3, max = domain?.[1] ?? Math.max(hi, ...values) + 4;
  const top = 22, bot = 28, last = values.length - 1;
  const x = (k: number) => 96 + k * (W - 114) / Math.max(1, last);
  const y = (v: number) => top + (max - v) / (max - min || 1) * (height - top - bot);
  return (
    <View onLayout={onLayout} style={{ height }} accessible accessibilityRole="image" accessibilityLabel={accessibilityLabel ?? `Readings this week against your normal range of ${lo} to ${hi}. Today ${values[last]}.`}>
      {W ? <Svg width={W} height={height}>
        <Rect x={0} y={y(hi)} width={W} height={y(lo) - y(hi)} rx={10} fill={t.surface2} />
        <SvgText x={8} y={y(hi) + 15} fontSize={11} fontFamily={fonts.sansSemibold} fill={t.inkQuiet}>{bandLabel}</SvgText>
        {values.map((v, k) => {
          const today = k === last;
          return <G key={k}>
            <Circle cx={x(k)} cy={y(v)} r={today ? 8 : 5} fill={t.ink} opacity={today ? 1 : .32} />
            {today ? <SvgText x={x(k)} y={y(v) - 14} fontSize={13} fontFamily={fonts.sansSemibold} fill={t.ink} textAnchor="middle">{todayLabel ?? String(v)}</SvgText> : null}
            <SvgText x={x(k)} y={height - 6} fontSize={11} fontFamily={fonts.sansSemibold} fill={today ? t.ink : t.inkQuiet} textAnchor="middle">{labels[k] ?? ''}</SvgText>
          </G>;
        })}
      </Svg> : null}
    </View>
  );
}

/* ───────────────────────── Sparkline (board `spark`) ───────────────────────── */

/** A small week line with your normal as a band, for a reading row. Today's point is solid. */
export function Sparkline({ values, normal, width = 118, height = 44, color }: { values: number[]; normal: [number, number]; width?: number; height?: number; color?: string }) {
  const t = useTokens();
  const ink = color ?? t.ink, pad = 6, [lo, hi] = normal;
  const min = Math.min(...values, lo), max = Math.max(...values, hi), last = values.length - 1;
  const x = (k: number) => pad + k * (width - pad * 2) / Math.max(1, last);
  const y = (n: number) => height - pad - (n - min) / (max - min || 1) * (height - pad * 2);
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ width, height }}><Svg width={width} height={height}>
      <Rect x={0} y={y(hi)} width={width} height={y(lo) - y(hi)} rx={6} fill={t.surface2} />
      <Polyline points={values.map((n, k) => `${x(k)},${y(n)}`).join(' ')} fill="none" stroke={ink} strokeWidth={1.6} strokeLinejoin="round" />
      {values.map((n, k) => <Circle key={k} cx={x(k)} cy={y(n)} r={k === last ? 3.6 : 2.6} fill={k === last ? ink : t.surface} stroke={ink} strokeWidth={1.6} />)}
    </Svg></View>
  );
}

/* ───────────────────────── BandLine (TrendLine look="v26", board `line`) ───────────────────────── */

/** A wide trend with the band for your normal range and today's dot, drawn at its real width. */
export function BandLine({ values, normal, height = 120, width, color, bandColor, label }: { values: number[]; normal: [number, number]; height?: number; width?: number; color?: string; bandColor?: string; label?: string }) {
  const t = useTokens();
  const [measured, onLayout] = useWidth();
  const W = width ?? measured, pad = width && width < 120 ? 4 : 10, [lo, hi] = normal, ink = color ?? t.ink;
  const min = Math.min(...values, lo), max = Math.max(...values, hi), last = values.length - 1;
  const x = (k: number) => pad + k * (W - pad * 2) / Math.max(1, last);
  const y = (n: number) => height - pad - (n - min) / (max - min || 1) * (height - pad * 2);
  return (
    <View onLayout={width ? undefined : onLayout} style={{ height, width }} accessible accessibilityRole="image" accessibilityLabel={label ?? `Trend against your normal range of ${lo} to ${hi}. Latest ${values[last]}.`}>
      {W ? <Svg width={W} height={height}>
        <Rect x={0} y={y(hi)} width={W} height={Math.max(0, y(lo) - y(hi))} rx={Math.min(10, (y(lo) - y(hi)) / 2)} fill={bandColor ?? t.surface2} />
        <Polyline points={values.map((n, k) => `${x(k)},${y(n)}`).join(' ')} fill="none" stroke={ink} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <Circle cx={x(last)} cy={y(values[last])} r={width && width < 120 ? 3.5 : 5} fill={ink} />
      </Svg> : null}
    </View>
  );
}

/* ───────────────────────── CapsuleBars (MiniBars look="capsule", board `bars`) ───────────────────────── */

/** Tall capsule bars for a week or a set of readings, drawn at their real width. `now` (default the last) is solid. */
export function CapsuleBars({ values, labels, now, height = 120, width, max, color, dim = .2, label }: { values: number[]; labels?: string[]; now?: number; height?: number; width?: number; max?: number; color?: string; dim?: number; label?: string }) {
  const t = useTokens();
  const [measured, onLayout] = useWidth();
  const W = width ?? measured, top = Math.max(...values, max ?? 0) || 1, picked = now ?? values.length - 1;
  const col = W / values.length, bw = Math.max(2, Math.min(30, col - 8)), ink = color ?? t.ink;
  return (
    <View onLayout={width ? undefined : onLayout} style={{ height, width }} accessible accessibilityRole="image" accessibilityLabel={label ?? `Chart of ${values.length} values`}>
      {W ? <Svg width={W} height={height}>
        {values.map((v, k) => {
          const h = Math.max(6, v / top * (height - 26));
          return <G key={k}>
            <Rect x={col * k + col / 2 - bw / 2} y={height - 20 - h} width={bw} height={h} rx={Math.min(bw / 2, h / 2)} fill={ink} opacity={k === picked ? 1 : dim} />
            {labels ? <SvgText x={col * k + col / 2} y={height - 4} fontSize={11} fontFamily={fonts.sansSemibold} fill={k === picked ? t.ink : t.inkQuiet} textAnchor="middle">{labels[k]}</SvgText> : null}
          </G>;
        })}
      </Svg> : null}
    </View>
  );
}

/* ───────────────────────── CapsulePairs (board `caps`) ───────────────────────── */

export type CapsuleWeek = { label: string; in: number; out: number; now?: boolean };

/** Money coming in (above) and going out (below), week by week, with the week that matters picked out. */
export function CapsulePairs({ weeks, height = 150, label }: { weeks: CapsuleWeek[]; height?: number; label?: string }) {
  const t = useTokens();
  const [W, onLayout] = useWidth();
  const mid = 82, top = Math.max(1, ...weeks.flatMap(w => [w.in, w.out])), col = W / Math.max(1, weeks.length), bw = Math.min(34, col - 8), sc = 72 / top;
  return (
    <View onLayout={onLayout} style={{ height }} accessible accessibilityRole="image" accessibilityLabel={label ?? `Money coming in and going out, by week. ${weeks.map(w => `${w.label}: in ${w.in}, out ${w.out}`).join('. ')}`}>
      {W ? <Svg width={W} height={height}>
        {weeks.map((w, k) => {
          const cx = col * k + col / 2, hi = Math.max(w.in * sc, 8), ho = Math.max(w.out * sc, 8);
          return <G key={k}>
            {w.in ? <Rect x={cx - bw / 2} y={mid - 3 - hi} width={bw} height={hi} rx={Math.min(15, hi / 2)} fill={t.ink} opacity={w.now ? 1 : .22} /> : <Circle cx={cx} cy={mid - 8} r={3} fill={t.surface3} />}
            <Rect x={cx - bw / 2} y={mid + 3} width={bw} height={ho} rx={Math.min(15, ho / 2)} fill={t.ink2} opacity={w.now ? .9 : .25} />
            <SvgText x={cx} y={height - 2} fontSize={11} fontFamily={fonts.sansSemibold} fill={w.now ? t.ink : t.inkQuiet} textAnchor="middle">{w.label}</SvgText>
          </G>;
        })}
      </Svg> : null}
    </View>
  );
}

/* ───────────────────────── SleepTracks (Hypnogram look="tracks") ───────────────────────── */

export type SleepTrackStage = 'awake' | 'rem' | 'light' | 'deep';

/** Last night as four tracks on `surface2` rails: awake at the top, deep at the bottom and darkest. With a totals key. */
export function SleepTracks({ segments, start, end, summary }: { segments: { stage: SleepTrackStage; minutes: number }[]; start: string; end: string; summary?: string }) {
  const t = useTokens();
  const [W, onLayout] = useWidth();
  const level: Record<SleepTrackStage, [number, string, number]> = { awake: [0, t.inkQuiet, .55], rem: [1, t.ink, .45], light: [2, t.ink, .22], deep: [3, t.ink, 1] };
  const row = 16, gap = 8, H = 4 * row + 3 * gap, total = segments.reduce((s, x) => s + x.minutes, 0) || 1;
  const totals = segments.reduce<Record<SleepTrackStage, number>>((a, s) => ({ ...a, [s.stage]: a[s.stage] + s.minutes }), { awake: 0, rem: 0, light: 0, deep: 0 });
  let x = 0;
  const blocks = W ? segments.map((s, i) => { const w = s.minutes / total * W, [l, fill, o] = level[s.stage], at = x; x += w; return <Rect key={i} x={at + .6} y={l * (row + gap)} width={Math.max(2, w - 1.2)} height={row} rx={5} fill={fill} opacity={o} />; }) : null;
  return (
    <View style={{ gap: space.sm }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: space.xs }}>
        <Text variant="callout" tone="ink2">{start}</Text>{summary ? <Text variant="callout" tone="ink2" numberOfLines={1} style={{ flexShrink: 1 }}>{summary}</Text> : null}<Text variant="callout" tone="ink2">{end}</Text>
      </View>
      <View onLayout={onLayout} style={{ height: H }} accessible accessibilityRole="image" accessibilityLabel={`Sleep stages from ${start} to ${end}. Deep ${fmtMinutes(totals.deep)}, REM ${fmtMinutes(totals.rem)}, light ${fmtMinutes(totals.light)}, awake ${fmtMinutes(totals.awake)}.`}>
        {W ? <Svg width={W} height={H}>
          {[0, 1, 2, 3].map(l => <Rect key={l} x={0} y={l * (row + gap)} width={W} height={row} rx={8} fill={t.surface2} />)}
          {blocks}
        </Svg> : null}
      </View>
      <View style={{ flexDirection: 'row', gap: space.xs, marginTop: 2 }}>
        {(['deep', 'rem', 'light', 'awake'] as const).map(s => (
          <View key={s} style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 8, height: 8, borderRadius: 3, backgroundColor: level[s][1], opacity: level[s][2] }} />
              <Text variant="micro" tone="ink2">{s === 'rem' ? 'REM' : s[0].toUpperCase() + s.slice(1)}</Text>
            </View>
            <Text variant="buttonCompact" style={{ marginTop: 2 }}>{fmtMinutes(totals[s])}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
