import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  Modal,
  Image,
} from 'react-native';
import { useTheme } from '../theme/useTheme';
import { useAppSelector, useAppDispatch } from '../store/hooks';
import { clearUser, signOut, updateUserProfile } from '../store/slices/userSlice';
import Icon from '../components/common/Icon';
import { CommonActions } from '@react-navigation/native';

interface SettingsScreenProps {
  navigation: any;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ navigation }) => {
  const { colors, shadows, isDark, toggleTheme } = useTheme();
  const dispatch = useAppDispatch();
  const user = useAppSelector(state => state.auth.user);
  
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  const handleSignOut = async () => {
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
              navigation.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [{ name: 'Auth' as never }],
                }),
              );
            } catch (error) {
              console.error('Sign-out failed:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleUpdateProfile = async () => {
    if (!profileForm.name.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    try {
      await dispatch(updateUserProfile({
        uid: user?.uid || '',
        updates: {
          name: profileForm.name.trim(),
          phone: profileForm.phone.trim(),
        },
      })).unwrap();
      
      setProfileModalVisible(false);
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const openProfileModal = () => {
    setProfileForm({
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
    });
    setProfileModalVisible(true);
  };

  const SettingsSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      <View style={[styles.sectionContent, { backgroundColor: colors.surface }, shadows.sm]}>
        {children}
      </View>
    </View>
  );

  const SettingsItem = ({ 
    icon, 
    title, 
    subtitle, 
    onPress, 
    rightComponent,
    showArrow = true 
  }: {
    icon: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightComponent?: React.ReactNode;
    showArrow?: boolean;
  }) => (
    <TouchableOpacity
      style={styles.settingsItem}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={styles.settingsItemLeft}>
        <View style={[styles.settingsIcon, { backgroundColor: colors.primary + '20' }]}>
          <Icon name={icon} size={20} tintColor={colors.primary} />
        </View>
        <View style={styles.settingsItemText}>
          <Text style={[styles.settingsItemTitle, { color: colors.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingsItemSubtitle, { color: colors.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {rightComponent}
        {showArrow && onPress && (
          <Icon name="arrow-right" size={16} tintColor={colors.textSecondary} />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.primary }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} tintColor="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={[styles.profileCard, { backgroundColor: colors.surface }, shadows.lg]}>
            <View style={styles.profileInfo}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
              ) : (
                <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.primary }]}>
                  <Text style={styles.profileInitials}>
                    {user?.name?.charAt(0) || user?.email?.charAt(0) || '?'}
                  </Text>
                </View>
              )}
              <View style={styles.profileDetails}>
                <Text style={[styles.profileName, { color: colors.text }]} numberOfLines={1}>
                  {user?.name || 'Guest User'}
                </Text>
                <Text style={[styles.profileEmail, { color: colors.textSecondary }]} numberOfLines={1}>
                  {user?.email || ''}
                </Text>
                <View style={[styles.roleBadge, { backgroundColor: colors.primary + '20' }]}>
                  <Text style={[styles.roleText, { color: colors.primary }]}>
                    {user?.role === 'admin' ? 'Administrator' : 'Developer'}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              onPress={openProfileModal}
              style={[styles.editProfileButton, { backgroundColor: colors.primary }]}
            >
              <Icon name="edit" size={16} tintColor="#fff" />
              <Text style={styles.editProfileText}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Settings */}
        <SettingsSection title="Account">
          <SettingsItem
            icon="account"
            title="Profile"
            subtitle="Update your personal information"
            onPress={openProfileModal}
          />
          <SettingsItem
            icon="notification"
            title="Notifications"
            subtitle="Manage notification preferences"
            onPress={() => navigation.navigate('NotificationScreen')}
          />
        </SettingsSection>

        {/* App Settings */}
        <SettingsSection title="Preferences">
          <SettingsItem
            icon="theme"
            title="Dark Mode"
            subtitle={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
            rightComponent={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: '#d6d6d6', true: colors.primary }}
                thumbColor={isDark ? '#fff' : '#f4f3f4'}
              />
            }
            showArrow={false}
          />
        </SettingsSection>

        {/* App Info */}
        <SettingsSection title="About">
          <SettingsItem
            icon="info"
            title="App Version"
            subtitle="1.0.0"
            showArrow={false}
          />
          <SettingsItem
            icon="help"
            title="Help & Support"
            subtitle="Get help and support"
            onPress={() => {
              Alert.alert(
                'Help & Support',
                'For support, please contact your administrator or check the app documentation.',
                [{ text: 'OK' }]
              );
            }}
          />
          <SettingsItem
            icon="privacy"
            title="Privacy Policy"
            subtitle="Read our privacy policy"
            onPress={() => {
              Alert.alert(
                'Privacy Policy',
                'Your privacy is important to us. This app collects minimal data required for functionality.',
                [{ text: 'OK' }]
              );
            }}
          />
        </SettingsSection>

        {/* Danger Zone */}
        <SettingsSection title="Account">
          <TouchableOpacity style={styles.dangerItem} onPress={handleSignOut}>
            <View style={styles.settingsItemLeft}>
              <View style={[styles.settingsIcon, { backgroundColor: colors.error + '20' }]}>
                <Icon name="logout" size={20} tintColor={colors.error} />
              </View>
              <Text style={[styles.dangerText, { color: colors.error }]}>Sign Out</Text>
            </View>
            <Icon name="arrow-right" size={16} tintColor={colors.error} />
          </TouchableOpacity>
        </SettingsSection>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Profile Edit Modal */}
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.primary }]}>
            <TouchableOpacity
              onPress={() => setProfileModalVisible(false)}
              style={styles.modalBackButton}
            >
              <Icon name="arrow-left" size={24} tintColor="#fff" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity
              onPress={handleUpdateProfile}
              style={styles.modalSaveButton}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Full Name *</Text>
              <TextInput
                value={profileForm.name}
                onChangeText={(text) => setProfileForm({ ...profileForm, name: text })}
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text }]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Email Address</Text>
              <TextInput
                value={profileForm.email}
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.textSecondary }]}
                editable={false}
                placeholder="Email cannot be changed"
                placeholderTextColor={colors.textSecondary}
              />
              <Text style={[styles.inputHelp, { color: colors.textSecondary }]}>
                Email address cannot be changed
              </Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: colors.text }]}>Phone Number</Text>
              <TextInput
                value={profileForm.phone}
                onChangeText={(text) => setProfileForm({ ...profileForm, phone: text })}
                style={[styles.textInput, { backgroundColor: colors.surface, color: colors.text }]}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
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
  },
  content: {
    flex: 1,
  },
  profileSection: {
    padding: 20,
    paddingBottom: 0,
  },
  profileCard: {
    padding: 20,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  profileInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  profileDetails: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 14,
    marginBottom: 8,
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  editProfileText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionContent: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  settingsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsItemText: {
    flex: 1,
  },
  settingsItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingsItemSubtitle: {
    fontSize: 13,
    lineHeight: 16,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dangerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 100,
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
  modalSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
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
    marginBottom: 20,
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
  inputHelp: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default SettingsScreen;