import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import Player from '../ui/Player';
import JoinButton from '../ui/JoinButton';
import EmptyState from '../ui/EmptyState';
import Button from '../ui/Button';
import RemovePlayerButton from './RemovePlayerButton';
import RemovePlayerConfirmationBottomSheet from './RemovePlayerConfirmationBottomSheet';
import PlusIcon from '../../../assets/icons/plus.svg';

export default function TeamsList({ teams, totalTeams, onJoinTeam, onCreateTeam, userHasTeam = false, isAdmin = false, currentUserId = null, onStartTournament, onRemovePlayer, tournamentStatus }) {
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false);
  const [playerToRemove, setPlayerToRemove] = useState(null);

  // Permission check: can this user remove this player?
  const canRemovePlayer = (player) => {
    // Must be in registration phase
    if (tournamentStatus !== 'REGISTRATION') return false;

    // Host can remove anyone
    if (isAdmin) return true;

    // Player can remove themselves
    if (player?.userId === currentUserId) return true;

    return false;
  };

  // Handle remove button press
  const handleRemovePress = (teamIndex, playerPosition, playerName, isSelf, isOnlyPlayer) => {
    setPlayerToRemove({ teamIndex, playerPosition, playerName, isSelf, isOnlyPlayer });
    setShowRemoveConfirmation(true);
  };

  // Handle confirm removal
  const handleConfirmRemove = async () => {
    if (!playerToRemove) return;

    const result = await onRemovePlayer(
      playerToRemove.teamIndex,
      playerToRemove.playerPosition
    );

    if (result?.success) {
      // Close modal
      setShowRemoveConfirmation(false);
      setPlayerToRemove(null);
    } else {
      // Show error
      setShowRemoveConfirmation(false);
      setPlayerToRemove(null);
      Alert.alert('Error', 'Failed to remove player. Please try again.');
    }
  };

  // Filter out empty teams (both players are null)
  const activeTeams = teams.filter(team => team.player1 !== null || team.player2 !== null);

  // Calculate filled teams (both players present)
  const filledTeams = teams.filter(t => t.player1 !== null && t.player2 !== null);
  const isTournamentFull = filledTeams.length === totalTeams;

  const renderTeamItem = (team, index) => {
    const hasPlayer1 = team.player1 !== null;
    const hasPlayer2 = team.player2 !== null;
    // Check if this is the admin's team (don't show join button for admin's own team)
    const isAdminTeam = team.isAdminTeam === true;
    // Check if current user is player1 of this team
    const isCurrentUserOnThisTeam = team.player1?.userId === currentUserId;

    return (
      <View key={index} style={styles.teamItem}>
        {/* Player 1 (Left) */}
        {hasPlayer1 ? (
          <View style={styles.playerContainer}>
            <Player
              firstName={team.player1.firstName}
              lastName={team.player1.lastName}
              avatarSource={team.player1.avatarSource}
              align="left"
            />
            <RemovePlayerButton
              visible={canRemovePlayer(team.player1)}
              onPress={() => handleRemovePress(
                index,
                'player1',
                `${team.player1.firstName} ${team.player1.lastName}`,
                team.player1.userId === currentUserId,
                !hasPlayer2 // isOnlyPlayer: true if player2 doesn't exist
              )}
              containerSize={40}
              align="left"
            />
          </View>
        ) : (
          <View style={styles.emptyPlayer} />
        )}

        {/* Player 2 (Right) or Join/Invite button */}
        {hasPlayer2 ? (
          <View style={styles.playerContainer}>
            <Player
              firstName={team.player2.firstName}
              lastName={team.player2.lastName}
              avatarSource={team.player2.avatarSource}
              align="right"
            />
            <RemovePlayerButton
              visible={canRemovePlayer(team.player2)}
              onPress={() => handleRemovePress(
                index,
                'player2',
                `${team.player2.firstName} ${team.player2.lastName}`,
                team.player2.userId === currentUserId,
                !hasPlayer1 // isOnlyPlayer: true if player1 doesn't exist
              )}
              containerSize={40}
              align="right"
            />
          </View>
        ) : hasPlayer1 ? (
          <JoinButton
            label={userHasTeam ? "Invite" : "Join"}
            onPress={() => onJoinTeam(index)}
            align="right"
          />
        ) : (
          <View style={styles.emptyPlayer} />
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Teams</Text>
        <Text style={styles.count}>
          {teams.filter(t => t.player1 !== null && t.player2 !== null).length}/{totalTeams}
        </Text>
      </View>

      {/* Teams List or Empty State */}
      {activeTeams.length === 0 ? (
        <EmptyState
          imageSource={require('../../../assets/noteams.png')}
          headline="No teams yet"
          body={isAdmin ? "Share this tournament with your friends to get them to join" : "Be the first to join this tournament"}
        />
      ) : (
        <View style={styles.teamsList}>
          {activeTeams.map((team, index) => renderTeamItem(team, index))}

          {/* Tournament Full State - Only show message, button is in sticky position */}
          {isTournamentFull && (
            <View style={styles.fullStateContainer}>
              {/* Message based on user type */}
              {isAdmin ? (
                <Text style={styles.fullStateMessage}>All spots filled. Let's start it 💪</Text>
              ) : userHasTeam ? (
                <Text style={styles.fullStateMessage}>All set! Waiting for the host to start 🎾</Text>
              ) : (
                <Text style={styles.fullStateMessage}>Tournament is full. Check back for upcoming tournaments 🏆</Text>
              )}
            </View>
          )}

          {/* Create New Team Button - Only show if tournament NOT full and user doesn't have a team */}
          {!isTournamentFull && !userHasTeam && !isAdmin && (
            <TouchableOpacity
              style={styles.createTeamButton}
              onPress={onCreateTeam}
            >
              <PlusIcon width={20} height={20} color={Colors.primary300} />
              <Text style={styles.createTeamText}>Create new team</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Remove Player Confirmation Modal */}
      <RemovePlayerConfirmationBottomSheet
        visible={showRemoveConfirmation}
        onClose={() => {
          setShowRemoveConfirmation(false);
          setPlayerToRemove(null);
        }}
        onConfirm={handleConfirmRemove}
        playerName={playerToRemove?.playerName || ''}
        isSelf={playerToRemove?.isSelf || false}
        isOnlyPlayer={playerToRemove?.isOnlyPlayer || false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.space2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.primary300,
  },
  count: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.primary300,
  },
  teamsList: {
    gap: Spacing.space1,
  },
  teamItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    padding: Spacing.space3,
    minHeight: 64,
  },
  playerContainer: {
    position: 'relative', // For absolute positioning of X button
  },
  emptyPlayer: {
    width: 100, // Placeholder for empty player slot
  },
  createTeamButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.neutral300,
    borderStyle: 'dashed',
    borderRadius: 16,
    padding: Spacing.space4,
    minHeight: 64,
    gap: Spacing.space2,
  },
  createTeamText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.button,
    lineHeight: Typography.button * Typography.lineHeightButton,
    color: Colors.primary300,
  },
  fullStateContainer: {
    gap: Spacing.space4,
    marginTop: Spacing.space2,
  },
  fullStateMessage: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    textAlign: 'center',
    lineHeight: Typography.body200 * 1.5,
  },
});
