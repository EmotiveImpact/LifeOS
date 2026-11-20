import type { ReactNode } from 'react';
import { Text as RNText, type StyleProp, type TextProps, type TextStyle } from 'react-native';
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

/** The one text component. Screens never set font sizes directly (DESIGN.md §4). */
export function Text({ variant = 'body', tone = 'ink', align, style, children, ...rest }: LifeTextProps) {
  const color = useToneColor(tone);
  return (
    <RNText
      maxFontSizeMultiplier={1.3}
      {...rest}
      style={[typeScale[variant], { color, textAlign: align }, style]}
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
