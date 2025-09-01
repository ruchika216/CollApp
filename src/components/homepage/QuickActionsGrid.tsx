import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useTheme } from '../../theme/useTheme';
import Icon from '../common/Icon';

type Action = {
  key: string;
  label: string;
  icon: string; // use existing icon names only
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
  iconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default QuickActionsGrid;
