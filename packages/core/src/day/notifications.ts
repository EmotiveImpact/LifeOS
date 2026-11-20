/**
 * Notifications (Phase 29): one a day at most from life, never in quiet hours (21:00 to 08:00 local).
 *
 * - The cap counts life's own nudges per local calendar day, in the zone you're in, including ones already sent.
 * - A nudge due in quiet hours waits until 08:00; if today's one is used, it moves to tomorrow morning. If either
 *   pushes it past its last useful moment, it's dropped rather than sent late.
 * - When more nudges want the same day, the most important wins; ties go to the earliest.
 * - Reminders you asked for yourself (the opt-in bedtime reminder, a reminder you set) are yours: they go at the time
 *   you chose and don't use up life's one.
 * - A permission you declined is asked about again at most once a month (SPEC §2.3).
 * Clock changes and travel are handled by the zone helpers, so 08:00 is always 08:00 where you are.
 */
import { addDays, instantAt, localDate, nextOutsideQuiet, QUIET_HOURS, type DateKey, type QuietHours } from '../time/zone';
import { BEDTIME_REMINDER_LEAD } from '../health/sleep';

export interface NotificationCandidate {
  id: string;
  kind: string;
  /** Higher goes first. */
  priority: number;
  /** Not before this instant. */
  earliest: number;
  /** Not after this instant: past it, the nudge is no use. */
  latest?: number;
  /** You asked for it: exempt from the cap and quiet hours. */
  requested?: boolean;
}

export interface SentNotification { id: string; at: number; requested?: boolean }
export interface ScheduledNotification { id: string; at: number; date: DateKey; requested: boolean }
export interface NotificationRules { timeZone: string; quiet?: QuietHours; maxPerDay?: number }

export const MAX_PER_DAY = 1;
export const ASK_AGAIN_DAYS = 30;

export function scheduleNotifications(
  candidates: readonly NotificationCandidate[],
  sent: readonly SentNotification[],
  rules: NotificationRules,
  options: { now: number; horizonDays?: number },
): { scheduled: ScheduledNotification[]; dropped: { id: string; reason: 'past-latest' | 'no-room' }[] } {
  const { timeZone } = rules;
  const quiet = rules.quiet ?? QUIET_HOURS;
  const maxPerDay = rules.maxPerDay ?? MAX_PER_DAY;
  const horizon = options.horizonDays ?? 7;
  const scheduled: ScheduledNotification[] = [];
  const dropped: { id: string; reason: 'past-latest' | 'no-room' }[] = [];
  const used = new Map<DateKey, number>();
  for (const s of sent) if (!s.requested) { const d = localDate(s.at, timeZone); used.set(d, (used.get(d) ?? 0) + 1); }

  for (const c of candidates.filter(c => c.requested)) {
    const at = Math.max(c.earliest, options.now);
    if (c.latest !== undefined && at > c.latest) dropped.push({ id: c.id, reason: 'past-latest' });
    else scheduled.push({ id: c.id, at, date: localDate(at, timeZone), requested: true });
  }

  const queue = candidates.filter(c => !c.requested).sort((a, b) => b.priority - a.priority || a.earliest - b.earliest || a.id.localeCompare(b.id));
  for (const c of queue) {
    let at = Math.max(c.earliest, options.now);
    let placed = false;
    for (let step = 0; step <= horizon; step++) {
      at = nextOutsideQuiet(at, timeZone, quiet);
      if (c.latest !== undefined && at > c.latest) { dropped.push({ id: c.id, reason: 'past-latest' }); placed = true; break; }
      const date = localDate(at, timeZone);
      if ((used.get(date) ?? 0) < maxPerDay) {
        used.set(date, (used.get(date) ?? 0) + 1);
        scheduled.push({ id: c.id, at, date, requested: false });
        placed = true;
        break;
      }
      at = instantAt(addDays(date, 1), quiet.end, timeZone);
    }
    if (!placed) dropped.push({ id: c.id, reason: 'no-room' });
  }
  return { scheduled: scheduled.sort((a, b) => a.at - b.at), dropped };
}

/** The opt-in bedtime reminder, 45 minutes before tonight's bedtime (local clock minutes; after midnight is fine). */
export function bedtimeReminder(bedtime: number, date: DateKey, timeZone: string): NotificationCandidate {
  const minutes = bedtime < 12 * 60 ? bedtime + 1440 : bedtime; // a 00:30 bedtime is tonight, not this morning
  const at = instantAt(date, minutes - BEDTIME_REMINDER_LEAD, timeZone);
  return { id: `bedtime-${date}`, kind: 'bedtime', priority: 0, earliest: at, latest: at + 30 * 60_000, requested: true };
}

/** Whether life may ask again for a permission you declined: at most once a month. */
export const mayAskAgain = (lastAsked: number | null | undefined, now: number) =>
  lastAsked === null || lastAsked === undefined || now - lastAsked >= ASK_AGAIN_DAYS * 86_400_000;
