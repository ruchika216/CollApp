import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import Icon from '../common/Icon';

type Action = {
  key: string;
  label: string;
  icon: string; // use existing icon names only
  badge?: string; // optional badge to show count/notification
  onPress?: () => void;
};

interface QuickActionsGridProps {
  actions: Action[];
  shadows?: any;
}

const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({
  actions,
  shadows,
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      {actions.map(action => (
        <TouchableOpacity
          key={action.key}
          onPress={action.onPress}
          style={[
            styles.item,
            { backgroundColor: colors.card, borderColor: colors.border },
            shadows?.sm,
          ]}
          activeOpacity={0.85}
        >
          <View style={styles.iconContainer}>
            <View
              style={[
                styles.iconWrap,
                { backgroundColor: (colors.primary + '20') as any },
              ]}
            >
              <Icon
                name={action.icon as any}
                size={20}
                tintColor={colors.primary}
              />
            </View>

            {/* Badge if provided */}
            {action.badge && (
              <View style={[styles.badge, { backgroundColor: colors.primary }]}>
                <Text style={styles.badgeText}>{action.badge}</Text>
              </View>
            )}
          </View>

          <Text style={[styles.label, { color: colors.text }]}>
            {action.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  item: {
    width: '31.5%',
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 10,
  },
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default QuickActionsGrid;
