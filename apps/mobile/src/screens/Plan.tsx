/**
 * Plan's chapter. Every screen is the V26 build in `v26/plan.tsx`; this switch keeps the routes' entry point and the
 * empty-plan state.
 */
import { useLocalSearchParams } from 'expo-router';
import type { ScreenKey } from '@/navigation/screens';
import { useSeed } from '@/state/SeedProvider';
import { isDayOne } from '@/state/firstopen';
import { EmptyPlanV26 } from './v26/states';
import { AreaHealthV26, AreaHomeV26, AreaWorkV26, DraftV26, HistoryV26, MissionsV26, MissionV26, NewGoalV26, PlanV26, TtkV26, useMissionParam } from './v26/plan';

export function PlanScreen({ screen }: { screen: ScreenKey }) {
  const params = useLocalSearchParams<{ state?: string }>(), { data } = useSeed();
  useMissionParam();
  if (screen === 'plan' && (params.state === 'emptyplan' || (!params.state && isDayOne(data)))) return <EmptyPlanV26 />;
  switch (screen) {
    case 'plan': return <PlanV26 />;
    case 'mission': return <MissionV26 />;
    case 'draft': return <DraftV26 />;
    case 'ttk': return <TtkV26 />;
    case 'history': return <HistoryV26 />;
    case 'missions': return <MissionsV26 />;
    case 'newgoal': return <NewGoalV26 />;
    case 'areahome': return <AreaHomeV26 />;
    case 'areahealth': return <AreaHealthV26 />;
    default: return <AreaWorkV26 />;
  }
}
