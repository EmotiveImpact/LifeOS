import { columns, tableNames } from './schema';

export const migrationVersion = 1794787200000;
const references: Record<string, string[]> = {
  habit_log: ['FOREIGN KEY (habit_id, user_id) REFERENCES habit(id, user_id) DEFERRABLE INITIALLY DEFERRED'],
  mission_step: ['FOREIGN KEY (mission_id, user_id) REFERENCES mission(id, user_id) DEFERRABLE INITIALLY DEFERRED'],
  important_date: ['FOREIGN KEY (person_id, user_id) REFERENCES person(id, user_id) DEFERRABLE INITIALLY DEFERRED'],
};
/** The same migration is consumed by Drizzle/Expo on native and real SQLite in tests. */
export const migrationSql = tableNames.map(name => {
  const fields = columns[name].map(c => `"${c.key}" ${c.sqlType}${c.key === 'id' ? ' PRIMARY KEY NOT NULL' : c.notNull ? ' NOT NULL' : ''}`);
  fields.push('UNIQUE(id, user_id)', ...(references[name] ?? []));
  return `CREATE TABLE IF NOT EXISTS "${name}" (${fields.join(', ')});\nCREATE INDEX IF NOT EXISTS "${name}_user_updated" ON "${name}" (user_id, updated_at);`;
}).join('\n') + `
CREATE INDEX IF NOT EXISTS health_sample_user_type_start ON health_sample(user_id, type, start);
CREATE TABLE IF NOT EXISTS outbox (id TEXT PRIMARY KEY NOT NULL, user_id TEXT NOT NULL, table_name TEXT NOT NULL, row_id TEXT NOT NULL, op TEXT NOT NULL CHECK(op IN ('upsert','delete')), payload TEXT NOT NULL, at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS outbox_user_at ON outbox(user_id, at, id);
CREATE INDEX IF NOT EXISTS outbox_user_row ON outbox(user_id, table_name, row_id);
CREATE TABLE IF NOT EXISTS local_state (user_id TEXT NOT NULL, key TEXT NOT NULL, value TEXT NOT NULL, PRIMARY KEY(user_id, key));
CREATE TABLE IF NOT EXISTS sync_cursor (user_id TEXT PRIMARY KEY NOT NULL, cursor TEXT);
`;
export const drizzleMigrations = {
  journal: { version: '7', dialect: 'sqlite', entries: [{ idx: 0, version: '6', when: migrationVersion, tag: '0000_local_platform', breakpoints: true }] },
  migrations: { m0000: migrationSql.split(';').map(statement => statement.trim()).filter(Boolean).map(statement => `${statement};`).join('\n--> statement-breakpoint\n') },
};
