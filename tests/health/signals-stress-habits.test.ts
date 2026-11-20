import { describe, expect, test } from 'bun:test';
import { automaticityCheckDue, canStartHabit, graduates, habitDays, habitStrength, meetsSignal, type HabitDay } from '../../packages/core/src/health/habits';
import { bodySignals } from '../../packages/core/src/health/signals';
import { stressDay, stressLevel, stressUsual } from '../../packages/core/src/health/stress';
import { addDays } from '../../packages/core/src/time/zone';
import { makeDays, steady, TODAY } from './fixtures';

describe('body signals and the illness signal', () => {
  test('a steady month raises nothing', () => {
    const s = bodySignals(makeDays(30, steady), TODAY);
    expect(s.drifting).toEqual([]);
    expect(s.illness).toBe(false);
    expect(s.signals).toHaveLength(4);
    for (const sig of s.signals) expect(sig.position).toBeGreaterThanOrEqual(10);
  });
  test('temperature, breathing and resting heart rate drifting together is the illness signal', () => {
    const days = makeDays(30, i => (i === 29 ? { ...steady(i), skinTempDelta: 0.7, respiratoryRate: 17, restingHr: 62 } : steady(i)));
    const s = bodySignals(days, TODAY);
    expect(s.drifting.sort()).toEqual(['respiratoryRate', 'restingHr', 'skinTemp']);
    expect(s.illness).toBe(true);
    expect(s.daysRunning).toBe(1);
    expect(s.signals.find(x => x.kind === 'restingHr')!.position).toBeGreaterThan(70);
  });
  test('one signal on its own is not enough', () => {
    const days = makeDays(30, i => (i === 29 ? { ...steady(i), skinTempDelta: 0.8 } : steady(i)));
    expect(bodySignals(days, TODAY).illness).toBe(false);
  });
  test('a change smaller than the minimum real amount is noise, however steady you are', () => {
    const days = makeDays(30, i => ({ ...steady(i), restingHr: i === 29 ? 58 : 55 }));
    expect(bodySignals(days, TODAY).drifting).toEqual([]);
  });
  test('blood oxygen drifts downwards, not upwards', () => {
    const down = makeDays(30, i => (i === 29 ? { ...steady(i), spo2: 93, restingHr: 62 } : steady(i)));
    expect(bodySignals(down, TODAY).drifting.sort()).toEqual(['restingHr', 'spo2']);
  });
  test('says how many days in a row it has lasted', () => {
    const days = makeDays(30, i => (i >= 28 ? { ...steady(i), skinTempDelta: 0.7, restingHr: 63 } : steady(i)));
    expect(bodySignals(days, TODAY).daysRunning).toBe(2);
  });
  test('learns your normal for 14 days first', () => {
    expect(bodySignals(makeDays(10, steady), TODAY).learning.length).toBe(4);
  });
});

describe('stress, 0 to 3', () => {
  const ctx = { restingHr: 55, maxHr: 190 };
  test('calm at resting, high at 30% of reserve, nothing while moving', () => {
    expect(stressLevel({ start: 0, bpm: 55, still: true }, ctx)).toBe(0);
    expect(stressLevel({ start: 0, bpm: 55 + 0.3 * 135, still: true }, ctx)).toBe(3);
    expect(stressLevel({ start: 0, bpm: 55 + 0.175 * 135, still: true }, ctx)).toBe(1.5);
    expect(stressLevel({ start: 0, bpm: 120, still: false }, ctx)).toBeNull();
  });
  test('a low HRV reading nudges it up', () => {
    const withHrv = { ...ctx, lnHrvBaseline: { usual: Math.log(50), spread: 0.1 } };
    const plain = stressLevel({ start: 0, bpm: 70, still: true }, withHrv)!;
    expect(stressLevel({ start: 0, bpm: 70, still: true, hrv: 35 }, withHrv)!).toBeGreaterThan(plain);
  });
  test('the day: calm and high minutes, and the busiest stretch', () => {
    const bpms = [56, 58, 60, 95, 98, 96, 60, 57];
    const day = stressDay(bpms.map((bpm, i) => ({ start: i * 1_800_000, bpm, still: true })), ctx);
    expect(day.highMinutes).toBe(90);
    expect(day.calmMinutes).toBe(150);
    expect(day.busiest).toEqual([3, 5]);
    expect(day.now).toBe(stressLevel({ start: 0, bpm: 57, still: true }, ctx));
  });
  test('your usual range comes from the last four weeks', () => {
    const usual = stressUsual(Array.from({ length: 20 }, (_, i) => ({ date: addDays(TODAY, -i - 1), value: 1 + (i % 3) * 0.2 })), TODAY)!;
    expect(usual[0]).toBeLessThan(usual[1]);
  });
});

describe('habit strength over about 66 days', () => {
  const run = (n: number, day: HabitDay = 'done') => Array<HabitDay>(n).fill(day);
  test('66 days in a row reach 95', () => expect(habitStrength(run(66)).strength).toBe(95));
  test('one miss costs little; two in a row cost more (never miss twice)', () => {
    const base = run(30);
    const once = habitStrength([...base, 'missed', 'done', 'missed', 'done']).strength;
    const twice = habitStrength([...base, 'missed', 'missed', 'done', 'done']).strength;
    expect(once).toBeGreaterThan(twice);
    expect(habitStrength([...base, 'missed', 'done']).forgiven).toBe(1);
  });
  test('after one miss the habit is at risk, so the rescue card can show', () => {
    expect(habitStrength([...run(10), 'missed']).atRisk).toBe(true);
    expect(habitStrength([...run(10), 'missed', 'missed']).atRisk).toBe(false);
  });
  test('days off the schedule count for nothing', () => {
    expect(habitStrength(['done', 'off', 'done']).strength).toBe(habitStrength(['done', 'done']).strength);
  });
  test('"13 of the last 14", the streak and strength before the last miss', () => {
    const h = habitStrength([...run(5), 'missed', ...run(8)]);
    expect(h.lastFourteen).toEqual({ done: 13, of: 14 });
    expect(h.streak).toBe(8);
    expect(h.beforeLastMiss).toBe(habitStrength(run(5)).strength);
  });
  test('builds the days from done dates and the weekdays it runs on, and today is not missed yet', () => {
    const start = addDays(TODAY, -6); // Saturday 14 Nov to Friday 20 Nov
    const done = new Set([start, addDays(start, 2)]);
    expect(habitDays(start, TODAY, done, new Set([0, 2, 4, 5]))).toEqual(['done', 'off', 'done', 'off', 'missed', 'off', 'off']);
  });
  test('graduates after two check-ins at 4 or more; asks every two weeks; three new habits at most', () => {
    expect(graduates([3, 4, 5])).toBe(true);
    expect(graduates([5, 3])).toBe(false);
    expect(automaticityCheckDue(null, addDays(TODAY, -14), TODAY)).toBe(true);
    expect(automaticityCheckDue(addDays(TODAY, -3), addDays(TODAY, -30), TODAY)).toBe(false);
    expect([canStartHabit(2), canStartHabit(3)]).toEqual([true, false]);
  });
  test('a habit can complete itself from data', () => {
    expect(meetsSignal({ metric: 'steps', atLeast: 8000 }, { steps: 8240 })).toBe(true);
    expect(meetsSignal({ metric: 'sleepMinutes', atLeast: 420 }, {})).toBe(false);
  });
});
