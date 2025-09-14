// import React, { useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   Platform,
//   Dimensions,
//   StatusBar,
//   Animated,
//   TouchableOpacity,
//   ScrollView,
//   SafeAreaView,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useTheme } from '../theme/useTheme';
// import Icon from '../components/common/Icon';
// import AppName from '../components/common/AppName';

// interface WelcomeScreenProps {
//   onGetStarted: () => void;
//   userName?: string;
// }

// const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
//   onGetStarted,
//   userName,
// }) => {
//   const { colors, gradients } = useTheme();
//   const insets = useSafeAreaInsets();
//   const { width, height } = Dimensions.get('window');

//   // Animation values
//   const fadeAnim = useRef(new Animated.Value(0)).current;
//   const slideAnim = useRef(new Animated.Value(50)).current;
//   const scaleAnim = useRef(new Animated.Value(0.8)).current;

//   // Responsive calculations
//   const isTablet = width > 768;
//   // const isLandscape = width > height; // reserved for future layout tweaks

//   const responsiveStyles = {
//     containerPadding: Math.max(20, width * 0.05),
//     titleSize: Math.min(Math.max(28, width * 0.08), isTablet ? 48 : 36),
//     subtitleSize: Math.min(Math.max(16, width * 0.04), isTablet ? 24 : 20),
//     featureTextSize: Math.min(Math.max(14, width * 0.035), isTablet ? 18 : 16),
//     iconSize: Math.min(Math.max(120, width * 0.25), isTablet ? 200 : 160),
//     buttonHeight: Math.max(50, height * 0.07),
//     spacing: Math.max(20, height * 0.025),
//   } as const;

//   useEffect(() => {
//     // Entrance animations
//     Animated.parallel([
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 1000,
//         useNativeDriver: true,
//       }),
//       Animated.timing(slideAnim, {
//         toValue: 0,
//         duration: 800,
//         useNativeDriver: true,
//       }),
//       Animated.timing(scaleAnim, {
//         toValue: 1,
//         duration: 1200,
//         useNativeDriver: true,
//       }),
//     ]).start();
//   }, [fadeAnim, scaleAnim, slideAnim]);

//   const features = [
//     {
//       icon: 'project' as const,
//       title: 'Project Management',
//       description: 'Organize and track your projects with ease',
//     },
//     {
//       icon: 'dashboard' as const,
//       title: 'Real-time Dashboard',
//       description: 'Monitor progress and performance instantly',
//     },
//     {
//       icon: 'comment' as const,
//       title: 'Team Collaboration',
//       description: 'Communicate and collaborate seamlessly',
//     },
//   ];

//   const safeColors = {
//     primary: colors?.primary || '#6a01f6',
//     secondary: colors?.secondary || '#8b5cf6',
//     background: colors?.background || '#ffffff',
//     text: colors?.text || '#1f2937',
//     textSecondary: colors?.textSecondary || '#6b7280',
//   } as const;

//   const safeGradients = (gradients?.primary || [
//     safeColors.primary,
//     safeColors.secondary,
//   ]) as string[];

//   return (
//     <SafeAreaView
//       style={[styles.container, { backgroundColor: safeColors.background }]}
//     >
//       <StatusBar
//         barStyle={Platform.OS === 'ios' ? 'dark-content' : 'light-content'}
//         backgroundColor={safeColors.primary}
//       />

//       <ScrollView
//         contentContainerStyle={[
//           styles.scrollContent,
//           {
//             paddingHorizontal: responsiveStyles.containerPadding,
//             paddingTop: insets.top + responsiveStyles.spacing,
//             paddingBottom: insets.bottom + responsiveStyles.spacing,
//             minHeight: height - insets.top - insets.bottom,
//           },
//         ]}
//         showsVerticalScrollIndicator={false}
//       >
//         {/* Header Section */}
//         <Animated.View
//           style={[
//             styles.header,
//             {
//               opacity: fadeAnim,
//               transform: [{ translateY: slideAnim }],
//             },
//           ]}
//         >
//           <View style={styles.logoContainer}>
//             <AppName size="large" variant="gradientText" />
//           </View>

//           <View
//             style={[
//               styles.titleContainer,
//               { marginTop: responsiveStyles.spacing },
//             ]}
//           >
//             <Text
//               style={[
//                 styles.welcomeTitle,
//                 {
//                   fontSize: responsiveStyles.titleSize,
//                   color: safeColors.text,
//                 },
//               ]}
//             >
//               Welcome{userName ? `, ${userName}` : ''}!
//             </Text>
//             <Text
//               style={[
//                 styles.subtitle,
//                 {
//                   fontSize: responsiveStyles.subtitleSize,
//                   color: safeColors.textSecondary,
//                   marginTop: responsiveStyles.spacing * 0.5,
//                 },
//               ]}
//             >
//               Your productivity companion for seamless project management
//             </Text>
//           </View>
//         </Animated.View>

//         {/* Main Icon Section */}
//         <Animated.View
//           style={[
//             styles.iconSection,
//             {
//               marginVertical: responsiveStyles.spacing * 2,
//               transform: [{ scale: scaleAnim }],
//               opacity: fadeAnim,
//             },
//           ]}
//         >
//           <LinearGradient
//             colors={safeGradients}
//             start={{ x: 0, y: 0 }}
//             end={{ x: 1, y: 1 }}
//             style={[
//               styles.mainIconContainer,
//               {
//                 width: responsiveStyles.iconSize,
//                 height: responsiveStyles.iconSize,
//                 borderRadius: responsiveStyles.iconSize / 2,
//               },
//             ]}
//           >
//             <Icon
//               name="dashboard"
//               size={responsiveStyles.iconSize * 0.4}
//               tintColor="#ffffff"
//             />
//           </LinearGradient>
//         </Animated.View>

//         {/* Features Section */}
//         <Animated.View
//           style={[
//             styles.featuresSection,
//             {
//               opacity: fadeAnim,
//               marginBottom: responsiveStyles.spacing * 2,
//             },
//           ]}
//         >
//           {features.map((feature, index) => (
//             <Animated.View
//               key={feature.title}
//               style={[
//                 styles.featureItem,
//                 {
//                   marginBottom: responsiveStyles.spacing * 0.8,
//                   transform: [
//                     {
//                       translateX: slideAnim.interpolate({
//                         inputRange: [0, 50],
//                         outputRange: [0, index % 2 === 0 ? -50 : 50],
//                       }),
//                     },
//                   ],
//                 },
//               ]}
//             >
//               <View
//                 style={[
//                   styles.featureIconContainer,
//                   { backgroundColor: `${safeColors.primary}15` },
//                 ]}
//               >
//                 <Icon
//                   name={feature.icon}
//                   size={24}
//                   tintColor={safeColors.primary}
//                 />
//               </View>
//               <View style={styles.featureText}>
//                 <Text
//                   style={[
//                     styles.featureTitle,
//                     {
//                       fontSize: responsiveStyles.featureTextSize,
//                       color: safeColors.text,
//                     },
//                   ]}
//                 >
//                   {feature.title}
//                 </Text>
//                 <Text
//                   style={[
//                     styles.featureDescription,
//                     {
//                       fontSize: responsiveStyles.featureTextSize * 0.9,
//                       color: safeColors.textSecondary,
//                     },
//                   ]}
//                 >
//                   {feature.description}
//                 </Text>
//               </View>
//             </Animated.View>
//           ))}
//         </Animated.View>

//         {/* Get Started Button */}
//         <Animated.View
//           style={[
//             styles.buttonContainer,
//             {
//               opacity: fadeAnim,
//               transform: [{ translateY: slideAnim }],
//             },
//           ]}
//         >
//           <TouchableOpacity
//             style={[
//               styles.getStartedButton,
//               {
//                 height: responsiveStyles.buttonHeight,
//               },
//             ]}
//             onPress={onGetStarted}
//             activeOpacity={0.8}
//           >
//             <LinearGradient
//               colors={safeGradients}
//               start={{ x: 0, y: 0 }}
//               end={{ x: 1, y: 0 }}
//               style={[
//                 styles.buttonGradient,
//                 {
//                   height: responsiveStyles.buttonHeight,
//                 },
//               ]}
//             >
//               <Text
//                 style={[
//                   styles.buttonText,
//                   { fontSize: responsiveStyles.featureTextSize },
//                 ]}
//               >
//                 Get Started
//               </Text>
//               <Icon name="arrow-right" size={20} tintColor="#ffffff" />
//             </LinearGradient>
//           </TouchableOpacity>
//         </Animated.View>
//       </ScrollView>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollContent: {
//     flexGrow: 1,
//     justifyContent: 'space-between',
//   },
//   header: {
//     alignItems: 'center',
//   },
//   logoContainer: {
//     marginBottom: 10,
//   },
//   titleContainer: {
//     alignItems: 'center',
//   },
//   welcomeTitle: {
//     fontWeight: '800',
//     textAlign: 'center',
//     letterSpacing: -0.5,
//   },
//   subtitle: {
//     fontWeight: '500',
//     textAlign: 'center',
//     lineHeight: 24,
//   },
//   iconSection: {
//     alignItems: 'center',
//   },
//   mainIconContainer: {
//     justifyContent: 'center',
//     alignItems: 'center',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#6a01f6',
//         shadowOffset: { width: 0, height: 8 },
//         shadowOpacity: 0.3,
//         shadowRadius: 20,
//       },
//       android: {
//         elevation: 16,
//       },
//     }),
//   },
//   featuresSection: {
//     width: '100%',
//   },
//   featureItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingVertical: 12,
//     paddingHorizontal: 16,
//     backgroundColor: 'rgba(255, 255, 255, 0.8)',
//     borderRadius: 16,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 2 },
//         shadowOpacity: 0.1,
//         shadowRadius: 8,
//       },
//       android: {
//         elevation: 3,
//       },
//     }),
//   },
//   featureIconContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   featureText: {
//     flex: 1,
//     marginLeft: 16,
//   },
//   featureTitle: {
//     fontWeight: '600',
//     marginBottom: 4,
//   },
//   featureDescription: {
//     fontWeight: '400',
//     lineHeight: 20,
//   },
//   buttonContainer: {
//     marginTop: 'auto',
//   },
//   getStartedButton: {
//     borderRadius: 16,
//     overflow: 'hidden',
//     ...Platform.select({
//       ios: {
//         shadowColor: '#6a01f6',
//         shadowOffset: { width: 0, height: 4 },
//         shadowOpacity: 0.3,
//         shadowRadius: 12,
//       },
//       android: {
//         elevation: 8,
//       },
//     }),
//   },
//   buttonGradient: {
//     flexDirection: 'row',
//     justifyContent: 'center',
//     alignItems: 'center',
//     paddingHorizontal: 32,
//     gap: 8,
//   },
//   buttonText: {
//     color: '#ffffff',
//     fontWeight: '700',
//     letterSpacing: 0.5,
//   },
// });

// export default WelcomeScreen;
