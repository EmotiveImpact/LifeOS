import { describe, expect, test } from 'bun:test';
import { forecastReadiness, readiness, readinessHistory, readinessNormal, type Readiness } from '../../packages/core/src/health/readiness';
import { addDays } from '../../packages/core/src/time/zone';
import { makeDays, night, steady, TODAY, wobble } from './fixtures';

const ready = (r: Readiness) => {
  if (r.status !== 'ready') throw new Error(`expected a score, got ${r.status}`);
  return r;
};

describe('calibrating', () => {
  test('shows no number until 14 days have heart data', () => {
    expect(readiness({ days: makeDays(9, steady), today: TODAY })).toEqual({ status: 'calibrating', daysWithData: 9, daysNeeded: 14 });
  });
  test('sleep alone is not enough to score', () => {
    const days = makeDays(30, i => ({ ...steady(i), ...(i === 29 ? { hrv: undefined, restingHr: undefined } : {}) }));
    expect(readiness({ days, today: TODAY })).toEqual({ status: 'not-enough', reason: 'no-heart-data' });
  });
});

describe('scoring against your own normal', () => {
  test('an ordinary week with a full night sits in the moderate band', () => {
    const r = ready(readiness({ days: makeDays(40, steady), today: TODAY }));
    expect(r.band).toBe('moderate');
    expect(r.score).toBeGreaterThanOrEqual(55);
    expect(r.score).toBeLessThanOrEqual(70);
    expect(r.inputs).toBe(4);
  });
  test('a week of higher HRV and lower resting heart rate scores high', () => {
    const days = makeDays(40, i => (i >= 33 ? { ...steady(i), hrv: 60 + wobble(i), restingHr: 52 + 0.3 * wobble(i) } : steady(i)));
    const r = ready(readiness({ days, today: TODAY }));
    expect(r.band).toBe('high');
    expect(r.drivers.find(d => d.kind === 'hrv')?.effect).toBe('better');
  });
  test('a rough week with short sleep scores low', () => {
    const days = makeDays(40, i => (i >= 33 ? { ...steady(i), hrv: 40 + wobble(i), restingHr: 61 + 0.3 * wobble(i), sleep: night(300), respiratoryRate: 16.5 } : steady(i)));
    const r = ready(readiness({ days, today: TODAY }));
    expect(r.band).toBe('low');
    expect(r.score).toBeLessThan(34);
    expect(r.drivers[0].effect).toBe('worse');
  });
  test('drivers come biggest first, and better always pushes up while worse pulls down', () => {
    const days = makeDays(40, i => (i === 39 ? { ...steady(i), hrv: 38, restingHr: 60, sleep: night(330) } : steady(i)));
    const r = ready(readiness({ days, today: TODAY }));
    for (let i = 1; i < r.drivers.length; i++) expect(Math.abs(r.drivers[i - 1].points)).toBeGreaterThanOrEqual(Math.abs(r.drivers[i].points));
    for (const d of r.drivers) {
      if (d.effect === 'better') expect(d.points).toBeGreaterThan(0);
      if (d.effect === 'worse') expect(d.points).toBeLessThan(0);
    }
    expect(r.drivers.find(d => d.kind === 'sleep')?.effect).toBe('worse');
    const weights = r.drivers.reduce((s, d) => s + d.weight, 0);
    expect(weights).toBeCloseTo(1, 2);
  });
  test('HRV drivers carry last night, the week, your usual and your normal range', () => {
    const r = ready(readiness({ days: makeDays(40, steady), today: TODAY }));
    const hrv = r.drivers.find(d => d.kind === 'hrv')!;
    expect(hrv.usual).toBeGreaterThan(47);
    expect(hrv.usual).toBeLessThan(53);
    expect(hrv.normal![0]).toBeLessThan(hrv.usual!);
    expect(hrv.normal![1]).toBeGreaterThan(hrv.usual!);
    expect(hrv.recent).toBeDefined();
  });
});

describe('honest inputs', () => {
  test('HRV measured a new way is not compared with the old way', () => {
    const days = makeDays(40, i => (i === 39 ? { ...steady(i), hrv: 80, hrvMethod: 'rmssd' } : steady(i)));
    const r = ready(readiness({ days, today: TODAY }));
    expect(r.drivers.some(d => d.kind === 'hrv')).toBe(false);
  });
  test("a wearable's own score is one input, a quarter of the weight, named as its source", () => {
    const days = makeDays(40, i => (i === 39 ? { ...steady(i), externalRecovery: { value: 90, source: 'WHOOP' } } : steady(i)));
    const r = ready(readiness({ days, today: TODAY }));
    const ext = r.drivers.find(d => d.kind === 'external')!;
    expect([ext.weight, ext.source]).toEqual([0.25, 'WHOOP']);
    expect(r.score).toBeGreaterThan(ready(readiness({ days: makeDays(40, steady), today: TODAY })).score);
  });
  test('a past day is scored only from days up to it', () => {
    const base = makeDays(40, steady);
    const later = base.map((d, i) => (i > 35 ? { ...d, hrv: 20, restingHr: 80 } : d));
    const day = addDays(TODAY, -5);
    expect(readiness({ days: later, today: day })).toEqual(readiness({ days: base, today: day }));
  });
});

describe('your normal and tomorrow', () => {
  test('your normal comes from your last 60 days of scores', () => {
    const days = makeDays(80, steady);
    const dates = days.slice(20).map(d => d.date);
    const scores = readinessHistory(days, dates);
    const normal = readinessNormal(scores, TODAY)!;
    expect(normal.low).toBeLessThanOrEqual(normal.usual);
    expect(normal.high).toBeGreaterThanOrEqual(normal.usual);
    expect(normal.days).toBeGreaterThanOrEqual(14);
  });
  test('an earlier bedtime forecasts a better morning', () => {
    const r = ready(readiness({ days: makeDays(40, steady), today: TODAY }));
    const [early, late] = forecastReadiness(r, [{ asleepMinutes: 480 }, { asleepMinutes: 360 }], 480);
    expect(early).toBeGreaterThan(late);
  });
});
