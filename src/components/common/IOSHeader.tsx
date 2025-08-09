import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import Icon from './Icon';
import NotificationButton from './NotificationButton';
import AppName from './AppName';

interface IOSHeaderProps {
  navigation: any;
  showLogo?: boolean;
  title?: string;
}

const IOSHeader: React.FC<IOSHeaderProps> = ({ 
  navigation, 
  showLogo = true,
  title 
}) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent={true}
      />
      
      <View style={[
        styles.iosHeader,
        {
          backgroundColor: Platform.OS === 'ios' 
            ? (isDark ? 'rgba(28, 28, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)')
            : colors.surface,
          paddingTop: Platform.OS === 'ios' ? insets.top : insets.top + 8,
          borderBottomColor: Platform.OS === 'ios'
            ? (isDark ? 'rgba(84, 84, 88, 0.6)' : 'rgba(60, 60, 67, 0.15)')
            : 'rgba(0,0,0,0.1)',
        }
      ]}>
        <View style={styles.headerContent}>
          {/* Left Side - Logo or Title */}
          <View style={styles.leftSection}>
            {showLogo ? (
              <View style={styles.logoContainer}>
                <Image
                  source={require('../../assets/images/4.png')}
                  style={styles.logo}
                  resizeMode="contain"
                />
                <AppName 
                  size="medium" 
                  variant="primary"
                  style={{ marginLeft: 0 }}
                />
              </View>
            ) : (
              <Text style={[styles.title, { color: colors.text }]}>
                {title}
              </Text>
            )}
          </View>

          {/* Right Side - Actions */}
          <View style={styles.rightSection}>
            <NotificationButton
              onPress={() => navigation.navigate('NotificationScreen')}
              size={22}
              tintColor={colors.primary}
            />
            <TouchableOpacity
              style={[styles.menuButton, { 
                backgroundColor: Platform.OS === 'ios' 
                  ? (isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.06)')
                  : 'rgba(0, 0, 0, 0.05)'
              }]}
              onPress={() => navigation.toggleDrawer?.()}
              activeOpacity={0.7}
            >
              <Icon name="menu" size={24} tintColor={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  iosHeader: {
    paddingBottom: Platform.OS === 'ios' ? 12 : 8,
    borderBottomWidth: Platform.OS === 'ios' ? 0.33 : 0.5,
    // iOS-style translucent header effect
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0.33 },
        shadowOpacity: 0.13,
        shadowRadius: 0,
      },
      android: {
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    minHeight: 44,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
    marginRight: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  menuButton: {
    padding: 8,
    borderRadius: 20,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default IOSHeader;