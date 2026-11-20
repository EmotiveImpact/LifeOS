import { useState, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  AccordionGroup,
  ActivityTimeline,
  ArrivingCard,
  Badge,
  BecomingScale,
  BigMic,
  Button,
  Card,
  ChoiceCard,
  ChipGroup,
  Checklist,
  CountStepper,
  DateRow,
  DashPager,
  DecisionDrawer,
  Dock,
  DotGrid,
  DotStrip,
  FEEL_MOODS,
  FEEL_ORDER,
  FeelField,
  FeelingDrawer,
  Field,
  Footer,
  FullPhotoScreen,
  Hypnogram,
  Icon,
  KeyValue,
  LifeReply,
  LifeSays,
  ListRow,
  MetricTile,
  MiniBars,
  MoveDeck,
  NormalBandChart,
  PersonAvatar,
  PhotoCard,
  PhotoFill,
  PhotoGrid,
  RoundButton,
  SectionHead,
  Segmented,
  Slider,
  StatusPill,
  Text,
  Thumb,
  Ticks,
  TileGrid,
  TintCard,
  Toggle,
  TopBar,
  TrendLine,
  TwoTone,
  UserBubble,
  VoiceNote,
  Waveform,
  WheelPicker,
  CapsulePairs,
  areaColors,
  cardShadow,
  photo,
  photoScrims,
  photos,
  radius,
  sheetShadow,
  space,
  tint,
  useAreaTint,
  useTokens,
  type Area,
  type DotCell,
  type FeelMoodId,
  type MoveCard,
} from '@/design';

/* Board copy and sample readings for the gallery only. Screens take their numbers from packages/core. */
const MOVES: MoveCard[] = [
  { key: 'rebate', title: 'Claim your tax rebate', chip: 'One form · about 6 min', sub: 'est. £840 back · for your first home', photo: photos.payslip },
  { key: 'code', title: 'Check your tax code', chip: 'Start with your payslip · 4 min', sub: 'Keeps the right tax coming off · for your first home', photo: photos.letter },
  { key: 'cash', title: 'Set your cash plan', chip: 'Know what the month needs · 10 min', sub: '£290 safe to spend · for your first home', photo: photos.work },
];
const NIGHT: { stage: 'awake' | 'rem' | 'light' | 'deep'; minutes: number }[] = ([
  ['light', 15], ['deep', 45], ['light', 30], ['rem', 20], ['light', 35], ['deep', 25], ['light', 25], ['rem', 30], ['awake', 8], ['light', 40], ['deep', 10],
  ['rem', 35], ['light', 30], ['awake', 7], ['rem', 25], ['light', 35], ['awake', 5], ['rem', 20], ['light', 5],
] as const).map(([stage, minutes]) => ({ stage, minutes }));
const HABIT: DotCell[] = Array.from({ length: 66 }, (_, k) => k === 37 ? 'now' : k < 37 ? (k === 17 || k === 30 ? 'miss' : 'on') : '');
const MONTH: DotCell[] = ['', '', 'on', 'on', 'on', '', 'on', 'on', 'on', 'on', '', 'on', 'on', 'on', 'on', 'on', 'on', '', 'on', 'on', 'now', '', '', '', '', '', '', '', '', '', ''];
const AREAS: Area[] = ['you', 'home', 'work', 'money', 'health', 'goal'];

function Section({ id, title, note, children }: { id: string; title: string; note?: string; children: ReactNode }) {
  const t = useTokens();
  return (
    <View nativeID={`v26-${id}`} style={{ backgroundColor: t.canvas, paddingHorizontal: space.gutter, paddingVertical: space.xl, gap: space.md }}>
      <View style={{ gap: 2 }}>
        <Text variant="micro" tone="ink2">{title.toUpperCase()}</Text>
        {note ? <Text variant="callout" tone="quiet">{note}</Text> : null}
      </View>
      {children}
    </View>
  );
}

function Label({ children }: { children: string }) {
  return <Text variant="micro" tone="quiet" style={{ marginTop: space.xs }}>{children}</Text>;
}

/** Phase 13: every V26 piece with its states, in board copy. Linked from /design (and alone at /design?only=v26). */
export function V26Gallery() {
  return (
    <View>
      <TypeSection />
      <BarsSection />
      <ButtonsSection />
      <ChipsSection />
      <RowsSection />
      <AccordionSection />
      <ChecksSection />
      <TilesSection />
      <DaysSection />
      <ChartsSection />
      <PhotosSection />
      <WelcomeSection />
      <DeckSection />
      <DrawerSection />
      <FeelSection />
      <ControlsSection />
      <TalkSection />
      <TimelineSection />
      <DockSection />
    </View>
  );
}

function TypeSection() {
  const t = useTokens();
  return (
    <Section id="type" title="Type, tints and photo values" note="Today's briefing in the 34pt display type: bright words in ink, the rest in ink2.">
      <TwoTone size="display" segments={[{ text: 'Your ', tone: 'quiet' }, { text: 'tax rebate', icon: 'doc' }, { text: ' is ', tone: 'quiet' }, { text: 'one form' }, { text: ' away. ', tone: 'quiet' }, { text: 'Council tax', icon: 'calendar' }, { text: ' is due in ', tone: 'quiet' }, { text: '15 days' }, { text: '.', tone: 'quiet' }]} />
      <TwoTone size="statement" segments={[{ text: 'Are you registered for ', tone: 'quiet' }, { text: 'Self Assessment?' }]} />
      <TwoTone size="lead" segments={[{ text: 'I’m arriving ', tone: 'quiet' }, { text: 'calm' }, { text: '.', tone: 'quiet' }]} />
      <View style={{ gap: 6 }}>
        <Text variant="numeralXl">1<Text variant="unit" tone="ink2"> Stabilise</Text></Text>
        <Text variant="numeralL">7h 10m</Text>
        <Text variant="heading">58<Text variant="unit" tone="ink2"> ms</Text></Text>
        <Text variant="titleSerif">Claim your tax rebate</Text>
        <Text variant="headline">Nothing taken on today.</Text>
        <Text variant="title">Today’s moves</Text>
        <Text variant="rowTitle">Check your tax code</Text>
        <Text variant="bodyL">Sign in to Government Gateway</Text>
        <Text variant="body">Your moves keep until tomorrow.</Text>
        <Text variant="bodyMedium" tone="quiet">07:15</Text>
        <Text variant="callout" tone="ink2">Start with your payslip · 4 min</Text>
        <Text variant="label">Week</Text>
        <Text variant="micro" tone="ink2">THU 12 NOV</Text>
      </View>
      <Label>AREA TINTS (FOR CHART CARDS, NEVER ON BODY)</Label>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: space.xs }}>
        {AREAS.map(a => (
          <View key={a} style={{ width: 98, height: 56, borderRadius: radius.tile, backgroundColor: t.surface, overflow: 'hidden', justifyContent: 'flex-end', padding: space.xs, ...cardShadow(t.scheme) }}>
            <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: tint[t.scheme][a] }} />
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: areaColors[t.scheme][a] }} /><Text variant="micro">{a}</Text></View>
          </View>
        ))}
      </View>
      <Label>ON A PHOTOGRAPH: PAPER CHIP, PAPER DISC, PAPER WORDS</Label>
      <View style={{ height: 120, borderRadius: radius.lg, overflow: 'hidden', padding: space.md, justifyContent: 'space-between' }}>
        <PhotoFill source={photos.sky} focal={{ y: 0.6 }} />
        <LinearGradient pointerEvents="none" colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><StatusPill size="chip" onPhoto label="Before the camera asks" icon="camera" /><RoundButton icon="close" label="Close" onPhoto /></View>
        <Text variant="headline" tone="paper">Paper words on the photograph</Text>
      </View>
    </Section>
  );
}

function BarsSection() {
  const t = useTokens();
  const none = () => {};
  const frame = { backgroundColor: t.canvas, borderRadius: radius.lg, overflow: 'hidden' as const, ...cardShadow(t.scheme) };
  return (
    <Section id="bars" title="Top bars" note="How a screen opened decides its bar. Never two bars, never more than one action on a pushed screen.">
      <Label>ROOT · TWO BUTTONS AT MOST</Label>
      <View style={frame}><TopBar look="v26" kind="root" title="Today" sub="Mon 16 Nov" actions={[{ kind: 'icon', icon: 'search', label: 'Search', onPress: none }]} orb={{ onPress: none, unread: true }} /></View>
      <Label>PUSH · BACK, TITLE, ONE SMART ACTION OR NONE</Label>
      <View style={frame}><TopBar look="v26" kind="push" title="Readiness" onBack={none} action={{ kind: 'icon', icon: 'info', label: 'How this is worked out', onPress: none }} /></View>
      <View style={frame}><TopBar look="v26" kind="push" title="Talk" closeIcon onBack={none} /></View>
      <Label>SHEET · A HANDLE, A TITLE, CLOSE</Label>
      <View style={[frame, { backgroundColor: t.surface }]}><TopBar look="v26" kind="sheet" title="Add something" onClose={none} /></View>
      <Label>FULL-SCREEN FLOW · BACK AND A STEP COUNT</Label>
      <View style={frame}><TopBar look="v26" kind="flow" onClose={none} step="2 of 3" /></View>
      <Label>OVER A PHOTOGRAPH · SAME BAR, ON SOLID DISCS</Label>
      <View style={{ height: 84, borderRadius: radius.lg, overflow: 'hidden', paddingTop: 6 }}>
        <PhotoFill source={photos.terrace} />
        <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: photo.shade }]} />
        <TopBar look="v26" kind="push" title="Home" onImage onBack={none} action={{ kind: 'icon', icon: 'info', label: 'Why these show here', onPress: none }} />
      </View>
    </Section>
  );
}

function ButtonsSection() {
  const t = useTokens();
  return (
    <Section id="buttons" title="Round buttons, buttons and the footer" note="One primary per screen. Round buttons never have a border.">
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, flexWrap: 'wrap' }}>
        <RoundButton icon="add" size="sm" label="Add" onPress={() => {}} />
        <RoundButton icon="search" label="Search" onPress={() => {}} />
        <RoundButton icon="bell" label="From Life" dot onPress={() => {}} />
        <RoundButton icon="mic" solid label="Hold to talk" onPress={() => {}} />
        <RoundButton icon="arrow" size="lg" solid label="Next" onPress={() => {}} />
        <RoundButton icon="stop" size="xl" solid label="Stop" onPress={() => {}} />
        <RoundButton icon="remove" label="Fewer" disabled onPress={() => {}} />
      </View>
      <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
        <View style={{ width: 120, height: 64, borderRadius: radius.lg, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' }}><PhotoFill source={photos.terrace} /><RoundButton icon="back" onPhoto label="Back" onPress={() => {}} /></View>
        <Badge icon="walk" />
        <Badge icon="wallet" />
      </View>
      <Button size="md" label="Set today’s pace" onPress={() => {}} />
      <Button size="md" label="Continue" icon="arrow" iconPosition="trailing" onPress={() => {}} />
      <Button size="md" variant="ghost" label="Change" onPress={() => {}} />
      <View style={{ flexDirection: 'row', gap: space.xs }}>
        {['Yes', 'Not yet', 'Not sure'].map(l => <View key={l} style={{ flex: 1 }}><Button size="sm" variant="ghost" label={l} onPress={() => {}} /></View>)}
      </View>
      <Label>FOOTER · PINNED ABOVE THE HOME INDICATOR</Label>
      <View style={{ borderRadius: radius.lg, overflow: 'hidden', backgroundColor: t.canvas, ...cardShadow(t.scheme) }}>
        <Footer>
          <Button size="md" label="Add to my plan" onPress={() => {}} />
          <Text variant="callout" tone="ink2" align="center">Not now</Text>
        </Footer>
      </View>
    </Section>
  );
}

function ChipsSection() {
  return (
    <Section id="chips" title="Section heads, chips and Life speaking">
      <View>
        <SectionHead first title="Today’s moves" link="1 of 3" />
        <SectionHead title="Coming up" link="Calendar" onLink={() => {}} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        <StatusPill size="chip" label="Level 1 · Stabilise" />
        <StatusPill size="chip" kind="live" label="Finish the P87 · 6 min" />
        <StatusPill size="chip" kind="done" label="Good recovery" />
        <StatusPill size="chip" kind="quiet" label="Usual" />
        <StatusPill size="chip" icon="check" label="Checked in · 9:41" />
      </View>
      <LifeSays>The walk after dinner may be what kept you steady.</LifeSays>
      <LifeSays eyebrow="Life noticed">An emergency tax code on your March payslip.</LifeSays>
      <LifeSays eyebrow="Life · just now" orb="done">Filed. Your rent situation has a new date.</LifeSays>
    </Section>
  );
}

function RowsSection() {
  return (
    <Section id="rows" title="Rows" note="A round-cornered icon well, a photograph thumb or a date box. Rows separate by space, never a line.">
      <Card padding={space.md}>
        <ListRow look="v26" icon="doc" title="Check your tax code" sub="Start with your payslip · 4 min" onPress={() => {}} />
        <ListRow look="v26" icon="wallet" title="Set your cash plan" sub="Know what the month needs" onPress={() => {}} />
        <ListRow look="v26" thumb={photos.keys} title="My rent is going up" sub="From March · 2 open steps" onPress={() => {}} />
      </Card>
      <Card padding={space.md}>
        <DateRow look="v26" name="Kofi’s birthday" date="18 Nov" day="18" month="Nov" detail="Turning 31 · running vest idea" countdown="Sat" onPress={() => {}} />
        <DateRow look="v26" name="Council tax" date="1 Dec" day="01" month="Dec" detail="£148 · Direct Debit" countdown="15 days" kind="anniversary" onPress={() => {}} />
        <DateRow look="v26" name="Car MOT due" date="12 Jan" day="12" month="Jan" detail="Book from 12 Dec" countdown="8 weeks" kind="anniversary" onPress={() => {}} />
      </Card>
      <Card padding={space.md}>
        <KeyValue label="Tax code" value="1257L" />
        <KeyValue label="Tax-free each year" value="£12,570" />
        <KeyValue label="Reference" value="P800-7Q2-K41" />
      </Card>
    </Section>
  );
}

function AccordionSection() {
  return (
    <Section id="accordion" title="Accordion" note="Sections open one at a time. Tap a head.">
      <AccordionGroup initial="ready" items={[
        { key: 'ready', title: 'Ready when you are', count: 3, content: <>
          <ListRow look="v26" icon="doc" title="Check your tax code" sub="Start with your payslip · 4 min" onPress={() => {}} />
          <ListRow look="v26" icon="wallet" title="Set your cash plan" sub="Know what the month needs" onPress={() => {}} />
          <ListRow look="v26" icon="walk" title="Your morning walk" sub="Day 38 of about 66" onPress={() => {}} />
        </> },
        { key: 'situations', title: 'Situations', count: 1, content: <ListRow look="v26" thumb={photos.keys} title="My rent is going up" sub="From March · 2 open steps" onPress={() => {}} /> },
        { key: 'waiting', title: 'Waiting, not forgotten', count: 2, content: <ListRow look="v26" icon="clock" title="HMRC replies" sub="About 22 Nov" /> },
      ]} />
    </Section>
  );
}

function ChecksSection() {
  const [items, setItems] = useState([
    { label: 'Find your P60 or last payslip', done: true },
    { label: 'Sign in to Government Gateway', done: true },
    { label: 'Fill in the P87 form', done: false },
    { label: 'Submit and save the reference', done: false },
  ]);
  const [len, setLen] = useState<string | null>(null);
  return (
    <Section id="checks" title="Check rows and pick rows" note="Round ticks; a done line goes quiet, never struck through.">
      <Card padding={space.md}>
        <Checklist look="round" bare items={items} onToggle={i => setItems(xs => xs.map((x, k) => k === i ? { ...x, done: !x.done } : x))} />
      </Card>
      <ChoiceCard look="pick" title="How long" value={len ?? 'Choose'} selected={!!len} onPress={() => setLen(l => l ? null : '20 minutes')} />
      <ChoiceCard look="pick" title="Reminder" value="Weekdays, 07:30" selected onPress={() => {}} />
    </Section>
  );
}

function TilesSection() {
  return (
    <Section id="tiles" title="Tiles and readings" note="Calm white tiles: label with its area dot, the scale, the figure, one line of meaning.">
      <TileGrid>
        <MetricTile look="v26" label="Readiness" dot="health" scale="/100" value="72" sub="Well recovered" onPress={() => {}} />
        <MetricTile look="v26" label="Sleep" dot="work" scale="/8h" value="7h 10m" sub="2h 40m short this week" onPress={() => {}} />
        <MetricTile look="v26" wide label="Fuel" dot="home" scale="/2,300 kcal" value="1,420" meter={0.62} parts={[{ label: 'Protein', value: '28g left' }, { label: 'Carbs', value: '98g left' }, { label: 'Fat', value: '31g left' }]} onPress={() => {}} />
        <MetricTile look="v26" label="Load" dot="goal" scale="/21" value="11.4" sub="In today’s range" onPress={() => {}} />
        <MetricTile look="v26" label="Stress" dot="you" scale="/3" value="1.4" sub="Low" onPress={() => {}} />
        <MetricTile look="v26" label="Life knows you" scale="64%" value="214" sub="things filed" />
        <MetricTile look="v26" label="Streak" scale="best 11" value="4" unit="days"><DotStrip days="11011101101111" style={{ marginTop: space.sm }} /></MetricTile>
      </TileGrid>
      <Label>SLIM, THREE IN A ROW (BODY)</Label>
      <TileGrid columns={3}>
        <MetricTile look="v26" slim label="Sleep" value="7h 10m" sub="of 8h 05m" onPress={() => {}}><MiniBars look="capsule" values={[6.2, 7.1, 6.8, 7.5, 7.2, 8.1, 7.2]} height={50} dim={0.16} label="Sleep each night this week" /></MetricTile>
        <MetricTile look="v26" slim label="Load" value="11.4" sub="aim 11–14" onPress={() => {}}><TrendLine look="band" values={[6, 9, 12.5, 8, 10, 13, 11.4]} band={[11, 14]} height={30} label="Load this week against the 11 to 14 aim" /></MetricTile>
        <MetricTile look="v26" slim label="Stress" value="1.4" sub="low" onPress={() => {}}><TrendLine look="band" values={[1.9, 1.3, 2.2, 1.6, 1.2, 1.5, 1.4]} band={[1, 2]} height={30} label="Stress this week against your normal" /></MetricTile>
      </TileGrid>
      <MetricTile look="reading" name="Heart rate variability" icon="heart" tag="Better" tagKind="done" value="58" unit="ms" delta="6 ms above your normal" series={[49, 52, 47, 55, 51, 54, 58]} normal={[47, 56]} onPress={() => {}} />
      <MetricTile look="reading" name="Resting heart rate" icon="heart" tag="Usual" value="54" unit="bpm" delta="Just under your normal" series={[57, 58, 56, 57, 55, 56, 54]} normal={[55, 59]} onPress={() => {}} />
      <Card>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}><Text variant="title">Life knows you</Text><Text variant="title">64%</Text></View>
        <Ticks variant="ruler" count={36} filled={23} />
        <Text variant="callout" tone="ink2" style={{ marginTop: space.tile }}>214 things filed from your words and records.</Text>
      </Card>
    </Section>
  );
}

function DaysSection() {
  return (
    <Section id="days" title="Counted days and who you’re becoming" note="The orb's chunky dots: done in ink, today in ember, a miss as a hollow ring.">
      <DotStrip days="11011101101111" label="Streak, last 14 days" />
      <Card padding={space.md}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="micro" tone="ink2">DAY 38 OF ABOUT 66</Text><Text variant="micro" tone="quiet">2 missed</Text></View>
        <DotGrid cells={HABIT} style={{ marginTop: space.sm }} label="Morning walk, day 38 of about 66" />
      </Card>
      <Card padding={space.md}>
        <Text variant="micro" tone="ink2">NOVEMBER</Text>
        <DotGrid variant="month" columns={7} cells={MONTH} style={{ marginTop: space.sm }} label="November" />
      </Card>
      <Card>
        <Text variant="micro" tone="ink2">Who you’re becoming · asked every few check-ins</Text>
        <TwoTone size="statement" segments={[{ text: '“I look after future me.”' }]} style={{ marginTop: space.xs }} />
        <BecomingScale marks={[52, 70, 64, 88, 80]} style={{ marginTop: space.sm }} />
        <Text variant="callout" tone="ink2" style={{ marginTop: space.sm }}>Your last 5 reflections lean yes.</Text>
      </Card>
    </Section>
  );
}

function ChartsSection() {
  const money = useAreaTint('money');
  return (
    <Section id="charts" title="Charts" note="Your own normal as a shaded band, today picked out, every chart as wide as its card.">
      <Card>
        <Text variant="title">Readiness this week</Text>
        <NormalBandChart values={[58, 64, 55, 70, 62, 66, 72]} normal={[60, 70]} />
      </Card>
      <Card>
        <Text variant="title">Sleep</Text>
        <MiniBars look="capsule" values={[6.2, 7.1, 6.8, 7.5, 7.2, 8.1, 7.2]} labels={['M', 'T', 'W', 'T', 'F', 'S', 'S']} label="Sleep each night this week" />
      </Card>
      <Card>
        <Text variant="title">Load against today’s range</Text>
        <TrendLine look="band" values={[6, 9, 12.5, 8, 10, 13, 11.4]} band={[11, 14]} label="Load this week against the 11 to 14 range" />
      </Card>
      <TintCard area="money">
        <Text variant="title">In and out, by week</Text>
        <Text variant="callout" tone="ink2" style={{ marginBottom: space.xs }}>Tinted for money. The chart keeps to ink.</Text>
        <CapsulePairs weeks={[{ label: 'W1', in: 2400, out: 1650 }, { label: 'W2', in: 0, out: 820 }, { label: 'W3', in: 0, out: 1240 }, { label: 'W4', in: 1250, out: 960, now: true }]} />
        <View style={{ flexDirection: 'row', gap: space.xs, marginTop: space.xs, alignItems: 'center' }}><View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: money.accent }} /><Text variant="micro" tone="ink2">Area colour for a key, when one is needed</Text></View>
      </TintCard>
      <Card>
        <Text variant="title">Last night</Text>
        <Hypnogram look="tracks" segments={NIGHT} start="23:20" end="06:45" summary="Asleep 7h 10m · 89%" />
      </Card>
    </Section>
  );
}

function PhotosSection() {
  return (
    <Section id="photos" title="Photo cards" note="Picture-forward: the photograph is the card. Chips on top, copy low on the fade, no panel.">
      <PhotoCard source={photos.keyshome} focal={{ y: 0.66 }} height={232} chips={['Chief Aim · June 2029']} chipRight="24%" title="A two-bed flat of my own" sub="£11,760 of £49,000 · £800 a month" onPress={() => {}} />
      <PhotoGrid>
        <PhotoCard source={photos.areahome} height={168} size="md" chips={['1 situation']} title="Home" sub="Rent up in March" onPress={() => {}} />
        <PhotoCard source={photos.payslip} height={168} size="md" chips={['2 ready']} title="Money" sub="Tax code · cash plan" onPress={() => {}} />
        <PhotoCard source={photos.walk} height={168} size="md" chips={['1 ready']} title="Health" sub="Walk · day 38 of 66" onPress={() => {}} />
        <PhotoCard source={photos.areawork} height={168} size="md" chips={['3 unpaid']} title="Work" sub="Invoices · £2,400" onPress={() => {}} />
      </PhotoGrid>
    </Section>
  );
}

function WelcomeSection() {
  const [page, setPage] = useState(0);
  return (
    <Section id="welcome" title="Full-photo screen (the Welcome treatment)" note="For every full-screen moment: edge to edge, big words low and left, one round arrow, a dash pager.">
      <View style={{ height: 700, borderRadius: radius.xl, overflow: 'hidden' }}>
        <FullPhotoScreen source={photos.friends} title="Life, handled." statement={[{ text: 'Life finds ', tone: 'quiet' }, { text: 'what you’re owed' }, { text: ', ', tone: 'quiet' }, { text: 'what’s due' }, { text: ' and ', tone: 'quiet' }, { text: 'what’s next' }, { text: '.', tone: 'quiet' }]} pager={{ count: 3, index: page }} onNext={() => setPage(p => (p + 1) % 3)} onSkip={() => {}} />
      </View>
      <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
        <View style={{ height: 40, paddingHorizontal: space.md, borderRadius: radius.lg, justifyContent: 'center', overflow: 'hidden' }}><PhotoFill source={photos.sky} focal={{ y: 0.15 }} /><DashPager count={4} index={1} /></View>
        <DashPager count={3} index={2} onPhoto={false} />
      </View>
    </Section>
  );
}

function DeckSection() {
  const [cards, setCards] = useState(MOVES);
  const [taken, setTaken] = useState<MoveCard[]>([]);
  const decided = MOVES.length - cards.length;
  const reset = () => { setCards(MOVES); setTaken([]); };
  return (
    <Section id="deck" title="Move deck" note="Today's moves, after the feeling check. Tick takes it on, cross leaves it; swipe right or left does the same.">
      {cards.length ? <>
        <SectionHead first title="Today’s moves" link={`${decided + 1} of ${MOVES.length}`} />
        <MoveDeck cards={cards} onDecide={(d, c) => { if (d === 'take') setTaken(x => [...x, c]); setCards(x => x.slice(1)); }} />
      </> : <>
        <SectionHead first title={taken.length ? `Your day · ${taken.length} ${taken.length === 1 ? 'move' : 'moves'}` : 'Today’s moves'} link="Choose again" onLink={reset} />
        {taken.length
          ? <Card padding={space.md}>{taken.map(c => <ListRow key={c.key} look="v26" thumb={c.photo} title={c.title} sub={c.chip} />)}</Card>
          : <Card><Text variant="headline">Nothing taken on today.</Text><Text variant="body" style={{ marginTop: space.xs }}>That’s allowed. Your moves keep until tomorrow.</Text></Card>}
      </>}
      <Label>TWO RESTING BEHIND</Label>
      <MoveDeck cards={MOVES} behind={2} onDecide={() => {}} hint={null} />
    </Section>
  );
}

function DrawerSection() {
  const [filed, setFiled] = useState(false);
  return (
    <Section id="drawer" title="Decision drawer" note="Dark, one question: leave it, do it (the ember knob), or ask first. Once decided, a single Undo.">
      <View style={{ borderRadius: radius.xl, overflow: 'hidden', ...sheetShadow }}>
        {filed
          ? <DecisionDrawer safeBottom={false} title="Filed." sub="4 details are in their places. Your rent situation has a new date." undo={{ onPress: () => setFiled(false) }} />
          : <DecisionDrawer safeBottom={false} title="File these 4 details?" sub="Into Home, You and Health. You decide." leave={{ label: 'Leave them', onPress: () => {} }} confirm={{ label: 'File all four', onPress: () => setFiled(true), haptic: 'file' }} ask={{ label: 'Go through them one by one', onPress: () => {} }} />}
      </View>
      <Label>ONCE DECIDED · A SINGLE UNDO</Label>
      <View style={{ borderRadius: radius.xl, overflow: 'hidden' }}>
        <DecisionDrawer safeBottom={false} title="Filed." sub="4 details are in their places. Your rent situation has a new date." undo={{ onPress: () => {} }} />
      </View>
      <Label>ASK FIRST BY VOICE</Label>
      <View style={{ borderRadius: radius.xl, overflow: 'hidden' }}>
        <DecisionDrawer safeBottom={false} title="Save this to Work?" sub="As a decision to revisit if profit passes £60k." leave={{ label: 'Not now', onPress: () => {} }} confirm={{ label: 'Save to Work', onPress: () => {} }} ask={{ label: 'Ask a follow-up', icon: 'mic', onPress: () => {} }} />
      </View>
    </Section>
  );
}

function FeelSection() {
  const t = useTokens();
  const [arriving, setArriving] = useState<FeelMoodId | null>(null);
  const [now, setNow] = useState<FeelMoodId>('calm');
  return (
    <Section id="feel" title="Feeling check" note="Rises as a drawer over Today; waits as one small card when closed. Move the orb: the dots lean in, the photograph and the word change.">
      <ArrivingCard mood={arriving} onPress={() => setArriving(a => a ? null : 'calm')} />
      <ArrivingCard mood="peaceful" onPress={() => {}} />
      <Label>THE DRAWER OVER TODAY (FIELD 232PT)</Label>
      <View style={{ backgroundColor: t.canvas, borderRadius: radius.xl, overflow: 'hidden', paddingTop: space.xxl }}>
        <FeelingDrawer onClose={() => {}} onSet={m => setArriving(m)} onChange={setNow} />
      </View>
      <Text variant="callout" tone="ink2">{`Under the orb now: ${FEEL_MOODS[now].name}.`}</Text>
      <Label>THE FIELD ON ITS OWN (280PT) AND WHERE EACH MOOD RESTS</Label>
      <FeelField initial="driven" />
      <Card padding={space.md}>
        {FEEL_ORDER.map(id => {
          const m = FEEL_MOODS[id];
          return (
            <View key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: 6 }}>
              <Thumb source={photos[m.photo]} size={40} />
              <View style={{ flex: 1 }}>
                <Text variant="rowTitle">{m.name}<Text variant="callout" tone="quiet">{`  rests at x ${m.at[0].toFixed(2)}, y ${m.at[1].toFixed(2)}`}</Text></Text>
                <Text variant="callout" tone="ink2">{`${m.head} ${m.line}`}</Text>
              </View>
            </View>
          );
        })}
      </Card>
    </Section>
  );
}

function ControlsSection() {
  const [on, setOn] = useState(true);
  const [off, setOff] = useState(false);
  const [mins, setMins] = useState(20);
  const [seg, setSeg] = useState<'day' | 'week' | 'month'>('week');
  const [filter, setFilter] = useState<'all' | 'money' | 'home' | 'health'>('all');
  const [wake, setWake] = useState(2);
  const [name, setName] = useState('');
  const [days, setDays] = useState(3);
  return (
    <Section id="controls" title="Controls" note="Switch, slider, segmented, filters, wheel, field and stepper. Ink for on; ember is kept for the one signal.">
      <Card padding={space.md}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: space.xs }}><Text variant="rowTitle">Morning nudge</Text><Toggle look="v26" value={on} onChange={setOn} accessibilityLabel="Morning nudge" /></View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: space.xs }}><Text variant="rowTitle">Weekend nudges</Text><Toggle look="v26" value={off} onChange={setOff} accessibilityLabel="Weekend nudges" /></View>
      </Card>
      <View style={{ gap: space.xs }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text variant="callout" tone="ink2">Walk length</Text><Text variant="label">{`${mins} min`}</Text></View>
        <Slider look="v26" value={mins} min={5} max={60} step={5} onChange={setMins} accessibilityLabel="Walk length in minutes" />
      </View>
      <Segmented look="v26" options={[{ value: 'day', label: 'Day' }, { value: 'week', label: 'Week' }, { value: 'month', label: 'Month' }]} value={seg} onChange={setSeg} />
      <ChipGroup look="v26" options={[{ value: 'all', label: 'All' }, { value: 'money', label: 'Money' }, { value: 'home', label: 'Home' }, { value: 'health', label: 'Health' }]} value={filter} onChange={setFilter} />
      <WheelPicker label="I need to wake at" options={['06:30', '06:45', '07:00', '07:15', '07:30']} value={wake} onChange={setWake} />
      <Field label="Employer" value="Northwind Studio" onPress={() => {}} />
      <Field label="Your first name" value={name} placeholder="Ama" onChangeText={setName} />
      <Field label="Postcode" placeholder="For your council" />
      <CountStepper look="compact" question="Days a week" unit="days" value={days} onChange={setDays} min={1} max={7} />
    </Section>
  );
}

function TalkSection() {
  const [live, setLive] = useState(false);
  return (
    <Section id="talk" title="Conversation" note="What you said sits in a white bubble; Life never uses one.">
      <UserBubble look="v26" text="Why do I feel flat today?" />
      <LifeReply look="v26" segments={[{ text: 'Your sleep was ', tone: 'quiet' }, { text: '40 minutes short' }, { text: ' and your heart worked harder overnight.', tone: 'quiet' }]} />
      <VoiceNote duration="0:34" onPlay={() => {}} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <PersonAvatar look="v26" name="Ama" />
        <PersonAvatar look="v26" name="Kofi Owusu" size={72} />
        <Waveform look="note" active={false} />
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
        <BigMic look="v26" live={live} onPress={() => setLive(l => !l)} />
        <Text variant="callout" tone="ink2" style={{ flex: 1 }}>{live ? 'Listening. Tap when you’re done.' : 'Tap the mic to talk.'}</Text>
      </View>
    </Section>
  );
}

function TimelineSection() {
  return (
    <Section id="timeline" title="Timeline" note="A spine of small dots, never a line. Done in ink, now in ember, later quiet.">
      <TwoTone size="display" segments={[{ text: 'Tax rebate.' }, { text: ' About ', tone: 'quiet' }, { text: '£840' }, { text: ' back, one form to go.', tone: 'quiet' }]} />
      <ActivityTimeline look="spine" items={[
        { time: 'THU 12 NOV', text: 'Life noticed an emergency tax code on your March payslip.', state: 'done' },
        { time: 'FRI 13 NOV', text: '“I think I overpaid when I changed jobs.”', state: 'done', children: <VoiceNote duration="0:34" style={{ marginTop: space.tile }} /> },
        { time: 'TODAY', text: 'One form left.', state: 'now', children: <Card padding={space.md} style={{ marginTop: space.sm }}><StatusPill size="chip" kind="live" label="Finish the P87 · 6 min" style={{ alignSelf: 'flex-start' }} /><Text variant="body" style={{ marginTop: space.xs }}>Sign in to Government Gateway, add your software and kit, then submit.</Text><Button size="md" label="Continue" icon="arrow" iconPosition="trailing" style={{ marginTop: space.md }} onPress={() => {}} /></Card> },
        { time: 'ABOUT 22 NOV', text: 'HMRC replies. Life will watch for it and tell you.', state: 'later' },
      ]} />
    </Section>
  );
}

function DockSection() {
  const t = useTokens();
  const [tab, setTab] = useState('today');
  const items = [
    { key: 'today', label: 'Today', icon: (c: string) => <Icon name="home" size={22} color={c} /> },
    { key: 'plan', label: 'Plan', icon: (c: string) => <Icon name="layers" size={22} color={c} /> },
    { key: 'you', label: 'You', icon: (c: string) => <Icon name="person" size={22} color={c} /> },
    { key: 'talk', label: 'Talk', icon: (c: string) => <Icon name="mic" size={22} color={c} /> },
  ];
  return (
    <Section id="dock" title="Dock and sheet" note="A floating pill on the canvas; only the current tab is named. Sheets rise with a handle and 28pt corners.">
      <View style={{ borderRadius: radius.xl, overflow: 'hidden', backgroundColor: t.canvas, paddingTop: space.md }}>
        <Dock variant="float" items={items} active={tab} onChange={setTab} />
      </View>
      <View style={{ borderRadius: radius.xl, overflow: 'hidden', backgroundColor: t.canvas, paddingTop: space.xxl }}>
        <View style={{ backgroundColor: t.surface, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingBottom: space.lg, ...sheetShadow }}>
          <TopBar look="v26" kind="sheet" title="Add something" onClose={() => {}} />
          <View style={{ paddingHorizontal: space.gutter, gap: space.xs }}>
            <ListRow look="v26" icon="mic" title="Say it" sub="Life files it as you talk" onPress={() => {}} />
            <ListRow look="v26" icon="camera" title="Snap a letter or a meal" sub="Life reads it" onPress={() => {}} />
            <ListRow look="v26" icon="doc" title="Type it" sub="A note, a date, a figure" onPress={() => {}} />
          </View>
        </View>
      </View>
    </Section>
  );
}
