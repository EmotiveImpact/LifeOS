/**
 * Your Chief Aim, restyled to the V26 board (`money-docs-aim.js`): write it one question at a time, read it on the sky
 * above your own front door, this month's gambit, and the earned glimpse. The Aim and its reading log save on this phone.
 */
import { useState } from 'react';
import { ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ActionMenu, DotGrid, Icon, LifeOrb, PhotoFill, Press, RoundButton, Ruler, SectionHead, SegmentedV26, StatusPill, Text, feedback, fonts, photoScrims, photos, radius,
  space, useTokens, type DotCell,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import { aimReadKey, localDayKey } from '@/state/day';
import { money, seed, seedAim, seedTaxClaim, type ChiefAim } from '@/state/seed';
import { gambits } from '@/state/plan';
import { Between, Body, Box, Btn, Callout, Chip, Display, Eyebrow, Figure, Hero, Micro, Page, PhotoBackdrop, PhotoRound, QuietLink, Row, RowsCard, Statement, Tick, Timeline } from './kit';

const pct = () => Math.round(seed.finance.deposit / seed.finance.depositGoal * 100);
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const trimEnd = (s: string) => s.trim().replace(/[.!]+$/, '');

/* ───────────────────────── Write your Aim ───────────────────────── */

const STEPS = [
  { key: 'what', title: 'What, {exactly?}', sub: 'Make it concrete enough that you’d know the day you’ve got it.', suggestion: 'Own a two-bed flat in South London', photo: 'desk', next: 'Next: by when?' },
  { key: 'when', title: 'By {when?}', sub: 'A month and a year gives your plan somewhere to start.', suggestion: 'June 2029', photo: 'aimwrite', next: 'Next: what you’ll give' },
  { key: 'give', title: 'What will you {give for it?}', sub: 'Everything has a price: time, money, effort. Name yours.', suggestion: `Save ${money(seed.finance.savingsMonthly)} a month and grow my design rate by 20%`, photo: 'aimdesk', next: 'Next: your first plan' },
  { key: 'plan', title: 'Your {first plan}', sub: 'It doesn’t need to be perfect. Life will improve it with you.', suggestion: 'Lifetime ISA first, then a mortgage in principle by 2028', photo: 'keyshome', next: 'Save my Aim' },
] as const;
type StepKey = (typeof STEPS)[number]['key'];

/** A blank in the Aim sentence (board `.mda-blank`): quiet, or ember where you are now. */
function Blank({ now }: { now?: boolean }) {
  const t = useTokens();
  return <Text style={{ backgroundColor: now ? t.ember : t.surface3, color: 'transparent' }}>{' '.repeat(14)}</Text>;
}

export function AimNewV26() {
  const t = useTokens(), nav = useNavigation(), { data, set } = useSeed();
  const empty: ChiefAim = { what: '', when: '', give: '', plan: '', createdAt: '', history: [], readLog: [] };
  const [aim, setAim] = useState<ChiefAim>(data.aim ? { ...data.aim } : empty);
  const [step, setStep] = useState(0);
  const [suggested, setSuggested] = useState<Partial<Record<StepKey, string>>>({});
  const s = STEPS[step];
  const value = aim[s.key];
  const usedSuggestion = suggested[s.key] !== undefined && value === s.suggestion;
  const save = () => {
    const next: ChiefAim = { ...aim, what: trimEnd(aim.what), when: trimEnd(aim.when), give: trimEnd(aim.give), plan: trimEnd(aim.plan), createdAt: new Date().toISOString(), history: data.aim ? [...data.aim.history, JSON.stringify(data.aim)] : [], readLog: data.aim?.readLog ?? [] };
    set({ aim: next }); feedback.file();
    if (data.onboardingDone) nav.replace('aim'); else nav.replace('building');
  };
  const part = (k: StepKey, i: number) => aim[k].trim() ? <Text key={k} variant="statement" style={{ color: t.ink }}>{trimEnd(aim[k]).replace(/^./, c => (k === 'what' || k === 'give' || k === 'plan') ? c.toLowerCase() : c)}</Text> : <Blank key={k} now={i === step} />;
  return (
    <Page screen="aimnew" bar={{ kind: 'flow', left: 'Close', leftIcon: 'close', step: `${step + 1} of 4` }}
      footer={<>
        <Btn label={s.next} icon={step < 3 ? 'arrow' : undefined} trail disabled={!value.trim()} onPress={() => { if (step < 3) { setStep(step + 1); feedback.select(); } else save(); }} />
        {step > 0 ? <QuietLink label="Back a step" onPress={() => setStep(step - 1)} /> : null}
      </>}>
      <Hero source={photos[s.photo]} height={128}>
        <Eyebrow>Your Chief Aim</Eyebrow>
        <Display s={s.title} style={{ marginTop: 6 }} />
        <Body s={s.sub} style={{ marginTop: space.xs }} />
      </Hero>
      <View style={[styles.composer, { backgroundColor: t.surface, marginTop: space.sm }]}>
        <TextInput maxFontSizeMultiplier={1.3} value={value} onChangeText={v => setAim({ ...aim, [s.key]: v })} placeholder="Say it or type it" placeholderTextColor={t.inkQuiet} selectionColor={t.ember} multiline
          accessibilityLabel={s.title.replace(/[{}]/g, '')} style={[styles.input, { color: t.ink, fontFamily: fonts.sansMedium }]} />
        <RoundButton icon="mic" size="sm" label="Talk instead of typing" onPress={() => nav.go('talk')} />
      </View>
      <View style={{ flexDirection: 'row', marginTop: space.sm }}>
        {usedSuggestion
          ? <Chip label="From what Life already knows · undo" icon="check" tone="done" onPress={() => { setAim({ ...aim, [s.key]: suggested[s.key] ?? '' }); setSuggested({ ...suggested, [s.key]: undefined }); }} />
          : <Press haptic="select" onPress={() => { setSuggested({ ...suggested, [s.key]: value }); setAim({ ...aim, [s.key]: s.suggestion }); }} accessibilityLabel={`Suggest: ${s.suggestion}`} style={[styles.suggest, { backgroundColor: t.surface, flexShrink: 1 }]}>
              <LifeOrb size={18} /><Text variant="buttonCompact" numberOfLines={1} style={{ flexShrink: 1 }}>{`Suggest: ${s.suggestion}`}</Text>
            </Press>}
      </View>
      <View style={{ minHeight: space.xxl }} />
      <Eyebrow>Your Aim, so far</Eyebrow>
      <Text variant="statement" tone="ink2" style={{ marginTop: space.xs }}>
        {'By '}{part('when', 1)}{', I will '}{part('what', 0)}{'. In return I will '}{part('give', 2)}{'. My plan: '}{part('plan', 3)}{'.'}
      </Text>
    </Page>
  );
}

/* ───────────────────────── Your Aim ───────────────────────── */

/** Days in a row with a reading, ending today or yesterday. */
function streakOf(log: string[]) {
  const days = new Set(log.map(e => e.slice(0, 10)));
  const d = new Date();
  if (!days.has(localDayKey(d))) d.setDate(d.getDate() - 1);
  let n = 0;
  while (days.has(localDayKey(d))) { n++; d.setDate(d.getDate() - 1); }
  return { streak: n, total: days.size };
}

export function AimV26() {
  const t = useTokens(), nav = useNavigation(), { data, set, flag } = useSeed();
  const aim = data.aim;
  const p = pct();
  if (!aim) {
    return (
      <Page screen="aim" bar={{ kind: 'push' }}>
        <Eyebrow>Your Chief Aim</Eyebrow>
        <Display s="{One sentence} for the life you’re building." />
        <Body s="What you want, by when, and what you’ll give for it. You read it morning and night." style={{ marginTop: space.xs }} />
        <Btn label="Write your Aim" onPress={() => nav.go('aimnew')} style={{ marginTop: space.lg }} />
      </Page>
    );
  }
  const read = (period: 'morning' | 'night') => { const key = aimReadKey(period); if (aim.readLog.includes(key)) return; set({ aim: { ...aim, readLog: [...aim.readLog, key] } }); feedback.file(); };
  const morning = aim.readLog.includes(aimReadKey('morning')), night = aim.readLog.includes(aimReadKey('night'));
  const { streak, total } = streakOf(aim.readLog);
  const days = new Set(aim.readLog.map(e => e.slice(0, 10)));
  const cells: DotCell[] = Array.from({ length: 21 }, (_, k) => { const d = new Date(); d.setDate(d.getDate() - (20 - k)); const key = localDayKey(d); return days.has(key) ? 'on' : k === 20 ? 'now' : ''; });
  const statement = `By ${aim.when}, I will ${trimEnd(aim.what)}.`;
  const gambit = data.profile.monthlyGambit ?? `Move ${money(seed.finance.savingsMonthly)} into the Lifetime ISA`;
  const taxOpen = !data.completed.includes('uk-hmrc-tax-code');
  return (
    <Page screen="aim" scroll={false} backdrop={<PhotoBackdrop source={photos.keyshome} focal={{ x: 0.7, y: 0 }} fade={false} />}
      bar={{ kind: 'photo', left: <PhotoRound icon="back" label="Back" onPress={nav.close} />, right: <View style={styles.acts}>
        <PhotoRound icon="arrowUp" label="Share" onPress={() => { void Share.share({ message: statement }); }} />
        <ActionMenu items={[
          { label: 'Edit your Aim', sub: 'Life keeps the history', icon: 'edit', onPress: () => nav.go('aimnew') },
          { label: 'This month’s gambit', icon: 'spark', onPress: () => nav.go('gambit') },
          { label: 'See a glimpse', sub: 'What it will feel like', icon: 'eye', onPress: () => nav.go('glimpse') },
        ]}>{open => <PhotoRound icon="more" label="Aim actions" onPress={open} />}</ActionMenu>
      </View> }}
      contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}>
      <View style={styles.aimHead}>
        <Eyebrow onPhoto>{`Chief Aim · ${p}% there`}</Eyebrow>
        <Display onPhoto s={`By {${aim.when}}, I will {${trimEnd(aim.what)}.}`} style={{ marginTop: space.xxs }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 392 }}>
        <View style={[styles.sheet, { backgroundColor: t.canvas }]}>
          <View style={[styles.handle, { backgroundColor: t.surface3 }]} />
          <Between style={{ alignItems: 'flex-end' }}>
            <Figure value={money(seed.finance.deposit)} />
            <Text variant="callout" tone="ink2" style={{ marginBottom: space.tile, textAlign: 'right' }}>{`of ${money(seed.finance.depositGoal)} · `}<Text variant="callout">{`${p}%`}</Text></Text>
          </Between>
          <Ruler pct={p} style={{ marginTop: space.sm }} />
          <Eyebrow style={{ marginTop: space.xxl }}>In your words</Eyebrow>
          <Statement s={`In return I will {${trimEnd(aim.give)}}. My plan: {${cap(trimEnd(aim.plan))}}.`} style={{ marginTop: space.xs }} />
          <Box style={{ marginTop: space.xl }}>
            <Between style={{ alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Micro>READ IT TODAY</Micro>
                <Text variant="headline" style={{ marginTop: space.xs }}>{streak ? `Day ${streak} streak` : `${total} days read`}</Text>
                <Text variant="callout" tone="ink2" style={{ marginTop: 2 }}>{morning && night ? 'Read twice today. See you in the morning.' : morning ? 'Morning done. Twenty seconds tonight.' : 'Twenty seconds, morning and night.'}</Text>
              </View>
              <View style={{ width: 104 }}><DotGrid cells={cells} columns={7} label={`Read on ${cells.filter(c => c === 'on').length} of the last 21 days`} /></View>
            </Between>
            <View style={[styles.acts, { marginTop: space.md }]}>
              <Btn label="Morning" icon={morning ? 'check' : undefined} ghost fit onPress={() => read('morning')} />
              <View style={{ flex: 1 }}><Btn label={night ? 'Tonight' : 'Read tonight'} icon={night ? 'check' : undefined} ghost={night} onPress={() => read('night')} /></View>
            </View>
          </Box>
          <SectionHead title="How it breaks down" />
          <RowsCard>
            {taxOpen ? <Row photo={photos.payslip} thumbFocal={{ y: 0.78 }} title="Today’s move" sub={`Finish the P87, ${money(seedTaxClaim.refund)} to the deposit`} right={<Chip label="6 min" />} onPress={() => { set({ selectedMission: 'uk-hmrc-tax-code' }); nav.go('mission'); }} /> : null}
            <Row photo={photos.aimdesk} thumbFocal={{ y: 0.66 }} title="This month’s gambit" sub={gambit.replace(/^I want to /, '').replace(/ this month\.?$/, '').replace(/^./, c => c.toUpperCase())} right={<Chip label="Nov" tone="q" />} onPress={() => nav.go('gambit')} />
          </RowsCard>
          <Press haptic="open" onPress={() => nav.go('aimnew')} accessibilityLabel="Edit your Aim" style={[styles.acts, { marginTop: space.lg, alignItems: 'center', alignSelf: 'flex-start' }]}>
            <Text variant="buttonCompact">Edit your Aim</Text><Icon name="chev" size={16} color={t.ink} />
          </Press>
          <Callout style={{ marginTop: space.xxs }}>Aims can change, and Life keeps the history.</Callout>
        </View>
      </ScrollView>
    </Page>
  );
}

/* ───────────────────────── This month's gambit ───────────────────────── */

const TIMES = ['Fri 18:00', 'Sat 10:00', 'Sat 17:00', 'Sun 19:00'] as const;

export function GambitV26() {
  const t = useTokens(), nav = useNavigation(), { data, set, choose } = useSeed();
  const [k, setK] = useState(Number(data.choices['gambit-k'] ?? 0) || 0);
  const [time, setTime] = useState<(typeof TIMES)[number]>((TIMES as readonly string[]).includes(data.choices['gambit-checkin'] ?? '') ? data.choices['gambit-checkin'] as (typeof TIMES)[number] : TIMES[0]);
  const g = gambits[k] ?? gambits[0];
  const sentence = `I want to ${g.a} and ${g.b} this month.`;
  const month = new Date().toLocaleDateString('en-GB', { month: 'long' });
  return (
    <Page screen="gambit" bar={{ kind: 'push', action: { kind: 'text', label: 'Your Aim', onPress: () => nav.go('aim') } }}
      footer={<Btn label={data.profile.monthlyGambit === sentence ? 'Committed · see you on check-in' : 'Commit to this'} onPress={() => { set({ profile: { ...data.profile, monthlyGambit: sentence } }); choose('gambit-k', String(k)); choose('gambit-checkin', time); feedback.file(); nav.close(); }} />}>
      <View style={[styles.photoStatement, { backgroundColor: t.surface2 }]}>
        <PhotoFill source={photos[g.photo]} focal={g.focal} />
        <LinearGradient pointerEvents="none" colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} />
        <View style={{ flexDirection: 'row', padding: space.md }}><StatusPill size="chip" onPhoto label={`${month} · for your Aim`} /></View>
        <View style={{ paddingHorizontal: space.cardPad, paddingBottom: space.cardPad }}><Statement onPhoto s={`I want to {${g.a}} and {${g.b}} this month.`} /></View>
      </View>
      <SectionHead title="This month’s gambit, in moves" />
      <Timeline items={[
        { when: 'FIRST', text: g.t1, state: 'now', children: <Text variant="callout" tone="ink2" style={{ marginTop: 2 }}>{g.s1}</Text> },
        { when: 'THEN', text: g.t2, state: 'later', children: <Text variant="callout" tone="ink2" style={{ marginTop: 2 }}>{g.s2}</Text> },
        { when: 'WEEKLY CHECK-IN', text: 'Two minutes with Life, at a time you choose.', state: 'later', children: <SegmentedV26 options={TIMES.map(v => ({ value: v, label: v }))} value={time} onChange={setTime} style={{ marginTop: space.sm }} /> },
      ]} />
      <SectionHead title="Suggestions from your Aim" link="tap to swap" />
      <RowsCard>
        {gambits.map((o, n) => <Row key={o.t1} photo={photos[o.photo]} thumbFocal={o.photo === 'desk' ? { x: 0.78 } : { y: 0.78 }} title={o.t1} sub={`then ${o.t2.charAt(0).toLowerCase()}${o.t2.slice(1)}`} right={<Tick on={n === k} />} onPress={() => { setK(n); feedback.select(); }} />)}
      </RowsCard>
    </Page>
  );
}

/* ───────────────────────── A glimpse, earned ───────────────────────── */

export function GlimpseV26() {
  const nav = useNavigation(), t = useTokens(), insets = useSafeAreaInsets(), { data } = useSeed();
  const aim = data.aim ?? seedAim;
  const year = aim.when.match(/\d{4}/)?.[0] ?? '';
  const earned = [
    { title: 'Opened your Lifetime ISA', sub: '+25% on every £ you save' },
    { title: 'Buffer reached 1 month', sub: 'The safe side of your barbell' },
  ];
  return (
    <Page screen="glimpse" scroll={false} backdrop={<PhotoBackdrop source={photos.keyshome} focal={{ x: 0.1, y: 0.62 }} fade={false} />}
      bar={{ kind: 'photo', left: <View style={styles.glimpseChip}><StatusPill size="chip" onPhoto label="Glimpse · 1 of 3" /></View> }}
      bottom={
        <View style={[styles.glimpseSheet, { backgroundColor: t.surface, paddingBottom: insets.bottom + space.lg }]}>
          <Eyebrow>{`Earned · your Aim, first home${year ? `, ${year}` : ''}`}</Eyebrow>
          <Text variant="welcome" style={{ marginTop: space.xs }}>{'Your own\nfront door.'}</Text>
          <View style={styles.earned}>
            {earned.map(e => <View key={e.title} style={styles.earnedItem}>
              <View style={{ marginTop: 1 }}><Icon name="checkCircle" size={16} color={t.ink} /></View>
              <Text variant="callout" tone="ink2" style={{ flex: 1 }}><Text variant="callout">{e.title}</Text>{`\n${e.sub}`}</Text>
            </View>)}
          </View>
          <Between style={{ marginTop: 14 }}>
            <Text variant="callout" tone="ink2" style={{ flex: 1 }}><Text variant="callout">Next glimpse at 60%</Text>{'\nRun your rent vs buy numbers'}</Text>
            <Btn label="Keep going" icon="arrow" trail fit onPress={nav.close} />
          </Between>
        </View>
      }>
      <View style={{ flex: 1 }} />
    </Page>
  );
}

const styles = StyleSheet.create({
  composer: { flexDirection: 'row', alignItems: 'center', gap: space.tile, borderRadius: radius.lg, paddingVertical: space.xs, paddingRight: space.xs, paddingLeft: space.md, minHeight: 60 },
  input: { flex: 1, fontSize: 17, lineHeight: 24, maxHeight: 120, paddingVertical: space.xs },
  suggest: { flexDirection: 'row', alignItems: 'center', gap: space.xs, height: 34, paddingLeft: space.xs, paddingRight: space.sm, borderRadius: radius.full },
  acts: { flexDirection: 'row', gap: space.xs },
  aimHead: { height: 200, paddingHorizontal: space.gutter, paddingTop: 6 },
  sheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: space.gutter, paddingBottom: 40, minHeight: 600 },
  handle: { width: 36, height: 5, borderRadius: 3, alignSelf: 'center', marginTop: space.xs, marginBottom: 14 },
  photoStatement: { minHeight: 260, borderRadius: radius.photo, overflow: 'hidden', justifyContent: 'space-between' },
  glimpseChip: { borderRadius: radius.full },
  glimpseSheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: space.gutter, paddingTop: 18 },
  earned: { flexDirection: 'row', gap: space.sm, marginTop: 14 },
  earnedItem: { flex: 1, flexDirection: 'row', gap: space.tile, alignItems: 'flex-start' },
});

