import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import Icon from './Icon';

interface DropdownItem {
  label: string;
  value: string;
}

interface DropdownProps {
  data: DropdownItem[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
}

const { width } = Dimensions.get('window');

const Dropdown: React.FC<DropdownProps> = ({
  data,
  selectedValue,
  onSelect,
  placeholder = 'Select an option',
  label,
  disabled = false,
}) => {
  const { colors, shadows } = useTheme();
  const [isVisible, setIsVisible] = useState(false);

  const selectedItem = data.find(item => item.value === selectedValue);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsVisible(false);
  };

  const renderItem = ({ item }: { item: DropdownItem }) => (
    <TouchableOpacity
      style={[
        styles.dropdownItem,
        { backgroundColor: colors.surface },
        selectedValue === item.value && { backgroundColor: colors.primary + '20' },
      ]}
      onPress={() => handleSelect(item.value)}
    >
      <Text
        style={[
          styles.dropdownItemText,
          { color: selectedValue === item.value ? colors.primary : colors.text },
        ]}
      >
        {item.label}
      </Text>
      {selectedValue === item.value && (
        <Icon name="check" size={16} tintColor={colors.primary} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}
      
      <TouchableOpacity
        style={[
          styles.dropdown,
          { backgroundColor: colors.surface, borderColor: colors.primary + '30' },
          disabled && { opacity: 0.5 },
        ]}
        onPress={() => !disabled && setIsVisible(true)}
        activeOpacity={disabled ? 1 : 0.7}
      >
        <Text
          style={[
            styles.dropdownText,
            { color: selectedItem ? colors.text : colors.textSecondary },
          ]}
        >
          {selectedItem ? selectedItem.label : placeholder}
        </Text>
        <Icon
          name="arrow-down"
          size={16}
          tintColor={colors.textSecondary}
          style={[styles.dropdownIcon, isVisible && styles.dropdownIconRotated]}
        />
      </TouchableOpacity>

      <Modal
        visible={isVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setIsVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsVisible(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background }, shadows.lg]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.primary + '20' }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {label || 'Select Option'}
              </Text>
              <TouchableOpacity
                onPress={() => setIsVisible(false)}
                style={styles.closeButton}
              >
                <Icon name="close" size={20} tintColor={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            <FlatList
              data={data}
              renderItem={renderItem}
              keyExtractor={item => item.value}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    minHeight: 50,
  },
  dropdownText: {
    flex: 1,
    fontSize: 16,
  },
  dropdownIcon: {
    marginLeft: 8,
  },
  dropdownIconRotated: {
    transform: [{ rotate: '180deg' }],
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: width - 40,
    maxHeight: 400,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  dropdownItemText: {
    fontSize: 16,
    flex: 1,
  },
});

export default Dropdown;