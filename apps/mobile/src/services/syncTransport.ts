import { createHttpTransport } from '@/data/httpTransport';
import type { SyncTransport } from '@/data/store';
import { accountBase, deviceId, sessionToken } from './account';

/** The way to the account's other phones, or null while there's no API configured or nobody is signed in. */
export async function currentTransport(): Promise<SyncTransport | null> {
  const base = accountBase();
  if (!base || !await sessionToken()) return null;
  return createHttpTransport({ base, token: sessionToken, deviceId });
}
