/**
 * The toolkit. Every screen is the V26 build in `v26/toolkit.tsx`; this switch keeps the routes' entry point.
 */
import type { ScreenKey } from '@/navigation/screens';
import {
  BedroomsV26, BloodV26, BufferV26, CashplanV26, DecisionsV26, GrowthV26, HealthstackV26, IncomeV26, ProtectV26, RentbuyV26, TaxcheckV26, ToolsV26, UnlockV26,
} from './v26/toolkit';

export function ToolkitScreen({ screen }: { screen: ScreenKey }) {
  switch (screen) {
    case 'cashplan': return <CashplanV26 />;
    case 'taxcheck': return <TaxcheckV26 />;
    case 'income': return <IncomeV26 />;
    case 'rentbuy': return <RentbuyV26 />;
    case 'blood': return <BloodV26 />;
    case 'protect': return <ProtectV26 />;
    case 'growth': return <GrowthV26 />;
    case 'bedrooms': return <BedroomsV26 />;
    case 'buffer': return <BufferV26 />;
    case 'unlock': return <UnlockV26 />;
    case 'decisions': return <DecisionsV26 />;
    case 'tools': return <ToolsV26 />;
    default: return <HealthstackV26 />;
  }
}
