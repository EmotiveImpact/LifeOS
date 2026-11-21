/**
 * The V26 screen kit: the board's page anatomy (`status`, bar, `.scroll`, foot) and its words (`eyebrow`, `display`,
 * `statement`, `body`, `micro`) as small pieces every restyled screen shares. Everything draws from `@/design`.
 *
 * Copy is written the board's way: braces mark the words that matter, `{@doc tax rebate}` sets an icon inside them.
 *   <Display s="Your {@doc tax rebate} is {one form} away." />
 */
import { Children, createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, View, useWindowDimensions, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { Stack, useFocusEffect, useNavigation as useRouterNavigation } from 'expo-router';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Appear, Button, Card, Footer, Icon, LifeOrb, PhotoFill, Press, RichText, SpineTimeline, StatusPill, Text, Thumb, TopBar, TwoTone, V26Row,
  cardShadow, componentSize, motion, photo, photoScrims, radius, space, useCalmMotion, useTokens,
  type Focal, type GlyphName, type SpineItem, type StatusKind, type Tone, type TopBarAction, type TwoToneSegment, type TypeStyle, type V26RowProps,
} from '@/design';
import { screens, type ScreenKey } from '@/navigation/screens';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import { setWebExit, takeReturn } from '@/navigation/webExit';

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

/** How deep the current page sits: a tab's home, a page opened from it, or a full-screen moment. Set by `Page`. */
const Depth = createContext<'root' | 'detail' | 'moment'>('root');

/**
 * The opening sentence, 10pt below whatever sits above it. One size per depth, the way iOS keeps large titles for a
 * tab's top level (Edem, 20 Nov: bring the design into harmony): 34pt (board `.display`) on Today, Plan and You and on
 * full-screen moments and photographs; the 24pt statement on pages and sheets opened from them, so their content
 * starts higher and the tabs stay the loudest screens.
 */
export function Display({ s, onPhoto, flush, center, style }: { s: string; onPhoto?: boolean; flush?: boolean; center?: boolean; style?: StyleProp<ViewStyle> }) {
  const depth = useContext(Depth);
  return <TwoTone header size={depth === 'detail' && !onPhoto ? 'statement' : 'display'} segments={two(s)} onAtmosphere={onPhoto} align={center ? 'center' : undefined} style={[flush ? null : { marginTop: space.tile }, style]} />;
}

/** The 24pt two-tone sentence (board `.statement`). */
export function Statement({ s, onPhoto, size = 'statement', center, header, style }: { s: string; onPhoto?: boolean; size?: 'statement' | 'lead' | 'headline'; center?: boolean; /** When the sentence is the screen's title, so screen readers can jump to it. */ header?: boolean; style?: StyleProp<ViewStyle> }) {
  return <TwoTone header={header} size={size} segments={two(s)} onAtmosphere={onPhoto} align={center ? 'center' : undefined} style={style} />;
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
      {/* The label above a screen's opening sentence: read as a heading, so it can be jumped to. */}
      <Text variant="callout" accessibilityRole="header" style={{ color, flexShrink: 1 }}>{children}</Text>
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

/** Today, Plan and You: the page name on the left, its buttons and then the orb on the right. */
function RootBar({ bar, onImage }: { bar: Extract<Bar, { kind: 'root' }>; onImage: boolean }) {
  const nav = useNavigation(), { data } = useSeed();
  const orb = bar.orb === false ? undefined : { onPress: () => nav.go('inbox'), unread: !data.flags['inbox-read'] };
  return <TopBar look="v26" kind="root" title={bar.title} sub={bar.sub} actions={bar.actions} orb={orb} onImage={onImage} />;
}

export type Bar =
  /** The orb sits at the right end and opens "From Life"; `orb: false` leaves it out (a gallery frame). */
  | { kind: 'root'; title: string; sub?: string; actions?: TopBarAction[]; orb?: false }
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
  /** Dark status bar text over a light photograph (board `status('lt-ink')`). */
  statusInk?: boolean;
  /** Called as you scroll near the bottom, so a long list (`useLongList`) can draw its next page. */
  onEnd?: () => void;
};

/**
 * One V26 screen: the bar fixed outside the scroll, content with the board's 4/20/28 padding and no automatic gaps
 * (each block sets its own space above, as the board does), then the foot.
 */
export function Page({ screen, bar, children, footer, bottom, scroll = true, backdrop, onClose, center, contentStyle, onPull, statusInk, onEnd }: PageProps) {
  const t = useTokens(), nav = useNavigation(), insets = useSafeAreaInsets(), calm = useCalmMotion();
  const meta = screens[screen];
  const web = Platform.OS === 'web';
  // Web preview only (webExit.ts): `leave` plays the page out before a close; `back` slides the revealed page in.
  const leave = useSharedValue(0), back = useSharedValue(1), enter = useSharedValue(web ? 0 : 1);
  useEffect(() => { if (web) enter.value = calm ? 1 : withSpring(1, motion.smooth); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useFocusEffect(useCallback(() => {
    if (!web) return;
    leave.value = 0;
    if (takeReturn() && !calm) { back.value = 0; back.value = withSpring(1, motion.snappy); }
    if (meta.kind === 'Tab') return;
    return setWebExit(done => {
      if (calm) return done();
      leave.value = withTiming(1, LEAVE);
      // A pushed page hands over just before its fade ends, so the page underneath shows with no empty frame between
      // them; a sheet's page was in view all along, so the sheet finishes dropping first.
      setTimeout(done, meta.kind === 'Sheet' ? LEAVE.duration : LEAVE.duration - 50);
    }, meta.kind !== 'Sheet');
  }, [web, calm, meta.kind, leave, back]));
  const flow = useAnimatedStyle(() => {
    if (!web) return {};
    const k = 1 - back.value;
    if (calm) return { opacity: 1 - leave.value };
    return {
      opacity: (1 - leave.value) * (1 - 0.4 * k),
      transform: meta.kind === 'Push' || meta.kind === 'Tab'
        ? [{ translateX: leave.value * 56 - k * 28 }]
        : [{ translateX: -k * 28 }, { translateY: leave.value * 64 }],
    };
  });
  const scrimIn = useAnimatedStyle(() => ({ opacity: enter.value * (1 - leave.value) }));
  const sheetOut = useAnimatedStyle(() => ({ transform: [{ translateY: leave.value * (calm ? 0 : 420) }], opacity: calm ? 1 - leave.value : 1 }));
  const close = onClose ?? nav.close;
  const sheet = meta.kind === 'Sheet';
  const b: Bar = bar ?? (meta.kind === 'Tab' ? { kind: 'root', title: meta.title } : sheet ? { kind: 'sheet' } : meta.kind === 'Full screen' ? { kind: 'push', close: true } : { kind: 'push' });
  const onPhoto = !!backdrop;
  const bg = sheet ? t.surface : t.canvas;
  const statusBarStyle = statusInk ? 'dark' : onPhoto || t.scheme === 'dark' ? 'light' : 'dark';
  // A sheet is only as tall as what's in it (Edem, 20 Nov): a photograph-led sheet draws its own drawer instead.
  const fits = sheet && !backdrop && scroll && !center;
  const fit = useSheetFit(fits);
  const top = b.kind === 'root' ? <RootBar bar={b} onImage={onPhoto} />
    : b.kind === 'push' ? <TopBar look="v26" kind="push" title={b.title} titleNode={b.titleNode} action={b.action} onBack={close} closeIcon={b.close} onImage={onPhoto} />
    : b.kind === 'sheet' ? (b.title ? <TopBar look="v26" kind="sheet" title={b.title} action={b.action} onClose={close} onImage={onPhoto} /> : <SheetHandle />)
    : b.kind === 'flow' ? <TopBar look="v26" kind="flow" closeLabel={b.left ?? 'Back'} closeIcon={b.leftIcon} step={b.step} action={b.action} onClose={close} onImage={onPhoto} />
    : b.kind === 'photo' ? <View style={styles.photoBar}><View style={{ flexShrink: 1 }}>{b.left ?? null}</View><View>{b.right ?? (b.close === false ? null : <PhotoRound icon="close" label="Close" onPress={close} />)}</View></View>
    : null;
  const pad = { paddingHorizontal: space.gutter, paddingTop: space.xxs, paddingBottom: 28 + (footer || bottom || meta.kind === 'Tab' ? 0 : insets.bottom) };
  const content = <Depth.Provider value={meta.kind === 'Tab' ? 'root' : meta.kind === 'Push' || sheet ? 'detail' : 'moment'}>{children}</Depth.Provider>;
  const body = scroll
    ? <ScrollView style={fits && fit.web ? { flexGrow: 0, flexShrink: 1, minHeight: 0 } : { flex: 1, minHeight: 0 }} contentInsetAdjustmentBehavior="never" keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
        onScroll={onPull || onEnd ? e => {
          const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
          if (onPull && contentOffset.y < -60) onPull();
          if (onEnd && contentOffset.y + layoutMeasurement.height > contentSize.height - END_REACH) onEnd();
        } : undefined} scrollEventThrottle={16}
        onContentSizeChange={fits ? (_w, h) => fit.part('body', h) : undefined}
        contentContainerStyle={[pad, center ? { flexGrow: 1, justifyContent: 'center' } : null, contentStyle]}>{content}</ScrollView>
    : <View style={[{ flex: 1, minHeight: 0 }, pad, center ? { justifyContent: 'center' } : null, contentStyle]}>{content}</View>;
  const head = <View style={{ flexShrink: 0 }} onLayout={fits ? e => fit.part('top', e.nativeEvent.layout.height) : undefined}>{top}</View>;
  const foot = footer ? <View onLayout={fits ? e => fit.part('foot', e.nativeEvent.layout.height) : undefined}><Footer style={{ backgroundColor: onPhoto ? 'transparent' : bg }}>{footer}</Footer></View> : null;
  if (fits && fit.web) {
    // The web preview has no native sheet, so draw one: dimmed page behind, the sheet hugging its content at the bottom.
    return (
      <View nativeID={`screen-${screen}`} style={{ flex: 1, minHeight: 0, justifyContent: 'flex-end' }}>
        <Stack.Screen options={{ statusBarStyle }} />
        <StatusBar style={statusBarStyle} />
        {/* The page underneath stays in view and dims; the sheet rises over it, and drops away again on close. */}
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: t.scrim }, scrimIn]} />
        <Pressable style={StyleSheet.absoluteFill} onPress={close} accessibilityLabel="Close" />
        <Animated.View style={[{ maxHeight: '94%', flexShrink: 1, minHeight: 0 }, sheetOut]}>
          <Appear rise={220} style={[styles.webSheet, { backgroundColor: bg }]}>
            {head}
            {body}
            {foot}
            {bottom}
          </Appear>
        </Animated.View>
      </View>
    );
  }
  const page = (
    <View nativeID={`screen-${screen}`} style={{ flex: 1, minHeight: 0, backgroundColor: onPhoto ? t.ink : bg }}>
      <Stack.Screen options={{ statusBarStyle }} />
      <StatusBar style={statusBarStyle} />
      {backdrop}
      <SafeAreaView edges={sheet ? [] : ['top']} style={{ flex: 1, minHeight: 0 }}>
        {head}
        {body}
        {foot}
        {bottom}
      </SafeAreaView>
    </View>
  );
  // Phones get the system's own push, modal and sheet transitions. The browser preview has none, so a screen there
  // arrives the same calm way: a pushed page slides in a little from the right, a full-screen flow rises, both fading.
  if (!web) return page;
  if (meta.kind === 'Tab') return <Animated.View style={[{ flex: 1, minHeight: 0 }, flow]}>{page}</Animated.View>;
  return (
    <Animated.View style={[{ flex: 1, minHeight: 0 }, flow]}>
      <Appear from={meta.kind === 'Push' ? 'right' : 'below'} rise={meta.kind === 'Push' ? 36 : 40} style={{ flex: 1, minHeight: 0 }}>{page}</Appear>
    </Animated.View>
  );
}

/** How close to the bottom (pt) a long list starts drawing its next page: about a screen and a half ahead. */
const END_REACH = 1200;
/** Rows a long list draws at a time. */
export const LONG_LIST_PAGE = 40;

/**
 * A long list (what Life remembers, what it knows, your people, a conversation) draws a page of rows at a time and
 * the next as you scroll near the end (`Page`'s `onEnd`), so a year of records never builds hundreds of rows at
 * once. `from: 'end'` keeps the newest rows, for a conversation. The rows stay inside their card, as on the board.
 */
export function useLongList<T>(items: T[], { page = LONG_LIST_PAGE, from = 'start' }: { page?: number; from?: 'start' | 'end' } = {}) {
  const [shown, setShown] = useState(page);
  const visible = items.length <= shown ? items : from === 'end' ? items.slice(items.length - shown) : items.slice(0, shown);
  const more = items.length - visible.length;
  const showMore = useCallback(() => setShown(n => (n < items.length ? n + page : n)), [items.length, page]);
  return { visible, more, showMore };
}

/** The way to the rest of a long list for anyone not scrolling: VoiceOver, TalkBack, a keyboard. */
export function MoreRows({ more, onPress, earlier, style }: { more: number; onPress: () => void; earlier?: boolean; style?: StyleProp<ViewStyle> }) {
  if (more <= 0) return null;
  const n = Math.min(more, LONG_LIST_PAGE);
  return <QuietLink label={earlier ? `Show ${n} earlier` : `Show ${n} more`} onPress={onPress} style={[{ marginTop: space.sm }, style]} />;
}

/** How a page leaves in the web preview: short, moving at once and easing to a stop, so the page underneath shows
 *  without a gap. A spring would settle too slowly to hand over in time. */
const LEAVE = { duration: 180, easing: Easing.out(Easing.cubic) } as const;

/**
 * Keeps a sheet only as tall as its content. On a phone it asks the native sheet to rest at the content's height
 * (capped at 92% of the screen); in the web preview it tells the page to draw the sheet itself.
 */
function useSheetFit(on: boolean) {
  const navigation = useRouterNavigation();
  const { height: screenH } = useWindowDimensions();
  const parts = useRef({ top: 0, body: 0, foot: 0 });
  const [total, setTotal] = useState(0);
  const part = useCallback((k: 'top' | 'body' | 'foot', h: number) => {
    parts.current[k] = Math.round(h);
    const next = parts.current.top + parts.current.body + parts.current.foot;
    setTotal(c => (Math.abs(c - next) < 8 ? c : next));
  }, []);
  useEffect(() => {
    if (!on || Platform.OS === 'web' || !total || !parts.current.body) return;
    const detent = Math.min(0.92, Math.max(0.3, (total + 12) / screenH));
    // The sheet group is the parent screen; asking it to rest at this height. If a platform ignores it, the sheet stays as it was.
    try { (navigation.getParent() as { setOptions?: (o: object) => void } | undefined)?.setOptions?.({ sheetAllowedDetents: [Number(detent.toFixed(3))], sheetInitialDetentIndex: 0 }); } catch { /* keep the default height */ }
  }, [on, total, screenH, navigation]);
  return { part, web: Platform.OS === 'web' };
}

/**
 * A drawer over a photograph (board `.sheet`) is only as tall as what's in it; the photograph takes the rest. Put
 * `onLayout` on the drawer and draw the photo `height` tall: it ends just under the drawer's rounded top.
 * `bar` is the height of the bar above the content (the photo bar by default, 0 for none).
 */
export function useDrawerPhoto(bar: number = componentSize.topBarV26) {
  const insets = useSafeAreaInsets();
  const [y, setY] = useState(0);
  const onLayout = useCallback((e: { nativeEvent: { layout: { y: number } } }) => { const next = Math.round(e.nativeEvent.layout.y); setY(c => (c === next ? c : next)); }, []);
  return { height: y ? insets.top + bar + y + radius.xl : undefined, onLayout };
}

/** The style a drawer over a photograph shares: hugging its content, rounded on top, shrinking (and scrolling) if it must. */
export const drawerStyle = { flexShrink: 1, minHeight: 0, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl } as const;

/** The sheet's grabber, drawn by the page because the native sheet hides its own (board `.handle`). */
export function SheetHandle() {
  const t = useTokens();
  return (
    <View style={{ paddingTop: space.xs, paddingBottom: 14 }}>
      <View style={{ width: 36, height: 5, borderRadius: 3, alignSelf: 'center', backgroundColor: t.surface3 }} />
    </View>
  );
}

/* ───────────────────────── Plan chapter pieces ───────────────────────── */

type PhotoChipLike = string | { label: string; icon?: GlyphName; dot?: string };
const PaperChip = ({ chip }: { chip: PhotoChipLike }) => typeof chip === 'string'
  ? <StatusPill size="chip" onPhoto label={chip} />
  : <StatusPill size="chip" onPhoto label={chip.label} icon={chip.icon} dot={chip.dot} />;

/**
 * A photograph carrying one big figure low on it (board `BIG` on a `.pcard`): chips on the top line, a quiet line above
 * the figure, pence smaller beside it, one line under it.
 */
export function BigPhoto({ source, focal, height, chip, chipRight, topLeft, line, figure, pence, after, sub, onPress, style }: {
  source: ImageSourcePropType; focal?: Focal; height: number; chip?: PhotoChipLike; chipRight?: PhotoChipLike; topLeft?: ReactNode;
  line?: string; figure: string; pence?: string; after?: string; sub?: string; onPress?: () => void; style?: StyleProp<ViewStyle>;
}) {
  const t = useTokens();
  const label = [typeof chip === 'string' ? chip : chip?.label, line, `${figure}${pence ? `.${pence}` : ''}${after ?? ''}`, sub].filter(Boolean).join(', ');
  const inner = <>
    <PhotoFill source={source} focal={focal} />
    <LinearGradient pointerEvents="none" colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} />
    <View style={styles.bigTop}>{topLeft ?? (chip ? <PaperChip chip={chip} /> : <View />)}{chipRight ? <PaperChip chip={chipRight} /> : null}</View>
    <View style={{ paddingHorizontal: space.cardPad, paddingBottom: 18 }}>
      {line ? <Text variant="callout" style={{ color: photo.onPhoto2 }}>{line}</Text> : null}
      <Text variant="numeralPhoto" numberOfLines={1} adjustsFontSizeToFit style={{ color: photo.onPhoto }}>
        {figure}{pence ? <Text variant="heading" style={{ color: photo.onPhoto }}>{`.${pence}`}</Text> : null}{after ? <Text variant="headline" style={{ color: photo.onPhoto2 }}>{after}</Text> : null}
      </Text>
      {sub ? <Text variant="callout" style={{ color: photo.onPhoto2, marginTop: 2 }}>{sub}</Text> : null}
    </View>
  </>;
  const box: StyleProp<ViewStyle> = [styles.big, { height, backgroundColor: t.surface2, ...cardShadow(t.scheme) }, style];
  return onPress
    ? <Press haptic="open" onPress={onPress} accessibilityLabel={label} style={box}>{inner}</Press>
    : <View accessible accessibilityLabel={label} style={box}>{inner}</View>;
}

/** Cards resting behind the one in front (board `.stack` + `.peek`): their names peek above it, nearest last. */
export function PeekStack({ peeks, children, style }: { peeks: { left: string; right?: string; onPress?: () => void }[]; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  return (
    <View style={[{ paddingTop: 44 }, style]}>
      {peeks.slice(-2).map((p, i, all) => {
        const near = i === all.length - 1 && all.length > 1;
        const look = [styles.peek, near ? { left: space.tile, right: space.tile, top: 22, backgroundColor: t.surface2 } : { backgroundColor: t.surface3 }];
        const words = <><Text variant="micro" tone={near ? 'ink2' : 'quiet'} numberOfLines={1} style={{ flexShrink: 1 }}>{p.left}</Text>{p.right ? <Text variant="micro" tone={near ? 'ink2' : 'quiet'}>{p.right}</Text> : null}</>;
        return p.onPress
          ? <Press key={p.left} haptic="open" onPress={p.onPress} accessibilityLabel={`${p.left}${p.right ? `, ${p.right}` : ''}`} style={look}>{words}</Press>
          : <View key={p.left} style={look}>{words}</View>;
      })}
      <View style={{ position: 'relative' }}>{children}</View>
    </View>
  );
}

/** A small key under a chart (board `.legend`): a dot and a word each. */
export function Legend({ items, style }: { items: { label: string; color: string }[]; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }, style]}>
      {items.map(i => <View key={i.label} style={styles.micro}><View style={[styles.legendDot, { backgroundColor: i.color }]} /><Text variant="callout" tone="ink2">{i.label}</Text></View>)}
    </View>
  );
}

/** Figures in even columns (board `.cols`): a micro label, the figure, a quiet line. */
export function Cols({ items, style }: { items: { small: string; value: string; sub?: string; tone?: Tone }[]; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', gap: space.xs }, style]}>
      {items.map(c => (
        <View key={c.small} style={{ flex: 1, minWidth: 0 }} accessible accessibilityLabel={[c.small, c.value, c.sub].filter(Boolean).join(' ')}>
          <Text variant="micro" tone="ink2">{c.small}</Text>
          <Text variant="headline" tone={c.tone} numberOfLines={1} adjustsFontSizeToFit style={{ marginTop: 2, fontVariant: ['tabular-nums'] }}>{c.value}</Text>
          {c.sub ? <Text variant="callout" tone="ink2">{c.sub}</Text> : null}
        </View>
      ))}
    </View>
  );
}

/** A shelf of small photographs that scrolls sideways (board `.hscroll` of `.ptile`). */
export function Shelf({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[{ marginHorizontal: -space.gutter }, style]} contentContainerStyle={{ paddingHorizontal: space.gutter, gap: space.tile, paddingBottom: space.xxs }}>
      {children}
    </ScrollView>
  );
}

/** One small photograph with its name low on it (board `.ptile`). */
export function PhotoTile({ source, focal, title, meta, metaIcon, width = 112, height = 150, onPress }: { source: ImageSourcePropType; focal?: Focal; title: string; meta?: string; metaIcon?: GlyphName; width?: number; height?: number; onPress?: () => void }) {
  const t = useTokens();
  const inner = <>
    <PhotoFill source={source} focal={focal} />
    <LinearGradient pointerEvents="none" colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} />
    <View style={{ paddingHorizontal: space.sm, paddingVertical: space.tile }}>
      <Text variant="buttonCompact" style={{ color: photo.onPhoto }}>{title}</Text>
      {meta ? <View style={[styles.micro, { gap: space.xxs, marginTop: 3 }]}>{metaIcon ? <Icon name={metaIcon} size={14} color={photo.onPhoto2} /> : null}<Text variant="micro" style={{ color: photo.onPhoto2 }}>{meta}</Text></View> : null}
    </View>
  </>;
  const box = [styles.ptile, { width, height, backgroundColor: t.surface2, ...cardShadow(t.scheme) }];
  return onPress ? <Press haptic="open" onPress={onPress} accessibilityLabel={[title, meta].filter(Boolean).join(', ')} style={box}>{inner}</Press> : <View style={box}>{inner}</View>;
}

/** A plain white card (board `.card`): surface, shadow, the card radius. */
export function Box({ children, pad = space.cardPad, onPress, accessibilityLabel, style }: { children: ReactNode; pad?: number; onPress?: () => void; accessibilityLabel?: string; style?: StyleProp<ViewStyle> }) {
  return <Card padding={pad} onPress={onPress} accessibilityLabel={accessibilityLabel} style={style}>{children}</Card>;
}

const styles = StyleSheet.create({
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  micro: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  dot: { width: 6, height: 6, borderRadius: 3 },
  well: { width: componentSize.round, height: componentSize.round, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  tick: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  round: { width: componentSize.round, height: componentSize.round, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  webSheet: { flexShrink: 1, minHeight: 0, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, overflow: 'hidden' },
  photoBar: { height: componentSize.topBarV26, paddingHorizontal: space.gutter, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  big: { borderRadius: radius.photo, overflow: 'hidden', justifyContent: 'space-between' },
  bigTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: space.md },
  peek: { position: 'absolute', left: space.lg, right: space.lg, top: 0, height: 60, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, paddingVertical: 7, paddingHorizontal: space.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: space.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  ptile: { borderRadius: radius.tile, overflow: 'hidden', justifyContent: 'flex-end' },
});
