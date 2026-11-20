/**
 * Tab 2 · Plan, restyled to the V26 board (`core.js` plan and mission, `today-plan-you.js` the rest of Plan).
 * Missions read the engine's catalogue; ticked steps, clearing and drafts save on this phone.
 */
import { useEffect, useState, type ReactNode } from 'react';
import { Linking, Modal, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import * as Clipboard from 'expo-clipboard';
import { useLocalSearchParams } from 'expo-router';
import { TASK_CATALOG } from '@life/core/engine';
import {
  AccordionGroup, ChatBubble, CheckRows, DotGrid, Field, FilterChips, Icon, PhotoCard, PhotoFill, PhotoGrid, Press, RoundButton, Ruler, SectionHead,
  SegmentedV26, Text, TintCard, V26Tile, VoiceNote, areaColors, cardShadow, componentSize, feedback, fonts, photo, photos, radius, space, useTokens,
  type Area, type DotCell, type PhotoName,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import type { ScreenKey } from '@/navigation/screens';
import { useSeed } from '@/state/SeedProvider';
import { useBrainJob } from '@/services/useBrainJob';
import type { DraftData } from '@life/brain';
import { missionPriority, missionStepList } from '@/state/loops';
import { finishStep, readLoops, undoStep } from '@life/core';
import { money, seed, seedTaxClaim } from '@/state/seed';
import { SHOW_SAMPLES } from '@/state/sample';
import { invoices, sampleCleared, sampleClearedTotal, TOOLS } from '@/state/plan';
import { BigPhoto, Between, Body, Btn, Callout, Chip, Display, Eyebrow, Micro, Page, PhotoBackdrop, PhotoRound, QuietLink, Row, RowsCard, Statement, Timeline } from './kit';
import { SearchV26 } from './today';

type Task = (typeof TASK_CATALOG)[number];
const taskById = (id: string) => TASK_CATALOG.find(t => t.id === id);

/** Opens a tool, or the locked-tool sheet when it sits above your level and you haven't opened it early. */
export function useOpenTool() {
  const nav = useNavigation(), { data, engine, choose } = useSeed();
  return (key: ScreenKey, level: number, title: string) => {
    if (level > engine.level.currentLevel && !data.flags[`unlocked-${key}`]) { choose('unlock-tool', key); choose('unlock-tool-title', title); choose('unlock-tool-level', String(level)); nav.go('unlock'); }
    else nav.go(key);
  };
}

/* ───────────────────────── Plan ───────────────────────── */

export function PlanV26() {
  const nav = useNavigation(), openTool = useOpenTool(), { data, engine, set } = useSeed();
  const [searching, setSearching] = useState(false);
  const pct = Math.round(seed.finance.deposit / seed.finance.depositGoal * 100);
  const habit = data.habits[0];
  const openMission = (id: string) => { set({ selectedMission: id }); nav.go('mission'); };
  const done = (id: string) => data.completed.includes(id);
  const ready = [
    !done('uk-hmrc-tax-code') ? <Row key="tax" icon="doc" title="Check your tax code" sub="Start with your payslip · 4 min" onPress={() => nav.go('taxcheck', { state: 'code' })} /> : null,
    <Row key="cash" icon="wallet" title="Set your cash plan" sub="Know what the month needs" onPress={() => nav.go('cashplan')} />,
    habit ? <Row key="habit" icon="walk" title={habit.name} sub={`Day ${habit.day} of about 66`} onPress={() => nav.go('habits')} /> : null,
  ].filter(Boolean);
  const waiting = [
    !done('uk-single-person-council') ? <Row key="ct" icon="doc" title="Council tax request" sub="Sent 9 Nov · waiting for a reply" right={<Chip label="Waiting" tone="q" />} onPress={() => openMission('uk-single-person-council')} /> : null,
    !done('nhs-outpatient-referral') ? <Row key="ref" icon="heart" title="Heart referral" sub="About 11 weeks · Life keeps watch" right={<Chip label="Waiting" tone="q" />} onPress={() => openMission('nhs-outpatient-referral')} /> : null,
  ].filter(Boolean);
  const area = (p: PhotoName, name: string, tag: string, line: string, to: ScreenKey, focal?: { x?: number; y?: number }) => (
    <PhotoCard source={photos[p]} focal={focal} height={168} size="md" chips={[tag]} title={name} sub={line} onPress={() => nav.go(to)} />
  );
  return (
    <Page screen="plan" bar={{ kind: 'root', title: 'Plan', actions: [{ kind: 'icon', icon: 'search', label: 'Search', onPress: () => setSearching(true) }, { kind: 'icon', icon: 'add', label: 'Add to plan', onPress: () => nav.go('newgoal') }] }}>
      <Eyebrow star>Your plan</Eyebrow>
      <Display s="{Everything you’re managing.} Not everything to do today." />
      {data.aim?.what
        ? <PhotoCard source={photos.keyshome} focal={{ y: 0.66 }} height={232} chips={[`Chief Aim · ${data.aim.when || 'no date yet'}`]} chipRight={`${pct}%`} title={sentenceCase(data.aim.what)}
            sub={`${money(seed.finance.deposit)} of ${money(seed.finance.depositGoal)} · ${money(seed.finance.savingsMonthly)} a month`} onPress={() => nav.go('aim')} style={{ marginTop: space.lg }} />
        : <PhotoCard source={photos.aimwrite} height={200} chips={['Chief Aim']} title="Write your Aim" sub="One sentence: what, by when, and what you’ll give for it." onPress={() => nav.go('aimnew')} style={{ marginTop: space.lg }} />}
      <SectionHead title="Your areas" link="All six" onLink={() => setSearching(true)} />
      <PhotoGrid>
        {area('areahome', 'Home', '1 situation', 'Rent up in March', 'areahome')}
        {area('payslip', 'Money', `${ready.length - (habit ? 1 : 0)} ready`, 'Tax code · cash plan', 'area', { y: 0.8 })}
        {area('walk', 'Health', '1 ready', habit ? `${habit.name.split(' ')[0]} · day ${habit.day} of 66` : 'GP, dentist, tests', 'areahealth', { y: 0.3 })}
        {area('areawork', 'Work', `${invoices.unpaid} unpaid`, `Invoices · ${money(invoices.total)}`, 'areawork')}
      </PhotoGrid>
      <AccordionGroup initial="ready" style={{ marginTop: space.lg }} items={[
        { key: 'ready', title: 'Ready when you are', count: ready.length, content: <>{ready}<QuietLink label="What Life has found for you" ink center={false} onPress={() => nav.go('ttk')} style={{ marginTop: space.xs }} /></> },
        { key: 'situations', title: 'Situations', count: 1, content: <Row photo={photos.keys} title="My rent is going up" sub="From March · 2 open steps" onPress={() => nav.go('areahome')} /> },
        { key: 'waiting', title: 'Waiting, not forgotten', count: waiting.length, content: <>{waiting.length ? waiting : <Callout>Nothing waiting on anyone else.</Callout>}<QuietLink label="All missions" ink center={false} onPress={() => nav.go('missions')} style={{ marginTop: space.xs }} /></> },
        { key: 'tools', title: 'Your tools', count: TOOLS.length, content: <>
          <Row icon="cash" title="30-day cash plan" sub="Money" onPress={() => nav.go('cashplan')} />
          <Row icon="home" title="Rent vs buy" sub="Home" right={3 > engine.level.currentLevel && !data.flags['unlocked-rentbuy'] ? <Chip label="Level 3" tone="q" /> : undefined} onPress={() => openTool('rentbuy', 3, 'Rent vs buy')} />
          <Row icon="calculator" title="Tax check" sub="Money" onPress={() => nav.go('taxcheck')} />
          <View style={{ flexDirection: 'row', gap: space.lg, marginTop: space.xs }}>
            <QuietLink label="All tools" ink center={false} onPress={() => nav.go('tools')} />
            <QuietLink label="Documents and renewals" ink center={false} onPress={() => nav.go('vault')} />
          </View>
        </> },
      ]} />
      <Modal visible={searching} animationType="fade" presentationStyle="fullScreen" onRequestClose={() => setSearching(false)}>
        <SafeAreaProvider initialMetrics={initialWindowMetrics}><SearchV26 onClose={() => setSearching(false)} /></SafeAreaProvider>
      </Modal>
    </Page>
  );
}

const sentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/* ───────────────────────── Mission ───────────────────────── */

function useMission() {
  const { data } = useSeed();
  const task = taskById(data.selectedMission) ?? taskById('uk-hmrc-tax-code')!;
  const isTax = task.id === 'uk-hmrc-tax-code', isReferral = task.id === 'nhs-outpatient-referral';
  const title = isTax ? 'Tax rebate' : isReferral ? 'Hospital referral' : task.shortTitle;
  const value = isTax ? seedTaxClaim.refund : task.estimatedValueAmount;
  const reference = isTax ? seedTaxClaim.reference : isReferral ? 'UBRN-4821-0934' : task.id.toUpperCase();
  const steps = missionStepList(task.id).map(s => s.title);
  const area = isTax ? 'Money' : isReferral || task.category === 'health' ? 'Health' : task.lifeArea === 'home' ? 'Home' : 'Plan';
  const draft = data.drafts[task.id] ?? (isTax
    ? `Hello,\n\nI’m following up on my P800 calculation for 2024/25 (ref ${seedTaxClaim.reference}). I’ve also submitted form P87 today for ${money(seedTaxClaim.workExpenses)} of work equipment and software.\n\nPlease pay the refund by bank transfer to the account on my Personal Tax Account.\n\nThank you,\n${data.profile.name}`
    : task.copilotDraft ?? `Hello,\n\nI’m following up about ${task.shortTitle.toLowerCase()}. Could you help me with the next step?\n\nThank you,\n${data.profile.name}`);
  return { task, isTax, isReferral, title, value, reference, steps, area, draft };
}

export function MissionV26() {
  const nav = useNavigation(), { data, set, update } = useSeed(), surface = useCardSurface();
  const m = useMission();
  const [copied, setCopied] = useState(false);
  const cleared = data.completed.includes(m.task.id);
  const stepKey = (i: number) => `${m.task.id}-${i}`;
  const left = m.steps.filter((_, i) => !data.missionSteps[stepKey(i)]).length;
  // A tick here is the same tick Get unstuck makes, with its time, so it shows in what moved forward.
  const toggle = (i: number) => update(c => {
    const key = stepKey(i), on = !c.missionSteps[key], priority = missionPriority(m.task.id) ?? { id: `mission:${m.task.id}`, text: m.title, own: false, mission: m.task.id, steps: [] };
    const step = priority.steps[i] ?? { key, title: m.steps[i], mission: m.task.id };
    return { ...c, missionSteps: { ...c.missionSteps, [key]: on }, loops: on ? finishStep(readLoops(c.loops), step, priority, Date.now()) : undoStep(readLoops(c.loops), key) };
  });
  const clear = () => { set({ completed: cleared ? data.completed.filter(id => id !== m.task.id) : [...data.completed, m.task.id] }); if (!cleared) feedback.cleared(); };
  const go = () => {
    if (m.isTax) void Linking.openURL('https://www.gov.uk/guidance/claim-income-tax-relief-for-your-employment-expenses-p87');
    else nav.go('draft');
  };
  const headline = m.isTax
    ? `{Tax rebate.} About {${money(m.value ?? 0)}} back, ${left ? `${left === 1 ? 'one form' : `${left} steps`} to go` : 'ready to clear'}.`
    : `{${m.title}.} ${m.value ? `About {${money(m.value)}}. ` : ''}${left ? `${left} ${left === 1 ? 'step' : 'steps'} to go.` : 'Ready to clear.'}`;
  return (
    <Page screen="mission" bar={{ kind: 'push', action: { kind: 'menu', label: 'Mission actions', items: [
      { label: 'Draft message', sub: 'Already filled in for you', icon: 'doc', onPress: () => nav.go('draft') },
      { label: cleared ? 'Undo cleared' : 'Mark as cleared', icon: 'checkCircle', onPress: clear },
      { label: 'Share reference', icon: 'arrowUp', onPress: () => { void Share.share({ message: `${m.title} · ${m.reference}` }); } },
      { label: 'Why am I seeing this?', icon: 'help', onPress: () => nav.go('why') },
    ] } }}>
      <Eyebrow>{`${m.area} · ${m.task.provider}`}</Eyebrow>
      <Display s={headline} />
      <Timeline style={{ marginTop: space.lg }} items={[
        { when: m.isTax ? 'THU 12 NOV' : 'ADDED', text: m.isTax ? 'Life noticed an emergency tax code on your March payslip.' : 'Added to your plan from what you told Life.', state: 'done' },
        ...(m.isTax ? [{ when: 'FRI 13 NOV', text: '“I think I overpaid when I changed jobs.”', state: 'done' as const, children: <VoiceNote duration="0:34" style={{ marginTop: space.xs }} /> }] : []),
        { when: cleared ? 'CLEARED' : 'TODAY', text: cleared ? 'Cleared. Life keeps the reference.' : left ? (left === 1 ? 'One step left.' : `${left} steps left.`) : 'Every step ticked.', state: cleared ? 'done' : 'now', children: cleared ? undefined : (
          <View style={[styles.card, { marginTop: space.sm, padding: space.md }, surface]}>
            <Chip label={m.isTax ? 'Finish the P87 · 6 min' : `${m.task.shortTitle}`} tone="live" />
            <CheckRows items={m.steps.map((label, i) => ({ label, done: !!data.missionSteps[stepKey(i)] }))} onToggle={toggle} style={{ marginTop: space.xs }} />
            <Btn label={left ? 'Continue' : 'Mark as cleared'} icon="arrow" trail onPress={left ? go : clear} style={{ marginTop: space.md }} />
          </View>
        ) },
        { when: m.isTax ? 'ABOUT 22 NOV' : 'AFTER', text: m.isTax ? 'HMRC replies. Life will watch for it and tell you.' : 'Life watches for the reply and tells you.', state: 'later' },
      ]} />
      <View style={[styles.card, styles.between, { marginTop: space.lg, padding: space.md }, surface]}>
        <View style={{ flex: 1 }}><Micro>Reference</Micro><Text variant="title" style={{ marginTop: space.xxs, fontVariant: ['tabular-nums'] }}>{m.reference}</Text></View>
        <Chip label={copied ? 'Copied' : 'Copy'} icon="copy" onPress={async () => { await Clipboard.setStringAsync(m.reference); setCopied(true); feedback.select(); }} />
      </View>
      <Callout style={{ marginTop: space.md }}>{m.isTax ? 'An estimate from your payslip and what you told Life, not tax advice.' : 'Guidance from what you’ve told Life, not advice.'}</Callout>
    </Page>
  );
}

function useCardSurface() {
  const t = useTokens();
  return { backgroundColor: t.surface, ...cardShadow(t.scheme) };
}

/* ───────────────────────── Draft message ───────────────────────── */

export function DraftV26() {
  const t = useTokens(), { draft } = useSeed(), surface = useCardSurface();
  const m = useMission();
  const [copied, setCopied] = useState(false);
  const to = m.isTax ? 'HMRC · PAYE enquiries' : m.task.provider;
  const subject = m.isTax ? 'P800 refund: bank transfer' : `${m.title} enquiry`;
  // "Write it with life's AI": the phone's own model first; the cloud asks first. Your details stay exactly as they are.
  const job = useBrainJob(`Draft · ${m.title}`);
  useEffect(() => {
    const body = job.state.step === 'done' ? (job.state.result.data as DraftData | undefined)?.body : undefined;
    if (body) { draft(m.task.id, body); feedback.select(); }
  }, [job.state]); // eslint-disable-line react-hooks/exhaustive-deps
  const rewrite = () => job.start('draft', `Write a short, polite email to ${to} about ${m.title}. Keep every name, date, amount and reference exactly as written here, and add none. My draft:\n\n${m.draft}`);
  return (
    <Page screen="draft" bar={{ kind: 'sheet', title: 'Draft message' }}
      footer={<View style={{ flexDirection: 'row', gap: space.xs }}>
        <Btn label={copied ? 'Copied' : 'Copy'} icon="copy" ghost fit onPress={async () => { await Clipboard.setStringAsync(m.draft); setCopied(true); feedback.select(); }} />
        <View style={{ flex: 1 }}><Btn label="Open in Mail" icon="arrow" trail onPress={() => { void Linking.openURL(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(m.draft)}`); }} /></View>
      </View>}>
      <View style={[styles.card, { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, marginTop: space.xxs }, surface]}>
        <View style={styles.thumb}><PhotoFill source={photos.payslip} focal={{ y: 0.75 }} /></View>
        <View style={{ flex: 1 }}><Text variant="title">{m.title}</Text><Text variant="callout" tone="ink2">Already filled in with your details</Text></View>
        <Chip label="Ready" tone="done" />
      </View>
      <View style={{ gap: space.xs, marginTop: space.sm }}><Field label="To" value={to} /><Field label="Subject" value={subject} /></View>
      <TextInput maxFontSizeMultiplier={1.3} multiline value={m.draft} onChangeText={v => draft(m.task.id, v)} accessibilityLabel="Draft message" selectionColor={t.ember}
        style={[styles.card, styles.letter, { color: t.ink, fontFamily: fonts.sans, marginTop: space.sm }, surface]} />
      <Callout style={{ marginTop: space.sm }}>Tap the text to edit. Life never sends anything without you.</Callout>
      {job.state.step === 'ask' ? (
        <View style={[styles.card, { padding: space.md, marginTop: space.sm }, surface]}>
          <Text variant="headline">Use Life’s AI for this draft?</Text>
          <Body style={{ marginTop: space.xs }} s="This sends the draft above to the Life API and its model, which rewrites it. {You check every word before anything is sent.}" />
          <View style={{ flexDirection: 'row', gap: space.xs, marginTop: space.sm }}><Chip label="Send the draft" onPress={job.allow} /><Chip label="Keep it here" tone="q" onPress={job.reset} /></View>
        </View>
      ) : job.state.step === 'working' ? <Callout style={{ marginTop: space.xs }}>Rewriting your draft…</Callout>
        : job.state.step === 'waiting' ? <Callout style={{ marginTop: space.xs }}>{`${job.state.note} The new draft will be in your conversations.`}</Callout>
        : job.state.step === 'failed' ? <Callout style={{ marginTop: space.xs }}>{job.state.message}</Callout>
        : job.available ? <QuietLink label="Write it with Life’s AI" center={false} onPress={rewrite} style={{ marginTop: space.xs }} /> : null}
    </Page>
  );
}

/* ───────────────────────── Things to know ───────────────────────── */

const AREA_PHOTO: Record<Area, PhotoName> = { you: 'people', home: 'letter', work: 'desk', money: 'payslip', health: 'bench', goal: 'keyshome' };
const AREA_NAME: Record<Area, string> = { you: 'You', home: 'Home', work: 'Work', money: 'Money', health: 'Health', goal: 'Goals' };

export function TtkV26() {
  const t = useTokens(), nav = useNavigation(), { data } = useSeed(), surface = useCardSurface();
  const [filter, setFilter] = useState<'All' | 'You' | 'Home' | 'Work' | 'Money' | 'Health' | 'Goals'>('All');
  const records = data.records.filter(r => r.status === 'confirmed' && (filter === 'All' || AREA_NAME[r.area] === filter));
  const rebate = !data.completed.includes('uk-hmrc-tax-code') && (filter === 'All' || filter === 'Money');
  return (
    <Page screen="ttk" bar={{ kind: 'push', title: 'Things to know' }}>
      <Eyebrow star>{`${Math.min(3, records.length + (rebate ? 1 : 0))} new`}</Eyebrow>
      <Display s="What Life has {found for you}, and {where it came from}." />
      <FilterChips options={(['All', 'You', 'Home', 'Work', 'Money', 'Health', 'Goals'] as const).map(v => ({ value: v, label: v }))} value={filter} onChange={setFilter} style={{ marginTop: space.lg }} />
      {rebate ? <PhotoCard source={photos.payslip} focal={{ y: 0.72 }} height={220} chips={['Money · from your talk · 12 Nov']} title={money(seedTaxClaim.refund)} sub="You’re likely owed a tax rebate for 2024/25 work expenses." onPress={() => nav.go('mission')} style={{ marginTop: space.md }} /> : null}
      {records.slice(0, 8).map(r => (
        <Press key={r.id} haptic="open" onPress={() => nav.go('editfiled')} accessibilityLabel={`${AREA_NAME[r.area]}: ${r.label}`} style={[styles.card, styles.know, { marginTop: space.sm }, surface]}>
          <View style={styles.knowPhoto}><PhotoFill source={photos[AREA_PHOTO[r.area]]} /></View>
          <View style={{ flex: 1, padding: space.md }}>
            <View style={styles.micro}><View style={[styles.dot, { backgroundColor: areaColors[t.scheme][r.area] }]} /><Text variant="micro" tone="ink2">{`${AREA_NAME[r.area]} · from your ${r.source.type}`}</Text></View>
            {typeof r.value === 'number' ? <Text variant="numeralL" style={{ marginTop: space.xs }}>{String(r.value)}</Text> : null}
            <Text variant="callout" tone="ink2" style={{ marginTop: space.xxs }}>{r.label}</Text>
          </View>
        </Press>
      ))}
      {!records.length && !rebate ? <Callout style={{ marginTop: space.md }}>Nothing filed here yet. Confirm something from a conversation and it shows here.</Callout> : null}
      {filter === 'All' || filter === 'Money' ? (
        <View style={[styles.card, { backgroundColor: t.surface2, padding: space.cardPad, marginTop: space.sm }]}>
          <View style={styles.micro}><Icon name="book" size={14} color={t.ink2} /><Text variant="micro" tone="ink2">How the world works · Money mechanics</Text></View>
          <Statement s="{Tax relief is applied, not given.}" style={{ marginTop: space.xs }} />
          <Body s="Most reliefs only reach you if you claim them. HMRC won’t add work expenses you never told them about." style={{ marginTop: space.xs }} />
        </View>
      ) : null}
    </Page>
  );
}

/* ───────────────────────── Missions history ───────────────────────── */

export function HistoryV26() {
  const { data } = useSeed();
  const cleared = TASK_CATALOG.filter(v => data.completed.includes(v.id));
  const samples = !cleared.length && SHOW_SAMPLES;
  const total = samples ? sampleClearedTotal : cleared.reduce((a, b) => a + (b.estimatedValueAmount ?? 0), 0);
  const count = samples ? sampleCleared.length : cleared.length;
  const months = samples ? [...new Set(sampleCleared.map(s => s.month))] : [];
  return (
    <Page screen="history" bar={{ kind: 'push', title: 'Cleared' }}>
      <BigPhoto source={photos.sky} focal={{ y: 0.08 }} height={220} chip={`${count} cleared`} line="Found and claimed since joining" figure={money(total)} />
      <Statement s="{The total keeps growing.} This is what it’s made of." style={{ marginTop: space.lg }} />
      {samples ? months.map(month => <View key={month}>
        <Micro style={{ marginTop: space.lg }}>{month}</Micro>
        <RowsCard style={{ marginTop: space.xs }}>{sampleCleared.filter(s => s.month === month).map(s => <Row key={s.title} photo={photos[s.photo]} title={s.title} sub={s.sub} end={s.end || undefined} endStrong right={s.tag ? <Chip label={s.tag} tone="q" /> : undefined} />)}</RowsCard>
      </View>) : cleared.length ? <RowsCard style={{ marginTop: space.lg }}>{cleared.map(v => <Row key={v.id} icon="checkCircle" title={v.shortTitle} sub="Cleared on this phone" end={v.estimatedValueAmount ? money(v.estimatedValueAmount) : undefined} endStrong />)}</RowsCard>
        : <Callout style={{ marginTop: space.lg }}>Your cleared missions gather here. Start with one small move.</Callout>}
      <Callout style={{ marginTop: space.md }}>{samples ? 'Sample history, shown in development builds only.' : 'Each figure is the outcome you recorded when it cleared.'}</Callout>
    </Page>
  );
}


/* ───────────────────────── All missions ───────────────────────── */

export function MissionsV26() {
  const t = useTokens(), nav = useNavigation(), { data, engine, set } = useSeed(), surface = useCardSurface();
  const [filter, setFilter] = useState<'All' | 'Money' | 'Home' | 'Body'>('All');
  const open = engine.tasks.filter(v => !data.completed.includes(v.id));
  const waitingIds = ['uk-single-person-council', 'nhs-outpatient-referral'];
  const inFilter = (v: Task) => filter === 'All' || (filter === 'Body' ? v.category === 'health' : filter === 'Money' ? v.category === 'tax' || v.lifeArea === 'money' : v.lifeArea === 'home');
  const needs = open.filter(v => !waitingIds.includes(v.id)).map(v => taskById(v.id)).filter((v): v is Task => !!v && inFilter(v));
  const waiting = open.filter(v => waitingIds.includes(v.id)).map(v => taskById(v.id)).filter((v): v is Task => !!v);
  const clearedN = data.completed.length;
  const cells: DotCell[] = [...Array(clearedN).fill('on'), ...Array(waiting.length).fill('miss'), ...(needs.length ? ['now'] : []), ...Array(Math.max(0, needs.length - 1)).fill('')].slice(0, 22) as DotCell[];
  const openMission = (id: string) => { set({ selectedMission: id }); nav.go('mission'); };
  const lead = needs[0], next = needs.slice(1, 3);
  const photoFor = (v: Task): PhotoName => v.category === 'health' ? 'walk' : v.lifeArea === 'home' ? 'keyshome' : v.category === 'tax' ? 'payslip' : 'work';
  return (
    <Page screen="missions" bar={{ kind: 'push', title: 'Missions', action: { kind: 'icon', icon: 'add', label: 'Add a mission', onPress: () => nav.go('newgoal') } }}>
      <Display flush s={`{${needs.length} need you.} ${waiting.length} are waiting, ${clearedN} are cleared.`} style={{ marginTop: space.xxs }} />
      {cells.length ? <DotGrid cells={cells} columns={Math.max(cells.length, 11)} style={{ marginTop: space.md }} label={`${clearedN} cleared, ${waiting.length} waiting, ${needs.length} need you`} /> : null}
      <SegmentedV26 options={(['All', 'Money', 'Home', 'Body'] as const).map(v => ({ value: v, label: v }))} value={filter} onChange={setFilter} style={{ marginTop: space.lg }} />
      {lead ? <PhotoCard source={photos[photoFor(lead)]} focal={{ y: 0.72 }} height={210} chips={['Next · ready when you are']} chipRight={lead.estimatedValueAmount ? money(lead.estimatedValueAmount) : undefined}
        title={lead.shortTitle} sub={lead.subtitle} onPress={() => openMission(lead.id)} style={{ marginTop: space.md }} /> : <Callout style={{ marginTop: space.md }}>Nothing needs you in this filter.</Callout>}
      {next.length ? <PhotoGrid style={{ marginTop: space.sm }}>
        {next.map(v => <PhotoCard key={v.id} source={photos[photoFor(v)]} height={170} size="sm" chips={['This week']} title={v.shortTitle} sub={v.subtitle} onPress={() => openMission(v.id)} />)}
      </PhotoGrid> : null}
      {waiting.length ? <>
        <SectionHead title="Waiting, not forgotten" link={String(waiting.length)} />
        <RowsCard>{waiting.map(v => <Row key={v.id} photo={photos[v.category === 'health' ? 'bench' : 'letter']} title={v.shortTitle} sub="Sent · Life watches for the reply" right={<Chip label="Waiting" tone="q" />} onPress={() => openMission(v.id)} />)}</RowsCard>
      </> : null}
      <Press haptic="open" onPress={() => nav.go('history')} accessibilityLabel={`${clearedN} cleared, what they were worth`} style={[styles.card, styles.between, { padding: space.md, marginTop: space.sm }, surface]}>
        <Text variant="title">{`${clearedN} cleared`}</Text>
        <View style={styles.micro}><Text variant="callout" tone="ink2">What they were worth</Text><Icon name="chev" size={16} color={t.ink2} /></View>
      </Press>
    </Page>
  );
}

/* ───────────────────────── Add something ───────────────────────── */

const STARTERS = ['Clear a debt', 'Get fitter', 'Start a business', 'Learn to invest'];

export function NewGoalV26() {
  const t = useTokens(), nav = useNavigation(), { data, set, draft } = useSeed();
  const [said, setSaid] = useState(data.drafts['newgoal-said'] ?? (SHOW_SAMPLES ? 'I want to move out of my parents’ by next summer' : ''));
  const [typing, setTyping] = useState(!said);
  const goal = said.trim() ? (said === 'I want to move out of my parents’ by next summer' ? 'Move out by July 2027' : sentenceCase(said.replace(/^i (want|would like|need) to /i, '').replace(/[.!]$/, ''))) : '';
  const add = () => {
    if (!goal) return;
    draft('newgoal-said', said);
    set({ records: [...data.records, { id: `goal-${Date.now()}`, kind: 'goal', area: 'goal', label: goal, source: { type: 'record', at: new Date().toISOString(), excerpt: said }, status: 'confirmed' }] });
    feedback.file(); nav.close();
  };
  return (
    <Page screen="newgoal" bar={{ kind: 'sheet', title: 'A new goal', action: { kind: 'node', node: <RoundButton icon="mic" size="sm" label="Say it" onPress={() => nav.go('talk')} /> } }} footer={<Btn label="Add to Plan" disabled={!goal} onPress={add} />}>
      {typing
        ? <TextInput maxFontSizeMultiplier={1.3} autoFocus value={said} onChangeText={setSaid} onSubmitEditing={() => setTyping(false)} placeholder="Say it in your own words" placeholderTextColor={t.ink2} selectionColor={t.ember} accessibilityLabel="Your goal, in your words" returnKeyType="done"
            style={[styles.goalInput, { color: t.ink, backgroundColor: t.surface2, fontFamily: fonts.sansMedium }]} />
        : <Press haptic="select" onPress={() => setTyping(true)} accessibilityLabel={`Edit: ${said}`} style={{ alignItems: 'flex-end', marginTop: space.xxs }}><ChatBubble text={said} /></Press>}
      {goal ? <>
        <Eyebrow orb style={{ marginTop: space.lg }}>Life would make this</Eyebrow>
        <PhotoCard source={photos.bedroom} focal={{ y: 0.78 }} height={190} chips={['Goal · 3 steps']} title={goal} style={{ marginTop: space.sm }} />
        <Timeline style={{ marginTop: space.lg }} items={[
          { when: 'FIRST MOVE', text: 'Work out what you can afford', state: 'now' },
          { when: 'THEN', text: `Save a ${money(seed.finance.rent * 2)} deposit and first month`, state: 'later' },
          { when: 'THEN', text: 'Check renter schemes in your area', state: 'later' },
        ]} />
      </> : null}
      <Micro style={{ marginTop: space.lg }}>OR START FROM</Micro>
      <View style={[styles.wrap, { marginTop: space.xs }]}>
        {STARTERS.map(s => <Press key={s} haptic="select" onPress={() => { setSaid(`I want to ${s.toLowerCase()}`); setTyping(false); }} accessibilityLabel={s} style={[styles.soft, { backgroundColor: t.surface2 }]}><Text variant="buttonCompact">{s}</Text></Press>)}
      </View>
    </Page>
  );
}

/* ───────────────────────── Areas ───────────────────────── */

export function AreaHomeV26() {
  const t = useTokens(), nav = useNavigation(), openTool = useOpenTool(), { set } = useSeed();
  const pct = Math.round(seed.finance.deposit / seed.finance.depositGoal * 100);
  return (
    <Page screen="areahome" scroll={false} backdrop={<PhotoBackdrop source={photos.areahome} focal={{ y: 0.42 }} height={340} />}
      bar={{ kind: 'photo', left: <PhotoRound icon="back" label="Back" onPress={nav.close} />, right: <PhotoRound icon="info" label="Why these show here" onPress={() => nav.go('why')} /> }} contentStyle={{ paddingHorizontal: 0, paddingBottom: 0, paddingTop: 0 }}>
      <View style={styles.areaHead}>
        <Chip label="Area · Steady" onPhoto />
        <Text variant="display" style={{ color: photo.onPhoto, marginTop: space.tile, fontFamily: fonts.sansSemibold }}>Home</Text>
        <Text variant="callout" style={{ color: photo.onPhoto2 }}>Renting now. Aim: your own place by June 2029.</Text>
      </View>
      <View style={[styles.rise, { backgroundColor: t.canvas }]}>
        <ScrollArea>
          <TintCard area="home" onPress={() => nav.go('aim')} accessibilityLabel={`Deposit plan, ${pct}%`}>
            <Between><Micro>Deposit plan</Micro><Text variant="title">{`${pct}%`}</Text></Between>
            <Text variant="headline" style={{ marginTop: space.tile }}>{`${money(seed.finance.deposit)} of ${money(seed.finance.depositGoal)}`}</Text>
            <Ruler pct={pct} style={{ marginTop: space.sm }} />
            <Callout style={{ marginTop: space.xs }}>{`${money(seed.finance.savingsMonthly)} a month`}</Callout>
          </TintCard>
          <RowsCard style={{ marginTop: space.sm }}><Row photo={photos.letter} title="Council tax discount" sub="Mission · waiting on reply" right={<Chip label="Waiting" tone="q" />} onPress={() => { set({ selectedMission: 'uk-single-person-council' }); nav.go('mission'); }} /></RowsCard>
          <PhotoGrid style={{ marginTop: space.sm }}>
            <PhotoCard source={photos.bedroom} focal={{ y: 0.75 }} height={170} size="sm" chips={['Tool · level 2']} title="Your next home: bedrooms" onPress={() => openTool('bedrooms', 2, 'Your next home: bedrooms')} />
            <PhotoCard source={photos.keyshome} focal={{ x: 0.58, y: 0.68 }} height={170} size="sm" chips={['Idea · 60 seconds']} title="Lifetime ISA" onPress={() => { set({ selectedMission: 'uk-lifetime-isa' }); nav.go('mission'); }} />
          </PhotoGrid>
        </ScrollArea>
      </View>
    </Page>
  );
}

/** The scrolling part of a page that rises over a photograph. */
function ScrollArea({ children }: { children: ReactNode }) {
  return <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.gutter, paddingTop: space.lg, paddingBottom: 40 }}>{children}</ScrollView>;
}

export function AreaHealthV26() {
  const nav = useNavigation(), openTool = useOpenTool(), { set } = useSeed(), surface = useCardSurface();
  return (
    <Page screen="areahealth" bar={{ kind: 'push', action: { kind: 'icon', icon: 'info', label: 'Why these show here', onPress: () => nav.go('why') } }}>
      <Eyebrow right={<Chip label="Good" tone="done" />}>Area · Health</Eyebrow>
      <Display s="{The admin of staying well.} GP, prescriptions, dentist, tests." />
      <PhotoCard source={photos.run} focal={{ y: 0.52 }} height={176} title="Body" sub="How you feel day to day lives here." topRight={<View style={[styles.go, { backgroundColor: photo.onPhoto }]}><Icon name="arrow" size={18} color={photo.ink} /></View>} onPress={() => nav.go('body')} style={{ marginTop: space.lg }} />
      <View style={[styles.card, { padding: space.cardPad, marginTop: space.sm }, surface]}>
        <View style={{ flexDirection: 'row', gap: space.sm, alignItems: 'center' }}>
          <View style={styles.thumb}><PhotoFill source={photos.walk} focal={{ y: 0.3 }} /></View>
          <View style={{ flex: 1 }}><Micro sig>Mission · 10 min</Micro><Text variant="title" style={{ marginTop: space.xxs }}>Book a GP blood test</Text></View>
        </View>
        <Btn label="Open mission" icon="arrow" trail onPress={() => { set({ selectedMission: 'bloodwork-baseline-panel' }); nav.go('mission'); }} style={{ marginTop: space.md }} />
      </View>
      <View style={[styles.row2, { marginTop: space.sm }]}>
        <TintCard area="health" padding={space.md} style={{ flex: 1 }}><Text variant="callout" tone="ink2">Dentist check-up</Text><Text variant="numeralL" style={{ marginTop: space.xs }}>March</Text><Callout>When it’s due</Callout></TintCard>
        <TintCard area="money" padding={space.md} style={{ flex: 1 }}><Text variant="callout" tone="ink2">Prescriptions</Text><Text variant="numeralL" style={{ marginTop: space.xs }}>£60<Text variant="unit" tone="ink2"> a year</Text></Text><Callout>Prepayment could save this</Callout></TintCard>
      </View>
      <RowsCard style={{ marginTop: space.sm }}><Row icon="doc" title="Bloodwork reader" sub="Tool" right={<Chip label="Level 3" tone="q" />} onPress={() => openTool('blood', 3, 'Bloodwork reader')} /></RowsCard>
      <Callout style={{ marginTop: space.md }}>Wellness admin from what you’ve told Life, not medical advice.</Callout>
    </Page>
  );
}

export function AreaWorkV26() {
  const nav = useNavigation(), openTool = useOpenTool(), { set } = useSeed();
  return (
    <Page screen="areawork" bar={{ kind: 'push', action: { kind: 'icon', icon: 'info', label: 'Why these show here', onPress: () => nav.go('why') } }}>
      <Eyebrow>Area · Work</Eyebrow>
      <Display s={`{Freelance designer.} Aim: {${money(invoices.workAim / 1000)}k} by next year.`} />
      <View style={[styles.row2, { marginTop: space.lg }]}>
        <PhotoCard source={photos.areawork} focal={{ x: 0.42, y: 0.86 }} height={262} size="md" chips={['Progress']} title="Building" style={{ flex: 1 }} />
        <View style={{ flex: 1, gap: space.tile }}>
          <TintCard area="work" padding={space.md} onPress={() => nav.go('income')} accessibilityLabel={`Unpaid invoices, ${invoices.unpaid}, ${money(invoices.total)}`} style={{ flex: 1 }}>
            <Between><Text variant="callout" tone="ink2">Unpaid invoices</Text><Text variant="callout" tone="ink2">{String(invoices.unpaid)}</Text></Between>
            <Text variant="numeralL" style={{ marginTop: space.xs }}>{money(invoices.total)}</Text><Callout>Invoice tracker</Callout>
          </TintCard>
          <V26Tile label="Self-employed" value={invoices.registerBy} sub="Register by then" style={{ flex: 1 }} />
        </View>
      </View>
      <AccordionGroup initial="missions" style={{ marginTop: space.sm }} items={[
        { key: 'missions', title: 'Missions', count: 1, content: <Row photo={photos.payslip} title="Register as self-employed" sub={`Due ${invoices.registerBy}`} onPress={() => { set({ selectedMission: 'sole-trader-tax-vault' }); nav.go('mission'); }} /> },
        { key: 'tools', title: 'Tools', count: 2, content: <>
          <Row photo={photos.work} title="Income and structure" sub="Sole trader or Ltd?" onPress={() => openTool('income', 3, 'Income & structure')} />
          <Row photo={photos.aimdesk} title="Invoice tracker" sub={`${invoices.unpaid} unpaid · ${money(invoices.total)}`} />
        </> },
        { key: 'ideas', title: 'Ideas', count: 1, content: <Row photo={photos.calmdesk} title="Deep work" sub="Idea · Cal Newport lens" onPress={() => nav.go('library')} /> },
      ]} />
    </Page>
  );
}

/** Keeps the selected mission valid when a route opens with `?mission=`. */
export function useMissionParam() {
  const params = useLocalSearchParams<{ mission?: string }>(), { set } = useSeed();
  useEffect(() => { if (params.mission && taskById(params.mission)) set({ selectedMission: params.mission }); }, [params.mission]); // eslint-disable-line react-hooks/exhaustive-deps
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg },
  between: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  thumb: { width: componentSize.thumb, height: componentSize.thumb, borderRadius: radius.tile, overflow: 'hidden' },
  letter: { padding: space.cardPad, fontSize: 16, lineHeight: 24, minHeight: 260, textAlignVertical: 'top' },
  know: { flexDirection: 'row', overflow: 'hidden', minHeight: 120 },
  knowPhoto: { width: 104 },
  micro: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  soft: { height: 36, paddingHorizontal: 14, borderRadius: radius.full, justifyContent: 'center' },
  goalInput: { marginTop: space.xxs, minHeight: 52, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: 14, fontSize: 16, lineHeight: 22 },
  areaHead: { height: 200, justifyContent: 'flex-end', paddingHorizontal: space.gutter, paddingBottom: 28 },
  rise: { flex: 1, borderTopLeftRadius: 28, borderTopRightRadius: 28, marginTop: -12, overflow: 'hidden' },
  go: { width: componentSize.roundSm, height: componentSize.roundSm, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  row2: { flexDirection: 'row', gap: space.tile },
});
