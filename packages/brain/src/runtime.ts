import { BrainError, tierFor, type ModelAdapter, type Request, type Result, type Source } from './types.ts';
import { assertRequest, evidenceText, renderFacts, validateOutput } from './policy.ts';
import { extractStatements } from './extract.ts';
import { isMemoryOverview, retrieveMemories } from './memory.ts';

function localAnswer(request: Request): Result | null {
  const text = request.text.toLowerCase();
  // A file remains available as context, but its facts are not re-proposed on
  // every unrelated message. Reading/extracting it is an explicit action.
  const proposals = extractStatements(request.job === 'extract' || /\b(?:read|extract|attachment|document|file)\b/i.test(request.text) ? evidenceText(request) : request.text);
  const result = (answer: string, sources: Source[] = [], detail?: string): Result => ({ answer, detail, sources, proposals, route: { location: 'rules', model: 'life-rules', tier: tierFor(request.job) }, notices: request.context.sample ? ['Some saved profile information is sample data. Confirmed changes replace the corresponding sample fields.'] : [] });
  // Immediate signposting does not depend on an available model or network.
  if (/\b(?:kill myself|end my life|hurt myself|suicid(?:e|al)|want to die|don[’']?t want to (?:be alive|live)|not worth living)\b/i.test(request.text)) return { ...result('If you might act on this now, call your local emergency number or go to the nearest emergency department. In the UK, call 999 for immediate danger, or Samaritans on 116 123 to talk now. Please reach out to someone you trust who can stay with you.'), proposals: [] };
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

export async function runBrain(request: Request, adapters: ModelAdapter[] = [], signal?: AbortSignal): Promise<Result> {
  assertRequest(request);
  if (signal?.aborted) throw new BrainError('CANCELLED', 'Stopped. Nothing was filed.');
  const local = localAnswer(request);
  if (local) return local;
  const candidates = adapters.filter(a => a.jobs.includes(request.job) && (!request.privateMode || a.location === 'device')).sort((a, b) => ['device', 'server', 'cloud'].indexOf(a.location) - ['device', 'server', 'cloud'].indexOf(b.location));
  let needsConsent = false;
  for (const adapter of candidates) {
    if (!await adapter.available()) continue;
    if (signal?.aborted) throw new BrainError('CANCELLED', 'Stopped. Nothing was filed.');
    if (adapter.location !== 'device' && (request.consent?.requestId !== request.id || !request.consent.locations.includes(adapter.location))) { needsConsent = true; continue; }
    const controller = new AbortController();
    const abort = () => controller.abort();
    signal?.addEventListener('abort', abort, { once: true });
    if (signal?.aborted) controller.abort();
    const timeout = setTimeout(() => controller.abort(), 45000);
    try {
      // Race also bounds an adapter that fails to implement abort itself.
      const raw = await Promise.race([adapter.generate(request, controller.signal), new Promise<never>((_resolve, reject) => {
        if (controller.signal.aborted) reject(new BrainError(signal?.aborted ? 'CANCELLED' : 'TIMEOUT', 'The request stopped. Nothing was filed.'));
        else controller.signal.addEventListener('abort', () => reject(new BrainError(signal?.aborted ? 'CANCELLED' : 'TIMEOUT', 'The request stopped. Nothing was filed.')), { once: true });
      })]);
      if (controller.signal.aborted) throw new BrainError('CANCELLED', 'Stopped. Nothing was filed.');
      const output = validateOutput(raw, request);
      const availableSources = [...request.context.facts.map(f => f.source), ...request.context.memories.map(m => m.source)];
      const sources = [...new Map(output.citations.map(id => availableSources.find(source => source.id === id)!).map(source => [source.id, source])).values()];
      return { answer: renderFacts(output.answer, request), detail: output.detail ? renderFacts(output.detail, request) : undefined, sources, proposals: output.proposals, data: output.data, route: { location: adapter.location, model: adapter.id, tier: tierFor(request.job) }, notices: request.context.sample ? ['The context includes clearly labelled sample data.'] : [] };
    } finally { clearTimeout(timeout); signal?.removeEventListener('abort', abort); }
  }
  if (needsConsent) throw new BrainError('CONSENT_REQUIRED', 'This needs a model outside your phone. Review what will be sent first.');
  throw new BrainError('UNAVAILABLE', request.privateMode ? 'No on-device model is available for this question. Your information has stayed on your phone. You can still use saved facts and engine calculations.' : 'No model is connected for this question yet. Your message is saved, but I won’t invent a reply.');
}
