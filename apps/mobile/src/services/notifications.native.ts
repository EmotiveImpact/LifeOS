/**
 * Local notifications on the phone (Phase 29, `expo-notifications`). Life schedules its own nudges on the phone, so
 * nothing about your day goes to a server to be sent back. Each plan replaces the last: everything Life scheduled is
 * cancelled and the new plan is scheduled, which keeps the one-a-day cap true after a change.
 *
 * Nudges arrive quietly: no sound, no badge. A tap opens the screen the nudge names.
 */
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import type { PlannedNudge } from '@life/core';
import type { NotificationPermission } from './notifications';

export type { NotificationPermission } from './notifications';
export const notificationsSupported = true;
const CHANNEL = 'nudges';
const MARK = 'life-nudge';

Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});

let channelReady: Promise<unknown> | null = null;
const ensureChannel = () => {
  if (Platform.OS !== 'android') return Promise.resolve();
  channelReady ??= Notifications.setNotificationChannelAsync(CHANNEL, {
    name: 'Nudges', importance: Notifications.AndroidImportance.DEFAULT, sound: null, enableVibrate: false, showBadge: false,
  });
  return channelReady;
};

export async function notificationPermission(): Promise<NotificationPermission> {
  try {
    const p = await Notifications.getPermissionsAsync();
    return p.granted ? 'granted' : p.status === 'denied' ? 'denied' : 'undetermined';
  } catch { return 'unavailable'; }
}

export async function askNotifications(): Promise<boolean> {
  try {
    await ensureChannel();
    const p = await Notifications.requestPermissionsAsync({ ios: { allowAlert: true, allowBadge: false, allowSound: false } });
    return p.granted;
  } catch { return false; }
}

export async function applySchedule(planned: readonly PlannedNudge[]): Promise<void> {
  if (await notificationPermission() !== 'granted') return;
  await ensureChannel();
  const existing = await Notifications.getAllScheduledNotificationsAsync();
  await Promise.all(existing.filter(n => n.content.data?.[MARK]).map(n => Notifications.cancelScheduledNotificationAsync(n.identifier)));
  const now = Date.now();
  for (const p of planned) {
    if (p.at <= now) continue;
    await Notifications.scheduleNotificationAsync({
      identifier: p.nudge.id,
      content: { title: p.nudge.title, body: p.nudge.body, sound: false, data: { [MARK]: true, to: p.nudge.to, id: p.nudge.id } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: p.at, channelId: CHANNEL },
    });
  }
}

export async function pushToken(): Promise<string | null> {
  if (!Device.isDevice || await notificationPermission() !== 'granted') return null;
  const projectId = (Constants.expoConfig?.extra as { eas?: { projectId?: string } } | undefined)?.eas?.projectId ?? Constants.easConfig?.projectId;
  if (!projectId) return null;
  try { return (await Notifications.getExpoPushTokenAsync({ projectId })).data; } catch { return null; }
}

export function onNudgeTap(open: (to: string, id: string) => void): () => void {
  const handle = (r: Notifications.NotificationResponse | null) => {
    const data = r?.notification.request.content.data;
    if (data?.[MARK] && typeof data.to === 'string') open(data.to, typeof data.id === 'string' ? data.id : '');
  };
  void Notifications.getLastNotificationResponseAsync().then(r => { handle(r); if (r) void Notifications.clearLastNotificationResponseAsync(); });
  const sub = Notifications.addNotificationResponseReceivedListener(handle);
  return () => sub.remove();
}
