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

interface CustomHeaderProps {
  title?: string;
  showMenuButton?: boolean;
  onMenuPress?: () => void;
  backgroundColor?: string;
  rightComponent?: React.ReactNode;
  leftComponent?: React.ReactNode;
}

const CustomHeader: React.FC<CustomHeaderProps> = ({
  title = 'CollApp',
  showMenuButton = true,
  onMenuPress,
  backgroundColor,
  rightComponent,
  leftComponent,
}) => {
  const { colors, gradients } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      <LinearGradient
        colors={backgroundColor ? [backgroundColor, backgroundColor] : gradients.primary}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.header,
          { 
            paddingTop: insets.top + (Platform.OS === 'ios' ? 10 : 20),
          }
        ]}
      >
        <View style={styles.headerContent}>
          {/* Left Side */}
          <View style={styles.leftSection}>
            {leftComponent || (
              <View style={styles.appInfo}>
                <View style={styles.appIconContainer}>
                  <Icon name="dashboard" size={24} tintColor="#fff" />
                </View>
                <Text style={styles.appTitle}>{title}</Text>
              </View>
            )}
          </View>

          {/* Right Side */}
          <View style={styles.rightSection}>
            {rightComponent || (
              showMenuButton && (
                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={onMenuPress}
                  activeOpacity={0.7}
                >
                  <Icon name="menu" size={24} tintColor="#fff" />
                </TouchableOpacity>
              )
            )}
          </View>
        </View>
      </LinearGradient>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
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
  },
  appInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  appTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CustomHeader;