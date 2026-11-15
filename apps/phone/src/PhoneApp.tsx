import React, { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import { SlidersHorizontal, Play, Pause, Sparkles, Monitor, Moon, Sun } from 'lucide-react';
import {
  computeGameChapter,
  computeLifeImpact,
  computeLifeLevelState,
  computeLifeScore,
  createInitialMessages,
  DEFAULT_HEALTH_SNAPSHOT,
  DEFAULT_PROFILE,
  DEFAULT_PULSE,
  DEFAULT_SUBSCRIPTIONS,
  getCrowdUnlockSummary,
  getCurrencySymbol,
  getEligibleTasks,
  partitionTasks,
  PRESET_PROFILES,
  processLifeOSMessage,
  TASK_CATALOG,
  VIDEO_STATES,
} from '@life/core/engine';
import {
  ActiveFunctionOverlay,
  ChatMessage,
  EvidenceDocument,
  GameChapterSummary,
  LifeImpactSummary,
  LifeOSStateId,
  LifeTask,
  PulseFeeling,
  RunwaySnapshot,
  ScoreBreakdown,
  UserProfile,
} from '@life/core/types';
import { DIET_GUIDES, migrateLabResults } from '@life/core/health';
import { IPhoneFrame } from './components/IPhoneFrame';
import { DotMatrixPulseSheet } from './components/functions/DotMatrixPulseSheet';
import { BlurIntakeOverlay } from './components/functions/BlurIntakeOverlay';
import { CrowdStepperSheet } from './components/functions/CrowdStepperSheet';
import { GameOfLifeSheet } from './components/functions/GameOfLifeSheet';
import { RunwayCalculatorSheet } from './components/functions/RunwayCalculatorSheet';
import { TodayBriefSheet } from './components/functions/TodayBriefSheet';
import { CashflowLedgerSheet } from './components/functions/CashflowLedgerSheet';
import { MembershipSheet } from './components/functions/MembershipSheet';
import { ScanningState } from './components/states/ScanningState';
import { HubState } from './components/states/HubState';
import { AuraSearchState } from './components/states/AuraSearchState';
import { IntakeState } from './components/states/IntakeState';
import { TaskAuraState } from './components/states/TaskAuraState';
import { TaskDeckState } from './components/states/TaskDeckState';
import { PortalSpotlightState } from './components/states/PortalSpotlightState';
import { ChatState } from './components/states/ChatState';

export interface LifeWebShellContext {
  profile: UserProfile;
  score: ScoreBreakdown;
  darkMode: boolean;
  studioMode: boolean;
  currentState: LifeOSStateId;
  activeTasks: LifeTask[];
  eligibleTasks: LifeTask[];
  completedIds: string[];
  focusedTask: LifeTask;
  mobileReadingOpen: boolean;
  onCloseMobileReading: () => void;
  onToggleDarkMode: () => void;
  onSwitchToPhoneView: () => void;
  onToggleStudio: () => void;
  onNavigate: (state: LifeOSStateId) => void;
  onOpenOverlay: (overlay: ActiveFunctionOverlay) => void;
  onCompleteTask: (taskId: string) => void;
  onRecordOutcome: (taskId: string, summary: string) => void;
  onAskAboutTask: (task: LifeTask) => void;
  renderMainScreen: () => React.ReactNode;
  activeOverlayNode: React.ReactNode;
  hasActiveOverlay: boolean;
  onCloseOverlay: () => void;
}

export interface LifeStudioRailContext {
  currentState: LifeOSStateId;
  autoPlaying: boolean;
  onSelectState: (id: LifeOSStateId) => void;
  onToggleAutoPlay: () => void;
  onStep: (dir: -1 | 1) => void;
}

export interface LifeStudioInspectorContext {
  profile: UserProfile;
  score: ScoreBreakdown;
  lifeImpact: LifeImpactSummary;
  activeTasks: LifeTask[];
  comingUpTasks: LifeTask[];
  completedTasks: LifeTask[];
  chapter: GameChapterSummary;
  activeOverlay: ActiveFunctionOverlay;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  onApplyPreset: (profile: UserProfile) => void;
  onSelectTask: (task: LifeTask, targetState?: LifeOSStateId) => void;
  onToggleComplete: (taskId: string) => void;
  onResetProgress: () => void;
  onOpenOverlay: (overlay: ActiveFunctionOverlay) => void;
}

export interface PhoneAppProps {
  defaultViewMode?: 'phone' | 'app';
  renderWebShell?: (ctx: LifeWebShellContext) => React.ReactNode;
  renderStudioRail?: (ctx: LifeStudioRailContext) => React.ReactNode;
  renderStudioInspector?: (ctx: LifeStudioInspectorContext) => React.ReactNode;
}

const HealthStackSheet = lazy(() => import('./components/functions/HealthStackSheet').then((module) => ({ default: module.HealthStackSheet })));
const MoneyWorkStackSheet = lazy(() => import('./components/functions/MoneyWorkStackSheet').then((module) => ({ default: module.MoneyWorkStackSheet })));
const LevelsThinkersSheet = lazy(() => import('./components/functions/LevelsThinkersSheet').then((module) => ({ default: module.LevelsThinkersSheet })));
const GrowthPathSheet = lazy(() => import('./components/functions/GrowthPathSheet').then((module) => ({ default: module.GrowthPathSheet })));

const STORAGE_PROFILE_KEY = 'lifeos_profile_v1';
const STORAGE_COMPLETED_KEY = 'lifeos_completed_v1';
const STORAGE_THEME_KEY = 'lifeos_theme_v1';
const STORAGE_VIEW_KEY = 'life_view_mode_v2';

function loadSavedDarkMode(): boolean {
  try {
    return localStorage.getItem(STORAGE_THEME_KEY) === 'dark';
  } catch {
    return false;
  }
}

function loadSavedViewMode(fallback: 'app' | 'phone' = 'phone'): 'app' | 'phone' {
  try {
    const saved = localStorage.getItem(STORAGE_VIEW_KEY);
    if (saved === 'app' || saved === 'phone') return saved;
    return fallback;
  } catch {
    return fallback;
  }
}

function loadSavedProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_PROFILE_KEY);
    if (!raw) return DEFAULT_PROFILE;
    const parsed = JSON.parse(raw) as Partial<UserProfile> | null;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return DEFAULT_PROFILE;
    const health = parsed.health;
    return {
      ...DEFAULT_PROFILE,
      ...parsed,
      countryCode: parsed.countryCode && ['UK', 'US', 'DE', 'NG'].includes(parsed.countryCode) ? parsed.countryCode : DEFAULT_PROFILE.countryCode,
      earnedLevel: parsed.earnedLevel && [1, 2, 3, 4].includes(parsed.earnedLevel) ? parsed.earnedLevel : undefined,
      growth: parsed.growth && /^\d{4}-\d{2}-\d{2}$/.test(parsed.growth.startedOn) && [0, 14, 30, 60].includes(parsed.growth.cadenceDays) ? parsed.growth : undefined,
      householdSize: parsed.householdSize ?? 1,
      pulse: parsed.pulse ?? DEFAULT_PULSE,
      scannedDocIds: Array.isArray(parsed.scannedDocIds) ? parsed.scannedDocIds : [],
      needsTaxOrDebtFix: parsed.needsTaxOrDebtFix ?? DEFAULT_PROFILE.needsTaxOrDebtFix,
      needsCashRunway: parsed.needsCashRunway ?? DEFAULT_PROFILE.needsCashRunway,
      overdueRoutineCare: parsed.overdueRoutineCare ?? DEFAULT_PROFILE.overdueRoutineCare,
      destination: parsed.destination ?? DEFAULT_PROFILE.destination,
      setupRails: Array.isArray(parsed.setupRails) ? parsed.setupRails : DEFAULT_PROFILE.setupRails,
      answeredQuestionIds: Array.isArray(parsed.answeredQuestionIds)
        ? parsed.answeredQuestionIds
        : [],
      workStatus: parsed.workStatus ?? DEFAULT_PROFILE.workStatus,
      annualIncome:
        typeof parsed.annualIncome === 'number'
          ? parsed.annualIncome
          : DEFAULT_PROFILE.annualIncome,
      taxCode: parsed.taxCode ?? DEFAULT_PROFILE.taxCode,
      monthlyPensionPct:
        typeof parsed.monthlyPensionPct === 'number'
          ? parsed.monthlyPensionPct
          : DEFAULT_PROFILE.monthlyPensionPct,
      employerMatchPct:
        typeof parsed.employerMatchPct === 'number'
          ? parsed.employerMatchPct
          : DEFAULT_PROFILE.employerMatchPct,
      hasDependents: parsed.hasDependents ?? DEFAULT_PROFILE.hasDependents,
      collectiveGoals: Array.isArray(parsed.collectiveGoals)
        ? parsed.collectiveGoals
        : DEFAULT_PROFILE.collectiveGoals,
      openedAccountIds: Array.isArray(parsed.openedAccountIds)
        ? parsed.openedAccountIds
        : DEFAULT_PROFILE.openedAccountIds,
      protectedPolicyIds: Array.isArray(parsed.protectedPolicyIds)
        ? parsed.protectedPolicyIds
        : DEFAULT_PROFILE.protectedPolicyIds,
      health: migrateLabResults({
        ...DEFAULT_HEALTH_SNAPSHOT,
        ...health,
        dietStyle: health?.dietStyle && Object.prototype.hasOwnProperty.call(DIET_GUIDES, health.dietStyle)
          ? health.dietStyle
          : DEFAULT_HEALTH_SNAPSHOT.dietStyle,
        mealsLogged: Array.isArray(health?.mealsLogged) ? health.mealsLogged : DEFAULT_HEALTH_SNAPSHOT.mealsLogged,
        bloodwork: Array.isArray(health?.bloodwork) ? health.bloodwork : undefined,
      }),
      subscriptions: Array.isArray(parsed.subscriptions)
        ? parsed.subscriptions
        : DEFAULT_SUBSCRIPTIONS,
    };
  } catch {
    return DEFAULT_PROFILE;
  }
}

function loadSavedCompleted(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_COMPLETED_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function PhoneApp({
  defaultViewMode = 'phone',
  renderWebShell,
  renderStudioRail,
  renderStudioInspector,
}: PhoneAppProps = {}) {
  const [profile, setProfile] = useState<UserProfile>(loadSavedProfile);
  const [completedIds, setCompletedIds] = useState<string[]>(loadSavedCompleted);
  const [darkMode, setDarkMode] = useState<boolean>(loadSavedDarkMode);
  const [viewMode, setViewMode] = useState<'app' | 'phone'>(() =>
    renderWebShell ? loadSavedViewMode(defaultViewMode) : 'phone'
  );
  const [currentState, setCurrentState] = useState<LifeOSStateId>(() =>
    loadSavedDarkMode() ? 'voice-dark' : 'hub-light'
  );
  const [activeOverlay, setActiveOverlay] = useState<ActiveFunctionOverlay>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [mobileReadingOpen, setMobileReadingOpen] = useState(false);
  const [autoPlaying, setAutoPlaying] = useState(false);
  const [studioMode, setStudioMode] = useState(false);
  const [flashTrigger, setFlashTrigger] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const eligibleTasks = useMemo(() => getEligibleTasks(profile, completedIds), [profile, completedIds]);
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
  const gameChapter = useMemo(
    () => computeGameChapter(profile, eligibleTasks, completedIds),
    [profile, eligibleTasks, completedIds]
  );

  useEffect(() => {
    const level = computeLifeLevelState(profile, eligibleTasks, completedIds);
    const newRules = level.unlockedNormals.filter((rule) => !profile.operatingRuleDates?.[rule.id]);
    if (level.currentLevel <= (profile.earnedLevel ?? 1) && newRules.length === 0) return;
    setProfile((previous) => previous === profile ? {
      ...previous,
      earnedLevel: level.currentLevel,
      operatingRuleDates: {
        ...previous.operatingRuleDates,
        ...Object.fromEntries(newRules.map((rule) => [rule.id, rule.nextDueOn])),
      },
    } : previous);
  }, [profile, eligibleTasks, completedIds]);

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    createInitialMessages(profile, eligibleTasks)
  );

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_PROFILE_KEY, JSON.stringify(profile));
    } catch {
      // ignore storage quota errors
    }
  }, [profile]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_COMPLETED_KEY, JSON.stringify(completedIds));
    } catch {
      // ignore storage quota errors
    }
  }, [completedIds]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_THEME_KEY, darkMode ? 'dark' : 'light');
    } catch {
      // ignore storage quota errors
    }
  }, [darkMode]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_VIEW_KEY, viewMode);
    } catch {
      // ignore storage quota errors
    }
  }, [viewMode]);

  const handleToggleDarkMode = useCallback(() => {
    setDarkMode((prev) => {
      const next = !prev;
      setCurrentState((st) => {
        if (next && st === 'hub-light') return 'voice-dark';
        if (!next && st === 'voice-dark') return 'hub-light';
        return st;
      });
      return next;
    });
  }, []);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // Video Choreography Tour Auto-Player
  useEffect(() => {
    if (!autoPlaying) return;
    const timer = setInterval(() => {
      setCurrentState((prev) => {
        const idx = VIDEO_STATES.findIndex((s) => s.id === prev);
        const nextIdx = (idx + 1) % VIDEO_STATES.length;
        return VIDEO_STATES[nextIdx].id;
      });
    }, 2300);
    return () => clearInterval(timer);
  }, [autoPlaying]);

  // Keyboard arrow stepping through video states (disabled while typing in inputs)
  const stepState = useCallback((dir: -1 | 1) => {
    setAutoPlaying(false);
    setCurrentState((prev) => {
      const idx = VIDEO_STATES.findIndex((s) => s.id === prev);
      const nextIdx = (idx + dir + VIDEO_STATES.length) % VIDEO_STATES.length;
      return VIDEO_STATES[nextIdx].id;
    });
  }, []);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;
      if (e.key === 'ArrowRight') stepState(1);
      if (e.key === 'ArrowLeft') stepState(-1);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [stepState]);

  const handleUpdateProfile = useCallback(
    (patch: Partial<UserProfile>) => {
      setProfile((prev) => {
        const changedCountry = patch.countryCode !== undefined && prev.countryCode !== patch.countryCode;
        const changedTaxInputs = (['workStatus', 'annualIncome', 'taxCode', 'taxSettings', 'monthlyPensionPct', 'employerMatchPct'] as const)
          .some((key) => key in patch && patch[key] !== prev[key]);
        const next = {
          ...prev,
          ...(changedTaxInputs ? { taxReviewed: false } : {}),
          ...(changedCountry ? {
            taxSettings: undefined,
            taxCode: '',
            annualIncome: 0,
            taxReviewed: false,
            answeredQuestionIds: prev.answeredQuestionIds.filter((id) =>
              !['q-income', 'q-uk-paye-code', 'q-tax-compliance'].includes(id)),
          } : {}),
          ...patch,
        };
        return next;
      });
      if (patch.city || patch.age !== undefined || patch.isBusinessOwner !== undefined) {
        showToast('Plan updated — here is what changed for you');
      } else if (patch.destination) {
        showToast('Updated what you are working toward');
      }
    },
    [showToast]
  );

  const handleApplyPreset = useCallback(
    (nextProfile: UserProfile) => {
      setProfile(nextProfile);
      setCompletedIds([]);
      setSelectedTaskId(null);
      const freshEligible = getEligibleTasks(nextProfile);
      setMessages(createInitialMessages(nextProfile, freshEligible));
      showToast(`Switched to ${nextProfile.city} · Age ${nextProfile.age}`);
    },
    [showToast]
  );

  const handleCyclePreset = useCallback(() => {
    const idx = PRESET_PROFILES.findIndex(
      (p) =>
        p.profile.city === profile.city &&
        p.profile.age === profile.age &&
        p.profile.isBusinessOwner === profile.isBusinessOwner
    );
    const next = PRESET_PROFILES[(idx + 1) % PRESET_PROFILES.length];
    handleApplyPreset(next.profile);
  }, [profile, handleApplyPreset]);

  const handleCompleteTask = useCallback(
    (taskId: string) => {
      const task = eligibleTasks.find((t) => t.id === taskId);
      setCompletedIds((prev) => {
        const already = prev.includes(taskId);
        if (already) return prev.filter((id) => id !== taskId);
        return [...prev, taskId];
      });
      if (task && !completedIds.includes(taskId)) {
        setFlashTrigger((f) => f + 1);
        showToast(`Done: ${task.shortTitle}`);
      }
    },
    [eligibleTasks, completedIds, showToast]
  );

  const handleSaveRunway = useCallback(
    (snapshot: RunwaySnapshot) => {
      const sym = getCurrencySymbol(profile.countryCode);
      const summary =
        snapshot.netRunway >= 0
          ? `30-day buffer: +${sym}${snapshot.netRunway.toLocaleString()}`
          : `30-day gap: -${sym}${Math.abs(snapshot.netRunway).toLocaleString()}`;
      setProfile((prev) => ({
        ...prev,
        runway: snapshot,
        recordedOutcomes: {
          ...(prev.recordedOutcomes ?? {}),
          'runway-30-days': {
            taskId: 'runway-30-days',
            summary,
            recordedAt: new Date().toISOString(),
          },
        },
      }));
      setFlashTrigger((f) => f + 1);
      showToast(`Saved: ${summary}`);
    },
    [profile.countryCode, showToast]
  );

  const handleRecordOutcome = useCallback(
    (taskId: string, summary: string) => {
      setProfile((prev) => ({
        ...prev,
        recordedOutcomes: {
          ...(prev.recordedOutcomes ?? {}),
          [taskId]: {
            taskId,
            summary,
            recordedAt: new Date().toISOString(),
          },
        },
      }));
      showToast(`Saved outcome: ${summary}`);
    },
    [showToast]
  );

  const handleSelectTask = useCallback(
    (task: LifeTask, targetState?: LifeOSStateId) => {
      setAutoPlaying(false);
      setSelectedTaskId(task.id);
      if (viewMode === 'app') {
        setMobileReadingOpen(true);
        if (targetState && currentState !== 'hub-light' && currentState !== 'voice-dark') {
          setCurrentState(targetState);
        }
      } else if (targetState) {
        setCurrentState(targetState);
      }
    },
    [viewMode, currentState]
  );

  const handleSendMessage = useCallback(
    (text: string) => {
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        sender: 'user',
        text,
        timestamp: 'Now',
      };

      const { replyText, cards } = processLifeOSMessage(
        text,
        profile,
        completedIds,
        handleUpdateProfile,
        handleCompleteTask
      );

      const botMsg: ChatMessage = {
        id: `b-${Date.now() + 1}`,
        sender: 'lifeos',
        text: replyText,
        timestamp: 'Now',
        cards,
      };

      setMessages((prev) => [...prev, userMsg, botMsg]);
    },
    [profile, completedIds, handleUpdateProfile, handleCompleteTask]
  );

  const handleAskAboutTask = useCallback(
    (task: LifeTask) => {
      const userMsg: ChatMessage = {
        id: `u-${Date.now()}`,
        sender: 'user',
        text: `Explain ${task.title} and how to complete it`,
        timestamp: 'Now',
      };
      const botMsg: ChatMessage = {
        id: `b-${Date.now() + 1}`,
        sender: 'lifeos',
        text: `${task.insightSummary} ${task.personalWhy} First step: ${task.steps[0]}.`,
        timestamp: 'Now',
        cards: [task],
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      setCurrentState('chat');
    },
    []
  );

  // Determine the spotlight & reading tasks
  const selectedTask = eligibleTasks.find((t) => t.id === selectedTaskId);
  const focusedTask = selectedTask ?? activeTasks[0] ?? eligibleTasks[0] ?? TASK_CATALOG[0];

  const schemeTask =
    (selectedTask && selectedTask.urgency !== 'urgent' ? selectedTask : null) ??
    eligibleTasks.find((t) => t.category === 'loan' && !completedIds.includes(t.id)) ??
    eligibleTasks.find((t) => t.category === 'gov') ??
    eligibleTasks[0] ??
    TASK_CATALOG[1];

  const urgentTask =
    (selectedTask && selectedTask.urgency === 'urgent' ? selectedTask : null) ??
    eligibleTasks.find((t) => t.urgency === 'urgent') ??
    eligibleTasks.find((t) => t.category === 'health') ??
    eligibleTasks[0] ??
    TASK_CATALOG[0];

  const currentDescriptor = VIDEO_STATES.find((s) => s.id === currentState);
  const isDarkScreen = Boolean(currentDescriptor?.darkSurface) || darkMode;

  const navigate = useCallback((state: LifeOSStateId) => {
    setAutoPlaying(false);
    setActiveOverlay(null);
    setCurrentState(state);
    if (state === 'voice-dark') setDarkMode(true);
  }, []);

  const handleOpenOverlay = useCallback((overlay: ActiveFunctionOverlay) => {
    setAutoPlaying(false);
    setActiveOverlay(overlay);
  }, []);

  const handleApplyPulse = useCallback(
    (pulse: PulseFeeling) => {
      setProfile((prev) => ({ ...prev, pulse }));
      showToast(`Life Pulse → ${pulse.label} (${pulse.focusBias})`);
    },
    [showToast]
  );

  const handleApplyCrowdCount = useCallback(
    (count: number) => {
      const nextProfile = { ...profile, householdSize: count };
      setProfile(nextProfile);
      showToast(getCrowdUnlockSummary(count, nextProfile));
    },
    [profile, showToast]
  );

  const handleProcessEvidence = useCallback(
    (doc: EvidenceDocument) => {
      setProfile((prev) => ({
        ...prev,
        ...(doc.profilePatch ?? {}),
        scannedDocIds: prev.scannedDocIds.includes(doc.id)
          ? prev.scannedDocIds
          : [...prev.scannedDocIds, doc.id],
      }));

      const nextProfile: UserProfile = {
        ...profile,
        ...(doc.profilePatch ?? {}),
      };
      const updatedTasks = getEligibleTasks(nextProfile, completedIds);
      const matchedTask = doc.unlocksTaskId
        ? updatedTasks.find((t) => t.id === doc.unlocksTaskId)
        : updatedTasks[0];

      const userMsg: ChatMessage = {
        id: `u-doc-${Date.now()}`,
        sender: 'user',
        text: `[${doc.source}] Attached ${doc.title}`,
        timestamp: 'Now',
      };
      const botMsg: ChatMessage = {
        id: `b-doc-${Date.now() + 1}`,
        sender: 'lifeos',
        text: `Analyzed ${doc.title}: ${doc.summary}`,
        timestamp: 'Now',
        cards: matchedTask ? [matchedTask] : updatedTasks.slice(0, 2),
      };
      setMessages((prev) => [...prev, userMsg, botMsg]);
      setFlashTrigger((f) => f + 1);
      showToast(`Saved "${doc.title}" details to your plan`);
      setCurrentState('chat');
    },
    [profile, completedIds, showToast]
  );

  const renderScreenState = () => {
    switch (currentState) {
      case 'scanning':
        return (
          <ScanningState
            profile={profile}
            darkMode={darkMode}
            activeTaskCount={activeTasks.length}
            comingCount={comingUpTasks.length}
            onNavigate={navigate}
            onSendMessage={handleSendMessage}
            onOpenOverlay={handleOpenOverlay}
          />
        );
      case 'hub-light':
        return (
          <HubState
            mode={darkMode ? 'dark' : 'light'}
            profile={profile}
            score={score}
            activeTasks={activeTasks}
            eligibleTasks={eligibleTasks}
            completedIds={completedIds}
            comingUpCount={comingUpTasks.length}
            onNavigate={navigate}
            onSelectTask={handleSelectTask}
            onSendMessage={handleSendMessage}
            onOpenOverlay={handleOpenOverlay}
            onToggleDarkMode={handleToggleDarkMode}
            onUpdateProfile={handleUpdateProfile}
            hideMobileTabBar={viewMode === 'app'}
          />
        );
      case 'aura-search':
        return (
          <AuraSearchState
            mode="aura"
            profile={profile}
            darkMode={darkMode}
            score={score}
            eligibleTasks={eligibleTasks}
            onNavigate={navigate}
            onSelectTask={handleSelectTask}
            onSendMessage={handleSendMessage}
            onCycleProfile={handleCyclePreset}
            onOpenOverlay={handleOpenOverlay}
          />
        );
      case 'orb-radar':
        return (
          <AuraSearchState
            mode="orb"
            profile={profile}
            darkMode={darkMode}
            score={score}
            eligibleTasks={eligibleTasks}
            onNavigate={navigate}
            onSelectTask={handleSelectTask}
            onSendMessage={handleSendMessage}
            onCycleProfile={handleCyclePreset}
            onOpenOverlay={handleOpenOverlay}
          />
        );
      case 'intake-manifesto':
        return (
          <IntakeState
            mode="manifesto"
            profile={profile}
            darkMode={darkMode}
            onUpdateProfile={handleUpdateProfile}
            onNavigate={navigate}
          />
        );
      case 'intake-portal':
        return (
          <IntakeState
            mode="portal"
            profile={profile}
            darkMode={darkMode}
            onUpdateProfile={handleUpdateProfile}
            onNavigate={navigate}
          />
        );
      case 'task-aura':
        return (
          <TaskAuraState
            tasks={activeTasks.length > 0 ? activeTasks : eligibleTasks}
            onNavigate={navigate}
            onSelectTask={handleSelectTask}
          />
        );
      case 'voice-dark':
        return (
          <HubState
            mode={darkMode ? 'dark' : 'light'}
            profile={profile}
            score={score}
            activeTasks={activeTasks}
            eligibleTasks={eligibleTasks}
            completedIds={completedIds}
            comingUpCount={comingUpTasks.length}
            onNavigate={navigate}
            onSelectTask={handleSelectTask}
            onSendMessage={handleSendMessage}
            onOpenOverlay={handleOpenOverlay}
            onToggleDarkMode={handleToggleDarkMode}
            onUpdateProfile={handleUpdateProfile}
            hideMobileTabBar={viewMode === 'app'}
          />
        );
      case 'task-deck':
        return (
          <TaskDeckState
            profile={profile}
            darkMode={darkMode}
            activeTasks={activeTasks}
            comingUpTasks={comingUpTasks}
            completedCount={completedTasks.length}
            onNavigate={navigate}
            onSelectTask={handleSelectTask}
            onCompleteTask={handleCompleteTask}
          />
        );
      case 'scheme-portal':
        return (
          <PortalSpotlightState
            mode="scheme"
            task={schemeTask}
            profile={profile}
            darkMode={darkMode}
            score={score}
            isCompleted={completedIds.includes(schemeTask.id)}
            recordedOutcome={profile.recordedOutcomes?.[schemeTask.id]}
            onNavigate={navigate}
            onCompleteTask={handleCompleteTask}
            onRecordOutcome={handleRecordOutcome}
            onTriggerIslandFlash={() => setFlashTrigger((f) => f + 1)}
            onAskAboutTask={handleAskAboutTask}
          />
        );
      case 'profile-pulse':
        return (
          <PortalSpotlightState
            mode="profile"
            task={schemeTask}
            profile={profile}
            darkMode={darkMode}
            score={score}
            isCompleted={false}
            onNavigate={navigate}
            onCompleteTask={handleCompleteTask}
            onRecordOutcome={handleRecordOutcome}
            onTriggerIslandFlash={() => setFlashTrigger((f) => f + 1)}
            onAskAboutTask={handleAskAboutTask}
            onOpenOverlay={handleOpenOverlay}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case 'chat':
        return (
          <ChatState
            profile={profile}
            darkMode={darkMode}
            messages={messages}
            completedIds={completedIds}
            onNavigate={navigate}
            onSendMessage={handleSendMessage}
            onSelectTask={handleSelectTask}
            onOpenOverlay={handleOpenOverlay}
          />
        );
      case 'urgent-alert':
        return (
          <PortalSpotlightState
            mode="urgent"
            task={urgentTask}
            profile={profile}
            darkMode={darkMode}
            score={score}
            isCompleted={completedIds.includes(urgentTask.id)}
            recordedOutcome={profile.recordedOutcomes?.[urgentTask.id]}
            onNavigate={navigate}
            onCompleteTask={handleCompleteTask}
            onRecordOutcome={handleRecordOutcome}
            onTriggerIslandFlash={() => setFlashTrigger((f) => f + 1)}
            onAskAboutTask={handleAskAboutTask}
          />
        );
    }
  };

  const renderOverlayContent = () => (
    <Suspense fallback={<p className="absolute inset-x-0 bottom-0 z-40 bg-white p-4 text-center text-[13px] text-[#141416]" role="status">Loading sheet…</p>}>
    <AnimatePresence>
      {activeOverlay === 'runway-calc' && (
        <RunwayCalculatorSheet
          key="runway-calc"
          profile={profile}
          darkMode={darkMode}
          onSaveRunway={handleSaveRunway}
          onClose={() => setActiveOverlay(null)}
        />
      )}
      {activeOverlay === 'pulse-matrix' && (
        <DotMatrixPulseSheet
          key="pulse-matrix"
          initialPulse={profile.pulse ?? DEFAULT_PULSE}
          onApply={handleApplyPulse}
          onClose={() => setActiveOverlay(null)}
        />
      )}
      {activeOverlay === 'blur-intake' && (
        <BlurIntakeOverlay
          key="blur-intake"
          scannedDocIds={profile.scannedDocIds ?? []}
          onProcessEvidence={handleProcessEvidence}
          onClose={() => setActiveOverlay(null)}
        />
      )}
      {activeOverlay === 'crowd-stepper' && (
        <CrowdStepperSheet
          key="crowd-stepper"
          profile={profile}
          onApplyCount={handleApplyCrowdCount}
          onClose={() => setActiveOverlay(null)}
        />
      )}
      {activeOverlay === 'life-playbook' && (
        <GameOfLifeSheet
          key="life-playbook"
          profile={profile}
          darkMode={darkMode}
          eligibleTasks={eligibleTasks}
          completedIds={completedIds}
          onUpdateProfile={handleUpdateProfile}
          onSelectTask={(task, target) => {
            setActiveOverlay(null);
            handleSelectTask(task, target);
          }}
          onClose={() => setActiveOverlay(null)}
        />
      )}
      {(activeOverlay === 'growth-path' || activeOverlay === 'growth-checkins') && (
        <GrowthPathSheet
          key={activeOverlay}
          profile={profile}
          darkMode={darkMode}
          initialTab={activeOverlay === 'growth-checkins' ? 'check-ins' : 'plan'}
          onUpdateProfile={handleUpdateProfile}
          onClose={() => setActiveOverlay(null)}
        />
      )}
      {activeOverlay === 'health-stack' && (
        <HealthStackSheet
          key="health-stack"
          profile={profile}
          darkMode={darkMode}
          onUpdateProfile={handleUpdateProfile}
          onClose={() => setActiveOverlay(null)}
        />
      )}
      {activeOverlay === 'money-work' && (
        <MoneyWorkStackSheet
          key="money-work"
          profile={profile}
          darkMode={darkMode}
          onUpdateProfile={handleUpdateProfile}
          onClose={() => setActiveOverlay(null)}
        />
      )}
      {activeOverlay === 'levels-ateam' && (
        <LevelsThinkersSheet
          key="levels-ateam"
          profile={profile}
          darkMode={darkMode}
          eligibleTasks={eligibleTasks}
          completedIds={completedIds}
          onUpdateProfile={handleUpdateProfile}
          onOpenOverlay={(overlay) => setActiveOverlay(overlay)}
          onSelectTask={(task, target) => {
            setActiveOverlay(null);
            handleSelectTask(task, target);
          }}
          onClose={() => setActiveOverlay(null)}
        />
      )}
      {activeOverlay === 'today-brief' && (
        <TodayBriefSheet
          key="today-brief"
          profile={profile}
          darkMode={darkMode}
          eligibleTasks={eligibleTasks}
          completedIds={completedIds}
          onUpdateProfile={handleUpdateProfile}
          onOpenOverlay={(overlay) => setActiveOverlay(overlay)}
          onSelectTask={(task, target) => {
            setActiveOverlay(null);
            handleSelectTask(task, target);
          }}
          onClose={() => setActiveOverlay(null)}
        />
      )}
      {activeOverlay === 'cash-ledger' && (
        <CashflowLedgerSheet
          key="cash-ledger"
          profile={profile}
          darkMode={darkMode}
          onUpdateProfile={handleUpdateProfile}
          onOpenOverlay={(overlay) => setActiveOverlay(overlay)}
          onClose={() => setActiveOverlay(null)}
        />
      )}
      {activeOverlay === 'life-plus' && (
        <MembershipSheet
          key="life-plus"
          profile={profile}
          onClose={() => setActiveOverlay(null)}
        />
      )}
    </AnimatePresence>
    </Suspense>
  );

  const runwayChipText = profile.runway
    ? `${profile.city} · 30-day ${profile.runway.netRunway >= 0 ? 'cover' : 'gap'} ${getCurrencySymbol(profile.countryCode)}${Math.abs(profile.runway.netRunway).toLocaleString()}`
    : `${profile.city} · ${activeTasks.length} things worth sorting`;

  return (
    <MotionConfig reducedMotion="user">
      {viewMode === 'app' && renderWebShell ? (
        renderWebShell({
          profile,
          score,
          darkMode,
          studioMode,
          currentState,
          activeTasks,
          eligibleTasks,
          completedIds,
          focusedTask,
          mobileReadingOpen,
          onCloseMobileReading: () => setMobileReadingOpen(false),
          onToggleDarkMode: handleToggleDarkMode,
          onSwitchToPhoneView: () => setViewMode('phone'),
          onToggleStudio: () => {
            setViewMode('phone');
            setStudioMode(true);
          },
          onNavigate: navigate,
          onOpenOverlay: handleOpenOverlay,
          onCompleteTask: handleCompleteTask,
          onRecordOutcome: handleRecordOutcome,
          onAskAboutTask: handleAskAboutTask,
          renderMainScreen: renderScreenState,
          activeOverlayNode: renderOverlayContent(),
          hasActiveOverlay: activeOverlay !== null,
          onCloseOverlay: () => setActiveOverlay(null),
        })
      ) : (
        <div
          className={`min-h-screen w-full p-0 transition-colors duration-250 sm:px-6 sm:py-4 lg:py-6 ${
            darkMode
              ? 'bg-[radial-gradient(ellipse_at_top,#1B1C22_0%,#111216_62%,#09090B_100%)] text-[#F5F4F0]'
              : 'bg-[radial-gradient(ellipse_at_top,#EAE6DF_0%,#DFDBD2_58%,#D3CEC3_100%)] text-[#141416]'
          }`}
        >
          {/* Clean Desktop Product Header (hidden on < sm so mobile stays edge-to-edge native) */}
          <header className="mx-auto mb-4 hidden max-w-[1220px] flex-wrap items-center justify-between gap-3 sm:flex">
            <div className="flex items-center gap-3">
              <span className="font-serif-editorial text-[26px] leading-none">
                life
              </span>
              <span
                className={`inline-block rounded-full px-3 py-1 text-[12.5px] font-medium backdrop-blur-md ${
                  darkMode ? 'bg-white/10 text-white/75' : 'bg-white/60 text-[#4A4A4F]'
                }`}
              >
                {runwayChipText}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {studioMode && (
                <button
                  type="button"
                  onClick={() => setAutoPlaying((p) => !p)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition lg:hidden ${
                    autoPlaying ? 'bg-[#C43929] text-white' : 'bg-[#141416] text-white'
                  }`}
                >
                  {autoPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-current" />}
                  <span>{autoPlaying ? 'Pause' : 'Tour'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleToggleDarkMode}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition ${
                  darkMode
                    ? 'bg-white/12 text-amber-300 hover:bg-white/20'
                    : 'bg-white/65 text-[#141416] backdrop-blur-md hover:bg-white/85'
                }`}
                title={darkMode ? 'Switch to White Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                <span>{darkMode ? 'White' : 'Dark'}</span>
              </button>

              {renderWebShell && (
                <button
                  type="button"
                  onClick={() => {
                    setStudioMode(false);
                    setViewMode('app');
                  }}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition ${
                    darkMode
                      ? 'bg-white/12 text-white hover:bg-white/20'
                      : 'bg-white/65 text-[#141416] backdrop-blur-md hover:bg-white/85'
                  }`}
                  title="Open Responsive Web App"
                >
                  <Monitor className="h-3.5 w-3.5" />
                  <span>Web App</span>
                </button>
              )}

              {renderStudioRail && renderStudioInspector && (
                <button
                  type="button"
                  onClick={() => setStudioMode((s) => !s)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition ${
                    studioMode
                      ? 'bg-[#2347D8] text-white'
                      : darkMode
                        ? 'bg-white/12 text-white hover:bg-white/20'
                        : 'bg-white/65 text-[#141416] backdrop-blur-md hover:bg-white/85'
                  }`}
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Studio</span>
                </button>
              )}
            </div>
          </header>

          {/* Mobile Studio Screen Switcher (only shown when Studio is toggled ON) */}
          {studioMode && (
            <div className="no-scrollbar mx-auto mb-4 flex max-w-[440px] gap-1.5 overflow-x-auto pb-1 lg:hidden">
              {VIDEO_STATES.map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => navigate(st.id)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium transition ${
                    currentState === st.id
                      ? 'bg-[#2347D8] text-white'
                      : darkMode
                        ? 'bg-white/10 text-white/75'
                        : 'bg-white/65 text-[#4A4A4F] backdrop-blur-md'
                  }`}
                >
                  {st.order}. {st.label}
                </button>
              ))}
            </div>
          )}

          {/* Stage: Edge-to-edge Phone on < sm, Centered Titanium iPhone on sm+ */}
          <main className="mx-auto flex w-full max-w-[1220px] flex-col items-center justify-center gap-7 lg:flex-row lg:items-start">
            {studioMode && renderStudioRail && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18 }}
                className="hidden lg:block"
              >
                {renderStudioRail({
                  currentState,
                  autoPlaying,
                  onSelectState: navigate,
                  onToggleAutoPlay: () => setAutoPlaying((p) => !p),
                  onStep: stepState,
                })}
              </motion.div>
            )}

            {/* Hero Natural-Titanium Device */}
            <div className="relative flex w-full flex-col items-center sm:w-auto">
              <IPhoneFrame
                expandedIsland={currentState === 'scanning'}
                scanText={`Checking ${profile.city} support & deadlines`}
                flashTrigger={flashTrigger}
                darkSurface={isDarkScreen}
                onIslandTap={() =>
                  navigate(
                    currentState === 'scanning'
                      ? darkMode
                        ? 'voice-dark'
                        : 'hub-light'
                      : 'scanning'
                  )
                }
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentState}
                    initial={{ opacity: 0, y: 4 }}
                    animate={
                      activeOverlay === 'blur-intake'
                        ? { opacity: 1, y: 0, scale: 0.98, filter: 'blur(10px)' }
                        : { opacity: 1, y: 0, scale: 1 }
                    }
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="h-full w-full"
                  >
                    {renderScreenState()}
                  </motion.div>
                </AnimatePresence>

                {renderOverlayContent()}
              </IPhoneFrame>

              <p className={`mt-3 hidden text-center text-[12.5px] font-medium sm:block ${darkMode ? 'text-white/60' : 'text-[#4A4A4F]'}`}>
                Tap inside the phone · use <kbd className="rounded bg-white/55 px-1.5 py-0.5 text-[11.5px] text-[#141416]">←</kbd>{' '}
                <kbd className="rounded bg-white/55 px-1.5 py-0.5 text-[11.5px] text-[#141416]">→</kbd> to step screens
                {!studioMode && renderStudioRail ? ' · open Studio to inspect all 13 states' : ''}
              </p>
            </div>

            {studioMode && renderStudioInspector && (
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.18 }}
                className="w-full max-w-[320px] lg:w-auto"
              >
                {renderStudioInspector({
                  profile,
                  score,
                  lifeImpact,
                  activeTasks,
                  comingUpTasks,
                  completedTasks,
                  chapter: gameChapter,
                  activeOverlay,
                  onUpdateProfile: handleUpdateProfile,
                  onApplyPreset: handleApplyPreset,
                  onSelectTask: handleSelectTask,
                  onToggleComplete: handleCompleteTask,
                  onResetProgress: () => {
                    setCompletedIds([]);
                    setProfile((p) => ({
                      ...p,
                      scannedDocIds: [],
                      answeredQuestionIds: [],
                      runway: undefined,
                      recordedOutcomes: {},
                    }));
                    showToast('Started fresh — ready for your first move');
                  },
                  onOpenOverlay: handleOpenOverlay,
                })}
              </motion.div>
            )}
          </main>
        </div>
      )}

      {/* Feedback Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="fixed bottom-5 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-[#141416] px-4 py-2 text-[13px] font-medium text-white shadow-xl"
          >
            <Sparkles className="h-3.5 w-3.5 text-[#72D2A3]" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}

export default PhoneApp;
