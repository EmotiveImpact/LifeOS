/**
 * States, drawn as states of their parent screen (its bar, its shape), restyled to the V26 board (`states-outside.js`).
 * Real accounts (no sample life) meet the day-one states on their own: Today and Plan until the first thing is filed,
 * Body until health data is allowed and arrives.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { AppState, Linking, Modal, Platform, Share, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import {
  Badge, ChatBubble, DotGrid, FullPhotoScreen, Icon, LifeOrb, PhotoCard, PhotoFill, PhotoGrid, Press, RoundButton, Ruler, SectionHead, StatusPill, SwitchV26,
  Text, TileGrid, TintCard, cardShadow, componentSize, feedback, floatLift, photo, photoScrims, photos, radius, space, useCalmMotion, useTokens,
  type DotCell, type TopBarAction,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import type { ScreenKey } from '@/navigation/screens';
import { useSeed } from '@/state/SeedProvider';
import { useLocalDay } from '@/state/day';
import { budgetScale, fuelShare, useFuelDay } from '@/state/fuel';
import { SHOW_SAMPLES } from '@/state/sample';
import { money, seed } from '@/state/seed';
import { bufferMonths } from '@/state/plan';
import { hm } from '@/state/today';
import { signInWith } from '@/services/account';
import {
  HELPLINES, STILL_WORKING, lifeDay, longDate, offlineMoney, phoneOnly, quietDevice, readChatQueue, syncConflict, taxYearMonths, useHealthConsent,
} from '@/state/firstopen';
import { Corners, PaperLink, PhotoStatus } from './firstopen';
import { Composer } from './talk';
import { SearchV26, TodayV26 } from './today';
import { Between, Body, Box, Btn, Callout, Chip, Display, Eyebrow, Micro, Page, PhotoTile, QuietLink, Row, RowsCard, Shelf, Statement, two } from './kit';
import { TodayLoops } from './loops';

const shortDate = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '');
const dayMonth = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });

/* ───────────────────────── Small pieces ───────────────────────── */

/** Search over the page, as Today and Plan open it. */
function useSearchOverlay() {
  const [open, setOpen] = useState(false);
  const modal = (
    <Modal visible={open} animationType="fade" presentationStyle="fullScreen" onRequestClose={() => setOpen(false)}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}><SearchV26 onClose={() => setOpen(false)} /></SafeAreaProvider>
    </Modal>
  );
  return { open: () => setOpen(true), modal };
}

/** A soft block holding the shape of what is arriving (board `.so-sk`). Breathes, or rests still with Reduce Motion. */
function Sk({ w, h, r, deep, late, style }: { w: number | `${number}%`; h: number; r: number; deep?: boolean; late?: boolean; style?: object }) {
  const t = useTokens(), calm = useCalmMotion();
  const o = useSharedValue(1);
  useEffect(() => {
    if (calm) { o.value = 1; return; }
    const breathe = withRepeat(withTiming(0.5, { duration: 900 }), -1, true);
    o.value = late ? withDelay(350, breathe) : breathe;
  }, [calm, late, o]);
  const anim = useAnimatedStyle(() => ({ opacity: o.value }));
  return <Animated.View style={[{ width: w, height: h, borderRadius: r, backgroundColor: deep ? t.surface3 : t.surface2 }, anim, style]} />;
}

/** A photograph card with the big 30pt line (board deck card and update card). */
function SerifPhoto({ source, focal, height, chip, title, sub, onPress, children, style }: { source: number; focal?: { x?: number; y?: number }; height: number; chip: string; title: string; sub?: string; onPress?: () => void; children?: ReactNode; style?: object }) {
  const t = useTokens();
  const inner = <>
    <PhotoFill source={source} focal={focal} />
    <LinearGradient pointerEvents="none" colors={photoScrims.deck.colors} locations={photoScrims.deck.locations} style={StyleSheet.absoluteFill} />
    <StatusPill size="chip" onPhoto label={chip} style={{ alignSelf: 'flex-start' }} />
    <View>
      <Text variant="titleSerif" tone="paper" numberOfLines={3}>{title}</Text>
      {sub ? <Text variant="body" tone="paper2" style={{ marginTop: 6 }}>{sub}</Text> : null}
      {children}
    </View>
  </>;
  const box = [styles.serif, { height, backgroundColor: t.surface2 }];
  return (
    <View style={[{ borderRadius: radius.photo, ...cardShadow(t.scheme) }, style]}>
      {onPress ? <Press haptic="open" onPress={onPress} accessibilityLabel={[chip, title, sub].filter(Boolean).join(', ')} style={box}>{inner}</Press>
        : <View accessible accessibilityLabel={[chip, title, sub].filter(Boolean).join(', ')} style={box}>{inner}</View>}
    </View>
  );
}

/** A photograph carrying one reading (board Body `live` card): its label, the 32pt figure, where it came from. */
function ReadingPhoto({ source, focal, label, value, sub, onPress }: { source: number; focal?: { x?: number; y?: number }; label: string; value: string; sub: string; onPress?: () => void }) {
  const t = useTokens();
  const inner = <>
    <PhotoFill source={source} focal={focal} />
    <LinearGradient pointerEvents="none" colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} />
    <StatusPill size="chip" onPhoto label={label} style={{ alignSelf: 'flex-start' }} />
    <View><Text variant="numeralL" tone="paper">{value}</Text><Text variant="callout" tone="paper2" numberOfLines={2}>{sub}</Text></View>
  </>;
  const box = [styles.reading, { backgroundColor: t.surface2 }];
  return (
    <View style={{ borderRadius: radius.photo, ...cardShadow(t.scheme) }}>
      {onPress ? <Press haptic="open" onPress={onPress} accessibilityLabel={`${label}, ${value}, ${sub}`} style={box}>{inner}</Press>
        : <View accessible accessibilityLabel={`${label}, ${value}, ${sub}`} style={box}>{inner}</View>}
    </View>
  );
}

/** A reading resting with its last sync (board `.so-stale`): the figure a quiet dash. */
function StaleTile({ label, scale, last }: { label: string; scale: string; last: string }) {
  const t = useTokens();
  return (
    <View accessible accessibilityLabel={`${label}, no new reading. Last: ${last}`} style={[styles.tile, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
      <Between><View style={styles.inline}><View style={[styles.dot, { backgroundColor: t.surface3 }]} /><Text variant="callout" tone="ink2">{label}</Text></View><Text variant="micro" tone="quiet">{scale}</Text></Between>
      <Text variant="numeralL" tone="quiet" style={{ marginTop: 14 }}>–</Text>
      <Text variant="callout" tone="ink2" style={{ marginTop: 2 }}>{`Last: ${last}`}</Text>
    </View>
  );
}

/* ───────────────────────── Today, on day one ───────────────────────── */

export function EmptyTodayV26() {
  const t = useTokens(), nav = useNavigation(), { data } = useSeed(), { now } = useLocalDay(), search = useSearchOverlay();
  const actions: TopBarAction[] = [{ kind: 'icon', icon: 'search', label: 'Search everything', onPress: search.open }];
  return (
    <Page screen="today" bar={{ kind: 'root', title: 'Today', sub: shortDate(now), actions }}>
      <Between>
        <Text variant="callout" tone="ink2" numberOfLines={1} style={{ flexShrink: 1 }}>{data.profile.name ? `Welcome, ${data.profile.name}` : 'Welcome'}</Text>
        <Chip label={`Day ${lifeDay(data, now)}`} tone="q" />
      </Between>
      <Display s="Nothing here yet. {@mic Talk for a minute} and Life will {fill this in.}" />
      <SectionHead title="Your first move" link="About a minute" />
      <View style={{ height: 250 }}>
        <View pointerEvents="none" style={[styles.deckBack, { backgroundColor: t.surface3 }]} />
        <View style={[styles.deckFront, { borderRadius: radius.xl, ...floatLift(t.scheme) }]}>
          <Press haptic="open" onPress={() => nav.go('talk')} accessibilityLabel="Say it out loud. Tell Life what’s going on. Rent, a letter, a birthday. Life files it." style={[styles.deckCard, { backgroundColor: t.surface2 }]}>
            <PhotoFill source={photos.walk} focal={{ y: 0.44 }} />
            <LinearGradient pointerEvents="none" colors={photoScrims.deck.colors} locations={photoScrims.deck.locations} style={StyleSheet.absoluteFill} />
            <StatusPill size="chip" onPhoto label="Say it out loud" style={{ alignSelf: 'flex-start' }} />
            <View>
              <Text variant="titleSerif" tone="paper" numberOfLines={2}>Tell Life what’s going on</Text>
              <Text variant="body" tone="paper2" style={{ marginTop: 6 }}>Rent, a letter, a birthday. Life files it.</Text>
            </View>
          </Press>
        </View>
      </View>
      <Btn label="Talk to Life" icon="mic" onPress={() => nav.go('talk')} style={{ marginTop: space.md }} />
      <TodayLoops />
      <Callout center style={{ marginTop: space.sm }}>Nothing is saved until you say so.</Callout>
      <Box onPress={() => nav.go('knows')} accessibilityLabel="Life knows you, 0%" style={{ marginTop: space.lg }}>
        <Between><Text variant="title">Life knows you</Text><Text variant="title">0%</Text></Between>
        <Ruler pct={0} style={{ marginTop: space.sm }} />
        <Callout style={{ marginTop: space.tile }}>Your moves, questions and things to know will appear here.</Callout>
      </Box>
      {search.modal}
    </Page>
  );
}

/* ───────────────────────── Today, loading ───────────────────────── */

/** The shape of Today, arriving, while the orb in the bar thinks. Tap the page and Today lands in the same shape. */
export function LoadingTodayV26() {
  const t = useTokens(), nav = useNavigation(), { data } = useSeed(), { now } = useLocalDay(), search = useSearchOverlay();
  const [landed, setLanded] = useState(false);
  if (landed) return <TodayV26 />;
  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const tile = <View style={[styles.tile, { backgroundColor: t.surface, ...cardShadow(t.scheme), flex: 1 }]}>
    <Sk w="56%" h={10} r={5} late style={{ marginVertical: 4 }} /><Sk w="48%" h={26} r={9} late style={{ marginTop: 19, marginBottom: 5 }} /><Sk w="80%" h={10} r={5} late style={{ marginTop: 6, marginBottom: 4 }} />
  </View>;
  const bar = (
    <View style={styles.idRow}>
      <LifeOrb size={22} state="thinking" />
      <Text variant="title" accessibilityRole="header">Today</Text>
      <Text variant="callout" tone="ink2" numberOfLines={1}>{shortDate(now)}</Text>
    </View>
  );
  return (
    <Page screen="today" bar={{ kind: 'photo', left: bar, right: <View style={styles.inline}><RoundButton icon="search" label="Search everything" onPress={search.open} /><RoundButton icon="bell" label="From Life" onPress={() => nav.go('inbox')} /></View> }}>
      <Press haptic="select" onPress={() => setLanded(true)} accessibilityLabel="Today is loading. Tap to show it" accessibilityRole="progressbar">
        <Between><Text variant="callout" tone="ink2" numberOfLines={1}>{`${greeting}, ${data.profile.name}`}</Text><Sk w={118} h={25} r={13} deep /></Between>
        <View style={styles.lines}><Sk w="92%" h={26} r={10} deep /><Sk w="70%" h={26} r={10} deep /><Sk w="86%" h={26} r={10} deep /><Sk w="48%" h={26} r={10} deep /></View>
        <View style={[styles.checked, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
          <Sk w={32} h={32} r={16} />
          <View style={{ flex: 1, minWidth: 0 }}><Sk w="58%" h={10} r={5} style={{ marginVertical: 5 }} /><Sk w="84%" h={10} r={5} style={{ marginTop: 9, marginBottom: 4 }} /></View>
          <Sk w={48} h={10} r={5} />
        </View>
        <Between style={{ marginTop: space.lg }}><Sk w="36%" h={13} r={6} deep style={{ marginVertical: 4 }} /><Sk w="14%" h={10} r={5} deep /></Between>
        <View style={{ height: 262, marginTop: space.sm }}>
          <View pointerEvents="none" style={[styles.deckBack, { backgroundColor: t.surface3 }]} />
          <Sk w="100%" h={242} r={radius.xl} deep late style={{ position: 'absolute', left: 0, right: 0, top: 20 }} />
        </View>
        <View style={styles.decide}><Sk w={48} h={40} r={20} deep late /><Sk w={76} h={48} r={24} deep late /><Sk w={48} h={40} r={20} deep late /></View>
        <Between style={{ marginTop: space.lg }}><Sk w="16%" h={13} r={6} deep late style={{ marginVertical: 4 }} /><Sk w="40%" h={10} r={5} deep late /></Between>
        <View style={[styles.inline, { gap: space.tile, marginTop: space.sm, alignItems: 'stretch' }]}>{tile}{tile}</View>
      </Press>
      {search.modal}
    </Page>
  );
}

/* ───────────────────────── Plan, on day one ───────────────────────── */

const AREAS: { photo: keyof typeof photos; focal: { y: number }; name: string; to: ScreenKey }[] = [
  { photo: 'payslip', focal: { y: 0.85 }, name: 'Money', to: 'area' },
  { photo: 'movein', focal: { y: 0.82 }, name: 'Home', to: 'areahome' },
  { photo: 'walk', focal: { y: 0.48 }, name: 'Body', to: 'areahealth' },
  { photo: 'areawork', focal: { y: 0.8 }, name: 'Work', to: 'areawork' },
];

export function EmptyPlanV26() {
  const nav = useNavigation(), search = useSearchOverlay();
  return (
    <Page screen="plan" bar={{ kind: 'root', title: 'Plan', actions: [{ kind: 'icon', icon: 'search', label: 'Search', onPress: search.open }, { kind: 'icon', icon: 'add', label: 'Add to plan', onPress: () => nav.go('newgoal') }] }}>
      <Eyebrow star>Your plan · day one</Eyebrow>
      <Display s="{Nothing here yet.} Missions appear as Life finds things worth doing." />
      <PhotoCard source={photos.letter} focal={{ y: 0.58 }} height={270} chips={['Suggested first mission · 5 min']} title="Find money you’re owed" sub="Tax rebates, refunds, unclaimed schemes" style={{ marginTop: space.lg }}>
        <Btn label="Start" icon="arrow" trail onPhoto onPress={() => nav.go('taxcheck')} style={{ marginTop: space.md }} />
      </PhotoCard>
      <SectionHead title="Your areas" link="No missions yet" />
      <PhotoGrid>
        {AREAS.map(a => <PhotoCard key={a.name} source={photos[a.photo]} focal={a.focal} height={150} size="md" title={a.name} onPress={() => nav.go(a.to)} />)}
      </PhotoGrid>
      {search.modal}
    </Page>
  );
}

/* ───────────────────────── Body, with no device (and with health off) ───────────────────────── */

export function EmptyBodyV26() {
  const t = useTokens(), nav = useNavigation(), { data } = useSeed(), consent = useHealthConsent();
  if (!consent.allowed) return <HealthOffV26 screen="body" />;
  const steps = SHOW_SAMPLES ? phoneOnly.steps.toLocaleString('en-GB') : '–', sleep = SHOW_SAMPLES ? phoneOnly.sleep : '–';
  const share = SHOW_SAMPLES ? () => { void Share.share({ message: `${steps} steps today, about ${sleep.replace('~', '')} of sleep. Made with Life.` }); } : undefined;
  const adds = [['Readiness', 'Needs heart-rate variability'], ['Sleep stages', 'Needs a watch or ring'], ['Load', 'Needs heart rate']];
  return (
    <Page screen="body" bar={{ kind: 'push', title: 'Body', action: share ? { kind: 'icon', icon: 'arrowUp', label: 'Share', onPress: share } : undefined }}
      footer={<Btn label="Connect a device" icon="watch" onPress={() => nav.go('devices')} />}>
      <Chip label="From your phone" tone="q" />
      <Display s="{Good enough to start.} A watch or ring adds more." />
      <PhotoGrid style={{ marginTop: space.lg }}>
        <ReadingPhoto source={photos.walk} focal={{ y: 0.46 }} label="Steps today" value={steps} sub={SHOW_SAMPLES ? 'Counted by your phone' : 'Your phone’s first count is on its way'} />
        <ReadingPhoto source={photos.bedroom} focal={{ x: 0.3, y: 0.62 }} label="Sleep, estimated" value={sleep} sub="From when your phone is untouched" />
      </PhotoGrid>
      <View style={[styles.tile, { marginTop: space.sm, backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
        <Between><Text variant="callout" tone="ink2">A watch or ring adds</Text><Text variant="micro" tone="quiet">Device</Text></Between>
        <View style={[styles.inline, { gap: space.xs, marginTop: space.sm, alignItems: 'stretch' }]}>
          {adds.map(([name, needs]) => (
            <View key={name} accessible accessibilityLabel={`${name}. ${needs}`} style={[styles.sub, { backgroundColor: t.surface2 }]}>
              <Text variant="micro" tone="ink2">{name}</Text>
              <Text variant="headline" tone="quiet">–</Text>
              <Text variant="micro" tone="quiet" style={{ marginTop: 2 }}>{needs}</Text>
            </View>
          ))}
        </View>
      </View>
      <Callout style={{ marginTop: space.md }}>{data.prefs.privateMode ? 'Wellness guidance from your own readings, not a diagnosis. Private mode is on.' : 'Wellness guidance from your own readings, not a diagnosis.'}</Callout>
    </Page>
  );
}

/**
 * Body while health data is off (never agreed, said no, or withdrawn). Nothing about the body is read or shown; one
 * button goes back to the consent step. Not on the board: the gap list's health-data consent (Edem, 20 Nov).
 */
export function HealthOffV26({ screen }: { screen: ScreenKey }) {
  const nav = useNavigation(), consent = useHealthConsent();
  const when = consent.withdrawnAt ? `Turned off ${longDate(consent.withdrawnAt)}` : consent.declined ? 'You said not now' : 'Health is off';
  return (
    <Page screen={screen} bar={{ kind: 'push', title: 'Body' }} footer={<Btn label="Turn on health data" icon="heart" onPress={() => nav.go('healthconsent', { next: 'body' })} />}>
      <Chip label={when} tone="q" />
      <Display s="{Body is off.} Say yes to health data and it fills in from your phone." />
      <PhotoGrid style={{ marginTop: space.lg }}>
        <ReadingPhoto source={photos.walk} focal={{ y: 0.46 }} label="Steps today" value="–" sub="Off until you say yes" />
        <ReadingPhoto source={photos.bedroom} focal={{ x: 0.3, y: 0.62 }} label="Sleep" value="–" sub="Off until you say yes" />
      </PhotoGrid>
      <Body s="While it is off, Life reads and keeps {nothing about your body}. Your plan, money and everything else still work." style={{ marginTop: space.md }} />
    </Page>
  );
}

/* ───────────────────────── A device stopped syncing ───────────────────────── */

export function ConnectFailV26() {
  const nav = useNavigation(), fuel = useFuelDay(), { data, flag } = useSeed();
  const open = async () => {
    feedback.primary();
    try { if (await Linking.canOpenURL(quietDevice.url)) { await Linking.openURL(quietDevice.url); return; } } catch { /* no device app on this phone */ }
    flag('device-retry', true);
  };
  return (
    <Page screen="body" bar={{ kind: 'push', title: 'Body', action: { kind: 'icon', icon: 'arrowUp', label: 'Share', onPress: () => { void Share.share({ message: fuel.ready ? `Fuel ${fuel.eaten.toLocaleString('en-GB')} of ${fuel.budget.toLocaleString('en-GB')} kcal today. Made with Life.` : `Fuel ${fuel.eaten.toLocaleString('en-GB')} kcal so far today. Made with Life.` }); } } }}>
      <Chip label={`${quietDevice.name} · ${quietDevice.last}`} icon="clock" tone="q" />
      <Display s={`{${quietDevice.name}} hasn’t synced {since ${quietDevice.last}.}`} />
      <PhotoCard source={photos.bedroom} focal={{ y: 0.52 }} height={236} size="md" chips={['The fix that usually works']} title={`Open the ${quietDevice.name} app once to send last night’s sleep.`} style={{ marginTop: space.lg }}>
        <Btn label={data.flags['device-retry'] ? 'Waiting for a new reading' : `Open ${quietDevice.name}`} icon="arrow" trail onPhoto onPress={() => { void open(); }} style={{ marginTop: space.md }} />
      </PhotoCard>
      <TileGrid style={{ marginTop: space.sm }}>
        <StaleTile label="Readiness" scale="/100" last={quietDevice.last} />
        <StaleTile label="Sleep" scale={`/${hm(seed.health.sleepNeed)}`} last={quietDevice.last} />
      </TileGrid>
      <TintCard area="home" onPress={() => nav.go('fuel')} accessibilityLabel={`Fuel, ${fuel.eaten} ${fuel.ready ? `of ${fuel.budget} kcal` : 'kcal so far'}. Logged by you, so still up to date.`} style={{ marginTop: space.tile }}>
        <Between><View style={styles.inline}><Badge icon="food" /><Text variant="callout" tone="ink2">Fuel</Text></View><Text variant="micro" tone="quiet">{budgetScale(fuel)}</Text></Between>
        <Text variant="numeralL" style={{ marginTop: 14 }}>{fuel.eaten.toLocaleString('en-GB')}</Text>
        <Meter value={fuelShare(fuel)} />
        <Callout style={{ marginTop: space.tile }}>Logged by you, so still up to date.</Callout>
      </TintCard>
      <Callout style={{ marginTop: space.md }}>Wellness guidance from your own readings, not a diagnosis.</Callout>
    </Page>
  );
}

/** The 6pt meter in the area's colour (board `.meter`). */
function Meter({ value }: { value: number }) {
  const t = useTokens();
  return <View style={[styles.meter, { backgroundColor: t.surface3 }]}><View style={{ width: `${Math.max(0, Math.min(1, value)) * 100}%`, height: '100%', borderRadius: radius.full, backgroundColor: t.ink }} /></View>;
}

/* ───────────────────────── Offline: Money, from what was saved ───────────────────────── */

export function OfflineV26() {
  const nav = useNavigation(), { data, flag, pref } = useSeed();
  const hide = data.prefs.hideBalances;
  const [pounds, pence] = money(offlineMoney.balance, 2).split('.');
  const retry = () => { feedback.select(); flag('offline-retry', true); };
  return (
    <Page screen="money" bar={{ kind: 'push', title: 'Money', action: { kind: 'icon', icon: hide ? 'eyeOff' : 'eye', label: hide ? 'Show balances' : 'Hide balances', onPress: () => pref('hideBalances', !hide) } }}>
      <Statement s={`You’re {offline.} Showing what was saved {${offlineMoney.savedAgo}.}`} />
      <TintCard area="money" style={{ marginTop: space.lg }}>
        <Between><View style={styles.inline}><Badge icon="wallet" /><Text variant="callout" tone="ink2">All accounts</Text></View><Text variant="callout" tone="ink2">{`Updated ${offlineMoney.savedAgo}`}</Text></Between>
        <Text variant="numeralXl" style={{ marginTop: 14 }}>{hide ? '£•••' : pounds}{hide || !pence ? null : <Text variant="numeralXl" tone="ink2">{`.${pence}`}</Text>}</Text>
      </TintCard>
      <Box style={{ marginTop: space.sm }}>
        <Between><Micro>Last 14 days</Micro><Micro>{`${offlineMoney.unsynced} not synced yet`}</Micro></Between>
        <DotGrid cells={offlineMoney.days14} columns={14} label={`${14 - offlineMoney.unsynced} of the last 14 days synced`} style={{ marginTop: space.sm }} />
        <Text variant="headline" style={{ marginTop: space.lg }}>Couldn’t reach your bank</Text>
        <Body s={`Your last ${offlineMoney.unsynced} days of transactions haven’t synced. Nothing is lost, and Life will try again when you’re back online.`} style={{ marginTop: space.xxs }} />
        <Btn label={data.flags['offline-retry'] ? 'Will try again when you’re back' : 'Try again'} icon="repeat" onPress={retry} style={{ marginTop: space.md }} />
      </Box>
      <SectionHead title="Saved on this phone" />
      <RowsCard>
        {offlineMoney.saved.map(s => <Row key={s.title} photo={photos[s.photo]} thumbFocal={s.focal} title={s.title} sub={s.sub} end={hide ? '£•••' : money(s.amount, 2)} />)}
      </RowsCard>
    </Page>
  );
}

/* ───────────────────────── A permission you said no to ───────────────────────── */

export function PermDeniedV26() {
  const t = useTokens(), nav = useNavigation(), { flag, choose } = useSeed();
  // Back from Settings with the camera on: go straight to the camera.
  useEffect(() => {
    const sub = AppState.addEventListener('change', async s => {
      if (s !== 'active') return;
      try { if ((await ImagePicker.getCameraPermissionsAsync()).granted) { flag('camera-preview', true); choose('camera-permission', ''); nav.replace('snap'); } } catch { /* no camera on this device */ }
    });
    return () => sub.remove();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const settings = async () => {
    feedback.primary();
    try {
      const p = await ImagePicker.getCameraPermissionsAsync();
      // Never asked yet (only "Not now" on life's own screen): the phone can still ask, so ask.
      if (!p.granted && p.canAskAgain) { if ((await ImagePicker.requestCameraPermissionsAsync()).granted) { flag('camera-preview', true); choose('camera-permission', ''); nav.replace('snap'); } return; }
    } catch { /* fall through to Settings */ }
    void Linking.openSettings();
  };
  return (
    <Page screen="snap" bar={{ kind: 'push', close: true }}
      footer={<><Btn label="Open Settings" onPress={() => { void settings(); }} /><QuietLink label="Not now" onPress={nav.close} /></>}>
      <View style={[styles.finder, { backgroundColor: t.surface2, ...cardShadow(t.scheme) }]}>
        <PhotoFill source={photos.letter} />
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: photo.shade }]} />
        <Corners inset={18} top={18} bottom={18} />
        <View style={[styles.app, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}><Icon name="camera" size={componentSize.icon} color={t.ink} /></View>
        <Chip label="Camera off" onPhoto style={{ alignSelf: 'center' }} />
      </View>
      <Text variant="titleSerif" accessibilityRole="header" style={{ marginTop: space.lg }}>The camera is off for Life</Text>
      <Body s="To snap meals and letters, turn on the camera for Life in Settings. {Everything else works without it.}" style={{ marginTop: space.xs }} />
      <Box pad={space.md} style={{ marginTop: space.lg }}>
        <View style={styles.inline}>
          <View style={[styles.ic, { backgroundColor: t.surface2 }]}><Icon name="camera" size={componentSize.iconSm} color={t.ink} /></View>
          <View style={{ flex: 1, minWidth: 0 }}><Text variant="rowTitle">Camera</Text><Text variant="callout" tone="ink2">Settings · Life</Text></View>
          <SwitchV26 value={false} onChange={() => { void settings(); }} accessibilityLabel="Camera, in Settings" />
        </View>
      </Box>
    </Page>
  );
}

/* ───────────────────────── Two phones disagree ───────────────────────── */

export function SyncIssueV26() {
  const t = useTokens(), nav = useNavigation(), { choose, flag } = useSeed();
  const [pick, setPick] = useState<number>(syncConflict.here);
  const choice = (day: number, where: string) => {
    const on = pick === day;
    return (
      <Press key={day} haptic="select" onPress={() => setPick(day)} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={`The ${day}th, ${where}`}
        style={[styles.choice, { backgroundColor: on ? t.ink : t.surface2 }]}>
        <Text variant="callout" style={{ color: on ? t.canvas : t.ink2, opacity: on ? 0.7 : 1 }}>{where}</Text>
        <Text variant="numeralXl" style={{ color: on ? t.canvas : t.ink }}>{day}<Text variant="callout" style={{ color: on ? t.canvas : t.ink2 }}>th</Text></Text>
      </Press>
    );
  };
  const keep = () => { choose('payday-day', String(pick)); flag('sync-conflict-resolved', true); feedback.file(); nav.close(); };
  return (
    <Page screen="syncissue" bar={{ kind: 'sheet' }}>
      <Between style={{ alignItems: 'flex-start' }}>
        <Statement header s={`Which {@calendar ${syncConflict.label}} is right?`} style={{ flex: 1, minWidth: 0 }} />
        <RoundButton icon="close" size="sm" label="Decide later" onPress={nav.close} />
      </Between>
      <Body s={`You changed it on two phones while offline: the ${syncConflict.here}th here, the ${syncConflict.there}th on ${syncConflict.where}.`} style={{ marginTop: space.xs }} />
      <View style={[styles.inline, { gap: space.tile, marginTop: space.md }]}>{choice(syncConflict.here, 'This phone')}{choice(syncConflict.there, 'Your other phone')}</View>
      <Btn label={`Keep the ${pick}th`} onPress={keep} style={{ marginTop: space.md }} />
      <Callout center style={{ marginTop: space.sm }}>Life never drops a change without asking.</Callout>
    </Page>
  );
}

/* ───────────────────────── life’s AI is having a moment ───────────────────────── */

export function AidownV26() {
  const nav = useNavigation(), { data, choose } = useSeed();
  const queue = readChatQueue(data);
  const [text, setText] = useState(SHOW_SAMPLES && !queue.length ? 'Can I claim my software on the P87?' : '');
  const save = (next: string[]) => choose('chat-queue', JSON.stringify(next));
  const send = () => { const m = text.trim(); if (!m) return; save([...queue, m]); setText(''); feedback.file(); };
  return (
    <Page screen="chat" bar={{ kind: 'push', title: 'Chat', close: true, action: { kind: 'icon', icon: 'clock', label: 'Conversations', onPress: () => nav.go('chathistory') } }}
      contentStyle={{ flexGrow: 1 }}
      footer={queue.length
        ? <Composer value={text} onChange={setText} placeholder="Ask anything" onSend={send} />
        : <><Composer value={text} onChange={setText} placeholder="Ask anything" onSend={send} /><Btn label="Send it anyway, answer later" onPress={send} disabled={!text.trim()} /></>}>
      <LifeOrb size={48} />
      <Display s="Chat is {paused} for a few minutes." style={{ marginTop: space.md }} />
      <Body s="Your plan, tools and Body {all still work}. Anything you send now will be answered as soon as it’s back." style={{ marginTop: space.sm }} />
      <Micro style={{ marginTop: space.lg }}>STILL WORKING</Micro>
      <Shelf style={{ marginTop: space.sm }}>
        {STILL_WORKING.map(s => <PhotoTile key={s.title} source={photos[s.photo]} focal={s.focal} title={s.title} onPress={() => nav.go(s.to)} />)}
      </Shelf>
      <View style={{ flex: 1, minHeight: 20 }} />
      {queue.length ? (
        <View style={{ gap: space.xs }}>
          {queue.map((m, i) => <ChatBubble key={`${i}-${m}`} text={m} />)}
          <View style={[styles.inline, { alignSelf: 'flex-end', gap: 6 }]}>
            <Chip label="Queued · answered when chat is back" icon="clock" tone="q" />
            <Chip label="Undo" onPress={() => { const last = queue[queue.length - 1]; save(queue.slice(0, -1)); if (!text) setText(last); }} />
          </View>
        </View>
      ) : null}
    </Page>
  );
}

/* ───────────────────────── Update needed ───────────────────────── */

export function ForceupdateV26() {
  const { flag } = useSeed();
  const { into, began } = taxYearMonths();
  const last: DotCell[] = Array.from({ length: 12 }, () => 'on');
  const next: DotCell[] = Array.from({ length: 12 }, (_, k) => (k < into ? 'on' : k === into ? 'now' : ''));
  return (
    <Page screen="forceupdate" bar={{ kind: 'push', close: true }} footer={<Btn label="Update Life" icon="arrowDown" onPress={() => { feedback.primary(); flag('update-asked', true); }} />}>
      <SerifPhoto source={photos.payslip} focal={{ y: 0.86 }} height={270} chip="A quick update" title="The new tax year started." sub="This version still uses last year’s rules." />
      <Box style={{ marginTop: space.sm }}>
        <Between><Micro>Last tax year</Micro><Micro>The rules on this phone</Micro></Between>
        <DotGrid cells={last} columns={12} label="Last tax year, all 12 months" style={{ marginTop: space.sm }} />
        <Between style={{ marginTop: space.lg }}><Micro>This tax year</Micro><Micro>{`Began ${dayMonth(began)}`}</Micro></Between>
        <DotGrid cells={next} columns={12} label={`This tax year, ${into + 1} of 12 months`} style={{ marginTop: space.sm }} />
      </Box>
      <Callout style={{ marginTop: space.md }}>The update takes a minute, and keeps your numbers right.</Callout>
    </Page>
  );
}

/* ───────────────────────── Welcome back ───────────────────────── */

export function SignedOutV26() {
  const nav = useNavigation(), { set, flag, reset, joinAccount } = useSeed();
  const provider = Platform.OS === 'android' ? 'google' : 'apple';
  const signIn = async () => {
    feedback.primary();
    const result = await signInWith(provider);
    // Until the native Apple and Google sheets are installed, a live account signs in by email on the sign-in sheet.
    if (!result.ok) { nav.go('signin'); return; }
    if (result.mode === 'local-preview') { flag('signed-in-preview', true); set({ onboardingDone: true }); nav.home(); return; }
    // Welcome back brings the account's life onto this phone. If there was nothing to bring, setup starts as usual.
    const { setUp } = await joinAccount(result.data.userId, { restore: true });
    flag('signed-in', true);
    if (setUp) nav.home(); else nav.replace('welcome');
  };
  const fresh = async () => { if (await reset()) nav.replace('welcome'); };
  return (
    <View nativeID="screen-signedout" style={{ flex: 1, backgroundColor: photo.ink }}>
      <PhotoStatus />
      <FullPhotoScreen source={photos.journal} focal={{ x: 0.42 }} title="Welcome back." statement={two('Sign in to bring back your {plan}, {missions} and {history}.')}>
        <View style={{ marginTop: space.lg }}>
          <Btn label={`Continue with ${provider === 'apple' ? 'Apple' : 'Google'}`} onPhoto onPress={() => { void signIn(); }} />
          <View style={{ marginTop: space.sm }}><PaperLink label="Start fresh" onPress={() => { void fresh(); }} /></View>
          <Text variant="callout" align="center" style={{ color: photo.onPhoto2, marginTop: space.sm }}>Data on this phone is never mixed with someone else’s.</Text>
        </View>
      </FullPhotoScreen>
    </View>
  );
}

/* ───────────────────────── Need support now ───────────────────────── */

const QUIET_DAYS = 3;

export function SupportV26() {
  const t = useTokens(), { data, choose } = useSeed();
  // life goes quiet on nudges for a few days (unless already quieter for longer).
  useEffect(() => {
    const until = new Date(Date.now() + QUIET_DAYS * 86400000).toISOString();
    if ((data.choices['nudges-quiet-until'] ?? '') < until) choose('nudges-quiet-until', until);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const call = (url: string) => { feedback.primary(); void Linking.openURL(url); };
  return (
    <Page screen="support" bar={{ kind: 'push', title: 'Support' }}>
      <Display s="{You don’t have to sort this alone.}" flush />
      <Body s="These are free, confidential and open any time." style={{ marginTop: space.sm }} />
      <View style={{ gap: space.xs, marginTop: space.lg }}>
        {HELPLINES.map((h, i) => (
          <Box key={h.name} pad={space.md}>
            <View style={[styles.inline, { alignItems: 'flex-end', justifyContent: 'space-between' }]}>
              <View style={{ flexShrink: 1 }}>
                <Text variant="callout" tone="ink2">{h.name}</Text>
                <Text variant="numeralL" style={{ marginTop: 4 }}>{h.number}</Text>
                <Text variant="callout" tone="ink2" style={{ marginTop: 2 }}>{h.how}</Text>
              </View>
              <Btn label={h.action} sm fit ghost={i > 0} onPress={() => call(h.url)} />
            </View>
          </Box>
        ))}
      </View>
      <View style={[styles.urgent, { backgroundColor: t.surface2 }]}>
        <View style={{ flexShrink: 1 }}><Text variant="callout" tone="ink2">If you’re in danger right now</Text><Text variant="headline" style={{ marginTop: 2 }}>Call 999.</Text></View>
        <Btn label="Call" sm fit ghost onPress={() => call('tel:999')} style={{ backgroundColor: t.surface }} />
      </View>
      <Callout style={{ marginTop: space.lg }}>Life will go quiet on nudges for a few days unless you say otherwise.</Callout>
    </Page>
  );
}

const styles = StyleSheet.create({
  inline: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  idRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs, flex: 1, minWidth: 0 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  deckBack: { position: 'absolute', left: 14, right: 14, top: 9, height: 80, borderTopLeftRadius: 26, borderTopRightRadius: 26, opacity: 0.6 },
  deckFront: { position: 'absolute', left: 0, right: 0, top: 20, bottom: 0 },
  deckCard: { flex: 1, borderRadius: radius.xl, overflow: 'hidden', padding: space.md, justifyContent: 'space-between' },
  serif: { borderRadius: radius.photo, overflow: 'hidden', paddingTop: 14, paddingHorizontal: space.md, paddingBottom: space.md, justifyContent: 'space-between' },
  reading: { height: 200, borderRadius: radius.photo, overflow: 'hidden', paddingTop: 14, paddingHorizontal: space.md, paddingBottom: space.md, justifyContent: 'space-between' },
  tile: { borderRadius: radius.lg, padding: space.cardPad, minHeight: 118 },
  sub: { flex: 1, minWidth: 0, borderRadius: radius.md, padding: 10 },
  meter: { height: 6, borderRadius: radius.full, overflow: 'hidden', marginTop: space.sm },
  lines: { gap: 13, marginTop: space.tile, paddingTop: 6, paddingBottom: 7 },
  checked: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.lg, borderRadius: radius.lg, padding: space.md },
  decide: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.lg, marginTop: space.md },
  finder: { height: 250, borderRadius: 28, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', gap: space.sm },
  app: { width: componentSize.roundXl, height: componentSize.roundXl, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  ic: { width: componentSize.round, height: componentSize.round, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  choice: { flex: 1, gap: 4, paddingTop: 14, paddingHorizontal: space.md, paddingBottom: space.md, borderRadius: radius.lg },
  urgent: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm, padding: space.md, borderRadius: radius.lg, marginTop: space.sm },
});
