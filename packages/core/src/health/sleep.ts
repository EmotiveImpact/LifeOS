/**
 * Sleep: your need, the debt you're carrying, how well last night covered it, how regular your nights are, and the
 * bedtime that gets you what you need (SPEC §3.4, §3.8 sleep planner).
 *
 * - Need starts at 8 hours and learns from your well-rested nights, meeting them halfway between 8 hours and your
 *   typical night and staying inside the NHS 7 to 9 hour guide. The halfway rule, the 5 hour crash-night cut-off and
 *   the 0.9 nap credit are ported from Atria's `AtriaSleepBudget.swift` (MIT, see THIRD_PARTY_NOTICES.md).
 * - Debt is a running ledger over the last 7 nights: a short night adds the shortfall, a long night pays it back, and
 *   it never goes below zero (you can't bank sleep in advance). It is capped at 8 hours.
 * - Tonight's need adds a third of the debt (repaid over three nights, at most an hour), a little for a hard day, and
 *   takes off most of today's naps, inside 6 to 10 hours.
 * - Regularity is the Sleep Regularity Index (Phillips et al. 2017): the chance you're in the same state (asleep or
 *   awake) at the same clock time 24 hours apart, on a 0–100 scale. It uses the local wall clock, skips nights around a
 *   flight, and isn't fooled by clock changes.
 */
import { clamp, clockMean, clockSd, isNum, median, round, sum, wrapClock } from '../math/stats';
import { addDays, isTravelShift, localParts, offsetMinutes, resolveTimeZone, type DateKey } from '../time/zone';

export const DEFAULT_SLEEP_NEED = 480;
export const NEED_RANGE = [420, 540] as const; // NHS: most adults need 7 to 9 hours
export const TONIGHT_RANGE = [360, 600] as const;
export const DEBT_CAP = 480;
export const DEBT_NIGHTS = 7;
export const CRASH_NIGHT = 300; // nights under 5 hours don't teach us your need
export const NAP_CREDIT = 0.9;
export const DEFAULT_LATENCY = 15;
export const DEFAULT_AWAKE = 15;
export const BEDTIME_REMINDER_LEAD = 45;

export interface NightMinutes { date: DateKey; asleepMinutes: number }

/* ───────────────────────── Need ───────────────────────── */

export interface BaseNeed { minutes: number; basis: 'default' | 'learned'; nights: number }

/**
 * Your usual sleep need. Well-rested nights are the ones before a high-readiness morning when readiness is known;
 * before that, any night of 5 hours or more. Learned once there are 7 well-rested nights (or 14 ordinary ones).
 */
export function baseSleepNeed(nights: readonly NightMinutes[], today: DateKey, readinessByDate?: Readonly<Record<DateKey, number>>): BaseNeed {
  const from = addDays(today, -28);
  const recent = nights.filter(n => n.date >= from && n.date <= today && isNum(n.asleepMinutes) && n.asleepMinutes >= CRASH_NIGHT);
  const rested = readinessByDate ? recent.filter(n => (readinessByDate[n.date] ?? -1) >= 67) : [];
  const pool = rested.length >= 7 ? rested : recent.length >= 14 ? recent : null;
  if (!pool) return { minutes: DEFAULT_SLEEP_NEED, basis: 'default', nights: recent.length };
  const typical = clamp(median(pool.map(n => n.asleepMinutes)) as number, NEED_RANGE[0], NEED_RANGE[1]);
  return { minutes: Math.round((DEFAULT_SLEEP_NEED + typical) / 2), basis: 'learned', nights: pool.length };
}

/* ───────────────────────── Debt ───────────────────────── */

export interface DebtNight { date: DateKey; need: number; asleep: number; change: number; debt: number }
export interface SleepDebt { minutes: number; ledger: DebtNight[] }

/** The running debt over the last 7 nights ending `today` (nights with no reading change nothing). */
export function sleepDebt(nights: readonly NightMinutes[], need: number | ((date: DateKey) => number), today: DateKey): SleepDebt {
  const needOf = typeof need === 'function' ? need : () => need;
  const byDate = new Map(nights.filter(n => isNum(n.asleepMinutes)).map(n => [n.date, n.asleepMinutes]));
  const ledger: DebtNight[] = [];
  let debt = 0;
  for (let i = DEBT_NIGHTS - 1; i >= 0; i--) {
    const date = addDays(today, -i);
    const asleep = byDate.get(date);
    if (asleep === undefined) continue;
    const n = needOf(date);
    const next = clamp(debt + n - asleep, 0, DEBT_CAP);
    ledger.push({ date, need: n, asleep, change: next - debt, debt: next });
    debt = next;
  }
  return { minutes: Math.round(debt), ledger };
}

/** Shortfall over the last few nights (the planner's "3 hours over 3 nights" rule). */
export function recentShortfall(nights: readonly NightMinutes[], need: number, today: DateKey, count = 3): number {
  const byDate = new Map(nights.map(n => [n.date, n.asleepMinutes]));
  return Math.round(sum(Array.from({ length: count }, (_, i) => {
    const asleep = byDate.get(addDays(today, -i));
    return isNum(asleep) ? Math.max(0, need - asleep) : 0;
  })));
}

export interface TonightNeed {
  minutes: number;
  base: number;
  /** Debt repaid tonight (a third, at most an hour). */
  debt: number;
  /** Extra for a hard day: 4 minutes per load point above 10. */
  load: number;
  /** Taken off for today's naps. */
  nap: number;
  clamped: boolean;
}

export function sleepNeedTonight(input: { base: number; debtMinutes: number; todayLoad?: number; napMinutes?: number }): TonightNeed {
  const debt = Math.min(Math.max(0, input.debtMinutes), 180) / 3;
  const load = Math.max(0, (input.todayLoad ?? 0) - 10) * 4;
  const nap = Math.max(0, input.napMinutes ?? 0) * NAP_CREDIT;
  const raw = input.base + debt + load - nap;
  const minutes = Math.round(clamp(raw, TONIGHT_RANGE[0], TONIGHT_RANGE[1]));
  return { minutes, base: input.base, debt: Math.round(debt), load: Math.round(load), nap: Math.round(nap), clamped: Math.abs(raw - minutes) > 0.5 };
}

/** Asleep as a share of need, 0–100. */
export const sleepPerformance = (asleepMinutes: number, needMinutes: number) =>
  needMinutes > 0 ? Math.round(clamp((asleepMinutes / needMinutes) * 100, 0, 100)) : 0;

/* ───────────────────────── Consistency and regularity ───────────────────────── */

export interface NightTimes { date: DateKey; start: number; end: number; timeZone?: string }

/** Nights to leave out of regularity: a flight's night and the one after it. */
export function travelNights(nights: readonly NightTimes[]): Set<DateKey> {
  const sorted = [...nights].sort((a, b) => a.date.localeCompare(b.date));
  const out = new Set<DateKey>();
  for (let i = 1; i < sorted.length; i++) {
    const prev = offsetMinutes(sorted[i - 1].end, resolveTimeZone(sorted[i - 1].timeZone));
    const cur = offsetMinutes(sorted[i].end, resolveTimeZone(sorted[i].timeZone));
    if (isTravelShift(prev, cur)) { out.add(sorted[i].date); out.add(addDays(sorted[i].date, 1)); }
  }
  return out;
}

/** How far bedtime moves night to night: the circular SD of local bedtimes over the last 7 nights, in minutes. */
export function bedtimeConsistency(nights: readonly NightTimes[], today: DateKey, count = 7): { minutes: number; usualBedtime: number; usualWake: number; nights: number } | null {
  const from = addDays(today, -count + 1);
  const skip = travelNights(nights);
  const use = nights.filter(n => n.date >= from && n.date <= today && !skip.has(n.date));
  if (use.length < 3) return null;
  const beds = use.map(n => localParts(n.start, resolveTimeZone(n.timeZone)).minutes);
  const wakes = use.map(n => localParts(n.end, resolveTimeZone(n.timeZone)).minutes);
  return { minutes: Math.round(clockSd(beds) ?? 0), usualBedtime: Math.round(clockMean(beds) ?? 0), usualWake: Math.round(clockMean(wakes) ?? 0), nights: use.length };
}

/** Marks each local minute asleep, per local date, for one sleep episode. */
function markAsleep(days: Map<DateKey, Uint8Array>, start: number, end: number, timeZone: string) {
  const tz = resolveTimeZone(timeZone);
  const minutes = Math.round((end - start) / 60_000);
  if (minutes <= 0) return;
  const sameOffset = offsetMinutes(start, tz) === offsetMinutes(end, tz);
  const first = localParts(start, tz);
  for (let i = 0; i < minutes; i++) {
    let date: DateKey, minute: number;
    if (sameOffset) {
      const m = Math.floor(first.minutes) + i;
      date = addDays(first.date, Math.floor(m / 1440));
      minute = wrapClock(m);
    } else {
      const p = localParts(start + i * 60_000, tz);
      date = p.date;
      minute = Math.floor(p.minutes);
    }
    let day = days.get(date);
    if (!day) { day = new Uint8Array(1440); days.set(date, day); }
    day[minute] = 1;
  }
}

export interface Regularity { score: number; pairs: number }

/**
 * Sleep Regularity Index for the nights given (Phillips et al. 2017), on a 0–100 scale. A day counts once both the
 * night ending on it and the night ending the next morning are known, and neither is a travel night.
 */
export function sleepRegularity(nights: readonly NightTimes[], episodes?: readonly { start: number; end: number; timeZone?: string }[]): Regularity | null {
  const known = new Set(nights.map(n => n.date));
  const skip = travelNights(nights);
  const days = new Map<DateKey, Uint8Array>();
  for (const e of episodes ?? nights) markAsleep(days, e.start, e.end, e.timeZone ?? 'UTC');
  const complete = (d: DateKey) => known.has(d) && known.has(addDays(d, 1)) && !skip.has(d) && !skip.has(addDays(d, 1));
  let same = 0, total = 0, pairs = 0;
  for (const d of [...known].sort()) {
    const next = addDays(d, 1);
    if (!complete(d) || !complete(next)) continue;
    const a = days.get(d) ?? new Uint8Array(1440), b = days.get(next) ?? new Uint8Array(1440);
    for (let m = 0; m < 1440; m++) { if (a[m] === b[m]) same++; total++; }
    pairs++;
  }
  if (!pairs) return null;
  return { score: Math.round(Math.max(0, 200 * (same / total) - 100)), pairs };
}

/* ───────────────────────── Tonight's bedtime ───────────────────────── */

export type SleepGoal = 'minimum' | 'enough' | 'full';

export interface BedtimePlan {
  goal: SleepGoal;
  /** Minutes asleep the goal aims for. */
  asleep: number;
  /** Local clock minutes to be in bed by. */
  bedtime: number;
  /** When the opt-in bedtime reminder goes off (45 minutes before). */
  reminder: number;
}

/**
 * Works back from a wake time. Minimum is 7 hours (the bottom of the NHS guide), enough is your usual need, full is
 * tonight's need with the debt payback. Time in bed adds your usual minutes to fall asleep and awake in the night.
 */
export function planBedtime(input: { wake: number; base: number; tonight: number; latency?: number; awake?: number }): BedtimePlan[] {
  const latency = input.latency ?? DEFAULT_LATENCY, awake = input.awake ?? DEFAULT_AWAKE;
  const goals: [SleepGoal, number][] = [['minimum', Math.min(NEED_RANGE[0], input.base)], ['enough', input.base], ['full', Math.max(input.base, input.tonight)]];
  return goals.map(([goal, asleep]) => {
    const bedtime = wrapClock(Math.round(input.wake - asleep - latency - awake));
    return { goal, asleep, bedtime, reminder: wrapClock(bedtime - BEDTIME_REMINDER_LEAD) };
  });
}

/** Your usual minutes to fall asleep and awake in the night, from recent nights (defaults until there are 5). */
export function personalTimings(nights: readonly { latencyMinutes?: number; awakeMinutes?: number }[]): { latency: number; awake: number; learned: boolean } {
  const lat = nights.map(n => n.latencyMinutes).filter((v): v is number => isNum(v) && v >= 0 && v <= 120);
  const awk = nights.map(n => n.awakeMinutes).filter((v): v is number => isNum(v) && v >= 0 && v <= 240);
  const learned = lat.length >= 5 && awk.length >= 5;
  return { latency: learned ? round(median(lat) as number) : DEFAULT_LATENCY, awake: learned ? round(median(awk) as number) : DEFAULT_AWAKE, learned };
}
