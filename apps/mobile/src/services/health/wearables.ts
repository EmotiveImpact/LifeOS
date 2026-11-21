/**
 * WHOOP and Oura on the phone (BUILD_V26 Phase 26). They connect through their own sign-in pages via the life API,
 * which keeps the sealed tokens; readings come back through the API as samples and are summarised here with the
 * phone's own. Never Bluetooth.
 */
import { Linking } from 'react-native';
import type { HealthSample } from '@life/core';
import { BrainError } from '@life/brain';
import { apiConfigured, apiFetch } from '../brain';
import type { SampleReader } from './reader';

export type Wearable = 'whoop' | 'oura';
export const WEARABLES: { id: Wearable; name: string }[] = [{ id: 'whoop', name: 'WHOOP' }, { id: 'oura', name: 'Oura' }];
export const wearableName = (id: Wearable) => WEARABLES.find(w => w.id === id)?.name ?? id;

export interface WearableStatus { available: Wearable[]; connections: { provider: Wearable; name: string; since: string }[] }
export type WearableProblem = { provider: Wearable; problem: 'reconnect' | 'unavailable' };

const NONE: WearableStatus = { available: [], connections: [] };

export async function wearableStatus(): Promise<WearableStatus> {
  if (!apiConfigured) return NONE;
  try {
    const res = await apiFetch('/wearables');
    return res.ok ? await res.json() as WearableStatus : NONE;
  } catch { return NONE; }
}

/** Opens the wearable's own sign-in page. False when the API or the wearable's developer app isn't set up. */
export async function connectWearable(id: Wearable): Promise<boolean> {
  if (!apiConfigured) return false;
  try {
    const res = await apiFetch(`/wearables/${id}/connect`, { method: 'POST' });
    if (!res.ok) return false;
    const { url } = await res.json() as { url: string };
    await Linking.openURL(url);
    return true;
  } catch { return false; }
}

export async function disconnectWearable(id: Wearable): Promise<boolean> {
  try { return (await apiFetch(`/wearables/${id}/disconnect`, { method: 'POST' })).ok; } catch { return false; }
}

/**
 * Every connected wearable as one reader. A wearable that needs connecting again reads nothing (and is reported);
 * no connection or a wearable that is down throws, so the read waits and nothing stored is lost.
 */
export function wearablesReader(onProblem?: (problems: WearableProblem[]) => void): SampleReader {
  return {
    id: 'whoop',
    name: 'WHOOP and Oura',
    async read(from, to, allowed) {
      const res = await apiFetch(`/wearables/samples?from=${Math.floor(from)}&to=${Math.ceil(to)}`);
      if (!res.ok) throw new BrainError('UNAVAILABLE', 'Wearables are unavailable.');
      const body = await res.json() as { samples: HealthSample[]; problems: WearableProblem[] };
      onProblem?.(body.problems);
      if (body.problems.some(p => p.problem === 'unavailable')) throw new BrainError('UNAVAILABLE', `${body.problems.map(p => wearableName(p.provider)).join(' and ')} didn’t answer.`);
      return body.samples.filter(s => allowed.has(s.type));
    },
  };
}
