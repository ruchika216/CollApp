import { Platform, TextStyle } from 'react-native';

/**
 * CONSOLIDATED THEME CONFIGURATION
 * Single source of truth for all theme-related values
 * Merges constants/colors.ts, constants/typography.ts, constants/spacing.ts, and theme/themeConfig.ts
 */

// =====================================================================================
// BRAND COLORS
// =====================================================================================
export const BRAND_COLORS = {
  primary: '#6a01f6',
  primaryDark: '#5a00d6',
  primaryLight: '#7d1aff',
  secondary: '#9945ff',
  accent: '#8b5cf6',
} as const;

// =====================================================================================
// SEMANTIC COLORS
// =====================================================================================
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

// =====================================================================================
// SPACING CONFIGURATION
// =====================================================================================
export const SPACING = {
  // Base spacing scale
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

  // Component-specific spacing
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
    horizontal: 24,
    vertical: 16,
  },
} as const;

// =====================================================================================
// BORDER RADIUS
// =====================================================================================
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

// =====================================================================================
// ELEVATION & SHADOWS
// =====================================================================================
export const ELEVATION = {
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
  xxl: 16,
} as const;

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

// =====================================================================================
// TYPOGRAPHY CONFIGURATION
// =====================================================================================

// DynaPuff Font Families
export const FONT_FAMILIES = {
  // Platform-specific DynaPuff fonts
  dynaPuffRegular: Platform.select({
    ios: 'DynaPuff-Regular',
    android: 'DynaPuff-Regular',
    default: 'System',
  }),
  dynaPuffMedium: Platform.select({
    ios: 'DynaPuff-Medium',
    android: 'DynaPuff-Medium',
    default: 'System',
  }),
  dynaPuffSemiBold: Platform.select({
    ios: 'DynaPuff-SemiBold',
    android: 'DynaPuff-SemiBold',
    default: 'System',
  }),
  dynaPuffBold: Platform.select({
    ios: 'DynaPuff-Bold',
    android: 'DynaPuff-Bold',
    default: 'System',
  }),
  
  // Condensed variants
  dynaPuffCondensedRegular: Platform.select({
    ios: 'DynaPuff_Condensed-Regular',
    android: 'DynaPuff_Condensed-Regular',
    default: 'System',
  }),
  dynaPuffCondensedMedium: Platform.select({
    ios: 'DynaPuff_Condensed-Medium',
    android: 'DynaPuff_Condensed-Medium',
    default: 'System',
  }),
  dynaPuffCondensedSemiBold: Platform.select({
    ios: 'DynaPuff_Condensed-SemiBold',
    android: 'DynaPuff_Condensed-SemiBold',
    default: 'System',
  }),
  dynaPuffCondensedBold: Platform.select({
    ios: 'DynaPuff_Condensed-Bold',
    android: 'DynaPuff_Condensed-Bold',
    default: 'System',
  }),

  // Semi-condensed variants  
  dynaPuffSemiCondensedRegular: Platform.select({
    ios: 'DynaPuff_SemiCondensed-Regular',
    android: 'DynaPuff_SemiCondensed-Regular',
    default: 'System',
  }),
  dynaPuffSemiCondensedMedium: Platform.select({
    ios: 'DynaPuff_SemiCondensed-Medium',
    android: 'DynaPuff_SemiCondensed-Medium',
    default: 'System',
  }),
  dynaPuffSemiCondensedSemiBold: Platform.select({
    ios: 'DynaPuff_SemiCondensed-SemiBold',
    android: 'DynaPuff_SemiCondensed-SemiBold',
    default: 'System',
  }),
  dynaPuffSemiCondensedBold: Platform.select({
    ios: 'DynaPuff_SemiCondensed-Bold',
    android: 'DynaPuff_SemiCondensed-Bold',
    default: 'System',
  }),

  // System fallbacks
  system: 'System',
  systemBold: Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'System',
  }),
} as const;

// Font Sizes
export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  lg: 16,
  xl: 18,
  xxl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 32,
  '5xl': 36,
  '6xl': 48,
  title: 36,
} as const;

// Font Weights
export const FONT_WEIGHTS = {
  light: Platform.select({ ios: '300', android: '300', default: '300' }),
  normal: Platform.select({ ios: '400', android: 'normal', default: '400' }),
  medium: Platform.select({ ios: '500', android: '500', default: '500' }),
  semibold: Platform.select({ ios: '600', android: '600', default: '600' }),
  bold: Platform.select({ ios: '700', android: 'bold', default: '700' }),
  heavy: Platform.select({ ios: '800', android: '800', default: '800' }),
} as const;

// Line Heights
export const LINE_HEIGHTS = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
} as const;

// Typography Styles (consolidated from constants/typography.ts)
export const TYPOGRAPHY_STYLES: Record<string, TextStyle> = {
  h1: {
    fontFamily: FONT_FAMILIES.dynaPuffBold,
    fontSize: FONT_SIZES['5xl'],
    lineHeight: FONT_SIZES['5xl'] * LINE_HEIGHTS.tight,
    fontWeight: FONT_WEIGHTS.bold as any,
    letterSpacing: Platform.OS === 'ios' ? -0.5 : 0,
  },
  h2: {
    fontFamily: FONT_FAMILIES.dynaPuffBold,
    fontSize: FONT_SIZES['4xl'],
    lineHeight: FONT_SIZES['4xl'] * LINE_HEIGHTS.tight,
    fontWeight: FONT_WEIGHTS.bold as any,
    letterSpacing: Platform.OS === 'ios' ? -0.25 : 0,
  },
  h3: {
    fontFamily: FONT_FAMILIES.dynaPuffSemiBold,
    fontSize: FONT_SIZES['3xl'],
    lineHeight: FONT_SIZES['3xl'] * LINE_HEIGHTS.normal,
    fontWeight: FONT_WEIGHTS.semibold as any,
    letterSpacing: Platform.OS === 'ios' ? 0 : 0,
  },
  h4: {
    fontFamily: FONT_FAMILIES.dynaPuffSemiBold,
    fontSize: FONT_SIZES['2xl'],
    lineHeight: FONT_SIZES['2xl'] * LINE_HEIGHTS.normal,
    fontWeight: FONT_WEIGHTS.semibold as any,
    letterSpacing: Platform.OS === 'ios' ? 0.15 : 0,
  },
  h5: {
    fontFamily: FONT_FAMILIES.dynaPuffMedium,
    fontSize: FONT_SIZES.xl,
    lineHeight: FONT_SIZES.xl * LINE_HEIGHTS.normal,
    fontWeight: FONT_WEIGHTS.medium as any,
    letterSpacing: Platform.OS === 'ios' ? 0.15 : 0,
  },
  h6: {
    fontFamily: FONT_FAMILIES.dynaPuffMedium,
    fontSize: FONT_SIZES.lg,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.normal,
    fontWeight: FONT_WEIGHTS.medium as any,
    letterSpacing: Platform.OS === 'ios' ? 0.15 : 0,
  },
  subtitle1: {
    fontFamily: FONT_FAMILIES.dynaPuffMedium,
    fontSize: FONT_SIZES.lg,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.normal,
    fontWeight: FONT_WEIGHTS.medium as any,
    letterSpacing: Platform.OS === 'ios' ? 0.15 : 0,
  },
  subtitle2: {
    fontFamily: FONT_FAMILIES.dynaPuffMedium,
    fontSize: FONT_SIZES.md,
    lineHeight: FONT_SIZES.md * LINE_HEIGHTS.normal,
    fontWeight: FONT_WEIGHTS.medium as any,
    letterSpacing: Platform.OS === 'ios' ? 0.1 : 0,
  },
  body1: {
    fontFamily: FONT_FAMILIES.dynaPuffRegular,
    fontSize: FONT_SIZES.lg,
    lineHeight: FONT_SIZES.lg * LINE_HEIGHTS.relaxed,
    fontWeight: FONT_WEIGHTS.normal as any,
    letterSpacing: Platform.OS === 'ios' ? 0.15 : 0,
  },
  body2: {
    fontFamily: FONT_FAMILIES.dynaPuffRegular,
    fontSize: FONT_SIZES.md,
    lineHeight: FONT_SIZES.md * LINE_HEIGHTS.normal,
    fontWeight: FONT_WEIGHTS.normal as any,
    letterSpacing: Platform.OS === 'ios' ? 0.25 : 0,
  },
  button: {
    fontFamily: FONT_FAMILIES.dynaPuffMedium,
    fontSize: FONT_SIZES.md,
    lineHeight: FONT_SIZES.md * LINE_HEIGHTS.tight,
    fontWeight: FONT_WEIGHTS.medium as any,
    letterSpacing: Platform.OS === 'ios' ? 0.5 : 0.8,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontFamily: FONT_FAMILIES.dynaPuffRegular,
    fontSize: FONT_SIZES.xs,
    lineHeight: FONT_SIZES.xs * LINE_HEIGHTS.normal,
    fontWeight: FONT_WEIGHTS.normal as any,
    letterSpacing: Platform.OS === 'ios' ? 0.4 : 0.6,
  },
  overline: {
    fontFamily: FONT_FAMILIES.dynaPuffMedium,
    fontSize: FONT_SIZES.xs,
    lineHeight: FONT_SIZES.xs * LINE_HEIGHTS.relaxed,
    fontWeight: FONT_WEIGHTS.medium as any,
    letterSpacing: Platform.OS === 'ios' ? 1.5 : 2,
    textTransform: 'uppercase' as const,
  },
};

// =====================================================================================
// ICON SIZES & ANIMATION
// =====================================================================================
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

export const ANIMATION_DURATIONS = {
  fast: 150,
  normal: 250,
  slow: 400,
  slower: 600,
} as const;

// =====================================================================================
// HIT SLOP & LAYOUT
// =====================================================================================
export const HIT_SLOP = {
  small: { top: 8, bottom: 8, left: 8, right: 8 },
  medium: { top: 12, bottom: 12, left: 12, right: 12 },
  large: { top: 16, bottom: 16, left: 16, right: 16 },
} as const;

export const LAYOUT = {
  headerHeight: 60,
  tabBarHeight: 60,
  statusBarHeight: Platform.OS === 'ios' ? 44 : 24,
  bottomSafeArea: Platform.OS === 'ios' ? 34 : 0,
  drawerWidth: 280,
  maxContentWidth: 1200,
} as const;

// =====================================================================================
// STATUS & PRIORITY COLORS
// =====================================================================================
export const STATUS_COLORS = {
  pending: SEMANTIC_COLORS.warning,
  development: BRAND_COLORS.primary,
  done: SEMANTIC_COLORS.success,
  deployment: BRAND_COLORS.secondary,
  bug: SEMANTIC_COLORS.error,
} as const;

export const PRIORITY_COLORS = {
  low: SEMANTIC_COLORS.success,
  medium: SEMANTIC_COLORS.warning,
  high: SEMANTIC_COLORS.error,
  urgent: SEMANTIC_COLORS.errorDark,
} as const;

// =====================================================================================
// LIGHT THEME
// =====================================================================================
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

  // Status colors
  status: STATUS_COLORS,
  priority: PRIORITY_COLORS,

  // Input colors
  input: {
    background: '#ffffff',
    border: '#d1d5db',
    borderFocus: BRAND_COLORS.primary,
    placeholder: '#9ca3af',
  },

  // Gradients - consolidated from constants/colors.ts
  gradients: {
    primary: [BRAND_COLORS.primary, BRAND_COLORS.primaryLight] as string[],
    secondary: [BRAND_COLORS.secondary, BRAND_COLORS.accent] as string[],
    background: ['#ede1ff', '#d9c8ff'] as string[], // iOS-like colors from constants
    card: ['#ffffff', '#f8fafc'] as string[],
    overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)'] as string[],
  },
} as const;

// =====================================================================================
// DARK THEME
// =====================================================================================
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

  // Status colors
  status: STATUS_COLORS,
  priority: PRIORITY_COLORS,

  // Input colors
  input: {
    background: '#334155',
    border: '#475569',
    borderFocus: BRAND_COLORS.primaryLight,
    placeholder: '#94a3b8',
  },

  // Gradients
  gradients: {
    primary: [BRAND_COLORS.primaryLight, BRAND_COLORS.primary] as string[],
    secondary: [BRAND_COLORS.secondary, BRAND_COLORS.accent] as string[],
    background: ['#0f172a', '#1e293b'] as string[],
    card: ['#1e293b', '#334155'] as string[],
    overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)'] as string[],
  },
} as const;

// =====================================================================================
// CONSOLIDATED THEME OBJECT
// =====================================================================================
export const THEME = {
  light: {
    colors: LIGHT_THEME,
    typography: {
      fontFamily: FONT_FAMILIES,
      fontSize: FONT_SIZES,
      fontWeight: FONT_WEIGHTS,
      lineHeight: LINE_HEIGHTS,
      styles: TYPOGRAPHY_STYLES,
    },
    spacing: SPACING,
    borderRadius: BORDER_RADIUS,
    shadows: SHADOWS,
    elevation: ELEVATION,
    iconSizes: ICON_SIZES,
    animation: ANIMATION_DURATIONS,
    hitSlop: HIT_SLOP,
    layout: LAYOUT,
  },
  dark: {
    colors: DARK_THEME,
    typography: {
      fontFamily: FONT_FAMILIES,
      fontSize: FONT_SIZES,
      fontWeight: FONT_WEIGHTS,
      lineHeight: LINE_HEIGHTS,
      styles: TYPOGRAPHY_STYLES,
    },
    spacing: SPACING,
    borderRadius: BORDER_RADIUS,
    shadows: SHADOWS,
    elevation: ELEVATION,
    iconSizes: ICON_SIZES,
    animation: ANIMATION_DURATIONS,
    hitSlop: HIT_SLOP,
    layout: LAYOUT,
  },
} as const;

// =====================================================================================
// TYPES
// =====================================================================================
export type ThemeMode = 'light' | 'dark';
export type Theme = typeof THEME.light;
export type ThemeColors = typeof LIGHT_THEME;
export type FontFamily = keyof typeof FONT_FAMILIES;
export type FontSize = keyof typeof FONT_SIZES;
export type IconSize = keyof typeof ICON_SIZES;
export type SpacingSize = keyof typeof SPACING;

// =====================================================================================
// EXPORTS
// =====================================================================================
export const themes = THEME;
export default THEME;