import { describe, expect, test } from 'bun:test';
import { activeGrants, carriesHealthData, consentFor, emptyConsentLedger, grantConsent, revokeAllConsent, revokeConsent, runBrain, CONSENT_POLICY_VERSION, type ModelAdapter, type Request } from '../../packages/brain/src/index.ts';
import { request } from './fixtures.ts';

const NOW = Date.parse('2026-11-20T12:00:00Z');
const cloud = (calls: { n: number }): ModelAdapter => ({ id: 'cloud-model', location: 'cloud', jobs: ['ask', 'draft'], available: async () => true, generate: async () => { calls.n++; return { answer: 'Your take-home is {{fact:net}}.', citations: ['engine:income'], proposals: [] }; } });
const withGrants = (req: Request, ledger: ReturnType<typeof emptyConsentLedger>) => ({ ...req, grants: activeGrants(ledger, NOW) });

describe('standing AI consent', () => {
  test('a grant is recorded with when, what, where and the policy version', () => {
    const ledger = grantConsent(emptyConsentLedger(), { jobs: ['ask'], locations: ['cloud'], health: false }, { id: 'g1', now: NOW });
    expect(ledger.grants).toEqual([{ id: 'g1', scope: { jobs: ['ask'], locations: ['cloud'], health: false }, grantedAt: '2026-11-20T12:00:00.000Z', expiresAt: '2027-11-20T12:00:00.000Z', revokedAt: null, policyVersion: CONSENT_POLICY_VERSION }]);
  });
  test('a standing grant covers its jobs and places without asking each time', async () => {
    const calls = { n: 0 };
    const ledger = grantConsent(emptyConsentLedger(), { jobs: ['ask'], locations: ['cloud'], health: false }, { id: 'g1', now: NOW });
    const result = await runBrain(withGrants(request(), ledger), [cloud(calls)], undefined, { now: () => NOW });
    expect(result.answer).toBe('Your take-home is £2,400.');
    expect(calls.n).toBe(1);
  });
  test('it does not cover other jobs or other places', () => {
    const ledger = grantConsent(emptyConsentLedger(), { jobs: ['ask'], locations: ['server'], health: false }, { id: 'g1', now: NOW });
    expect(consentFor(withGrants({ ...request(), job: 'draft' }, ledger), 'server', NOW).ok).toBe(false);
    expect(consentFor(withGrants(request(), ledger), 'cloud', NOW).ok).toBe(false);
    expect(consentFor(withGrants(request(), ledger), 'server', NOW)).toEqual({ ok: true, via: 'standing', grantId: 'g1' });
  });
  test('revoking takes effect at once, and the record stays for the audit trail', async () => {
    const calls = { n: 0 };
    let ledger = grantConsent(emptyConsentLedger(), { jobs: 'all', locations: ['cloud'], health: false }, { id: 'g1', now: NOW });
    ledger = revokeConsent(ledger, 'g1', NOW + 1000);
    expect(ledger.grants[0].revokedAt).toBe('2026-11-20T12:00:01.000Z');
    expect(activeGrants(ledger, NOW + 2000)).toEqual([]);
    await expect(runBrain(withGrants(request(), ledger), [cloud(calls)], undefined, { now: () => NOW + 2000 })).rejects.toMatchObject({ code: 'CONSENT_REQUIRED' });
    expect(calls.n).toBe(0);
  });
  test('turning everything off revokes every grant', () => {
    let ledger = grantConsent(emptyConsentLedger(), { jobs: ['ask'], locations: ['cloud'], health: false }, { id: 'g1', now: NOW });
    ledger = grantConsent(ledger, { jobs: ['draft'], locations: ['server'], health: false }, { id: 'g2', now: NOW });
    expect(activeGrants(revokeAllConsent(ledger, NOW), NOW + 1)).toEqual([]);
  });
  test('a grant lapses when it expires or when the privacy policy changes', () => {
    const ledger = grantConsent(emptyConsentLedger(), { jobs: 'all', locations: ['cloud'], health: false }, { id: 'g1', now: NOW, months: 1 });
    expect(activeGrants(ledger, NOW + 32 * 86400000)).toEqual([]);
    expect(activeGrants({ ...ledger, policyVersion: CONSENT_POLICY_VERSION + 1 }, NOW)).toEqual([]);
  });
  test('health details need a grant that names health, or that request\'s own consent', () => {
    const health = { ...request('How did I sleep?'), context: { ...request().context, facts: [{ id: 'sleep.average', label: 'Average sleep', value: '6h 58m', sensitivity: 'health' as const, source: { id: 'engine:sleep', label: 'Sleep', kind: 'engine' as const } }] } };
    expect(carriesHealthData(health)).toBe(true);
    expect(carriesHealthData(request())).toBe(false);
    const plain = grantConsent(emptyConsentLedger(), { jobs: 'all', locations: ['cloud'], health: false }, { id: 'g1', now: NOW });
    expect(consentFor(withGrants(health, plain), 'cloud', NOW)).toEqual({ ok: false, reason: 'HEALTH_NEEDS_CONSENT' });
    const named = grantConsent(emptyConsentLedger(), { jobs: 'all', locations: ['cloud'], health: true }, { id: 'g2', now: NOW });
    expect(consentFor(withGrants(health, named), 'cloud', NOW).ok).toBe(true);
    expect(consentFor({ ...withGrants(health, plain), consent: { requestId: 'request-a', locations: ['cloud'] } }, 'cloud', NOW)).toEqual({ ok: true, via: 'request' });
  });
  test('memories marked health count as health details too', () => {
    const req = { ...request(), context: { ...request().context, memories: [{ id: 'm', text: 'Finds Sunday evenings hard', sensitivity: 'health' as const, source: { id: 'memory:m', label: 'Chat', kind: 'memory' as const } }] } };
    expect(carriesHealthData(req)).toBe(true);
  });
  test('a grant can never be stretched: forged, revoked or out-of-date grants on a request do not count', () => {
    const forged = { ...request(), grants: [{ id: 'x', scope: { jobs: 'all' as const, locations: ['cloud' as const], health: true }, grantedAt: '2026-11-20T12:00:00.000Z', expiresAt: '2026-11-21T12:00:00.000Z', revokedAt: '2026-11-20T12:30:00.000Z', policyVersion: CONSENT_POLICY_VERSION }] };
    expect(consentFor(forged, 'cloud', NOW + 3600000).ok).toBe(false);
  });
  test('private mode still keeps everything on the phone, whatever was granted', async () => {
    const calls = { n: 0 };
    const ledger = grantConsent(emptyConsentLedger(), { jobs: 'all', locations: ['cloud'], health: true }, { id: 'g1', now: NOW });
    await expect(runBrain({ ...withGrants(request(), ledger), privateMode: true }, [cloud(calls)], undefined, { now: () => NOW })).rejects.toMatchObject({ code: 'UNAVAILABLE' });
    expect(calls.n).toBe(0);
  });
  test('the device never needs a grant', () => expect(consentFor(request(), 'device', NOW)).toEqual({ ok: true, via: 'device' }));
});
