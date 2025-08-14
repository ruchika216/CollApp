import { TextStyle, ViewStyle } from 'react-native';
import { Theme, ThemeColors } from './theme';
import { Platform } from 'react-native';

// Styled components factory
export const createThemedStyles = <T>(styleFactory: (theme: Theme) => T) =>
  styleFactory;

// Font utilities with iOS support
export const getFontFamily = (
  variant: 'primary' | 'secondary' | 'heading' | 'body' | 'caption' = 'primary',
  weight: 'regular' | 'medium' | 'bold' = 'regular',
) => {
  const fontMap = {
    primary: {
      regular: Platform.OS === 'ios' ? 'DynaPuff-Regular' : 'DynaPuff-Regular',
      medium: Platform.OS === 'ios' ? 'DynaPuff-Medium' : 'DynaPuff-Medium',
      bold: Platform.OS === 'ios' ? 'DynaPuff-Bold' : 'DynaPuff-Bold',
    },
    secondary: {
      regular: Platform.OS === 'ios' ? 'System' : 'System',
      medium: Platform.OS === 'ios' ? 'System' : 'System',
      bold: Platform.OS === 'ios' ? 'System' : 'System',
    },
    heading: {
      regular:
        Platform.OS === 'ios' ? 'DynaPuff-SemiBold' : 'DynaPuff-SemiBold',
      medium: Platform.OS === 'ios' ? 'DynaPuff-Bold' : 'DynaPuff-Bold',
      bold: Platform.OS === 'ios' ? 'DynaPuff-Bold' : 'DynaPuff-Bold',
    },
    body: {
      regular: Platform.OS === 'ios' ? 'DynaPuff-Regular' : 'DynaPuff-Regular',
      medium: Platform.OS === 'ios' ? 'DynaPuff-Medium' : 'DynaPuff-Medium',
      bold: Platform.OS === 'ios' ? 'DynaPuff-SemiBold' : 'DynaPuff-SemiBold',
    },
    caption: {
      regular: Platform.OS === 'ios' ? 'System' : 'System',
      medium: Platform.OS === 'ios' ? 'System' : 'System',
      bold: Platform.OS === 'ios' ? 'System' : 'System',
    },
  };

  return fontMap[variant][weight];
};

// Color utilities
export const withOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const alpha = Math.round(opacity * 255)
      .toString(16)
      .padStart(2, '0');
    return `#${hex}${alpha}`;
  }
  return color;
};

export const lightenColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * amount);
  const R = (num >> 16) + amt;
  const G = ((num >> 8) & 0x00ff) + amt;
  const B = (num & 0x0000ff) + amt;
  return (
    '#' +
    (
      0x1000000 +
      (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 1 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)
  );
};

export const darkenColor = (color: string, amount: number): string => {
  return lightenColor(color, -amount);
};

// Status color mapping
export const getStatusColor = (status: string, colors: ThemeColors): string => {
  const statusMap: Record<string, keyof ThemeColors> = {
    pending: 'warning',
    development: 'primary',
    review: 'info',
    testing: 'secondary',
    done: 'success',
    deployment: 'accent',
    'fixing bug': 'error',
    completed: 'success',
    active: 'primary',
    inactive: 'disabled',
  };

  const statusKey = statusMap[status.toLowerCase()];
  return statusKey
    ? (colors[statusKey] as string)
    : (colors.disabled as string);
};

// Priority color mapping
export const getPriorityColor = (
  priority: string,
  colors: ThemeColors,
): string => {
  const priorityMap: Record<string, keyof ThemeColors> = {
    critical: 'error',
    high: 'warning',
    medium: 'info',
    low: 'success',
    urgent: 'error',
  };

  const priorityKey = priorityMap[priority.toLowerCase()];
  return priorityKey
    ? (colors[priorityKey] as string)
    : (colors.disabled as string);
};

// Shadow utility
export const createShadow = (
  elevation: number,
  color: string = '#000',
  opacity: number = 0.1,
) => ({
  shadowColor: color,
  shadowOffset: {
    width: 0,
    height: elevation / 2,
  },
  shadowOpacity: opacity,
  shadowRadius: elevation,
  elevation,
});

// Enhanced text style creators with DynaPuff support
export const createTextStyle = (
  colors: ThemeColors,
  options: {
    variant?: 'primary' | 'secondary' | 'light';
    fontType?: 'primary' | 'secondary' | 'heading' | 'body' | 'caption';
    weight?: 'regular' | 'medium' | 'bold';
    size?: keyof typeof import('./theme').FONT_SIZES;
  } = {},
): TextStyle => {
  const {
    variant = 'primary',
    fontType = 'primary',
    weight = 'regular',
    size = 'md',
  } = options;

  const colorMap = {
    primary: colors.text,
    secondary: colors.textSecondary,
    light: colors.textLight,
  };

  return {
    color: colorMap[variant],
    fontFamily: getFontFamily(fontType, weight),
    fontSize: import('./theme').FONT_SIZES[size],
  };
};

// Style creators with font support
export const createCardStyle = (colors: ThemeColors): ViewStyle => ({
  backgroundColor: colors.card,
  borderRadius: 12,
  padding: 16,
  ...createShadow(2, colors.text as string, 0.1),
});

export const createButtonStyle = (
  colors: ThemeColors,
  variant: 'primary' | 'secondary' | 'outline' = 'primary',
): ViewStyle => {
  const baseStyle: ViewStyle = {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseStyle,
        backgroundColor: colors.primary,
      };
    case 'secondary':
      return {
        ...baseStyle,
        backgroundColor: colors.secondary,
      };
    case 'outline':
      return {
        ...baseStyle,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.primary,
      };
    default:
      return baseStyle;
  }
};

// Button text styles with DynaPuff
export const createButtonTextStyle = (
  colors: ThemeColors,
  variant: 'primary' | 'secondary' | 'outline' = 'primary',
): TextStyle => {
  const baseTextStyle: TextStyle = {
    fontFamily: getFontFamily('primary', 'medium'),
    fontSize: 16,
    fontWeight: '500',
  };

  switch (variant) {
    case 'primary':
      return {
        ...baseTextStyle,
        color: colors.textOnPrimary,
      };
    case 'secondary':
      return {
        ...baseTextStyle,
        color: colors.textOnPrimary,
      };
    case 'outline':
      return {
        ...baseTextStyle,
        color: colors.primary,
      };
    default:
      return baseTextStyle;
  }
};

export const createInputStyle = (colors: ThemeColors): ViewStyle => ({
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 12,
  minHeight: 48,
});

// Heading styles with DynaPuff
export const createHeadingStyle = (
  colors: ThemeColors,
  level: 1 | 2 | 3 | 4 = 1,
): TextStyle => {
  const sizes = {
    1: 'title' as const,
    2: '3xl' as const,
    3: '2xl' as const,
    4: 'xl' as const,
  };

  const weights = {
    1: 'bold' as const,
    2: 'bold' as const,
    3: 'medium' as const,
    4: 'medium' as const,
  };

  return createTextStyle(colors, {
    variant: 'primary',
    fontType: 'heading',
    weight: weights[level],
    size: sizes[level],
  });
};

// Animation presets
export const animationPresets = {
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  slideUp: {
    from: { translateY: 20, opacity: 0 },
    to: { translateY: 0, opacity: 1 },
  },
  scale: {
    from: { scale: 0.9, opacity: 0 },
    to: { scale: 1, opacity: 1 },
  },
} as const;
