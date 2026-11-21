import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { extractStatements } from '../../packages/brain/src/index.ts';
import { dayNudges, instantAt } from '../../packages/core/src';
import { proposalRecord } from '../../apps/mobile/src/services/brainState.ts';
import { recordDeadlines } from '../../apps/mobile/src/state/areaKnown.ts';
import type { FiledRecord } from '../../apps/mobile/src/state/seed.ts';

/**
 * Fix F-50, deadlines: the "Deadlines under 24 hours" nudge now has a source, what the person told Life with a date.
 * Health and money stay off the lock screen, and a day said without a time is never given one.
 */
const zone = 'Europe/London';
const told = (text: string, at = '2026-11-21T08:00:00Z'): FiledRecord[] => extractStatements(text).map(p => ({ ...proposalRecord(p, 'talk', at), status: 'confirmed' as const }));
const now = instantAt('2026-11-21', 10 * 60, zone);
const life = [
  ...told('My boiler service is due on 22 November.'), ...told('I have a dentist appointment on 22 November at 3pm.'), ...told('I have a job interview on 23 November.'),
  ...told('My council tax is £142 a month, due on the 25th.'), ...told('My home insurance renews on 3 March.'), ...told('My MOT expires in December 2026.'),
  ...told('I have a GP appointment on 1 November.', '2026-10-20T09:00:00Z'),
];

describe('deadlines from what you told Life', () => {
  test('appointments, documents and bills due within the week, soonest first', () => {
    const d = recordDeadlines(life, now, zone);
    expect(d.map(x => [x.title, new Date(x.dueAt).toISOString(), x.private, x.allDay])).toEqual([
      ['Boiler service', '2026-11-22T09:00:00.000Z', false, true],
      ['Dentist', '2026-11-22T15:00:00.000Z', true, false],
      ['Interview', '2026-11-23T09:00:00.000Z', false, true],
      ['Council tax', '2026-11-25T09:00:00.000Z', true, true],
    ]);
  });

  test('a month on its own, a date months away or one that has passed is not a deadline', () => {
    const titles = recordDeadlines(life, now, zone).map(x => x.title);
    expect(titles).not.toContain('MOT expiry');
    expect(titles).not.toContain('Home insurance renewal');
    expect(titles).not.toContain('GP');
  });

  test('the nudge names the day, keeps health and money off the lock screen, and invents no time', () => {
    const bodies = dayNudges({ now, timeZone: zone, gaps: null, off: new Set(), next: null, deadlines: recordDeadlines(life, now, zone), habitsAtRisk: [], recallDue: 0, bedtime: null })
      .filter(n => n.kind === 'deadlines').map(n => n.body);
    expect(bodies).toContain('Boiler service is due tomorrow.');
    expect(bodies).toContain('Something is due tomorrow at 15:00.');
    expect(bodies.join(' ')).not.toMatch(/Dentist|Council tax|£/);
  });

  test('a timed deadline still says its time', () => {
    const [n] = dayNudges({ now, timeZone: zone, gaps: null, off: new Set(), next: null, deadlines: [{ id: 'x', title: 'Car collection', dueAt: instantAt('2026-11-22', 11 * 60, zone) }], habitsAtRisk: [], recallDue: 0, bedtime: null });
    expect(n.body).toBe('Car collection is due tomorrow at 11:00.');
  });

  test('the day plan feeds them to the nudges', () => {
    const plan = readFileSync(join(import.meta.dir, '../..', 'apps/mobile/src/state/dayplan.ts'), 'utf8');
    expect(plan).toContain('deadlines: recordDeadlines(data.records, now, timeZone),');
  });
});
