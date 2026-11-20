import { describe, expect, test } from 'bun:test';
import { bedtimeReminder, mayAskAgain, scheduleNotifications, type NotificationCandidate } from '../../packages/core/src/day/notifications';
import { instantAt, localMinutes } from '../../packages/core/src/time/zone';

const LDN = 'Europe/London';
const TODAY = '2026-11-20';
const at = (date: string, hh: number, mm = 0, tz = LDN) => instantAt(date, hh * 60 + mm, tz);
const nudge = (id: string, priority: number, earliest: number, latest?: number): NotificationCandidate => ({ id, kind: id, priority, earliest, latest });
const rules = { timeZone: LDN };

describe('one a day at most', () => {
  test('the most important nudge gets today; the next waits for tomorrow morning', () => {
    const { scheduled } = scheduleNotifications([nudge('birthday', 2, at(TODAY, 10)), nudge('renewal', 5, at(TODAY, 12))], [], rules, { now: at(TODAY, 9) });
    expect(scheduled.map(s => [s.id, s.date, localMinutes(s.at, LDN)])).toEqual([['renewal', '2026-11-20', 720], ['birthday', '2026-11-21', 480]]);
  });
  test('a nudge already sent today uses up the day', () => {
    const { scheduled } = scheduleNotifications([nudge('recall', 1, at(TODAY, 15))], [{ id: 'morning-plan', at: at(TODAY, 8, 30) }], rules, { now: at(TODAY, 14) });
    expect(scheduled[0].date).toBe('2026-11-21');
  });
  test('a nudge that would arrive too late to help is dropped, not sent late', () => {
    const { scheduled, dropped } = scheduleNotifications(
      [nudge('wrap', 5, at(TODAY, 18)), nudge('fuel', 3, at(TODAY, 15), at(TODAY, 18, 30))], [], rules, { now: at(TODAY, 14) });
    expect(scheduled.map(s => s.id)).toEqual(['wrap']);
    expect(dropped).toEqual([{ id: 'fuel', reason: 'past-latest' }]);
  });
  test('nothing beyond the horizon', () => {
    const many = Array.from({ length: 5 }, (_, i) => nudge(`n${i}`, 1, at(TODAY, 10)));
    const { scheduled, dropped } = scheduleNotifications(many, [], rules, { now: at(TODAY, 9), horizonDays: 2 });
    expect(scheduled).toHaveLength(3);
    expect(dropped.map(d => d.reason)).toEqual(['no-room', 'no-room']);
  });
});

describe('quiet hours, 21:00 to 08:00', () => {
  test('a nudge due at 22:00 waits until 08:00', () => {
    const { scheduled } = scheduleNotifications([nudge('recall', 1, at(TODAY, 22))], [], rules, { now: at(TODAY, 21, 30) });
    expect([scheduled[0].date, localMinutes(scheduled[0].at, LDN)]).toEqual(['2026-11-21', 480]);
  });
  test('08:00 stays 08:00 across the clocks going back', () => {
    const { scheduled } = scheduleNotifications([nudge('recall', 1, at('2026-10-24', 23))], [], rules, { now: at('2026-10-24', 22) });
    expect(scheduled[0].at).toBe(Date.UTC(2026, 9, 25, 8, 0));
  });
  test('the cap follows the zone you are in when travelling', () => {
    const ny = { timeZone: 'America/New_York' };
    const sentInLondon = [{ id: 'plan', at: at(TODAY, 9) }]; // 04:00 in New York, still 20 Nov there
    const { scheduled } = scheduleNotifications([nudge('recall', 1, at(TODAY, 15, 0, 'America/New_York'))], sentInLondon, ny, { now: at(TODAY, 14, 0, 'America/New_York') });
    expect(scheduled[0].date).toBe('2026-11-21');
    expect(localMinutes(scheduled[0].at, 'America/New_York')).toBe(480);
  });
});

describe('reminders you asked for', () => {
  test('the bedtime reminder goes 45 minutes before bed, in quiet hours, without using the day', () => {
    const reminder = bedtimeReminder(22 * 60 + 50, TODAY, LDN);
    const { scheduled } = scheduleNotifications([reminder, nudge('recall', 1, at(TODAY, 12))], [], rules, { now: at(TODAY, 9) });
    expect(scheduled.map(s => [s.id, localMinutes(s.at, LDN), s.requested])).toEqual([['recall', 720, false], ['bedtime-2026-11-20', 22 * 60 + 5, true]]);
  });
  test('a bedtime after midnight is tonight, not this morning', () => {
    expect(bedtimeReminder(30, TODAY, LDN).earliest).toBe(at('2026-11-20', 23, 45));
  });
  test('a declined permission is asked about again at most once a month', () => {
    const now = at(TODAY, 9);
    expect(mayAskAgain(null, now)).toBe(true);
    expect(mayAskAgain(now - 10 * 86_400_000, now)).toBe(false);
    expect(mayAskAgain(now - 30 * 86_400_000, now)).toBe(true);
  });
});
