/**
 * Local notifications (Phase 29). The web preview has none: this file answers "not here" for everything, and
 * `notifications.native.ts` is the phone's. Both share this shape.
 */
import type { PlannedNudge } from '@life/core';

export type NotificationPermission = 'granted' | 'denied' | 'undetermined' | 'unavailable';
export const notificationsSupported = false;
export async function notificationPermission(): Promise<NotificationPermission> { return 'unavailable'; }
/** Asks once, through the system prompt. True when nudges may be sent. */
export async function askNotifications(): Promise<boolean> { return false; }
/** Replaces Life's scheduled nudges with these. */
export async function applySchedule(_planned: readonly PlannedNudge[]): Promise<void> {}
/** This phone's push token for the server, when the account and the build support it. */
export async function pushToken(): Promise<string | null> { return null; }
/** Calls back with a tapped nudge's screen and id. Returns a function that stops listening. */
export function onNudgeTap(_open: (to: string, id: string) => void): () => void { return () => {}; }
