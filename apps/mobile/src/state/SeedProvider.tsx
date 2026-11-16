import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Uniwind } from 'uniwind';
import { setFeedbackPrefs } from '@/design/feedback';
import { engineSnapshot, seed, seedAim, seedMeal, seedPeople, seedProfile, seedRecords, type ChiefAim, type FiledRecord, type MealItem } from './seed';
import type { UserProfile } from '@life/core/types';

type SeedData = {
  profile: UserProfile; onboardingDone: boolean; aim: ChiefAim | null; records: FiledRecord[];
  completed: string[]; missionSteps: Record<string, boolean>; selectedMission: string;
  pulseLog: { at: string; moodId: string; x: number; y: number }[];
  people: typeof seedPeople; meal: MealItem[]; mealLogged: boolean; meals: { id: string; name: string; at: string; items: MealItem[] }[];
  habits: typeof seed.habits; journal: string[]; weightKg: number; heightCm: number; waistCm: number;
  learned: string[]; memories: { id: string; text: string; source: string }[];
  prefs: { dark: boolean; sounds: boolean; haptics: boolean; handDrawn: boolean; hideNumbers: boolean; hideBalances: boolean; glimpses: boolean; followMood: boolean; look: 'mix' | 'places'; notifications: boolean; privateMode: boolean; addback: 'None' | 'Half' | 'All' };
  flags: Record<string, boolean>; choices: Record<string, string>; drafts: Record<string, string>;
};
const initial: SeedData = {
  profile: seedProfile, onboardingDone: false, aim: seedAim, records: seedRecords, completed: [], missionSteps: {}, selectedMission: 'uk-hmrc-tax-code', pulseLog: [], people: seedPeople,
  meal: seedMeal, mealLogged: false, meals: [], habits: seed.habits, journal: [], weightKg: seed.body.weightKg, heightCm: seed.body.heightCm, waistCm: seed.body.waistCm, learned: [],
  memories: [{ id: 'rent', text: 'Your rent goes up in March.', source: 'From your talk · 12 Nov' }, { id: 'kofi', text: 'Kofi loves cooking.', source: 'From your chat · 9 Nov' }, { id: 'aim', text: 'You’re saving for your own front door.', source: 'Your Aim · 2 Nov' }],
  prefs: { dark: true, sounds: true, haptics: true, handDrawn: false, hideNumbers: false, hideBalances: false, glimpses: true, followMood: true, look: 'mix', notifications: true, privateMode: false, addback: 'Half' },
  flags: {}, choices: {}, drafts: {},
};
type SeedContextValue = { data: SeedData; hydrated: boolean; set: (patch: Partial<SeedData>) => void; pref: <K extends keyof SeedData['prefs']>(key: K, value: SeedData['prefs'][K]) => void; flag: (key: string, value?: boolean) => void; choose: (key: string, value: string) => void; draft: (key: string, value: string) => void; confirmRecords: () => void; reset: () => void; engine: ReturnType<typeof engineSnapshot> };
const Context = createContext<SeedContextValue | null>(null);
const KEY = 'life_track_a_v17';
export function SeedProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const [data, setData] = useState(initial), [hydrated, setHydrated] = useState(false);
  useEffect(() => { let active = true; AsyncStorage.getItem(KEY).then(raw => { if (!active) return; if (raw) { try { const saved = JSON.parse(raw); setData({ ...initial, ...saved, prefs: { ...initial.prefs, ...saved.prefs } }); } catch { /* Keep the safe local fixtures. */ } } }).finally(() => { if (active) setHydrated(true); }); return () => { active = false; }; }, []);
  useEffect(() => { Uniwind.setTheme((data.choices.appearance === 'System' ? systemScheme === 'dark' : data.prefs.dark) ? 'dark' : 'light'); setFeedbackPrefs({ sound: data.prefs.sounds, haptics: data.prefs.haptics }); if (hydrated) AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {}); }, [data, hydrated, systemScheme]);
  const engine = useMemo(() => engineSnapshot(data.profile, data.completed), [data.profile, data.completed]);
  const value: SeedContextValue = {
    data, hydrated, engine, set: patch => setData(d => ({ ...d, ...patch })),
    pref: (key, v) => setData(d => ({ ...d, prefs: { ...d.prefs, [key]: v } })),
    flag: (key, v) => setData(d => ({ ...d, flags: { ...d.flags, [key]: v ?? !d.flags[key] } })),
    choose: (key, v) => setData(d => ({ ...d, choices: { ...d.choices, [key]: v } })),
    draft: (key, v) => setData(d => ({ ...d, drafts: { ...d.drafts, [key]: v } })),
    confirmRecords: () => setData(d => ({ ...d, records: d.records.map(r => r.status === 'removed' ? r : { ...r, status: 'confirmed' }), profile: d.records.filter(r => r.status !== 'removed').reduce((p, r) => ({ ...p, ...r.profilePatch }), d.profile) })),
    reset: () => { setData({ ...initial, onboardingDone: false }); },
  };
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useSeed() { const value = useContext(Context); if (!value) throw new Error('useSeed needs SeedProvider'); return value; }
