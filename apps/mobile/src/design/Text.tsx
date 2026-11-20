import type { ReactNode } from 'react';
import { Platform, Text as RNText, type StyleProp, type TextProps, type TextStyle } from 'react-native';
import { onAtmosphere, photo, type TypeStyle, type as typeScale } from './tokens';
import { useTokens } from './theme';

/**
 * Text tones. `quiet` is only for the muted half of a two-tone sentence at 20px or larger.
 * The `paper*` tones are for text placed on an atmosphere.
 */
export type Tone = 'ink' | 'ink2' | 'quiet' | 'ember' | 'gain' | 'paper' | 'paper2' | 'paperQuiet' | 'inverse' | 'inverse2' | 'photoInk';

export type LifeTextProps = Omit<TextProps, 'style'> & {
  variant?: TypeStyle;
  tone?: Tone;
  align?: TextStyle['textAlign'];
  style?: StyleProp<TextStyle>;
  children?: ReactNode;
};

export function useToneColor(tone: Tone): string {
  const t = useTokens();
  switch (tone) {
    case 'ink':
      return t.ink;
    case 'ink2':
      return t.ink2;
    case 'quiet':
      return t.inkQuiet;
    case 'ember':
      return t.emberText;
    case 'gain':
      return t.gain;
    case 'paper':
      return onAtmosphere.text;
    case 'paper2':
      return onAtmosphere.text2;
    case 'paperQuiet':
      return onAtmosphere.quiet;
    case 'inverse':
      return t.canvas;
    case 'inverse2':
      return t.inverse2;
    case 'photoInk':
      return photo.ink;
  }
}

/** The largest text size life follows (Dynamic Type, Android font size). Text fields use the same cap. */
export const maxTextScale = 1.3;
/**
 * The web can't read the system text size, so a review build previews the largest one with
 * `EXPO_PUBLIC_TEXT_SCALE=1.3`, to check every screen still fits. Never set in a store build.
 */
const preview = Number(process.env.EXPO_PUBLIC_TEXT_SCALE) || 0;
const previewScale = Platform.OS === 'web' && preview > 1 ? Math.min(preview, maxTextScale) : 0;

/** The one text component. Screens never set font sizes directly (DESIGN.md §4). */
export function Text({ variant = 'body', tone = 'ink', align, style, children, ...rest }: LifeTextProps) {
  const color = useToneColor(tone);
  const base = typeScale[variant];
  const scaled = previewScale ? { fontSize: base.fontSize * previewScale, lineHeight: base.lineHeight * previewScale } : null;
  return (
    <RNText
      maxFontSizeMultiplier={maxTextScale}
      {...rest}
      style={[base, scaled, { color, textAlign: align }, style]}
    >
      {children}
    </RNText>
  );
}

type Named = Omit<LifeTextProps, 'variant'>;
export const Numeral = (p: Named & { size?: 'xl' | 'l' }) => {
  const { size = 'xl', ...rest } = p;
  return <Text variant={size === 'xl' ? 'numeralXl' : 'numeralL'} {...rest} />;
};
export const TitleSerif = (p: Named) => <Text variant="titleSerif" accessibilityRole="header" {...p} />;
export const Statement = (p: Named) => <Text variant="statement" {...p} />;
export const Headline = (p: Named) => <Text variant="headline" {...p} />;
export const Title = (p: Named) => <Text variant="title" {...p} />;
export const Body = (p: Named) => <Text variant="body" {...p} />;
export const Callout = (p: Named) => <Text variant="callout" {...p} />;
export const Mono = (p: Named) => <Text variant="mono" {...p} />;
export const Unit = (p: Named) => <Text variant="unit" tone="ink2" {...p} />;
