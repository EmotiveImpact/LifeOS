import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';

/**
 * Loads the life typefaces (v4: Inter only, plus JetBrains Mono for IDs and times).
 * Call once in the root layout and keep the splash screen up until it returns `true`.
 */
export function useLifeFonts(): boolean {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    JetBrainsMono_400Regular,
  });
  // On a font error, render anyway with system fallbacks rather than hang on the splash.
  return loaded || Boolean(error);
}
