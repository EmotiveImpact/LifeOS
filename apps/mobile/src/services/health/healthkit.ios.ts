/**
 * Apple Health on iPhone (`@kingstinct/react-native-healthkit`, MIT). The library is loaded only when it's used, so
 * a build without its native module (Expo Go, the web preview) reads nothing instead of failing to open.
 */
import type { HealthSample, SampleType } from '@life/core';
import { HEALTHKIT_QUANTITIES, HEALTHKIT_SLEEP, fromKitQuantity, fromKitSleep, type KitCategory, type KitQuantity } from './mapping';
import { chunks, type PhoneHealthReader } from './reader';

type Kit = typeof import('@kingstinct/react-native-healthkit');

let kit: Kit | null | undefined;
function load(): Kit | null {
  if (kit !== undefined) return kit;
  try { kit = require('@kingstinct/react-native-healthkit') as Kit; } catch { kit = null; }
  return kit;
}

const identifiers = (allowed: Set<SampleType>) => [
  ...(allowed.has('sleep') ? [HEALTHKIT_SLEEP] : []),
  ...HEALTHKIT_QUANTITIES.filter(q => allowed.has(q.type)).map(q => q.id),
];

export const phoneHealth: PhoneHealthReader = {
  id: 'apple-health',
  name: 'Apple Health',
  async available() {
    const k = load();
    try { return !!k && k.isHealthDataAvailable(); } catch { return false; }
  },
  async requestAccess(allowed) {
    const k = load();
    if (!k) return false;
    try { return await k.requestAuthorization({ toRead: identifiers(allowed) as never }); } catch { return false; }
  },
  async read(from, to, allowed) {
    const k = load();
    if (!k) return [];
    const out: HealthSample[] = [];
    for (const [a, b] of chunks(from, to)) {
      const filter = { date: { startDate: new Date(a), endDate: new Date(b) } };
      if (allowed.has('sleep')) {
        const sleep = await k.queryCategorySamples(HEALTHKIT_SLEEP as never, { limit: 0, filter, ascending: true });
        for (const s of sleep as unknown as KitCategory[]) { const m = fromKitSleep(s); if (m) out.push(m); }
      }
      for (const q of HEALTHKIT_QUANTITIES) {
        if (!allowed.has(q.type)) continue;
        const rows = await k.queryQuantitySamples(q.id as never, { limit: 0, filter, ascending: true, unit: q.unit } as never);
        for (const s of rows as unknown as KitQuantity[]) out.push(fromKitQuantity(q.type, q.unit, s));
      }
    }
    return out;
  },
};
