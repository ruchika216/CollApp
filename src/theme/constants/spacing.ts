import { Platform } from 'react-native';

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
// TYPES
// =====================================================================================
export type SpacingSize = keyof typeof SPACING;
export type BorderRadiusSize = keyof typeof BORDER_RADIUS;
export type ElevationLevel = keyof typeof ELEVATION;
export type IconSize = keyof typeof ICON_SIZES;
export type AnimationDuration = keyof typeof ANIMATION_DURATIONS;