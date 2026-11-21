/**
 * The three core loops in the V26 language (Life 1.0, `docs/life-1.0/core-loops/README.md`), built into existing
 * screens rather than new ones:
 * - **Plan ahead** is Close the day (`evening`): "What's most important to you tomorrow?", several picks or your own words.
 * - **Get unstuck** is a quick prompt over Today (also Today `?nudge=1`): how much time do you have, then one step that
 *   fits, why, now, later or something else, and resume where you stopped. The whole list lives on the Nudge page.
 * - **See what's changing** is on Today (what moved forward), in Weekly recap (step by step, and what counts for you),
 *   and the check-in style is in Notifications.
 * Rules and storage: `state/loops.ts` and `packages/core/src/day/loops.ts`.
 */
import { useState, type ReactNode } from 'react';
import { KeyboardAvoidingView, Modal, Platform, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { SafeAreaProvider, initialWindowMetrics, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Appear, Press, PhotoFill, ReorderRow, RoundButton, SectionHead, Text, cardShadow, feedback, fonts, photo, photoScrims, photos, radius, sheetShadow, space, useTokens } from '@/design';
import { STEP_SIZES, type PlanStep, type Priority } from '@life/core';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import { CHECK_IN_WORDS, SAMPLE_CALENDAR, WIN_AREAS, calendarGap, stepRoute, useLoops, whenStarted } from '@/state/loops';
import { Body, Btn, Callout, Chip, Display, Duo, Eyebrow, Micro, NumWell, Page, QuietLink, Row, RowsCard, SheetHandle, Statement, Tick, drawerStyle, useDrawerPhoto } from './kit';

const weekday = (day: string) => new Date(`${day}T12:00:00`).toLocaleDateString('en-GB', { weekday: 'long' });
const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

function useSurface() {
  const t = useTokens();
  return { backgroundColor: t.surface, ...cardShadow(t.scheme) };
}

/** Opens where a step happens (its mission or screen). Returns false when the step happens off screen. */
function useOpenStep() {
  const nav = useNavigation(), { update } = useSeed();
  return (step: { to?: string; mission?: string }) => {
    const route = stepRoute(step);
    if (!route) return false;
    if (route.mission) update(c => ({ ...c, selectedMission: route.mission! }));
    nav.go(route.to);
    return true;
  };
}

/** A step and its priority from a tick, even if the list it came from has since changed. */
function useStepFromKey() {
  const L = useLoops();
  return (key: string): { step: PlanStep; priority: Priority } | null => {
    const found = L.locate(key);
    if (found) return found;
    const mark = L.loops.marks[key];
    return mark ? { step: { key, title: mark.title, to: mark.to, mission: mark.mission }, priority: { id: '', text: mark.priority, own: false, area: mark.area, steps: [] } } : null;
  };
}

const statusOf = (p: { done: number; total: number; started: boolean; complete: boolean }) =>
  p.complete ? 'Done' : !p.total ? 'No steps yet' : `${p.done} of ${plural(p.total, 'step')}${p.started ? ' · started' : ''}`;

/* ───────────────────────── On Today ───────────────────────── */

/**
 * Today's part of the loops: pick up where you left off, what matters today (with the calendar when there is one),
 * planning tomorrow in the evening, and what moved forward this week. Planning is never required to use the rest.
 */
export function TodayLoops() {
  const nav = useNavigation(), surface = useSurface(), L = useLoops();
  // The nudge link (`?nudge=1`, from a notification) opens the same prompt, on day one as well as on a full Today.
  const linked = useLocalSearchParams<{ nudge?: string }>().nudge === '1';
  const [unstuck, setUnstuck] = useState(false);
  const onUnstuck = () => setUnstuck(true);
  const openStep = useOpenStep(), fromKey = useStepFromKey();
  const gap = calendarGap(L.now);
  const active = L.active ? fromKey(L.active.key) : null;
  const n = L.week.steps.length, wins = L.week.wins.length;
  const askCard = (when: 'today' | 'tomorrow', day: string) => (
    <View style={[styles.card, surface, { marginTop: space.sm }]}>
      <Eyebrow orb>{when === 'tomorrow' ? 'Before you sleep' : 'This morning'}</Eyebrow>
      <Statement s={`What’s most important to you {${when}}?`} style={{ marginTop: space.xs }} />
      <Body s="Pick a few, or say it your way." style={{ marginTop: space.xxs }} />
      <View style={[styles.row, { marginTop: space.md }]}>
        <Btn label={when === 'tomorrow' ? 'Plan tomorrow' : 'Choose'} ghost sm fit onPress={() => nav.go('evening', { for: when })} />
        <QuietLink label={when === 'tomorrow' ? 'Not tonight' : 'Not today'} center={false} onPress={() => { L.skip(day); feedback.select(); }} />
      </View>
    </View>
  );
  return (
    <>
      {L.active && active ? (
        <View style={[styles.card, surface, { marginTop: space.lg }]}>
          <Micro sig>{`Pick up where you left off · started ${whenStarted(L.active.mark.at, L.now)}`}</Micro>
          <Text variant="headline" style={{ marginTop: space.tile }}>{L.active.mark.title}</Text>
          <Text variant="callout" tone="ink2" numberOfLines={2}>{`For “${L.active.mark.priority}”`}</Text>
          <Duo style={{ marginTop: space.md }}>
            <Btn label="Carry on" ghost sm icon="arrow" trail onPress={() => { if (!openStep(active.step)) onUnstuck(); }} />
            <Btn label="Done" ghost sm icon="check" onPress={() => { L.finish(active.step, active.priority); feedback.complete(); }} />
          </Duo>
        </View>
      ) : null}

      {L.todayPlan ? <>
        <SectionHead title="What matters today" link="Edit" onLink={() => nav.go('evening', { for: 'today' })} />
        <RowsCard>
          {L.progress.map(p => <Row key={p.id} lead={<Tick on={p.complete} />} title={p.text} sub={statusOf(p)} onPress={onUnstuck} />)}
        </RowsCard>
        <Btn label="I’ve got a few minutes" ghost icon="clock" onPress={onUnstuck} style={{ marginTop: space.sm }} />
        <Callout style={{ marginTop: space.xs }}>{gap ? `Sample calendar · ${gap.minutes} minutes free from ${gap.at}.` : SAMPLE_CALENDAR ? 'Sample calendar · no free time left today. You choose the time.' : 'Calendar not connected yet. You choose the time.'}</Callout>
      </> : !L.tomorrow && L.prompt === 'plan-today' ? askCard('today', L.today) : null}

      {L.tomorrow && !L.tomorrowPlan && L.prompt === 'plan-tomorrow' ? askCard('tomorrow', L.tomorrow) : null}

      <RowsCard style={{ marginTop: space.sm }}>
        {L.tomorrow ? (
          <Row icon="moon" title={L.tomorrowPlan ? `${weekday(L.tomorrow)} is planned` : `Plan ${weekday(L.tomorrow)}`} sub={L.tomorrowPlan ? plural(L.tomorrowPlan.items.length, 'priority', 'priorities') : 'Whenever you like'} onPress={() => nav.go('evening', { for: 'tomorrow' })} />
        ) : !L.todayPlan ? (
          <Row icon="calendar" title="Plan what matters" sub="Today, whenever you like" onPress={() => nav.go('evening', { for: 'today' })} />
        ) : null}
        <Row icon="chart" title="What moved forward" sub={n ? `${plural(n, 'step')} this week${L.loops.wins.length && wins < n ? ` · ${wins} that ${wins === 1 ? 'counts' : 'count'} for you` : ''}` : 'Nothing ticked yet this week'} onPress={() => nav.go('recap')} />
      </RowsCard>
      <UnstuckSheet visible={unstuck || linked} onClose={() => { setUnstuck(false); if (linked) nav.replace('today'); }} />
    </>
  );
}

/* ───────────────────────── Get unstuck (the quick prompt) ───────────────────────── */

/**
 * Get unstuck as a quick prompt over Today: "How much time do you have?", then one step that fits, in the same sheet.
 * A step you started comes back without the question, and so does a day with nothing planned or everything done. The
 * rest of the list, sizing steps and first steps are on the full Nudge page, one tap away. The sheet is only as tall
 * as what it says.
 */
export function UnstuckSheet({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>{visible ? <UnstuckBody onClose={onClose} /> : null}</SafeAreaProvider>
    </Modal>
  );
}

function UnstuckBody({ onClose }: { onClose: () => void }) {
  const t = useTokens(), insets = useSafeAreaInsets(), nav = useNavigation(), L = useLoops(), { choose } = useSeed();
  const openStep = useOpenStep(), fromKey = useStepFromKey();
  const [full, setFull] = useState(false);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [skip, setSkip] = useState<string[]>([]);
  const [ticked, setTicked] = useState<string | null>(null);
  if (full) return <NudgeV26 onClose={onClose} />;

  const gap = calendarGap(L.now);
  const gapSize = gap ? [...STEP_SIZES].reverse().find(s => s <= gap.minutes) ?? 2 : null;
  const time = gap && minutes === gapSize ? { kind: 'calendar' as const, at: gap.at, sample: true } : { kind: 'manual' as const };
  const go = (to: () => void) => { onClose(); to(); };
  const finish = (step: PlanStep, priority: Priority) => { L.finish(step, priority); setTicked(step.title); feedback.complete(); };
  const pick = (m: number) => { setMinutes(m); setSkip(s => s.filter(k => k === L.active?.key)); setTicked(null); choose('unstuck-minutes', String(m)); feedback.select(); };
  const changeTime = <QuietLink label={minutes ? `Change time · ${minutes} min` : 'Change time'} onPress={() => setMinutes(null)} />;
  const wholeList = <QuietLink label="See my whole list" onPress={() => setFull(true)} />;

  const active = L.active && !skip.includes(L.active.key) ? fromKey(L.active.key) : null;
  const probe = L.offer(STEP_SIZES[STEP_SIZES.length - 1], [], { kind: 'manual' });
  const offer = minutes ? L.offer(minutes, skip, time) : null;

  let body: ReactNode;
  if (active && L.active) {
    // A step you started: no question, straight back to it.
    const routed = !!stepRoute(active.step), key = L.active.key;
    body = <>
      <Micro sig style={{ marginTop: space.sm }}>{`Pick up where you left off · started ${whenStarted(L.active.mark.at, L.now)}`}</Micro>
      <Text variant="headline" style={{ marginTop: space.tile }}>{active.step.title}</Text>
      <Text variant="callout" tone="ink2">{`For “${L.active.mark.priority}”${active.step.minutes ? ` · about ${active.step.minutes} min` : ''}${routed ? '' : ' · you do this one, then tick it'}`}</Text>
      {routed
        ? <Btn label="Carry on" icon="arrow" trail onPress={() => go(() => openStep(active.step))} style={{ marginTop: space.lg }} />
        : <Btn label="Done" icon="check" onPress={() => finish(active.step, active.priority)} style={{ marginTop: space.lg }} />}
      <Duo style={{ marginTop: space.xs }}>
        {routed
          ? <Btn label="Done" ghost sm icon="check" onPress={() => finish(active.step, active.priority)} />
          : <Btn label="Not started after all" ghost sm onPress={() => L.undo(key)} />}
        <Btn label="Something else" ghost sm onPress={() => setSkip(s => [...s, key])} />
      </Duo>
    </>;
  } else if (probe.kind === 'none' && probe.reason === 'nothing-planned') {
    body = <>
      <Statement s="Nothing planned for today. {That’s fine.}" style={{ marginTop: space.sm }} />
      <Body s="Plan what matters, or just ask life something. {Neither needs the other.}" style={{ marginTop: space.xxs }} />
      <Btn label="Plan today" icon="arrow" trail onPress={() => go(() => nav.go('evening', { for: 'today' }))} style={{ marginTop: space.lg }} />
      <QuietLink label="Ask life instead" onPress={() => go(() => nav.go('chat'))} style={{ marginTop: space.xs }} />
    </>;
  } else if (probe.kind === 'none' && probe.reason === 'all-done') {
    body = <>
      {ticked ? <Callout style={{ marginTop: space.sm }}>{`Ticked “${ticked}”.`}</Callout> : null}
      <Statement s="Everything on today’s list {is done}." style={{ marginTop: space.sm }} />
      <Btn label="See what moved" onPress={() => go(() => nav.go('recap'))} style={{ marginTop: space.lg }} />
    </>;
  } else if (!offer) {
    // The question, one at a time. The calendar's free slot is the suggested answer when there is one.
    const sizes = STEP_SIZES.map(m => <Btn key={m} label={`${m} min`} ghost={m !== gapSize} onPress={() => pick(m)} />);
    body = <>
      {ticked ? <Callout style={{ marginTop: space.sm }}>{`Ticked “${ticked}”. Got a few more minutes?`}</Callout> : null}
      <Statement s="How much time {do you have}?" style={{ marginTop: space.sm }} />
      <Body s={gap ? `The sample calendar shows {${gap.minutes} minutes free from ${gap.at}}.` : 'Roughly is fine. life finds {one step} that fits.'} style={{ marginTop: space.xxs }} />
      <Duo style={{ marginTop: space.lg }}>{sizes.slice(0, 2)}</Duo>
      <Duo style={{ marginTop: space.xs }}>{sizes.slice(2)}</Duo>
      <QuietLink label="Ask life instead" onPress={() => go(() => nav.go('chat'))} style={{ marginTop: space.sm }} />
    </>;
  } else if (offer.kind === 'step') {
    body = <>
      {ticked ? <Callout style={{ marginTop: space.sm }}>{`Ticked “${ticked}”. Here’s the next one.`}</Callout> : null}
      <Micro sig style={{ marginTop: space.sm }}>{`For “${offer.priority.text}” · step ${offer.index + 1} of ${offer.total}`}</Micro>
      <Text variant="headline" style={{ marginTop: space.tile }}>{offer.step.title}</Text>
      <Text variant="callout" tone="ink2">{`About ${offer.step.minutes} min${offer.step.mission ? ' · opens the mission' : offer.step.to ? '' : ' · you do this one, then tick it'}`}</Text>
      <Micro style={{ marginTop: space.md }}>WHY THIS?</Micro>
      {offer.why.map(w => <Body key={w} s={w} style={{ marginTop: space.xxs }} />)}
      <Btn label="Start" icon="arrow" trail style={{ marginTop: space.lg }} onPress={() => {
        L.start(offer.step, offer.priority); feedback.select();
        if (stepRoute(offer.step)) go(() => openStep(offer.step));
      }} />
      <Duo style={{ marginTop: space.xs }}>
        <Btn label="Later" ghost sm onPress={onClose} />
        <Btn label="Something else" ghost sm onPress={() => setSkip(s => [...s, offer.step.key])} />
      </Duo>
      <Duo style={{ marginTop: space.sm }}>{changeTime}{wholeList}</Duo>
    </>;
  } else if (skip.some(k => k !== L.active?.key)) {
    body = <>
      <Statement s={`That’s everything that fits {${minutes} minutes} for now.`} style={{ marginTop: space.sm }} />
      <Btn label="Back to the first one" onPress={() => setSkip(s => s.filter(k => k === L.active?.key))} style={{ marginTop: space.lg }} />
      <Duo style={{ marginTop: space.sm }}>{changeTime}{wholeList}</Duo>
    </>;
  } else {
    // Nothing fits: say so, and point to the honest fixes (more time, or a smaller or first step), never an invented one.
    const first = offer.needsSteps[0];
    const needs = offer.reason === 'no-steps' ? (offer.unsized.length ? 'Your next steps need {a rough time} before life can offer one.' : first ? `“${first.text}” needs {a first step}.` : 'Nothing on your list {has a next step}.') : null;
    body = <>
      <Statement s={needs ?? `Nothing on your list fits {${minutes} minutes} yet.`} style={{ marginTop: space.sm }} />
      {!needs && offer.smallest ? <Body s={`The smallest next step needs about {${offer.smallest} minutes}.`} style={{ marginTop: space.xxs }} /> : null}
      {needs
        ? <Btn label={offer.unsized.length ? 'Size my steps' : 'Add a first step'} icon="arrow" trail onPress={() => setFull(true)} style={{ marginTop: space.lg }} />
        : <Btn label="Pick more time" onPress={() => setMinutes(null)} style={{ marginTop: space.lg }} />}
      <QuietLink label={needs ? 'Change time' : 'Add a smaller step'} onPress={needs ? () => setMinutes(null) : () => setFull(true)} style={{ marginTop: space.xs }} />
    </>;
  }

  return <>
    <View style={[StyleSheet.absoluteFill, { backgroundColor: t.scrim }]} />
    <Press haptic={null} accessibilityLabel="Close" onPress={onClose} style={{ flex: 1 }} />
    {/* The scrim fades; the sheet rises from the bottom edge, as tall as its words. */}
    <Appear rise={120}>
      <View style={[styles.unstuck, { backgroundColor: t.surface, paddingBottom: Math.max(insets.bottom, space.lg) + space.xs, ...sheetShadow }]}>
        <SheetHandle />
        <View style={styles.head}>
          <Eyebrow orb>life · one step</Eyebrow>
          <RoundButton icon="close" size="sm" label="Not now" onPress={onClose} />
        </View>
        {body}
      </View>
    </Appear>
  </>;
}

/* ───────────────────────── Plan ahead (Close the day) ───────────────────────── */

/**
 * "What's most important to you tomorrow?" Several picks or your own words, in your order. Opens for tomorrow in the
 * evening and for today in the morning (`?for=` overrides). Saving replaces that day's list; nothing rolls over by itself.
 */
export function EveningV26() {
  const t = useTokens(), nav = useNavigation(), L = useLoops(), insets = useSafeAreaInsets(), drawer = useDrawerPhoto();
  const params = useLocalSearchParams<{ for?: string }>();
  const when: 'today' | 'tomorrow' = params.for === 'today' ? 'today' : params.for === 'tomorrow' ? 'tomorrow' : L.target.when;
  const day = when === 'today' ? L.today : L.target.when === 'tomorrow' ? L.target.day : addDay(L.today);
  const existing = L.loops.plans[day]?.items ?? null;
  const [chosen, setChosen] = useState<Priority[]>(existing ?? []);
  const [text, setText] = useState('');
  const full = chosen.length >= 6;
  const has = (p: Priority) => chosen.some(c => c.id === p.id || c.text.toLowerCase() === p.text.toLowerCase());
  const all = L.ideasFor(day);
  const carried = all.carried.filter(p => !has(p)), fresh = all.ideas.filter(p => !has(p));
  const add = (p: Priority) => { if (full || has(p)) return; setChosen(c => [...c, L.prepare(p, day)]); feedback.select(); };
  const addOwn = () => { const v = text.trim(); if (!v) return; add({ id: `own:${Date.now().toString(36)}`, text: v, own: true, steps: [] }); setText(''); };
  const move = (from: number, to: number) => setChosen(c => { const next = c.slice(); const [item] = next.splice(from, 1); next.splice(to, 0, item); return next; });
  const doneToday = when === 'tomorrow' ? L.doneOn(L.today) : [];
  const save = () => { L.save(day, chosen); feedback.complete(); nav.close(); };
  const label = when === 'tomorrow' ? `Set for ${weekday(day)}` : 'Set for today';
  return (
    <Page screen="evening" scroll={false} contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
      backdrop={<View pointerEvents="none" style={[StyleSheet.absoluteFill, { bottom: undefined, height: drawer.height ?? 520 }]}>
        <PhotoFill source={photos.calm} focal={{ y: 1 }} settle />
        <LinearGradient colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} />
      </View>}
      bar={{ kind: 'photo', left: <View style={[styles.photoChip, { backgroundColor: photo.fill }]}><Text variant="micro" tone="paper">{when === 'tomorrow' ? `Planning ${weekday(day)}` : `${weekday(day)} morning`}</Text></View> }}>
      <View style={styles.words}>
        <Display onPhoto s={doneToday.length ? `{${plural(doneToday.length, 'step')}} moved forward today.` : when === 'tomorrow' ? `{${weekday(day)}} starts here.` : '{Today} starts here.'} />
      </View>
      <View style={{ flex: 1, minHeight: space.lg }} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flexShrink: 1, minHeight: 0 }}>
        <View onLayout={drawer.onLayout} style={[drawerStyle, styles.sheet, { backgroundColor: t.surface, paddingBottom: Math.max(insets.bottom, space.md) }]}>
          <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            {doneToday.slice(0, 3).map(s => <Row key={s.key} lead={<Tick on />} title={s.title} sub={s.priority} style={styles.compact} />)}
            <Statement s={`What’s most important to you {${when}}?`} style={{ marginTop: doneToday.length ? space.sm : 0 }} />
            <Body s="Pick a few, or say it your way. {Your order} is kept." style={{ marginTop: space.xxs }} />
            {chosen.length ? (
              <View style={{ marginTop: space.sm }}>
                {chosen.map((p, i) => (
                  <ReorderRow key={p.id} label={p.text} index={i} count={chosen.length} onMove={move}>
                    <Row lead={<NumWell n={i + 1} />} title={p.text} sub={p.own ? 'In your words' : p.steps.length ? plural(p.steps.length, 'small step') : undefined} style={styles.compact}
                      right={<RoundButton icon="remove" size="sm" label={`Take “${p.text}” off`} onPress={() => setChosen(c => c.filter(x => x.id !== p.id))} />} />
                  </ReorderRow>
                ))}
              </View>
            ) : null}
            <View style={[styles.row, { marginTop: space.sm }]}>
              <TextInput maxFontSizeMultiplier={1.3} value={text} onChangeText={setText} onSubmitEditing={addOwn} returnKeyType="done" editable={!full}
                placeholder={full ? 'Six is plenty for one day' : 'Or type your own'} placeholderTextColor={t.inkQuiet} accessibilityLabel="Add a priority in your own words"
                style={[styles.input, { backgroundColor: t.surface2, color: t.ink, fontFamily: fonts.sans }]} selectionColor={t.ember} />
              <RoundButton icon="add" solid label="Add it" disabled={!text.trim() || full} onPress={addOwn} />
            </View>
            {carried.length ? <>
              <Micro style={{ marginTop: space.md }}>STILL GOING</Micro>
              <View style={[styles.wrap, { marginTop: space.xs }]}>{carried.map(p => <Chip key={p.id} label={p.text} icon="add" tone="q" onPress={full ? undefined : () => add(p)} />)}</View>
            </> : null}
            {fresh.length ? <>
              <Micro style={{ marginTop: space.md }}>IDEAS</Micro>
              <View style={[styles.wrap, { marginTop: space.xs }]}>{fresh.map(p => <Chip key={p.id} label={p.text} icon="add" tone="q" onPress={full ? undefined : () => add(p)} />)}</View>
            </> : null}
            <Btn label={chosen.length || !existing ? label : `Clear ${when === 'tomorrow' ? weekday(day) : 'today'}’s list`} disabled={!chosen.length && !existing} onPress={save} style={{ marginTop: space.lg }} />
            <QuietLink label={existing ? 'Keep it as it was' : when === 'tomorrow' ? 'Not tonight' : 'Not today'} onPress={() => { if (!existing) L.skip(day); nav.close(); }} style={{ marginTop: space.xs }} />
            <Callout center style={{ marginTop: space.xs }}>Nothing moves to the next day by itself.</Callout>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Page>
  );
}

const addDay = (day: string) => { const d = new Date(`${day}T12:00:00Z`); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); };

/* ───────────────────────── Get unstuck (Nudge) ───────────────────────── */

/**
 * One step that fits the time you have. A step you started comes back first. Start opens where the step happens; Later
 * leaves it for later; Something else offers the next one. With nothing that fits, it says so, and helps you add or
 * size a step instead of inventing one. Never sends, submits or pays for anything.
 */
export function NudgeV26({ onClose }: { onClose?: () => void }) {
  const t = useTokens(), nav = useNavigation(), surface = useSurface(), L = useLoops(), { data, choose } = useSeed();
  const openStep = useOpenStep();
  const close = onClose ?? nav.close;
  const gap = calendarGap(L.now);
  const gapSize = gap ? [...STEP_SIZES].reverse().find(s => s <= gap.minutes) ?? 2 : null;
  const [minutes, setMinutes] = useState<number>(gapSize ?? (Number(data.choices['unstuck-minutes']) || 10));
  const [skip, setSkip] = useState<string[]>([]);
  const [newStep, setNewStep] = useState(''), [newSize, setNewSize] = useState<number>(5);
  const time = gap && minutes === gapSize ? { kind: 'calendar' as const, at: gap.at, sample: true } : { kind: 'manual' as const };
  const offer = L.offer(minutes, skip, time);
  const pick = (m: number) => { setMinutes(m); setSkip([]); choose('unstuck-minutes', String(m)); };
  const running = offer.kind === 'step' && L.loops.marks[offer.step.key]?.state === 'started';
  const start = () => {
    if (offer.kind !== 'step') return;
    L.start(offer.step, offer.priority);
    feedback.select();
    if (stepRoute(offer.step)) { close(); openStep(offer.step); }
  };
  const others = L.progress.filter(p => offer.kind !== 'step' || p.id !== offer.priority.id);
  // A priority with no steps gets a first step here, either because nothing else fits or because you tapped it.
  const [stepFor, setStepFor] = useState<string | null>(null);
  const first = (stepFor ? L.todayPlan?.items.find(p => p.id === stepFor && !p.steps.length) : undefined) ?? (offer.kind === 'none' ? offer.needsSteps[0] : undefined);
  const unsized = offer.kind === 'none' ? offer.unsized : [];

  const footer = offer.kind === 'step' ? (running && !stepRoute(offer.step) ? <>
    <Btn label="Done" icon="check" onPress={() => { L.finish(offer.step, offer.priority); feedback.complete(); }} />
    <QuietLink label="Not started after all" onPress={() => L.undo(offer.step.key)} />
  </> : <>
    <Btn label={running ? 'Carry on' : 'Start'} icon="arrow" trail onPress={start} />
    <Duo>
      {running ? <Btn label="Done" ghost sm icon="check" onPress={() => { L.finish(offer.step, offer.priority); feedback.complete(); }} /> : <Btn label="Later" ghost sm onPress={close} />}
      <Btn label="Something else" ghost sm onPress={() => setSkip(s => [...s, offer.step.key])} />
    </Duo>
  </>) : offer.reason === 'nothing-planned' ? <>
    <Btn label="Plan today" icon="arrow" trail onPress={() => { close(); nav.go('evening', { for: 'today' }); }} />
    <QuietLink label="Ask Life instead" onPress={() => { close(); nav.go('chat'); }} />
  </> : offer.reason === 'all-done' ? <Btn label="See what moved" onPress={() => { close(); nav.go('recap'); }} />
    : skip.length ? <Btn label="Back to the first one" ghost onPress={() => setSkip([])} /> : undefined;

  return (
    <Page screen="nudge" onClose={close} footer={footer}
      bar={{ kind: 'push', close: true, action: { kind: 'node', node: <Chip label={gap ? `Sample · free ${gap.at}` : 'You choose the time'} tone={gap ? 'live' : 'q'} /> } }}>
      <Eyebrow orb>Life · one step</Eyebrow>
      {offer.kind === 'step' ? (
        <Display s={offer.resumed ? `Pick up {${offer.step.title}}. About {@clock ${offer.step.minutes} min}.` : `You have {@clock ${minutes} minutes}. {${offer.step.title}} fits.`} />
      ) : offer.reason === 'nothing-planned' ? (
        <Display s="Nothing planned for today. {That’s fine.}" />
      ) : offer.reason === 'all-done' ? (
        <Display s="Everything on today’s list {is done}." />
      ) : skip.length ? (
        <Display s={`That’s everything that fits {@clock ${minutes} minutes} {for now}.`} />
      ) : first && !unsized.length && offer.reason === 'no-steps' ? (
        <Display s={`“${first.text}” needs {a first step}.`} />
      ) : (
        <Display s={`Nothing on your list fits {@clock ${minutes} minutes} yet.`} />
      )}

      {offer.kind === 'none' && offer.reason === 'nothing-planned' ? (
        <Body s="Plan what matters, or just ask Life something. {Neither needs the other.}" style={{ marginTop: space.sm }} />
      ) : <>
        <Micro style={{ marginTop: space.lg }}>HOW MUCH TIME DO YOU HAVE?</Micro>
        <View style={[styles.wrap, { marginTop: space.xs }]}>
          {STEP_SIZES.map(m => <Chip key={m} label={`${m} min`} tone={m === minutes ? 'live' : 'q'} icon={m === minutes ? 'check' : undefined} onPress={() => pick(m)} />)}
        </View>
      </>}

      {offer.kind === 'step' ? (
        <View style={[styles.card, surface, { marginTop: space.lg }]}>
          <Micro sig>{`For “${offer.priority.text}” · step ${offer.index + 1} of ${offer.total}`}</Micro>
          <Text variant="headline" style={{ marginTop: space.tile }}>{offer.step.title}</Text>
          <Text variant="callout" tone="ink2">{`About ${offer.step.minutes} min${running ? ' · started' : ''}${offer.step.mission ? ' · opens the mission' : offer.step.to ? '' : ' · you do this one, then tick it'}`}</Text>
          <Micro style={{ marginTop: space.md }}>WHY THIS?</Micro>
          {offer.why.map(w => <Body key={w} s={w} style={{ marginTop: space.xxs }} />)}
        </View>
      ) : null}

      {offer.kind === 'none' && offer.reason === 'too-big' && offer.smallest && !skip.length ? (
        <Body s={`The smallest next step needs about {${offer.smallest} minutes}. Pick more time, or add a smaller step.`} style={{ marginTop: space.md }} />
      ) : null}

      {unsized.length ? <>
        <SectionHead title="Not sized yet" />
        <Callout>Life only offers a step once it knows roughly how long it takes.</Callout>
        <RowsCard style={{ marginTop: space.xs }}>
          {unsized.map(u => (
            <View key={u.step.key} style={{ paddingVertical: space.xs }}>
              <Text variant="rowTitle">{u.step.title}</Text>
              <Text variant="callout" tone="ink2">{`For “${u.priority.text}” · how long?`}</Text>
              <View style={[styles.wrap, { marginTop: space.xs }]}>{STEP_SIZES.map(m => <Chip key={m} label={`${m} min`} tone="q" onPress={() => { L.sizeStep(L.today, u.priority.id, u.step.key, m); feedback.select(); }} />)}</View>
            </View>
          ))}
        </RowsCard>
      </> : null}

      {first ? <>
        <SectionHead title={`A first step for “${first.text}”`} />
        <View style={[styles.card, surface]}>
          <TextInput maxFontSizeMultiplier={1.3} value={newStep} onChangeText={setNewStep} placeholder="Something small you can start" placeholderTextColor={t.inkQuiet} accessibilityLabel={`A first step for ${first.text}`}
            style={[styles.input, { backgroundColor: t.surface2, color: t.ink, fontFamily: fonts.sans, flex: 0 }]} selectionColor={t.ember} />
          <Micro style={{ marginTop: space.sm }}>ABOUT HOW LONG?</Micro>
          <View style={[styles.wrap, { marginTop: space.xs }]}>{STEP_SIZES.map(m => <Chip key={m} label={`${m} min`} tone={m === newSize ? 'live' : 'q'} onPress={() => setNewSize(m)} />)}</View>
          <Btn label="Add this step" ghost sm fit disabled={!newStep.trim()} onPress={() => { L.addStep(L.today, first.id, newStep, newSize); setNewStep(''); setStepFor(null); if (newSize > minutes) pick(newSize); feedback.file(); }} style={{ marginTop: space.md }} />
        </View>
      </> : null}

      {others.length ? <>
        <SectionHead title="Also on your list" />
        <RowsCard>{others.map(p => <Row key={p.id} lead={<Tick on={p.complete} />} title={p.text} sub={p.total ? statusOf(p) : 'No steps yet · add one'} onPress={p.total ? undefined : () => setStepFor(p.id)} />)}</RowsCard>
      </> : null}

      {offer.kind !== 'none' || offer.reason !== 'nothing-planned' ? <QuietLink label="Ask Life instead" onPress={() => { close(); nav.go('chat'); }} style={{ marginTop: space.lg }} /> : null}
      <Callout style={{ marginTop: space.md }}>{gap ? 'The free time comes from the sample calendar in this build. ' : ''}life never sends, submits or pays for anything. You do it, then tick it.</Callout>
    </Page>
  );
}

/* ───────────────────────── See what's changing (Weekly recap) ───────────────────────── */

/** This week step by step, partial work as partial, what counts as a win for you, and how life checks in. */
export function WeekSteps() {
  const nav = useNavigation(), L = useLoops();
  const { steps, priorities, wins } = L.week;
  const partial = L.progress.filter(p => !p.complete && (p.done > 0 || p.started));
  return (
    <>
      <SectionHead title="Step by step" />
      {steps.length ? <>
        <Statement s={`{${plural(steps.length, 'step')}} moved forward this week, for ${plural(priorities.length, 'priority', 'priorities')}.`} />
        {L.loops.wins.length ? <Callout style={{ marginTop: space.xxs }}>{!wins.length ? 'None of them are in what counts for you yet.' : wins.length === 1 ? 'One of them counts as a win for you.' : `${wins.length} of them count as wins for you.`}</Callout> : null}
        <RowsCard style={{ marginTop: space.sm }}>
          {steps.slice(0, 8).map(s => <Row key={s.key} lead={<Tick on />} title={s.title} sub={s.priority} end={new Date(s.at).toLocaleDateString('en-GB', { weekday: 'short' })} />)}
        </RowsCard>
      </> : <Body s="Nothing ticked yet this week. {Small steps count}, and only the ones you tick show here." />}
      {partial.length ? <>
        <Micro style={{ marginTop: space.lg }}>PART WAY</Micro>
        <RowsCard style={{ marginTop: space.xs }}>{partial.map(p => <Row key={p.id} lead={<Tick icon="arrow" />} title={p.text} sub={statusOf(p)} />)}</RowsCard>
      </> : null}
      <SectionHead title="What counts for you" />
      <Callout>Optional. Pick what feels like a win and Life puts those first. Change it any time.</Callout>
      <View style={[styles.wrap, { marginTop: space.sm }]}>
        {WIN_AREAS.map(w => { const on = L.loops.wins.includes(w.id); return <Chip key={w.id} label={w.label} tone={on ? 'live' : 'q'} icon={on ? 'check' : 'add'} onPress={() => L.toggleWin(w.id)} />; })}
      </View>
      <RowsCard style={{ marginTop: space.md }}>
        <Row icon="bell" title="How Life checks in" sub={CHECK_IN_WORDS[L.loops.checkIn].label} onPress={() => nav.go('notifs')} />
      </RowsCard>
    </>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.lg, padding: space.cardPad },
  unstuck: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: space.lg },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.sm },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  words: { paddingHorizontal: space.gutter, paddingTop: space.sm },
  sheet: { paddingHorizontal: space.gutter, paddingTop: space.lg },
  compact: { minHeight: 46, paddingVertical: space.xxs },
  input: { flex: 1, minHeight: 48, borderRadius: radius.tile, paddingVertical: 12, paddingHorizontal: space.md, fontSize: 15, lineHeight: 22 },
  photoChip: { alignSelf: 'flex-start', height: 28, paddingHorizontal: space.tile, borderRadius: radius.full, justifyContent: 'center' },
});
