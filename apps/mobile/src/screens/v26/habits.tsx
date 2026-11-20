/**
 * Habits, restyled to the V26 board (`body-b.js` habits and habitnew, `core.js` strength). Never miss twice: a missed
 * night offers a gentler time, a miss costs a little strength and never the streak, and new habits are built as one
 * sentence. Habits save on this phone (`data.habits`); the forgiving strength model is Track B's (gap 13).
 */
import { useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import {
  BecomingScale, DotGrid, DotStrip, FilterChips, PhotoCard, PhotoGrid, PickRow, SegmentedV26, SwitchV26, Text, TileGrid, V26Tile,
  feedback, photos, radius, space, useTokens, type DotCell, type PhotoName,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import type { SeedHabit } from '@/state/seed';
import { rescue, strengthSample } from '@/state/body';
import { Between, Body, Box, Btn, Callout, Chip, Display, Eyebrow, Micro, Page, QuietLink, Row, RowsCard, Statement } from './kit';
import { PhotoDots } from './bodykit';

const TYPICAL = 66;
const PHOTO: Record<string, PhotoName> = { water: 'gotit', daylight: 'walk', bed: 'bedroom' };
const SPARE: PhotoName[] = ['calmdesk', 'breakfast', 'journal', 'terrace'];
const lived = (x: SeedHabit) => x.last14.filter(Boolean).length;
const cueOf = (x: SeedHabit) => (x.shortCue ?? x.cue).split(' · ')[0].replace(/,? I will.*$/, '');
/** Slots are for habits still being built: one that feels automatic (4 or 5 of 5) or has graduated frees its slot. */
const SLOTS = 3;

function useHabits() {
  const { data } = useSeed();
  const graduated = (x: SeedHabit) => !!data.flags[`graduated-${x.id}`];
  const active = data.habits.filter(x => !graduated(x));
  const building = active.filter(x => (x.automaticity ?? 0) < 4);
  return { active, building, graduated };
}

/* ───────────────────────── Habits ───────────────────────── */

export function HabitsV26() {
  const nav = useNavigation(), { data, set, choose, flag } = useSeed(), { active, graduated } = useHabits();
  const done = active.filter(x => x.last14[13]).length;
  const easiest = active.filter(x => (x.automaticity ?? 0) >= 4).sort((a, b) => (b.automaticity ?? 0) - (a.automaticity ?? 0))[0];
  const rescueHabit = active.find(x => x.id === rescue.habit && !x.last14[12] && !x.last14[13] && !data.flags['habit-rescue-dismissed']);
  const rescued = rescueHabit ? data.choices['bedtime-habit'] : undefined;
  const grid = data.habits.filter(x => x.id !== rescueHabit?.id);
  const asked = active.find(x => x.automaticity === undefined && x.id !== rescueHabit?.id) ?? active.find(x => x.automaticity === undefined);
  const askValue = data.choices.automaticity ?? '';
  const rate = (v: string) => {
    choose('automaticity', v);
    if (asked) set({ habits: data.habits.map(x => x.id === asked.id ? { ...x, automaticity: Number(v) } : x) });
  };
  const open = (id: string) => { choose('habit', id); nav.go('strength'); };
  const count = active.length === 1 ? '1 habit' : `${active.length} habits`;
  return (
    <Page screen="habits" bar={{ kind: 'push', title: 'Habits', action: { kind: 'icon', icon: 'add', label: 'New habit', onPress: () => nav.go('habitnew') } }}>
      {active.length
        ? <Display s={`{${count}}, {${done} done} today.${easiest ? ` ${easiest.name} is {close to automatic}.` : ' {Small and daily} beats big and rare.'}`} />
        : <Display s="No habits yet. {Start one tiny thing} after something you already do." />}
      {rescueHabit ? (rescued ? (
        <Box style={{ marginTop: space.xl }}>
          <Between><Micro>Tonight</Micro><Chip label={`Set for ${rescued}`} tone="done" /></Between>
          <Text variant="headline" style={{ marginTop: space.tile }}>{`In bed by ${rescued}`}</Text>
          <Text variant="body" tone="ink2" style={{ marginTop: space.xxs }}>That still counts. Missing one day doesn’t reset you.</Text>
          <Btn ghost sm fit label="Change" onPress={() => choose('bedtime-habit', '')} style={{ marginTop: space.md }} />
        </Box>
      ) : (
        <Box style={{ marginTop: space.xl }}>
          <Between><Micro sig>Never miss twice</Micro><Text variant="callout" tone="ink2">{`Day ${rescueHabit.day ?? 1} · ${lived(rescueHabit)} of last 14`}</Text></Between>
          <Text variant="headline" style={{ marginTop: space.tile }}>{rescueHabit.name}</Text>
          <Text variant="callout" tone="ink2" style={{ marginTop: 2 }}>{rescueHabit.cue}</Text>
          <DotStrip days={rescueHabit.last14.map(Boolean)} style={{ marginTop: space.sm }} />
          <Body s={`You missed last night. Tonight, just aim for {${rescue.time}}. That still counts.`} style={{ marginTop: space.sm }} />
          <Btn label={`Okay, ${rescue.time}`} onPress={() => { choose('bedtime-habit', rescue.time); feedback.complete(); }} style={{ marginTop: space.md }} />
          <QuietLink label="Skip tonight" onPress={() => flag('habit-rescue-dismissed', true)} style={{ marginTop: space.sm }} />
        </Box>
      )) : null}
      {grid.length ? (
        <PhotoGrid style={{ marginTop: rescueHabit ? space.sm : space.xl }}>
          {grid.map((x, i) => {
            const grad = graduated(x), today = !!x.last14[13];
            const facts = [`${lived(x)} of last 14`, x.automaticity ? `feels automatic ${x.automaticity}/5` : '', x.source ?? ''].filter(Boolean).join(' · ');
            return (
              <PhotoCard key={x.id} source={photos[PHOTO[x.id] ?? SPARE[i % SPARE.length]]} focal={{ y: 1 }} height={210} size="sm"
                chips={[grad ? 'Routine' : today ? { label: `Day ${x.day ?? 1}`, icon: 'check' } : `Day ${x.day ?? 1}`]}
                title={x.name} sub={grad ? 'Graduated to a routine' : facts} onPress={() => open(x.id)}>
                <PhotoDots days={x.last14.map(Boolean)} />
              </PhotoCard>
            );
          })}
        </PhotoGrid>
      ) : null}
      {asked ? (
        <Box style={{ marginTop: space.sm }}>
          <Micro>Every 2 weeks</Micro>
          <Statement s={`How automatic does {${asked.name.charAt(0).toLowerCase() + asked.name.slice(1)}} feel?`} style={{ marginTop: space.xs }} />
          <SegmentedV26 options={['1', '2', '3', '4', '5'].map(v => ({ value: v, label: v }))} value={askValue} onChange={rate} style={{ marginTop: space.md }} />
          <Between style={{ marginTop: space.xs }}><Text variant="callout" tone="ink2">I have to remember</Text><Text variant="callout" tone="ink2">It just happens</Text></Between>
        </Box>
      ) : null}
      {!active.length ? <Btn label="Start a tiny habit" onPress={() => nav.go('habitnew')} style={{ marginTop: space.xl }} /> : null}
      <Callout style={{ marginTop: space.md }}>Habits take about 66 days on average to feel automatic, some sooner, some later (Lally et al., 2010). Missing one day doesn’t reset you.</Callout>
    </Page>
  );
}

/* ───────────────────────── New habit, as a sentence ───────────────────────── */

const CUES = ['the kettle boils', 'I wake up', 'I sit at my desk', 'I brush my teeth', 'breakfast'];
const ACTIONS = ['drink a glass of water', 'do 2 push-ups', 'read one page', 'write one line', 'step outside'];
const PLACES = ['in the kitchen', 'at my desk', 'in the bedroom'];

export function HabitnewV26() {
  const nav = useNavigation(), t = useTokens(), { data, set } = useSeed(), { building } = useHabits();
  const [cue, setCue] = useState(CUES[0]), [action, setAction] = useState(ACTIONS[0]), [place, setPlace] = useState<string | null>(null);
  const [auto, setAuto] = useState(true), [editing, setEditing] = useState<'cue' | 'action' | null>(null);
  const full = building.length >= SLOTS, ready = !!place && !full;
  const start = () => {
    if (!ready) return;
    const name = action.charAt(0).toUpperCase() + action.slice(1);
    set({ habits: [...data.habits, { id: `habit-${Date.now()}`, name, cue: `After ${cue}, I will ${action} ${place}.`, shortCue: `After ${cue}`, day: 1, last14: Array(14).fill(false), autoComplete: auto }] });
    feedback.file();
    nav.close();
  };
  const store = Platform.OS === 'android' ? 'Health Connect' : 'Apple Health';
  return (
    <Page screen="habitnew" bar={{ kind: 'sheet', title: 'New habit' }}
      footer={<View style={{ gap: space.xs }}>
        <Btn label="Start this habit" disabled={!ready} onPress={start} />
        <Callout center>{full ? `All ${SLOTS} new-habit slots are in use. One frees up when a habit feels automatic.` : `You have ${building.length} of ${SLOTS} new-habit slots in use.`}</Callout>
      </View>}>
      <Eyebrow star>Start tiny · your habit</Eyebrow>
      <Display s={`After {${cue}}, I will {${action}}${place ? ` {${place}}.` : ''}`} />
      {place ? null : <View style={[styles.blank, { backgroundColor: t.surface3 }]} accessibilityLabel="Where, not chosen yet" />}
      <Body s="Pick a moment that already happens every day, then attach something that takes under two minutes." style={{ marginTop: space.sm }} />
      <View style={{ gap: space.xs, marginTop: space.lg }}>
        <PickRow label="After…" value={cue} set onPress={() => setEditing(editing === 'cue' ? null : 'cue')} />
        {editing === 'cue' ? <FilterChips wrap options={CUES.map(v => ({ value: v, label: v }))} value={cue} onChange={v => { setCue(v); setEditing(null); }} style={{ paddingVertical: space.xs }} /> : null}
        <PickRow label="I will…" value={action} set onPress={() => setEditing(editing === 'action' ? null : 'action')} />
        {editing === 'action' ? <FilterChips wrap options={ACTIONS.map(v => ({ value: v, label: v }))} value={action} onChange={v => { setAction(v); setEditing(null); }} style={{ paddingVertical: space.xs }} /> : null}
        {place ? <>
          <PickRow label="Where" value={place} set onPress={() => setPlace(null)} />
          <Box pad={space.md}>
            <Between>
              <View style={{ flexShrink: 1 }}><Text variant="title">Mark done automatically</Text><Text variant="callout" tone="ink2">{`When ${store} shows it (if it can)`}</Text></View>
              <SwitchV26 value={auto} onChange={setAuto} accessibilityLabel="Mark this habit done automatically" />
            </Between>
          </Box>
        </> : (
          <Box pad={space.md}>
            <Between><Text variant="title">Where</Text><Text variant="callout" tone="ink2">Tap one</Text></Between>
            <FilterChips wrap options={PLACES.map(v => ({ value: v, label: v }))} value={null} onChange={setPlace} style={{ marginTop: space.sm }} />
          </Box>
        )}
      </View>
    </Page>
  );
}

/* ───────────────────────── Habit strength ───────────────────────── */

export function StrengthV26() {
  const nav = useNavigation(), { data, set, choose, flag } = useSeed();
  const real = data.habits.find(x => x.id === data.choices.habit);
  const s = strengthSample;
  const doneToday = real ? !!real.last14[13] : !!data.flags['walk-done-today'];
  const last14 = real ? real.last14.map(Boolean) : s.week.split('').map((b, i) => (i === 13 ? doneToday : b === '1'));
  const day = real ? real.day ?? 1 : s.day;
  const name = real ? real.name : s.name, cue = real ? cueOf(real) : s.cue;
  const typical = s.typicalDays;
  // The grid: every day so far, then the days still to come; the last 14 come from the record.
  const cells: DotCell[] = Array.from({ length: Math.max(typical, day) }, (_, k) => {
    if (k >= day) return '';
    if (k === day - 1) return doneToday ? 'on' : 'now';
    if (!real) return s.misses.includes(k) ? 'miss' : 'on';
    const i = k - (day - 14);
    return i >= 0 ? (last14[i] ? 'on' : 'miss') : 'on';
  });
  const misses = cells.filter(c => c === 'miss').length;
  const thisWeek = last14.slice(7).filter(Boolean).length;
  let streak = 0;
  for (let i = doneToday ? 13 : 12; i >= 0 && last14[i]; i--) streak++;
  const strength = real ? Math.round(100 * (last14.filter(Boolean).length / 14) * (0.5 + 0.5 * Math.min(1, day / typical))) : s.strength;
  const feltKey = `felt-${real?.id ?? 'walk'}`;
  const felt = data.choices[feltKey] ? data.choices[feltKey].split(',').map(Number) : real ? [] : s.felt;
  const answer = (v: number) => { choose(feltKey, [...felt, v].slice(-5).join(',')); feedback.select(); };
  const toggle = () => {
    if (real) set({ habits: data.habits.map(x => x.id === real.id ? { ...x, last14: x.last14.map((b, i) => (i === 13 ? !b : b)) } : x) });
    else flag('walk-done-today', !doneToday);
    if (!doneToday) feedback.complete();
  };
  const left = typical - day;
  const noun = real ? 'it' : 'today’s walk';
  return (
    <Page screen="strength" bar={{ kind: 'push', title: '', action: { kind: 'menu', label: 'Habit actions', items: [
      { label: 'It feels automatic now', sub: 'Make it a routine and free a slot', icon: 'check', onPress: () => { flag(`graduated-${real?.id ?? 'walk'}`, true); feedback.complete(); } },
      ...(real ? [{ label: 'Stop this habit', sub: 'Its history stays in your export', icon: 'trash' as const, destructive: true, onPress: () => { set({ habits: data.habits.filter(x => x.id !== real.id) }); nav.close(); } }] : []),
    ] } }}
      footer={<Btn label={doneToday ? 'Done today · undo' : 'Done today'} icon={doneToday ? undefined : 'check'} ghost={doneToday} onPress={toggle} />}>
      <Eyebrow>{`${name} · ${cue.charAt(0).toLowerCase() + cue.slice(1)}`}</Eyebrow>
      <Display s={day >= typical ? `Day {${day}}. Past the usual {${typical} days}.` : `Day {${day}} of about {${typical}}. ${day / typical >= 0.5 ? 'It’s becoming automatic.' : 'Early days, and that’s normal.'}`} />
      <Box style={{ marginTop: space.xl }}>
        <DotGrid cells={cells} columns={11} label={`${day} days in, ${misses} missed, about ${typical} in all`} />
        <Between style={{ marginTop: space.md }}>
          <Text variant="callout" tone="ink2">{misses ? `${misses} ${misses === 1 ? 'miss' : 'misses'}, forgiven` : 'No misses yet'}</Text>
          <Text variant="callout" tone="ink2">{left > 0 ? `${left} days to go` : 'Usual time reached'}</Text>
        </Between>
      </Box>
      <TileGrid style={{ marginTop: space.sm }}>
        <V26Tile label="Strength" scale="/100" value={String(strength)} sub="A miss cost 2 points, not the streak" />
        <V26Tile label="This week" scale={`${thisWeek} of 7`} value={String(streak)} unit="day streak">
          <DotStrip days={last14} style={{ marginTop: space.sm }} />
        </V26Tile>
      </TileGrid>
      <Box style={{ marginTop: space.sm }}>
        <Micro>Who you’re becoming</Micro>
        <Statement s={`{Did ${noun} feel like you?}`} style={{ marginTop: space.xs }} />
        <BecomingScale marks={felt.length ? felt : [50]} label={felt.length ? undefined : 'No answers yet'} />
        <View style={{ flexDirection: 'row', gap: space.xs, marginTop: space.md }}>
          <Btn ghost sm label="Not really" onPress={() => answer(30)} style={{ flex: 1 }} />
          <Btn ghost sm label="Yes" onPress={() => answer(80)} style={{ flex: 1 }} />
        </View>
      </Box>
    </Page>
  );
}

const styles = StyleSheet.create({
  blank: { width: 112, height: 28, borderRadius: radius.sm, marginTop: 6 },
});
