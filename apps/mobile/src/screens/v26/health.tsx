/**
 * Body's readings, restyled to the V26 board (`body-b.js`): fitness age, sources, glucose, the basics, one night,
 * a past workout, weight, BMI, load, zones, the breathing library, a number's receipt, regularity, the load trend and
 * the week. Figures come from the seed and `state/body.ts`; choices save on this phone. Wellness, not diagnosis.
 */
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, G, Path, Polygon, Polyline, Rect, Text as SvgText } from 'react-native-svg';
import {
  BandLine, Icon, LifeSays, PhotoCard, PhotoGrid, Press, Reading, SectionHead, SwitchV26, Text, TileGrid, TintCard, V26Tile,
  feedback, fonts, photo, photos, radius, space, useAreaTint, useTokens,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import { seed } from '@/state/seed';
import {
  basics as basicsData, digest, dur, fitness, glucose, load, monday, pastRun, regularity as reg, sources as sourceList, sleepDisagreed, weightDays, weightWeekChange,
} from '@/state/body';
import { Between, BigPhoto, Body, Box, Btn, Callout, Chip, Cols, Display, Eyebrow, Legend, Micro, Page, QuietLink, Row, RowsCard, Statement, Timeline } from './kit';
import { Axis, FigRow, Head, Leader, Measure, RangeMark, Ticks, XL } from './bodykit';
import { readinessWords } from './body';

const h = seed.health;
const info = (label: string, onPress: () => void) => ({ kind: 'icon' as const, icon: 'info' as const, label, onPress });
const r1 = (n: number) => Math.round(n * 10) / 10;
const NUMBER_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'];
const clamp = (n: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, n));

/* ───────────────────────── Fitness age ───────────────────────── */

export function FitnessageV26() {
  const nav = useNavigation(), t = useTokens(), { accent } = useAreaTint('health'), { data } = useSeed();
  const age = data.profile.age, fit = fitness.age, from = Math.min(fit, age) - 4;
  const ages = Array.from({ length: 11 }, (_, k) => from + k);
  const v = fitness.vo2, rhr = fitness.rhr, z2 = fitness.zone2;
  return (
    <Page screen="fitnessage" bar={{ kind: 'push', title: 'Fitness age', action: info('How fitness age works', () => nav.go('math')) }}>
      <Eyebrow>{`You’re ${age}. Your fitness age:`}</Eyebrow>
      <FigRow text={String(fit)} chip={<Chip label="Estimate" tone="q" />} />
      <View style={styles.ages} accessible accessibilityRole="image" accessibilityLabel={`Fitness age ${fit}, your age ${age}`}>
        {ages.map(a => {
          const isFit = a === fit, isYou = a === age, mid = a > Math.min(fit, age) && a < Math.max(fit, age);
          return (
            <View key={a} style={styles.age}>
              {isFit ? <View style={[styles.ageBig, { backgroundColor: t.ember }]} />
                : isYou ? <View style={[styles.ageBig, { backgroundColor: t.ink, alignItems: 'center', justifyContent: 'center' }]}><View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: t.canvas }} /></View>
                : <View style={[styles.ageDot, { backgroundColor: mid ? t.ink2 : t.surface3 }]} />}
              <Text variant="micro" tone={isFit || isYou ? 'ink' : 'quiet'}>{String(a)}</Text>
            </View>
          );
        })}
      </View>
      <Legend items={[{ label: 'Fitness age', color: t.ember }, { label: 'Your age', color: t.ink }]} style={{ marginTop: space.sm }} />
      <Statement s={fit < age ? '{Two Zone 2 sessions a week} would likely take {another year off} by spring.' : '{Two Zone 2 sessions a week} would likely bring it {closer to your age} by spring.'} style={{ marginTop: space.lg }} />
      <TintCard area="health" style={{ marginTop: space.lg }}>
        <Head icon="heart" title="Last 6 months" right="Lower is fitter" />
        <View style={{ marginTop: space.sm }}><BandLine values={fitness.sixMonths} normal={[25, 25.3]} height={96} color={accent} bandColor={t.surface} label={`Fitness age over the last six months, falling to ${fit}`} /></View>
        <Axis labels={['Jun', 'Nov']} />
        <Callout style={{ marginTop: space.xs }}>The band is where you were from June to August.</Callout>
      </TintCard>
      <SectionHead title="What moves it" />
      <View style={{ gap: space.xs }}>
        <Reading icon="pulse" name="VO₂ max" value={String(v.value)} unit="ml/kg/min" tag={`Up ${v.up}`} tagKind="done" delta="From Apple Watch" series={v.week} normal={[41.5, 43]} />
        <Reading icon="heart" name="Resting heart rate" value={String(h.rhr)} unit="bpm" tag={`Down ${rhr.down}`} tagKind="done" delta="Lower usually means fitter" series={rhr.week} normal={[55.5, 57.5]} />
        <Reading icon="walk" name="Zone 2 minutes" value={String(z2.value)} unit="a week" tag="Keep it up" delta="Easy, steady effort" series={z2.week} normal={[140, 158]} onPress={() => nav.go('zones')} />
      </View>
      <Callout style={{ marginTop: space.md }}>An estimate from your VO₂ max, resting heart rate and activity. It goes down as your fitness improves.</Callout>
    </Page>
  );
}

/* ───────────────────────── Sources ───────────────────────── */

export function SourcesV26() {
  const nav = useNavigation(), t = useTokens(), { data, choose } = useSeed();
  const used = data.choices['sleep-source'] === 'Garmin' ? 'Garmin' : 'Oura';
  const duel = [{ name: 'Oura', mins: sleepDisagreed.oura }, { name: 'Garmin', mins: sleepDisagreed.garmin }];
  const pick = (name: string) => { if (name !== used) { choose('sleep-source', name); feedback.select(); } };
  return (
    <Page screen="sources" bar={{ kind: 'push', title: 'Your sources', action: { kind: 'icon', icon: 'add', label: 'Connect devices', onPress: () => nav.go('devices') } }}>
      <Eyebrow>One picture from all your devices</Eyebrow>
      <Display s={`{${NUMBER_WORDS[sourceList.length] ?? sourceList.length} measures}, each from the device that {reads it best}.`} />
      <Box pad={space.md} style={{ marginTop: space.xl }}>
        <Between><Micro>Measure and source</Micro><Micro>Last synced</Micro></Between>
        <View style={{ marginTop: space.sm, gap: space.tile }}>
          {sourceList.map(s => (
            <View key={s.name}>
              <Leader label={s.name} value={s.dev} strong style={{ minHeight: 30 }} />
              <Between><Text variant="callout" tone="ink2">{s.why}</Text><Chip label={s.when} tone="q" /></Between>
            </View>
          ))}
        </View>
      </Box>
      <TintCard area="work" style={{ marginTop: space.sm }}>
        <Head icon="moon" title="They disagreed last night" right={<Chip label="Sleep" />} />
        <View style={styles.duel}>
          {duel.map(d => {
            const on = d.name === used;
            return (
              <Press key={d.name} haptic="select" onPress={() => pick(d.name)} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={`${d.name}, ${dur(d.mins)} asleep${on ? ', used' : ''}`}
                style={[styles.duelBox, { backgroundColor: on ? t.ink : t.surface }]}>
                <Between><Text variant="callout" style={{ color: on ? t.canvas : t.ink2 }}>{d.name}</Text>{on ? <Icon name="check" size={14} color={t.canvas} /> : null}</Between>
                <Text variant="heading" style={{ marginTop: 6, color: on ? t.canvas : t.ink, fontVariant: ['tabular-nums'] }}>{dur(d.mins)}</Text>
              </Press>
            );
          })}
        </View>
        <LifeSays style={{ marginTop: space.md }}>{used === 'Oura' ? 'life used Oura: rings track sleep more closely than watches for most people.' : 'life uses Garmin for sleep now, because you chose it.'}</LifeSays>
        <Press haptic="select" onPress={() => pick(used === 'Oura' ? 'Garmin' : 'Oura')} accessibilityLabel="Change the sleep source" style={styles.link}>
          <Text variant="buttonCompact">Change it any time</Text><Icon name="chev" size={16} color={t.ink} />
        </Press>
      </TintCard>
    </Page>
  );
}

/* ───────────────────────── Glucose ───────────────────────── */

function GlucoseChart({ w }: { w: number }) {
  const t = useTokens(), { accent } = useAreaTint('home');
  const H = 132, x = (hr: number) => r1((hr - 6) / 16 * w), y = (v: number) => r1(H - 10 - (v - 4) / 4.6 * (H - 34));
  const P = glucose.points.map(([hr, v]) => [x(hr), y(v)]);
  let d = `M${P[0][0]} ${P[0][1]}`;
  for (let k = 1; k < P.length - 1; k++) d += ` Q${P[k][0]} ${P[k][1]} ${r1((P[k][0] + P[k + 1][0]) / 2)} ${r1((P[k][1] + P[k + 1][1]) / 2)}`;
  d += ` L${P[P.length - 1][0]} ${P[P.length - 1][1]}`;
  const [lo, hi] = glucose.usual;
  const mark = (meal: number, at: number, v: number, text: string, anchor: 'middle' | 'end' = 'middle') => (
    <>
      <Circle cx={x(meal)} cy={H - 4} r={3} fill={t.ink} />
      <SvgText x={Math.min(x(at), w - 2)} y={r1(y(v) - 8)} textAnchor={anchor} fontSize={11} fontFamily={fonts.sansSemibold} fill={t.ink}>{text}</SvgText>
    </>
  );
  return (
    <Svg width={w} height={H}>
      <Rect x={0} y={y(hi)} width={w} height={r1(y(lo) - y(hi))} rx={12} fill={t.surface} />
      <Path d={d} fill="none" stroke={accent} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
      {mark(glucose.lunch, 13.5, 7.6, 'Lunch')}
      {mark(glucose.dinner, 19.4, 6.1, 'Dinner, then a walk', x(19.4) > w - 60 ? 'end' : 'middle')}
    </Svg>
  );
}

export function CgmV26() {
  const nav = useNavigation();
  return (
    <Page screen="cgm" bar={{ kind: 'push', title: 'Glucose', action: info('About glucose', () => nav.go('math')) }}>
      <Eyebrow>Today · from your glucose sensor</Eyebrow>
      <Display s="{Steady} most of the day. One {bigger rise} after lunch." />
      <TintCard area="home" style={{ marginTop: space.xl }}>
        <Head icon="pulse" title="Glucose, lined up with your meals" />
        <Measure height={132} label="Glucose through today: steady, apart from a bigger rise after lunch" style={{ marginTop: space.sm }}>{w => <GlucoseChart w={w} />}</Measure>
        <Ticks marks={[[0, '6am'], [37.5, '12pm'], [75, '6pm']]} />
        <Callout style={{ marginTop: space.sm }}>The band is your usual range. Dots mark when you ate.</Callout>
      </TintCard>
      <PhotoGrid style={{ marginTop: space.sm }}>
        <PhotoCard source={photos.food} focal={{ x: 0.38, y: 0.42 }} height={176} size="sm" chips={['Rise']} title="Lunch: white rice bowl" sub="Bigger rise, back to normal in 2h" onPress={() => nav.go('mealresult')} />
        <PhotoCard source={photos.walk} focal={{ y: 0.25 }} height={176} size="sm" chips={['Steady']} title="Dinner, then a 10-min walk" sub="Barely moved" onPress={() => nav.go('mealtiming')} />
      </PhotoGrid>
      <LifeSays style={{ marginTop: space.md }}>The walk after dinner may be what kept you steady.</LifeSays>
      <Callout style={{ marginTop: space.md }}>Wellness, not medical advice. life never diagnoses or advises on medication. Talk to your GP about anything worrying.</Callout>
    </Page>
  );
}

/* ───────────────────────── Water, sitting and recovery ───────────────────────── */

export function BasicsV26() {
  const nav = useNavigation(), t = useTokens(), { accent } = useAreaTint('work'), { data, choose, flag, engine } = useSeed();
  const ml = Number(data.choices['water-ml'] ?? h.waterMl) || 0, target = engine.targets.waterMl;
  const litres = (ml / 1000).toFixed(1), of = (target / 1000).toFixed(1), left = Math.max(0, target - ml);
  const cells = Math.round(target / 100), on = Math.round(ml / 100);
  const add = (n: number) => { choose('water-ml', String(ml + n)); feedback.select(); };
  const walked = !!data.flags['basics-walk'];
  const sitting = dur(basicsData.sittingMins), better = basicsData.hrRecovery > basicsData.hrRecoveryAvg;
  return (
    <Page screen="basics" bar={{ kind: 'push', title: 'Body basics' }}>
      <Display s={`{${litres} L} of ${of} so far. Sitting for {${walked ? 'a while' : sitting}}. Recovery is {${better ? 'better than usual' : 'about usual'}}.`} />
      <TintCard area="work" style={{ marginTop: space.xl }}>
        <Head icon="water" title="Water" right={`of ${of} L today`} />
        <Between style={{ alignItems: 'flex-end', marginTop: space.sm }}>
          <XL text={`${litres} L`} size="num" />
          <Chip label={left ? `${(left / 1000).toFixed(1)} L to go` : 'Done for today'} tone={left ? undefined : 'done'} />
        </Between>
        <View style={styles.deci} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {Array.from({ length: cells }, (_, k) => <View key={k} style={{ flex: 1, borderRadius: 2, backgroundColor: k < on ? accent : t.surface }} />)}
        </View>
        <Callout style={{ marginTop: space.sm }}>Higher today: you trained and it’s warm.</Callout>
        <View style={{ flexDirection: 'row', gap: space.xs, marginTop: space.md }}>
          <Btn ghost sm label="+ Glass" onPress={() => add(250)} style={{ flex: 1 }} />
          <Btn ghost sm label="+ Bottle" onPress={() => add(500)} style={{ flex: 1 }} />
        </View>
      </TintCard>
      <PhotoCard source={photos.desk} focal={{ y: 0.3 }} height={150} size="md" chips={[walked ? { label: 'Done', icon: 'check' } : `Sitting · ${sitting}`]}
        title={walked ? 'Walked. Nice.' : 'A 3-minute walk now'} sub={walked ? 'life will check in again in an hour.' : `Free in your calendar until ${basicsData.freeUntil}.`}
        onPress={() => { flag('basics-walk', !walked); if (!walked) feedback.complete(); }} style={{ marginTop: space.sm }} />
      <Reading icon="heart" name="Heart-rate recovery" value={String(basicsData.hrRecovery)} unit="bpm" tag="Personal baseline"
        delta={`Drop in the first minute after your run. ${better ? 'Better than' : 'Close to'} your 3-month average (${basicsData.hrRecoveryAvg}).`}
        series={basicsData.hrRecoveryWeek} normal={[25.5, 28.5]} onPress={() => nav.go('workoutdetail')} style={{ marginTop: space.sm }} />
      <Callout style={{ marginTop: space.md }}>life never nudges you to move in the middle of a meeting.</Callout>
    </Page>
  );
}

/* ───────────────────────── One night ───────────────────────── */

const LANES = [['awake', 'Awake'], ['rem', 'REM'], ['light', 'Light'], ['deep', 'Deep']] as const;

export function SleepnightV26() {
  const nav = useNavigation(), t = useTokens(), { accent } = useAreaTint('work');
  const total = monday.stages.reduce((a, s) => a + s.minutes, 0);
  let at = 0;
  const placed = monday.stages.map(s => { const p = { ...s, left: at / total * 100, width: s.minutes / total * 100 }; at += s.minutes; return p; });
  return (
    <Page screen="sleepnight" bar={{ kind: 'push', title: 'Monday night', action: info('Where these numbers came from', () => nav.go('provenance')) }}>
      <BigPhoto source={photos.bedroom} focal={{ y: 0.58 }} height={230} chip={`${monday.bed} → ${monday.wake}`} chipRight="Personal baseline" figure={dur(monday.asleep)} sub={`Asleep · ${monday.ofNeed}% of need`} />
      <Statement s={`{${monday.ofNeed}% of what you needed}, with {more deep sleep} than usual.`} style={{ marginTop: space.md }} />
      <TintCard area="work" style={{ marginTop: space.lg }}>
        <Head icon="moon" title="The night in stages" right="Deep picked out" />
        <View style={{ marginTop: space.md, gap: space.xs }} accessible accessibilityRole="image" accessibilityLabel={`The night in four lanes, ${dur(monday.deep)} of deep sleep, lowest heart rate ${monday.lowest} at ${monday.lowestAt}`}>
          {LANES.map(([k, name]) => (
            <View key={k} style={styles.laneRow}>
              <Text variant="micro" tone="ink2" style={{ width: 44 }}>{name}</Text>
              <View style={[styles.lane, { backgroundColor: t.surface }]}>
                {placed.filter(s => s.stage === k).map((s, i) => <View key={i} style={{ position: 'absolute', top: 0, bottom: 0, left: `${s.left}%`, width: `${s.width}%`, minWidth: 5, borderRadius: 8, backgroundColor: accent, opacity: k === 'deep' ? 1 : 0.4 }} />)}
              </View>
            </View>
          ))}
          <View style={styles.laneRow}>
            <View style={{ width: 44 }} />
            <View style={{ flex: 1, paddingLeft: `${monday.lowestPct}%`, marginLeft: -4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.ink }} /><Text variant="micro" tone="ink2" numberOfLines={1}>{`${monday.lowest} bpm · ${monday.lowestAt}`}</Text></View>
            </View>
          </View>
        </View>
        <Axis labels={[monday.bed, monday.wake]} style={{ paddingLeft: 54 }} />
      </TintCard>
      <TileGrid style={{ marginTop: space.sm }}>
        <V26Tile label="Deep sleep" value={dur(monday.deep)} sub="Above usual" />
        <V26Tile label="Lowest heart rate" value={String(monday.lowest)} unit="bpm" sub={`At ${monday.lowestAt}`} />
      </TileGrid>
      <Box pad={space.md} onPress={() => nav.go('insights')} accessibilityLabel="You noted no caffeine after 2pm. It helped." style={{ marginTop: space.sm }}>
        <Between>
          <View style={{ flexShrink: 1 }}><Micro>You noted, in your journal</Micro><Text variant="title" style={{ marginTop: space.xxs }}>No caffeine after 2pm</Text></View>
          <Chip label="Helped" tone="done" />
        </Between>
      </Box>
    </Page>
  );
}

/* ───────────────────────── A past workout ───────────────────────── */

export function WorkoutdetailV26() {
  const { accent } = useAreaTint('goal'), { data } = useSeed();
  const z = pastRun.zones, easy = z.find(x => x.z === 2)?.pct ?? 0;
  const justSaved = !!data.flags['workout-saved'];
  return (
    <Page screen="workoutdetail" bar={{ kind: 'push', title: justSaved ? 'Run · today' : 'Run · Sunday' }}>
      <BigPhoto source={photos.run} focal={{ y: 0.73 }} height={250} chip={easy >= 50 ? 'Mostly Zone 2' : 'Mixed effort'} figure={`${pastRun.km} km`} sub={`${pastRun.time} · ${pastRun.pace} /km`} />
      <Statement s={`A {moderate load}, ${easy >= 50 ? 'more than half of it easy' : 'with plenty of hard minutes'}, and your heart {settled fast} afterwards.`} style={{ marginTop: space.md }} />
      <Timeline style={{ marginTop: space.xl }} items={[
        { when: 'YOUR HEART, DURING', text: '', state: 'done', children: (
          <TintCard area="goal" padding={space.md} style={{ marginTop: space.xs }}>
            <Cols items={z.map(x => ({ small: `Zone ${x.z}`, value: `${x.pct}%` }))} />
            <View style={styles.split} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
              {z.map((x, i) => <View key={x.z} style={{ flexGrow: x.pct, flexBasis: 0, borderRadius: 8, backgroundColor: accent, opacity: [1, 0.55, 0.28][i] ?? 0.28 }} />)}
            </View>
          </TintCard>
        ) },
        { when: 'THE MINUTE AFTER', text: `Your heart rate dropped {${pastRun.recovery} bpm} in one minute.`, state: 'done', children: <Chip label="Good recovery" tone="done" style={{ marginTop: space.xs, alignSelf: 'flex-start' }} /> },
        { when: 'WHAT IT ADDED', text: `{${pastRun.load}} load, a moderate day.`, state: 'done' },
      ]} />
      <Callout style={{ marginTop: space.lg }}>{`Heart rate from your ${(sourceList.find(s => s.name.startsWith('Workouts')) ?? sourceList[0]).dev}, compared with your own zones.`}</Callout>
    </Page>
  );
}

/* ───────────────────────── Weight ───────────────────────── */

function WeightChart({ w, offset }: { w: number; offset: number }) {
  const t = useTokens(), { accent } = useAreaTint('you');
  const H = 130, n = weightDays.length;
  const all = weightDays.flatMap(d => [d.trend + 0.5, d.trend - 0.5, d.day]).map(v => v + offset);
  const min = Math.min(...all) - 0.1, max = Math.max(...all) + 0.1;
  const x = (k: number) => r1(8 + k * (w - 16) / (n - 1)), y = (v: number) => r1(H - 8 - (v + offset - min) / (max - min) * (H - 16));
  const ks = weightDays.map((_, k) => k);
  const ribbon = ks.map(k => `${x(k)},${y(weightDays[k].trend + 0.5)}`).concat(ks.slice().reverse().map(k => `${x(k)},${y(weightDays[k].trend - 0.5)}`)).join(' ');
  return (
    <Svg width={w} height={H}>
      <Polygon points={ribbon} fill={t.surface} stroke={t.surface} strokeWidth={10} strokeLinejoin="round" />
      {ks.filter(k => weightDays[k].weighed).map(k => <Circle key={k} cx={x(k)} cy={y(weightDays[k].day)} r={2.6} fill={accent} opacity={0.45} />)}
      <Polyline points={ks.map(k => `${x(k)},${y(weightDays[k].trend)}`).join(' ')} fill="none" stroke={accent} strokeWidth={2.4} strokeLinejoin="round" strokeLinecap="round" />
      <Circle cx={x(n - 1)} cy={y(weightDays[n - 1].trend)} r={5} fill={accent} />
    </Svg>
  );
}

export function WeightV26() {
  const nav = useNavigation(), { data, flag } = useSeed();
  const kg = data.weightKg, offset = kg - weightDays[weightDays.length - 1].trend;
  const onToday = !!data.flags['weight-on-today'];
  return (
    <Page screen="weight" bar={{ kind: 'push', title: 'Weight', action: { kind: 'icon', icon: 'add', label: 'Log your weight', onPress: () => nav.go('weighin') } }}>
      <Eyebrow>7-day trend</Eyebrow>
      <FigRow text={`${kg.toFixed(1)} kg`} chip={<Chip label={`${Math.abs(weightWeekChange)} this week`} icon={weightWeekChange <= 0 ? 'arrowDown' : 'arrowUp'} tone="q" />} />
      <Statement s="A {trend}, not a daily verdict, so {water and salt} don’t mislead you." style={{ marginTop: space.sm }} />
      <TintCard area="you" style={{ marginTop: space.lg }}>
        <Head icon="trend" title="Last 4 weeks" />
        <Measure height={130} label="Daily weigh-ins and the 7-day trend over four weeks" style={{ marginTop: space.sm }}>{w => <WeightChart w={w} offset={offset} />}</Measure>
        <Axis labels={['4 weeks ago', 'Today']} lastInk />
        <Callout style={{ marginTop: space.sm }}>Dots are daily weigh-ins; the line is the trend. The band is your normal day-to-day swing.</Callout>
      </TintCard>
      <Box pad={space.md} style={{ marginTop: space.sm }}>
        <Between>
          <View style={{ flexShrink: 1 }}><Text variant="title">Show on Today</Text><Text variant="callout" tone="ink2">{onToday ? 'On, as a 7-day trend' : 'Off unless you ask'}</Text></View>
          <SwitchV26 value={onToday} onChange={v => { flag('weight-on-today', v); feedback.select(); }} accessibilityLabel="Show weight on Today" />
        </Between>
      </Box>
      <Callout style={{ marginTop: space.md }}>Optional and hidden by default. life never puts your weight on Today unless you turn this on.</Callout>
      <QuietLink label="BMI and waist, explained" ink onPress={() => nav.go('bmi')} style={{ marginTop: space.sm }} />
    </Page>
  );
}

/* ───────────────────────── BMI and waist ───────────────────────── */

export function BmiV26() {
  const { data } = useSeed();
  const ratio = data.waistCm / data.heightCm, bmi = data.weightKg / (data.heightCm / 100) ** 2;
  const rPos = clamp((ratio - 0.35) / 0.35 * 100), bPos = clamp((bmi - 16) / 19 * 100);
  const healthy = ratio < 0.5;
  const bmiWords = bmi < 18.5 ? 'Under 18.5, the lower end. Worth a chat with your GP if you’ve lost weight without trying.'
    : bmi < 25 ? 'Inside the usual range. BMI still can’t tell muscle from fat, so life leans on your waist.'
    : healthy ? `Just over 25, but your waist and resting heart rate look healthy. Muscle weighs more than fat, and BMI can’t tell them apart.`
    : 'Over 25, and your waist is over half your height. Small, steady changes help most; your GP can help you plan.';
  return (
    <Page screen="bmi" bar={{ kind: 'push', title: 'BMI and waist' }}>
      <Eyebrow>Waist-to-height · the better guide</Eyebrow>
      <FigRow text={ratio.toFixed(2)} chip={<Chip label={healthy ? 'Healthy' : ratio < 0.6 ? 'Worth a look' : 'Talk to your GP'} tone={healthy ? 'done' : 'q'} />} />
      <Statement s={healthy ? 'Your waist is {under half your height}, a {better guide} than BMI.' : 'Your waist is {over half your height}. Waist-to-height is a {better guide} than BMI.'} style={{ marginTop: space.sm }} />
      <TintCard area="you" style={{ marginTop: space.lg }}>
        <Head icon="person" title="Waist-to-height" right={`${data.waistCm} cm ÷ ${data.heightCm} cm`} />
        <RangeMark from={0} to={42.9} at={rPos} onTint />
        <Ticks marks={[[0, '0.35'], [42.9, '0.5'], [71.4, '0.6'], [100, '0.7']]} />
        <Callout style={{ marginTop: space.sm }}>Under 0.5 is the healthy range.</Callout>
      </TintCard>
      <Box style={{ marginTop: space.sm }}>
        <Between><Text variant="title">BMI</Text><Chip label="Rough guide" tone="q" /></Between>
        <View style={{ marginTop: space.xs }}><XL text={bmi.toFixed(1)} size="num" /></View>
        <RangeMark from={13.2} to={47.4} at={bPos} />
        <Ticks marks={[[0, '16'], [13.2, '18.5'], [47.4, '25'], [73.7, '30'], [100, '35']]} />
        <Callout style={{ marginTop: space.sm }}>{bmiWords}</Callout>
      </Box>
      <Box pad={space.md} style={{ marginTop: space.sm }}>
        <Text variant="title">Thresholds differ by background</Text>
        <Callout style={{ marginTop: space.xxs }}>NHS guidance sets lower BMI thresholds for some heritages. life uses them once you’ve told it yours.</Callout>
      </Box>
      <Callout style={{ marginTop: space.md }}>Wellness information, not a diagnosis. Talk to your GP about weight or health concerns.</Callout>
    </Page>
  );
}

/* ───────────────────────── Today's target load ───────────────────────── */

export function StrainV26() {
  const nav = useNavigation(), t = useTokens(), { accent } = useAreaTint('goal');
  const [lo, hi] = load.target, now = load.today, done = Math.round(now * 2);
  return (
    <Page screen="strain" bar={{ kind: 'push', title: 'Today’s load', action: info('How load works', () => nav.go('math')) }}>
      <Eyebrow>Today so far</Eyebrow>
      <FigRow text={`${now}/21`} chip={<Chip label={`Aim for ${lo}–${hi}`} tone="live" />} />
      <Statement s={`You’re {${readinessWords().word}}. Aim for {${lo}–${hi}} today.`} style={{ marginTop: space.sm }} />
      <TintCard area="goal" style={{ marginTop: space.lg }}>
        <Head icon="fitness" title="Where you are" right="band = today’s aim" />
        <View style={styles.gauge} accessible accessibilityRole="image" accessibilityLabel={`Load ${now} of 21, with today’s band of ${lo} to ${hi}`}>
          {Array.from({ length: 42 }, (_, k) => {
            const isOn = k < done, aim = !isOn && k >= lo * 2 && k < hi * 2;
            return <View key={k} style={{ flex: 1, height: isOn || aim ? 64 : 34, borderRadius: 2, backgroundColor: isOn ? t.ink : aim ? accent : t.surface }} />;
          })}
        </View>
        <Ticks marks={[[0, '0'], [33.3, '7'], [66.7, '14'], [100, '21']]} />
        <Callout style={{ marginTop: space.sm }}>Stay in the band and you build fitness without digging into recovery.</Callout>
      </TintCard>
      {now < lo ? (
        <PhotoCard source={photos.run} focal={{ y: 0.55 }} height={150} size="md" chips={['Lands you in the band']} title="A 35-minute run in zone 2" sub={`From ${now} into your ${lo}–${hi}`} onPress={() => nav.go('workout')} style={{ marginTop: space.sm }} />
      ) : null}
      <RowsCard style={{ marginTop: space.sm }}>
        {load.made.map((m, i) => <Row key={m.what} icon={i ? 'fitness' : 'walk'} title={m.what} sub={m.when} end={String(m.n)} onPress={() => nav.go('workoutdetail')} />)}
      </RowsCard>
    </Page>
  );
}

/* ───────────────────────── Heart-rate zones ───────────────────────── */

export function ZonesV26() {
  const nav = useNavigation(), { accent } = useAreaTint('goal');
  const zones = h.zones, total = zones.reduce((a, z) => a + z.minutes, 0), top = Math.max(...zones.map(z => z.minutes)) || 1;
  const z2 = zones.find(z => z.name === 'Zone 2')?.minutes ?? 0;
  return (
    <Page screen="zones" bar={{ kind: 'push', title: 'Heart-rate zones', action: info('How zones work', () => nav.go('math')) }}>
      <Eyebrow>{`This week · ${total} minutes in your zones`}</Eyebrow>
      <Display s={`{${z2} minutes} in Zone 2, the quiet engine of fitness.`} />
      <TintCard area="goal" style={{ marginTop: space.xl }}>
        <Head icon="heart" title="Time in each zone" right="this week" />
        <View style={{ marginTop: space.xs }}>
          {zones.map(z => (
            <View key={z.name} style={styles.zoneRow} accessible accessibilityLabel={`${z.name}, ${z.range} beats a minute, ${z.minutes} minutes`}>
              <View style={{ width: 88 }}><Text variant="bodyMedium">{z.name}</Text><Text variant="callout" tone="ink2" style={{ fontVariant: ['tabular-nums'] }}>{`${z.range} bpm`}</Text></View>
              <View style={{ flex: 1 }}><View style={{ height: 24, minWidth: 24, width: `${z.minutes / top * 100}%`, borderRadius: 12, backgroundColor: accent, opacity: z.name === 'Zone 2' ? 1 : 0.35 }} /></View>
              <Text variant="bodyMedium" style={{ width: 56, textAlign: 'right', fontVariant: ['tabular-nums'] }}>{String(z.minutes)}<Text variant="callout" tone="ink2">{' min'}</Text></Text>
            </View>
          ))}
        </View>
      </TintCard>
      <TileGrid style={{ marginTop: space.sm }}>
        <V26Tile label="Resting rate" value={String(h.rhr)} unit="bpm" sub="Measured at rest" />
        <V26Tile label="Highest recorded" value={String(load.maxHr)} unit="bpm" sub="Your own maximum" />
      </TileGrid>
      <Callout style={{ marginTop: space.md }}>{`Zones use your resting rate (${h.rhr}) and your highest recorded (${load.maxHr}): set from you, not a formula for an average person.`}</Callout>
    </Page>
  );
}

/* ───────────────────────── Breathing library ───────────────────────── */

type DotKind = 'in' | 'hold' | 'out' | 'gap';
function PatDot({ kind, size = 8, onPhoto }: { kind: DotKind; size?: number; onPhoto?: boolean }) {
  const t = useTokens();
  if (kind === 'gap') return <View style={{ width: size, height: size }} />;
  if (kind === 'hold') return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: t.ink2, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: size - 4, height: size - 4, borderRadius: (size - 4) / 2, backgroundColor: t.surface }} /></View>;
  const bg = onPhoto ? (kind === 'in' ? photo.onPhoto : photo.onPhoto2) : kind === 'in' ? t.ink : t.surface3;
  return <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg }} />;
}
const BOX: DotKind[] = ['in', 'in', 'in', 'in', 'hold', 'hold', 'gap', 'gap', 'gap', 'hold', 'hold', 'gap', 'gap', 'gap', 'hold', 'hold', 'gap', 'gap', 'gap', 'hold', 'hold', 'out', 'out', 'out', 'out'];
function Pattern({ name }: { name: string }) {
  const t = useTokens();
  const row = (kids: ReactNode, gap = 4) => <View style={{ flexDirection: 'row', alignItems: 'center', gap }}>{kids}</View>;
  let inner: ReactNode;
  if (name === 'box') inner = <View style={{ width: 8 * 5 + 4 * 4, flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>{BOX.map((k, i) => <PatDot key={i} kind={k} />)}</View>;
  else if (name === 'resonance') inner = row(Array.from({ length: 12 }, (_, k) => <PatDot key={k} kind={k % 2 ? 'out' : 'in'} size={7} />), 3);
  else if (name === '478') inner = <View style={{ gap: 3 }}>{([['in', 4], ['hold', 7], ['out', 8]] as const).map(([k, n]) => <View key={k}>{row(Array.from({ length: n }, (_, i) => <PatDot key={i} kind={k} size={7} />), 3)}</View>)}</View>;
  else inner = row([16, 14, 12, 10, 8, 7, 6, 5].map(d => <View key={d} style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: t.ink }} />));
  return <View style={{ height: 56, justifyContent: 'center', marginVertical: 6 }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">{inner}</View>;
}

const LIBRARY = [
  { what: 'Steady focus', pat: 'box', name: 'Box breathing', how: '4 in · 4 hold · 4 out · 4 hold' },
  { what: 'Raises HRV over time', pat: 'resonance', name: 'Resonance', how: '6 breaths a minute · 5 min' },
  { what: 'Before sleep', pat: '478', name: '4-7-8', how: 'In 4 · hold 7 · out 8' },
  { what: 'After a workout', pat: 'down', name: 'Heart-rate down', how: 'Follows your live heart rate' },
];

export function BreathlibV26() {
  const nav = useNavigation(), t = useTokens(), { choose } = useSeed();
  const start = (name: string, seconds?: number) => { choose('breath-protocol', name); if (seconds) choose('breath-seconds', String(seconds)); else choose('breath-seconds', ''); nav.go('breathe'); };
  return (
    <Page screen="breathlib" bar={{ kind: 'push', title: 'Breathe' }}>
      <Eyebrow>Five short patterns, each for a different moment</Eyebrow>
      <PhotoCard source={photos.breathe} focal={{ y: 0.41 }} height={230} chips={['Fastest way to calm down · 1 min']}
        topRight={<View style={[styles.play, { backgroundColor: photo.onPhoto }]}><Icon name="play" size={18} color={photo.ink} /></View>}
        title="Physiological sigh" sub="Two breaths in, one long out" onPress={() => start('Physiological sigh', 60)} accessibilityLabel="Physiological sigh, two breaths in, one long out. Start." style={{ marginTop: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: space.xs }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <PatDot kind="in" size={14} onPhoto /><PatDot kind="in" onPhoto /><View style={{ width: 48, height: 8, borderRadius: 4, backgroundColor: photo.onPhoto2 }} />
        </View>
      </PhotoCard>
      <PhotoGrid style={{ marginTop: space.sm }}>
        {LIBRARY.map(b => {
          const inner = <><Micro>{b.what}</Micro><Pattern name={b.pat} /><View style={{ flex: 1 }} /><Text variant="title">{b.name}</Text><Text variant="callout" tone="ink2" style={{ marginTop: 2 }}>{b.how}</Text></>;
          return b.pat === 'down'
            ? <TintCard key={b.name} area="health" padding={space.md} onPress={() => start(b.name)} accessibilityLabel={`${b.name}, ${b.how}`} style={{ minHeight: 172 }}>{inner}</TintCard>
            : <Box key={b.name} pad={space.md} onPress={() => start(b.name)} accessibilityLabel={`${b.name}, ${b.how}`} style={{ minHeight: 172 }}>{inner}</Box>;
        })}
      </PhotoGrid>
      <Legend items={[{ label: 'In', color: t.ink }, { label: 'Hold', color: t.ink2 }, { label: 'Out', color: t.surface3 }]} style={{ marginTop: space.md }} />
      <Callout style={{ marginTop: space.sm }}>With a watch on, heart-rate down paces your breathing to bring your heart rate down.</Callout>
    </Page>
  );
}

/* ───────────────────────── Where this number came from ───────────────────────── */

export function ProvenanceV26() {
  const nav = useNavigation(), t = useTokens();
  const src = sourceList.find(s => s.name === 'HRV') ?? sourceList[0];
  const sure = <View style={{ flexDirection: 'row', gap: space.xxs }}>{[0, 1, 2].map(i => <View key={i} style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.ink }} />)}</View>;
  return (
    <Page screen="provenance" bar={{ kind: 'sheet', title: 'About this number' }}
      footer={<Btn label="How HRV is worked out" icon="arrow" trail onPress={() => nav.go('math')} />}>
      <Eyebrow>HRV last night</Eyebrow>
      <FigRow text={`${h.hrv} ms`} chip={<Chip label="Personal baseline" />} />
      <View style={{ marginTop: space.sm }}>
        <Leader label="Source" value={src.dev} />
        <Leader label="Last synced" value={<Chip label={`${src.when} today`} tone="done" />} />
        <Leader label="Readings used" value="312 beats over 5 hours" />
        <Leader label="Compared with" value="Your last 60 nights" />
        <Leader label="Confidence" value={<View style={{ flexDirection: 'row', alignItems: 'center', gap: space.xs }}><Text variant="buttonCompact">High</Text>{sure}</View>} />
      </View>
      <Body variant="callout" s="Every number in Body has a receipt like this. life compares you only with your own past readings." style={{ marginTop: space.md }} />
    </Page>
  );
}

/* ───────────────────────── Sleep regularity ───────────────────────── */

function RegularityChart({ w }: { w: number }) {
  const t = useTokens(), { accent } = useAreaTint('work');
  const H = 172, L = 44, y = (hr: number) => r1(8 + hr / 12 * 138), col = (w - L) / 7, bw = 22;
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return (
    <Svg width={w} height={H}>
      <Rect x={L} y={y(reg.weekday[0])} width={w - L} height={r1(y(reg.weekday[1]) - y(reg.weekday[0]))} rx={12} fill={t.surface} />
      {([[0, '21:00'], [6, '03:00'], [12, '09:00']] as const).map(([hr, label]) => <SvgText key={label} x={0} y={y(hr) + 4} fontSize={11} fontFamily={fonts.sansSemibold} fill={t.ink2}>{label}</SvgText>)}
      {reg.nights.map(([bed, wake], k) => {
        const cx = r1(L + col * k + col / 2), weekend = k > 4;
        return (
          <G key={k}>
            <Rect x={r1(cx - bw / 2)} y={y(bed)} width={bw} height={r1(y(wake) - y(bed))} rx={11} fill={accent} opacity={weekend ? 1 : 0.35} />
            <SvgText x={cx} y={H - 4} textAnchor="middle" fontSize={11} fontFamily={fonts.sansSemibold} fill={weekend ? t.ink : t.ink2}>{days[k]}</SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

export function RegularityV26() {
  return (
    <Page screen="regularity" bar={{ kind: 'push', title: 'Regularity' }}>
      <Eyebrow>Sleep regularity</Eyebrow>
      <FigRow text={`${reg.score}/100`} chip={<Chip label={`Weekend shift ${dur(reg.shift)}`} tone="live" />} />
      <Statement s="Keeping {Saturday’s wake} within an hour of weekdays would lift {Monday’s readiness}." style={{ marginTop: space.sm }} />
      <TintCard area="work" style={{ marginTop: space.lg }}>
        <Head icon="moon" title="Bed to wake, this week" />
        <Measure height={172} label="Bedtime to wake time for each night this week, against your weekday rhythm" style={{ marginTop: space.sm }}>{w => <RegularityChart w={w} />}</Measure>
        <Callout style={{ marginTop: space.sm }}>The band is your weekday rhythm. A weekend lie-in shows up as a shift, like a little jet lag.</Callout>
      </TintCard>
      <LifeSays style={{ marginTop: space.md }}>Going to bed and waking at similar times matters almost as much as hours.</LifeSays>
    </Page>
  );
}

/* ───────────────────────── Training load trend ───────────────────────── */

function LoadTrendChart({ w }: { w: number }) {
  const t = useTokens(), { accent } = useAreaTint('goal');
  const v = load.weekly, H = 140, base = H - 22, top = Math.max(...v, 84), sc = (base - 6) / top, col = w / v.length, bw = 26;
  const usual = v.slice(-5, -1).reduce((a, b) => a + b, 0) / 4, lo = usual * 0.8, hi = usual * 1.3;
  return (
    <Svg width={w} height={H}>
      <Rect x={0} y={r1(base - hi * sc)} width={w} height={r1((hi - lo) * sc)} rx={12} fill={t.surface} />
      {v.map((n, k) => {
        const cx = col * k + col / 2, bh = r1(n * sc), last = k === v.length - 1, label = load.weeklyLabels[k];
        return (
          <G key={k}>
            <Rect x={r1(cx - bw / 2)} y={r1(base - bh)} width={bw} height={bh} rx={13} fill={accent} opacity={last ? 1 : 0.35} />
            {label ? <SvgText x={last ? w : r1(cx)} y={H - 4} textAnchor={last ? 'end' : 'middle'} fontSize={11} fontFamily={fonts.sansSemibold} fill={last ? t.ink : t.ink2}>{label}</SvgText> : null}
          </G>
        );
      })}
    </Svg>
  );
}

export function LoadtrendV26() {
  const ratio = load.ratio, pct = Math.round((ratio - 1) * 100), sweet = ratio >= 0.8 && ratio <= 1.3;
  return (
    <Page screen="loadtrend" bar={{ kind: 'push', title: 'Load trend' }}>
      <Eyebrow>This week vs your usual</Eyebrow>
      <FigRow text={ratio.toFixed(2)} chip={<Chip label={sweet ? 'Sweet spot' : ratio > 1.3 ? 'Above the sweet spot' : 'Below the sweet spot'} tone={sweet ? 'done' : 'live'} />} />
      <Statement s={sweet ? `This week is {${Math.abs(pct)}% ${pct >= 0 ? 'above' : 'below'}} your last four. {Fitness builds safely} here.` : ratio > 1.3 ? `This week is {${pct}% above} your last four. {Ease off} for a few days.` : `This week is {${Math.abs(pct)}% below} your last four. {A little more} would keep fitness building.`} style={{ marginTop: space.sm }} />
      <TintCard area="goal" style={{ marginTop: space.lg }}>
        <Head icon="fitness" title="Weekly load, 8 weeks" />
        <Measure height={140} label="Weekly training load for eight weeks, with this week inside the sweet spot" style={{ marginTop: space.sm }}>{w => <LoadTrendChart w={w} />}</Measure>
        <Callout style={{ marginTop: space.sm }}>The band is this week’s sweet spot: 0.8 to 1.3 times your last four weeks.</Callout>
      </TintCard>
      <TileGrid style={{ marginTop: space.sm }}>
        <V26Tile label="Sweet spot" value="0.8–1.3" sub="Fitness builds safely" />
        <V26Tile label="Take care above" value="1.5" sub="Injury risk climbs" />
      </TileGrid>
    </Page>
  );
}

/* ───────────────────────── Your body this week ───────────────────────── */

export function HealthdigestV26() {
  const nav = useNavigation(), t = useTokens();
  const p = digest.pattern;
  return (
    <Page screen="healthdigest" bar={{ kind: 'push', title: 'This week' }} footer={<Btn label="Try it for two weeks" onPress={() => nav.go('experiment')} />}>
      <PhotoCard source={photos.sunday} focal={{ y: 0.75 }} height={160} chips={['Sunday']} title="Your body this week" sub="Three wins, one thing to watch, one pattern to try." />
      <TintCard area="health" style={{ marginTop: space.sm }}>
        <Head icon="check" title="Three wins" />
        <Cols style={{ marginTop: space.md }} items={[
          { small: 'Slept 7h+', value: `${digest.nights7h} nights`, sub: 'Best week this month' },
          { small: 'Zone 2', value: `${digest.zone2} min`, sub: 'Above your goal' },
          { small: 'Resting rate', value: `Down ${digest.rhrDown}`, sub: 'Fitness is building' },
        ]} />
      </TintCard>
      <Box pad={space.md} style={{ marginTop: space.sm }}>
        <Micro sig>Watch</Micro>
        <Text variant="body" style={{ marginTop: space.xs }}>{digest.watch}</Text>
      </Box>
      <Box style={{ marginTop: space.sm }}>
        <Micro>A pattern in your data</Micro>
        <Statement s={`On days you walk {${p.steps.toLocaleString('en-GB')}+ steps}, you sleep {${p.longer} minutes longer}.`} style={{ marginTop: space.xs }} />
        <View style={{ marginTop: space.sm }} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          <Text variant="callout" tone="ink2">Other days</Text>
          <View style={[styles.cmp, { width: '66%', backgroundColor: t.ink, opacity: 0.2 }]} />
          <Text variant="callout" tone="ink2" style={{ marginTop: space.sm }}>{`Days with ${p.steps.toLocaleString('en-GB')}+ steps`}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
            <View style={[styles.cmp, { width: '66%', backgroundColor: t.ink, opacity: 0.2 }]} />
            <View style={[styles.cmp, { width: 20, backgroundColor: t.ink }]} />
            <Text variant="buttonCompact" numberOfLines={1} style={{ marginLeft: 6, marginTop: 6 }}>{`+${p.longer} min`}</Text>
          </View>
        </View>
      </Box>
      <Callout style={{ marginTop: space.md }}>Patterns from your own data, not proof. Two weeks is enough to see if it holds for you.</Callout>
    </Page>
  );
}

const styles = StyleSheet.create({
  ages: { flexDirection: 'row', marginTop: space.lg },
  age: { flex: 1, height: 48, alignItems: 'center', justifyContent: 'flex-end', gap: space.xs },
  ageDot: { width: 12, height: 12, marginVertical: 5, borderRadius: 6 },
  ageBig: { width: 22, height: 22, borderRadius: 11 },
  duel: { flexDirection: 'row', gap: space.xs, marginTop: space.md },
  duelBox: { flex: 1, borderRadius: radius.tile, paddingTop: space.sm, paddingHorizontal: 14, paddingBottom: 14 },
  link: { flexDirection: 'row', alignItems: 'center', gap: 2, alignSelf: 'flex-start', minHeight: 32, marginTop: space.sm },
  deci: { flexDirection: 'row', gap: 3, height: 28, marginTop: 14 },
  laneRow: { flexDirection: 'row', alignItems: 'center', gap: space.tile },
  lane: { flex: 1, height: 16, borderRadius: 8, overflow: 'hidden' },
  split: { flexDirection: 'row', gap: 4, height: 16, marginTop: 14 },
  gauge: { flexDirection: 'row', alignItems: 'flex-end', gap: 3, height: 64, marginTop: space.md },
  zoneRow: { flexDirection: 'row', alignItems: 'center', gap: space.tile, paddingVertical: space.xs },
  play: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  cmp: { height: 18, borderRadius: 9, marginTop: 6 },
});
