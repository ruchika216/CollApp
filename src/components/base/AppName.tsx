import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export const AppName: React.FC<{ size?: number }> = ({ size = 28 }) => {
  const { colors } = useTheme();
  return (
    <Text
      style={[
        styles.text,
        { color: colors?.primary || '#6a01f6', fontSize: size },
      ]}
    >
      CollApp
    </Text>
  );
};

const styles = StyleSheet.create({
  text: { fontWeight: '800', letterSpacing: 0.5 },
});

export default AppName;
