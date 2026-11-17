import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type ImageSourcePropType } from 'react-native';
import { Icon as Ionicons } from '../Icon';
import Animated, { Easing, cancelAnimation, useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { Text } from '../Text';
import { Press } from '../Press';
import { feedback } from '../feedback';
import { useCalmMotion, useTokens } from '../theme';
import { areaColors, durations, palette, radius, space, type Area } from '../tokens';
import { Card, StatusPill } from './Surfaces';
import { LifeOrb, type OrbState } from './Orb';
import { TrendLine } from './Charts';

export function ChatIsland({ expanded = false, state = 'thinking', label = 'Checking your tax code…', sub = 'Your records stay on this phone' }: { expanded?: boolean; state?: OrbState; label?: string; sub?: string }) {
  const t = useTokens();
  return <Card style={{ alignSelf: 'center', width: expanded ? '100%' : undefined, borderRadius: expanded ? radius.lg : radius.full }}><View style={s.row}><LifeOrb size={expanded ? 54 : 24} state={state} /><View style={{ flex: expanded ? 1 : undefined, gap: space.xxs }}><Text variant="callout">{label}</Text>{expanded ? <Text variant="callout" tone="ink2">{sub}</Text> : null}</View></View></Card>;
}
export function SearchField({ value, onChangeText, placeholder = 'Search everything', onVoice }: { value: string; onChangeText: (v: string) => void; placeholder?: string; onVoice?: () => void }) {
  const t = useTokens();
  return <View style={[s.row, { paddingHorizontal: space.sm, backgroundColor: t.surface2, borderRadius: radius.md }]}><Ionicons name="search" size={18} color={t.ink2} /><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={t.inkQuiet} accessibilityLabel={placeholder} style={{ flex: 1, color: t.ink, fontFamily: 'Inter_400Regular', fontSize: 15, minHeight: 48 }} returnKeyType="search" />{value ? <Press onPress={() => onChangeText('')} accessibilityLabel="Clear search" style={s.icon}><Ionicons name="close-circle" size={18} color={t.ink2} /></Press> : onVoice ? <Press onPress={onVoice} accessibilityLabel="Search by voice" style={s.icon}><Ionicons name="mic-outline" size={18} color={t.ink2} /></Press> : null}</View>;
}
export function Skeleton({ width = '100%', height = 20, rounded = radius.sm }: { width?: number | `${number}%`; height?: number; rounded?: number }) {
  const t = useTokens(), calm = useCalmMotion(), opacity = useSharedValue(.5);
  useEffect(() => { opacity.value = calm ? .7 : withRepeat(withTiming(1, { duration: 1000 }), -1, true); }, [calm, opacity]);
  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View accessibilityLabel="Loading" style={[{ width, height, borderRadius: rounded, backgroundColor: t.surface3 }, style]} />;
}
export function SheetOverImage({ onClose }: { onClose: () => void }) {
  const t = useTokens();
  return <View style={{ height: 56, alignItems: 'center', justifyContent: 'flex-start', paddingTop: space.xs }}><View style={{ width: 36, height: 5, borderRadius: radius.full, backgroundColor: t.paper }} /><Press onPress={onClose} accessibilityLabel="Close" style={[s.icon, { position: 'absolute', right: space.lg, top: space.xs, backgroundColor: palette.dark.canvas, borderRadius: radius.md }]}><Ionicons name="close" size={20} color={t.paper} /></Press></View>;
}
export function HonestyBadge({ kind = 'estimate' }: { kind?: 'estimate' | 'baseline' | 'validated' }) {
  return <StatusPill kind={kind === 'validated' ? 'done' : 'neutral'} label={kind === 'baseline' ? 'Personal baseline' : kind === 'validated' ? 'Validated' : 'Estimate'} />;
}
export function BarcodeFrame({ label = 'Line up the barcode', scanning = true }: { label?: string; scanning?: boolean }) {
  const t = useTokens(), calm = useCalmMotion(), y = useSharedValue(0);
  useEffect(() => { y.value = scanning && !calm ? withRepeat(withTiming(140, { duration: 1800, easing: Easing.inOut(Easing.sin) }), -1, true) : 70; }, [scanning, calm, y]);
  const style = useAnimatedStyle(() => ({ transform: [{ translateY: y.value }] }));
  return <View style={{ alignItems: 'center', gap: space.lg }}><View style={{ width: 280, height: 180, backgroundColor: t.surface2, borderRadius: radius.lg, overflow: 'hidden', padding: space.lg }}><View style={{ flexDirection: 'row', height: 140, justifyContent: 'space-around' }}>{Array.from({ length: 42 }, (_, i) => <View key={i} style={{ width: i % 3 === 0 ? 4 : 2, height: '100%', backgroundColor: t.ink, opacity: .65 }} />)}</View><Animated.View style={[{ position: 'absolute', top: space.lg, left: space.sm, right: space.sm, height: 2, backgroundColor: t.ember }, style]} /></View><Text variant="body" tone="ink2">{label}</Text></View>;
}
export function LabelScanOverlay({ rows, active = 0 }: { rows: string[]; active?: number }) {
  const t = useTokens();
  return <Card style={{ gap: space.xs }}>{rows.map((row, i) => <View key={row} style={{ backgroundColor: i === active ? t.emberTint : t.surface2, borderRadius: radius.xs, padding: space.sm }}><Text variant="body">{row}</Text></View>)}</Card>;
}
export const BREATH_PATTERNS = {
  'Physiological sigh': [{ label: 'Breathe in', seconds: 2, scale: .9 }, { label: 'A little more in', seconds: 1, scale: 1 }, { label: 'Long breath out', seconds: 6, scale: .65 }],
  'Box breathing': [{ label: 'Breathe in', seconds: 4, scale: 1 }, { label: 'Hold', seconds: 4, scale: 1 }, { label: 'Breathe out', seconds: 4, scale: .65 }, { label: 'Hold', seconds: 4, scale: .65 }],
  Resonance: [{ label: 'Breathe in', seconds: 5, scale: 1 }, { label: 'Breathe out', seconds: 5, scale: .65 }],
  '4-7-8': [{ label: 'Breathe in', seconds: 4, scale: 1 }, { label: 'Hold', seconds: 7, scale: 1 }, { label: 'Breathe out', seconds: 8, scale: .65 }],
  'Heart-rate down': [{ label: 'Breathe in', seconds: 5, scale: 1 }, { label: 'Breathe out slowly', seconds: 7, scale: .65 }],
} as const;
export type BreathProtocol = keyof typeof BREATH_PATTERNS;
export function BreathPacer({ active = true, secondsIn = 5, secondsOut = 5, protocol }: { active?: boolean; secondsIn?: number; secondsOut?: number; protocol?: BreathProtocol }) {
  const t = useTokens(), calm = useCalmMotion(), scale = useSharedValue(.65), [step, setStep] = useState(0);
  const phases = protocol ? BREATH_PATTERNS[protocol] : [{ label: 'Breathe in', seconds: secondsIn, scale: 1 }, { label: 'Breathe out', seconds: secondsOut, scale: .65 }];
  useEffect(() => {
    if (!active) { scale.value = .65; setStep(0); return; }
    if (!calm) scale.value = withRepeat(withSequence(...phases.map(phase => withTiming(phase.scale, { duration: phase.seconds * 1000, easing: Easing.inOut(Easing.sin) }))), -1, false);
    else scale.value = .82;
    let id: ReturnType<typeof setTimeout>;
    const turn = (index: number) => { setStep(index); feedback.select(); id = setTimeout(() => turn((index + 1) % phases.length), phases[index].seconds * 1000); };
    turn(0); return () => { clearTimeout(id); cancelAnimation(scale); };
  }, [active, calm, protocol, secondsIn, secondsOut, scale]);
  const style = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return <View style={{ height: 280, alignItems: 'center', justifyContent: 'center' }} accessible accessibilityLabel={active ? phases[step]?.label : 'Breathing paused'}><Animated.View style={[{ width: 240, height: 240, borderRadius: radius.full, backgroundColor: t.surface2, alignItems: 'center', justifyContent: 'center' }, style]}><LifeOrb size={96} state="ring" /></Animated.View><View style={{ position: 'absolute', bottom: 0 }}><Text variant="headline">{active ? phases[step]?.label : 'Ready when you are'}</Text></View></View>;
}
export function CalendarDay({ blocks }: { blocks: { at: string; title: string; sub?: string; free?: boolean; onPress?: () => void }[] }) {
  const t = useTokens();
  return <View style={{ gap: space.sm }}>{blocks.map(b => <View key={`${b.at}-${b.title}`} style={[s.row, { alignItems: 'flex-start' }]}><Text variant="callout" tone="ink2" style={{ width: 48, paddingTop: space.sm }}>{b.at}</Text><Card variant={b.free ? 'tile' : 'default'} onPress={b.onPress} accessibilityLabel={b.title} style={{ flex: 1, gap: space.xxs }}><Text variant="title">{b.title}</Text>{b.sub ? <Text variant="callout" tone="ink2">{b.sub}</Text> : null}</Card></View>)}</View>;
}
export function PersonAvatar({ name, area = 'you', size = 44 }: { name: string; area?: Area; size?: number }) {
  const t = useTokens();
  return <View accessibilityLabel={name} style={{ width: size, height: size, borderRadius: size * .3, backgroundColor: areaColors[t.scheme][area], alignItems: 'center', justifyContent: 'center' }}><Text variant={size > 60 ? 'numeralL' : 'title'} style={{ color: t.canvas }}>{name.trim().slice(0, 1).toUpperCase()}</Text></View>;
}
export function DateRow({ name, date, kind = 'birthday', countdown, detail, day, onPress }: { name: string; date: string; kind?: 'birthday' | 'anniversary' | 'memorial'; countdown?: string; detail?: string; day?: string; onPress?: () => void }) {
  return <Press onPress={onPress} accessibilityLabel={`${name}, ${kind}, ${date}`} style={[s.row, { paddingVertical: space.sm }]}>{day ? <Text variant="numeralL" align="center" style={{ width: 44 }}>{day}</Text> : <PersonAvatar name={name} area="home" />}<View style={{ flex: 1, gap: space.xxs }}><Text variant="title">{name}</Text><Text variant="callout" tone="ink2">{detail ?? `${kind[0].toUpperCase()}${kind.slice(1)} · ${date}`}</Text></View>{kind !== 'memorial' && countdown ? <Text variant="callout" tone="ink2">{countdown}</Text> : null}</Press>;
}
export function DocumentRow({ name, expires, actFrom, status, onPress }: { name: string; expires: string; actFrom?: string; status?: string; onPress?: () => void }) {
  const t = useTokens();
  return <Press onPress={onPress} accessibilityLabel={`${name}. ${expires}. ${actFrom ?? ''}`} style={[s.row, { paddingVertical: space.sm }]}><View style={[s.icon, { backgroundColor: t.surface2, borderRadius: radius.sm }]}><Ionicons name="document-text-outline" size={20} color={t.ink2} /></View><View style={{ flex: 1, gap: space.xxs }}><Text variant="title">{name}</Text><Text variant="callout" tone="ink2">{expires}</Text>{actFrom ? <Text variant="callout" tone="ink2">{actFrom}</Text> : null}</View>{status ? <StatusPill label={status} kind={status === 'Act now' ? 'live' : status === 'Sorted' ? 'done' : 'neutral'} /> : <Ionicons name="chevron-forward" size={18} color={t.ink2} />}</Press>;
}
export function FocusTimer({ seconds, running, onFinish }: { seconds: number; running: boolean; onFinish?: () => void }) {
  const [remaining, setRemaining] = useState(seconds), finish = useRef(onFinish);
  finish.current = onFinish;
  useEffect(() => { setRemaining(seconds); }, [seconds]);
  useEffect(() => {
    if (!running) return;
    const deadline = Date.now() + remaining * 1000;
    const id = setInterval(() => {
      const next = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setRemaining(next);
      if (!next) { clearInterval(id); feedback.complete(); finish.current?.(); }
    }, 1000);
    return () => clearInterval(id);
  }, [running, seconds]);
  return <View style={{ alignItems: 'center', gap: space.xxl }}><LifeOrb size={170} state={remaining ? 'ring' : 'done'} /><Text variant="numeralXl" accessibilityLiveRegion="none">{`${Math.floor(remaining / 60)}:${String(remaining % 60).padStart(2, '0')}`}</Text></View>;
}
export function WeightLogger({ value, onChange, trend, unit = 'kg' }: { value: number; onChange: (n: number) => void; trend: number[]; unit?: string }) {
  const t = useTokens();
  return <View style={{ gap: space.lg }}><View style={[s.row, { justifyContent: 'center' }]}><Press onPress={() => onChange(Math.max(1, Math.round((value - .1) * 10) / 10))} accessibilityLabel="Decrease weight" style={[s.icon, { backgroundColor: t.surface2, borderRadius: radius.md }]}><Text variant="headline">−</Text></Press><View style={{ flex: 1, alignItems: 'center' }}><Text variant="numeralXl">{value.toFixed(1)}</Text><Text variant="callout" tone="ink2">{unit}</Text></View><Press onPress={() => onChange(Math.round((value + .1) * 10) / 10)} accessibilityLabel="Increase weight" style={[s.icon, { backgroundColor: t.surface2, borderRadius: radius.md }]}><Text variant="headline">+</Text></Press></View><TrendLine values={trend} label="Seven-day trend" unit={` ${unit}`} /><StatusPill kind="done" label="On track" /></View>;
}
export function WatchFace({ time = '09:41', title = 'Today’s move', value = 'Check your tax code', onPress }: { time?: string; title?: string; value?: string; onPress?: () => void }) {
  const t = useTokens();
  return <Press onPress={onPress} accessibilityLabel={`${title}. ${value}`} style={{ width: 196, height: 236, alignSelf: 'center', padding: space.lg, borderRadius: 48, backgroundColor: t.surface, gap: space.sm }}><Text variant="callout" align="right">{time}</Text><LifeOrb size={32} /><Text variant="callout" tone="ink2">{title}</Text><Text variant="headline">{value}</Text></Press>;
}
export function NotificationPreview({ title = 'A little room in your day', body = 'You’ve got 20 free minutes. One form gets your rebate moving.', at = 'now' }: { title?: string; body?: string; at?: string }) {
  return <Card style={{ gap: space.xs }}><View style={s.row}><LifeOrb size={24} /><Text variant="callout" style={{ flex: 1 }}>life</Text><Text variant="callout" tone="ink2">{at}</Text></View><Text variant="title">{title}</Text><Text variant="body" tone="ink2">{body}</Text></Card>;
}
export function ModelCard({ name, size, purpose, status, onPress }: { name: string; size: string; purpose: string; status?: string; onPress?: () => void }) {
  return <Card onPress={onPress} style={{ gap: space.xs }}><View style={[s.row, { justifyContent: 'space-between' }]}><Text variant="title">{name}</Text><Text variant="callout" tone="ink2">{size}</Text></View><Text variant="body" tone="ink2">{purpose}</Text>{status ? <StatusPill label={status} /> : null}</Card>;
}
const s = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: space.sm }, icon: { minWidth: 44, height: 44, alignItems: 'center', justifyContent: 'center' } });
