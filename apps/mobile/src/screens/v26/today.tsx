/**
 * Tab 1 · Today, restyled to the V26 board (`core.js` today and search, `today-plan-you.js` the rest).
 * The feeling check rises as a drawer on the first open of the day; today's moves follow it as a deck.
 */
import { useEffect, useRef, useState } from 'react';
import { Linking, Modal, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Appear, ArrivingCard, DecideRow, FEEL_MOODS, FeelingDrawer, Icon, LifeOrb, MoveDeck, PhotoCard, PhotoFill, Press, ReorderRow, RoundButton, Ruler,
  SectionHead, StatusPill, Text, TileGrid, TintCard, V26Tile, Waveform, cardShadow, componentSize, feedback, fonts, photo, photoScrims, photos,
  radius, space, type, useCalmMotion, useTokens, type FeelMoodId, type MoveCard, type TopBarAction,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import type { ScreenKey } from '@/navigation/screens';
import { useSeed } from '@/state/SeedProvider';
import { isOnLocalDay, useLocalDay } from '@/state/day';
import { money, seed, seedTaxClaim } from '@/state/seed';
import { useFuelDay } from '@/state/fuel';
import { TODAY_MOVES, councilTax, dayShape, heavyCount, heavyWeek, hm, lighterDay, moveOrder, payday, readDecisions, todayBrief } from '@/state/today';
import {
  Body, Btn, Callout, Chip, Display, Eyebrow, Figure, Micro, Page, PhotoBackdrop, QuietLink, Row, RowsCard, Sp, Statement, Thumb, Between,
} from './kit';
import { BirthdayMoveV26, birthdayBrief, useBirthdayNudge } from './people';
import { levelPlan } from '@/state/you';
import { NudgeV26, TodayLoops } from './loops';

// Plan ahead and Get unstuck live with the other core-loop screens; the Today chapter still exports them.
export { EveningV26, NudgeV26 } from './loops';

const isMood = (id: string | undefined): id is FeelMoodId => !!id && id in FEEL_MOODS;
const shortDate = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '');

/** The mood logged today, if any, and whether the check-in was put off today. */
function useArriving(day: string) {
  const { data } = useSeed();
  const last = [...data.pulseLog].reverse().find(e => isOnLocalDay(e.at, day));
  return { mood: isMood(last?.moodId) ? last.moodId : null, at: last?.at, skipped: data.choices['pulse-skipped-day'] === day };
}

/** Log today's mood (one entry a day) and clear any skip. */
function useLogMood() {
  const { update } = useSeed();
  const { day } = useLocalDay();
  return (mood: FeelMoodId) => {
    const m = FEEL_MOODS[mood];
    update(c => ({ ...c, pulseLog: [...c.pulseLog.filter(e => !isOnLocalDay(e.at, day)), { at: new Date().toISOString(), moodId: mood, x: m.at[0], y: m.at[1] }], choices: { ...c.choices, 'pulse-skipped-day': '' } }));
    feedback.file();
  };
}

/** The root bar every Today page shares: the orb, Today, the date, search and the bell. */
/* "From Life" lives in the orb at the right of the bar now, so Today keeps only search. */
function todayActions(onSearch: () => void): TopBarAction[] {
  return [{ kind: 'icon', icon: 'search', label: 'Search everything', onPress: onSearch }];
}

/* ───────────────────────── Today ───────────────────────── */

type TodayQuestion = { intro: string; focus: string; choices: string[] };
const QUESTIONS: TodayQuestion[] = [
  { intro: 'Are you registered for ', focus: 'Self Assessment?', choices: ['Yes', 'Not yet', 'Not sure'] },
  { intro: 'Do you pay into a ', focus: 'pension?', choices: ['Yes', 'No', 'Not sure'] },
  { intro: 'When did you last see a ', focus: 'dentist?', choices: ['This year', '1–2 years', 'Longer'] },
];

const METRICS = ['Readiness', 'Sleep', 'Fuel', 'Load', 'Stress', 'HRV', 'Resting heart rate', 'Steps', 'Body signals'] as const;
type MetricName = (typeof METRICS)[number];

/** Which numbers Today shows, in the order you chose (up to five). Shared with Customise. */
export function useTodayMetrics() {
  const { data, flag, choose } = useSeed();
  const selected = (name: MetricName) => METRICS.indexOf(name) < 5 ? !data.flags[`hide-${name}`] : !!data.flags[`show-${name}`];
  const order = [...new Set([...(data.choices['metric-order'] ?? '').split('|'), ...METRICS])].filter((n): n is MetricName => (METRICS as readonly string[]).includes(n));
  const visible = order.filter(selected).slice(0, 5);
  const toggle = (name: MetricName, on: boolean) => { if (on && visible.length >= 5) return; flag(METRICS.indexOf(name) < 5 ? `hide-${name}` : `show-${name}`, METRICS.indexOf(name) < 5 ? !on : on); };
  const move = (from: number, to: number) => { const next = visible.slice(); const [item] = next.splice(from, 1); next.splice(to, 0, item); choose('metric-order', [...next, ...order.filter(n => !next.includes(n))].join('|')); };
  return { visible, hidden: METRICS.filter(n => !visible.includes(n)), toggle, move };
}

/** One number from the seed, as Today's tile shows it. */
function metricValue(name: MetricName, hideNumbers: boolean): { value: string; scale?: string; sub?: string } {
  const h = seed.health, f = seed.fuel;
  switch (name) {
    case 'Readiness': return { value: String(h.readiness), scale: '/100', sub: h.readiness >= 67 ? 'Well recovered' : h.readiness >= 50 ? 'Steady' : 'Take it easier' };
    case 'Sleep': return { value: hm(h.sleepMinutes), scale: `/${h.sleepNeed / 60}h`, sub: `${hm(h.sleepDebt)} short this week` };
    case 'Fuel': return { value: hideNumbers ? 'Balanced' : f.eaten.toLocaleString('en-GB'), scale: `/${f.kcal.toLocaleString('en-GB')} kcal` };
    case 'Load': return { value: String(h.load), scale: '/21', sub: h.load < h.loadTarget[0] ? 'Below today’s range' : h.load > h.loadTarget[1] ? 'Above today’s range' : 'In today’s range' };
    case 'Stress': return { value: String(h.stress), scale: '/3', sub: h.stress < 1.5 ? 'Low' : h.stress < 2.2 ? 'Medium' : 'High' };
    case 'HRV': return { value: String(h.hrv), sub: 'ms · above your normal' };
    case 'Resting heart rate': return { value: String(h.rhr), sub: 'bpm · usual for you' };
    case 'Steps': return { value: h.steps.toLocaleString('en-GB'), sub: 'so far today' };
    case 'Body signals': return { value: 'In range', sub: 'Nothing unusual' };
  }
}
const METRIC_DOT: Partial<Record<MetricName, 'health' | 'work' | 'home' | 'goal' | 'you'>> = { Readiness: 'health', Sleep: 'work', Fuel: 'home', Load: 'goal', Stress: 'you' };
const METRIC_TO: Record<MetricName, ScreenKey> = { Readiness: 'readiness', Sleep: 'sleep', Fuel: 'fuel', Load: 'strain', Stress: 'stress', HRV: 'hrv', 'Resting heart rate': 'trends', Steps: 'body', 'Body signals': 'signals' };

export function TodayV26() {
  const t = useTokens(), nav = useNavigation(), { data, update, choose, engine } = useSeed();
  const { now, day } = useLocalDay();
  const params = useLocalSearchParams<{ state?: string; nudge?: string }>();
  const arriving = useArriving(day);
  const logMood = useLogMood();
  const metrics = useTodayMetrics();
  // A birthday within four days leads the page as today's move (board `birthdaynudge`); ?state=birthday previews it.
  const birthday = useBirthdayNudge(day, params.state === 'birthday');
  // Preview states for review: ?state=later | checked:<mood> | day. Otherwise the real day decides.
  const preview = params.state && /^(later|open|checked:\w+|day|birthday)$/.test(params.state) ? params.state : null;
  const mood: FeelMoodId | null = preview?.startsWith('checked:') && isMood(preview.slice(8)) ? preview.slice(8) as FeelMoodId : preview === 'later' || preview === 'open' ? null : arriving.mood;
  const [drawer, setDrawer] = useState(preview ? preview === 'open' : !arriving.mood && !arriving.skipped);
  const [searching, setSearching] = useState(false);
  const order = moveOrder(mood);
  const dec = preview === 'day' ? 'yny' : readDecisions(data.choices['today-moves'], day);
  const decide = (d: string) => choose('today-moves', `${day}|${d}`);
  const left = order.slice(dec.length).map(i => TODAY_MOVES[i]);
  const chosen = order.filter((_, k) => dec[k] === 'y').map(i => TODAY_MOVES[i]);
  const cards: MoveCard[] = left.map(m => ({ key: m.key, title: m.title, chip: m.chip, sub: `${m.value} · for your first home`, photo: photos[m.photo], focal: { y: m.photo === 'payslip' ? 0.78 : 0.55 } }));
  const openMove = (key: string) => { const m = TODAY_MOVES.find(x => x.key === key)!; if (m.mission) update(c => ({ ...c, selectedMission: m.mission! })); nav.go(m.to); };

  const qi = Number(data.choices['today-question-index'] ?? 0), q = QUESTIONS[qi], answered = data.choices['today-answer-day'] === day;
  const answer = (choice: string) => {
    if (!q || answered) return;
    update(c => {
      const id = `question-${qi}`, area = qi === 0 ? 'work' as const : qi === 1 ? 'money' as const : 'health' as const;
      const isNew = !c.records.some(r => r.id === id && r.status === 'confirmed');
      return { ...c, records: [...c.records.filter(r => r.id !== id), { id, kind: 'answer', area, label: `${q.intro}${q.focus} ${choice}`, source: { type: 'question', at: new Date().toISOString() }, status: 'confirmed' }], knowledge: { ...c.knowledge, recordCount: c.knowledge.recordCount + (isNew ? 1 : 0) }, choices: { ...c.choices, 'today-question-index': String(qi + 1), 'today-answer-day': day } };
    });
    feedback.file();
  };

  const greeting = now.getHours() < 12 ? 'Good morning' : now.getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const level = engine.level.currentLevel;
  // The same four names as Your levels, so Today and that page never disagree.
  const levelName = levelPlan[Math.max(0, Math.min(levelPlan.length - 1, level - 1))].name;
  const fuel = useFuelDay();
  const aimPct = Math.round(seed.finance.deposit / seed.finance.depositGoal * 100);

  return (
    <Page screen="today" bar={{ kind: 'root', title: 'Today', sub: shortDate(now), actions: todayActions(() => setSearching(true)) }} onPull={() => setSearching(true)}>
      <Between>
        <Text variant="callout" tone="ink2" numberOfLines={1} style={{ flexShrink: 1 }}>{`${greeting}, ${data.profile.name}`}</Text>
        <Chip label={`Level ${level} · ${levelName}`} onPress={() => nav.go('levels')} />
      </Between>
      {birthday ? <>
        <Display s={birthdayBrief(birthday)} />
        <BirthdayMoveV26 b={birthday} day={day} />
        <TodayLoops />
      </> : <>
      <Display s={todayBrief(mood)} />
      <ArrivingCard mood={mood} onPress={() => setDrawer(true)} style={{ marginTop: space.lg }} />
      <TodayLoops />

      {cards.length ? <>
        <SectionHead title="Today’s moves" link={`${dec.length + 1} of ${TODAY_MOVES.length}`} style={{ marginTop: space.xl }} />
        <MoveDeck cards={cards} onDecide={d => decide(`${dec}${d === 'take' ? 'y' : 'n'}`)} />
      </> : chosen.length ? <>
        <SectionHead title={`Your day · ${chosen.length} ${chosen.length === 1 ? 'move' : 'moves'}`} link="Choose again" onLink={() => decide('')} style={{ marginTop: space.xl }} />
        <View style={[styles.card, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
          <Micro sig>First</Micro>
          <Text variant="headline" style={{ marginTop: space.tile }}>{chosen[0].title}</Text>
          <Body s={`${chosen[0].chip} · {${chosen[0].value}}`} style={{ marginTop: space.xxs }} />
          <Btn label="Continue" icon="arrow" trail onPress={() => openMove(chosen[0].key)} style={{ marginTop: space.md }} />
          {chosen.slice(1).map(c => (
            <Press key={c.key} haptic="open" onPress={() => openMove(c.key)} accessibilityLabel={`Then ${c.title}`} style={styles.then}>
              <Thumb source={photos[c.photo]} size={componentSize.round} />
              <View style={{ flex: 1, minWidth: 0 }}><Text variant="rowTitle" numberOfLines={1}>{c.title}</Text><Text variant="callout" tone="ink2" numberOfLines={1}>{c.chip}</Text></View>
              <Text variant="callout" tone="ink2">Then</Text>
            </Press>
          ))}
        </View>
      </> : (
        <View style={[styles.card, { marginTop: space.lg, backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
          <Text variant="headline">Nothing taken on today.</Text>
          <Body s="That’s allowed. Your moves keep until tomorrow." style={{ marginTop: space.xs }} />
          <QuietLink label="Choose again" ink center={false} onPress={() => decide('')} style={{ marginTop: space.sm }} />
        </View>
      )}
      </>}

      <SectionHead title="Body" link="Apple Health · 6 min ago" onLink={() => nav.go('body')} />
      <TileGrid>
        {metrics.visible.map(name => {
          const v = metricValue(name, data.prefs.hideNumbers);
          if (name === 'Fuel') return (
            <V26Tile key={name} wide label="Fuel" dot="home" scale={`/${fuel.budget.toLocaleString('en-GB')} kcal`} value={data.prefs.hideNumbers ? 'Balanced' : fuel.eaten.toLocaleString('en-GB')} meter={Math.min(1, fuel.eaten / fuel.budget)} onPress={() => nav.go('fuel')}
              parts={fuel.macros.map(m => ({ label: m.label, value: `${Math.max(0, m.max - m.value)}${m.unit} left` }))} />
          );
          return <V26Tile key={name} label={name} dot={METRIC_DOT[name]} scale={v.scale} value={v.value} sub={v.sub} onPress={() => nav.go(METRIC_TO[name])} />;
        })}
      </TileGrid>

      {q && !answered ? (
        <View style={[styles.card, { marginTop: space.xxl, backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
          <Eyebrow orb>Life is asking</Eyebrow>
          <Statement s={`${q.intro}{${q.focus}}`} style={{ marginTop: space.xs }} />
          <View style={[styles.row, { marginTop: space.md }]}>{q.choices.map(c => <Btn key={c} label={c} ghost sm fit onPress={() => answer(c)} />)}</View>
        </View>
      ) : null}

      <SectionHead title="Coming up" link="Calendar" onLink={() => nav.go('calendar')} />
      <RowsCard>
        <Row date={{ day: 18, month: 'Nov' }} title="Kofi’s birthday" sub="Turning 31 · running vest idea" end="Sat" onPress={() => nav.go('person')} />
        <Row date={{ day: '01', month: 'Dec' }} title="Council tax" sub={`${money(councilTax.amount)} · Direct Debit`} end={`${councilTax.days} days`} onPress={() => nav.go('bill')} />
        <Row date={{ day: 12, month: 'Jan' }} title="Car MOT due" sub="Book from 12 Dec" end="8 weeks" onPress={() => nav.go('renewal')} />
      </RowsCard>

      <Press haptic="open" onPress={() => nav.go('aim')} accessibilityLabel={`Your Aim, ${aimPct}% there`} style={[styles.aim, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
        <Thumb source={photos.keyshome} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Micro>{`Your Aim · ${aimPct}% there`}</Micro>
          <Text variant="title" style={{ marginTop: 2 }} numberOfLines={2}>{data.aim ? `Own a two-bed flat by ${data.aim.when}` : 'Choose your Aim'}</Text>
        </View>
        <Icon name="chev" size={componentSize.iconXs} color={t.inkQuiet} />
      </Press>
      <Press haptic="open" onPress={() => nav.go('knows')} accessibilityLabel={`Life knows you, ${data.knowledge.overall}%`} style={[styles.card, { marginTop: space.sm, backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
        <Between><Text variant="title">Life knows you</Text><Text variant="title">{`${data.knowledge.overall}%`}</Text></Between>
        <Ruler pct={data.knowledge.overall} style={{ marginTop: space.sm }} />
        <Text variant="callout" tone="ink2" style={{ marginTop: space.tile }}>{`${data.knowledge.recordCount} things filed from your words and records.`}</Text>
      </Press>

      <Modal visible={drawer} transparent animationType="fade" statusBarTranslucent onRequestClose={() => setDrawer(false)}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}>
          <View style={[StyleSheet.absoluteFill, { backgroundColor: t.scrim }]} />
          <Press haptic={null} accessibilityLabel="Not now" onPress={() => { choose('pulse-skipped-day', day); setDrawer(false); }} style={{ flex: 1 }} />
          {/* The scrim fades; the drawer rises from the bottom edge like a native sheet. */}
          <Appear rise={120}><FeelingDrawer initial={mood ?? 'calm'} onClose={() => { if (!mood) choose('pulse-skipped-day', day); setDrawer(false); }} onSet={m => { logMood(m); decide(''); setDrawer(false); }} /></Appear>
        </SafeAreaProvider>
      </Modal>
      <Modal visible={params.nudge === '1'} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => nav.replace('today')}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}><NudgeV26 onClose={() => nav.replace('today')} /></SafeAreaProvider>
      </Modal>
      <Modal visible={searching} animationType="fade" presentationStyle="fullScreen" onRequestClose={() => setSearching(false)}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}><SearchV26 onClose={() => setSearching(false)} /></SafeAreaProvider>
      </Modal>
    </Page>
  );
}

function useCardStyle() {
  const t = useTokens();
  return { backgroundColor: t.surface, ...cardShadow(t.scheme) };
}

/* ───────────────────────── Pulse ───────────────────────── */

export function PulseV26() {
  const nav = useNavigation(), { choose } = useSeed();
  const { day } = useLocalDay();
  const arriving = useArriving(day);
  const logMood = useLogMood();
  const params = useLocalSearchParams<{ state?: string }>();
  const [set, setSet] = useState<FeelMoodId | null>(params.state?.startsWith('set') ? 'calm' : null);
  if (set) {
    const m = FEEL_MOODS[set];
    const at = new Date(arriving.at ?? Date.now()).toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit' });
    return (
      <Page screen="pulse">
        <PhotoCard source={photos[m.photo]} height={230} chips={[{ label: `Checked in · ${at}`, icon: 'check' }]} title={`Arriving ${m.name.toLowerCase()}`} sub={m.head} />
        <Statement s="Today is {set around it}." style={{ marginTop: space.md }} />
        <Body s={m.line} style={{ marginTop: space.xs }} />
        <View style={[styles.row, { marginTop: space.md }]}>
          <Btn label="Change" ghost fit onPress={() => setSet(null)} />
          <View style={{ flex: 1 }}><Btn label="Back to Today" onPress={nav.close} /></View>
        </View>
      </Page>
    );
  }
  return (
    <Page screen="pulse">
      <FeelingDrawer bare initial={arriving.mood ?? 'calm'} fieldHeight={300} onClose={() => { choose('pulse-skipped-day', day); nav.close(); }} onSet={m => { logMood(m); setSet(m); }} />
    </Page>
  );
}

/* ───────────────────────── Checking in ───────────────────────── */

export function CheckinV26() {
  const nav = useNavigation(), { flag } = useSeed();
  return (
    <Page screen="checkin" bar={{ kind: 'sheet', title: 'Checking in' }}
      footer={<><Btn label="Make this week lighter" onPress={() => { flag('lighter-week', true); feedback.file(); nav.close(); }} /><QuietLink label="I’m okay, just a busy week" onPress={nav.close} /></>}>
      <PhotoCard source={photos.breathe} focal={{ y: 0.3 }} height={150} chips={['The last 7 days']} title="" style={{ marginTop: space.xxs }}>
        <View style={styles.week} accessible accessibilityLabel={`${heavyCount} heavy days of the last 7`}>
          {heavyWeek.days.map((d, k) => (
            <View key={k} style={styles.weekDay}>
              <View style={[styles.weekDot, { backgroundColor: heavyWeek.heavy[k] === '1' ? photo.onPhoto : photo.fill }]} />
              <Text variant="micro" style={{ color: photo.onPhoto2 }}>{d}</Text>
            </View>
          ))}
        </View>
      </PhotoCard>
      <Statement s={`You’ve felt drained or anxious on {${heavyCount} of the last 7 days}. That’s a lot to carry.`} style={{ marginTop: space.md }} />
      <Body s="Life can make the next few days lighter. And if it would help to talk to someone:" style={{ marginTop: space.sm }} />
      <SupportRowsV26 style={{ marginTop: space.md }} />
      <Callout style={{ marginTop: space.md }}>Life isn’t a medical service. If you’re in danger right now, call 999.</Callout>
    </Page>
  );
}

/** Where real support is. Used by Checking in and anywhere distress shows. */
export function SupportRowsV26({ style }: { style?: object }) {
  return (
    <RowsCard style={style}>
      <Row icon="heart" title="Samaritans · 116 123" sub="Free, any time, about anything" right={<Chip label="24/7" tone="q" />} onPress={() => { void Linking.openURL('tel:116123'); }} />
      <Row icon="help" title="NHS 111" sub="Urgent help when it isn’t an emergency" right={<Chip label="Any time" tone="q" />} onPress={() => { void Linking.openURL('tel:111'); }} />
      <Row icon="person" title="Your GP" sub="For ongoing support" />
    </RowsCard>
  );
}

/* ───────────────────────── Customise Today ───────────────────────── */

export function CustomiseV26() {
  const t = useTokens(), nav = useNavigation(), { data } = useSeed();
  const { visible, hidden, toggle, move } = useTodayMetrics();
  const tintFor = (n: MetricName) => n === 'Readiness' ? 'health' as const : n === 'Sleep' ? 'work' as const : null;
  return (
    <Page screen="customise" bar={{ kind: 'sheet', title: 'Today’s numbers' }} footer={<Btn label="Done" onPress={nav.close} />}>
      <Statement s="Up to {five numbers} on Today, in {your order}." style={{ marginTop: space.xxs }} />
      <Between style={{ marginTop: space.lg }}><Micro>PREVIEW</Micro><Callout>{`${visible.length} of 5 chosen`}</Callout></Between>
      <View style={[styles.mini, { marginTop: space.xs }]}>
        {visible.map(n => {
          const v = metricValue(n, data.prefs.hideNumbers), area = tintFor(n);
          const cell = <><Text variant="micro" tone="ink2">{n === 'Stress' ? 'Stress · estimate' : n}</Text><Text variant="headline" style={{ fontVariant: ['tabular-nums'] }}>{v.value}</Text></>;
          const wide = n === 'Fuel';
          return area
            ? <TintCard key={n} area={area} padding={0} style={[styles.miniCell, wide ? styles.miniWide : null]}>{cell}</TintCard>
            : <View key={n} style={[styles.miniCell, wide ? styles.miniWide : null, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>{cell}</View>;
        })}
      </View>
      <Callout style={{ marginTop: space.xs }}>Updates Today’s Body snapshot as you change it.</Callout>
      <RowsCard style={{ marginTop: space.md }}>
        {visible.map((n, i) => (
          <ReorderRow key={n} label={n} index={i} count={visible.length} onMove={move}>
            <Row lead={<Grip />} title={n} style={{ minHeight: 46, paddingVertical: 3 }} right={<RoundButton icon="remove" size="sm" label={`Take ${n} off Today`} onPress={() => toggle(n, false)} />} />
          </ReorderRow>
        ))}
      </RowsCard>
      <Micro style={{ marginTop: space.lg }}>MORE NUMBERS · TAKE ONE OFF TO ADD ANOTHER</Micro>
      <View style={[styles.wrap, { marginTop: space.xs }]}>
        {hidden.map(n => <Chip key={n} label={n} tone="q" icon="add" onPress={visible.length < 5 ? () => toggle(n, true) : undefined} />)}
      </View>
    </Page>
  );
}

/** Six dots in two columns: the board's drag grip. */
function Grip() {
  const t = useTokens();
  return <View style={styles.grip} accessibilityElementsHidden>{Array.from({ length: 6 }, (_, k) => <View key={k} style={{ width: 2.8, height: 2.8, borderRadius: 1.4, backgroundColor: t.inkQuiet }} />)}</View>;
}

/* ───────────────────────── Routines ───────────────────────── */

const MONTHS = 'NDJFMAMJJASO'.split('');
function YearStrip({ on, next }: { on: number[]; next: number }) {
  const t = useTokens();
  return (
    <View style={styles.year} accessibilityElementsHidden>
      {MONTHS.map((m, k) => (
        <View key={k} style={styles.yearCell}>
          <View style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: k === next ? t.ember : on.includes(k) ? t.ink : t.surface3 }} />
          <Text variant="micro" tone={k === next ? 'ink' : 'quiet'}>{m}</Text>
        </View>
      ))}
    </View>
  );
}

export function RoutinesV26() {
  const nav = useNavigation(), { engine } = useSeed();
  const running = Math.max(2, engine.level.unlockedNormals.length);
  const all = MONTHS.map((_, k) => k);
  const routine = (photo: keyof typeof photos, when: string, name: string, what: string, strip: React.ReactNode, to: ScreenKey) => (
    <Press haptic="open" onPress={() => nav.go(to)} accessibilityLabel={`${name}. ${when}`} style={[styles.card, useCardStyle()]}>
      <Between><Micro>{when}</Micro><Chip label="Active" tone="done" /></Between>
      <View style={[styles.row, { marginTop: space.sm, alignItems: 'center' }]}>
        <Thumb source={photos[photo]} focal={{ y: 0.75 }} />
        <View style={{ flex: 1 }}><Text variant="headline">{name}</Text><Text variant="callout" tone="ink2">{what}</Text></View>
      </View>
      {strip}
    </Press>
  );
  return (
    <Page screen="routines" bar={{ kind: 'push', title: 'Routines' }}>
      <Eyebrow>Jobs that repeat, kept in order</Eyebrow>
      <Display s={`{${running} routines} running. The next one is {@wallet payday}, in {${payday.days} days}.`} />
      <View style={{ marginTop: space.xl }}>{routine('payslip', 'Every month · next 28 Nov', 'Payday sweep', 'Move what’s left after bills into your buffer.', <YearStrip on={all} next={0} />, 'buffer')}</View>
      <View style={{ marginTop: space.sm }}>{routine('letter', 'Every year · next April', 'Annual NI and tax check', 'Check last year against your HMRC record.', <YearStrip on={[5]} next={-1} />, 'taxcheck')}</View>
      <SectionHead title="Available at level 3" />
      <RowsCard>
        <Row icon="heart" title="Care review" sub="Every year, you pick the month · bloodwork and a GP check-in" right={<Chip label="Level 3" tone="q" />} onPress={() => nav.go('blood')} />
        <Row icon="repeat" title="Subscription check" sub="Every 3 months · cancel what you don’t use" right={<Chip label="Level 3" tone="q" />} onPress={() => nav.go('subs')} />
      </RowsCard>
    </Page>
  );
}

/* ───────────────────────── Why am I seeing this? ───────────────────────── */

export function WhyV26() {
  const t = useTokens(), nav = useNavigation(), { data, flag } = useSeed();
  const back = data.flags['lighter-day'] === false;
  const drained = FEEL_MOODS.drained;
  return (
    <Page screen="why">
      <Eyebrow orb right={<RoundButton icon="close" size="sm" label="Close" onPress={nav.close} />}>Why today is lighter</Eyebrow>
      <Statement s={back ? 'Put back. {The P87} is on {today} again, as it was.' : 'Life moved {the P87} to tomorrow and kept {one small task} today.'} style={{ marginTop: space.sm }} />
      <Micro style={{ marginTop: space.lg }}>THE THREE SIGNALS IT USED</Micro>
      <View style={[styles.row, { marginTop: space.xs, gap: space.xs }]}>
        <TintCard area="health" padding={12} style={styles.sig}><Text variant="micro" tone="ink2">Readiness</Text><Text variant="headline" style={styles.sigVal}>{String(lighterDay.readiness)}</Text><Text variant="micro" tone="ink2">Low for you</Text></TintCard>
        <TintCard area="work" padding={12} style={styles.sig}><Text variant="micro" tone="ink2">Sleep</Text><Text variant="headline" style={styles.sigVal}>{lighterDay.sleep}</Text><Text variant="micro" tone="ink2">{`Need was ${lighterDay.need}`}</Text></TintCard>
        <View style={[styles.sig, { padding: 12, borderRadius: radius.tile, overflow: 'hidden', backgroundColor: t.surface2 }]}>
          <PhotoFill source={photos[drained.photo]} focal={{ y: 0.72 }} />
          <View style={[StyleSheet.absoluteFill, { backgroundColor: photo.shade }]} />
          <Text variant="micro" style={{ color: photo.onPhoto2 }}>Pulse</Text><Text variant="headline" tone="paper" style={styles.sigVal}>Drained</Text><Text variant="micro" style={{ color: photo.onPhoto2 }}>This morning</Text>
        </View>
      </View>
      <Callout style={{ marginTop: space.sm }}>{`Your HRV is below your normal range of ${lighterDay.hrvNormal[0]} to ${lighterDay.hrvNormal[1]}.`}</Callout>
      <View style={[styles.row, { marginTop: space.lg }]}>
        <Btn label={back ? 'Undo' : 'Put it back'} ghost fit onPress={() => flag('lighter-day', back)} />
        <View style={{ flex: 1 }}><Btn label={back ? 'Done' : 'Keep it lighter'} onPress={() => { if (!back) flag('lighter-day', true); nav.close(); }} /></View>
      </View>
    </Page>
  );
}

/* ───────────────────────── Calendar-aware day ───────────────────────── */

export function CalendarV26() {
  const t = useTokens(), nav = useNavigation(), { update } = useSeed();
  const { now } = useLocalDay();
  return (
    <Page screen="calendar" bar={{ kind: 'push', title: 'Your day', action: { kind: 'icon', icon: 'calendar', label: 'Calendar access', onPress: () => nav.go('calprimer') } }}>
      <Eyebrow>{`${shortDate(now)} · ${dayShape.booked} booked`}</Eyebrow>
      <Display s="A {busy day}. Life found {@clock one 20-minute gap} for the {P87}." />
      <View style={{ marginTop: space.xl, gap: 6 }}>
        {dayShape.blocks.map(b => (
          <View key={b.at} style={{ flexDirection: 'row', gap: space.tile }}>
            <Text variant="callout" tone={b.kind === 'gap' ? 'ink' : 'ink2'} style={{ width: 44, paddingTop: space.xs, fontVariant: ['tabular-nums'] }}>{b.at}</Text>
            {b.kind === 'gap' ? (
              <Press haptic="open" onPress={() => { update(c => ({ ...c, selectedMission: 'uk-hmrc-tax-code' })); nav.go('mission'); }} accessibilityLabel="Free for 20 minutes. Life will nudge you here: finish the P87." style={[styles.block, styles.gap, { backgroundColor: t.emberTint }]}>
                <View style={{ flex: 1 }}>
                  <Micro sig>FREE · 20 MIN</Micro>
                  <Text variant="title" style={{ marginTop: 6 }}>Life will nudge you here</Text>
                  <Text variant="callout" tone="ink2" style={{ marginTop: 2 }}>Finish the P87.</Text>
                </View>
                <Thumb source={photos.payslip} focal={{ y: 0.75 }} />
              </Press>
            ) : (
              <Press haptic={b.kind === 'free' ? 'open' : null} disabled={b.kind !== 'free'} onPress={() => nav.go('focus')} accessibilityLabel={`${b.at}, ${b.label ?? (b.kind === 'free' ? 'Free' : 'Busy')}`}
                style={[styles.block, { minHeight: b.h, backgroundColor: b.kind === 'busy' ? t.surface3 : b.kind === 'soft' ? t.surface2 : 'transparent' }]}>
                <Text variant="callout" tone={b.kind === 'free' ? 'quiet' : 'ink2'}>{b.label ?? (b.kind === 'free' ? 'Free' : 'Busy')}</Text>
              </Press>
            )}
          </View>
        ))}
      </View>
      <Callout style={{ marginTop: space.md }}>Life only reads when you’re busy or free, never the details of your events.</Callout>
    </Page>
  );
}

/* ───────────────────────── Morning brief ───────────────────────── */

export function MorningBriefV26() {
  const t = useTokens(), nav = useNavigation(), { data, flag } = useSeed();
  const { now } = useLocalDay();
  const playing = !!data.flags['brief-playing'];
  const stamp = `${now.toLocaleDateString('en-GB', { weekday: 'long' })} · ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  return (
    <Page screen="morningbrief" scroll={false} backdrop={<><PhotoBackdrop source={photos.calmdesk} /><LinearGradient pointerEvents="none" colors={['rgba(8,9,10,0)', t.scrim]} locations={[0.3, 0.75]} style={StyleSheet.absoluteFill} /></>}
      bar={{ kind: 'photo', left: <Chip label={stamp} onPhoto /> }}
      footer={<Btn label="Start the day" onPhoto onPress={nav.close} />}>
      <View style={{ flex: 1 }} />
      <Text variant="title" tone="paper">{`Good morning, ${data.profile.name}`}</Text>
      <Display onPhoto s={`You slept {@moon ${hm(seed.health.sleepMinutes)}}, and you’re {well recovered}. Today: {@doc one bill} and a {@walk 20-minute run}. One step closer to your {@home first home}.`} style={{ marginTop: space.xs }} />
      <Press haptic="select" onPress={() => flag('brief-playing')} accessibilityLabel={playing ? 'Pause your brief' : 'Listen to your brief, 20 seconds'} style={[styles.listen, { backgroundColor: photo.fill }]}>
        <View style={[styles.play, { backgroundColor: photo.onPhoto }]}><Icon name={playing ? 'pause' : 'play'} size={componentSize.iconXs} color={photo.ink} /></View>
        <Waveform active={playing} look="note" bars={20} />
        <Text variant="callout" tone="paper">{playing ? 'Playing · 0:20' : 'Listen · 0:20'}</Text>
      </Press>
      <Sp h={space.xs} />
    </Page>
  );
}

/* ───────────────────────── From life ───────────────────────── */

export function InboxV26() {
  const t = useTokens(), nav = useNavigation(), { data, flag, update } = useSeed();
  const read = !!data.flags['inbox-read'];
  return (
    <Page screen="inbox" bar={{ kind: 'push', title: 'From Life', action: { kind: 'node', node: <Chip label="Read all" onPress={() => flag('inbox-read', true)} /> } }}>
      <Display s={read ? '{All read.} Nothing important lives only here.' : '{2 new} from Life. Nothing important lives only here.'} style={{ marginTop: space.xxs }} />
      <View style={{ marginTop: space.xl, paddingTop: 28 }}>
        <Press haptic="open" onPress={() => nav.go('today', { nudge: '1' })} accessibilityLabel="20 free minutes before 14:00. Nudge, 11:20" style={[styles.peek, { backgroundColor: t.surface3 }]}>
          <View style={styles.row}>{read ? null : <View style={[styles.unread, { backgroundColor: t.ember }]} />}<Text variant="micro" tone="quiet">20 free minutes before 14:00</Text></View>
          <Text variant="micro" tone="quiet">Nudge · 11:20</Text>
        </Press>
        <PhotoCard source={photos.payslip} focal={{ y: 0.7 }} height={236} onPress={() => { update(c => ({ ...c, selectedMission: 'uk-hmrc-tax-code' })); nav.go('mission'); }}
          chips={[read ? 'Earlier · 2h ago' : { label: 'New · 2h ago', dot: t.ember }]} chipRight="Tax rebate"
          title={seedTaxClaim.refund ? `You’re likely owed ${money(seedTaxClaim.refund)}` : 'Your tax record is worth checking'} sub="From work expenses you told Life about. One form claims it." />
      </View>
      <SectionHead title="Earlier" />
      <RowsCard>
        <Row thumb={photos.bedroom} title="Your sleep was 40 min short" sub="Body · today, 07:05" onPress={() => nav.go('sleep')} />
        <Row thumb={photos.cook} title="Sam added 2 things to shopping" sub="Shared · yesterday" onPress={() => nav.go('shared')} />
        <Row thumb={photos.journal} title="Weekly recap is ready" sub="Grow · Sunday" onPress={() => nav.go('recap')} />
      </RowsCard>
    </Page>
  );
}

/* ───────────────────────── Focus session ───────────────────────── */

export function FocusV26() {
  const t = useTokens(), nav = useNavigation(), calm = useCalmMotion();
  const params = useLocalSearchParams<{ state?: string }>();
  const [running, setRunning] = useState(params.state !== 'paused');
  const [left, setLeft] = useState(38 * 60 + 6);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (!running) return;
    timer.current = setInterval(() => setLeft(s => { if (s <= 1) { setRunning(false); feedback.complete(); return 0; } return s - 1; }), 1000);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [running]);
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0');
  return (
    <Page screen="focus" bar={{ kind: 'flow', left: 'Deep work', step: '2 of 3' }} center
      footer={<><Btn label={running ? 'Pause' : 'Resume'} icon={running ? 'pause' : 'play'} onPress={() => setRunning(r => !r)} /><QuietLink label="End early" onPress={nav.close} /></>}>
      <View style={{ alignItems: 'center' }}>
        <LifeOrb size={150} state={running && !calm ? 'thinking' : 'ring'} />
        <Text variant="numeralXl" style={{ marginTop: 28 }} accessibilityLabel={`${Math.floor(left / 60)} minutes left`}>{`${mm}:${ss}`}</Text>
        <Text variant="callout" tone="ink2" style={{ marginTop: 6 }}>{running ? 'left in this block' : 'Paused. Still yours when you’re back.'}</Text>
        <View style={[styles.row, { marginTop: space.xl, gap: space.tile }]} accessible accessibilityLabel="Block 2 of 3">
          {[t.ink, t.ember, t.surface3].map((c, k) => <View key={k} style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: c }} />)}
        </View>
        <Text variant="title" style={{ marginTop: space.xl }}>Portfolio case study</Text>
        <Chip label="Notifications quiet" tone="q" icon="moon" style={{ marginTop: space.tile, alignSelf: 'center' }} />
      </View>
    </Page>
  );
}

/* ───────────────────────── Search ───────────────────────── */

export function SearchV26({ onClose }: { onClose: () => void }) {
  const t = useTokens(), nav = useNavigation(), { update } = useSeed();
  const [query, setQuery] = useState('');
  const go = (fn: () => void) => { onClose(); fn(); };
  const areas: { n: string; p: keyof typeof photos; to: ScreenKey }[] = [{ n: 'Home', p: 'home', to: 'areahome' }, { n: 'Work', p: 'work', to: 'areawork' }, { n: 'Body', p: 'run', to: 'body' }, { n: 'People', p: 'people', to: 'people' }, { n: 'Learn', p: 'bench', to: 'library' }];
  const asked: { icon: 'doc' | 'home' | 'moon' | 'wallet' | 'gift' | 'folder' | 'food'; t: string; to: ScreenKey }[] = [{ icon: 'doc', t: 'tax code', to: 'taxcheck' }, { icon: 'home', t: 'council tax', to: 'bill' }, { icon: 'moon', t: 'sleep', to: 'sleep' }, { icon: 'wallet', t: 'rent', to: 'budget' }, { icon: 'gift', t: 'Kofi’s birthday', to: 'person' }, { icon: 'folder', t: 'passport', to: 'vault' }, { icon: 'food', t: 'lunch', to: 'fuel' }];
  const found = [
    { k: 'ct', title: 'Council tax', sub: `Money · ${money(councilTax.amount)} · due in ${councilTax.days} days`, date: { day: '01', month: 'Dec' }, to: 'bill' as ScreenKey },
    { k: 'letter', title: 'Council tax letter', sub: 'Scan · yesterday', icon: 'camera' as const, to: 'scan' as ScreenKey },
    { k: 'code', title: `Tax code ${seed.finance ? '1257L' : ''}`, sub: 'Money · from your payslip', icon: 'doc' as const, to: 'taxcheck' as ScreenKey },
    { k: 'disc', title: 'Council tax discount', sub: 'Single person · 25% off', icon: 'home' as const, to: 'mission' as ScreenKey, mission: 'uk-single-person-council' },
  ].filter(r => !query || `${r.title} ${r.sub}`.toLowerCase().includes(query.toLowerCase()));
  return (
    <View style={{ flex: 1, backgroundColor: t.canvas }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>
        <View style={styles.searchBar}>
          <Icon name="search" size={componentSize.icon} color={t.ink} />
          <TextInput maxFontSizeMultiplier={1.3} autoFocus value={query} onChangeText={setQuery} placeholder="Search" placeholderTextColor={t.ink2} accessibilityLabel="Search everything" returnKeyType="search"
            onSubmitEditing={() => go(() => nav.go('chat', { question: query }))} selectionColor={t.ember}
            style={[styles.searchInput, { color: t.ink, fontFamily: fonts.sansMedium }]} />
          <RoundButton icon="close" solid label="Close search" onPress={onClose} />
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.gutter, paddingTop: space.xxs, paddingBottom: 28 }}>
          {query ? null : <>
            <Micro style={{ marginTop: space.xs }}>YOUR AREAS</Micro>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -space.gutter, marginTop: space.sm }} contentContainerStyle={{ paddingHorizontal: space.gutter, gap: space.tile, paddingBottom: space.xxs }}>
              {areas.map(a => (
                <Press key={a.n} haptic="open" onPress={() => go(() => nav.go(a.to))} accessibilityLabel={a.n} style={[styles.ptile, { backgroundColor: t.surface2, ...cardShadow(t.scheme) }]}>
                  <PhotoFill source={photos[a.p]} />
                  <LinearGradient pointerEvents="none" colors={photoScrims.deck.colors} locations={photoScrims.deck.locations} style={StyleSheet.absoluteFill} />
                  <Text variant="buttonCompact" tone="paper" style={{ padding: space.tile }}>{a.n}</Text>
                </Press>
              ))}
            </ScrollView>
            <Micro style={{ marginTop: space.xxl }}>ASKED MOST</Micro>
            <View style={[styles.wrap, { marginTop: space.sm }]}>
              {asked.map(a => (
                <Press key={a.t} haptic="select" onPress={() => go(() => nav.go(a.to))} accessibilityLabel={a.t} style={[styles.askChip, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
                  <Icon name={a.icon} size={componentSize.iconXs} color={t.ink} /><Text variant="buttonCompact">{a.t}</Text>
                </Press>
              ))}
            </View>
          </>}
          <Micro style={{ marginTop: query ? space.xs : space.xxl }}>{query ? 'FOUND' : 'FROM YOUR LIFE'}</Micro>
          <View style={{ marginTop: space.sm, gap: space.xs }}>
            {found.map(r => (
              <Press key={r.k} haptic="open" onPress={() => go(() => { if (r.mission) update(c => ({ ...c, selectedMission: r.mission! })); nav.go(r.to); })} accessibilityLabel={`${r.title}, ${r.sub}`} style={[styles.found, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
                {r.date ? <View style={[styles.datebox, { backgroundColor: t.surface2 }]}><Text variant="title" style={{ lineHeight: 18 }}>{r.date.day}</Text><Text variant="micro" tone="ink2">{r.date.month.toUpperCase()}</Text></View>
                  : <View style={[styles.iconWell, { backgroundColor: t.surface2 }]}><Icon name={r.icon!} size={componentSize.iconSm} color={t.ink} /></View>}
                <View style={{ flex: 1, minWidth: 0 }}><Text variant="title">{r.title}</Text><Text variant="callout" tone="ink2">{r.sub}</Text></View>
              </Press>
            ))}
          </View>
          <Btn label={query ? `Ask Life: “${query}”` : 'Ask Life a question'} ghost onPress={() => go(() => nav.go('chat', { question: query }))} style={{ marginTop: space.lg }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: space.cardPad },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  then: { flexDirection: 'row', alignItems: 'center', gap: space.sm, marginTop: space.xs },
  aim: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.lg, marginTop: space.sm },
  week: { flexDirection: 'row', gap: space.tile },
  weekDay: { alignItems: 'center', gap: 5 },
  weekDot: { width: 24, height: 24, borderRadius: 12 },
  mini: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  miniCell: { flexBasis: '47%', flexGrow: 1, borderRadius: radius.tile, paddingTop: space.tile, paddingHorizontal: 14, paddingBottom: space.sm },
  miniWide: { flexBasis: '100%' },
  grip: { width: 12, height: 19, flexDirection: 'row', flexWrap: 'wrap', alignContent: 'space-between', justifyContent: 'space-between', paddingHorizontal: 1, paddingVertical: 2 },
  year: { flexDirection: 'row', justifyContent: 'space-between', marginTop: space.md },
  yearCell: { alignItems: 'center', gap: 6, flex: 1 },
  sig: { flex: 1, borderRadius: radius.tile, minHeight: 96 },
  sigVal: { marginTop: 6, fontVariant: ['tabular-nums'] },
  block: { flex: 1, borderRadius: 14, paddingVertical: space.xs, paddingHorizontal: 14, justifyContent: 'flex-start' },
  gap: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.sm, paddingLeft: 14 },
  listen: { flexDirection: 'row', alignItems: 'center', gap: space.tile, paddingVertical: space.xs, paddingLeft: space.xs, paddingRight: space.md, borderRadius: radius.full, alignSelf: 'flex-start', marginTop: space.lg },
  play: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  peek: { position: 'absolute', left: space.lg, right: space.lg, top: 0, height: 60, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, paddingVertical: 7, paddingHorizontal: space.md, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  unread: { width: 6, height: 6, borderRadius: 3 },
  searchBar: { height: 64, flexDirection: 'row', alignItems: 'center', gap: space.tile, paddingHorizontal: space.gutter },
  searchInput: { flex: 1, minWidth: 0, ...type.titleSerif, paddingVertical: 0 },
  ptile: { width: 112, height: 150, borderRadius: radius.tile, overflow: 'hidden', justifyContent: 'flex-end' },
  askChip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingLeft: space.tile, paddingRight: 14, borderRadius: radius.full },
  found: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.lg },
  datebox: { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  iconWell: { width: componentSize.round, height: componentSize.round, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
