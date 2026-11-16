import { useState } from 'react';
import { Tabs, useRouter, type Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Dock } from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
import { DockVisibility } from '@/navigation/DockVisibility';
export default function TabsLayout() {
  const [hidden, setHidden] = useState(false), router = useRouter(), nav = useNavigation();
  return <DockVisibility.Provider value={setHidden}><Tabs screenOptions={{ headerShown: false, animation: 'fade' }} tabBar={({ state }) => <Dock hidden={hidden} active={state.routes[state.index].name} items={[{ key: 'today', label: 'Today', icon: color => <Ionicons name="home-outline" size={21} color={color} /> }, { key: 'plan', label: 'Plan', icon: color => <Ionicons name="layers-outline" size={21} color={color} /> }, { key: 'you', label: 'You', icon: color => <Ionicons name="person-outline" size={21} color={color} /> }, { key: 'talk', label: 'Talk', icon: color => <Ionicons name="mic-outline" size={21} color={color} />, onLongPress: () => nav.go('talk') }]} onChange={key => { setHidden(false); if (key === 'talk') router.push('/(flows)/chat' as Href); else router.navigate(`/(tabs)/${key}` as Href); }} />}>
    <Tabs.Screen name="today" options={{ title: 'Today' }} />
    <Tabs.Screen name="plan" options={{ title: 'Plan' }} />
    <Tabs.Screen name="you" options={{ title: 'You' }} />
    <Tabs.Screen name="index" options={{ href: null }} />
    <Tabs.Screen name="discover" options={{ href: null }} />
    <Tabs.Screen name="missions" options={{ href: null }} />
  </Tabs></DockVisibility.Provider>;
}
