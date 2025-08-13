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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { useAppDispatch } from '../store/hooks';
import { signInWithGoogle, setUser } from '../store/slices/userSlice';
import { useThemeWithFallbacks } from '../hooks/useThemeWithFallbacks';
import { createShadow } from '../theme/themeUtils';

const { width } = Dimensions.get('window');

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function LoginScreen({ navigation }: Props) {
  const [loading, setLoading] = useState(false);
  const dispatch = useAppDispatch();
  const { colors, typography, spacing, isDark } = useThemeWithFallbacks();

  // Safety checks for gradients with fallbacks
  const safeColors = colors || {
    background: '#ffffff',
    card: '#ffffff',
    text: '#000000',
    textSecondary: '#64748b',
    border: '#e5e7eb',
    primary: '#6a01f6',
    gradients: {
      background: ['#ffffff', '#f8fafc'],
      primary: ['#6a01f6', '#7d1aff'], // Same vibrant gradient as SplashScreen
    },
  };

  const safeTypography = typography || {
    fontSize: { lg: 16, xl: 20, '2xl': 24 },
    fontFamily: {
      dynaPuffBold: 'System',
      dynaPuffRegular: 'System',
    },
  };

  const safeSpacing = spacing || {
    screen: { horizontal: 24 },
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  };

  const backgroundGradient = safeColors.gradients?.background || [
    '#ffffff',
    '#f8fafc',
  ];

  // Use the SAME vibrant gradient as SplashScreen
  const primaryGradient = safeColors.gradients?.primary || [
    '#6a01f6',
    '#7d1aff',
  ];

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);

      const result = await dispatch(signInWithGoogle()).unwrap();

      if (!result.approved) {
        navigation.replace('PendingApproval');
      } else {
        navigation.replace('Main');
      }

      if (result.approved) {
        const isNewUser =
          !result.createdAt ||
          new Date().getTime() - new Date(result.createdAt).getTime() < 60000;

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

  const handleAppleLogin = async () => {
    Alert.alert(
      'Coming Soon',
      'Apple Sign-In will be available in the next update.',
      [{ text: 'OK' }],
    );
  };

  const getFont = (weight: 'regular' | 'bold') =>
    Platform.select({
      ios: `DynaPuff-${weight === 'bold' ? 'Bold' : 'Regular'}`,
      android: `DynaPuff-${weight === 'bold' ? 'Bold' : 'Regular'}`,
      default: 'System',
    });

  const styles = createStyles(safeColors, safeTypography, safeSpacing);

  return (
    <LinearGradient
      colors={backgroundGradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.background}
    >
      <SafeAreaView style={styles.safe}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={safeColors.background}
        />

        {/* COLLAPP Title - Exactly matching SplashScreen */}
        <View style={styles.headerContainer}>
          <MaskedView
            style={styles.maskedView}
            maskElement={
              <Text style={[styles.appNameText, { color: '#000' }]}>
                <Text style={[styles.collText, { color: '#000' }]}>COLL</Text>
                <Text style={[styles.appText, { color: '#000' }]}>APP</Text>
              </Text>
            }
          >
            <LinearGradient
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              colors={primaryGradient}
              style={styles.gradientMask}
            >
              <Text style={[styles.appNameText, { opacity: 0 }]}>COLLAPP</Text>
            </LinearGradient>
          </MaskedView>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/4.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <Text
            style={[
              styles.headline,
              { color: colors.text, fontFamily: getFont('bold') },
            ]}
          >
            Welcome Back
          </Text>
          <Text style={styles.subtitle}>
            Sign in to organize your projects and collaborate seamlessly.
          </Text>

          {/* Login Buttons Container */}
          <View style={styles.buttonsContainer}>
            {/* Google Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, styles.googleButton]}
              activeOpacity={0.85}
              onPress={handleGoogleLogin}
              disabled={loading}
            >
              <FontAwesome name="google" size={24} color="#EA4335" />
              <Text style={[styles.buttonText, styles.googleText]}>
                {loading ? 'Signing in…' : 'Continue with Google'}
              </Text>
            </TouchableOpacity>

            {/* Apple Login Button */}
            <TouchableOpacity
              style={[styles.loginButton, styles.appleButton]}
              activeOpacity={0.85}
              onPress={handleAppleLogin}
              disabled={loading}
            >
              <FontAwesome name="apple" size={24} color="#ffffff" />
              <Text style={[styles.buttonText, styles.appleText]}>
                Continue with Apple
              </Text>
            </TouchableOpacity>
          </View>

          {/* Terms and Privacy */}
          <Text style={styles.termsText}>
            By continuing, you agree to our{' '}
            <Text style={styles.linkText}>Terms of Service</Text> and{' '}
            <Text style={styles.linkText}>Privacy Policy</Text>
          </Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const createStyles = (colors: any, typography: any, spacing: any) => {
  const getFont = (weight: 'regular' | 'bold') =>
    Platform.select({
      ios: `DynaPuff-${weight === 'bold' ? 'Bold' : 'Regular'}`,
      android: `DynaPuff-${weight === 'bold' ? 'Bold' : 'Regular'}`,
      default: 'System',
    });

  const SHADOW = Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 16,
    },
    android: {
      elevation: 10,
    },
  });

  return StyleSheet.create({
    background: { flex: 1 },
    safe: {
      flex: 1,
      paddingHorizontal: spacing.screen.horizontal,
    },

    // Header - EXACTLY matching SplashScreen
    headerContainer: {
      alignItems: 'center',
      marginTop: spacing.xxxl,
      marginBottom: spacing.xl,
    },
    maskedView: {
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      width: width * 0.8,
    },
    gradientMask: {
      flex: 1,
      height: 60,
      width: '100%',
    },
    appNameText: {
      fontSize: 48,
      textAlign: 'center',
      fontWeight: Platform.OS === 'android' ? 'bold' : '700',
    },
    // EXACTLY matching SplashScreen - both with fontWeight '700'
    collText: {
      fontFamily: getFont('bold'),
      letterSpacing: 2,
      ...(Platform.OS === 'ios' && { fontWeight: '700' }),
    },
    appText: {
      fontFamily: getFont('bold'),
      letterSpacing: 2,
      ...(Platform.OS === 'ios' && { fontWeight: '700' }),
    },

    // Card
    card: {
      flex: 1,
      backgroundColor: colors.card,
      borderTopLeftRadius: 36,
      borderTopRightRadius: 36,
      paddingTop: spacing.xxxl,
      paddingHorizontal: spacing.xxxl,
      alignItems: 'center',
      ...SHADOW,
    },

    // Logo
    logoContainer: {
      marginBottom: spacing.xxl,
    },
    logo: {
      width: 120,
      height: 120,
      ...createShadow(6, colors.primary, 0.15),
    },

    headline: { fontSize: 24, marginBottom: 8 },
    subtitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: getFont('regular'),
      fontWeight: Platform.select({
        ios: '400',
        android: 'normal',
        default: '400',
      }),
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 24,
      marginBottom: spacing.xxxl,
      paddingHorizontal: spacing.lg,
      letterSpacing: Platform.OS === 'ios' ? 0.3 : 0,
    },

    // Buttons
    buttonsContainer: {
      width: '100%',
      marginBottom: spacing.xxl,
    },
    loginButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: 56,
      borderRadius: 28,
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.xl,
      ...SHADOW,
    },
    googleButton: {
      backgroundColor: colors.card,
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    appleButton: {
      backgroundColor: '#000000',
    },
    buttonText: {
      fontSize: typography.fontSize.lg,
      fontFamily: getFont('regular'),
      fontWeight: Platform.select({
        ios: '600',
        android: '600',
        default: '600',
      }),
      letterSpacing: 0.5,
      marginLeft: spacing.lg,
    },
    googleText: {
      color: colors.text,
    },
    appleText: {
      color: '#ffffff',
    },

    // Terms
    termsText: {
      fontSize: 14,
      fontFamily: getFont('regular'),
      fontWeight: Platform.select({
        ios: '400',
        android: 'normal',
        default: '400',
      }),
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      paddingHorizontal: spacing.lg,
    },
    linkText: {
      color: colors.primary,
      fontWeight: Platform.select({
        ios: '600',
        android: '600',
        default: '600',
      }),
    },
  });
};
