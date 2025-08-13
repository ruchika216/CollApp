import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  Animated,
  StatusBar,
  Image,
  Text,
  Easing,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import GlassButton from '../components/common/GlassButton';
import { useTheme } from '../theme/useTheme';

const { width, height } = Dimensions.get('window');
const ICON_SIZE = width * 0.68;

export default function OnboardingScreen({ navigation }) {
  // Get theme safely with fallback
  const theme = useTheme() || {};
  const gradients = theme.gradients || {
    background: ['#ede1ff', '#d5bfff'], // Fallback gradient
  };

  // animated values
  const iconY = useRef(new Animated.Value((height - ICON_SIZE) / 2)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const bobAnim = useRef(new Animated.Value(0)).current;
  const contentOp = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(48)).current;

  // Fixed: Properly typed refs for animation loops
  const spinLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const bobLoopRef = useRef<Animated.CompositeAnimation | null>(null);
  const [slidUp, setSlidUp] = useState(false);

  useEffect(() => {
    // 1) start spin loop
    spinLoopRef.current = Animated.loop(
      Animated.timing(spinAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    spinLoopRef.current.start();

    // 2) after delay, slide icon up & show content
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

      // start bobbing loop
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

    // Cleanup function to stop animations
    return () => {
      spinLoopRef.current?.stop();
      bobLoopRef.current?.stop();
    };
  }, []);

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
  if (!slidUp) {
    iconTransforms.push({ rotate: rotation });
  } else {
    iconTransforms.push({ translateY: bobY });
  }

  return (
    <LinearGradient
      colors={gradients.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={gradients.background[0]}
      />

      <Animated.View style={[styles.iconWrap, { transform: iconTransforms }]}>
        <Image
          source={require('../assets/images/68.png')}
          style={styles.icon}
          resizeMode="contain"
        />
      </Animated.View>

      <Animated.View
        style={[
          styles.contentWrap,
          {
            opacity: contentOp,
            transform: [{ translateY: contentY }],
          },
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
          <Text style={styles.sub}>
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

const styles = StyleSheet.create({
  container: { flex: 1 },

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
  },

  contentWrap: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: ICON_SIZE / 2 + 45,
    paddingHorizontal: 34,
  },
  textWrap: { marginBottom: 38 },
  headline: {
    fontSize: 39,
    fontWeight: '400',
    fontFamily: 'System', // Updated fontFamily
    color: '#4a5568', // Lighter color instead of #222
    lineHeight: 47,
  },
  headlineBold: {
    fontWeight: 'bold',
    fontSize: 44,
    fontFamily: 'System', // Updated fontFamily
    lineHeight: 54,
    color: '#2d3748', // Lighter color instead of #191919
  },
  sub: {
    fontSize: 16, // Updated fontSize
    fontWeight: '300',
    fontFamily: 'System', // Updated fontFamily
    color: '#718096', // Lighter color instead of #444
    opacity: 0.9, // Increased opacity
    marginTop: 26,
    letterSpacing: 0.5,
    lineHeight: 24,
    maxWidth: 320,
  },
});
