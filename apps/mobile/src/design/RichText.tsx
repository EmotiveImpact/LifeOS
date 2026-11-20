import type { StyleProp, TextStyle } from 'react-native';
import { Text, useToneColor, type LifeTextProps, type Tone } from './Text';
import { fonts } from './tokens';

/** Splits copy written with `{braces}` around the words that matter: `Three steps, about {6 minutes}.` */
export function splitRich(text: string): { text: string; on: boolean }[] {
  const out: { text: string; on: boolean }[] = [];
  const re = /\{([^}]*)\}/g;
  let last = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), on: false });
    out.push({ text: m[1], on: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), on: false });
  return out;
}

/**
 * The board's `.body b`: quiet copy with the words that matter in ink. Write the copy with braces:
 * `<RichText text="Three steps, about {6 minutes}." />`. Braced words take `brightTone` and medium weight
 * (semibold with `strong`).
 */
export function RichText({ text, variant = 'body', tone = 'ink2', brightTone = 'ink', strong, style, ...rest }: Omit<LifeTextProps, 'children'> & { text: string; brightTone?: Tone; strong?: boolean; style?: StyleProp<TextStyle> }) {
  const bright = useToneColor(brightTone);
  const weight: TextStyle = { color: bright, fontFamily: strong ? fonts.sansSemibold : fonts.sansMedium };
  return (
    <Text variant={variant} tone={tone} style={style} {...rest}>
      {splitRich(text).map((p, i) => p.on ? <Text key={i} variant={variant} style={weight}>{p.text}</Text> : p.text)}
    </Text>
  );
}
