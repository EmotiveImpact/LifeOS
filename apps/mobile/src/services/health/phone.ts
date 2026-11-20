/**
 * The phone's health store on platforms without one (the web preview), and the default import for tests. iOS and
 * Android resolve `phone.ios.ts` and `phone.android.ts` instead.
 */
import type { PhoneHealthReader } from './reader';

export const phoneHealth: PhoneHealthReader = {
  id: 'apple-health',
  name: 'Apple Health',
  available: async () => false,
  requestAccess: async () => false,
  read: async () => [],
};
