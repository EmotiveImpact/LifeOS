import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { embed } from '../../packages/brain/src/index.ts';
import { createApi } from '../../apps/api/src/app';
import { eq } from '../../apps/api/src/db/kit';
import { memory, syncOps } from '../../apps/api/src/db/schema';
import { adminUrl, freshDatabase, makeUser } from './support';

/**
 * BUILD_V26 Phase 25: "What life remembers" on the server. Memories arrive by sync like every phone table; the API
 * lists them and finds the ones that fit a question, for one person only. A forgotten memory is wiped, not hidden.
 */
const base = 'http://life.test';
const NOW = Date.parse('2026-11-20T12:00:00.000Z');
const at = (minute: number) => new Date(Date.UTC(2026, 10, 20, 9, minute)).toISOString();
const uuid = () => crypto.randomUUID();
/** A memory row as the phone's projection writes it (apps/mobile/src/data/projection.ts). */
function remembered(rowId: string, minute: number, text: string, source: Record<string, unknown> = {}) {
  const payload = { id: rowId, user_id: 'local', created_at: at(0), updated_at: at(minute), deleted_at: null, text, source: { label: 'From your chat', ...source }, embedding: embed(text), last_used: null };
  return { id: uuid(), user_id: 'local', table: 'memory', rowId, op: 'upsert', payload, at: at(minute) };
}
function forgotten(rowId: string, minute: number) {
  return { id: uuid(), user_id: 'local', table: 'memory', rowId, op: 'delete', payload: { id: rowId, user_id: 'local', created_at: at(0), updated_at: at(minute), deleted_at: at(minute) }, at: at(minute) };
}

describe.skipIf(!adminUrl)('memory through the API', () => {
  let env: Awaited<ReturnType<typeof freshDatabase>>;
  let api: (request: Request) => Promise<Response>;
  let ama: string, kofi: string;
  const call = (path: string, user: string | null, init: RequestInit = {}) => api(new Request(`${base}${path}`, { ...init, headers: { 'content-type': 'application/json', ...(user ? { authorization: `Bearer as:${user}` } : {}), 'life-device': uuid() } }));
  const push = async (user: string, operations: unknown[]) => { const res = await call('/sync/push', user, { method: 'POST', body: JSON.stringify({ operations }) }); expect(res.status).toBe(200); expect((await res.json() as { rejected: unknown[] }).rejected).toEqual([]); };
  const search = async (user: string, query: string, extra: Record<string, unknown> = {}) => { const res = await call('/memory/search', user, { method: 'POST', body: JSON.stringify({ query, ...extra }) }); expect(res.status).toBe(200); return (await res.json() as { memories: { id: string; text: string; sensitivity?: string }[] }).memories; };
  const list = async (user: string) => { const res = await call('/memory', user); expect(res.status).toBe(200); return (await res.json() as { memories: { id: string; text: string; validTo?: string }[] }).memories; };

  beforeAll(async () => {
    env = await freshDatabase();
    ama = await makeUser(env.db, 'ama@example.com');
    kofi = await makeUser(env.db, 'kofi@example.com');
    api = createApi({ db: env.db, now: () => NOW, auth: { handler: async () => new Response(null, { status: 404 }), getPrincipal: async req => { const m = /^Bearer as:(.+)$/.exec(req.headers.get('authorization') ?? ''); return m ? { userId: m[1] } : null; } } });
  });
  afterAll(async () => { await env?.drop(); });

  test('every memory route needs a session, and a search needs a question', async () => {
    expect((await call('/memory', null)).status).toBe(401);
    expect((await call('/memory/search', null, { method: 'POST', body: JSON.stringify({ query: 'x' }) })).status).toBe(401);
    expect((await call('/memory/search', ama, { method: 'POST', body: JSON.stringify({ query: '  ' }) })).status).toBe(400);
    expect((await call('/memory/search', ama, { method: 'POST', body: JSON.stringify({ query: 'x', limit: 500 }) })).status).toBe(400);
  });

  test("memory search returns only this user's memories", async () => {
    const amaCooking = uuid(), kofiCooking = uuid(), amaRent = uuid();
    await push(ama, [remembered(amaCooking, 1, 'Loves cooking West African food on Sundays.', { kind: 'preference' }), remembered(amaRent, 1, 'Rent goes up in March.', { category: 'Money' })]);
    await push(kofi, [remembered(kofiCooking, 1, 'Loves cooking for friends.', { kind: 'preference' })]);
    expect((await search(ama, 'What should I cook on Sunday?')).map(m => m.id)).toEqual([amaCooking]);
    expect((await search(kofi, 'What should I cook on Sunday?')).map(m => m.id)).toEqual([kofiCooking]);
    expect((await list(ama)).map(m => m.id).sort()).toEqual([amaCooking, amaRent].sort());
    expect((await list(kofi)).map(m => m.id)).toEqual([kofiCooking]);
    // Nothing anyone sends can widen the search to someone else's space.
    const res = await call('/memory/search', ama, { method: 'POST', body: JSON.stringify({ query: 'cooking', user_id: kofi }) });
    expect((await res.json() as { memories: { id: string }[] }).memories.map(m => m.id)).toEqual([amaCooking]);
  });

  test('a deleted memory is never used again, and its words are gone from the server', async () => {
    const secret = uuid();
    await push(ama, [remembered(secret, 2, 'Thinking about leaving my job at the bakery.')]);
    expect((await search(ama, 'my job at the bakery')).map(m => m.id)).toEqual([secret]);
    await push(ama, [forgotten(secret, 3)]);
    expect((await search(ama, 'my job at the bakery')).map(m => m.id)).toEqual([]);
    expect((await list(ama)).map(m => m.id)).not.toContain(secret);
    // Wiped, not hidden: the tombstone keeps only its dates, and the op that carried the words is gone.
    const [row] = await env.db.withUser(ama, tx => tx.select().from(memory).where(eq(memory.id, secret)));
    expect(row.deleted_at).toBe(at(3));
    expect([row.text, row.source, row.embedding]).toEqual([null, null, null]);
    const ops = await env.db.withUser(ama, tx => tx.select().from(syncOps).where(eq(syncOps.row_id, secret)));
    expect(ops.map(o => o.op)).toEqual(['delete']);
    expect(JSON.stringify(ops)).not.toContain('bakery');
    // A late copy of the old edit can't bring it back.
    await push(ama, [remembered(secret, 2, 'Thinking about leaving my job at the bakery.')]);
    expect((await search(ama, 'my job at the bakery'))).toEqual([]);
  });

  test('health memories are only searched when asked for, and closed memories never', async () => {
    const iron = uuid(), council = uuid(), nhs = uuid();
    await push(ama, [
      remembered(iron, 4, 'Low iron makes the afternoons hard.', { category: 'Body', kind: 'pattern' }),
      remembered(council, 4, 'Works at the council offices.', { kind: 'fact', validFrom: '2025-01-01T00:00:00.000Z', validTo: '2026-10-01T00:00:00.000Z' }),
      remembered(nhs, 4, 'Works at the NHS offices.', { kind: 'fact', validFrom: '2026-10-01T00:00:00.000Z' }),
    ]);
    expect((await search(ama, 'why are my afternoons hard')).map(m => m.id)).toEqual([]);
    expect((await search(ama, 'why are my afternoons hard', { includeHealth: true }))).toMatchObject([{ id: iron, sensitivity: 'health' }]);
    expect((await search(ama, 'where do I work')).map(m => m.id)).toEqual([nhs]);
    // The closed one is still listed, marked, so the person can see everything life keeps.
    expect((await list(ama)).find(m => m.id === council)?.validTo).toBe('2026-10-01T00:00:00.000Z');
  });
});
