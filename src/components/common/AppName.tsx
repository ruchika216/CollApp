import React from 'react';
import { Text, StyleSheet, Platform, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/useTheme';

interface AppNameProps {
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  style?: any;
  variant?: 'gradient' | 'primary' | 'solid';
}

const AppName: React.FC<AppNameProps> = ({ 
  size = 'medium', 
  style,
  variant = 'gradient' 
}) => {
  const { colors, gradients } = useTheme();

  const getFontSize = () => {
    switch (size) {
      case 'small': return 16;
      case 'medium': return 20;
      case 'large': return 28;
      case 'extra-large': return 36;
      default: return 20;
    }
  };

  const baseStyle = {
    fontSize: getFontSize(),
    fontWeight: '700' as const,
    letterSpacing: Platform.OS === 'ios' ? -0.5 : -0.3,
  };

  if (variant === 'gradient') {
    // Gradient background with enhanced styling
    return (
      <View style={[styles.gradientContainer, style]}>
        <LinearGradient
          colors={gradients.appName}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.8 }}
          style={styles.gradientBackground}
        >
          <Text style={[
            baseStyle,
            styles.gradientText,
            {
              textShadowColor: 'rgba(0, 0, 0, 0.25)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 2,
            }
          ]}>
            CollApp
          </Text>
        </LinearGradient>
      </View>
    );
  } else {
    // Solid color variant with enhanced styling
    return (
      <Text style={[
        baseStyle,
        {
          color: variant === 'primary' ? colors.primary : colors.text,
          textShadowColor: variant === 'primary' ? 'rgba(106, 1, 246, 0.3)' : 'transparent',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: variant === 'primary' ? 3 : 0,
        },
        style
      ]}>
        CollApp
      </Text>
    );
  }
};

const styles = StyleSheet.create({
  gradientContainer: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  gradientBackground: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientText: {
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default AppName;