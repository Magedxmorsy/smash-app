import React from 'react';
import { Text, View, Switch } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import ListItem from '../ListItem';

describe('ListItem', () => {
  const MockIcon = () => <View testID="mock-icon" />;

  it('should render with label and value', () => {
    const { getByText } = render(
      <ListItem label="Location" value="Central Park" />
    );

    expect(getByText('Central Park')).toBeTruthy();
  });

  it('should render with icon', () => {
    const { getByText, getByTestId } = render(
      <ListItem icon={<MockIcon />} label="Name" value="Tournament 1" />
    );

    expect(getByTestId('mock-icon')).toBeTruthy();
    expect(getByText('Tournament 1')).toBeTruthy();
  });

  it('should show placeholder when value is not provided', () => {
    const { getByText } = render(
      <ListItem label="Select" placeholder="Choose an option" />
    );

    expect(getByText('Choose an option')).toBeTruthy();
  });

  it('should call onPress when pressed', () => {
    const mockPress = jest.fn();
    const { getByText } = render(
      <ListItem label="Settings" value="Account" onPress={mockPress} />
    );

    fireEvent.press(getByText('Account'));

    expect(mockPress).toHaveBeenCalledTimes(1);
  });

  it('should not be pressable when onPress is not provided', () => {
    const { UNSAFE_queryByType } = render(
      <ListItem label="Info" value="Read only" />
    );

    const touchable = UNSAFE_queryByType(require('react-native').TouchableOpacity);
    expect(touchable).toBeNull();
  });

  it('should render as editable input when editable is true', () => {
    const mockChange = jest.fn();
    const { getByPlaceholderText } = render(
      <ListItem
        label="Name"
        value="John"
        editable={true}
        onChangeText={mockChange}
        placeholder="Enter name"
      />
    );

    const input = getByPlaceholderText('Enter name');
    expect(input).toBeTruthy();

    fireEvent.changeText(input, 'Jane');
    expect(mockChange).toHaveBeenCalledWith('Jane');
  });

  it('should render with subtitle', () => {
    const { getByText } = render(
      <ListItem
        label="Notifications"
        value="Enabled"
        subtitle="Receive push notifications"
      />
    );

    expect(getByText('Enabled')).toBeTruthy();
    expect(getByText('Receive push notifications')).toBeTruthy();
  });

  it('should hide chevron when showChevron is false', () => {
    const { getByText } = render(
      <ListItem label="Info" value="Details" showChevron={false} />
    );

    expect(getByText('Details')).toBeTruthy();
  });

  it('should render with custom right component', () => {
    const { getByText, getByTestId } = render(
      <ListItem
        label="Dark Mode"
        value="Off"
        rightComponent={<Switch testID="switch" value={false} />}
      />
    );

    expect(getByText('Off')).toBeTruthy();
    expect(getByTestId('switch')).toBeTruthy();
  });

  it('should support different keyboard types for editable input', () => {
    const { getByPlaceholderText } = render(
      <ListItem
        label="Phone"
        editable={true}
        placeholder="Enter phone"
        keyboardType="phone-pad"
        onChangeText={() => {}}
      />
    );

    const input = getByPlaceholderText('Enter phone');
    expect(input.props.keyboardType).toBe('phone-pad');
  });

  it('should use chevron right icon when useChevronRight is true', () => {
    const { getByText } = render(
      <ListItem label="Next" value="Continue" useChevronRight={true} />
    );

    expect(getByText('Continue')).toBeTruthy();
  });
});
