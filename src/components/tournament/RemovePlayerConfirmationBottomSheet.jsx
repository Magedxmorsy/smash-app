import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import BottomSheet from '../ui/BottomSheet';
import Button from '../ui/Button';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';

export default function RemovePlayerConfirmationBottomSheet({
  visible,
  onClose,
  onConfirm,
  playerName,
  isSelf = false,
  isOnlyPlayer = false,
}) {
  // If user is alone on team, show "Delete team?" instead of "Leave team?"
  const title = isSelf
    ? (isOnlyPlayer ? 'Delete team?' : 'Leave team?')
    : 'Remove player?';

  const message = isSelf
    ? (isOnlyPlayer
        ? 'Are you sure you want to delete this team? This action cannot be undone.'
        : 'Are you sure you want to leave this team?')
    : `Remove ${playerName} from this team?`;

  const confirmText = isSelf
    ? (isOnlyPlayer ? 'Delete team' : 'Leave team')
    : 'Remove player';

  const cancelText = isSelf ? 'Stay in team' : 'Cancel';

  return (
    <BottomSheet visible={visible} onClose={onClose} snapPoints={['35%']}>
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>

        <View style={styles.buttonContainer}>
          <Button
            title={confirmText}
            onPress={onConfirm}
            variant="secondary"
            fullWidth
          />
          <Button
            title={cancelText}
            onPress={onClose}
            variant="ghost"
            fullWidth
          />
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.space4,
  },
  title: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline200,
    color: Colors.primary300,
    marginBottom: Spacing.space2,
    textAlign: 'center',
  },
  message: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    marginBottom: Spacing.space6,
    textAlign: 'center',
    lineHeight: Typography.body200 * 1.5,
  },
  buttonContainer: {
    gap: Spacing.space2,
  },
});
