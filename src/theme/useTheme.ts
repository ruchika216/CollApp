import { useColorScheme } from 'react-native';
import { useCallback } from 'react';
import { themes, ThemeMode } from './theme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setTheme } from '../store/slices/themeSlice';

/**
 * Default theme values for fallback scenarios
 * These provide safe defaults when theme is not properly loaded
 */
const DEFAULT_COLORS = {
  // Base colors (match updated design)
  background: '#F6F9FF',
  card: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#475569',
  border: '#D6E3FF',

  // Brand colors
  primary: '#2E6AF5',
  secondary: '#4F46E5',
  accent: '#60A5FA',

  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3B82F6',

  // Gradients
  gradients: {
    background: ['#E7F0FF', '#CFE0FF'],
    primary: ['#2E6AF5', '#5A8CFF'],
    secondary: ['#4F46E5', '#60A5FA'],
    card: ['#FFFFFF', '#F6F9FF'],
  },
};

const DEFAULT_TYPOGRAPHY = {
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
    '6xl': 60,
  },
  fontFamily: {
    dynaPuffBold: 'System',
    dynaPuffMedium: 'System',
    dynaPuffRegular: 'System',
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  },
};

const DEFAULT_SPACING = {
  // Screen margins
  screen: {
    horizontal: 24,
    vertical: 16,
  },

  // Standard spacing scale
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 64,

  // Component spacing
  card: {
    padding: 16,
    margin: 8,
  },
  button: {
    padding: 12,
    paddingHorizontal: 24,
  },
};

const DEFAULT_BREAKPOINTS = {
  phone: 0,
  tablet: 768,
  desktop: 1024,
};

/**
 * Enhanced useTheme hook with comprehensive fallbacks
 * Ensures your app never crashes due to missing theme values
 */
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
    primary: ['#2E6AF5', '#5A8CFF'],
    secondary: ['#4F46E5', '#60A5FA'],
    background:
      activeTheme === 'dark' ? ['#0A1224', '#10203D'] : ['#E7F0FF', '#CFE0FF'],
    overlay: [
      'rgba(0,0,0,0)',
      activeTheme === 'dark' ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.06)',
    ],
    card:
      activeTheme === 'dark' ? ['#121C2E', '#16243E'] : ['#FFFFFF', '#F6F9FF'],
  };

  const colors = currentTheme?.colors || DEFAULT_COLORS;
  const gradients = currentTheme?.colors?.gradients || fallbackGradients;

  return {
    // Theme object
    theme: currentTheme,

    // Core theme properties with fallbacks
    colors,
    gradients,
    typography: currentTheme?.typography || DEFAULT_TYPOGRAPHY,
    spacing: currentTheme?.spacing || DEFAULT_SPACING,
    borderRadius: currentTheme?.borderRadius || themes.light.borderRadius,
    shadows: currentTheme?.shadows || themes.light.shadows,
    iconSizes: currentTheme?.iconSizes || themes.light.iconSizes,
    animation: currentTheme?.animation || themes.light.animation,
    breakpoints: DEFAULT_BREAKPOINTS,

    // Component tokens
    components: currentTheme?.colors?.components || ({} as any),

    // Additional theme properties (if they exist)
    elevation: currentTheme?.elevation,
    hitSlop: currentTheme?.hitSlop,
    layout: currentTheme?.layout,

    // State
    isDark: activeTheme === 'dark',
    mode: activeTheme,

    // Actions
    toggleTheme,

    // Helper methods
    getColor: (colorKey: string, fallback?: string) => {
      const themeColors = currentTheme?.colors || DEFAULT_COLORS;
      return (
        themeColors[colorKey as keyof typeof themeColors] ||
        fallback ||
        DEFAULT_COLORS.text
      );
    },

    getFontSize: (sizeKey: string, fallback?: number) => {
      const typography = currentTheme?.typography || DEFAULT_TYPOGRAPHY;
      return (
        typography.fontSize[sizeKey as keyof typeof typography.fontSize] ||
        fallback ||
        DEFAULT_TYPOGRAPHY.fontSize.base
      );
    },

    getSpacing: (spacingKey: string, fallback?: number) => {
      const spacing = currentTheme?.spacing || DEFAULT_SPACING;
      return (
        spacing[spacingKey as keyof typeof spacing] ||
        fallback ||
        DEFAULT_SPACING.md
      );
    },

    // Convenience helpers for buttons and text tokens
    getButtonColors: (
      variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive',
    ) => {
      const comps = (currentTheme?.colors as any)?.components?.button;
      return (comps && comps[variant]) || comps?.primary;
    },
    getTextColor: (
      kind:
        | 'default'
        | 'secondary'
        | 'muted'
        | 'inverse'
        | 'link'
        | 'success'
        | 'warning'
        | 'error' = 'default',
    ) => {
      const tx = (currentTheme?.colors as any)?.components?.text;
      return (tx && tx[kind]) || colors.text;
    },
  };
}

/**
 * Utility function to safely access nested theme properties
 */
export const safeThemeAccess = <T>(
  theme: any,
  path: string,
  fallback: T,
): T => {
  const keys = path.split('.');
  let current = theme;

  for (const key of keys) {
    if (current && typeof current === 'object' && key in current) {
      current = current[key];
    } else {
      return fallback;
    }
  }

  return current !== undefined ? current : fallback;
};

/**
 * Export defaults for direct usage
 */
export {
  DEFAULT_COLORS,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_SPACING,
  DEFAULT_BREAKPOINTS,
};
