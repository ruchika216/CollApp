import React from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useTheme } from './useTheme';

// Small, reusable theme toggle. You can place it in any header.
// It respects the centralized theme and only flips the redux theme mode.
const ThemeToggle: React.FC<{ label?: boolean }> = ({ label = false }) => {
  const { isDark, toggleTheme, colors } = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Toggle theme"
      onPress={toggleTheme}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: isDark
            ? 'rgba(18,28,46,0.6)'
            : 'rgba(255,255,255,0.7)',
          borderColor: isDark ? 'rgba(47,69,112,0.6)' : 'rgba(214,227,255,0.7)',
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.knob,
          isDark ? styles.knobDark : styles.knobLight,
          { backgroundColor: colors.primary },
        ]}
      />
      {label && (
        <Text
          style={[styles.text, isDark ? styles.textDark : styles.textLight]}
        >
          {isDark ? 'Dark' : 'Light'}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 44,
    height: 26,
    borderRadius: 9999,
    borderWidth: StyleSheet.hairlineWidth,
    justifyContent: 'center',
  },
  knob: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  knobLight: { left: 2 },
  knobDark: { left: 22 },
  text: {
    marginLeft: 52,
    fontSize: 12,
  },
  textLight: { color: '#0F172A' },
  textDark: { color: '#E6F0FF' },
});

export default ThemeToggle;
