import { Children, type ReactNode } from 'react';
import { StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Press } from '../Press';
import { Text } from '../Text';
import { useTokens } from '../theme';
import { areaColors, cardShadow, componentSize, photo, photoScrims, radius, space, tint, type Area } from '../tokens';
import { LifeOrb } from './Orb';
import { StatusPill } from './Surfaces';
import { TwoTone, type TwoToneSegment } from './Story';
import { DashPager, RoundButton } from './V26Chrome';

export { PhotoFill, type Focal } from './V26PhotoFill';
import { PhotoFill, type Focal } from './V26PhotoFill';

/* ───────────────────────── PhotoCard (board `.pcard`) ───────────────────────── */

export type PhotoCardProps = {
  source: ImageSourcePropType;
  title: string;
  /** Quieter text after the title, on the same line ("of 2,300 kcal"). */
  titleSuffix?: string;
  sub?: string;
  /** Paper chips along the top: the first ones on the left, `chipRight` on the right. */
  chips?: string[];
  chipRight?: string;
  /** Card height in points. The board uses 230 for a hero, 150–190 in a grid of two. */
  height?: number;
  /** `lg` 24pt title (a hero), `md` 20pt (a grid of two), `sm` 16pt (small grid tiles). */
  size?: 'lg' | 'md' | 'sm';
  focal?: Focal;
  onPress?: () => void;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

/** A photograph card: chips on a top line, copy low on the card fade. Radius 24, `cardShadow`, no border, no panel. */
export function PhotoCard({ source, title, titleSuffix, sub, chips, chipRight, height = 230, size = 'lg', focal, onPress, accessibilityLabel, style }: PhotoCardProps) {
  const t = useTokens();
  const body = <>
    <PhotoFill source={source} focal={focal} />
    <LinearGradient pointerEvents="none" colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} />
    <View style={styles.topline}>
      <View style={styles.chips}>{chips?.map(c => <StatusPill key={c} size="chip" onPhoto label={c} />)}</View>
      {chipRight ? <StatusPill size="chip" onPhoto label={chipRight} /> : null}
    </View>
    <View style={{ gap: size === 'lg' ? 0 : 2 }}>
      <Text variant={size === 'lg' ? 'heading' : size === 'md' ? 'headline' : 'title'} tone="paper" numberOfLines={2}>
        {title}{titleSuffix ? <Text variant="body" tone="paper">{` ${titleSuffix}`}</Text> : null}
      </Text>
      {sub ? <Text variant="callout" tone="paper2" numberOfLines={2}>{sub}</Text> : null}
    </View>
  </>;
  const box: ViewStyle = { height, borderRadius: radius.photo, overflow: 'hidden', backgroundColor: t.surface2, paddingTop: 14, paddingHorizontal: space.md, paddingBottom: space.md, justifyContent: 'space-between' };
  // The shadow sits on an outer view: overflow hidden would clip it on iOS.
  return (
    <View style={[{ borderRadius: radius.photo, ...cardShadow(t.scheme) }, style]}>
      {onPress
        ? <Press haptic="open" onPress={onPress} accessibilityLabel={accessibilityLabel ?? [title, titleSuffix, sub].filter(Boolean).join(', ')} style={box}>{body}</Press>
        : <View accessible accessibilityLabel={accessibilityLabel ?? [title, titleSuffix, sub].filter(Boolean).join(', ')} style={box}>{body}</View>}
    </View>
  );
}

/** Two photo cards to a row, 10pt apart (board `.pgrid`). */
export function PhotoGrid({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const items = Children.toArray(children);
  const rows: ReactNode[][] = [];
  for (let i = 0; i < items.length; i += 2) rows.push(items.slice(i, i + 2));
  return (
    <View style={[{ gap: space.tile }, style]}>
      {rows.map((row, i) => <View key={i} style={{ flexDirection: 'row', gap: space.tile }}>{row.map((c, j) => <View key={j} style={{ flex: 1, minWidth: 0 }}>{c}</View>)}{row.length === 1 ? <View style={{ flex: 1 }} /> : null}</View>)}
    </View>
  );
}

/* ───────────────────────── FullPhotoScreen (board Welcome) ───────────────────────── */

export type FullPhotoScreenProps = {
  source: ImageSourcePropType;
  focal?: Focal;
  /** The big words, low and left (46pt). Keep it to a few words. */
  title: string;
  /** One two-tone line under the title (21pt). */
  statement?: TwoToneSegment[];
  /** Dash pager for a short run of pages. */
  pager?: { count: number; index: number };
  /** The one round arrow. */
  onNext?: () => void;
  nextLabel?: string;
  /** The orb and "life" on the left of the bar. */
  brand?: boolean;
  onSkip?: () => void;
  skipLabel?: string;
  /** Anything that replaces the pager and arrow row (a moment's single action, for example). */
  children?: ReactNode;
};

/**
 * The Welcome treatment, for every full-screen moment: the photograph edge to edge with the soft fade,
 * big words low and left, one round arrow and a dash pager. Never a panel over the photograph.
 */
export function FullPhotoScreen({ source, focal, title, statement, pager, onNext, nextLabel = 'Next', brand = true, onSkip, skipLabel = 'Skip', children }: FullPhotoScreenProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.full}>
      <PhotoFill source={source} focal={focal} settle />
      <LinearGradient pointerEvents="none" colors={photoScrims.fade.colors} locations={photoScrims.fade.locations} style={StyleSheet.absoluteFill} />
      <View style={[styles.photoBar, { marginTop: insets.top }]}>
        {brand ? <View style={styles.brand}><LifeOrb size={22} color={photo.onPhoto} /><Text variant="headline" tone="paper">life</Text></View> : <View />}
        {onSkip ? <Press haptic="select" onPress={onSkip} accessibilityLabel={skipLabel} hitSlop={12}><Text variant="button" tone="paper">{skipLabel}</Text></Press> : null}
      </View>
      <View style={{ flex: 1 }} />
      <View style={{ paddingHorizontal: space.gutter, paddingBottom: Math.max(insets.bottom, space.lg) + space.sm }}>
        <Text variant="welcome" tone="paper" accessibilityRole="header">{title}</Text>
        {statement ? <TwoTone size="welcomeStatement" onAtmosphere segments={statement} style={{ marginTop: space.sm }} /> : null}
        {children ?? <View style={[styles.nextRow, { marginTop: space.xxl }]}>
          {pager ? <DashPager count={pager.count} index={pager.index} /> : <View />}
          {onNext ? <RoundButton icon="arrow" size="lg" onPhoto label={nextLabel} onPress={onNext} haptic="primary" /> : null}
        </View>}
      </View>
    </View>
  );
}

/* ───────────────────────── TintCard (board `.tint`) ───────────────────────── */

/** The area's chart colour and its soft tint, for a tinted card and the chart drawn inside it. */
export function useAreaTint(area: Area): { accent: string; tint: string } {
  const t = useTokens();
  return { accent: areaColors[t.scheme][area], tint: tint[t.scheme][area] };
}

/**
 * Soft area colour behind a chart card (body, fuel and money readings). One or two per screen, never every card,
 * never on Body. Draw the card's chart in `useAreaTint(area).accent`. Ember stays the one signal.
 */
export function TintCard({ area, children, padding = space.cardPad, onPress, accessibilityLabel, style }: { area: Area; children: ReactNode; padding?: number; onPress?: () => void; accessibilityLabel?: string; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  const box: ViewStyle = { backgroundColor: t.surface, borderRadius: radius.lg, padding, ...cardShadow(t.scheme) };
  const wash = <View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius.lg, backgroundColor: tint[t.scheme][area] }]} />;
  return onPress
    ? <Press haptic="open" onPress={onPress} accessibilityLabel={accessibilityLabel} style={[box, style]}>{wash}{children}</Press>
    : <View style={[box, style]}>{wash}{children}</View>;
}

const styles = StyleSheet.create({
  topline: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: space.xs },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flexShrink: 1 },
  full: { flex: 1, overflow: 'hidden' },
  photoBar: { height: componentSize.topBarV26, paddingHorizontal: space.gutter, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  nextRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
