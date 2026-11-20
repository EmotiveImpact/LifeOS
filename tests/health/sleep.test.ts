import { describe, expect, test } from 'bun:test';
import {
  baseSleepNeed, bedtimeConsistency, planBedtime, personalTimings, recentShortfall, sleepDebt, sleepNeedTonight, sleepPerformance,
  sleepRegularity, travelNights, type NightTimes,
} from '../../packages/core/src/health/sleep';
import { addDays, instantAt } from '../../packages/core/src/time/zone';
import { TODAY } from './fixtures';

const LDN = 'Europe/London';
const nights = (minutes: number[], today = TODAY) => minutes.map((asleepMinutes, i) => ({ date: addDays(today, i - minutes.length + 1), asleepMinutes }));
/** A night from `bed` (minutes, may be ≥ 1440 for after midnight) on the evening before `date` to `wake` on `date`. */
const timed = (date: string, bed: number, wake: number, timeZone = LDN): NightTimes => ({
  date, timeZone, start: instantAt(addDays(date, -1), bed, timeZone), end: instantAt(date, wake, timeZone),
});

describe('sleep need', () => {
  test('starts at 8 hours', () => expect(baseSleepNeed(nights([420, 430]), TODAY)).toEqual({ minutes: 480, basis: 'default', nights: 2 }));
  test('learns halfway towards your typical night once there are 14', () => {
    expect(baseSleepNeed(nights(Array(20).fill(420)), TODAY)).toEqual({ minutes: 450, basis: 'learned', nights: 20 });
  });
  test('stays inside the NHS 7 to 9 hour guide', () => {
    expect(baseSleepNeed(nights(Array(20).fill(600)), TODAY).minutes).toBe(510);
  });
  test('crash nights under 5 hours teach it nothing', () => {
    expect(baseSleepNeed(nights([...Array(10).fill(240), ...Array(10).fill(480)]), TODAY).basis).toBe('default');
  });
  test('prefers nights before a high-readiness morning when readiness is known', () => {
    const list = nights([...Array(10).fill(400), ...Array(8).fill(500)]);
    const readinessByDate = Object.fromEntries(list.map(n => [n.date, n.asleepMinutes === 500 ? 75 : 50]));
    expect(baseSleepNeed(list, TODAY, readinessByDate)).toEqual({ minutes: 490, basis: 'learned', nights: 8 });
  });
});

describe('sleep debt', () => {
  test('short nights add, long nights pay back', () => {
    const d = sleepDebt(nights([440, 492, 470, 485, 450, 504, 430]), 480, TODAY);
    expect(d.ledger.map(n => n.debt)).toEqual([40, 28, 38, 33, 63, 39, 89]);
    expect(d.minutes).toBe(89);
  });
  test('never goes below zero: you cannot bank sleep in advance', () => {
    expect(sleepDebt(nights([600, 600, 420]), 480, TODAY).minutes).toBe(60);
  });
  test('is capped at 8 hours', () => expect(sleepDebt(nights(Array(7).fill(200)), 480, TODAY).minutes).toBe(480));
  test('a night with no reading changes nothing', () => {
    const list = nights([420, 420, 420]).filter((_, i) => i !== 1);
    expect(sleepDebt(list, 480, TODAY).minutes).toBe(120);
  });
  test('the planner rule: 3 hours short over 3 nights', () => {
    expect(recentShortfall(nights([480, 400, 400, 400]), 480, TODAY)).toBe(240);
    expect(recentShortfall(nights([480, 470, 470, 470]), 480, TODAY)).toBe(30);
  });
});

describe("tonight's need", () => {
  test('adds a third of the debt, a little for a hard day, and takes off most of a nap', () => {
    const n = sleepNeedTonight({ base: 480, debtMinutes: 89, todayLoad: 12, napMinutes: 20 });
    expect([n.minutes, n.debt, n.load, n.nap, n.clamped]).toEqual([500, 30, 8, 18, false]);
  });
  test('repays at most an hour a night and stays between 6 and 10 hours', () => {
    expect(sleepNeedTonight({ base: 480, debtMinutes: 480 }).debt).toBe(60);
    const napped = sleepNeedTonight({ base: 480, debtMinutes: 0, napMinutes: 300 });
    expect([napped.minutes, napped.clamped]).toEqual([360, true]);
  });
  test('performance is asleep over need, capped at 100', () => {
    expect(sleepPerformance(430, 485)).toBe(89);
    expect(sleepPerformance(600, 480)).toBe(100);
  });
});

describe('consistency and regularity', () => {
  test('bedtime moving half an hour either way reads as about half an hour', () => {
    const beds = [22 * 60 + 30, 23 * 60 + 30, 22 * 60 + 30, 23 * 60, 23 * 60 + 30, 22 * 60 + 30, 23 * 60 + 30];
    const c = bedtimeConsistency(beds.map((bed, i) => timed(addDays(TODAY, i - 6), bed, 7 * 60)), TODAY);
    expect(c?.minutes).toBe(28);
    expect(c?.usualBedtime).toBe(23 * 60);
    expect(c?.usualWake).toBe(7 * 60);
  });
  test('the same night every night is perfectly regular', () => {
    const list = Array.from({ length: 7 }, (_, i) => timed(addDays(TODAY, i - 6), 23 * 60, 7 * 60));
    expect(sleepRegularity(list)).toEqual({ score: 100, pairs: 5 });
  });
  test('alternating late and early nights lowers it', () => {
    const list = Array.from({ length: 8 }, (_, i) => (i % 2 ? timed(addDays(TODAY, i - 7), 23 * 60, 7 * 60) : timed(addDays(TODAY, i - 7), 25 * 60, 9 * 60)));
    expect(sleepRegularity(list)?.score).toBe(67);
  });
  test('the clocks going back do not count as irregular', () => {
    const list = Array.from({ length: 7 }, (_, i) => timed(addDays('2026-10-28', i - 6), 23 * 60, 7 * 60));
    expect(sleepRegularity(list)?.score).toBe(100);
  });
  test('the nights around a flight are left out', () => {
    const list = [
      ...Array.from({ length: 4 }, (_, i) => timed(addDays(TODAY, i - 6), 23 * 60, 7 * 60)),
      ...Array.from({ length: 3 }, (_, i) => timed(addDays(TODAY, i - 2), 23 * 60, 7 * 60, 'America/New_York')),
    ];
    expect([...travelNights(list)]).toEqual([addDays(TODAY, -2), addDays(TODAY, -1)]);
  });
});

describe("tonight's bedtime", () => {
  test('works back from the wake time for each goal', () => {
    const [minimum, enough, full] = planBedtime({ wake: 6 * 60 + 45, base: 480, tonight: 510, latency: 14, awake: 15 });
    expect(minimum).toEqual({ goal: 'minimum', asleep: 420, bedtime: 23 * 60 + 16, reminder: 22 * 60 + 31 });
    expect(enough.bedtime).toBe(22 * 60 + 16);
    expect(full).toEqual({ goal: 'full', asleep: 510, bedtime: 21 * 60 + 46, reminder: 21 * 60 + 1 });
  });
  test('uses your own minutes to fall asleep once there are five nights', () => {
    expect(personalTimings([])).toEqual({ latency: 15, awake: 15, learned: false });
    expect(personalTimings(Array(5).fill({ latencyMinutes: 9, awakeMinutes: 22 }))).toEqual({ latency: 9, awake: 22, learned: true });
  });
});
