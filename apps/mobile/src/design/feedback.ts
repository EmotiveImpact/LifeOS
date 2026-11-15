import * as Haptics from 'expo-haptics';
import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';

/**
 * Haptics (DESIGN.md §8) and sound (§9) in one place, so every moment is paired correctly.
 * Screens call `feedback.complete()` and the like; they never call expo-haptics or expo-audio directly.
 * The Settings screen flips `setFeedbackPrefs` (persist those prefs in the life store).
 */

type Prefs = { sound: boolean; haptics: boolean };
const prefs: Prefs = { sound: true, haptics: true };

export function setFeedbackPrefs(next: Partial<Prefs>): void {
  Object.assign(prefs, next);
}
export function getFeedbackPrefs(): Prefs {
  return { ...prefs };
}

export type SoundName = 'tap' | 'complete' | 'cleared' | 'brief';

const sources: Record<SoundName, number> = {
  tap: require('../../assets/sounds/tap.wav'),
  complete: require('../../assets/sounds/complete.wav'),
  cleared: require('../../assets/sounds/cleared.wav'),
  brief: require('../../assets/sounds/brief.wav'),
};

const players: Partial<Record<SoundName, AudioPlayer>> = {};
let audioReady: Promise<void> | null = null;

function ensureAudio(): Promise<void> {
  if (!audioReady) {
    // Respect the silent switch and never interrupt the user's music.
    audioReady = setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
  }
  return audioReady;
}

export function playSound(name: SoundName): void {
  if (!prefs.sound) return;
  void ensureAudio().then(() => {
    try {
      let p = players[name];
      if (!p) {
        p = createAudioPlayer(sources[name]);
        p.volume = name === 'brief' ? 0.5 : 0.8;
        players[name] = p;
      }
      p.seekTo(0);
      p.play();
    } catch {
      // Sound is a nicety; never let it break an interaction.
    }
  });
}

const safe = (p: Promise<unknown>) => {
  p.catch(() => {});
};

/** One function per moment in DESIGN.md §8–§9. Never fire more than one per gesture. */
export const feedback = {
  /** Tab change, chip, week day, choice card, tick scrub. */
  select(): void {
    if (prefs.haptics) safe(Haptics.selectionAsync());
  },
  /** Opening a card or mission. */
  open(): void {
    if (prefs.haptics) safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
  },
  /** Primary button press: light impact plus the soft tap sound. */
  primary(): void {
    if (prefs.haptics) safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
    playSound('tap');
  },
  /** A sheet snaps to a point. */
  snap(): void {
    if (prefs.haptics) safe(Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
  },
  /** A task is completed. */
  complete(): void {
    if (prefs.haptics) safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    playSound('complete');
  },
  /** A mission reaches Cleared, or money is confirmed. */
  cleared(): void {
    if (prefs.haptics) safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
    playSound('cleared');
  },
  /** First open of the morning brief each day. */
  brief(): void {
    playSound('brief');
  },
  /** A deadline under 24h appears for the first time today. */
  warn(): void {
    if (prefs.haptics) safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
  },
  /** Confirming something destructive. */
  destructive(): void {
    if (prefs.haptics) safe(Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
  },
};

export type FeedbackKind = keyof typeof feedback;
