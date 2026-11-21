import { whenText, type When } from '@life/brain';
import { addDays, instantAt, localDate } from '@life/core';
import { daysToDay } from './moneyKnown';
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

/**
 * Deadlines from what you told Life (F-50), for the "Deadlines under 24 hours" nudge: appointments and documents on a
 * known day still ahead, and bills with a due day. Health appointments and bills are private, so a locked screen says
 * only that something is due. A day with no time said is all day (09:00 for the nudge's timing, never shown).
 */
export type RecordDeadline = { id: string; title: string; dueAt: number; private: boolean; allDay: boolean };
const DOC_EVENT = { expires: ' expiry', renews: ' renewal', due: '' } as const;
const NINE = 9 * 60;

export function recordDeadlines(records: FiledRecord[], now: number, timeZone: string, withinDays = 7): RecordDeadline[] {
  const today = localDate(now, timeZone), out: RecordDeadline[] = [];
  const minutesOf = (time?: string) => time ? Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5)) : NINE;
  for (const r of records) {
    const d = r.details;
    if (r.status !== 'confirmed' || !d) continue;
    if (d.kind === 'appointment' || d.kind === 'document') {
      const on = upcoming(d.when, today, r.source.at.slice(0, 10));
      if (!on?.exact) continue;
      const time = d.kind === 'appointment' ? d.when.time : undefined;
      const said = whenText(d.when), name = d.kind === 'document' ? r.label.slice(0, Math.max(0, r.label.indexOf(` ${d.event}`))) || r.label.replace(said, '').trim() : d.what;
      const title = d.kind === 'document' ? `${name}${DOC_EVENT[d.event]}` : name;
      out.push({ id: r.id, title, dueAt: instantAt(on.date, minutesOf(time), timeZone), private: r.area === 'health' || r.area === 'money', allDay: !time });
    } else if (d.kind === 'bill' && d.dueDay) {
      out.push({ id: r.id, title: d.payee, dueAt: instantAt(addDays(today, daysToDay(d.dueDay, today)), NINE, timeZone), private: true, allDay: true });
    }
  }
  return out.filter(x => x.dueAt > now && x.dueAt - now <= withinDays * 86_400_000).sort((a, b) => a.dueAt - b.dueAt);
}
