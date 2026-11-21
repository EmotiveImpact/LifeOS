import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';

/**
 * Health Connect can open Life to show why it reads health data: from its permission screen through Android 13,
 * and from Android's privacy dashboard from Android 14. Google's policy asks that this shows the privacy policy
 * (fix F-25), so Life opens About with the policy unfolded instead of Today. Other platforms never ask.
 */
type Subscription = { remove(): void };
interface NativeLaunch {
  launchedForHealthRationale?(): boolean;
  addListener(event: 'healthRationale', listener: () => void): Subscription;
}
const native = Platform.OS === 'android' ? requireOptionalNativeModule<NativeLaunch>('LifeIntelligence') : null;

/** Where the policy opens: About, with the privacy policy unfolded. */
export const HEALTH_RATIONALE_TARGET = { screen: 'legal', params: { open: 'privacy' } } as const;

/** Calls `show` if Health Connect opened Life for its rationale, now or later while Life is running. */
export function onHealthRationale(show: () => void): () => void {
  if (!native) return () => {};
  // On a cold start the navigator mounts in the same pass, so the policy opens on the next tick.
  try { if (native.launchedForHealthRationale?.()) setTimeout(show, 0); } catch { /* an older build without the check */ }
  const sub = native.addListener('healthRationale', show);
  return () => sub.remove();
}
