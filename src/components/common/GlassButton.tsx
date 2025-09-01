import React, { useMemo } from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  GestureResponderEvent,
  ViewStyle,
  TextStyle,
  StyleProp,
} from 'react-native';
import { useTheme } from '../../theme';

export type Variant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'destructive';

export interface GlassButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: Variant;
  disabled?: boolean;
}

export default function GlassButton({
  title,
  onPress,
  style,
  textStyle,
  variant = 'primary',
  disabled = false,
}: GlassButtonProps) {
  const { borderRadius, typography, getButtonColors } = useTheme();
  const palette = useMemo(
    () => getButtonColors(variant) || getButtonColors('primary'),
    [getButtonColors, variant],
  ) as any;
  const radius = (borderRadius?.['2xl'] as number) ?? 24;

  const containerStyle = useMemo(
    () => ({
      backgroundColor: disabled ? palette.disabledBg : palette.background,
      borderColor:
        variant === 'outline' ? palette.border || palette.text : 'transparent',
      borderWidth: variant === 'outline' ? StyleSheet.hairlineWidth + 0.5 : 0,
      borderRadius: radius + 4,
      opacity: disabled ? 0.85 : 1,
    }),
    [disabled, palette, radius, variant],
  );

  const textDynamicStyle = useMemo(
    () => ({
      color: disabled ? palette.disabledText : palette.text,
      fontFamily: (typography?.styles?.button?.fontFamily as any) ?? undefined,
      fontSize: (typography?.styles?.button?.fontSize as number) || 16,
      fontWeight: (typography?.styles?.button?.fontWeight as any) ?? undefined,
      letterSpacing:
        (typography?.styles?.button?.letterSpacing as number) ?? 0.3,
    }),
    [disabled, palette, typography?.styles?.button],
  );

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={title}
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[styles.button, containerStyle, style]}
    >
      <Text style={[styles.label, textDynamicStyle, textStyle]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    width: '92%',
    marginTop: 16,
    ...Platform.select({
      ios: {
        shadowColor: 'rgba(0, 0, 0, 0.06)',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.12,
        shadowRadius: 10,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  label: {
    fontSize: 16,
    fontWeight: Platform.OS === 'ios' ? '600' : '700',
  },
});
