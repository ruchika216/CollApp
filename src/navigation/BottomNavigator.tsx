// CurvedBottomNavigator.tsx - With labels below icons, no label for dashboard
import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Platform,
  Image,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Svg, { Path } from 'react-native-svg';
import Icon from '../components/common/Icon';
import { useTheme } from '../theme/useTheme';
import { useAppSelector } from '../store/hooks';
import AppName from '../components/common/AppName';

// Screen imports
import ProfileScreen from '../screens/ProfileScreen';
import ChatScreen from '../screens/ChatScreen';
import ProjectStackNavigator from './ProjectStackNavigator';
import AdminDashboard from '../screens/Admin/AdminDashboard';
import DeveloperDashboard from '../screens/Developer/DeveloperDashboard';
import HomeScreenEnhanced from '../screens/HomeScreenEnhanced';

const { width } = Dimensions.get('window');
const Tab = createBottomTabNavigator();

const tabs = [
  { name: 'Home', icon: 'home', label: 'Home' },
  { name: 'Projects', icon: 'project', label: 'Projects' },
  { name: 'Dashboard', icon: 'dashboard', label: 'Dashboard', isCenter: true },
  { name: 'Chat', icon: 'comment', label: 'Chat' },
  { name: 'Profile', icon: 'account', label: 'Profile' },
];

// Curved Tab Bar Shape Component
const CurvedShape = ({
  width: shapeWidth,
  height,
  colors,
}: {
  width: number;
  height: number;
  colors: any;
}) => {
  const centerX = shapeWidth / 2;

  // Rounded top corners
  const cornerRadius = 20;
  // Symmetric center notch parameters
  const notchHalfWidth = 56; // half the width of the notch
  const notchDepth = 28; // depth (vertical) of the notch
  const c = notchHalfWidth * 0.6; // control point offset for a smooth U-curve

  const lx = centerX - notchHalfWidth;
  const rx = centerX + notchHalfWidth;

  // Perfectly symmetric path using mirrored cubic Beziers with 'S' for smoothness
  const pathData = `
    M 0 ${cornerRadius}
    Q 0 0 ${cornerRadius} 0
    L ${lx} 0
    C ${lx + c} 0 ${centerX - c} ${notchDepth} ${centerX} ${notchDepth}
    S ${rx - c} 0 ${rx} 0
    L ${shapeWidth - cornerRadius} 0
    Q ${shapeWidth} 0 ${shapeWidth} ${cornerRadius}
    L ${shapeWidth} ${height}
    L 0 ${height}
    Z
  `;

  return (
    <Svg
      width={shapeWidth}
      height={height}
      style={StyleSheet.absoluteFillObject}
    >
      <Path d={pathData} fill={colors?.card || '#FFFFFF'} />
    </Svg>
  );
};

// Curved Custom Tab Bar with Labels
function CurvedTabBar({ state, navigation }: any) {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

  const safeColors = {
    primary: colors?.primary || '#6a01f6',
    card: colors?.card || '#FFFFFF',
    inactive: '#8E8E93',
    text: colors?.text || '#1F2937',
    shadowColor: 'rgba(0,0,0,0.1)',
  };

  // Inactive color constant unused; icons/labels use theme primary for consistency

  const handleTabPress = (tab: any, index: number) => {
    const isFocused = state.index === index;
    if (!isFocused) {
      navigation.navigate(tab.name);
    }
  };

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      <View style={styles.tabBarContainer}>
        {/* Curved Background Shape */}
        <View style={styles.curvedContainer}>
          <CurvedShape width={width - 40} height={90} colors={safeColors} />

          {/* Shadow Layer */}
          <View style={styles.shadowContainer}>
            <CurvedShape
              width={width - 40}
              height={90}
              colors={{ card: safeColors.shadowColor }}
            />
          </View>
        </View>

        {/* Tab Buttons */}
        <View style={styles.tabButtonsContainer}>
          {tabs.map((tab, index) => {
            const isFocused = state.index === index;

            if (tab.isCenter) {
              return (
                <View key={tab.name} style={styles.centerButtonWrapper}>
                  <TouchableOpacity
                    style={[
                      styles.centerButton,
                      styles.centerButtonWhite,
                      styles.centerButtonBlueBorder,
                      isFocused && styles.centerButtonActive,
                    ]}
                    onPress={() => handleTabPress(tab, index)}
                    activeOpacity={0.8}
                  >
                    <Icon
                      name="dashboard"
                      size={30}
                      tintColor={safeColors.primary}
                    />
                  </TouchableOpacity>
                  {Platform.OS === 'ios' && isFocused && (
                    <Text
                      style={[
                        styles.centerLabel,
                        { color: safeColors.primary },
                      ]}
                    >
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
                onPress={() => handleTabPress(tab, index)}
                activeOpacity={0.7}
              >
                <View style={styles.tabContent}>
                  {/* Icon Container with active background */}
                  <View
                    style={[
                      styles.iconContainer,
                      isFocused && styles.iconContainerActive,
                      isFocused && { backgroundColor: safeColors.primary },
                    ]}
                  >
                    <Icon
                      name={tab.icon as any}
                      size={22}
                      tintColor={isFocused ? '#FFFFFF' : safeColors.primary}
                    />
                  </View>

                  {/* Label below icon */}
                  <Text
                    style={[
                      styles.tabLabel,
                      isFocused
                        ? styles.tabLabelActive
                        : styles.tabLabelInactive,
                      { color: safeColors.primary },
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
    </View>
  );
}

// Clean Header Component
const CleanHeader = ({ navigation }: any) => {
  const { colors } = useTheme();
  const notifications = useAppSelector(
    state => state.notifications?.notifications || [],
  );
  const unreadCount = notifications.filter(n => !n.read).length;

  const safeColors = colors || {
    primary: '#FF9800',
    background: '#FFFFFF',
    text: '#000000',
  };

  return (
    <View style={[styles.header, { backgroundColor: safeColors.background }]}>
      <View style={styles.headerContent}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../assets/images/4.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <AppName size="medium" variant="primary" />
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate('NotificationScreen')}
            activeOpacity={0.7}
          >
            <Icon
              name="notification"
              size={24}
              tintColor={safeColors.primary}
            />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : unreadCount.toString()}
                </Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.toggleDrawer()}
            activeOpacity={0.7}
          >
            <Icon name="menu" size={24} tintColor={safeColors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Dashboard Screen
const DashboardScreen = () => {
  const user = useAppSelector(state => state.auth.user);
  return user?.role === 'admin' ? <AdminDashboard /> : <DeveloperDashboard />;
};

// Main Navigator
const renderTabBar = (props: any) => <CurvedTabBar {...props} />;
const renderHeader = (props: any) => (
  <CleanHeader navigation={props.navigation} />
);

function CurvedBottomNavigator() {
  const { colors } = useTheme();
  const safeColors = colors || { background: '#F8F9FA' };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={renderTabBar}
      screenOptions={{
        headerShown: true,
        header: renderHeader,
        headerStyle: {
          backgroundColor: safeColors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreenEnhanced as any} />
      <Tab.Screen name="Projects" component={ProjectStackNavigator} />
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default CurvedBottomNavigator;

const styles = StyleSheet.create({
  // Header Styles
  header: {
    paddingTop: Platform.OS === 'ios' ? 44 : 20,
    paddingBottom: 8,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    height: 44,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 28,
    height: 28,
    marginRight: 10,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  headerIconButton: {
    position: 'relative',
    padding: 4,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },

  // Curved Tab Bar Styles
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
  tabBarContainer: {
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 25 : 20,
    height: Platform.OS === 'ios' ? 115 : 110,
  },
  curvedContainer: {
    position: 'relative',
    height: 90,
  },
  shadowContainer: {
    position: 'absolute',
    top: 3,
    left: 0,
    right: 0,
    opacity: 0.15,
    zIndex: -1,
  },
  tabButtonsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 12,
    height: 90,
  },

  // Tab Buttons with Labels
  tabButton: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: 60,
    height: 75,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  iconContainerActive: {
    borderRadius: 18,
  },

  // Tab Labels
  tabLabel: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '600',
  },
  tabLabelInactive: {
    fontWeight: '500',
  },

  // Center Button
  centerButtonWrapper: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 75,
  },
  centerButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -35,
    borderWidth: 4,
    borderColor: '#FFFFFF',
    ...Platform.select({
      ios: {
        shadowColor: '#6a01f6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
      },
      android: {
        elevation: 15,
        shadowColor: '#6a01f6',
      },
    }),
  },
  centerButtonActive: {
    transform: [{ scale: 1.05 }],
  },
  centerButtonWhite: {
    backgroundColor: '#FFFFFF',
  },
  centerButtonBlueBorder: {
    borderWidth: 1,
    borderColor: '#0d13bc', // fallback; overridden visually by white border + theme blue via shadow
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: Platform.OS === 'ios' ? 8 : 6,
    textAlign: 'center',
  },
});
