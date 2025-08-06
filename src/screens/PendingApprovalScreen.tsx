
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme/useTheme';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { signOut } from '../store/slices/authSlice';
import { clearUser } from '../store/slices/userSlice';
import Icon from '../components/common/Icon';

const PendingApprovalScreen: React.FC = () => {
  const { colors, gradients, shadows } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.user.user);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(signOut()).unwrap();
              dispatch(clearUser());
            } catch (error) {
              console.error('Sign out failed:', error);
            }
          },
        },
      ]
    );
  };

  const handleRefresh = async () => {
    // This will be used to check if approval status has changed
    try {
      const { getCurrentUser } = await import('../services/auth/googleAuth');
      const updatedUser = await getCurrentUser();
      if (updatedUser?.approved) {
        // User has been approved, trigger a re-render/navigation
        Alert.alert('Account Approved!', 'Your account has been approved. Please restart the app.');
      } else {
        Alert.alert('Status Unchanged', 'Your account is still pending approval.');
      }
    } catch (error) {
      console.error('Error refreshing user status:', error);
      Alert.alert('Error', 'Failed to check approval status.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <LinearGradient
        colors={gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Account Pending</Text>
          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
          >
            <Icon name="logout" size={20} tintColor="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* User Profile Section */}
        <View style={[styles.profileCard, { backgroundColor: colors.card }, shadows.md]}>
          <View style={styles.profileHeader}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
            ) : (
              <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primary }]}>
                <Text style={styles.profileImageText}>
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text }]}>
                {user?.name || 'User'}
              </Text>
              <Text style={[styles.profileEmail, { color: colors.textSecondary }]}>
                {user?.email}
              </Text>
              <View style={styles.roleBadge}>
                <View style={[styles.badge, { backgroundColor: `${colors.info}20` }]}>
                  <Text style={[styles.badgeText, { color: colors.info }]}>
                    {user?.role?.charAt(0).toUpperCase()}{user?.role?.slice(1)} Account
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Pending Status Card */}
        <View style={[styles.statusCard, { backgroundColor: colors.card }, shadows.md]}>
          <View style={styles.statusIconContainer}>
            <View style={[styles.statusIcon, { backgroundColor: `${colors.warning}20` }]}>
              <Icon name="clock" size={48} tintColor={colors.warning} />
            </View>
          </View>
          
          <Text style={[styles.statusTitle, { color: colors.text }]}>
            Approval Pending
          </Text>
          
          <Text style={[styles.statusMessage, { color: colors.textSecondary }]}>
            Your account has been created successfully but is currently pending admin approval.
            You'll receive a notification once your account has been approved.
          </Text>

          <View style={styles.statusSteps}>
            <View style={styles.stepItem}>
              <View style={[styles.stepIcon, { backgroundColor: colors.success }]}>
                <Icon name="checkmark" size={16} tintColor="#fff" />
              </View>
              <Text style={[styles.stepText, { color: colors.text }]}>
                Account Created
              </Text>
            </View>
            
            <View style={[styles.stepConnector, { backgroundColor: colors.border }]} />
            
            <View style={styles.stepItem}>
              <View style={[styles.stepIcon, { backgroundColor: colors.warning }]}>
                <Icon name="clock" size={16} tintColor="#fff" />
              </View>
              <Text style={[styles.stepText, { color: colors.text }]}>
                Pending Approval
              </Text>
            </View>
            
            <View style={[styles.stepConnector, { backgroundColor: colors.border }]} />
            
            <View style={styles.stepItem}>
              <View style={[styles.stepIcon, { backgroundColor: colors.border }]}>
                <Icon name="account" size={16} tintColor={colors.textSecondary} />
              </View>
              <Text style={[styles.stepText, { color: colors.textSecondary }]}>
                Access Granted
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.refreshButton, { backgroundColor: colors.primary }]}
            onPress={handleRefresh}
          >
            <Icon name="refresh" size={20} tintColor="#fff" />
            <Text style={styles.refreshButtonText}>Check Status</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.helpButton, { borderColor: colors.border }]}
          >
            <Icon name="help" size={20} tintColor={colors.textSecondary} />
            <Text style={[styles.helpButtonText, { color: colors.textSecondary }]}>
              Need Help?
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Section */}
        <View style={[styles.infoCard, { backgroundColor: `${colors.info}10`, borderColor: `${colors.info}30` }]}>
          <View style={styles.infoHeader}>
            <Icon name="info" size={20} tintColor={colors.info} />
            <Text style={[styles.infoTitle, { color: colors.info }]}>
              What happens next?
            </Text>
          </View>
          <Text style={[styles.infoText, { color: colors.text }]}>
            An admin will review your account and approve access. This usually takes 1-2 business days. 
            You'll receive a notification once approved.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  signOutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  profileCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
  },
  profileImagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileImageText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  roleBadge: {
    flexDirection: 'row',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusCard: {
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  statusIconContainer: {
    marginBottom: 20,
  },
  statusIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
  },
  statusSteps: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepItem: {
    alignItems: 'center',
    gap: 8,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
  },
  stepConnector: {
    width: 40,
    height: 2,
    marginHorizontal: 8,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  refreshButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  helpButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  helpButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default PendingApprovalScreen;
