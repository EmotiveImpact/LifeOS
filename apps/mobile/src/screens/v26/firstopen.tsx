/**
 * First open, restyled to the V26 board (`core.js` welcome and question, `first-open.js` the rest), plus the two
 * steps Edem added on 20 Nov: the 18+ age check and the recorded health-data consent.
 *
 * Order: Welcome → age → one question → where you live → health consent → body numbers → what you wear →
 * Apple Health → nudges → your Aim → building your plan → save your progress → your first move.
 */
import { useEffect, useRef, useState } from 'react';
import { Keyboard, Linking, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { settledTranscript } from '@life/brain';
import {
  CompactStepper, Field, FilterChips, FullPhotoScreen, Icon, LifeOrb, PhotoCard, PhotoFill, PhotoGrid, PickRow, Press, RoundButton, SegmentedV26,
  SwitchV26, Text, TintCard, TwoTone, V26Tile, TileGrid, cardShadow, componentSize, feedback, floatLift, photo, photoScrims, photos, radius,
  space, useCalmMotion, useTokens, Wordmark, type GlyphName,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import { SHOW_SAMPLES } from '@/state/sample';
import type { ScreenKey } from '@/navigation/screens';
import { useSeed } from '@/state/SeedProvider';
import { records } from '@/services/local';
import { phoneHealth } from '@/services/health/phone';
import { typesAllowed } from '@/services/health/mapping';
import { readHealthNow } from '@/services/health/useHealthRunner';
import { problemWords, sendCode, signInWith, verifyCode } from '@/services/account';
import { voice } from '@/services/voice';
import { askNotifications, notificationsSupported } from '@/services/notifications';
import { askCalendar, calendarSupported } from '@/services/calendar';
import {
  CHILDLINE, CITIES, DESTINATIONS, HEALTH_TYPES, TELL_TOPICS, WORK, birthDate, birthDateProblem, longDate, needsSupport, nextAfterConsent, planFound, useAgeCheck,
  useHealthConsent, type HealthType,
} from '@/state/firstopen';
import { money, seedMeal, seedTaxClaim } from '@/state/seed';
import { Body, Btn, Callout, Chip, Display, Eyebrow, Micro, Page, QuietLink, Row, RowsCard, SheetHandle, Statement, Timeline, drawerStyle, two, useDrawerPhoto, Between } from './kit';

const healthName = Platform.OS === 'android' ? 'Health Connect' : 'Apple Health';

/* ───────────────────────── Small pieces ───────────────────────── */

/** The 72pt white tile holding the orb or an icon (board question and calprimer). */
function MarkTile({ icon }: { icon?: GlyphName }) {
  const t = useTokens();
  return (
    <View style={[styles.tile, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
      {icon ? <Icon name={icon} size={componentSize.icon} color={t.ink} /> : <LifeOrb size={34} />}
    </View>
  );
}

/** A quiet paper link under an on-photo button. */
export function PaperLink({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Press haptic="select" onPress={onPress} accessibilityLabel={label} hitSlop={10} style={{ alignSelf: 'center', minHeight: 28, justifyContent: 'center' }}>
      <Text variant="callout" style={{ color: photo.onPhoto }}>{label}</Text>
    </Press>
  );
}

/** An empty round mark, or the ink tick when chosen (board `.tick`). */
function Pick({ on }: { on: boolean }) {
  const t = useTokens();
  return <View style={[styles.pick, { backgroundColor: on ? t.ink : t.surface3 }]}>{on ? <Icon name="check" size={14} color={t.canvas} /> : null}</View>;
}

/** The status bar over a full photograph. */
export function PhotoStatus() {
  return <><Stack.Screen options={{ statusBarStyle: 'light' }} /><StatusBar style="light" /></>;
}

/** A short list to choose from, rising as a drawer only as tall as its rows. */
function ChoiceDrawer<T extends string>({ visible, title, options, value, onPick, onClose }: { visible: boolean; title: string; options: readonly { value: T; label: string }[]; value: T | null; onPick: (v: T) => void; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <ChoiceDrawerBody title={title} options={options} value={value} onPick={onPick} onClose={onClose} />
      </SafeAreaProvider>
    </Modal>
  );
}
function ChoiceDrawerBody<T extends string>({ title, options, value, onPick, onClose }: { title: string; options: readonly { value: T; label: string }[]; value: T | null; onPick: (v: T) => void; onClose: () => void }) {
  const t = useTokens(), insets = useSafeAreaInsets();
  return <>
    <View style={[StyleSheet.absoluteFill, { backgroundColor: t.scrim }]} />
    <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Close" />
    <View style={[drawerStyle, { backgroundColor: t.surface, paddingHorizontal: space.gutter, paddingBottom: Math.max(insets.bottom, space.md) + space.xs }]}>
      <SheetHandle />
      <Text variant="headline" accessibilityRole="header">{title}</Text>
      <ScrollView style={{ flexGrow: 0, marginTop: space.xs }} showsVerticalScrollIndicator={false}>
        {options.map(o => <Row key={o.value} title={o.label} haptic="select" right={<Pick on={o.value === value} />} onPress={() => { onPick(o.value); onClose(); }} />)}
      </ScrollView>
    </View>
  </>;
}

/* ───────────────────────── Welcome ───────────────────────── */

export function WelcomeV26() {
  const nav = useNavigation(), { set } = useSeed(), age = useAgeCheck();
  const start = () => nav.go(age.passed ? 'question' : 'agecheck');
  // Skip leaves setup for later, but never the age check.
  const skip = () => { if (age.passed) { set({ onboardingDone: true }); nav.home(); } else nav.go('agecheck', { next: 'today' }); };
  return (
    <View nativeID="screen-welcome" style={{ flex: 1, backgroundColor: photo.ink }}>
      <PhotoStatus />
      <FullPhotoScreen source={photos.friends} focal={{ x: 0.42 }} title="Life, handled." statement={two('Life finds {what you’re owed}, {what’s due} and {what’s next}.')}
        pager={{ count: 3, index: 0 }} onNext={start} nextLabel="Get started" onSkip={skip} />
    </View>
  );
}

/* ───────────────────────── The 18+ age check ───────────────────────── */

const digits = (s: string, n: number) => s.replace(/\D/g, '').slice(0, n);

export function AgecheckV26() {
  const nav = useNavigation(), { set } = useSeed(), age = useAgeCheck();
  const params = useLocalSearchParams<{ next?: string }>();
  const [d, setD] = useState(''), [m, setM] = useState(''), [y, setY] = useState('');
  const problem = birthDateProblem(d, m, y);
  const born = problem ? null : birthDate(d, m, y);
  useEffect(() => { if (born) Keyboard.dismiss(); }, [!!born]); // eslint-disable-line react-hooks/exhaustive-deps
  if (age.under) return <UnderAge />;
  const go = () => {
    if (!born) return;
    if (age.record(born) === 'under') { feedback.select(); return; }
    feedback.primary();
    if (params.next === 'today') { set({ onboardingDone: true }); nav.home(); } else nav.replace('question');
  };
  return (
    <Page screen="agecheck" bar={{ kind: 'flow', left: 'Back' }} footer={<Btn label="Continue" disabled={!born} onPress={go} />}>
      <View style={{ alignItems: 'flex-start', marginTop: space.lg }}><MarkTile /></View>
      <Text variant="title" style={{ marginTop: space.md }}>Before we start</Text>
      <Display s="{When were you born?}" style={{ marginTop: space.xxs }} />
      <Body s="Life asks once. Your date of birth sets {age rules}, like pensions and the Lifetime ISA, and it stays {on this phone}." style={{ marginTop: space.xs }} />
      <View style={styles.dob}>
        <Field label="Day" testID="age-day" value={d} placeholder="DD" onChangeText={v => setD(digits(v, 2))} keyboardType="numeric" style={{ flex: 1 }} />
        <Field label="Month" testID="age-month" value={m} placeholder="MM" onChangeText={v => setM(digits(v, 2))} keyboardType="numeric" style={{ flex: 1 }} />
        <Field label="Year" testID="age-year" value={y} placeholder="YYYY" onChangeText={v => setY(digits(v, 4))} keyboardType="numeric" style={{ flex: 1.5 }} />
      </View>
      <Callout tone={problem ? 'ink' : 'ink2'} style={{ marginTop: space.sm }}>{problem ?? 'For example, 14 3 1999'}</Callout>
    </Page>
  );
}

/** Under 18: a kind stop. The date of birth isn't kept; the result is, so another date can't simply be tried. */
function UnderAge() {
  return (
    <Page screen="agecheck" bar={{ kind: 'none' }} center footer={<Btn label={`Call Childline · ${CHILDLINE.number}`} ghost icon="people" onPress={() => { void Linking.openURL(CHILDLINE.url); }} />}>
      <MarkTile />
      <Display s="{Life is for adults,} for now." style={{ marginTop: space.lg }} />
      <Body s="It works with money, health and food targets in ways that are built for people {18 and over}. We haven’t kept your date of birth." style={{ marginTop: space.sm }} />
      <Body s={`If something’s on your mind, {Childline} is free and confidential, any time: {${CHILDLINE.number}} or ${CHILDLINE.web}.`} style={{ marginTop: space.md }} />
    </Page>
  );
}

/* ───────────────────────── One question at a time ───────────────────────── */

export function QuestionV26() {
  const nav = useNavigation(), { data, set, choose } = useSeed();
  const [open, setOpen] = useState<null | 'want' | 'live' | 'work'>(null);
  const dest = DESTINATIONS.find(x => x.value === data.choices['setup-want']);
  const city = data.choices['setup-city'];
  const work = WORK.find(w => w.value === data.choices['setup-work']);
  return (
    <Page screen="question" bar={{ kind: 'flow', left: 'Back', step: '1 of 3' }} contentStyle={{ flexGrow: 1 }}
      footer={<><Btn label="Next: where you live" onPress={() => nav.go('where')} /><QuietLink label="Or just tell Life" onPress={() => nav.go('tell')} /></>}>
      <View style={styles.centre}>
        <MarkTile />
        <Text variant="title" style={{ marginTop: space.md }}>Welcome to Life</Text>
        <Body s="{What would make the biggest difference this year?}" variant="display" align="center" style={{ marginTop: space.xxs }} />
      </View>
      <View style={{ gap: space.sm }}>
        <PickRow label="I want to" value={dest?.label ?? 'Select'} set={!!dest} onPress={() => setOpen('want')} />
        <PickRow label="I live in" value={city ?? 'Select'} set={!!city} onPress={() => setOpen('live')} />
        <PickRow label="My work is" value={work?.label ?? 'Select'} set={!!work} onPress={() => setOpen('work')} />
      </View>
      <ChoiceDrawer visible={open === 'want'} title="I want to" options={DESTINATIONS} value={dest?.value ?? null} onClose={() => setOpen(null)}
        onPick={v => { set({ profile: { ...data.profile, destination: v } }); choose('setup-want', v); }} />
      <ChoiceDrawer visible={open === 'live'} title="I live in" options={CITIES.map(c => ({ value: c, label: c }))} value={(city as (typeof CITIES)[number]) ?? null} onClose={() => setOpen(null)}
        onPick={v => { set({ profile: { ...data.profile, city: v } }); choose('setup-city', v); }} />
      <ChoiceDrawer visible={open === 'work'} title="My work is" options={WORK} value={work?.value ?? null} onClose={() => setOpen(null)}
        onPick={v => { set({ profile: { ...data.profile, workStatus: v, isBusinessOwner: v === 'sole-trader' || v === 'director' } }); choose('setup-work', v); }} />
    </Page>
  );
}

/* ───────────────────────── Or just tell life ───────────────────────── */

export function TellV26() {
  const nav = useNavigation(), { set, flag } = useSeed();
  const [listening, setListening] = useState(false), [typing, setTyping] = useState(false);
  const [words, setWords] = useState(''), [problem, setProblem] = useState(''), [secs, setSecs] = useState(0);
  useEffect(() => () => { void voice.stop(); }, []);
  useEffect(() => {
    if (!listening) return;
    setSecs(0);
    const id = setInterval(() => setSecs(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [listening]);
  const heard = TELL_TOPICS.map(topic => topic.heard.test(words));
  const count = heard.filter(Boolean).length;
  const review = async (final?: string) => {
    const said = settledTranscript(words, final ?? '');
    if (!said.trim()) return;
    // Distress files nothing and goes straight to Support.
    if (needsSupport(said)) { set({ proposals: [] }); nav.go('support'); return; }
    const result = await records.propose(said);
    set({ proposals: result.data }); flag('records-confirmed', false);
    nav.go('understood', { setup: '1' });
  };
  const mic = async () => {
    setProblem('');
    try {
      if (listening) { const final = await voice.stop(); setListening(false); if (final) setWords(final); await review(final); return; }
      const started = await voice.start((text, final, error) => { setWords(text); if (final || error) setListening(false); if (error) setProblem(error); });
      setListening(started);
    } catch (error) { setListening(false); setProblem(error instanceof Error ? error.message : 'Speech couldn’t start. You can type instead.'); setTyping(true); }
  };
  const on = listening || count > 0;
  return (
    <Page screen="tell" bar={{ kind: 'flow', left: 'Back', action: { kind: 'text', label: typing ? 'Talk instead' : 'Type instead', onPress: () => setTyping(v => !v) } }} contentStyle={{ flexGrow: 1 }}
      footer={typing
        ? <><Btn label="Show me what Life understood" disabled={!words.trim()} onPress={() => { void review(); }} /><Callout center>You’ll see everything it understood before anything is saved.</Callout></>
        : <View style={{ alignItems: 'center', gap: space.sm }}>
          <RoundButton icon="mic" size="xl" solid={listening} haptic="primary" label={listening ? 'Listening. Tap when you’re done' : 'Start talking'} onPress={() => { void mic(); }} />
          <View><Callout center tone="ink">Talk for a minute and Life will set itself up.</Callout><Callout center>You’ll see everything it understood before anything is saved.</Callout></View>
        </View>}>
      <Eyebrow>Faster than questions</Eyebrow>
      <Display s="{Tell Life about you,} in your own words." />
      {typing ? (
        <Field label="Your words" value={words} placeholder="I live in Manchester with my partner, I work as a nurse…" onChangeText={setWords} style={{ marginTop: space.lg }} />
      ) : (
        <View style={styles.stage}>
          <LifeOrb size={116} state={listening ? 'listening' : 'ring'} />
          <Micro sig={listening}>{listening ? `Listening · ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}` : 'Tap to start talking'}</Micro>
        </View>
      )}
      {problem ? <Callout style={{ marginTop: space.sm }}>{problem}</Callout> : null}
      <Between style={{ marginTop: typing ? space.xl : 0 }}><Micro>LIFE SUGGESTS</Micro>{on ? <Micro>{`${count} of ${TELL_TOPICS.length} heard`}</Micro> : null}</Between>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginHorizontal: -space.gutter, marginTop: space.sm }} contentContainerStyle={{ paddingHorizontal: space.gutter, gap: space.tile, paddingBottom: space.xs, alignItems: 'flex-start' }}>
        {TELL_TOPICS.map((topic, k) => (
          <PhotoCard key={topic.title} source={photos[topic.photo]} focal={topic.focal} title={topic.title} size="sm" height={176} style={{ width: 150 }}
            chips={heard[k] ? [{ label: 'Heard', icon: 'check' }] : undefined} accessibilityLabel={`${topic.title}${heard[k] ? ', heard' : ''}`} />
        ))}
      </ScrollView>
    </Page>
  );
}

/* ───────────────────────── Building your plan ───────────────────────── */

export function BuildingV26() {
  const nav = useNavigation(), t = useTokens(), calm = useCalmMotion(), { data, engine } = useSeed();
  const params = useLocalSearchParams<{ state?: string }>();
  const [done, setDone] = useState(params.state === 'done');
  const found = planFound(data.profile, data.completed);
  useEffect(() => { if (done) return; const id = setTimeout(() => { setDone(true); feedback.cleared(); }, calm ? 700 : 2600); return () => clearTimeout(id); }, [done, calm]);
  // Save your progress rises over the finished plan once; when it's answered, the first move follows.
  const asked = !!data.flags['signin-asked'], was = useRef(asked);
  useEffect(() => { if (asked && !was.current) nav.replace('firstmove'); was.current = asked; }, [asked]); // eslint-disable-line react-hooks/exhaustive-deps
  const see = () => { if (!done) { setDone(true); return; } if (asked) nav.replace('firstmove'); else nav.go('signin'); };
  return (
    <Page screen="building" bar={{ kind: 'push', title: 'Building your plan', close: true }}
      footer={<><Btn label="See my plan" ghost={!done} icon={done ? 'arrow' : undefined} trail onPress={see} /><Callout center>Estimates from what you told Life and published rules, not a link to HMRC or the NHS.</Callout></>}>
      <View style={styles.inline}>
        <LifeOrb size={52} state={done ? 'done' : 'working'} />
        <View style={{ flex: 1 }}>
          <Micro>{done ? `${engine.tasks.length > 4 ? 5 : engine.tasks.length} OF 5 CHECKED` : 'CHECKING 5 OF 5'}</Micro>
          <Text variant="title" style={{ marginTop: space.xxs }}>Your monthly costs</Text>
          <Callout>{`Rent, bills, subscriptions${done ? ' · Mapped' : ''}`}</Callout>
        </View>
      </View>
      <Display s={`Found {${money(found.owed)}} you may be owed, {${found.urgent} urgent deadline${found.urgent === 1 ? '' : 's'}} and {${found.setUp} things} to set up.`} />
      <PhotoGrid style={{ marginTop: 14 }}>
        {found.findings.map(f => (
          <PhotoCard key={f.title} source={photos[f.photo]} focal={f.focal} height={150} size="sm" title={f.title} sub={f.sub} onPress={done ? () => nav.go(f.to) : undefined}
            chips={[f.urgent ? { label: f.tag, dot: t.ember } : f.tag]} />
        ))}
      </PhotoGrid>
    </Page>
  );
}

/* ───────────────────────── Where do you live? ───────────────────────── */

/** Only the area is kept: a full postcode keeps its first half. */
const areaOf = (s: string) => {
  const v = s.trim().replace(/\s+/g, ' ');
  const pc = v.toUpperCase().match(/^([A-Z]{1,2}\d[A-Z\d]?)\s*\d[A-Z]{2}$/);
  if (pc) return pc[1];
  return v.replace(/\b\w/g, c => c.toUpperCase());
};

export function WhereV26() {
  const nav = useNavigation(), { data, set, choose } = useSeed();
  const [search, setSearch] = useState(false), [q, setQ] = useState('');
  const typed = q.trim().length > 1 ? areaOf(q) : '';
  const city = typed || data.profile.city;
  const pick = (c: string) => { setQ(''); setSearch(false); set({ profile: { ...data.profile, city: c } }); choose('setup-city', c); };
  const next = () => { if (typed) pick(typed); nav.go('healthconsent'); };
  return (
    <Page screen="where" bar={{ kind: 'flow', left: 'Back', step: '2 of 3' }} contentStyle={{ flexGrow: 1 }} footer={<Btn label="Next: your body" onPress={next} />}>
      <Display s="{Where do you live?}" style={{ marginTop: space.xs }} />
      <Body s="Your area sets {council tax}, your {NHS trust}, {local schemes} and {what homes cost}." style={{ marginTop: space.xs }} />
      <View style={{ flex: 1, minHeight: 20 }} />
      <PhotoCard source={city === 'London' ? photos.terrace : photos.home} height={190} chips={[{ label: 'Your area', icon: 'home' }]} title={city} sub="Only your area is stored, never your exact address." style={{ marginTop: space.md }} />
      <FilterChips wrap options={CITIES.map(c => ({ value: c, label: c }))} value={typed ? null : (CITIES as readonly string[]).includes(data.profile.city) ? data.profile.city as (typeof CITIES)[number] : null} onChange={pick} style={{ marginTop: space.sm }} />
      {search
        ? <Field label="Search a town or postcode" value={q} placeholder="Town, or postcode like SW9 8AB" onChangeText={setQ} style={{ marginTop: space.sm }} />
        : <Press haptic="select" pressScale={0.99} onPress={() => setSearch(true)} accessibilityLabel="Search a town or postcode" style={[styles.search, { marginTop: space.sm }]}><SearchPick /></Press>}
    </Page>
  );
}
function SearchPick() {
  const t = useTokens();
  return <View style={[styles.searchIn, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}><Icon name="search" size={componentSize.iconSm} color={t.inkQuiet} /><Text variant="greeting" tone="quiet">Search a town or postcode</Text></View>;
}

/* ───────────────────────── Health-data consent ───────────────────────── */

/**
 * Health data is special category data under UK GDPR: life asks for a clear, separate yes before it reads or keeps
 * any, records when it was given, and lets you withdraw it here at any time (Settings links here too).
 */
export function HealthconsentV26() {
  const nav = useNavigation(), { data } = useSeed(), consent = useHealthConsent();
  const params = useLocalSearchParams<{ next?: string }>();
  const inSetup = !data.onboardingDone && !params.next;
  const after = () => {
    if (params.next === 'healthprimer') nav.replace('healthprimer');
    else if (params.next) nav.close();
    else nav.go(nextAfterConsent(true));
  };
  const agree = () => { consent.give(inSetup ? 'first open' : params.next === 'healthprimer' || params.next === 'body' ? 'body' : 'settings'); feedback.primary(); after(); };
  const notNow = () => { consent.decline(); if (inSetup) nav.go(nextAfterConsent(false)); else nav.close(); };
  const footer = consent.given
    ? <>{inSetup || params.next ? <Btn label="Continue" onPress={after} /> : null}<QuietLink label="Withdraw my yes" onPress={() => { consent.withdraw(); feedback.select(); }} /></>
    : <><Btn label="I agree" onPress={agree} /><QuietLink label={inSetup ? 'Not now, skip the health parts' : 'Not now'} onPress={notNow} /></>;
  return (
    <Page screen="healthconsent" bar={inSetup ? { kind: 'flow', left: 'Back' } : { kind: 'push', close: true }} footer={footer}>
      <Eyebrow icon="heart">Your health data</Eyebrow>
      {consent.consent
        ? <Display s={`{You said yes} on {${longDate(consent.consent.at)}}.`} />
        : <Display s="Can Life use your {@heart health data}?" />}
      <Body s={consent.consent
        ? 'Life uses the kinds below to plan your day. You can take your yes back here or in Settings, and Life stops using them straight away.'
        : consent.withdrawnAt
          ? `You took your yes back on {${longDate(consent.withdrawnAt)}}. Life isn’t using your health data. Say yes again any time.`
          : 'Health data is special under UK law, so Life asks for a {clear yes} before it reads or keeps any.'} style={{ marginTop: space.sm }} />
      <Micro style={{ marginTop: space.xl }}>WHAT IT COVERS</Micro>
      <RowsCard style={{ marginTop: space.sm }}>
        <Row icon="person" title="Your body numbers" sub="Height, weight and waist, for food targets and healthy ranges" />
        <Row icon="pulse" title="Sleep, heart and workouts" sub={`Only the kinds you switch on, from ${healthName} or what you wear`} />
        <Row icon="food" title="What you log" sub="Meals, moods and your journal, to shape your day" />
      </RowsCard>
      <Micro style={{ marginTop: space.lg }}>WHAT LIFE PROMISES</Micro>
      <RowsCard style={{ marginTop: space.sm }}>
        <Row icon="shield" title="Encrypted, on this phone first" sub="Readings stay on it. Body numbers and meals back up only if you sign in" />
        <Row icon="eyeOff" title="Yours to take back" sub="Withdraw here or in Settings, and Life stops at once" />
      </RowsCard>
      <Callout style={{ marginTop: space.md }}>Never in iCloud, never for ads, never sold. Wellness guidance from your own readings, not a diagnosis. Life keeps a note of your answer and the date, so you can see it here later.</Callout>
    </Page>
  );
}

/* ───────────────────────── Before Apple Health asks ───────────────────────── */

export function HealthprimerV26() {
  const nav = useNavigation(), { data, flag, choose } = useSeed(), consent = useHealthConsent();
  const params = useLocalSearchParams<{ next?: string }>();
  const [types, setTypes] = useState<Record<HealthType, boolean>>(() => ({ ...Object.fromEntries(HEALTH_TYPES.map(h => [h.key, h.on])) as Record<HealthType, boolean>, ...consent.consent?.types }));
  const leave = () => { if (params.next === 'devices' || params.next === 'body') nav.close(); else nav.go('notifprimer'); };
  const go = async () => {
    // Asking here is the explicit, per-type yes (SPEC 9.3): it records the consent with the types switched on.
    if (consent.given) consent.setTypes(types); else consent.give(data.onboardingDone ? 'body' : 'first open', types);
    // The system's own sheet asks next; life reads only the kinds switched on here.
    const allowed = typesAllowed(types);
    if (await phoneHealth.available()) await phoneHealth.requestAccess(allowed);
    flag('health-connected', true); flag(`device-${healthName}`, true);
    readHealthNow();
    HEALTH_TYPES.forEach(h => choose(`health-primer-${h.key}`, types[h.key] ? 'on' : 'off'));
    feedback.primary();
    leave();
  };
  return (
    <Page screen="healthprimer" footer={<><Btn label={consent.given ? 'Continue' : 'I agree, continue'} disabled={!Object.values(types).some(Boolean)} onPress={() => { void go(); }} /><QuietLink label="Not now" onPress={() => { choose('health-permission', 'declined'); leave(); }} /></>}>
      <Display s="Plan around {how you actually slept.}" style={{ marginTop: space.xxs }} />
      <Body s={`Connect ${healthName} and Today gets lighter after a bad night, and harder when you’re ready for it.`} style={{ marginTop: space.xs }} />
      <PhotoGrid style={{ marginTop: space.md }}>
        {HEALTH_TYPES.map(h => (
          <PhotoCard key={h.key} source={photos[h.photo]} focal={h.focal} height={156} size="sm" title={h.title} sub={h.why}
            topRight={<SwitchV26 value={types[h.key]} onChange={v => setTypes(c => ({ ...c, [h.key]: v }))} accessibilityLabel={h.title} />} />
        ))}
      </PhotoGrid>
      <Callout style={{ marginTop: space.sm }}>{`Stays on your phone. Never in iCloud, never for ads. Change it any time in Settings.${consent.given ? '' : ' Continuing is your yes to Life using the kinds switched on.'}`}</Callout>
    </Page>
  );
}

/* ───────────────────────── One nudge a day, at most ───────────────────────── */

export function NotifprimerV26() {
  const nav = useNavigation(), t = useTokens(), { data, pref, flag, choose } = useSeed();
  const quiet = !data.flags['quiet-hours-off'], deadlines = !data.flags['notification-off-deadlines'];
  const next = () => { if (data.onboardingDone) nav.close(); else nav.go('aimnew'); };
  // On a phone the system asks next (Phase 29). Saying no there is remembered, and Settings shows how to turn them on.
  const turnOn = async () => {
    pref('notifications', true); feedback.primary();
    if (notificationsSupported) { const ok = await askNotifications(); choose('notification-permission', ok ? 'granted' : 'declined'); choose('notification-asked', String(Date.now())); }
    next();
  };
  const example = SHOW_SAMPLES ? `You’ve got 20 free minutes. Finish the P87 and ${money(seedTaxClaim.refund)} starts moving.` : 'You’ve got 20 free minutes. Finish the P87 fits.';
  return (
    <Page screen="notifprimer" footer={<><Btn label="Turn on nudges" onPress={() => { void turnOn(); }} /><QuietLink label="Not now" onPress={() => { pref('notifications', false); next(); }} /></>}>
      <View style={[styles.nudgePhoto, { backgroundColor: t.surface2, ...cardShadow(t.scheme) }]}>
        <PhotoFill source={photos.calmdesk} focal={{ y: 0.7 }} />
        <LinearGradient pointerEvents="none" colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} />
        <View style={[styles.nudgeCard, { backgroundColor: t.surface, ...floatLift(t.scheme) }]}>
          <Between><View style={styles.inline}><LifeOrb size={20} /><Text variant="buttonCompact">Life</Text></View><Callout>now</Callout></Between>
          <Text variant="body" style={{ marginTop: 6 }}>{example}</Text>
        </View>
        <Text variant="callout" style={{ color: photo.onPhoto2 }}>An example nudge</Text>
      </View>
      <Display s="Can Life {tap you on the shoulder?}" style={{ marginTop: space.lg }} />
      <Body s="One nudge a day at most, only when it’s worth it. Never between 9pm and 8am." style={{ marginTop: space.xs }} />
      <View style={[styles.card, { marginTop: space.md, backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
        <Between>
          <View><Text variant="title">Quiet hours</Text><Callout>21:00–08:00</Callout></View>
          <SwitchV26 value={quiet} onChange={v => flag('quiet-hours-off', !v)} accessibilityLabel="Quiet hours" />
        </Between>
        <View style={styles.hours} accessible accessibilityLabel="Quiet from 21:00 to 08:00, one nudge at about 13:00">
          {Array.from({ length: 24 }, (_, h) => <View key={h} style={{ flex: 1, borderRadius: 1, backgroundColor: h === 13 ? t.ember : quiet && (h < 8 || h >= 21) ? t.surface3 : t.ink }} />)}
        </View>
        <View style={styles.hourLabels}>
          <Text variant="micro" tone="quiet" style={[styles.hourLabel, { left: '33.3%' }]}>08:00</Text>
          <Text variant="micro" style={[styles.hourLabel, { left: '56.3%', color: t.emberText }]}>1 nudge</Text>
          <Text variant="micro" tone="quiet" style={[styles.hourLabel, { left: '87.5%' }]}>21:00</Text>
        </View>
        <Between style={{ marginTop: space.md }}>
          <Text variant="title">Deadlines under 24 hours</Text>
          <SwitchV26 value={deadlines} onChange={v => flag('notification-off-deadlines', !v)} accessibilityLabel="Deadline alerts" />
        </Between>
      </View>
    </Page>
  );
}

/* ───────────────────────── Before the mic asks ───────────────────────── */

export function MicprimerV26() {
  const nav = useNavigation(), { flag, choose } = useSeed();
  const [problem, setProblem] = useState('');
  const allow = async () => {
    setProblem('');
    try { await voice.requestPermission(); flag('mic-preview', true); nav.replace('talk'); }
    catch (error) {
      // Sample builds without speech (the web preview) still show Talk, which plays its labelled sample so the filing can be seen.
      const caps = await voice.capabilities().catch(() => null);
      if (SHOW_SAMPLES && !caps?.speechAvailable) { flag('mic-preview', true); nav.replace('talk'); return; }
      setProblem(error instanceof Error ? error.message : 'Microphone access is unavailable. You can type instead.');
    }
  };
  return (
    <Page screen="micprimer" contentStyle={{ flexGrow: 1 }} footer={<><Btn label="Allow the microphone" icon="mic" onPress={() => { void allow(); }} /><QuietLink label="I’ll type instead" onPress={() => { choose('mic-permission', 'declined'); nav.replace('chat'); }} /></>}>
      <View style={styles.bigOrb}><LifeOrb size={220} state="listening" /></View>
      <Eyebrow icon="mic">Before the mic asks</Eyebrow>
      <Display s="{Talk to Life,} out loud." />
      <Body s="Life only listens {while you’re talking to it}. Your voice becomes {text on your phone} where it can, and the recording is {never kept}." style={{ marginTop: space.xs }} />
      {problem ? <Callout tone="ink" style={{ marginTop: space.sm }}>{problem}</Callout> : null}
    </Page>
  );
}

/* ───────────────────────── Before the camera asks ───────────────────────── */

const CAMERA_USES: { photo: keyof typeof photos; focal: { y: number }; title: string; sub: string }[] = [
  { photo: 'food', focal: { y: 0.5 }, title: 'Meals', sub: 'Calories and protein in a snap' },
  { photo: 'letter', focal: { y: 0.9 }, title: 'Letters and payslips', sub: 'Dates, amounts, what to do' },
  { photo: 'label', focal: { y: 0.8 }, title: 'Barcodes', sub: 'Exact food labels' },
];
const CAMERA_TARGETS: ScreenKey[] = ['snap', 'barcode', 'labelscan', 'scan'];

export function CamprimerV26() {
  const nav = useNavigation(), t = useTokens(), insets = useSafeAreaInsets(), drawer = useDrawerPhoto(), { flag, choose } = useSeed();
  const params = useLocalSearchParams<{ next?: string }>();
  const target = (CAMERA_TARGETS as string[]).includes(params.next ?? '') ? params.next as ScreenKey : 'snap';
  const kcal = seedMeal.reduce((s, i) => s + i.kcal, 0), protein = seedMeal.reduce((s, i) => s + i.protein, 0);
  const allow = async () => {
    let granted = true;
    try { granted = (await ImagePicker.requestCameraPermissionsAsync()).granted; } catch { /* the web preview has no camera prompt */ }
    if (granted) { flag('camera-preview', true); choose('camera-permission', ''); } else choose('camera-permission', 'declined');
    feedback.primary();
    nav.replace(target);
  };
  return (
    <Page screen="camprimer" scroll={false} contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
      backdrop={<View pointerEvents="none" style={[StyleSheet.absoluteFill, { bottom: undefined, height: drawer.height ?? 392 }]}><PhotoFill source={photos.food} focal={{ y: 0.56 }} /><LinearGradient colors={photoScrims.fade.colors} locations={photoScrims.fade.locations} style={StyleSheet.absoluteFill} /></View>}
      bar={{ kind: 'photo', left: <Chip label="Before the camera asks" icon="camera" onPhoto /> }}>
      <View style={styles.finder}>
        <Corners />
        <View style={{ position: 'absolute', left: space.gutter, right: space.gutter, bottom: space.md }}>
          <Micro onPhoto>WHAT LIFE WOULD READ · AN EXAMPLE</Micro>
          <View style={[styles.inline, { gap: 6, marginTop: space.xs, flexWrap: 'wrap' }]}>
            <Chip label="Salmon rice bowl" onPhoto /><Chip label={`${kcal} kcal`} onPhoto /><Chip label={`${protein}g protein`} onPhoto />
          </View>
        </View>
      </View>
      <View onLayout={drawer.onLayout} style={[drawerStyle, styles.drawer, { backgroundColor: t.surface, paddingBottom: Math.max(insets.bottom, space.md) + space.xxs }]}>
        <Display s="Snap it, and {Life reads it.}" flush />
        <View style={{ marginTop: space.xs }}>{CAMERA_USES.map(u => <Row key={u.title} photo={photos[u.photo]} thumbFocal={u.focal} title={u.title} sub={u.sub} />)}</View>
        <Callout style={{ marginTop: space.sm }}>Photos are read, then deleted unless you keep them.</Callout>
        <Btn label="Allow the camera" onPress={() => { void allow(); }} style={{ marginTop: space.sm }} />
        <QuietLink label="Not now" onPress={() => { choose('camera-permission', 'declined'); nav.close(); }} style={{ marginTop: 10 }} />
      </View>
    </Page>
  );
}

/** The four corners of a viewfinder (board `.fo-c`). */
export function Corners({ inset = 28, bottom = 76, top = 8 }: { inset?: number; bottom?: number; top?: number }) {
  const c = (pos: object, rot: string) => (
    <View pointerEvents="none" style={[styles.corner, pos, { transform: [{ rotate: rot }] }]}>
      <View style={[styles.cornerH, { backgroundColor: photo.onPhoto }]} /><View style={[styles.cornerV, { backgroundColor: photo.onPhoto }]} />
    </View>
  );
  return <>{c({ left: inset, top }, '0deg')}{c({ right: inset, top }, '90deg')}{c({ right: inset, bottom }, '180deg')}{c({ left: inset, bottom }, '270deg')}</>;
}

/* ───────────────────────── Before the calendar asks ───────────────────────── */

export function CalprimerV26() {
  const nav = useNavigation(), t = useTokens(), { flag, choose } = useSeed();
  const busy = <View style={[styles.busy, { backgroundColor: t.surface2 }]}><Text variant="label" tone="ink2">Busy</Text></View>;
  // On a phone the system asks next, read only (Phase 29). The web preview keeps the board's sample day.
  const allow = async () => {
    feedback.primary();
    if (calendarSupported) {
      const ok = await askCalendar();
      choose('calendar-permission', ok ? 'granted' : 'declined');
      if (!ok) { nav.close(); return; }
    }
    flag('calendar-preview', true);
    nav.replace('calendar');
  };
  return (
    <Page screen="calprimer" footer={<><Btn label="Allow calendar access" onPress={() => { void allow(); }} /><QuietLink label="Not now" onPress={() => { choose('calendar-permission', 'declined'); nav.close(); }} /></>}>
      <View style={{ alignItems: 'flex-start' }}><MarkTile icon="calendar" /></View>
      <Display s="Nudges that {fit your day.}" style={{ marginTop: space.md }} />
      <Body s="Life looks at {when you’re busy}, never at what the meeting is about, and {never changes your calendar}." style={{ marginTop: space.xs }} />
      <View style={[styles.card, { marginTop: space.lg, backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
        <Between><Micro>WHAT LIFE SEES</Micro><Micro>READ ONLY</Micro></Between>
        <Timeline style={{ marginTop: space.sm }} items={[
          { when: '09:00', text: '', state: 'done', children: busy },
          { when: '13:40', text: '', state: 'now', children: <Between><Text variant="rowTitle">20 free minutes</Text><Chip label="Nudge here" tone="live" /></Between> },
          { when: '14:00', text: '', state: 'done', children: busy },
        ]} />
      </View>
    </Page>
  );
}

/* ───────────────────────── Connect what you wear ───────────────────────── */

const WEAR: { key: string; icon: GlyphName; title: string; sub: string; action: string }[] = [
  { key: 'Apple Watch', icon: 'watch', title: 'Apple Watch', sub: 'via Apple Health', action: 'Connect Apple Watch' },
  { key: 'Oura ring', icon: 'circle', title: 'Oura ring', sub: 'Oura account', action: 'Connect Oura ring' },
  { key: 'WHOOP', icon: 'pulse', title: 'WHOOP', sub: 'WHOOP account', action: 'Connect WHOOP' },
  { key: 'Other', icon: 'fitness', title: 'Garmin, Fitbit, Polar…', sub: `via ${Platform.OS === 'android' ? 'Health Connect' : 'Apple Health or Health Connect'}`, action: `Connect through ${healthName}` },
  { key: 'phone', icon: 'walk', title: 'Just my phone', sub: 'Steps and sleep estimates', action: 'Carry on with my phone' },
];

export function DevicesetupV26() {
  const nav = useNavigation(), t = useTokens(), insets = useSafeAreaInsets(), drawer = useDrawerPhoto(), { data, choose } = useSeed(), consent = useHealthConsent();
  const [k, setK] = useState(Math.max(0, WEAR.findIndex(w => w.key === (data.choices['setup-device'] ?? 'Apple Watch'))));
  const next = () => { choose('setup-device', WEAR[k].key); feedback.primary(); nav.go(consent.allowed ? 'healthprimer' : 'notifprimer'); };
  return (
    <Page screen="devicesetup" scroll={false} contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
      backdrop={<View pointerEvents="none" style={[StyleSheet.absoluteFill, { bottom: undefined, height: drawer.height ?? 400 }]}><PhotoFill source={photos.run} focal={{ y: 0.3 }} /></View>}
      bar={{ kind: 'flow', left: 'Back', action: { kind: 'text', label: 'Skip', onPress: () => nav.go('notifprimer') } }}>
      <View style={{ flex: 1, minHeight: 150, paddingHorizontal: space.gutter, paddingTop: space.xxs }}>
        <Display s="{Do you wear anything?}" onPhoto flush />
      </View>
      <View onLayout={drawer.onLayout} style={[drawerStyle, styles.drawer, { paddingTop: 18, backgroundColor: t.surface, paddingBottom: Math.max(insets.bottom, space.md) + space.xxs }]}>
        <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} showsVerticalScrollIndicator={false}>
          <Callout>Life reads sleep, heart rate and workouts from it. You can add more later.</Callout>
          <View style={{ marginTop: 6 }}>
            {WEAR.map((w, n) => <Row key={w.key} icon={w.icon} title={w.title} sub={w.sub} haptic="select" right={<Pick on={n === k} />} onPress={() => setK(n)} />)}
          </View>
        </ScrollView>
        <Btn label={WEAR[k].action} onPress={next} style={{ marginTop: space.sm }} />
        <Callout center style={{ marginTop: 10 }}>Anything connected starts building your personal baseline tonight.</Callout>
      </View>
    </Page>
  );
}

/* ───────────────────────── Your first move (a moment) ───────────────────────── */

export function FirstmoveV26() {
  const nav = useNavigation(), { set } = useSeed();
  const finish = () => { set({ onboardingDone: true }); nav.home(); };
  const doIt = () => { set({ onboardingDone: true }); nav.home(); nav.go('taxcheck', { state: 'code' }); };
  return (
    <Page screen="firstmove" scroll={false} contentStyle={{ justifyContent: 'flex-end' }}
      backdrop={<PhotoBackdropFull />}
      bar={{ kind: 'photo', left: <Wordmark variant="headline" color={photo.onPhoto} />,
        right: <Press haptic="select" onPress={finish} accessibilityLabel="Close" hitSlop={4} style={[styles.round, { backgroundColor: photo.fill }]}><Icon name="close" size={componentSize.iconSm} color={photo.onPhoto} /></Press> }}
      footer={<><Btn label="Do it now" icon="arrow" trail onPhoto onPress={doIt} /><PaperLink label="Go to Today" onPress={finish} /></>}>
      <Chip label="Your first move · 2 minutes" icon="clock" onPhoto />
      <Text variant="welcome" tone="paper" accessibilityRole="header" style={{ marginTop: 14 }}>Start with two minutes.</Text>
      <TwoTone size="welcomeStatement" onAtmosphere segments={two('{Check your tax code.} Your payslip shows an emergency code, so you might be {owed money}.')} style={{ marginTop: space.sm }} />
    </Page>
  );
}
function PhotoBackdropFull() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <PhotoFill source={photos.payslip} settle />
      <LinearGradient colors={photoScrims.fade.colors} locations={photoScrims.fade.locations} style={StyleSheet.absoluteFill} />
    </View>
  );
}

/* ───────────────────────── Your body, in three numbers ───────────────────────── */

type Measure = 'h' | 'w' | 's';
const ORDER: Measure[] = ['h', 'w', 's'];
const NAMES: Record<Measure, string> = { h: 'Height', w: 'Weight', s: 'Waist' };
/** Where each stepper starts before a number is given (cm, kg, cm). Never saved unless the person keeps it. */
const START: Record<Measure, number> = { h: 170, w: 70, s: 85 };

export function MeasuresetupV26() {
  const nav = useNavigation(), t = useTokens(), { data, set, choose } = useSeed();
  const [active, setActive] = useState<Measure>('h');
  const imperial = data.choices.units === 'Imperial';
  // A real account starts with no body numbers (0): the steppers start from a typical figure until one is given.
  const given = (m: Measure) => (m === 'h' ? data.heightCm : m === 'w' ? data.weightKg : data.waistCm) > 0;
  const metric = (m: Measure) => (m === 'h' ? data.heightCm : m === 'w' ? data.weightKg : data.waistCm) || START[m];
  const shown = (m: Measure) => {
    const v = metric(m);
    if (m === 'h') return imperial ? { value: Math.round(v / 2.54), unit: 'in', min: 48, max: 90, fmt: (n: number) => `${Math.floor(n / 12)}ft ${n % 12}` } : { value: Math.round(v), unit: 'cm', min: 120, max: 230, fmt: String };
    if (m === 'w') return imperial ? { value: Math.round(v * 2.20462), unit: 'lb', min: 66, max: 550, fmt: (n: number) => `${Math.floor(n / 14)}st ${n % 14}` } : { value: Math.round(v), unit: 'kg', min: 30, max: 250, fmt: String };
    return imperial ? { value: Math.round(v / 2.54), unit: 'in', min: 20, max: 70, fmt: String } : { value: Math.round(v), unit: 'cm', min: 50, max: 180, fmt: String };
  };
  const change = (m: Measure, n: number) => {
    if (m === 'h') set({ heightCm: imperial ? n * 2.54 : n });
    else if (m === 'w') set({ weightKg: imperial ? n / 2.20462 : n });
    else set({ waistCm: imperial ? n * 2.54 : n });
  };
  const now = shown(active);
  const next = () => {
    // Continue keeps the height and weight on screen; the waist is optional, so only a changed one is kept.
    if (!given(active) && active !== 's') change(active, now.value);
    const i = ORDER.indexOf(active); if (i < ORDER.length - 1) setActive(ORDER[i + 1]); else nav.go('devicesetup');
  };
  return (
    <Page screen="measuresetup" bar={{ kind: 'flow', left: 'Back', action: { kind: 'text', label: 'Skip', onPress: () => nav.go('devicesetup') } }} footer={<Btn label="Continue" onPress={next} />}>
      <Eyebrow>Your body</Eyebrow>
      <Display s="Your body, in {three numbers.}" />
      <Body s="So food targets and health ranges fit you, not an average person." style={{ marginTop: space.xs }} />
      <SegmentedV26 options={[{ value: 'Metric', label: 'Metric' }, { value: 'Imperial', label: 'Imperial' }]} value={imperial ? 'Imperial' : 'Metric'} onChange={v => choose('units', v)} style={{ marginTop: space.md }} />
      <TintCard area="health" style={{ marginTop: space.sm }}>
        <Between><Micro>{`${NAMES[active].toUpperCase()}${active === 's' ? ' · OPTIONAL' : ''}`}</Micro><Micro>{`${ORDER.indexOf(active) + 1} OF 3`}</Micro></Between>
        <View style={{ marginTop: space.sm }}>
          <CompactStepper value={now.value} onChange={n => change(active, n)} min={now.min} max={now.max} unit={now.unit} label={NAMES[active]} format={now.fmt} />
        </View>
        <View style={styles.tape} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {Array.from({ length: 41 }, (_, k) => {
            const here = k === 20, five = (now.value - 20 + k) % 5 === 0;
            return <View key={k} style={{ width: here ? 3 : 2, height: here ? 28 : five ? 18 : 10, borderRadius: 1, backgroundColor: here ? t.ember : five ? t.ink2 : t.inkQuiet }} />;
          })}
        </View>
      </TintCard>
      <TileGrid style={{ marginTop: 10 }}>
        {ORDER.filter(m => m !== active).map(m => {
          const s = shown(m);
          return <V26Tile key={m} label={NAMES[m]} scale={m === 's' ? 'optional' : undefined} value={given(m) ? s.fmt(s.value) : 'Add'} unit={given(m) ? s.unit : undefined} onPress={() => setActive(m)} style={{ minHeight: 0 }} />;
        })}
      </TileGrid>
    </Page>
  );
}

/* ───────────────────────── Save your progress (a sheet) ───────────────────────── */

export function SigninV26() {
  const nav = useNavigation(), { data, flag, joinAccount } = useSeed();
  const [step, setStep] = useState<'ways' | 'email' | 'code'>('ways');
  const [email, setEmail] = useState(''), [code, setCode] = useState('');
  const [busy, setBusy] = useState(false), [problem, setProblem] = useState<string | null>(null);
  const android = Platform.OS === 'android';
  const emailOk = /^\S+@\S+\.\S+$/.test(email.trim());
  const finish = () => { flag('signin-asked', true); nav.close(); };
  // Saving progress keeps what was set up on this phone and merges it into the account.
  const signedIn = async (result: { mode: 'account' | 'local-preview'; data: { userId: string } }) => {
    if (result.mode === 'account') await joinAccount(result.data.userId, { restore: false });
    flag(result.mode === 'account' ? 'signed-in' : 'signed-in-preview', true); feedback.primary(); finish();
  };
  const go = (next: typeof step) => { setProblem(null); setStep(next); };
  const askCode = async () => {
    if (!emailOk || busy) return;
    setBusy(true); setProblem(null);
    const sent = await sendCode(email);
    setBusy(false);
    if (sent.ok) { setCode(''); setStep('code'); feedback.select(); } else { setProblem(problemWords[sent.problem]); feedback.warn(); }
  };
  const checkCode = async () => {
    if (busy) return;
    setBusy(true); setProblem(null);
    const result = await verifyCode(email, code);
    setBusy(false);
    if (result.ok) await signedIn(result); else { setProblem(problemWords[result.problem]); feedback.warn(); }
  };
  const withProvider = async (provider: 'apple' | 'google') => {
    if (busy) return;
    setBusy(true); setProblem(null);
    const result = await signInWith(provider);
    setBusy(false);
    if (result.ok) { await signedIn(result); return; }
    setProblem(problemWords[result.problem]);
    if (result.problem === 'not-ready') setStep('email');
  };
  const note = problem ? <Callout style={{ marginTop: space.sm }}>{problem}</Callout> : null;
  return (
    <Page screen="signin" bar={{ kind: 'sheet', title: 'Save your progress' }}>
      {step === 'code' ? <>
        <Statement s={`{Check your email.} We sent a six-digit code to ${email.trim()}.`} />
        <Field label="Code" testID="signin-code" value={code} placeholder="123456" onChangeText={text => setCode(text.replace(/\D/g, '').slice(0, 6))} keyboardType="numeric" autoComplete="one-time-code" maxLength={6} style={{ marginTop: space.lg }} />
        <Btn label="Sign in" disabled={busy || code.length !== 6} onPress={() => { void checkCode(); }} style={{ marginTop: space.sm }} />
        {note}
        <View style={[styles.inline, { justifyContent: 'center', gap: space.lg, marginTop: space.sm }]}>
          <QuietLink label="Send a new code" onPress={() => { void askCode(); }} />
          <QuietLink label="Change email" onPress={() => go('email')} />
        </View>
      </> : <>
        <Wordmark variant="callout" tone="ink2" style={{ marginBottom: space.xs }} />
        <Statement s="{Keep your plan safe.} Sign in so it survives a new phone." />
        <Body s="Life backs up your plan, body numbers and meals, encrypted. Readings stay on this phone, and Life never sells your data." style={{ marginTop: space.xs }} />
        {step === 'email' ? <>
          <Field label="Your email" testID="signin-email" value={email} placeholder="you@example.com" onChangeText={setEmail} keyboardType="email-address" autoComplete="email" style={{ marginTop: space.lg }} />
          <Btn label="Send me a code" disabled={busy || !emailOk} onPress={() => { void askCode(); }} style={{ marginTop: space.sm }} />
          {note}
          <QuietLink label="Back to other ways" onPress={() => go('ways')} style={{ marginTop: space.sm }} />
        </> : <>
          <Btn label={android ? 'Continue with Google' : 'Continue with Apple'} disabled={busy} onPress={() => { void withProvider(android ? 'google' : 'apple'); }} style={{ marginTop: space.lg }} />
          {note}
          <Micro center style={{ marginTop: space.md }}>OR CONTINUE WITH</Micro>
          <View style={[styles.inline, { gap: space.xs, marginTop: space.xs }]}>
            {android ? null : <View style={{ flex: 1 }}><Btn label="Google" ghost disabled={busy} onPress={() => { void withProvider('google'); }} /></View>}
            <View style={{ flex: 1 }}><Btn label="Email" ghost disabled={busy} onPress={() => go('email')} /></View>
          </View>
        </>}
      </>}
      <QuietLink label={data.onboardingDone ? 'Not now' : 'Not now, keep it on this phone'} ink onPress={finish} style={{ marginTop: 18 }} />
    </Page>
  );
}

/* ───────────────────────── Shared ───────────────────────── */


const styles = StyleSheet.create({
  tile: { width: componentSize.roundXl, height: componentSize.roundXl, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  pick: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  centre: { flex: 1, minHeight: 240, alignItems: 'center', justifyContent: 'center', gap: 6, paddingBottom: space.lg },
  dob: { flexDirection: 'row', gap: space.xs, marginTop: space.lg },
  stage: { flex: 1, minHeight: 148, alignItems: 'center', justifyContent: 'center', gap: space.sm, paddingVertical: space.md },
  inline: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  search: { borderRadius: radius.lg },
  searchIn: { height: 56, borderRadius: radius.lg, flexDirection: 'row', alignItems: 'center', gap: space.xs, paddingHorizontal: 18 },
  nudgePhoto: { height: 196, borderRadius: radius.photo, overflow: 'hidden', padding: space.md, justifyContent: 'space-between' },
  nudgeCard: { borderRadius: radius.lg, padding: space.md },
  card: { borderRadius: radius.lg, padding: space.cardPad },
  hours: { flexDirection: 'row', gap: 3, height: 16, marginTop: space.sm },
  hourLabels: { position: 'relative', height: 14, marginTop: 6 },
  hourLabel: { position: 'absolute', top: 0, transform: [{ translateX: -18 }] },
  bigOrb: { flex: 1, minHeight: 220, alignItems: 'center', justifyContent: 'center' },
  finder: { flex: 1, minHeight: 200 },
  drawer: { paddingHorizontal: space.gutter, paddingTop: 22 },
  corner: { position: 'absolute', width: 26, height: 26 },
  cornerH: { position: 'absolute', left: 0, top: 0, width: 26, height: 3, borderRadius: 2 },
  cornerV: { position: 'absolute', left: 0, top: 0, width: 3, height: 26, borderRadius: 2 },
  busy: { height: 36, borderRadius: 12, justifyContent: 'center', paddingHorizontal: 14, marginTop: 2 },
  tape: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: 28, marginTop: space.md },
  round: { width: componentSize.round, height: componentSize.round, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
});
