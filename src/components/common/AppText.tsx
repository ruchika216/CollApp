import React from 'react';
import { Text, TextProps, Platform } from 'react-native';
import { BRAND } from '../../theme/brand';

export type AppTextProps = TextProps & {
  weight?: 'regular' | 'bold';
};

export default function AppText({
  weight = 'regular',
  style,
  ...rest
}: AppTextProps) {
  const family = Platform.select({
    ios: weight === 'bold' ? BRAND.displayFont.bold : BRAND.displayFont.regular,
    android:
      weight === 'bold' ? BRAND.displayFont.bold : BRAND.displayFont.regular,
    default: undefined,
  });

  return <Text {...rest} style={[{ fontFamily: family }, style]} />;
}
