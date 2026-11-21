/**
 * What can be a move today (Phase 29): the planner's candidates, built only from what this person has.
 *
 * - **Your plan for today.** Each priority offers its next unfinished step, marked as chosen, so it comes first.
 * - **Missions in progress**, unless that mission is already on today's plan.
 * - **Dated things** (birthdays, renewals, the MOT) only once they're inside their lead time.
 * - **Habits** not done yet today.
 * Nothing planned and nothing known gives no moves. A move is never made up.
 */
import { clamp } from '../math/stats';
import { emptyLoops, nextStep, type LoopsState, type PlanStep, type Priority } from './loops';
import type { Candidate, MoveKind } from './planner';

export interface MissionInput { id: string; title: string; minutes?: number; valueGBP?: number; dueAt?: number; area?: string }
export interface DatedInput { id: string; kind: MoveKind; title: string; at: number; leadDays: number; minutes?: number }
export interface HabitInput { id: string; name: string; done: boolean; minutes?: number }

export interface CandidateInput {
  now: number;
  timeZone: string;
  /** Today's plan, in the person's order. */
  priorities?: readonly Priority[];
  loops?: LoopsState;
  /** Steps ticked elsewhere (missions). */
  done?: ReadonlySet<string>;
  /** The area the Chief Aim serves, for aim fit. */
  aimArea?: string | null;
  missions?: readonly MissionInput[];
  dated?: readonly DatedInput[];
  habits?: readonly HabitInput[];
}

export interface CandidateSource {
  candidate: Candidate;
  from: 'plan' | 'mission' | 'dated' | 'habit';
  /** The priority a plan step belongs to, in the person's words. */
  priority?: string;
  priorityId?: string;
  step?: PlanStep;
  mission?: string;
  /** Where tapping it goes. */
  to?: string;
  /** The part of life it serves (`money`, `body`, `people`…), when known. Money and body keep a nudge's words general. */
  area?: string;
}

/** Steps this long or longer need focus. */
export const DEMANDING_MINUTES = 20;
const DAY = 86_400_000;

const AREA_KIND: Record<string, MoveKind> = { people: 'people', body: 'health', learning: 'lesson', time: 'routine', admin: 'admin', money: 'admin' };
const kindFor = (p: Priority): MoveKind => (p.mission ? 'mission' : AREA_KIND[p.area ?? ''] ?? 'admin');
const aimFor = (area: string | undefined, aimArea: string | null | undefined) => (aimArea && area === aimArea ? 1 : 0);
const sized = (minutes: number | undefined) => (minutes !== undefined && minutes > 0 ? { minutes, ...(minutes >= DEMANDING_MINUTES ? { demanding: true } : {}) } : {});

export function dayCandidates(input: CandidateInput): CandidateSource[] {
  const out: CandidateSource[] = [];
  const loops = input.loops ?? emptyLoops();
  const done = input.done ?? new Set<string>();
  const planned = new Set<string>();

  for (const p of input.priorities ?? []) {
    if (p.mission) planned.add(p.mission);
    const next = nextStep(p, loops, done);
    if (!next) continue;
    const { step } = next;
    const mission = step.mission ?? p.mission;
    const aim = aimFor(p.area, input.aimArea);
    out.push({
      candidate: { id: `plan:${step.key}`, kind: kindFor(p), title: step.title, chosen: true, ...sized(step.minutes), ...(aim ? { aimFit: aim } : {}) },
      from: 'plan', priority: p.text, priorityId: p.id, step,
      ...(mission ? { mission } : {}), ...(step.to ? { to: step.to } : {}), ...(p.area ? { area: p.area } : {}),
    });
  }

  for (const m of input.missions ?? []) {
    if (planned.has(m.id)) continue;
    const aim = aimFor(m.area, input.aimArea);
    out.push({
      candidate: {
        id: `mission:${m.id}`, kind: 'mission', title: m.title, ...sized(m.minutes),
        ...(m.valueGBP ? { valueGBP: m.valueGBP } : {}), ...(m.dueAt !== undefined ? { dueAt: m.dueAt } : {}), ...(aim ? { aimFit: aim } : {}),
      },
      from: 'mission', mission: m.id, to: 'mission', ...(m.area ? { area: m.area } : {}),
    });
  }

  for (const d of input.dated ?? []) {
    const left = d.at - input.now;
    if (left < 0 || left > clamp(d.leadDays, 0, 366) * DAY) continue;
    out.push({ candidate: { id: `dated:${d.id}`, kind: d.kind, title: d.title, dueAt: d.at, ...sized(d.minutes) }, from: 'dated' });
  }

  for (const h of input.habits ?? []) {
    if (h.done) continue;
    out.push({ candidate: { id: `habit:${h.id}`, kind: 'habit', title: h.name, ...sized(h.minutes) }, from: 'habit', to: 'habits' });
  }
  return out;
}
