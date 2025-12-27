import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';

export default function UpcomingMatchWrapper({ children }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your next match</Text>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.accent300,
    borderRadius: BorderRadius.radius4,
    paddingTop: Spacing.space2,
    paddingHorizontal: Spacing.space0half,
    paddingBottom: Spacing.space0half,
  },
  title: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.primary300,
    textAlign: 'center',
    marginBottom: Spacing.space2,
  },
});
