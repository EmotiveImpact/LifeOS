import { useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { Icon, type GlyphName } from '../Icon';
import type { FeedbackKind } from '../feedback';
import { Press } from '../Press';
import { Text } from '../Text';
import { RichText } from '../RichText';
import { useTokens } from '../theme';
import { cardShadow, componentSize, radius, space, type } from '../tokens';
import { RoundButton } from './V26Chrome';
import { PhotoFill, type Focal } from './V26PhotoFill';

/* ───────────────────────── Accordion (board `acc`) ───────────────────────── */

export type AccordionProps = {
  title: string;
  /** A quiet count after the title ("3"). */
  count?: number | string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/** One section that opens and closes: a 64pt head with a round plus or minus, the body below. Surface, radius 20, shadow. */
export function Accordion({ title, count, open, onToggle, children, style }: AccordionProps) {
  const t = useTokens();
  return (
    <View style={[styles.acc, { backgroundColor: t.surface, ...cardShadow(t.scheme) }, style]}>
      <Press haptic="select" pressScale={0.99} onPress={onToggle} accessibilityRole="button" accessibilityLabel={count !== undefined && count !== '' ? `${title}, ${count}` : title} accessibilityState={{ expanded: open }} style={styles.accHead}>
        <View style={styles.accTitle}>
          <Text variant="title" numberOfLines={1} style={{ flexShrink: 1 }}>{title}</Text>
          {count !== undefined && count !== '' ? <Text variant="greeting" tone="quiet" style={{ fontVariant: ['tabular-nums'] }}>{String(count)}</Text> : null}
        </View>
        <RoundButton icon={open ? 'remove' : 'add'} size="sm" label={open ? 'Close' : 'Open'} />
      </Press>
      {open ? <View style={styles.accBody}>{children}</View> : null}
    </View>
  );
}

export type AccordionItem = { key: string; title: string; count?: number | string; content: ReactNode };

/** Accordions 10pt apart that open one at a time (opening one closes the other). */
export function AccordionGroup({ items, initial = null, style }: { items: AccordionItem[]; /** The key open at first, or none. */ initial?: string | null; style?: StyleProp<ViewStyle> }) {
  const [open, setOpen] = useState<string | null>(initial);
  return (
    <View style={[{ gap: space.tile }, style]}>
      {items.map(i => <Accordion key={i.key} title={i.title} count={i.count} open={open === i.key} onToggle={() => setOpen(o => o === i.key ? null : i.key)}>{i.content}</Accordion>)}
    </View>
  );
}

/* ───────────────────────── KeyValue (board `kv`) ───────────────────────── */

/** A label on the left in ink2 and its value on the right. 7pt above and below; no divider between rows. */
export function KeyValue({ label, value, style }: { label: string; value: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.kv, style]} accessible accessibilityLabel={`${label}, ${value}`}>
      <Text variant="body" tone="ink2" numberOfLines={1} style={{ flexShrink: 1 }}>{label}</Text>
      <Text variant="rowTitle" numberOfLines={1} style={{ fontVariant: ['tabular-nums'] }}>{value}</Text>
    </View>
  );
}

/* ───────────────────────── WheelPicker (board `wheel`) ───────────────────────── */

export type WheelPickerProps = {
  options: string[];
  /** Index of the chosen option. */
  value: number;
  onChange: (index: number) => void;
  /** Read aloud with the chosen option. */
  label: string;
  style?: StyleProp<ViewStyle>;
};

/** A short column of options on surface2; the chosen one lifts onto a white pill. For times, durations and amounts. */
export function WheelPicker({ options, value, onChange, label, style }: WheelPickerProps) {
  const t = useTokens();
  return (
    <View style={[styles.wheel, { backgroundColor: t.surface2 }, style]} accessibilityRole="radiogroup" accessibilityLabel={label}>
      {options.map((o, k) => {
        const on = k === value;
        return (
          <Press key={o} haptic="select" onPress={() => onChange(k)} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={o} style={[styles.wheelOpt, on ? { backgroundColor: t.surface, ...cardShadow(t.scheme) } : null]}>
            <Text variant={on ? 'title' : 'bodyMedium'} tone={on ? 'ink' : 'quiet'} numberOfLines={1}>{o}</Text>
          </Press>
        );
      })}
    </View>
  );
}

/* ───────────────────────── Field (board `field-in`) ───────────────────────── */

export type FieldProps = {
  label: string;
  value?: string;
  placeholder?: string;
  /** Makes it a text input. Without it the field shows its value and opens something on press. */
  onChangeText?: (text: string) => void;
  onPress?: () => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'decimal-pad' | 'phone-pad';
  style?: StyleProp<ViewStyle>;
};

/** A white field with a micro label over its value. No border; the shadow sets it off the page. Placeholder in quiet. */
export function Field({ label, value, placeholder = '', onChangeText, onPress, keyboardType, style }: FieldProps) {
  const t = useTokens();
  const box: ViewStyle = { backgroundColor: t.surface, borderRadius: radius.button, paddingVertical: space.tile, paddingHorizontal: space.md, ...cardShadow(t.scheme) };
  const head = <Text variant="micro" tone="ink2">{label}</Text>;
  if (onChangeText) return (
    <View style={[box, style]}>
      {head}
      <TextInput maxFontSizeMultiplier={1.3} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={t.inkQuiet} keyboardType={keyboardType} accessibilityLabel={label} selectionColor={t.ember}
        style={[type.greeting, { color: t.ink, marginTop: 2, paddingVertical: 1.5, paddingHorizontal: 0 }]} />
    </View>
  );
  const body = <>{head}<Text variant="greeting" tone={value ? 'ink' : 'quiet'} numberOfLines={1} style={styles.fieldValue}>{value || placeholder}</Text></>;
  return onPress
    ? <Press haptic="select" pressScale={0.99} onPress={onPress} accessibilityLabel={`${label}, ${value || placeholder}`} style={[box, style]}>{body}</Press>
    : <View accessible accessibilityLabel={`${label}, ${value || placeholder}`} style={[box, style]}>{body}</View>;
}

/* ───────────────────────── VoiceNote (board `voice` + `wave`) ───────────────────────── */

/** The board's resting wave: 22 bars, heights 4 + |sin(1.7k)·cos(0.6k)|·14. */
export const noteWave = (n = 22) => Array.from({ length: n }, (_, k) => 4 + Math.round(Math.abs(Math.sin(k * 1.7) * Math.cos(k * 0.6)) * 14));

/** A voice note in a white pill: round play, the wave, its length. Sits under a chat bubble or a filed note. */
export function VoiceNote({ duration, onPlay, playing, bars = 22, style }: { duration: string; onPlay?: () => void; playing?: boolean; bars?: number; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  return (
    <View style={[styles.voice, { backgroundColor: t.surface, ...cardShadow(t.scheme) }, style]}>
      <RoundButton icon={playing ? 'pause' : 'play'} size="sm" solid label={playing ? 'Pause voice note' : 'Play voice note'} onPress={onPlay} />
      <View style={styles.wave} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
        {noteWave(bars).map((h, k) => <View key={k} style={{ width: 2, height: h, borderRadius: 1, backgroundColor: t.ink2 }} />)}
      </View>
      <Text variant="callout" tone="ink2" style={{ fontVariant: ['tabular-nums'] }}>{duration}</Text>
    </View>
  );
}

/* ───────────────────────── Small row parts (board `.thumb`, `.datebox`, `.ic`) ───────────────────────── */

/** A row's 40pt icon well: radius 12, surface2, an 18pt icon. */
export function IconWell({ icon, size = componentSize.round }: { icon: GlyphName; size?: number }) {
  const t = useTokens();
  return <View style={{ width: size, height: size, borderRadius: radius.md, backgroundColor: t.surface2, alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={componentSize.iconSm} color={t.ink} /></View>;
}

/** A 48pt date box: the day over a micro month. */
export function DateBox({ day, month }: { day: string | number; month: string }) {
  const t = useTokens();
  return (
    <View style={[styles.datebox, { backgroundColor: t.surface2 }]}>
      <Text variant="title" style={{ lineHeight: 18, fontVariant: ['tabular-nums'] }}>{String(day).padStart(2, '0')}</Text>
      <Text variant="micro" tone="ink2">{month.toUpperCase()}</Text>
    </View>
  );
}

/** A 48pt photograph thumb, radius 12 (board `.thumb`). */
export function Thumb({ source, focal, size = componentSize.thumb }: { source: ImageSourcePropType; focal?: Focal; size?: number }) {
  const t = useTokens();
  return <View style={{ width: size, height: size, borderRadius: radius.md, overflow: 'hidden', backgroundColor: t.surface2 }}><PhotoFill source={source} focal={focal} /></View>;
}

/* ───────────────────────── Row (board `row`, `thumbRow`, `dateRow`) ───────────────────────── */

export type V26RowProps = {
  title: string;
  sub?: string;
  /** Leading: an icon well, a photograph thumb or a date box (one of them). */
  icon?: GlyphName;
  thumb?: ImageSourcePropType;
  thumbFocal?: Focal;
  date?: { day: string | number; month: string };
  /** Any other leading piece (a numbered well, a tick, a drag grip). */
  lead?: ReactNode;
  /** Quiet words on the right ("Sat", "15 days"), or a figure with `endStrong`. */
  end?: string;
  endStrong?: boolean;
  /** Anything on the right instead (a toggle, a chip). */
  right?: ReactNode;
  /** The quiet chevron. Shown by default on a pressable row with nothing else on the right. */
  chevron?: boolean;
  onPress?: () => void;
  haptic?: FeedbackKind | null;
  style?: StyleProp<ViewStyle>;
};

/** A list row: 64pt, a 40pt icon well (or a 48pt thumb or date box), title and line, something quiet on the right. No dividers. */
export function V26Row({ title, sub, icon, thumb, thumbFocal, date, lead, end, endStrong, right, chevron, onPress, haptic = 'open', style }: V26RowProps) {
  const t = useTokens();
  const showChev = chevron ?? (!!onPress && !end && !right);
  const body = <>
    {lead ?? (thumb ? <Thumb source={thumb} focal={thumbFocal} /> : date ? <DateBox day={date.day} month={date.month} /> : icon ? <IconWell icon={icon} /> : null)}
    <View style={{ flex: 1, minWidth: 0 }}>
      <Text variant="rowTitle" numberOfLines={2}>{title}</Text>
      {sub ? <Text variant="callout" tone="ink2" numberOfLines={2}>{sub}</Text> : null}
    </View>
    {right ?? (end ? <Text variant={endStrong ? 'rowTitle' : 'callout'} tone={endStrong ? 'ink' : 'ink2'} style={{ fontVariant: ['tabular-nums'] }}>{end}</Text> : null)}
    {showChev ? <Icon name="chev" size={componentSize.iconXs} color={t.inkQuiet} /> : null}
  </>;
  const a11y = [title, sub, end].filter(Boolean).join(', ');
  return onPress
    ? <Press haptic={haptic} onPress={onPress} accessibilityLabel={a11y} style={[styles.row, style]}>{body}</Press>
    : <View accessible accessibilityLabel={a11y} style={[styles.row, style]}>{body}</View>;
}

/* ───────────────────────── CheckRows (board `check`) ───────────────────────── */

export type V26CheckItem = { label: string; done: boolean; sub?: string };

/** Round ticks (26pt) beside 16pt lines. A done line turns ink2; never struck through. */
export function CheckRows({ items, onToggle, style }: { items: V26CheckItem[]; onToggle?: (i: number) => void; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  return (
    <View style={style}>
      {items.map((it, i) => (
        <Press key={`${i}-${it.label}`} haptic={it.done ? 'select' : 'complete'} pressScale={0.98} onPress={() => onToggle?.(i)} accessibilityRole="checkbox" accessibilityState={{ checked: it.done }} accessibilityLabel={it.label} style={styles.check}>
          <View style={[styles.tick, { backgroundColor: it.done ? t.ink : t.surface3 }]}>{it.done ? <Icon name="check" size={14} color={t.canvas} /> : null}</View>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="bodyL" tone={it.done ? 'ink2' : 'ink'}>{it.label}</Text>
            {it.sub ? <Text variant="callout" tone="ink2">{it.sub}</Text> : null}
          </View>
        </Press>
      ))}
    </View>
  );
}

/* ───────────────────────── PickRow (board `pick`) ───────────────────────── */

/** A 64pt white row that opens a choice: the label on the left, the value (quiet until set) and a more icon on the right. */
export function PickRow({ label, value, set, onPress, style }: { label: string; value: string; set?: boolean; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  return (
    <Press haptic="select" pressScale={0.99} onPress={onPress} accessibilityLabel={`${label}, ${value}`} style={[styles.pick, { backgroundColor: t.surface, ...cardShadow(t.scheme) }, style]}>
      <Text variant="title" numberOfLines={1} style={{ flexShrink: 1 }}>{label}</Text>
      <View style={styles.pickVal}>
        <Text variant="greeting" tone={set ? 'ink' : 'quiet'} numberOfLines={1}>{value}</Text>
        <Icon name="more" size={componentSize.iconXs} color={set ? t.ink : t.inkQuiet} />
      </View>
    </Press>
  );
}

/* ───────────────────────── Ruler (board `ruler`) ───────────────────────── */

/** Progress as a ruler of 36 short bars, 3pt apart, 16pt tall; the reached ones in ink. */
export function Ruler({ pct, bars = 36, style }: { pct: number; bars?: number; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  const on = Math.round(Math.max(0, Math.min(100, pct)) / 100 * bars);
  return (
    <View accessible accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(pct) }} style={[styles.ruler, style]}>
      {Array.from({ length: bars }, (_, k) => <View key={k} style={{ flex: 1, borderRadius: 1, backgroundColor: k < on ? t.ink : t.surface3 }} />)}
    </View>
  );
}

/* ───────────────────────── SpineTimeline (board `.tl`) ───────────────────────── */

/** `text` may brace the words that matter: `{This is the gap.} Three steps fit inside it.` */
export type SpineItem = { when: string; text: string; state: 'done' | 'now' | 'later'; children?: ReactNode };

/** A spine of small dots (never a line): done in ink, now in ember, later in surface3; later words in ink2. 22pt apart. */
export function SpineTimeline({ items, style }: { items: SpineItem[]; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  return (
    <View style={[{ gap: 22 }, style]}>
      {items.map((it, i) => (
        <View key={`${i}-${it.when}`} style={{ paddingLeft: 26 }} accessible accessibilityLabel={`${it.when}. ${it.text.replace(/[{}]/g, '')}${it.state === 'now' ? '. Now' : it.state === 'done' ? '. Done' : ''}`}>
          {i < items.length - 1 ? (
            <View pointerEvents="none" style={styles.spine}>
              {Array.from({ length: 40 }, (_, k) => <View key={k} style={{ width: 3.2, height: 3.2, borderRadius: 1.6, backgroundColor: t.surface3 }} />)}
            </View>
          ) : null}
          <View style={[styles.spineDot, { backgroundColor: it.state === 'done' ? t.ink : it.state === 'now' ? t.ember : t.surface3 }]} />
          {it.when ? <Text variant="micro" tone="ink2" style={{ paddingVertical: 6 }}>{it.when}</Text> : null}
          {it.text ? <RichText text={it.text} tone={it.state === 'later' ? 'ink2' : 'ink'} strong style={{ marginTop: it.when ? 2 : 1 }} /> : null}
          {it.children}
        </View>
      ))}
    </View>
  );
}

/* ───────────────────────── Avatar and bubble (board `avatar`, `bubble`) ───────────────────────── */

/** Initials in a 40pt circle on surface2 (14pt semibold); `lg` is 72pt with 24pt initials. */
export function InitialsAvatar({ initials, lg, style }: { initials: string; lg?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  const d = lg ? 72 : componentSize.round;
  return (
    <View accessible accessibilityLabel={initials} style={[{ width: d, height: d, borderRadius: radius.full, backgroundColor: t.surface2, alignItems: 'center', justifyContent: 'center' }, style]}>
      <Text variant={lg ? 'heading' : 'buttonCompact'}>{initials}</Text>
    </View>
  );
}

/** What you said: a white bubble on the right with a soft shadow, the bottom-right corner tucked to 6pt. Max 84% wide. */
export function ChatBubble({ text, style }: { text: string; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  return (
    <View style={[styles.bubble, { backgroundColor: t.surface, ...cardShadow(t.scheme) }, style]}>
      <Text variant="body">{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  acc: { borderRadius: radius.lg, paddingHorizontal: space.md },
  accHead: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  accTitle: { flexDirection: 'row', alignItems: 'baseline', gap: 6, flexShrink: 1 },
  accBody: { paddingBottom: space.sm },
  kv: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm, paddingVertical: 7 },
  wheel: { borderRadius: radius.lg, paddingVertical: 14, alignItems: 'center', gap: 4 },
  wheelOpt: { height: 34, paddingHorizontal: 22, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  fieldValue: { marginTop: 2, lineHeight: 24 },
  voice: { flexDirection: 'row', alignItems: 'center', gap: space.tile, alignSelf: 'flex-start', paddingVertical: space.xs, paddingLeft: space.xs, paddingRight: 14, borderRadius: radius.full },
  wave: { flexDirection: 'row', alignItems: 'center', gap: 2, height: 20 },
  datebox: { width: componentSize.thumb, height: componentSize.thumb, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 64, paddingVertical: space.xs },
  check: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, paddingVertical: 9 },
  tick: { width: 26, height: 26, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  pick: { height: 64, borderRadius: radius.lg, paddingHorizontal: 18, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  pickVal: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 1 },
  ruler: { flexDirection: 'row', gap: 3, height: 16, marginTop: space.sm },
  spine: { position: 'absolute', left: 4, top: 22, bottom: -22, width: 4, alignItems: 'center', gap: 5.8, overflow: 'hidden' },
  spineDot: { position: 'absolute', left: 0, top: 6, width: 12, height: 12, borderRadius: 6 },
  bubble: { alignSelf: 'flex-end', maxWidth: '84%', paddingVertical: space.sm, paddingHorizontal: space.md, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, borderBottomLeftRadius: radius.lg, borderBottomRightRadius: radius.tail },
});
