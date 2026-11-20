import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, SafeAreaView, initialWindowMetrics } from 'react-native-safe-area-context';
import { Button, SheetProvider, Text, space, useLifeFonts, useTokens } from '@/design';
import { SeedProvider, useSeed } from '@/state/SeedProvider';
import { useAiQueueRunner } from '@/services/useAiQueue';
import { useHealthRunner } from '@/services/health/useHealthRunner';
import '../global.css';

void SplashScreen.preventAutoHideAsync();
function AppShell() {
  const fonts = useLifeFonts(), { hydrated, storageError, retryStorage } = useSeed(), t = useTokens();
  useEffect(() => { if (fonts && (hydrated || storageError)) void SplashScreen.hideAsync(); }, [fonts, hydrated, storageError]);
  if (!fonts) return null;
  if (storageError) return <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas, padding: space.gutter, justifyContent: 'center', gap: space.md }}><Text variant="headline">Your local data is unavailable</Text><Text variant="body" tone="ink2">Nothing has been reset. The app could not open or save its local store. Native builds require encrypted storage support.</Text><Button label="Try again" onPress={retryStorage} /></SafeAreaView>;
  if (!hydrated) return null;
  return <><AiQueueRunner /><HealthRunner /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.canvas }, animation: 'default', statusBarStyle: t.scheme === 'dark' ? 'light' : 'dark' }}>
    <Stack.Screen name="(tabs)" />
    {/* The browser has no native sheet and hides the page under a form sheet, so the preview presents sheets as a
        transparent layer instead: the page stays in view, dimmed, and the sheet rises over it (Page draws it). */}
    <Stack.Screen name="(sheets)" options={Platform.OS === 'web'
      ? { presentation: 'transparentModal', animation: 'none', contentStyle: { backgroundColor: 'transparent' } }
      : { presentation: 'formSheet', sheetAllowedDetents: [.55, .92], sheetInitialDetentIndex: 'last', sheetExpandsWhenScrolledToEdge: false, sheetGrabberVisible: false, contentStyle: { backgroundColor: t.surface } }} />
    <Stack.Screen name="(flows)" options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
  </Stack><StatusBar style={t.scheme === 'dark' ? 'light' : 'dark'} /></>;
}
/** Sends AI requests that waited for a connection, whichever screen is open (services/useAiQueue.ts). */
function AiQueueRunner() { useAiQueueRunner(); return null; }
function HealthRunner() { useHealthRunner(); return null; }
export default function RootLayout() {
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider initialMetrics={initialWindowMetrics}><SeedProvider><SheetProvider><AppShell /></SheetProvider></SeedProvider></SafeAreaProvider></GestureHandlerRootView>;
}
