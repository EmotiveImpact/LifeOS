import { Redirect } from 'expo-router';
import { useSeed } from '@/state/SeedProvider';
import { readAgeCheck } from '@/state/firstopen';
import { SHOW_SAMPLES } from '@/state/sample';

/**
 * Where the app opens. A real account that finished setup without the 18+ check (or whose answer was under 18) goes
 * to the check first; the sample life in development builds is an adult and skips it.
 */
export default function Index() {
  const { data, hydrated } = useSeed();
  if (!hydrated) return null;
  const age = readAgeCheck(data);
  if (data.onboardingDone && (age?.result === 'under' || (!age && !SHOW_SAMPLES))) return <Redirect href={{ pathname: '/(flows)/onboarding/agecheck', params: { next: 'today' } }} />;
  return <Redirect href={data.onboardingDone ? '/(tabs)/today' : '/(flows)/onboarding/welcome'} />;
}
