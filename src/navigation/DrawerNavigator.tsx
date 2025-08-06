import React from 'react';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
  DrawerContentComponentProps,
} from '@react-navigation/drawer';
import { View, Image, Text, Switch, StyleSheet, Platform } from 'react-native';
import Icon from '../components/common/Icon';
import BottomNavigator from './BottomNavigator';
import RouteProtection from '../components/auth/RouteProtection';
import { useTheme } from '../theme/useTheme';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { clearUser, signOut } from '../store/slices/userSlice';
import { CommonActions } from '@react-navigation/native';

type DrawerParamList = {
  Dashboard: undefined;
  Settings: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

function CustomDrawerContent(props: DrawerContentComponentProps) {
  const dispatch = useAppDispatch();
  const { colors, isDark, toggleTheme } = useTheme();
  const user = useAppSelector(state => state.user.user);
  const styles = makeStyles(isDark);

  const handleSignOut = async () => {
    try {
      await dispatch(signOut()).unwrap();
      dispatch(clearUser());
      props.navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'Login' as never }],
        }),
      );
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  return (
    <DrawerContentScrollView
      {...props}
      style={styles.drawerContent}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* User Profile Section */}
      <View style={styles.profileSection}>
        {user?.photoURL ? (
          <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
        ) : (
          <View style={styles.profileImagePlaceholder}>
            <Text style={styles.profileInitials}>
              {user?.name?.[0]?.toUpperCase() ||
                user?.email?.[0]?.toUpperCase() ||
                '?'}
            </Text>
          </View>
        )}

        <Text style={styles.userName} numberOfLines={1} ellipsizeMode="tail">
          {user?.name || 'Guest'}
        </Text>
        <Text style={styles.userEmail} numberOfLines={1} ellipsizeMode="tail">
          {user?.email || ''}
        </Text>
      </View>

      <View style={{ flex: 1, marginTop: 16 }}>
        <DrawerItemList {...props} />
      </View>

      <View style={styles.footerSection}>
        <View style={styles.toggleContainer}>
          <Text style={styles.toggleLabel}>Dark Mode</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{
              false: '#d6d6d6',
              true: '#7155ff',
            }}
            thumbColor={isDark ? '#4611f8' : '#fff'}
            ios_backgroundColor="#d6d6d6"
          />
        </View>

        <DrawerItem
          label="Sign Out"
          onPress={handleSignOut}
          icon={({ size }) => (
            <Icon
              name="logout"
              size={size}
              tintColor={isDark ? '#ae9cff' : '#4611f8'}
            />
          )}
          labelStyle={styles.signOutLabel}
          style={styles.signOutButton}
          pressColor={isDark ? '#232155' : '#dcd6ff'}
          pressOpacity={0.7}
        />
      </View>
    </DrawerContentScrollView>
  );
}

export default function DrawerNavigator() {
  const { isDark } = useTheme();
  return (
    <RouteProtection requireApproval={true}>
      <Drawer.Navigator
        drawerContent={props => <CustomDrawerContent {...props} />}
        screenOptions={{
          headerShown: false,
          drawerActiveBackgroundColor: isDark ? '#28214b80' : '#dcd6ff60',
          drawerActiveTintColor: isDark ? '#ae9cff' : '#4611f8',
          drawerInactiveTintColor: isDark ? '#ae9cff' : '#6a60b8',
          drawerLabelStyle: {
            fontWeight: '600',
            fontSize: 15,
            color: isDark ? '#eae6ff' : '#211e40',
          },
          drawerStyle: {
            backgroundColor: isDark ? '#181533' : '#fff',
            width: 280,
            borderTopRightRadius: 32,
            borderBottomRightRadius: 32,
            elevation: 15,
            shadowColor: isDark ? '#2a2572' : '#4611f8',
            shadowOpacity: isDark ? 0.35 : 0.2,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 8 },
          },
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

function makeStyles(isDark: boolean) {
  return StyleSheet.create({
    drawerContent: {
      flex: 1,
      backgroundColor: isDark ? '#181533' : '#fff',
    },
    profileSection: {
      marginHorizontal: 18,
      marginTop: 26,
      marginBottom: 12,
      paddingVertical: 24,
      paddingHorizontal: 20,
      backgroundColor: isDark ? '#211e40' : '#f9f9ff',
      borderRadius: 28,
      alignItems: 'center',
      shadowColor: isDark ? '#28214b' : '#4611f8',
      shadowOpacity: isDark ? 0.3 : 0.11,
      shadowRadius: 22,
      shadowOffset: { width: 0, height: 10 },
      elevation: 10,
    },
    profileImage: {
      width: 88,
      height: 88,
      borderRadius: 44,
      marginBottom: 14,
    },
    profileImagePlaceholder: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: isDark ? '#272655' : '#e0dafc',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 14,
    },
    profileInitials: {
      fontSize: 38,
      fontWeight: '700',
      color: isDark ? '#ae9cff' : '#4611f8',
    },
    userName: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#eae6ff' : '#2c2a57',
      marginBottom: 4,
    },
    userEmail: {
      fontSize: 14,
      color: isDark ? '#aea9c1' : '#7a78a9',
    },
    footerSection: {
      marginTop: 'auto',
      paddingTop: 16,
      paddingHorizontal: 24,
      paddingBottom: Platform.OS === 'ios' ? 32 : 24,
      borderTopWidth: 1,
      borderTopColor: isDark ? '#23194b' : '#dad9f8',
      backgroundColor: isDark ? '#1a1635' : '#fafaff',
      borderTopRightRadius: 32,
      borderBottomRightRadius: 32,
    },
    toggleContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 18,
    },
    toggleLabel: {
      fontSize: 17,
      color: isDark ? '#ae9cff' : '#463fad',
      fontWeight: '600',
    },
    signOutButton: {
      borderRadius: 24,
    },
    signOutLabel: {
      color: isDark ? '#ae9cff' : '#4611f8',
      fontWeight: '700',
      fontSize: 17,
    },
  });
}
