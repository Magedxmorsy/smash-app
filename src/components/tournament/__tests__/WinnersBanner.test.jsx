import React from 'react';
import { render } from '@testing-library/react-native';
import WinnersBanner from '../WinnersBanner';

describe('WinnersBanner', () => {
  const mockTournament = {
    id: 'tournament-1',
    name: 'Test Championship',
    status: 'FINISHED',
    matches: [
      {
        id: 'match-1',
        round: 'Semifinals',
        team1: {
          player1: { firstName: 'Alice', lastName: 'Smith', userId: 'user1' },
          player2: { firstName: 'Bob', lastName: 'Johnson', userId: 'user2' },
        },
        team2: {
          player1: { firstName: 'Charlie', lastName: 'Brown', userId: 'user3' },
          player2: { firstName: 'Diana', lastName: 'Davis', userId: 'user4' },
        },
        winningTeam: 'left',
      },
      {
        id: 'match-finals',
        round: 'Finals',
        team1: {
          player1: { firstName: 'Leo', lastName: 'Miguele', avatarSource: null, userId: 'user1' },
          player2: { firstName: 'John', lastName: 'Smith', avatarSource: null, userId: 'user2' },
        },
        team2: {
          player1: { firstName: 'Abdullah', lastName: 'Gaber', avatarSource: null, userId: 'user3' },
          player2: { firstName: 'Sarah', lastName: 'Johnson', avatarSource: null, userId: 'user4' },
        },
        winningTeam: 'left',
        score: { team1: 21, team2: 19 },
      },
    ],
  };

  describe('Rendering', () => {
    it('should render winners when tournament is FINISHED', () => {
      const { getByText } = render(<WinnersBanner tournament={mockTournament} />);

      // Should display winning team (left team - Leo & John)
      expect(getByText('Leo')).toBeTruthy();
      expect(getByText('Miguele')).toBeTruthy();
      expect(getByText('John')).toBeTruthy();
      expect(getByText('Smith')).toBeTruthy();
    });

    it('should not render when tournament is null', () => {
      const { queryByText } = render(<WinnersBanner tournament={null} />);

      expect(queryByText('Leo')).toBeNull();
    });

    it('should not render when tournament is undefined', () => {
      const { queryByText } = render(<WinnersBanner tournament={undefined} />);

      expect(queryByText('Leo')).toBeNull();
    });

    it('should not render when status is not FINISHED', () => {
      const tournamentInProgress = {
        ...mockTournament,
        status: 'GROUP STAGE',
      };

      const { queryByText } = render(<WinnersBanner tournament={tournamentInProgress} />);

      expect(queryByText('Leo')).toBeNull();
      expect(queryByText('John')).toBeNull();
    });

    it('should not render when status is REGISTRATION', () => {
      const tournamentRegistration = {
        ...mockTournament,
        status: 'REGISTRATION',
      };

      const { queryByText } = render(<WinnersBanner tournament={tournamentRegistration} />);

      expect(queryByText('Leo')).toBeNull();
    });
  });

  describe('Finals Match Detection', () => {
    it('should find finals match case-insensitively (Finals)', () => {
      const { getByText } = render(<WinnersBanner tournament={mockTournament} />);

      expect(getByText('Leo')).toBeTruthy();
      expect(getByText('John')).toBeTruthy();
    });

    it('should find finals match case-insensitively (finals)', () => {
      const tournamentLowerCase = {
        ...mockTournament,
        matches: [
          {
            id: 'match-finals',
            round: 'finals', // lowercase
            team1: mockTournament.matches[1].team1,
            team2: mockTournament.matches[1].team2,
            winningTeam: 'left',
          },
        ],
      };

      const { getByText } = render(<WinnersBanner tournament={tournamentLowerCase} />);

      expect(getByText('Leo')).toBeTruthy();
    });

    it('should find finals match case-insensitively (FINALS)', () => {
      const tournamentUpperCase = {
        ...mockTournament,
        matches: [
          {
            id: 'match-finals',
            round: 'FINALS', // uppercase
            team1: mockTournament.matches[1].team1,
            team2: mockTournament.matches[1].team2,
            winningTeam: 'left',
          },
        ],
      };

      const { getByText } = render(<WinnersBanner tournament={tournamentUpperCase} />);

      expect(getByText('Leo')).toBeTruthy();
    });

    it('should not render when no finals match exists', () => {
      const tournamentNoFinals = {
        ...mockTournament,
        matches: [
          {
            id: 'match-1',
            round: 'Semifinals',
            team1: mockTournament.matches[0].team1,
            team2: mockTournament.matches[0].team2,
            winningTeam: 'left',
          },
        ],
      };

      const { queryByText } = render(<WinnersBanner tournament={tournamentNoFinals} />);

      expect(queryByText('Leo')).toBeNull();
    });

    it('should not render when matches array is empty', () => {
      const tournamentNoMatches = {
        ...mockTournament,
        matches: [],
      };

      const { queryByText } = render(<WinnersBanner tournament={tournamentNoMatches} />);

      expect(queryByText('Leo')).toBeNull();
    });

    it('should not render when matches is null', () => {
      const tournamentNullMatches = {
        ...mockTournament,
        matches: null,
      };

      const { queryByText } = render(<WinnersBanner tournament={tournamentNullMatches} />);

      expect(queryByText('Leo')).toBeNull();
    });

    it('should not render when matches is not an array', () => {
      const tournamentInvalidMatches = {
        ...mockTournament,
        matches: 'invalid',
      };

      const { queryByText } = render(<WinnersBanner tournament={tournamentInvalidMatches} />);

      expect(queryByText('Leo')).toBeNull();
    });
  });

  describe('Winner Team Selection', () => {
    it('should display left team when winningTeam is "left"', () => {
      const { getByText, queryByText } = render(<WinnersBanner tournament={mockTournament} />);

      // Left team (winners)
      expect(getByText('Leo')).toBeTruthy();
      expect(getByText('John')).toBeTruthy();

      // Right team (losers) should not be displayed
      expect(queryByText('Abdullah')).toBeNull();
      expect(queryByText('Sarah')).toBeNull();
    });

    it('should display right team when winningTeam is "right"', () => {
      const tournamentRightWins = {
        ...mockTournament,
        matches: [
          {
            ...mockTournament.matches[1],
            winningTeam: 'right', // Right team wins
          },
        ],
      };

      const { getByText, queryByText } = render(<WinnersBanner tournament={tournamentRightWins} />);

      // Right team (winners)
      expect(getByText('Abdullah')).toBeTruthy();
      expect(getByText('Sarah')).toBeTruthy();

      // Left team (losers) should not be displayed
      expect(queryByText('Leo')).toBeNull();
      expect(queryByText('John')).toBeNull();
    });

    it('should not render when winningTeam is null', () => {
      const tournamentNoWinner = {
        ...mockTournament,
        matches: [
          {
            ...mockTournament.matches[1],
            winningTeam: null,
          },
        ],
      };

      const { queryByText } = render(<WinnersBanner tournament={tournamentNoWinner} />);

      expect(queryByText('Leo')).toBeNull();
      expect(queryByText('Abdullah')).toBeNull();
    });

    it('should not render when winningTeam is undefined', () => {
      const tournamentNoWinner = {
        ...mockTournament,
        matches: [
          {
            id: 'match-finals',
            round: 'Finals',
            team1: mockTournament.matches[1].team1,
            team2: mockTournament.matches[1].team2,
            // winningTeam is undefined
          },
        ],
      };

      const { queryByText } = render(<WinnersBanner tournament={tournamentNoWinner} />);

      expect(queryByText('Leo')).toBeNull();
    });
  });

  describe('Player Data Validation', () => {
    it('should not render when winning team has null player1', () => {
      const tournamentInvalidPlayer = {
        ...mockTournament,
        matches: [
          {
            id: 'match-finals',
            round: 'Finals',
            team1: {
              player1: null, // Invalid
              player2: { firstName: 'John', lastName: 'Smith', userId: 'user2' },
            },
            team2: mockTournament.matches[1].team2,
            winningTeam: 'left',
          },
        ],
      };

      const { queryByText } = render(<WinnersBanner tournament={tournamentInvalidPlayer} />);

      expect(queryByText('John')).toBeNull();
    });

    it('should not render when winning team has null player2', () => {
      const tournamentInvalidPlayer = {
        ...mockTournament,
        matches: [
          {
            id: 'match-finals',
            round: 'Finals',
            team1: {
              player1: { firstName: 'Leo', lastName: 'Miguele', userId: 'user1' },
              player2: null, // Invalid
            },
            team2: mockTournament.matches[1].team2,
            winningTeam: 'left',
          },
        ],
      };

      const { queryByText } = render(<WinnersBanner tournament={tournamentInvalidPlayer} />);

      expect(queryByText('Leo')).toBeNull();
    });

    it('should not render when winning team is null', () => {
      const tournamentNullTeam = {
        ...mockTournament,
        matches: [
          {
            id: 'match-finals',
            round: 'Finals',
            team1: null, // Invalid
            team2: mockTournament.matches[1].team2,
            winningTeam: 'left',
          },
        ],
      };

      const { queryByText } = render(<WinnersBanner tournament={tournamentNullTeam} />);

      expect(queryByText('Leo')).toBeNull();
    });

    it('should render with avatar sources', () => {
      const tournamentWithAvatars = {
        ...mockTournament,
        matches: [
          {
            id: 'match-finals',
            round: 'Finals',
            team1: {
              player1: {
                firstName: 'Leo',
                lastName: 'Miguele',
                avatarSource: { uri: 'https://example.com/leo.jpg' },
                userId: 'user1',
              },
              player2: {
                firstName: 'John',
                lastName: 'Smith',
                avatarSource: { uri: 'https://example.com/john.jpg' },
                userId: 'user2',
              },
            },
            team2: mockTournament.matches[1].team2,
            winningTeam: 'left',
          },
        ],
      };

      const { getByText } = render(<WinnersBanner tournament={tournamentWithAvatars} />);

      expect(getByText('Leo')).toBeTruthy();
      expect(getByText('John')).toBeTruthy();
    });
  });

  describe('Trophy Image', () => {
    it('should render trophy image in center', () => {
      const { UNSAFE_queryByType } = render(<WinnersBanner tournament={mockTournament} />);

      // Check that Image component is rendered (trophy)
      const images = UNSAFE_queryByType(require('react-native').Image);
      expect(images).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle tournament with multiple finals matches (uses first)', () => {
      const tournamentMultipleFinals = {
        ...mockTournament,
        matches: [
          {
            id: 'match-finals-1',
            round: 'Finals',
            team1: mockTournament.matches[1].team1,
            team2: mockTournament.matches[1].team2,
            winningTeam: 'left',
          },
          {
            id: 'match-finals-2',
            round: 'Finals', // Second finals match (shouldn't happen)
            team1: mockTournament.matches[1].team2,
            team2: mockTournament.matches[1].team1,
            winningTeam: 'right',
          },
        ],
      };

      const { getByText } = render(<WinnersBanner tournament={tournamentMultipleFinals} />);

      // Should use first finals match (left team wins)
      expect(getByText('Leo')).toBeTruthy();
      expect(getByText('John')).toBeTruthy();
    });

    it('should handle empty player names gracefully', () => {
      const tournamentEmptyNames = {
        ...mockTournament,
        matches: [
          {
            id: 'match-finals',
            round: 'Finals',
            team1: {
              player1: { firstName: '', lastName: '', userId: 'user1' },
              player2: { firstName: '', lastName: '', userId: 'user2' },
            },
            team2: mockTournament.matches[1].team2,
            winningTeam: 'left',
          },
        ],
      };

      // Should still render (Player component handles empty names)
      const { UNSAFE_root } = render(<WinnersBanner tournament={tournamentEmptyNames} />);
      expect(UNSAFE_root).toBeTruthy();
    });

    it('should handle very long player names', () => {
      const tournamentLongNames = {
        ...mockTournament,
        matches: [
          {
            id: 'match-finals',
            round: 'Finals',
            team1: {
              player1: {
                firstName: 'VeryLongFirstNameThatExceedsNormalLength',
                lastName: 'VeryLongLastNameThatExceedsNormalLength',
                userId: 'user1',
              },
              player2: {
                firstName: 'AnotherVeryLongFirstName',
                lastName: 'AnotherVeryLongLastName',
                userId: 'user2',
              },
            },
            team2: mockTournament.matches[1].team2,
            winningTeam: 'left',
          },
        ],
      };

      const { getByText } = render(<WinnersBanner tournament={tournamentLongNames} />);

      expect(getByText('VeryLongFirstNameThatExceedsNormalLength')).toBeTruthy();
      expect(getByText('AnotherVeryLongFirstName')).toBeTruthy();
    });
  });
});
