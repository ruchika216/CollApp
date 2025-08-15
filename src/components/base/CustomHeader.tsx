import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/useTheme';
import Icon from './Icon';
import AppName from './AppName';

interface CustomHeaderProps {
  title?: string;
  showMenuButton?: boolean;
  onMenuPress?: () => void;
  backgroundColor?: string;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
  showBackButton?: boolean;
  onBackPress?: () => void;
  variant?: 'default' | 'minimal' | 'transparent';
  elevation?: number;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title = 'CollApp',
  showMenuButton = true,
  onMenuPress,
  backgroundColor,
  rightComponent,
  leftComponent,
  showBackButton = false,
  onBackPress,
  variant = 'default',
}) => {
  const { colors, gradients, shadows } = useTheme();
  const insets = useSafeAreaInsets();

  // Determine status bar style based on theme and background
  const getStatusBarStyle = (): 'light-content' | 'dark-content' => {
    if (variant === 'transparent') {
      return 'dark-content';
    }
    if (backgroundColor) {
      return 'light-content'; // Assuming custom backgrounds are dark
    }
    return 'light-content'; // Always light content for gradient headers
  };

  // Get status bar background color
  const getStatusBarBackground = () => {
    if (Platform.OS === 'android') {
      if (variant === 'transparent') return 'transparent';
      return backgroundColor || colors.primary;
    }
    return 'transparent'; // iOS handles this differently
  };

  // Render header content based on variant
  const renderHeaderContent = () => {
    const contentStyle = [
      styles.headerContent,
      {
        paddingTop: Platform.OS === 'ios' ? insets.top + 8 : 16,
      },
    ];

    const content = (
      <View style={contentStyle}>
        {/* Left Side */}
        <View style={styles.leftSection}>
          {leftComponent || (
            <>
              {showBackButton && (
                <TouchableOpacity
                  style={[styles.actionButton, styles.backButton]}
                  onPress={onBackPress}
                  activeOpacity={0.7}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Icon
                    name="arrow-left"
                    size="lg"
                    color={variant === 'transparent' ? colors.text : '#fff'}
                  />
                </TouchableOpacity>
              )}
              <View style={styles.appInfo}>
                <View
                  style={[
                    styles.appIconContainer,
                    variant === 'transparent' && {
                      backgroundColor: colors.primary + '20',
                    },
                  ]}
                >
                  <Icon
                    name="dashboard"
                    size="lg"
                    color={variant === 'transparent' ? colors.primary : '#fff'}
                  />
                </View>
                {title === 'CollApp' ? (
                  <AppName
                    size="medium"
                    variant={variant === 'transparent' ? 'primary' : 'gradient'}
                    style={{ marginLeft: 0 }}
                  />
                ) : (
                  <Text
                    style={[
                      styles.appTitle,
                      variant === 'transparent' && { color: colors.text },
                    ]}
                  >
                    {title}
                  </Text>
                )}
              </View>
            </>
          )}
        </View>

        {/* Right Side */}
        <View style={styles.rightSection}>
          {rightComponent ||
            (showMenuButton && (
              <TouchableOpacity
                style={[
                  styles.menuButton,
                  variant === 'transparent' && {
                    backgroundColor: colors.primary + '20',
                    borderColor: colors.primary + '30',
                  },
                ]}
                onPress={onMenuPress}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Icon
                  name="menu"
                  size="lg"
                  color={variant === 'transparent' ? colors.primary : '#fff'}
                />
              </TouchableOpacity>
            ))}
        </View>
      </View>
    );

    // Wrap in gradient or use solid background based on variant
    if (variant === 'default') {
      return (
        <LinearGradient
          colors={
            backgroundColor
              ? [backgroundColor, backgroundColor]
              : gradients.primary
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.header,
            shadows.lg,
            { backgroundColor: backgroundColor || colors.primary },
          ]}
        >
          {content}
        </LinearGradient>
      );
    } else {
      return (
        <View
          style={[
            styles.header,
            variant === 'minimal' && shadows.sm,
            {
              backgroundColor:
                variant === 'transparent'
                  ? 'transparent'
                  : backgroundColor || colors.surface,
            },
          ]}
        >
          {content}
        </View>
      );
    }
  };

  return (
    <>
      <StatusBar
        barStyle={getStatusBarStyle()}
        backgroundColor={getStatusBarBackground()}
        translucent={Platform.OS === 'ios'}
      />
      {renderHeaderContent()}
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: Platform.OS === 'ios' ? 18 : 16,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        borderBottomWidth: 0,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: Platform.OS === 'ios' ? 48 : 44,
    paddingBottom: Platform.OS === 'ios' ? 18 : 16,
  },
  leftSection: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconContainer: {
    width: Platform.OS === 'ios' ? 42 : 40,
    height: Platform.OS === 'ios' ? 42 : 40,
    borderRadius: Platform.OS === 'ios' ? 21 : 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    ...Platform.select({
      ios: {
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
    }),
  },
  appTitle: {
    fontSize: Platform.OS === 'ios' ? 20 : 22,
    fontWeight: Platform.OS === 'ios' ? '600' : 'bold',
    color: '#fff',
    letterSpacing: Platform.OS === 'ios' ? 0.3 : 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  actionButton: {
    width: Platform.OS === 'ios' ? 40 : 44,
    height: Platform.OS === 'ios' ? 40 : 44,
    borderRadius: Platform.OS === 'ios' ? 20 : 22,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
    }),
  },
  backButton: {
    marginRight: 12,
  },
  menuButton: {
    width: Platform.OS === 'ios' ? 44 : 48,
    height: Platform.OS === 'ios' ? 44 : 48,
    borderRadius: Platform.OS === 'ios' ? 22 : 24,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        borderWidth: 0.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
      },
    }),
  },
});

export default CustomHeader;
