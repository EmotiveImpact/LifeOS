/**
 * Your Chief Aim. Every screen is the V26 build in `v26/aim.tsx`; this switch keeps the routes' entry point.
 */
import type { ScreenKey } from '@/navigation/screens';
import { AimNewV26, AimV26, GambitV26, GlimpseV26 } from './v26/aim';

export function AimScreen({ screen }: { screen: ScreenKey }) {
  switch (screen) {
    case 'aimnew': return <AimNewV26 />;
    case 'aim': return <AimV26 />;
    case 'gambit': return <GambitV26 />;
    default: return <GlimpseV26 />;
  }
}
