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
  try { if (native && (active || subscription)) latest = await native.stop(); return latest; }
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
