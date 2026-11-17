import type { Memory } from './types.ts';

const stop = new Set(['you', 'the', 'and', 'for', 'are', 'was', 'were', 'has', 'had', 'can', 'our', 'who', 'how', 'what', 'where', 'when', 'which', 'about', 'could', 'would', 'should', 'your', 'with', 'this', 'that', 'have', 'does', 'from', 'please', 'tell', 'remember']);
const home = new Set(['home', 'household', 'flatmate', 'flatmates', 'housemate', 'housemates', 'shares', 'adults']);
export function terms(text: string): string[] {
  const words = (text.toLocaleLowerCase('en-GB').match(/[\p{L}\p{N}]+/gu) ?? []).filter(word => word.length > 2 && !stop.has(word));
  if (words.some(word => home.has(word))) words.push('household-context');
  return [...new Set(words)];
}
export const isMemoryOverview = (query: string) => /^\s*(?:what (?:do you|does life) (?:remember|know about me)|(?:show )?my memor(?:y|ies))[?.!\s]*$/i.test(query);
/** Explicit lexical fallback with a small household synonym group; not
 * embeddings or a running mem0 service. Input is this user's live memory only. */
export function retrieveMemories(query: string, memories: Memory[], limit = 6): Memory[] {
  const words = terms(query);
  return memories.map((memory, order) => {
    const tokens = new Set(terms(memory.text));
    const score = words.reduce((sum, word) => sum + (tokens.has(word) ? 1 : 0), 0);
    return { memory, score, order };
  }).filter(row => row.score > 0).sort((a, b) => b.score - a.score || a.order - b.order).slice(0, Math.max(0, limit)).map(row => row.memory);
}
