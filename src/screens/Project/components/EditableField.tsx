import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  KeyboardTypeOptions,
} from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import Icon from '../../../components/common/Icon';

interface EditableFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onSave: () => void;
  canEdit: boolean;
  hasChanged: boolean;
  placeholder?: string;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  keyboardType?: KeyboardTypeOptions;
  suffix?: string;
  isTitle?: boolean;
  isDescription?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onChangeText,
  onSave,
  canEdit,
  hasChanged,
  placeholder,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  keyboardType = 'default',
  suffix,
  isTitle = false,
  isDescription = false,
}) => {
  const theme = useTheme();
  const styles = getStyles(theme, isTitle, isDescription);

  if (!canEdit) {
    return (
      <View style={styles.readOnlyContainer}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.readOnlyField}>
          <Text style={styles.readOnlyText}>
            {value || 'No value provided'}
            {suffix && value ? ` ${suffix}` : ''}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={[
            styles.input,
            multiline && styles.multilineInput,
            hasChanged && styles.inputChanged,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary + '80'}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          keyboardType={keyboardType}
          textAlignVertical={multiline ? 'top' : 'center'}
          autoCapitalize={isTitle ? 'words' : 'sentences'}
          returnKeyType={multiline ? 'default' : 'done'}
          blurOnSubmit={!multiline}
        />
        {suffix && (
          <Text style={styles.suffix}>{suffix}</Text>
        )}
        {hasChanged && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={onSave}
            activeOpacity={0.8}
          >
            <Icon name="check" size={14} color="#fff" />
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const getStyles = (theme: any, isTitle: boolean, isDescription: boolean) =>
  StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    readOnlyContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    inputContainer: {
      position: 'relative',
    },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: isTitle ? 20 : 16,
      fontWeight: isTitle ? '700' : '400',
      lineHeight: isDescription ? 24 : undefined,
      color: theme.colors.text,
      backgroundColor: theme.colors.surface,
      minHeight: 50,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.05,
          shadowRadius: 2,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    multilineInput: {
      minHeight: 100,
      maxHeight: 200,
      paddingTop: 14,
    },
    inputChanged: {
      borderColor: theme.colors.primary,
      borderWidth: 2,
      ...Platform.select({
        ios: {
          shadowColor: theme.colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    readOnlyField: {
      backgroundColor: theme.colors.background,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: theme.colors.border,
      minHeight: 50,
      justifyContent: 'center',
    },
    readOnlyText: {
      fontSize: isTitle ? 20 : 16,
      fontWeight: isTitle ? '700' : '400',
      lineHeight: isDescription ? 24 : undefined,
      color: theme.colors.text,
    },
    suffix: {
      position: 'absolute',
      right: 16,
      top: '50%',
      transform: [{ translateY: -10 }],
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.textSecondary,
      backgroundColor: theme.colors.surface,
      paddingHorizontal: 4,
    },
    saveButton: {
      position: 'absolute',
      top: 8,
      right: 8,
      backgroundColor: theme.colors.success,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      gap: 4,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.2,
          shadowRadius: 4,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    saveButtonText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: '600',
    },
  });

export default EditableField;