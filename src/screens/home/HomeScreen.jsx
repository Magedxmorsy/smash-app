import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, Animated } from 'react-native';
import * as Calendar from 'expo-calendar';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { formatDateTime } from '../../utils/dateFormatter';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import MobileHeader from '../../components/ui/MobileHeader';
import CreateTournamentModal from '../../components/tournament/CreateTournamentModal';
import MatchCard from '../../components/match/MatchCard';
import UpcomingMatchWrapper from '../../components/match/UpcomingMatchWrapper';
import RecordScoreModal from '../../components/match/RecordScoreModal';
import { useAuth } from '../../contexts/AuthContext';

export default function HomeScreen({ navigation, onCreateTournament }) {
  const { user } = useAuth();
  const [modalVisible, setModalVisible] = useState(false);
  const [showRecordScoreModal, setShowRecordScoreModal] = useState(false);

  // Animation for "Your last match" section
  const lastMatchSlideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    // Animate after 80ms (after the first match card)
    Animated.timing(lastMatchSlideAnim, {
      toValue: 0,
      duration: 350,
      delay: 80, // Same as second card's delay
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCreateTournament = () => {
    if (onCreateTournament) {
      // Pass the action to execute after auth (opening the modal)
      onCreateTournament(() => setModalVisible(true));
    } else {
      // If no callback provided, open modal directly (for authenticated users)
      setModalVisible(true);
    }
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };

  const handleAddScore = () => {
    setShowRecordScoreModal(true);
  };

  const handleSaveScore = (scores) => {
    console.log('Saved scores:', scores);

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

    // Update lastMatch with scores and winning team
    setLastMatch({
      ...lastMatch,
      score: scores,
      scoreRecorded: true,
      winningTeam: winningTeam,
    });

    // TODO: Save scores to database
  };

  const handleAddToCalendar = async () => {
    try {
      // Request calendar permissions
      const { status } = await Calendar.requestCalendarPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Calendar permission is required to add events.',
          [{ text: 'OK', style: 'cancel' }]
        );
        return;
      }

      // Convert dateTime to Date object (handles all formats)
      const eventDate = new Date(nextMatch.dateTime);
      const endDate = new Date(eventDate.getTime() + 2 * 60 * 60 * 1000); // Add 2 hours

      // Get default calendar
      const defaultCalendar = await Calendar.getDefaultCalendarAsync();

      // Create event details
      const eventDetails = {
        title: `${nextMatch.tournamentName} - Match`,
        startDate: eventDate,
        endDate: endDate,
        location: `${nextMatch.location}, ${nextMatch.address}`,
        notes: `Court: ${nextMatch.court}\nStatus: ${nextMatch.status}`,
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

  const handleMatchPress = (match) => {
    // Convert Date object to ISO string for navigation
    const serializableMatch = {
      ...match,
      dateTime: match.dateTime instanceof Date ? match.dateTime.toISOString() : match.dateTime,
    };
    navigation.navigate('MatchDetails', { match: serializableMatch });
  };

  // TODO: Fetch real match data from Firestore
  // For now, no dummy data shown in production
  const nextMatch = null;
  const [lastMatch, setLastMatch] = useState(null);

  return (
    <View style={styles.container}>
      <MobileHeader
        showLogo={true}
        rightIcon={true}
        onRightPress={handleCreateTournament}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 + Spacing.space4 }]}
        showsVerticalScrollIndicator={false}
      >
        {!nextMatch && !lastMatch ? (
          <EmptyState
            imageSource={require('../../../assets/empty-state-tournament.png')}
            headline="No matches yet"
            body="Join or create a tournament to start playing matches"
            button={
              <Button
                title="Create tournament"
                onPress={handleCreateTournament}
                variant="primary"
                fullWidth={false}
              />
            }
          />
        ) : (
          <>
            {/* Next Match Section */}
            {nextMatch && (
              <UpcomingMatchWrapper>
                <MatchCard
                  variant="before"
                  leftTeam={nextMatch.leftTeam}
                  rightTeam={nextMatch.rightTeam}
                  tournamentName={nextMatch.tournamentName}
                  status={nextMatch.status}
                  dateTime={nextMatch.dateTime}
                  location={nextMatch.location}
                  court={nextMatch.court}
                  isPast={nextMatch.isPast}
                  highlightBorder={true}
                  onAddToCalendar={handleAddToCalendar}
                  onPress={() => handleMatchPress(nextMatch)}
                  animationIndex={0}
                />
              </UpcomingMatchWrapper>
            )}

            {/* Last Match Section */}
            {lastMatch && (
              <Animated.View
                style={{
                  transform: [{ translateY: lastMatchSlideAnim }],
                }}
              >
                <Text style={[styles.sectionTitle, styles.lastMatchTitle]}>Your last match</Text>
                <MatchCard
                  variant="after"
                  leftTeam={lastMatch.leftTeam}
                  rightTeam={lastMatch.rightTeam}
                  tournamentName={lastMatch.tournamentName}
                  status={lastMatch.status}
                  dateTime={lastMatch.dateTime}
                  location={lastMatch.location}
                  isPast={lastMatch.isPast}
                  score={lastMatch.score}
                  scoreRecorded={lastMatch.scoreRecorded}
                  onAddScore={handleAddScore}
                  onPress={() => handleMatchPress(lastMatch)}
                  animationIndex={null}
                />
              </Animated.View>
            )}
          </>
        )}
      </ScrollView>

      <CreateTournamentModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onTournamentCreated={(tournament) => {
          // Close modal first
          setModalVisible(false);

          // Then navigate to the newly created tournament in Compete tab
          if (tournament?.id) {
            // First get the root navigation (tab navigator)
            const rootNavigation = navigation.getParent();
            if (rootNavigation) {
              // Navigate to CompeteTab, then to TournamentDetails screen
              rootNavigation.navigate('CompeteTab', {
                screen: 'TournamentDetails',
                params: { tournamentId: tournament.id }
              });
            }
          }
        }}
      />

      <RecordScoreModal
        visible={showRecordScoreModal}
        onClose={() => setShowRecordScoreModal(false)}
        match={lastMatch}
        onSave={handleSaveScore}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.space4,
  },
  sectionTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body200,
    color: Colors.primary300,
    marginBottom: Spacing.space3,
  },
  lastMatchTitle: {
    marginTop: Spacing.space5,
  },
});