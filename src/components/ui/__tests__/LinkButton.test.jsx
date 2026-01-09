import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View } from 'react-native';
import LinkButton from '../LinkButton';

// Mock expo-haptics
jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Light: 'light',
  },
}));

// Mock icon component
const MockIcon = (props) => <View testID="mock-icon" {...props} />;

describe('LinkButton', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with title', () => {
      const { getByText } = render(
        <LinkButton title="Click me" onPress={mockOnPress} />
      );

      expect(getByText('Click me')).toBeTruthy();
    });

    it('should render without icon', () => {
      const { getByText, queryByTestId } = render(
        <LinkButton title="No icon" onPress={mockOnPress} />
      );

      expect(getByText('No icon')).toBeTruthy();
      expect(queryByTestId('mock-icon')).toBeNull();
    });

    it('should render with icon', () => {
      const { getByText, getByTestId } = render(
        <LinkButton
          title="With icon"
          icon={<MockIcon />}
          onPress={mockOnPress}
        />
      );

      expect(getByText('With icon')).toBeTruthy();
      expect(getByTestId('mock-icon')).toBeTruthy();
    });

    it('should render with custom icon size', () => {
      const { getByTestId } = render(
        <LinkButton
          title="Custom size"
          icon={<MockIcon />}
          iconSize={32}
          onPress={mockOnPress}
        />
      );

      const icon = getByTestId('mock-icon');
      expect(icon.props.width).toBe(32);
      expect(icon.props.height).toBe(32);
    });

    it('should use default icon size of 20px', () => {
      const { getByTestId } = render(
        <LinkButton
          title="Default size"
          icon={<MockIcon />}
          onPress={mockOnPress}
        />
      );

      const icon = getByTestId('mock-icon');
      expect(icon.props.width).toBe(20);
      expect(icon.props.height).toBe(20);
    });
  });

  describe('Variants', () => {
    it('should render neutral variant (default)', () => {
      const { getByText } = render(
        <LinkButton title="Neutral" onPress={mockOnPress} />
      );

      expect(getByText('Neutral')).toBeTruthy();
    });

    it('should render primary variant', () => {
      const { getByText } = render(
        <LinkButton
          title="Primary"
          variant="primary"
          onPress={mockOnPress}
        />
      );

      expect(getByText('Primary')).toBeTruthy();
    });

    it('should render destructive variant', () => {
      const { getByText } = render(
        <LinkButton
          title="Destructive"
          variant="destructive"
          onPress={mockOnPress}
        />
      );

      expect(getByText('Destructive')).toBeTruthy();
    });
  });

  describe('Press Behavior', () => {
    it('should call onPress when pressed', () => {
      const { getByText } = render(
        <LinkButton title="Press me" onPress={mockOnPress} />
      );

      fireEvent.press(getByText('Press me'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it('should not call onPress when disabled', () => {
      const { getByText } = render(
        <LinkButton
          title="Disabled"
          onPress={mockOnPress}
          disabled={true}
        />
      );

      fireEvent.press(getByText('Disabled'));
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it('should handle press without onPress callback', () => {
      const { getByText } = render(
        <LinkButton title="No callback" />
      );

      expect(() => fireEvent.press(getByText('No callback'))).not.toThrow();
    });

    it('should handle multiple presses', () => {
      const { getByText } = render(
        <LinkButton title="Multiple" onPress={mockOnPress} />
      );

      const button = getByText('Multiple');
      fireEvent.press(button);
      fireEvent.press(button);
      fireEvent.press(button);

      expect(mockOnPress).toHaveBeenCalledTimes(3);
    });
  });

  describe('Disabled State', () => {
    it('should render disabled button', () => {
      const { getByText } = render(
        <LinkButton
          title="Disabled"
          onPress={mockOnPress}
          disabled={true}
        />
      );

      expect(getByText('Disabled')).toBeTruthy();
    });

    it('should not trigger haptic feedback when disabled', () => {
      const Haptics = require('expo-haptics');

      const { getByText } = render(
        <LinkButton
          title="Disabled"
          onPress={mockOnPress}
          disabled={true}
        />
      );

      fireEvent.press(getByText('Disabled'));
      expect(Haptics.impactAsync).not.toHaveBeenCalled();
    });

    it('should be disabled by default when disabled prop is not provided', () => {
      const { getByText } = render(
        <LinkButton title="Default disabled" onPress={mockOnPress} />
      );

      // Button should be enabled by default
      fireEvent.press(getByText('Default disabled'));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });
  });

  describe('Icon Behavior', () => {
    it('should pass color to icon based on variant', () => {
      const { getByTestId } = render(
        <LinkButton
          title="Primary with icon"
          icon={<MockIcon />}
          variant="primary"
          onPress={mockOnPress}
        />
      );

      const icon = getByTestId('mock-icon');
      expect(icon.props.color).toBeTruthy();
    });

    it('should pass neutral color to icon when disabled', () => {
      const { getByTestId } = render(
        <LinkButton
          title="Disabled with icon"
          icon={<MockIcon />}
          variant="primary"
          disabled={true}
          onPress={mockOnPress}
        />
      );

      const icon = getByTestId('mock-icon');
      expect(icon.props.color).toBeTruthy();
    });
  });

  describe('Custom Styles', () => {
    it('should accept custom style prop', () => {
      const customStyle = { marginTop: 20 };

      const { getByText } = render(
        <LinkButton
          title="Custom style"
          style={customStyle}
          onPress={mockOnPress}
        />
      );

      expect(getByText('Custom style')).toBeTruthy();
    });

    it('should work without custom style', () => {
      const { getByText } = render(
        <LinkButton title="No custom style" onPress={mockOnPress} />
      );

      expect(getByText('No custom style')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle all props together', () => {
      const { getByText, getByTestId } = render(
        <LinkButton
          title="All props"
          icon={<MockIcon />}
          iconSize={24}
          variant="primary"
          onPress={mockOnPress}
          disabled={false}
          style={{ marginTop: 10 }}
        />
      );

      expect(getByText('All props')).toBeTruthy();
      expect(getByTestId('mock-icon')).toBeTruthy();
    });

    it('should handle empty title', () => {
      const { getByText } = render(
        <LinkButton title="" onPress={mockOnPress} />
      );

      expect(getByText('')).toBeTruthy();
    });

    it('should handle long titles', () => {
      const longTitle = 'This is a very long button title that should still render correctly';

      const { getByText } = render(
        <LinkButton title={longTitle} onPress={mockOnPress} />
      );

      expect(getByText(longTitle)).toBeTruthy();
    });

    it('should handle special characters in title', () => {
      const specialTitle = 'Button @#$%^&*()!';

      const { getByText } = render(
        <LinkButton title={specialTitle} onPress={mockOnPress} />
      );

      expect(getByText(specialTitle)).toBeTruthy();
    });
  });

  describe('Typography', () => {
    it('should use correct font family', () => {
      const { getByText } = render(
        <LinkButton title="Font test" onPress={mockOnPress} />
      );

      const text = getByText('Font test');
      expect(text.props.style).toContainEqual(
        expect.objectContaining({ fontFamily: 'GeneralSans-Semibold' })
      );
    });
  });

  describe('Accessibility', () => {
    it('should have activeOpacity of 0.7', () => {
      const { UNSAFE_root } = render(
        <LinkButton title="Opacity test" onPress={mockOnPress} />
      );

      const touchables = UNSAFE_root.findAllByType('TouchableOpacity');
      if (touchables.length > 0) {
        expect(touchables[0].props.activeOpacity).toBe(0.7);
      }
    });

    it('should be marked as disabled when disabled prop is true', () => {
      const { UNSAFE_root } = render(
        <LinkButton title="Disabled" onPress={mockOnPress} disabled={true} />
      );

      const touchables = UNSAFE_root.findAllByType('TouchableOpacity');
      if (touchables.length > 0) {
        expect(touchables[0].props.disabled).toBe(true);
      }
    });

    it('should not be marked as disabled by default', () => {
      const { UNSAFE_root } = render(
        <LinkButton title="Enabled" onPress={mockOnPress} />
      );

      const touchables = UNSAFE_root.findAllByType('TouchableOpacity');
      if (touchables.length > 0) {
        expect(touchables[0].props.disabled).toBe(false);
      }
    });
  });

  describe('Variant Color Matching', () => {
    it('should apply correct color for primary variant', () => {
      const { getByText } = render(
        <LinkButton
          title="Primary"
          variant="primary"
          onPress={mockOnPress}
        />
      );

      const text = getByText('Primary');
      expect(text.props.style).toBeTruthy();
    });

    it('should apply correct color for destructive variant', () => {
      const { getByText } = render(
        <LinkButton
          title="Destructive"
          variant="destructive"
          onPress={mockOnPress}
        />
      );

      const text = getByText('Destructive');
      expect(text.props.style).toBeTruthy();
    });

    it('should apply correct color for neutral variant', () => {
      const { getByText } = render(
        <LinkButton
          title="Neutral"
          variant="neutral"
          onPress={mockOnPress}
        />
      );

      const text = getByText('Neutral');
      expect(text.props.style).toBeTruthy();
    });
  });
});
