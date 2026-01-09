import React from 'react';
import { Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

/**
 * LinkButton component - A text-based button with optional icon
 *
 * @param {string} title - Button text
 * @param {function} onPress - Function to call when button is pressed
 * @param {ReactNode} icon - Optional icon component
 * @param {number} iconSize - Icon size in pixels (default: 20px)
 * @param {string} variant - Color variant: 'neutral', 'primary', or 'destructive'
 * @param {number} spacing - Bottom padding spacing (1, 2, 3, or 4 for space1-space4, default: 4)
 * @param {object} style - Additional styles to apply
 * @param {boolean} disabled - Whether the button is disabled
 */
export default function LinkButton({
  title,
  onPress,
  icon = null,
  iconSize = 20,
  variant = 'neutral',
  spacing = 4,
  style,
  disabled = false
}) {
  const handlePress = () => {
    if (!disabled) {
      if (Platform.OS === 'ios') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
      onPress?.();
    }
  };

  const getTextColor = () => {
    if (disabled) return Colors.neutral400;

    switch (variant) {
      case 'primary':
        return Colors.primary300;
      case 'destructive':
        return Colors.error;
      case 'neutral':
      default:
        return Colors.neutral400;
    }
  };

  const getIconColor = () => {
    if (disabled) return Colors.neutral400;

    switch (variant) {
      case 'primary':
        return Colors.primary300;
      case 'destructive':
        return Colors.error;
      case 'neutral':
      default:
        return Colors.neutral400;
    }
  };

  // Clone icon with color prop if icon is provided
  const coloredIcon = icon ? React.cloneElement(icon, {
    color: getIconColor(),
    width: iconSize,
    height: iconSize
  }) : null;

  // Get spacing value from Spacing constants
  const getSpacingValue = () => {
    switch (spacing) {
      case 1: return Spacing.space1;
      case 2: return Spacing.space2;
      case 3: return Spacing.space3;
      case 4: return Spacing.space4;
      default: return Spacing.space4;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, { paddingBottom: getSpacingValue() }, style]}
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      {coloredIcon}
      <Text style={[styles.text, { color: getTextColor() }]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.space1,
  },
  text: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.button,
    lineHeight: Typography.button,
  },
});
