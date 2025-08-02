import { TextStyle } from 'react-native';

export const fonts = {
  regular: 'DynaPuff-Regular',
  medium: 'DynaPuff-Medium',
  semiBold: 'DynaPuff-SemiBold',
  bold: 'DynaPuff-Bold',
  condensed: {
    regular: 'DynaPuff_Condensed-Regular',
    medium: 'DynaPuff_Condensed-Medium',
    semiBold: 'DynaPuff_Condensed-SemiBold',
    bold: 'DynaPuff_Condensed-Bold',
  },
  semiCondensed: {
    regular: 'DynaPuff_SemiCondensed-Regular',
    medium: 'DynaPuff_SemiCondensed-Medium',
    semiBold: 'DynaPuff_SemiCondensed-SemiBold',
    bold: 'DynaPuff_SemiCondensed-Bold',
  },
};

export const typography: Record<string, TextStyle> = {
  h1: {
    fontFamily: fonts.bold,
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.5,
  },
  h2: {
    fontFamily: fonts.bold,
    fontSize: 28,
    lineHeight: 36,
    letterSpacing: -0.25,
  },
  h3: {
    fontFamily: fonts.semiBold,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 0,
  },
  h4: {
    fontFamily: fonts.semiBold,
    fontSize: 20,
    lineHeight: 28,
    letterSpacing: 0.15,
  },
  h5: {
    fontFamily: fonts.medium,
    fontSize: 18,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  h6: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.15,
  },
  subtitle1: {
    fontFamily: fonts.medium,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.15,
  },
  subtitle2: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.1,
  },
  body1: {
    fontFamily: fonts.regular,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: 0.15,
  },
  body2: {
    fontFamily: fonts.regular,
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: 0.25,
  },
  button: {
    fontFamily: fonts.medium,
    fontSize: 14,
    lineHeight: 18,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontFamily: fonts.regular,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.4,
  },
  overline: {
    fontFamily: fonts.medium,
    fontSize: 10,
    lineHeight: 16,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
};