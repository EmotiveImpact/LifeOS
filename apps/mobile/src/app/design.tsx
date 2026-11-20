import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { Redirect, useLocalSearchParams } from 'expo-router';
import { TrackAGallery } from '@/design/TrackAGallery';
import { V26Gallery } from '@/design/V26Gallery';
import { FullDrawingGallery } from '@/design/FullDrawingGallery';
import { PlatformGallery } from '@/screens/PlatformGallery';
import { Icon as Ionicons } from '@/design/Icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  space,
  componentSize,
  Icon,
  ActivityTimeline,
  AttachMenu,
  BigMic,
  ChangeSummary,
  Checklist,
  ChipGroup,
  Composer,
  ControlRow,
  CountStepper,
  FileCard,
  FilingTray,
  FoodItemRow,
  HabitRow,
  InsightCard,
  IntroCarousel,
  LifeReply,
  ListRow,
  MetricTile,
  MiniBars,
  NewTag,
  RangeBar,
  RecordRow,
  Ridge,
  RowGroup,
  Segmented,
  Slider,
  StageBar,
  Toggle,
  ToolTile,
  Transcript,
  UserBubble,
  Waveform,
  Button,
  Callout,
  CapsuleMeter,
  Card,
  ChoiceCard,
  Countdown,
  Dock,
  DottedOrb,
  LifeOrb,
  type OrbState,
  ImageTreatment,
  LedgerRow,
  MetricRow,
  MoneyFigure,
  Mono,
  NextMoveCard,
  NudgeCard,
  PeekHeader,
  PeekStack,
  PhotoChip,
  PromptBanner,
  PulseCheckIn,
  RollingNumeral,
  SchemeProvider,
  Sheet,
  SheetProvider,
  StageStepper,
  StatusPill,
  Text,
  Ticks,
  TwoTone,
  WeekStrip,
  storyImage,
  useLifeFonts,
  useTokens,
  type Look,
  type Mood,
  type Scheme,
  type SheetHandle,
} from '@/design';

/**
 * Dev-only design gallery (DESIGN.md §6, §12). Every component, with realistic life content,
 * in light, dark or both side by side. Open at /design in a dev build.
 */
export default function DesignGallery() {
  const loaded = useLifeFonts();
  // `?only=v26` shows just the V26 gallery (Phase 13 review); `?scheme=light|dark|both` picks the starting scheme.
  const params = useLocalSearchParams<{ only?: string; scheme?: string }>();
  const onlyV26 = params.only === 'v26';
  const [mode, setMode] = useState<'light' | 'dark' | 'both'>(params.scheme === 'light' || params.scheme === 'both' ? params.scheme : 'dark');
  const [look, setLook] = useState<Look>('p1');
  const { width } = useWindowDimensions();
  if (!__DEV__) return <Redirect href="/" />;
  if (!loaded) return null;
  const schemes: Scheme[] = mode === 'both' ? ['light', 'dark'] : [mode];
  const side = mode === 'both' && width >= 820;
  return (
    <SheetProvider>
      <SchemeProvider scheme={mode === 'light' ? 'light' : 'dark'}>
        <Toolbar mode={mode} setMode={setMode} look={look} setLook={setLook} />
      </SchemeProvider>
      <ScrollView contentContainerStyle={{ flexDirection: side ? 'row' : 'column' }}>
        {schemes.map((s) => (
          <SchemeProvider key={s} scheme={s}>
            <View style={side ? { flex: 1 } : undefined}>
              <V26Heading />
              <V26Gallery />
              {onlyV26 ? null : <Column look={look} />}
            </View>
          </SchemeProvider>
        ))}
      </ScrollView>
    </SheetProvider>
  );
}

function Toolbar({ mode, setMode, look, setLook }: { mode: string; setMode: (m: 'light' | 'dark' | 'both') => void; look: Look; setLook: (l: Look) => void }) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const seg = (items: [string, string][], value: string, on: (v: string) => void) => (
    <View style={{ flexDirection: 'row', backgroundColor: t.surface2, borderRadius: 10, padding: 3 }}>
      {items.map(([k, label]) => (
        <Text
          key={k}
          variant="callout"
          onPress={() => on(k)}
          style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 7, overflow: 'hidden', backgroundColor: value === k ? t.surface3 : 'transparent' }}
          tone={value === k ? 'ink' : 'ink2'}
        >
          {label}
        </Text>
      ))}
    </View>
  );
  return (
    <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 10, gap: 8, backgroundColor: t.canvas }}>
      <Text variant="headline">life · design gallery</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {seg([['light', 'Light'], ['dark', 'Dark'], ['both', 'Both']], mode, (v) => setMode(v as 'light' | 'dark' | 'both'))}
        {seg([['p1', 'Look 1'], ['p2', 'Look 2'], ['p3', 'Look 3'], ['places', 'Places']], look, (v) => setLook(v as Look))}
      </View>
    </View>
  );
}

/** Phase 13: the V26 pieces come first, before the earlier galleries. */
function V26Heading() {
  const t = useTokens();
  return (
    <View nativeID="v26-top" style={{ backgroundColor: t.canvas, paddingHorizontal: 20, paddingTop: 28, gap: 4 }}>
      <Text variant="headline">V26 · the board’s design system</Text>
      <Callout tone="ink2">Every new and extended piece, with its states, in board copy. The earlier galleries follow below.</Callout>
    </View>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ gap: 12 }}>
      <Mono tone="ink2">{title}</Mono>
      {children}
    </View>
  );
}

function Column({ look, style }: { look: Look; style?: object }) {
  const t = useTokens();
  const sheet = useRef<SheetHandle>(null);
  const [day, setDay] = useState(new Date());
  const [stage, setStage] = useState(1);
  const [choice, setChoice] = useState(0);
  const [hidden, setHidden] = useState(false);
  const [saved, setSaved] = useState(false);
  const [score, setScore] = useState(72);
  const [scrub, setScrub] = useState(40);
  const [tab, setTab] = useState('today');
  const [mood, setMood] = useState<Mood | null>(null);
  const soon = new Date(Date.now() + 75 * 60 * 1000);
  const later = new Date(Date.now() + 4 * 24 * 3600 * 1000);

  return (
    <View style={[{ backgroundColor: t.canvas, padding: 20, gap: 36, paddingBottom: 160 }, style]}>
      <Section title="Original calmer mockup · exact SVG icons">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.lg }}>{(['home', 'layers', 'person', 'mic', 'search', 'bell', 'chev', 'arrow', 'doc', 'gift', 'heart', 'book', 'spark', 'check', 'gear', 'wallet'] as const).map(name => <View key={name} style={{ minWidth: componentSize.row, alignItems: 'center', gap: space.xs }}><Icon name={name} /><Text variant="micro" tone="ink2">{name}</Text></View>)}</View>
        <View style={{ flexDirection: 'row', gap: space.xs }}><ToolTile compact title="Cash plan" icon="wallet-outline" /><ToolTile compact title="Documents" icon="document-text-outline" /></View>
      </Section>
      <FullDrawingGallery />
      <TrackAGallery />
      <PlatformGallery />
      <Section title="type">
        <RollingNumeral value={2340} size="xl" />
        <Text variant="titleSerif">Things to know</Text>
        <TwoTone segments={[{ text: 'Nothing urgent — ', tone: 'quiet' }, { text: 'your rebate ' }, { text: 'needs ', tone: 'quiet' }, { text: 'one form.' }]} />
        <Text variant="headline">HMRC tax rebate</Text>
        <Text variant="title">Book your heart referral</Text>
        <Text variant="body">Claim by bank transfer, not cheque. It's usually paid within five working days.</Text>
        <Callout tone="ink2">Takes 6 min · From your talk · 12 Nov</Callout>
        <Mono>P800-7Q2-K41 · 08:30</Mono>
      </Section>

      <Section title="pulse (dot field, §40)">
        <PulseCheckIn onChange={setMood} />
      </Section>

      <Section title="V22 · one useful next move">
        <NextMoveCard source={storyImage(look, 'calm')} title="HMRC tax rebate" description="One form left · takes 6 min" onPress={() => {}} />
      </Section>

      <Section title={`imagery · look ${look} · follows the pulse`}>
        <ImageTreatment kind="card" source={storyImage(look, mood?.moment ?? 'calm')} height={260}>
          <PhotoChip>
            <Text variant="micro" tone="paper">{`Feeling ${mood?.id ?? 'calm'}`}</Text>
          </PhotoChip>
          <Text variant="headline" tone="paper">A clear head today.</Text>
        </ImageTreatment>
        <View style={{ height: 300, borderRadius: 20, overflow: 'hidden' }}>
          <ImageTreatment kind="band" source={storyImage(look, 'home')} height={300}>
            <View style={{ position: 'absolute', left: 16, bottom: 20, gap: 4 }}>
              <Callout tone="paper2">Your Aim · 24% there</Callout>
              <Text variant="titleSerif" tone="paper">Your own front door.</Text>
            </View>
          </ImageTreatment>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['drained', 'calm', 'driven', 'home'] as const).map((m) => (
            <View key={m} style={{ flex: 1, aspectRatio: 2 / 3, borderRadius: 12, overflow: 'hidden' }}>
              <ImageTreatment kind="card" source={storyImage(look, m)} height={undefined} style={{ height: '100%', borderRadius: 12 }}>
                <Text variant="micro" tone="paper">{m}</Text>
              </ImageTreatment>
            </View>
          ))}
        </View>
      </Section>

      <Section title="buttons">
        <Button label="Book appointment" onPress={() => {}} />
        <Button label="Copy draft" variant="secondary" icon="copy-outline" onPress={() => {}} />
        <Button label="Not this week" variant="link" onPress={() => {}} />
      </Section>

      <Section title="status · countdown">
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <StatusPill kind="live" label="One form left" />
          <StatusPill kind="done" label="Cleared" />
          <StatusPill label="Level 2" />
        </View>
        <View style={{ flexDirection: 'row', gap: 16 }}>
          <Countdown to={soon} />
          <Countdown to={later} />
        </View>
      </Section>

      <Section title="cards">
        <Card onPress={() => {}} accessibilityLabel="HMRC tax rebate">
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text variant="title">HMRC tax rebate</Text>
              <StatusPill kind="live" label="Submitted" />
            </View>
            <Ticks count={28} filled={16} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Callout tone="ink2">Est. £840</Callout>
              <Countdown to={soon} />
            </View>
          </View>
        </Card>
        <MetricRow items={[{ label: 'This week', value: '3 / 5' }, { label: 'Value found', value: '£2,340', tone: 'gain' }, { label: 'On time', value: '92%' }]} />
      </Section>

      <Section title="ticks · meter · stepper">
        <Ticks count={30} filled={4} variant="streak" accessibilityLabel="Day streak 4 of 30" />
        <CapsuleMeter value={score / 100} caption="Your money admin is looking good" />
        <Button label="Add 6 to score" variant="secondary" onPress={() => setScore((s) => Math.min(100, s + 6))} />
        <StageStepper stages={[{ label: 'Started', timestamp: '12 Nov' }, { label: 'Submitted', timestamp: 'Today' }, { label: 'Cleared', timestamp: '~22 Nov' }]} current={stage} />
        <Button label={stage < 3 ? 'Advance stage' : 'Reset'} variant="secondary" onPress={() => setStage((s) => (s < 3 ? s + 1 : 1))} />
      </Section>

      <Section title="money">
        <MoneyFigure value={2340.5} delta={{ pct: 12.4, abs: 260.2, label: 'this month' }} hidden={hidden} onToggleHidden={() => setHidden((h) => !h)} />
        <Ticks count={41} variant="scrubber" activeIndex={scrub} onScrub={setScrub} scrubLabel={scrub === 40 ? 'Today' : `${40 - scrub} days ago`} accessibilityLabel="Balance history" />
        <Card>
          <LedgerRow title="Salary · Acme Ltd" amount={2410.66} direction="in" sub="Income" hidden={hidden} />
          <LedgerRow title="Rent" amount={1150} sub="Standing order" hidden={hidden} />
          <LedgerRow title="Moved to buffer" amount={180} direction="move" sub="Payday sweep" hidden={hidden} />
        </Card>
      </Section>

      <Section title="week strip">
        <WeekStrip week={day} selected={day} onSelect={setDay} density={{}} onPrevWeek={() => setDay(new Date(day.getTime() - 7 * 864e5))} onNextWeek={() => setDay(new Date(day.getTime() + 7 * 864e5))} />
      </Section>

      <Section title="peek stack">
        <PeekStack
          items={[
            { key: 'sl', domain: 'growth', header: <PeekHeader initials="SL" color="#B8330F" name="Start Up Loans" meta="Yesterday" />, body: <Text variant="title">Your mentor session is confirmed for Friday at 17:00.</Text> },
            { key: 'gp', domain: 'health', header: <PeekHeader initials="G" color="#8A6A58" name="GP surgery" meta="2 slots" />, body: <Text variant="title">Two blood-test slots opened on Thursday morning.</Text> },
            { key: 'hm', domain: 'admin', header: <PeekHeader initials="H" color="#6F7D86" name="HMRC" meta="£840" />, body: <Text variant="title">One form left before your rebate can be paid.</Text> },
          ]}
        />
      </Section>

      <Section title="nudges · prompt">
        <NudgeCard timestamp="10:33 · 16.11" title="Open a window for ten minutes" media={{ type: 'orb' }} onComplete={() => {}} onSnooze={() => {}} />
        <PromptBanner title="Remove before you add" subtitle="Through Nassim Taleb's lens · 60 sec" saved={saved} onToggleSave={() => setSaved((s) => !s)} />
      </Section>

      <Section title="choice cards">
        {['Clear the chaos', 'Buy my first home', 'Get healthier'].map((c, i) => (
          <ChoiceCard key={c} title={c} description="Tap to choose" selected={choice === i} onPress={() => setChoice(i)} />
        ))}
      </Section>

      <Section title="timeline · orb">
        <ActivityTimeline items={[{ time: '09:30', date: 'Today', text: 'Form P87 submitted.' }, { time: '16:12', date: '12 Nov', text: 'life spotted unclaimed expenses.' }]} />
        <View style={{ flexDirection: 'row', gap: 24, alignItems: 'center' }}>
          <DottedOrb size={56} />
          <DottedOrb size={56} state="thinking" />
        </View>
      </Section>

      <OrbDemo />

      <MoreComponents look={look} />

      <Section title="sheet · full-width bottom navigation (solid, no glass)">
        <Button label="Open draft sheet" variant="secondary" onPress={() => sheet.current?.open()} />
        <View style={{ minHeight: 96 }}>
          <Dock
            active={tab}
            onChange={setTab}
            items={[
              { key: 'today', label: 'Today', icon: (c) => <Ionicons name="sunny-outline" size={20} color={c} /> },
              { key: 'plan', label: 'Plan', icon: (c) => <Ionicons name="grid-outline" size={20} color={c} /> },
              { key: 'you', label: 'You', icon: (c) => <Ionicons name="person-outline" size={20} color={c} /> },
              { key: 'talk', label: 'Talk', icon: (c) => <Ionicons name="mic-outline" size={20} color={c} /> },
            ]}
          />
        </View>
      </Section>

      <Sheet ref={sheet}>
        <View style={{ gap: 12 }}>
          <Text variant="headline">Draft message</Text>
          <Text variant="body">Hello, I'm following up on my P800 calculation (ref P800-7Q2-K41) and would like the refund paid by bank transfer.</Text>
          <Button label="Copy draft" onPress={() => sheet.current?.close()} />
        </View>
      </Sheet>
    </View>
  );
}


const HOUSE = (n: number) =>
  n === 1 ? 'Living alone: you may get 25% off council tax.' : n === 2 ? '2 people: check Marriage Allowance (up to £252 a year).' : n < 16 ? `${n} people: the single-person discount no longer applies.` : '16+ people: life will ask a few questions about your living setup.';
const WORDS = 'So I\'m 27, I live in London with two flatmates and I\'ve gone self-employed. I think I overpaid tax last year.'.split(' ').map((w) => ({
  text: w,
  area: (/27,|London/.test(w) ? 'you' : /flatmates/.test(w) ? 'home' : /self-employed/.test(w) ? 'work' : /overpaid|tax/.test(w) ? 'money' : undefined) as 'you' | 'home' | 'work' | 'money' | undefined,
}));

/** The 27 v9 components added after the first gallery: instruments, controls, lists, body, talk and growth. */
function MoreComponents({ look }: { look: Look }) {
  const t = useTokens();
  const [people, setPeople] = useState(1);
  const [beds, setBeds] = useState(2);
  const [grams, setGrams] = useState(120);
  const [income, setIncome] = useState(2410);
  const [tog, setTog] = useState(true);
  const [seg, setSeg] = useState<'week' | 'month'>('week');
  const [chip, setChip] = useState<string | null>('yes');
  const [gates, setGates] = useState([true, false, false]);
  const [today, setToday] = useState<boolean | undefined>(undefined);
  const [removed, setRemoved] = useState<number[]>([]);
  const [live, setLive] = useState(false);
  const [shown, setShown] = useState(0);
  const [msg, setMsg] = useState('');
  const [attach, setAttach] = useState(false);
  const [level, setLevel] = useState<1 | 2 | 3 | 4>(1);
  const [intro, setIntro] = useState(false);
  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setShown((n) => (n >= WORDS.length ? (setLive(false), n) : n + 1)), 220);
    return () => clearInterval(id);
  }, [live]);
  const counts = WORDS.slice(0, shown).reduce<Record<string, number>>((a, w) => (w.area ? { ...a, [w.area]: (a[w.area] ?? 0) + 1 } : a), {});
  return (
    <>
      <Section title="count instrument (SPEC §6.1)">
        <CountStepper value={people} onChange={setPeople} min={1} question="How many people live with you?" consequence={HOUSE} />
        <CountStepper value={beds} onChange={setBeds} min={1} max={6} glyph="doors" question="How many bedrooms do you need?" consequence={(n) => `${n}-bed in London: roughly £${(n * 140 + 180).toLocaleString('en-GB')}k`} />
      </Section>

      <Section title="controls">
        <Slider value={income} min={0} max={5000} step={10} onChange={setIncome} accessibilityLabel="Coming in" />
        <Callout tone="ink2">{`Coming in: £${income.toLocaleString('en-GB')}`}</Callout>
        <ControlRow label="Sounds" sub="Soft UI sounds">
          <Toggle value={tog} onChange={setTog} accessibilityLabel="Sounds" />
        </ControlRow>
        <Segmented options={[{ value: 'week', label: '4 weeks' }, { value: 'month', label: '3 months' }]} value={seg} onChange={setSeg} />
        <ChipGroup options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }, { value: 'unsure', label: 'Not sure' }]} value={chip} onChange={setChip} />
      </Section>

      <Section title="lists">
        <Checklist header="To reach level 2" count={`${gates.filter(Boolean).length} of 3`} items={[{ label: 'Save your 30-day cash plan', done: gates[0] }, { label: "Review this year's tax", done: gates[1] }, { label: 'Book your heart referral', done: gates[2] }]} onToggle={(i) => setGates((g) => g.map((v, j) => (j === i ? !v : v)))} />
        <RowGroup header="Connected">
          {[
            <ListRow key="a" icon="heart-outline" title="Apple Health" sub="Sleep, heart, workouts, food" right={<StatusPill kind="done" label="On" />} />,
            <ListRow key="b" icon="pulse-outline" title="WHOOP" sub="Recovery, strain, sleep" chevron onPress={() => {}} />,
            <ListRow key="c" area="money" title="Pictures" sub="Mixed cast · follows your mood" chevron onPress={() => {}} />,
          ]}
        </RowGroup>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <NewTag level={2} />
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <ToolTile title="30-day cash plan" icon="wallet-outline" onPress={() => {}} />
          <ToolTile title="Rent vs buy" icon="home-outline" locked level={3} onPress={() => {}} />
        </View>
        <InsightCard area="money" source="From your talk · 12 Nov" value="£840" text="You're likely owed a tax rebate for 2024/25 work expenses." />
        <RowGroup>
          {[
            <RecordRow key="1" area="you" badge="27" label="Age 27, London" destination="You" removed={removed.includes(1)} onToggleRemove={() => setRemoved((r) => (r.includes(1) ? r.filter((x) => x !== 1) : [...r, 1]))} />,
            <RecordRow key="2" area="health" badge="!" label="Heart referral, 11 weeks" destination="New mission · urgent" removed={removed.includes(2)} onToggleRemove={() => setRemoved((r) => (r.includes(2) ? r.filter((x) => x !== 2) : [...r, 2]))} />,
          ]}
        </RowGroup>
        <ChangeSummary>2 new missions, 1 of them urgent. life knows you 64% → 81%.</ChangeSummary>
      </Section>

      <Section title="body">
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <MetricTile label="Readiness" value="72" unit="/100" meaning="Above your baseline" onPress={() => {}}>
            <Ticks count={20} filled={15} />
          </MetricTile>
          <MetricTile label="Sleep" value="7h 10m" meaning="Need 8h 05m" onPress={() => {}}>
            <Ticks count={20} filled={18} />
          </MetricTile>
        </View>
        <RangeBar value={72} />
        <StageBar start="23:20" end="06:45" segments={[{ stage: 'awake', minutes: 8 }, { stage: 'light', minutes: 70 }, { stage: 'deep', minutes: 50 }, { stage: 'rem', minutes: 35 }, { stage: 'light', minutes: 90 }, { stage: 'rem', minutes: 45 }, { stage: 'deep', minutes: 30 }, { stage: 'light', minutes: 60 }, { stage: 'rem', minutes: 30 }, { stage: 'awake', minutes: 12 }]} />
        <MiniBars values={[6.5, 7.8, 5.9, 7.2, 6.8, 8.1, 7.2]} max={9} guide={8.1} color={(v) => (v >= 7.5 ? t.ink : t.surface3)} label="Sleep, last 7 nights" />
        <HabitRow name="Water before coffee" cue="After the kettle boils, I will drink a glass of water, in the kitchen." last14={[true, true, true, true, false, true, true, true, true, true, true, true, true, today]} meta="Day 41 · feels automatic 4/5" source="from Apple Health" onToggleToday={() => setToday((d) => !d)} />
        <Card>
          <FoodItemRow name="Salmon" grams={grams} defaultGrams={120} kcalPer100={206} onChange={setGrams} />
        </Card>
      </Section>

      <Section title="talk">
        <View style={{ height: 160, borderRadius: 20, backgroundColor: t.surface, overflow: 'hidden' }}>
          <Transcript words={WORDS} revealed={shown} />
        </View>
        <Waveform active={live} />
        <FilingTray counts={counts} />
        <View style={{ alignItems: 'center' }}>
          <BigMic
            live={live}
            onPress={() => {
              if (!live && shown >= WORDS.length) setShown(0);
              setLive((l) => !l);
            }}
          />
        </View>
        <UserBubble text="Should I go limited company or stay a sole trader?" />
        <LifeReply segments={[{ text: 'At your ', tone: 'quiet' }, { text: '£48k ' }, { text: 'profit the two come out within about ', tone: 'quiet' }, { text: '£100 a year.' }]} chips={['What about at £60k?', 'Save this']} onChip={() => {}} />
        <FileCard prompt="Save to Work as a decision to revisit if profit passes £60k?" savedText="Saved to Work. life will bring it back if your profit passes £60k." onSave={() => {}} />
        <Composer value={msg} onChangeText={setMsg} onSend={() => setMsg('')} onAttach={() => setAttach(true)} />
        <AttachMenu
          visible={attach}
          onClose={() => setAttach(false)}
          onPick={() => {}}
          options={[
            { key: 'letter', title: 'Scan a letter', sub: 'HMRC, council, NHS: life reads it', icon: 'document-text-outline' },
            { key: 'camera', title: 'Camera', icon: 'camera-outline' },
            { key: 'photos', title: 'Photos', icon: 'images-outline' },
            { key: 'files', title: 'Files', icon: 'folder-outline' },
          ]}
        />
      </Section>

      <Section title="growth">
        <Ridge level={level} />
        <Button label={level < 4 ? 'Climb a level' : 'Back to level 1'} variant="secondary" onPress={() => setLevel((l) => (l < 4 ? ((l + 1) as 1 | 2 | 3 | 4) : 1))} />
        <Button label="Play the level-up tour" variant="secondary" onPress={() => setIntro(true)} />
        {intro ? (
          <View style={{ height: 640, borderRadius: 28, overflow: 'hidden' }}>
            <IntroCarousel
              onDone={() => setIntro(false)}
              pages={[
                { image: storyImage(look === 'places' ? 'places' : 'mix', 'driven'), tag: 'Level 2 unlocked', title: "You're on stable ground", body: 'Your cash plan is saved and nothing is overdue.' },
                { image: storyImage(look === 'places' ? 'places' : 'mix', 'calm'), tag: 'New: Body', title: 'Sleep, readiness and fuel', body: 'Connect your watch or ring and Today plans around how you slept.' },
                { image: storyImage(look === 'places' ? 'places' : 'mix', 'home'), tag: 'On your path', title: 'Closer to your Aim', body: 'Your deposit is 24% of the way there.' },
              ]}
            />
          </View>
        ) : null}
      </Section>
    </>
  );
}

/** The evolving orb (MOTION.md §3.2): tap a state to watch it morph. */
function OrbDemo() {
  const [state, setState] = useState<OrbState>('ring');
  return (
    <Section title="orb · ring → thinking → voice → done">
      <View style={{ alignItems: 'center', paddingVertical: 12 }}>
        <LifeOrb size={120} state={state} />
      </View>
      <Segmented<OrbState> options={(['ring', 'thinking', 'voice', 'done'] as const).map((v) => ({ value: v, label: v }))} value={state} onChange={setState} />
    </Section>
  );
}
