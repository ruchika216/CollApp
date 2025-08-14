import { TextStyle } from 'react-native';
import { getFontFamily, getFontWeight, getLetterSpacing, FontWeight } from './fontUtils';
import { useTheme } from '../theme/useTheme';

/**
 * Typography utility functions for consistent text styling across the app
 */

export interface TypographyStyleOptions {
  fontSize?: number;
  fontWeight?: FontWeight;
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  textTransform?: 'none' | 'capitalize' | 'uppercase' | 'lowercase';
}

/**
 * Create a complete typography style object with theme integration
 */
export const createTypographyStyle = (options: TypographyStyleOptions): TextStyle => {
  const {
    fontSize = 16,
    fontWeight = 'regular',
    color,
    lineHeight,
    letterSpacing,
    textAlign = 'left',
    textTransform = 'none',
  } = options;

  return {
    fontSize,
    fontFamily: getFontFamily(fontWeight),
    fontWeight: getFontWeight(fontWeight) as any,
    color,
    lineHeight: lineHeight || fontSize * 1.5,
    letterSpacing: letterSpacing !== undefined ? letterSpacing : getLetterSpacing(fontSize),
    textAlign,
    textTransform,
  };
};

/**
 * Hook to get typography styles with theme integration
 */
export const useTypographyStyles = () => {
  const { colors, typography } = useTheme();

  const createThemedStyle = (options: TypographyStyleOptions): TextStyle => ({
    ...createTypographyStyle({
      color: colors.text,
      ...options,
    }),
  });

  return {
    // Headers with theme colors
    h1: createThemedStyle({ 
      fontSize: typography.fontSize['5xl'], 
      fontWeight: 'bold',
      lineHeight: typography.fontSize['5xl'] * 1.2,
    }),
    h2: createThemedStyle({ 
      fontSize: typography.fontSize['4xl'], 
      fontWeight: 'bold',
      lineHeight: typography.fontSize['4xl'] * 1.3,
    }),
    h3: createThemedStyle({ 
      fontSize: typography.fontSize['3xl'], 
      fontWeight: 'semibold',
      lineHeight: typography.fontSize['3xl'] * 1.3,
    }),
    h4: createThemedStyle({ 
      fontSize: typography.fontSize['2xl'], 
      fontWeight: 'semibold',
      lineHeight: typography.fontSize['2xl'] * 1.4,
    }),
    h5: createThemedStyle({ 
      fontSize: typography.fontSize.xl, 
      fontWeight: 'medium',
      lineHeight: typography.fontSize.xl * 1.4,
    }),
    h6: createThemedStyle({ 
      fontSize: typography.fontSize.lg, 
      fontWeight: 'medium',
      lineHeight: typography.fontSize.lg * 1.4,
    }),

    // Body text
    bodyLarge: createThemedStyle({ 
      fontSize: typography.fontSize.lg,
      fontWeight: 'regular',
    }),
    body: createThemedStyle({ 
      fontSize: typography.fontSize.lg,
      fontWeight: 'regular',
    }),
    bodySmall: createThemedStyle({ 
      fontSize: typography.fontSize.sm,
      fontWeight: 'regular',
    }),

    // Secondary text
    bodySecondary: createThemedStyle({ 
      fontSize: typography.fontSize.lg,
      fontWeight: 'regular',
      color: colors.textSecondary,
    }),
    bodySecondarySmall: createThemedStyle({ 
      fontSize: typography.fontSize.sm,
      fontWeight: 'regular',
      color: colors.textSecondary,
    }),

    // UI elements
    button: createThemedStyle({ 
      fontSize: typography.fontSize.lg,
      fontWeight: 'semibold',
      textAlign: 'center',
    }),
    buttonLarge: createThemedStyle({ 
      fontSize: typography.fontSize.lg,
      fontWeight: 'semibold',
      textAlign: 'center',
    }),
    buttonSmall: createThemedStyle({ 
      fontSize: typography.fontSize.sm,
      fontWeight: 'semibold',
      textAlign: 'center',
    }),

    // Labels and captions
    label: createThemedStyle({ 
      fontSize: typography.fontSize.sm,
      fontWeight: 'medium',
    }),
    caption: createThemedStyle({ 
      fontSize: typography.fontSize.xs,
      fontWeight: 'regular',
      color: colors.textSecondary,
    }),
    overline: createThemedStyle({ 
      fontSize: typography.fontSize.xs,
      fontWeight: 'medium',
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    }),

    // Status and special text
    success: createThemedStyle({ 
      fontSize: typography.fontSize.sm,
      fontWeight: 'medium',
      color: colors.success,
    }),
    warning: createThemedStyle({ 
      fontSize: typography.fontSize.sm,
      fontWeight: 'medium',
      color: colors.warning,
    }),
    error: createThemedStyle({ 
      fontSize: typography.fontSize.sm,
      fontWeight: 'medium',
      color: colors.error,
    }),
    info: createThemedStyle({ 
      fontSize: typography.fontSize.sm,
      fontWeight: 'medium',
      color: colors.info,
    }),

    // Link text
    link: createThemedStyle({ 
      fontSize: typography.fontSize.lg,
      fontWeight: 'medium',
      color: colors.primary,
    }),
    linkSmall: createThemedStyle({ 
      fontSize: typography.fontSize.sm,
      fontWeight: 'medium',
      color: colors.primary,
    }),

    // Create custom style function
    custom: createThemedStyle,
  };
};

/**
 * Common text style combinations for consistent UI patterns
 */
export const textStylePresets = {
  // Screen titles
  screenTitle: {
    fontSize: 28,
    fontWeight: 'bold' as FontWeight,
    textAlign: 'center' as const,
    letterSpacing: 0.5,
  },
  
  // Card titles
  cardTitle: {
    fontSize: 18,
    fontWeight: 'semibold' as FontWeight,
    letterSpacing: 0.3,
  },
  
  // Input labels
  inputLabel: {
    fontSize: 14,
    fontWeight: 'medium' as FontWeight,
    textTransform: 'none' as const,
  },
  
  // Tab labels
  tabLabel: {
    fontSize: 12,
    fontWeight: 'medium' as FontWeight,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  
  // Subtitle/description text
  subtitle: {
    fontSize: 16,
    fontWeight: 'regular' as FontWeight,
    lineHeight: 24,
    letterSpacing: 0.3,
  },
};

/**
 * Responsive typography helper - adjusts font size based on screen size
 * (Would need react-native-super-grid or similar for full implementation)
 */
export const createResponsiveTextStyle = (
  baseSize: number,
  scaleFactor: number = 0.1
): TypographyStyleOptions => ({
  fontSize: baseSize,
  // Could add responsive logic here when screen size hooks are available
});

/**
 * Text truncation utilities
 */
export const textTruncation = {
  ellipsis: {
    numberOfLines: 1,
    ellipsizeMode: 'tail' as const,
  },
  
  multilineEllipsis: (lines: number = 2) => ({
    numberOfLines: lines,
    ellipsizeMode: 'tail' as const,
  }),
  
  headEllipsis: {
    numberOfLines: 1,
    ellipsizeMode: 'head' as const,
  },
  
  middleEllipsis: {
    numberOfLines: 1,
    ellipsizeMode: 'middle' as const,
  },
};