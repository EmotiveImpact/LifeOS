import { useEffect, useState } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { useCalmMotion, useTokens } from '../theme';
import { motion } from '../tokens';
import { sizeOfPhoto } from '../photos';

/** Where the photo's subject sits, 0–1 on each axis (the board's `background-position`). Default centre. */
export type Focal = { x?: number; y?: number };

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
  const crop = asset && frame.width && frame.height ? (() => {
    const ratio = Math.max(frame.width / asset.width, frame.height / asset.height);
    const width = asset.width * ratio, height = asset.height * ratio;
    return { position: 'absolute' as const, width, height, left: (frame.width - width) * fx, top: (frame.height - height) * fy };
  })() : null;
  const scale = useSharedValue(settle && !calm ? 1.04 : 1);
  useEffect(() => { if (settle && !calm) scale.value = withSpring(1, motion.imageEnter); }, [settle, calm, source, scale]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <View pointerEvents="none" onLayout={e => { const { width, height } = e.nativeEvent.layout; setFrame(f => f.width === width && f.height === height ? f : { width, height }); }} style={[StyleSheet.absoluteFill, { backgroundColor: t.surface2, overflow: 'hidden' }]}>
      <Animated.View style={[StyleSheet.absoluteFill, anim]}>
        <Image source={source} resizeMode="cover" accessibilityIgnoresInvertColors fadeDuration={calm ? 0 : motion.imageFade.duration} style={crop ?? StyleSheet.absoluteFill} />
      </Animated.View>
    </View>
  );
}
