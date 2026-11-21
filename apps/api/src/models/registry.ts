import { anthropicModel } from './anthropic';
import { googleModel } from './google';
import { openaiModel } from './openai';
import type { Fetch, ModelSpec, ProviderModel } from './types';

/**
 * The trial line-up the owner approved (20 Nov 2026, `ai-system/life-ai-system.md`): three providers per tier where
 * there is one, so evals choose on results and a price change is a tiers.json edit, not an app update. Prices are
 * list prices per million tokens. Anthropic's model names are confirmed; the OpenAI and Google names follow those
 * providers' naming and are confirmed by the first eval run with a key (`confirmed: false` until then).
 *
 * Left out: Meta Muse Ember (fast tier trial) needs Meta's API or Google Cloud and gets its adapter when that route
 * is chosen. Claude Fable 5.2 (30-day retention), GPT-6.2 Astra and Gemini 4 Carbon (price), open models (hosting).
 */
export const MODELS: readonly ModelSpec[] = [
  { id: 'claude-haiku-5-5', provider: 'anthropic', model: 'claude-haiku-5-5', label: 'Claude Haiku 5.5', tiers: ['fast', 'vision'], vision: true, price: { input: 0.1, output: 0.5 }, effort: 'low', maxOutputTokens: 4000, confirmed: true },
  { id: 'gpt-6-luna', provider: 'openai', model: 'gpt-6-luna', label: 'GPT-6 Luna', tiers: ['fast', 'vision'], vision: true, price: { input: 0.1, output: 0.5 }, effort: 'low', maxOutputTokens: 4000, confirmed: false },
  { id: 'claude-sonnet-5-5', provider: 'anthropic', model: 'claude-sonnet-5-5', label: 'Claude Sonnet 5.5', tiers: ['strong'], vision: true, price: { input: 2, output: 10 }, effort: 'medium', maxOutputTokens: 8000, confirmed: true },
  { id: 'gpt-6.2-sol', provider: 'openai', model: 'gpt-6.2-sol', label: 'GPT-6.2 Sol', tiers: ['strong'], vision: true, price: { input: 2, output: 10 }, effort: 'medium', maxOutputTokens: 8000, confirmed: false },
  { id: 'gemini-4-hydrogen', provider: 'google', model: 'gemini-4-hydrogen', label: 'Gemini 4 Hydrogen', tiers: ['strong'], vision: true, price: { input: 1.5, output: 7.5 }, maxOutputTokens: 8000, confirmed: false, note: 'Challenger for the strong tier.' },
  { id: 'claude-opus-5-5', provider: 'anthropic', model: 'claude-opus-5-5', label: 'Claude Opus 5.5', tiers: ['top'], vision: true, price: { input: 4, output: 20 }, effort: 'high', maxOutputTokens: 16000, confirmed: true },
  { id: 'gemini-4-neon', provider: 'google', model: 'gemini-4-neon', label: 'Gemini 4 Neon', tiers: ['top'], vision: true, price: { input: 3, output: 15 }, maxOutputTokens: 16000, confirmed: false, note: 'Challenger for the top tier. Real people’s data only through Google Cloud’s EU endpoint.' },
];

export type ModelKeys = { ANTHROPIC_API_KEY?: string; OPENAI_API_KEY?: string; GEMINI_API_KEY?: string };

/** The models this server has a key for. Keys live only in the server's environment; the phone never sees one. */
export function modelsFromEnv(env: ModelKeys, fetch?: Fetch): ProviderModel[] {
  return MODELS.flatMap(spec => {
    if (spec.provider === 'anthropic' && env.ANTHROPIC_API_KEY) return [anthropicModel(spec, { apiKey: env.ANTHROPIC_API_KEY, fetch })];
    if (spec.provider === 'openai' && env.OPENAI_API_KEY) return [openaiModel(spec, { apiKey: env.OPENAI_API_KEY, fetch })];
    if (spec.provider === 'google' && env.GEMINI_API_KEY) return [googleModel(spec, { apiKey: env.GEMINI_API_KEY, fetch })];
    return [];
  });
}
