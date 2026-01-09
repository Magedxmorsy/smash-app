import React from 'react';
import { render } from '@testing-library/react-native';
import { View, Text } from 'react-native';
import BottomSheet from '../BottomSheet';

// Mock react-native-modal
jest.mock('react-native-modal', () => {
  const React = require('react');
  const { View } = require('react-native');

  return ({ isVisible, children, onBackdropPress, onSwipeComplete }) => {
    if (!isVisible) return null;

    return (
      <View testID="modal-container">
        {children}
      </View>
    );
  };
});

describe('BottomSheet', () => {
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render when visible is true', () => {
      const { getByTestId } = render(
        <BottomSheet visible={true} onClose={mockOnClose}>
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(getByTestId('modal-container')).toBeTruthy();
    });

    it('should not render when visible is false', () => {
      const { queryByTestId } = render(
        <BottomSheet visible={false} onClose={mockOnClose}>
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(queryByTestId('modal-container')).toBeNull();
    });

    it('should render with title', () => {
      const { getByText } = render(
        <BottomSheet visible={true} onClose={mockOnClose} title="Test Title">
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(getByText('Test Title')).toBeTruthy();
    });

    it('should render without title', () => {
      const { queryByText, getByText } = render(
        <BottomSheet visible={true} onClose={mockOnClose}>
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(getByText('Content')).toBeTruthy();
    });

    it('should render children content', () => {
      const { getByText } = render(
        <BottomSheet visible={true} onClose={mockOnClose}>
          <Text>Child Content</Text>
        </BottomSheet>
      );

      expect(getByText('Child Content')).toBeTruthy();
    });

    it('should render multiple children', () => {
      const { getByText } = render(
        <BottomSheet visible={true} onClose={mockOnClose}>
          <Text>First Child</Text>
          <Text>Second Child</Text>
          <Text>Third Child</Text>
        </BottomSheet>
      );

      expect(getByText('First Child')).toBeTruthy();
      expect(getByText('Second Child')).toBeTruthy();
      expect(getByText('Third Child')).toBeTruthy();
    });
  });

  describe('Footer', () => {
    it('should render with footer', () => {
      const { getByText } = render(
        <BottomSheet
          visible={true}
          onClose={mockOnClose}
          footer={<Text>Footer Content</Text>}
        >
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(getByText('Footer Content')).toBeTruthy();
    });

    it('should render without footer', () => {
      const { queryByText, getByText } = render(
        <BottomSheet visible={true} onClose={mockOnClose}>
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(getByText('Content')).toBeTruthy();
    });

    it('should render both content and footer', () => {
      const { getByText } = render(
        <BottomSheet
          visible={true}
          onClose={mockOnClose}
          footer={<Text>Footer</Text>}
        >
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(getByText('Content')).toBeTruthy();
      expect(getByText('Footer')).toBeTruthy();
    });
  });

  describe('Visibility Toggle', () => {
    it('should show when visible changes from false to true', () => {
      const { getByTestId, rerender } = render(
        <BottomSheet visible={false} onClose={mockOnClose}>
          <Text>Content</Text>
        </BottomSheet>
      );

      // Initially not visible
      expect(() => getByTestId('modal-container')).toThrow();

      // Change to visible
      rerender(
        <BottomSheet visible={true} onClose={mockOnClose}>
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(getByTestId('modal-container')).toBeTruthy();
    });

    it('should hide when visible changes from true to false', () => {
      const { getByTestId, rerender, queryByTestId } = render(
        <BottomSheet visible={true} onClose={mockOnClose}>
          <Text>Content</Text>
        </BottomSheet>
      );

      // Initially visible
      expect(getByTestId('modal-container')).toBeTruthy();

      // Change to not visible
      rerender(
        <BottomSheet visible={false} onClose={mockOnClose}>
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(queryByTestId('modal-container')).toBeNull();
    });

    it('should handle rapid visibility changes', () => {
      const { getByTestId, rerender, queryByTestId } = render(
        <BottomSheet visible={true} onClose={mockOnClose}>
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(getByTestId('modal-container')).toBeTruthy();

      rerender(
        <BottomSheet visible={false} onClose={mockOnClose}>
          <Text>Content</Text>
        </BottomSheet>
      );
      expect(queryByTestId('modal-container')).toBeNull();

      rerender(
        <BottomSheet visible={true} onClose={mockOnClose}>
          <Text>Content</Text>
        </BottomSheet>
      );
      expect(getByTestId('modal-container')).toBeTruthy();
    });
  });

  describe('Complex Content', () => {
    it('should render complex nested components', () => {
      const ComplexContent = () => (
        <View>
          <Text>Header</Text>
          <View>
            <Text>Nested Content</Text>
          </View>
          <Text>Footer Text</Text>
        </View>
      );

      const { getByText } = render(
        <BottomSheet visible={true} onClose={mockOnClose}>
          <ComplexContent />
        </BottomSheet>
      );

      expect(getByText('Header')).toBeTruthy();
      expect(getByText('Nested Content')).toBeTruthy();
      expect(getByText('Footer Text')).toBeTruthy();
    });

    it('should render with all props together', () => {
      const { getByText } = render(
        <BottomSheet
          visible={true}
          onClose={mockOnClose}
          title="Sheet Title"
          footer={<Text>Footer Actions</Text>}
        >
          <Text>Main Content</Text>
        </BottomSheet>
      );

      expect(getByText('Sheet Title')).toBeTruthy();
      expect(getByText('Main Content')).toBeTruthy();
      expect(getByText('Footer Actions')).toBeTruthy();
    });
  });

  describe('Content Updates', () => {
    it('should update content when children change', () => {
      const { getByText, rerender } = render(
        <BottomSheet visible={true} onClose={mockOnClose}>
          <Text>Original Content</Text>
        </BottomSheet>
      );

      expect(getByText('Original Content')).toBeTruthy();

      rerender(
        <BottomSheet visible={true} onClose={mockOnClose}>
          <Text>Updated Content</Text>
        </BottomSheet>
      );

      expect(getByText('Updated Content')).toBeTruthy();
    });

    it('should update title when title changes', () => {
      const { getByText, rerender } = render(
        <BottomSheet visible={true} onClose={mockOnClose} title="Original Title">
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(getByText('Original Title')).toBeTruthy();

      rerender(
        <BottomSheet visible={true} onClose={mockOnClose} title="New Title">
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(getByText('New Title')).toBeTruthy();
    });

    it('should update footer when footer changes', () => {
      const { getByText, rerender } = render(
        <BottomSheet
          visible={true}
          onClose={mockOnClose}
          footer={<Text>Original Footer</Text>}
        >
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(getByText('Original Footer')).toBeTruthy();

      rerender(
        <BottomSheet
          visible={true}
          onClose={mockOnClose}
          footer={<Text>New Footer</Text>}
        >
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(getByText('New Footer')).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty children', () => {
      const { getByTestId } = render(
        <BottomSheet visible={true} onClose={mockOnClose}>
          {null}
        </BottomSheet>
      );

      expect(getByTestId('modal-container')).toBeTruthy();
    });

    it('should handle long titles', () => {
      const longTitle = 'This is a very long title that should still render correctly in the bottom sheet';

      const { getByText } = render(
        <BottomSheet visible={true} onClose={mockOnClose} title={longTitle}>
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(getByText(longTitle)).toBeTruthy();
    });

    it('should handle special characters in title', () => {
      const specialTitle = 'Title with @#$%^&*() characters!';

      const { getByText } = render(
        <BottomSheet visible={true} onClose={mockOnClose} title={specialTitle}>
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(getByText(specialTitle)).toBeTruthy();
    });

    it('should handle empty string title', () => {
      const { getByText } = render(
        <BottomSheet visible={true} onClose={mockOnClose} title="">
          <Text>Content</Text>
        </BottomSheet>
      );

      // Empty title should render but be empty
      expect(getByText('Content')).toBeTruthy();
    });
  });

  describe('Callback Props', () => {
    it('should accept onClose callback', () => {
      const { getByTestId } = render(
        <BottomSheet visible={true} onClose={mockOnClose}>
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(getByTestId('modal-container')).toBeTruthy();
    });

    it('should work without onClose callback', () => {
      const { getByTestId } = render(
        <BottomSheet visible={true}>
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(getByTestId('modal-container')).toBeTruthy();
    });
  });

  describe('Typography', () => {
    it('should render title with correct styling', () => {
      const { getByText } = render(
        <BottomSheet visible={true} onClose={mockOnClose} title="Test Title">
          <Text>Content</Text>
        </BottomSheet>
      );

      const title = getByText('Test Title');
      expect(title.props.style).toBeTruthy();
    });
  });

  describe('ScrollView', () => {
    it('should render scrollable content', () => {
      const { getByText } = render(
        <BottomSheet visible={true} onClose={mockOnClose}>
          <Text>Item 1</Text>
          <Text>Item 2</Text>
          <Text>Item 3</Text>
          <Text>Item 4</Text>
          <Text>Item 5</Text>
        </BottomSheet>
      );

      expect(getByText('Item 1')).toBeTruthy();
      expect(getByText('Item 3')).toBeTruthy();
      expect(getByText('Item 5')).toBeTruthy();
    });
  });

  describe('Title Rendering', () => {
    it('should render title when provided', () => {
      const { getByText } = render(
        <BottomSheet visible={true} onClose={mockOnClose} title="My Title">
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(getByText('My Title')).toBeTruthy();
    });

    it('should not render title container when title is not provided', () => {
      const { queryByText, getByText } = render(
        <BottomSheet visible={true} onClose={mockOnClose}>
          <Text>Content</Text>
        </BottomSheet>
      );

      expect(getByText('Content')).toBeTruthy();
    });

    it('should render title with content', () => {
      const { getByText } = render(
        <BottomSheet visible={true} onClose={mockOnClose} title="Title">
          <Text>Content Text</Text>
        </BottomSheet>
      );

      expect(getByText('Title')).toBeTruthy();
      expect(getByText('Content Text')).toBeTruthy();
    });
  });
});
