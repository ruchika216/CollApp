// =====================================================================================
// CONSTANTS INDEX - CONSOLIDATED THEME CONSTANTS
// =====================================================================================

// Color constants
export * from './colors';
export type { ThemeColors, ColorKey } from './colors';

// Typography constants
export * from './typography';
export type { FontFamily, FontSize, FontWeight, LineHeight } from './typography';

// Spacing constants
export * from './spacing';
export type { SpacingSize, BorderRadiusSize, ElevationLevel, IconSize, AnimationDuration } from './spacing';

// Re-export main constants for backwards compatibility
export {
  BRAND_COLORS,
  SEMANTIC_COLORS,
  STATUS_COLORS,
  PRIORITY_COLORS,
  LIGHT_THEME_COLORS,
  DARK_THEME_COLORS,
} from './colors';

export {
  FONT_FAMILIES,
  FONT_SIZES,
  FONT_WEIGHTS,
  LINE_HEIGHTS,
  TYPOGRAPHY_STYLES,
  TYPOGRAPHY,
} from './typography';

export {
  SPACING,
  BORDER_RADIUS,
  ELEVATION,
  SHADOWS,
  HIT_SLOP,
  LAYOUT,
  ICON_SIZES,
  ANIMATION_DURATIONS,
} from './spacing';