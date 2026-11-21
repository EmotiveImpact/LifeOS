/**
 * Calendar awareness (Phase 29). The web preview has no calendar: this answers "not here", and `calendar.native.ts`
 * reads the phone's. Both share this shape.
 */
import type { Busy } from '@life/core';

export type CalendarPermission = 'granted' | 'denied' | 'undetermined' | 'unavailable';
export const calendarSupported = false;
export async function calendarPermission(): Promise<CalendarPermission> { return 'unavailable'; }
/** Asks to read calendars, through the system prompt. Read only: Life never writes. */
export async function askCalendar(): Promise<boolean> { return false; }
/** When you're busy between two instants: start and end only, never titles, places or people. */
export async function busyTimes(_from: number, _to: number): Promise<Busy[] | null> { return null; }
