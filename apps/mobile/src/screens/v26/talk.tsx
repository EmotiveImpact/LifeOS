/**
 * Talk and file, restyled to the V26 board (`core.js` talk and understood, `talk-toolkit.js` the rest).
 * Talk always shows the live filing: words arrive, recognised phrases light up and drop into their area tiles.
 */
import { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withSequence, withSpring, withTiming } from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';
import { extractStatements, type Message } from '@life/brain';
import {
  ChatBubble, CompactStepper, DecisionDrawer, FilterChips, Icon, KeyValue, LifeOrb, PhotoCard, PhotoFill, PhotoGrid, Press, RoundButton,
  SectionHead, Text, TintCard, areaColors, cardShadow, componentSize, feedback, fonts, motion, photo, photos, radius, space, useCalmMotion, useTokens,
  type Area, type PhotoName,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed, type SeedData } from '@/state/SeedProvider';
import { money, seed, type FiledRecord } from '@/state/seed';
import { compareUKBusinessStructures } from '@life/core/finance';
import { structureProfit } from './toolkit';
import { SHOW_SAMPLES } from '@/state/sample';
import { ai } from '@/services/ai';
import { SAMPLE_TALK, chunkTranscript, sampleStream, voice, type HeardChunk } from '@/services/voice';
import { useBrainConversation, newConversation } from '@/services/useBrainConversation';
import { useBrainJob } from '@/services/useBrainJob';
import { proposalRecord } from '@/services/brainState';
import { pickAttachment, removeAttachmentCopy } from '@/services/attachments';
import { ConversationAttachments } from '../ConversationAttachments';
import { Body, Btn, Callout, Chip, Display, Eyebrow, Micro, NotYetV26, Page, QuietLink, Row, RowsCard, Statement, Between, MoreRows, useLongList } from './kit';

const AREAS: [Area, string][] = [['you', 'You'], ['home', 'Home'], ['work', 'Work'], ['money', 'Money'], ['health', 'Health'], ['goal', 'Goals']];
const areaName = (a: Area) => AREAS.find(x => x[0] === a)?.[1] ?? a;
const listAreas = (areas: Area[]) => { const names = [...new Set(areas)].map(areaName); return names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0] ?? ''; };
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** The sample talk's details as records waiting for your yes. */
function sampleProposals(): FiledRecord[] {
  const at = new Date().toISOString();
  return SAMPLE_TALK.filter(c => c.area).map(c => ({ id: `talk-${slug(c.label!)}`, kind: 'fact' as const, area: c.area!, label: c.label!, source: { type: 'talk' as const, at, excerpt: `“${c.text.trim()}”` }, status: 'proposed' as const }));
}

/* ───────────────────────── Talk ───────────────────────── */

type Phase = 'listening' | 'review' | 'filed';

export function TalkV26() {
  const t = useTokens(), nav = useNavigation(), calm = useCalmMotion();
  const { data, set, update, confirmRecords } = useSeed();
  const params = useLocalSearchParams<{ setup?: string; state?: string }>();
  const preset = params.state === 'review' || params.state === 'filed' ? params.state : null;
  const [phase, setPhase] = useState<Phase>(preset ?? 'listening');
  const [chunks, setChunks] = useState<HeardChunk[]>(preset ? SAMPLE_TALK : []);
  const [lit, setLit] = useState<number[]>(preset ? SAMPLE_TALK.map((c, i) => c.area ? i : -1).filter(i => i >= 0) : []);
  const [hit, setHit] = useState<{ area: Area; key: number } | null>(null);
  const [secs, setSecs] = useState(0);
  const [mode, setMode] = useState<'sample' | 'live' | null>(preset ? 'sample' : null);
  const [ended, setEnded] = useState(!!preset);
  const [paused, setPaused] = useState(false);
  const [run, setRun] = useState(0);
  const [error, setError] = useState('');
  const stopStream = useRef<(() => void) | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const before = useRef<Pick<SeedData, 'records' | 'knowledge' | 'profile' | 'memories' | 'brain'> | null>(null);
  const filed = useRef<FiledRecord[]>(preset === 'filed' ? sampleProposals() : []);
  const mounted = useRef(true);
  // What you said, kept for "Ask life to read it" when life's own rules found nothing to file.
  const heard = useRef('');
  const job = useBrainJob('Your talk');
  useEffect(() => {
    if (job.state.step !== 'done') return;
    // What the model picked out is proposed for review, never filed (BUILD_V26 Phase 25).
    set({ proposals: job.state.result.proposals.map(proposal => proposalRecord(proposal, 'talk')) });
  }, [job.state]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; stopStream.current?.(); timers.current.forEach(clearTimeout); void voice.stop(); }; }, []);
  // Preview states (`?state=review|filed`) show the sample talk's own details, not whatever was waiting before.
  useEffect(() => { if (preset === 'review') set({ proposals: sampleProposals() }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Listen: the on-device recogniser when this phone has one, otherwise the board's talk as a labelled sample.
  useEffect(() => {
    if (phase !== 'listening' || paused || preset) return;
    let cancelled = false;
    void (async () => {
      const caps = await voice.capabilities().catch(() => null);
      if (cancelled) return;
      if (caps?.speechAvailable) {
        setMode('live');
        try {
          await voice.start((words, final, failure) => {
            if (!mounted.current) return;
            const found = extractStatements(words).map(p => ({ quote: p.quote, area: p.area, label: p.label }));
            const next = chunkTranscript(words, found);
            setChunks(next);
            setLit(next.map((c, i) => c.area ? i : -1).filter(i => i >= 0));
            if (final || failure) setEnded(true);
            if (failure) setError(failure);
          });
        } catch (e) { setError(e instanceof Error ? e.message : 'The microphone could not start. Type instead.'); setMode('sample'); }
        return;
      }
      setMode('sample');
      if (calm) { setChunks(SAMPLE_TALK); setLit(SAMPLE_TALK.map((c, i) => c.area ? i : -1).filter(i => i >= 0)); setEnded(true); return; }
      stopStream.current = sampleStream(k => {
        setSecs(s => s + 1);
        setChunks(SAMPLE_TALK.slice(0, k + 1));
        const c = SAMPLE_TALK[k];
        if (c.area) timers.current.push(setTimeout(() => { if (!mounted.current) return; setLit(l => [...l, k]); setHit({ area: c.area!, key: k }); feedback.select(); }, 450));
      }, () => setEnded(true), 850, chunks.length);
    })();
    return () => { cancelled = true; stopStream.current?.(); stopStream.current = null; };
  }, [phase, paused, run]); // eslint-disable-line react-hooks/exhaustive-deps

  const restart = () => { job.reset(); heard.current = ''; stopStream.current?.(); timers.current.forEach(clearTimeout); void voice.stop(); setChunks([]); setLit([]); setSecs(0); setEnded(false); setPaused(false); setError(''); set({ proposals: [] }); setPhase('listening'); setRun(r => r + 1); };
  const review = async () => {
    stopStream.current?.();
    const words = mode === 'live' ? (await voice.stop()) || chunks.map(c => c.text).join('') : '';
    const said = mode === 'live' ? await ai.talk(words) : null;
    heard.current = mode === 'live' ? words : '';
    // Distress always goes to support, never to filing (BUILD_V26 review focus 5).
    if (said?.support) { set({ proposals: [] }); nav.replace('support'); return; }
    const proposals = said ? said.data : sampleProposals();
    set({ proposals });
    setEnded(true);
    setPhase('review');
  };
  const fileAll = () => {
    before.current = { records: data.records, knowledge: data.knowledge, profile: data.profile, memories: data.memories, brain: data.brain };
    filed.current = data.proposals;
    confirmRecords();
    feedback.file();
    setPhase('filed');
  };
  const undo = () => { const snap = before.current; if (snap) update(c => ({ ...c, ...snap, proposals: filed.current })); setPhase('review'); };

  const shown = lit.map(i => chunks[i]).filter(Boolean);
  const proposals = phase === 'filed' ? filed.current : data.proposals.filter(p => p.status !== 'removed');
  const n = phase === 'listening' ? shown.length : proposals.length;
  const label = phase === 'filed' ? 'Filed' : phase === 'review' ? 'Here’s what I heard' : paused ? 'Paused' : ended ? 'Paused · tap stop to review' : `Listening · 0:${String(secs).padStart(2, '0')}`;

  const bottom = phase === 'review'
    ? (proposals.length
      ? <DecisionDrawer title={`File these ${proposals.length} ${proposals.length === 1 ? 'detail' : 'details'}?`} sub={`Into ${listAreas(proposals.map(p => p.area))}. You decide.`}
          leave={{ label: 'Leave them', onPress: restart }} confirm={{ label: `File all ${proposals.length}`, onPress: fileAll, haptic: null }} ask={{ label: 'Go through them one by one', onPress: () => nav.go('understood', params.setup ? { setup: '1' } : undefined) }} />
      : job.state.step === 'ask'
        ? <DecisionDrawer title="Send what you said to Life’s AI?" sub={`Your words${job.state.request.context.memories.length ? ` and ${job.state.request.context.memories.length} ${job.state.request.context.memories.length === 1 ? 'memory' : 'memories'}` : ''} go to the Life API and its model. Nothing is filed until you say so.`}
            leave={{ label: 'Keep it here', onPress: job.reset }} confirm={{ label: 'Send it', icon: 'arrowUp', onPress: job.allow }} />
        : job.state.step === 'working'
          ? <DecisionDrawer title="Reading what you said…" sub="Nothing is filed until you say so." undo={{ label: 'Stop', onPress: job.reset }} />
          : job.state.step === 'waiting'
            ? <DecisionDrawer title="Saved for later." sub={`${job.state.note} It’ll be in your conversations.`} undo={{ label: 'Keep talking', onPress: restart }} />
            : job.state.step === 'failed' || job.state.step === 'done'
              ? <DecisionDrawer title="Nothing to file yet." sub={job.state.step === 'failed' ? job.state.message : 'Life’s AI didn’t find anything to file either.'} undo={{ label: 'Keep talking', onPress: restart }} />
              : job.available && heard.current
                ? <DecisionDrawer title="Nothing to file yet." sub="Keep talking, or let Life’s AI read what you said." leave={{ label: 'Keep talking', onPress: restart }} confirm={{ label: 'Ask Life to read it', icon: 'spark', onPress: () => job.start('extract', heard.current) }} />
                : <DecisionDrawer title="Nothing to file yet." sub="Keep talking, or type it instead." undo={{ label: 'Keep talking', onPress: restart }} />)
    : phase === 'filed'
      ? <DecisionDrawer title="Filed." sub={`${filed.current.length} ${filed.current.length === 1 ? 'detail is' : 'details are'} in their places.${mode === 'sample' ? ' Your rent situation has a new date.' : ''}`} undo={{ onPress: undo }} />
      : null;

  return (
    <Page screen="talk" bar={{ kind: 'push', title: 'Talk', close: true, action: { kind: 'icon', icon: 'clock', label: 'Your conversations', onPress: () => nav.go('chathistory') } }}
      bottom={bottom}
      footer={phase === 'listening' ? <View style={{ alignItems: 'center', gap: space.tile }}>
        <View style={styles.controls}>
          <RoundButton icon="keyboard" label="Type instead" onPress={() => nav.replace('chat')} />
          <RoundButton icon="stop" size="xl" solid label="Stop and review" haptic="primary" onPress={() => { void review(); }} />
          <RoundButton icon={paused ? 'play' : 'pause'} label={paused ? 'Carry on' : 'Pause'} onPress={() => setPaused(p => !p)} />
        </View>
        <Callout center>Tap stop when you’re done. Nothing is saved yet.</Callout>
      </View> : undefined}>
      <Press haptic="select" onPress={restart} accessibilityLabel="Play it again" style={{ alignItems: 'center', paddingTop: space.xxs }}>
        <LifeOrb size={88} state={phase === 'filed' ? 'done' : phase === 'review' ? 'ring' : calm ? 'ring' : 'listening'} />
      </Press>
      <Callout center style={{ marginTop: space.xxs }}>{label}</Callout>
      <Text variant="statement" tone="ink2" style={{ marginTop: space.md, minHeight: 31 }} accessibilityLiveRegion="polite">
        {chunks.map((c, i) => <Text key={i} variant="statement" tone={c.area && lit.includes(i) ? 'ink' : 'ink2'}>{c.text}</Text>)}
      </Text>
      <SectionHead title="Filing into place" link={phase === 'listening' && !n ? 'Listening' : `${n} found`} style={{ marginTop: 22 }} />
      <View style={styles.areas}>
        {AREAS.map(([a, name]) => {
          const items = shown.filter(c => c.area === a);
          return <AreaTile key={a} area={a} name={name} count={items.length} text={items.length ? items[items.length - 1].label! : 'Nothing yet'} hitKey={hit?.area === a ? hit.key : -1} />;
        })}
      </View>
      {mode === 'sample' ? <Callout style={{ marginTop: space.md }}>Sample talk. On-device speech isn’t available here, so Life plays an example.</Callout> : null}
      {error ? <Callout style={{ marginTop: space.xs }}>{error}</Callout> : null}
    </Page>
  );
}

/** One area's tile in Talk's filing grid: it bumps and inverts for a moment when a detail drops in. */
function AreaTile({ area, name, count, text, hitKey }: { area: Area; name: string; count: number; text: string; hitKey: number }) {
  const t = useTokens(), calm = useCalmMotion();
  const scale = useSharedValue(1), ink = useSharedValue(0);
  useEffect(() => {
    if (hitKey < 0) return;
    if (calm) { ink.value = withSequence(withTiming(1, { duration: 120 }), withDelay(700, withTiming(0, { duration: 200 }))); return; }
    scale.value = withSequence(withSpring(1.03, motion.snappy), withDelay(600, withSpring(1, motion.smooth)));
    ink.value = withSequence(withTiming(1, { duration: 180 }), withDelay(620, withTiming(0, { duration: 250 })));
  }, [hitKey]); // eslint-disable-line react-hooks/exhaustive-deps
  const box = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const wash = useAnimatedStyle(() => ({ opacity: ink.value }));
  const has = count > 0;
  return (
    <Animated.View style={[styles.area, { backgroundColor: t.surface, ...cardShadow(t.scheme) }, box]} accessible accessibilityLabel={`${name}: ${has ? `${count}, ${text}` : 'nothing yet'}`}>
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { borderRadius: radius.tile, backgroundColor: t.ink }, wash]} />
      <AreaTileText area={area} name={name} count={count} text={text} has={has} inverse={false} />
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { padding: space.tile, paddingHorizontal: space.sm }, wash]}>
        <AreaTileText area={area} name={name} count={count} text={text} has={has} inverse />
      </Animated.View>
    </Animated.View>
  );
}

function AreaTileText({ area, name, count, text, has, inverse }: { area: Area; name: string; count: number; text: string; has: boolean; inverse: boolean }) {
  const t = useTokens();
  return <>
    <View style={styles.areaHead}>
      <View style={[styles.dot, { backgroundColor: areaColors[t.scheme][area] }]} />
      <Text variant="label" tone={inverse ? 'inverse' : 'ink'} style={{ flex: 1 }} numberOfLines={1}>{name}</Text>
      <Text variant="label" tone={inverse ? 'inverse' : 'ink'} style={{ fontVariant: ['tabular-nums'] }}>{count ? String(count) : ''}</Text>
    </View>
    <Text variant="micro" tone={inverse ? 'inverse' : has ? 'ink2' : 'quiet'} style={{ marginTop: 6, fontFamily: fonts.sans, lineHeight: 14 }} numberOfLines={3}>{text}</Text>
  </>;
}

/* ───────────────────────── Understood ───────────────────────── */

export function UnderstoodV26() {
  const nav = useNavigation(), { data, set, flag, confirmRecords } = useSeed();
  const params = useLocalSearchParams<{ setup?: string }>();
  const [fix, setFix] = useState('');
  const kept = data.proposals.filter(p => p.status !== 'removed');
  const areas = [...new Set(kept.map(p => p.area))];
  const now = new Date();
  const when = `Today, ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  const toggle = (id: string) => set({ proposals: data.proposals.map(p => p.id === id ? { ...p, status: p.status === 'removed' ? 'proposed' : 'removed' } : p) });
  const iconFor = (a: Area) => a === 'home' ? 'home' as const : a === 'money' ? 'wallet' as const : a === 'health' ? 'heart' as const : a === 'work' ? 'briefcase' as const : a === 'goal' ? 'spark' as const : 'person' as const;
  const sendFix = async () => {
    const words = fix.trim();
    if (!words) return;
    const said = await ai.talk(words);
    if (said.support) { setFix(''); nav.go('support'); return; }
    const extra = said.data;
    set({ proposals: [...data.proposals.filter(p => !extra.some(e => e.id === p.id)), ...extra] });
    setFix('');
    feedback.file();
  };
  return (
    <Page screen="understood" bar={{ kind: 'sheet' }}
      footer={<>
        <Btn label={kept.length ? `File ${kept.length} ${kept.length === 1 ? 'detail' : 'details'}` : 'Nothing to file'} disabled={!kept.length} onPress={() => { confirmRecords(); flag('records-confirmed', true); feedback.file(); if (params.setup) nav.replace('where'); else nav.home(); }} />
        <Composer value={fix} onChange={setFix} placeholder="Fix something, like “the review is on 3 March”" onSend={() => { void sendFix(); }} />
      </>}>
      <Text variant="titleSerif" accessibilityRole="header">What Life understood from your talk</Text>
      <Eyebrow icon="clock" style={{ marginTop: space.xs }}>{`${when}${areas.length ? ` · ${listAreas(areas)}` : ''}`}</Eyebrow>
      <View style={[styles.wrapRow, { marginTop: space.md }]}><Chip label="Summary" icon="down" /><Chip label={`${kept.length} ${kept.length === 1 ? 'detail' : 'details'}`} tone="q" /></View>
      <Text variant="title" style={{ marginTop: space.xl }}>Overview</Text>
      <Body style={{ marginTop: space.xs }} s={kept.length ? `You told Life {${kept.length} ${kept.length === 1 ? 'thing' : 'things'}} worth keeping: ${kept.map(p => p.label).join('; ')}. Take out anything it got wrong before you file.` : 'Nothing is waiting to be filed. Keep talking, or type a fix below.'} />
      <RowsCard style={{ marginTop: space.md }}>
        {data.proposals.map(p => (
          <Row key={p.id} icon={iconFor(p.area)} title={p.label} sub={`${areaName(p.area)}${p.source.excerpt ? ` · ${p.source.excerpt}` : ''}`} onPress={() => toggle(p.id)}
            right={<Chip label={p.status === 'removed' ? 'Taken out' : 'Keep'} tone={p.status === 'removed' ? 'q' : undefined} />} style={p.status === 'removed' ? { opacity: 0.5 } : undefined} />
        ))}
      </RowsCard>
      <Callout style={{ marginTop: space.md }}>Tap a detail to take it out. Nothing changes until you file.</Callout>
    </Page>
  );
}

/** The board's composer: a white bar with a soft lift, the words, and a round send. */
export function Composer({ value, onChange, placeholder, onSend, onAttach, onMic, disabled }: { value: string; onChange: (v: string) => void; placeholder: string; onSend: () => void; onAttach?: () => void; onMic?: () => void; disabled?: boolean }) {
  const t = useTokens();
  const typing = value.trim().length > 0;
  return (
    <View style={[styles.composer, { backgroundColor: t.surface, shadowColor: '#000', shadowOpacity: t.scheme === 'dark' ? 0.4 : 0.12, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 6 }]}>
      {onAttach ? <RoundButton icon="add" size="sm" label="Attach" onPress={onAttach} /> : null}
      <TextInput maxFontSizeMultiplier={1.3} value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor={t.ink2} multiline editable={!disabled} accessibilityLabel={placeholder}
        style={[styles.composerInput, { color: t.ink, fontFamily: fonts.sans }]} selectionColor={t.ember} onSubmitEditing={onSend} blurOnSubmit />
      {onMic && !typing
        ? <RoundButton icon="mic" solid label="Hold to talk" onPress={onMic} style={{ width: 44, height: 44 }} />
        : <RoundButton icon="arrowUp" size="sm" solid label="Send" disabled={!typing || disabled} onPress={onSend} haptic="primary" />}
    </View>
  );
}

/* ───────────────────────── Ask, then file ───────────────────────── */

export function AskV26() {
  const nav = useNavigation(), { data, update, engine } = useSeed();
  const saved = !!data.flags['ask-saved'];
  // A real account asks about the profit it tried in Income and structure (or its own income), never £0.
  const structures = SHOW_SAMPLES ? engine.structures : compareUKBusinessStructures({ ...data.profile, annualIncome: structureProfit(data) });
  const sole = structures.soleTrader.netTakeHomeAnnual, ltd = structures.director.netTakeHomeAnnual;
  const gap = Math.abs(ltd - sole), fees = seed.finance.accountantFees;
  const stay = ltd - sole < fees;
  const revisit = 60_000;
  const save = () => update(c => ({ ...c, flags: { ...c.flags, 'ask-saved': true }, records: [...c.records.filter(r => r.id !== 'decision-structure'), { id: 'decision-structure', kind: 'decision', area: 'work', label: `Revisit sole trader or company if profit passes ${money(revisit)}`, source: { type: 'chat', at: new Date().toISOString() }, status: 'confirmed' }] }));
  const unsave = () => update(c => ({ ...c, flags: { ...c.flags, 'ask-saved': false }, records: c.records.filter(r => r.id !== 'decision-structure') }));
  return (
    <Page screen="ask" bar={{ kind: 'push', title: 'Ask Life', close: true, action: { kind: 'icon', icon: 'clock', label: 'Your conversations', onPress: () => nav.go('chathistory') } }}
      bottom={saved
        ? <DecisionDrawer title="Saved to Work." sub={`Life will bring it back if profit passes ${money(revisit / 1000)}k.`} undo={{ onPress: unsave }} />
        : <DecisionDrawer title="Save this to Work?" sub={`As a decision to revisit if profit passes ${money(revisit / 1000)}k.`}
            leave={{ label: 'Not now', onPress: nav.close }} confirm={{ label: 'Save to Work', onPress: () => { save(); feedback.file(); }, haptic: null }} ask={{ label: 'Ask a follow-up', icon: 'mic', onPress: () => nav.go('talk') }} />}>
      <View style={{ alignItems: 'flex-end' }}><ChatBubble text="Should I go limited company or stay a sole trader?" /></View>
      <PhotoCard source={photos.gotit} focal={{ y: 0.39 }} height={214} chips={[{ label: 'Life, from your numbers', orb: true }]} lead="For now," title={stay ? 'stay a sole trader.' : 'a company may pay.'} style={{ marginTop: space.md }} />
      <Body style={{ marginTop: space.sm }} s={`At your {${money((SHOW_SAMPLES ? data.profile.annualIncome : structureProfit(data)) / 1000)}k} profit, the two come out within about {${money(Math.max(100, Math.round(gap / 100) * 100))} a year}, and a company adds around {${money(fees)}} in accountant fees.`} />
      <TintCard area="work" padding={space.md} style={{ marginTop: space.md }}>
        <Between><Micro>{`Take-home per year · ${engine.income.taxYear}`}</Micro><Chip label="Engine estimate" /></Between>
        <View style={{ marginTop: space.xs }}><KeyValue label="Sole trader" value={money(sole)} /><KeyValue label="Limited company" value={money(ltd)} /></View>
      </TintCard>
      <Callout style={{ marginTop: space.md }}>An estimate from Life’s engine, not tax advice.</Callout>
    </Page>
  );
}

/* ───────────────────────── Attach ───────────────────────── */

/**
 * Add a photo, scan or file to the conversation. From Talk it closes back to the chat; as a real account's Scan (fix
 * F-64) it opens the chat with the attachment, where Life reads it with you.
 */
export function AttachV26({ screen = 'attach', then = 'close' }: { screen?: 'attach' | 'scan'; then?: 'close' | 'chat' } = {}) {
  const nav = useNavigation(), { data, update } = useSeed();
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const add = async (kind: 'camera' | 'photos' | 'files') => {
    if (busy) return; setBusy(true); setError('');
    const targetId = data.brain.activeConversationId;
    if ((data.brain.conversations.find(c => c.id === targetId)?.attachments.length ?? 0) >= 5) { setBusy(false); setError('Remove an attachment before adding another.'); return; }
    try {
      const attachment = await pickAttachment(kind);
      if (!attachment) return;
      update(state => {
        const existing = state.brain.conversations.find(c => c.id === targetId);
        const target = existing ?? newConversation();
        if (target.attachments.length >= 5) return state;
        const next = { ...target, attachments: [...target.attachments, attachment], updatedAt: new Date().toISOString() };
        return { ...state, brain: { ...state.brain, activeConversationId: next.id, conversations: existing ? state.brain.conversations.map(c => c.id === next.id ? next : c) : [...state.brain.conversations, next] } };
      });
      if (then === 'chat') nav.replace('chat'); else nav.close();
    } catch (e) { setError(e instanceof Error ? e.message : 'The attachment could not be added.'); }
    finally { setBusy(false); }
  };
  const corner = (icon: 'camera' | 'images' | 'folder' | 'pulse') => <View style={[styles.photoRound, { backgroundColor: photo.onPhoto }]}><Icon name={icon} size={componentSize.iconXs} color={photo.ink} /></View>;
  return (
    <Page screen={screen} bar={{ kind: 'push', title: then === 'chat' ? 'Scan' : 'Attach', close: true }}>
      <Display s={then === 'chat' ? '{Scan a letter or a document,} and Life reads it with you.' : '{Add something} to the conversation.'} flush />
      <PhotoCard source={photos.letter} focal={{ y: 0.6 }} height={204} chips={['Life reads it for you']} topRight={corner('camera')} title="Scan a letter" sub="Use your camera. Life files what matters." onPress={() => { void add('camera'); }} style={{ marginTop: space.lg }} />
      <PhotoGrid style={{ marginTop: space.tile }}>
        <PhotoCard source={photos.food} focal={{ x: 0.38, y: 0.42 }} height={138} size="sm" topRight={corner('camera')} title="Camera" sub="Take a photo" onPress={() => { void add('camera'); }} />
        <PhotoCard source={photos.siblings} focal={{ y: 0.42 }} height={138} size="sm" topRight={corner('images')} title="Photos" sub="Choose an image" onPress={() => { void add('photos'); }} />
        <PhotoCard source={photos.passport} focal={{ y: 0.7 }} height={138} size="sm" topRight={corner('folder')} title="Files" sub="Choose a document" onPress={() => { void add('files'); }} />
        <PhotoCard source={photos.breathe} focal={{ y: 0.34 }} height={138} size="sm" topRight={corner('pulse')} title="How I’m feeling" sub="Open Pulse" onPress={() => nav.go('pulse')} />
      </PhotoGrid>
      <Callout style={{ marginTop: space.md }}>{busy ? 'Choosing an attachment…' : error || 'Read, review, then confirm. Nothing is filed until you say so.'}</Callout>
    </Page>
  );
}

/* ───────────────────────── Letter, understood ───────────────────────── */

export function ScanV26() {
  // A real account scans its own letter: the sample's Lambeth council tax bill never shows (fix F-64).
  return SHOW_SAMPLES ? <ScanSampleV26 /> : <AttachV26 screen="scan" then="chat" />;
}

function ScanSampleV26() {
  const t = useTokens(), nav = useNavigation(), { data, flag } = useSeed();
  const annual = seed.finance.councilTaxAnnual, instalment = annual / 10;
  const alone = data.profile.householdSize === 1;
  const set = !!data.flags['direct-debit-preview'];
  return (
      <Page screen="scan" scroll={false} backdrop={<View style={[StyleSheet.absoluteFill, { bottom: undefined, height: 560 }]}><PhotoFill source={photos.letter} focal={{ x: 0.42, y: 0.32 }} /></View>} bar={{ kind: 'photo', left: <View style={[styles.darkChip]}><Text variant="micro" style={{ color: photo.onPhoto }}>Council tax bill · Lambeth</Text></View>,
        right: <Press haptic="select" onPress={nav.close} accessibilityLabel="Close" style={[styles.darkRound]}><Icon name="close" size={componentSize.iconSm} color={photo.onPhoto} /></Press> }}
        bottom={
          <View style={[styles.sheet, { backgroundColor: t.surface }]}>
            <View style={[styles.handle, { backgroundColor: t.surface3 }]} />
            <Between><Eyebrow>Sample scan · LBL-7741-0092</Eyebrow><Chip label="Read" tone="done" icon="check" /></Between>
            <Statement size="lead" style={{ marginTop: space.sm }} s={alone
              ? 'You’re billed as a shared household, but you told me you {live alone}. You may qualify for {25% off.}'
              : 'You’re billed as a shared household, and you told me you {live with 2 flatmates}. That’s right, so {no discount}. If one moves out, you’ll get {25% off.}'} />
            <Micro style={{ marginTop: space.lg }}>Filed into your life</Micro>
            <View style={[styles.row2, { marginTop: space.xs }]}>
              <FiledTile area="money" name="Money" text={`${money(instalment, 2)} a month from 1 Dec. Added to your cash plan.`} onPress={() => nav.go('editfiled')} />
              <FiledTile area="home" name="Home" text="Watch for a household change. Life will remind you." onPress={() => nav.go('household')} />
            </View>
            <View style={[styles.row2, { marginTop: space.md, alignItems: 'center' }]}>
              <Btn label="Ask Life" ghost fit onPress={() => nav.go('chat', { question: 'Explain my council tax letter' })} />
              <View style={{ flex: 1 }}><Btn label={set ? 'Reminder saved' : 'Set up the direct debit'} onPress={() => { flag('direct-debit-preview', true); feedback.file(); }} /></View>
            </View>
          </View>
        }>
        <View style={{ flex: 1 }}>
          <View pointerEvents="none" style={[styles.frame, { left: 2, right: 58, top: 8, bottom: 14 }]}>
            {(['tl', 'tr', 'bl', 'br'] as const).map(c => <Corner key={c} at={c} />)}
          </View>
          <Pin label="Amount" value={money(annual, 2)} style={{ left: 40, top: 80 }} />
          <Pin label="Due" value="1 Dec 2026 · 10 instalments" style={{ left: 50, top: 118 }} />
          <Pin label="Band" value="C" style={{ left: 60, top: 156 }} />
        </View>
      </Page>
  );
}

function Corner({ at }: { at: 'tl' | 'tr' | 'bl' | 'br' }) {
  const top = at[0] === 't', left = at[1] === 'l';
  const pos = { position: 'absolute' as const, [top ? 'top' : 'bottom']: 0, [left ? 'left' : 'right']: 0, width: 26, height: 26 };
  return <View style={pos}>
    <View style={{ position: 'absolute', [top ? 'top' : 'bottom']: 0, left: 0, width: 26, height: 4, borderRadius: 2, backgroundColor: photo.ink }} />
    <View style={{ position: 'absolute', top: 0, [left ? 'left' : 'right']: 0, width: 4, height: 26, borderRadius: 2, backgroundColor: photo.ink }} />
  </View>;
}

function Pin({ label, value, style }: { label: string; value: string; style: object }) {
  return <View style={[styles.pin, style]}><Text variant="micro" style={{ color: photo.onPhoto2 }}>{label}</Text><Text variant="label" style={{ color: photo.onPhoto, fontVariant: ['tabular-nums'] }}>{value}</Text></View>;
}

function FiledTile({ area, name, text, onPress }: { area: Area; name: string; text: string; onPress?: () => void }) {
  const t = useTokens();
  return (
    <Press haptic="open" onPress={onPress} accessibilityLabel={`${name}: ${text}`} style={[styles.filedTile, { backgroundColor: t.surface2 }]}>
      <View style={styles.areaHead}><View style={[styles.dot, { backgroundColor: areaColors[t.scheme][area] }]} /><Text variant="label" style={{ flex: 1 }}>{name}</Text><Text variant="label">1</Text></View>
      <Text variant="micro" tone="ink2" style={{ marginTop: 6, fontFamily: fonts.sans, lineHeight: 14 }}>{text}</Text>
    </Press>
  );
}

/* ───────────────────────── Chat ───────────────────────── */

const SUGGESTIONS = ['What’s urgent?', 'How am I doing?', 'My money', 'Teach me Self Assessment'];

export function ChatV26() {
  const t = useTokens(), nav = useNavigation(), { data, update, flag } = useSeed();
  const params = useLocalSearchParams<{ question?: string }>();
  const conversation = useBrainConversation();
  const [text, setText] = useState(params.question ?? ''), [error, setError] = useState('');
  const first = useRef(false);
  const ask = async (q: string) => { if (!q.trim() || conversation.thinking || conversation.pending) return; setText(''); await conversation.send(q); };
  useEffect(() => { if (params.question && !first.current) { first.current = true; void ask(params.question); } }, [params.question]); // eslint-disable-line react-hooks/exhaustive-deps
  const messages = conversation.current?.messages ?? [];
  const long = useLongList(messages, { from: 'end' });
  const title = (
    <Press haptic="select" onPress={() => nav.go('chathistory')} accessibilityRole="header" accessibilityLabel="Life, your conversations" style={styles.chatTitle}>
      <LifeOrb size={18} state={conversation.thinking ? 'thinking' : 'ring'} /><Text variant="title">Life</Text>
    </Press>
  );
  return (
    <Page screen="chat" bar={{ kind: 'push', titleNode: title, close: true, action: { kind: 'icon', icon: 'clock', label: 'Your conversations', onPress: () => nav.go('chathistory') } }}
      footer={<>
        <ConversationAttachments attachments={conversation.current?.attachments ?? []} onRemove={async attachment => {
          try { await removeAttachmentCopy(attachment); conversation.declineNetwork(); update(s => ({ ...s, brain: { ...s.brain, conversations: s.brain.conversations.map(c => c.id === conversation.current?.id ? { ...c, attachments: c.attachments.filter(f => f.id !== attachment.id) } : c) } })); }
          catch { setError('The attachment could not be removed yet. It stays listed so you can try again.'); }
        }} />
        {conversation.thinking ? <QuietLink label="Stop" ink onPress={conversation.stop} /> : null}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -space.gutter }} contentContainerStyle={{ paddingHorizontal: space.gutter, gap: space.xs, paddingBottom: space.xxs }}>
          {SUGGESTIONS.map(s => (
            <Press key={s} haptic="select" onPress={() => { void ask(s); }} accessibilityLabel={s} style={[styles.sug, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}><Text variant="buttonCompact">{s}</Text></Press>
          ))}
        </ScrollView>
        <Composer value={text} onChange={setText} placeholder="Message Life, or hold the mic" onAttach={() => nav.go('attach')} onMic={() => nav.go('talk')}
          onSend={() => { void ask(text.trim() || 'Read the attached text'); }} disabled={conversation.thinking || !!conversation.pending} />
      </>}>
      <View style={{ gap: 14 }}>
        {messages.length
          ? <><MoreRows earlier more={long.more} onPress={long.showMore} style={{ marginTop: 0 }} />{long.visible.map(m => <ChatMessage key={m.id} message={m} onReview={() => { conversation.review(m.proposals ?? []); flag('records-confirmed', false); nav.go('understood'); }} />)}</>
          : SHOW_SAMPLES ? <SampleThread /> : <>
            <Text variant="titleSerif" style={{ marginTop: space.md }}>What’s on your mind?</Text>
            <Body s="Ask about your plan, tell Life something to remember, or attach a document. {Nothing is saved until you say so.}" />
          </>}
        {conversation.thinking ? <View style={styles.checking}><LifeOrb size={20} state="searching" /><Callout>Working on your message…</Callout></View> : null}
        {conversation.pending ? (
          <View style={[styles.card, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
            <Text variant="headline">Use a model outside this phone?</Text>
            <Body style={{ marginTop: space.xs }} s={`This sends your message, {${conversation.pending.request.history.length} recent turns}, ${conversation.pending.request.context.facts.length} matched facts, ${conversation.pending.request.context.memories.length} memories and text from ${conversation.pending.request.attachments.filter(f => f.text).length} attachments to the Life API and its model. Original photos and file paths are not sent.`} />
            <Btn label="Allow for this message" onPress={() => { void conversation.allowNetwork(); }} style={{ marginTop: space.md }} />
            <QuietLink label="Keep it on this phone" onPress={conversation.declineNetwork} style={{ marginTop: space.xs }} />
          </View>
        ) : null}
        {error ? <Callout>{error}</Callout> : null}
        <Callout>{data.prefs.privateMode ? 'Private mode · nothing leaves this phone.' : 'Saved on this phone. Life’s engine and what you’ve confirmed answer without a model.'}</Callout>
      </View>
    </Page>
  );
}

/** One turn of a real conversation: your words on the right, life's with no bubble, details it heard as chips. */
function ChatMessage({ message, onReview }: { message: Message; onReview: () => void }) {
  const t = useTokens();
  const [why, setWhy] = useState(false);
  if (message.role === 'user') return <View style={{ alignItems: 'flex-end' }}><ChatBubble text={message.text} /></View>;
  return (
    <View style={{ gap: space.sm }}>
      <Text variant="headlineMedium" tone="ink">{message.text}</Text>
      {message.proposals?.length ? (
        <View style={styles.filed}>
          {message.proposals.map(p => (
            <Press key={p.id} haptic="open" onPress={onReview} accessibilityLabel={`Review: ${areaName(p.area)}, ${p.label}`} style={[styles.filedChip, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
              <View style={[styles.dot, { backgroundColor: areaColors[t.scheme][p.area] }]} /><Text variant="micro">{`To ${areaName(p.area)} · ${p.label}`}</Text>
            </Press>
          ))}
        </View>
      ) : null}
      {message.detail || message.sources?.length ? <QuietLink label={why ? 'Hide why' : 'Why this answer'} center={false} onPress={() => setWhy(w => !w)} /> : null}
      {why ? <View style={{ gap: space.xxs }}>
        {message.detail ? <Body s={message.detail} /> : null}
        {message.sources?.map(s => <Callout key={s.id}>{`${s.sample ? 'Sample · ' : ''}${s.label}${s.at ? ` · ${new Date(s.at).toLocaleDateString('en-GB')}` : ''}`}</Callout>)}
      </View> : null}
      {message.route ? <Callout>{message.route.startsWith('rules') ? 'From saved facts and Life’s engine · on this phone' : message.route.startsWith('device') ? 'On-device AI' : 'AI-assisted · outside this phone'}</Callout> : null}
    </View>
  );
}

/** The board's thread, played once in development builds while a real conversation is empty. */
function SampleThread() {
  const t = useTokens(), nav = useNavigation(), calm = useCalmMotion();
  const [step, setStep] = useState(calm ? 4 : 0), [checking, setChecking] = useState(false);
  useEffect(() => {
    if (calm) return;
    const at = (ms: number, fn: () => void) => setTimeout(fn, ms);
    const ts = [at(200, () => setStep(1)), at(900, () => setStep(2)), at(2000, () => setChecking(true)), at(3600, () => { setChecking(false); setStep(3); }), at(4200, () => setStep(4))];
    return () => ts.forEach(clearTimeout);
  }, [calm]);
  return (
    <View style={{ gap: 14 }} accessibilityLabel="Sample conversation">
      {step >= 1 ? <View style={{ alignItems: 'flex-end' }}><ChatBubble text="I’m 27, in London, and I just went freelance. What should I sort first?" /></View> : null}
      {step >= 2 ? <View style={[styles.filed, { marginTop: -6 }]}>
        {([['you', 'Filed to You · 27, London'], ['work', 'Filed to Work · went freelance']] as [Area, string][]).map(([a, l]) => (
          <View key={l} style={[styles.filedChip, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}><View style={[styles.dot, { backgroundColor: areaColors[t.scheme][a] }]} /><Text variant="micro">{l}</Text></View>
        ))}
      </View> : null}
      {checking ? <View style={styles.checking}><LifeOrb size={20} state="searching" /><Callout>Checking London schemes and the NHS…</Callout></View> : null}
      {step >= 3 ? <Statement s="Congrats on going freelance. Two things {matter this week}: register for {Self Assessment} by 5 October, and start a {tax pot} so January isn’t a shock." /> : null}
      {step >= 4 ? <PhotoGrid>
        <PhotoCard source={photos.payslip} focal={{ y: 0.82 }} height={184} size="sm" chips={[{ label: 'Due 5 Oct', dot: t.ember }]} title="Register as self-employed" sub="10 minutes on GOV.UK · Life drafts every answer" onPress={() => nav.go('taxcheck')} />
        <TintCard area="money" padding={space.md} style={{ height: 184 }} onPress={() => nav.go('cashplan')}>
          <Text variant="callout" tone="ink2">Tax pot</Text>
          <Text variant="numeralL" style={{ marginTop: 14 }}>25%</Text>
          <Text variant="callout" tone="ink2">Set aside from each invoice</Text>
          <View style={{ marginTop: 'auto' }}>
            <View style={[styles.meter, { backgroundColor: t.surface3 }]}><View style={{ width: '25%', height: '100%', borderRadius: radius.full, backgroundColor: areaColors[t.scheme].money }} /></View>
            <Callout style={{ marginTop: space.xs }}>{`≈ ${money(seed.finance.budget.find(b => b.name === 'Tax pot')?.limit ?? 0)} a month`}</Callout>
          </View>
        </TintCard>
      </PhotoGrid> : null}
      <Callout>Sample conversation, shown in development builds only.</Callout>
    </View>
  );
}

/* ───────────────────────── Your conversations ───────────────────────── */

const THREAD_PHOTOS: PhotoName[] = ['desk', 'letter', 'bedroom', 'birthday', 'terrace', 'journal'];
const SAMPLE_THREADS: { photo: PhotoName; focal: { x?: number; y?: number }; tag: string; title: string; n: number; kind: 'Chat' | 'Talk' | 'Scan' }[] = [
  { photo: 'letter', focal: { y: 0.62 }, tag: 'Scan · yesterday', title: 'Council tax letter', n: 2, kind: 'Scan' },
  { photo: 'bedroom', focal: { y: 0.7 }, tag: 'Talk · Monday', title: 'How I slept this week', n: 1, kind: 'Talk' },
  { photo: 'birthday', focal: { y: 0.62 }, tag: 'Talk · Sunday', title: 'Sister’s birthday plans', n: 2, kind: 'Talk' },
  { photo: 'terrace', focal: { x: 0.72 }, tag: 'Chat · last week', title: 'Rent vs buy', n: 4, kind: 'Chat' },
];

export function ChatHistoryV26() {
  const t = useTokens(), nav = useNavigation(), { data } = useSeed();
  const conversation = useBrainConversation();
  const [filter, setFilter] = useState<'All' | 'Chat' | 'Talk' | 'Scan'>('All');
  const [searching, setSearching] = useState(false), [query, setQuery] = useState('');
  const threads = data.brain.conversations.filter(c => c.messages.length && (!query || `${c.title} ${c.messages.map(m => m.text).join(' ')}`.toLowerCase().includes(query.toLowerCase()))).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const filedCount = (c: (typeof threads)[number]) => c.messages.reduce((n, m) => n + (m.proposals?.length ?? 0), 0);
  const useSamples = !threads.length && SHOW_SAMPLES && !query;
  const total = useSamples ? 5 : threads.length;
  const filedTotal = useSamples ? 12 : threads.reduce((n, c) => n + filedCount(c), 0);
  const when = (iso: string) => new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const open = (id: string) => { conversation.openThread(id); nav.go('chat'); };
  const long = useLongList(threads.slice(1));
  return (
    <Page screen="chathistory" onEnd={long.showMore} bar={{ kind: 'push', action: { kind: 'icon', icon: searching ? 'close' : 'search', label: searching ? 'Close search' : 'Search conversations', onPress: () => { setSearching(s => !s); setQuery(''); } } }}>
      <Eyebrow>Talk · your conversations</Eyebrow>
      {searching
        ? <TextInput maxFontSizeMultiplier={1.3} autoFocus value={query} onChangeText={setQuery} placeholder="Search conversations" placeholderTextColor={t.ink2} accessibilityLabel="Search conversations" selectionColor={t.ember}
            style={[styles.search, { color: t.ink, backgroundColor: t.surface2, fontFamily: fonts.sansMedium }]} />
        : <Display s={total ? `{${total} ${total === 1 ? 'conversation' : 'conversations'}.} ${filedTotal} things filed.` : '{No conversations yet.} They’ll gather here.'} />}
      {useSamples || threads.length ? <FilterChips options={(['All', 'Chat', 'Talk', 'Scan'] as const).map(v => ({ value: v, label: v }))} value={filter} onChange={setFilter} style={{ marginTop: space.md }} /> : null}
      {useSamples ? <>
        {filter === 'All' || filter === 'Chat' ? <PhotoCard source={photos.desk} focal={{ x: 0.78 }} height={176} chips={['Latest · Chat · today 09:12']} chipRight="Filed 3" title="Going freelance" sub="“What should I sort first?”" onPress={() => nav.go('chat')} style={{ marginTop: space.md }} /> : null}
        <PhotoGrid style={{ marginTop: space.tile }}>
          {SAMPLE_THREADS.filter(s => filter === 'All' || s.kind === filter).map(s => <PhotoCard key={s.title} source={photos[s.photo]} focal={s.focal} height={150} size="sm" chips={[s.tag]} title={s.title} sub={`Filed ${s.n}`} onPress={() => nav.go('chat')} />)}
        </PhotoGrid>
      </> : threads.length && (filter === 'All' || filter === 'Chat') ? <>
        <PhotoCard source={photos[THREAD_PHOTOS[0]]} focal={{ x: 0.78 }} height={176} chips={[`Latest · Chat · ${when(threads[0].updatedAt)}`]} chipRight={`Filed ${filedCount(threads[0])}`} title={threads[0].title} sub={`“${threads[0].messages.find(m => m.role === 'user')?.text ?? ''}”`} onPress={() => open(threads[0].id)} style={{ marginTop: space.md }} />
        <PhotoGrid style={{ marginTop: space.tile }}>
          {long.visible.map((c, i) => <PhotoCard key={c.id} source={photos[THREAD_PHOTOS[(i + 1) % THREAD_PHOTOS.length]]} height={150} size="sm" chips={[`Chat · ${when(c.updatedAt)}`]} title={c.title} sub={`Filed ${filedCount(c)}`} onPress={() => open(c.id)} />)}
        </PhotoGrid>
        <MoreRows more={long.more} onPress={long.showMore} />
      </> : null}
      <Btn label="New conversation" ghost onPress={() => { conversation.newThread(); nav.go('chat'); }} style={{ marginTop: space.lg }} />
      <Callout style={{ marginTop: space.md }}>Nothing here is needed to use Life. Everything useful is already filed in its place.</Callout>
    </Page>
  );
}

/* ───────────────────────── Edit what life filed ───────────────────────── */

type Token = 'what' | 'amount' | 'due' | 'where';

/** Changing something filed from chat. The sample's council tax line is Ama's; a real account changes its own in What Life knows. */
export function EditFiledV26() {
  const nav = useNavigation();
  return SHOW_SAMPLES ? <EditFiledSampleV26 /> : (
    <NotYetV26 screen="editfiled" title="Filed from chat" eyebrow="Filed from chat" line="What you tell Life is filed in What Life knows, and you can change it there."
      source="letter" focal={{ y: 0.6 }} ask="Tell Life something to file" examples="A bill, a date, a person, a goal.">
      <QuietLink label="See what Life knows" ink center={false} onPress={() => nav.go('knows')} style={{ marginTop: space.md }} />
    </NotYetV26>
  );
}

function EditFiledSampleV26() {
  const t = useTokens(), nav = useNavigation(), { data, update, flag } = useSeed();
  const [what, setWhat] = useState('Council tax');
  const [amount, setAmount] = useState(seed.finance.councilTaxMonthly);
  const [due, setDue] = useState('1st of each month');
  const [picked, setPicked] = useState<Token>('amount');
  const unfiled = !!data.flags['council-unfiled'];
  const said = `…and the council tax is ${money(seed.finance.councilTaxMonthly)} a month, due on the 1st.`;
  // A token keeps its trailing punctuation on the same line, so a wrap never starts with a comma.
  const tok = (key: Token, label: string, after = '') => (
    <View key={key} style={styles.tokRow}>
      <Press haptic="select" onPress={() => setPicked(key)} accessibilityLabel={`Change ${label}`} accessibilityState={{ selected: picked === key }} style={[styles.tok, { backgroundColor: picked === key ? t.emberTint : t.surface2 }]}>
        <Text variant="statement" style={{ color: picked === key ? t.emberText : t.ink, lineHeight: 36 }}>{label}</Text>
      </Press>
      {after ? <Text variant="statement" tone="ink2" style={{ lineHeight: 46 }}>{after}</Text> : null}
    </View>
  );
  const word = (s: string) => <Text variant="statement" tone="ink2" style={{ lineHeight: 46 }}>{s}</Text>;
  const save = () => {
    update(c => ({ ...c, records: [...c.records.filter(r => r.id !== 'council-edited'), { id: 'council-edited', kind: 'fact', area: 'money', label: `${what} · ${money(amount)} a month · ${due}`, value: amount, source: { type: 'chat', at: new Date().toISOString(), excerpt: said }, status: 'confirmed' }] }));
    feedback.file(); nav.close();
  };
  return (
    <Page screen="editfiled" bar={{ kind: 'sheet', title: 'Filed from chat' }}
      footer={<>
        <Btn label="Save" onPress={save} />
        <Between><QuietLink label={unfiled ? 'Undo unfile' : 'Unfile this'} ink center={false} onPress={() => { flag('council-unfiled'); update(c => ({ ...c, records: c.records.map(r => r.id === 'council-edited' ? { ...r, status: unfiled ? 'confirmed' : 'removed' } : r) })); }} /><Callout>Life learns from the correction.</Callout></Between>
      </>}>
      <View style={styles.sentence}>
        {tok('what', what)}{word(' is ')}{tok('amount', `${money(amount)} a month`, ',')}{word(' due on the ')}{tok('due', due, ',')}{word(' filed in ')}{tok('where', 'Money → Bills', '.')}
      </View>
      {picked === 'amount' ? <>
        <Micro center style={{ marginTop: space.lg }}>Amount, a month</Micro>
        <View style={{ marginTop: space.xs, alignItems: 'center' }}><CompactStepper value={amount} onChange={setAmount} min={0} max={2000} step={1} label="Amount a month" format={v => money(v)} /></View>
      </> : picked === 'where' ? <Callout style={{ marginTop: space.lg }}>Bills live in Money. Moving a bill elsewhere comes with the Money chapter.</Callout> : <>
        <Micro style={{ marginTop: space.lg }}>{picked === 'what' ? 'What it is' : 'When it’s due'}</Micro>
        <TextInput maxFontSizeMultiplier={1.3} value={picked === 'what' ? what : due} onChangeText={picked === 'what' ? setWhat : setDue} accessibilityLabel={picked === 'what' ? 'What it is' : 'When it’s due'} selectionColor={t.ember}
          style={[styles.field, { color: t.ink, backgroundColor: t.surface2, fontFamily: fonts.sansMedium }]} />
      </>}
      <View style={[styles.said, { backgroundColor: t.surface2, marginTop: space.lg }]}>
        <Text variant="micro" tone="ink2" style={{ marginBottom: space.xxs }}>You said</Text>
        <Text variant="body">{`“${said}”`}</Text>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  controls: { flexDirection: 'row', alignItems: 'center', gap: 22 },
  areas: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  area: { width: '31.6%', flexGrow: 1, minHeight: 76, borderRadius: radius.tile, paddingVertical: space.tile, paddingHorizontal: space.sm },
  areaHead: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  composer: { flexDirection: 'row', alignItems: 'center', gap: space.tile, borderRadius: radius.lg, paddingVertical: space.xs, paddingRight: space.xs, paddingLeft: space.tile, minHeight: 60 },
  composerInput: { flex: 1, fontSize: 15, lineHeight: 22, maxHeight: 120, paddingVertical: space.xs },
  photoRound: { width: componentSize.roundSm, height: componentSize.roundSm, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  darkChip: { backgroundColor: photo.ink, paddingVertical: 6, paddingHorizontal: space.tile, borderRadius: radius.full },
  darkRound: { width: componentSize.round, height: componentSize.round, borderRadius: radius.full, backgroundColor: photo.ink, alignItems: 'center', justifyContent: 'center' },
  sheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: space.lg, paddingBottom: 30 },
  handle: { width: 36, height: 5, borderRadius: 3, alignSelf: 'center', marginTop: space.xs, marginBottom: space.md },
  row2: { flexDirection: 'row', gap: space.xs },
  frame: { position: 'absolute' },
  pin: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 7, height: 30, paddingHorizontal: 13, borderRadius: radius.full, backgroundColor: photo.ink },
  filedTile: { flex: 1, borderRadius: radius.tile, paddingVertical: space.tile, paddingHorizontal: space.sm, minHeight: 76 },
  chatTitle: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  sug: { height: 36, paddingHorizontal: 14, borderRadius: radius.full, justifyContent: 'center' },
  checking: { flexDirection: 'row', alignItems: 'center', gap: space.tile },
  card: { borderRadius: radius.lg, padding: space.cardPad },
  filed: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-end', gap: 6 },
  filedChip: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingVertical: 6, paddingHorizontal: space.tile, borderRadius: radius.full },
  meter: { height: 6, borderRadius: radius.full, overflow: 'hidden' },
  search: { marginTop: space.tile, height: 48, borderRadius: radius.md, paddingHorizontal: space.md, fontSize: 16 },
  sentence: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', rowGap: space.tile, marginTop: space.xs },
  tokRow: { flexDirection: 'row', alignItems: 'center' },
  tok: { height: 36, paddingHorizontal: space.tile, borderRadius: space.sm, justifyContent: 'center' },
  field: { marginTop: space.xs, height: 52, borderRadius: radius.md, paddingHorizontal: space.md, fontSize: 16 },
  said: { borderRadius: radius.tile, paddingVertical: space.sm, paddingHorizontal: space.md },
});

