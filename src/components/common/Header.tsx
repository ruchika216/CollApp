// components/shared/CustomHeader.js
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from 'react-native';
import Icon, { IconName } from './Icon';

// Map common Ionicons-like names to our local IconName set (assets/icons)
const mapIconName = (name?: string): IconName => {
  switch (name) {
    case 'arrow-back':
    case 'chevron-back':
      return 'arrow-left';
    case 'menu':
      return 'menu';
    case 'search':
      return 'search';
    case 'notifications-outline':
    case 'notifications':
      return 'notification';
    case 'close':
    case 'close-outline':
      return 'close';
    default:
      // Fallback to info icon if an unknown name is provided
      return 'info';
  }
};

const Header = ({
  title = '',
  subtitle = '',
  showBackButton = false,
  showMenuButton = false,
  showNotificationButton = false,
  showSearchButton = false,
  leftIcon = null,
  rightIcon = null,
  leftAction = () => {},
  rightAction = () => {},
  backgroundColor = '#ffffff',
  titleColor = '#1a1a1a',
  iconColor = '#1a1a1a',
  showShadow = true,
  height = 60,
  customLeftComponent = null,
  customRightComponent = null,
  centerComponent = null,
}) => {
  const containerHeight =
    height + (Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24);

  const renderLeftSection = () => {
    if (customLeftComponent) return customLeftComponent;

    if (showBackButton) {
      return (
        <TouchableOpacity onPress={leftAction} style={styles.iconButton}>
          <Icon
            name={mapIconName('arrow-back')}
            size={24}
            tintColor={iconColor}
          />
        </TouchableOpacity>
      );
    }

    if (showMenuButton) {
      return (
        <TouchableOpacity onPress={leftAction} style={styles.iconButton}>
          <Icon name={mapIconName('menu')} size={24} tintColor={iconColor} />
        </TouchableOpacity>
      );
    }

    if (leftIcon) {
      return (
        <TouchableOpacity onPress={leftAction} style={styles.iconButton}>
          <Icon name={mapIconName(leftIcon)} size={24} tintColor={iconColor} />
        </TouchableOpacity>
      );
    }

    return <View style={styles.iconButton} />;
  };

  const renderCenterSection = () => {
    if (centerComponent) return centerComponent;

    return (
      <View style={styles.centerContainer}>
        <Text style={[styles.title, { color: titleColor }]} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.subtitle, { color: titleColor }]}
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        ) : null}
      </View>
    );
  };

  const renderRightSection = () => {
    if (customRightComponent) return customRightComponent;

    return (
      <View style={styles.rightContainer}>
        {showSearchButton && (
          <TouchableOpacity onPress={rightAction} style={styles.iconButton}>
            <Icon
              name={mapIconName('search')}
              size={24}
              tintColor={iconColor}
            />
          </TouchableOpacity>
        )}
        {showNotificationButton && (
          <TouchableOpacity onPress={rightAction} style={styles.iconButton}>
            <Icon
              name={mapIconName('notifications-outline')}
              size={24}
              tintColor={iconColor}
            />
          </TouchableOpacity>
        )}
        {rightIcon && (
          <TouchableOpacity onPress={rightAction} style={styles.iconButton}>
            <Icon
              name={mapIconName(rightIcon)}
              size={24}
              tintColor={iconColor}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor, height: containerHeight },
        showShadow ? styles.shadow : styles.noShadow,
      ]}
    >
      <StatusBar backgroundColor={backgroundColor} barStyle="dark-content" />
      <View style={[styles.content, { height }]}>
        <View style={styles.leftSection}>{renderLeftSection()}</View>
        <View style={styles.centerSection}>{renderCenterSection()}</View>
        <View style={styles.rightSection}>{renderRightSection()}</View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    zIndex: 1000,
  },
  shadow: {
    shadowOpacity: 0.1,
    elevation: 4,
  },
  noShadow: {
    shadowOpacity: 0,
    elevation: 0,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
  },
  centerSection: {
    flex: 2,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
    alignItems: 'flex-end',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  centerContainer: {
    alignItems: 'center',
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
});

export default Header;
