import React from 'react';
import {
  View,
  ViewStyle,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { SPACING, BORDER_RADIUS, ELEVATION } from '../../theme/theme';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: keyof typeof spacing;
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
      borderRadius: borderRadius.lg,
      padding: spacing[padding],
    };

    switch (variant) {
      case 'elevated':
        return {
          ...baseStyles,
          ...Platform.select({
            ios: {
              shadowColor: colors.shadow,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
            },
            android: {
              elevation: elevation.md,
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