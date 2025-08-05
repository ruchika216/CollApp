/**
 * Example component showing proper theme usage patterns
 * Use this as a reference for implementing theming in new components
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../../theme/useTheme';
import {
  createCardStyle,
  createButtonStyle,
  createTextStyle,
  getStatusColor,
  withOpacity,
} from '../../theme/themeUtils';
import ThemeToggle from '../common/ThemeToggle';

export const ThemedComponentExample: React.FC = () => {
  const { 
    colors, 
    gradients, 
    shadows, 
    spacing, 
    borderRadius, 
    typography,
    isDark 
  } = useTheme();

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      
      {/* Header with gradient */}
      <LinearGradient
        colors={gradients.primary}
        style={[styles.header, { paddingTop: spacing.xl }]}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { fontSize: typography.fontSize['2xl'] }]}>
            Theme Example
          </Text>
          <ThemeToggle />
        </View>
      </LinearGradient>

      <View style={[styles.content, { padding: spacing.lg }]}>
        
        {/* Card Examples */}
        <View style={[createCardStyle(colors), { marginBottom: spacing.lg }]}>
          <Text style={[createTextStyle(colors, 'primary'), typography.fontSize.lg, { fontWeight: '600' }]}>
            Primary Card
          </Text>
          <Text style={[createTextStyle(colors, 'secondary'), { marginTop: spacing.sm }]}>
            This card uses the theme-aware card style helper
          </Text>
        </View>

        {/* Button Examples */}
        <View style={[styles.buttonSection, { marginBottom: spacing.lg }]}>
          <TouchableOpacity style={createButtonStyle(colors, 'primary')}>
            <Text style={[createTextStyle(colors, 'primary'), { color: colors.textOnPrimary }]}>
              Primary Button
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[createButtonStyle(colors, 'outline'), { marginTop: spacing.md }]}>
            <Text style={[createTextStyle(colors, 'primary'), { color: colors.primary }]}>
              Outline Button
            </Text>
          </TouchableOpacity>
        </View>

        {/* Status Examples */}
        <View style={[createCardStyle(colors), { marginBottom: spacing.lg }]}>
          <Text style={[createTextStyle(colors, 'primary'), { fontWeight: '600', marginBottom: spacing.md }]}>
            Status Colors
          </Text>
          
          {['pending', 'development', 'done', 'error'].map((status) => (
            <View key={status} style={[styles.statusItem, { marginBottom: spacing.sm }]}>
              <View 
                style={[
                  styles.statusDot, 
                  { backgroundColor: getStatusColor(status, colors) }
                ]} 
              />
              <Text style={createTextStyle(colors, 'primary')}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </View>
          ))}
        </View>

        {/* Shadow Examples */}
        <View style={{ marginBottom: spacing.lg }}>
          <Text style={[createTextStyle(colors, 'primary'), { fontWeight: '600', marginBottom: spacing.md }]}>
            Shadow Variations
          </Text>
          
          {['sm', 'md', 'lg'].map((shadowSize) => (
            <View
              key={shadowSize}
              style={[
                styles.shadowExample,
                { 
                  backgroundColor: colors.card,
                  marginBottom: spacing.md,
                  ...shadows[shadowSize as keyof typeof shadows]
                }
              ]}
            >
              <Text style={createTextStyle(colors, 'primary')}>
                Shadow {shadowSize.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>

        {/* Opacity Examples */}
        <View style={[createCardStyle(colors), { marginBottom: spacing.lg }]}>
          <Text style={[createTextStyle(colors, 'primary'), { fontWeight: '600', marginBottom: spacing.md }]}>
            Opacity Variations
          </Text>
          
          {[1, 0.8, 0.6, 0.4, 0.2].map((opacity) => (
            <View
              key={opacity}
              style={[
                styles.opacityExample,
                { 
                  backgroundColor: withOpacity(colors.primary as string, opacity),
                  marginBottom: spacing.sm
                }
              ]}
            >
              <Text style={{ color: opacity > 0.5 ? colors.textOnPrimary : colors.text }}>
                Opacity {opacity * 100}%
              </Text>
            </View>
          ))}
        </View>

        {/* Theme-aware spacing */}
        <View style={[createCardStyle(colors)]}>
          <Text style={[createTextStyle(colors, 'primary'), { fontWeight: '600', marginBottom: spacing.md }]}>
            Consistent Spacing
          </Text>
          <Text style={[createTextStyle(colors, 'secondary'), { marginBottom: spacing.sm }]}>
            All spacing uses theme values:
          </Text>
          <Text style={[createTextStyle(colors, 'light'), { fontSize: typography.fontSize.sm }]}>
            • xs: {spacing.xs}px
          </Text>
          <Text style={[createTextStyle(colors, 'light'), { fontSize: typography.fontSize.sm }]}>
            • sm: {spacing.sm}px
          </Text>
          <Text style={[createTextStyle(colors, 'light'), { fontSize: typography.fontSize.sm }]}>
            • md: {spacing.md}px
          </Text>
          <Text style={[createTextStyle(colors, 'light'), { fontSize: typography.fontSize.sm }]}>
            • lg: {spacing.lg}px
          </Text>
        </View>

      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  buttonSection: {
    alignItems: 'stretch',
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  shadowExample: {
    padding: 20,
    borderRadius: 8,
  },
  opacityExample: {
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
});

export default ThemedComponentExample;