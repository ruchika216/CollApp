import React from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme, SPACING, BORDER_RADIUS, ELEVATION } from '../../theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof SPACING;
  disabled?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  style,
  onPress,
  variant = 'default',
  padding = 'md',
  disabled = false,
}) => {
  const { colors } = useTheme();

  const getCardStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      backgroundColor: colors.card,
      borderRadius: BORDER_RADIUS.lg,
      padding: SPACING[padding],
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyles,
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            },
            android: {
              elevation: ELEVATION.md,
            },
          }),
        };
      case 'outlined':
        return {
          ...baseStyles,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'default':
      default:
        return baseStyles;
    }
  };

  const cardStyles = getCardStyles();

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        style={[cardStyles, style, disabled && { opacity: 0.5 }]}
        activeOpacity={0.8}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[cardStyles, style]}>
      {children}
    </View>
  );
};

export default Card;