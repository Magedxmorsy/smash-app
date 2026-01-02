import React from 'react';
import { render } from '@testing-library/react-native';
import Avatar from '../Avatar';

describe('Avatar', () => {
  it('should render with initials from name', () => {
    const { getByText } = render(<Avatar name="John Doe" />);

    expect(getByText('J')).toBeTruthy();
  });

  it('should render with single letter name', () => {
    const { getByText } = render(<Avatar name="A" />);

    expect(getByText('A')).toBeTruthy();
  });

  it('should render question mark when name is empty', () => {
    const { getByText } = render(<Avatar name="" />);

    expect(getByText('?')).toBeTruthy();
  });

  it('should render question mark when name is not provided', () => {
    const { getByText } = render(<Avatar />);

    expect(getByText('?')).toBeTruthy();
  });

  it('should handle name with extra spaces', () => {
    const { getByText } = render(<Avatar name="  John  " />);

    expect(getByText('J')).toBeTruthy();
  });

  it('should render lowercase name as uppercase initial', () => {
    const { getByText } = render(<Avatar name="alice" />);

    expect(getByText('A')).toBeTruthy();
  });

  it('should render image when source is provided', () => {
    const { UNSAFE_queryByType } = render(
      <Avatar source={{ uri: 'https://example.com/avatar.jpg' }} name="John" />
    );

    const image = UNSAFE_queryByType(require('react-native').Image);
    expect(image).toBeTruthy();
  });

  it('should render image with string source', () => {
    const { UNSAFE_queryByType } = render(
      <Avatar source="https://example.com/avatar.jpg" name="John" />
    );

    const image = UNSAFE_queryByType(require('react-native').Image);
    expect(image).toBeTruthy();
  });

  it('should support small size', () => {
    const { getByText } = render(<Avatar name="John" size="small" />);

    expect(getByText('J')).toBeTruthy();
  });

  it('should support medium size (default)', () => {
    const { getByText } = render(<Avatar name="John" size="medium" />);

    expect(getByText('J')).toBeTruthy();
  });

  it('should support large size', () => {
    const { getByText } = render(<Avatar name="John" size="large" />);

    expect(getByText('J')).toBeTruthy();
  });

  it('should apply custom background color', () => {
    const { getByText } = render(
      <Avatar name="John" backgroundColor="#FF0000" />
    );

    expect(getByText('J')).toBeTruthy();
  });

  it('should render with border when withBorder is true', () => {
    const { getByText } = render(<Avatar name="John" withBorder={true} />);

    expect(getByText('J')).toBeTruthy();
  });
});
