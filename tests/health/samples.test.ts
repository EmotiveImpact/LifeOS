import { describe, expect, test } from 'bun:test';
import { normaliseSample, sleepSessions, summariseDays, unionMinutes, type HealthSample, type HealthSource, type SleepStage } from '../../packages/core/src/health/samples';
import { instantAt } from '../../packages/core/src/time/zone';

const LDN = 'Europe/London';
const apple: HealthSource = { id: 'apple', kind: 'device', name: 'Apple Health' };
const oura: HealthSource = { id: 'oura', kind: 'wearable', name: 'Oura' };
const phone: HealthSource = { id: 'iphone', kind: 'device', name: 'iPhone' };
const at = (date: string, hh: number, mm = 0) => instantAt(date, hh * 60 + mm, LDN);
const stage = (source: HealthSource, s: SleepStage, from: number, to: number): HealthSample => ({ type: 'sleep', stage: s, start: from, end: to, value: 0, source, timeZone: LDN });

/** A night from 23:00 on the 19th to 07:00 on the 20th: 10 minutes to fall asleep, a 20 minute wake at 03:00. */
const nightFor = (source: HealthSource, shiftMinutes = 0): HealthSample[] => {
  const m = shiftMinutes * 60_000;
  return [
    stage(source, 'inBed', at('2026-11-19', 23), at('2026-11-20', 7) + m),
    stage(source, 'light', at('2026-11-19', 23, 10), at('2026-11-20', 1)),
    stage(source, 'deep', at('2026-11-20', 1), at('2026-11-20', 3)),
    stage(source, 'awake', at('2026-11-20', 3), at('2026-11-20', 3, 20)),
    stage(source, 'rem', at('2026-11-20', 3, 20), at('2026-11-20', 7) + m),
  ];
};

describe('normalising readings', () => {
  test('energy in kJ becomes kcal, blood oxygen as a fraction becomes a percentage', () => {
    expect(normaliseSample({ type: 'activeEnergy', start: 0, end: 1, value: 418.4, unit: 'kJ', source: apple })?.value).toBeCloseTo(100, 6);
    expect(normaliseSample({ type: 'oxygenSaturation', start: 0, end: 1, value: 0.97, source: apple })?.value).toBe(97);
  });
  test('readings that end before they start, or are impossible, are dropped', () => {
    expect(normaliseSample({ type: 'heartRate', start: 10, end: 5, value: 60, source: apple })).toBeNull();
    expect(normaliseSample({ type: 'heartRate', start: 0, end: 1, value: 400, source: apple })).toBeNull();
  });
  test('overlapping intervals count once', () => expect(unionMinutes([[0, 600_000], [300_000, 900_000], [1_200_000, 1_260_000]])).toBe(16));
});

describe('building nights', () => {
  test('stages join into one night that belongs to the morning you woke', () => {
    const readings = nightFor(apple).map(s => normaliseSample(s)!);
    const [night] = sleepSessions(readings);
    expect(night.date).toBe('2026-11-20');
    expect(night.inBedMinutes).toBe(480);
    expect(night.asleepMinutes).toBe(450);
    expect(night.latencyMinutes).toBe(10);
    expect(night.stages).toEqual({ deep: 120, rem: 220, light: 110, awake: 30 });
  });
  test('a night across the clocks going back is as long as it really was', () => {
    const s = [stage(apple, 'asleep', instantAt('2026-10-24', 23 * 60, LDN), instantAt('2026-10-25', 7 * 60, LDN))];
    expect(sleepSessions(s.map(x => normaliseSample(x)!))[0].asleepMinutes).toBe(540);
  });
});

describe('one row per day', () => {
  test('the device source wins by default; your own choice wins when you make one', () => {
    const samples = [...nightFor(apple), ...nightFor(oura, 30)];
    expect(summariseDays(samples, { timeZone: LDN }).days[0].sleep?.sourceId).toBe('apple');
    expect(summariseDays(samples, { timeZone: LDN, preferred: { sleep: 'oura' } }).days[0].sleep?.asleepMinutes).toBe(480);
  });
  test('two sources disagreeing about a night by more than 10% is reported', () => {
    const { disagreements } = summariseDays([...nightFor(apple), ...nightFor(oura, 60)], { timeZone: LDN });
    expect(disagreements).toEqual([{ type: 'sleep', date: '2026-11-20', chosen: 'apple', others: [{ source: 'oura', value: 510 }] }]);
  });
  test("an HRV reading at 2am belongs to the night's morning, not the evening before", () => {
    const samples: HealthSample[] = [...nightFor(apple), { type: 'hrv', method: 'sdnn', start: at('2026-11-20', 2), end: at('2026-11-20', 2), value: 52, source: apple, timeZone: LDN }];
    const { days } = summariseDays(samples, { timeZone: LDN });
    expect(days.map(d => [d.date, d.hrv ?? null, d.hrvMethod ?? null])).toEqual([['2026-11-20', 52, 'sdnn']]);
  });
  test('steps from the phone and the watch are never added together', () => {
    const steps = (source: HealthSource, value: number): HealthSample => ({ type: 'steps', start: at('2026-11-20', 9), end: at('2026-11-20', 10), value, source, timeZone: LDN });
    const watch: HealthSource = { id: 'watch', kind: 'wearable' };
    const { days } = summariseDays([steps(phone, 4000), steps(phone, 4240), steps(watch, 9000)], { timeZone: LDN });
    expect(days[0].steps).toBe(8240);
  });
  test('a short afternoon sleep is a nap on that day', () => {
    const nap = stage(apple, 'asleep', at('2026-11-20', 14), at('2026-11-20', 14, 25));
    const { days } = summariseDays([...nightFor(apple), nap], { timeZone: LDN });
    expect(days[0].napMinutes).toBe(25);
    expect(days[0].sleep?.asleepMinutes).toBe(450);
  });
  test("a run in the day's heart rate becomes the day's load", () => {
    const hr: HealthSample[] = Array.from({ length: 361 }, (_, i) => ({ type: 'heartRate', start: at('2026-11-20', 18) + i * 5000, end: at('2026-11-20', 18) + i * 5000, value: 150, source: apple, timeZone: LDN }));
    const { days } = summariseDays([...hr, { type: 'restingHeartRate', start: at('2026-11-20', 0), end: at('2026-11-20', 20), value: 55, source: apple, timeZone: LDN }], { timeZone: LDN, age: 27, sex: 'female' });
    expect(days[0].restingHr).toBe(55);
    expect(days[0].trimp).toBeGreaterThan(30);
  });
  test("a wearable's own recovery score is kept with its name", () => {
    const { days } = summariseDays([{ type: 'recoveryScore', start: at('2026-11-20', 7), end: at('2026-11-20', 7), value: 81, source: { id: 'whoop', kind: 'wearable', name: 'WHOOP' }, timeZone: LDN }], { timeZone: LDN });
    expect(days[0].externalRecovery).toEqual({ value: 81, source: 'WHOOP' });
  });
});
