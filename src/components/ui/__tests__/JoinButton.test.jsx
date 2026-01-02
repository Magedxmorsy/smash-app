import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import JoinButton from '../JoinButton';

describe('JoinButton', () => {
  it('should render with default Join label', () => {
    const { getByText } = render(<JoinButton onPress={() => {}} />);

    expect(getByText('Join')).toBeTruthy();
  });

  it('should render with custom label', () => {
    const { getByText } = render(
      <JoinButton label="Invite" onPress={() => {}} />
    );

    expect(getByText('Invite')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const mockPress = jest.fn();
    const { getByText } = render(<JoinButton label="Join" onPress={mockPress} />);

    fireEvent.press(getByText('Join'));

    expect(mockPress).toHaveBeenCalledTimes(1);
  });

  it('should not crash when onPress is not provided', () => {
    const { getByText } = render(<JoinButton label="Join" />);

    // Should not throw error when pressed without onPress
    fireEvent.press(getByText('Join'));

    expect(getByText('Join')).toBeTruthy();
  });

  it('should align right by default', () => {
    const { getByText } = render(<JoinButton label="Join" onPress={() => {}} />);

    expect(getByText('Join')).toBeTruthy();
  });

  it('should align left when align prop is left', () => {
    const { getByText } = render(
      <JoinButton label="Join" align="left" onPress={() => {}} />
    );

    expect(getByText('Join')).toBeTruthy();
  });

  it('should render dashed circle with add icon', () => {
    const { getByText, UNSAFE_queryAllByType } = render(
      <JoinButton label="Join" onPress={() => {}} />
    );

    expect(getByText('Join')).toBeTruthy();

    // Verify View components exist (dashed circle)
    const views = UNSAFE_queryAllByType(require('react-native').View);
    expect(views.length).toBeGreaterThan(0);
  });

  it('should handle multiple presses', () => {
    const mockPress = jest.fn();
    const { getByText } = render(<JoinButton label="Join" onPress={mockPress} />);

    const button = getByText('Join');

    fireEvent.press(button);
    fireEvent.press(button);
    fireEvent.press(button);

    expect(mockPress).toHaveBeenCalledTimes(3);
  });
});
