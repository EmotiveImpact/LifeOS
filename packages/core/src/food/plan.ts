/**
 * Targets from what the phone stores (SYSTEM_DESIGN food flow, Phase 27): the `food_target` row (goal, pace, target
 * weight, how much exercise to add back) and the `body_profile` row (sex at birth, height, weight, activity), with the
 * health days as evidence of what you actually use. `targets.ts` does the maths; this reads the rows into it and says
 * what is missing or assumed, so a screen can ask for exactly that.
 *
 * - No plan yet means keeping steady: the target is what your body uses.
 * - Without sex at birth, Mifflin-St Jeor's midpoint is used, with the higher floor of the two (`assumed: ['sex']`).
 * - Evidence: a watch's active energy over the last 14 finished days; otherwise your usual Load and steps over the
 *   last 28 (at least 7 days of either); otherwise the activity level written on your profile.
 * - Today is never evidence of a usual day, because it isn't over.
 */
import type { HealthSnapshot } from '../types/lifeos';
import type { BodySex } from '../health/load';
import { loadScore } from '../health/load';
import { addDays, type DateKey } from '../time/zone';
import { isNum, mean } from '../math/stats';
import { foodTargets, type ActivityLevel, type BodyDetails, type EnergyEvidence, type FoodTargets } from './targets';

export type FoodGoal = 'lose' | 'keep' | 'gain';
export type AddBack = 'none' | 'half' | 'all';

/** The `food_target` row, as either database stores it. */
export interface FoodTargetRow { goal?: string | null; target_weight?: number | null; pace?: number | null; kcal?: number | null; exercise_addback?: string | null }
/** The parts of the `body_profile` row (and the profile's age) that food targets need. */
export interface BodyProfileRow { age?: number | null; sexAtBirth?: string | null; heightCm?: number | null; weightKg?: number | null; activity?: string | null }
/** The parts of a stored health day that count as evidence. */
export interface EvidenceDay { date: DateKey; activeKcal?: number; trimp?: number; steps?: number }

export type Missing = 'age' | 'height' | 'weight';
export type PlanTargets =
  | (FoodTargets & { goal: FoodGoal; addBack: AddBack; assumed: 'sex'[] })
  | { available: false; reason: 'under-18' | 'missing-details'; missing: Missing[]; goal: FoodGoal; addBack: AddBack };

/** The fastest pace the plan screens offer, kg a week; `targets.ts` caps it again at 1% of body weight. */
export const MAX_PACE = 1;
const MIN_EVIDENCE_DAYS = 7;
const ACTIVE_DAYS = 14;
const USUAL_DAYS = 28;

export function goalFrom(row: FoodTargetRow | null | undefined): { goal: FoodGoal; paceKgPerWeek: number; targetWeightKg?: number } {
  const word = (row?.goal ?? '').trim().toLowerCase();
  const goal: FoodGoal = word === 'lose' ? 'lose' : word === 'gain' ? 'gain' : 'keep';
  const pace = isNum(row?.pace) && (row?.pace as number) > 0 ? Math.min(row?.pace as number, MAX_PACE) : 0;
  if (goal === 'keep') return { goal, paceKgPerWeek: 0, targetWeightKg: undefined };
  const target = isNum(row?.target_weight) && (row?.target_weight as number) > 0 ? (row?.target_weight as number) : undefined;
  return { goal, paceKgPerWeek: pace === 0 ? 0 : goal === 'lose' ? -pace : pace, targetWeightKg: target };
}

export function addBackFrom(row: FoodTargetRow | null | undefined): AddBack {
  const word = (row?.exercise_addback ?? '').trim().toLowerCase();
  return word === 'all' ? 'all' : word === 'half' ? 'half' : 'none';
}

const sexFrom = (raw: string | null | undefined): BodySex => {
  const word = (raw ?? '').trim().toLowerCase();
  return word === 'female' || word === 'f' ? 'female' : word === 'male' || word === 'm' ? 'male' : 'unknown';
};

export function bodyFrom(row: BodyProfileRow): { body: BodyDetails | null; missing: Missing[]; assumed: 'sex'[] } {
  const missing: Missing[] = [];
  if (!isNum(row.age) || (row.age as number) <= 0) missing.push('age');
  if (!isNum(row.heightCm) || (row.heightCm as number) < 120) missing.push('height');
  if (!isNum(row.weightKg) || (row.weightKg as number) < 35) missing.push('weight');
  const sex = sexFrom(row.sexAtBirth);
  const assumed: 'sex'[] = sex === 'unknown' ? ['sex'] : [];
  if (missing.length) return { body: null, missing, assumed };
  return { body: { sex, age: row.age as number, heightCm: row.heightCm as number, weightKg: row.weightKg as number }, missing, assumed };
}

/** An activity level from the words on a profile, or undefined when they don't name one. */
export function activityFrom(words: string | null | undefined): ActivityLevel | undefined {
  const w = (words ?? '').trim().toLowerCase();
  if (!w) return undefined;
  if (/very|extra/.test(w)) return 'very-active';
  if (/sedentary|sitting|inactive|desk/.test(w)) return 'sedentary';
  if (/light|lightly/.test(w)) return 'light';
  if (/moderate|fairly|some/.test(w)) return 'moderate';
  if (/active/.test(w)) return 'active';
  return undefined;
}

/** What your health days say about a usual day: finished days only, today left out. */
export function evidenceFrom(days: readonly EvidenceDay[], today: DateKey, _age: number, _sex: BodySex): EnergyEvidence {
  const within = (n: number) => { const from = addDays(today, -n); return days.filter(d => d.date >= from && d.date < today); };
  const active = within(ACTIVE_DAYS).map(d => d.activeKcal).filter((v): v is number => isNum(v) && v >= 0);
  if (active.length >= MIN_EVIDENCE_DAYS) return { activeKcal: active };
  const usual = within(USUAL_DAYS);
  const loads = usual.map(d => d.trimp).filter((v): v is number => isNum(v) && v >= 0).map(loadScore);
  const steps = usual.map(d => d.steps).filter((v): v is number => isNum(v) && v >= 0);
  if (loads.length < MIN_EVIDENCE_DAYS && steps.length < MIN_EVIDENCE_DAYS) return {};
  return {
    averageDayLoad: loads.length >= MIN_EVIDENCE_DAYS ? (mean(loads) as number) : 0,
    ...(steps.length >= MIN_EVIDENCE_DAYS ? { averageSteps: Math.round(mean(steps) as number) } : {}),
  };
}

/** Today's measured active energy, for adding exercise back. `measured: false` when nothing has been read today. */
export function activeToday(days: readonly EvidenceDay[], today: DateKey): { kcal: number; measured: boolean } {
  const row = days.find(d => d.date === today);
  return isNum(row?.activeKcal) ? { kcal: Math.round(row?.activeKcal as number), measured: true } : { kcal: 0, measured: false };
}

/** Targets from the stored rows. `days` and `today` add the health evidence; `health` sets protein and water. */
export function planTargets(input: { record: FoodTargetRow | null | undefined; profile: BodyProfileRow; days?: readonly EvidenceDay[]; today?: DateKey; health?: HealthSnapshot }): PlanTargets {
  const { goal, paceKgPerWeek, targetWeightKg } = goalFrom(input.record);
  const addBack = addBackFrom(input.record);
  const read = bodyFrom(input.profile);
  if (!read.body) return { available: false, reason: 'missing-details', missing: read.missing, goal, addBack };
  const measured = input.days && input.today ? evidenceFrom(input.days, input.today, read.body.age, read.body.sex) : {};
  const chosen = activityFrom(input.profile.activity);
  const evidence: EnergyEvidence = { ...measured, ...(chosen ? { chosen } : {}) };
  const result = foodTargets({ body: read.body, goal: { paceKgPerWeek, targetWeightKg }, evidence, health: input.health });
  if (!result.available) return { available: false, reason: result.reason, missing: [], goal, addBack };
  return { ...result, goal, addBack, assumed: read.assumed };
}
