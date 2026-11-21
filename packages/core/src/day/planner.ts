/**
 * `planToday()`: the day planner (SPEC §1.1, Phase 29). Rules first, then a score, then what this person tends to do.
 *
 *   score = urgency × 3 + aimFit × 2 + value × 1.5 + ease × 1 − fatigue (+ learned, learning.ts)
 *
 * Top one is the next move, the next two are worth doing today, everything else lives in Plan. The rules:
 * - A deadline inside 24 hours always comes first, whatever the mood, with calm copy.
 * - Readiness under 34, the illness signal, or 3 hours short on sleep over 3 nights: one demanding move at most;
 *   the other demanding moves wait for tomorrow, and a rest or take-it-easy card shows.
 * - Readiness 67 or more and feeling driven: the one bigger move (gambit) leads.
 * - Sleep 3 hours short over 3 nights: the health stack and caffeine cut-off cards, no new commitments after 20:00.
 * - Drained or anxious (or a day that has been heavy three weeks running): only what's due within 7 days, gentle copy,
 *   no glimpses.
 * - Payday: the payday sweep card. A hard day with under 70% of today's food eaten: the fuel card, before the evening.
 * - A habit one miss from a second: the never-miss-twice card. Moves that serve the Chief Aim are tagged.
 * - A step from your own plan for today (`chosen`) gets a boost as big as a deadline's urgency, so it leads.
 * Every move and every rule that fired carries a plain sentence for "Why am I seeing this?" (SPEC §1.3).
 */
import { clamp, round } from '../math/stats';
import { addDays, lifeDay, localMinutes, weekdayOf, type DateKey } from '../time/zone';
import { contextKey, learnedBoost, type BanditState } from './learning';

export type Mood = 'calm' | 'driven' | 'restless' | 'anxious' | 'drained' | 'peaceful';
export type MoveKind = 'mission' | 'habit' | 'routine' | 'gambit' | 'glimpse' | 'lesson' | 'health' | 'people' | 'admin';

export interface Candidate {
  id: string;
  kind: MoveKind;
  title: string;
  /** The deadline, as an instant. */
  dueAt?: number;
  /** Needs focus or effort: a form, a hard workout, a difficult call. */
  demanding?: boolean;
  minutes?: number;
  /** Money it's worth, £. */
  valueGBP?: number;
  /** Health value, 0 to 1. */
  healthValue?: number;
  /** How much it serves the Chief Aim, 0 to 1. */
  aimFit?: number;
  /** A new commitment that starts at this local clock time (minutes after midnight). */
  startsAt?: number;
  /** On the person's own plan for today: what they chose comes first. */
  chosen?: boolean;
}

export type CardId = 'rest-habit' | 'take-it-easy' | 'health-stack' | 'caffeine-cutoff' | 'fuel' | 'never-miss-twice' | 'payday-sweep';
export interface DayCard { id: CardId; why: string; habitId?: string }

export interface PlanContext {
  now: number;
  timeZone: string;
  readiness?: number | null;
  mood?: Mood | null;
  /** Shortfall against need over the last three nights, minutes (sleep.ts `recentShortfall`). */
  sleepShortfall3?: number;
  /** Average asleep over those three nights, minutes, for the explanation. */
  averageSleep3?: number;
  illness?: boolean;
  /** Today's load and the top of today's sweet spot (load.ts). */
  load?: { today: number; sweetSpotHigh: number };
  fuel?: { eatenKcal: number; targetKcal: number };
  habitsAtRisk?: readonly { id: string; name: string }[];
  /** The local date pay arrives. */
  payday?: DateKey | null;
  hasAim?: boolean;
  /** A heavy day by pattern (`heavyWeekdayPattern`). */
  lightDay?: boolean;
  /** Nudges shown in the last week and whether they were acted on, for fatigue. */
  recentNudges?: readonly { id: string; at: number; acted: boolean }[];
  /** What this person tends to do, and a random source to draw with. */
  learning?: { state: BanditState; random: () => number };
}

export type Tag = 'deadline' | 'due-soon' | 'for-your-aim';
export interface PlannedMove { id: string; kind: MoveKind; title: string; score: number; tags: Tag[]; why: string[] }

type Scored = PlannedMove & { demanding: boolean; deadline: boolean; dueAt?: number };

export interface DayPlan {
  next: PlannedMove | null;
  worthDoing: PlannedMove[];
  /** Everything else, for Plan. */
  later: PlannedMove[];
  /** Demanding moves pushed to tomorrow. */
  tomorrow: PlannedMove[];
  cards: DayCard[];
  tone: 'gentle' | 'steady' | 'bold';
  /** No new commitments after this local time (minutes), when sleep is short. */
  noNewCommitmentsAfter: number | null;
  showGlimpses: boolean;
  /** One sentence per rule that shaped today. */
  why: string[];
}

export const PLAN_WEIGHTS = { urgency: 3, aim: 2, value: 1.5, ease: 1 } as const;
/** Added for a step from the person's own plan: as much as a deadline's urgency, so what they chose leads. */
export const CHOSEN_WEIGHT = 3;
export const LOW_READINESS = 34;
export const HIGH_READINESS = 67;
export const SHORT_SLEEP_3_NIGHTS = 180;
export const LATE_COMMITMENT = 20 * 60;
const HOUR = 3_600_000;

const hm = (minutes: number) => { const m = Math.round(minutes); return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`; };
const pounds = (n: number) => `£${Math.round(n).toLocaleString('en-GB')}`;

function urgency(c: Candidate, now: number): number {
  if (c.dueAt === undefined) return 0.1;
  const hours = (c.dueAt - now) / HOUR;
  if (hours <= 24) return 1;
  return clamp(1 - hours / 24 / 30, 0.1, 0.95);
}

const moneyValue = (gbp = 0) => clamp(Math.log10(1 + Math.max(0, gbp)) / 3, 0, 1);

/** Moves that are heavy today: the demanding cap applies. */
interface Pressures { capDemanding: boolean; heavyMood: boolean; restless: boolean }

function ease(c: Candidate, p: Pressures): number {
  let e = 1 - clamp((c.minutes ?? 15) / 60, 0, 1) * 0.7;
  if (c.demanding && (p.capDemanding || p.heavyMood)) e *= 0.3;
  if (p.restless && (c.minutes ?? 15) <= 10) e = Math.min(1, e + 0.2);
  return e;
}

function fatigue(c: Candidate, ctx: PlanContext): number {
  const weekAgo = ctx.now - 7 * 24 * HOUR;
  const ignored = (ctx.recentNudges ?? []).filter(n => n.id === c.id && n.at >= weekAgo && !n.acted).length;
  return Math.min(2, ignored * 0.5);
}

export function planToday(candidates: readonly Candidate[], ctx: PlanContext): DayPlan {
  const why: string[] = [];
  const cards: DayCard[] = [];
  const today = lifeDay(ctx.now, ctx.timeZone);
  const readiness = typeof ctx.readiness === 'number' ? ctx.readiness : null;
  const lowReadiness = readiness !== null && readiness < LOW_READINESS;
  const shortSleep = (ctx.sleepShortfall3 ?? 0) >= SHORT_SLEEP_3_NIGHTS;
  const heavyMood = ctx.mood === 'drained' || ctx.mood === 'anxious' || !!ctx.lightDay;
  const pressures: Pressures = { capDemanding: lowReadiness || !!ctx.illness || shortSleep, heavyMood, restless: ctx.mood === 'restless' };
  const ledByGambit = readiness !== null && readiness >= HIGH_READINESS && ctx.mood === 'driven';

  if (lowReadiness) { why.push(`Readiness is low (${readiness}), so today has one demanding thing at most.`); cards.push({ id: 'rest-habit', why: 'Your body is asking for an easier day.' }); }
  if (ctx.illness) { why.push('Several body signals are outside your normal, so today is lighter.'); cards.push({ id: 'take-it-easy', why: 'A few signals are off at once. Take it easy, and NHS 111 can help if you feel unwell.' }); }
  if (shortSleep) {
    why.push(ctx.averageSleep3 ? `You’ve slept ${hm(ctx.averageSleep3)} on average, so today is lighter.` : 'You’re 3 hours short on sleep over three nights, so today is lighter.');
    cards.push({ id: 'health-stack', why: 'Three short nights in a row.' }, { id: 'caffeine-cutoff', why: 'Caffeine late in the day makes tonight’s sleep shorter.' });
  }
  if (heavyMood) why.push(ctx.mood === 'drained' || ctx.mood === 'anxious' ? `You’re feeling ${ctx.mood}, so only what’s due this week is showing.` : 'This day of the week has felt heavy lately, so it’s planned light.');
  if (ledByGambit) why.push('You’re feeling driven and well recovered, so the bigger move leads.');

  const out = { later: [] as Scored[], tomorrow: [] as Scored[] };
  const context = contextKey({ readiness, mood: ctx.mood, now: ctx.now, timeZone: ctx.timeZone });
  const scored: Scored[] = [];
  for (const c of candidates) {
    const hoursLeft = c.dueAt === undefined ? Infinity : (c.dueAt - ctx.now) / HOUR;
    const deadline = hoursLeft <= 24;
    const tags: Tag[] = [];
    const reasons: string[] = [];
    if (deadline) { tags.push('deadline'); reasons.push('Due within a day, so it comes first.'); }
    else if (hoursLeft <= 7 * 24) { tags.push('due-soon'); reasons.push(`Due in ${Math.max(1, Math.round(hoursLeft / 24))} days.`); }
    if (c.chosen) reasons.push('On your plan for today.');
    const aim = ctx.hasAim ? clamp(c.aimFit ?? 0, 0, 1) : 0;
    if (aim >= 0.5) { tags.push('for-your-aim'); reasons.push('For your Aim.'); }
    if ((c.valueGBP ?? 0) >= 10) reasons.push(`Worth about ${pounds(c.valueGBP!)}.`);
    let score = PLAN_WEIGHTS.urgency * urgency(c, ctx.now) + PLAN_WEIGHTS.aim * aim + PLAN_WEIGHTS.value * Math.max(moneyValue(c.valueGBP), clamp(c.healthValue ?? 0, 0, 1)) + PLAN_WEIGHTS.ease * ease(c, pressures) + (c.chosen ? CHOSEN_WEIGHT : 0) - fatigue(c, ctx);
    if (ctx.learning) {
      const learned = learnedBoost(ctx.learning.state, c.kind, context, ctx.learning.random);
      score += learned.boost;
      if (learned.seen >= 5 && learned.rate >= 0.6) reasons.push('You often do moves like this on days like today.');
    }
    const move: Scored = { id: c.id, kind: c.kind, title: c.title, score: round(score, 2), tags, why: reasons, demanding: !!c.demanding, deadline, dueAt: c.dueAt };
    // Filters that move things out of today.
    if (c.kind === 'glimpse' && heavyMood) continue;
    if (heavyMood && !deadline && hoursLeft > 7 * 24) { out.later.push({ ...move, why: [...reasons, 'Waiting for a day with more room.'] }); continue; }
    if (shortSleep && !deadline && c.startsAt !== undefined && c.startsAt >= LATE_COMMITMENT) { out.later.push({ ...move, why: [...reasons, 'Starts after 20:00, and you need an early night.'] }); continue; }
    scored.push(move);
  }

  const order = (a: Scored, b: Scored) => b.score - a.score || a.id.localeCompare(b.id);
  const deadlines = scored.filter(m => m.deadline).sort((a, b) => (a.dueAt ?? 0) - (b.dueAt ?? 0) || order(a, b));
  let rest = scored.filter(m => !m.deadline).sort(order);
  if (ledByGambit) {
    const gambit = rest.find(m => m.kind === 'gambit');
    if (gambit) { rest = [gambit, ...rest.filter(m => m !== gambit)]; gambit.why.push('You’ve got energy today.'); }
  }
  let ordered = [...deadlines, ...rest];

  if (pressures.capDemanding) {
    const kept: Scored[] = [];
    let demandingInToday = 0;
    for (const m of ordered) {
      const inToday = kept.length < 3;
      if (m.demanding && !m.deadline && inToday && demandingInToday >= 1) {
        out.tomorrow.push({ ...m, why: [...m.why, lowReadiness ? `Readiness is low (${readiness}), so this waits for tomorrow.` : 'Today is lighter, so this waits for tomorrow.'] });
        continue;
      }
      if (m.demanding && inToday) demandingInToday++;
      kept.push(m);
    }
    ordered = kept;
  }

  // Cards from the rest of the day's signals.
  if (ctx.payday && (ctx.payday === today || ctx.payday === addDays(today, -1))) cards.push({ id: 'payday-sweep', why: 'Pay has arrived. Moving money now keeps the month on plan.' });
  if (ctx.load && ctx.fuel && ctx.fuel.targetKcal > 0) {
    const hard = ctx.load.today >= Math.min(14, ctx.load.sweetSpotHigh);
    const under = ctx.fuel.eatenKcal < 0.7 * ctx.fuel.targetKcal;
    if (hard && under && localMinutes(ctx.now, ctx.timeZone) < 19 * 60) cards.push({ id: 'fuel', why: 'A hard day and not much eaten yet. Eat before the evening.' });
  }
  for (const h of ctx.habitsAtRisk ?? []) cards.push({ id: 'never-miss-twice', habitId: h.id, why: `One miss is normal. Doing ${h.name.toLowerCase()} today keeps it going.` });

  const strip = (m: Scored): PlannedMove => ({ id: m.id, kind: m.kind, title: m.title, score: m.score, tags: m.tags, why: m.why });
  return {
    next: ordered[0] ? strip(ordered[0]) : null,
    worthDoing: ordered.slice(1, 3).map(strip),
    later: [...ordered.slice(3), ...out.later].map(strip),
    tomorrow: out.tomorrow.map(strip),
    cards,
    tone: heavyMood || pressures.capDemanding ? 'gentle' : ledByGambit ? 'bold' : 'steady',
    noNewCommitmentsAfter: shortSleep ? LATE_COMMITMENT : null,
    showGlimpses: !heavyMood,
    why,
  };
}

/**
 * A heavy day by pattern (SPEC §1.2): the last three check-ins on this weekday were drained or anxious, so this
 * weekday is planned light by default.
 */
export function heavyWeekdayPattern(checkIns: readonly { date: DateKey; mood: string }[], today: DateKey): boolean {
  const weekday = weekdayOf(today);
  const same = checkIns.filter(c => c.date < today && weekdayOf(c.date) === weekday).sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3);
  return same.length === 3 && same.every(c => c.mood === 'drained' || c.mood === 'anxious');
}
