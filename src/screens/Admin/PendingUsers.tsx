import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useTheme } from '../../theme/useTheme';
import { User } from '../../types';
import Icon from '../../components/common/Icon';
import UserApprovalCard from '../../components/admin/UserApprovalCard';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { fetchPendingUsers, approveUser, rejectUser } from '../../store/slices/userSlice';

const PendingUsers = () => {
  const { colors, shadows } = useTheme();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(state => state.auth.user);
  const pendingUsers = useAppSelector(state => state.user.pendingUsers);
  const loading = useAppSelector(state => state.user.loading);
  const [refreshing, setRefreshing] = useState(false);
  const [processingUsers, setProcessingUsers] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
      await dispatch(fetchPendingUsers()).unwrap();
    } catch (error) {
      console.error('Error loading pending users:', error);
      Alert.alert('Error', 'Failed to load pending users');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPendingUsers();
    setRefreshing(false);
  };

  const handleApprove = async (user: User) => {
    try {
      setProcessingUsers(prev => new Set(prev).add(user.uid));
      await dispatch(approveUser(user.uid)).unwrap();
      Alert.alert('Success', 'User approved successfully and notified');
    } catch (error: any) {
      console.error('Error approving user:', error);
      Alert.alert('Error', error?.message || 'Failed to approve user');
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.uid);
        return newSet;
      });
    }
  };

  const handleReject = async (user: User) => {
    try {
      setProcessingUsers(prev => new Set(prev).add(user.uid));
      await dispatch(rejectUser(user.uid)).unwrap();
      Alert.alert('Success', 'User rejected successfully');
    } catch (error: any) {
      console.error('Error rejecting user:', error);
      Alert.alert('Error', error?.message || 'Failed to reject user');
    } finally {
      setProcessingUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.uid);
        return newSet;
      });
    }
  };


  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
          Loading pending users...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {pendingUsers.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.card }, shadows.sm]}>
          <Icon name="checkmark" size={48} tintColor={colors.success} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>All Clear!</Text>
          <Text style={[styles.emptyMessage, { color: colors.textSecondary }]}>
            No users are currently pending approval.
          </Text>
        </View>
      ) : (
        <FlatList
          data={pendingUsers}
          keyExtractor={item => item.uid}
          renderItem={({ item }) => (
            <UserApprovalCard
              user={item}
              onApprove={() => handleApprove(item)}
              onReject={() => handleReject(item)}
              isLoading={processingUsers.has(item.uid)}
            />
          )}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
            />
          }
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  listContainer: {
    paddingVertical: 8,
  },
  userCard: {
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  approveButton: {},
  rejectButton: {},
  actionButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 20,
    padding: 40,
    borderRadius: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default PendingUsers;