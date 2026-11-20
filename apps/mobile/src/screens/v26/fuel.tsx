/**
 * Fuel, restyled to the V26 board (`fuel.js`, `core.js` mealresult): the camera, the honesty step, the hub, a meal,
 * the day, quick logging, saved meals, search, the barcode, the label, the menu, saying it and fixing it in words.
 * Every meal on screen is its photograph. The day is worked out from the diary (`state/fuel.ts`), so a meal logged
 * here moves Today and Body too. Recognition and the food database are Track B; their figures are samples.
 */
import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import { ScrollView, StyleSheet, TextInput, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import {
  Badge, Icon, LifeOrb, LifeSays, PhotoCard, PhotoFill, PhotoGrid, PickRow, Press, RoundButton, Ruler, SectionHead, SegmentedV26,
  SliderV26, SpineTimeline, StatusPill, Text, TileGrid, TintCard, V26Tile, cardShadow, feedback, fonts, photo, photoScrims, photos, radius,
  space, useTokens, type Focal, type GlyphName,
} from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import type { ScreenKey } from '@/navigation/screens';
import { useSeed } from '@/state/SeedProvider';
import { seed, seedDiaryMeals, seedMeal, type MealItem } from '@/state/seed';
import { SHOW_SAMPLES } from '@/state/sample';
import {
  barcode, clock, dayKey, fixDefault, foods, itemCrops, label as labelData, leftWords, mealSlot, mealTotals, menu, often, quick, savedItems,
  sayit, shareWords, snapTags, useFuelDay, type DiaryMeal, type FuelDay, type MealVia,
} from '@/state/fuel';
import { food } from '@/services/local';
import { pickAttachment } from '@/services/attachments';
import { voice } from '@/services/voice';
import { Between, Body, Box, Btn, Callout, Chip, Cols, Display, Eyebrow, Figure, Micro, Page, PhotoRound, PhotoTile, QuietLink, Row, RowsCard, SheetHandle, Shelf, Sp, Statement, two } from './kit';

/* ───────────────────────── Shared pieces ───────────────────────── */

export const n = (v: number) => Math.round(v).toLocaleString('en-GB');
const g1 = (v: number) => (Math.round(v * 10) / 10).toString();
type Pic = { source: ImageSourcePropType; focal?: Focal };

/** A meal's photograph: the one you took, or the sample picture that matches its name. Null means draw it without one. */
export function mealPic(m: { name: string; photo?: string }, zoom = 1.05): Pic | null {
  if (m.photo) return { source: { uri: m.photo } };
  const s = m.name.toLowerCase();
  if (/salmon|rice bowl/.test(s)) return { source: photos.food, focal: { x: .5, y: .46, zoom } };
  if (/yoghurt|oats|breakfast|granola/.test(s)) return { source: photos.breakfast, focal: { x: .44, y: .59, zoom } };
  if (/apple|peanut/.test(s)) return { source: photos.snack, focal: { x: .47, y: .53, zoom } };
  if (/wrap/.test(s)) return { source: photos.wrap, focal: { x: .43, y: .61, zoom: zoom + .3 } };
  return null;
}

/** Name a meal from its items: the sample bowl keeps its name, anything else is its first items. */
export function nameFor(items: MealItem[]) {
  const has = (w: string) => items.some(i => i.name.toLowerCase().includes(w));
  if (has('salmon') && has('rice')) return 'Salmon rice bowl';
  if (!items.length) return 'Meal';
  return items.length === 1 ? items[0].name : `${items[0].name}, ${items[1].name.toLowerCase()}${items.length > 2 ? ' and more' : ''}`;
}

type LogInput = { name: string; items: MealItem[]; via: MealVia; photo?: string; from?: string; id?: string; at?: string };
/** Put a meal in today's diary (or replace one you're editing) and remember it as the meal on screen. */
export function useLogMeal() {
  const { data, set, choose } = useSeed();
  return (m: LogInput) => {
    const id = m.id || `meal-${Date.now()}`;
    const prev = (data.meals as DiaryMeal[]).find(x => x.id === id) ?? (SHOW_SAMPLES ? (seedDiaryMeals as DiaryMeal[]).find(x => x.id === id) : undefined);
    const meal: DiaryMeal = { id, name: prev?.name ?? m.name, at: prev?.at ?? m.at ?? clock(), day: prev?.day ?? dayKey(), items: m.items, via: prev?.via ?? m.via, photo: m.photo ?? prev?.photo, from: prev?.from ?? m.from };
    set({ mealLogged: true, meals: [...data.meals.filter(x => x.id !== id), meal] });
    choose('selected-meal', id);
    feedback.file();
    return id;
  };
}

/** Saved meals: the sample life's four, then the ones you saved yourself. */
export function useSavedMeals() {
  const { data } = useSeed();
  let own: { name: string; detail: string; kcal: number }[] = [];
  try { own = JSON.parse(data.choices['saved-meals'] ?? '[]'); } catch { own = []; }
  const base = SHOW_SAMPLES ? seed.fuel.savedMeals : [];
  return [...base, ...own.filter(o => !base.some(b => b.name === o.name))];
}

const proteinLine = (v: number, t: number) => { const w = shareWords(v, t); return w === 'Reached' ? '{Protein} is done for today.' : `{Protein} is ${w.toLowerCase()}.`; };
const weekday = () => new Date().toLocaleDateString('en-GB', { weekday: 'long' });

/** Small paper chip with a dot and a quieter value, laid on a photograph (board `fu-tag`). `ink` for the dark version. */
function Tag({ label, em, ink, icon, style }: { label: string; em?: string; ink?: boolean; icon?: GlyphName; style?: StyleProp<ViewStyle> }) {
  const fg = ink ? photo.onPhoto : photo.ink;
  return (
    <View style={[styles.tag, { backgroundColor: ink ? photo.ink : photo.onPhoto }, style]} accessible accessibilityLabel={[label, em].filter(Boolean).join(' ')}>
      {icon ? <Icon name={icon} size={14} color={fg} /> : <View style={[styles.tagDot, { backgroundColor: fg }]} />}
      <Text variant="buttonCompact" style={{ color: fg }}>{label}{em ? <Text variant="buttonCompact" style={{ color: fg, opacity: .6, fontFamily: fonts.sansMedium }}>{` ${em}`}</Text> : null}</Text>
    </View>
  );
}

/** The four rounded corner marks of a viewfinder (board `fu-frame`). */
function Corners({ style, ink }: { style: StyleProp<ViewStyle>; ink?: boolean }) {
  const c = ink ? photo.ink : photo.onPhoto;
  const corner = (pos: ViewStyle, deg: number, k: number) => (
    <View key={k} style={[{ position: 'absolute', width: 34, height: 34, transform: [{ rotate: `${deg}deg` }] }, pos]}>
      <Svg width={34} height={34} viewBox="0 0 34 34"><Path d="M3 31V13A10 10 0 0 1 13 3h18" stroke={c} strokeWidth={4} strokeLinecap="round" fill="none" /></Svg>
    </View>
  );
  return (
    <View pointerEvents="none" style={[{ position: 'absolute' }, style]}>
      {corner({ left: 0, top: 0 }, 0, 0)}{corner({ right: 0, top: 0 }, 90, 1)}{corner({ right: 0, bottom: 0 }, 180, 2)}{corner({ left: 0, bottom: 0 }, 270, 3)}
    </View>
  );
}

/** A round button on a photograph: paper and solid, or the soft photo fill. */
function OnRound({ icon, label, solid, on, onPress }: { icon: GlyphName; label: string; solid?: boolean; on?: boolean; onPress?: () => void }) {
  const filled = solid || on;
  return (
    <Press haptic="select" onPress={onPress} accessibilityLabel={label} accessibilityState={on !== undefined ? { selected: on } : undefined} hitSlop={4}
      style={[styles.round, { backgroundColor: filled ? photo.onPhoto : photo.fill }]}>
      <Icon name={icon} size={18} color={filled ? photo.ink : photo.onPhoto} />
    </Press>
  );
}

/** The camera's bar: close, what life is doing, and the light. */
function CamBar({ label }: { label: string }) {
  const nav = useNavigation(), [light, setLight] = useState(false);
  return (
    <View style={styles.camBar}>
      <OnRound icon="close" label="Close" solid onPress={nav.close} />
      <View style={styles.orbChip}><LifeOrb size={16} state="searching" color={photo.ink} /><Text variant="buttonCompact" style={{ color: photo.ink }} numberOfLines={1}>{label}</Text></View>
      <OnRound icon="sun" label={light ? 'Light on' : 'Light'} on={light} onPress={() => { setLight(!light); feedback.select(); }} />
    </View>
  );
}

const MODES: { label: string; key: ScreenKey }[] = [{ label: 'Photo', key: 'snap' }, { label: 'Barcode', key: 'barcode' }, { label: 'Label', key: 'labelscan' }, { label: 'Menu', key: 'menuscan' }, { label: 'Type', key: 'foodsearch' }];
/** Five ways in, as one dark pill (board `fu-modes`). The camera ones swap in place. */
function Modes({ active }: { active: ScreenKey }) {
  const nav = useNavigation();
  return (
    <View style={styles.modes} accessibilityRole="tablist">
      {MODES.map(m => {
        const on = m.key === active;
        return (
          <Press key={m.key} haptic="select" accessibilityRole="tab" accessibilityState={{ selected: on }} accessibilityLabel={m.label}
            onPress={() => { if (on) return; if (m.key === 'snap' || m.key === 'barcode' || m.key === 'labelscan') nav.replace(m.key); else nav.go(m.key); }}
            style={[styles.mode, on ? { backgroundColor: photo.onPhoto } : null]}>
            <Text variant="buttonCompact" style={{ color: on ? photo.ink : photo.onPhoto }}>{m.label}</Text>
          </Press>
        );
      })}
    </View>
  );
}

/** The white sheet at the foot of a camera screen. */
function CamSheet({ children }: { children: ReactNode }) {
  const t = useTokens(), insets = useSafeAreaInsets();
  return (
    <View style={[styles.camSheet, { backgroundColor: t.surface, paddingBottom: Math.max(insets.bottom, space.md) + 4 }]}>
      <View style={[styles.handle, { backgroundColor: t.surface3 }]} />
      {children}
    </View>
  );
}

/** The dark band at the top of a short photograph, so the status bar stays readable (board `.panel`). */
function TopBand() {
  return <LinearGradient pointerEvents="none" colors={['rgba(8,9,10,0.55)', 'rgba(8,9,10,0)']} style={[StyleSheet.absoluteFill, { bottom: undefined, height: 140 }]} />;
}

/** A plus on a photograph, to log a meal again. */
function PlusRound({ label, onPress }: { label: string; onPress?: () => void }) {
  return (
    <Press haptic="primary" onPress={onPress} accessibilityLabel={label} hitSlop={6} style={[styles.roundSm, { backgroundColor: photo.onPhoto }]}>
      <Icon name="add" size={16} color={photo.ink} />
    </Press>
  );
}

/** A soft white chip with an icon (board `softChip`). */
export function SoftChip({ icon = 'add', label, strong, onPress }: { icon?: GlyphName; label: string; strong?: string; onPress?: () => void }) {
  const t = useTokens();
  return (
    <Press haptic="select" onPress={onPress} accessibilityLabel={[label, strong].filter(Boolean).join(' ')} style={[styles.soft, { backgroundColor: t.surface, ...cardShadow(t.scheme) }]}>
      <Icon name={icon} size={16} color={t.ink} />
      <Text variant="bodyMedium" style={{ fontSize: 14 }}>{label}{strong ? <Text variant="bodyMedium" style={{ fontSize: 14, fontFamily: fonts.sansSemibold }}>{` ${strong}`}</Text> : null}</Text>
    </Press>
  );
}

/** A meal as its photograph, or as a soft tile when there is none (a said or typed meal). */
function MealCard({ meal, height, size = 'sm', chips, topRight, sub, onPress, style }: { meal: { name: string; photo?: string; via?: MealVia }; height: number; size?: 'lg' | 'md' | 'sm'; chips?: string[]; topRight?: ReactNode; sub?: string; onPress?: () => void; style?: StyleProp<ViewStyle> }) {
  const pic = mealPic(meal);
  if (pic) return <PhotoCard source={pic.source} focal={pic.focal} height={height} size={size} chips={chips} topRight={topRight} title={meal.name} sub={sub} onPress={onPress} style={style} />;
  return (
    <TintCard area="home" onPress={onPress} accessibilityLabel={[meal.name, sub].filter(Boolean).join(', ')} style={[{ minHeight: height }, style]}>
      <Between><Badge icon={meal.via === 'said' ? 'mic' : meal.via === 'scan' || meal.via === 'label' ? 'grid' : 'food'} />{chips?.length ? <Text variant="micro" tone="ink2">{chips[0]}</Text> : null}</Between>
      <View style={{ flex: 1 }} />
      <Text variant="title" numberOfLines={2}>{meal.name}</Text>
      {sub ? <Text variant="callout" tone="ink2">{sub}</Text> : null}
    </TintCard>
  );
}

/** A thumb for one item of a meal: its piece of the sample bowl, your photo, or a quiet food well. */
function ItemThumb({ name, photoUri, sample }: { name: string; photoUri?: string; sample: boolean }) {
  const t = useTokens(), crop = itemCrops[name];
  return (
    <View style={[styles.thumb, { backgroundColor: t.surface2 }]}>
      {photoUri ? <PhotoFill source={{ uri: photoUri }} /> : sample && crop ? <PhotoFill source={photos.food} focal={crop} /> : <View style={styles.thumbIcon}><Icon name="food" size={20} color={t.ink2} /></View>}
    </View>
  );
}

/* ───────────────────────── 1. Snap a meal ───────────────────────── */

export function SnapV26() {
  const nav = useNavigation(), { set, choose } = useSeed();
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const seen = seedMeal.filter(i => snapTags[i.name]);
  const take = async (kind: 'camera' | 'photos') => {
    if (busy) return;
    setError(''); setBusy(true);
    try {
      const shot = await pickAttachment(kind);
      if (!shot) return;
      const items = SHOW_SAMPLES ? (await food.readPhoto()).data : [];
      choose('editing-meal', ''); choose('meal-photo', shot.uri);
      set({ meal: items.map(i => ({ ...i })) });
      nav.go('confirm');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'The camera didn’t open. You can choose a photo instead.');
    } finally { setBusy(false); }
  };
  const words = seen.map(i => i.name.toLowerCase());
  const list = words.length > 1 ? `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}` : words[0];
  return (
    <Page screen="snap" scroll={false} bar={{ kind: 'none' }} contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
      backdrop={SHOW_SAMPLES ? (
        <View pointerEvents="none" style={StyleSheet.absoluteFill}>
          <PhotoFill source={photos.food} focal={{ x: .47, y: .47, zoom: 1.5 }} />
          <LinearGradient colors={photoScrims.fade.colors} locations={photoScrims.fade.locations} style={StyleSheet.absoluteFill} />
          {seen.map(i => <Tag key={i.name} label={i.name} em={`~${i.grams}g`} style={{ position: 'absolute', left: `${snapTags[i.name].left * 100}%`, top: `${snapTags[i.name].top * 100}%` }} />)}
        </View>
      ) : <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: photo.ink }]} />}
      bottom={
        <CamSheet>
          {error ? <Body s={error} tone="ink" style={{ marginTop: space.md }} /> : (
            <View style={styles.saysRow}>
              <LifeOrb size={20} state="searching" />
              <Text variant="body" style={{ flex: 1 }}>{SHOW_SAMPLES ? `life sees ${seen.length} things so far: ${list}.` : 'Tap the shutter to take a photo of your plate.'}</Text>
            </View>
          )}
          <Callout style={{ marginTop: space.xs }}>Portions are estimates. You can adjust them next.</Callout>
        </CamSheet>
      }>
      <CamBar label={busy ? 'Opening the camera…' : 'Hold steady'} />
      <View style={{ flex: 1 }}>
        <Corners style={{ left: 14, right: 14, top: 8, bottom: 8 }} />
        {!SHOW_SAMPLES ? <View style={styles.centre}><Text variant="body" style={{ color: photo.onPhoto2 }} align="center">The camera opens when you tap the shutter.</Text></View> : null}
      </View>
      <View style={{ paddingHorizontal: space.gutter, paddingBottom: 18 }}>
        <Modes active="snap" />
        <View style={styles.shutterRow}>
          <OnRound icon="images" label="Choose a photo" onPress={() => void take('photos')} />
          <Press haptic="primary" onPress={() => void take('camera')} accessibilityLabel="Take photo" style={[styles.shutter, { borderColor: photo.onPhoto }]}>
            <View style={[styles.shutterIn, { backgroundColor: photo.onPhoto }]} />
          </Press>
          <OnRound icon="mic" label="Say it instead" onPress={() => nav.replace('sayit')} />
        </View>
      </View>
    </Page>
  );
}

/* ───────────────────────── 2. Confirm the meal ───────────────────────── */

export function ConfirmV26() {
  const nav = useNavigation(), t = useTokens(), insets = useSafeAreaInsets(), { data, set, choose } = useSeed(), day = useFuelDay(), log = useLogMeal();
  const params = useLocalSearchParams<{ state?: string }>();
  const editingId = data.choices['editing-meal'] || '';
  const editing = day.diary.find(m => m.id === editingId);
  const photoUri = editing ? editing.photo : data.choices['meal-photo'] || undefined;
  const sampleBowl = !photoUri && (SHOW_SAMPLES || !!editing) && data.meal.some(i => itemCrops[i.name]);
  const [bases, setBases] = useState(() => data.meal.map(i => ({ ...i })));
  useEffect(() => { if (bases.length !== data.meal.length) setBases(data.meal.map(i => ({ ...i }))); }, [data.meal, bases.length]);
  const [open, setOpen] = useState<number | null>(params.state === 'portion' ? 1 : null);
  const total = mealTotals(data.meal), hide = day.hide;
  const at = editing?.at ?? clock();
  const header = photoUri ? { source: { uri: photoUri } } as Pic : sampleBowl ? { source: photos.food, focal: { x: .5, y: .4, zoom: 1.3 } } : editing ? mealPic(editing) : null;
  const resize = (i: number, grams: number) => {
    const base = bases[i] ?? data.meal[i], k = grams / (base.grams || 1);
    set({ meal: data.meal.map((v, j) => i === j ? { ...v, grams, kcal: base.kcal * k, protein: base.protein * k, carbs: base.carbs * k, fat: base.fat * k, fibre: base.fibre * k } : v) });
  };
  const save = () => {
    log({ id: editingId || undefined, name: editing?.name ?? nameFor(data.meal), items: data.meal, via: 'photo', photo: photoUri });
    choose('editing-meal', ''); choose('meal-photo', '');
    nav.replace('mealresult');
  };
  return (
    <Page screen="confirm" scroll={false} bar={{ kind: 'none' }} contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
      backdrop={header ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { bottom: undefined, height: 190 }]}><PhotoFill source={header.source} focal={header.focal} /></View> : undefined}>
      {header ? <View style={{ height: 76 }} /> : null}
      <View style={[styles.panel, { backgroundColor: t.surface, paddingBottom: Math.max(insets.bottom, space.md) }]}>
        <SheetHandle />
        <View style={styles.sheetTitle}>
          <View style={{ width: 40 }} />
          <Text variant="title" numberOfLines={1} style={{ flex: 1, textAlign: 'center' }}>{editing ? `${editing.name} · ${at}` : `${mealSlot(at)} · ${at}`}</Text>
          <RoundButton icon="close" label="Close" onPress={nav.close} />
        </View>
        <View style={[styles.betweenEnd, { marginTop: space.xs }]}>
          <View>
            <Eyebrow>This meal</Eyebrow>
            {hide ? <Text variant="headline" style={{ marginTop: space.xxs }}>A balanced plate</Text> : <Figure value={n(total.kcal)} unit="kcal" style={{ marginTop: space.xxs }} />}
          </View>
          <View style={{ alignItems: 'flex-end', marginBottom: 6 }}>
            <Text variant="callout" tone="ink2">Protein</Text>
            <Text variant="headline">{hide ? (total.protein >= 25 ? 'Good source' : 'Some') : `${Math.round(total.protein)}g`}</Text>
          </View>
        </View>
        <View style={[styles.wrapRow, { marginTop: space.xs }]}><Chip label="Estimate" tone="q" /><Text variant="callout" tone="ink2">Adjust anything that looks off.</Text></View>
        <View style={{ flex: 1, minHeight: 0, marginTop: space.xs }}>
          {data.meal.length ? (
            <ScrollItems>
              {data.meal.map((item, i) => {
                const base = bases[i] ?? item, on = open === i, lo = Math.max(5, Math.round(base.grams / 2 / 5) * 5), hi = Math.max(lo + 10, Math.round(base.grams * 2 / 5) * 5);
                return (
                  <View key={`${item.name}-${i}`}>
                    <View style={styles.itemRow}>
                      <ItemThumb name={item.name} photoUri={photoUri} sample={sampleBowl} />
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text variant="rowTitle" numberOfLines={1}>{item.name}</Text>
                        <Text variant="callout" tone="ink2">{hide ? 'Portion estimate' : `${n(item.kcal)} kcal`}</Text>
                      </View>
                      <Press haptic="select" onPress={() => setOpen(on ? null : i)} accessibilityLabel={`${item.name}, ${Math.round(item.grams)} grams. Change portion`}
                        style={[styles.gramChip, { backgroundColor: on ? t.ink : t.surface2 }]}>
                        <Text variant="buttonCompact" style={{ color: on ? t.canvas : t.ink }}>{`${Math.round(item.grams)}g`}</Text>
                        <Icon name="more" size={14} color={on ? t.canvas : t.ink} />
                      </Press>
                    </View>
                    {on ? (
                      <View style={{ paddingLeft: 60, paddingBottom: space.tile }}>
                        <SliderV26 value={item.grams} min={lo} max={hi} step={5} onChange={v => resize(i, v)} accessibilityLabel={`${item.name} portion in grams`} />
                        <Between style={{ marginTop: 2 }}><Text variant="micro" tone="quiet">{`${lo}g`}</Text><Text variant="micro" tone="quiet">{`${hi}g`}</Text></Between>
                      </View>
                    ) : null}
                  </View>
                );
              })}
            </ScrollItems>
          ) : (
            <View style={{ paddingTop: space.md }}>
              <Statement s="What’s in it? Add each part and life will total it." />
              <View style={[styles.wrapRow, { marginTop: space.md }]}>
                <SoftChip icon="search" label="Search for a food" onPress={() => nav.go('foodsearch', { add: '1' })} />
                <SoftChip icon="mic" label="Say it" onPress={() => nav.go('sayit', { add: '1' })} />
              </View>
              <Callout style={{ marginTop: space.md }}>Reading the food in a photo comes with the next update. Until then, you add the parts yourself.</Callout>
            </View>
          )}
        </View>
        {data.meal.length ? <QuietLink label="Fix it in your own words" onPress={() => nav.go('fixwords')} style={{ marginBottom: space.xs }} /> : null}
        <Btn label={editing ? 'Save changes' : 'Log meal'} onPress={save} disabled={!data.meal.length} />
        <Callout center style={{ marginTop: space.tile }}>Nothing is logged until you say so.</Callout>
      </View>
    </Page>
  );
}

function ScrollItems({ children }: { children: ReactNode }) {
  return <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>{children}</ScrollView>;
}

/* ───────────────────────── 3. Fuel, the hub ───────────────────────── */

function WordCols({ items }: { items: { small: string; value: string; sub?: string }[] }) {
  return (
    <View style={{ flexDirection: 'row', gap: space.xs, marginTop: 14 }}>
      {items.map(c => (
        <View key={c.small} style={{ flex: 1, minWidth: 0 }} accessible accessibilityLabel={`${c.small}, ${c.value}`}>
          <Text variant="micro" tone="ink2">{c.small}</Text>
          <Text variant="title" style={{ fontSize: 14, lineHeight: 20, marginTop: space.xxs }}>{c.value}</Text>
        </View>
      ))}
    </View>
  );
}

function DayBelow({ day, words }: { day: FuelDay; words: boolean }) {
  const pct = day.budget ? Math.min(100, Math.round(day.eaten / day.budget * 100)) : 0;
  const p = Math.round(day.totals.protein), fb = Math.round(day.totals.fibre), w = day.waterMl / 1000, wt = day.targets.waterMl / 1000;
  return (
    <>
      <Between>
        {words
          ? <Text variant="headline">{`About ${pct < 15 ? 'a little' : pct < 42 ? 'a third' : pct < 58 ? 'half' : pct < 80 ? 'two thirds' : 'all'} of today`}</Text>
          : <Text variant="headline">{n(day.eaten)} <Text variant="headline" tone="quiet" style={{ fontFamily: fonts.sansMedium }}>{`of ${n(day.budget)} kcal`}</Text></Text>}
        {words ? null : <Text variant="title">{`${pct}%`}</Text>}
      </Between>
      <Ruler pct={pct} style={{ marginTop: space.xs }} />
      {!words && day.added ? <Callout style={{ marginTop: space.xs }}>{`${n(day.target)} a day, plus ${n(day.added)} back from exercise.`}</Callout> : null}
      {words
        ? <WordCols items={[{ small: 'Protein', value: shareWords(p, day.targets.protein) }, { small: 'Fibre', value: shareWords(fb, day.targets.fibre) }, { small: 'Water', value: shareWords(w, wt) }]} />
        : <Cols style={{ marginTop: 14 }} items={[{ small: 'Protein', value: `${p}g`, sub: `of ${day.targets.protein}g` }, { small: 'Fibre', value: `${fb}g`, sub: `of ${day.targets.fibre}g` }, { small: 'Water', value: `${w.toFixed(1)} L`, sub: `of ${wt.toFixed(1)} L` }]} />}
    </>
  );
}

export function FuelV26() {
  const nav = useNavigation(), { pref, choose } = useSeed(), day = useFuelDay();
  const params = useLocalSearchParams<{ state?: string }>();
  const words = params.state === 'words' || day.hide;
  const latest = day.diary[day.diary.length - 1];
  const rest = day.diary.slice(0, -1).reverse();
  const open = (id: string) => { choose('selected-meal', id); nav.go('mealresult'); };
  const kcalLine = (m: DiaryMeal, said: string) => { const tt = mealTotals(m.items); return words ? said : `${n(tt.kcal)} kcal · ${Math.round(tt.protein)}g protein`; };
  const pic = latest ? mealPic(latest, 1.3) : null;
  return (
    <Page screen="fuel" bar={{ kind: 'push', action: { kind: 'node', node: <Chip label={words ? 'Show numbers' : 'Hide numbers'} icon={words ? 'eye' : 'eyeOff'} onPress={() => { pref('hideNumbers', !words); feedback.select(); }} /> } }}>
      <Eyebrow>Fuel · today</Eyebrow>
      <Display s={words
        ? `{${leftWords(day.left, day.budget)}} of today’s energy is still to come. ${proteinLine(day.totals.protein, day.targets.protein)}`
        : `{${n(day.left)} kcal} left today. ${proteinLine(day.totals.protein, day.targets.protein)}`} />
      {latest ? (
        pic ? (
          <HeroMeal pic={pic} small={`${mealSlot(latest.at)} · ${latest.at}`} title={latest.name} sub={kcalLine(latest, rest.length ? 'The biggest meal so far' : 'Your first meal today')} onPress={() => open(latest.id)}>
            <DayBelow day={day} words={words} />
          </HeroMeal>
        ) : (
          <Box style={{ marginTop: space.xl }} onPress={() => open(latest.id)} accessibilityLabel={latest.name}>
            <Micro>{`${mealSlot(latest.at)} · ${latest.at}`}</Micro>
            <Text variant="headline" style={{ marginTop: 2 }}>{latest.name}</Text>
            <Callout>{kcalLine(latest, 'Logged')}</Callout>
            <Sp h={space.md} /><DayBelow day={day} words={words} />
          </Box>
        )
      ) : (
        <Box style={{ marginTop: space.xl }}>
          <LifeSays>Nothing logged yet today. Snap your first meal, or say what you had.</LifeSays>
          <Sp h={space.md} /><DayBelow day={day} words={words} />
        </Box>
      )}
      <SectionHead title="Also today" link="Snap a meal" onLink={() => nav.go('snap')} />
      <PhotoGrid>
        {rest.slice(0, 3).map(m => <MealCard key={m.id} meal={m} height={170} chips={[m.at]} sub={kcalLine(m, m.via === 'said' ? 'Said' : 'Logged')} onPress={() => open(m.id)} />)}
        {rest.length < 2 ? (
          <TintCard area="home" onPress={() => nav.go('quicklog')} accessibilityLabel="Add a meal" style={{ minHeight: 170 }}>
            <Badge icon="add" /><View style={{ flex: 1 }} />
            <Text variant="title">Add a meal</Text><Text variant="callout" tone="ink2">Snap, scan, say or search</Text>
          </TintCard>
        ) : null}
      </PhotoGrid>
      <RowsCard style={{ marginTop: space.sm }}>
        <Row thumb={photos.cook} title="What can I cook?" sub="From what’s in your kitchen" onPress={() => nav.go('cook')} />
        <Row thumb={photos.sunday} thumbFocal={{ x: .5, y: .83, zoom: 1.6 }} title="This week’s meals" sub="Seven days and a shopping list" onPress={() => nav.go('mealplan')} />
        <Row thumb={photos.wrap} thumbFocal={{ x: .43, y: .61, zoom: 1.6 }} title="Saved meals" sub="Log one again in a tap" onPress={() => nav.go('savedmeals')} />
        <Row icon="trend" title="Progress" sub="Food and weight, over time" onPress={() => nav.go('fuelprogress')} />
      </RowsCard>
      <SectionHead title="More about your food" />
      <RowsCard>
        <Row icon="calendar" title="Today’s food" sub="The day as a diary" onPress={() => nav.go('foodday')} />
        <Row icon="spark" title="Nutrients" sub="Fibre, iron and the rest" onPress={() => nav.go('nutrients')} />
        <Row icon="chart" title="Your week" sub="Not just today" onPress={() => nav.go('weekbudget')} />
        <Row icon="moon" title="Meals and your sleep" sub="When dinner ends" onPress={() => nav.go('mealtiming')} />
        <Row icon="food" title="Food quality" sub="Plants and how processed" onPress={() => nav.go('foodquality')} />
        <Row icon="water" title="Alcohol" sub="Units this week" onPress={() => nav.go('alcohol')} />
        <Row icon="fitness" title="Exercise, added back" sub={`${shareName(day.share)} of what your watch counts`} onPress={() => nav.go('exerciseadd')} />
        <Row icon="gear" title="Your targets" sub={`${n(day.target)} kcal · ${day.targets.protein}g protein`} onPress={() => nav.go('fuelgoal')} />
        <Row icon="arrowDown" title="Bring your history" sub="From another app" onPress={() => nav.go('importfood')} />
      </RowsCard>
      <Callout style={{ marginTop: space.md }}>Targets come from your details and activity. Calorie features are for adults only.</Callout>
    </Page>
  );
}
const shareName = (share: number) => share === 1 ? 'All' : share === .5 ? 'Half' : 'None';

/** The board's `.hero` for a meal: the photograph with its words, then the day under it. */
function HeroMeal({ pic, small, title, sub, onPress, children }: { pic: Pic; small: string; title: string; sub: string; onPress: () => void; children: ReactNode }) {
  const t = useTokens();
  return (
    <View style={[styles.hero, { marginTop: space.xl, ...cardShadow(t.scheme) }]}>
      <View style={[styles.heroIn, { backgroundColor: t.surface }]}>
        <Press haptic="open" onPress={onPress} accessibilityLabel={`${small}, ${title}, ${sub}`} style={{ height: 190, justifyContent: 'flex-end' }}>
          <PhotoFill source={pic.source} focal={pic.focal} />
          <LinearGradient pointerEvents="none" colors={photoScrims.card.colors} locations={photoScrims.card.locations} style={StyleSheet.absoluteFill} />
          <View style={{ paddingHorizontal: 18, paddingVertical: space.md }}>
            <Text variant="micro" tone="paper2">{small}</Text>
            <Text variant="heading" tone="paper" style={{ marginTop: 2 }}>{title}</Text>
            <Text variant="callout" tone="paper2">{sub}</Text>
          </View>
        </Press>
        <View style={{ paddingHorizontal: 18, paddingTop: space.md, paddingBottom: 18 }}>{children}</View>
      </View>
    </View>
  );
}

/* ───────────────────────── 4. A meal ───────────────────────── */

export function MealresultV26() {
  const nav = useNavigation(), t = useTokens(), { data, set, choose } = useSeed(), day = useFuelDay(), log = useLogMeal(), saved = useSavedMeals();
  const insets = useSafeAreaInsets();
  const sel = data.choices['selected-meal'] ?? '';
  const preview = sel.startsWith('saved:') ? saved.find(s => s.name === sel.slice(6)) : undefined;
  const meal: DiaryMeal | undefined = preview
    ? { id: '', name: preview.name, at: clock(), items: savedItems(preview.name, preview.kcal), via: 'saved', from: preview.detail }
    : day.diary.find(m => m.id === sel) ?? day.diary[day.diary.length - 1];
  const [menuOpen, setMenuOpen] = useState(false);
  if (!meal) return (
    <Page screen="mealresult" bar={{ kind: 'push', title: 'Meal' }} center>
      <Statement s="No meal to show yet. {Snap one} and it lands here." />
      <Btn label="Snap a meal" icon="camera" onPress={() => nav.replace('snap')} style={{ marginTop: space.lg }} />
    </Page>
  );
  const tt = mealTotals(meal.items), hide = day.hide;
  const pct = (v: number, of: number) => `${Math.round(v / of * 100)}%`;
  const leftAfter = preview ? day.left - tt.kcal : day.left;
  const fits = tt.kcal <= (preview ? day.left : day.left + tt.kcal);
  const score = /salmon/i.test(meal.name) ? seed.fuel.mealFit : null;
  const proteinShare = tt.protein / day.targets.protein, fibreLeft = day.targets.fibre - day.totals.fibre - (preview ? tt.fibre : 0);
  const tip = `${proteinShare >= .3 ? 'Strong on protein.' : proteinShare >= .15 ? 'A fair share of protein.' : 'Light on protein; add some at your next meal.'} ${fibreLeft > 8 ? 'Add greens tonight to reach your fibre.' : 'Fibre is on track for today.'}`;
  const where = preview ? `${preview.detail} · saved meal` : meal.from ? `${meal.from} · saved meal` : meal.via === 'said' ? 'Said in your own words' : meal.via === 'scan' ? 'Scanned' : meal.via === 'photo' ? 'From your photo' : 'Logged';
  const pic = mealPic(meal, 1);
  const bg = pic ? { source: pic.source, focal: !meal.photo && /salmon|rice bowl/i.test(meal.name) ? { x: .38, y: .42 } : pic.focal } : null;
  const isSaved = saved.some(s => s.name === meal.name);
  const saveIt = () => {
    if (isSaved) return;
    let own: { name: string; detail: string; kcal: number }[] = [];
    try { own = JSON.parse(data.choices['saved-meals'] ?? '[]'); } catch { own = []; }
    choose('saved-meals', JSON.stringify([...own, { name: meal.name, detail: where.replace(' · saved meal', ''), kcal: Math.round(tt.kcal) }]));
    feedback.complete(); setMenuOpen(false);
  };
  const edit = () => { choose('editing-meal', meal.id); choose('meal-photo', meal.photo ?? ''); set({ meal: meal.items.map(i => ({ ...i })) }); nav.go('confirm'); };
  const remove = () => { set({ meals: data.meals.filter(m => m.id !== meal.id) }); feedback.select(); nav.close(); };
  return (
    <Page screen="mealresult" scroll={false} contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
      backdrop={bg ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { bottom: undefined, height: 430 }]}><PhotoFill source={bg.source} focal={bg.focal} /><LinearGradient colors={photoScrims.fade.colors} locations={photoScrims.fade.locations} style={StyleSheet.absoluteFill} /></View> : <View style={[StyleSheet.absoluteFill, { backgroundColor: photo.ink }]} />}
      bar={{ kind: 'photo', left: <View style={styles.paperChip}><Text variant="buttonCompact" style={{ color: photo.ink }}>{preview ? 'Saved meal' : `${mealSlot(meal.at)} · ${meal.at}`}</Text></View>,
        right: <View style={{ flexDirection: 'row', gap: space.xs }}>{preview ? null : <OnRound icon="more" label="Meal actions" on={menuOpen} onPress={() => setMenuOpen(!menuOpen)} />}<PhotoRound icon="close" label="Close" onPress={nav.close} /></View> }}>
      <View style={styles.mealTop}>
        {!hide ? <View style={styles.fitChip}><Text variant="buttonCompact" style={{ color: fits ? '#0B7A55' : photo.ink }}>{fits ? `Fits today${score ? ` · ${score}` : ''}` : 'A bigger meal than today has room for'}</Text></View> : null}
        <Text variant="display" style={{ color: photo.onPhoto, marginTop: space.tile }} numberOfLines={2}>{meal.name}</Text>
        <Text variant="callout" style={{ color: photo.onPhoto2 }}>{where}</Text>
      </View>
      <View style={[styles.mealSheet, { backgroundColor: t.surface, paddingBottom: Math.max(insets.bottom, space.md) }]}>
        {menuOpen ? (
          <RowsCard style={{ marginBottom: space.md }}>
            <Row icon="mic" title="Fix it in your own words" onPress={() => { choose('editing-meal', meal.id); choose('meal-photo', meal.photo ?? ''); set({ meal: meal.items.map(i => ({ ...i })) }); setMenuOpen(false); nav.go('fixwords'); }} />
            <Row icon={isSaved ? 'check' : 'add'} title={isSaved ? 'In your saved meals' : 'Save this meal'} onPress={saveIt} />
            <Row icon="trash" title="Remove from today" onPress={remove} />
          </RowsCard>
        ) : null}
        <View style={styles.betweenEnd}>
          {hide ? <Text variant="heading">{tt.protein >= 25 ? 'A filling meal' : 'A lighter meal'}</Text> : <Figure value={n(tt.kcal)} unit="kcal" />}
          {hide ? null : <Text variant="callout" tone="ink2" style={{ marginBottom: space.xs }}>{preview ? `${n(Math.max(0, leftAfter))} left after this` : `${n(leftAfter)} left today`}</Text>}
        </View>
        {hide ? <Callout style={{ marginTop: space.sm }}>Numbers are hidden. Protein, fibre and colour matter more than any one figure.</Callout> : <>
          <Cols style={{ marginTop: space.lg }} items={[
            { small: 'Protein', value: `${Math.round(tt.protein)}g`, sub: pct(tt.protein, day.targets.protein) },
            { small: 'Carbs', value: `${Math.round(tt.carbs)}g`, sub: pct(tt.carbs, day.targets.carbs) },
            { small: 'Fat', value: `${Math.round(tt.fat)}g`, sub: pct(tt.fat, day.targets.fat) },
            { small: 'Fibre', value: `${Math.round(tt.fibre)}g`, sub: pct(tt.fibre, day.targets.fibre) },
          ]} />
          <Callout style={{ marginTop: space.xs }}>Percentages are of your day’s targets.</Callout>
        </>}
        <View style={[styles.saysRow, { marginTop: space.md }]}><LifeOrb size={20} /><Text variant="body" style={{ flex: 1 }}>{tip}</Text></View>
        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: 'row', gap: space.xs, marginTop: space.md }}>
          <Btn label="Edit" ghost fit onPress={preview ? () => { choose('editing-meal', ''); choose('meal-photo', ''); set({ meal: meal.items.map(i => ({ ...i })) }); nav.go('confirm'); } : edit} />
          <View style={{ flex: 1 }}>
            {preview
              ? <Btn label="Log meal" onPress={() => { log({ name: preview.name, items: meal.items, via: 'saved', from: preview.detail }); }} />
              : <Btn label="Done" onPress={nav.close} />}
          </View>
        </View>
      </View>
    </Page>
  );
}

/* ───────────────────────── 5. Fuel, at a glance ───────────────────────── */

export function FuelhomeV26() {
  const nav = useNavigation(), { choose } = useSeed(), day = useFuelDay();
  const hide = day.hide, latest = day.diary[day.diary.length - 1], rest = day.diary.slice(0, -1).reverse();
  const open = (id: string) => { choose('selected-meal', id); nav.go('mealresult'); };
  return (
    <Page screen="fuelhome" bar={{ kind: 'push', action: { kind: 'node', node: <View style={{ flexDirection: 'row', gap: space.xs }}><RoundButton icon="calendar" label="Today’s food" onPress={() => nav.go('foodday')} /><RoundButton icon="add" label="Quick log" onPress={() => nav.go('quicklog')} /></View> } }}
      footer={<View style={{ flexDirection: 'row', gap: space.xs }}><Btn label="Scan" icon="grid" ghost fit onPress={() => nav.go('barcode')} /><View style={{ flex: 1 }}><Btn label="Snap a meal" icon="camera" onPress={() => nav.go('snap')} /></View></View>}>
      <Eyebrow>{`Fuel · ${weekday()}`}</Eyebrow>
      {hide ? <Display s={`{${leftWords(day.left, day.budget)}} of today’s energy is still to come.`} /> : <Figure value={n(day.left)} unit="kcal left today" style={{ marginTop: 6 }} />}
      <Cols style={{ marginTop: space.md }} items={[{ small: 'Eaten', value: hide ? 'Regular meals' : n(day.eaten) }, { small: 'Burned', value: hide ? 'Active day' : `+${n(day.added)}` }, { small: 'Water', value: `${(day.waterMl / 1000).toFixed(1)} L` }]} />
      {latest ? <MealCard meal={latest} height={200} size="lg" style={{ marginTop: space.lg }} chips={[`${mealSlot(latest.at)} · ${latest.at}`]} sub={hide ? undefined : `${n(mealTotals(latest.items).kcal)} kcal`} onPress={() => open(latest.id)} /> : null}
      <PhotoGrid style={{ marginTop: latest ? space.sm : space.lg }}>
        {rest.slice(0, 3).map(m => <MealCard key={m.id} meal={m} height={160} chips={[`${mealSlot(m.at)} · ${m.at}`]} sub={hide ? undefined : `${n(mealTotals(m.items).kcal)} kcal`} onPress={() => open(m.id)} />)}
        <TintCard area="home" onPress={() => nav.go('quicklog')} accessibilityLabel="Add a meal" style={{ minHeight: 160 }}>
          <Badge icon="add" /><View style={{ flex: 1 }} />
          <Text variant="title">Add a meal</Text><Text variant="callout" tone="ink2">Snap, scan, say or search</Text>
        </TintCard>
      </PhotoGrid>
      {hide ? null : (
        <TileGrid columns={3} style={{ marginTop: space.sm }}>
          {day.macros.map(m => <V26Tile key={m.label} label={m.label} value={`${m.value}g`} sub={`of ${m.max}g`} meter={Math.min(1, m.value / m.max)} />)}
        </TileGrid>
      )}
    </Page>
  );
}

/* ───────────────────────── 6. A day of food ───────────────────────── */

export function FooddayV26() {
  const nav = useNavigation(), { choose } = useSeed(), day = useFuelDay(), hide = day.hide;
  const now = clock(), next = mealSlot(now);
  const logged = new Set(day.diary.map(m => mealSlot(m.at)));
  const open = (id: string) => { choose('selected-meal', id); nav.go('mealresult'); };
  const items = [
    ...day.diary.map(m => ({ when: `${mealSlot(m.at).toUpperCase()} · ${m.at}`, text: '', state: 'done' as const, children: (
      <MealCard meal={m} height={m === day.diary[day.diary.length - 1] ? 150 : 116} chips={hide ? undefined : [`${n(mealTotals(m.items).kcal)} kcal`]} onPress={() => open(m.id)} />
    ) })),
    ...(!logged.has(next) || next === 'Dinner' && !logged.has('Dinner') ? [{ when: next.toUpperCase(), text: 'Not logged yet.', state: 'now' as const, children: (
      <Box pad={space.md} style={{ marginTop: space.sm }}>
        <LifeSays>Snap it, say it or pick a saved meal when you eat.</LifeSays>
        <Btn label={`Add ${next.toLowerCase()}`} icon="camera" onPress={() => nav.go('snap')} style={{ marginTop: space.md }} />
      </Box>
    ) }] : []),
  ];
  return (
    <Page screen="foodday" bar={{ kind: 'push', title: 'Today’s food', action: { kind: 'icon', icon: 'calendar', label: 'Another day', onPress: () => nav.go('fuelprogress') } }}>
      <TintCard area="home" padding={space.md}>
        {hide
          ? <WordCols items={[{ small: 'Energy', value: shareWords(day.eaten, day.budget) }, { small: 'Protein', value: shareWords(day.totals.protein, day.targets.protein) }, { small: 'Fibre', value: shareWords(day.totals.fibre, day.targets.fibre) }]} />
          : <Cols items={[{ small: 'Energy', value: n(day.eaten), sub: `of ${n(day.budget)} kcal` }, { small: 'Protein', value: `${Math.round(day.totals.protein)}g`, sub: `of ${day.targets.protein}g` }, { small: 'Fibre', value: `${Math.round(day.totals.fibre)}g`, sub: `of ${day.targets.fibre}g` }]} />}
      </TintCard>
      <SpineTimeline items={items} style={{ marginTop: space.xl }} />
      <Callout style={{ marginTop: space.lg }}>Tap a meal to change a portion or swap an item.</Callout>
    </Page>
  );
}

/* ───────────────────────── 7. Log in two taps ───────────────────────── */

export function QuicklogV26() {
  const nav = useNavigation(), t = useTokens(), { data, draft } = useSeed(), day = useFuelDay(), log = useLogMeal(), saved = useSavedMeals();
  const params = useLocalSearchParams<{ state?: string }>();
  const [tab, setTab] = useState<'Recent' | 'Usual' | 'Quick add'>('Recent');
  const [done, setDone] = useState<{ name: string; kcal: number } | null>(params.state === 'logged' ? { name: 'Usual breakfast', kcal: 420 } : null);
  const hour = new Date().getHours();
  const order = hour < 11 ? ['Usual breakfast', 'Salmon rice bowl'] : hour < 16 ? ['Salmon rice bowl', 'Chicken wrap'] : ['Salmon rice bowl', 'Usual breakfast'];
  const usual = order.map(name => saved.find(s => s.name === name)).filter(Boolean) as typeof saved;
  const add = (name: string, kcal: number, items?: MealItem[], from?: string) => { log({ name, items: items ?? savedItems(name, kcal), via: from ? 'saved' : 'quick', from }); setDone({ name, kcal }); };
  const card = (s: (typeof saved)[number]) => {
    const isDone = done?.name === s.name;
    return (
      <MealCard key={s.name} meal={{ name: s.name }} height={150} sub={s.name === 'Usual breakfast' ? s.detail : undefined}
        chips={isDone ? undefined : [day.hide ? 'Saved' : `${n(s.kcal)} kcal`]}
        topRight={isDone ? <View style={styles.paperChip}><Icon name="check" size={14} color="#0B7A55" /><Text variant="buttonCompact" style={{ color: '#0B7A55' }}>Logged</Text></View> : <PlusRound label={`Log ${s.name}`} onPress={() => add(s.name, s.kcal, undefined, s.detail)} />}
        onPress={() => { if (!isDone) add(s.name, s.kcal, undefined, s.detail); }} />
    );
  };
  return (
    <Page screen="quicklog" bar={{ kind: 'sheet', title: 'Quick log' }}>
      <SegmentedV26 options={(['Recent', 'Usual', 'Quick add'] as const).map(v => ({ value: v, label: v }))} value={tab} onChange={v => { setTab(v); feedback.select(); }} />
      {tab === 'Quick add' ? (
        <View style={{ marginTop: space.lg }}>
          <Micro>What you had</Micro>
          <TextInput value={data.drafts['quick-food'] ?? ''} onChangeText={v => draft('quick-food', v)} placeholder="A flapjack, a pint of milk…" placeholderTextColor={t.inkQuiet}
            style={[styles.field, { backgroundColor: t.surface2, color: t.ink }]} accessibilityLabel="What you had" />
          {day.hide ? null : <>
            <Micro style={{ marginTop: space.md }}>Calories, if you know them</Micro>
            <TextInput value={data.drafts['quick-kcal'] ?? ''} onChangeText={v => draft('quick-kcal', v.replace(/[^0-9]/g, ''))} keyboardType="number-pad" placeholder="Optional" placeholderTextColor={t.inkQuiet}
              style={[styles.field, { backgroundColor: t.surface2, color: t.ink }]} accessibilityLabel="Calories" />
          </>}
          <Btn label="Log it" disabled={!(data.drafts['quick-food'] ?? '').trim()} style={{ marginTop: space.lg }}
            onPress={() => { const name = (data.drafts['quick-food'] ?? '').trim(), kcal = Number(data.drafts['quick-kcal']) || 0; log({ name, items: [{ name, grams: 100, kcal, protein: 0, carbs: 0, fat: 0, fibre: 0, confidence: .5 }], via: 'quick' }); draft('quick-food', ''); draft('quick-kcal', ''); setDone({ name, kcal }); setTab('Recent'); }} />
        </View>
      ) : tab === 'Usual' ? (
        <RowsCard style={{ marginTop: space.md }}>
          {saved.map(s => {
            const pic = mealPic({ name: s.name }, 1.6);
            return <Row key={s.name} thumb={pic?.source} thumbFocal={pic?.focal} icon={pic ? undefined : 'food'} title={s.name} sub={day.hide ? s.detail : `${s.detail} · ${n(s.kcal)} kcal`}
              right={done?.name === s.name ? <Chip label="Logged" tone="done" icon="check" /> : <RoundButton icon="add" size="sm" label={`Log ${s.name}`} onPress={() => add(s.name, s.kcal, undefined, s.detail)} />} />;
          })}
          {!saved.length ? <Row icon="food" title="No saved meals yet" sub="Save one from a meal you’ve logged" /> : null}
        </RowsCard>
      ) : (
        <>
          <View style={[styles.micro, { marginTop: space.md }]}>
            {done ? <Icon name="check" size={14} color={t.gain} /> : null}
            <Micro>{done ? `${done.name} logged${day.hide || !done.kcal ? '' : ` · ${n(done.kcal)} kcal`}` : 'Ordered for this time of day'}</Micro>
          </View>
          <PhotoGrid style={{ marginTop: space.sm }}>{usual.slice(0, 2).map(card)}</PhotoGrid>
          <View style={[styles.wrapRow, { marginTop: space.sm }]}>
            {quick.small.map(q => <SoftChip key={q.name} label={q.name} strong={day.hide ? undefined : `${q.brand ? `${q.brand} · ` : ''}${q.kcal}`}
              onPress={() => { const f = foods.find(x => x.name === q.name || x.name.startsWith(q.name)); add(q.name, q.kcal, [{ name: q.name, grams: f?.grams ?? 100, kcal: q.kcal, protein: f?.protein ?? 0, carbs: 0, fat: 0, fibre: 0, confidence: .9 }]); }} />)}
          </View>
          <QuietLink label="Back to today" onPress={nav.close} style={{ marginTop: space.lg }} />
        </>
      )}
    </Page>
  );
}

/* ───────────────────────── 8. Saved meals ───────────────────────── */

export function SavedmealsV26() {
  const nav = useNavigation(), t = useTokens(), { choose } = useSeed(), day = useFuelDay(), log = useLogMeal(), saved = useSavedMeals();
  const [done, setDone] = useState<string[]>([]);
  const withPic = saved.filter(s => mealPic({ name: s.name })), without = saved.filter(s => !mealPic({ name: s.name }));
  const preview = (name: string) => { choose('selected-meal', `saved:${name}`); nav.go('mealresult'); };
  const again = (s: (typeof saved)[number]) => { log({ name: s.name, items: savedItems(s.name, s.kcal), via: 'saved', from: s.detail }); setDone(d => [...d, s.name]); };
  const top = (s: (typeof saved)[number]) => done.includes(s.name)
    ? <View style={styles.paperChip}><Icon name="check" size={14} color="#0B7A55" /><Text variant="buttonCompact" style={{ color: '#0B7A55' }}>Logged</Text></View>
    : <PlusRound label={`Log ${s.name} again`} onPress={() => again(s)} />;
  const NUM = ['No meals', 'One meal', 'Two meals', 'Three meals', 'Four meals', 'Five meals', 'Six meals', 'Seven meals', 'Eight meals'];
  return (
    <Page screen="savedmeals" bar={{ kind: 'push', action: { kind: 'icon', icon: 'add', label: 'Save a meal', onPress: () => nav.go('foodday') } }}>
      <Eyebrow>Saved meals</Eyebrow>
      <Display s={saved.length ? `{${NUM[saved.length] ?? `${saved.length} meals`}} you have often. One tap logs ${saved.length === 1 ? 'it' : 'them'} again.` : '{No saved meals} yet. Save one from any meal you log.'} />
      {withPic[0] ? <MealCard meal={{ name: withPic[0].name }} height={190} size="lg" chips={[day.hide ? 'Saved' : `${n(withPic[0].kcal)} kcal`]} topRight={top(withPic[0])} sub={withPic[0].detail} onPress={() => preview(withPic[0].name)} /> : null}
      {withPic.length > 1 ? (
        <PhotoGrid style={{ marginTop: space.sm }}>
          {withPic.slice(1).map(s => <MealCard key={s.name} meal={{ name: s.name }} height={170} chips={[day.hide ? 'Saved' : `${n(s.kcal)} kcal`]} topRight={top(s)} sub={s.detail} onPress={() => preview(s.name)} />)}
        </PhotoGrid>
      ) : null}
      {without.map(s => (
        <Box key={s.name} pad={space.md} style={{ marginTop: space.sm }} onPress={() => preview(s.name)} accessibilityLabel={`${s.name}, ${s.detail}`}>
          <View style={styles.rowLine}>
            <View style={[styles.badge, { backgroundColor: t.surface2 }]}><Icon name={/shake/i.test(s.name) ? 'water' : 'food'} size={18} color={t.ink} /></View>
            <View style={{ flex: 1, minWidth: 0 }}><Text variant="title">{s.name}</Text><Text variant="callout" tone="ink2">{day.hide ? s.detail : `${s.detail} · ${n(s.kcal)} kcal`}</Text></View>
            {done.includes(s.name) ? <Chip label="Logged" tone="done" icon="check" /> : <RoundButton icon="add" size="sm" label={`Log ${s.name} again`} onPress={() => again(s)} />}
          </View>
        </Box>
      ))}
    </Page>
  );
}

/* ───────────────────────── 9. Search for a food ───────────────────────── */

export function FoodsearchV26() {
  const nav = useNavigation(), t = useTokens(), { data, set, choose } = useSeed(), saved = useSavedMeals(), day = useFuelDay();
  const params = useLocalSearchParams<{ state?: string; add?: string; q?: string }>();
  const [query, setQuery] = useState(params.state === 'banana' ? 'banana' : params.q ?? '');
  const appending = params.add === '1';
  const pick = (f: (typeof foods)[number]) => {
    const item: MealItem = { name: f.name, grams: f.grams, kcal: f.per100 ? f.kcal * f.grams / 100 : f.kcal, protein: f.per100 ? f.protein * f.grams / 100 : f.protein, carbs: 0, fat: 0, fibre: 0, confidence: .95 };
    feedback.select();
    if (appending) { set({ meal: [...data.meal, item] }); nav.close(); return; }
    choose('editing-meal', ''); choose('meal-photo', ''); set({ meal: [item] }); nav.go('confirm');
  };
  const q = query.trim().toLowerCase();
  const hits = q ? foods.filter(f => f.name.toLowerCase().includes(q)) : [];
  const recent = hits.filter(f => f.recent), rest = hits.filter(f => !f.recent);
  const sub = (f: (typeof foods)[number]) => day.hide ? (f.brand ?? 'A usual portion') : f.per100 ? `${f.kcal} kcal per 100g` : `${f.brand ? `${f.brand} · ` : ''}${f.kcal} kcal${f.protein >= 1 && !f.brand ? ` · ${g1(f.protein)}g protein` : ''}`;
  const hit = (f: (typeof foods)[number]) => <Row key={f.name} title={f.name} sub={sub(f)} onPress={() => pick(f)} right={<RoundButton icon="add" size="sm" label={`Add ${f.name}`} onPress={() => pick(f)} />} />;
  const input = useRef<React.ComponentRef<typeof TextInput>>(null);
  return (
    <Page screen="foodsearch" bar={{ kind: 'push', title: 'Find food', action: { kind: 'icon', icon: 'camera', label: 'Scan instead', onPress: () => nav.go('barcode') } }}>
      <View style={styles.searchRow}>
        <Icon name="search" size={22} color={t.ink} />
        <TextInput ref={input} value={query} onChangeText={setQuery} placeholder="Search foods" placeholderTextColor={t.inkQuiet} autoCorrect={false} returnKeyType="search"
          style={[styles.searchInput, { color: t.ink }]} accessibilityLabel="Search foods" />
        {query ? <RoundButton icon="close" size="sm" solid label="Clear" onPress={() => { setQuery(''); input.current?.focus(); }} /> : null}
      </View>
      {q ? (
        <>
          {recent.length ? <><Micro style={{ marginTop: space.lg }}>Recent</Micro><RowsCard style={{ marginTop: space.sm }}>{recent.map(hit)}</RowsCard></> : null}
          {rest.length ? <><Micro style={{ marginTop: space.xl }}>Everything</Micro><RowsCard style={{ marginTop: space.sm }}>{rest.map(hit)}</RowsCard></> : null}
          {!hits.length ? <>
            <Statement s={`Nothing found for {“${query.trim()}”}.`} style={{ marginTop: space.lg }} />
            <Body s="Try a shorter word, or add it with your own figures." style={{ marginTop: space.xs }} />
            <Btn label="Add it yourself" ghost onPress={() => { nav.go('quicklog'); }} style={{ marginTop: space.md }} />
          </> : null}
          <Callout style={{ marginTop: space.md }}>From UK CoFID and Open Food Facts. Your recent and favourite foods come first.</Callout>
        </>
      ) : (
        <>
          {saved.length ? <>
            <Micro style={{ marginTop: space.lg }}>Your meals</Micro>
            <Shelf style={{ marginTop: space.sm }}>
              {[...saved, ...(SHOW_SAMPLES ? [{ name: 'Apple and peanut butter', detail: 'Snack', kcal: 285 }] : [])].map(s => {
                const pic = mealPic({ name: s.name }, 1.8);
                return pic ? <PhotoTile key={s.name} source={pic.source} focal={pic.focal} title={s.name} onPress={() => { choose('selected-meal', `saved:${s.name}`); if (!saved.some(x => x.name === s.name)) { const f = foods.find(x => x.name === s.name); if (f) { pick(f); return; } } nav.go('mealresult'); }} /> : null;
              })}
            </Shelf>
          </> : null}
          <Micro style={{ marginTop: space.xxl }}>You often have</Micro>
          <View style={[styles.wrapRow, { marginTop: space.sm }]}>
            {often.map((o, i) => <SoftChip key={o} icon={i === 0 ? 'search' : 'add'} label={o} onPress={() => { if (i === 0) setQuery(o); else { const f = foods.find(x => x.name.toLowerCase().startsWith(o.toLowerCase())); if (f) pick(f); } }} />)}
          </View>
          {SHOW_SAMPLES ? <><Micro style={{ marginTop: space.xxl }}>Recent</Micro><RowsCard style={{ marginTop: space.sm }}>{foods.filter(f => f.recent).map(hit)}</RowsCard></> : null}
        </>
      )}
    </Page>
  );
}

/* ───────────────────────── 10. Scan a barcode ───────────────────────── */

export function BarcodeV26() {
  const nav = useNavigation(), day = useFuelDay(), log = useLogMeal();
  const [ml, setMl] = useState(250);
  const p = barcode.per100, k = ml / 100;
  const kcal = p.kcal * k;
  const item: MealItem = { name: barcode.food, grams: ml, kcal, protein: p.protein * k, carbs: p.carbs * k, fat: p.fat * k, fibre: p.fibre * k, confidence: 1 };
  const next = () => { const i = barcode.portions.indexOf(ml); setMl(barcode.portions[(i + 1) % barcode.portions.length]); feedback.select(); };
  return (
    <Page screen="barcode" scroll={false} bar={{ kind: 'none' }} contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
      backdrop={<View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[StyleSheet.absoluteFill, { bottom: undefined, height: '74%' }]}><PhotoFill source={photos.label} focal={{ x: .513, y: .95, zoom: 1.5 }} /></View>
        <TopBand />
        {SHOW_SAMPLES ? <><Corners ink style={{ left: '43%', top: '41%', width: 140, height: 96 }} /><Tag ink icon="check" label="Found" style={{ position: 'absolute', left: '50%', top: '36.5%' }} /></> : null}
      </View>}
      bottom={
        <CamSheet>
          {SHOW_SAMPLES ? <>
            <Row thumb={photos.label} thumbFocal={{ x: .51, y: .6, zoom: 2.2 }} title={barcode.name} sub={day.hide ? `${ml} ml` : `${ml} ml · ${n(kcal)} kcal · ${g1(item.protein)}g protein`} style={{ marginTop: space.xs }} />
            <PickRow label="Portion" value={`${ml} ml`} set onPress={next} style={{ marginTop: space.xxs }} />
            <Btn label={day.hide ? 'Log it' : `Log ${n(kcal)} kcal`} onPress={() => { log({ name: barcode.food, items: [item], via: 'scan' }); nav.replace('mealresult'); }} style={{ marginTop: space.sm }} />
            <Callout style={{ marginTop: space.sm }}>The label comes from Open Food Facts. Foods you’ve scanned before work offline.</Callout>
          </> : <>
            <Statement s="Barcode scanning comes with the {next camera update}." style={{ marginTop: space.sm }} />
            <Btn label="Search instead" icon="search" onPress={() => nav.replace('foodsearch')} style={{ marginTop: space.md }} />
          </>}
        </CamSheet>
      }>
      <CamBar label="Point at the barcode" />
      <View style={{ flex: 1, justifyContent: 'flex-end', paddingHorizontal: space.gutter, paddingBottom: 18 }}><Modes active="barcode" /></View>
    </Page>
  );
}

/* ───────────────────────── 11. Scan a nutrition label ───────────────────────── */

export function LabelscanV26() {
  const nav = useNavigation(), day = useFuelDay(), log = useLogMeal();
  const [pick, setPick] = useState<string>('45 g'), [other, setOther] = useState(80);
  const grams = pick === 'Other' ? other : Number.parseInt(pick, 10);
  const p = labelData.per100, k = grams / 100, kcal = p.kcal * k;
  const item: MealItem = { name: labelData.name, grams, kcal, protein: p.protein * k, carbs: p.carbs * k, fat: p.fat * k, fibre: p.fibre * k, confidence: .95 };
  return (
    <Page screen="labelscan" scroll={false} bar={{ kind: 'none' }} contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
      backdrop={<View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <View style={[StyleSheet.absoluteFill, { bottom: undefined, height: '78%' }]}><PhotoFill source={photos.label} focal={{ x: .554, y: .617, zoom: 1.75 }} /></View>
        <TopBand />
        {SHOW_SAMPLES ? <>
          <Corners style={{ left: '17%', top: '12.5%', width: 232, height: 388 }} />
          <Tag ink label="Energy" em={`${p.kcal} kcal`} style={{ position: 'absolute', left: '24.5%', top: '20%' }} />
          <Tag ink label="Carbohydrate" em={`${p.carbs} g`} style={{ position: 'absolute', left: '24.5%', top: '30.2%' }} />
          <Tag ink label="Protein" em={`${p.protein} g`} style={{ position: 'absolute', left: '24.5%', top: '40.4%' }} />
        </> : null}
      </View>}
      bottom={
        <CamSheet>
          {SHOW_SAMPLES ? <>
            <View style={[styles.betweenEnd, { marginTop: space.xs }]}>
              <View><Eyebrow>{`${labelData.name}, ${grams} g`}</Eyebrow>{day.hide ? <Text variant="headline">A usual bowl</Text> : <Figure value={n(kcal)} unit="kcal" style={{ marginTop: space.xxs }} />}</View>
              {day.hide ? null : <Text variant="callout" tone="ink2" style={{ marginBottom: space.xs }}>{`${p.kcal} kcal per 100 g`}</Text>}
            </View>
            <SegmentedV26 options={[...labelData.portions.map(v => ({ value: `${v} g`, label: `${v} g` })), { value: 'Other', label: 'Other' }]} value={pick} onChange={v => { setPick(v); feedback.select(); }} style={{ marginTop: space.sm }} />
            {pick === 'Other' ? <View style={{ marginTop: space.sm }}><SliderV26 value={other} min={10} max={150} step={5} onChange={setOther} accessibilityLabel="Portion in grams" /></View> : null}
            <Btn label={day.hide ? 'Log it' : `Log ${n(kcal)} kcal`} onPress={() => { log({ name: labelData.name, items: [item], via: 'label' }); nav.replace('mealresult'); }} style={{ marginTop: space.sm }} />
            <Callout style={{ marginTop: space.tile }}>{`Read on your phone, per 100 g: fat ${p.fat} g (saturates ${p.saturates} g), carbohydrate ${p.carbs} g (sugars ${p.sugars} g), protein ${p.protein} g, salt ${p.salt} g.`}</Callout>
          </> : <>
            <Statement s="Reading labels comes with the {next camera update}." style={{ marginTop: space.sm }} />
            <Btn label="Add it yourself" onPress={() => nav.replace('quicklog')} style={{ marginTop: space.md }} />
          </>}
        </CamSheet>
      }>
      <CamBar label="Reading the label…" />
      <View style={{ flex: 1 }} />
    </Page>
  );
}

/* ───────────────────────── 12. What should I order? ───────────────────────── */

function Pin({ n: num, best, quiet }: { n: number; best?: boolean; quiet?: boolean }) {
  const t = useTokens();
  return <View style={[styles.pin, { backgroundColor: best ? t.ember : quiet ? t.surface2 : photo.ink }]}><Text variant="micro" style={{ color: best ? '#08090A' : quiet ? t.ink : photo.onPhoto }}>{num}</Text></View>;
}

export function MenuscanV26() {
  const nav = useNavigation(), t = useTokens(), day = useFuelDay(), log = useLogMeal();
  const proteinLeft = Math.max(0, Math.round(day.targets.protein - day.totals.protein));
  const fitting = menu.filter(d => d.kcal <= day.left);
  const best = (fitting.length ? fitting : [...menu].sort((a, b) => a.kcal - b.kcal)).reduce((a, b) => fitting.length ? (b.protein > a.protein ? b : a) : a);
  const others = menu.filter(d => d !== best);
  const at = (d: (typeof menu)[number]) => menu.indexOf(d) + 1;
  const eat = (d: (typeof menu)[number]) => { log({ name: d.name, items: [{ name: d.name, grams: 400, kcal: d.kcal, protein: d.protein, carbs: Math.round(d.kcal * .1), fat: Math.round(d.kcal * .035), fibre: 5, confidence: .6 }], via: 'menu' }); nav.replace('mealresult'); };
  return (
    <Page screen="menuscan" scroll={false} contentStyle={{ paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }}
      backdrop={<View pointerEvents="none" style={[StyleSheet.absoluteFill, { bottom: undefined, height: 440 }]}><PhotoFill source={photos.breakfast} focal={{ x: 1, y: 0, zoom: 2.1 }} /><LinearGradient colors={photoScrims.fade.colors} locations={photoScrims.fade.locations} style={StyleSheet.absoluteFill} /></View>}
      bar={{ kind: 'photo', left: <View style={styles.rowLine}><PhotoRound icon="back" label="Back" onPress={nav.close} /><StatusPill size="chip" onPhoto label={`${menu.length} dishes read from the menu`} /></View>, right: <PhotoRound icon="camera" label="Snap it again" onPress={() => nav.replace('snap')} /> }}>
      <View style={{ height: 280 }}>
        <Corners style={{ left: 22, right: 22, top: 26, bottom: 30 }} />
        <View style={[styles.menuCard, { ...cardShadow(t.scheme) }]}>
          <Text variant="micro" style={{ color: photo.ink, opacity: .6, textAlign: 'center', letterSpacing: 2 }}>MAINS</Text>
          {menu.map(d => <View key={d.name} style={styles.menuLine}><Text variant="buttonCompact" style={{ color: photo.ink, flex: 1 }}>{d.name}</Text><Pin n={at(d)} best={d === best} /></View>)}
        </View>
      </View>
      <View style={[styles.panel, { backgroundColor: t.surface, paddingTop: space.lg }]}>
        <Eyebrow>{day.hide ? 'Here’s what fits your day best.' : `You have about ${n(day.left)} kcal and ${proteinLeft} g protein left today.`}</Eyebrow>
        <Statement s={fitting.length ? `Order the {${best.name.toLowerCase()}}.` : `Everything here is over today’s budget. The {${best.name.toLowerCase()}} is the lightest.`} style={{ marginTop: space.xs }} />
        <View style={[styles.wrapRow, { marginTop: space.sm }]}><Chip label="Best fit" tone="live" />{day.hide ? null : <Chip label={`~${n(best.kcal)} kcal · ${best.protein} g protein`} />}</View>
        <View style={{ marginTop: space.xs }}>
          {others.map(d => <Row key={d.name} lead={<Pin n={at(d)} quiet />} title={d.name} sub={day.hide ? undefined : `~${n(d.kcal)} kcal · ${d.protein} g protein`} onPress={() => eat(d)}
            right={<Chip label={d.kcal > day.left ? 'Over today’s budget' : 'Good'} tone="q" />} />)}
        </View>
        <View style={{ flex: 1 }} />
        <Callout>{SHOW_SAMPLES ? 'Restaurant portions vary; these are estimates.' : 'An example menu. Reading a real menu comes with the next camera update.'}</Callout>
        <Btn label="I’ll have this" onPress={() => eat(best)} style={{ marginTop: space.sm }} />
      </View>
    </Page>
  );
}

/* ───────────────────────── 13. Say what you ate ───────────────────────── */

type Heard = MealItem & { portion: string };
/** Find the foods named in what you said, from the ones life knows: "a chicken wrap and a large oat latte". */
function findFoods(text: string): Heard[] {
  const s = text.toLowerCase();
  const out: Heard[] = [];
  for (const i of sayit.items) { const key = i.name.toLowerCase().replace(', large', ''); if (s.includes(key)) out.push({ ...i, portion: i.portion }); }
  for (const f of foods) {
    const key = f.name.toLowerCase().split(',')[0];
    if (s.includes(key) && !out.some(o => o.name.toLowerCase().includes(key) || key.includes(o.name.toLowerCase().split(',')[0]))) {
      out.push({ name: f.name, grams: f.grams, kcal: f.per100 ? f.kcal * f.grams / 100 : f.kcal, protein: f.protein, carbs: 0, fat: 0, fibre: 0, confidence: .8, portion: '1 portion' });
    }
  }
  return out;
}

export function SayitV26() {
  const nav = useNavigation(), t = useTokens(), { data, set, choose } = useSeed(), day = useFuelDay(), log = useLogMeal();
  const params = useLocalSearchParams<{ add?: string }>();
  const [text, setText] = useState(SHOW_SAMPLES ? sayit.heard.replace(/[{}]/g, '') : '');
  const [listening, setListening] = useState(false), [error, setError] = useState(''), [typing, setTyping] = useState(!SHOW_SAMPLES);
  useEffect(() => () => { void voice.stop(); }, []);
  const items = findFoods(text);
  const total = items.reduce((a, i) => a + i.kcal, 0);
  const listen = async () => {
    setError('');
    if (listening) { const said = await voice.stop(); if (said) setText(said); setListening(false); return; }
    try {
      setListening(true); setText('');
      await voice.start((said, final, failure) => { setText(said); if (final || failure) setListening(false); if (failure) setError(failure); });
    } catch (e) { setListening(false); setError(e instanceof Error ? e.message : 'The microphone didn’t start. You can type instead.'); setTyping(true); }
  };
  const edit = (i: Heard) => { choose('editing-meal', ''); choose('meal-photo', ''); set({ meal: [{ ...i }] }); nav.go('confirm'); };
  const done = () => {
    const meal: MealItem[] = items.map(({ portion: _p, ...i }) => i);
    if (params.add === '1') { set({ meal: [...data.meal, ...meal] }); nav.close(); return; }
    log({ name: nameFor(meal), items: meal, via: 'said', at: SHOW_SAMPLES && text === sayit.heard.replace(/[{}]/g, '') ? sayit.at : undefined });
    nav.replace('mealresult');
  };
  const heardTwoTone = text === sayit.heard.replace(/[{}]/g, '') ? sayit.heard : items.reduce((s, i) => { const key = i.name.toLowerCase().replace(', large', '').split(',')[0]; const at = s.toLowerCase().indexOf(key); return at < 0 ? s : `${s.slice(0, at)}{${s.slice(at, at + key.length)}}${s.slice(at + key.length)}`; }, text);
  return (
    <Page screen="sayit" bar={{ kind: 'sheet', title: 'Say what you ate' }}
      footer={<>
        <Btn label={!items.length ? 'Log it' : day.hide ? `Log ${items.length === 1 ? 'it' : 'them'}` : `Log ${n(total)} kcal`} disabled={!items.length} onPress={done} />
        <Btn label={listening ? 'Stop' : 'Say it again'} icon="mic" ghost onPress={() => void listen()} style={{ marginTop: space.xs }} />
      </>}>
      <View style={{ alignItems: 'center', paddingTop: space.xxs }}><LifeOrb size={72} state={listening ? 'listening' : 'ring'} /></View>
      <Callout center style={{ marginTop: space.xxs }}>{listening ? 'Listening…' : typing ? 'Type it, or tap Say it again' : 'What life heard'}</Callout>
      {typing ? (
        <TextInput value={text} onChangeText={setText} multiline placeholder="I had a chicken wrap and a large oat latte around 1." placeholderTextColor={t.inkQuiet}
          style={[styles.sayInput, { color: t.ink }]} accessibilityLabel="What you ate" />
      ) : (
        <Press haptic="select" onPress={() => setTyping(true)} accessibilityLabel={`${text}. Tap to change the words`}><Display s={heardTwoTone} style={{ marginTop: space.md }} /></Press>
      )}
      {error ? <Callout style={{ marginTop: space.xs }}>{error}</Callout> : null}
      {items.length ? (
        <>
          <PhotoGrid style={{ marginTop: space.xl }}>
            {items.map(i => {
              const pic = mealPic({ name: i.name }, 1.5);
              return pic
                ? <PhotoCard key={i.name} source={pic.source} focal={pic.focal} height={150} size="md" chips={[i.name]} title={day.hide ? i.portion : `${n(i.kcal)} kcal`} sub={day.hide ? undefined : `${i.portion} · ${Math.round(i.protein)}g protein`} onPress={() => edit(i)} />
                : (
                  <TintCard key={i.name} area="home" onPress={() => edit(i)} accessibilityLabel={`${i.name}, ${n(i.kcal)} kcal`} style={{ minHeight: 150 }}>
                    <Text variant="micro" tone="ink2">{i.name}</Text><View style={{ flex: 1 }} />
                    {day.hide ? <Text variant="title">{i.portion}</Text> : <Figure value={n(i.kcal)} unit="kcal" size="num" />}
                    {day.hide ? null : <Text variant="callout" tone="ink2">{`${i.portion} · ${Math.round(i.protein)}g protein`}</Text>}
                  </TintCard>
                );
            })}
          </PhotoGrid>
          <Callout center style={{ marginTop: space.sm }}>{items.length === 1 ? 'Tap it to edit it.' : 'Tap either one to edit it.'}</Callout>
        </>
      ) : text.trim() ? <Body s="life didn’t find a food it knows in that. Try naming it plainly, or search for it." style={{ marginTop: space.md }} /> : null}
      <View style={[styles.saysRow, { marginTop: space.md }]}><Icon name="shield" size={18} color={t.ink} /><Text variant="callout" tone="ink2" style={{ flex: 1 }}>Your voice is turned into text on your phone. Nothing is recorded or sent.</Text></View>
    </Page>
  );
}

/* ───────────────────────── 14. Fix it in your own words ───────────────────────── */

/** Apply "half the rice, no egg, extra salmon" to a meal's items. */
export function applyWords(items: MealItem[], words: string) {
  const s = words.toLowerCase();
  const rule = (name: string) => {
    const w = name.toLowerCase().split(/[ ,]/)[0].replace(/s$/, '');
    const near = (re: string) => new RegExp(`${re}\\s+(?:the\\s+|of\\s+the\\s+|of\\s+)?${w}`).test(s);
    return near('no') || near('without') ? 0 : near('half') ? .5 : near('double') ? 2 : near('extra') || near('more') || new RegExp(`${w}[^,.]*extra`).test(s) ? 1.5 : near('less') ? .75 : 1;
  };
  return items.map(i => { const k = rule(i.name); return { item: { ...i, grams: i.grams * k, kcal: i.kcal * k, protein: i.protein * k, carbs: i.carbs * k, fat: i.fat * k, fibre: i.fibre * k }, was: i }; });
}

export function FixwordsV26() {
  const nav = useNavigation(), t = useTokens(), { data, set } = useSeed(), day = useFuelDay();
  const [words, setWords] = useState(SHOW_SAMPLES ? fixDefault : ''), [typing, setTyping] = useState(!SHOW_SAMPLES), [listening, setListening] = useState(false), [error, setError] = useState('');
  useEffect(() => () => { void voice.stop(); }, []);
  const fixed = applyWords(data.meal, words);
  const changed = fixed.filter(f => Math.round(f.item.grams) !== Math.round(f.was.grams));
  const total = fixed.reduce((a, f) => a + f.item.kcal, 0);
  const NUM = ['Nothing', '1 thing', '2 things', '3 things', '4 things', '5 things'];
  const twoTone = changed.reduce((s, f) => { const w = f.was.name.toLowerCase().split(/[ ,]/)[0]; const m = new RegExp(`((?:half|no|without|double|extra|more|less)\\s+(?:the\\s+)?${w}s?|${w}s?[^,.]*extra\\s*\\w*)`, 'i').exec(s); return m ? s.replace(m[0], `{${m[0]}}`) : s; }, words);
  const listen = async () => {
    setError('');
    if (listening) { const said = await voice.stop(); if (said) setWords(said); setListening(false); return; }
    try { setListening(true); await voice.start((said, final, failure) => { setWords(said); if (final || failure) setListening(false); if (failure) setError(failure); }); }
    catch (e) { setListening(false); setTyping(true); setError(e instanceof Error ? e.message : 'The microphone didn’t start. You can type instead.'); }
  };
  return (
    <Page screen="fixwords" bar={{ kind: 'sheet', title: 'Fix the estimate' }}
      footer={<>
        <Btn label="Looks right" disabled={!changed.length} onPress={() => { set({ meal: fixed.map(f => f.item).filter(i => i.grams > 0) }); feedback.file(); nav.close(); }} />
        <Press haptic="select" onPress={() => void listen()} accessibilityLabel={listening ? 'Stop listening' : 'Say it again'} style={styles.quietMic}>
          <Icon name="mic" size={14} color={t.ink2} /><Text variant="callout" tone="ink2">{listening ? 'Listening… tap to stop' : 'Say it again'}</Text>
        </Press>
      </>}>
      <View style={styles.saysRow}><LifeOrb size={28} /><Text variant="callout" tone="ink2">{listening ? 'Listening…' : 'You said'}</Text></View>
      {typing
        ? <TextInput value={words} onChangeText={setWords} multiline placeholder="Half the rice, no sauce, extra chicken." placeholderTextColor={t.inkQuiet} style={[styles.fixInput, { color: t.ink }]} accessibilityLabel="What changed" />
        : <Press haptic="select" onPress={() => setTyping(true)} accessibilityLabel={`${words}. Tap to change the words`}><Statement s={twoTone} style={{ marginTop: space.sm }} /></Press>}
      {error ? <Callout style={{ marginTop: space.xs }}>{error}</Callout> : null}
      <View style={[styles.betweenEnd, { marginTop: space.xl }]}>
        <View><Eyebrow>New total</Eyebrow>{day.hide ? <Text variant="headline">Portions adjusted</Text> : <Figure value={n(total)} unit="kcal" style={{ marginTop: space.xxs }} />}</View>
        <Chip label={`${NUM[changed.length] ?? `${changed.length} things`} changed`} tone="q" style={{ marginBottom: space.tile }} />
      </View>
      {changed.length ? (
        <RowsCard style={{ marginTop: space.md }}>
          {changed.map(f => (
            <Row key={f.was.name} title={f.was.name} sub={`${Math.round(f.was.grams)} g → ${f.item.grams ? `${Math.round(f.item.grams)} g` : '0'}`}
              right={day.hide ? undefined : <Text variant="rowTitle" style={{ fontVariant: ['tabular-nums'] }}>{`${f.item.kcal > f.was.kcal ? '+' : '−'}${n(Math.abs(f.item.kcal - f.was.kcal))}`}<Text variant="callout" tone="ink2">{' kcal'}</Text></Text>} />
          ))}
        </RowsCard>
      ) : <Body s="Say what was different: half the rice, no sauce, extra chicken." style={{ marginTop: space.md }} />}
      <Callout style={{ marginTop: space.sm }}>Corrections teach life your usual portions.</Callout>
    </Page>
  );
}

const styles = StyleSheet.create({
  tag: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 6, height: 28, paddingLeft: 9, paddingRight: 11, borderRadius: radius.full, shadowColor: '#000', shadowOpacity: .18, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 3 },
  tagDot: { width: 6, height: 6, borderRadius: 3 },
  round: { width: 40, height: 40, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  roundSm: { width: 32, height: 32, borderRadius: radius.full, alignItems: 'center', justifyContent: 'center' },
  camBar: { height: 52, paddingHorizontal: space.gutter, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.xs },
  orbChip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 28, paddingLeft: 8, paddingRight: 12, borderRadius: radius.full, backgroundColor: photo.onPhoto, flexShrink: 1 },
  modes: { flexDirection: 'row', alignSelf: 'center', gap: 2, padding: 4, borderRadius: radius.full, backgroundColor: photo.ink },
  mode: { height: 34, paddingHorizontal: 10, borderRadius: radius.full, justifyContent: 'center' },
  shutterRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 36, marginTop: space.md },
  shutter: { width: 76, height: 76, borderRadius: 38, borderWidth: 4, alignItems: 'center', justifyContent: 'center' },
  shutterIn: { width: 60, height: 60, borderRadius: 30 },
  camSheet: { borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: space.lg },
  handle: { width: 36, height: 5, borderRadius: 3, alignSelf: 'center', marginTop: space.xs },
  saysRow: { flexDirection: 'row', alignItems: 'flex-start', gap: space.tile, marginTop: space.md },
  centre: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.xxl },
  panel: { flex: 1, minHeight: 0, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: space.lg },
  sheetTitle: { height: 52, flexDirection: 'row', alignItems: 'center', gap: space.xs },
  betweenEnd: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: space.sm },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: space.xs },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: 64 },
  thumb: { width: 48, height: 48, borderRadius: radius.md, overflow: 'hidden' },
  thumbIcon: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  gramChip: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 32, paddingLeft: space.sm, paddingRight: space.tile, borderRadius: radius.full },
  hero: { borderRadius: radius.lg },
  heroIn: { borderRadius: radius.lg, overflow: 'hidden' },
  paperChip: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 28, paddingHorizontal: space.sm, borderRadius: radius.full, backgroundColor: photo.onPhoto },
  fitChip: { alignSelf: 'flex-start', height: 28, paddingHorizontal: space.sm, borderRadius: radius.full, backgroundColor: photo.onPhoto, justifyContent: 'center' },
  mealTop: { height: 206, justifyContent: 'flex-end', paddingHorizontal: space.gutter, paddingBottom: 18 },
  mealSheet: { flex: 1, minHeight: 0, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, paddingHorizontal: space.lg, paddingTop: 22 },
  micro: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  field: { marginTop: space.xs, height: 52, borderRadius: radius.md, paddingHorizontal: space.md, fontSize: 16, fontFamily: fonts.sans },
  soft: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingLeft: space.tile, paddingRight: 14, borderRadius: radius.full },
  rowLine: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  badge: { width: 40, height: 40, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: space.tile, height: 48 },
  searchInput: { flex: 1, fontSize: 30, lineHeight: 36, letterSpacing: -.6, fontFamily: fonts.sansMedium, paddingVertical: 0 },
  pin: { width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuCard: { position: 'absolute', left: 36, right: 36, top: 62, backgroundColor: photo.onPhoto, borderRadius: 6, paddingTop: space.md, paddingHorizontal: 18, paddingBottom: 18, transform: [{ rotate: '-2deg' }] },
  menuLine: { flexDirection: 'row', alignItems: 'center', gap: space.xs, marginTop: 14 },
  sayInput: { marginTop: space.md, fontSize: 34, lineHeight: 39, letterSpacing: -1.1, fontFamily: fonts.sansMedium, minHeight: 120, textAlignVertical: 'top' },
  fixInput: { marginTop: space.sm, fontSize: 24, lineHeight: 31, letterSpacing: -.5, fontFamily: fonts.sansMedium, minHeight: 90, textAlignVertical: 'top' },
  quietMic: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 44, marginTop: space.xxs },
});
