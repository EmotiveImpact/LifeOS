import { useState } from 'react';
import { StyleSheet, View, type ImageSourcePropType } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import Svg, { Circle, Defs, G, LinearGradient as SvgGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { feedback } from '../feedback';
import { Callout, Text } from '../Text';
import { useTokens } from '../theme';
import { durations } from '../tokens';
import { Button } from './Surfaces';
import { ImageTreatment, PhotoChip } from './Imagery';

/* ───────────────────────── IntroCarousel (level-up, life+) ───────────────────────── */

export type IntroPage = { image: ImageSourcePropType; tag: string; title: string; body: string };

/** Full-photo pages with segmented progress bars. Plays `cleared` on Done. Shown once per level (caller tracks). */
export function IntroCarousel({ pages, onDone, onShowMe }: { pages: IntroPage[]; onDone: () => void; onShowMe?: () => void }) {
  const [p, setP] = useState(0);
  const page = pages[p];
  const last = p === pages.length - 1;
  return (
    <View style={StyleSheet.absoluteFill}>
      <Animated.View key={p} entering={FadeIn.duration(durations.item)} style={StyleSheet.absoluteFill}>
        <ImageTreatment kind="cover" source={page.image} />
      </Animated.View>
      <View style={styles.bars}>
        {pages.map((_, i) => (
          <View key={i} style={{ flex: 1, height: 3, borderRadius: 2, backgroundColor: i <= p ? '#F7F8F8' : 'rgba(247,248,248,0.3)' }} />
        ))}
      </View>
      <View style={styles.copy}>
        <PhotoChip>
          <Text variant="micro" tone="paper">
            {page.tag}
          </Text>
        </PhotoChip>
        <Text variant="titleSerif" tone="paper">
          {page.title}
        </Text>
        <Text variant="body" tone="paper2">
          {page.body}
        </Text>
      </View>
      <View style={styles.actions}>
        <Button
          label={last ? 'Done' : 'Next'}
          onAtmosphere
          onPress={() => {
            if (last) {
              feedback.cleared();
              onDone();
            } else setP(p + 1);
          }}
        />
        {onShowMe ? <Button label="Show me" variant="link" onAtmosphere onPress={onShowMe} /> : null}
      </View>
    </View>
  );
}

/* ───────────────────────── Ridge (Vantage point) ───────────────────────── */

const PEAKS: [number, number][] = [
  [50, 180],
  [150, 128],
  [245, 80],
  [340, 36],
];

/** Levels drawn as a ridge you climb. Current and past peaks in ink, the next in ember with a halo. */
export function Ridge({ level, width = 393, height = 230 }: { level: 1 | 2 | 3 | 4; width?: number; height?: number }) {
  const t = useTokens();
  const sx = width / 393;
  const sy = height / 230;
  const path = 'M0 210 L50 180 L95 192 L150 128 L195 150 L245 80 L285 104 L340 36 L393 66';
  return (
    <View accessibilityRole="image" accessibilityLabel={`You are at level ${level} of 4`}>
      <Svg width={width} height={height} viewBox="0 0 393 230" preserveAspectRatio="none">
        <Defs>
          <SvgGradient id="rg" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={t.ember} stopOpacity={0.22} />
            <Stop offset="1" stopColor={t.ember} stopOpacity={0} />
          </SvgGradient>
        </Defs>
        <Path d={`${path} L393 230 L0 230Z`} fill="url(#rg)" />
        <Path d={path} fill="none" stroke={t.ink2} strokeWidth={1.25} strokeDasharray="2 5" />
        {PEAKS.map(([x, y], i) => {
          const on = i + 1 <= level;
          const next = i + 1 === level + 1;
          const s = next ? 16 : 12;
          return (
            <G key={i}>
              {next ? <Circle cx={x} cy={y} r={18} fill={t.ember} opacity={0.2} /> : null}
              <Rect x={x - s / 2} y={y - s / 2} width={s} height={s} rx={4} fill={on ? t.ink : next ? t.ember : t.surface3} />
              <SvgText x={x} y={y - 16} textAnchor="middle" fill={t.ink2} fontSize={12} fontWeight="600">
                {`L${i + 1}`}
              </SvgText>
            </G>
          );
        })}
      </Svg>
      <Callout tone="ink2" style={{ position: 'absolute', right: 8 * sx, bottom: 6 * sy }}>
        {level < 4 ? `Next: level ${level + 1}` : 'Top of the ridge'}
      </Callout>
    </View>
  );
}

const styles = StyleSheet.create({
  bars: { position: 'absolute', left: 20, right: 20, top: 66, flexDirection: 'row', gap: 4 },
  copy: { position: 'absolute', left: 20, right: 20, bottom: 140, gap: 10 },
  actions: { position: 'absolute', left: 20, right: 20, bottom: 34, gap: 4 },
});
