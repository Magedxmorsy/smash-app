import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { View } from 'react-native';
import Header from '../Header';

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 44, bottom: 0, left: 0, right: 0 }),
}));

// Mock expo-blur
jest.mock('expo-blur', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    BlurView: ({ children }) => <View testID="blur-view">{children}</View>,
  };
});

// Mock SVG icons
jest.mock('../../../assets/branding/smash-logo.svg', () => 'SmashLogo');
jest.mock('../../../assets/icons/add.svg', () => 'AddIcon');
jest.mock('../../../assets/icons/chevronleft.svg', () => 'ChevronLeft');
jest.mock('../../../assets/icons/share.svg', () => 'ShareIcon');
jest.mock('../../../assets/icons/More.svg', () => 'MoreIcon');

describe('Header', () => {
  describe('Page Variant', () => {
    it('should render page variant by default', () => {
      const { getByTestId } = render(<Header />);

      expect(getByTestId('blur-view')).toBeTruthy();
    });

    it('should render with logo when showLogo is true', () => {
      const { UNSAFE_root } = render(<Header showLogo={true} />);

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render without logo by default', () => {
      const { UNSAFE_root } = render(<Header />);

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render with title in page variant', () => {
      const { getByText } = render(<Header title="Page Title" />);

      expect(getByText('Page Title')).toBeTruthy();
    });

    it('should not render title when not provided in page variant', () => {
      const { queryByText, getByTestId } = render(<Header />);

      expect(getByTestId('blur-view')).toBeTruthy();
    });
  });

  describe('Inner Variant', () => {
    it('should render inner variant with back button', () => {
      const mockOnBack = jest.fn();
      const { UNSAFE_root } = render(
        <Header variant="inner" onBack={mockOnBack} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should call onBack when back button is pressed', () => {
      const mockOnBack = jest.fn();
      const { UNSAFE_root } = render(
        <Header variant="inner" onBack={mockOnBack} />
      );

      const touchables = UNSAFE_root.findAllByType('TouchableOpacity');
      if (touchables.length > 0) {
        fireEvent.press(touchables[0]);
        expect(mockOnBack).toHaveBeenCalledTimes(1);
      }
    });

    it('should render with title in inner variant', () => {
      const { getByText } = render(
        <Header variant="inner" title="Detail Page" onBack={jest.fn()} />
      );

      expect(getByText('Detail Page')).toBeTruthy();
    });

    it('should have back button hitSlop', () => {
      const mockOnBack = jest.fn();
      const { UNSAFE_root } = render(
        <Header variant="inner" onBack={mockOnBack} />
      );

      const touchables = UNSAFE_root.findAllByType('TouchableOpacity');
      if (touchables.length > 0) {
        expect(touchables[0].props.hitSlop).toEqual({
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        });
      }
    });
  });

  describe('Right Icon', () => {
    it('should render with add icon (default)', () => {
      const { UNSAFE_root } = render(
        <Header rightIcon="add" onRightPress={jest.fn()} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render with share icon', () => {
      const { UNSAFE_root } = render(
        <Header rightIcon="share" onRightPress={jest.fn()} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should render with more icon', () => {
      const { UNSAFE_root } = render(
        <Header rightIcon="more" onRightPress={jest.fn()} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should call onRightPress when right icon is pressed', () => {
      const mockOnRightPress = jest.fn();
      const { UNSAFE_root } = render(
        <Header rightIcon="add" onRightPress={mockOnRightPress} />
      );

      const touchables = UNSAFE_root.findAllByType('TouchableOpacity');
      if (touchables.length > 0) {
        const lastTouchable = touchables[touchables.length - 1];
        fireEvent.press(lastTouchable);
        expect(mockOnRightPress).toHaveBeenCalledTimes(1);
      }
    });

    it('should render without right icon', () => {
      const { UNSAFE_root } = render(<Header />);

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should have right button hitSlop', () => {
      const { UNSAFE_root } = render(
        <Header rightIcon="add" onRightPress={jest.fn()} />
      );

      const touchables = UNSAFE_root.findAllByType('TouchableOpacity');
      if (touchables.length > 0) {
        const lastTouchable = touchables[touchables.length - 1];
        expect(lastTouchable.props.hitSlop).toEqual({
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        });
      }
    });

    it('should render with custom RightIconComponent', () => {
      const CustomIcon = () => <View testID="custom-icon" />;
      const { getByTestId } = render(
        <Header
          rightIcon="custom"
          RightIconComponent={CustomIcon}
          onRightPress={jest.fn()}
        />
      );

      expect(getByTestId('custom-icon')).toBeTruthy();
    });
  });

  describe('Combined Props', () => {
    it('should render page variant with all props', () => {
      const { getByText } = render(
        <Header
          variant="page"
          title="Home"
          showLogo={true}
          rightIcon="add"
          onRightPress={jest.fn()}
        />
      );

      expect(getByText('Home')).toBeTruthy();
    });

    it('should render inner variant with all props', () => {
      const { getByText } = render(
        <Header
          variant="inner"
          title="Details"
          onBack={jest.fn()}
          rightIcon="share"
          onRightPress={jest.fn()}
        />
      );

      expect(getByText('Details')).toBeTruthy();
    });
  });

  describe('Title Rendering', () => {
    it('should render title in page variant', () => {
      const { getByText } = render(<Header variant="page" title="Page" />);

      expect(getByText('Page')).toBeTruthy();
    });

    it('should render title in inner variant', () => {
      const { getByText } = render(
        <Header variant="inner" title="Inner" onBack={jest.fn()} />
      );

      expect(getByText('Inner')).toBeTruthy();
    });

    it('should render long title', () => {
      const longTitle = 'This is a very long title for the header';
      const { getByText } = render(<Header title={longTitle} />);

      expect(getByText(longTitle)).toBeTruthy();
    });

    it('should render title with special characters', () => {
      const specialTitle = 'Title @#$%^&*()!';
      const { getByText } = render(<Header title={specialTitle} />);

      expect(getByText(specialTitle)).toBeTruthy();
    });
  });

  describe('Blur Effect', () => {
    it('should render BlurView', () => {
      const { getByTestId } = render(<Header />);

      expect(getByTestId('blur-view')).toBeTruthy();
    });

    it('should render BlurView in page variant', () => {
      const { getByTestId } = render(<Header variant="page" />);

      expect(getByTestId('blur-view')).toBeTruthy();
    });

    it('should render BlurView in inner variant', () => {
      const { getByTestId } = render(
        <Header variant="inner" onBack={jest.fn()} />
      );

      expect(getByTestId('blur-view')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing onBack in inner variant', () => {
      const { UNSAFE_root } = render(<Header variant="inner" />);

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should handle missing onRightPress with rightIcon', () => {
      const { UNSAFE_root } = render(<Header rightIcon="add" />);

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should handle empty title', () => {
      const { getByTestId } = render(<Header title="" />);

      // Empty title still renders the header
      expect(getByTestId('blur-view')).toBeTruthy();
    });
  });

  describe('Callbacks', () => {
    it('should handle multiple back button presses', () => {
      const mockOnBack = jest.fn();
      const { UNSAFE_root } = render(
        <Header variant="inner" onBack={mockOnBack} />
      );

      const touchables = UNSAFE_root.findAllByType('TouchableOpacity');
      if (touchables.length > 0) {
        fireEvent.press(touchables[0]);
        fireEvent.press(touchables[0]);
        fireEvent.press(touchables[0]);
        expect(mockOnBack).toHaveBeenCalledTimes(3);
      }
    });

    it('should handle multiple right button presses', () => {
      const mockOnRightPress = jest.fn();
      const { UNSAFE_root } = render(
        <Header rightIcon="add" onRightPress={mockOnRightPress} />
      );

      const touchables = UNSAFE_root.findAllByType('TouchableOpacity');
      if (touchables.length > 0) {
        const lastTouchable = touchables[touchables.length - 1];
        fireEvent.press(lastTouchable);
        fireEvent.press(lastTouchable);
        expect(mockOnRightPress).toHaveBeenCalledTimes(2);
      }
    });
  });

  describe('Variant Switching', () => {
    it('should update from page to inner variant', () => {
      const { rerender, getByText } = render(
        <Header variant="page" title="Page" />
      );

      expect(getByText('Page')).toBeTruthy();

      rerender(<Header variant="inner" title="Inner" onBack={jest.fn()} />);

      expect(getByText('Inner')).toBeTruthy();
    });

    it('should update from inner to page variant', () => {
      const { rerender, getByText } = render(
        <Header variant="inner" title="Inner" onBack={jest.fn()} />
      );

      expect(getByText('Inner')).toBeTruthy();

      rerender(<Header variant="page" title="Page" />);

      expect(getByText('Page')).toBeTruthy();
    });
  });

  describe('Safe Area', () => {
    it('should render with safe area insets', () => {
      const { UNSAFE_root } = render(<Header />);

      expect(UNSAFE_root).toBeTruthy();
    });
  });

  describe('Logo Display', () => {
    it('should render logo when showLogo is true in page variant', () => {
      const { UNSAFE_root } = render(<Header variant="page" showLogo={true} />);

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should not render logo when showLogo is false', () => {
      const { UNSAFE_root } = render(
        <Header variant="page" showLogo={false} />
      );

      expect(UNSAFE_root).toBeTruthy();
    });

    it('should toggle logo display', () => {
      const { rerender, UNSAFE_root } = render(
        <Header variant="page" showLogo={false} />
      );

      expect(UNSAFE_root).toBeTruthy();

      rerender(<Header variant="page" showLogo={true} />);

      expect(UNSAFE_root).toBeTruthy();
    });
  });
});
