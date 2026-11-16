import { useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Children, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { Atmosphere, Button, Card, ImageTreatment, LessonBar, ListRow, SheetOverImage, Text, TopBar, componentSize, durations, fonts, motion, radius, screenLightFields, space, useCalmMotion, useTokens, type Tone, type TopBarAction } from '@/design';
import { screens, type ScreenKey } from '@/navigation/screens';
import { useNavigation } from '@/navigation/useNavigation';
import type { ImageSourcePropType } from 'react-native';

export const layout = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: space.sm }, between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm }, col: { gap: space.sm }, grow: { flex: 1 }, center: { alignItems: 'center', justifyContent: 'center' }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm } });
export function Screen({ screen, title, eyebrow, children, footer, action, actions, avatar, image, underlay, overlayChrome = false, flowCenter, step, progress, onClose, scroll = true, onScroll, onPull }: { screen: ScreenKey; title?: string; eyebrow?: string; children: ReactNode; footer?: ReactNode; action?: TopBarAction; actions?: TopBarAction[]; avatar?: ReactNode; image?: ImageSourcePropType; underlay?: ReactNode; overlayChrome?: boolean; flowCenter?: ReactNode; step?: string; progress?: number; onClose?: () => void; scroll?: boolean; onScroll?: (y: number) => void; onPull?: () => void }) {
  const t = useTokens(), calm = useCalmMotion(), nav = useNavigation(), insets = useSafeAreaInsets();
  const meta = screens[screen], sheet = meta.kind === 'Sheet', root = meta.kind === 'Tab', flow = meta.kind === 'Full screen', close = onClose ?? nav.close;
  const cover = screen === 'welcome' || screen === 'levelup';
  const photoHeight = screen === 'plus' ? 520 : 380;
  const flowLabel = ['bite', 'predict', 'puzzle', 'bitedrawn'].includes(screen) ? 'Tax codes' : undefined;
  const params = useLocalSearchParams<{ state?: string }>();
  const field = screenLightFields[params.state ?? screen];
  const content = Children.toArray(children).filter(Boolean);
  const body = content.map((child, i) => <Animated.View key={i} entering={calm ? FadeIn.duration(durations.quick) : FadeInDown.delay(Math.min(i, 5) * motion.stagger).springify().duration(motion.rise.duration).dampingRatio(.85)}>{child}</Animated.View>);
  return <SafeAreaView nativeID={`screen-${screen}`} edges={overlayChrome ? ['top'] : sheet ? ['bottom'] : ['top', 'bottom']} style={{ flex: 1, backgroundColor: sheet ? t.surface : t.canvas }}>
    <StatusBar style={image || overlayChrome || t.scheme === 'dark' ? 'light' : 'dark'} />
    {field ? <Atmosphere signal={field[0]} opacity={field[1]} /> : null}
    {underlay}
    {image ? <ImageTreatment source={image} kind={cover ? 'cover' : 'band'} height={cover ? undefined : photoHeight + insets.top} /> : null}
    {root ? <TopBar kind="root" title={title ?? meta.title} eyebrow={eyebrow} actions={actions} avatar={avatar} /> : sheet && image ? <SheetOverImage onClose={close} /> : sheet ? <TopBar kind="sheet" title={title ?? meta.title} action={action} onClose={close} /> : flow ? <TopBar kind="flow" onClose={close} step={step} onImage={cover || overlayChrome} center={flowCenter ?? (flowLabel ? <Text variant="callout" tone="ink2">{flowLabel}</Text> : progress !== undefined ? <LessonBar count={3} current={progress} /> : undefined)} /> : <TopBar kind="push" title={title ?? meta.title} action={action} onBack={close} onImage={!!image} />}
    {flowLabel && progress !== undefined ? <View style={{ paddingHorizontal: space.gutter, paddingTop: space.xxs }}><LessonBar count={3} current={progress} /></View> : null}
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {scroll ? <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} onScroll={e => { onScroll?.(e.nativeEvent.contentOffset.y); if (e.nativeEvent.contentOffset.y < -60) onPull?.(); }} scrollEventThrottle={16} contentContainerStyle={{ paddingHorizontal: space.gutter, paddingTop: space.md, paddingBottom: root ? 120 : space.xl, gap: space.lg, flexGrow: 1 }}>{body}</ScrollView> : <View style={{ flex: 1, paddingHorizontal: space.gutter, paddingTop: space.md, gap: space.lg }}>{body}</View>}
      {footer ? <View style={{ paddingHorizontal: space.gutter, paddingTop: space.xs, paddingBottom: overlayChrome ? Math.max(insets.bottom, componentSize.cameraBottom) : space.sm, gap: space.xs, backgroundColor: cover || overlayChrome ? 'transparent' : sheet ? t.surface : t.canvas }}>{footer}</View> : null}
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
export function Heading({ title, sub, variant = 'titleSerif', tone = 'ink' }: { title: string; sub?: string; variant?: 'titleSerif' | 'headline' | 'statement'; tone?: Tone }) { return <View style={{ gap: space.sm }}><Text variant={variant} tone={tone} accessibilityRole="header">{title}</Text>{sub ? <Text variant="body" tone={tone === 'paper' ? 'paper2' : 'ink2'}>{sub}</Text> : null}</View>; }
export function Section({ title, meta, children, onPress }: { title: string; meta?: string; children: ReactNode; onPress?: () => void }) { return <View style={{ gap: space.sm }}><View style={layout.between}><Text variant="title">{title}</Text>{meta ? <Button variant="link" label={meta} onPress={onPress} /> : null}</View>{children}</View>; }
export function Rows({ rows }: { rows: { title: string; sub?: string; value?: string; to?: ScreenKey; onPress?: () => void; icon?: React.ComponentProps<typeof ListRow>['icon'] }[] }) {
  const nav = useNavigation();
  return <Card padding={space.md}>{rows.map((row, i) => <ListRow key={`${row.title}-${i}`} title={row.title} sub={row.sub} right={row.value ? <Text variant="callout" tone="ink2">{row.value}</Text> : undefined} chevron={!!row.to} onPress={row.onPress ?? (row.to ? () => nav.go(row.to!) : undefined)} icon={row.icon} />)}</Card>;
}
export function Input({ value, onChange, label, multiline = false, numeric = false, placeholder }: { value: string; onChange: (v: string) => void; label: string; multiline?: boolean; numeric?: boolean; placeholder?: string }) {
  const t = useTokens();
  return <View style={{ gap: space.xs }}><Text variant="callout" tone="ink2">{label}</Text><TextInput value={value} onChangeText={onChange} multiline={multiline} keyboardType={numeric ? 'decimal-pad' : 'default'} placeholder={placeholder} placeholderTextColor={t.inkQuiet} accessibilityLabel={label} style={{ color: t.ink, backgroundColor: t.surface2, borderRadius: radius.md, padding: space.md, minHeight: multiline ? 130 : 48, fontFamily: fonts.sans, fontSize: 15, textAlignVertical: multiline ? 'top' : 'center' }} /></View>;
}
export function LocalNotice({ text = 'Local preview · nothing is connected or sent.' }: { text?: string }) { return <Text variant="callout" tone="ink2">{text}</Text>; }
export function SecondaryLinks({ links }: { links: { label: string; to: ScreenKey }[] }) { const nav = useNavigation(); return <View style={{ gap: space.xs }}>{links.map(l => <Button key={l.label} label={l.label} variant="secondary" onPress={() => nav.go(l.to)} />)}</View>; }
