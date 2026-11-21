import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { extractStatements } from '../../packages/brain/src/index.ts';
import { proposalRecord } from '../../apps/mobile/src/services/brainState.ts';
import { knownArea, upcoming } from '../../apps/mobile/src/state/areaKnown.ts';
import type { FiledRecord } from '../../apps/mobile/src/state/seed.ts';

/**
 * Fix F-38: Home, Work and Health on a real account show what the person has told Life about each, with the dated
 * things still ahead, instead of day one forever. Nothing from the sample life, and nothing guessed.
 */
const told = (text: string, at = '2026-11-21T08:00:00Z'): FiledRecord[] => extractStatements(text).map(p => ({ ...proposalRecord(p, 'talk', at), status: 'confirmed' as const }));
const today = '2026-11-21';

describe('records keep their dates', () => {
  test('appointments and documents keep what was said', () => {
    expect(told('I have a dentist appointment on 4 December at 3pm.')[0].details).toEqual({ kind: 'appointment', what: 'Dentist', when: { day: 4, month: 12, time: '15:00' } });
    expect(told('My MOT expires in May 2027.')[0].details).toEqual({ kind: 'document', document: 'mot', event: 'expires', when: { month: 5, year: 2027 } });
  });
});

describe('Home, Work and Health from what you told Life', () => {
  const life = [
    ...told('I live alone.'), ...told('My boiler service is due on 12 January.'), ...told('My MOT expires in May 2027.'), ...told('My home insurance renews on 3 March.'),
    ...told("I'm self-employed."), ...told('I have a job interview on 2 December.'),
    ...told('I have a dentist appointment on 4 December at 3pm.'), ...told('I have a GP appointment on 1 November.', '2026-10-20T09:00:00Z'),
    ...told('My rent is £900 a month.'),
  ];

  test('Home leads with how you live, then what’s coming up, soonest first', () => {
    const k = knownArea({ records: life, area: 'home', today });
    expect(k.lead).toBe('Lives alone');
    expect(k.facts.map(r => r.label)).toEqual(['Lives alone', 'Boiler service due 12 January', 'MOT expires May 2027', 'Home insurance renews 3 March']);
    expect(k.next).toEqual([
      { id: k.facts[1].id, title: 'Boiler service due', when: '12 January', inDays: 52 },
      { id: k.facts[3].id, title: 'Home insurance renews', when: '3 March', inDays: 102 },
      { id: k.facts[2].id, title: 'MOT expires', when: 'May 2027', inDays: null },
    ]);
  });

  test('Work leads with how you work', () => {
    const k = knownArea({ records: life, area: 'work', today });
    expect(k.lead).toBe('Self-employed');
    expect(k.next.map(c => [c.title, c.when, c.inDays])).toEqual([['Interview', '2 December', 11]]);
  });

  test('Health shows what’s due; an appointment that has passed drops off', () => {
    const k = knownArea({ records: life, area: 'health', today });
    expect(k.lead).toBeNull();
    expect(k.facts.map(r => r.label)).toEqual(['Dentist, 4 December at 3pm', 'GP, 1 November']);
    expect(k.next.map(c => [c.title, c.when, c.inDays])).toEqual([['Dentist', '4 December at 3pm', 13]]);
  });

  test('rent stays in Money; proposed and removed records aren’t known', () => {
    expect(knownArea({ records: life, area: 'home', today }).facts.some(r => r.id === 'rent')).toBe(false);
    const proposed = extractStatements('I live alone.').map(p => proposalRecord(p, 'talk'));
    expect(knownArea({ records: proposed, area: 'home', today }).facts).toEqual([]);
    expect(knownArea({ records: proposed.map(r => ({ ...r, status: 'removed' as const })), area: 'home', today }).facts).toEqual([]);
  });
});

describe('when a date said in Talk falls', () => {
  test('a day and month without a year is the next one after it was said', () => {
    expect(upcoming({ day: 12, month: 1 }, today, '2026-11-21')).toEqual({ date: '2027-01-12', exact: true });
    expect(upcoming({ day: 4, month: 12 }, today, '2026-11-21')).toEqual({ date: '2026-12-04', exact: true });
    expect(upcoming({ day: 1, month: 11 }, today, '2026-10-20')).toBeNull();
    expect(upcoming({ day: 21, month: 11 }, today, '2026-11-02')).toEqual({ date: '2026-11-21', exact: true });
  });
  test('a date with a year that has passed is gone', () => {
    expect(upcoming({ day: 1, month: 3, year: 2026 }, today)).toBeNull();
    expect(upcoming({ day: 1, month: 3, year: 2027 }, today)).toEqual({ date: '2027-03-01', exact: true });
  });
  test('a month or a year on its own is ahead while today is in it', () => {
    expect(upcoming({ month: 11, year: 2026 }, today)).toEqual({ date: '2026-11-01', exact: false });
    expect(upcoming({ month: 10, year: 2026 }, today)).toBeNull();
    expect(upcoming({ month: 2 }, today, '2026-11-21')).toEqual({ date: '2027-02-01', exact: false });
    expect(upcoming({ year: 2026 }, today)).toEqual({ date: '2026-01-01', exact: false });
    expect(upcoming({ year: 2025 }, today)).toBeNull();
  });
});

describe('the screens', () => {
  const plan = readFileSync(join(import.meta.dir, '../..', 'apps/mobile/src/screens/v26/plan.tsx'), 'utf8');
  test('each area shows what Life knows, or day one until it knows anything', () => {
    expect(plan).toContain('if (!k.facts.length) return <>{dayOne}</>;');
    for (const area of ['areahome', 'areawork', 'areahealth']) expect(plan).toContain(`<AreaKnownV26 screen="${area}"`);
    expect(plan).toContain('callout="Wellness admin from what you’ve told Life, not medical advice."');
  });
});
