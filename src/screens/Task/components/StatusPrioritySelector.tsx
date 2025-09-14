import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../../theme/useTheme';
import Icon from '../../../components/common/Icon';
import { Task } from '../../../types';

interface StatusPrioritySelectorProps {
  status: Task['status'];
  priority: Task['priority'];
  onStatusChange: (newStatus: Task['status']) => void;
  onPriorityChange: (newPriority: Task['priority']) => void;
  readonly?: boolean;
}

const StatusPrioritySelector: React.FC<StatusPrioritySelectorProps> = ({
  status,
  priority,
  onStatusChange,
  onPriorityChange,
  readonly = false,
}) => {
  const { colors } = useTheme();
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPriorityModal, setShowPriorityModal] = useState(false);
  const statusOptions: Task['status'][] = [
    'To Do',
    'In Progress',
    'Review',
    'Testing',
    'Completed',
  ];

  const priorityOptions: Task['priority'][] = ['Low', 'Medium', 'High'];

  const getStatusColor = (s: Task['status']) => {
    switch (s) {
      case 'To Do':
        return '#FF3B30';
      case 'In Progress':
        return '#007AFF';
      case 'Review':
        return '#FF9500';
      case 'Testing':
        return '#30D158';
      case 'Completed':
        return '#34C759';
      default:
        return colors.textSecondary;
    }
  };

  const getPriorityColor = (p: Task['priority']) => {
    switch (p) {
      case 'Low':
        return '#6B7280';
      case 'Medium':
        return '#2563EB';
      case 'High':
        return '#DC2626';
      default:
        return colors.textSecondary;
    }
  };

  const statusColor = getStatusColor(status);
  const priorityColor = getPriorityColor(priority);
  const statusBg = `${statusColor}20`; // pastel bg
  const priorityBg = `${priorityColor}20`; // pastel bg

  return (
    <View style={styles.container}>
      {/* Status column */}
      <View style={styles.column}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Status
        </Text>
        <TouchableOpacity
          onPress={() => !readonly && setShowStatusModal(true)}
          style={[
            styles.boxButton,
            readonly && styles.selectorReadonly,
            { backgroundColor: statusBg, borderColor: statusColor },
          ]}
          disabled={readonly}
        >
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonText, { color: statusColor }]}>
              {status}
            </Text>
            {!readonly && (
              <Icon name="arrow-down" size={12} tintColor={statusColor} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Priority column */}
      <View style={styles.column}>
        <Text style={[styles.label, { color: colors.textSecondary }]}>
          Priority
        </Text>
        <TouchableOpacity
          onPress={() => !readonly && setShowPriorityModal(true)}
          style={[
            styles.boxButton,
            readonly && styles.selectorReadonly,
            { backgroundColor: priorityBg, borderColor: priorityColor },
          ]}
          disabled={readonly}
        >
          <View style={styles.buttonContent}>
            <Text style={[styles.buttonText, { color: priorityColor }]}>
              {priority}
            </Text>
            {!readonly && (
              <Icon name="arrow-down" size={12} tintColor={priorityColor} />
            )}
          </View>
        </TouchableOpacity>
      </View>

      {/* Status Selection Modal */}
      <Modal
        visible={showStatusModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowStatusModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Status
            </Text>
            <ScrollView style={styles.optionsContainer}>
              {statusOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionItem,
                    status === option && {
                      backgroundColor: `${getStatusColor(option)}10`,
                    },
                  ]}
                  onPress={() => {
                    onStatusChange(option);
                    setShowStatusModal(false);
                  }}
                >
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: `${getStatusColor(option)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: getStatusColor(option) },
                      ]}
                    >
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.card }]}
              onPress={() => setShowStatusModal(false)}
            >
              <Text style={[styles.closeButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Priority Selection Modal */}
      <Modal
        visible={showPriorityModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPriorityModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Priority
            </Text>
            <ScrollView style={styles.optionsContainer}>
              {priorityOptions.map(option => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionItem,
                    priority === option && {
                      backgroundColor: `${getPriorityColor(option)}10`,
                    },
                  ]}
                  onPress={() => {
                    onPriorityChange(option);
                    setShowPriorityModal(false);
                  }}
                >
                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: `${getPriorityColor(option)}20` },
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        { color: getPriorityColor(option) },
                      ]}
                    >
                      {option}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.card }]}
              onPress={() => setShowPriorityModal(false)}
            >
              <Text style={[styles.closeButtonText, { color: colors.text }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  column: {
    flex: 1,
  },
  boxButton: {
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
  selectorReadonly: {
    opacity: 0.7,
  },
  label: {
    fontSize: 12,
    marginBottom: 6,
  },
  // valueText removed — text now inside the box next to arrow
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 12,
    padding: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  closeButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default StatusPrioritySelector;
