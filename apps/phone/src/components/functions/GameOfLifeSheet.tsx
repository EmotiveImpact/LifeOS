import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  Compass,
  Layers,
  MapPin,
  Sparkles,
  X,
} from 'lucide-react';
import {
  computeGameChapter,
  computeLifeAreaProgress,
  LIFE_DESTINATIONS,
  SETUP_RAILS,
  WORLD_RULES,
} from '@life/core/engine';
import {
  LifeOSStateId,
  LifeTask,
  SetupRailId,
  UserProfile,
} from '@life/core/types';

interface GameOfLifeSheetProps {
  profile: UserProfile;
  darkMode?: boolean;
  eligibleTasks: LifeTask[];
  completedIds: string[];
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  onSelectTask: (task: LifeTask, targetState?: LifeOSStateId) => void;
  onClose: () => void;
}

import { ProgressiveQuestion } from './ProgressiveQuestion';

type PlaybookTab = 'map' | 'setup' | 'rules';

export const GameOfLifeSheet: React.FC<GameOfLifeSheetProps> = ({
  profile,
  darkMode = false,
  eligibleTasks,
  completedIds,
  onUpdateProfile,
  onSelectTask,
  onClose,
}) => {
  const [tab, setTab] = useState<PlaybookTab>('map');

  const chapter = computeGameChapter(profile, eligibleTasks, completedIds);
  const areaProgress = computeLifeAreaProgress(profile, eligibleTasks, completedIds);
  const setupRails = profile.setupRails ?? [];
  const activeDest =
    LIFE_DESTINATIONS.find((d) => d.id === profile.destination) ?? LIFE_DESTINATIONS[0];

  const handleToggleRail = (id: SetupRailId) => {
    const exists = setupRails.includes(id);
    const next = exists ? setupRails.filter((r) => r !== id) : [...setupRails, id];
    onUpdateProfile({ setupRails: next });
  };

  const countryRules = WORLD_RULES.filter(
    (r) => !r.countries || r.countries.includes(profile.countryCode)
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      onClick={onClose}
      className="absolute inset-0 z-30 flex flex-col justify-end bg-black/35 p-3 pt-12 backdrop-blur-md"
    >
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 36, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 360, damping: 32 }}
        onClick={(e) => e.stopPropagation()}
        className={`flex max-h-[90%] flex-col overflow-hidden rounded-[32px] p-4 shadow-[0_28px_70px_rgba(0,0,0,0.28)] ${
          darkMode ? 'bg-[#141416] text-[#F5F4F0]' : 'bg-[#FFFFFF] text-[#141416]'
        }`}
      >
        <div className="flex items-start justify-between gap-2 px-1">
          <div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-[13px] font-semibold ${
                darkMode ? 'bg-[#2347D8]/30 text-[#C2D0FF]' : 'bg-[#EBF0FF] text-[#1833A3]'
              }`}
            >
              <Compass className="h-3 w-3" />
              {chapter.chapterLabel}
            </span>
            <h3 className="mt-1.5 font-serif-editorial text-[26px] leading-[1.08]">
              Your Life Map
            </h3>
            <p className={`mt-0.5 text-[13px] ${darkMode ? 'text-white/65' : 'text-[#4A4A4F]'}`}>
              {chapter.nextUnlockText}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition ${
              darkMode
                ? 'bg-white/10 text-white/80 hover:bg-white/18'
                : 'bg-[#F4F2ED] text-[#4A4A4F] hover:bg-[#EAE6DD]'
            }`}
            aria-label="Close Life Map"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Readiness Progress */}
        <div className="mt-3 px-1">
          <div className={`h-1.5 w-full overflow-hidden rounded-full ${darkMode ? 'bg-white/10' : 'bg-[#EAE6DD]'}`}>
            <motion.div
              initial={false}
              animate={{ width: `${Math.max(10, chapter.readinessPct)}%` }}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="h-full rounded-full bg-[#2347D8]"
            />
          </div>
        </div>

        {/* 3-Tab Switch */}
        <div className={`mt-3 grid grid-cols-3 gap-1 rounded-2xl p-1 text-[13px] font-medium ${darkMode ? 'bg-[#1D1D22]' : 'bg-[#F4F2ED]'}`}>
          {[
            {
              id: 'map' as const,
              label: 'Life Map (6)',
              icon: Sparkles,
            },
            {
              id: 'setup' as const,
              label: `Basics (${setupRails.length}/${SETUP_RAILS.length})`,
              icon: Layers,
            },
            {
              id: 'rules' as const,
              label: 'Show me how',
              icon: BookOpen,
            },
          ].map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition ${
                  active
                    ? darkMode
                      ? 'bg-[#2A2A32] font-semibold text-white'
                      : 'bg-white font-semibold text-[#141416] shadow-2xs'
                    : darkMode
                      ? 'text-white/65 hover:text-white'
                      : 'text-[#4A4A4F] hover:text-[#141416]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>

        <div className="no-scrollbar mt-3 flex-1 space-y-2.5 overflow-y-auto px-0.5 pb-1">
          <AnimatePresence mode="wait">
            {tab === 'map' && (
              <motion.div
                key="map"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-2.5"
              >
                {/* 6 Life Areas */}
                <div className={`rounded-2xl p-3.5 ${darkMode ? 'bg-[#1D1D22]' : 'bg-[#F4F2ED]'}`}>
                  <p className={`text-[13px] font-semibold ${darkMode ? 'text-white/75' : 'text-[#4A4A4F]'}`}>
                    The 6 areas of your life
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    {areaProgress.map((area) => (
                      <div key={area.id} className={`rounded-xl p-2.5 ${darkMode ? 'bg-[#25252C]' : 'bg-white'}`}>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[13px] font-semibold">
                            {area.label}
                          </span>
                          <CheckCircle2
                            className={`h-3.5 w-3.5 ${
                              area.updated
                                ? darkMode
                                  ? 'text-[#72D2A3]'
                                  : 'text-[#16794F]'
                                : darkMode
                                  ? 'text-white/25'
                                  : 'text-[#6C6C72]/40'
                            }`}
                          />
                        </div>
                        <p className={`mt-0.5 text-[13px] leading-snug ${darkMode ? 'text-white/70' : 'text-[#4A4A4F]'}`}>
                          {area.statusText}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <ProgressiveQuestion profile={profile} darkMode={darkMode} onUpdateProfile={onUpdateProfile} />

                {/* What are you trying to change? */}
                <div className={`rounded-2xl p-3.5 ${darkMode ? 'bg-[#1D1D22]' : 'bg-[#F4F2ED]'}`}>
                  <p className="mb-1 text-[13px] font-semibold">
                    What are you trying to change?
                  </p>
                  <p className={`mb-2 text-[13px] ${darkMode ? 'text-white/70' : 'text-[#4A4A4F]'}`}>
                    {activeDest.tagline}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {LIFE_DESTINATIONS.map((dest) => {
                      const active = profile.destination === dest.id;
                      return (
                        <button
                          key={dest.id}
                          type="button"
                          onClick={() => onUpdateProfile({ destination: dest.id })}
                          className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition ${
                            active
                              ? 'bg-[#2347D8] text-white'
                              : darkMode
                                ? 'bg-[#25252C] text-white/85 hover:bg-[#303039]'
                                : 'bg-white text-[#141416] hover:bg-[#EAE6DD]'
                          }`}
                        >
                          {dest.shortLabel}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'setup' && (
              <motion.div
                key="setup"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-2"
              >
                <p className={`px-1 text-[13px] leading-snug ${darkMode ? 'text-white/75' : 'text-[#4A4A4F]'}`}>
                  Tick off the everyday accounts and portals you already have set up.
                </p>
                {SETUP_RAILS.map((rail) => {
                  const done = setupRails.includes(rail.id);
                  return (
                    <button
                      key={rail.id}
                      type="button"
                      onClick={() => handleToggleRail(rail.id)}
                      className={`flex w-full items-start gap-3 rounded-2xl p-3.5 text-left transition ${
                        done
                          ? darkMode
                            ? 'bg-[#16794F]/30 text-white'
                            : 'bg-[#EAF6EF] text-[#141416]'
                          : darkMode
                            ? 'bg-[#1D1D22] text-white hover:bg-[#25252C]'
                            : 'bg-[#F4F2ED] text-[#141416] hover:bg-[#EAE6DD]'
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition ${
                          done ? 'bg-[#16794F] text-white' : darkMode ? 'bg-white/15 text-transparent' : 'bg-white text-transparent'
                        }`}
                      >
                        <Check className="h-3 w-3 stroke-[3]" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[13.5px] font-semibold">{rail.title}</p>
                          <span
                            className={`shrink-0 text-[13px] font-medium ${
                              done
                                ? darkMode
                                  ? 'text-[#72D2A3]'
                                  : 'text-[#16794F]'
                                : darkMode
                                  ? 'text-white/60'
                                  : 'text-[#4A4A4F]'
                            }`}
                          >
                            {done ? 'Set up ✓' : 'To do'}
                          </span>
                        </div>
                        <p className={`mt-0.5 flex items-center gap-1 text-[13px] font-medium ${darkMode ? 'text-[#84A0FF]' : 'text-[#2347D8]'}`}>
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{rail.where}</span>
                        </p>
                        <p className={`mt-1 text-[13px] leading-snug ${darkMode ? 'text-white/75' : 'text-[#4A4A4F]'}`}>
                          {rail.why}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </motion.div>
            )}

            {tab === 'rules' && (
              <motion.div
                key="rules"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="space-y-2.5"
              >
                <p className={`px-1 text-[13px] leading-snug ${darkMode ? 'text-white/75' : 'text-[#4A4A4F]'}`}>
                  How money, public support and healthcare actually work in plain English.
                </p>
                {countryRules.map((rule) => {
                  const linkedTask = eligibleTasks.find((t) => t.id === rule.linkedTaskId);
                  return (
                    <div key={rule.id} className={`rounded-2xl p-3.5 ${darkMode ? 'bg-[#1D1D22]' : 'bg-[#F4F2ED]'}`}>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[13px] font-medium ${
                          darkMode ? 'bg-white/10 text-white/80' : 'bg-white text-[#4A4A4F]'
                        }`}
                      >
                        {rule.category}
                      </span>
                      <h4 className="mt-1.5 text-[14px] font-semibold">
                        {rule.title}
                      </h4>
                      <p className={`mt-1 text-[13px] leading-[1.45] ${darkMode ? 'text-white/75' : 'text-[#4A4A4F]'}`}>
                        {rule.ruleSummary}
                      </p>
                      <div className={`mt-2.5 rounded-xl px-3 py-2.5 text-[13px] ${darkMode ? 'bg-[#25252C]' : 'bg-white'}`}>
                        <p className="font-semibold">
                          Next move: {rule.practicalAction}
                        </p>
                        <p className={`mt-0.5 ${darkMode ? 'text-[#84A0FF]' : 'text-[#2347D8]'}`}>
                          Where: {rule.whereToStart}
                        </p>
                      </div>
                      {linkedTask && (
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onSelectTask(
                              linkedTask,
                              linkedTask.urgency === 'urgent' ? 'urgent-alert' : 'scheme-portal'
                            );
                          }}
                          className="mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-[#2347D8] px-3.5 py-1.5 text-[13px] font-semibold text-white transition hover:bg-[#1833A3]"
                        >
                          <span>Show me how · {linkedTask.shortTitle}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
};
