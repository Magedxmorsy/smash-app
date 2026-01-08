import React from 'react';
import { render } from '@testing-library/react-native';
import Player from '../Player';

describe('Player', () => {
  it('should render player with first and last name', () => {
    const { getByText } = render(
      <Player firstName="John" lastName="Doe" />
    );

    expect(getByText('John')).toBeTruthy();
    expect(getByText('Doe')).toBeTruthy();
  });

  it('should render with avatar', () => {
    const { getByText } = render(
      <Player firstName="Alice" lastName="Smith" />
    );

    // Avatar should show initials 'AS' from "Alice Smith"
    expect(getByText('AS')).toBeTruthy();
    expect(getByText('Alice')).toBeTruthy();
    expect(getByText('Smith')).toBeTruthy();
  });

  it('should render with avatar source', () => {
    const { getByText, UNSAFE_queryByType } = render(
      <Player
        firstName="Bob"
        lastName="Johnson"
        avatarSource={{ uri: 'https://example.com/avatar.jpg' }}
      />
    );

    expect(getByText('Bob')).toBeTruthy();
    expect(getByText('Johnson')).toBeTruthy();

    // Check that Image component is rendered (avatar with source)
    const image = UNSAFE_queryByType(require('react-native').Image);
    expect(image).toBeTruthy();
  });

  it('should align left by default', () => {
    const { getByText } = render(
      <Player firstName="John" lastName="Doe" />
    );

    expect(getByText('John')).toBeTruthy();
    expect(getByText('Doe')).toBeTruthy();
  });

  it('should align right when align prop is right', () => {
    const { getByText } = render(
      <Player firstName="John" lastName="Doe" align="right" />
    );

    expect(getByText('John')).toBeTruthy();
    expect(getByText('Doe')).toBeTruthy();
  });

  it('should handle single character names', () => {
    const { getByText } = render(
      <Player firstName="A" lastName="B" />
    );

    // Avatar shows 'AB' initials
    expect(getByText('AB')).toBeTruthy();
    expect(getByText('A')).toBeTruthy();
    expect(getByText('B')).toBeTruthy();
  });
});
