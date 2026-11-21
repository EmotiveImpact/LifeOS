import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTokens } from '@/design';
export default function SheetsLayout() {
  const t = useTokens();
  // Measure insets in the presented sheet, not the full-screen presenter. In the web preview each sheet is a
  // transparent layer, so the page it was opened from stays in view behind it.
  return <SafeAreaProvider><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Platform.OS === 'web' ? 'transparent' : t.surface }, animation: 'fade', ...(Platform.OS === 'web' ? { presentation: 'transparentModal' as const } : null), statusBarStyle: t.scheme === 'dark' ? 'light' : 'dark' }} /></SafeAreaProvider>;
}
