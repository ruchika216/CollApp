// =======================
// CENTRALIZED THEME CONFIG
// =======================
// This is the SINGLE source of truth for all theme properties
// Change colors, fonts, spacing, and other design tokens here

// === BRAND COLORS ===
export const BRAND_COLORS = {
  primary: '#4423a9',
  primaryDark: '#3d1f96',
  primaryLight: '#5845b7',
  secondary: '#68b0cb',
  accent: '#6445f6',
  highlight: '#0b32e8',
} as const;

// === SEMANTIC COLORS ===
export const SEMANTIC_COLORS = {
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
} as const;

// === TYPOGRAPHY ===
export const TYPOGRAPHY = {
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
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

// === SPACING ===
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
} as const;

// === BORDER RADIUS ===
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

// === SHADOWS ===
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
  '2xl': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// === ICON SIZES ===
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

// === ANIMATION TIMING ===
export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
} as const;

// === LIGHT THEME ===
export const LIGHT_THEME = {
  // Brand colors
  primary: BRAND_COLORS.primary,
  primaryDark: BRAND_COLORS.primaryDark,
  primaryLight: BRAND_COLORS.primaryLight,
  secondary: BRAND_COLORS.secondary,
  accent: BRAND_COLORS.accent,

  // Semantic colors
  success: SEMANTIC_COLORS.success,
  warning: SEMANTIC_COLORS.warning,
  error: SEMANTIC_COLORS.error,
  info: SEMANTIC_COLORS.info,

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
  subtext: '#64748b', // Alias for textSecondary

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

// === DARK THEME ===
export const DARK_THEME = {
  // Brand colors
  primary: BRAND_COLORS.primaryLight,
  primaryDark: BRAND_COLORS.primary,
  primaryLight: '#6c63ff',
  secondary: BRAND_COLORS.secondary,
  accent: BRAND_COLORS.accent,

  // Semantic colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',

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
  subtext: '#cbd5e1', // Alias for textSecondary

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
    primary: [BRAND_COLORS.primaryLight, BRAND_COLORS.accent] as string[],
    secondary: [BRAND_COLORS.secondary, BRAND_COLORS.highlight] as string[],
    background: ['#0f172a', '#1e293b'] as string[],
    overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)'] as string[],
  },
} as const;

// === COMPLETE THEME OBJECT ===
export const COMPLETE_THEME = {
  light: {
    colors: LIGHT_THEME,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    borderRadius: BORDER_RADIUS,
    shadows: SHADOWS,
    shadow: SHADOWS, // Alias for shadows
    iconSizes: ICON_SIZES,
    animation: ANIMATION,
  },
  dark: {
    colors: DARK_THEME,
    typography: TYPOGRAPHY,
    spacing: SPACING,
    borderRadius: BORDER_RADIUS,
    shadows: SHADOWS,
    shadow: SHADOWS, // Alias for shadows
    iconSizes: ICON_SIZES,
    animation: ANIMATION,
  },
} as const;

// === TYPES ===
export type ThemeMode = 'light' | 'dark';
export type Theme = typeof COMPLETE_THEME.light;
export type ThemeColors = typeof LIGHT_THEME;
export type IconSize = keyof typeof ICON_SIZES;

// === EXPORTS ===
export const themes = COMPLETE_THEME;
export default COMPLETE_THEME;
