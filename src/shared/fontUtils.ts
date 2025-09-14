import { Platform } from 'react-native';

/**
 * Font Utility for DynaPuff font family
 * Provides consistent font family selection across iOS and Android
 */

export type FontWeight = 'regular' | 'medium' | 'semibold' | 'bold';

/**
 * Get the appropriate font family name for the platform
 * @param weight - Font weight variant
 * @returns Platform-specific font family name
 */
export const getFontFamily = (weight: FontWeight = 'regular'): string => {
  const capitalizeFirst = (str: string) => 
    str.charAt(0).toUpperCase() + str.slice(1);

  return Platform.select({
    ios: `DynaPuff-${capitalizeFirst(weight)}`,
    android: `DynaPuff-${capitalizeFirst(weight)}`,
    default: 'System',
  });
};

/**
 * Get platform-specific font weight value
 * @param weight - Semantic font weight
 * @returns Platform-specific font weight value
 */
export const getFontWeight = (weight: FontWeight = 'regular') => {
  const weightMap = {
    regular: Platform.select({ ios: '400', android: 'normal', default: '400' }),
    medium: Platform.select({ ios: '500', android: '500', default: '500' }),
    semibold: Platform.select({ ios: '600', android: '600', default: '600' }),
    bold: Platform.select({ ios: '700', android: 'bold', default: '700' }),
  };

  return weightMap[weight];
};

/**
 * Get platform-specific letter spacing
 * @param size - Base font size for proportional spacing
 * @returns Platform-specific letter spacing value
 */
export const getLetterSpacing = (size: number = 16): number => {
  return Platform.select({
    ios: size * 0.03, // 3% of font size for iOS
    android: size * 0.05, // 5% of font size for Android
    default: size * 0.03,
  });
};

/**
 * Create complete typography style object
 * @param fontSize - Font size value
 * @param weight - Font weight variant
 * @param customLetterSpacing - Override default letter spacing
 * @returns Complete typography style object
 */
export const createFontStyle = (
  fontSize: number,
  weight: FontWeight = 'regular',
  customLetterSpacing?: number
) => ({
  fontSize,
  fontFamily: getFontFamily(weight),
  fontWeight: getFontWeight(weight),
  letterSpacing: customLetterSpacing ?? getLetterSpacing(fontSize),
});

/**
 * Pre-defined font styles for common use cases
 */
export const fontStyles = {
  // Headers
  h1: createFontStyle(32, 'bold'),
  h2: createFontStyle(28, 'bold'),
  h3: createFontStyle(24, 'semibold'),
  h4: createFontStyle(20, 'semibold'),
  h5: createFontStyle(18, 'medium'),
  h6: createFontStyle(16, 'medium'),

  // Body text
  bodyLarge: createFontStyle(18, 'regular'),
  bodyMedium: createFontStyle(16, 'regular'),
  bodySmall: createFontStyle(14, 'regular'),

  // UI elements
  button: createFontStyle(16, 'semibold'),
  buttonLarge: createFontStyle(18, 'semibold'),
  buttonSmall: createFontStyle(14, 'semibold'),
  
  // Labels and captions
  label: createFontStyle(14, 'medium'),
  caption: createFontStyle(12, 'regular'),
  overline: createFontStyle(10, 'medium'),
};