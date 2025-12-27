import React from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import SelectorIcon from '../../../assets/icons/selector.svg';
import ChevronRightIcon from '../../../assets/icons/chevronright.svg';

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
  useChevronRight = false, // New prop to control which icon to show
  rightComponent, // Custom component to show on the right (like a Switch)
  subtitle, // Optional subtitle text
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

  const Container = onPress ? TouchableOpacity : View;

  return (
    <Container
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <View style={styles.iconContainer}>
          {icon}
        </View>
      )}
      <View style={styles.content}>
        <Text style={value ? styles.label : styles.placeholder}>
          {value || placeholder || label}
        </Text>
        {subtitle && (
          <Text style={styles.subtitle}>{subtitle}</Text>
        )}
      </View>
      {rightComponent || (showChevron && (
        <View style={styles.chevronContainer}>
          {useChevronRight ? (
            <ChevronRightIcon width={24} height={24} />
          ) : (
            <SelectorIcon width={24} height={24} />
          )}
        </View>
      ))}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.space4,
    paddingHorizontal: Spacing.space4,
    minHeight: Spacing.listItemHeight,
  },
  iconContainer: {
    width: Spacing.iconSize,
    height: Spacing.iconSize,
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
    height: Spacing.iconSize,
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
  subtitle: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: Typography.body300,
    color: Colors.neutral400,
    lineHeight: 18,
    marginTop: Spacing.space1,
  },
  chevronContainer: {
    width: Spacing.iconSize,
    height: Spacing.iconSize,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.space2,
  },
});