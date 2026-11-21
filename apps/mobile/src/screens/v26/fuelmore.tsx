/**
 * Fuel, the rest of the chapter (V26 board, `fuel.js`): what to cook, the week of meals, targets and the plan,
 * progress, exercise added back, describing a workout, weight, nutrients, the week, meal timing, food quality,
 * alcohol and bringing your history. Figures come from the diary, the seed and `state/fuel.ts`.
 */
import { useState } from 'react';
import { Share, StyleSheet, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import Svg, { Circle, G, Rect, Text as SvgText } from 'react-native-svg';
import {
  BandLine, CapsuleBars, ChatBubble, CheckRows, DotGrid, FilterChips, Icon, LifeOrb, LifeSays, PhotoCard, PhotoFill, PhotoGrid, Press, RoundButton,
  Ruler, SectionHead, SegmentedV26, SwitchV26, Text, TileGrid, TintCard, V26Tile, WheelPicker, cardShadow, feedback, fonts, photo, photoScrims,
  photos, radius, space, useAreaTint, useTokens,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import { planTargets } from '@life/core';
import { useSeed, type SeedData } from '@/state/SeedProvider';
import { seed } from '@/state/seed';
import { SHOW_SAMPLES } from '@/state/sample';
import { weightDays, weightWeekChange } from '@/state/body';
import {
  alcohol as drinks, bodyProfileRow, cook, dayKey, eatenOn, eatingWindows, engineTargets, kcalFloor, mealWeek, nutrientsToday, nutrientsWeek, paces, progress, quality, timing, useFuelDay, uses,
  watchToday, week, weighIns,
} from '@/state/fuel';
import { pickAttachment } from '@/services/attachments';
import { Axis, Measure, useWidth } from './bodykit';
import { Between, Body, Box, Btn, Callout, Chip, Cols, Display, Eyebrow, Figure, Micro, Page, Row, RowsCard, Shelf, Sp, Statement } from './kit';
import { mealPic, n, useLogMeal } from './fuel';

const info = (label: string, onPress: () => void) => ({ kind: 'icon' as const, icon: 'info' as const, label, onPress });
const r1 = (v: number) => Math.round(v * 10) / 10;
/** A weekly pace in words: "half a kilo" near 0.5, otherwise the kilos. */
const kiloWords = (kgs: number) => { const k = Math.round(kgs * 100) / 100; return Math.abs(k - .5) < .03 ? 'half a kilo' : `${k} kg`; };
const WEEK = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const FULL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
/** A day key as "14 November". */
const dayWords = (key: string) => new Date(`${key}T12:00:00`).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
/** Monday-first index of a date. */
const monIndex = (d = new Date()) => (d.getDay() + 6) % 7;
const shortDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
const longDate = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
/** "early", "mid" or "late" January. */
const roughly = (d: Date) => `${d.getDate() <= 10 ? 'early' : d.getDate() <= 20 ? 'mid' : 'late'} ${d.toLocaleDateString('en-GB', { month: 'long' })}`;
const ruled = (v: number, max: number) => Math.max(0, Math.min(100, Math.round(v / max * 100)));

/* ───────────────────────── The plan's numbers ───────────────────────── */

type Goal = 'Lose' | 'Keep' | 'Gain';
export type PlanFigures = {
  available: true; uses: number; change: number; daily: number; floor: number; floored: boolean; protein: number; fibre: number;
  /** The pace the target really gives, kg a week, after the floor and the 1% of body weight cap. */
  pace: number; days: number;
} | { available: false; reason: 'under-18' | 'missing-details'; missing: string[] };
/**
 * The figures for a goal, target weight and pace. A real account (or real readings on the sample life) gets the
 * engine's (`planTargets`): what your body uses from your profile and health days, the floor, protein and fibre. The
 * sample life keeps the board's maths: 2,800 used, less 1,000 per kilo a week, never under 1,500.
 */
export function figuresFor(data: SeedData, goal: Goal, target: number, pace: number): PlanFigures {
  const kg = data.weightKg;
  if (engineTargets(data)) {
    const t = planTargets({ record: { goal, target_weight: target, pace, exercise_addback: data.prefs.addback ?? null }, profile: bodyProfileRow(data), days: data.health.days, today: dayKey(), health: data.profile.health });
    if (!t.available) return { available: false, reason: t.reason, missing: t.missing };
    return { available: true, uses: t.uses.kcal, change: goal === 'Keep' ? 0 : t.kcal - t.uses.kcal, daily: t.kcal, floor: t.floor, floored: t.floored, protein: t.protein, fibre: t.fibre, pace: Math.abs(t.paceKgPerWeek), days: (t.weeksToGoal ?? 0) * 7 };
  }
  const change = goal === 'Lose' ? -Math.round(pace * 1000) : goal === 'Gain' ? Math.round(pace * 500) : 0;
  const days = goal === 'Keep' || !pace ? 0 : Math.round(Math.abs(kg - target) / pace * 7);
  return { available: true, uses, change, daily: Math.max(kcalFloor, uses + change), floor: kcalFloor, floored: uses + change < kcalFloor, protein: seed.fuel.protein, fibre: seed.fuel.fibre, pace, days };
}
export function usePlan() {
  const { data } = useSeed();
  const goal = (data.choices['fuel-goal'] ?? (SHOW_SAMPLES ? 'Lose' : 'Keep')) as Goal;
  const target = Number(data.choices['target-weight'] ?? (SHOW_SAMPLES ? seed.fuel.targetWeight : data.weightKg));
  const pace = Number(data.choices['fuel-pace'] ?? (SHOW_SAMPLES ? seed.fuel.pace : 0.5));
  const kg = data.weightKg, figures = figuresFor(data, goal, target, pace);
  const days = figures.available ? figures.days : 0;
  const reach = new Date(Date.now() + days * 86400000);
  return { goal, target, pace, kg, days, weeks: Math.ceil(days / 7), reach, figures, daily: figures.available ? figures.daily : 0 };
}

/* ───────────────────────── 1. What can I cook? ───────────────────────── */

export function CookV26() {
  const nav = useNavigation(), t = useTokens(), { data, choose } = useSeed(), day = useFuelDay(), log = useLogMeal();
  const [diet, setDiet] = useState<(typeof cook.diets)[number]>((data.choices['cook-diet'] as (typeof cook.diets)[number]) ?? (SHOW_SAMPLES ? 'Halal' : 'High-protein'));
  const [open, setOpen] = useState(false), [editing, setEditing] = useState(false), [chosen, setChosen] = useState<string | null>(null);
  const found = (data.choices['cook-found'] ?? (SHOW_SAMPLES ? cook.found.join(', ') : '')).split(',').map(s => s.trim()).filter(Boolean);
  const shot = data.choices['cook-photo'];
  const proteinLeft = Math.max(0, Math.round(day.targets.protein - day.totals.protein));
  const fits = cook.recipes.filter(r => r.diets.includes(diet)).sort((a, b) => Number(b.kcal <= day.left) - Number(a.kcal <= day.left) || b.protein - a.protein);
  const best = fits.find(r => r.title === chosen) ?? fits[0], next = fits.filter(r => r !== best);
  const retake = async () => { try { const a = await pickAttachment('camera'); if (a) { choose('cook-photo', a.uri); feedback.select(); } } catch { /* The camera is optional here; the list still works typed. */ } };
  return (
    <Page screen="cook" bar={{ kind: 'push', title: 'What can I cook?', action: { kind: 'icon', icon: 'camera', label: 'Snap the fridge or cupboard again', onPress: () => void retake() } }}>
      <PhotoGrid>
        <PhotoCard source={shot ? { uri: shot } : photos.cook} focal={shot ? undefined : { x: .66, y: .416, zoom: 3.3 }} height={200} size="sm" chips={['Your photo']}
          title={found.length ? `${found.length} things found` : 'Nothing found yet'} sub="Or just say what’s in." onPress={() => setEditing(true)} />
        <TintCard area="home" style={{ minHeight: 200 }} onPress={() => setEditing(true)} accessibilityLabel={`Found in your photo: ${found.join(', ')}`}>
          <Text variant="micro" tone="ink2">Found in your photo</Text>
          <View style={{ marginTop: space.xs }}>{found.slice(0, 7).map(f => <Text key={f} variant="title" style={{ fontSize: 14, lineHeight: 23 }}>{f}</Text>)}</View>
        </TintCard>
      </PhotoGrid>
      {editing ? (
        <Box pad={space.md} style={{ marginTop: space.sm }}>
          <Micro>What’s in, separated by commas</Micro>
          <TextInput maxFontSizeMultiplier={1.3} value={found.join(', ')} onChangeText={v => choose('cook-found', v)} multiline autoFocus style={[styles.input, { color: t.ink, backgroundColor: t.surface2 }]} accessibilityLabel="What’s in your kitchen" />
          <Btn label="Done" sm ghost fit onPress={() => setEditing(false)} style={{ marginTop: space.xs }} />
        </Box>
      ) : null}
      <Shelf style={{ marginTop: space.md }}>
        <FilterChips options={cook.diets.map(d => ({ value: d, label: d }))} value={diet} onChange={v => { setDiet(v); choose('cook-diet', v); setChosen(null); setOpen(false); feedback.select(); }} />
      </Shelf>
      <Statement s={day.hide ? 'Here’s what fits {the rest of today}.' : `Fits what’s left today: {${n(day.left)} kcal} and {${proteinLeft}g protein}.`} style={{ marginTop: space.lg }} />
      {best ? (
        <Box style={{ marginTop: space.md }}>
          <Between><Micro sig>{`Best fit · 1 of ${fits.length}`}</Micro><Chip label={diet} /></Between>
          <Text variant="headline" style={{ marginTop: space.xs }}>{best.title}</Text>
          <Body s={day.hide ? `${best.mins} min` : `${best.mins} min · {${best.kcal} kcal} · {${best.protein}g protein}`} style={{ marginTop: space.xxs }} />
          {open ? (
            <View style={{ marginTop: space.md, gap: space.sm }}>
              {best.steps.map((s, i) => <View key={i} style={styles.step}><View style={[styles.stepNum, { backgroundColor: t.surface2 }]}><Text variant="micro">{i + 1}</Text></View><Text variant="body" style={{ flex: 1 }}>{s}</Text></View>)}
            </View>
          ) : null}
          <Btn label={open ? 'I cooked this' : 'See the recipe'} icon={open ? 'check' : 'arrow'} trail={!open} style={{ marginTop: space.md }}
            onPress={() => { if (!open) { setOpen(true); choose('recipe', best.title); feedback.open(); return; } log({ name: best.title, items: [{ name: best.title, grams: 450, kcal: best.kcal, protein: best.protein, carbs: Math.round(best.kcal * .1), fat: Math.round(best.kcal * .035), fibre: 8, confidence: .7 }], via: 'plan' }); nav.go('mealresult'); }} />
        </Box>
      ) : <Body s="No recipe here fits that diet yet. Try another chip." style={{ marginTop: space.md }} />}
      {next.slice(0, 2).map(r => (
        <Box key={r.title} pad={space.md} style={{ marginTop: space.sm }} onPress={() => { setChosen(r.title); setOpen(false); feedback.select(); }} accessibilityLabel={`${r.title}, ${r.mins} minutes`}>
          <View style={styles.line}>
            <View style={{ flex: 1, minWidth: 0 }}><Text variant="title">{r.title}</Text><Text variant="callout" tone="ink2">{day.hide ? `${r.mins} min` : `${r.mins} min · ${r.kcal} kcal · ${r.protein}g protein`}</Text></View>
            <Chip label={diet} /><Icon name="chev" size={16} color={t.inkQuiet} />
          </View>
        </Box>
      ))}
    </Page>
  );
}

/* ───────────────────────── 2. A week of meals ───────────────────────── */

export function MealplanV26() {
  const nav = useNavigation(), t = useTokens(), { data, flag } = useSeed(), day = useFuelDay(), log = useLogMeal();
  const [mode, setMode] = useState<'Plan' | 'Shopping list'>('Plan');
  const today = new Date(), ti = monIndex(today);
  const days = Array.from({ length: 7 }, (_, k) => { const d = new Date(today.getTime() + k * 86400000); return { d, i: monIndex(d), meals: mealWeek.days[monIndex(d)] }; });
  const tonight = mealWeek.days[ti][2];
  const eat = (name: string, slot: string, key: string) => { flag(key, true); log({ name, items: [{ name, grams: 400, kcal: mealWeek.kcal[slot] ?? 500, protein: slot === 'Breakfast' ? 18 : 34, carbs: 50, fat: 16, fibre: 6, confidence: .7 }], via: 'plan' }); };
  return (
    <Page screen="mealplan" bar={{ kind: 'push', title: 'This week’s meals', action: { kind: 'icon', icon: 'sliders', label: 'Preferences and budget', onPress: () => nav.go('fuelgoal') } }}>
      <SegmentedV26 options={(['Plan', 'Shopping list'] as const).map(v => ({ value: v, label: v }))} value={mode} onChange={v => { setMode(v); feedback.select(); }} />
      {mode === 'Plan' ? <>
        <Statement s={day.hide ? `About {£${mealWeek.cost}} for the week, matched to your plan.` : `About {£${mealWeek.cost}} for the week. Fits {${n(day.target)} kcal} and {${day.targets.protein}g protein}.`} style={{ marginTop: space.lg }} />
        <PhotoCard {...(mealPic({ name: tonight }) ?? { source: photos.cook })} height={190} style={{ marginTop: space.md }}
          chips={[`Tonight · ${DAYS[ti] === 'Mon' ? 'Monday' : today.toLocaleDateString('en-GB', { weekday: 'long' })} dinner`, 'Halal']} title={tonight}
          sub={data.flags[`planned-${dayKey()}-2`] ? 'Logged for tonight.' : 'One tap logs it when you eat it.'}
          onPress={() => { if (!data.flags[`planned-${dayKey()}-2`]) { eat(tonight, 'Dinner', `planned-${dayKey()}-2`); feedback.file(); } }} />
        <SectionHead title="The week" link={`${DAYS[ti]} to ${DAYS[(ti + 6) % 7]}`} />
        <Shelf>
          {days.map(({ d, i, meals }, k) => (
            <View key={k} style={[styles.dayCol, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
              <Between><Text variant="title">{DAYS[i]}</Text><Text variant="callout" tone="ink2">{k === 0 ? 'Today' : shortDate(d)}</Text></Between>
              {(['Breakfast', 'Lunch', 'Dinner'] as const).map((slot, j) => {
                const key = `planned-${dayKey(d)}-${j}`, done = !!data.flags[key];
                return (
                  <Press key={slot} haptic="select" disabled={k !== 0 || done} onPress={() => eat(meals[j], slot, key)} accessibilityLabel={`${slot}: ${meals[j]}${done ? ', logged' : k === 0 ? '. Tap to log' : ''}`} style={{ marginTop: space.sm }}>
                    <Text variant="micro" tone="ink2">{done ? `${slot} · logged` : slot}</Text>
                    <Text variant="title" style={{ fontSize: 14, lineHeight: 20 }}>{meals[j]}</Text>
                  </Press>
                );
              })}
            </View>
          ))}
        </Shelf>
        <Callout style={{ marginTop: space.md }}>Today’s meals log in one tap when you eat them.</Callout>
      </> : <>
        <Statement s={`{${mealWeek.shop.reduce((a, s) => a + s.items.length, 0)} things} for the week, about {£${mealWeek.cost}}.`} style={{ marginTop: space.lg }} />
        {mealWeek.shop.map(s => (
          <View key={s.aisle}>
            <Micro style={{ marginTop: space.lg }}>{s.aisle}</Micro>
            <Box pad={space.md} style={{ marginTop: space.xs }}>
              <CheckRows items={s.items.map(it => ({ label: it, done: !!data.flags[`shop-${it}`] }))} onToggle={i => { flag(`shop-${s.items[i]}`); feedback.select(); }} />
            </Box>
          </View>
        ))}
      </>}
    </Page>
  );
}

/* ───────────────────────── 3. Your food targets ───────────────────────── */

function BigStepper({ value, unit, onChange, step = .5, min = 40, max = 160, label }: { value: number; unit: string; onChange: (v: number) => void; step?: number; min?: number; max?: number; label: string }) {
  const set = (v: number) => { onChange(Math.min(max, Math.max(min, r1(v)))); feedback.select(); };
  return (
    <View style={styles.stepper} accessible accessibilityRole="adjustable" accessibilityLabel={`${label}, ${value} ${unit}`}
      accessibilityActions={[{ name: 'increment' }, { name: 'decrement' }]} onAccessibilityAction={e => set(value + (e.nativeEvent.actionName === 'increment' ? step : -step))}>
      <RoundButton icon="remove" label={`Lower ${label}`} onPress={() => set(value - step)} />
      <Figure value={value % 1 ? value.toFixed(1) : String(value)} unit={unit} size="num" center style={{ minWidth: 120 }} />
      <RoundButton icon="add" label={`Raise ${label}`} onPress={() => set(value + step)} />
    </View>
  );
}

function Sum({ parts }: { parts: [string, string][] }) {
  return (
    <View style={styles.sum}>
      {parts.map(([v, l], i) => (
        <View key={i} style={i % 2 ? { flexShrink: 0 } : { flexDirection: 'row', alignItems: 'flex-start', flex: 1, minWidth: 0 }}>
          {i % 2 ? <Text variant="statement" tone="quiet" style={{ marginHorizontal: 4 }}>{v}</Text> : <View style={{ flex: 1, minWidth: 0 }}><Text variant="statement" style={{ fontVariant: ['tabular-nums'] }}>{v}</Text><Text variant="micro" tone="ink2">{l}</Text></View>}
        </View>
      ))}
    </View>
  );
}

export function FuelgoalV26() {
  const nav = useNavigation(), { data, choose } = useSeed(), plan = usePlan();
  const [goal, setGoal] = useState<Goal>(plan.goal), [target, setTarget] = useState(plan.target), [pace, setPace] = useState(plan.pace);
  const f = figuresFor(data, goal, target, pace), kg = data.weightKg;
  const wrongWay = goal === 'Lose' && target >= kg || goal === 'Gain' && target <= kg;
  const days = f.available ? f.days : 0, reach = new Date(Date.now() + days * 86400000);
  const slower = f.available && goal !== 'Keep' && f.pace < pace - 0.01;
  return (
    <Page screen="fuelgoal" bar={{ kind: 'push', title: 'Targets' }}
      footer={<Btn label="See my plan" disabled={wrongWay || !f.available} onPress={() => { choose('fuel-goal', goal); choose('target-weight', String(target)); choose('fuel-pace', String(pace)); nav.go('fuelplan'); }} />}>
      <SegmentedV26 options={(['Lose', 'Keep', 'Gain'] as const).map(v => ({ value: v, label: v }))} value={goal} onChange={v => { setGoal(v); feedback.select(); }} />
      {goal !== 'Keep' ? <>
        <Eyebrow style={{ justifyContent: 'center', marginTop: space.xl }}>Target weight</Eyebrow>
        <BigStepper value={target} unit="kg" onChange={setTarget} label="target weight" />
        <Eyebrow style={{ justifyContent: 'center', marginTop: space.xl }}>Pace</Eyebrow>
        <WheelPicker options={paces.map(x => x.kg === pace ? `${x.label} · ${x.kg} kg a week` : x.label)} value={Math.max(0, paces.findIndex(x => x.kg === pace))} onChange={i => setPace(paces[i].kg)} label="Pace" style={{ marginTop: space.xs }} />
        <Callout center style={{ marginTop: space.sm }}>{wrongWay ? `Your target is ${goal === 'Lose' ? 'above' : 'below'} your weight now (${kg.toFixed(1)} kg).` : days ? `About ${Math.ceil(days / 7)} weeks, so ${roughly(reach)}.` : 'Life works out how long once your details are in.'}</Callout>
      </> : <Statement s={`Keep about {${kg.toFixed(1)} kg}, with targets that match what your body uses.`} style={{ marginTop: space.xl }} />}
      {f.available ? <>
        <TintCard area="home" style={{ marginTop: space.xl }}>
          <Micro>The maths</Micro>
          <View style={{ marginTop: space.sm }}>
            {f.change ? <Sum parts={[[n(f.uses), 'what your body uses'], [f.change < 0 ? '−' : '+', ''], [n(Math.abs(f.change)), 'for your pace'], ['=', ''], [n(f.daily), 'daily calories']]} />
              : <Sum parts={[[n(f.uses), 'what your body uses'], [f.uses === f.daily ? '=' : '≈', ''], [n(f.daily), 'daily calories']]} />}
          </View>
          <Callout style={{ marginTop: space.md }}>{`Your body uses about ${n(f.uses)} a day, from your height, weight, age and activity. ${goal === 'Lose' ? `${n(Math.abs(f.change))} less loses about ${kiloWords(f.pace)} a week.` : goal === 'Gain' ? `${n(f.change)} more gains about ${kiloWords(f.pace)} a week, gently.` : 'Eating about that keeps you steady.'}${slower ? ' That’s slower than the pace you picked, so your target stays safe.' : ''}`}</Callout>
        </TintCard>
        <TileGrid style={{ marginTop: space.sm }}>
          <V26Tile label="Protein" scale={`${r1(f.protein / kg)} g per kg`} value={String(f.protein)} unit="g" />
          <V26Tile label="Fibre" scale="a day" value={String(f.fibre)} unit="g" />
        </TileGrid>
        <Callout style={{ marginTop: space.md }}>{engineTargets(data) ? `Targets never go below a healthy floor (${n(f.floor)} a day for you), and pace is capped at about 1% of your weight a week.` : `Targets never go below a healthy floor (${n(f.floor)} a day), and pace is capped at three quarters of a kilo a week.`}</Callout>
      </> : f.reason === 'under-18' ? (
        <Callout style={{ marginTop: space.xl }}>Calorie targets are for adults, so Life shows how you’re eating without them.</Callout>
      ) : <>
        <Statement s={`Add your {${f.missing.join(' and ')}} and Life works out the maths for you.`} style={{ marginTop: space.xl }} />
        <Btn label="Add them in Body" ghost fit onPress={() => nav.go('measures')} style={{ marginTop: space.md }} />
      </>}
    </Page>
  );
}

/* ───────────────────────── 4. Your plan is ready ───────────────────────── */

function WeekDots({ count, end, w }: { count: number; end: string; w: number }) {
  const dots = Math.max(2, Math.min(14, count + 1)), h = 76 * w / 330;
  return (
    <Svg width={w} height={h} viewBox="0 0 330 76">
      {Array.from({ length: dots }, (_, k) => { const x = 8 + k * 314 / (dots - 1), y = 26 + k * 29 / (dots - 1); return k === dots - 1 ? <Circle key={k} cx={x} cy={y} r={7} fill="#FF6B3D" /> : <Circle key={k} cx={x} cy={y} r={k ? 4 : 6} fill={photo.onPhoto} opacity={k ? .55 : 1} />; })}
      <SvgText x={2} y={70} fontSize={11} fontWeight="600" fill={photo.onPhoto}>Today</SvgText>
      <SvgText x={328} y={14} textAnchor="end" fontSize={11} fontWeight="600" fill={photo.onPhoto}>{end}</SvgText>
      <SvgText x={328} y={70} textAnchor="end" fontSize={11} fontWeight="600" fill={photo.onPhoto2}>one dot a week</SvgText>
    </Svg>
  );
}

export function FuelplanV26() {
  const nav = useNavigation(), { choose, flag } = useSeed(), plan = usePlan();
  const keep = plan.goal === 'Keep', f = plan.figures, pace = f.available ? f.pace : plan.pace;
  const paceWords = Math.abs(pace - .5) < .03 ? 'half a kilo' : Math.abs(pace - .25) < .03 ? 'a quarter of a kilo' : Math.abs(pace - .75) < .03 ? 'three quarters of a kilo' : `${Math.round(pace * 100) / 100} kg`;
  return (
    <Page screen="fuelplan" bar={{ kind: 'photo' }} contentStyle={{ flexGrow: 1, justifyContent: 'flex-end', paddingBottom: space.sm }}
      backdrop={<View pointerEvents="none" style={StyleSheet.absoluteFill}><PhotoFill source={photos.sky} focal={{ x: .37, y: 0, zoom: 2.9 }} settle /><LinearGradient colors={photoScrims.fade.colors} locations={photoScrims.fade.locations} style={StyleSheet.absoluteFill} /></View>}
      footer={<View style={{ flexDirection: 'row', gap: space.xs }}><Btn label="Adjust" ghost fit onPhoto onPress={nav.close} /><View style={{ flex: 1 }}><Btn label="Start" onPhoto onPress={() => { choose('fuel-kcal', String(plan.daily)); flag('food-plan-set', true); feedback.complete(); nav.replace('fuel'); }} /></View></View>}>
      <LifeOrb size={56} state="done" color={photo.onPhoto} />
      <Text variant="welcome" style={{ color: photo.onPhoto, marginTop: space.lg }}>Your plan is ready.</Text>
      <Statement onPhoto s={keep ? `You’ll keep about {${plan.kg.toFixed(1)} kg}, eating about what your body uses.` : `At ${paceWords} a week you’d reach {${plan.target} kg} around {${longDate(plan.reach)}}.`} style={{ marginTop: space.sm }} />
      {keep ? null : <Measure height={76} style={{ marginTop: space.xl }} label={`${plan.weeks} weeks from today to ${plan.target} kg, around ${longDate(plan.reach)}`}>{w => <WeekDots w={w} count={plan.weeks} end={`${shortDate(plan.reach)} · ${plan.target} kg`} />}</Measure>}
      <View style={[styles.fields, { marginTop: space.lg }]}>
        {[['Calories', n(plan.daily)], ['Protein', `${f.available ? f.protein : seed.fuel.protein} g`], ['Fibre', `${f.available ? f.fibre : seed.fuel.fibre} g`]].map(([l, v]) => (
          <View key={l} style={[styles.field, { backgroundColor: photo.fill }]}><Text variant="micro" style={{ color: photo.onPhoto2 }}>{l}</Text><Text variant="headline" style={{ color: photo.onPhoto }}>{v}</Text></View>
        ))}
      </View>
      <Text variant="callout" style={{ color: photo.onPhoto2, marginTop: space.md }}>You can change your goal or pace any time. Targets never go below a healthy floor.</Text>
    </Page>
  );
}

/* ───────────────────────── 5. Food and weight, over time ───────────────────────── */

type MonthCell = 'blank' | 'on' | 'off' | 'today' | 'ahead';
function MonthDays({ cells, label }: { cells: MonthCell[]; label: string }) {
  const t = useTokens();
  return (
    <Measure height={Math.ceil(cells.length / 7) * 44 + 20} label={label}>
      {w => {
        const gap = 6, size = (w - gap * 6) / 7;
        return (
          <View>
            <View style={{ flexDirection: 'row', gap }}>{WEEK.map((d, i) => <Text key={i} variant="micro" tone="quiet" align="center" style={{ width: size }}>{d}</Text>)}</View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap, marginTop: space.xs }}>
              {cells.map((c, i) => <View key={i} style={{ width: size, height: Math.min(size, 38), borderRadius: radius.full, opacity: c === 'blank' ? 0 : c === 'ahead' ? .45 : 1, backgroundColor: c === 'on' ? t.ink : c === 'today' ? t.surface : c === 'off' ? t.surface3 : t.surface2, borderWidth: c === 'today' ? 2 : 0, borderColor: t.ember }} />)}
            </View>
          </View>
        );
      }}
    </Measure>
  );
}

/** Food and weight over time. The sample life keeps the board's six weeks; a real account sees its own weigh-ins and meals. */
export function FuelprogressV26() {
  return SHOW_SAMPLES ? <FuelprogressSampleV26 /> : <FuelprogressRealV26 />;
}

function MonthLegend() {
  const t = useTokens();
  return (
    <View style={{ flexDirection: 'row', gap: space.sm }}>
      <View style={styles.legend}><View style={[styles.legendDot, { backgroundColor: t.ink }]} /><Text variant="callout" tone="ink2">Close</Text></View>
      <View style={styles.legend}><View style={[styles.legendDot, { backgroundColor: t.surface3 }]} /><Text variant="callout" tone="ink2">Further off</Text></View>
    </View>
  );
}

function FuelprogressRealV26() {
  const { data } = useSeed(), day = useFuelDay(), { accent } = useAreaTint('health');
  const w = weighIns(data), kg = data.weightKg, first = w[0];
  const change = first && w.length > 1 ? r1(w[w.length - 1].kg - first.kg) : null;
  const now = new Date(), start = new Date(now.getFullYear(), now.getMonth(), 1), last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  // A day is close when what you logged is within a tenth of your target. A day with nothing logged is never close.
  const close = (key: string) => { const e = eatenOn(data, key); return e > 0 && day.target > 0 && Math.abs(e - day.target) <= day.target * .1; };
  const cells: MonthCell[] = [...Array(monIndex(start)).fill('blank'), ...Array.from({ length: last }, (_, k) => k + 1 < now.getDate() ? (close(dayKey(new Date(now.getFullYear(), now.getMonth(), k + 1))) ? 'on' : 'off') as MonthCell : k + 1 === now.getDate() ? 'today' : 'ahead')];
  const recent = Array.from({ length: 14 }, (_, k) => eatenOn(data, dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - k)))).filter(e => e > 0);
  const average = recent.length ? Math.round(recent.reduce((a, b) => a + b, 0) / recent.length) : 0;
  const values = w.slice(-28).map(x => x.kg);
  const smooth = values.map((_, k) => { const run = values.slice(Math.max(0, k - 3), k + 1); return run.reduce((a, v) => a + v, 0) / run.length; });
  const share = change === null ? undefined : async () => { try { await Share.share({ message: `${change <= 0 ? 'Down' : 'Up'} ${Math.abs(change)} kg since ${dayWords(first.day)}.` }); } catch { /* Sharing is optional. */ } };
  return (
    <Page screen="fuelprogress" bar={{ kind: 'push', title: 'Progress', action: share ? { kind: 'icon', icon: 'arrowUp', label: 'Share', onPress: () => void share() } : undefined }}>
      {change !== null ? <>
        <Eyebrow>{`${change <= 0 ? 'Down' : 'Up'} since ${dayWords(first.day)}`}</Eyebrow>
        <Figure value={String(Math.abs(change))} unit="kg" style={{ marginTop: 6 }} />
      </> : <Display s="{Your progress starts here.} Weigh in on a few mornings and log your meals, and Life draws the trend." />}
      {values.length > 1 ? (
        <TintCard area="health" style={{ marginTop: space.lg }}>
          <Between><Text variant="title">Weight trend</Text><Text variant="callout" tone="ink2">{`${kg.toFixed(1)} kg now`}</Text></Between>
          <View style={{ marginTop: space.sm }}><BandLine values={values} normal={[smooth.map(v => r1(v - .3)), smooth.map(v => r1(v + .3))]} height={120} color={accent} bandColor={accent} bandOpacity={.2} label={`Your ${values.length} weigh-ins since ${dayWords(first.day)}`} /></View>
          <Axis labels={[dayWords(w[Math.max(0, w.length - 28)].day), 'Latest']} lastInk />
          <Callout style={{ marginTop: space.xs }}>Daily numbers move about. The pale band is your trend, give or take a normal day.</Callout>
        </TintCard>
      ) : null}
      {average ? (
        <TileGrid style={{ marginTop: space.sm }}>
          <V26Tile label="Average" scale={day.target ? `/${n(day.target)}` : undefined} value={n(average)} unit="kcal" sub={`a day, over ${recent.length} logged ${recent.length === 1 ? 'day' : 'days'}`} />
          <V26Tile label="Weigh-ins" value={String(w.length)} sub={first ? `since ${dayWords(first.day)}` : 'none yet'} />
        </TileGrid>
      ) : null}
      <Box style={{ marginTop: space.sm }}>
        <Between><Text variant="title">{now.toLocaleDateString('en-GB', { month: 'long' })}</Text><MonthLegend /></Between>
        <View style={{ marginTop: space.md }}><MonthDays cells={cells} label="How close each day this month was to your target" /></View>
        <Callout style={{ marginTop: space.sm }}>How close each day you logged was to your target. No day is marked as bad. Today is ringed.</Callout>
      </Box>
    </Page>
  );
}

function FuelprogressSampleV26() {
  const { data } = useSeed(), plan = usePlan(), { accent } = useAreaTint('health'), t = useTokens();
  const kg = data.weightKg, start = progress.startWeight, down = r1(start - kg);
  const trend = [...seed.health.weightTrend.slice(0, -1), kg];
  // Where a safe pace (a quarter to three quarters of a kilo a week) would have you each week since you began.
  const at = (k: number) => k / Math.max(1, trend.length - 1) * progress.weeks;
  const band: [number[], number[]] = [trend.map((_, k) => r1(start - .75 * at(k))), trend.map((_, k) => r1(start - .25 * at(k)))];
  const wk = weightWeekChange, pace = plan.pace;
  const vsPlan = Math.abs(wk) > pace * 1.1 ? 'a bit faster than planned' : Math.abs(wk) < pace * .8 ? 'a little slower than planned' : 'right on plan';
  const now = new Date(), first = new Date(now.getFullYear(), now.getMonth(), 1), last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const cells: MonthCell[] = [...Array(monIndex(first)).fill('blank'), ...Array.from({ length: last }, (_, k) => k + 1 < now.getDate() ? (SHOW_SAMPLES ? (progress.close[k % progress.close.length] === '1' ? 'on' : 'off') : 'off') as MonthCell : k + 1 === now.getDate() ? 'today' : 'ahead')];
  const share = async () => { try { await Share.share({ message: `Down ${down} kg since ${progress.since}, about ${pace} kg a week.` }); } catch { /* Sharing is optional. */ } };
  return (
    <Page screen="fuelprogress" bar={{ kind: 'push', title: 'Progress', action: { kind: 'icon', icon: 'arrowUp', label: 'Share', onPress: () => void share() } }}>
      <Between><Eyebrow>{`Down since ${progress.since}`}</Eyebrow>{plan.goal !== 'Keep' ? <Chip label={`On track · ${shortDate(plan.reach)}`} tone="done" /> : null}</Between>
      <Figure value={String(down)} unit="kg" style={{ marginTop: 6 }} />
      <Statement s={`You’ve averaged {${n(progress.averageKcal)} kcal} a day, and your trend has followed.`} style={{ marginTop: space.sm }} />
      <TintCard area="health" style={{ marginTop: space.lg }}>
        <Between><Text variant="title">Weight trend</Text><Text variant="callout" tone="ink2">{`${kg.toFixed(1)} kg now`}</Text></Between>
        <View style={{ marginTop: space.sm }}><BandLine values={trend} normal={band} height={120} color={accent} bandColor={accent} bandOpacity={.2} label="Weight trend since October, inside the range a safe pace would give" /></View>
        <Axis labels={['Early Oct', 'Today']} lastInk />
        <Callout style={{ marginTop: space.xs }}>The pale band is where a safe pace, a quarter to three quarters of a kilo a week, would have you by now.</Callout>
      </TintCard>
      <TileGrid style={{ marginTop: space.sm }}>
        <V26Tile label="Average" scale={`/${n(seed.fuel.kcal)}`} value={n(progress.averageKcal)} unit="kcal" sub="eaten a day" />
        <V26Tile label="This week" scale="trend" value={`${wk < 0 ? '−' : '+'}${Math.abs(wk)}`} unit="kg" sub={vsPlan} />
      </TileGrid>
      <Box style={{ marginTop: space.sm }}>
        <Between><Text variant="title">{now.toLocaleDateString('en-GB', { month: 'long' })}</Text>
          <View style={{ flexDirection: 'row', gap: space.sm }}>
            <View style={styles.legend}><View style={[styles.legendDot, { backgroundColor: t.ink }]} /><Text variant="callout" tone="ink2">Close</Text></View>
            <View style={styles.legend}><View style={[styles.legendDot, { backgroundColor: t.surface3 }]} /><Text variant="callout" tone="ink2">Further off</Text></View>
          </View>
        </Between>
        <View style={{ marginTop: space.md }}><MonthDays cells={cells} label="How close each day this month was to your target" /></View>
        <Callout style={{ marginTop: space.sm }}>How close each day was to your target. No day is marked as bad. Today is ringed.</Callout>
      </Box>
    </Page>
  );
}

/* ───────────────────────── 6. Exercise, added back ───────────────────────── */

export function ExerciseaddV26() {
  const nav = useNavigation(), t = useTokens(), { data, pref } = useSeed(), day = useFuelDay();
  const params = useLocalSearchParams<{ state?: string }>();
  const choice = params.state === 'none' ? 'None' : params.state === 'all' ? 'All' : data.prefs.addback;
  const share = choice === 'All' ? 1 : choice === 'Half' ? .5 : 0;
  const back = (v: number) => `+${n(v * share)}`;
  const workouts = SHOW_SAMPLES ? watchToday : [];
  const moving = Math.max(0, day.watch - workouts.reduce((a, w) => a + w.kcal, 0));
  const why = ['Workouts won’t change today’s calories. Your target stays as it is.', 'Watches often overestimate, so {half} is the safer default.', 'Everything your watch counts comes back. Watches often {overestimate}.'][share === 1 ? 2 : share ? 1 : 0];
  const [walk, ride] = workouts;
  return (
    <Page screen="exerciseadd" bar={{ kind: 'push', title: 'Exercise calories' }}>
      <Eyebrow>Added back to today</Eyebrow>
      <View style={styles.betweenEnd}>
        <Figure value={back(day.burned)} unit="kcal" />
        <Text variant="callout" tone="ink2" style={{ marginBottom: space.xs }}>{day.burned ? `Your watch says ${n(day.watch)}${day.described ? `, plus ${n(day.described)} you described` : ''}` : 'Nothing counted yet today'}</Text>
      </View>
      <Statement s={why} style={{ marginTop: space.sm }} />
      <SegmentedV26 options={(['None', 'Half', 'All'] as const).map(v => ({ value: v, label: v }))} value={choice} onChange={v => { pref('addback', v); feedback.select(); }} style={{ marginTop: space.lg }} />
      {walk || ride ? (
        <PhotoGrid style={{ marginTop: space.md }}>
          {walk ? <PhotoCard source={photos.walk} focal={{ x: .56, y: .5, zoom: 1.3 }} height={180} size="md" chips={[`${walk.what} · ${walk.mins} min`]} title={`${back(walk.kcal)} kcal`} sub={`Watch says ${walk.kcal} kcal`} /> : null}
          {ride ? (
            <TintCard area="health" style={{ minHeight: 180 }}>
              <Between><Text variant="micro" tone="ink2">{`${ride.what} · ${ride.mins} min`}</Text><Icon name="fitness" size={18} color={t.ink} /></Between>
              <View style={{ flex: 1 }} />
              <Text variant="headline">{`${back(ride.kcal)} kcal`}</Text>
              <Text variant="callout" tone="ink2">{`Watch says ${ride.kcal} kcal`}</Text>
            </TintCard>
          ) : null}
        </PhotoGrid>
      ) : null}
      {moving || day.described ? (
        <RowsCard style={{ marginTop: space.sm }}>
          {moving ? <Row icon="walk" title="Moving about" sub={`${n(seed.health.steps)} steps · watch says ${n(moving)} kcal`} end={back(moving)} /> : null}
          {day.described ? <Row icon="fitness" title={data.choices['described-name'] ?? 'Workout you described'} sub={`About ${n(day.described)} kcal`} end={back(day.described)} /> : null}
        </RowsCard>
      ) : null}
      <Callout style={{ marginTop: space.md }}>Shown plainly, so the counter never feels like magic. You can change this any time.</Callout>
      <Btn label="Describe a workout" icon="mic" ghost onPress={() => nav.go('describeexercise')} style={{ marginTop: space.md }} />
    </Page>
  );
}

/* ───────────────────────── 7. Describe a workout ───────────────────────── */

const METS: { re: RegExp; name: string; met: [number, number, number] }[] = [
  { re: /five-a-side|football|soccer/, name: 'Football (five-a-side)', met: [5, 7, 9] },
  { re: /run|jog/, name: 'Run', met: [7, 9.8, 11.5] },
  { re: /cycl|bike|ride|spin/, name: 'Cycling', met: [4, 6.8, 10] },
  { re: /swim/, name: 'Swim', met: [5, 7, 9.8] },
  { re: /gym|weights|lift|strength/, name: 'Strength training', met: [3.5, 5, 6] },
  { re: /yoga|pilates|stretch/, name: 'Yoga', met: [2.5, 3, 4] },
  { re: /tennis|padel|squash|badminton/, name: 'Racket sport', met: [5, 7, 8.5] },
  { re: /walk|hike/, name: 'Walk', met: [2.8, 3.5, 5] },
  { re: /danc/, name: 'Dancing', met: [4, 5.5, 7.5] },
];
const LEVELS = ['Light', 'Moderate', 'Vigorous'] as const;
/** Minutes, intensity and the activity, read from a sentence: "30 minutes of five-a-side, quite hard". */
export function readWorkout(text: string, kg: number) {
  const s = text.toLowerCase();
  const hrs = /(\d+(?:\.\d+)?)\s*(?:hours?|hrs?|h\b)/.exec(s), mins = /(\d+)\s*(?:minutes?|mins?|m\b)/.exec(s);
  const minutes = (hrs ? Number(hrs[1]) * 60 : 0) + (mins ? Number(mins[1]) : 0) || 30;
  const level = /hard|vigorous|intense|fast|sprint|tough|flat out/.test(s) ? 2 : /easy|gentle|light|slow|relaxed/.test(s) ? 0 : 1;
  const kind = METS.find(m => m.re.test(s));
  const met = kind ? kind.met[level] : [3, 5, 8][level];
  const kcal = Math.round(met * kg * minutes / 60 / 10) * 10;
  return { name: kind?.name ?? 'Activity', minutes, level, kcal, load: r1(met * minutes / 60 * 2.1) };
}

export function DescribeexerciseV26() {
  const nav = useNavigation(), t = useTokens(), { data, choose, flag, pref } = useSeed(), day = useFuelDay();
  const [text, setText] = useState(data.choices['described-exercise'] ?? (SHOW_SAMPLES ? '30 minutes of five-a-side, quite hard' : ''));
  const [typing, setTyping] = useState(!text);
  const w = readWorkout(text, data.weightKg);
  const share = data.prefs.addback === 'All' ? 1 : data.prefs.addback === 'Half' ? .5 : 0;
  const add = () => {
    const today = dayKey(), before = data.choices['described-day'] === today ? Number(data.choices['described-kcal'] ?? 0) || 0 : 0;
    choose('described-exercise', text); choose('described-name', `${w.name} · ${w.minutes} min`); choose('described-kcal', String(before + w.kcal)); choose('described-day', today);
    flag('described-exercise-added', true); feedback.file(); nav.close();
  };
  return (
    <Page screen="describeexercise" bar={{ kind: 'sheet', title: 'Add activity' }} footer={<Btn label="Add it" disabled={!text.trim()} onPress={add} />}>
      {typing
        ? <TextInput maxFontSizeMultiplier={1.3} value={text} onChangeText={setText} onBlur={() => { if (text.trim()) setTyping(false); }} autoFocus={!text} multiline placeholder="30 minutes of five-a-side, quite hard" placeholderTextColor={t.inkQuiet}
            style={[styles.input, { color: t.ink, backgroundColor: t.surface2 }]} accessibilityLabel="Describe your workout" />
        : <Press haptic="select" onPress={() => setTyping(true)} accessibilityLabel={`${text}. Tap to change`} style={{ alignItems: 'flex-end' }}><ChatBubble text={text} /></Press>}
      {text.trim() ? <>
        <LifeSays style={{ marginTop: space.lg }}>Here’s what I worked out. Change anything that’s off.</LifeSays>
        <TintCard area="goal" style={{ marginTop: space.sm }}>
          <Text variant="headline">{w.name}</Text>
          <View style={[styles.wrap, { marginTop: space.xs }]}>
            <Chip label={`${w.minutes} min`} onPress={() => setTyping(true)} />
            <Chip label={LEVELS[w.level]} onPress={() => { const next = LEVELS[(w.level + 1) % 3].toLowerCase(); setText(`${text.replace(/,?\s*(quite |very )?(hard|vigorous|intense|easy|gentle|light|moderate|steady)\b/gi, '')}, ${next === 'vigorous' ? 'quite hard' : next === 'light' ? 'easy' : 'steady'}`); feedback.select(); }} />
          </View>
          <View style={[styles.betweenEnd, { marginTop: space.lg }]}>
            <View><Eyebrow>Estimated</Eyebrow>{day.hide ? <Text variant="headline">{LEVELS[w.level]} effort</Text> : <Figure value={`~${n(w.kcal)}`} unit="kcal" style={{ marginTop: space.xxs }} />}</View>
            <View style={{ alignItems: 'flex-end', marginBottom: 6 }}><Text variant="callout" tone="ink2">Load</Text><Text variant="headline">{w.load}</Text></View>
          </View>
        </TintCard>
        <Box pad={space.md} style={{ marginTop: space.sm }}>
          <Between><Text variant="title">Added back to Fuel</Text><Text variant="title">{day.hide ? data.prefs.addback : `+${n(w.kcal * share)} kcal`}</Text></Between>
          <SegmentedV26 options={(['None', 'Half', 'All'] as const).map(v => ({ value: v, label: v }))} value={data.prefs.addback} onChange={v => { pref('addback', v); feedback.select(); }} style={{ marginTop: space.sm }} />
        </Box>
        <Callout style={{ marginTop: space.sm }}>An estimate from standard activity tables, not a measurement.</Callout>
      </> : <Body s="Say what you did, how long, and how hard it felt." style={{ marginTop: space.md }} />}
    </Page>
  );
}

/* ───────────────────────── 8. Log your weight ───────────────────────── */

export function WeighinV26() {
  const nav = useNavigation(), { data, set, choose } = useSeed(), plan = usePlan(), { accent } = useAreaTint('health'), t = useTokens();
  const [kg, setKg] = useState(r1(data.weightKg || 70));
  // The sample life draws the board's fortnight under today's weight. A real account draws only the weigh-ins it logged.
  const real = weighIns(data).slice(-14);
  const lastTrend = weightDays[weightDays.length - 1].trend, offset = data.weightKg - lastTrend;
  const days = SHOW_SAMPLES ? weightDays.slice(-14).map(d => r1(d.day + offset)) : real.map(w => w.kg), trendNow = r1(data.weightKg);
  // The trend under the daily numbers (an average of the last few days), so the band follows it day by day.
  const smooth = days.map((_, k) => { const run = days.slice(Math.max(0, k - 3), k + 1); return run.reduce((a, v) => a + v, 0) / run.length; });
  // This week's change: the sample's, or a real account's latest weigh-in against the last one at least six days before it.
  const latest = real[real.length - 1], before = latest ? [...real].reverse().find(w => (Date.parse(latest.day) - Date.parse(w.day)) / 86400000 >= 6) : undefined;
  const wk = SHOW_SAMPLES ? weightWeekChange : latest && before ? r1(latest.kg - before.kg) : null, pace = plan.pace;
  const words = wk === null ? '' : Math.abs(wk) > pace * 1.1 ? 'A bit faster than planned, which is fine.' : Math.abs(wk) < pace * .8 ? 'A little slower than planned, which is fine.' : 'Right on plan.';
  const log = () => { set({ weightKg: kg }); choose('weighed-day', dayKey()); choose(`weight-${dayKey()}`, String(kg)); feedback.file(); nav.close(); };
  return (
    <Page screen="weighin" bar={{ kind: 'sheet', title: 'Weight' }} footer={<Btn label="Log it" onPress={log} />}>
      <Between><Eyebrow>Your trend</Eyebrow>{plan.goal !== 'Keep' ? <Chip label={SHOW_SAMPLES ? `On track · ${shortDate(plan.reach)}` : `Target · ${shortDate(plan.reach)}`} tone={SHOW_SAMPLES ? 'done' : 'q'} /> : null}</Between>
      {data.weightKg ? <Figure value={trendNow.toFixed(1)} unit="kg" style={{ marginTop: 6 }} /> : <Display s="{Your first weigh-in.} Life keeps one a day and draws your trend." />}
      {wk !== null ? <Body s={`${wk <= 0 ? 'Down' : 'Up'} {${Math.abs(wk)}} this week.${plan.goal !== 'Keep' ? ` ${words}` : ''}`} style={{ marginTop: space.xs }} /> : null}
      {days.length > 1 ? <TintCard area="health" style={{ marginTop: space.md }}>
        <BandLine values={days} normal={[smooth.map(v => r1(v - .3)), smooth.map(v => r1(v + .3))]} height={112} color={accent} bandColor={accent} bandOpacity={.2} label={SHOW_SAMPLES ? 'Daily weigh-ins over 14 days against your trend' : `Your last ${days.length} weigh-ins against your trend`} />
        <Axis labels={SHOW_SAMPLES ? ['2 weeks ago', 'This morning'] : [dayWords(real[0].day), 'Latest']} lastInk />
        <Callout style={{ marginTop: space.xs }}>Daily numbers move about. The pale band is your trend, give or take a normal day.</Callout>
      </TintCard> : null}
      <Box pad={space.md} style={{ marginTop: space.sm }}>
        <Between>
          <RoundButton icon="remove" label="Lower" onPress={() => { setKg(v => r1(v - .1)); feedback.select(); }} />
          <View style={{ alignItems: 'center' }} accessible accessibilityLabel={`This morning, ${kg.toFixed(1)} kilograms`}>
            <Micro center>This morning</Micro>
            <Figure value={kg.toFixed(1)} unit="kg" size="num" center style={{ marginTop: space.xxs }} />
          </View>
          <RoundButton icon="add" label="Higher" onPress={() => { setKg(v => r1(v + .1)); feedback.select(); }} />
        </Between>
      </Box>
    </Page>
  );
}

/* ───────────────────────── 9. Nutrients ───────────────────────── */

function Nut({ name, value, pct, note, sig }: { name: string; value: string; pct: number; note?: string; sig?: boolean }) {
  const t = useTokens();
  return (
    <View style={{ paddingVertical: space.tile }}>
      <Between>
        <View style={styles.legend}>{sig ? <View style={[styles.sig, { backgroundColor: t.ember }]} /> : null}<Text variant="title" style={{ fontSize: 15 }}>{name}</Text></View>
        <Text variant="callout" tone="ink2" style={{ fontVariant: ['tabular-nums'] }}>{value}</Text>
      </Between>
      <Ruler pct={pct} bars={30} style={{ marginTop: space.xs }} />
      {note ? <Callout style={{ marginTop: space.xs }}>{note}</Callout> : null}
    </View>
  );
}

export function NutrientsV26() {
  const nav = useNavigation(), day = useFuelDay();
  const fibre = Math.round(day.totals.fibre), notes: Record<string, string> = { Sugar: 'Free sugars: 22 g of 30 g', Iron: 'Low most days: add beans, lentils or greens', 'Vitamin D': 'Normal in winter: a supplement is advised Oct–Mar' };
  const v = (x: { value: number; max: number; unit: string }) => `${x.value} / ${x.max} ${x.unit}`;
  return (
    <Page screen="nutrients" bar={{ kind: 'push', title: 'Nutrients', action: info('About reference intakes', () => nav.go('math')) }}>
      <Eyebrow>Everything you ate today</Eyebrow>
      <Display s={SHOW_SAMPLES ? '{Iron} has been low most days. Add {beans, lentils or greens}.' : `{Fibre} is at ${fibre} g of ${day.targets.fibre} g today. Beans, oats and greens all help.`} />
      <Box pad={space.md} style={{ marginTop: space.lg }} onPress={() => nav.go('cook')} accessibilityLabel="Beans, lentils or greens. Good sources of iron.">
        <View style={styles.line}>
          <View style={styles.thumb56}><PhotoFill source={photos.cook} focal={{ x: .77, y: .705, zoom: 3.4 }} /></View>
          <View style={{ flex: 1 }}><Text variant="title">Beans, lentils or greens</Text><Text variant="callout" tone="ink2">Good sources of iron, and easy to add at dinner.</Text></View>
        </View>
      </Box>
      <Box style={{ marginTop: space.sm }}>
        <Micro>Today</Micro>
        {day.hide ? <Body s={`Fibre is ${fibre >= day.targets.fibre * .5 ? 'over halfway' : 'under half'}. Keep a range of foods across the day.`} style={{ marginTop: space.xs }} /> : <>
          <Nut name="Fibre" value={`${fibre} / ${day.targets.fibre} g`} pct={ruled(fibre, day.targets.fibre)} />
          {SHOW_SAMPLES ? nutrientsToday.map(x => <Nut key={x.label} name={x.label} value={v(x)} pct={ruled(x.value, x.max)} note={notes[x.label]} />) : null}
        </>}
      </Box>
      {SHOW_SAMPLES ? (
        <Box style={{ marginTop: space.sm }}>
          <Micro>This week, on average</Micro>
          {nutrientsWeek.map(x => day.hide
            ? <Body key={x.label} s={`{${x.label}}: ${notes[x.label] ?? 'fine, keep a varied diet'}.`} style={{ marginTop: space.xs }} />
            : <Nut key={x.label} name={x.label} value={v(x)} pct={ruled(x.value, x.max)} note={notes[x.label]} sig={x.label === 'Iron'} />)}
        </Box>
      ) : null}
      <Callout style={{ marginTop: space.md }}>Reference intakes for adults (UK). Not medical advice.</Callout>
    </Page>
  );
}

/* ───────────────────────── 10. Your week ───────────────────────── */

/** The week's calories. The sample life keeps the board's week and birthday; a real account sees what it logged. */
export function WeekbudgetV26() {
  return SHOW_SAMPLES ? <WeekbudgetSampleV26 /> : <WeekbudgetRealV26 />;
}

function RolloverBox() {
  const { data, flag } = useSeed();
  return (
    <Box pad={space.md} style={{ marginTop: space.sm }}>
      <Between>
        <View style={{ flex: 1, minWidth: 0 }}><Text variant="title">Carry unused calories to the weekend</Text><Text variant="callout" tone="ink2">Your choice. Off until you turn it on.</Text></View>
        <SwitchV26 value={!!data.flags['calorie-rollover']} onChange={v => { flag('calorie-rollover', v); feedback.select(); }} accessibilityLabel="Carry unused calories to the weekend" />
      </Between>
    </Box>
  );
}

function WeekbudgetRealV26() {
  const { data } = useSeed(), day = useFuelDay(), { accent } = useAreaTint('home');
  const now = new Date(), ti = monIndex(now);
  const keys = Array.from({ length: 7 }, (_, k) => dayKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - ti + k)));
  const logged = keys.map((k, i) => i <= ti ? eatenOn(data, k) : 0);
  const eaten = logged.reduce((a, b) => a + b, 0), budget = day.target * 7, soFar = day.target * (ti + 1);
  const onTrack = Math.abs(eaten - soFar) <= soFar * .05;
  // Days so far are what you logged; the days ahead are your daily target.
  const values = keys.map((_, i) => i <= ti ? logged[i] : day.target);
  const ahead = ti === 6 ? '' : ti === 5 ? ' Sunday is your target.' : ` ${FULL_DAYS[ti + 1]} to Sunday are your target.`;
  const show = eaten > 0 && day.target > 0;
  return (
    <Page screen="weekbudget" bar={{ kind: 'push', title: 'This week' }}>
      <Between><Eyebrow>Week so far</Eyebrow>{show ? <Chip label={onTrack ? 'On track' : eaten > soFar ? 'A little over' : 'Room to spare'} tone={onTrack ? 'done' : 'q'} /> : null}</Between>
      {!day.target ? <Display s="{No target yet.} Add your height and weight, and Life sets one for each day." />
        : !eaten ? <Display s="{Nothing logged this week.} The week’s total builds as you log meals." />
        : day.hide ? <Display s="{Your week so far,} one day at a time." /> : <Figure value={n(eaten)} unit={`/ ${n(budget)} kcal`} style={{ marginTop: 6 }} />}
      {show ? (
        <TintCard area="home" style={{ marginTop: space.lg }}>
          <CapsuleBars values={values} labels={WEEK} now={ti} height={132} color={accent} dim={.35} label={`Calories by day this week: what you logged to ${FULL_DAYS[ti]}, then your target`} />
          <Callout style={{ marginTop: space.xs }}>{`${ti ? `Monday to ${FULL_DAYS[ti]} are` : 'Monday is'} what you logged.${ahead}`}</Callout>
        </TintCard>
      ) : null}
      <RolloverBox />
    </Page>
  );
}

function WeekbudgetSampleV26() {
  const day = useFuelDay(), { accent } = useAreaTint('home');
  const budget = day.target * 7, eaten = week.eaten.reduce((a, b) => a + b, 0), soFar = day.target * week.eaten.length;
  const onTrack = Math.abs(eaten - soFar) <= soFar * .05;
  const values = [...week.eaten, ...week.plan];
  return (
    <Page screen="weekbudget" bar={{ kind: 'push', title: 'This week' }}>
      <Between><Eyebrow>Week so far</Eyebrow><Chip label={onTrack ? 'On track' : eaten > soFar ? 'A little over' : 'Room to spare'} tone={onTrack ? 'done' : 'q'} /></Between>
      {day.hide ? <Display s="A steady week, with {Saturday} planned a little bigger." /> : <Figure value={n(eaten)} unit={`/ ${n(budget)} kcal`} style={{ marginTop: 6 }} />}
      <TintCard area="home" style={{ marginTop: space.lg }}>
        <CapsuleBars values={values} labels={WEEK} now={5} height={132} color={accent} dim={.35} label="Calories by day this week, with Saturday planned higher and Sunday lighter" />
        <Callout style={{ marginTop: space.xs }}>Monday to Friday are eaten. Saturday and Sunday are the plan.</Callout>
      </TintCard>
      <PhotoCard source={photos.birthday} focal={{ x: .55, y: .62, zoom: 1 }} height={176} size="md" style={{ marginTop: space.sm }} chips={[week.birthday]}
        title="Saturday is a birthday dinner" sub={`Life will keep Sunday about ${n(day.target - week.plan[1])} lighter, so the week still balances.`} />
      <RolloverBox />
    </Page>
  );
}

/* ───────────────────────── 11. Meals and your sleep ───────────────────────── */

type Window = [string, number, number];
function WindowChart({ w, days, late }: { w: number; days: Window[]; late: number }) {
  const t = useTokens(), { accent } = useAreaTint('work');
  const x = (h: number) => 36 + (Math.max(6, Math.min(24, h)) - 6) * 254 / 18, gx = x(late), k = w / 290;
  return (
    <Svg width={w} height={196 * k} viewBox="0 0 290 196">
      {Array.from({ length: 20 }, (_, i) => <Circle key={i} cx={gx} cy={20 + i * 8} r={1.3} fill={t.inkQuiet} />)}
      <Circle cx={gx} cy={8} r={3.5} fill={t.ember} />
      <SvgText x={gx - 8} y={12} textAnchor="end" fontSize={11} fontWeight="600" fill={t.ink}>{`${late}:00`}</SvgText>
      {days.map(([d, a, b], i) => { const after = b > late, y = 24 + i * 22; return (
        <G key={`${d}-${i}`}>
          <SvgText x={0} y={y + 9} fontSize={11} fontWeight="600" fill={after ? t.ink : t.ink2}>{d}</SvgText>
          <Rect x={x(a)} y={y} width={Math.max(10, x(b) - x(a))} height={10} rx={5} fill={accent} opacity={after ? 1 : .4} />
        </G>
      ); })}
      {([['06:00', 36, 'start'], ['15:00', x(15), 'middle'], ['24:00', 290, 'end']] as const).map(([l, px, a]) => <SvgText key={l} x={px} y={192} textAnchor={a} fontSize={11} fontWeight="600" fill={t.inkQuiet}>{l}</SvgText>)}
    </Svg>
  );
}

function WindowBox({ label, days = timing.days, late = timing.late }: { label: string; days?: Window[]; late?: number }) {
  const [w, onLayout] = useWidth();
  return <View onLayout={onLayout} style={{ height: w ? 196 * w / 290 : 200, marginTop: space.sm }} accessible accessibilityRole="image" accessibilityLabel={label}>{w ? <WindowChart w={w} days={days} late={late} /> : null}</View>;
}

/** Meals and sleep. The sample life's pattern is the board's; a real account sees its eating window, and no link to sleep is claimed. */
export function MealtimingV26() {
  return SHOW_SAMPLES ? <MealtimingSampleV26 /> : <MealtimingRealV26 />;
}

function MealtimingRealV26() {
  const { data } = useSeed(), days = eatingWindows(data);
  return (
    <Page screen="mealtiming" bar={{ kind: 'push', title: 'Meal timing' }}>
      <Eyebrow>Meals and your sleep</Eyebrow>
      <Display s={days.length ? '{Your eating window,} from the times you logged.' : '{Nothing logged this week.} Your eating window appears as you log meals.'} />
      {days.length ? (
        <TintCard area="work" style={{ marginTop: space.xl }}>
          <Between><Text variant="title">Eating window</Text><Text variant="callout" tone="ink2">last 7 days</Text></Between>
          <WindowBox days={days} late={timing.late} label={`Your eating window on ${days.length} of the last 7 days, with ${timing.late}:00 marked`} />
        </TintCard>
      ) : null}
      <Callout style={{ marginTop: space.sm }}>Whether late meals change your sleep needs weeks of both. Life doesn’t draw that link yet.</Callout>
    </Page>
  );
}

function MealtimingSampleV26() {
  const nav = useNavigation(), { choose } = useSeed();
  return (
    <Page screen="mealtiming" bar={{ kind: 'push', title: 'Meal timing', action: info('How Life found this', () => nav.go('math')) }}
      footer={<Btn label="Try finishing by 20:30 for two weeks" onPress={() => { choose('experiment', 'Finish dinner by 20:30'); nav.go('experiment'); }} />}>
      <Eyebrow>Meals and your sleep</Eyebrow>
      <Display s={`When dinner ends {after ${timing.late}:00}, you sleep {${timing.lessSleep} minutes less} and your HRV is {lower}.`} />
      <TintCard area="work" style={{ marginTop: space.xl }}>
        <Between><Text variant="title">Eating window</Text><Text variant="callout" tone="ink2">{`last ${timing.nights} days`}</Text></Between>
        <WindowBox label={`Your eating window on each of the last ${timing.nights} days, with ${timing.late}:00 marked`} />
      </TintCard>
      <Callout style={{ marginTop: space.sm }}>A pattern in your own numbers, not a diagnosis.</Callout>
    </Page>
  );
}

/* ───────────────────────── 12. Food quality ───────────────────────── */

/** Food quality. Counting plants and processing from meals isn't built, so a real account sees the target and what counts. */
export function FoodqualityV26() {
  return SHOW_SAMPLES ? <FoodqualitySampleV26 /> : (
    <Page screen="foodquality" bar={{ kind: 'push', title: 'Food quality' }}>
      <PhotoCard source={photos.sunday} focal={{ x: .5, y: .85, zoom: 1 }} height={210} chips={['This week']} title="Not counted yet" sub={`${quality.plantsGoal} different plants a week is a good target for gut health.`} />
      <Box style={{ marginTop: space.sm }}>
        <Text variant="title">What counts</Text>
        <Body s="Fruit, vegetables, beans, grains, herbs, nuts, seeds and spices. Each different one counts once a week." style={{ marginTop: space.xxs }} />
      </Box>
      <Callout style={{ marginTop: space.sm }}>Life doesn’t count plants or processing from your meals yet. The meals you log are kept for when it does.</Callout>
    </Page>
  );
}

function FoodqualitySampleV26() {
  const t = useTokens(), q = quality;
  return (
    <Page screen="foodquality" bar={{ kind: 'push', title: 'Food quality' }}>
      <PhotoCard source={photos.sunday} focal={{ x: .5, y: .85, zoom: 1 }} height={210} chips={['This week']} title={`${q.plants} different plants`} sub={`${q.plantsGoal} is a good target for gut health.`} />
      <Box style={{ marginTop: space.sm }}>
        <DotGrid cells={Array.from({ length: q.plantsGoal }, (_, k) => k < q.plants ? 'on' : '')} columns={10} label={`${q.plants} of ${q.plantsGoal} plants this week`} />
        <Between style={{ marginTop: space.md }}><Text variant="callout">{`${q.plants} so far`}</Text><Text variant="callout" tone="ink2">{`${q.plantsGoal - q.plants} to go`}</Text></Between>
        <Callout style={{ marginTop: space.xs }}>Herbs, nuts, seeds and spices all count.</Callout>
      </Box>
      <Box style={{ marginTop: space.sm }}>
        <Between><Text variant="title">What your food was made of</Text><Text variant="callout" tone="ink2">this week</Text></Between>
        <View style={[styles.split, { marginTop: space.md }]} accessible accessibilityLabel={`Whole ${q.whole}%, processed ${q.processed}%, ultra-processed ${q.ultra}%`}>
          <View style={{ flex: q.whole, backgroundColor: t.ink, borderRadius: 7 }} /><View style={{ flex: q.processed, backgroundColor: t.ink2, borderRadius: 7 }} /><View style={{ flex: q.ultra, backgroundColor: t.surface3, borderRadius: 7 }} />
        </View>
        <Cols style={{ marginTop: space.md }} items={[{ small: 'Whole', value: `${q.whole}%`, sub: 'or barely processed' }, { small: 'Processed', value: `${q.processed}%` }, { small: 'Ultra-processed', value: `${q.ultra}%` }]} />
      </Box>
    </Page>
  );
}

/* ───────────────────────── 13. Alcohol ───────────────────────── */

export function AlcoholV26() {
  const t = useTokens(), { data, choose } = useSeed();
  const now = new Date(), ti = monIndex(now);
  const monday = new Date(now.getTime() - ti * 86400000);
  const keys = Array.from({ length: 7 }, (_, k) => dayKey(new Date(monday.getTime() + k * 86400000)));
  const base = SHOW_SAMPLES ? drinks.week : Array(7).fill(0);
  const units = keys.map((k, i) => r1((i <= ti ? base[i] : 0) + (Number(data.choices[`alcohol-${k}`] ?? 0) || 0)));
  const total = r1(units.reduce((a, b) => a + b, 0)), free = units.filter((u, i) => i <= ti && !u).length;
  const add = (u: number) => { const k = keys[ti]; choose(`alcohol-${k}`, String(r1((Number(data.choices[`alcohol-${k}`] ?? 0) || 0) + u))); feedback.select(); };
  return (
    <Page screen="alcohol" bar={{ kind: 'push', title: 'Alcohol', action: info('About the guideline', () => void Share.share({ message: 'UK guideline: no more than 14 units a week, spread over three or more days, with drink-free days.' }).catch(() => {})) }}>
      <Between><Eyebrow>This week</Eyebrow><Chip label={`${free} drink-free day${free === 1 ? '' : 's'}`} tone="done" /></Between>
      <Figure value={String(total)} unit={`/ ${drinks.guideline} units`} style={{ marginTop: 6 }} />
      <Ruler pct={ruled(total, drinks.guideline)} bars={14} style={{ marginTop: space.xs }} />
      <Callout style={{ marginTop: space.sm }}>The UK guideline is no more than 14 units a week, spread out, with drink-free days.</Callout>
      <View style={[styles.week, { marginTop: space.xl }]}>
        {units.map((u, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <View style={[styles.weekDot, { backgroundColor: u ? t.ink : t.surface2, opacity: i > ti ? .45 : 1 }]}><Text variant="buttonCompact" style={{ color: u ? t.canvas : t.ink, fontVariant: ['tabular-nums'] }}>{u ? String(u) : ''}</Text></View>
            <Text variant="micro" tone={i === ti ? 'ink' : 'quiet'} style={{ marginTop: 6 }}>{WEEK[i]}</Text>
          </View>
        ))}
      </View>
      <Micro style={{ marginTop: space.xl }}>Add a drink</Micro>
      <View style={[styles.wrap, { marginTop: space.sm }]}>
        {drinks.drinks.map(d => (
          <Press key={d.name} haptic="select" onPress={() => add(d.units)} accessibilityLabel={`Add ${d.name}, ${d.units} units`} style={[styles.soft, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
            <Icon name="add" size={16} color={t.ink} /><Text variant="bodyMedium" style={{ fontSize: 14 }}>{d.name}<Text variant="bodyMedium" style={{ fontSize: 14, fontFamily: fonts.sansSemibold }}>{` ${d.units}`}</Text></Text>
          </Press>
        ))}
      </View>
      {SHOW_SAMPLES ? (
        <TintCard area="health" style={{ marginTop: space.xl }}>
          <Micro>{`From ${drinks.nights} nights of your data`}</Micro>
          <Statement s={`After {4+ units}, your HRV is {${drinks.hrvDrop}% lower} the next morning.`} style={{ marginTop: space.xs }} />
        </TintCard>
      ) : null}
      <Body s="If you’re worried about your drinking, Drinkline: {0300 123 1110}." variant="callout" style={{ marginTop: space.md }} />
    </Page>
  );
}

/* ───────────────────────── 14. Bring your history ───────────────────────── */

export function ImportfoodV26() {
  const t = useTokens(), { data, choose, flag } = useSeed();
  const [error, setError] = useState('');
  const choose_ = async (id: string) => {
    setError('');
    try {
      const file = await pickAttachment('files');
      if (!file) return;
      const rows = file.text ? Math.max(0, file.text.split(/\r?\n/).filter(Boolean).length - 1) : 0;
      choose(`food-import-${id}`, `${file.name}${rows ? ` · ${n(rows)} rows read` : ''}`); feedback.file();
    } catch (e) { setError(e instanceof Error ? e.message : 'That file couldn’t be read.'); }
  };
  const source = (id: string, icon: 'heart' | 'doc', name: string, sub: string, act: string, onPress: () => void) => {
    const done = data.choices[`food-import-${id}`] || (data.flags[`food-import-${id}`] ? 'Asked for. Apple Health connects in a later update.' : '');
    return (
      <Box key={id} pad={space.md} style={{ marginTop: space.xs }} onPress={onPress} accessibilityLabel={`${name}. ${done || sub}`}>
        <View style={styles.line}>
          <View style={[styles.badge, { backgroundColor: t.surface2 }]}><Icon name={icon} size={18} color={t.ink} /></View>
          <View style={{ flex: 1, minWidth: 0 }}><Text variant="title">{name}</Text><Text variant="callout" tone="ink2">{done || sub}</Text></View>
          <Chip label={done ? 'Chosen' : act} tone={done ? 'done' : undefined} icon={done ? 'check' : undefined} />
        </View>
      </Box>
    );
  };
  return (
    <Page screen="importfood" bar={{ kind: 'push', title: 'Import' }}>
      <View style={[styles.importIcon, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}><Icon name="arrowDown" size={22} color={t.ink} /></View>
      <Display s="Start from {your real history}, not from zero." style={{ marginTop: space.lg }} />
      <Body s="Bring your past food and weight from another app, so Life’s targets and patterns begin with what you’ve already logged." style={{ marginTop: space.sm }} />
      <View style={{ marginTop: space.lg }}>
        {source('health', 'heart', 'Apple Health', 'Food and weight from other apps', 'Connect', () => { flag('food-import-health', true); feedback.select(); })}
        {source('mfp', 'doc', 'MyFitnessPal', 'Export a CSV, then pick it here', 'Choose file', () => void choose_('mfp'))}
        {source('loseit', 'doc', 'Lose It', 'Export a CSV, then pick it here', 'Choose file', () => void choose_('loseit'))}
      </View>
      {error ? <Callout style={{ marginTop: space.sm }}>{error}</Callout> : null}
      <View style={[styles.line, { marginTop: space.lg, alignItems: 'flex-start' }]}><Icon name="shield" size={18} color={t.ink} /><Body s="{Your data stays yours.} Imports are read once and stored on your phone." style={{ flex: 1 }} /></View>
    </Page>
  );
}

const styles = StyleSheet.create({
  input: { marginTop: space.xs, minHeight: 52, borderRadius: radius.md, paddingHorizontal: space.md, paddingVertical: space.sm, fontSize: 16, fontFamily: fonts.sans, textAlignVertical: 'top' },
  step: { flexDirection: 'row', alignItems: 'flex-start', gap: space.sm },
  stepNum: { width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  line: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  dayCol: { width: 148, borderRadius: radius.lg, paddingTop: 14, paddingHorizontal: 14, paddingBottom: space.md },
  stepper: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: space.lg, marginTop: space.xs },
  sum: { flexDirection: 'row', alignItems: 'flex-start' },
  fields: { flexDirection: 'row', gap: space.sm },
  field: { flex: 1, borderRadius: radius.md, paddingVertical: space.tile, paddingHorizontal: space.sm },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  betweenEnd: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: space.sm, marginTop: 6 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.xs },
  sig: { width: 6, height: 6, borderRadius: 3 },
  thumb56: { width: 56, height: 56, borderRadius: radius.md, overflow: 'hidden' },
  split: { flexDirection: 'row', gap: 3, height: 14 },
  week: { flexDirection: 'row', gap: 6 },
  weekDot: { width: '100%', aspectRatio: 1, maxWidth: 44, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  soft: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingLeft: space.tile, paddingRight: 14, borderRadius: radius.full },
  badge: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  importIcon: { width: 72, height: 72, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginTop: space.xs },
});
