/**
 * The router's tier logic. Pure, so the phone (on-device, then Apple's
 * server, then the life API) and the API (which provider model) share it.
 *
 * A request tries the cheapest tier that can do the job. Chat questions
 * start fast and climb to strong for careful work or to top for a big
 * decision. Which job sits in which tier, and which models serve each tier,
 * come from a tier table the evals write (`tiers.json`), so moving a job or
 * swapping a model is a data change, not an app update.
 */
import { BrainError, type Job, type Request, type Tier } from './types.ts';

export const TIERS: readonly Tier[] = ['fast', 'strong', 'top', 'vision'];
export const BASE_TIERS: Record<Job, Tier> = { extract: 'fast', ask: 'fast', coach: 'strong', 'plan-explain': 'strong', draft: 'strong', lesson: 'strong', analyse: 'strong', showMe: 'strong', food: 'vision', 'read-document': 'strong', remember: 'fast' };
/** Model ids per tier, best first; the rest are warm fallbacks. */
export type TierTable = { version: 1; source: 'evals' | 'default'; updated: string; jobs: Partial<Record<Job, Tier>>; tiers: Partial<Record<Tier, string[]>> };
/** Calls left this period, per tier. A tier that isn't listed has no limit. */
export type RouteLimits = Partial<Record<Tier, number>>;
export type RouteOptions = { table?: TierTable; remaining?: RouteLimits };
export type RoutePlan = { tier: Tier; asked: Tier; models: string[]; reasons: string[]; notice?: string };

const JOBS = Object.keys(BASE_TIERS) as Job[];
const bad = (): never => { throw new BrainError('INVALID_INPUT', 'The model tier table is not valid.'); };
export function parseTierTable(raw: unknown): TierTable {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) bad();
  const t = raw as Record<string, unknown>;
  if (t.version !== 1 || (t.source !== 'evals' && t.source !== 'default') || typeof t.updated !== 'string') bad();
  if (!t.jobs || typeof t.jobs !== 'object' || Array.isArray(t.jobs) || !t.tiers || typeof t.tiers !== 'object' || Array.isArray(t.tiers)) bad();
  for (const [job, tier] of Object.entries(t.jobs as object)) if (!JOBS.includes(job as Job) || !TIERS.includes(tier as Tier)) bad();
  for (const [tier, models] of Object.entries(t.tiers as object)) if (!TIERS.includes(tier as Tier) || !Array.isArray(models) || models.length > 10 || !models.every(m => typeof m === 'string' && m.length > 0 && m.length <= 120)) bad();
  return raw as TierTable;
}

const RANK: Record<Exclude<Tier, 'vision'>, number> = { fast: 0, strong: 1, top: 2 };
const higher = (a: Tier, b: Tier): Tier => a === 'vision' || b === 'vision' ? (a === 'vision' ? a : b) : RANK[a] >= RANK[b] ? a : b;
/** Big, costly-to-get-wrong questions: job moves, moving home, buying or
 * renting, debt, tax and benefits. */
const DECISION = /\b(?:should (?:i|we) (?:take|accept|quit|leave|move|buy|sell|rent|sign|go|switch|retire|remortgage)|can (?:i|we) afford|(?:rent|renting) (?:or|vs\.?|versus) (?:buy|buying)|(?:buy|buying) (?:or|vs\.?|versus) (?:rent|renting)|job offer|redundan\w*|mortgage|inheritance|pension (?:transfer|drawdown|lump sum)|divorc\w*|limited company|self[- ]assessment|universal credit|benefits? claim|big decision)\b/i;
const CAREFUL = /\b(?:explain|step by step|help me (?:understand|think|decide|plan|write|work out)|compare|pros and cons|walk me through|in detail)\b/i;

/** Picks the tier for a request and the models to try, cheapest first. */
export function planRoute(request: Request, options: RouteOptions = {}): RoutePlan {
  const reasons: string[] = [];
  const base = options.table?.jobs[request.job] ?? BASE_TIERS[request.job];
  let tier = base;
  reasons.push(`${request.job} starts at ${base}`);
  if (request.job === 'ask') {
    if (DECISION.test(request.text)) { tier = higher(tier, 'top'); reasons.push('a big decision goes to top'); }
    else if (CAREFUL.test(request.text) || request.text.length > 600 || request.attachments.some(a => a.status === 'ready' && a.text) || request.history.length > 10) { tier = higher(tier, 'strong'); reasons.push('careful or long work goes to strong'); }
  }
  if (request.job === 'read-document' && request.attachments.some(a => !a.text && /^(?:image\/|application\/pdf)/.test(a.mime))) { tier = 'vision'; reasons.push('a photo or scan needs vision'); }
  const asked = tier;
  let notice: string | undefined;
  const left = (t: Tier) => options.remaining?.[t];
  if (tier === 'top' && left('top') !== undefined && left('top')! <= 0) {
    tier = 'strong';
    notice = 'Your allowance for Life’s deepest model is used up for the last 30 days, so this answer uses the strong model.';
    reasons.push('top allowance used, so strong');
  }
  if (left(tier) !== undefined && left(tier)! <= 0) throw new BrainError('RATE_LIMITED', 'You’ve used your AI allowance for the last 24 hours. Your message is saved, and saved facts and calculations still work.');
  return { tier, asked, models: [...(options.table?.tiers[tier] ?? [])], reasons, ...(notice ? { notice } : {}) };
}

const size = (r: Request) => JSON.stringify({ t: r.text, h: r.history, c: r.context, a: r.attachments }).length;
/** Fits a request into a small context window (the phone's model). Drops the
 * oldest messages first, then the least relevant memories (they arrive best
 * first). Never cuts your words or a document: returns null instead, so the
 * runtime moves on to a model with room. */
export function fitContext(request: Request, maxChars: number): Request | null {
  if (size(request) <= maxChars) return request;
  const fitted: Request = { ...request, history: [...request.history], context: { ...request.context, memories: [...request.context.memories] } };
  while (size(fitted) > maxChars && fitted.history.length) fitted.history.shift();
  while (size(fitted) > maxChars && fitted.context.memories.length) fitted.context.memories.pop();
  return size(fitted) <= maxChars ? fitted : null;
}
