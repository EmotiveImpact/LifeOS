/**
 * Plan · Money. Every screen is the V26 build in `v26/money.tsx`; this switch keeps the routes' entry point and the
 * offline state.
 */
import { useLocalSearchParams } from 'expo-router';
import type { ScreenKey } from '@/navigation/screens';
import { ParentStateContent } from './States';
import { Screen } from './Screen';
import { AreaMoneyV26, BillV26, BudgetV26, ConnectBankV26, MoneyV26, NetWorthV26, SubsV26, TxnV26 } from './v26/money';

export function MoneyScreen({ screen }: { screen: ScreenKey }) {
  const params = useLocalSearchParams<{ state?: string }>();
  if (screen === 'money' && params.state === 'offline') return <Screen screen={screen} title="Money"><ParentStateContent kind="offline" /></Screen>;
  switch (screen) {
    case 'money': return <MoneyV26 />;
    case 'subs': return <SubsV26 />;
    case 'area': return <AreaMoneyV26 />;
    case 'txn': return <TxnV26 />;
    case 'bill': return <BillV26 />;
    case 'budget': return <BudgetV26 />;
    case 'networth': return <NetWorthV26 />;
    default: return <ConnectBankV26 />;
  }
}
