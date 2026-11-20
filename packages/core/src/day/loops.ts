/**
 * The three core loops (Life 1.0, `docs/life-1.0/core-loops/README.md`): Plan ahead, Get unstuck, See what's changing.
 * Pure functions over one small, JSON-safe state so the phone can keep it in its local store and a relaunch restores it.
 *
 * - **Plan ahead.** "What's most important to you tomorrow?" Several priorities, in the person's order, some in their own
 *   words. A plan belongs to one life day (04:00 to 04:00, `time/zone.ts`); nothing rolls over by itself.
 * - **Get unstuck.** One step that fits the time someone actually has, with the reason. Only a real checklist step with a
 *   size is offered; a step that doesn't fit is never squeezed in, and with nothing that fits the answer says so.
 * - **See what's changing.** Only explicit ticks count, partial work shows as partial, and what counts as a win is the
 *   person's choice. Check-ins follow the style they picked: regular, only when life notices something, or off.
 */
import { addDays, instantAt, lifeDay, localMinutes, DAY_STARTS_AT, type DateKey } from '../time/zone';
import type { NotificationCandidate } from './notifications';

/** The slot sizes life offers steps for, in minutes. */
export const STEP_SIZES = [2, 5, 10, 20] as const;
export type CheckInStyle = 'regular' | 'noticed' | 'off';
export const CHECK_IN_STYLES: readonly CheckInStyle[] = ['regular', 'noticed', 'off'];
/** From this local time, the question is about tomorrow. */
export const EVENING_FROM = 17 * 60;
/** In-app evening prompts start here; morning prompts run until noon. */
export const EVENING_PROMPT_FROM = 18 * 60;
export const MORNING_PROMPT_UNTIL = 12 * 60;
/** A day's list stays short enough to read at a glance. */
export const MAX_PRIORITIES = 6;
/** Plans and ticks older than this are pruned when the state is written. */
export const KEEP_DAYS = 90;

/** One step of a priority's checklist. `key` is global: a mission step uses the mission's own step key. */
export interface PlanStep { key: string; title: string; minutes?: number; to?: string; mission?: string }
export interface Priority { id: string; text: string; own: boolean; area?: string; mission?: string; steps: PlanStep[] }
export interface DayPlanEntry { items: Priority[]; savedAt: string }
/** A tick the person made. The title and priority are kept, so history reads the same after the list changes. */
export interface StepMark { state: 'started' | 'done'; at: string; title: string; priority: string; area?: string; to?: string; mission?: string }
export interface LoopsState {
  plans: Record<DateKey, DayPlanEntry>;
  skipped: Record<DateKey, string>;
  marks: Record<string, StepMark>;
  checkIn: CheckInStyle;
  /** Areas that count as a win for this person (`admin`, `money`, `body`, `people`, `time`, `learning`). Empty: everything counts. */
  wins: string[];
}

export const emptyLoops = (): LoopsState => ({ plans: {}, skipped: {}, marks: {}, checkIn: 'regular', wins: [] });

/** Fills in anything a stored state lacks, so an older or partial copy still reads. */
export function readLoops(raw: unknown): LoopsState {
  const base = emptyLoops();
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
  const r = raw as Partial<LoopsState>;
  const record = <T,>(v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, T> : {});
  return {
    plans: record<DayPlanEntry>(r.plans), skipped: record<string>(r.skipped), marks: record<StepMark>(r.marks),
    checkIn: CHECK_IN_STYLES.includes(r.checkIn as CheckInStyle) ? r.checkIn as CheckInStyle : base.checkIn,
    wins: Array.isArray(r.wins) ? r.wins.filter((w): w is string => typeof w === 'string') : [],
  };
}

/* ───────────────────────── Plan ahead ───────────────────────── */

/** Which day the question is about: tomorrow from the evening until the life day ends at 04:00, otherwise today. */
export function planTargetDay(now: number, timeZone: string, dayStartsAt = DAY_STARTS_AT): { day: DateKey; when: 'today' | 'tomorrow' } {
  const today = lifeDay(now, timeZone, dayStartsAt);
  const minutes = localMinutes(now, timeZone);
  const evening = minutes >= EVENING_FROM || minutes < dayStartsAt;
  return evening ? { day: addDays(today, 1), when: 'tomorrow' } : { day: today, when: 'today' };
}

/** Trims, drops blanks and repeats (case and spacing ignored, first kept), and keeps the person's order. */
export function cleanPriorities(items: readonly Priority[], max = MAX_PRIORITIES): Priority[] {
  const seen = new Set<string>();
  const out: Priority[] = [];
  for (const p of items) {
    const text = p.text.replace(/\s+/g, ' ').trim();
    const key = text.toLowerCase();
    if (!text || seen.has(key)) continue;
    seen.add(key);
    out.push({ ...p, text });
    if (out.length >= max) break;
  }
  return out;
}

const iso = (t: number) => new Date(t).toISOString();

function prune(state: LoopsState, now: number): LoopsState {
  const cutoff = now - KEEP_DAYS * 86_400_000;
  const oldDay = iso(cutoff).slice(0, 10);
  const plans = Object.fromEntries(Object.entries(state.plans).filter(([d]) => d >= oldDay));
  const skipped = Object.fromEntries(Object.entries(state.skipped).filter(([d]) => d >= oldDay));
  const marks = Object.fromEntries(Object.entries(state.marks).filter(([, m]) => Date.parse(m.at) >= cutoff));
  return { ...state, plans, skipped, marks };
}

/** Saves a day's priorities, replacing what was there. Saving none clears the day. Planning clears a skip. */
export function savePlan(state: LoopsState, day: DateKey, items: readonly Priority[], now: number): LoopsState {
  const clean = cleanPriorities(items);
  const plans = { ...state.plans };
  if (clean.length) plans[day] = { items: clean, savedAt: iso(now) };
  else delete plans[day];
  const skipped = { ...state.skipped };
  if (clean.length) delete skipped[day];
  return prune({ ...state, plans, skipped }, now);
}

/** "Not tonight": remembered for that day only, so life doesn't ask again about it. */
export function skipPlan(state: LoopsState, day: DateKey, now: number): LoopsState {
  return prune({ ...state, skipped: { ...state.skipped, [day]: iso(now) } }, now);
}

export const planFor = (state: LoopsState, day: DateKey): DayPlanEntry | null => state.plans[day] ?? null;

/* ───────────────────────── Get unstuck ───────────────────────── */

const isDone = (key: string, state: LoopsState, done: ReadonlySet<string>) => done.has(key) || state.marks[key]?.state === 'done';

/** A priority's next unfinished step, in order (later steps wait for earlier ones). */
export function nextStep(priority: Priority, state: LoopsState, done: ReadonlySet<string>): { step: PlanStep; index: number } | null {
  const index = priority.steps.findIndex(s => !isDone(s.key, state, done));
  return index < 0 ? null : { step: priority.steps[index], index };
}

export type TimeSource = { kind: 'manual' } | { kind: 'calendar'; at: string; sample: boolean };
export type Offer =
  | { kind: 'step'; step: PlanStep; priority: Priority; index: number; total: number; resumed: boolean; why: string[] }
  /** `needsSteps`: priorities with no steps yet. `unsized`: next steps without a size, which life can't fit to a slot. */
  | { kind: 'none'; reason: 'nothing-planned' | 'no-steps' | 'too-big' | 'all-done'; smallest?: number; needsSteps: Priority[]; unsized: { priority: Priority; step: PlanStep }[] };

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth'];

/**
 * One step that fits `minutes`. A step you started comes back first; then each priority in your order offers its next
 * unfinished step if it has a size and fits. `skip` holds steps passed over with "Something else".
 */
export function offerStep(input: { priorities: readonly Priority[]; state: LoopsState; done: ReadonlySet<string>; minutes: number; time: TimeSource; skip?: readonly string[] }): Offer {
  const { priorities, state, done, minutes, time } = input;
  const skip = new Set(input.skip ?? []);
  if (!priorities.length) return { kind: 'none', reason: 'nothing-planned', needsSteps: [], unsized: [] };
  const timeWords = time.kind === 'calendar'
    ? `the ${time.sample ? 'sample ' : ''}calendar shows ${minutes} free from ${time.at}`
    : `you said you have ${minutes}`;
  const offerFor = (priority: Priority, step: PlanStep, index: number, resumed: boolean): Offer => {
    const rank = priorities.indexOf(priority);
    return {
      kind: 'step', step, priority, index, total: priority.steps.length, resumed,
      why: [
        resumed ? `You started this for “${priority.text}”.` : `“${priority.text}” is ${ORDINALS[rank] ?? `number ${rank + 1}`} on your list.`,
        `About ${step.minutes} minute${step.minutes === 1 ? '' : 's'}, and ${timeWords}.`,
      ],
    };
  };
  const fits = (s: PlanStep) => typeof s.minutes === 'number' && s.minutes > 0 && s.minutes <= minutes && !skip.has(s.key);

  // A started step comes back first, if it still fits.
  const started = Object.entries(state.marks).filter(([, m]) => m.state === 'started').sort((a, b) => b[1].at.localeCompare(a[1].at));
  for (const [key] of started) {
    if (done.has(key)) continue;
    for (const p of priorities) {
      const index = p.steps.findIndex(s => s.key === key);
      if (index >= 0 && fits(p.steps[index])) return offerFor(p, p.steps[index], index, true);
    }
  }

  const needsSteps: Priority[] = [];
  const unsized: { priority: Priority; step: PlanStep }[] = [];
  let smallest: number | undefined;
  let anyLeft = false;
  for (const p of priorities) {
    if (!p.steps.length) { needsSteps.push(p); continue; }
    const next = nextStep(p, state, done);
    if (!next) continue;
    anyLeft = true;
    if (fits(next.step)) return offerFor(p, next.step, next.index, false);
    if (typeof next.step.minutes !== 'number') unsized.push({ priority: p, step: next.step });
    else if (!skip.has(next.step.key)) smallest = Math.min(smallest ?? Infinity, next.step.minutes);
  }
  if (anyLeft) return smallest !== undefined ? { kind: 'none', reason: 'too-big', smallest, needsSteps, unsized } : { kind: 'none', reason: 'too-big', needsSteps, unsized };
  if (needsSteps.length) return { kind: 'none', reason: 'no-steps', needsSteps, unsized };
  return { kind: 'none', reason: 'all-done', needsSteps: [], unsized: [] };
}

/** Adds a step, in your words and with a size, to the end of a priority on that day's list. */
export function addStep(state: LoopsState, day: DateKey, priorityId: string, title: string, minutes: number | undefined, now: number): LoopsState {
  const entry = state.plans[day], text = title.replace(/\s+/g, ' ').trim();
  if (!entry || !text) return state;
  const items = entry.items.map(p => {
    if (p.id !== priorityId) return p;
    let n = p.steps.length + 1;
    while (p.steps.some(s => s.key === `${p.id}:${n}`)) n++;
    return { ...p, steps: [...p.steps, { key: `${p.id}:${n}`, title: text, ...(minutes ? { minutes } : {}) }] };
  });
  return prune({ ...state, plans: { ...state.plans, [day]: { ...entry, items } } }, now);
}

/** Gives a step a size, so life can fit it to a slot. */
export function sizeStep(state: LoopsState, day: DateKey, priorityId: string, key: string, minutes: number): LoopsState {
  const entry = state.plans[day];
  if (!entry) return state;
  const items = entry.items.map(p => p.id !== priorityId ? p : { ...p, steps: p.steps.map(s => s.key === key ? { ...s, minutes } : s) });
  return { ...state, plans: { ...state.plans, [day]: { ...entry, items } } };
}

/**
 * Unfinished priorities from the most recent earlier plan in the last week, offered (never added) when planning a new
 * day, with their progress kept because the steps keep their keys. Ones already on that day's list are left out.
 */
export function carryOver(state: LoopsState, day: DateKey, done: ReadonlySet<string>): Priority[] {
  const earlier = Object.keys(state.plans).filter(d => d < day && d >= addDays(day, -7)).sort().reverse()[0];
  if (!earlier) return [];
  const already = new Set((state.plans[day]?.items ?? []).map(p => p.id));
  return state.plans[earlier].items.filter(p => !already.has(p.id) && (p.steps.length === 0 || p.steps.some(s => !isDone(s.key, state, done))));
}

/* ───────────────────────── Resume and record ───────────────────────── */

const markFor = (step: PlanStep, priority: Priority, state: StepMark['state'], now: number): StepMark => ({
  state, at: iso(now), title: step.title, priority: priority.text,
  ...(priority.area ? { area: priority.area } : {}), ...(step.to ? { to: step.to } : {}), ...(step.mission ?? priority.mission ? { mission: step.mission ?? priority.mission } : {}),
});

/** Marks a step started. A step already started keeps its first time; a done step stays done. */
export function startStep(state: LoopsState, step: PlanStep, priority: Priority, now: number): LoopsState {
  if (state.marks[step.key]) return state;
  return prune({ ...state, marks: { ...state.marks, [step.key]: markFor(step, priority, 'started', now) } }, now);
}

/** Marks a step done. Doing it twice changes nothing. */
export function finishStep(state: LoopsState, step: PlanStep, priority: Priority, now: number): LoopsState {
  if (state.marks[step.key]?.state === 'done') return state;
  return prune({ ...state, marks: { ...state.marks, [step.key]: markFor(step, priority, 'done', now) } }, now);
}

/** Back to untouched. */
export function undoStep(state: LoopsState, key: string): LoopsState {
  if (!state.marks[key]) return state;
  const marks = { ...state.marks };
  delete marks[key];
  return { ...state, marks };
}

/** The step you most recently started and haven't finished (a mission step ticked on its own screen counts as finished). */
export function activeStep(state: LoopsState, done: ReadonlySet<string>): { key: string; mark: StepMark } | null {
  const open = Object.entries(state.marks).filter(([key, m]) => m.state === 'started' && !done.has(key)).sort((a, b) => b[1].at.localeCompare(a[1].at));
  return open[0] ? { key: open[0][0], mark: open[0][1] } : null;
}

/* ───────────────────────── See what's changing ───────────────────────── */

export interface PriorityProgress { id: string; text: string; done: number; total: number; started: boolean; complete: boolean }

/** How far each of a day's priorities has moved: ticks only, partial work as partial. */
export function planProgress(entry: DayPlanEntry, state: LoopsState, done: ReadonlySet<string>): PriorityProgress[] {
  return entry.items.map(p => {
    const doneCount = p.steps.filter(s => isDone(s.key, state, done)).length;
    const started = p.steps.some(s => state.marks[s.key]?.state === 'started' && !done.has(s.key));
    return { id: p.id, text: p.text, done: doneCount, total: p.steps.length, started, complete: p.steps.length > 0 && doneCount === p.steps.length };
  });
}

export type DoneStep = StepMark & { key: string };

/** Steps ticked done in the last seven life days, newest first; the priorities they moved; and the ones that count as wins. */
export function weekProgress(state: LoopsState, now: number, timeZone: string, _done: ReadonlySet<string>): { steps: DoneStep[]; priorities: string[]; wins: DoneStep[] } {
  const from = instantAt(addDays(lifeDay(now, timeZone), -6), DAY_STARTS_AT, timeZone);
  const steps = Object.entries(state.marks)
    .filter(([, m]) => m.state === 'done' && Date.parse(m.at) >= from && Date.parse(m.at) <= now)
    .map(([key, m]) => ({ ...m, key }))
    .sort((a, b) => b.at.localeCompare(a.at));
  const priorities = [...new Set(steps.map(s => s.priority))];
  const wins = state.wins.length ? steps.filter(s => s.area && state.wins.includes(s.area)) : steps;
  return { steps, priorities, wins };
}

/* ───────────────────────── Check-ins ───────────────────────── */

export interface CheckInContext {
  now: number; timeZone: string;
  plannedToday: boolean; plannedTomorrow: boolean; skippedToday: boolean; skippedTomorrow: boolean;
  /** A step was started and left. */
  unfinished: boolean;
  /** Something is due within a day. */
  dueSoon: boolean;
}
export type CheckInPrompt = 'plan-tomorrow' | 'plan-today' | null;

/**
 * Whether Today asks the planning question now. Regular: every evening, and in the morning if today isn't planned.
 * When life notices something: only with a reason (a step left unfinished, something due soon). Off: never. Planning
 * is always reachable by hand; this only decides whether life asks.
 */
export function checkInPrompt(style: CheckInStyle, ctx: CheckInContext): CheckInPrompt {
  if (style === 'off') return null;
  const minutes = localMinutes(ctx.now, ctx.timeZone);
  const evening = minutes >= EVENING_PROMPT_FROM || minutes < DAY_STARTS_AT;
  const morning = !evening && minutes < MORNING_PROMPT_UNTIL;
  const reason = style === 'regular' || ctx.unfinished || ctx.dueSoon;
  if (evening && !ctx.plannedTomorrow && !ctx.skippedTomorrow && reason) return 'plan-tomorrow';
  if (morning && !ctx.plannedToday && !ctx.skippedToday && reason) return 'plan-today';
  return null;
}

/**
 * What a check-in would send, for the notification scheduler (`scheduleNotifications`, one a day, quiet hours) once
 * Phase 29 sends notifications. Regular: the evening question at 20:00. When life notices something: a "pick up where
 * you left off" at 17:00 if a step was left. Off: nothing. Low priority, so a real deadline always wins the day.
 */
export function checkInNotifications(style: CheckInStyle, ctx: CheckInContext): NotificationCandidate[] {
  if (style === 'off') return [];
  const today = lifeDay(ctx.now, ctx.timeZone);
  const out: NotificationCandidate[] = [];
  if (style === 'regular' && !ctx.plannedTomorrow && !ctx.skippedTomorrow) {
    const earliest = instantAt(today, 20 * 60, ctx.timeZone);
    out.push({ id: `plan-tomorrow-${today}`, kind: 'plan-tomorrow', priority: 1, earliest, latest: instantAt(today, 20 * 60 + 55, ctx.timeZone) });
  }
  if (style === 'noticed' && ctx.unfinished) {
    const earliest = instantAt(today, 17 * 60, ctx.timeZone);
    out.push({ id: `pick-up-${today}`, kind: 'pick-up', priority: 1, earliest, latest: instantAt(today, 20 * 60 + 55, ctx.timeZone) });
  }
  return out;
}
