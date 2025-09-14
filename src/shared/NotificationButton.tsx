import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { useAppSelector } from '../../store/hooks';
import { useTheme } from '../../theme/useTheme';
import Icon from './Icon';

interface NotificationButtonProps {
  onPress: () => void;
  size?: number;
  tintColor?: string;
}

const NotificationButton: React.FC<NotificationButtonProps> = ({
  onPress,
  size = 20,
  tintColor = '#fff',
}) => {
  const { colors } = useTheme();
  const unreadCount = useAppSelector(state => state.notifications.unreadCount);
  const showBadge = unreadCount > 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <Icon name="notification" size={size} tintColor={tintColor} />
      
      {showBadge && (
        <View style={[styles.badge, { backgroundColor: colors.error }]}>
          {unreadCount > 99 ? (
            <Text style={styles.badgeText}>99+</Text>
          ) : (
            <Text style={styles.badgeText}>{unreadCount}</Text>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: Platform.OS === 'ios' ? 36 : 44,
    height: Platform.OS === 'ios' ? 36 : 44,
    borderRadius: Platform.OS === 'ios' ? 18 : 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
    }),
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: '#fff',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 14,
  },
});

export default NotificationButton;