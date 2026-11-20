/**
 * Fuel: the day worked out from the meals in your diary, and the figures only the V26 board has (`fuel.js`).
 * Today, Body and Fuel all read `useFuelDay`, so a meal logged anywhere moves every screen that shows food.
 *
 * Targets (Phase 27): a real account's come from the engine (`planTargets` in `@life/core`): the food_target row
 * (goal, pace, target weight, exercise added back), the body profile and the health days as evidence. The sample
 * life keeps the board's figures, as Edem asked, unless real health readings have arrived. Real accounts start the
 * day with an empty diary and no sample exercise.
 */
import { activeToday, dayBudget, planTargets, type BodyProfileRow, type FoodTargetRow, type PlanTargets } from '@life/core';
import { hasRealHealth } from '@/services/health/consent';
import { useSeed, type SeedData } from './SeedProvider';
import { seed, seedDiaryMeals, type MealItem } from './seed';
import { SHOW_SAMPLES } from './sample';
import { load } from './body';

export type Totals = { kcal: number; protein: number; carbs: number; fat: number; fibre: number };
/** How a meal reached the diary. */
export type MealVia = 'photo' | 'said' | 'scan' | 'search' | 'saved' | 'quick' | 'menu' | 'label' | 'plan';
export type DiaryMeal = { id: string; name: string; at: string; items: MealItem[]; day?: string; photo?: string; via?: MealVia; from?: string };

/** The food_target row as the phone keeps it (choices and prefs, projected to the table by `data/projection.ts`). */
export const foodTargetRow = (data: Pick<SeedData, 'choices' | 'prefs'>): FoodTargetRow => ({
  goal: data.choices['fuel-goal'] ?? null,
  target_weight: data.choices['target-weight'] ? Number(data.choices['target-weight']) : null,
  pace: data.choices['fuel-pace'] ? Number(data.choices['fuel-pace']) : null,
  exercise_addback: data.prefs.addback ?? null,
});
/** The body profile as the phone keeps it. */
export const bodyProfileRow = (data: Pick<SeedData, 'choices' | 'profile' | 'heightCm' | 'weightKg'>): BodyProfileRow => ({
  age: data.profile.age, sexAtBirth: data.choices['sex-at-birth'] ?? null, heightCm: data.heightCm, weightKg: data.weightKg, activity: data.choices.activity ?? null,
});
/** Whether Fuel's targets come from the engine: always on a real account, and on the sample life once real readings arrive. */
export const engineTargets = (data: Pick<SeedData, 'choices' | 'health'>) => !SHOW_SAMPLES || hasRealHealth(data);
/** The engine's targets for this person, from what the phone stores. */
export function usePlanTargets(): PlanTargets {
  const { data } = useSeed();
  return planTargets({ record: foodTargetRow(data), profile: bodyProfileRow(data), days: data.health.days, today: dayKey(), health: data.profile.health });
}

const ZERO: Totals = { kcal: 0, protein: 0, carbs: 0, fat: 0, fibre: 0 };
export const mealTotals = (items: MealItem[]): Totals => items.reduce((a, b) => ({ kcal: a.kcal + b.kcal, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat, fibre: a.fibre + b.fibre }), ZERO);
/** The local date, "2026-11-20", so a diary starts fresh each morning. */
export const dayKey = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const clock = (d = new Date()) => d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
/** Breakfast, Lunch, Snack or Dinner, from the time a meal was eaten. */
export function mealSlot(at: string) {
  const [hh, mm] = at.split(':').map(Number);
  if (!Number.isFinite(hh)) return 'Meal';
  const h = hh + (mm || 0) / 60;
  return h < 11 ? 'Breakfast' : h < 15 ? 'Lunch' : h < 17.5 ? 'Snack' : 'Dinner';
}
/** A share of a target in words, for "Hide numbers". */
export function shareWords(value: number, target: number) {
  const p = target > 0 ? value / target : 0;
  return p >= 1 ? 'Reached' : p >= .85 ? 'Nearly there' : p >= .55 ? 'Over halfway' : p >= .45 ? 'About halfway' : p >= .2 ? 'Under half' : 'Just started';
}
/** What's left of today's energy in words, as a phrase that opens a sentence: "About a third". */
export function leftWords(left: number, budget: number) {
  const p = budget > 0 ? left / budget : 0;
  return p <= .05 ? 'Very little' : p < .2 ? 'A little' : p < .42 ? 'About a third' : p < .58 ? 'About half' : p < .75 ? 'More than half' : 'Most';
}

/* ───────────────────────── The day ───────────────────────── */

/** Today's workouts from Body (`load.made`) with the watch's estimate for each; the rest of the 600 is moving about. */
export const watchToday = load.made.map((m, i) => ({ what: m.what, when: m.when, mins: Number.parseInt(m.mins, 10), kcal: [130, 170][i] ?? 0 }));

export function useFuelDay() {
  const { data, engine } = useSeed();
  const today = dayKey();
  const base: DiaryMeal[] = SHOW_SAMPLES ? seedDiaryMeals : [];
  const logged = (data.meals as DiaryMeal[]).filter(m => !m.day || m.day === today);
  const diary = [...base.map(m => logged.find(s => s.id === m.id) ?? m), ...logged.filter(m => !base.some(b => b.id === m.id))]
    .sort((a, b) => a.at.localeCompare(b.at));
  const totals = diary.reduce((a, m) => { const t = mealTotals(m.items); return { kcal: a.kcal + t.kcal, protein: a.protein + t.protein, carbs: a.carbs + t.carbs, fat: a.fat + t.fat, fibre: a.fibre + t.fibre }; }, ZERO);
  const f = seed.fuel;
  const real = engineTargets(data);
  const plan = real ? planTargets({ record: foodTargetRow(data), profile: bodyProfileRow(data), days: data.health.days, today, health: data.profile.health }) : null;
  /** False when a real account has no targets yet (details missing); screens then ask for them instead of showing zeros. */
  const ready = !plan || plan.available;
  const described = data.choices['described-day'] === today ? Number(data.choices['described-kcal'] ?? 0) || 0 : 0;
  const share = data.prefs.addback === 'All' ? 1 : data.prefs.addback === 'Half' ? .5 : 0;
  let target: number, watch: number, added: number;
  if (plan) {
    target = plan.available ? plan.kcal : 0;
    const active = activeToday(data.health.days, today);
    watch = active.kcal;
    // Only activity above your usual day comes back when what you use already counts it (measured or from Load).
    const back = plan.available ? dayBudget({ target, uses: plan.uses, activeToday: watch, addBack: plan.addBack }) : { budget: 0, added: 0 };
    added = back.added + Math.round(described * share);
  } else {
    target = Number(data.choices['fuel-kcal'] ?? f.kcal) || f.kcal;
    watch = SHOW_SAMPLES ? f.burned : 0;
    added = Math.round((watch + described) * share);
  }
  const burned = watch + described;
  const budget = target + added;
  const eaten = Math.round(totals.kcal);
  const left = Math.max(0, budget - eaten);
  const waterMl = Number(data.choices['water-ml'] ?? (SHOW_SAMPLES ? seed.health.waterMl : 0)) || 0;
  // No targets yet on a real account means none at all, never the sample life's.
  const targets = plan
    ? plan.available ? { protein: plan.protein, carbs: plan.carbs, fat: plan.fat, fibre: plan.fibre, waterMl: plan.waterMl } : { protein: 0, carbs: 0, fat: 0, fibre: 0, waterMl: engine.targets.waterMl }
    : { protein: f.protein, carbs: f.carbs, fat: f.fat, fibre: f.fibre, waterMl: engine.targets.waterMl };
  const macros = [
    { label: 'Protein', value: Math.round(totals.protein), max: targets.protein, unit: 'g' },
    { label: 'Carbs', value: Math.round(totals.carbs), max: targets.carbs, unit: 'g' },
    { label: 'Fat', value: Math.round(totals.fat), max: targets.fat, unit: 'g' },
  ];
  return { today, diary, totals, eaten, target, watch, described, burned, share, added, budget, left, waterMl, targets, macros, hide: !!data.prefs.hideNumbers, plan, ready };
}
export type FuelDay = ReturnType<typeof useFuelDay>;
/** How much of today's budget is eaten, 0 to 1; 0 when there is no budget yet. */
export const fuelShare = (day: Pick<FuelDay, 'eaten' | 'budget'>) => (day.budget > 0 ? Math.min(1, day.eaten / day.budget) : 0);
/** The small line under a budget, such as "/2,050 kcal", or "kcal so far" before there is a target. */
export const budgetScale = (day: Pick<FuelDay, 'budget' | 'ready'>) => (day.ready && day.budget > 0 ? `/${day.budget.toLocaleString('en-GB')} kcal` : 'kcal so far');
/** Each macro as what is left, or as what is eaten before there are targets. */
export const macroParts = (day: Pick<FuelDay, 'macros' | 'ready'>) =>
  day.macros.map(m => ({ label: m.label, value: day.ready && m.max > 0 ? `${Math.max(0, m.max - m.value)}${m.unit} left` : `${m.value}${m.unit} eaten` }));

/* ───────────────────────── Board-only figures ───────────────────────── */

/** What the camera names as you hold still, placed over the bowl (left and top as a share of the photo). */
export const snapTags: Record<string, { left: number; top: number }> = { Egg: { left: .36, top: .315 }, Salmon: { left: .385, top: .46 }, Rice: { left: .533, top: .587 }, Avocado: { left: .164, top: .558 } };
/** The piece of the lunch photograph that shows each item (centre and zoom, the board's crops). */
export const itemCrops: Record<string, { x: number; y: number; zoom: number }> = {
  Salmon: { x: .565, y: .52, zoom: 2.6 }, Rice: { x: .7, y: .635, zoom: 4.2 }, Avocado: { x: .295, y: .6, zoom: 3.6 }, Edamame: { x: .17, y: .47, zoom: 4.2 }, Egg: { x: .435, y: .387, zoom: 4 },
};

export const cook = {
  found: ['Chicken thighs', 'Chickpeas', 'Spinach', 'Eggs', 'Rice', 'Black beans'],
  diets: ['Halal', 'Vegetarian', 'Vegan', 'High-protein', 'Dairy-free', 'Keto'] as const,
  recipes: [
    { title: 'Chicken, chickpea and spinach stew', mins: 25, kcal: 610, protein: 46, diets: ['Halal', 'High-protein', 'Dairy-free'],
      steps: ['Brown the chicken thighs in a little oil, 6 minutes.', 'Add a chopped onion, garlic and a spoon of cumin; soften for 3 minutes.', 'Tip in the chickpeas and a tin of tomatoes; simmer 12 minutes.', 'Stir the spinach through until it wilts. Serve with rice.'] },
    { title: 'Egg and black bean breakfast wrap', mins: 10, kcal: 480, protein: 29, diets: ['Halal', 'Vegetarian', 'High-protein'],
      steps: ['Warm the black beans with a pinch of chilli.', 'Scramble two eggs softly.', 'Fill a warm wrap with beans, egg and a handful of spinach.', 'Roll it tight and toast it seam-down for a minute.'] },
    { title: 'Chickpea and spinach stew', mins: 25, kcal: 510, protein: 24, diets: ['Halal', 'Vegetarian', 'Vegan', 'Dairy-free'],
      steps: ['Soften an onion and garlic in olive oil.', 'Add cumin, paprika, the chickpeas and a tin of tomatoes.', 'Simmer for 15 minutes until thick.', 'Wilt in the spinach and finish with lemon.'] },
    { title: 'Black bean and rice bowl', mins: 15, kcal: 480, protein: 21, diets: ['Halal', 'Vegetarian', 'Vegan', 'Dairy-free'],
      steps: ['Reheat cooked rice with a splash of water.', 'Warm the black beans with garlic and a squeeze of lime.', 'Wilt some spinach in the same pan.', 'Pile it into a bowl; add salsa if you have it.'] },
    { title: 'Spinach and egg frittata', mins: 20, kcal: 390, protein: 27, diets: ['Halal', 'Vegetarian', 'High-protein', 'Keto'],
      steps: ['Wilt the spinach in an ovenproof pan.', 'Pour over four beaten eggs and season.', 'Cook gently for 5 minutes until the edges set.', 'Finish under the grill for 3 minutes.'] },
  ],
};

export const mealWeek = {
  cost: 38,
  days: [
    ['Overnight oats', 'Chicken stew', 'Salmon bowl'], ['Egg wrap', 'Leftover stew', 'Chickpea curry'], ['Greek yoghurt', 'Tuna salad', 'Turkey chilli'],
    ['Overnight oats', 'Leftover chilli', 'Stir-fry'], ['Egg wrap', 'Tuna salad', 'Chickpea curry'], ['Greek yoghurt', 'Chicken wrap', 'Salmon bowl'], ['Overnight oats', 'Leftover stew', 'Roast vegetables'],
  ],
  /** Rough figures for logging a planned meal when you eat it. */
  kcal: { Breakfast: 380, Lunch: 520, Dinner: 640 } as Record<string, number>,
  shop: [
    { aisle: 'Fruit and veg', items: ['Spinach', 'Berries', 'Onions', 'Peppers', 'Sweet potatoes'] },
    { aisle: 'Protein', items: ['Chicken thighs', 'Salmon fillets', 'Eggs', 'Chickpeas', 'Turkey mince'] },
    { aisle: 'Dairy', items: ['Greek yoghurt', 'Milk'] },
    { aisle: 'Cupboard', items: ['Oats', 'Rice', 'Black beans', 'Wraps'] },
  ],
};

export const sayit = {
  heard: 'I had a {chicken wrap} and a {large oat latte} around 1.',
  at: '13:00',
  items: [
    { name: 'Chicken wrap', portion: '1 wrap', grams: 250, kcal: 520, protein: 32, carbs: 56, fat: 18, fibre: 5, confidence: .8 },
    { name: 'Oat latte, large', portion: '1 cup', grams: 350, kcal: 180, protein: 4, carbs: 26, fat: 6, fibre: 1, confidence: .8 },
  ],
};

export const barcode = { name: 'Oat milk, 1 L', food: 'Oat milk', per100: { kcal: 48, protein: .4, carbs: 6.4, fat: 1.6, fibre: .8 }, portions: [150, 250, 330], unit: 'ml' };

export const foods = [
  { name: 'Banana, medium', kcal: 89, protein: 1.1, grams: 118, recent: true },
  { name: 'Banana bread, slice', kcal: 326, protein: 4, grams: 90 },
  { name: 'Banana, dried', kcal: 346, protein: 3, grams: 100, per100: true },
  { name: 'Banana smoothie', kcal: 240, protein: 6, grams: 330, brand: 'Pret' },
  { name: 'Greek yoghurt', kcal: 120, protein: 15, grams: 150 },
  { name: 'Oat flat white', kcal: 140, protein: 5, grams: 250, brand: 'Pret' },
  { name: 'Protein bar', kcal: 220, protein: 20, grams: 60, brand: 'Grenade' },
  { name: 'Protein shake', kcal: 240, protein: 30, grams: 400 },
  { name: 'Oat latte', kcal: 180, protein: 4, grams: 350 },
  { name: 'Apple and peanut butter', kcal: 285, protein: 8, grams: 200 },
];
export const often = ['banana', 'oat flat white', 'protein bar', 'Greek yoghurt', 'protein shake', 'oat latte'];

/** "What your body uses" for the targets sum, a sample until the engine works it out from your details (Track B). */
export const uses = 2800;
export const kcalFloor = 1500;
export const paces = [{ label: 'Gentle', kg: .25 }, { label: 'Steady', kg: .5 }, { label: 'Faster', kg: .75 }];

export const progress = { averageKcal: 2240, since: 'October', startWeight: seed.health.weightTrend[0], weeks: 6, close: '110111101111011' };

export const label = { name: 'Granola', per100: { kcal: 412, fat: 16, saturates: 3.1, carbs: 52, sugars: 21, protein: 11, salt: .4, fibre: 4 }, portions: [30, 45, 60] };

export const menu = [
  { name: 'Grilled chicken, rice and greens', kcal: 620, protein: 48 },
  { name: 'Halloumi wrap', kcal: 710, protein: 28 },
  { name: 'Beef burger and fries', kcal: 1150, protein: 42 },
];

export const fixDefault = 'Half the rice, no egg, and it was extra salmon.';

/** Iron, calcium and vitamin D need a week of meals; these are the sample week's averages. */
export const nutrientsToday = seed.fuel.nutrients.filter(v => ['Sugar', 'Salt', 'Saturated fat'].includes(v.label));
export const nutrientsWeek = seed.fuel.nutrients.filter(v => ['Iron', 'Calcium', 'Vitamin D'].includes(v.label));

export const week = { eaten: [2210, 2300, 2180, 2350, 2200], plan: [2710, 2150], birthday: 'Saturday' };

export const timing = {
  late: 21, lessSleep: 31, nights: 7,
  days: [['Mon', 8.17, 19.67], ['Tue', 7.83, 21.5], ['Wed', 8.33, 20.17], ['Thu', 8, 19.83], ['Fri', 9, 22.17], ['Sat', 10, 21.67], ['Sun', 9.5, 20]] as [string, number, number][],
};

export const quality = { plants: 19, plantsGoal: 30, whole: 58, processed: 20, ultra: 22 };

export const alcohol = { week: [0, 2.3, 0, 0, 4.4, 2.3, 0], guideline: 14, drinks: [{ name: 'Pint of beer', units: 2.3 }, { name: 'Glass of wine', units: 2.1 }, { name: 'Single spirit', units: 1 }], hrvDrop: 18, nights: 11 };

export const quick = { small: [{ name: 'Oat flat white', brand: 'Pret', kcal: 140 }, { name: 'Banana', kcal: 89 }, { name: 'Protein bar', brand: 'Grenade', kcal: 220 }] };

/** A saved meal as a diary item, with its macros where the seed knows them. */
export function savedItems(name: string, kcal: number): MealItem[] {
  if (name === 'Usual breakfast') return seedDiaryMeals[0].items.map(i => ({ ...i }));
  const known: Record<string, Omit<MealItem, 'name' | 'kcal' | 'confidence'>> = {
    'Salmon rice bowl': { grams: 450, protein: 49, carbs: 62, fat: 28, fibre: 9 },
    'Chicken wrap': { grams: 260, protein: 34, carbs: 58, fat: 17, fibre: 5 },
    'Protein shake': { grams: 400, protein: 30, carbs: 16, fat: 5, fibre: 1 },
  };
  const k = known[name] ?? { grams: 300, protein: Math.round(kcal * .06), carbs: Math.round(kcal * .12), fat: Math.round(kcal * .035), fibre: 3 };
  return [{ name, kcal, confidence: .9, ...k }];
}
