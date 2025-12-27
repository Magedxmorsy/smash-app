import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import Button from '../ui/Button';

import EditIcon from '../../../assets/icons/edit.svg';
import TrashIcon from '../../../assets/icons/trash.svg';
import TeamIcon from '../../../assets/icons/team.svg';

export default function TournamentOptionsBottomSheet({ visible, onClose, onEdit, onDelete, onFillDummyData }) {
  const insets = useSafeAreaInsets();

  const handleEdit = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (onEdit) {
      onEdit();
    }
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    if (onDelete) {
      onDelete();
    }
  };

  const handleFillDummyData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onClose();
    if (onFillDummyData) {
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
      <View style={[styles.container, { paddingBottom: insets.bottom + Spacing.space4 }]}>
        {/* Swipe Handle */}
        <View style={styles.handleContainer}>
          <View style={styles.handle} />
        </View>

        {/* Edit Tournament Option */}
        <TouchableOpacity style={styles.option} onPress={handleEdit}>
          <EditIcon width={32} height={32} color={Colors.primary300} />
          <Text style={styles.optionText}>Edit tournament</Text>
        </TouchableOpacity>

        {/* Fill with Dummy Data Option (Testing Only) */}
        <TouchableOpacity style={styles.option} onPress={handleFillDummyData}>
          <TeamIcon width={32} height={32} color={Colors.primary300} />
          <Text style={styles.optionText}>Fill with dummy teams (Test)</Text>
        </TouchableOpacity>

        {/* Delete Tournament Option */}
        <TouchableOpacity style={styles.optionDelete} onPress={handleDelete}>
          <TrashIcon width={32} height={32} color={Colors.error} stroke={Colors.error} />
          <Text style={styles.optionTextDelete}>Delete tournament</Text>
        </TouchableOpacity>

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
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.space3,
    paddingVertical: Spacing.space2,
    paddingHorizontal: Spacing.space2,
  },
  optionText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
  },
  optionDelete: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.space3,
    paddingVertical: Spacing.space2,
    paddingHorizontal: Spacing.space2,
    marginBottom: Spacing.space4,
  },
  optionTextDelete: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.error,
  },
  buttonsContainer: {
    gap: Spacing.space2,
    marginBottom: Spacing.space1,
  },
});
