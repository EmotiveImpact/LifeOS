import { Children, cloneElement, isValidElement, type ReactElement, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon, type GlyphName } from '../Icon';
import { Press } from '../Press';
import { Text } from '../Text';
import { useTokens } from '../theme';
import { areaColors, cardShadow, componentSize, radius, space, type Area } from '../tokens';
import { StatusPill, type StatusKind } from './Surfaces';
import { Sparkline } from './V26Data';

/* ───────────────────────── Tile (board `tile`) ───────────────────────── */

export type V26TileProps = {
  label: string;
  /** A 6pt dot in the area's colour before the label. */
  dot?: Area;
  /** The quiet scale on the right of the label ("/100", "/8h"). */
  scale?: string;
  value?: string;
  /** Smaller words after the figure ("ms", "kcal"). */
  unit?: string;
  /** One line of meaning under the figure ("Well recovered"). */
  sub?: string;
  /** Spans both columns of a `TileGrid`. */
  wide?: boolean;
  /** The narrow tile for three in a row (Body's Sleep, Load, Stress): 20pt figure, the chart (children) 10pt below. */
  slim?: boolean;
  /** A 6pt meter under the figure, 0–1. */
  meter?: number;
  /** Three small wells under the meter (Fuel's macros left). */
  parts?: { label: string; value: string }[];
  /** Anything else under the figure (a week chart, a note). */
  children?: ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** The calm white tile: label with an area dot, its scale, the big figure, one line of meaning. Min height 118; `slim` drops it. */
export function V26Tile({ label, dot, scale, value, unit, sub, slim, meter, parts, children, onPress, style }: V26TileProps) {
  const t = useTokens();
  const body = <>
    <View style={styles.th}>
      <View style={styles.thLabel}>
        {dot ? <View style={[styles.dot, { backgroundColor: areaColors[t.scheme][dot] }]} /> : null}
        <Text variant="callout" tone="ink2" numberOfLines={1} style={{ flexShrink: 1 }}>{label}</Text>
      </View>
      {scale ? <Text variant="micro" tone="quiet">{scale}</Text> : null}
    </View>
    {value !== undefined ? <Text variant={slim ? 'headline' : 'numeralL'} numberOfLines={1} style={slim ? styles.slimValue : { marginTop: 14 }}>{value}{unit ? <Text variant="unit" tone="ink2">{unit.startsWith('.') ? unit : ` ${unit}`}</Text> : null}</Text> : null}
    {sub ? <Text variant="callout" tone="ink2" style={slim ? null : { marginTop: 2 }}>{sub}</Text> : null}
    {meter !== undefined ? <View style={[styles.meter, { backgroundColor: t.surface3 }]}><View style={{ width: `${Math.max(0, Math.min(1, meter)) * 100}%`, height: '100%', borderRadius: radius.full, backgroundColor: t.ink }} /></View> : null}
    {parts ? <View style={styles.parts}>{parts.map(p => <View key={p.label} style={[styles.part, { backgroundColor: t.surface2 }]}><Text variant="micro" tone="ink2">{p.label}</Text><Text variant="buttonCompact" style={{ fontVariant: ['tabular-nums'] }}>{p.value}</Text></View>)}</View> : null}
    {slim && children ? <View style={{ marginTop: space.tile }}>{children}</View> : children}
  </>;
  const box: ViewStyle = { backgroundColor: t.surface, ...cardShadow(t.scheme) };
  const shape = slim ? styles.slim : styles.tile;
  const label11y = [label, value, unit, sub].filter(Boolean).join(' ');
  return onPress
    ? <Press haptic="open" onPress={onPress} accessibilityLabel={label11y} style={[shape, box, style]}>{body}</Press>
    : <View accessible accessibilityLabel={label11y} style={[shape, box, style]}>{body}</View>;
}

/** Tiles two to a row, 10pt apart (board `.tiles`), or three to a row 8pt apart for slim tiles. A child with `wide` takes the whole row. */
export function TileGrid({ children, columns = 2, style }: { children: ReactNode; columns?: 2 | 3; style?: StyleProp<ViewStyle> }) {
  const gap = columns === 3 ? space.xs : space.tile;
  const items = Children.toArray(children);
  const rows: ReactNode[][] = [];
  let row: ReactNode[] = [];
  for (const c of items) {
    const wide = isValidElement<{ wide?: boolean }>(c) && !!c.props.wide;
    if (wide) { if (row.length) rows.push(row); rows.push([c]); row = []; continue; }
    row.push(c);
    if (row.length === columns) { rows.push(row); row = []; }
  }
  if (row.length) rows.push(row);
  return (
    <View style={[{ gap }, style]}>
      {rows.map((r, i) => {
        const wide = r.length === 1 && isValidElement<{ wide?: boolean }>(r[0]) && !!r[0].props.wide;
        // Tiles in a row share its height (the taller one sets it), as in the board's grid.
        const fill = (c: ReactNode) => isValidElement<{ style?: StyleProp<ViewStyle> }>(c) ? cloneElement(c as ReactElement<{ style?: StyleProp<ViewStyle> }>, { style: [c.props.style, { flex: 1 }] }) : c;
        const spare = wide ? 0 : columns - r.length;
        return <View key={i} style={{ flexDirection: 'row', gap }}>{r.map((c, j) => <View key={j} style={{ flex: 1, minWidth: 0 }}>{fill(c)}</View>)}{Array.from({ length: spare }, (_, k) => <View key={`spare${k}`} style={{ flex: 1 }} />)}</View>;
      })}
    </View>
  );
}

/* ───────────────────────── Reading (board `metric`) ───────────────────────── */

export type ReadingProps = {
  name: string;
  icon?: GlyphName;
  /** The chip on the right ("Better", "Usual"). */
  tag?: string;
  tagKind?: StatusKind;
  value: string;
  unit?: string;
  /** How it compares with your normal ("6 ms above your normal"). */
  delta?: string;
  /** The week, oldest first, drawn against `normal`. */
  series: number[];
  normal: [number, number];
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** One reading against your normal: name and chip on top, the figure and how it compares, a sparkline on the right. */
export function Reading({ name, icon, tag, tagKind = 'quiet', value, unit, delta, series, normal, onPress, style }: ReadingProps) {
  const t = useTokens();
  const body = <>
    <View style={styles.name}>
      <View style={styles.nameL}>
        {icon ? <Icon name={icon} size={componentSize.iconSm} color={t.ink} /> : null}
        <Text variant="buttonCompact" numberOfLines={1}>{name}</Text>
      </View>
      {tag ? <StatusPill size="chip" kind={tagKind} label={tag} /> : null}
    </View>
    <View style={styles.readingRow}>
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="heading" numberOfLines={1}>{value}{unit ? <Text variant="unit" tone="ink2">{unit.startsWith('.') ? unit : ` ${unit}`}</Text> : null}</Text>
        {delta ? <Text variant="callout" tone="ink2" style={{ marginTop: 4 }}>{delta}</Text> : null}
      </View>
      <Sparkline values={series} normal={normal} />
    </View>
  </>;
  const box: ViewStyle = { backgroundColor: t.surface, ...cardShadow(t.scheme) };
  const a11y = [name, value, unit, delta, tag].filter(Boolean).join(', ');
  return onPress
    ? <Press haptic="open" onPress={onPress} accessibilityLabel={a11y} style={[styles.reading, box, style]}>{body}</Press>
    : <View accessible accessibilityLabel={a11y} style={[styles.reading, box, style]}>{body}</View>;
}

const styles = StyleSheet.create({
  tile: { borderRadius: radius.lg, paddingTop: 14, paddingHorizontal: space.md, paddingBottom: space.md, minHeight: 118 },
  slim: { borderRadius: radius.lg, paddingTop: 14, paddingHorizontal: space.sm, paddingBottom: space.sm },
  slimValue: { marginTop: space.xs, fontVariant: ['tabular-nums'] },
  th: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.xs },
  thLabel: { flexDirection: 'row', alignItems: 'center', gap: 7, flexShrink: 1 },
  dot: { width: componentSize.dot, height: componentSize.dot, borderRadius: radius.full },
  meter: { height: 6, borderRadius: radius.full, marginTop: space.sm, overflow: 'hidden' },
  parts: { flexDirection: 'row', gap: space.xs, marginTop: space.sm },
  part: { flex: 1, borderRadius: radius.md, paddingVertical: space.tile, paddingHorizontal: space.sm },
  reading: { borderRadius: radius.lg, paddingTop: 14, paddingHorizontal: space.md, paddingBottom: space.md, gap: 4 },
  name: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.xs },
  nameL: { flexDirection: 'row', alignItems: 'center', gap: space.xs, flexShrink: 1 },
  readingRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});
