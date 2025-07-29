import { useColorScheme } from 'react-native';
import { theme, ThemeType } from './index';
import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setTheme } from '../store/slices/themeSlice';

export function useTheme() {
  const dispatch = useAppDispatch();
  const systemColorScheme = useColorScheme();
  const activeTheme =
    useAppSelector(state => state.theme.mode) || systemColorScheme || 'light';

  const toggleTheme = useCallback(() => {
    const newTheme: ThemeType = activeTheme === 'dark' ? 'light' : 'dark';
    dispatch(setTheme(newTheme));
  }, [activeTheme, dispatch]);

  return {
    theme: theme[activeTheme],
    colors: theme[activeTheme].colors,
    gradients: theme[activeTheme].colors.gradients,
    isDark: activeTheme === 'dark',
    toggleTheme,
  };
}
