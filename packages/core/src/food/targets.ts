/**
 * Food targets (SPEC §3.5, Phase 27): what your body uses, today's energy target with a safe floor, and macros.
 *
 * - Resting energy: Mifflin-St Jeor (1990): 10 × kg + 6.25 × cm − 5 × age, + 5 for men, − 161 for women.
 * - What you use in a day, best evidence first: a watch's measured active energy (at least 7 of the last 14 days),
 *   resting plus active over 0.9 to allow about 10% for digesting food (Westerterp 2004); otherwise an activity
 *   factor from your Load and steps; otherwise the activity level you chose.
 * - Weight change: about 7,700 kcal per kg, so 0.5 kg a week is 550 kcal a day. Pace is capped at 1% of body weight a
 *   week (NHS: aim for 0.5 to 1 kg a week).
 * - Floor: never below 1,200 kcal (women) or 1,500 (men), nor below your resting energy, rounded to 50. If the pace
 *   would go under it, the target sits on the floor and the slower pace is shown.
 * - Protein and water come from the existing `computeHealthTargets` so Today, Body and Fuel always agree. Fat is 30% of
 *   energy, fibre 30 g (SACN 2015), carbohydrate the rest.
 * - Under 18: no calorie targets at all (SPEC §3.5 safety).
 *
 * Guidance, not medical advice.
 */
import type { HealthSnapshot } from '../types/lifeos';
import { computeHealthTargets } from '../data/health';
import { clamp, isNum, mean, round } from '../math/stats';
import type { BodySex } from '../health/load';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very-active';
export const ACTIVITY_FACTOR: Record<ActivityLevel, number> = { sedentary: 1.2, light: 1.375, moderate: 1.55, active: 1.725, 'very-active': 1.9 };
export const KCAL_PER_KG = 7700;
export const KCAL_FLOOR: Record<BodySex, number> = { female: 1200, male: 1500, unknown: 1350 };
export const FIBRE_G = 30;
export const FAT_SHARE = 0.3;
export const MAX_WEEKLY_LOSS_SHARE = 0.01;
export const MIN_ADULT_AGE = 18;

export interface BodyDetails { sex: BodySex; age: number; heightCm: number; weightKg: number }

export function restingEnergy(body: BodyDetails): number {
  const sexTerm = body.sex === 'male' ? 5 : body.sex === 'female' ? -161 : -78;
  return Math.round(10 * body.weightKg + 6.25 * body.heightCm - 5 * body.age + sexTerm);
}

/** An activity level from your usual Load (28-day average day score) and steps. */
export function activityFromLoad(averageDayLoad: number, averageSteps?: number): ActivityLevel {
  const steps = averageSteps ?? 0;
  if (averageDayLoad >= 13 || steps >= 15_000) return 'very-active';
  if (averageDayLoad >= 9 || steps >= 11_000) return 'active';
  if (averageDayLoad >= 5 || steps >= 7_500) return 'moderate';
  if (averageDayLoad >= 2 || steps >= 4_000) return 'light';
  return 'sedentary';
}

export interface EnergyEvidence {
  /** The last 14 days of measured active energy, kcal (missing days left out). */
  activeKcal?: readonly number[];
  averageDayLoad?: number;
  averageSteps?: number;
  /** What you told life, if nothing is measured. */
  chosen?: ActivityLevel;
}

export interface EnergyUse { kcal: number; resting: number; method: 'measured' | 'load' | 'chosen' | 'default'; activity?: ActivityLevel; activeKcal?: number }

/** What your body uses in a typical day. */
export function energyUse(body: BodyDetails, evidence: EnergyEvidence = {}): EnergyUse {
  const resting = restingEnergy(body);
  const active = (evidence.activeKcal ?? []).filter(v => isNum(v) && v >= 0);
  if (active.length >= 7) {
    const activeKcal = Math.round(mean(active) as number);
    return { kcal: Math.round((resting + activeKcal) / 0.9), resting, method: 'measured', activeKcal };
  }
  if (isNum(evidence.averageDayLoad)) {
    const activity = activityFromLoad(evidence.averageDayLoad, evidence.averageSteps);
    return { kcal: Math.round(resting * ACTIVITY_FACTOR[activity]), resting, method: 'load', activity };
  }
  const activity = evidence.chosen ?? 'light';
  return { kcal: Math.round(resting * ACTIVITY_FACTOR[activity]), resting, method: evidence.chosen ? 'chosen' : 'default', activity };
}

const round50 = (n: number) => Math.round(n / 50) * 50;
/** Only weight and training days matter to `computeHealthTargets`; the rest is filler for its type. */
const BLANK_SNAPSHOT: HealthSnapshot = { dietStyle: 'balanced', waterMlToday: 0, waterTargetMl: 2000, proteinTargetG: 0, sleepHoursAvg: 0, zone2MinsWeek: 0, mealsLogged: [] };

export const energyFloor = (body: BodyDetails) => round50(Math.max(KCAL_FLOOR[body.sex], restingEnergy(body)));

export interface Goal {
  /** kg a week: negative to lose, positive to gain, 0 to stay. */
  paceKgPerWeek: number;
  targetWeightKg?: number;
}

export interface FoodTargets {
  available: true;
  kcal: number;
  uses: EnergyUse;
  floor: number;
  /** The target sits on the floor because the chosen pace would go below it. */
  floored: boolean;
  /** The pace the target actually gives, kg a week (negative is loss). */
  paceKgPerWeek: number;
  /** Weeks to reach the target weight at that pace, if one is set. */
  weeksToGoal: number | null;
  protein: number;
  fat: number;
  carbs: number;
  fibre: number;
  waterMl: number;
}

export type FoodTargetsResult = FoodTargets | { available: false; reason: 'under-18' | 'missing-details' };

export function foodTargets(input: { body: BodyDetails; goal?: Goal; evidence?: EnergyEvidence; health?: HealthSnapshot }): FoodTargetsResult {
  const { body } = input;
  if (![body.age, body.heightCm, body.weightKg].every(isNum) || body.weightKg < 35 || body.heightCm < 120) return { available: false, reason: 'missing-details' };
  if (body.age < MIN_ADULT_AGE) return { available: false, reason: 'under-18' };
  const uses = energyUse(body, input.evidence);
  const floor = energyFloor(body);
  const maxPace = body.weightKg * MAX_WEEKLY_LOSS_SHARE;
  const wanted = clamp(input.goal?.paceKgPerWeek ?? 0, -maxPace, maxPace);
  const raw = uses.kcal + (wanted * KCAL_PER_KG) / 7;
  const kcal = round50(Math.max(floor, raw));
  const floored = raw < floor;
  const paceKgPerWeek = round(((kcal - uses.kcal) * 7) / KCAL_PER_KG, 2);
  const target = input.goal?.targetWeightKg;
  const gap = isNum(target) ? target - body.weightKg : null;
  const weeksToGoal = gap === null || gap === 0 ? null : Math.sign(gap) === Math.sign(paceKgPerWeek) && paceKgPerWeek !== 0 ? Math.ceil(Math.abs(gap / paceKgPerWeek)) : null;
  const snapshot: HealthSnapshot = { ...BLANK_SNAPSHOT, ...input.health, weightKg: body.weightKg };
  const health = computeHealthTargets(snapshot);
  const protein = health.proteinG;
  const fat = Math.round((kcal * FAT_SHARE) / 9);
  const carbs = Math.max(0, Math.round((kcal - protein * 4 - fat * 9) / 4));
  return { available: true, kcal, uses, floor, floored, paceKgPerWeek, weeksToGoal, protein, fat, carbs, fibre: FIBRE_G, waterMl: health.waterMl };
}

/**
 * Today's energy budget with exercise added back. When what you use already counts your usual activity (measured or
 * from Load), only activity above your usual day is added, so a normal day's walk isn't counted twice.
 */
export function dayBudget(input: { target: number; uses: EnergyUse; activeToday: number; addBack: 'none' | 'half' | 'all' }): { budget: number; added: number } {
  const share = input.addBack === 'all' ? 1 : input.addBack === 'half' ? 0.5 : 0;
  const usual = input.uses.method === 'measured' ? input.uses.activeKcal ?? 0 : input.uses.method === 'load' ? input.uses.resting * (ACTIVITY_FACTOR[input.uses.activity ?? 'light'] - 1.2) : 0;
  const added = Math.round(Math.max(0, input.activeToday - usual) * share);
  return { budget: input.target + added, added };
}

/* ───────────────────────── UK reference values ───────────────────────── */

export interface NutrientGuide { key: string; label: string; amount: number; unit: string; kind: 'at-least' | 'at-most'; per: 'day' | 'week-average'; source: string }

/**
 * UK daily guides for the nutrients Fuel shows. Reference Intakes are the food-label values (Regulation (EU)
 * 1169/2011 as retained in UK law); RNIs are from the UK Government Dietary Recommendations (PHE 2016). Iron depends
 * on sex and age, so it takes the body details.
 */
export function nutrientGuides(body: Pick<BodyDetails, 'sex' | 'age'>): NutrientGuide[] {
  const iron = body.sex === 'female' && body.age < 50 ? 14.8 : 8.7;
  const gdr = 'UK Government Dietary Recommendations, PHE 2016';
  const ri = 'UK Reference Intakes for food labels';
  return [
    { key: 'fibre', label: 'Fibre', amount: 30, unit: 'g', kind: 'at-least', per: 'day', source: 'SACN Carbohydrates and Health, 2015' },
    { key: 'sugars', label: 'Sugar', amount: 90, unit: 'g', kind: 'at-most', per: 'day', source: ri },
    { key: 'freeSugars', label: 'Free sugars', amount: 30, unit: 'g', kind: 'at-most', per: 'day', source: 'SACN Carbohydrates and Health, 2015' },
    { key: 'salt', label: 'Salt', amount: 6, unit: 'g', kind: 'at-most', per: 'day', source: gdr },
    { key: 'saturatedFat', label: 'Saturated fat', amount: 20, unit: 'g', kind: 'at-most', per: 'day', source: ri },
    { key: 'iron', label: 'Iron', amount: iron, unit: 'mg', kind: 'at-least', per: 'week-average', source: gdr },
    { key: 'calcium', label: 'Calcium', amount: 700, unit: 'mg', kind: 'at-least', per: 'week-average', source: gdr },
    { key: 'vitaminD', label: 'Vitamin D', amount: 10, unit: 'µg', kind: 'at-least', per: 'week-average', source: gdr },
  ];
}

/** The UK alcohol guide: no more than 14 units a week, spread over three or more days (UK Chief Medical Officers, 2016). */
export const ALCOHOL_UNITS_A_WEEK = 14;
