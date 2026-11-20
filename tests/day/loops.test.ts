import { describe, expect, test } from 'bun:test';
import {
  activeStep, addStep, carryOver, checkInNotifications, checkInPrompt, cleanPriorities, emptyLoops, finishStep, offerStep, planFor, planProgress, planTargetDay,
  savePlan, sizeStep, skipPlan, startStep, undoStep, weekProgress, type LoopsState, type Priority,
} from '../../packages/core/src/day/loops';
import { scheduleNotifications } from '../../packages/core/src/day/notifications';
import { instantAt } from '../../packages/core/src/time/zone';

const LDN = 'Europe/London';
const FRI = '2026-11-20', SAT = '2026-11-21';
const at = (day: string, hh: number, mm = 0) => instantAt(day, hh * 60 + mm, LDN);

/** The handoff's two synthetic priorities, plus a mission-backed one so the mechanism isn't tied to one kind. */
const paperwork: Priority = {
  id: 'paperwork', text: 'Get my paperwork ready', own: false, area: 'admin',
  steps: [
    { key: 'paperwork:gather', title: 'Gather two documents', minutes: 10, to: 'vault' },
    { key: 'paperwork:scan', title: 'Photograph them into life', minutes: 5, to: 'scan' },
    { key: 'paperwork:note', title: 'Note what’s still missing', minutes: 2 },
  ],
};
const edit: Priority = { id: 'edit', text: 'Protect time to edit', own: true, steps: [] };
const rebate: Priority = {
  id: 'rebate', text: 'Claim my tax rebate', own: false, area: 'money', mission: 'uk-hmrc-tax-code',
  steps: [
    { key: 'uk-hmrc-tax-code-0', title: 'Sign in to Government Gateway', minutes: 1, mission: 'uk-hmrc-tax-code' },
    { key: 'uk-hmrc-tax-code-1', title: 'Add your work expenses', minutes: 3, mission: 'uk-hmrc-tax-code' },
    { key: 'uk-hmrc-tax-code-2', title: 'Submit and save the reference', minutes: 2, mission: 'uk-hmrc-tax-code' },
  ],
};
const none = new Set<string>();
const planned = (items: Priority[], day = SAT, now = at(FRI, 22)): LoopsState => savePlan(emptyLoops(), day, items, now);

describe('plan ahead', () => {
  test('in the evening the question is about tomorrow, in the morning about today', () => {
    expect(planTargetDay(at(FRI, 21), LDN)).toEqual({ day: SAT, when: 'tomorrow' });
    expect(planTargetDay(at(FRI, 8), LDN)).toEqual({ day: FRI, when: 'today' });
    // Half past midnight is still Friday's life day (it starts at 04:00), so "tomorrow" is still Saturday.
    expect(planTargetDay(at(SAT, 0, 30), LDN)).toEqual({ day: SAT, when: 'tomorrow' });
    expect(planTargetDay(at(SAT, 4, 1), LDN)).toEqual({ day: SAT, when: 'today' });
  });

  test('several priorities, including your own words, keep your order', () => {
    const state = planned([paperwork, edit, rebate]);
    expect(planFor(state, SAT)?.items.map(p => p.text)).toEqual(['Get my paperwork ready', 'Protect time to edit', 'Claim my tax rebate']);
  });

  test('blank and repeated priorities are dropped, the first one kept', () => {
    const items = cleanPriorities([{ ...edit, text: '  Protect time to edit ' }, { ...edit, id: 'dup', text: 'protect time to EDIT' }, { ...edit, id: 'blank', text: '   ' }, paperwork]);
    expect(items.map(p => p.text)).toEqual(['Protect time to edit', 'Get my paperwork ready']);
  });

  test('a plan belongs to its day: tomorrow’s priorities don’t show today, and nothing rolls over by itself', () => {
    const state = planned([paperwork, edit]);
    expect(planFor(state, FRI)).toBeNull();
    expect(planFor(state, SAT)?.items).toHaveLength(2);
    expect(planFor(state, '2026-11-22')).toBeNull();
  });

  test('editing replaces the day’s list; saving nothing clears it', () => {
    let state = planned([paperwork, edit]);
    state = savePlan(state, SAT, [edit], at(SAT, 8));
    expect(planFor(state, SAT)?.items.map(p => p.id)).toEqual(['edit']);
    state = savePlan(state, SAT, [], at(SAT, 9));
    expect(planFor(state, SAT)).toBeNull();
  });

  test('skipping is remembered for that day only and planning later clears it', () => {
    let state = skipPlan(emptyLoops(), SAT, at(FRI, 22));
    expect(state.skipped[SAT]).toBeDefined();
    state = savePlan(state, SAT, [edit], at(SAT, 9));
    expect(state.skipped[SAT]).toBeUndefined();
  });

  test('a saved plan survives a round trip through JSON (what a relaunch does)', () => {
    const state = planned([paperwork, edit, rebate]);
    expect(JSON.parse(JSON.stringify(state))).toEqual(state);
  });
});

describe('get unstuck', () => {
  test('ten minutes offers “Gather two documents”, never the whole job', () => {
    const offer = offerStep({ priorities: [paperwork, edit], state: planned([paperwork, edit]), done: none, minutes: 10, time: { kind: 'manual' } });
    expect(offer.kind).toBe('step');
    if (offer.kind !== 'step') return;
    expect(offer.step.title).toBe('Gather two documents');
    expect(offer.index).toBe(0);
    expect(offer.total).toBe(3);
    expect(offer.why).toEqual(['“Get my paperwork ready” is first on your list.', 'About 10 minutes, and you said you have 10.']);
  });

  test('a calendar gap is named as the source of the time, and sample data says so', () => {
    const offer = offerStep({ priorities: [paperwork], state: planned([paperwork]), done: none, minutes: 20, time: { kind: 'calendar', at: '13:40', sample: true } });
    expect(offer.kind === 'step' && offer.why[1]).toBe('About 10 minutes, and the sample calendar shows 20 free from 13:40.');
  });

  test('two minutes skips steps that don’t fit and offers one that does from the next priority', () => {
    const offer = offerStep({ priorities: [paperwork, rebate], state: planned([paperwork, rebate]), done: none, minutes: 2, time: { kind: 'manual' } });
    expect(offer.kind === 'step' && offer.step.key).toBe('uk-hmrc-tax-code-0');
    expect(offer.kind === 'step' && offer.why[0]).toBe('“Claim my tax rebate” is second on your list.');
  });

  test('steps go in order: only a priority’s next unfinished step is offered', () => {
    const done = new Set(['uk-hmrc-tax-code-0']);
    const offer = offerStep({ priorities: [rebate], state: planned([rebate]), done, minutes: 5, time: { kind: 'manual' } });
    expect(offer.kind === 'step' && offer.step.key).toBe('uk-hmrc-tax-code-1');
  });

  test('when nothing fits it says so instead of inventing an action', () => {
    const offer = offerStep({ priorities: [paperwork], state: planned([paperwork]), done: none, minutes: 5, time: { kind: 'manual' } });
    expect(offer).toEqual({ kind: 'none', reason: 'too-big', smallest: 10, needsSteps: [], unsized: [] });
  });

  test('a priority in your own words with no steps asks for a first step', () => {
    const offer = offerStep({ priorities: [edit], state: planned([edit]), done: none, minutes: 20, time: { kind: 'manual' } });
    expect(offer).toEqual({ kind: 'none', reason: 'no-steps', needsSteps: [edit], unsized: [] });
  });

  test('nothing planned is its own answer, not an error', () => {
    expect(offerStep({ priorities: [], state: emptyLoops(), done: none, minutes: 10, time: { kind: 'manual' } })).toEqual({ kind: 'none', reason: 'nothing-planned', needsSteps: [], unsized: [] });
  });

  test('a step without a size is never squeezed into a slot; it is named so you can size it', () => {
    const council: Priority = { id: 'council', text: 'Check my council tax band', own: false, steps: [{ key: 'council-0', title: 'Find your band on the VOA site', to: 'mission' }] };
    const offer = offerStep({ priorities: [council], state: planned([council]), done: none, minutes: 20, time: { kind: 'manual' } });
    expect(offer.kind === 'none' && offer.unsized.map(u => u.step.key)).toEqual(['council-0']);
    const sized = sizeStep(planned([council]), SAT, 'council', 'council-0', 5);
    const again = offerStep({ priorities: planFor(sized, SAT)!.items, state: sized, done: none, minutes: 5, time: { kind: 'manual' } });
    expect(again.kind === 'step' && again.step.title).toBe('Find your band on the VOA site');
  });

  test('your own priority gets a first step in your words, then that step is offered', () => {
    let state = planned([edit]);
    state = addStep(state, SAT, 'edit', '  Block 30 minutes in my calendar ', 2, at(SAT, 9));
    state = addStep(state, SAT, 'edit', 'Edit for 20 minutes', 20, at(SAT, 9));
    const items = planFor(state, SAT)!.items;
    expect(items[0].steps.map(s => [s.key, s.title, s.minutes])).toEqual([['edit:1', 'Block 30 minutes in my calendar', 2], ['edit:2', 'Edit for 20 minutes', 20]]);
    const offer = offerStep({ priorities: items, state, done: none, minutes: 5, time: { kind: 'manual' } });
    expect(offer.kind === 'step' && offer.step.key).toBe('edit:1');
  });

  test('“Something else” moves past a step without losing the priority', () => {
    const offer = offerStep({ priorities: [paperwork, rebate], state: planned([paperwork, rebate]), done: none, minutes: 10, time: { kind: 'manual' }, skip: ['paperwork:gather'] });
    expect(offer.kind === 'step' && offer.step.key).toBe('uk-hmrc-tax-code-0');
  });

  test('a step you started comes back first', () => {
    let state = planned([paperwork, rebate]);
    state = startStep(state, rebate.steps[0], rebate, at(SAT, 9));
    const offer = offerStep({ priorities: [paperwork, rebate], state, done: none, minutes: 10, time: { kind: 'manual' } });
    expect(offer.kind === 'step' && offer.step.key).toBe('uk-hmrc-tax-code-0');
    expect(offer.kind === 'step' && offer.resumed).toBe(true);
  });
});

describe('resume and record', () => {
  test('started, done and undone are distinct, and a step you leave is still there after a relaunch', () => {
    let state = planned([paperwork]);
    state = startStep(state, paperwork.steps[0], paperwork, at(SAT, 9));
    const relaunched: LoopsState = JSON.parse(JSON.stringify(state));
    expect(activeStep(relaunched, none)?.key).toBe('paperwork:gather');
    expect(relaunched.marks['paperwork:gather'].state).toBe('started');
    state = finishStep(relaunched, paperwork.steps[0], paperwork, at(SAT, 9, 12));
    expect(state.marks['paperwork:gather'].state).toBe('done');
    expect(activeStep(state, none)).toBeNull();
    state = undoStep(state, 'paperwork:gather');
    expect(state.marks['paperwork:gather']).toBeUndefined();
  });

  test('repeated taps don’t duplicate progress or move the time', () => {
    let state = planned([paperwork]);
    state = startStep(state, paperwork.steps[0], paperwork, at(SAT, 9));
    state = startStep(state, paperwork.steps[0], paperwork, at(SAT, 9, 5));
    expect(state.marks['paperwork:gather'].at).toBe(new Date(at(SAT, 9)).toISOString());
    state = finishStep(state, paperwork.steps[0], paperwork, at(SAT, 9, 10));
    const once = state;
    state = finishStep(state, paperwork.steps[0], paperwork, at(SAT, 9, 20));
    state = startStep(state, paperwork.steps[0], paperwork, at(SAT, 9, 30));
    expect(state).toEqual(once);
    expect(weekProgress(state, at(SAT, 12), LDN, none).steps).toHaveLength(1);
  });

  test('a mission step ticked on its own screen counts as done, so it isn’t offered or resumed again', () => {
    let state = planned([rebate]);
    state = startStep(state, rebate.steps[0], rebate, at(SAT, 9));
    const done = new Set(['uk-hmrc-tax-code-0']);
    expect(activeStep(state, done)).toBeNull();
    const offer = offerStep({ priorities: [rebate], state, done, minutes: 10, time: { kind: 'manual' } });
    expect(offer.kind === 'step' && offer.step.key).toBe('uk-hmrc-tax-code-1');
  });
});

describe('see what’s changing', () => {
  test('partial work shows as partial, from explicit ticks only', () => {
    let state = planned([paperwork, edit]);
    state = finishStep(state, paperwork.steps[0], paperwork, at(SAT, 9));
    state = startStep(state, paperwork.steps[1], paperwork, at(SAT, 10));
    const rows = planProgress(planFor(state, SAT)!, state, none);
    expect(rows[0]).toMatchObject({ text: 'Get my paperwork ready', done: 1, total: 3, started: true, complete: false });
    expect(rows[1]).toMatchObject({ text: 'Protect time to edit', done: 0, total: 0, started: false, complete: false });
  });

  test('yesterday’s unfinished priorities are offered for today with their progress, never added by themselves', () => {
    let state = savePlan(emptyLoops(), FRI, [paperwork, rebate, edit], at(FRI, 8));
    state = finishStep(state, paperwork.steps[0], paperwork, at(FRI, 9));
    for (const s of rebate.steps) state = finishStep(state, s, rebate, at(FRI, 10));
    expect(planFor(state, SAT)).toBeNull();
    const offered = carryOver(state, SAT, none);
    expect(offered.map(p => p.id)).toEqual(['paperwork', 'edit']);
    state = savePlan(state, SAT, [offered[0]], at(FRI, 21));
    expect(planProgress(planFor(state, SAT)!, state, none)[0]).toMatchObject({ done: 1, total: 3 });
    expect(carryOver(state, SAT, none).map(p => p.id)).toEqual(['edit']);
  });

  test('the week counts steps done in the last seven days, newest first, and keeps what each was for', () => {
    let state = planned([paperwork, rebate]);
    state = finishStep(state, paperwork.steps[0], paperwork, at(SAT, 9));
    state = finishStep(state, rebate.steps[0], rebate, at(SAT, 11));
    state = finishStep(state, paperwork.steps[1], paperwork, at('2026-11-10', 9)); // too long ago
    const week = weekProgress(state, at(SAT, 12), LDN, none);
    expect(week.steps.map(s => s.title)).toEqual(['Sign in to Government Gateway', 'Gather two documents']);
    expect(week.steps[0].priority).toBe('Claim my tax rebate');
    expect(week.priorities).toEqual(['Claim my tax rebate', 'Get my paperwork ready']);
  });

  test('what counts as a win is the person’s choice; with none chosen, every step counts', () => {
    let state = planned([paperwork, rebate]);
    state = finishStep(state, paperwork.steps[0], paperwork, at(SAT, 9));
    state = finishStep(state, rebate.steps[0], rebate, at(SAT, 11));
    expect(weekProgress(state, at(SAT, 12), LDN, none).wins).toHaveLength(2);
    state = { ...state, wins: ['admin'] };
    expect(weekProgress(state, at(SAT, 12), LDN, none).wins.map(s => s.title)).toEqual(['Gather two documents']);
  });
});

describe('check-ins', () => {
  const base = { timeZone: LDN, plannedToday: false, plannedTomorrow: false, skippedToday: false, skippedTomorrow: false, unfinished: false, dueSoon: false };

  test('regular asks about tomorrow in the evening and about today in the morning', () => {
    expect(checkInPrompt('regular', { ...base, now: at(FRI, 20) })).toBe('plan-tomorrow');
    expect(checkInPrompt('regular', { ...base, now: at(FRI, 8) })).toBe('plan-today');
    expect(checkInPrompt('regular', { ...base, now: at(FRI, 14) })).toBeNull();
  });

  test('no prompt once you’ve planned or said not tonight', () => {
    expect(checkInPrompt('regular', { ...base, now: at(FRI, 20), plannedTomorrow: true })).toBeNull();
    expect(checkInPrompt('regular', { ...base, now: at(FRI, 20), skippedTomorrow: true })).toBeNull();
  });

  test('“when life notices something” asks only with a reason', () => {
    expect(checkInPrompt('noticed', { ...base, now: at(FRI, 20) })).toBeNull();
    expect(checkInPrompt('noticed', { ...base, now: at(FRI, 20), unfinished: true })).toBe('plan-tomorrow');
    expect(checkInPrompt('noticed', { ...base, now: at(FRI, 8), dueSoon: true })).toBe('plan-today');
  });

  test('off never prompts', () => {
    for (const now of [at(FRI, 8), at(FRI, 20)]) expect(checkInPrompt('off', { ...base, now, unfinished: true, dueSoon: true })).toBeNull();
  });

  test('check-in notifications follow the style and still respect one a day and quiet hours', () => {
    const ctx = { ...base, now: at(FRI, 9) };
    expect(checkInNotifications('off', ctx)).toEqual([]);
    expect(checkInNotifications('noticed', ctx)).toEqual([]);
    const regular = checkInNotifications('regular', ctx);
    expect(regular.map(c => c.kind)).toEqual(['plan-tomorrow']);
    const { scheduled } = scheduleNotifications([...regular, { id: 'deadline', kind: 'deadline', priority: 9, earliest: at(FRI, 10) }], [], { timeZone: LDN }, { now: ctx.now, horizonDays: 0 });
    expect(scheduled.map(s => s.id)).toEqual(['deadline']); // the evening question gives way to a real deadline
    const noticed = checkInNotifications('noticed', { ...ctx, unfinished: true });
    expect(noticed.map(c => c.kind)).toEqual(['pick-up']);
  });
});
