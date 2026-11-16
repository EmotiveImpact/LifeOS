import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import Svg, { Circle, Path, Rect, Text as SvgText } from 'react-native-svg';
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
export function LessonPicture({ kind = 'parts', labels, values }: { kind?: 'parts' | 'flow' | 'compare' | 'cycle' | 'layers'; labels: string[]; values?: string[] }) {
  const t = useTokens(), calm = useCalmMotion();
  if (kind === 'cycle') return <SceneView device="cycle" labels={labels} />;
  return <View style={{ backgroundColor: t.surface2, padding: space.lg, borderRadius: radius.md, minHeight: 176, justifyContent: 'center', gap: space.sm }}>
    <View style={{ flexDirection: kind === 'layers' ? 'column' : 'row', alignItems: 'center', gap: space.xs }}>{labels.map((l, i) => <Animated.View key={l} entering={calm ? FadeIn.duration(durations.quick) : FadeInDown.delay(i * 120).springify().duration(motion.rise.duration)} style={{ flex: kind === 'layers' ? undefined : 1, width: kind === 'layers' ? '100%' : undefined, gap: space.xs, alignItems: 'center' }}>
      <View style={{ width: '100%', height: kind === 'compare' ? 48 + i * 36 : 64, backgroundColor: i === 1 ? t.emberTint : t.surface3, borderRadius: radius.sm, justifyContent: 'center', padding: space.xs }}><Text variant="title" align="center">{values?.[i] ?? l}</Text></View>{values?.[i] ? <Text variant="callout" tone="ink2" align="center">{l}</Text> : null}
    </Animated.View>)}</View>
    {kind === 'flow' ? <Text variant="callout" tone="ink2" align="center">{labels.join(' → ')}</Text> : null}
  </View>;
}
export function GuessReveal({ question, options, answer, why, children, onAnswer }: { question: string; options: string[]; answer: number; why: string; children?: React.ReactNode; onAnswer?: (correct: boolean) => void }) {
  const [picked, setPicked] = useState<number | null>(null);
  return <View style={{ gap: space.sm }}><Text variant="headline">{question}</Text>{options.map((o, i) => <ChoiceCard key={o} title={o} selected={picked === i} onPress={() => { if (picked !== null) return; setPicked(i); feedback[i === answer ? 'complete' : 'select'](); onAnswer?.(i === answer); }} />)}{picked !== null ? <Animated.View entering={FadeIn.duration(durations.quick)} style={{ gap: space.sm }}><StatusPill kind={picked === answer ? 'done' : 'neutral'} label={picked === answer ? 'That’s it' : 'Now you know'} />{children}<Text variant="body" tone="ink2">{why}</Text></Animated.View> : null}</View>;
}
export type PuzzleKind = 'true_false' | 'choose' | 'fill_gap' | 'order' | 'match';
export function LessonPuzzle({ kind = 'choose', prompt, options = [], answer, why, onAnswer }: { kind?: PuzzleKind; prompt: string; options?: string[]; answer: string | number | string[]; why: string; onAnswer?: (correct: boolean) => void }) {
  const t = useTokens(), [picked, setPicked] = useState<string[]>([]), [text, setText] = useState(''), [revealed, setRevealed] = useState(false);
  const choices = kind === 'true_false' ? ['True', 'False'] : options;
  const expected = typeof answer === 'number' ? [choices[answer]] : Array.isArray(answer) ? answer : [answer];
  const correct = kind === 'fill_gap' ? text.trim().toLowerCase() === expected[0]?.toLowerCase() : picked.join('|') === expected.join('|');
  const check = () => { setRevealed(true); feedback[correct ? 'complete' : 'select'](); onAnswer?.(correct); };
  return <View style={{ gap: space.sm }}><Text variant="headline">{prompt}</Text>
    {kind === 'fill_gap' ? <TextInput value={text} onChangeText={setText} editable={!revealed} accessibilityLabel="Your answer" placeholder="Your answer" placeholderTextColor={t.inkQuiet} style={{ padding: space.md, borderRadius: radius.md, backgroundColor: t.surface2, color: t.ink, fontFamily: fonts.sans, fontSize: 15 }} /> : choices.map((v, i) => <Press key={v} onPress={() => { if (revealed) return; setPicked(kind === 'order' || kind === 'match' ? picked.includes(v) ? picked.filter(p => p !== v) : [...picked, v] : [v]); }} accessibilityRole="radio" accessibilityState={{ selected: picked.includes(v) }} accessibilityLabel={v} style={{ padding: space.md, borderRadius: radius.md, backgroundColor: revealed && expected.includes(v) ? t.gainTint : picked.includes(v) ? t.ink : t.surface }}><Text variant="body" style={{ color: !revealed && picked.includes(v) ? t.canvas : t.ink }}>{kind === 'order' && picked.includes(v) ? `${picked.indexOf(v) + 1}. ` : ''}{v}{revealed && expected.includes(v) ? ' ✓' : ''}</Text></Press>)}
    {revealed ? <View style={{ gap: space.xs }}><StatusPill kind={correct ? 'done' : 'neutral'} label={correct ? 'You’ve got it' : 'Here’s how it works'} /><Text variant="body" tone="ink2">{why}</Text></View> : <Button variant="secondary" label="Check my answer" onPress={check} disabled={kind === 'fill_gap' ? !text.trim() : !picked.length} />}
  </View>;
}
export function RecapList({ lines }: { lines: string[] }) {
  const calm = useCalmMotion();
  return <View style={{ gap: space.md }}>{lines.map((line, i) => <Animated.View key={line} entering={calm ? FadeIn.duration(durations.quick) : FadeInDown.delay(i * 650).springify().duration(motion.smooth.duration)} style={{ flexDirection: 'row', gap: space.sm }}><Text variant="title" tone="gain">✓</Text><Text variant="body" style={{ flex: 1 }}>{line}</Text></Animated.View>)}</View>;
}
export function TellBack({ value, onChangeText, question, listening = false }: { value: string; onChangeText: (v: string) => void; question: string; listening?: boolean }) {
  const t = useTokens();
  return <View style={{ gap: space.xl }}><View style={{ alignItems: 'center', gap: space.sm }}><LifeOrb size={96} state={listening ? 'listening' : 'ring'} /><Waveform active={listening} /></View><TextInput value={value} onChangeText={onChangeText} multiline placeholder="Tell it in your own words…" placeholderTextColor={t.inkQuiet} accessibilityLabel="Your explanation" style={{ color: t.ink, fontFamily: fonts.sansMedium, fontSize: 24, lineHeight: 31, minHeight: 150 }} /><Text variant="body" tone="ink2">{question}</Text></View>;
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
/** Track A scene renderer: board devices only; full 30-device Skia kit is Track B. */
export function SceneView({ device = 'flow', labels = ['Your pay', 'Tax-free part', 'Taxed at 20%'], values, handDrawn = false, progress = 1 }: { device?: string; labels?: string[]; values?: string[]; handDrawn?: boolean; progress?: number }) {
  const t = useTokens(), [replay, setReplay] = useState(0), calm = useCalmMotion();
  const ink = t.ink, ember = t.ember, lab = t.ink2;
  const wobble = (x: number, y: number, seed: number) => handDrawn ? y + .55 * Math.sin(x * .085 + seed) + .25 * Math.sin(x * .21 + seed * 1.7) : y;
  const line = (x1: number, y1: number, x2: number, y2: number) => { const n = 20; return Array.from({ length: n + 1 }, (_, i) => { const u = i / n, x = x1 + (x2 - x1) * u, y = y1 + (y2 - y1) * u; return `${i ? 'L' : 'M'}${x},${wobble(x, y, y1 * .07)}`; }).join(' '); };
  const label = (text: string, x: number, y: number) => <SvgText key={`${text}-${x}-${y}`} x={x} y={y} fill={lab} fontFamily={fonts.sansMedium} fontSize={11} textAnchor="middle">{text}</SvgText>;
  const flow = !['cycle', 'compare', 'layers', 'timeline', 'venn', 'funnel', 'things'].includes(device);
  return <Press onPress={() => setReplay(v => v + 1)} accessibilityLabel={`${device} diagram. ${labels.join(', ')}. Tap to replay.`} style={{ backgroundColor: t.surface2, borderRadius: radius.md, overflow: 'hidden' }}><Animated.View key={replay} entering={FadeIn.duration(calm ? durations.quick : 420)}><Svg width="100%" height={176} viewBox="0 0 300 176">
    {flow ? labels.slice(0, 3).map((l, i) => <ViewSvg key={l}><Rect x={18 + i * 94} y={62} width={76} height={52} rx={5} stroke={i === 1 ? ember : ink} strokeWidth={1.6} fill="none" opacity={progress >= i / 3 ? 1 : .15} />{label(l, 56 + i * 94, 82)}{values?.[i] ? label(values[i], 56 + i * 94, 101) : null}{i < 2 ? <Path d={line(98 + i * 94, 88, 108 + i * 94, 88)} stroke={ink} strokeWidth={1.6} fill="none" /> : null}</ViewSvg>) : null}
    {device === 'cycle' ? <><Circle cx={150} cy={88} r={52} stroke={ink} strokeWidth={1.6} fill="none" opacity={.4} />{(labels.length ? labels : ['Cue', 'Routine', 'Reward', 'Craving']).slice(0, 4).map((l, i) => { const a = -Math.PI / 2 + i / 4 * Math.PI * 2, x = 150 + Math.cos(a) * 52, y = 88 + Math.sin(a) * 52; return <ViewSvg key={l}><Circle cx={x} cy={y} r={i === 1 ? 5 : 3.5} fill={i === 1 ? ember : ink} />{label(l, x + Math.cos(a) * 26, y + Math.sin(a) * 18)}</ViewSvg>; })}</> : null}
    {device === 'compare' ? labels.slice(0, 2).map((l, i) => <ViewSvg key={l}><Rect x={50 + i * 120} y={40 + i * 12} width={72} height={98 - i * 12} rx={5} fill="none" stroke={i ? ember : ink} strokeWidth={1.6} />{label(l, 86 + i * 120, 156)}{values?.[i] ? label(values[i], 86 + i * 120, 32 + i * 12) : null}</ViewSvg>) : null}
    {device === 'layers' ? labels.map((l, i) => <ViewSvg key={l}><Rect x={60} y={118 - i * 36} width={180} height={30} rx={5} fill="none" stroke={i === 2 ? ember : ink} strokeWidth={1.6} />{label(l, 150, 137 - i * 36)}</ViewSvg>) : null}
    {device === 'timeline' ? <><Path d={line(24, 96, 276, 96)} stroke={ink} strokeWidth={1.6} />{labels.map((l, i) => <ViewSvg key={l}><Circle cx={40 + i * 72} cy={96} r={i === 2 ? 4.5 : 3} fill={i === 2 ? ember : ink} />{label(l, 40 + i * 72, 118)}</ViewSvg>)}</> : null}
    {device === 'venn' ? <><Circle cx={122} cy={88} r={52} stroke={ink} strokeWidth={1.6} fill="none" /><Circle cx={178} cy={88} r={52} stroke={ink} strokeWidth={1.6} fill="none" />{label(labels[0] ?? 'What you love', 90, 28)}{label(labels[1] ?? 'What pays', 210, 28)}<Circle cx={150} cy={88} r={8} fill={ember} /></> : null}
    {device === 'funnel' ? labels.map((l, i) => <ViewSvg key={l}><Path d={line(40 + i * 28, 28 + i * 32, 260 - i * 28, 28 + i * 32)} stroke={i === labels.length - 1 ? ember : ink} strokeWidth={1.6} />{label(l, 150, 44 + i * 32)}</ViewSvg>) : null}
    {device === 'things' ? <><Circle cx={54} cy={84} r={22} stroke={ink} fill="none" strokeWidth={1.6} /><Circle cx={54} cy={84} r={16} stroke={ink} fill="none" strokeWidth={1.6} /><Path d="M90 84 L120 54 L150 84 M98 76 L98 110 L142 110 L142 76 M114 110 L114 92 L126 92 L126 110" stroke={ember} fill="none" strokeWidth={1.6} strokeLinecap="round" /><Circle cx={186} cy={64} r={7} stroke={ink} fill="none" strokeWidth={1.6} /><Path d="M186 72 L186 98 M174 84 L186 77 L198 84 M176 116 L186 98 L196 116" stroke={ink} strokeWidth={1.6} fill="none" /><Circle cx={250} cy={84} r={25} stroke={ink} fill="none" strokeWidth={1.6} /><Path d="M250 68 L250 84 L262 89" stroke={ink} strokeWidth={1.6} fill="none" /></> : null}
  </Svg></Animated.View></Press>;
}
function ViewSvg({ children }: { children: React.ReactNode }) { return <>{children}</>; }
