import { describe, expect, test } from 'bun:test';
import { BrainError, emptyBrainState, runBrain, validateOutput, type Job, type ModelAdapter, type Request } from '../../packages/brain/src/index.ts';
import { confirmBrainRecords, proposalRecord } from '../../apps/mobile/src/services/brainState.ts';
import type { SeedData } from '../../apps/mobile/src/state/SeedProvider.tsx';
import { request } from './fixtures.ts';

/** BUILD_V26 Phase 25: each job's output, end to end through the runtime with a stand-in model. */
const consented = (r: Request): Request => ({ ...r, consent: { requestId: r.id, locations: ['cloud'] } });
const job = (name: Job, text: string, extra: Partial<Request> = {}): Request => consented({ ...request(text), job: name, ...extra });
const model = (answer: unknown): ModelAdapter => ({ id: 'stand-in', location: 'cloud', jobs: ['ask', 'extract', 'lesson', 'food', 'draft', 'analyse', 'remember'], available: async () => true, generate: async () => answer });
const run = (r: Request, answer: unknown) => runBrain(r, [model(answer)], undefined, { rules: false });

describe('extract', () => {
  test('extract never saves without confirmation', async () => {
    const said = 'My rent is £950 a month.';
    const proposal = { id: 'p1', field: 'rent', area: 'money', label: 'Rent', quote: said, value: 950 };
    const result = await run(job('extract', said), { answer: 'Here is what I heard.', citations: [], proposals: [proposal] });
    // The model's filing comes back as a proposal for review. Nothing is a record yet.
    expect(result.proposals).toHaveLength(1);
    const data = { brain: emptyBrainState(), memories: [], proposals: result.proposals.map(p => proposalRecord(p, 'talk', '2026-11-20T12:00:00Z')) } as unknown as SeedData;
    expect(data.proposals.every(p => p.status === 'proposed')).toBe(true);
    expect(data.brain.confirmedRecordIds).toEqual([]);
    // Taken out before filing: confirming files nothing and remembers nothing.
    const removed = { ...data, proposals: data.proposals.map(p => ({ ...p, status: 'removed' as const })) };
    expect(confirmBrainRecords(removed)).toMatchObject({ memories: [], brain: { confirmedRecordIds: [] } });
    // Only the person's own confirmation files it.
    expect(confirmBrainRecords(data).brain.confirmedRecordIds).toEqual(['rent']);
  });
  test('a proposal that quotes words the person never said is refused, and nothing is filed', async () => {
    await expect(run(job('extract', 'My rent is £950 a month.'), { answer: 'Filed.', citations: [], proposals: [{ id: 'p1', field: 'rent', area: 'money', label: 'Rent', quote: 'My rent is £1,200 a month.', value: 1200 }] })).rejects.toBeInstanceOf(BrainError);
  });
});

describe('ask', () => {
  const r = () => job('ask', 'How much do I take home?', { context: { ...request().context, memories: [{ id: 'kofi', text: 'Kofi loves cooking.', source: { id: 'memory:kofi', label: 'From your chat', kind: 'memory' } }] } });
  test('ask cites only supplied sources', async () => {
    const result = await run(r(), { answer: 'About {{fact:net}} a month.', citations: ['engine:income'], proposals: [] });
    expect(result.sources.map(s => s.id)).toEqual(['engine:income']);
    expect(result.answer).toBe('About £2,400 a month.');
    await expect(run(r(), { answer: 'About {{fact:net}} a month.', citations: ['engine:income', 'bank:statement'], proposals: [] })).rejects.toMatchObject({ code: 'INVALID_OUTPUT' });
    // A fact is only usable when its source is cited.
    await expect(run(r(), { answer: 'About {{fact:net}} a month.', citations: ['memory:kofi'], proposals: [] })).rejects.toMatchObject({ code: 'INVALID_OUTPUT' });
  });
});

describe('lesson', () => {
  const lesson = { idea: 'Your tax code tells payroll your tax-free amount.', bites: [{ text: 'The number is your allowance.', picture: 'parts', puzzle: { type: 'choose', prompt: 'What does the number show?', options: ['Your allowance', 'Your rent'], answer: 'Your allowance' } }, { text: 'The letter says which rules apply.', picture: 'flow' }], recap: 'Number, then letter.', explainBack: 'Tell me what the number means.' };
  test('lesson matches the lesson schema', async () => {
    const result = await run(job('lesson', 'Teach me my tax code'), { answer: 'Here is your lesson.', citations: [], proposals: [], data: lesson });
    expect(result.data).toEqual(lesson);
    for (const broken of [{ ...lesson, bites: [lesson.bites[0]] }, { ...lesson, explainBack: undefined }, { ...lesson, bites: [{ ...lesson.bites[0], picture: 'pie' }, lesson.bites[1]] }, { ...lesson, bites: [{ ...lesson.bites[0], puzzle: { type: 'essay', prompt: 'Write', answer: 'x' } }, lesson.bites[1]] }, { ...lesson, extra: 'field' }])
      await expect(run(job('lesson', 'Teach me my tax code'), { answer: 'Here.', citations: [], proposals: [], data: broken })).rejects.toMatchObject({ code: 'INVALID_OUTPUT' });
  });
});

describe('food', () => {
  test('food items carry confidence', async () => {
    const items = [{ name: 'Salmon', portion: 'one fillet', grams: 140, confidence: 0.8 }, { name: 'Rice', confidence: 0.55 }];
    const result = await run(job('food', 'What is on my plate?'), { answer: 'Check these.', citations: [], proposals: [], data: { items } });
    expect((result.data as { items: { confidence: number }[] }).items.every(i => i.confidence >= 0 && i.confidence <= 1)).toBe(true);
    for (const item of [{ name: 'Salmon' }, { name: 'Salmon', confidence: -0.1 }, { name: 'Salmon', confidence: '80%' }])
      await expect(run(job('food', 'What is on my plate?'), { answer: 'Check these.', citations: [], proposals: [], data: { items: [item] } })).rejects.toMatchObject({ code: 'INVALID_OUTPUT' });
    // A meal reading never files anything by itself: the person confirms every item.
    await expect(run(job('food', 'What is on my plate?'), { answer: 'Logged.', citations: [], proposals: [{ id: 'p', field: 'note', area: 'health', label: 'Salmon', quote: 'What is on my plate?', value: 'Salmon' }], data: { items } })).rejects.toMatchObject({ code: 'INVALID_OUTPUT' });
  });
});

describe('remember (memory upkeep)', () => {
  const said = 'I prefer walking meetings, and I left the council last month to join the NHS.';
  const context = { ...request().context, memories: [{ id: 'council', text: 'Works at the council.', source: { id: 'memory:council', label: 'From your chat', kind: 'memory' as const } }] };
  test('memories quote the person, and may close one that is no longer true', () => {
    const data = { memories: [{ text: 'Prefers walking meetings.', kind: 'preference', quote: 'I prefer walking meetings' }, { text: 'Works at the NHS.', kind: 'fact', quote: 'join the NHS', replaces: 'council' }] };
    expect(validateOutput({ answer: 'Noted.', citations: [], proposals: [], data }, job('remember', said, { context })).data).toEqual(data);
  });
  test('words they never said, unknown memories, invented numbers and unknown kinds are refused', () => {
    const bad = [
      { text: 'Hates meetings.', kind: 'preference', quote: 'I hate meetings' },
      { text: 'Works at the NHS.', kind: 'fact', quote: 'join the NHS', replaces: 'someone-else' },
      { text: 'Earns £40,000 at the NHS.', kind: 'fact', quote: 'join the NHS' },
      { text: 'Prefers walking meetings.', kind: 'secret', quote: 'I prefer walking meetings' },
    ];
    for (const item of bad) expect(() => validateOutput({ answer: 'Noted.', citations: [], proposals: [], data: { memories: [item] } }, job('remember', said, { context }))).toThrow(BrainError);
  });
  test('a health detail is marked health even when the model forgets, so it stays on the phone', () => {
    const out = validateOutput({ answer: 'Noted.', citations: [], proposals: [], data: { memories: [{ text: 'Sleeps badly before trips.', kind: 'pattern', quote: 'I sleep badly before trips' }] } }, job('remember', 'I sleep badly before trips.'));
    expect((out.data as { memories: { sensitivity?: string }[] }).memories[0].sensitivity).toBe('health');
  });
  test('the remember job sits in the fast tier', async () => {
    const result = await run(job('remember', said, { context }), { answer: 'Noted.', citations: [], proposals: [], data: { memories: [] } });
    expect(result.route.tier).toBe('fast');
  });
});

describe('offline', () => {
  test('a phone that cannot reach the life API says so, so the request can wait', async () => {
    const offline: ModelAdapter = { ...model(null), generate: async () => { throw new BrainError('OFFLINE', 'No connection.'); } };
    await expect(runBrain(job('ask', 'Tell me something kind'), [offline])).rejects.toMatchObject({ code: 'OFFLINE' });
  });
});
