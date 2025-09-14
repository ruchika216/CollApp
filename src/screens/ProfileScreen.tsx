import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, Alert } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { signOut } from '../store/slices/authSlice';
import { fetchUserProjects } from '../store/slices/projectSlice';
import Icon from '../components/common/Icon';
// import { Project } from '../types';
import { ProjectHeader } from './Project/components';

interface ProfileScreenProps {
  navigation: any;
}

// const { width } = Dimensions.get('window');

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { colors, shadows } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  const userProjects = useAppSelector(state => state.projects.userProjects);

  const [stats, setStats] = useState({
    totalProjects: 0,
  });

  useEffect(() => {
    if (user) dispatch(fetchUserProjects(user.uid));
  }, [user, dispatch]);

  useEffect(() => {
    // Calculate stats
    const totalProjects = userProjects.length;

    setStats({
      totalProjects,
    });
  }, [userProjects]);

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          dispatch(signOut());
          navigation.navigate('Login');
        },
      },
    ]);
  };

  if (!user) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No user data available
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      {/* <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} tintColor="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.signOutButton}>
          <Icon name="logout" size={24} tintColor="#fff" />
        </TouchableOpacity>
      </View> */}
      <ProjectHeader
        title="Profile"
        subtitle={user.name || user.email}
        onBack={() => navigation.goBack()}
        onAddSubtask={handleSignOut} // or leave out if you don’t want add button
        showAddButton={false}
      />

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View
          style={[
            styles.profileCard,
            { backgroundColor: colors.surface },
            shadows.md,
          ]}
        >
          <View style={styles.avatarContainer}>
            {user.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View
                style={[
                  styles.avatarPlaceholder,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.avatarText}>
                  {user.name?.charAt(0) || user.email?.charAt(0) || '?'}
                </Text>
              </View>
            )}
            <View
              style={[styles.statusDot, { backgroundColor: colors.success }]}
            />
          </View>

          <Text style={[styles.userName, { color: colors.text }]}>
            {user.name || user.email?.split('@')[0] || 'Unknown User'}
          </Text>
          <Text style={[styles.userEmail, { color: colors.textSecondary }]}>
            {user.email}
          </Text>
          <View
            style={[
              styles.roleBadge,
              {
                backgroundColor:
                  user.role === 'admin' ? colors.error : colors.primary,
              },
            ]}
          >
            <Text style={styles.roleText}>
              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: user.approved
                  ? colors.success
                  : colors.warning,
              },
            ]}
          >
            <Text style={styles.statusText}>
              {user.approved ? 'Approved' : 'Pending Approval'}
            </Text>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          {/* Task stats removed */}

          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.surface },
              shadows.sm,
            ]}
          >
            <Icon name="project" size={32} tintColor={colors.warning} />
            <Text style={[styles.statNumber, { color: colors.text }]}>
              {stats.totalProjects}
            </Text>
            <Text style={[styles.statLabel, { color: colors.textSecondary }]}>
              Projects
            </Text>
          </View>
        </View>

        {/* Recent tasks section removed */}

        {/* Account Information */}
        <View
          style={[
            styles.section,
            { backgroundColor: colors.surface },
            shadows.sm,
          ]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Account Information
          </Text>

          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              User ID
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {user.uid}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Account Status
            </Text>
            <Text
              style={[
                styles.infoValue,
                { color: user.approved ? colors.success : colors.warning },
              ]}
            >
              {user.approved ? 'Active' : 'Pending Approval'}
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>
              Role
            </Text>
            <Text style={[styles.infoValue, { color: colors.text }]}>
              {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );

  // Task helpers removed
};

export default ProfileScreen;

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
  signOutButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    margin: 20,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 3,
    borderColor: '#fff',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 8,
  },
  roleText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  statusText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    margin: 20,
    marginTop: 0,
    padding: 20,
    borderRadius: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  taskInfo: {
    flex: 1,
    marginRight: 12,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
  },
  taskStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  taskStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyMessage: {
    textAlign: 'center',
    fontSize: 14,
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  infoLabel: {
    fontSize: 14,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
  bottomSpacing: {
    height: 100,
  },
});
