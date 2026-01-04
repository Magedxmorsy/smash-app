import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import SuccessIcon from '../../../assets/icons/success-white.svg';
import ErrorIcon from '../../../assets/icons/error-white.svg';
import CloseIcon from '../../../assets/icons/closeicon-white.svg';

export default function Toast({ visible, message, variant, onClose }) {
  const insets = useSafeAreaInsets();
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          tension: 65,
          friction: 10,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide animation
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  if (!visible && fadeAnim._value === 0) {
    return null;
  }

  const variantStyles = {
    success: {
      backgroundColor: Colors.success,
    },
    error: {
      backgroundColor: Colors.error,
    },
  };

  const textAndIconColor = '#FFFFFF';
  const LeftIcon = variant === 'success' ? SuccessIcon : ErrorIcon;

  const hitSlop = { top: 10, bottom: 10, left: 10, right: 10 };

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingBottom: insets.bottom + 24,
          transform: [{ translateY: slideAnim }],
          opacity: fadeAnim,
        },
      ]}
      pointerEvents="box-none"
    >
      <View style={[styles.toast, variantStyles[variant]]}>
        <View style={styles.iconContainer}>
          <LeftIcon width={24} height={24} color={textAndIconColor} />
        </View>
        <Text style={[styles.message, { color: textAndIconColor }]} numberOfLines={3}>
          {message}
        </Text>
        <TouchableOpacity onPress={onClose} hitSlop={hitSlop} style={styles.closeButton}>
          <CloseIcon width={24} height={24} color={textAndIconColor} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    paddingHorizontal: Spacing.space4,
    alignItems: 'center',
  },
  toast: {
    paddingVertical: Spacing.space4,
    paddingHorizontal: Spacing.space4,
    borderRadius: BorderRadius.radius4,
    borderWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.space3,
    maxWidth: 600,
    width: '100%',
  },
  iconContainer: {
    flexShrink: 0,
  },
  message: {
    flex: 1,
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    flexWrap: 'wrap',
  },
  closeButton: {
    flexShrink: 0,
  },
});
