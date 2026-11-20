/**
 * Body on real readings (BUILD_V26 Phase 26). The same screens as the board's sample life (`body.tsx`), drawn from the
 * engine's `bodyToday` over the days kept on this phone. A part with no readings says what it needs instead of
 * showing a zero, and nothing here is typed in: every figure comes from `@life/core`. Wellness, not diagnosis.
 */
import { Platform, Share, StyleSheet, View } from 'react-native';
import type { BodySignal, BodyToday, ReadinessDriver, SampleType, SignalKind } from '@life/core';
import {
  BandLine, CapsuleBars, Icon, NormalBandChart, PhotoCard, Press, Reading, Ruler, SectionHead, Text, TileGrid, TintCard, V26Tile,
  feedback, photos, radius, space, useAreaTint, useTokens,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import { fuelShare, macroParts, useFuelDay } from '@/state/fuel';
import { since, useBodyToday } from '@/state/health';
import { clock, dur } from '@/state/body';
import { readHealthNow } from '@/services/health/useHealthRunner';
import { Between, Body, Box, Callout, Chip, Display, Eyebrow, Micro, Page, PhotoRound, Row, RowsCard, Statement } from './kit';
import { Axis, FigRow, Gauge, Head } from './bodykit';
import { EmptyBodyV26 } from './states';

const store = Platform.OS === 'android' ? 'Health Connect' : 'Apple Health';
const info = (label: string, onPress: () => void) => ({ kind: 'icon' as const, icon: 'info' as const, label, onPress });
const zone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
/** Load on its 0–21 scale, to one decimal like the board's 9.4. */
const lf = (n: number) => n.toFixed(1);

/** Day letters under a week chart; the last is today. */
const dayLetters = (week: string[]) => week.map((d, i) => (i === week.length - 1 ? 'Today' : new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'narrow', timeZone: 'UTC' })));
const dayNames = (week: string[]) => week.map(d => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'UTC' }));
const longDay = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' });
/** A UTC instant as a clock time where you are. */
const clockAt = (ms: number) => new Date(ms).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: zone() });

const READINESS_WORD = { high: 'well recovered', moderate: 'steady', low: 'running low' } as const;
const AGAINST = { above: 'Above your normal', within: 'Inside your normal', below: 'Below your normal' } as const;
const stressWord = (v: number) => (v <= 1.5 ? 'low' : v <= 2.2 ? 'moderate' : 'high');

/** Where the last read came from and when, for the chip at the top of Body. */
function useReadChip() {
  const { data } = useSeed(), nav = useNavigation(), h = data.health;
  if (h.failed.length) return <Chip label={`${h.failed.join(' and ')} didn’t answer · Try again`} icon="repeat" onPress={() => { feedback.select(); readHealthNow(); }} />;
  const main = [...h.sources].sort((a, b) => b.types.length - a.types.length)[0];
  return <Chip label={`${main?.name ?? store} · ${since(h.lastRead)}`} tone="q" onPress={() => nav.go('sources')} />;
}

/** The figure every Body page opens with when there's nothing for that part yet. */
function Waiting({ screen, title, statement, needs }: { screen: 'readiness' | 'sleep' | 'load' | 'stress'; title: string; statement: string; needs: string }) {
  const nav = useNavigation();
  return (
    <Page screen={screen} bar={{ kind: 'push', title }}>
      <FigRow text="–" chip={<Chip label="Not yet" tone="q" />} style={{ marginTop: 0 }} />
      <Statement s={statement} style={{ marginTop: space.sm }} />
      <RowsCard style={{ marginTop: space.lg }}>
        <Row icon="watch" title="What it needs" sub={needs} chevron onPress={() => nav.go('devices')} />
      </RowsCard>
      <Callout style={{ marginTop: space.md }}>Wellness guidance from your own readings, not a diagnosis.</Callout>
    </Page>
  );
}

/* ───────────────────────── Body ───────────────────────── */

function headline(b: BodyToday): string {
  const r = b.readiness, debt = b.sleep?.debt.minutes ?? 0;
  if (r.status === 'ready') {
    const word = READINESS_WORD[r.band];
    if (!b.sleep) return `You’re {${word}} today.`;
    return debt > 0 ? `You’re {${word}}, but {${dur(debt)} short} on sleep this week.` : `You’re {${word}}, and your sleep is {on track} this week.`;
  }
  if (r.status === 'calibrating') {
    const left = Math.max(1, r.daysNeeded - r.daysWithData);
    return `{Learning your normal.} Readiness starts in about {${plural(left, 'more day')}}.`;
  }
  if (r.status === 'not-enough' && r.reason === 'no-heart-data') return b.sleep || b.steps !== null ? '{Your readings are in.} Readiness needs heart readings from a watch or ring.' : '{Your first readings are in.} More fills in each day.';
  return '{Not enough last night} for a readiness score. It comes back after your next full night.';
}

export function BodyRealV26() {
  const nav = useNavigation(), b = useBodyToday(), { data, choose } = useSeed();
  const fuel = useFuelDay(), chip = useReadChip();
  if (!b) return <EmptyBodyV26 />;
  const r = b.readiness, ready = r.status === 'ready' ? r : null, noHeart = r.status === 'not-enough' && r.reason === 'no-heart-data';
  const hide = !!data.prefs.hideNumbers;
  const done = data.habits.filter(x => x.last14[13]).length;
  const sleep = b.sleep, load = b.load, stress = b.stress;
  const plan = sleep?.plan.find(p => p.goal === 'full') ?? sleep?.plan[0];
  const drivers = ready?.drivers.filter(d => d.kind === 'hrv' || d.kind === 'restingHr') ?? [];
  const share = ready ? () => {
    const parts = [`Readiness ${ready.score}.`, sleep?.last ? `Slept ${dur(sleep.last.asleepMinutes)} of ${dur(sleep.need.minutes)}.` : '', load ? `Load ${lf(load.today)} of ${lf(load.sweetSpot.low)}–${lf(load.sweetSpot.high)}.` : ''];
    void Share.share({ message: parts.filter(Boolean).join(' ') });
  } : undefined;
  return (
    <Page screen="body" bar={{ kind: 'push', title: 'Body', action: share ? { kind: 'icon', icon: 'arrowUp', label: 'Share', onPress: share } : undefined }}>
      {chip}
      <Display s={headline(b)} />
      <Box pad={18} onPress={() => nav.go('readiness')} accessibilityLabel={ready ? `Readiness ${ready.score}, ${b.against ? AGAINST[b.against] : 'still learning your normal'}` : 'Readiness, not yet'} style={{ marginTop: space.xl }}>
        <Micro>Readiness</Micro>
        {ready ? <>
          <View style={styles.figure}>
            <Text variant="numeralXl">{String(ready.score)}</Text>
            <View style={{ paddingBottom: space.xs, flexShrink: 1 }}>
              <Text variant="title">{b.against ? AGAINST[b.against] : 'Learning your normal'}</Text>
              <Text variant="callout" tone="ink2">{b.normal ? `Against your last ${b.normal.days} days` : 'Your normal needs a few more weeks'}</Text>
            </View>
          </View>
          {b.normal ? <>
            <View style={{ marginTop: space.md }}><NormalBandChart values={b.readinessWeek} normal={[b.normal.low, b.normal.high]} labels={dayLetters(b.week)} /></View>
            <Body variant="callout" s={`Your normal is {${b.normal.low} to ${b.normal.high}}, from your own days.`} style={{ marginTop: space.xs }} />
          </> : null}
        </> : r.status === 'calibrating' ? <>
          <View style={styles.figure}>
            <Text variant="numeralXl" tone="quiet">–</Text>
            <View style={{ paddingBottom: space.xs, flexShrink: 1 }}>
              <Text variant="title">Learning your normal</Text>
              <Text variant="callout" tone="ink2">{`${r.daysWithData} of ${r.daysNeeded} days with heart readings`}</Text>
            </View>
          </View>
          <Ruler pct={Math.round(r.daysWithData / r.daysNeeded * 100)} bars={28} style={{ marginTop: space.md }} />
        </> : <>
          <View style={styles.figure}>
            <Text variant="numeralXl" tone="quiet">–</Text>
            <View style={{ paddingBottom: space.xs, flexShrink: 1 }}>
              <Text variant="title">{noHeart ? 'Needs heart readings' : 'Not enough last night'}</Text>
              <Text variant="callout" tone="ink2">{noHeart ? 'Heart-rate variability from a watch or ring' : 'Back after your next full night'}</Text>
            </View>
          </View>
        </>}
      </Box>
      <TileGrid columns={3} style={{ marginTop: space.tile }}>
        <V26Tile slim label="Sleep" value={sleep?.last ? dur(sleep.last.asleepMinutes) : '–'} sub={sleep ? `of ${dur(sleep.need.minutes)}` : 'no night yet'} onPress={sleep ? () => nav.go('sleep') : undefined}>
          {sleep ? <CapsuleBars values={sleep.week.map(m => (m === null ? null : m / 60))} height={50} dim={0.16} label={`Hours asleep this week${sleep.last ? `, last night ${dur(sleep.last.asleepMinutes)}` : ''}`} /> : null}
        </V26Tile>
        <V26Tile slim label="Load" value={load ? lf(load.today) : '–'} sub={load ? `aim ${lf(load.sweetSpot.low)}–${lf(load.sweetSpot.high)}` : 'needs heart rate'} onPress={load ? () => nav.go('load') : undefined}>
          {load ? <BandLine values={load.week} normal={[load.sweetSpot.low, load.sweetSpot.high]} height={30} label={`Load this week against today’s aim of ${lf(load.sweetSpot.low)} to ${lf(load.sweetSpot.high)}`} /> : null}
        </V26Tile>
        <V26Tile slim label="Stress" value={stress?.now !== null && stress?.now !== undefined ? String(stress.now) : '–'} sub={stress?.now !== null && stress?.now !== undefined ? stressWord(stress.now) : 'needs heart rate'} onPress={stress ? () => nav.go('stress') : undefined}>
          {stress ? <BandLine values={stress.week} normal={stress.usual ?? undefined} height={30} label="Stress this week against your usual" /> : null}
        </V26Tile>
      </TileGrid>
      {sleep?.last ? <>
        <SectionHead title="Last night" link="Sleep" onLink={() => nav.go('sleep')} />
        <Box pad={space.md}><NightBar night={sleep.last} performance={sleep.performance} /></Box>
      </> : null}
      {drivers.length ? <>
        <SectionHead title={ready?.band === 'high' ? 'Why you’re recovered' : ready?.band === 'low' ? 'What’s weighing on it' : 'What’s behind today'} link="Readiness" onLink={() => nav.go('readiness')} />
        <RowsCard style={{ paddingVertical: space.xxs }}>
          {drivers.map(d => <Row key={d.kind} icon={d.kind === 'hrv' ? 'pulse' : 'heart'} title={DRIVER[d.kind].name} sub={deltaLine(d)} onPress={() => nav.go('readiness')} right={<WhyEnd value={`${Math.round(d.value)} ${DRIVER[d.kind].unit}`} tag={tagFor(d)} />} />)}
        </RowsCard>
      </> : null}
      {b.signals.illness ? (
        <RowsCard style={{ marginTop: space.sm }}>
          <Row icon="pulse" title={`${plural(b.signals.drifting.length, 'signal')} off your normal`} sub="Take it easy today. See what changed." chevron onPress={() => nav.go('signals')} />
        </RowsCard>
      ) : b.signals.signals.length ? (
        <RowsCard style={{ marginTop: space.sm }}>
          <Row icon="pulse" title="Body signals" sub={b.signals.drifting.length ? `${plural(b.signals.drifting.length, 'signal')} off your normal` : b.signals.signals.some(goodSide) ? 'Nothing to watch today' : `All ${b.signals.signals.length} inside your normal`} chevron onPress={() => nav.go('signals')} />
        </RowsCard>
      ) : null}
      <SectionHead title="Fuel" link="Log food" onLink={() => nav.go('snap')} />
      {hide
        ? <PhotoCard source={photos.food} height={176} title="Balanced" sub="Regular meals and variety" onPress={() => nav.go('fuel')} />
        : <PhotoCard source={photos.food} height={176} chips={[fuel.ready ? `${Math.round(fuelShare(fuel) * 100)}% of today` : 'No target yet']} chipRight={fuel.ready ? `${fuel.left.toLocaleString('en-GB')} left` : undefined}
            title={fuel.eaten.toLocaleString('en-GB')} titleSuffix={fuel.ready ? `of ${fuel.budget.toLocaleString('en-GB')} kcal` : 'kcal so far'} sub={macroParts(fuel).map(m => `${m.label} ${m.value}`).join(' · ')} onPress={() => nav.go('fuel')} />}
      {sleep && plan ? <>
        <SectionHead title="Tonight" />
        <Box pad={space.md} onPress={() => nav.go('sleep')} accessibilityLabel={`Tonight, in bed by ${clock(plan.bedtime)}`}>
          <Between style={{ alignItems: 'center' }}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="title">{`In bed by ${clock(plan.bedtime)}`}</Text>
              <Text variant="callout" tone="ink2">{sleep.tonight.debt > 0 ? `Pays back ${sleep.tonight.debt} minutes of this week’s ${dur(sleep.debt.minutes)}` : `For about ${dur(plan.asleep)} asleep before ${clock(sleep.wake)}`}</Text>
            </View>
            <Chip label={clock(plan.reminder)} icon="bell" tone="q" />
          </Between>
        </Box>
      </> : null}
      <SectionHead title="Habits today" link={`${done} of ${data.habits.length}`} onLink={() => nav.go('habits')} />
      <Box pad={space.md} style={{ paddingVertical: space.xs }}>
        {data.habits.length ? data.habits.map(x => (
          <Press key={x.id} haptic="open" onPress={() => { choose('habit', x.id); nav.go('strength'); }} accessibilityLabel={`${x.name}, ${x.last14.filter(Boolean).length} of the last 14 days`} style={{ paddingVertical: 9 }}>
            <Between><Text variant="buttonCompact" numberOfLines={1} style={{ flexShrink: 1 }}>{x.name}</Text><Text variant="callout" tone="ink2" numberOfLines={1} style={{ flexShrink: 1 }}>{(x.shortCue ?? x.cue).split(' · ')[0]}</Text></Between>
          </Press>
        )) : <Press haptic="open" onPress={() => nav.go('habitnew')} accessibilityLabel="Start a habit" style={{ paddingVertical: space.sm }}><Text variant="buttonCompact">Start a tiny habit</Text><Text variant="callout" tone="ink2">Two minutes, after something you already do</Text></Press>}
      </Box>
      {b.lastDate && b.lastDate < b.today ? <Callout style={{ marginTop: space.md }}>{`Nothing new since ${longDay(b.lastDate)}. Open ${store} or your watch’s app to sync.`}</Callout> : null}
      <Callout style={{ marginTop: space.md }}>Wellness guidance from your own readings, not a diagnosis.</Callout>
    </Page>
  );
}

function WhyEnd({ value, tag }: { value: string; tag: string }) {
  return <View style={{ alignItems: 'flex-end', gap: space.xxs }}><Text variant="buttonCompact" style={{ fontVariant: ['tabular-nums'] }}>{value}</Text><Chip label={tag} tone="q" /></View>;
}

/* ───────────────────────── Last night, as stage totals ───────────────────────── */

const STAGES = ['deep', 'rem', 'light', 'awake'] as const;
const STAGE_OPACITY = { deep: 1, rem: 0.6, light: 0.3, awake: 0.45 } as const;
const stageName = (s: (typeof STAGES)[number]) => (s === 'rem' ? 'REM' : s[0].toUpperCase() + s.slice(1));

/** The night from bed to wake, split by how long each stage lasted (real readings give totals, not a timeline). */
function NightBar({ night, performance }: { night: NonNullable<BodyToday['sleep']>['last'] & object; performance: number | null }) {
  const t = useTokens(), { accent } = useAreaTint('work');
  const stages = night.stages, total = stages ? STAGES.reduce((a, s) => a + stages[s], 0) : 0;
  const color = (s: (typeof STAGES)[number]) => (s === 'awake' ? t.ink2 : accent);
  return (
    <View>
      <Between><Text variant="buttonCompact">{`${clockAt(night.start)} – ${clockAt(night.end)}`}</Text><Text variant="callout" tone="ink2">{`Asleep ${dur(night.asleepMinutes)}${performance !== null ? ` · ${performance}%` : ''}`}</Text></Between>
      {stages && total > 0 ? <>
        <View style={[styles.split, { marginTop: space.md }]} accessible accessibilityRole="image" accessibilityLabel={`Last night: ${STAGES.map(s => `${stageName(s)} ${dur(stages[s])}`).join(', ')}`}>
          {STAGES.map(s => (stages[s] > 0 ? <View key={s} style={{ flexGrow: stages[s] / total, flexBasis: 0, minWidth: 4, borderRadius: 6, backgroundColor: color(s), opacity: STAGE_OPACITY[s] }} /> : null))}
        </View>
        <View style={[styles.legend, { marginTop: space.sm }]}>
          {STAGES.map(s => (
            <View key={s} style={{ flex: 1 }}>
              <View style={styles.keyRow}><View style={[styles.key, { backgroundColor: color(s), opacity: STAGE_OPACITY[s] }]} /><Text variant="micro" tone="ink2">{stageName(s)}</Text></View>
              <Text variant="title" style={{ marginTop: space.xxs, fontVariant: ['tabular-nums'] }}>{dur(stages[s])}</Text>
            </View>
          ))}
        </View>
      </> : <Text variant="callout" tone="ink2" style={{ marginTop: space.xs }}>{`In bed ${dur(night.inBedMinutes)}. Stages need a watch or ring.`}</Text>}
    </View>
  );
}

/* ───────────────────────── Readiness ───────────────────────── */

const DRIVER: Record<ReadinessDriver['kind'], { name: string; unit: string; icon: 'pulse' | 'heart' | 'moon' | 'water' | 'watch' }> = {
  hrv: { name: 'Heart rate variability', unit: 'ms', icon: 'pulse' },
  restingHr: { name: 'Resting heart rate', unit: 'bpm', icon: 'heart' },
  sleep: { name: 'Sleep performance', unit: '%', icon: 'moon' },
  respiratoryRate: { name: 'Breathing rate', unit: '/min', icon: 'water' },
  external: { name: 'Your wearable’s score', unit: '', icon: 'watch' },
};

/**
 * How a reading compares, in the same terms as its tag: HRV and resting heart rate are judged on this week's
 * average against your normal, breathing rate on last night.
 */
function deltaLine(d: ReadinessDriver): string {
  if (d.kind === 'sleep' || d.kind === 'external') return d.effect === 'usual' ? 'About usual' : d.effect === 'better' ? 'Helping today' : 'Weighing on today';
  const weekly = (d.kind === 'hrv' || d.kind === 'restingHr') && d.recent !== undefined && d.usual !== undefined;
  const diff = weekly ? (d.recent as number) - (d.usual as number) : d.delta;
  if (diff === undefined) return d.effect === 'usual' ? 'About usual' : d.effect === 'better' ? 'Helping today' : 'Weighing on today';
  const n = Math.abs(d.kind === 'respiratoryRate' ? Math.round(diff * 10) / 10 : Math.round(diff)), unit = DRIVER[d.kind].unit.replace('/min', 'a minute');
  if (n === 0) return weekly ? 'This week, right on your normal' : 'Right on your normal';
  return `${weekly ? 'This week, ' : ''}${n} ${unit} ${diff > 0 ? 'above' : 'below'} your normal`;
}
const tagFor = (d: ReadinessDriver) => (d.effect === 'better' ? 'Better' : d.effect === 'usual' ? 'Usual' : d.kind === 'restingHr' || d.kind === 'respiratoryRate' ? 'Higher' : 'Lower');

export function ReadinessRealV26() {
  const nav = useNavigation(), b = useBodyToday();
  if (!b) return <EmptyBodyV26 />;
  const r = b.readiness;
  if (r.status !== 'ready') {
    return <Waiting screen="readiness" title="Readiness" statement={headline(b)}
      needs={r.status === 'calibrating' ? `Two weeks of heart readings. ${r.daysWithData} of ${r.daysNeeded} days so far.` : 'Heart-rate variability and resting heart rate from a watch or ring'} />;
  }
  const series = (d: ReadinessDriver): (number | null)[] => {
    if (d.kind === 'hrv') return b.readings.hrv;
    if (d.kind === 'restingHr') return b.readings.restingHr;
    if (d.kind === 'respiratoryRate') return b.readings.respiratoryRate;
    if (d.kind === 'sleep' && b.sleep) return b.sleep.week.map(m => (m === null ? null : Math.min(100, Math.round(m / b.sleep!.need.minutes * 100))));
    return [d.value];
  };
  const shown = r.drivers.filter(d => d.kind !== 'external');
  const external = r.drivers.find(d => d.kind === 'external');
  return (
    <Page screen="readiness" bar={{ kind: 'push', title: 'Readiness', action: info('How readiness is worked out', () => nav.go('math')) }}>
      <FigRow text={`${r.score}/100`} chip={<Chip label={b.against ? AGAINST[b.against] : 'Learning your normal'} tone={b.against === 'above' ? 'done' : 'q'} />} style={{ marginTop: 0 }} />
      <Statement s={r.band === 'high' ? 'A good day for your {harder workout} or the {bigger decision}.' : r.band === 'moderate' ? 'A {normal day}. Keep the {hard session} for when you’re fresher.' : 'Go {easy} today. {Sleep} matters more than training tonight.'} style={{ marginTop: space.sm }} />
      <SectionHead title="Why" link={b.normal ? `against your ${b.normal.days}-day normal` : 'against your normal'} style={{ marginTop: 28 }} />
      <View style={{ gap: space.xs }}>
        {shown.map(d => (
          <Reading key={d.kind} icon={DRIVER[d.kind].icon} name={DRIVER[d.kind].name} value={d.kind === 'respiratoryRate' ? (Math.round(d.value * 10) / 10).toFixed(1) : String(Math.round(d.value))} unit={DRIVER[d.kind].unit}
            tag={tagFor(d)} tagKind={d.effect === 'better' ? 'done' : 'quiet'} delta={d.kind === 'sleep' && b.sleep?.last ? `Asleep ${dur(b.sleep.last.asleepMinutes)} of ${dur(b.sleep.need.minutes)}` : deltaLine(d)}
            series={series(d)} normal={d.normal ?? (d.kind === 'sleep' ? [85, 100] : [d.value, d.value])}
            onPress={d.kind === 'sleep' ? () => nav.go('sleep') : d.kind === 'respiratoryRate' ? () => nav.go('signals') : undefined} />
        ))}
      </View>
      {external ? <RowsCard style={{ marginTop: space.sm }}><Row icon="watch" title={`${external.source ?? 'Your wearable'}’s own score`} sub="Counted as one part of four, never the whole" right={<Text variant="buttonCompact">{String(Math.round(external.value))}</Text>} /></RowsCard> : null}
      <Callout style={{ marginTop: space.md }}>The shaded band is your own normal range. Wellness guidance, not a diagnosis.</Callout>
    </Page>
  );
}

/* ───────────────────────── Sleep ───────────────────────── */

export function SleepRealV26() {
  const nav = useNavigation(), b = useBodyToday();
  if (!b) return <EmptyBodyV26 />;
  const s = b.sleep;
  if (!s) return <Waiting screen="sleep" title="Sleep" statement="{No nights yet.} Sleep fills in after your first night with a reading." needs={`Sleep from ${store}, a watch or a ring`} />;
  const needH = s.need.minutes / 60, plan = s.plan.find(p => p.goal === 'full') ?? s.plan[0], nights = s.week.filter(m => m !== null).length;
  return (
    <Page screen="sleep" bar={{ kind: 'push', title: 'Sleep', action: info('How sleep is worked out', () => nav.go('math')) }}>
      <FigRow text={s.last ? dur(s.last.asleepMinutes) : '–'} chip={<Chip label={`Needed about ${dur(s.need.minutes)}`} tone="q" />} style={{ marginTop: 0 }} />
      <Statement s={s.debt.minutes > 0 ? `This week’s debt is {${dur(s.debt.minutes)}}. {Tonight can pay some back.}` : 'No sleep debt this week. {Keep tonight the same.}'} style={{ marginTop: space.sm }} />
      {plan ? <PhotoCard source={photos.bedroom} focal={{ y: 0.52 }} height={176} chips={['Tonight', { label: `Reminder ${clock(plan.reminder)}`, icon: 'bell' }]}
        title={`In bed by ${clock(plan.bedtime)}`} sub={s.tonight.debt > 0 ? `Pays back ${s.tonight.debt} minutes of debt` : `For about ${dur(plan.asleep)} asleep`} style={{ marginTop: space.lg }} /> : null}
      {s.last ? <TintCard area="work" style={{ marginTop: space.sm }}>
        <Head icon="moon" title="Last night" right={s.last.stages ? 'by stage' : 'asleep'} />
        <View style={{ marginTop: space.sm }}><NightBar night={s.last} performance={s.performance} /></View>
      </TintCard> : null}
      <Box style={{ marginTop: space.sm }}>
        <Between><Text variant="title">Last 7 nights</Text><Text variant="callout" tone="ink2">band = what you needed</Text></Between>
        <View style={{ marginTop: space.xs }}><BandLine values={s.week.map(m => (m === null ? null : +(m / 60).toFixed(2)))} normal={[needH - 0.17, needH + 0.25]} height={104} label="Hours asleep on each of the last 7 nights, against what you needed" /></View>
        <Axis labels={dayNames(b.week)} lastInk />
        <Callout style={{ marginTop: space.sm }}>{reachedLine(nights, s.reached, s.debt.minutes)}</Callout>
      </Box>
      <TileGrid style={{ marginTop: space.sm }}>
        <V26Tile label="Sleep performance" value={s.performance !== null ? String(s.performance) : '–'} unit={s.performance !== null ? '%' : undefined} sub="Asleep ÷ needed" />
        <V26Tile label="Fell asleep in" value={s.last?.latencyMinutes !== undefined ? String(Math.round(s.last.latencyMinutes)) : '–'} unit={s.last?.latencyMinutes !== undefined ? 'min' : undefined} sub={s.last?.latencyMinutes !== undefined ? 'Last night' : 'Needs time in bed from your watch'} />
        <V26Tile wide label="Consistency" scale={s.consistency ? (s.consistency.minutes <= 30 ? 'Steady' : s.consistency.minutes <= 60 ? 'Fair' : 'Work on it') : undefined} value={s.consistency ? `±${s.consistency.minutes}` : '–'} unit={s.consistency ? 'min' : undefined}
          sub={s.consistency ? `How far your bedtime moves, night to night. Usually in bed by ${clock(s.consistency.usualBedtime)}.` : 'Needs a few more nights'} />
      </TileGrid>
      <Callout style={{ marginTop: space.md }}>{s.need.basis === 'learned' ? `Your need is learned from ${plural(s.need.nights, 'night')} you woke up recovered.` : 'Most adults need 7–9 hours (NHS). Life learns your own need from mornings you wake up recovered.'}</Callout>
    </Page>
  );
}

function reachedLine(nights: number, reached: number, debt: number): string {
  const short = debt > 0 ? ` Together the short ones come to ${dur(debt)}.` : '';
  if (nights < 7) return `${plural(nights, 'night')} with a reading this week, ${reached} reaching your need.${short}`;
  if (reached === 0) return `No night this week reached your need.${short}`;
  if (reached === 7) return 'Every night this week reached your need.';
  return `${reached} of 7 nights reached your need.${short}`;
}

/* ───────────────────────── Load ───────────────────────── */

const RATIO_WORDS = { low: 'Lighter than your usual week', sweet: 'About your usual week', high: 'Heavier than your usual week', spike: 'A big jump on your usual week' } as const;

export function LoadRealV26() {
  const nav = useNavigation(), b = useBodyToday(), t = useTokens(), { accent } = useAreaTint('goal');
  if (!b) return <EmptyBodyV26 />;
  const l = b.load;
  if (!l) return <Waiting screen="load" title="Load" statement="{No load yet.} Load comes from your heart rate through the day." needs="Heart rate from a watch, a ring or a strap" />;
  const { low: lo, high: hi } = l.sweetSpot, now = l.today, where = l.sweetSpot.position;
  const H = 140, y = (v: number) => H - 20 - v / 21 * (H - 26);
  const set = b.readiness.status === 'ready' ? `set by your readiness of {${b.readiness.score}}` : 'set by your usual day';
  return (
    <Page screen="load" bar={{ kind: 'push', title: 'Load', action: info('How load works', () => nav.go('math')) }}>
      <Eyebrow>Today so far</Eyebrow>
      <FigRow text={`${lf(now)}/21`} chip={<Chip label={where === 'in' ? 'In today’s range' : where === 'below' ? 'Under today’s range' : 'Over today’s range'} tone={where === 'in' ? 'done' : 'q'} />} />
      <Statement s={`Today’s sweet spot is {${lf(lo)}–${lf(hi)}}, ${set}. ${where === 'in' ? '{You’re in it}, so the rest of today can be easy.' : where === 'below' ? `{About ${lf(Math.max(0.1, lo - now))} more} would land you in it.` : '{You’re past it}, so keep the rest of today easy.'}`} style={{ marginTop: space.sm }} />
      <TintCard area="goal" style={{ marginTop: space.lg }}>
        <Head icon="fitness" title="This week" right="band = sweet spot" />
        <View style={{ marginTop: space.xs, height: H }}>
          <View style={{ position: 'absolute', left: 0, right: 0, top: y(hi), height: y(lo) - y(hi), borderRadius: radius.sm, backgroundColor: t.surface }} />
          <CapsuleBars values={l.week} labels={b.week.map(d => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { weekday: 'narrow', timeZone: 'UTC' }))} now={6} max={21} height={H} color={accent} dim={0.35} label={`Load on each of the last 7 days, with today’s sweet spot of ${lf(lo)} to ${lf(hi)} shaded`} />
        </View>
        <Callout style={{ marginTop: space.xs }}>The band moves with your readiness each morning.</Callout>
      </TintCard>
      <TileGrid style={{ marginTop: space.sm }}>
        <V26Tile label="This week" value={l.ratio ? String(Math.round(l.ratio.ratio * 100)) : '–'} unit={l.ratio ? '%' : undefined} sub={l.ratio ? RATIO_WORDS[l.ratio.zone] : 'Needs four weeks of load'} />
        <V26Tile label="Steps today" value={b.steps !== null ? b.steps.toLocaleString('en-GB') : '–'} sub={b.steps !== null ? 'So far today' : 'None yet today'} />
      </TileGrid>
      <Callout style={{ marginTop: space.md }}>{l.sweetSpot.basis === 'default' ? 'The sweet spot starts from a typical day and becomes yours after two weeks of load. An estimate of effort, not a fitness test.' : 'An estimate of effort, not a fitness test.'}</Callout>
    </Page>
  );
}

/* ───────────────────────── Body signals ───────────────────────── */

const SIGNAL: Record<SignalKind, { name: string; unit: string; show: (v: number) => string }> = {
  skinTemp: { name: 'Wrist temperature', unit: '°C', show: v => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(v).toFixed(1)}` },
  respiratoryRate: { name: 'Breathing rate', unit: '/min', show: v => v.toFixed(1) },
  restingHr: { name: 'Resting heart rate', unit: 'bpm', show: v => String(Math.round(v)) },
  spo2: { name: 'Blood oxygen', unit: '%', show: v => String(Math.round(v)) },
};
/** Outside your range on the side that isn't a worry (a lower resting heart rate, say). */
const goodSide = (s: BodySignal) => !s.drifting && (s.position < 30 || s.position > 70);
const signalChip = (s: BodySignal) => (s.drifting ? 'Off normal' : goodSide(s) ? (s.position < 30 ? 'Lower than usual' : 'Higher than usual') : 'In range');
const signalSub = (s: BodySignal) => (s.kind === 'skinTemp' ? 'Against your usual' : `Usual ${SIGNAL[s.kind].show(s.usual)}`);

export function SignalsRealV26() {
  const nav = useNavigation(), b = useBodyToday();
  if (!b) return <EmptyBodyV26 />;
  const g = b.signals, off = g.drifting.length;
  return (
    <Page screen="signals" bar={{ kind: 'push', title: 'Body signals' }}>
      {g.illness ? <>
        <Eyebrow>{g.daysRunning > 1 ? `Against your own normal · ${g.daysRunning} days running` : 'Against your own normal'}</Eyebrow>
        <Display s={`{${plural(off, 'signal')}} are off your normal. {Take it easy today.}`} />
        <Body s="This can happen when you’re coming down with something, after alcohol, or after a very hard day. {If you feel unwell, call NHS 111.}" style={{ marginTop: space.sm }} />
      </> : g.signals.length ? <>
        <Eyebrow>Against your own normal</Eyebrow>
        <Display s={off ? `{${plural(off, 'signal')}} ${off === 1 ? 'is' : 'are'} off your normal today. {Worth watching.}` : g.signals.some(goodSide) ? '{Nothing to watch} today. Each signal is in your normal range or on the good side of it.' : `All {${plural(g.signals.length, 'signal')}} ${g.signals.length === 1 ? 'is' : 'are'} inside {your normal range} today.`} />
      </> : <>
        <Eyebrow>Against your own normal</Eyebrow>
        <Display s={g.learning.length ? '{Learning your normal.} Signals show after two weeks of overnight readings.' : '{No overnight readings yet.} A watch or ring adds these.'} />
      </>}
      {g.signals.length ? (
        <TintCard area="health" padding={space.sm} style={{ marginTop: space.lg }}>
          <View style={{ paddingHorizontal: space.xxs, paddingTop: space.xxs }}><Head icon="pulse" title="Where you sit" right="band = your own range" /></View>
          <TileGrid style={{ marginTop: space.sm }}>
            {g.signals.map(s => (
              <V26Tile key={s.kind} label={SIGNAL[s.kind].name} value={SIGNAL[s.kind].show(s.value)} unit={SIGNAL[s.kind].unit} sub={signalSub(s)} style={{ minHeight: 0, paddingHorizontal: space.sm }}>
                <Gauge lo={30} hi={70} at={s.position} style={{ marginTop: 14 }} />
                <Chip label={signalChip(s)} tone={s.drifting ? undefined : 'q'} style={{ marginTop: space.sm }} />
              </V26Tile>
            ))}
          </TileGrid>
        </TintCard>
      ) : null}
      {g.learning.length ? (
        <RowsCard style={{ marginTop: space.sm }}>
          <Row icon="info" title="Still learning" sub={`${g.learning.map(k => SIGNAL[k].name).join(', ')}: two weeks of nights first`} />
        </RowsCard>
      ) : null}
      {g.illness ? <Row icon="sun" title="Make today lighter" sub="Move the hard session and get to bed earlier" chevron onPress={() => nav.go('today')} style={{ marginTop: space.xs }} /> : null}
      <Callout style={{ marginTop: space.md }}>Not a medical device. Life compares you only with yourself and never diagnoses.</Callout>
    </Page>
  );
}

/* ───────────────────────── Stress ───────────────────────── */

export function StressRealV26() {
  const nav = useNavigation(), b = useBodyToday(), t = useTokens(), { accent } = useAreaTint('you'), { choose } = useSeed();
  if (!b) return <EmptyBodyV26 />;
  const s = b.stress, day = s?.today;
  if (!s || s.now === null || !day) return <Waiting screen="stress" title="Stress" statement="{Nothing measured yet today.} Stress comes from your heart rate while you’re still." needs="Heart rate through the day from a watch or ring" />;
  const breathe = () => { choose('breath-protocol', 'Resonance'); choose('breath-seconds', '120'); nav.go('breathe'); };
  // Show the measured part of the day only: from the first reading to the last.
  const first = day.levels.findIndex(v => v !== null), last = day.levels.length - 1 - [...day.levels].reverse().findIndex(v => v !== null);
  const shown = day.levels.slice(first, last + 1), at = (k: number) => clockAt(day.start + k * day.windowMinutes * 60_000);
  const busy = day.busiest, usual = s.usual;
  const calm = day.calmShare ?? 0;
  return (
    <Page screen="stress" bar={{ kind: 'push', title: 'Stress', action: info('How stress works', () => nav.go('math')) }}>
      <Eyebrow>Right now</Eyebrow>
      <FigRow text={`${s.now}/3`} chip={<Chip label={`${stressWord(s.now)[0].toUpperCase()}${stressWord(s.now).slice(1)} · estimate`} tone="q" />} />
      <Statement s={busy ? `One busy stretch from {${at(busy[0])} to ${at(busy[1] + 1)}}. {Two minutes of slow breathing} can help you reset.` : 'Mostly {calm} so far today. {Two minutes of slow breathing} keeps it that way.'} style={{ marginTop: space.sm }} />
      <TintCard area="you" style={{ marginTop: space.lg }}>
        <Head icon="pulse" title={`Every ${day.windowMinutes} min`} right="0 calm · 3 high" />
        <View style={[styles.day, { marginTop: space.md }]} accessible accessibilityRole="image" accessibilityLabel={`Stress every ${day.windowMinutes} minutes from ${at(first)} to ${at(last + 1)}${usual ? ', against your usual range' : ''}`}>
          {usual ? <View style={{ position: 'absolute', left: 0, right: 0, bottom: `${usual[0] / 3 * 100}%`, height: `${Math.max(2, (usual[1] - usual[0]) / 3 * 100)}%`, borderRadius: radius.sm, backgroundColor: t.surface }} /> : null}
          {shown.map((v, k) => (v === null
            ? <View key={k} style={{ flex: 1, height: 4, borderRadius: 2, backgroundColor: t.surface3 }} />
            : <View key={k} style={{ flex: 1, minHeight: 4, height: `${Math.round(v / 3 * 100)}%`, borderRadius: 4, backgroundColor: accent, opacity: busy && k + first >= busy[0] && k + first <= busy[1] ? 1 : 0.35 }} />))}
        </View>
        <Axis labels={[at(first), at(Math.round((first + last + 1) / 2)), at(last + 1)]} />
        <Callout style={{ marginTop: space.sm }}>{usual ? 'The band is where you usually sit while still. Gaps are when you were moving.' : 'Your usual range shows after a week of readings. Gaps are when you were moving.'}</Callout>
      </TintCard>
      <TileGrid style={{ marginTop: space.sm }}>
        <V26Tile label="Busiest stretch" scale={busy ? 'High' : undefined} value={busy ? String((busy[1] - busy[0] + 1) * day.windowMinutes) : '–'} unit={busy ? 'min' : undefined} sub={busy ? `${at(busy[0])} – ${at(busy[1] + 1)}` : 'None today'} />
        <V26Tile label="Time calm today" scale={`${calm}%`} value={dur(day.calmMinutes)}><Ruler pct={calm} bars={18} style={{ marginTop: space.sm }} /></V26Tile>
      </TileGrid>
      <PhotoCard source={photos.breathe} focal={{ y: 0.36 }} height={170} chips={['A reset']} topRight={<PhotoRound icon="play" label="Breathe for 2 minutes" onPress={breathe} />} title="Breathe for 2 minutes" sub="About 6 slow breaths a minute" onPress={breathe} style={{ marginTop: space.sm }} />
      <Callout style={{ marginTop: space.md }}>Heart rate also rises with excitement, caffeine and movement, so treat this as a hint, not a fact.</Callout>
    </Page>
  );
}

/* ───────────────────────── Sources ───────────────────────── */

const TYPE_NAME: Partial<Record<SampleType, string>> = {
  sleep: 'Sleep', hrv: 'HRV', restingHeartRate: 'Resting heart rate', heartRate: 'Heart rate', respiratoryRate: 'Breathing rate', oxygenSaturation: 'Blood oxygen',
  skinTemperature: 'Wrist temperature', skinTemperatureDelta: 'Wrist temperature', steps: 'Steps', activeEnergy: 'Active energy',
};
const KIND_WORD = { device: 'Phone or watch', wearable: 'Wearable', aggregator: 'Another app', manual: 'Typed in' } as const;

export function SourcesRealV26() {
  const nav = useNavigation(), t = useTokens(), { data, choose } = useSeed(), h = data.health;
  const latest = [...h.disagreements].sort((a, b) => b.date.localeCompare(a.date))[0];
  const nameOf = (id: string) => h.sources.find(s => s.id === id)?.name ?? id;
  const prefKey = latest ? `health-prefer-${latest.type}` : '';
  const used = latest ? data.choices[prefKey] || latest.chosen : '';
  const pick = (id: string) => { if (!latest || id === used) return; choose(prefKey, id); feedback.select(); readHealthNow(); };
  const show = (v: number) => (latest?.type === 'sleep' ? dur(v) : String(Math.round(v)));
  return (
    <Page screen="sources" bar={{ kind: 'push', title: 'Your sources', action: { kind: 'icon', icon: 'add', label: 'Connect devices', onPress: () => nav.go('devices') } }}>
      <Eyebrow>{`Last read ${since(h.lastRead).toLowerCase()}`}</Eyebrow>
      <Display s={h.sources.length ? `{${plural(h.sources.length, 'source')}}, each measure from the one that {reads it best}.` : '{No readings yet.} Connect a source and Life reads it here.'} />
      {h.sources.length ? (
        <Box pad={space.md} style={{ marginTop: space.xl }}>
          <Between><Micro>Source and what it gives</Micro><Micro>Kind</Micro></Between>
          <View style={{ marginTop: space.sm, gap: space.tile }}>
            {h.sources.map(s => (
              <View key={s.id}>
                <Between><Text variant="buttonCompact" numberOfLines={1} style={{ flexShrink: 1 }}>{s.name}</Text><Chip label={KIND_WORD[s.kind]} tone="q" /></Between>
                <Text variant="callout" tone="ink2" style={{ marginTop: 2 }}>{[...new Set(s.types.map(x => TYPE_NAME[x] ?? x))].join(', ')}</Text>
              </View>
            ))}
          </View>
        </Box>
      ) : null}
      {latest ? (
        <TintCard area="work" style={{ marginTop: space.sm }}>
          <Head icon={latest.type === 'sleep' ? 'moon' : 'pulse'} title={`They disagreed ${latest.date === h.days[h.days.length - 1]?.date ? 'last night' : 'recently'}`} right={<Chip label={TYPE_NAME[latest.type] ?? latest.type} />} />
          <View style={styles.duel}>
            {[{ source: latest.chosen, value: NaN }, ...latest.others].slice(0, 3).map(o => {
              const on = o.source === used;
              return (
                <Press key={o.source} haptic="select" onPress={() => pick(o.source)} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={`${nameOf(o.source)}${on ? ', used' : ''}`}
                  style={[styles.duelBox, { backgroundColor: on ? t.ink : t.surface }]}>
                  <Between><Text variant="callout" numberOfLines={1} style={{ color: on ? t.canvas : t.ink2, flexShrink: 1 }}>{nameOf(o.source)}</Text>{on ? <Icon name="check" size={14} color={t.canvas} /> : null}</Between>
                  <Text variant="heading" style={{ marginTop: 6, color: on ? t.canvas : t.ink, fontVariant: ['tabular-nums'] }}>{Number.isFinite(o.value) ? show(o.value) : 'Used'}</Text>
                </Press>
              );
            })}
          </View>
          <Callout style={{ marginTop: space.md }}>{data.choices[prefKey] ? `Life uses ${nameOf(used)} for this from now on, because you chose it.` : `Life used ${nameOf(latest.chosen)}: the device that measures this most closely.`}</Callout>
        </TintCard>
      ) : null}
      <Callout style={{ marginTop: space.md }}>Health data stays on your phone. Disconnect any source in Devices.</Callout>
    </Page>
  );
}

/* ───────────────────────── Pages that need more than readings so far ───────────────────────── */

/** A Body page not yet drawn from real readings: says so plainly, never sample numbers. */
export function BodyLaterV26({ screen }: { screen: Parameters<typeof Page>[0]['screen'] }) {
  const nav = useNavigation(), { data } = useSeed(), any = data.health.days.length > 0;
  return (
    <Page screen={screen} bar={{ kind: 'push', title: 'Body' }}>
      <Chip label={any ? 'Not on your readings yet' : 'Waiting for readings'} tone="q" />
      <Display s={any ? '{This page isn’t on your own readings yet.} It never shows made-up numbers instead.' : '{Nothing to show yet.} This fills in from your own readings.'} />
      <Body s={any ? 'Body, Readiness, Sleep, Load, Stress and Body signals already use them.' : 'Connect Apple Health, Health Connect, WHOOP or Oura and Life starts reading.'} style={{ marginTop: space.sm }} />
      <RowsCard style={{ marginTop: space.lg }}>
        {any ? <Row icon="heart" title="Back to Body" chevron onPress={() => nav.go('body')} /> : <Row icon="watch" title="Connect a source" sub="Your phone, a watch or a ring" chevron onPress={() => nav.go('devices')} />}
      </RowsCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  figure: { flexDirection: 'row', alignItems: 'flex-end', gap: 14, marginTop: space.tile },
  split: { flexDirection: 'row', gap: 3, height: 12 },
  legend: { flexDirection: 'row', gap: space.xs },
  keyRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  key: { width: 8, height: 8, borderRadius: 4 },
  day: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 96 },
  duel: { flexDirection: 'row', gap: space.xs, marginTop: space.md },
  duelBox: { flex: 1, borderRadius: radius.tile, paddingTop: space.sm, paddingHorizontal: 14, paddingBottom: 14 },
});
