// Core exports
export * from './theme';
export { default as themes } from './theme';
export {
  useTheme,
  safeThemeAccess,
  DEFAULT_COLORS,
  DEFAULT_TYPOGRAPHY,
  DEFAULT_SPACING,
  DEFAULT_BREAKPOINTS,
} from './useTheme';
export { ThemeProvider, useThemeContext } from './ThemeProvider';
export { default as ThemeToggle } from './ThemeToggle';
export * from './themeUtils';
export { default as icons } from './icons';

// Type exports
export type {
  ThemeMode,
  Theme,
  ThemeColors,
  IconSize,
  FontFamily,
  FontSize,
  SpacingSize,
} from './theme';
