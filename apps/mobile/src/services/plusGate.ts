import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { useSeed } from '@/state/SeedProvider';
import { readAgeCheck } from '@/state/firstopen';
import { billingLive, loadStanding } from './billing';
import { needsPlus } from './billingModel';

/** Whether the full-screen Life Plus is showing, so opening Life again doesn't stack a second one on it. */
export const plusGate = { open: false };

/**
 * Paid only, with a free trial (Edem, 20 Nov 2026). Setup ends on Life Plus (Edem, 21 Nov 2026); after that, when Life
 * opens or comes back to the front, someone with no plan (setup skipped, or a trial or plan that has ended) meets the
 * same screen. Only the store's definite answer counts: offline or unsure, Life stays open (`needsPlus`). Builds
 * without billing never ask, and the 18+ check always comes first.
 */
export function usePlusGate() {
  const { data, hydrated } = useSeed(), router = useRouter();
  const ready = billingLive && hydrated && data.onboardingDone && readAgeCheck(data)?.result === 'adult';
  useEffect(() => {
    if (!ready) return;
    let live = true;
    const check = async () => {
      const standing = await loadStanding();
      if (!live || plusGate.open || !needsPlus(standing)) return;
      plusGate.open = true;
      router.push(`/(flows)/plusstart?why=${standing?.status === 'ended' ? 'ended' : 'start'}` as Href);
    };
    void check();
    const watch = AppState.addEventListener('change', state => { if (state === 'active') void check(); });
    return () => { live = false; watch.remove(); };
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
}
