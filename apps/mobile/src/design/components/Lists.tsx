import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { FadeIn, LinearTransition } from 'react-native-reanimated';
import { Icon as Ionicons, type GlyphName } from '../Icon';
import { Press } from '../Press';
import { Callout, Mono, Text, Title } from '../Text';
import { useTokens } from '../theme';
import { areaColors, cardShadow, componentSize, durations, fonts, radius, space, touch, type Area } from '../tokens';
import { Slider } from './Controls';
import { CapsuleBars } from './V26Data';
import { CheckRows, V26Row, type V26RowProps } from './V26Lists';
import { Reading, V26Tile, type ReadingProps, type V26TileProps } from './V26Tiles';

export function useAreaColor(area: Area): string {
  const t = useTokens();
  return areaColors[t.scheme][area];
}

/* ───────────────────────── ListRow ───────────────────────── */

export type ListRowProps = {
  /** V26 row (board `row`, `thumbRow`, `dateRow`): 40pt icon well, a photo thumb or a date box, quiet chevron. */
  look?: 'v26';
  title: string;
  sub?: string;
  /** Ionicon in a 34pt tile on the left. */
  icon?: GlyphName;
  /** V26: a 48pt photograph on the left. */
  thumb?: V26RowProps['thumb'];
  thumbFocal?: V26RowProps['thumbFocal'];
  /** V26: a 48pt date box on the left. */
  date?: V26RowProps['date'];
  /** V26: quiet words on the right ("Sat"). */
  end?: string;
  /** A 6pt area dot on the left instead of an icon. */
  area?: Area;
  right?: ReactNode;
  chevron?: boolean;
  onPress?: () => void;
  tone?: 'ink' | 'ember';
};

/** The standard list row. Rows inside a Card get 1px hairline dividers via <RowGroup>. */
export function ListRow(props: ListRowProps) {
  if (props.look === 'v26') return <V26Row title={props.title} sub={props.sub} icon={props.icon} thumb={props.thumb} thumbFocal={props.thumbFocal} date={props.date} end={props.end} right={props.right} chevron={props.chevron} onPress={props.onPress} />;
  return <ListRowV23 {...props} />;
}

function ListRowV23({ title, sub, icon, area, right, chevron, onPress, tone = 'ink' }: ListRowProps) {
  const t = useTokens();
  const dot = area ? areaColors[t.scheme][area] : null;
  const body = (
    <>
      {icon ? (
        <View style={[styles.icon, { backgroundColor: t.surface2 }]}>
          <Ionicons name={icon} size={componentSize.icon} color={t.ink2} />
        </View>
      ) : null}
      {dot ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: dot }} /> : null}
      <View style={{ flex: 1, minWidth: 0, gap: space.xxs }}>
        <Text variant="body" tone={tone === 'ember' ? 'ember' : 'ink'} style={{ fontFamily: fonts.sansMedium }}>
          {title}
        </Text>
        {sub ? <Callout tone="ink2">{sub}</Callout> : null}
      </View>
      {right ? <View style={{ flexShrink: 1, maxWidth: '42%', alignItems: 'flex-end' }}>{right}</View> : null}
      {chevron ? <Ionicons name="chevron-forward" size={18} color={t.inkQuiet} /> : null}
    </>
  );
  return onPress ? (
    <Press haptic="open" pressScale={0.97} onPress={onPress} accessibilityLabel={title} style={styles.row}>
      {body}
    </Press>
  ) : (
    <View style={styles.row}>{body}</View>
  );
}

/** Wraps rows in one surface. No dividers (DESIGN §47): rows separate by spacing. */
export function RowGroup({ children, header, count }: { children: ReactNode[]; header?: string; count?: string }) {
  const t = useTokens();
  return (
    <View style={[styles.group, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
      {header ? (
        <View style={styles.groupHead}>
          <Title>{header}</Title>
          {count ? <Callout tone="ink2">{count}</Callout> : null}
        </View>
      ) : null}
      {children.map((c, i) => (
        <View key={i} style={i > 0 ? { marginTop: 2 } : undefined}>
          {c}
        </View>
      ))}
    </View>
  );
}

/* ───────────────────────── Checklist (gates, steps) ───────────────────────── */

export type CheckItem = { label: string; sub?: string; done: boolean; meta?: string };

/** Square checks (radius 7). Used for "To move up" gates, mission steps, nudge steps, protection checks. */
export function Checklist({ items, onToggle, header, count, look, bare }: { items: CheckItem[]; onToggle?: (i: number) => void; header?: string; count?: string; /** V26 `round`: 26pt round ticks, 16pt lines, done in ink2 without a strike. */ look?: 'round'; /** V26: no card around the lines (they sit inside an accordion or a card already). */ bare?: boolean }) {
  const t = useTokens();
  if (look === 'round') {
    const rows = <CheckRows items={items} onToggle={onToggle} />;
    return bare ? rows : <RowGroup header={header} count={count}>{[rows]}</RowGroup>;
  }
  return (
    <RowGroup header={header} count={count}>
      {items.map((it, i) => (
        <Press
          key={it.label}
          haptic={it.done ? 'select' : 'complete'}
          pressScale={0.97}
          onPress={() => onToggle?.(i)}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: it.done }}
          accessibilityLabel={it.label}
          style={styles.row}
        >
          <View style={[styles.box, it.done ? { backgroundColor: t.ink } : { backgroundColor: t.surface3 }]}>
            {it.done ? <Ionicons name="checkmark" size={14} color={t.canvas} /> : null}
          </View>
          <View style={{ flex: 1, minWidth: 0, gap: space.xxs }}>
            <Text variant="body" tone={it.done ? 'quiet' : 'ink'} style={it.done ? { textDecorationLine: 'line-through' } : undefined}>
              {it.label}
            </Text>
            {it.sub ? <Callout tone="ink2">{it.sub}</Callout> : null}
          </View>
          {it.meta ? <Callout tone="ink2">{it.meta}</Callout> : null}
        </Press>
      ))}
    </RowGroup>
  );
}

/* ───────────────────────── Tags & tiles ───────────────────────── */

/** Ember "New at level N" tag for freshly unlocked sections. Fades after the first visit (caller decides). */
export function NewTag({ level }: { level: number }) {
  const t = useTokens();
  return (
    <View style={[styles.tag, { backgroundColor: t.emberTint }]}>
      <Text variant="micro" tone="ember">{`New at level ${level}`}</Text>
    </View>
  );
}

/** Toolkit tile. Locked tiles are quiet outlines with "L3"; tapping a locked tile offers "Unlock early" (SPEC §5). */
export function ToolTile({ title, icon, locked, level, onPress, compact = false }: { title: string; icon: keyof typeof Ionicons.glyphMap; locked?: boolean; level?: number; onPress?: () => void; compact?: boolean }) {
  const t = useTokens();
  return (
    <Press
      haptic={locked ? 'select' : 'open'}
      onPress={onPress}
      accessibilityLabel={locked ? `${title}, unlocks at level ${level}` : title}
      style={[styles.tool, compact ? { minHeight: componentSize.toolCompact, borderRadius: radius.button, padding: space.md, gap: space.sm } : null, { backgroundColor: locked ? 'transparent' : t.surface }]}
    >
      {compact ? <Ionicons name={icon} size={componentSize.icon} color={t.ink2} /> : <View style={[styles.icon, { backgroundColor: t.surface2, opacity: locked ? 0.4 : 1 }]}>
        <Ionicons name={icon} size={componentSize.icon} color={t.ink2} />
      </View>}
      <Text variant={compact ? 'callout' : 'title'} style={{ opacity: locked ? 0.45 : 1 }}>{title}</Text>
      {locked ? <Text variant="micro" tone="ink2" style={{ position: 'absolute', top: 14, right: 14 }}>{`L${level}`}</Text> : null}
    </Press>
  );
}

/* ───────────────────────── InsightCard (Things to know) ───────────────────────── */

export function InsightCard({ area, source, value, text, width }: { area: Area; source: string; value: string; text: string; width?: number }) {
  const t = useTokens();
  const c = areaColors[t.scheme][area];
  return (
    <View style={[styles.card, { backgroundColor: t.surface, ...cardShadow(t.scheme), width, gap: 10 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: c }} />
        <Callout tone="ink2" numberOfLines={1} style={{ fontSize: 12, flex: 1 }}>
          {`${area[0].toUpperCase()}${area.slice(1)} · ${source}`}
        </Callout>
      </View>
      <Text variant="numeralL" style={{ fontSize: 30, lineHeight: 32 }}>
        {value}
      </Text>
      <Text variant="body" tone="ink2" style={{ fontSize: 14, lineHeight: 20 }}>
        {text}
      </Text>
    </View>
  );
}

/* ───────────────────────── RecordRow + ChangeSummary (Understood) ───────────────────────── */

export function RecordRow({ area, badge, label, destination, removed, onToggleRemove }: { area: Area; badge: string; label: string; destination: string; removed?: boolean; onToggleRemove: () => void }) {
  const t = useTokens();
  return (
    <Animated.View layout={LinearTransition.springify().dampingRatio(1).duration(400)} style={styles.row}>
      <View style={[styles.badge, { backgroundColor: areaColors[t.scheme][area] }]}>
        <Text variant="micro" style={{ color: '#0D0E10', fontSize: 12 }}>
          {badge}
        </Text>
      </View>
      <View style={{ flex: 1, gap: 1, opacity: removed ? 0.35 : 1 }}>
        <Title style={[{ fontSize: 15 }, removed ? { textDecorationLine: 'line-through' } : null]}>{label}</Title>
        <Callout tone="ink2">{`→ ${destination}`}</Callout>
      </View>
      <Press haptic="select" onPress={onToggleRemove} accessibilityLabel={removed ? `Undo removing ${label}` : `Remove ${label}`} style={[styles.small, { backgroundColor: t.surface2 }]}>
        <Callout>{removed ? 'Undo' : 'Remove'}</Callout>
      </Press>
    </Animated.View>
  );
}

export function ChangeSummary({ title = 'What this changed', children }: { title?: string; children: ReactNode }) {
  const t = useTokens();
  return (
    <View style={[styles.card, { backgroundColor: t.emberTint, gap: 6 }]}>
      <Callout tone="ember" style={{ fontFamily: 'Inter_600SemiBold' }}>
        {title}
      </Callout>
      {typeof children === 'string' ? <Text variant="body">{children}</Text> : children}
    </View>
  );
}

/* ───────────────────────── HabitRow (SPEC §3.6) ───────────────────────── */

export type HabitRowProps = {
  name: string;
  /** "After the kettle boils, I will drink a glass of water, in the kitchen." */
  cue: string;
  /** Last 14 days, oldest first. The last item is today (undefined = not yet). */
  last14: (boolean | undefined)[];
  meta?: string;
  source?: string;
  onToggleToday?: () => void;
};

/** A habit card: name, cue sentence, 14-day grid, "N of last 14". Tap today's cell to mark done. Never a broken-chain streak. */
export function HabitRow({ name, cue, last14, meta, source, onToggleToday }: HabitRowProps) {
  const t = useTokens();
  const done = last14.filter(Boolean).length;
  return (
    <View style={[styles.card, { backgroundColor: t.surface, ...cardShadow(t.scheme), gap: 10 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
        <Title style={{ flex: 1 }}>{name}</Title>
        {source ? (
          <View style={[styles.tag, { backgroundColor: t.surface2 }]}>
            <Text variant="micro" tone="ink2">{source}</Text>
          </View>
        ) : null}
      </View>
      <Callout tone="ink2">{cue}</Callout>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xxs }}>
        {last14.map((d, i) => {
          const today = i === last14.length - 1;
          const bg = d ? t.ink : today ? t.surface2 : d === false ? t.surface3 : t.surface3;
          const cell = <View style={{ height: 22, borderRadius: 5, backgroundColor: bg, borderWidth: today && !d ? 1.5 : 0, borderColor: t.ember }} />;
          return today && onToggleToday ? (
            <Press key={i} haptic={d ? 'select' : 'complete'} onPress={onToggleToday} accessibilityRole="checkbox" accessibilityState={{ checked: !!d }} accessibilityLabel={`${name} today`} hitSlop={{ left: space.md, right: space.md }} style={{ flex: 1, minHeight: touch.min, justifyContent: 'center' }}>
              {cell}
            </Press>
          ) : (
            <View key={i} style={{ flex: 1 }}>
              {cell}
            </View>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Callout tone="ink2">{`${done} of last ${last14.length} days`}</Callout>
        {meta ? <Callout tone="ink2">{meta}</Callout> : null}
      </View>
    </View>
  );
}

/* ───────────────────────── FoodItemRow (SPEC §3.5) ───────────────────────── */

export function FoodItemRow({ name, grams, defaultGrams, kcalPer100, onChange }: { name: string; grams: number; defaultGrams: number; kcalPer100: number; onChange: (g: number) => void }) {
  return (
    <View style={{ paddingVertical: 10, gap: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Text variant="body" style={{ fontFamily: 'Inter_500Medium' }}>
          {name}
        </Text>
        <Callout tone="ink2">{`${grams}g · ${Math.round((kcalPer100 * grams) / 100)} kcal`}</Callout>
      </View>
      <Slider value={grams} min={0} max={defaultGrams * 2} step={Math.max(1, Math.round(defaultGrams / 4))} onChange={onChange} accessibilityLabel={`${name} portion in grams`} />
    </View>
  );
}

/* ───────────────────────── Small charts ───────────────────────── */

/** Bars for trends (sleep, readiness, mood). Optional dashed guide line (e.g. sleep need). */
export type MiniBarsProps =
  | { look?: undefined; values: number[]; max: number; color?: (v: number) => string; height?: number; guide?: number; label?: string }
  /** V26 capsule bars (board `bars`): width-aware, the picked day solid, the rest at 20%. */
  | { look: 'capsule'; values: number[]; labels?: string[]; now?: number; max?: number; color?: string; height?: number; dim?: number; label?: string };

export function MiniBars(props: MiniBarsProps) {
  if (props.look === 'capsule') return <CapsuleBars values={props.values} labels={props.labels} now={props.now} max={props.max} color={props.color} height={props.height} dim={props.dim} label={props.label} />;
  return <MiniBarsV23 {...props} />;
}

function MiniBarsV23({ values, max, color, height = 64, guide, label }: Extract<MiniBarsProps, { look?: undefined }>) {
  const t = useTokens();
  return (
    <View accessibilityRole="image" accessibilityLabel={label ?? `Chart of ${values.length} values`} style={{ height, flexDirection: 'row', alignItems: 'flex-end', gap: 4 }}>
      {guide !== undefined ? <View style={{ position: 'absolute', left: 0, right: 0, bottom: (guide / max) * height, borderTopWidth: 1.5, borderStyle: 'dashed', borderColor: t.ink2 }} /> : null}
      {values.map((v, i) => (
        <View key={i} style={{ flex: 1, height: Math.max(2, (v / max) * height), borderRadius: 3, backgroundColor: color ? color(v) : t.ink }} />
      ))}
    </View>
  );
}

/** A value marker with optional source-defined bands and target window. */
export type RangeSegment = { label: string; from: number; to: number; tone?: 'neutral' | 'gain' | 'ember' };
export function RangeBar({ value, labels = ['Low', 'Moderate', 'High'], min = 0, max = 100, segments, target, showMarker = true }: { value: number; labels?: readonly string[]; min?: number; max?: number; segments?: readonly RangeSegment[]; target?: { min: number; max: number }; showMarker?: boolean }) {
  const t = useTokens();
  const position = (n: number) => Math.max(0, Math.min(100, (n - min) / (max - min || 1) * 100));
  const bands = segments ?? labels.map((label, i) => ({ label, from: min + i / labels.length * (max - min), to: min + (i + 1) / labels.length * (max - min), tone: labels.length === 3 ? i === 0 ? 'ember' as const : i === 2 ? 'gain' as const : 'neutral' as const : 'neutral' as const }));
  return <View style={{ gap: 6 }} accessibilityRole="progressbar" accessibilityValue={showMarker ? { min, max, now: Math.max(min, Math.min(max, value)) } : undefined}>
    <View style={{ height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: t.surface3 }}>
      {bands.map(band => <View key={band.label} style={{ position: 'absolute', left: `${position(band.from)}%`, width: `${Math.max(0, position(band.to) - position(band.from))}%`, height: '100%', backgroundColor: band.tone === 'ember' ? t.emberTint : band.tone === 'gain' ? t.gainTint : t.surface3 }} />)}
      {target ? <View style={{ position: 'absolute', left: `${position(target.min)}%`, width: `${Math.max(0, position(target.max) - position(target.min))}%`, height: '100%', backgroundColor: t.gainTint }} /> : null}
    </View>
    {showMarker ? <View style={{ position: 'absolute', left: `${position(value)}%`, top: -4, width: 4, height: 16, borderRadius: 2, marginLeft: -2, backgroundColor: t.ink }} /> : null}
    <View style={{ flexDirection: 'row', gap: 4 }}>{bands.map((band, i) => <Text key={band.label} variant="callout" tone="ink2" numberOfLines={1} style={{ flex: 1, textAlign: i === 0 ? 'left' : i === bands.length - 1 ? 'right' : 'center' }}>{band.label}</Text>)}</View>
  </View>;
}

export type SleepStage = 'awake' | 'light' | 'deep' | 'rem';

/** Sleep stages as one bar, plus legend. Segments in minutes. */
export function StageBar({ segments, start, end }: { segments: { stage: SleepStage; minutes: number }[]; start: string; end: string }) {
  const t = useTokens();
  const ac = areaColors[t.scheme];
  const col: Record<SleepStage, string> = { awake: t.ember, light: ac.work, deep: '#4C5FD5', rem: ac.health };
  const totals = segments.reduce<Record<SleepStage, number>>((a, s) => ({ ...a, [s.stage]: a[s.stage] + s.minutes }), { awake: 0, light: 0, deep: 0, rem: 0 });
  const fmt = (m: number) => (m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`);
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Mono tone="ink2">{start}</Mono>
        <Mono tone="ink2">{end}</Mono>
      </View>
      <View style={{ height: 28, borderRadius: 8, overflow: 'hidden', flexDirection: 'row', gap: 2 }}>
        {segments.map((s, i) => (
          <View key={i} style={{ flex: s.minutes, backgroundColor: col[s.stage], opacity: s.stage === 'awake' ? 0.7 : 1 }} />
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {(['deep', 'rem', 'light', 'awake'] as SleepStage[]).map((s) => (
          <View key={s} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: col[s] }} />
            <Callout tone="ink2" style={{ fontSize: 12 }}>{`${s === 'rem' ? 'REM' : s[0].toUpperCase() + s.slice(1)} ${fmt(totals[s])}`}</Callout>
          </View>
        ))}
      </View>
    </View>
  );
}

/** Tappable metric tile used on Body home (Readiness / Sleep / Load / Fuel). */
export type MetricTileProps =
  | { look?: undefined; label: string; value: string; unit?: string; meaning?: string; children?: ReactNode; onPress?: () => void }
  /** V26 tile (board `tile`): label with an area dot, its scale, the figure, one line of meaning. */
  | ({ look: 'v26' } & V26TileProps)
  /** V26 reading (board `metric`): a figure against your normal with a sparkline. */
  | ({ look: 'reading' } & ReadingProps);

export function MetricTile(props: MetricTileProps) {
  if (props.look === 'v26') { const { look: _look, ...rest } = props; return <V26Tile {...rest} />; }
  if (props.look === 'reading') { const { look: _look, ...rest } = props; return <Reading {...rest} />; }
  return <MetricTileV23 {...props} />;
}

function MetricTileV23({ label, value, unit, meaning, children, onPress }: Extract<MetricTileProps, { look?: undefined }>) {
  const t = useTokens();
  return (
    <Press haptic="open" onPress={onPress} accessibilityLabel={`${label} ${value} ${unit ?? ''}`} style={[styles.card, { backgroundColor: t.surface, ...cardShadow(t.scheme), gap: 10, flex: 1 }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Callout tone="ink2">{label}</Callout>
        <Ionicons name="chevron-forward" size={16} color={t.inkQuiet} />
      </View>
      <Text variant="numeralL">
        {value}
        {unit ? <Text variant="unit">{` ${unit}`}</Text> : null}
      </Text>
      {children}
      {meaning ? (
        <Animated.View entering={FadeIn.duration(durations.quick)}>
          <Callout tone="ink2">{meaning}</Callout>
        </Animated.View>
      ) : null}
    </Press>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm, minHeight: componentSize.row },
  icon: { width: componentSize.rowIcon, height: componentSize.rowIcon, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  group: { borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 2 },
  groupHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingBottom: 4 },
  box: { width: 22, height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  tag: { alignSelf: 'flex-start', height: 22, paddingHorizontal: 8, borderRadius: 7, justifyContent: 'center' },
  tool: { flex: 1, minHeight: 112, borderRadius: 16, padding: 14, gap: 20 },
  card: { borderRadius: radius.lg, padding: 16, borderColor: 'transparent' },
  badge: { width: 28, height: 28, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  small: { height: 30, paddingHorizontal: 10, borderRadius: 9, justifyContent: 'center' },
});
