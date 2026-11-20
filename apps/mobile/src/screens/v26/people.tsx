/**
 * People and dates, restyled to the V26 board (`settings-people.js`): your people as photographs with whoever is next
 * in front, a person as their photograph with the birthday told as a small case, adding people, the birthday as the
 * move in front on Today, and a month of the dates you keep. People live in the seed; words in `state/people.ts`.
 */
import React, { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChatBubble, DecideRow, Field, Icon, InitialsAvatar, LifeSays, PhotoCard, PhotoFill, Press, RoundButton, SectionHead, SegmentedV26, StatusPill, SwitchV26,
  Text, VoiceNote, cardShadow, feedback, floatLift, fonts, photo, photoScrims, photos, radius, space, useTokens, type Focal,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import type { SeedPerson } from '@/state/seed';
import { SHOW_SAMPLES } from '@/state/sample';
import {
  contacts, datedPeople, daysUntil, faces, kindOf, kofiCase, kofiCaseFor, monthName, nextDate, peopleWords, personPhotos, planSteps, quietPerson, shortDay, snapshot,
  turning, weekday, type DatedPerson,
} from '@/state/people';
import { Between, Body, Btn, Callout, Chip, Display, Eyebrow, Micro, Page, QuietLink, Row, RowsCard, Statement, Tick, Timeline, drawerStyle, useDrawerPhoto } from './kit';
import { OnPhotoRound, PaperChip } from './learn';
import { RoundPhoto } from './you';

/* ───────────────────────── Shared pieces ───────────────────────── */

const firstName = (p: SeedPerson) => p.name.split(' ')[0];
const photoFor = (id: string) => personPhotos[id] ?? { photo: 'people' as const, focal: { y: 0.4 } };
function Face({ id, size = 40 }: { id: string; size?: number }) {
  const f = faces[id];
  return f ? <RoundPhoto source={photos[f.photo]} focal={f.focal} size={size} /> : <InitialsAvatar initials={id.slice(0, 1).toUpperCase()} />;
}
/** "Kofi turns 31", "Mum’s birthday", "Anniversary with Sam". */
export function dateTitle(p: SeedPerson) {
  if (turning[p.id]) return `${firstName(p)} turns ${turning[p.id]}`;
  if (p.id === 'kwame') return p.name;
  if (p.id === 'sam') return `Anniversary with ${p.name}`;
  if (p.id === 'mum') return 'Your mum’s birthday';
  return `${firstName(p)}’s birthday`;
}

/** The deck (board `.deck`): two cards resting behind, the one in front with its words low on the photograph. */
function PhotoDeck({ backs, source, focal, height, chip, title, sub, onPress, round }: { backs: { source: ImageSourcePropType; focal?: Focal }[]; source: ImageSourcePropType; focal?: Focal; height: number; chip: ReactNode; title: string; sub: string; onPress?: () => void; round?: boolean }) {
  const t = useTokens();
  const BACK = [{ inset: 14, top: 9, opacity: 0.6 }, { inset: 28, top: 0, opacity: 0.32 }];
  return (
    <View style={{ height, marginTop: space.lg }}>
      {backs.slice(0, 2).map((b, i) => (
        <View key={i} pointerEvents="none" style={[styles.back, { left: BACK[i].inset, right: BACK[i].inset, top: BACK[i].top, opacity: BACK[i].opacity, backgroundColor: t.surface3, zIndex: 2 - i }]}>
          <PhotoFill source={b.source} focal={b.focal ?? { y: 0.3 }} />
        </View>
      )).reverse()}
      <Press haptic="open" onPress={onPress} accessibilityLabel={`${title}. ${sub}`} pressScale={0.99} style={[styles.front, { ...floatLift(t.scheme) }]}>
        <View style={[styles.frontInner, { backgroundColor: t.surface2 }]}>
          <PhotoFill source={source} focal={focal} />
          <LinearGradient pointerEvents="none" colors={photoScrims.deck.colors} locations={photoScrims.deck.locations} style={StyleSheet.absoluteFill} />
          <View style={{ alignSelf: 'flex-start' }}>{chip}</View>
          <View style={styles.frontFoot}>
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text variant="display" style={{ color: photo.onPhoto, fontFamily: fonts.sansSemibold }} numberOfLines={2}>{title}</Text>
              <Text variant="body" style={{ color: photo.onPhoto2, marginTop: 6 }} numberOfLines={2}>{sub}</Text>
            </View>
            {round ? <View style={styles.paperRound}><Icon name="arrow" size={18} color={photo.ink} /></View> : null}
          </View>
        </View>
      </Press>
    </View>
  );
}

/* ───────────────────────── Your people ───────────────────────── */

export function PeopleV26() {
  const t = useTokens(), nav = useNavigation(), { data, choose } = useSeed();
  const [all, setAll] = useState(false);
  const dated = datedPeople(data.people).filter(d => d.person.id !== 'kwame');
  const next = dated[0];
  const soon = dated.filter(d => d.days <= 21).length;
  const open = (id: string) => { choose('person', id); nav.go('person'); };
  const afterIds = SHOW_SAMPLES ? ['mum', 'priya', 'sam', 'efua'] : dated.slice(1, 5).map(d => d.person.id);
  const after = afterIds.map(id => data.people.find(p => p.id === id)).filter((p): p is SeedPerson => !!p && p.id !== next?.person.id);
  const quiet = SHOW_SAMPLES ? data.people.find(p => p.id === quietPerson.id) : undefined;
  return (
    <Page screen="people" bar={{ kind: 'push', action: { kind: 'node', node: <View style={styles.actions}><RoundButton icon="calendar" label="Dates" onPress={() => nav.go('dates')} /><RoundButton icon="add" label="Add someone" onPress={() => nav.go('addperson')} /></View> } }}>
      <Eyebrow>{`Your people · ${soon} ${soon === 1 ? 'date' : 'dates'} coming up`}</Eyebrow>
      <Display s={data.people.length ? `{${data.people.length} ${data.people.length === 1 ? 'person' : 'people'}} you want to show up for.` : '{The people} you want to show up for.'} />
      {next ? (
        <PhotoDeck height={372} round onPress={() => open(next.person.id)}
          backs={[{ source: photos.birthday, focal: { y: 0.55 } }, { source: photos.people }]}
          source={photos[photoFor(next.person.id).photo]} focal={photoFor(next.person.id).focal}
          chip={<StatusPill size="chip" onPhoto dot={t.ember} label={`Next · ${weekday(next.at)} ${shortDay(next.at)}`} />}
          title={dateTitle(next.person)} sub={peopleWords[next.person.id]?.sub ?? `${next.person.relation} · in ${next.days} days`} />
      ) : (
        <View style={[styles.empty, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
          <Text variant="headline">No dates yet.</Text>
          <Body s="Add the people you care about and Life reminds you before their days." style={{ marginTop: space.xs }} />
          <Btn label="Add people" onPress={() => nav.go('addperson')} style={{ marginTop: space.md }} />
        </View>
      )}
      {after.length ? <>
        <SectionHead title={next ? `After ${firstName(next.person)}` : 'Coming up'} link={all ? 'Fewer' : `See all ${data.people.length}`} onLink={() => setAll(a => !a)} />
        <View style={styles.grid}>
          {after.map(p => {
            const at = nextDate(p.date), w = peopleWords[p.id], pic = photoFor(p.id);
            return <PhotoCard key={p.id} source={photos[pic.photo]} focal={pic.focal} height={176} size="sm" chips={[w?.tag ?? (at ? shortDay(at) : 'No date')]} title={p.id === 'efua' ? p.name : firstName(p)} sub={w?.sub ?? p.relation} onPress={() => open(p.id)} style={styles.cell} />;
          })}
        </View>
      </> : null}
      {all ? (
        <RowsCard style={{ marginTop: space.sm }}>
          {data.people.map(p => { const at = nextDate(p.date); return <Row key={p.id} lead={<Face id={p.id} size={40} />} title={p.name} sub={p.id === 'kwame' ? 'Remembered quietly · no reminder' : at ? `${p.relation} · ${shortDay(at)}` : `${p.relation} · no date saved`} onPress={() => open(p.id)} />; })}
        </RowsCard>
      ) : null}
      {quiet ? (
        <Press haptic="open" onPress={() => open(quiet.id)} accessibilityLabel={`${quiet.name}, ${quietPerson.sub}. Say hello`} style={[styles.quiet, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
          <Face id={quiet.id} size={48} />
          <View style={{ flex: 1 }}><Text variant="title">{quiet.name}</Text><Text variant="callout" tone="ink2">{quietPerson.sub}</Text></View>
          <Chip label="Say hello" />
        </Press>
      ) : null}
      <Callout style={{ marginTop: space.sm }}>Gentle “it’s been a while” nudges are opt-in, person by person.</Callout>
    </Page>
  );
}

/* ───────────────────────── A person ───────────────────────── */

export function PersonV26() {
  const t = useTokens(), nav = useNavigation(), { data, set, flag } = useSeed(), insets = useSafeAreaInsets(), drawer = useDrawerPhoto();
  const person = data.people.find(p => p.id === data.choices.person) ?? data.people[0];
  const editing = !!data.flags['person-edit'];
  const [name, setName] = useState(person?.name ?? ''), [note, setNote] = useState(person?.note ?? '');
  if (!person) return (
    <Page screen="person" bar={{ kind: 'push', title: 'Your people' }}>
      <Display s="{No one here yet.} Add the people you want to show up for." flush />
      <Btn label="Add people" onPress={() => nav.go('addperson')} style={{ marginTop: space.lg }} />
    </Page>
  );
  const at = nextDate(person.date), days = at ? daysUntil(at) : null, kind = kindOf(person);
  const pic = photoFor(person.id);
  const done = (i: number) => !!data.flags[`person-${person.id}-${i}`];
  const save = () => { if (editing) set({ people: data.people.map(p => p.id === person.id ? { ...p, name: name.trim() || p.name, note } : p) }); flag('person-edit'); feedback.select(); };
  const when = at ? (days !== null && days < 7 ? weekday(at) : shortDay(at)) : '';
  const hero = kind === 'memorial' ? `{${at ? shortDay(at) : person.date}.} Remembered quietly.`
    : turning[person.id] && at ? `{${when},} turning {${turning[person.id]}.}`
    : at ? `{${when},} ${kind === 'anniversary' ? 'your anniversary.' : `${dateTitle(person).replace(/^Your /, 'your ')}.`}` : `{${firstName(person)}.} No date saved yet.`;
  const relation = person.relation.toLowerCase();
  const kofi = at && days !== null ? kofiCaseFor(at, days) : kofiCase;
  const stepState = (i: number): 'done' | 'now' | 'later' => done(i) ? 'done' : planSteps.findIndex((_, k) => !done(k)) === i ? 'now' : 'later';
  const callRow = (
    <RowsCard style={{ marginTop: space.xl }}>
      {person.id === 'kofi' ? <Row icon="mic" title="Last spoke" sub={kofiCase.lastSpoke} right={<View />} /> : null}
      <Row icon="repeat" title="Remind me to call" sub="Every 2 weeks" right={<SwitchV26 value={!!data.flags[`call-${person.id}`] || (SHOW_SAMPLES && person.id === 'kofi' && data.flags[`call-${person.id}`] === undefined)} onChange={v => flag(`call-${person.id}`, v)} accessibilityLabel="Remind me to call" />} />
    </RowsCard>
  );
  return (
    <Page screen="person" scroll={false} contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
      backdrop={<View pointerEvents="none" style={[StyleSheet.absoluteFill, { bottom: undefined, height: drawer.height ?? 470 }]}><PhotoFill source={photos[pic.photo]} focal={person.id === 'kofi' ? { y: 1 } : pic.focal} settle /><LinearGradient colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} /></View>}
      bar={{ kind: 'photo', left: <OnPhotoRound icon="back" label="Back" solid onPress={nav.close} />, right: <Press haptic="select" onPress={save} accessibilityLabel={editing ? 'Done' : 'Edit'}><PaperChip label={editing ? 'Done' : 'Edit'} /></Press> }}>
      <View style={styles.heroWords}>
        <Text variant="callout" style={{ color: photo.onPhoto }}>{[firstName(person), `your ${relation}`, at ? shortDay(at) : ''].filter(Boolean).join(' · ')}</Text>
        <HugeTwo s={hero} />
      </View>
      <View onLayout={drawer.onLayout} style={[drawerStyle, styles.sheet, { backgroundColor: t.canvas, paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} contentContainerStyle={{ paddingHorizontal: space.gutter, paddingTop: space.lg }} showsVerticalScrollIndicator={false}>
          {editing ? <View style={{ gap: space.xs, marginBottom: space.lg }}>
            <Field label="Name" value={name} onChangeText={setName} />
            <Field label="Notes and gift ideas" value={note} onChangeText={setNote} placeholder="Anything you want to remember" />
          </View> : null}
          {kind === 'memorial' ? <Body s={person.note || 'Remembered quietly · no reminder.'} /> : person.id === 'kofi' ? (
            <Timeline items={[
              { when: kofiCase.idea1.when, text: kofiCase.idea1.text, state: 'done', children: <Chip label={kofiCase.idea1.chip} icon="gift" style={{ marginTop: space.xs }} /> },
              { when: kofiCase.idea2.when, text: kofiCase.idea2.text, state: 'done', children: <View style={{ marginTop: space.xs, gap: space.sm }}>
                <VoiceNote duration="Talk" />
                <Press haptic="open" onPress={() => nav.go('chat')} accessibilityLabel={`${kofiCase.idea2.gift}. ${kofiCase.idea2.giftSub}`} style={[styles.gift, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
                  <View style={{ width: 48, height: 48, borderRadius: radius.md, overflow: 'hidden' }}><PhotoFill source={photos.run} /></View>
                  <View style={{ flex: 1 }}><Text variant="title">{kofiCase.idea2.gift}</Text><Text variant="callout" tone="ink2">{kofiCase.idea2.giftSub}</Text></View>
                  <Icon name="chev" size={16} color={t.inkQuiet} />
                </Press>
              </View> },
              { when: kofi.card.when, text: kofi.card.text, state: stepState(0), children: stepState(0) === 'now' ? (
                <View style={[styles.case, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
                  <Chip label="Birthday plan · step 1 of 3" tone="live" />
                  <Text variant="body" tone="ink2" style={{ marginTop: space.xs }}>{kofi.card.post}</Text>
                  <Btn label="Order a card" icon="arrow" trail onPress={() => { flag(`person-${person.id}-0`, true); feedback.complete(); }} style={{ marginTop: space.md }} />
                </View>
              ) : done(0) ? <QuietLink label="Card ordered · undo" center={false} onPress={() => flag(`person-${person.id}-0`, false)} style={{ marginTop: space.xxs }} /> : undefined },
              { when: kofi.gift.when, text: kofi.gift.text, state: stepState(1), children: stepState(1) === 'now' ? <Btn label="Got the gift" ghost sm fit onPress={() => { flag(`person-${person.id}-1`, true); feedback.complete(); }} style={{ marginTop: space.sm }} /> : undefined },
              { when: kofi.message.when, text: kofi.message.text, state: stepState(2), children: <View style={{ marginTop: space.sm }}>
                <ChatBubble text={kofi.message.draft} style={{ alignSelf: 'flex-end' }} />
                <Text variant="callout" tone="ink2" align="right" style={{ marginTop: space.xs }}>A first draft. Yours to change.</Text>
              </View> },
            ]} />
          ) : (
            <View>
              {at ? <>
                <Micro>{kind === 'anniversary' ? 'ANNIVERSARY PLAN' : 'BIRTHDAY PLAN'}</Micro>
                <Text variant="callout" tone="ink2" style={{ marginTop: 2 }}>{`${weekday(at)} ${shortDay(at)} · ${days === 0 ? 'today' : days === 1 ? 'tomorrow' : `in ${days} days`}`}</Text>
                <View style={{ marginTop: space.xs }}>
                  {planSteps.map((s, i) => (
                    <Press key={s} haptic={done(i) ? 'select' : 'complete'} onPress={() => flag(`person-${person.id}-${i}`)} accessibilityRole="checkbox" accessibilityState={{ checked: done(i) }} accessibilityLabel={s} style={styles.step}>
                      <Tick on={done(i)} /><Text variant="bodyL" tone={done(i) ? 'ink2' : 'ink'}>{s}</Text>
                    </Press>
                  ))}
                </View>
              </> : <Body s="No date saved. Tell Life their birthday and it plans the card, the gift and the message." />}
              {person.note ? <Body s={person.note} style={{ marginTop: space.lg }} /> : null}
            </View>
          )}
          {kind !== 'memorial' ? callRow : null}
        </ScrollView>
      </View>
    </Page>
  );
}

/** A two-tone line at the huge size on a photograph (board `display` at 44/48 on `person`). */
function HugeTwo({ s }: { s: string }) {
  const parts = s.split(/(\{[^}]*\})/).filter(Boolean);
  return (
    <Text variant="huge" style={{ color: photo.onPhoto2, marginTop: 6 }}>
      {parts.map((p, i) => p.startsWith('{') ? <Text key={i} variant="huge" style={{ color: photo.onPhoto }}>{p.slice(1, -1)}</Text> : <Text key={i} variant="huge" style={{ color: photo.onPhoto2 }}>{p}</Text>)}
    </Text>
  );
}

/* ───────────────────────── Add people ───────────────────────── */

export function AddpersonV26() {
  const nav = useNavigation(), { data, set, flag } = useSeed();
  const params = useLocalSearchParams<{ state?: string }>();
  const [typed, setTyped] = useState(params.state === 'type');
  const [picked, setPicked] = useState(['kofi', 'priya', 'efua']);
  const [missing, setMissing] = useState('');
  const [name, setName] = useState(''), [relation, setRelation] = useState(''), [date, setDate] = useState('');
  const noDate = contacts.find(c => picked.includes(c.id) && !c.date);
  const shortOf = (d: string) => { const at = nextDate(d); return at ? shortDay(at) : d; };
  const addContacts = () => {
    const chosen = contacts.filter(c => picked.includes(c.id));
    const merged = [...data.people];
    for (const c of chosen) {
      const d = c.date || (c.id === noDate?.id && nextDate(missing.trim()) ? missing.trim() : '');
      const at = nextDate(d), i = merged.findIndex(p => p.id === c.id);
      const entry: SeedPerson = { id: c.id, name: c.name, relation: c.relation, date: at ? d : '', days: at ? daysUntil(at) : 0, note: '' };
      if (i >= 0) merged[i] = { ...merged[i], date: merged[i].date || entry.date, days: merged[i].date ? merged[i].days : entry.days }; else merged.push(entry);
    }
    set({ people: merged }); feedback.file(); nav.close();
  };
  const addTyped = () => {
    if (!name.trim()) return;
    const at = nextDate(date.trim());
    set({ people: [...data.people, { id: `p-${Date.now()}`, name: name.trim(), relation: relation.trim() || 'Friend', date: at ? date.trim() : '', days: at ? daysUntil(at) : 0, note: at || !date.trim() ? '' : date.trim() }] });
    feedback.file(); nav.close();
  };
  return (
    <Page screen="addperson" bar={{ kind: 'sheet', title: 'Add people' }}
      footer={typed
        ? <><Btn label="Add this person" disabled={!name.trim()} onPress={addTyped} /><Callout center>Gift ideas and notes can come later. Just tell Life.</Callout></>
        : <><Btn label={picked.length ? `Add ${picked.length} ${picked.length === 1 ? 'person' : 'people'}` : 'Tick someone to add'} disabled={!picked.length} onPress={addContacts} /><Callout center>Birthdays already in your contacts come straight across.</Callout></>}>
      <Statement s="Who do you want to {show up for?}" style={{ marginTop: space.xs }} />
      <SegmentedV26 options={[{ value: 'contacts', label: 'From contacts' }, { value: 'type', label: 'Type it in' }]} value={typed ? 'type' : 'contacts'} onChange={v => setTyped(v === 'type')} style={{ marginTop: space.md }} />
      {typed ? <>
        <View style={{ gap: space.sm, marginTop: space.md }}>
          <Field label="Name" value={name} onChangeText={setName} placeholder="Their name" />
          <Field label="Who they are to you" value={relation} onChangeText={setRelation} placeholder="Brother, friend, neighbour" />
          <Field label="A date to keep" value={date} onChangeText={setDate} placeholder="A birthday or anniversary" />
        </View>
        <RowsCard style={{ marginTop: space.sm }}>
          <Row icon="bell" title="Nudge me to stay in touch" sub="Off unless you switch it on" right={<SwitchV26 value={!!data.flags['addperson-nudge']} onChange={v => flag('addperson-nudge', v)} accessibilityLabel="Nudge me to stay in touch" />} />
        </RowsCard>
      </> : <>
        <Callout style={{ marginTop: space.md }}>Life reads only the people you tick, and only their name and dates.</Callout>
        <RowsCard style={{ marginTop: space.sm }}>
          {contacts.map(c => {
            const on = picked.includes(c.id);
            return <Row key={c.id} lead={<InitialsAvatar initials={c.initials} />} title={c.name} sub={c.date ? `Birthday ${shortOf(c.date)}` : 'No birthday saved'} right={<Tick on={on} icon={on ? 'check' : 'add'} />} haptic="select" onPress={() => setPicked(p => on ? p.filter(x => x !== c.id) : [...p, c.id])} />;
          })}
        </RowsCard>
        {noDate ? <Field label={`${noDate.name.split(' ')[0]}’s birthday`} value={missing} onChangeText={setMissing} placeholder="Add it now, or tell Life later" style={{ marginTop: space.sm }} /> : null}
      </>}
    </Page>
  );
}

/* ───────────────────────── A birthday, on Today ───────────────────────── */

/** The nearest birthday within four days of today, unless it's been handled today (board `birthdaynudge`). */
export function useBirthdayNudge(day: string, preview?: boolean): DatedPerson | null {
  const { data } = useSeed();
  if (preview) return datedPeople(data.people).find(d => d.person.id === 'kofi') ?? datedPeople(data.people)[0] ?? null;
  const today = new Date();
  const soon = data.people.flatMap(person => {
    const m = /^(\d{1,2}) ([A-Za-z]+)$/.exec(person.date); if (!m || kindOf(person) !== 'birthday') return [];
    const at = new Date(`${m[1]} ${m[2]} ${today.getFullYear()}`); if (Number.isNaN(at.getTime())) return [];
    if (at < new Date(today.getFullYear(), today.getMonth(), today.getDate())) at.setFullYear(at.getFullYear() + 1);
    const days = Math.round((at.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000);
    return days <= 4 && data.choices[`birthday-nudge-${person.id}`] !== day && !data.flags[`person-${person.id}-0`] ? [{ person, at, days }] : [];
  }).sort((a, b) => a.days - b.days);
  return soon[0] ?? null;
}

/** The birthday as today's line (board `birthdaynudge` display). */
export function birthdayBrief(b: DatedPerson) {
  const when = b.days === 0 ? 'today' : b.days === 1 ? 'tomorrow' : `on ${weekday(b.at)}`, first = firstName(b.person), n = turning[b.person.id];
  return n ? `{@gift ${first} turns ${n}} ${when}. Post ${b.person.id === 'kofi' ? 'his' : 'their'} card {today}.` : `{@gift ${first}’s birthday} is ${when}. Post the card {today}.`;
}

/** Today's move when a birthday is close: the family photograph in front, one step, one tick. */
export function BirthdayMoveV26({ b, day, onDone }: { b: DatedPerson; day: string; onDone?: () => void }) {
  const nav = useNavigation(), { choose, flag } = useSeed();
  const title = turning[b.person.id] ? `${firstName(b.person)} turns ${turning[b.person.id]}` : `${firstName(b.person)}’s birthday`;
  return (
    <View>
      <SectionHead title="Today’s moves" link="1 of 3" style={{ marginTop: space.xl }} />
      <PhotoDeck height={300} backs={[{ source: photos.payslip }]} source={photos.birthday} focal={{ y: 0.8 }}
        chip={<StatusPill size="chip" onPhoto label={`${weekday(b.at)} · ${title}`} />} title={`Order ${b.person.id === 'kofi' ? 'his' : 'the'} card today`} sub={b.days >= 3 ? `Second-class post arrives by ${weekday(new Date(b.at.getTime() - 86400000))}.` : b.days === 2 ? 'First-class post still arrives in time.' : 'Too late for the post. Give it in person.'}
        onPress={() => { choose('person', b.person.id); nav.go('person'); }} />
      <DecideRow style={{ marginTop: space.md }} seps={1}
        left={{ label: 'Gift ideas', text: true, onPress: () => { choose('person', b.person.id); nav.go('person'); } }}
        knob={{ icon: 'check', label: 'Card ordered', onPress: () => { flag(`person-${b.person.id}-0`, true); feedback.complete(); onDone?.(); } }}
        right={{ label: 'Not today', text: true, onPress: () => { choose(`birthday-nudge-${b.person.id}`, day); onDone?.(); } }} />
      <Callout center style={{ marginTop: space.sm }}>Tap the tick when it’s ordered.</Callout>
      <LifeSays style={{ marginTop: space.lg }}>{`On ${weekday(b.at)} morning Life will draft a message for you to send.`}</LifeSays>
    </View>
  );
}

/* ───────────────────────── Important dates ───────────────────────── */

/** One month of days with only the dates you keep filled in (board `.month`): the next one in ember. */
function Month({ year, month, marks, next }: { year: number; month: number; marks: number[]; next?: number }) {
  const t = useTokens();
  const lead = (new Date(Date.UTC(year, month, 1)).getUTCDay() + 6) % 7, count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const weeks = Array.from({ length: Math.ceil((lead + count) / 7) }, (_, r) => Array.from({ length: 7 }, (_, c) => r * 7 + c - lead + 1));
  return (
    <View style={{ marginTop: space.md }} accessible accessibilityRole="image" accessibilityLabel={`${monthName(month)}: ${marks.length ? `dates on the ${marks.join(', ')}` : 'no dates'}`}>
      <View style={styles.monthRow}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <Text key={i} variant="micro" tone="quiet" align="center" style={styles.monthCell}>{d}</Text>)}</View>
      {weeks.map((w, r) => (
        <View key={r} style={[styles.monthRow, { marginTop: 6 }]}>
          {w.map((d, i) => {
            if (d < 1 || d > count) return <View key={i} style={[styles.monthCell, styles.day]} />;
            const on = marks.includes(d), isNext = d === next;
            return (
              <View key={i} style={[styles.monthCell, styles.day, { backgroundColor: isNext ? t.ember : on ? t.ink : t.surface2 }]}>
                {on || isNext ? <Text variant="micro" style={{ color: isNext ? photo.ink : t.canvas, fontVariant: ['tabular-nums'] }}>{String(d)}</Text> : null}
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const dateSubs: Record<string, string> = { kofi: 'Turning 31 · card by Wed', mum: 'Reminder a week before', priya: 'From your contacts', kwame: 'Remembered quietly · no reminder', sam: '5 years', efua: 'Call on the day' };

export function DatesV26() {
  const t = useTokens(), nav = useNavigation(), { data, choose } = useSeed();
  const params = useLocalSearchParams<{ state?: string }>();
  const dated = datedPeople(data.people);
  const window = dated.filter(d => d.days <= 56);
  const months = [0, 1, 2].map(k => { const at = new Date(Date.UTC(snapshot.getUTCFullYear(), snapshot.getUTCMonth() + k, 1)); return { y: at.getUTCFullYear(), m: at.getUTCMonth(), key: monthName(at.getUTCMonth()).slice(0, 3) }; });
  const [tab, setTab] = useState(() => { const i = months.findIndex(x => x.key.toLowerCase() === params.state); return i >= 0 ? months[i].key : months[0].key; });
  const cur = months.find(x => x.key === tab) ?? months[0];
  const inMonth = dated.filter(d => d.at.getUTCFullYear() === cur.y && d.at.getUTCMonth() === cur.m);
  const first = dated.find(d => d.person.id !== 'kwame');
  const nextDay = first && first.at.getUTCMonth() === cur.m && first.at.getUTCFullYear() === cur.y ? first.at.getUTCDate() : undefined;
  const groups = months.map(x => ({ ...x, items: window.filter(d => d.at.getUTCFullYear() === x.y && d.at.getUTCMonth() === x.m) })).filter(g => g.items.length);
  const open = (id: string) => { choose('person', id); nav.go('person'); };
  return (
    <Page screen="dates" bar={{ kind: 'push', title: 'Dates', action: { kind: 'icon', icon: 'add', label: 'Add a date', onPress: () => nav.go('addperson', { state: 'type' }) } }}>
      <Display s={first ? `{${window.length} ${window.length === 1 ? 'date' : 'dates'}} in the next eight weeks. {@gift ${firstName(first.person)}’s} is first, on {${first.days < 7 ? weekday(first.at) : shortDay(first.at)}}.` : '{No dates yet.} Add a birthday or an anniversary and it shows here.'} flush style={{ marginTop: space.xxs }} />
      <View style={[styles.card, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
        <SegmentedV26 options={months.map(x => ({ value: x.key, label: x.key }))} value={cur.key} onChange={setTab} />
        <Month year={cur.y} month={cur.m} marks={inMonth.map(d => d.at.getUTCDate()).filter(d => d !== nextDay)} next={nextDay} />
        <Between style={{ marginTop: space.md }}>
          <View style={styles.legend}>
            {nextDay ? <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: t.ember }]} /><Text variant="callout" tone="ink2">Next</Text></View> : null}
            <View style={styles.legendItem}><View style={[styles.legendDot, { backgroundColor: t.ink }]} /><Text variant="callout" tone="ink2">A date you keep</Text></View>
          </View>
          <Callout>{`${inMonth.length} in ${monthName(cur.m)}`}</Callout>
        </Between>
      </View>
      {groups.map((g, gi) => (
        <View key={g.key}>
          <Micro style={{ marginTop: gi ? space.lg : space.xl }}>{monthName(g.m).toUpperCase()}</Micro>
          <RowsCard style={{ marginTop: space.xs }}>
            {g.items.map(d => <Row key={d.person.id} date={{ day: String(d.at.getUTCDate()).padStart(2, '0'), month: monthName(d.at.getUTCMonth()).slice(0, 3).toUpperCase() }} title={d.person.id === 'kofi' ? 'Kofi’s birthday' : dateTitle(d.person)} sub={dateSubs[d.person.id] ?? d.person.relation} right={<Face id={d.person.id} />} onPress={() => open(d.person.id)} />)}
          </RowsCard>
        </View>
      ))}
      <Callout style={{ marginTop: space.md }}>Each date can have its own reminder, or none.</Callout>
    </Page>
  );
}

const styles = StyleSheet.create({
  actions: { flexDirection: 'row', gap: space.xs },
  back: { position: 'absolute', height: 80, borderTopLeftRadius: 26, borderTopRightRadius: 26, overflow: 'hidden' },
  front: { position: 'absolute', left: 0, right: 0, top: 20, bottom: 0, zIndex: 3, borderRadius: radius.xl },
  frontInner: { flex: 1, borderRadius: radius.xl, overflow: 'hidden', padding: space.md, justifyContent: 'space-between' },
  frontFoot: { flexDirection: 'row', alignItems: 'flex-end', gap: space.sm },
  paperRound: { width: 40, height: 40, borderRadius: 20, backgroundColor: photo.onPhoto, alignItems: 'center', justifyContent: 'center' },
  empty: { marginTop: space.lg, borderRadius: radius.lg, padding: space.cardPad },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.tile },
  cell: { flexBasis: '45%', flexGrow: 1 },
  quiet: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.lg, marginTop: space.sm },
  heroWords: { flex: 1, minHeight: 200, justifyContent: 'flex-end', paddingHorizontal: space.gutter, paddingBottom: 18 },
  sheet: { overflow: 'hidden' },
  gift: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.lg },
  case: { marginTop: space.sm, padding: space.md, borderRadius: radius.lg },
  step: { flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingVertical: 9 },
  card: { marginTop: space.xl, borderRadius: radius.lg, padding: space.cardPad },
  monthRow: { flexDirection: 'row', gap: 6 },
  monthCell: { flex: 1, minWidth: 0 },
  day: { height: 22, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  legend: { flexDirection: 'row', gap: 14, flexShrink: 1, flexWrap: 'wrap' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
});
