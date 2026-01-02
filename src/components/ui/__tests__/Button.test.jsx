import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import Button from '../Button';

describe('Button', () => {
  it('should render with title', () => {
    const { getByText } = render(
      <Button title="Click Me" onPress={() => {}} />
    );

    expect(getByText('Click Me')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Click Me" onPress={mockOnPress} />
    );

    fireEvent.press(getByText('Click Me'));

    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('should apply different variants correctly', () => {
    const { rerender, getByText } = render(
      <Button title="Primary" variant="primary" onPress={() => {}} />
    );

    expect(getByText('Primary')).toBeTruthy();

    rerender(<Button title="Secondary" variant="secondary" onPress={() => {}} />);
    expect(getByText('Secondary')).toBeTruthy();
  });

  it('should be disabled when disabled prop is true', () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <Button title="Disabled" onPress={mockOnPress} disabled={true} />
    );

    fireEvent.press(getByText('Disabled'));

    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it('should support different sizes', () => {
    const { rerender, getByText } = render(
      <Button title="Large" size="large" onPress={() => {}} />
    );

    expect(getByText('Large')).toBeTruthy();

    rerender(<Button title="Medium" size="medium" onPress={() => {}} />);
    expect(getByText('Medium')).toBeTruthy();
  });
});
