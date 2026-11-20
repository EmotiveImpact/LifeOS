import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { grantConsent, emptyConsentLedger, type Request as BrainRequest, type Tier, type TierTable } from '../../packages/brain/src/index.ts';
import { createApi } from '../../apps/api/src/app';
import type { Auth } from '../../apps/api/src/auth';
import { sql } from '../../apps/api/src/db/kit';
import { aiUsage, phoneTables, prefs } from '../../apps/api/src/db/schema';
import { anthropicModel } from '../../apps/api/src/models/anthropic';
import { googleModel } from '../../apps/api/src/models/google';
import { openaiModel } from '../../apps/api/src/models/openai';
import { MODELS, modelsFromEnv } from '../../apps/api/src/models/registry';
import { costMicros, type ModelSpec, type ProviderModel } from '../../apps/api/src/models/types';
import { loadTierTable } from '../../apps/api/src/router';
import { adminUrl, freshDatabase, makeUser } from './support';

/**
 * BUILD_V26 Phase 24: the life API's half of the brain. The phone sends a request it has already checked; the API
 * checks it again against its own copy of the person's settings, picks a model from tiers.json, checks the answer
 * and writes one cost row per model call. Models here are stand-ins: no provider is called and no key is needed.
 */
const base = 'http://life.test';
const NOW = Date.parse('2026-11-20T09:00:00.000Z');
const table: TierTable = { version: 1, source: 'evals', updated: '2026-11-20', jobs: {}, tiers: { fast: ['m-fast'], strong: ['m-strong', 'm-fast'], top: ['m-top'], vision: ['m-fast'] } };
const good = { answer: 'Your take-home is {{fact:net}}.', citations: ['engine:income'], proposals: [] };

const spec = (id: string, tiers: Tier[], extra: Partial<ModelSpec> = {}): ModelSpec => ({ id, provider: 'anthropic', model: id, label: id, tiers, vision: false, price: { input: 0.1, output: 0.5 }, maxOutputTokens: 2000, confirmed: true, ...extra });
type Reply = (request: BrainRequest, signal: AbortSignal) => unknown;
function fake(id: string, tiers: Tier[], calls: string[], reply: Reply = () => good): ProviderModel {
  return { spec: spec(id, tiers), call: async (request, signal) => { calls.push(id); return { output: await reply(request, signal), usage: { inputTokens: 1000, outputTokens: 200 } }; } };
}
const trio = (calls: string[], reply?: Reply) => [fake('m-fast', ['fast', 'strong', 'vision'], calls, reply), fake('m-strong', ['strong'], calls, reply), fake('m-top', ['top'], calls, reply)];

const ask = (text: string, extra: Partial<BrainRequest> = {}): BrainRequest => ({
  id: crypto.randomUUID(), job: 'ask', text, history: [], attachments: [], privateMode: false, consent: null,
  context: { sample: false, moves: [], memories: [], facts: [{ id: 'net', label: 'Take-home', value: '£2,400', source: { id: 'engine:income', label: 'Income calculator', kind: 'engine' } }] },
  ...extra,
});
const okd = (request: BrainRequest): BrainRequest => ({ ...request, consent: { requestId: request.id, locations: ['cloud'] } });

/** Signed in as whoever the `x-test-user` header names. Sign-in itself is covered in auth.test.ts. */
const auth: Auth = { handler: async () => new Response(null, { status: 404 }), getPrincipal: async request => { const userId = request.headers.get('x-test-user'); return userId ? { userId } : null; } };
const post = (api: (r: Request) => Promise<Response>, userId: string, body: unknown) => api(new Request(`${base}/ai/run`, { method: 'POST', headers: { 'content-type': 'application/json', 'x-test-user': userId }, body: JSON.stringify(body) }));
/** A database that fails on any use: proves a route answered without reading or writing anything. */
const noDb = { db: null as never, withUser: async () => { throw new Error('the database was used'); } };

describe('before any model or database', () => {
  test('a voice transcript with self-harm language routes to support', async () => {
    const calls: string[] = [];
    const api = createApi({ db: noDb, auth, now: () => NOW, ai: { models: trio(calls), table } });
    const words = okd({ ...ask('so um yeah i have been cutting myself again and i dont know'), job: 'extract' });
    const res = await post(api, 'u', words);
    expect(res.status).toBe(200);
    const body = await res.json() as { support?: { level: string; kinds: string[] }; proposals?: unknown };
    expect(body.support?.kinds).toContain('self-harm');
    expect(body.proposals).toBeUndefined();
    expect(calls).toEqual([]);
  });

  test('private mode returns PRIVATE_MODE and calls no model', async () => {
    const calls: string[] = [];
    const api = createApi({ db: noDb, auth, now: () => NOW, ai: { models: trio(calls), table } });
    const res = await post(api, 'u', okd(ask('What should I cook tonight?', { privateMode: true })));
    expect(res.status).toBe(409);
    expect((await res.json() as { error: string }).error).toBe('PRIVATE_MODE');
    expect(calls).toEqual([]);
  });

  test('a malformed request is refused before anything runs', async () => {
    const calls: string[] = [];
    const api = createApi({ db: noDb, auth, now: () => NOW, ai: { models: trio(calls), table } });
    for (const body of [null, { job: 'ask' }, { ...ask('Hi'), job: 'hack' }, { ...ask('Hi'), context: { facts: 'all of them' } }, { ...ask('x'.repeat(12001)) }]) {
      expect((await post(api, 'u', body)).status).toBe(400);
    }
    expect(calls).toEqual([]);
  });

  test('without a session there is no AI at all', async () => {
    const api = createApi({ db: noDb, auth, now: () => NOW, ai: { models: trio([]), table } });
    expect((await api(new Request(`${base}/ai/run`, { method: 'POST', body: JSON.stringify(ask('Hi')) }))).status).toBe(401);
    expect((await api(new Request(`${base}/ai/capabilities`))).status).toBe(401);
  });
});

describe('model adapters speak each provider’s API without an SDK', () => {
  const request = okd(ask('How much do I take home?'));
  type Seen = { url: string; init: RequestInit };
  const answering = (seen: Seen[], payload: unknown, status = 200) => async (url: string, init?: RequestInit) => { seen.push({ url, init: init! }); return Response.json(payload, { status }); };
  const bodyOf = (s: Seen) => JSON.parse(String(s.init.body));

  test('Anthropic: Messages API, key in a header, no sampling settings, usage read back', async () => {
    const seen: Seen[] = [];
    const model = anthropicModel(spec('claude-haiku-5-5', ['fast'], { effort: 'low' }), { apiKey: 'sk-test', fetch: answering(seen, { content: [{ type: 'text', text: '```json\n' + JSON.stringify(good) + '\n```' }], stop_reason: 'end_turn', usage: { input_tokens: 900, output_tokens: 120, cache_read_input_tokens: 100 } }) });
    const reply = await model.call(request, new AbortController().signal);
    expect(reply.output).toEqual(good);
    expect(reply.usage).toEqual({ inputTokens: 1000, outputTokens: 120 });
    expect(seen[0].url).toBe('https://api.anthropic.com/v1/messages');
    const headers = new Headers(seen[0].init.headers);
    expect(headers.get('x-api-key')).toBe('sk-test');
    expect(headers.get('anthropic-version')).toBe('2026-10-21');
    const body = bodyOf(seen[0]);
    expect(body.model).toBe('claude-haiku-5-5');
    expect(body.system).toContain('You are life');
    expect(body.output_config).toEqual({ effort: 'low' });
    expect(body.temperature).toBeUndefined();
    expect(JSON.parse(body.messages[0].content).question).toBe('How much do I take home?');
  });

  test('Anthropic: a refusal or an overloaded service hands over to the next model, and says what it cost', async () => {
    const refused = anthropicModel(spec('claude-haiku-5-5', ['fast']), { apiKey: 'k', fetch: answering([], { content: [], stop_reason: 'refusal', usage: { input_tokens: 50, output_tokens: 0 } }) });
    const r = await refused.call(request, new AbortController().signal);
    expect(r.failure?.code).toBe('UNAVAILABLE');
    expect(r.usage.inputTokens).toBe(50);
    const busy = anthropicModel(spec('claude-haiku-5-5', ['fast']), { apiKey: 'k', fetch: answering([], { type: 'error', error: { type: 'overloaded_error' } }, 529) });
    expect((await busy.call(request, new AbortController().signal)).failure?.code).toBe('UNAVAILABLE');
    const garbled = anthropicModel(spec('claude-haiku-5-5', ['fast']), { apiKey: 'k', fetch: answering([], { content: [{ type: 'text', text: 'Sure! Here you go.' }], stop_reason: 'end_turn', usage: { input_tokens: 10, output_tokens: 5 } }) });
    expect((await garbled.call(request, new AbortController().signal)).failure?.code).toBe('INVALID_OUTPUT');
  });

  test('OpenAI: Responses API, nothing stored, JSON out, reasoning tokens counted', async () => {
    const seen: Seen[] = [];
    const model = openaiModel(spec('gpt-6-luna', ['fast'], { provider: 'openai', effort: 'low' }), { apiKey: 'sk-oa', fetch: answering(seen, { status: 'completed', output: [{ type: 'reasoning', summary: [] }, { type: 'message', content: [{ type: 'output_text', text: JSON.stringify(good) }] }], usage: { input_tokens: 800, output_tokens: 300 } }) });
    const reply = await model.call(request, new AbortController().signal);
    expect(reply.output).toEqual(good);
    expect(reply.usage).toEqual({ inputTokens: 800, outputTokens: 300 });
    expect(seen[0].url).toBe('https://api.openai.com/v1/responses');
    expect(new Headers(seen[0].init.headers).get('authorization')).toBe('Bearer sk-oa');
    const body = bodyOf(seen[0]);
    expect(body.store).toBe(false);
    expect(body.instructions).toContain('You are life');
    expect(body.text).toEqual({ format: { type: 'json_object' } });
    expect(body.reasoning).toEqual({ effort: 'low' });
    const refusal = openaiModel(spec('gpt-6-luna', ['fast'], { provider: 'openai' }), { apiKey: 'k', fetch: answering([], { status: 'completed', output: [{ type: 'message', content: [{ type: 'refusal', refusal: 'No.' }] }], usage: { input_tokens: 5, output_tokens: 2 } }) });
    expect((await refusal.call(request, new AbortController().signal)).failure?.code).toBe('UNAVAILABLE');
  });

  test('Google: generateContent, key in a header, thinking tokens billed as output', async () => {
    const seen: Seen[] = [];
    const model = googleModel(spec('gemini-4-neon', ['top'], { provider: 'google' }), { apiKey: 'g-key', fetch: answering(seen, { candidates: [{ content: { parts: [{ text: JSON.stringify(good) }] }, finishReason: 'STOP' }], usageMetadata: { promptTokenCount: 700, candidatesTokenCount: 100, thoughtsTokenCount: 400 } }) });
    const reply = await model.call(request, new AbortController().signal);
    expect(reply.output).toEqual(good);
    expect(reply.usage).toEqual({ inputTokens: 700, outputTokens: 500 });
    expect(seen[0].url).toBe('https://generativelanguage.googleapis.com/v1beta/models/gemini-4-neon:generateContent');
    expect(new Headers(seen[0].init.headers).get('x-goog-api-key')).toBe('g-key');
    expect(seen[0].url).not.toContain('g-key');
    const body = bodyOf(seen[0]);
    expect(body.systemInstruction.parts[0].text).toContain('You are life');
    expect(body.generationConfig.responseMimeType).toBe('application/json');
    const blocked = googleModel(spec('gemini-4-neon', ['top'], { provider: 'google' }), { apiKey: 'k', fetch: answering([], { promptFeedback: { blockReason: 'SAFETY' }, usageMetadata: { promptTokenCount: 30 } }) });
    expect((await blocked.call(request, new AbortController().signal)).failure?.code).toBe('UNAVAILABLE');
  });

  test('only models with a key are switched on, and keys never leave the server', () => {
    expect(modelsFromEnv({}).length).toBe(0);
    const some = modelsFromEnv({ ANTHROPIC_API_KEY: 'sk-a' });
    expect(some.length).toBeGreaterThan(0);
    expect(some.every(m => m.spec.provider === 'anthropic')).toBe(true);
    expect(JSON.stringify(MODELS)).not.toContain('sk-a');
  });

  test('cost is tokens times the price per million, in millionths of a dollar', () => {
    expect(costMicros(spec('x', ['fast'], { price: { input: 0.1, output: 0.5 } }), { inputTokens: 1000, outputTokens: 200 })).toBe(200);
    expect(costMicros(spec('x', ['top'], { price: { input: 4, output: 20 } }), { inputTokens: 2000, outputTokens: 1000 })).toBe(28000);
  });

  test('tiers.json is checked like any other tier table, and lists only known models', () => {
    const loaded = loadTierTable();
    const known = new Set(MODELS.map(m => m.id));
    for (const ids of Object.values(loaded.tiers)) for (const id of ids ?? []) expect(known.has(id)).toBe(true);
    for (const m of MODELS) for (const tier of m.tiers) expect(loaded.tiers[tier]?.includes(m.id) ?? false).toBe(true);
  });
});

describe.skipIf(!adminUrl)('the brain through the API', () => {
  let env: Awaited<ReturnType<typeof freshDatabase>>;
  let now = NOW;
  let ama: string, kofi: string;
  beforeAll(async () => {
    env = await freshDatabase();
    ama = await makeUser(env.db, 'ama@example.com');
    kofi = await makeUser(env.db, 'kofi@example.com');
  });
  afterAll(async () => { await env?.drop(); });

  const apiWith = (models: ProviderModel[], extra: Record<string, unknown> = {}) => createApi({ db: env.db, auth, now: () => now, ai: { models, table, ...extra } });
  const usageOf = (userId: string) => env.db.withUser(userId, tx => tx.select().from(aiUsage));
  async function setPrefs(userId: string, values: { private_mode?: boolean; fields?: unknown }) {
    const at = new Date(now).toISOString();
    await env.db.withUser(userId, async tx => {
      await tx.delete(prefs);
      await tx.insert(prefs).values({ id: crypto.randomUUID(), user_id: userId, created_at: at, updated_at: at, private_mode: values.private_mode ?? false, fields: values.fields ?? {} });
    });
  }
  const clearUsage = (userId: string) => env.db.withUser(userId, tx => tx.delete(aiUsage));

  test("a job routes to its tier's model from tiers.json", async () => {
    const calls: string[] = [];
    const api = apiWith(trio(calls));
    const quick = await post(api, ama, okd(ask('Tell me something kind')));
    expect(quick.status).toBe(200);
    expect(quick.headers.get('life-model')).toBe('m-fast');
    expect(quick.headers.get('life-tier')).toBe('fast');
    expect(await quick.json()).toEqual(good);
    const draft = await post(api, ama, okd({ ...ask('Draft a note to my landlord'), job: 'draft' }));
    expect(draft.status).toBe(502);
    const big = await post(api, ama, okd(ask('Should I take this job offer or stay where I am?')));
    expect(big.headers.get('life-model')).toBe('m-top');
    expect(calls).toEqual(['m-fast', 'm-strong', 'm-top']);
    // Moving a job between tiers is one line in the table.
    const moved = createApi({ db: env.db, auth, now: () => now, ai: { models: trio(calls), table: { ...table, jobs: { ask: 'strong' } } } });
    expect((await post(moved, ama, okd(ask('Tell me something kind')))).headers.get('life-model')).toBe('m-strong');
    await clearUsage(ama);
  });

  test('private mode on the person’s own settings wins over the request', async () => {
    const calls: string[] = [];
    await setPrefs(ama, { private_mode: true });
    const res = await post(apiWith(trio(calls)), ama, okd(ask('Tell me something kind')));
    expect(res.status).toBe(409);
    expect((await res.json() as { error: string }).error).toBe('PRIVATE_MODE');
    expect(calls).toEqual([]);
    await setPrefs(ama, {});
  });

  test('missing consent returns CONSENT_REQUIRED', async () => {
    const calls: string[] = [];
    const api = apiWith(trio(calls));
    const none = await post(api, ama, ask('Tell me something kind'));
    expect(none.status).toBe(403);
    expect((await none.json() as { error: string }).error).toBe('CONSENT_REQUIRED');
    // An OK for a different request doesn't count, and nor do grants the request carries itself.
    const other = { ...ask('Tell me something kind'), consent: { requestId: 'another', locations: ['cloud' as const] } };
    expect((await post(api, ama, other)).status).toBe(403);
    const forged = grantConsent(emptyConsentLedger(), { jobs: 'all', locations: ['cloud'], health: true }, { id: 'forged', now: NOW - 1000 });
    expect((await post(api, ama, { ...ask('Tell me something kind'), grants: forged.grants })).status).toBe(403);
    expect(calls).toEqual([]);
    // A standing OK the person gave on their phone, synced with their settings, does count.
    const ledger = grantConsent(emptyConsentLedger(), { jobs: ['ask'], locations: ['cloud'], health: false }, { id: 'grant-1', now: NOW - 1000 });
    await setPrefs(ama, { fields: { aiConsent: ledger } });
    expect((await post(api, ama, ask('Tell me something kind'))).status).toBe(200);
    // Health details still need an OK that names health.
    const plain = ask('How did I sleep?');
    const health = { ...plain, context: { ...plain.context, memories: [{ id: 'm1', text: 'Low iron in March', source: { id: 'memory:m1', label: 'Talk', kind: 'memory' as const }, sensitivity: 'health' as const }] } };
    expect((await post(api, ama, health)).status).toBe(403);
    expect((await post(api, ama, okd(health))).status).toBe(200);
    await setPrefs(ama, {});
    await clearUsage(ama);
  });

  test('an answer containing a raw £ figure not from facts is rejected', async () => {
    const calls: string[] = [];
    const api = apiWith(trio(calls, () => ({ answer: 'You could save £340 a month on rent.', citations: [], proposals: [] })));
    const res = await post(api, ama, okd(ask('How can I spend less?')));
    expect(res.status).toBe(502);
    expect((await res.json() as { error: string }).error).toBe('INVALID_OUTPUT');
    // The call still cost money, so the ledger says so, and that it was refused.
    const rows = await usageOf(ama);
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({ job: 'ask', model: 'm-fast', tier: 'fast', outcome: 'rejected', cost_micros: 200 });
    await clearUsage(ama);
  });

  test('a timed-out model leaves nothing changed', async () => {
    const stuck: ProviderModel = { spec: spec('m-fast', ['fast']), call: (_request, signal) => new Promise((_resolve, reject) => signal.addEventListener('abort', () => reject(new Error('aborted')))) };
    const before = await countEverything(ama);
    const res = await post(apiWith([stuck], { timeoutMs: 30 }), ama, okd(ask('Tell me something kind')));
    expect(res.status).toBe(504);
    expect((await res.json() as { error: string }).error).toBe('TIMEOUT');
    expect(await countEverything(ama)).toEqual(before);
    expect(await usageOf(ama)).toEqual([]);
  });

  test('usage is recorded per user and job', async () => {
    const calls: string[] = [];
    const api = apiWith(trio(calls, request => request.job === 'coach' ? { answer: 'Rest first.', citations: [], proposals: [] } : good));
    await post(api, ama, okd(ask('Tell me something kind')));
    await post(api, ama, okd({ ...ask('Why rest today?'), job: 'coach' }));
    await post(api, kofi, okd(ask('Tell me something kind')));
    const amas = await usageOf(ama), kofis = await usageOf(kofi);
    expect(amas.map(r => [r.job, r.model, r.tier, r.outcome]).sort()).toEqual([['ask', 'm-fast', 'fast', 'ok'], ['coach', 'm-strong', 'strong', 'ok']]);
    expect(amas.every(r => r.user_id === ama && r.input_tokens === 1000 && r.output_tokens === 200 && r.cost_micros === 200 && r.location === 'cloud')).toBe(true);
    expect(kofis.map(r => r.user_id)).toEqual([kofi]);
    await clearUsage(ama); await clearUsage(kofi);
  });

  test('a used-up allowance stops before any model is called; a used-up top tier drops to strong and says so', async () => {
    const calls: string[] = [];
    const api = apiWith(trio(calls), { allowances: { fast: { calls: 1, per: 'day' }, strong: { calls: 5, per: 'day' }, top: { calls: 1, per: 'month' }, vision: { calls: 5, per: 'day' }, costMicrosPerMonth: 1_000_000 } });
    expect((await post(api, ama, okd(ask('Tell me something kind')))).status).toBe(200);
    const stopped = await post(api, ama, okd(ask('Tell me something else kind')));
    expect(stopped.status).toBe(429);
    expect((await stopped.json() as { error: string }).error).toBe('RATE_LIMITED');
    expect(await post(api, ama, okd(ask('Should I take this job offer?'))).then(r => r.headers.get('life-model'))).toBe('m-top');
    const second = await post(api, ama, okd(ask('Should I sign this mortgage?')));
    expect(second.headers.get('life-tier')).toBe('strong');
    expect((await second.json() as { notice?: string }).notice).toMatch(/allowance/);
    expect(calls).toEqual(['m-fast', 'm-top', 'm-strong']);
    // The allowance is a rolling day: tomorrow the fast tier answers again.
    now += 25 * 60 * 60 * 1000;
    expect((await post(api, ama, okd(ask('Tell me something kind')))).status).toBe(200);
    // A month's spending cap stops everything, whatever the calls left.
    const capped = apiWith(trio(calls), { allowances: { fast: { calls: 100, per: 'day' }, strong: { calls: 100, per: 'day' }, top: { calls: 100, per: 'month' }, vision: { calls: 100, per: 'day' }, costMicrosPerMonth: 500 } });
    expect((await post(capped, ama, okd(ask('Tell me one more kind thing')))).status).toBe(429);
    now = NOW;
    await clearUsage(ama);
  });

  test('capabilities show which tiers have a model and what is left, never a key', async () => {
    const api = apiWith(trio([]));
    await post(api, ama, okd(ask('Tell me something kind')));
    const res = await api(new Request(`${base}/ai/capabilities`, { headers: { 'x-test-user': ama } }));
    expect(res.status).toBe(200);
    const body = await res.json() as { tiers: Record<string, { available: boolean; models: string[] }>; jobs: Record<string, string>; allowance: Record<string, { left: number; per: string }>; table: { source: string } };
    expect(body.tiers.fast).toEqual({ available: true, models: ['m-fast'] });
    expect(body.jobs.ask).toBe('fast');
    expect(body.allowance.fast.left).toBeGreaterThan(0);
    expect(body.table.source).toBe('evals');
    const empty = await createApi({ db: env.db, auth, now: () => now })(new Request(`${base}/ai/capabilities`, { headers: { 'x-test-user': ama } }));
    expect((await empty.json() as { tiers: Record<string, { available: boolean }> }).tiers.fast.available).toBe(false);
    const run = await post(createApi({ db: env.db, auth, now: () => now }), ama, okd(ask('Tell me something kind')));
    expect(run.status).toBe(503);
    await clearUsage(ama);
  });

  test('the ledger is private to each person', async () => {
    await post(apiWith(trio([])), kofi, okd(ask('Tell me something kind')));
    expect(await usageOf(ama)).toEqual([]);
    expect(await usageOf(kofi)).toHaveLength(1);
    // Ama's session can't remove Kofi's rows either.
    await clearUsage(ama);
    expect(await usageOf(kofi)).toHaveLength(1);
    await clearUsage(kofi);
  });

  async function countEverything(userId: string) {
    const counts: Record<string, number> = {};
    for (const [name, t] of Object.entries({ ...phoneTables, ai_usage: aiUsage })) counts[name] = (await env.db.withUser(userId, tx => tx.select({ n: sql<number>`count(*)::int` }).from(t)))[0].n;
    return counts;
  }
});
