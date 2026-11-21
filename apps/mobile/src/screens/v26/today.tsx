/**
 * Tab 1 · Today, restyled to the V26 board (`core.js` today and search, `today-plan-you.js` the rest).
 * The feeling check rises as a drawer on the first open of the day; today's moves follow it as a deck.
 */
import { useEffect, useRef, useState } from 'react';
import { Linking, Modal, Platform, ScrollView, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import type { BodyToday } from '@life/core';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Appear, ArrivingCard, DecideRow, FEEL_MOODS, FeelingDrawer, Icon, LifeOrb, MoveDeck, PhotoCard, PhotoFill, Press, ReorderRow, RoundButton, Ruler,
  SectionHead, StatusPill, Text, TileGrid, TintCard, V26Tile, Waveform, cardShadow, componentSize, feedback, photo, photoScrims, photos,
  radius, space, type, useCalmMotion, useTokens, type FeelMoodId, type MoveCard, type TopBarAction,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import type { ScreenKey } from '@/navigation/screens';
import { useSeed } from '@/state/SeedProvider';
import { isOnLocalDay, useLocalDay } from '@/state/day';
import { money, seed, seedTaxClaim } from '@/state/seed';
import { budgetScale, fuelShare, macroParts, useFuelDay } from '@/state/fuel';
import { TODAY_MOVES, councilTax, dayShape, heavyCount, heavyWeek, hm, lighterDay, moveOrder, payday, readDecisions, todayBrief } from '@/state/today';
import {
  Body, Btn, Callout, Chip, Display, Eyebrow, Figure, Micro, Page, PhotoBackdrop, QuietLink, Row, RowsCard, Sp, Statement, Thumb, Between,
} from './kit';
import { BirthdayMoveV26, birthdayBrief, useBirthdayNudge } from './people';
import { levelPlan } from '@/state/you';
import { TodayLoops } from './loops';
import { SearchModal } from './search';
import { SHOW_SAMPLES } from '@/state/sample';
import { CalendarRealV26, WhyRealV26, moveCard, useComingUp, useRealMoves } from './dayengine';
import { since, useBodyToday } from '@/state/health';

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
/**
 * The same tile on a real account (Phase 29): the engine's number from this phone's readings, or a dash and what it
 * needs. Never the sample's figures.
 */
function realMetricValue(name: MetricName, body: BodyToday | null): { value: string; scale?: string; sub?: string } {
  const last = (xs: (number | null)[] | undefined) => [...(xs ?? [])].reverse().find((x): x is number => typeof x === 'number') ?? null;
  const none = (sub: string) => ({ value: '–', sub });
  if (!body) return none('No reading yet');
  switch (name) {
    case 'Readiness': {
      const r = body.readiness;
      if (r.status === 'ready') return { value: String(r.score), scale: '/100', sub: r.score >= 67 ? 'Well recovered' : r.score >= 34 ? 'Steady' : 'Take it easier' };
      return none(r.status === 'calibrating' ? `Learning you · ${r.daysWithData} of ${r.daysNeeded} days` : 'Needs heart readings');
    }
    case 'Sleep': return body.sleep?.last ? { value: hm(body.sleep.last.asleepMinutes), scale: `/${Math.round(body.sleep.need.minutes / 60)}h`, sub: body.sleep.debt.minutes > 0 ? `${hm(body.sleep.debt.minutes)} short this week` : 'No sleep debt' } : none('No night yet');
    case 'Load': return body.load ? { value: String(Math.round(body.load.today * 10) / 10), scale: '/21', sub: body.load.today < body.load.sweetSpot.low ? 'Below today’s range' : body.load.today > body.load.sweetSpot.high ? 'Above today’s range' : 'In today’s range' } : none('Needs heart rate');
    case 'Stress': { const n = body.stress?.now; return typeof n === 'number' ? { value: String(n), scale: '/3', sub: n < 1.5 ? 'Low' : n < 2.2 ? 'Medium' : 'High' } : none('Needs heart rate'); }
    case 'HRV': { const v = last(body.readings.hrv); return v !== null ? { value: String(Math.round(v)), sub: 'ms' } : none('No reading yet'); }
    case 'Resting heart rate': { const v = last(body.readings.restingHr); return v !== null ? { value: String(Math.round(v)), sub: 'bpm' } : none('No reading yet'); }
    case 'Steps': return body.steps !== null ? { value: body.steps.toLocaleString('en-GB'), sub: 'so far today' } : none('None yet today');
    case 'Body signals': return body.daysWithData ? { value: body.signals.illness ? 'Take it easy' : 'In range', sub: body.signals.illness ? 'A few signals are off' : 'Nothing unusual' } : none('No reading yet');
    case 'Fuel': return none('');
  }
}
const healthApp = Platform.OS === 'android' ? 'Health Connect' : 'Apple Health';

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
  // A real account's moves come from the day engine (Phase 29); the sample life keeps the board's three.
  const real = useRealMoves();
  const decide = (d: string) => { choose('today-moves', `${day}|${d}`); if (!SHOW_SAMPLES && !d) real.reset(); };
  const left = order.slice(dec.length).map(i => TODAY_MOVES[i]);
  const cards: MoveCard[] = SHOW_SAMPLES ? left.map(m => ({ key: m.key, title: m.title, chip: m.chip, sub: `${m.value} · for your first home`, photo: photos[m.photo], focal: { y: m.photo === 'payslip' ? 0.78 : 0.55 } })) : real.cards;
  const chosen: { key: string; title: string; chip: string; value: string; photo: ImageSourcePropType }[] = SHOW_SAMPLES
    ? order.filter((_, k) => dec[k] === 'y').map(i => TODAY_MOVES[i]).map(m => ({ key: m.key, title: m.title, chip: m.chip, value: m.value, photo: photos[m.photo] }))
    : real.taken.map(m => { const c = moveCard(real.sources[m.id], m); return { key: m.id, title: m.title, chip: c.chip, value: c.sub, photo: c.photo }; });
  const total = SHOW_SAMPLES ? TODAY_MOVES.length : real.moves.length, decided = SHOW_SAMPLES ? dec.length : real.decided;
  const openMove = (key: string) => {
    if (!SHOW_SAMPLES) { real.open(key); return; }
    const m = TODAY_MOVES.find(x => x.key === key)!; if (m.mission) update(c => ({ ...c, selectedMission: m.mission! })); nav.go(m.to);
  };
  const onDecide = (d: string, card: MoveCard) => { if (SHOW_SAMPLES) decide(`${dec}${d === 'take' ? 'y' : 'n'}`); else real.onDecide(d === 'take' ? 'take' : 'pass', card.key); };

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
  const body = useBodyToday();
  const comingUp = useComingUp();
  const aimPct = Math.round(seed.finance.deposit / seed.finance.depositGoal * 100);

  return (
    <Page screen="today" bar={{ kind: 'root', title: 'Today', sub: shortDate(now), actions: todayActions(() => setSearching(true)) }}>
      <Between>
        <Text variant="callout" tone="ink2" numberOfLines={1} style={{ flexShrink: 1 }}>{`${greeting}, ${data.profile.name}`}</Text>
        <Chip label={`Level ${level} · ${levelName}`} onPress={() => nav.go('levels')} />
      </Between>
      {birthday ? <>
        <Display s={birthdayBrief(birthday)} />
        <BirthdayMoveV26 b={birthday} day={day} />
        <TodayLoops />
      </> : <>
      <Display s={SHOW_SAMPLES ? todayBrief(mood) : real.brief} />
      <ArrivingCard mood={mood} onPress={() => setDrawer(true)} style={{ marginTop: space.lg }} />
      <TodayLoops />

      {cards.length ? <>
        <SectionHead title="Today’s moves" link={`${decided + 1} of ${total}`} style={{ marginTop: space.xl }} />
        <MoveDeck cards={cards} onDecide={onDecide} />
        {SHOW_SAMPLES ? null : <QuietLink label="Why am I seeing this?" center={false} onPress={() => nav.go('why')} style={{ marginTop: space.xs }} />}
      </> : chosen.length ? <>
        <SectionHead title={`Your day · ${chosen.length} ${chosen.length === 1 ? 'move' : 'moves'}`} link="Choose again" onLink={() => decide('')} style={{ marginTop: space.xl }} />
        <View style={[styles.card, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
          <Micro sig>First</Micro>
          <Text variant="headline" style={{ marginTop: space.tile }}>{chosen[0].title}</Text>
          <Body s={chosen[0].value ? `${chosen[0].chip} · {${chosen[0].value}}` : chosen[0].chip} style={{ marginTop: space.xxs }} />
          <Btn label="Continue" icon="arrow" trail onPress={() => openMove(chosen[0].key)} style={{ marginTop: space.md }} />
          {chosen.slice(1).map(c => (
            <Press key={c.key} haptic="open" onPress={() => openMove(c.key)} accessibilityLabel={`Then ${c.title}`} style={styles.then}>
              <Thumb source={c.photo} size={componentSize.round} />
              <View style={{ flex: 1, minWidth: 0 }}><Text variant="rowTitle" numberOfLines={1}>{c.title}</Text><Text variant="callout" tone="ink2" numberOfLines={1}>{c.chip}</Text></View>
              <Text variant="callout" tone="ink2">Then</Text>
            </Press>
          ))}
        </View>
      </> : !SHOW_SAMPLES && !total ? null : (
        <View style={[styles.card, { marginTop: space.lg, backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
          <Text variant="headline">Nothing taken on today.</Text>
          <Body s="That’s allowed. Your moves keep until tomorrow." style={{ marginTop: space.xs }} />
          <QuietLink label="Choose again" ink center={false} onPress={() => decide('')} style={{ marginTop: space.sm }} />
        </View>
      )}
      </>}

      <SectionHead title="Body" link={SHOW_SAMPLES ? 'Apple Health · 6 min ago' : data.health.lastRead ? `${healthApp} · ${since(data.health.lastRead)}` : 'Connect'} onLink={() => nav.go(SHOW_SAMPLES || data.health.lastRead ? 'body' : 'devices')} />
      <TileGrid>
        {metrics.visible.map(name => {
          const v = SHOW_SAMPLES ? metricValue(name, data.prefs.hideNumbers) : realMetricValue(name, body);
          if (name === 'Fuel') return (
            <V26Tile key={name} wide label="Fuel" dot="home" scale={budgetScale(fuel)} value={data.prefs.hideNumbers ? 'Balanced' : fuel.eaten.toLocaleString('en-GB')} meter={fuelShare(fuel)} onPress={() => nav.go('fuel')}
              parts={macroParts(fuel)} />
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

      {SHOW_SAMPLES ? <>
      <SectionHead title="Coming up" link="Calendar" onLink={() => nav.go('calendar')} />
      <RowsCard>
        <Row date={{ day: 18, month: 'Nov' }} title="Kofi’s birthday" sub="Turning 31 · running vest idea" end="Sat" onPress={() => nav.go('person')} />
        <Row date={{ day: '01', month: 'Dec' }} title="Council tax" sub={`${money(councilTax.amount)} · Direct Debit`} end={`${councilTax.days} days`} onPress={() => nav.go('bill')} />
        <Row date={{ day: 12, month: 'Jan' }} title="Car MOT due" sub="Book from 12 Dec" end="8 weeks" onPress={() => nav.go('renewal')} />
      </RowsCard>
      </> : comingUp.length ? <>
      <SectionHead title="Coming up" link="Calendar" onLink={() => nav.go('calendar')} />
      <RowsCard>
        {comingUp.map(c => <Row key={c.id} date={{ day: c.day, month: c.month }} title={c.title} end={c.end} onPress={() => nav.go('people')} />)}
      </RowsCard>
      </> : null}

      <Press haptic="open" onPress={() => nav.go('aim')} accessibilityLabel={SHOW_SAMPLES ? `Your Aim, ${aimPct}% there` : 'Your Aim'} style={[styles.aim, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
        <Thumb source={photos.keyshome} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Micro>{SHOW_SAMPLES ? `Your Aim · ${aimPct}% there` : 'Your Aim'}</Micro>
          <Text variant="title" style={{ marginTop: 2 }} numberOfLines={2}>{!data.aim ? 'Choose your Aim' : SHOW_SAMPLES ? `Own a two-bed flat by ${data.aim.when}` : `${data.aim.what.charAt(0).toUpperCase()}${data.aim.what.slice(1)} by ${data.aim.when}`}</Text>
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
      <SearchModal visible={searching} onClose={() => setSearching(false)} />
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
  return SHOW_SAMPLES ? <RoutinesSampleV26 /> : <RoutinesRealV26 />;
}

/** A real account: nothing repeats until Life knows the payday and the bills, so nothing claims to be running. */
function RoutinesRealV26() {
  const nav = useNavigation();
  return (
    <Page screen="routines" bar={{ kind: 'push', title: 'Routines' }}>
      <Eyebrow>Jobs that repeat, kept in order</Eyebrow>
      <Display s="{Nothing running yet.} Routines start once Life knows your payday and your bills." />
      <SectionHead title="Ready when you are" />
      <RowsCard>
        <Row icon="wallet" title="Payday sweep" sub="Every month · move what’s left after bills into your buffer" right={<Chip label="Tell Life" tone="q" />} onPress={() => nav.go('talk')} />
        <Row icon="doc" title="Annual NI and tax check" sub="Every year · check last year against your HMRC record" right={<Chip label="Tell Life" tone="q" />} onPress={() => nav.go('talk')} />
      </RowsCard>
      <SectionHead title="Available at level 3" />
      <RowsCard>
        <Row icon="heart" title="Care review" sub="Every year, you pick the month · bloodwork and a GP check-in" right={<Chip label="Level 3" tone="q" />} />
        <Row icon="repeat" title="Subscription check" sub="Every 3 months · cancel what you don’t use" right={<Chip label="Level 3" tone="q" />} />
      </RowsCard>
    </Page>
  );
}

function RoutinesSampleV26() {
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
  // A real account's reasons come from the day engine; the sample keeps the board's lighter-day story.
  return SHOW_SAMPLES ? <WhySampleV26 /> : <WhyRealV26 />;
}

function WhySampleV26() {
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
  // A real account sees its own calendar, times only (Phase 29); the sample keeps the board's busy day.
  return SHOW_SAMPLES ? <CalendarSampleV26 /> : <CalendarRealV26 />;
}

function CalendarSampleV26() {
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
  return SHOW_SAMPLES ? <InboxSampleV26 /> : <InboxRealV26 />;
}

/** A real account: the sample's rebate, sleep and shopping notes never show. What's real is the weekly recap. */
function InboxRealV26() {
  const nav = useNavigation();
  return (
    <Page screen="inbox" bar={{ kind: 'push', title: 'From Life' }}>
      <Display s="{Nothing new.} When Life finds something worth knowing, it lands here." style={{ marginTop: space.xxs }} />
      <SectionHead title="Every week" />
      <RowsCard><Row thumb={photos.journal} title="Weekly recap" sub="Grow · every Sunday" onPress={() => nav.go('recap')} /></RowsCard>
      <Callout style={{ marginTop: space.md }}>Nothing important lives only here.</Callout>
    </Page>
  );
}

function InboxSampleV26() {
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

export { SearchV26, SearchModal } from './search';

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
});
