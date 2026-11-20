/**
 * Learn from the best. Every screen is the V26 build in `v26/learn.tsx`; this switch keeps the routes' entry point.
 */
import type { ScreenKey } from '@/navigation/screens';
import { DrawkitV26, HillV26, IdeaV26, LearnedV26, LearningV26, LensV26, LensaskV26, LibraryV26, RecallV26, TeachV26 } from './v26/learn';

export function LearnScreen({ screen }: { screen: ScreenKey }) {
  switch (screen) {
    case 'library': return <LibraryV26 />;
    case 'lens': return <LensV26 />;
    case 'idea': return <IdeaV26 />;
    case 'lensask': return <LensaskV26 />;
    case 'recall': return <RecallV26 />;
    case 'learning': return <LearningV26 />;
    case 'teach': return <TeachV26 />;
    case 'hill': return <HillV26 />;
    case 'learned': return <LearnedV26 />;
    default: return <DrawkitV26 />;
  }
}
