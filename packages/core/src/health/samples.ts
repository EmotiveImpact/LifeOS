/**
 * From raw readings to one row per day (SPEC §2.1): normalise every sample into `HealthSample`, build nights from
 * sleep stages, pick one source per metric per day, and summarise the day.
 *
 * Source choice per metric and day: the source you picked in Settings if it has data that day, otherwise the first
 * by kind (device-native, then wearable API, then aggregator, then manual), then the one with the most readings.
 * Steps and energy are only ever summed within one source, so a phone and a watch never count the same walk twice.
 * When two sources disagree about a night by more than 10% (and 20 minutes), the summary says so.
 *
 * Overnight readings (HRV, breathing, blood oxygen, skin temperature) belong to the night they were taken in, so to
 * the morning you woke up; everything else belongs to its life day (time/zone.ts).
 */
import { isNum, mean, round, sum } from '../math/stats';
import { lifeDay, localDate, localParts, offsetMinutes, resolveTimeZone, sleepDay, type DateKey } from '../time/zone';
import { estimateMaxHr, trimpFromHeartRate, type BodySex } from './load';
import type { DailyHealth, HrvMethod, NightSleep, SleepStageMinutes } from './types';

export type SourceKind = 'device' | 'wearable' | 'aggregator' | 'manual';
export const SOURCE_PRIORITY: Record<SourceKind, number> = { device: 0, wearable: 1, aggregator: 2, manual: 3 };

export interface HealthSource { id: string; kind: SourceKind; name?: string }

export type SampleType =
  | 'sleep' | 'hrv' | 'restingHeartRate' | 'heartRate' | 'respiratoryRate' | 'skinTemperatureDelta'
  | 'oxygenSaturation' | 'steps' | 'activeEnergy' | 'recoveryScore';
export type SleepStage = 'inBed' | 'awake' | 'asleep' | 'light' | 'deep' | 'rem';

export interface HealthSample {
  type: SampleType;
  start: string | number;
  end: string | number;
  value: number;
  unit?: string;
  source: HealthSource;
  stage?: SleepStage;
  method?: HrvMethod;
  /** IANA zone the phone was in when the reading was taken. */
  timeZone?: string;
  confidence?: number;
}

export interface Reading extends HealthSample { startMs: number; endMs: number; tz: string }

const PLAUSIBLE: Partial<Record<SampleType, [number, number]>> = {
  heartRate: [25, 250], restingHeartRate: [25, 150], hrv: [5, 300], respiratoryRate: [4, 40],
  oxygenSaturation: [70, 100], skinTemperatureDelta: [-5, 5], steps: [0, 100_000], activeEnergy: [0, 10_000], recoveryScore: [0, 100],
};

const toMs = (v: string | number) => (typeof v === 'number' ? v : Date.parse(v));

/** Canonical units (kcal, %, °C, ms, bpm) and sanity limits. Returns null for a reading that can't be trusted. */
export function normaliseSample(sample: HealthSample, fallbackZone = 'UTC'): Reading | null {
  const startMs = toMs(sample.start), endMs = toMs(sample.end);
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs < startMs || !isNum(sample.value)) return null;
  let value = sample.value;
  const unit = (sample.unit ?? '').toLowerCase();
  if (sample.type === 'activeEnergy' && unit === 'kj') value /= 4.184;
  if (sample.type === 'oxygenSaturation' && value <= 1) value *= 100;
  if (sample.type === 'skinTemperatureDelta' && (unit === 'degf' || unit === '°f')) value = value * 5 / 9;
  if (sample.type === 'heartRate' && unit === 'count/s') value *= 60;
  const limits = PLAUSIBLE[sample.type];
  if (limits && (value < limits[0] || value > limits[1])) return null;
  return { ...sample, value, startMs, endMs, tz: resolveTimeZone(sample.timeZone ?? fallbackZone) };
}

/* ───────────────────────── Nights ───────────────────────── */

export interface SleepSession {
  source: HealthSource;
  start: number;
  end: number;
  asleepMinutes: number;
  inBedMinutes: number;
  awakeMinutes: number;
  latencyMinutes?: number;
  stages?: SleepStageMinutes;
  timeZone: string;
  /** The morning it belongs to. */
  date: DateKey;
}

const ASLEEP: ReadonlySet<SleepStage> = new Set(['asleep', 'light', 'deep', 'rem']);

/** Total minutes covered by a set of intervals, counting overlaps once. */
export function unionMinutes(intervals: readonly [number, number][]): number {
  const s = [...intervals].filter(([a, b]) => b > a).sort((x, y) => x[0] - y[0]);
  let total = 0, curStart = -Infinity, curEnd = -Infinity;
  for (const [a, b] of s) {
    if (a > curEnd) { if (curEnd > curStart) total += curEnd - curStart; curStart = a; curEnd = b; }
    else curEnd = Math.max(curEnd, b);
  }
  if (curEnd > curStart) total += curEnd - curStart;
  return total / 60_000;
}

/** Sleep stages from one source joined into sessions; gaps up to an hour stay inside one night. */
export function sleepSessions(readings: readonly Reading[], gapMinutes = 60): SleepSession[] {
  const bySource = new Map<string, Reading[]>();
  for (const r of readings) if (r.type === 'sleep') bySource.set(r.source.id, [...(bySource.get(r.source.id) ?? []), r]);
  const out: SleepSession[] = [];
  for (const list of bySource.values()) {
    const sorted = list.sort((a, b) => a.startMs - b.startMs);
    let cluster: Reading[] = [];
    const flush = () => {
      if (!cluster.length) return;
      const start = Math.min(...cluster.map(r => r.startMs)), end = Math.max(...cluster.map(r => r.endMs));
      const asleepParts = cluster.filter(r => ASLEEP.has(r.stage ?? 'asleep'));
      const asleep = unionMinutes(asleepParts.map(r => [r.startMs, r.endMs]));
      if (asleep >= 15) {
        const inBed = (end - start) / 60_000;
        const firstAsleep = Math.min(...asleepParts.map(r => r.startMs));
        const staged = cluster.some(r => r.stage === 'deep' || r.stage === 'rem' || r.stage === 'light');
        const stage = (s: SleepStage) => unionMinutes(cluster.filter(r => r.stage === s).map(r => [r.startMs, r.endMs]));
        const tz = cluster[cluster.length - 1].tz;
        out.push({
          source: cluster[0].source, start, end, timeZone: tz, date: sleepDay(end, tz),
          asleepMinutes: round(asleep, 1), inBedMinutes: round(inBed, 1), awakeMinutes: round(Math.max(0, inBed - asleep), 1),
          latencyMinutes: firstAsleep > start ? round((firstAsleep - start) / 60_000, 1) : undefined,
          stages: staged ? { deep: round(stage('deep'), 1), rem: round(stage('rem'), 1), light: round(stage('light'), 1), awake: round(Math.max(0, inBed - asleep), 1) } : undefined,
        });
      }
      cluster = [];
    };
    let clusterEnd = -Infinity;
    for (const r of sorted) {
      if (cluster.length && r.startMs - clusterEnd > gapMinutes * 60_000) { flush(); clusterEnd = -Infinity; }
      cluster.push(r);
      clusterEnd = Math.max(clusterEnd, r.endMs);
    }
    flush();
  }
  return out;
}

/** A main night is at least 3 hours asleep; anything shorter is a nap. */
export const MAIN_SLEEP_MINUTES = 180;

/* ───────────────────────── Choosing a source ───────────────────────── */

export type Preferred = Partial<Record<SampleType, string>>;

function rankSources<T extends { source: HealthSource }>(items: readonly T[], type: SampleType, preferred: Preferred, weight: (xs: T[]) => number): string | null {
  const groups = new Map<string, T[]>();
  for (const it of items) groups.set(it.source.id, [...(groups.get(it.source.id) ?? []), it]);
  if (!groups.size) return null;
  const wanted = preferred[type];
  if (wanted && groups.has(wanted)) return wanted;
  return [...groups.entries()].sort((a, b) =>
    SOURCE_PRIORITY[a[1][0].source.kind] - SOURCE_PRIORITY[b[1][0].source.kind] || weight(b[1]) - weight(a[1]) || a[0].localeCompare(b[0]))[0][0];
}

export interface Disagreement { type: SampleType; date: DateKey; chosen: string; others: { source: string; value: number }[] }

/* ───────────────────────── The day ───────────────────────── */

export interface SummariseOptions {
  /** The phone's zone, for readings that didn't record one. */
  timeZone: string;
  preferred?: Preferred;
  age?: number;
  sex?: BodySex;
  /** Measured maximum heart rate, if known. */
  maxHr?: number;
  /** Fallback resting heart rate for load when the day has none. */
  restingHr?: number;
}

const OVERNIGHT: ReadonlySet<SampleType> = new Set(['hrv', 'respiratoryRate', 'oxygenSaturation', 'skinTemperatureDelta']);

export function summariseDays(samples: readonly HealthSample[], options: SummariseOptions): { days: DailyHealth[]; disagreements: Disagreement[] } {
  const preferred = options.preferred ?? {};
  const readings = samples.map(s => normaliseSample(s, options.timeZone)).filter((r): r is Reading => r !== null);
  const sessions = sleepSessions(readings);
  const days = new Map<DateKey, DailyHealth>();
  const day = (date: DateKey, tz: string, at: number) => {
    let d = days.get(date);
    if (!d) { d = { date, timeZone: tz, utcOffset: offsetMinutes(at, tz) }; days.set(date, d); }
    return d;
  };
  const disagreements: Disagreement[] = [];

  // Nights: per morning, each source's longest session; then one source.
  const mainByDate = new Map<DateKey, SleepSession>();
  const sessionsByDate = new Map<DateKey, SleepSession[]>();
  for (const s of sessions) sessionsByDate.set(s.date, [...(sessionsByDate.get(s.date) ?? []), s]);
  for (const [date, list] of sessionsByDate) {
    const mains = new Map<string, SleepSession>();
    for (const s of list) if (s.asleepMinutes >= MAIN_SLEEP_MINUTES && (!mains.has(s.source.id) || s.asleepMinutes > mains.get(s.source.id)!.asleepMinutes)) mains.set(s.source.id, s);
    const chosenId = rankSources([...mains.values()], 'sleep', preferred, xs => xs[0].asleepMinutes);
    const main = chosenId ? mains.get(chosenId) : undefined;
    const mainList = [...mains.values()];
    const naps = list.filter(s => !mainList.includes(s) && (!main || s.end <= main.start || s.start >= main.end));
    const napMinutes = unionMinutes(naps.map(s => [s.start, s.end] as [number, number]));
    if (main) {
      const d = day(date, main.timeZone, main.end);
      const night: NightSleep = {
        start: main.start, end: main.end, asleepMinutes: main.asleepMinutes, inBedMinutes: main.inBedMinutes, awakeMinutes: main.awakeMinutes,
        latencyMinutes: main.latencyMinutes, bedtime: Math.round(localParts(main.start, main.timeZone).minutes), wake: Math.round(localParts(main.end, main.timeZone).minutes),
        efficiency: main.inBedMinutes > 0 ? round(main.asleepMinutes / main.inBedMinutes, 3) : 0, stages: main.stages, sourceId: main.source.id,
      };
      d.sleep = night;
      mainByDate.set(date, main);
      const others = mainList.filter(s => s !== main && Math.abs(s.asleepMinutes - main.asleepMinutes) > Math.max(20, main.asleepMinutes * 0.1));
      if (others.length) disagreements.push({ type: 'sleep', date, chosen: main.source.id, others: others.map(s => ({ source: s.source.id, value: Math.round(s.asleepMinutes) })) });
    }
    if (napMinutes > 0) day(date, list[0].timeZone, list[0].end).napMinutes = round(napMinutes, 1);
  }
  const allNights = [...mainByDate.values()];
  const nightOf = (at: number) => allNights.find(s => at >= s.start && at <= s.end);

  // Everything else: group by type and day.
  const groups = new Map<string, Reading[]>();
  for (const r of readings) {
    if (r.type === 'sleep') continue;
    const night = OVERNIGHT.has(r.type) ? nightOf(r.startMs) : undefined;
    const date = night ? night.date : r.type === 'restingHeartRate' ? localDate(r.endMs, r.tz) : lifeDay(r.startMs, r.tz);
    const key = `${r.type}|${date}`;
    groups.set(key, [...(groups.get(key) ?? []), r]);
  }
  const heart: { date: DateKey; readings: Reading[] }[] = [];
  for (const [key, list] of groups) {
    const [type, date] = key.split('|') as [SampleType, DateKey];
    const chosen = rankSources(list, type, preferred, xs => xs.length);
    const use = list.filter(r => r.source.id === chosen);
    const d = day(date, use[0].tz, use[0].startMs);
    const night = mainByDate.get(date);
    const inNight = night ? use.filter(r => r.startMs >= night.start && r.startMs <= night.end) : [];
    const overnight = inNight.length ? inNight : use;
    const avg = (xs: Reading[]) => mean(xs.map(r => r.value)) as number;
    switch (type) {
      case 'hrv': {
        d.hrv = round(avg(overnight), 1);
        const rmssd = overnight.filter(r => r.method === 'rmssd').length;
        d.hrvMethod = rmssd * 2 > overnight.length ? 'rmssd' : 'sdnn';
        break;
      }
      case 'restingHeartRate': d.restingHr = round(avg(use), 1); break;
      case 'respiratoryRate': d.respiratoryRate = round(avg(overnight), 1); break;
      case 'oxygenSaturation': d.spo2 = round(avg(overnight), 1); break;
      case 'skinTemperatureDelta': d.skinTempDelta = round(avg(overnight), 2); break;
      case 'steps': d.steps = Math.round(sum(use.map(r => r.value))); break;
      case 'activeEnergy': d.activeKcal = Math.round(sum(use.map(r => r.value))); break;
      case 'recoveryScore': {
        const last = use.reduce((a, b) => (b.endMs > a.endMs ? b : a));
        d.externalRecovery = { value: Math.round(last.value), source: last.source.name ?? last.source.id };
        break;
      }
      case 'heartRate': heart.push({ date, readings: use }); break;
    }
  }

  // Load needs the day's resting heart rate, so it comes last.
  const maxHr = options.maxHr ?? estimateMaxHr(options.age ?? 35);
  for (const { date, readings: hr } of heart) {
    const d = days.get(date)!;
    const resting = d.restingHr ?? options.restingHr ?? 60;
    d.trimp = trimpFromHeartRate(hr.map(r => ({ at: r.startMs, bpm: r.value })), { restingHr: resting, maxHr, sex: options.sex, mode: 'day' }).trimp;
  }

  return { days: [...days.values()].sort((a, b) => a.date.localeCompare(b.date)), disagreements };
}
