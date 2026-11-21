/**
 * Health Connect on Android (`react-native-health-connect`, MIT). Its config plugin adds the permission rationale
 * screen Health Connect requires. A build without the native module reads nothing instead of failing.
 */
import type { HealthSample } from '@life/core';
import { connectRecordsFor, fromConnectRecord, type ConnectRecord, type ConnectRecordType } from './mapping';
import { chunks, type PhoneHealthReader } from './reader';

type Connect = typeof import('react-native-health-connect');

let lib: Connect | null | undefined;
function load(): Connect | null {
  if (lib !== undefined) return lib;
  try { lib = require('react-native-health-connect') as Connect; } catch { lib = null; }
  return lib;
}
let ready: Promise<boolean> | null = null;
async function start(c: Connect): Promise<boolean> {
  ready ??= (async () => {
    try { return await c.getSdkStatus() === c.SdkAvailabilityStatus.SDK_AVAILABLE && await c.initialize(); } catch { return false; }
  })();
  const ok = await ready;
  if (!ok) ready = null;
  return ok;
}

export const phoneHealth: PhoneHealthReader = {
  id: 'health-connect',
  name: 'Health Connect',
  async available() {
    const c = load();
    return !!c && start(c);
  },
  async requestAccess(allowed) {
    const c = load();
    if (!c || !await start(c)) return false;
    const wanted = connectRecordsFor(allowed);
    try {
      const granted = await c.requestPermission(wanted.map(recordType => ({ accessType: 'read' as const, recordType })) as never);
      return wanted.some(type => (granted as { recordType?: string; accessType?: string }[]).some(g => g.recordType === type && g.accessType === 'read'));
    } catch { return false; }
  },
  async read(from, to, allowed) {
    const c = load();
    if (!c || !await start(c)) return [];
    const out: HealthSample[] = [];
    for (const recordType of connectRecordsFor(allowed)) {
      for (const [a, b] of chunks(from, to)) {
        let pageToken: string | undefined;
        do {
          const page = await c.readRecords(recordType as never, { timeRangeFilter: { operator: 'between', startTime: new Date(a).toISOString(), endTime: new Date(b).toISOString() }, pageSize: 1000, pageToken });
          for (const r of page.records as unknown as ConnectRecord[]) out.push(...fromConnectRecord(recordType as ConnectRecordType, r));
          pageToken = page.pageToken || undefined;
        } while (pageToken);
      }
    }
    return out;
  },
};
