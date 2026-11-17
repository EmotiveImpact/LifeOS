import { describe, expect, test } from 'bun:test';
import { extractStatements, emptyBrainState } from '../../packages/brain/src/index.ts';
import { brainContext } from '../../apps/mobile/src/services/brainContext.ts';
import { aimReadKey } from '../../apps/mobile/src/state/dayCore.ts';
import { seedProfile } from '../../apps/mobile/src/state/seed.ts';
import { proposalRecord, confirmBrainRecords } from '../../apps/mobile/src/services/brainState.ts';
import type { SeedData } from '../../apps/mobile/src/state/SeedProvider.tsx';

const state = (text: string) => ({ brain: emptyBrainState(), memories: [], proposals: extractStatements(text).map(proposal => proposalRecord(proposal, 'chat', '2026-11-16T12:00:00Z')) }) as unknown as SeedData;
describe('confirmation and profile boundary', () => {
  test('household proposal carries a patch but is not yet a confirmed fact', () => {
    const data = state('I live with two flatmates.');
    expect(data.proposals[0].status).toBe('proposed');
    expect(data.proposals[0].profilePatch).toEqual({ householdSize: 3 });
    expect(data.memories).toEqual([]);
  });
  test('confirmation links a memory to its authoritative record', () => {
    const confirmed = confirmBrainRecords(state('I live with two flatmates.'));
    expect(confirmed.brain.confirmedRecordIds).toEqual(['home']);
    expect(confirmed.memories[0].recordId).toBe('home');
    expect(confirmed.memories[0].text).toBe('Shares with 2 other adults');
  });
  test('a removed proposal cannot become memory', () => {
    const data = state('I live alone.'); data.proposals[0].status = 'removed';
    expect(confirmBrainRecords(data).memories).toEqual([]);
    expect(confirmBrainRecords(data).brain.confirmedRecordIds).toEqual([]);
  });
  test('repeated confirmation does not duplicate memory', () => {
    const data = state('Remember that Kofi likes cooking.');
    const once = confirmBrainRecords(data);
    const twice = confirmBrainRecords({ ...data, ...once });
    expect(twice.memories).toHaveLength(1);
    expect(twice.brain.confirmedRecordIds).toHaveLength(1);
  });
  test('forgotten memories never enter brain context', () => {
    const data = { brain: emptyBrainState(), profile: seedProfile, completed: [], records: [], memories: [{ id: 'secret', text: 'Private detail', source: 'Chat' }, { id: 'kept', text: 'Keep this', source: 'Talk' }], flags: { 'forgot-secret': true } } as unknown as SeedData;
    expect(brainContext(data).memories.map(memory => memory.id)).toEqual(['kept']);
  });
  test('Aim read keys use the current local calendar day', () => {
    expect(aimReadKey('night', new Date(2027, 0, 3, 23, 30))).toBe('2027-01-03-night');
  });
});
