/**
 * Body signals and the illness signal (SPEC §3.8): skin temperature, breathing rate, resting heart rate and blood
 * oxygen, each against your own normal from the last 28 days. A signal is drifting when it has moved the concerning
 * way by at least twice your usual spread and by a minimum real amount, so sensor noise never raises a flag.
 * Two or more drifting together is the illness signal: life suggests taking it easy and points to NHS 111.
 * It never diagnoses. Thresholds follow the "statistical and absolute" rule in Atria's `AtriaNightBaseline.swift`
 * (MIT, see THIRD_PARTY_NOTICES.md), with values chosen for these four signals.
 */
import { isNum, round } from '../math/stats';
import { addDays, type DateKey } from '../time/zone';
import { personalBaseline, rangePosition, type DayValue } from './baseline';
import type { DailyHealth } from './types';

export type SignalKind = 'skinTemp' | 'respiratoryRate' | 'restingHr' | 'spo2';

interface SignalRule { pick: (d: DailyHealth) => number | undefined; worse: 'up' | 'down'; minEffect: number; floor: number }

export const SIGNAL_RULES: Record<SignalKind, SignalRule> = {
  skinTemp: { pick: d => d.skinTempDelta, worse: 'up', minEffect: 0.5, floor: 0.15 },
  respiratoryRate: { pick: d => d.respiratoryRate, worse: 'up', minEffect: 1, floor: 0.3 },
  restingHr: { pick: d => d.restingHr, worse: 'up', minEffect: 4, floor: 1 },
  spo2: { pick: d => d.spo2, worse: 'down', minEffect: 2, floor: 0.5 },
};
export const SIGNAL_DRIFT_Z = 2;
export const SIGNAL_BASELINE_DAYS = 28;
export const SIGNAL_MIN_DAYS = 14;

export interface BodySignal {
  kind: SignalKind;
  value: number;
  usual: number;
  normal: [number, number];
  /** Position on the range bar, your normal filling 30 to 70. */
  position: number;
  z: number;
  drifting: boolean;
}

export interface BodySignals {
  signals: BodySignal[];
  /** Signals still learning your normal. */
  learning: SignalKind[];
  drifting: SignalKind[];
  /** Two or more drifting together. */
  illness: boolean;
  /** Days in a row, ending today, with the illness signal. */
  daysRunning: number;
}

function signalsOn(days: readonly DailyHealth[], today: DateKey): Omit<BodySignals, 'daysRunning'> {
  const todayRow = days.find(d => d.date === today);
  const signals: BodySignal[] = [];
  const learning: SignalKind[] = [];
  for (const kind of Object.keys(SIGNAL_RULES) as SignalKind[]) {
    const rule = SIGNAL_RULES[kind];
    const value = todayRow ? rule.pick(todayRow) : undefined;
    if (!isNum(value)) continue;
    const values: DayValue[] = days.flatMap(d => { const v = rule.pick(d); return isNum(v) ? [{ date: d.date, value: v }] : []; });
    const base = personalBaseline(values, today, { days: SIGNAL_BASELINE_DAYS, minDays: SIGNAL_MIN_DAYS, spreadFloor: rule.floor });
    if (!base) { learning.push(kind); continue; }
    const delta = value - base.usual;
    const z = delta / base.spread;
    const concerning = rule.worse === 'up' ? delta > 0 : delta < 0;
    const drifting = concerning && Math.abs(z) >= SIGNAL_DRIFT_Z && Math.abs(delta) >= rule.minEffect;
    const dp = kind === 'restingHr' ? 0 : 1;
    signals.push({ kind, value, usual: round(base.usual, dp), normal: [round(base.normal[0], dp), round(base.normal[1], dp)], position: rangePosition(value, base.normal), z: round(z, 2), drifting });
  }
  const drifting = signals.filter(s => s.drifting).map(s => s.kind);
  return { signals, learning, drifting, illness: drifting.length >= 2 };
}

export function bodySignals(days: readonly DailyHealth[], today: DateKey): BodySignals {
  const now = signalsOn(days, today);
  let daysRunning = 0;
  if (now.illness) {
    daysRunning = 1;
    for (let i = 1; i < 14; i++) {
      const date = addDays(today, -i);
      if (!signalsOn(days, date).illness) break;
      daysRunning++;
    }
  }
  return { ...now, daysRunning };
}
