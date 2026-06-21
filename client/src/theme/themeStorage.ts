import type { ThemeMode } from './colors';

const STORAGE_KEY = 'evelify-theme-mode';

export const getStoredTheme = (): ThemeMode => {
  if (typeof window === 'undefined') return 'dark';
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored;
  }
  return 'system';
};

export const setStoredTheme = (mode: ThemeMode): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, mode);
};

export const getSystemTheme = (): 'light' | 'dark' => {
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

export const getEffectiveTheme = (mode: ThemeMode): 'light' | 'dark' => {
  if (mode === 'system') {
    return getSystemTheme();
  }
  return mode;
};