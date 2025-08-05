import { useColorScheme } from 'react-native';
import { themes, ThemeMode } from './themeConfig';
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setTheme } from '../store/slices/themeSlice';

export function useTheme() {
  const dispatch = useAppDispatch();
  const systemColorScheme = useColorScheme();
  const activeTheme: ThemeMode =
    useAppSelector(state => state.theme.mode) || (systemColorScheme as ThemeMode) || 'light';

  const toggleTheme = useCallback(() => {
    const newTheme: ThemeMode = activeTheme === 'dark' ? 'light' : 'dark';
    dispatch(setTheme(newTheme));
  }, [activeTheme, dispatch]);

  const currentTheme = themes[activeTheme];

  return {
    // Full theme object
    theme: currentTheme,
    
    // Individual theme properties for easy access
    colors: currentTheme.colors,
    gradients: currentTheme.colors.gradients,
    typography: currentTheme.typography,
    spacing: currentTheme.spacing,
    borderRadius: currentTheme.borderRadius,
    shadows: currentTheme.shadows,
    shadow: currentTheme.shadows, // Alias for shadows
    iconSizes: currentTheme.iconSizes,
    animation: currentTheme.animation,
    
    // State
    isDark: activeTheme === 'dark',
    mode: activeTheme,
    
    // Actions
    toggleTheme,
    
    // Legacy support
    COLORS: currentTheme.colors,
    FONTS: currentTheme.typography.fontFamily,
  };
}
