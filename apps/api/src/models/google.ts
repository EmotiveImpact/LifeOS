import { count, photosOf, postJson, settle, systemPrompt, userPrompt } from './prompt';
import type { ModelSpec, ProviderModel, ProviderOptions } from './types';

const BLOCKED = new Set(['SAFETY', 'RECITATION', 'PROHIBITED_CONTENT', 'BLOCKLIST', 'SPII', 'LANGUAGE', 'OTHER']);

/**
 * Gemini through generateContent. The key goes in a header, never the URL, so it can't land in a log. Thinking
 * tokens are billed as output, so they count as output here. `baseUrl` points at Google Cloud's EU endpoint for
 * real people's data (owner decision); the Gemini API key is for trial data only.
 */
export function googleModel(spec: ModelSpec, options: ProviderOptions): ProviderModel {
  const send = options.fetch ?? ((input: string, init?: RequestInit) => fetch(input, init));
  const url = `${options.baseUrl ?? 'https://generativelanguage.googleapis.com'}/v1beta/models/${encodeURIComponent(spec.model)}:generateContent`;
  return {
    spec,
    async call(request, signal) {
      const body = {
        systemInstruction: { parts: [{ text: systemPrompt() }] },
        contents: [{ role: 'user', parts: [...photosOf(request).map(p => ({ inlineData: { mimeType: p.mime, data: p.data } })), { text: userPrompt(request) }] }],
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: spec.maxOutputTokens },
      };
      const sent = await postJson('Google', send, url, { 'x-goog-api-key': options.apiKey }, body, signal);
      if (!sent.ok) return sent.reply;
      const { json } = sent;
      const used = (json.usageMetadata ?? {}) as Record<string, unknown>;
      const usage = { inputTokens: count(used.promptTokenCount), outputTokens: count(used.candidatesTokenCount) + count(used.thoughtsTokenCount) };
      const blocked = (json.promptFeedback as { blockReason?: unknown } | undefined)?.blockReason;
      if (typeof blocked === 'string') return settle(null, usage, blocked.toLowerCase());
      const candidate = (Array.isArray(json.candidates) ? json.candidates[0] : undefined) as { finishReason?: unknown; content?: { parts?: unknown } } | undefined;
      const finish = typeof candidate?.finishReason === 'string' ? candidate.finishReason : 'STOP';
      if (BLOCKED.has(finish)) return settle(null, usage, finish.toLowerCase());
      if (finish !== 'STOP') return settle(null, usage, null);
      const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts as { text?: unknown; thought?: unknown }[] : [];
      const text = parts.filter(p => typeof p.text === 'string' && !p.thought).map(p => p.text as string).join('');
      return settle(text || null, usage, null);
    },
  };
}
