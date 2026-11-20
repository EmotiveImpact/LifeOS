/**
 * Plan · Documents and renewals. Every screen is the V26 build in `v26/money.tsx`; this switch keeps the routes' entry point.
 */
import type { ScreenKey } from '@/navigation/screens';
import { DocDetailV26, RenewalV26, VaultV26 } from './v26/money';

export function DocumentsScreen({ screen }: { screen: ScreenKey }) {
  switch (screen) {
    case 'vault': return <VaultV26 />;
    case 'docdetail': return <DocDetailV26 />;
    default: return <RenewalV26 />;
  }
}
