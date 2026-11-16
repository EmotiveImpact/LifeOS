import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { SceneView } from '../../learn/scene/SceneView';
export { SceneView };
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Text } from '../Text';
import { Press } from '../Press';
import { useCalmMotion, useTokens } from '../theme';
import { durations, fonts, motion, radius, space } from '../tokens';
import { feedback } from '../feedback';
import { Button, Card, ChoiceCard, StatusPill } from './Surfaces';
import { Waveform } from './Talk';
import { LifeOrb } from './Orb';
import { Slider } from './Controls';

export function LessonBar({ count = 3, current = 0 }: { count?: number; current?: number }) {
  const t = useTokens();
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: count, now: current + 1 }} style={{ flexDirection: 'row', gap: space.xxs, width: '100%' }}>{Array.from({ length: count }, (_, i) => <View key={i} style={{ flex: 1, height: 3, borderRadius: radius.full, backgroundColor: i === current ? t.ember : i < current ? t.ink : t.surface3 }} />)}</View>;
}
export function LessonPicture({ kind = 'parts', labels, values, notes }: { kind?: 'parts' | 'flow' | 'compare' | 'cycle' | 'layers'; labels: string[]; values?: string[]; notes?: string[] }) {
  const t = useTokens(), calm = useCalmMotion();
  if (kind === 'parts' && labels.length === 2 && values?.length === 2) return <Card style={{ gap: space.md, alignItems: 'center', paddingVertical: space.xl }}><View style={{ flexDirection: 'row', gap: space.xs, alignItems: 'flex-end' }}>{values.map((value, i) => <View key={value} style={{ alignItems: 'center', gap: space.xs }}><Text variant="diagramCode" tone={i ? 'ember' : 'ink'}>{value}</Text><View style={{ width: '100%', height: 2, borderRadius: radius.full, backgroundColor: i ? t.ember : t.gain }} /></View>)}</View><View style={{ flexDirection: 'row', width: '100%', gap: space.md }}>{labels.map((label, i) => <View key={label} style={{ flex: 1, gap: space.xxs, alignItems: 'center' }}><Text variant="callout" tone={i ? 'ember' : 'ink'} style={{ fontFamily: fonts.sansSemibold }}>{label}</Text>{notes?.[i] ? <Text variant="callout" tone="ink2">{notes[i]}</Text> : null}</View>)}</View></Card>;
  if (kind === 'flow') return <Card style={{ gap: space.xs }}>{labels.map((label, i) => <View key={label} style={{ gap: space.xs }}><Animated.View entering={calm ? FadeIn.duration(durations.quick) : FadeInDown.delay(i * motion.stagger).springify().duration(motion.rise.duration)} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm, paddingVertical: space.sm, paddingHorizontal: space.sm, borderRadius: radius.md, backgroundColor: i === 1 ? t.emberTint : t.surface2 }}><Text variant="body" style={{ flex: 1 }}>{label}</Text><Text variant="mono" tone={i === 1 ? 'ember' : 'ink2'}>{values?.[i] ?? ''}</Text></Animated.View>{i < labels.length - 1 ? <Text variant="callout" tone="ink2" align="center">↓</Text> : null}</View>)}</Card>;
  if (kind === 'compare') return <View style={{ flexDirection: 'row', gap: space.xs }}>{labels.map((label, i) => <Card key={label} style={{ flex: 1, gap: space.xs }}><StatusPill kind={i === 0 ? 'done' : 'live'} label={label} /><Text variant="headline">{values?.[i] ?? label}</Text>{notes?.[i] ? <Text variant="callout" tone="ink2">{notes[i]}</Text> : null}</Card>)}</View>;
  if (kind === 'cycle') return <SceneView device="cycle" labels={labels} />;
  return <View style={{ backgroundColor: t.surface2, padding: space.lg, borderRadius: radius.md, minHeight: 176, justifyContent: 'center', gap: space.sm }}>
    <View style={{ flexDirection: kind === 'layers' ? 'column' : 'row', alignItems: 'center', gap: space.xs }}>{labels.map((l, i) => <Animated.View key={l} entering={calm ? FadeIn.duration(durations.quick) : FadeInDown.delay(i * 120).springify().duration(motion.rise.duration)} style={{ flex: kind === 'layers' ? undefined : 1, width: kind === 'layers' ? '100%' : undefined, gap: space.xs, alignItems: 'center' }}>
      <View style={{ width: '100%', height: 64, backgroundColor: i === 1 ? t.emberTint : t.surface3, borderRadius: radius.sm, justifyContent: 'center', padding: space.xs }}><Text variant="title" align="center">{values?.[i] ?? l}</Text></View>{values?.[i] ? <Text variant="callout" tone="ink2" align="center">{l}</Text> : null}
    </Animated.View>)}</View>
  </View>;
}
export function GuessReveal({ question, options, answer, why, children, onAnswer }: { question: string; options: string[]; answer: number; why: string; children?: React.ReactNode; onAnswer?: (correct: boolean) => void }) {
  const t = useTokens(), [picked, setPicked] = useState<number | null>(null);
  return <Card style={{ gap: space.sm }}><Text variant="callout" tone="ember">Your guess</Text><Text variant="body">{question}</Text><View style={{ flexDirection: 'row', gap: space.xs }}>{options.map((option, i) => <Press key={option} onPress={() => { if (picked !== null) return; setPicked(i); feedback[i === answer ? 'complete' : 'select'](); onAnswer?.(i === answer); }} accessibilityRole="radio" accessibilityState={{ selected: picked === i }} accessibilityLabel={option} style={{ flex: 1, minHeight: 44, paddingHorizontal: space.sm, borderRadius: radius.sm, backgroundColor: picked === i ? t.ink : t.surface2, justifyContent: 'center', alignItems: 'center' }}><Text variant="callout" style={{ color: picked === i ? t.canvas : t.ink }}>{option}</Text></Press>)}</View>{picked !== null ? <Animated.View entering={FadeIn.duration(durations.quick)} style={{ gap: space.sm }}><StatusPill kind={picked === answer ? 'done' : 'neutral'} label={picked === answer ? 'That’s it' : 'Now you know'} />{children}<Text variant="body" tone="ink2">{why}</Text></Animated.View> : null}</Card>;
}
export type PuzzleKind = 'true_false' | 'choose' | 'fill_gap' | 'order' | 'match';
export function LessonPuzzle({ kind = 'choose', prompt, options = [], answer, why, onAnswer }: { kind?: PuzzleKind; prompt: string; options?: string[]; answer: string | number | string[]; why: string; onAnswer?: (correct: boolean) => void }) {
  const t = useTokens(), [picked, setPicked] = useState<string[]>([]), [text, setText] = useState(''), [revealed, setRevealed] = useState(false);
  const choices = kind === 'true_false' ? ['True', 'False'] : options;
  const expected = typeof answer === 'number' ? [choices[answer]] : Array.isArray(answer) ? answer : [answer];
  const correct = kind === 'fill_gap' ? text.trim().toLowerCase() === expected[0]?.toLowerCase() : picked.join('|') === expected.join('|');
  if (kind === 'match') return <MatchPuzzle prompt={prompt} options={options} answer={expected} why={why} onAnswer={onAnswer} />;
  const check = () => { setRevealed(true); feedback[correct ? 'complete' : 'select'](); onAnswer?.(correct); };
  return <View style={{ gap: space.sm }}><Text variant="headline">{prompt}</Text>
    {kind === 'fill_gap' ? <TextInput value={text} onChangeText={setText} editable={!revealed} accessibilityLabel="Your answer" placeholder="Your answer" placeholderTextColor={t.inkQuiet} style={{ padding: space.md, borderRadius: radius.md, backgroundColor: t.surface2, color: t.ink, fontFamily: fonts.sans, fontSize: 15 }} /> : choices.map((v, i) => <Press key={v} onPress={() => { if (revealed) return; setPicked(kind === 'order' ? picked.includes(v) ? picked.filter(p => p !== v) : [...picked, v] : [v]); }} accessibilityRole="radio" accessibilityState={{ selected: picked.includes(v) }} accessibilityLabel={v} style={{ padding: space.md, borderRadius: radius.md, backgroundColor: revealed && expected.includes(v) ? t.gainTint : picked.includes(v) ? t.ink : t.surface }}><Text variant="body" style={{ color: !revealed && picked.includes(v) ? t.canvas : t.ink }}>{kind === 'order' && picked.includes(v) ? `${picked.indexOf(v) + 1}. ` : ''}{v}{revealed && expected.includes(v) ? ' ✓' : ''}</Text></Press>)}
    {revealed ? <View style={{ gap: space.xs }}><StatusPill kind={correct ? 'done' : 'neutral'} label={correct ? 'You’ve got it' : 'Here’s how it works'} /><Text variant="body" tone="ink2">{why}</Text></View> : <Button variant="secondary" label="Check my answer" onPress={check} disabled={kind === 'fill_gap' ? !text.trim() : !picked.length} />}
  </View>;
}
function MatchPuzzle({ prompt, options, answer, why, onAnswer }: { prompt: string; options: string[]; answer: string[]; why: string; onAnswer?: (correct: boolean) => void }) {
  const tokens = useTokens(), [left, setLeft] = useState<string | null>(null), [pairs, setPairs] = useState<Record<string, string>>({}), [revealed, setRevealed] = useState(false);
  const entries = options.map(option => { const bits = option.split(/\s*→\s*/); return { left: bits[0], right: bits[1] ?? bits[0] }; });
  const expected = answer.map(v => v.replace(/\s*→\s*/g, '→'));
  const correct = entries.every(entry => expected.includes(`${entry.left}→${pairs[entry.left]}`));
  const chooseRight = (value: string) => { if (!left || revealed) return; setPairs(current => ({ ...current, [left]: value })); setLeft(null); };
  return <View style={{ gap: space.sm }}><Text variant="headline">{prompt}</Text><View style={{ flexDirection: 'row', gap: space.sm }}><View style={{ flex: 1, gap: space.xs }}>{entries.map(entry => <Press key={entry.left} disabled={revealed} onPress={() => setLeft(entry.left)} accessibilityLabel={`Match ${entry.left}`} accessibilityState={{ selected: left === entry.left }} style={{ minHeight: 48, padding: space.sm, borderRadius: radius.md, backgroundColor: left === entry.left ? tokens.ink : tokens.surface }}><Text variant="body" style={{ color: left === entry.left ? tokens.canvas : tokens.ink }}>{entry.left}</Text>{pairs[entry.left] ? <Text variant="callout" tone="ink2">{`→ ${pairs[entry.left]}`}</Text> : null}</Press>)}</View><View style={{ flex: 1, gap: space.xs }}>{[...entries].reverse().map(entry => <Press key={entry.right} onPress={() => chooseRight(entry.right)} disabled={!left || revealed} accessibilityLabel={`Pair with ${entry.right}`} style={{ minHeight: 48, padding: space.sm, borderRadius: radius.md, backgroundColor: tokens.surface2 }}><Text variant="body">{entry.right}</Text></Press>)}</View></View>{revealed ? <><StatusPill kind={correct ? 'done' : 'neutral'} label={correct ? 'You’ve got it' : 'Here’s how they fit'} /><RecapList lines={answer} /><Text variant="body" tone="ink2">{why}</Text></> : <Button variant="secondary" label="Check my matches" disabled={Object.keys(pairs).length < entries.length} onPress={() => { setRevealed(true); feedback[correct ? 'complete' : 'select'](); onAnswer?.(correct); }} />}</View>;
}

export function RecapList({ lines }: { lines: string[] }) {
  const calm = useCalmMotion();
  return <View style={{ gap: space.md }}>{lines.map((line, i) => <Animated.View key={line} entering={calm ? FadeIn.duration(durations.quick) : FadeInDown.delay(i * 650).springify().duration(motion.smooth.duration)} style={{ flexDirection: 'row', gap: space.sm }}><Text variant="title" tone="gain">✓</Text><Text variant="body" style={{ flex: 1 }}>{line}</Text></Animated.View>)}</View>;
}
export function TellBack({ value, onChangeText, question, listening = false }: { value: string; onChangeText: (v: string) => void; question: string; listening?: boolean }) {
  const t = useTokens();
  return <View style={{ gap: space.sm }}><View style={{ alignSelf: 'flex-end', maxWidth: '88%', width: '88%', padding: space.md, borderRadius: radius.md, backgroundColor: t.surface2 }}><TextInput value={value} onChangeText={onChangeText} multiline placeholder="Tell it in your own words…" placeholderTextColor={t.ink2} accessibilityLabel="Your explanation" style={{ color: t.ink, fontFamily: fonts.sans, fontSize: 15, lineHeight: 22, minHeight: 96 }} /></View><View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: space.sm }}><LifeOrb size={22} state={listening ? 'listening' : 'ring'} /><Text variant="body" tone="ink2" style={{ flex: 1 }}>{question}</Text></View>{listening ? <Waveform active /> : null}</View>;
}
export function GapCard({ quote, strength, gap, explanation }: { quote: string; strength: string; gap: string; explanation: string }) {
  const [shown, setShown] = useState(false);
  return <View style={{ gap: space.sm }}><Card style={{ gap: space.xs }}><Text variant="callout" tone="gain">What you explained well</Text><Text variant="headline">{`“${quote}”`}</Text><Text variant="body" tone="ink2">{strength}</Text></Card><Card style={{ gap: space.sm }}><Text variant="callout" tone="ink2">One bit to make clearer</Text><Text variant="body">{gap}</Text>{shown ? <><Text variant="body" tone="ink2">{explanation}</Text><Text variant="title">Now tell me in your own words.</Text></> : <Button variant="secondary" label="Show me" onPress={() => setShown(true)} />}</Card></View>;
}
export function LikertScale({ value, onChange, labels = ['Strongly disagree', 'Disagree', 'Neither', 'Agree', 'Strongly agree'] }: { value: number | null; onChange: (n: number) => void; labels?: string[] }) {
  const t = useTokens();
  return <View style={{ gap: space.xs }}>{labels.map((label, i) => <Press key={label} onPress={() => onChange(i)} accessibilityRole="radio" accessibilityState={{ selected: value === i }} accessibilityLabel={label} style={{ padding: space.md, minHeight: 50, borderRadius: radius.md, backgroundColor: value === i ? t.ink : t.surface }}><Text variant="body" style={{ color: value === i ? t.canvas : t.ink }}>{label}</Text></Press>)}</View>;
}
export function TraitBar({ name, value, average = 50, meaning }: { name: string; value: number; average?: number; meaning: string }) {
  const t = useTokens();
  return <View style={{ gap: space.xs }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="title">{name}</Text><Text variant="callout" tone="ink2">{`${value} / 100`}</Text></View><View style={{ height: 8, backgroundColor: t.surface2, borderRadius: radius.full }}><View style={{ height: 8, width: `${value}%`, backgroundColor: t.ink, borderRadius: radius.full }} /><View style={{ position: 'absolute', left: `${average}%`, top: -3, width: 2, height: 14, backgroundColor: t.ink2 }} /></View><Text variant="callout" tone="ink2">{meaning}</Text></View>;
}
