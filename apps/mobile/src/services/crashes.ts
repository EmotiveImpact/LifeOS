/**
 * Crash reports (Phase 30). The web preview sends none; phones use `crashes.native.ts`, which starts Sentry only
 * when the build carries a DSN (`EXPO_PUBLIC_SENTRY_DSN`) and the person hasn't switched crash reports off.
 */
export const CRASH_REPORTS_KEY = 'crash-reports';
/** Whether this build can send crash reports at all. */
export const crashReportsAvailable = () => false;
/** Starts or stops crash reports to match the person's choice. */
export function setCrashReports(_on: boolean) { /* Nothing to send from the web preview. */ }
