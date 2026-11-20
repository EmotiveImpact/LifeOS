import { Redirect, useLocalSearchParams } from 'expo-router';
import { OutsideScreen } from '@/screens/Outside';
import { SHOW_SAMPLES } from '@/state/sample';

/** Previews of life outside the app (widgets, watch, Lock Screen, Siri) and the orb pages. Development and preview builds only. */
export default function Route() {
  const { key, state } = useLocalSearchParams<{ key: string; state?: string }>();
  if (!SHOW_SAMPLES) return <Redirect href="/(tabs)/today" />;
  return <OutsideScreen screen={key} state={state} />;
}
