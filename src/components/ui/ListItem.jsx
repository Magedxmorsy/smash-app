import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import SelectorIcon from '../../../assets/icons/selector.svg';

export default function ListItem({ 
  icon, 
  label, 
  value,
  onPress,
  onChangeText,
  placeholder,
  keyboardType = 'default',
  editable = false,
  showChevron = true,
}) {
  if (editable) {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          {icon}
        </View>
        <TextInput
          style={styles.input}
          placeholder={placeholder || label}
          placeholderTextColor={Colors.neutral400}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          textAlignVertical="center"
        />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.iconContainer}>
        {icon}
      </View>
      <View style={styles.content}>
        <Text style={value ? styles.label : styles.placeholder}>
          {value || placeholder || label}
        </Text>
      </View>
      {showChevron && (
        <View style={styles.chevronContainer}>
          <SelectorIcon width={24} height={24} />
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.space4,
    paddingHorizontal: Spacing.space4,
    minHeight: 56,
  },
  iconContainer: {
    width: 24,
    height: 24,
    marginRight: Spacing.space3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  input: {
    flex: 1,
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    padding: 0,
    paddingVertical: 0,
    margin: 0,
    height: 24,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  label: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    lineHeight: Typography.body200 * 1.5,
  },
  placeholder: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.neutral400,
    lineHeight: Typography.body200 * 1.5,
  },
  chevronContainer: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.space2,
  },
});