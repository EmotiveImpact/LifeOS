import { Tabs, useRouter, type Href } from 'expo-router';
import { Icon as Ionicons } from '@/design/Icon';
import { Dock, componentSize } from '@/design';
import { useNavigation } from '@/navigation/useNavigation';
export default function TabsLayout() {
  const router = useRouter(), nav = useNavigation();
  // Main navigation stays in one place; scrolling never hides it.
  // Full-screen tasks live outside this tab group and retain their own close/back.
  return <Tabs screenOptions={{ headerShown: false, animation: 'fade' }} tabBar={({ state }) => <Dock variant="float" active={state.routes[state.index].name} items={[{ key: 'today', label: 'Today', icon: color => <Ionicons name="home-outline" size={componentSize.navIcon} color={color} /> }, { key: 'plan', label: 'Plan', icon: color => <Ionicons name="layers-outline" size={componentSize.navIcon} color={color} /> }, { key: 'you', label: 'You', icon: color => <Ionicons name="person-outline" size={componentSize.navIcon} color={color} /> }, { key: 'talk', label: 'Talk', icon: color => <Ionicons name="mic-outline" size={componentSize.navIcon} color={color} />, onLongPress: () => nav.go('talk') }]} onChange={key => { if (key === 'talk') router.push('/(flows)/chat' as Href); else router.navigate(`/(tabs)/${key}` as Href); }} />}>
    <Tabs.Screen name="today" options={{ title: 'Today' }} />
    <Tabs.Screen name="plan" options={{ title: 'Plan' }} />
    <Tabs.Screen name="you" options={{ title: 'You' }} />
    <Tabs.Screen name="index" options={{ href: null }} />
    <Tabs.Screen name="discover" options={{ href: null }} />
    <Tabs.Screen name="missions" options={{ href: null }} />
  </Tabs>;
}
