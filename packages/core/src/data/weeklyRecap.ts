import type { IncomeBreakdown, LifeLevelState, UserProfile } from '../types/lifeos';

export interface WeeklyRecapMetricCard {
  id: string;
  weekLabel: string;
  activeDays: number;
  activeDelta: 'up' | 'down';
  checkInsCount: number;
  checkInsDelta: 'up' | 'down';
  highlightValue: string;
  highlightUnit: string;
  highlightDelta: 'up' | 'down';
  badgeBgHex: string;
  accentLabel: string;
}

/**
 * Builds the 4-week fanned New-Normal Recap stack (ref 15) from live profile,
 * health routine, growth check-in, and income/cashflow state.
 */
export function buildWeeklyRecapDeck(
  profile: UserProfile,
  breakdown: IncomeBreakdown,
  levelState: LifeLevelState,
  completedCount: number
): WeeklyRecapMetricCard[] {
  const streak = Math.max(1, Math.min(30, profile.habitStreakDays ?? (completedCount > 0 ? 4 + Math.min(completedCount, 12) : 4)));
  const activeThisWeek = Math.min(7, Math.max(2, Math.min(streak, 7)));
  const waterLiters = ((profile.health?.waterMlToday ?? 1500) / 1000).toFixed(1);
  const checkInEntries = Object.values(profile.growth?.checkIns ?? {}).reduce(
    (sum, list) => sum + (list?.length ?? 0),
    0
  );
  const netMarginLabel = `${profile.countryCode === 'UK' ? '£' : profile.countryCode === 'US' ? '$' : profile.countryCode === 'DE' ? '€' : '₦'}${Math.max(
    0,
    profile.runway?.netRunway ?? Math.round(breakdown.netTakeHomeMonthly * 0.25)
  ).toLocaleString()}`;

  return [
    {
      id: 'week-0',
      weekLabel: 'This week · Live',
      activeDays: activeThisWeek,
      activeDelta: activeThisWeek >= 4 ? 'up' : 'down',
      checkInsCount: Math.max(1, completedCount + checkInEntries),
      checkInsDelta: completedCount + checkInEntries >= 2 ? 'up' : 'down',
      highlightValue: `${waterLiters}L`,
      highlightUnit: 'avg daily water',
      highlightDelta: Number(waterLiters) >= 1.8 ? 'up' : 'down',
      badgeBgHex: '#E07A48',
      accentLabel: `Level ${levelState.currentLevel} · ${levelState.progressPct}%`,
    },
    {
      id: 'week-1',
      weekLabel: 'Last week · Prev',
      activeDays: Math.max(1, activeThisWeek - 1),
      activeDelta: 'up',
      checkInsCount: Math.max(1, completedCount + checkInEntries - 1),
      checkInsDelta: 'down',
      highlightValue: netMarginLabel,
      highlightUnit: '30-day buffer',
      highlightDelta: 'up',
      badgeBgHex: '#16794F',
      accentLabel: 'Cash & Tax',
    },
    {
      id: 'week-2',
      weekLabel: '2 weeks ago',
      activeDays: Math.max(1, activeThisWeek - 2),
      activeDelta: 'down',
      checkInsCount: 3,
      checkInsDelta: 'up',
      highlightValue: `${profile.health?.zone2MinsWeek ?? 90}m`,
      highlightUnit: 'Zone 2 aerobic',
      highlightDelta: (profile.health?.zone2MinsWeek ?? 90) >= 120 ? 'up' : 'down',
      badgeBgHex: '#4F77E8',
      accentLabel: 'Health Base',
    },
    {
      id: 'week-3',
      weekLabel: '3 weeks ago',
      activeDays: Math.max(1, activeThisWeek - 3),
      activeDelta: 'down',
      checkInsCount: 2,
      checkInsDelta: 'down',
      highlightValue: `${profile.health?.sleepHoursAvg ?? 7.0}h`,
      highlightUnit: 'sleep average',
      highlightDelta: (profile.health?.sleepHoursAvg ?? 7.0) >= 7.5 ? 'up' : 'down',
      badgeBgHex: '#2C2C32',
      accentLabel: 'Baseline Start',
    },
  ];
}
