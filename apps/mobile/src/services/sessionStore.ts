/** The web preview keeps the account session in memory only, so a refresh signs out. Phones use
 * `sessionStore.native.ts` (SecureStore); Metro picks it on iOS and Android. */
const memory = new Map<string, string>();
export const sessionStore = {
  get: async (key: string) => memory.get(key) ?? null,
  set: async (key: string, value: string) => { memory.set(key, value); },
  remove: async (key: string) => { memory.delete(key); },
};
