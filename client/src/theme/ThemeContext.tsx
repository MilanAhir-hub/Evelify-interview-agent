import { createContext, useCallback, useEffect, useState, useRef } from 'react';
import type { ThemeMode } from './colors';
import { lightColors, darkColors, type ThemeColors } from './colors';
import { getStoredTheme, setStoredTheme, getEffectiveTheme } from './themeStorage';

interface ThemeContextValue {
  mode: ThemeMode;
  effectiveTheme: 'light' | 'dark';
  colors: ThemeColors;
  setMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const useThemeContext = (): ThemeContextValue => {
  const storedMode = getStoredTheme();
  const initialEffective = getEffectiveTheme(storedMode);

  const [mode, setModeState] = useState<ThemeMode>(storedMode);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(initialEffective);

  // modeRef keeps setMode and the media query listener in sync without stale closures
  const modeRef = useRef<ThemeMode>(storedMode);

  const setMode = useCallback((newMode: ThemeMode) => {
    setStoredTheme(newMode);
    modeRef.current = newMode;
    const effective = getEffectiveTheme(newMode);
    setModeState(newMode);
    setEffectiveTheme(effective);
  }, []);

  const toggleTheme = useCallback(() => {
    const newMode = modeRef.current === 'dark' ? 'light' : 'dark';
    setMode(newMode);
  }, [setMode]);

  // Real-time OS theme listener — only fires when mode === 'system'
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Apply current system theme immediately in case it changed since first render
    if (modeRef.current === 'system') {
      setEffectiveTheme(mediaQuery.matches ? 'dark' : 'light');
    }

    const handleChange = (e: MediaQueryListEvent) => {
      if (modeRef.current === 'system') {
        setEffectiveTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  const colors = effectiveTheme === 'light' ? lightColors : darkColors;

  return {
    mode,
    effectiveTheme,
    colors,
    setMode,
    toggleTheme,
  };
};