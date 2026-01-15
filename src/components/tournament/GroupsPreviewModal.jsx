import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Modal, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Player from '../ui/Player';
import CloseIcon from '../../../assets/icons/close.svg';

export default function GroupsPreviewModal({ visible, onClose, groups, onConfirm, onRegenerate }) {
  const insets = useSafeAreaInsets();
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleRegenerate = async () => {
    setIsRegenerating(true);

    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Call the parent's regenerate function
    if (onRegenerate) {
      await onRegenerate();
    }

    setIsRegenerating(false);
  };

  if (!groups) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Swipe Indicator */}
        <View style={styles.swipeIndicator} />

        {/* Header with Close Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <CloseIcon width={32} height={32} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Groups preview</Text>
          </View>
          <View style={styles.closeButton} />
        </View>

        {/* Groups List or Loading State */}
        {isRegenerating ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary300} />
            <Text style={styles.loadingText}>Generating new groups...</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.subtitle}>
              Review the generated groups before starting your tournament
            </Text>

            {groups.map((group, groupIndex) => (
              <View key={group.id} style={styles.groupSection}>
                <Text style={styles.groupName}>{group.name}</Text>
                <View style={styles.teamsContainer}>
                  {group.teams
                    .filter(team => team && team.player1 && team.player2)
                    .map((team, teamIndex) => (
                      <View key={teamIndex} style={styles.teamItem}>
                        <Player
                          firstName={team.player1.firstName}
                          lastName={team.player1.lastName}
                          avatarSource={team.player1.avatarUri}
                          align="left"
                        />
                        <Player
                          firstName={team.player2.firstName}
                          lastName={team.player2.lastName}
                          avatarSource={team.player2.avatarUri}
                          align="right"
                        />
                      </View>
                    ))}
                </View>
              </View>
            ))}
          </ScrollView>
        )}

        {/* Footer with Buttons */}
        <View style={[styles.footer, { paddingBottom: insets.bottom + Spacing.space3 }]}>
          <Button
            title="Confirm & start"
            variant="accent"
            size="large"
            onPress={onConfirm}
            disabled={isRegenerating}
          />
          <Button
            title="Generate again"
            variant="ghost"
            size="large"
            onPress={handleRegenerate}
            disabled={isRegenerating}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  swipeIndicator: {
    width: 40,
    height: 4,
    backgroundColor: Colors.neutral300,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: Spacing.space2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.space2,
    marginBottom: Spacing.space4,
  },
  closeButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.space4,
    paddingBottom: Spacing.space4,
  },
  subtitle: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    marginBottom: Spacing.space4,
  },
  groupSection: {
    marginBottom: Spacing.space4,
  },
  groupName: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body300,
    color: Colors.primary300,
    marginBottom: Spacing.space2,
  },
  teamsContainer: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.space3,
  },
  loadingText: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
  },
  footer: {
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space3,
    gap: Spacing.space2,
  },
});
