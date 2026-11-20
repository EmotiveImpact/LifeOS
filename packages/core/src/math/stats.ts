/**
 * Small statistics kit for the engine: robust centres and spreads, a normal curve for turning a z-score into a
 * percentage, and circular statistics for clock times that cross midnight.
 *
 * The circular mean and wrapped difference follow Atria's `AtriaNightBaseline.swift` (MIT, see
 * THIRD_PARTY_NOTICES.md), rewritten in TypeScript.
 */

export const MINUTES_PER_DAY = 1440;

export const isNum = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

export function clamp(value: number, low: number, high: number): number {
  return Math.min(high, Math.max(low, value));
}

/** Rounds to `dp` decimal places without the 1.005 floating point trap. */
export function round(value: number, dp = 0): number {
  const f = 10 ** dp;
  return Math.round((value + Number.EPSILON) * f) / f;
}

export function sum(values: readonly number[]): number {
  let total = 0;
  for (const v of values) total += v;
  return total;
}

export function mean(values: readonly number[]): number | null {
  return values.length ? sum(values) / values.length : null;
}

/** Population standard deviation (n, not n − 1): we describe this person's spread, not estimate a population's. */
export function sd(values: readonly number[]): number | null {
  const m = mean(values);
  if (m === null) return null;
  return Math.sqrt(sum(values.map(v => (v - m) ** 2)) / values.length);
}

export function median(values: readonly number[]): number | null {
  if (!values.length) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Median absolute deviation, scaled by 1.4826 so it matches a standard deviation for normal data. */
export function mad(values: readonly number[], centre = median(values)): number | null {
  if (centre === null || !values.length) return null;
  return 1.4826 * (median(values.map(v => Math.abs(v - centre))) ?? 0);
}

/**
 * The standard normal cumulative distribution, Φ(z). Uses the Zelen and Severo (1964) polynomial
 * (Abramowitz and Stegun 26.2.17), accurate to about 7.5e-8, which is far finer than any score we show.
 */
export function normalCdf(z: number): number {
  if (!Number.isFinite(z)) return z > 0 ? 1 : 0;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989422804014327 * Math.exp(-z * z / 2);
  const p = d * t * (0.31938153 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return z > 0 ? 1 - p : p;
}

/** A z-score as a 0–100 percentage on the normal curve: 0 → 50, +1 → 84, −1 → 16. */
export const zToPct = (z: number) => 100 * normalCdf(z);

/* ───────────────────────── Clock times (circular) ───────────────────────── */

/** Minutes after midnight, folded into 0–1439. */
export const wrapClock = (minutes: number) => ((minutes % MINUTES_PER_DAY) + MINUTES_PER_DAY) % MINUTES_PER_DAY;

/** Smallest signed difference a − b on a 24 hour clock, in minutes (−720 to 720). */
export function clockDelta(a: number, b: number): number {
  let d = (a - b) % MINUTES_PER_DAY;
  if (d > 720) d -= MINUTES_PER_DAY;
  if (d < -720) d += MINUTES_PER_DAY;
  return d;
}

/** Circular mean of clock times in minutes, so 23:30 and 00:30 average to 00:00, not 12:00. */
export function clockMean(minutes: readonly number[]): number | null {
  if (!minutes.length) return null;
  let s = 0, c = 0;
  for (const m of minutes) {
    const a = (m / MINUTES_PER_DAY) * 2 * Math.PI;
    s += Math.sin(a);
    c += Math.cos(a);
  }
  if (Math.abs(s) < 1e-12 && Math.abs(c) < 1e-12) return null; // evenly spread round the clock: no meaningful centre
  const m = (Math.atan2(s, c) / (2 * Math.PI)) * MINUTES_PER_DAY;
  return wrapClock(round(m, 6)) % MINUTES_PER_DAY;
}

/** Spread of clock times around their circular mean, in minutes (an SD of the wrapped differences). */
export function clockSd(minutes: readonly number[]): number | null {
  const centre = clockMean(minutes);
  if (centre === null) return null;
  return Math.sqrt(sum(minutes.map(m => clockDelta(m, centre) ** 2)) / minutes.length);
}

/* ───────────────────────── Random numbers you can replay ───────────────────────── */

/** A small seeded generator (mulberry32) so anything random in the engine can be replayed in tests. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
