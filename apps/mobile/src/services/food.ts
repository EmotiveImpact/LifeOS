/**
 * Food in from the world (Phase 27): a barcode looked up in Open Food Facts, and the request that sends a meal or
 * label photo to Life's model through the `food` job. The maths and the reading of answers live in `@life/core`
 * (`food/foodfacts.ts`), so the tests cover them without a phone.
 *
 * - A barcode lookup sends only the code to Open Food Facts. Nothing about the person goes with it.
 * - A photo request carries the photo, made small, and nothing else: no facts, memories or history.
 */
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { BrainError, type Request } from '@life/brain';
import { barcodeCandidates, foodFactsUrl, readFoodFacts, validBarcode, type FoodFactsResult } from '@life/core';

/** Open Food Facts asks apps to name themselves. Browsers set their own, so only the phone sends this. */
const USER_AGENT = `Life/1.0 (${Platform.OS}; +https://github.com/EmotiveImpact/LifeOS)`;
const LOOKUP_MS = 10_000;

export type BarcodeLookup = FoodFactsResult & { code: string };

/** The product for a scanned or typed code. Throws with a plain message when the code is wrong or there's no connection. */
export async function lookupBarcode(raw: string, outer?: AbortSignal): Promise<BarcodeLookup> {
  const code = raw.replace(/\s+/g, '');
  if (!validBarcode(code)) throw new Error('That code doesn’t look right. Check the numbers under the bars.');
  let best: BarcodeLookup = { found: false, code };
  for (const candidate of barcodeCandidates(code)) {
    const stop = new AbortController();
    const timer = setTimeout(() => stop.abort(), LOOKUP_MS);
    const onOuter = () => stop.abort();
    outer?.addEventListener('abort', onOuter);
    try {
      const response = await fetch(foodFactsUrl(candidate), { headers: Platform.OS === 'web' ? {} : { 'User-Agent': USER_AGENT }, signal: stop.signal });
      // Open Food Facts answers 404 for a code it doesn't know.
      const read = response.ok || response.status === 404 ? readFoodFacts(await response.json().catch(() => null), candidate) : null;
      if (!read) throw new Error('Open Food Facts didn’t answer. Try again in a moment.');
      if (read.found && read.product) return { ...read, code: candidate };
      if (read.found) best = { ...read, code: candidate };
    } catch (error) {
      if (outer?.aborted) throw error;
      if (error instanceof Error && error.message.startsWith('Open Food Facts')) throw error;
      throw new Error('No connection to Open Food Facts. Try again, or read the label instead.');
    } finally {
      clearTimeout(timer);
      outer?.removeEventListener('abort', onOuter);
    }
  }
  return best;
}

export type PhotoKind = 'plate' | 'label';
const ASK: Record<PhotoKind, string> = {
  plate: 'What food is on this plate? Name each item, estimate how much is shown in grams, and give typical figures per 100 g as served.',
  label: 'Read the nutrition label in this photo: the figures per 100 g (or 100 ml for a drink) exactly as printed, the serving size if it says, and the product name if it shows.',
};

/** The `food` job for one photo: the photo and the question, nothing else about the person. */
export function photoRequest(kind: PhotoKind, photo: { mime: string; data: string }, privateMode: boolean): Request {
  const id = Crypto.randomUUID();
  return {
    id, job: 'food', text: ASK[kind], history: [], privateMode, consent: null,
    context: { sample: false, facts: [], memories: [], moves: [] },
    attachments: [{ id: Crypto.randomUUID(), name: 'Photo', mime: photo.mime, uri: '', size: photo.data.length, data: photo.data, status: 'ready' }],
  };
}

/** What to tell the person when a photo couldn't be read. */
export function photoTrouble(error: unknown): string {
  if (error instanceof BrainError) {
    if (error.code === 'OFFLINE') return 'No connection, so the photo wasn’t read. You can add the parts yourself, or try again when you’re back online.';
    if (error.code === 'RATE_LIMITED') return error.message;
    if (error.code === 'INVALID_OUTPUT') return 'Life couldn’t read this photo clearly, so nothing was added. Try a closer, brighter photo, or add the parts yourself.';
    return error.message;
  }
  return error instanceof Error ? error.message : 'That didn’t work. Nothing was added.';
}
