/**
 * The shapes the health engine reads. One `DailyHealth` row per life day, built from raw samples by `summariseDays`
 * (samples.ts) or supplied directly by a wearable's own daily summary. Every row carries the zone it was lived in.
 */
import type { DateKey } from '../time/zone';
import type { StressDay } from './stress';

export type HrvMethod = 'sdnn' | 'rmssd';

export interface SleepStageMinutes { deep: number; rem: number; light: number; awake: number }

export interface NightSleep {
  /** UTC milliseconds the night started (in bed or first asleep) and ended (last asleep or out of bed). */
  start: number;
  end: number;
  asleepMinutes: number;
  inBedMinutes: number;
  awakeMinutes: number;
  latencyMinutes?: number;
  /** Local clock minutes after midnight, in the zone the night was slept in. */
  bedtime: number;
  wake: number;
  efficiency: number;
  stages?: SleepStageMinutes;
  sourceId?: string;
}

export interface DailyHealth {
  date: DateKey;
  /** IANA zone the day was lived in. */
  timeZone?: string;
  /** Local minus UTC in minutes at the day's main reading, to spot travel. */
  utcOffset?: number;
  /** Main sleep that ended this morning. */
  sleep?: NightSleep;
  /** Daytime sleep on this day, in minutes. */
  napMinutes?: number;
  hrv?: number;
  hrvMethod?: HrvMethod;
  restingHr?: number;
  respiratoryRate?: number;
  /** Skin or wrist temperature against your own normal, °C. */
  skinTempDelta?: number;
  /** A watch's absolute overnight wrist temperature, °C; `withSkinTempDeltas` (days.ts) turns it into a change. */
  skinTemp?: number;
  /** Blood oxygen, percent (0–100). */
  spo2?: number;
  steps?: number;
  activeKcal?: number;
  /** The day's Banister TRIMP (load.ts). */
  trimp?: number;
  /** A wearable's own recovery or readiness score, 0–100, used as one input and named as its source. */
  externalRecovery?: { value: number; source: string };
  /** The day's stress in half hours (stress.ts), from heart rate while still. */
  stress?: DayStress;
}

/** A day's stress: each window's level from the life day's start (null when moving or unmeasured). */
export interface DayStress extends StressDay {
  /** UTC milliseconds the first window starts (the life day's start). */
  start: number;
  windowMinutes: number;
}

/** How sure a number is (SPEC §3.8 honesty badges). */
export type Honesty = 'validated' | 'personal-baseline' | 'estimate';
