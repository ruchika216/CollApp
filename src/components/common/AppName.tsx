import React from 'react';
import { Text, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/useTheme';

// Import your custom font using expo-font or ensure it is linked via assets/fonts/DynaPuff-Regular.ttf

interface AppNameProps {
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  style?: any;
  variant?: 'gradient' | 'primary' | 'solid';
}

// Use your custom font name as loaded (usually 'DynaPuff-Regular')
const FONT_FAMILY = 'DynaPuff-Regular';

const AppName: React.FC<AppNameProps> = ({
  size = 'medium',
  style,
  variant = 'gradient',
}) => {
  const { colors, gradients } = useTheme();

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 20;
      case 'large':
        return 28;
      case 'extra-large':
        return 36;
      default:
        return 20;
    }
  };

  const baseStyle = {
    fontSize: getFontSize(),
    fontWeight: '700' as const,
    letterSpacing: -0.3, // Use consistent value for all platforms
    fontFamily: FONT_FAMILY, // Apply custom font here
  };

  if (variant === 'gradient') {
    return (
      <View style={[styles.gradientContainer, style]}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.8 }}
          style={styles.gradientBackground}
        >
          <Text
            style={[
              baseStyle,
              styles.gradientText,
              {
                textShadowColor: 'rgba(0, 0, 0, 0.25)',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              },
            ]}
          >
            CollAppee
          </Text>
        </LinearGradient>
      </View>
    );
  } else {
    return (
      <Text
        style={[
          baseStyle,
          {
            color: variant === 'primary' ? colors.primary : colors.text,
            textShadowColor:
              variant === 'primary' ? 'rgba(106, 1, 246, 0.3)' : 'transparent',
            textShadowOffset: { width: 0, height: 1 },
            textShadowRadius: variant === 'primary' ? 3 : 0,
          },
          style,
        ]}
      >
        CollApprr
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
