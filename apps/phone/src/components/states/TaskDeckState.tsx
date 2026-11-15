import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, HelpCircle, Home, Lock, Navigation, Sparkles } from 'lucide-react';
import { DualDotAgentIcon } from '../LifeOSIcons';
import { LifeOSStateId, LifeTask, UserProfile } from '@life/core/types';

interface TaskDeckStateProps {
  profile: UserProfile;
  darkMode?: boolean;
  activeTasks: LifeTask[];
  comingUpTasks: LifeTask[];
  completedCount: number;
  onNavigate: (state: LifeOSStateId) => void;
  onSelectTask: (task: LifeTask, targetState?: LifeOSStateId) => void;
  onCompleteTask: (taskId: string) => void;
}

export const TaskDeckState: React.FC<TaskDeckStateProps> = ({
  profile,
  darkMode = false,
  activeTasks,
  comingUpTasks,
  completedCount,
  onNavigate,
  onSelectTask,
  onCompleteTask,
}) => {
  const [activeIdx, setActiveIdx] = useState(0);

  const currentTask = activeTasks[activeIdx % Math.max(1, activeTasks.length)];

  return (
    <div
      className={`relative flex h-full w-full flex-col justify-between px-4 pt-13 pb-5 transition-colors duration-200 ${
        darkMode ? 'bg-[#0C0C0F] text-[#F5F4F0]' : 'bg-white text-[#111113]'
      }`}
    >
      {/* Header */}
      <div className="space-y-2.5 px-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="font-serif-editorial text-[26px] leading-none">
              life
            </span>
            <button
              type="button"
              onClick={() => onNavigate('intake-manifesto')}
              className={darkMode ? 'text-white/55 hover:text-white' : 'text-[#6C6C72] hover:text-[#141416]'}
              aria-label="About"
            >
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-[12px] font-medium ${
              darkMode ? 'bg-[#17171B] text-white/80' : 'bg-[#F4F2ED] text-[#4A4A4F]'
            }`}
          >
            {completedCount} done · {comingUpTasks.length} queued
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[13px] font-medium">
            <DualDotAgentIcon size={14} />
            <span>Your missions</span>
          </div>
          {activeTasks.length > 1 && (
            <button
              type="button"
              onClick={() => setActiveIdx((i) => (i + 1) % activeTasks.length)}
              className={`text-[12.5px] font-semibold ${
                darkMode ? 'text-[#84A0FF]' : 'text-[#2347D8] hover:text-[#1833A3]'
              }`}
            >
              Next move ({(activeIdx % activeTasks.length) + 1}/{activeTasks.length})
            </button>
          )}
        </div>
      </div>

      {/* Main Mission Card (clean spring transition, no blurry flicker) */}
      <div className="my-2 flex flex-1 flex-col justify-center">
        <AnimatePresence mode="wait">
          {currentTask ? (
            <motion.div
              key={currentTask.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
              className={`relative rounded-[28px] p-3.5 ${
                darkMode ? 'bg-[#16161B]' : 'bg-[#F4F2ED]'
              }`}
            >
              {/* Elevated Inner Mission Card */}
              <div
                className={`relative overflow-hidden rounded-[22px] p-2.5 ${
                  darkMode
                    ? 'bg-[#202026]'
                    : 'bg-white shadow-[0_6px_22px_rgba(20,20,22,0.06)]'
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    onSelectTask(
                      currentTask,
                      currentTask.urgency === 'urgent' ? 'urgent-alert' : 'scheme-portal'
                    )
                  }
                  className="group relative block aspect-[1.12/1] w-full overflow-hidden rounded-[17px]"
                >
                  <img
                    src={currentTask.imageUrl}
                    alt={currentTask.title}
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/55 to-transparent" />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <span className="rounded-full bg-black/65 px-2.5 py-0.5 text-[11.5px] font-medium text-white backdrop-blur-md">
                      {currentTask.valueBadge}
                    </span>
                    <span className="rounded-full bg-[#16794F] px-2.5 py-0.5 text-[11.5px] font-semibold text-white">
                      +{currentTask.scoreDelta} pts
                    </span>
                  </div>
                  {currentTask.copilotDraft && (
                    <span className="absolute right-2.5 bottom-2.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[11px] font-semibold text-[#141416] shadow-sm">
                      Message included
                    </span>
                  )}
                </button>

                <div className="flex items-center justify-between gap-2 px-1 pt-2.5 pb-1">
                  <div className="min-w-0">
                    <h3 className="truncate text-[14px] font-semibold">
                      {currentTask.shortTitle}
                    </h3>
                    <p
                      className={`truncate text-[12.5px] ${
                        darkMode ? 'text-white/65' : 'text-[#4A4A4F]'
                      }`}
                    >
                      {currentTask.whereToGo ?? currentTask.provider}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        onSelectTask(
                          currentTask,
                          currentTask.urgency === 'urgent' ? 'urgent-alert' : 'scheme-portal'
                        )
                      }
                      className="inline-flex items-center gap-1 rounded-full bg-[#2347D8] px-3 py-1.5 text-[12px] font-semibold text-white transition hover:bg-[#1833A3] active:scale-95"
                    >
                      <Navigation className="h-3 w-3 fill-current" />
                      <span>Show me how</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onCompleteTask(currentTask.id)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#16794F] hover:text-white active:scale-90 ${
                        darkMode ? 'bg-white/10 text-white' : 'bg-[#F4F2ED] text-[#141416]'
                      }`}
                      title="Mark complete"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="all-done"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.16 }}
              className={`rounded-[28px] px-5 py-8 text-center ${
                darkMode ? 'bg-[#16794F]/25' : 'bg-[#EAF6EF]'
              }`}
            >
              <Sparkles className={`mx-auto mb-2 h-6 w-6 ${darkMode ? 'text-[#72D2A3]' : 'text-[#16794F]'}`} />
              <p className="font-serif-editorial text-[24px]">
                All current missions complete
              </p>
              <p className={`mt-1 text-[13px] ${darkMode ? 'text-white/75' : 'text-[#4A4A4F]'}`}>
                Ask in chat or update your life map to unlock the next stage.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Queue Strip */}
        <div className="mt-3 space-y-2 px-1">
          <p className={`text-[12.5px] font-medium ${darkMode ? 'text-white/65' : 'text-[#4A4A4F]'}`}>
            Worth sorting in {profile.city} · complete to unlock next stage
          </p>

          {comingUpTasks.length > 0 && (
            <div className="no-scrollbar flex items-center gap-1.5 overflow-x-auto">
              {comingUpTasks.slice(0, 3).map((upcoming) => (
                <button
                  key={upcoming.id}
                  type="button"
                  onClick={() => onSelectTask(upcoming, 'scheme-portal')}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium transition ${
                    darkMode
                      ? 'bg-[#17171B] text-white/80 hover:bg-[#222228]'
                      : 'bg-[#F4F2ED] text-[#4A4A4F] hover:bg-[#EAE6DD] hover:text-[#141416]'
                  }`}
                >
                  <Lock className="h-3 w-3 opacity-60" />
                  <span>Next: {upcoming.shortTitle}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Home Tab */}
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={() => onNavigate(darkMode ? 'voice-dark' : 'hub-light')}
          className="flex flex-col items-center gap-0.5 transition hover:opacity-75 active:scale-95"
        >
          <span
            className={`flex h-7 w-7 items-center justify-center rounded-xl ${
              darkMode ? 'bg-white text-[#141416]' : 'bg-[#141416] text-white'
            }`}
          >
            <Home className="h-3.5 w-3.5" />
          </span>
          <span className="text-[11.5px] font-semibold">Home</span>
        </button>
      </div>
    </div>
  );
};
