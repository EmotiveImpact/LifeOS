import { describe, expect, test } from 'bun:test';
import { BrainError, emptyBrainState, runBrain, type BrainState, type ModelAdapter, type Request } from '../../packages/brain/src/index.ts';
import { MAX_QUEUED, OFFLINE_NOTE, deliver, drain, enqueue, postMessage, waitingMessage, type QueuedAi } from '../../apps/mobile/src/services/aiQueue.ts';

/** BUILD_V26 Phase 25 and review focus 3: AI requests wait for a connection, survive the app closing, and send once. */
const said = 'Octopus Energy takes £85 every month.';
const extract: Request = { id: 'talk-1', job: 'extract', text: said, context: { sample: false, facts: [], memories: [], moves: [] }, history: [], attachments: [], privateMode: false, consent: { requestId: 'talk-1', locations: ['cloud'] } };
const filed = { answer: 'Here is what I picked out.', citations: [], proposals: [{ id: 'p1', field: 'bill', area: 'money', label: 'Octopus Energy', quote: said, value: 85, details: { kind: 'bill', payee: 'Octopus Energy', amount: 85, frequency: 'monthly' } }] };
const api = (online: () => boolean, calls: string[]): ModelAdapter => ({
  id: 'life-api', location: 'cloud', jobs: ['ask', 'extract'], relay: true, available: async () => true,
  generate: async request => { if (!online()) throw new BrainError('OFFLINE', 'No connection.'); calls.push(request.id); return filed; },
});
const conversation = (): BrainState => ({ ...emptyBrainState(), activeConversationId: 'talk', conversations: [{ id: 'talk', title: 'Your talk', createdAt: '2026-11-20T12:00:00Z', updatedAt: '2026-11-20T12:00:00Z', messages: [], attachments: [] }] });

describe('the offline queue', () => {
  test('queues an extract request offline and sends it once on reconnect', async () => {
    let online = false;
    const calls: string[] = [];
    const send = (item: QueuedAi) => runBrain(item.request, [api(() => online, calls)], undefined, { rules: item.model ? false : undefined });
    const item: QueuedAi = { id: extract.id, request: extract, conversationId: 'talk', at: '2026-11-20T12:00:00Z', model: true };

    // Offline: the request is kept, with the board's "will answer when back" note, and nothing is filed.
    await expect(send(item)).rejects.toMatchObject({ code: 'OFFLINE' });
    let queue = enqueue([], item);
    let state = postMessage(conversation(), 'talk', waitingMessage(extract, '2026-11-20T12:00:01Z'));
    expect(state.conversations[0].messages.map(m => m.text)).toEqual([OFFLINE_NOTE]);
    // Offered twice, still queued once.
    queue = enqueue(queue, item);
    expect(queue).toHaveLength(1);

    // The app closes and opens again: the queue comes back from the phone's saved state.
    queue = JSON.parse(JSON.stringify(queue)) as QueuedAi[];

    // Still offline: it waits.
    let round = await drain(queue, send, Date.parse('2026-11-20T13:00:00Z'));
    expect(round.left).toHaveLength(1);
    expect(round.delivered).toEqual([]);
    expect(calls).toEqual([]);

    // Back online: sent once, answered in its conversation, and gone from the queue.
    online = true;
    round = await drain(round.left, send, Date.parse('2026-11-20T14:00:00Z'));
    expect(calls).toEqual(['talk-1']);
    expect(round.left).toEqual([]);
    state = deliver(state, round.delivered, '2026-11-20T14:00:01Z');
    const messages = state.conversations[0].messages;
    expect(messages.map(m => m.id)).toEqual(['talk-1:reply']);
    // What the model picked out comes back to review. Nothing is filed until the person confirms it.
    expect(messages[0].proposals?.map(p => p.label)).toEqual(['Octopus Energy']);

    // Nothing left to send, and the same answer delivered twice shows once.
    round = await drain(round.left, send);
    expect(calls).toEqual(['talk-1']);
    expect(deliver(state, [{ item, result: await send(item) }]).conversations[0].messages).toHaveLength(1);
  });

  test('a refusal is final: it is shown once and never retried behind the person’s back', async () => {
    const item: QueuedAi = { id: 'r', request: { ...extract, id: 'r' }, conversationId: 'talk', at: '2026-11-20T12:00:00Z' };
    let sent = 0;
    const round = await drain([item], async () => { sent++; throw new BrainError('INVALID_OUTPUT', 'The answer didn’t pass life’s checks, so nothing was changed.'); });
    expect(sent).toBe(1);
    expect(round.left).toEqual([]);
    expect(deliver(conversation(), round.delivered).conversations[0].messages[0]).toMatchObject({ id: 'r:error', error: true });
  });

  test('requests behind an offline one wait their turn, in order', async () => {
    const items = ['a', 'b', 'c'].map(id => ({ id, request: { ...extract, id }, conversationId: 'talk', at: '2026-11-20T12:00:00Z' }));
    const order: string[] = [];
    const round = await drain(items, async item => { if (item.id === 'b') throw new BrainError('OFFLINE', 'No connection.'); order.push(item.id); return { answer: 'ok', sources: [], proposals: [], route: { location: 'cloud', model: 'x', tier: 'fast' }, notices: [] }; }, Date.parse('2026-11-20T13:00:00Z'));
    expect(order).toEqual(['a']);
    expect(round.left.map(i => i.id)).toEqual(['b', 'c']);
  });

  test('a request that waited more than a week is not sent, and the person is told', async () => {
    let sent = 0;
    const round = await drain([{ id: 'old', request: { ...extract, id: 'old' }, conversationId: 'talk', at: '2026-11-01T12:00:00Z' }], async () => { sent++; throw new Error('unreachable'); }, Date.parse('2026-11-20T12:00:00Z'));
    expect(sent).toBe(0);
    expect(round.left).toEqual([]);
    expect(round.delivered[0].error?.message).toMatch(/more than a week/);
  });

  test('the queue is bounded', () => {
    let queue: QueuedAi[] = [];
    for (let i = 0; i < MAX_QUEUED + 5; i++) queue = enqueue(queue, { id: `q${i}`, request: { ...extract, id: `q${i}` }, conversationId: 'talk', at: '2026-11-20T12:00:00Z' });
    expect(queue).toHaveLength(MAX_QUEUED);
    expect(queue[0].id).toBe('q5');
  });
});
