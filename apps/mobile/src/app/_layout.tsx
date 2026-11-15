import type { JSX } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { HeroUINativeProvider } from 'heroui-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LifeProvider, useLife } from '@/state/useLifeStore';
import { NativeSheetHost } from '@/sheets/NativeSheetHost';

import '../global.css';

function AppShell(): JSX.Element {
  const { darkMode } = useLife();
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
      <NativeSheetHost />
      <StatusBar style={darkMode ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout(): JSX.Element {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <HeroUINativeProvider>
        <LifeProvider>
          <AppShell />
        </LifeProvider>
      </HeroUINativeProvider>
    </GestureHandlerRootView>
  );
}
