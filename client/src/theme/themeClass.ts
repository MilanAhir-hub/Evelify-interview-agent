export const getThemeClasses = (darkClass: string, lightClass: string): string => {
  return `${darkClass} ${lightClass}`;
};

export const getThemeValue = (darkValue: string, lightValue: string, effectiveTheme: 'light' | 'dark'): string => {
  return effectiveTheme === 'dark' ? darkValue : lightValue;
};