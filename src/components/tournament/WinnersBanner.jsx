import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';
import Player from '../ui/Player';

export default function WinnersBanner({ tournament }) {
  // Early returns for edge cases
  if (!tournament) return null;
  if (tournament.status !== 'FINISHED') return null;
  if (!tournament.matches || !Array.isArray(tournament.matches)) return null;

  // Find finals match (case-insensitive)
  const finalsMatch = tournament.matches.find(
    match => match.round?.toLowerCase() === 'finals'
  );

  // Validate finals match exists and has winner
  if (!finalsMatch) return null;
  if (!finalsMatch.winningTeam) return null;

  // Determine winning team based on winningTeam field
  const winningTeamData = finalsMatch.winningTeam === 'left'
    ? finalsMatch.team1
    : finalsMatch.team2;

  // Validate winning team has both players
  if (!winningTeamData || !winningTeamData.player1 || !winningTeamData.player2) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Trophy Icon - Center positioned */}
      <View style={styles.centerContent}>
        <Image
          source={require('../../../assets/winnerstrophy.png')}
          style={styles.trophyImage}
          resizeMode="contain"
        />
      </View>

      {/* Winner Team Display */}
      <View style={styles.playersContainer}>
        {/* Player 1 - Left aligned */}
        <View style={styles.playerWrapper}>
          <Player
            firstName={winningTeamData.player1.firstName}
            lastName={winningTeamData.player1.lastName}
            avatarUri={winningTeamData.player1.avatarUri}
            align="left"
          />
        </View>

        {/* Player 2 - Right aligned */}
        <View style={styles.playerWrapper}>
          <Player
            firstName={winningTeamData.player2.firstName}
            lastName={winningTeamData.player2.lastName}
            avatarUri={winningTeamData.player2.avatarUri}
            align="right"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.accent300,
    borderRadius: 16,
    padding: Spacing.space3,
    minHeight: 64,
    marginBottom: Spacing.space4,
    position: 'relative',
    justifyContent: 'center',
    overflow: 'visible',
    shadowColor: Colors.primary300,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  centerContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  trophyImage: {
    width: 120,
    height: 120,
    opacity: 0.9,
  },
  playersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  playerWrapper: {
    backgroundColor: 'transparent',
  },
});
