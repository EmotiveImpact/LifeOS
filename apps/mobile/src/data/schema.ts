import { getTableColumns } from 'drizzle-orm';
import { integer, real, sqliteTable, text, index } from 'drizzle-orm/sqlite-core';

/** SYSTEM_DESIGN §4. JSON columns retain their named, typed domain boundary;
 * timestamps are UTC ISO strings and deletions are tombstones for sync. */
const meta = () => ({ id: text('id').primaryKey().notNull(), user_id: text('user_id').notNull(), created_at: text('created_at').notNull(), updated_at: text('updated_at').notNull(), deleted_at: text('deleted_at') });
const json = (name: string) => text(name, { mode: 'json' });
export const profile = sqliteTable('profile', { ...meta(), name: text('name'), date_of_birth: text('date_of_birth'), where: json('where'), work: json('work'), household: integer('household'), pay_day: integer('pay_day'), chronotype: json('chronotype'), values: json('values'), big_five: json('big_five'), level: integer('level'), chapter: text('chapter'), core_fields: json('core_fields') });
export const bodyProfile = sqliteTable('body_profile', { ...meta(), height_cm: real('height_cm'), weight_kg: real('weight_kg'), waist_cm: real('waist_cm'), body_fat_pct: real('body_fat_pct'), sex_at_birth: text('sex_at_birth'), activity_level: text('activity_level'), ethnicity_for_ranges: text('ethnicity_for_ranges'), units: json('units') });
export const healthSample = sqliteTable('health_sample', { ...meta(), type: text('type'), start: text('start'), end: text('end'), value: real('value'), unit: text('unit'), source: json('source'), device: text('device'), confidence: real('confidence') }, t => [index('health_sample_user_type_start').on(t.user_id, t.type, t.start)]);
export const dailyHealth = sqliteTable('daily_health', { ...meta(), date: text('date'), sleep: json('sleep'), readiness: json('readiness'), load: json('load'), signals: json('signals'), steps: integer('steps'), water_ml: integer('water_ml') });
export const baseline = sqliteTable('baseline', { ...meta(), metric: text('metric'), window_days: integer('window_days'), mean: real('mean'), sd: real('sd') });
export const foodEntry = sqliteTable('food_entry', { ...meta(), at: text('at'), items: json('items'), photo_ref: text('photo_ref'), confirmed: integer('confirmed', { mode: 'boolean' }), fit_score: real('fit_score'), fields: json('fields') });
export const foodTarget = sqliteTable('food_target', { ...meta(), goal: text('goal'), target_weight: real('target_weight'), pace: real('pace'), kcal: real('kcal'), protein: real('protein'), carbs: real('carbs'), fat: real('fat'), fibre: real('fibre'), exercise_addback: text('exercise_addback') });
export const savedMeal = sqliteTable('saved_meal', { ...meta(), name: text('name'), items: json('items'), default_portion: real('default_portion') });
export const habit = sqliteTable('habit', { ...meta(), name: text('name'), cue: text('cue'), schedule: json('schedule'), strength: real('strength'), auto_complete: integer('auto_complete', { mode: 'boolean' }), fields: json('fields') });
export const habitLog = sqliteTable('habit_log', { ...meta(), habit_id: text('habit_id').notNull(), date: text('date').notNull(), done: integer('done', { mode: 'boolean' }), source: json('source') });
export const record = sqliteTable('record', { ...meta(), kind: text('kind'), fields: json('fields'), source: json('source'), confidence: real('confidence') });
export const mission = sqliteTable('mission', { ...meta(), title: text('title'), area: text('area'), stage: text('stage'), value: json('value'), due: text('due'), fields: json('fields') });
export const missionStep = sqliteTable('mission_step', { ...meta(), mission_id: text('mission_id').notNull(), state: text('state'), drafts: json('drafts'), fields: json('fields') });
export const person = sqliteTable('person', { ...meta(), name: text('name'), relation: text('relation'), contact_ref: text('contact_ref'), fields: json('fields') });
export const importantDate = sqliteTable('important_date', { ...meta(), person_id: text('person_id'), date: text('date'), kind: text('kind'), reminder: json('reminder') });
export const document = sqliteTable('document', { ...meta(), kind: text('kind'), expires: text('expires'), act_from: text('act_from'), file_ref: text('file_ref'), fields: json('fields') });
export const learningRecord = sqliteTable('learning_record', { ...meta(), topic: text('topic'), source: json('source'), level: text('level'), guess: json('guess'), puzzles: json('puzzles'), teach_back: json('teach_back'), fsrs: json('fsrs'), led_to: json('led_to') });
export const planDay = sqliteTable('plan_day', { ...meta(), date: text('date'), moves: json('moves') });
export const nudge = sqliteTable('nudge', { ...meta(), at: text('at'), kind: text('kind'), outcome: text('outcome'), fields: json('fields') });
export const banditArm = sqliteTable('bandit_arm', { ...meta(), context_key: text('context_key'), arm: text('arm'), alpha: real('alpha'), beta: real('beta') });
export const memory = sqliteTable('memory', { ...meta(), text: text('text'), embedding: json('embedding'), source: json('source'), last_used: text('last_used') });
export const prefs = sqliteTable('prefs', { ...meta(), look: text('look'), sounds: integer('sounds', { mode: 'boolean' }), haptics: integer('haptics', { mode: 'boolean' }), hand_drawn: integer('hand_drawn', { mode: 'boolean' }), hide_numbers: integer('hide_numbers', { mode: 'boolean' }), notifications: json('notifications'), private_mode: integer('private_mode', { mode: 'boolean' }), fields: json('fields') });
/** Money observations use FiledRecord kinds/fields until their own domain model is added. */
export const tables = { profile, body_profile: bodyProfile, health_sample: healthSample, daily_health: dailyHealth, baseline, food_entry: foodEntry, food_target: foodTarget, saved_meal: savedMeal, habit, habit_log: habitLog, record, mission, mission_step: missionStep, person, important_date: importantDate, document, learning_record: learningRecord, plan_day: planDay, nudge, bandit_arm: banditArm, memory, prefs } as const;
export type TableName = keyof typeof tables;
export type DataRow = { id: string; user_id: string; created_at: string; updated_at: string; deleted_at: string | null } & Record<string, unknown>;
export const tableNames = Object.keys(tables) as TableName[];
export const columns = Object.fromEntries(tableNames.map(name => [name, Object.entries(getTableColumns(tables[name])).map(([key, col]) => ({ key, json: col.columnType === 'SQLiteTextJson', boolean: col.columnType === 'SQLiteBoolean', notNull: col.notNull, sqlType: col.getSQLType() }))])) as Record<TableName, { key: string; json: boolean; boolean: boolean; notNull: boolean; sqlType: string }[]>;
export const isTable = (name: string): name is TableName => Object.hasOwn(tables, name);
