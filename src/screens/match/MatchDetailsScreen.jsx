import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, Share, Alert, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Calendar from 'expo-calendar';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { formatDateTime } from '../../utils/dateFormatter';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Card from '../../components/ui/Card';
import DetailsListItem from '../../components/ui/DetailsListItem';
import Team from '../../components/ui/Team';
import RecordScoreModal from '../../components/match/RecordScoreModal';
import { useTournaments } from '../../contexts/TournamentContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { createNotificationsForUsers } from '../../services/notificationService';
import ChevronLeft from '../../../assets/icons/chevronleft.svg';
import ShareIcon from '../../../assets/icons/share.svg';
import TrophyIcon from '../../../assets/icons/compete.svg';
import CalendarIcon from '../../../assets/icons/calendar.svg';
import LocationIcon from '../../../assets/icons/location.svg';
import ChevronDownIcon from '../../../assets/icons/chevrondown.svg';
import RulesIcon from '../../../assets/icons/rules.svg';
import VersusIcon from '../../../assets/icons/versus.svg';
import EditIcon from '../../../assets/icons/edit.svg';

export default function MatchDetailsScreen({ navigation, route }) {
  const { match: initialMatch } = route.params;
  const [match, setMatch] = useState(initialMatch);
  const { updateTournament, tournaments, checkAndProgressTournament } = useTournaments();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [rulesExpanded, setRulesExpanded] = useState(false);
  const [showRecordScoreModal, setShowRecordScoreModal] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedHeight, {
      toValue: rulesExpanded ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [rulesExpanded]);

  // Check if current user is tournament host
  const isAdmin = match?.tournamentId && tournaments?.length > 0
    ? tournaments.find(t => t.id === match.tournamentId)?.hostId === user?.uid
    : false;

  // Check if current user is a player in this match
  const isUserMatch = () => {
    if (!match || !user) return false;

    const userId = user.uid;
    const teamA = match.leftTeam || match.team1;
    const teamB = match.rightTeam || match.team2;

    if (!teamA || !teamB) return false;

    return (
      teamA.player1?.id === userId ||
      teamA.player2?.id === userId ||
      teamB.player1?.id === userId ||
      teamB.player2?.id === userId
    );
  };

  // Check if current user can record/edit score for this match
  const canRecordScore = () => {
    // Tournament host can record any match score
    if (isAdmin) return true;

    // Players can only record their own match scores
    if (isUserMatch()) return true;

    // Everyone else cannot record scores
    return false;
  };

  const handleAddToCalendar = async () => {
    try {
      // Request calendar permissions
      const { status } = await Calendar.requestCalendarPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission required',
          'Calendar permission is required to add events.',
          [{ text: 'OK', style: 'cancel' }]
        );
        return;
      }

      // Convert dateTime to Date object if it's a string
      const eventDate = new Date(match.dateTime);
      const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours

      // Get default calendar
      const defaultCalendar = await Calendar.getDefaultCalendarAsync();

      // Create event details
      const eventDetails = {
        title: `${match.tournamentName} - Match`,
        startDate: eventDate,
        endDate: endDate,
        location: match.address ? `${match.location}, ${match.address}` : match.location,
        notes: `Court: ${match.court || 'TBD'}\nStatus: ${match.status}`,
      };

      // Add event to calendar
      const eventId = await Calendar.createEventAsync(defaultCalendar.id, eventDetails);

      if (eventId) {
        Alert.alert(
          'Success',
          'Match added to your calendar',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } catch (error) {
      console.error('Error adding to calendar:', error);
      Alert.alert(
        'Error',
        'Could not add event to calendar. Please try again.',
        [{ text: 'OK', style: 'cancel' }]
      );
    }
  };

  const handleRecordScore = () => {
    setShowRecordScoreModal(true);
  };

  const handleSaveScore = async (scores) => {
    // Validate permissions before saving
    if (!canRecordScore()) {
      showToast('You do not have permission to record this score', 'error');
      return;
    }

    if (!match.tournamentId) {
      showToast('Cannot save score: tournament information missing', 'error');
      return;
    }

    try {
      // Calculate winning team by counting sets won
      let teamAWins = 0;
      let teamBWins = 0;

      scores.forEach(set => {
        const scoreA = parseInt(set.teamA);
        const scoreB = parseInt(set.teamB);
        if (scoreA > scoreB) {
          teamAWins++;
        } else if (scoreB > scoreA) {
          teamBWins++;
        }
      });

      const winningTeam = teamAWins > teamBWins ? 'left' : 'right';

      // Update local state
      const updatedMatch = {
        ...match,
        score: scores,
        scoreRecorded: true,
        winningTeam: winningTeam,
      };
      setMatch(updatedMatch);

      // Get the tournament and update the specific match
      const tournament = tournaments.find(t => t.id === match.tournamentId);

      if (!tournament) {
        throw new Error('Tournament not found');
      }

      // Update matches array - filter out undefined values to avoid Firestore errors
      const updatedMatches = tournament.matches.map(m => {
        if (m.id === match.id) {
          const updatedMatch = { ...m, score: scores, scoreRecorded: true, winningTeam };
          // Remove any undefined fields
          Object.keys(updatedMatch).forEach(key => {
            if (updatedMatch[key] === undefined) {
              delete updatedMatch[key];
            }
          });
          return updatedMatch;
        }
        return m;
      });

      await updateTournament(match.tournamentId, {
        matches: updatedMatches,
      });

      // Check if tournament should progress to next stage
      // Pass the updatedMatches array to avoid race condition with Firestore updates
      await checkAndProgressTournament(match.tournamentId, updatedMatches);

      // Determine if this is adding or updating a score
      const isUpdating = match.scoreRecorded === true;
      const action = isUpdating ? 'score_updated' : 'score_added';
      const actionText = isUpdating ? 'updated' : 'added';

      // Get all 4 players in the match
      const teamA = match.leftTeam || match.team1;
      const teamB = match.rightTeam || match.team2;
      const playerIds = [
        teamA.player1?.id,
        teamA.player2?.id,
        teamB.player1?.id,
        teamB.player2?.id,
      ].filter(id => id && id !== user?.uid); // Exclude the current user

      // Send notifications to all players in the match (except the one who recorded the score)
      if (playerIds.length > 0 && user && tournament) {
        await createNotificationsForUsers(playerIds, {
          type: 'match',
          action,
          title: isUpdating ? 'Score Updated' : 'Score Added',
          message: `${user.displayName || `${user.firstName} ${user.lastName}`} ${actionText} score to your recent match.`,
          metadata: {
            tournamentId: match.tournamentId,
            tournamentName: tournament.name,
            matchId: match.id,
          },
          playerInfo: {
            firstName: user.firstName,
            lastName: user.lastName,
            avatarUri: user.avatarUri,
          },
        });
      }

      showToast('Score recorded successfully!', 'success');
      setShowRecordScoreModal(false);
    } catch (error) {
      console.error('Error saving score:', error);
      showToast('Failed to save score. Please try again.', 'error');
    }
  };

  const handleDirections = () => {
    const address = `${match.location}, ${match.address}`;
    const encodedAddress = encodeURIComponent(address);

    const options = Platform.OS === 'ios'
      ? ['Apple Maps', 'Google Maps', 'Cancel']
      : ['Google Maps', 'Cancel'];

    Alert.alert(
      'Open in maps',
      'Choose your preferred maps app',
      [
        ...(Platform.OS === 'ios' ? [{
          text: 'Apple Maps',
          onPress: () => {
            const appleMapsUrl = `maps://?address=${encodedAddress}`;
            Linking.openURL(appleMapsUrl).catch(err => {
              console.error('Error opening Apple Maps:', err);
              Alert.alert('Error', 'Could not open Apple Maps');
            });
          },
        }] : []),
        {
          text: 'Google Maps',
          onPress: () => {
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
            Linking.openURL(googleMapsUrl).catch(err => {
              console.error('Error opening Google Maps:', err);
              Alert.alert('Error', 'Could not open Google Maps');
            });
          },
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ],
      { cancelable: true }
    );
  };

  const handleShare = async () => {
    try {
      const shareUrl = `https://getsmash.net/match/${match.id}`;
      await Share.share({
        message: `Check out this match from ${match.tournamentName}: ${shareUrl}`,
        url: shareUrl, // iOS uses this field for the preview
        title: `Match: ${match.tournamentName}`, // Android/iOS title
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleEditCourt = () => {
    if (Platform.OS === 'android') {
      showToast('Editing court is currently supported on iOS only', 'info');
      return;
    }

    Alert.prompt(
      'Edit Court',
      'Enter the new court name or number',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Save',
          onPress: async (newCourt) => {
            if (!newCourt || !newCourt.trim()) return;

            try {
              const tournament = tournaments.find(t => t.id === match.tournamentId);
              if (!tournament) throw new Error('Tournament not found');

              const updatedMatches = tournament.matches.map(m => {
                if (m.id === match.id) {
                  const updatedMatch = { ...m, court: newCourt.trim() };
                  // Remove any undefined fields to prevent Firestore errors
                  Object.keys(updatedMatch).forEach(key => {
                    if (updatedMatch[key] === undefined) {
                      delete updatedMatch[key];
                    }
                  });
                  return updatedMatch;
                }
                return m;
              });

              await updateTournament(match.tournamentId, {
                matches: updatedMatches,
              });

              setMatch(prev => ({ ...prev, court: newCourt.trim() }));
              showToast('Court updated successfully', 'success');
            } catch (error) {
              console.error('Error updating court:', error);
              showToast('Failed to update court', 'error');
            }
          },
        },
      ],
      'plain-text',
      match.court ? match.court.replace('Court ', '') : ''
    );
  };

  // Determine match state
  const isPastMatch = match.isPast || false;
  const scoreRecorded = match.scoreRecorded || false;

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ChevronLeft width={32} height={32} color={Colors.primary300} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Match details</Text>

          <TouchableOpacity
            style={styles.headerButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            onPress={handleShare}
            testID="share-button"
          >
            <ShareIcon width={32} height={32} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Teams Card */}
        <Card style={styles.matchCard}>
          {/* Green Winning Indicator */}
          {scoreRecorded && match.winningTeam && (
            <View style={[
              styles.winningIndicator,
              match.winningTeam === 'left' ? styles.winningIndicatorLeft : styles.winningIndicatorRight
            ]} />
          )}

          {/* Team Headers */}
          <View style={styles.teamHeaders}>
            <Text style={styles.teamLabel}>Team A</Text>
            <Text style={styles.teamLabel}>Team B</Text>
          </View>

          {/* Teams Container */}
          <View style={styles.teamsContainer}>
            {/* Team A */}
            <View style={styles.leftTeam}>
              <Team
                player1={match.leftTeam.player1}
                player2={match.leftTeam.player2}
                align="left"
              />
            </View>

            {/* VS Icon or Score Display */}
            {scoreRecorded && match.score ? (
              <View style={styles.scoreContainer}>
                {match.score.map((set, index) => (
                  <React.Fragment key={index}>
                    <Text style={styles.scoreText}>{set.teamA} - {set.teamB}</Text>
                    {index < match.score.length - 1 && <View style={styles.scoreDivider} />}
                  </React.Fragment>
                ))}
              </View>
            ) : (
              <View style={styles.versusContainer}>
                <VersusIcon width={36} height={100} />
              </View>
            )}

            {/* Team B */}
            <View style={styles.rightTeam}>
              <Team
                player1={match.rightTeam.player1}
                player2={match.rightTeam.player2}
                align="right"
              />
            </View>
          </View>

          {/* Divider with Badge */}
          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <View style={styles.badgeContainer}>
              <Badge variant={match.status} label={match.status} />
            </View>
          </View>

          {/* Match Info using DetailsListItem */}
          <View style={styles.infoSection}>
            <DetailsListItem
              icon={<TrophyIcon width={24} height={24} />}
              text={match.tournamentName}
            />
            {/* Date/time hidden for simplicity - still calculated and stored in match.dateTime */}
            {/* <DetailsListItem
              icon={<CalendarIcon width={24} height={24} />}
              text={formatDateTime(match.dateTime)}
            /> */}
          </View>

          {/* Action Button - Add to Calendar OR Record/Edit Score */}
          {!isPastMatch ? (
            <Button
              title="Add to calendar"
              variant="ghost"
              size="large"
              onPress={handleAddToCalendar}
            />
          ) : canRecordScore() ? (
            <Button
              title={scoreRecorded ? "Edit score" : "Add score"}
              variant="ghost"
              size="large"
              onPress={handleRecordScore}
            />
          ) : null}
        </Card>

        {/* Location Card */}
        <Card style={styles.locationCard}>
          <View style={[styles.locationHeader, !isPastMatch && styles.locationHeaderWithButton]}>
            <View style={styles.locationIconWrapper}>
              <LocationIcon width={32} height={32} />
            </View>
            <View style={styles.locationTextContainer}>
              <Text style={styles.locationTitle}>
                {match.location} | {match.court?.includes('Court') ? match.court : `Court: ${match.court || '7'}`}
              </Text>
              <Text style={styles.locationAddress}>{match.address}</Text>
            </View>

            {/* Edit Court Button - Only for Admin */}
            {isAdmin && (
              <TouchableOpacity
                onPress={handleEditCourt}
                style={styles.editButton}
              >
                <EditIcon width={32} height={32} color={Colors.primary300} />
              </TouchableOpacity>
            )}
          </View>
          {/* Only show Directions button for future matches */}
          {!isPastMatch && (
            <Button
              title="Directions"
              variant="accent"
              size="large"
              onPress={handleDirections}
            />
          )}
        </Card>

        {/* Rules Accordion - Same as TournamentDetailsScreen */}
        <Card style={styles.rulesCard}>
          <View style={styles.rulesWrapper}>
            <TouchableOpacity
              style={styles.rulesHeader}
              onPress={() => setRulesExpanded(!rulesExpanded)}
              activeOpacity={0.7}
            >
              <View style={styles.rulesHeaderLeft}>
                <RulesIcon width={24} height={24} />
                <Text style={styles.rulesText}>Rules</Text>
              </View>
              <View style={[
                styles.chevronIcon,
                rulesExpanded && styles.chevronIconExpanded
              ]}>
                <ChevronDownIcon width={24} height={24} />
              </View>
            </TouchableOpacity>

            {match.rules && rulesExpanded && (
              <Animated.View
                style={[
                  styles.rulesContent,
                  {
                    maxHeight: animatedHeight.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 500],
                    }),
                  },
                ]}
              >
                <Text style={styles.rulesContentText}>
                  {match.rules}
                </Text>
              </Animated.View>
            )}
          </View>
        </Card>
      </ScrollView>

      {/* Record Score Modal */}
      <RecordScoreModal
        visible={showRecordScoreModal}
        onClose={() => setShowRecordScoreModal(false)}
        match={match}
        onSave={handleSaveScore}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    height: 56,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerContent: {
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.space2,
  },
  editButton: {
    padding: Spacing.space2,
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.space4,
    paddingBottom: Spacing.space4,
  },
  matchCard: {
    gap: Spacing.space2,
    marginBottom: Spacing.space2,
    position: 'relative',
    overflow: 'hidden',
  },
  winningIndicator: {
    position: 'absolute',
    width: 8,
    height: 120,
    backgroundColor: Colors.success,
    top: 24,
  },
  winningIndicatorLeft: {
    left: 0,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  winningIndicatorRight: {
    right: 0,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  locationCard: {
    marginBottom: Spacing.space2,
  },
  teamHeaders: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.space1,
  },
  teamLabel: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.neutral400,
  },
  teamsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  leftTeam: {
    flex: 1,
  },
  rightTeam: {
    flex: 1,
  },
  versusContainer: {
    marginHorizontal: Spacing.space1,
  },
  scoreContainer: {
    backgroundColor: Colors.background,
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  scoreText: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.primary300,
  },
  scoreDivider: {
    height: 1,
    backgroundColor: Colors.border,
    width: '100%',
    marginVertical: 4,
  },
  dividerContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: Spacing.space4,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    width: '100%',
  },
  badgeContainer: {
    position: 'absolute',
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.space2,
  },
  infoSection: {
    gap: Spacing.space1,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.space3,
  },
  locationHeaderWithButton: {
    marginBottom: Spacing.space3,
  },
  locationIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationTextContainer: {
    flex: 1,
  },
  locationTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.primary300,
    marginBottom: Spacing.space1,
    lineHeight: Typography.body200 * 1.3,
  },
  locationAddress: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.neutral400,
    lineHeight: Typography.body200 * 1.3,
  },
  rulesCard: {
    marginBottom: Spacing.space4,
    padding: Spacing.space3,
  },
  rulesWrapper: {
    margin: -Spacing.space4,
    padding: Spacing.space4,
  },
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rulesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.space2,
  },
  rulesText: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
  },
  chevronIcon: {
    transform: [{ rotate: '0deg' }],
  },
  chevronIconExpanded: {
    transform: [{ rotate: '180deg' }],
  },
  rulesContent: {
    paddingTop: Spacing.space2,
  },
  rulesContentText: {
    fontFamily: 'GeneralSans-Regular',
    fontSize: Typography.body200,
    color: Colors.primary300,
    lineHeight: Typography.body200 * 1.5,
  },
});
