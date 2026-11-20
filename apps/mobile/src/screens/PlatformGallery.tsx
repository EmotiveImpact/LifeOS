/**
 * The design gallery's way into life outside the app, the orb pages and every designed state. Each opens the real V26
 * screen (`v26/outside.tsx`, `v26/states.tsx`), so the gallery and the app never drift apart.
 */
import { View } from 'react-native';
import { Text, space } from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import type { ScreenKey } from '@/navigation/screens';
import { Row, RowsCard } from './v26/kit';

const OUTSIDE: { key: ScreenKey; title: string; sub: string; params?: Record<string, string> }[] = [
  { key: 'widgets', title: 'Widgets and Live Activity', sub: 'Home Screen · tap the island for the Lock Screen' },
  { key: 'widgets', title: 'Live Activity on the Lock Screen', sub: 'Lock Screen', params: { state: 'lock' } },
  { key: 'sharecard', title: 'Weekly recap, shared', sub: 'Sheet · Hide numbers' },
  { key: 'watch', title: 'Watch companion', sub: 'Apple Watch · Wear OS · tap Done' },
  { key: 'lockpush', title: 'Notifications', sub: 'Lock Screen' },
  { key: 'androidwidget', title: 'Android widgets', sub: 'Material You · tap the tick or the amount' },
  { key: 'siri', title: 'Siri and Shortcuts', sub: 'Voice' },
  { key: 'orb', title: 'The orb', sub: 'Six states' },
  { key: 'topbars', title: 'The top bar', sub: 'Decided by how the screen opened' },
  { key: 'orbnext', title: 'Orb states, next', sub: 'Watch the ring become each state' },
];

const STATES: { key: ScreenKey; title: string; params?: Record<string, string> }[] = [
  { key: 'today', title: 'Today on day one', params: { state: 'emptytoday' } },
  { key: 'today', title: 'Today, loading', params: { state: 'loadingtoday' } },
  { key: 'plan', title: 'Plan on day one', params: { state: 'emptyplan' } },
  { key: 'body', title: 'Body with no device', params: { state: 'emptybody' } },
  { key: 'body', title: 'A device stopped syncing', params: { state: 'connectfail' } },
  { key: 'money', title: 'Offline', params: { state: 'offline' } },
  { key: 'snap', title: 'Camera off', params: { state: 'permdenied' } },
  { key: 'syncissue', title: 'Two phones disagree' },
  { key: 'chat', title: 'Chat paused', params: { state: 'aidown' } },
  { key: 'forceupdate', title: 'Update needed' },
  { key: 'support', title: 'Need support now' },
  { key: 'welcome', title: 'Welcome back (signed out)', params: { state: 'signedout' } },
  { key: 'agecheck', title: 'Your date of birth (18+ check)' },
  { key: 'healthconsent', title: 'Your health data (consent)' },
];

export function PlatformGallery() {
  const nav = useNavigation();
  return (
    <View style={{ gap: space.md }}>
      <Text variant="headline">Outside the app and the orb</Text>
      <RowsCard>{OUTSIDE.map(o => <Row key={`${o.key}${o.params?.state ?? ''}`} title={o.title} sub={o.sub} onPress={() => nav.go(o.key, o.params)} />)}</RowsCard>
      <Text variant="callout" tone="ink2">Drawn previews. Native widgets, Live Activities, the watch app, notification delivery and Siri come with Phase 29.</Text>
      <Text variant="headline">Designed states</Text>
      <RowsCard>{STATES.map(s => <Row key={`${s.key}${s.params?.state ?? ''}`} title={s.title} onPress={() => nav.go(s.key, s.params)} />)}</RowsCard>
    </View>
  );
}
