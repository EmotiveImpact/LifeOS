import { useState } from 'react';
import { View } from 'react-native';
import { Button, Card, ChipGroup, ControlRow, HabitRow, HeatGrid, RollingNumeral, StatusPill, Text, Toggle, TwoTone, feedback, space } from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import type { ScreenKey } from '@/navigation/screens';
import { useSeed } from '@/state/SeedProvider';
import { seedHabitStrength } from '@/state/seed';
import { Heading, LocalNotice, Screen, Section, layout } from './Screen';

export function HabitsScreen({ screen }: { screen: ScreenKey }) {
  const nav = useNavigation(), { data, set, choose, flag } = useSeed(), [cue, setCue] = useState('the kettle boils'), [action, setAction] = useState('drink a glass of water'), [place, setPlace] = useState('in the kitchen'), [auto, setAuto] = useState(false);
  // Prioritise unfinished habits on entry, but never move a row under a completed press.
  const [habitOrder] = useState(() => [...data.habits.filter(h => !h.last14[13]), ...data.habits.filter(h => h.last14[13])].map(h => h.id));
  const orderedHabits = [...habitOrder.flatMap(id => { const habit = data.habits.find(h => h.id === id); return habit ? [habit] : []; }), ...data.habits.filter(h => !habitOrder.includes(h.id))];
  const active = data.habits.filter(h => !data.flags[`graduated-${h.id}`]), selected = data.habits.find(h => h.id === data.choices.habit) ?? { ...data.habits[0], id: 'walk', name: seedHabitStrength.name };
  const toggle = (id: string) => set({ habits: data.habits.map(v => v.id === id ? { ...v, last14: v.last14.map((x, i) => i === 13 ? !x : x) } : v) });
  const automaticity = <Card style={{ gap: space.md }}><Text variant="callout" tone="ink2">Every 2 weeks</Text><Text variant="title">How automatic does “10 minutes of daylight” feel?</Text><ChipGroup options={['1', '2', '3', '4', '5'].map(v => ({ value: v, label: v }))} value={data.choices.automaticity ?? null} onChange={v => choose('automaticity', v)} /><View style={layout.between}><Text variant="callout" tone="ink2">I have to remember</Text><Text variant="callout" tone="ink2">It just happens</Text></View>{data.choices.automaticity ? <Text variant="callout" tone="ink2">Thanks. life will ask again in 2 weeks.</Text> : null}</Card>;

  if (screen === 'habits') return <Screen screen={screen} title="Habits" action={{ kind: 'icon', icon: 'add', label: 'New habit', onPress: () => nav.go('habitnew') }}>
    <TwoTone size="headline" segments={[{ text: `${active.length} habits, ` }, { text: `${active.filter(v => v.last14[13]).length} done today. `, tone: 'quiet' }, { text: 'Water before coffee ' }, { text: 'is close to automatic.', tone: 'quiet' }]} />
    {orderedHabits.map(v => <View key={v.id} style={{ gap: space.xs }}>
      <HabitRow name={v.name} cue={v.cue} last14={v.last14} source={v.source} meta={data.flags[`graduated-${v.id}`] ? 'Graduated to a routine' : `Day ${v.day ?? 1}${v.id === 'bed' && data.choices['bedtime-habit'] ? ` · tonight ${data.choices['bedtime-habit']}` : v.automaticity ? ` · feels automatic ${v.automaticity}/5` : !v.last14[12] ? ' · missed yesterday' : ''}`} onToggleToday={() => toggle(v.id)} />
      {v.id === 'bed' && !v.last14[12] && !v.last14[13] && !data.flags[`graduated-${v.id}`] && !data.flags['habit-rescue-dismissed'] ? <Card style={{ gap: space.md }}><Text variant="callout" tone="ink2">Keep the next step tiny</Text><Text variant="body">You missed “In bed by 22:50” last night. Tonight, just aim for 23:15. That still counts.</Text><Button label="Okay, 23:15" onPress={() => { choose('bedtime-habit', '23:15'); flag('habit-rescue-dismissed', true); }} /><Button variant="link" label="Skip tonight" onPress={() => flag('habit-rescue-dismissed', true)} /></Card> : null}
      <Button variant="link" label={`See ${v.name.toLowerCase()} strength`} onPress={() => { choose('habit', v.id); nav.go('strength'); }} />
      {v.id === 'daylight' ? automaticity : null}
    </View>)}
    <Text variant="callout" tone="ink2">Habits take about 66 days on average to feel automatic, some sooner, some later (Lally et al., 2010). Missing one day doesn’t reset you.</Text>
  </Screen>;

  if (screen === 'habitnew') return <Screen screen={screen} title="New habit" footer={<><Button label="Start this habit" disabled={active.length >= 3} onPress={() => { if (active.length >= 3) return; set({ habits: [...data.habits, { id: `habit-${Date.now()}`, name: action[0].toUpperCase() + action.slice(1), cue: `After ${cue}, I will ${action} ${place}.`, last14: Array(14).fill(false), autoComplete: auto }] }); feedback.file(); nav.close(); }} /><Text variant="callout" tone="ink2">{`You have ${active.length} of 3 new-habit slots in use.`}</Text></>}>
    <Heading variant="headline" title="Start tiny" sub="Pick a moment that already happens every day, then attach something that takes under two minutes." />
    <Card style={{ gap: space.xs }}><Text variant="callout" tone="ink2">Your habit</Text><Text variant="headline">{`After ${cue}, I will ${action} ${place}.`}</Text></Card>
    <Section title="After…"><ChipGroup options={['I wake up', 'the kettle boils', 'I sit at my desk', 'I brush my teeth'].map(v => ({ value: v, label: v }))} value={cue} onChange={setCue} /></Section>
    <Section title="I will…"><ChipGroup options={['drink a glass of water', 'do 2 push-ups', 'read one page', 'write one line'].map(v => ({ value: v, label: v }))} value={action} onChange={setAction} /></Section>
    <Section title="Where"><ChipGroup options={['in the kitchen', 'at my desk', 'in the bedroom'].map(v => ({ value: v, label: v }))} value={place} onChange={setPlace} /></Section>
    <ControlRow label="Mark done automatically" sub="When Apple Health shows it (if it can)"><Toggle value={auto} onChange={setAuto} accessibilityLabel="Mark habit done automatically" /></ControlRow>
    {active.length >= 3 ? <Text variant="callout" tone="ink2">Keep your three habits small for now. A slot opens when one graduates to a routine.</Text> : null}
  </Screen>;

  const strength = seedHabitStrength.strength;
  return <Screen screen={screen} title={selected.name}>
    <View style={{ gap: space.xs, alignItems: 'flex-start' }}><Text variant="callout" tone="ink2">Strength · sample model</Text><RollingNumeral value={strength} unit="%" size="xl" /><StatusPill label={`Day ${seedHabitStrength.day} of about ${seedHabitStrength.typicalDays}`} /></View>
    <Card style={{ gap: space.xs }}><Text variant="title">You missed Saturday</Text><Text variant="body" tone="ink2">Strength dipped from {seedHabitStrength.beforeMiss}% to {seedHabitStrength.strength}%. One walk today puts it back.</Text></Card>
    <Section title="Last 10 weeks"><Card><HeatGrid columns={10} values={Array.from({ length: 70 }, (_, i) => selected.last14[i % 14] ? .7 + .3 * (i / 70) : .1)} label="Habit history" /></Card></Section>
    <LocalNotice text="Local history preview; the forgiving strength model is implemented in Track B." />
  </Screen>;
}
