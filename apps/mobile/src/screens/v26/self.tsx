/**
 * Know yourself, restyled to the V26 board (`body-b.js`): the shelf of tests, one statement at a time, your
 * personality in five plain lines, your body clock, what matters most as photographs, and your body numbers with
 * where each comes from. Board-only words live in `state/you.ts`; answers stay on the phone.
 */
import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import { Share, StyleSheet, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import {
  Field, Icon, LifeSays, PhotoFill, Press, SectionHead, StatusPill, Text, TileGrid, TintCard, V26Tile, cardShadow, componentSize, feedback, fonts,
  photo, photoScrims, photos, radius, space, useAreaTint, useTokens, type Focal,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import { useSeed } from '@/state/SeedProvider';
import { seed } from '@/state/seed';
import { SHOW_SAMPLES } from '@/state/sample';
import { bigFive, bodyClock, defaultValues, likertLabels, moneyStatements, personalityStatements, sampleTestsDone, tests, valueHeights, valuePhotos, type TestKey } from '@/state/you';
import { Between, Body, Box, Btn, Callout, Display, Eyebrow, Micro, Page, Row, RowsCard } from './kit';
import { Head, Ticks } from './bodykit';
import { RoundPhoto } from './you';

/* ───────────────────────── Shared pieces ───────────────────────── */

/** A photograph with a big title low on it and a chip on top (board `pcard` with a 34pt title). */
export function TitleCard({ source, focal, height, chip, chipRight, title, titleVariant = 'display', sub, onPress, style }: {
  source: ImageSourcePropType; focal?: Focal; height: number; chip?: string; chipRight?: string; title: string; titleVariant?: 'display' | 'titleSerif' | 'huge'; sub?: string; onPress?: () => void; style?: StyleProp<ViewStyle>;
}) {
  const t = useTokens();
  const inner = <>
    <PhotoFill source={source} focal={focal} />
    <LinearGradient pointerEvents="none" colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} />
    <View style={styles.top}>{chip ? <StatusPill size="chip" onPhoto label={chip} /> : <View />}{chipRight ? <StatusPill size="chip" onPhoto label={chipRight} /> : null}</View>
    <View style={{ paddingHorizontal: space.cardPad, paddingBottom: 18 }}>
      <Text variant={titleVariant} style={{ color: photo.onPhoto, fontFamily: fonts.sansSemibold }}>{title}</Text>
      {sub ? <Text variant="callout" style={{ color: photo.onPhoto2, marginTop: 2 }}>{sub}</Text> : null}
    </View>
  </>;
  const box: StyleProp<ViewStyle> = [styles.card, { height, backgroundColor: t.surface2, ...cardShadow(t.scheme) }, style];
  return onPress ? <Press haptic="open" onPress={onPress} accessibilityLabel={[title, sub].filter(Boolean).join(', ')} style={box}>{inner}</Press> : <View accessible accessibilityLabel={[chip, title, sub].filter(Boolean).join(', ')} style={box}>{inner}</View>;
}

/** Which tests are done: the sample's in development builds, plus whatever you've finished. */
function useDone() {
  const { data } = useSeed();
  return (k: TestKey) => sampleTestsDone.includes(k) || (k === 'personality' && !!data.flags['personality-done']) || (k === 'money' && !!data.flags['money-mindset-done']) || (k === 'values' && !!data.choices.values) || (k === 'clock' && !!data.flags['clock-done']);
}

/* ───────────────────────── Know yourself ───────────────────────── */

export function TestsV26() {
  const t = useTokens(), nav = useNavigation(), { choose } = useSeed(), done = useDone();
  const count = tests.filter(x => done(x.key)).length;
  const open = (k: TestKey, to: typeof tests[number]['to']) => {
    if (k === 'personality' || k === 'money') { choose('test-kind', k); nav.go(done(k) && k === 'personality' ? 'bigfive' : 'testq'); return; }
    nav.go(to);
  };
  return (
    <Page screen="tests" bar={{ kind: 'push' }}>
      <TitleCard source={photos.journal} focal={{ y: 0.51 }} height={220} chip={`${count} of ${tests.length} done`} title="Know yourself" sub="So life can fit you, not the average person." style={{ marginTop: space.xxs }} />
      <View style={[styles.grid, { marginTop: space.sm }]}>
        {tests.map(x => {
          const d = done(x.key);
          return (
            <Press key={x.key} haptic="open" onPress={() => open(x.key, x.to)} accessibilityLabel={`${x.name}, ${d ? 'done' : `start, ${x.time}`}`} style={[styles.shelf, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
              <View style={[styles.shelfPhoto, { backgroundColor: t.surface2 }]}>
                <PhotoFill source={photos[x.photo]} focal={x.focal} />
                <StatusPill size="chip" onPhoto icon={d ? 'check' : undefined} label={d ? 'Done' : `Start · ${x.time}`} />
              </View>
              <View style={{ paddingHorizontal: 14, paddingTop: space.sm, paddingBottom: 14 }}>
                <Text variant="title">{x.name}</Text>
                <Text variant="micro" tone="quiet" style={{ marginTop: 2 }}>{x.what}</Text>
                <Text variant="callout" tone="ink2" style={{ marginTop: space.xs }}>{x.why}</Text>
              </View>
            </Press>
          );
        })}
      </View>
      <Callout style={{ marginTop: space.md }}>Your answers stay private and you can retake or delete them any time.</Callout>
    </Page>
  );
}

/* ───────────────────────── One statement at a time ───────────────────────── */

/** The five answers as circles on a dotted line, the ends larger (board `.bb-likert`). */
function Likert({ value, onChange }: { value: number | null; onChange: (n: number) => void }) {
  const t = useTokens();
  const sizes = [56, 44, 36, 44, 56];
  return (
    <View style={styles.likert} accessibilityRole="radiogroup" accessibilityLabel="How well this describes you">
      <View style={styles.likertLine} pointerEvents="none">{Array.from({ length: 30 }, (_, i) => <View key={i} style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: t.surface3 }} />)}</View>
      {likertLabels.map((label, k) => {
        const on = value === k, d = sizes[k];
        return (
          <Press key={label} haptic="select" onPress={() => onChange(k)} accessibilityRole="radio" accessibilityState={{ selected: on }} accessibilityLabel={label} hitSlop={6}
            style={{ width: d, height: d, borderRadius: d / 2, alignItems: 'center', justifyContent: 'center', backgroundColor: on ? t.ink : t.surface, ...cardShadow(t.scheme) }}>
            {on ? <Icon name="check" size={18} color={t.canvas} /> : null}
          </Press>
        );
      })}
    </View>
  );
}

export function TestqV26() {
  const t = useTokens(), nav = useNavigation(), { data, choose, flag } = useSeed();
  const params = useLocalSearchParams<{ state?: string }>();
  const money = data.choices['test-kind'] === 'money';
  const list = money ? moneyStatements : personalityStatements, key = money ? 'money' : 'personality';
  const preview = params.state ? /^q(\d+)(-picked)?$/.exec(params.state) : null;
  const [q, setQ] = useState(() => preview ? Math.min(list.length - 1, Number(preview[1]) - 1) : Math.min(list.length - 1, Number(data.choices[`${key}-at`] ?? 0) || 0));
  const [picked, setPicked] = useState<number | null>(preview?.[2] ? 3 : null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  const answer = (n: number) => {
    setPicked(n);
    choose(`${key}-${q}`, String(n));
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (q + 1 >= list.length) {
        flag(money ? 'money-mindset-done' : 'personality-done', true); choose(`${key}-at`, '0'); feedback.complete();
        nav.replace(money ? 'tests' : 'bigfive');
      } else { choose(`${key}-at`, String(q + 1)); setQ(q + 1); setPicked(null); }
    }, 520);
  };
  return (
    <Page screen="testq" scroll={false} bar={{ kind: 'push', close: true, title: money ? 'You and money' : 'Personality', action: { kind: 'node', node: <Text variant="callout" tone="ink2" style={{ fontVariant: ['tabular-nums'] }}>{`${q + 1} / ${list.length}`}</Text> } }}>
      <View style={[styles.track, { backgroundColor: t.surface3 }]}><View style={{ width: `${(q + 1) / list.length * 100}%`, height: '100%', borderRadius: 2, backgroundColor: t.ink }} /></View>
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <Eyebrow>How well does this describe you?</Eyebrow>
        <Text variant="huge" style={{ marginTop: space.xs }}>{list[q]}</Text>
      </View>
      <Likert value={picked} onChange={answer} />
      <Between style={{ marginTop: space.sm }}><Callout>{likertLabels[0]}</Callout><Callout>{likertLabels[4]}</Callout></Between>
      <Text variant="headline" align="center" style={{ marginTop: space.lg, minHeight: 26, marginBottom: space.lg }}>{picked !== null ? likertLabels[picked] : ''}</Text>
    </Page>
  );
}

/* ───────────────────────── Your personality ───────────────────────── */

/** One trait as a line of dots with the average marked and where you sit (board `.bb-trait`). */
function TraitLine({ at }: { at: number }) {
  const t = useTokens(), { accent } = useAreaTint('you');
  return (
    <View style={styles.trait}>
      {Array.from({ length: 25 }, (_, k) => k === 12
        ? <View key={k} style={{ width: 2, height: 18, borderRadius: 1, backgroundColor: t.ink2 }} />
        : <View key={k} style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: accent, opacity: 0.4 }} />)}
      <View style={{ position: 'absolute', top: 2, left: `${at}%`, marginLeft: -9, width: 18, height: 18, borderRadius: 9, backgroundColor: t.ink }} />
    </View>
  );
}

export function BigfiveV26() {
  const t = useTokens(), { data } = useSeed();
  const share = () => { void Share.share({ message: `My Big Five, from life: ${bigFive.traits.map(x => `${x.name} ${x.plain.toLowerCase()}`).join('; ')}.` }); };
  return (
    <Page screen="bigfive" bar={{ kind: 'push', title: 'Personality', action: { kind: 'icon', icon: 'arrowUp', label: 'Share', onPress: share } }}>
      <View style={styles.eyebrow}>
        <RoundPhoto source={photos.desk} focal={{ x: 0.92, y: 0.5 }} size={28} />
        <Text variant="callout" tone="ink2">{`${data.profile.name} · the Big Five`}</Text>
      </View>
      <Display s={bigFive.sentence} />
      <TintCard area="you" style={{ marginTop: space.xl }}>
        {bigFive.traits.map((x, i) => (
          <View key={x.name} style={{ marginTop: i ? 18 : 0 }} accessible accessibilityLabel={`${x.name}: ${x.plain}. ${x.so}.`}>
            <Between><Text variant="title">{x.name}</Text><Text variant="callout" tone="ink2">{x.plain}</Text></Between>
            <TraitLine at={x.at} />
            <View style={styles.so}><Icon name="arrow" size={14} color={t.ink2} /><Text variant="callout" tone="ink2" style={{ flex: 1 }}>{x.so}</Text></View>
          </View>
        ))}
      </TintCard>
      <Callout style={{ marginTop: space.md }}>The middle line is the average person; the words sit at the high end. No trait is good or bad, and none is a type or a label.</Callout>
      {!SHOW_SAMPLES && !data.flags['personality-done'] ? <Callout style={{ marginTop: space.sm }}>An example reading. Take the test to see your own.</Callout> : null}
    </Page>
  );
}

/* ───────────────────────── Your body clock ───────────────────────── */

export function ChronotypeV26() {
  const t = useTokens(), nav = useNavigation(), { tint, accent } = useAreaTint('work');
  return (
    <Page screen="chronotype" bar={{ kind: 'push', title: 'Body clock' }}>
      <TitleCard source={photos.calmdesk} focal={{ y: 0.76 }} height={200} chip="You’re a" title={bodyClock.type} titleVariant="titleSerif" sub={bodyClock.sleep} style={{ marginTop: space.xxs }} />
      <TintCard area="work" style={{ marginTop: space.sm }}>
        <Head icon="sun" title="Your day, placed where it works" />
        <View style={[styles.day, { backgroundColor: t.surface }]} accessible accessibilityRole="image" accessibilityLabel="Workouts early morning and early evening, deep work 9 to 12, wind-down from 22:30.">
          {bodyClock.blocks.map((b, i) => (
            <View key={i} style={[styles.block, { left: `${b.left}%`, width: `${b.width}%`, backgroundColor: b.deep ? accent : tint }]}>
              <Icon name={b.icon} size={16} color={b.deep ? t.surface : t.ink} />
            </View>
          ))}
        </View>
        <Ticks marks={bodyClock.ticks} />
      </TintCard>
      <RowsCard style={{ marginTop: space.sm }}>
        {bodyClock.rows.map(r => <Row key={r.title} icon={r.icon} title={r.title} sub={r.sub} chevron={false} onPress={() => nav.go(r.to)} />)}
      </RowsCard>
      <Callout style={{ marginTop: space.md }}>From five questions, confirmed against your real sleep.</Callout>
    </Page>
  );
}

/* ───────────────────────── What matters most ───────────────────────── */

const VALUE_TYPE: { variant: 'welcome' | 'display' | 'titleSerif' | 'heading' | 'headline' }[] = [{ variant: 'welcome' }, { variant: 'display' }, { variant: 'titleSerif' }, { variant: 'heading' }, { variant: 'headline' }];

export function ValuesV26() {
  const t = useTokens(), { data, choose } = useSeed();
  const [values, setValues] = useState((data.choices.values ?? defaultValues.join('|')).split('|').slice(0, 5));
  const [sorting, setSorting] = useState(false);
  const up = (i: number) => {
    if (i === 0) return;
    const next = [...values]; [next[i - 1], next[i]] = [next[i], next[i - 1]];
    setValues(next); choose('values', next.join('|')); feedback.select();
  };
  return (
    <Page screen="values" bar={{ kind: 'push', title: 'Values', action: { kind: 'icon', icon: sorting ? 'check' : 'swap', label: sorting ? 'Done reordering' : 'Reorder your values', onPress: () => setSorting(s => !s) } }}>
      <Eyebrow>{sorting ? 'Tap a value to move it up' : 'Your top five · sorted from 20 cards'}</Eyebrow>
      <View style={{ gap: space.xs, marginTop: space.sm }}>
        {values.map((v, i) => {
          const pic = valuePhotos[v] ?? { photo: 'freedom' as const, focal: {} };
          const inner = <>
            <PhotoFill source={photos[pic.photo]} focal={pic.focal} />
            <LinearGradient pointerEvents="none" colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} />
            <Text variant={VALUE_TYPE[i].variant} numberOfLines={1} style={{ color: photo.onPhoto, fontFamily: fonts.sansSemibold, flexShrink: 1 }}>{v}</Text>
            <StatusPill size="chip" onPhoto label={sorting && i > 0 ? 'Move up' : String(i + 1).padStart(2, '0')} />
          </>;
          const box = [styles.value, { height: valueHeights[i], backgroundColor: t.surface2, ...cardShadow(t.scheme) }];
          return sorting
            ? <Press key={v} haptic={null} onPress={() => up(i)} accessibilityLabel={`${v}, rank ${i + 1}.${i ? ' Tap to move up.' : ' Top value.'}`} style={box}>{inner}</Press>
            : <View key={v} accessible accessibilityLabel={`${i + 1}. ${v}`} style={box}>{inner}</View>;
        })}
      </View>
      <Box style={{ marginTop: space.sm }}>
        <Micro>How life uses this</Micro>
        <LifeSays style={{ marginTop: space.sm }}><Body s={`When a choice is close, life shows which option fits {${values[0]}} and {${values[1]}} best, not just which pays more.`} tone="ink" /></LifeSays>
        <Callout style={{ marginTop: space.sm }}>They sit under your Chief Aim.</Callout>
      </Box>
    </Page>
  );
}

/* ───────────────────────── Your body numbers ───────────────────────── */

function Num({ label, value, unit, sub }: { label: string; value: string; unit?: string; sub: string }) {
  return (
    <View style={{ flex: 1, minWidth: 0 }} accessible accessibilityLabel={`${label}, ${value}${unit ? ` ${unit}` : ''}. ${sub}`}>
      <Micro>{label}</Micro>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', marginTop: space.xs }}>
        <Text variant="numeralL">{value}</Text>{unit ? <Text variant="callout" tone="ink2">{` ${unit}`}</Text> : null}
      </View>
      <Text variant="callout" tone="ink2" style={{ marginTop: 2 }}>{sub}</Text>
    </View>
  );
}

/** A number you tell life: its name and what it changes, the value on the right. Tap to change it. */
function Ask({ name, changes, value, open, onPress, children }: { name: string; changes: string; value: string; open: boolean; onPress: () => void; children?: ReactNode }) {
  const t = useTokens();
  return (
    <View style={[styles.ask, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
      <Press haptic="select" pressScale={0.99} onPress={onPress} accessibilityLabel={`${name}, ${value}. ${changes}`} accessibilityState={{ expanded: open }} style={styles.askHead}>
        <View style={{ flex: 1, minWidth: 0 }}><Text variant="title">{name}</Text><Text variant="callout" tone="ink2">{changes}</Text></View>
        <View style={styles.askVal}><Text variant="greeting" numberOfLines={1}>{value}</Text><Icon name="more" size={componentSize.iconXs} color={t.ink} /></View>
      </Press>
      {open ? <View style={{ paddingHorizontal: space.md, paddingBottom: space.md }}>{children}</View> : null}
    </View>
  );
}

export function MeasuresV26() {
  const nav = useNavigation(), { data, set, choose } = useSeed();
  const [open, setOpen] = useState<string | null>(null);
  const b = seed.body, bmi = data.weightKg / ((data.heightCm / 100) ** 2);
  const bp = data.choices.bp ?? b.bp, sex = data.choices['sex-at-birth'] ?? b.sexAtBirth;
  const num = (k: 'heightCm' | 'waistCm') => (s: string) => { const v = Number(s); if (Number.isFinite(v) && v > 0) set({ [k]: v }); };
  const toggle = (k: string) => setOpen(o => (o === k ? null : k));
  return (
    <Page screen="measures" bar={{ kind: 'push', title: 'Body numbers' }}>
      <Eyebrow>Everything life knows about your body</Eyebrow>
      <Display s="{Ten numbers.} Each shows where it’s from and what it changes." />
      <TintCard area="you" style={{ marginTop: space.xl }}>
        <Head icon="trend" title="Smart scale" right="updates itself" />
        <View style={styles.pair}>
          <Num label="Weight · 7-day trend" value={data.weightKg.toFixed(1)} unit="kg" sub="Changes food targets, load, BMI" />
          <Num label="Body fat" value={String(b.bodyFatPct)} unit="%" sub="Trend only; scales vary" />
        </View>
      </TintCard>
      <TintCard area="health" style={{ marginTop: space.sm }}>
        <Head icon="watch" title="Apple Watch" right="updates itself" />
        <View style={styles.pair}>
          <Num label="Resting heart rate" value={String(b.rhr)} unit="bpm" sub="Changes readiness, zones" />
          <Num label="VO₂ max" value={String(b.vo2)} sub="Changes fitness age" />
        </View>
      </TintCard>
      <TileGrid style={{ marginTop: space.sm }}>
        <V26Tile label="BMI" scale="Calculated" value={bmi.toFixed(1)} sub="A rough screen only" onPress={() => nav.go('bmi')} />
        <V26Tile label="Activity level" scale="Weekly" value={b.activity} sub="Measured. Changes food targets" />
      </TileGrid>
      <SectionHead title="You tell life" link="asked about once a month" />
      <View style={{ gap: space.xs }}>
        <Ask name="Height" changes="Changes food targets, BMI, load" value={`${Math.round(data.heightCm)} cm`} open={open === 'height'} onPress={() => toggle('height')}>
          <Field label="Height in cm" value={String(Math.round(data.heightCm))} onChangeText={num('heightCm')} keyboardType="numeric" />
        </Ask>
        <Ask name="Waist" changes="Waist-to-height, better than BMI" value={`${Math.round(data.waistCm)} cm`} open={open === 'waist'} onPress={() => toggle('waist')}>
          <Field label="Waist in cm" value={String(Math.round(data.waistCm))} onChangeText={num('waistCm')} keyboardType="numeric" />
        </Ask>
        <Ask name="Blood pressure" changes="You or a cuff. Health check-ins" value={bp} open={open === 'bp'} onPress={() => toggle('bp')}>
          <Field label="Blood pressure" value={bp} placeholder="120 / 80" onChangeText={v => choose('bp', v)} />
        </Ask>
        <Ask name="Sex at birth" changes="Cycle, ranges, food targets" value={sex} open={open === 'sex'} onPress={() => toggle('sex')}>
          <View style={{ flexDirection: 'row', gap: space.xs }}>{['Female', 'Male'].map(s => <Btn key={s} label={s} sm ghost={s !== sex} fit onPress={() => { choose('sex-at-birth', s); setOpen(null); }} />)}</View>
        </Ask>
      </View>
      <Btn label="BMI and waist, explained" ghost icon="chev" trail onPress={() => nav.go('bmi')} style={{ marginTop: space.md }} />
    </Page>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.photo, overflow: 'hidden', justifyContent: 'space-between' },
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', padding: space.md },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: space.tile },
  shelf: { width: '48.5%', flexGrow: 1, flexBasis: '45%', borderRadius: radius.lg, overflow: 'hidden' },
  shelfPhoto: { height: 92, padding: space.tile, alignItems: 'flex-start' },
  track: { height: 4, borderRadius: 2, overflow: 'hidden', marginTop: space.xs },
  likert: { height: 60, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  likertLine: { position: 'absolute', left: 28, right: 28, top: 28, height: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', overflow: 'hidden' },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  trait: { height: 22, marginTop: space.xs, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  so: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 6 },
  day: { height: 56, marginTop: space.md, borderRadius: 18 },
  block: { position: 'absolute', top: 6, bottom: 6, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  value: { borderRadius: radius.photo, overflow: 'hidden', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: space.sm, paddingHorizontal: space.cardPad, paddingBottom: 14 },
  pair: { flexDirection: 'row', gap: space.md, marginTop: space.md },
  ask: { borderRadius: radius.lg },
  askHead: { minHeight: 68, flexDirection: 'row', alignItems: 'center', gap: space.sm, paddingHorizontal: 18, paddingVertical: space.xs },
  askVal: { flexDirection: 'row', alignItems: 'center', gap: 6, flexShrink: 0 },
});
