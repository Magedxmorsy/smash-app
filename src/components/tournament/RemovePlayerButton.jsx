import React from 'react';
import { TouchableOpacity, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import CloseDarkIcon from '../../../assets/icons/closedark.svg';
import { Colors } from '../../constants/Colors';

export default function RemovePlayerButton({
  onPress,
  visible = true,
  size = 20,
  containerSize = 40,
  align = 'left',
}) {
  if (!visible) return null;

  const handlePress = () => {
    if (Platform.OS === 'ios') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  // Position based on player alignment
  const position = align === 'right'
    ? { top: -4, right: -4 }
    : { top: -4, left: -4 };

  return (
    <TouchableOpacity
      style={[styles.container, position]}
      onPress={handlePress}
      activeOpacity={0.7}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
    >
      <CloseDarkIcon width={size} height={size} color={Colors.error} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
