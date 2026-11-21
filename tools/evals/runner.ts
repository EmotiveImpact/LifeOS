/**
 * Runs a job's cases on one model, or on life's own rules, and scores them (`run.ts` is the command line).
 */
import { BrainError, extractStatements, runBrain, type Job, type ModelAdapter, type Request, type Result } from '../../packages/brain/src/index.ts';
import { costMicros, jobsFor, type ProviderModel, type Usage } from '../../apps/api/src/models/types';
import { amaContext, askCases, askRequest, extractCases, extractRequest, scoreAsk, scoreAskRendered, scoreExtract, type Outcome, type Score } from './score';

type Case = { id: string; request: Request; score: (result: Result) => Outcome };
function casesFor(job: Job): Case[] {
  const context = amaContext();
  if (job === 'extract') return extractCases().map(c => ({ id: c.id, request: extractRequest(c), score: r => scoreExtract(c, r.output?.proposals ?? []) }));
  if (job === 'ask') return askCases().map(c => ({ id: c.id, request: askRequest(c, context), score: r => (r.output ? scoreAsk(c, r.output) : { pass: false, reason: 'no model answer' }) }));
  throw new Error(`No cases for ${job} yet`);
}

/** life's own rules, with no model: what a model has to beat. */
export async function baseline(job: Job): Promise<Score> {
  const score: Score = { model: 'life-rules', job, cases: 0, passed: 0, costMicros: 0, latencies: [], failures: [] };
  const context = amaContext();
  const cases = job === 'extract' ? extractCases() : askCases();
  for (const c of cases) {
    score.cases++;
    let outcome: Outcome;
    if (job === 'extract') outcome = scoreExtract(c as ReturnType<typeof extractCases>[number], extractStatements(c.text));
    else {
      try { outcome = scoreAskRendered(c as ReturnType<typeof askCases>[number], await runBrain(askRequest(c as ReturnType<typeof askCases>[number], context), []), context); } catch (error) { outcome = { pass: false, reason: error instanceof BrainError ? error.code : String(error) }; }
    }
    if (outcome.pass) score.passed++; else score.failures.push({ id: c.id, reason: outcome.reason ?? 'failed' });
    score.latencies.push(0);
  }
  return score;
}

export async function evaluate(model: ProviderModel, job: Job, concurrency = 4): Promise<Score> {
  const score: Score = { model: model.spec.id, job, cases: 0, passed: 0, costMicros: 0, latencies: [], failures: [] };
  const queue = casesFor(job);
  const worker = async () => {
    for (let c = queue.shift(); c; c = queue.shift()) {
      const usage: Usage = { inputTokens: 0, outputTokens: 0 };
      // No `tiers` here: every model sees every case, whatever tier the case would route to in use.
      const adapter: ModelAdapter = {
        id: model.spec.id, location: 'cloud', jobs: jobsFor(model.spec), available: async () => true,
        generate: async (request, signal) => {
          const reply = await model.call(request, signal);
          usage.inputTokens += reply.usage.inputTokens; usage.outputTokens += reply.usage.outputTokens;
          if (reply.failure) throw reply.failure;
          return reply.output;
        },
      };
      const started = performance.now();
      let outcome: Outcome;
      try { outcome = c.score(await runBrain(c.request, [adapter], undefined, { rules: false, timeoutMs: 45000 })); } catch (error) { outcome = { pass: false, reason: error instanceof BrainError ? error.code : String(error) }; }
      score.latencies.push(performance.now() - started);
      score.costMicros += costMicros(model.spec, usage);
      score.cases++;
      if (outcome.pass) score.passed++; else score.failures.push({ id: c.id, reason: outcome.reason ?? 'failed' });
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  return score;
}
