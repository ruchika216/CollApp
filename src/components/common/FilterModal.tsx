import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  ScrollView, 
  TextInput,
  Dimensions 
} from 'react-native';
import { ProjectFilters } from '../../types';
import { useTheme } from '../../theme/useTheme';

const { height } = Dimensions.get('window');

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: ProjectFilters) => void;
  currentFilters: ProjectFilters;
  users: Array<{ uid: string; name: string; email: string }>;
}

const FilterModal: React.FC<FilterModalProps> = ({
  visible,
  onClose,
  onApply,
  currentFilters,
  users
}) => {
  const theme = useTheme();
  const [filters, setFilters] = useState<ProjectFilters>(currentFilters);
  const styles = getStyles(theme);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters, visible]);

  const statusOptions = ['To Do', 'In Progress', 'Done', 'Testing', 'Review', 'Deployment'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Critical'];

  const handleToggleArrayFilter = (
    filterKey: keyof ProjectFilters,
    value: string
  ) => {
    const currentArray = filters[filterKey] as string[] || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter(item => item !== value)
      : [...currentArray, value];
    
    setFilters(prev => ({
      ...prev,
      [filterKey]: newArray
    }));
  };

  const handleDateRangeChange = (type: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [type]: value
      }
    }));
  };

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      search: value
    }));
  };

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters: ProjectFilters = {
      status: [],
      priority: [],
      assignedTo: [],
      search: ''
    };
    setFilters(clearedFilters);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.status?.length) count++;
    if (filters.priority?.length) count++;
    if (filters.assignedTo?.length) count++;
    if (filters.dateRange?.start || filters.dateRange?.end) count++;
    if (filters.search) count++;
    if (filters.tags?.length) count++;
    return count;
  };

  const FilterSection: React.FC<{
    title: string;
    children: React.ReactNode;
  }> = ({ title, children }) => (
    <View style={styles.filterSection}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );

  const FilterChip: React.FC<{
    label: string;
    selected: boolean;
    onPress: () => void;
  }> = ({ label, selected, onPress }) => (
    <TouchableOpacity
      style={[styles.filterChip, selected && styles.filterChipSelected]}
      onPress={onPress}
    >
      <Text style={[
        styles.filterChipText,
        selected && styles.filterChipTextSelected
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Filters</Text>
              {getActiveFiltersCount() > 0 && (
                <View style={styles.activeFiltersCount}>
                  <Text style={styles.activeFiltersCountText}>
                    {getActiveFiltersCount()}
                  </Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity onPress={handleClear}>
              <Text style={styles.clearButton}>Clear</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Search */}
            <FilterSection title="Search">
              <TextInput
                style={styles.searchInput}
                placeholder="Search projects..."
                placeholderTextColor={theme.colors.textSecondary}
                value={filters.search || ''}
                onChangeText={handleSearchChange}
              />
            </FilterSection>

            {/* Status Filter */}
            <FilterSection title="Status">
              <View style={styles.chipContainer}>
                {statusOptions.map(status => (
                  <FilterChip
                    key={status}
                    label={status}
                    selected={filters.status?.includes(status) || false}
                    onPress={() => handleToggleArrayFilter('status', status)}
                  />
                ))}
              </View>
            </FilterSection>

            {/* Priority Filter */}
            <FilterSection title="Priority">
              <View style={styles.chipContainer}>
                {priorityOptions.map(priority => (
                  <FilterChip
                    key={priority}
                    label={priority}
                    selected={filters.priority?.includes(priority) || false}
                    onPress={() => handleToggleArrayFilter('priority', priority)}
                  />
                ))}
              </View>
            </FilterSection>

            {/* Assignee Filter */}
            <FilterSection title="Assigned To">
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
              >
                <View style={styles.chipContainer}>
                  {users.map(user => (
                    <FilterChip
                      key={user.uid}
                      label={user.name || user.email}
                      selected={filters.assignedTo?.includes(user.uid) || false}
                      onPress={() => handleToggleArrayFilter('assignedTo', user.uid)}
                    />
                  ))}
                </View>
              </ScrollView>
            </FilterSection>

            {/* Date Range Filter */}
            <FilterSection title="Date Range">
              <View style={styles.dateInputContainer}>
                <View style={styles.dateInputWrapper}>
                  <Text style={styles.dateInputLabel}>Start Date</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={filters.dateRange?.start || ''}
                    onChangeText={(value) => handleDateRangeChange('start', value)}
                  />
                </View>
                <View style={styles.dateInputWrapper}>
                  <Text style={styles.dateInputLabel}>End Date</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={theme.colors.textSecondary}
                    value={filters.dateRange?.end || ''}
                    onChangeText={(value) => handleDateRangeChange('end', value)}
                  />
                </View>
              </View>
            </FilterSection>
          </ScrollView>

          {/* Apply Button */}
          <View style={styles.footer}>
            <TouchableOpacity style={styles.applyButton} onPress={handleApply}>
              <Text style={styles.applyButtonText}>
                Apply Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const getStyles = (theme: any) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    container: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: height * 0.85,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    title: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    activeFiltersCount: {
      backgroundColor: theme.colors.primary,
      width: 20,
      height: 20,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
    activeFiltersCountText: {
      color: 'white',
      fontSize: 12,
      fontWeight: '600',
    },
    cancelButton: {
      fontSize: 16,
      color: theme.colors.textSecondary,
    },
    clearButton: {
      fontSize: 16,
      color: theme.colors.primary,
      fontWeight: '500',
    },
    content: {
      paddingHorizontal: 20,
      paddingVertical: 16,
    },
    filterSection: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 12,
    },
    searchInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },
    chipContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    horizontalScroll: {
      marginHorizontal: -20,
      paddingHorizontal: 20,
    },
    filterChip: {
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    filterChipSelected: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterChipText: {
      fontSize: 12,
      color: theme.colors.text,
      fontWeight: '500',
    },
    filterChipTextSelected: {
      color: 'white',
    },
    dateInputContainer: {
      flexDirection: 'row',
      gap: 12,
    },
    dateInputWrapper: {
      flex: 1,
    },
    dateInputLabel: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginBottom: 4,
      fontWeight: '500',
    },
    dateInput: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: 14,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
    },
    footer: {
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    applyButton: {
      backgroundColor: theme.colors.primary,
      paddingVertical: 14,
      borderRadius: 8,
      alignItems: 'center',
    },
    applyButtonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });

export default FilterModal;