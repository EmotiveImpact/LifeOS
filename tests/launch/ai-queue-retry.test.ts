import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { whenBack } from '../../apps/mobile/src/services/aiQueue';

/**
 * Fix F-46: questions waiting for an answer, and changes waiting to sync, go the moment the phone is back online
 * instead of on the next 30-second try. A question resent after its answer was lost doesn't use the allowance twice
 * (the server half is in tests/api/ai.test.ts).
 */
const root = join(import.meta.dir, '../..');
const read = (path: string) => readFileSync(join(root, path), 'utf8');

describe('coming back online', () => {
  test('only a change from offline to online counts', () => {
    let backs = 0;
    const report = whenBack(() => { backs += 1; });
    report(true); // the first report says where things stand, nothing more
    report(true);
    expect(backs).toBe(0);
    report(false);
    report(false);
    report(true);
    expect(backs).toBe(1);
    report(true);
    report(false);
    report(true);
    expect(backs).toBe(2);
  });

  test('starting offline, the first working connection counts as coming back', () => {
    let backs = 0;
    const report = whenBack(() => { backs += 1; });
    report(false);
    report(true);
    expect(backs).toBe(1);
  });

  test('one report is shared by everyone listening, so a later listener still knows the phone started offline', () => {
    const connection = read('apps/mobile/src/services/connection.ts');
    expect(connection).toContain('const listeners = new Set<() => void>();');
    expect(connection).toContain('if (!stopWatching) stopWatching = watch();');
    expect(connection).toContain("native.addListener('connection', event => report(event?.online === true))");
    expect(connection).toContain("window.addEventListener('online', backNow);");
  });

  test('the queue sends and the phone syncs the moment the connection is back', () => {
    expect(read('apps/mobile/src/services/useAiQueue.ts')).toContain('const stopWatching = onConnectionBack(() => { void flush(); });');
    expect(read('apps/mobile/src/state/SeedProvider.tsx')).toContain('const stopWatching = onConnectionBack(() => { void syncNow(); });');
  });
});

describe('the phone reports its connection, and nothing about the network', () => {
  const ios = read('apps/mobile/modules/life-intelligence/ios/LifeIntelligenceModule.swift');
  const android = read('apps/mobile/modules/life-intelligence/android/src/main/java/app/life/intelligence/LifeIntelligenceModule.kt');

  test('iPhone: the system network monitor, only while Life is listening', () => {
    expect(ios).toContain('Events("transcript", "connection")');
    expect(ios).toContain('OnStartObserving("connection")');
    expect(ios).toContain('OnStopObserving("connection")');
    expect(ios).toContain('let online = path.status == .satisfied');
    expect(ios).toContain('self?.sendEvent("connection", ["online": online])');
    expect(read('apps/mobile/modules/life-intelligence/ios/LifeIntelligence.podspec')).toContain("'Network'");
  });

  test('Android: the default network, working and checked, only while Life is listening', () => {
    expect(android).toContain('Events("transcript", "healthRationale", "connection")');
    expect(android).toContain('OnStartObserving("connection") { watchConnection() }');
    expect(android).toContain('OnStopObserving("connection") { stopWatchingConnection() }');
    expect(android).toContain('manager.registerDefaultNetworkCallback(callback)');
    expect(android).toContain('NetworkCapabilities.NET_CAPABILITY_VALIDATED');
    expect(android).toContain('sendEvent("connection", mapOf("online" to now))');
    expect(read('apps/mobile/modules/life-intelligence/android/src/main/AndroidManifest.xml')).toContain('android.permission.ACCESS_NETWORK_STATE');
  });

  test('only online or offline crosses to JavaScript', () => {
    for (const source of [ios, android]) {
      const sends = source.split('\n').filter(line => line.includes('sendEvent("connection"'));
      expect(sends).toHaveLength(1);
      expect(sends[0]).not.toMatch(/ssid|wifi|cellular|interface|address/i);
    }
  });
});
