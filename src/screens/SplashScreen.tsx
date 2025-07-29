// src/screens/SplashScreen.tsx

import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  Image,
  Text,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import MaskedView from '@react-native-masked-view/masked-view';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../theme/useTheme';

const { width, height } = Dimensions.get('window');

export default function SplashScreen() {
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { gradients } = useTheme();

  useEffect(() => {
    // Fade‐in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // After 3s, navigate to Onboarding
    const timer = setTimeout(() => {
      navigation.replace('Onboarding' as any);
    }, 3000);

    return () => clearTimeout(timer);
  }, [fadeAnim, navigation]);

  return (
    <LinearGradient
      colors={gradients.background}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor="#ede1ff" />

        <Animated.View
          style={{
            opacity: fadeAnim,
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
            width: '100%',
          }}
        >
          <Image
            source={require('../assets/images/4.png')}
            style={styles.logo}
            resizeMode="contain"
          />

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
              style={styles.gradient}
            />
          </MaskedView>
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  maskedView: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    width: width * 0.7,
    alignSelf: 'center',
    marginTop: 8,
  },
  gradient: {
    flex: 1,
    height: 48,
    width: '100%',
  },
  appName: {
    fontSize: 40,
    textAlign: 'center',
  },
  coll: {
    fontFamily: 'DynaPuff-Regular',
  },
  app: {
    fontFamily: 'DynaPuff-Regular',
  },
});
