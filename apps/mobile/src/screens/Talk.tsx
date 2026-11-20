/**
 * Talk's chapter. Every screen is the V26 build in `v26/talk.tsx`; this switch keeps the routes' entry point.
 */
import { useLocalSearchParams } from 'expo-router';
import type { ScreenKey } from '@/navigation/screens';
import { ParentStateContent } from './States';
import { Screen } from './Screen';
import { AskV26, AttachV26, ChatHistoryV26, ChatV26, EditFiledV26, ScanV26, TalkV26, UnderstoodV26 } from './v26/talk';

export function TalkScreen({ screen }: { screen: ScreenKey }) {
  const params = useLocalSearchParams<{ state?: string }>();
  switch (screen) {
    case 'talk': return <TalkV26 />;
    case 'understood': return <UnderstoodV26 />;
    case 'ask': return <AskV26 />;
    case 'attach': return <AttachV26 />;
    case 'scan': return <ScanV26 />;
    case 'chat': return params.state === 'aidown' ? <Screen screen={screen}><ParentStateContent kind="aidown" /></Screen> : <ChatV26 />;
    case 'chathistory': return <ChatHistoryV26 />;
    default: return <EditFiledV26 />;
  }
}
