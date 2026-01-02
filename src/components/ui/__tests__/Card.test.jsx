import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import Card from '../Card';

describe('Card', () => {
  it('should render children correctly', () => {
    const { getByText } = render(
      <Card>
        <Text>Card Content</Text>
      </Card>
    );

    expect(getByText('Card Content')).toBeTruthy();
  });

  it('should render with multiple children', () => {
    const { getByText } = render(
      <Card>
        <Text>Title</Text>
        <Text>Description</Text>
      </Card>
    );

    expect(getByText('Title')).toBeTruthy();
    expect(getByText('Description')).toBeTruthy();
  });

  it('should apply custom styles', () => {
    const customStyle = { marginTop: 20, padding: 10 };
    const { getByTestId } = render(
      <Card style={customStyle}>
        <Text testID="content">Content</Text>
      </Card>
    );

    expect(getByTestId('content')).toBeTruthy();
  });

  it('should render when children is null', () => {
    const { root } = render(<Card>{null}</Card>);

    expect(root).toBeTruthy();
  });
});
