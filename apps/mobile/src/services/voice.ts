import { requireOptionalNativeModule } from 'expo';
import { AppState, Platform } from 'react-native';
import { requestRecordingPermissionsAsync } from 'expo-audio';

type Subscription = { remove(): void };
interface NativeVoice {
  speechAvailable(): Promise<boolean>;
  requestSpeechPermission(): Promise<boolean>;
  start(): Promise<void>;
  stop(): Promise<string>;
  addListener(event: 'transcript', listener: (event: { text: string; final: boolean; error?: string }) => void): Subscription;
}
interface PhononVoice { isInstalled(): Promise<boolean>; prepare(url: string, voice: string): Promise<string[]>; speak(text: string): Promise<unknown>; stop(): void }
const native = Platform.OS === 'web' ? null : requireOptionalNativeModule<NativeVoice>('LifeIntelligence');
// Optional, never reported as installed merely because a plan names it. The
// owner-authored Phonon runtime reference must be resolved before bundling.
const phonon = Platform.OS === 'ios' ? requireOptionalNativeModule<PhononVoice>('Phonon') : null;
let active = false, starting = false, latest = '', generation = 0;
let subscription: Subscription | null = null;
let notify: ((text: string, final: boolean, error?: string) => void) | null = null;
async function stop() {
  generation++;
  const hadSession = active || starting || !!subscription;
  try { if (native && hadSession) latest = await native.stop(); return hadSession ? latest : ''; }
  finally { active = false; starting = false; subscription?.remove(); subscription = null; notify = null; }
}
AppState.addEventListener('change', state => {
  if (state !== 'active' && active) { notify?.(latest, true, 'Microphone paused while life is in the background.'); void stop().catch(() => {}); }
});
export const voice = {
  capabilities: async () => ({ speechAvailable: !!native && await native.speechAvailable(), speakerAvailable: !!phonon && !!process.env.EXPO_PUBLIC_PHONON_MODEL_URL && await phonon.isInstalled(), recogniser: 'On-device English speech', speaker: 'Phonon · Maeve', reason: Platform.OS === 'web' ? 'Native voice cannot run in the browser preview. Type instead.' : !native ? 'The installed app needs the new native voice module.' : 'Speech needs supported on-device language assets. Phonon and the Android Kitten runtime are not bundled yet.' }),
  requestPermission: async () => {
    if (!native || !await native.speechAvailable()) throw new Error('On-device speech is unavailable in this build or language. You can type instead.');
    const permission = await requestRecordingPermissionsAsync();
    if (!permission.granted) throw new Error('Microphone access is off. You can type instead.');
    if (!await native.requestSpeechPermission()) throw new Error('Speech permission is off. No recording has started.');
  },
  start: async (onText: (text: string, final: boolean, error?: string) => void) => {
    if (active || starting) throw new Error('A microphone session is already active.');
    starting = true;
    const token = ++generation;
    try {
      await voice.requestPermission();
      if (!native || token !== generation || AppState.currentState !== 'active') throw new Error('Speech was cancelled before recording started.');
      phonon?.stop(); latest = ''; notify = onText; active = true;
      subscription?.remove();
      subscription = native.addListener('transcript', event => { if (token !== generation) return; latest = event.text; if (event.final || event.error) active = false; onText(event.text, event.final, event.error); });
      await native.start();
      return active;
    } catch (error) { await stop(); throw error; }
    finally { starting = false; }
  },
  stop,
  speak: async (text: string) => {
    const url = process.env.EXPO_PUBLIC_PHONON_MODEL_URL;
    if (!phonon || !url || !await phonon.isInstalled()) throw new Error('Phonon is not installed and configured on this phone. The reply is available as text.');
    phonon.stop(); await phonon.prepare(url, 'Maeve'); return phonon.speak(text);
  },
  stopSpeaking: () => phonon?.stop(),
};

/** A phrase as it is heard: plain words, or a recognised detail with the area it files into. */
export type HeardChunk = { text: string; area?: 'you' | 'home' | 'work' | 'money' | 'health' | 'goal'; label?: string };

/**
 * The board's talk, phrase by phrase. It stands in for the live recogniser wherever none is available (the web
 * preview, a simulator, a phone without on-device speech), and the Talk screen labels it as a sample.
 */
export const SAMPLE_TALK: HeardChunk[] = [
  { text: 'My rent goes up ' }, { text: 'in March', area: 'home', label: 'Rent up from March' }, { text: '. I found the letter, ' },
  { text: 'the review is on the 3rd', area: 'home', label: 'Review date · 3 March' }, { text: '. It’s ' },
  { text: 'Kofi’s birthday on Saturday', area: 'you', label: 'Kofi’s birthday · Sat' }, { text: ' and I still need a card. I’ve been ' },
  { text: 'sleeping badly this week', area: 'health', label: 'Sleeping badly this week' }, { text: '.' },
];

/** Plays `SAMPLE_TALK` one phrase every `everyMs` (850 by default, as on the board). Returns a stop function. */
export function sampleStream(onChunk: (index: number) => void, onDone: () => void, everyMs = 850, from = 0): () => void {
  let k = from;
  const timer = setInterval(() => {
    if (k >= SAMPLE_TALK.length) { clearInterval(timer); onDone(); return; }
    onChunk(k++);
  }, everyMs);
  return () => clearInterval(timer);
}

/** Splits a live transcript into phrases and marks the ones the extractor recognised, so Talk can light them up. */
export function chunkTranscript(text: string, recognised: { quote: string; area: HeardChunk['area']; label: string }[]): HeardChunk[] {
  const pieces = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  return pieces.map((piece, i) => {
    const hit = recognised.find(r => r.quote.trim() === piece.trim());
    const spaced = i < pieces.length - 1 ? `${piece} ` : piece;
    return hit ? { text: spaced, area: hit.area, label: hit.label } : { text: spaced };
  });
}
