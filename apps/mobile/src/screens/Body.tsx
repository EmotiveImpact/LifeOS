/**
 * Body's chapter. Every screen is the V26 build in `v26/body.tsx` and `v26/health.tsx`; this switch keeps the routes'
 * entry point and Body's two states. Real accounts (no sample life) see the empty state until their own readings land.
 */
import { useLocalSearchParams } from 'expo-router';
import type { ScreenKey } from '@/navigation/screens';
import { SHOW_SAMPLES } from '@/state/sample';
import { useSeed } from '@/state/SeedProvider';
import { healthAllowed } from '@/state/firstopen';
import { ConnectFailV26, EmptyBodyV26, HealthOffV26 } from './v26/states';
import {
  BodyV26, BreatheV26, CoachV26, CycleV26, DetectedV26, DevicesV26, ForecastV26, HrvV26, IllnessV26, InsightsV26, JournalV26, LoadV26, MathV26, ReadinessV26, SignalsV26,
  SleepplanV26, SleepV26, StressV26, TrendsV26, WorkoutV26,
} from './v26/body';
import {
  BasicsV26, BmiV26, BreathlibV26, CgmV26, FitnessageV26, HealthdigestV26, LoadtrendV26, ProvenanceV26, RegularityV26, SleepnightV26, SourcesV26, StrainV26, WeightV26,
  WorkoutdetailV26, ZonesV26,
} from './v26/health';

/** Body pages that read no health data: the breathing exercises and where data comes from. */
const NO_HEALTH_DATA: ScreenKey[] = ['breathe', 'breathlib', 'devices', 'sources', 'provenance'];

export function BodyScreen({ screen }: { screen: ScreenKey }) {
  const params = useLocalSearchParams<{ state?: string }>(), { data } = useSeed();
  const allowed = healthAllowed(data);
  // Health data off (never agreed, declined or withdrawn): nothing about the body is read or shown, on any Body page.
  if (!allowed && !NO_HEALTH_DATA.includes(screen)) return screen === 'body' ? <EmptyBodyV26 /> : <HealthOffV26 screen={screen} />;
  if (screen === 'body' && params.state === 'connectfail') return <ConnectFailV26 />;
  if (screen === 'body' && (params.state === 'emptybody' || !SHOW_SAMPLES)) return <EmptyBodyV26 />;
  switch (screen) {
    case 'body': return <BodyV26 />;
    case 'devices': return <DevicesV26 />;
    case 'readiness': return <ReadinessV26 />;
    case 'sleep': return <SleepV26 />;
    case 'load': return <LoadV26 />;
    case 'trends': return <TrendsV26 />;
    case 'hrv': return <HrvV26 />;
    case 'signals': return <SignalsV26 />;
    case 'illness': return <IllnessV26 />;
    case 'stress': return <StressV26 />;
    case 'breathe': return <BreatheV26 />;
    case 'journal': return <JournalV26 />;
    case 'insights': return <InsightsV26 />;
    case 'workout': return <WorkoutV26 />;
    case 'detected': return <DetectedV26 />;
    case 'sleepplan': return <SleepplanV26 />;
    case 'math': return <MathV26 />;
    case 'coach': return <CoachV26 />;
    case 'forecast': return <ForecastV26 />;
    case 'cycle': return <CycleV26 />;
    case 'fitnessage': return <FitnessageV26 />;
    case 'sources': return <SourcesV26 />;
    case 'cgm': return <CgmV26 />;
    case 'basics': return <BasicsV26 />;
    case 'sleepnight': return <SleepnightV26 />;
    case 'workoutdetail': return <WorkoutdetailV26 />;
    case 'weight': return <WeightV26 />;
    case 'bmi': return <BmiV26 />;
    case 'strain': return <StrainV26 />;
    case 'zones': return <ZonesV26 />;
    case 'breathlib': return <BreathlibV26 />;
    case 'provenance': return <ProvenanceV26 />;
    case 'regularity': return <RegularityV26 />;
    case 'loadtrend': return <LoadtrendV26 />;
    default: return <HealthdigestV26 />;
  }
}
