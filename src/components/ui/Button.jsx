import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';

export default function Button({ 
  title, 
  onPress, 
  variant = 'primary',
  disabled = false,
  fullWidth = true 
}) {
  const getButtonStyle = () => {
    if (disabled) return styles.buttonDisabled;
    
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'accent':
        return styles.buttonAccent;
      case 'ghost':
        return styles.buttonGhost;
      default:
        return styles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    if (disabled) return styles.textDisabled;
    if (variant === 'ghost') return styles.textGhost;
    if (variant === 'accent') return styles.textAccent;
    return styles.textLight;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        fullWidth && styles.fullWidth,
        !fullWidth && styles.autoWidth,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, getTextStyle()]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: BorderRadius.radius4,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.space2,
    paddingHorizontal: Spacing.space4,
  },
  fullWidth: {
    width: '100%',
  },
  autoWidth: {
    paddingHorizontal: Spacing.space6,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary300,
  },
  buttonSecondary: {
    backgroundColor: Colors.secondary300,
  },
  buttonAccent: {
    backgroundColor: Colors.accent300,
  },
  buttonGhost: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  buttonDisabled: {
    backgroundColor: Colors.neutral200,
  },
  text: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.button,
    lineHeight: Typography.button * Typography.lineHeightButton,
  },
  textLight: {
    color: Colors.surface,
  },
  textGhost: {
    color: Colors.primary300,
  },
  textAccent: {
    color: Colors.primary300,
  },
  textDisabled: {
    color: Colors.neutral400,
  },
});