import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Button, Card, Checklist, DateRow, ListRow, PersonAvatar, Text, feedback, space } from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import type { ScreenKey } from '@/navigation/screens';
import { useSeed } from '@/state/SeedProvider';
import { seed } from '@/state/seed';
import { Heading, Input, LocalNotice, Screen, Section, layout } from './Screen';

const contacts = [{ id: 'kofi', name: 'Kofi Mensah', date: '18 November', relation: 'Brother', days: 4, note: 'Loves cooking and running.' }, { id: 'priya', name: 'Priya Shah', date: '2 December', relation: 'Friend', days: 16, note: '' }, { id: 'efua', name: 'Efua Mensah', date: 'No birthday saved', relation: 'Grandma', days: 0, note: '' }, { id: 'daniel', name: 'Daniel Okafor', date: '30 April', relation: 'Friend', days: 165, note: '' }, { id: 'hannah', name: 'Hannah Lee', date: 'No birthday saved', relation: 'Friend', days: 0, note: '' }];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const snapshot = new Date(`${seed.date}T00:00:00Z`);
function nextDate(value: string) {
  const match = /^(\d{1,2}) ([A-Za-z]+)$/.exec(value), month = match ? monthNames.indexOf(match[2]) : -1;
  if (!match || month < 0) return undefined;
  const day = Number(match[1]), date = new Date(Date.UTC(snapshot.getUTCFullYear(), month, day));
  if (date.getUTCMonth() !== month || date.getUTCDate() !== day) return undefined;
  if (date < snapshot) date.setUTCFullYear(date.getUTCFullYear() + 1);
  return date;
}
const daysUntil = (date: Date) => Math.round((date.getTime() - snapshot.getTime()) / 86400000);
const countdown = (days: number) => days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `In ${days} days`;

export function PeopleScreen({ screen }: { screen: ScreenKey }) {
  const nav = useNavigation(), { data, set, choose, flag } = useSeed(), [selected, setSelected] = useState(['kofi', 'priya', 'efua']);
  const person = data.people.find(p => p.id === data.choices.person) ?? data.people[0], [name, setName] = useState(person?.name ?? ''), [note, setNote] = useState(person?.note ?? '');
  useEffect(() => { setName(person?.name ?? ''); setNote(person?.note ?? ''); }, [person?.id, person?.name, person?.note]);
  const dated = data.people.flatMap(person => { const at = nextDate(person.date); return at ? [{ person, at, days: daysUntil(at) }] : []; }).sort((a, b) => a.at.getTime() - b.at.getTime());
  const upcoming = dated.filter(event => event.person.id !== 'kwame').slice(0, 3);
  const openPerson = (id: string) => { choose('person', id); nav.go('person'); };
  const snapshotLabel = snapshot.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  if (screen === 'people') return <Screen screen={screen} title="Your people" action={{ kind: 'icon', icon: 'add', label: 'Add people from contacts', onPress: () => nav.go('addperson') }}>
    <Text variant="callout" tone="ink2">{`${data.people.length} people · ${dated.filter(event => event.at.getUTCMonth() === snapshot.getUTCMonth() && event.at.getUTCFullYear() === snapshot.getUTCFullYear()).length} dates in ${monthNames[snapshot.getUTCMonth()]}`}</Text>
    <Section title="Coming up"><View style={{ gap: space.xs }}>{upcoming.map((event, i) => i === 0 ? <Card key={event.person.id} padding={space.md} onPress={() => openPerson(event.person.id)} style={{ gap: space.sm }}><View style={[layout.row, { gap: space.md }]}><PersonAvatar name={event.person.name} area="home" /><View style={{ flex: 1, gap: space.xxs }}><Text variant="title">{event.person.name}</Text><Text variant="callout" tone="ink2">{`${event.person.id === 'sam' ? 'Anniversary' : 'Birthday'} · ${event.person.date}`}</Text></View></View><Text variant="callout" tone="ink2">{countdown(event.days)}</Text></Card> : <DateRow key={event.person.id} name={event.person.name} date={event.person.date} kind={event.person.id === 'sam' ? 'anniversary' : 'birthday'} detail={`${event.person.id === 'sam' ? 'Anniversary' : 'Birthday'} · ${event.person.date} · ${countdown(event.days).toLowerCase()}`} onPress={() => openPerson(event.person.id)} />)}{!upcoming.length ? <Text variant="body" tone="ink2">No upcoming dates saved.</Text> : null}</View></Section>
    <Section title="Your people"><View style={{ gap: space.xs }}>{data.people.map(p => <DateRow key={p.id} name={p.name} date={p.date} kind={p.id === 'kwame' ? 'memorial' : p.id === 'sam' ? 'anniversary' : 'birthday'} detail={p.id === 'kwame' ? `${p.date} · remembered quietly, no reminder` : p.date && nextDate(p.date) ? `${p.relation} · ${p.id === 'sam' ? 'anniversary' : 'birthday'} ${p.date}` : p.summary ?? `${p.relation} · no birthday saved`} onPress={() => openPerson(p.id)} />)}</View></Section>
    <Button variant="secondary" label="Important dates" onPress={() => nav.go('dates')} /><LocalNotice text={`Sample dates as of ${snapshotLabel}. Reminders are not scheduled.`} />
  </Screen>;
  if (screen === 'person' && !person) return <Screen screen={screen} title="Your people"><Heading title="No person selected" /><Button variant="secondary" label="Add people from contacts" onPress={() => nav.go('addperson')} /></Screen>;
  if (screen === 'person' && person?.id === 'kwame') return <Screen screen={screen} title={person.name}><View style={[layout.row, { gap: space.md }]}><PersonAvatar name={person.name} area="home" /><View style={{ flex: 1 }}><Heading variant="headline" title={person.name} sub={person.date} /></View></View><Text variant="body" tone="ink2">Remembered quietly · no reminder.</Text></Screen>;
  if (screen === 'person' && person) {
    const birthday = nextDate(person.date);
    return <Screen screen={screen} title={person.name} action={{ kind: 'text', label: data.flags['person-edit'] ? 'Done' : 'Edit', onPress: () => { if (data.flags['person-edit']) set({ people: data.people.map(p => p.id === person.id ? { ...p, name: name.trim() || p.name, note } : p) }); flag('person-edit'); } }}>
      <View style={[layout.row, { gap: space.md }]}><PersonAvatar name={person.name} area="home" /><View style={{ flex: 1 }}><Heading variant="headline" title={person.name} sub={`${person.relation}${birthday ? ` · ${person.date}` : ''}`} /></View></View>
      {data.flags['person-edit'] ? <><Input label="Name" value={name} onChange={setName} /><Input label="Notes" value={note} onChange={setNote} multiline /></> : null}
      {birthday ? <Section title={person.id === 'sam' ? 'Anniversary plan' : 'Birthday plan'}><Text variant="callout" tone="ink2">{`${birthday.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })} · ${countdown(daysUntil(birthday)).toLowerCase()}`}</Text><Checklist items={['Order a card', 'Get the gift', 'Message on the day'].map((label, i) => ({ label, sub: person.id === 'kofi' ? [`Before ${person.date}`, 'From your ideas below', 'life drafts it, you send it'][i] : undefined, done: !!data.flags[`person-${person.id}-${i}`] }))} onToggle={i => flag(`person-${person.id}-${i}`)} /></Section> : null}
      {person.id === 'kofi' ? <Section title="Gift ideas you mentioned"><View><ListRow title="Running vest" sub="“his old one’s falling apart” · Talk, Sep" /><ListRow title="Ghana match tickets" sub="Chat, August" /></View></Section> : person.note ? <Text variant="body" tone="ink2">{person.note}</Text> : null}
      <View>{person.id === 'kofi' ? <ListRow title="Last spoke" sub="Sunday · phone call" /> : null}<ListRow title="Remind me to call" sub={`Every 2 weeks · ${data.flags[`call-${person.id}`] ? 'on' : 'off'}`} onPress={() => flag(`call-${person.id}`)} /></View><LocalNotice text={`Sample dates as of ${snapshotLabel}. Reminders and message drafts are local previews.`} />
    </Screen>;
  }
  if (screen === 'addperson') {
    const additions = contacts.filter(p => selected.includes(p.id) && !data.people.some(x => x.id === p.id));
    return <Screen screen={screen} title="Add people from contacts" footer={<Button label={additions.length ? `Add ${additions.length} ${additions.length === 1 ? 'person' : 'people'}` : 'Done'} disabled={!selected.length} onPress={() => { set({ people: [...data.people, ...additions.map(p => ({ ...p, date: nextDate(p.date) ? p.date : '', days: nextDate(p.date) ? daysUntil(nextDate(p.date)!) : 0 }))] }); feedback.file(); nav.close(); }} />}><Text variant="body" tone="ink2">Only the people you tick are added.</Text><Checklist items={contacts.map(p => ({ label: p.name, sub: data.people.some(existing => existing.id === p.id) ? 'Already added' : p.date === 'No birthday saved' ? p.date : `Birthday ${p.date}`, done: selected.includes(p.id) }))} onToggle={i => { const id = contacts[i].id; setSelected(selected.includes(id) ? selected.filter(v => v !== id) : [...selected, id]); }} /><LocalNotice text="Sample contacts only; your address book is not accessed." /></Screen>;
  }
  const months = [...new Set(dated.map(event => `${event.at.getUTCFullYear()}-${event.at.getUTCMonth()}`))];
  return <Screen screen={screen} title="Dates">{months.map(key => { const events = dated.filter(event => `${event.at.getUTCFullYear()}-${event.at.getUTCMonth()}` === key); return <Section key={key} title={`${monthNames[events[0].at.getUTCMonth()]}${events[0].at.getUTCFullYear() !== snapshot.getUTCFullYear() ? ` ${events[0].at.getUTCFullYear()}` : ''}`}><View style={{ gap: space.xs }}>{events.map(event => { const row = <DateRow day={String(event.at.getUTCDate())} name={event.person.id === 'kwame' ? event.person.name : event.person.id === 'sam' ? `Anniversary with ${event.person.name}` : `${event.person.name}’s birthday`} date={event.person.date} kind={event.person.id === 'kwame' ? 'memorial' : event.person.id === 'sam' ? 'anniversary' : 'birthday'} detail={event.person.id === 'kwame' ? 'Remembered quietly · no reminder' : event.person.date} onPress={() => openPerson(event.person.id)} />; return event === dated[0] ? <Card key={event.person.id} variant="tile" padding={space.md}>{row}</Card> : <View key={event.person.id}>{row}</View>; })}</View></Section>; })}{!dated.length ? <Text variant="body" tone="ink2">No important dates saved yet.</Text> : null}<LocalNotice text={`Sample calendar as of ${snapshotLabel}. Annual dates recur next year after they pass.`} /></Screen>;
}
