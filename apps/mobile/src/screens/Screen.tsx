import { Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Children, type ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Atmosphere, Button, Card, ImageTreatment, LessonBar, ListRow, SheetOverImage, Text, TopBar, componentSize, fonts, radius, screenLightFields, space, useTokens, type Tone, type TopBarAction } from '@/design';
import { screens, type ScreenKey } from '@/navigation/screens';
import { useNavigation } from '@/navigation/useNavigation';
import type { ImageSourcePropType } from 'react-native';

export const layout = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', gap: space.sm }, between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm }, col: { gap: space.sm }, grow: { flex: 1 }, center: { alignItems: 'center', justifyContent: 'center' }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.sm } });
export function Screen({ screen, title, eyebrow, children, footer, action, actions, avatar, image, imageHeight, underlay, overlayChrome = false, flowCenter, step, progress, progressCount, onClose, scroll = true, onScroll, onPull }: { screen: ScreenKey; title?: string; eyebrow?: string; children: ReactNode; footer?: ReactNode; action?: TopBarAction; actions?: TopBarAction[]; avatar?: ReactNode; image?: ImageSourcePropType; imageHeight?: number; underlay?: ReactNode; overlayChrome?: boolean; flowCenter?: ReactNode; step?: string; progress?: number; progressCount?: number; onClose?: () => void; scroll?: boolean; onScroll?: (y: number) => void; onPull?: () => void }) {
  const t = useTokens(), nav = useNavigation(), insets = useSafeAreaInsets();
  const meta = screens[screen], sheet = meta.kind === 'Sheet', root = meta.kind === 'Tab', flow = meta.kind === 'Full screen', close = onClose ?? nav.close;
  const cover = screen === 'welcome' || screen === 'levelup';
  const photoHeight = imageHeight ?? (screen === 'plus' || screen === 'glimpse' ? 520 : screen === 'gotit' ? 470 : screen === 'aim' ? 340 : ['areahome', 'areawork', 'tests'].includes(screen) ? 330 : screen === 'firstmove' || screen === 'shared' ? 360 : screen === 'hill' ? 300 : 380);
  const numberedStep = /^(\d+)\s*(?:of|\/)\s*(\d+)$/.exec(step ?? '');
  const barCount = progressCount ?? (numberedStep ? Number(numberedStep[2]) : 3);
  const barProgress = progress ?? (numberedStep ? Number(numberedStep[1]) - 1 : undefined);
  const flowLabel = ['bite', 'predict', 'puzzle', 'bitedrawn'].includes(screen) ? 'Tax codes' : undefined;
  const params = useLocalSearchParams<{ state?: string }>();
  const field = root ? undefined : screenLightFields[params.state ?? screen];
  // The native navigator owns page transitions. No per-section spring,
  // translation or stagger: content stays steady when a page opens.
  const body = Children.toArray(children).filter(Boolean).map((child, i) => <View key={i}>{child}</View>);
  const statusBarStyle = image || overlayChrome || t.scheme === 'dark' ? 'light' : 'dark';
  return <View nativeID={`screen-${screen}`} style={{ flex: 1, minHeight: 0, backgroundColor: sheet ? t.surface : t.canvas }}>
    {image ? <ImageTreatment source={image} kind={cover ? 'cover' : 'band'} height={cover ? undefined : photoHeight + insets.top} /> : null}
    <SafeAreaView edges={overlayChrome || root ? ['top'] : sheet ? ['bottom'] : ['top', 'bottom']} style={{ flex: 1, minHeight: 0, backgroundColor: 'transparent' }}>
    <Stack.Screen options={{ statusBarStyle }} />
    <StatusBar style={statusBarStyle} />
    {field && !image ? <Atmosphere signal={field[0]} opacity={field[1]} /> : null}
    {underlay}
    <View style={{ flexShrink: 0 }}>{root ? <TopBar kind="root" title={title ?? meta.title} eyebrow={eyebrow} actions={actions} avatar={avatar} onImage={!!image} /> : sheet && image ? <SheetOverImage onClose={close} /> : sheet ? <TopBar kind="sheet" title={title ?? meta.title} action={action} onClose={close} onImage={!!image} /> : flow ? <TopBar kind="flow" onClose={close} action={action} step={step} onImage={!!image || overlayChrome} center={flowCenter ?? (flowLabel ? <Text variant="callout" tone="ink2">{flowLabel}</Text> : barProgress !== undefined ? <LessonBar count={barCount} current={barProgress} /> : undefined)} /> : <TopBar kind="push" title={title ?? meta.title} action={action} onBack={close} onImage={!!image} />}</View>
    {flowLabel && barProgress !== undefined ? <View style={{ paddingHorizontal: space.gutter, paddingTop: space.xxs }}><LessonBar count={barCount} current={barProgress} /></View> : null}
    <KeyboardAvoidingView style={{ flex: 1, minHeight: 0 }} behavior={Platform.OS === 'ios' && !sheet ? 'padding' : undefined}>
      {scroll ? <ScrollView style={{ flex: 1, minHeight: 0 }} contentInsetAdjustmentBehavior="never" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} onScroll={e => { onScroll?.(e.nativeEvent.contentOffset.y); if (e.nativeEvent.contentOffset.y < -60) onPull?.(); }} scrollEventThrottle={16} contentContainerStyle={{ paddingHorizontal: space.gutter, paddingTop: root ? space.xs : space.md, paddingBottom: space.xl, gap: space.lg, flexGrow: 1 }}>{body}</ScrollView> : <View style={{ flex: 1, minHeight: 0, paddingHorizontal: space.gutter, paddingTop: root ? space.xs : space.md, gap: space.lg }}>{body}</View>}
      {footer ? <View style={{ flexShrink: 0, paddingHorizontal: space.gutter, paddingTop: space.xs, paddingBottom: overlayChrome ? Math.max(insets.bottom, componentSize.cameraBottom) : space.sm, gap: space.xs, backgroundColor: cover || overlayChrome ? 'transparent' : sheet ? t.surface : t.canvas }}>{footer}</View> : null}
    </KeyboardAvoidingView>
  </SafeAreaView></View>;
}
export function Heading({ title, sub, variant = 'titleSerif', tone = 'ink' }: { title: string; sub?: string; variant?: 'titleSerif' | 'headline' | 'statement'; tone?: Tone }) { return <View style={{ gap: space.sm }}><Text variant={variant} tone={tone} accessibilityRole="header">{title}</Text>{sub ? <Text variant="body" tone={tone === 'paper' ? 'paper2' : 'ink2'}>{sub}</Text> : null}</View>; }
export function Section({ title, meta, children, onPress }: { title: string; meta?: string; children: ReactNode; onPress?: () => void }) { return <View style={{ gap: space.sm }}><View style={layout.between}><Text variant="title" style={{ flex: 1, minWidth: 0 }}>{title}</Text>{meta ? onPress ? <Button variant="link" label={meta} onPress={onPress} /> : <Text variant="callout" tone="ink2" style={{ flexShrink: 1, textAlign: 'right' }}>{meta}</Text> : null}</View>{children}</View>; }
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
