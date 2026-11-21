import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import type { Request as BrainRequest, TierTable } from '../../packages/brain/src/index.ts';
import { createApi } from '../../apps/api/src/app';
import type { Auth } from '../../apps/api/src/auth';
import { aiUsage } from '../../apps/api/src/db/schema';
import { anthropicModel } from '../../apps/api/src/models/anthropic';
import { googleModel } from '../../apps/api/src/models/google';
import { openaiModel } from '../../apps/api/src/models/openai';
import type { ModelSpec, ProviderModel } from '../../apps/api/src/models/types';
import { adminUrl, freshDatabase, makeUser } from './support';

/**
 * Phase 27: a meal or label photo reaches the vision model inside the request, as an image beside the words, and is
 * never stored. Providers are stand-ins: nothing leaves the test.
 */
const PHOTO = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const meal = { answer: 'Check these and adjust the amounts.', citations: [], proposals: [], data: { items: [{ name: 'Salmon', grams: 120, confidence: 0.9, per100g: { kcal: 206, protein: 22, carbs: 0, fat: 13 } }] } };
const food = (extra: Partial<BrainRequest> = {}): BrainRequest => ({
  id: crypto.randomUUID(), job: 'food', text: 'What is on my plate?', history: [], privateMode: false,
  context: { sample: false, moves: [], memories: [], facts: [] },
  attachments: [{ id: 'p1', name: 'Photo', mime: 'image/png', uri: '', size: PHOTO.length, data: PHOTO, status: 'ready' }],
  consent: null, ...extra,
});
const okd = (r: BrainRequest): BrainRequest => ({ ...r, consent: { requestId: r.id, locations: ['cloud'] } });
const spec = (id: string, extra: Partial<ModelSpec> = {}): ModelSpec => ({ id, provider: 'anthropic', model: id, label: id, tiers: ['vision'], vision: true, price: { input: 0.1, output: 0.5 }, maxOutputTokens: 2000, confirmed: true, ...extra });

describe('each provider is sent the photo as an image', () => {
  type Seen = { url: string; init: RequestInit };
  const answering = (seen: Seen[], payload: unknown) => async (url: string, init?: RequestInit) => { seen.push({ url, init: init! }); return Response.json(payload); };
  const bodyOf = (s: Seen) => JSON.parse(String(s.init.body));
  const signal = new AbortController().signal;

  test('Anthropic: a base64 image block, then the words', async () => {
    const seen: Seen[] = [];
    const model = anthropicModel(spec('claude-haiku-5-5'), { apiKey: 'k', fetch: answering(seen, { content: [{ type: 'text', text: JSON.stringify(meal) }], stop_reason: 'end_turn', usage: { input_tokens: 1500, output_tokens: 90 } }) });
    expect((await model.call(okd(food()), signal)).output).toEqual(meal);
    const [image, words] = bodyOf(seen[0]).messages[0].content;
    expect(image).toEqual({ type: 'image', source: { type: 'base64', media_type: 'image/png', data: PHOTO } });
    expect(words.type).toBe('text');
    expect(words.text).not.toContain(PHOTO);
    expect(JSON.parse(words.text).job).toBe('food');
  });
  test('OpenAI: the words, then an input image as a data URL', async () => {
    const seen: Seen[] = [];
    const model = openaiModel(spec('gpt-6-luna', { provider: 'openai' }), { apiKey: 'k', fetch: answering(seen, { status: 'completed', output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(meal) }] }], usage: { input_tokens: 1500, output_tokens: 90 } }) });
    expect((await model.call(okd(food()), signal)).output).toEqual(meal);
    const [words, image] = bodyOf(seen[0]).input[0].content;
    expect(words.type).toBe('input_text');
    expect(image).toEqual({ type: 'input_image', image_url: `data:image/png;base64,${PHOTO}` });
    expect(bodyOf(seen[0]).store).toBe(false);
  });
  test('Google: inline data beside the words', async () => {
    const seen: Seen[] = [];
    const model = googleModel(spec('gemini-4-hydrogen', { provider: 'google' }), { apiKey: 'k', fetch: answering(seen, { candidates: [{ content: { parts: [{ text: JSON.stringify(meal) }] }, finishReason: 'STOP' }], usageMetadata: { promptTokenCount: 1500, candidatesTokenCount: 90 } }) });
    expect((await model.call(okd(food()), signal)).output).toEqual(meal);
    const [image, words] = bodyOf(seen[0]).contents[0].parts;
    expect(image).toEqual({ inlineData: { mimeType: 'image/png', data: PHOTO } });
    expect(typeof words.text).toBe('string');
  });
  test('words-only jobs are sent exactly as before', async () => {
    const seen: Seen[] = [];
    const model = anthropicModel(spec('claude-haiku-5-5'), { apiKey: 'k', fetch: answering(seen, { content: [{ type: 'text', text: JSON.stringify(meal) }], stop_reason: 'end_turn', usage: { input_tokens: 10, output_tokens: 9 } }) });
    await model.call(okd(food({ attachments: [] })), signal);
    expect(typeof bodyOf(seen[0]).messages[0].content).toBe('string');
  });
});

describe.skipIf(!adminUrl)('a meal photo through the API', () => {
  let env: Awaited<ReturnType<typeof freshDatabase>>;
  let ama: string;
  const table: TierTable = { version: 1, source: 'evals', updated: '2026-11-20', jobs: {}, tiers: { fast: ['m-words'], strong: ['m-words'], top: ['m-words'], vision: ['m-eyes'] } };
  const auth: Auth = { handler: async () => new Response(null, { status: 404 }), getPrincipal: async request => { const userId = request.headers.get('x-test-user'); return userId ? { userId } : null; } };
  const post = (api: (r: Request) => Promise<Response>, body: unknown, headers: Record<string, string> = {}) => api(new Request('http://life.test/ai/run', { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-user': ama, ...headers }, body: JSON.stringify(body) }));
  const seenBy: Record<string, BrainRequest[]> = { 'm-eyes': [], 'm-words': [] };
  const stand = (id: string, vision: boolean): ProviderModel => ({ spec: spec(id, { vision, tiers: vision ? ['vision'] : ['fast', 'strong', 'top'] }), call: async request => { seenBy[id].push(request); return { output: meal, usage: { inputTokens: 1500, outputTokens: 90 } }; } });
  beforeAll(async () => { env = await freshDatabase(); ama = await makeUser(env.db, 'ama@example.com'); });
  afterAll(async () => { await env?.drop(); });

  test('goes to the vision model, comes back checked, and the ledger holds no photo', async () => {
    const api = createApi({ db: env.db, auth, now: () => Date.parse('2026-11-20T12:00:00Z'), ai: { models: [stand('m-eyes', true), stand('m-words', false)], table } });
    const res = await post(api, okd(food()));
    expect(res.status).toBe(200);
    expect(res.headers.get('life-model')).toBe('m-eyes');
    expect((await res.json()).data).toEqual(meal.data);
    expect(seenBy['m-eyes'][0].attachments[0].data).toBe(PHOTO);
    const rows = await env.db.withUser(ama, tx => tx.select().from(aiUsage));
    expect(rows).toHaveLength(1);
    expect(JSON.stringify(rows)).not.toContain(PHOTO.slice(0, 40));
  });
  test('a photo on a words-only job, two photos, or a huge body is refused before any model', async () => {
    const api = createApi({ db: env.db, auth, ai: { models: [stand('m-eyes', true), stand('m-words', false)], table } });
    const before = seenBy['m-eyes'].length + seenBy['m-words'].length;
    expect((await post(api, okd(food({ job: 'ask' })))).status).toBe(400);
    const two = food(); two.attachments = [...two.attachments, { ...two.attachments[0], id: 'p2' }];
    expect((await post(api, okd(two))).status).toBe(400);
    expect((await post(api, okd(food()), { 'content-length': '9000000' })).status).toBe(413);
    expect(seenBy['m-eyes'].length + seenBy['m-words'].length).toBe(before);
  });
});
