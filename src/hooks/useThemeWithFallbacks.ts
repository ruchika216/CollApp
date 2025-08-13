import { useTheme } from '../theme/useTheme';

/**
 * Default theme values for fallback scenarios
 * These provide safe defaults when theme is not properly loaded
 */
const DEFAULT_COLORS = {
  // Base colors
  background: '#ffffff',
  card: '#ffffff',
  text: '#1a202c',
  textSecondary: '#64748b',
  border: '#e5e7eb',
  
  // Brand colors
  primary: '#6a01f6',
  secondary: '#8b5cf6',
  accent: '#a855f7',
  
  // Status colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3b82f6',
  
  // Gradients
  gradients: {
    background: ['#ffffff', '#f8fafc'],
    primary: ['#6a01f6', '#7d1aff'],
    secondary: ['#8b5cf6', '#a855f7'],
    card: ['#ffffff', '#f9fafb'],
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
export const useThemeWithFallbacks = () => {
  const theme = useTheme();
  
  return {
    // Core theme properties with fallbacks
    colors: theme?.colors || DEFAULT_COLORS,
    typography: theme?.typography || DEFAULT_TYPOGRAPHY,
    spacing: theme?.spacing || DEFAULT_SPACING,
    breakpoints: theme?.breakpoints || DEFAULT_BREAKPOINTS,
    
    // Theme state
    isDark: theme?.isDark || false,
    
    // Additional theme properties (if they exist)
    shadows: theme?.shadows,
    borderRadius: theme?.borderRadius,
    transitions: theme?.transitions,
    
    // Helper methods
    getColor: (colorKey: string, fallback?: string) => {
      const colors = theme?.colors || DEFAULT_COLORS;
      return colors[colorKey as keyof typeof colors] || fallback || DEFAULT_COLORS.text;
    },
    
    getFontSize: (sizeKey: string, fallback?: number) => {
      const typography = theme?.typography || DEFAULT_TYPOGRAPHY;
      return typography.fontSize[sizeKey as keyof typeof typography.fontSize] || fallback || DEFAULT_TYPOGRAPHY.fontSize.base;
    },
    
    getSpacing: (spacingKey: string, fallback?: number) => {
      const spacing = theme?.spacing || DEFAULT_SPACING;
      return spacing[spacingKey as keyof typeof spacing] || fallback || DEFAULT_SPACING.md;
    },
  };
};

/**
 * Utility function to safely access nested theme properties
 */
export const safeThemeAccess = <T>(
  theme: any,
  path: string,
  fallback: T
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
export { DEFAULT_COLORS, DEFAULT_TYPOGRAPHY, DEFAULT_SPACING, DEFAULT_BREAKPOINTS };