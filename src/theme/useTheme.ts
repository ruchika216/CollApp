// useTheme.ts - Updated version
import { useColorScheme } from 'react-native';
import { useCallback } from 'react';
import { themes, ThemeMode } from './themeConfig';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setTheme } from '../store/slices/themeSlice';

export function useTheme() {
  const dispatch = useAppDispatch();
  const systemColorScheme = useColorScheme();

  const activeTheme: ThemeMode =
    useAppSelector(state => state.theme.mode) ||
    (systemColorScheme as ThemeMode) ||
    'light';

  const toggleTheme = useCallback(() => {
    const newTheme: ThemeMode = activeTheme === 'dark' ? 'light' : 'dark';
    dispatch(setTheme(newTheme));
  }, [activeTheme, dispatch]);

  const currentTheme = themes[activeTheme];

  return {
    // Theme object
    theme: currentTheme,

    // Individual properties
    colors: currentTheme.colors,
    gradients: currentTheme.colors.gradients, // ADD THIS LINE
    typography: currentTheme.typography,
    spacing: currentTheme.spacing,
    borderRadius: currentTheme.borderRadius,
    shadows: currentTheme.shadows,
    iconSizes: currentTheme.iconSizes,
    animation: currentTheme.animation,

    // State
    isDark: activeTheme === 'dark',
    mode: activeTheme,

    // Actions
    toggleTheme,
  };
}
