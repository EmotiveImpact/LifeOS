/**
 * Your normal: a personal baseline from your own recent days, never a population average (SPEC §3.1).
 *
 * Centre and spread are robust (median and scaled median absolute deviation) so one sick week doesn't stretch your
 * normal. Each metric has a spread floor so a very steady person isn't flagged for sensor noise; the floors follow
 * Atria's `AtriaNightBaseline.swift` (MIT, see THIRD_PARTY_NOTICES.md).
 */
import { isNum, mad, mean, median, round, sd } from '../math/stats';
import { addDays, type DateKey } from '../time/zone';

export interface DayValue { date: DateKey; value: number }

export interface Baseline {
  /** Robust centre (median). */
  usual: number;
  mean: number;
  /** Robust spread (scaled MAD), never below the floor. */
  spread: number;
  sd: number;
  n: number;
  /** Your normal range: usual ± one spread. */
  normal: [number, number];
}

export interface BaselineOptions {
  /** How many days back to look (60 for readiness, 28 for most body signals). */
  days?: number;
  /** Fewest days with data before a baseline exists. */
  minDays?: number;
  /** Count today in the baseline (off by default: today is compared against it). */
  includeToday?: boolean;
  /** Smallest spread allowed, in the metric's units. */
  spreadFloor?: number;
}

/** Values inside the window ending today (today excluded unless asked). */
export function windowValues(values: readonly DayValue[], today: DateKey, days: number, includeToday = false): number[] {
  const from = addDays(today, -days + (includeToday ? 1 : 0));
  return values.filter(v => isNum(v.value) && v.date >= from && (includeToday ? v.date <= today : v.date < today)).map(v => v.value);
}

export function personalBaseline(values: readonly DayValue[], today: DateKey, options: BaselineOptions = {}): Baseline | null {
  const { days = 60, minDays = 14, includeToday = false, spreadFloor = 0 } = options;
  const xs = windowValues(values, today, days, includeToday);
  if (xs.length < minDays) return null;
  const usual = median(xs) as number;
  const spread = Math.max(mad(xs, usual) ?? 0, spreadFloor);
  return { usual, mean: mean(xs) as number, spread, sd: sd(xs) as number, n: xs.length, normal: [usual - spread, usual + spread] };
}

/** Where a value sits against a baseline, as a z-score with the spread floor applied. */
export const zAgainst = (value: number, baseline: Pick<Baseline, 'usual' | 'spread'>) => (baseline.spread > 0 ? (value - baseline.usual) / baseline.spread : 0);

/**
 * Position on a range bar where your normal fills the middle (30 to 70), clamped to 0–100. The board's body-signal
 * tiles draw this.
 */
export function rangePosition(value: number, normal: readonly [number, number]): number {
  const [lo, hi] = normal;
  const half = (hi - lo) / 2;
  if (!(half > 0)) return 50;
  return round(Math.min(100, Math.max(0, 50 + 20 * (value - (lo + hi) / 2) / half)), 1);
}

/** Within, above or below a normal range. */
export const againstNormal = (value: number, normal: readonly [number, number]): 'below' | 'within' | 'above' =>
  value < normal[0] ? 'below' : value > normal[1] ? 'above' : 'within';
