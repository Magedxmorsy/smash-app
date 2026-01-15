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

export default function JoinTeamBottomSheet({
  visible,
  onClose,
  onConfirm,
  teamPlayer,
  currentUser
}) {
  const insets = useSafeAreaInsets();
  const screenHeight = Dimensions.get('window').height;

  // Debug: Log what we received
  console.log('JoinTeamBottomSheet - currentUser:', currentUser);
  console.log('JoinTeamBottomSheet - displayName:', currentUser?.displayName);
  console.log('JoinTeamBottomSheet - profilePhoto:', currentUser?.profilePhoto);

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
      coverScreen={true}
      useNativeDriver={true}
      statusBarTranslucent={true}
      deviceHeight={screenHeight}
      backdropOpacity={0.5}
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
        <Text style={styles.title}>
          Joining {teamPlayer?.firstName}'s team
        </Text>

        {/* Team Preview */}
        <View style={styles.teamPreview}>
          {/* Team Player Avatar */}
          <View style={styles.playerContainer}>
            <Avatar
              size="large"
              source={teamPlayer?.avatarUri}
              name={`${teamPlayer?.firstName} ${teamPlayer?.lastName}`}
            />
            <Text style={styles.playerName}>
              {teamPlayer?.firstName}
            </Text>
          </View>

          {/* Current User Avatar */}
          <View style={styles.playerContainer}>
            <Avatar
              size="large"
              source={currentUser?.profilePhoto}
              name={currentUser?.displayName || 'User'}
            />
            <Text style={styles.playerName}>You</Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonsContainer}>
          <Button
            title="Join"
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
    marginBottom: Spacing.space6,
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
  buttonsContainer: {
    gap: Spacing.space2,
    marginBottom: Spacing.space1,
  },
});
