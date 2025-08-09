// =======================
// CENTRALIZED THEME CONFIG
// =======================
// This is the SINGLE source of truth for all theme properties
// Change colors, fonts, spacing, and other design tokens here

// === BRAND COLORS ===
export const BRAND_COLORS = {
  primary: '#6a01f6',
  primaryDark: '#5a00d6',
  primaryLight: '#7d1aff',
  secondary: '#9945ff',
  accent: '#8b5cf6',
  highlight: '#a855f7',
  // Enhanced indigo and blue variants
  indigo: '#4f46e5',
  indigoDark: '#3730a3',
  indigoLight: '#6366f1',
  blue: '#3b82f6',
  blueDark: '#1e40af',
  blueLight: '#60a5fa',
  sky: '#0ea5e9',
  skyDark: '#0284c7',
  skyLight: '#38bdf8',
  // Additional modern colors
  teal: '#14b8a6',
  tealDark: '#0f766e',
  tealLight: '#5eead4',
  emerald: '#10b981',
  emeraldDark: '#065f46',
  emeraldLight: '#6ee7b7',
  violet: '#8b5cf6',
  violetDark: '#5b21b6',
  violetLight: '#c4b5fd',
} as const;

// === SEMANTIC COLORS ===
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
  '8xl': 80,
  '9xl': 96,
  '10xl': 128,
  // Component specific spacing
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
    background: ['#ffffff', '#fafafa'] as string[],
    overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)'] as string[],
    // Enhanced gradients with indigo and blue
    indigo: [BRAND_COLORS.indigo, BRAND_COLORS.indigoLight] as string[],
    indigoDeep: [BRAND_COLORS.indigoDark, BRAND_COLORS.indigo] as string[],
    blue: [BRAND_COLORS.blue, BRAND_COLORS.blueLight] as string[],
    blueDeep: [BRAND_COLORS.blueDark, BRAND_COLORS.blue] as string[],
    sky: [BRAND_COLORS.sky, BRAND_COLORS.skyLight] as string[],
    skyDeep: [BRAND_COLORS.skyDark, BRAND_COLORS.sky] as string[],
    // Premium app name gradients
    appName: [BRAND_COLORS.primary, BRAND_COLORS.indigo, BRAND_COLORS.blue] as string[],
    appNameLight: [BRAND_COLORS.primaryLight, BRAND_COLORS.indigoLight, BRAND_COLORS.blueLight] as string[],
  },
} as const;

// === DARK THEME ===
export const DARK_THEME = {
  // Brand colors
  primary: BRAND_COLORS.primaryLight,
  primaryDark: BRAND_COLORS.primary,
  primaryLight: BRAND_COLORS.highlight,
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
    primary: [BRAND_COLORS.primaryLight, BRAND_COLORS.highlight] as string[],
    secondary: [BRAND_COLORS.secondary, BRAND_COLORS.accent] as string[],
    background: ['#0f172a', '#1e293b'] as string[],
    overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)'] as string[],
    // Enhanced gradients with indigo and blue
    indigo: [BRAND_COLORS.indigoLight, BRAND_COLORS.indigo] as string[],
    indigoDeep: [BRAND_COLORS.indigo, BRAND_COLORS.indigoDark] as string[],
    blue: [BRAND_COLORS.blueLight, BRAND_COLORS.blue] as string[],
    blueDeep: [BRAND_COLORS.blue, BRAND_COLORS.blueDark] as string[],
    sky: [BRAND_COLORS.skyLight, BRAND_COLORS.sky] as string[],
    skyDeep: [BRAND_COLORS.sky, BRAND_COLORS.skyDark] as string[],
    // Premium app name gradients for dark mode
    appName: [BRAND_COLORS.primaryLight, BRAND_COLORS.indigoLight, BRAND_COLORS.blueLight] as string[],
    appNameLight: [BRAND_COLORS.highlight, BRAND_COLORS.indigoLight, BRAND_COLORS.skyLight] as string[],
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
