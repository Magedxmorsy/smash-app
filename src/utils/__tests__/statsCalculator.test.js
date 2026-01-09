/**
 * Tests for statsCalculator utility functions
 */

import { calculatePlayerStats, calculateWinRate } from '../statsCalculator';

describe('calculatePlayerStats', () => {
  const mockUserId = 'user123';

  it('should return zero stats when tournaments is null', () => {
    const result = calculatePlayerStats(null, mockUserId);

    expect(result).toEqual({
      tournamentsPlayed: 0,
      trophiesWon: 0,
      matchesWon: 0,
      matchesPlayed: 0,
    });
  });

  it('should return zero stats when userId is null', () => {
    const result = calculatePlayerStats([], null);

    expect(result).toEqual({
      tournamentsPlayed: 0,
      trophiesWon: 0,
      matchesWon: 0,
      matchesPlayed: 0,
    });
  });

  it('should return zero stats when user has not participated in any tournament', () => {
    const tournaments = [
      {
        id: 'tournament1',
        teams: [
          {
            player1: { userId: 'otherUser1' },
            player2: { userId: 'otherUser2' },
          },
        ],
      },
    ];

    const result = calculatePlayerStats(tournaments, mockUserId);

    expect(result).toEqual({
      tournamentsPlayed: 0,
      trophiesWon: 0,
      matchesWon: 0,
      matchesPlayed: 0,
    });
  });

  it('should count tournament as played when user is in a team as player1', () => {
    const tournaments = [
      {
        id: 'tournament1',
        teams: [
          {
            player1: { userId: mockUserId },
            player2: { userId: 'teammate1' },
          },
        ],
      },
    ];

    const result = calculatePlayerStats(tournaments, mockUserId);

    expect(result.tournamentsPlayed).toBe(1);
  });

  it('should count tournament as played when user is in a team as player2', () => {
    const tournaments = [
      {
        id: 'tournament1',
        teams: [
          {
            player1: { userId: 'teammate1' },
            player2: { userId: mockUserId },
          },
        ],
      },
    ];

    const result = calculatePlayerStats(tournaments, mockUserId);

    expect(result.tournamentsPlayed).toBe(1);
  });

  it('should count multiple tournaments played', () => {
    const tournaments = [
      {
        id: 'tournament1',
        teams: [
          {
            player1: { userId: mockUserId },
            player2: { userId: 'teammate1' },
          },
        ],
      },
      {
        id: 'tournament2',
        teams: [
          {
            player1: { userId: 'teammate2' },
            player2: { userId: mockUserId },
          },
        ],
      },
    ];

    const result = calculatePlayerStats(tournaments, mockUserId);

    expect(result.tournamentsPlayed).toBe(2);
  });

  it('should count trophy when user wins a completed tournament', () => {
    const tournaments = [
      {
        id: 'tournament1',
        status: 'COMPLETED',
        winnerId: mockUserId,
        teams: [
          {
            player1: { userId: mockUserId },
            player2: { userId: 'teammate1' },
          },
          {
            player1: { userId: 'opponent1' },
            player2: { userId: 'opponent2' },
          },
        ],
      },
    ];

    const result = calculatePlayerStats(tournaments, mockUserId);

    expect(result.trophiesWon).toBe(1);
    expect(result.tournamentsPlayed).toBe(1);
  });

  it('should not count trophy when tournament is not completed', () => {
    const tournaments = [
      {
        id: 'tournament1',
        status: 'GROUP_STAGE',
        winnerId: mockUserId,
        teams: [
          {
            player1: { userId: mockUserId },
            player2: { userId: 'teammate1' },
          },
        ],
      },
    ];

    const result = calculatePlayerStats(tournaments, mockUserId);

    expect(result.trophiesWon).toBe(0);
  });

  it('should not count trophy when user did not win', () => {
    const tournaments = [
      {
        id: 'tournament1',
        status: 'COMPLETED',
        winnerId: 'otherUser',
        teams: [
          {
            player1: { userId: mockUserId },
            player2: { userId: 'teammate1' },
          },
          {
            player1: { userId: 'otherUser' },
            player2: { userId: 'teammate2' },
          },
        ],
      },
    ];

    const result = calculatePlayerStats(tournaments, mockUserId);

    expect(result.trophiesWon).toBe(0);
    expect(result.tournamentsPlayed).toBe(1);
  });

  it('should count matches played when user is in left team', () => {
    const tournaments = [
      {
        id: 'tournament1',
        teams: [
          {
            player1: { userId: mockUserId },
            player2: { userId: 'teammate1' },
          },
        ],
        matches: [
          {
            leftTeam: {
              player1: { userId: mockUserId },
              player2: { userId: 'teammate1' },
            },
            rightTeam: {
              player1: { userId: 'opponent1' },
              player2: { userId: 'opponent2' },
            },
          },
        ],
      },
    ];

    const result = calculatePlayerStats(tournaments, mockUserId);

    expect(result.matchesPlayed).toBe(1);
  });

  it('should count matches played when user is in right team', () => {
    const tournaments = [
      {
        id: 'tournament1',
        teams: [
          {
            player1: { userId: mockUserId },
            player2: { userId: 'teammate1' },
          },
        ],
        matches: [
          {
            leftTeam: {
              player1: { userId: 'opponent1' },
              player2: { userId: 'opponent2' },
            },
            rightTeam: {
              player1: { userId: mockUserId },
              player2: { userId: 'teammate1' },
            },
          },
        ],
      },
    ];

    const result = calculatePlayerStats(tournaments, mockUserId);

    expect(result.matchesPlayed).toBe(1);
  });

  it('should count match won when user is in left team and left wins', () => {
    const tournaments = [
      {
        id: 'tournament1',
        teams: [
          {
            player1: { userId: mockUserId },
            player2: { userId: 'teammate1' },
          },
        ],
        matches: [
          {
            leftTeam: {
              player1: { userId: mockUserId },
              player2: { userId: 'teammate1' },
            },
            rightTeam: {
              player1: { userId: 'opponent1' },
              player2: { userId: 'opponent2' },
            },
            winner: 'left',
          },
        ],
      },
    ];

    const result = calculatePlayerStats(tournaments, mockUserId);

    expect(result.matchesWon).toBe(1);
    expect(result.matchesPlayed).toBe(1);
  });

  it('should count match won when user is in right team and right wins', () => {
    const tournaments = [
      {
        id: 'tournament1',
        teams: [
          {
            player1: { userId: mockUserId },
            player2: { userId: 'teammate1' },
          },
        ],
        matches: [
          {
            leftTeam: {
              player1: { userId: 'opponent1' },
              player2: { userId: 'opponent2' },
            },
            rightTeam: {
              player1: { userId: mockUserId },
              player2: { userId: 'teammate1' },
            },
            winner: 'right',
          },
        ],
      },
    ];

    const result = calculatePlayerStats(tournaments, mockUserId);

    expect(result.matchesWon).toBe(1);
    expect(result.matchesPlayed).toBe(1);
  });

  it('should not count match won when user loses', () => {
    const tournaments = [
      {
        id: 'tournament1',
        teams: [
          {
            player1: { userId: mockUserId },
            player2: { userId: 'teammate1' },
          },
        ],
        matches: [
          {
            leftTeam: {
              player1: { userId: mockUserId },
              player2: { userId: 'teammate1' },
            },
            rightTeam: {
              player1: { userId: 'opponent1' },
              player2: { userId: 'opponent2' },
            },
            winner: 'right',
          },
        ],
      },
    ];

    const result = calculatePlayerStats(tournaments, mockUserId);

    expect(result.matchesWon).toBe(0);
    expect(result.matchesPlayed).toBe(1);
  });

  it('should count multiple matches correctly', () => {
    const tournaments = [
      {
        id: 'tournament1',
        teams: [
          {
            player1: { userId: mockUserId },
            player2: { userId: 'teammate1' },
          },
        ],
        matches: [
          {
            leftTeam: {
              player1: { userId: mockUserId },
              player2: { userId: 'teammate1' },
            },
            rightTeam: {
              player1: { userId: 'opponent1' },
              player2: { userId: 'opponent2' },
            },
            winner: 'left',
          },
          {
            leftTeam: {
              player1: { userId: mockUserId },
              player2: { userId: 'teammate1' },
            },
            rightTeam: {
              player1: { userId: 'opponent3' },
              player2: { userId: 'opponent4' },
            },
            winner: 'right',
          },
          {
            leftTeam: {
              player1: { userId: mockUserId },
              player2: { userId: 'teammate1' },
            },
            rightTeam: {
              player1: { userId: 'opponent5' },
              player2: { userId: 'opponent6' },
            },
            winner: 'left',
          },
        ],
      },
    ];

    const result = calculatePlayerStats(tournaments, mockUserId);

    expect(result.matchesPlayed).toBe(3);
    expect(result.matchesWon).toBe(2);
  });

  it('should handle complete realistic scenario', () => {
    const tournaments = [
      // Tournament 1: User participated, won tournament, 3 matches (2 wins)
      {
        id: 'tournament1',
        status: 'COMPLETED',
        winnerId: mockUserId,
        teams: [
          {
            player1: { userId: mockUserId },
            player2: { userId: 'teammate1' },
          },
          {
            player1: { userId: 'opponent1' },
            player2: { userId: 'opponent2' },
          },
        ],
        matches: [
          {
            leftTeam: {
              player1: { userId: mockUserId },
              player2: { userId: 'teammate1' },
            },
            rightTeam: {
              player1: { userId: 'opponent1' },
              player2: { userId: 'opponent2' },
            },
            winner: 'left',
          },
          {
            rightTeam: {
              player1: { userId: mockUserId },
              player2: { userId: 'teammate1' },
            },
            leftTeam: {
              player1: { userId: 'opponent1' },
              player2: { userId: 'opponent2' },
            },
            winner: 'left',
          },
          {
            leftTeam: {
              player1: { userId: mockUserId },
              player2: { userId: 'teammate1' },
            },
            rightTeam: {
              player1: { userId: 'opponent1' },
              player2: { userId: 'opponent2' },
            },
            winner: 'left',
          },
        ],
      },
      // Tournament 2: User participated, lost, 2 matches (1 win)
      {
        id: 'tournament2',
        status: 'COMPLETED',
        winnerId: 'opponent3',
        teams: [
          {
            player1: { userId: mockUserId },
            player2: { userId: 'teammate2' },
          },
          {
            player1: { userId: 'opponent3' },
            player2: { userId: 'opponent4' },
          },
        ],
        matches: [
          {
            leftTeam: {
              player1: { userId: mockUserId },
              player2: { userId: 'teammate2' },
            },
            rightTeam: {
              player1: { userId: 'opponent3' },
              player2: { userId: 'opponent4' },
            },
            winner: 'left',
          },
          {
            leftTeam: {
              player1: { userId: mockUserId },
              player2: { userId: 'teammate2' },
            },
            rightTeam: {
              player1: { userId: 'opponent3' },
              player2: { userId: 'opponent4' },
            },
            winner: 'right',
          },
        ],
      },
      // Tournament 3: User did not participate
      {
        id: 'tournament3',
        status: 'COMPLETED',
        winnerId: 'otherUser',
        teams: [
          {
            player1: { userId: 'otherUser' },
            player2: { userId: 'teammate3' },
          },
        ],
        matches: [],
      },
    ];

    const result = calculatePlayerStats(tournaments, mockUserId);

    expect(result.tournamentsPlayed).toBe(2);
    expect(result.trophiesWon).toBe(1);
    expect(result.matchesPlayed).toBe(5);
    expect(result.matchesWon).toBe(3);
  });
});

describe('calculateWinRate', () => {
  it('should return 0 when no matches played', () => {
    const result = calculateWinRate(0, 0);
    expect(result).toBe(0);
  });

  it('should return 0 when 0 wins', () => {
    const result = calculateWinRate(0, 10);
    expect(result).toBe(0);
  });

  it('should return 100 when all matches won', () => {
    const result = calculateWinRate(10, 10);
    expect(result).toBe(100);
  });

  it('should return 50 for 50% win rate', () => {
    const result = calculateWinRate(5, 10);
    expect(result).toBe(50);
  });

  it('should round to nearest integer', () => {
    const result = calculateWinRate(2, 3); // 66.666...
    expect(result).toBe(67);
  });

  it('should handle decimal results correctly', () => {
    const result = calculateWinRate(1, 3); // 33.333...
    expect(result).toBe(33);
  });
});
