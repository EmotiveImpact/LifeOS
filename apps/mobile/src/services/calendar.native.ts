/**
 * Calendar awareness on the phone (Phase 29, `expo-calendar`). Read only, and only when and where you're busy: each
 * event becomes a start and an end before it leaves this file. Titles, places, notes and people are never read into
 * Life. Events marked free, cancelled ones and all-day ones don't count as busy.
 */
import * as Calendar from 'expo-calendar';
import type { Busy } from '@life/core';
import type { CalendarPermission } from './calendar';

export type { CalendarPermission } from './calendar';
export const calendarSupported = true;

export async function calendarPermission(): Promise<CalendarPermission> {
  try {
    const p = await Calendar.getCalendarPermissions();
    return p.granted ? 'granted' : p.status === 'denied' ? 'denied' : 'undetermined';
  } catch { return 'unavailable'; }
}

export async function askCalendar(): Promise<boolean> {
  try { return (await Calendar.requestCalendarPermissions()).granted; } catch { return false; }
}

const ms = (d: string | Date) => (d instanceof Date ? d.getTime() : Date.parse(d));

export async function busyTimes(from: number, to: number): Promise<Busy[] | null> {
  if (await calendarPermission() !== 'granted') return null;
  try {
    const calendars = await Calendar.getCalendars(Calendar.EntityTypes.EVENT);
    if (!calendars.length) return [];
    const events = await Calendar.listEvents(calendars, new Date(from), new Date(to));
    return events
      .filter(e => !e.allDay && e.availability !== Calendar.Availability.FREE && e.status !== Calendar.EventStatus.CANCELED)
      .map(e => ({ start: ms(e.startDate), end: ms(e.endDate) }))
      .filter(b => Number.isFinite(b.start) && Number.isFinite(b.end) && b.end > b.start);
  } catch { return null; }
}
