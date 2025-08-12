import { Platform } from 'react-native';

// Brand Colors
export const BRAND_COLORS = {
  primary: '#6a01f6',
  primaryDark: '#5a00d6',
  primaryLight: '#7d1aff',
  secondary: '#9945ff',
  accent: '#8b5cf6',
} as const;

// Semantic Colors
export const SEMANTIC_COLORS = {
  success: '#10b981',
  successLight: '#6ee7b7',
  successDark: '#065f46',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  warningDark: '#92400e',
  error: '#ef4444',
  errorLight: '#fca5a5',
  errorDark: '#991b1b',
  info: '#06b6d4',
  infoLight: '#67e8f9',
  infoDark: '#0e7490',
} as const;

// Typography with DynaPuff fonts
export const TYPOGRAPHY = {
  fontFamily: {
    // System fonts (fallback)
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',

    // DynaPuff fonts - iOS specific names
    dynaPuffRegular:
      Platform.OS === 'ios' ? 'DynaPuff-Regular' : 'DynaPuff-Regular',
    dynaPuffMedium:
      Platform.OS === 'ios' ? 'DynaPuff-Medium' : 'DynaPuff-Medium',
    dynaPuffSemiBold:
      Platform.OS === 'ios' ? 'DynaPuff-SemiBold' : 'DynaPuff-SemiBold',
    dynaPuffBold: Platform.OS === 'ios' ? 'DynaPuff-Bold' : 'DynaPuff-Bold',

    // Primary font choices
    primary: Platform.OS === 'ios' ? 'DynaPuff-Regular' : 'DynaPuff-Regular',
    primaryMedium:
      Platform.OS === 'ios' ? 'DynaPuff-Medium' : 'DynaPuff-Medium',
    primaryBold: Platform.OS === 'ios' ? 'DynaPuff-Bold' : 'DynaPuff-Bold',
    secondary: 'System',

    // Heading fonts
    heading: Platform.OS === 'ios' ? 'DynaPuff-Bold' : 'DynaPuff-Bold',
    subheading:
      Platform.OS === 'ios' ? 'DynaPuff-SemiBold' : 'DynaPuff-SemiBold',
    body: Platform.OS === 'ios' ? 'DynaPuff-Regular' : 'DynaPuff-Regular',
    caption: 'System',
  },

  fontSize: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    title: 36,
  },
  fontWeight: {
    light: '300' as const,
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
    heavy: '800' as const,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6,
    loose: 1.8,
  },
} as const;

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  '4xl': 40,
  '5xl': 48,
  '6xl': 56,
  '7xl': 64,
  '8xl': 80,

  // Component spacing
  button: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginVertical: 8,
  },
  card: {
    padding: 16,
    margin: 12,
  },
  screen: {
    horizontal: 20,
    vertical: 16,
  },
} as const;

// Border Radius
export const BORDER_RADIUS = {
  none: 0,
  xs: 4,
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 20,
  '2xl': 24,
  '3xl': 32,
  full: 9999,
} as const;

// Shadows
export const SHADOWS = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// Icon Sizes
export const ICON_SIZES = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 28,
  xxl: 32,
  '2xl': 40,
  '3xl': 48,
} as const;

// Animation
export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
} as const;

// Light Theme
export const LIGHT_THEME = {
  // Brand colors
  primary: BRAND_COLORS.primary,
  primaryDark: BRAND_COLORS.primaryDark,
  primaryLight: BRAND_COLORS.primaryLight,
  secondary: BRAND_COLORS.secondary,
  accent: BRAND_COLORS.accent,

  // Semantic colors
  success: SEMANTIC_COLORS.success,
  successLight: SEMANTIC_COLORS.successLight,
  successDark: SEMANTIC_COLORS.successDark,
  warning: SEMANTIC_COLORS.warning,
  warningLight: SEMANTIC_COLORS.warningLight,
  warningDark: SEMANTIC_COLORS.warningDark,
  error: SEMANTIC_COLORS.error,
  errorLight: SEMANTIC_COLORS.errorLight,
  errorDark: SEMANTIC_COLORS.errorDark,
  info: SEMANTIC_COLORS.info,
  infoLight: SEMANTIC_COLORS.infoLight,
  infoDark: SEMANTIC_COLORS.infoDark,

  // Background colors
  background: '#ffffff',
  surface: '#f8fafc',
  surfaceVariant: '#f1f5f9',
  card: '#ffffff',
  modal: '#ffffff',

  // Text colors
  text: '#1e293b',
  textSecondary: '#64748b',
  textLight: '#94a3b8',
  textOnPrimary: '#ffffff',

  // Border colors
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  divider: '#e2e8f0',

  // Interactive colors
  disabled: '#d1d5db',
  placeholder: '#9ca3af',

  // Icon colors
  iconPrimary: BRAND_COLORS.primary,
  iconSecondary: '#64748b',
  iconInactive: '#94a3b8',

  // Button colors
  buttonPrimary: BRAND_COLORS.primary,
  buttonSecondary: BRAND_COLORS.secondary,

  // Gradients
  gradients: {
    primary: [BRAND_COLORS.primary, BRAND_COLORS.primaryLight] as string[],
    secondary: [BRAND_COLORS.secondary, BRAND_COLORS.accent] as string[],
    background: ['#ffffff', '#f8fafc'] as string[],
    overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)'] as string[],
  },
} as const;

// Dark Theme
export const DARK_THEME = {
  // Brand colors
  primary: BRAND_COLORS.primaryLight,
  primaryDark: BRAND_COLORS.primary,
  primaryLight: BRAND_COLORS.primaryLight,
  secondary: BRAND_COLORS.secondary,
  accent: BRAND_COLORS.accent,

  // Semantic colors
  success: SEMANTIC_COLORS.success,
  successLight: SEMANTIC_COLORS.successLight,
  successDark: SEMANTIC_COLORS.successDark,
  warning: SEMANTIC_COLORS.warning,
  warningLight: SEMANTIC_COLORS.warningLight,
  warningDark: SEMANTIC_COLORS.warningDark,
  error: SEMANTIC_COLORS.error,
  errorLight: SEMANTIC_COLORS.errorLight,
  errorDark: SEMANTIC_COLORS.errorDark,
  info: SEMANTIC_COLORS.info,
  infoLight: SEMANTIC_COLORS.infoLight,
  infoDark: SEMANTIC_COLORS.infoDark,

  // Background colors
  background: '#0f172a',
  surface: '#1e293b',
  surfaceVariant: '#334155',
  card: '#1e293b',
  modal: '#334155',

  // Text colors
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textLight: '#94a3b8',
  textOnPrimary: '#ffffff',

  // Border colors
  border: '#475569',
  borderLight: '#64748b',
  divider: '#475569',

  // Interactive colors
  disabled: '#64748b',
  placeholder: '#94a3b8',

  // Icon colors
  iconPrimary: BRAND_COLORS.primaryLight,
  iconSecondary: '#cbd5e1',
  iconInactive: '#64748b',

  // Button colors
  buttonPrimary: BRAND_COLORS.primaryLight,
  buttonSecondary: BRAND_COLORS.secondary,

  // Gradients
  gradients: {
    primary: [BRAND_COLORS.primaryLight, BRAND_COLORS.primary] as string[],
    secondary: [BRAND_COLORS.secondary, BRAND_COLORS.accent] as string[],
    background: ['#0f172a', '#1e293b'] as string[],
    overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)'] as string[],
  },
} as const;

// Complete Theme Object
export const COMPLETE_THEME = {
  light: {
    colors: LIGHT_THEME,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    borderRadius: BORDER_RADIUS,
    shadows: SHADOWS,
    iconSizes: ICON_SIZES,
    animation: ANIMATION,
  },
  dark: {
    colors: DARK_THEME,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    borderRadius: BORDER_RADIUS,
    shadows: SHADOWS,
    iconSizes: ICON_SIZES,
    animation: ANIMATION,
  },
} as const;

// Types
export type ThemeMode = 'light' | 'dark';
export type Theme = typeof COMPLETE_THEME.light;
export type ThemeColors = typeof LIGHT_THEME;
export type IconSize = keyof typeof ICON_SIZES;

// Exports
export const themes = COMPLETE_THEME;
export default COMPLETE_THEME;
