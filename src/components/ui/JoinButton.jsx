import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import AddIcon from '../../../assets/icons/add.svg';

/**
 * JoinButton component - displays a join/invite button with dashed circle
 *
 * @param {string} label - Button text ('Join' or 'Invite')
 * @param {function} onPress - Function to call when button is pressed
 * @param {string} align - Alignment direction ('left' or 'right')
 */
export default function JoinButton({ label = 'Join', onPress, align = 'right' }) {
  const isRTL = align === 'left';

  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, isRTL && styles.containerRTL]}
      onPress={handlePress}
    >
      <Text style={[styles.label, isRTL && styles.labelRTL]}>{label}</Text>
      <View style={styles.dashedCircle}>
        <AddIcon width={32} height={32} color={Colors.neutral400} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.space2,
  },
  containerRTL: {
    flexDirection: 'row-reverse',
  },
  label: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.button,
    lineHeight: Typography.button * Typography.lineHeightButton,
    color: Colors.primary300,
  },
  labelRTL: {
    textAlign: 'left',
  },
  dashedCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
