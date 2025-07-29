// import { Dimensions } from 'react-native';
// const { width } = Dimensions.get('window');

// Brand Colors
export const BRAND = {
  primary: '#4423a9',
  secondary: '#5845b7',
  accent: '#6445f6',
  highlight: '#68b0cb',
  gradient: {
    start: '#4356af',
    middle1: '#68b0cb',
    middle2: '#0b32e8',
    end: '#6445f6',
  },
};

// Full Theme Object
export const theme = {
  light: {
    colors: {
      primary: BRAND.primary,
      secondary: BRAND.secondary,
      accent: BRAND.accent,

      background: '#ffffff',
      surface: '#ffffff',
      card: '#ffffff',
      modal: '#ffffff',

      text: '#191919',
      subtext: '#666666',
      caption: '#888888',

      border: '#e4eaf5',
      divider: '#f0f0f0',
      disabled: '#cccccc',
      placeholder: '#999999',

      success: '#4CAF50',
      warning: '#FF9800',
      error: '#f44336',
      info: BRAND.highlight,

      buttonPrimary: BRAND.primary,
      buttonSecondary: BRAND.secondary,
      buttonAccent: BRAND.accent,
      buttonText: '#ffffff',

      iconPrimary: BRAND.primary,
      iconSecondary: '#666666',
      iconInactive: '#B0B0B0',

      gradients: {
        background: ['#ffffff', '#ede1ff'],
        primary: [BRAND.gradient.start, BRAND.gradient.end],
        accent: [BRAND.gradient.middle1, BRAND.gradient.middle2],
        button: ['#4356af', '#68b0cb', '#0b32e8', '#6445f6'],
      },
    },

    shadow: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 5,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 7,
      },
    },
  },

  dark: {
    colors: {
      primary: '#5845b7',
      secondary: '#4423a9',
      accent: '#68b0cb',

      background: '#121212',
      surface: '#1E1E1E',
      card: '#242424',
      modal: '#2A2A2A',

      text: '#ffffff',
      subtext: '#cccccc',
      caption: '#999999',

      border: '#333333',
      divider: '#2A2A2A',
      disabled: '#666666',
      placeholder: '#777777',

      success: '#45B880',
      warning: '#FF9800',
      error: '#FF5252',
      info: '#68b0cb',

      buttonPrimary: '#5845b7',
      buttonSecondary: '#4423a9',
      buttonAccent: '#68b0cb',
      buttonText: '#ffffff',

      iconPrimary: '#68b0cb',
      iconSecondary: '#cccccc',
      iconInactive: '#666666',

      gradients: {
        background: ['#121212', '#1a1625'],
        primary: ['#4423a9', '#5845b7'],
        accent: ['#68b0cb', '#4356af'],
        button: ['#5845b7', '#4423a9'],
      },
    },

    shadow: {
      small: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 3,
      },
      medium: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 5,
      },
      large: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 7,
      },
    },
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },

  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
  },

  fonts: {
    regular: 'DynaPuff-Regular',
    bold: 'DynaPuff-Bold',
    sizes: {
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      xxl: 24,
      title: 32,
    },
  },

  animation: {
    fast: 200,
    normal: 300,
    slow: 500,
  },
};

// === Type Exports ===
export type Theme = typeof theme.light;
export type ThemeType = 'light' | 'dark';

// === Named Exports for Easy Component Use ===
export const COLORS = theme.light.colors;
export const FONTS = theme.fonts;
export const SPACING = theme.spacing;
export const BORDER_RADIUS = theme.borderRadius;
export const ANIMATION = theme.animation;

// === Icons Sizes ===
export const ICON_SIZES = {
  tiny: 16,
  small: 20,
  medium: 24,
  large: 32,
  xlarge: 48,
};

// === Button Presets ===
export const BUTTON_PRESETS = {
  primary: {
    gradient: true,
    colors: theme.light.colors.gradients.button,
    textColor: theme.light.colors.buttonText,
  },
  secondary: {
    gradient: false,
    backgroundColor: theme.light.colors.buttonSecondary,
    textColor: theme.light.colors.buttonText,
  },
  outline: {
    gradient: false,
    backgroundColor: 'transparent',
    borderColor: theme.light.colors.buttonPrimary,
    textColor: theme.light.colors.buttonPrimary,
  },
};
