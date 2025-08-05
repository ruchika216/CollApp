import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../components/common/Icon';
import { useTheme } from '../theme/useTheme';
import { useAppSelector } from '../store/hooks';

import ProfileScreen from '../screens/ProfileScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProjectStackNavigator from './ProjectStackNavigator';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import DeveloperDashboard from '../screens/Developer/DeveloperDashboard';
import HomeScreen from '../screens/HomeScreen';

const Tab = createBottomTabNavigator();
const { width: WINDOW_WIDTH } = Dimensions.get('window');

interface CustomTabBarProps {
  state: any;
  navigation: any;
}

function CustomTabBar({ state, navigation }: CustomTabBarProps) {
  const { colors, gradients, shadows } = useTheme();

  const tabs = [
    { name: 'Home', icon: 'home' as const, label: 'Home' },
    { name: 'Projects', icon: 'project' as const, label: 'Projects' },
    { name: 'Dashboard', icon: 'dashboard' as const, label: 'Dashboard', isCenter: true },
    { name: 'Notifications', icon: 'notification' as const, label: 'Notifications' },
    { name: 'Profile', icon: 'account' as const, label: 'Profile' },
  ];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.bar,
          { backgroundColor: colors.card },
          shadows.xl,
        ]}
      >
        {tabs.map((tab, index) => {
          const isFocused = state.index === index;
          const isCenter = tab.isCenter;

          if (isCenter) {
            return (
              <View key={tab.name} style={styles.centerButtonContainer}>
                <TouchableOpacity
                  style={styles.centerButton}
                  activeOpacity={0.8}
                  onPress={() => {
                    const event = navigation.emit({
                      type: 'tabPress',
                      target: state.routes[index].key,
                      canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                      navigation.navigate(tab.name);
                    }
                  }}
                >
                  <LinearGradient
                    colors={isFocused ? gradients.primary : gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.centerGradient}
                  >
                    <Icon
                      name={tab.icon}
                      size={28}
                      tintColor="#fff"
                    />
                  </LinearGradient>
                </TouchableOpacity>
                <Text
                  style={[
                    styles.centerLabel,
                    {
                      color: isFocused ? colors.primary : colors.iconSecondary,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </View>
            );
          }

          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tabButton}
              activeOpacity={0.7}
              onPress={() => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: state.routes[index].key,
                  canPreventDefault: true,
                });

                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(tab.name);
                }
              }}
            >
              <View style={styles.tabContent}>
                <Icon
                  name={tab.icon}
                  size={22}
                  tintColor={isFocused ? colors.primary : colors.iconInactive}
                />
                <Text
                  style={[
                    styles.label,
                    {
                      color: isFocused ? colors.primary : colors.iconInactive,
                    },
                  ]}
                >
                  {tab.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Create a wrapper component for Dashboard to handle role-based rendering
const DashboardScreen = () => {
  const user = useAppSelector(state => state.user);
  const isAdmin = user?.role === 'admin';
  return isAdmin ? <AdminDashboard /> : <DeveloperDashboard />;
};

export default function BottomNavigator() {

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={props => <CustomTabBar {...props} />}
      initialRouteName="Home"
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Projects" component={ProjectStackNavigator} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    width: WINDOW_WIDTH,
    alignItems: 'center',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: Platform.OS === 'ios' ? 16 : 12,
    height: Platform.OS === 'ios' ? 80 : 70,
    borderRadius: Platform.OS === 'ios' ? 40 : 35,
    alignItems: 'center',
    justifyContent: 'space-around',
    width: WINDOW_WIDTH - 40,
    marginBottom: Platform.OS === 'ios' ? 10 : 0,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 25,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  centerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? -45 : -35, // Elevate the button above the tab bar
    zIndex: 10,
  },
  centerButton: {
    width: Platform.OS === 'ios' ? 70 : 64,
    height: Platform.OS === 'ios' ? 70 : 64,
    borderRadius: Platform.OS === 'ios' ? 35 : 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'ios' ? 12 : 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  centerGradient: {
    width: Platform.OS === 'ios' ? 70 : 64,
    height: Platform.OS === 'ios' ? 70 : 64,
    borderRadius: Platform.OS === 'ios' ? 35 : 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Platform.OS === 'ios' ? 4 : 3,
    borderColor: '#FFFFFF',
  },
  centerLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: -4,
  },
});
