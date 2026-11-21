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
import { useNudgeRunner } from '@/services/nudges';
import { useMovesCounter } from '@/services/moves';
import { CRASH_REPORTS_KEY, setCrashReports } from '@/services/crashes';
// Defines the background task at start-up, as the phone needs it defined before it can run it (Phase 29).
import { setBackgroundWork } from '@/services/background';
import { consentFrom } from '@/services/health/consent';
import { HEALTH_RATIONALE_TARGET, onHealthRationale } from '@/services/healthRationale';
import { useNavigation } from '@/navigation/useNavigation';
import { usePlusGate } from '@/services/plusGate';
import '../global.css';

void SplashScreen.preventAutoHideAsync();
function AppShell() {
  const fonts = useLifeFonts(), { hydrated, storageError, retryStorage } = useSeed(), t = useTokens();
  useEffect(() => { if (fonts && (hydrated || storageError)) void SplashScreen.hideAsync(); }, [fonts, hydrated, storageError]);
  if (!fonts) return null;
  if (storageError) return <SafeAreaView style={{ flex: 1, backgroundColor: t.canvas, padding: space.gutter, justifyContent: 'center', gap: space.md }}><Text variant="headline">Your local data is unavailable</Text><Text variant="body" tone="ink2">Nothing has been reset. The app could not open or save its local store. Native builds require encrypted storage support.</Text><Button label="Try again" onPress={retryStorage} /></SafeAreaView>;
  if (!hydrated) return null;
  return <><AiQueueRunner /><HealthRunner /><DayRunner /><PlusGateRunner /><Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: t.canvas }, animation: 'default', statusBarStyle: t.scheme === 'dark' ? 'light' : 'dark' }}>
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
/** Life Plus when Life opens for someone without a plan, once billing is live (services/plusGate.ts). */
function PlusGateRunner() { usePlusGate(); return null; }
/**
 * Plans the phone's nudges and keeps background work registered while nudges or health reading are on. Also counts
 * finished moves, only once the person has switched that on (services/moves.ts).
 */
function DayRunner() {
  const { data } = useSeed(), nav = useNavigation();
  useNudgeRunner();
  // Health Connect asking why Life reads health data opens the privacy policy, not Today (fix F-25).
  useEffect(() => onHealthRationale(() => nav.go(HEALTH_RATIONALE_TARGET.screen, { ...HEALTH_RATIONALE_TARGET.params })), []); // eslint-disable-line react-hooks/exhaustive-deps
  useMovesCounter();
  // Crash reports start once the stored choice is known, so a no is never overridden (services/crashes.native.ts).
  const crashes = data.choices[CRASH_REPORTS_KEY] !== 'off';
  useEffect(() => { setCrashReports(crashes); }, [crashes]);
  const wanted = data.prefs.notifications || consentFrom(data.choices) !== null;
  useEffect(() => { void setBackgroundWork(wanted); }, [wanted]);
  return null;
}
export default function RootLayout() {
  return <GestureHandlerRootView style={{ flex: 1 }}><SafeAreaProvider initialMetrics={initialWindowMetrics}><SeedProvider><SheetProvider><AppShell /></SheetProvider></SeedProvider></SafeAreaProvider></GestureHandlerRootView>;
}
