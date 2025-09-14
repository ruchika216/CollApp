import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import Icon from '../../../components/common/Icon';

interface TaskHeaderProps {
  title: string;
  onBack: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isLoading?: boolean;
  editMode?: boolean;
}

const TaskHeader: React.FC<TaskHeaderProps> = ({
  title,
  onBack,
  onEdit,
  onDelete,
  isLoading = false,
  editMode = false,
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={onBack}
          style={[styles.backButton, { backgroundColor: colors.surface }]}
          disabled={isLoading}
        >
          <Icon name="arrow-left" size={20} tintColor={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
          {editMode ? 'Edit Task' : title}
        </Text>
        <View style={styles.actions}>
          {isLoading && (
            <ActivityIndicator
              size="small"
              color={colors.primary}
              style={styles.loader}
            />
          )}

          {onEdit && (
            <TouchableOpacity
              onPress={onEdit}
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              disabled={isLoading}
            >
              <Icon
                name={editMode ? 'close' : 'edit'}
                size={16}
                tintColor={colors.text}
              />
            </TouchableOpacity>
          )}

          {onDelete && !editMode && (
            <TouchableOpacity
              onPress={onDelete}
              style={[styles.actionButton, { backgroundColor: colors.surface }]}
              disabled={isLoading}
            >
              <Icon name="delete" size={16} tintColor={colors.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 48 : 16,
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  loader: {
    marginRight: 8,
  },
});

export default TaskHeader;
