import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';
import { forgetLocalData, openLocalData } from '../data';
import { LEGACY_STATE_KEY, type ProjectionStorage } from './persistence.types';
import { FRESH_START, FRESH_START_KEY } from './freshStart';

const LOCAL_USER_KEY = 'life.local-user-id';

/**
 * A review build ticked "Start from the beginning" opens on a new, empty local scope the first time it runs, and
 * removes the old one, whatever shape an older build left it in (`state/freshStart.ts`). Never in a real build.
 */
async function startFreshOnce(token: string) {
  if (await AsyncStorage.getItem(FRESH_START_KEY) === token) return;
  const previous = await SecureStore.getItemAsync(LOCAL_USER_KEY);
  if (previous) {
    await forgetLocalData(previous).catch(() => {});
    await SecureStore.deleteItemAsync(LOCAL_USER_KEY);
  }
  await AsyncStorage.removeItem(LEGACY_STATE_KEY);
  await AsyncStorage.setItem(FRESH_START_KEY, token);
}

/** Native data is encrypted SQLite. Initialization failures are deliberately
 * propagated: continuing with a plaintext store would violate the data boundary. */
export async function openProjectionStorage(): Promise<ProjectionStorage> {
  if (FRESH_START) await startFreshOnce(FRESH_START);
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
      clear: async (scope = 'everywhere') => {
        if (scope === 'this-phone') await store.eraseThisPhone(); else await store.deleteEverything();
        await AsyncStorage.removeItem(LEGACY_STATE_KEY);
      },
      exportEverything: () => store.exportEverything(),
      close: async () => store.close(),
      sync: transport => store.sync(transport),
      adoptAccount: (accountId, restore) => store.adoptAccount(accountId, { restore }),
    };
  } catch (error) {
    await store.close();
    throw error;
  }
}
