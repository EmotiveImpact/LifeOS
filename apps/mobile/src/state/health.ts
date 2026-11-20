/**
 * Body's real numbers (BUILD_V26 Phase 26): the engine's `bodyToday` over the days kept on this phone. A real account
 * with readings sees these; the sample life (development builds) keeps the board's figures in `state/body.ts`, and a
 * real account without readings sees Body's empty state.
 */
import { useMemo } from 'react';
import { bodyToday, lifeDay, type BodyToday } from '@life/core';
import { useSeed } from './SeedProvider';
import { hasRealHealth } from '@/services/health/consent';

const zone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';

export { hasRealHealth };

export function useBodyToday(): BodyToday | null {
  const { data } = useSeed();
  const real = hasRealHealth(data);
  const today = lifeDay(Date.now(), zone());
  return useMemo(() => (real ? bodyToday({ days: data.health.days, today }) : null), [real, data.health.days, today]);
}

/** "6 min ago", "2 h ago", "Yesterday" for the last read. */
export function since(iso: string | null, now = Date.now()): string {
  if (!iso) return 'Not yet';
  const mins = Math.max(0, Math.round((now - Date.parse(iso)) / 60_000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  return hours < 24 ? `${hours} h ago` : hours < 48 ? 'Yesterday' : `${Math.round(hours / 24)} days ago`;
}
