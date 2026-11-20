/**
 * You. Every screen is the V26 build in `v26/you.tsx`; this switch keeps the routes' entry point.
 */
import type { ScreenKey } from '@/navigation/screens';
import { ChildrenV26, ExperimentV26, HouseholdV26, KnowsV26, LevelsV26, MemoryV26, MoodV26, ProfileV26, SharedV26, YouV26 } from './v26/you';

export function YouScreen({ screen }: { screen: ScreenKey }) {
  switch (screen) {
    case 'you': return <YouV26 />;
    case 'household': return <HouseholdV26 />;
    case 'children': return <ChildrenV26 />;
    case 'mood': return <MoodV26 />;
    case 'knows': return <KnowsV26 />;
    case 'levels': return <LevelsV26 />;
    case 'experiment': return <ExperimentV26 />;
    case 'memory': return <MemoryV26 />;
    case 'shared': return <SharedV26 />;
    default: return <ProfileV26 />;
  }
}
