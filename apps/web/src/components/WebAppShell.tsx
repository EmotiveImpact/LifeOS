import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  Award,
  Briefcase,
  Calculator,
  Calendar,
  Compass,
  FilePlus2,
  Home,
  Layers,
  Map as MapIcon,
  MessageSquare,
  Moon,
  SlidersHorizontal,
  Smartphone,
  Sparkles,
  Sun,
  User,
  Wallet,
} from 'lucide-react';
import { TaskReadingSheet } from '@life/phone';
import {
  computeGameChapter,
  getCurrencySymbol,
} from '@life/core/engine';
import {
  ActiveFunctionOverlay,
  LifeOSStateId,
  LifeTask,
  ScoreBreakdown,
  UserProfile,
} from '@life/core/types';

interface WebAppShellProps {
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

export const WebAppShell: React.FC<WebAppShellProps> = ({
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
  onCloseMobileReading,
  onToggleDarkMode,
  onSwitchToPhoneView,
  onToggleStudio,
  onNavigate,
  onOpenOverlay,
  onCompleteTask,
  onRecordOutcome,
  onAskAboutTask,
  renderMainScreen,
  activeOverlayNode,
  hasActiveOverlay,
  onCloseOverlay,
}) => {
  const [checkedStepsByTask, setCheckedStepsByTask] = useState<Record<string, number[]>>({});

  const chapter = computeGameChapter(profile, eligibleTasks, completedIds);
  const symbol = getCurrencySymbol(profile.countryCode);

  const navItems: Array<{
    id: LifeOSStateId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    matchIds: LifeOSStateId[];
  }> = [
    {
      id: darkMode ? 'voice-dark' : 'hub-light',
      label: 'Home',
      icon: Home,
      matchIds: ['hub-light', 'voice-dark'],
    },
    {
      id: 'aura-search',
      label: 'Explore',
      icon: Compass,
      matchIds: ['aura-search', 'orb-radar', 'task-aura'],
    },
    {
      id: 'task-deck',
      label: 'Missions',
      icon: Layers,
      matchIds: ['task-deck', 'scheme-portal', 'urgent-alert'],
    },
    {
      id: 'chat',
      label: 'Coach',
      icon: MessageSquare,
      matchIds: ['chat', 'scanning'],
    },
    {
      id: 'intake-portal',
      label: 'Check-in',
      icon: Sparkles,
      matchIds: ['intake-portal', 'intake-manifesto'],
    },
    {
      id: 'profile-pulse',
      label: 'Profile',
      icon: User,
      matchIds: ['profile-pulse'],
    },
  ];

  const isHomeActive = currentState === 'hub-light' || currentState === 'voice-dark';
  const currentSteps = checkedStepsByTask[focusedTask.id] ?? [];
  const toggleReadingStep = (idx: number) => {
    setCheckedStepsByTask((prev) => {
      const existing = prev[focusedTask.id] ?? [];
      const next = existing.includes(idx)
        ? existing.filter((i) => i !== idx)
        : [...existing, idx];
      return { ...prev, [focusedTask.id]: next };
    });
  };

  const runwayPill = profile.runway
    ? `30-day ${profile.runway.netRunway >= 0 ? '+' : '-'}${symbol}${Math.abs(profile.runway.netRunway).toLocaleString()}`
    : `${activeTasks.length} moves today`;

  return (
    <div
      className={`min-h-screen w-full transition-colors duration-250 ${
        darkMode ? 'bg-[#09090B] text-[#F5F4F0]' : 'bg-[#FFFFFF] text-[#141416]'
      }`}
    >
      {/* Top Global App Header */}
      <header
        className={`sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 backdrop-blur-xl md:px-6 ${
          darkMode ? 'bg-[#09090B]/88' : 'bg-white/88'
        }`}
      >
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => onNavigate(darkMode ? 'voice-dark' : 'hub-light')}
            className="font-serif-editorial truncate text-[26px] leading-none"
          >
            life
          </button>
          <span
            className={`hidden rounded-full px-3 py-1 text-[12px] font-medium sm:inline-block ${
              darkMode ? 'bg-[#17171B] text-white/75' : 'bg-[#F4F2ED] text-[#4A4A4F]'
            }`}
          >
            {profile.city} · {runwayPill}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleDarkMode}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition ${
              darkMode
                ? 'bg-[#17171B] text-amber-300 hover:bg-[#222228]'
                : 'bg-[#F4F2ED] text-[#141416] hover:bg-[#EAE6DD]'
            }`}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{darkMode ? 'White' : 'Dark'}</span>
          </button>

          <button
            type="button"
            onClick={onSwitchToPhoneView}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition ${
              darkMode
                ? 'bg-[#17171B] text-white/90 hover:bg-[#222228]'
                : 'bg-[#F4F2ED] text-[#141416] hover:bg-[#EAE6DD]'
            }`}
            title="Preview inside Titanium iPhone"
          >
            <Smartphone className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Phone</span>
          </button>

          <button
            type="button"
            onClick={onToggleStudio}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition ${
              studioMode
                ? 'bg-[#2347D8] text-white'
                : darkMode
                  ? 'bg-[#17171B] text-white/90 hover:bg-[#222228]'
                  : 'bg-[#F4F2ED] text-[#141416] hover:bg-[#EAE6DD]'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            <span>Studio</span>
          </button>
        </div>
      </header>

      {/* Main 3-Zone Responsive React Workspace */}
      <div className="mx-auto flex max-w-[1400px] gap-6 px-4 pt-2 pb-20 md:px-6 md:pb-8">
        {/* Left Navigation Sidebar (Desktop & Tablet) */}
        <aside className="hidden w-[228px] shrink-0 flex-col justify-between md:flex">
          <div
            className={`sticky top-[68px] space-y-5 rounded-[26px] p-3.5 ${
              darkMode ? 'bg-[#121216]' : 'bg-[#F6F6F7]'
            }`}
          >
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = item.matchIds.includes(currentState);
                return (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => onNavigate(item.id)}
                    className={`flex w-full items-center gap-3 rounded-[16px] px-3 py-2.5 text-left text-[13.5px] font-medium transition ${
                      active
                        ? darkMode
                          ? 'bg-white text-[#141416] font-semibold'
                          : 'bg-[#141416] text-white font-semibold'
                        : darkMode
                          ? 'text-white/75 hover:bg-white/[0.06] hover:text-white'
                          : 'text-[#4A4A4F] hover:bg-white hover:text-[#141416]'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="space-y-1.5 pt-2">
              <p
                className={`px-2 text-[11.5px] font-semibold uppercase tracking-wider ${
                  darkMode ? 'text-white/45' : 'text-[#6C6C72]'
                }`}
              >
                Tools
              </p>

              <button
                type="button"
                onClick={() => onOpenOverlay('today-brief')}
                className={`flex w-full items-center gap-2.5 rounded-[16px] px-3 py-2.5 text-left text-[13px] font-medium transition ${
                  darkMode
                    ? 'bg-[#1B1B21] text-white/90 hover:bg-[#23232B]'
                    : 'bg-white text-[#141416] hover:bg-[#EAE6DD]'
                }`}
              >
                <Calendar className="h-4 w-4 shrink-0 text-[#C43929]" />
                <span>Today &amp; schedule</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenOverlay('cash-ledger')}
                className={`flex w-full items-center gap-2.5 rounded-[16px] px-3 py-2.5 text-left text-[13px] font-medium transition ${
                  darkMode
                    ? 'bg-[#1B1B21] text-white/90 hover:bg-[#23232B]'
                    : 'bg-white text-[#141416] hover:bg-[#EAE6DD]'
                }`}
              >
                <Wallet className="h-4 w-4 shrink-0 text-[#16794F]" />
                <span>Cashflow ledger</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenOverlay('health-stack')}
                className={`flex w-full items-center gap-2.5 rounded-[16px] px-3 py-2.5 text-left text-[13px] font-medium transition ${
                  darkMode
                    ? 'bg-[#1B1B21] text-white/90 hover:bg-[#23232B]'
                    : 'bg-white text-[#141416] hover:bg-[#EAE6DD]'
                }`}
              >
                <Activity className="h-4 w-4 shrink-0 text-[#16794F]" />
                <span>Health & bloodwork</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenOverlay('money-work')}
                className={`flex w-full items-center gap-2.5 rounded-[16px] px-3 py-2.5 text-left text-[13px] font-medium transition ${
                  darkMode
                    ? 'bg-[#1B1B21] text-white/90 hover:bg-[#23232B]'
                    : 'bg-white text-[#141416] hover:bg-[#EAE6DD]'
                }`}
              >
                <Briefcase className="h-4 w-4 shrink-0 text-[#C26A1B]" />
                <span>Work, tax & subs</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenOverlay('growth-checkins')}
                className={`flex w-full items-center gap-2.5 rounded-[16px] px-3 py-2.5 text-left text-[13px] font-medium transition ${
                  darkMode
                    ? 'bg-[#1B1B21] text-white/90 hover:bg-[#23232B]'
                    : 'bg-white text-[#141416] hover:bg-[#EAE6DD]'
                }`}
              >
                <Sparkles className="h-4 w-4 shrink-0 text-[#16794F]" />
                <span>Check-ins &amp; growth</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenOverlay('levels-ateam')}
                className={`flex w-full items-center gap-2.5 rounded-[16px] px-3 py-2.5 text-left text-[13px] font-medium transition ${
                  darkMode
                    ? 'bg-[#1B1B21] text-white/90 hover:bg-[#23232B]'
                    : 'bg-white text-[#141416] hover:bg-[#EAE6DD]'
                }`}
              >
                <Award className="h-4 w-4 shrink-0 text-[#2347D8]" />
                <span>Levels & A-Team</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenOverlay('runway-calc')}
                className={`flex w-full items-center gap-2.5 rounded-[16px] px-3 py-2.5 text-left text-[13px] font-medium transition ${
                  darkMode
                    ? 'bg-[#1B1B21] text-white/90 hover:bg-[#23232B]'
                    : 'bg-white text-[#141416] hover:bg-[#EAE6DD]'
                }`}
              >
                <Calculator className="h-4 w-4 shrink-0 text-[#2347D8]" />
                <span>30-day numbers</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenOverlay('life-playbook')}
                className={`flex w-full items-center gap-2.5 rounded-[16px] px-3 py-2.5 text-left text-[13px] font-medium transition ${
                  darkMode
                    ? 'bg-[#1B1B21] text-white/90 hover:bg-[#23232B]'
                    : 'bg-white text-[#141416] hover:bg-[#EAE6DD]'
                }`}
              >
                <MapIcon className="h-4 w-4 shrink-0 text-[#16794F]" />
                <span>6-area life map</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenOverlay('blur-intake')}
                className={`flex w-full items-center gap-2.5 rounded-[16px] px-3 py-2.5 text-left text-[13px] font-medium transition ${
                  darkMode
                    ? 'bg-[#1B1B21] text-white/90 hover:bg-[#23232B]'
                    : 'bg-white text-[#141416] hover:bg-[#EAE6DD]'
                }`}
              >
                <FilePlus2 className="h-4 w-4 shrink-0 text-[#C43929]" />
                <span>Scan bill / letter</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => onOpenOverlay('life-plus')}
              className={`w-full rounded-[18px] p-3 text-left text-[12.5px] transition ${
                darkMode
                  ? 'bg-[#1B1B21] text-white/75 hover:bg-[#23232B]'
                  : 'bg-white text-[#4A4A4F] hover:bg-[#EAE6DD]'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className={`font-semibold ${darkMode ? 'text-white' : 'text-[#141416]'}`}>
                  ◆ life+ · Active
                </p>
                <span className="text-[11.5px] font-semibold text-[#2347D8]">Manage</span>
              </div>
              <p className="mt-0.5 leading-snug">
                {chapter.chapterLabel} · {score.total}%
              </p>
            </button>
          </div>
        </aside>

        {/* Center Main Stage */}
        <main className="min-w-0 flex-1">
          {isHomeActive ? (
            <div className="mx-auto w-full max-w-[740px]">
              {renderMainScreen()}
            </div>
          ) : (
            <div className="mx-auto flex w-full max-w-[540px] justify-center">
              <div
                className={`relative h-[740px] w-full overflow-hidden rounded-[32px] shadow-[0_18px_48px_rgba(0,0,0,0.08)] ${
                  darkMode ? 'bg-[#0C0C0F]' : 'bg-white'
                }`}
              >
                {renderMainScreen()}
              </div>
            </div>
          )}
        </main>

        {/* Right Permanent Reading Panel (xl+ desktop split-pane @statsdesign guide) */}
        <aside className="hidden w-[390px] shrink-0 xl:block">
          <div
            className={`sticky top-[68px] max-h-[calc(100vh-88px)] overflow-y-auto rounded-[28px] p-5 shadow-[0_14px_40px_rgba(0,0,0,0.06)] ${
              darkMode ? 'bg-[#141416]' : 'bg-white'
            } no-scrollbar`}
          >
            <div className="mb-3 flex items-center justify-between">
              <span
                className={`text-[12px] font-semibold uppercase tracking-wider ${
                  darkMode ? 'text-white/50' : 'text-[#6C6C72]'
                }`}
              >
                Reading & Action Guide
              </span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold ${
                  darkMode ? 'bg-white/10 text-white/85' : 'bg-[#F4F2ED] text-[#141416]'
                }`}
              >
                {focusedTask.valueBadge}
              </span>
            </div>

            <TaskReadingSheet
              task={focusedTask}
              countryCode={profile.countryCode}
              darkMode={darkMode}
              isCompleted={completedIds.includes(focusedTask.id)}
              recordedOutcome={profile.recordedOutcomes?.[focusedTask.id]}
              checkedSteps={currentSteps}
              onToggleStep={toggleReadingStep}
              onComplete={(note) => {
                if (note) onRecordOutcome(focusedTask.id, note);
                if (!completedIds.includes(focusedTask.id)) {
                  onCompleteTask(focusedTask.id);
                }
              }}
              onAskAboutTask={onAskAboutTask}
              showDragHandle={false}
            />
          </div>
        </aside>
      </div>

      {/* Tablet / Mobile Slide-Up Reading Drawer (< xl screens when a Dashboard move/portal is tapped) */}
      <AnimatePresence>
        {mobileReadingOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseMobileReading}
            className="fixed inset-0 z-40 flex items-end justify-center bg-black/35 backdrop-blur-[2px] xl:hidden sm:items-center sm:p-4"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className={`no-scrollbar max-h-[88vh] w-full max-w-[480px] overflow-y-auto rounded-t-[32px] p-5 shadow-2xl sm:rounded-[32px] ${
                darkMode ? 'bg-[#141416]' : 'bg-white'
              }`}
            >
              <TaskReadingSheet
                task={focusedTask}
              countryCode={profile.countryCode}
                darkMode={darkMode}
                isCompleted={completedIds.includes(focusedTask.id)}
                recordedOutcome={profile.recordedOutcomes?.[focusedTask.id]}
                checkedSteps={currentSteps}
                onToggleStep={toggleReadingStep}
                onComplete={(note) => {
                  if (note) onRecordOutcome(focusedTask.id, note);
                  if (!completedIds.includes(focusedTask.id)) {
                    onCompleteTask(focusedTask.id);
                  }
                }}
                onAskAboutTask={(t) => {
                  onCloseMobileReading();
                  onAskAboutTask(t);
                }}
                onClose={onCloseMobileReading}
                showDragHandle
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Interactive Modal (Runway Calculator / Life Map / Document Scanner) */}
      <AnimatePresence>
        {hasActiveOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCloseOverlay}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/32 backdrop-blur-[2px] sm:items-center sm:p-6"
          >
            <div
              data-web-modal="true"
              onClick={(e) => e.stopPropagation()}
              className="relative h-[680px] max-h-[88vh] w-full max-w-[440px] overflow-hidden rounded-t-[32px] sm:rounded-[32px]"
            >
              {activeOverlayNode}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Tab Bar (< md viewports in React Web App Mode) */}
      <nav
        className={`fixed inset-x-0 bottom-0 z-30 flex items-center justify-around px-2 py-2 backdrop-blur-xl md:hidden ${
          darkMode ? 'bg-[#0C0C0F]/92 text-white' : 'bg-white/92 text-[#141416]'
        }`}
      >
        {[navItems[0], navItems[1], navItems[2], navItems[3], navItems[4]].map((item) => {
          const Icon = item.icon;
          const active = item.matchIds.includes(currentState);
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1 transition ${
                active
                  ? darkMode
                    ? 'text-white'
                    : 'text-[#141416]'
                  : darkMode
                    ? 'text-white/45'
                    : 'text-[#6C6C72]'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[11px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
