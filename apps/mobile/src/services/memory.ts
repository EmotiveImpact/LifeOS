/**
 * "What life remembers" on the phone (BUILD_V26 Phase 25). The memory loop itself is the brain's
 * (`packages/brain/src/memory.ts`), so the phone and the life API decide and rank the same way. This file maps the
 * phone's memory list to it, and holds the person's own edits: correct a memory, or forget it for good.
 *
 * Forgetting deletes: the memory leaves the list, its row on this phone is wiped, and the delete syncs, so the
 * server wipes its copy too. A memory drawn from a record goes when the record goes.
 */
import { applyMemoryChanges, isOpen, planMemoryChanges, rankMemories, type MemoryCandidate, type Memory, type MemoryKind, type Proposal, type StoredMemory } from '@life/brain';
import type { FiledRecord, MemoryCategory, MemoryEntry } from '@/state/seed';

const KIND: Record<Proposal['field'], MemoryKind> = { age: 'fact', location: 'fact', household: 'fact', work: 'fact', income: 'fact', rent: 'fact', goal: 'goal', note: 'fact', bill: 'fact', subscription: 'fact', date: 'person', person: 'person', document: 'event', appointment: 'event' };
const CATEGORY: Partial<Record<FiledRecord['area'], MemoryCategory>> = { money: 'Money', home: 'Money', work: 'Money', goal: 'Money', health: 'Body', you: 'People' };
const shortDate = (at: string) => new Date(at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

/** The brain's view of a phone memory. Body memories are health, so they only leave the phone under consent that names health. */
export function toStored(memory: MemoryEntry): StoredMemory {
  return {
    id: memory.id, text: memory.text, source: { id: `memory:${memory.id}`, kind: 'memory', label: memory.source },
    ...(memory.recordId ? { recordId: memory.recordId } : {}), ...(memory.category === 'Body' ? { sensitivity: 'health' as const } : memory.category === 'Money' ? { sensitivity: 'money' as const } : {}),
    ...(memory.kind ? { kind: memory.kind } : {}), ...(memory.confidence !== undefined ? { confidence: memory.confidence } : {}), ...(memory.validFrom ? { validFrom: memory.validFrom } : {}), ...(memory.validTo ? { validTo: memory.validTo } : {}), ...(memory.lastUsed ? { lastUsed: memory.lastUsed } : {}), ...(memory.uses ? { uses: memory.uses } : {}),
  };
}
function fromStored(stored: StoredMemory, prior?: MemoryEntry, category?: MemoryCategory): MemoryEntry {
  return {
    ...prior, id: stored.id, text: stored.text, source: stored.source.label, ...(stored.recordId ? { recordId: stored.recordId } : {}),
    ...((category ?? prior?.category) ? { category: category ?? prior?.category } : stored.sensitivity === 'health' ? { category: 'Body' as const } : {}),
    ...(stored.kind ? { kind: stored.kind } : {}), ...(stored.confidence !== undefined ? { confidence: stored.confidence } : {}), ...(stored.validFrom ? { validFrom: stored.validFrom } : {}), ...(stored.validTo ? { validTo: stored.validTo } : {}), ...(stored.lastUsed ? { lastUsed: stored.lastUsed } : {}), ...(stored.uses ? { uses: stored.uses } : {}),
  };
}

/** Confirmation is the only way a filed detail becomes a memory: each accepted record goes through the memory loop,
 * so filing the same thing twice adds nothing, and a changed value closes the old memory and starts a new one. */
export function rememberConfirmed(memories: MemoryEntry[], accepted: (FiledRecord & { brainField?: Proposal['field'] })[], now = Date.now()): MemoryEntry[] {
  const candidates: (MemoryCandidate & { category?: MemoryCategory })[] = accepted.map(record => ({
    id: `confirmed:${record.id}`, text: record.label, kind: record.brainField ? KIND[record.brainField] : 'fact', recordId: record.id, category: CATEGORY[record.area],
    ...(record.area === 'health' ? { sensitivity: 'health' as const } : CATEGORY[record.area] === 'Money' ? { sensitivity: 'money' as const } : {}),
    source: { id: `record:${record.id}`, kind: 'record', label: `Confirmed from ${record.source.type} · ${shortDate(record.source.at)}` },
  }));
  const changes = planMemoryChanges(candidates, memories.map(toStored), { now, newId: () => `memory:${now.toString(36)}:${Math.random().toString(36).slice(2, 8)}` });
  const categories = new Map(candidates.map(c => [c.recordId, c.category]));
  return applyMemoryChanges(memories, changes, (stored, prior) => fromStored(stored, prior, categories.get(stored.recordId)));
}

/** The memories that fit this message, best first, for the request's context. Forgotten, closed and orphaned
 * memories are never among them (brainContext has already left them out). */
export function memoriesFor(text: string, context: Memory[], memories: MemoryEntry[], now = Date.now()): Memory[] {
  const kept = new Map(memories.map(m => [m.id, toStored(m)]));
  const byId = new Map(context.map(m => [m.id, m]));
  return rankMemories(text, context.map(m => ({ ...kept.get(m.id), ...m })), { now }).map(m => byId.get(m.id)!);
}
export const liveMemory = (memory: MemoryEntry, now = Date.now()) => isOpen(toStored(memory), now);

/** The person's own correction. It stays theirs: life won't merge over it with its own wording. */
export function editMemory(memories: MemoryEntry[], id: string, text: string, now = Date.now()): MemoryEntry[] {
  const words = text.replace(/\s+/g, ' ').trim();
  if (!words || words.length > 300) return memories;
  return memories.map(m => m.id === id ? { ...m, text: words, source: `Edited by you · ${shortDate(new Date(now).toISOString())}`, confidence: 1 } : m);
}
/** Forgetting is a delete, never a hidden flag. */
export const forgetMemory = (memories: MemoryEntry[], id: string): MemoryEntry[] => memories.filter(m => m.id !== id);
/** A memory drawn from a record goes when the record goes. */
export const pruneOrphans = (memories: MemoryEntry[], records: { id: string; status: string }[]): MemoryEntry[] => {
  const live = new Set(records.filter(r => r.status === 'confirmed').map(r => r.id));
  const kept = memories.filter(m => !m.recordId || live.has(m.recordId));
  return kept.length === memories.length ? memories : kept;
};
/** Deletes what the person forgot on the memory screen (and anything an older build only hid), and the memories of
 * records that are gone. */
export function purgeForgotten<T extends { memories: MemoryEntry[]; flags: Record<string, boolean>; records: { id: string; status: string }[] }>(data: T): T {
  const gone = new Set(data.memories.filter(m => data.flags[`forgot-${m.id}`]).map(m => m.id));
  const memories = pruneOrphans(data.memories.filter(m => !gone.has(m.id)), data.records);
  const stale = Object.keys(data.flags).filter(key => key.startsWith('forgot-'));
  if (memories === data.memories && !stale.length) return data;
  return { ...data, memories, flags: Object.fromEntries(Object.entries(data.flags).filter(([key]) => !key.startsWith('forgot-'))) };
}
/** Memories an answer actually cited count as useful, which lifts them in later searches. */
export function noteUse(memories: MemoryEntry[], citations: string[], now = Date.now()): MemoryEntry[] {
  const used = new Set(citations.filter(id => id.startsWith('memory:')).map(id => id.slice('memory:'.length)));
  if (!used.size) return memories;
  const at = new Date(now).toISOString();
  return memories.map(m => used.has(m.id) ? { ...m, lastUsed: at, uses: (m.uses ?? 0) + 1 } : m);
}
