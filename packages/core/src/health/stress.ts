/**
 * Stress, 0 (calm) to 3 (high), in half hours (SPEC §3.8): heart rate above resting while you're still, nudged by
 * HRV when there is a reading. Labelled an estimate everywhere it shows. Windows where you're moving are left out,
 * so a walk never reads as stress.
 */
import { clamp, isNum, mean, round } from '../math/stats';
import { personalBaseline, type DayValue } from './baseline';
import type { DateKey } from '../time/zone';

export const STRESS_MAX = 3;
/** Heart-rate reserve while still: at 5% you're calm, at 30% stress reads high. */
export const STRESS_CALM_HRR = 0.05;
export const STRESS_HIGH_HRR = 0.3;
export const WINDOW_MINUTES = 30;

export interface StressWindow {
  start: number;
  /** Average heart rate in the window, while still. */
  bpm?: number;
  /** False when steps or motion show you were moving. */
  still: boolean;
  /** An HRV reading in the window, ms (same method as the baseline). */
  hrv?: number;
}

export interface StressContext {
  restingHr: number;
  maxHr: number;
  /** Your usual log HRV and its spread, to nudge the level when there's a reading. */
  lnHrvBaseline?: { usual: number; spread: number };
}

/** One window's level, or null when you were moving or there's no heart rate. */
export function stressLevel(window: StressWindow, ctx: StressContext): number | null {
  if (!window.still || !isNum(window.bpm) || !(ctx.maxHr > ctx.restingHr)) return null;
  const hrr = (window.bpm - ctx.restingHr) / (ctx.maxHr - ctx.restingHr);
  let level = STRESS_MAX * clamp((hrr - STRESS_CALM_HRR) / (STRESS_HIGH_HRR - STRESS_CALM_HRR), 0, 1);
  if (isNum(window.hrv) && window.hrv > 0 && ctx.lnHrvBaseline && ctx.lnHrvBaseline.spread > 0) {
    const z = (Math.log(window.hrv) - ctx.lnHrvBaseline.usual) / ctx.lnHrvBaseline.spread;
    level += clamp(-z * 0.25, -0.5, 0.5);
  }
  return round(clamp(level, 0, STRESS_MAX), 1);
}

export interface StressDay {
  levels: (number | null)[];
  average: number | null;
  /** Latest window with a reading. */
  now: number | null;
  /** Minutes at 2 or above, and below 1. */
  highMinutes: number;
  calmMinutes: number;
  /** Calm minutes as a share of measured minutes, 0–100. */
  calmShare: number | null;
  /** The longest run of high windows: indexes into `levels`. */
  busiest: [number, number] | null;
}

export function stressDay(windows: readonly StressWindow[], ctx: StressContext, windowMinutes = WINDOW_MINUTES): StressDay {
  const sorted = [...windows].sort((a, b) => a.start - b.start);
  const levels = sorted.map(w => stressLevel(w, ctx));
  const measured = levels.filter((l): l is number => l !== null);
  let best: [number, number] | null = null, runStart = -1;
  levels.forEach((l, i) => {
    const high = l !== null && l >= 2;
    if (high && runStart < 0) runStart = i;
    if ((!high || i === levels.length - 1) && runStart >= 0) {
      const end = high ? i : i - 1;
      if (!best || end - runStart > best[1] - best[0]) best = [runStart, end];
      runStart = -1;
    }
  });
  const high = measured.filter(l => l >= 2).length * windowMinutes;
  const calm = measured.filter(l => l < 1).length * windowMinutes;
  return {
    levels,
    average: measured.length ? round(mean(measured) as number, 1) : null,
    now: [...levels].reverse().find((l): l is number => l !== null) ?? null,
    highMinutes: high,
    calmMinutes: calm,
    calmShare: measured.length ? Math.round((calm / (measured.length * windowMinutes)) * 100) : null,
    busiest: best,
  };
}

/** Where your daily average usually sits, from the last 28 days (board: "usual 0.5–1.6"). */
export function stressUsual(daily: readonly DayValue[], today: DateKey): [number, number] | null {
  const base = personalBaseline(daily, today, { days: 28, minDays: 7, spreadFloor: 0.2 });
  return base ? [round(Math.max(0, base.normal[0]), 1), round(Math.min(STRESS_MAX, base.normal[1]), 1)] : null;
}
