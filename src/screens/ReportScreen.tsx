import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  RefreshControl,
  Modal,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { fetchReports, fetchUserReports, createReport, updateReport, deleteReport } from '../store/slices/reportSlice';
import { Report, User } from '../types';
import firestoreService from '../firebase/firestoreService';
import Icon from '../components/common/Icon';
import Dropdown from '../components/common/Dropdown';

const { width } = Dimensions.get('window');

interface ReportScreenProps {
  navigation: any;
}

const ReportScreen: React.FC<ReportScreenProps> = ({ navigation }) => {
  const { colors, shadows } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const reports = useAppSelector(state => state.reports.reports);
  const userReports = useAppSelector(state => state.reports.userReports);
  const loading = useAppSelector(state => state.reports.loading);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateScrollDates, setDateScrollDates] = useState<string[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);

  // Form state
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    priority: 'Medium' as 'Low' | 'Medium' | 'High',
    status: 'Pending' as 'Pending' | 'In Progress' | 'Done',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    assignedTo: [] as string[],
    assignedUser: '', // Single assignee
    projectId: '',
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadData();
    generateDateRange();
    loadApprovedUsers();
  }, []);

  useEffect(() => {
    filterReportsByDate();
  }, [selectedDate, reports, userReports]);

  const loadData = async () => {
    try {
      if (isAdmin) {
        await dispatch(fetchReports()).unwrap();
      } else {
        await dispatch(fetchUserReports(user?.uid || '')).unwrap();
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    }
  };

  const loadApprovedUsers = async () => {
    try {
      const users = await firestoreService.getApprovedUsers();
      
      if (users.length === 0) {
        // If no approved users, try getting all users (for development/testing)
        const allUsers = await firestoreService.getAllUsers();
        setApprovedUsers(allUsers);
      } else {
        setApprovedUsers(users);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users. Please try again.');
    }
  };

  const generateDateRange = () => {
    const dates = [];
    const today = new Date();
    
    // Generate 30 days: 15 before today, today, and 14 after today
    for (let i = -15; i < 15; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    setDateScrollDates(dates);
  };

  const filterReportsByDate = () => {
    const reportsToFilter = isAdmin ? reports : userReports;
    const filtered = reportsToFilter.filter(report => {
      const reportDate = report.startDate.split('T')[0];
      return reportDate === selectedDate;
    });
    setFilteredReports(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openModal = (report?: Report) => {
    if (report) {
      setSelectedReport(report);
      setReportForm({
        title: report.title,
        description: report.description,
        priority: report.priority,
        status: report.status,
        startDate: report.startDate,
        endDate: report.endDate,
        assignedTo: report.assignedTo,
        assignedUser: report.assignedTo.length > 0 ? report.assignedTo[0] : '', // Use first assignee as single assignee
        projectId: report.projectId || '',
      });
    } else {
      setSelectedReport(null);
      resetForm();
    }
    setModalVisible(true);
  };

  const resetForm = () => {
    setReportForm({
      title: '',
      description: '',
      priority: 'Medium',
      status: 'Pending',
      startDate: selectedDate,
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      assignedTo: [],
      assignedUser: '',
      projectId: '',
    });
  };

  const handleSubmit = async () => {
    if (!reportForm.title.trim() || !reportForm.description.trim() || !reportForm.assignedUser.trim()) {
      Alert.alert('Error', 'Please fill all required fields and assign to a user');
      return;
    }

    if (!isAdmin) {
      Alert.alert('Error', 'Only admins can create/edit reports');
      return;
    }

    try {
      const reportData = {
        ...reportForm,
        assignedTo: [reportForm.assignedUser], // Convert single assignee to array
        createdBy: user?.uid || '',
      };

      if (selectedReport) {
        await dispatch(updateReport({ 
          reportId: selectedReport.id, 
          updates: reportData 
        })).unwrap();
        Alert.alert('Success', 'Report updated successfully');
      } else {
        await dispatch(createReport(reportData)).unwrap();
        Alert.alert('Success', 'Report created successfully');
      }
      setModalVisible(false);
      resetForm();
      setSelectedReport(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save report');
      console.error('Error saving report:', error);
    }
  };

  const handleDelete = (report: Report) => {
    if (!isAdmin) {
      Alert.alert('Error', 'Only admins can delete reports');
      return;
    }

    Alert.alert(
      'Delete Report',
      `Are you sure you want to delete "${report.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteReport(report.id)).unwrap();
              Alert.alert('Success', 'Report deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete report');
              console.error('Error deleting report:', error);
            }
          },
        },
      ]
    );
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return colors.error;
      case 'Medium': return colors.warning;
      case 'Low': return colors.success;
      default: return colors.textSecondary;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Done': return colors.success;
      case 'In Progress': return colors.primary;
      case 'Pending': return colors.warning;
      default: return colors.textSecondary;
    }
  };

  const getAssigneeName = (userId: string) => {
    const user = approvedUsers.find(u => u.uid === userId);
    return user?.name || user?.email?.split('@')[0] || 'Unknown User';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (dateString === today.toISOString().split('T')[0]) {
      return 'Today';
    } else if (dateString === yesterday.toISOString().split('T')[0]) {
      return 'Yesterday';
    } else if (dateString === tomorrow.toISOString().split('T')[0]) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  const renderDateItem = ({ item }: { item: string }) => {
    const isSelected = item === selectedDate;
    const date = new Date(item);
    
    return (
      <TouchableOpacity
        style={[
          styles.dateItem,
          { backgroundColor: colors.surface },
          isSelected && { backgroundColor: colors.info },
          shadows.sm,
        ]}
        onPress={() => setSelectedDate(item)}
      >
        <Text
          style={[
            styles.dateDay,
            { color: isSelected ? colors.textOnPrimary : colors.text },
          ]}
        >
          {date.getDate()}
        </Text>
        <Text
          style={[
            styles.dateWeekday,
            { color: isSelected ? colors.textOnPrimary : colors.textSecondary },
          ]}
        >
          {date.toLocaleDateString('en-US', { weekday: 'short' })}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderReportItem = ({ item }: { item: Report }) => (
    <View style={[styles.reportCard, { backgroundColor: colors.surface }, shadows.sm]}>
      <View style={styles.reportHeader}>
        <Text style={[styles.reportTitle, { color: colors.text }]} numberOfLines={1}>
          {item.title}
        </Text>
        {isAdmin && (
          <View style={styles.reportActions}>
            <TouchableOpacity onPress={() => openModal(item)} style={styles.actionButton}>
              <Icon name="edit" size={16} tintColor={colors.info} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.actionButton}>
              <Icon name="delete" size={16} tintColor={colors.error} />
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <Text style={[styles.reportDescription, { color: colors.textSecondary }]} numberOfLines={2}>
        {item.description}
      </Text>
      
      <View style={styles.reportMeta}>
        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
          <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
            {item.priority}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
        <Text style={[styles.assigneeCount, { color: colors.textSecondary }]}>
          {getAssigneeName(item.assignedTo[0]) || 'Unassigned'}
        </Text>
      </View>
      
      <View style={styles.reportTime}>
        <Text style={[styles.timeText, { color: colors.textSecondary }]}>
          {new Date(item.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(item.endDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.info }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} tintColor="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Reports</Text>
        {isAdmin && (
          <TouchableOpacity
            onPress={() => openModal()}
            style={styles.addButton}
          >
            <Icon name="add" size={24} tintColor="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Date Selector */}
      <View style={styles.dateSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {formatDate(selectedDate)}
        </Text>
        <FlatList
          data={dateScrollDates}
          renderItem={renderDateItem}
          keyExtractor={(item) => item}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.dateScroll}
          contentContainerStyle={styles.dateScrollContent}
        />
      </View>

      {/* Reports List */}
      <FlatList
        data={filteredReports}
        renderItem={renderReportItem}
        keyExtractor={(item) => item.id}
        style={styles.reportsList}
        contentContainerStyle={styles.reportsContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Icon name="file" size={48} tintColor={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No reports for {formatDate(selectedDate)}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {isAdmin ? 'Create a new report to get started' : 'No reports assigned to you for this date'}
            </Text>
          </View>
        )}
      />

      {/* Report Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.info }]}>
            <TouchableOpacity
              onPress={() => {
                setModalVisible(false);
                resetForm();
                setSelectedReport(null);
              }}
              style={styles.modalBackButton}
            >
              <Icon name="cancel" size={24} tintColor="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedReport ? 'Edit Report' : 'Create Report'}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                  setSelectedReport(null);
                }}
                style={[styles.modalActionButton, styles.modalCancelButton]}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                style={[styles.modalActionButton, styles.modalSaveButton]}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Title *</Text>
              <TextInput
                value={reportForm.title}
                onChangeText={(text) => setReportForm({ ...reportForm, title: text })}
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text }]}
                placeholder="Enter report title"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Description *</Text>
              <TextInput
                value={reportForm.description}
                onChangeText={(text) => setReportForm({ ...reportForm, description: text })}
                style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text }]}
                placeholder="Enter report description"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.assigneeSection}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Text style={[styles.inputLabel, { color: colors.text, flex: 1 }]}>Assignee *</Text>
                {approvedUsers.length === 0 && (
                  <TouchableOpacity
                    onPress={loadApprovedUsers}
                    style={{ padding: 4 }}
                  >
                    <Icon name="search" size={16} tintColor={colors.info} />
                  </TouchableOpacity>
                )}
              </View>
              <Dropdown
                data={approvedUsers.length === 0 ? [
                  { label: 'No users available - Tap refresh', value: '' }
                ] : approvedUsers.map(user => ({
                  label: user.name || user.email?.split('@')[0] || 'Unknown User',
                  value: user.uid,
                }))}
                selectedValue={reportForm.assignedUser}
                onSelect={(value) => {
                  if (value !== '') {
                    setReportForm({ ...reportForm, assignedUser: value });
                  }
                }}
                placeholder={approvedUsers.length === 0 ? "Loading users..." : "Select a user to assign"}
                disabled={approvedUsers.length === 0}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Dropdown
                  label="Priority"
                  data={[
                    { label: 'Low', value: 'Low' },
                    { label: 'Medium', value: 'Medium' },
                    { label: 'High', value: 'High' },
                  ]}
                  selectedValue={reportForm.priority}
                  onSelect={(value) => setReportForm({ ...reportForm, priority: value as any })}
                  placeholder="Select priority"
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Dropdown
                  label="Status"
                  data={[
                    { label: 'Pending', value: 'Pending' },
                    { label: 'In Progress', value: 'In Progress' },
                    { label: 'Done', value: 'Done' },
                  ]}
                  selectedValue={reportForm.status}
                  onSelect={(value) => setReportForm({ ...reportForm, status: value as any })}
                  placeholder="Select status"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Start Date</Text>
                <TextInput
                  value={reportForm.startDate}
                  onChangeText={(text) => setReportForm({ ...reportForm, startDate: text })}
                  style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>End Date</Text>
                <TextInput
                  value={reportForm.endDate}
                  onChangeText={(text) => setReportForm({ ...reportForm, endDate: text })}
                  style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Project ID (Optional)</Text>
              <TextInput
                value={reportForm.projectId}
                onChangeText={(text) => setReportForm({ ...reportForm, projectId: text })}
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text }]}
                placeholder="Enter project ID if related"
                placeholderTextColor={colors.textSecondary}
              />
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  addButton: {
    padding: 8,
  },
  dateSection: {
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
  },
  dateScroll: {
    marginHorizontal: -20,
  },
  dateScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  dateItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 60,
  },
  dateDay: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  dateWeekday: {
    fontSize: 12,
    fontWeight: '500',
  },
  reportsList: {
    flex: 1,
  },
  reportsContent: {
    padding: 20,
    paddingBottom: 100,
  },
  reportCard: {
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reportTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    marginRight: 12,
  },
  reportActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  reportDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  reportMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  assigneeCount: {
    fontSize: 12,
    marginLeft: 'auto',
  },
  reportTime: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
  },
  modalBackButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
    textAlign: 'center',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
  },
  modalActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  modalCancelButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  modalSaveButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  modalCancelText: {
    color: '#fff',
    fontWeight: '600',
    opacity: 0.8,
  },
  modalSaveText: {
    color: '#fff',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  textArea: {
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    height: 100,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  assigneeSection: {
    marginBottom: 16,
  },
});

export default ReportScreen;