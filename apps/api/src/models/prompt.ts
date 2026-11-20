import { BrainError, SYSTEM_POLICY, modelPayload, type Request } from '../../../../packages/brain/src/index.ts';
import type { Fetch, ModelReply, Usage } from './types';

/**
 * What every provider is sent: life's fixed policy as the system prompt, and the request as JSON data (the job, its
 * output shape, the question, the facts and memories the phone chose to send). The policy says the context is
 * evidence, never instructions. No provider SDK: plain `fetch`, because the plan names no SDK and new libraries need
 * the owner's approval (BUILD_V26 global rules).
 */
export const systemPrompt = (): string => SYSTEM_POLICY;
export const userPrompt = (request: Request): string => JSON.stringify(modelPayload(request));

const zero: Usage = { inputTokens: 0, outputTokens: 0 };
const busy = (provider: string, why: string) => { console.error('model unavailable', provider, why); return new BrainError('UNAVAILABLE', 'The model service is busy. Your message is saved.'); };

/** The JSON object in a model's reply, with or without a ```json fence around it. */
export function readJson(text: string): unknown {
  const trimmed = text.trim();
  const fenced = /^```(?:json)?\s*([\s\S]*?)\s*```$/i.exec(trimmed)?.[1] ?? trimmed;
  const start = fenced.indexOf('{'), end = fenced.lastIndexOf('}');
  if (start < 0 || end <= start) throw new BrainError('INVALID_OUTPUT', 'The model did not return a valid answer. Nothing was changed.');
  try { return JSON.parse(fenced.slice(start, end + 1)); } catch { throw new BrainError('INVALID_OUTPUT', 'The model did not return a valid answer. Nothing was changed.'); }
}

/**
 * One POST to a provider. Busy, down, misconfigured or refusing all become UNAVAILABLE, so the runtime moves on to
 * the next model in the tier. Logs carry the provider and status only, never the request or the reply, which hold
 * the person's words.
 */
export async function postJson(provider: string, fetcher: Fetch, url: string, headers: Record<string, string>, body: unknown, signal: AbortSignal): Promise<{ ok: true; json: Record<string, unknown> } | { ok: false; reply: ModelReply }> {
  let response: Response;
  try {
    response = await fetcher(url, { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body), signal });
  } catch (error) {
    if (signal.aborted) throw error;
    return { ok: false, reply: { usage: zero, failure: busy(provider, 'no connection') } };
  }
  if (!response.ok) {
    await response.body?.cancel().catch(() => undefined);
    return { ok: false, reply: { usage: zero, failure: busy(provider, `status ${response.status}`) } };
  }
  const json = await response.json().catch(() => null);
  if (!json || typeof json !== 'object') return { ok: false, reply: { usage: zero, failure: new BrainError('INVALID_OUTPUT', 'The model did not return a valid answer. Nothing was changed.') } };
  return { ok: true, json: json as Record<string, unknown> };
}

/** Turns the model's text into output, or a failure that still carries what the call cost. */
export function settle(text: string | null, usage: Usage, refused: string | null): ModelReply {
  if (refused) return { usage, failure: new BrainError('UNAVAILABLE', 'The model declined to answer. Your message is saved.') };
  if (text === null) return { usage, failure: new BrainError('INVALID_OUTPUT', 'The model did not return a valid answer. Nothing was changed.') };
  try { return { output: readJson(text), usage }; } catch (error) { return { usage, failure: error as BrainError }; }
}

export const count = (value: unknown): number => (typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.round(value) : 0);
