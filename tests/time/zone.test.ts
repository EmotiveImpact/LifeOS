import { describe, expect, test } from 'bun:test';
import {
  addDays, dayLengthMinutes, daysBetween, instantAt, isTravelShift, isValidTimeZone, lifeDay, localDate, localMinutes,
  localParts, nextOutsideQuiet, offsetMinutes, inQuietHours, resolveTimeZone, sleepDay, weekdayOf,
} from '../../packages/core/src/time/zone';

const LDN = 'Europe/London';
const utc = (y: number, mo: number, d: number, h = 0, mi = 0) => Date.UTC(y, mo - 1, d, h, mi);

describe('local dates in a named time zone', () => {
  test('London is on GMT in winter and BST in summer', () => {
    expect(offsetMinutes(utc(2026, 1, 15, 12), LDN)).toBe(0);
    expect(offsetMinutes(utc(2026, 7, 15, 12), LDN)).toBe(60);
  });
  test('offsets east and west of Greenwich, including half and three-quarter hours', () => {
    expect(offsetMinutes(utc(2026, 1, 15, 12), 'America/New_York')).toBe(-300);
    expect(offsetMinutes(utc(2026, 7, 15, 12), 'America/New_York')).toBe(-240);
    expect(offsetMinutes(utc(2026, 1, 15, 12), 'Asia/Kolkata')).toBe(330);
    expect(offsetMinutes(utc(2026, 1, 15, 12), 'Pacific/Chatham')).toBe(825);
  });
  test('the local date changes at local midnight, not at UTC midnight', () => {
    expect(localDate(utc(2026, 7, 14, 23, 30), LDN)).toBe('2026-07-15');
    expect(localDate(utc(2026, 7, 15, 3, 0), 'America/New_York')).toBe('2026-07-14');
  });
  test('local parts give the clock time and a Monday-first weekday', () => {
    const p = localParts(utc(2026, 11, 20, 9, 5), LDN);
    expect([p.date, p.hour, p.minute, p.weekday]).toEqual(['2026-11-20', 9, 5, 4]);
    expect(localMinutes(utc(2026, 11, 20, 9, 5), LDN)).toBe(545);
  });
  test('an unknown zone falls back to UTC rather than crashing', () => {
    expect(isValidTimeZone('Mars/Olympus')).toBe(false);
    expect(resolveTimeZone('Mars/Olympus')).toBe('UTC');
    expect(resolveTimeZone(LDN)).toBe(LDN);
  });
});

describe('wall-clock times to instants', () => {
  test('an ordinary summer morning', () => expect(instantAt('2026-07-01', 8 * 60, LDN)).toBe(utc(2026, 7, 1, 7)));
  test('a time skipped when the clocks go forward moves forward by the gap', () => {
    expect(instantAt('2026-03-29', 90, LDN)).toBe(utc(2026, 3, 29, 1, 30)); // 01:30 never happens; 02:30 BST does
    expect(instantAt('2026-03-29', 150, 'Europe/Berlin')).toBe(utc(2026, 3, 29, 1, 30)); // 02:30 → 03:30 CEST
  });
  test('a time that happens twice when the clocks go back takes the first one', () => {
    expect(instantAt('2026-10-25', 90, LDN)).toBe(utc(2026, 10, 25, 0, 30));
  });
  test('days are 23 and 25 hours long when the clocks change', () => {
    expect(dayLengthMinutes('2026-03-29', LDN)).toBe(1380);
    expect(dayLengthMinutes('2026-10-25', LDN)).toBe(1500);
    expect(dayLengthMinutes('2026-11-20', LDN)).toBe(1440);
  });
  test('round trip for every quarter hour of a clock-change day', () => {
    for (let m = 0; m < 1440; m += 15) {
      if (m >= 60 && m < 120) continue; // 01:00–01:59 is skipped on 29 March
      expect(localMinutes(instantAt('2026-03-29', m, LDN), LDN)).toBe(m);
    }
  });
});

describe('which day something belongs to', () => {
  test('a life day runs from 04:00 to 04:00, so a 01:30 snack counts for the evening before', () => {
    expect(lifeDay(utc(2026, 11, 20, 1, 30), LDN)).toBe('2026-11-19');
    expect(lifeDay(utc(2026, 11, 20, 4, 0), LDN)).toBe('2026-11-20');
  });
  test('sleep belongs to the day you wake up on', () => {
    expect(sleepDay(utc(2026, 11, 20, 6, 45), LDN)).toBe('2026-11-20');
  });
  test('a night across the clocks going back lasts nine real hours for an 11pm to 7am night', () => {
    const bed = instantAt('2026-10-24', 23 * 60, LDN);
    const wake = instantAt('2026-10-25', 7 * 60, LDN);
    expect((wake - bed) / 60_000).toBe(540);
    expect(sleepDay(wake, LDN)).toBe('2026-10-25');
  });
  test('a flight to New York counts as a travel shift; a clock change does not', () => {
    expect(isTravelShift(60, -240)).toBe(true);
    expect(isTravelShift(60, 0)).toBe(false);
  });
});

describe('calendar arithmetic on date keys', () => {
  test('adds days across months, years and leap days', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
  test('counts whole days between dates, ignoring clock changes', () => {
    expect(daysBetween('2026-03-28', '2026-03-30')).toBe(2);
    expect(daysBetween('2026-11-20', '2026-11-13')).toBe(-7);
  });
  test('weekday is Monday first', () => {
    expect(weekdayOf('2026-11-16')).toBe(0);
    expect(weekdayOf('2026-11-22')).toBe(6);
  });
});

describe('quiet hours, 21:00 to 08:00', () => {
  test('evening and early morning are quiet; 08:00 and 20:59 are not', () => {
    expect(inQuietHours(instantAt('2026-11-20', 21 * 60 + 30, LDN), LDN)).toBe(true);
    expect(inQuietHours(instantAt('2026-11-20', 7 * 60 + 59, LDN), LDN)).toBe(true);
    expect(inQuietHours(instantAt('2026-11-20', 8 * 60, LDN), LDN)).toBe(false);
    expect(inQuietHours(instantAt('2026-11-20', 20 * 60 + 59, LDN), LDN)).toBe(false);
  });
  test('a nudge due in quiet hours waits until 08:00 local', () => {
    const at = nextOutsideQuiet(instantAt('2026-11-20', 21 * 60 + 30, LDN), LDN);
    expect(at).toBe(instantAt('2026-11-21', 8 * 60, LDN));
    expect(nextOutsideQuiet(instantAt('2026-11-21', 6 * 60, LDN), LDN)).toBe(instantAt('2026-11-21', 8 * 60, LDN));
  });
  test('the wait lands on 08:00 even across the clocks going back', () => {
    const at = nextOutsideQuiet(instantAt('2026-10-24', 22 * 60, LDN), LDN);
    expect(at).toBe(utc(2026, 10, 25, 8, 0));
    expect(localMinutes(at, LDN)).toBe(480);
  });
  test('a daytime quiet window that does not cross midnight also works', () => {
    const quiet = { start: 13 * 60, end: 14 * 60 };
    expect(inQuietHours(instantAt('2026-11-20', 13 * 60 + 30, LDN), LDN, quiet)).toBe(true);
    expect(nextOutsideQuiet(instantAt('2026-11-20', 13 * 60 + 30, LDN), LDN, quiet)).toBe(instantAt('2026-11-20', 14 * 60, LDN));
  });
});
