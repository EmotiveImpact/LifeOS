import type { Memory, Sensitivity, Source } from './types.ts';

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

/*
 * life's own memory layer (BUILD_V26 Phase 25; the owner chose to own it rather than run mem0). A memory is a short
 * sentence about the person that no record holds, with a kind, a source, how sure life is, the dates it was true,
 * when it last helped and a vector. The same code runs on the phone (offline and in private mode) and on the life
 * API, so a memory gets the same vector wherever it is made.
 *
 * The vector comes from `embed`, a hashed bag of words with light stemming. It needs no model and no download, and
 * it is the stand-in until the owner picks the small open embedding model (MASTER_PLAN §3.3b). Vectors carry the
 * embedder's name, so changing it later re-embeds instead of comparing unlike vectors.
 */
export type MemoryKind = 'preference' | 'goal' | 'person' | 'pattern' | 'event' | 'fact';
export const MEMORY_KINDS: readonly MemoryKind[] = ['preference', 'goal', 'person', 'pattern', 'event', 'fact'];
/** A memory as it is kept. `validTo` set means it is no longer true: closed memories stay, so life can still say
 * "you used to…", but they are never used to answer. A deleted memory is gone, not closed. */
export type StoredMemory = Memory & { kind?: MemoryKind; confidence?: number; validFrom?: string; validTo?: string; lastUsed?: string; uses?: number; vector?: MemoryVector };
export type MemoryVector = { model: string; values: number[] };
export const EMBEDDER = 'life-lexical-1';
const DIMENSIONS = 256;

const stem = (word: string) => word.length > 5 && word.endsWith('ing') ? word.slice(0, -3) : word.length > 4 && word.endsWith('ies') ? `${word.slice(0, -3)}y` : word.length > 3 && word.endsWith('s') && !word.endsWith('ss') ? word.slice(0, -1) : word;
function hash(token: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < token.length; i++) { h ^= token.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
}
/** The vector for a sentence: words and word pairs hashed into 256 signed buckets, scaled to length one. */
export function embed(text: string): MemoryVector {
  const values = new Array<number>(DIMENSIONS).fill(0);
  const words = terms(text).map(stem);
  const add = (token: string, weight: number) => { const h = hash(token); values[h % DIMENSIONS] += (h >>> 16) & 1 ? weight : -weight; };
  words.forEach(word => add(word, 1));
  for (let i = 1; i < words.length; i++) add(`${words[i - 1]} ${words[i]}`, 0.5);
  const length = Math.hypot(...values);
  return { model: EMBEDDER, values: length ? values.map(v => v / length) : values };
}
export const cosine = (a: MemoryVector, b: MemoryVector) => a.model !== b.model || a.values.length !== b.values.length ? 0 : a.values.reduce((sum, v, i) => sum + v * b.values[i], 0);
const vectorOf = (memory: StoredMemory) => memory.vector?.model === EMBEDDER && memory.vector.values.length === DIMENSIONS ? memory.vector : embed(memory.text);
export const isOpen = (memory: StoredMemory, now: number) => !memory.validTo || Date.parse(memory.validTo) > now;

export type RankOptions = { now?: number; limit?: number; min?: number };
/**
 * The memories that fit a question, best first: how close the meaning is (most of the score), how recently the
 * memory was made or used (fading over about six months) and how often it has helped. Closed memories never come
 * back. The caller passes one person's memories only, which is the whole of "one space per user".
 */
export function rankMemories<T extends StoredMemory>(query: string, memories: T[], options: RankOptions = {}): T[] {
  const now = options.now ?? Date.now(), q = embed(query);
  if (!q.values.some(Boolean)) return [];
  const day = 86_400_000;
  return memories.map((memory, order) => {
    const meaning = cosine(q, vectorOf(memory));
    const at = Date.parse(memory.lastUsed ?? memory.validFrom ?? '');
    const recency = Number.isFinite(at) ? Math.exp(-Math.max(0, now - at) / (180 * day)) : 0.5;
    const use = Math.min(1, (memory.uses ?? 0) / 10);
    return { memory, meaning, score: 0.75 * meaning + 0.15 * recency + 0.1 * use, order };
  }).filter(row => isOpen(row.memory, now) && row.meaning >= (options.min ?? 0.2))
    .sort((a, b) => b.score - a.score || a.order - b.order).slice(0, Math.max(0, options.limit ?? 6)).map(row => row.memory);
}

/** Something worth remembering, from a confirmed filing or the `remember` job. `replaces` names a memory it makes
 * untrue ("I left the council" closes "works at the council"). `id` is used for a new memory when it is free. */
export type MemoryCandidate = { text: string; kind: MemoryKind; source: Source; recordId?: string; sensitivity?: Sensitivity; confidence?: number; replaces?: string; id?: string };
export type MemoryChange =
  | { op: 'add'; memory: StoredMemory }
  | { op: 'merge'; id: string; memory: StoredMemory }
  | { op: 'close'; id: string; validTo: string }
  | { op: 'ignore'; text: string; reason: 'duplicate' | 'unusable' };
export type PlanOptions = { now?: number; newId: () => string };
const same = (a: string, b: string) => a.toLocaleLowerCase('en-GB').replace(/[^\p{L}\p{N}]+/gu, ' ').trim() === b.toLocaleLowerCase('en-GB').replace(/[^\p{L}\p{N}]+/gu, ' ').trim();

/**
 * The memory loop's decision for each candidate, mem0-style but our own: add it, merge it into the memory it
 * restates, close the memory it makes untrue, or ignore it as already known. Candidates are applied in order, so two
 * in one batch see each other. Nothing here writes: the caller applies the changes.
 */
export function planMemoryChanges(candidates: MemoryCandidate[], existing: StoredMemory[], options: PlanOptions): MemoryChange[] {
  const now = options.now ?? Date.now(), at = new Date(now).toISOString();
  const working = existing.map(m => ({ ...m }));
  const changes: MemoryChange[] = [];
  const close = (memory: StoredMemory) => { memory.validTo = at; changes.push({ op: 'close', id: memory.id, validTo: at }); };
  for (const candidate of candidates) {
    const text = candidate.text.replace(/\s+/g, ' ').trim();
    if (!text || text.length > 300 || !MEMORY_KINDS.includes(candidate.kind)) { changes.push({ op: 'ignore', text, reason: 'unusable' }); continue; }
    const vector = embed(text);
    const fresh: StoredMemory = { id: candidate.id && !working.some(m => m.id === candidate.id) ? candidate.id : options.newId(), text, kind: candidate.kind, source: candidate.source, ...(candidate.recordId ? { recordId: candidate.recordId } : {}), ...(candidate.sensitivity ? { sensitivity: candidate.sensitivity } : {}), confidence: candidate.confidence ?? 1, validFrom: at, uses: 0, vector };
    const live = working.filter(m => isOpen(m, now));
    const replaced = candidate.replaces ? live.find(m => m.id === candidate.replaces) : undefined;
    const sameRecord = candidate.recordId ? live.find(m => m.recordId === candidate.recordId) : undefined;
    const prior = replaced ?? sameRecord;
    if (prior) {
      if (same(prior.text, text)) { changes.push({ op: 'ignore', text, reason: 'duplicate' }); continue; }
      // A changed fact closes the old memory and starts a new one, so the history stays true.
      close(prior); working.push(fresh); changes.push({ op: 'add', memory: fresh }); continue;
    }
    const nearest = live.filter(m => !m.recordId && (m.sensitivity ?? 'other') === (candidate.sensitivity ?? 'other')).map(m => ({ m, closeness: cosine(vector, vectorOf(m)) })).sort((a, b) => b.closeness - a.closeness)[0];
    if (nearest && (nearest.closeness >= 0.9 || same(nearest.m.text, text))) { changes.push({ op: 'ignore', text, reason: 'duplicate' }); continue; }
    if (nearest && nearest.closeness >= 0.7 && nearest.m.kind === candidate.kind) {
      // The same thing said a new way: keep the memory, take the newer wording.
      const merged: StoredMemory = { ...nearest.m, text, source: candidate.source, confidence: Math.max(nearest.m.confidence ?? 0, candidate.confidence ?? 1), vector };
      Object.assign(nearest.m, merged); changes.push({ op: 'merge', id: merged.id, memory: merged }); continue;
    }
    working.push(fresh); changes.push({ op: 'add', memory: fresh });
  }
  return changes;
}
/** Applies planned changes to a list of memories. */
export function applyMemoryChanges<T extends { id: string; validTo?: string }>(memories: T[], changes: MemoryChange[], adopt: (memory: StoredMemory, prior?: T) => T): T[] {
  let next = [...memories];
  for (const change of changes) {
    if (change.op === 'add') next.push(adopt(change.memory));
    if (change.op === 'merge') next = next.map(m => m.id === change.id ? adopt(change.memory, m) : m);
    if (change.op === 'close') next = next.map(m => m.id === change.id ? { ...m, validTo: change.validTo } : m);
  }
  return next;
}
