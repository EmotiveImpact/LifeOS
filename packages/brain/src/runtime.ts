import { BrainError, tierFor, type ModelAdapter, type Request, type Result, type Source } from './types.ts';
import { assertRequest, evidenceText, renderFacts, validateOutput } from './policy.ts';
import { extractStatements } from './extract.ts';
import { isMemoryOverview, retrieveMemories } from './memory.ts';
import { detectCrisis, supportResponse, type CrisisKind, type CrisisSignal } from './safety.ts';
import { renderData } from './jobs.ts';
import { consentFor, type ConsentCheck } from './consent.ts';
import { fitContext, planRoute, type RouteOptions } from './router.ts';

function localAnswer(request: Request): Result | null {
  const text = request.text.toLowerCase();
  // A file remains available as context, but its facts are not re-proposed on
  // every unrelated message. Reading/extracting it is an explicit action.
  const proposals = extractStatements(request.job === 'extract' || /\b(?:read|extract|attachment|document|file)\b/i.test(request.text) ? evidenceText(request) : request.text);
  const result = (answer: string, sources: Source[] = [], detail?: string): Result => ({ answer, detail, sources, proposals, route: { location: 'rules', model: 'life-rules', tier: tierFor(request.job) }, notices: request.context.sample ? ['Some saved profile information is sample data. Confirmed changes replace the corresponding sample fields.'] : [] });
  if (request.job === 'extract') return result(proposals.length ? 'Review what I picked out before it changes your records or plan.' : 'I could not safely identify a fact to file. Try an explicit statement, or start with “Remember that…”.');
  if (!['ask', 'coach', 'plan-explain'].includes(request.job)) return null;
  if (proposals.length && !/\?/.test(request.text)) return result('I’ve picked out changes for you to review. Nothing is filed until you confirm.');
  const relevant = isMemoryOverview(request.text) ? request.context.memories.slice(0, 6) : retrieveMemories(request.text, request.context.memories);
  if (relevant.length && /\b(?:remember|rent|said|told|know about|birthday|name|live|flatmates|likes?|prefers?)\b/.test(text)) return result(relevant.map(m => m.text).join('\n\n'), relevant.map(m => m.source));
  const fact = (id: string) => request.context.facts.find(f => f.id === id);
  if (/\b(?:money|take.home|tax reserve|income|salary|tax pot)\b/.test(text) && !/\b(?:should i|invest|buy|limited|company|why|how does)\b/.test(text)) {
    const net = fact('income.netMonthly'), reserve = fact('income.taxReserveMonthly');
    if (net && reserve) return result(`Your estimated monthly take-home is ${net.value}. The engine’s monthly tax reserve is ${reserve.value}. These use your saved profile, not a connected bank account.`, [net.source, reserve.source], 'Estimate, not financial advice. Change or confirm your income and work status to update these calculations.');
  }
  if (/\b(?:urgent|next move|what.*today|where.*start|overwhelmed|my plan)\b/.test(text) || request.job === 'plan-explain') {
    const next = request.context.moves[0];
    return next ? result(`Start with “${next.title}”.`, [{ id: `move:${next.id}`, kind: 'engine', label: 'Eligible task from life’s engine', sample: request.context.sample }], next.reasons.join(' ')) : result('There is no eligible next move in the current engine snapshot. You can add or correct a fact to help build your plan.');
  }
  if (/\bhow am i doing\b/.test(text)) { const score = fact('life.score'); if (score) return result(`Your engine score is ${score.value}.`, [score.source], 'This is the app’s planning score, not a medical or financial assessment.'); }
  if (/\b(?:what can you do|help)\b/.test(text)) return result('I can use saved facts, recall confirmed information, show engine calculations and help you review changes. Open-ended reasoning needs an available AI model; it will not silently send your information elsewhere.');
  return null;
}

/** The fixed support reply: no model, no filing, no sample-data notice. */
function supportResult(request: Request, crisis: CrisisSignal): Result {
  const safety = supportResponse(crisis);
  return { answer: safety.answer, detail: safety.detail, sources: [], proposals: [], route: { location: 'rules', model: 'life-safety', tier: tierFor(request.job) }, notices: [], safety };
}

const KINDS: readonly CrisisKind[] = ['suicide', 'self-harm', 'overdose', 'someone-else', 'unsafe'];
/** The life API's support signal: only the level and kinds travel, so the words and numbers are always the phone's own. */
function relayedSupport(raw: unknown): CrisisSignal | null {
  const support = raw && typeof raw === 'object' ? (raw as { support?: unknown }).support : undefined;
  if (!support || typeof support !== 'object') return null;
  const { level, kinds } = support as { level?: unknown; kinds?: unknown };
  if ((level !== 'concern' && level !== 'urgent') || !Array.isArray(kinds) || !kinds.length || !kinds.every(k => KINDS.includes(k as CrisisKind))) return null;
  return { level, kinds: [...new Set(kinds as CrisisKind[])], matched: '' };
}
const relayedNotice = (raw: unknown): string[] => {
  const notice = (raw as { notice?: unknown }).notice;
  return typeof notice === 'string' && notice.trim() && notice.length <= 300 ? [notice.trim()] : [];
};

/** `rules: false` skips life's own answers (the life API: the phone has already tried them, and filing should reach
 * the model). The crisis check always runs. */
export type RunOptions = { route?: RouteOptions; now?: () => number; timeoutMs?: number; rules?: boolean };

export async function runBrain(request: Request, adapters: ModelAdapter[] = [], signal?: AbortSignal, options: RunOptions = {}): Promise<Result> {
  // Immediate signposting comes before validation, models and the network,
  // so a long or malformed message in distress still gets support.
  const crisis = typeof request?.text === 'string' ? detectCrisis(request.text) : null;
  if (crisis) return supportResult(request, crisis);
  assertRequest(request);
  if (signal?.aborted) throw new BrainError('CANCELLED', 'Stopped. Nothing was filed.');
  const local = options.rules === false ? null : localAnswer(request);
  if (local) return local;
  // Cheapest place first (phone, then server, then cloud); within a place, the
  // tier table's order. Allowances are checked before any model is called.
  const plan = planRoute(request, options.route);
  const now = options.now?.() ?? Date.now();
  const where = { device: 0, server: 1, cloud: 2 } as const;
  const preference = (id: string) => { const at = plan.models.indexOf(id); return at < 0 ? plan.models.length : at; };
  const candidates = adapters.filter(a => a.jobs.includes(request.job) && (!request.privateMode || a.location === 'device') && (!a.tiers || a.tiers.includes(plan.tier))).sort((a, b) => where[a.location] - where[b.location] || preference(a.id) - preference(b.id));
  let refused: ConsentCheck | null = null;
  let unavailable: BrainError | null = null;
  for (const adapter of candidates) {
    if (!await adapter.available()) continue;
    if (signal?.aborted) throw new BrainError('CANCELLED', 'Stopped. Nothing was filed.');
    const allowed = consentFor(request, adapter.location, now);
    if (!allowed.ok) { refused = allowed; continue; }
    const sent = adapter.maxContextChars ? fitContext(request, adapter.maxContextChars) : request;
    if (!sent) continue;
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) controller.abort();
    const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 45000);
    try {
      // Race also bounds an adapter that fails to implement abort itself.
      const raw = await Promise.race([adapter.generate(sent, controller.signal), new Promise<never>((_resolve, reject) => {
        if (controller.signal.aborted) reject(new BrainError(signal?.aborted ? 'CANCELLED' : 'TIMEOUT', 'The request stopped. Nothing was filed.'));
        else controller.signal.addEventListener('abort', () => reject(new BrainError(signal?.aborted ? 'CANCELLED' : 'TIMEOUT', 'The request stopped. Nothing was filed.')), { once: true });
      })]);
      if (controller.signal.aborted) throw new BrainError('CANCELLED', 'Stopped. Nothing was filed.');
      const support = adapter.relay ? relayedSupport(raw) : null;
      if (support) return supportResult(request, support);
      const output = validateOutput(raw, sent);
      const availableSources = [...sent.context.facts.map(f => f.source), ...sent.context.memories.map(m => m.source)];
      const sources = [...new Map(output.citations.map(id => availableSources.find(source => source.id === id)!).map(source => [source.id, source])).values()];
      const notices = [...new Set([...(plan.notice ? [plan.notice] : []), ...(adapter.relay ? relayedNotice(raw) : []), ...(sent.context.sample ? ['The context includes clearly labelled sample data.'] : [])])];
      const checked = { answer: output.answer, ...(output.detail !== undefined ? { detail: output.detail } : {}), citations: output.citations, proposals: output.proposals, ...(output.data !== undefined ? { data: output.data } : {}) };
      return { answer: renderFacts(output.answer, sent), detail: output.detail ? renderFacts(output.detail, sent) : undefined, sources, proposals: output.proposals, data: output.data === undefined ? undefined : renderData(output.data, text => renderFacts(text, sent)), route: { location: adapter.location, model: adapter.id, tier: plan.tier }, notices, output: checked };
    } catch (error) {
      // A provider that is down or busy hands over to the next model in the tier. A timeout, a stop or a bad
      // answer ends the request: nothing is retried behind the person's back.
      if (error instanceof BrainError && error.code === 'UNAVAILABLE' && !controller.signal.aborted) { unavailable = error; continue; }
      throw error;
    } finally { clearTimeout(timeout); signal?.removeEventListener('abort', abort); }
  }
  if (unavailable && !refused) throw unavailable;
  if (refused && !refused.ok) throw new BrainError('CONSENT_REQUIRED', refused.reason === 'HEALTH_NEEDS_CONSENT' ? 'This includes health details, so it needs your OK for this request before it leaves your phone.' : 'This needs a model outside your phone. Review what will be sent first.');
  throw new BrainError('UNAVAILABLE', request.privateMode ? 'No on-device model is available for this question. Your information has stayed on your phone. You can still use saved facts and engine calculations.' : 'No model is connected for this question yet. Your message is saved, but I won’t invent a reply.');
}
