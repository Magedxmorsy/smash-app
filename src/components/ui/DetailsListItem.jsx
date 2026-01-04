import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

/**
 * DetailsListItem component for displaying icon + text combinations
 * Used in tournament details, cards, and other info displays
 *
 * @param {ReactNode} icon - SVG icon component (24x24)
 * @param {string} text - Text content to display
 * @param {object} style - Additional styles for the container
 * @param {ReactNode} actionIcon - Optional action icon (e.g., info icon) displayed on the right
 * @param {function} onActionPress - Optional callback when action icon is pressed
 */
export default function DetailsListItem({ icon, text, style, actionIcon, onActionPress }) {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>{icon}</View>
      <Text style={styles.text} numberOfLines={1}>
        {text}
      </Text>
      {actionIcon && onActionPress && (
        <TouchableOpacity
          onPress={onActionPress}
          style={styles.actionButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {actionIcon}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: Spacing.iconSize,
    height: Spacing.iconSize,
    marginRight: Spacing.space2,
  },
  text: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    flex: 1,
  },
  actionButton: {
    marginLeft: Spacing.space2,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
