import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';

// Screen imports
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import PendingApprovalScreen from '../screens/PendingApprovalScreen';
import DrawerNavigator from './DrawerNavigator';

// Redux
import { useAppDispatch } from '../store/hooks';
import { checkAuthState } from '../store/slices/authSlice';

const Stack = createNativeStackNavigator();

// Default screen options
const defaultScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
  animation: 'slide_from_right',
  gestureEnabled: true,
  gestureDirection: 'horizontal',
  fullScreenGestureEnabled: true,
};

export default function AuthNavigator() {
  const dispatch = useAppDispatch();

  // Check auth state on app start
  useEffect(() => {
    dispatch(checkAuthState());
  }, [dispatch]);

  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={defaultScreenOptions}
    >
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ gestureEnabled: false }}
      />

      <Stack.Screen
        name="Onboarding"
        component={OnboardingScreen}
        options={{ gestureEnabled: false }}
      />

      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ gestureEnabled: false }}
      />

      <Stack.Screen
        name="PendingApproval"
        component={PendingApprovalScreen}
        options={{ gestureEnabled: false }}
      />

      <Stack.Screen
        name="Main"
        component={DrawerNavigator}
        options={{ gestureEnabled: false }}
      />
    </Stack.Navigator>
  );
}
