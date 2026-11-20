import { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View, useWindowDimensions, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type GlyphName } from '../Icon';
import { feedback, type FeedbackKind } from '../feedback';
import { Press } from '../Press';
import { Text } from '../Text';
import { useCalmMotion, useTokens } from '../theme';
import { componentSize, floatLift, motion, photo, photoScrims, radius, space } from '../tokens';
import { StatusPill } from './Surfaces';
import { PhotoFill, type Focal } from './V26PhotoFill';

/* ───────────────────────── DecideRow (board `.decide`) ───────────────────────── */

export type DecideSide = {
  /** Read aloud; also the words when `text` is set. */
  label: string;
  onPress?: () => void;
  icon?: GlyphName;
  /** Words instead of an icon ("Undo", "Gift ideas"): the side widens to fit them. */
  text?: boolean;
  haptic?: FeedbackKind | null;
};

export type DecideRowProps = {
  left?: DecideSide;
  right?: DecideSide;
  /** The ember knob in the middle. Without `onPress` it only shows the slide (Today's moves). */
  knob?: { icon: GlyphName; label: string; onPress?: () => void; haptic?: FeedbackKind | null };
  /** `plain` on the page (surface2 sides), `inverse` inside the dark drawer. */
  tone?: 'plain' | 'inverse';
  /** Dots between each side and the knob. The board uses two, or one beside worded sides. */
  seps?: 1 | 2;
  style?: StyleProp<ViewStyle>;
};

/** Leave it on the left, the ember knob in the middle, take it or ask on the right, joined by small dots. */
export function DecideRow({ left, right, knob, tone = 'plain', seps = 2, style }: DecideRowProps) {
  const t = useTokens();
  const inverse = tone === 'inverse';
  const sideBg = inverse ? t.inverseFill : t.surface2;
  const sideFg = inverse ? t.canvas : t.ink;
  const sepBg = inverse ? t.inverse2 : t.surface3;
  const dots = (k: string) => Array.from({ length: seps }, (_, i) => <View key={`${k}${i}`} style={[styles.sep, { backgroundColor: sepBg }]} />);
  const side = (s: DecideSide, k: string) => {
    const box: ViewStyle = { height: 40, borderRadius: radius.full, backgroundColor: sideBg, alignItems: 'center', justifyContent: 'center', ...(s.text ? { paddingHorizontal: 18 } : { width: componentSize.decideSide }) };
    const inner = s.text ? <Text variant="buttonCompact" style={{ color: sideFg }}>{s.label}</Text> : <Icon name={s.icon ?? 'close'} size={componentSize.iconSm} color={sideFg} />;
    return s.onPress
      ? <Press key={k} haptic={s.haptic === undefined ? 'select' : s.haptic} onPress={s.onPress} accessibilityLabel={s.label} hitSlop={4} style={box}>{inner}</Press>
      : <View key={k} accessible accessibilityLabel={s.label} style={box}>{inner}</View>;
  };
  const knobBox: ViewStyle = { width: componentSize.decideKnob, height: 48, borderRadius: radius.full, backgroundColor: t.ember, alignItems: 'center', justifyContent: 'center' };
  const knobEl = knob ? (knob.onPress
    ? <Press key="knob" haptic={knob.haptic === undefined ? 'primary' : knob.haptic} onPress={knob.onPress} accessibilityLabel={knob.label} style={knobBox}><Icon name={knob.icon} size={componentSize.icon} color={photo.ink} /></Press>
    : <View key="knob" accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={knobBox}><Icon name={knob.icon} size={componentSize.icon} color={photo.ink} /></View>) : null;
  return (
    <View style={[styles.decide, style]}>
      {left ? side(left, 'l') : null}
      {left && knobEl ? dots('a') : null}
      {knobEl}
      {right && knobEl ? dots('b') : null}
      {left && right && !knobEl ? dots('a') : null}
      {right ? side(right, 'r') : null}
    </View>
  );
}

/* ───────────────────────── MoveDeck (board `.deck` + `.decide.plain`) ───────────────────────── */

export type MoveCard = {
  key: string;
  title: string;
  /** The paper chip at the top left ("One form · about 6 min"). */
  chip: string;
  /** The line under the title ("est. £840 back · for your first home"). */
  sub: string;
  photo: ImageSourcePropType;
  focal?: Focal;
};

export type MoveDecision = 'take' | 'leave';

export type MoveDeckProps = {
  /** The moves still to decide, front first. Drop the front one from the list in `onDecide`. */
  cards: MoveCard[];
  onDecide: (decision: MoveDecision, card: MoveCard) => void;
  /** Deck height including the cards resting behind (board 262 on Today). */
  height?: number;
  /** How many cards rest behind the front one: 1 on Today, 2 on the People deck. */
  behind?: 1 | 2;
  takeLabel?: string;
  leaveLabel?: string;
  /** The line under the decide row. Pass null to leave it out. */
  hint?: string | null;
  style?: StyleProp<ViewStyle>;
};

const BACK = [{ inset: 14, top: 9, opacity: 0.6 }, { inset: 28, top: 0, opacity: 0.32 }] as const;

/**
 * Today's moves: one photograph card in front, the next resting behind. The tick takes it on, the cross leaves it,
 * and a swipe right or left does the same. Reduce Motion: no fly-off, the next card simply appears.
 */
export function MoveDeck({ cards, onDecide, height = 262, behind = 1, takeLabel = 'Take it on today', leaveLabel = 'Not today', hint = 'Right to take it on today. Left to leave it for another day.', style }: MoveDeckProps) {
  const t = useTokens(), calm = useCalmMotion();
  const { width } = useWindowDimensions();
  const front = cards[0];
  const x = useSharedValue(0);
  const enter = useSharedValue(1);
  const busy = useRef(false);

  // A new front card rises from where the back card rested.
  useEffect(() => {
    busy.current = false;
    x.value = 0;
    if (calm) { enter.value = 1; return; }
    enter.value = 0;
    enter.value = withSpring(1, motion.snappy);
  }, [front?.key, calm, x, enter]);

  const finish = useCallback((d: MoveDecision) => {
    if (front) onDecide(d, front);
  }, [front, onDecide]);

  const decide = useCallback((d: MoveDecision) => {
    if (!front || busy.current) return;
    busy.current = true;
    feedback[d === 'take' ? 'primary' : 'select']();
    if (calm) { finish(d); return; }
    x.value = withSpring((d === 'take' ? 1 : -1) * width * 1.3, motion.snappy, done => {
      'worklet';
      if (done) scheduleOnRN(finish, d);
    });
  }, [front, calm, width, x, finish]);

  const pan = usePanGesture({
    activeOffsetX: [-12, 12],
    failOffsetY: [-16, 16],
    onUpdate: e => {
      'worklet';
      x.value = e.translationX;
    },
    onDeactivate: e => {
      'worklet';
      const go = Math.abs(e.translationX) > 96 || Math.abs(e.velocityX) > 800;
      if (go) scheduleOnRN(decide, e.translationX + e.velocityX * 0.1 > 0 ? 'take' : 'leave');
      else x.value = withSpring(0, motion.snappy);
    },
  });

  const frontAnim = useAnimatedStyle(() => ({
    transform: [
      { translateX: x.value },
      { translateY: (1 - enter.value) * -11 },
      { scale: 0.92 + enter.value * 0.08 },
      { rotate: `${Math.max(-8, Math.min(8, x.value / 30))}deg` },
    ],
  }));

  if (!front) return null;
  const rest = cards.slice(1, 1 + behind);
  return (
    <View style={style}>
      <View style={{ height }}>
        {rest.map((c, i) => {
          const b = BACK[i];
          return (
            <View key={c.key} pointerEvents="none" style={[styles.back, { left: b.inset, right: b.inset, top: b.top, opacity: b.opacity, backgroundColor: t.surface3, zIndex: 2 - i }]}>
              <PhotoFill source={c.photo} focal={c.focal ?? { y: 0.3 }} />
            </View>
          );
        }).reverse()}
        <GestureDetector gesture={pan}>
          <Animated.View
            accessible
            accessibilityLabel={`${front.title}. ${front.chip}. ${front.sub}`}
            accessibilityHint={hint ?? undefined}
            accessibilityActions={[{ name: 'take', label: takeLabel }, { name: 'leave', label: leaveLabel }]}
            onAccessibilityAction={e => decide(e.nativeEvent.actionName === 'take' ? 'take' : 'leave')}
            style={[styles.frontWrap, { borderRadius: radius.xl, ...floatLift(t.scheme) }, frontAnim]}>
            <View style={[styles.front, { backgroundColor: t.surface2 }]}>
              <PhotoFill source={front.photo} focal={front.focal} />
              <LinearGradient pointerEvents="none" colors={photoScrims.deck.colors} locations={photoScrims.deck.locations} style={StyleSheet.absoluteFill} />
              <StatusPill size="chip" onPhoto label={front.chip} style={{ alignSelf: 'flex-start' }} />
              <View>
                <Text variant="titleSerif" tone="paper" numberOfLines={2}>{front.title}</Text>
                <Text variant="body" tone="paper2" numberOfLines={2} style={{ marginTop: 6 }}>{front.sub}</Text>
              </View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
      <DecideRow
        style={{ marginTop: space.md }}
        left={{ icon: 'close', label: leaveLabel, onPress: () => decide('leave'), haptic: null }}
        knob={{ icon: 'swap', label: 'Slide to decide' }}
        right={{ icon: 'check', label: takeLabel, onPress: () => decide('take'), haptic: null }}
      />
      {hint ? <Text variant="callout" tone="ink2" align="center" style={{ marginTop: space.sm }}>{hint}</Text> : null}
    </View>
  );
}

/* ───────────────────────── DecisionDrawer (board `.drawer`) ───────────────────────── */

export type DrawerAction = { label: string; onPress: () => void; icon?: GlyphName; haptic?: FeedbackKind | null };

export type DecisionDrawerProps = {
  /** One question ("File these 4 details?"), or the outcome once decided ("Filed."). */
  title: string;
  sub?: string;
  /** Left: leave it. Middle (the ember knob): do it. Right: ask life first. */
  leave?: DrawerAction;
  confirm?: DrawerAction;
  ask?: DrawerAction;
  /** The decided state: one worded Undo in place of the three. */
  undo?: { label?: string; onPress: () => void };
  /** Pad for the home indicator (the drawer sits at the bottom of the screen). Default true. */
  safeBottom?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** The dark drawer that asks one thing: ink fill, canvas words, 28pt top corners, the decide row. */
export function DecisionDrawer({ title, sub, leave, confirm, ask, undo, safeBottom = true, style }: DecisionDrawerProps) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.drawer, { backgroundColor: t.ink, paddingBottom: safeBottom ? Math.max(insets.bottom, space.lg) + space.xs : 30 }, style]}>
      <Text variant="heading" tone="inverse" align="center" accessibilityRole="header" style={{ fontVariant: [] }}>{title}</Text>
      {sub ? <Text variant="callout" tone="inverse2" align="center" style={{ marginTop: 2 }}>{sub}</Text> : null}
      {undo
        ? <DecideRow tone="inverse" style={{ marginTop: 18 }} left={{ label: undo.label ?? 'Undo', text: true, onPress: undo.onPress }} />
        : <DecideRow tone="inverse" style={{ marginTop: 18 }}
            left={leave ? { icon: leave.icon ?? 'close', label: leave.label, onPress: leave.onPress, haptic: leave.haptic } : undefined}
            knob={confirm ? { icon: confirm.icon ?? 'check', label: confirm.label, onPress: confirm.onPress, haptic: confirm.haptic } : undefined}
            right={ask ? { icon: ask.icon ?? 'help', label: ask.label, onPress: ask.onPress, haptic: ask.haptic } : undefined} />}
    </View>
  );
}

const styles = StyleSheet.create({
  decide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 14 },
  sep: { width: 4, height: 4, borderRadius: 2 },
  back: { position: 'absolute', height: 80, borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: 'hidden' },
  frontWrap: { position: 'absolute', left: 0, right: 0, top: 20, bottom: 0, zIndex: 3 },
  front: { flex: 1, borderRadius: radius.xl, overflow: 'hidden', padding: space.md, justifyContent: 'space-between' },
  drawer: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingTop: 22, paddingHorizontal: space.lg },
});
