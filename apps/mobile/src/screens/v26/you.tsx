/**
 * You, restyled to the V26 board (`core.js` you, `today-plan-you.js`): your level as a big figure, your areas, who
 * you're becoming and your streak; then your household and children as a count of people, mood over time as the
 * photographs of how you arrived, what life knows and remembers, your levels as a climb, one experiment, shared life
 * and your details. Board-only words live in `state/you.ts`; levels come from the engine.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Alert, ScrollView, Share, StyleSheet, TextInput, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import {
  AccordionGroup, BecomingScale, CheckRows, CompactStepper, DotGrid, DotStrip, FEEL_MOODS, FilterChips, FaceAvatar, Field, Icon, InitialsAvatar, LifeSays, PhotoCard,
  PhotoFill, Press, Ruler, SectionHead, SegmentedV26, Text, TileGrid, TintCard, V26Tile, areaColors, cardShadow, componentSize, feedback, fonts, motion,
  photo, photoScrims, photos, radius, space, useAreaTint, useCalmMotion, useTokens, type DotCell, type FeelMoodId, durations
} from '@/design';
import type { Area } from '@/design/tokens';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import { chooseProfilePhoto, removeProfilePhoto, useProfilePhoto } from '@/services/profilePhoto';
import { editMemory, liveMemory, purgeForgotten } from '@/services/memory';
import { knowledgeLabels, money } from '@/state/seed';
import { SHOW_SAMPLES } from '@/state/sample';
import {
  becoming, bornOn, childrenLine, details, ordinalDay, workWords, experiment, factPhoto, gateTo, gateWords, householdLine, knowsArea, knowsFilters, levelPlan, memoryFilters, memoryPhoto,
  moodGrid, moodPatterns, moodSummary, nextExperiments, season, shared, streak, usedToday, workTitle, youAreas, youRows, type KnowsFilter,
} from '@/state/you';
import { Between, Body, Box, Btn, Callout, Chip, Display, Eyebrow, Figure, Micro, Page, QuietLink, Row, RowsCard, Shelf, Statement, MoreRows, useLongList } from './kit';
import { useWidth } from './bodykit';
import { SoftChip } from './fuel';

/* ───────────────────────── Shared pieces ───────────────────────── */

const n = (v: number) => Math.round(v).toLocaleString('en-GB');

/** A bold link in ink with its chevron (board `.link.ink`). */
export function LinkChev({ label, onPress, style }: { label: string; onPress?: () => void; style?: object }) {
  const t = useTokens();
  return (
    <Press haptic="select" onPress={onPress} accessibilityLabel={label} hitSlop={8} style={[styles.link, style]}>
      <Text variant="buttonCompact">{label}</Text>
      <Icon name="chev" size={componentSize.iconXs} color={t.ink} />
    </Press>
  );
}

/** A small photograph tile with its name low on it (board `.ptile` in a row of three). */
function AreaTile({ title, source, onPress }: { title: string; source: number; onPress: () => void }) {
  const t = useTokens();
  return (
    <Press haptic="open" onPress={onPress} accessibilityLabel={title} style={[styles.ptile, { backgroundColor: t.surface2, ...cardShadow(t.scheme) }]}>
      <PhotoFill source={source} />
      <LinearGradient pointerEvents="none" colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} />
      <Text variant="buttonCompact" style={{ color: photo.onPhoto, paddingHorizontal: space.sm, paddingVertical: space.tile }}>{title}</Text>
    </Press>
  );
}

/** A round photograph (a mood, a face). */
export function RoundPhoto({ source, focal, size }: { source: number; focal?: { x?: number; y?: number; zoom?: number }; size: number }) {
  const t = useTokens();
  return <View style={{ width: size, height: size, borderRadius: size / 2, overflow: 'hidden', backgroundColor: t.surface2 }}><PhotoFill source={source} focal={focal} /></View>;
}

/** One person in the crowd: steps in from the right when added (board `.tp-in`), a fade with Reduce Motion. */
function Person({ size, enter, quiet }: { size: number; enter: boolean; quiet?: boolean }) {
  const t = useTokens(), calm = useCalmMotion();
  const x = useSharedValue(enter && !calm ? 12 : 0), s = useSharedValue(enter && !calm ? 0.92 : 1), o = useSharedValue(enter ? 0 : 1);
  useEffect(() => {
    if (!enter) return;
    o.value = withTiming(1, { duration: calm ? durations.quick : durations.item });
    if (!calm) { x.value = withSpring(0, motion.smooth); s.value = withSpring(1, motion.smooth); }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const anim = useAnimatedStyle(() => ({ opacity: o.value, transform: [{ translateX: x.value }, { scale: s.value }] }));
  return <Animated.View style={anim}><Icon name="person" size={size} strokeWidth={1.4} color={quiet ? t.surface3 : t.ink} /></Animated.View>;
}

/** The people who live with you, one icon each (board `.tp-crowd`). Shows six, then a count. */
function Crowd({ count, size, empty }: { count: number; size: number; empty?: boolean }) {
  const first = useRef(count).current;
  const shown = Math.min(count, 6);
  return (
    <View style={[styles.crowd, { height: size + 14 }]} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {count === 0 && empty ? <Person size={size} enter={false} quiet /> : Array.from({ length: shown }, (_, k) => <Person key={k} size={size} enter={k >= first} />)}
      {count > 6 ? <Text variant="headline" tone="ink2" style={{ marginLeft: space.xs, marginBottom: 8 }}>{`+${count - 6}`}</Text> : null}
    </View>
  );
}

/* ───────────────────────── You ───────────────────────── */

export function YouV26() {
  const t = useTokens(), nav = useNavigation(), { data, engine } = useSeed();
  const lv = engine.level, left = lv.toAdvance.filter(g => !g.done).length;
  const eyebrow = [data.profile.name, workTitle, data.profile.city].filter(Boolean).join(' · ');
  const initial = data.profile.name.trim().slice(0, 1).toUpperCase() || 'Y', face = useProfilePhoto();
  const streakDays = data.profile.habitStreakDays ?? 0;
  const days = streak.days || '0'.repeat(14);
  const lean = becoming.marks.length ? (becoming.marks.reduce((a, b) => a + b, 0) / becoming.marks.length >= 50 ? 'lean yes' : 'lean no') : '';
  return (
    <Page screen="you" bar={{
      kind: 'root', title: 'You', actions: [
        { kind: 'node', node: <Press haptic="select" onPress={() => nav.go('profile')} accessibilityLabel="Your details" style={{ borderRadius: 20 }}><FaceAvatar uri={face} initials={initial} size={40} /></Press> },
        { kind: 'icon', icon: 'gear', label: 'Settings', onPress: () => nav.go('settings') },
      ],
    }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Display s="{Your life, coming together.} At your own pace." />

      <Box style={{ marginTop: space.xl }}>
        <Between style={{ alignItems: 'flex-start' }}>
          <View><Micro>Your level</Micro><Figure value={String(lv.currentLevel)} unit={lv.levelName} style={{ marginTop: 6 }} /></View>
          {left ? <Chip label={`${left} ${left === 1 ? 'move' : 'moves'} to Level ${lv.currentLevel + 1}`} onPress={() => nav.go('vantage')} /> : <Chip label="Ready for the next level" tone="done" onPress={() => nav.go('levelup')} />}
        </Between>
        <Ruler pct={lv.progressPct} style={{ marginTop: space.md }} />
        <LinkChev label="See your progress" onPress={() => nav.go('levels')} style={{ marginTop: space.sm }} />
      </Box>

      <View style={[styles.ptiles, { marginTop: space.sm }]}>
        {youAreas.map(a => <AreaTile key={a.title} title={a.title} source={photos[a.photo]} onPress={() => nav.go(a.to)} />)}
      </View>

      <Box style={{ marginTop: space.sm }}>
        <Micro>Who you’re becoming · asked every few check-ins</Micro>
        <Statement s={`{“${becoming.statement}”}`} style={{ marginTop: space.xs }} />
        {becoming.marks.length ? <>
          <BecomingScale marks={becoming.marks} style={{ marginTop: space.md }} />
          <Callout style={{ marginTop: space.sm }}>{`Your last ${becoming.marks.length} reflections ${lean}.`}</Callout>
        </> : <Callout style={{ marginTop: space.sm }}>Life asks this now and then after a check-in. Your answers gather here.</Callout>}
      </Box>

      <TileGrid style={{ marginTop: space.sm }}>
        <V26Tile label="Life knows you" scale={`${data.knowledge.overall}%`} value={n(data.knowledge.recordCount)} sub="things filed" onPress={() => nav.go('knows')} />
        <V26Tile label="Streak" scale={streak.best ? `best ${streak.best}` : undefined} value={String(streakDays)} unit={streakDays === 1 ? 'day' : 'days'} onPress={() => nav.go('habits')}>
          <DotStrip days={days} style={{ marginTop: space.sm }} />
        </V26Tile>
      </TileGrid>

      <RowsCard style={{ marginTop: space.sm }}>
        {youRows.map(r => <Row key={r.title} icon={r.icon} title={r.title} sub={r.sub} onPress={() => nav.go(r.to)} />)}
      </RowsCard>
    </Page>
  );
}

/* ───────────────────────── Household and children ───────────────────────── */

export function HouseholdV26() {
  const nav = useNavigation(), { data, set } = useSeed();
  const [count, setCount] = useState(Math.max(1, Math.min(16, data.profile.householdSize || 1)));
  return (
    <Page screen="household" footer={<Btn label="Save household" onPress={() => { set({ profile: { ...data.profile, householdSize: count } }); feedback.file(); nav.close(); }} />}>
      <Statement header s="How many people live {in your home}, counting you?" />
      <View style={{ marginTop: space.lg }}><Crowd count={count} size={46} /></View>
      <View style={{ marginTop: space.xs }}><CompactStepper value={count} onChange={setCount} min={1} max={16} unit={count === 1 ? 'person' : 'people'} label="People in your home, counting you" /></View>
      <LifeSays style={{ marginTop: space.lg }}><Body s={householdLine(count)} tone="ink" /></LifeSays>
    </Page>
  );
}

export function ChildrenV26() {
  const nav = useNavigation(), { data, set, choose } = useSeed();
  const [count, setCount] = useState(Math.max(0, Math.min(5, Number(data.choices.children ?? 0) || 0)));
  return (
    <Page screen="children" bar={{ kind: 'sheet', title: 'Children' }}
      footer={<Btn label="Save" onPress={() => { choose('children', String(count)); set({ profile: { ...data.profile, hasDependents: count > 0 } }); feedback.file(); nav.close(); }} />}>
      <Display s="How many {children under 16} live with you?" flush center />
      <View style={{ marginTop: space.xxl }}><Crowd count={count} size={34} empty /></View>
      <View style={{ marginTop: space.sm }}><CompactStepper value={count} onChange={setCount} min={0} max={5} label="Children under 16 at home" /></View>
      <LifeSays style={{ marginTop: space.xl }}><Body s={childrenLine(count)} tone="ink" /></LifeSays>
    </Page>
  );
}

/* ───────────────────────── Mood over time ───────────────────────── */

export function MoodV26() {
  const t = useTokens(), nav = useNavigation(), { data } = useSeed();
  const grid = moodGrid(data.pulseLog);
  const filled = grid.flat().filter(Boolean).length;
  const [w, onLayout] = useWidth();
  const gap = space.xs, cell = w ? (w - gap * 6) / 7 : 0;
  const drainedMondays = grid.filter(wk => wk[0] === 'drained').length;
  return (
    <Page screen="mood" bar={{ kind: 'push', title: 'How you’ve been' }} footer={<Btn label="Check in now" onPress={() => nav.go('pulse')} />}>
      <Eyebrow>{`${filled} check-in${filled === 1 ? '' : 's'} · last ${SHOW_SAMPLES ? 14 : 21} days`}</Eyebrow>
      <Display s={moodSummary || (filled ? 'Here’s {how you’ve arrived} lately.' : 'Your check-ins will {gather here}, one photograph a day.')} />
      <View onLayout={onLayout} style={{ marginTop: space.xl }} accessible accessibilityRole="image"
        accessibilityLabel={`Three weeks of check-ins by weekday.${drainedMondays > 1 ? ` ${drainedMondays} Mondays were drained.` : ''}`}>
        <View style={{ flexDirection: 'row', gap }}>{['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <Text key={i} variant="micro" tone="quiet" align="center" style={{ width: cell || undefined, flex: cell ? undefined : 1 }}>{d}</Text>)}</View>
        {cell ? grid.map((wk, r) => (
          <View key={r} style={{ flexDirection: 'row', gap, marginTop: gap }}>
            {Array.from({ length: 7 }, (_, c) => {
              if (c >= wk.length) return <View key={c} style={{ width: cell, height: cell, alignItems: 'center', justifyContent: 'center' }}><View style={{ width: cell * 0.3, height: cell * 0.3, borderRadius: cell, backgroundColor: t.surface2 }} /></View>;
              const id = wk[c];
              if (!id) return <View key={c} style={[styles.ring, { width: cell, height: cell, borderRadius: cell, backgroundColor: t.surface3 }]}><View style={{ width: cell - 4, height: cell - 4, borderRadius: cell, backgroundColor: t.canvas }} /></View>;
              const m = FEEL_MOODS[id];
              return id === 'drained'
                ? <View key={c} style={[styles.ring, { width: cell, height: cell, borderRadius: cell, backgroundColor: t.ember }]}><RoundPhoto source={photos[m.photo]} focal={{ y: 0.4 }} size={cell - 6} /></View>
                : <RoundPhoto key={c} source={photos[m.photo]} focal={{ y: 0.4 }} size={cell} />;
            })}
          </View>
        )) : null}
      </View>
      <View style={styles.wrap}>
        {(Object.keys(FEEL_MOODS) as FeelMoodId[]).map(id => (
          <View key={id} style={[styles.key, { backgroundColor: t.surface2 }]}>
            <RoundPhoto source={photos[FEEL_MOODS[id].photo]} focal={{ y: 0.4 }} size={16} />
            <Text variant="micro" tone="ink2">{FEEL_MOODS[id].name}</Text>
          </View>
        ))}
      </View>
      {moodPatterns.length ? <>
        <SectionHead title="What Life noticed" />
        <RowsCard>
          {moodPatterns.map(p => <Row key={p.title} thumb={photos[FEEL_MOODS[p.mood].photo]} title={p.title} sub={p.sub} right={<Chip label={p.tag} tone={p.applied ? 'done' : 'q'} />} onPress={p.applied ? () => nav.go('why') : undefined} />)}
        </RowsCard>
      </> : <Callout style={{ marginTop: space.xl }}>After two weeks of check-ins, Life shows the patterns it notices here.</Callout>}
    </Page>
  );
}

/* ───────────────────────── What life knows ───────────────────────── */

export function KnowsV26() {
  const t = useTokens(), nav = useNavigation(), { data, set, exportEverything } = useSeed();
  const [filter, setFilter] = useState<KnowsFilter>('All');
  const area = knowsArea(filter);
  const facts = data.records.filter(r => r.status !== 'proposed' && (!area || r.area === area));
  const long = useLongList(facts);
  const exportData = async () => { try { await Share.share({ title: 'Your life data', message: JSON.stringify(await exportEverything(), null, 2) }); } catch { Alert.alert('Couldn’t export your data', 'Your data has not changed. Please try again.'); } };
  return (
    <Page screen="knows" onEnd={long.showMore} bar={{ kind: 'push', title: 'What Life knows', action: { kind: 'icon', icon: 'info', label: 'How Life uses this', onPress: () => nav.go('privacy') } }}
      footer={<><Btn label="Export everything" icon="arrowUp" onPress={exportData} /><QuietLink label="Delete everything" onPress={() => nav.go('deleteacct')} /></>}>
      <Display s={`{${n(data.knowledge.recordCount)} things}, all from you or sources you connected.`} flush style={{ marginTop: space.xxs }} />
      <Box style={{ marginTop: space.xl }}>
        <Between><Text variant="title">What Life understands</Text><Text variant="title">{`${data.knowledge.overall}%`}</Text></Between>
        {(Object.entries(data.knowledge.areas) as [Area, number][]).map(([a, pct]) => (
          <View key={a} style={[styles.areaLine, { marginTop: space.tile }]}>
            <View style={styles.areaName}><View style={[styles.dot, { backgroundColor: areaColors[t.scheme][a] }]} /><Text variant="callout" tone="ink">{knowledgeLabels[a]}</Text></View>
            <Ruler pct={pct} bars={24} style={{ flex: 1 }} />
            <Text variant="callout" tone="ink2" style={{ width: 36, textAlign: 'right', fontVariant: ['tabular-nums'] }}>{`${pct}%`}</Text>
          </View>
        ))}
      </Box>
      <FilterChips options={knowsFilters.map(v => ({ value: v, label: v }))} value={filter} onChange={setFilter} style={{ marginTop: space.lg }} />
      <RowsCard style={{ marginTop: space.sm }}>
        {facts.length ? long.visible.map(r => {
          const removed = r.status === 'removed';
          return <Row key={r.id} thumb={photos[factPhoto(r)]} title={r.label} sub={removed ? 'Removed · Life won’t use this' : r.source.excerpt ?? `From your ${r.source.type}`}
            right={<Chip label={removed ? 'Undo' : 'Remove'} tone="q" onPress={() => { set({ records: data.records.map(v => v.id === r.id ? { ...v, status: removed ? 'confirmed' : 'removed' } : v) }); feedback.select(); }} />} />;
        }) : <Text variant="body" tone="ink2" style={{ paddingVertical: space.md }}>{filter === 'All' ? 'Nothing filed yet. Tell Life something in Talk and it lands here.' : `Nothing filed under ${filter} yet.`}</Text>}
      </RowsCard>
      <MoreRows more={long.more} onPress={long.showMore} />
      <Callout style={{ marginTop: space.md }}>Delete everything removes your data from this phone and Life’s servers. It can’t be undone.</Callout>
    </Page>
  );
}

/* ───────────────────────── Your levels ───────────────────────── */

const PATH_X = [36, 109, 181, 254], PATH_Y = [134, 100, 66, 32];

/** Four levels as a climbing path of dots (board `.tp-path`): the level you're on in ember, the rest waiting. */
function LevelPath({ current }: { current: number }) {
  const t = useTokens();
  const trail: { x: number; y: number }[] = [];
  for (let k = 0; k < 3; k++) for (let j = 2; j <= 5; j++) trail.push({ x: PATH_X[k] + (PATH_X[k + 1] - PATH_X[k]) * j / 7, y: PATH_Y[k] + (PATH_Y[k + 1] - PATH_Y[k]) * j / 7 });
  return (
    <View accessible accessibilityRole="image" accessibilityLabel={`Four levels as a climbing path. You are on level ${current}.`} style={{ marginTop: space.xs }}>
      <Svg width="100%" height={168} viewBox="0 0 290 168">
        {trail.map((p, i) => <Circle key={i} cx={p.x} cy={p.y} r={2.6} fill={t.surface3} />)}
        {PATH_X.map((x, k) => {
          const here = k + 1 === current, reached = k + 1 < current;
          return (
            <React.Fragment key={k}>
              <Circle cx={x} cy={PATH_Y[k]} r={here ? 22 : 17} fill={here ? t.ember : reached ? t.ink : t.surface3} />
              <SvgText x={x} y={PATH_Y[k] + (here ? 6 : 5)} textAnchor="middle" fontSize={here ? 16 : 14} fontFamily={fonts.sansSemibold} fontWeight="600" fill={here || reached ? t.canvas : t.ink2}>{String(k + 1)}</SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
      <View style={styles.lv}>{levelPlan.map((l, k) => <Text key={l.name} variant="micro" tone={k + 1 === current ? 'ink' : 'quiet'} align="center" style={{ flex: 1 }}>{l.name}</Text>)}</View>
    </View>
  );
}

export function LevelsV26() {
  const t = useTokens(), nav = useNavigation(), { data, engine } = useSeed();
  const lv = engine.level, cur = Math.max(1, Math.min(4, lv.currentLevel)), left = lv.toAdvance.filter(g => !g.done).length;
  const here = levelPlan[cur - 1];
  return (
    <Page screen="levels" bar={{ kind: 'push', title: 'Your levels' }}>
      <PhotoCard source={photos.keyshome} focal={{ x: 0.55, y: 0.62 }} height={170} chips={[season.label]} lead="Climbing toward" title={SHOW_SAMPLES ? season.toward : data.aim?.what ? data.aim.what.charAt(0).toUpperCase() + data.aim.what.slice(1) : 'Your Chief Aim'} style={{ marginTop: space.xxs }} onPress={() => nav.go('aim')} />
      <Box style={{ marginTop: space.sm }}>
        <Between><Text variant="title">Four levels this season</Text>{cur < 4 ? <Callout>{left ? `${left} ${left === 1 ? 'move' : 'moves'} to Level ${cur + 1}` : `Ready for Level ${cur + 1}`}</Callout> : null}</Between>
        <LevelPath current={cur} />
      </Box>
      <Box style={{ marginTop: space.sm }}>
        <Micro>{`LEVEL ${cur} · YOU ARE HERE`}</Micro>
        <Text variant="headline" style={{ marginTop: 10 }}>{here.name}</Text>
        <Text variant="body" tone="ink2" style={{ marginTop: space.xxs }}>{here.line}</Text>
        {lv.toAdvance.length ? <CheckRows items={lv.toAdvance.map(g => ({ label: gateWords(g.label), done: g.done }))} onToggle={i => nav.go(gateTo(lv.toAdvance[i].id))} style={{ marginTop: space.xs }} /> : null}
        <Micro style={{ marginTop: space.sm }}>UNLOCKS</Micro>
        <View style={[styles.wrap, { marginTop: space.xs }]}>{here.unlocks.map(u => <Chip key={u} label={u} tone="q" />)}</View>
      </Box>
      <AccordionGroup style={{ marginTop: space.sm }} items={levelPlan.map((l, k) => ({ l, k })).filter(x => x.k + 1 !== cur).map(({ l, k }) => ({
        key: l.name, title: `${k + 1} · ${l.name}`, count: k + 1 < cur ? 'Reached' : '',
        content: <View>
          <Text variant="body">{l.line}</Text>
          {l.unlocks.map(u => <View key={u} style={[styles.unlock, { marginTop: space.xs }]}><Icon name="add" size={14} color={t.ink2} /><Text variant="callout" tone="ink2" style={{ flex: 1 }}>{u}</Text></View>)}
        </View>,
      }))} />
      <Callout style={{ marginTop: space.md }}>Each level unlocks tools, routines and ideas when they become useful. Areas show progress, not separate levels.</Callout>
    </Page>
  );
}

/* ───────────────────────── Experiment ───────────────────────── */

/** Now against your own baseline as two bars, each sized to its share of the larger one (board `.tp-vs`). */
function VsBars({ name, now, base, a, b }: { name: string; now: string; base: string; a: number; b: number }) {
  const t = useTokens();
  return (
    <View accessible accessibilityLabel={`${name}: now ${now}, baseline ${base}`}>
      <Text variant="callout" tone="ink" style={{ fontFamily: fonts.sansSemibold }}>{name}</Text>
      <View style={{ gap: 6, marginTop: space.xs }}>
        <View style={[styles.vs, { width: `${a}%`, backgroundColor: t.ink }]}><Text variant="micro" numberOfLines={1} style={{ color: t.canvas }}>{`Now · ${now}`}</Text></View>
        <View style={[styles.vs, { width: `${b}%`, backgroundColor: t.surface }]}><Text variant="micro" tone="ink2" numberOfLines={1}>{`Baseline · ${base}`}</Text></View>
      </View>
    </View>
  );
}

export function ExperimentV26() {
  const nav = useNavigation(), { data, choose } = useSeed();
  const mine = data.choices.experiment;
  const e = experiment;
  if (!e) return (
    <Page screen="experiment" bar={{ kind: 'push', title: 'Experiment' }}>
      {mine ? <PhotoCard source={photos.calmdesk} focal={{ y: 0.84 }} height={200} chips={['Day 1 of 14']} title={mine} sub="Life is noting your baseline first" style={{ marginTop: space.xxs }} />
        : <Display s="{One small change}, two weeks, and your own numbers to judge it." flush style={{ marginTop: space.xxs }} />}
      <Micro style={{ marginTop: space.xl }}>{mine ? 'NEXT IDEAS TO TEST' : 'PICK ONE TO TRY'}</Micro>
      <View style={[styles.wrap, { marginTop: space.xs }]}>{nextExperiments.filter(x => x !== mine).map(x => <SoftChip key={x} label={x} onPress={() => { choose('experiment', x); feedback.select(); }} />)}</View>
      <Callout style={{ marginTop: space.md }}>One experiment at a time keeps the result clear. Wellness guidance, not a diagnosis.</Callout>
    </Page>
  );
  const cells: DotCell[] = Array.from({ length: e.of }, (_, k) => k < e.day - 1 ? 'on' : k === e.day - 1 ? 'now' : '');
  return (
    <Page screen="experiment" bar={{ kind: 'push', title: 'Experiment', action: { kind: 'icon', icon: 'info', label: 'Why this experiment', onPress: () => nav.go('why') } }}>
      <PhotoCard source={photos.calmdesk} focal={{ y: 0.84 }} height={200} chips={[`Day ${e.day} of ${e.of}`]} chipRight={e.tag} title={mine ?? e.name} sub={e.left} style={{ marginTop: space.xxs }} />
      <DotGrid cells={cells} columns={14} label={`Day ${e.day} of ${e.of}`} holeColor={undefined} style={{ marginTop: space.md }} />
      <SectionHead title="So far" link="against your own baseline" />
      <TintCard area="work" style={{ gap: space.sm }}>
        {e.vs.map(v => <VsBars key={v.name} {...v} />)}
      </TintCard>
      <LifeSays style={{ marginTop: space.lg }}>{e.says}</LifeSays>
      <Micro style={{ marginTop: space.xl }}>NEXT IDEAS TO TEST</Micro>
      <View style={[styles.wrap, { marginTop: space.xs }]}>{nextExperiments.map(x => <SoftChip key={x} label={x} onPress={() => { choose('experiment-next', x); feedback.select(); }} />)}</View>
      {data.choices['experiment-next'] ? <Callout style={{ marginTop: space.sm }}>{`${data.choices['experiment-next']} is next, once this one ends.`}</Callout> : null}
      <Callout style={{ marginTop: space.md }}>One experiment at a time keeps the result clear. Wellness guidance, not a diagnosis.</Callout>
    </Page>
  );
}

/* ───────────────────────── What life remembers ───────────────────────── */

/** A memory you can swipe left to forget (board `.tp-swipe`): the row slides and Forget waits underneath. */
function SwipeMemory({ id, title, sub, source, peek, forgotten, onForget, onEdit }: { id: string; title: string; sub: string; source: number; peek?: boolean; forgotten: boolean; onForget: () => void; onEdit: () => void }) {
  const t = useTokens(), [w, onLayout] = useWidth();
  const ref = useRef<{ scrollTo: (o: { x: number; animated?: boolean }) => void } | null>(null);
  const FORGET = 84;
  useEffect(() => { if (forgotten) ref.current?.scrollTo({ x: 0, animated: true }); }, [forgotten]);
  return (
    <View onLayout={onLayout} style={[styles.swipe, { backgroundColor: t.surface2 }]}>
      {w ? (
        <ScrollView ref={ref as never} horizontal showsHorizontalScrollIndicator={false} snapToOffsets={[0, FORGET]} decelerationRate="fast" bounces={false}
          contentOffset={peek ? { x: FORGET, y: 0 } : undefined} scrollEnabled={!forgotten}>
          <View style={[styles.swipeRow, { width: w, backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
            <Row thumb={source} title={title} sub={forgotten ? 'Forgotten · deleted when you leave' : sub} right={forgotten ? <Chip label="Undo" tone="q" onPress={onForget} /> : undefined} onPress={forgotten ? undefined : onEdit} />
          </View>
          <Press haptic="select" onPress={onForget} accessibilityLabel={`Forget ${title}`} style={styles.forget} key={id}>
            <Text variant="buttonCompact" tone="ember">Forget</Text>
          </Press>
        </ScrollView>
      ) : <View style={{ height: componentSize.row + space.md }} />}
    </View>
  );
}

export function MemoryV26() {
  const nav = useNavigation(), t = useTokens(), { data, flag, update } = useSeed();
  const [filter, setFilter] = useState<typeof memoryFilters[number]>('All');
  const [search, setSearch] = useState<string | null>(null);
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null);
  const hint = useRef(!data.flags['memory-hint-seen']).current;
  useEffect(() => { if (hint) flag('memory-hint-seen', true); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // Forgetting deletes. Undo works while you're here; leaving the screen deletes what you forgot, on this phone and
  // (by sync) on the server. Anything left forgotten by an earlier visit goes as the screen opens.
  useEffect(() => { update(purgeForgotten); return () => update(purgeForgotten); }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const kept = data.memories.filter(m => !data.flags[`forgot-${m.id}`] && liveMemory(m));
  const list = data.memories.filter(m => (filter === 'All' || m.category === filter) && (!search || `${m.text} ${m.source}`.toLowerCase().includes(search.toLowerCase())));
  const long = useLongList(list);
  const save = () => { if (editing) update(c => ({ ...c, memories: editMemory(c.memories, editing.id, editing.text) })); setEditing(null); feedback.select(); };
  const total = kept.length + usedToday.length;
  return (
    <Page screen="memory" onEnd={long.showMore} bar={{ kind: 'push', action: { kind: 'icon', icon: search === null ? 'search' : 'close', label: search === null ? 'Search memories' : 'Close search', onPress: () => setSearch(s => (s === null ? '' : null)) } }}>
      {search !== null ? (
        <View style={[styles.search, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
          <Icon name="search" size={18} color={t.ink2} />
          <TextInput maxFontSizeMultiplier={1.3} autoFocus value={search} onChangeText={setSearch} placeholder="Search what Life remembers" placeholderTextColor={t.inkQuiet} accessibilityLabel="Search what Life remembers" selectionColor={t.ember} style={[styles.searchInput, { color: t.ink }]} />
        </View>
      ) : null}
      <Eyebrow style={{ marginTop: search !== null ? space.md : 0 }}>What Life remembers</Eyebrow>
      <Display s={usedToday.length ? `{${total} things.} Life used {${usedToday.length}} of them today.` : total ? `{${total} ${total === 1 ? 'thing' : 'things'}.} Each one says where it came from.` : '{Nothing yet.} What you tell Life shows up here.'} />
      {usedToday.length ? (
        <Shelf style={{ marginTop: space.lg }}>
          {usedToday.map(u => <PhotoCard key={u.title} source={photos[u.photo]} focal={u.focal} height={190} size="sm" chips={['Used today']} title={u.title} sub={u.sub} style={{ width: 200 }} />)}
        </Shelf>
      ) : null}
      <SegmentedV26 options={memoryFilters.map(v => ({ value: v, label: v }))} value={filter} onChange={setFilter} style={{ marginTop: space.lg }} />
      <Between style={{ marginTop: space.lg }}><Micro>OTHER MEMORIES</Micro><Callout>Tap to correct · swipe to forget</Callout></Between>
      <View style={{ gap: space.xs, marginTop: space.xs }}>
        {list.length ? long.visible.map((m, i) => editing?.id === m.id ? (
          <View key={m.id} style={[styles.editMemory, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
            <TextInput maxFontSizeMultiplier={1.3} autoFocus multiline value={editing.text} onChangeText={text => setEditing({ id: m.id, text })} maxLength={300}
              accessibilityLabel="Correct this memory" selectionColor={t.ember} style={[styles.editInput, { color: t.ink }]} />
            <View style={styles.editActions}>
              <Chip label="Cancel" tone="q" onPress={() => setEditing(null)} />
              <Chip label="Save" onPress={save} />
            </View>
          </View>
        ) : (
          <SwipeMemory key={m.id} id={m.id} title={m.text} sub={m.validTo ? `No longer true · ${m.source}` : m.source} source={photos[memoryPhoto(m.id, m.category)]} peek={hint && i === 0} forgotten={!!data.flags[`forgot-${m.id}`]} onForget={() => flag(`forgot-${m.id}`)} onEdit={() => setEditing({ id: m.id, text: m.text })} />
        )) : <Text variant="body" tone="ink2">{search ? 'Nothing matches that.' : 'Nothing remembered here yet.'}</Text>}
      </View>
      <MoreRows more={long.more} onPress={long.showMore} />
      <Callout style={{ marginTop: space.md }}>Life never remembers health details or money in ways you can’t see here.</Callout>
      {SHOW_SAMPLES ? null : <QuietLink label="What Life knows" ink center={false} onPress={() => nav.go('knows')} style={{ marginTop: space.sm }} />}
    </Page>
  );
}

/* ───────────────────────── Shared life ───────────────────────── */

export function SharedV26() {
  const t = useTokens(), nav = useNavigation(), { data } = useSeed(), prefs = data.prefs;
  const home = useAreaTint('home');
  const s = shared;
  const never = (
    <View style={[styles.never, { backgroundColor: t.surface2 }]}>
      <Icon name="eyeOff" size={22} color={t.ink} />
      <View style={{ flex: 1 }}><Text variant="title">Never shared</Text><Text variant="callout" tone="ink2" style={{ marginTop: 2 }}>Your health, journal, Pulse, and personal spending.</Text></View>
    </View>
  );
  if (!s) return (
    <Page screen="shared" bar={{ kind: 'push' }}>
      <View style={styles.duo}><InitialsAvatar initials={data.profile.name.slice(0, 1).toUpperCase() || 'Y'} /></View>
      <Display s="{Nothing shared yet.} When you invite someone, you choose each thing you share." />
      <View style={{ marginTop: space.xl }}>{never}</View>
    </Page>
  );
  const hide = prefs.hideBalances, pct = Math.round(s.deposit / s.target * 100);
  return (
    <Page screen="shared" bar={{ kind: 'push', action: { kind: 'icon', icon: 'add', label: 'Share something', onPress: () => nav.go('chat') } }}>
      <View style={[styles.duo, { marginTop: space.xxs }]}>
        <InitialsAvatar initials={data.profile.name.slice(0, 1).toUpperCase()} />
        <View style={[styles.duoBack, { backgroundColor: t.canvas }]}><InitialsAvatar initials={s.partner.slice(0, 1)} style={{ backgroundColor: t.surface3 }} /></View>
      </View>
      <Display s={`{You and ${s.partner}} share {${s.things} things}. The rest stays yours.`} />
      <View style={[styles.hero, { marginTop: space.xl, ...cardShadow(t.scheme) }]}>
        <View style={{ borderRadius: radius.lg, overflow: 'hidden' }}>
          <PhotoCardFlat />
          <View style={{ backgroundColor: t.surface, padding: 18 }}>
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: home.tint }]} />
            <Between><Text variant="headline">{hide ? '•••• of ••••' : `${money(s.deposit)} of ${money(s.target)}`}</Text><Text variant="title">{`${pct}%`}</Text></Between>
            <View style={styles.split} accessible accessibilityLabel={`You ${money(s.yours)}, ${s.partner} ${money(s.sam)}, of ${money(s.target)}`}>
              <View style={{ flex: s.yours, borderRadius: 7, backgroundColor: t.ink }} />
              <View style={{ flex: s.sam, borderRadius: 7, backgroundColor: home.accent }} />
              <View style={{ flex: Math.max(0, s.target - s.deposit), borderRadius: 7, backgroundColor: t.surface }} />
            </View>
            <View style={[styles.wrap, { marginTop: space.sm, gap: 14 }]}>
              <View style={styles.legend}><View style={[styles.legendDot, { backgroundColor: t.ink }]} /><Text variant="callout" tone="ink2">{`You ${hide ? '••••' : money(s.yours)}`}</Text></View>
              <View style={styles.legend}><View style={[styles.legendDot, { backgroundColor: home.accent }]} /><Text variant="callout" tone="ink2">{`${s.partner} ${hide ? '••••' : money(s.sam)}`}</Text></View>
            </View>
          </View>
        </View>
      </View>
      <RowsCard style={{ marginTop: space.sm }}>
        {s.rows.map(r => <Row key={r.title} thumb={photos[r.photo]} title={r.title} sub={r.sub} right={<Chip label="Shared" tone="q" />} onPress={() => nav.go(r.to)} />)}
      </RowsCard>
      <View style={{ marginTop: space.sm }}>{never}</View>
    </Page>
  );
}

/** The joint goal's photograph with its words low on it, flat on top of the tinted part. */
function PhotoCardFlat() {
  return (
    <View style={{ height: 150, justifyContent: 'flex-end' }}>
      <PhotoFill source={photos.movein} focal={{ y: 0.72 }} />
      <LinearGradient pointerEvents="none" colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} />
      <View style={{ paddingHorizontal: 18, paddingVertical: space.md }}>
        <Text variant="micro" tone="paper2">Joint goal</Text>
        <Text variant="heading" tone="paper" style={{ marginTop: 2 }}>Deposit for a home</Text>
      </View>
    </View>
  );
}

/* ───────────────────────── Your details ───────────────────────── */

/** Your photo for the You tab (Edem, 21 Nov 2026). It stays on this phone. */
function YourPhoto({ initial }: { initial: string }) {
  const t = useTokens(), face = useProfilePhoto();
  const choose = () => { chooseProfilePhoto().then(done => { if (done) feedback.complete(); }).catch(() => Alert.alert('That photo didn’t load', 'Try another one.')); };
  return (
    <View style={[styles.photoRow, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
      <Press haptic="select" onPress={choose} accessibilityLabel={face ? 'Change your photo' : 'Add a photo'} style={{ flexDirection: 'row', alignItems: 'center', gap: space.sm, flex: 1, minWidth: 0 }}>
        <FaceAvatar uri={face} initials={initial} size={56} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="title">{face ? 'Change your photo' : 'Add a photo'}</Text>
          <Text variant="callout" tone="ink2">Shows on the You tab. It stays on this phone.</Text>
        </View>
      </Press>
      {face ? <QuietLink label="Remove" onPress={() => { removeProfilePhoto(); feedback.select(); }} /> : null}
    </View>
  );
}

export function ProfileV26() {
  const nav = useNavigation(), { data, set, flag, engine } = useSeed();
  const editing = !!data.flags['profile-edit'];
  const [name, setName] = useState(data.profile.name), [city, setCity] = useState(data.profile.city);
  const p = data.profile, others = Math.max(0, p.householdSize - 1), born = bornOn(p);
  // A real account reads its own work and pay day; the sample life keeps the board's words.
  const payN = Number(p.payDay ?? data.choices['payday-day']) || 0;
  const work = SHOW_SAMPLES ? details.work : workWords[p.workStatus] ?? 'Not set', payDay = SHOW_SAMPLES ? details.payDay : payN ? ordinalDay(payN) : 'Not set';
  const fullName = SHOW_SAMPLES && p.name === 'Ama' ? 'Ama Mensah' : p.name;
  const kids = Number(data.choices.children ?? 0) || 0;
  const living = others === 0 ? '{on your own}' : `with {${others} ${others === 1 ? 'other' : 'others'}}`;
  const sentence = SHOW_SAMPLES
    ? `You’re {${p.age}}, a {@briefcase ${details.work.toLowerCase()}} in {@home ${details.area}}, living ${living} and paid on the {@calendar ${details.payDay}}.`
    : `You’re {${p.age}}, ${p.city ? `living in {@home ${p.city}}, ` : 'living '}${living}.`;
  const save = () => { if (editing) set({ profile: { ...p, name: name.trim() || p.name, city: city.trim() || p.city } }); flag('profile-edit'); feedback.select(); };
  const rows: { photo: keyof typeof photos; title: string; sub: string; to?: Parameters<typeof nav.go>[0] }[] = [
    { photo: 'birthday', title: `Birthday · ${born ?? 'Not set'}`, sub: 'Age rules, and your birthday recap', to: born ? 'yourbirthday' : undefined },
    { photo: 'terrace', title: `Lives in · ${SHOW_SAMPLES ? `${details.area}, ` : ''}${p.city}`, sub: 'Council tax, schemes' },
    { photo: 'work', title: `Work · ${work}`, sub: 'Tax and structure', to: 'income' },
    { photo: 'home', title: `Lives with · ${others === 0 ? 'Just me' : `${others} ${others === 1 ? 'other' : 'others'}`}`, sub: 'Discounts, benefits', to: 'household' },
    { photo: 'payslip', title: `Pay day · ${payDay}`, sub: 'When nudges land', to: 'routines' },
    { photo: 'people', title: `Children · ${kids === 0 ? 'None' : kids}`, sub: 'Child Benefit, childcare', to: 'children' },
    { photo: 'walk', title: 'Body numbers', sub: 'Food targets, readiness, ranges', to: 'measures' },
  ];
  return (
    <Page screen="profile" bar={{ kind: 'push', title: 'Your details', action: { kind: 'node', node: <Chip label={editing ? 'Done' : 'Edit'} onPress={save} /> } }}>
      <PhotoCard source={SHOW_SAMPLES ? photos.desk : photos.aimdesk} height={200} chips={[`Level ${engine.level.currentLevel} · ${engine.level.levelName}`]} title={fullName} sub={born ? `Born ${born}` : undefined} style={{ marginTop: space.xxs }} />
      <YourPhoto initial={(p.name.trim().slice(0, 1) || 'Y').toUpperCase()} />
      <Statement s={sentence} style={{ marginTop: space.lg }} />
      {editing ? <View style={{ gap: space.xs, marginTop: space.lg }}>
        <Field label="Name" value={name} onChangeText={setName} />
        <Field label="Lives in" value={city} onChangeText={setCity} />
      </View> : null}
      <Micro style={{ marginTop: space.xl }}>WHAT EACH ONE CHANGES</Micro>
      <RowsCard style={{ marginTop: space.xs }}>
        {rows.map(r => <Row key={r.title} thumb={photos[r.photo]} title={r.title} sub={r.sub} onPress={r.to ? () => nav.go(r.to!) : () => flag('profile-edit', true)} />)}
      </RowsCard>
    </Page>
  );
}

const styles = StyleSheet.create({
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, padding: space.md, borderRadius: radius.lg, marginTop: space.tile },
  link: { flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start', minHeight: 28 },
  ptiles: { flexDirection: 'row', gap: space.xs },
  ptile: { flex: 1, height: 140, borderRadius: radius.tile, overflow: 'hidden', justifyContent: 'flex-end' },
  crowd: { flexDirection: 'row', justifyContent: 'center', alignItems: 'flex-end', gap: 2 },
  ring: { alignItems: 'center', justifyContent: 'center' },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: space.md },
  key: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 28, paddingLeft: 6, paddingRight: space.sm, borderRadius: radius.full },
  areaLine: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  areaName: { width: 70, flexDirection: 'row', alignItems: 'center', gap: 7 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  lv: { flexDirection: 'row', gap: 6, marginTop: 6 },
  unlock: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  vs: { height: 28, borderRadius: 14, paddingHorizontal: space.sm, justifyContent: 'center', minWidth: 120 },
  swipe: { borderRadius: radius.tile, overflow: 'hidden' },
  swipeRow: { borderRadius: radius.tile, paddingHorizontal: space.sm },
  forget: { width: 84, alignItems: 'center', justifyContent: 'center' },
  editMemory: { borderRadius: radius.tile, padding: space.md, gap: space.sm },
  editInput: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 21, minHeight: 44, padding: 0, textAlignVertical: 'top' },
  editActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: space.xs },
  search: { flexDirection: 'row', alignItems: 'center', gap: space.xs, height: 48, borderRadius: radius.full, paddingHorizontal: space.md },
  searchInput: { flex: 1, fontFamily: fonts.sans, fontSize: 15, paddingVertical: 0 },
  duo: { flexDirection: 'row', alignItems: 'center' },
  duoBack: { marginLeft: -16, padding: 3, borderRadius: radius.full },
  hero: { borderRadius: radius.lg },
  split: { flexDirection: 'row', gap: 3, height: 14, marginTop: 14 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  never: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm, padding: space.md, borderRadius: radius.lg },
});
