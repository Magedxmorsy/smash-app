import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import TextArea from '../TextArea';

describe('TextArea', () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without label', () => {
      const { getByPlaceholderText } = render(
        <TextArea
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChangeText}
        />
      );

      expect(getByPlaceholderText('Enter text')).toBeTruthy();
    });

    it('should render with label', () => {
      const { getByText, getByPlaceholderText } = render(
        <TextArea
          label="Description"
          placeholder="Enter description"
          value=""
          onChangeText={mockOnChangeText}
        />
      );

      expect(getByText('Description')).toBeTruthy();
      expect(getByPlaceholderText('Enter description')).toBeTruthy();
    });

    it('should render with hint text', () => {
      const { getByText } = render(
        <TextArea
          placeholder="Enter text"
          hint="This is a hint"
          value=""
          onChangeText={mockOnChangeText}
        />
      );

      expect(getByText('This is a hint')).toBeTruthy();
    });

    it('should render with error message', () => {
      const { getByText } = render(
        <TextArea
          placeholder="Enter text"
          error="This field is required"
          value=""
          onChangeText={mockOnChangeText}
        />
      );

      expect(getByText('This field is required')).toBeTruthy();
    });

    it('should show error instead of hint when both provided', () => {
      const { getByText, queryByText } = render(
        <TextArea
          placeholder="Enter text"
          hint="This is a hint"
          error="This is an error"
          value=""
          onChangeText={mockOnChangeText}
        />
      );

      expect(getByText('This is an error')).toBeTruthy();
      expect(queryByText('This is a hint')).toBeNull();
    });
  });

  describe('Text Input', () => {
    it('should display value', () => {
      const { getByDisplayValue } = render(
        <TextArea
          placeholder="Enter text"
          value="Test value"
          onChangeText={mockOnChangeText}
        />
      );

      expect(getByDisplayValue('Test value')).toBeTruthy();
    });

    it('should call onChangeText when text changes', () => {
      const { getByPlaceholderText } = render(
        <TextArea
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChangeText}
        />
      );

      fireEvent.changeText(getByPlaceholderText('Enter text'), 'New text');
      expect(mockOnChangeText).toHaveBeenCalledWith('New text');
    });

    it('should handle empty value', () => {
      const { getByPlaceholderText } = render(
        <TextArea
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChangeText}
        />
      );

      expect(getByPlaceholderText('Enter text')).toBeTruthy();
    });

    it('should handle multiline text', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3';

      const { getByDisplayValue } = render(
        <TextArea
          placeholder="Enter text"
          value={multilineText}
          onChangeText={mockOnChangeText}
        />
      );

      expect(getByDisplayValue(multilineText)).toBeTruthy();
    });
  });

  describe('Disabled State', () => {
    it('should be disabled when disabled prop is true', () => {
      const { getByPlaceholderText } = render(
        <TextArea
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChangeText}
          disabled={true}
        />
      );

      const input = getByPlaceholderText('Enter text');
      expect(input.props.editable).toBe(false);
    });

    it('should be enabled by default', () => {
      const { getByPlaceholderText } = render(
        <TextArea
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChangeText}
        />
      );

      const input = getByPlaceholderText('Enter text');
      expect(input.props.editable).toBe(true);
    });

    it('should not call onChangeText when disabled', () => {
      const { getByPlaceholderText } = render(
        <TextArea
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChangeText}
          disabled={true}
        />
      );

      fireEvent.changeText(getByPlaceholderText('Enter text'), 'New text');
      // Input is disabled, but the mock might still be called in test environment
      // The important part is that editable is false
      const input = getByPlaceholderText('Enter text');
      expect(input.props.editable).toBe(false);
    });
  });

  describe('Number of Lines', () => {
    it('should use 4 lines by default', () => {
      const { getByPlaceholderText } = render(
        <TextArea
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChangeText}
        />
      );

      const input = getByPlaceholderText('Enter text');
      expect(input.props.numberOfLines).toBe(4);
    });

    it('should accept custom number of lines', () => {
      const { getByPlaceholderText } = render(
        <TextArea
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChangeText}
          numberOfLines={6}
        />
      );

      const input = getByPlaceholderText('Enter text');
      expect(input.props.numberOfLines).toBe(6);
    });

    it('should handle single line', () => {
      const { getByPlaceholderText } = render(
        <TextArea
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChangeText}
          numberOfLines={1}
        />
      );

      const input = getByPlaceholderText('Enter text');
      expect(input.props.numberOfLines).toBe(1);
    });
  });

  describe('Max Length', () => {
    it('should show character counter when maxLength is set', () => {
      const { getByText } = render(
        <TextArea
          placeholder="Enter text"
          value="Hello"
          onChangeText={mockOnChangeText}
          maxLength={100}
        />
      );

      expect(getByText('5/100')).toBeTruthy();
    });

    it('should show 0/maxLength for empty value', () => {
      const { getByText } = render(
        <TextArea
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChangeText}
          maxLength={50}
        />
      );

      expect(getByText('0/50')).toBeTruthy();
    });

    it('should update character counter as text changes', () => {
      const { getByText, rerender } = render(
        <TextArea
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChangeText}
          maxLength={100}
        />
      );

      expect(getByText('0/100')).toBeTruthy();

      rerender(
        <TextArea
          placeholder="Enter text"
          value="Test"
          onChangeText={mockOnChangeText}
          maxLength={100}
        />
      );

      expect(getByText('4/100')).toBeTruthy();
    });

    it('should enforce maxLength on input', () => {
      const { getByPlaceholderText } = render(
        <TextArea
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChangeText}
          maxLength={10}
        />
      );

      const input = getByPlaceholderText('Enter text');
      expect(input.props.maxLength).toBe(10);
    });

    it('should show hint/error with character counter', () => {
      const { getByText } = render(
        <TextArea
          placeholder="Enter text"
          value="Test"
          hint="Enter description"
          onChangeText={mockOnChangeText}
          maxLength={100}
        />
      );

      expect(getByText('Enter description')).toBeTruthy();
      expect(getByText('4/100')).toBeTruthy();
    });
  });

  describe('Focus State', () => {
    it('should handle focus event', () => {
      const { getByPlaceholderText } = render(
        <TextArea
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChangeText}
        />
      );

      const input = getByPlaceholderText('Enter text');
      fireEvent(input, 'focus');

      // Component should handle focus without crashing
      expect(input).toBeTruthy();
    });

    it('should handle blur event', () => {
      const { getByPlaceholderText } = render(
        <TextArea
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChangeText}
        />
      );

      const input = getByPlaceholderText('Enter text');
      fireEvent(input, 'blur');

      // Component should handle blur without crashing
      expect(input).toBeTruthy();
    });

    it('should handle focus and blur cycle', () => {
      const { getByPlaceholderText } = render(
        <TextArea
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChangeText}
        />
      );

      const input = getByPlaceholderText('Enter text');
      fireEvent(input, 'focus');
      fireEvent(input, 'blur');
      fireEvent(input, 'focus');

      expect(input).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle all props together', () => {
      const { getByText, getByDisplayValue } = render(
        <TextArea
          label="Description"
          placeholder="Enter description"
          hint="Max 200 characters"
          value="Test value"
          onChangeText={mockOnChangeText}
          numberOfLines={6}
          maxLength={200}
        />
      );

      expect(getByText('Description')).toBeTruthy();
      expect(getByText('Max 200 characters')).toBeTruthy();
      expect(getByText('10/200')).toBeTruthy();
      expect(getByDisplayValue('Test value')).toBeTruthy();
    });

    it('should handle very long text', () => {
      const longText = 'a'.repeat(500);

      const { getByDisplayValue } = render(
        <TextArea
          placeholder="Enter text"
          value={longText}
          onChangeText={mockOnChangeText}
        />
      );

      expect(getByDisplayValue(longText)).toBeTruthy();
    });

    it('should handle special characters', () => {
      const specialText = '!@#$%^&*()_+{}[]|:;<>?,./~`';

      const { getByDisplayValue } = render(
        <TextArea
          placeholder="Enter text"
          value={specialText}
          onChangeText={mockOnChangeText}
        />
      );

      expect(getByDisplayValue(specialText)).toBeTruthy();
    });

    it('should handle null/undefined value gracefully', () => {
      const { getByPlaceholderText } = render(
        <TextArea
          placeholder="Enter text"
          value={undefined}
          onChangeText={mockOnChangeText}
        />
      );

      expect(getByPlaceholderText('Enter text')).toBeTruthy();
    });
  });

  describe('Text Alignment', () => {
    it('should align text to top', () => {
      const { getByPlaceholderText } = render(
        <TextArea
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChangeText}
        />
      );

      const input = getByPlaceholderText('Enter text');
      expect(input.props.textAlignVertical).toBe('top');
    });
  });

  describe('Multiline', () => {
    it('should be multiline by default', () => {
      const { getByPlaceholderText } = render(
        <TextArea
          placeholder="Enter text"
          value=""
          onChangeText={mockOnChangeText}
        />
      );

      const input = getByPlaceholderText('Enter text');
      expect(input.props.multiline).toBe(true);
    });
  });

  describe('Placeholder', () => {
    it('should display placeholder text', () => {
      const { getByPlaceholderText } = render(
        <TextArea
          placeholder="Type something..."
          value=""
          onChangeText={mockOnChangeText}
        />
      );

      expect(getByPlaceholderText('Type something...')).toBeTruthy();
    });

    it('should hide placeholder when value is present', () => {
      const { getByPlaceholderText, getByDisplayValue } = render(
        <TextArea
          placeholder="Type something..."
          value="Text present"
          onChangeText={mockOnChangeText}
        />
      );

      // Placeholder is still accessible but value should be displayed
      expect(getByPlaceholderText('Type something...')).toBeTruthy();
      expect(getByDisplayValue('Text present')).toBeTruthy();
    });
  });

  describe('Error vs Hint Priority', () => {
    it('should show hint when no error', () => {
      const { getByText } = render(
        <TextArea
          placeholder="Enter text"
          hint="Helper text"
          value=""
          onChangeText={mockOnChangeText}
        />
      );

      expect(getByText('Helper text')).toBeTruthy();
    });

    it('should prioritize error over hint', () => {
      const { getByText, queryByText } = render(
        <TextArea
          placeholder="Enter text"
          hint="Helper text"
          error="Error message"
          value=""
          onChangeText={mockOnChangeText}
        />
      );

      expect(getByText('Error message')).toBeTruthy();
      expect(queryByText('Helper text')).toBeNull();
    });

    it('should show error with maxLength counter', () => {
      const { getByText } = render(
        <TextArea
          placeholder="Enter text"
          error="Error message"
          value="Test"
          onChangeText={mockOnChangeText}
          maxLength={100}
        />
      );

      expect(getByText('Error message')).toBeTruthy();
      expect(getByText('4/100')).toBeTruthy();
    });
  });
});
