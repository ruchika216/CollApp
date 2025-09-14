import React from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from './Icon';
import { useTheme } from '../../theme/useTheme';

interface Props {
  onPress: () => void;
  style?: ViewStyle;
}

const FloatingActionButton: React.FC<Props> = ({ onPress, style }) => {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.fab, style]}
      accessibilityRole="button"
      accessibilityLabel="Create task"
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryDark || colors.primary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.grad}
      >
        <Icon name="add" size={20} tintColor="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
    elevation: 6,
  },
  grad: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FloatingActionButton;
