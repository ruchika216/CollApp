// src/navigation/DrawerNavigator.tsx

import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import {
  View,
  Image,
  Text,
  Switch,
  StyleSheet,
  Platform,
} from 'react-native';
import Icon from '../components/common/Icon';

// Navigation & Screens
import BottomNavigator from './BottomNavigator';
import RouteProtection from '../components/auth/RouteProtection';

// Theme & State Management
import { useTheme } from '../theme/useTheme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearUser, signOut } from '../store/slices/userSlice';
import { CommonActions } from '@react-navigation/native';

// Types
type DrawerParamList = {
  Dashboard: undefined;
  Settings: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

// Custom Drawer Content Component
function CustomDrawerContent(props: DrawerContentComponentProps) {
  const dispatch = useAppDispatch();
  const { colors, isDark, toggleTheme } = useTheme();
  const user = useAppSelector(state => state.user.user);

  const handleSignOut = async () => {
    try {
      await dispatch(signOut()).unwrap();
      dispatch(clearUser());
      // Reset navigation stack and go to login
      props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' as never }],
        })
      );
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  return (
    <DrawerContentScrollView
      {...props}
      style={{ backgroundColor: colors.background }}
    >
      {/* User Profile Section */}
      <View
        style={[styles.profileSection, { borderBottomColor: colors.border }]}
      >
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
        ) : (
          <View
            style={[
              styles.profileImagePlaceholder,
              { backgroundColor: colors.disabled },
            ]}
          >
            <Text style={[styles.profileImageText, { color: colors.text }]}>
              {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}
        <Text style={[styles.userName, { color: colors.text }]}>
          {user?.name || 'Guest'}
        </Text>
        <Text style={[styles.userEmail, { color: colors.subtext }]}>
          {user?.email || ''}
        </Text>
      </View>

      <DrawerItemList {...props} />

      {/* Theme Toggle */}
      <View style={[styles.toggleContainer, { borderTopColor: colors.border }]}>
        <Text style={[styles.toggleLabel, { color: colors.text }]}>
          Dark Mode
        </Text>
        <Switch
          value={isDark}
          onValueChange={toggleTheme}
          trackColor={{ false: colors.disabled, true: colors.primary }}
          thumbColor={isDark ? colors.accent : '#f4f3f4'}
        />
      </View>

      {/* Sign Out Button */}
      <DrawerItem
        label="Sign Out"
        onPress={handleSignOut}
        icon={({ size }) => (
          <Icon name="logout" size={size} tintColor={colors.error} />
        )}
        style={styles.signOutButton}
        labelStyle={[styles.signOutLabel, { color: colors.error }]}
      />
    </DrawerContentScrollView>
  );
}

// Main Drawer Navigator
export default function DrawerNavigator() {
  return (
    <RouteProtection requireApproval={true}>
      <Drawer.Navigator
        drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerActiveBackgroundColor: '#4356af20',
          drawerActiveTintColor: '#4356af',
          drawerInactiveTintColor: '#333',
        }}
      >
        <Drawer.Screen
          name="Dashboard"
          component={BottomNavigator}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="dashboard" size={size} tintColor={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Settings"
          component={BottomNavigator}
          options={{
            drawerIcon: ({ color, size }) => (
              <Icon name="settings" size={size} tintColor={color} />
            ),
          }}
        />
      </Drawer.Navigator>
    </RouteProtection>
  );
}

const styles = StyleSheet.create({
  profileSection: {
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  profileImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  profileImageText: {
    fontSize: 32,
    color: '#666',
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 'auto',
  },
  toggleLabel: {
    fontSize: 16,
    color: '#333',
  },
  signOutButton: {
    marginTop: 8,
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  signOutLabel: {
    color: '#d32f2f',
  },
});
