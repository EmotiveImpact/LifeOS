/**
 * Bringing readings in (BUILD_V26 Phase 26): read every connected source since the last anchor, summarise each day
 * with one source per metric (packages/core `summariseDays`), and keep one row per day. The rows stay on this phone,
 * in its encrypted local state, like the rest of health data (owner decision, 20 Nov).
 *
 * A read either lands whole or not at all: when one source fails (no connection, WHOOP down), the stored days are
 * kept as they were and the anchor doesn't move, so the next read covers the same days again.
 */
import { keepFrom, lifeDay, mergeDays, readWindow, summariseDays, type BodySex, type DailyHealth, type Disagreement, type HealthSample, type Preferred, type SampleType, type SourceKind } from '@life/core';
import type { SampleReader } from './reader';

export interface HealthSourceSeen { id: string; name: string; kind: SourceKind; types: SampleType[]; last: string }

export interface HealthState {
  days: DailyHealth[];
  /** When the last whole read finished (UTC milliseconds). */
  anchor: number | null;
  lastRead: string | null;
  disagreements: Disagreement[];
  sources: HealthSourceSeen[];
  /** Readers that failed on the last try, by name. */
  failed: string[];
}

export const emptyHealth = (): HealthState => ({ days: [], anchor: null, lastRead: null, disagreements: [], sources: [], failed: [] });

/** Half-hour stress levels are kept for two weeks; older days keep their summary only. */
export const STRESS_DETAIL_DAYS = 14;

export interface IngestOptions {
  readers: SampleReader[];
  allowed: Set<SampleType>;
  now: number;
  timeZone: string;
  age?: number;
  sex?: BodySex;
  preferred?: Preferred;
}

export interface IngestResult { state: HealthState; read: number; failed: string[] }

function sourcesSeen(samples: readonly HealthSample[], prior: readonly HealthSourceSeen[], at: string): HealthSourceSeen[] {
  const byId = new Map(prior.map(s => [s.id, s]));
  for (const s of samples) {
    const seen = byId.get(s.source.id);
    const types = new Set(seen?.types ?? []);
    types.add(s.type);
    byId.set(s.source.id, { id: s.source.id, name: s.source.name ?? s.source.id, kind: s.source.kind, types: [...types].sort(), last: at });
  }
  return [...byId.values()];
}

export async function ingestHealth(state: HealthState, options: IngestOptions): Promise<IngestResult> {
  const { now, timeZone, allowed } = options;
  if (!options.readers.length || !allowed.size) return { state, read: 0, failed: [] };
  const window = readWindow(state.anchor, now, timeZone);
  const results = await Promise.allSettled(options.readers.map(r => r.read(window.from, window.to, allowed)));
  const failed = options.readers.filter((_, i) => results[i].status === 'rejected').map(r => r.name);
  if (failed.length) return { state: { ...state, failed }, read: 0, failed };

  const samples = results.flatMap(r => (r.status === 'fulfilled' ? r.value : [])).filter(s => allowed.has(s.type));
  const summary = summariseDays(samples, { timeZone, age: options.age, sex: options.sex, preferred: options.preferred });
  const today = lifeDay(now, timeZone);
  const detailFrom = keepFrom(today, STRESS_DETAIL_DAYS);
  const days = mergeDays(state.days, summary.days, window.dates, keepFrom(today))
    .map(d => (d.stress && d.date < detailFrom ? { ...d, stress: { ...d.stress, levels: [] } } : d));
  const [first, last] = window.dates;
  const at = new Date(now).toISOString();
  return {
    state: {
      days,
      anchor: now,
      lastRead: at,
      disagreements: [...state.disagreements.filter(d => (d.date < first || d.date > last) && d.date >= keepFrom(today)), ...summary.disagreements.filter(d => d.date >= first && d.date <= last)],
      sources: sourcesSeen(samples, state.sources, at),
      failed: [],
    },
    read: samples.length,
    failed: [],
  };
}
