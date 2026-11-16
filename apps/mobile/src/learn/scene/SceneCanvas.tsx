import { useMemo, useState } from 'react';
import { View, type LayoutChangeEvent } from 'react-native';
import { Canvas, Group, Picture, createPicture, useFont } from '@shopify/react-native-skia';
import { useDerivedValue, useFrameCallback, useSharedValue } from 'react-native-reanimated';
import { useFocusEffect } from 'expo-router';
import { useCallback } from 'react';
import { Text } from '@/design/Text';
import { useCalmMotion, useTokens } from '@/design/theme';
import { radius, space } from '@/design/tokens';
import { createSceneRenderer, VIEW_H, VIEW_W } from './draw';
import { sceneForDevice, type SceneViewProps } from './props';
import { canDraw } from './types';
const INTER = require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf');

/** Full Fenny drawing kit in life’s theme. The animation clock, slider and all
 * drawing instructions run on the UI thread. Reduce Motion draws a still scene. */
export default function SceneCanvas(props: SceneViewProps) {
  const { changes = [], value, build, moving, handDrawn = false, caption } = props;
  const tokens = useTokens(), calm = useCalmMotion(), [width, setWidth] = useState(0);
  const scene = useMemo(() => props.scene ?? sceneForDevice(props.device, props.labels, props.values), [props.scene, props.device, props.labels, props.values]);
  const font = useFont(INTER, 10.5), t = useSharedValue(calm ? 1.2 : 0), clock = useSharedValue(calm ? 1.2 : 0), slider = useSharedValue(value?.value ?? 0), intro = useSharedValue(build?.value ?? (calm ? 1 : 0));
  const renderer = useMemo(() => createSceneRenderer({ ink: tokens.ink, ember: tokens.ember, label: tokens.ink2, panel: tokens.surface2 }), [tokens.ink, tokens.ember, tokens.ink2, tokens.surface2]);
  const frame = useFrameCallback(info => {
    const dt = Math.min(.05, (info.timeSincePreviousFrame ?? 16) / 1000), target = value?.value ?? 0;
    if (build) intro.value = build.value;
    if (calm) { slider.value = target; intro.value = 1; return; }
    slider.value += (target - slider.value) * Math.min(1, dt * 5);
    if (moving && moving.value < 1) return;
    t.value += dt; clock.value += dt * renderer.speedAt(changes, slider.value);
    if (!build && intro.value < 1) intro.value = Math.min(1, intro.value + dt * .55);
  }, false);
  useFocusEffect(useCallback(() => { frame.setActive(!calm); return () => frame.setActive(false); }, [frame, calm]));
  const picture = useDerivedValue(() => createPicture(canvas => {
    'worklet';
    try { renderer.drawScene(canvas, scene, changes, { t: t.value, T: clock.value, v: slider.value, intro: props.progress ?? intro.value, still: calm, hand: handDrawn }, font); }
    catch (error) { if (__DEV__) console.warn('Scene could not draw:', String(error)); }
  }), [scene, changes, renderer, font, handDrawn, calm, props.progress]);
  if (!canDraw(scene)) return <View style={{ backgroundColor: tokens.surface2, padding: space.lg, borderRadius: radius.md }}><Text variant="body">{caption ?? 'This picture will be available in the next update.'}</Text></View>;
  return <View accessible accessibilityRole="image" accessibilityLabel={props.accessibilityLabel ?? `${scene.family} diagram. ${(props.labels ?? []).join(', ')}`} onLayout={(event: LayoutChangeEvent) => setWidth(event.nativeEvent.layout.width)} style={{ backgroundColor: tokens.surface2, borderRadius: radius.md, overflow: 'hidden' }}>
    <View style={{ aspectRatio: VIEW_W / VIEW_H }}>{width > 0 ? <Canvas style={{ width, height: width * VIEW_H / VIEW_W }}><Group transform={[{ scale: width / VIEW_W }]}><Picture picture={picture} /></Group></Canvas> : null}</View>
    {caption ? <View style={{ paddingHorizontal: space.md, paddingBottom: space.sm }}><Text variant="callout" tone="ink2">{caption}</Text></View> : null}
  </View>;
}
