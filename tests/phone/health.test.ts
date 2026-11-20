import { describe, expect, test } from 'bun:test';
import type { HealthSample } from '../../packages/core/src/health/samples';
import { emptyHealth, ingestHealth } from '../../apps/mobile/src/services/health/ingest';
import { allowedTypes, connectRecordsFor, fromConnectRecord, fromKitQuantity, fromKitSleep, sourceKind, typesAllowed } from '../../apps/mobile/src/services/health/mapping';
import type { SampleReader } from '../../apps/mobile/src/services/health/reader';
import { hasRealHealth } from '../../apps/mobile/src/services/health/consent';

/** BUILD_V26 Phase 26: Apple Health and Health Connect readings, brought in since the last anchor, kept on the phone. */
const TZ = 'Europe/London';
const NOW = Date.parse('2026-11-20T12:00:00Z');
const watch = { name: 'Ama’s Apple Watch', bundleIdentifier: 'com.apple.health.5A1B' };

describe('reading the phone’s health store', () => {
  test('who measured it decides which source wins', () => {
    expect(sourceKind('com.apple.health.5A1B')).toBe('device');
    expect(sourceKind('com.ouraring.oura')).toBe('wearable');
    expect(sourceKind('com.google.android.apps.fitness')).toBe('device');
    expect(sourceKind('com.sleepapp.tracker')).toBe('aggregator');
    expect(sourceKind('com.apple.health.5A1B', true)).toBe('manual');
  });
  test('Apple Health: core sleep is light sleep, HRV is SDNN, and the zone travels with the reading', () => {
    expect(fromKitSleep({ value: 3, startDate: new Date('2026-11-20T01:00:00Z'), endDate: new Date('2026-11-20T02:00:00Z'), sourceRevision: { source: watch }, metadata: { HKTimeZone: 'Europe/Paris' } }))
      .toMatchObject({ type: 'sleep', stage: 'light', timeZone: 'Europe/Paris', source: { id: 'com.apple.health.5A1B', kind: 'device', name: 'Ama’s Apple Watch' } });
    expect(fromKitSleep({ value: 99, startDate: '2026-11-20T01:00:00Z', endDate: '2026-11-20T02:00:00Z' })).toBeNull();
    expect(fromKitQuantity('hrv', 'ms', { quantity: 48, startDate: '2026-11-20T03:00:00Z', endDate: '2026-11-20T03:01:00Z', sourceRevision: { source: watch } })).toMatchObject({ value: 48, unit: 'ms', method: 'sdnn' });
    expect(fromKitQuantity('steps', 'count', { quantity: 300, startDate: '2026-11-20T09:00:00Z', endDate: '2026-11-20T09:10:00Z', sourceRevision: { source: watch }, metadata: { HKWasUserEntered: true } }).source.kind).toBe('manual');
  });
  test('Health Connect: stages, heart-rate series, RMSSD and temperature changes', () => {
    const origin = { dataOrigin: 'com.ouraring.oura' };
    const night = fromConnectRecord('SleepSession', { startTime: '2026-11-19T23:00:00Z', endTime: '2026-11-20T07:00:00Z', metadata: origin, stages: [{ startTime: '2026-11-19T23:00:00Z', endTime: '2026-11-19T23:10:00Z', stage: 1 }, { startTime: '2026-11-19T23:10:00Z', endTime: '2026-11-20T01:00:00Z', stage: 4 }, { startTime: '2026-11-20T01:00:00Z', endTime: '2026-11-20T01:05:00Z', stage: 3 }] });
    expect(night.map(s => s.stage)).toEqual(['awake', 'light']);
    expect(night[0].source).toMatchObject({ kind: 'wearable', name: 'Oura' });
    expect(fromConnectRecord('SleepSession', { startTime: '2026-11-19T23:00:00Z', endTime: '2026-11-20T07:00:00Z' })[0].stage).toBe('asleep');
    expect(fromConnectRecord('HeartRate', { startTime: 'a', endTime: 'b', samples: [{ time: '2026-11-20T09:00:00Z', beatsPerMinute: 70 }, { time: '2026-11-20T09:01:00Z', beatsPerMinute: 72 }] })).toHaveLength(2);
    expect(fromConnectRecord('HeartRateVariabilityRmssd', { time: '2026-11-20T03:00:00Z', heartRateVariabilityMillis: 40 })[0]).toMatchObject({ type: 'hrv', method: 'rmssd' });
    expect(fromConnectRecord('SkinTemperature', { startTime: 'a', endTime: 'b', deltas: [{ time: '2026-11-20T03:00:00Z', delta: { inCelsius: 0.3 } }] })[0]).toMatchObject({ type: 'skinTemperatureDelta', value: 0.3 });
    expect(fromConnectRecord('Steps', { startTime: '2026-11-20T09:00:00Z', endTime: '2026-11-20T09:10:00Z', count: 500, metadata: { recordingMethod: 3 } })[0].source.kind).toBe('manual');
  });
  test('only the kinds switched on are asked for', () => {
    expect(connectRecordsFor(typesAllowed({ sleep: true }))).toEqual(['SleepSession']);
    // Off in the consent, or off in Devices: either keeps it off.
    expect([...allowedTypes({ sleep: true, heart: true }, { 'health-read-heart': 'off' })]).toEqual(['sleep']);
    expect(allowedTypes({ sleep: false, heart: false, workouts: false, food: true }, {}).size).toBe(0);
  });
});

describe('bringing readings in', () => {
  const source = { id: 'com.apple.health.5A1B', kind: 'device' as const, name: 'Apple Watch' };
  const night = (date: string): HealthSample[] => [{ type: 'sleep', stage: 'asleep', start: `${date}T23:00:00Z`, end: `${new Date(Date.parse(`${date}T23:00:00Z`) + 8 * 3_600_000).toISOString()}`, value: 1, source, timeZone: TZ }];
  const reader = (samples: HealthSample[], seen: [number, number][] = []): SampleReader => ({ id: 'apple-health', name: 'Apple Health', read: async (from, to) => { seen.push([from, to]); return samples; } });
  const allowed = typesAllowed({ sleep: true, heart: true, workouts: true });

  test('the first read backfills, later reads start the day before the last one, and each day is kept once', async () => {
    const seen: [number, number][] = [];
    const first = await ingestHealth(emptyHealth(), { readers: [reader([...night('2026-11-16'), ...night('2026-11-18'), ...night('2026-11-19')], seen)], allowed, now: NOW, timeZone: TZ });
    expect(first.state.days.map(d => d.date)).toEqual(['2026-11-17', '2026-11-19', '2026-11-20']);
    expect(first.state.anchor).toBe(NOW);
    expect(first.state.sources).toMatchObject([{ id: source.id, types: ['sleep'] }]);
    // Sixty life days back, counting today, plus the margin for the first night.
    expect(NOW - seen[0][0]).toBeGreaterThan(59 * 86_400_000);
    // An hour later the store hands back what is in the shorter window: the 18th's and 19th's nights.
    const second = await ingestHealth(first.state, { readers: [reader([...night('2026-11-18'), ...night('2026-11-19')], seen)], allowed, now: NOW + 3_600_000, timeZone: TZ });
    expect(seen[1][0]).toBeGreaterThan(seen[0][0]);
    // The 17th sits before the window and stays as stored; the 19th and 20th are replaced, not added twice.
    expect(second.state.days.map(d => d.date)).toEqual(['2026-11-17', '2026-11-19', '2026-11-20']);
    expect(second.state.days.find(d => d.date === '2026-11-20')?.sleep?.asleepMinutes).toBe(480);
  });
  test('when one source fails nothing stored is lost and the anchor stays, so the next read covers it again', async () => {
    const first = await ingestHealth(emptyHealth(), { readers: [reader(night('2026-11-19'))], allowed, now: NOW, timeZone: TZ });
    const down: SampleReader = { id: 'whoop', name: 'WHOOP and Oura', read: async () => { throw new Error('offline'); } };
    const result = await ingestHealth(first.state, { readers: [reader([]), down], allowed, now: NOW + 3_600_000, timeZone: TZ });
    expect(result.failed).toEqual(['WHOOP and Oura']);
    expect(result.state.days).toEqual(first.state.days);
    expect(result.state.anchor).toBe(NOW);
  });
  test('a kind switched off is dropped even if a source sends it', async () => {
    const steps: HealthSample = { type: 'steps', start: '2026-11-20T09:00:00Z', end: '2026-11-20T09:10:00Z', value: 900, source, timeZone: TZ };
    const result = await ingestHealth(emptyHealth(), { readers: [reader([...night('2026-11-19'), steps])], allowed: typesAllowed({ sleep: true }), now: NOW, timeZone: TZ });
    expect(result.state.days.find(d => d.date === '2026-11-20')?.steps).toBeUndefined();
  });
  test('real numbers need a recorded yes as well as readings', () => {
    const days = [{ date: '2026-11-20', steps: 10 }];
    expect(hasRealHealth({ choices: {}, health: { ...emptyHealth(), days } })).toBe(false);
    expect(hasRealHealth({ choices: { 'health-consent': JSON.stringify({ version: 1, at: '', scope: [], types: {}, from: 'body' }) }, health: { ...emptyHealth(), days } })).toBe(true);
  });
});
