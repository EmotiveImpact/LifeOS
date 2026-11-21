import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { dayCandidates, dayNudges, instantAt, lockScreenSafe } from '../../packages/core/src';

/**
 * Fix F-28 (DPIA risk 10). A nudge can show on a locked screen, where anyone nearby can read it. Every template is
 * checked here with names that carry money or health details: those names are left out, and the nudge still says
 * what it's for. Names from everywhere else still show, so the nudge stays useful.
 */
const LDN = 'Europe/London';
const TODAY = '2026-11-20';
const at = (day: string, h: number, m = 0) => instantAt(day, h * 60 + m, LDN);
const base = { now: at(TODAY, 8, 30), timeZone: LDN };
const root = join(import.meta.dir, '../..');

const sensitive = [
  'Claim your £840 refund', 'Finish the P87', 'Check your tax code', 'Call HMRC about the rebate', 'Pay off the credit card',
  'Chase the cardiology referral', 'Book a GP appointment', 'Collect the prescription', 'Blood test at 9', 'Therapy session',
  'Log your weight', 'Take vitamins', 'Pay 15% more into savings', 'Move $200 to the bank',
];
const safe = ['Call Grandma Efua', 'Morning walk', 'Clear the spare room', 'Water before coffee', '10 minutes of daylight', 'Your car insurance', 'Birthday card for Kofi'];

describe('what shows on a locked screen', () => {
  test('money figures, tax forms, money trouble and health words are caught', () => {
    for (const t of sensitive) expect({ t, safe: lockScreenSafe(t) }).toEqual({ t, safe: false });
    for (const t of safe) expect({ t, safe: lockScreenSafe(t) }).toEqual({ t, safe: true });
  });

  test('a move with a sensitive name says the same thing without it, with or without a calendar', () => {
    const gaps = [{ start: at(TODAY, 13, 40), end: at(TODAY, 14) }];
    for (const title of sensitive) {
      const [withGap] = dayNudges({ ...base, next: { id: 'm', title, minutes: 15 }, gaps });
      const [without] = dayNudges({ ...base, next: { id: 'm', title } });
      expect(withGap.body).toBe('You’ve got 20 free minutes. Your next move fits.');
      expect(without.body).toBe('Today’s move is ready when you are.');
    }
  });

  test('a move from money or health keeps its name off, even when the words look harmless', () => {
    const [move] = dayNudges({ ...base, next: { id: 'm', title: 'Sort the paperwork', private: true } });
    expect(move.body).toBe('Today’s move is ready when you are.');
    const [shown] = dayNudges({ ...base, next: { id: 'm', title: 'Sort the paperwork' } });
    expect(shown.body).toBe('Today’s move: Sort the paperwork.');
  });

  test('deadlines and habits do the same', () => {
    const due = at('2026-11-21', 12);
    const [deadline] = dayNudges({ ...base, deadlines: [{ id: 'd', title: 'Your council tax payment', dueAt: due }] }).filter(n => n.kind === 'deadlines');
    expect(deadline.body).toBe('Something is due tomorrow at 12:00.');
    const [privateDeadline] = dayNudges({ ...base, deadlines: [{ id: 'd', title: 'The form', dueAt: due, private: true }] }).filter(n => n.kind === 'deadlines');
    expect(privateDeadline.body).toBe('Something is due tomorrow at 12:00.');
    const habit = (name: string, isPrivate?: boolean) => dayNudges({ ...base, habitsAtRisk: [{ id: 'h', name, private: isPrivate }] }).find(n => n.kind === 'habit')!.body;
    expect(habit('Take your tablets')).toBe('One miss is normal. Today keeps your habit going.');
    expect(habit('Evening stretch', true)).toBe('One miss is normal. Today keeps your habit going.');
    expect(habit('Morning walk')).toBe('One miss is normal. Morning walk today keeps it going.');
  });

  test('every nudge the day can send passes, whatever names it was given', () => {
    const sunday = { now: at('2026-11-22', 8), timeZone: LDN };
    for (const title of sensitive) {
      const all = dayNudges({
        ...sunday, next: { id: 'm', title }, deadlines: [{ id: 'd', title, dueAt: at('2026-11-22', 20) }], habitsAtRisk: [{ id: 'h', name: title }],
        recallDue: 2, bedtime: 22 * 60 + 30, checkIn: { style: 'regular', ctx: { now: sunday.now, timeZone: LDN, plannedToday: false, plannedTomorrow: false, skippedToday: false, skippedTomorrow: false, unfinished: true, dueSoon: false } },
      });
      expect(all.length).toBeGreaterThan(4);
      for (const n of all) {
        expect({ title, body: n.body, safe: lockScreenSafe(n.body) }).toEqual({ title, body: n.body, safe: true });
        expect(n.title).toBe('Life');
      }
    }
  });

  test('missions and plan steps carry their area, so the phone can keep money and health private', () => {
    const sources = dayCandidates({
      ...base,
      priorities: [{ id: 'p', text: 'Get on top of money', own: true, area: 'money', steps: [{ key: 'p:1', title: 'Sort the paperwork' }] }],
      missions: [{ id: 'nhs-referral', title: 'Chase the referral', area: 'body' }],
    });
    expect(sources.map(s => [s.candidate.id, s.area])).toEqual([['plan:p:1', 'money'], ['mission:nhs-referral', 'body']]);
    expect(readFileSync(join(root, 'apps/mobile/src/state/dayplan.ts'), 'utf8')).toContain("private: privateMove(built.sources[next.id])");
  });

  test('on Android, a secure lock screen shows that Life sent something, not what it says', () => {
    expect(readFileSync(join(root, 'apps/mobile/src/services/notifications.native.ts'), 'utf8')).toContain('lockscreenVisibility: Notifications.AndroidNotificationVisibility.PRIVATE');
  });
});
