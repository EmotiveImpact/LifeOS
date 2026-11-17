import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { useTokens } from './theme';
import { componentSize } from './tokens';
import { iconAliases, iconPaths, type IconName } from './iconPaths';

export type { IconName } from './iconPaths';
export type IconProps = { name: IconName | keyof typeof iconPaths; size?: number; color?: string; style?: StyleProp<ViewStyle & { color?: string }>; accessibilityLabel?: string };

/** The exact outline family from the original calmer mockup, on both platforms.
 * A native vector, not an icon font: its path/weight cannot change by platform. */
export const Icon = Object.assign(function LifeIcon({ name, size = componentSize.navIcon, color, style, accessibilityLabel }: IconProps) {
  const t = useTokens();
  const { color: inheritedColor, ...containerStyle } = StyleSheet.flatten(style) ?? {};
  const key = iconAliases[name as IconName] ?? name as keyof typeof iconPaths;
  const path = iconPaths[key] ?? iconPaths.help;
  const xml = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${componentSize.iconStroke}" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
  return <SvgXml xml={xml} width={size} height={size} color={color ?? inheritedColor ?? t.ink} style={containerStyle} accessibilityLabel={accessibilityLabel} pointerEvents="none" />;
}, { glyphMap: iconAliases });
