// src/components/ui/Input.jsx

import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

export default function Input({
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
}) {
  const [isFocused, setIsFocused] = useState(false);

  const getBorderColor = () => {
    if (error) return Colors.error;
    if (isFocused) return Colors.primary200;
    return Colors.border;
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>{label}</Text>
      )}
      
      <TextInput
        style={[
          styles.input,
          { borderColor: getBorderColor() },
          disabled && styles.inputDisabled,
          multiline && { height: 56 * numberOfLines, textAlignVertical: 'top' },
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.neutral400}
        editable={!disabled}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        multiline={multiline}
        numberOfLines={numberOfLines}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

{hint && !error && (
  <Text style={styles.hint}>{hint}</Text>
)}

{error && (
  <Text style={styles.errorText}>{error}</Text>
)}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: Typography.body200,
    fontFamily: 'GeneralSans-Semibold',
    color: Colors.primary300,
    marginBottom: Spacing.space1, // 4px
    lineHeight: Typography.body300 * 1.5,
  },
  input: {
    height: 56,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.space4, // 16px
    paddingVertical: 13,
    fontSize: Typography.body200,
    fontFamily: 'GeneralSans-Medium',
    color: Colors.primary300,
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
    marginTop: Spacing.space1, // 4px
    lineHeight: Typography.body300 * 1.5,
  },
  errorText: {
    color: Colors.error,
  },
});