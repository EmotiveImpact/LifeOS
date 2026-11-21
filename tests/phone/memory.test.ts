import { describe, expect, test } from 'bun:test';
import { EMBEDDER, emptyBrainState, extractStatements } from '../../packages/brain/src/index.ts';
import { brainContext } from '../../apps/mobile/src/services/brainContext.ts';
import { confirmBrainRecords, proposalRecord } from '../../apps/mobile/src/services/brainState.ts';
import { editMemory, forgetMemory, memoriesFor, noteUse, purgeForgotten } from '../../apps/mobile/src/services/memory.ts';
import { LifeDataStore } from '../../apps/mobile/src/data/store';
import { seedProfile, type MemoryEntry } from '../../apps/mobile/src/state/seed.ts';
import type { SeedData } from '../../apps/mobile/src/state/SeedProvider.tsx';
import { memoryDriver } from '../support/sqlite';

/** BUILD_V26 Phase 25: "What life remembers" on the phone: added only from confirmed filings, searched per reply,
 * corrected and forgotten by the person, and never used again once forgotten. */
const NOW = Date.parse('2026-11-20T12:00:00Z');
const said = (text: string, at = '2026-11-20T12:00:00Z') => extractStatements(text).map(p => proposalRecord(p, 'talk', at));
const life = (memories: MemoryEntry[], extra: Partial<SeedData> = {}) => ({ brain: emptyBrainState(), profile: seedProfile, completed: [], records: [], memories, flags: {}, proposals: [], ...extra }) as unknown as SeedData;
const confirm = (data: SeedData, now = NOW) => { const out = confirmBrainRecords(data, now); return { ...data, ...out, records: [...data.records.filter(r => !data.proposals.some(p => p.id === r.id)), ...data.proposals.map(p => ({ ...p, status: 'confirmed' as const }))], proposals: [] } as SeedData; };

describe('adding from confirmed filings', () => {
  test('a confirmed detail becomes a memory with its kind, the date it became true and its source', () => {
    const data = confirm(life([], { proposals: said('My rent is £950 a month.') }));
    expect(data.memories).toHaveLength(1);
    expect(data.memories[0]).toMatchObject({ id: 'confirmed:rent', recordId: 'rent', kind: 'fact', category: 'Money', validFrom: '2026-11-20T12:00:00.000Z' });
    expect(data.memories[0].source).toMatch(/^Confirmed from talk/);
  });
  test('a changed value closes the old memory and starts a new one; the old is never used to answer', () => {
    let data = confirm(life([], { proposals: said('My rent is £950 a month.') }));
    data = confirm({ ...data, proposals: said('My rent is £1,050 a month.') }, NOW + 60_000);
    const [old, current] = data.memories;
    expect(old).toMatchObject({ id: 'confirmed:rent', validTo: '2026-11-20T12:01:00.000Z' });
    expect(current.text).toMatch(/1,?050/);
    expect(current.validTo).toBeUndefined();
    expect(brainContext(data).memories.map(m => m.id)).toEqual([current.id]);
  });
});

describe('searching per reply', () => {
  test('only the memories that fit the message go with it', () => {
    const memories: MemoryEntry[] = [{ id: 'kofi', text: 'Kofi loves cooking.', source: 'Chat', category: 'People' }, { id: 'walk', text: 'Prefers walking meetings.', source: 'Chat' }];
    const data = life(memories);
    expect(memoriesFor('What should I cook for Kofi?', brainContext(data).memories, data.memories, NOW).map(m => m.id)).toEqual(['kofi']);
  });
  test('memories an answer cited count as useful', () => {
    const memories: MemoryEntry[] = [{ id: 'kofi', text: 'Kofi loves cooking.', source: 'Chat' }, { id: 'walk', text: 'Prefers walking meetings.', source: 'Chat' }];
    expect(noteUse(memories, ['memory:kofi', 'engine:income'], NOW)).toEqual([{ ...memories[0], lastUsed: '2026-11-20T12:00:00.000Z', uses: 1 }, memories[1]]);
    expect(noteUse(memories, [], NOW)).toBe(memories);
  });
});

describe('correcting and forgetting', () => {
  const memories: MemoryEntry[] = [{ id: 'secret', text: 'Thinking about leaving the bakery.', source: 'Chat' }, { id: 'kept', text: 'Kofi loves cooking.', source: 'Talk' }];
  test('a correction is the person’s own, and says so', () => {
    const [edited] = editMemory(memories, 'secret', '  Thinking about leaving   the bakery in spring. ', NOW);
    expect(edited).toMatchObject({ text: 'Thinking about leaving the bakery in spring.', source: 'Edited by you · 20 Nov', confidence: 1 });
    expect(editMemory(memories, 'secret', '   ')).toBe(memories);
  });
  test('a deleted memory is never used again', async () => {
    // Forgotten on the memory screen: hidden at once (Undo still works), deleted when the person leaves.
    let data = life(memories, { flags: { 'forgot-secret': true } });
    expect(brainContext(data).memories.map(m => m.id)).toEqual(['kept']);
    data = purgeForgotten(data);
    expect(data.memories.map(m => m.id)).toEqual(['kept']);
    expect(data.flags).toEqual({});
    expect(memoriesFor('leaving the bakery', brainContext(data).memories, data.memories, NOW)).toEqual([]);
    expect(forgetMemory(memories, 'secret').map(m => m.id)).toEqual(['kept']);

    // On this phone the row keeps only its dates, and the delete that syncs carries no words.
    const store = await new LifeDataStore(memoryDriver().driver, 'phone').initialise();
    await store.commitProjection({ ...life(memories), prefs: {}, people: [], meals: [], habits: [], learned: [], missionSteps: {}, choices: {}, onboardingDone: true });
    await store.commitProjection({ ...life(forgetMemory(memories, 'secret')), prefs: {}, people: [], meals: [], habits: [], learned: [], missionSteps: {}, choices: {}, onboardingDone: true });
    const rows = await store.repos.memory.list({ includeDeleted: true });
    const gone = rows.find(r => r.deleted_at);
    expect(gone).toMatchObject({ text: null, source: null, embedding: null });
    expect(JSON.stringify(await store.pending())).not.toContain('bakery');
    expect((await store.loadProjection<{ memories: MemoryEntry[] }>())?.memories.map(m => m.id)).toEqual(['kept']);
  });
  test('a memory drawn from a record goes when the record goes', () => {
    const data = life([{ id: 'confirmed:rent', text: 'Rent: £950', source: 'Talk', recordId: 'rent' }, { id: 'kept', text: 'Kofi loves cooking.', source: 'Talk' }], { records: [{ id: 'rent', status: 'removed' }] as never });
    expect(brainContext(data).memories.map(m => m.id)).toEqual(['kept']);
    expect(purgeForgotten(data).memories.map(m => m.id)).toEqual(['kept']);
  });
});

describe('what travels with a memory', () => {
  test('its attributes and vector are kept through the phone’s store', async () => {
    const store = await new LifeDataStore(memoryDriver().driver, 'phone').initialise();
    const memory: MemoryEntry = { id: 'walk', text: 'Prefers walking meetings.', source: 'Chat', kind: 'preference', confidence: 0.8, validFrom: '2026-11-01T00:00:00.000Z', uses: 3, lastUsed: '2026-11-19T00:00:00.000Z' };
    await store.commitProjection({ ...life([memory]), prefs: {}, people: [], meals: [], habits: [], learned: [], missionSteps: {}, choices: {}, onboardingDone: true });
    const [row] = await store.repos.memory.list();
    expect((row.embedding as { model: string }).model).toBe(EMBEDDER);
    expect((await store.loadProjection<{ memories: MemoryEntry[] }>())?.memories[0]).toEqual(memory);
  });
});
