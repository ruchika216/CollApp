import React, { PropsWithChildren, createContext, useContext } from 'react';
import { useTheme } from './useTheme';

type ThemeContextType = ReturnType<typeof useTheme>;

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const themeValues = useTheme();

  return (
    <ThemeContext.Provider value={themeValues}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return context;
};
