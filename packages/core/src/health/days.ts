/**
 * Keeping one row per life day as readings arrive (SPEC §2.1, BUILD_V26 Phase 26): what to read since the last
 * anchor, how fresh summaries replace stored ones, and the wrist-temperature change a watch doesn't give itself.
 *
 * Each read covers whole days. A day's summary needs all of that day's readings to pick one source per metric, so a
 * read re-summarises from the day before the last one, never just the new samples.
 */
import { isNum, median, round } from '../math/stats';
import { addDays, daysBetween, lifeDay, lifeDayBounds, type DateKey } from '../time/zone';
import type { DailyHealth } from './types';

/** The first read goes back 60 days, enough for readiness's normal (readiness.ts). */
export const HEALTH_BACKFILL_DAYS = 60;
/** Rows kept on the phone: two 60-day windows, so a normal can always be rebuilt. */
export const HEALTH_KEEP_DAYS = 120;
/** A night that ends on the first morning starts the evening before, so reads begin this much earlier. */
const NIGHT_MARGIN = 12 * 3_600_000;

export interface ReadWindow {
  /** UTC milliseconds to read from and to. */
  from: number;
  to: number;
  /** The life days this read summarises, both included. Summaries outside them are partial and ignored. */
  dates: [DateKey, DateKey];
}

/**
 * The span to read. With no anchor (the first read, or after a reset) the last 60 life days; after that, from the
 * life day before the anchor's, so late readings land with the rest of their day. Never more than the backfill.
 */
export function readWindow(anchor: number | null, now: number, timeZone: string, backfillDays = HEALTH_BACKFILL_DAYS): ReadWindow {
  const today = lifeDay(now, timeZone);
  const earliest = addDays(today, -backfillDays + 1);
  let first = earliest;
  if (anchor !== null && Number.isFinite(anchor)) {
    const since = addDays(lifeDay(Math.min(anchor, now), timeZone), -1);
    first = since < earliest ? earliest : since;
  }
  if (first > addDays(today, -1)) first = addDays(today, -1);
  return { from: lifeDayBounds(first, timeZone).start - NIGHT_MARGIN, to: now, dates: [first, today] };
}

/**
 * Fresh summaries replace stored rows for the days a read covered (a covered day with nothing in it is dropped);
 * days outside the read stay as they were. Rows before `keepFrom` go.
 */
export function mergeDays(stored: readonly DailyHealth[], fresh: readonly DailyHealth[], dates: readonly [DateKey, DateKey], keepFrom?: DateKey): DailyHealth[] {
  const [first, last] = dates;
  const inside = (d: DateKey) => d >= first && d <= last;
  const byDate = new Map<DateKey, DailyHealth>();
  for (const d of stored) if (!inside(d.date)) byDate.set(d.date, d);
  for (const d of fresh) if (inside(d.date)) byDate.set(d.date, d);
  return [...byDate.values()].filter(d => !keepFrom || d.date >= keepFrom).sort((a, b) => a.date.localeCompare(b.date));
}

/** The first date kept for a given today. */
export const keepFrom = (today: DateKey, days = HEALTH_KEEP_DAYS) => addDays(today, -days + 1);

/** Nights of wrist temperature needed before a change is shown. */
export const SKIN_TEMP_MIN_NIGHTS = 7;
export const SKIN_TEMP_BASELINE_DAYS = 28;

/**
 * A watch's absolute wrist temperature as a change against the median of your previous 28 nights (at least 7).
 * A wearable's own change, when it gives one, is kept. Nothing is made up when there are too few nights.
 */
export function withSkinTempDeltas(days: readonly DailyHealth[]): DailyHealth[] {
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date));
  return sorted.map(d => {
    if (isNum(d.skinTempDelta) || !isNum(d.skinTemp)) return d;
    const prior = sorted.filter(p => p.date < d.date && daysBetween(p.date, d.date) <= SKIN_TEMP_BASELINE_DAYS && isNum(p.skinTemp)).map(p => p.skinTemp as number);
    if (prior.length < SKIN_TEMP_MIN_NIGHTS) return d;
    return { ...d, skinTempDelta: round(d.skinTemp - (median(prior) as number), 2) };
  });
}
