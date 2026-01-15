import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Modal, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing, BorderRadius } from '../../constants/Spacing';
import { parseCourts } from '../../utils/courtScheduler';
import Button from '../ui/Button';
import Card from '../ui/Card';
import Player from '../ui/Player';
import Banner from '../ui/Banner';
import CloseIcon from '../../../assets/icons/close.svg';

export default function StartTournamentBottomSheet({
  visible,
  onClose,
  onConfirm,
  tournament = {},
  onGenerateGroups,
  generatedGroups = null,
}) {
  const insets = useSafeAreaInsets();
  const [modalState, setModalState] = useState('preview'); // 'preview' | 'loading' | 'groups'

  // Calculate scheduling information
  const calculateScheduleInfo = () => {
    if (!tournament.teamCount || !tournament.courts) {
      return null;
    }

    const courts = parseCourts(tournament.courts);
    const courtCount = courts.length;

    // Format courts as "6, 5 & 3" instead of "Court 6, Court 5, Court 3"
    const courtNumbers = courts.map(court => court.replace(/Court\s*/i, ''));
    const courtsList = courtNumbers.length > 1
      ? courtNumbers.slice(0, -1).join(', ') + ' & ' + courtNumbers[courtNumbers.length - 1]
      : courtNumbers[0];

    // Default match duration: 30 minutes
    const matchDuration = tournament.matchDuration || 30;

    // Calculate total matches (for round-robin in groups of 4)
    const groupCount = Math.ceil(tournament.teamCount / 4);
    const matchesPerGroup = 6; // Total matches per group across all rounds
    const totalMatches = groupCount * matchesPerGroup;

    // Calculate matches per round (each group has 2 matches per round with 4 teams)
    const matchesPerRound = groupCount * 2; // 2 matches per group per round
    const numberOfRounds = 3; // Always 3 rounds for 4-team groups

    // Check if courts are limited (need multiple time slots per round)
    const timeSlotsPerRound = Math.ceil(matchesPerRound / courtCount);
    const isLimited = timeSlotsPerRound > 1;

    // Calculate total time
    const totalTimeSlots = numberOfRounds * timeSlotsPerRound;
    const totalMinutes = totalTimeSlots * matchDuration;
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const totalTimeFormatted = minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;

    return {
      courtsList,
      courtCount,
      matchDuration,
      totalMatches,
      totalTimeFormatted,
      isLimited,
      timeSlotsNeeded: timeSlotsPerRound,
    };
  };

  const scheduleInfo = calculateScheduleInfo();

  const handleGenerateGroups = async () => {
    setModalState('loading');

    // Call parent's generate groups function
    if (onGenerateGroups) {
      await onGenerateGroups();
    }

    setModalState('groups');
  };

  const handleRegenerate = async () => {
    setModalState('loading');

    // Call parent's generate groups function again
    if (onGenerateGroups) {
      await onGenerateGroups();
    }

    setModalState('groups');
  };

  const handleConfirmAndStart = () => {
    if (onConfirm) {
      onConfirm();
    }
    setModalState('preview'); // Reset for next time
    onClose();
  };

  const handleClose = () => {
    setModalState('preview'); // Reset state when closing
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Swipe Indicator */}
        <View style={styles.swipeIndicator} />

        {/* Header with Close Button */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <CloseIcon width={32} height={32} />
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Start tournament</Text>
          </View>
          <View style={styles.closeButton} />
        </View>

        {/* PREVIEW STATE */}
        {modalState === 'preview' && scheduleInfo && (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.subtitle}>
              Review all the tournament matches scheduling details then tap on generating groups
            </Text>

            {/* Scheduling Details Card */}
            <Card style={styles.detailsCard}>
              <View style={styles.detailsContainer}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Courts</Text>
                  <Text style={styles.detailValue}>{scheduleInfo.courtsList}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Match duration</Text>
                  <Text style={styles.detailValue}>{scheduleInfo.matchDuration}min</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Number of matches</Text>
                  <Text style={styles.detailValue}>{scheduleInfo.totalMatches}</Text>
                </View>

                <View style={styles.divider} />

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Total time</Text>
                  <Text style={styles.detailValue}>{scheduleInfo.totalTimeFormatted}</Text>
                </View>
              </View>
            </Card>

            {/* Warning Banner for Limited Courts */}
            {scheduleInfo.isLimited && (
              <View style={styles.bannerContainer}>
                <Banner
                  variant="warning"
                  message={`Matches will be played in ${scheduleInfo.timeSlotsNeeded} time slots as you have limited courts.`}
                  dismissible={false}
                />
              </View>
            )}

            {/* Bottom Disclaimer */}
            <Text style={styles.disclaimer}>
              By pressing "Generate groups" you will generate groups randomly, lock team registration and schedule all matches
            </Text>
          </ScrollView>
        )}

        {/* LOADING STATE */}
        {modalState === 'loading' && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary300} />
            <Text style={styles.loadingText}>Generating groups</Text>
          </View>
        )}

        {/* GROUPS PREVIEW STATE */}
        {modalState === 'groups' && generatedGroups && (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.subtitle}>
              Review the generated groups before starting your tournament
            </Text>

            {generatedGroups.map((group, groupIndex) => (
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
                          avatarUri={team.player1.avatarUri}
                          align="left"
                        />
                        <Player
                          firstName={team.player2.firstName}
                          lastName={team.player2.lastName}
                          avatarUri={team.player2.avatarUri}
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
          {modalState === 'preview' && (
            <Button
              title="Generate groups"
              variant="accent"
              size="large"
              onPress={handleGenerateGroups}
            />
          )}

          {modalState === 'groups' && (
            <>
              <Button
                title="Confirm and start"
                variant="accent"
                size="large"
                onPress={handleConfirmAndStart}
              />
              <Button
                title="Regenerate"
                variant="ghost"
                size="large"
                onPress={handleRegenerate}
              />
            </>
          )}
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
    width: Spacing.space10,
    height: Spacing.space1,
    backgroundColor: Colors.neutral300,
    borderRadius: BorderRadius.radius1 / 2,
    alignSelf: 'center',
    marginTop: Spacing.space3,
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
    width: Spacing.listItemHeight - 12,
    height: Spacing.listItemHeight - 12,
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
    textAlign: 'center',
  },
  detailsCard: {
    marginBottom: Spacing.space3,
  },
  detailsContainer: {
    // Card already has padding from Card component
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.space2,
  },
  divider: {
    height: Spacing.dividerHeight,
    backgroundColor: Colors.border,
    marginVertical: Spacing.space2,
  },
  detailLabel: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.neutral400,
  },
  detailValue: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.primary300,
  },
  bannerContainer: {
    marginBottom: Spacing.space4, // 16px bottom margin
  },
  disclaimer: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body300,
    color: Colors.neutral400,
    textAlign: 'center',
    lineHeight: Typography.body300 * 1.5,
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
    borderRadius: BorderRadius.radius4,
    padding: Spacing.space3,
    minHeight: 64,
  },
  footer: {
    paddingHorizontal: Spacing.space4,
    paddingVertical: Spacing.space3,
    gap: Spacing.space2,
  },
});
