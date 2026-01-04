// src/components/ui/Input.jsx

import React, { useState, forwardRef } from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import EyeIcon from '../../../assets/icons/eye.svg';
import EyeClosedIcon from '../../../assets/icons/eyeclosed.svg';

const Input = forwardRef(({
  label,
  hint,
  placeholder,
  value,
  onChangeText,
  error,
  disabled = false,
  secureTextEntry = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  multiline = false,
  numberOfLines = 1,
  variant = 'light', // 'light' or 'dark'
  showPasswordToggle = false,
  onTogglePassword,
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return Colors.error;
    if (variant === 'dark') {
      return isFocused ? Colors.primary200 : Colors.primary200;
    }
    if (isFocused) return Colors.primary200;
    return Colors.border;
  };

  const getStyles = () => {
    if (variant === 'dark') {
      return {
        label: styles.labelDark,
        input: styles.inputDark,
        placeholder: Colors.neutral300,
        textColor: Colors.surface,
      };
    }
    return {
      label: styles.label,
      input: styles.input,
      placeholder: Colors.neutral400,
      textColor: Colors.primary300,
    };
  };

  const componentStyles = getStyles();

  return (
    <View style={styles.container}>
      {label && (
        <Text style={componentStyles.label}>{label}</Text>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          ref={ref}
          style={[
            componentStyles.input,
            { borderColor: getBorderColor(), color: componentStyles.textColor },
            disabled && styles.inputDisabled,
            multiline && { height: 56 * numberOfLines, textAlignVertical: 'top' },
            showPasswordToggle && styles.inputWithIcon,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={componentStyles.placeholder}
          editable={!disabled}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />

        {showPasswordToggle && onTogglePassword && (
          <TouchableOpacity
            style={styles.eyeButton}
            onPress={onTogglePassword}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {secureTextEntry ? (
              <EyeClosedIcon
                width={24}
                height={24}
                color={variant === 'dark' ? Colors.surface : Colors.neutral400}
              />
            ) : (
              <EyeIcon
                width={24}
                height={24}
                color={variant === 'dark' ? Colors.surface : Colors.neutral400}
              />
            )}
          </TouchableOpacity>
        )}
      </View>

{hint && !error && (
  <Text style={styles.hint}>{hint}</Text>
)}

{error && (
  <Text style={styles.errorText}>{error}</Text>
)}
    </View>
  );
});

Input.displayName = 'Input';

export default Input;

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    position: 'relative',
    width: '100%',
  },
  label: {
    fontSize: Typography.body200,
    fontFamily: 'GeneralSans-Semibold',
    color: Colors.primary300,
    marginBottom: Spacing.space1,
    lineHeight: Typography.body300 * 1.5,
  },
  labelDark: {
    fontSize: Typography.body200,
    fontFamily: 'GeneralSans-Semibold',
    color: Colors.surface,
    marginBottom: Spacing.space1,
    lineHeight: Typography.body300 * 1.5,
  },
  input: {
    height: 56,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.space4,
    paddingVertical: 13,
    fontSize: Typography.body200,
    fontFamily: 'GeneralSans-Medium',
    color: Colors.primary300,
    lineHeight: Typography.body200 * 1.2,
  },
  inputDark: {
    height: 56,
    backgroundColor: Colors.primary300,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.space4,
    paddingVertical: 13,
    fontSize: Typography.body200,
    fontFamily: 'GeneralSans-Medium',
    color: Colors.surface,
    lineHeight: Typography.body200 * 1.2,
  },
  inputDisabled: {
    backgroundColor: Colors.neutral100,
    color: Colors.neutral300,
  },
  hint: {
    fontSize: Typography.body300,
    fontFamily: 'GeneralSans-Medium',
    color: Colors.neutral400,
    marginTop: Spacing.space1,
    lineHeight: Typography.body300 * 1.5,
  },
  errorText: {
    fontSize: Typography.body300,
    fontFamily: 'GeneralSans-Medium',
    color: Colors.error,
    marginTop: Spacing.space1,
    lineHeight: Typography.body300 * 1.5,
  },
  inputWithIcon: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: Spacing.space4,
    top: 16,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
});