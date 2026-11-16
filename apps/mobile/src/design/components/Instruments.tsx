import { useEffect, useRef, useState, type ReactNode } from 'react';
import { StyleSheet, TextInput, View, type ImageSourcePropType } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withRepeat, withTiming } from 'react-native-reanimated';
import { Text } from '../Text';
import { Press } from '../Press';
import { feedback } from '../feedback';
import { useCalmMotion, useTokens } from '../theme';
import { areaColors, durations, radius, space, type Area } from '../tokens';
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
  return <View style={{ height: 56, alignItems: 'center', justifyContent: 'flex-start', paddingTop: space.xs }}><View style={{ width: 36, height: 5, borderRadius: radius.full, backgroundColor: t.paper }} /><Press onPress={onClose} accessibilityLabel="Close" style={[s.icon, { position: 'absolute', right: space.lg, top: space.xs, backgroundColor: t.canvas, borderRadius: radius.md }]}><Ionicons name="close" size={20} color={t.ink} /></Press></View>;
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
export function BreathPacer({ active = true, secondsIn = 5, secondsOut = 5 }: { active?: boolean; secondsIn?: number; secondsOut?: number }) {
  const t = useTokens(), calm = useCalmMotion(), phase = useSharedValue(0), [inhale, setInhale] = useState(true);
  useEffect(() => {
    if (!active || calm) { phase.value = 0; return; }
    const period = (secondsIn + secondsOut) * 1000;
    phase.value = withRepeat(withTiming(1, { duration: period, easing: Easing.linear }), -1, false);
    let id: ReturnType<typeof setTimeout>;
    const turn = (inside: boolean) => { setInhale(inside); feedback.select(); id = setTimeout(() => turn(!inside), (inside ? secondsIn : secondsOut) * 1000); };
    turn(true); return () => clearTimeout(id);
  }, [active, calm, secondsIn, secondsOut, phase]);
  const style = useAnimatedStyle(() => { const split = secondsIn / (secondsIn + secondsOut), p = phase.value < split ? phase.value / split : 1 - (phase.value - split) / (1 - split); return { transform: [{ scale: .65 + .35 * (.5 - .5 * Math.cos(p * Math.PI)) }] }; });
  return <View style={{ height: 280, alignItems: 'center', justifyContent: 'center' }} accessible accessibilityLabel={active ? `Breathe ${inhale ? 'in' : 'out'}` : 'Breathing paused'}><Animated.View style={[{ width: 240, height: 240, borderRadius: radius.full, backgroundColor: t.surface2, alignItems: 'center', justifyContent: 'center' }, style]}><LifeOrb size={96} state="ring" /></Animated.View><View style={{ position: 'absolute', bottom: 0 }}><Text variant="headline">{active ? inhale ? 'Breathe in' : 'Breathe out' : 'Ready when you are'}</Text></View></View>;
}
export function CalendarDay({ blocks }: { blocks: { at: string; title: string; sub?: string; free?: boolean; onPress?: () => void }[] }) {
  const t = useTokens();
  return <View style={{ gap: space.sm }}>{blocks.map(b => <View key={`${b.at}-${b.title}`} style={[s.row, { alignItems: 'flex-start' }]}><Text variant="callout" tone="ink2" style={{ width: 48, paddingTop: space.sm }}>{b.at}</Text><Card variant={b.free ? 'tile' : 'default'} onPress={b.onPress} accessibilityLabel={b.title} style={{ flex: 1, gap: space.xxs }}><Text variant="title">{b.title}</Text>{b.sub ? <Text variant="callout" tone="ink2">{b.sub}</Text> : null}</Card></View>)}</View>;
}
export function PersonAvatar({ name, area = 'you', size = 44 }: { name: string; area?: Area; size?: number }) {
  const t = useTokens();
  return <View accessibilityLabel={name} style={{ width: size, height: size, borderRadius: size * .3, backgroundColor: areaColors[t.scheme][area], alignItems: 'center', justifyContent: 'center' }}><Text variant={size > 60 ? 'numeralL' : 'title'} style={{ color: t.canvas }}>{name.trim().slice(0, 1).toUpperCase()}</Text></View>;
}
export function DateRow({ name, date, kind = 'birthday', countdown, onPress }: { name: string; date: string; kind?: 'birthday' | 'anniversary' | 'memorial'; countdown?: string; onPress?: () => void }) {
  return <Press onPress={onPress} accessibilityLabel={`${name}, ${kind}, ${date}`} style={[s.row, { paddingVertical: space.sm }]}><PersonAvatar name={name} area="home" /><View style={{ flex: 1, gap: space.xxs }}><Text variant="title">{name}</Text><Text variant="callout" tone="ink2">{`${kind[0].toUpperCase()}${kind.slice(1)} · ${date}`}</Text></View>{kind !== 'memorial' && countdown ? <Text variant="callout" tone="ink2">{countdown}</Text> : null}</Press>;
}
export function DocumentRow({ name, expires, actFrom, onPress }: { name: string; expires: string; actFrom: string; onPress?: () => void }) {
  const t = useTokens();
  return <Press onPress={onPress} accessibilityLabel={`${name}. ${expires}. ${actFrom}`} style={[s.row, { paddingVertical: space.sm }]}><View style={[s.icon, { backgroundColor: t.surface2, borderRadius: radius.sm }]}><Ionicons name="document-text-outline" size={20} color={t.ink2} /></View><View style={{ flex: 1, gap: space.xxs }}><Text variant="title">{name}</Text><Text variant="callout" tone="ink2">{expires}</Text><Text variant="callout" tone="ink2">{actFrom}</Text></View><Ionicons name="chevron-forward" size={18} color={t.ink2} /></Press>;
}
export function FocusTimer({ seconds, running, onFinish }: { seconds: number; running: boolean; onFinish?: () => void }) {
  const [remaining, setRemaining] = useState(seconds), finish = useRef(onFinish);
  finish.current = onFinish;
  useEffect(() => { setRemaining(seconds); }, [seconds]);
  useEffect(() => { if (!running) return; const id = setInterval(() => setRemaining(v => { if (v <= 1) { clearInterval(id); feedback.complete(); finish.current?.(); return 0; } return v - 1; }), 1000); return () => clearInterval(id); }, [running]);
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
