/**
 * The three core loops on the phone: Plan ahead, Get unstuck, See what's changing. The rules live in
 * `packages/core/src/day/loops.ts`; this file joins them to the local store (`SeedData.loops`, saved with everything
 * else and restored on relaunch), to missions (a mission's steps keep the mission's own step keys, so ticking a step
 * here or on the mission is the same tick) and to the calendar, which is only ever sample data in a development build.
 */
import { useMemo } from 'react';
import {
  TASK_CATALOG, activeStep, addStep, carryOver, finishStep, lifeDay, offerStep, planFor, planProgress, planTargetDay, readLoops, savePlan,
  sizeStep, skipPlan, startStep, undoStep, weekProgress, checkInPrompt, type CheckInStyle, type LoopsState, type PlanStep, type Priority,
} from '@life/core';
import type { ScreenKey } from '@/navigation/screens';
import { useSeed, type SeedData } from './SeedProvider';
import { useLocalDay } from './day';
import { SHOW_SAMPLES } from './sample';
import { money, seedTaxClaim } from './seed';
import { dayShape } from './today';

/** The phone's own time zone; London if the platform can't say. */
export function deviceTimeZone(): string {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/London'; } catch { return 'Europe/London'; }
}

/**
 * The sample life's tax rebate has the board's three sized steps (with her £1,240 of kit); every other mission, and the
 * rebate in a real account, uses the engine's steps, unsized until you size them.
 */
export function missionStepList(taskId: string): { title: string; minutes?: number }[] {
  if (SHOW_SAMPLES && taskId === 'uk-hmrc-tax-code') return [{ title: 'Sign in to Government Gateway', minutes: 1 }, { title: `Add ${money(seedTaxClaim.workExpenses)} of software and kit`, minutes: 3 }, { title: 'Submit and save the reference', minutes: 2 }];
  return (TASK_CATALOG.find(t => t.id === taskId)?.steps ?? []).map(title => ({ title }));
}

/** A mission as a priority. Its steps open the mission, where the same ticks live. */
export function missionPriority(taskId: string): Priority | null {
  const task = TASK_CATALOG.find(t => t.id === taskId);
  if (!task) return null;
  const text = SHOW_SAMPLES && taskId === 'uk-hmrc-tax-code' ? 'Claim my tax rebate' : task.shortTitle;
  const area = task.category === 'health' ? 'body' : task.category === 'tax' || task.lifeArea === 'money' ? 'money' : 'admin';
  return { id: `mission:${taskId}`, text, own: false, area, mission: taskId, steps: missionStepList(taskId).map((s, i) => ({ key: `${taskId}-${i}`, title: s.title, ...(s.minutes ? { minutes: s.minutes } : {}), to: 'mission', mission: taskId })) };
}

/**
 * Starting points anyone can pick, each with small first steps that open the screen where the step happens. They are
 * suggestions in plain words, not things life knows about you.
 */
export const STARTERS: Priority[] = [
  { id: 'starter:paperwork', text: 'Get my paperwork ready', own: false, area: 'admin', steps: [
    { key: 'starter:paperwork:gather', title: 'Gather two documents you’ll need', minutes: 10, to: 'vault' },
    { key: 'starter:paperwork:scan', title: 'Photograph them into Life', minutes: 5, to: 'scan' },
    { key: 'starter:paperwork:note', title: 'Note what’s still missing', minutes: 2 },
  ] },
  { id: 'starter:time', text: 'Make time for something I care about', own: false, area: 'time', steps: [
    { key: 'starter:time:slot', title: 'Pick a 30-minute slot and keep it free', minutes: 2 },
    { key: 'starter:time:first', title: 'Do the first 20 minutes', minutes: 20 },
  ] },
  { id: 'starter:people', text: 'Get in touch with someone', own: false, area: 'people', steps: [
    { key: 'starter:people:who', title: 'Choose who to message', minutes: 2, to: 'people' },
    { key: 'starter:people:send', title: 'Send them a short message', minutes: 5 },
  ] },
];

/** What counts as a win: the person's choice, optional, and changeable. */
export const WIN_AREAS: { id: string; label: string }[] = [
  { id: 'admin', label: 'Clearing admin' }, { id: 'money', label: 'Money moving the right way' }, { id: 'body', label: 'Looking after my body' },
  { id: 'people', label: 'Staying close to people' }, { id: 'time', label: 'Time for what I care about' }, { id: 'learning', label: 'Learning something' },
];

export const CHECK_IN_WORDS: Record<CheckInStyle, { label: string; line: string; sub: string }> = {
  regular: { label: 'Regular', line: 'every evening', sub: 'Life asks about tomorrow each evening, and about today in the morning if you haven’t planned.' },
  noticed: { label: 'When needed', line: 'only when it notices something', sub: 'Life asks only when there’s a reason, like a step you started and left.' },
  off: { label: 'Off', line: 'never', sub: 'Life won’t ask. Planning and your progress stay on Today whenever you want them.' },
};

/** Whether there's a calendar to read at all: only the sample day in a development build until real calendars connect. */
export const SAMPLE_CALENDAR = SHOW_SAMPLES;

/** The calendar as life can see it. Real calendars aren't connected yet; a development build shows the sample day. */
export function calendarGap(now: Date): { at: string; minutes: number; sample: true } | null {
  if (!SHOW_SAMPLES) return null;
  const i = dayShape.blocks.findIndex(b => b.kind === 'gap');
  if (i < 0) return null;
  const at = dayShape.blocks[i].at, next = dayShape.blocks[i + 1]?.at;
  const toMin = (s: string) => Number(s.slice(0, 2)) * 60 + Number(s.slice(3, 5));
  const minutes = next ? toMin(next) - toMin(at) : 20;
  return now.getHours() * 60 + now.getMinutes() < toMin(at) + minutes ? { at, minutes, sample: true } : null;
}

const doneSet = (data: SeedData) => new Set(Object.entries(data.missionSteps).filter(([, v]) => v).map(([k]) => k));

/** Everything the three loops need on a screen, from the local store. */
export function useLoops() {
  const { data, update } = useSeed();
  const { now } = useLocalDay();
  const tz = deviceTimeZone();
  const at = now.getTime();
  const loops = useMemo(() => readLoops(data.loops), [data.loops]);
  const done = useMemo(() => doneSet(data), [data.missionSteps]); // eslint-disable-line react-hooks/exhaustive-deps
  const today = lifeDay(at, tz), target = planTargetDay(at, tz);
  const tomorrow = target.when === 'tomorrow' ? target.day : null;
  const todayPlan = planFor(loops, today), tomorrowPlan = tomorrow ? planFor(loops, tomorrow) : null;
  const active = activeStep(loops, done);
  const write = (apply: (s: LoopsState, d: SeedData) => LoopsState) => update(c => ({ ...c, loops: apply(readLoops(c.loops), c) }));

  /**
   * Ideas for a day's list: priorities still going from the last plan (with their progress), missions you've started,
   * then the starting points. Ideas only: nothing is added until you pick it.
   */
  const ideasFor = (day: string): { carried: Priority[]; ideas: Priority[] } => {
    const carried = carryOver(loops, day, done);
    // From the catalogue, not today's eligible list: a mission you've started stays yours even if it's no longer suggested.
    const ticked = Object.entries(data.missionSteps).filter(([, v]) => v).map(([k]) => /^(.*)-\d+$/.exec(k)?.[1]).filter((id): id is string => !!id);
    const started = [...new Set([...(SHOW_SAMPLES && data.selectedMission ? [data.selectedMission] : []), ...ticked])].filter(id => !data.completed.includes(id));
    const missions = started.map(id => missionPriority(id)).filter((p): p is Priority => !!p).slice(0, 2);
    const seen = new Set(carried.map(p => p.text.toLowerCase()));
    const ideas = [...missions, ...STARTERS].filter(p => (seen.has(p.text.toLowerCase()) ? false : (seen.add(p.text.toLowerCase()), true)));
    return { carried, ideas };
  };

  /** A starting point picked again after it was finished gets fresh steps, so old ticks don't make it look done. */
  const prepare = (p: Priority, day: string): Priority => {
    if (p.mission || p.own || !p.steps.length || !p.steps.every(s => loops.marks[s.key]?.state === 'done')) return p;
    const id = `${p.id}@${day}`;
    return { ...p, id, steps: p.steps.map((s, i) => ({ ...s, key: `${id}:${i + 1}` })) };
  };

  /** Finds a step and its priority among a day's plans (today first), or in the suggestions for missions. */
  const locate = (key: string): { step: PlanStep; priority: Priority } | null => {
    for (const entry of [todayPlan, tomorrowPlan, ...Object.values(loops.plans)]) {
      for (const p of entry?.items ?? []) { const step = p.steps.find(s => s.key === key); if (step) return { step, priority: p }; }
    }
    const mission = /^(.*)-(\d+)$/.exec(key);
    const mp = mission ? missionPriority(mission[1]) : null;
    const step = mp?.steps.find(s => s.key === key);
    return mp && step ? { step, priority: mp } : null;
  };

  return {
    loops, done, today, target, tomorrow, todayPlan, tomorrowPlan, active, tz, now,
    progress: todayPlan ? planProgress(todayPlan, loops, done) : [],
    week: weekProgress(loops, at, tz, done),
    prompt: checkInPrompt(loops.checkIn, {
      now: at, timeZone: tz, plannedToday: !!todayPlan, plannedTomorrow: !!tomorrowPlan,
      skippedToday: !!loops.skipped[today], skippedTomorrow: !!(tomorrow && loops.skipped[tomorrow]), unfinished: !!active, dueSoon: false,
    }),
    ideasFor, prepare,
    /** Steps ticked done on a life day. */
    doneOn: (day: string) => weekProgress(loops, at, tz, done).steps.filter(st => lifeDay(Date.parse(st.at), tz) === day),
    offer: (minutes: number, skip: string[], time: Parameters<typeof offerStep>[0]['time']) => offerStep({ priorities: todayPlan?.items ?? [], state: loops, done, minutes, time, skip }),
    save: (day: string, items: Priority[]) => write(s => savePlan(s, day, items, Date.now())),
    skip: (day: string) => write(s => skipPlan(s, day, Date.now())),
    addStep: (day: string, priorityId: string, title: string, minutes?: number) => write(s => addStep(s, day, priorityId, title, minutes, Date.now())),
    sizeStep: (day: string, priorityId: string, key: string, minutes: number) => write(s => sizeStep(s, day, priorityId, key, minutes)),
    start: (step: PlanStep, priority: Priority) => write(s => startStep(s, step, priority, Date.now())),
    /** Done here is done on the mission too: one tick, one place. */
    finish: (step: PlanStep, priority: Priority) => update(c => ({
      ...c, loops: finishStep(readLoops(c.loops), step, priority, Date.now()),
      missionSteps: step.mission ? { ...c.missionSteps, [step.key]: true } : c.missionSteps,
    })),
    undo: (key: string) => update(c => ({ ...c, loops: undoStep(readLoops(c.loops), key), missionSteps: key in c.missionSteps ? { ...c.missionSteps, [key]: false } : c.missionSteps })),
    setCheckIn: (style: CheckInStyle) => write(s => ({ ...s, checkIn: style })),
    toggleWin: (id: string) => write(s => ({ ...s, wins: s.wins.includes(id) ? s.wins.filter(w => w !== id) : [...s.wins, id] })),
    locate,
  };
}

/** Opens the place a step happens: the mission, or the screen it names. */
export function stepRoute(step: { to?: string; mission?: string }): { to: ScreenKey; mission?: string } | null {
  if (step.mission) return { to: 'mission', mission: step.mission };
  return step.to ? { to: step.to as ScreenKey } : null;
}

/** "14:05" or "Thu 14:05", for when a step was started. */
export function whenStarted(iso: string, now: Date): string {
  const d = new Date(iso), time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  return d.toDateString() === now.toDateString() ? time : `${d.toLocaleDateString('en-GB', { weekday: 'short' })} ${time}`;
}
