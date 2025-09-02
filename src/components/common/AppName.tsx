import React, { useMemo } from 'react';
import { Text, StyleSheet, View, Platform } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/useTheme';

interface AppNameProps {
  size?: 'small' | 'medium' | 'large' | 'extra-large';
  style?: any;
  variant?: 'gradient' | 'primary' | 'solid' | 'gradientText';
  uppercase?: boolean;
  yOffset?: number; // positive to nudge text slightly downward
}

// Platform-specific font names
const FONT_FAMILY = Platform.select({
  ios: 'DynaPuff-Bold', // Font family name on iOS
  android: 'DynaPuff-Bold', // Filename on Android
  default: 'DynaPuff-Bold',
});

const AppName: React.FC<AppNameProps> = ({
  size = 'medium',
  style,
  variant = 'gradient',
  uppercase = true,
  yOffset = 0,
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
    lineHeight: getFontSize(), // keeps text height tight to baseline
    // Remove fontWeight completely for custom fonts
    letterSpacing: 2,
    fontFamily: FONT_FAMILY,
    ...(Platform.OS === 'android'
      ? { textAlignVertical: 'center' as const }
      : {}),
  };

  const label = uppercase ? 'CollApp' : 'CollApp';

  // Avoid inline style literals in JSX; compute once
  const offsetStyle = useMemo(
    () => ({
      transform: [{ translateY: yOffset }],
    }),
    [yOffset],
  );

  // Rest of your component remains the same...
  if (variant === 'gradient') {
    return (
      <View style={[styles.gradientContainer, offsetStyle, style]}>
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0.8 }}
          style={styles.gradientBackground}
        >
          <Text style={[baseStyle, styles.gradientText, styles.gradientShadow]}>
            {label}
          </Text>
        </LinearGradient>
      </View>
    );
  } else if (variant === 'gradientText') {
    return (
      <MaskedView
        style={[styles.maskedContainer, offsetStyle, style]}
        maskElement={<Text style={[baseStyle, styles.maskText]}>{label}</Text>}
      >
        <LinearGradient
          colors={gradients.primary}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={[baseStyle, styles.hiddenText]}>{label}</Text>
        </LinearGradient>
      </MaskedView>
    );
  } else {
    return (
      <Text
        style={[
          baseStyle,
          variant === 'primary' ? styles.primaryTextShadow : styles.noShadow,
          { color: variant === 'primary' ? colors.primary : colors.text },
          offsetStyle,
          style,
        ]}
      >
        {label}
      </Text>
    );
  }
};

// Your existing styles remain the same...
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
  gradientShadow: {
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  maskedContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 1,
    flexGrow: 0,
    flexDirection: 'row',
  },
  maskText: {
    color: '#000',
    textAlign: 'center',
  },
  hiddenText: {
    opacity: 0,
  },
  // Removed flex:1 on gradient fill to keep it compact
  primaryTextShadow: {
    textShadowColor: 'rgba(106, 1, 246, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  noShadow: {
    textShadowColor: 'transparent',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 0,
  },
});

export default AppName;
