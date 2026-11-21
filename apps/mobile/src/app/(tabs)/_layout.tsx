import { Tabs, useRouter, type Href } from 'expo-router';
import { Icon as Ionicons } from '@/design/Icon';
import { Dock, FaceAvatar, componentSize } from '@/design';
import { useSeed } from '@/state/SeedProvider';
import { useProfilePhoto } from '@/services/profilePhoto';
import { useNavigation } from '@/navigation/useNavigation';
/** The You tab is your face (Edem, 21 Nov 2026): your photo, or your initial without one, and a thin ring when open. */
function YouFace({ selected }: { selected: boolean }) {
  const { data } = useSeed(), photo = useProfilePhoto();
  const initial = data.profile.name.trim().slice(0, 1).toUpperCase() || 'Y';
  // 22pt like the other tab icons; the ring's room is taken back with a negative margin so every label lines up.
  return <FaceAvatar uri={photo} initials={initial} size={componentSize.navIcon} ring={selected} style={{ marginVertical: -3 }} />;
}

export default function TabsLayout() {
  const router = useRouter(), nav = useNavigation();
  // Main navigation stays in one place; scrolling never hides it. Edem (20 Nov) chose the steady full-width bar with
  // every label showing over the V26 floating pill. Talk opens the voice screen that files what you say as you speak
  // (the first time, via the microphone primer); hold it to type instead.
  // Full-screen tasks live outside this tab group and retain their own close/back.
  return <Tabs screenOptions={{ headerShown: false, animation: 'fade' }} tabBar={({ state }) => <Dock active={state.routes[state.index].name} items={[{ key: 'today', label: 'Today', icon: color => <Ionicons name="home-outline" size={componentSize.navIcon} color={color} /> }, { key: 'plan', label: 'Plan', icon: color => <Ionicons name="layers-outline" size={componentSize.navIcon} color={color} /> }, { key: 'you', label: 'You', icon: (_color, selected) => <YouFace selected={selected} /> }, { key: 'talk', label: 'Talk', icon: color => <Ionicons name="mic-outline" size={componentSize.navIcon} color={color} />, onLongPress: () => nav.go('chat') }]} onChange={key => { if (key === 'talk') nav.go('talk'); else router.navigate(`/(tabs)/${key}` as Href); }} />}>
    <Tabs.Screen name="today" options={{ title: 'Today' }} />
    <Tabs.Screen name="plan" options={{ title: 'Plan' }} />
    <Tabs.Screen name="you" options={{ title: 'You' }} />
    {/* Left visible to the router on purpose: the Dock above draws only its own four items, and a hidden tab (`href: null`)
        is never shown, as the navigator sends it to Today instead. That kept the app from ever opening on the intro. */}
    <Tabs.Screen name="index" />
    <Tabs.Screen name="discover" />
    <Tabs.Screen name="missions" />
  </Tabs>;
}
