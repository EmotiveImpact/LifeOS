/**
 * The brain's evals (BUILD_V26 Phase 24): runs each job's cases on every model this machine has a key for, scores
 * quality, cost and speed, and picks each tier's models from the results.
 *
 *   bun tools/evals/run.ts                      life's own rules only (no key needed): the baseline
 *   ANTHROPIC_API_KEY=… bun tools/evals/run.ts  adds every Anthropic model; OPENAI_API_KEY and GEMINI_API_KEY likewise
 *   … --write                                   also writes the winners to apps/api/src/tiers.json
 *   … --jobs=extract --models=claude-haiku-5-5 --bar=0.9 --concurrency=4
 *
 * Every model call spends real money (both jobs: about $0.03 per fast model, $0.90 per strong, $3 per top); the
 * cases are Ama's sample life, never a real person's. Results go to tools/evals/results/.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { parseTierTable, type Job } from '../../packages/brain/src/index.ts';
import { MODELS, modelsFromEnv } from '../../apps/api/src/models/registry';
import { baseline, evaluate } from './runner';
import { passRate, perCase, percentile, pickTiers, type Score } from './score';

const args = new Map(process.argv.slice(2).map(a => { const [k, v] = a.replace(/^--/, '').split('='); return [k, v ?? 'true'] as const; }));
const jobs = (args.get('jobs') ?? 'extract,ask').split(',') as Job[];
const only = args.get('models')?.split(',');
const bar = Number(args.get('bar') ?? 0.9);
const concurrency = Math.max(1, Number(args.get('concurrency') ?? 4));
const tiersPath = new URL('../../apps/api/src/tiers.json', import.meta.url);

const label = (id: string) => (id === 'life-rules' ? 'life’s rules (no model)' : MODELS.find(m => m.id === id)?.label ?? id);
const money = (micros: number) => `$${(micros / 1e6).toFixed(micros < 1e6 ? 3 : 2)}`;
const seconds = (ms: number) => `${(ms / 1000).toFixed(1)}s`;
function report(scores: Score[]): string {
  const rows = scores.map(s => `| ${label(s.model)} | ${s.job} | ${s.passed} of ${s.cases} (${Math.round(passRate(s) * 100)}%) | ${s.model === 'life-rules' ? 'free' : money(perCase(s) * 100)} | ${s.model === 'life-rules' ? '-' : seconds(percentile(s.latencies, 50))} | ${s.model === 'life-rules' ? '-' : seconds(percentile(s.latencies, 90))} |`);
  const misses = scores.filter(s => s.failures.length).map(s => `- ${label(s.model)}, ${s.job}: ${s.failures.map(f => `${f.id} (${f.reason})`).join(', ')}`);
  return ['| Model | Job | Passed | Cost per 100 calls | Median time | Slowest 10% |', '|---|---|---|---|---|---|', ...rows, '', '**Misses**', '', ...misses].join('\n');
}

const models = modelsFromEnv(process.env).filter(m => !only || only.includes(m.spec.id));
const scores: Score[] = [];
for (const job of jobs) scores.push(await baseline(job));
if (!models.length) console.log('No model keys set (ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY): scoring life’s own rules only.\n');
for (const model of models) for (const job of jobs) { console.log(`Running ${label(model.spec.id)} on ${job}…`); scores.push(await evaluate(model, job, concurrency)); }

const table = parseTierTable(JSON.parse(readFileSync(tiersPath, 'utf8')));
const { table: next, decisions } = pickTiers(table, scores.filter(s => s.model !== 'life-rules'), id => MODELS.find(m => m.id === id)?.tiers ?? [], bar);
const text = [report(scores), '', '**Tiers**', '', ...(decisions.length ? decisions.map(d => `- ${d.tier}: ${d.winner ? `${label(d.winner)} wins (${d.reason}); order ${d.order.join(', ')}` : d.reason}`) : ['- No model ran, so tiers.json is unchanged.'])].join('\n');
console.log(text);

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
mkdirSync(new URL('./results/', import.meta.url), { recursive: true });
writeFileSync(new URL(`./results/${stamp}.json`, import.meta.url), JSON.stringify({ at: new Date().toISOString(), bar, scores, decisions }, null, 2) + '\n');
writeFileSync(new URL(`./results/${stamp}.md`, import.meta.url), text + '\n');
if (args.get('write') === 'true') {
  if (decisions.some(d => d.winner)) { writeFileSync(tiersPath, JSON.stringify(next, null, 2) + '\n'); console.log('\nWrote apps/api/src/tiers.json.'); }
  else console.log('\nNo tier was decided, so apps/api/src/tiers.json is unchanged.');
}
