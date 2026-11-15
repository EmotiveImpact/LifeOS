import { createContext, createElement, useContext, type ReactNode } from 'react';
import { useUniwind } from 'uniwind';
import { useReducedMotion } from 'react-native-reanimated';
import { palette, type Palette, type Scheme } from './tokens';

const SchemeOverride = createContext<Scheme | null>(null);

/**
 * Forces a subtree into one scheme regardless of the app theme.
 * Used by the design gallery to show light and dark side by side.
 */
export function SchemeProvider({ scheme, children }: { scheme: Scheme; children: ReactNode }) {
  return createElement(SchemeOverride.Provider, { value: scheme }, children);
}

/** Current light/dark scheme: an override if present, else the app's Uniwind theme (set by the life store). */
export function useScheme(): Scheme {
  const override = useContext(SchemeOverride);
  const { theme } = useUniwind();
  if (override) return override;
  return theme === 'dark' ? 'dark' : 'light';
}

/** The colour tokens for the current scheme. Components read colours only from here. */
export function useTokens(): Palette & { scheme: Scheme } {
  const scheme = useScheme();
  return { ...palette[scheme], scheme };
}

/** True when the user has Reduce Motion on. Components swap movement for a quick fade. */
export function useCalmMotion(): boolean {
  return useReducedMotion();
}
