import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  Play,
  Send,
} from 'lucide-react';
import { DottedOrbIcon } from '../LifeOSIcons';
import { TaskReadingSheet } from '../TaskReadingSheet';
import { LIFE_DESTINATIONS } from '@life/core/engine';
import {
  ActiveFunctionOverlay,
  LifeOSStateId,
  LifeTask,
  RecordedOutcome,
  ScoreBreakdown,
  UserProfile,
} from '@life/core/types';
import { ProgressiveQuestion } from '../functions/ProgressiveQuestion';

interface PortalSpotlightStateProps {
  mode: 'scheme' | 'urgent' | 'profile';
  task: LifeTask;
  profile: UserProfile;
  score: ScoreBreakdown;
  isCompleted: boolean;
  recordedOutcome?: RecordedOutcome;
  darkMode?: boolean;
  onNavigate: (state: LifeOSStateId) => void;
  onCompleteTask: (taskId: string) => void;
  onRecordOutcome?: (taskId: string, summary: string) => void;
  onTriggerIslandFlash: () => void;
  onAskAboutTask: (task: LifeTask) => void;
  onOpenOverlay?: (overlay: ActiveFunctionOverlay) => void;
  onUpdateProfile?: (patch: Partial<UserProfile>) => void;
}

export const PortalSpotlightState: React.FC<PortalSpotlightStateProps> = ({
  mode,
  task,
  profile,
  score,
  isCompleted,
  recordedOutcome,
  darkMode = false,
  onNavigate,
  onCompleteTask,
  onRecordOutcome,
  onTriggerIslandFlash,
  onAskAboutTask,
  onOpenOverlay,
  onUpdateProfile,
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);
  const [flareKey, setFlareKey] = useState(1);

  useEffect(() => {
    setCheckedSteps([]);
    setDrawerOpen(false);
    if (mode === 'urgent') {
      setFlareKey((k) => k + 1);
    }
    if (mode === 'scheme') {
      const timer = setTimeout(() => onTriggerIslandFlash(), 240);
      return () => clearTimeout(timer);
    }
  }, [mode, task.id]);

  const toggleStep = (idx: number) => {
    setCheckedSteps((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  const handlePrimaryAction = () => {
    if (mode === 'scheme') {
      onTriggerIslandFlash();
    } else if (mode === 'urgent') {
      setFlareKey((k) => k + 1);
    }
    setDrawerOpen(true);
  };

  // ==================== MODE 3: PROFILE PULSE (f_19.6.png) ====================
  if (mode === 'profile') {
    return (
      <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-black px-4 pt-14 pb-5 text-white">
        <img
          src="/art/aura-portrait.png"
          alt="LifeOS Profile Portrait"
          className="pointer-events-none absolute inset-0 h-[78%] w-full object-cover object-top"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/15 via-transparent 55% to-black 82%" />

        <div className="relative z-10 flex items-center justify-between">
          <button
            type="button"
            onClick={() => onNavigate('hub-light')}
            className="rounded-full bg-black/45 px-3 py-1.5 text-[12px] font-medium text-white/90 backdrop-blur-md"
          >
            ← Hub
          </button>
          <span className="rounded-full bg-black/45 px-3 py-1.5 text-[12px] font-medium text-white/90 backdrop-blur-md">
            {profile.city} · Age {profile.age}
          </span>
        </div>

        <div className="flex-1" />

        {/* Frosted Blurred Notification Banner + Score Card */}
        <div className="relative z-10 space-y-3.5">
          <motion.div
            initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 0.45 }}
            className="rounded-[22px] bg-white/[0.12] p-3.5 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <motion.div
                  layoutId="hero-score-pill"
                  className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#2347D8] to-[#141416] font-serif-editorial text-[22px] font-semibold text-white"
                >
                  {score.total}
                </motion.div>
                <div>
                  <p className="text-[14px] font-semibold text-white">
                    {profile.name} · {score.tierLabel}
                  </p>
                  <p className="text-[12.5px] text-white/75">
                    {LIFE_DESTINATIONS.find((d) => d.id === profile.destination)?.shortLabel ??
                      'Your plan'}{' '}
                    · {profile.setupRails?.length ?? 0}/5 basics set · Next milestone {score.nextMilestone}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('intake-portal')}
                className="rounded-full bg-white/15 px-3 py-1.5 text-[12px] font-medium text-white hover:bg-white/25"
              >
                Edit
              </button>
            </div>

            {/* 4 Life Pillar Bars */}
            <div className="mt-3 grid grid-cols-4 gap-2 text-center">
              {[
                { label: 'Capital', val: score.capital },
                { label: 'Gov', val: score.gov },
                { label: 'Health', val: score.health },
                { label: 'Growth', val: score.growth },
              ].map((p) => (
                <div key={p.label} className="rounded-xl bg-black/30 px-1.5 py-2">
                  <div className="text-[13px] font-semibold text-white">{p.val}%</div>
                  <div className="text-[11.5px] text-white/70">{p.label}</div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Phone-First Check-ins & Self-Calibration Parity Panel */}
          <div className="no-scrollbar max-h-[270px] space-y-2 overflow-y-auto">
            {onUpdateProfile && (
              <div className="rounded-[20px] bg-white/95 p-0.5 text-[#141416] shadow-lg">
                <ProgressiveQuestion
                  compact
                  profile={profile}
                  darkMode={false}
                  onUpdateProfile={onUpdateProfile}
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {onOpenOverlay && (
                <button
                  type="button"
                  onClick={() => onOpenOverlay('growth-checkins')}
                  className="rounded-[18px] bg-white/[0.14] p-3 text-left text-white backdrop-blur-xl transition hover:bg-white/[0.2]"
                >
                  <p className="text-[12px] font-semibold text-[#72D2A3]">
                    Check-ins ({Object.values(profile.growth?.checkIns ?? {}).filter((x) => x?.length).length}/6)
                  </p>
                  <p className="mt-0.5 text-[13px] font-semibold leading-tight">
                    Preferences, SWOT & EQ
                  </p>
                </button>
              )}

              {onOpenOverlay && (
                <button
                  type="button"
                  onClick={() => onOpenOverlay('health-stack')}
                  className="rounded-[18px] bg-white/[0.14] p-3 text-left text-white backdrop-blur-xl transition hover:bg-white/[0.2]"
                >
                  <p className="text-[12px] font-semibold text-[#A9BEFF]">
                    Routine Streak ({profile.habitStreakDays ?? 4}/30)
                  </p>
                  <p className="mt-0.5 text-[13px] font-semibold leading-tight">
                    Water, AM/PM & Bloods
                  </p>
                </button>
              )}
            </div>

            {onOpenOverlay && (
              <button
                type="button"
                onClick={() => onOpenOverlay('levels-ateam')}
                className="flex w-full items-center justify-between rounded-[18px] bg-white/[0.12] px-3.5 py-2.5 text-left text-white backdrop-blur-xl transition hover:bg-white/[0.18]"
              >
                <span className="text-[13px] font-medium">
                  Weekly recap, New Normal rules &amp; Monthly gambit
                </span>
                <span className="text-[12px] font-semibold text-white/80">Open →</span>
              </button>
            )}
          </div>

          {/* Bottom Send + Dotted Pill */}
          <div className="flex items-center justify-between px-1">
            <button
              type="button"
              onClick={() => onNavigate('chat')}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-md transition active:scale-90"
              aria-label="Open Chat"
            >
              <Send className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('task-deck')}
              className="text-white/45 transition hover:text-white"
              aria-label="Open Task Deck"
            >
              <ChevronUp className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => onNavigate('voice-dark')}
              className="flex h-9 items-center gap-2 rounded-full bg-[#1A1A1E] px-4 text-[12px] text-white/85 transition hover:bg-[#24242A]"
            >
              <DottedOrbIcon size={15} />
              <span>Pulse</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==================== MODE 2: URGENT ALERT PORTAL (f_21.6.png) ====================
  if (mode === 'urgent') {
    return (
      <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-[#1a0502] px-4 pt-13 pb-5 text-white">
        {/* Background Atmospheric Desert/Horizon Artwork */}
        <img
          src={task.imageUrl}
          alt={task.title}
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/45 via-amber-900/15 to-[#180302]/95" />

        {/* Signature Golden Horizon Solar Flare Sweep */}
        <div
          key={flareKey}
          className="animate-horizon-flare pointer-events-none absolute inset-x-[-20%] top-12 z-20 h-32 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,248,225,0.92)_0%,rgba(255,200,110,0.55)_42%,transparent_75%)] blur-xl"
        />

        {/* Top 2 Stacked Frosted Dark Glass Cards (exact match to f_21.6.png) */}
        <div className="relative z-10 space-y-2 pt-1">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-start gap-3 rounded-[20px] bg-black/42 p-3 backdrop-blur-xl"
          >
            <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-br from-slate-200/70 to-amber-200/40" />
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-white/65">Urgent · Worth sorting now</p>
              <p className="mt-0.5 text-[13px] leading-[1.38] text-white/95">
                {task.insightSummary}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.05 }}
            className="flex items-start gap-3 rounded-[20px] bg-black/48 p-3.5 backdrop-blur-xl"
          >
            <div className="h-9 w-9 shrink-0 rounded-xl bg-gradient-to-b from-[#7B9BFF] via-[#2347D8] to-[#0B122E]" />
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-white/65">Why it matters</p>
              <p className="mt-0.5 text-[13px] leading-[1.38] text-white/95">
                {task.personalWhy}
              </p>
            </div>
          </motion.div>
        </div>

        <div className="flex-1" />

        {/* Bottom Editorial Title + Subtitle + White CTA Pill */}
        <div className="relative z-10 flex flex-col items-center text-center">
          <h2 className="font-serif-editorial text-[32px] leading-tight tracking-[-0.01em] text-white">
            {task.title}
          </h2>
          <p className="mt-0.5 text-[13px] text-white/75">{task.subtitle}</p>

          <motion.button
            type="button"
            whileTap={{ scale: 0.94 }}
            onClick={handlePrimaryAction}
            className={`mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold shadow-lg transition ${
              isCompleted
                ? 'bg-[#EAF6EF] text-[#16794F]'
                : 'bg-white text-[#141416] hover:bg-white/92'
            }`}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>{recordedOutcome ? 'Saved' : `Done · +${task.scoreDelta} pts`}</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Show me how</span>
              </>
            )}
          </motion.button>

          {/* Bottom Navigation Strip */}
          <div className="mt-5 flex w-full items-center justify-between px-2">
            <button
              type="button"
              onClick={() => onNavigate('task-deck')}
              className="text-white/75 transition hover:text-white"
              aria-label="Back to missions"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="rounded-full bg-white/12 px-3 py-1 text-[12px] font-medium text-white/90 transition hover:bg-white/20"
            >
              {drawerOpen ? 'Hide guide' : 'Steps & record outcome'}
            </button>

            <button
              type="button"
              onClick={() => onAskAboutTask(task)}
              className="text-white/75 transition hover:text-white"
              aria-label="Ask in Chat"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          </div>
        </div>

        <ChecklistDrawer
          open={drawerOpen}
          task={task}
          countryCode={profile.countryCode}
          darkMode={darkMode}
          isCompleted={isCompleted}
          recordedOutcome={recordedOutcome}
          checkedSteps={checkedSteps}
          onClose={() => setDrawerOpen(false)}
          onToggleStep={toggleStep}
          onAskAboutTask={onAskAboutTask}
          onComplete={(outcomeNote) => {
            if (outcomeNote && onRecordOutcome) {
              onRecordOutcome(task.id, outcomeNote);
            }
            if (!isCompleted) onCompleteTask(task.id);
          }}
        />
      </div>
    );
  }

  // ==================== MODE 1: SCHEME / LOAN SPOTLIGHT (f_17.0.png) ====================
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-black px-4 pt-13 pb-5 text-white">
      <img
        src={task.imageUrl}
        alt={task.title}
        className="pointer-events-none absolute inset-0 h-[82%] w-full object-cover"
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/30 via-transparent 52% to-black 86%" />

      {/* Top Glass Capsule Pill */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 mt-1 flex items-center justify-between rounded-full bg-black/52 px-2.5 py-2 backdrop-blur-xl"
      >
        <div className="flex min-w-0 items-center gap-2.5">
          <img
            src="/art/aura-portrait.png"
            alt="LifeOS Guide"
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="truncate text-[12.5px] font-semibold text-white">
              life · {profile.city}
            </p>
            <p className="truncate text-[12px] text-white/75">
              Matched for age {profile.age} · {task.valueBadge}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onAskAboutTask(task)}
          className="shrink-0 rounded-full bg-white/16 px-3 py-1 text-[12px] font-medium text-white transition hover:bg-white/25"
        >
          Explain
        </button>
      </motion.div>

      <div className="flex-1" />

      {/* Bottom Focal Stack: Square Emblem + Editorial Serif Title + Subtitle + White CTA */}
      <div className="relative z-10 flex flex-col items-center text-center">
        <div className="mb-3 h-12 w-12 overflow-hidden rounded-xl shadow-lg">
          <img src="/art/editorial-card.png" alt="" className="h-full w-full object-cover" />
        </div>

        <h2 className="font-serif-editorial text-[32px] leading-tight tracking-[-0.01em] text-white">
          {task.title}
        </h2>
        <p className="mt-0.5 text-[13px] text-white/80">{task.subtitle}</p>

        <motion.button
          type="button"
          whileTap={{ scale: 0.94 }}
          onClick={handlePrimaryAction}
          className={`mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-semibold shadow-lg transition ${
            isCompleted
              ? 'bg-[#EAF6EF] text-[#16794F]'
              : 'bg-white text-[#141416] hover:bg-white/92'
          }`}
        >
          {isCompleted ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              <span>{recordedOutcome ? 'Saved outcome' : `Done · +${task.scoreDelta} pts`}</span>
            </>
          ) : (
            <>
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Show me how</span>
            </>
          )}
        </motion.button>

        {/* Bottom Controls */}
        <div className="mt-5 flex w-full items-center justify-between px-1">
          <button
            type="button"
            onClick={() => onNavigate('chat')}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-black shadow-md transition hover:scale-105 active:scale-95"
            aria-label="Open Chat"
          >
            <Send className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="rounded-full bg-white/14 px-3.5 py-1.5 text-[12px] font-medium text-white/90 transition hover:bg-white/22"
          >
            {drawerOpen ? 'Hide reading guide' : 'Open reading guide'}
          </button>

          <button
            type="button"
            onClick={() => onAskAboutTask(task)}
            className="text-white/75 transition hover:text-white"
            aria-label="Ask in Chat"
          >
            <MessageSquare className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ChecklistDrawer
        open={drawerOpen}
        task={task}
        countryCode={profile.countryCode}
        darkMode={darkMode}
        isCompleted={isCompleted}
        recordedOutcome={recordedOutcome}
        checkedSteps={checkedSteps}
        onClose={() => setDrawerOpen(false)}
        onToggleStep={toggleStep}
        onAskAboutTask={onAskAboutTask}
        onComplete={(outcomeNote) => {
          if (outcomeNote && onRecordOutcome) {
            onRecordOutcome(task.id, outcomeNote);
          }
          if (!isCompleted) onCompleteTask(task.id);
        }}
      />
    </div>
  );
};

const ChecklistDrawer: React.FC<{
  open: boolean;
  task: LifeTask;
  countryCode: UserProfile['countryCode'];
  darkMode: boolean;
  isCompleted: boolean;
  recordedOutcome?: RecordedOutcome;
  checkedSteps: number[];
  onClose: () => void;
  onToggleStep: (idx: number) => void;
  onAskAboutTask: (task: LifeTask) => void;
  onComplete: (outcomeNote?: string) => void;
}> = ({
  open,
  task,
  countryCode,
  darkMode,
  isCompleted,
  recordedOutcome,
  checkedSteps,
  onClose,
  onToggleStep,
  onAskAboutTask,
  onComplete,
}) => {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-20 bg-black/38 backdrop-blur-[2px]"
            aria-label="Dismiss guide"
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className={`no-scrollbar absolute inset-x-0 bottom-0 z-30 max-h-[86%] overflow-y-auto rounded-t-[32px] px-5 pt-3 pb-7 shadow-[0_-24px_60px_rgba(0,0,0,0.32)] ${
              darkMode ? 'bg-[#141416] text-white' : 'bg-white text-[#141416]'
            }`}
          >
            <TaskReadingSheet
              task={task}
              countryCode={countryCode}
              darkMode={darkMode}
              isCompleted={isCompleted}
              recordedOutcome={recordedOutcome}
              checkedSteps={checkedSteps}
              onToggleStep={onToggleStep}
              onComplete={onComplete}
              onAskAboutTask={onAskAboutTask}
              onClose={onClose}
              showDragHandle
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
