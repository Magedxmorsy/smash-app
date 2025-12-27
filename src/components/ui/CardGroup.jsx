import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';

export default function CardGroup({ title, children }) {
  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <View style={styles.card}>
        {React.Children.map(children, (child, index) => (
          <React.Fragment key={index}>
            {index > 0 && <View style={styles.divider} />}
            {child}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // No marginBottom - parent will handle spacing with gap
  },
  title: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.primary300,
    marginBottom: Spacing.space1,
    lineHeight: Typography.headline100 * 1.18,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.radius4,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  divider: {
    height: Spacing.dividerHeight,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.space4,
  },
});