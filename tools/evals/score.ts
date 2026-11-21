/**
 * Scoring for the brain's evals (BUILD_V26 Phase 24): one case set per job, a pass or a fail per case, and the rule
 * that picks each tier's models from the results. Kept apart from `run.ts` so tests can check it without a key.
 *
 * A case passes only when the model's answer gets through the brain's own checks first (numbers only as
 * `{{fact:id}}` references, no claimed actions, proposals grounded in the person's words), and then:
 * - extract: every expected proposal is there, and nothing else is (filing the wrong thing is worse than missing one);
 * - ask: the expected facts are referenced, the expected sources cited, nothing forbidden is said, nothing is proposed.
 */
import { readFileSync } from 'node:fs';
import { BASE_TIERS, TIERS, type Context, type Field, type Job, type ModelOutput, type Proposal, type Request, type Result, type Tier, type TierTable } from '../../packages/brain/src/index.ts';

export type Expected = { field: Field; value?: string | number; details?: Record<string, unknown>; optional?: boolean };
export type ExtractCase = { id: string; text: string; expect: Expected[]; note?: string };
export type AskCase = { id: string; text: string; refs?: string[]; refsAny?: string[]; cites?: string[]; mentions?: string[]; forbid?: string[]; note?: string };
export type Outcome = { pass: boolean; reason?: string };

const here = (path: string) => new URL(path, import.meta.url);
const lines = <T>(path: string): T[] => readFileSync(here(path), 'utf8').split('\n').filter(l => l.trim()).map(l => JSON.parse(l) as T);
export const extractCases = (): ExtractCase[] => lines('./extract/cases.jsonl');
export const askCases = (): AskCase[] => lines('./ask/cases.jsonl');
export const amaContext = (): Context => (JSON.parse(readFileSync(here('./ama.json'), 'utf8')) as { context: Context }).context;

/** Requests as the phone sends them, with this request's own OK for a cloud model. */
export function extractRequest(c: ExtractCase): Request {
  return { id: `eval-${c.id}`, job: 'extract', text: c.text, context: { sample: false, facts: [], memories: [], moves: [] }, history: [], attachments: [], privateMode: false, consent: { requestId: `eval-${c.id}`, locations: ['cloud'] } };
}
export function askRequest(c: AskCase, context = amaContext()): Request {
  return { id: `eval-${c.id}`, job: 'ask', text: c.text, context, history: [], attachments: [], privateMode: false, consent: { requestId: `eval-${c.id}`, locations: ['cloud'] } };
}

const lower = (v: string) => v.toLowerCase().replace(/[’]/g, "'");
/** Numbers equal; words equal ignoring case, or one inside the other ("Octopus" and "Octopus Energy"); objects key by key. */
export function same(expected: unknown, actual: unknown): boolean {
  if (typeof expected === 'number') return typeof actual === 'number' && Math.abs(expected - actual) < 0.005;
  if (typeof expected === 'string') return typeof actual === 'string' && (lower(actual).includes(lower(expected)) || lower(expected).includes(lower(actual)));
  if (expected && typeof expected === 'object') return !!actual && typeof actual === 'object' && Object.entries(expected).every(([k, v]) => same(v, (actual as Record<string, unknown>)[k]));
  return expected === actual;
}
const fits = (e: Expected, p: Proposal) => p.field === e.field && (e.value === undefined || same(e.value, p.value)) && (e.details === undefined || same(e.details, p.details));

export function scoreExtract(c: ExtractCase, proposals: Proposal[]): Outcome {
  const left = [...proposals];
  for (const e of c.expect.filter(e => !e.optional)) {
    const at = left.findIndex(p => fits(e, p));
    if (at < 0) return { pass: false, reason: `missed ${e.field}` };
    left.splice(at, 1);
  }
  const extra = left.find(p => !c.expect.some(e => e.optional && fits(e, p)));
  return extra ? { pass: false, reason: `filed an extra ${extra.field}` } : { pass: true };
}

const refsIn = (output: ModelOutput) => new Set([...`${output.answer} ${output.detail ?? ''}`.matchAll(/\{\{fact:([^}]+)\}\}/g)].map(m => m[1]));
export function scoreAsk(c: AskCase, output: ModelOutput): Outcome {
  const refs = refsIn(output), words = lower(`${output.answer} ${output.detail ?? ''}`);
  if (output.proposals.length) return { pass: false, reason: 'proposed a change from a question' };
  if (output.answer.length > 600) return { pass: false, reason: 'answer too long' };
  for (const r of c.refs ?? []) if (!refs.has(r)) return { pass: false, reason: `left out ${r}` };
  if (c.refsAny && !c.refsAny.some(r => refs.has(r))) return { pass: false, reason: 'used none of the expected facts' };
  for (const s of c.cites ?? []) if (!output.citations.includes(s)) return { pass: false, reason: `didn't cite ${s}` };
  for (const m of c.mentions ?? []) if (!words.includes(lower(m))) return { pass: false, reason: `didn't mention ${m}` };
  for (const f of c.forbid ?? []) if (words.includes(lower(f))) return { pass: false, reason: `said “${f}”` };
  return { pass: true };
}

/** life's own rules, scored on what they show the person (values filled in), as the baseline a model has to beat. */
export function scoreAskRendered(c: AskCase, result: Result, context: Context): Outcome {
  const words = lower(`${result.answer} ${result.detail ?? ''}`);
  const value = (id: string) => context.facts.find(f => f.id === id)?.value ?? '\u0000';
  if (result.proposals.length) return { pass: false, reason: 'proposed a change from a question' };
  for (const r of c.refs ?? []) if (!words.includes(lower(value(r)))) return { pass: false, reason: `left out ${r}` };
  if (c.refsAny && !c.refsAny.some(r => words.includes(lower(value(r))))) return { pass: false, reason: 'used none of the expected facts' };
  for (const s of c.cites ?? []) if (!result.sources.some(x => x.id === s)) return { pass: false, reason: `didn't cite ${s}` };
  for (const m of c.mentions ?? []) if (!words.includes(lower(m))) return { pass: false, reason: `didn't mention ${m}` };
  for (const f of c.forbid ?? []) if (words.includes(lower(f))) return { pass: false, reason: `said “${f}”` };
  return { pass: true };
}

export type Score = { model: string; job: Job; cases: number; passed: number; costMicros: number; latencies: number[]; failures: { id: string; reason: string }[] };
export const passRate = (s: Score) => (s.cases ? s.passed / s.cases : 0);
export const perCase = (s: Score) => (s.cases ? s.costMicros / s.cases : 0);
export function percentile(values: number[], p: number): number {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1)];
}

export type Decision = { tier: Tier; jobs: Job[]; winner: string | null; order: string[]; reason: string };
/**
 * Tiers picked by evals, not by preference: in each tier whose jobs were all evaluated, the models that pass the
 * bar on every job are ordered cheapest per case first (pass rate, then speed, break ties); the rest follow, best
 * first, as warm fallbacks. No model over the bar leaves the tier as it was.
 */
export function pickTiers(table: TierTable, scores: Score[], tiersOf: (model: string) => Tier[], bar = 0.9, today = new Date().toISOString().slice(0, 10)): { table: TierTable; decisions: Decision[] } {
  const jobsIn = (tier: Tier) => (Object.keys(BASE_TIERS) as Job[]).filter(job => (table.jobs[job] ?? BASE_TIERS[job]) === tier);
  const decisions: Decision[] = [];
  const tiers = { ...table.tiers };
  for (const tier of TIERS) {
    const evaluated = [...new Set(scores.map(s => s.job))];
    const jobs = jobsIn(tier).filter(j => evaluated.includes(j));
    if (!jobs.length) continue;
    const models = [...new Set(scores.map(s => s.model))].filter(m => tiersOf(m).includes(tier) && jobs.every(j => scores.some(s => s.model === m && s.job === j)));
    const summary = models.map(model => {
      const mine = scores.filter(s => s.model === model && jobs.includes(s.job));
      return { model, worst: Math.min(...mine.map(passRate)), cost: mine.reduce((n, s) => n + perCase(s), 0), speed: percentile(mine.flatMap(s => s.latencies), 50) };
    });
    const over = summary.filter(s => s.worst >= bar).sort((a, b) => a.cost - b.cost || b.worst - a.worst || a.speed - b.speed);
    const under = summary.filter(s => s.worst < bar).sort((a, b) => b.worst - a.worst || a.cost - b.cost);
    const order = [...over, ...under].map(s => s.model);
    if (!over.length) { decisions.push({ tier, jobs, winner: null, order, reason: `no model passed ${Math.round(bar * 100)}% on ${jobs.join(' and ')}; tier left as it was` }); continue; }
    tiers[tier] = [...order, ...(table.tiers[tier] ?? []).filter(m => !order.includes(m))];
    decisions.push({ tier, jobs, winner: over[0].model, order, reason: `cheapest of ${over.length} over ${Math.round(bar * 100)}% on ${jobs.join(' and ')}` });
  }
  const decided = decisions.some(d => d.winner);
  return { table: decided ? { ...table, source: 'evals', updated: today, tiers } : table, decisions };
}
