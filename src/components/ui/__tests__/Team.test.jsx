import React from 'react';
import { render } from '@testing-library/react-native';
import Team from '../Team';

describe('Team', () => {
  const mockPlayer1 = {
    firstName: 'John',
    lastName: 'Doe',
  };

  const mockPlayer2 = {
    firstName: 'Jane',
    lastName: 'Smith',
  };

  it('should render both players', () => {
    const { getByText } = render(
      <Team player1={mockPlayer1} player2={mockPlayer2} />
    );

    expect(getByText('John')).toBeTruthy();
    expect(getByText('Doe')).toBeTruthy();
    expect(getByText('Jane')).toBeTruthy();
    expect(getByText('Smith')).toBeTruthy();
  });

  it('should render players with avatar sources', () => {
    const player1WithAvatar = {
      ...mockPlayer1,
      avatarUri: { uri: 'https://example.com/john.jpg' },
    };

    const player2WithAvatar = {
      ...mockPlayer2,
      avatarUri: { uri: 'https://example.com/jane.jpg' },
    };

    const { getByText } = render(
      <Team player1={player1WithAvatar} player2={player2WithAvatar} />
    );

    expect(getByText('John')).toBeTruthy();
    expect(getByText('Jane')).toBeTruthy();
  });

  it('should align left by default', () => {
    const { getByText } = render(
      <Team player1={mockPlayer1} player2={mockPlayer2} />
    );

    expect(getByText('John')).toBeTruthy();
    expect(getByText('Jane')).toBeTruthy();
  });

  it('should align right when align prop is right', () => {
    const { getByText } = render(
      <Team player1={mockPlayer1} player2={mockPlayer2} align="right" />
    );

    expect(getByText('John')).toBeTruthy();
    expect(getByText('Jane')).toBeTruthy();
  });

  it('should return null when player1 is missing', () => {
    const { queryByText } = render(<Team player1={null} player2={mockPlayer2} />);

    expect(queryByText('Jane')).toBeNull();
  });

  it('should return null when player2 is missing', () => {
    const { queryByText } = render(<Team player1={mockPlayer1} player2={null} />);

    expect(queryByText('John')).toBeNull();
  });

  it('should return null when both players are missing', () => {
    const { queryByText } = render(<Team player1={null} player2={null} />);

    expect(queryByText('John')).toBeNull();
    expect(queryByText('Jane')).toBeNull();
  });
});
