import type { BrainError, Job, Request, Tier } from '../../../../packages/brain/src/index.ts';

/**
 * One cloud model as the life API sees it (BUILD_V26 Phase 24). The brain's runtime only knows `ModelAdapter`;
 * `router.ts` wraps each of these in one, so it can write the cost of every call to the ledger.
 */
export type Provider = 'anthropic' | 'openai' | 'google';
export type Effort = 'low' | 'medium' | 'high';
export type Usage = { inputTokens: number; outputTokens: number };

export type ModelSpec = {
  /** life's name for the model, as tiers.json lists it. */
  id: string;
  provider: Provider;
  /** The provider's own model name. */
  model: string;
  label: string;
  /** The tiers it may serve. */
  tiers: Tier[];
  /** Reads photos (meal photos, scanned letters). Photos reach the API in Phase 25. */
  vision: boolean;
  /** US dollars per million tokens, at the provider's list price for prompts under 100,000 tokens. */
  price: { input: number; output: number };
  /** How hard the model thinks before answering, where the provider has a setting for it. */
  effort?: Effort;
  maxOutputTokens: number;
  /** False until the provider's model name has been checked against a live call (the eval run does that). */
  confirmed: boolean;
  note?: string;
};

/**
 * `failure` is set when the provider answered but the answer can't be used (a refusal, cut-off or garbled JSON), or
 * didn't answer at all. `usage` is still reported, because a refused or garbled answer is billed too.
 */
export type ModelReply = { output?: unknown; usage: Usage; failure?: BrainError };

export interface ProviderModel {
  spec: ModelSpec;
  call(request: Request, signal: AbortSignal): Promise<ModelReply>;
}

export type Fetch = (input: string, init?: RequestInit) => Promise<Response>;
export type ProviderOptions = { apiKey: string; fetch?: Fetch; baseUrl?: string };

/** Every job that needs only words. `food` needs a photo, so only vision models take it. */
export const TEXT_JOBS: Job[] = ['ask', 'extract', 'draft', 'lesson', 'analyse', 'showMe', 'coach', 'plan-explain', 'read-document', 'remember'];
export const jobsFor = (spec: ModelSpec): Job[] => (spec.vision ? [...TEXT_JOBS, 'food'] : TEXT_JOBS);

/** Millionths of a dollar: tokens times the price per million tokens, exactly. */
export const costMicros = (spec: Pick<ModelSpec, 'price'>, usage: Usage): number => Math.round(usage.inputTokens * spec.price.input + usage.outputTokens * spec.price.output);
