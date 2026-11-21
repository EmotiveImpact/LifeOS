import { describe, expect, test } from 'bun:test';
import { bodyToday } from '../../packages/core/src/health/body';
import { loadScore } from '../../packages/core/src/health/load';
import { addDays } from '../../packages/core/src/time/zone';
import { makeDays, night, steady, TODAY, wobble } from './fixtures';

/** BUILD_V26 Phase 26: Body's numbers from real readings, each against your own normal, and nothing made up. */
describe('nothing yet', () => {
  test('no readings give no numbers, never a zero dressed up as a reading', () => {
    const b = bodyToday({ days: [], today: TODAY });
    expect(b).toMatchObject({ daysWithData: 0, lastDate: null, readinessWeek: [null, null, null, null, null, null, null], normal: null, against: null, sleep: null, load: null, stress: null, steps: null });
    expect(b.readiness).toEqual({ status: 'calibrating', daysWithData: 0, daysNeeded: 14 });
    expect(b.signals.signals).toEqual([]);
    expect(b.week).toHaveLength(7);
    expect(b.week[6]).toBe(TODAY);
    expect(b.readings.hrv).toEqual([null, null, null, null, null, null, null]);
  });
  test('nine days: readiness is still learning, but last night’s sleep shows', () => {
    const b = bodyToday({ days: makeDays(9, steady), today: TODAY });
    expect(b.readiness).toMatchObject({ status: 'calibrating', daysWithData: 9 });
    expect(b.sleep?.last?.asleepMinutes).toBe(480);
    expect(b.sleep?.need.basis).toBe('default');
    expect(b.normal).toBeNull();
  });
});

describe('readiness against your normal', () => {
  const days = makeDays(60, steady);
  test('your normal comes from your own last 60 days of scores, not a fixed band', () => {
    const b = bodyToday({ days, today: TODAY });
    expect(b.readiness.status).toBe('ready');
    expect(b.normal).not.toBeNull();
    const n = b.normal!;
    expect(n.low).toBeLessThan(n.usual);
    expect(n.high).toBeGreaterThan(n.usual);
    expect([n.low, n.high]).not.toEqual([60, 70]);
    expect(b.against).toBe('within');
    expect(b.readinessWeek.every(v => typeof v === 'number')).toBe(true);
    expect(b.readinessWeek[6]).toBe(b.readiness.status === 'ready' ? b.readiness.score : -1);
    expect(b.readings.hrv.every(v => typeof v === 'number')).toBe(true);
    expect(b.readings.restingHr[6]).toBe(Math.round(days[days.length - 1].restingHr!));
  });
  test('a stale reading never becomes today’s score', () => {
    const b = bodyToday({ days: days.slice(0, 57), today: TODAY });
    expect(b.lastDate).toBe(addDays(TODAY, -3));
    expect(b.readiness.status).not.toBe('ready');
    expect(b.readinessWeek.slice(4)).toEqual([null, null, null]);
  });
});

describe('sleep', () => {
  test('short nights add up to a debt, tonight asks for some of it back, and the plan works back from your usual wake', () => {
    const days = makeDays(30, i => ({ ...steady(i), sleep: { ...night(i >= 26 ? 390 : 480), wake: 7 * 60 } }));
    const s = bodyToday({ days, today: TODAY }).sleep!;
    expect(s.need.basis).toBe('learned');
    expect(s.debt.minutes).toBeGreaterThan(0);
    expect(s.tonight.minutes).toBeGreaterThan(s.need.minutes);
    expect(s.week).toHaveLength(7);
    expect(s.week[6]).toBe(390);
    expect(s.reached).toBe(3);
    expect(s.plan.map(p => p.goal)).toEqual(['minimum', 'enough', 'full']);
    expect(s.performance).toBe(Math.round(390 / s.need.minutes * 100));
  });
  test('a missing night is a gap, not a zero', () => {
    const days = makeDays(10, (i) => (i === 7 ? { hrv: 50 } : steady(i)));
    expect(bodyToday({ days, today: TODAY }).sleep!.week[4]).toBeNull();
  });
});

describe('load', () => {
  test('today’s load is today’s own score, aimed at a sweet spot from your usual days', () => {
    const days = makeDays(30, i => ({ ...steady(i), trimp: 70 + 10 * wobble(i) }));
    const l = bodyToday({ days, today: TODAY }).load!;
    expect(l.today).toBe(loadScore(days[29].trimp!));
    expect(l.sweetSpot.basis).toBe('personal');
    expect(l.sweetSpot.low).toBeLessThan(l.sweetSpot.high);
    expect(l.week).toHaveLength(7);
    expect(l.ratio?.zone).toBe('sweet');
  });
  test('no heart rate means no load at all', () => {
    expect(bodyToday({ days: makeDays(20, steady), today: TODAY }).load).toBeNull();
  });
});

describe('body signals and stress', () => {
  test('a watch’s wrist temperature and a raised resting heart rate together raise the illness signal', () => {
    const days = makeDays(30, i => ({ ...steady(i), skinTempDelta: undefined, skinTemp: 34.6 + 0.05 * wobble(i), ...(i === 29 ? { skinTemp: 35.5, restingHr: 62 } : {}) }));
    const b = bodyToday({ days, today: TODAY });
    expect(b.signals.drifting).toEqual(expect.arrayContaining(['skinTemp', 'restingHr']));
    expect(b.signals.illness).toBe(true);
  });
  test('stress shows from the day’s own half hours, with your usual range once there are 7 days', () => {
    const stress = (avg: number) => ({ average: avg, now: avg, levels: [avg], highMinutes: 0, calmMinutes: 30, calmShare: 100, busiest: null, start: 0, windowMinutes: 30 });
    const days = makeDays(10, i => ({ ...steady(i), stress: stress(1 + 0.2 * wobble(i)) }));
    const s = bodyToday({ days, today: TODAY }).stress!;
    expect(s.now).toBe(days[9].stress!.now);
    expect(s.usual).not.toBeNull();
    expect(s.week).toHaveLength(7);
  });
});
