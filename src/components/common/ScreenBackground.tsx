import React from 'react';
import { StatusBar, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useThemeWithFallbacks } from '../../hooks/useThemeWithFallbacks';
import { getStatusBarStyle } from '../../utils/platformUtils';

/**
 * Props for ScreenBackground component
 */
interface ScreenBackgroundProps {
  children: React.ReactNode;
  gradientType?: 'background' | 'primary' | 'secondary' | 'card' | 'custom';
  customGradient?: string[];
  gradientDirection?: {
    start: { x: number; y: number };
    end: { x: number; y: number };
  };
  statusBarVariant?: 'auto' | 'light' | 'dark';
  style?: ViewStyle;
  showStatusBar?: boolean;
}

/**
 * Reusable screen background component with gradient and status bar management
 * Eliminates the need to repeat LinearGradient + StatusBar setup in every screen
 */
export const ScreenBackground: React.FC<ScreenBackgroundProps> = ({
  children,
  gradientType = 'background',
  customGradient,
  gradientDirection = { start: { x: 0, y: 0 }, end: { x: 1, y: 1 } },
  statusBarVariant = 'auto',
  style,
  showStatusBar = true,
}) => {
  const { colors, isDark } = useThemeWithFallbacks();

  // Get gradient colors based on type
  const getGradientColors = (): string[] => {
    if (customGradient) return customGradient;

    const gradients = colors.gradients;
    
    switch (gradientType) {
      case 'primary':
        return gradients?.primary || ['#6a01f6', '#7d1aff'];
      case 'secondary':
        return gradients?.secondary || ['#8b5cf6', '#a855f7'];
      case 'card':
        return gradients?.card || ['#ffffff', '#f9fafb'];
      case 'background':
      default:
        return gradients?.background || ['#ffffff', '#f8fafc'];
    }
  };

  // Determine status bar style
  const getStatusBar = () => {
    switch (statusBarVariant) {
      case 'light':
        return 'light-content';
      case 'dark':
        return 'dark-content';
      case 'auto':
      default:
        return isDark ? 'light-content' : 'dark-content';
    }
  };

  const gradientColors = getGradientColors();
  const statusBarStyle = getStatusBarStyle(statusBarVariant === 'light');

  return (
    <LinearGradient
      colors={gradientColors}
      start={gradientDirection.start}
      end={gradientDirection.end}
      style={[{ flex: 1 }, style]}
    >
      {showStatusBar && (
        <StatusBar
          barStyle={statusBarStyle.barStyle}
          backgroundColor={gradientColors[0]}
          translucent={statusBarStyle.translucent}
        />
      )}
      {children}
    </LinearGradient>
  );
};

/**
 * Preset screen background variants for common use cases
 */
export const ScreenBackgrounds = {
  Default: (props: Omit<ScreenBackgroundProps, 'gradientType'>) => (
    <ScreenBackground {...props} gradientType="background" />
  ),
  
  Primary: (props: Omit<ScreenBackgroundProps, 'gradientType'>) => (
    <ScreenBackground {...props} gradientType="primary" />
  ),
  
  Card: (props: Omit<ScreenBackgroundProps, 'gradientType'>) => (
    <ScreenBackground {...props} gradientType="card" />
  ),
  
  Auth: (props: Omit<ScreenBackgroundProps, 'gradientType' | 'gradientDirection'>) => (
    <ScreenBackground 
      {...props} 
      gradientType="background"
      gradientDirection={{ start: { x: 0, y: 0 }, end: { x: 1, y: 1 } }}
    />
  ),
};

export default ScreenBackground;