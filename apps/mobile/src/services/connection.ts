import { requireOptionalNativeModule } from 'expo';
import { Platform } from 'react-native';
import { whenBack } from './aiQueue';

/**
 * Tells Life the moment the phone has a working connection again (fix F-46), so questions waiting for an answer and
 * changes waiting to sync go straight away instead of on the next timer. On a phone it comes from Life's own native
 * module (the system's network monitor on iPhone, the default network on Android), which reports only online or
 * offline, never which network. In a browser it is the page's online event. A build without the report keeps the
 * timer and the return to the front.
 *
 * One report is shared by everyone listening, so a listener that joins later still knows the phone started offline.
 */
type Subscription = { remove(): void };
interface NativeConnection { addListener(event: 'connection', listener: (event: { online?: boolean }) => void): Subscription }
const native = Platform.OS === 'web' ? null : requireOptionalNativeModule<NativeConnection>('LifeIntelligence');

const listeners = new Set<() => void>();
let stopWatching: (() => void) | null = null;
const backNow = () => { for (const back of [...listeners]) back(); };

function watch(): (() => void) | null {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return null;
    window.addEventListener('online', backNow);
    return () => window.removeEventListener('online', backNow);
  }
  if (!native || typeof native.addListener !== 'function') return null;
  const report = whenBack(backNow);
  try {
    const sub = native.addListener('connection', event => report(event?.online === true));
    return () => sub.remove();
  } catch { return null; }
}

/** Calls `back` each time the phone comes back online. Returns the way to stop. */
export function onConnectionBack(back: () => void): () => void {
  listeners.add(back);
  if (!stopWatching) stopWatching = watch();
  return () => {
    listeners.delete(back);
    if (!listeners.size && stopWatching) { stopWatching(); stopWatching = null; }
  };
}
