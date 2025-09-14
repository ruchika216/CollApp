import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Platform,
  Image,
} from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import { Project } from '../../../types';
import Icon from '../../../components/common/Icon';

interface StatusPrioritySelectorProps {
  status: Project['status'];
  priority: Project['priority'];
  onStatusChange: (status: Project['status']) => void;
  onPriorityChange: (priority: Project['priority']) => void;
  canEdit: boolean;
  statusChanged: boolean;
  priorityChanged: boolean;
  onSaveStatus: () => void;
  onSavePriority: () => void;
}

const StatusPrioritySelector: React.FC<StatusPrioritySelectorProps> = ({
  status,
  priority,
  onStatusChange,
  onPriorityChange,
  canEdit,
  statusChanged,
  priorityChanged,
  onSaveStatus,
  onSavePriority,
}) => {
  const theme = useTheme();
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);

  const getStatusColor = (status: Project['status']) => {
    // Align with progress colors for consistency
    switch (status) {
      case 'To Do':
        return '#FF3B30'; // Red (like early progress)
      case 'In Progress':
        return '#007AFF'; // Blue (like mid progress)
      case 'Review':
        return '#FF9500'; // Orange (like low-mid progress)
      case 'Testing':
        return '#30D158'; // Green (like high progress)
      case 'Done':
        return '#34C759'; // Completed Green
      case 'Deployment':
        return '#5856D6'; // Purple (special state)
      default:
        return theme.colors.textSecondary;
    }
  };

  const getPriorityColor = (priority: Project['priority']) => {
    switch (priority) {
      case 'Critical':
        return '#FF3B30'; // Red
      case 'High':
        return '#FF9500'; // Orange
      case 'Medium':
        return '#007AFF'; // Blue
      case 'Low':
        return '#34C759'; // Green
      default:
        return theme.colors.textSecondary;
    }
  };

  const statusOptions: Project['status'][] = [
    'To Do',
    'In Progress',
    'Review',
    'Testing',
    'Done',
    'Deployment',
  ];

  const priorityOptions: Project['priority'][] = [
    'Low',
    'Medium',
    'High',
    'Critical',
  ];

  const styles = getStyles(theme);

  const renderStatusDropdown = () => (
    <Modal
      visible={showStatusDropdown}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowStatusDropdown(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowStatusDropdown(false)}
      >
        <View style={styles.dropdownModal}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>Select Status</Text>
            <TouchableOpacity onPress={() => setShowStatusDropdown(false)}>
              <Image
                source={require('../../../assets/icons/cancel.png')}
                style={styles.cancelIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            {statusOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionItem,
                  status === option && styles.selectedOptionItem,
                ]}
                onPress={() => {
                  onStatusChange(option);
                  setShowStatusDropdown(false);
                }}
              >
                <View style={styles.optionContent}>
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: getStatusColor(option) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      status === option && {
                        color: getStatusColor(option),
                        fontWeight: '600',
                      },
                    ]}
                  >
                    {option}
                  </Text>
                </View>
                {status === option && (
                  <Icon name="check" size={16} color={getStatusColor(option)} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  const renderPriorityDropdown = () => (
    <Modal
      visible={showPriorityDropdown}
      animationType="fade"
      transparent={true}
      onRequestClose={() => setShowPriorityDropdown(false)}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setShowPriorityDropdown(false)}
      >
        <View style={styles.dropdownModal}>
          <View style={styles.dropdownHeader}>
            <Text style={styles.dropdownTitle}>Select Priority</Text>
            <TouchableOpacity onPress={() => setShowPriorityDropdown(false)}>
              <Image
                source={require('../../../assets/icons/cancel.png')}
                style={styles.cancelIcon}
                resizeMode="contain"
              />
            </TouchableOpacity>
          </View>

          <View style={styles.optionsContainer}>
            {priorityOptions.map(option => (
              <TouchableOpacity
                key={option}
                style={[
                  styles.optionItem,
                  priority === option && styles.selectedOptionItem,
                ]}
                onPress={() => {
                  onPriorityChange(option);
                  setShowPriorityDropdown(false);
                }}
              >
                <View style={styles.optionContent}>
                  <View
                    style={[
                      styles.priorityIndicator,
                      { backgroundColor: getPriorityColor(option) },
                    ]}
                  />
                  <Text
                    style={[
                      styles.optionText,
                      priority === option && {
                        color: getPriorityColor(option),
                        fontWeight: '600',
                      },
                    ]}
                  >
                    {option}
                  </Text>
                </View>
                {priority === option && (
                  <Icon
                    name="check"
                    size={16}
                    color={getPriorityColor(option)}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.selectorRow}>
        {/* Status Section */}
        <View style={styles.selectorItem}>
          <Text style={styles.fieldLabel}>Status</Text>
          {canEdit ? (
            <View style={styles.editableContainer}>
              <TouchableOpacity
                style={[
                  styles.selectorButton,
                  { backgroundColor: getStatusColor(status) },
                ]}
                onPress={() => setShowStatusDropdown(true)}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <View
                    style={[
                      styles.statusIndicator,
                      { backgroundColor: 'rgba(255,255,255,0.8)' },
                    ]}
                  />
                  <Text style={styles.buttonText}>{status}</Text>
                  <Icon name="arrow-down" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
              {statusChanged && (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={onSaveStatus}
                  activeOpacity={0.8}
                >
                  <Icon name="check" size={12} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View
              style={[
                styles.displayPill,
                { backgroundColor: getStatusColor(status) },
              ]}
            >
              <View
                style={[
                  styles.statusIndicator,
                  { backgroundColor: 'rgba(255,255,255,0.8)' },
                ]}
              />
              <Text style={styles.pillText}>{status}</Text>
            </View>
          )}
        </View>

        {/* Priority Section */}
        <View style={styles.selectorItem}>
          <Text style={styles.fieldLabel}>Priority</Text>
          {canEdit ? (
            <View style={styles.editableContainer}>
              <TouchableOpacity
                style={[
                  styles.selectorButton,
                  { backgroundColor: getPriorityColor(priority) },
                ]}
                onPress={() => setShowPriorityDropdown(true)}
                activeOpacity={0.8}
              >
                <View style={styles.buttonContent}>
                  <View
                    style={[
                      styles.priorityIndicator,
                      { backgroundColor: 'rgba(255,255,255,0.8)' },
                    ]}
                  />
                  <Text style={styles.buttonText}>{priority}</Text>
                  <Icon name="arrow-down" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
              {priorityChanged && (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={onSavePriority}
                  activeOpacity={0.8}
                >
                  <Icon name="check" size={12} color="#fff" />
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <View
              style={[
                styles.displayPill,
                { backgroundColor: getPriorityColor(priority) },
              ]}
            >
              <View
                style={[
                  styles.priorityIndicator,
                  { backgroundColor: 'rgba(255,255,255,0.8)' },
                ]}
              />
              <Text style={styles.pillText}>{priority}</Text>
            </View>
          )}
        </View>
      </View>

      {/* Modals */}
      {renderStatusDropdown()}
      {renderPriorityDropdown()}
    </View>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    container: {
      marginBottom: 20,
    },
    selectorRow: {
      flexDirection: 'row',
      gap: 16,
      alignItems: 'flex-start',
    },
    selectorItem: {
      flex: 1,
      minWidth: 0, // Important for flex items with text truncation
    },
    fieldLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.textSecondary,
      marginBottom: 8,
      letterSpacing: 0.5,
    },
    editableContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    selectorButton: {
      flex: 1,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 14,
      minHeight: 48,
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    buttonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    buttonText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#fff',
      flex: 1,
      marginHorizontal: 8,
      textAlign: 'left',
    },
    displayPill: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 20,
      alignSelf: 'flex-start',
      minWidth: 80,
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    pillText: {
      fontSize: 10,
      fontWeight: '600',
      color: '#fff',
      marginLeft: 6,
    },
    statusIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    priorityIndicator: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    saveButton: {
      backgroundColor: theme.colors.success,
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.15,
          shadowRadius: 3,
        },
        android: {
          elevation: 3,
        },
      }),
    },

    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 20,
    },
    dropdownModal: {
      backgroundColor: theme.colors.surface,
      borderRadius: 20,
      width: '100%',
      maxWidth: 320,
      maxHeight: '70%',
      ...Platform.select({
        ios: {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.25,
          shadowRadius: 20,
        },
        android: {
          elevation: 10,
        },
      }),
    },
    dropdownHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    dropdownTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    cancelIcon: {
      width: 20,
      height: 20,
      tintColor: theme.colors.textSecondary,
    },
    optionsContainer: {
      paddingVertical: 8,
      maxHeight: 300,
    },
    optionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 14,
      marginHorizontal: 12,
      marginVertical: 2,
      borderRadius: 12,
      backgroundColor: 'transparent',
    },
    selectedOptionItem: {
      backgroundColor: theme.colors.primary + '15',
    },
    optionContent: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    optionText: {
      fontSize: 14,
      color: theme.colors.text,
      marginLeft: 12,
      fontWeight: '500',
    },
  });

export default StatusPrioritySelector;
