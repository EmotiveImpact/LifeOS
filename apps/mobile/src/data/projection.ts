import type { LifeDataStore } from './store';
import { object } from './store';
import type { TableName } from './schema';
import { digest, stableId } from './ids';

const domainKeys = new Set(['profile', 'weightKg', 'heightCm', 'waistCm', 'prefs', 'records', 'filedRecords', 'aim', 'chiefAim', 'meals', 'habits', 'people', 'learned', 'memories', 'completed', 'missionSteps', ...syncedSettings()]);
/** Choices, flags, the core loops' plans and ticks, and whether setup is done travel with the account inside the prefs row, so a restored phone has them. */
function syncedSettings() { return ['choices', 'flags', 'onboardingDone', 'loops']; }
const array = (value: unknown): Record<string, unknown>[] => Array.isArray(value) ? value.map(object) : [];
const dataObject = (value: unknown) => value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
const uid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const keyFor = (table: TableName, key: string) => `${table}:${key}`;
const today = () => new Date().toISOString().slice(0, 10);
const dayOffset = (day: string, offset: number) => new Date(Date.parse(`${day}T12:00:00.000Z`) + offset * 86400000).toISOString().slice(0, 10);

async function commit(store: LifeDataStore, raw: unknown, importing: boolean, sourceKey: string) {
  const input = object(typeof raw === 'string' ? JSON.parse(raw) : raw);
  if (!input.profile || typeof input.profile !== 'object') throw new Error('Legacy projection must include a profile');
  return store.atomic(async tx => {
    if (importing && await tx.readLocal('legacy-imported')) return false;
    const ids = await tx.readLocal<Record<string, string>>('projection-ids') ?? {};
    const prior = await tx.readLocal<string[]>('projection-entities') ?? [];
    const touched: string[] = [];
    const previousHabits = await tx.readLocal<Record<string, unknown[]>>('projection-habit-logs') ?? {};
    // The same screen entity has the same id on every phone of an account (`ids.ts`).
    const namespace = await tx.readLocal<string>('account-id') ?? store.userId;
    // The screen saves its whole state at once, so an entity the person didn't touch still arrives with the value
    // they last saw. Writing only what changed since the last save keeps a newer edit pulled from another phone.
    const seen = await tx.readLocal<Record<string, string>>('projection-hashes') ?? {}, nextSeen: Record<string, string> = {};
    const entity = async (table: TableName, legacyId: string, fields: Record<string, unknown>) => {
      const key = keyFor(table, legacyId);
      const id = ids[key] ?? (uid.test(legacyId) ? legacyId : stableId(namespace, table, legacyId));
      const sig = digest(JSON.stringify({ ...fields, deleted_at: fields.deleted_at ? true : null }));
      nextSeen[key] = sig; touched.push(key);
      if (!importing && seen[key] === sig && await tx.has(table, id)) { ids[key] = id; return id; }
      const row = await tx.put(table, { ...fields, id });
      ids[key] = row.id; return row.id;
    };
    const p = object(input.profile), prefs = dataObject(input.prefs), choices = dataObject(input.choices);
    await entity('profile', 'main', { name: p.name ?? null, date_of_birth: p.dateOfBirth ?? null, where: { city: p.city, country: p.country, postcode: p.postcode }, work: { status: p.workStatus, annualIncome: p.annualIncome }, household: p.householdSize ?? null, pay_day: p.payDay ?? null, chronotype: p.chronotype ?? null, values: p.values ?? null, big_five: p.bigFive ?? null, level: p.earnedLevel ?? null, chapter: p.chapter ?? null, core_fields: p });
    await entity('body_profile', 'main', { height_cm: input.heightCm ?? null, weight_kg: input.weightKg ?? null, waist_cm: input.waistCm ?? null, body_fat_pct: choices['body-fat'] ? Number(choices['body-fat']) : null, sex_at_birth: choices['sex-at-birth'] ?? null, activity_level: choices.activity ?? null, ethnicity_for_ranges: choices.ethnicity ?? null, units: { weight: choices['weight-unit'] ?? 'kg' } });
    const app = Object.fromEntries(syncedSettings().filter(key => input[key] !== undefined).map(key => [key, input[key]]));
    await entity('prefs', 'main', { look: prefs.look ?? null, sounds: Boolean(prefs.sounds), haptics: Boolean(prefs.haptics), hand_drawn: Boolean(prefs.handDrawn), hide_numbers: Boolean(prefs.hideNumbers), notifications: prefs.notifications ?? null, private_mode: Boolean(prefs.privateMode), fields: { ...prefs, app } });
    for (const fact of array(input.records ?? input.filedRecords)) {
      // Proposals are LOCAL draft UI state below; never become queued facts implicitly.
      if (fact.status !== 'confirmed' && fact.status !== 'removed') continue;
      await entity('record', String(fact.id), { kind: fact.kind ?? 'fact', fields: fact, source: fact.source ?? null, confidence: fact.confidence ?? null, deleted_at: fact.status === 'removed' ? new Date().toISOString() : null });
    }
    const aim = input.aim ?? input.chiefAim;
    if (aim) await entity('record', '__chief_aim__', { kind: 'goal', fields: { role: 'chief_aim', value: aim }, source: { type: 'local' } });
    for (const meal of array(input.meals)) await entity('food_entry', String(meal.id), { at: meal.at ?? null, items: meal.items ?? [], photo_ref: meal.photoRef ?? null, confirmed: true, fit_score: meal.fitScore ?? null, fields: { id: meal.id, name: meal.name, at: meal.at } });
    if (Object.keys(choices).some(k => k.startsWith('fuel-') || k === 'target-weight')) await entity('food_target', 'main', { goal: choices['fuel-goal'] ?? null, target_weight: choices['target-weight'] ? Number(choices['target-weight']) : null, pace: choices['fuel-pace'] ? Number(choices['fuel-pace']) : null, kcal: choices['fuel-kcal'] ? Number(choices['fuel-kcal']) : null, exercise_addback: prefs.addback ?? null });
    const nextHabitLogs: Record<string, unknown[]> = {};
    for (const h of array(input.habits)) {
      const legacyId = String(h.id), nativeId = await entity('habit', legacyId, { name: h.name ?? null, cue: h.cue ?? null, schedule: h.schedule ?? null, strength: h.strength ?? null, auto_complete: Boolean(h.autoComplete), fields: h });
      const logs: unknown[] = Array.isArray(h.last14) ? h.last14 : [];
      nextHabitLogs[legacyId] = logs;
      for (let i = 0; i < logs.length; i++) {
        if (typeof logs[i] !== 'boolean') continue;
        // Existing historical logs are never re-dated on a later UI autosave.
        if (!importing && i !== 13 || !importing && previousHabits[legacyId]?.[i] === logs[i]) continue;
        const date = dayOffset(today(), i - 13);
        await entity('habit_log', `${legacyId}:${date}`, { habit_id: nativeId, date, done: logs[i], source: { type: importing ? 'legacy' : 'local' } });
      }
    }
    for (const person of array(input.people)) {
      const id = await entity('person', String(person.id), { name: person.name ?? null, relation: person.relation ?? null, contact_ref: person.contactRef ?? null, fields: person });
      if (person.date) {
        const kind = person.dateKind ?? (person.id === 'kwame' ? 'memorial' : person.id === 'sam' ? 'anniversary' : 'birthday');
        await entity('important_date', String(person.id), { person_id: id, date: person.date, kind, reminder: kind === 'memorial' ? null : person.reminder ?? null });
      }
    }
    for (const [i, topic] of (Array.isArray(input.learned) ? input.learned : []).entries()) await entity('learning_record', typeof topic === 'string' ? topic : String(i), { topic: typeof topic === 'string' ? topic : String(dataObject(topic).topic ?? ''), source: { type: 'local' } });
    for (const memory of array(input.memories)) await entity('memory', String(memory.id), { text: memory.text ?? null, source: typeof memory.source === 'string' ? { label: memory.source, ...(memory.category ? { category: memory.category } : {}), ...(memory.recordId ? { recordId: memory.recordId } : {}) } : { ...dataObject(memory.source), ...(memory.category ? { category: memory.category } : {}), ...(memory.recordId ? { recordId: memory.recordId } : {}) }, last_used: memory.lastUsed ?? null });
    const completed = new Set(Array.isArray(input.completed) ? input.completed.map(String) : []);
    const steps = dataObject(input.missionSteps);
    const missionIds = new Set([...completed, ...Object.keys(steps).map(k => k.replace(/-\d+$/, ''))]);
    for (const taskId of missionIds) {
      const id = await entity('mission', taskId, { stage: completed.has(taskId) ? 'cleared' : 'started', fields: { taskId, completed: completed.has(taskId) } });
      for (const [key, done] of Object.entries(steps).filter(([key]) => key.startsWith(`${taskId}-`))) await entity('mission_step', key, { mission_id: id, state: done ? 'done' : 'todo', fields: { key } });
    }
    const touchedSet = new Set(touched);
    for (const key of prior) {
      // History is append-only here; UI's 14-day window isn't a deletion request.
      if (touchedSet.has(key) || key.startsWith('habit_log:')) continue;
      const table = key.split(':')[0] as TableName;
      if (ids[key]) await tx.remove(table, ids[key]);
    }
    const local = Object.fromEntries(Object.entries(input).filter(([key]) => !domainKeys.has(key)));
    // Keep unconfirmed/removed drafts and non-domain display metadata only on device.
    local.recordDrafts = array(input.records ?? input.filedRecords).filter(r => r.status === 'proposed');
    await tx.local('projection-ui', local);
    await tx.local('projection-ids', ids);
    await tx.local('projection-entities', [...new Set([...touched, ...prior.filter(k => k.startsWith('habit_log:'))])]);
    await tx.local('projection-habit-logs', nextHabitLogs);
    await tx.local('projection-hashes', nextSeen);
    if (importing) { await tx.local('legacy-imported', true); await tx.local('legacy-source-key', sourceKey); }
    return true;
  });
}
/**
 * First sign-in on this phone. With nothing of its own yet (setup not finished), the phone is cleared so the
 * account's life comes back whole on the next pull. Otherwise its screen entities move to the account's ids, so they
 * merge with the same things on the account's other phones (newer edit wins) instead of sitting beside them.
 */
export async function adoptAccount(store: LifeDataStore, accountId: string, options: { restore: boolean }) {
  if (!accountId) throw new Error('An account id is required');
  if (await store.readLocal<string>('account-id') === accountId) return;
  if (options.restore) await store.clearForRestore();
  await store.atomic(async tx => {
    const ids = await tx.readLocal<Record<string, string>>('projection-ids') ?? {};
    // Parents first, so rows that point at them follow to the new ids.
    const order = (key: string) => ['habit:', 'person:', 'mission:'].some(p => key.startsWith(p)) ? 0 : 1;
    for (const key of Object.keys(ids).sort((a, b) => order(a) - order(b))) {
      const table = key.split(':')[0] as TableName, legacyId = key.slice(table.length + 1);
      if (uid.test(legacyId)) continue;
      const to = stableId(accountId, table, legacyId);
      await tx.move(table, ids[key], to);
      ids[key] = to;
    }
    await tx.local('projection-ids', ids);
    await tx.local('account-id', accountId);
  });
}
export const importLegacyProjection = (store: LifeDataStore, input: unknown, sourceKey = 'life_track_a_v17') => commit(store, input, true, sourceKey);
export async function commitProjection(store: LifeDataStore, input: unknown) { await commit(store, input, false, ''); }

/** Reconstruct the existing UI contract from domain rows. local_state is not a
 * second authoritative copy of profile, meals, facts, habits or people. */
export async function loadProjection<T>(store: LifeDataStore): Promise<T | null> {
  const archive = await store.exportEverything();
  const list = (table: TableName) => (archive.tables[table] ?? []).filter(r => !r.deleted_at);
  const profile = list('profile')[0];
  if (!profile) return null;
  const ui = dataObject(archive.local.find(v => v.key === 'projection-ui')?.value);
  const ids = dataObject(archive.local.find(v => v.key === 'projection-ids')?.value);
  const originalId = (table: TableName, id: string) => Object.entries(ids).find(([key, value]) => key.startsWith(`${table}:`) && value === id)?.[0].slice(table.length + 1) ?? id;
  const p = { ...dataObject(profile.core_fields), name: profile.name, householdSize: profile.household };
  const where = dataObject(profile.where), work = dataObject(profile.work);
  Object.assign(p, { city: where.city, country: where.country, ...(work.status !== undefined ? { workStatus: work.status } : {}), ...(work.annualIncome !== undefined ? { annualIncome: work.annualIncome } : {}) });
  const body = list('body_profile')[0], prefs = list('prefs')[0];
  const facts = (archive.tables.record ?? []).filter(r => dataObject(r.fields).role !== 'chief_aim').map(r => ({ ...dataObject(r.fields), id: dataObject(r.fields).id ?? r.id, kind: r.kind, source: r.source, status: r.deleted_at ? 'removed' : 'confirmed' }));
  const aim = list('record').find(r => dataObject(r.fields).role === 'chief_aim');
  const meals = list('food_entry').map(r => ({ ...dataObject(r.fields), id: dataObject(r.fields).id ?? r.id, name: dataObject(r.fields).name ?? 'Meal', at: r.at, items: r.items ?? [] }));
  const logs = list('habit_log');
  const habits = list('habit').map(r => ({ ...dataObject(r.fields), id: dataObject(r.fields).id ?? r.id, name: r.name, cue: r.cue, autoComplete: Boolean(r.auto_complete), last14: Array.from({ length: 14 }, (_, i) => { const log = logs.find(log => log.habit_id === r.id && log.date === dayOffset(today(), i - 13)); return log ? Boolean(log.done) : undefined; }) }));
  const dates = list('important_date');
  const people = list('person').map(r => { const date = dates.find(d => d.person_id === r.id); return { ...dataObject(r.fields), id: dataObject(r.fields).id ?? r.id, name: r.name, relation: r.relation, ...(date ? { date: date.date, dateKind: date.kind } : {}) }; });
  const missions = list('mission');
  const steps = Object.fromEntries(list('mission_step').map(r => [String(dataObject(r.fields).key ?? r.id), r.state === 'done']));
  const { app: synced, ...prefFields } = dataObject(prefs?.fields);
  const result = { ...ui, ...dataObject(synced), profile: p, weightKg: body?.weight_kg, heightCm: body?.height_cm, waistCm: body?.waist_cm,
    prefs: prefs ? { ...prefFields, look: prefs.look, sounds: Boolean(prefs.sounds), haptics: Boolean(prefs.haptics), handDrawn: Boolean(prefs.hand_drawn), hideNumbers: Boolean(prefs.hide_numbers), notifications: prefs.notifications, privateMode: Boolean(prefs.private_mode) } : {},
    records: [...facts, ...array(ui.recordDrafts)], aim: aim ? dataObject(aim.fields).value : null, meals, habits, people,
    learned: list('learning_record').map(r => r.topic), memories: list('memory').map(r => ({ id: originalId('memory', r.id), text: r.text, source: typeof r.source === 'string' ? r.source : typeof dataObject(r.source).label === 'string' ? dataObject(r.source).label : JSON.stringify(r.source ?? {}), category: dataObject(r.source).category, recordId: dataObject(r.source).recordId })),
    completed: missions.filter(r => dataObject(r.fields).completed).map(r => dataObject(r.fields).taskId), missionSteps: steps,
  };
  delete (result as Record<string, unknown>).recordDrafts;
  return result as T;
}
