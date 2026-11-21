import { describe, expect, test } from 'bun:test';
import { dayCandidates, type CandidateInput } from '../../packages/core/src/day/candidates';
import { freeGaps, gapFor } from '../../packages/core/src/day/gaps';
import { dayNudges, NUDGE_WINDOW, planNudges, markActed, recentMoveNudges } from '../../packages/core/src/day/nudges';
import { dueJobs, JOB_EVERY } from '../../packages/core/src/day/jobs';
import { planToday } from '../../packages/core/src/day/planner';
import { dayRandom } from '../../packages/core/src/day/learning';
import { emptyLoops, savePlan, finishStep, type Priority } from '../../packages/core/src/day/loops';
import { instantAt, localMinutes } from '../../packages/core/src/time/zone';

const LDN = 'Europe/London';
const TODAY = '2026-11-20';
const at = (date: string, hh: number, mm = 0) => instantAt(date, hh * 60 + mm, LDN);
const MIN = 60_000;

const rebate: Priority = { id: 'mission:uk-hmrc-tax-code', text: 'Claim my tax rebate', own: false, area: 'money', mission: 'uk-hmrc-tax-code', steps: [
  { key: 'uk-hmrc-tax-code-0', title: 'Sign in to Government Gateway', minutes: 1, to: 'mission', mission: 'uk-hmrc-tax-code' },
  { key: 'uk-hmrc-tax-code-1', title: 'Add £640 of software and kit', minutes: 3, to: 'mission', mission: 'uk-hmrc-tax-code' },
] };
const call: Priority = { id: 'own:gran', text: 'Call Grandma', own: true, area: 'people', steps: [{ key: 'own:gran:call', title: 'Call Grandma Efua', minutes: 20 }] };

describe('free time from the calendar', () => {
  test('busy times merge, and only stretches long enough count', () => {
    const gaps = freeGaps([
      { start: at(TODAY, 9), end: at(TODAY, 10) },
      { start: at(TODAY, 9, 30), end: at(TODAY, 11) },
      { start: at(TODAY, 11, 10), end: at(TODAY, 13, 40) },
      { start: at(TODAY, 14), end: at(TODAY, 17) },
    ], at(TODAY, 8), at(TODAY, 19));
    expect(gaps.map(g => [localMinutes(g.start, LDN), g.minutes])).toEqual([[480, 60], [820, 20], [1020, 120]]);
  });
  test('the first gap that fits, after a given time', () => {
    const gaps = freeGaps([{ start: at(TODAY, 12), end: at(TODAY, 13) }], at(TODAY, 9), at(TODAY, 19));
    expect(localMinutes(gapFor(gaps, 20, at(TODAY, 12, 30))!.start, LDN)).toBe(13 * 60);
    expect(gapFor(gaps, 20, at(TODAY, 12, 30), true)).toMatchObject({ minutes: 360 });
    expect(gapFor([], 20, at(TODAY, 9))).toBeNull();
  });
  test('an event with its end before its start is ignored', () => {
    expect(freeGaps([{ start: at(TODAY, 12), end: at(TODAY, 11) }], at(TODAY, 9), at(TODAY, 10))).toHaveLength(1);
  });
});

describe('what can be a move today', () => {
  const input = (extra: Partial<CandidateInput> = {}): CandidateInput => {
    const loops = savePlan(emptyLoops(), TODAY, [rebate, call], at(TODAY, 7));
    return { now: at(TODAY, 9), timeZone: LDN, priorities: loops.plans[TODAY].items, loops, done: new Set(), aimArea: 'money', ...extra };
  };
  test('each priority on today’s plan offers its next step, marked as chosen', () => {
    const c = dayCandidates(input());
    expect(c.map(s => [s.candidate.id, s.candidate.kind, s.candidate.title, s.candidate.chosen])).toEqual([
      ['plan:uk-hmrc-tax-code-0', 'mission', 'Sign in to Government Gateway', true],
      ['plan:own:gran:call', 'people', 'Call Grandma Efua', true],
    ]);
    expect(c[0]).toMatchObject({ from: 'plan', priority: 'Claim my tax rebate', mission: 'uk-hmrc-tax-code', to: 'mission' });
    expect(c[0].candidate.aimFit).toBeGreaterThanOrEqual(0.5);
    expect(c[1].candidate.demanding).toBe(true);
  });
  test('a ticked step gives way to the next one', () => {
    const base = input();
    const loops = finishStep(base.loops!, rebate.steps[0], rebate, at(TODAY, 8));
    expect(dayCandidates({ ...base, loops }).map(s => s.candidate.title)[0]).toBe('Add £640 of software and kit');
  });
  test('missions in progress, dated things inside their lead time, and habits not done yet', () => {
    const c = dayCandidates(input({
      priorities: [], missions: [{ id: 'council-tax-band', title: 'Check your council tax band', minutes: 10 }, { id: 'uk-hmrc-tax-code', title: 'Claim your tax rebate', valueGBP: 128 }],
      dated: [
        { id: 'kofi', kind: 'people', title: 'Plan something for Kofi’s birthday', at: at('2026-11-22', 9), leadDays: 7 },
        { id: 'mot', kind: 'admin', title: 'Book the car’s MOT', at: at('2027-01-12', 9), leadDays: 30 },
      ],
      habits: [{ id: 'walk', name: 'Morning walk', done: false, minutes: 20 }, { id: 'read', name: 'Read', done: true }],
    }));
    expect(c.map(s => s.candidate.id)).toEqual(['mission:council-tax-band', 'mission:uk-hmrc-tax-code', 'dated:kofi', 'habit:walk']);
    expect(c.find(s => s.candidate.id === 'dated:kofi')!.candidate.dueAt).toBe(at('2026-11-22', 9));
    expect(c.find(s => s.candidate.id === 'mission:uk-hmrc-tax-code')!.candidate.valueGBP).toBe(128);
  });
  test('a mission already on today’s plan isn’t offered twice', () => {
    const c = dayCandidates(input({ missions: [{ id: 'uk-hmrc-tax-code', title: 'Claim your tax rebate' }] }));
    expect(c.filter(s => s.mission === 'uk-hmrc-tax-code')).toHaveLength(1);
  });
  test('nothing planned and nothing known: no moves, never made-up ones', () => {
    expect(dayCandidates({ now: at(TODAY, 9), timeZone: LDN })).toEqual([]);
  });
});

describe('what you chose comes first', () => {
  test('with nothing learned yet, a long step you chose still beats a habit you didn’t', () => {
    for (let seed = 0; seed < 50; seed++) {
      const plan = planToday([
        { id: 'call', kind: 'people', title: 'Call Grandma Efua', minutes: 20, demanding: true, chosen: true },
        { id: 'habit', kind: 'habit', title: 'In bed by 22:50' },
      ], { now: at(TODAY, 9), timeZone: LDN, learning: { state: {}, random: dayRandom(`day-${seed}`) } });
      expect(plan.next?.id).toBe('call');
    }
  });
  test('a step from your own plan beats a similar move you didn’t choose, and says why', () => {
    const plan = planToday([
      { id: 'a', kind: 'admin', title: 'Something life found', minutes: 5 },
      { id: 'b', kind: 'admin', title: 'Something you chose', minutes: 5, chosen: true },
    ], { now: at(TODAY, 9), timeZone: LDN });
    expect(plan.next?.id).toBe('b');
    expect(plan.next?.why).toContain('On your plan for today.');
  });
});

describe('nudges for the day', () => {
  const base = { now: at(TODAY, 8, 30), timeZone: LDN };
  test('today’s move goes in the first free stretch it fits, inside the nudge window', () => {
    const gaps = freeGaps([{ start: at(TODAY, 9), end: at(TODAY, 13, 40) }, { start: at(TODAY, 14), end: at(TODAY, 18) }], at(TODAY, 8, 30), at(TODAY, 19));
    const [move] = dayNudges({ ...base, next: { id: 'plan:x', title: 'Finish the P87', minutes: 15 }, gaps });
    expect(move).toMatchObject({ kind: 'move', title: 'Life', body: 'You’ve got 20 free minutes. Finish the P87 fits.', to: 'today' });
    expect(localMinutes(move.earliest, LDN)).toBe(13 * 60 + 40);
    expect(localMinutes(move.latest!, LDN)).toBe(NUDGE_WINDOW.end);
  });
  test('without a calendar, the move waits for early afternoon', () => {
    const [move] = dayNudges({ ...base, next: { id: 'plan:x', title: 'Call Grandma Efua' } });
    expect(move.body).toBe('Today’s move: Call Grandma Efua.');
    expect(localMinutes(move.earliest, LDN)).toBe(12 * 60 + 30);
  });
  test('a deadline under 24 hours outranks everything, and says when', () => {
    const n = dayNudges({ ...base, next: { id: 'm', title: 'Walk' }, deadlines: [{ id: 'insurance', title: 'Your car insurance', dueAt: at('2026-11-21', 12) }, { id: 'far', title: 'Far away', dueAt: at('2026-12-20', 12) }] });
    const d = n.find(x => x.kind === 'deadlines')!;
    expect(d).toMatchObject({ id: 'deadline-insurance', body: 'Your car insurance is due tomorrow at 12:00.' });
    expect(d.priority).toBeGreaterThan(n.find(x => x.kind === 'move')!.priority);
    expect(d.earliest).toBe(at(TODAY, 12));
    expect(d.latest).toBe(at('2026-11-21', 11, 30));
    expect(n.some(x => x.id === 'deadline-far')).toBe(false);
  });
  test('kinds you switched off never come', () => {
    const n = dayNudges({ ...base, off: new Set(['move', 'habit']), next: { id: 'm', title: 'Walk' }, habitsAtRisk: [{ id: 'walk', name: 'Morning walk' }], recallDue: 2 });
    expect(n.map(x => x.kind)).toEqual(['recall']);
  });
  test('habit rescue in the evening, recall at midday, the weekly recap on Sunday', () => {
    const sunday = { now: at('2026-11-22', 8), timeZone: LDN };
    const n = dayNudges({ ...sunday, habitsAtRisk: [{ id: 'walk', name: 'Morning walk' }], recallDue: 1 });
    expect(n.map(x => [x.kind, localMinutes(x.earliest, LDN)])).toEqual([['habit', 18 * 60], ['recall', 12 * 60], ['recap', 18 * 60]]);
    expect(n[0].body).toBe('One miss is normal. Morning walk today keeps it going.');
    expect(dayNudges({ ...base, recallDue: 0 }).some(x => x.kind === 'recall')).toBe(false);
    expect(dayNudges(base).some(x => x.kind === 'recap')).toBe(false);
  });
  test('the bedtime reminder is yours: requested, so it skips the cap', () => {
    const [b] = dayNudges({ ...base, bedtime: 23 * 60 });
    expect(b).toMatchObject({ kind: 'bedtime', requested: true, body: 'Bedtime in 45 minutes.' });
    expect(localMinutes(b.earliest, LDN)).toBe(22 * 60 + 15);
  });
  test('the evening planning question follows your check-in style', () => {
    const ctx = { now: at(TODAY, 8, 30), timeZone: LDN, plannedToday: true, plannedTomorrow: false, skippedToday: false, skippedTomorrow: false, unfinished: false, dueSoon: false };
    expect(dayNudges({ ...base, checkIn: { style: 'regular', ctx } }).map(x => [x.kind, x.body])).toEqual([['plan-tomorrow', 'What’s most important to you tomorrow?']]);
    expect(dayNudges({ ...base, checkIn: { style: 'off', ctx } })).toEqual([]);
  });
  test('nothing in a nudge is about your health or money figures', () => {
    const n = dayNudges({ ...base, next: { id: 'm', title: 'Walk' }, habitsAtRisk: [{ id: 'h', name: 'Stretch' }], recallDue: 1, bedtime: 23 * 60 });
    for (const x of n) expect(x.body).not.toMatch(/£|kcal|readiness|HRV|\bbpm\b/i);
  });
});

describe('from nudges to the phone’s schedule', () => {
  const now = at(TODAY, 8, 30);
  const rules = { timeZone: LDN };
  test('one nudge a day, but a deadline under a day still comes', () => {
    const n = dayNudges({ now, timeZone: LDN, next: { id: 'plan:x', title: 'Walk' }, habitsAtRisk: [{ id: 'walk', name: 'Morning walk' }], deadlines: [{ id: 'car', title: 'Your car insurance', dueAt: at(TODAY, 20) }] });
    const { planned } = planNudges(n, [], rules, now);
    const today = planned.filter(p => p.at < at('2026-11-21', 0)).map(p => p.nudge.kind);
    expect(today.sort()).toEqual(['deadlines', 'habit']);
  });
  test('what already went out today uses up the day; what is still to come is planned again', () => {
    const n = dayNudges({ now: at(TODAY, 15), timeZone: LDN, next: { id: 'plan:x', title: 'Walk' }, recallDue: 1 });
    const sent = [{ id: 'recall-2026-11-20', kind: 'recall', at: at(TODAY, 12) }, { id: 'old', kind: 'move', at: at(TODAY, 18) }];
    const { planned, log } = planNudges(n, sent, rules, at(TODAY, 15));
    expect(planned).toEqual([]);
    expect(log.map(e => e.id)).toEqual(['recall-2026-11-20']);
  });
  test('quiet hours you set are kept, and the bedtime reminder is yours', () => {
    const n = dayNudges({ now, timeZone: LDN, bedtime: 23 * 60, habitsAtRisk: [{ id: 'walk', name: 'Morning walk' }] });
    const { planned } = planNudges(n, [], { timeZone: LDN, quiet: { start: 17 * 60, end: 8 * 60 } }, now);
    expect(planned.map(p => [p.nudge.kind, localMinutes(p.at, LDN)])).toEqual([['bedtime', 22 * 60 + 15]]);
  });
  test('opening a move nudge is remembered, for fatigue', () => {
    const n = dayNudges({ now, timeZone: LDN, next: { id: 'plan:x', title: 'Walk' } });
    const { log } = planNudges(n, [], rules, now);
    const opened = markActed(log.map(e => ({ ...e, at: now - 1 })), 'move-2026-11-20');
    expect(recentMoveNudges(opened)).toEqual([{ id: 'plan:x', at: now - 1, acted: true }]);
  });
  test('the day’s random draws repeat within a day and differ between days', () => {
    const a = dayRandom('2026-11-20'), b = dayRandom('2026-11-20'), c = dayRandom('2026-11-21');
    const first = a();
    expect(b()).toBe(first);
    expect(c()).not.toBe(first);
  });
});

describe('background work', () => {
  test('health and sync every 15 minutes when they’re on, nudges each time', () => {
    const now = at(TODAY, 12);
    expect(dueJobs({}, now, { health: true, signedIn: true })).toEqual(['health', 'sync', 'nudges']);
    expect(dueJobs({ health: now - 5 * MIN, sync: now - 20 * MIN }, now, { health: true, signedIn: true })).toEqual(['sync', 'nudges']);
    expect(dueJobs({}, now, { health: false, signedIn: false })).toEqual(['nudges']);
    expect(JOB_EVERY.health).toBe(15 * MIN);
  });
});
