import React from 'react';
import { View } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import MobileHeader from '../MobileHeader';

describe('MobileHeader', () => {
  it('should render with title', () => {
    const { getByText } = render(<MobileHeader title="Home" />);

    expect(getByText('Home')).toBeTruthy();
  });

  it('should render logo when showLogo is true', () => {
    const { queryByText } = render(<MobileHeader title="Home" showLogo={true} />);

    // Title should not be shown when logo is displayed
    expect(queryByText('Home')).toBeNull();
  });

  it('should not render right icon by default', () => {
    const { queryByRole } = render(<MobileHeader title="Home" />);

    // No button should be rendered
    const buttons = queryByRole('button');
    expect(buttons).toBeNull();
  });

  it('should render right icon when rightIcon is true', () => {
    const mockPress = jest.fn();
    const { UNSAFE_queryAllByType } = render(
      <MobileHeader title="Home" rightIcon={true} onRightPress={mockPress} />
    );

    const touchables = UNSAFE_queryAllByType(require('react-native').TouchableOpacity);
    expect(touchables.length).toBeGreaterThan(0);
  });

  it('should call onRightPress when right icon is pressed', () => {
    const mockPress = jest.fn();
    const { UNSAFE_getAllByType } = render(
      <MobileHeader title="Home" rightIcon={true} onRightPress={mockPress} />
    );

    const touchables = UNSAFE_getAllByType(require('react-native').TouchableOpacity);
    const rightButton = touchables[0];

    fireEvent.press(rightButton);

    expect(mockPress).toHaveBeenCalledTimes(1);
  });

  it('should render with custom RightIconComponent', () => {
    const CustomIcon = () => <View testID="custom-icon" />;
    const { getByTestId } = render(
      <MobileHeader
        title="Home"
        rightIcon={true}
        RightIconComponent={CustomIcon}
        onRightPress={() => {}}
      />
    );

    expect(getByTestId('custom-icon')).toBeTruthy();
  });

  it('should render different titles', () => {
    const { rerender, getByText } = render(<MobileHeader title="Tournaments" />);

    expect(getByText('Tournaments')).toBeTruthy();

    rerender(<MobileHeader title="Matches" />);
    expect(getByText('Matches')).toBeTruthy();
  });
});
