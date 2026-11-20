/**
 * Know yourself. Every screen is the V26 build in `v26/self.tsx`; this switch keeps the routes' entry point.
 */
import type { ScreenKey } from '@/navigation/screens';
import { BigfiveV26, ChronotypeV26, MeasuresV26, TestqV26, TestsV26, ValuesV26 } from './v26/self';

export function SelfScreen({ screen }: { screen: ScreenKey }) {
  switch (screen) {
    case 'tests': return <TestsV26 />;
    case 'testq': return <TestqV26 />;
    case 'bigfive': return <BigfiveV26 />;
    case 'chronotype': return <ChronotypeV26 />;
    case 'values': return <ValuesV26 />;
    default: return <MeasuresV26 />;
  }
}
