/**
 * Apple Health and Health Connect readings as the engine's `HealthSample` (BUILD_V26 Phase 26). Pure functions over
 * the shapes the two libraries return, so they are tested without a phone. The readers that call the libraries live
 * in `healthkit.ios.ts` and `healthconnect.android.ts`.
 */
import type { HealthSample, HealthSource, SampleType, SleepStage, SourceKind } from '@life/core';
import type { HealthType } from './consent';

/** The reading types each consent switch covers (First open, "What life can read"). Food waits for Phase 27. */
export const SAMPLE_TYPES: Record<HealthType, SampleType[]> = {
  sleep: ['sleep'],
  heart: ['hrv', 'restingHeartRate', 'heartRate', 'respiratoryRate', 'oxygenSaturation', 'skinTemperature', 'skinTemperatureDelta'],
  workouts: ['steps', 'activeEnergy'],
  food: [],
};

export const typesAllowed = (types: Partial<Record<HealthType, boolean>>): Set<SampleType> =>
  new Set((Object.keys(SAMPLE_TYPES) as HealthType[]).filter(k => types[k]).flatMap(k => SAMPLE_TYPES[k]));

const READ_KEYS: HealthType[] = ['sleep', 'heart', 'workouts', 'food'];

/** The kinds of reading allowed: on in the consent and on in Devices' "What life can read". */
export function allowedTypes(types: Partial<Record<HealthType, boolean>>, choices: Record<string, string>): Set<SampleType> {
  const on = Object.fromEntries(READ_KEYS.map(k => [k, !!types[k] && (choices[`health-read-${k}`] ?? 'on') === 'on'])) as Record<HealthType, boolean>;
  return typesAllowed(on);
}

/* ───────────────────────── Who measured it ───────────────────────── */

/** Apps that write a wearable's readings into the phone's health store. Prefix match on the bundle or package name. */
const WEARABLE_APPS = ['com.ouraring', 'com.whoop', 'com.garmin', 'com.fitbit', 'com.polar', 'fi.polar', 'com.withings', 'com.suunto', 'com.coros', 'com.huami', 'com.samsung.android.wear', 'com.xiaomi.wearable', 'com.ultrahuman'];
/** The phone makers' own stores: the phone and watch measured it themselves. */
const DEVICE_APPS = ['com.apple.', 'android', 'com.google.android.apps.fitness', 'com.google.android.apps.healthdata', 'com.sec.android.app.shealth', 'com.samsung.health'];
const NAMES: [string, string][] = [['com.ouraring', 'Oura'], ['com.whoop', 'WHOOP'], ['com.garmin', 'Garmin'], ['com.fitbit', 'Fitbit'], ['com.polar', 'Polar'], ['fi.polar', 'Polar'], ['com.withings', 'Withings'], ['com.google.android.apps.fitness', 'Google Fit'], ['com.sec.android.app.shealth', 'Samsung Health'], ['com.samsung.health', 'Samsung Health']];

export function sourceKind(id: string, manual = false): SourceKind {
  if (manual) return 'manual';
  const lower = id.toLowerCase();
  if (WEARABLE_APPS.some(p => lower.startsWith(p))) return 'wearable';
  if (DEVICE_APPS.some(p => lower === p || lower.startsWith(p))) return 'device';
  return 'aggregator';
}

export function sourceOf(id: string, name: string | undefined, manual = false): HealthSource {
  const known = NAMES.find(([p]) => id.toLowerCase().startsWith(p))?.[1];
  return { id: manual ? `${id}:manual` : id, kind: sourceKind(id, manual), name: name || known || id };
}

const iso = (v: Date | string | number) => (v instanceof Date ? v.toISOString() : typeof v === 'number' ? new Date(v).toISOString() : v);

/* ───────────────────────── Apple Health ───────────────────────── */

export const HEALTHKIT_QUANTITIES: { type: SampleType; id: string; unit: string }[] = [
  { type: 'hrv', id: 'HKQuantityTypeIdentifierHeartRateVariabilitySDNN', unit: 'ms' },
  { type: 'restingHeartRate', id: 'HKQuantityTypeIdentifierRestingHeartRate', unit: 'count/min' },
  { type: 'heartRate', id: 'HKQuantityTypeIdentifierHeartRate', unit: 'count/min' },
  { type: 'respiratoryRate', id: 'HKQuantityTypeIdentifierRespiratoryRate', unit: 'count/min' },
  { type: 'oxygenSaturation', id: 'HKQuantityTypeIdentifierOxygenSaturation', unit: '%' },
  { type: 'skinTemperature', id: 'HKQuantityTypeIdentifierAppleSleepingWristTemperature', unit: 'degC' },
  { type: 'steps', id: 'HKQuantityTypeIdentifierStepCount', unit: 'count' },
  { type: 'activeEnergy', id: 'HKQuantityTypeIdentifierActiveEnergyBurned', unit: 'kcal' },
];
export const HEALTHKIT_SLEEP = 'HKCategoryTypeIdentifierSleepAnalysis';
/** HealthKit's sleep values: in bed, asleep (unspecified), awake, core, deep, REM. Core sleep is light sleep. */
const KIT_STAGES: Record<number, SleepStage> = { 0: 'inBed', 1: 'asleep', 2: 'awake', 3: 'light', 4: 'deep', 5: 'rem' };

/** The fields life reads from a HealthKit sample (`@kingstinct/react-native-healthkit`). */
export interface KitSample {
  uuid?: string;
  startDate: Date | string;
  endDate: Date | string;
  sourceRevision?: { source?: { name?: string; bundleIdentifier?: string } };
  metadata?: Record<string, unknown> | null;
}
export interface KitQuantity extends KitSample { quantity: number; unit?: string }
export interface KitCategory extends KitSample { value: number }

function kitSource(s: KitSample): HealthSource {
  const id = s.sourceRevision?.source?.bundleIdentifier || 'com.apple.health';
  return sourceOf(id, s.sourceRevision?.source?.name, s.metadata?.HKWasUserEntered === true);
}
const kitZone = (s: KitSample) => (typeof s.metadata?.HKTimeZone === 'string' ? s.metadata.HKTimeZone : undefined);

export function fromKitQuantity(type: SampleType, unit: string, s: KitQuantity): HealthSample {
  return { type, start: iso(s.startDate), end: iso(s.endDate), value: s.quantity, unit: s.unit ?? unit, source: kitSource(s), timeZone: kitZone(s), ...(type === 'hrv' ? { method: 'sdnn' as const } : {}) };
}

export function fromKitSleep(s: KitCategory): HealthSample | null {
  const stage = KIT_STAGES[s.value];
  if (!stage) return null;
  return { type: 'sleep', stage, start: iso(s.startDate), end: iso(s.endDate), value: 1, source: kitSource(s), timeZone: kitZone(s) };
}

/* ───────────────────────── Health Connect ───────────────────────── */

export const HEALTH_CONNECT_RECORDS = {
  sleep: ['SleepSession'],
  hrv: ['HeartRateVariabilityRmssd'], restingHeartRate: ['RestingHeartRate'], heartRate: ['HeartRate'], respiratoryRate: ['RespiratoryRate'],
  oxygenSaturation: ['OxygenSaturation'], skinTemperatureDelta: ['SkinTemperature'], steps: ['Steps'], activeEnergy: ['ActiveCaloriesBurned'],
} as const satisfies Partial<Record<SampleType, readonly string[]>>;
export type ConnectRecordType = (typeof HEALTH_CONNECT_RECORDS)[keyof typeof HEALTH_CONNECT_RECORDS][number];

/** Health Connect's sleep stages: unknown, awake, sleeping, out of bed, light, deep, REM, awake in bed. */
const CONNECT_STAGES: Record<number, SleepStage | null> = { 0: 'asleep', 1: 'awake', 2: 'asleep', 3: null, 4: 'light', 5: 'deep', 6: 'rem', 7: 'awake' };
/** Health Connect's "entered by hand" recording method. */
const MANUAL_ENTRY = 3;

/** The fields life reads from a Health Connect record (`react-native-health-connect`). */
export interface ConnectRecord {
  time?: string;
  startTime?: string;
  endTime?: string;
  metadata?: { dataOrigin?: string; recordingMethod?: number } | null;
  stages?: { startTime: string; endTime: string; stage: number }[];
  samples?: { time: string; beatsPerMinute: number }[];
  beatsPerMinute?: number;
  heartRateVariabilityMillis?: number;
  rate?: number;
  percentage?: number;
  deltas?: { time: string; delta: { inCelsius: number } }[];
  count?: number;
  energy?: { inKilocalories: number };
}

function connectSource(r: ConnectRecord): HealthSource {
  return sourceOf(r.metadata?.dataOrigin || 'android', undefined, r.metadata?.recordingMethod === MANUAL_ENTRY);
}

export function fromConnectRecord(recordType: ConnectRecordType, r: ConnectRecord): HealthSample[] {
  const source = connectSource(r);
  const at = (time: string | undefined, type: SampleType, value: number | undefined, extra: Partial<HealthSample> = {}): HealthSample[] =>
    time && typeof value === 'number' ? [{ type, start: time, end: time, value, source, ...extra }] : [];
  const span = (type: SampleType, value: number | undefined, unit?: string): HealthSample[] =>
    r.startTime && r.endTime && typeof value === 'number' ? [{ type, start: r.startTime, end: r.endTime, value, unit, source }] : [];
  switch (recordType) {
    case 'SleepSession': {
      if (!r.startTime || !r.endTime) return [];
      if (!r.stages?.length) return [{ type: 'sleep', stage: 'asleep', start: r.startTime, end: r.endTime, value: 1, source }];
      return r.stages.flatMap(s => { const stage = CONNECT_STAGES[s.stage]; return stage ? [{ type: 'sleep' as const, stage, start: s.startTime, end: s.endTime, value: 1, source }] : []; });
    }
    case 'HeartRate': return (r.samples ?? []).flatMap(s => at(s.time, 'heartRate', s.beatsPerMinute));
    case 'RestingHeartRate': return at(r.time, 'restingHeartRate', r.beatsPerMinute);
    case 'HeartRateVariabilityRmssd': return at(r.time, 'hrv', r.heartRateVariabilityMillis, { method: 'rmssd' });
    case 'RespiratoryRate': return at(r.time, 'respiratoryRate', r.rate);
    case 'OxygenSaturation': return at(r.time, 'oxygenSaturation', r.percentage);
    case 'SkinTemperature': return (r.deltas ?? []).flatMap(d => at(d.time, 'skinTemperatureDelta', d.delta?.inCelsius));
    case 'Steps': return span('steps', r.count);
    case 'ActiveCaloriesBurned': return span('activeEnergy', r.energy?.inKilocalories, 'kcal');
  }
}

/** The Health Connect record types for the reading types allowed. */
export function connectRecordsFor(allowed: Set<SampleType>): ConnectRecordType[] {
  return [...new Set((Object.entries(HEALTH_CONNECT_RECORDS) as [SampleType, readonly ConnectRecordType[]][]).filter(([type]) => allowed.has(type)).flatMap(([, records]) => records))];
}
