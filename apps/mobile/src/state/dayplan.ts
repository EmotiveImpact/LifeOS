/**
 * The day engine on the phone (BUILD_V26 Phase 29). Everything here is plain functions of what's stored, so Today,
 * the notification scheduler and the background task all plan the same day the same way.
 *
 * - **Moves** come from `dayCandidates`: today's plan, missions you've started, birthdays inside a week, and habits not
 *   done yet. Nothing is made up: a real account with nothing planned or started has no moves.
 * - **The day's shape** comes from what's known: readiness, sleep and the illness signal from Body (only with a health
 *   yes and readings), today's mood from Pulse, habits one miss from a second, and the Aim.
 * - **What you tend to do** is learned on this phone only (`choices['day-learning']`), from the moves you take or pass.
 *   The random draws repeat all day, so Today's order holds still.
 * - **Nudges** follow Settings, Notifications: the kinds you switched off never come, quiet hours are yours, and the
 *   bedtime reminder uses tonight's bedtime from Sleep.
 * The sample life (development builds) keeps the board's moves; see `state/today.ts`.
 */
import { useMemo } from 'react';
import {
  addDays, bodyToday, contextKey, dayCandidates, dayNudges, dayRandom, freeGaps, instantAt, learnedBoost, lifeDay, localDate, planNudges,
  planToday, readLoops, recentMoveNudges, recordOutcome, TASK_CATALOG,
  type BanditState, type Busy, type CandidateSource, type DatedInput, type DayPlan, type HabitInput, type MissionInput, type Mood, type Nudge,
  type NudgeLogEntry, type PlanContext, type PlannedMove, type PlannedNudge, type QuietHours,
} from '@life/core';
import { hasRealHealth } from '@/services/health/consent';
import { isOnLocalDay } from './dayCore';
import { deviceTimeZone, missionStepList } from './loops';
import { kindOf } from './people';
import { quietHours as QUIET_DEFAULT, notifGroups } from './settings';
import { useSeed, type SeedData } from './SeedProvider';
import { useLocalDay } from './day';

export const LEARNING_KEY = 'day-learning';
export const NUDGE_LOG_KEY = 'nudge-log';
export const DECIDED_KEY = 'today-decided';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MOODS: readonly Mood[] = ['calm', 'driven', 'restless', 'anxious', 'drained', 'peaceful'];
const BIRTHDAY_LEAD_DAYS = 7;

const parse = <T,>(raw: string | undefined, fallback: T, ok: (v: unknown) => boolean): T => {
  if (!raw) return fallback;
  try { const v = JSON.parse(raw) as unknown; return ok(v) ? v as T : fallback; } catch { return fallback; }
};
const isRecord = (v: unknown) => !!v && typeof v === 'object' && !Array.isArray(v);
export const readBandit = (raw: string | undefined): BanditState => parse<BanditState>(raw, {}, isRecord);
export const readNudgeLog = (raw: string | undefined): NudgeLogEntry[] =>
  parse<NudgeLogEntry[]>(raw, [], v => Array.isArray(v)).filter(e => e && typeof e.id === 'string' && typeof e.at === 'number' && typeof e.kind === 'string');

/** The area the Aim serves, for "For your Aim". A home, savings or debt Aim is a money Aim; the rest stay untagged. */
export function aimAreaOf(data: Pick<SeedData, 'aim' | 'choices'>): string | null {
  if (data.choices['aim-area']) return data.choices['aim-area'];
  if (!data.aim) return null;
  return /\b(flat|home|house|deposit|save|saving|savings|money|debt|isa|mortgage|pension)\b/i.test(`${data.aim.what} ${data.aim.give}`) ? 'money' : null;
}

function moodToday(data: Pick<SeedData, 'pulseLog'>, now: number): Mood | null {
  const day = localDate(now, deviceTimeZone());
  const last = [...data.pulseLog].reverse().find(e => isOnLocalDay(e.at, day));
  return last && (MOODS as readonly string[]).includes(last.moodId) ? last.moodId as Mood : null;
}

/** Missions with a step ticked and not finished, newest catalogue order. Never the sample's chosen mission. */
function missionsInProgress(data: Pick<SeedData, 'missionSteps' | 'completed'>): MissionInput[] {
  const ticked = Object.entries(data.missionSteps).filter(([, v]) => v).map(([k]) => /^(.*)-\d+$/.exec(k)?.[1]).filter((id): id is string => !!id);
  return [...new Set(ticked)].filter(id => !data.completed.includes(id)).flatMap(id => {
    const task = TASK_CATALOG.find(t => t.id === id);
    if (!task) return [];
    const steps = missionStepList(id), next = steps.findIndex((_, i) => !data.missionSteps[`${id}-${i}`]);
    const area = task.category === 'health' ? 'body' : task.category === 'tax' || task.lifeArea === 'money' ? 'money' : 'admin';
    return [{ id, title: task.shortTitle, area, ...(next >= 0 && steps[next].minutes ? { minutes: steps[next].minutes } : {}), ...(task.estimatedValueAmount ? { valueGBP: task.estimatedValueAmount } : {}) }];
  });
}

/** Birthdays and anniversaries inside a week, from Your people. Memorial dates are never a move. */
function datedFromPeople(people: SeedData['people'], now: number, timeZone: string): DatedInput[] {
  const today = localDate(now, timeZone), year = Number(today.slice(0, 4));
  return people.flatMap(p => {
    const m = /^(\d{1,2}) ([A-Za-z]+)$/.exec(p.date ?? ''), month = m ? MONTHS.indexOf(m[2]) : -1;
    const kind = kindOf(p);
    if (!m || month < 0 || kind === 'memorial') return [];
    const key = (y: number) => `${y}-${String(month + 1).padStart(2, '0')}-${String(Number(m[1])).padStart(2, '0')}`;
    const date = key(year) >= today ? key(year) : key(year + 1);
    const first = /^(Grandma|Grandad|Grandpa|Nana|Auntie|Aunt|Uncle)\b/.test(p.name) ? p.name : p.name.split(' ')[0];
    const title = kind === 'anniversary' ? 'Plan something for your anniversary' : `Plan something for ${first}’s birthday`;
    return [{ id: `person-${p.id}`, kind: 'people' as const, title, at: instantAt(date, 9 * 60, timeZone), leadDays: BIRTHDAY_LEAD_DAYS, minutes: 10 }];
  });
}

const habitsOf = (data: Pick<SeedData, 'habits'>): HabitInput[] => data.habits.map(h => ({ id: h.id, name: h.name, done: !!h.last14[13] }));
/** A habit missed yesterday and not done today: one miss from a second. */
export const habitsAtRisk = (data: Pick<SeedData, 'habits'>) => data.habits.filter(h => h.last14[12] === false && !h.last14[13]).map(h => ({ id: h.id, name: h.name }));

/** Readiness, sleep and the illness signal, only with a health yes and readings. */
function bodyContext(data: SeedData, now: number, timeZone: string): Pick<PlanContext, 'readiness' | 'sleepShortfall3' | 'averageSleep3' | 'illness'> & { bedtime: number | null } {
  if (!hasRealHealth(data)) return { bedtime: null };
  const body = bodyToday({ days: data.health.days, today: lifeDay(now, timeZone) });
  const readiness = body.readiness.status === 'ready' ? body.readiness.score : null;
  const nights = body.sleep ? body.sleep.week.slice(-3).filter((n): n is number => typeof n === 'number') : [];
  const need = body.sleep?.need.minutes ?? 0;
  return {
    readiness,
    illness: body.signals.illness,
    ...(nights.length === 3 && need ? { sleepShortfall3: nights.reduce((s, n) => s + Math.max(0, need - n), 0), averageSleep3: nights.reduce((s, n) => s + n, 0) / 3 } : {}),
    bedtime: body.sleep?.plan.find(p => p.goal === 'enough')?.bedtime ?? body.sleep?.plan[0]?.bedtime ?? null,
  };
}

export interface BuiltDay {
  plan: DayPlan;
  /** Where each move came from, by move id. */
  sources: Record<string, CandidateSource>;
  /** The kind of day, for learning. */
  context: string;
  day: string;
  bedtime: number | null;
}

export function buildDay(data: SeedData, now: number, timeZone = deviceTimeZone()): BuiltDay {
  const day = lifeDay(now, timeZone);
  const loops = readLoops(data.loops);
  const done = new Set(Object.entries(data.missionSteps).filter(([, v]) => v).map(([k]) => k));
  const sources = dayCandidates({
    now, timeZone, loops, done, aimArea: aimAreaOf(data),
    priorities: loops.plans[day]?.items ?? [],
    missions: missionsInProgress(data),
    dated: datedFromPeople(data.people, now, timeZone),
    habits: habitsOf(data),
  });
  const body = bodyContext(data, now, timeZone);
  const mood = moodToday(data, now);
  const { bedtime, ...health } = body;
  const ctx: PlanContext = {
    now, timeZone, mood, ...health,
    habitsAtRisk: habitsAtRisk(data),
    hasAim: !!data.aim,
    recentNudges: recentMoveNudges(readNudgeLog(data.choices[NUDGE_LOG_KEY])),
    learning: { state: readBandit(data.choices[LEARNING_KEY]), random: dayRandom(day) },
  };
  return {
    plan: planToday(sources.map(s => s.candidate), ctx),
    sources: Object.fromEntries(sources.map(s => [s.candidate.id, s])),
    context: contextKey({ readiness: health.readiness, mood, now, timeZone }),
    day, bedtime,
  };
}

/** The moves on today's deck, in order: the next move, then the two worth doing. */
export const deckMoves = (plan: DayPlan): PlannedMove[] => [plan.next, ...plan.worthDoing].filter((m): m is PlannedMove => !!m);

/** Quiet hours from Settings: 21:00 to 08:00 unless changed, or none if switched off. */
export function quietOf(data: Pick<SeedData, 'choices' | 'flags'>): QuietHours {
  if (data.flags['quiet-hours-off']) return { start: 0, end: 0 };
  const from = Number(data.choices['quiet-from'] ?? QUIET_DEFAULT.from), until = Number(data.choices['quiet-until'] ?? QUIET_DEFAULT.until);
  return { start: (Number.isFinite(from) ? from : QUIET_DEFAULT.from) * 60, end: (Number.isFinite(until) ? until : QUIET_DEFAULT.until) * 60 };
}

/** The kinds switched off in Settings (recall starts off, as the board shows). */
export function kindsOff(data: Pick<SeedData, 'flags'>): Set<string> {
  const off = new Set<string>();
  for (const k of notifGroups.flatMap(g => g.kinds)) {
    const flag = data.flags[`notification-off-${k.key}`];
    if (flag === undefined ? !k.on : flag) off.add(k.key);
  }
  return off;
}

/** Everything life could send today and tomorrow, before the cap. `busy` is today's calendar, when shared. */
/** A move from money or health keeps its name off the lock screen (fix F-28). */
const privateMove = (source: { area?: string; candidate: { kind: string } } | undefined) => !!source && (source.area === 'money' || source.area === 'body' || source.candidate.kind === 'health');

export function nudgesFor(data: SeedData, now: number, busy: Busy[] | null, timeZone = deviceTimeZone()): Nudge[] {
  if (!data.prefs.notifications) return [];
  const built = buildDay(data, now, timeZone);
  const today = localDate(now, timeZone);
  const gaps = busy ? freeGaps(busy, now, instantAt(addDays(today, 1), 0, timeZone)) : null;
  const next = built.plan.next;
  const loops = readLoops(data.loops);
  const tomorrow = addDays(built.day, 1);
  return dayNudges({
    now, timeZone, gaps, off: kindsOff(data),
    next: next ? { id: next.id, title: next.title, minutes: built.sources[next.id]?.candidate.minutes, private: privateMove(built.sources[next.id]) } : null,
    deadlines: [],
    habitsAtRisk: habitsAtRisk(data),
    recallDue: 0,
    bedtime: built.bedtime,
    checkIn: {
      style: loops.checkIn,
      ctx: {
        now, timeZone, plannedToday: !!loops.plans[built.day], plannedTomorrow: !!loops.plans[tomorrow],
        skippedToday: !!loops.skipped[built.day], skippedTomorrow: !!loops.skipped[tomorrow],
        unfinished: Object.values(loops.marks).some(m => m.state === 'started'), dueSoon: false,
      },
    },
  });
}

/** The phone's schedule and the log to keep, from what's stored now. */
export function scheduleFor(data: SeedData, now: number, busy: Busy[] | null, timeZone = deviceTimeZone()): { planned: PlannedNudge[]; log: NudgeLogEntry[] } {
  return planNudges(nudgesFor(data, now, busy, timeZone), readNudgeLog(data.choices[NUDGE_LOG_KEY]), { timeZone, quiet: quietOf(data) }, now);
}

/** Today's choices on the deck, by move id: taken or passed. */
export function readDecided(raw: string | undefined, day: string): Record<string, 'y' | 'n'> {
  if (!raw) return {};
  const [d, rest = ''] = raw.split('|');
  if (d !== day) return {};
  return Object.fromEntries(rest.split(',').filter(Boolean).map(p => { const i = p.lastIndexOf(':'); return [p.slice(0, i), p.slice(i + 1) === 'y' ? 'y' : 'n'] as const; }));
}
const writeDecided = (day: string, decided: Record<string, 'y' | 'n'>) => `${day}|${Object.entries(decided).map(([k, v]) => `${k}:${v}`).join(',')}`;

/** Today's plan for a real account, and taking or passing a move (which is also what life learns from). */
export function useDayPlan() {
  const { data, update } = useSeed();
  const { now } = useLocalDay();
  const minute = Math.floor(now.getTime() / 60_000);
  const built = useMemo(() => buildDay(data, minute * 60_000), [data.loops, data.missionSteps, data.completed, data.people, data.habits, data.health, data.pulseLog, data.aim, data.choices[LEARNING_KEY], data.choices[NUDGE_LOG_KEY], minute]); // eslint-disable-line react-hooks/exhaustive-deps
  const decided = readDecided(data.choices[DECIDED_KEY], built.day);
  const moves = deckMoves(built.plan);
  const decide = (move: PlannedMove, choice: 'take' | 'pass') => update(c => {
    const state = recordOutcome(readBandit(c.choices[LEARNING_KEY]), move.kind, built.context, choice === 'take' ? 'done' : 'skipped');
    const next = { ...readDecided(c.choices[DECIDED_KEY], built.day), [move.id]: choice === 'take' ? 'y' as const : 'n' as const };
    return { ...c, choices: { ...c.choices, [LEARNING_KEY]: JSON.stringify(state), [DECIDED_KEY]: writeDecided(built.day, next) } };
  });
  const reset = () => update(c => ({ ...c, choices: { ...c.choices, [DECIDED_KEY]: writeDecided(built.day, {}) } }));
  return {
    ...built,
    moves,
    left: moves.filter(m => !decided[m.id]),
    taken: moves.filter(m => decided[m.id] === 'y'),
    decided: Object.keys(decided).length,
    decide, reset,
  };
}

/** How sure life is about a kind of move on a day like today, for "Why am I seeing this?". */
export function learnedNote(data: Pick<SeedData, 'choices'>, kind: string, context: string, day: string): string | null {
  const l = learnedBoost(readBandit(data.choices[LEARNING_KEY]), kind, context, dayRandom(day));
  if (l.seen < 3) return null;
  return `You’ve taken ${Math.round(l.rate * 100)}% of moves like this on days like today.`;
}
