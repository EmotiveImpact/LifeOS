import { desc, gte, isNull, sql } from 'drizzle-orm';
import { z } from 'zod';
import {
  BASE_TIERS, BrainError, CONSENT_POLICY_VERSION, MAX_PHOTO_CHARS, TIERS, activeGrants, assertRequest, detectCrisis, parseTierTable, planRoute, runBrain,
  type ConsentGrant, type Job, type ModelAdapter, type Request as BrainRequest, type RouteLimits, type Tier, type TierTable,
} from '../../../packages/brain/src/index.ts';
import type { Db } from './db/client';
import { aiUsage, prefs } from './db/schema';
import { costMicros, jobsFor, type ModelSpec, type ProviderModel, type Usage } from './models/types';
import tiersFile from './tiers.json';

/**
 * The server router (BUILD_V26 Phase 24): the life API's half of the brain.
 *
 * The phone has already run the crisis check, life's own rules, consent and its own route; it sends the request here
 * only when a cloud model is needed. The API trusts none of that and runs the same rules again:
 *
 * 1. Distress in the words gets the support signal, with no model, no filing and nothing written.
 * 2. Private mode, in the request or in the person's own synced settings, stops here: PRIVATE_MODE.
 * 3. Consent is the request's own OK, or a standing OK from the person's synced settings. Grants the request carries
 *    itself are ignored.
 * 4. Allowances come from the cost ledger (`ai_usage`), never from memory: calls per tier over a rolling day (a
 *    rolling 30 days for top), and a monthly spending cap. A used-up top tier drops to strong and says so.
 * 5. The model comes from tiers.json; a busy provider hands over to the next model in the tier.
 * 6. The answer is checked by the brain's own rules (numbers only from facts, no claimed actions, proposals grounded
 *    in the person's words) and sent back unrendered, for the phone to check again.
 * 7. Every billed call is written to the ledger, including refused and rejected ones.
 *
 * A meal or label photo rides in the request itself (base64, made small on the phone), goes to the vision model for
 * that one call and is never written anywhere: not to storage, the ledger or a log.
 */

export type Allowance = { calls: number; per: 'day' | 'month' };
export type Allowances = Record<Tier, Allowance> & { costMicrosPerMonth: number };
/**
 * Defaults until the owner sets them (NOTES). life has no free tier, so these are guard rails, not a product limit:
 * fast, strong and vision are far above a busy month's use; top keeps a monthly allowance because a heavy member on
 * Opus alone would cost more than they pay; the spending cap ($5) sits above the 30% AI budget and below one month's
 * net revenue per member.
 */
export const DEFAULT_ALLOWANCES: Allowances = {
  fast: { calls: 300, per: 'day' },
  strong: { calls: 60, per: 'day' },
  vision: { calls: 30, per: 'day' },
  top: { calls: 20, per: 'month' },
  costMicrosPerMonth: 5_000_000,
};

export type AiOptions = {
  models: ProviderModel[];
  /** Defaults to tiers.json. */
  table?: TierTable;
  allowances?: Allowances;
  /** How long one model call may take. */
  timeoutMs?: number;
};

export const loadTierTable = (): TierTable => parseTierTable(tiersFile);

const DAY = 24 * 60 * 60 * 1000, MONTH = 30 * DAY;
const JOBS = Object.keys(BASE_TIERS) as [Job, ...Job[]];
const AREAS = ['you', 'home', 'work', 'money', 'health', 'goal'] as const;
const id = z.string().min(1).max(200);
const Sensitivity = z.enum(['health', 'money', 'other']).optional();
const Source = z.object({ id, label: z.string().max(200), kind: z.enum(['engine', 'record', 'memory', 'attachment', 'profile']), at: z.string().max(40).optional(), sample: z.boolean().optional() });
/** The request as the phone builds it. Unknown fields, `grants` and `user_id` included, are dropped. */
const RequestBody = z.object({
  id: z.string().min(1).max(120),
  job: z.enum(JOBS),
  text: z.string().max(12000),
  context: z.object({
    facts: z.array(z.object({ id, label: z.string().max(200), value: z.string().max(500), source: Source, sensitivity: Sensitivity })).max(200),
    memories: z.array(z.object({ id, text: z.string().max(2000), source: Source, recordId: z.string().max(200).optional(), sensitivity: Sensitivity })).max(100),
    moves: z.array(z.object({ id, title: z.string().max(300), reasons: z.array(z.string().max(500)).max(10), area: z.enum(AREAS), urgent: z.boolean() })).max(30),
    sample: z.boolean(),
  }),
  history: z.array(z.object({ role: z.enum(['user', 'life']), text: z.string().max(12000) })).max(20),
  attachments: z.array(z.object({ id, name: z.string().max(200), mime: z.string().max(100), uri: z.string().max(2000), size: z.number().int().min(0), text: z.string().max(40000).optional(), data: z.string().max(MAX_PHOTO_CHARS).regex(/^[A-Za-z0-9+/]+={0,2}$/).optional(), status: z.enum(['ready', 'needs-reader', 'failed']), error: z.string().max(500).optional() })).max(5),
  privateMode: z.boolean(),
  consent: z.object({ requestId: z.string().max(120), locations: z.array(z.enum(['device', 'server', 'cloud'])).max(3) }).nullable(),
});

export type AiReply = { status: number; body: unknown; headers?: Record<string, string> };
const refuse = (status: number, error: string, message?: string): AiReply => ({ status, body: message ? { error, message } : { error } });
const STATUS: Record<BrainError['code'], number> = { CONSENT_REQUIRED: 403, RATE_LIMITED: 429, INVALID_INPUT: 400, INVALID_OUTPUT: 502, TIMEOUT: 504, UNAVAILABLE: 503, OFFLINE: 503, CANCELLED: 503 };

type Standing = { privateMode: boolean; grants: ConsentGrant[]; used: Record<Tier, { day: number; month: number }>; spentMicros: number };

/** The person's synced settings and their ledger, read in one transaction as that person (row-level security on). */
async function standing(db: Db, userId: string, now: number): Promise<Standing> {
  return db.withUser(userId, async tx => {
    const [settings] = await tx.select({ private_mode: prefs.private_mode, fields: prefs.fields }).from(prefs).where(isNull(prefs.deleted_at)).orderBy(desc(prefs.updated_at)).limit(1);
    const dayAgo = new Date(now - DAY).toISOString();
    const rows = await tx.select({
      tier: aiUsage.tier,
      day: sql<number>`count(*) filter (where ${aiUsage.at} >= ${dayAgo}::timestamptz)::int`,
      month: sql<number>`count(*)::int`,
      cost: sql<string>`coalesce(sum(${aiUsage.cost_micros}), 0)::text`,
    }).from(aiUsage).where(gte(aiUsage.at, new Date(now - MONTH))).groupBy(aiUsage.tier);
    const used = Object.fromEntries(TIERS.map(t => [t, { day: 0, month: 0 }])) as Standing['used'];
    let spentMicros = 0;
    for (const row of rows) {
      if ((TIERS as readonly string[]).includes(row.tier)) used[row.tier as Tier] = { day: Number(row.day), month: Number(row.month) };
      spentMicros += Number(row.cost);
    }
    const ledger = (settings?.fields as { aiConsent?: { policyVersion?: unknown; grants?: unknown } } | null)?.aiConsent;
    const grants = ledger && Array.isArray(ledger.grants)
      ? activeGrants({ version: 1, policyVersion: typeof ledger.policyVersion === 'number' ? ledger.policyVersion : CONSENT_POLICY_VERSION, grants: ledger.grants as ConsentGrant[] }, now)
      : [];
    return { privateMode: settings?.private_mode === true, grants, used, spentMicros };
  });
}

const left = (allowances: Allowances, used: Standing['used']): RouteLimits =>
  Object.fromEntries(TIERS.map(t => [t, Math.max(0, allowances[t].calls - used[t][allowances[t].per])])) as RouteLimits;

type Billed = { spec: ModelSpec; usage: Usage; outcome: 'ok' | 'rejected' | 'declined' };

/** POST /ai/run */
export async function runAi(db: Db, userId: string, raw: unknown, ai: AiOptions | undefined, now: number, signal?: AbortSignal): Promise<AiReply> {
  // 1. Support first, before validation, the database or any model, so a long or malformed message in distress still
  //    gets it. Only the level and kinds go back; the phone shows its own words and numbers.
  const text = raw && typeof raw === 'object' && typeof (raw as { text?: unknown }).text === 'string' ? (raw as { text: string }).text : '';
  const crisis = detectCrisis(text);
  if (crisis) return { status: 200, body: { support: { level: crisis.level, kinds: crisis.kinds } } };
  const parsed = RequestBody.safeParse(raw);
  if (!parsed.success) return refuse(400, 'BAD_REQUEST');
  const request: BrainRequest = { ...parsed.data, grants: [] };
  // A photo only for a job that reads one, one at a time, small (the brain's own rule, checked here as well).
  try { assertRequest(request); } catch (error) { return failed(error); }
  // 2. Private mode never leaves the phone: if it got here, nothing runs.
  if (request.privateMode) return refuse(409, 'PRIVATE_MODE', 'Private mode is on, so this stays on your phone. Nothing was sent to a model.');
  if (!ai?.models.length) return refuse(503, 'AI_NOT_CONFIGURED', 'No model is connected for this question yet. Your message is saved, but I won’t invent a reply.');
  const me = await standing(db, userId, now);
  if (me.privateMode) return refuse(409, 'PRIVATE_MODE', 'Private mode is on, so this stays on your phone. Nothing was sent to a model.');
  const allowances = ai.allowances ?? DEFAULT_ALLOWANCES;
  if (me.spentMicros >= allowances.costMicrosPerMonth) return refuse(429, 'RATE_LIMITED', 'You’ve reached this month’s AI limit. Your message is saved, and saved facts and calculations still work.');
  const table = ai.table ?? loadTierTable();
  const route = { table, remaining: left(allowances, me.used) };
  // 3. Standing consent only from the person's own synced settings.
  const sent: BrainRequest = { ...request, grants: me.grants };
  let plan;
  try { plan = planRoute(sent, route); } catch (error) { return failed(error); }

  const billed: Billed[] = [];
  const adapters: ModelAdapter[] = ai.models.map(model => ({
    id: model.spec.id,
    location: 'cloud',
    jobs: jobsFor(model.spec),
    tiers: model.spec.tiers,
    available: async () => true,
    generate: async (req, abort) => {
      const reply = await model.call(req, abort);
      if (reply.usage.inputTokens + reply.usage.outputTokens > 0) billed.push({ spec: model.spec, usage: reply.usage, outcome: reply.failure ? (reply.failure.code === 'INVALID_OUTPUT' ? 'rejected' : 'declined') : 'ok' });
      if (reply.failure) throw reply.failure;
      return reply.output;
    },
  }));
  try {
    const result = await runBrain(sent, adapters, signal, { route, now: () => now, timeoutMs: ai.timeoutMs, rules: false });
    if (result.safety) return { status: 200, body: { support: { level: result.safety.level, kinds: result.safety.kinds } } };
    const body = { ...result.output, ...(plan.notice ? { notice: plan.notice } : {}) };
    return { status: 200, body, headers: { 'life-model': result.route.model, 'life-tier': result.route.tier } };
  } catch (error) {
    // The answer that failed life's checks was the last one billed.
    const last = billed.at(-1);
    if (error instanceof BrainError && error.code === 'INVALID_OUTPUT' && last?.outcome === 'ok') last.outcome = 'rejected';
    return failed(error);
  } finally {
    if (billed.length) await record(db, userId, sent.job, plan.tier, billed, now).catch(error => console.error('ai ledger write failed', error instanceof Error ? error.message : error));
  }
}

function failed(error: unknown): AiReply {
  if (error instanceof BrainError) return refuse(STATUS[error.code], error.code, error.message);
  throw error;
}

function record(db: Db, userId: string, job: Job, tier: Tier, billed: Billed[], now: number) {
  const at = new Date(now);
  return db.withUser(userId, tx => tx.insert(aiUsage).values(billed.map(b => ({
    id: crypto.randomUUID(), user_id: userId, job, model: b.spec.id, location: 'cloud', tier, outcome: b.outcome,
    input_tokens: b.usage.inputTokens, output_tokens: b.usage.outputTokens, cost_micros: costMicros(b.spec, b.usage), at,
  }))));
}

/** GET /ai/capabilities: which tiers have a model, which job sits in which tier, and what this person has left. */
export async function aiCapabilities(db: Db, userId: string, ai: AiOptions | undefined, now: number) {
  const table = ai?.table ?? loadTierTable();
  const models = ai?.models ?? [];
  const allowances = ai?.allowances ?? DEFAULT_ALLOWANCES;
  const tiers = Object.fromEntries(TIERS.map(tier => {
    const served = models.filter(m => m.spec.tiers.includes(tier)).map(m => m.spec.id);
    const order = table.tiers[tier] ?? [];
    const ids = [...order.filter(m => served.includes(m)), ...served.filter(m => !order.includes(m))];
    return [tier, { available: ids.length > 0, models: ids }];
  }));
  const me = await standing(db, userId, now);
  const remaining = left(allowances, me.used);
  const allowance = Object.fromEntries(TIERS.map(t => [t, { left: remaining[t] ?? 0, per: allowances[t].per }]));
  return { tiers, jobs: { ...BASE_TIERS, ...table.jobs }, allowance, table: { source: table.source, updated: table.updated } };
}
