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
import Icon from '../components/common/Icon';
import { useTheme } from '../theme/useTheme';
import { ICON_SIZES } from '../theme';

import ProfileScreen from '../screens/ProfileScreen';
import NotificationScreen from '../screens/NotificationScreen';
import ProjectScreen from '../screens/ProjectScreen';

const Tab = createBottomTabNavigator();
const { width: WINDOW_WIDTH } = Dimensions.get('window');

function CustomTabBar({ state, navigation }) {
  const { colors, theme } = useTheme();

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.bar,
          { backgroundColor: colors.card },
          theme.shadow.medium,
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          // Icon mapping
          const iconMapping = {
            Dashboard: 'dashboard',
            Projects: 'project',
            Notifications: 'notification',
            Profile: 'account',
            Home: 'home',
          };

          const iconName = iconMapping[route.name] || 'home';

          return (
            <TouchableOpacity
              key={route.name}
              style={styles.tabButton}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(route.name)}
            >
              <Icon
                name={iconName}
                size={ICON_SIZES.medium}
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
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function BottomNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Dashboard" component={ProfileScreen} />
      <Tab.Screen name="Projects" component={ProjectScreen} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 24 : 16,
    width: WINDOW_WIDTH,
    alignItems: 'center',
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 15,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'space-between',
    width: WINDOW_WIDTH - 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
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
    height: 64,
  },
  label: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
});
