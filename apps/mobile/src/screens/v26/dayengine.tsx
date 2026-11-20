/**
 * Today's moves on a real account (BUILD_V26 Phase 29): the day engine's plan in the board's move deck, and "Why am I
 * seeing this?" from the reasons the planner gave. The sample life keeps the board's three moves (`state/today.ts`).
 */
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { NUDGE_WINDOW, daysBetween, freeGaps, gapFor, instantAt, localDate, localMinutes, type Busy, type CandidateSource, type DayPlan, type MoveKind, type PlannedMove } from '@life/core';
import { Press, RoundButton, Text, feedback, photos, space, useTokens, type MoveCard } from '@/design';
import { busyTimes, calendarSupported } from '@/services/calendar';
import { deviceTimeZone } from '@/state/loops';
import type { PhotoName } from '@/design/photos';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import { learnedNote, useDayPlan } from '@/state/dayplan';
import { stepRoute, useLoops } from '@/state/loops';
import { kindOf } from '@/state/people';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
import { Body, Btn, Callout, Display, Eyebrow, Micro, Page, RowsCard, Row, Statement, Thumb } from './kit';

const KIND_PHOTO: Record<MoveKind, PhotoName> = {
  mission: 'payslip', admin: 'letter', people: 'friends', health: 'walk', habit: 'breathe', routine: 'calmdesk', gambit: 'aimdesk', glimpse: 'sky', lesson: 'journal',
};
const KIND_WORD: Record<MoveKind, string> = {
  mission: 'Mission', admin: 'Admin', people: 'People', health: 'Body', habit: 'Habit', routine: 'Time for you', gambit: 'A bigger move', glimpse: 'A glimpse', lesson: 'Learning',
};

const sizeWords = (minutes?: number) => (minutes ? `about ${minutes} min` : null);

/** The paper chip: where it came from and how long it takes. */
export function moveChip(source: CandidateSource | undefined, move: PlannedMove): string {
  const size = sizeWords(source?.candidate.minutes);
  const where = source?.from === 'plan' ? 'On your plan' : source?.from === 'habit' ? 'Habit' : KIND_WORD[move.kind];
  return size ? `${where} · ${size}` : where;
}

/** The line under the title: the priority it serves, or the planner's first reason. */
export function moveSub(source: CandidateSource | undefined, move: PlannedMove): string {
  if (source?.priority) return `For “${source.priority}”`;
  return move.why[0]?.replace(/\.$/, '') ?? KIND_WORD[move.kind];
}

export function moveCard(source: CandidateSource | undefined, move: PlannedMove): MoveCard {
  const photo = KIND_PHOTO[move.kind];
  return { key: move.id, title: move.title, chip: moveChip(source, move), sub: moveSub(source, move), photo: photos[photo], focal: { y: photo === 'payslip' ? 0.78 : 0.55 } };
}

/** Today's opening line on a real account, from the shape of the plan. Braces mark the bright words. */
export function planBrief(plan: DayPlan, count: number): string {
  const next = plan.next;
  if (!next) return 'Nothing’s pressing today. {@check Plan your day} whenever you’re ready.';
  if (next.tags.includes('deadline')) return `{@clock ${next.title}} is due within a day. Everything else can wait.`;
  if (plan.tone === 'gentle') return `A {lighter day}. {@check One small move} is enough.`;
  if (plan.tone === 'bold' && count > 1) return `You’ve got energy. {@doc ${count} moves} today, the bigger one first.`;
  return count === 1 ? `{@check One move} today: {${next.title}}.` : `{@check ${count} moves} today, starting with {${next.title}}.`;
}

/** Today's deck for a real account: the cards, what taking or passing does, and opening a move. */
export function useRealMoves() {
  const nav = useNavigation(), { update } = useSeed(), dp = useDayPlan(), L = useLoops();
  const cards = dp.left.map(m => moveCard(dp.sources[m.id], m));
  const onDecide = (d: 'take' | 'pass', id: string) => { const move = dp.left.find(m => m.id === id) ?? dp.left[0]; if (move) dp.decide(move, d); };
  const open = (id: string) => {
    const s = dp.sources[id];
    if (!s) return;
    if (s.mission) { update(c => ({ ...c, selectedMission: s.mission! })); nav.go('mission'); return; }
    if (s.from === 'habit') { nav.go('habits'); return; }
    if (s.from === 'dated') { nav.go('people'); return; }
    const route = s.step ? stepRoute(s.step) : null;
    if (route) { nav.go(route.to); return; }
    // A step with no screen of its own: start it here, so Today shows it in progress with a Done.
    const located = s.step ? L.locate(s.step.key) : null;
    if (located) { L.start(located.step, located.priority); feedback.primary(); }
  };
  return { ...dp, cards, onDecide, open, brief: planBrief(dp.plan, dp.moves.length) };
}

/** "Why am I seeing this?" for a real account: the rules that shaped today, then each move's reasons. */
export function WhyRealV26() {
  const nav = useNavigation(), { data } = useSeed(), dp = useDayPlan();
  const moves = dp.moves;
  return (
    <Page screen="why">
      <Eyebrow orb right={<RoundButton icon="close" size="sm" label="Close" onPress={nav.close} />}>Why am I seeing this?</Eyebrow>
      <Statement s={moves.length ? `Life chose {${moves.length === 1 ? 'one move' : `${moves.length} moves`}} from {what you told it}.` : 'No moves today. Life only suggests {what it knows about}.'} style={{ marginTop: space.sm }} />
      {dp.plan.why.length ? <>
        <Micro style={{ marginTop: space.lg }}>WHAT SHAPED TODAY</Micro>
        <View style={{ marginTop: space.xs, gap: space.xs }}>{dp.plan.why.map(w => <Body key={w} s={w} />)}</View>
      </> : null}
      {moves.length ? <>
        <Micro style={{ marginTop: space.lg }}>EACH MOVE</Micro>
        <RowsCard style={{ marginTop: space.xs }}>
          {moves.map(m => {
            const reasons = [...m.why], learned = learnedNote(data, m.kind, dp.context, dp.day);
            if (learned && !reasons.some(r => r.startsWith('You often'))) reasons.push(learned);
            return <Row key={m.id} title={m.title} sub={reasons.join(' ') || moveSub(dp.sources[m.id], m)} />;
          })}
        </RowsCard>
      </> : null}
      <Callout style={{ marginTop: space.md }}>Moves come from your plan, missions you’ve started, dates you’ve added and your habits. What you take or pass teaches Life, on this phone only.</Callout>
    </Page>
  );
}

/* ───────────────────────── Your day, from the calendar ───────────────────────── */

const clock = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
type Span = { start: number; end: number; busy: boolean };

/** Busy and free stretches between the nudge window's ends, in order. */
function spans(busy: readonly Busy[], from: number, to: number): Span[] {
  const out: Span[] = [];
  let cursor = from;
  for (const b of [...busy].sort((a, c) => a.start - c.start)) {
    const start = Math.max(from, b.start), end = Math.min(to, b.end);
    if (end <= start || end <= cursor) continue;
    if (start > cursor) out.push({ start: cursor, end: start, busy: false });
    out.push({ start: Math.max(cursor, start), end, busy: true });
    cursor = end;
  }
  if (to > cursor) out.push({ start: cursor, end: to, busy: false });
  return out;
}

/**
 * "Your day" on a real account: when you're busy and free today, from the calendars on this phone, read only. Only
 * the times are shown, never what the events are. The first free stretch that fits today's move is where Life nudges.
 */
export function CalendarRealV26() {
  const t = useTokens(), nav = useNavigation(), { data, update } = useSeed(), dp = useDayPlan();
  const tz = deviceTimeZone(), now = Date.now(), today = localDate(now, tz);
  const from = instantAt(today, NUDGE_WINDOW.start, tz), to = instantAt(today, NUDGE_WINDOW.end, tz);
  const allowed = calendarSupported && data.choices['calendar-permission'] === 'granted';
  const [busy, setBusy] = useState<Busy[] | null>(null);
  useEffect(() => { let on = true; if (allowed) void busyTimes(from, to).then(b => { if (on) setBusy(b ?? []); }); return () => { on = false; }; }, [allowed, from, to]);
  const next = dp.plan.next, source = next ? dp.sources[next.id] : undefined;
  const gaps = busy ? freeGaps(busy, Math.max(now, from), to) : [];
  const fit = next ? gapFor(gaps, source?.candidate.minutes ?? 10, Math.max(now, from)) : null;
  const booked = busy ? busy.filter(b => b.end > from && b.start < to).length : 0;
  const open = () => { if (next) { const s = dp.sources[next.id]; if (s?.mission) update(c => ({ ...c, selectedMission: s.mission! })); } nav.go(source?.mission ? 'mission' : 'today'); };

  if (!allowed) return (
    <Page screen="calendar" bar={{ kind: 'push', title: 'Your day' }}>
      <Display s={calendarSupported ? 'Life can’t see {your calendar} yet.' : 'Your calendar works {on your phone}.'} />
      <Body s="With a yes, Life reads only when you’re busy, never what the events are, and never changes your calendar." style={{ marginTop: space.xs }} />
      {calendarSupported ? <Btn label="Allow calendar access" onPress={() => nav.go('calprimer')} style={{ marginTop: space.lg }} /> : null}
    </Page>
  );
  return (
    <Page screen="calendar" bar={{ kind: 'push', title: 'Your day' }}>
      <Eyebrow>{`Today · ${booked} booked`}</Eyebrow>
      <Display s={!busy ? 'Reading {your calendar}.' : fit && next ? `Life found {@clock ${fit.minutes} free minutes} for {${next.title}}.` : booked ? 'A {full day}. Today’s move can wait for a gap.' : 'A {clear day} between 09:00 and 19:00.'} />
      <View style={{ marginTop: space.xl, gap: 6 }}>
        {(busy ? spans(busy, from, to) : []).map(sp => {
          const minutes = Math.round((sp.end - sp.start) / 60_000), here = !!fit && !sp.busy && fit.start >= sp.start && fit.start < sp.end;
          return (
            <View key={sp.start} style={{ flexDirection: 'row', gap: space.tile }}>
              <Text variant="callout" tone={here ? 'ink' : 'ink2'} style={{ width: 44, paddingTop: space.xs, fontVariant: ['tabular-nums'] }}>{clock(localMinutes(sp.start, tz))}</Text>
              {here && next ? (
                <Press haptic="open" onPress={open} accessibilityLabel={`Free for ${minutes} minutes. Life will nudge you here: ${next.title}.`} style={[styles.block, styles.gap, { backgroundColor: t.emberTint }]}>
                  <View style={{ flex: 1 }}>
                    <Micro sig>{`FREE · ${minutes} MIN`}</Micro>
                    <Text variant="title" style={{ marginTop: 6 }}>Life will nudge you here</Text>
                    <Text variant="callout" tone="ink2" style={{ marginTop: 2 }}>{`${next.title}.`}</Text>
                  </View>
                  <Thumb source={photos.calmdesk} />
                </Press>
              ) : (
                <View accessible accessibilityLabel={`${clock(localMinutes(sp.start, tz))}, ${sp.busy ? 'Busy' : 'Free'} for ${minutes} minutes`} style={[styles.block, { minHeight: Math.max(36, Math.min(120, minutes)), backgroundColor: sp.busy ? t.surface3 : 'transparent' }]}>
                  <Text variant="callout" tone={sp.busy ? 'ink2' : 'quiet'}>{sp.busy ? 'Busy' : 'Free'}</Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
      <Callout style={{ marginTop: space.md }}>Life only reads when you’re busy or free, never the details of your events.</Callout>
    </Page>
  );
}

const styles = StyleSheet.create({
  block: { flex: 1, borderRadius: 14, paddingVertical: space.xs, paddingHorizontal: 14, justifyContent: 'flex-start' },
  gap: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.sm, paddingLeft: 14 },
});

/** Coming up on a real account: birthdays and anniversaries from Your people in the next 60 days. */
export function useComingUp(): { id: string; day: number; month: string; title: string; end: string }[] {
  const { data } = useSeed();
  const tz = deviceTimeZone(), now = Date.now(), today = localDate(now, tz);
  return data.people.flatMap(p => {
    const m = /^(\d{1,2}) ([A-Za-z]+)$/.exec(p.date ?? ''), month = m ? MONTHS.indexOf(m[2]) : -1;
    if (!m || month < 0 || kindOf(p) === 'memorial') return [];
    const year = Number(today.slice(0, 4)), key = (y: number) => `${y}-${String(month + 1).padStart(2, '0')}-${String(Number(m[1])).padStart(2, '0')}`;
    const date = key(year) >= today ? key(year) : key(year + 1), days = daysBetween(today, date);
    if (days > 60) return [];
    const first = p.name.split(' ')[0];
    return [{ id: p.id, day: Number(m[1]), month: m[2].slice(0, 3), title: kindOf(p) === 'anniversary' ? 'Your anniversary' : `${first}’s birthday`, end: days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`, days }];
  }).sort((a, b) => a.days - b.days).slice(0, 3).map(({ days: _d, ...r }) => r);
}
