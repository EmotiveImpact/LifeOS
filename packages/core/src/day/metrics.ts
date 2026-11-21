import { addDays, lifeDay, parseDateKey, weekdayOf, type DateKey } from '../time/zone';

/**
 * Life's north star (SYSTEM_DESIGN §observability): moves finished per week. Counted on the phone, and shared only
 * as one number per finished week, with no name, account or device, when the person switches it on in Your data.
 */

/** A week's count stops here: enough to see the spread, too coarse to describe anyone. */
export const MOVES_CAP = 99;
/** How many finished weeks back a phone may still report (a phone that was off for a while catches up this far). */
export const REPORT_WEEKS = 4;

/** The ISO week (`2026-W47`, Monday first) of the Life day an instant falls in, so 02:00 on a Monday counts in the week before. */
export function weekKey(at: number, timeZone: string): string {
  return isoWeek(lifeDay(at, timeZone));
}

function isoWeek(date: DateKey): string {
  const thursday = addDays(date, 3 - weekdayOf(date));
  const { year } = parseDateKey(thursday);
  const dayOfYear = Math.round((Date.parse(`${thursday}T12:00:00Z`) - Date.parse(`${year}-01-01T12:00:00Z`)) / 86400000) + 1;
  return `${year}-W${String(1 + Math.floor((dayOfYear - 1) / 7)).padStart(2, '0')}`;
}

/** The weeks `back` weeks before the one `at` falls in (0 is this week). */
function weeksBack(at: number, timeZone: string, from: number, to: number): string[] {
  const today = lifeDay(at, timeZone);
  return Array.from({ length: to - from + 1 }, (_, i) => isoWeek(addDays(today, -7 * (from + i))));
}

type Marks = Record<string, { state?: string } | undefined>;
/** The parts of the day's data where a move gets finished. */
export type MoveSources = {
  missionSteps?: Record<string, boolean>;
  loops?: { marks?: Marks };
  habits?: { id: string; last14?: (boolean | null | undefined)[] }[];
};

/**
 * How many moves were finished between two snapshots of the day's data: a mission step ticked, a step of the plan
 * marked done, a habit done today. Unticking takes nothing back, and the first snapshot counts nothing.
 */
export function finishedMoves(before: MoveSources | undefined, after: MoveSources): number {
  if (!before) return 0;
  let n = 0;
  for (const [key, done] of Object.entries(after.missionSteps ?? {})) if (done === true && before.missionSteps?.[key] !== true) n++;
  const was = before.loops?.marks ?? {};
  for (const [key, mark] of Object.entries(after.loops?.marks ?? {})) if (mark?.state === 'done' && was[key]?.state !== 'done') n++;
  for (const habit of after.habits ?? []) {
    const prior = before.habits?.find(h => h.id === habit.id);
    if (!prior || !habit.last14?.length) continue;
    if (habit.last14[habit.last14.length - 1] === true && prior.last14?.[prior.last14.length - 1] !== true) n++;
  }
  return n;
}

/** Kept on the phone (a phone-only choice): moves per recent week, and the weeks already shared. */
export type MovesLog = { weeks: Record<string, number>; sent: string[] };

export function readMovesLog(raw: unknown): MovesLog {
  try {
    const v = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!v || typeof v !== 'object') return { weeks: {}, sent: [] };
    const weeks = Object.fromEntries(Object.entries((v as MovesLog).weeks ?? {}).filter(([k, n]) => /^\d{4}-W\d{2}$/.test(k) && Number.isFinite(n)).map(([k, n]) => [k, Math.max(0, Math.min(MOVES_CAP, Math.round(Number(n))))]));
    const sent = Array.isArray((v as MovesLog).sent) ? (v as MovesLog).sent.filter((s): s is string => typeof s === 'string') : [];
    return { weeks, sent };
  } catch { return { weeks: {}, sent: [] }; }
}

/** Adds `n` finished moves (0 just marks the week as one the app was used in) and drops weeks too old to report. */
export function noteMoves(log: MovesLog, at: number, timeZone: string, n: number): MovesLog {
  const week = weekKey(at, timeZone);
  const keep = new Set(weeksBack(at, timeZone, 0, REPORT_WEEKS + 1));
  const weeks = Object.fromEntries(Object.entries(log.weeks).filter(([k]) => keep.has(k)));
  weeks[week] = Math.min(MOVES_CAP, (weeks[week] ?? 0) + Math.max(0, n));
  return { weeks, sent: log.sent.filter(k => keep.has(k)) };
}

/** Finished weeks the app was used in and hasn't shared yet, oldest first. */
export function dueReports(log: MovesLog, now: number, timeZone: string): { week: string; moves: number }[] {
  return weeksBack(now, timeZone, 1, REPORT_WEEKS).filter(k => k in log.weeks && !log.sent.includes(k)).sort().map(week => ({ week, moves: log.weeks[week] }));
}

export const markSent = (log: MovesLog, weeks: string[]): MovesLog => ({ ...log, sent: [...new Set([...log.sent, ...weeks])] });
