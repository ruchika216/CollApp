// import React from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   StyleSheet,
//   StatusBar,
//   Platform,
// } from 'react-native';
// import LinearGradient from 'react-native-linear-gradient';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';
// import { useTheme } from '../../../theme';
// import Icon from '../../../components/common/Icon';

// interface ProjectHeaderProps {
//   title: string;
//   subtitle?: string;
//   onBack?: () => void;
//   rightIcon?: string;
//   onRightPress?: () => void;
// }

// const ProjectHeader: React.FC<ProjectHeaderProps> = ({
//   title,
//   subtitle,
//   onBack,
//   rightIcon,
//   onRightPress,
// }) => {
//   const theme = useTheme();
//   const insets = useSafeAreaInsets();

//   return (
//     <>
//       <StatusBar
//         barStyle="light-content"
//         backgroundColor={theme.colors.primary}
//         translucent
//       />

//       <LinearGradient
//         colors={[theme.colors.primary, theme.colors.primary + 'E6']}
//         start={{ x: 0, y: 0 }}
//         end={{ x: 1, y: 0 }}
//         style={[styles.container, { paddingTop: insets.top + 12 }]}
//       >
//         {/* Left Button */}
//         {onBack ? (
//           <TouchableOpacity
//             style={styles.iconButton}
//             onPress={onBack}
//             activeOpacity={0.8}
//           >
//             <Icon name="arrow-left" size={24} color="#fff" />
//           </TouchableOpacity>
//         ) : (
//           <View style={styles.iconPlaceholder} />
//         )}

//         {/* Title + Subtitle */}
//         <View style={styles.center}>
//           <Text style={styles.title} numberOfLines={1}>
//             {title}
//           </Text>
//           {subtitle ? (
//             <Text style={styles.subtitle} numberOfLines={1}>
//               {subtitle}
//             </Text>
//           ) : null}
//         </View>

//         {/* Right Button */}
//         {rightIcon && onRightPress ? (
//           <TouchableOpacity
//             style={styles.iconButton}
//             onPress={onRightPress}
//             activeOpacity={0.8}
//           >
//             <Icon name={rightIcon} size={22} color="#fff" />
//           </TouchableOpacity>
//         ) : (
//           <View style={styles.iconPlaceholder} />
//         )}
//       </LinearGradient>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingBottom: 12,
//     minHeight: 88,
//     ...Platform.select({
//       ios: {
//         shadowColor: '#000',
//         shadowOffset: { width: 0, height: 3 },
//         shadowOpacity: 0.2,
//         shadowRadius: 6,
//       },
//       android: {
//         elevation: 6,
//       },
//     }),
//   },
//   iconButton: {
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     backgroundColor: 'rgba(255,255,255,0.15)',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   iconPlaceholder: {
//     width: 44,
//     height: 44,
//   },
//   center: {
//     flex: 1,
//     alignItems: 'center',
//     paddingHorizontal: 8,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#fff',
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 13,
//     color: 'rgba(255,255,255,0.85)',
//     marginTop: 2,
//     textAlign: 'center',
//   },
// });

// export default ProjectHeader;

import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import React from 'react';

const ProjectHeader = () => {
  return (
    <SafeAreaView>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Project Header</Text>
        <Text style={{ fontSize: 16, color: '#666' }}>Subtitle goes here</Text>
      </View>
    </SafeAreaView>
  );
};

export default ProjectHeader;

const styles = StyleSheet.create({});
