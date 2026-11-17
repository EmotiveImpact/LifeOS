import { describe, expect, test } from 'bun:test';
import { BrainError, analyseTeachBack, extractStatements, prepareExternalRequest, reconcilePendingRequest, retrieveMemories, runBrain, settledTranscript, validateOutput, type ModelAdapter, type Request } from '../../packages/brain/src/index.ts';

export function request(text = 'Explain this carefully'): Request { return { id: 'request-a', job: 'ask', text, context: { sample: false, moves: [], memories: [], facts: [{ id: 'net', label: 'Take-home', value: '£2,400', source: { id: 'engine:income', label: 'Income calculator', kind: 'engine' } }] }, history: [], attachments: [], privateMode: false, consent: null }; }
const output = () => ({ answer: 'Your take-home is {{fact:net}}.', citations: ['engine:income'], proposals: [] });
const adapter = (location: ModelAdapter['location'], generate: ModelAdapter['generate']): ModelAdapter => ({ id: 'test-model', location, jobs: ['ask'], available: async () => true, generate });

describe('conservative extraction and memory', () => {
  test('unrelated text never returns the demo records', () => expect(extractStatements('Hello there')).toEqual([]));
  test('explicit statements carry the original evidence and stay proposals', () => {
    const proposals = extractStatements("I'm 31. I live with two flatmates. I'm self-employed. My annual income is £60,000 per year.");
    expect(proposals.map(p => [p.field, p.value])).toEqual([['age', 31], ['household', 3], ['work', 'sole-trader'], ['income', 60000]]);
    expect(proposals.every(p => p.quote.length > 0)).toBe(true);
  });
  test('negations, hypothetical statements and questions do not alter a profile', () => {
    expect(extractStatements("I'm not self-employed. I don't live alone. If I live alone I might move. Do I live alone?")).toEqual([]);
  });
  test('self-employed does not match employed', () => expect(extractStatements("I'm self-employed")[0].value).toBe('sole-trader'));
  test('common pronouns do not retrieve unrelated personal memories', () => {
    const source = { id: 'm', kind: 'memory' as const, label: 'Confirmed' };
    expect(retrieveMemories('What do you remember about my home?', [{ id: 'goal', text: 'You’re saving for your own front door.', source }, { id: 'home', text: 'Shares with 2 other adults', source }]).map(memory => memory.id)).toEqual(['home']);
  });
  test('last explicit value wins within one review', () => expect(extractStatements('I live alone. I live with three flatmates.').filter(p => p.field === 'household').map(p => p.value)).toEqual([4]));
  test('retrieval is lexical and returns relevant supplied memories only', () => {
    const memories = [{ id: 'a', text: 'Kofi loves cooking', source: { id: 'a', kind: 'memory' as const, label: 'Chat' } }, { id: 'b', text: 'Rent increases in March', source: { id: 'b', kind: 'memory' as const, label: 'Talk' } }];
    expect(retrieveMemories('What does Kofi like?', memories).map(m => m.id)).toEqual(['a']);
    expect(retrieveMemories('Unrelated question', memories)).toEqual([]);
  });
  test('routes common immediate self-harm language to support without a model', async () => {
    for (const text of ['I want to die', 'I am thinking about suicide', "I don’t want to be alive", 'I might kill myself']) {
      const result = await runBrain(request(text));
      expect(result.answer).toContain('999');
      expect(result.answer).toContain('116 123');
      expect(result.proposals).toEqual([]);
      expect(result.route.location).toBe('rules');
    }
  });
  test('removes attachment metadata and unread files before an external request', () => {
    const original = { ...request(), attachments: [
      { id: 'read', name: 'passport.jpg', mime: 'image/jpeg', uri: 'file:///private/passport.jpg', size: 9999, text: 'expiry August', status: 'ready' as const },
      { id: 'unread', name: 'bank.pdf', mime: 'application/pdf', uri: 'file:///private/bank.pdf', size: 8888, status: 'needs-reader' as const },
    ] };
    const external = prepareExternalRequest(original);
    expect(external.attachments).toEqual([{ id: 'read', name: 'Extracted text', mime: 'text/plain', uri: '', size: 13, text: 'expiry August', status: 'ready' }]);
    expect(original.attachments[0].name).toBe('passport.jpg');
  });
  test('reconciles pending consent with current privacy state without adding data', () => {
    const pending = { ...request(), context: { sample: false, moves: [{ id: 'old-move', title: 'Old', area: 'money' as const, urgent: false, reasons: [] }], memories: [{ id: 'forgotten', text: 'Secret', source: { id: 'memory:forgotten', kind: 'memory' as const, label: 'Chat' } }], facts: [{ id: 'old', label: 'Old', value: 'one', source: { id: 'record:old', kind: 'record' as const, label: 'Old' } }] }, attachments: [{ id: 'removed', name: 'Extracted text', mime: 'text/plain', uri: '', size: 6, text: 'secret', status: 'ready' as const }] };
    const current = { sample: false, moves: [{ id: 'new-move', title: 'New', area: 'money' as const, urgent: false, reasons: [] }], memories: [], facts: [{ id: 'new', label: 'New', value: 'two', source: { id: 'record:new', kind: 'record' as const, label: 'New' } }] };
    const result = reconcilePendingRequest(pending, current, new Set());
    expect(result.attachments).toEqual([]);
    expect(result.context.memories).toEqual([]);
    expect(result.context.facts).toEqual([]);
    expect(result.context.moves).toEqual([]);
  });
  test('manual voice stop keeps the final native transcript', () => {
    expect(settledTranscript('partial words', 'partial words plus final phrase')).toBe('partial words plus final phrase');
    expect(settledTranscript('typed fallback', '')).toBe('typed fallback');
  });
  test('provides conservative local teach-back feedback without claiming a model grade', () => {
    expect(analyseTeachBack('The number is the tax-free allowance and the letter tells payroll which rules apply.')).toEqual({ mode: 'rules', understood: ['allowance', 'letter'], gaps: [] });
    expect(analyseTeachBack('The number is the amount before tax.')).toEqual({ mode: 'rules', understood: ['allowance'], gaps: ['letter'] });
  });
});
describe('model boundaries', () => {
  test('private mode does not even probe an off-phone adapter', async () => {
    let calls = 0; const model = adapter('cloud', async () => { calls++; return output(); });
    model.available = async () => { calls++; return true; };
    await expect(runBrain({ ...request(), privateMode: true }, [model])).rejects.toMatchObject({ code: 'UNAVAILABLE' });
    expect(calls).toBe(0);
  });
  test('off-phone execution requires matching single-request consent', async () => {
    let calls = 0; const model = adapter('cloud', async () => { calls++; return output(); });
    await expect(runBrain(request(), [model])).rejects.toMatchObject({ code: 'CONSENT_REQUIRED' });
    await expect(runBrain({ ...request(), consent: { requestId: 'other', locations: ['cloud'] } }, [model])).rejects.toMatchObject({ code: 'CONSENT_REQUIRED' });
    expect(calls).toBe(0);
    expect((await runBrain({ ...request(), consent: { requestId: 'request-a', locations: ['cloud'] } }, [model])).answer).toBe('Your take-home is £2,400.');
    expect(calls).toBe(1);
  });
  test('on-device execution does not require cloud permission', async () => expect((await runBrain({ ...request(), privateMode: true }, [adapter('device', async () => output())])).route.location).toBe('device'));
  test('an aborted request cannot execute a model', async () => {
    const controller = new AbortController(); controller.abort(); let calls = 0;
    await expect(runBrain(request(), [adapter('device', async () => { calls++; return output(); })], controller.signal)).rejects.toMatchObject({ code: 'CANCELLED' });
    expect(calls).toBe(0);
  });
  test('unsupported numeric claims and unknown citations are rejected', () => {
    expect(() => validateOutput({ ...output(), answer: 'You will save £9,999.' }, request())).toThrow(BrainError);
    expect(() => validateOutput({ ...output(), citations: ['another-user'] }, request())).toThrow(BrainError);
    expect(() => validateOutput({ ...output(), answer: '{{fact:invented}}' }, request())).toThrow(BrainError);
  });
  test('a referenced number must cite its actual source', () => expect(() => validateOutput({ ...output(), citations: [] }, request())).toThrow(BrainError));
  test('arbitrary mutations and fake completed actions are rejected', () => {
    expect(() => validateOutput({ ...output(), proposals: [{ id: 'x', profilePatch: { annualIncome: 1000000 } }] }, request())).toThrow(BrainError);
    expect(() => validateOutput({ ...output(), answer: 'I have sent the email.' }, request())).toThrow(BrainError);
    expect(() => validateOutput({ ...output(), answer: 'I’ve submitted the form.' }, request())).toThrow(BrainError);
    expect(() => validateOutput({ ...output(), answer: 'life submitted the claim.' }, request())).toThrow(BrainError);
  });
  test('JSON property order is not treated as evidence', () => {
    const req = request('Remember that Kofi likes cooking.'); const candidate = extractStatements(req.text)[0];
    expect(validateOutput({ answer: 'Review before filing.', citations: [], proposals: [{ value: candidate.value, quote: candidate.quote, area: candidate.area, label: candidate.label, field: candidate.field, id: candidate.id }] }, req).proposals).toHaveLength(1);
  });
  test('an oversized document is rejected, not silently truncated', async () => {
    await expect(runBrain({ ...request(), attachments: [{ id: 'file', name: 'Long.txt', mime: 'text/plain', uri: 'file://private', size: 40001, text: 'x'.repeat(40001), status: 'ready' }] })).rejects.toMatchObject({ code: 'INVALID_INPUT' });
  });
  test('an attached note does not replace an unrelated engine answer', async () => {
    const source = { id: 'income', kind: 'engine' as const, label: 'Calculator' };
    const req = { ...request('My money'), context: { ...request().context, facts: [{ id: 'income.netMonthly', label: 'Take-home', value: '£2,400', source }, { id: 'income.taxReserveMonthly', label: 'Reserve', value: '£300', source }] }, attachments: [{ id: 'doc', name: 'note.txt', uri: 'file://local', mime: 'text/plain', size: 40, text: 'Remember that Kofi likes cooking.', status: 'ready' as const }] };
    const result = await runBrain(req);
    expect(result.answer).toContain('£2,400');
    expect(result.proposals).toEqual([]);
  });
  test('filing produces no write side effects', async () => {
    const req = request('Remember that Kofi likes cooking.'); const before = JSON.stringify(req);
    const result = await runBrain(req);
    expect(result.proposals).toHaveLength(1); expect(result.route.location).toBe('rules'); expect(JSON.stringify(req)).toBe(before);
  });
});
