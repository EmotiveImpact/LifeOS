import { WithSkiaWeb } from '@shopify/react-native-skia/lib/module/web';
import { View } from 'react-native';
import { useTokens } from '@/design/theme';
import { radius } from '@/design/tokens';
import type { SceneViewProps } from './props';
const getComponent = () => import('./SceneCanvas');
const opts = { locateFile: (file: string) => `/${file}` };
export function SceneView(props: SceneViewProps) {
  const tokens = useTokens();
  return <WithSkiaWeb getComponent={getComponent} componentProps={props} opts={opts} fallback={<View accessibilityLabel="Loading picture" style={{ aspectRatio: 300 / 176, backgroundColor: tokens.surface2, borderRadius: radius.md }} />} />;
}
export type { SceneViewProps } from './props';
