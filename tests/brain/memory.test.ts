import { describe, expect, test } from 'bun:test';
import { EMBEDDER, applyMemoryChanges, cosine, embed, planMemoryChanges, rankMemories, type MemoryCandidate, type StoredMemory } from '../../packages/brain/src/index.ts';

/** BUILD_V26 Phase 25: life's own memory layer (the owner chose to own it rather than run mem0). */
const source = { id: 'memory:x', label: 'From your chat', kind: 'memory' as const };
const NOW = Date.parse('2026-11-20T12:00:00Z');
const memory = (id: string, text: string, extra: Partial<StoredMemory> = {}): StoredMemory => ({ id, text, source: { ...source, id: `memory:${id}` }, ...extra });
const candidate = (text: string, extra: Partial<MemoryCandidate> = {}): MemoryCandidate => ({ text, kind: 'fact', source, ...extra });
let n = 0;
const newId = () => `m${++n}`;

describe('vectors', () => {
  test('the same words give the same vector anywhere, scaled to length one', () => {
    const a = embed('Kofi loves cooking'), b = embed('Kofi loves cooking');
    expect(a).toEqual(b);
    expect(a.model).toBe(EMBEDDER);
    expect(a.values).toHaveLength(256);
    expect(Math.hypot(...a.values)).toBeCloseTo(1, 6);
    expect(cosine(embed('Kofi likes to cook'), a)).toBeGreaterThan(cosine(embed('my council tax bill'), a));
  });
  test('vectors from another embedder are never compared', () => {
    expect(cosine(embed('rent'), { model: 'another-model', values: embed('rent').values })).toBe(0);
  });
});

describe('finding memories for a question', () => {
  const memories = [
    memory('kofi', 'Kofi loves cooking.', { validFrom: '2026-11-01T00:00:00Z' }),
    memory('walk', 'Prefers walking meetings.', { validFrom: '2026-11-01T00:00:00Z' }),
    memory('council', 'Works at the council.', { validFrom: '2025-01-01T00:00:00Z', validTo: '2026-10-01T00:00:00Z' }),
    memory('nhs', 'Works at the NHS.', { validFrom: '2026-10-01T00:00:00Z' }),
  ];
  test('the closest meaning comes first, and nothing unrelated is sent', () => {
    expect(rankMemories('What should I cook for Kofi?', memories, { now: NOW }).map(m => m.id)).toEqual(['kofi']);
    expect(rankMemories('What is the weather?', memories, { now: NOW })).toEqual([]);
    expect(rankMemories('', memories, { now: NOW })).toEqual([]);
  });
  test('a closed memory is kept but never used to answer', () => {
    expect(rankMemories('Where do I work?', memories, { now: NOW }).map(m => m.id)).toEqual(['nhs']);
  });
  test('between equal matches, the recent and useful one wins', () => {
    const twins = [memory('old', 'Likes running in the park.', { validFrom: '2025-01-01T00:00:00Z' }), memory('new', 'Likes running in the park.', { lastUsed: '2026-11-19T00:00:00Z', uses: 6 })];
    expect(rankMemories('running', twins, { now: NOW }).map(m => m.id)).toEqual(['new', 'old']);
  });
  test('at most the limit', () => {
    const many = Array.from({ length: 12 }, (_, i) => memory(`r${i}`, `Rent note ${i}`));
    expect(rankMemories('rent', many, { now: NOW, limit: 4 })).toHaveLength(4);
  });
});

describe('the memory loop: add, merge, close or ignore', () => {
  test('a new thing is added with its vector, kind, source and the date it became true', () => {
    const [change] = planMemoryChanges([candidate('Prefers walking meetings.', { kind: 'preference' })], [], { now: NOW, newId });
    expect(change.op).toBe('add');
    if (change.op !== 'add') return;
    expect(change.memory).toMatchObject({ text: 'Prefers walking meetings.', kind: 'preference', validFrom: '2026-11-20T12:00:00.000Z', uses: 0, confidence: 1 });
    expect(change.memory.vector?.model).toBe(EMBEDDER);
  });
  test('the same thing again is ignored, even in one batch', () => {
    const existing = [memory('walk', 'Prefers walking meetings.', { kind: 'preference' })];
    expect(planMemoryChanges([candidate('prefers walking meetings', { kind: 'preference' })], existing, { now: NOW, newId })[0]).toMatchObject({ op: 'ignore', reason: 'duplicate' });
    const twice = planMemoryChanges([candidate('Loves jazz.', { kind: 'preference' }), candidate('Loves jazz!', { kind: 'preference' })], [], { now: NOW, newId });
    expect(twice.map(c => c.op)).toEqual(['add', 'ignore']);
  });
  test('the same thing said a new way is merged into the memory it restates', () => {
    const existing = [memory('walk', 'Prefers walking meetings at work.', { kind: 'preference' })];
    const [change] = planMemoryChanges([candidate('Prefers walking meetings at work most days.', { kind: 'preference' })], existing, { now: NOW, newId });
    expect(change).toMatchObject({ op: 'merge', id: 'walk', memory: { id: 'walk', text: 'Prefers walking meetings at work most days.' } });
  });
  test('a changed record closes the old memory and starts a new one, so the history stays true', () => {
    const existing = [memory('rent-1', 'Rent: £950 a month', { recordId: 'rent', kind: 'fact' })];
    const changes = planMemoryChanges([candidate('Rent: £1,050 a month', { recordId: 'rent' })], existing, { now: NOW, newId });
    expect(changes.map(c => c.op)).toEqual(['close', 'add']);
    const next = applyMemoryChanges(existing, changes, m => m);
    expect(next.find(m => m.id === 'rent-1')?.validTo).toBe('2026-11-20T12:00:00.000Z');
    expect(next.filter(m => !m.validTo).map(m => m.text)).toEqual(['Rent: £1,050 a month']);
    // Re-confirming the same value changes nothing.
    expect(planMemoryChanges([candidate('Rent: £1,050 a month', { recordId: 'rent' })], next, { now: NOW, newId })[0].op).toBe('ignore');
  });
  test('a memory the model says is now untrue is closed, not deleted', () => {
    const existing = [memory('council', 'Works at the council.', { kind: 'fact' })];
    const changes = planMemoryChanges([candidate('Works at the NHS.', { replaces: 'council' })], existing, { now: NOW, newId });
    expect(changes.map(c => c.op)).toEqual(['close', 'add']);
  });
  test('health and other details never merge into each other', () => {
    const existing = [memory('sleep', 'Sleeps badly before work trips.', { kind: 'pattern', sensitivity: 'health' })];
    expect(planMemoryChanges([candidate('Sleeps badly before work trips.', { kind: 'pattern' })], existing, { now: NOW, newId })[0].op).toBe('add');
  });
  test('empty, overlong or unknown kinds are ignored', () => {
    expect(planMemoryChanges([candidate('  '), candidate('x'.repeat(301)), { ...candidate('Fine'), kind: 'secret' as never }], [], { now: NOW, newId }).map(c => c.op)).toEqual(['ignore', 'ignore', 'ignore']);
  });
});
