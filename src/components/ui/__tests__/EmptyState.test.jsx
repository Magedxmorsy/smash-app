import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import EmptyState from '../EmptyState';
import Button from '../Button';

describe('EmptyState', () => {
  it('should render headline and body text', () => {
    const { getByText } = render(
      <EmptyState
        headline="No Tournaments Yet"
        body="Create your first tournament to get started"
      />
    );

    expect(getByText('No Tournaments Yet')).toBeTruthy();
    expect(getByText('Create your first tournament to get started')).toBeTruthy();
  });

  it('should render with image', () => {
    const { getByText, UNSAFE_queryByType } = render(
      <EmptyState
        imageSource={require('../../../../assets/empty-state.png')}
        headline="Empty"
        body="No data available"
      />
    );

    expect(getByText('Empty')).toBeTruthy();

    // Check that Image component is rendered
    const image = UNSAFE_queryByType(require('react-native').Image);
    expect(image).toBeTruthy();
  });

  it('should not render image when imageSource is not provided', () => {
    const { getByText, UNSAFE_queryByType } = render(
      <EmptyState headline="Empty" body="No data" />
    );

    expect(getByText('Empty')).toBeTruthy();

    // No image should be rendered
    const image = UNSAFE_queryByType(require('react-native').Image);
    expect(image).toBeNull();
  });

  it('should render with button', () => {
    const { getByText } = render(
      <EmptyState
        headline="No Matches"
        body="Start a tournament to see matches"
        button={<Button title="Create Tournament" onPress={() => {}} />}
      />
    );

    expect(getByText('No Matches')).toBeTruthy();
    expect(getByText('Create Tournament')).toBeTruthy();
  });

  it('should not render button when button prop is not provided', () => {
    const { getByText, queryByText } = render(
      <EmptyState headline="Empty" body="No data" />
    );

    expect(getByText('Empty')).toBeTruthy();

    // Verify no button text is present
    expect(queryByText('Create')).toBeNull();
  });

  it('should render with custom button component', () => {
    const CustomButton = () => <Text>Custom Action</Text>;

    const { getByText } = render(
      <EmptyState
        headline="Empty"
        body="No data"
        button={<CustomButton />}
      />
    );

    expect(getByText('Empty')).toBeTruthy();
    expect(getByText('Custom Action')).toBeTruthy();
  });
});
