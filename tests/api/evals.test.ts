import { describe, expect, test } from 'bun:test';
import { extractStatements, modelPayload, type ModelOutput, type Request, type TierTable } from '../../packages/brain/src/index.ts';
import type { ModelSpec, ProviderModel } from '../../apps/api/src/models/types';
import { baseline, evaluate } from '../../tools/evals/runner';
import { amaContext, askCases, extractCases, pickTiers, scoreAsk, scoreExtract, type Score } from '../../tools/evals/score';

/** BUILD_V26 Phase 24: the eval sets and the rule that picks tiers from them. No model is called. */
const FIELDS = ['age', 'location', 'household', 'work', 'income', 'rent', 'goal', 'note', 'bill', 'subscription', 'date', 'person', 'document', 'appointment'];
const spec = (id: string): ModelSpec => ({ id, provider: 'anthropic', model: id, label: id, tiers: ['fast'], vision: false, price: { input: 0.1, output: 0.5 }, maxOutputTokens: 1000, confirmed: true });
const standIn = (id: string, answer: (request: Request) => unknown): ProviderModel => ({ spec: spec(id), call: async request => ({ output: answer(request), usage: { inputTokens: 1000, outputTokens: 100 } }) });

describe('the case sets', () => {
  test('30 to 50 cases a job, each with its own id, and every expectation names a real field', () => {
    const extract = extractCases(), ask = askCases();
    for (const set of [extract, ask]) {
      expect(set.length).toBeGreaterThanOrEqual(30);
      expect(set.length).toBeLessThanOrEqual(50);
      expect(new Set(set.map(c => c.id)).size).toBe(set.length);
    }
    for (const c of extract) for (const e of c.expect) expect(FIELDS).toContain(e.field);
    // Both sides: things to file, and things that must not be filed (questions, maybes, the past, other people).
    expect(extract.filter(c => c.expect.every(e => e.optional)).length).toBeGreaterThanOrEqual(8);
  });

  test('every fact and source an ask case expects is in Ama’s context', () => {
    const context = amaContext();
    const facts = new Set(context.facts.map(f => f.id)), sources = new Set([...context.facts.map(f => f.source.id), ...context.memories.map(m => m.source.id)]);
    for (const c of askCases()) {
      for (const r of [...(c.refs ?? []), ...(c.refsAny ?? [])]) expect(facts.has(r)).toBe(true);
      for (const s of c.cites ?? []) expect(sources.has(s)).toBe(true);
    }
  });
});

describe('scoring', () => {
  const rent = { id: 'x', text: 'My rent is £950 a month.', expect: [{ field: 'rent' as const, value: 950 }] };
  const proposal = (field: string, value: string | number) => ({ id: `p-${field}`, field, area: 'money', label: field, quote: 'My rent is £950 a month.', value }) as never;
  test('extract: everything expected and nothing else', () => {
    expect(scoreExtract(rent, [proposal('rent', 950)]).pass).toBe(true);
    expect(scoreExtract(rent, [proposal('rent', 900)])).toEqual({ pass: false, reason: 'missed rent' });
    expect(scoreExtract(rent, [proposal('rent', 950), proposal('note', 'rent')])).toEqual({ pass: false, reason: 'filed an extra note' });
    expect(scoreExtract({ ...rent, expect: [...rent.expect, { field: 'note', optional: true }] }, [proposal('rent', 950), proposal('note', 'rent')]).pass).toBe(true);
    expect(scoreExtract({ id: 'q', text: 'Should I move?', expect: [] }, []).pass).toBe(true);
  });
  test('ask: the right facts and sources, nothing forbidden, nothing proposed', () => {
    const c = { id: 'a', text: 'How much do I take home?', refs: ['income.netMonthly'], cites: ['engine:income'], forbid: ['guaranteed'] };
    const out = (answer: string, extra: Partial<ModelOutput> = {}): ModelOutput => ({ answer, citations: ['engine:income'], proposals: [], ...extra });
    expect(scoreAsk(c, out('About {{fact:income.netMonthly}} a month.')).pass).toBe(true);
    expect(scoreAsk(c, out('About the usual.')).reason).toBe('left out income.netMonthly');
    expect(scoreAsk(c, out('About {{fact:income.netMonthly}}.', { citations: [] })).reason).toBe("didn't cite engine:income");
    expect(scoreAsk(c, out('{{fact:income.netMonthly}}, guaranteed.')).reason).toMatch(/guaranteed/);
    expect(scoreAsk(c, out('{{fact:income.netMonthly}}.', { proposals: [proposal('rent', 950)] })).pass).toBe(false);
  });
});

describe('running the cases', () => {
  test('life’s own rules set the baseline a model has to beat', async () => {
    const extract = await baseline('extract'), ask = await baseline('ask');
    expect(extract.passed).toBeGreaterThanOrEqual(30);
    expect(ask.passed).toBeGreaterThan(0);
    expect(ask.passed).toBeLessThan(ask.cases);
  });

  test('a model’s answers go through the brain’s checks before they are scored, and their cost is counted', async () => {
    // A stand-in that files exactly what life's rules find: it should score what the rules score.
    const echo = standIn('echo', request => ({ answer: 'Review what I picked out.', citations: [], proposals: extractStatements(request.text) }));
    const scored = await evaluate(echo, 'extract');
    expect(scored.passed).toBe((await baseline('extract')).passed);
    expect(scored.costMicros).toBe(scored.cases * (1000 * 0.1 + 100 * 0.5));
    // A stand-in that writes its own sums fails every case where it does, however right the sum.
    const sums = standIn('sums', request => ({ answer: `You have £${JSON.stringify(modelPayload(request)).length} left.`, citations: [], proposals: [] }));
    const ask = await evaluate(sums, 'ask');
    expect(ask.passed).toBe(0);
    expect(ask.failures.every(f => f.reason === 'INVALID_OUTPUT')).toBe(true);
  });
});

describe('picking tiers from the results', () => {
  const table: TierTable = { version: 1, source: 'default', updated: '2026-11-01', jobs: {}, tiers: { fast: ['a', 'b', 'c'], strong: ['s'] } };
  const score = (model: string, job: 'extract' | 'ask', passed: number, costMicros: number): Score => ({ model, job, cases: 10, passed, costMicros, latencies: [1000], failures: [] });
  test('the cheapest model over the bar on every job wins; the rest follow, best first', () => {
    const { table: next, decisions } = pickTiers(table, [score('a', 'extract', 10, 900), score('a', 'ask', 10, 900), score('b', 'extract', 10, 300), score('b', 'ask', 9, 300), score('c', 'extract', 10, 100), score('c', 'ask', 6, 100)], () => ['fast'], 0.9, '2026-11-20');
    expect(next.tiers.fast).toEqual(['b', 'a', 'c']);
    expect(next.source).toBe('evals');
    expect(next.updated).toBe('2026-11-20');
    expect(next.tiers.strong).toEqual(['s']);
    expect(decisions).toHaveLength(1);
    expect(decisions[0]).toMatchObject({ tier: 'fast', winner: 'b' });
  });
  test('when no model clears the bar, the tier stays as it was', () => {
    const { table: next, decisions } = pickTiers(table, [score('a', 'extract', 5, 100), score('a', 'ask', 5, 100)], () => ['fast']);
    expect(next).toEqual(table);
    expect(decisions[0].winner).toBeNull();
  });
  test('a model that only ran one of a tier’s jobs is not picked for it', () => {
    const { decisions } = pickTiers(table, [score('a', 'extract', 10, 100), score('b', 'extract', 10, 500), score('b', 'ask', 10, 500)], () => ['fast']);
    expect(decisions[0].winner).toBe('b');
    expect(decisions[0].order).toEqual(['b']);
  });
});
