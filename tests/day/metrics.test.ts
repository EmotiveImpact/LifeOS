import { describe, expect, test } from 'bun:test';
import { MOVES_CAP, REPORT_WEEKS, dueReports, finishedMoves, noteMoves, readMovesLog, weekKey } from '../../packages/core/src/day/metrics';

const TZ = 'Europe/London';
const at = (iso: string) => Date.parse(iso);

describe('the week a move counts in', () => {
  test('ISO weeks, Monday first, in your own time zone', () => {
    expect(weekKey(at('2026-11-16T10:00:00Z'), TZ)).toBe('2026-W47'); // Monday
    expect(weekKey(at('2026-11-22T20:00:00Z'), TZ)).toBe('2026-W47'); // Sunday evening
    expect(weekKey(at('2027-01-01T12:00:00Z'), TZ)).toBe('2026-W53'); // a Friday that belongs to the last week of 2026
    expect(weekKey(at('2026-11-16T12:00:00Z'), 'Pacific/Auckland')).toBe('2026-W47');
  });
  test('the day starts at 04:00, so a move at 02:00 on Monday still counts in the week before', () => {
    expect(weekKey(at('2026-11-23T02:00:00Z'), TZ)).toBe('2026-W47');
    expect(weekKey(at('2026-11-23T05:00:00Z'), TZ)).toBe('2026-W48');
  });
});

describe('what counts as a finished move', () => {
  const before = { missionSteps: { 'a-0': true, 'a-1': false }, loops: { marks: { s1: { state: 'started' }, s2: { state: 'done' } } }, habits: [{ id: 'walk', last14: [true, false] }, { id: 'water', last14: [true, true] }] };
  test('a step ticked, a planned step marked done, a habit done today', () => {
    const after = { missionSteps: { 'a-0': true, 'a-1': true, 'b-0': true }, loops: { marks: { s1: { state: 'done' }, s2: { state: 'done' } } }, habits: [{ id: 'walk', last14: [false, true] }, { id: 'water', last14: [true, true] }] };
    expect(finishedMoves(before, after)).toBe(4);
  });
  test('unticking takes nothing back and nothing new counts nothing', () => {
    expect(finishedMoves(before, before)).toBe(0);
    expect(finishedMoves(before, { ...before, missionSteps: { 'a-0': false } })).toBe(0);
    expect(finishedMoves(undefined, before)).toBe(0);
  });
});

describe('the weekly count Life may share', () => {
  const monday = at('2026-11-30T09:00:00Z');
  test('counts by week, marks weeks the app was open, and caps a week', () => {
    let log = noteMoves(readMovesLog(undefined), at('2026-11-17T09:00:00Z'), TZ, 3);
    log = noteMoves(log, at('2026-11-18T09:00:00Z'), TZ, 2);
    log = noteMoves(log, at('2026-11-25T09:00:00Z'), TZ, 0);
    log = noteMoves(log, at('2026-11-26T09:00:00Z'), TZ, 500);
    expect(log.weeks).toEqual({ '2026-W47': 5, '2026-W48': MOVES_CAP });
    expect(readMovesLog(JSON.stringify(log))).toEqual(log);
    expect(readMovesLog('not json')).toEqual({ weeks: {}, sent: [] });
  });
  test('only finished weeks, each once, never more than a few weeks back', () => {
    let log = noteMoves(readMovesLog(undefined), at('2026-11-01T09:00:00Z'), TZ, 4); // W44, too old by the 30th
    log = noteMoves(log, at('2026-11-17T09:00:00Z'), TZ, 5);
    log = noteMoves(log, at('2026-11-25T09:00:00Z'), TZ, 0); // opened, nothing finished
    log = noteMoves(log, at('2026-11-30T08:00:00Z'), TZ, 2); // this week: not finished yet
    expect(REPORT_WEEKS).toBe(4);
    expect(dueReports(log, monday, TZ)).toEqual([{ week: '2026-W47', moves: 5 }, { week: '2026-W48', moves: 0 }]);
    expect(dueReports({ ...log, sent: ['2026-W47'] }, monday, TZ)).toEqual([{ week: '2026-W48', moves: 0 }]);
  });
  test('the log keeps only recent weeks, so it never grows', () => {
    let log = readMovesLog(undefined);
    for (let w = 0; w < 30; w++) log = noteMoves(log, at('2026-01-05T09:00:00Z') + w * 7 * 86400000, TZ, 1);
    log = { ...log, sent: Object.keys(log.weeks) };
    const next = noteMoves(log, at('2026-08-03T09:00:00Z'), TZ, 1);
    expect(Object.keys(next.weeks).length).toBeLessThanOrEqual(REPORT_WEEKS + 2);
    expect(next.sent.length).toBeLessThanOrEqual(REPORT_WEEKS + 2);
  });
});
