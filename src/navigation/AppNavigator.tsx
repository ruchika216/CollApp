import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { firestore } from '../firebase/firebaseConfig';
import { setUser } from '../store/slices/userSlice';
import { User } from '../types';

import DrawerNavigator from './DrawerNavigator';
import SplashScreen from '../screens/SplashScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/LoginScreen';
import PendingApprovalScreen from '../screens/PendingApprovalScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const user = useSelector((state: RootState) => state.user.user);
  const dispatch = useDispatch();

  useEffect(() => {
    if (user) {
      // Cast firestore to any to avoid TS type mismatch from custom config wrapper
      const fs: any = firestore as any;
      const unsubscribe = fs
        .collection('users')
        .doc(user.uid)
        .onSnapshot((doc: any) => {
          if (doc.exists) {
            dispatch(setUser(doc.data() as User));
          }
        });

      return () => unsubscribe();
    }
  }, [dispatch, user]);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {user ? (
        user.approved ? (
          <Stack.Screen name="Main" component={DrawerNavigator} />
        ) : (
          <Stack.Screen
            name="PendingApproval"
            component={PendingApprovalScreen}
          />
        )
      ) : (
        <>
          {/* Welcome is first so it's the initial route for unauthenticated users */}
          <Stack.Screen name="Welcome">
            {({ navigation }) => (
              <WelcomeScreen
                onGetStarted={() => navigation.replace('Onboarding')}
              />
            )}
          </Stack.Screen>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
