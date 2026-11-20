/**
 * Background work on the phone (Phase 29, `expo-background-task`). iOS and Android wake Life now and then, at most
 * every 15 minutes and when the phone thinks it's a good moment. Each wake does only what's due (`dueJobs`):
 *
 * - **health**: new readings, with a recorded yes, from the sources you connected.
 * - **sync**: your changes out and the account's in, when you're signed in.
 * - **nudges**: today and tomorrow planned again, which covers the morning plan, the evening question, habits, the
 *   weekly recap and birthdays.
 * Anything that fails (a locked phone, no connection) waits for the next wake. What it saves is marked, so the app
 * reloads it when it comes to the front instead of writing over it.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { dueJobs, type Job } from '@life/core';
import { openProjectionStorage } from '@/state/persistence';
import { hydrateSeed, type SeedData } from '@/state/SeedProvider';
import { readHealthConsent } from '@/state/firstopen';
import { NUDGE_LOG_KEY } from '@/state/dayplan';
import { apiConfigured } from './brain';
import { ingestHealth } from './health/ingest';
import { allowedTypes } from './health/mapping';
import { phoneHealth } from './health/phone';
import type { SampleReader } from './health/reader';
import { preferredSources } from './health/useHealthRunner';
import { wearablesReader } from './health/wearables';
import { markBackgroundWrite } from './backgroundMark';
import { refreshNudges } from './nudges';
import { currentTransport } from './syncTransport';

export const backgroundSupported = true;
const TASK = 'life-day';
const LAST_KEY = 'life.background.last';

async function readLast(): Promise<Partial<Record<Job, number>>> {
  try { return JSON.parse(await AsyncStorage.getItem(LAST_KEY) ?? '{}') as Partial<Record<Job, number>>; } catch { return {}; }
}

async function healthReaders(d: SeedData): Promise<SampleReader[]> {
  const readers: SampleReader[] = [];
  if (d.flags['health-connected'] && await phoneHealth.available()) readers.push(phoneHealth);
  if (apiConfigured && (d.flags['device-whoop'] || d.flags['device-oura'])) readers.push(wearablesReader(() => {}));
  return readers;
}

async function runDay(): Promise<void> {
  const now = Date.now();
  const storage = await openProjectionStorage();
  let wrote = false;
  try {
    let data = hydrateSeed(await storage.load());
    const transport = storage.mode === 'sqlite' ? await currentTransport() : null;
    const consent = readHealthConsent(data);
    const last = await readLast();
    const jobs = dueJobs(last, now, { health: !!consent, signedIn: !!transport });
    for (const job of jobs) {
      try {
        if (job === 'health' && consent) {
          const readers = await healthReaders(data);
          if (readers.length) {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
            const result = await ingestHealth(data.health, { readers, allowed: allowedTypes(consent.types, data.choices), now, timeZone, age: data.profile.age || undefined, preferred: preferredSources(data.choices) });
            data = { ...data, health: result.state };
            await storage.save(data);
            wrote = true;
          }
        }
        if (job === 'sync' && transport) {
          const { applied } = await storage.sync(transport);
          if (applied > 0) { data = hydrateSeed(await storage.load()); wrote = true; }
        }
        if (job === 'nudges') {
          const log = await refreshNudges(data, now);
          if (log && JSON.stringify(log) !== (data.choices[NUDGE_LOG_KEY] ?? '')) {
            data = { ...data, choices: { ...data.choices, [NUDGE_LOG_KEY]: JSON.stringify(log) } };
            await storage.save(data);
            wrote = true;
          }
        }
        last[job] = now;
      } catch { /* This job waits for the next wake. */ }
    }
    await AsyncStorage.setItem(LAST_KEY, JSON.stringify(last));
    if (wrote) await markBackgroundWrite();
  } finally {
    await storage.close();
  }
}

TaskManager.defineTask(TASK, async () => {
  try { await runDay(); return BackgroundTask.BackgroundTaskResult.Success; } catch { return BackgroundTask.BackgroundTaskResult.Failed; }
});

export async function setBackgroundWork(on: boolean): Promise<void> {
  try {
    const registered = await TaskManager.isTaskRegisteredAsync(TASK);
    if (on && !registered && await BackgroundTask.getStatusAsync() === BackgroundTask.BackgroundTaskStatus.Available) await BackgroundTask.registerTaskAsync(TASK, { minimumInterval: 15 });
    if (!on && registered) await BackgroundTask.unregisterTaskAsync(TASK);
  } catch { /* Background work is a help, never required. */ }
}
