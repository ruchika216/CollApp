import React, { PropsWithChildren, createContext, useContext } from 'react';
import { useTheme as useCustomTheme } from './useTheme';

export interface ThemeContextProps {
  theme: ReturnType<typeof useCustomTheme>['theme'];
  colors: ReturnType<typeof useCustomTheme>['colors'];
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function createThemeProvider() {
  const Provider: React.FC<PropsWithChildren<{}>> = ({ children }) => {
    const { theme, colors, isDark, toggleTheme } = useCustomTheme();

    return (
      <ThemeContext.Provider value={{ theme, colors, isDark, toggleTheme }}>
        {children}
      </ThemeContext.Provider>
    );
  };
  return Provider;
}

export const ThemeProvider = createThemeProvider();

export function useThemeContext(): ThemeContextProps {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return ctx;
}
