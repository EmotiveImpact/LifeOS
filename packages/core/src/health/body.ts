/**
 * Body's numbers for one day, from stored daily rows (BUILD_V26 Phase 26). Every part is computed by the engine
 * modules beside this one and each is null when its readings are missing, so a screen shows its empty state instead
 * of a zero. Readiness's normal range comes from your own last 60 days of scores; it replaces Body's fixed 60–70
 * placeholder once there are real readings.
 *
 * Order matters: a first sleep need (from nights alone) scores the past 60 days; those scores teach which nights
 * were well rested; the refined need then scores today.
 */
import { isNum, round } from '../math/stats';
import { addDays, type DateKey } from '../time/zone';
import { withSkinTempDeltas } from './days';
import { loadRatio, loadScore, sweetSpot, weeklyLoads, type LoadRatio, type SweetSpot } from './load';
import { readiness, readinessAgainstNormal, readinessHistory, readinessNormal, READINESS_BASELINE_DAYS, type Readiness } from './readiness';
import { bodySignals, type BodySignals } from './signals';
import {
  baseSleepNeed, bedtimeConsistency, personalTimings, planBedtime, sleepDebt, sleepNeedTonight, sleepPerformance, sleepRegularity,
  type BaseNeed, type BedtimePlan, type Regularity, type SleepDebt, type TonightNeed,
} from './sleep';
import { stressUsual } from './stress';
import type { DailyHealth, DayStress, NightSleep } from './types';

export interface BodySleep {
  /** The night that ended this morning, if there was one. */
  last: NightSleep | null;
  performance: number | null;
  need: BaseNeed;
  tonight: TonightNeed;
  debt: SleepDebt;
  /** Minutes asleep for the last 7 nights, oldest first; null for a night with no reading. */
  week: (number | null)[];
  /** Nights this week at or above your need. */
  reached: number;
  consistency: ReturnType<typeof bedtimeConsistency>;
  regularity: Regularity | null;
  timings: ReturnType<typeof personalTimings>;
  /** Tonight's bedtimes for your usual wake time. */
  plan: BedtimePlan[];
  wake: number;
}

export interface BodyLoad {
  /** Today's load score (0–21) and the TRIMP behind it. */
  today: number;
  trimp: number;
  sweetSpot: SweetSpot;
  ratio: LoadRatio | null;
  /** Each of the last 7 days' scores, oldest first; null for a day with no heart rate. */
  week: (number | null)[];
  weekly: ReturnType<typeof weeklyLoads>;
}

export interface BodyStress {
  now: number | null;
  average: number | null;
  today: DayStress | null;
  usual: [number, number] | null;
  week: (number | null)[];
}

export interface BodyToday {
  today: DateKey;
  /** Days in the last 60 with any reading. */
  daysWithData: number;
  lastDate: DateKey | null;
  readiness: Readiness;
  /** The last 7 days' readiness, oldest first; null where there was no score. */
  readinessWeek: (number | null)[];
  normal: { low: number; high: number; usual: number; days: number } | null;
  against: 'below' | 'within' | 'above' | null;
  sleep: BodySleep | null;
  load: BodyLoad | null;
  stress: BodyStress | null;
  signals: BodySignals;
  steps: number | null;
}

const hasReading = (d: DailyHealth) =>
  isNum(d.hrv) || isNum(d.restingHr) || isNum(d.sleep?.asleepMinutes) || isNum(d.steps) || isNum(d.trimp) || isNum(d.respiratoryRate) || isNum(d.spo2) || isNum(d.skinTemp) || isNum(d.skinTempDelta);

const lastWeek = (today: DateKey) => Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

export function bodyToday(input: { days: readonly DailyHealth[]; today: DateKey }): BodyToday {
  const { today } = input;
  const days = withSkinTempDeltas(input.days.filter(d => d.date <= today));
  const byDate = new Map(days.map(d => [d.date, d]));
  const from = addDays(today, -READINESS_BASELINE_DAYS + 1);
  const recent = days.filter(d => d.date >= from && hasReading(d));
  const week = lastWeek(today);
  const todayRow = byDate.get(today);

  // Sleep need, then 60 days of scores, then the need again with those scores.
  const nights = days.filter(d => isNum(d.sleep?.asleepMinutes)).map(d => ({ date: d.date, asleepMinutes: d.sleep!.asleepMinutes }));
  const firstNeed = baseSleepNeed(nights, today);
  const span = Array.from({ length: READINESS_BASELINE_DAYS }, (_, i) => addDays(today, i - READINESS_BASELINE_DAYS + 1));
  const history = readinessHistory(days, span, () => firstNeed.minutes);
  const need = baseSleepNeed(nights, today, Object.fromEntries(history.map(h => [h.date, h.value])));
  const scores = need.minutes === firstNeed.minutes ? history : readinessHistory(days, span, () => need.minutes);
  const scoreOn = new Map(scores.map(s => [s.date, s.value]));
  const now = readiness({ days, today, sleepNeed: need.minutes });
  const normal = readinessNormal(scores, today);
  const againstNow = now.status === 'ready' && normal ? readinessAgainstNormal(now.score, normal) : null;

  const loadDays = days.filter(d => isNum(d.trimp)).map(d => ({ date: d.date, trimp: d.trimp as number }));
  const hasLoad = week.some(d => isNum(byDate.get(d)?.trimp));
  const todayTrimp = todayRow?.trimp ?? 0;
  const load: BodyLoad | null = hasLoad ? {
    today: loadScore(todayTrimp), trimp: round(todayTrimp, 1),
    sweetSpot: sweetSpot({ readiness: now.status === 'ready' ? now.score : null, history: loadDays, today, todayTrimp }),
    ratio: loadRatio(loadDays, today),
    week: week.map(d => { const t = byDate.get(d)?.trimp; return isNum(t) ? loadScore(t) : null; }),
    weekly: weeklyLoads(loadDays, today),
  } : null;

  const hasSleep = week.some(d => isNum(byDate.get(d)?.sleep?.asleepMinutes));
  let sleep: BodySleep | null = null;
  if (hasSleep) {
    const debt = sleepDebt(nights, need.minutes, today);
    const last = todayRow?.sleep ?? null;
    const times = days.filter(d => d.sleep).map(d => ({ date: d.date, start: d.sleep!.start, end: d.sleep!.end, timeZone: d.timeZone }));
    const consistency = bedtimeConsistency(times, today);
    const regularity = sleepRegularity(times.filter(t => t.date >= addDays(today, -13)));
    const timings = personalTimings(days.slice(-14).flatMap(d => (d.sleep ? [d.sleep] : [])));
    const tonight = sleepNeedTonight({ base: need.minutes, debtMinutes: debt.minutes, todayLoad: load?.today, napMinutes: todayRow?.napMinutes });
    const wake = consistency?.usualWake ?? last?.wake ?? 7 * 60;
    const weekNights = week.map(d => { const m = byDate.get(d)?.sleep?.asleepMinutes; return isNum(m) ? Math.round(m) : null; });
    sleep = {
      last, performance: last ? sleepPerformance(last.asleepMinutes, need.minutes) : null, need, tonight, debt,
      week: weekNights, reached: weekNights.filter(m => m !== null && m >= need.minutes).length,
      consistency, regularity, timings, wake,
      plan: planBedtime({ wake, base: need.minutes, tonight: tonight.minutes, latency: timings.latency, awake: timings.awake }),
    };
  }

  const stressDays = days.filter(d => isNum(d.stress?.average)).map(d => ({ date: d.date, value: d.stress!.average as number }));
  const hasStress = week.some(d => isNum(byDate.get(d)?.stress?.average));
  const stress: BodyStress | null = hasStress ? {
    now: todayRow?.stress?.now ?? null, average: todayRow?.stress?.average ?? null, today: todayRow?.stress ?? null,
    usual: stressUsual(stressDays, today),
    week: week.map(d => byDate.get(d)?.stress?.average ?? null),
  } : null;

  return {
    today,
    daysWithData: recent.length,
    lastDate: recent.length ? recent[recent.length - 1].date : null,
    readiness: now,
    readinessWeek: week.map(d => scoreOn.get(d) ?? (d === today && now.status === 'ready' ? now.score : null)),
    normal,
    against: againstNow,
    sleep, load, stress,
    signals: bodySignals(days, today),
    steps: isNum(todayRow?.steps) ? todayRow.steps : null,
  };
}
