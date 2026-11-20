/**
 * Learn from the best, restyled to the V26 board (`learn-teach-grow.js`): the library of ideas as photographs, a
 * lens, an idea in 60 seconds, asking through a lens, quick recall, what learning changed, teaching an idea back,
 * Napoleon Hill's lens, the shelf of what you've learned and the drawing kit. Board-only words and figures live in
 * `state/learn.ts`; money figures come from the engine through the seed.
 */
import React, { useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, TextInput, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { THINKER_ATEAM } from '@life/core/engine';
import {
  ChatBubble, DotGrid, FilterChips, Icon, LifeOrb, LifeSays, PhotoCard, PhotoFill, Press, RoundButton, SectionHead, SegmentedV26, Text,
  TileGrid, V26Tile, cardShadow, feedback, fonts, photo, photoScrims, photos, radius, space, useTokens, type DotCell, type Focal, type GlyphName,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import { seedTaxClaim } from '@/state/seed';
import { SHOW_SAMPLES } from '@/state/sample';
import { aimReadKey } from '@/state/dayCore';
import {
  aimChips, appliedIdeas, barbellCheck, cappedBet, collections, devices, forYou, hillPrinciples, ideaTag, ideas, learning, lensAnswers, lenses,
  recall, recallLadder, recallWhen, results, shelf, talebLens, todaysIdea, type IdeaKey,
} from '@/state/learn';
import { voice } from '@/services/voice';
import { Between, Body, Box, Btn, Callout, Chip, Display, Eyebrow, Figure, Micro, Page, PhotoRound, QuietLink, Row, RowsCard, Shelf, Statement, drawerStyle, two, useDrawerPhoto } from './kit';
import { Composer } from './talk';
import { IdeaPic, Device, PicAim, PicCap, type DeviceName } from './lessonpics';

/* ───────────────────────── Shared pieces ───────────────────────── */

const n = (v: number) => Math.round(v).toLocaleString('en-GB');

/** A thinker's initials on a paper circle (board `.lt-face`). */
export function Face({ initials, size = 56 }: { initials: string; size?: number }) {
  const t = useTokens();
  return (
    <View style={[styles.face, { width: size, height: size, backgroundColor: t.surface }, cardShadow(t.scheme)]}>
      <Text variant="title" tone="ink">{initials}</Text>
    </View>
  );
}

/** The drawn picture's panel: a white card with room above and below and none at the sides (board `.lt-panel`). */
export function Panel({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <Box pad={0} style={[{ paddingTop: space.md, paddingBottom: 14, overflow: 'hidden' }, style]}>{children}</Box>;
}

/** A round on a photograph: see-through, or paper when `solid` or switched on. */
export function OnPhotoRound({ icon, label, solid, on, onPress }: { icon: GlyphName; label: string; solid?: boolean; on?: boolean; onPress?: () => void }) {
  const filled = solid || on;
  return (
    <Press haptic="select" onPress={onPress} accessibilityLabel={label} accessibilityState={on !== undefined ? { selected: on } : undefined} hitSlop={4}
      style={[styles.round, { backgroundColor: filled ? photo.onPhoto : photo.fill }]}>
      <Icon name={icon} size={18} color={filled ? photo.ink : photo.onPhoto} />
    </Press>
  );
}

/** A paper chip on a photograph. */
export function PaperChip({ label, dot, style }: { label: string; dot?: boolean; style?: StyleProp<ViewStyle> }) {
  const t = useTokens();
  return (
    <View style={[styles.paperChip, style]}>
      {dot ? <View style={[styles.sig, { backgroundColor: t.ember }]} /> : null}
      <Text variant="buttonCompact" style={{ color: photo.ink }}>{label}</Text>
    </View>
  );
}

/** A thinker's photograph with a big title: a face and a chip along the top, the name low (board `pcard` with BIG). */
function ThinkerHero({ source, focal, height, top, title, sub }: { source: ImageSourcePropType; focal?: Focal; height: number; top: ReactNode; title: string; sub?: string }) {
  const t = useTokens();
  return (
    <View style={[{ borderRadius: radius.photo }, cardShadow(t.scheme)]}>
      <View style={[styles.hero, { height, backgroundColor: t.surface2 }]}>
        <PhotoFill source={source} focal={focal} />
        <LinearGradient pointerEvents="none" colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} />
        <View style={styles.heroTop}>{top}</View>
        <View>
          <Text variant="display" tone="paper" style={{ fontFamily: fonts.sansSemibold }} numberOfLines={2}>{title}</Text>
          {sub ? <Text variant="callout" tone="paper2">{sub}</Text> : null}
        </View>
      </View>
    </View>
  );
}

/** One answer to pick (board `.lt-opt`): plain, the right one in green with its tick, or quiet once answered. */
export function Option({ label, state, note, card, onPress }: { label: string; state?: 'right' | 'rest'; note?: string; card?: boolean; onPress?: () => void }) {
  const t = useTokens();
  const bg = state === 'right' ? t.gainTint : card ? t.surface : t.surface2;
  return (
    <Press haptic="select" onPress={onPress} accessibilityRole="button" accessibilityState={state ? { selected: state === 'right' } : undefined}
      style={[styles.opt, { backgroundColor: bg }, card && state !== 'right' ? cardShadow(t.scheme) : null]}>
      {state === 'right' ? <View style={[styles.optTick, { backgroundColor: t.gain }]}><Icon name="check" size={14} color={t.canvas} /></View> : null}
      <Text variant="rowTitle" tone={state === 'rest' ? 'quiet' : 'ink'} style={{ flex: 1 }}>{label}</Text>
      {note ? <Text variant="callout" tone="ink2">{note}</Text> : null}
    </Press>
  );
}

/** Speech into a text box: the phone's recogniser where there is one, a note to type where there isn't. */
export function useListen(onText: (said: string) => void) {
  const [listening, setListening] = useState(false), [error, setError] = useState('');
  const toggle = async () => {
    setError('');
    if (listening) { const said = await voice.stop(); if (said) onText(said); setListening(false); return; }
    try {
      setListening(true);
      await voice.start((said, final, failure) => { if (said) onText(said); if (final || failure) setListening(false); if (failure) setError(failure); });
    } catch (e) { setListening(false); setError(e instanceof Error ? e.message : 'The microphone didn’t start. You can type instead.'); }
  };
  return { listening, error, toggle };
}

const useApplied = () => { const { data } = useSeed(); return appliedIdeas(data.flags); };
const appliedCount = (applied: Set<IdeaKey>) => learning.applied + [...applied].filter(k => !(SHOW_SAMPLES && ['remove', 'room', 'automatic', 'invert'].includes(k))).length;

/** Opens an idea in 60 seconds. */
function useOpenIdea() {
  const nav = useNavigation(), { choose } = useSeed();
  return (key: IdeaKey) => { choose('idea', key); nav.go('idea'); };
}

/** The recall ladder: which step the barbell is on, and whether today's recall is done. */
function useRecallState() {
  const { data } = useSeed();
  const step = Math.min(recallLadder.length - 1, Math.max(0, Number(data.choices['recall-barbell-step'] ?? 0) || 0));
  const doneToday = data.choices['recall-barbell-last'] === aimReadKey('recall').replace(/-recall$/, '');
  const due = Math.max(0, learning.recallsDue - (doneToday ? 1 : 0));
  return { step, doneToday, due };
}

/* ───────────────────────── Library ───────────────────────── */

export function LibraryV26() {
  const nav = useNavigation(), t = useTokens(), { data, choose, engine } = useSeed(), openIdea = useOpenIdea(), applied = useApplied(), recalls = useRecallState();
  const [query, setQuery] = useState<string | null>(null);
  const used = (k: IdeaKey) => !!data.flags[`idea-used-${k}`];
  const today = ideas[todaysIdea.key];
  const count = appliedCount(applied);
  const found = query ? Object.values(ideas).filter(i => `${i.title} ${i.by} ${i.topic}`.toLowerCase().includes(query.trim().toLowerCase())) : [];
  const openLens = (id: string) => { if (id === 'hill') { nav.go('hill'); return; } choose('lens', id); nav.go('lens'); };
  return (
    <Page screen="library" bar={{ kind: 'push', action: { kind: 'icon', icon: query === null ? 'search' : 'close', label: query === null ? 'Search ideas' : 'Close search', onPress: () => setQuery(query === null ? '' : null) } }}>
      {query !== null ? (
        <View style={{ marginBottom: space.lg }}>
          <View style={[styles.search, { backgroundColor: t.surface2 }]}>
            <Icon name="search" size={18} color={t.ink2} />
            <TextInput maxFontSizeMultiplier={1.3} value={query} onChangeText={setQuery} autoFocus placeholder="Search ideas and thinkers" placeholderTextColor={t.inkQuiet} selectionColor={t.ember}
              style={[styles.searchInput, { color: t.ink }]} accessibilityLabel="Search ideas" returnKeyType="search" />
          </View>
          {query.trim() ? (found.length ? (
            <RowsCard style={{ marginTop: space.sm }}>
              {found.map(i => <Row key={i.key} thumb={photos[i.photo]} thumbFocal={i.focal} title={i.title} sub={`${i.by} · ${i.topic}`} onPress={() => openIdea(i.key)} />)}
            </RowsCard>
          ) : <Callout style={{ marginTop: space.sm }}>No idea by that name yet. Try a thinker, like Housel or Clear.</Callout>) : null}
        </View>
      ) : null}
      <Eyebrow right={<Chip label={`${count} applied`} />}>Learn from the best</Eyebrow>
      <Display s="Ideas from people who’ve {thought hardest}, in {@clock 60 seconds}." />
      <PhotoCard source={photos[today.photo]} focal={today.focal} height={300} chips={[{ label: 'Today’s idea · 60 sec', dot: t.ember }, today.by.split(' ').pop() ?? today.by]}
        title={today.title} sub={todaysIdea.sub} onPress={() => openIdea(today.key)} style={{ marginTop: space.lg }} />
      <SectionHead title="Lenses" link={`${lenses.length} thinkers`} />
      <Shelf>
        {lenses.map(l => (
          <Press key={l.id} haptic="select" onPress={() => openLens(l.id)} accessibilityLabel={`${l.name}, ${l.area}`} style={styles.lens}>
            <Face initials={l.initials} />
            <Text variant="callout" tone="ink2" numberOfLines={1}>{l.first}</Text>
          </Press>
        ))}
      </Shelf>
      <SectionHead title="For where you are" link={`Level ${engine.level.currentLevel}`} />
      <View style={styles.pair}>
        {forYou.slice(0, 2).map(f => (
          <PhotoCard key={f.key} source={photos[ideas[f.key].photo]} focal={ideas[f.key].focal} height={180} size="sm" style={{ flex: 1 }}
            chips={[used(f.key) ? 'Applied' : SHOW_SAMPLES ? f.tag : 'New · 60 sec']} title={ideas[f.key].title} sub={SHOW_SAMPLES ? f.sub : undefined} onPress={() => openIdea(f.key)} />
        ))}
      </View>
      {forYou.slice(2).map(f => (
        <PhotoCard key={f.key} source={photos[ideas[f.key].photo]} focal={ideas[f.key].focal} height={140} size="sm" style={{ marginTop: space.tile }}
          chips={[used(f.key) ? 'Applied' : f.tag]} title={ideas[f.key].title} onPress={() => openIdea(f.key)} />
      ))}
      <SectionHead title="Your learning" />
      <TileGrid>
        <V26Tile label="Into action" scale={`${learning.thinkers} thinkers`} value={String(count)} unit="applied"
          sub={learning.worthYear ? `Worth about £${n(learning.worthYear)} a year` : count ? 'Worth adding up soon' : 'Nothing applied yet'} onPress={() => nav.go('learning')} />
        <V26Tile label="Learned" scale="this month" value={String(learning.learnedMonth)} unit="ideas"
          sub={recalls.due ? `${recalls.due} recall${recalls.due === 1 ? '' : 's'} due today` : 'No recalls due'} onPress={() => nav.go('learned')} />
      </TileGrid>
      <RowsCard style={{ marginTop: space.sm }}>
        <Row icon="images" title="Pictures that teach" sub="30 devices, clean lines or hand-drawn" onPress={() => nav.go('drawkit')} />
      </RowsCard>
      <SectionHead title="Collections" />
      <View style={styles.grid}>
        {collections.map(c => (
          <PhotoCard key={c.title} source={photos[c.photo]} focal={c.focal} height={124} size="sm" chips={[c.count]} title={c.title}
            onPress={() => openLens(c.lens)} style={styles.gridCell} />
        ))}
      </View>
      <Callout style={{ marginTop: space.lg }}>Ideas are explained in life’s own words, not quoted. Read the originals for the full picture.</Callout>
    </Page>
  );
}

/* ───────────────────────── A lens ───────────────────────── */

export function LensV26() {
  const nav = useNavigation(), { data, flag, choose, engine } = useSeed(), openIdea = useOpenIdea(), applied = useApplied();
  const lens = lenses.find(l => l.id === data.choices.lens) ?? lenses[1];
  const thinker = THINKER_ATEAM.find(x => x.id === lens.id);
  const following = !!data.flags[`follow-${lens.id}`];
  const level = engine.level.currentLevel;
  const own = Object.values(ideas).filter(i => i.lens === lens.id);
  const taleb = lens.id === 'taleb';
  const shelfItems = taleb
    ? talebLens.ideas.map(i => ('key' in i && i.key
      ? { key: i.key, title: ideas[i.key].title, photo: photos[ideas[i.key].photo], focal: ideas[i.key].focal, tag: ideaTag(i.key, applied), locked: false }
      : { key: undefined, title: i.title ?? '', photo: photos[i.photo ?? 'terrace'], focal: undefined, tag: (i.level ?? 0) > level ? i.tag : 'Open now', locked: (i.level ?? 0) > level }))
    : own.map(i => ({ key: i.key, title: i.title, photo: photos[i.photo], focal: i.focal, tag: ideaTag(i.key, applied), locked: false }));
  const started = shelfItems.filter(i => i.tag === 'Applied' || i.tag === 'In progress').length;
  const lead = taleb ? ideas.antifragile : own[0];
  const uses = taleb ? talebLens.uses : own.map(i => ({ icon: 'arrow' as GlyphName, title: i.use.note.replace(/^Opens your |\.$/g, '').replace(/:.*$/, ''), sub: i.title, to: i.use.to, level: undefined as number | undefined }));
  const books = lens.books ?? [];
  const area = lens.area.replace(' and ', ' & ');
  return (
    <Page screen="lens" bar={{ kind: 'push', action: { kind: 'node', node: <Chip label={following ? 'Following' : 'Follow'} icon={following ? 'check' : 'add'} onPress={() => { flag(`follow-${lens.id}`, !following); feedback.select(); }} /> } }}
      footer={<Btn label="Ask through this lens" icon="arrow" trail onPress={() => { choose('lensask-lens', lens.name.split(' ').pop() ?? lens.name); nav.go('lensask'); }} />}>
      <ThinkerHero source={photos[lens.photo]} focal={lens.focal} height={280} title={lens.name} sub={area}
        top={<><Face initials={lens.initials} /><PaperChip label={`Lens · ${started} of ${shelfItems.length || 1} ideas`} /></>} />
      {lead ? <Statement s={lead.sentence} style={{ marginTop: space.xl }} /> : <Statement s={thinker?.coreIdea ?? lens.area} style={{ marginTop: space.xl }} />}
      {lead ? <Panel style={{ marginTop: space.lg }}><IdeaPic name={lead.picture === 'stress' || lead.picture === 'barbell' ? lead.picture : (lead.picture as DeviceName)} hand={!!data.prefs.handDrawn} /></Panel> : null}
      {shelfItems.length ? <>
        <SectionHead title="Ideas" link={taleb ? `${started} of ${shelfItems.length} · more unlock as you grow` : `${shelfItems.length} so far`} />
        <Shelf>
          {shelfItems.map(i => (
            <PhotoCard key={i.title} source={i.photo} focal={i.focal} height={200} size="sm" chips={[i.tag]} title={i.title}
              onPress={i.key ? () => openIdea(i.key as IdeaKey) : undefined} style={{ width: 150, opacity: i.locked ? 0.45 : 1 }} accessibilityLabel={i.locked ? `${i.title}, opens at ${i.tag}` : i.title} />
          ))}
        </Shelf>
      </> : null}
      {uses.length ? <>
        <Text variant="title" style={{ marginTop: space.xl }}>Where life uses this lens</Text>
        <RowsCard style={{ marginTop: space.sm }}>
          {uses.map(u => {
            const locked = (u.level ?? 0) > level;
            return <Row key={u.title} icon={u.icon} title={u.title} sub={u.sub} right={locked ? <Chip label={`L${u.level}`} tone="q" /> : undefined} onPress={locked ? undefined : () => nav.go(u.to)} />;
          })}
        </RowsCard>
      </> : null}
      {books.length ? <>
        <SectionHead title="Read the originals" />
        <RowsCard>{books.map((b, k) => <Row key={b} icon="book" title={b} sub={k === 0 && books.length > 1 ? 'Book · the core of this lens' : 'Book'} />)}</RowsCard>
      </> : null}
      <Callout style={{ marginTop: space.md }}>Ideas are explained in life’s own words, not quoted. Read the originals for the full picture.</Callout>
    </Page>
  );
}

/* ───────────────────────── An idea, in 60 seconds ───────────────────────── */

export function IdeaV26() {
  const nav = useNavigation(), t = useTokens(), { data, flag } = useSeed(), insets = useSafeAreaInsets(), drawer = useDrawerPhoto();
  const idea = ideas[(data.choices.idea as IdeaKey) ?? 'barbell'] ?? ideas.barbell;
  const saved = !!data.flags[`idea-saved-${idea.key}`];
  const use = () => { flag(`idea-used-${idea.key}`, true); feedback.complete(); nav.go(idea.use.to); };
  return (
    <Page screen="idea" scroll={false} contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
      backdrop={<View pointerEvents="none" style={[StyleSheet.absoluteFill, { bottom: undefined, height: drawer.height ?? 330 }]}><PhotoFill source={photos[idea.photo]} focal={{ y: Math.min(0.7, (idea.focal.y ?? 0.5) + 0.1) }} /><LinearGradient colors={photoScrims.fade.colors} locations={photoScrims.fade.locations} style={StyleSheet.absoluteFill} /></View>}
      bar={{ kind: 'photo', left: <PaperChip label={`${idea.by} · ${idea.topic}`} />,
        right: <View style={{ flexDirection: 'row', gap: space.xs }}>
          <OnPhotoRound icon="book" label={saved ? 'Saved for later' : 'Save for later'} on={saved} onPress={() => { flag(`idea-saved-${idea.key}`, !saved); if (!saved) feedback.file(); }} />
          <PhotoRound icon="close" label="Close" onPress={nav.close} />
        </View> }}>
      <View style={styles.ideaTop}>
        <Text variant="callout" style={{ color: photo.onPhoto2 }}>An idea, in 60 seconds</Text>
        <Text variant="welcome" style={{ color: photo.onPhoto, marginTop: 6 }} numberOfLines={2}>{idea.title}</Text>
      </View>
      <View onLayout={drawer.onLayout} style={[drawerStyle, styles.drawer, { backgroundColor: t.surface, paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <ScrollView style={{ flexGrow: 0, flexShrink: 1 }} showsVerticalScrollIndicator={false}>
          <Micro>THE IDEA</Micro>
          <Statement s={idea.sentence} style={{ marginTop: space.xs }} />
          <View style={{ marginTop: space.lg }}><IdeaPic name={idea.picture === 'stress' || idea.picture === 'barbell' || idea.picture === 'aim' ? idea.picture : (idea.picture as DeviceName)} hand={!!data.prefs.handDrawn} /></View>
          <Btn label={idea.use.label} icon="arrow" trail onPress={use} style={{ marginTop: space.lg }} />
          <Callout center style={{ marginTop: space.sm }}>{idea.use.note}</Callout>
          {idea.key === 'barbell' ? <QuietLink label="Explain it in your own words" onPress={() => nav.go('teach')} style={{ marginTop: space.xs }} /> : null}
        </ScrollView>
      </View>
    </Page>
  );
}

/* ───────────────────────── Ask through a lens ───────────────────────── */

type LensName = 'Taleb' | 'Housel' | 'Munger';

export function LensaskV26() {
  const nav = useNavigation(), { data, choose, flag } = useSeed();
  const params = useLocalSearchParams<{ question?: string }>();
  const refund = seedTaxClaim.refund;
  const question = (typeof params.question === 'string' && params.question.trim()) || `Should I put my £${n(refund)} rebate into crypto?`;
  const picked = data.choices['lensask-lens'];
  const [lens, setLens] = useState<LensName>(picked === 'Housel' || picked === 'Munger' ? picked : 'Taleb');
  const [text, setText] = useState('');
  const key = `lens-decision-${lens.toLowerCase()}`;
  const saved = !!data.flags[key];
  const save = () => {
    if (saved) return;
    let list: { question: string; lens: string; at: string }[] = [];
    try { list = JSON.parse(data.choices['money-decisions'] ?? '[]'); } catch { list = []; }
    choose('money-decisions', JSON.stringify([...list, { question, lens, at: new Date().toISOString() }]));
    flag(key, true); feedback.file();
  };
  return (
    <Page screen="lensask" bar={{ kind: 'push', title: 'Ask through a lens', close: true }}
      bottom={<View style={{ paddingHorizontal: space.gutter, paddingBottom: space.md }}>
        <Composer value={text} onChange={setText} placeholder="Ask anything else" onSend={() => { if (text.trim()) nav.go('chat', { question: text.trim() }); }} onMic={() => nav.go('talk')} />
      </View>}>
      <View style={{ alignItems: 'flex-end' }}><ChatBubble text={question} /></View>
      <Micro style={{ marginTop: space.xl }}>SEE IT THROUGH</Micro>
      <FilterChips options={(['Taleb', 'Housel', 'Munger'] as LensName[]).map(v => ({ value: v, label: v }))} value={lens} onChange={v => { setLens(v); choose('lensask-lens', v); }} style={{ marginTop: space.xs }} />
      <View style={[styles.inline, { marginTop: space.xl }]}><LifeOrb size={18} /><Text variant="callout" tone="ink2">{`life, through ${lens}’s lens`}</Text></View>
      <Statement s={lensAnswers(refund)[lens]} style={{ marginTop: space.xs }} />
      <Box style={{ marginTop: space.lg }}><PicCap total={refund} bet={cappedBet(refund)} /></Box>
      <Box pad={space.md} style={{ marginTop: space.sm }}>
        <Between>
          <Body s={saved ? 'Saved to {Money} as a decision.' : 'Save this to {Money} as a decision?'} style={{ flex: 1 }} />
          <Btn label={saved ? 'Saved' : 'Save'} icon={saved ? 'check' : undefined} ghost sm fit onPress={save} disabled={saved} />
        </Between>
      </Box>
      <Callout style={{ marginTop: space.md }}>General guidance using your numbers, not regulated financial advice. life speaks in its own voice, never as the thinker.</Callout>
    </Page>
  );
}

/* ───────────────────────── Quick recall ───────────────────────── */

export function RecallV26() {
  const nav = useNavigation(), t = useTokens(), { choose } = useSeed(), params = useLocalSearchParams<{ state?: string }>(), state = useRecallState();
  const idea = ideas[recall.idea];
  const [guess, setGuess] = useState<string | null>(recall.options.some(o => o.key === params.state) ? (params.state as string) : null);
  const [from] = useState(state.step);
  const done = guess !== null, right = guess === recall.answer;
  const next = done ? (right ? Math.min(recallLadder.length - 1, from + 1) : 0) : from;
  const pick = (k: string) => {
    if (done) return;
    setGuess(k);
    const ok = k === recall.answer, step = ok ? Math.min(recallLadder.length - 1, from + 1) : 0;
    choose('recall-barbell-step', String(step)); choose('recall-barbell-last', aimReadKey('recall').replace(/-recall$/, ''));
    if (ok) feedback.complete(); else feedback.select();
  };
  return (
    <Page screen="recall" bar={{ kind: 'sheet' }} footer={done ? <Btn label="Done" onPress={nav.close} /> : undefined}>
      <PhotoCard source={photos[idea.photo]} focal={{ y: 0.5 }} height={108} size="sm" chips={[{ label: 'Recall · 20 seconds', dot: t.ember }]} title={idea.title}
        topRight={<OnPhotoRound icon="close" label="Close" onPress={nav.close} />} />
      <Statement s={recall.question} style={{ marginTop: space.md }} />
      <View style={{ gap: space.xs, marginTop: space.md }}>
        {recall.options.map(o => (
          <Option key={o.key} label={o.label} onPress={() => pick(o.key)}
            state={!done ? undefined : o.key === recall.answer ? 'right' : 'rest'} note={done && o.key === guess && !right ? 'Your guess' : undefined} />
        ))}
      </View>
      <View style={{ marginTop: space.sm }}>
        {done ? <LifeSays>{right ? recall.right : recall.wrong}</LifeSays> : <Callout>life’s forgotten this one. Can you remind it?</Callout>}
      </View>
      <Between style={{ marginTop: space.md }}>
        <Text variant="callout" tone="ink2">Next recall</Text>
        <Text variant="callout" tone="ink">{done ? (right ? recallWhen[next] : 'tomorrow, nothing lost') : 'the gap grows when you get it right'}</Text>
      </Between>
      <View style={[styles.ladder, { marginTop: space.xs }]} accessibilityLabel={`Recall ladder, step ${next + 1} of ${recallLadder.length}`}>
        {recallLadder.map((d, k) => (
          <View key={d} style={[styles.rung, { backgroundColor: k === next ? t.ink : t.surface2 }]}>
            <Text variant="micro" style={{ color: k === next ? t.canvas : t.inkQuiet, fontVariant: ['tabular-nums'] }}>{d}</Text>
          </View>
        ))}
      </View>
    </Page>
  );
}

/* ───────────────────────── Ideas into action ───────────────────────── */

export function LearningV26() {
  const nav = useNavigation(), openIdea = useOpenIdea(), applied = useApplied();
  const count = appliedCount(applied);
  const nextIdea = (Object.keys(ideas) as IdeaKey[]).find(k => !applied.has(k) && k !== 'barbell') ?? 'barbell';
  const lived = new Set(learning.streakDays);
  const cells: DotCell[] = Array.from({ length: 30 }, (_, k) => (k === 29 ? 'now' : lived.has(k) ? 'on' : ''));
  if (!count) return (
    <Page screen="learning" bar={{ kind: 'push', title: 'Your learning' }} footer={<Btn label="Find your first idea" onPress={() => openIdea(todaysIdea.key)} />}>
      <Eyebrow>Ideas into action</Eyebrow>
      <Display s="Nothing applied yet. {Your first idea} takes 60 seconds." />
      <Callout style={{ marginTop: space.md }}>Learning is measured by what it changes, not by pages read. Each idea you use shows here with its result.</Callout>
    </Page>
  );
  return (
    <Page screen="learning" bar={{ kind: 'push', title: 'Your learning' }} footer={<Btn label="Find your next idea" onPress={() => openIdea(nextIdea)} />}>
      <Eyebrow>{learning.worthYear ? 'Ideas into action · worth about' : 'Ideas into action'}</Eyebrow>
      {learning.worthYear ? <Figure value={`£${n(learning.worthYear)}`} unit="a year" style={{ marginTop: space.xs }} /> : null}
      <Statement s={`You’ve applied {${count} idea${count === 1 ? '' : 's'}}${learning.thinkers ? ` from {${learning.thinkers} thinkers}` : ''}.`} style={{ marginTop: space.sm }} />
      <Box style={{ marginTop: space.xl }}>
        <Between><Text variant="title">Learning streak</Text><Text variant="callout" tone="ink2">{`${lived.size} of 30 days`}</Text></Between>
        <DotGrid cells={cells} columns={10} label={`Learned something on ${lived.size} of the last 30 days`} style={{ marginTop: space.md }} />
        <Callout style={{ marginTop: space.md }}>Measured by what it changed, not by pages read.</Callout>
      </Box>
      {SHOW_SAMPLES ? <>
        <SectionHead title="Idea → result" link={`All ${count}`} onLink={() => nav.go('learned')} />
        <RowsCard>
          {results.map(r => <Row key={r.title} thumb={photos[r.photo]} thumbFocal={r.focal} title={r.title} sub={r.sub} end={r.worth} endStrong onPress={() => nav.go(r.to)} />)}
        </RowsCard>
      </> : null}
    </Page>
  );
}

/* ───────────────────────── Teach it back (the barbell) ───────────────────────── */

/** Which parts of the barbell an explanation covers, and the one to add. */
export function checkBarbell(text: string) {
  const parts = barbellCheck.parts.map(p => ({ label: p.label, ok: p.words.test(text) }));
  const gapSaid = barbellCheck.gap.words.test(text);
  const missing = parts.find(p => !p.ok);
  const add = missing ? { label: missing.label, why: `You didn’t say this part yet. It’s what makes the barbell work.` } : gapSaid ? null : { label: barbellCheck.gap.label, why: barbellCheck.gap.why };
  return { parts, add, covered: parts.filter(p => p.ok).length };
}

/** The explanation with the words that landed in ink and the rest quieter (board `.lt-marked`). */
function Marked({ text }: { text: string }) {
  const any = new RegExp([...barbellCheck.parts.map(p => p.words), barbellCheck.gap.words].map(w => `(?:${w.source})`).join('|'), 'gi');
  const bits: { s: string; on: boolean }[] = [];
  let at = 0;
  for (const m of text.matchAll(any)) {
    if (m.index === undefined || !m[0]) continue;
    if (m.index > at) bits.push({ s: text.slice(at, m.index), on: false });
    bits.push({ s: m[0], on: true }); at = m.index + m[0].length;
  }
  if (at < text.length) bits.push({ s: text.slice(at), on: false });
  return <Text style={styles.paperText} tone="ink2">{bits.map((b, k) => <Text key={k} style={styles.paperText} tone={b.on ? 'ink' : 'ink2'}>{b.s}</Text>)}</Text>;
}

export function TeachV26() {
  const nav = useNavigation(), t = useTokens(), { data, draft, choose } = useSeed(), params = useLocalSearchParams<{ state?: string }>();
  const idea = ideas.barbell;
  const [text, setText] = useState(data.drafts['barbell-explanation'] ?? (SHOW_SAMPLES ? barbellCheck.sample : ''));
  const [checked, setChecked] = useState(params.state === 'checked' && !!text.trim());
  const listen = useListen(said => { setText(said); draft('barbell-explanation', said); setChecked(false); });
  const result = checkBarbell(text);
  const check = () => {
    if (!text.trim()) return;
    draft('barbell-explanation', text); setChecked(true);
    choose('recall-barbell-step', '0'); choose('recall-barbell-last', '');
    if (!result.add) feedback.complete(); else feedback.select();
  };
  const headline = !checked ? '{Teach it back.} Explain the barbell to a friend in two or three sentences.'
    : !result.add ? '{All of it.} That’s the whole idea.'
    : result.covered === 3 ? '{Nearly all of it.} One part to add.'
    : result.covered >= 1 ? '{Some of it.} One part to add first.'
    : '{A start.} One part to add first.';
  return (
    <Page screen="teach" bar={{ kind: 'push', close: true, action: { kind: 'node', node: <Text variant="callout" tone="ink2">Step 4 of 4</Text> } }}
      footer={checked
        ? <><Btn label="Re-read that part" onPress={() => { choose('idea', 'barbell'); nav.go('idea'); }} /><QuietLink label="Explain it again" onPress={() => { setText(''); draft('barbell-explanation', ''); setChecked(false); }} /></>
        : <View style={styles.pager}>
            <RoundButton icon={listen.listening ? 'stop' : 'mic'} label={listen.listening ? 'Stop listening' : 'Talk instead'} size="lg" solid={listen.listening} onPress={listen.toggle} />
            <Btn label="Check my explanation" onPress={check} disabled={!text.trim()} style={{ flex: 1 }} />
          </View>}>
      <View style={styles.inline}>
        <View style={[styles.thumb, { backgroundColor: t.surface2 }]}><PhotoFill source={photos[idea.photo]} focal={{ y: 0.45 }} /></View>
        <View><Text variant="title">{idea.title}</Text><Text variant="callout" tone="ink2">{`${idea.by} · ${idea.topic}`}</Text></View>
      </View>
      <Display s={headline} style={{ marginTop: space.md }} />
      <Press haptic={null} onPress={checked ? () => setChecked(false) : undefined} accessibilityLabel={checked ? 'Edit your explanation' : undefined}
        style={[styles.paper, { backgroundColor: t.surface, marginTop: space.xl }, cardShadow(t.scheme)]}>
        {checked ? <Marked text={text} /> : (
          <TextInput maxFontSizeMultiplier={1.3} value={text} onChangeText={v => { setText(v); draft('barbell-explanation', v); }} multiline placeholder="In your own words…" placeholderTextColor={t.inkQuiet}
            selectionColor={t.ember} style={[styles.paperText, { color: t.ink, minHeight: 112 }]} accessibilityLabel="Your explanation" />
        )}
      </Press>
      {checked ? <>
        <View style={[styles.tags, { marginTop: space.md }]}>
          {result.parts.map(p => <Chip key={p.label} label={p.label} icon={p.ok ? 'check' : undefined} tone={p.ok ? 'done' : 'q'} />)}
        </View>
        {result.add ? (
          <Box pad={space.md} style={{ marginTop: space.md }}>
            <View style={{ flexDirection: 'row' }}><Chip label="One part to add" tone="live" /></View>
            <Body s={`{${result.add.label}}. ${result.add.why}`} style={{ marginTop: space.xs }} />
          </Box>
        ) : null}
        <LifeSays style={{ marginTop: space.md }}>The barbell is booked in for a quick recall tomorrow.</LifeSays>
      </> : <Callout style={{ marginTop: space.sm }}>{listen.error || (listen.listening ? 'Listening. Tap the microphone again when you’re done.' : 'Talk or type. Your own words are the point.')}</Callout>}
    </Page>
  );
}

/* ───────────────────────── Napoleon Hill ───────────────────────── */

export function HillV26() {
  const nav = useNavigation(), t = useTokens(), { data } = useSeed();
  const mine = aimChips(data.aim);
  const read = !!data.aim && data.aim.readLog.includes(aimReadKey('morning')) && data.aim.readLog.includes(aimReadKey('night'));
  const rows = hillPrinciples.map((p, k) => ({ ...p, mine: [mine.what, mine.when, mine.give, ''][k], on: k < 3 ? !![mine.what, mine.when, mine.give][k] : read }));
  const inAim = rows.filter(r => r.on).length;
  const openAim = () => nav.go(data.aim?.what ? 'aim' : 'aimnew');
  return (
    <Page screen="hill" bar={{ kind: 'push' }} footer={<Btn label={data.aim?.what ? 'Read your Aim' : 'Write your Aim'} icon="arrow" trail onPress={openAim} />}>
      <ThinkerHero source={photos.aimwrite} focal={{ y: 0.58 }} height={250} title="Definiteness of purpose"
        top={<><PaperChip label="Lens · Napoleon Hill" /><Face initials="NH" /></>} />
      <Statement s="Most people drift because they {never decide}. Pick one aim, give it a {date} and a {price}, and look at it {every day}, so your choices start pointing the same way." style={{ marginTop: space.xl }} />
      <Panel style={{ marginTop: space.lg }}><PicAim hand={!!data.prefs.handDrawn} /></Panel>
      <SectionHead title="Four principles" link={`${inAim} of 4 in your Aim`} />
      <Box pad={space.md} style={{ paddingVertical: space.xs }}>
        {rows.map(r => (
          <Press key={r.title} haptic="select" onPress={openAim} accessibilityRole="button" accessibilityState={{ checked: r.on }} style={styles.check}>
            <View style={[styles.tick, { backgroundColor: r.on ? t.ink : t.surface3 }]}>{r.on ? <Icon name="check" size={14} color={t.canvas} /> : null}</View>
            <View style={{ flex: 1 }}>
              <Text variant="rowTitle">{r.title}</Text>
              <Text variant="callout" tone="ink2">{r.sub}</Text>
            </View>
            {r.mine ? <Chip label={r.mine} tone="q" style={{ marginTop: 2, maxWidth: 140 }} /> : null}
          </Press>
        ))}
      </Box>
      <Callout style={{ marginTop: space.md }}>From the ideas in Think and Grow Rich (1937), explained in life’s words. Related lenses: Clear, Munger.</Callout>
    </Page>
  );
}

/* ───────────────────────── What you've learned ───────────────────────── */

export function LearnedV26() {
  const nav = useNavigation(), t = useTokens(), { choose } = useSeed(), recalls = useRecallState();
  const due = recalls.due;
  const items = SHOW_SAMPLES ? shelf.map(s => (s.due && recalls.doneToday && s.title === 'Sleep debt' ? { ...s, tag: 'Recalled today', due: false } : s)) : [];
  if (!items.length) return (
    <Page screen="learned" bar={{ kind: 'push' }} footer={<Btn label="Find an idea" onPress={() => nav.go('library')} />}>
      <Eyebrow>What you’ve learned</Eyebrow>
      <Display s="Your shelf is {empty for now}. Each lesson and idea lands here." />
      <Callout style={{ marginTop: space.md }}>Each card will say where it came up and what it led you to do. Learning that changes nothing doesn’t count.</Callout>
    </Page>
  );
  return (
    <Page screen="learned" bar={{ kind: 'push' }} footer={due ? <Btn label={`Do today’s ${due} recall${due === 1 ? '' : 's'} · 1 min`} onPress={() => nav.go('recall')} /> : <Btn label="Find your next idea" onPress={() => nav.go('library')} />}>
      <Eyebrow>What you’ve learned</Eyebrow>
      <Display s={`{${learning.learnedMonth} ideas} this month. ${due ? `{${due} recall${due === 1 ? '' : 's'}} due today.` : 'No recalls due today.'}`} />
      <Micro sig style={{ marginTop: space.xl }}>DUE TODAY FIRST, THEN THE REST OF YOUR SHELF</Micro>
      <Shelf style={{ marginTop: space.sm }}>
        {items.map(s => (
          <PhotoCard key={s.title} source={photos[s.photo]} focal={s.focal} height={252} size="md" chips={[s.due ? { label: s.tag, dot: t.ember } : s.tag]} title={s.title} sub={s.from}
            onPress={() => { if (s.to === 'idea') choose('idea', 'barbell'); nav.go(s.to); }} style={{ width: 196 }} />
        ))}
      </Shelf>
      {due ? <Box pad={space.md} style={{ marginTop: space.md }}><LifeSays>{`I’ve forgotten ${due === 1 ? 'one' : 'two'} of these. Can you remind me? It takes a minute.`}</LifeSays></Box> : null}
      <Callout style={{ marginTop: space.md }}>Each card says where it came up and what it led you to do. Learning that changes nothing doesn’t count.</Callout>
    </Page>
  );
}

/* ───────────────────────── Pictures that teach ───────────────────────── */

export function DrawkitV26() {
  const t = useTokens(), { data, pref } = useSeed();
  const hand = !!data.prefs.handDrawn;
  return (
    <Page screen="drawkit" bar={{ kind: 'push' }}>
      <Eyebrow>Pictures that teach · 30 devices</Eyebrow>
      <Display s="{One idea} per picture. {One thing} lit." />
      <Body s="One line weight, round ends. {Ember is the thing that changes.} Lines draw themselves on, then rest." style={{ marginTop: space.sm }} />
      <SegmentedV26 options={[{ value: 'clean', label: 'Clean lines' }, { value: 'hand', label: 'Hand-drawn' }]} value={hand ? 'hand' : 'clean'}
        onChange={v => pref('handDrawn', v === 'hand')} style={{ marginTop: space.lg }} />
      <View style={[styles.grid, { marginTop: space.sm }]}>
        {devices.map(d => (
          <View key={d.key} style={[styles.dev, styles.gridCell, { backgroundColor: t.surface }, cardShadow(t.scheme)]}>
            <Device name={d.key as DeviceName} hand={hand} />
            <Text variant="rowTitle" style={{ marginTop: space.tile }}>{d.title}</Text>
            <Text variant="callout" tone="ink2" style={{ marginTop: 2 }}>{d.sub}</Text>
          </View>
        ))}
      </View>
      <Callout style={{ marginTop: space.md }}>Also in the kit: graph, balance, stairs, spectrum, pair, tree, test, threshold, units, crowd, grid, wave, mirror, stack, radial, cutaway, sankey, fan, spiral, zoom, brace and map.</Callout>
      <Callout style={{ marginTop: space.xs }}>For the bigger lessons. The quick Teach me keeps its simple pictures.</Callout>
    </Page>
  );
}

const styles = StyleSheet.create({
  face: { borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  round: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  paperChip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 28, paddingHorizontal: space.sm, borderRadius: radius.full, backgroundColor: photo.onPhoto, alignSelf: 'flex-start' },
  sig: { width: 6, height: 6, borderRadius: 3 },
  hero: { borderRadius: radius.photo, overflow: 'hidden', paddingTop: 14, paddingHorizontal: space.md, paddingBottom: space.md, justifyContent: 'space-between' },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  opt: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 54, paddingVertical: 10, paddingHorizontal: space.md, borderRadius: 16 },
  optTick: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.xs, height: 48, borderRadius: radius.full, paddingHorizontal: space.md },
  searchInput: { flex: 1, fontFamily: fonts.sans, fontSize: 15, paddingVertical: 0 },
  lens: { width: 60, alignItems: 'center', gap: space.xs },
  pair: { flexDirection: 'row', gap: space.tile },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.tile },
  gridCell: { width: '48.5%', flexGrow: 1, flexBasis: '45%' },
  ideaTop: { flex: 1, minHeight: 190, justifyContent: 'flex-end', paddingHorizontal: space.gutter, paddingBottom: space.lg },
  drawer: { paddingHorizontal: space.gutter, paddingTop: 22 },
  inline: { flexDirection: 'row', alignItems: 'center', gap: space.tile },
  ladder: { flexDirection: 'row', gap: 6 },
  rung: { flex: 1, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  thumb: { width: 40, height: 40, borderRadius: 20, overflow: 'hidden' },
  paper: { borderRadius: radius.lg, padding: space.lg },
  paperText: { fontFamily: fonts.sansMedium, fontSize: 20, lineHeight: 28, letterSpacing: -0.4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: space.xs },
  pager: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  check: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, paddingVertical: space.sm },
  tick: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  dev: { borderRadius: radius.lg, paddingTop: 14, paddingHorizontal: 14, paddingBottom: space.md },
});
