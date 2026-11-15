import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Droplets, Info, Plus, RotateCcw, Trash2, Utensils, X } from 'lucide-react';
import { DEFAULT_HEALTH_SNAPSHOT } from '@life/core/engine';
import type { DietStyle, FoodLogEntry, HealthSnapshot, UserProfile } from '@life/core/types';
import { computeHealthTargets, DIET_GUIDES } from '@life/core/health';
import { fieldSurface, NumberField } from './SheetControls';
import { BloodworkPanel } from './BloodworkPanel';

interface HealthStackSheetProps {
  profile: UserProfile;
  darkMode?: boolean;
  onUpdateProfile: (patch: Partial<UserProfile>) => void;
  onClose: () => void;
}

export const HealthStackSheet: React.FC<HealthStackSheetProps> = ({
  profile,
  darkMode = false,
  onUpdateProfile,
  onClose,
}) => {
  const health: HealthSnapshot = profile.health ?? DEFAULT_HEALTH_SNAPSHOT;
  const [activeTab, setActiveTab] = useState<'hydration' | 'food' | 'bloodwork'>('hydration');
  const [expandedScienceId, setExpandedScienceId] = useState<string | null>(null);
  const [mealLabel, setMealLabel] = useState('');
  const [mealProtein, setMealProtein] = useState('35');
  const [mealCals, setMealCals] = useState('520');
  const streakDays = Math.max(1, Math.min(30, profile.habitStreakDays ?? (health.waterMlToday >= 1000 ? 5 : 4)));

  const updateHealth = (patch: Partial<HealthSnapshot>) => {
    onUpdateProfile({
      health: {
        ...health,
        ...patch,
      },
    });
  };

  const targets = computeHealthTargets(health);
  const waterPct = Math.min(
    100,
    Math.round((health.waterMlToday / Math.max(500, targets.waterMl)) * 100)
  );
  const totalProtein = health.mealsLogged.reduce((sum, m) => sum + m.proteinG, 0);
  const totalCalories = health.mealsLogged.reduce((sum, m) => sum + m.calories, 0);
  const proteinPct = Math.min(
    100,
    Math.round((totalProtein / Math.max(40, targets.proteinG)) * 100)
  );

  const handleAddMeal = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = mealLabel.trim();
    if (!clean) return;
    const entry: FoodLogEntry = {
      id: `meal-${Date.now()}`,
      label: clean,
      proteinG: Math.max(0, Math.min(200, Number(mealProtein) || 0)),
      calories: Math.max(0, Math.min(3500, Number(mealCals) || 0)),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    updateHealth({ mealsLogged: [entry, ...health.mealsLogged] });
    setMealLabel('');
  };

  const handleRemoveMeal = (id: string) => {
    updateHealth({ mealsLogged: health.mealsLogged.filter((m) => m.id !== id) });
  };

  const surfaceBg = darkMode ? 'bg-[#16161B] text-[#F5F5F7]' : 'bg-white text-[#141416]';
  const cardBg = darkMode ? 'bg-[#202026]' : 'bg-[#F6F6F7]';
  const subText = darkMode ? 'text-[#9C9CA4]' : 'text-[#6A6A72]';
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
        aria-label="Health"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
        className={`rounded-t-[28px] px-5 pt-4 pb-6 max-h-[88%] overflow-y-auto no-scrollbar ${surfaceBg}`}
      >
        <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-current opacity-15" />

        {/* Header */}
        <div className={`sticky top-0 z-10 -mx-5 flex items-start justify-between gap-3 px-5 pb-2 pt-1 ${surfaceBg}`}>
          <div>
            <h2 className="font-serif-display text-[28px] leading-[1.08] tracking-[-0.02em] mt-0.5">
              Health
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close Health Stack"
            className={`h-9 w-9 shrink-0 rounded-full flex items-center justify-center transition ${cardBg}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* 30-Tick "New Normal" Habit Lock-In Gauge (Ref 11 pattern) */}
        <div className={`mt-4 rounded-[22px] p-4 ${cardBg}`}>
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className={`text-[12px] font-medium ${subText}`}>Day Streak · New Normal Lock-in</p>
              <p className="font-serif-display text-[28px] leading-none mt-1">
                {streakDays}
                <span className={`ml-1 font-sans text-[13px] font-medium ${subText}`}>/ 30 days</span>
              </p>
            </div>
            <button
              type="button"
              onClick={() => onUpdateProfile({ habitStreakDays: Math.min(30, streakDays + 1) })}
              className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition ${
                darkMode ? 'bg-white text-[#141416]' : 'bg-[#141416] text-white'
              }`}
            >
              + Check in today
            </button>
          </div>
          <div className="mt-3 flex items-center gap-[3px]" aria-label={`Habit streak ${streakDays} of 30 days`}>
            {Array.from({ length: 30 }, (_, idx) => {
              const lit = idx < streakDays;
              return (
                <span
                  key={idx}
                  className={`h-4 flex-1 rounded-[2px] transition-colors ${
                    lit
                      ? darkMode
                        ? 'bg-white'
                        : 'bg-[#141416]'
                      : darkMode
                        ? 'bg-white/15'
                        : 'bg-black/10'
                  }`}
                />
              );
            })}
          </div>
          <p className={`mt-2 text-[12.5px] ${subText}`}>
            Most daily routines lock in after 14 consistent days.
          </p>
        </div>

        {/* Summary Strip */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className={`rounded-[18px] p-3 ${cardBg}`}>
            <p className={`text-[13px] ${subText}`}>Water today</p>
            <p className="font-serif-display text-[24px] leading-tight mt-0.5">
              {health.waterMlToday}
              <span className="text-[13px] font-sans ml-0.5 opacity-60">ml</span>
            </p>
          </div>
          <div className={`rounded-[18px] p-3 ${cardBg}`}>
            <p className={`text-[13px] ${subText}`}>Protein</p>
            <p className="font-serif-display text-[24px] leading-tight mt-0.5">
              {totalProtein}
              <span className="text-[13px] font-sans ml-0.5 opacity-60">/{targets.proteinG}g</span>
            </p>
          </div>
          <div className={`rounded-[18px] p-3 ${cardBg}`}>
            <p className={`text-[13px] ${subText}`}>Zone 2 · Sleep</p>
            <p className="font-serif-display text-[24px] leading-tight mt-0.5">
              {health.zone2MinsWeek}
              <span className="text-[13px] font-sans ml-0.5 opacity-60">m · {health.sleepHoursAvg}h</span>
            </p>
          </div>
        </div>

        {/* Segmented Tabs */}
        <div className={`mt-4 grid grid-cols-3 gap-1 rounded-[16px] p-1 ${tabWrapBg}`}>
          {[
            { id: 'hydration' as const, label: 'Water & Baseline', Icon: Droplets },
            { id: 'food' as const, label: 'Food & Diet', Icon: Utensils },
            { id: 'bloodwork' as const, label: 'Bloodwork', Icon: Activity },
          ].map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
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

        {/* TAB 1: Hydration + Sleep + Zone 2 */}
        {activeTab === 'hydration' && (
          <div className="mt-4 space-y-3">
            <section className={`rounded-[22px] p-4 ${cardBg}`}>
              <h3 className="text-[14px] font-semibold">Your starting targets</h3>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <NumberField label="Weight (kg)" darkMode={darkMode} value={health.weightKg} max={250} placeholder="e.g. 75"
                  onChange={(value) => updateHealth({ weightKg: value })} />
                <NumberField label="Training days per week" darkMode={darkMode} value={health.trainingDays} max={7} step={1}
                  onChange={(value) => updateHealth({ trainingDays: value === undefined ? undefined : Math.round(value) })} />
              </div>
              <label className="mt-3 block text-[13px]">
                Last caffeine time
                <input type="time" value={health.caffeineCutoff ?? ''} onChange={(event) => updateHealth({ caffeineCutoff: event.currentTarget.value })}
                  className={fieldSurface(darkMode)} />
              </label>
              <p className={`mt-2 text-[13px] leading-relaxed ${subText}`}>
                {targets.personalised
                  ? `Start with about ${targets.waterMl.toLocaleString()} ml of drinks and ${targets.proteinG} g of protein per day. The drink estimate averages your training across the week.`
                  : 'Enter a weight between 35 and 250 kg to estimate a starting point for drinks and protein.'}
                {targets.caffeineCutoff && ` After ${targets.caffeineCutoff}, try water or a caffeine-free drink and note how you sleep.`}
              </p>
              <a className="mt-1 inline-block text-[13px] underline underline-offset-2" href="https://pubmed.ncbi.nlm.nih.gov/39377163/" target="_blank" rel="noreferrer">Caffeine and sleep study</a>
              <a className="ml-3 inline-block text-[13px] underline underline-offset-2" href="https://pubmed.ncbi.nlm.nih.gov/28698222/" target="_blank" rel="noreferrer">Protein and training study</a>
              <label className="mt-3 flex items-start gap-2 text-[13px]">
                <input type="checkbox" checked={Boolean(health.baselineReviewed)} onChange={(event) => updateHealth({ baselineReviewed: event.currentTarget.checked })}
                  className="mt-0.5 accent-[#2347D8]" />
                I reviewed my water, food and preventive care plan.
              </label>
            </section>
            <div className={`rounded-[22px] p-4 ${cardBg}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[14px] font-semibold">Daily Water Intake</p>
                  <p className={`text-[13px] ${subText}`}>
                    Target {targets.waterMl} ml ({waterPct}% complete)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => updateHealth({ waterMlToday: 0 })}
                  className={`flex items-center gap-1 rounded-full px-3 py-1.5 text-[13px] font-medium ${
                    darkMode ? 'bg-[#2A2A32] text-[#C8C8D0]' : 'bg-white text-[#6A6A72]'
                  }`}
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset
                </button>
              </div>

              <div
                className={`mt-3 h-2.5 w-full overflow-hidden rounded-full ${
                  darkMode ? 'bg-[#2C2C35]' : 'bg-[#E5E5E7]'
                }`}
              >
                <div
                  className="h-full rounded-full bg-[#2347D8] transition-all duration-300"
                  style={{ width: `${waterPct}%` }}
                />
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {[250, 500, 750].map((ml) => (
                  <button
                    key={ml}
                    type="button"
                    onClick={() =>
                      updateHealth({
                        waterMlToday: Math.min(5000, health.waterMlToday + ml),
                      })
                    }
                    className={`flex items-center gap-1 rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${
                      darkMode
                        ? 'bg-[#2347D8] text-white hover:bg-[#2F54EB]'
                        : 'bg-[#141416] text-white hover:bg-[#2A2A30]'
                    }`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    {ml}ml
                  </button>
                ))}
              </div>

              <p className={`mt-3 text-[13px] leading-snug ${subText}`}>
                Spread drinks across the day. Adjust for heat, exercise and any fluid limit your clinician gave you.
              </p>
            </div>

            {/* Morning & Evening Protocol Cards with Inline Science Explainers (Ref 11) */}
            <div className={`rounded-[22px] p-4 ${cardBg}`}>
              <p className="text-[14px] font-semibold">Morning &amp; Evening Protocol</p>
              <div className="mt-2.5 space-y-2">
                {[
                  {
                    id: 'prot-am-water',
                    period: 'Morning',
                    tag: 'Hydration · Adenosine Clearance',
                    title: '500ml water + wait 60m before coffee',
                    detail: 'Delays post-lunch caffeine crash and restores overnight plasma hydration.',
                  },
                  {
                    id: 'prot-am-protein',
                    period: 'Morning',
                    tag: 'Metabolic Base',
                    title: `First meal with ${Math.max(25, Math.round(targets.proteinG * 0.28))}g protein + 10m daylight`,
                    detail: 'Anchors circadian alertness and reduces late-evening glucose swings.',
                  },
                  {
                    id: 'prot-pm-caffeine',
                    period: 'Evening',
                    tag: 'Sleep Architecture',
                    title: `Zero caffeine after ${targets.caffeineCutoff ?? '14:00'} · dim screens`,
                    detail: 'Preserves slow-wave deep sleep and overnight growth hormone pulsatility.',
                  },
                ].map((row) => {
                  const open = expandedScienceId === row.id;
                  return (
                    <div
                      key={row.id}
                      className={`rounded-[16px] p-3 ${darkMode ? 'bg-[#16161B]' : 'bg-white'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span
                            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                              row.period === 'Morning'
                                ? darkMode
                                  ? 'bg-[#2347D8]/25 text-[#A9BEFF]'
                                  : 'bg-[#EEF2FD] text-[#2347D8]'
                                : darkMode
                                  ? 'bg-[#16794F]/25 text-[#72D2A3]'
                                  : 'bg-[#EAF6EF] text-[#16794F]'
                            }`}
                          >
                            {row.period} · {row.tag}
                          </span>
                          <p className="mt-1.5 text-[13.5px] font-semibold leading-snug">{row.title}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setExpandedScienceId(open ? null : row.id)}
                          aria-label={`Science note for ${row.title}`}
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cardBg}`}
                        >
                          <Info className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      {open && (
                        <p className={`mt-2 text-[12.5px] leading-relaxed ${subText}`}>{row.detail}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className={`rounded-[22px] p-4 ${cardBg}`}>
              <p className="text-[14px] font-semibold">Sleep & Zone 2 Foundation</p>
              <p className={`text-[13px] mt-0.5 ${subText}`}>
                Matthew Walker & Peter Attia target: 7.5h+ sleep + 150 min/wk Zone 2 cardio.
              </p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={`text-[13px] font-medium ${subText}`}>Avg Sleep (hrs)</span>
                  <input
                    type="number"
                    step="0.1"
                    min="4"
                    max="11"
                    value={health.sleepHoursAvg}
                    onChange={(e) =>
                      updateHealth({ sleepHoursAvg: Number(e.target.value) || 7 })
                    }
                    className={`mt-1 w-full rounded-[14px] px-3 py-2 text-[14px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6688FF] ${
                      darkMode ? 'bg-[#16161B] text-white' : 'bg-white text-[#141416]'
                    }`}
                  />
                </label>
                <label className="block">
                  <span className={`text-[13px] font-medium ${subText}`}>Zone 2 this week (min)</span>
                  <input
                    type="number"
                    step="10"
                    min="0"
                    max="600"
                    value={health.zone2MinsWeek}
                    onChange={(e) =>
                      updateHealth({ zone2MinsWeek: Math.max(0, Number(e.target.value) || 0) })
                    }
                    className={`mt-1 w-full rounded-[14px] px-3 py-2 text-[14px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6688FF] ${
                      darkMode ? 'bg-[#16161B] text-white' : 'bg-white text-[#141416]'
                    }`}
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Food & Diet Pattern */}
        {activeTab === 'food' && (
          <div className="mt-4 space-y-3">
            <div className={`rounded-[22px] p-4 ${cardBg}`}>
              <p className="text-[14px] font-semibold">Diet Style</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {(Object.keys(DIET_GUIDES) as DietStyle[]).map((id) => {
                  const selected = health.dietStyle === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => updateHealth({ dietStyle: id })}
                      className={`rounded-full px-3 py-1.5 text-[13px] font-medium transition ${
                        selected
                          ? darkMode
                            ? 'bg-white text-[#141416]'
                            : 'bg-[#141416] text-white'
                          : darkMode
                          ? 'bg-[#2A2A32] text-[#D0D0D8]'
                          : 'bg-white text-[#141416]'
                      }`}
                    >
                      {DIET_GUIDES[id].label}
                    </button>
                  );
                })}
              </div>

              <div className="mt-3 flex items-center justify-between text-[13px]">
                <span className="font-medium">
                  Protein {totalProtein}g / {targets.proteinG}g ({proteinPct}%)
                </span>
                <span className={subText}>{totalCalories} kcal logged</span>
              </div>
              <div
                className={`mt-1.5 h-2 w-full overflow-hidden rounded-full ${
                  darkMode ? 'bg-[#2C2C35]' : 'bg-[#E5E5E7]'
                }`}
              >
                <div
                  className="h-full rounded-full bg-[#16794F] transition-all"
                  style={{ width: `${proteinPct}%` }}
                />
              </div>
            </div>

            <section className={`rounded-[22px] p-4 ${cardBg}`}>
              <h3 className="text-[14px] font-semibold">Food swaps to try</h3>
              <ul className={`mt-2 list-disc space-y-1 pl-4 text-[13px] leading-snug ${subText}`}>
                {DIET_GUIDES[health.dietStyle].swaps.map((swap) => <li key={swap}>{swap}</li>)}
              </ul>
            </section>

            <form onSubmit={handleAddMeal} className={`rounded-[22px] p-4 ${cardBg}`}>
              <p className="text-[14px] font-semibold">Log Food Intake</p>
              <div className="mt-2.5 grid grid-cols-12 gap-2">
                <input
                  type="text"
                  aria-label="Meal"
                  placeholder="e.g. Eggs + avocado toast"
                  value={mealLabel}
                  onChange={(e) => setMealLabel(e.target.value)}
                  className={`col-span-6 rounded-[14px] px-3 py-2 text-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6688FF] ${
                    darkMode ? 'bg-[#16161B] text-white placeholder-[#7A7A84]' : 'bg-white text-[#141416]'
                  }`}
                />
                <input
                  type="number"
                  aria-label="Meal protein in grams"
                  placeholder="Protein g"
                  value={mealProtein}
                  onChange={(e) => setMealProtein(e.target.value)}
                  className={`col-span-3 rounded-[14px] px-2.5 py-2 text-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6688FF] ${
                    darkMode ? 'bg-[#16161B] text-white' : 'bg-white text-[#141416]'
                  }`}
                />
                <input
                  type="number"
                  aria-label="Meal calories"
                  placeholder="kcal"
                  value={mealCals}
                  onChange={(e) => setMealCals(e.target.value)}
                  className={`col-span-3 rounded-[14px] px-2.5 py-2 text-[13px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#6688FF] ${
                    darkMode ? 'bg-[#16161B] text-white' : 'bg-white text-[#141416]'
                  }`}
                />
              </div>
              <button
                type="submit"
                className={`mt-2.5 w-full rounded-full py-2.5 text-[13px] font-semibold transition ${
                  darkMode ? 'bg-white text-[#141416]' : 'bg-[#141416] text-white'
                }`}
              >
                + Add Meal Entry
              </button>
            </form>

            <div className="space-y-2">
              {health.mealsLogged.map((meal) => (
                <div
                  key={meal.id}
                  className={`flex items-center justify-between rounded-[18px] px-4 py-3 ${cardBg}`}
                >
                  <div>
                    <p className="text-[14px] font-medium">{meal.label}</p>
                    <p className={`text-[13px] ${subText}`}>
                      {meal.proteinG}g protein · {meal.calories} kcal · {meal.time}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveMeal(meal.id)}
                    aria-label={`Remove ${meal.label}`}
                    className={`rounded-full p-2 transition ${subText} hover:text-[#C43929]`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bloodwork' && <BloodworkPanel health={health} darkMode={darkMode} onUpdateHealth={updateHealth} />}
      </motion.div>
    </motion.div>
  );
};
