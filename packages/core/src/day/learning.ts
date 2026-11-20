/**
 * Learning which moves this person actually does (Phase 29): a contextual bandit with Thompson sampling. Each kind of
 * move, in each kind of day (readiness band, how you're feeling, part of the day), keeps a Beta(done + 1, skipped + 1)
 * belief. The planner draws from it, so moves you tend to do rise, untried ones still get a chance, and nothing is
 * ever ruled out for good. Old evidence fades a little with each new outcome so the plan follows you as you change.
 *
 * The random source is passed in, so a test (or "Why am I seeing this?") can replay exactly what happened.
 */
import { clamp, seededRandom } from '../math/stats';
import { localMinutes } from '../time/zone';

export interface Arm { done: number; skipped: number }
export type BanditState = Readonly<Record<string, Arm>>;
export type Outcome = 'done' | 'skipped' | 'dismissed';

/** Each new outcome keeps 98% of what came before. */
export const FORGET = 0.98;
/** How far a learned preference can move a move's score either way. */
export const LEARNED_WEIGHT = 2;

export type MoodGroup = 'heavy' | 'up' | 'even';
export const moodGroup = (mood: string | null | undefined): MoodGroup =>
  mood === 'drained' || mood === 'anxious' ? 'heavy' : mood === 'driven' || mood === 'restless' ? 'up' : 'even';

/** The kind of day: readiness band, mood group and part of the day, e.g. `high-up-morning`. */
export function contextKey(input: { readiness?: number | null; mood?: string | null; now: number; timeZone: string }): string {
  const r = input.readiness;
  const band = typeof r !== 'number' ? 'unknown' : r < 34 ? 'low' : r < 67 ? 'moderate' : 'high';
  const minutes = localMinutes(input.now, input.timeZone);
  const part = minutes < 12 * 60 ? 'morning' : minutes < 17 * 60 ? 'afternoon' : 'evening';
  return `${band}-${moodGroup(input.mood)}-${part}`;
}

const armKey = (kind: string, context: string) => `${kind}|${context}`;

/** A standard normal draw (Box-Muller). */
function normal(random: () => number): number {
  const u = Math.max(random(), 1e-12), v = random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

/** A Gamma(shape, 1) draw for shape ≥ 1 (Marsaglia and Tsang 2000). */
function gamma(shape: number, random: () => number): number {
  const d = shape - 1 / 3, c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number, v: number;
    do { x = normal(random); v = 1 + c * x; } while (v <= 0);
    v = v * v * v;
    const u = random();
    if (u < 1 - 0.0331 * x ** 4 || Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v;
  }
}

/** A Beta(a, b) draw for a, b ≥ 1. */
export function sampleBeta(a: number, b: number, random: () => number): number {
  const x = gamma(Math.max(1, a), random), y = gamma(Math.max(1, b), random);
  return x / (x + y);
}

export interface Learned {
  /** Added to the move's score: between −2 and +2. */
  boost: number;
  /** How often this kind of move gets done on this kind of day, as believed so far (0–1). */
  rate: number;
  /** Outcomes seen (after fading). */
  seen: number;
}

export function learnedBoost(state: BanditState, kind: string, context: string, random: () => number): Learned {
  const arm = state[armKey(kind, context)] ?? { done: 0, skipped: 0 };
  const draw = sampleBeta(arm.done + 1, arm.skipped + 1, random);
  return { boost: clamp((draw - 0.5) * 2 * LEARNED_WEIGHT, -LEARNED_WEIGHT, LEARNED_WEIGHT), rate: (arm.done + 1) / (arm.done + arm.skipped + 2), seen: arm.done + arm.skipped };
}

/** The state after one outcome. Returns a new object; the old one is left as it was. */
export function recordOutcome(state: BanditState, kind: string, context: string, outcome: Outcome): BanditState {
  const key = armKey(kind, context);
  const arm = state[key] ?? { done: 0, skipped: 0 };
  const next = { done: arm.done * FORGET + (outcome === 'done' ? 1 : 0), skipped: arm.skipped * FORGET + (outcome === 'done' ? 0 : 1) };
  return { ...state, [key]: next };
}

/** A random source that stays the same all day, so today's order doesn't reshuffle each time Today opens. */
export function dayRandom(key: string): () => number {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  return seededRandom(h >>> 0);
}
