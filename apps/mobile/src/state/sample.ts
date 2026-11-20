/**
 * Whether the Ama sample life shows. Edem's rule: keep it in development builds so every screen can be seen; a real
 * signed-in user from beta 1 starts with an empty life and the board's empty states. `EXPO_PUBLIC_SAMPLE_DATA=1`
 * turns it on in a preview build, `0` turns it off in development.
 */
const flag = process.env.EXPO_PUBLIC_SAMPLE_DATA;
export const SHOW_SAMPLES = flag === '1' || (flag !== '0' && typeof __DEV__ !== 'undefined' && __DEV__);
