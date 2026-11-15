import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowDown,
  ArrowUp,
  Award,
  BookOpen,
  CheckCircle2,
  Circle,
  ExternalLink,
  Heart,
  MoreHorizontal,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import {
  advanceOperatingRule,
  computeIncomeBreakdown,
  computeLifeLevelState,
  localDateString,
  TASK_CATALOG,
  EXHAUSTIVE_MISSING_ESSENTIALS,
  THINKER_ATEAM,
} from '@life/core/engine';
import { buildWeeklyRecapDeck } from '@life/core/weeklyRecap';
import { fieldSurface } from './SheetControls';
import {
  ActiveFunctionOverlay,
  CollectiveGoal,
  LifeTask,
  ThinkerWisdom,
  UserProfile,
} from '@life/core/types';

interface LevelsThinkersSheetProps {
  profile: UserProfile;
  darkMode?: boolean;
  eligibleTasks: LifeTask[];
  completedIds: string[];
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  onOpenOverlay: (overlay: ActiveFunctionOverlay) => void;
  onSelectTask: (task: LifeTask, targetState?: 'task-aura' | 'scheme-portal') => void;
  onClose: () => void;
}

const GOAL_META: Array<{ id: CollectiveGoal; label: string; desc: string }> = [
  { id: 'wealth', label: 'Wealth', desc: 'Cash, earning power and long-term options' },
  { id: 'fit', label: 'Fitness', desc: 'Strength, movement, food and recovery' },
  { id: 'calm', label: 'Calm', desc: 'Time, fewer loose ends and practical cover' },
  { id: 'educated', label: 'Learning', desc: 'Skills, judgment and how systems work' },
];

export const LevelsThinkersSheet: React.FC<LevelsThinkersSheetProps> = ({
  profile,
  darkMode = false,
  eligibleTasks,
  completedIds,
  onUpdateProfile,
  onOpenOverlay,
  onSelectTask,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'levels' | 'audit' | 'ateam'>('levels');
  const [domainFilter, setDomainFilter] = useState<'all' | ThinkerWisdom['domain']>('all');
  const [weekIdx, setWeekIdx] = useState(0);
  const [editingGambit, setEditingGambit] = useState(false);
  const defaultGambit =
    profile.monthlyGambit ||
    'build a 90-day cash buffer and lock in 2 high-leverage setup wins';
  const [gambitDraft, setGambitDraft] = useState(defaultGambit);

  const levelState = computeLifeLevelState(profile, eligibleTasks, completedIds);
  const breakdown = computeIncomeBreakdown(profile);
  const recapDeck = buildWeeklyRecapDeck(profile, breakdown, levelState, completedIds.length);
  const activeWeekCard = recapDeck[weekIdx] ?? recapDeck[0];
  const savedWisdomIds = profile.savedWisdomIds ?? [];
  const toggleSavedWisdom = (id: string) => {
    const next = savedWisdomIds.includes(id)
      ? savedWisdomIds.filter((item) => item !== id)
      : [...savedWisdomIds, id];
    onUpdateProfile({ savedWisdomIds: next });
  };
  const featuredThinker =
    THINKER_ATEAM[(completedIds.length + weekIdx) % THINKER_ATEAM.length] ?? THINKER_ATEAM[0];
  const selectedGoals = profile.collectiveGoals ?? ['calm', 'wealth', 'fit'];

  const toggleGoal = (goalId: CollectiveGoal) => {
    const next = selectedGoals.includes(goalId)
      ? selectedGoals.filter((g) => g !== goalId)
      : [...selectedGoals, goalId];
    onUpdateProfile({ collectiveGoals: next });
  };

  const selectAllGoals = () => {
    onUpdateProfile({ collectiveGoals: ['wealth', 'fit', 'calm', 'educated'] });
  };

  const filteredThinkers =
    domainFilter === 'all'
      ? THINKER_ATEAM
      : THINKER_ATEAM.filter((t) => t.domain === domainFilter);

  const surfaceBg = darkMode ? 'bg-[#16161B] text-[#F5F5F7]' : 'bg-white text-[#141416]';
  const cardBg = darkMode ? 'bg-[#202026]' : 'bg-[#F6F6F7]';
  const subText = darkMode ? 'text-[#9C9CA4]' : 'text-[#6A6A72]';
  const accentText = darkMode ? 'text-[#84A0FF]' : 'text-[#2347D8]';
  const successText = darkMode ? 'text-[#72D2A3]' : 'text-[#16794F]';
  const tabWrapBg = darkMode ? 'bg-[#202026]' : 'bg-[#F2F1EE]';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex flex-col justify-end bg-black/35"
      onClick={onClose}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label="Levels and A-Team"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
        className={`rounded-t-[28px] px-5 pt-4 pb-6 max-h-[88%] overflow-y-auto no-scrollbar ${surfaceBg}`}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-current opacity-15" />

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className={`text-[13px] font-medium ${subText}`}>
              New Normal Progression & Credited Wisdom
            </p>
            <h2 className="font-serif-display text-[28px] leading-[1.08] tracking-[-0.02em] mt-0.5">
              Levels & A-Team
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Levels and A-Team"
            className={`h-9 w-9 rounded-full flex items-center justify-center transition ${cardBg}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Segmented Tabs */}
        <div className={`mt-4 grid grid-cols-3 gap-1 rounded-[16px] p-1 ${tabWrapBg}`}>
          {[
            { id: 'levels' as const, label: 'Level & Normal', Icon: Award },
            { id: 'audit' as const, label: 'Full Audit', Icon: Target },
            { id: 'ateam' as const, label: 'A-Team Thinkers', Icon: BookOpen },
          ].map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex items-center justify-center gap-1.5 rounded-[12px] py-2 px-2 text-[13px] font-medium transition ${
                  active
                    ? darkMode
                      ? 'bg-[#F5F5F7] text-[#141416]'
                      : 'bg-white text-[#141416] shadow-sm'
                    : subText
                }`}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{label}</span>
              </button>
            );
          })}
        </div>

        {/* TAB 1: Current Normal, Next Gambit & Collective Goals */}
        {activeTab === 'levels' && (
          <div className="mt-4 space-y-3">
            {/* Fanned Weekly Recap Metric Stack (Ref 15) */}
            <div className="pt-1">
              <div
                className={`mx-6 h-2.5 rounded-t-[16px] opacity-60 ${
                  darkMode ? 'bg-[#26262E]' : 'bg-[#EAE8E2]'
                }`}
              />
              <div
                className={`mx-3 h-2.5 rounded-t-[16px] opacity-85 ${
                  darkMode ? 'bg-[#23232A]' : 'bg-[#F0EFEA]'
                }`}
              />
              <div className={`rounded-[22px] p-4 ${cardBg}`}>
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-[13px] font-bold text-white"
                      style={{ backgroundColor: activeWeekCard.badgeBgHex }}
                    >
                      L{levelState.currentLevel}
                    </span>
                    <div>
                      <p className={`text-[12px] font-medium ${subText}`}>
                        {activeWeekCard.weekLabel}
                      </p>
                      <p className={`text-[12px] font-semibold ${accentText}`}>
                        {activeWeekCard.accentLabel}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {recapDeck.map((w, i) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setWeekIdx(i)}
                        aria-label={`View ${w.weekLabel}`}
                        className={`h-2 rounded-full transition-all ${
                          i === weekIdx
                            ? darkMode
                              ? 'w-5 bg-white'
                              : 'w-5 bg-[#141416]'
                            : darkMode
                              ? 'w-2 bg-white/25'
                              : 'w-2 bg-black/15'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className={`mt-3 text-[20px] leading-[1.3] font-medium tracking-[-0.015em] ${subText}`}>
                  You were active{' '}
                  <span className={`inline-flex items-center gap-0.5 font-semibold ${darkMode ? 'text-white' : 'text-[#141416]'}`}>
                    {activeWeekCard.activeDays}
                    {activeWeekCard.activeDelta === 'up' ? (
                      <ArrowUp className="h-3.5 w-3.5 text-[#16794F]" />
                    ) : (
                      <ArrowDown className="h-3.5 w-3.5 text-[#C43929]" />
                    )}
                    days
                  </span>
                  , logged{' '}
                  <span className={`inline-flex items-center gap-0.5 font-semibold ${darkMode ? 'text-white' : 'text-[#141416]'}`}>
                    {activeWeekCard.checkInsCount}
                    {activeWeekCard.checkInsDelta === 'up' ? (
                      <ArrowUp className="h-3.5 w-3.5 text-[#16794F]" />
                    ) : (
                      <ArrowDown className="h-3.5 w-3.5 text-[#C43929]" />
                    )}
                    moves
                  </span>{' '}
                  and held{' '}
                  <span className={`inline-flex items-center gap-0.5 font-semibold ${darkMode ? 'text-white' : 'text-[#141416]'}`}>
                    {activeWeekCard.highlightValue}
                    {activeWeekCard.highlightDelta === 'up' ? (
                      <ArrowUp className="h-3.5 w-3.5 text-[#16794F]" />
                    ) : (
                      <ArrowDown className="h-3.5 w-3.5 text-[#C43929]" />
                    )}
                  </span>{' '}
                  {activeWeekCard.highlightUnit}.
                </p>
              </div>
            </div>

            {/* Warm Amber Inspiration & Crimson Check-in Prompt Cards (Ref 16) */}
            <div className="space-y-2">
              <div
                className="rounded-[20px] p-4 text-white"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, rgba(164, 96, 36, 0.92) 0%, rgba(92, 50, 18, 0.96) 100%)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-amber-200">
                    <Sparkles className="h-3.5 w-3.5" />
                    Inspiration · {featuredThinker.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSavedWisdom(featuredThinker.id)}
                    aria-label={`Save ${featuredThinker.name} insight`}
                    className="rounded-full p-1 text-white/85 transition hover:bg-white/15"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        savedWisdomIds.includes(featuredThinker.id) ? 'fill-white text-white' : ''
                      }`}
                    />
                  </button>
                </div>
                <p className="mt-1.5 text-[15px] font-semibold leading-snug">
                  {featuredThinker.coreIdea}
                </p>
                <p className="mt-1 text-[12.5px] text-white/80 leading-snug">
                  {featuredThinker.appliedRule}
                </p>
              </div>

              <div
                className="rounded-[20px] p-4 text-white"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, rgba(146, 36, 40, 0.92) 0%, rgba(74, 18, 22, 0.96) 100%)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-rose-200">
                    <Target className="h-3.5 w-3.5" />
                    Check-in prompt
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleSavedWisdom('prompt-checkin')}
                    aria-label="Save check-in prompt"
                    className="rounded-full p-1 text-white/85 transition hover:bg-white/15"
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        savedWisdomIds.includes('prompt-checkin') ? 'fill-white text-white' : ''
                      }`}
                    />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenOverlay('growth-checkins')}
                  className="mt-1.5 block w-full text-left"
                >
                  <span className="block text-[15px] font-semibold leading-snug">
                    Which 5-minute check-in removes tomorrow&apos;s blank-page hesitation?
                  </span>
                  <span className="mt-1 inline-block text-[12.5px] font-medium text-white/85 underline underline-offset-2">
                    Open preferences &amp; SWOT check-in →
                  </span>
                </button>
              </div>
            </div>

            {/* Editable Two-Tone Selective-Contrast Monthly Gambit Card (Ref 16) */}
            <div className={`rounded-[22px] p-4 ${cardBg}`}>
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[12.5px] font-medium ${subText}`}>Your monthly goal</span>
                <button
                  type="button"
                  onClick={() => {
                    setGambitDraft(defaultGambit);
                    setEditingGambit((e) => !e);
                  }}
                  aria-label="Edit monthly goal"
                  className={`flex h-7 w-7 items-center justify-center rounded-full ${
                    darkMode ? 'bg-[#16161B] text-white/80' : 'bg-white text-[#141416]'
                  }`}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
              {editingGambit ? (
                <div className="mt-2 space-y-2">
                  <input
                    type="text"
                    value={gambitDraft}
                    onChange={(e) => setGambitDraft(e.target.value)}
                    placeholder="e.g. clear my tax vault and save 600 this month"
                    className={fieldSurface(darkMode)}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateProfile({ monthlyGambit: gambitDraft.trim() || defaultGambit });
                        setEditingGambit(false);
                      }}
                      className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-semibold ${
                        darkMode ? 'bg-white text-[#141416]' : 'bg-[#141416] text-white'
                      }`}
                    >
                      Save goal
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingGambit(false)}
                      className={`text-[12.5px] font-medium ${subText}`}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className={`mt-2 text-[19px] leading-[1.32] font-medium ${subText}`}>
                  I want to{' '}
                  <strong className={darkMode ? 'text-white' : 'text-[#141416]'}>
                    {defaultGambit}
                  </strong>{' '}
                  to lock in my next normal.
                </p>
              )}
            </div>

            <div className={`rounded-[22px] p-4 ${cardBg}`}>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <span className={`inline-flex items-center gap-1 rounded-full bg-[#16794F]/15 px-2.5 py-0.5 text-[13px] font-semibold ${successText}`}>
                    <Sparkles className="h-3 w-3" />
                    Operating Level {levelState.currentLevel}/4
                  </span>
                  <h3 className="font-serif-display text-[24px] leading-tight mt-1">
                    {levelState.levelName}
                  </h3>
                </div>
                <span className="font-serif-display text-[28px]">{levelState.progressPct}%</span>
              </div>
              <p className={`mt-1 text-[13px] leading-snug ${subText}`}>
                {levelState.levelTagline}
              </p>

            </div>

            {levelState.unlockedNormals.length > 0 && (
              <section className={`rounded-[22px] p-4 ${cardBg}`}>
                <h3 className="font-serif-editorial text-[22px]">New Normal Operating Rules</h3>
                <div className="mt-3 space-y-3">
                  {levelState.unlockedNormals.map((rule) => {
                    const saveDate = (date: string) => onUpdateProfile({
                      operatingRuleDates: { ...profile.operatingRuleDates, [rule.id]: date },
                    });
                    const due = rule.nextDueOn <= localDateString();
                    return (
                      <div key={rule.id} className={`rounded-xl p-3 ${darkMode ? 'bg-[#16161B]' : 'bg-white'}`}>
                        <div className="flex items-baseline justify-between gap-2">
                          <h4 className="text-[14px] font-semibold">{rule.label}</h4>
                          {due && <span className="text-[13px] font-medium">Due</span>}
                        </div>
                        <p className={`mt-1 text-[13px] leading-snug ${subText}`}>{rule.instruction}</p>
                        <label className="mt-2 block text-[13px]">
                          Next check
                          <input type="date" aria-label={`Next check for ${rule.label}`} value={rule.nextDueOn}
                            onChange={(event) => { if (event.currentTarget.value) saveDate(event.currentTarget.value); }}
                            className={`${fieldSurface(darkMode)} ${darkMode ? '[color-scheme:dark]' : ''}`} />
                        </label>
                        <div className="mt-2 flex flex-wrap gap-3 text-[13px] font-semibold">
                          <button type="button" onClick={() => onOpenOverlay(rule.actionOverlay)} className="underline underline-offset-2">Open tools</button>
                          <button type="button" onClick={() => saveDate(advanceOperatingRule(rule))} className="underline underline-offset-2">Mark checked</button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Next Level Gambit Checklist */}
            {levelState.toAdvance.length > 0 && <div className={`rounded-[22px] p-4 ${cardBg}`}>
              <p className="text-[14px] font-semibold">Next level · {levelState.nextLevelName}</p>
              <div className="mt-2.5 space-y-2">
                {levelState.toAdvance.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    disabled={!item.actionOverlay && !item.taskId}
                    onClick={() => {
                      if (item.actionOverlay) {
                        onOpenOverlay(item.actionOverlay);
                      } else if (item.taskId) {
                        const found = eligibleTasks.find((t) => t.id === item.taskId);
                        if (found) onSelectTask(found, 'task-aura');
                      }
                    }}
                    className={`w-full flex items-center justify-between gap-2 rounded-[16px] px-3.5 py-2.5 text-left transition ${
                      darkMode ? 'bg-[#16161B] hover:bg-[#1E1E25]' : 'bg-white hover:bg-[#FAF9F6]'
                    }`}
                  >
                    <span className="flex items-center gap-2 text-[13px] font-medium">
                      {item.done ? (
                        <CheckCircle2 className={`h-4 w-4 shrink-0 ${successText}`} />
                      ) : (
                        <Circle className={`h-4 w-4 shrink-0 ${subText}`} />
                      )}
                      <span className={item.done ? 'line-through opacity-60' : ''}>
                        {item.label}
                      </span>
                    </span>
                    <span className={`shrink-0 text-[13px] font-semibold ${accentText}`}>
                      {item.actionOverlay || item.taskId ? (item.done ? 'Review' : 'Open →') : ''}
                    </span>
                  </button>
                ))}
              </div>
            </div>}

            {levelState.unlockedGambits.length > 0 && (
              <section className={`rounded-[22px] p-4 ${cardBg}`}>
                <h3 className="font-serif-editorial text-[22px]">Unlocked gambits</h3>
                <div className="mt-2 space-y-2">
                  {levelState.unlockedGambits.map((task) => (
                    <button key={task.id} type="button" onClick={() => onSelectTask(task, 'scheme-portal')}
                      className={`block w-full rounded-xl p-3 text-left ${darkMode ? 'bg-[#16161B]' : 'bg-white'}`}>
                      <span className="block text-[14px] font-semibold">{task.title}</span>
                      <span className={`mt-1 block text-[13px] leading-snug ${subText}`}>{task.whySurfaced ?? task.personalWhy}</span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {/* Collective Goals Selector */}
            <div className={`rounded-[22px] p-4 ${cardBg}`}>
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-semibold">Collective Goals</p>
                <button
                  type="button"
                  onClick={selectAllGoals}
                  className={`text-[13px] font-semibold ${accentText}`}
                >
                  Select all of the above
                </button>
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-2">
                {GOAL_META.map((goal) => {
                  const active = selectedGoals.includes(goal.id);
                  return (
                    <button
                      key={goal.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => toggleGoal(goal.id)}
                      className={`rounded-[16px] p-3 text-left transition ${
                        active
                          ? darkMode
                            ? 'bg-white text-[#141416]'
                            : 'bg-[#141416] text-white'
                          : darkMode
                          ? 'bg-[#16161B] text-[#E6E6EB]'
                          : 'bg-white text-[#141416]'
                      }`}
                    >
                      <p className="text-[13px] font-semibold">{goal.label}</p>
                      <p className={`mt-0.5 text-[13px] leading-snug ${active ? 'opacity-75' : subText}`}>
                        {goal.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Exhaustive Missing Essentials & Emerging Blindspots */}
        {activeTab === 'audit' && (
          <div className="mt-4 space-y-2.5">
            <p className={`text-[13px] leading-snug ${subText}`}>
              Check the areas that are easy to overlook while you’re handling the week in front of you.
            </p>
            {EXHAUSTIVE_MISSING_ESSENTIALS.map((item) => {
              const catalogTask = TASK_CATALOG.find((task) => task.id === item.taskId);
              const openTask = eligibleTasks.find((task) => task.id === item.taskId);
              if (catalogTask?.countries && !catalogTask.countries.includes(profile.countryCode)) return null;

              return (
              <div key={item.id} className={`rounded-[20px] p-4 ${cardBg}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-[13px] font-semibold ${accentText}`}>{item.area}</p>
                    <p className="text-[15px] font-semibold mt-0.5">{item.title}</p>
                  </div>
                  {(item.overlay || openTask) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (item.overlay) {
                          onOpenOverlay(item.overlay);
                        } else if (openTask) {
                          onSelectTask(openTask, 'scheme-portal');
                        }
                      }}
                      className={`shrink-0 rounded-full px-3 py-1 text-[13px] font-semibold ${
                        darkMode ? 'bg-white text-[#141416]' : 'bg-[#141416] text-white'
                      }`}
                    >
                      Open
                    </button>
                  )}
                </div>
                <p className={`mt-1.5 text-[13px] leading-snug ${subText}`}>{item.whyEssential}</p>
                <p className={`mt-1.5 text-[13px] font-medium ${successText}`}>
                  {item.emergentAngle}
                </p>
                {catalogTask && !openTask && (
                  <p className={`mt-1.5 text-[13px] ${subText}`}>
                    {catalogTask.minLevel && catalogTask.minLevel > levelState.currentLevel
                      ? `Available from level ${catalogTask.minLevel} when it fits your profile.`
                      : 'Your profile will surface this when it applies.'}
                  </p>
                )}
              </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: Credited A-Team of Great Thinkers */}
        {activeTab === 'ateam' && (
          <div className="mt-4 space-y-3">
            <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {(
                [
                  'all',
                  'Wealth & Leverage',
                  'Risk & Antifragility',
                  'Health & Longevity',
                  'Mind & Habits',
                  'Money Psychology',
                ] as const
              ).map((dom) => (
                <button
                  key={dom}
                  type="button"
                  onClick={() => setDomainFilter(dom)}
                  className={`shrink-0 rounded-full px-3 py-1.5 text-[13px] font-medium transition ${
                    domainFilter === dom
                      ? darkMode
                        ? 'bg-white text-[#141416]'
                        : 'bg-[#141416] text-white'
                      : `${cardBg} ${subText}`
                  }`}
                >
                  {dom === 'all' ? 'All 12 Thinkers' : dom}
                </button>
              ))}
            </div>

            {filteredThinkers.map((thinker) => (
              <div key={thinker.id} className={`rounded-[20px] p-4 ${cardBg}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className={`text-[13px] font-semibold ${accentText}`}>{thinker.domain}</p>
                    <h3 className="font-serif-display text-[22px] leading-tight mt-0.5">
                      {thinker.name}
                    </h3>
                    <p className={`text-[13px] ${subText}`}>{thinker.handleOrSource}</p>
                  </div>
                  <a
                    href={thinker.linkUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[13px] font-medium ${
                      darkMode ? 'bg-[#16161B] text-[#E6E6EB]' : 'bg-white text-[#141416]'
                    }`}
                  >
                    <span>Source</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="mt-2 text-[13px] leading-snug">{thinker.coreIdea}</p>
                <div
                  className={`mt-2.5 rounded-[14px] p-3 text-[13px] leading-snug ${
                    darkMode ? 'bg-[#16161B] text-[#D0D0D8]' : 'bg-white text-[#141416]'
                  }`}
                >
                  <span className="font-semibold">How life applies this: </span>
                  {thinker.appliedRule}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};
