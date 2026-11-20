import { type StyleProp, type TextStyle } from 'react-native';
import { Text, type Tone } from '../Text';
import { type TypeStyle, type } from '../tokens';

/**
 * The logo: L I F E in spaced capitals (Edem, 20 Nov 2026). Used only where the name stands on its own: the welcome
 * screens, sign-in, the Plus screen and About. Inside sentences the name is written "Life", like any other name.
 * Screen readers hear "Life", not four letters.
 */
export function Wordmark({ variant = 'headline', tone = 'ink', color, style }: { variant?: TypeStyle; tone?: Tone; color?: string; style?: StyleProp<TextStyle> }) {
  const size = type[variant]?.fontSize ?? 17;
  return (
    <Text variant={variant} tone={tone} accessibilityRole="header" accessibilityLabel="Life" aria-label="Life"
      style={[{ letterSpacing: Math.round(size * 0.34), fontWeight: '600' }, color ? { color } : null, style]}>
      LIFE
    </Text>
  );
}
