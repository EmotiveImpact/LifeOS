import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { HeroUINativeProvider } from 'heroui-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SheetProvider, useLifeFonts, useTokens } from '@/design';
import { SeedProvider, useSeed } from '@/state/SeedProvider';
import { LifeProvider } from '@/state/useLifeStore';
import '../global.css';

void SplashScreen.preventAutoHideAsync();
function AppShell() {
  const fonts = useLifeFonts(), { data, hydrated } = useSeed(), t = useTokens();
  useEffect(() => { if (fonts && hydrated) void SplashScreen.hideAsync(); }, [fonts, hydrated]);
  if (!fonts || !hydrated) return null;
  return <><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.canvas }, animation: 'default' }}>
    <Stack.Screen name="(tabs)" />
    <Stack.Screen name="(sheets)" options={{ presentation: 'formSheet', sheetAllowedDetents: [.55, .92], sheetGrabberVisible: false, contentStyle: { backgroundColor: t.surface } }} />
    <Stack.Screen name="(flows)" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
  </Stack><StatusBar style={data.prefs.dark ? 'light' : 'dark'} /></>;
}
export default function RootLayout() {
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider><HeroUINativeProvider><LifeProvider><SeedProvider><SheetProvider><AppShell /></SheetProvider></SeedProvider></LifeProvider></HeroUINativeProvider></SafeAreaProvider></GestureHandlerRootView>;
}
