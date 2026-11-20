import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Uniwind } from 'uniwind';
import { setFeedbackPrefs } from '@/design/feedback';
import { engineSnapshot, seed, seedAim, seedMeal, seedPeople, seedProfile, seedPulseLog, seedRecords, seedKnownRecords, seedKnowledge, type ChiefAim, type FiledRecord, type MealItem, type MemoryEntry, seedMemoryCategories } from './seed';
import { openProjectionStorage } from './persistence';
import { removeAttachmentCopy } from '@/services/attachments';
import type { ProjectionStorage } from './persistence.types';
import type { UserProfile } from '@life/core/types';
import { emptyBrainState, type BrainState } from '@life/brain';
import { confirmBrainRecords } from '@/services/brainState';

export type SeedData = {
  brain: BrainState;
  profile: UserProfile; onboardingDone: boolean; aim: ChiefAim | null; records: FiledRecord[]; proposals: FiledRecord[]; knowledge: typeof seedKnowledge;
  completed: string[]; missionSteps: Record<string, boolean>; selectedMission: string;
  pulseLog: { at: string; moodId: string; x: number; y: number }[];
  people: typeof seedPeople; meal: MealItem[]; mealLogged: boolean; meals: { id: string; name: string; at: string; items: MealItem[]; day?: string; photo?: string; via?: 'photo' | 'said' | 'scan' | 'search' | 'saved' | 'quick' | 'menu' | 'label' | 'plan'; from?: string }[];
  habits: typeof seed.habits; journal: string[]; weightKg: number; heightCm: number; waistCm: number;
  learned: string[]; memories: MemoryEntry[];
  prefs: { dark: boolean; sounds: boolean; haptics: boolean; handDrawn: boolean; hideNumbers: boolean; hideBalances: boolean; glimpses: boolean; followMood: boolean; look: 'mix' | 'places'; notifications: boolean; privateMode: boolean; addback: 'None' | 'Half' | 'All' };
  flags: Record<string, boolean>; choices: Record<string, string>; drafts: Record<string, string>;
};
const initial: SeedData = {
  brain: emptyBrainState(),
  profile: seedProfile, onboardingDone: false, aim: seedAim, records: seedKnownRecords, proposals: seedRecords, knowledge: seedKnowledge, completed: [], missionSteps: {}, selectedMission: 'uk-hmrc-tax-code', pulseLog: seedPulseLog, people: seedPeople,
  meal: seedMeal, mealLogged: false, meals: [], habits: seed.habits, journal: [], weightKg: seed.body.weightKg, heightCm: seed.body.heightCm, waistCm: seed.body.waistCm, learned: [],
  memories: [{ id: 'rent', text: 'Your rent goes up in March.', source: 'From your talk · 12 Nov', category: 'Money' }, { id: 'kofi', text: 'Kofi loves cooking.', source: 'From your chat · 9 Nov', category: 'People' }, { id: 'aim', text: 'You’re saving for your own front door.', source: 'Your Aim · 2 Nov', category: 'Money' }],
  prefs: { dark: true, sounds: true, haptics: true, handDrawn: false, hideNumbers: false, hideBalances: false, glimpses: true, followMood: true, look: 'mix', notifications: true, privateMode: false, addback: 'Half' },
  flags: {}, choices: {}, drafts: {},
};
type SeedContextValue = {
  data: SeedData; hydrated: boolean; storageError: boolean; storageMode: ProjectionStorage['mode'] | null;
  retryStorage: () => void; exportEverything: () => Promise<unknown>; reset: () => Promise<boolean>;
  set: (patch: Partial<SeedData>) => void;
  update: (apply: (current: SeedData) => SeedData) => void;
  pref: <K extends keyof SeedData['prefs']>(key: K, value: SeedData['prefs'][K]) => void;
  flag: (key: string, value?: boolean) => void; choose: (key: string, value: string) => void; draft: (key: string, value: string) => void;
  confirmRecords: () => void; engine: ReturnType<typeof engineSnapshot>;
};
const Context = createContext<SeedContextValue | null>(null);

export function SeedProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [data, setData] = useState(initial), [hydrated, setHydrated] = useState(false);
  const [storageError, setStorageError] = useState(false), [storageMode, setStorageMode] = useState<ProjectionStorage['mode'] | null>(null), [retry, setRetry] = useState(0);
  const storage = useRef<ProjectionStorage | null>(null), writes = useRef<Promise<void>>(Promise.resolve());
  const latest = useRef(data), lastQueued = useRef(''), revision = useRef(0), committed = useRef(0);
  const resetting = useRef<true | SeedData | null>(null);
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
      const loaded = await opened.load();
      if (loaded !== null && (typeof loaded !== 'object' || Array.isArray(loaded))) throw new Error('Invalid local projection');
      const saved = (loaded ?? {}) as Partial<SeedData>;
      const next: SeedData = { ...initial, ...saved, memories: (saved.memories ?? initial.memories).map(memory => ({ ...memory, category: memory.category ?? seedMemoryCategories[memory.id] })), prefs: { ...initial.prefs, ...saved.prefs }, knowledge: { ...initial.knowledge, ...saved.knowledge, areas: { ...initial.knowledge.areas, ...saved.knowledge?.areas } } };
      if (!active) return;
      lastQueued.current = JSON.stringify(next);
      latest.current = next; setData(next); setStorageMode(opened.mode); setHydrated(true);
    })().catch(() => { if (active) setStorageError(true); });
    return () => {
      active = false; storage.current = null;
      if (opened) { const closing = opened; writes.current = writes.current.then(() => closing.close()).catch(() => {}); }
    };
  }, [retry]);

  useEffect(() => {
    Uniwind.setTheme((data.choices.appearance === 'System' ? systemScheme === 'dark' : data.prefs.dark) ? 'dark' : 'light');
    setFeedbackPrefs({ sound: data.prefs.sounds, haptics: data.prefs.haptics });
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
    }).catch(() => setStorageError(true));
  }, [data, hydrated, storageError]);

  const engine = useMemo(() => engineSnapshot(data.profile, data.completed), [data.profile, data.completed]);
  const value: SeedContextValue = {
    data, hydrated, storageError, storageMode, engine,
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
    reset: async () => {
      if (!storage.current || resetting.current) return false;
      resetting.current = true;
      try {
        await writes.current;
        for (const thread of latest.current.brain.conversations) for (const attachment of thread.attachments) await removeAttachmentCopy(attachment);
        await storage.current.clear();
        const next = { ...initial, onboardingDone: false };
        lastQueued.current = JSON.stringify(next); revision.current = 0; committed.current = 0;
        resetting.current = next; latest.current = next; setData(next);
        return true;
      } catch { resetting.current = null; setStorageError(true); return false; }
    },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSeed() { const value = useContext(Context); if (!value) throw new Error('useSeed needs SeedProvider'); return value; }
