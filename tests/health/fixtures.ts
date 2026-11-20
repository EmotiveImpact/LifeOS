import type { DailyHealth } from '../../packages/core/src/health/types';
import { addDays } from '../../packages/core/src/time/zone';

export const TODAY = '2026-11-20';

/** `n` days ending on `today`, oldest first; `make(i, date)` fills each (i = 0 is the oldest). */
export function makeDays(n: number, make: (i: number, date: string) => Partial<DailyHealth>, today = TODAY): DailyHealth[] {
  return Array.from({ length: n }, (_, i) => {
    const date = addDays(today, i - n + 1);
    return { date, timeZone: 'Europe/London', ...make(i, date) };
  });
}

/** A gentle wobble so spreads are never zero: deterministic, ±1 around 0. */
export const wobble = (i: number) => Math.sin(i * 1.7) * 0.8 + Math.cos(i * 0.9) * 0.2;

export const night = (asleepMinutes: number) => ({
  start: 0, end: asleepMinutes * 60_000, asleepMinutes, inBedMinutes: asleepMinutes + 20, awakeMinutes: 20, bedtime: 23 * 60, wake: 7 * 60, efficiency: asleepMinutes / (asleepMinutes + 20),
});

/** A steady, healthy person: HRV about 50 ms (SDNN), resting heart rate 55, 8 hours asleep, breathing 15. */
export const steady = (i: number): Partial<DailyHealth> => ({
  hrv: 50 + 3 * wobble(i), hrvMethod: 'sdnn', restingHr: 55 + wobble(i + 3), respiratoryRate: 15 + 0.2 * wobble(i + 5), sleep: night(480),
  skinTempDelta: 0.05 * wobble(i + 7), spo2: 97 + 0.5 * wobble(i + 2),
});
