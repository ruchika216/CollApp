import { Platform, TextStyle } from 'react-native';

// =====================================================================================
// FONT FAMILIES
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

// =====================================================================================
// FONT SIZES
// =====================================================================================
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

// =====================================================================================
// FONT WEIGHTS
// =====================================================================================
export const FONT_WEIGHTS = {
  light: Platform.select({ ios: '300', android: '300', default: '300' }),
  normal: Platform.select({ ios: '400', android: 'normal', default: '400' }),
  medium: Platform.select({ ios: '500', android: '500', default: '500' }),
  semibold: Platform.select({ ios: '600', android: '600', default: '600' }),
  bold: Platform.select({ ios: '700', android: 'bold', default: '700' }),
  heavy: Platform.select({ ios: '800', android: '800', default: '800' }),
} as const;

// =====================================================================================
// LINE HEIGHTS
// =====================================================================================
export const LINE_HEIGHTS = {
  tight: 1.2,
  normal: 1.4,
  relaxed: 1.6,
  loose: 1.8,
} as const;

// =====================================================================================
// TYPOGRAPHY STYLES
// =====================================================================================
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
// TYPOGRAPHY CONFIGURATION
// =====================================================================================
export const TYPOGRAPHY = {
  fontFamily: FONT_FAMILIES,
  fontSize: FONT_SIZES,
  fontWeight: FONT_WEIGHTS,
  lineHeight: LINE_HEIGHTS,
  styles: TYPOGRAPHY_STYLES,
} as const;

// =====================================================================================
// TYPES
// =====================================================================================
export type FontFamily = keyof typeof FONT_FAMILIES;
export type FontSize = keyof typeof FONT_SIZES;
export type FontWeight = keyof typeof FONT_WEIGHTS;
export type LineHeight = keyof typeof LINE_HEIGHTS;