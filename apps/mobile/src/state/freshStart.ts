import { SHOW_SAMPLES } from './sample';

/**
 * Review builds for the owner can open at the very beginning. The first time a build made with
 * `EXPO_PUBLIC_FRESH_START` runs, whatever an older build left on this phone is set aside (this phone only, nothing is
 * sent anywhere), so welcome, sign-in and setup show again. Later opens of the same build keep what was done.
 *
 * It needs the sample life as well, so a build for real people can never erase anything. The TestFlight workflow sets
 * it to the build number when "Start from the beginning" is ticked (Edem, 21 Nov 2026).
 */
const token = process.env.EXPO_PUBLIC_FRESH_START?.trim();
export const FRESH_START: string | null = SHOW_SAMPLES && token ? token : null;

/** Where this phone remembers which build last started fresh. */
export const FRESH_START_KEY = 'life.fresh-start';
