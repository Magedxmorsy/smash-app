import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import Button from '../ui/Button';
import LinkButton from '../ui/LinkButton';

import EditIcon from '../../../assets/icons/edit.svg';
import TrashIcon from '../../../assets/icons/trash.svg';
import TeamIcon from '../../../assets/icons/team.svg';

export default function TournamentOptionsBottomSheet({ visible, onClose, onEdit, onDelete, onFillDummyData, tournamentStatus }) {
  const insets = useSafeAreaInsets();

  const isTournamentFinished = tournamentStatus === 'FINISHED';

  const handleEdit = () => {
    if (onEdit && !isTournamentFinished) {
      onEdit();
    }
  };

  const handleDelete = () => {
    onClose();
    if (onDelete) {
      onDelete();
    }
  };

  const handleFillDummyData = () => {
    onClose();
    if (onFillDummyData && !isTournamentFinished) {
      onFillDummyData();
    }
  };

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
      <View style={[styles.container, { paddingBottom: insets.bottom + Spacing.space1 }]}>
        {/* Swipe Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Edit Tournament Option */}
        <LinkButton
          title="Edit tournament"
          icon={<EditIcon />}
          iconSize={32}
          variant="primary"
          spacing={2}
          onPress={handleEdit}
          disabled={isTournamentFinished}
        />

        {/* Fill with Dummy Data Option (Testing Only) */}
        <LinkButton
          title="Fill with dummy teams (Test)"
          icon={<TeamIcon />}
          iconSize={32}
          variant="primary"
          spacing={2}
          onPress={handleFillDummyData}
          disabled={isTournamentFinished}
        />

        {/* Delete Tournament Option */}
        <LinkButton
          title="Delete tournament"
          icon={<TrashIcon />}
          iconSize={32}
          variant="destructive"
          spacing={2}
          onPress={handleDelete}
          style={styles.deleteOption}
        />

        {/* Cancel Button */}
        <View style={styles.buttonsContainer}>
          <Button
            title="Cancel"
            onPress={onClose}
            variant="ghost"
            fullWidth={true}
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
    paddingBottom: Spacing.space3,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral300,
    borderRadius: 2,
  },
  deleteOption: {
    marginBottom: Spacing.space2,
  },
  buttonsContainer: {
    gap: Spacing.space2,
    marginBottom: Spacing.space1,
  },
});
