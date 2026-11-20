/**
 * Days, clocks and time zones for the engine (gap 14 in the V26 plan review).
 *
 * Rules every engine module follows:
 * - Instants are stored as UTC (epoch milliseconds or ISO strings). Every daily row also records the IANA zone it was
 *   lived in, so a day is always read in the zone where it happened, including when travelling.
 * - Durations are measured between instants, never between clock times, so a night across a clock change is as long
 *   as it really was (nine hours from 23:00 to 07:00 when the clocks go back).
 * - Clock-time comparisons (bedtime, quiet hours) use the local wall clock of the zone at the time.
 * - Sleep belongs to the day you wake up on. Everything else belongs to its life day, which runs from 04:00 to 04:00
 *   local (`DAY_STARTS_AT`), so a 01:30 snack after a late shift counts for the evening before.
 *
 * Uses only `Intl.DateTimeFormat`, which Hermes supports on iOS and Android, so it needs no library.
 */
import { wrapClock } from '../math/stats';

/** A local calendar date, `YYYY-MM-DD`. */
export type DateKey = string;

/** Minutes after local midnight when a new life day starts (04:00). One constant, so the owner can move it. */
export const DAY_STARTS_AT = 4 * 60;

/** life's quiet hours: no nudges from 21:00 to 08:00 local. */
export type QuietHours = { start: number; end: number };
export const QUIET_HOURS: QuietHours = { start: 21 * 60, end: 8 * 60 };

/** A zone offset change this big between two days means travel, not a clock change (which is 60 minutes or less). */
export const TRAVEL_SHIFT_MINUTES = 120;

export interface LocalParts {
  date: DateKey;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
  /** Minutes after local midnight, including seconds as a fraction. */
  minutes: number;
  /** 0 is Monday, 6 is Sunday. */
  weekday: number;
}

const MS_MIN = 60_000;
const MS_DAY = 86_400_000;
const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(timeZone: string): Intl.DateTimeFormat {
  let f = formatters.get(timeZone);
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone, hour12: false, year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric',
    });
    formatters.set(timeZone, f);
  }
  return f;
}

export function isValidTimeZone(timeZone: string | undefined | null): boolean {
  if (!timeZone) return false;
  try {
    formatter(timeZone);
    return true;
  } catch {
    return false;
  }
}

/** The zone to use: the one given if the device knows it, otherwise UTC (never a crash over a bad row). */
export const resolveTimeZone = (timeZone: string | undefined | null): string => (isValidTimeZone(timeZone) ? timeZone as string : 'UTC');

const pad = (n: number, w = 2) => String(n).padStart(w, '0');
const keyOf = (y: number, m: number, d: number): DateKey => `${pad(y, 4)}-${pad(m)}-${pad(d)}`;

export function parseDateKey(date: DateKey): { year: number; month: number; day: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) throw new RangeError(`Not a date key: ${date}`);
  return { year: Number(match[1]), month: Number(match[2]), day: Number(match[3]) };
}

export function localParts(at: number, timeZone: string): LocalParts {
  const parts: Record<string, number> = {};
  for (const p of formatter(timeZone).formatToParts(new Date(at))) {
    if (p.type !== 'literal') parts[p.type] = Number(p.value);
  }
  const hour = parts.hour === 24 ? 0 : parts.hour; // some engines write midnight as 24 with hour12: false
  const { year, month, day, minute, second } = parts as { year: number; month: number; day: number; minute: number; second: number };
  const date = keyOf(year, month, day);
  return { date, year, month, day, hour, minute, second, minutes: hour * 60 + minute + second / 60, weekday: weekdayOf(date) };
}

/** Local time minus UTC, in minutes, at that instant. */
export function offsetMinutes(at: number, timeZone: string): number {
  const p = localParts(at, timeZone);
  const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return Math.round((asUtc - Math.floor(at / 1000) * 1000) / MS_MIN);
}

export const localDate = (at: number, timeZone: string): DateKey => localParts(at, timeZone).date;
export const localMinutes = (at: number, timeZone: string): number => localParts(at, timeZone).minutes;

/**
 * The instant a local wall-clock time happens. A time skipped by the clocks going forward moves forward by the gap
 * (01:30 on the spring-forward night in London becomes 02:30 BST); a time that happens twice when the clocks go back
 * takes the first occurrence.
 */
export function instantAt(date: DateKey, minutes: number, timeZone: string): number {
  const { year, month, day } = parseDateKey(date);
  const wall = Date.UTC(year, month - 1, day) + Math.round(minutes * MS_MIN);
  const offsets = new Set([offsetMinutes(wall - 14 * 3_600_000, timeZone), offsetMinutes(wall, timeZone), offsetMinutes(wall + 14 * 3_600_000, timeZone)]);
  const valid = [...offsets].map(o => wall - o * MS_MIN).filter(t => offsetMinutes(t, timeZone) * MS_MIN === wall - t);
  if (valid.length) return Math.min(...valid);
  return wall - offsetMinutes(wall - 14 * 3_600_000, timeZone) * MS_MIN; // in the gap: use the offset from before it
}

export const startOfLocalDay = (date: DateKey, timeZone: string) => instantAt(date, 0, timeZone);

/** How many real minutes a local calendar day lasts: 1,440, or 1,380 and 1,500 on clock-change days. */
export const dayLengthMinutes = (date: DateKey, timeZone: string) =>
  Math.round((startOfLocalDay(addDays(date, 1), timeZone) - startOfLocalDay(date, timeZone)) / MS_MIN);

export function addDays(date: DateKey, days: number): DateKey {
  const { year, month, day } = parseDateKey(date);
  const d = new Date(Date.UTC(year, month - 1, day) + days * MS_DAY);
  return keyOf(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

/** Whole calendar days from `from` to `to` (negative if `to` is earlier). */
export function daysBetween(from: DateKey, to: DateKey): number {
  const a = parseDateKey(from), b = parseDateKey(to);
  return Math.round((Date.UTC(b.year, b.month - 1, b.day) - Date.UTC(a.year, a.month - 1, a.day)) / MS_DAY);
}

/** 0 is Monday, 6 is Sunday. */
export function weekdayOf(date: DateKey): number {
  const { year, month, day } = parseDateKey(date);
  return (new Date(Date.UTC(year, month - 1, day)).getUTCDay() + 6) % 7;
}

/** The dates from `from` to `to`, both included. */
export function dateRange(from: DateKey, to: DateKey): DateKey[] {
  const n = daysBetween(from, to);
  return Array.from({ length: Math.max(0, n + 1) }, (_, i) => addDays(from, i));
}

/** The life day an instant belongs to: the local date, counting anything before 04:00 as the evening before. */
export function lifeDay(at: number, timeZone: string, dayStartsAt = DAY_STARTS_AT): DateKey {
  const p = localParts(at, timeZone);
  return p.minutes < dayStartsAt ? addDays(p.date, -1) : p.date;
}

/** Sleep belongs to the local date you wake up on. */
export const sleepDay = (wakeAt: number, timeZone: string): DateKey => localDate(wakeAt, timeZone);

/** The instants a life day starts and ends, in its zone. */
export const lifeDayBounds = (date: DateKey, timeZone: string, dayStartsAt = DAY_STARTS_AT) =>
  ({ start: instantAt(date, dayStartsAt, timeZone), end: instantAt(addDays(date, 1), dayStartsAt, timeZone) });

/** True when the zone offset moved by two hours or more between two days: a flight, not a clock change. */
export const isTravelShift = (previousOffset: number, offset: number) => Math.abs(offset - previousOffset) >= TRAVEL_SHIFT_MINUTES;

/** Whether a clock time (minutes after midnight) falls inside a quiet window; windows may cross midnight. */
export function clockInWindow(minutes: number, window: QuietHours): boolean {
  const m = wrapClock(minutes), { start, end } = window;
  if (start === end) return false;
  return start < end ? m >= start && m < end : m >= start || m < end;
}

export const inQuietHours = (at: number, timeZone: string, quiet: QuietHours = QUIET_HOURS) => clockInWindow(localMinutes(at, timeZone), quiet);

/** The instant itself if it is outside quiet hours, otherwise the moment quiet hours end, local time. */
export function nextOutsideQuiet(at: number, timeZone: string, quiet: QuietHours = QUIET_HOURS): number {
  const p = localParts(at, timeZone);
  if (!clockInWindow(p.minutes, quiet)) return at;
  const endsToday = quiet.start < quiet.end || p.minutes < quiet.end;
  return instantAt(endsToday ? p.date : addDays(p.date, 1), quiet.end, timeZone);
}


/** Milliseconds from an ISO string, or null if it doesn't parse. */
export function parseInstant(iso: string | number | undefined | null): number | null {
  if (typeof iso === 'number') return Number.isFinite(iso) ? iso : null;
  if (!iso) return null;
  const t = Date.parse(iso);
  return Number.isFinite(t) ? t : null;
}
