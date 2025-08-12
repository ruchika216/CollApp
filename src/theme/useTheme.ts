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

  const currentTheme = themes[activeTheme] || themes.light;

  // Fallback gradients in case they're undefined
  const fallbackGradients = {
    primary: ['#6a01f6', '#7d1aff'],
    secondary: ['#9945ff', '#8b5cf6'],
    background: activeTheme === 'dark' ? ['#0f172a', '#1e293b'] : ['#ffffff', '#f8fafc'],
    overlay: ['rgba(0,0,0,0)', activeTheme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.6)'],
  };

  const colors = currentTheme?.colors || themes.light.colors;
  const gradients = currentTheme?.colors?.gradients || fallbackGradients;

  return {
    // Theme object
    theme: currentTheme,

    // Individual properties
    colors,
    gradients,
    typography: currentTheme?.typography || themes.light.typography,
    spacing: currentTheme?.spacing || themes.light.spacing,
    borderRadius: currentTheme?.borderRadius || themes.light.borderRadius,
    shadows: currentTheme?.shadows || themes.light.shadows,
    iconSizes: currentTheme?.iconSizes || themes.light.iconSizes,
    animation: currentTheme?.animation || themes.light.animation,

    // State
    isDark: activeTheme === 'dark',
    mode: activeTheme,

    // Actions
    toggleTheme,
  };
}
