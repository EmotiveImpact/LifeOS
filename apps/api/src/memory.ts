import { isNull } from 'drizzle-orm';
import { z } from 'zod';
import { MEMORY_KINDS, isOpen, rankMemories, type MemoryKind, type StoredMemory } from '../../../packages/brain/src/index.ts';
import type { Db } from './db/client';
import { memory } from './db/schema';

/**
 * "What life remembers", the server's half (BUILD_V26 Phase 25). Memories reach the server through sync, like every
 * other phone table: the phone is where a person reads, corrects and forgets them, and a forget syncs as a delete
 * that wipes the server's copy (sync.ts). Here the API lists a person's memories and finds the ones that fit a
 * question, ranked by the same code the phone uses (packages/brain/src/memory.ts).
 *
 * One space per person: every read runs inside `withUser`, so row-level security limits it to the caller's rows.
 * Health memories are only here at all if the person turned on "Sync health memories".
 *
 * Ranking runs in TypeScript over the person's memories, which is fine for the hundreds a person keeps. A pgvector
 * column and index can take over once the embedding model is chosen (see NOTES, Phase 25).
 */
export const SearchBody = z.object({ query: z.string().trim().min(1).max(2000), limit: z.number().int().min(1).max(20).optional(), includeHealth: z.boolean().optional() });
export type MemoryView = { id: string; text: string; kind?: MemoryKind; source: string; recordId?: string; sensitivity?: 'health' | 'money' | 'other'; validFrom?: string; validTo?: string; lastUsed?: string; uses?: number };

const obj = (v: unknown): Record<string, unknown> => v && typeof v === 'object' && !Array.isArray(v) ? v as Record<string, unknown> : {};
const str = (v: unknown) => typeof v === 'string' && v ? v : undefined;
/** A synced memory row in the brain's shape. The phone keeps a memory's attributes in its `source` column. */
type Kept = StoredMemory & { label: string };
export function fromRow(row: { id: string; text: string | null; embedding: unknown; source: unknown; last_used: string | null }): Kept | null {
  if (!row.text) return null;
  const s = obj(row.source), e = obj(row.embedding);
  const health = s.health === true || s.sensitivity === 'health' || s.category === 'Body' || s.area === 'health';
  const sensitivity = health ? 'health' as const : s.sensitivity === 'money' || s.category === 'Money' ? 'money' as const : undefined;
  return {
    id: row.id, text: row.text, label: str(s.label) ?? 'life', source: { id: `memory:${row.id}`, kind: 'memory', label: str(s.label) ?? 'life' },
    ...(str(s.recordId) ? { recordId: str(s.recordId) } : {}), ...(sensitivity ? { sensitivity } : {}),
    ...(MEMORY_KINDS.includes(s.kind as MemoryKind) ? { kind: s.kind as MemoryKind } : {}),
    ...(typeof s.confidence === 'number' ? { confidence: s.confidence } : {}), ...(str(s.validFrom) ? { validFrom: str(s.validFrom) } : {}), ...(str(s.validTo) ? { validTo: str(s.validTo) } : {}),
    ...(str(row.last_used) ?? str(s.lastUsed) ? { lastUsed: str(row.last_used) ?? str(s.lastUsed) } : {}), ...(typeof s.uses === 'number' ? { uses: s.uses } : {}),
    ...(typeof e.model === 'string' && Array.isArray(e.values) && e.values.every(v => typeof v === 'number') ? { vector: { model: e.model, values: e.values as number[] } } : {}),
  };
}
const view = (m: Kept): MemoryView => ({
  id: m.id, text: m.text, source: m.label, ...(m.kind ? { kind: m.kind } : {}), ...(m.recordId ? { recordId: m.recordId } : {}), ...(m.sensitivity ? { sensitivity: m.sensitivity } : {}),
  ...(m.validFrom ? { validFrom: m.validFrom } : {}), ...(m.validTo ? { validTo: m.validTo } : {}), ...(m.lastUsed ? { lastUsed: m.lastUsed } : {}), ...(m.uses ? { uses: m.uses } : {}),
});

/** This person's memories that haven't been forgotten. Closed ones are listed too, marked by `validTo`. */
async function live(db: Db, userId: string) {
  const rows = await db.withUser(userId, tx => tx.select({ id: memory.id, text: memory.text, embedding: memory.embedding, source: memory.source, last_used: memory.last_used }).from(memory).where(isNull(memory.deleted_at)));
  return rows.map(fromRow).filter((m): m is Kept => m !== null);
}
export async function listMemories(db: Db, userId: string): Promise<{ memories: MemoryView[] }> {
  return { memories: (await live(db, userId)).map(view) };
}
/** The memories that fit a question, best first. Closed and forgotten memories never come back, and health
 * memories only when the caller asks for them (it then needs the person's OK to send them to a model). */
export async function searchMemories(db: Db, userId: string, body: z.infer<typeof SearchBody>, now: number): Promise<{ memories: MemoryView[] }> {
  const mine = (await live(db, userId)).filter(m => isOpen(m, now) && (body.includeHealth || m.sensitivity !== 'health'));
  return { memories: rankMemories(body.query, mine, { now, limit: body.limit ?? 6 }).map(view) };
}
