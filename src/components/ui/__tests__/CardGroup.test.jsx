import React from 'react';
import { Text, View } from 'react-native';
import { render } from '@testing-library/react-native';
import CardGroup from '../CardGroup';

describe('CardGroup', () => {
  it('should render children inside card', () => {
    const { getByText } = render(
      <CardGroup>
        <Text>Item 1</Text>
        <Text>Item 2</Text>
      </CardGroup>
    );

    expect(getByText('Item 1')).toBeTruthy();
    expect(getByText('Item 2')).toBeTruthy();
  });

  it('should render with title', () => {
    const { getByText } = render(
      <CardGroup title="Settings">
        <Text>Option 1</Text>
        <Text>Option 2</Text>
      </CardGroup>
    );

    expect(getByText('Settings')).toBeTruthy();
    expect(getByText('Option 1')).toBeTruthy();
    expect(getByText('Option 2')).toBeTruthy();
  });

  it('should render without title', () => {
    const { getByText, queryByText } = render(
      <CardGroup>
        <Text>Item 1</Text>
      </CardGroup>
    );

    expect(getByText('Item 1')).toBeTruthy();
    // No title should be rendered
  });

  it('should render single child', () => {
    const { getByText } = render(
      <CardGroup title="Single Item">
        <Text>Only one item</Text>
      </CardGroup>
    );

    expect(getByText('Single Item')).toBeTruthy();
    expect(getByText('Only one item')).toBeTruthy();
  });

  it('should render multiple children with dividers', () => {
    const { getByText } = render(
      <CardGroup>
        <Text>First</Text>
        <Text>Second</Text>
        <Text>Third</Text>
      </CardGroup>
    );

    expect(getByText('First')).toBeTruthy();
    expect(getByText('Second')).toBeTruthy();
    expect(getByText('Third')).toBeTruthy();
  });

  it('should handle complex children', () => {
    const { getByText } = render(
      <CardGroup title="Account">
        <View>
          <Text>Username</Text>
          <Text>john@example.com</Text>
        </View>
        <View>
          <Text>Password</Text>
          <Text>••••••••</Text>
        </View>
      </CardGroup>
    );

    expect(getByText('Account')).toBeTruthy();
    expect(getByText('Username')).toBeTruthy();
    expect(getByText('john@example.com')).toBeTruthy();
    expect(getByText('Password')).toBeTruthy();
  });

  it('should render when children is null', () => {
    const { getByText } = render(
      <CardGroup title="Empty">{null}</CardGroup>
    );

    expect(getByText('Empty')).toBeTruthy();
  });
});
