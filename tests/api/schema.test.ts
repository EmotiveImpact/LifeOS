import { describe, expect, test } from 'bun:test';
import { getTableConfig as serverConfig } from '../../apps/api/src/db/kit';
import { columns as phoneColumns, tables as phone, type TableName } from '../../apps/mobile/src/data/schema';
import { phoneTables as server, userTables } from '../../apps/api/src/db/schema';

/** What each phone column must be on the server: JSON text becomes jsonb, 0/1 integers booleans, reals doubles. */
const serverType = (c: (typeof phoneColumns)[TableName][number]) => c.json ? 'PgJsonb' : c.boolean ? 'PgBoolean' : c.sqlType === 'real' ? 'PgDoublePrecision' : c.sqlType === 'integer' ? 'PgInteger' : 'PgText';

describe('server schema mirrors the phone', () => {
  test('every phone table has a server table with the same columns', () => {
    expect(Object.keys(server).sort()).toEqual(Object.keys(phone).sort());
    for (const name of Object.keys(phone) as TableName[]) {
      const s = serverConfig(server[name]);
      expect(s.name).toBe(name);
      const sCols = Object.fromEntries(s.columns.map(c => [c.name, c]));
      expect(Object.keys(sCols).sort()).toEqual(phoneColumns[name].map(c => c.key).sort());
      for (const c of phoneColumns[name]) {
        expect(`${name}.${c.key} ${sCols[c.key].columnType}`).toBe(`${name}.${c.key} ${serverType(c)}`);
        expect(`${name}.${c.key} notNull=${sCols[c.key].notNull}`).toBe(`${name}.${c.key} notNull=${c.notNull}`);
      }
    }
  });

  test('every user table carries user_id and every phone table a deleted_at tombstone', () => {
    for (const table of Object.values(server)) {
      const cols = serverConfig(table).columns.map(c => c.name);
      expect(cols).toContain('user_id');
      expect(cols).toContain('deleted_at');
    }
    expect(userTables).toEqual(expect.arrayContaining([...Object.keys(phone), 'devices', 'sync_ops', 'oauth_tokens', 'ai_usage']));
  });

  test('the row-level security migration covers every user table', async () => {
    const sql = await Bun.file(new URL('../../apps/api/drizzle/0001_row_level_security.sql', import.meta.url)).text();
    for (const name of userTables) {
      expect(sql).toContain(`ALTER TABLE "${name}" FORCE ROW LEVEL SECURITY;`);
      expect(sql).toContain(`CREATE POLICY "${name}_owner" ON "${name}"`);
    }
  });
});
