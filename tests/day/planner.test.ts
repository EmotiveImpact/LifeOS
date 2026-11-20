import { describe, expect, test } from 'bun:test';
import { contextKey, learnedBoost, recordOutcome, sampleBeta, type BanditState } from '../../packages/core/src/day/learning';
import { heavyWeekdayPattern, planToday, type Candidate, type PlanContext } from '../../packages/core/src/day/planner';
import { seededRandom } from '../../packages/core/src/math/stats';
import { addDays, instantAt } from '../../packages/core/src/time/zone';

const LDN = 'Europe/London';
const TODAY = '2026-11-20';
const NOW = instantAt(TODAY, 9 * 60, LDN);
const HOUR = 3_600_000;
const ctx = (over: Partial<PlanContext> = {}): PlanContext => ({ now: NOW, timeZone: LDN, readiness: 60, mood: 'calm', hasAim: true, ...over });

const moves: Candidate[] = [
  { id: 'rebate', kind: 'mission', title: 'Claim your tax rebate', minutes: 6, valueGBP: 312, demanding: true, dueAt: NOW + 20 * 24 * HOUR },
  { id: 'taxcode', kind: 'mission', title: 'Check your tax code', minutes: 4, valueGBP: 40, dueAt: NOW + 40 * 24 * HOUR },
  { id: 'cashplan', kind: 'routine', title: 'Set your cash plan', minutes: 10, aimFit: 0.8, demanding: true },
  { id: 'lisa', kind: 'gambit', title: 'Open a Lifetime ISA', minutes: 20, aimFit: 1, valueGBP: 1000, demanding: true },
  { id: 'walk', kind: 'health', title: 'A 30 minute walk', minutes: 30, healthValue: 0.6 },
  { id: 'glimpse', kind: 'glimpse', title: 'A glimpse of the flat', minutes: 2, aimFit: 0.6 },
];

const ids = (plan: ReturnType<typeof planToday>) => [plan.next?.id, ...plan.worthDoing.map(m => m.id)];

describe('ranking', () => {
  test('one next move, two worth doing, the rest in Plan', () => {
    const plan = planToday(moves, ctx());
    expect(plan.next).not.toBeNull();
    expect(plan.worthDoing).toHaveLength(2);
    expect(plan.later).toHaveLength(moves.length - 3);
    expect(plan.tone).toBe('steady');
  });
  test('moves that serve the Chief Aim are tagged and explained', () => {
    const lisa = [planToday(moves, ctx()).next, ...planToday(moves, ctx()).worthDoing, ...planToday(moves, ctx()).later].find(m => m?.id === 'lisa')!;
    expect(lisa.tags).toContain('for-your-aim');
    expect(lisa.why).toContain('For your Aim.');
    expect(lisa.why).toContain('Worth about £1,000.');
  });
  test('a nudge you keep ignoring slips down', () => {
    const recentNudges = [1, 2, 3, 4].map(d => ({ id: 'cashplan', at: NOW - d * 24 * HOUR, acted: false }));
    const before = planToday(moves, ctx()).later.concat(planToday(moves, ctx()).worthDoing, [planToday(moves, ctx()).next!]).find(m => m.id === 'cashplan')!.score;
    const after = planToday(moves, ctx({ recentNudges })).later.concat(planToday(moves, ctx({ recentNudges })).worthDoing, [planToday(moves, ctx({ recentNudges })).next!]).find(m => m.id === 'cashplan')!.score;
    expect(after).toBeCloseTo(before - 2, 5);
  });
});

describe('the rules', () => {
  test('a deadline inside 24 hours comes first, whatever the mood', () => {
    const due = { id: 'council', kind: 'admin' as const, title: 'Pay council tax', minutes: 5, dueAt: NOW + 6 * HOUR };
    for (const mood of ['calm', 'drained', 'driven'] as const) {
      const plan = planToday([...moves, due], ctx({ mood, readiness: 20 }));
      expect(plan.next?.id).toBe('council');
      expect(plan.next?.tags).toContain('deadline');
    }
  });
  test('low readiness allows one demanding move and pushes the others to tomorrow', () => {
    const plan = planToday(moves, ctx({ readiness: 28 }));
    const today = [plan.next, ...plan.worthDoing];
    expect(today.filter(m => m && ['rebate', 'cashplan', 'lisa'].includes(m.id)).length).toBeLessThanOrEqual(1);
    expect(plan.tomorrow.length).toBeGreaterThanOrEqual(1);
    expect(plan.tomorrow[0].why.at(-1)).toBe('Readiness is low (28), so this waits for tomorrow.');
    expect(plan.cards.map(c => c.id)).toContain('rest-habit');
    expect(plan.why[0]).toBe('Readiness is low (28), so today has one demanding thing at most.');
    expect(plan.tone).toBe('gentle');
  });
  test('high readiness and feeling driven: the bigger move leads', () => {
    const plan = planToday(moves, ctx({ readiness: 75, mood: 'driven' }));
    expect(plan.next?.id).toBe('lisa');
    expect(plan.tone).toBe('bold');
  });
  test('three short nights: health stack, caffeine cut-off, no new commitments after 20:00, and a lighter day', () => {
    const late = { id: 'drinks', kind: 'people' as const, title: 'Drinks with Tom', minutes: 120, startsAt: 20 * 60 + 30 };
    const plan = planToday([...moves, late], ctx({ sleepShortfall3: 200, averageSleep3: 340 }));
    expect(plan.cards.map(c => c.id)).toEqual(expect.arrayContaining(['health-stack', 'caffeine-cutoff']));
    expect(plan.noNewCommitmentsAfter).toBe(20 * 60);
    expect(plan.later.find(m => m.id === 'drinks')?.why.at(-1)).toBe('Starts after 20:00, and you need an early night.');
    expect(plan.why).toContain('You’ve slept 5h 40m on average, so today is lighter.');
  });
  test('drained: only what is due this week, gentle, and no glimpses', () => {
    const soon = { id: 'mot', kind: 'admin' as const, title: 'Book the MOT', minutes: 5, dueAt: NOW + 5 * 24 * HOUR };
    const plan = planToday([...moves, soon], ctx({ mood: 'drained' }));
    expect(plan.next?.id).toBe('mot');
    expect(plan.worthDoing.every(m => m.id === 'mot' || !m.tags.includes('due-soon'))).toBe(true);
    expect([plan.next, ...plan.worthDoing, ...plan.later].some(m => m?.id === 'glimpse')).toBe(false);
    expect(plan.later.find(m => m.id === 'rebate')?.why.at(-1)).toBe('Waiting for a day with more room.');
    expect(plan.showGlimpses).toBe(false);
  });
  test('payday, a hard day with little eaten, and a habit one miss from two each bring their card', () => {
    const plan = planToday(moves, ctx({
      payday: TODAY, load: { today: 15, sweetSpotHigh: 14 }, fuel: { eatenKcal: 900, targetKcal: 2300 }, habitsAtRisk: [{ id: 'bed', name: 'In bed by 22:50' }],
      now: instantAt(TODAY, 15 * 60, LDN),
    }));
    expect(plan.cards.map(c => c.id)).toEqual(['payday-sweep', 'fuel', 'never-miss-twice']);
    expect(plan.cards[2].why).toBe('One miss is normal. Doing in bed by 22:50 today keeps it going.');
  });
  test('the fuel card stays away in the evening', () => {
    const plan = planToday(moves, ctx({ load: { today: 15, sweetSpotHigh: 14 }, fuel: { eatenKcal: 900, targetKcal: 2300 }, now: instantAt(TODAY, 20 * 60, LDN) }));
    expect(plan.cards.map(c => c.id)).not.toContain('fuel');
  });
  test('the illness signal lightens the day and points to NHS 111', () => {
    const plan = planToday(moves, ctx({ illness: true }));
    expect(plan.cards.find(c => c.id === 'take-it-easy')?.why).toContain('NHS 111');
    expect(plan.tomorrow.length).toBeGreaterThanOrEqual(1);
  });
  test('a weekday that felt heavy three weeks running is planned light', () => {
    const checkIns = [7, 14, 21].map(d => ({ date: addDays(TODAY, -d), mood: d === 14 ? 'anxious' : 'drained' }));
    expect(heavyWeekdayPattern(checkIns, TODAY)).toBe(true);
    expect(heavyWeekdayPattern([...checkIns.slice(0, 2), { date: addDays(TODAY, -21), mood: 'calm' }], TODAY)).toBe(false);
    expect(planToday(moves, ctx({ lightDay: true })).why).toContain('This day of the week has felt heavy lately, so it’s planned light.');
  });
});

describe('learning what you do (Thompson sampling)', () => {
  test('Beta draws stay between 0 and 1 and centre on the evidence', () => {
    const random = seededRandom(7);
    const draws = Array.from({ length: 4000 }, () => sampleBeta(9, 3, random));
    expect(Math.min(...draws)).toBeGreaterThan(0);
    expect(Math.max(...draws)).toBeLessThan(1);
    expect(draws.reduce((a, b) => a + b, 0) / draws.length).toBeCloseTo(0.75, 1);
  });
  test('outcomes update a copy, and old evidence fades', () => {
    const empty: BanditState = {};
    const one = recordOutcome(empty, 'health', 'high-up-morning', 'done');
    const two = recordOutcome(one, 'health', 'high-up-morning', 'skipped');
    expect(empty).toEqual({});
    expect(two['health|high-up-morning']).toEqual({ done: 0.98, skipped: 1 });
  });
  test('moves you keep doing rise; the same seed replays the same plan', () => {
    let state: BanditState = {};
    const context = contextKey({ readiness: 60, mood: 'calm', now: NOW, timeZone: LDN });
    expect(context).toBe('moderate-even-morning');
    for (let i = 0; i < 20; i++) { state = recordOutcome(state, 'health', context, 'done'); state = recordOutcome(state, 'routine', context, 'skipped'); }
    const random = seededRandom(1);
    expect(learnedBoost(state, 'health', context, random).boost).toBeGreaterThan(learnedBoost(state, 'routine', context, random).boost);
    const a = planToday(moves, ctx({ learning: { state, random: seededRandom(42) } }));
    const b = planToday(moves, ctx({ learning: { state, random: seededRandom(42) } }));
    expect(ids(a)).toEqual(ids(b));
    expect([a.next, ...a.worthDoing, ...a.later].find(m => m?.id === 'walk')?.why).toContain('You often do moves like this on days like today.');
  });
});
