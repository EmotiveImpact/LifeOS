import { describe, expect, test } from 'bun:test';
import { HEALTH_BACKFILL_DAYS, mergeDays, readWindow, withSkinTempDeltas } from '../../packages/core/src/health/days';
import { summariseDays, type HealthSample, type HealthSource } from '../../packages/core/src/health/samples';
import { addDays, lifeDayBounds } from '../../packages/core/src/time/zone';
import { makeDays, TODAY } from './fixtures';

/** BUILD_V26 Phase 26: reading health data since the last anchor, and keeping one row per day. */
const TZ = 'Europe/London';
const NOW = Date.parse('2026-11-20T12:00:00Z');
const watch: HealthSource = { id: 'watch', kind: 'device', name: 'Apple Watch' };
const phone: HealthSource = { id: 'phone', kind: 'device', name: 'iPhone' };
const at = (hhmm: string, date = TODAY) => Date.parse(`${date}T${hhmm}:00Z`);

describe('what to read', () => {
  test('the first read goes back far enough for a 60-day normal, and takes in the night before the first morning', () => {
    const w = readWindow(null, NOW, TZ);
    expect(w.dates).toEqual([addDays(TODAY, -HEALTH_BACKFILL_DAYS + 1), TODAY]);
    expect(w.from).toBe(lifeDayBounds(w.dates[0], TZ).start - 12 * 3_600_000);
    expect(w.to).toBe(NOW);
  });
  test('after that, from the day before the last read, so a late reading is summarised with the rest of its day', () => {
    const w = readWindow(Date.parse('2026-11-19T22:00:00Z'), NOW, TZ);
    expect(w.dates).toEqual(['2026-11-18', TODAY]);
  });
  test('an anchor from the future or long ago never reads less than a day or more than the backfill', () => {
    expect(readWindow(NOW + 86_400_000, NOW, TZ).dates).toEqual(['2026-11-19', TODAY]);
    expect(readWindow(NOW - 400 * 86_400_000, NOW, TZ).dates[0]).toBe(addDays(TODAY, -HEALTH_BACKFILL_DAYS + 1));
  });
});

describe('keeping one row per day', () => {
  const stored = makeDays(10, i => ({ steps: 1000 + i }));
  test('days inside the read are replaced, days outside are kept, edges of the read are ignored', () => {
    const fresh = [{ date: '2026-11-19', steps: 9000 }, { date: TODAY, steps: 4000 }, { date: '2026-11-17', steps: 1 }];
    const next = mergeDays(stored, fresh, ['2026-11-18', TODAY]);
    expect(next.find(d => d.date === '2026-11-19')?.steps).toBe(9000);
    expect(next.find(d => d.date === TODAY)?.steps).toBe(4000);
    // A day the read covered with nothing in it is gone; one outside the read is untouched.
    expect(next.find(d => d.date === '2026-11-18')).toBeUndefined();
    expect(next.find(d => d.date === '2026-11-17')?.steps).toBe(1006);
    expect(next.map(d => d.date)).toEqual([...next.map(d => d.date)].sort());
  });
  test('rows older than the keep window are dropped', () => {
    expect(mergeDays(stored, [], ['2026-11-20', TODAY], '2026-11-15').map(d => d.date)[0]).toBe('2026-11-15');
  });
});

describe('skin temperature', () => {
  test('a watch’s absolute wrist temperature becomes a change against your own recent nights', () => {
    const days = makeDays(20, i => ({ skinTemp: i === 19 ? 35.4 : 34.6 + (i % 2) * 0.1 }));
    const out = withSkinTempDeltas(days);
    expect(out[19].skinTempDelta).toBeCloseTo(0.8, 2);
    // Too few nights before it: no change is made up.
    expect(out[3].skinTempDelta).toBeUndefined();
    // A wearable's own change is kept as it is.
    expect(withSkinTempDeltas([...days.slice(0, 19), { ...days[19], skinTempDelta: 0.2 }])[19].skinTempDelta).toBe(0.2);
  });
  test('the summary carries the night’s absolute reading', () => {
    const samples: HealthSample[] = [
      { type: 'sleep', stage: 'asleep', start: at('23:00', '2026-11-19'), end: at('07:00'), value: 1, source: watch, timeZone: TZ },
      { type: 'skinTemperature', start: at('02:00'), end: at('02:00'), value: 34.9, unit: 'degC', source: watch, timeZone: TZ },
    ];
    expect(summariseDays(samples, { timeZone: TZ }).days.find(d => d.date === TODAY)?.skinTemp).toBe(34.9);
  });
});

describe('stress through the day', () => {
  const hr = (hhmm: string, bpm: number, source = watch): HealthSample => ({ type: 'heartRate', start: at(hhmm), end: at(hhmm), value: bpm, source, timeZone: TZ });
  const steps = (hhmm: string, n: number): HealthSample => ({ type: 'steps', start: at(hhmm), end: at(hhmm) + 10 * 60_000, value: n, source: phone, timeZone: TZ });
  const base = [{ type: 'restingHeartRate' as const, start: at('08:00'), end: at('08:00'), value: 55, source: watch, timeZone: TZ }];
  test('a raised heart rate while still reads as stress; the same rate on a walk does not', () => {
    const samples = [...base, hr('09:05', 58), hr('09:20', 59), hr('13:10', 95), hr('13:25', 98), hr('16:05', 100), hr('16:20', 102), steps('16:00', 1200)];
    const day = summariseDays(samples, { timeZone: TZ, age: 35 }).days.find(d => d.date === TODAY)!;
    expect(day.stress).toBeDefined();
    const s = day.stress!;
    expect(s.levels.filter(l => l !== null)).toHaveLength(2);
    expect(s.now).toBeGreaterThanOrEqual(2);
    expect(s.calmShare).toBe(50);
    expect(s.windowMinutes).toBe(30);
    expect(s.start).toBe(lifeDayBounds(TODAY, TZ).start);
  });
  test('with no step count, only a heart rate that could not be a walk counts', () => {
    const samples = [...base, hr('10:05', 70), hr('15:05', 150)];
    const s = summariseDays(samples, { timeZone: TZ, age: 35 }).days.find(d => d.date === TODAY)!.stress!;
    expect(s.levels.filter(l => l !== null)).toHaveLength(1);
  });
  test('no heart rate, no stress', () => {
    expect(summariseDays([steps('10:00', 800)], { timeZone: TZ }).days.find(d => d.date === TODAY)?.stress).toBeUndefined();
  });
});
