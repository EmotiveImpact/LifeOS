import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { createApi } from '../../apps/api/src/app';
import { eq } from '../../apps/api/src/db/kit';
import { habitLog, memory, record, syncOps } from '../../apps/api/src/db/schema';
import { compact, compactSyncLogs, compactionDay } from '../../apps/api/src/sync';
import { adminUrl, freshDatabase, makeUser } from './support';

/**
 * Sync through the real handler and a real Postgres, as the API's role (row-level security on). Sign-in is stood in
 * for by "Bearer as:<userId>", so these tests are about sync alone; tests/api/auth.test.ts covers real sessions.
 */
const base = 'http://life.test';
const at = (minute: number) => new Date(Date.UTC(2026, 10, 20, 9, minute)).toISOString();
const uuid = () => crypto.randomUUID();

type Op = { id: string; user_id: string; table: string; rowId: string; op: 'upsert' | 'delete'; payload: Record<string, unknown>; at: string };
/** An op as the phone's outbox writes it. */
function upsert(table: string, rowId: string, minute: number, fields: Record<string, unknown>, created = 0): Op {
  const payload = { id: rowId, user_id: 'local-phone-id', created_at: at(created), updated_at: at(minute), deleted_at: null, ...fields };
  return { id: uuid(), user_id: 'local-phone-id', table, rowId, op: 'upsert', payload, at: at(minute) };
}
function remove(table: string, rowId: string, minute: number, created = 0): Op {
  const payload = { id: rowId, user_id: 'local-phone-id', created_at: at(created), updated_at: at(minute), deleted_at: at(minute) };
  return { id: uuid(), user_id: 'local-phone-id', table, rowId, op: 'delete', payload, at: at(minute) };
}
const recordOp = (rowId: string, minute: number, note: string) => upsert('record', rowId, minute, { kind: 'fact', fields: { note }, source: { type: 'talk' }, confidence: 1 });

describe.skipIf(!adminUrl)('sync through the API', () => {
  let env: Awaited<ReturnType<typeof freshDatabase>>;
  let api: (request: Request) => Promise<Response>;
  let ama: string, kofi: string;
  const phoneA = uuid(), phoneB = uuid();

  const call = (path: string, user: string, device: string | null, init: RequestInit = {}) => api(new Request(`${base}${path}`, {
    ...init, headers: { 'content-type': 'application/json', authorization: `Bearer as:${user}`, ...(device ? { 'life-device': device } : {}) },
  }));
  const pushAs = async (user: string, device: string | null, operations: unknown[]) => {
    const res = await call('/sync/push', user, device, { method: 'POST', body: JSON.stringify({ operations }) });
    return { status: res.status, body: await res.json() as { acknowledged: string[]; rejected: { id: string; reason: string }[] } };
  };
  const pullAs = async (user: string, device: string | null, cursor: string | null, limit?: number) => {
    const res = await call(`/sync/pull?${new URLSearchParams({ ...(cursor ? { cursor } : {}), ...(limit ? { limit: String(limit) } : {}) })}`, user, device);
    expect(res.status).toBe(200);
    return await res.json() as { changes: { table: string; op: string; row: Record<string, unknown> }[]; cursor: string | null; more: boolean };
  };
  const serverRecord = async (user: string, id: string) => (await env.db.withUser(user, tx => tx.select().from(record).where(eq(record.id, id))))[0];

  beforeAll(async () => {
    env = await freshDatabase();
    ama = await makeUser(env.db, 'ama@example.com');
    kofi = await makeUser(env.db, 'kofi@example.com');
    api = createApi({
      db: env.db,
      auth: { handler: async () => new Response(null, { status: 404 }), getPrincipal: async req => { const m = /^Bearer as:(.+)$/.exec(req.headers.get('authorization') ?? ''); return m ? { userId: m[1] } : null; } },
    });
  });
  afterAll(async () => { await env?.drop(); });

  test('every sync route needs a session', async () => {
    for (const [method, path] of [['POST', '/sync/push'], ['GET', '/sync/pull'], ['POST', '/sync/forget']]) {
      const res = await api(new Request(`${base}${path}`, { method }));
      expect(res.status).toBe(401);
    }
  });

  test('pushing the same op twice stores it once', async () => {
    const op = recordOp(uuid(), 1, 'rent goes up in March');
    for (let i = 0; i < 2; i++) {
      const { status, body } = await pushAs(ama, phoneA, [op]);
      expect(status).toBe(200);
      expect(body).toEqual({ acknowledged: [op.id], rejected: [] });
    }
    const stored = await env.db.withUser(ama, tx => tx.select().from(syncOps).where(eq(syncOps.id, op.id)));
    expect(stored).toHaveLength(1);
    expect((await serverRecord(ama, op.rowId))?.fields).toEqual({ note: 'rent goes up in March' });
  });

  test('rows are stored under the session, whatever user_id the phone sends', async () => {
    const op = recordOp(uuid(), 2, 'mine');
    op.payload.user_id = kofi; op.user_id = kofi;
    expect((await pushAs(ama, phoneA, [op])).body.acknowledged).toEqual([op.id]);
    expect((await serverRecord(ama, op.rowId))?.user_id).toBe(ama);
    expect(await serverRecord(kofi, op.rowId)).toBeUndefined();
  });

  test('pull returns ops after the cursor and not the caller’s own', async () => {
    const mine = recordOp(uuid(), 3, 'from phone A'), theirs = recordOp(uuid(), 4, 'from phone B');
    const start = (await pullAs(ama, phoneA, null)).cursor;
    await pushAs(ama, phoneA, [mine]);
    await pushAs(ama, phoneB, [theirs]);
    const forA = await pullAs(ama, phoneA, start);
    expect(forA.changes.map(c => c.row.id)).toEqual([theirs.rowId]);
    expect(forA.changes[0].row).not.toHaveProperty('user_id');
    const forB = await pullAs(ama, phoneB, start);
    expect(forB.changes.map(c => c.row.id)).toEqual([mine.rowId]);
    // The cursor moved past phone A's own op too, so the next pull is empty.
    expect(Number(forA.cursor)).toBeGreaterThan(Number(start ?? 0));
    expect((await pullAs(ama, phoneA, forA.cursor)).changes).toEqual([]);
  });

  test('pull pages, and a new phone with no cursor gets everything', async () => {
    const fresh = await pullAs(ama, null, null);
    expect(fresh.changes.length).toBeGreaterThanOrEqual(4);
    const first = await pullAs(ama, null, null, 2);
    expect(first.changes).toHaveLength(2);
    expect(first.more).toBe(true);
    const second = await pullAs(ama, null, first.cursor, 2);
    expect(second.changes[0].row.id).not.toBe(first.changes[1].row.id);
    expect(Number(second.cursor)).toBeGreaterThan(Number(first.cursor));
  });

  test('two devices edit one row: the newer updated_at wins, whatever order they arrive in', async () => {
    const id = uuid();
    await pushAs(ama, phoneA, [recordOp(id, 10, 'created')]);
    await pushAs(ama, phoneB, [recordOp(id, 12, 'newer, from B')]);
    await pushAs(ama, phoneA, [recordOp(id, 11, 'older, from A, arriving late')]);
    expect((await serverRecord(ama, id))?.fields).toEqual({ note: 'newer, from B' });
  });

  test('a delete on one device beats an older edit on the other', async () => {
    const id = uuid();
    await pushAs(ama, phoneA, [recordOp(id, 20, 'created')]);
    await pushAs(ama, phoneB, [remove('record', id, 22)]);
    await pushAs(ama, phoneA, [recordOp(id, 21, 'older edit')]);
    const row = await serverRecord(ama, id);
    expect(row?.deleted_at).toBe(at(22));
    expect(row?.fields).toEqual({ note: 'created' });
  });

  test('a delete and an edit at the same moment: the delete wins', async () => {
    const id = uuid();
    await pushAs(ama, phoneA, [recordOp(id, 30, 'created')]);
    await pushAs(ama, phoneA, [recordOp(id, 31, 'edit')]);
    await pushAs(ama, phoneB, [remove('record', id, 31)]);
    expect((await serverRecord(ama, id))?.deleted_at).toBe(at(31));
  });

  test('a delete that arrives before the row never lets an older edit bring it back', async () => {
    const id = uuid();
    await pushAs(ama, phoneB, [remove('record', id, 41)]);
    await pushAs(ama, phoneA, [recordOp(id, 40, 'older, offline')]);
    expect(await serverRecord(ama, id)).toBeUndefined();
    // A newer edit after the delete is a real change and is kept.
    await pushAs(ama, phoneA, [recordOp(id, 42, 'made again later')]);
    expect((await serverRecord(ama, id))?.fields).toEqual({ note: 'made again later' });
  });

  test('an op for another person’s row is rejected, and the rest of the batch still lands', async () => {
    const amasRow = uuid();
    await pushAs(ama, phoneA, [recordOp(amasRow, 50, 'Ama’s')]);
    const hijack = recordOp(amasRow, 59, 'Kofi was here'), fine = recordOp(uuid(), 51, 'Kofi’s own');
    const { status, body } = await pushAs(kofi, null, [hijack, fine]);
    expect(status).toBe(200);
    expect(body.rejected).toEqual([{ id: hijack.id, reason: 'FORBIDDEN' }]);
    expect(body.acknowledged).toEqual([fine.id]);
    expect((await serverRecord(ama, amasRow))?.fields).toEqual({ note: 'Ama’s' });
    // Nothing of the refused op is kept, even in Kofi's own log.
    expect(await env.db.withUser(kofi, tx => tx.select().from(syncOps).where(eq(syncOps.id, hijack.id)))).toEqual([]);
    // A delete naming Ama's row touches nothing of hers.
    await pushAs(kofi, null, [remove('record', amasRow, 59)]);
    expect((await serverRecord(ama, amasRow))?.deleted_at).toBeNull();
  });

  test('malformed ops are rejected one by one', async () => {
    const good = recordOp(uuid(), 60, 'fine');
    const unknownTable = { ...recordOp(uuid(), 60, 'x'), table: 'users' };
    const unknownColumn = recordOp(uuid(), 60, 'x'); unknownColumn.payload.secret = 'no';
    const wrongType = upsert('habit_log', uuid(), 60, { habit_id: uuid(), date: '2026-11-20', done: 'yes', source: null });
    const missingRequired = upsert('habit_log', uuid(), 60, { habit_id: uuid(), done: true, source: null });
    const sloppyTime = recordOp(uuid(), 60, 'x'); sloppyTime.payload.updated_at = '2026-11-20 09:00';
    const mismatch = recordOp(uuid(), 60, 'x'); mismatch.rowId = uuid();
    const deleteWithoutTombstone = remove('record', uuid(), 60); deleteWithoutTombstone.payload.deleted_at = null;
    const bad = [unknownTable, unknownColumn, wrongType, missingRequired, sloppyTime, mismatch, deleteWithoutTombstone];
    const { body } = await pushAs(ama, phoneA, [...bad, good]);
    expect(body.acknowledged).toEqual([good.id]);
    expect(body.rejected.map(r => r.id)).toEqual(bad.map(op => op.id));
    expect(body.rejected.every(r => r.reason === 'INVALID')).toBe(true);
    expect(await env.db.withUser(ama, tx => tx.select().from(habitLog))).toEqual([]);
  });

  test('a batch over the limit is refused whole', async () => {
    const { status } = await pushAs(ama, phoneA, Array.from({ length: 501 }, (_, i) => recordOp(uuid(), 0, String(i))));
    expect(status).toBe(413);
  });

  test('forgetting health memories removes the server copy and its ops, for this person only', async () => {
    const health = uuid(), other = uuid();
    const ops = [upsert('memory', health, 70, { text: 'Low iron in March', embedding: null, source: { health: true }, last_used: null }), upsert('memory', other, 70, { text: 'Rent is due on the 1st', embedding: null, source: { label: 'Talk' }, last_used: null })];
    await pushAs(ama, phoneA, ops);
    const res = await call('/sync/forget', ama, phoneA, { method: 'POST', body: JSON.stringify({ table: 'memory', ids: [health, uuid()] }) });
    expect(await res.json()).toEqual({ forgotten: 1 });
    const left = await env.db.withUser(ama, tx => tx.select().from(memory));
    expect(left.map(m => m.id)).toEqual([other]);
    expect(await env.db.withUser(ama, tx => tx.select().from(syncOps).where(eq(syncOps.row_id, health)))).toEqual([]);
    const notAllowed = await call('/sync/forget', ama, phoneA, { method: 'POST', body: JSON.stringify({ table: 'record', ids: [uuid()] }) });
    expect(notAllowed.status).toBe(400);
  });

  describe('compacting the log (fix F-42)', () => {
    const DAY = 24 * 60 * 60 * 1000;
    type Change = { table: string; op: string; row: Record<string, unknown> };
    /** A phone's copy: per row, the newer `updated_at` wins and a delete wins a tie, as the phone's store decides. */
    const phoneCopy = (changes: Change[], start: Record<string, Change> = {}) => {
      const copy = { ...start };
      for (const change of changes) {
        const id = change.row.id as string, have = copy[id];
        const newer = !have || (change.row.updated_at as string) > (have.row.updated_at as string) || (change.row.updated_at === have.row.updated_at && change.op === 'delete' && have.op !== 'delete');
        if (newer) copy[id] = change;
      }
      return copy;
    };
    const opsOf = (user: string) => env.db.withUser(user, tx => tx.select().from(syncOps));
    const notes = (copy: Record<string, Change>) => Object.fromEntries(Object.entries(copy).map(([id, c]) => [id, c.op === 'delete' ? 'deleted' : (c.row.fields as { note: string }).note]));

    test('each row keeps only its winning op, and every phone still ends with the same rows', async () => {
      const yaa = await makeUser(env.db, 'yaa@example.com');
      const edited = uuid(), deleted = uuid(), late = uuid();
      await pushAs(yaa, phoneA, [recordOp(edited, 1, 'first'), recordOp(edited, 2, 'second'), recordOp(edited, 3, 'third'), recordOp(deleted, 1, 'gone soon'), remove('record', deleted, 5)]);
      // An older edit that arrives after a newer one: stored in the log, but it never wins.
      await pushAs(yaa, phoneA, [recordOp(late, 10, 'newer')]);
      await pushAs(yaa, phoneA, [recordOp(late, 4, 'older, arrived late')]);
      const midway = (await pullAs(yaa, phoneB, null, 1)).cursor;
      const before = phoneCopy((await pullAs(yaa, phoneB, null)).changes);
      expect(notes(before)).toEqual({ [edited]: 'third', [deleted]: 'deleted', [late]: 'newer' });
      expect(await opsOf(yaa)).toHaveLength(7);

      // Ops from the last day stay as they came.
      expect(await env.db.withUser(yaa, tx => compact(tx, Date.now()))).toBe(0);
      expect(await env.db.withUser(yaa, tx => compact(tx, Date.now() + 2 * DAY))).toBe(4);
      expect((await opsOf(yaa)).map(o => o.row_id).sort()).toEqual([edited, deleted, late].sort());

      // A new phone pulls one op per row and ends the same.
      const fresh = await pullAs(yaa, phoneB, null);
      expect(fresh.changes).toHaveLength(3);
      expect(notes(phoneCopy(fresh.changes))).toEqual(notes(before));
      // A phone that had pulled only the first op still ends the same.
      const firstOnly = phoneCopy([{ table: 'record', op: 'upsert', row: recordOp(edited, 1, 'first').payload }]);
      expect(notes(phoneCopy((await pullAs(yaa, phoneB, midway)).changes, firstOnly))).toEqual(notes(before));
      // The server's own rows are untouched.
      expect(((await serverRecord(yaa, edited)).fields as { note: string }).note).toBe('third');
      expect((await serverRecord(yaa, deleted)).deleted_at).not.toBeNull();
    });

    test('a delete still stops an older edit that arrives after compaction', async () => {
      const esi = await makeUser(env.db, 'esi@example.com');
      const row = uuid();
      await pushAs(esi, phoneA, [recordOp(row, 1, 'kept'), remove('record', row, 6)]);
      await env.db.withUser(esi, tx => compact(tx, Date.now() + 2 * DAY));
      await pushAs(esi, phoneB, [recordOp(row, 3, 'from a phone that was offline')]);
      expect((await serverRecord(esi, row)).deleted_at).not.toBeNull();
    });

    test('the sweep compacts a seventh of accounts a day, each as that person', async () => {
      const kwame = await makeUser(env.db, 'kwame@example.com'), row = uuid();
      await pushAs(kwame, phoneA, [recordOp(row, 1, 'one'), recordOp(row, 2, 'two')]);
      await pushAs(ama, phoneA, [recordOp(uuid(), 1, 'a'), recordOp(uuid(), 2, 'b')]);
      const amaOps = (await opsOf(ama)).length;
      // A day, at least two from now, that is Kwame's day.
      let day = Math.floor((Date.now() + 2 * DAY) / DAY);
      while (day % 7 !== compactionDay(kwame)) day++;
      const result = await compactSyncLogs(env.db, day * DAY + 1000);
      expect(result.accounts).toBeGreaterThanOrEqual(1);
      expect(result.failed).toBe(0);
      expect(await opsOf(kwame)).toHaveLength(1);
      // On someone else's day, Kwame's log isn't touched; and Ama's only on Ama's day.
      if (compactionDay(ama) !== compactionDay(kwame)) expect((await opsOf(ama)).length).toBe(amaOps);
      expect([...new Set(Array.from({ length: 50 }, () => compactionDay(uuid())))].every(d => d >= 0 && d < 7)).toBe(true);
    });
  });
});
