import { describe, expect, test } from 'bun:test';
import {
  estimateMaxHr, heartRateZones, loadRatio, loadScore, sweetSpot, trimpForScore, trimpFromHeartRate, trimpFromZoneMinutes,
  trimpPerMinute, weeklyLoads, zoneOf,
} from '../../packages/core/src/health/load';
import { addDays } from '../../packages/core/src/time/zone';
import { TODAY } from './fixtures';

const steadyHr = (bpm: number, minutes: number, everySeconds = 5, from = 0) =>
  Array.from({ length: Math.floor(minutes * 60 / everySeconds) + 1 }, (_, i) => ({ at: from + i * everySeconds * 1000, bpm }));
const loads = (n: number, trimp: (i: number) => number) => Array.from({ length: n }, (_, i) => ({ date: addDays(TODAY, i - n + 1), trimp: trimp(i) }));

describe('heart-rate zones', () => {
  test('maximum heart rate is estimated from age (Tanaka)', () => expect(estimateMaxHr(27)).toBe(189));
  test('zones are fractions of heart-rate reserve', () => {
    const zones = heartRateZones(54, 190);
    expect(zones[1]).toEqual({ zone: 2, low: 136, high: 148 });
    expect(zones[4]).toEqual({ zone: 5, low: 176, high: 190 });
  });
  test('a heart rate falls in one zone, or none below zone 1', () => {
    expect(zoneOf(100, 54, 190)).toBe(0);
    expect(zoneOf(140, 54, 190)).toBe(2);
    expect(zoneOf(185, 54, 190)).toBe(5);
  });
});

describe('Banister TRIMP', () => {
  test('half an hour steady at 150 bpm', () => {
    const r = trimpFromHeartRate(steadyHr(150, 30), { restingHr: 60, maxHr: 190, sex: 'female' });
    expect(r.trimp).toBeCloseTo(30 * trimpPerMinute(90 / 130, 'female'), 1);
    expect(r.minutes).toBeCloseTo(30, 5);
  });
  test('the male coefficient gives more load for the same effort', () => {
    const f = trimpFromHeartRate(steadyHr(150, 30), { restingHr: 60, maxHr: 190, sex: 'female' }).trimp;
    const m = trimpFromHeartRate(steadyHr(150, 30), { restingHr: 60, maxHr: 190, sex: 'male' }).trimp;
    expect(m).toBeGreaterThan(f);
  });
  test('a gap in the readings is dropped, not bridged', () => {
    const r = trimpFromHeartRate([{ at: 0, bpm: 150 }, { at: 20 * 60_000, bpm: 150 }], { restingHr: 60, maxHr: 190 });
    expect(r.trimp).toBe(0);
    expect(r.droppedMinutes).toBe(20);
  });
  test('impossible heart rates are thrown away', () => {
    const r = trimpFromHeartRate([{ at: 0, bpm: 150 }, { at: 5000, bpm: 300 }, { at: 10_000, bpm: 150 }], { restingHr: 60, maxHr: 190 });
    expect(r.trimp).toBe(0);
  });
  test('a day at the desk adds nothing in all-day mode', () => {
    const r = trimpFromHeartRate(steadyHr(70, 8 * 60, 300), { restingHr: 60, maxHr: 190, mode: 'day' });
    expect(r.trimp).toBe(0);
  });
  test('minutes in each zone give the same kind of number', () => {
    expect(trimpFromZoneMinutes([0, 0, 30, 0, 0], 'female')).toBeCloseTo(30 * trimpPerMinute(0.75, 'female'), 1);
    expect(trimpFromZoneMinutes([10, 10, 0, 0, 0])).toBeLessThan(trimpFromZoneMinutes([0, 0, 10, 10, 0]));
  });
});

describe('the 0–21 load scale', () => {
  test('starts at zero, rises, and never passes 21', () => {
    expect(loadScore(0)).toBe(0);
    expect(loadScore(100)).toBe(13.3);
    expect(loadScore(10_000)).toBe(21);
    expect(loadScore(150)).toBeGreaterThan(loadScore(100));
  });
  test('the inverse gives back the TRIMP', () => expect(trimpForScore(loadScore(64))).toBeCloseTo(64, 0));
  test('scores do not add up; totals are added in TRIMP', () => {
    expect(loadScore(60 + 40)).toBeLessThan(loadScore(60) + loadScore(40));
  });
});

describe("today's sweet spot", () => {
  test('before 14 days of your own load, a typical active day sets it', () => {
    const s = sweetSpot({ readiness: 72, history: [], today: TODAY });
    expect([s.basis, s.band, s.low, s.high]).toEqual(['default', 'high', 9.9, 12.4]);
  });
  test('low readiness means an easy day against your own usual load', () => {
    const s = sweetSpot({ readiness: 20, history: loads(20, () => 100), today: TODAY });
    expect([s.basis, s.band, s.low, s.high]).toEqual(['personal', 'low', 0, 9.5]);
  });
  test('it says whether today is below, in or above it', () => {
    const history = loads(20, () => 100);
    expect(sweetSpot({ readiness: 50, history, today: TODAY, todayTrimp: 120 }).position).toBe('above');
    expect(sweetSpot({ readiness: 50, history, today: TODAY, todayTrimp: 90 }).position).toBe('in');
    expect(sweetSpot({ readiness: 50, history, today: TODAY, todayTrimp: 10 }).position).toBe('below');
  });
  test('while readiness is still calibrating, the sweet spot is a moderate day', () => {
    expect(sweetSpot({ readiness: null, history: [], today: TODAY }).band).toBe('unknown');
  });
});

describe('this week against the last four', () => {
  test('an even month sits in the sweet spot', () => {
    expect(loadRatio(loads(35, () => 50), TODAY)).toEqual({ acute: 350, chronic: 350, ratio: 1, zone: 'sweet' });
  });
  test('a sudden hard week is a spike', () => {
    expect(loadRatio(loads(35, i => (i >= 28 ? 100 : 50)), TODAY)?.zone).toBe('spike');
  });
  test('needs three of the four weeks before saying anything', () => {
    expect(loadRatio(loads(20, () => 50), TODAY)).toBeNull();
  });
  test('eight weeks for the chart, ending today', () => {
    const w = weeklyLoads(loads(56, () => 50), TODAY);
    expect(w).toHaveLength(8);
    expect(w[7].start).toBe(addDays(TODAY, -6));
    expect(w[7].trimp).toBe(350);
  });
});
