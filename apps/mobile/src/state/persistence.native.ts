import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { openLocalData } from '../data';
import { LEGACY_STATE_KEY, type ProjectionStorage } from './persistence.types';

const LOCAL_USER_KEY = 'life.local-user-id';

/** Native data is encrypted SQLite. Initialization failures are deliberately
 * propagated: continuing with a plaintext store would violate the data boundary. */
export async function openProjectionStorage(): Promise<ProjectionStorage> {
  let userId = await SecureStore.getItemAsync(LOCAL_USER_KEY);
  if (!userId) {
    userId = Crypto.randomUUID();
    await SecureStore.setItemAsync(LOCAL_USER_KEY, userId);
  }
  const { store } = await openLocalData(userId);
  try {
    const legacy = await AsyncStorage.getItem(LEGACY_STATE_KEY);
    if (legacy && !await store.hasLegacyImport()) {
      await store.importLegacyOnce(JSON.parse(legacy), LEGACY_STATE_KEY);
      // Read-back must succeed before removing the old plaintext copy.
      if (!await store.loadProjection()) throw new Error('Legacy migration could not be read back.');
    }
    if (legacy && await store.hasLegacyImport()) await AsyncStorage.removeItem(LEGACY_STATE_KEY);
    return {
      mode: 'sqlite',
      load: () => store.loadProjection(),
      save: projection => store.commitProjection(projection),
      clear: async () => {
        await store.deleteEverything();
        await AsyncStorage.removeItem(LEGACY_STATE_KEY);
      },
      exportEverything: () => store.exportEverything(),
      close: async () => store.close(),
    };
  } catch (error) {
    await store.close();
    throw error;
  }
}
