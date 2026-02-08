import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';

export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  fullWidth = true,
  size = 'large', // 'large' (56px) or 'medium' (48px)
  loading = false,
  testID,
}) {
  const handlePress = () => {
    if (!disabled && !loading) {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.();
    }
  };

  const getButtonStyle = () => {
    if (disabled || loading) return styles.disabled;

    switch (variant) {
      case 'primary':
        return styles.primary;
      case 'secondary':
        return styles.secondary;
      case 'accent':
        return styles.accent;
      case 'ghost':
        return styles.ghost;
      default:
        return styles.primary;
    }
  };

  const getTextStyle = () => {
    if (disabled || loading) return styles.textDisabled;

    switch (variant) {
      case 'primary':
      case 'secondary':
        return styles.textLight;
      case 'accent':
        return styles.textDark;
      case 'ghost':
        return styles.textDark;
      default:
        return styles.textLight;
    }
  };

  const getSpinnerColor = () => {
    // Always use primary color for spinner
    return Colors.primary300;
  };

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.button,
        size === 'medium' && styles.buttonMedium,
        getButtonStyle(),
        !fullWidth && styles.buttonHug,
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={1}
      onPressIn={(e) => {
        if (!loading) {
          e.currentTarget.setNativeProps({
            style: { transform: [{ scale: 0.98 }] }
          });
        }
      }}
      onPressOut={(e) => {
        if (!loading) {
          e.currentTarget.setNativeProps({
            style: { transform: [{ scale: 1 }] }
          });
        }
      }}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getSpinnerColor()} />
      ) : (
        <Text style={[
          styles.text,
          size === 'medium' && styles.textMedium,
          getTextStyle()
        ]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: Spacing.buttonHeightLarge,
    borderRadius: Spacing.buttonHeightLarge / 2, // Fully rounded (pill shape)
    paddingVertical: Spacing.space2,
    paddingHorizontal: Spacing.space4,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  buttonMedium: {
    minHeight: Spacing.buttonHeightMedium,
    borderRadius: Spacing.buttonHeightMedium / 2, // Fully rounded for medium size
    paddingVertical: Spacing.space2,
  },
  buttonHug: {
    width: 'auto',
    alignSelf: 'center',
    paddingHorizontal: Spacing.space6, // 24px
  },
  primary: {
    backgroundColor: Colors.primary300,
  },
  secondary: {
    backgroundColor: Colors.secondary300,
  },
  accent: {
    backgroundColor: Colors.accent300,
  },
  ghost: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disabled: {
    backgroundColor: Colors.neutral200,
  },
  text: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.button, // 16px - for all buttons
    lineHeight: Typography.button * 1.3, // 130% line height to prevent clipping on Android
    ...Platform.select({
      android: {
        includeFontPadding: false, // Remove extra padding on Android
      },
    }),
  },
  textMedium: {
    fontSize: Typography.button, // 16px - for small/medium buttons
    lineHeight: Typography.button * 1.3, // 130% line height
  },
  textLight: {
    color: Colors.surface, // White
  },
  textDark: {
    color: Colors.primary300, // Dark purple
  },
  textDisabled: {
    color: Colors.neutral400,
  },
});