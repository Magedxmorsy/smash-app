import React, { useState } from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

export default function TextArea({
  label,
  hint,
  placeholder,
  value,
  onChangeText,
  error,
  disabled = false,
  numberOfLines = 4,
  maxLength,
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
          { borderColor: getBorderColor(), height: 56 * numberOfLines },
          disabled && styles.inputDisabled,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={Colors.neutral400}
        editable={!disabled}
        multiline={true}
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        maxLength={maxLength}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />

      {(hint || error) && !maxLength && (
        <Text style={[styles.hint, error && styles.errorText]}>
          {error || hint}
        </Text>
      )}

      {maxLength && (
        <View style={styles.footer}>
          {(hint || error) && (
            <Text style={[styles.hint, error && styles.errorText]}>
              {error || hint}
            </Text>
          )}
          <Text style={styles.counter}>
            {value?.length || 0}/{maxLength}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    fontSize: Typography.body300,
    fontFamily: 'GeneralSans-Semibold',
    color: Colors.primary300,
    marginBottom: Spacing.space1,
    lineHeight: Typography.body300 * 1.5,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: Spacing.space4,
    paddingTop: 13,
    paddingBottom: 13,
    fontSize: Typography.body200,
    fontFamily: 'GeneralSans-Medium',
    color: Colors.primary300,
    lineHeight: Typography.body200 * 1.5,
    textAlignVertical: 'top',
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
    color: Colors.error,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.space1,
  },
  counter: {
    fontSize: Typography.body300,
    fontFamily: 'GeneralSans-Medium',
    color: Colors.neutral400,
    lineHeight: Typography.body300 * 1.5,
  },
});