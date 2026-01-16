/**
 * Utility functions for calculating player statistics
 */

/**
 * Calculate player statistics from tournaments
 * @param {Array} tournaments - All tournaments
 * @param {string} userId - The user's ID
 * @returns {Object} - Stats object with counts
 */
export const calculatePlayerStats = (tournaments, userId) => {
  if (!tournaments || !userId) {
    return {
      tournamentsPlayed: 0,
      trophiesWon: 0,
      matchesWon: 0,
      matchesPlayed: 0,
    };
  }

  let tournamentsPlayed = 0;
  let trophiesWon = 0;
  let matchesWon = 0;
  let matchesPlayed = 0;

  tournaments.forEach(tournament => {
    // Check if user participated in this tournament using participantIds (authoritative source)
    const isParticipant = tournament.participantIds?.includes(userId);

    if (!isParticipant) {
      return; // User not in this tournament
    }

    // Count tournament as played if user is a participant
    tournamentsPlayed++;

    // Find user's team for match calculations
    const userTeam = tournament.teams?.find(team =>
      team.player1?.userId === userId || team.player2?.userId === userId
    );

    // Count trophies won (tournaments where user won)
    if (tournament.status === 'COMPLETED' && tournament.winnerId && userTeam) {
      // Find if this team is the winner
      const winnerTeam = tournament.teams?.find(team =>
        (team.player1?.userId === tournament.winnerId || team.player2?.userId === tournament.winnerId)
      );
      if (winnerTeam === userTeam) {
        trophiesWon++;
      }
    }

    // Count matches played and won (only if user's team exists)
    if (userTeam && tournament.matches && Array.isArray(tournament.matches)) {
      tournament.matches.forEach(match => {
        // Check if user participated in this match
        const userInLeftTeam = match.leftTeam?.player1?.userId === userId || match.leftTeam?.player2?.userId === userId;
        const userInRightTeam = match.rightTeam?.player1?.userId === userId || match.rightTeam?.player2?.userId === userId;

        if (userInLeftTeam || userInRightTeam) {
          matchesPlayed++;

          // Count if user won this match
          if (match.winner) {
            if ((match.winner === 'left' && userInLeftTeam) || (match.winner === 'right' && userInRightTeam)) {
              matchesWon++;
            }
          }
        }
      });
    }
  });

  return {
    tournamentsPlayed,
    trophiesWon,
    matchesWon,
    matchesPlayed,
  };
};

/**
 * Calculate win rate percentage
 * @param {number} matchesWon
 * @param {number} matchesPlayed
 * @returns {number} - Win rate as percentage (0-100)
 */
export const calculateWinRate = (matchesWon, matchesPlayed) => {
  if (matchesPlayed === 0) return 0;
  return Math.round((matchesWon / matchesPlayed) * 100);
};
