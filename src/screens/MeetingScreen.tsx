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
import { fetchMeetings, fetchUserMeetings, createMeeting, updateMeeting, deleteMeeting } from '../store/slices/meetingSlice';
import { Meeting, User } from '../types';
import firestoreService from '../firebase/firestoreService';
import Icon from '../components/common/Icon';
import Dropdown from '../components/common/Dropdown';
import CustomChips from '../components/common/CustomChips';
import MeetingCard from '../components/meetings/MeetingCard';

const { width } = Dimensions.get('window');

interface MeetingScreenProps {
  navigation: any;
}

const MeetingScreen: React.FC<MeetingScreenProps> = ({ navigation }) => {
  const { colors, shadows } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const meetings = useAppSelector(state => state.meetings.meetings);
  const userMeetings = useAppSelector(state => state.meetings.userMeetings);
  const loading = useAppSelector(state => state.meetings.loading);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateScrollDates, setDateScrollDates] = useState<string[]>([]);
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);

  // Form state
  const [meetingForm, setMeetingForm] = useState({
    title: '',
    agenda: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    type: 'Individual' as 'Individual' | 'Team' | 'All Hands' | 'Project Review' | 'Client Meeting' | 'Training',
    assignmentType: 'individual' as 'individual' | 'all',
    assignedTo: [] as string[], // Multiple users when assignmentType is 'individual'
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    loadData();
    generateDateRange();
    loadApprovedUsers();
  }, []);

  useEffect(() => {
    filterMeetingsByDate();
  }, [selectedDate, meetings, userMeetings]);

  const loadData = async () => {
    try {
      if (isAdmin) {
        await dispatch(fetchMeetings()).unwrap();
      } else {
        await dispatch(fetchUserMeetings(user?.uid || '')).unwrap();
      }
    } catch (error) {
      console.error('Error loading meetings:', error);
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
    const todayString = today.toISOString().split('T')[0];
    
    // Start with today's date
    dates.push(todayString);
    
    // Add future dates (next 20 days)
    for (let i = 1; i <= 20; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    // Add past dates (previous 10 days) at the end
    for (let i = -10; i < 0; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    setDateScrollDates(dates);
  };

  const filterMeetingsByDate = () => {
    const meetingsToFilter = isAdmin ? meetings : userMeetings;
    const filtered = meetingsToFilter.filter(meeting => {
      const meetingDate = new Date(meeting.date).toISOString().split('T')[0];
      return meetingDate === selectedDate;
    });
    // Sort by time
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setFilteredMeetings(filtered);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const openModal = (meeting?: Meeting) => {
    if (meeting) {
      setSelectedMeeting(meeting);
      const meetingDate = new Date(meeting.startTime);
      setMeetingForm({
        title: meeting.title,
        agenda: meeting.agenda,
        date: meetingDate.toISOString().split('T')[0],
        time: meetingDate.toTimeString().slice(0, 5),
        type: meeting.type,
        assignmentType: meeting.isAssignedToAll ? 'all' : 'individual',
        assignedTo: meeting.isAssignedToAll ? [] : meeting.assignedTo,
      });
    } else {
      setSelectedMeeting(null);
      resetForm();
    }
    setModalVisible(true);
  };

  const resetForm = () => {
    setMeetingForm({
      title: '',
      agenda: '',
      date: selectedDate,
      time: '10:00',
      type: 'Individual',
      assignmentType: 'individual',
      assignedTo: [],
    });
  };

  const getAssigneeName = (userId: string) => {
    const user = approvedUsers.find(u => u.uid === userId);
    return user?.name || user?.email?.split('@')[0] || 'Unknown User';
  };

  const handleUserSelectionChange = (selectedUsers: string[]) => {
    setMeetingForm({ ...meetingForm, assignedTo: selectedUsers });
  };

  const handleSubmit = async () => {
    if (!meetingForm.title.trim() || !meetingForm.agenda.trim()) {
      Alert.alert('Error', 'Please fill all required fields');
      return;
    }

    if (meetingForm.assignmentType === 'individual' && meetingForm.assignedTo.length === 0) {
      Alert.alert('Error', 'Please select at least one user to assign the meeting to');
      return;
    }

    if (!isAdmin && user?.role !== 'developer') {
      Alert.alert('Error', 'Only admins and developers can create/edit meetings');
      return;
    }

    try {
      const meetingDateTime = new Date(`${meetingForm.date}T${meetingForm.time}:00`);
      
      // Determine assignment based on type
      const isAssignedToAll = meetingForm.assignmentType === 'all';
      const assignedTo = isAssignedToAll 
        ? approvedUsers.map(user => user.uid) // Assign to all approved users
        : meetingForm.assignedTo; // Assign to selected users
      
      const meetingData = {
        title: meetingForm.title,
        agenda: meetingForm.agenda,
        type: meetingForm.type,
        startTime: meetingDateTime.toISOString(),
        date: meetingForm.date,
        isAssignedToAll,
        assignedTo,
        priority: 'Medium' as const,
        status: 'Scheduled' as const,
        createdBy: user?.uid || '',
      };
      
      if (selectedMeeting) {
        await dispatch(updateMeeting({ 
          meetingId: selectedMeeting.id, 
          updates: meetingData 
        })).unwrap();
        Alert.alert('Success', 'Meeting updated successfully');
      } else {
        await dispatch(createMeeting(meetingData)).unwrap();
        Alert.alert('Success', 'Meeting scheduled successfully');
      }
      setModalVisible(false);
      resetForm();
      setSelectedMeeting(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to save meeting');
      console.error('Error saving meeting:', error);
    }
  };

  const handleDelete = (meeting: Meeting) => {
    const canDelete = isAdmin || (user?.role === 'developer' && meeting.createdBy === user?.uid);
    
    if (!canDelete) {
      Alert.alert('Error', 'You can only delete meetings you created');
      return;
    }

    Alert.alert(
      'Delete Meeting',
      `Are you sure you want to delete "${meeting.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(deleteMeeting(meeting.id)).unwrap();
              Alert.alert('Success', 'Meeting deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete meeting');
              console.error('Error deleting meeting:', error);
            }
          },
        },
      ]
    );
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

  const renderMeetingItem = ({ item }: { item: Meeting }) => (
    <MeetingCard
      meeting={item}
      showActions={isAdmin}
      showCountdown={true}
      onEdit={() => openModal(item)}
      onDelete={() => handleDelete(item)}
      onPress={() => {
        // Handle meeting card press - could navigate to meeting details
        console.log('Meeting pressed:', item.title);
      }}
    />
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
        <Text style={styles.headerTitle}>Meetings</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ReportScreen')}
            style={styles.reportsButton}
          >
            <Icon name="file" size={20} tintColor="#fff" />
            <Text style={styles.reportsButtonText}>Reports</Text>
          </TouchableOpacity>
          {isAdmin && (
            <TouchableOpacity
              onPress={() => openModal()}
              style={styles.addButton}
            >
              <Icon name="add" size={24} tintColor="#fff" />
            </TouchableOpacity>
          )}
        </View>
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

      {/* Meetings List */}
      <FlatList
        data={filteredMeetings}
        renderItem={renderMeetingItem}
        keyExtractor={(item) => item.id}
        style={styles.meetingsList}
        contentContainerStyle={styles.meetingsContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Icon name="calendar" size={48} tintColor={colors.textSecondary} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No meetings for {formatDate(selectedDate)}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {isAdmin ? 'Schedule a new meeting to get started' : 'No meetings scheduled for you on this date'}
            </Text>
          </View>
        )}
      />

      {/* Meeting Modal */}
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
                setSelectedMeeting(null);
              }}
              style={styles.modalBackButton}
            >
              <Icon name="cancel" size={24} tintColor="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {selectedMeeting ? 'Edit Meeting' : 'Schedule Meeting'}
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                  setSelectedMeeting(null);
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

          <ScrollView 
            style={styles.modalContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Title *</Text>
              <TextInput
                value={meetingForm.title}
                onChangeText={(text) => setMeetingForm({ ...meetingForm, title: text })}
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text }]}
                placeholder="Enter meeting title"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Agenda *</Text>
              <TextInput
                value={meetingForm.agenda}
                onChangeText={(text) => setMeetingForm({ ...meetingForm, agenda: text })}
                style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text }]}
                placeholder="Enter meeting agenda"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Date</Text>
                <TextInput
                  value={meetingForm.date}
                  onChangeText={(text) => setMeetingForm({ ...meetingForm, date: text })}
                  style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>

              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>Time</Text>
                <TextInput
                  value={meetingForm.time}
                  onChangeText={(text) => setMeetingForm({ ...meetingForm, time: text })}
                  style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text }]}
                  placeholder="HH:MM"
                  placeholderTextColor={colors.textSecondary}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Assignment Type *</Text>
              <Dropdown
                data={[
                  { label: 'Assign to specific user', value: 'individual' },
                  { label: 'Assign to all users', value: 'all' },
                ]}
                selectedValue={meetingForm.assignmentType}
                onSelect={(value) => setMeetingForm({ 
                  ...meetingForm, 
                  assignmentType: value as 'individual' | 'all',
                  assignedTo: value === 'all' ? [] : meetingForm.assignedTo // Clear user selections if assigning to all
                })}
                placeholder="Select assignment type"
              />
            </View>

            {meetingForm.assignmentType === 'individual' && (
              <View style={styles.assigneeSection}>
                <CustomChips
                  items={approvedUsers.map(user => ({
                    id: user.uid,
                    label: user.name || user.email?.split('@')[0] || 'Unknown User',
                    value: user.uid,
                  }))}
                  selectedItems={meetingForm.assignedTo}
                  onSelectionChange={handleUserSelectionChange}
                  placeholder={approvedUsers.length === 0 ? "Loading users..." : "Select users to assign"}
                  disabled={approvedUsers.length === 0}
                  label="Assignees *"
                  maxChipsToShow={3}
                />
                {approvedUsers.length === 0 && (
                  <TouchableOpacity
                    onPress={loadApprovedUsers}
                    style={styles.refreshUsersButton}
                  >
                    <Icon name="search" size={16} tintColor={colors.info} />
                    <Text style={[styles.refreshUsersText, { color: colors.info }]}>Refresh Users</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}

            {meetingForm.assignmentType === 'all' && (
              <View style={styles.inputGroup}>
                <View style={[styles.allUsersInfo, { backgroundColor: colors.info + '20' }]}>
                  <Icon name="team" size={20} tintColor={colors.info} />
                  <Text style={[styles.allUsersText, { color: colors.info }]}>
                    This meeting will be visible to all {approvedUsers.length} approved users
                  </Text>
                </View>
              </View>
            )}

            <Dropdown
              label="Meeting Type"
              data={[
                { label: 'Individual', value: 'Individual' },
                { label: 'Team', value: 'Team' },
                { label: 'All Hands', value: 'All Hands' },
                { label: 'Project Review', value: 'Project Review' },
                { label: 'Client Meeting', value: 'Client Meeting' },
                { label: 'Training', value: 'Training' },
              ]}
              selectedValue={meetingForm.type}
              onSelect={(value) => setMeetingForm({ ...meetingForm, type: value as any })}
              placeholder="Select meeting type"
            />
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
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reportsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    gap: 4,
  },
  reportsButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
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
  meetingsList: {
    flex: 1,
  },
  meetingsContent: {
    paddingBottom: 100,
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
    paddingBottom: 40,
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
  refreshUsersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  refreshUsersText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 6,
  },
  allUsersInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  allUsersText: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
});

export default MeetingScreen;