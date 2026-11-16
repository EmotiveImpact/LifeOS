import type { ReactNode } from 'react';
import { Image, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from '../Text';
import { palette, radius, space } from '../tokens';

export type CameraLabel = { text: string; left: `${number}%`; top: `${number}%` };
/** The board’s ungraded camera viewport, not a story card. Track A supplies a
 * local photo; the real camera feed can replace only this surface in Track B. */
export function CameraViewport({ source, labels = [], children, scrim = true }: { source: ImageSourcePropType; labels?: CameraLabel[]; children?: ReactNode; scrim?: boolean }) {
  return <View pointerEvents="box-none" style={[StyleSheet.absoluteFill, { backgroundColor: palette.dark.canvas }]}>
    <Image source={source} resizeMode="cover" style={StyleSheet.absoluteFill} accessibilityIgnoresInvertColors />
    {scrim ? <LinearGradient pointerEvents="none" colors={['transparent', palette.dark.canvas]} locations={[.65, 1]} style={StyleSheet.absoluteFill} /> : null}
    {labels.map(label => <View key={label.text} style={{ position: 'absolute', left: label.left, top: label.top, backgroundColor: palette.dark.canvas, borderRadius: radius.xs, paddingHorizontal: space.xs, paddingVertical: space.xxs }}><Text variant="callout" tone="paper">{label.text}</Text></View>)}
    {children}
  </View>;
}
