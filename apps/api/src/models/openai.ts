import { count, postJson, settle, systemPrompt, userPrompt } from './prompt';
import type { ModelSpec, ProviderModel, ProviderOptions } from './types';

/**
 * OpenAI through the Responses API. `store: false` so OpenAI keeps no copy of the conversation for later turns;
 * JSON mode for the answer; reasoning effort per job. Output tokens include the reasoning tokens, as billed.
 */
export function openaiModel(spec: ModelSpec, options: ProviderOptions): ProviderModel {
  const send = options.fetch ?? ((input: string, init?: RequestInit) => fetch(input, init));
  const url = `${options.baseUrl ?? 'https://api.openai.com'}/v1/responses`;
  return {
    spec,
    async call(request, signal) {
      const body = {
        model: spec.model,
        instructions: systemPrompt(),
        input: [{ role: 'user', content: userPrompt(request) }],
        max_output_tokens: spec.maxOutputTokens,
        store: false,
        text: { format: { type: 'json_object' } },
        ...(spec.effort ? { reasoning: { effort: spec.effort } } : {}),
      };
      const sent = await postJson('OpenAI', send, url, { authorization: `Bearer ${options.apiKey}` }, body, signal);
      if (!sent.ok) return sent.reply;
      const { json } = sent;
      const used = (json.usage ?? {}) as Record<string, unknown>;
      const usage = { inputTokens: count(used.input_tokens), outputTokens: count(used.output_tokens) };
      const parts = (Array.isArray(json.output) ? json.output as { type?: unknown; content?: unknown }[] : [])
        .filter(item => item.type === 'message' && Array.isArray(item.content))
        .flatMap(item => item.content as { type?: unknown; text?: unknown; refusal?: unknown }[]);
      if (parts.some(p => p.type === 'refusal')) return settle(null, usage, 'refusal');
      if (json.status !== 'completed') return settle(null, usage, null);
      const text = parts.filter(p => p.type === 'output_text' && typeof p.text === 'string').map(p => p.text as string).join('');
      return settle(text || null, usage, null);
    },
  };
}
