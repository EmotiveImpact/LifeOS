import { useEffect, useState, type ReactNode } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withSpring } from 'react-native-reanimated';
import { useCalmMotion, useTokens } from '../theme';
import { imageScrims, motion, radius, space, componentSize } from '../tokens';
import { Card, Button } from './Surfaces';
import { Text } from '../Text';
import type { StoryMoment } from './Pulse';

/**
 * DESIGN.md §33–§36, §41: one protagonist, four story frames, an opt-in look.
 * Looks are chosen by the user (never inferred) and stored on the device only.
 */
export type Look = 'p1' | 'p2' | 'p3' | 'places';
/** v1 default (DESIGN.md §44): a diverse mixed cast, each moment shows a different person. */
export type LookPref = Look | 'mix';
const MIX: Record<StoryMoment, Look> = { drained: 'p2', calm: 'p1', driven: 'p3', home: 'p1' };

const SCENES: Record<Look, Record<StoryMoment, ImageSourcePropType>> = {
  p1: {
    drained: require('../../../assets/images/scenes/p1-drained.jpg'),
    calm: require('../../../assets/images/scenes/p1-calm.jpg'),
    driven: require('../../../assets/images/scenes/p1-driven.jpg'),
    home: require('../../../assets/images/scenes/p1-home.jpg'),
  },
  p2: {
    drained: require('../../../assets/images/scenes/p2-drained.jpg'),
    calm: require('../../../assets/images/scenes/p2-calm.jpg'),
    driven: require('../../../assets/images/scenes/p2-driven.jpg'),
    home: require('../../../assets/images/scenes/p2-home.jpg'),
  },
  p3: {
    drained: require('../../../assets/images/scenes/p3-drained.jpg'),
    calm: require('../../../assets/images/scenes/p3-calm.jpg'),
    driven: require('../../../assets/images/scenes/p3-driven.jpg'),
    home: require('../../../assets/images/scenes/p3-home.jpg'),
  },
  places: {
    drained: require('../../../assets/images/scenes/d-drained.jpg'),
    calm: require('../../../assets/images/scenes/d-calm.jpg'),
    driven: require('../../../assets/images/scenes/d-glimpse-freedom.jpg'),
    home: require('../../../assets/images/scenes/d-glimpse-home.jpg'),
  },
};

/** The image for a story moment in the user's chosen look ("mix" callers pass any look). */
export function storyImage(look: LookPref, moment: StoryMoment): ImageSourcePropType {
  return SCENES[look === 'mix' ? MIX[moment] : look][moment];
}

export type ImageTreatmentProps = {
  kind: 'cover' | 'band' | 'card';
  source: ImageSourcePropType;
  /** Height in points. Defaults: cover = fills parent, band = 380, card = 220. */
  height?: number;
  /** Vertical focal point, 0–1. Keeps the person in portrait assets in short cards. */
  focalY?: number;
  /** Text and controls placed on the image (paper-white). */
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

/**
 * The only way photos appear in life (§33). Solid scrims, no blur or glass (§43).
 * Cover/band fade into the canvas; card has a bottom scrim for paper text.
 */
export function ImageTreatment({ kind, source, height, focalY, children, style }: ImageTreatmentProps) {
  const t = useTokens();
  if (kind === 'card') {
    return (
      <View style={[styles.card, { height: height ?? 220 }, style]}>
        <StoryPhoto source={source} focalY={focalY} />
        <LinearGradient colors={['rgba(8,9,10,0)', 'rgba(8,9,10,0.8)']} locations={[0.35, 1]} style={StyleSheet.absoluteFill} />
        <View style={styles.cardBody}>{children}</View>
      </View>
    );
  }
  const h = kind === 'band' ? (height ?? 380) : height;
  return (
    <View pointerEvents="box-none" style={[kind === 'cover' && !h ? StyleSheet.absoluteFill : { position: 'absolute', left: 0, right: 0, top: 0, height: h }, style]}>
      <StoryPhoto source={source} />
      {/* Top scrim keeps the status bar readable; bottom fades into the canvas. */}
      {kind === 'cover' ? <LinearGradient colors={imageScrims.cover} locations={imageScrims.coverLocations} style={StyleSheet.absoluteFill} pointerEvents="none" /> : <>
        <LinearGradient colors={['rgba(8,9,10,0.35)', 'rgba(8,9,10,0)']} locations={[0, 0.28]} style={StyleSheet.absoluteFill} pointerEvents="none" />
        <LinearGradient colors={['rgba(8,9,10,0)', t.canvas]} locations={[0.55, 1]} style={StyleSheet.absoluteFill} pointerEvents="none" />
      </>}
      {children}
    </View>
  );
}

function StoryPhoto({ source, focalY }: { source: ImageSourcePropType; focalY?: number }) {
  const calm = useCalmMotion(), t = useTokens();
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const resolved = typeof Image.resolveAssetSource === 'function' ? Image.resolveAssetSource(source) : source;
  const asset = resolved && typeof resolved === 'object' && 'width' in resolved && 'height' in resolved && typeof resolved.width === 'number' && typeof resolved.height === 'number' ? { width: resolved.width, height: resolved.height } : null;
  const crop = focalY !== undefined && frame.width && frame.height && asset?.width && asset?.height ? (() => {
    const ratio = Math.max(frame.width / asset.width, frame.height / asset.height);
    const width = asset.width * ratio, height = asset.height * ratio;
    return { position: 'absolute' as const, width, height, left: (frame.width - width) / 2, top: (frame.height - height) * Math.max(0, Math.min(1, focalY)) };
  })() : null;
  const scale = useSharedValue(calm ? 1 : 1.04);
  useEffect(() => {
    scale.value = calm ? 1 : withSequence(withSpring(1, motion.imageEnter), withRepeat(withSpring(1.06, motion.imageDrift), -1, true));
    return () => { cancelAnimation(scale); };
  }, [calm, source, scale]);
  const animated = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  // Cached/on-load timing must never leave a loaded photo at opacity zero.
  // Image handles loading; the Android fade is native and does not gate visibility.
  return <View pointerEvents="none" onLayout={focalY === undefined ? undefined : event => { const { width, height } = event.nativeEvent.layout; setFrame(current => current.width === width && current.height === height ? current : { width, height }); }} style={[StyleSheet.absoluteFill, { backgroundColor: t.surface2, overflow: 'hidden' }]}><Animated.Image source={source} resizeMode="cover" accessibilityIgnoresInvertColors fadeDuration={calm ? 0 : motion.imageFade.duration} style={[crop ?? [StyleSheet.absoluteFill, styles.photo], animated]} /></View>;
}

/** V22's single next move: a meaningful photo, readable identity and one real action. */
export function NextMoveCard({ source, title, description, onPress, actionLabel = 'Continue' }: { source: ImageSourcePropType; title: string; description: string; onPress: () => void; actionLabel?: string }) {
  return <Card padding={0} style={{ overflow: 'hidden' }}>
    <ImageTreatment kind="card" source={source} height={componentSize.nextMovePhoto} focalY={.76} style={{ borderRadius: 0 }}>
      <Text variant="callout" tone="paper2">One useful next move</Text>
      <Text variant="headline" tone="paper">{title}</Text>
      <Text variant="callout" tone="paper2">{description}</Text>
    </ImageTreatment>
    <View style={{ padding: space.lg }}><Button label={actionLabel} icon="chevron-forward" onPress={onPress} /></View>
  </Card>;
}

/** A solid chip for text over photos (no glass, §43). */
export function PhotoChip({ children }: { children: ReactNode }) {
  return <View style={styles.chip}>{children}</View>;
}

const styles = StyleSheet.create({
  // Asset metadata otherwise supplies its full pixel dimensions, even with
  // absolute insets: the card then clips a corner rather than a cover crop.
  photo: { width: '100%', height: '100%' },
  card: { borderRadius: radius.lg, overflow: 'hidden' },
  cardBody: { position: 'absolute', left: 0, right: 0, bottom: 0, padding: space.lg, gap: space.xxs },
  chip: { alignSelf: 'flex-start', height: 24, paddingHorizontal: 9, borderRadius: 7, backgroundColor: '#0D0E10', justifyContent: 'center' },
});
