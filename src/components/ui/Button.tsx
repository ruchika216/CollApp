import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/useTheme';
import { SPACING, BORDER_RADIUS } from '../../theme/theme';
import { TYPOGRAPHY_STYLES } from '../../theme/theme';
import Icon, { IconName } from '../common/Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
  fullWidth = false,
}) => {
  const { colors, isDark } = useTheme();

  const getButtonStyles = (): ViewStyle => {
    const baseStyles: ViewStyle = {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: borderRadius.md,
      ...getPaddingForSize(),
      ...(fullWidth && { width: '100%' }),
    };

    switch (variant) {
      case 'primary':
        return {
          ...baseStyles,
          backgroundColor: colors.primary,
        };
      case 'secondary':
        return {
          ...baseStyles,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'outline':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.primary,
        };
      case 'text':
        return {
          ...baseStyles,
          backgroundColor: 'transparent',
        };
      case 'danger':
        return {
          ...baseStyles,
          backgroundColor: colors.error,
        };
      default:
        return baseStyles;
    }
  };

  const getTextStyles = (): TextStyle => {
    const baseStyles: TextStyle = {
      ...typography.button,
      ...getFontSizeForSize(),
    };

    switch (variant) {
      case 'primary':
      case 'danger':
        return {
          ...baseStyles,
          color: colors.textOnPrimary,
        };
      case 'secondary':
        return {
          ...baseStyles,
          color: colors.text,
        };
      case 'outline':
      case 'text':
        return {
          ...baseStyles,
          color: colors.primary,
        };
      default:
        return baseStyles;
    }
  };

  const getPaddingForSize = (): ViewStyle => {
    switch (size) {
      case 'small':
        return { paddingHorizontal: spacing.md, paddingVertical: spacing.sm };
      case 'medium':
        return { paddingHorizontal: spacing.lg, paddingVertical: spacing.md };
      case 'large':
        return { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg };
      default:
        return { paddingHorizontal: spacing.lg, paddingVertical: spacing.md };
    }
  };

  const getFontSizeForSize = (): TextStyle => {
    switch (size) {
      case 'small':
        return { fontSize: 12 };
      case 'medium':
        return { fontSize: 14 };
      case 'large':
        return { fontSize: 16 };
      default:
        return { fontSize: 14 };
    }
  };

  const getIconSize = (): number => {
    switch (size) {
      case 'small':
        return 16;
      case 'medium':
        return 18;
      case 'large':
        return 20;
      default:
        return 18;
    }
  };

  const buttonStyles = getButtonStyles();
  const textStyles = getTextStyles();
  const iconSize = getIconSize();

  const opacity = disabled || loading ? 0.5 : 1;

  const renderContent = () => (
    <>
      {loading && (
        <ActivityIndicator
          size="small"
          color={textStyles.color}
          style={{ marginRight: spacing.sm }}
        />
      )}
      {icon && iconPosition === 'left' && !loading && (
        <Icon
          name={icon}
          size={iconSize}
          tintColor={textStyles.color as string}
          style={{ marginRight: spacing.sm }}
        />
      )}
      <Text style={[textStyles, textStyle]}>{title}</Text>
      {icon && iconPosition === 'right' && !loading && (
        <Icon
          name={icon}
          size={iconSize}
          tintColor={textStyles.color as string}
          style={{ marginLeft: spacing.sm }}
        />
      )}
    </>
  );

  if (variant === 'primary' && !disabled) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        style={[{ opacity }, style]}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={buttonStyles}
        >
          {renderContent()}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[buttonStyles, { opacity }, style]}
      activeOpacity={0.8}
    >
      {renderContent()}
    </TouchableOpacity>
  );
};

export default Button;