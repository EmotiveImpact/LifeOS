import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Card, StatusPill, Text, Ticks, space } from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import type { ScreenKey } from '@/navigation/screens';
import { useSeed } from '@/state/SeedProvider';
import { Screen, layout } from './Screen';
import { ParentStateContent } from './States';
import { CalendarV26, CheckinV26, CustomiseV26, EveningV26, FocusV26, InboxV26, MorningBriefV26, NudgeV26, PulseV26, RoutinesV26, TodayV26, WhyV26 } from './v26/today';

/** Tab 1 · Today. Every screen is the V26 board's (`src/screens/v26/today.tsx`); empty and loading stay with States until Phase 20. */
export function TodayScreen({ screen }: { screen: ScreenKey }) {
  const params = useLocalSearchParams<{ state?: string }>();
  if (screen === 'today' && (params.state === 'emptytoday' || params.state === 'loadingtoday')) return <Screen screen={screen} title="Today"><ParentStateContent kind={params.state} /></Screen>;
  switch (screen) {
    case 'today': return <TodayV26 />;
    case 'pulse': return <PulseV26 />;
    case 'checkin': return <CheckinV26 />;
    case 'customise': return <CustomiseV26 />;
    case 'routines': return <RoutinesV26 />;
    case 'why': return <WhyV26 />;
    case 'calendar': return <CalendarV26 />;
    case 'morningbrief': return <MorningBriefV26 />;
    case 'evening': return <EveningV26 />;
    case 'inbox': return <InboxV26 />;
    case 'focus': return <FocusV26 />;
    default: return <NudgeV26 />;
  }
}
export function MissionPreview({ title, status, sub, filled, id = 'uk-hmrc-tax-code' }: { title: string; status: string; sub: string; filled: number; id?: string }) {
  const nav = useNavigation(), { data, set } = useSeed();
  return <Card onPress={() => { set({ selectedMission: id }); nav.go('mission'); }} style={{ gap: space.sm }}><View style={layout.between}><Text variant="title" style={{ flex: 1 }}>{title}</Text><StatusPill kind={status === 'One form left' ? 'live' : 'neutral'} label={data.completed.includes(id) ? 'Cleared' : status} /></View><Ticks count={28} filled={data.completed.includes(id) ? 28 : filled} /><Text variant="callout" tone="ink2">{sub}</Text></Card>;
}
