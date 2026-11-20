import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, type SharedValue } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { feedback } from '../feedback';
import { Press } from '../Press';
import { Text } from '../Text';
import { useCalmMotion, useTokens } from '../theme';
import { cardShadow, componentSize, floatLift, motion, photo, radius, sheetShadow, space } from '../tokens';
import { photos, type PhotoName } from '../photos';
import { LifeOrb } from './Orb';
import { TwoTone } from './Story';
import { Button } from './Surfaces';
import { PhotoFill } from './V26PhotoFill';
import { RoundButton } from './V26Chrome';

/* ───────────────────────── The six moods (board `MOODS`, `moodAt`) ───────────────────────── */

export type FeelMoodId = 'calm' | 'driven' | 'restless' | 'anxious' | 'drained' | 'peaceful';

export type FeelMood = {
  id: FeelMoodId;
  name: string;
  photo: PhotoName;
  /** First half of the line under the field ("A clear head today."). */
  head: string;
  line: string;
  /** Where the orb rests for this mood, 0–1 across (tense → easy) and down (energised → drained). */
  at: readonly [number, number];
};

/** Copied from the board's `kit.js` so the app and the board say the same thing for each mood. */
export const FEEL_MOODS: Record<FeelMoodId, FeelMood> = {
  calm: { id: 'calm', name: 'Calm', photo: 'desk', head: 'A clear head today.', line: 'Good day for the form you’ve been putting off.', at: [0.72, 0.52] },
  driven: { id: 'driven', name: 'Driven', photo: 'run', head: 'You’ve got energy.', line: 'Put it into your one bigger move.', at: [0.74, 0.2] },
  restless: { id: 'restless', name: 'Restless', photo: 'walk', head: 'Let’s burn it off.', line: 'Three five-minute wins first.', at: [0.26, 0.2] },
  anxious: { id: 'anxious', name: 'Anxious', photo: 'breathe', head: 'Let’s make it smaller.', line: 'Only what’s due this week is showing.', at: [0.22, 0.52] },
  drained: { id: 'drained', name: 'Drained', photo: 'calm', head: 'Go gently today.', line: 'One small thing, then rest.', at: [0.26, 0.84] },
  peaceful: { id: 'peaceful', name: 'Peaceful', photo: 'journal', head: 'A soft, steady day.', line: 'Health and home come first.', at: [0.74, 0.84] },
};

/** The order a screen reader steps through the moods (swipe up or down on the field). */
export const FEEL_ORDER: FeelMoodId[] = ['restless', 'driven', 'calm', 'peaceful', 'drained', 'anxious'];

/**
 * The mood at a point in the field, x and y 0–1. Ported exactly from the board's `moodAt` so both pick the same mood
 * for the same point: the top band (y < 0.36) splits at x 0.5, the middle (y < 0.68) at 0.42, the bottom at 0.5.
 */
export function moodAt(x: number, y: number): FeelMoodId {
  'worklet';
  return y < 0.36 ? (x < 0.5 ? 'restless' : 'driven') : y < 0.68 ? (x < 0.42 ? 'anxious' : 'calm') : (x < 0.5 ? 'drained' : 'peaceful');
}

/* ───────────────────────── FeelField (board `feel`, `feelMount`) ───────────────────────── */

const COLS = 11;
const REACH = 118;
const INSET_X = 22;
const INSET_Y = 26;

export type FeelFieldProps = {
  /** The mood the orb starts on. */
  initial?: FeelMoodId;
  /** Fires once each time the mood under the orb changes. */
  onChange?: (mood: FeelMoodId) => void;
  /** Field height in points: 280 by default, 232 in Today's drawer, 300 on Pulse. */
  height?: number;
  /** The tall field (430pt, 165 dots). */
  tall?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Move the orb around the card until it feels right. A photograph sits under an 11-column field of the orb's dots;
 * the dots near the orb lean in, and the photograph and the word change with the mood under it. A selection haptic
 * marks each change. Reduce Motion: the dots stay still and the photograph swaps without a fade.
 */
export function FeelField({ initial = 'calm', onChange, height = 280, tall, style }: FeelFieldProps) {
  const t = useTokens(), calm = useCalmMotion();
  const H = tall ? 430 : height;
  const rows = tall ? 15 : 10;
  const [mood, setMood] = useState<FeelMoodId>(initial);
  const [layers, setLayers] = useState<{ k: number; photo: PhotoName }[]>([{ k: 0, photo: FEEL_MOODS[initial].photo }]);
  const px = useSharedValue(FEEL_MOODS[initial].at[0]);
  const py = useSharedValue(FEEL_MOODS[initial].at[1]);
  const w = useSharedValue(0);
  const h = useSharedValue(H);
  const cur = useSharedValue<FeelMoodId>(initial);
  const [size, setSize] = useState({ w: 0, h: H });

  const changed = useCallback((id: FeelMoodId) => {
    setMood(id);
    setLayers(l => [...l.slice(-1), { k: l[l.length - 1].k + 1, photo: FEEL_MOODS[id].photo }]);
    feedback.select();
    onChange?.(id);
  }, [onChange]);

  const place = (x: number, y: number) => {
    'worklet';
    const cx = Math.min(0.95, Math.max(0.05, x)), cy = Math.min(0.94, Math.max(0.06, y));
    px.value = cx;
    py.value = cy;
    const id = moodAt(cx, cy);
    if (id !== cur.value) {
      cur.value = id;
      scheduleOnRN(changed, id);
    }
  };

  const pan = usePanGesture({
    minDistance: 0,
    shouldCancelWhenOutside: false,
    onBegin: e => {
      'worklet';
      if (w.value > 0) place(e.x / w.value, e.y / h.value);
    },
    onUpdate: e => {
      'worklet';
      if (w.value > 0) place(e.x / w.value, e.y / h.value);
    },
  });

  // A screen reader steps from one mood's resting place to the next.
  const step = (dir: 1 | -1) => {
    const i = FEEL_ORDER.indexOf(mood);
    const next = FEEL_ORDER[(i + dir + FEEL_ORDER.length) % FEEL_ORDER.length];
    px.value = FEEL_MOODS[next].at[0];
    py.value = FEEL_MOODS[next].at[1];
    cur.value = next;
    changed(next);
  };

  const handle = useAnimatedStyle(() => ({ transform: [{ translateX: px.value * w.value - 22 }, { translateY: py.value * h.value - 22 }] }));

  return (
    <GestureDetector gesture={pan}>
      <View
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel="How you are arriving. Move around to find it."
        accessibilityValue={{ text: FEEL_MOODS[mood].name }}
        accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
        onAccessibilityAction={e => step(e.nativeEvent.actionName === 'increment' ? 1 : -1)}
        onLayout={e => { const { width, height: lh } = e.nativeEvent.layout; w.value = width; h.value = lh; setSize(s => s.w === width && s.h === lh ? s : { w: width, h: lh }); }}
        style={[styles.feel, { height: H, backgroundColor: t.surface2, ...cardShadow(t.scheme) }, style]}>
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, styles.clip]}>
          {layers.map((l, i) => <FeelLayer key={l.k} name={l.photo} appear={i > 0 || l.k > 0} calm={calm} />)}
          <View style={[StyleSheet.absoluteFill, { backgroundColor: photo.shade }]} />
          <View style={styles.dots}>
            {Array.from({ length: rows }, (_, r) => (
              <View key={r} style={styles.dotRow}>
                {Array.from({ length: COLS }, (_, c) => <View key={c} style={styles.dotCell}><FeelDot col={c} row={r} rows={rows} px={px} py={py} w={w} h={h} still={calm} /></View>)}
              </View>
            ))}
          </View>
          <Text variant="micro" tone="paper2" style={[styles.ax, { top: 9, left: 0, right: 0, textAlign: 'center' }]}>Energised</Text>
          <Text variant="micro" tone="paper2" style={[styles.ax, { bottom: 9, left: 0, right: 0, textAlign: 'center' }]}>Drained</Text>
          <View style={[styles.axSide, { left: 16.5 - 60, top: size.h / 2 - 6.5, transform: [{ rotate: '-90deg' }] }]}><Text variant="micro" tone="paper2">Tense</Text></View>
          <View style={[styles.axSide, { right: 16.5 - 60, top: size.h / 2 - 6.5, transform: [{ rotate: '90deg' }] }]}><Text variant="micro" tone="paper2">Easy</Text></View>
          <Animated.View style={[styles.handle, { backgroundColor: photo.onPhoto, ...floatLift(t.scheme) }, handle]}>
            <LifeOrb size={26} color={photo.ink} />
          </Animated.View>
        </View>
      </View>
    </GestureDetector>
  );
}

/** One photograph layer; a new mood's layer fades in over the last (0.4s), or appears at once under Reduce Motion. */
function FeelLayer({ name, appear, calm }: { name: PhotoName; appear: boolean; calm: boolean }) {
  const o = useSharedValue(appear && !calm ? 0 : 1);
  useEffect(() => {
    if (appear && !calm) o.value = withSpring(1, motion.imageFade);
  }, [appear, calm, o]);
  const anim = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[StyleSheet.absoluteFill, anim]}><PhotoFill source={photos[name]} /></Animated.View>;
}

/** A dot of the field. Near the orb (within 118pt) it grows to 2.75× and brightens; far away it rests small and faint. */
function FeelDot({ col, row, rows, px, py, w, h, still }: { col: number; row: number; rows: number; px: SharedValue<number>; py: SharedValue<number>; w: SharedValue<number>; h: SharedValue<number>; still: boolean }) {
  const anim = useAnimatedStyle(() => {
    if (still || w.value === 0) return { opacity: 0.2, transform: [{ scale: 0.55 }] };
    const dx = INSET_X + (col + 0.5) * (w.value - INSET_X * 2) / COLS;
    const dy = INSET_Y + (row + 0.5) * (h.value - INSET_Y * 2) / rows;
    const near = Math.max(0, 1 - Math.hypot(dx - px.value * w.value, dy - py.value * h.value) / REACH);
    return { opacity: withSpring(0.2 + near * 0.8, motion.snappy), transform: [{ scale: withSpring(0.55 + near * near * 2.2, motion.snappy) }] };
  });
  return <Animated.View style={[styles.dot, { backgroundColor: photo.onPhoto }, anim]} />;
}

/* ───────────────────────── FeelingDrawer (Today's check-in) ───────────────────────── */

export type FeelingDrawerProps = {
  initial?: FeelMoodId;
  /** "Not now": the drawer closes and Today shows the small card. */
  onClose: () => void;
  /** "Set today’s pace" with the mood chosen. */
  onSet: (mood: FeelMoodId) => void;
  onChange?: (mood: FeelMoodId) => void;
  /** 232 over Today, 300 on Pulse. */
  fieldHeight?: number;
  /** Content only, for use inside a `Sheet` that draws its own panel and handle. */
  bare?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * The feeling check as it rises over Today: "How are you arriving?", the field, "I’m arriving calm." with the mood's
 * line, and one button. Never a swipe card, never the whole page.
 */
export function FeelingDrawer({ initial = 'calm', onClose, onSet, onChange, fieldHeight = 232, bare, style }: FeelingDrawerProps) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const [mood, setMood] = useState<FeelMoodId>(initial);
  const m = FEEL_MOODS[mood];
  const body = <>
    {bare ? null : <View style={[styles.grabber, { backgroundColor: t.surface3 }]} />}
    <View style={styles.headRow}>
      <TwoTone size="statement" segments={[{ text: 'How are you ', tone: 'quiet' }, { text: 'arriving?' }]} style={{ flex: 1 }} />
      <RoundButton icon="close" size="sm" label="Not now" onPress={onClose} />
    </View>
    <FeelField initial={initial} height={fieldHeight} onChange={id => { setMood(id); onChange?.(id); }} style={{ marginTop: space.sm }} />
    <TwoTone size="lead" segments={[{ text: 'I’m arriving ', tone: 'quiet' }, { text: m.name.toLowerCase() }, { text: '.', tone: 'quiet' }]} style={{ marginTop: space.md }} />
    <Text variant="callout" tone="ink2" style={{ marginTop: space.xs }}>{`${m.head} ${m.line}`}</Text>
    <Button size="md" label="Set today’s pace" onPress={() => onSet(mood)} style={{ marginTop: space.md }} />
  </>;
  if (bare) return <View style={style}>{body}</View>;
  return <View style={[styles.sheet, { backgroundColor: t.surface, paddingBottom: Math.max(insets.bottom, space.lg) + space.xs, ...sheetShadow }, style]}>{body}</View>;
}

/* ───────────────────────── ArrivingCard (board `.checked`) ───────────────────────── */

/** The feeling check once closed: one small card on Today. Checked, it shows the mood's photograph and "Change". */
export function ArrivingCard({ mood, onPress, style }: { mood?: FeelMoodId | null; onPress: () => void; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  const m = mood ? FEEL_MOODS[mood] : null;
  const title = m ? `Arriving ${m.name.toLowerCase()}` : 'How are you arriving?';
  const sub = m ? `${m.head} Today is set around it.` : 'A quick check-in, whenever you’re ready.';
  const link = m ? 'Change' : 'Check in';
  return (
    <Press haptic="open" onPress={onPress} accessibilityLabel={`${title}. ${sub}`} accessibilityHint={link} style={[styles.checked, { backgroundColor: t.surface, ...cardShadow(t.scheme) }, style]}>
      {m
        ? <View style={[styles.thumb, { backgroundColor: t.surface2 }]}><PhotoFill source={photos[m.photo]} /></View>
        : <View style={[styles.orbWell, { backgroundColor: t.surface2 }]}><LifeOrb size={18} /></View>}
      <View style={{ flex: 1, minWidth: 0 }}>
        <Text variant="buttonCompact" numberOfLines={1}>{title}</Text>
        <Text variant="callout" tone="ink2" numberOfLines={2}>{sub}</Text>
      </View>
      <Text variant="callout" tone="ink2">{link}</Text>
    </Press>
  );
}

const styles = StyleSheet.create({
  feel: { borderRadius: radius.xl },
  clip: { borderRadius: radius.xl, overflow: 'hidden' },
  dots: { position: 'absolute', top: INSET_Y, bottom: INSET_Y, left: INSET_X, right: INSET_X },
  dotRow: { flex: 1, flexDirection: 'row' },
  dotCell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  dot: { width: componentSize.dot, height: componentSize.dot, borderRadius: componentSize.dot / 2 },
  ax: { position: 'absolute' },
  axSide: { position: 'absolute', width: 120, height: 13, alignItems: 'center', justifyContent: 'center' },
  handle: { position: 'absolute', left: 0, top: 0, width: componentSize.feelHandle, height: componentSize.feelHandle, borderRadius: componentSize.feelHandle / 2, alignItems: 'center', justifyContent: 'center' },
  grabber: { width: 36, height: 5, borderRadius: 3, alignSelf: 'center', marginTop: space.xs, marginBottom: 14 },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  sheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: space.lg },
  checked: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: 14, paddingHorizontal: space.md, borderRadius: radius.lg },
  thumb: { width: componentSize.round, height: componentSize.round, borderRadius: radius.md, overflow: 'hidden' },
  orbWell: { width: componentSize.roundSm, height: componentSize.roundSm, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
});
