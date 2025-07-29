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
  const { gradients } = useTheme();

  // animated values
  const iconY = useRef(new Animated.Value((height - ICON_SIZE) / 2)).current;
  const spinAnim = useRef(new Animated.Value(0)).current;
  const bobAnim = useRef(new Animated.Value(0)).current;
  const contentOp = useRef(new Animated.Value(0)).current;
  const contentY = useRef(new Animated.Value(48)).current;

  // refs for loops so we can stop/start
  const spinLoopRef = useRef<any>();
  const bobLoopRef = useRef<any>();
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
      // mark slid up
      setSlidUp(true);
      // stop spinning
      spinLoopRef.current.stop();
      // reset spinAnim so it doesn't freeze awkwardly
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
  }, []);

  const rotation = spinAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  const bobY = bobAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-10, 10],
  });

  // build transforms: always slide up, then either rotate or bob
  const iconTransforms: any[] = [{ translateY: iconY }];
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
      <StatusBar barStyle="dark-content" backgroundColor="#ede1ff" />

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
    color: '#222',
    lineHeight: 47,
  },
  headlineBold: {
    fontWeight: 'bold',
    fontSize: 44,
    lineHeight: 54,
    color: '#191919',
  },
  sub: {
    fontSize: 16,
    fontWeight: '300',
    color: '#444',
    opacity: 0.8,
    marginTop: 26,
    letterSpacing: 0.5,
    lineHeight: 24,
    maxWidth: 320,
  },

  glassButton: {
    width: '76%',
    height: 54,
    borderRadius: 28,
    alignSelf: 'center',
    marginTop: 26,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.35)',
    shadowColor: '#4356af',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 18,
    elevation: 12,
  },
  glassInner: {
    flex: 1,
    borderRadius: 28,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 18,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.35)',
    opacity: 0.7,
  },
  glassText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#0208fd',
    textShadowColor: 'rgba(255,255,255,0.7)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
    zIndex: 2,
  },
});
