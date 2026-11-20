/**
 * How well a meal fits your day (SPEC §3.5b): a score from 0 to 10 and one or two short tips. It measures fit with
 * your own targets, not whether a food is "good", and is hidden in Hide numbers mode.
 *
 * A meal is judged against its fair share of what's left today: the remaining targets split over the meals still to
 * come (breakfast of three, lunch of two, dinner the rest), or a tenth of the day for a snack.
 *
 *   score = 10 × (0.35 energy + 0.30 protein + 0.20 fibre + 0.15 balance)
 *
 * - energy is full marks from 75% to 115% of the share, falling to nothing at a quarter or at double;
 * - protein is full marks at 90% of the share, fibre at 80%;
 * - balance is full marks with up to 40% of the energy from fat, nothing at 60%.
 * Missing values (a label with no fibre) are left out and the rest reweighted.
 *
 * Also here: the low-intake safeguard (SPEC §3.5: under 1,200 kcal for 7 days in a row brings a gentle check-in and
 * Beat's details) and "What can I cook?" ranking by the same fit. Our own scoring; Cal-AI (MIT) gave the idea only.
 */
import { clamp, isNum, round, sum } from '../math/stats';
import { addDays, type DateKey } from '../time/zone';

export interface Nutrition { kcal: number; protein: number; carbs?: number; fat?: number; fibre?: number; saturatedFat?: number }
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export interface DayTargets { kcal: number; protein: number; fibre: number }

export const FIT_WEIGHTS = { energy: 0.35, protein: 0.3, fibre: 0.2, balance: 0.15 } as const;
export const SNACK_SHARE = 0.1;
export const LOW_INTAKE_KCAL = 1200;
export const LOW_INTAKE_DAYS = 7;

/** Breakfast, lunch, snack or dinner from the clock time a meal was eaten (minutes after midnight). */
export function slotAt(minutes: number): MealSlot {
  const h = minutes / 60;
  return h < 11 ? 'breakfast' : h < 15 ? 'lunch' : h < 17.5 ? 'snack' : 'dinner';
}

const MEALS_LEFT: Record<Exclude<MealSlot, 'snack'>, number> = { breakfast: 3, lunch: 2, dinner: 1 };

/** This meal's fair share of what's left today. */
export function mealShare(input: { targets: DayTargets; eatenBefore?: Partial<Nutrition>; slot: MealSlot; mealsLeft?: number }): DayTargets {
  const { targets, slot } = input;
  if (slot === 'snack') return { kcal: targets.kcal * SNACK_SHARE, protein: targets.protein * SNACK_SHARE, fibre: targets.fibre * SNACK_SHARE };
  const left = Math.max(1, input.mealsLeft ?? MEALS_LEFT[slot]);
  const eaten = input.eatenBefore ?? {};
  const share = (target: number, had = 0) => Math.max(0, target - had) / left;
  return {
    kcal: Math.max(share(targets.kcal, eaten.kcal), targets.kcal * 0.15), // never judge a meal against nothing
    protein: share(targets.protein, eaten.protein),
    fibre: share(targets.fibre, eaten.fibre),
  };
}

export type TipId = 'light' | 'big' | 'protein' | 'fibre' | 'rich' | 'balanced';
export const TIPS: Record<TipId, string> = {
  light: 'Lighter than this meal’s share of your day. A snack later keeps you going.',
  big: 'More than this meal’s share of your day. A lighter next meal balances it out.',
  protein: 'Add some protein next time: eggs, yoghurt, beans, fish or tofu.',
  fibre: 'Add a handful of veg, beans or wholegrains for fibre.',
  rich: 'Quite rich. A lighter dressing or a little less oil would balance it.',
  balanced: 'Well balanced for your day.',
};

export interface MealFit {
  score: number;
  parts: { energy: number; protein: number; fibre: number | null; balance: number | null };
  tips: { id: TipId; text: string }[];
}

function energyPart(ratio: number): number {
  if (ratio >= 0.75 && ratio <= 1.15) return 1;
  if (ratio < 0.75) return clamp((ratio - 0.25) / 0.5, 0, 1);
  return clamp(1 - (ratio - 1.15) / 0.85, 0, 1);
}

function balancePart(meal: Nutrition): number | null {
  if (!isNum(meal.fat) || !(meal.kcal > 0)) return null;
  const fatShare = (meal.fat * 9) / meal.kcal;
  let part = fatShare <= 0.4 ? 1 : clamp(1 - (fatShare - 0.4) / 0.2, 0, 1);
  if (isNum(meal.saturatedFat) && (meal.saturatedFat * 9) / meal.kcal > 0.15) part = Math.max(0, part - 0.3);
  return part;
}

export function mealFit(meal: Nutrition, share: DayTargets): MealFit {
  const ratio = share.kcal > 0 ? meal.kcal / share.kcal : 1;
  const energy = energyPart(ratio);
  const protein = share.protein > 0 ? clamp(meal.protein / share.protein / 0.9, 0, 1) : 1;
  const fibre = isNum(meal.fibre) ? (share.fibre > 0 ? clamp(meal.fibre / share.fibre / 0.8, 0, 1) : 1) : null;
  const balance = balancePart(meal);
  const parts: [keyof typeof FIT_WEIGHTS, number | null][] = [['energy', energy], ['protein', protein], ['fibre', fibre], ['balance', balance]];
  const present = parts.filter((p): p is [keyof typeof FIT_WEIGHTS, number] => p[1] !== null);
  const weight = sum(present.map(([k]) => FIT_WEIGHTS[k]));
  const score = round((10 * sum(present.map(([k, v]) => FIT_WEIGHTS[k] * v))) / weight, 1);

  const shortfalls = present
    .filter(([, v]) => v < 0.8)
    .map(([k, v]) => ({ k, gap: FIT_WEIGHTS[k] * (1 - v) }))
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 2);
  const tips: MealFit['tips'] = shortfalls.map(({ k }) => {
    const id: TipId = k === 'energy' ? (ratio < 0.75 ? 'light' : 'big') : k === 'balance' ? 'rich' : k;
    return { id, text: TIPS[id] };
  });
  if (!tips.length) tips.push({ id: 'balanced', text: TIPS.balanced });
  return { score, parts: { energy: round(energy, 2), protein: round(protein, 2), fibre: fibre === null ? null : round(fibre, 2), balance: balance === null ? null : round(balance, 2) }, tips };
}

/* ───────────────────────── The low-intake safeguard ───────────────────────── */

export interface IntakeDay { date: DateKey; kcal: number; meals: number }

/**
 * A gentle check-in (with Beat's details) after 7 days in a row under 1,200 kcal. Only finished, logged days count:
 * today isn't over, and a day with nothing logged is unknown, not low.
 */
export function lowIntakeCheck(days: readonly IntakeDay[], today: DateKey): { checkIn: boolean; lowDays: number } {
  const byDate = new Map(days.map(d => [d.date, d]));
  let lowDays = 0;
  for (let i = 1; i <= 30; i++) {
    const d = byDate.get(addDays(today, -i));
    if (!d || d.meals < 1 || !(d.kcal < LOW_INTAKE_KCAL)) break;
    lowDays++;
  }
  return { checkIn: lowDays >= LOW_INTAKE_DAYS, lowDays };
}

/* ───────────────────────── What can I cook? ───────────────────────── */

export interface Recipe extends Nutrition { title: string; diets: readonly string[]; allergens?: readonly string[] }

/** The recipes that suit every diet asked for, avoid the allergens, and fit what's left today best. */
export function rankRecipes<R extends Recipe>(recipes: readonly R[], input: { remaining: DayTargets; diets?: readonly string[]; avoid?: readonly string[]; count?: number }): (R & { fit: MealFit })[] {
  const diets = input.diets ?? [], avoid = new Set((input.avoid ?? []).map(a => a.toLowerCase()));
  const share = { ...input.remaining, kcal: Math.max(input.remaining.kcal, 300) };
  return recipes
    .filter(r => diets.every(d => r.diets.includes(d)) && !(r.allergens ?? []).some(a => avoid.has(a.toLowerCase())))
    .map(r => ({ ...r, fit: mealFit(r, share) }))
    .sort((a, b) => b.fit.score - a.fit.score || a.title.localeCompare(b.title))
    .slice(0, input.count ?? 3);
}
