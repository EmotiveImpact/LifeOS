/**
 * Life's north star, moves finished per week (Phase 30, SYSTEM_DESIGN §observability). Nothing is counted until the
 * person switches it on in Your data. While it's on, this phone counts the moves finished here (a mission step ticked,
 * a step of the plan done, a habit done today) by week, and shares one number for each finished week: the week, the
 * count and the kind of phone, with no name, account or device. Switching it off stops the count and forgets it.
 *
 * Only changes made on this phone count. What sync brings in from another phone was counted there, so data read back
 * from storage becomes the new starting point instead (`loads` in SeedProvider).
 */
import { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { dueReports, finishedMoves, markSent, noteMoves, readMovesLog, weekKey, type MoveSources } from '@life/core';
import { deviceTimeZone } from '@/state/loops';
import { useSeed, type SeedData } from '@/state/SeedProvider';
import { reportMoves } from './account';

export const MOVES_LOG_KEY = 'moves-log';
export const SHARE_MOVES_KEY = 'share-moves';

/** On only once the person has said yes in Your data. */
export const sharesMoves = (choices: SeedData['choices']) => choices[SHARE_MOVES_KEY] === 'on';

/** Turns sharing on, or off and forgets every count kept so far. */
export function withMovesSharing(data: SeedData, on: boolean): SeedData {
  const choices = { ...data.choices };
  if (on) choices[SHARE_MOVES_KEY] = 'on';
  else { delete choices[SHARE_MOVES_KEY]; delete choices[MOVES_LOG_KEY]; }
  return { ...data, choices };
}

const sourcesOf = (data: SeedData): MoveSources => ({ missionSteps: data.missionSteps, loops: data.loops, habits: data.habits });

export function useMovesCounter() {
  const { data, update, hydrated, loads } = useSeed();
  const on = hydrated && sharesMoves(data.choices);
  const before = useRef<{ loads: number; sources: MoveSources } | null>(null);
  const latest = useRef(data), sending = useRef(false);
  latest.current = data;

  // Count what changed since the last look. Opening the app marks the week as one Life was used in, so a week with
  // nothing finished still reports a 0.
  useEffect(() => {
    if (!on) { before.current = null; return; }
    const prior = before.current, sources = sourcesOf(data);
    before.current = { loads, sources };
    const n = prior && prior.loads === loads ? finishedMoves(prior.sources, sources) : 0;
    const now = Date.now(), tz = deviceTimeZone();
    if (n === 0 && weekKey(now, tz) in readMovesLog(data.choices[MOVES_LOG_KEY]).weeks) return;
    update(c => sharesMoves(c.choices) ? { ...c, choices: { ...c.choices, [MOVES_LOG_KEY]: JSON.stringify(noteMoves(readMovesLog(c.choices[MOVES_LOG_KEY]), now, tz, n)) } } : c);
  }, [on, loads, data.missionSteps, data.loops, data.habits]); // eslint-disable-line react-hooks/exhaustive-deps

  // Share each finished week once: on opening, on coming back to the front, and right after the switch goes on.
  useEffect(() => {
    if (!on) return;
    const send = async () => {
      if (sending.current || !sharesMoves(latest.current.choices)) return;
      const due = dueReports(readMovesLog(latest.current.choices[MOVES_LOG_KEY]), Date.now(), deviceTimeZone());
      if (!due.length) return;
      sending.current = true;
      try {
        const done: string[] = [];
        for (const report of due) {
          const outcome = await reportMoves(report.week, report.moves);
          if (outcome === 'later') break;
          done.push(report.week); // sent, or refused for good (a week the server won't take): either way, not again
        }
        if (done.length) update(c => sharesMoves(c.choices) ? { ...c, choices: { ...c.choices, [MOVES_LOG_KEY]: JSON.stringify(markSent(readMovesLog(c.choices[MOVES_LOG_KEY]), done)) } } : c);
      } catch { /* Tried again next time. */ } finally { sending.current = false; }
    };
    void send();
    const sub = AppState.addEventListener('change', s => { if (s === 'active') void send(); });
    return () => sub.remove();
  }, [on]); // eslint-disable-line react-hooks/exhaustive-deps
}
