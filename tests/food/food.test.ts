import { describe, expect, test } from 'bun:test';
import { lowIntakeCheck, mealFit, mealShare, rankRecipes, slotAt } from '../../packages/core/src/food/fit';
import { activityFromLoad, dayBudget, energyFloor, energyUse, foodTargets, nutrientGuides, restingEnergy, type BodyDetails } from '../../packages/core/src/food/targets';
import { addDays } from '../../packages/core/src/time/zone';

/** The sample life: Ama, 27, 172 cm, 74.2 kg, trains four days a week. */
const ama: BodyDetails = { sex: 'female', age: 27, heightCm: 172, weightKg: 74.2 };
const TODAY = '2026-11-20';
const targetsOf = (r: ReturnType<typeof foodTargets>) => {
  if (!r.available) throw new Error(r.reason);
  return r;
};

describe('energy', () => {
  test('resting energy is Mifflin-St Jeor', () => {
    expect(restingEnergy(ama)).toBe(1521);
    expect(restingEnergy({ ...ama, sex: 'male' })).toBe(1687);
  });
  test("a watch's measured activity is the best evidence of what you use", () => {
    const u = energyUse(ama, { activeKcal: Array(10).fill(600), chosen: 'sedentary' });
    expect([u.method, u.kcal, u.activeKcal]).toEqual(['measured', 2357, 600]);
  });
  test('otherwise your usual Load and steps set the activity level', () => {
    expect(activityFromLoad(10, 8000)).toBe('active');
    expect(activityFromLoad(1, 3000)).toBe('sedentary');
    expect(energyUse(ama, { averageDayLoad: 6 })).toMatchObject({ method: 'load', activity: 'moderate', kcal: 2358 });
  });
  test('with nothing measured, the level you chose; with nothing at all, light', () => {
    expect(energyUse(ama, { chosen: 'active' })).toMatchObject({ method: 'chosen', kcal: 2624 });
    expect(energyUse(ama).method).toBe('default');
  });
});

describe('targets', () => {
  test("Ama's target losing half a kilo a week, on what she chose", () => {
    const t = targetsOf(foodTargets({ body: ama, goal: { paceKgPerWeek: -0.5, targetWeightKg: 70 }, evidence: { chosen: 'active' }, health: { dietStyle: 'high-protein', waterMlToday: 0, waterTargetMl: 2500, proteinTargetG: 130, sleepHoursAvg: 7, zone2MinsWeek: 90, mealsLogged: [], trainingDays: 4 } }));
    expect([t.kcal, t.floor, t.floored, t.paceKgPerWeek, t.weeksToGoal]).toEqual([2050, 1500, false, -0.52, 9]);
    expect([t.protein, t.fibre]).toEqual([119, 30]);
    expect(t.fat).toBe(68);
    expect(t.carbs).toBe(Math.round((2050 - 119 * 4 - 68 * 9) / 4));
  });
  test('the floor holds however fast the goal: never below resting energy or 1,200', () => {
    const t = targetsOf(foodTargets({ body: ama, goal: { paceKgPerWeek: -2 }, evidence: { chosen: 'sedentary' } }));
    expect(t.kcal).toBe(1500);
    expect(t.floored).toBe(true);
    expect(t.paceKgPerWeek).toBeGreaterThan(-0.75);
    expect(energyFloor({ sex: 'female', age: 70, heightCm: 150, weightKg: 45 })).toBe(1200);
  });
  test('the pace is capped at 1% of body weight a week', () => {
    const t = targetsOf(foodTargets({ body: { ...ama, weightKg: 60 }, goal: { paceKgPerWeek: -1 }, evidence: { chosen: 'very-active' } }));
    expect(t.paceKgPerWeek).toBeCloseTo(-0.6, 1);
  });
  test('gaining weight adds energy; staying put is what you use', () => {
    expect(targetsOf(foodTargets({ body: ama, goal: { paceKgPerWeek: 0.25 }, evidence: { chosen: 'active' } })).kcal).toBe(2900);
    expect(targetsOf(foodTargets({ body: ama, evidence: { chosen: 'active' } })).kcal).toBe(2600);
  });
  test('no calorie targets for under-18s, or without height and weight', () => {
    expect(foodTargets({ body: { ...ama, age: 17 } })).toEqual({ available: false, reason: 'under-18' });
    expect(foodTargets({ body: { ...ama, weightKg: Number.NaN } })).toEqual({ available: false, reason: 'missing-details' });
  });
  test('exercise added back counts only activity above your usual day', () => {
    const uses = energyUse(ama, { activeKcal: Array(10).fill(600) });
    expect(dayBudget({ target: 1800, uses, activeToday: 900, addBack: 'all' })).toEqual({ budget: 2100, added: 300 });
    expect(dayBudget({ target: 1800, uses, activeToday: 500, addBack: 'all' }).added).toBe(0);
    expect(dayBudget({ target: 1800, uses: energyUse(ama, { chosen: 'sedentary' }), activeToday: 400, addBack: 'half' }).added).toBe(200);
  });
  test('UK guides: iron depends on sex and age', () => {
    expect(nutrientGuides(ama).find(g => g.key === 'iron')?.amount).toBe(14.8);
    expect(nutrientGuides({ sex: 'female', age: 55 }).find(g => g.key === 'iron')?.amount).toBe(8.7);
    expect(nutrientGuides(ama).find(g => g.key === 'salt')).toMatchObject({ amount: 6, kind: 'at-most' });
  });
});

describe('meal fit, 0 to 10', () => {
  const day = { kcal: 2300, protein: 140, fibre: 30 };
  const breakfast = { kcal: 420, protein: 30, fibre: 7 };
  const lunch = { kcal: 640, protein: 43, carbs: 51, fat: 29, fibre: 6 };
  test("the sample lunch scores 8.4 against what's left after breakfast, as on the board", () => {
    const share = mealShare({ targets: day, eatenBefore: breakfast, slot: slotAt(12 * 60 + 40) });
    expect(share).toEqual({ kcal: 940, protein: 55, fibre: 11.5 });
    const fit = mealFit(lunch, share);
    expect(fit.score).toBe(8.4);
    expect(fit.tips.map(t => t.id)).toEqual(['fibre']);
  });
  test('a pastry on its own fits a lunch less well than the bowl', () => {
    const share = mealShare({ targets: day, slot: 'lunch' });
    expect(mealFit({ kcal: 420, protein: 6, fat: 24, fibre: 1 }, share).score).toBeLessThan(mealFit(lunch, share).score);
  });
  test('a snack is judged against a tenth of the day, not a meal', () => {
    const fit = mealFit({ kcal: 220, protein: 20, fat: 8, fibre: 3 }, mealShare({ targets: day, slot: 'snack' }));
    expect(fit.score).toBeGreaterThanOrEqual(8);
    expect(fit.tips).toEqual([{ id: 'balanced', text: 'Well balanced for your day.' }]);
  });
  test('a very big plate says so kindly, and a missing value is left out', () => {
    const fit = mealFit({ kcal: 1800, protein: 60 }, mealShare({ targets: day, slot: 'lunch' }));
    expect(fit.parts.fibre).toBeNull();
    expect(fit.tips[0].id).toBe('big');
    expect(fit.score).toBeGreaterThan(0);
  });
  test('slots follow the clock', () => {
    expect([slotAt(8 * 60), slotAt(13 * 60), slotAt(16 * 60), slotAt(19 * 60)]).toEqual(['breakfast', 'lunch', 'snack', 'dinner']);
  });
});

describe('the low-intake safeguard', () => {
  const days = (kcal: number[], meals = 3) => kcal.map((k, i) => ({ date: addDays(TODAY, i - kcal.length), kcal: k, meals }));
  test('seven finished days in a row under 1,200 brings the check-in', () => {
    expect(lowIntakeCheck(days(Array(7).fill(1000)), TODAY)).toEqual({ checkIn: true, lowDays: 7 });
  });
  test('six is not seven, and one normal day resets it', () => {
    expect(lowIntakeCheck(days(Array(6).fill(1000)), TODAY).checkIn).toBe(false);
    expect(lowIntakeCheck(days([...Array(4).fill(1000), 1900, ...Array(3).fill(1000)]), TODAY).lowDays).toBe(3);
  });
  test('a day with nothing logged is unknown, not low', () => {
    expect(lowIntakeCheck(days(Array(7).fill(0), 0), TODAY).checkIn).toBe(false);
  });
});

describe('what can I cook?', () => {
  const recipes = [
    { title: 'Chicken, chickpea and spinach stew', kcal: 610, protein: 46, fibre: 9, fat: 18, diets: ['Halal', 'High-protein', 'Dairy-free'] },
    { title: 'Egg and black bean breakfast wrap', kcal: 480, protein: 29, fibre: 8, fat: 16, diets: ['Halal', 'Vegetarian', 'High-protein'], allergens: ['egg'] },
    { title: 'Chickpea and spinach stew', kcal: 510, protein: 24, fibre: 12, fat: 14, diets: ['Halal', 'Vegetarian', 'Vegan', 'Dairy-free'] },
    { title: 'Spinach and egg frittata', kcal: 390, protein: 27, fibre: 3, fat: 26, diets: ['Halal', 'Vegetarian', 'High-protein', 'Keto'], allergens: ['egg'] },
  ];
  test('keeps only recipes that suit every diet asked for and avoid allergens, best fit first', () => {
    const picks = rankRecipes(recipes, { remaining: { kcal: 650, protein: 45, fibre: 10 }, diets: ['Halal'], avoid: ['Egg'] });
    expect(picks.map(r => r.title)).toEqual(['Chicken, chickpea and spinach stew', 'Chickpea and spinach stew']);
    expect(rankRecipes(recipes, { remaining: { kcal: 650, protein: 45, fibre: 10 }, diets: ['Vegan'] })).toHaveLength(1);
  });
});
