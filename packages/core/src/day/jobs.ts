/**
 * Background work (Phase 29). The phone wakes the app now and then (iOS and Android decide exactly when, at most
 * every 15 minutes); each wake does only what's due, in this order:
 *
 * - **health**: read new readings, when health is on and you said yes.
 * - **sync**: send and fetch changes, when you're signed in and sync is on.
 * - **nudges**: plan the day again and reschedule the next notifications. This one step covers the morning plan, the
 *   evening wrap, recall, renewals and birthdays, since each is a nudge with its own time.
 */
export type Job = 'health' | 'sync' | 'nudges';
export const JOBS: readonly Job[] = ['health', 'sync', 'nudges'];
const MIN = 60_000;
export const JOB_EVERY: Record<Job, number> = { health: 15 * MIN, sync: 15 * MIN, nudges: 0 };

export function dueJobs(last: Partial<Record<Job, number>>, now: number, on: { health: boolean; signedIn: boolean }): Job[] {
  return JOBS.filter(job => {
    if (job === 'health' && !on.health) return false;
    if (job === 'sync' && !on.signedIn) return false;
    const was = last[job];
    return was === undefined || now - was >= JOB_EVERY[job];
  });
}
