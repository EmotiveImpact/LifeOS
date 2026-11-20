import { describe, expect, test } from 'bun:test';
import { BrainError, fitContext, parseTierTable, planRoute, runBrain, type ModelAdapter, type Request, type TierTable } from '../../packages/brain/src/index.ts';
import { request } from './fixtures.ts';

const table: TierTable = { version: 1, source: 'evals', updated: '2026-11-20', jobs: {}, tiers: { fast: ['model-a'], strong: ['model-b', 'model-a'], top: ['model-c'], vision: ['model-v'] } };
const reply = { answer: 'Your take-home is {{fact:net}}.', citations: ['engine:income'], proposals: [] };
const draftReply = { answer: 'Draft ready.', citations: [], proposals: [], data: { kind: 'message', body: 'Hello.' } };
const model = (id: string, used: string[], extra: Partial<ModelAdapter> = {}): ModelAdapter => ({ id, location: 'cloud', jobs: ['ask', 'draft'], available: async () => true, generate: async req => { used.push(id); return req.job === 'draft' ? draftReply : reply; }, ...extra });
const consented = (req: Request): Request => ({ ...req, consent: { requestId: req.id, locations: ['server', 'cloud'] } });

describe('tiers: the cheapest place that can do the job', () => {
  test('each job starts at its tier', () => {
    expect(planRoute({ ...request(), job: 'extract' }).tier).toBe('fast');
    expect(planRoute(request('What is my take-home?')).tier).toBe('fast');
    expect(planRoute({ ...request(), job: 'draft' }).tier).toBe('strong');
    expect(planRoute({ ...request(), job: 'lesson' }).tier).toBe('strong');
    expect(planRoute({ ...request(), job: 'food' }).tier).toBe('vision');
  });
  test('a chat question climbs to strong for careful work and to top for a big decision', () => {
    expect(planRoute(request('Can you explain how my tax code works, step by step?')).tier).toBe('strong');
    expect(planRoute({ ...request('Summarise this'), attachments: [{ id: 'a', name: 'Extracted text', mime: 'text/plain', uri: '', size: 20, text: 'A letter from HMRC.', status: 'ready' }] }).tier).toBe('strong');
    const big = planRoute(request('Should I take this job offer or stay where I am?'));
    expect(big.tier).toBe('top');
    expect(big.reasons.join(' ')).toMatch(/decision/);
    expect(planRoute(request('Can we afford to move to a bigger flat?')).tier).toBe('top');
  });
  test('reading a photo of a document needs vision; reading its text needs strong', () => {
    const photo = { id: 'p', name: 'letter.jpg', mime: 'image/jpeg', uri: 'file://x', size: 1000, status: 'needs-reader' as const };
    expect(planRoute({ ...request('Read this'), job: 'read-document', attachments: [photo] }).tier).toBe('vision');
    expect(planRoute({ ...request('Read this'), job: 'read-document', attachments: [{ ...photo, text: 'Council Tax', status: 'ready' }] }).tier).toBe('strong');
  });
  test('the table can move a job between tiers with one line', () => {
    expect(planRoute({ ...request(), job: 'draft' }, { table: { ...table, jobs: { draft: 'fast' } } }).tier).toBe('fast');
    expect(planRoute(request('Should I take this job offer?'), { table: { ...table, jobs: { ask: 'strong' } } }).tier).toBe('top');
  });
  test('a used-up top allowance drops to strong and says so; other tiers stop', () => {
    const plan = planRoute(request('Should I take this job offer?'), { remaining: { top: 0 } });
    expect(plan.tier).toBe('strong');
    expect(plan.asked).toBe('top');
    expect(plan.notice).toBeTruthy();
    expect(() => planRoute(request('Should I take this job offer?'), { remaining: { top: 0, strong: 0 } })).toThrow(BrainError);
    expect(() => planRoute(request('Hello there'), { remaining: { fast: 0 } })).toThrow(BrainError);
    expect(planRoute(request('Hello there'), { remaining: { fast: 3 } }).tier).toBe('fast');
  });
  test('the tier table is checked before it is trusted', () => {
    expect(parseTierTable(table)).toEqual(table);
    expect(() => parseTierTable({ ...table, tiers: { turbo: ['x'] } })).toThrow(BrainError);
    expect(() => parseTierTable({ ...table, jobs: { ask: 'turbo' } })).toThrow(BrainError);
    expect(() => parseTierTable({ ...table, tiers: { fast: 'model-a' } })).toThrow(BrainError);
    expect(() => parseTierTable({ ...table, version: 2 })).toThrow(BrainError);
  });
});

describe('runBrain follows the route', () => {
  test("a job routes to its tier's model from tiers.json", async () => {
    const used: string[] = [];
    const adapters = [model('model-a', used), model('model-b', used)];
    const draft = await runBrain(consented({ ...request('Draft a note'), job: 'draft' }), adapters, undefined, { route: { table } });
    expect(draft.route).toEqual({ location: 'cloud', model: 'model-b', tier: 'strong' });
    await runBrain(consented(request('Tell me something kind')), adapters, undefined, { route: { table } });
    expect(used).toEqual(['model-b', 'model-a']);
  });
  test('when the winner is down, the next model in the tier answers', async () => {
    const used: string[] = [];
    const adapters = [model('model-a', used), model('model-b', used, { available: async () => false })];
    const draft = await runBrain(consented({ ...request('Draft a note'), job: 'draft' }), adapters, undefined, { route: { table } });
    expect(draft.route.model).toBe('model-a');
  });
  test('a model that declares its tiers is only used for them', async () => {
    const used: string[] = [];
    const adapters = [model('small', used, { tiers: ['fast'] }), model('model-b', used, { tiers: ['strong', 'top'] })];
    await runBrain(consented({ ...request('Draft a note'), job: 'draft' }), adapters);
    await runBrain(consented(request('Tell me something kind')), adapters);
    expect(used).toEqual(['model-b', 'small']);
  });
  test('the phone still goes first when it can do the job', async () => {
    const used: string[] = [];
    const phone = model('phone', used, { location: 'device' });
    expect((await runBrain(consented(request('Tell me something kind')), [model('model-a', used), phone], undefined, { route: { table } })).route.location).toBe('device');
  });
  test('a top-tier downgrade is told to the person', async () => {
    const used: string[] = [];
    const result = await runBrain(consented(request('Should I take this job offer?')), [model('model-b', used)], undefined, { route: { table, remaining: { top: 0 } } });
    expect(result.route.tier).toBe('strong');
    expect(result.notices.join(' ')).toMatch(/allowance/);
  });
  test('a used-up allowance stops before any model is called', async () => {
    const used: string[] = [];
    await expect(runBrain(consented(request('Tell me something kind')), [model('model-a', used)], undefined, { route: { remaining: { fast: 0 } } })).rejects.toMatchObject({ code: 'RATE_LIMITED' });
    expect(used).toEqual([]);
  });
  test('a timed-out model leaves nothing changed', async () => {
    const req = consented(request('Tell me something kind')); const before = JSON.stringify(req);
    const stuck: ModelAdapter = { id: 'stuck', location: 'cloud', jobs: ['ask'], available: async () => true, generate: () => new Promise(() => {}) };
    await expect(runBrain(req, [stuck], undefined, { timeoutMs: 20 })).rejects.toMatchObject({ code: 'TIMEOUT' });
    expect(JSON.stringify(req)).toBe(before);
  });
  test('the rules and crisis checks still answer before any route is planned', async () => {
    await expect(runBrain(request('I want to die'), [], undefined, { route: { remaining: { fast: 0, strong: 0, top: 0 } } })).resolves.toMatchObject({ route: { model: 'life-safety' } });
  });
});

describe("the phone's small context window", () => {
  const long = (n: number) => ({ ...request('What should I focus on?'), history: Array.from({ length: n }, (_, i) => ({ role: i % 2 ? 'life' as const : 'user' as const, text: `Message ${i} `.repeat(40) })), context: { ...request().context, memories: Array.from({ length: 8 }, (_, i) => ({ id: `m${i}`, text: `Memory ${i} `.repeat(30), source: { id: `memory:m${i}`, label: 'Chat', kind: 'memory' as const } })) } });
  test('drops the oldest messages first, then the least relevant memories, and keeps your question', () => {
    const fitted = fitContext(long(20), 6000)!;
    expect(fitted.text).toBe('What should I focus on?');
    expect(fitted.history.length).toBeLessThan(20);
    expect(fitted.history.at(-1)).toEqual(long(20).history.at(-1));
    expect(JSON.stringify({ t: fitted.text, h: fitted.history, c: fitted.context, a: fitted.attachments }).length).toBeLessThanOrEqual(6000);
  });
  test('never cuts a document short; it skips the phone instead', () => {
    const doc = { ...request('Read this'), attachments: [{ id: 'a', name: 'Extracted text', mime: 'text/plain', uri: '', size: 9000, text: 'x'.repeat(9000), status: 'ready' as const }] };
    expect(fitContext(doc, 6000)).toBeNull();
  });
  test('an adapter with a small window gets the trimmed request', async () => {
    let seen = 0;
    const phone: ModelAdapter = { id: 'phone', location: 'device', jobs: ['ask'], maxContextChars: 6000, available: async () => true, generate: async req => { seen = req.history.length; return reply; } };
    await runBrain(long(20), [phone]);
    expect(seen).toBeGreaterThan(0);
    expect(seen).toBeLessThan(20);
  });
});
