/**
 * Standing AI consent: a revocable OK, by job and by where the model runs,
 * so a cloud answer doesn't need a fresh OK every time (gap 9). One-off
 * consent for a single request still works exactly as before.
 *
 * Rules:
 * - The phone never needs consent. Private mode keeps everything on the phone
 *   whatever was granted (the runtime drops off-phone models first).
 * - A grant names its jobs (or all), its places (server, cloud) and whether
 *   it covers health details. Health details travel only under a grant that
 *   names health, or with that request's own consent.
 * - Grants expire (12 months by default), lapse when the privacy policy
 *   version changes, and revoke at once. Revoked grants stay in the ledger so
 *   there is a record of what was agreed and when (UK GDPR).
 * - The API must check against its own synced copy of the ledger, never the
 *   grants a request carries; consentFor() takes whichever list it is given.
 */
import type { Job, ModelLocation, Request } from './types.ts';

export type RemoteLocation = Exclude<ModelLocation, 'device'>;
export type ConsentScope = { jobs: Job[] | 'all'; locations: RemoteLocation[]; health: boolean };
export type ConsentGrant = { id: string; scope: ConsentScope; grantedAt: string; expiresAt: string | null; revokedAt: string | null; policyVersion: number };
export type ConsentLedger = { version: 1; policyVersion: number; grants: ConsentGrant[] };
export type ConsentCheck = { ok: true; via: 'device' | 'request' | 'standing'; grantId?: string } | { ok: false; reason: 'NO_CONSENT' | 'HEALTH_NEEDS_CONSENT' };

/** Bump when the privacy policy or the list of model providers changes in a
 * way people should agree to again. Every older grant then lapses. */
export const CONSENT_POLICY_VERSION = 1;
export const emptyConsentLedger = (): ConsentLedger => ({ version: 1, policyVersion: CONSENT_POLICY_VERSION, grants: [] });

const iso = (ms: number) => new Date(ms).toISOString();
const addMonths = (ms: number, months: number) => { const d = new Date(ms); d.setUTCMonth(d.getUTCMonth() + months); return d.getTime(); };

export function grantConsent(ledger: ConsentLedger, scope: ConsentScope, options: { id: string; now: number; months?: number | null }): ConsentLedger {
  const months = options.months === undefined ? 12 : options.months;
  const grant: ConsentGrant = { id: options.id, scope: { jobs: scope.jobs === 'all' ? 'all' : [...scope.jobs], locations: [...scope.locations], health: scope.health }, grantedAt: iso(options.now), expiresAt: months === null ? null : iso(addMonths(options.now, months)), revokedAt: null, policyVersion: CONSENT_POLICY_VERSION };
  return { ...ledger, grants: [...ledger.grants, grant] };
}
export function revokeConsent(ledger: ConsentLedger, grantId: string, now: number): ConsentLedger {
  return { ...ledger, grants: ledger.grants.map(g => g.id === grantId && !g.revokedAt ? { ...g, revokedAt: iso(now) } : g) };
}
export function revokeAllConsent(ledger: ConsentLedger, now: number): ConsentLedger {
  return { ...ledger, grants: ledger.grants.map(g => g.revokedAt ? g : { ...g, revokedAt: iso(now) }) };
}

const LOCATIONS: RemoteLocation[] = ['server', 'cloud'];
function live(grant: unknown, now: number, policyVersion = CONSENT_POLICY_VERSION): grant is ConsentGrant {
  if (!grant || typeof grant !== 'object') return false;
  const g = grant as ConsentGrant;
  if (typeof g.id !== 'string' || !g.scope || typeof g.scope !== 'object' || g.revokedAt !== null || g.policyVersion !== policyVersion || g.policyVersion !== CONSENT_POLICY_VERSION) return false;
  if (!(g.scope.jobs === 'all' || (Array.isArray(g.scope.jobs) && g.scope.jobs.every(j => typeof j === 'string')))) return false;
  if (!Array.isArray(g.scope.locations) || !g.scope.locations.every(l => LOCATIONS.includes(l)) || typeof g.scope.health !== 'boolean') return false;
  const granted = Date.parse(g.grantedAt);
  if (!Number.isFinite(granted) || granted > now) return false;
  return g.expiresAt === null || (Number.isFinite(Date.parse(g.expiresAt)) && Date.parse(g.expiresAt) > now);
}
/** The grants that count right now. */
export const activeGrants = (ledger: ConsentLedger, now: number): ConsentGrant[] => ledger.grants.filter(g => live(g, now, ledger.policyVersion));

const HEALTH_IDS = /^(?:record:)?(?:health|body|sleep|readiness|mood|cycle|medical|heart|weight)[.:-]/i;
/** True when the request's context holds health details. Facts and memories
 * are marked by the app (`sensitivity: 'health'`); known health ids count too. */
export function carriesHealthData(request: Request): boolean {
  return request.context.facts.some(f => f.sensitivity === 'health' || HEALTH_IDS.test(f.id)) || request.context.memories.some(m => m.sensitivity === 'health');
}

/** Whether a model at `location` may receive this request. */
export function consentFor(request: Request, location: ModelLocation, now: number): ConsentCheck {
  if (location === 'device') return { ok: true, via: 'device' };
  if (request.consent?.requestId === request.id && request.consent.locations.includes(location)) return { ok: true, via: 'request' };
  const covering = (request.grants ?? []).filter(g => live(g, now)).filter(g => (g.scope.jobs === 'all' || g.scope.jobs.includes(request.job)) && g.scope.locations.includes(location));
  if (!covering.length) return { ok: false, reason: 'NO_CONSENT' };
  const grant = carriesHealthData(request) ? covering.find(g => g.scope.health) : covering[0];
  return grant ? { ok: true, via: 'standing', grantId: grant.id } : { ok: false, reason: 'HEALTH_NEEDS_CONSENT' };
}
