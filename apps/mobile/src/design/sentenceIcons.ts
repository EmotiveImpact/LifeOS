import { useSyncExternalStore } from 'react';

/**
 * Whether opening sentences show their small icons beside key words ("Your {doc} tax rebate…"). On by default; the
 * person can switch to words only in Settings, Look, sound and feel (Edem, 20 Nov 2026). Kept outside React state so
 * every sentence follows the switch at once without each screen passing it down.
 */
let on = true;
const listeners = new Set<() => void>();

export function setSentenceIcons(next: boolean): void {
  if (next === on) return;
  on = next;
  listeners.forEach(fn => fn());
}

export function useSentenceIcons(): boolean {
  return useSyncExternalStore(fn => { listeners.add(fn); return () => { listeners.delete(fn); }; }, () => on, () => on);
}
