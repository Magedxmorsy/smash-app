import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';

export default function FilterChips({ chips, activeChip, onChipPress }) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {chips.map((chip) => (
          <TouchableOpacity
            key={chip}
            style={[
              styles.chip,
              activeChip === chip && styles.chipActive,
            ]}
            onPress={() => onChipPress(chip)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.chipText,
                activeChip === chip && styles.chipTextActive,
              ]}
            >
              {chip}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: Spacing.space2, // 8px spacing between chips and match cards
  },
  container: {
    flexDirection: 'row',
    gap: Spacing.space1, // 4px gap
  },
  chip: {
    paddingVertical: 10, // Custom value per user spec (not in design system)
    paddingHorizontal: Spacing.space3, // 12px
    borderRadius: BorderRadius.radius2, // 8px
    backgroundColor: Colors.surface, // White
    borderWidth: 1,
    borderColor: Colors.border, // Light gray
  },
  chipActive: {
    backgroundColor: Colors.primary300, // Dark purple
    borderWidth: 0,
  },
  chipText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body300, // 13px
    color: Colors.primary300, // Dark purple
    lineHeight: Typography.body300 * 1.5, // 150% line height
  },
  chipTextActive: {
    color: Colors.surface, // White
  },
});
