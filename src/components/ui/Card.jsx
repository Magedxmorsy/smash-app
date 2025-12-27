import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Spacing, BorderRadius } from '../../constants/Spacing';

/**
 * Card component following DESIGN.md specifications
 *
 * @param {object} style - Additional styles to apply
 * @param {ReactNode} children - Card content
 */
export default function Card({ style, children }) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.radius4,
    padding: Spacing.space5,
  },
});
