import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import CompeteIcon from '../../../assets/icons/compete.svg';
import { getRelativeTime } from '../../utils/dateFormatter';

/**
 * NotificationItem Component
 *
 * Displays individual notification with avatar/icon, message, and optional action button
 * Design specs:
 * - Avatar/Icon: 40x40px
 * - Left/Right margins: 16px
 * - Avatar to text gap: 16px
 * - Text to timestamp gap: 0px
 * - Unread indicator: 4px diameter dot, secondary color
 * - Divider: Between notifications
 */
export default function NotificationItem({ notification, onPress, showDivider = true }) {
  const {
    type,
    action,
    title,
    message,
    read,
    createdAt,
    metadata,
    playerInfo, // { firstName, lastName, avatarUri }
    actionButton, // { label, onPress }
  } = notification;

  // Determine if this notification should show an avatar (player action) or icon (system action)
  // Show avatar for player-initiated actions, even if playerInfo is missing (for backward compatibility)
  const showAvatar = (
    action === 'teammate_joined' ||
    action === 'new_team_joined' ||
    action === 'score_added' ||
    action === 'score_updated' ||
    action === 'tournament_updated_by_player'
  );

  // Format the message with bold parts for player names and tournament names
  const renderMessage = () => {
    // Extract player name and tournament name from metadata if available
    const playerName = playerInfo ? `${playerInfo.firstName} ${playerInfo.lastName}` : null;
    const tournamentName = metadata?.tournamentName;

    // Split message and apply bold styling
    const parts = [];
    let remainingText = message;
    let keyCounter = 0;

    // First, bold the player name if it exists in the message
    if (playerName && remainingText.includes(playerName)) {
      const playerIndex = remainingText.indexOf(playerName);
      if (playerIndex > 0) {
        parts.push(
          <Text key={keyCounter++} style={styles.messageText}>
            {remainingText.substring(0, playerIndex)}
          </Text>
        );
      }
      parts.push(
        <Text key={keyCounter++} style={styles.messageBold}>
          {playerName}
        </Text>
      );
      remainingText = remainingText.substring(playerIndex + playerName.length);
    }

    // Then, bold the tournament name if it exists in the remaining text
    if (tournamentName && remainingText.includes(tournamentName)) {
      const tournamentIndex = remainingText.indexOf(tournamentName);
      if (tournamentIndex > 0) {
        parts.push(
          <Text key={keyCounter++} style={styles.messageText}>
            {remainingText.substring(0, tournamentIndex)}
          </Text>
        );
      }
      parts.push(
        <Text key={keyCounter++} style={styles.messageBold}>
          {tournamentName}
        </Text>
      );
      remainingText = remainingText.substring(tournamentIndex + tournamentName.length);
    }

    // Add any remaining text
    if (remainingText) {
      parts.push(
        <Text key={keyCounter++} style={styles.messageText}>
          {remainingText}
        </Text>
      );
    }

    // If no parts were created, return the plain message
    if (parts.length === 0) {
      return <Text style={styles.messageText}>{message}</Text>;
    }

    return <Text style={styles.message}>{parts}</Text>;
  };

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={onPress}
        activeOpacity={0.7}
        disabled={!onPress}
      >
        {/* Avatar or Icon */}
        <View style={styles.iconContainer}>
          {showAvatar ? (
            <Avatar
              size="small"
              source={playerInfo?.avatarUri ? { uri: playerInfo.avatarUri } : null}
              name={`${playerInfo?.firstName || ''} ${playerInfo?.lastName || ''}`}
            />
          ) : (
            <View style={styles.systemIconWrapper}>
              <CompeteIcon width={24} height={24} />
            </View>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {renderMessage()}
          <Text style={styles.timestamp}>{getRelativeTime(createdAt)}</Text>

          {/* Optional Action Button */}
          {actionButton && (
            <View style={styles.buttonContainer}>
              <Button
                title={actionButton.label}
                variant="ghost"
                size="small"
                onPress={actionButton.onPress}
              />
            </View>
          )}
        </View>

        {/* Unread Indicator */}
        {!read && <View style={styles.unreadDot} />}
      </TouchableOpacity>

      {/* Divider */}
      {showDivider && <View style={styles.divider} />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.space4, // 16px left/right margins
    paddingTop: Spacing.space2, // 8px top
    paddingBottom: Spacing.space2, // 8px bottom
    position: 'relative',
  },
  iconContainer: {
    width: Spacing.avatarSmall, // 40px
    height: Spacing.avatarSmall, // 40px
    marginRight: Spacing.space4, // 16px gap to text
  },
  systemIconWrapper: {
    width: Spacing.avatarSmall, // 40px
    height: Spacing.avatarSmall, // 40px
    borderRadius: BorderRadius.radiusFull,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  message: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: Typography.body200,
    color: Colors.primary300,
    lineHeight: Typography.body200 * 1.5,
  },
  messageText: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: Typography.body200,
    color: Colors.primary300,
  },
  messageBold: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.primary300,
  },
  timestamp: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: 13, // 13px as specified
    color: Colors.neutral400,
    marginTop: 0, // No gap between text and timestamp
  },
  buttonContainer: {
    marginTop: Spacing.space2,
    alignSelf: 'flex-start',
  },
  unreadDot: {
    position: 'absolute',
    top: Spacing.space2 + 8, // Center vertically with first line of text
    right: Spacing.space4, // 16px from right edge
    width: 4, // 4px diameter
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.error, // Red dot for unread (as per design)
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginHorizontal: Spacing.space4, // 16px margins on divider
    marginVertical: Spacing.space2, // 8px top and bottom
  },
});
