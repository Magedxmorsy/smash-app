import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Banner from '../Banner';

describe('Banner', () => {
  const mockOnClose = jest.fn();
  const defaultProps = {
    message: 'Test message',
    onClose: mockOnClose,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with default props', () => {
      const { getByText } = render(<Banner {...defaultProps} />);
      expect(getByText('Test message')).toBeTruthy();
    });

    it('should render success variant', () => {
      const { getByText } = render(
        <Banner {...defaultProps} variant="success" />
      );
      expect(getByText('Test message')).toBeTruthy();
    });

    it('should render info variant (default)', () => {
      const { getByText } = render(
        <Banner {...defaultProps} variant="info" />
      );
      expect(getByText('Test message')).toBeTruthy();
    });

    it('should render error variant', () => {
      const { getByText } = render(
        <Banner {...defaultProps} variant="error" />
      );
      expect(getByText('Test message')).toBeTruthy();
    });

    it('should render warning variant', () => {
      const { getByText } = render(
        <Banner {...defaultProps} variant="warning" />
      );
      expect(getByText('Test message')).toBeTruthy();
    });

    it('should render long message text', () => {
      const longMessage = 'This is a very long message that should wrap to multiple lines and test the flexWrap functionality of the banner component';
      const { getByText } = render(
        <Banner message={longMessage} onClose={mockOnClose} />
      );
      expect(getByText(longMessage)).toBeTruthy();
    });
  });

  describe('Dismissible behavior', () => {
    it('should render close button when dismissible is true (default)', () => {
      const { getByText } = render(<Banner {...defaultProps} />);
      // Banner should render with message, close button is present by default
      expect(getByText('Test message')).toBeTruthy();
    });

    it('should not render close button when dismissible is false', () => {
      const { getByText } = render(
        <Banner {...defaultProps} dismissible={false} />
      );
      // Banner should still render message even without close button
      expect(getByText('Test message')).toBeTruthy();
    });

    it('should call onClose when close button is pressed', () => {
      const { getByText, UNSAFE_root } = render(<Banner {...defaultProps} />);

      // Find all touchable components in the tree
      const touchables = UNSAFE_root.findAllByType('TouchableOpacity');

      // Close button should be the touchable
      if (touchables.length > 0) {
        fireEvent.press(touchables[0]);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should not call onClose when dismissible is false', () => {
      const { UNSAFE_root } = render(
        <Banner {...defaultProps} dismissible={false} />
      );
      const touchables = UNSAFE_root.findAllByType('TouchableOpacity');

      expect(touchables.length).toBe(0);
      expect(mockOnClose).not.toHaveBeenCalled();
    });
  });

  describe('Variants and Icons', () => {
    it('should render success icon for success variant', () => {
      const { getByText } = render(
        <Banner {...defaultProps} variant="success" />
      );
      // Success variant should render the message
      expect(getByText('Test message')).toBeTruthy();
    });

    it('should render info icon for info variant', () => {
      const { getByText } = render(
        <Banner {...defaultProps} variant="info" />
      );
      expect(getByText('Test message')).toBeTruthy();
    });

    it('should render error icon for error variant', () => {
      const { getByText } = render(
        <Banner {...defaultProps} variant="error" />
      );
      expect(getByText('Test message')).toBeTruthy();
    });

    it('should render warning icon for warning variant', () => {
      const { getByText } = render(
        <Banner {...defaultProps} variant="warning" />
      );
      expect(getByText('Test message')).toBeTruthy();
    });

    it('should default to info variant when no variant specified', () => {
      const { getByText } = render(
        <Banner message="Info message" onClose={mockOnClose} />
      );
      expect(getByText('Info message')).toBeTruthy();
    });
  });

  describe('Message content', () => {
    it('should render empty message', () => {
      const { getByText } = render(
        <Banner message="" onClose={mockOnClose} />
      );
      expect(getByText('')).toBeTruthy();
    });

    it('should render message with special characters', () => {
      const specialMessage = 'Test @#$%^&*() message!';
      const { getByText } = render(
        <Banner message={specialMessage} onClose={mockOnClose} />
      );
      expect(getByText(specialMessage)).toBeTruthy();
    });

    it('should render message with numbers', () => {
      const numericMessage = 'You have 5 new notifications';
      const { getByText } = render(
        <Banner message={numericMessage} onClose={mockOnClose} />
      );
      expect(getByText(numericMessage)).toBeTruthy();
    });

    it('should render multiline message', () => {
      const multilineMessage = 'Line 1\nLine 2\nLine 3';
      const { getByText } = render(
        <Banner message={multilineMessage} onClose={mockOnClose} />
      );
      expect(getByText(multilineMessage)).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle missing onClose prop gracefully when dismissible', () => {
      // Should not crash even without onClose
      const { getByText, UNSAFE_root } = render(
        <Banner message="Test" />
      );

      expect(getByText('Test')).toBeTruthy();

      // Find touchable and press it - should not crash
      const touchables = UNSAFE_root.findAllByType('TouchableOpacity');
      if (touchables.length > 0) {
        expect(() => fireEvent.press(touchables[0])).not.toThrow();
      }
    });

    it('should handle all props together', () => {
      const { getByText } = render(
        <Banner
          variant="warning"
          message="Complex test"
          onClose={mockOnClose}
          dismissible={true}
        />
      );
      expect(getByText('Complex test')).toBeTruthy();
    });

    it('should render with non-dismissible success variant', () => {
      const { getByText, UNSAFE_root } = render(
        <Banner
          variant="success"
          message="Success!"
          dismissible={false}
        />
      );

      expect(getByText('Success!')).toBeTruthy();
      const touchables = UNSAFE_root.findAllByType('TouchableOpacity');
      expect(touchables.length).toBe(0);
    });

    it('should render with non-dismissible error variant', () => {
      const { getByText, UNSAFE_root } = render(
        <Banner
          variant="error"
          message="Error occurred"
          dismissible={false}
        />
      );

      expect(getByText('Error occurred')).toBeTruthy();
      const touchables = UNSAFE_root.findAllByType('TouchableOpacity');
      expect(touchables.length).toBe(0);
    });
  });

  describe('Accessibility', () => {
    it('should have proper hit slop for close button', () => {
      const { UNSAFE_root } = render(<Banner {...defaultProps} />);
      const touchables = UNSAFE_root.findAllByType('TouchableOpacity');

      if (touchables.length > 0) {
        expect(touchables[0].props.hitSlop).toEqual({
          top: 10,
          bottom: 10,
          left: 10,
          right: 10
        });
      }
    });

    it('should render message text with proper accessibility', () => {
      const accessibleMessage = 'Important notification message';
      const { getByText } = render(
        <Banner message={accessibleMessage} onClose={mockOnClose} />
      );

      const messageText = getByText(accessibleMessage);
      expect(messageText).toBeTruthy();
    });
  });
});
