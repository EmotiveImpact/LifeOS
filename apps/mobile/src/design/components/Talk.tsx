import { useEffect, useRef, useState, type ComponentRef, type ReactNode } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';
import { Icon as Ionicons } from '../Icon';
import { feedback } from '../feedback';
import { Press } from '../Press';
import { Callout, Text } from '../Text';
import { useCalmMotion, useTokens } from '../theme';
import { areaColors, radius, springs, type Area } from '../tokens';
import { DottedOrb } from './Chrome';
import { TwoTone, type TwoToneSegment } from './Story';
import { LifeOrb } from './Orb';
import { RoundButton } from './V26Chrome';
import { ChatBubble, noteWave } from './V26Lists';

/* ───────────────────────── Waveform + BigMic ───────────────────────── */

export function Waveform(props: { active: boolean; bars?: number; /** V26 `note` (board `wave`): the resting 22-bar wave of a voice note, 2pt bars in ink2. */ look?: 'note' }) {
  if (props.look === 'note') return <NoteWave bars={props.bars ?? 22} />;
  return <WaveformV23 {...props} />;
}

function NoteWave({ bars }: { bars: number }) {
  const t = useTokens();
  return <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ height: 20, flexDirection: 'row', alignItems: 'center', gap: 2 }}>{noteWave(bars).map((h, i) => <View key={i} style={{ width: 2, height: h, borderRadius: 1, backgroundColor: t.ink2 }} />)}</View>;
}

function WaveformV23({ active, bars = 30 }: { active: boolean; bars?: number }) {
  const t = useTokens();
  const calm = useCalmMotion();
  const [h, setH] = useState<number[]>(() => Array(bars).fill(4));
  useEffect(() => {
    if (!active || calm) {
      setH(Array(bars).fill(4));
      return;
    }
    const id = setInterval(() => setH(Array.from({ length: bars }, () => 4 + Math.random() * 28)), 110);
    return () => clearInterval(id);
  }, [active, bars, calm]);
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" style={{ height: 36, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
      {h.map((v, i) => (
        <View key={i} style={{ width: 2.5, height: v, borderRadius: 2, backgroundColor: t.ink, opacity: 0.85 }} />
      ))}
    </View>
  );
}

export function BigMic({ live, onPress, look }: { live: boolean; onPress: () => void; /** V26 (board `fo-mic`): a 72pt round, surface2 at rest and ink while listening. No ember. */ look?: 'v26' }) {
  const t = useTokens();
  if (look === 'v26') return <RoundButton icon="mic" size="xl" solid={live} haptic="primary" label={live ? 'Listening. Tap when you’re done' : 'Start talking'} onPress={onPress} />;
  return (
    <Press
      haptic="primary"
      onPress={onPress}
      accessibilityLabel={live ? 'Stop listening' : 'Start talking'}
      accessibilityState={{ selected: live }}
      style={[styles.mic, { backgroundColor: live ? t.ember : t.ink }]}
    >
      <Ionicons name={live ? 'stop' : 'mic'} size={28} color={live ? '#FFFFFF' : t.canvas} />
    </Press>
  );
}

/* ───────────────────────── Transcript ───────────────────────── */

export type TranscriptWord = { text: string; area?: Area };

/**
 * Live transcript (DESIGN §21): quiet words, with recognised phrases highlighted in their area colour.
 * `revealed` = how many words have arrived so far.
 */
export function Transcript({ words, revealed }: { words: TranscriptWord[]; revealed: number }) {
  const t = useTokens();
  const ref = useRef<ComponentRef<typeof ScrollView>>(null);
  useEffect(() => {
    ref.current?.scrollToEnd({ animated: true });
  }, [revealed]);
  return (
    <ScrollView ref={ref} style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 12 }} accessibilityLiveRegion="polite">
      <Text variant="statement" tone="quiet" style={{ fontSize: 25, lineHeight: 33 }}>
        {words.slice(0, revealed).map((w, i) => {
          if (!w.area) return `${w.text} `;
          const c = areaColors[t.scheme][w.area];
          return (
            <Text key={i} variant="statement" style={{ fontSize: 25, lineHeight: 33, color: t.ink, backgroundColor: `${c}2E` }}>
              {`${w.text} `}
            </Text>
          );
        })}
      </Text>
    </ScrollView>
  );
}

/* ───────────────────────── FilingTray ───────────────────────── */

const AREA_ORDER: Area[] = ['you', 'home', 'work', 'money', 'health', 'goal'];
const AREA_LABEL: Record<Area, string> = { you: 'You', home: 'Home', work: 'Work', money: 'Money', health: 'Health', goal: 'Goals' };

/** Six area tiles that count what was filed. A tile bumps (spring) each time its count goes up. */
export function FilingTray({ counts }: { counts: Partial<Record<Area, number>> }) {
  const t = useTokens();
  const filed = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);
  return (
    <View style={[styles.tray, { backgroundColor: t.surface }]}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Callout style={{ fontFamily: 'Inter_600SemiBold' }}>Filing into place</Callout>
        <Callout tone="ink2">{`${filed} filed`}</Callout>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
        {AREA_ORDER.map((a) => (
          <TrayTile key={a} area={a} count={counts[a] ?? 0} />
        ))}
      </View>
    </View>
  );
}

function TrayTile({ area, count }: { area: Area; count: number }) {
  const t = useTokens();
  const s = useSharedValue(1);
  const prev = useRef(count);
  useEffect(() => {
    if (count > prev.current) {
      s.value = withSequence(withSpring(1.03, springs.snappy), withSpring(1, springs.smooth));
      feedback.file();
    }
    prev.current = count;
  }, [count, s]);
  const anim = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  const c = areaColors[t.scheme][area];
  return (
    <Animated.View style={[styles.tile, { backgroundColor: t.surface2 }, anim]}>
      <Text variant="callout" style={{ fontFamily: 'Inter_600SemiBold' }}>
        {AREA_LABEL[area]}
      </Text>
      <Callout tone="ink2" style={{ fontSize: 11.5 }}>
        {count ? `${count} new` : '—'}
      </Callout>
      <View style={{ position: 'absolute', left: 0, bottom: 0, height: 2, width: `${Math.min(100, count * 50)}%`, backgroundColor: c }} />
    </Animated.View>
  );
}

/* ───────────────────────── Chat pieces ───────────────────────── */

export function UserBubble({ text, look }: { text: string; /** V26 (board `bubble`): white with a shadow, the bottom-right corner tucked. */ look?: 'v26' }) {
  const t = useTokens();
  if (look === 'v26') return <ChatBubble text={text} />;
  return (
    <View style={[styles.bubble, { backgroundColor: t.surface2 }]}>
      <Text variant="body">{text}</Text>
    </View>
  );
}

/** life never uses a bubble (DESIGN §18): two-tone prose, at most one card, up to 4 chips. */
export function LifeReply({ segments, card, chips, onChip, thinking, look }: { segments?: TwoToneSegment[]; card?: ReactNode; chips?: string[]; onChip?: (c: string) => void; thinking?: boolean; /** V26: the one orb family (`LifeOrb`) in place of the dotted orb. */ look?: 'v26' }) {
  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {look === 'v26' ? <LifeOrb size={20} state={thinking ? 'thinking' : 'ring'} /> : <DottedOrb size={20} state={thinking ? 'thinking' : 'idle'} />}
        <Callout tone="ink2">{thinking ? 'life is thinking…' : 'life'}</Callout>
      </View>
      {segments && !thinking ? <TwoTone segments={segments} size="headline" /> : null}
      {card && !thinking ? <Animated.View entering={FadeIn}>{card}</Animated.View> : null}
      {chips && chips.length && !thinking ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {chips.slice(0, 4).map((c) => (
            <SuggestionChip key={c} label={c} onPress={() => onChip?.(c)} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function SuggestionChip({ label, onPress }: { label: string; onPress: () => void }) {
  const t = useTokens();
  return (
    <Press haptic="select" onPress={onPress} style={[styles.chip, { backgroundColor: t.surface2 }]}>
      <Callout>{label}</Callout>
    </Press>
  );
}

/** "Save this to Work as a decision?" — the conversation always leaves something behind (DESIGN §21). */
export function FileCard({ prompt, savedText, onSave }: { prompt: string; savedText: string; onSave: () => void }) {
  const t = useTokens();
  const [saved, setSaved] = useState(false);
  return (
    <View style={[styles.file, { backgroundColor: t.surface2 }]}>
      {saved ? (
        <Ionicons name="checkmark-circle" size={22} color={t.gain} />
      ) : (
        <DottedOrb size={20} />
      )}
      <Callout style={{ flex: 1 }}>{saved ? savedText : prompt}</Callout>
      {saved ? null : (
        <Press
          haptic="select"
          onPress={() => {
            setSaved(true);
            feedback.complete();
            onSave();
          }}
          style={[styles.chip, { backgroundColor: t.ink, borderColor: t.ink }]}
        >
          <Callout style={{ color: t.canvas }}>Save</Callout>
        </Press>
      )}
    </View>
  );
}

/* ───────────────────────── Composer ───────────────────────── */

export function Composer({ value, onChangeText, onSend, onTalk, onAttach, placeholder = 'Message', disabled = false, hasAttachments = false }: { value: string; onChangeText: (v: string) => void; onSend: () => void; onTalk?: () => void; onAttach?: () => void; placeholder?: string; disabled?: boolean; hasAttachments?: boolean }) {
  const t = useTokens();
  const readyToSend = value.trim().length > 0 || hasAttachments;
  return (
    <View style={[styles.composer, { backgroundColor: t.surface2 }]}>
      {onAttach ? (
        <Press haptic="select" onPress={onAttach} accessibilityLabel="Attach" disabled={disabled} style={styles.cIcon}>
          <Ionicons name="add" size={22} color={t.ink2} />
        </Press>
      ) : null}
      <TextInput maxFontSizeMultiplier={1.3}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={t.inkQuiet}
        style={{ flex: 1, fontFamily: 'Inter_400Regular', fontSize: 16, color: t.ink, paddingVertical: 10 }}
        onSubmitEditing={() => !disabled && readyToSend && onSend()}
        editable={!disabled}
        returnKeyType="send"
        accessibilityLabel={placeholder}
      />
      <Press haptic="primary" onPress={() => readyToSend ? onSend() : onTalk?.()} disabled={disabled || (!readyToSend && !onTalk)} accessibilityLabel={readyToSend ? 'Send' : 'Talk'} style={[styles.cIcon, { backgroundColor: t.ink, borderRadius: 12 }]}>
        <Ionicons name={readyToSend ? 'arrow-up' : 'mic'} size={19} color={t.canvas} />
      </Press>
    </View>
  );
}

/* ───────────────────────── AttachMenu (solid dim, no blur §43) ───────────────────────── */

export type AttachOption = { key: string; title: string; sub?: string; icon: keyof typeof Ionicons.glyphMap };

export function AttachMenu({ visible, options, onPick, onClose }: { visible: boolean; options: AttachOption[]; onPick: (key: string) => void; onClose: () => void }) {
  const t = useTokens();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[StyleSheet.absoluteFill, { backgroundColor: t.scheme === 'dark' ? 'rgba(0,0,0,0.55)' : 'rgba(13,14,16,0.3)' }]} onPress={onClose} accessibilityLabel="Close attach menu" />
      <View style={[styles.attach, { backgroundColor: t.surface }]}>
        {options.map((o, i) => (
          <Animated.View key={o.key} entering={FadeInDown.delay(i * 40).springify().dampingRatio(1).duration(320)}>
            <Press
              haptic="open"
              onPress={() => {
                onPick(o.key);
                onClose();
              }}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10 }}
            >
              <View style={[styles.cIcon, { backgroundColor: t.ink, borderRadius: 11 }]}>
                <Ionicons name={o.icon} size={17} color={t.canvas} />
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <Text variant="title">{o.title}</Text>
                {o.sub ? <Callout tone="ink2">{o.sub}</Callout> : null}
              </View>
            </Press>
          </Animated.View>
        ))}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  mic: { width: 74, height: 74, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  tray: { marginHorizontal: 14, borderRadius: 20, padding: 14 },
  tile: { width: '32%', flexGrow: 1, borderRadius: 11, paddingVertical: 9, paddingHorizontal: 10, gap: 3, overflow: 'hidden' },
  bubble: { alignSelf: 'flex-end', maxWidth: '82%', borderRadius: 16, paddingVertical: 11, paddingHorizontal: 14 },
  chip: { height: 36, paddingHorizontal: 14, borderRadius: radius.sm, justifyContent: 'center' },
  file: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.lg, padding: 14 },
  composer: { flexDirection: 'row', alignItems: 'center', gap: 6, minHeight: 52, borderRadius: 16, paddingHorizontal: 6 },
  cIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  attach: { position: 'absolute', left: 14, right: 14, bottom: 110, borderRadius: radius.lg, paddingHorizontal: 16, paddingVertical: 8 },
});
