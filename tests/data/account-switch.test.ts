import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { LifeDataStore, type OutboxOp, type SyncTransport } from '../../apps/mobile/src/data/store';
import { memoryDriver } from '../support/sqlite';

/**
 * Fix F-43: signing in to a second account on a phone that holds another account's life never merges the two. The
 * other account's copy on this phone is erased first, nothing is queued for either account, and the new account's life
 * comes down whole. Signing in to the same account again, or for the first time, works as before.
 */
const store = async () => new LifeDataStore(memoryDriver().driver, 'phone').initialise();
const life = (name: string) => ({
  profile: { name }, prefs: {}, records: [{ id: 'rent', kind: 'fact', label: `${name}'s rent`, area: 'money', status: 'confirmed', source: { type: 'talk' } }],
  meals: [{ id: 'oats', name: `${name}'s oats`, at: '08:00', items: [] }], habits: [], people: [{ id: 'kofi', name: `${name}'s brother`, relation: 'Brother' }],
  learned: [], memories: [], completed: [], missionSteps: {}, choices: {}, flags: {}, drafts: { note: `${name}'s draft` }, onboardingDone: true,
});
type Life = ReturnType<typeof life>;
const pushes = (into: OutboxOp[][]): SyncTransport => ({ push: async (_u, ops) => { into.push(ops); return { acknowledged: ops.map(o => o.id) }; }, pull: async () => ({ changes: [], cursor: null }) });

describe('a second account on the same phone', () => {
  test('the first account’s life leaves the phone instead of merging into the second', async () => {
    const s = await store();
    await s.commitProjection(life('Ama'));
    expect(await s.adoptAccount('account-a', { restore: false })).toEqual({ switched: false });
    await s.sync(pushes([]));
    // Ama keeps using the phone, then her session runs out with a change not yet backed up.
    await s.commitProjection({ ...life('Ama'), meals: [{ id: 'oats', name: 'Ama’s porridge', at: '08:00', items: [] }] });
    expect((await s.pending()).length).toBeGreaterThan(0);

    // Someone signs in with another account.
    expect(await s.adoptAccount('account-b', { restore: false })).toEqual({ switched: true });
    expect(await s.accountOnPhone()).toBe('account-b');
    // Nothing of Ama's is left to read, or queued to send to the new account.
    expect(await s.loadProjection()).toBeNull();
    expect(await s.pending()).toEqual([]);
    const sent: OutboxOp[][] = [];
    await s.sync(pushes(sent));
    expect(sent.flat()).toEqual([]);
    const archive = await s.exportEverything() as { tables: Record<string, unknown[]>; local: { key: string }[] };
    expect(Object.values(archive.tables).flat()).toEqual([]);
    expect(JSON.stringify(archive)).not.toContain('Ama');
  });

  test('the second account then sets up or restores on a clean phone', async () => {
    const s = await store();
    await s.commitProjection(life('Ama'));
    await s.adoptAccount('account-a', { restore: false });
    await s.adoptAccount('account-b', { restore: false });
    await s.commitProjection(life('Kofi'));
    const loaded = await s.loadProjection<Life>();
    expect(loaded?.profile.name).toBe('Kofi');
    expect(loaded?.meals.map(m => m.name)).toEqual(["Kofi's oats"]);
    expect(loaded?.drafts).toEqual({ note: "Kofi's draft" });
  });

  test('the same account signing in again keeps everything', async () => {
    const s = await store();
    await s.commitProjection(life('Ama'));
    await s.adoptAccount('account-a', { restore: false });
    expect(await s.adoptAccount('account-a', { restore: true })).toEqual({ switched: false });
    expect((await s.loadProjection<Life>())?.meals.map(m => m.name)).toEqual(["Ama's oats"]);
  });

  test('a first sign-in keeps what was set up on this phone', async () => {
    const s = await store();
    await s.commitProjection(life('Ama'));
    expect(await s.accountOnPhone()).toBeNull();
    expect(await s.adoptAccount('account-a', { restore: false })).toEqual({ switched: false });
    expect((await s.loadProjection<Life>())?.profile.name).toBe('Ama');
  });
});

describe('the screens ask first', () => {
  const root = join(import.meta.dir, '../..');
  const read = (path: string) => readFileSync(join(root, 'apps/mobile/src', path), 'utf8');

  test('both ways of signing in check whose life is on the phone before joining', () => {
    const firstopen = read('screens/v26/firstopen.tsx'), states = read('screens/v26/states.tsx');
    expect(firstopen).toContain("if (result.mode === 'account' && !await confirmAccountSwitch(accountOnPhone, result.data.userId)) { go('ways'); return; }");
    expect(states).toContain('if (!await confirmAccountSwitch(accountOnPhone, result.data.userId)) return;');
  });

  test('Not now signs the new account out and changes nothing', () => {
    const firstopen = read('screens/v26/firstopen.tsx');
    expect(firstopen).toContain('if (!current || current === signingIn) return true;');
    expect(firstopen).toContain('if (!go) await signOut().catch(() => {});');
    expect(firstopen).toContain('anything it hadn’t backed up yet goes.');
  });

  test('the other account’s files on the phone go too', () => {
    const provider = read('state/SeedProvider.tsx');
    expect(provider).toContain('const { switched } = await target.adoptAccount(accountId, restore);');
    expect(provider).toContain('await removeProfilePhoto().catch(() => {});');
  });
});
