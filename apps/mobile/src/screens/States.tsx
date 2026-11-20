/**
 * The app's own state screens (support, two phones disagree, update needed). Every one is the V26 build in
 * `v26/states.tsx`; the states of a parent screen (day one, loading, offline, chat paused, camera off, signed out)
 * are dispatched by that parent's switch.
 */
import type { ScreenKey } from '@/navigation/screens';
import { ForceupdateV26, SupportV26, SyncIssueV26 } from './v26/states';

export function StatesScreen({ screen }: { screen: ScreenKey }) {
  switch (screen) {
    case 'support': return <SupportV26 />;
    case 'syncissue': return <SyncIssueV26 />;
    default: return <ForceupdateV26 />;
  }
}
