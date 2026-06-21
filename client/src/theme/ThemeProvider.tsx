import { useEffect, type ReactNode } from 'react';
import { ThemeContext, useThemeContext } from './ThemeContext';

interface ThemeProviderProps {
  children: ReactNode;
}

const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const themeValue = useThemeContext();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(themeValue.effectiveTheme);
    
    const bg = themeValue.effectiveTheme === 'dark' ? '#0B1120' : '#FFFFFF';
    document.body.style.backgroundColor = bg;
  }, [themeValue.effectiveTheme]);

  return (
    <ThemeContext.Provider value={themeValue}>
      <div className={themeValue.effectiveTheme}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;