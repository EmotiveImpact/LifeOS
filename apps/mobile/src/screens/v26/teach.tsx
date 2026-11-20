/**
 * Teach me, restyled to the V26 board (`learn-teach-grow.js`): the offer beside the code it explains, the lesson's
 * cover, three bites with one picture each, a guess, a puzzle, the recap, telling it back, the one gap and the
 * earned moment. The lesson is built from your own payslip (`state/learn.ts` lessonNumbers). Real lessons come from
 * the brain in Phase 25; until then the lesson is the tax-code one and the telling-back is checked on the phone.
 */
import React, { useEffect, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChatBubble, Icon, LifeOrb, LifeSays, PhotoFill, Press, RoundButton, SectionHead, SegmentedV26, Text, TileGrid, V26Tile, cardShadow, feedback,
  fonts, motion, photo, photos, radius, space, useCalmMotion, useTokens,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import { SHOW_SAMPLES } from '@/state/sample';
import { learning, lesson, lessonNumbers, payslipCode, quoteFor, taxSoFar } from '@/state/learn';
import { ai } from '@/services/ai';
import { Between, Body, Box, Btn, Callout, Chip, Display, Eyebrow, Micro, Page, PhotoBox, QuietLink, Statement, drawerStyle, useDrawerPhoto } from './kit';
import { Mini, PicChain, PicFlow, PicGuess, PicParts, PicWrong } from './lessonpics';
import { OnPhotoRound, Option, PaperChip, Panel, useListen } from './learn';

const n = (v: number) => Math.round(v).toLocaleString('en-GB');
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

/** The lesson's bar: the topic, the bite you're on, and three short tracks under it. */
function lessonBar(step: number) {
  return { kind: 'push' as const, title: lesson.topic, close: true, action: { kind: 'node' as const, node: <Text variant="callout" tone="ink2" style={{ fontVariant: ['tabular-nums'] }}>{`${step} / 3`}</Text> } };
}
function Steps({ step }: { step: number }) {
  const t = useTokens();
  return (
    <View style={styles.steps} accessibilityLabel={`Bite ${step} of 3`}>
      {[1, 2, 3].map(k => (
        <View key={k} style={[styles.track, { backgroundColor: t.surface3 }]}>
          <View style={{ width: `${k < step ? 100 : k === step ? 55 : 0}%`, height: '100%', borderRadius: 2, backgroundColor: t.ink }} />
        </View>
      ))}
    </View>
  );
}

/** A tick in a dark circle, for the recap's lines and the things you said well. */
function TickOn() {
  const t = useTokens();
  return <View style={[styles.tick, { backgroundColor: t.ink }]}><Icon name="check" size={14} color={t.canvas} /></View>;
}

/** What the telling-back covered: each link of the chain, the words that showed it, and how long it took. */
type Told = { links: { label: string; ok: boolean; quote: string; gap: string; fix: string }[]; seconds: number };
const readAnalysis = (raw?: string): { part: string; quote: string }[] => { try { const v = JSON.parse(raw ?? '') as { understood?: unknown }; return Array.isArray(v.understood) ? v.understood.filter((u): u is { part: string; quote: string } => !!u && typeof u.part === 'string' && typeof u.quote === 'string') : []; } catch { return []; } };
function useTold(): Told {
  const { data } = useSeed();
  const text = data.drafts['tax-explanation'] ?? (SHOW_SAMPLES ? lesson.sampleTelling.filter(m => m.who === 'you').map(m => m.text).join(' ') : '');
  // The phone's own model may have heard a part your words didn't name; its quote is always your own words.
  const heard = readAnalysis(data.drafts['tax-analysis']);
  const links = lesson.links.map(l => { const model = heard.find(u => u.part.toLowerCase() === l.label.toLowerCase())?.quote; const quote = model ?? quoteFor(text, l.words); return { label: l.label, ok: !!quote, quote, gap: l.gap, fix: l.fix }; });
  return { links, seconds: Number(data.choices['tellback-seconds'] ?? (SHOW_SAMPLES ? 41 : 0)) || 0 };
}

/* ───────────────────────── Teach me, right where it's needed ───────────────────────── */

/** The Tax check with your payslip in view, Teach me in the same card as the code it explains (opens as `taxcheck?state=code`). */
export function TeachOfferV26() {
  const nav = useNavigation(), t = useTokens(), { data, flag } = useSeed();
  const so = taxSoFar();
  const later = !!data.flags['teach-offer-later'];
  const start = () => nav.go('lessonready', { state: 'building' });
  return (
    <Page screen="taxcheck" bar={{ kind: 'push', title: 'Tax & NI check', action: { kind: 'icon', icon: 'info', label: 'How this is worked out', onPress: () => flag('teach-offer-info', !data.flags['teach-offer-info']) } }}>
      <View style={[{ borderRadius: radius.lg }, cardShadow(t.scheme)]}>
        <View style={{ borderRadius: radius.lg, overflow: 'hidden', backgroundColor: t.surface }}>
          <PhotoBox source={photos.payslip} focal={{ y: 0.8 }} height={164} flat>
            <View style={styles.pin}><PaperChip label="From your last payslip" /></View>
          </PhotoBox>
          <View style={{ paddingHorizontal: 18, paddingTop: space.md, paddingBottom: 18 }}>
            <Eyebrow right={<Chip label="Check this" tone="live" />}>Your tax code</Eyebrow>
            <Text variant="numeralXl" style={{ marginTop: 6 }}>{payslipCode.label}</Text>
            <Body s="Your last payslip shows an {emergency code}. You may be paying too much tax." style={{ marginTop: space.xs }} />
            <Press haptic="open" onPress={start} accessibilityLabel="Teach me tax codes, 3 bites, about 2 minutes" style={[styles.offer, { backgroundColor: t.surface2, marginTop: space.md }]}>
              <View style={[styles.seat, { backgroundColor: t.surface }]}><LifeOrb size={26} /></View>
              <View style={{ flex: 1 }}>
                <Text variant="title">Teach me tax codes</Text>
                <Text variant="callout" tone="ink2">3 bites · about 2 minutes</Text>
              </View>
              <View style={[styles.solid, { backgroundColor: t.ink }]}><Icon name="arrow" size={18} color={t.canvas} /></View>
            </Press>
          </View>
        </View>
      </View>
      {data.flags['teach-offer-info'] ? <Box pad={space.md} style={{ marginTop: space.sm }}><Body s="life reads the code from your payslip. {M1} at the end means your tax is worked out on each month alone, usually a stopgap until your employer has your details. Check it in your {Personal Tax Account}." /></Box> : null}
      <TileGrid style={{ marginTop: space.sm }}>
        <V26Tile label="Tax so far this year" value={`£${n(so.tax)}`} sub="On track" />
        <V26Tile label="National Insurance" value={`£${n(so.ni)}`} sub="Class 1" />
      </TileGrid>
      {!later ? <>
        <SectionHead title="It also appears in Talk" />
        <Box>
          <View style={styles.inline}><LifeOrb size={18} /><Text variant="callout" tone="ink2">life, when you sound unsure</Text></View>
          <Statement size="headline" s="No worries, this sounds new to you. Want a {two-minute lesson} first, then tell me in your own words?" style={{ marginTop: space.xs }} />
          <View style={[styles.pair, { marginTop: space.md }]}>
            <Btn label="Teach me" ghost sm onPress={start} style={{ flex: 1 }} />
            <Btn label="Not now" ghost sm onPress={() => { flag('teach-offer-later', true); feedback.select(); }} style={{ flex: 1 }} />
          </View>
        </Box>
      </> : null}
      <Callout style={{ marginTop: space.md }}>Worked out from your payslip, not tax advice.</Callout>
    </Page>
  );
}

/* ───────────────────────── Your lesson, ready ───────────────────────── */

export function LessonreadyV26() {
  const nav = useNavigation(), t = useTokens(), { data, choose, flag } = useSeed(), insets = useSafeAreaInsets(), drawer = useDrawerPhoto();
  const params = useLocalSearchParams<{ state?: string }>(), calm = useCalmMotion();
  const [building, setBuilding] = useState(!!params.state?.startsWith('building'));
  const level = (data.choices['lesson-level'] as 'Simple' | 'Standard' | 'Deep') ?? 'Standard';
  useEffect(() => {
    if (!building || params.state === 'building-hold') return;
    const id = setTimeout(() => { setBuilding(false); feedback.brief(); }, calm ? 900 : 2400);
    return () => clearTimeout(id);
  }, [building, calm, params.state]);
  if (building) return (
    <Page screen="lessonready" bar={{ kind: 'push', close: true }} contentStyle={{ flexGrow: 1 }}>
      <Press haptic={null} onPress={() => setBuilding(false)} accessibilityLabel="Show the lesson" style={styles.orbArea}><LifeOrb size={220} state="working" /></Press>
      <Eyebrow>Teach me · a few seconds</Eyebrow>
      <Display s="Building your lesson from {your own payslip.}" />
      <Body s="Three bites, each with one picture and one quick puzzle." style={{ marginTop: space.sm }} />
    </Page>
  );
  return (
    <Page screen="lessonready" scroll={false} statusInk contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
      backdrop={<View pointerEvents="none" style={[StyleSheet.absoluteFill, { bottom: undefined, height: drawer.height ?? 262 }]}><PhotoFill source={photos.payslip} focal={{ y: 0.78 }} /></View>}
      bar={{ kind: 'photo', left: <Press haptic="select" onPress={() => setBuilding(true)} style={styles.paperChip} accessibilityLabel="Watch the lesson being built"><Text variant="buttonCompact" style={{ color: photo.ink }}>Teach me · your lesson is ready</Text></Press>,
        right: <OnPhotoRound icon="close" label="Close" solid onPress={nav.close} /> }}>
      <View style={{ flex: 1, minHeight: 130 }} />
      <View onLayout={drawer.onLayout} style={[drawerStyle, { backgroundColor: t.canvas, paddingTop: space.lg, paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} contentContainerStyle={{ paddingHorizontal: space.gutter }} showsVerticalScrollIndicator={false}>
          <Text variant="huge">{lesson.title}</Text>
          <Callout style={{ marginTop: space.xs }}>Using your own payslip, so the numbers are real.</Callout>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -space.gutter, marginTop: space.lg }} contentContainerStyle={{ paddingHorizontal: space.gutter, gap: space.tile, paddingBottom: space.md }}>
            {lesson.bites.map((b, k) => (
              <View key={b.title} style={[styles.bite, { backgroundColor: t.surface }, cardShadow(t.scheme)]}>
                <View style={[styles.art, { backgroundColor: t.surface2 }]}><Mini name={b.mini} /></View>
                <Text variant="micro" tone="ink2" style={{ marginTop: space.sm, paddingHorizontal: 4 }}>{`BITE ${k + 1} OF 3`}</Text>
                <Text variant="rowTitle" style={{ marginTop: 4, paddingHorizontal: 4 }}>{b.title}</Text>
                <Text variant="callout" tone="ink2" style={{ paddingHorizontal: 4 }}>{b.sub}</Text>
              </View>
            ))}
          </ScrollView>
          <SegmentedV26 options={(['Simple', 'Standard', 'Deep'] as const).map(v => ({ value: v, label: v }))} value={level} onChange={v => choose('lesson-level', v)} />
          <Btn label="Start · about 2 min" icon="play" onPress={() => { choose('lesson-topic', 'tax'); nav.go('bite'); }} style={{ marginTop: space.lg }} />
          <QuietLink label={data.flags['lesson-saved'] ? 'Saved for later' : 'Save for later'} onPress={() => { flag('lesson-saved', true); feedback.file(); nav.close(); }} style={{ marginTop: space.sm }} />
        </ScrollView>
      </View>
    </Page>
  );
}

/* ───────────────────────── A bite ───────────────────────── */

export function BiteV26() {
  const nav = useNavigation();
  return (
    <Page screen="bite" bar={lessonBar(1)} footer={<Btn label="Next" icon="arrow" trail onPress={() => nav.go('bitedrawn')} />}>
      <Steps step={1} />
      <Display s={`{${lesson.bites[0].title}}`} style={{ marginTop: 6 }} />
      <Panel style={{ marginTop: space.lg }}><PicParts /></Panel>
      <Statement s="The {number} is how much you can earn {tax-free}, without the last zero. The {letter} tells your employer which rules apply to you." style={{ marginTop: space.xl }} />
    </Page>
  );
}

/* ───────────────────────── A bite, drawn live ───────────────────────── */

export function BitedrawnV26() {
  const nav = useNavigation(), { data, choose } = useSeed(), calm = useCalmMotion(), params = useLocalSearchParams<{ state?: string }>();
  // Drawn live in the hand-drawn mode unless you switch it here (board `bitedrawn`).
  const style = data.choices['lesson-style'];
  const hand = params.state === 'clean' ? false : params.state === 'hand' ? true : style ? style === 'hand' : true;
  const [step, setStep] = useState(calm ? 4 : 1), [run, setRun] = useState(0);
  useEffect(() => {
    if (calm) { setStep(4); return; }
    setStep(1);
    const ids = [2, 3, 4].map((s, k) => setTimeout(() => setStep(s), 750 * (k + 1)));
    return () => ids.forEach(clearTimeout);
  }, [run, calm]);
  return (
    <Page screen="bitedrawn" bar={lessonBar(2)} footer={<Btn label="Next" icon="arrow" trail onPress={() => nav.go('predict')} />}>
      <Steps step={2} />
      <Between>
        <Text variant="title">{lesson.bites[1].title}</Text>
        <RoundButton icon="repeat" label="Replay the drawing" size="sm" onPress={() => setRun(r => r + 1)} />
      </Between>
      <SegmentedV26 options={[{ value: 'clean', label: 'Clean lines' }, { value: 'hand', label: 'Hand-drawn' }]} value={hand ? 'hand' : 'clean'}
        onChange={v => { choose('lesson-style', v); setRun(r => r + 1); }} style={{ marginTop: space.sm }} />
      <Panel style={{ marginTop: space.sm }}><PicFlow hand={hand} step={step} /></Panel>
      <Statement s="Each month your employer takes off {one twelfth} of your tax-free amount, then {taxes the rest}." style={{ marginTop: space.lg }} />
      <Callout style={{ marginTop: space.sm }}>Each sentence draws the next part. The lit box is the one being read.</Callout>
    </Page>
  );
}

/* ───────────────────────── Guess first, then see ───────────────────────── */

export function PredictV26() {
  const nav = useNavigation(), { choose } = useSeed(), params = useLocalSearchParams<{ state?: string }>();
  const [guess, setGuess] = useState<'more' | 'less' | null>(params.state === 'more' || params.state === 'less' ? params.state : null);
  const seen = guess !== null, right = guess === 'more';
  const pick = (g: 'more' | 'less') => { setGuess(g); choose('lesson-guess', g); if (g === 'more') feedback.complete(); else feedback.select(); };
  const L = lessonNumbers;
  return (
    <Page screen="predict" bar={lessonBar(2)} contentStyle={{ flexGrow: 1 }}
      footer={seen
        ? <><Btn label="Next" icon="arrow" trail onPress={() => nav.go('puzzle')} /><QuietLink label="Guess again" onPress={() => setGuess(null)} /></>
        : <View style={styles.pair}>
            <Btn label="More" icon="arrowUp" ghost onPress={() => pick('more')} style={{ flex: 1 }} />
            <Btn label="Less" icon="arrowDown" ghost onPress={() => pick('less')} style={{ flex: 1 }} />
          </View>}>
      <Steps step={2} />
      <Text variant="title">{lesson.bites[1].title}</Text>
      <Body s="Each month your employer takes off {one twelfth} of your tax-free amount, then taxes the rest." style={{ marginTop: space.xs }} />
      <Panel style={{ marginTop: space.md }}><PicGuess seen={seen} /></Panel>
      <View style={{ flex: 1, minHeight: space.lg }} />
      {seen ? <>
        <View style={{ flexDirection: 'row' }}><Chip label={right ? 'You guessed it' : 'A good guess. It goes the other way.'} tone={right ? 'done' : 'q'} /></View>
        <Display s="{More tax.} A smaller number means less of your pay is tax-free." />
      </> : <>
        <Eyebrow star>Your guess, before you see</Eyebrow>
        <Display s={`If your code were {${L.lowerCode}} instead of {${L.code}}, would you pay {more tax or less?}`} />
      </>}
    </Page>
  );
}

/* ───────────────────────── One quick puzzle ───────────────────────── */

export function PuzzleV26() {
  const nav = useNavigation(), { choose } = useSeed(), params = useLocalSearchParams<{ state?: string }>();
  const opts = lesson.puzzle.options, answer = lesson.puzzle.answer;
  const [pick, setPick] = useState<string | null>(opts.some(o => o.key === params.state) ? (params.state as string) : null);
  const done = pick !== null;
  const choosePick = (k: string) => { if (done) return; setPick(k); choose('lesson-puzzle', k); if (k === answer) feedback.complete(); else feedback.select(); };
  return (
    <Page screen="puzzle" bar={lessonBar(3)} footer={done ? <Btn label="See the recap" icon="arrow" trail onPress={() => nav.go('lessonrecap')} /> : undefined}>
      <Steps step={3} />
      <Text variant="title">{lesson.bites[2].title}</Text>
      <Panel style={{ marginTop: space.sm }}>
        <PicWrong />
        <View style={styles.two}>
          <Text variant="callout" tone="ink2" style={{ flex: 1, paddingRight: 14 }}>Tax-free part used each month</Text>
          <Text variant="callout" tone="ink2" style={{ flex: 1 }}>Often too much tax, until it’s fixed</Text>
        </View>
      </Panel>
      <Eyebrow style={{ marginTop: space.xl }}>Pick one</Eyebrow>
      <Statement s="{“M1”} at the end of a code most often means…" style={{ marginTop: space.xs }} />
      <View style={{ gap: space.xs, marginTop: space.md }}>
        {opts.map(o => <Option key={o.key} card label={o.label} onPress={() => choosePick(o.key)} state={!done ? undefined : o.key === answer ? 'right' : 'rest'} note={done && o.key === pick && o.key !== answer ? 'Your pick' : undefined} />)}
      </View>
      <View style={{ marginTop: space.sm }}>
        {done ? <LifeSays>{`${pick === answer ? 'That’s it.' : 'It’s the middle one.'} M1 is a stopgap while your employer waits for your details, so it’s worth checking.`}</LifeSays>
          : <Callout>A wrong answer costs nothing. You’ll see why either way.</Callout>}
      </View>
    </Page>
  );
}

/* ───────────────────────── The whole idea, in three lines ───────────────────────── */

export function LessonrecapV26() {
  const nav = useNavigation(), t = useTokens();
  return (
    <Page screen="lessonrecap" bar={{ kind: 'push', title: 'Recap', close: true }} contentStyle={{ flexGrow: 1 }}
      footer={<Btn label="Now tell it back" icon="mic" onPress={() => nav.go('tellback')} />}>
      <Eyebrow>{`${lesson.topic} · the whole idea, in three lines`}</Eyebrow>
      <Text variant="huge" style={{ marginTop: space.xs }}>So, in short</Text>
      <View style={[styles.strip, { marginTop: space.lg }]}>
        {lesson.bites.map((b, k) => (
          <React.Fragment key={b.title}>
            {k ? <Icon name="chev" size={16} color={t.inkQuiet} /> : null}
            <View style={[styles.stripArt, { backgroundColor: t.surface }, cardShadow(t.scheme)]}><Mini name={b.mini} width={84} /></View>
          </React.Fragment>
        ))}
      </View>
      <View style={{ marginTop: space.xl, gap: 18 }}>
        {lesson.recap.map(line => <View key={line} style={styles.line}><TickOn /><Statement s={line} style={{ flex: 1 }} /></View>)}
      </View>
      <View style={{ flex: 1, minHeight: space.lg }} />
      <LifeSays>This is the thing you’ll tell back in a moment.</LifeSays>
    </Page>
  );
}

/* ───────────────────────── Tell it back to life ───────────────────────── */

export function TellbackV26() {
  const nav = useNavigation(), t = useTokens(), { data, draft, choose } = useSeed(), params = useLocalSearchParams<{ state?: string }>();
  const saved = data.drafts['tax-explanation'];
  const sample = SHOW_SAMPLES && saved === undefined;
  const [turns, setTurns] = useState<string[]>(sample ? lesson.sampleTelling.filter(m => m.who === 'you').map(m => m.text) : saved ? [saved] : []);
  const [live, setLive] = useState(''), [typing, setTyping] = useState(false), [typed, setTyped] = useState('');
  const [thinking, setThinking] = useState(params.state === 'done');
  const [seconds, setSeconds] = useState(sample ? 41 : 0);
  const listen = useListen(said => setLive(said));
  useEffect(() => {
    if (thinking) return;
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id);
  }, [thinking]);
  // A finished stretch of speech becomes one of your turns.
  useEffect(() => { if (!listen.listening && live.trim()) { setTurns(v => [...v, live.trim()]); setLive(''); } }, [listen.listening, live]);
  const all = [...turns, live].filter(Boolean).join(' ');
  const finish = async () => {
    if (listen.listening) { await listen.toggle(); }
    const text = [...turns, live, typed].filter(s => s.trim()).join(' ').trim();
    if (!text) return;
    draft('tax-explanation', text); choose('tellback-seconds', String(seconds));
    setThinking(true); feedback.brief();
    draft('tax-analysis', '');
    try {
      const analysed = await ai.analyse(text, lesson.links.map(l => l.label));
      if (analysed.support) { setThinking(false); nav.replace('support'); return; }
      if (analysed.model) draft('tax-analysis', JSON.stringify(analysed.model));
    } catch { /* the local check below still runs */ }
  };
  useEffect(() => {
    if (!thinking || params.state === 'done') return;
    const id = setTimeout(() => nav.replace('gaps'), 1800);
    return () => clearTimeout(id);
  }, [thinking, nav, params.state]);
  const bar = { kind: 'push' as const, title: 'Your turn', close: true, action: { kind: 'node' as const, node: <Text variant="callout" tone="ink2" style={{ fontVariant: ['tabular-nums'] }}>{clock(seconds)}</Text> } };
  if (thinking) return (
    <Page screen="tellback" bar={bar} contentStyle={{ flexGrow: 1 }} footer={<QuietLink label="Keep talking" onPress={() => setThinking(false)} />}>
      <View style={styles.orbArea}><LifeOrb size={220} state="thinking" /></View>
      <Eyebrow>Thinking about what you said</Eyebrow>
      <Display s="Finding what you {explained well.}" />
      <Body s="Your own words come first. Then the one gap, if there is one." style={{ marginTop: space.sm }} />
    </Page>
  );
  const sendTyped = () => { if (!typed.trim()) return; setTurns(v => [...v, typed.trim()]); setTyped(''); };
  return (
    <Page screen="tellback" bar={bar}
      footer={<View style={{ alignItems: 'center', gap: 4 }}>
        {typing ? (
          <View style={[styles.typeRow, { backgroundColor: t.surface2 }]}>
            <TextInput maxFontSizeMultiplier={1.3} value={typed} onChangeText={setTyped} placeholder="Type it instead" placeholderTextColor={t.inkQuiet} selectionColor={t.ember} onSubmitEditing={sendTyped}
              style={[styles.typeInput, { color: t.ink }]} accessibilityLabel="Type your explanation" returnKeyType="send" />
            <RoundButton icon="arrowUp" label="Add this" size="sm" solid onPress={sendTyped} disabled={!typed.trim()} />
          </View>
        ) : null}
        <Press haptic="primary" onPress={all.trim() || typed.trim() ? finish : listen.toggle} accessibilityLabel={all.trim() ? 'I’m done' : 'Start talking'}>
          <LifeOrb size={150} state={listen.listening ? 'listening' : all.trim() ? 'listening' : 'ring'} />
        </Press>
        <Text variant="callout" tone="ink2">{all.trim() ? 'Tap when you’re done' : listen.listening ? 'Listening…' : 'Tap to start talking'}</Text>
        {!typing ? <QuietLink label="Type instead" onPress={() => setTyping(true)} /> : null}
      </View>}>
      <Display s="Tell me what a {tax code} is, like I’ve {never heard of one.}" style={{ marginTop: 6 }} />
      <View style={{ marginTop: space.xl, gap: space.md }}>
        {turns.map((m, k) => (
          <React.Fragment key={k}>
            <View style={{ alignItems: 'flex-end' }}><ChatBubble text={m} /></View>
            {k === 0 ? <LifeSays>{lesson.question}</LifeSays> : null}
          </React.Fragment>
        ))}
        {live ? <View style={{ alignItems: 'flex-end', opacity: 0.7 }}><ChatBubble text={live} /></View> : null}
      </View>
      {listen.error ? <Callout style={{ marginTop: space.md }}>{listen.error}</Callout> : null}
      {!turns.length && !live ? <Callout style={{ marginTop: space.md }}>Say it out loud, in your own words. life listens and asks one question.</Callout> : null}
    </Page>
  );
}

/* ───────────────────────── What you got, and the one gap ───────────────────────── */

export function GapsV26() {
  const nav = useNavigation(), { data, set } = useSeed(), told = useTold();
  const [shown, setShown] = useState(false);
  const gaps = told.links.filter(l => !l.ok), gap = gaps[0];
  const well = told.links.filter(l => l.ok);
  const learn = () => { set({ learned: [...new Set([...data.learned, 'tax-codes'])] }); nav.replace('gotit'); };
  const head = !gaps.length ? 'You’ve got {all of it.} Nothing left to add.' : gaps.length === 1 ? 'You’ve got {most of it.} One gap left.' : well.length ? 'You’ve got {some of it.} A couple of gaps left.' : 'A good start. {Let’s fill the gaps.}';
  return (
    <Page screen="gaps" bar={{ kind: 'push', title: 'How you did', close: true }}
      footer={!gap ? <Btn label="Finish" onPress={learn} />
        : !shown ? <><Btn label="Show me" onPress={() => { setShown(true); feedback.open(); }} /><Callout center>A short explanation. Then you tell it in your own words.</Callout></>
        : <><Btn label="Tell it again" icon="mic" onPress={() => nav.replace('tellback')} /><QuietLink label="I’ve got it now" onPress={learn} /></>}>
      <Eyebrow>{told.seconds ? `${lesson.topic} · told back in ${clock(told.seconds)}` : lesson.topic}</Eyebrow>
      <Display s={head} />
      <Panel style={{ marginTop: space.lg }}><PicChain links={told.links} /></Panel>
      {well.length ? (
        <Box style={{ marginTop: space.sm }}>
          <Micro>YOU EXPLAINED WELL, IN YOUR WORDS</Micro>
          <View style={{ gap: space.sm, marginTop: space.sm }}>
            {well.map(l => <View key={l.label} style={styles.quote}><TickOn /><Text variant="greeting" style={{ flex: 1, lineHeight: 24 }}>{`“${l.quote}”`}</Text></View>)}
          </View>
        </Box>
      ) : null}
      {gap ? (
        <Box style={{ marginTop: space.sm }}>
          <View style={{ flexDirection: 'row' }}><Chip label={gaps.length > 1 ? `${gaps.length} gaps` : 'One gap'} tone="live" /></View>
          <Text variant="headline" style={{ marginTop: space.sm }}>{gap.gap}</Text>
          <Body s={shown ? gap.fix : well.length ? 'You spotted the problem. The last step is how to fix it.' : 'Start with this one. The rest follows from it.'} style={{ marginTop: space.xs }} />
        </Box>
      ) : null}
    </Page>
  );
}

/* ───────────────────────── You've got it ───────────────────────── */

export function GotitV26() {
  const nav = useNavigation(), t = useTokens(), { data, set } = useSeed(), insets = useSafeAreaInsets(), drawer = useDrawerPhoto(), calm = useCalmMotion();
  const scale = useSharedValue(calm ? 1 : 0.95), fade = useSharedValue(0);
  useEffect(() => {
    if (!data.learned.includes('tax-codes')) set({ learned: [...data.learned, 'tax-codes'] });
    feedback.cleared();
    fade.value = withTiming(1, { duration: calm ? 200 : 260 });
    if (!calm) scale.value = withSpring(1, motion.smooth);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const words = useAnimatedStyle(() => ({ opacity: fade.value, transform: [{ scale: scale.value }] }));
  const recallDay = new Date(Date.now() + 3 * 86400000).toLocaleDateString('en-GB', { weekday: 'long' });
  const month = Math.max(learning.learnedMonth, data.learned.length);
  return (
    <Page screen="gotit" scroll={false} statusInk contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
      backdrop={<View pointerEvents="none" style={[StyleSheet.absoluteFill, { bottom: undefined, height: drawer.height ?? 440 }]}><PhotoFill source={photos.gotit} focal={{ y: 0.1 }} /></View>}
      bar={{ kind: 'photo', left: <PaperChip label={`Learned · ${lesson.topic.toLowerCase()}`} />, right: <OnPhotoRound icon="close" label="Close" solid onPress={nav.close} /> }}>
      <View style={{ flex: 1, minHeight: 240 }} />
      <View onLayout={drawer.onLayout} style={[drawerStyle, styles.drawer, { backgroundColor: t.surface, paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} showsVerticalScrollIndicator={false}>
          <LifeOrb size={44} state="done" />
          <Animated.View style={[{ marginTop: space.sm, alignSelf: 'flex-start' }, words]}><Text variant="huge">You’ve got it.</Text></Animated.View>
          <Statement size="lead" s="You can now {read any tax code}, and you know {what to do when one is wrong}." style={{ marginTop: 10 }} />
          <View style={{ gap: space.xs, marginTop: space.md }}>
            <Fact icon="book"><Body s={`{${month}} idea${month === 1 ? '' : 's'} learned this month`} tone="ink" /></Fact>
            <Fact icon="repeat"><Body s={`Quick recall booked: {${recallDay}}, then next week`} tone="ink" /></Fact>
          </View>
          <Btn label="Check my tax code now" icon="arrow" trail onPress={() => nav.replace('taxcheck')} style={{ marginTop: space.lg }} />
          <QuietLink label="Back to Today" onPress={nav.home} style={{ marginTop: space.sm }} />
        </ScrollView>
      </View>
    </Page>
  );
}

function Fact({ icon, children }: { icon: 'book' | 'repeat'; children: ReactNode }) {
  const t = useTokens();
  return <View style={styles.inline}><Icon name={icon} size={18} color={t.ink} /><View style={{ flex: 1 }}>{children}</View></View>;
}

const styles = StyleSheet.create({
  steps: { flexDirection: 'row', gap: 4, paddingBottom: space.tile },
  track: { flex: 1, height: 4, borderRadius: 2, overflow: 'hidden' },
  tick: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  pin: { position: 'absolute', left: 14, top: 14 },
  offer: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: space.sm, paddingLeft: space.sm, paddingRight: 14, borderRadius: radius.lg },
  seat: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  solid: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: space.tile },
  pair: { flexDirection: 'row', gap: space.sm },
  orbArea: { flex: 1, minHeight: 280, alignItems: 'center', justifyContent: 'center' },
  paperChip: { flexDirection: 'row', alignItems: 'center', height: 28, paddingHorizontal: space.sm, borderRadius: radius.full, backgroundColor: photo.onPhoto },
  bite: { width: 178, borderRadius: radius.lg, paddingTop: space.tile, paddingHorizontal: space.tile, paddingBottom: 14 },
  art: { height: 80, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  two: { flexDirection: 'row', paddingTop: space.xs, paddingHorizontal: space.md },
  strip: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stripArt: { width: 94, height: 62, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  line: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  quote: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: space.xs, height: 48, borderRadius: radius.full, paddingLeft: space.md, paddingRight: space.xs, alignSelf: 'stretch', marginBottom: space.xs },
  typeInput: { flex: 1, fontFamily: fonts.sans, fontSize: 15, paddingVertical: 0 },
  drawer: { paddingHorizontal: space.gutter, paddingTop: 22 },
});
