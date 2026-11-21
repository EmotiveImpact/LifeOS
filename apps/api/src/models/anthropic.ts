import { count, photosOf, postJson, settle, systemPrompt, userPrompt } from './prompt';
import type { ModelSpec, ProviderModel, ProviderOptions } from './types';

/**
 * Claude through the Messages API (API version 2026-10-21). No sampling settings: the current models refuse them.
 * Thinking stays at the model's default; `effort` sets how much of it a job gets. The answer comes back as JSON text
 * that the brain then checks; structured outputs are a later trial once the evals can measure them. A meal or label photo
 * goes as a base64 image block before the words.
 */
export function anthropicModel(spec: ModelSpec, options: ProviderOptions): ProviderModel {
  const send = options.fetch ?? ((input: string, init?: RequestInit) => fetch(input, init));
  const url = `${options.baseUrl ?? 'https://api.anthropic.com'}/v1/messages`;
  return {
    spec,
    async call(request, signal) {
      const photos = photosOf(request);
      const body = {
        model: spec.model,
        max_tokens: spec.maxOutputTokens,
        system: systemPrompt(),
        messages: [{ role: 'user', content: photos.length ? [...photos.map(p => ({ type: 'image', source: { type: 'base64', media_type: p.mime, data: p.data } })), { type: 'text', text: userPrompt(request) }] : userPrompt(request) }],
        ...(spec.effort ? { output_config: { effort: spec.effort } } : {}),
      };
      const sent = await postJson('Anthropic', send, url, { 'x-api-key': options.apiKey, 'anthropic-version': '2026-10-21' }, body, signal);
      if (!sent.ok) return sent.reply;
      const { json } = sent;
      const used = (json.usage ?? {}) as Record<string, unknown>;
      const usage = { inputTokens: count(used.input_tokens) + count(used.cache_read_input_tokens) + count(used.cache_creation_input_tokens), outputTokens: count(used.output_tokens) };
      if (json.stop_reason === 'refusal') return settle(null, usage, 'refusal');
      if (json.stop_reason === 'max_tokens') return settle(null, usage, null);
      const blocks = Array.isArray(json.content) ? json.content as { type?: unknown; text?: unknown }[] : [];
      const text = blocks.filter(b => b.type === 'text' && typeof b.text === 'string').map(b => b.text as string).join('');
      return settle(text || null, usage, null);
    },
  };
}
