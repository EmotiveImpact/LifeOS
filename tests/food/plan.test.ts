import { describe, expect, test } from 'bun:test';
import { activeToday, activityFrom, bodyFrom, evidenceFrom, goalFrom, planTargets, type PlanTargets } from '../../packages/core/src/food/plan';
import { addDays } from '../../packages/core/src/time/zone';

/** Ama as Body and Fuel store her: the body profile row and the food_target row. */
const ama = { age: 27, sexAtBirth: 'Female', heightCm: 172, weightKg: 74.2, activity: 'Active' };
const amaPlan = { goal: 'Lose', target_weight: 70, pace: 0.5, exercise_addback: 'Half' };
const amaHealth = { dietStyle: 'high-protein' as const, waterMlToday: 0, waterTargetMl: 2500, proteinTargetG: 130, sleepHoursAvg: 7, zone2MinsWeek: 90, mealsLogged: [], trainingDays: 4 };
const TODAY = '2026-11-20';
const on = (r: PlanTargets) => {
  if (!r.available) throw new Error(`${r.reason}: ${r.missing.join(', ')}`);
  return r;
};
const days = (n: number, row: (i: number) => Record<string, number>) => Array.from({ length: n }, (_, i) => ({ date: addDays(TODAY, i - n + 1), ...row(i) }));

describe('reading the stored rows', () => {
  test('the goal and pace from food_target, as kg a week', () => {
    expect(goalFrom(amaPlan)).toEqual({ goal: 'lose', paceKgPerWeek: -0.5, targetWeightKg: 70 });
    expect(goalFrom({ goal: 'Gain', pace: 0.25 })).toEqual({ goal: 'gain', paceKgPerWeek: 0.25, targetWeightKg: undefined });
    expect(goalFrom({ goal: 'Keep', pace: 0.5, target_weight: 70 })).toEqual({ goal: 'keep', paceKgPerWeek: 0, targetWeightKg: undefined });
  });
  test('no plan yet means keeping steady, and a nonsense pace is never trusted', () => {
    expect(goalFrom(null)).toEqual({ goal: 'keep', paceKgPerWeek: 0, targetWeightKg: undefined });
    expect(goalFrom({ goal: 'Lose', pace: Number.NaN }).paceKgPerWeek).toBe(0);
    expect(goalFrom({ goal: 'Lose', pace: -3 }).paceKgPerWeek).toBe(0);
    expect(goalFrom({ goal: 'Lose', pace: 4 }).paceKgPerWeek).toBe(-1);
  });
  test('the body profile, with what is missing named', () => {
    expect(bodyFrom(ama)).toEqual({ body: { sex: 'female', age: 27, heightCm: 172, weightKg: 74.2 }, missing: [], assumed: [] });
    expect(bodyFrom({ ...ama, heightCm: null, weightKg: undefined }).missing).toEqual(['height', 'weight']);
    expect(bodyFrom({ ...ama, age: undefined }).missing).toEqual(['age']);
  });
  test('without sex at birth, a midpoint is used and it says so', () => {
    const read = bodyFrom({ ...ama, sexAtBirth: null });
    expect(read.body?.sex).toBe('unknown');
    expect(read.assumed).toEqual(['sex']);
  });
  test('activity words become levels; anything else is left to the evidence', () => {
    expect(['Sedentary', 'Light', 'Moderate', 'Active', 'Very active', 'Mostly sitting', ''].map(activityFrom)).toEqual(['sedentary', 'light', 'moderate', 'active', 'very-active', 'sedentary', undefined]);
  });
  test('the add-back choice', () => {
    expect(on(planTargets({ record: { exercise_addback: 'All' }, profile: ama })).addBack).toBe('all');
    expect(on(planTargets({ record: null, profile: ama })).addBack).toBe('none');
  });
});

describe('evidence from health', () => {
  test("a watch's active energy from the last 14 finished days; today isn't over, so it's left out", () => {
    const e = evidenceFrom(days(20, i => ({ activeKcal: i === 19 ? 50 : 500 + i })), TODAY, 27, 'female');
    expect(e.activeKcal).toHaveLength(14);
    expect(e.activeKcal).not.toContain(50);
    expect(Math.min(...(e.activeKcal ?? []))).toBe(505);
  });
  test('usual Load and steps over the last 28 finished days', () => {
    const e = evidenceFrom(days(30, () => ({ trimp: 80, steps: 9000 })), TODAY, 27, 'female');
    expect(e.activeKcal).toBeUndefined();
    expect(e.averageSteps).toBe(9000);
    expect(e.averageDayLoad).toBeGreaterThan(0);
  });
  test('a few days are not enough to call it usual', () => {
    expect(evidenceFrom(days(3, () => ({ trimp: 80, steps: 9000 })), TODAY, 27, 'female')).toEqual({});
  });
  test("today's active energy for adding exercise back", () => {
    expect(activeToday(days(3, i => ({ activeKcal: 300 + i })), TODAY)).toEqual({ kcal: 302, measured: true });
    expect(activeToday(days(3, () => ({ steps: 100 })), TODAY)).toEqual({ kcal: 0, measured: false });
  });
});

describe('targets from food_target and the body profile', () => {
  test("Ama's plan gives the engine's figures: 2,050 kcal, losing about half a kilo a week", () => {
    const t = on(planTargets({ record: amaPlan, profile: ama, health: amaHealth }));
    expect([t.goal, t.kcal, t.paceKgPerWeek, t.weeksToGoal, t.protein, t.fibre, t.addBack]).toEqual(['lose', 2050, -0.52, 9, 119, 30, 'half']);
    expect(t.uses.method).toBe('chosen');
  });
  test('no plan yet: the target is what your body uses', () => {
    const t = on(planTargets({ record: null, profile: ama }));
    expect([t.goal, t.kcal, t.uses.kcal]).toEqual(['keep', 2600, 2624]);
  });
  test('gaining adds energy', () => {
    expect(on(planTargets({ record: { goal: 'Gain', pace: 0.25 }, profile: ama })).kcal).toBe(2900);
  });
  test('measured activity beats the level you chose', () => {
    const t = on(planTargets({ record: amaPlan, profile: ama, days: days(15, () => ({ activeKcal: 600 })), today: TODAY }));
    expect(t.uses).toMatchObject({ method: 'measured', kcal: 2357 });
    expect(t.kcal).toBe(1800);
  });
  test('a midpoint body still gets targets, with the higher floor of the two', () => {
    const t = on(planTargets({ record: { goal: 'Lose', pace: 1 }, profile: { ...ama, sexAtBirth: undefined, activity: 'Sedentary' } }));
    expect(t.assumed).toEqual(['sex']);
    expect(t.floor).toBeGreaterThanOrEqual(1350);
    expect(t.kcal).toBeGreaterThanOrEqual(t.floor);
  });
  test('missing height or weight: no targets, and it names what to add', () => {
    expect(planTargets({ record: amaPlan, profile: { ...ama, heightCm: null } })).toMatchObject({ available: false, reason: 'missing-details', missing: ['height'] });
  });
  test('under 18: no calorie targets at all', () => {
    expect(planTargets({ record: amaPlan, profile: { ...ama, age: 16 } })).toMatchObject({ available: false, reason: 'under-18' });
  });
});
