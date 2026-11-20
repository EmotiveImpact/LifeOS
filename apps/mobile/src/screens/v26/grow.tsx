/**
 * Grow, restyled to the V26 board (`learn-teach-grow.js` Grow): your weeks as photographs with this week in front,
 * the vantage point over the hilltop with three steps to climb, level up under open sky, and your year on your
 * birthday. Levels and gates come from the engine; board-only words live in `state/you.ts`.
 */
import React, { useEffect, useState } from 'react';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  DashPager, DotGrid, DotStrip, LifeOrb, LifeSays, PhotoFill, StatusPill, Text, TileGrid, V26Tile, cardShadow, feedback, motion, photo, photoScrims,
  photos, radius, space, useCalmMotion, useTokens, type DotCell,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import { money, seed } from '@/state/seed';
import { SHOW_SAMPLES } from '@/state/sample';
import { details, gateTo, gateWords, levelPlan, levelupFirst, levelupMore, vantageReach, weekStats, weeks, yearReview, type WeekKey } from '@/state/you';
import { Between, Body, Btn, Callout, Display, Eyebrow, Page, PeekStack, Statement, Timeline, drawerStyle, useDrawerPhoto } from './kit';
import { OnPhotoRound, PaperChip } from './learn';

const n = (v: number) => Math.round(v).toLocaleString('en-GB');
const ordinal = (v: number) => `${v}${v % 100 >= 11 && v % 100 <= 13 ? 'th' : ['th', 'st', 'nd', 'rd'][v % 10] ?? 'th'}`;

/* ───────────────────────── Weekly recap ───────────────────────── */

/** A tile with what changed since last week as a small green chip beside its label (board recap `stat`). */
function StatTile({ label, value, unit, up, children }: { label: string; value: string; unit?: string; up?: string; wide?: boolean; children?: React.ReactNode }) {
  const t = useTokens();
  return (
    <View style={[styles.stat, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]} accessible accessibilityLabel={[label, value, unit, up ? `up ${up}` : ''].filter(Boolean).join(' ')}>
      <View style={styles.statHead}>
        <Text variant="callout" tone="ink2" numberOfLines={2} style={{ flex: 1 }}>{label}</Text>
        {up !== undefined ? <StatusPill size="chip" kind="done" icon="arrowUp" label={up} /> : null}
      </View>
      <Text variant="numeralL" style={{ marginTop: 10 }}>{value}{unit ? <Text variant="unit" tone="ink2">{` ${unit}`}</Text> : null}</Text>
      {children}
    </View>
  );
}

export function RecapV26() {
  const t = useTokens(), { data } = useSeed();
  const params = useLocalSearchParams<{ state?: string }>();
  const [picked, setPicked] = useState<WeekKey>(params.state === 'w45' || params.state === 'w44' ? params.state : 'now');
  const order: WeekKey[] = ['w44', 'w45', 'now'];
  // A real account has only this week until Sundays go by; the sample shows the board's three weeks.
  const missions = SHOW_SAMPLES ? weekStats.missions : data.completed.length;
  const week = SHOW_SAMPLES ? weeks[picked] : { ...weeks.now, tag: 'This week', line: missions ? `You cleared {@checkCircle ${missions} mission${missions === 1 ? '' : 's'}} this week.` : 'Your first week with life. {Small steps count.}' };
  const behind = SHOW_SAMPLES ? order.filter(k => k !== picked) : [];
  const share = () => { void Share.share({ message: `${week.line.replace(/\{@?\w* ?|\}/g, '').replace(/\s+/g, ' ')} Made with life.` }); };
  return (
    <Page screen="recap" bar={{ kind: 'push', title: 'Weekly recap', close: true, action: { kind: 'icon', icon: 'arrowUp', label: 'Share', onPress: share } }}>
      <Between><Text variant="titleSerif">Your weeks</Text><Callout>Every Sunday</Callout></Between>
      <PeekStack style={{ marginTop: space.lg, paddingTop: behind.length ? 44 : 0 }} peeks={behind.map(k => ({ left: weeks[k].tag, onPress: () => { setPicked(k); feedback.select(); } }))}>
        <View style={[styles.hero, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
          <View style={styles.heroPhoto}>
            <PhotoFill source={photos[week.photo]} focal={week.focal} />
            <StatusPill size="chip" onPhoto label={week.tag} style={styles.pin} />
          </View>
          <View style={styles.below}><Display s={week.line} flush /></View>
        </View>
      </PeekStack>
      {picked === 'now' ? (
        <TileGrid style={{ marginTop: space.sm }}>
          <StatTile label="Missions cleared" value={String(missions)} up={SHOW_SAMPLES ? String(weekStats.missionsUp) : undefined} />
          <StatTile label="Moved to buffer" value={data.prefs.hideBalances ? '••••' : money(SHOW_SAMPLES ? weekStats.moved : 0)} up={SHOW_SAMPLES ? '' : undefined} />
          {SHOW_SAMPLES ? <StatTile wide label="Health stack days" value={String(weekStats.stackDays)} unit="of 7" up={String(weekStats.stackDays)}><DotStrip days={weekStats.stackDots} style={{ marginTop: space.sm }} /></StatTile> : null}
        </TileGrid>
      ) : <Callout center style={{ marginTop: space.md }}>Tap a week behind the card to bring it forward.</Callout>}
      <View style={[styles.card, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
        <Eyebrow orb>Reflection from life</Eyebrow>
        <Statement s="Progress came from {small, repeated steps}, not one big push." style={{ marginTop: space.xs }} />
      </View>
    </Page>
  );
}

/* ───────────────────────── Vantage point ───────────────────────── */

export function VantageV26() {
  const t = useTokens(), nav = useNavigation(), { engine } = useSeed(), insets = useSafeAreaInsets(), drawer = useDrawerPhoto();
  const lv = engine.level, cur = Math.max(1, Math.min(4, lv.currentLevel)), top = lv.currentLevel >= 4;
  const gates = lv.toAdvance, done = gates.filter(g => g.done).length, nowAt = gates.findIndex(g => !g.done);
  const next = levelPlan[Math.min(3, cur)];
  return (
    <Page screen="vantage" scroll={false} contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
      backdrop={<View pointerEvents="none" style={[StyleSheet.absoluteFill, { bottom: undefined, height: drawer.height ?? 700 }]}><PhotoFill source={photos.vantage} focal={{ x: 0.2, y: 0.5 }} settle /><LinearGradient colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={[StyleSheet.absoluteFill, { opacity: 0.6 }]} /></View>}
      bar={{ kind: 'photo', left: <PaperChip label={`You’re at Level ${cur} · ${levelPlan[cur - 1].name}`} />, right: <OnPhotoRound icon="close" label="Close" onPress={nav.close} /> }}>
      <View style={styles.vantageWords}>
        <Text variant="callout" style={{ color: photo.onPhoto2 }}>{top ? 'You’re at the top' : 'Your next vantage point'}</Text>
        <Text variant="huge" style={{ color: photo.onPhoto, marginTop: 6 }}>{top ? levelPlan[3].name : next.name}</Text>
        <Text variant="body" style={{ color: photo.onPhoto2, marginTop: 10 }}>
          <Text variant="body" style={{ color: photo.onPhoto, fontFamily: undefined }}>{top ? 'Level 4.' : `Level ${cur + 1}.`}</Text>
          {top ? ' Keep building assets and safety nets, and reset each season.' : ` From here: ${vantageReach[cur + 1]}.`}
        </Text>
      </View>
      <View style={{ flex: 1, minHeight: space.lg }} />
      <View onLayout={drawer.onLayout} style={[drawerStyle, styles.sheet, { backgroundColor: t.surface, paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} showsVerticalScrollIndicator={false}>
          <Between><Text variant="title">To get there</Text><Callout>{gates.length ? `${done} of ${gates.length}` : 'Nothing left'}</Callout></Between>
          {gates.length ? <Timeline style={{ marginTop: space.md }} items={gates.map((g, i) => ({ when: '', text: gateWords(g.label), state: g.done ? 'done' : i === nowAt ? 'now' : 'later' }))} /> : <Body s="Every step for this level is done. {Your next level opens soon.}" style={{ marginTop: space.sm }} />}
          {nowAt >= 0 ? <Btn label="Take the next step" icon="arrow" trail onPress={() => nav.go(gateTo(gates[nowAt].id))} style={{ marginTop: space.lg }} /> : null}
        </ScrollView>
      </View>
    </Page>
  );
}

/* ───────────────────────── Level up ───────────────────────── */

export function LevelupV26() {
  const nav = useNavigation(), { engine, flag } = useSeed(), calm = useCalmMotion();
  const params = useLocalSearchParams<{ state?: string }>();
  const reached = Math.max(1, Math.min(4, Number(params.state) || engine.level.currentLevel || 1));
  const [page, setPage] = useState(0);
  const pct = Math.round(seed.finance.deposit / seed.finance.depositGoal * 100);
  const first = levelupFirst[reached];
  const pages = [
    { chip: `Level ${reached} unlocked`, title: first.title, line: first.line, photo: 'sky' as const, focal: { x: 0.35, y: 0, zoom: 3.1 }, to: 'plan' as const },
    ...levelupMore.map(m => ({ ...m, line: m.line.replace('DEPOSIT', String(pct)) })),
  ];
  const p = pages[page], last = page === pages.length - 1;
  const scale = useSharedValue(calm ? 1 : 0.6), fade = useSharedValue(0);
  useEffect(() => {
    if (page === 0) feedback.cleared();
    fade.value = 0; fade.value = withTiming(1, { duration: calm ? 200 : 320 });
    scale.value = calm ? 1 : 0.6; if (!calm) scale.value = withSpring(1, motion.bouncy);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps
  const orb = useAnimatedStyle(() => ({ opacity: fade.value, transform: [{ scale: scale.value }] }));
  const words = useAnimatedStyle(() => ({ opacity: fade.value }));
  const finish = () => { flag(`level-intro-${reached}`, true); feedback.complete(); nav.home(); };
  return (
    <Page screen="levelup" scroll={false}
      backdrop={<View pointerEvents="none" style={StyleSheet.absoluteFill}><PhotoFill source={photos[p.photo]} focal={p.focal} settle />{page ? <LinearGradient colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} /> : null}</View>}
      bar={{ kind: 'photo', left: <PaperChip label={p.chip} />, right: <DashPager count={pages.length} index={page} /> }}
      footer={<View style={{ flexDirection: 'row', gap: space.tile }}>
        <Btn ghost onPhoto label="Show me" onPress={() => nav.replace(p.to)} style={{ flex: 1 }} />
        <Btn onPhoto label={last ? 'Done' : 'Next'} icon={last ? undefined : 'arrow'} trail onPress={() => { if (last) finish(); else { setPage(page + 1); feedback.select(); } }} style={{ flex: 1 }} />
      </View>}>
      <View style={styles.orbSpace}>
        {page === 0 ? <Animated.View style={orb}><LifeOrb size={180} state="done" color={photo.onPhoto} /></Animated.View> : null}
      </View>
      <Animated.View style={words}>
        <Text variant="welcome" style={{ color: photo.onPhoto }}>{p.title}</Text>
        <Statement onPhoto size="lead" s={p.line} style={{ marginTop: space.sm, marginBottom: space.xs }} />
      </Animated.View>
    </Page>
  );
}

/* ───────────────────────── Your year, on your birthday ───────────────────────── */

export function YourbirthdayV26() {
  const t = useTokens(), nav = useNavigation(), { data } = useSeed(), insets = useSafeAreaInsets(), drawer = useDrawerPhoto();
  const hide = data.prefs.hideBalances;
  const figures = yearReview
    ? [{ label: 'Missions cleared', value: n(yearReview.missionsCleared) }, { label: 'Found or saved', value: hide ? '••••' : money(yearReview.foundOrSaved) }, { label: 'Ideas learned', value: n(yearReview.ideasLearned) }, { label: 'Closer to your Aim', value: `+${yearReview.aimProgressChangePct}%` }]
    : [{ label: 'Missions cleared', value: n(data.completed.length) }, { label: 'Ideas learned', value: n(data.learned.length) }];
  const born = SHOW_SAMPLES ? details.bornShort : 'Your birthday';
  return (
    <Page screen="yourbirthday" scroll={false} statusInk contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
      backdrop={<View pointerEvents="none" style={[StyleSheet.absoluteFill, { bottom: undefined, height: drawer.height ?? 470 }]}><PhotoFill source={photos.birthday} focal={{ y: 0.85 }} settle /><LinearGradient colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} /></View>}
      bar={{ kind: 'photo', left: <PaperChip label={born} />, right: <OnPhotoRound icon="close" label="Close" solid onPress={nav.close} /> }}>
      <View style={styles.birthdayWords}>
        <Text variant="huge" style={{ color: photo.onPhoto }}>{`Happy birthday${data.profile.name ? `, ${data.profile.name}` : ''}.`}</Text>
      </View>
      <View onLayout={drawer.onLayout} style={[drawerStyle, styles.sheet, { backgroundColor: t.canvas, paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} showsVerticalScrollIndicator={false}>
          <Between><Text variant="title">{data.profile.age ? `Your ${ordinal(data.profile.age)} year` : 'Your year'}</Text><Callout>52 weeks, all lived</Callout></Between>
          <DotGrid cells={Array<DotCell>(52).fill('on')} columns={26} label="52 weeks lived" style={{ marginTop: space.sm }} />
          <TileGrid style={{ marginTop: space.md }}>
            {figures.map(f => <V26Tile key={f.label} label={f.label} value={f.value} style={{ minHeight: 92 }} />)}
          </TileGrid>
          <LifeSays style={{ marginTop: space.md }}>{data.profile.destination === 'buy-home' || SHOW_SAMPLES ? 'Here’s to the year ahead, and the home you’re building towards.' : 'Here’s to the year ahead.'}</LifeSays>
        </ScrollView>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  hero: { borderRadius: radius.lg, overflow: 'hidden' },
  heroPhoto: { height: 170, overflow: 'hidden' },
  pin: { position: 'absolute', left: 14, top: 14 },
  below: { paddingHorizontal: 18, paddingTop: space.md, paddingBottom: 18 },
  card: { marginTop: space.sm, borderRadius: radius.lg, padding: space.cardPad },
  stat: { borderRadius: radius.lg, paddingTop: 14, paddingHorizontal: space.md, paddingBottom: space.md },
  statHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.xs, minHeight: 24 },
  vantageWords: { paddingHorizontal: space.gutter, paddingTop: space.xs },
  sheet: { paddingHorizontal: space.gutter, paddingTop: 22 },
  orbSpace: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  birthdayWords: { flex: 1, minHeight: 200, justifyContent: 'flex-end', paddingHorizontal: space.gutter, paddingBottom: space.lg },
});
