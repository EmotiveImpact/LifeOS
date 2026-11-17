import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useTokens } from '@/design';
export default function SheetsLayout() {
  const t = useTokens();
  // Measure insets in the presented sheet, not the full-screen presenter.
  return <SafeAreaProvider><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.surface }, animation: 'fade', statusBarStyle: t.scheme === 'dark' ? 'light' : 'dark' }} /></SafeAreaProvider>;
}
