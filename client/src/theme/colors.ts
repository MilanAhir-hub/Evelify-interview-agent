export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    card: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    inverse: string;
  };
  border: {
    default: string;
    subtle: string;
    strong: string;
  };
  accent: {
    primary: string;
    secondary: string;
  };
}

export const lightColors: ThemeColors = {
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    card: '#FFFFFF',
    elevated: '#FFFFFF',
  },
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    tertiary: '#94A3B8',
    inverse: '#FFFFFF',
  },
  border: {
    default: '#E2E8F0',
    subtle: '#F1F5F9',
    strong: '#CBD5E1',
  },
  accent: {
    primary: '#3B82F6',
    secondary: '#6366F1',
  },
};

export const darkColors: ThemeColors = {
  background: {
    primary: '#0B1120',
    secondary: '#0A0F1C',
    tertiary: '#070A14',
    card: 'rgba(15, 23, 42, 0.7)',
    elevated: 'rgba(15, 23, 42, 0.9)',
  },
  text: {
    primary: '#F8FAFC',
    secondary: '#94A3B8',
    tertiary: '#64748B',
    inverse: '#0F172A',
  },
  border: {
    default: 'rgba(255, 255, 255, 0.05)',
    subtle: 'rgba(255, 255, 255, 0.03)',
    strong: 'rgba(255, 255, 255, 0.1)',
  },
  accent: {
    primary: '#3B82F6',
    secondary: '#6366F1',
  },
};