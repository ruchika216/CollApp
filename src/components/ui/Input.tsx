import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  TextInputProps,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { SPACING, BORDER_RADIUS } from '../../theme/theme';
import { TYPOGRAPHY_STYLES } from '../../theme/theme';
import Icon, { IconName } from '../common/Icon';

interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string;
  leftIcon?: IconName;
  rightIcon?: IconName;
  containerStyle?: ViewStyle;
  inputStyle?: TextStyle;
  labelStyle?: TextStyle;
  errorStyle?: TextStyle;
  required?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  leftIcon,
  rightIcon,
  containerStyle,
  inputStyle,
  labelStyle,
  errorStyle,
  required = false,
  ...textInputProps
}) => {
  const { colors } = useTheme();
  const [isFocused, setIsFocused] = useState(false);

  const getContainerStyles = (): ViewStyle => ({
    marginBottom: spacing.md,
  });

  const getInputContainerStyles = (): ViewStyle => ({
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: borderRadius.md,
    backgroundColor: colors.input.background,
    borderColor: error
      ? colors.error
      : isFocused
      ? colors.input.borderFocus
      : colors.input.border,
    paddingHorizontal: spacing.md,
    minHeight: 48,
  });

  const getInputStyles = (): TextStyle => ({
    flex: 1,
    ...typography.body1,
    color: colors.text,
    paddingVertical: spacing.sm,
    paddingHorizontal: leftIcon || rightIcon ? spacing.sm : 0,
  });

  const getLabelStyles = (): TextStyle => ({
    ...typography.subtitle2,
    color: colors.text,
    marginBottom: spacing.xs,
  });

  const getErrorStyles = (): TextStyle => ({
    ...typography.caption,
    color: colors.error,
    marginTop: spacing.xs,
  });

  return (
    <View style={[getContainerStyles(), containerStyle]}>
      {label && (
        <Text style={[getLabelStyles(), labelStyle]}>
          {label}
          {required && <Text style={{ color: colors.error }}> *</Text>}
        </Text>
      )}
      
      <View style={getInputContainerStyles()}>
        {leftIcon && (
          <Icon
            name={leftIcon}
            size={20}
            tintColor={colors.textSecondary}
            style={{ marginRight: spacing.sm }}
          />
        )}
        
        <TextInput
          {...textInputProps}
          style={[getInputStyles(), inputStyle]}
          placeholderTextColor={colors.input.placeholder}
          onFocus={(e) => {
            setIsFocused(true);
            textInputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            textInputProps.onBlur?.(e);
          }}
        />
        
        {rightIcon && (
          <Icon
            name={rightIcon}
            size={20}
            tintColor={colors.textSecondary}
            style={{ marginLeft: spacing.sm }}
          />
        )}
      </View>
      
      {error && (
        <Text style={[getErrorStyles(), errorStyle]}>{error}</Text>
      )}
    </View>
  );
};

export default Input;