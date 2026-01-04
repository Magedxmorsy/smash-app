import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';

/**
 * Badge component following DESIGN.md specifications
 *
 * @param {string} variant - Badge variant: 'group_stage', 'registration', 'quarter_finals', 'semi_finals', 'finals', 'knockout', 'finished'
 * @param {string} label - Badge text content
 * @param {object} style - Additional styles
 */
export default function Badge({ variant = 'registration', label, style }) {
  const getVariantStyle = () => {
    switch (variant.toLowerCase().replace(/[-\s]/g, '_')) {
      case 'group_stage':
        return styles.groupStage;
      case 'registration':
        return styles.registration;
      case 'knockout':
      case 'quarter_finals':
        return styles.quarterFinals;
      case 'semi_finals':
        return styles.semiFinals;
      case 'finals':
        return styles.finals;
      case 'finished':
        return styles.finished;
      default:
        return styles.registration;
    }
  };

  const getTextStyle = () => {
    const variantKey = variant.toLowerCase().replace(/[-\s]/g, '_');
    if (variantKey === 'group_stage') {
      return styles.textLight;
    }
    return styles.textDark;
  };

  return (
    <View style={[styles.badge, getVariantStyle(), style]}>
      <Text style={[styles.text, getTextStyle()]}>{label?.toUpperCase() || ''}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingVertical: Spacing.space1 / 2,
    paddingHorizontal: Spacing.space1,
    borderRadius: BorderRadius.radius1,
    alignSelf: 'flex-start',
  },
  text: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.label,
    lineHeight: Typography.label * 1.2,
    letterSpacing: 0.5,
  },
  // Variant styles based on DESIGN.md
  groupStage: {
    backgroundColor: Colors.info,
  },
  registration: {
    backgroundColor: Colors.neutral300,
  },
  quarterFinals: {
    backgroundColor: Colors.warningLight,
  },
  semiFinals: {
    backgroundColor: Colors.warningLight,
  },
  finals: {
    backgroundColor: Colors.secondary100,
  },
  finished: {
    backgroundColor: Colors.successLight,
  },
  // Text colors
  textLight: {
    color: Colors.surface,
  },
  textDark: {
    color: Colors.primary300,
  },
});
