import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, useColorScheme } from 'react-native';
import { Uniwind } from 'uniwind';
import { setFeedbackPrefs } from '@/design/feedback';
import { setSentenceIcons } from '@/design/sentenceIcons';
import { engineSnapshot, seed, seedAim, seedMeal, seedPeople, seedProfile, seedPulseLog, seedRecords, seedKnownRecords, seedKnowledge, type ChiefAim, type FiledRecord, type MealItem, type MemoryEntry, seedMemoryCategories } from './seed';
import { openProjectionStorage } from './persistence';
import { removeAttachmentCopy } from '@/services/attachments';
import { removeProfilePhoto } from '@/services/profilePhoto';
import type { ProjectionStorage } from './persistence.types';
import type { QueuedAi } from '@/services/aiQueue';
import { emptyHealth, type HealthState } from '@/services/health/ingest';
import type { UserProfile } from '@life/core/types';
import { emptyBrainState, type BrainState } from '@life/brain';
import { emptyLoops, type LoopsState } from '@life/core';
import { confirmBrainRecords } from '@/services/brainState';
import { currentTransport } from '@/services/syncTransport';
import { onConnectionBack } from '@/services/connection';
import { lastBackgroundWrite } from '@/services/backgroundMark';
import { SHOW_SAMPLES } from './sample';
import { emptyLife, type LifeContent } from './empty';

export type SeedData = {
  brain: BrainState;
  profile: UserProfile; onboardingDone: boolean; aim: ChiefAim | null; records: FiledRecord[]; proposals: FiledRecord[]; knowledge: typeof seedKnowledge;
  completed: string[]; missionSteps: Record<string, boolean>; selectedMission: string;
  pulseLog: { at: string; moodId: string; x: number; y: number }[];
  people: typeof seedPeople; meal: MealItem[]; mealLogged: boolean; meals: { id: string; name: string; at: string; items: MealItem[]; day?: string; photo?: string; via?: 'photo' | 'said' | 'scan' | 'search' | 'saved' | 'quick' | 'menu' | 'label' | 'plan'; from?: string }[];
  habits: typeof seed.habits; journal: string[]; weightKg: number; heightCm: number; waistCm: number;
  learned: string[]; memories: MemoryEntry[];
  /** AI requests waiting for a connection (services/aiQueue.ts). Kept on this phone only. */
  aiQueue: QueuedAi[];
  /** Health readings, one row per day (services/health/ingest.ts). Kept on this phone only. */
  health: HealthState;
  prefs: { dark: boolean; sounds: boolean; haptics: boolean; handDrawn: boolean; hideNumbers: boolean; hideBalances: boolean; glimpses: boolean; followMood: boolean; look: 'mix' | 'places'; notifications: boolean; privateMode: boolean; addback: 'None' | 'Half' | 'All'; /** Small icons beside key words in sentences; off shows words only. */ sentenceIcons: boolean };
  flags: Record<string, boolean>; choices: Record<string, string>; drafts: Record<string, string>;
  /** The three core loops: plans by day, step ticks, check-in style and what counts as a win (`state/loops.ts`). */
  loops: LoopsState;
};
/** Ama's life, for development and preview builds only, so every screen can be seen filled in. */
const sampleLife: LifeContent = {
  profile: seedProfile, aim: seedAim, records: seedKnownRecords, proposals: seedRecords, knowledge: seedKnowledge, selectedMission: 'uk-hmrc-tax-code', pulseLog: seedPulseLog, people: seedPeople,
  meal: seedMeal, habits: seed.habits, weightKg: seed.body.weightKg, heightCm: seed.body.heightCm, waistCm: seed.body.waistCm,
  memories: [{ id: 'rent', text: 'Your rent goes up in March.', source: 'From your talk · 12 Nov', category: 'Money' }, { id: 'kofi', text: 'Kofi loves cooking.', source: 'From your chat · 9 Nov', category: 'People' }, { id: 'aim', text: 'You’re saving for your own front door.', source: 'Your Aim · 2 Nov', category: 'Money' }],
};
const initial: SeedData = {
  brain: emptyBrainState(),
  // Release builds start empty (state/empty.ts); development and preview builds start with Ama's life.
  ...(SHOW_SAMPLES ? sampleLife : emptyLife()),
  onboardingDone: false, completed: [], missionSteps: {}, mealLogged: false, meals: [], journal: [], learned: [],
  aiQueue: [],
  health: emptyHealth(),
  prefs: { dark: true, sounds: true, haptics: true, handDrawn: false, hideNumbers: false, hideBalances: false, glimpses: true, followMood: true, look: 'mix', notifications: true, privateMode: false, addback: 'Half', sentenceIcons: true },
  flags: {}, choices: {}, drafts: {}, loops: emptyLoops(),
};
type SeedContextValue = {
  data: SeedData; hydrated: boolean; storageError: boolean; storageMode: ProjectionStorage['mode'] | null;
  /**
   * Goes up each time `data` is read back from storage (opening, what sync or background work brought in, a reset)
   * rather than changed on this phone, so anything that watches for changes made here can tell the two apart.
   */
  loads: number;
  retryStorage: () => void; exportEverything: () => Promise<unknown>;
  /** Erases this life. `thisPhoneOnly` once the account has been closed on the server, so nothing is queued for it. */
  reset: (options?: { thisPhoneOnly?: boolean }) => Promise<boolean>;
  set: (patch: Partial<SeedData>) => void;
  update: (apply: (current: SeedData) => SeedData) => void;
  pref: <K extends keyof SeedData['prefs']>(key: K, value: SeedData['prefs'][K]) => void;
  flag: (key: string, value?: boolean) => void; choose: (key: string, value: string) => void; draft: (key: string, value: string) => void;
  confirmRecords: () => void; engine: ReturnType<typeof engineSnapshot>;
  /**
   * After sign-in, then sync and reload. `restore` (Welcome back, on a phone with nothing of its own) clears this
   * phone first so the account's life comes back whole; otherwise this phone's things merge into the account.
   */
  joinAccount: (accountId: string, options: { restore: boolean }) => Promise<{ setUp: boolean; switched: boolean }>;
  /** The account this phone's life belongs to, or null before anyone has signed in on it (fix F-43). */
  accountOnPhone: () => Promise<string | null>;
  /** Pushes and pulls now (also runs when the app comes to the front and a few seconds after each change). */
  syncNow: () => Promise<void>;
};
/** Fills in anything a saved projection lacks from the defaults. Also used by background work (Phase 29). */
export function hydrateSeed(loaded: unknown): SeedData { return hydrate(loaded); }
function hydrate(loaded: unknown): SeedData {
  if (loaded !== null && (typeof loaded !== 'object' || Array.isArray(loaded))) throw new Error('Invalid local projection');
  const saved = (loaded ?? {}) as Partial<SeedData>;
  return { ...initial, ...saved, health: { ...emptyHealth(), ...saved.health }, memories: (saved.memories ?? initial.memories).map(memory => ({ ...memory, category: memory.category ?? seedMemoryCategories[memory.id] })), prefs: { ...initial.prefs, ...saved.prefs }, knowledge: { ...initial.knowledge, ...saved.knowledge, areas: { ...initial.knowledge.areas, ...saved.knowledge?.areas } } };
}
const SYNC_AFTER_CHANGE_MS = 3000;
const Context = createContext<SeedContextValue | null>(null);

export function SeedProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [data, setData] = useState(initial), [hydrated, setHydrated] = useState(false), [loads, setLoads] = useState(0);
  const [storageError, setStorageError] = useState(false), [storageMode, setStorageMode] = useState<ProjectionStorage['mode'] | null>(null), [retry, setRetry] = useState(0);
  const storage = useRef<ProjectionStorage | null>(null), writes = useRef<Promise<void>>(Promise.resolve());
  const latest = useRef(data), lastQueued = useRef(''), revision = useRef(0), committed = useRef(0);
  const resetting = useRef<true | SeedData | null>(null);
  const needsReload = useRef(false), syncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The last background save this app has loaded (Phase 29), so coming to the front reloads anything newer.
  const seenBackground = useRef(0);
  latest.current = data;

  useEffect(() => {
    let active = true, opened: ProjectionStorage | null = null;
    setHydrated(false); setStorageError(false);
    void (async () => {
      await writes.current;
      opened = await openProjectionStorage();
      if (!active) { await opened.close(); return; }
      storage.current = opened;
      // Retry an uncommitted UI projection rather than losing it on recovery.
      if (revision.current > committed.current) {
        await opened.save(latest.current);
        committed.current = revision.current;
      }
      seenBackground.current = await lastBackgroundWrite();
      const next = hydrate(await opened.load());
      if (!active) return;
      lastQueued.current = JSON.stringify(next);
      latest.current = next; setData(next); setLoads(n => n + 1); setStorageMode(opened.mode); setHydrated(true);
      void syncNow();
    })().catch(() => { if (active) setStorageError(true); });
    return () => {
      active = false; storage.current = null;
      if (opened) { const closing = opened; writes.current = writes.current.then(() => closing.close()).catch(() => {}); }
    };
  }, [retry]);

  useEffect(() => {
    Uniwind.setTheme((data.choices.appearance === 'System' ? systemScheme === 'dark' : data.prefs.dark) ? 'dark' : 'light');
    setFeedbackPrefs({ sound: data.prefs.sounds, haptics: data.prefs.haptics });
    setSentenceIcons(data.prefs.sentenceIcons !== false); // saved lives from before the switch keep their icons
  }, [data.prefs, data.choices.appearance, systemScheme]);

  useEffect(() => {
    if (!hydrated || storageError || !storage.current) return;
    if (resetting.current) {
      if (resetting.current === data) resetting.current = null;
      return; // Never repopulate a deleted database from demo defaults.
    }
    const serialized = JSON.stringify(data);
    if (serialized === lastQueued.current) return;
    lastQueued.current = serialized;
    const target = storage.current, snapshot = data, version = ++revision.current;
    writes.current = writes.current.then(async () => {
      await target.save(snapshot);
      committed.current = version;
      if (needsReload.current) await reload(target);
    }).catch(() => setStorageError(true));
    if (syncTimer.current) clearTimeout(syncTimer.current);
    syncTimer.current = setTimeout(() => { void syncNow(); }, SYNC_AFTER_CHANGE_MS);
  }, [data, hydrated, storageError]);

  // Sync whenever the app comes back to the front, and the moment the phone is back online (fix F-46).
  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => { if (state === 'active') { void reloadAfterBackground(); void syncNow(); } });
    const stopWatching = onConnectionBack(() => { void syncNow(); });
    return () => { subscription.remove(); stopWatching(); if (syncTimer.current) clearTimeout(syncTimer.current); };
  }, []);

  /** Shows what sync brought in. Waits if the person has unsaved changes, so nothing they just did is lost. */
  async function reload(target: ProjectionStorage, force = false) {
    if (!force && revision.current !== committed.current) { needsReload.current = true; return; }
    needsReload.current = false;
    const next = hydrate(await target.load());
    if (storage.current !== target) return;
    latest.current = next; setData(next); setLoads(n => n + 1);
  }
  /** Background work saved while the app was away: show what it brought in rather than writing over it. */
  async function reloadAfterBackground() {
    const at = await lastBackgroundWrite(), target = storage.current;
    if (!target || at <= seenBackground.current) return;
    seenBackground.current = at;
    writes.current = writes.current.then(() => reload(target)).catch(() => {});
  }
  /** The network part runs beside the local saves, never in their queue, so a slow connection can't hold up a save. */
  async function syncNow() {
    const target = storage.current;
    if (!target || target.mode !== 'sqlite' || resetting.current) return;
    try {
      const transport = await currentTransport();
      if (!transport) return;
      const { applied } = await target.sync(transport);
      if (applied > 0) writes.current = writes.current.then(() => reload(target)).catch(() => {});
    } catch { /* Offline or signed out: the outbox keeps everything for the next try. */ }
  }

  const engine = useMemo(() => engineSnapshot(data.profile, data.completed), [data.profile, data.completed]);
  const value: SeedContextValue = {
    data, hydrated, storageError, storageMode, engine, loads,
    retryStorage: () => setRetry(value => value + 1),
    exportEverything: async () => { await writes.current; if (!storage.current) throw new Error('Local data unavailable'); return storage.current.exportEverything(); },
    set: patch => setData(current => {
      const next = { ...current, ...patch };
      if (patch.records && !patch.knowledge) next.knowledge = { ...current.knowledge, recordCount: current.knowledge.recordCount + patch.records.filter(record => record.status === 'confirmed').length - current.records.filter(record => record.status === 'confirmed').length };
      return next;
    }),
    update: apply => setData(apply),
    pref: (key, v) => setData(d => ({ ...d, prefs: { ...d.prefs, [key]: v } })),
    flag: (key, v) => setData(d => ({ ...d, flags: { ...d.flags, [key]: v ?? !d.flags[key] } })),
    choose: (key, v) => setData(d => ({ ...d, choices: { ...d.choices, [key]: v } })),
    draft: (key, v) => setData(d => ({ ...d, drafts: { ...d.drafts, [key]: v } })),
    confirmRecords: () => setData(d => {
      const confirmedBrain = confirmBrainRecords(d);
      const accepted = d.proposals.filter(record => record.status !== 'removed').map(record => ({ ...record, status: 'confirmed' as const }));
      if (!accepted.length) return { ...d, proposals: [] };
      const records = [...new Map([...d.records, ...accepted].map(record => [record.id, record])).values()];
      const fromBrain = accepted.some(record => 'brainField' in record);
      return { ...d, brain: confirmedBrain.brain, memories: confirmedBrain.memories, records, proposals: [], knowledge: { ...d.knowledge, overall: fromBrain ? d.knowledge.overall : Math.max(d.knowledge.overall, 81), areas: fromBrain ? d.knowledge.areas : Object.fromEntries(Object.entries(d.knowledge.areas).map(([area, value]) => [area, Math.min(98, value + Math.max(0, 81 - d.knowledge.overall))])) as typeof seedKnowledge.areas, recordCount: d.knowledge.recordCount + accepted.filter(record => !d.records.some(existing => existing.id === record.id && existing.status === 'confirmed')).length }, profile: accepted.reduce((profile, record) => ({ ...profile, ...record.profilePatch }), d.profile) };
    }),
    joinAccount: async (accountId, { restore }) => {
      await writes.current;
      const target = storage.current;
      if (!target || target.mode !== 'sqlite') return { setUp: latest.current.onboardingDone, switched: false };
      const before = latest.current;
      const { switched } = await target.adoptAccount(accountId, restore);
      if (switched) {
        // The other account's files on this phone go with its rows: chat attachments and the profile photo.
        for (const thread of before.brain.conversations) for (const attachment of thread.attachments) await removeAttachmentCopy(attachment).catch(() => {});
        await removeProfilePhoto().catch(() => {});
      }
      try { const transport = await currentTransport(); if (transport) await target.sync(transport); } catch { /* Pulled next time. */ }
      await (writes.current = writes.current.then(() => reload(target, true)));
      return { setUp: latest.current.onboardingDone, switched };
    },
    accountOnPhone: async () => storage.current?.mode === 'sqlite' ? storage.current.accountOnPhone() : null,
    syncNow,
    reset: async options => {
      if (!storage.current || resetting.current) return false;
      resetting.current = true;
      try {
        await writes.current;
        for (const thread of latest.current.brain.conversations) for (const attachment of thread.attachments) await removeAttachmentCopy(attachment);
        // Your photo lives beside the database, on this phone only, so erasing takes it too.
        await removeProfilePhoto().catch(() => {});
        await storage.current.clear(options?.thisPhoneOnly ? 'this-phone' : 'everywhere');
        const next = { ...initial, onboardingDone: false };
        lastQueued.current = JSON.stringify(next); revision.current = 0; committed.current = 0;
        resetting.current = next; latest.current = next; setData(next); setLoads(n => n + 1);
        return true;
      } catch { resetting.current = null; setStorageError(true); return false; }
    },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSeed() { const value = useContext(Context); if (!value) throw new Error('useSeed needs SeedProvider'); return value; }
