import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  CheckSquare,
  Droplets,
  Footprints,
  Moon,
  Repeat,
  X,
} from 'lucide-react';
import { DEFAULT_HEALTH_SNAPSHOT } from '@life/core/engine';
import { ActiveFunctionOverlay, LifeTask, UserProfile } from '@life/core/types';

interface TodayBriefSheetProps {
  profile: UserProfile;
  darkMode?: boolean;
  eligibleTasks: LifeTask[];
  completedIds: string[];
  onUpdateProfile?: (patch: Partial<UserProfile>) => void;
  onOpenOverlay: (overlay: ActiveFunctionOverlay) => void;
  onSelectTask: (task: LifeTask, targetState?: 'task-aura' | 'scheme-portal') => void;
  onClose: () => void;
}

interface AgendaEvent {
  id: string;
  title: string;
  timeLabel: string;
  countdownLabel: string;
  window: 'Morning' | 'Afternoon' | 'Evening';
  scope: 'money' | 'health' | 'growth';
  dotHex: string;
  done?: boolean;
  action?: () => void;
}

export const TodayBriefSheet: React.FC<TodayBriefSheetProps> = ({
  profile,
  darkMode = false,
  eligibleTasks,
  completedIds,
  onUpdateProfile,
  onOpenOverlay,
  onSelectTask,
  onClose,
}) => {
  const health = profile.health ?? DEFAULT_HEALTH_SNAPSHOT;
  const activeTasks = eligibleTasks.filter((t) => !completedIds.includes(t.id));
  const [scopeFilter, setScopeFilter] = useState<'all' | 'money' | 'health' | 'growth'>('all');
  const [viewLayout, setViewLayout] = useState<'list' | 'blocks'>('list');
  const [localDoneIds, setLocalDoneIds] = useState<string[]>(profile.completedAgendaIds ?? []);
  const savedDoneIds = onUpdateProfile ? (profile.completedAgendaIds ?? []) : localDoneIds;

  const toggleAgendaDone = (eventId: string) => {
    const next = savedDoneIds.includes(eventId)
      ? savedDoneIds.filter((id) => id !== eventId)
      : [...savedDoneIds, eventId];
    setLocalDoneIds(next);
    onUpdateProfile?.({ completedAgendaIds: next });
  };

  const weekDays = useMemo(() => {
    const base = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      return {
        idx: i,
        dayNum: d.getDate(),
        shortDay: d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase(),
        longDay: d.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      };
    });
  }, []);

  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const selectedDay = weekDays[selectedDayIdx] ?? weekDays[0];

  const greetingTime = new Date().getHours() < 12 ? 'Good morning' : new Date().getHours() < 18 ? 'Good afternoon' : 'Good evening';
  const topTask = activeTasks[0];
  const secondTask = activeTasks[1];

  const scheduleForDay: AgendaEvent[] = useMemo(() => {
    let base: AgendaEvent[];
    if (selectedDayIdx === 0) {
      base = [
        {
          id: 'ev-due',
          title: profile.runway?.dueSoonLabel || 'Rent & essential bills check',
          timeLabel: '09:00',
          countdownLabel: 'Now',
          window: 'Morning',
          scope: 'money',
          dotHex: '#C43929',
          action: () => onOpenOverlay('runway-calc'),
        },
        {
          id: 'ev-hydrate',
          title: `Morning water (${health.waterMlToday}/${health.waterTargetMl}ml) + 15g protein`,
          timeLabel: '08:30',
          countdownLabel: health.waterMlToday >= 1500 ? 'Hit' : 'in 45m',
          window: 'Morning',
          scope: 'health',
          dotHex: '#E5A93B',
          done: health.waterMlToday >= 1500,
          action: () => onOpenOverlay('health-stack'),
        },
        ...(topTask
          ? [
              {
                id: 'ev-top-task',
                title: topTask.shortTitle,
                timeLabel: '11:30',
                countdownLabel: 'in 2 hr',
                window: 'Morning' as const,
                scope: 'money' as const,
                dotHex: '#2347D8',
                action: () => onSelectTask(topTask, 'scheme-portal'),
              },
            ]
          : []),
        {
          id: 'ev-tax-subs',
          title:
            profile.workStatus === 'sole-trader' || profile.workStatus === 'director'
              ? 'Check Sole-Trader Tax Vault sweep'
              : `Verify tax code (${profile.taxCode}) & subs`,
          timeLabel: '16:30',
          countdownLabel: 'in 5 hr',
          window: 'Afternoon',
          scope: 'money',
          dotHex: '#16794F',
          action: () => onOpenOverlay('money-work'),
        },
        {
          id: 'ev-evening-checkin',
          title: 'Evening 5-min check-in & patterns review',
          timeLabel: '19:30',
          countdownLabel: 'in 8 hr',
          window: 'Evening',
          scope: 'growth',
          dotHex: '#2347D8',
          action: () => onOpenOverlay('growth-checkins'),
        },
      ];
    } else if (selectedDayIdx === 1) {
      base = [
        {
          id: 'ev-tue-call',
          title: profile.runway?.followUpLabel || 'Follow up on pending rebate / payroll',
          timeLabel: '09:30',
          countdownLabel: 'Tomorrow',
          window: 'Morning',
          scope: 'money',
          dotHex: '#2347D8',
          action: () => onOpenOverlay('runway-calc'),
        },
        ...(secondTask
          ? [
              {
                id: 'ev-tue-task',
                title: secondTask.shortTitle,
                timeLabel: '13:00',
                countdownLabel: 'Tomorrow',
                window: 'Afternoon' as const,
                scope: 'money' as const,
                dotHex: '#16794F',
                action: () => onSelectTask(secondTask, 'scheme-portal'),
              },
            ]
          : []),
        {
          id: 'ev-tue-z2',
          title: `Zone 2 aerobic session (${health.zone2MinsWeek}m logged this week)`,
          timeLabel: '18:00',
          countdownLabel: 'Tomorrow',
          window: 'Evening',
          scope: 'health',
          dotHex: '#E5A93B',
          action: () => onOpenOverlay('health-stack'),
        },
      ];
    } else {
      base = [
        {
          id: `ev-day-${selectedDayIdx}-bloods`,
          title: 'Review preventive bloodwork & Zone 2 target',
          timeLabel: '10:00',
          countdownLabel: `in ${selectedDayIdx}d`,
          window: 'Morning',
          scope: 'health',
          dotHex: '#16794F',
          action: () => onOpenOverlay('health-stack'),
        },
        {
          id: `ev-day-${selectedDayIdx}-level`,
          title: 'Levels, Weekly Recap & A-Team reflection',
          timeLabel: '17:30',
          countdownLabel: `in ${selectedDayIdx}d`,
          window: 'Afternoon',
          scope: 'growth',
          dotHex: '#2347D8',
          action: () => onOpenOverlay('levels-ateam'),
        },
      ];
    }

    const withState = base.map((ev) => ({
      ...ev,
      done: Boolean(ev.done || savedDoneIds.includes(ev.id)),
    }));
    return scopeFilter === 'all' ? withState : withState.filter((ev) => ev.scope === scopeFilter);
  }, [selectedDayIdx, profile, health, topTask, secondTask, scopeFilter, savedDoneIds, onOpenOverlay, onSelectTask]);

  const completedWinsCount = scheduleForDay.filter((ev) => ev.done).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex flex-col justify-end bg-black/45"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 360, damping: 34 }}
        onClick={(e) => e.stopPropagation()}
        className="overflow-hidden rounded-t-[28px] bg-[#0C0C0F] text-white max-h-[90%] flex flex-col"
      >
        {/* Top Matte Dark Editorial Narrative (08-morning-brief-week-agenda.jpg) */}
        <div className="px-5 pt-4 pb-5">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />

          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <h2 className="text-[28px] font-bold tracking-[-0.03em] leading-none">
                {selectedDay.longDay}
              </h2>
              <span className="h-2.5 w-2.5 rounded-full bg-[#E04338] mt-1" />
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-[12.5px] font-medium text-white/55 text-right leading-tight">
                {selectedDay.fullDate}
              </span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close Daily Brief"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white/80 hover:bg-white/18"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <p className="mt-4 text-[18px] leading-[1.45] font-medium tracking-[-0.01em] text-white/70">
            {greetingTime}, <span className="text-white">{profile.name}.</span> You have{' '}
            <span className="inline-flex items-center gap-1 text-white">
              <Calendar className="h-4 w-4 opacity-80 inline" />
              {profile.runway ? '2 deadlines,' : '1 check-in,'}
            </span>{' '}
            <span className="inline-flex items-center gap-1 text-white">
              <CheckSquare className="h-4 w-4 opacity-80 inline" />
              {activeTasks.length} moves
            </span>{' '}
            and{' '}
            <span className="inline-flex items-center gap-1 text-white">
              <Repeat className="h-4 w-4 opacity-80 inline" />
              2 daily habits
            </span>{' '}
            ahead.{' '}
            <span className="text-white/95">One focused move unlocks today.</span>
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-3.5 text-[12.5px] text-white/70">
            <span className="inline-flex items-center gap-1.5">
              <Footprints className="h-3.5 w-3.5 text-[#84A0FF]" />
              {health.zone2MinsWeek}m Zone 2
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Moon className="h-3.5 w-3.5 text-[#A78BFA]" />
              {health.sleepHoursAvg} hours sleep
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Droplets className="h-3.5 w-3.5 text-[#38BDF8]" />
              {health.waterMlToday}ml water
            </span>
          </div>
        </div>

        {/* Bottom Luminous Rising Calendar Sheet */}
        <div
          className={`flex-1 overflow-y-auto no-scrollbar rounded-t-[26px] px-4 pt-4 pb-6 ${
            darkMode ? 'bg-[#17171D] text-[#F5F5F7]' : 'bg-white text-[#141416]'
          }`}
        >
          {/* 7-Day Interactive Strip with Event Dots (Ref 12) */}
          <div className="grid grid-cols-7 gap-1 pb-2.5">
            {weekDays.map((d) => {
              const active = d.idx === selectedDayIdx;
              const dotCount = d.idx === 0 ? 3 : d.idx === 1 ? 2 : d.idx % 2 === 0 ? 2 : 1;
              return (
                <button
                  key={d.idx}
                  type="button"
                  onClick={() => setSelectedDayIdx(d.idx)}
                  className={`flex flex-col items-center rounded-[14px] py-2 transition ${
                    active
                      ? darkMode
                        ? 'bg-[#262630] text-white shadow-sm'
                        : 'bg-[#F4F2ED] text-[#141416] shadow-sm'
                      : darkMode
                      ? 'text-white/50 hover:bg-white/[0.04]'
                      : 'text-[#6A6A72] hover:bg-[#F6F6F7]'
                  }`}
                >
                  <span className="text-[14px] font-bold leading-none">{d.dayNum}</span>
                  <span className="mt-1 text-[10px] font-semibold tracking-wider">{d.shortDay}</span>
                  <span className="mt-1 flex items-center gap-0.5">
                    {Array.from({ length: dotCount }, (_, di) => (
                      <span
                        key={di}
                        className={`h-1 w-1 rounded-full ${
                          active ? 'bg-[#2347D8]' : darkMode ? 'bg-white/30' : 'bg-black/20'
                        }`}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Scope Filters + Completed Wins Counter + Layout Toggle (Refs 12 & 13) */}
          <div className="mb-2.5 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1">
              {(
                [
                  { id: 'all', label: 'All' },
                  { id: 'money', label: 'Money' },
                  { id: 'health', label: 'Health' },
                  { id: 'growth', label: 'Growth' },
                ] as const
              ).map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setScopeFilter(chip.id)}
                  className={`rounded-full px-2.5 py-1 text-[12px] font-semibold transition ${
                    scopeFilter === chip.id
                      ? darkMode
                        ? 'bg-white text-[#141416]'
                        : 'bg-[#141416] text-white'
                      : darkMode
                        ? 'bg-[#202028] text-white/65'
                        : 'bg-[#F4F2ED] text-[#5A5A60]'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                  darkMode ? 'bg-[#16794F]/30 text-[#72D2A3]' : 'bg-[#EAF6EF] text-[#16794F]'
                }`}
              >
                <CheckCircle2 className="h-3 w-3" />
                <span>{completedWinsCount} done</span>
              </span>
              <button
                type="button"
                onClick={() => setViewLayout((l) => (l === 'list' ? 'blocks' : 'list'))}
                className={`rounded-full px-2.5 py-1 text-[12px] font-semibold ${
                  darkMode ? 'bg-[#202028] text-white/80' : 'bg-[#F4F2ED] text-[#141416]'
                }`}
              >
                {viewLayout === 'list' ? 'Blocks' : 'List'}
              </button>
            </div>
          </div>

          {/* Schedule Items */}
          {viewLayout === 'blocks' ? (
            <div className="space-y-3">
              {(['Morning', 'Afternoon', 'Evening'] as const).map((slot) => {
                const items = scheduleForDay.filter((e) => e.window === slot);
                if (items.length === 0) return null;
                return (
                  <div key={slot}>
                    <p className={`mb-1.5 text-[11.5px] font-semibold uppercase tracking-wider ${darkMode ? 'text-white/45' : 'text-[#6A6A72]'}`}>
                      {slot}
                    </p>
                    <div className="space-y-1.5">
                      {items.map((ev) => (
                        <div
                          key={ev.id}
                          className={`flex items-center justify-between gap-3 rounded-[16px] px-3 py-2.5 ${
                            darkMode ? 'bg-[#202028]' : 'bg-[#F7F7F8]'
                          }`}
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => toggleAgendaDone(ev.id)}
                              aria-label={`Mark ${ev.title} complete`}
                              className="shrink-0"
                            >
                              {ev.done ? (
                                <CheckCircle2 className="h-4 w-4 text-[#16794F]" />
                              ) : (
                                <span
                                  className="block h-3 w-3 rounded-full"
                                  style={{ backgroundColor: ev.dotHex }}
                                />
                              )}
                            </button>
                            <button
                              type="button"
                              onClick={ev.action}
                              className={`truncate text-left text-[13.5px] font-medium ${
                                ev.done ? 'line-through opacity-55' : ''
                              }`}
                            >
                              {ev.title}
                            </button>
                          </div>
                          <div className="shrink-0 text-right">
                            <span className="block text-[12px] font-semibold">{ev.timeLabel}</span>
                            <span className={`block text-[11px] ${darkMode ? 'text-[#84A0FF]' : 'text-[#2347D8]'}`}>
                              {ev.countdownLabel}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-1 space-y-1.5">
              {scheduleForDay.map((ev) => (
                <div
                  key={ev.id}
                  className={`flex w-full items-center justify-between gap-3 rounded-[16px] px-3 py-3 transition ${
                    darkMode
                      ? 'bg-[#202028] hover:bg-[#272731]'
                      : 'bg-[#F7F7F8] hover:bg-[#F0EFEA]'
                  }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleAgendaDone(ev.id)}
                      aria-label={`Mark ${ev.title} complete`}
                      className="shrink-0"
                    >
                      {ev.done ? (
                        <CheckCircle2 className="h-4 w-4 text-[#16794F]" />
                      ) : (
                        <span
                          className="block h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: ev.dotHex }}
                        />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={ev.action}
                      className={`truncate text-left text-[14px] font-medium ${
                        ev.done ? 'line-through opacity-55' : ''
                      }`}
                    >
                      {ev.title}
                    </button>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`block text-[12.5px] font-medium ${
                        darkMode ? 'text-white/75' : 'text-[#141416]'
                      }`}
                    >
                      {ev.timeLabel}
                    </span>
                    <span
                      className={`block text-[11px] font-medium ${
                        ev.done
                          ? 'text-[#16794F]'
                          : darkMode
                            ? 'text-[#84A0FF]'
                            : 'text-[#2347D8]'
                      }`}
                    >
                      {ev.countdownLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
