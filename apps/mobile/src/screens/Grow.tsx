/**
 * Grow. Every screen is the V26 build in `v26/grow.tsx`; this switch keeps the routes' entry point.
 */
import type { ScreenKey } from '@/navigation/screens';
import { LevelupV26, RecapV26, VantageV26, YourbirthdayV26 } from './v26/grow';

export function GrowScreen({ screen }: { screen: ScreenKey }) {
  switch (screen) {
    case 'recap': return <RecapV26 />;
    case 'vantage': return <VantageV26 />;
    case 'levelup': return <LevelupV26 />;
    default: return <YourbirthdayV26 />;
  }
}
