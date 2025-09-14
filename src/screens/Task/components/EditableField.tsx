import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import Icon from '../../../components/common/Icon';

interface EditableFieldProps {
  label: string;
  value: string;
  onSave: (value: string) => void;
  multiline?: boolean;
  placeholder?: string;
  readonly?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onSave,
  multiline = false,
  placeholder = '',
  readonly = false,
}) => {
  const { colors } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onSave(tempValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setTempValue(value);
    setIsEditing(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          {label}
        </Text>
        {!readonly && !isEditing && (
          <TouchableOpacity
            onPress={() => setIsEditing(true)}
            style={[styles.editButton, { backgroundColor: colors.card }]}
          >
            <Icon name="edit" size={14} tintColor={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {isEditing ? (
        <View style={styles.editContainer}>
          <TextInput
            value={tempValue}
            onChangeText={setTempValue}
            style={[
              styles.input,
              multiline && styles.multilineInput,
              { color: colors.text, backgroundColor: colors.card },
            ]}
            multiline={multiline}
            placeholder={placeholder}
            placeholderTextColor={colors.textSecondary}
            autoFocus
          />
          <View style={styles.editActions}>
            <TouchableOpacity
              onPress={handleCancel}
              style={[
                styles.actionButton,
                { backgroundColor: colors.textSecondary + '20' },
              ]}
            >
              <Text
                style={[styles.actionText, { color: colors.textSecondary }]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSave}
              style={[
                styles.actionButton,
                { backgroundColor: colors.primary + '20' },
              ]}
            >
              <Text style={[styles.actionText, { color: colors.primary }]}>
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={[styles.valueContainer, { opacity: readonly ? 0.7 : 1 }]}>
          <Text
            style={[
              styles.value,
              multiline && styles.multilineValue,
              { color: colors.text },
            ]}
          >
            {value || placeholder}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  editButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  valueContainer: {
    paddingVertical: 10,
    paddingHorizontal: 2,
  },
  value: {
    fontSize: 16,
    lineHeight: 22,
  },
  multilineValue: {
    minHeight: 80,
  },
  editContainer: {
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    minHeight: 48,
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  actionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default EditableField;
