/** Habits' chapter: every screen is the V26 build in `v26/habits.tsx`; this switch keeps the routes' entry point. */
import type { ScreenKey } from '@/navigation/screens';
import { HabitnewV26, HabitsV26, StrengthV26 } from './v26/habits';

export function HabitsScreen({ screen }: { screen: ScreenKey }) {
  if (screen === 'habitnew') return <HabitnewV26 />;
  if (screen === 'strength') return <StrengthV26 />;
  return <HabitsV26 />;
}
