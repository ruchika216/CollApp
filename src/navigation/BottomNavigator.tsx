import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import LinearGradient from 'react-native-linear-gradient';
import Icon from '../components/common/Icon';
import { useTheme } from '../theme/useTheme';
import { useAppSelector } from '../store/hooks';
import IOSHeader from '../components/common/IOSHeader';
import AppName from '../components/common/AppName';

import ProfileScreen from '../screens/ProfileScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ChatScreen from '../screens/ChatScreen';
import ProjectStackNavigator from './ProjectStackNavigator';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import DeveloperDashboard from '../screens/Developer/DeveloperDashboard';
import HomeScreenEnhanced from '../screens/HomeScreenEnhanced';
import { COLORS } from '../theme';

const Tab = createBottomTabNavigator();
const { width: WINDOW_WIDTH } = Dimensions.get('window');

interface CustomTabBarProps {
  state: any;
  navigation: any;
}

function CustomTabBar({ state, navigation }: CustomTabBarProps) {
  const { colors, gradients, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  const tabs = [
    { name: 'Home', icon: 'home' as const, label: 'Home' },
    { name: 'Projects', icon: 'project' as const, label: 'Projects' },
    {
      name: 'Dashboard',
      icon: 'dashboard' as const,
      label: 'Dashboard',
      isCenter: true,
    },
    {
      name: 'Chat',
      icon: 'chat' as const,
      label: 'Chat',
    },
    { name: 'Profile', icon: 'account' as const, label: 'Profile' },
  ];

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={[styles.bar, { backgroundColor: colors.card }, shadows.xl]}>
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
                    colors={gradients.primary}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[
                      styles.centerGradient,
                      { borderColor: colors.card },
                    ]}
                  >
                    <Icon
                      name={tab.icon}
                      size={32}
                      tintColor={colors.textOnPrimary}
                    />
                  </LinearGradient>
                </TouchableOpacity>
                {isFocused && Platform.OS === 'ios' && (
                  <Text style={[styles.centerLabel, { color: colors.primary }]}>
                    {tab.label}
                  </Text>
                )}
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
                  size={25}
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

const DashboardScreen = () => {
  const user = useAppSelector(state => state.auth.user);
  const isAdmin = user?.role === 'admin';
  return isAdmin ? <AdminDashboard /> : <DeveloperDashboard />;
};

const HeaderLogo = () => (
  <View style={styles.headerTitleContainer}>
    <Image
      source={require('../assets/images/4.png')}
      style={styles.logo}
      resizeMode="contain"
    />
    <AppName 
      size="medium" 
      variant="gradient"
      style={{ marginLeft: 0 }}
    />
  </View>
);

const HeaderActions = ({ navigation }: { navigation: any }) => {
  const { colors } = useTheme();
  const notifications = useAppSelector(
    state => state.notifications?.notifications || [],
  );
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <View style={styles.headerActions}>
      {/* Notification Icon */}
      <TouchableOpacity
        style={styles.notificationButton}
        onPress={() => navigation.navigate('NotificationScreen')}
        activeOpacity={0.7}
      >
        <Icon name="notification" size={24} tintColor={colors.primary} />
        {unreadCount > 0 && (
          <View style={styles.badgeContainer}>
            <Text style={styles.badgeText}>
              {unreadCount > 99 ? '99+' : unreadCount.toString()}
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Menu Button */}
      <TouchableOpacity
        style={styles.menuButton}
        onPress={() => navigation.toggleDrawer()}
        activeOpacity={0.7}
      >
        <Icon name="menu" size={26} tintColor={colors.primary} />
      </TouchableOpacity>
    </View>
  );
};

function BottomNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={({ navigation }) => ({
        headerShown: Platform.OS === 'ios' ? true : true,
        header: Platform.OS === 'ios' ? 
          () => <IOSHeader navigation={navigation} /> :
          undefined,
        headerTitle: Platform.OS === 'android' ? '' : undefined,
        headerLeft: Platform.OS === 'android' ? () => <HeaderLogo /> : undefined,
        headerRight: Platform.OS === 'android' ? () => <HeaderActions navigation={navigation} /> : undefined,
        headerStyle: Platform.OS === 'android' ? {
          backgroundColor: COLORS.background,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
          height: 70,
          shadowOffset: { width: 0, height: 2 },
        } : undefined,
        headerTintColor: Platform.OS === 'android' ? COLORS.primary : undefined,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreenEnhanced} />
      <Tab.Screen name="Projects" component={ProjectStackNavigator} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default BottomNavigator;

const styles = StyleSheet.create({
  logo: {
    width: 28,
    height: 28,
    marginRight: 8,
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
  },
  appName: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  notificationButton: {
    position: 'relative',
    padding: 6,
    marginRight: 8,
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  menuButton: {
    padding: 6,
  },
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  bar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 16 : 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 12,
    height: Platform.OS === 'ios' ? 75 : 70,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    borderTopWidth: 0.5,
    borderColor: 'rgba(0,0,0,0.1)',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
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
    fontSize: 10,
    marginTop: 4,
    fontWeight: '600',
  },
  centerButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Platform.OS === 'ios' ? -30 : -35,
    zIndex: 15,
  },
  centerButton: {
    width: Platform.OS === 'ios' ? 68 : 72,
    height: Platform.OS === 'ios' ? 68 : 72,
    borderRadius: Platform.OS === 'ios' ? 34 : 36,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 16,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  centerGradient: {
    width: Platform.OS === 'ios' ? 68 : 72,
    height: Platform.OS === 'ios' ? 68 : 72,
    borderRadius: Platform.OS === 'ios' ? 34 : 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: Platform.OS === 'ios' ? 3 : 4,
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'center',
  },
});
