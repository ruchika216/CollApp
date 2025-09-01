// Note: Platform import removed; not used in this file

// =====================================================================================
// BRAND COLORS
// =====================================================================================
export const BRAND_COLORS = {
  primary: '#6a01f6',
  primaryDark: '#5a00d6',
  primaryLight: '#7d1aff',
  secondary: '#9945ff',
  accent: '#8b5cf6',
} as const;

// =====================================================================================
// SEMANTIC COLORS
// =====================================================================================
export const SEMANTIC_COLORS = {
  success: '#10b981',
  successLight: '#6ee7b7',
  successDark: '#065f46',
  warning: '#f59e0b',
  warningLight: '#fbbf24',
  warningDark: '#92400e',
  error: '#ef4444',
  errorLight: '#fca5a5',
  errorDark: '#991b1b',
  info: '#06b6d4',
  infoLight: '#67e8f9',
  infoDark: '#0e7490',
} as const;

// =====================================================================================
// STATUS & PRIORITY COLORS
// =====================================================================================
export const STATUS_COLORS = {
  pending: SEMANTIC_COLORS.warning,
  development: BRAND_COLORS.primary,
  done: SEMANTIC_COLORS.success,
  deployment: BRAND_COLORS.secondary,
  bug: SEMANTIC_COLORS.error,
} as const;

export const PRIORITY_COLORS = {
  low: SEMANTIC_COLORS.success,
  medium: SEMANTIC_COLORS.warning,
  high: SEMANTIC_COLORS.error,
  urgent: SEMANTIC_COLORS.errorDark,
} as const;

// =====================================================================================
// LIGHT THEME COLORS
// =====================================================================================
export const LIGHT_THEME_COLORS = {
  // Brand colors
  primary: BRAND_COLORS.primary,
  primaryDark: BRAND_COLORS.primaryDark,
  primaryLight: BRAND_COLORS.primaryLight,
  secondary: BRAND_COLORS.secondary,
  accent: BRAND_COLORS.accent,

  // Semantic colors
  success: SEMANTIC_COLORS.success,
  successLight: SEMANTIC_COLORS.successLight,
  successDark: SEMANTIC_COLORS.successDark,
  warning: SEMANTIC_COLORS.warning,
  warningLight: SEMANTIC_COLORS.warningLight,
  warningDark: SEMANTIC_COLORS.warningDark,
  error: SEMANTIC_COLORS.error,
  errorLight: SEMANTIC_COLORS.errorLight,
  errorDark: SEMANTIC_COLORS.errorDark,
  info: SEMANTIC_COLORS.info,
  infoLight: SEMANTIC_COLORS.infoLight,
  infoDark: SEMANTIC_COLORS.infoDark,

  // Background colors
  background: '#ffffff',
  surface: '#f8fafc',
  surfaceVariant: '#f1f5f9',
  card: '#ffffff',
  modal: '#ffffff',

  // Text colors
  text: '#1e293b',
  textSecondary: '#64748b',
  textLight: '#94a3b8',
  textOnPrimary: '#ffffff',

  // Border colors
  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  divider: '#e2e8f0',

  // Interactive colors
  disabled: '#d1d5db',
  placeholder: '#9ca3af',

  // Icon colors
  iconPrimary: BRAND_COLORS.primary,
  iconSecondary: '#64748b',
  iconInactive: '#94a3b8',

  // Status colors
  status: STATUS_COLORS,
  priority: PRIORITY_COLORS,

  // Input colors
  input: {
    background: '#ffffff',
    border: '#d1d5db',
    borderFocus: BRAND_COLORS.primary,
    placeholder: '#9ca3af',
  },

  // Gradients
  gradients: {
    primary: [BRAND_COLORS.primary, BRAND_COLORS.primaryLight] as string[],
    secondary: [BRAND_COLORS.secondary, BRAND_COLORS.accent] as string[],
    background: ['#ede1ff', '#d9c8ff'] as string[], // iOS-like colors
    card: ['#ffffff', '#f8fafc'] as string[],
    overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)'] as string[],
  },
} as const;

// =====================================================================================
// DARK THEME COLORS
// =====================================================================================
export const DARK_THEME_COLORS = {
  // Brand colors
  primary: BRAND_COLORS.primaryLight,
  primaryDark: BRAND_COLORS.primary,
  primaryLight: BRAND_COLORS.primaryLight,
  secondary: BRAND_COLORS.secondary,
  accent: BRAND_COLORS.accent,

  // Semantic colors
  success: SEMANTIC_COLORS.success,
  successLight: SEMANTIC_COLORS.successLight,
  successDark: SEMANTIC_COLORS.successDark,
  warning: SEMANTIC_COLORS.warning,
  warningLight: SEMANTIC_COLORS.warningLight,
  warningDark: SEMANTIC_COLORS.warningDark,
  error: SEMANTIC_COLORS.error,
  errorLight: SEMANTIC_COLORS.errorLight,
  errorDark: SEMANTIC_COLORS.errorDark,
  info: SEMANTIC_COLORS.info,
  infoLight: SEMANTIC_COLORS.infoLight,
  infoDark: SEMANTIC_COLORS.infoDark,

  // Background colors
  background: '#0f172a',
  surface: '#1e293b',
  surfaceVariant: '#334155',
  card: '#1e293b',
  modal: '#334155',

  // Text colors
  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textLight: '#94a3b8',
  textOnPrimary: '#ffffff',

  // Border colors
  border: '#475569',
  borderLight: '#64748b',
  divider: '#475569',

  // Interactive colors
  disabled: '#64748b',
  placeholder: '#94a3b8',

  // Icon colors
  iconPrimary: BRAND_COLORS.primaryLight,
  iconSecondary: '#cbd5e1',
  iconInactive: '#64748b',

  // Status colors
  status: STATUS_COLORS,
  priority: PRIORITY_COLORS,

  // Input colors
  input: {
    background: '#334155',
    border: '#475569',
    borderFocus: BRAND_COLORS.primaryLight,
    placeholder: '#94a3b8',
  },

  // Gradients
  gradients: {
    primary: [BRAND_COLORS.primaryLight, BRAND_COLORS.primary] as string[],
    secondary: [BRAND_COLORS.secondary, BRAND_COLORS.accent] as string[],
    background: ['#0f172a', '#1e293b'] as string[],
    card: ['#1e293b', '#334155'] as string[],
    overlay: ['rgba(0,0,0,0)', 'rgba(0,0,0,0.8)'] as string[],
  },
} as const;

// =====================================================================================
// TYPES
// =====================================================================================
export type ThemeColors = typeof LIGHT_THEME_COLORS;
export type ColorKey = keyof ThemeColors;
