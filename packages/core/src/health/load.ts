/**
 * Load: how hard the day was on your heart, on a 0–21 scale, and today's sweet spot.
 *
 * - Heart-rate zones are Karvonen zones, fractions of heart-rate reserve (resting + f × (max − resting)).
 * - Raw load is Banister's TRIMP: minutes × HRR × 0.64 × e^(k × HRR), with k = 1.92 (male) or 1.67 (female)
 *   (Banister 1991; Morton, Fitz-Clarke and Banister 1990). TRIMP is the stored truth; the 0–21 number is a display
 *   scale over it, so day totals are added up in TRIMP, never in display points.
 * - Display scale: 21 × (1 − e^(−TRIMP / 100)). The interval rules (gap rejection, the 30–40% HRR ramp for all-day
 *   heart rate so sitting still adds nothing) and the scale constant are ported from Atria's
 *   `AtriaStrainLoadModel.swift` (MIT, see THIRD_PARTY_NOTICES.md).
 * - The weekly ratio compares this week with the average of the four before it; 0.8 to 1.3 builds fitness safely
 *   (Gabbett 2016, acute to chronic workload).
 *
 * Wellness guidance from your own readings, not a diagnosis.
 */
import { clamp, isNum, mean, round, sum } from '../math/stats';
import { addDays, type DateKey } from '../time/zone';

/** Sex at birth, used only where a published formula differs by it. */
export type BodySex = 'female' | 'male' | 'unknown';

export const MAX_LOAD = 21;
export const LOAD_SCALE = 100;
/** Zone edges as fractions of heart-rate reserve: zone 1 is 50–60%, zone 5 is 90–100%. */
export const ZONE_EDGES = [0.5, 0.6, 0.7, 0.8, 0.9, 1] as const;
/** A typical active day's TRIMP (about 10 on the scale), used for the sweet spot until there are 14 days of your own. */
export const DEFAULT_DAILY_TRIMP = 64;
export const LOAD_BASELINE_DAYS = 28;
export const LOAD_MIN_DAYS = 14;

/** Tanaka, Monahan and Seals (2001): 208 − 0.7 × age. Used until a measured maximum exists. */
export const estimateMaxHr = (age: number) => Math.round(208 - 0.7 * clamp(age, 13, 100));

export const trimpCoefficient = (sex: BodySex) => (sex === 'male' ? 1.92 : sex === 'female' ? 1.67 : 1.795);

export interface HeartRateZone { zone: 1 | 2 | 3 | 4 | 5; low: number; high: number }

export function heartRateZones(restingHr: number, maxHr: number): HeartRateZone[] {
  const reserve = maxHr - restingHr;
  return [1, 2, 3, 4, 5].map(zone => ({
    zone: zone as HeartRateZone['zone'],
    low: Math.round(restingHr + ZONE_EDGES[zone - 1] * reserve),
    high: Math.round(restingHr + ZONE_EDGES[zone] * reserve) - (zone < 5 ? 1 : 0),
  }));
}

/** Heart-rate reserve fraction, 0 to 1. */
export function hrrFraction(bpm: number, restingHr: number, maxHr: number): number {
  if (!(maxHr > restingHr)) return 0;
  return clamp((bpm - restingHr) / (maxHr - restingHr), 0, 1);
}

/** Zone 1–5 for a heart rate, or 0 below zone 1. */
export function zoneOf(bpm: number, restingHr: number, maxHr: number): 0 | 1 | 2 | 3 | 4 | 5 {
  const f = hrrFraction(bpm, restingHr, maxHr);
  for (let z = 5; z >= 1; z--) if (f >= ZONE_EDGES[z - 1]) return z as 1 | 2 | 3 | 4 | 5;
  return 0;
}

export const trimpPerMinute = (hrr: number, sex: BodySex) => hrr * 0.64 * Math.exp(trimpCoefficient(sex) * hrr);

/** All-day heart rate only counts above 30% of reserve, ramping to full weight at 40%, so desk time adds nothing. */
function dayWeight(hrr: number): number {
  if (hrr <= 0.3) return 0;
  if (hrr >= 0.4) return 1;
  return (hrr - 0.3) / 0.1;
}

export interface HeartRateSample { at: number; bpm: number }
export interface TrimpOptions {
  restingHr: number;
  maxHr: number;
  sex?: BodySex;
  /** `workout` counts every beat; `day` ignores the low, all-day range. */
  mode?: 'workout' | 'day';
  /** Longest gap between two readings that still counts, in seconds (watches sample every few minutes at rest). */
  maxGapSeconds?: number;
}
export interface TrimpResult { trimp: number; minutes: number; droppedMinutes: number; zoneMinutes: [number, number, number, number, number] }

const PLAUSIBLE_BPM = [35, 240] as const;

/** Banister TRIMP from heart-rate readings, joining neighbouring readings and skipping gaps and implausible values. */
export function trimpFromHeartRate(samples: readonly HeartRateSample[], options: TrimpOptions): TrimpResult {
  const { restingHr, maxHr, sex = 'unknown', mode = 'workout', maxGapSeconds = mode === 'day' ? 600 : 30 } = options;
  const out: TrimpResult = { trimp: 0, minutes: 0, droppedMinutes: 0, zoneMinutes: [0, 0, 0, 0, 0] };
  if (!(maxHr > restingHr)) return out;
  const s = samples.filter(x => isNum(x.at) && isNum(x.bpm)).slice().sort((a, b) => a.at - b.at);
  for (let i = 1; i < s.length; i++) {
    const a = s[i - 1], b = s[i];
    const minutes = (b.at - a.at) / 60_000;
    if (minutes <= 0) continue;
    if (minutes * 60 > maxGapSeconds) { out.droppedMinutes += minutes; continue; }
    if ([a.bpm, b.bpm].some(v => v < PLAUSIBLE_BPM[0] || v > PLAUSIBLE_BPM[1])) { out.droppedMinutes += minutes; continue; }
    const bpm = (a.bpm + b.bpm) / 2;
    const hrr = hrrFraction(bpm, restingHr, maxHr);
    const w = mode === 'day' ? dayWeight(hrr) : 1;
    out.trimp += minutes * trimpPerMinute(hrr, sex) * w;
    out.minutes += minutes;
    const z = zoneOf(bpm, restingHr, maxHr);
    if (z) out.zoneMinutes[z - 1] += minutes;
  }
  out.trimp = round(out.trimp, 2);
  out.minutes = round(out.minutes, 2);
  out.droppedMinutes = round(out.droppedMinutes, 2);
  out.zoneMinutes = out.zoneMinutes.map(m => round(m, 2)) as TrimpResult['zoneMinutes'];
  return out;
}

/** TRIMP from minutes in each zone (zone 1 first), taking each zone at its middle. For watches that only give zones. */
export function trimpFromZoneMinutes(zoneMinutes: readonly number[], sex: BodySex = 'unknown'): number {
  return round(sum(zoneMinutes.slice(0, 5).map((m, i) => (isNum(m) && m > 0 ? m : 0) * trimpPerMinute((ZONE_EDGES[i] + ZONE_EDGES[i + 1]) / 2, sex))), 2);
}

/** TRIMP on the 0–21 display scale. */
export function loadScore(trimp: number): number {
  if (!isNum(trimp) || trimp <= 0) return 0;
  return round(clamp(MAX_LOAD * (1 - Math.exp(-trimp / LOAD_SCALE)), 0, MAX_LOAD), 1);
}

/** The TRIMP that shows as a given score (inverse of `loadScore`). */
export function trimpForScore(score: number): number {
  const f = clamp(score, 0, MAX_LOAD - 1e-6) / MAX_LOAD;
  return -LOAD_SCALE * Math.log(1 - f);
}

/* ───────────────────────── Today's sweet spot ───────────────────────── */

export interface DailyLoad { date: DateKey; trimp: number }
export interface SweetSpot {
  low: number;
  high: number;
  lowTrimp: number;
  highTrimp: number;
  /** `personal` once there are 14 days of your own load; `default` before. */
  basis: 'personal' | 'default';
  band: 'low' | 'moderate' | 'high' | 'unknown';
  /** Where today's load sits against it. */
  position: 'below' | 'in' | 'above';
  usualTrimp: number;
}

/** The sweet spot as multiples of your usual daily load, by readiness band. */
export const SWEET_SPOT_FACTORS = { low: [0, 0.6], moderate: [0.7, 1.1], high: [1, 1.4], unknown: [0.7, 1.1] } as const;

/** Your usual daily TRIMP: the mean of the last 28 days before `today`, once 14 of them have data. */
export function usualDailyTrimp(history: readonly DailyLoad[], today: DateKey): { value: number; days: number } | null {
  const from = addDays(today, -LOAD_BASELINE_DAYS);
  const values = history.filter(d => d.date >= from && d.date < today && isNum(d.trimp) && d.trimp >= 0).map(d => d.trimp);
  return values.length >= LOAD_MIN_DAYS ? { value: mean(values) as number, days: values.length } : null;
}

export function readinessBand(readiness: number | null | undefined): SweetSpot['band'] {
  if (!isNum(readiness)) return 'unknown';
  return readiness < 34 ? 'low' : readiness < 67 ? 'moderate' : 'high';
}

/** Today's sweet spot from readiness and your usual load (SPEC §3.2 Load: recommended band given readiness). */
export function sweetSpot(input: { readiness: number | null | undefined; history: readonly DailyLoad[]; today: DateKey; todayTrimp?: number }): SweetSpot {
  const usual = usualDailyTrimp(input.history, input.today);
  const usualTrimp = usual?.value ?? DEFAULT_DAILY_TRIMP;
  const band = readinessBand(input.readiness);
  const [lo, hi] = SWEET_SPOT_FACTORS[band];
  const lowTrimp = usualTrimp * lo, highTrimp = usualTrimp * hi;
  const low = loadScore(lowTrimp), high = loadScore(highTrimp);
  const now = loadScore(input.todayTrimp ?? 0);
  return { low, high, lowTrimp: round(lowTrimp, 1), highTrimp: round(highTrimp, 1), basis: usual ? 'personal' : 'default', band, usualTrimp: round(usualTrimp, 1), position: now < low ? 'below' : now > high ? 'above' : 'in' };
}

/* ───────────────────────── The week against the last four ───────────────────────── */

export interface LoadRatio {
  /** This week's TRIMP (today and the six days before). */
  acute: number;
  /** The average week across the 28 days before that. */
  chronic: number;
  ratio: number;
  zone: 'low' | 'sweet' | 'high' | 'spike';
}

/** This week against the average of the four before; needs 21 of those 28 days to have data. */
export function loadRatio(history: readonly DailyLoad[], today: DateKey): LoadRatio | null {
  const byDate = new Map(history.filter(d => isNum(d.trimp)).map(d => [d.date, d.trimp]));
  const acuteDays = Array.from({ length: 7 }, (_, i) => byDate.get(addDays(today, -i)) ?? 0);
  const chronicDates = Array.from({ length: 28 }, (_, i) => addDays(today, -7 - i));
  if (chronicDates.filter(d => byDate.has(d)).length < 21) return null;
  const acute = sum(acuteDays);
  const chronic = sum(chronicDates.map(d => byDate.get(d) ?? 0)) / 4;
  if (chronic <= 0) return null;
  const ratio = round(acute / chronic, 2);
  return { acute: round(acute, 1), chronic: round(chronic, 1), ratio, zone: ratio < 0.8 ? 'low' : ratio <= 1.3 ? 'sweet' : ratio <= 1.5 ? 'high' : 'spike' };
}

/** Weekly totals for the last `weeks` weeks, oldest first, ending today: TRIMP and the sum of each day's score. */
export function weeklyLoads(history: readonly DailyLoad[], today: DateKey, weeks = 8): { start: DateKey; trimp: number; points: number }[] {
  const byDate = new Map(history.map(d => [d.date, d.trimp]));
  return Array.from({ length: weeks }, (_, w) => {
    const start = addDays(today, -7 * (weeks - w) + 1);
    const days = Array.from({ length: 7 }, (_, i) => byDate.get(addDays(start, i)) ?? 0);
    return { start, trimp: round(sum(days), 1), points: round(sum(days.map(loadScore)), 1) };
  });
}
