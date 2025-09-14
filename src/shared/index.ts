/**
 * Centralized exports for all utility functions
 * Import from this file for cleaner imports across the app
 */

// Font utilities
export {
  getFontFamily,
  getFontWeight,
  getLetterSpacing,
  createFontStyle,
  fontStyles,
  type FontWeight,
} from './fontUtils';

// Platform utilities
export {
  createPlatformShadow,
  shadows,
  getPlatformSpacing,
  getHitSlop,
  getPlatformBorderRadius,
  getFontWeight as getPlatformFontWeight,
  getStatusBarStyle,
  getSafeAreaStyle,
  getKeyboardBehavior,
  getRippleConfig,
  getModalPresentationStyle,
  isIOS,
  isAndroid,
  isWeb,
  getDeviceType,
} from './platformUtils';

// Typography utilities
export {
  createTypographyStyle,
  useTypographyStyles,
  textStylePresets,
  createResponsiveTextStyle,
  textTruncation,
  type TypographyStyleOptions,
} from './typographyUtils';

// Re-export theme hook for convenience
export { useTheme, safeThemeAccess } from '../theme/useTheme';