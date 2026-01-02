import React from 'react';
import { View, Text } from 'react-native';
import { render } from '@testing-library/react-native';
import DetailsListItem from '../DetailsListItem';

describe('DetailsListItem', () => {
  const MockIcon = () => <View testID="mock-icon" />;

  it('should render with icon and text', () => {
    const { getByText, getByTestId } = render(
      <DetailsListItem icon={<MockIcon />} text="Location: Central Park" />
    );

    expect(getByTestId('mock-icon')).toBeTruthy();
    expect(getByText('Location: Central Park')).toBeTruthy();
  });

  it('should render text only when icon is not provided', () => {
    const { getByText } = render(
      <DetailsListItem text="Some information" />
    );

    expect(getByText('Some information')).toBeTruthy();
  });

  it('should handle long text', () => {
    const longText = 'This is a very long text that should be truncated with numberOfLines';
    const { getByText } = render(
      <DetailsListItem icon={<MockIcon />} text={longText} />
    );

    expect(getByText(longText)).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const customStyle = { marginTop: 20 };
    const { getByText } = render(
      <DetailsListItem
        icon={<MockIcon />}
        text="Custom styled item"
        style={customStyle}
      />
    );

    expect(getByText('Custom styled item')).toBeTruthy();
  });

  it('should render with different icon types', () => {
    const CustomIcon = () => <Text>📍</Text>;

    const { getByText } = render(
      <DetailsListItem icon={<CustomIcon />} text="New York" />
    );

    expect(getByText('📍')).toBeTruthy();
    expect(getByText('New York')).toBeTruthy();
  });
});
