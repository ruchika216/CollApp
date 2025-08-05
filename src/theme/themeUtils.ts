import { TextStyle, ViewStyle } from 'react-native';
import { Theme, ThemeColors } from './themeConfig';

// Utility functions for theme-based styles
export const createThemedStyles = <T extends Record<string, ViewStyle | TextStyle>>(
  styleFactory: (theme: Theme) => T
) => styleFactory;

// Color utilities
export const withOpacity = (color: string, opacity: number): string => {
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
    return `#${hex}${alpha}`;
  }
  return color;
};

export const lightenColor = (color: string, amount: number): string => {
  const hex = color.replace('#', '');
  const num = parseInt(hex, 16);
  const amt = Math.round(2.55 * amount);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
};

export const darkenColor = (color: string, amount: number): string => {
  return lightenColor(color, -amount);
};

// Status color helpers
export const getStatusColor = (status: string, colors: ThemeColors): string => {
  const statusMap: Record<string, keyof ThemeColors> = {
    'pending': 'warning',
    'development': 'primary',
    'review': 'info',
    'testing': 'secondary',
    'done': 'success',
    'deployment': 'accent',
    'fixing bug': 'error',
    'completed': 'success',
    'active': 'primary',
    'inactive': 'disabled',
  };
  
  const statusKey = statusMap[status.toLowerCase()];
  return statusKey ? colors[statusKey] as string : colors.disabled as string;
};

// Priority color helpers
export const getPriorityColor = (priority: string, colors: ThemeColors): string => {
  const priorityMap: Record<string, keyof ThemeColors> = {
    'critical': 'error',
    'high': 'warning', 
    'medium': 'info',
    'low': 'success',
    'urgent': 'error',
  };
  
  const priorityKey = priorityMap[priority.toLowerCase()];
  return priorityKey ? colors[priorityKey] as string : colors.disabled as string;
};

// Shadow utilities
export const createShadow = (
  elevation: number,
  color: string = '#000',
  opacity: number = 0.1
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

// Responsive text size based on theme
export const getResponsiveSize = (baseSize: number, theme: Theme): number => {
  // You can add responsive logic here based on screen size
  return baseSize;
};

// Theme-aware style creators
export const createCardStyle = (colors: ThemeColors) => ({
  backgroundColor: colors.card,
  borderRadius: 12,
  padding: 16,
  ...createShadow(2, colors.text as string, 0.1),
});

export const createButtonStyle = (colors: ThemeColors, variant: 'primary' | 'secondary' | 'outline' = 'primary') => {
  const baseStyle = {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
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

export const createInputStyle = (colors: ThemeColors) => ({
  backgroundColor: colors.surface,
  borderWidth: 1,
  borderColor: colors.border,
  borderRadius: 8,
  paddingHorizontal: 16,
  paddingVertical: 12,
  fontSize: 16,
  color: colors.text,
  minHeight: 48,
});

// Text style creators
export const createTextStyle = (colors: ThemeColors, variant: 'primary' | 'secondary' | 'light' = 'primary') => {
  switch (variant) {
    case 'primary':
      return { color: colors.text };
    case 'secondary':
      return { color: colors.textSecondary };
    case 'light':
      return { color: colors.textLight };
    default:
      return { color: colors.text };
  }
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
};

export default {
  createThemedStyles,
  withOpacity,
  lightenColor,
  darkenColor,
  getStatusColor,
  getPriorityColor,
  createShadow,
  getResponsiveSize,
  createCardStyle,
  createButtonStyle,
  createInputStyle,
  createTextStyle,
  animationPresets,
};