/**
 * Body, restyled to the V26 board (`core.js` body and readiness, `body-a.js`). Every reading against your own normal;
 * figures come from the seed (`seed.health`) and `state/body.ts`, never typed into a screen. Choices save on this phone.
 * Health is wellness guidance, not a diagnosis.
 */
import { useEffect, useState } from 'react';
import { AppState, Platform, Share, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Line, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import {
  Accordion, Badge, BandLine, CapsuleBars, ChatBubble, DecisionDrawer, DotGrid, DotStrip, FilterChips, Icon, KeyValue, LifeOrb, NormalBandChart, PhotoCard, PhotoGrid,
  Press, Reading, Ruler, SectionHead, SegmentedV26, SleepTracks, StatusPill, SwitchV26, Text, TileGrid, TintCard, V26Tile, WheelPicker,
  cardShadow, componentSize, feedback, fonts, photo, photos, radius, space, useAreaTint, useCalmMotion, useTokens, type DotCell, type SleepTrackStage,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import { seed } from '@/state/seed';
import { SHOW_SAMPLES } from '@/state/sample';
import { fuelShare, macroParts, useFuelDay } from '@/state/fuel';
import { lighterDay } from '@/state/today';
import {
  clock, cycle as cycleData, drivers, dur, forecast as forecastData, journalEffects, journalLogged, journalTags, liveWorkout, load, pattern, readiness, signals as signalData,
  sleep, sleepPlan, spotted, stress as stressData, trends as trendData, hrvAverage, hrvMovers,
} from '@/state/body';
import { Between, BigPhoto, Body, Box, Btn, Callout, Chip, Cols, Display, Eyebrow, Micro, Page, PeekStack, PhotoBackdrop, PhotoRound, Row, RowsCard, Shelf, Statement, drawerStyle, useDrawerPhoto } from './kit';
import { Axis, FigRow, Gauge, Head, Measure, RangeMark, XL } from './bodykit';
import { Composer } from './talk';
import { apiConfigured } from '@/services/brain';
import { lastWearableProblems, readHealthNow } from '@/services/health/useHealthRunner';
import { WEARABLES, connectWearable, disconnectWearable, wearableStatus, type Wearable, type WearableProblem } from '@/services/health/wearables';
import { since } from '@/state/health';

const h = seed.health;
const info = (label: string, onPress: () => void) => ({ kind: 'icon' as const, icon: 'info' as const, label, onPress });
const source = Platform.OS === 'android' ? 'Health Connect' : 'Apple Health';
const today = () => new Date().toISOString().slice(0, 10);

/** How readiness sits against your normal, in the board's words. */
export function readinessWords(r = readiness.today) {
  const [lo, hi] = readiness.normal;
  return {
    against: r > hi ? 'Above your normal' : r >= lo ? 'Inside your normal' : 'Below your normal',
    word: r >= 67 ? 'well recovered' : r >= 50 ? 'steady' : 'running low',
  };
}
const hrvDelta = drivers.hrv.value - drivers.hrv.baseline, rhrDelta = drivers.rhr.value - drivers.rhr.baseline;
const hrvLine = `${Math.abs(hrvDelta)} ms ${hrvDelta >= 0 ? 'above' : 'below'} your normal`;
const rhrLine = `${Math.abs(rhrDelta)} bpm ${rhrDelta <= 0 ? 'below' : 'above'} your normal`;
const hrvTag = hrvDelta > 2 ? 'Better' : hrvDelta < -2 ? 'Lower' : 'Usual';
const rhrTag = rhrDelta < -1 ? 'Better' : rhrDelta > 1 ? 'Higher' : 'Usual';

/* ───────────────────────── Body ───────────────────────── */

export function BodyV26() {
  const nav = useNavigation(), { data, choose } = useSeed(), t = useTokens();
  const r = readinessWords(), best = readiness.today >= Math.max(...readiness.week);
  const fuel = useFuelDay(), hide = !!data.prefs.hideNumbers || data.profile.age < 18;
  const done = data.habits.filter(x => x.last14[13]).length;
  const share = () => { void Share.share({ message: `Readiness ${readiness.today}. Slept ${dur(sleep.last)} of ${dur(sleep.need)}. Load ${load.today} of ${load.target.join('–')}.` }); };
  return (
    <Page screen="body" bar={{ kind: 'push', title: 'Body', action: { kind: 'icon', icon: 'arrowUp', label: 'Share', onPress: share } }}>
      <Chip label={`${source} · 6 min ago`} tone="q" onPress={() => nav.go('sources')} />
      <Display s={sleep.debt > 0 ? `You’re {${r.word}}, but {${dur(sleep.debt)} short} on sleep this week.` : `You’re {${r.word}}, and your sleep is {on track} this week.`} />
      <Box pad={18} onPress={() => nav.go('readiness')} accessibilityLabel={`Readiness ${readiness.today}, ${r.against}`} style={{ marginTop: space.xl }}>
        <Micro>Readiness</Micro>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 14, marginTop: space.tile }}>
          <Text variant="numeralXl">{String(readiness.today)}</Text>
          <View style={{ paddingBottom: space.xs, flexShrink: 1 }}>
            <Text variant="title">{r.against}</Text>
            <Text variant="callout" tone="ink2">{best ? 'Best day this week' : 'Against your last 60 days'}</Text>
          </View>
        </View>
        <View style={{ marginTop: space.md }}><NormalBandChart values={readiness.week} normal={readiness.normal} /></View>
        <Body variant="callout" s={`Your normal is {${readiness.normal[0]} to ${readiness.normal[1]}}, from your last 60 days. A good day for an easy walk.`} style={{ marginTop: space.xs }} />
      </Box>
      <TileGrid columns={3} style={{ marginTop: space.tile }}>
        <V26Tile slim label="Sleep" value={dur(sleep.last)} sub={`of ${dur(sleep.need)}`} onPress={() => nav.go('sleep')}>
          <CapsuleBars values={sleep.nights.map(n => n / 60)} height={50} dim={0.16} label={`Hours asleep this week, last night ${dur(sleep.last)}`} />
        </V26Tile>
        <V26Tile slim label="Load" value={String(load.today)} sub={`aim ${load.target.join('–')}`} onPress={() => nav.go('load')}>
          <BandLine values={load.week} normal={load.target} height={30} label={`Load this week against today’s aim of ${load.target.join(' to ')}`} />
        </V26Tile>
        <V26Tile slim label="Stress" value={String(stressData.now)} sub={stressData.now <= 1.5 ? 'low' : stressData.now <= 2.2 ? 'moderate' : 'high'} onPress={() => nav.go('stress')}>
          <BandLine values={stressData.week} normal={[1, 2]} height={30} label="Stress this week against your usual" />
        </V26Tile>
      </TileGrid>
      <SectionHead title="Last night" link="Sleep" onLink={() => nav.go('sleep')} />
      <Box pad={space.md}><SleepTracks segments={sleep.stages} start={clock(sleep.bed)} end={clock(sleep.wake)} summary={`Asleep ${dur(sleep.last)} · ${sleep.perf}%`} /></Box>
      <SectionHead title="Why you’re recovered" link="Readiness" onLink={() => nav.go('readiness')} />
      <RowsCard style={{ paddingVertical: space.xxs }}>
        <Row icon="pulse" title="Heart rate variability" sub={hrvLine} onPress={() => nav.go('hrv')} right={<WhyEnd value={`${drivers.hrv.value} ms`} tag={hrvTag} />} />
        <Row icon="heart" title="Resting heart rate" sub={rhrLine} onPress={() => nav.go('trends')} right={<WhyEnd value={`${drivers.rhr.value} bpm`} tag={rhrTag} />} />
      </RowsCard>
      <SectionHead title="Fuel" link="Log food" onLink={() => nav.go('snap')} />
      {hide
        ? <PhotoCard source={photos.food} height={176} title="Balanced" sub="Regular meals and variety" onPress={() => nav.go('fuel')} />
        : <PhotoCard source={photos.food} height={176} chips={[fuel.ready ? `${Math.round(fuelShare(fuel) * 100)}% of today` : 'No target yet']} chipRight={fuel.ready ? `${fuel.left.toLocaleString('en-GB')} left` : undefined}
            title={fuel.eaten.toLocaleString('en-GB')} titleSuffix={fuel.ready ? `of ${fuel.budget.toLocaleString('en-GB')} kcal` : 'kcal so far'} sub={macroParts(fuel).map(m => `${m.label} ${m.value}`).join(' · ')} onPress={() => nav.go('fuel')} />}
      <SectionHead title="Tonight" />
      <Box pad={space.md} onPress={() => nav.go('sleepplan')} accessibilityLabel={`Tonight, in bed by ${clock(sleep.tonight.bed)}`}>
        <Between style={{ alignItems: 'center' }}>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="title">{`In bed by ${clock(sleep.tonight.bed)}`}</Text>
            <Text variant="callout" tone="ink2">{`Pays back ${sleep.tonight.payback} minutes of this week’s ${dur(sleep.debt)}`}</Text>
          </View>
          <Chip label={clock(sleep.tonight.reminder)} icon="bell" tone="q" />
        </Between>
      </Box>
      <Box pad={space.md} style={{ marginTop: space.sm }}>
        <Eyebrow orb>Life noticed</Eyebrow>
        <Body s={`On days you walk {8,000+ steps}, you sleep {24 minutes longer}.`} style={{ marginTop: space.xs }} />
        <Press haptic="open" onPress={() => nav.go('healthdigest')} accessibilityLabel="Try it for two weeks" style={styles.link}>
          <Text variant="buttonCompact">Try it for two weeks</Text><Icon name="chev" size={16} color={t.ink} />
        </Press>
      </Box>
      <SectionHead title="Habits today" link={`${done} of ${data.habits.length}`} onLink={() => nav.go('habits')} />
      <Box pad={space.md} style={{ paddingVertical: space.xs }}>
        {data.habits.length ? data.habits.map(x => (
          <Press key={x.id} haptic="open" onPress={() => { choose('habit', x.id); nav.go('strength'); }} accessibilityLabel={`${x.name}, ${x.last14.filter(Boolean).length} of the last 14 days`} style={{ paddingVertical: 9 }}>
            <Between><Text variant="buttonCompact" numberOfLines={1} style={{ flexShrink: 1 }}>{x.name}</Text><Text variant="callout" tone="ink2" numberOfLines={1} style={{ flexShrink: 1 }}>{(x.shortCue ?? x.cue).split(' · ')[0]}</Text></Between>
            <DotStrip days={x.last14.map(Boolean)} style={{ marginTop: space.xs }} />
          </Press>
        )) : <Press haptic="open" onPress={() => nav.go('habitnew')} accessibilityLabel="Start a habit" style={{ paddingVertical: space.sm }}><Text variant="buttonCompact">Start a tiny habit</Text><Text variant="callout" tone="ink2">Two minutes, after something you already do</Text></Press>}
      </Box>
      <Callout style={{ marginTop: space.md }}>Wellness guidance from your own readings, not a diagnosis.</Callout>
    </Page>
  );
}

function WhyEnd({ value, tag }: { value: string; tag: string }) {
  return <View style={{ alignItems: 'flex-end', gap: space.xxs }}><Text variant="buttonCompact" style={{ fontVariant: ['tabular-nums'] }}>{value}</Text><Chip label={tag} tone="q" /></View>;
}

/* ───────────────────────── Readiness ───────────────────────── */

export function ReadinessV26() {
  const nav = useNavigation(), r = readinessWords();
  const d = drivers;
  return (
    <Page screen="readiness" bar={{ kind: 'push', title: 'Readiness', action: info('Where this number came from', () => nav.go('provenance')) }}>
      <FigRow text={`${readiness.today}/100`} chip={<Chip label={r.against} tone={readiness.today > readiness.normal[1] ? 'done' : 'q'} />} style={{ marginTop: 0 }} />
      <Statement s={readiness.today >= 67 ? 'A good day for your {harder workout} or the {bigger decision}.' : readiness.today >= 50 ? 'A {normal day}. Keep the {hard session} for when you’re fresher.' : 'Go {easy} today. {Sleep} matters more than training tonight.'} style={{ marginTop: space.sm }} />
      <SectionHead title="Why" link="against your 60-day normal" style={{ marginTop: 28 }} />
      <View style={{ gap: space.xs }}>
        <Reading icon="pulse" name="Heart rate variability" value={String(d.hrv.value)} unit="ms" tag={hrvTag} tagKind={hrvTag === 'Better' ? 'done' : 'quiet'} delta={hrvLine} series={d.hrv.week} normal={d.hrv.normal} onPress={() => nav.go('hrv')} />
        <Reading icon="heart" name="Resting heart rate" value={String(d.rhr.value)} unit="bpm" tag={rhrTag} tagKind={rhrTag === 'Better' ? 'done' : 'quiet'} delta={rhrLine} series={d.rhr.week} normal={d.rhr.normal} onPress={() => nav.go('trends')} />
        <Reading icon="moon" name="Sleep performance" value={String(d.sleep.value)} unit="%" tag="Steady" delta={`Asleep ${dur(sleep.last)} of ${dur(sleep.need)}`} series={d.sleep.week} normal={d.sleep.normal} onPress={() => nav.go('sleep')} />
        <Reading icon="water" name="Breathing rate" value={String(d.resp.value)} unit="/min" tag="Steady" delta="Unchanged from yesterday" series={d.resp.week} normal={d.resp.normal} onPress={() => nav.go('signals')} />
      </View>
      <Callout style={{ marginTop: space.md }}>The shaded band is your own normal range. Wellness guidance, not a diagnosis.</Callout>
      <Row icon="sun" title="Tomorrow’s forecast" sub={`About ${forecastData[0].score} if you’re in bed by ${forecastData[0].bed}`} chevron onPress={() => nav.go('forecast')} style={{ marginTop: space.sm }} />
    </Page>
  );
}

/* ───────────────────────── Devices ───────────────────────── */

const READS = [{ key: 'sleep', label: 'Sleep', on: true }, { key: 'heart', label: 'Heart rate and HRV', on: true }, { key: 'workouts', label: 'Workouts and steps', on: true }, { key: 'food', label: 'Food and water', on: true }, { key: 'weight', label: 'Weight', on: false }];

export function DevicesV26() {
  const { data, choose, flag } = useSeed(), t = useTokens(), nav = useNavigation();
  const reads = (k: string, d: boolean) => (data.choices[`health-read-${k}`] ?? (d ? 'on' : 'off')) === 'on';
  // The sample life shows the phone's store as connected; a real account shows what it actually connected.
  const storeOn = SHOW_SAMPLES || !!data.flags['health-connected'];
  const [problems, setProblems] = useState<WearableProblem[]>(lastWearableProblems());
  const [busy, setBusy] = useState<string | null>(null);
  // Back from a wearable's sign-in page: ask the life API what is connected now.
  useEffect(() => {
    if (!apiConfigured) return;
    const check = async () => {
      const status = await wearableStatus();
      for (const w of WEARABLES) {
        const on = status.connections.some(c => c.provider === w.id);
        if (on !== !!data.flags[`device-${w.id}`]) { flag(`device-${w.id}`, on); if (on) readHealthNow(); }
      }
      setProblems(lastWearableProblems());
    };
    void check();
    const sub = AppState.addEventListener('change', st => { if (st === 'active') void check(); });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const wearable = async (id: Wearable) => {
    const on = !!data.flags[`device-${id}`], again = problems.some(p => p.provider === id && p.problem === 'reconnect');
    if (!apiConfigured) { flag(`device-wanted-${id}`, !data.flags[`device-wanted-${id}`]); feedback.select(); return; }
    setBusy(id);
    try {
      if (on && !again) { if (await disconnectWearable(id)) { flag(`device-${id}`, false); feedback.select(); } }
      else if (!(await connectWearable(id))) { flag(`device-wanted-${id}`, true); feedback.select(); }
    } finally { setBusy(null); }
  };
  const others = [
    { id: 'whoop', icon: 'watch' as const, name: 'WHOOP', gives: 'Recovery, sleep, temperature' },
    { id: 'oura', icon: 'moon' as const, name: 'Oura', gives: 'Readiness, sleep, temperature' },
    { id: 'strap', icon: 'pulse' as const, name: 'Heart-rate strap', gives: 'Any Bluetooth strap: Polar, Garmin, Wahoo' },
  ];
  return (
    <Page screen="devices" bar={{ kind: 'push', title: 'Devices' }}>
      <Eyebrow>Body · connections</Eyebrow>
      <Display s="Bring your data in. {Life reads only what you allow.}" />
      <Body s={`Health data stays on your phone, never goes to ${Platform.OS === 'android' ? 'the cloud' : 'iCloud'} and is never used for ads.`} style={{ marginTop: space.sm }} />
      <TintCard area="health" style={{ marginTop: space.xl }}>
        <Between style={{ alignItems: 'flex-start' }}>
          <View style={{ flexDirection: 'row', gap: space.sm, flexShrink: 1 }}>
            <Badge icon="heart" />
            <View style={{ flexShrink: 1 }}><Text variant="title">{source}</Text><Text variant="callout" tone="ink2" style={{ marginTop: 2 }}>{storeOn && !SHOW_SAMPLES ? `Last read ${since(data.health.lastRead).toLowerCase()}` : 'Sleep, heart, HRV, workouts, steps'}</Text></View>
          </View>
          {storeOn ? <Chip label="On" tone="done" /> : <Chip label="Connect" icon="add" onPress={() => nav.go('healthprimer')} />}
        </Between>
        <Micro style={{ marginTop: space.lg }}>WHAT LIFE CAN READ · ONE BY ONE</Micro>
        <View style={{ marginTop: space.xs }}>
          {READS.map(x => (
            <Between key={x.key} style={{ minHeight: 44 }}>
              <Text variant="body">{x.label}</Text>
              <SwitchV26 value={reads(x.key, x.on)} onChange={v => choose(`health-read-${x.key}`, v ? 'on' : 'off')} accessibilityLabel={`Let Life read ${x.label.toLowerCase()}`} />
            </Between>
          ))}
        </View>
      </TintCard>
      <SectionHead title="Add another" link="when you’re ready" />
      <Shelf>
        {others.map(o => {
          const live = o.id !== 'strap' && apiConfigured, on = !!data.flags[`device-${o.id}`], asked = !!data.flags[`device-wanted-${o.id}`];
          const again = problems.some(p => p.provider === o.id && p.problem === 'reconnect');
          const sub = again ? 'Sign in to it again to keep reading' : on ? 'Connected. Readings come in with your phone’s' : asked ? (live ? 'Not open yet. Life will remind you' : 'Life will remind you when this opens') : o.gives;
          const label = busy === o.id ? 'Opening…' : again ? 'Connect again' : on ? 'Disconnect' : asked ? 'Noted' : o.id === 'strap' ? 'Pair' : 'Connect';
          const press = () => {
            if (o.id === 'strap') { flag(`device-wanted-${o.id}`, !asked); feedback.select(); return; }
            void wearable(o.id as Wearable);
          };
          return (
            <Box key={o.id} pad={space.md} style={{ width: 168 }}>
              <View style={[styles.thumb, { backgroundColor: t.surface2 }]}><Icon name={o.icon} size={22} color={t.ink} /></View>
              <Text variant="title" style={{ marginTop: space.sm }} numberOfLines={2}>{o.name}</Text>
              <Text variant="callout" tone="ink2" style={{ marginTop: 2, flex: 1 }}>{sub}</Text>
              <Btn ghost sm label={label} icon={on && !again ? undefined : asked && !on ? 'check' : undefined} disabled={busy === o.id} onPress={press} style={{ marginTop: 14 }} />
            </Box>
          );
        })}
      </Shelf>
      <Callout style={{ marginTop: space.md }}>WHOOP and Oura connect through your account with them, on their own sign-in page. Only a heart-rate strap pairs over Bluetooth.</Callout>
      <SectionHead title="Already works" />
      <RowsCard>
        <Row icon="watch" title="Garmin, Fitbit, Samsung and more" sub="Through Apple Health or Health Connect" right={<Chip label="Works" tone="q" />} />
        <Row icon="layers" title="Health Connect" sub="The same on Android phones" right={<Chip label="Android" tone="q" />} />
        <Row icon="add" title="Manual" sub="Sleep times, weight, water, workouts" right={<Chip label="Always" tone="q" />} />
      </RowsCard>
      <Callout style={{ marginTop: space.md }}>Disconnect any time. Ask, and Life deletes everything it imported.</Callout>
    </Page>
  );
}

/* ───────────────────────── Sleep ───────────────────────── */

const TALL: Record<SleepTrackStage, number> = { deep: 100, rem: 64, light: 36, awake: 12 };
const STAGE_OPACITY: Record<SleepTrackStage, number> = { deep: 1, rem: 0.6, light: 0.3, awake: 0.45 };

export function SleepV26() {
  const nav = useNavigation(), t = useTokens(), { accent } = useAreaTint('work');
  const needH = sleep.need / 60;
  const stageColor = (s: SleepTrackStage) => (s === 'awake' ? t.ink2 : accent);
  return (
    <Page screen="sleep" bar={{ kind: 'push', title: 'Sleep', action: info('How sleep is scored', () => nav.go('math')) }}>
      <FigRow text={dur(sleep.last)} chip={<Chip label={`Needed about ${dur(sleep.need)}`} tone="q" />} style={{ marginTop: 0 }} />
      <Statement s={sleep.debt > 0 ? `This week’s debt is {${dur(sleep.debt)}}. {Tonight can pay some back.}` : 'No sleep debt this week. {Keep tonight the same.}'} style={{ marginTop: space.sm }} />
      <PhotoCard source={photos.bedroom} focal={{ y: 0.52 }} height={176} chips={['Tonight', { label: `Reminder ${clock(sleep.tonight.reminder)}`, icon: 'bell' }]}
        title={`In bed by ${clock(sleep.tonight.bed)}`} sub={`Pays back ${sleep.tonight.payback} minutes of debt`} onPress={() => nav.go('sleepplan')} style={{ marginTop: space.lg }} />
      <TintCard area="work" onPress={() => nav.go('sleepnight')} accessibilityLabel="Last night in stages" style={{ marginTop: space.sm }}>
        <Head icon="moon" title="Last night" right="taller is deeper" />
        <View style={styles.stages} accessible accessibilityRole="image" accessibilityLabel={`Last night in stages, from ${clock(sleep.bed)} to ${clock(sleep.wake)}`}>
          {sleep.stages.map((s, i) => <View key={i} style={{ flexGrow: s.minutes, flexBasis: 0, minWidth: 3, height: `${TALL[s.stage]}%`, borderRadius: 4, backgroundColor: stageColor(s.stage), opacity: STAGE_OPACITY[s.stage] }} />)}
        </View>
        <Axis labels={[clock(sleep.bed), clock(sleep.wake)]} />
        <View style={[styles.legend, { marginTop: space.md }]}>
          {(['deep', 'rem', 'light', 'awake'] as const).map(s => (
            <View key={s} style={{ flex: 1 }}>
              <View style={styles.keyRow}><View style={[styles.key, { backgroundColor: stageColor(s), opacity: STAGE_OPACITY[s] }]} /><Text variant="micro" tone="ink2">{s === 'rem' ? 'REM' : s[0].toUpperCase() + s.slice(1)}</Text></View>
              <Text variant="title" style={{ marginTop: space.xxs, fontVariant: ['tabular-nums'] }}>{dur(sleep.totals[s])}</Text>
            </View>
          ))}
        </View>
      </TintCard>
      <Box style={{ marginTop: space.sm }}>
        <Between><Text variant="title">Last 7 nights</Text><Text variant="callout" tone="ink2">band = what you needed</Text></Between>
        <View style={{ marginTop: space.xs }}><BandLine values={sleep.nights.map(n => +(n / 60).toFixed(2))} normal={[needH - 0.17, needH + 0.25]} height={104} label="Hours asleep on each of the last 7 nights, against what you needed" /></View>
        <Axis labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']} lastInk />
        <Callout style={{ marginTop: space.sm }}>{`${sleep.reached} nights reached your need. The other ${7 - sleep.reached} add up to the ${dur(sleep.debt)}.`}</Callout>
      </Box>
      <TileGrid style={{ marginTop: space.sm }}>
        <V26Tile label="Sleep performance" value={String(sleep.perf)} unit="%" sub="Asleep ÷ needed" />
        <V26Tile label="Fell asleep in" value={String(sleep.latency)} unit="min" sub={`From ${source}`} />
        <V26Tile wide label="Consistency" scale="Work on it" value={`±${sleep.consistency}`} unit="min" sub="How far your bedtime moves, night to night" onPress={() => nav.go('regularity')}>
          <Gauge lo={30} hi={70} at={sleep.bedtimes} style={{ marginTop: 14 }} />
          <Axis labels={['earlier', 'your usual window', 'later']} />
        </V26Tile>
      </TileGrid>
      <Callout style={{ marginTop: space.md }}>Most adults need 7–9 hours (NHS). Life learns your own need from mornings you feel rested.</Callout>
    </Page>
  );
}

/* ───────────────────────── Load ───────────────────────── */

export function LoadV26() {
  const nav = useNavigation(), t = useTokens(), { accent } = useAreaTint('goal');
  const [lo, hi] = load.target, now = load.today;
  const where = now < lo ? 'under' : now > hi ? 'over' : 'in';
  const zoneTotal = load.zonesToday.reduce((a, b) => a + b, 0) || 1;
  const H = 140, y = (v: number) => H - 20 - v / 21 * (H - 26);
  return (
    <Page screen="load" bar={{ kind: 'push', title: 'Load', action: info('How load works', () => nav.go('math')) }}>
      <Eyebrow>Today so far</Eyebrow>
      <FigRow text={`${now}/21`} chip={<Chip label={where === 'in' ? 'In today’s range' : where === 'under' ? 'Under today’s range' : 'Over today’s range'} tone={where === 'in' ? 'done' : 'q'} />} />
      <Statement s={`Today’s sweet spot is {${lo}–${hi}}, set by your readiness of {${readiness.today}}. ${where === 'in' ? '{You’re in it}, so the rest of today can be easy.' : where === 'under' ? `{About ${Math.ceil(lo - now)} more} would land you in it.` : '{You’re past it}, so keep the rest of today easy.'}`} style={{ marginTop: space.sm }} />
      <TintCard area="goal" onPress={() => nav.go('loadtrend')} accessibilityLabel="This week’s load against the sweet spot" style={{ marginTop: space.lg }}>
        <Head icon="fitness" title="This week" right="band = sweet spot" />
        <View style={{ marginTop: space.xs, height: H }}>
          <View style={{ position: 'absolute', left: 0, right: 0, top: y(hi), height: y(lo) - y(hi), borderRadius: radius.sm, backgroundColor: t.surface }} />
          <CapsuleBars values={load.week} labels={load.weekLabels} now={6} max={21} height={H} color={accent} dim={0.35} label={`Load on each of the last 7 days, with today’s sweet spot of ${lo} to ${hi} shaded`} />
        </View>
        <Callout style={{ marginTop: space.xs }}>The band moves with your readiness each morning.</Callout>
      </TintCard>
      <SectionHead title="What made it" link={`from ${source}`} />
      <PhotoGrid>
        <PhotoCard source={photos.walk} focal={{ y: 0.54 }} height={170} size="sm" chips={[load.made[0].when]} title={`${load.made[0].what} · ${load.made[0].mins}`} sub={`Load ${load.made[0].n}`} onPress={() => nav.go('workoutdetail')} />
        <TintCard area="goal" padding={space.md} onPress={() => nav.go('workoutdetail')} accessibilityLabel={`${load.made[1].what}, load ${load.made[1].n}`} style={{ height: 170, borderRadius: radius.photo, justifyContent: 'space-between' }}>
          <Chip label={load.made[1].when} />
          <View><Badge icon="fitness" /><Text variant="title" style={{ marginTop: space.xs }}>{`${load.made[1].what} · ${load.made[1].mins}`}</Text><Text variant="callout" tone="ink2">{`Load ${load.made[1].n}`}</Text></View>
        </TintCard>
      </PhotoGrid>
      <RowsCard style={{ marginTop: space.sm }}>
        <Row icon="walk" title="Everyday movement" sub={`${h.steps.toLocaleString('en-GB')} steps, counted in the two above`} onPress={() => nav.go('basics')} />
      </RowsCard>
      <Box onPress={() => nav.go('zones')} accessibilityLabel="Time in heart-rate zones today" style={{ marginTop: space.sm }}>
        <Between><Text variant="title">Time in heart-rate zones</Text><Icon name="chev" size={16} color={t.ink2} /></Between>
        <View style={[styles.split, { marginTop: space.md }]}>
          {load.zonesToday.map((m, i) => m ? <View key={i} style={{ flexGrow: m / zoneTotal, flexBasis: 0, minWidth: 4, borderRadius: 6, backgroundColor: t.ink, opacity: 0.2 + i * 0.2 }} /> : null)}
        </View>
        <View style={[styles.legend, { marginTop: space.sm }]}>
          {load.zonesToday.map((m, i) => <View key={i} style={{ flex: 1 }}><Text variant="micro" tone="ink2">{`Z${i + 1}`}</Text><Text variant="title" style={{ marginTop: space.xxs }}>{`${m}m`}</Text></View>)}
        </View>
      </Box>
      <Callout style={{ marginTop: space.md }}>An estimate of effort, not a fitness test.</Callout>
    </Page>
  );
}

/* ───────────────────────── Trends ───────────────────────── */

export function TrendsV26() {
  const nav = useNavigation(), { data, choose } = useSeed();
  const range = (data.choices['trends-range'] ?? '4 weeks') as keyof typeof trendData;
  const d = trendData[range] ?? trendData['4 weeks'];
  return (
    <Page screen="trends" bar={{ kind: 'push', title: 'Trends' }}>
      <Eyebrow star>Life noticed a pattern</Eyebrow>
      <Display s={`After {${pattern.hours}+ hours} of sleep, your readiness tends to be {${pattern.points} points higher} the next day.`} />
      <SectionHead title="Side by side" link="against your normal" />
      <SegmentedV26 options={[{ value: '4 weeks', label: '4 weeks' }, { value: '3 months', label: '3 months' }]} value={range} onChange={v => choose('trends-range', v)} />
      <View style={{ gap: space.xs, marginTop: space.sm }}>
        <Reading icon="moon" name="Sleep" value={d.sleep.value} unit="a night" tag="Below need" delta={`Your need is about ${dur(sleep.need)}`} series={d.sleep.series} normal={[sleep.need / 60 - 0.17, sleep.need / 60 + 0.25]} onPress={() => nav.go('sleep')} />
        <Reading icon="heart" name="Readiness" value={d.readiness.value} unit="average" tag="Steady" delta="Inside your normal range" series={d.readiness.series} normal={[55, 66]} onPress={() => nav.go('readiness')} />
        <Reading icon="sun" name="Mood" value={d.mood.value} unit="of 5" tag="Steady" delta="1 = drained, 5 = driven" series={d.mood.series} normal={[3, 4.2]} />
      </View>
      <SectionHead title="Also noticed" />
      <PhotoGrid>
        <PhotoCard source={photos.bedroom} focal={{ y: 0.6 }} height={190} size="sm" chips={['Pattern']} title="Mondays" sub="You tend to feel drained after short Sunday nights" onPress={() => nav.go('insights')} />
        <PhotoCard source={photos.run} focal={{ x: 0.25, y: 0.68 }} height={190} size="sm" chips={['Pattern']} title="Training days" sub="Your protein tends to fall short" onPress={() => nav.go('fuel')} />
      </PhotoGrid>
      <Callout style={{ marginTop: space.md }}>Patterns, not proof. Life looks at your own data only.</Callout>
    </Page>
  );
}

/* ───────────────────────── HRV ───────────────────────── */

export function HrvV26() {
  const nav = useNavigation(), { accent } = useAreaTint('health'), t = useTokens();
  const v = drivers.hrv, [lo, hi] = v.normal;
  const against = v.value > hi ? 'Above your normal' : v.value >= lo ? 'Inside your normal' : 'Below your normal';
  return (
    <Page screen="hrv" bar={{ kind: 'push', title: 'Heart rate variability', action: info('About HRV', () => nav.go('math')) }}>
      <Eyebrow icon="shield">Personal baseline · overnight</Eyebrow>
      <FigRow text={`${v.value}ms`} chip={<Chip label={against} tone={v.value > hi ? 'done' : 'q'} />} />
      <Statement s={v.value > hi ? `Above your normal range of {${lo}–${hi} ms}. Higher than usual often means your body has {recovered well}.` : v.value >= lo ? `Inside your normal range of {${lo}–${hi} ms}. {A usual night.}` : `Below your normal range of {${lo}–${hi} ms}. Lower than usual can mean your body is {still recovering}.`} style={{ marginTop: space.sm }} />
      <TintCard area="health" style={{ marginTop: space.lg }}>
        <Head icon="pulse" title="30 days" right={`avg ${hrvAverage} · band = your normal`} />
        <View style={{ marginTop: space.xs }}><BandLine values={v.month} normal={v.normal} height={130} color={accent} bandColor={accent} bandOpacity={.2} label={`Heart rate variability over 30 days, against your normal range of ${lo} to ${hi} milliseconds`} /></View>
        <Axis labels={['18 Oct', '1 Nov', 'Today']} lastInk />
      </TintCard>
      <SectionHead title="What moves yours" link="from your journal" onLink={() => nav.go('insights')} />
      <RowsCard>
        {hrvMovers.map(m => <Row key={m.text} date={{ day: `${m.d > 0 ? '+' : '−'}${Math.abs(m.d)}`, month: 'ms' }} title={m.text} sub={m.n} />)}
      </RowsCard>
      <Box pad={space.md} style={{ marginTop: space.sm }}>
        <KeyValue label="Source" value="Apple Watch via Apple Health" />
        <KeyValue label="Measured" value="Overnight" />
        <KeyValue label="Measure" value="SDNN*" />
        <Row title="How it’s calculated" sub="Methods and evidence" chevron onPress={() => nav.go('math')} />
      </Box>
      <Callout style={{ marginTop: space.md }}>*Apple Health reports SDNN; Oura and chest straps give beat-to-beat data for RMSSD. Life only compares like with like, against your own baseline.</Callout>
    </Page>
  );
}

/* ───────────────────────── Body signals (and the illness flag) ───────────────────────── */

export function SignalsV26() {
  const params = useLocalSearchParams<{ state?: string }>();
  const [mode, setMode] = useState(params.state ?? '');
  const nav = useNavigation();
  if (mode === 'illness') return <IllnessV26 />;
  const drift = mode === 'drift', list = drift ? signalData.drift : signalData.today;
  return (
    <Page screen="signals" bar={{ kind: 'push', title: 'Body signals' }}>
      {drift ? <>
        <Eyebrow star>How a flag looks · sample from Sat 7 Nov</Eyebrow>
        <Display s={`{${list.filter(s => s.off).length} signals} are off your normal. {Take it easy today.}`} />
        <Body s="This can happen when you’re coming down with something, after alcohol, or after a very hard day. {If you feel unwell, call NHS 111.}" style={{ marginTop: space.sm }} />
      </> : <>
        <Eyebrow>{`Against your own normal · ${source}`}</Eyebrow>
        <Display s={`All {${list.length} signals} are inside {your normal range} today.`} />
      </>}
      <TintCard area="health" padding={space.sm} style={{ marginTop: space.lg }}>
        <View style={{ paddingHorizontal: space.xxs, paddingTop: space.xxs }}><Head icon="pulse" title="Where you sit" right="band = your own range" /></View>
        <TileGrid style={{ marginTop: space.sm }}>
          {list.map(s => (
            <V26Tile key={s.name} label={s.name} value={s.value} unit={s.unit} sub={s.sub} style={{ minHeight: 0, paddingHorizontal: space.sm }}>
              <Gauge lo={30} hi={70} at={s.at} style={{ marginTop: 14 }} />
              <Chip label={s.off ? 'Off normal' : 'In range'} tone={s.off ? undefined : 'q'} style={{ marginTop: space.sm }} />
            </V26Tile>
          ))}
        </TileGrid>
      </TintCard>
      <RowsCard style={{ marginTop: space.sm }}>
        {drift
          ? <Row icon="check" title="Back to today" sub="All 4 signals in range" chevron onPress={() => setMode('')} />
          : <Row icon="info" title="When signals drift" sub="Life tells you gently. It often comes before feeling ill." chevron onPress={() => setMode('drift')} />}
      </RowsCard>
      {drift ? <Row icon="spark" title="What Life changes on a day like this" chevron onPress={() => nav.go('signals', { state: 'illness' })} style={{ marginTop: space.xs }} /> : null}
      <Callout style={{ marginTop: space.md }}>Not a medical device. Life compares you only with yourself and never diagnoses.</Callout>
    </Page>
  );
}

export function IllnessV26() {
  const t = useTokens(), { accent } = useAreaTint('health');
  return (
    <Page screen="signals" bar={{ kind: 'push', title: 'Body signals' }}>
      <PhotoCard source={photos.bedroom} focal={{ y: 0.82 }} height={210} chips={[{ label: `${signalData.illness.length} signals above your normal`, dot: t.ember }]} title="Something may be coming on" sub="Take it easy today." />
      <TintCard area="health" style={{ marginTop: space.sm }}>
        <Head icon="pulse" title="Three signals, at once" right={<Chip label="High" />} />
        {signalData.illness.map(s => (
          <View key={s.name} style={{ marginTop: space.md }}>
            <Between><Text variant="buttonCompact">{s.name}</Text><Text variant="callout" tone="ink2">{s.value}</Text></Between>
            <RangeMark from={18} to={56} at={s.at} onTint color={accent} style={{ marginTop: space.xs }} />
          </View>
        ))}
        <Callout style={{ marginTop: space.md }}>The shaded part of each line is your normal.</Callout>
      </TintCard>
      <Box style={{ marginTop: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.tile }}><LifeOrb size={22} state="done" /><Text variant="buttonCompact">Life has made today lighter</Text></View>
        <Cols items={[{ small: 'Workout', value: 'Thursday', sub: 'Moved' }, { small: 'Bed by', value: '22:30', sub: 'Tonight' }, { small: 'Water', value: 'Extra', sub: 'Today' }]} style={{ marginTop: space.md }} />
      </Box>
      <Callout style={{ marginTop: space.md }}>Life never names an illness. Not medical advice. If you feel unwell, contact NHS 111 or your GP.</Callout>
    </Page>
  );
}

/* ───────────────────────── Stress ───────────────────────── */

export function StressV26() {
  const nav = useNavigation(), t = useTokens(), { accent } = useAreaTint('you'), { choose } = useSeed();
  const s = stressData, level = s.now <= 1.5 ? 'Low' : s.now <= 2.2 ? 'Moderate' : 'High';
  const breathe = () => { choose('breath-protocol', 'Resonance'); choose('breath-seconds', '120'); nav.go('breathe'); };
  return (
    <Page screen="stress" bar={{ kind: 'push', title: 'Stress', action: info('How stress works', () => nav.go('math')) }}>
      <Eyebrow>Right now</Eyebrow>
      <FigRow text={`${s.now}/3`} chip={<Chip label={`${level} · estimate`} tone="q" />} />
      <Statement s="Mostly calm today, with one busy stretch from {13:30 to 15:00}. {Two minutes of slow breathing} can help you reset." style={{ marginTop: space.sm }} />
      <TintCard area="you" style={{ marginTop: space.lg }}>
        <Head icon="pulse" title="Every 30 min" right="0 calm · 3 high" />
        <View style={[styles.day, { marginTop: space.md }]} accessible accessibilityRole="image" accessibilityLabel="Stress every 30 minutes from 08:00 to 20:00, against your usual range">
          <View style={{ position: 'absolute', left: 0, right: 0, bottom: `${s.usual[0] / 3 * 100}%`, height: `${(s.usual[1] - s.usual[0]) / 3 * 100}%`, borderRadius: radius.sm, backgroundColor: t.surface }} />
          {s.day.map((v, k) => <View key={k} style={{ flex: 1, minHeight: 4, height: `${Math.round(v / 3 * 100)}%`, borderRadius: 4, backgroundColor: accent, opacity: k >= s.busy[0] && k <= s.busy[1] ? 1 : 0.35 }} />)}
        </View>
        <Axis labels={['08:00', '14:00', '20:00']} />
        <Callout style={{ marginTop: space.sm }}>The band is where you usually sit while still. One stretch rose above it.</Callout>
      </TintCard>
      <TileGrid style={{ marginTop: space.sm }}>
        <V26Tile label="Busiest stretch" scale="High" value={String(s.busyMins)} unit="min" sub="13:30 – 15:00" />
        <V26Tile label="Time calm today" scale={`${s.calmPct}%`} value={dur(s.calmMins)}><Ruler pct={s.calmPct} bars={18} style={{ marginTop: space.sm }} /></V26Tile>
      </TileGrid>
      <PhotoCard source={photos.breathe} focal={{ y: 0.36 }} height={170} chips={['A reset']} topRight={<PhotoRound icon="play" label="Breathe for 2 minutes" onPress={breathe} />} title="Breathe for 2 minutes" sub="About 6 slow breaths a minute" onPress={breathe} style={{ marginTop: space.sm }} />
      <Callout style={{ marginTop: space.md }}>Heart rate also rises with excitement, caffeine and movement, so treat this as a hint, not a fact.</Callout>
    </Page>
  );
}

/* ───────────────────────── Breathe ───────────────────────── */

type Pattern = { inS: number; hold: number; out: number; hold2: number; seconds: number; how: string };
export const BREATHS: Record<string, Pattern> = {
  Resonance: { inS: 5, hold: 0, out: 5, hold2: 0, seconds: 120, how: 'In through your nose for 5, out slowly for 5.' },
  'Box breathing': { inS: 4, hold: 4, out: 4, hold2: 4, seconds: 120, how: 'In for 4, hold for 4, out for 4, hold for 4.' },
  '4-7-8': { inS: 4, hold: 7, out: 8, hold2: 0, seconds: 120, how: 'In for 4, hold for 7, out slowly for 8.' },
  'Physiological sigh': { inS: 3, hold: 0, out: 6, hold2: 0, seconds: 60, how: 'Two breaths in through your nose, then one long breath out.' },
  'Heart-rate down': { inS: 4, hold: 0, out: 6, hold2: 0, seconds: 180, how: 'Breathe in gently, then let your breath out a little more slowly.' },
};
const MINUTES = ['', 'One minute', 'Two minutes', 'Three minutes', 'Four minutes', 'Five minutes'];
const mmss = (s: number) => `${Math.floor(s / 60)}:${String(Math.max(0, s) % 60).padStart(2, '0')}`;

export function BreatheV26() {
  const t = useTokens(), nav = useNavigation(), insets = useSafeAreaInsets(), calm = useCalmMotion(), { data } = useSeed(), drawer = useDrawerPhoto();
  const name = data.choices['breath-protocol'] && BREATHS[data.choices['breath-protocol']] ? data.choices['breath-protocol'] : 'Resonance';
  const p = BREATHS[name], seconds = Number(data.choices['breath-seconds'] ?? p.seconds) || p.seconds;
  const cycle = p.inS + p.hold + p.out + p.hold2, perMin = Math.round(60 / cycle);
  const [state, setState] = useState<'' | 'go' | 'done'>(''), [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    if (state !== 'go') return;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [state]);
  useEffect(() => { if (state === 'go' && elapsed >= seconds) { setState('done'); feedback.complete(); } }, [state, elapsed, seconds]);
  const pos = elapsed % cycle;
  const phase = pos < p.inS ? 'in' : pos < p.inS + p.hold ? 'hold' : pos < p.inS + p.hold + p.out ? 'out' : 'hold2';
  const scale = useSharedValue(0.78);
  useEffect(() => {
    if (calm) { scale.value = state === 'go' ? 1 : 0.78; return; }
    if (state !== 'go') { scale.value = withTiming(0.78, { duration: 600 }); return; }
    if (phase === 'in') scale.value = withTiming(1, { duration: p.inS * 1000, easing: Easing.inOut(Easing.sin) });
    if (phase === 'out') scale.value = withTiming(0.78, { duration: p.out * 1000, easing: Easing.inOut(Easing.sin) });
  }, [phase, state, calm, p.inS, p.out, scale]);
  const halo = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const breaths = Math.floor(elapsed / cycle);
  const finished = elapsed >= seconds;
  const cue = state === 'done' ? (finished ? `${MINUTES[Math.round(seconds / 60)] || mmss(seconds)}, done.` : 'Done for now.') : state === 'go' ? (phase === 'in' ? 'Breathe in' : phase === 'out' ? 'Breathe out' : 'Hold') : 'Ready when you are';
  const sub = state === 'done' ? `${breaths} slow breath${breaths === 1 ? '' : 's'}, at about ${perMin} a minute.` : state === 'go' ? (phase === 'in' ? `Through your nose, for ${p.inS}` : phase === 'out' ? `Slowly out, for ${p.out}` : `Hold, for ${phase === 'hold' ? p.hold : p.hold2}`) : p.how;
  return (
    <Page screen="breathe" scroll={false} contentStyle={{ paddingHorizontal: 0, paddingBottom: 0, paddingTop: 0 }}
      backdrop={<View pointerEvents="none" style={[StyleSheet.absoluteFill, { bottom: undefined, height: drawer.height ?? 400 }]}><PhotoFillFade /></View>}
      bar={{ kind: 'photo', left: <PhotoRound icon="close" label="Close" onPress={nav.close} />, right: <View style={{ flexDirection: 'row', gap: space.xs }}>{SHOW_SAMPLES ? <StatusPill size="chip" onPhoto icon="heart" label={`${stressData.breatheHr} bpm`} /> : null}<StatusPill size="chip" onPhoto label={`${perMin} breaths a minute`} /></View> }}>
      <View style={{ flex: 1, minHeight: 188 }} />
      <View onLayout={drawer.onLayout} style={[drawerStyle, styles.sheet, { backgroundColor: t.surface, paddingBottom: Math.max(insets.bottom, space.md) + space.sm }]}>
        <Text variant="titleSerif" align="center">{cue}</Text>
        <Text variant="callout" tone="ink2" align="center" style={{ marginTop: 6 }}>{sub}</Text>
        <View style={{ height: 236, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View style={[styles.halo, { backgroundColor: t.surface3 }, halo]} />
          <View style={[styles.air, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}><LifeOrb size={88} state={state === 'done' ? 'done' : state === 'go' ? 'listening' : 'ring'} /></View>
        </View>
        <Text variant="numeralXl" align="center">{mmss(state === 'done' ? Math.min(elapsed, seconds) : seconds - elapsed)}</Text>
        <Text variant="callout" tone="ink2" align="center" style={{ marginTop: space.xs }}>Live heart rate from Apple Watch or a Bluetooth strap.</Text>
        <View style={{ marginTop: space.md }}>
          {state === 'done' ? <Btn label="Done" onPress={nav.close} />
            : state === 'go' ? <Btn ghost label="End early" onPress={() => { setState('done'); feedback.select(); }} />
            : <Btn label="Start" icon="play" onPress={() => { setElapsed(0); setState('go'); feedback.select(); }} />}
        </View>
      </View>
    </Page>
  );
}

/** The breathe photograph with the Welcome fade, stopping short of the sheet. */
function PhotoFillFade() {
  return <PhotoBackdropLocal />;
}
function PhotoBackdropLocal() { return <PhotoBackdrop source={photos.breathe} focal={{ y: 0.22 }} />; }

/* ───────────────────────── Evening journal ───────────────────────── */

export function JournalV26() {
  const t = useTokens(), nav = useNavigation(), { data, set, choose } = useSeed();
  const [adding, setAdding] = useState(false), [text, setText] = useState('');
  const tags = [...journalTags, ...data.journal.filter(x => !journalTags.includes(x))];
  const saved = data.choices['journal-saved'] === today();
  const logged = journalLogged + (saved ? 1 : 0);
  const toggle = (tag: string) => { set({ journal: data.journal.includes(tag) ? data.journal.filter(v => v !== tag) : [...data.journal, tag] }); feedback.select(); };
  const cells: DotCell[] = Array.from({ length: 14 }, (_, k) => (k < journalLogged ? 'on' : k === journalLogged ? (saved ? 'on' : 'now') : ''));
  return (
    <Page screen="journal" bar={{ kind: 'sheet', title: 'Journal' }}
      footer={saved ? <Btn ghost icon="check" label="Saved for tonight" onPress={() => choose('journal-saved', '')} /> : <Btn label="Save tonight" onPress={() => { choose('journal-saved', today()); feedback.file(); }} />}>
      <PhotoCard source={photos.journal} focal={{ y: 0.4 }} height={160} chips={['Tonight · 10 seconds']} title="What happened today?" />
      <View style={[styles.tags, { marginTop: space.lg }]}>
        {tags.map(tag => {
          const on = data.journal.includes(tag);
          return (
            <Press key={tag} haptic={null} onPress={() => toggle(tag)} accessibilityRole="checkbox" accessibilityState={{ checked: on }} accessibilityLabel={tag}
              style={[styles.tag, on ? { backgroundColor: t.ink } : { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
              {on ? <Icon name="check" size={16} color={t.canvas} /> : null}
              <Text variant="buttonCompact" style={{ color: on ? t.canvas : t.ink }}>{tag}</Text>
            </Press>
          );
        })}
        <Press haptic="select" onPress={() => setAdding(a => !a)} accessibilityLabel="Add your own" style={[styles.tag, { backgroundColor: t.surface2 }]}>
          <Icon name="add" size={16} color={t.ink2} /><Text variant="buttonCompact" tone="ink2">Add your own</Text>
        </Press>
      </View>
      {adding ? (
        <View style={[styles.addRow, { backgroundColor: t.surface, ...cardShadow(t.scheme), marginTop: space.sm }]}>
          <TextInput maxFontSizeMultiplier={1.3} value={text} onChangeText={setText} placeholder="Something else today" placeholderTextColor={t.ink2} autoFocus accessibilityLabel="Your own tag"
            style={{ flex: 1, color: t.ink, fontFamily: fonts.sans, fontSize: 15, paddingVertical: space.xs }} selectionColor={t.ember}
            onSubmitEditing={() => { const v = text.trim(); if (v && !data.journal.includes(v)) set({ journal: [...data.journal, v] }); setText(''); setAdding(false); }} />
          <Btn sm ghost fit label="Add" onPress={() => { const v = text.trim(); if (v && !data.journal.includes(v)) set({ journal: [...data.journal, v] }); setText(''); setAdding(false); }} />
        </View>
      ) : null}
      <Box onPress={() => nav.go('insights')} accessibilityLabel={`${logged} of 14 evenings logged`} style={{ marginTop: space.lg }}>
        <Between><Text variant="title">{`${logged} of 14 evenings logged`}</Text><Text variant="callout" tone="ink2">{logged >= 14 ? 'Unlocked' : `${14 - logged} to go`}</Text></Between>
        <DotGrid cells={cells} columns={14} style={{ marginTop: space.md }} />
        <Callout style={{ marginTop: space.sm }}>Unlocks insights after 2 weeks. Private: your answers stay on this phone.</Callout>
      </Box>
    </Page>
  );
}

/* ───────────────────────── Journal insights ───────────────────────── */

export function InsightsV26() {
  const t = useTokens(), { accent } = useAreaTint('health');
  const eff = (e: { name: string; v: number; days: number }) => (
    <View key={e.name} style={{ paddingTop: 14 }}>
      <Between>
        <Text variant="body" style={{ flexShrink: 1 }}>{e.name}<Text variant="body" tone="ink2">{` · ${e.days} days`}</Text></Text>
        <Text variant="title">{`${e.v > 0 ? '+' : '−'}${Math.abs(e.v)}`}</Text>
      </Between>
      <View style={[styles.bal, { backgroundColor: t.surface }]}>
        <View style={{ position: 'absolute', left: '50%', top: -3, width: 2, height: 16, marginLeft: -1, borderRadius: 1, backgroundColor: t.ink2, opacity: 0.35 }} />
        <View style={[{ position: 'absolute', top: 0, height: 10, borderRadius: 5, width: `${Math.abs(e.v) / 14 * 50}%` }, e.v > 0 ? { left: '50%', backgroundColor: accent } : { right: '50%', backgroundColor: t.ink2 }]} />
      </View>
    </View>
  );
  return (
    <Page screen="insights" bar={{ kind: 'push', title: 'What helps you' }}>
      <Eyebrow>Your readiness, the day after</Eyebrow>
      <Display s="After {alcohol}, readiness tends to be {14 lower}. {Bed before 11} adds about {11}." />
      <TintCard area="health" style={{ marginTop: space.xl }}>
        <Between><Micro>TENDS TO HELP</Micro><Micro>POINTS OF READINESS</Micro></Between>
        {journalEffects.help.map(eff)}
        <Micro style={{ marginTop: space.xl }}>TENDS TO COST</Micro>
        {journalEffects.cost.map(eff)}
        <Axis labels={['lower', 'days without it', 'higher']} style={{ marginTop: 14 }} />
      </TintCard>
      <Callout style={{ marginTop: space.md }}>Readiness on the day after, vs days without it. Patterns, not proof. Life waits for 8 days of a tag before it shows one.</Callout>
    </Page>
  );
}

/* ───────────────────────── Live workout ───────────────────────── */

export function WorkoutV26() {
  const t = useTokens(), nav = useNavigation(), insets = useSafeAreaInsets(), { flag } = useSeed(), { accent } = useAreaTint('goal'), drawer = useDrawerPhoto();
  const w = liveWorkout, [lo, hi] = load.target;
  const [running, setRunning] = useState(true), [secs, setSecs] = useState(SHOW_SAMPLES ? w.startSeconds : 0);
  useEffect(() => { if (!running) return; const id = setInterval(() => setSecs(s => s + 1), 1000); return () => clearInterval(id); }, [running]);
  return (
    <Page screen="workout" scroll={false} contentStyle={{ paddingHorizontal: 0, paddingBottom: 0, paddingTop: 0 }}
      backdrop={<View pointerEvents="none" style={[StyleSheet.absoluteFill, { bottom: undefined, height: drawer.height ?? 430 }]}><PhotoBackdrop source={photos.run} focal={{ y: 0.8 }} /></View>}
      bar={{ kind: 'photo', left: <StatusPill size="chip" onPhoto icon="fitness" label={w.kind} />, right: <StatusPill size="chip" onPhoto icon="pulse" label={`${w.strap} · Bluetooth`} /> }}>
      <View style={{ flex: 1, minHeight: 180, paddingHorizontal: space.gutter, paddingTop: space.xs, alignItems: 'flex-end' }}>
        <Text variant="callout" style={{ color: photo.onPhoto2 }} accessibilityRole="header" accessibilityLabel={`${w.kind}, ${running ? 'moving time' : 'paused'}`}>{running ? 'Moving time' : 'Paused'}</Text>
        <Text variant="numeralXl" style={{ color: photo.onPhoto, marginTop: 2 }}>{mmss(secs)}</Text>
      </View>
      <View onLayout={drawer.onLayout} style={[drawerStyle, styles.sheet, { backgroundColor: t.surface, paddingTop: space.lg, paddingBottom: Math.max(insets.bottom, space.md) + space.sm }]}>
        <Between style={{ alignItems: 'flex-end' }}>
          <View><Micro>HEART RATE</Micro><View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5, marginTop: space.xxs }}><Text variant="numeralL">{String(w.bpm)}</Text><Text variant="callout" tone="ink2">bpm</Text></View></View>
          <Text variant="title" style={{ marginBottom: 6 }}>{`Zone ${w.zone}`}</Text>
        </Between>
        <View style={[styles.zones, { marginTop: space.sm }]}>
          {[1, 2, 3, 4, 5].map(z => <View key={z} style={[styles.zone, { backgroundColor: z === w.zone ? t.ember : t.surface2 }]}><Text variant="callout" style={{ color: z === w.zone ? photo.ink : t.ink2, fontFamily: fonts.sansSemibold }}>{`Z${z}`}</Text></View>)}
        </View>
        <TintCard area="goal" padding={space.md} style={{ marginTop: space.md }}>
          <Between><Text variant="callout" tone="ink2">Load so far</Text><Text variant="micro" tone="quiet">{`target ${lo}–${hi} today`}</Text></Between>
          <XL text={`${w.load}/21`} size="num" />
          <Gauge lo={lo / 21 * 100} hi={hi / 21 * 100} at={w.load / 21 * 100} onTint color={accent} style={{ marginTop: space.sm }} />
          <Axis labels={['0', 'the band is today’s target', '21']} />
        </TintCard>
        <View style={{ alignItems: 'center', marginTop: space.lg }}>
          <Press haptic="select" onPress={() => setRunning(r => !r)} accessibilityLabel={running ? 'Pause' : 'Resume'} style={[styles.big, { backgroundColor: t.ink }]}>
            <Icon name={running ? 'pause' : 'play'} size={28} color={t.canvas} />
          </Press>
        </View>
        <Btn ghost label="End workout" onPress={() => { setRunning(false); flag('workout-saved', true); feedback.complete(); nav.replace('workoutdetail'); }} style={{ marginTop: space.tile }} />
      </View>
    </Page>
  );
}

/* ───────────────────────── Workouts we spotted ───────────────────────── */

const KIND: Record<string, { as: string; photo?: keyof typeof photos; focal?: { y: number } }> = {
  Run: { as: 'a run', photo: 'run', focal: { y: 0.53 } }, Walk: { as: 'a walk', photo: 'walk', focal: { y: 0.34 } }, Cycle: { as: 'a ride' }, Gym: { as: 'a gym session' }, Other: { as: 'something else' },
};

export function DetectedV26() {
  const nav = useNavigation(), { data, update } = useSeed();
  const decided = (id: string) => !!data.flags[`confirmed-${id}`] || !!data.flags[`dismissed-${id}`];
  const k = spotted.findIndex(a => !decided(a.id));
  const typeOf = (a: typeof spotted[number]) => data.choices[`detected-${a.id}`] ?? a.types[0];
  const setFlags = (patch: Record<string, boolean>, choice?: [string, string]) => update(c => ({ ...c, flags: { ...c.flags, ...patch }, choices: choice ? { ...c.choices, [choice[0]]: choice[1] } : c.choices }));
  if (k === -1) {
    const logged = spotted.filter(a => data.flags[`confirmed-${a.id}`]);
    return (
      <Page screen="detected" bar={{ kind: 'push', title: 'Spotted activity' }} center
        bottom={<DecisionDrawer title="Logged." sub={logged.length ? `${logged.length} workout${logged.length > 1 ? 's' : ''} saved to today.` : 'Nothing was logged.'} undo={{ onPress: () => setFlags(Object.fromEntries(spotted.flatMap(a => [[`confirmed-${a.id}`, false], [`dismissed-${a.id}`, false]]))) }} />}>
        <View style={{ alignItems: 'center' }}><LifeOrb size={72} state="done" /></View>
        <Display s={`{${spotted.length === 2 ? 'Both' : 'All'} sorted.} Nothing else is waiting.`} style={{ alignSelf: 'center', marginTop: space.lg }} />
        {logged.length ? <RowsCard style={{ marginTop: space.xl }}>
          {logged.map(a => <Row key={a.id} icon="fitness" title={`${typeOf(a)} · ${a.mins}`} sub={`${a.when} · ${a.bpm}`} end={String(a.load)} endStrong />)}
        </RowsCard> : null}
        <Callout center style={{ marginTop: space.md }}>Life asks once about each one, then leaves it.</Callout>
      </Page>
    );
  }
  const a = spotted[k], type = typeOf(a), kind = KIND[type] ?? KIND.Other, next = spotted.find((b, j) => j > k && !decided(b.id));
  const facts = `${a.when} · ${a.mins} · ${a.bpm}`;
  const card = (
    <Box pad={space.sm}>
      {kind.photo
        ? <PhotoCard source={photos[kind.photo]} focal={kind.focal} height={150} size="md" chips={[`Spotted · ${k + 1} of ${spotted.length}`]} chipRight={`load ${a.load}`} title={`${type}?`} sub={facts} />
        : <TintCard area="goal" padding={space.md} style={{ minHeight: 150, borderRadius: radius.photo, justifyContent: 'space-between', shadowOpacity: 0, elevation: 0 }}>
            <Between><Chip label={`Spotted · ${k + 1} of ${spotted.length}`} /><Chip label={`load ${a.load}`} /></Between>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.lg }}><Badge icon="fitness" /><View><Text variant="headline">{`${type}?`}</Text><Text variant="callout" tone="ink2">{facts}</Text></View></View>
          </TintCard>}
      <View style={{ marginTop: space.sm }}><BandLine values={a.hr} normal={a.rest} height={70} label="Heart rate during the activity, against your usual range at rest" /></View>
      <Axis labels={[a.ends[0], 'band = your usual at rest', a.ends[1]]} />
      <FilterChips options={a.types.map(v => ({ value: v, label: v }))} value={type} onChange={v => update(c => ({ ...c, choices: { ...c.choices, [`detected-${a.id}`]: v } }))} style={{ marginTop: space.md }} />
    </Box>
  );
  return (
    <Page screen="detected" bar={{ kind: 'push', title: 'Spotted activity' }}
      bottom={<DecisionDrawer title={`Log this as ${kind.as}?`} sub={`${a.mins} · load ${a.load}. You decide.`}
        leave={{ label: 'Not a workout', onPress: () => setFlags({ [`dismissed-${a.id}`]: true }) }}
        confirm={{ label: 'Log it', onPress: () => { setFlags({ [`confirmed-${a.id}`]: true }, [`detected-${a.id}`, type]); feedback.file(); }, haptic: null }}
        ask={{ label: 'Ask Life first', icon: 'help', onPress: () => nav.go('coach') }} />}>
      {k ? <Chip label={`${k} of ${spotted.length} logged`} icon="check" tone="done" /> : null}
      <Display s={`Looks like you moved {${spotted.length === 2 ? 'twice' : `${spotted.length} times`}} without logging it.`} />
      {next ? <PeekStack peeks={[{ left: `${next.name}? · ${next.when} · ${next.mins}`, right: String(spotted.indexOf(next) + 1) }]} style={{ marginTop: space.md }}>{card}</PeekStack>
        : <View style={{ marginTop: space.lg }}>{card}</View>}
    </Page>
  );
}

/* ───────────────────────── Sleep planner ───────────────────────── */

export function SleepplanV26() {
  const t = useTokens(), { data, choose, flag } = useSeed(), { accent } = useAreaTint('work');
  const w = Number(data.choices['sleepplan-wake'] ?? 1), r = Number(data.choices['sleepplan-goal'] ?? 1);
  const wake = sleepPlan.wakes[w] ?? sleepPlan.wakes[1], goal = sleepPlan.goals[r] ?? sleepPlan.goals[1];
  const bed = wake - goal.need - sleep.latency, remind = bed - 45, set = !!data.flags['sleep-reminder'];
  const rel = (m: number) => { const d = (((m - 21 * 60) % 1440) + 1440) % 1440; return d > 720 ? 0 : d; };
  const pos = (m: number) => rel(m) / 7.2;
  const gap = rel(bed) - rel(sleepPlan.usualBed);
  const habit = gap === 0 ? `right on your usual ${clock(sleepPlan.usualBed)}` : `${dur(Math.abs(gap))} ${gap < 0 ? 'earlier' : 'later'} than your usual ${clock(sleepPlan.usualBed)}`;
  return (
    <Page screen="sleepplan" bar={{ kind: 'push', title: 'Plan tonight' }}
      footer={set ? <Btn ghost icon="check" label={`Reminder set for ${clock(remind)}`} onPress={() => flag('sleep-reminder', false)} />
        : <Btn icon="bell" label="Remind me 45 min before" onPress={() => { flag('sleep-reminder', true); choose('sleep-reminder-at', clock(remind)); choose('wake', clock(wake)); feedback.file(); }} />}>
      <BigPhotoBed figure={clock(bed)} sub={`Includes ${sleep.latency} min to fall asleep · ${habit}`} />
      <TintCard area="work" padding={space.md} style={{ marginTop: space.sm }}>
        <View style={[styles.night, { backgroundColor: t.surface }]} accessible accessibilityRole="image" accessibilityLabel={`Tonight: in bed at ${clock(bed)}, up at ${clock(wake)}`}>
          <View style={{ position: 'absolute', top: 13, bottom: 13, width: 10, borderRadius: 5, marginLeft: -5, left: `${pos(remind)}%`, backgroundColor: t.ink2 }} />
          <View style={{ position: 'absolute', top: 6, bottom: 6, borderRadius: 8, left: `${pos(bed)}%`, width: `${pos(bed + sleep.latency) - pos(bed) + 1.6}%`, backgroundColor: accent, opacity: 0.45 }} />
          <View style={{ position: 'absolute', top: 6, bottom: 6, borderRadius: 8, left: `${pos(bed + sleep.latency)}%`, width: `${pos(wake) - pos(bed + sleep.latency)}%`, backgroundColor: accent }} />
        </View>
        <View style={[styles.legend, { marginTop: 14 }]}>
          {[['Reminder', remind], ['In bed', bed], ['Asleep by', bed + sleep.latency], ['Up', wake]].map(([l, m]) => <View key={l} style={{ flex: 1 }}><Text variant="micro" tone="ink2">{String(l)}</Text><Text variant="title" style={{ marginTop: space.xxs, fontVariant: ['tabular-nums'] }}>{clock(Number(m))}</Text></View>)}
        </View>
      </TintCard>
      <Micro style={{ marginTop: space.lg }}>I NEED TO WAKE AT</Micro>
      <WheelPicker options={sleepPlan.wakes.map(clock)} value={w} onChange={i => choose('sleepplan-wake', String(i))} label="Wake time" style={{ marginTop: space.xs }} />
      <Micro style={{ marginTop: space.md }}>HOW RECOVERED</Micro>
      <SegmentedV26 options={sleepPlan.goals.map((g, i) => ({ value: String(i), label: g.name }))} value={String(r)} onChange={v => choose('sleepplan-goal', v)} style={{ marginTop: space.xs }} />
      <Callout center style={{ marginTop: space.xs }}>{`${dur(goal.need)} asleep · ${goal.why}`}</Callout>
    </Page>
  );
}
function BigPhotoBed({ figure, sub }: { figure: string; sub: string }) {
  return <BigPhoto source={photos.bedroom} focal={{ y: 0.8 }} height={186} chip="Be in bed by" figure={figure} sub={sub} />;
}

/* ───────────────────────── How scores work ───────────────────────── */

export function MathV26() {
  const t = useTokens(), { accent } = useAreaTint('health');
  const [open, setOpen] = useState<string | null>('sleep');
  const parts = [{ name: 'HRV', pct: 40, o: 1, sub: 'vs 60 days' }, { name: 'Resting', pct: 25, o: 0.65, sub: 'heart rate' }, { name: 'Sleep', pct: 25, o: 0.42, sub: 'vs need' }, { name: 'Breath', pct: 10, o: 0.24, sub: 'rate' }];
  const how = (text: string, based: string, chips?: string[]) => <View>
    {chips ? <View style={styles.sum}>{chips.map((c, i) => <View key={c} style={styles.sumItem}>{i ? <Icon name="add" size={14} color={t.inkQuiet} /> : null}<Chip label={c} /></View>)}</View> : null}
    <Body s={text} style={{ marginTop: chips ? space.sm : 0 }} />
    <Callout style={{ marginTop: space.xs }}>{`Based on: ${based}`}</Callout>
  </View>;
  const items = [
    { key: 'hrv', title: 'HRV', badge: 'Personal baseline', body: how('RMSSD from beat-to-beat data, or SDNN where only that is available; never mixed.', 'Task Force, 1996') },
    { key: 'load', title: 'Load', badge: 'Estimate', body: how('Heart-rate-zone minutes weighted by zone, scaled 0–21.', 'Karvonen heart-rate reserve; Edwards TRIMP') },
    { key: 'sleep', title: 'Sleep need', badge: 'Estimate', body: how(`For you tonight that comes to about {${dur(sleep.need)}}.`, 'Population range 7–9 h (NHS)', ['Your learned baseline', 'A third of recent debt', 'A load adjustment']) },
    { key: 'signals', title: 'Body signals', badge: 'Personal baseline', body: how('Each signal’s distance from your own normal range.', 'Personal baseline z-scores') },
    { key: 'stress', title: 'Stress', badge: 'Estimate', body: how('Heart rate above resting with lower HRV while still.', 'Estimate; checked against how you say you felt') },
  ];
  return (
    <Page screen="math" bar={{ kind: 'push', title: 'How scores work' }}>
      <Eyebrow icon="shield">Body · the maths</Eyebrow>
      <Display s="{Nothing is a black box.} Every number compares you with yourself." />
      <TintCard area="health" style={{ marginTop: space.xl }}>
        <Between><View style={{ flexDirection: 'row', alignItems: 'center', gap: space.tile }}><Badge icon="heart" /><Text variant="title">Readiness</Text></View><Chip label="Personal baseline" /></Between>
        <View style={[styles.split, { marginTop: space.md }]} accessible accessibilityRole="image" accessibilityLabel="Readiness is 40% heart rate variability, 25% resting heart rate, 25% sleep and 10% breathing rate">
          {parts.map(p => <View key={p.name} style={{ flexGrow: p.pct, flexBasis: 0, borderRadius: 6, backgroundColor: accent, opacity: p.o }} />)}
        </View>
        <View style={[styles.legend, { marginTop: space.sm }]}>
          {parts.map(p => <View key={p.name} style={{ flex: 1 }}>
            <View style={styles.keyRow}><View style={[styles.key, { backgroundColor: accent, opacity: p.o }]} /><Text variant="micro" tone="ink2">{p.name}</Text></View>
            <Text variant="title" style={{ marginTop: space.xxs }}>{`${p.pct}%`}</Text><Text variant="callout" tone="ink2">{p.sub}</Text>
          </View>)}
        </View>
        <Callout style={{ marginTop: space.md }}>Shown after 14 days. Based on: HRV time-domain standards (Task Force, 1996)</Callout>
      </TintCard>
      <Body s="Badges show how far to trust each one. They change as Life checks each score against reference devices." style={{ marginTop: space.lg }} />
      <View style={{ gap: space.xs, marginTop: space.md }}>
        {items.map(i => <Accordion key={i.key} title={i.title} count={i.badge} open={open === i.key} onToggle={() => setOpen(o => (o === i.key ? null : i.key))}>{i.body}</Accordion>)}
      </View>
      <Callout style={{ marginTop: space.md }}>Not a medical device. Not affiliated with any wearable brand.</Callout>
    </Page>
  );
}

/* ───────────────────────── Ask about your body ───────────────────────── */

export function CoachV26() {
  const nav = useNavigation(), t = useTokens(), insets = useSafeAreaInsets();
  const [text, setText] = useState('');
  const asks: { label: string; go: () => void }[] = [
    { label: 'Make today lighter', go: () => nav.go('why') },
    { label: 'Plan tonight’s sleep', go: () => nav.go('sleepplan') },
    { label: 'Am I getting ill?', go: () => nav.go('signals', { state: 'drift' }) },
  ];
  return (
    <Page screen="coach" bar={{ kind: 'push', title: 'Ask about your body', close: true, action: { kind: 'icon', icon: 'clock', label: 'Earlier questions', onPress: () => nav.go('chathistory') } }}
      bottom={<View style={{ paddingHorizontal: space.gutter, paddingBottom: Math.max(insets.bottom, space.sm), gap: space.xs }}>
        <Composer value={text} onChange={setText} placeholder="Ask about your body" onMic={() => nav.go('talk')} onSend={() => { const q = text.trim(); if (!q) return; setText(''); nav.go('chat', { question: q }); }} />
        <Callout center>Health answers use your data and NHS guidance. If you feel unwell, call NHS 111.</Callout>
      </View>}>
      <View style={{ gap: 14 }}>
        <Micro center>SAT 7 NOV · 08:12</Micro>
        <View style={{ alignItems: 'flex-end' }}><ChatBubble text="Why do I feel flat today?" /></View>
        <View>
          <Eyebrow orb>Life</Eyebrow>
          <Statement s={`Three things line up: {@moon ${lighterDay.sleep} of sleep}, a {late caffeine} tag, and your {skin temperature} is up 0.6°C. {Keep today light.}`} style={{ marginTop: space.xs }} />
        </View>
        <TintCard area="health" padding={space.md}>
          <Micro>THE NUMBERS I USED</Micro>
          <Cols items={[{ small: 'Sleep · Low', value: lighterDay.sleep, sub: `need ${lighterDay.need}` }, { small: 'Readiness · Low', value: String(lighterDay.readiness), sub: 'below your normal' }, { small: 'Signals · Watch', value: '3', sub: 'off normal' }]} style={{ marginTop: space.sm }} />
        </TintCard>
        <View style={styles.tags}>
          {asks.map(a => <Press key={a.label} haptic="open" onPress={a.go} accessibilityLabel={a.label} style={[styles.ask, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}><Text variant="bodyMedium">{a.label}</Text></Press>)}
        </View>
      </View>
    </Page>
  );
}

/* ───────────────────────── Tomorrow's forecast ───────────────────────── */

export function ForecastV26() {
  const nav = useNavigation(), t = useTokens(), { data, choose } = useSeed(), { accent } = useAreaTint('health');
  const k = Math.min(forecastData.length - 1, Number(data.choices['forecast-bed'] ?? 0)), f = forecastData[k];
  const scores = forecastData.map(x => x.score), past = readiness.week, days = ['Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Today'];
  const y = (v: number) => 118 - (v - 45) / 35 * 104;
  const [lo, hi] = readiness.normal;
  return (
    <Page screen="forecast" bar={{ kind: 'push', title: 'Tomorrow', action: info('How the forecast works', () => nav.go('math')) }}
      footer={<Btn icon="moon" label="Plan tonight" onPress={() => nav.go('sleepplan')} />}>
      <Eyebrow>Tomorrow’s readiness</Eyebrow>
      <FigRow text={`about ${f.score}`} chip={<Chip label="Estimate" tone="q" />} />
      <PhotoCard source={photos[f.photo]} focal={f.focal} height={156} chips={[`If you’re in bed by ${f.bed}`]} title={f.means} sub={`Tomorrow’s readiness should be about ${f.score}.`} style={{ marginTop: space.md }} />
      <TintCard area="health" style={{ marginTop: space.sm }}>
        <Measure height={150} label="Readiness over the last 7 days against your normal range, and tomorrow’s estimate for three bedtimes">
          {W => {
            const sx = W / 290, x = (i: number) => (10 + i * 31) * sx, xt = 248 * sx;
            return (
              <Svg width={W} height={150}>
                <Rect x={0} y={y(hi)} width={W} height={y(lo) - y(hi)} rx={10} fill={t.surface} />
                <Rect x={xt - 9} y={y(Math.max(...scores)) - 9} width={18} height={y(Math.min(...scores)) - y(Math.max(...scores)) + 18} rx={9} fill={accent} opacity={0.22} />
                {forecastData.map((o, j) => <Line key={j} x1={x(6)} y1={y(past[6])} x2={xt} y2={y(o.score)} stroke={accent} opacity={j === k ? 1 : 0.3} strokeWidth={2} strokeLinecap="round" />)}
                <Polyline points={past.map((v, i) => `${x(i)},${y(v)}`).join(' ')} fill="none" stroke={accent} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
                <Circle cx={x(6)} cy={y(past[6])} r={5} fill={accent} />
                {forecastData.map((o, j) => <Circle key={`c${j}`} cx={xt} cy={y(o.score)} r={j === k ? 6 : 3.5} fill={j === k ? t.ember : t.ink2} />)}
                {forecastData.map((o, j) => <SvgText key={`t${j}`} x={xt + 16} y={y(o.score) + 4} fontSize={11} fontFamily={fonts.sansSemibold} fill={j === k ? t.ink : t.inkQuiet}>{String(o.score)}</SvgText>)}
                {days.map((d, i) => <SvgText key={d} x={x(i)} y={146} textAnchor="middle" fontSize={11} fontFamily={fonts.sansSemibold} fill={t.inkQuiet}>{d}</SvgText>)}
                <SvgText x={xt} y={146} textAnchor="middle" fontSize={11} fontFamily={fonts.sansSemibold} fill={t.ink}>Tomorrow</SvgText>
              </Svg>
            );
          }}
        </Measure>
        <Callout style={{ marginTop: space.xs }}>{`The band is your normal range. Tomorrow can land from ${Math.min(...scores)} to ${Math.max(...scores)}. An estimate from your last 60 nights.`}</Callout>
      </TintCard>
      <Micro style={{ marginTop: space.lg }}>IN BED BY</Micro>
      <SegmentedV26 options={forecastData.map((o, i) => ({ value: String(i), label: o.bed }))} value={String(k)} onChange={v => choose('forecast-bed', v)} style={{ marginTop: space.xs }} />
    </Page>
  );
}

/* ───────────────────────── Cycle-aware readiness ───────────────────────── */

export function CycleV26() {
  const t = useTokens(), params = useLocalSearchParams<{ state?: string }>(), { data, flag } = useSeed(), { accent } = useAreaTint('health');
  const on = !!data.flags['cycle-opt-in'] || params.state === 'on';
  if (!on) return (
    <Page screen="cycle" bar={{ kind: 'push', title: 'Cycle' }} footer={<Btn label="Turn on cycle-aware readiness" onPress={() => { flag('cycle-opt-in', true); feedback.select(); }} />}>
      <PhotoCard source={photos.walk} focal={{ y: 0.42 }} height={236} chips={[{ label: 'Private', icon: 'eyeOff' }]} title="Readiness that respects your cycle" sub="Life can compare your signals with the same phase last month, so expected changes aren’t flagged." />
      <Body s={`Nothing is read until you choose. Life uses your cycle days from ${source} and keeps them on this phone.`} style={{ marginTop: space.lg }} />
      <Callout style={{ marginTop: space.md }}>Off by default. Stays on your phone. Not for contraception or diagnosis.</Callout>
    </Page>
  );
  let day = 0;
  return (
    <Page screen="cycle" bar={{ kind: 'push', title: 'Cycle' }}>
      <PhotoCard source={photos.walk} focal={{ y: 0.42 }} height={236} chips={[`Day ${cycleData.day} · from ${source}`]} chipRight={{ label: 'Private', icon: 'eyeOff' }}
        title={cycleData.now} sub={`A good day for steady effort. Sleep need is about ${cycleData.extraSleep} minutes higher this week.`} />
      <TintCard area="health" style={{ marginTop: space.sm }}>
        <Head icon="calendar" title={`Day ${cycleData.day}`} right="each dot is a day" />
        <View style={[styles.cyc, { marginTop: space.md }]} accessible accessibilityRole="image" accessibilityLabel={`Day ${cycleData.day} of your cycle, in the ${cycleData.now.toLowerCase()}`}>
          {cycleData.phases.map(ph => {
            const cells = Array.from({ length: ph.days }, () => { day += 1; return day; });
            const current = cells.includes(cycleData.day);
            return (
              <View key={ph.name} style={{ flexGrow: ph.days, flexBasis: 0, gap: space.xs, minWidth: 0 }}>
                <View style={{ flexDirection: 'row', gap: 3 }}>
                  {cells.map(d => <View key={d} style={{ flex: 1, aspectRatio: 1, borderRadius: radius.full, backgroundColor: d < cycleData.day ? t.ink : d === cycleData.day ? t.ember : accent, opacity: d <= cycleData.day ? 1 : 0.28 }} />)}
                </View>
                <Text variant="micro" tone={current ? 'ink' : 'ink2'} numberOfLines={1}>{ph.name}</Text>
              </View>
            );
          })}
        </View>
      </TintCard>
      <TileGrid style={{ marginTop: space.sm }}>
        <V26Tile label="Skin temperature" value="+0.3" unit="°C" sub="Normal for this phase, so not flagged"><Chip label="Expected" tone="q" style={{ marginTop: space.sm }} /></V26Tile>
        <V26Tile label="Resting heart rate" value="+3" unit="bpm" sub="Normal for this phase"><Chip label="Expected" tone="q" style={{ marginTop: space.sm }} /></V26Tile>
        <V26Tile wide label="Readiness" scale="/100" value={String(readiness.luteal)} sub="Compared with your luteal-phase baseline" />
      </TileGrid>
      <Callout style={{ marginTop: space.md }}>Off by default. Stays on your phone. Not for contraception or diagnosis.</Callout>
      {data.flags['cycle-opt-in'] ? <Row icon="eyeOff" title="Turn off cycle-aware readiness" onPress={() => flag('cycle-opt-in', false)} style={{ marginTop: space.xs }} /> : null}
    </Page>
  );
}

const styles = StyleSheet.create({
  link: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', minHeight: 28, marginTop: space.sm },
  hscroll: { flexDirection: 'row', gap: space.tile },
  thumb: { width: componentSize.thumb, height: componentSize.thumb, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  stages: { flexDirection: 'row', alignItems: 'flex-end', gap: 2, height: 60, marginTop: space.md },
  legend: { flexDirection: 'row', gap: space.xs },
  keyRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  key: { width: 8, height: 8, borderRadius: 4 },
  split: { flexDirection: 'row', gap: 3, height: 12 },
  day: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 96 },
  sheet: { paddingHorizontal: space.gutter, paddingTop: space.xl },
  halo: { position: 'absolute', width: 196, height: 196, borderRadius: 98 },
  air: { width: 128, height: 128, borderRadius: 64, alignItems: 'center', justifyContent: 'center' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 40, paddingHorizontal: 15, borderRadius: radius.full },
  addRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs, borderRadius: radius.lg, paddingLeft: space.md, paddingRight: space.xs, minHeight: 52 },
  bal: { height: 10, marginTop: space.xs, borderRadius: 5 },
  zones: { flexDirection: 'row', gap: 6 },
  zone: { flex: 1, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  big: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center' },
  night: { height: 36, borderRadius: radius.md },
  sum: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 6 },
  sumItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  ask: { height: 40, paddingHorizontal: 14, borderRadius: radius.full, justifyContent: 'center' },
  cyc: { flexDirection: 'row', gap: space.xs },
});
