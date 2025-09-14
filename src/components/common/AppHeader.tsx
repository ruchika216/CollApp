import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../theme/useTheme';
import Icon, { IconName } from './Icon';

export interface HeaderAction {
  icon: IconName;
  onPress: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
  badge?: boolean;
}

export interface AppHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightActions?: HeaderAction[];
  backgroundColor?: string; // default uses theme background
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  subtitle,
  onBack,
  rightActions = [],
  backgroundColor,
}) => {
  const { colors, gradients } = useTheme();
  const insets = useSafeAreaInsets();

  const headerBg = backgroundColor || (colors as any).background || '#FFFFFF';
  const textColor = (colors as any).text || '#0f172a';
  const subTextColor = (colors as any).textSecondary || 'rgba(15,23,42,0.6)';
  const primaryGradient = (gradients?.primary as string[]) || [
    colors.primary,
    colors.primary,
  ];

  return (
    <>
      <StatusBar
        backgroundColor={headerBg}
        barStyle={Platform.OS === 'ios' ? 'dark-content' : 'dark-content'}
        translucent
      />
      {/* Top spacer covers notch without inflating header height */}
      <View
        style={[
          styles.topInset,
          { height: insets.top, backgroundColor: headerBg },
        ]}
      />

      <View
        style={[
          styles.container,
          { backgroundColor: headerBg, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.content}>
          {/* Left: Back button */}
          {onBack && (
            <TouchableOpacity
              onPress={onBack}
              style={styles.backButton}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <LinearGradient
                colors={primaryGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.circleBtn}
              >
                <Icon name="arrow-left" size={18} tintColor="#FFF" />
              </LinearGradient>
            </TouchableOpacity>
          )}

          {/* Center: Title + Subtitle */}
          <View style={styles.center}>
            <Text
              style={[styles.title, { color: textColor }]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {!!subtitle && (
              <Text
                style={[styles.subtitle, { color: subTextColor }]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>

          {/* Right: Actions */}
          <View style={styles.right}>
            {rightActions.map((action, idx) => (
              <TouchableOpacity
                key={`${action.icon}-${idx}`}
                onPress={action.onPress}
                style={[
                  styles.actionTouchable,
                  action.disabled && styles.disabled,
                ]}
                accessibilityRole="button"
                accessibilityLabel={action.accessibilityLabel}
                disabled={action.disabled}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <LinearGradient
                  colors={primaryGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.circleBtnSm}
                >
                  <Icon name={action.icon} size={16} tintColor="#FFF" />
                </LinearGradient>
                {action.badge && (
                  <View
                    style={[styles.badge, { backgroundColor: colors.error }]}
                  />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </>
  );
};

export default AppHeader;

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
  },
  content: {
    minHeight: 56,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 12,
    top: '50%',
    transform: [{ translateY: -15 }],
    zIndex: 1,
  },
  circleBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 48,
  },
  right: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -15 }],
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionTouchable: {
    marginLeft: 8,
  },
  circleBtnSm: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
    fontWeight: '500',
  },
  disabled: { opacity: 0.4 },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  topInset: {
    // height + background set dynamically
  },
});
