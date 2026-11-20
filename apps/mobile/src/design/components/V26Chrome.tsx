import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Icon, type GlyphName } from '../Icon';
import type { FeedbackKind } from '../feedback';
import { Press } from '../Press';
import { Text } from '../Text';
import { useCalmMotion, useTokens } from '../theme';
import { componentSize, motion, photo, radius, space } from '../tokens';
import { LifeOrb } from './Orb';

/* ───────────────────────── RoundButton (board `round`) ───────────────────────── */

export type RoundButtonProps = {
  icon: GlyphName;
  /** Read aloud by screen readers. Every round button needs one. */
  label: string;
  onPress?: () => void;
  /** `sm` 32, `md` 40 (default), `lg` 56 (the Welcome arrow), `xl` 72 (Talk's stop). */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Ink fill with a canvas icon (the board's `solid`). */
  solid?: boolean;
  /** Paper fill with a dark icon, for a button that sits on a photograph. */
  onPhoto?: boolean;
  /** A small ember dot: something new from Life. The one signal; use it once per bar. */
  dot?: boolean;
  haptic?: FeedbackKind | null;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
};

const ROUND = { sm: componentSize.roundSm, md: componentSize.round, lg: componentSize.roundLg, xl: componentSize.roundXl } as const;
const ROUND_ICON = { sm: componentSize.iconXs, md: componentSize.iconSm, lg: componentSize.icon, xl: componentSize.icon + 6 } as const;

/** A round icon button: 40pt circle on `surface2`, an optional ember dot, `sm` 32pt. No border, ever. */
export function RoundButton({ icon, label, onPress, size = 'md', solid, onPhoto, dot, haptic = 'select', disabled, style }: RoundButtonProps) {
  const t = useTokens();
  const d = ROUND[size];
  const bg = onPhoto ? photo.onPhoto : solid ? t.ink : t.surface2;
  const fg = onPhoto ? photo.ink : solid ? t.canvas : t.ink;
  const body = <>
    <Icon name={icon} size={ROUND_ICON[size]} color={fg} />
    {dot ? <View style={[styles.dot, { backgroundColor: t.ember, top: d * 0.22, right: d * 0.25 }]} /> : null}
  </>;
  const box: ViewStyle = { width: d, height: d, borderRadius: radius.full, backgroundColor: bg, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.35 : 1 };
  if (!onPress) return <View accessible accessibilityLabel={label} style={[box, style]}>{body}</View>;
  return <Press haptic={haptic} onPress={onPress} disabled={disabled} accessibilityLabel={label} accessibilityState={{ disabled }} hitSlop={size === 'sm' ? 6 : 2} style={[box, style]}>{body}</Press>;
}

/* ───────────────────────── SectionHead (board `secHead`) ───────────────────────── */

/** A section heading inside a scroll: 16/21 title, an optional quiet link on the right. 32pt above, 12pt below. */
export function SectionHead({ title, link, onLink, first, style }: { title: string; link?: string; onLink?: () => void; /** No space above (the first thing on a screen). */ first?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  return (
    <View style={[styles.secHead, first ? { marginTop: 0 } : null, style]}>
      <Text variant="title" accessibilityRole="header" numberOfLines={2} style={{ flexShrink: 1 }}>{title}</Text>
      {link ? onLink
        ? <Press haptic="select" onPress={onLink} accessibilityLabel={link} hitSlop={10} style={styles.link}><Text variant="callout" tone="ink2" numberOfLines={1}>{link}</Text><Icon name="chev" size={componentSize.iconXs} color={t.ink2} /></Press>
        : <Text variant="callout" tone="ink2" numberOfLines={1}>{link}</Text> : null}
    </View>
  );
}

/* ───────────────────────── Footer (board `foot`) ───────────────────────── */

/** The fixed bottom area: one primary button (plus a quiet link), pinned above the home indicator. Outside the scroll view. */
export function Footer({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  return <View style={[styles.foot, { backgroundColor: t.canvas, paddingBottom: Math.max(insets.bottom, space.lg) + space.xxs }, style]}>{children}</View>;
}

/* ───────────────────────── LifeSays (board `says`) ───────────────────────── */

/**
 * life speaking, never in a bubble. Without an eyebrow: the small orb beside one ink line.
 * With one ("life noticed", "life · just now"): the orb and eyebrow above, the line below.
 */
export function LifeSays({ children, eyebrow, orb = 'ring', style }: { children: ReactNode; eyebrow?: string; orb?: 'ring' | 'thinking' | 'done'; style?: StyleProp<ViewStyle> }) {
  if (eyebrow) return (
    <View style={[{ gap: space.xs }, style]}>
      <View style={styles.inline}><LifeOrb size={18} state={orb} /><Text variant="callout" tone="ink2">{eyebrow}</Text></View>
      <Text variant="body" tone="ink">{children}</Text>
    </View>
  );
  return (
    <View style={[{ flexDirection: 'row', gap: space.tile, alignItems: 'flex-start' }, style]}>
      <View style={{ paddingTop: 1 }}><LifeOrb size={20} state={orb} /></View>
      <Text variant="body" tone="ink" style={{ flex: 1 }}>{children}</Text>
    </View>
  );
}

/* ───────────────────────── DashPager (board `.dash`) ───────────────────────── */

/** Where you are in a short run of full-screen pages: dashes, the current one long. Paper on a photograph by default. */
export function DashPager({ count, index, onPhoto = true }: { count: number; index: number; onPhoto?: boolean }) {
  return (
    <View style={styles.dash} accessible accessibilityRole="progressbar" accessibilityLabel={`Page ${index + 1} of ${count}`}>
      {Array.from({ length: count }, (_, i) => <Dash key={i} on={i === index} onPhoto={onPhoto} />)}
    </View>
  );
}

function Dash({ on, onPhoto }: { on: boolean; onPhoto: boolean }) {
  const t = useTokens(), calm = useCalmMotion();
  const w = useSharedValue(on ? 18 : 6);
  useEffect(() => { w.value = calm ? (on ? 18 : 6) : withSpring(on ? 18 : 6, motion.snappy); }, [on, calm, w]);
  const anim = useAnimatedStyle(() => ({ width: w.value }));
  const color = on ? (onPhoto ? photo.onPhoto : t.ink) : (onPhoto ? photo.fill : t.surface3);
  return <Animated.View style={[{ height: 4, borderRadius: 2, backgroundColor: color }, anim]} />;
}

/* ───────────────────────── Badge (board `.badge`) ───────────────────────── */

/** A 36pt round well holding an icon, used on tinted chart cards. */
export function Badge({ icon }: { icon: GlyphName }) {
  const t = useTokens();
  return <View style={[styles.badge, { backgroundColor: t.surface }]}><Icon name={icon} size={componentSize.iconSm} color={t.ink} /></View>;
}

const styles = StyleSheet.create({
  dot: { position: 'absolute', width: 7, height: 7, borderRadius: radius.full },
  secHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: space.sm, marginTop: space.xxl, marginBottom: space.sm },
  link: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  foot: { flexShrink: 0, paddingTop: space.sm, paddingHorizontal: space.gutter, gap: space.tile },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dash: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  badge: { width: 36, height: 36, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
});
