/**
 * Keeps health readings current (BUILD_V26 Phase 26). Runs when the app opens, when it comes back to the front, and
 * when Devices connects something, at most every 15 minutes otherwise. Reads only with a recorded yes to health data
 * (Phase 20 consent), only the kinds switched on, and only from sources the person connected.
 */
import { useCallback, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import type { Preferred } from '@life/core';
import { useSeed } from '@/state/SeedProvider';
import { readHealthConsent } from '@/state/firstopen';
import { apiConfigured } from '../brain';
import { ingestHealth } from './ingest';
import { allowedTypes } from './mapping';
import { phoneHealth } from './phone';
import type { SampleReader } from './reader';
import { wearablesReader, type WearableProblem } from './wearables';

export const HEALTH_READ_EVERY_MS = 15 * 60_000;

let trigger: (() => void) | null = null;
/** Reads now (after connecting a source, or "Check again"). */
export const readHealthNow = () => trigger?.();

let problems: WearableProblem[] = [];
/** What the last wearable read reported, for Devices ("Connect WHOOP again"). */
export const lastWearableProblems = () => problems;

/** The source picked for a measure in Sources ("health-prefer-sleep"), which wins whenever it has a reading. */
export const preferredSources = (choices: Record<string, string>): Preferred =>
  Object.fromEntries(Object.entries(choices).filter(([k, v]) => k.startsWith('health-prefer-') && v).map(([k, v]) => [k.slice('health-prefer-'.length), v])) as Preferred;

export function useHealthRunner() {
  const { data, update, hydrated } = useSeed();
  const latest = useRef(data), running = useRef(false);
  latest.current = data;

  const run = useCallback(async (force: boolean) => {
    if (running.current || !hydrated) return;
    const now = Date.now(), d = latest.current, consent = readHealthConsent(d);
    if (!consent) return;
    if (!force && d.health.anchor && now - d.health.anchor < HEALTH_READ_EVERY_MS) return;
    const readers: SampleReader[] = [];
    if (d.flags['health-connected'] && await phoneHealth.available()) readers.push(phoneHealth);
    if (apiConfigured && (d.flags['device-whoop'] || d.flags['device-oura'])) readers.push(wearablesReader(p => { problems = p; }));
    if (!readers.length) return;
    running.current = true;
    try {
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const result = await ingestHealth(d.health, { readers, allowed: allowedTypes(consent.types, d.choices), now, timeZone, age: d.profile.age || undefined, preferred: preferredSources(d.choices) });
      // The yes may have been withdrawn while reading: nothing read is kept then.
      update(c => (readHealthConsent(c) ? { ...c, health: result.state } : c));
    } finally { running.current = false; }
  }, [hydrated, update]);

  useEffect(() => {
    trigger = () => { void run(true); };
    void run(false);
    const sub = AppState.addEventListener('change', s => { if (s === 'active') void run(false); });
    return () => { sub.remove(); trigger = null; };
  }, [run]);
}
