import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { BrainError } from '@life/brain';
import { useSeed } from '@/state/SeedProvider';
import { brain } from './brain';
import { deliver, drain } from './aiQueue';
import { onConnectionBack } from './connection';
import { noteUse } from './memory';

let running: (() => Promise<void>) | null = null;
/** Sends what is waiting now, for example right after another request got through. */
export const flushAiQueue = (): Promise<void> => running?.() ?? Promise.resolve();

/**
 * Sends the requests waiting in `aiQueue` (services/aiQueue.ts) once the phone is back. Mounted once, at the app's
 * root, so answers arrive whichever screen is open. It tries the moment the phone's connection comes back
 * (services/connection.ts, fix F-46), when the app opens, each time it comes back to the front, and every 30 seconds
 * while something is waiting and the app is in use, in case a report is missed. A failed try is cheap: it stops at
 * the first request that still can't get through. If an answer is lost on the way, the same request id goes again and
 * the life API doesn't count it against the allowance twice.
 *
 * Private mode means nothing leaves the phone, so turning it on drops what was waiting, and says so.
 */
export function useAiQueueRunner() {
  const { data, update, hydrated } = useSeed();
  const latest = useRef(data); latest.current = data;
  const busy = useRef(false);
  const flush = useCallback(async () => {
    const queue = latest.current.aiQueue ?? [];
    if (busy.current || !queue.length || latest.current.prefs.privateMode) return;
    busy.current = true;
    try {
      const { delivered } = await drain(queue, item => brain.run(item.request, undefined, item.model ? { rules: false } : undefined));
      if (!delivered.length) return;
      const done = new Set(delivered.map(d => d.item.id));
      const cited = delivered.flatMap(d => d.result ? d.result.output?.citations ?? d.result.sources.map(s => s.id) : []);
      update(state => ({ ...state, aiQueue: (state.aiQueue ?? []).filter(q => !done.has(q.id)), brain: deliver(state.brain, delivered), memories: noteUse(state.memories, cited) }));
    } finally { busy.current = false; }
  }, [update]);
  useEffect(() => { running = flush; return () => { if (running === flush) running = null; }; }, [flush]);
  useEffect(() => {
    if (!hydrated) return;
    void flush();
    const sub = AppState.addEventListener('change', state => { if (state === 'active') void flush(); });
    const stopWatching = onConnectionBack(() => { void flush(); });
    return () => { sub.remove(); stopWatching(); };
  }, [hydrated, flush]);
  const waiting = data.aiQueue?.length ?? 0;
  useEffect(() => {
    if (!hydrated || !waiting) return;
    const id = setInterval(() => { if (AppState.currentState === 'active') void flush(); }, 30_000);
    return () => clearInterval(id);
  }, [hydrated, waiting, flush]);
  useEffect(() => {
    if (!data.prefs.privateMode || !waiting) return;
    update(state => ({ ...state, aiQueue: [], brain: deliver(state.brain, (state.aiQueue ?? []).map(item => ({ item, error: new BrainError('UNAVAILABLE', 'Private mode is on, so this wasn’t sent. Ask again when you turn it off.') }))) }));
  }, [data.prefs.privateMode, waiting, update]);
  return flush;
}
