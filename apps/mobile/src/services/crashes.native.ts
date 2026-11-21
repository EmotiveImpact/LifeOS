import * as Sentry from '@sentry/react-native';
import type { Breadcrumb, ErrorEvent } from '@sentry/react-native';

/**
 * Crash reports (Phase 30, SYSTEM_DESIGN §observability). Sentry starts only when the build carries a DSN
 * (`EXPO_PUBLIC_SENTRY_DSN`, from the owner's Sentry project) and the person hasn't switched crash reports off in
 * Your data. A report holds what broke and where in the code: never who it happened to, what they typed, their
 * screen, or the words on it. No tracing, replay, screenshots or view hierarchy.
 */
export const CRASH_REPORTS_KEY = 'crash-reports';
const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN?.trim() || null;

export const crashReportsAvailable = () => dsn !== null;

let started = false, allowed = false;

/** Keeps the kind of step and drops its words: a query string, a typed value or a log line can hold personal content. */
function scrubBreadcrumb(crumb: Breadcrumb): Breadcrumb | null {
  const category = crumb.category ?? '';
  if (category === 'console' || category.startsWith('ui.') || category === 'touch' || category === 'sentry.event') return null;
  const data = crumb.data ?? {};
  if (crumb.type === 'http' || category === 'fetch' || category === 'xhr') {
    const url = typeof data.url === 'string' ? data.url.split(/[?#]/)[0] : undefined;
    return { ...crumb, message: undefined, data: { method: data.method, status_code: data.status_code, url } };
  }
  if (category === 'navigation') {
    const path = (v: unknown) => typeof v === 'string' ? v.split(/[?#]/)[0] : undefined;
    return { ...crumb, message: undefined, data: { from: path(data.from), to: path(data.to) } };
  }
  return { ...crumb, message: undefined, data: undefined };
}

function scrubEvent(event: ErrorEvent): ErrorEvent | null {
  if (!allowed) return null;
  delete event.user;
  delete event.request;
  delete event.extra;
  delete event.server_name;
  if (event.contexts?.device) delete event.contexts.device.name;
  event.breadcrumbs = (event.breadcrumbs ?? []).map(scrubBreadcrumb).filter((b): b is Breadcrumb => b !== null);
  return event;
}

/** Starts or stops crash reports to match the person's choice. Called once the stored choices have loaded. */
export function setCrashReports(on: boolean) {
  allowed = on && dsn !== null;
  if (!allowed || started || !dsn) return;
  started = true;
  Sentry.init({
    dsn,
    sendDefaultPii: false,
    enableAutoSessionTracking: false,
    tracesSampleRate: 0,
    attachScreenshot: false,
    attachViewHierarchy: false,
    reportAccessibilityIdentifier: false,
    enableCaptureFailedRequests: false,
    enableUserInteractionTracing: false,
    maxBreadcrumbs: 30,
    beforeBreadcrumb: scrubBreadcrumb,
    beforeSend: scrubEvent,
  });
}
