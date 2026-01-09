import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Platform, TouchableOpacity } from 'react-native';
import { jest } from '@jest/globals';
import RemovePlayerButton from '../RemovePlayerButton';
import * as Haptics from 'expo-haptics';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'light' },
}));

describe('RemovePlayerButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when visible is true', () => {
      const onPress = jest.fn();
      const { UNSAFE_root } = render(
        <RemovePlayerButton visible={true} onPress={onPress} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render by default (visible defaults to true)', () => {
      const onPress = jest.fn();
      const { UNSAFE_root } = render(
        <RemovePlayerButton onPress={onPress} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should not render when visible is false', () => {
      const onPress = jest.fn();
      const { UNSAFE_root } = render(
        <RemovePlayerButton visible={false} onPress={onPress} />
      );

      // Check that TouchableOpacity is not rendered
      expect(UNSAFE_root.findAllByType(TouchableOpacity)).toHaveLength(0);
    });
  });

  describe('Press Handling', () => {
    it('should call onPress when pressed', () => {
      const onPress = jest.fn();
      const { UNSAFE_root } = render(
        <RemovePlayerButton onPress={onPress} />
      );

      const button = UNSAFE_root.findByType(TouchableOpacity);
      fireEvent.press(button);

      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should handle multiple presses', () => {
      const onPress = jest.fn();
      const { UNSAFE_root } = render(
        <RemovePlayerButton onPress={onPress} />
      );

      const button = UNSAFE_root.findByType(TouchableOpacity);
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(onPress).toHaveBeenCalledTimes(3);
    });

    it('should not call onPress when visible is false', () => {
      const onPress = jest.fn();
      render(<RemovePlayerButton visible={false} onPress={onPress} />);

      // Button is not rendered, so onPress should never be called
      expect(onPress).not.toHaveBeenCalled();
    });

    it('should handle rapid successive presses', () => {
      const onPress = jest.fn();
      const { UNSAFE_root } = render(
        <RemovePlayerButton onPress={onPress} />
      );

      const button = UNSAFE_root.findByType(TouchableOpacity);

      // Simulate rapid tapping
      for (let i = 0; i < 10; i++) {
        fireEvent.press(button);
      }

      expect(onPress).toHaveBeenCalledTimes(10);
    });
  });

  describe('Haptic Feedback', () => {
    const originalPlatform = Platform.OS;

    afterEach(() => {
      Platform.OS = originalPlatform;
    });

    it('should trigger haptic feedback on iOS', () => {
      Platform.OS = 'ios';
      const onPress = jest.fn();
      const { UNSAFE_root } = render(
        <RemovePlayerButton onPress={onPress} />
      );

      const button = UNSAFE_root.findByType(TouchableOpacity);
      fireEvent.press(button);

      expect(Haptics.impactAsync).toHaveBeenCalledWith(Haptics.ImpactFeedbackStyle.Light);
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should not trigger haptic feedback on Android', () => {
      Platform.OS = 'android';
      const onPress = jest.fn();
      const { UNSAFE_root } = render(
        <RemovePlayerButton onPress={onPress} />
      );

      const button = UNSAFE_root.findByType(TouchableOpacity);
      fireEvent.press(button);

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
      expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('should not trigger haptic feedback on web', () => {
      Platform.OS = 'web';
      const onPress = jest.fn();
      const { UNSAFE_root } = render(
        <RemovePlayerButton onPress={onPress} />
      );

      const button = UNSAFE_root.findByType(TouchableOpacity);
      fireEvent.press(button);

      expect(Haptics.impactAsync).not.toHaveBeenCalled();
      expect(onPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('should have hitSlop for easy tapping', () => {
      const onPress = jest.fn();
      const { UNSAFE_root } = render(
        <RemovePlayerButton onPress={onPress} />
      );

      const button = UNSAFE_root.findByType(TouchableOpacity);
      expect(button.props.hitSlop).toEqual({
        top: 8,
        bottom: 8,
        left: 8,
        right: 8,
      });
    });

    it('should have activeOpacity for visual feedback', () => {
      const onPress = jest.fn();
      const { UNSAFE_root } = render(
        <RemovePlayerButton onPress={onPress} />
      );

      const button = UNSAFE_root.findByType(TouchableOpacity);
      expect(button.props.activeOpacity).toBe(0.7);
    });
  });

  describe('Positioning', () => {
    it('should position top-left by default (align=left)', () => {
      const onPress = jest.fn();
      const { UNSAFE_root } = render(
        <RemovePlayerButton onPress={onPress} />
      );

      const button = UNSAFE_root.findByType(TouchableOpacity);
      const styles = button.props.style;

      // Find position style object
      const positionStyle = Array.isArray(styles)
        ? styles.find(s => s && s.top !== undefined)
        : styles;

      expect(positionStyle.top).toBe(-4);
      expect(positionStyle.left).toBe(-4);
      expect(positionStyle.right).toBeUndefined();
    });

    it('should position top-right when align is right', () => {
      const onPress = jest.fn();
      const { UNSAFE_root } = render(
        <RemovePlayerButton onPress={onPress} align="right" />
      );

      const button = UNSAFE_root.findByType(TouchableOpacity);
      const styles = button.props.style;

      // Find position style object
      const positionStyle = Array.isArray(styles)
        ? styles.find(s => s && s.top !== undefined)
        : styles;

      expect(positionStyle.top).toBe(-4);
      expect(positionStyle.right).toBe(-4);
      expect(positionStyle.left).toBeUndefined();
    });

    it('should position top-left when align is left explicitly', () => {
      const onPress = jest.fn();
      const { UNSAFE_root } = render(
        <RemovePlayerButton onPress={onPress} align="left" />
      );

      const button = UNSAFE_root.findByType(TouchableOpacity);
      const styles = button.props.style;

      // Find position style object
      const positionStyle = Array.isArray(styles)
        ? styles.find(s => s && s.top !== undefined)
        : styles;

      expect(positionStyle.top).toBe(-4);
      expect(positionStyle.left).toBe(-4);
      expect(positionStyle.right).toBeUndefined();
    });

    it('should handle invalid align values (defaults to left behavior)', () => {
      const onPress = jest.fn();
      const { UNSAFE_root } = render(
        <RemovePlayerButton onPress={onPress} align="center" />
      );

      const button = UNSAFE_root.findByType(TouchableOpacity);
      const styles = button.props.style;

      // Find position style object
      const positionStyle = Array.isArray(styles)
        ? styles.find(s => s && s.top !== undefined)
        : styles;

      // Should default to left positioning
      expect(positionStyle.top).toBe(-4);
      expect(positionStyle.left).toBe(-4);
      expect(positionStyle.right).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle containerSize prop (passed but not used in current implementation)', () => {
      const onPress = jest.fn();
      const { UNSAFE_root } = render(
        <RemovePlayerButton onPress={onPress} containerSize={60} />
      );

      // Component should still render
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should maintain absolute positioning', () => {
      const onPress = jest.fn();
      const { UNSAFE_root } = render(
        <RemovePlayerButton onPress={onPress} />
      );

      const button = UNSAFE_root.findByType(TouchableOpacity);
      const styles = button.props.style;

      // Find container style
      const containerStyle = Array.isArray(styles)
        ? styles.find(s => s && s.position !== undefined)
        : styles;

      expect(containerStyle.position).toBe('absolute');
    });
  });

  describe('Integration Scenarios', () => {
    it('should work correctly when toggling visibility', () => {
      const onPress = jest.fn();
      const { rerender, UNSAFE_root } = render(
        <RemovePlayerButton visible={true} onPress={onPress} />
      );

      // Initially visible
      expect(UNSAFE_root.findAllByType(TouchableOpacity)).toHaveLength(1);

      // Hide button
      rerender(
        <RemovePlayerButton visible={false} onPress={onPress} />
      );

      expect(UNSAFE_root.findAllByType(TouchableOpacity)).toHaveLength(0);

      // Show button again
      rerender(
        <RemovePlayerButton visible={true} onPress={onPress} />
      );

      expect(UNSAFE_root.findAllByType(TouchableOpacity)).toHaveLength(1);
    });

    it('should work correctly when changing alignment', () => {
      const onPress = jest.fn();
      const { rerender, UNSAFE_root } = render(
        <RemovePlayerButton onPress={onPress} align="left" />
      );

      let button = UNSAFE_root.findByType(TouchableOpacity);
      let styles = button.props.style;
      let positionStyle = Array.isArray(styles)
        ? styles.find(s => s && s.left !== undefined)
        : styles;
      expect(positionStyle.left).toBe(-4);

      // Change to right alignment
      rerender(
        <RemovePlayerButton onPress={onPress} align="right" />
      );

      button = UNSAFE_root.findByType(TouchableOpacity);
      styles = button.props.style;
      positionStyle = Array.isArray(styles)
        ? styles.find(s => s && s.right !== undefined)
        : styles;
      expect(positionStyle.right).toBe(-4);
    });

    it('should maintain onPress functionality when size changes', () => {
      const onPress = jest.fn();
      const { rerender, UNSAFE_root } = render(
        <RemovePlayerButton onPress={onPress} size={20} />
      );

      // Press with size 20
      let button = UNSAFE_root.findByType(TouchableOpacity);
      fireEvent.press(button);
      expect(onPress).toHaveBeenCalledTimes(1);

      // Change size
      rerender(
        <RemovePlayerButton onPress={onPress} size={30} />
      );

      // Press with size 30
      button = UNSAFE_root.findByType(TouchableOpacity);
      fireEvent.press(button);
      expect(onPress).toHaveBeenCalledTimes(2);
    });
  });
});
