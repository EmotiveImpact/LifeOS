import React from 'react';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Award,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Compass,
  Droplets,
  Eye,
  EyeOff,
  Home,
  Layers,
  MessageSquarePlus,
  Moon,
  Pencil,
  Sun,
  User,
} from 'lucide-react';
import {
  computeGameChapter,
  computeLifeAreaProgress,
  computeLifeImpact,
  computeLifeLevelState,
  getConnectedPortals,
  getCurrencySymbol,
  localDateString,
  THINKER_ATEAM,
} from '@life/core/engine';
import {
  ActiveFunctionOverlay,
  LifeOSStateId,
  LifeTask,
  ScoreBreakdown,
  UserProfile,
} from '@life/core/types';

import { getGrowthTimeline, isGrowthProgressReviewDue } from '@life/core/growth';
import { ProgressiveQuestion } from '../functions/ProgressiveQuestion';

interface HubStateProps {
  mode: 'light' | 'dark';
  profile: UserProfile;
  score: ScoreBreakdown;
  activeTasks: LifeTask[];
  eligibleTasks: LifeTask[];
  completedIds: string[];
  comingUpCount: number;
  onNavigate: (state: LifeOSStateId) => void;
  onSelectTask: (task: LifeTask, targetState?: LifeOSStateId) => void;
  onSendMessage: (text: string) => void;
  onOpenOverlay: (overlay: ActiveFunctionOverlay) => void;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  onToggleDarkMode?: () => void;
  hideMobileTabBar?: boolean;
}

const RingProgress: React.FC<{
  pct: number;
  label: string;
  darkMode: boolean;
  accentHex?: string;
}> = ({ pct, label, darkMode, accentHex = '#2347D8' }) => {
  const radius = 17;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(8, Math.min(100, pct));
  const strokeDashoffset = circumference - (clamped / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative flex h-11 w-11 items-center justify-center">
        <svg className="h-11 w-11 -rotate-90" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke={darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(20,20,22,0.09)'}
            strokeWidth="3.2"
          />
          <circle
            cx="22"
            cy="22"
            r={radius}
            fill="none"
            stroke={clamped >= 70 ? '#16794F' : accentHex}
            strokeWidth="3.2"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-500"
          />
        </svg>
        <span
          className={`absolute text-[11.5px] font-semibold ${
            darkMode ? 'text-white/90' : 'text-[#141416]'
          }`}
        >
          {Math.round(pct)}%
        </span>
      </div>
      <span
        className={`text-[12px] font-medium ${
          darkMode ? 'text-white/75' : 'text-[#4A4A4F]'
        }`}
      >
        {label}
      </span>
    </div>
  );
};

export const HubState: React.FC<HubStateProps> = ({
  mode,
  profile,
  score,
  activeTasks,
  eligibleTasks,
  completedIds,
  comingUpCount,
  onNavigate,
  onSelectTask,
  onOpenOverlay,
  onUpdateProfile,
  onToggleDarkMode,
  hideMobileTabBar = false,
}) => {
  const isDark = mode === 'dark';
  const symbol = getCurrencySymbol(profile.countryCode);
  const runway = profile.runway;
  const chapter = computeGameChapter(profile, eligibleTasks, completedIds);
  const impact = computeLifeImpact(profile, eligibleTasks, completedIds);
  const areaProgress = computeLifeAreaProgress(profile, eligibleTasks, completedIds);
  const fourAreas = areaProgress.slice(0, 4);
  const completedAreaCount = fourAreas.filter((a) => a.updated).length;

  const nextTask = activeTasks[0];
  const partnerMoves = activeTasks.filter((task) => task.id !== nextTask?.id);
  const portals = getConnectedPortals(profile, completedIds).slice(0, 3);
  const levelState = computeLifeLevelState(profile, eligibleTasks, completedIds);
  const newGambits = levelState.unlockedGambits.filter((task) => task.id !== nextTask?.id && !partnerMoves.some((move) => move.id === task.id)).slice(0, 3);
  const growthToday = localDateString();
  const growthReview = profile.growth && (isGrowthProgressReviewDue(profile.growth, growthToday)
    || getGrowthTimeline(profile.growth, growthToday).some((item) => item.reviewDue));
  const heroThinker =
    THINKER_ATEAM[(completedIds.length + (profile.health?.waterMlToday ? 1 : 0)) % THINKER_ATEAM.length];
  const hideBalances = Boolean(profile.hideBalances);
  const completedCheckInsCount = Object.values(profile.growth?.checkIns ?? {}).filter(
    (entries) => Boolean(entries && entries.length > 0)
  ).length;

  const cardSurface = isDark ? 'bg-[#16161B]' : 'bg-[#F6F6F7]';
  const innerTileSurface = isDark ? 'bg-[#202026]' : 'bg-white';
  const mutedText = isDark ? 'text-white/65' : 'text-[#525258]';
  const pillSurface = isDark
    ? 'bg-white/10 text-white hover:bg-white/18'
    : 'bg-white text-[#141416] hover:bg-[#EAE6DD]';

  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between overflow-hidden transition-colors duration-250 ${
        hideMobileTabBar ? 'bg-transparent p-0' : 'px-4 pt-4 sm:pt-12 pb-2'
      } ${
        hideMobileTabBar
          ? isDark
            ? 'text-[#F5F4F0]'
            : 'text-[#141416]'
          : isDark
            ? 'bg-[#0C0C0F] text-[#F5F4F0]'
            : 'bg-white text-[#141416]'
      }`}
    >
      {/* Top Bar: Clean Editorial Title + [Check in] + [Edit Profile] + [Dark Toggle] */}
      <div className="relative z-10 flex items-center justify-between gap-2 pb-2">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => onOpenOverlay('levels-ateam')}
            className="font-serif-editorial text-[26px] leading-none tracking-[-0.01em] hover:opacity-80"
          >
            life
          </button>
          <p className={`mt-1 truncate text-[12.5px] font-medium ${mutedText}`}>
            {profile.city} · Level {levelState.currentLevel} · {levelState.unlockedNormals.length > 0 ? 'New Normal' : 'Stabilizing'}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenOverlay('growth-checkins')}
            className={`relative inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-semibold transition ${
              isDark ? 'bg-[#202026] text-white hover:bg-[#2A2A32]' : 'bg-[#F4F2ED] text-[#141416] hover:bg-[#EAE6DD]'
            }`}
            title="Open daily & self check-ins"
          >
            <CheckCircle2 className={`h-3.5 w-3.5 ${growthReview ? 'text-[#C43929]' : 'text-[#16794F]'}`} />
            <span>Check in</span>
            {growthReview && <span className="h-1.5 w-1.5 rounded-full bg-[#C43929]" />}
          </button>

          <button
            type="button"
            onClick={() => onNavigate('intake-portal')}
            className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
              isDark ? 'bg-[#17171B] text-white/85 hover:bg-[#222228]' : 'bg-[#F4F2ED] text-[#141416] hover:bg-[#EAE6DD]'
            }`}
            title="Edit your goals & details"
            aria-label="Edit check-in"
          >
            <Pencil className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={() =>
              onToggleDarkMode
                ? onToggleDarkMode()
                : onNavigate(isDark ? 'hub-light' : 'voice-dark')
            }
            className={`flex h-9 w-9 items-center justify-center rounded-full transition ${
              isDark ? 'bg-[#17171B] text-amber-300 hover:bg-[#222228]' : 'bg-[#F4F2ED] text-[#141416] hover:bg-[#EAE6DD]'
            }`}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Main Scrollable Feed */}
      <div
        className={`no-scrollbar relative z-10 flex-1 space-y-3 overflow-y-auto pb-3 ${
          hideMobileTabBar ? '' : 'pr-0.5'
        }`}
      >
        {/* 1. CONVERSATIONAL CALM TRIAGE + HERO PHASE CARD (Refs 09, 10, 14) */}
        <section className={`rounded-[24px] p-4 ${cardSurface}`}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="text-[17px] leading-[1.24] font-semibold tracking-[-0.01em]">
                Phase {chapter.chapterNumber} — Getting ahead
              </h2>
              <p className={`mt-1 text-[13.5px] leading-[1.42] ${mutedText}`}>
                You have{' '}
                <strong className={isDark ? 'text-white' : 'text-[#141416]'}>
                  {activeTasks.length} live moves
                </strong>
                ,{' '}
                <strong className={isDark ? 'text-white' : 'text-[#141416]'}>
                  {hideBalances ? '••••' : impact.unclaimedFormatted}
                </strong>{' '}
                to check, and{' '}
                <strong className={isDark ? 'text-white' : 'text-[#141416]'}>
                  {completedCheckInsCount}/6 check-ins
                </strong>{' '}
                saved.
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <button
                type="button"
                onClick={() => onUpdateProfile({ hideBalances: !hideBalances })}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${pillSurface}`}
                title={hideBalances ? 'Show balances' : 'Hide balances'}
                aria-label={hideBalances ? 'Show balances' : 'Hide balances'}
              >
                {hideBalances ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('chat')}
                className={`flex h-8 w-8 items-center justify-center rounded-full transition ${pillSurface}`}
                title="Ask coach"
                aria-label="Ask coach"
              >
                <MessageSquarePlus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 3-Column Metrics Strip */}
          <div className="mt-3 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => onOpenOverlay('cash-ledger')}
              className={`rounded-[16px] p-2.5 text-left transition hover:opacity-90 ${innerTileSurface}`}
            >
              <p className={`text-[12px] ${mutedText}`}>Next 30 days</p>
              <p
                className={`mt-1 text-[14.5px] font-semibold ${
                  runway
                    ? runway.netRunway < 0
                      ? isDark
                        ? 'text-[#F0887A]'
                        : 'text-[#C43929]'
                      : isDark
                        ? 'text-[#72D2A3]'
                        : 'text-[#16794F]'
                    : ''
                }`}
              >
                {hideBalances
                  ? '••••'
                  : runway
                    ? `${runway.netRunway >= 0 ? '+' : '-'}${symbol}${Math.abs(runway.netRunway).toLocaleString()}`
                    : 'Ledger →'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('task-deck')}
              className={`rounded-[16px] p-2.5 text-left transition hover:opacity-90 ${innerTileSurface}`}
            >
              <p className={`text-[12px] ${mutedText}`}>Worth checking</p>
              <p className="mt-1 text-[14.5px] font-semibold">
                {hideBalances ? '••••' : impact.unclaimedFormatted}
              </p>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('profile-pulse')}
              className={`rounded-[16px] p-2.5 text-left transition hover:opacity-90 ${innerTileSurface}`}
            >
              <p className={`text-[12px] ${mutedText}`}>Readiness</p>
              <p className="mt-1 text-[14.5px] font-semibold">{score.total}%</p>
            </button>
          </div>

          {/* Stacked Peeking Notification Cards (Refs 10 & 14) */}
          <div className="mt-3 space-y-1.5">
            {nextTask && (
              <button
                type="button"
                onClick={() =>
                  onSelectTask(
                    nextTask,
                    nextTask.urgency === 'urgent' ? 'urgent-alert' : 'scheme-portal'
                  )
                }
                className={`relative z-30 flex w-full items-center justify-between gap-2.5 rounded-[18px] px-3.5 py-2.5 text-left transition active:scale-[0.99] ${
                  isDark ? 'bg-[#2B3352] text-white' : 'bg-[#EEF2FD] text-[#141416]'
                }`}
              >
                <div className="min-w-0">
                  <span className={`block text-[11.5px] font-semibold ${isDark ? 'text-[#A9BEFF]' : 'text-[#2347D8]'}`}>
                    {nextTask.provider} · Priority Move
                  </span>
                  <span className="block truncate text-[13.5px] font-semibold">{nextTask.title}</span>
                </div>
                <ArrowRight className="h-4 w-4 shrink-0" />
              </button>
            )}
            <button
              type="button"
              onClick={() => onOpenOverlay('growth-checkins')}
              className={`relative z-20 -mt-1 flex w-full items-center justify-between gap-2.5 rounded-[18px] px-3.5 py-2.5 text-left transition active:scale-[0.99] ${
                isDark ? 'bg-[#193329] text-white' : 'bg-[#EAF6EF] text-[#141416]'
              }`}
            >
              <div className="min-w-0">
                <span className={`block text-[11.5px] font-semibold ${isDark ? 'text-[#72D2A3]' : 'text-[#16794F]'}`}>
                  Daily Check-in · {completedCheckInsCount}/6 reflections
                </span>
                <span className="block truncate text-[13px] font-medium">
                  {growthReview
                    ? 'A check-in review is ready — take 2 mins'
                    : 'Log preferences, SWOT, emotional state & focus'}
                </span>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0" />
            </button>
          </div>

          {/* Clear Next Move Strip */}
          <div className={`mt-2.5 rounded-[18px] p-3 ${innerTileSurface}`}>
            {!runway ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className={`text-[12px] font-semibold ${isDark ? 'text-[#84A0FF]' : 'text-[#2347D8]'}`}>
                    Your next move
                  </p>
                  <p className="mt-0.5 text-[13.5px] font-semibold leading-snug">
                    Find out how much you need for 30 days
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenOverlay('runway-calc')}
                  className="inline-flex items-center gap-1 rounded-full bg-[#2347D8] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#1833A3]"
                >
                  <span>Work it out</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              nextTask && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className={`text-[12px] font-semibold ${isDark ? 'text-[#72D2A3]' : 'text-[#16794F]'}`}>
                      Your next move · {nextTask.valueBadge}
                    </p>
                    <p className="mt-0.5 text-[13.5px] font-semibold leading-snug">{nextTask.title}</p>
                    {nextTask.whySurfaced && <p className={`mt-1 text-[13px] leading-snug ${mutedText}`}>{nextTask.whySurfaced}</p>}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onSelectTask(
                        nextTask,
                        nextTask.urgency === 'urgent' ? 'urgent-alert' : 'scheme-portal'
                      )
                    }
                    className="inline-flex items-center gap-1 rounded-full bg-[#2347D8] px-3.5 py-2 text-[12.5px] font-semibold text-white transition hover:bg-[#1833A3]"
                  >
                    <span>Show me how</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )
            )}
          </div>
        </section>

        <ProgressiveQuestion compact profile={profile} darkMode={isDark} onUpdateProfile={onUpdateProfile} />

        <button type="button" onClick={() => onOpenOverlay('growth-path')}
          className={`flex w-full items-center justify-between gap-3 rounded-[20px] p-4 text-left ${cardSurface}`}>
          <span>
            <span className="block font-serif-editorial text-[23px] leading-tight">{profile.growth?.path === 'reset' ? 'Fix my life' : 'Your growth plan'}</span>
            <span className={`mt-1 block text-[13px] leading-snug ${mutedText}`}>
              {growthReview ? 'A review is ready when you are.' : profile.growth?.path ? 'Your actions, reflections and short lessons.' : 'Find your starting point and choose a reset, goal or skill.'}
            </span>
          </span>
          <ArrowRight className="h-4 w-4 shrink-0" />
        </button>

        {newGambits.length > 0 && (
          <section className={`rounded-[22px] p-4 ${cardSurface}`}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-serif-editorial text-[22px]">Unlocked gambits</h3>
              <button type="button" onClick={() => onOpenOverlay('levels-ateam')} className={`rounded-full px-3 py-1.5 text-[13px] font-medium ${pillSurface}`}>See levels</button>
            </div>
            <div className="mt-2 space-y-2">
              {newGambits.map((task) => (
                <button type="button" key={task.id} onClick={() => onSelectTask(task, 'scheme-portal')}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl p-3 text-left ${innerTileSurface}`}>
                  <span className="text-[13px] font-medium">{task.title}</span>
                  <ArrowRight className="h-4 w-4 shrink-0" />
                </button>
              ))}
            </div>
          </section>
        )}

        {/* LIFE OPERATING STACKS: Health, Work/Tax/Subs, Levels & A-Team */}
        <section className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => onOpenOverlay('health-stack')}
            className={`flex flex-col items-start rounded-[18px] p-3 text-left transition hover:opacity-90 ${cardSurface}`}
          >
            <Droplets className="h-4 w-4 text-[#16794F]" />
            <span className="mt-1.5 text-[12.5px] font-semibold leading-tight">Health Stack</span>
            <span className={`mt-0.5 truncate w-full text-[11.5px] ${mutedText}`}>
              {profile.health?.waterMlToday ?? 0}ml · Bloods
            </span>
          </button>

          <button
            type="button"
            onClick={() => onOpenOverlay('money-work')}
            className={`flex flex-col items-start rounded-[18px] p-3 text-left transition hover:opacity-90 ${cardSurface}`}
          >
            <Briefcase className="h-4 w-4 text-[#C26A1B]" />
            <span className="mt-1.5 text-[12.5px] font-semibold leading-tight">Work & Tax</span>
            <span className={`mt-0.5 truncate w-full text-[11.5px] ${mutedText}`}>
              {profile.taxCode} · Subs
            </span>
          </button>

          <button
            type="button"
            onClick={() => onOpenOverlay('levels-ateam')}
            className={`flex flex-col items-start rounded-[18px] p-3 text-left transition hover:opacity-90 ${cardSurface}`}
          >
            <Award className="h-4 w-4 text-[#2347D8]" />
            <span className="mt-1.5 text-[12.5px] font-semibold leading-tight">
              Level {levelState.currentLevel}
            </span>
            <span className={`mt-0.5 truncate w-full text-[11.5px] ${mutedText}`}>
              New Normal
            </span>
          </button>
        </section>

        {/* 2. FOUR AREAS PROGRESS RINGS (Image 5 Circular Progress Card) */}
        <section
          onClick={() => onOpenOverlay('life-playbook')}
          className={`cursor-pointer rounded-[24px] p-4 transition hover:opacity-95 ${cardSurface}`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-[11.5px] font-semibold tracking-wider uppercase ${mutedText}`}>
              Chapter {chapter.chapterNumber} · {completedAreaCount} of 4 sorted
            </span>
            <span className={`text-[12px] font-semibold ${isDark ? 'text-[#84A0FF]' : 'text-[#2347D8]'}`}>
              6-area map →
            </span>
          </div>
          <h3 className="mt-1 text-[16px] font-semibold">Four Areas. One Plan.</h3>

          <div className="mt-3.5 grid grid-cols-4 gap-2">
            {fourAreas.map((area, i) => (
              <RingProgress
                key={area.id}
                pct={area.progressPct}
                label={area.label}
                darkMode={isDark}
                accentHex={
                  i === 0 ? '#2347D8' : i === 1 ? '#141416' : i === 2 ? '#16794F' : '#C43929'
                }
              />
            ))}
          </div>
        </section>

        {/* 3. YOUR NEXT MOVES & WORTH A LOOK (Image 5 Frequent Partners Row Density) */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-[14px] font-semibold">Worth doing & checking</h3>
            <button
              type="button"
              onClick={() => onNavigate('task-deck')}
              className={`text-[12.5px] font-medium ${mutedText} hover:underline`}
            >
              All {activeTasks.length + comingUpCount} →
            </button>
          </div>

          <div className="space-y-2">
            {partnerMoves.map((task) => {
              const initials = task.shortTitle.slice(0, 2).toUpperCase();
              const badgeColor =
                task.urgency === 'urgent'
                  ? 'bg-[#C43929] text-white'
                  : task.category === 'health'
                    ? 'bg-[#16794F] text-white'
                    : 'bg-[#2347D8] text-white';

              return (
                <div
                  key={task.id}
                  onClick={() =>
                    onSelectTask(
                      task,
                      task.urgency === 'urgent' ? 'urgent-alert' : 'scheme-portal'
                    )
                  }
                  className={`flex cursor-pointer items-center justify-between gap-2.5 rounded-[20px] px-3.5 py-3 transition hover:opacity-95 ${cardSurface}`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[12px] font-semibold ${badgeColor}`}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-semibold">{task.shortTitle}</p>
                      <p className={`truncate text-[12.5px] ${mutedText}`}>
                        {task.whySurfaced ?? task.subtitle}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-medium ${pillSurface}`}
                  >
                    {task.stillToCheck && task.stillToCheck.length > 0 ? 'Check' : 'Open'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. CONNECTED PORTALS & RAILS (Image 5 Connected Apps Card) */}
        <section>
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-[14px] font-semibold">Portals & core accounts</h3>
            <button
              type="button"
              onClick={() => onOpenOverlay('life-playbook')}
              className={`text-[12.5px] font-medium ${mutedText} hover:underline`}
            >
              Manage
            </button>
          </div>

          <div className={`space-y-1 rounded-[22px] p-1.5 ${cardSurface}`}>
            {portals.map((portal) => {
              const linked =
                eligibleTasks.find((t) => t.id === portal.linkedTaskId) ??
                eligibleTasks[0];
              return (
                <div
                  key={portal.id}
                  onClick={() =>
                    linked
                      ? onSelectTask(
                          linked,
                          linked.urgency === 'urgent' ? 'urgent-alert' : 'scheme-portal'
                        )
                      : onOpenOverlay('life-playbook')
                  }
                  className={`flex cursor-pointer items-center justify-between gap-2.5 rounded-[16px] px-2.5 py-2.5 transition ${
                    isDark ? 'hover:bg-white/[0.05]' : 'hover:bg-white'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[12px] font-bold text-white"
                      style={{ backgroundColor: portal.badgeBg }}
                    >
                      {portal.badgeText}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-[13.5px] font-semibold">{portal.name}</p>
                      <p className={`truncate text-[12.5px] ${mutedText}`}>{portal.subtitle}</p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold ${
                      portal.status === 'connected'
                        ? isDark
                          ? 'bg-[#16794F]/30 text-[#72D2A3]'
                          : 'bg-[#EAF6EF] text-[#16794F]'
                        : pillSurface
                    }`}
                  >
                    {portal.status === 'connected'
                      ? 'Active'
                      : portal.status === 'setup'
                        ? 'Set up'
                        : 'Open'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 5. COMING UP + DAILY PRACTICAL NOTE / TIER FOOTER */}
        <section className={`rounded-[22px] p-3.5 ${cardSurface}`}>
          <button
            type="button"
            onClick={() => onOpenOverlay('today-brief')}
            className="flex w-full items-center justify-between text-left"
          >
            <div className="flex min-w-0 items-center gap-2 pr-2">
              <CalendarClock className="h-4 w-4 shrink-0 text-[#C43929]" />
              <span className="truncate text-[13px] font-medium">
                {runway
                  ? `${runway.dueSoonLabel} · ${runway.followUpLabel}`
                  : 'Coming up: Rent due in 6 days · Call Tuesday'}
              </span>
            </div>
            <span className={`shrink-0 text-[12px] font-semibold ${isDark ? 'text-white/75' : 'text-[#4A4A4F]'}`}>
              Brief →
            </span>
          </button>

          <div className="mt-2.5 pt-2.5">
            <div className="flex items-start justify-between gap-2">
              <p className={`text-[12.5px] font-medium leading-snug ${mutedText}`}>
                ◆ <strong className={isDark ? 'text-white' : 'text-[#141416]'}>{heroThinker.name}:</strong>{' '}
                {heroThinker.appliedRule}
              </p>
              <div className="flex shrink-0 items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => onOpenOverlay('levels-ateam')}
                  className="text-[12px] font-semibold text-[#2347D8]"
                >
                  A-Team
                </button>
                <button
                  type="button"
                  onClick={() => onOpenOverlay('life-plus')}
                  className={`text-[12px] font-semibold ${isDark ? 'text-white/75' : 'text-[#4A4A4F]'}`}
                >
                  life+
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Bottom 4-Tab Navigation Bar (Image 5 Bottom Chrome inside phone) */}
      {!hideMobileTabBar && (
        <nav
          className={`relative z-20 flex items-center justify-around pt-1.5 pb-1 ${
            isDark ? 'bg-[#0C0C0F]' : 'bg-white'
          }`}
        >
          {[
            { icon: Home, label: 'Home', target: isDark ? 'voice-dark' : 'hub-light', active: true },
            { icon: Compass, label: 'Discover', target: 'aura-search', active: false },
            { icon: Layers, label: 'Missions', target: 'task-deck', active: false },
            { icon: User, label: 'You', target: 'profile-pulse', active: false },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <motion.button
                key={tab.label}
                type="button"
                whileTap={{ scale: 0.92 }}
                onClick={() => onNavigate(tab.target as LifeOSStateId)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1 transition ${
                  tab.active
                    ? isDark
                      ? 'text-white'
                      : 'text-[#141416]'
                    : isDark
                      ? 'text-white/45 hover:text-white/80'
                      : 'text-[#76767C] hover:text-[#141416]'
                }`}
              >
                <Icon className="h-[19px] w-[19px]" />
                <span className="text-[11px] font-medium">{tab.label}</span>
              </motion.button>
            );
          })}
        </nav>
      )}
    </div>
  );
};
