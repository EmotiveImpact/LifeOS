import { Redirect } from 'expo-router';
import { useSeed } from '@/state/SeedProvider';
export default function Index() { const { data, hydrated } = useSeed(); if (!hydrated) return null; return <Redirect href={data.onboardingDone ? '/(tabs)/today' : '/(flows)/onboarding/welcome'} />; }
