import { useMemo, useRef, useState } from 'react';
import { PanResponder, StyleSheet, View, type LayoutChangeEvent } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { feedback } from '../feedback';
import { Callout, Text } from '../Text';
import { useTokens } from '../theme';
import { radius } from '../tokens';

/** DESIGN.md §14 + §40: the mood check-in is always this dot field. No mesh gradients. */
export type MoodId = 'calm' | 'driven' | 'restless' | 'anxious' | 'drained' | 'peaceful';
export type StoryMoment = 'drained' | 'calm' | 'driven' | 'home';

export type Mood = {
  id: MoodId;
  /** Anchor position in the field, 0–1 (x: tense → easy, y: energised → drained). */
  x: number;
  y: number;
  rgb: [number, number, number];
  hint: string;
  /** Which story frame Today shows for this mood (§36, §41). */
  moment: StoryMoment;
  focusBias: 'calm' | 'growth' | 'urgent' | 'explore' | 'balanced';
};

export const MOODS: Mood[] = [
  { id: 'calm', x: 0.75, y: 0.55, rgb: [61, 200, 170], hint: 'Today leans toward calm admin: small, quiet wins first.', moment: 'calm', focusBias: 'calm' },
  { id: 'driven', x: 0.72, y: 0.15, rgb: [255, 107, 61], hint: 'Today leans toward momentum: your one bigger decision goes first.', moment: 'driven', focusBias: 'growth' },
  { id: 'restless', x: 0.22, y: 0.18, rgb: [230, 180, 50], hint: 'Today leans toward quick wins: three five-minute tasks.', moment: 'driven', focusBias: 'explore' },
  { id: 'anxious', x: 0.18, y: 0.5, rgb: [160, 130, 240], hint: "Today leans toward clarity: only what's due this week.", moment: 'drained', focusBias: 'urgent' },
  { id: 'drained', x: 0.35, y: 0.86, rgb: [140, 150, 170], hint: 'Today leans toward rest: nothing new, just one gentle step.', moment: 'drained', focusBias: 'calm' },
  { id: 'peaceful', x: 0.8, y: 0.86, rgb: [100, 160, 240], hint: 'Today leans toward care: health and home come first.', moment: 'calm', focusBias: 'balanced' },
];

const COLS = 12;
const ROWS = 14;
const REACH = 95;

function nearest(x: number, y: number): Mood {
  let best = MOODS[0];
  let bd = Infinity;
  for (const m of MOODS) {
    const d = Math.hypot(m.x - x, m.y - y);
    if (d < bd) {
      bd = d;
      best = m;
    }
  }
  return best;
}

export type PulseFieldProps = {
  initial?: { x: number; y: number };
  onChange?: (mood: Mood, pos: { x: number; y: number }) => void;
  height?: number;
};

/** Drag across the field; dots swell near the finger in the mood's colour. Selection haptic on each mood change. */
export function PulseField({ initial = { x: 0.72, y: 0.48 }, onChange, height = 320 }: PulseFieldProps) {
  const t = useTokens();
  const [size, setSize] = useState({ w: 0, h: height });
  const [pos, setPos] = useState(initial);
  const moodRef = useRef<Mood>(nearest(initial.x, initial.y));
  const mood = nearest(pos.x, pos.y);

  const move = (lx: number, ly: number) => {
    if (!size.w) return;
    const next = { x: Math.max(0.04, Math.min(0.96, lx / size.w)), y: Math.max(0.04, Math.min(0.96, ly / size.h)) };
    setPos(next);
    const m = nearest(next.x, next.y);
    if (m.id !== moodRef.current.id) {
      moodRef.current = m;
      feedback.select();
    }
    onChange?.(m, next);
  };

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => move(e.nativeEvent.locationX, e.nativeEvent.locationY),
        onPanResponderMove: (e) => move(e.nativeEvent.locationX, e.nativeEvent.locationY),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [size.w, size.h],
  );

  const px = pos.x * size.w;
  const py = pos.y * size.h;
  const [r, g, b] = mood.rgb;
  const idle = t.scheme === 'dark' ? 'rgba(247,248,248,0.16)' : 'rgba(13,14,16,0.16)';
  const dots = [];
  if (size.w) {
    for (let i = 0; i < COLS; i++) {
      for (let j = 0; j < ROWS; j++) {
        const x = ((i + 0.5) / COLS) * size.w;
        const y = ((j + 0.5) / ROWS) * size.h;
        const k = Math.max(0, 1 - Math.hypot(x - px, y - py) / REACH);
        dots.push(<Circle key={`${i}-${j}`} cx={x} cy={y} r={1.1 + k * 6.5} fill={k > 0 ? `rgba(${r},${g},${b},${(0.25 + 0.75 * k).toFixed(2)})` : idle} />);
      }
    }
  }

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      {...responder.panHandlers}
      accessibilityRole="adjustable"
      accessibilityLabel="How you feel"
      accessibilityValue={{ text: mood.id }}
      // Without sight of the field, VoiceOver's swipe up and down (TalkBack's volume keys) step through the moods.
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]}
      onAccessibilityAction={(e) => {
        const at = MOODS.findIndex(m => m.id === mood.id);
        const next = MOODS[(at + (e.nativeEvent.actionName === 'increment' ? 1 : MOODS.length - 1)) % MOODS.length];
        const p = { x: next.x, y: next.y };
        setPos(p);
        moodRef.current = next;
        feedback.select();
        onChange?.(next, p);
      }}
      style={[styles.field, { height, backgroundColor: t.surface }]}
    >
      <Svg width={size.w} height={size.h}>
        {dots}
        {size.w ? <Circle cx={px} cy={py} r={11} fill="#FFFFFF" /> : null}
      </Svg>
      <Text variant="micro" tone="ink2" style={[styles.axis, { top: 10, alignSelf: 'center' }]}>Energised</Text>
      <Text variant="micro" tone="ink2" style={[styles.axis, { bottom: 10, alignSelf: 'center' }]}>Drained</Text>
      <Text variant="micro" tone="ink2" style={[styles.axis, { left: 12, top: height / 2 - 7 }]}>Tense</Text>
      <Text variant="micro" tone="ink2" style={[styles.axis, { right: 12, top: height / 2 - 7 }]}>Easy</Text>
    </View>
  );
}

/** The full check-in block: sentence + field + hint, as on the v8 board. */
export function PulseCheckIn({ onChange }: { onChange?: (mood: Mood) => void }) {
  const [mood, setMood] = useState<Mood>(nearest(0.72, 0.48));
  const [r, g, b] = mood.rgb;
  return (
    <View style={{ gap: 16 }}>
      <Text variant="statement" style={{ fontSize: 28, lineHeight: 34 }}>
        <Text variant="statement" tone="quiet" style={{ fontSize: 28, lineHeight: 34 }}>
          {"I'm arriving today feeling "}
        </Text>
        <Text variant="statement" style={{ fontSize: 28, lineHeight: 34, color: `rgb(${r},${g},${b})` }}>
          {mood.id}
        </Text>
      </Text>
      <PulseField
        onChange={(m) => {
          setMood(m);
          onChange?.(m);
        }}
      />
      <Callout tone="ink2">{mood.hint}</Callout>
    </View>
  );
}

const styles = StyleSheet.create({
  field: { borderRadius: radius.lg, overflow: 'hidden' },
  axis: { position: 'absolute' },
});
