import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  Image,
  Text,
  Easing,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import GlassButton from '../components/common/GlassButton';
import { useTheme } from '../theme/useTheme';
import { createShadow } from '../theme/themeUtils';

const { width, height } = Dimensions.get('window');
const ICON_SIZE = width * 0.68;

export default function OnboardingScreen({ navigation }: { navigation: any }) {
  // Get theme safely with fallback
  const { colors, typography, spacing, isDark } = useTheme();

  const safeColors = colors || {
    background: '#ffffff',
    text: '#0340ba',
    textSecondary: '#64748b',
    primary: '#6a01f6',
    gradients: {
      background: ['#ede1ff', '#d5bfff'],
      primary: ['#8b5cf6', '#a855f7', '#c084fc'],
    },
  };

  const safeTypography = typography || {
    fontSize: { lg: 16, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48 },
    fontFamily: { dynaPuffBold: 'System', dynaPuffRegular: 'System' },
  };

  const safeSpacing = spacing || {
    screen: { horizontal: 24 },
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    '4xl': 40,
    '5xl': 48,
  };

  // ─────────────────────────────── Animations ──────────────────────────────────
  const iconY = useMemo(() => new Animated.Value((height - ICON_SIZE) / 2), []);
  const spinAnim = useMemo(() => new Animated.Value(0), []);
  const bobAnim = useMemo(() => new Animated.Value(0), []);
  const contentOp = useMemo(() => new Animated.Value(0), []);
  const contentY = useMemo(() => new Animated.Value(48), []);

  const spinLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const bobLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const [slidUp, setSlidUp] = useState(false);

  useEffect(() => {
    // 1) spinning icon
    spinLoopRef.current = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    spinLoopRef.current.start();

    // 2) slide-up + content fade-in
    Animated.sequence([
      Animated.delay(1000),
      Animated.timing(iconY, {
        toValue: -ICON_SIZE / 2 + 24,
        duration: 650,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(contentOp, {
          toValue: 1,
          duration: 550,
          useNativeDriver: true,
        }),
        Animated.timing(contentY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      setSlidUp(true);
      spinLoopRef.current?.stop();
      spinAnim.setValue(0);

      // bobbing effect
      bobLoopRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(bobAnim, {
            toValue: 1,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(bobAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
      );
      bobLoopRef.current.start();
    });

    return () => {
      spinLoopRef.current?.stop();
      bobLoopRef.current?.stop();
    };
  }, [bobAnim, contentOp, contentY, iconY, spinAnim]);

  const rotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const bobY = bobAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 10],
  });

  const iconTransforms: Animated.WithAnimatedValue<any>[] = [
    { translateY: iconY },
  ];
  if (!slidUp) iconTransforms.push({ rotate: rotation });
  else iconTransforms.push({ translateY: bobY });

  // ──────────────────────────────── Styles ─────────────────────────────────────
  const styles = createStyles(safeColors, safeTypography, safeSpacing);

  // ──────────────────────────────── Render ─────────────────────────────────────
  return (
    <LinearGradient
      colors={safeColors.gradients.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={safeColors.gradients.background[0]}
      />

      {/* Icon */}
      <Animated.View style={[styles.iconWrap, { transform: iconTransforms }]}>
        <Image
          source={require('../assets/images/5.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Content */}
      <Animated.View
        style={[
          styles.contentWrap,
          { opacity: contentOp, transform: [{ translateY: contentY }] },
        ]}
      >
        <View style={styles.textWrap}>
          <Text style={styles.headline}>
            Empower{'\n'}
            your team{'\n'}
            <Text style={styles.headlineBold}>
              to build the{'\n'}future together
            </Text>
          </Text>

          <Text style={styles.subtitle}>
            Align goals, track progress, and celebrate wins all in one seamless
            workspace designed for modern collaboration.
          </Text>
        </View>

        <GlassButton
          title="Get Started"
          onPress={() => navigation.replace('Login')}
        />
      </Animated.View>
    </LinearGradient>
  );
}

// ─────────────────────────────── createStyles ──────────────────────────────────
const createStyles = (colors: any, typography: any, spacing: any) => {
  const getFont = (weight: 'regular' | 'bold') =>
    Platform.select({
      ios: `DynaPuff-${weight === 'bold' ? 'Bold' : 'Regular'}`,
      android: `DynaPuff-${weight === 'bold' ? 'Bold' : 'Regular'}`,
      default: 'System',
    });

  const lineHeight = typography.fontSize['4xl'] * 1.45; // generous spacing

  return StyleSheet.create({
    container: { flex: 1 },

    /* Icon */
    iconWrap: {
      position: 'absolute',
      width: '100%',
      alignItems: 'center',
      top: 0,
      zIndex: 10,
    },
    icon: {
      width: ICON_SIZE,
      height: ICON_SIZE,
      ...createShadow(8, colors.primary, 0.2),
    },

    /* Content */
    contentWrap: {
      flex: 1,
      justifyContent: 'flex-start',
      paddingTop: ICON_SIZE / 2 + spacing['5xl'],
      paddingHorizontal: spacing.xxxl,
    },

    textWrap: {
      marginBottom: spacing['5xl'], // more space before subtitle
      alignItems: 'flex-start',
    },

    headline: {
      fontSize: typography.fontSize['4xl'],
      fontFamily: getFont('regular'),
      color: colors.text,
      lineHeight,
    },
    headlineBold: {
      fontSize: typography.fontSize['4xl'],
      fontFamily: getFont('bold'),
      color: colors.primary,
      lineHeight,
    },

    subtitle: {
      fontSize: typography.fontSize.lg,
      fontFamily: getFont('regular'),
      fontWeight: Platform.select({
        ios: '400',
        android: 'normal',
        default: '400',
      }),
      color: colors.textSecondary,
      lineHeight: 28,
      letterSpacing: Platform.OS === 'ios' ? 0.3 : 0.5,
      maxWidth: 320,
      opacity: 0.9,
      marginTop: spacing.lg,
    },
  });
};
