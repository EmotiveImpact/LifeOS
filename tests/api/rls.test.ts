import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { eq, sql } from '../../apps/api/src/db/kit';
import { record, devices, users } from '../../apps/api/src/db/schema';
import { assertRowSecurity } from '../../apps/api/src/db/client';
import { bunDb } from '../../apps/api/src/db/bun';
import { adminUrl, freshDatabase, makeUser } from './support';

const row = (id: string, userId: string, kind: string) => ({ id, user_id: userId, created_at: '2026-11-20T09:00:00.000Z', updated_at: '2026-11-20T09:00:00.000Z', kind, fields: { note: kind } });

describe.skipIf(!adminUrl)('row-level security', () => {
  let env: Awaited<ReturnType<typeof freshDatabase>>;
  let ama: string, kofi: string;
  beforeAll(async () => {
    env = await freshDatabase();
    ama = await makeUser(env.db, 'ama@example.com');
    kofi = await makeUser(env.db, 'kofi@example.com');
    await env.db.withUser(ama, tx => tx.insert(record).values(row(crypto.randomUUID(), ama, 'rent')));
    await env.db.withUser(kofi, tx => tx.insert(record).values(row(crypto.randomUUID(), kofi, 'payslip')));
  });
  afterAll(async () => { await env?.drop(); });

  test('the API role cannot bypass it', async () => {
    await assertRowSecurity(env.db.db);
    const owner = bunDb(env.ownerUrl);
    try { await expect(assertRowSecurity(owner.db)).rejects.toThrow(/bypass row-level security/); } finally { await owner.close(); }
  });

  test('a person sees only their own rows, even with a forged query', async () => {
    const all = await env.db.withUser(ama, tx => tx.select().from(record));
    expect(all.map(r => r.kind)).toEqual(['rent']);
    const forged = await env.db.withUser(ama, tx => tx.select().from(record).where(eq(record.user_id, kofi)));
    expect(forged).toEqual([]);
    const raw = await env.db.withUser(ama, tx => tx.execute(sql`select count(*)::int as n from record where user_id <> ${ama}`));
    expect((raw as unknown as { n: number }[])[0].n).toBe(0);
  });

  test('outside a person’s transaction no rows are visible', async () => {
    expect(await env.db.db.select().from(record)).toEqual([]);
  });

  test('writing a row for someone else is refused', async () => {
    await expect(env.db.withUser(ama, tx => tx.insert(record).values(row(crypto.randomUUID(), kofi, 'forged')))).rejects.toThrow();
    const kofisRows = await env.db.withUser(kofi, tx => tx.select().from(record));
    expect(kofisRows.map(r => r.kind)).toEqual(['payslip']);
  });

  test('changing or deleting another person’s rows touches nothing', async () => {
    await env.db.withUser(ama, tx => tx.update(record).set({ kind: 'hijacked' }).where(eq(record.user_id, kofi)));
    await env.db.withUser(ama, tx => tx.delete(record).where(eq(record.user_id, kofi)));
    const kofisRows = await env.db.withUser(kofi, tx => tx.select().from(record));
    expect(kofisRows.map(r => r.kind)).toEqual(['payslip']);
  });

  test('server-only tables are covered too', async () => {
    const id = crypto.randomUUID();
    await env.db.withUser(kofi, tx => tx.insert(devices).values({ id, user_id: kofi, platform: 'ios' }));
    expect(await env.db.withUser(ama, tx => tx.select().from(devices))).toEqual([]);
  });

  test('deleting a person removes their rows', async () => {
    const gone = await makeUser(env.db, 'gone@example.com');
    await env.db.withUser(gone, tx => tx.insert(record).values(row(crypto.randomUUID(), gone, 'letter')));
    await env.db.db.delete(users).where(eq(users.id, gone));
    const owner = bunDb(env.ownerUrl);
    try {
      const left = await owner.db.execute(sql`select count(*)::int as n from record where user_id = ${gone}`);
      expect((left as unknown as { n: number }[])[0].n).toBe(0);
    } finally { await owner.close(); }
  });
});
