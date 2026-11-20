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
 * A nudge never carries a health or money figure: what shows on a locked screen stays general.
 */
import { addDays, instantAt, localDate, localMinutes, weekdayOf, type DateKey, type QuietHours } from '../time/zone';
import { BEDTIME_REMINDER_LEAD } from '../health/sleep';
import { gapFor, type Gap } from './gaps';
import { checkInNotifications, type CheckInContext, type CheckInStyle } from './loops';
import { bedtimeReminder, type NotificationCandidate } from './notifications';

export type NudgeKind = 'move' | 'deadlines' | 'habit' | 'recall' | 'recap' | 'bedtime' | 'plan-tomorrow' | 'pick-up';

export interface Nudge extends NotificationCandidate {
  kind: NudgeKind;
  title: string;
  body: string;
  /** Where tapping it opens. */
  to: string;
}

export interface NudgeInput {
  now: number;
  timeZone: string;
  /** Today's move from the planner. */
  next?: { id: string; title: string; minutes?: number } | null;
  /** Today's free stretches, when a calendar is shared. */
  gaps?: readonly Gap[] | null;
  deadlines?: readonly { id: string; title: string; dueAt: number }[];
  habitsAtRisk?: readonly { id: string; name: string }[];
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
    const when = `${dayWord(localDate(d.dueAt, timeZone), localDate(earliest, timeZone))} at ${clock(localMinutes(d.dueAt, timeZone))}`;
    add({ id: `deadline-${d.id}`, kind: 'deadlines', earliest, latest, body: `${d.title} is due ${when}.`, to: 'today' });
  }

  if (input.next) {
    const minutes = input.next.minutes && input.next.minutes > 0 ? input.next.minutes : DEFAULT_MOVE_MINUTES;
    const from = Math.max(now, at(window.start));
    const latest = at(window.end);
    if (input.gaps && input.gaps.length) {
      const inWindow = input.gaps
        .map(g => ({ start: Math.max(g.start, at(window.start)), end: Math.min(g.end, latest) }))
        .filter(g => g.end > g.start)
        .map(g => ({ ...g, minutes: Math.floor((g.end - g.start) / 60_000) }));
      const gap = gapFor(inWindow, minutes, from);
      if (gap) add({ id: `move-${today}`, kind: 'move', earliest: gap.start, latest, body: `You’ve got ${gap.minutes} free minutes. ${input.next.title} fits.`, to: 'today' });
    } else {
      add({ id: `move-${today}`, kind: 'move', earliest: Math.max(from, at(NO_CALENDAR_MOVE_AT)), latest, body: `Today’s move: ${input.next.title}.`, to: 'today' });
    }
  }

  for (const h of input.habitsAtRisk ?? []) {
    add({ id: `habit-${h.id}-${today}`, kind: 'habit', earliest: at(18 * 60), latest: at(EVENING_LAST), body: `One miss is normal. ${h.name} today keeps it going.`, to: 'habits' });
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
