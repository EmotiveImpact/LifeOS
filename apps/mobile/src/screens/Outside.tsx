/**
 * Life outside the app and the orb pages. Every screen is the V26 build in `v26/outside.tsx`; this switch keeps the
 * route's entry point. `?state=lock` shows the Lock Screen Live Activity, `?state=done` the watch after a tick.
 */
import { Redirect } from 'expo-router';
import { AndroidWidgetV26, LockPushV26, OrbV26, OrbnextV26, SiriV26, TopbarsV26, WatchV26, WidgetsV26 } from './v26/outside';

export function OutsideScreen({ screen, state }: { screen: string; state?: string }) {
  switch (screen) {
    case 'widgets': return <WidgetsV26 lock={state === 'lock'} />;
    case 'watch': return <WatchV26 done={state === 'done'} />;
    case 'lockpush': return <LockPushV26 />;
    case 'androidwidget': return <AndroidWidgetV26 />;
    case 'siri': return <SiriV26 />;
    case 'orb': return <OrbV26 />;
    case 'topbars': return <TopbarsV26 />;
    case 'orbnext': return <OrbnextV26 />;
    default: return <Redirect href="/design" />;
  }
}
