/**
 * Settings and life Plus. Every screen is the V26 build in `v26/settings.tsx`; this switch keeps the routes' entry point.
 */
import type { ScreenKey } from '@/navigation/screens';
import {
  AimodelsV26, AppearanceV26, DeleteacctV26, HelpV26, LegalV26, NotifsV26, OndeviceV26, PlusV26, PlussuccessV26, PrivacyV26, ServicesV26, SettingsV26,
  SubscriptionV26, YouraiV26,
} from './v26/settings';

export function SettingsScreen({ screen }: { screen: ScreenKey }) {
  switch (screen) {
    case 'settings': return <SettingsV26 />;
    case 'notifs': return <NotifsV26 />;
    case 'ondevice': return <OndeviceV26 />;
    case 'yourai': return <YouraiV26 />;
    case 'appearance': return <AppearanceV26 />;
    case 'services': return <ServicesV26 />;
    case 'privacy': return <PrivacyV26 />;
    case 'deleteacct': return <DeleteacctV26 />;
    case 'subscription': return <SubscriptionV26 />;
    case 'plus': return <PlusV26 />;
    case 'plussuccess': return <PlussuccessV26 />;
    case 'help': return <HelpV26 />;
    case 'legal': return <LegalV26 />;
    default: return <AimodelsV26 />;
  }
}
