// Default resolution is the explicit browser preview adapter. Metro selects
// persistence.native.ts on iOS/Android; it never falls back to AsyncStorage.
export { openProjectionStorage } from './persistence.web';
