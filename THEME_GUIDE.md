# Theme System Guide

## Overview

The app uses a comprehensive theme system that supports both light and dark modes with consistent design tokens and utilities.

## Quick Start

```tsx
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/useTheme';
import { createCardStyle, createButtonStyle } from '../theme/themeUtils';

const MyComponent = () => {
  const { colors, gradients, shadows, spacing } = useTheme();

  return (
    <View style={[createCardStyle(colors), { padding: spacing.lg }]}>
      <Text style={{ color: colors.text }}>Hello World</Text>
      <TouchableOpacity style={createButtonStyle(colors, 'primary')}>
        <Text style={{ color: colors.textOnPrimary }}>Button</Text>
      </TouchableOpacity>
    </View>
  );
};
```

## Core Components

### 1. useTheme Hook

The primary way to access theme values in components:

```tsx
const { 
  colors,      // All color tokens
  gradients,   // Gradient arrays
  shadows,     // Shadow styles
  spacing,     // Spacing values
  borderRadius, // Border radius values
  typography,  // Font settings
  iconSizes,   // Icon size presets
  animation,   // Animation durations
  isDark,      // Boolean for dark mode
  toggleTheme  // Function to switch themes
} = useTheme();
```

### 2. Theme Configuration

All theme values are centralized in `src/theme/themeConfig.ts`:

- **Brand Colors**: Primary, secondary, accent colors
- **Semantic Colors**: Success, warning, error, info
- **Typography**: Font families, sizes, weights
- **Spacing**: Consistent spacing scale
- **Shadows**: Platform-aware shadow presets
- **Border Radius**: Consistent corner radius values

### 3. Theme Utilities

Helper functions in `src/theme/themeUtils.ts`:

```tsx
// Style creators
createCardStyle(colors)
createButtonStyle(colors, 'primary' | 'secondary' | 'outline')
createInputStyle(colors)
createTextStyle(colors, 'primary' | 'secondary' | 'light')

// Color utilities
withOpacity(color, opacity)
lightenColor(color, amount)
darkenColor(color, amount)
getStatusColor(status, colors)
getPriorityColor(priority, colors)

// Shadow utilities
createShadow(elevation, color, opacity)
```

## Component Patterns

### 1. Basic Component with Theme

```tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/useTheme';

const MyComponent = () => {
  const { colors, spacing } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Title
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16, // Or use spacing.lg
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
```

### 2. Component with Dynamic Colors

```tsx
const StatusBadge = ({ status }: { status: string }) => {
  const { colors } = useTheme();
  const statusColor = getStatusColor(status, colors);

  return (
    <View style={[styles.badge, { backgroundColor: statusColor }]}>
      <Text style={styles.badgeText}>{status}</Text>
    </View>
  );
};
```

### 3. Component with Gradients

```tsx
import LinearGradient from 'react-native-linear-gradient';

const GradientHeader = () => {
  const { gradients } = useTheme();

  return (
    <LinearGradient
      colors={gradients.primary}
      style={styles.header}
    >
      <Text style={styles.headerText}>Header</Text>
    </LinearGradient>
  );
};
```

## Theme Toggle

Add theme switching capability:

```tsx
import ThemeToggle from '../components/common/ThemeToggle';

// In your component
<ThemeToggle size={24} />
```

## Best Practices

### 1. Always Use Theme Colors

❌ **Don't:** Hardcode colors
```tsx
<Text style={{ color: '#333' }}>Text</Text>
```

✅ **Do:** Use theme colors
```tsx
<Text style={{ color: colors.text }}>Text</Text>
```

### 2. Use Consistent Spacing

❌ **Don't:** Random spacing values
```tsx
<View style={{ padding: 15, margin: 23 }}>
```

✅ **Do:** Use theme spacing
```tsx
<View style={{ padding: spacing.lg, margin: spacing.xl }}>
```

### 3. Use Theme Utilities

❌ **Don't:** Recreate common patterns
```tsx
<View style={{
  backgroundColor: '#fff',
  borderRadius: 12,
  padding: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  // ... more shadow props
}}>
```

✅ **Do:** Use utility functions
```tsx
<View style={createCardStyle(colors)}>
```

### 4. Handle Both Light and Dark Modes

❌ **Don't:** Assume light mode
```tsx
<StatusBar barStyle="dark-content" />
```

✅ **Do:** Use theme-aware values
```tsx
<StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
```

## Color Tokens

### Light Theme
- **Background**: #ffffff
- **Surface**: #f8fafc
- **Text**: #1e293b
- **Primary**: #4423a9
- **Secondary**: #68b0cb

### Dark Theme
- **Background**: #0f172a
- **Surface**: #1e293b
- **Text**: #f8fafc
- **Primary**: #5845b7
- **Secondary**: #68b0cb

## Migration Guide

If you have existing components with hardcoded colors:

1. Import `useTheme`:
```tsx
import { useTheme } from '../theme/useTheme';
```

2. Get theme values:
```tsx
const { colors, spacing } = useTheme();
```

3. Replace hardcoded values:
```tsx
// Before
<View style={{ backgroundColor: '#fff', padding: 16 }}>

// After
<View style={{ backgroundColor: colors.card, padding: spacing.lg }}>
```

4. Update text colors:
```tsx
// Before
<Text style={{ color: '#333' }}>

// After
<Text style={{ color: colors.text }}>
```

## Examples

See `src/components/examples/ThemedComponentExample.tsx` for comprehensive usage examples.

## Legacy Support

For backward compatibility, `COLORS` and `FONTS` are still exported from the theme:

```tsx
import { COLORS, FONTS } from '../theme';
```

However, it's recommended to use the `useTheme` hook for new components.