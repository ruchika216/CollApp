// Re-export everything from the centralized theme config
export * from './themeConfig';
export { default as themes } from './themeConfig';
export { useTheme } from './useTheme';
export { ThemeProvider } from './ThemeProvider';
export * from './themeUtils';

// For backward compatibility, export commonly used items
export { SPACING as spacing } from './themeConfig';
export { BORDER_RADIUS as borderRadius } from './themeConfig';
export { ICON_SIZES } from './themeConfig';
export { TYPOGRAPHY } from './themeConfig';

// Legacy exports for backward compatibility
export const COLORS = {
  // Brand colors
  primary: '#6a01f6',
  primaryDark: '#5a00d6',
  primaryLight: '#7d1aff',
  secondary: '#9945ff',
  accent: '#8b5cf6',
  
  // Semantic colors
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',
  
  // Light theme colors for default export
  background: '#ffffff',
  surface: '#fafafa',
  text: '#1e293b',
  textSecondary: '#64748b',
  border: '#e2e8f0',
  card: '#ffffff',
} as const;

export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System',
} as const;