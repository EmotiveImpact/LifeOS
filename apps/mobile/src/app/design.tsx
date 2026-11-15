import { useRef, useState, type ReactNode } from 'react';
import { ScrollView, View, useWindowDimensions } from 'react-native';
import { Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ActivityTimeline,
  Button,
  Callout,
  CapsuleMeter,
  Card,
  ChoiceCard,
  Countdown,
  Dock,
  DottedOrb,
  ImageTreatment,
  LedgerRow,
  MetricRow,
  MoneyFigure,
  Mono,
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
  const [mode, setMode] = useState<'light' | 'dark' | 'both'>('dark');
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
            <Column look={look} style={side ? { flex: 1 } : undefined} />
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
    <View style={{ flexDirection: 'row', backgroundColor: t.surface2, borderRadius: 10, padding: 3, borderWidth: 1, borderColor: t.line }}>
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
    <View style={{ paddingTop: insets.top + 8, paddingHorizontal: 16, paddingBottom: 10, gap: 8, backgroundColor: t.canvas, borderBottomWidth: 1, borderColor: t.line }}>
      <Text variant="headline">life · design gallery</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {seg([['light', 'Light'], ['dark', 'Dark'], ['both', 'Both']], mode, (v) => setMode(v as 'light' | 'dark' | 'both'))}
        {seg([['p1', 'Look 1'], ['p2', 'Look 2'], ['p3', 'Look 3'], ['places', 'Places']], look, (v) => setLook(v as Look))}
      </View>
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

      <Section title="sheet · dock (solid, no glass §43)">
        <Button label="Open draft sheet" variant="secondary" onPress={() => sheet.current?.open()} />
        <View style={{ height: 96 }}>
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
