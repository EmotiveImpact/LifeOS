import type { LifeDataStore } from './store';

/** Web preview deliberately keeps the existing local seed adapter. It must not
 * claim that a browser's plaintext cache is the encrypted native database. */
export async function openLocalData(_userId: string): Promise<{ store: LifeDataStore; orm: unknown }> {
  throw new Error('Encrypted SQLite requires a native development build; use the existing web preview adapter on web.');
}
