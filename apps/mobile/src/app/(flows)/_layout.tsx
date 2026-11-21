import { Stack } from 'expo-router';
import { useTokens } from '@/design';
export default function FlowsLayout() {
  const t = useTokens();
  return <Stack screenOptions={{ headerShown: false, animation: 'slide_from_right', gestureEnabled: true, statusBarStyle: t.scheme === 'dark' ? 'light' : 'dark' }}><Stack.Screen name="attach" options={{ animation: 'fade' }} /><Stack.Screen name="plusstart" options={{ gestureEnabled: false }} /></Stack>;
}
