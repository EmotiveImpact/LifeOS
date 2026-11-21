import { useEffect, useState } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useCalmMotion, useTokens } from '../theme';
import { motion } from '../tokens';
import { sizeOfPhoto } from '../photos';

/**
 * Where the photo's subject sits, 0–1 on each axis (the board's `background-position`). Default centre.
 * With `zoom` (the board's `crop(name, x, y, zoom)`), x and y name the point to centre instead, and the photo is drawn
 * at least `zoom` × the box's width, so one piece of a photograph (an egg, the rice) can fill a thumb.
 */
export type Focal = { x?: number; y?: number; zoom?: number };

/**
 * A photograph that covers its box and keeps the focal point in view when it crops.
 * `settle`: the image-enter motion (scale 1.04 → 1, MOTION.md §3.2), for full-screen moments only.
 */
export function PhotoFill({ source, focal, settle }: { source: ImageSourcePropType; focal?: Focal; settle?: boolean }) {
  const t = useTokens(), calm = useCalmMotion();
  const [frame, setFrame] = useState({ width: 0, height: 0 });
  const known = sizeOfPhoto(source);
  const resolved = !known && typeof Image.resolveAssetSource === 'function' ? Image.resolveAssetSource(source) : null;
  const asset = known ? { width: known[0], height: known[1] } : resolved && typeof resolved.width === 'number' && typeof resolved.height === 'number' ? { width: resolved.width, height: resolved.height } : null;
  const fx = focal?.x ?? .5, fy = focal?.y ?? .5;
  const zoom = focal?.zoom;
  const crop = asset && frame.width && frame.height ? (() => {
    const cover = Math.max(frame.width / asset.width, frame.height / asset.height);
    const ratio = zoom ? Math.max(cover, zoom * frame.width / asset.width) : cover;
    const width = asset.width * ratio, height = asset.height * ratio;
    if (!zoom) return { position: 'absolute' as const, width, height, left: (frame.width - width) * fx, top: (frame.height - height) * fy };
    const fit = (v: number, lo: number) => Math.min(0, Math.max(lo, v));
    return { position: 'absolute' as const, width, height, left: fit(frame.width / 2 - fx * width, frame.width - width), top: fit(frame.height / 2 - fy * height, frame.height - height) };
  })() : null;
  const scale = useSharedValue(settle && !calm ? 1.04 : 1);
  useEffect(() => { if (settle && !calm) scale.value = withSpring(1, motion.imageEnter); }, [settle, calm, source, scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    // A photograph sets the scene; the card or screen around it says what it shows, so screen readers skip it.
    <View aria-hidden pointerEvents="none" onLayout={e => { const { width, height } = e.nativeEvent.layout; setFrame(f => f.width === width && f.height === height ? f : { width, height }); }} style={[StyleSheet.absoluteFill, { backgroundColor: t.surface2, overflow: 'hidden' }]}>
      <Animated.View style={[StyleSheet.absoluteFill, anim]}>
        <Image source={source} resizeMode="cover" resizeMethod="resize" accessibilityIgnoresInvertColors fadeDuration={calm ? 0 : motion.imageFade.duration} style={crop ?? StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}
