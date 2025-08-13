export const lightTheme = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  primaryLight: '#3b82f6',
  secondary: '#7c3aed',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',

  // background: '#ffffff',
  background: ['#ede1ff', '#d9c8ff'], // or your iOS-like colors
  surface: '#f8fafc',
  surfaceVariant: '#f1f5f9',

  text: '#1e293b',
  textSecondary: '#64748b',
  textLight: '#94a3b8',
  textOnPrimary: '#ffffff',

  border: '#e2e8f0',
  borderLight: '#f1f5f9',
  divider: '#e2e8f0',

  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.5)',

  card: '#ffffff',
  cardShadow: 'rgba(0, 0, 0, 0.1)',

  input: {
    background: '#ffffff',
    border: '#d1d5db',
    borderFocus: '#2563eb',
    placeholder: '#9ca3af',
  },

  status: {
    pending: '#f59e0b',
    development: '#3b82f6',
    done: '#22c55e',
    deployment: '#8b5cf6',
    bug: '#ef4444',
  },

  priority: {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#ef4444',
    urgent: '#dc2626',
  },
};

export const darkTheme = {
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  primaryLight: '#60a5fa',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#06b6d4',

  background: '#0f172a',
  surface: '#1e293b',
  surfaceVariant: '#334155',

  text: '#f8fafc',
  textSecondary: '#cbd5e1',
  textLight: '#94a3b8',
  textOnPrimary: '#ffffff',

  border: '#475569',
  borderLight: '#64748b',
  divider: '#475569',

  shadow: '#000000',
  overlay: 'rgba(0, 0, 0, 0.7)',

  card: '#1e293b',
  cardShadow: 'rgba(0, 0, 0, 0.3)',

  input: {
    background: '#334155',
    border: '#475569',
    borderFocus: '#3b82f6',
    placeholder: '#94a3b8',
  },

  status: {
    pending: '#f59e0b',
    development: '#3b82f6',
    done: '#10b981',
    deployment: '#8b5cf6',
    bug: '#ef4444',
  },

  priority: {
    low: '#10b981',
    medium: '#f59e0b',
    high: '#ef4444',
    urgent: '#dc2626',
  },
};

export type Theme = typeof lightTheme;
export type ThemeMode = 'light' | 'dark';

export const themes = {
  light: lightTheme,
  dark: darkTheme,
};
