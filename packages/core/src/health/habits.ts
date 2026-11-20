/**
 * Habit strength over the roughly 66 days a habit takes to feel automatic (SPEC §3.6; Lally et al. 2010: median 66
 * days, range 18 to 254). The gap list notes the `strength` column had no engine behind it; this is that engine.
 *
 * Strength follows Lally's asymptotic curve: each done day closes the same share of the gap to 100, chosen so 66 days
 * in a row reach 95. Missing is treated kindly (never miss twice): one miss costs a little, a second in a row costs
 * more, and only a run of misses really erodes it. Days a habit isn't scheduled for don't count either way.
 * Our own model; no habit-tracker code was copied.
 */
import { clamp } from '../math/stats';
import { addDays, daysBetween, weekdayOf, type DateKey } from '../time/zone';

export type HabitDay = 'done' | 'missed' | 'off';

export const HABIT_TYPICAL_DAYS = 66;
/** Share of the gap to 100 closed by each done day: 66 in a row reach 95. */
export const HABIT_RATE = 1 - 0.05 ** (1 / HABIT_TYPICAL_DAYS);
/** What a miss costs: the first in a row, the second, and every one after. */
export const MISS_COST = [HABIT_RATE / 2, HABIT_RATE * 2, HABIT_RATE * 3] as const;
export const MAX_NEW_HABITS = 3;
export const AUTOMATICITY_CHECK_DAYS = 14;

export interface HabitStrength {
  /** 0–100. */
  strength: number;
  /** Strength just before the latest miss, if there was one. */
  beforeLastMiss: number | null;
  /** Days since the habit started (1 on the first day). */
  day: number;
  typicalDays: number;
  done: number;
  misses: number;
  /** Single misses, forgiven by "never miss twice". */
  forgiven: number;
  /** Done in the last 14 scheduled days ("13 of last 14"). */
  lastFourteen: { done: number; of: number };
  /** The last scheduled day was missed, so a miss today would be the second in a row. */
  atRisk: boolean;
  /** Done days in a row, ending with the latest scheduled day. */
  streak: number;
}

/** Strength from a habit's days, oldest first. */
export function habitStrength(days: readonly HabitDay[]): HabitStrength {
  let s = 0, run = 0, misses = 0, forgiven = 0, done = 0, streak = 0;
  let beforeLastMiss: number | null = null;
  const scheduled: HabitDay[] = [];
  for (const d of days) {
    if (d === 'off') continue;
    scheduled.push(d);
    if (d === 'done') {
      if (run === 1) forgiven++;
      s += HABIT_RATE * (1 - s);
      run = 0; done++; streak++;
    } else {
      beforeLastMiss = s;
      s *= 1 - MISS_COST[Math.min(run, 2)];
      run++; misses++; streak = 0;
    }
  }
  const last = scheduled.slice(-14);
  return {
    strength: Math.round(clamp(s, 0, 1) * 100),
    beforeLastMiss: beforeLastMiss === null ? null : Math.round(beforeLastMiss * 100),
    day: days.length,
    typicalDays: HABIT_TYPICAL_DAYS,
    done,
    misses,
    forgiven,
    lastFourteen: { done: last.filter(d => d === 'done').length, of: last.length },
    atRisk: run === 1,
    streak,
  };
}

/** A habit's days from a start date to today, given which dates were done and which weekdays it runs on. */
export function habitDays(start: DateKey, today: DateKey, doneDates: ReadonlySet<DateKey>, scheduledWeekdays?: ReadonlySet<number>): HabitDay[] {
  const n = daysBetween(start, today);
  return Array.from({ length: Math.max(0, n + 1) }, (_, i) => {
    const date = addDays(start, i);
    if (doneDates.has(date)) return 'done';
    if (scheduledWeekdays && !scheduledWeekdays.has(weekdayOf(date))) return 'off';
    return date === today ? 'off' : 'missed'; // today isn't missed until it's over
  });
}

/** Every 14 days life asks "how automatic does this feel?" (1–5). */
export const automaticityCheckDue = (lastCheck: DateKey | null, start: DateKey, today: DateKey) =>
  daysBetween(lastCheck ?? start, today) >= AUTOMATICITY_CHECK_DAYS;

/** A habit graduates to a routine after two check-ins in a row at 4 or more. */
export function graduates(checkIns: readonly number[]): boolean {
  const last = checkIns.slice(-2);
  return last.length === 2 && last.every(v => v >= 4);
}

/** No more than three new habits at a time (more lowers success). */
export const canStartHabit = (activeNewHabits: number) => activeNewHabits < MAX_NEW_HABITS;

/** A habit that completes itself from data: sleep ≥ 7h, steps ≥ 8,000, protein logged, and so on. */
export interface SignalRule { metric: 'sleepMinutes' | 'steps' | 'proteinG' | 'waterMl' | 'activeMinutes'; atLeast: number }
export const meetsSignal = (rule: SignalRule, values: Partial<Record<SignalRule['metric'], number>>) => (values[rule.metric] ?? -Infinity) >= rule.atLeast;
