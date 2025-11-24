import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
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
}) {
  const handlePress = () => {
    if (!disabled) {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.();
    }
  };

  const getButtonStyle = () => {
    if (disabled) return styles.disabled;
    
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
    if (disabled) return styles.textDisabled;
    
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

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        !fullWidth && styles.buttonHug,
      ]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={1}
      onPressIn={(e) => {
        e.currentTarget.setNativeProps({
          style: { transform: [{ scale: 0.98 }] }
        });
      }}
      onPressOut={(e) => {
        e.currentTarget.setNativeProps({
          style: { transform: [{ scale: 1 }] }
        });
      }}
    >
      <Text style={[styles.text, getTextStyle()]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: BorderRadius.radius4, // 16px
    paddingVertical: Spacing.space2, // 8px
    paddingHorizontal: Spacing.space4, // 16px
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
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
    fontSize: Typography.button, // 16px
    lineHeight: Typography.button, // 100% line height
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