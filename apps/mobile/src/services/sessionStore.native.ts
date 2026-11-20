import * as SecureStore from 'expo-secure-store';

/** The account session and this phone's device id, kept in the Keychain / Keystore and never in plain storage. */
export const sessionStore = {
  get: (key: string) => SecureStore.getItemAsync(key),
  set: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  remove: (key: string) => SecureStore.deleteItemAsync(key),
};
