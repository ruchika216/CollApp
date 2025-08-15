import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  TextInput,
  Dimensions,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import Icon from './Icon';

const { width, height } = Dimensions.get('window');

interface ChipItem {
  id: string;
  label: string;
  value: string;
}

interface CustomChipsProps {
  items: ChipItem[];
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  maxChipsToShow?: number;
}

const CustomChips: React.FC<CustomChipsProps> = ({
  items,
  selectedItems,
  onSelectionChange,
  placeholder = 'Select items',
  label,
  disabled = false,
  maxChipsToShow = 4,
}) => {
  const { colors } = useTheme();
  const styles = getStyles(colors);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const selectedItemsData = items.filter(item => selectedItems.includes(item.value));
  const filteredItems = items.filter(item =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleItemToggle = (itemValue: string) => {
    const newSelection = selectedItems.includes(itemValue)
      ? selectedItems.filter(id => id !== itemValue)
      : [...selectedItems, itemValue];
    onSelectionChange(newSelection);
  };

  const handleRemoveChip = (itemValue: string) => {
    const newSelection = selectedItems.filter(id => id !== itemValue);
    onSelectionChange(newSelection);
  };

  const renderChip = (item: ChipItem, index: number) => {
    if (index >= maxChipsToShow) return null;
    
    return (
      <View key={item.value} style={styles.chip}>
        <Text style={styles.chipText} numberOfLines={1}>
          {item.label}
        </Text>
        <TouchableOpacity
          onPress={() => handleRemoveChip(item.value)}
          style={styles.chipCloseButton}
          hitSlop={{ top: 5, bottom: 5, left: 5, right: 5 }}
        >
          <Text style={styles.chipCloseText}>×</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderOverflowChip = () => {
    const remainingCount = selectedItemsData.length - maxChipsToShow;
    if (remainingCount <= 0) return null;

    return (
      <TouchableOpacity
        style={[styles.chip, styles.overflowChip]}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.chipText}>+{remainingCount} more</Text>
      </TouchableOpacity>
    );
  };

  const renderSelectableItem = ({ item }: { item: ChipItem }) => {
    const isSelected = selectedItems.includes(item.value);
    
    return (
      <TouchableOpacity
        style={[styles.selectableItem, isSelected && styles.selectedItem]}
        onPress={() => handleItemToggle(item.value)}
      >
        <View style={styles.itemContent}>
          <Text style={[styles.itemText, isSelected && styles.selectedItemText]}>
            {item.label}
          </Text>
          <View style={[styles.checkbox, isSelected && styles.checkedBox]}>
            {isSelected && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      {/* Selected Chips Display */}
      <View style={styles.chipsContainer}>
        {selectedItemsData.length > 0 ? (
          <View style={styles.chipsWrapper}>
            <View style={styles.chipsRow}>
              {selectedItemsData.slice(0, maxChipsToShow).map((item, index) => 
                renderChip(item, index)
              )}
              {renderOverflowChip()}
            </View>
          </View>
        ) : null}
        
        {/* Add/Select Button */}
        <TouchableOpacity
          style={[
            styles.addButton,
            disabled && styles.disabledButton,
            selectedItemsData.length > 0 && styles.addButtonWithChips
          ]}
          onPress={() => setIsModalVisible(true)}
          disabled={disabled}
        >
          <Text style={[
            styles.addButtonText,
            selectedItemsData.length > 0 && styles.addButtonTextWithChips
          ]}>
            {selectedItemsData.length > 0 
              ? `${selectedItemsData.length} selected • Add more`
              : placeholder
            }
          </Text>
          <View style={styles.addIcon}>
            <Text style={styles.addIconText}>+</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Selection Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          setIsModalVisible(false);
          setSearchQuery('');
        }}
      >
        <View style={styles.modalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setIsModalVisible(false);
                setSearchQuery('');
              }}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>
              {label || 'Select Items'}
            </Text>
            
            <TouchableOpacity
              onPress={() => {
                setIsModalVisible(false);
                setSearchQuery('');
              }}
              style={styles.modalDoneButton}
            >
              <Text style={styles.modalDoneText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Search Input */}
          <View style={styles.searchContainer}>
            <Icon name="search" size={16} tintColor={colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Text style={styles.clearSearchText}>×</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Selection Summary */}
          <View style={styles.selectionSummary}>
            <Text style={styles.selectionSummaryText}>
              {selectedItems.length} of {items.length} selected
            </Text>
            {selectedItems.length > 0 && (
              <TouchableOpacity
                onPress={() => onSelectionChange([])}
                style={styles.clearAllButton}
              >
                <Text style={styles.clearAllText}>Clear All</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Items List */}
          <FlatList
            data={filteredItems}
            renderItem={renderSelectableItem}
            keyExtractor={(item) => item.value}
            style={styles.itemsList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      </Modal>
    </View>
  );
};

const getStyles = (colors: any) =>
  StyleSheet.create({
    container: {
      marginBottom: 16,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 12,
    },
    chipsContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 12,
      minHeight: 48,
    },
    chipsWrapper: {
      marginBottom: 12,
    },
    chipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 8,
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.primary,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 20,
      maxWidth: (width - 100) / 2,
    },
    overflowChip: {
      backgroundColor: colors.textSecondary + '20',
    },
    chipText: {
      color: colors.textOnPrimary,
      fontSize: 14,
      fontWeight: '500',
      flex: 1,
    },
    chipCloseButton: {
      marginLeft: 6,
      width: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: 'rgba(255,255,255,0.3)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    chipCloseText: {
      color: colors.textOnPrimary,
      fontSize: 12,
      fontWeight: 'bold',
      lineHeight: 14,
    },
    addButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    addButtonWithChips: {
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: 12,
    },
    disabledButton: {
      opacity: 0.5,
    },
    addButtonText: {
      color: colors.textSecondary,
      fontSize: 16,
      flex: 1,
    },
    addButtonTextWithChips: {
      color: colors.primary,
      fontWeight: '500',
    },
    addIcon: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    addIconText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: 'bold',
    },
    
    // Modal Styles
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: 50,
      paddingHorizontal: 20,
      paddingBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    modalCloseButton: {
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    modalCloseText: {
      color: colors.primary,
      fontSize: 16,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      flex: 1,
      textAlign: 'center',
    },
    modalDoneButton: {
      paddingVertical: 8,
      paddingHorizontal: 4,
    },
    modalDoneText: {
      color: colors.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: 12,
      margin: 20,
      borderWidth: 1,
      borderColor: colors.border,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text,
      marginLeft: 12,
      marginRight: 12,
    },
    clearSearchText: {
      color: colors.textSecondary,
      fontSize: 20,
      fontWeight: 'bold',
    },
    selectionSummary: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 16,
    },
    selectionSummaryText: {
      fontSize: 14,
      color: colors.textSecondary,
    },
    clearAllButton: {
      paddingVertical: 4,
      paddingHorizontal: 8,
    },
    clearAllText: {
      color: colors.error,
      fontSize: 14,
      fontWeight: '500',
    },
    itemsList: {
      flex: 1,
      paddingHorizontal: 20,
    },
    selectableItem: {
      paddingVertical: 16,
      paddingHorizontal: 16,
      borderRadius: 12,
      marginBottom: 8,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    selectedItem: {
      backgroundColor: colors.primary + '15',
      borderColor: colors.primary + '50',
    },
    itemContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    itemText: {
      fontSize: 16,
      color: colors.text,
      flex: 1,
    },
    selectedItemText: {
      color: colors.primary,
      fontWeight: '500',
    },
    checkbox: {
      width: 20,
      height: 20,
      borderRadius: 4,
      borderWidth: 2,
      borderColor: colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkedBox: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    checkmark: {
      color: colors.textOnPrimary,
      fontSize: 12,
      fontWeight: 'bold',
    },
  });

export default CustomChips;