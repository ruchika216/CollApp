// // src/screens/LoginScreen.tsx

import React, { useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Image,
  Alert,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import Ionicons from 'react-native-vector-icons/Ionicons';

import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppDispatch } from '../store/hooks';
import { signInWithGoogle, setUser } from '../store/slices/userSlice';
import { useTheme } from '../theme/useTheme';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function LoginScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { colors, gradients, isDark } = useTheme();

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      // Use Redux thunk to handle Google sign-in
      const result = await dispatch(signInWithGoogle()).unwrap();

      // Navigate based on user approval status
      if (!result.approved) {
        navigation.replace('PendingApproval');
      } else {
        navigation.replace('Main');
      }

      // Show welcome message for new users (if they're approved)
      if (result.approved) {
        const isNewUser = !result.createdAt || 
          (new Date().getTime() - new Date(result.createdAt).getTime()) < 60000; // Less than 1 minute old
        
        if (isNewUser) {
          Alert.alert(
            'Welcome!',
            result.role === 'admin' 
              ? 'Welcome, Admin! You have full access to the system.'
              : 'Welcome to the team! Your account has been approved.',
            [{ text: 'OK' }],
          );
        }
      } else {
        Alert.alert(
          'Account Created',
          'Your account has been created and is pending admin approval. You will be notified once approved.',
          [{ text: 'OK' }],
        );
      }
    } catch (e: any) {
      console.error('Login error:', e);
      Alert.alert(
        'Login Failed',
        e.message || 'An error occurred. Please try again.',
        [{ text: 'OK' }],
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={gradients.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <SafeAreaView style={styles.safe}>
        <StatusBar 
          barStyle={isDark ? "light-content" : "dark-content"} 
          backgroundColor={colors.background} 
        />

        {/* COLLAPP Title */}
        <MaskedView
          style={styles.maskedView}
          maskElement={
            <Text style={styles.appName}>
              <Text style={styles.coll}>COLL</Text>
              <Text style={styles.app}>APP</Text>
            </Text>
          }
        >
          <LinearGradient
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            colors={gradients.primary}
            style={styles.gradientText}
          />
        </MaskedView>

        {/* Card */}
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <Image
            source={require('../assets/images/4.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={[styles.headline, { color: colors.text }]}>Welcome Back</Text>
          <Text style={[styles.sub, { color: colors.textSecondary }]}>
            Sign in to organize your projects and collaborate seamlessly.
          </Text>

          {/* Google */}
          <TouchableOpacity
            style={[
              styles.button, 
              styles.googleButton, 
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
            activeOpacity={0.85}
            onPress={handleGoogleLogin}
            disabled={loading}
          >
            <Ionicons name="logo-google" size={24} color="#EA4335" />
            <Text style={[styles.googleText, { color: colors.text }]}>
              {loading ? 'Signing in…' : 'Continue with Google'}
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const SHADOW = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  android: {
    elevation: 8,
  },
});

const styles = StyleSheet.create({
  background: { flex: 1 },
  safe: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },

  // Title
  maskedView: {
    width: width * 0.75,
    height: 48,
    marginTop: 40,
    marginBottom: 16,
  },
  gradientText: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  appName: {
    fontSize: 40,
    // fontFamily: FONTS.bold,
    // color: COLORS.text,
    textAlign: 'center',
  },
  coll: { fontWeight: '800' },
  app: { fontWeight: '400' },

  // Card
  card: {
    flex: 1,
    width: width,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    paddingTop: 32,
    paddingHorizontal: 32,
    alignItems: 'center',
    ...SHADOW,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 24,
  },
  headline: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
  },
  sub: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },

  // Buttons
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 54,
    borderRadius: 27,
    marginBottom: 16,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  googleButton: {
    borderWidth: 1,
    ...SHADOW,
  },
  appleButton: {
    backgroundColor: '#000',
    ...SHADOW,
  },

  googleText: {
    flex: 1,
    textAlign: 'center',
    marginLeft: -24,
    fontSize: 16,
    fontWeight: '600',
  },
  appleText: {
    flex: 1,
    textAlign: 'center',
    marginLeft: -24,
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});
