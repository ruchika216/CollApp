import { Platform, ViewStyle } from 'react-native';

/**
 * Platform-specific utilities for consistent cross-platform styling
 */

/**
 * Create platform-appropriate shadow styles
 * iOS uses shadow* properties, Android uses elevation
 */
export const createPlatformShadow = (
  elevation: number,
  color: string = '#000000',
  opacity: number = 0.1,
  radius?: number
): ViewStyle => {
  const shadowRadius = radius || Math.ceil(elevation * 0.8);
  const shadowOffset = Math.ceil(elevation * 0.5);

  return Platform.select({
    ios: {
      shadowColor: color,
      shadowOffset: {
        width: 0,
        height: shadowOffset,
      },
      shadowOpacity: opacity,
      shadowRadius: shadowRadius,
    },
    android: {
      elevation: elevation,
    },
    default: {
      // Web fallback
      boxShadow: `0 ${shadowOffset}px ${shadowRadius}px ${color}${Math.round(opacity * 255).toString(16)}`,
    },
  });
};

/**
 * Pre-defined shadow presets for common use cases
 */
export const shadows = {
  none: createPlatformShadow(0),
  sm: createPlatformShadow(2, '#000000', 0.05),
  md: createPlatformShadow(4, '#000000', 0.1),
  lg: createPlatformShadow(8, '#000000', 0.15),
  xl: createPlatformShadow(12, '#000000', 0.2),
  xxl: createPlatformShadow(16, '#000000', 0.25),
  
  // Colored shadows for special effects
  primary: createPlatformShadow(8, '#6a01f6', 0.3),
  success: createPlatformShadow(8, '#10b981', 0.3),
  warning: createPlatformShadow(8, '#f59e0b', 0.3),
  error: createPlatformShadow(8, '#ef4444', 0.3),
};

/**
 * Platform-specific spacing adjustments
 * iOS and Android have different visual density expectations
 */
export const getPlatformSpacing = (baseSpacing: number): number => {
  return Platform.select({
    ios: baseSpacing,
    android: baseSpacing * 1.1, // Slightly more spacing on Android
    default: baseSpacing,
  });
};

/**
 * Platform-specific hit slop for touchable elements
 * Ensures good touch targets on both platforms
 */
export const getHitSlop = (size: number = 8) => ({
  top: size,
  bottom: size,
  left: size,
  right: size,
});

/**
 * Platform-specific border radius adjustments
 */
export const getPlatformBorderRadius = (radius: number): number => {
  return Platform.select({
    ios: radius,
    android: radius * 0.8, // Slightly less rounded on Android
    default: radius,
  });
};

/**
 * Platform-specific font weight mapping
 */
export const getFontWeight = (weight: 'light' | 'normal' | 'medium' | 'semibold' | 'bold') => {
  const weightMap = {
    light: Platform.select({ ios: '300', android: '300', default: '300' }),
    normal: Platform.select({ ios: '400', android: 'normal', default: '400' }),
    medium: Platform.select({ ios: '500', android: '500', default: '500' }),
    semibold: Platform.select({ ios: '600', android: '600', default: '600' }),
    bold: Platform.select({ ios: '700', android: 'bold', default: '700' }),
  };

  return weightMap[weight];
};

/**
 * Platform-specific status bar configuration
 */
export const getStatusBarStyle = (isDark: boolean = false) => ({
  barStyle: Platform.select({
    ios: isDark ? 'light-content' : 'dark-content',
    android: isDark ? 'light-content' : 'dark-content',
    default: 'default',
  }) as 'default' | 'light-content' | 'dark-content',
  translucent: Platform.OS === 'android',
});

/**
 * Platform-specific safe area handling
 */
export const getSafeAreaStyle = () => Platform.select({
  ios: {
    paddingTop: 44, // iOS safe area top
  },
  android: {
    paddingTop: 24, // Android status bar height
  },
  default: {},
});

/**
 * Platform-specific keyboard avoiding behavior
 */
export const getKeyboardBehavior = () => Platform.select({
  ios: 'padding' as const,
  android: 'height' as const,
  default: 'height' as const,
});

/**
 * Platform-specific ripple effect for touchables
 */
export const getRippleConfig = (color: string = '#00000020') => Platform.select({
  android: {
    android_ripple: {
      color: color,
      borderless: false,
    },
  },
  default: {},
});

/**
 * Platform-specific modal presentation style
 */
export const getModalPresentationStyle = () => Platform.select({
  ios: 'pageSheet' as const,
  android: 'overFullScreen' as const,
  default: 'overFullScreen' as const,
});

/**
 * Check if current platform is iOS
 */
export const isIOS = Platform.OS === 'ios';

/**
 * Check if current platform is Android
 */
export const isAndroid = Platform.OS === 'android';

/**
 * Check if current platform is Web
 */
export const isWeb = Platform.OS === 'web';

/**
 * Get device type information
 */
export const getDeviceType = () => {
  // This would need react-native-device-info for full implementation
  return Platform.select({
    ios: 'ios',
    android: 'android',
    web: 'web',
    default: 'unknown',
  });
};