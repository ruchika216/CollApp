// src/screens/SplashScreen.tsx

import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  Image,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
  View,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme/useTheme';
import { BRAND } from '../theme/brand';
import AppText from '../components/common/AppText';
import { createShadow } from '../theme/themeUtils';

const { width } = Dimensions.get('window');

export default function SplashScreen() {
  const navigation = useNavigation();
  const { colors, typography, spacing, isDark } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const textSlideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textSlideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      (navigation as any).replace('Onboarding');
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, textSlideAnim, navigation]);

  const safeColors = colors || {
    background: '#ffffff',
    primary: '#6a01f6',
    textSecondary: '#64748b',
    gradients: {
      background: ['#ffffff', '#f8fafc'],
      primary: ['#6a01f6', '#7d1aff'],
    },
  };

  const safeTypography = typography || {
    fontSize: { lg: 16 },
    fontFamily: {
      dynaPuffBold: 'System',
      dynaPuffRegular: 'System',
    },
  };

  const safeSpacing = spacing || {
    screen: { horizontal: 20 },
    xxl: 24,
    lg: 16,
    xxxl: 32,
    '5xl': 48,
  };

  const styles = createStyles(safeColors, safeTypography, safeSpacing);
  const maskTextBlack = { color: '#000' } as const;
  const hiddenText = { opacity: 0 } as const;

  return (
    <LinearGradient
      colors={safeColors.gradients.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={safeColors.background}
        translucent
      />

      <SafeAreaView style={styles.safeArea}>
        <Animated.View
          style={[
            styles.contentContainer,
            { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
          ]}
        >
          {/* Logo */}
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/4.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          {/* Gradient App Name */}
          <Animated.View
            style={[
              styles.appNameContainer,
              { transform: [{ translateY: textSlideAnim }] },
            ]}
          >
            <MaskedView
              style={styles.maskedView}
              maskElement={
                <AppText
                  weight="bold"
                  style={[styles.appNameText, maskTextBlack]}
                >
                  <AppText
                    weight="bold"
                    style={[styles.collText, maskTextBlack]}
                  >
                    COLL
                  </AppText>
                  <AppText
                    weight="bold"
                    style={[styles.appText, maskTextBlack]}
                  >
                    APP
                  </AppText>
                </AppText>
              }
            >
              <LinearGradient
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                colors={safeColors.gradients.primary}
                style={styles.gradientMask}
              >
                <AppText weight="bold" style={[styles.appNameText, hiddenText]}>
                  {BRAND.appName}
                </AppText>
              </LinearGradient>
            </MaskedView>
          </Animated.View>

          {/* Tagline */}
          <Animated.View
            style={[
              styles.tagline,
              { opacity: fadeAnim, transform: [{ translateY: textSlideAnim }] },
            ]}
          >
            <AppText style={styles.taglineText}>
              Collaborate • Create • Connect
            </AppText>
          </Animated.View>

          {/* Loading Dots */}
          <Animated.View
            style={[styles.loadingContainer, { opacity: fadeAnim }]}
          >
            <View style={styles.loadingDots}>
              {[0, 1, 2].map(index => (
                <View
                  key={index}
                  style={[styles.dot, { backgroundColor: safeColors.primary }]}
                />
              ))}
            </View>
          </Animated.View>
        </Animated.View>
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

  return StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1 },
    contentContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.screen.horizontal,
    },
    logoContainer: { marginBottom: spacing.xxl },
    logo: {
      width: width * 0.4,
      height: width * 0.4,
      ...createShadow(8, colors.primary, 0.2),
    },
    appNameContainer: { marginBottom: spacing.lg },
    maskedView: {
      height: 60,
      justifyContent: 'center',
      alignItems: 'center',
      width: width * 0.8,
    },
    gradientMask: { flex: 1, height: 60, width: '100%' },
    appNameText: {
      fontSize: 48,
      textAlign: 'center',
      fontWeight: Platform.OS === 'android' ? 'bold' : '700',
    },
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
    tagline: {
      fontSize: typography.fontSize.lg,
      color: colors.textSecondary,
      textAlign: 'center',
      marginBottom: spacing.xxxl,
      letterSpacing: 1,
    },
    taglineText: {
      fontFamily: getFont('regular'),
    },
    loadingContainer: {
      position: 'absolute',
      bottom: spacing['5xl'],
    },
    loadingDots: { flexDirection: 'row', alignItems: 'center' },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      marginHorizontal: 4,
      opacity: 0.7,
    },
  });
};
