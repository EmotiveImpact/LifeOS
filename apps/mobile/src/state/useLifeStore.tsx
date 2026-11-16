import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import { Uniwind } from 'uniwind';
import {
  computeIncomeBreakdown,
  computeLifeImpact,
  computeLifeLevelState,
  computeLifeScore,
  createInitialMessages,
  DEFAULT_HEALTH_SNAPSHOT,
  DEFAULT_PROFILE,
  DEFAULT_PULSE,
  DEFAULT_SUBSCRIPTIONS,
  getConnectedPortals,
  getCurrencySymbol,
  getEligibleTasks,
  partitionTasks,
  processLifeOSMessage,
  TASK_CATALOG,
} from '@life/core/engine';
import type {
  ActiveFunctionOverlay,
  ChatMessage,
  ConnectedPortal,
  IncomeBreakdown,
  LifeImpactSummary,
  LifeLevelState,
  LifeTask,
  ScoreBreakdown,
  UserProfile,
} from '@life/core/types';
import { buildWeeklyRecapDeck, type WeeklyRecapMetricCard } from '@life/core/weeklyRecap';
import { migrateLabResults } from '@life/core/health';

const STORAGE_PROFILE_KEY = 'lifeos_profile_v1';
const STORAGE_COMPLETED_KEY = 'lifeos_completed_v1';
const STORAGE_THEME_KEY = 'lifeos_theme_v1';

export type NativeSheetId =
  | null
  | 'health'
  | 'money'
  | 'levels'
  | 'growth-plan'
  | 'growth-checkins'
  | 'growth-learn'
  | 'today'
  | 'cashflow'
  | 'runway'
  | 'chat'
  | 'intake';

function sanitizeProfile(raw: Partial<UserProfile> | null): UserProfile {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return DEFAULT_PROFILE;
  return {
    ...DEFAULT_PROFILE,
    ...raw,
    countryCode:
      raw.countryCode && ['UK', 'US', 'DE', 'NG'].includes(raw.countryCode)
        ? raw.countryCode
        : DEFAULT_PROFILE.countryCode,
    workStatus: raw.workStatus ?? DEFAULT_PROFILE.workStatus,
    annualIncome:
      typeof raw.annualIncome === 'number' ? raw.annualIncome : DEFAULT_PROFILE.annualIncome,
    taxCode: raw.taxCode ?? DEFAULT_PROFILE.taxCode,
    pulse: raw.pulse ?? DEFAULT_PULSE,
    scannedDocIds: Array.isArray(raw.scannedDocIds) ? raw.scannedDocIds : [],
    answeredQuestionIds: Array.isArray(raw.answeredQuestionIds) ? raw.answeredQuestionIds : [],
    openedAccountIds: Array.isArray(raw.openedAccountIds)
      ? raw.openedAccountIds
      : DEFAULT_PROFILE.openedAccountIds,
    protectedPolicyIds: Array.isArray(raw.protectedPolicyIds)
      ? raw.protectedPolicyIds
      : DEFAULT_PROFILE.protectedPolicyIds,
    collectiveGoals: Array.isArray(raw.collectiveGoals)
      ? raw.collectiveGoals
      : DEFAULT_PROFILE.collectiveGoals,
    subscriptions: Array.isArray(raw.subscriptions)
      ? raw.subscriptions
      : DEFAULT_SUBSCRIPTIONS,
    health: raw.health ? migrateLabResults(raw.health) : DEFAULT_HEALTH_SNAPSHOT,
    savedWisdomIds: Array.isArray(raw.savedWisdomIds) ? raw.savedWisdomIds : [],
    completedAgendaIds: Array.isArray(raw.completedAgendaIds) ? raw.completedAgendaIds : [],
    recordedOutcomes:
      raw.recordedOutcomes && typeof raw.recordedOutcomes === 'object'
        ? raw.recordedOutcomes
        : {},
  };
}

interface LifeContextValue {
  hydrated: boolean;
  darkMode: boolean;
  toggleDarkMode: () => void;
  profile: UserProfile;
  updateProfile: (patch: Partial<UserProfile>) => void;
  resetAll: () => void;
  completedIds: string[];
  toggleCompleteTask: (taskId: string) => void;
  recordTaskOutcome: (taskId: string, summary: string) => void;
  eligibleTasks: LifeTask[];
  activeTasks: LifeTask[];
  comingUpTasks: LifeTask[];
  completedTasks: LifeTask[];
  score: ScoreBreakdown;
  lifeImpact: LifeImpactSummary;
  breakdown: IncomeBreakdown;
  levelState: LifeLevelState;
  recapDeck: WeeklyRecapMetricCard[];
  portals: ConnectedPortal[];
  currency: string;
  messages: ChatMessage[];
  sendMessage: (text: string) => void;
  askAboutTask: (task: LifeTask) => void;
  activeSheet: NativeSheetId;
  openSheet: (sheet: NativeSheetId) => void;
  openOverlay: (overlay: ActiveFunctionOverlay) => void;
  closeSheet: () => void;
  selectedTask: LifeTask | null;
  openTaskDetail: (task: LifeTask) => void;
  closeTaskDetail: () => void;
}

const LifeContext = createContext<LifeContextValue | null>(null);

export function hapticLight() {
  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function hapticSuccess() {
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

export const LifeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hydrated, setHydrated] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<NativeSheetId>(null);
  const [selectedTask, setSelectedTask] = useState<LifeTask | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    createInitialMessages(DEFAULT_PROFILE, getEligibleTasks(DEFAULT_PROFILE, []))
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [savedProfile, savedCompleted, savedTheme] = await Promise.all([
          AsyncStorage.getItem(STORAGE_PROFILE_KEY),
          AsyncStorage.getItem(STORAGE_COMPLETED_KEY),
          AsyncStorage.getItem(STORAGE_THEME_KEY),
        ]);
        if (!active) return;
        const parsedProfile = savedProfile ? sanitizeProfile(JSON.parse(savedProfile)) : DEFAULT_PROFILE;
        const parsedCompleted = savedCompleted
          ? (JSON.parse(savedCompleted) as string[])
          : [];
        const validCompleted = Array.isArray(parsedCompleted)
          ? parsedCompleted.filter((id) => TASK_CATALOG.some((t) => t.id === id))
          : [];
        const isDark = savedTheme !== 'light';

        setProfile(parsedProfile);
        setCompletedIds(validCompleted);
        setDarkMode(isDark);
        Uniwind.setTheme(isDark ? 'dark' : 'light');
        setMessages(createInitialMessages(parsedProfile, getEligibleTasks(parsedProfile, validCompleted)));
      } catch {
        Uniwind.setTheme('light');
      } finally {
        if (active) setHydrated(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const persistProfile = useCallback((next: UserProfile) => {
    AsyncStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const updateProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      setProfile((prev) => {
        const next: UserProfile = {
          ...prev,
          ...patch,
          health: patch.health
            ? { ...(prev.health ?? DEFAULT_HEALTH_SNAPSHOT), ...patch.health }
            : prev.health,
          taxSettings: patch.taxSettings
            ? { ...prev.taxSettings, ...patch.taxSettings }
            : prev.taxSettings,
        };
        persistProfile(next);
        return next;
      });
    },
    [persistProfile]
  );

  const toggleDarkMode = useCallback(() => {
    hapticLight();
    setDarkMode((prev) => {
      const next = !prev;
      Uniwind.setTheme(next ? 'dark' : 'light');
      AsyncStorage.setItem(STORAGE_THEME_KEY, next ? 'dark' : 'light').catch(() => {});
      return next;
    });
  }, []);

  const toggleCompleteTask = useCallback((taskId: string) => {
    hapticSuccess();
    setCompletedIds((prev) => {
      const next = prev.includes(taskId)
        ? prev.filter((id) => id !== taskId)
        : [...prev, taskId];
      AsyncStorage.setItem(STORAGE_COMPLETED_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const recordTaskOutcome = useCallback(
    (taskId: string, summary: string) => {
      hapticSuccess();
      setCompletedIds((prev) => {
        const next = prev.includes(taskId) ? prev : [...prev, taskId];
        AsyncStorage.setItem(STORAGE_COMPLETED_KEY, JSON.stringify(next)).catch(() => {});
        return next;
      });
      setProfile((prev) => {
        const next: UserProfile = {
          ...prev,
          recordedOutcomes: {
            ...(prev.recordedOutcomes ?? {}),
            [taskId]: {
              taskId,
              summary,
              recordedAt: new Date().toLocaleDateString('en-GB', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              }),
            },
          },
        };
        persistProfile(next);
        return next;
      });
    },
    [persistProfile]
  );

  const resetAll = useCallback(() => {
    hapticLight();
    setProfile(DEFAULT_PROFILE);
    setCompletedIds([]);
    setMessages(createInitialMessages(DEFAULT_PROFILE, getEligibleTasks(DEFAULT_PROFILE, [])));
    AsyncStorage.multiRemove([STORAGE_PROFILE_KEY, STORAGE_COMPLETED_KEY]).catch(() => {});
  }, []);

  const eligibleTasks = useMemo(
    () => getEligibleTasks(profile, completedIds),
    [profile, completedIds]
  );
  const { active: activeTasks, comingUp: comingUpTasks, completed: completedTasks } = useMemo(
    () => partitionTasks(eligibleTasks, completedIds),
    [eligibleTasks, completedIds]
  );
  const score = useMemo(
    () => computeLifeScore(profile, completedIds),
    [profile, completedIds]
  );
  const lifeImpact = useMemo(
    () => computeLifeImpact(profile, eligibleTasks, completedIds),
    [profile, eligibleTasks, completedIds]
  );
  const breakdown = useMemo(() => computeIncomeBreakdown(profile), [profile]);
  const levelState = useMemo(
    () => computeLifeLevelState(profile, eligibleTasks, completedIds),
    [profile, eligibleTasks, completedIds]
  );
  const recapDeck = useMemo(
    () => buildWeeklyRecapDeck(profile, breakdown, levelState, completedIds.length),
    [profile, breakdown, levelState, completedIds.length]
  );
  const portals = useMemo(
    () => getConnectedPortals(profile, completedIds),
    [profile, completedIds]
  );
  const currency = getCurrencySymbol(profile.countryCode);

  const openOverlay = useCallback((overlay: ActiveFunctionOverlay) => {
    hapticLight();
    setSelectedTask(null);
    switch (overlay) {
      case 'health-stack':
        setActiveSheet('health');
        break;
      case 'money-work':
        setActiveSheet('money');
        break;
      case 'levels-ateam':
      case 'life-playbook':
      case 'life-plus':
        setActiveSheet('levels');
        break;
      case 'growth-path':
        setActiveSheet('growth-plan');
        break;
      case 'growth-checkins':
        setActiveSheet('growth-checkins');
        break;
      case 'today-brief':
        setActiveSheet('today');
        break;
      case 'cash-ledger':
        setActiveSheet('cashflow');
        break;
      case 'runway-calc':
        setActiveSheet('runway');
        break;
      case 'blur-intake':
        setActiveSheet('intake');
        break;
      default:
        setActiveSheet(null);
    }
  }, []);

  const sendMessage = useCallback(
    (rawText: string) => {
      const clean = rawText.trim();
      if (!clean) return;
      hapticLight();
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        sender: 'user',
        text: clean,
        timestamp: 'Just now',
      };
      const result = processLifeOSMessage(
        clean,
        profile,
        completedIds,
        updateProfile,
        toggleCompleteTask
      );
      const replyMsg: ChatMessage = {
        id: `ai-${Date.now() + 1}`,
        sender: 'lifeos',
        text: result.replyText,
        timestamp: 'Just now',
        cards: result.cards,
      };
      setMessages((prev) => [...prev, userMsg, replyMsg]);
    },
    [profile, completedIds, updateProfile, toggleCompleteTask]
  );

  const askAboutTask = useCallback(
    (task: LifeTask) => {
      setSelectedTask(null);
      setActiveSheet('chat');
      sendMessage(`Walk me through ${task.shortTitle}: ${task.headlinePrompt}`);
    },
    [sendMessage]
  );

  const value: LifeContextValue = {
    hydrated,
    darkMode,
    toggleDarkMode,
    profile,
    updateProfile,
    resetAll,
    completedIds,
    toggleCompleteTask,
    recordTaskOutcome,
    eligibleTasks,
    activeTasks,
    comingUpTasks,
    completedTasks,
    score,
    lifeImpact,
    breakdown,
    levelState,
    recapDeck,
    portals,
    currency,
    messages,
    sendMessage,
    askAboutTask,
    activeSheet,
    openSheet: (sheet) => {
      hapticLight();
      setSelectedTask(null);
      setActiveSheet(sheet);
    },
    openOverlay,
    closeSheet: () => setActiveSheet(null),
    selectedTask,
    openTaskDetail: (task) => {
      hapticLight();
      setActiveSheet(null);
      setSelectedTask(task);
    },
    closeTaskDetail: () => setSelectedTask(null),
  };

  return <LifeContext.Provider value={value}>{children}</LifeContext.Provider>;
};

export function useLife(): LifeContextValue {
  const ctx = useContext(LifeContext);
  if (!ctx) throw new Error('useLife must be used inside LifeProvider');
  return ctx;
}
