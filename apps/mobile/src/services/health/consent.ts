/**
 * The health-data yes (Phase 20), kept free of React so the readers, the runner and the tests can all check it.
 * `state/firstopen.ts` re-exports these and keeps the screens' hooks.
 */
import type { HealthState } from './ingest';

/** Bump when the words on the consent screen change, so an older yes is asked again. */
export const HEALTH_CONSENT_VERSION = 1;

export type HealthType = 'sleep' | 'heart' | 'workouts' | 'food';
export type HealthConsent = {
  version: number;
  at: string;
  /** What the yes covers: numbers you enter, readings from the phone or a wearable, and what you log. */
  scope: ('body' | 'readings' | 'logs')[];
  /** The reading types switched on before Apple Health or Health Connect asked. */
  types: Record<HealthType, boolean>;
  /** Where the yes was given. */
  from: 'first open' | 'body' | 'settings';
};

/** The current yes from the saved choices, or null when there is none or it was given to older words. */
export function consentFrom(choices: Record<string, string>): HealthConsent | null {
  const raw = choices['health-consent'];
  if (!raw) return null;
  try {
    const c = JSON.parse(raw) as HealthConsent;
    return c && c.version === HEALTH_CONSENT_VERSION ? c : null;
  } catch { return null; }
}

/** True when this person said yes and readings have arrived. */
export const hasRealHealth = (data: { choices: Record<string, string>; health: Pick<HealthState, 'days'> }) =>
  consentFrom(data.choices) !== null && data.health.days.length > 0;
