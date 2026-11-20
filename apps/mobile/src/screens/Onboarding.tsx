/**
 * First open. Every screen is the V26 build in `v26/firstopen.tsx`; this switch keeps the routes' entry point.
 * "Signed out" (welcome or signin with ?state=signedout) is the V26 state screen in `v26/states.tsx`.
 */
import { useLocalSearchParams } from 'expo-router';
import type { ScreenKey } from '@/navigation/screens';
import {
  AgecheckV26, BuildingV26, CalprimerV26, CamprimerV26, DevicesetupV26, FirstmoveV26, HealthconsentV26, HealthprimerV26, MeasuresetupV26,
  MicprimerV26, NotifprimerV26, QuestionV26, SigninV26, TellV26, WelcomeV26, WhereV26,
} from './v26/firstopen';
import { SignedOutV26 } from './v26/states';

export function OnboardingScreen({ screen }: { screen: ScreenKey }) {
  const { state } = useLocalSearchParams<{ state?: string }>();
  if (state === 'signedout' && (screen === 'signin' || screen === 'welcome')) return <SignedOutV26 />;
  switch (screen) {
    case 'welcome': return <WelcomeV26 />;
    case 'agecheck': return <AgecheckV26 />;
    case 'question': return <QuestionV26 />;
    case 'tell': return <TellV26 />;
    case 'building': return <BuildingV26 />;
    case 'where': return <WhereV26 />;
    case 'healthconsent': return <HealthconsentV26 />;
    case 'healthprimer': return <HealthprimerV26 />;
    case 'notifprimer': return <NotifprimerV26 />;
    case 'micprimer': return <MicprimerV26 />;
    case 'camprimer': return <CamprimerV26 />;
    case 'devicesetup': return <DevicesetupV26 />;
    case 'firstmove': return <FirstmoveV26 />;
    case 'measuresetup': return <MeasuresetupV26 />;
    case 'signin': return <SigninV26 />;
    default: return <CalprimerV26 />;
  }
}
