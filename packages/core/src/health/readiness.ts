/**
 * Readiness, 0 to 100, against your own normal (SPEC §3.3, v1 model):
 *
 *   readiness = weighted mean of
 *     HRV, this week's average against your last 60 days      0.40
 *     resting heart rate, the same, lower is better           0.25
 *     sleep performance, last night's asleep ÷ need           0.25
 *     breathing rate, last night against your normal, lower   0.10
 *
 * Each z-score becomes a percentage on the normal curve (0 → 50, +1 → 84). HRV is compared on a log scale and only
 * against nights measured the same way (Apple's SDNN and a ring's RMSSD aren't comparable). The week's average is
 * judged against how much your weekly average usually moves, not how much single nights do. A wearable's own
 * recovery score, when there is one, is a fifth input at a quarter of the weight and is named as its source.
 *
 * Shows nothing until 14 of the last 60 days have heart data ("Calibrating, 9 of 14 days"). Bands: 0–33 low,
 * 34–66 moderate, 67–100 high. Wellness guidance from your own readings, not a diagnosis.
 */
import { isNum, mean, round, sd, sum, zToPct } from '../math/stats';
import { addDays, type DateKey } from '../time/zone';
import { againstNormal, personalBaseline, type DayValue } from './baseline';
import { DEFAULT_SLEEP_NEED, sleepPerformance } from './sleep';
import type { DailyHealth } from './types';

export const READINESS_WEIGHTS = { hrv: 0.4, restingHr: 0.25, sleep: 0.25, respiratoryRate: 0.1 } as const;
export const EXTERNAL_WEIGHT = 0.25;
export const READINESS_MIN_DAYS = 14;
export const READINESS_BASELINE_DAYS = 60;
export const READINESS_RECENT_DAYS = 7;

export type DriverKind = 'hrv' | 'restingHr' | 'sleep' | 'respiratoryRate' | 'external';
export type ReadinessBand = 'low' | 'moderate' | 'high';

export interface ReadinessDriver {
  kind: DriverKind;
  /** Last night's reading (ms, bpm, % of need, breaths a minute, or the wearable's score). */
  value: number;
  /** This week's average, for HRV and resting heart rate. */
  recent?: number;
  /** Your usual value and normal range from the last 60 days (not for sleep or the wearable's score). */
  usual?: number;
  normal?: [number, number];
  /** Last night against your usual, in the reading's units. */
  delta?: number;
  /** This input's score, 0–100. */
  score: number;
  weight: number;
  /** How far it pushed readiness up or down against an ordinary day (50, or 85% of need for sleep), after weighting. */
  points: number;
  effect: 'better' | 'worse' | 'usual';
  source?: string;
}

export type Readiness =
  | { status: 'calibrating'; daysWithData: number; daysNeeded: number }
  | { status: 'not-enough'; reason: 'no-heart-data' | 'too-few-inputs' }
  | { status: 'ready'; score: number; band: ReadinessBand; drivers: ReadinessDriver[]; inputs: number };

export const bandOf = (score: number): ReadinessBand => (score < 34 ? 'low' : score < 67 ? 'moderate' : 'high');

const SPREAD_FLOOR = { lnHrv: 0.03, restingHr: 0.5, respiratoryRate: 0.3 } as const;
/** A night at 85% of need is an ordinary night: it neither helps nor weighs on the drivers list. */
const SLEEP_NEUTRAL = 85;
const MIN_RECENT = 3;

function series(days: readonly DailyHealth[], pick: (d: DailyHealth) => number | undefined): DayValue[] {
  const out: DayValue[] = [];
  for (const d of days) { const v = pick(d); if (isNum(v)) out.push({ date: d.date, value: v }); }
  return out;
}

/** Mean of values in the 7 days ending `date`, if at least 3 have data. */
function weekMean(byDate: Map<DateKey, number>, date: DateKey): number | null {
  const xs: number[] = [];
  for (let i = 0; i < READINESS_RECENT_DAYS; i++) { const v = byDate.get(addDays(date, -i)); if (v !== undefined) xs.push(v); }
  return xs.length >= MIN_RECENT ? (mean(xs) as number) : null;
}

/**
 * This week's average against your last 60 days. The spread is how much your 7-day average usually moves, never
 * less than a single night's spread over √7 or the floor.
 */
function weekComponent(values: readonly DayValue[], today: DateKey, floor: number) {
  const byDate = new Map(values.map(v => [v.date, v.value]));
  const recent = weekMean(byDate, today);
  if (recent === null) return null;
  const from = addDays(today, -READINESS_BASELINE_DAYS);
  const daily = values.filter(v => v.date >= from && v.date < today).map(v => v.value);
  if (daily.length < READINESS_MIN_DAYS - 1) return null;
  const rolling: number[] = [];
  for (let i = 1; i <= READINESS_BASELINE_DAYS; i++) { const m = weekMean(byDate, addDays(today, -i)); if (m !== null) rolling.push(m); }
  const centre = mean(daily) as number;
  const spread = Math.max(sd(rolling) ?? 0, (sd(daily) ?? 0) / Math.sqrt(READINESS_RECENT_DAYS), floor);
  return { recent, centre, spread, z: (recent - centre) / spread };
}

function effectOf(score: number): ReadinessDriver['effect'] {
  return score >= 60 ? 'better' : score <= 40 ? 'worse' : 'usual';
}

export interface ReadinessInput {
  days: readonly DailyHealth[];
  today: DateKey;
  /** Last night's sleep need in minutes (sleep.ts); 8 hours if not given. */
  sleepNeed?: number;
}

/** Readiness for `today` using only days up to and including it. */
export function readiness(input: ReadinessInput): Readiness {
  const { today } = input;
  const from = addDays(today, -READINESS_BASELINE_DAYS + 1);
  const days = input.days.filter(d => d.date >= from && d.date <= today);
  const todayRow = days.find(d => d.date === today);
  const daysWithData = days.filter(d => isNum(d.hrv) || isNum(d.restingHr)).length;
  if (daysWithData < READINESS_MIN_DAYS) return { status: 'calibrating', daysWithData, daysNeeded: READINESS_MIN_DAYS };

  const parts: Omit<ReadinessDriver, 'points' | 'weight'>[] = [];
  const weights: number[] = [];

  // HRV: only nights measured the same way as the latest one.
  const method = [...days].reverse().find(d => isNum(d.hrv))?.hrvMethod;
  const hrvDays = days.filter(d => isNum(d.hrv) && d.hrv > 0 && d.hrvMethod === method);
  const hrv = weekComponent(series(hrvDays, d => Math.log(d.hrv as number)), today, SPREAD_FLOOR.lnHrv);
  if (hrv && isNum(todayRow?.hrv) && todayRow.hrvMethod === method) {
    const base = personalBaseline(series(hrvDays, d => d.hrv), today, { days: READINESS_BASELINE_DAYS, minDays: READINESS_MIN_DAYS - 1, spreadFloor: 2 });
    const score = zToPct(hrv.z);
    parts.push({ kind: 'hrv', value: todayRow.hrv, recent: round(Math.exp(hrv.recent), 1), usual: base ? round(base.usual, 1) : round(Math.exp(hrv.centre), 1), normal: base ? [round(base.normal[0]), round(base.normal[1])] : undefined, delta: base ? round(todayRow.hrv - base.usual, 1) : undefined, score, effect: effectOf(score) });
    weights.push(READINESS_WEIGHTS.hrv);
  }

  const rhrValues = series(days, d => d.restingHr);
  const rhr = weekComponent(rhrValues, today, SPREAD_FLOOR.restingHr);
  if (rhr && isNum(todayRow?.restingHr)) {
    const base = personalBaseline(rhrValues, today, { days: READINESS_BASELINE_DAYS, minDays: READINESS_MIN_DAYS - 1, spreadFloor: 1 });
    const score = zToPct(-rhr.z);
    parts.push({ kind: 'restingHr', value: todayRow.restingHr, recent: round(rhr.recent, 1), usual: base ? round(base.usual, 1) : round(rhr.centre, 1), normal: base ? [round(base.normal[0]), round(base.normal[1])] : undefined, delta: base ? round(todayRow.restingHr - base.usual, 1) : undefined, score, effect: effectOf(score) });
    weights.push(READINESS_WEIGHTS.restingHr);
  }

  if (isNum(todayRow?.sleep?.asleepMinutes)) {
    const score = sleepPerformance(todayRow.sleep.asleepMinutes, input.sleepNeed ?? DEFAULT_SLEEP_NEED);
    parts.push({ kind: 'sleep', value: score, score, effect: score >= SLEEP_NEUTRAL + 5 ? 'better' : score < SLEEP_NEUTRAL - 10 ? 'worse' : 'usual' });
    weights.push(READINESS_WEIGHTS.sleep);
  }

  if (isNum(todayRow?.respiratoryRate)) {
    const base = personalBaseline(series(days, d => d.respiratoryRate), today, { days: READINESS_BASELINE_DAYS, minDays: READINESS_MIN_DAYS - 1, spreadFloor: SPREAD_FLOOR.respiratoryRate });
    if (base) {
      const score = zToPct(-(todayRow.respiratoryRate - base.usual) / base.spread);
      parts.push({ kind: 'respiratoryRate', value: todayRow.respiratoryRate, usual: round(base.usual, 1), normal: [round(base.normal[0], 1), round(base.normal[1], 1)], delta: round(todayRow.respiratoryRate - base.usual, 1), score, effect: effectOf(score) });
      weights.push(READINESS_WEIGHTS.respiratoryRate);
    }
  }

  const heart = parts.some(p => p.kind === 'hrv' || p.kind === 'restingHr');
  if (!heart) return { status: 'not-enough', reason: 'no-heart-data' };
  if (parts.length < 2) return { status: 'not-enough', reason: 'too-few-inputs' };

  // A wearable's own score: a quarter of the weight, the rest scaled to three quarters.
  const ext = todayRow?.externalRecovery;
  if (ext && isNum(ext.value)) {
    const own = sum(weights);
    for (let i = 0; i < weights.length; i++) weights[i] = (weights[i] / own) * (1 - EXTERNAL_WEIGHT);
    const score = Math.min(100, Math.max(0, ext.value));
    parts.push({ kind: 'external', value: ext.value, score, effect: effectOf(score), source: ext.source });
    weights.push(EXTERNAL_WEIGHT);
  }

  const total = sum(weights);
  const drivers: ReadinessDriver[] = parts.map((p, i) => {
    const weight = weights[i] / total;
    const neutral = p.kind === 'sleep' ? SLEEP_NEUTRAL : 50;
    return { ...p, value: round(p.value, 1), score: Math.round(p.score), weight: round(weight, 3), points: round(weight * (p.score - neutral), 1) };
  });
  const score = Math.round(Math.min(100, Math.max(0, sum(parts.map((p, i) => p.score * weights[i])) / total)));
  drivers.sort((a, b) => Math.abs(b.points) - Math.abs(a.points));
  return { status: 'ready', score, band: bandOf(score), drivers, inputs: drivers.length };
}

/** Readiness for each date in a range, each using only the days up to it. */
export function readinessHistory(days: readonly DailyHealth[], dates: readonly DateKey[], needOf?: (date: DateKey) => number): DayValue[] {
  const out: DayValue[] = [];
  for (const date of dates) {
    const r = readiness({ days, today: date, sleepNeed: needOf?.(date) });
    if (r.status === 'ready') out.push({ date, value: r.score });
  }
  return out;
}

/** Your normal readiness range from the last 60 days of scores (board: "Your normal is 60 to 70"). */
export function readinessNormal(scores: readonly DayValue[], today: DateKey): { low: number; high: number; usual: number; days: number } | null {
  const base = personalBaseline(scores, today, { days: READINESS_BASELINE_DAYS, minDays: READINESS_MIN_DAYS, spreadFloor: 3 });
  if (!base) return null;
  return { low: Math.round(base.normal[0]), high: Math.round(base.normal[1]), usual: Math.round(base.usual), days: base.n };
}

/** Today's score against your normal range. */
export const readinessAgainstNormal = (score: number, normal: { low: number; high: number }) => againstNormal(score, [normal.low, normal.high]);

/**
 * Tomorrow's readiness for different bedtimes: today's heart inputs held where they are, sleep replaced by what each
 * bedtime would give. An estimate, labelled as one.
 */
export function forecastReadiness(today: Extract<Readiness, { status: 'ready' }>, scenarios: readonly { asleepMinutes: number }[], needMinutes: number): number[] {
  const others = today.drivers.filter(d => d.kind !== 'sleep');
  const otherWeight = sum(others.map(d => d.weight));
  const share = today.drivers.find(d => d.kind === 'sleep')?.weight ?? READINESS_WEIGHTS.sleep;
  return scenarios.map(s => {
    const sleepScore = sleepPerformance(s.asleepMinutes, needMinutes);
    const value = (sum(others.map(d => d.score * d.weight)) * (1 - share) / (otherWeight || 1)) + sleepScore * share;
    return Math.round(Math.min(100, Math.max(0, value)));
  });
}
