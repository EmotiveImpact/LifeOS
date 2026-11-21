/**
 * What life could say today (Phase 29): the words and times for each kind of nudge, for `scheduleNotifications` to
 * cap at one a day and keep out of quiet hours. Kinds match the switches in Settings, Notifications.
 *
 * - **move**: today's move, in the first free stretch it fits between 09:00 and 19:00, or at 12:30 without a calendar.
 * - **deadlines**: something due within a day, sent 24 hours before (or now, if that has passed). It outranks the rest.
 * - **habit**: a habit one miss from a second, at 18:00.
 * - **recall**: things ready to recall, at 12:00.
 * - **recap**: the week's recap, Sunday at 18:00.
 * - **bedtime**: the reminder you asked for, 45 minutes before bedtime. Yours, so it skips the cap.
 * - **plan-tomorrow** and **pick-up**: the evening question, as your check-in style sets.
 * A nudge never carries a health or money figure: what shows on a locked screen stays general. A move, deadline or
 * habit is named only when it isn't from money or health and its words pass `lockScreenSafe` (fix F-28).
 */
import { addDays, instantAt, localDate, localMinutes, weekdayOf, type DateKey, type QuietHours } from '../time/zone';
import { BEDTIME_REMINDER_LEAD } from '../health/sleep';
import { gapFor, type Gap } from './gaps';
import { checkInNotifications, type CheckInContext, type CheckInStyle } from './loops';
import { bedtimeReminder, MAX_PER_DAY, scheduleNotifications, type NotificationCandidate } from './notifications';

export type NudgeKind = 'move' | 'deadlines' | 'habit' | 'recall' | 'recap' | 'bedtime' | 'plan-tomorrow' | 'pick-up';

export interface Nudge extends NotificationCandidate {
  kind: NudgeKind;
  title: string;
  body: string;
  /** Where tapping it opens. */
  to: string;
  /** The move behind a move nudge, for fatigue. */
  ref?: string;
}

export interface NudgeInput {
  now: number;
  timeZone: string;
  /** Today's move from the planner. `private` when it comes from money or health, so its name stays off a lock screen. */
  next?: { id: string; title: string; minutes?: number; private?: boolean } | null;
  /** Today's free stretches, when a calendar is shared. */
  gaps?: readonly Gap[] | null;
  /** `allDay`: due on a day with no time said, so the nudge names the day only (`dueAt` is 09:00 that day). */
  deadlines?: readonly { id: string; title: string; dueAt: number; private?: boolean; allDay?: boolean }[];
  habitsAtRisk?: readonly { id: string; name: string; private?: boolean }[];
  recallDue?: number;
  /** Bedtime as a local clock time, when the reminder is on. */
  bedtime?: number | null;
  checkIn?: { style: CheckInStyle; ctx: CheckInContext };
  /** Kinds switched off in Settings. */
  off?: ReadonlySet<string>;
  window?: QuietHours;
}

/** When a move may be suggested: 09:00 to 19:00. */
export const NUDGE_WINDOW: QuietHours = { start: 9 * 60, end: 19 * 60 };
export const NUDGE_PRIORITY: Record<NudgeKind, number> = { deadlines: 5, habit: 3, move: 2, recall: 1.5, recap: 1, 'plan-tomorrow': 1, 'pick-up': 1, bedtime: 0 };
/** A move's length when its step has none. */
const DEFAULT_MOVE_MINUTES = 10;
const NO_CALENDAR_MOVE_AT = 12 * 60 + 30;
const EVENING_LAST = 20 * 60 + 55;
const DEADLINE_LOOKAHEAD = 7 * 86_400_000;
const HOUR = 3_600_000;
const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

/**
 * Words that shouldn't show on a locked screen, where anyone nearby can read them (DPIA risk 10, fix F-28): money
 * figures, tax forms and money trouble, and health conditions, treatment and care. A name that has any of them is
 * left out of a nudge, which then says the same thing without it.
 */
const MONEY_WORDS = /[£$€]\s?\d|\d\s?%|\b(?:HMRC|P\d{2,3}|SA\d{3}|tax|refund|rebate|debts?|loans?|overdraft|arrears|bailiffs?|salary|payslip|benefits?|universal credit|pension|mortgage|savings|invoices?|credit card|bank|pay ?day|wages?)\b/i;
const HEALTH_WORDS = /\b(?:GP|NHS|doctors?|dentist|hospital|clinic|referral|prescriptions?|medication|medicines?|meds|pills?|tablets?|doses?|inhaler|blood|test results?|scans?|x-?rays?|therapy|therapist|counselling|counsellor|psychiatr\w*|mental health|anxiety|depression|pregnan\w*|contracepti\w*|fertility|cardiolog\w*|diabet\w*|insulin|cancer|chemo\w*|surgery|injections?|vaccin\w*|smear|STIs?|HIV|sexual health|weigh-?ins?|weight|calories|diet|vitamins?|supplements?)\b/i;

/** True when `text` can show on a locked screen: no money figure, tax form, money trouble or health word. */
export const lockScreenSafe = (text: string) => !MONEY_WORDS.test(text) && !HEALTH_WORDS.test(text);
const named = (text: string, isPrivate?: boolean) => !isPrivate && lockScreenSafe(text);

const clock = (minutes: number) => `${String(Math.floor(minutes / 60) % 24).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
function dayWord(due: DateKey, from: DateKey): string {
  if (due === from) return 'today';
  if (due === addDays(from, 1)) return 'tomorrow';
  return `on ${WEEKDAYS[weekdayOf(due)]}`;
}

export function dayNudges(input: NudgeInput): Nudge[] {
  const { now, timeZone } = input;
  const today = localDate(now, timeZone);
  const window = input.window ?? NUDGE_WINDOW;
  const at = (minutes: number) => instantAt(today, minutes, timeZone);
  const out: Nudge[] = [];
  const add = (n: Omit<Nudge, 'priority' | 'title'> & { title?: string }) => out.push({ title: 'Life', priority: NUDGE_PRIORITY[n.kind], ...n });

  for (const d of input.deadlines ?? []) {
    const latest = d.dueAt - 30 * 60_000;
    if (latest <= now || d.dueAt - now > DEADLINE_LOOKAHEAD) continue;
    const earliest = Math.max(now, d.dueAt - 24 * HOUR);
    const day = dayWord(localDate(d.dueAt, timeZone), localDate(earliest, timeZone));
    const when = d.allDay ? day : `${day} at ${clock(localMinutes(d.dueAt, timeZone))}`;
    add({ id: `deadline-${d.id}`, kind: 'deadlines', earliest, latest, body: named(d.title, d.private) ? `${d.title} is due ${when}.` : `Something is due ${when}.`, to: 'today' });
  }

  if (input.next) {
    const show = named(input.next.title, input.next.private);
    const minutes = input.next.minutes && input.next.minutes > 0 ? input.next.minutes : DEFAULT_MOVE_MINUTES;
    const from = Math.max(now, at(window.start));
    const latest = at(window.end);
    if (input.gaps && input.gaps.length) {
      const inWindow = input.gaps
        .map(g => ({ start: Math.max(g.start, at(window.start)), end: Math.min(g.end, latest) }))
        .filter(g => g.end > g.start)
        .map(g => ({ ...g, minutes: Math.floor((g.end - g.start) / 60_000) }));
      const gap = gapFor(inWindow, minutes, from);
      if (gap) add({ id: `move-${today}`, kind: 'move', ref: input.next.id, earliest: gap.start, latest, body: `You’ve got ${gap.minutes} free minutes. ${show ? input.next.title : 'Your next move'} fits.`, to: 'today' });
    } else {
      add({ id: `move-${today}`, kind: 'move', ref: input.next.id, earliest: Math.max(from, at(NO_CALENDAR_MOVE_AT)), latest, body: show ? `Today’s move: ${input.next.title}.` : 'Today’s move is ready when you are.', to: 'today' });
    }
  }

  for (const h of input.habitsAtRisk ?? []) {
    add({ id: `habit-${h.id}-${today}`, kind: 'habit', earliest: at(18 * 60), latest: at(EVENING_LAST), body: named(h.name, h.private) ? `One miss is normal. ${h.name} today keeps it going.` : 'One miss is normal. Today keeps your habit going.', to: 'habits' });
  }

  const recall = Math.max(0, Math.floor(input.recallDue ?? 0));
  if (recall > 0) {
    add({ id: `recall-${today}`, kind: 'recall', earliest: at(12 * 60), latest: at(window.end), body: recall === 1 ? 'One thing is ready to recall. It takes a minute.' : `${recall} things are ready to recall. It takes a few minutes.`, to: 'recall' });
  }

  if (weekdayOf(today) === 6) {
    add({ id: `recap-${today}`, kind: 'recap', earliest: at(18 * 60), latest: at(EVENING_LAST), body: 'Your week is ready to look back on.', to: 'recap' });
  }

  if (typeof input.bedtime === 'number') {
    add({ ...bedtimeReminder(input.bedtime, today, timeZone), kind: 'bedtime', body: `Bedtime in ${BEDTIME_REMINDER_LEAD} minutes.`, to: 'sleep' });
  }

  if (input.checkIn) {
    for (const c of checkInNotifications(input.checkIn.style, input.checkIn.ctx)) {
      const kind = c.kind === 'pick-up' ? 'pick-up' : 'plan-tomorrow';
      add({ ...c, kind, body: kind === 'pick-up' ? 'Pick up where you left off?' : 'What’s most important to you tomorrow?', to: kind === 'pick-up' ? 'today' : 'evening' });
    }
  }

  const off = input.off ?? new Set<string>();
  return out.filter(n => !off.has(n.kind)).sort((a, b) => b.priority - a.priority || a.earliest - b.earliest || a.id.localeCompare(b.id));
}

/* ───────────────────────── From nudges to the phone's schedule ───────────────────────── */

/** What was scheduled, kept so the day's cap counts what has already gone out. `ref` is the move behind a move nudge. */
export interface NudgeLogEntry { id: string; kind: string; at: number; ref?: string; acted?: boolean; requested?: boolean }
export interface PlannedNudge { nudge: Nudge; at: number }

/** Deadlines under a day are time-critical: they sit outside the one-a-day nudge, up to this many a day. */
export const DEADLINE_MAX_PER_DAY = 3;
/** How long the log keeps what went out, for fatigue and the cap. */
export const NUDGE_LOG_DAYS = 14;

/**
 * Turns the day's nudges into the phone's schedule. Everything already delivered counts towards today's cap; what is
 * still in the future is planned again from scratch, so a change in the day (a step ticked, a habit done) is reflected.
 */
export function planNudges(
  nudges: readonly Nudge[],
  log: readonly NudgeLogEntry[],
  rules: { timeZone: string; quiet?: QuietHours },
  now: number,
  horizonDays = 2,
): { planned: PlannedNudge[]; log: NudgeLogEntry[] } {
  const delivered = log.filter(e => e.at <= now && e.at >= now - NUDGE_LOG_DAYS * 86_400_000);
  const sentOf = (deadline: boolean) => delivered.filter(e => (e.kind === 'deadlines') === deadline).map(e => ({ id: e.id, at: e.at, requested: e.requested }));
  const goneOut = new Set(delivered.map(e => e.id));
  const fresh = nudges.filter(n => !goneOut.has(n.id));
  const byId = new Map(fresh.map(n => [n.id, n]));
  const options = { now, horizonDays };
  const deadlines = scheduleNotifications(fresh.filter(n => n.kind === 'deadlines'), sentOf(true), { ...rules, maxPerDay: DEADLINE_MAX_PER_DAY }, options);
  const rest = scheduleNotifications(fresh.filter(n => n.kind !== 'deadlines'), sentOf(false), { ...rules, maxPerDay: MAX_PER_DAY }, options);
  const planned = [...deadlines.scheduled, ...rest.scheduled]
    .map(s => ({ nudge: byId.get(s.id)!, at: s.at }))
    .sort((a, b) => a.at - b.at);
  const refs = new Map(log.map(e => [e.id, e]));
  return {
    planned,
    log: [
      ...delivered,
      ...planned.map(p => ({ id: p.nudge.id, kind: p.nudge.kind, at: p.at, ...(p.nudge.ref ? { ref: p.nudge.ref } : {}), ...(p.nudge.requested ? { requested: true } : {}), ...(refs.get(p.nudge.id)?.acted ? { acted: true } : {}) })),
    ],
  };
}

/** Marks a nudge as opened, for fatigue: moves you open aren't held back. */
export const markActed = (log: readonly NudgeLogEntry[], id: string): NudgeLogEntry[] => log.map(e => (e.id === id ? { ...e, acted: true } : e));

/** The move nudges of the last week, as the planner's fatigue reads them. */
export const recentMoveNudges = (log: readonly NudgeLogEntry[]) =>
  log.filter(e => e.kind === 'move' && e.ref).map(e => ({ id: e.ref as string, at: e.at, acted: !!e.acted }));
