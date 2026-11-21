/**
 * Server tables (SYSTEM_DESIGN §4, BUILD_V26 Phase 21).
 *
 * - Every phone table in `apps/mobile/src/data/schema.ts` is mirrored here with the same names and columns, so a row
 *   can travel between phone and server unchanged. JSON columns become `jsonb`, booleans `boolean`, reals
 *   `double precision`; timestamps stay ISO text, as on the phone. `tests/api/schema.test.ts` keeps the two in step.
 * - Every user table carries `user_id` (deleting a user deletes their rows) and a `deleted_at` tombstone for sync.
 * - Row-level security on every user table lives in `drizzle/0001_row_level_security.sql`.
 * - The auth tables (`users`, `sessions`, `accounts`, `verifications`) follow Better Auth's core schema.
 */
import { bigint, bigserial, boolean, doublePrecision, index, integer, jsonb, pgTable, primaryKey, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

/* ───────────────────────── Accounts (Better Auth core schema) ───────────────────────── */

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('email_verified').notNull().default(false),
  image: text('image'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  token: text('token').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
}, t => [index('sessions_user').on(t.userId)]);

export const accounts = pgTable('accounts', {
  id: text('id').primaryKey(),
  accountId: text('account_id').notNull(),
  providerId: text('provider_id').notNull(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  accessToken: text('access_token'),
  refreshToken: text('refresh_token'),
  idToken: text('id_token'),
  accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
  refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
  scope: text('scope'),
  password: text('password'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [index('accounts_user').on(t.userId), uniqueIndex('accounts_provider_account').on(t.providerId, t.accountId)]);

export const verifications = pgTable('verifications', {
  id: text('id').primaryKey(),
  identifier: text('identifier').notNull(),
  value: text('value').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [index('verifications_identifier').on(t.identifier)]);

/* ───────────────────────── The phone's tables, mirrored ───────────────────────── */

/** The phone's `meta()` columns, with the owner tied to `users`. Each mirrored table spreads them and is indexed by owner. */
const meta = () => ({
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  created_at: text('created_at').notNull(),
  updated_at: text('updated_at').notNull(),
  deleted_at: text('deleted_at'),
});

export const profile = pgTable('profile', { ...meta(), name: text('name'), date_of_birth: text('date_of_birth'), where: jsonb('where'), work: jsonb('work'), household: integer('household'), pay_day: integer('pay_day'), chronotype: jsonb('chronotype'), values: jsonb('values'), big_five: jsonb('big_five'), level: integer('level'), chapter: text('chapter'), core_fields: jsonb('core_fields') }, t => [index('profile_user').on(t.user_id)]);
export const bodyProfile = pgTable('body_profile', { ...meta(), height_cm: doublePrecision('height_cm'), weight_kg: doublePrecision('weight_kg'), waist_cm: doublePrecision('waist_cm'), body_fat_pct: doublePrecision('body_fat_pct'), sex_at_birth: text('sex_at_birth'), activity_level: text('activity_level'), ethnicity_for_ranges: text('ethnicity_for_ranges'), units: jsonb('units') }, t => [index('body_profile_user').on(t.user_id)]);
export const healthSample = pgTable('health_sample', { ...meta(), type: text('type'), start: text('start'), end: text('end'), value: doublePrecision('value'), unit: text('unit'), source: jsonb('source'), device: text('device'), confidence: doublePrecision('confidence') }, t => [index('health_sample_user').on(t.user_id), index('health_sample_user_type_start').on(t.user_id, t.type, t.start)]);
export const dailyHealth = pgTable('daily_health', { ...meta(), date: text('date'), sleep: jsonb('sleep'), readiness: jsonb('readiness'), load: jsonb('load'), signals: jsonb('signals'), steps: integer('steps'), water_ml: integer('water_ml') }, t => [index('daily_health_user').on(t.user_id)]);
export const baseline = pgTable('baseline', { ...meta(), metric: text('metric'), window_days: integer('window_days'), mean: doublePrecision('mean'), sd: doublePrecision('sd') }, t => [index('baseline_user').on(t.user_id)]);
export const foodEntry = pgTable('food_entry', { ...meta(), at: text('at'), items: jsonb('items'), photo_ref: text('photo_ref'), confirmed: boolean('confirmed'), fit_score: doublePrecision('fit_score'), fields: jsonb('fields') }, t => [index('food_entry_user').on(t.user_id)]);
export const foodTarget = pgTable('food_target', { ...meta(), goal: text('goal'), target_weight: doublePrecision('target_weight'), pace: doublePrecision('pace'), kcal: doublePrecision('kcal'), protein: doublePrecision('protein'), carbs: doublePrecision('carbs'), fat: doublePrecision('fat'), fibre: doublePrecision('fibre'), exercise_addback: text('exercise_addback') }, t => [index('food_target_user').on(t.user_id)]);
export const savedMeal = pgTable('saved_meal', { ...meta(), name: text('name'), items: jsonb('items'), default_portion: doublePrecision('default_portion') }, t => [index('saved_meal_user').on(t.user_id)]);
export const habit = pgTable('habit', { ...meta(), name: text('name'), cue: text('cue'), schedule: jsonb('schedule'), strength: doublePrecision('strength'), auto_complete: boolean('auto_complete'), fields: jsonb('fields') }, t => [index('habit_user').on(t.user_id)]);
export const habitLog = pgTable('habit_log', { ...meta(), habit_id: text('habit_id').notNull(), date: text('date').notNull(), done: boolean('done'), source: jsonb('source') }, t => [index('habit_log_user').on(t.user_id)]);
export const record = pgTable('record', { ...meta(), kind: text('kind'), fields: jsonb('fields'), source: jsonb('source'), confidence: doublePrecision('confidence') }, t => [index('record_user').on(t.user_id)]);
export const mission = pgTable('mission', { ...meta(), title: text('title'), area: text('area'), stage: text('stage'), value: jsonb('value'), due: text('due'), fields: jsonb('fields') }, t => [index('mission_user').on(t.user_id)]);
export const missionStep = pgTable('mission_step', { ...meta(), mission_id: text('mission_id').notNull(), state: text('state'), drafts: jsonb('drafts'), fields: jsonb('fields') }, t => [index('mission_step_user').on(t.user_id)]);
export const person = pgTable('person', { ...meta(), name: text('name'), relation: text('relation'), contact_ref: text('contact_ref'), fields: jsonb('fields') }, t => [index('person_user').on(t.user_id)]);
export const importantDate = pgTable('important_date', { ...meta(), person_id: text('person_id'), date: text('date'), kind: text('kind'), reminder: jsonb('reminder') }, t => [index('important_date_user').on(t.user_id)]);
export const document = pgTable('document', { ...meta(), kind: text('kind'), expires: text('expires'), act_from: text('act_from'), file_ref: text('file_ref'), fields: jsonb('fields') }, t => [index('document_user').on(t.user_id)]);
export const learningRecord = pgTable('learning_record', { ...meta(), topic: text('topic'), source: jsonb('source'), level: text('level'), guess: jsonb('guess'), puzzles: jsonb('puzzles'), teach_back: jsonb('teach_back'), fsrs: jsonb('fsrs'), led_to: jsonb('led_to') }, t => [index('learning_record_user').on(t.user_id)]);
export const planDay = pgTable('plan_day', { ...meta(), date: text('date'), moves: jsonb('moves') }, t => [index('plan_day_user').on(t.user_id)]);
export const nudge = pgTable('nudge', { ...meta(), at: text('at'), kind: text('kind'), outcome: text('outcome'), fields: jsonb('fields') }, t => [index('nudge_user').on(t.user_id)]);
export const banditArm = pgTable('bandit_arm', { ...meta(), context_key: text('context_key'), arm: text('arm'), alpha: doublePrecision('alpha'), beta: doublePrecision('beta') }, t => [index('bandit_arm_user').on(t.user_id)]);
export const memory = pgTable('memory', { ...meta(), text: text('text'), embedding: jsonb('embedding'), source: jsonb('source'), last_used: text('last_used') }, t => [index('memory_user').on(t.user_id)]);
export const prefs = pgTable('prefs', { ...meta(), look: text('look'), sounds: boolean('sounds'), haptics: boolean('haptics'), hand_drawn: boolean('hand_drawn'), hide_numbers: boolean('hide_numbers'), notifications: jsonb('notifications'), private_mode: boolean('private_mode'), fields: jsonb('fields') }, t => [index('prefs_user').on(t.user_id)]);

export const phoneTables = { profile, body_profile: bodyProfile, health_sample: healthSample, daily_health: dailyHealth, baseline, food_entry: foodEntry, food_target: foodTarget, saved_meal: savedMeal, habit, habit_log: habitLog, record, mission, mission_step: missionStep, person, important_date: importantDate, document, learning_record: learningRecord, plan_day: planDay, nudge, bandit_arm: banditArm, memory, prefs } as const;

/* ───────────────────────── Server only ───────────────────────── */

/** Phones and other devices signed in to an account: sync skips a device's own changes, push needs its token. */
export const devices = pgTable('devices', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  platform: text('platform').notNull(),
  name: text('name'),
  push_token: text('push_token'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  last_seen_at: timestamp('last_seen_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [index('devices_user').on(t.user_id)]);

/**
 * Every change a phone has pushed, in arrival order: `seq` is the opaque, monotonic sync cursor (Phase 22). An op's
 * `id` is unique per person, so pushing it twice stores it once, and one person can't block another's op id.
 */
export const syncOps = pgTable('sync_ops', {
  seq: bigserial('seq', { mode: 'number' }).primaryKey(),
  id: text('id').notNull(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  device_id: text('device_id'),
  table_name: text('table_name').notNull(),
  row_id: text('row_id').notNull(),
  op: text('op').notNull(),
  payload: jsonb('payload').notNull(),
  at: text('at').notNull(),
  received_at: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [index('sync_ops_user_seq').on(t.user_id, t.seq), uniqueIndex('sync_ops_user_op').on(t.user_id, t.id), index('sync_ops_user_row').on(t.user_id, t.table_name, t.row_id)]);

/** Wearable and bank tokens (WHOOP, Oura, Open Banking), sealed with AES-GCM before they are stored (`src/seal.ts`). */
export const oauthTokens = pgTable('oauth_tokens', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  provider: text('provider').notNull(),
  access_token: text('access_token').notNull(),
  refresh_token: text('refresh_token'),
  expires_at: timestamp('expires_at', { withTimezone: true }),
  scope: text('scope'),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [uniqueIndex('oauth_tokens_user_provider').on(t.user_id, t.provider)]);

/** Lessons and scenes shared by everyone who asks about the same idea. Nothing personal goes in these. */
export const lessonCache = pgTable('lesson_cache', { key: text('key').primaryKey(), body: jsonb('body').notNull(), created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow() });
export const sceneCache = pgTable('scene_cache', { key: text('key').primaryKey(), body: jsonb('body').notNull(), created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow() });

/**
 * The AI cost ledger: one row per billed model call, durable, per user and job (`src/router.ts`). `tier` is what the
 * allowances count; `outcome` is `ok`, `rejected` (the answer failed life's checks) or `declined` (the model refused
 * or its reply was cut off), because those calls cost money too.
 */
export const aiUsage = pgTable('ai_usage', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  job: text('job').notNull(),
  model: text('model').notNull(),
  location: text('location').notNull(),
  tier: text('tier').notNull().default('fast'),
  outcome: text('outcome').notNull().default('ok'),
  input_tokens: integer('input_tokens').notNull().default(0),
  output_tokens: integer('output_tokens').notNull().default(0),
  cost_micros: bigint('cost_micros', { mode: 'number' }).notNull().default(0),
  at: timestamp('at', { withTimezone: true }).notNull().defaultNow(),
}, t => [index('ai_usage_user_at').on(t.user_id, t.at)]);

/**
 * Meal photos and scanned letters in object storage (Phase 23, `src/storage.ts`). The server chooses every key:
 * `tmp/<user>/<id>` for a file that goes once it has been read (the bucket also expires `tmp/` after a day), or
 * `keep/<user>/<id>` for one the person chose to keep. `delete_after` is null for kept files.
 */
export const files = pgTable('files', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  key: text('key').notNull().unique(),
  kind: text('kind').notNull(),
  content_type: text('content_type').notNull(),
  keep: boolean('keep').notNull().default(false),
  delete_after: timestamp('delete_after', { withTimezone: true }),
  created_at: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
}, t => [index('files_user').on(t.user_id)]);

/**
 * Accounts their owners asked to delete. Every session ends at once; signing in again before `delete_after` keeps
 * the account; after it, the sweep deletes the person, every row (by cascade) and every file. Like `sessions`, this
 * holds no personal content and has no row-level security, because the sweep reads it across accounts.
 */
export const accountClosures = pgTable('account_closures', {
  user_id: text('user_id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  requested_at: timestamp('requested_at', { withTimezone: true }).notNull().defaultNow(),
  delete_after: timestamp('delete_after', { withTimezone: true }).notNull(),
}, t => [index('account_closures_due').on(t.delete_after)]);

/** Tables that hold one person's rows. Each has row-level security on `user_id`. */
/**
 * The north star (Phase 30): moves finished per week, as a tally. Each row counts how many phones on a platform
 * finished `moves` moves in `week`. It holds no person: no user, device, address or time beyond the ISO week, so
 * it has no row-level security, like the caches. Phones send it only when the person switches it on.
 */
export const weeklyMoves = pgTable('weekly_moves', {
  week: text('week').notNull(),
  platform: text('platform').notNull(),
  moves: integer('moves').notNull(),
  reports: integer('reports').notNull().default(0),
}, t => [primaryKey({ columns: [t.week, t.platform, t.moves] })]);

export const userTables = [...Object.keys(phoneTables), 'devices', 'sync_ops', 'oauth_tokens', 'ai_usage', 'files'] as const;
