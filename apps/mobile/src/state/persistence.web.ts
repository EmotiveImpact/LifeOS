import AsyncStorage from '@react-native-async-storage/async-storage';
import { LEGACY_STATE_KEY, type ProjectionStorage } from './persistence.types';

/** Browser-only visual preview. Native resolves persistence.native.ts instead. The preview never syncs. */
export async function openProjectionStorage(): Promise<ProjectionStorage> {
  const load = async () => {
    const raw = await AsyncStorage.getItem(LEGACY_STATE_KEY);
    return raw ? JSON.parse(raw) as unknown : null;
  };
  return {
    mode: 'web-preview',
    load,
    save: async projection => AsyncStorage.setItem(LEGACY_STATE_KEY, JSON.stringify(projection)),
    clear: async () => AsyncStorage.removeItem(LEGACY_STATE_KEY),
    exportEverything: load,
    close: async () => {},
    sync: async () => ({ applied: 0 }),
    adoptAccount: async () => ({ switched: false }),
    accountOnPhone: async () => null,
  };
}
