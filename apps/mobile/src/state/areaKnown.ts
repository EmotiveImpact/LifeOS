import { whenText, type When } from '@life/brain';
import type { FiledRecord } from './seed';

/**
 * Home, Work and Health for a real account, from what the person has told Life (F-38): the confirmed records filed
 * under the area, and the dated ones (an appointment, a document expiring or renewing) that are still ahead.
 */
export type ComingUp = { id: string; title: string; when: string; inDays: number | null };
export type KnownArea = { facts: FiledRecord[]; lead: string | null; next: ComingUp[] };

const iso = (y: number, m: number, d: number) => `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const days = (from: string, to: string) => Math.round((Date.parse(`${to}T12:00:00Z`) - Date.parse(`${from}T12:00:00Z`)) / 86400000);

/**
 * When a date said in Talk falls, if it's still ahead of `today` (YYYY-MM-DD). A date said without a year is the next
 * one after the day it was said (`saidOn`), so an appointment that has passed drops off instead of moving to next
 * year. `exact` is false for a month or a year on its own, which sort by their start but are never counted in days.
 */
export function upcoming(when: When, today: string, saidOn: string = today): { date: string; exact: boolean } | null {
  const [y, m] = saidOn.split('-').map(Number);
  let found: { date: string; exact: boolean } | null = null;
  if (when.month && when.day) {
    const sameYear = iso(when.year ?? y, when.month, when.day);
    found = { date: when.year || sameYear >= saidOn ? sameYear : iso(y + 1, when.month, when.day), exact: true };
  } else if (when.month) {
    found = { date: iso(when.year ?? (when.month >= m ? y : y + 1), when.month, 1), exact: false };
  } else if (when.year) {
    found = { date: iso(when.year, 1, 1), exact: false };
  }
  if (!found) return null;
  // A month or a year is still ahead while today is in it.
  const ahead = found.exact ? found.date >= today : when.month ? found.date.slice(0, 7) >= today.slice(0, 7) : found.date.slice(0, 4) >= today.slice(0, 4);
  return ahead ? found : null;
}

/** The fact a page leads with, when it knows it: how you live for Home, how you work for Work. */
const LEAD: Partial<Record<FiledRecord['area'], string>> = { home: 'home', work: 'work' };

export function knownArea(input: { records: FiledRecord[]; area: FiledRecord['area']; today: string }): KnownArea {
  const facts = input.records.filter(r => r.status === 'confirmed' && r.area === input.area);
  const leadId = LEAD[input.area];
  const lead = leadId ? facts.find(r => r.id === leadId)?.label ?? null : null;
  const next: (ComingUp & { date: string })[] = [];
  for (const r of facts) {
    const d = r.details;
    if (!d || (d.kind !== 'appointment' && d.kind !== 'document')) continue;
    const on = upcoming(d.when, input.today, r.source.at.slice(0, 10));
    if (!on) continue;
    const said = whenText(d.when);
    // "Dentist, 4 May at 3pm" reads as Dentist; "MOT expires May 2027" as MOT expires.
    const title = d.kind === 'appointment' ? d.what : r.label.replace(said, '').replace(/[\s,]+$/, '') || r.label;
    next.push({ id: r.id, title, when: said, inDays: on.exact ? days(input.today, on.date) : null, date: on.date });
  }
  next.sort((a, b) => a.date.localeCompare(b.date));
  return { facts, lead, next: next.map(({ date: _date, ...rest }) => rest) };
}
