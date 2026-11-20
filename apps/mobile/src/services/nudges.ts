/**
 * Keeps the phone's nudges planned (Phase 29). Runs when the app opens, when it comes back to the front, a moment
 * after anything that changes the day (a plan, a tick, a habit, a setting), and from the background task. Each run
 * plans today and tomorrow from what's stored and replaces what Life had scheduled.
 */
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { addDays, instantAt, localDate, markActed, type NudgeLogEntry } from '@life/core';
import type { ScreenKey } from '@/navigation/screens';
import { screens } from '@/navigation/screens';
import { useNavigation } from '@/navigation/useNavigation';
import { NUDGE_LOG_KEY, readNudgeLog, scheduleFor } from '@/state/dayplan';
import { deviceTimeZone } from '@/state/loops';
import { useSeed, type SeedData } from '@/state/SeedProvider';
import { registerPushToken } from './account';
import { busyTimes } from './calendar';
import { applySchedule, notificationPermission, onNudgeTap, pushToken } from './notifications';

const PLAN_AFTER_CHANGE_MS = 2000;

/** Plans and schedules from `data`. Returns the log to keep, or null when nothing could be scheduled. */
export async function refreshNudges(data: SeedData, now = Date.now()): Promise<NudgeLogEntry[] | null> {
  if (await notificationPermission() !== 'granted') return null;
  if (!data.prefs.notifications) { await applySchedule([]); return null; }
  const tz = deviceTimeZone();
  const busy = data.choices['calendar-permission'] === 'granted' ? await busyTimes(now, instantAt(addDays(localDate(now, tz), 2), 0, tz)) : null;
  const { planned, log } = scheduleFor(data, now, busy, tz);
  await applySchedule(planned);
  return log;
}

const logText = (log: NudgeLogEntry[]) => JSON.stringify(log);

export function useNudgeRunner() {
  const { data, update, hydrated } = useSeed();
  const nav = useNavigation();
  const latest = useRef(data), running = useRef(false), timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  latest.current = data;
  const navRef = useRef(nav);
  navRef.current = nav;

  const run = async () => {
    if (running.current || !hydrated) return;
    running.current = true;
    try {
      const log = await refreshNudges(latest.current);
      if (log && logText(log) !== (latest.current.choices[NUDGE_LOG_KEY] ?? '')) update(c => ({ ...c, choices: { ...c.choices, [NUDGE_LOG_KEY]: logText(log) } }));
      // Push needs a signed-in account and a build that can get a token; the server only hears the token.
      const token = await pushToken();
      if (token && latest.current.choices['push-token-sent'] !== token && await registerPushToken(token)) update(c => ({ ...c, choices: { ...c.choices, 'push-token-sent': token } }));
    } catch { /* A failed plan leaves the last one in place. */ } finally { running.current = false; }
  };

  // What changes the day: the plan, ticks, habits, people, mood, health, settings and the master switch.
  const signature = JSON.stringify([data.loops, data.missionSteps, data.completed, data.habits.map(h => h.last14[13]), data.people.length, data.pulseLog.length, data.health.lastRead, data.prefs.notifications, data.flags, data.choices['quiet-from'], data.choices['quiet-until'], data.choices['calendar-permission']]);
  useEffect(() => {
    if (!hydrated) return;
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => { void run(); }, PLAN_AFTER_CHANGE_MS);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [hydrated, signature]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!hydrated) return;
    const sub = AppState.addEventListener('change', s => { if (s === 'active') void run(); });
    const stop = onNudgeTap((to, id) => {
      if (id) update(c => ({ ...c, choices: { ...c.choices, [NUDGE_LOG_KEY]: logText(markActed(readNudgeLog(c.choices[NUDGE_LOG_KEY]), id)) } }));
      if (to in screens) navRef.current.go(to as ScreenKey);
    });
    return () => { sub.remove(); stop(); };
  }, [hydrated]); // eslint-disable-line react-hooks/exhaustive-deps
}
