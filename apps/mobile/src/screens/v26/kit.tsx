/**
 * The V26 screen kit: the board's page anatomy (`status`, bar, `.scroll`, foot) and its words (`eyebrow`, `display`,
 * `statement`, `body`, `micro`) as small pieces every restyled screen shares. Everything draws from `@/design`.
 *
 * Copy is written the board's way: braces mark the words that matter, `{@doc tax rebate}` sets an icon inside them.
 *   <Display s="Your {@doc tax rebate} is {one form} away." />
 */
import { Children, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Button, Card, Footer, Icon, LifeOrb, PhotoFill, Press, RichText, SpineTimeline, StatusPill, Text, Thumb, TopBar, TwoTone, V26Row,
  cardShadow, componentSize, photo, photoScrims, radius, space, useTokens,
  type Focal, type GlyphName, type SpineItem, type StatusKind, type Tone, type TopBarAction, type TwoToneSegment, type TypeStyle, type V26RowProps,
} from '@/design';
import { screens, type ScreenKey } from '@/navigation/screens';
import { useNavigation } from '@/navigation/useNavigation';

/* ───────────────────────── Copy ───────────────────────── */

const TOKEN = /\{(?:@([A-Za-z]+) )?([^}]*)\}/g;

/** Board copy to two-tone segments: plain words quiet, `{braced}` words ink, `{@icon words}` ink with the icon inside. */
export function two(s: string): TwoToneSegment[] {
  const out: TwoToneSegment[] = [];
  let last = 0;
  TOKEN.lastIndex = 0;
  for (let m = TOKEN.exec(s); m; m = TOKEN.exec(s)) {
    if (m.index > last) out.push({ text: s.slice(last, m.index), tone: 'quiet' });
    out.push({ text: m[2], icon: m[1] as GlyphName | undefined });
    last = m.index + m[0].length;
  }
  if (last < s.length) out.push({ text: s.slice(last), tone: 'quiet' });
  return out;
}

/** The 34pt briefing (board `.display`), 10pt below whatever sits above it. */
export function Display({ s, onPhoto, flush, style }: { s: string; onPhoto?: boolean; flush?: boolean; style?: StyleProp<ViewStyle> }) {
  return <TwoTone size="display" segments={two(s)} onAtmosphere={onPhoto} style={[flush ? null : { marginTop: space.tile }, style]} />;
}

/** The 24pt two-tone sentence (board `.statement`). */
export function Statement({ s, onPhoto, size = 'statement', style }: { s: string; onPhoto?: boolean; size?: 'statement' | 'lead' | 'headline'; style?: StyleProp<ViewStyle> }) {
  return <TwoTone size={size} segments={two(s)} onAtmosphere={onPhoto} style={style} />;
}

/** Quiet copy with the braced words in ink (board `.body`, `.callout`). */
export function Body({ s, variant = 'body', tone = 'ink2', bright = 'ink', align, style, lines }: { s: string; variant?: TypeStyle; tone?: Tone; bright?: Tone; align?: 'left' | 'center'; style?: StyleProp<ViewStyle>; lines?: number }) {
  return <View style={style}><RichText text={s} variant={variant} tone={tone} brightTone={bright} align={align} numberOfLines={lines} /></View>;
}

/** 13pt quiet words (board `.callout`). */
export function Callout({ children, center, tone = 'ink2', style }: { children: ReactNode; center?: boolean; tone?: Tone; style?: StyleProp<ViewStyle> }) {
  return <View style={style}><Text variant="callout" tone={tone} align={center ? 'center' : undefined}>{children}</Text></View>;
}

/** The short label above a display sentence (board `.eyebrow`): with the orb, an ember star or an icon. */
export function Eyebrow({ children, orb, star, icon, right, onPhoto, style }: { children: ReactNode; orb?: boolean; star?: boolean; icon?: GlyphName; right?: ReactNode; onPhoto?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  const color = onPhoto ? photo.onPhoto2 : t.ink2;
  const label = (
    <View style={styles.eyebrow}>
      {orb ? <LifeOrb size={18} color={onPhoto ? photo.onPhoto : t.ink} /> : null}
      {star ? <View style={[styles.dot, { backgroundColor: t.ember }]} /> : null}
      {icon ? <Icon name={icon} size={componentSize.iconXs - 2} color={color} /> : null}
      <Text variant="callout" style={{ color, flexShrink: 1 }}>{children}</Text>
    </View>
  );
  if (!right) return <View style={style}>{label}</View>;
  return <View style={[styles.between, style]}>{label}{right}</View>;
}

/** The 11pt label (board `.micro`), with the ember signal dot when it marks the one thing. */
export function Micro({ children, sig, center, onPhoto, style }: { children: ReactNode; sig?: boolean; center?: boolean; onPhoto?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  return (
    <View style={[styles.micro, center ? { justifyContent: 'center' } : null, style]}>
      {sig ? <View style={[styles.dot, { backgroundColor: t.ember }]} /> : null}
      <Text variant="micro" style={{ color: onPhoto ? photo.onPhoto2 : t.ink2 }}>{children}</Text>
    </View>
  );
}

/** A big figure with its unit (board `.xl` 56pt or `.num` 32pt). */
export function Figure({ value, unit, size = 'xl', center, tone = 'ink', style }: { value: string; unit?: string; size?: 'xl' | 'num'; center?: boolean; tone?: Tone; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'baseline', justifyContent: center ? 'center' : 'flex-start' }, style]}>
      <Text variant={size === 'xl' ? 'numeralXl' : 'numeralL'} tone={tone}>{value}</Text>
      {unit ? <Text variant="unit" tone={tone === 'ink' ? 'ink2' : tone} style={{ marginLeft: space.xxs }}>{unit}</Text> : null}
    </View>
  );
}

/* ───────────────────────── Layout ───────────────────────── */

/** Vertical air between blocks: the board's `mt8` to `mt32`. */
export function Sp({ h }: { h: number }) { return <View style={{ height: h }} />; }

/** Children in a row, 8pt apart (the board's button pairs). The first child keeps its width when `lead` is set. */
export function Duo({ children, gap = space.xs, style }: { children: ReactNode; gap?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ flexDirection: 'row', alignItems: 'center', gap }, style]}>{Children.toArray(children).map((c, i) => <View key={i} style={{ flex: 1, minWidth: 0 }}>{c}</View>)}</View>;
}

export function Between({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.between, style]}>{children}</View>;
}

/* ───────────────────────── Surfaces ───────────────────────── */

/** A card of rows (board `.card.pad16.rows`). */
export function RowsCard({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <Card padding={space.md} style={[{ paddingVertical: space.xs }, style]}>{children}</Card>;
}

/** A list row: an icon well, a photograph thumb or a date box, its words, and something quiet on the right. */
export function Row(props: V26RowProps & { photo?: ImageSourcePropType }) {
  const { photo: p, ...rest } = props;
  return <V26Row {...rest} thumb={rest.thumb ?? p} />;
}

/** A chip (board `chip`): `live` ember, `done` green, `q` quiet, or plain. */
export function Chip({ label, tone, icon, dot, onPhoto, onPress, style }: { label: string; tone?: 'live' | 'done' | 'q'; icon?: GlyphName; dot?: string; onPhoto?: boolean; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  const kind: StatusKind = tone === 'live' ? 'live' : tone === 'done' ? 'done' : tone === 'q' ? 'quiet' : 'neutral';
  const pill = <StatusPill size="chip" kind={kind} label={label} icon={icon} dot={dot} onPhoto={onPhoto} style={onPress ? null : style} />;
  if (!onPress) return pill;
  return <Press haptic="select" onPress={onPress} accessibilityLabel={label} hitSlop={8} style={[{ alignSelf: 'flex-start' }, style]}>{pill}</Press>;
}

/** The slab button (board `btn`). One primary per screen; everything else `ghost`. */
export function Btn({ label, onPress, ghost, sm, icon, trail, fit, onPhoto, disabled, style }: { label: string; onPress?: () => void; ghost?: boolean; sm?: boolean; icon?: GlyphName; trail?: boolean; fit?: boolean; onPhoto?: boolean; disabled?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Button label={label} onPress={onPress} variant={ghost ? 'ghost' : 'primary'} size={sm ? 'sm' : 'md'} icon={icon} iconPosition={trail ? 'trailing' : 'leading'} onAtmosphere={onPhoto} disabled={disabled}
      style={[fit ? { alignSelf: 'flex-start', paddingHorizontal: space.lg } : null, style]} />
  );
}

/** A quiet text button, centred in a foot (board `<button class="callout">`). */
export function QuietLink({ label, onPress, ink, center = true, style }: { label: string; onPress?: () => void; ink?: boolean; center?: boolean; style?: StyleProp<ViewStyle> }) {
  return (
    <Press haptic="select" onPress={onPress} accessibilityLabel={label} hitSlop={10} style={[{ alignSelf: center ? 'center' : 'flex-start', minHeight: 28, justifyContent: 'center' }, style]}>
      <Text variant={ink ? 'buttonCompact' : 'callout'} tone={ink ? 'ink' : 'ink2'}>{label}</Text>
    </Press>
  );
}

/**
 * Photograph on top, words below (board `.hero`): the photo carries a small label and a title, the white part below
 * holds rows or a sentence.
 */
export function Hero({ source, focal, height = 190, small, title, titleSize = 'heading', sub, children, onPress, style }: { source: ImageSourcePropType; focal?: Focal; height?: number; small?: string; title?: string; titleSize?: 'heading' | 'headline'; sub?: string; children?: ReactNode; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  const inner = <>
    <PhotoBox source={source} focal={focal} height={height} small={small} title={title} titleSize={titleSize} sub={sub} flat />
    {children ? <View style={{ paddingHorizontal: 18, paddingTop: space.md, paddingBottom: 18 }}>{children}</View> : null}
  </>;
  const box: ViewStyle = { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: t.surface };
  return (
    <View style={[{ borderRadius: radius.lg, ...cardShadow(t.scheme) }, style]}>
      {onPress ? <Press haptic="open" onPress={onPress} accessibilityLabel={[small, title, sub].filter(Boolean).join(', ')} style={box}>{inner}</Press> : <View style={box}>{inner}</View>}
    </View>
  );
}

/** A rounded photograph with its words low on it (board `.photo` + `.copy`). */
export function PhotoBox({ source, focal, height = 190, small, title, titleSize = 'heading', sub, flat, children, style }: { source: ImageSourcePropType; focal?: Focal; height?: number; small?: string; title?: string; titleSize?: 'heading' | 'headline' | 'title'; sub?: string; flat?: boolean; children?: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  return (
    <View style={[{ height, borderRadius: flat ? 0 : radius.lg, overflow: 'hidden', backgroundColor: t.surface2, justifyContent: 'flex-end' }, style]}>
      <PhotoFill source={source} focal={focal} />
      {title || small || sub ? <LinearGradient pointerEvents="none" colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} /> : null}
      {children}
      {title || small || sub ? (
        <View style={{ paddingHorizontal: 18, paddingVertical: space.md }}>
          {small ? <Text variant="micro" tone="paper2">{small}</Text> : null}
          {title ? <Text variant={titleSize} tone="paper" style={{ marginTop: 2, fontVariant: [] }}>{title}</Text> : null}
          {sub ? <Text variant="callout" tone="paper2">{sub}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

/** A photograph edge to edge behind the page, with the Welcome fade (board `.full-photo.fade`). `height` stops it short. */
export function PhotoBackdrop({ source, focal, height, fade = true }: { source: ImageSourcePropType; focal?: Focal; height?: number; fade?: boolean }) {
  return (
    <View pointerEvents="none" style={[StyleSheet.absoluteFill, height ? { bottom: undefined, height } : null]}>
      <PhotoFill source={source} focal={focal} settle />
      {fade ? <LinearGradient colors={photoScrims.fade.colors} locations={photoScrims.fade.locations} style={StyleSheet.absoluteFill} /> : null}
    </View>
  );
}

/** A day told as a spine of dots (board `.tl`). Braced words are bold. */
export function Timeline({ items, style }: { items: SpineItem[]; style?: StyleProp<ViewStyle> }) {
  return <SpineTimeline items={items} style={style} />;
}

/** A row's numbered well (board `numRow`): the step number where an icon would sit. */
export function NumWell({ n }: { n: number | string }) {
  const t = useTokens();
  return <View style={[styles.well, { backgroundColor: t.surface2 }]}><Text variant="rowTitle" style={{ fontVariant: ['tabular-nums'] }}>{String(n)}</Text></View>;
}

/** A 26pt round tick (board `.tick`): ink with a check when done, surface3 with an arrow when moved. */
export function Tick({ on, icon = 'check' }: { on?: boolean; icon?: GlyphName }) {
  const t = useTokens();
  return <View style={[styles.tick, { backgroundColor: on ? t.ink : t.surface3 }]}><Icon name={icon} size={14} color={on ? t.canvas : t.ink} /></View>;
}

/** A small photograph thumb, re-exported so screens import one kit. */
export { Thumb };

/** A paper round button for a bar that sits on a photograph. */
export function PhotoRound({ icon, label, onPress }: { icon: GlyphName; label: string; onPress?: () => void }) {
  return (
    <Press haptic="select" onPress={onPress} accessibilityLabel={label} hitSlop={4} style={[styles.round, { backgroundColor: photo.onPhoto }]}>
      <Icon name={icon} size={componentSize.iconSm} color={photo.ink} />
    </Press>
  );
}

/* ───────────────────────── The page ───────────────────────── */

export type Bar =
  | { kind: 'root'; title: string; sub?: string; actions?: TopBarAction[] }
  /** Back arrow, or a close cross with `close` (full-screen flows). Leave the title empty when a big heading follows. */
  | { kind: 'push'; title?: string; titleNode?: ReactNode; action?: TopBarAction; close?: boolean }
  /** The sheet's handle and, with a title, its bar and close. */
  | { kind: 'sheet'; title?: string; action?: TopBarAction }
  /** Quiet words on the left ("Back", "Deep work") and a step or action on the right. */
  | { kind: 'flow'; left?: string; leftIcon?: GlyphName; step?: string; action?: TopBarAction }
  /** A bar drawn over a photograph: anything on the left, a paper round close on the right. */
  | { kind: 'photo'; left?: ReactNode; close?: boolean; right?: ReactNode }
  | { kind: 'none' };

export type PageProps = {
  screen: ScreenKey;
  /** Picked from how the screen opens when left out: Tab root, Push back, Sheet handle, Full screen close. */
  bar?: Bar;
  children?: ReactNode;
  /** The fixed bottom area (board `foot`): one primary button and a quiet link. */
  footer?: ReactNode;
  /** Anything else fixed at the bottom (a drawer, a sheet, a composer) drawn as it is. */
  bottom?: ReactNode;
  scroll?: boolean;
  /** Drawn behind everything (a full photograph). Implies paper text in the bar and status bar. */
  backdrop?: ReactNode;
  onClose?: () => void;
  /** Centre the content in the space between bar and foot (focus, states). */
  center?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  onPull?: () => void;
};

/**
 * One V26 screen: the bar fixed outside the scroll, content with the board's 4/20/28 padding and no automatic gaps
 * (each block sets its own space above, as the board does), then the foot.
 */
export function Page({ screen, bar, children, footer, bottom, scroll = true, backdrop, onClose, center, contentStyle, onPull }: PageProps) {
  const t = useTokens(), nav = useNavigation(), insets = useSafeAreaInsets();
  const meta = screens[screen];
  const close = onClose ?? nav.close;
  const sheet = meta.kind === 'Sheet';
  const b: Bar = bar ?? (meta.kind === 'Tab' ? { kind: 'root', title: meta.title } : sheet ? { kind: 'sheet' } : meta.kind === 'Full screen' ? { kind: 'push', close: true } : { kind: 'push' });
  const onPhoto = !!backdrop;
  const bg = sheet ? t.surface : t.canvas;
  const statusBarStyle = onPhoto || t.scheme === 'dark' ? 'light' : 'dark';
  const top = b.kind === 'root' ? <TopBar look="v26" kind="root" title={b.title} sub={b.sub} actions={b.actions} onImage={onPhoto} />
    : b.kind === 'push' ? <TopBar look="v26" kind="push" title={b.title} titleNode={b.titleNode} action={b.action} onBack={close} closeIcon={b.close} onImage={onPhoto} />
    : b.kind === 'sheet' ? (b.title ? <TopBar look="v26" kind="sheet" title={b.title} action={b.action} onClose={close} onImage={onPhoto} /> : <SheetHandle />)
    : b.kind === 'flow' ? <TopBar look="v26" kind="flow" closeLabel={b.left ?? 'Back'} closeIcon={b.leftIcon} step={b.step} action={b.action} onClose={close} onImage={onPhoto} />
    : b.kind === 'photo' ? <View style={styles.photoBar}>{b.left ?? <View />}{b.right ?? (b.close === false ? null : <PhotoRound icon="close" label="Close" onPress={close} />)}</View>
    : null;
  const pad = { paddingHorizontal: space.gutter, paddingTop: space.xxs, paddingBottom: 28 + (footer || bottom || meta.kind === 'Tab' ? 0 : insets.bottom) };
  const body = scroll
    ? <ScrollView style={{ flex: 1, minHeight: 0 }} contentInsetAdjustmentBehavior="never" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
        onScroll={onPull ? e => { if (e.nativeEvent.contentOffset.y < -60) onPull(); } : undefined} scrollEventThrottle={16}
        contentContainerStyle={[pad, center ? { flexGrow: 1, justifyContent: 'center' } : null, contentStyle]}>{children}</ScrollView>
    : <View style={[{ flex: 1, minHeight: 0 }, pad, center ? { justifyContent: 'center' } : null, contentStyle]}>{children}</View>;
  return (
    <View nativeID={`screen-${screen}`} style={{ flex: 1, minHeight: 0, backgroundColor: onPhoto ? t.ink : bg }}>
      <Stack.Screen options={{ statusBarStyle }} />
      <StatusBar style={statusBarStyle} />
      {backdrop}
      <SafeAreaView edges={sheet ? [] : ['top']} style={{ flex: 1, minHeight: 0 }}>
        <View style={{ flexShrink: 0 }}>{top}</View>
        {body}
        {footer ? <Footer style={{ backgroundColor: onPhoto ? 'transparent' : bg }}>{footer}</Footer> : null}
        {bottom}
      </SafeAreaView>
    </View>
  );
}

/** The sheet's grabber, drawn by the page because the native sheet hides its own (board `.handle`). */
export function SheetHandle() {
  const t = useTokens();
  return (
    <View style={{ paddingTop: space.xs, paddingBottom: 14 }}>
      <View style={{ width: 36, height: 5, borderRadius: 3, alignSelf: 'center', backgroundColor: t.surface3 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  micro: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  dot: { width: 6, height: 6, borderRadius: 3 },
  well: { width: componentSize.round, height: componentSize.round, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  tick: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  round: { width: componentSize.round, height: componentSize.round, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  photoBar: { height: componentSize.topBarV26, paddingHorizontal: space.gutter, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
});
