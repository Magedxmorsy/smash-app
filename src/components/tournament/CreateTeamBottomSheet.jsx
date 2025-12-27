import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import CloseIcon from '../../../assets/icons/close.svg';
import AvatarPlaceholderIcon from '../../../assets/icons/user-selected.svg';

export default function CreateTeamBottomSheet({
  visible,
  onClose,
  onConfirm,
  currentUser
}) {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;

  // Debug: Log what currentUser we received
  console.log('CreateTeamBottomSheet - currentUser:', currentUser);
  console.log('CreateTeamBottomSheet - displayName:', currentUser?.displayName);
  console.log('CreateTeamBottomSheet - profilePhoto:', currentUser?.profilePhoto);

  return (
    <Modal
      isVisible={visible}
      onBackdropPress={onClose}
      onSwipeComplete={onClose}
      swipeDirection="down"
      style={styles.modal}
      propagateSwipe={true}
      avoidKeyboard={false}
      animationIn="slideInUp"
      animationOut="slideOutDown"
    >
      <View style={[styles.container, { paddingBottom: insets.bottom + Spacing.space4 }]}>
        {/* Swipe Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Close Button */}
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <CloseIcon width={32} height={32} color={Colors.neutral400} />
        </TouchableOpacity>

        {/* Title */}
        <Text style={styles.title}>Create new team</Text>

        {/* Team Preview */}
        <View style={styles.teamPreview}>
          {/* Current User Avatar */}
          <View style={styles.playerContainer}>
            <Avatar
              size="large"
              source={currentUser?.profilePhoto}
              name={currentUser?.displayName || 'User'}
            />
            <Text style={styles.playerName}>
              {currentUser?.displayName?.split(' ')[0] || 'You'}
            </Text>
          </View>

          {/* Player 2 Placeholder */}
          <View style={styles.playerContainer}>
            <View style={styles.placeholderAvatarContainer}>
              <AvatarPlaceholderIcon width={48} height={48} color={Colors.neutral300} />
              <View style={styles.placeholderBorder} />
            </View>
            <Text style={styles.placeholderText}>Player 2</Text>
          </View>
        </View>

        {/* Info Text */}
        <Text style={styles.infoText}>
          After creating your team you will be able to invite your team mate
        </Text>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Button
            title="Create team"
            onPress={onConfirm}
            variant="primary"
            fullWidth
          />
          <Button
            title="Go back to team list"
            onPress={onClose}
            variant="ghost"
            fullWidth
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  container: {
    backgroundColor: Colors.background,
    borderTopLeftRadius: BorderRadius.radius6,
    borderTopRightRadius: BorderRadius.radius6,
    paddingHorizontal: Spacing.space4,
    paddingTop: Spacing.space2,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: Spacing.space2,
    paddingBottom: Spacing.space4,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral300,
    borderRadius: 2,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.space4,
    left: Spacing.space4,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  title: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
    textAlign: 'center',
    marginBottom: Spacing.space8,
  },
  teamPreview: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.space8,
    marginBottom: Spacing.space8,
  },
  playerContainer: {
    alignItems: 'center',
    gap: Spacing.space3,
  },
  playerName: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
    textAlign: 'center',
  },
  placeholderAvatarContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    position: 'relative',
  },
  placeholderBorder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: Colors.neutral300,
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.headline100,
    color: Colors.neutral400,
    textAlign: 'center',
  },
  infoText: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    textAlign: 'center',
    lineHeight: Typography.body200 * 1.5,
    marginBottom: Spacing.space6,
    paddingHorizontal: Spacing.space4,
  },
  buttonsContainer: {
    gap: Spacing.space2,
    marginBottom: Spacing.space1,
  },
});
