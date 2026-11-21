/** When background work last saved to this phone's store, so the app reloads it on coming to the front (Phase 29). */
import AsyncStorage from '@react-native-async-storage/async-storage';

const WROTE_KEY = 'life.background.wrote';

export async function lastBackgroundWrite(): Promise<number> {
  try { return Number(await AsyncStorage.getItem(WROTE_KEY) ?? 0) || 0; } catch { return 0; }
}
export async function markBackgroundWrite(at = Date.now()): Promise<void> {
  try { await AsyncStorage.setItem(WROTE_KEY, String(at)); } catch { /* The next open reloads anyway. */ }
}
