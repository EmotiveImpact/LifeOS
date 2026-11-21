import { Platform } from 'react-native';

/**
 * Web preview only. A phone animates a page out when it closes (iOS slides it right, a sheet drops). The browser has
 * no such transition, so the page on top registers how it leaves, and `close` plays that before the route changes.
 * The page underneath then slides back in a little from the left, the way iOS reveals it.
 */
let leaving: ((done: () => void) => void) | null = null;
let reveals = true;
let returningAt = 0;

/** The focused page says how it leaves. `hidesPage` is false for a sheet, whose page stayed in view underneath, so
 *  nothing slides back in. Returns the clean-up for when it loses focus. */
export function setWebExit(fn: (done: () => void) => void, hidesPage = true) {
  leaving = fn;
  reveals = hidesPage;
  return () => { if (leaving === fn) leaving = null; };
}

/** Plays the top page's exit (if it has one), then runs `done`. Never waits more than 260 ms, so a close can't stick. */
export function runWebExit(done: () => void) {
  const slideBack = reveals;
  const finish = () => { if (slideBack) returningAt = Date.now(); done(); };
  if (Platform.OS !== 'web' || !leaving) return done();
  const fn = leaving;
  leaving = null;
  let called = false;
  const once = () => { if (!called) { called = true; finish(); } };
  setTimeout(once, 260);
  fn(once);
}

/** True once, for the page revealed by a close that just happened. */
export function takeReturn() {
  const yes = Date.now() - returningAt < 700;
  returningAt = 0;
  return yes;
}
