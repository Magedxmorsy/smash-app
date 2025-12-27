# Design Tokens Reference

This file defines the design system tokens for the SMASH tournament app.

## Recommended Implementation

Create these files in your project:

### src/design-system/tokens.ts

```typescript
/**
 * Color Tokens
 * Based on iOS/Material Design color system
 */
export const colors = {
  // Primary Brand Colors
  primary: '#007AFF',
  primaryDark: '#0051D5',
  primaryLight: '#4DA3FF',

  // Secondary Colors
  secondary: '#5856D6',
  secondaryDark: '#3634A3',
  secondaryLight: '#7D7AFF',

  // Semantic Colors
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  info: '#007AFF',

  // Grayscale (Light Mode)
  gray: {
    50: '#F9F9F9',
    100: '#F2F2F7',
    200: '#E5E5EA',
    300: '#D1D1D6',
    400: '#C6C6C8',
    500: '#AEAEB2',
    600: '#8E8E93',
    700: '#636366',
    800: '#48484A',
    900: '#3A3A3C',
  },

  // Backgrounds
  background: {
    light: '#FFFFFF',
    dark: '#000000',
    lightSecondary: '#F2F2F7',
    darkSecondary: '#1C1C1E',
  },

  // Surfaces
  surface: {
    light: '#FFFFFF',
    dark: '#1C1C1E',
    lightElevated: '#F2F2F7',
    darkElevated: '#2C2C2E',
  },

  // Text
  text: {
    primary: '#000000',
    primaryDark: '#FFFFFF',
    secondary: '#3C3C43',
    secondaryDark: '#EBEBF5',
    tertiary: '#8E8E93',
    tertiaryDark: '#98989D',
    disabled: '#C6C6C8',
  },

  // Borders
  border: {
    light: '#C6C6C8',
    dark: '#38383A',
    lightSecondary: '#E5E5EA',
    darkSecondary: '#48484A',
  },

  // Tournament Specific
  tournament: {
    live: '#FF3B30',
    upcoming: '#007AFF',
    completed: '#8E8E93',
    winner: '#FFD700', // Gold
  },
} as const;

/**
 * Spacing Tokens
 * Based on 4px grid system
 */
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

/**
 * Border Radius Tokens
 */
export const borderRadius = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  xxl: 24,
  full: 9999, // For pills and circles
} as const;

/**
 * Typography Tokens
 */
export const typography = {
  // Headings
  h1: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 'bold' as const,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 'bold' as const,
    letterSpacing: -0.3,
  },
  h3: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: '600' as const,
    letterSpacing: -0.2,
  },
  h4: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: -0.1,
  },

  // Body Text
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 'normal' as const,
    letterSpacing: 0,
  },
  bodyBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0,
  },

  // Smaller Text
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 'normal' as const,
    letterSpacing: 0,
  },
  small: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 'normal' as const,
    letterSpacing: 0,
  },

  // Button Text
  button: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  },
  buttonSmall: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600' as const,
    letterSpacing: 0.1,
  },
} as const;

/**
 * Shadow Tokens
 * Platform-specific shadow definitions
 */
export const shadows = {
  sm: {
    // Small elevation (cards, buttons)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2, // Android
  },
  md: {
    // Medium elevation (modals, dropdowns)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    // Large elevation (sheets, prominent cards)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  xl: {
    // Extra large elevation (full screen modals)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
} as const;

/**
 * Size Tokens
 */
export const sizes = {
  // Icon sizes
  icon: {
    sm: 16,
    md: 24,
    lg: 32,
    xl: 48,
  },

  // Avatar sizes
  avatar: {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 96,
  },

  // Button heights
  button: {
    sm: 32,
    md: 44,
    lg: 56,
  },

  // Input heights
  input: {
    sm: 36,
    md: 44,
    lg: 52,
  },

  // Touch target minimum
  touchTarget: 44,
} as const;

/**
 * Animation Tokens
 */
export const animation = {
  // Duration in milliseconds
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
  },

  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
  },
} as const;

/**
 * Z-Index Tokens
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  modal: 1200,
  popover: 1300,
  tooltip: 1400,
  toast: 1500,
} as const;

/**
 * Breakpoint Tokens (for responsive design)
 */
export const breakpoints = {
  sm: 375,  // Small phones
  md: 768,  // Tablets
  lg: 1024, // Large tablets / small desktops
  xl: 1280, // Desktops
} as const;
```

## Usage Examples

### Example 1: Using Color Tokens

```typescript
import { colors } from '@/design-system/tokens';

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.light,
    borderColor: colors.border.light,
  },
  text: {
    color: colors.text.primary,
  },
  button: {
    backgroundColor: colors.primary,
  },
});
```

### Example 2: Using Spacing Tokens

```typescript
import { spacing } from '@/design-system/tokens';

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm, // For flexbox gap
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
});
```

### Example 3: Using Typography Tokens

```typescript
import { typography } from '@/design-system/tokens';

const styles = StyleSheet.create({
  heading: {
    ...typography.h1,
  },
  body: {
    ...typography.body,
  },
  caption: {
    ...typography.caption,
    color: colors.text.secondary,
  },
});
```

### Example 4: Using Shadow Tokens

```typescript
import { shadows } from '@/design-system/tokens';

const styles = StyleSheet.create({
  card: {
    ...shadows.md,
    backgroundColor: colors.surface.light,
  },
  modal: {
    ...shadows.xl,
  },
});
```

### Example 5: Complete Component with Tokens

```typescript
import { colors, spacing, typography, borderRadius, shadows } from '@/design-system/tokens';

interface CardProps {
  children: React.ReactNode;
  variant?: 'elevated' | 'outlined' | 'flat';
}

export function Card({ children, variant = 'elevated' }: CardProps) {
  const variantStyles = {
    elevated: {
      ...shadows.md,
      backgroundColor: colors.surface.light,
    },
    outlined: {
      borderWidth: 1,
      borderColor: colors.border.light,
      backgroundColor: colors.surface.light,
    },
    flat: {
      backgroundColor: colors.surface.lightElevated,
    },
  };

  return (
    <View style={[styles.container, variantStyles[variant]]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
});
```

## Migration Guide

### Before (Magic Numbers)
```typescript
const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 24,
    borderRadius: 8,
    backgroundColor: '#007AFF',
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
});
```

### After (Design Tokens)
```typescript
import { spacing, borderRadius, colors, typography } from '@/design-system/tokens';

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
    margin: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
  },
  text: {
    ...typography.bodyBold,
    color: colors.text.primary,
  },
});
```

## Benefits

✅ **Consistency**: All components use same values
✅ **Maintainability**: Change once, update everywhere
✅ **Scalability**: Easy to add themes (light/dark mode)
✅ **Type Safety**: TypeScript autocomplete for all tokens
✅ **Documentation**: Self-documenting design system
✅ **Collaboration**: Designers and developers speak same language

## Theme Support

For dark mode support:

```typescript
import { useColorScheme } from 'react-native';
import { colors } from '@/design-system/tokens';

export function useThemeColors() {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return {
    background: isDark ? colors.background.dark : colors.background.light,
    text: isDark ? colors.text.primaryDark : colors.text.primary,
    border: isDark ? colors.border.dark : colors.border.light,
    // ... other theme-aware colors
  };
}
```

## Validation Rules

When auditing code, flag these violations:

❌ Hardcoded numbers: `padding: 16`
❌ Hardcoded colors: `color: '#007AFF'`
❌ Inconsistent spacing: `padding: 14` (not in scale)
❌ Magic numbers: `fontSize: 17` (not defined in typography)

✅ Should be: `padding: spacing.md`
✅ Should be: `color: colors.primary`
✅ Should be: Use defined scale (4, 8, 16, 24, etc.)
✅ Should be: `...typography.body`
