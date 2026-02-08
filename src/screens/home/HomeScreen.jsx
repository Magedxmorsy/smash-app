import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Alert, Animated } from 'react-native';
import * as Calendar from 'expo-calendar';
import { Colors } from '../../constants/Colors';
import { Spacing } from '../../constants/Spacing';
import { formatDateTime } from '../../utils/dateFormatter';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import MobileHeader from '../../components/ui/MobileHeader';
import CreateTournamentModal from '../../components/tournament/CreateTournamentModal';
import MatchCard from '../../components/match/MatchCard';
import UpcomingMatchWrapper from '../../components/match/UpcomingMatchWrapper';
import LastMatchWrapper from '../../components/match/LastMatchWrapper';
import RecordScoreModal from '../../components/match/RecordScoreModal';
import { useAuth } from '../../contexts/AuthContext';
import { useTournaments } from '../../contexts/TournamentContext';

export default function HomeScreen({ navigation, onCreateTournament }) {
  const { userData } = useAuth();
  const { tournaments, updateTournament, checkAndProgressTournament } = useTournaments();
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

  const handleSaveScore = async (scores) => {
    if (!lastMatch?.tournamentId || !lastMatch?.id) {
      console.error('Cannot save score: match or tournament information missing');
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

      // Update local state immediately for responsive UI
      setLastMatch({
        ...lastMatch,
        score: scores,
        scoreRecorded: true,
        winningTeam: winningTeam,
      });

      // Find the tournament and update the match in database
      const tournament = tournaments.find(t => t.id === lastMatch.tournamentId);
      if (!tournament) {
        console.error('Tournament not found');
        return;
      }

      // Update matches array
      const updatedMatches = tournament.matches.map(m => {
        if (m.id === lastMatch.id) {
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

      await updateTournament(lastMatch.tournamentId, {
        matches: updatedMatches,
      });

      // Check if tournament should progress to next stage
      await checkAndProgressTournament(lastMatch.tournamentId, updatedMatches);
    } catch (error) {
      console.error('Error saving score:', error);
    }
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

  // Get user's matches from tournaments
  const getUserMatches = () => {
    if (!userData?.uid || !tournaments || tournaments.length === 0) {
      return { nextMatch: null, lastMatch: null };
    }

    const currentTime = new Date();
    const userMatches = [];

    // Extract all matches where user is a participant
    tournaments.forEach(tournament => {
      if (!tournament.matches || tournament.matches.length === 0) return;

      tournament.matches.forEach(match => {
        // Check if user is in either team
        const isInTeam1 =
          match.team1?.player1?.userId === userData.uid ||
          match.team1?.player2?.userId === userData.uid;
        const isInTeam2 =
          match.team2?.player1?.userId === userData.uid ||
          match.team2?.player2?.userId === userData.uid;

        if (isInTeam1 || isInTeam2) {
          // Convert match to MatchCard format
          userMatches.push({
            ...match,
            tournamentName: tournament.name,
            leftTeam: match.team1,
            rightTeam: match.team2,
            isPast: match.scoreRecorded || (match.dateTime && new Date(match.dateTime) < currentTime),
          });
        }
      });
    });

    // Sort matches by date
    userMatches.sort((a, b) => {
      const dateA = a.dateTime ? new Date(a.dateTime) : new Date(0);
      const dateB = b.dateTime ? new Date(b.dateTime) : new Date(0);
      return dateA - dateB;
    });

    // Find next upcoming match (future match, not yet played)
    const upcomingMatches = userMatches.filter(m =>
      !m.scoreRecorded &&
      m.dateTime &&
      new Date(m.dateTime) >= currentTime
    );
    const nextMatch = upcomingMatches.length > 0 ? upcomingMatches[0] : null;

    // Find last played match (most recent past match or scored match)
    const pastMatches = userMatches.filter(m =>
      m.scoreRecorded ||
      (m.dateTime && new Date(m.dateTime) < currentTime)
    );
    const lastMatch = pastMatches.length > 0 ? pastMatches[pastMatches.length - 1] : null;

    return { nextMatch, lastMatch };
  };

  const { nextMatch, lastMatch: initialLastMatch } = getUserMatches();
  const [lastMatch, setLastMatch] = useState(initialLastMatch);

  // Update lastMatch when tournaments change
  useEffect(() => {
    const { lastMatch: updatedLastMatch } = getUserMatches();
    setLastMatch(updatedLastMatch);
  }, [tournaments, userData?.uid]);

  return (
    <View style={styles.container}>
      <MobileHeader
        showLogo={true}
        rightIcon={true}
        onRightPress={handleCreateTournament}
      />

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 60 + Spacing.space4 },
          !nextMatch && !lastMatch && styles.emptyStateContainer
        ]}
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
                  showBadge={false}
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
                  marginTop: Spacing.space5,
                }}
              >
                <LastMatchWrapper>
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
                </LastMatchWrapper>
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

          // Navigate to Compete tab to see the newly created tournament
          if (tournament?.id) {
            // Wait for modal close animation to complete before navigating
            setTimeout(() => {
              const rootNavigation = navigation.getParent();
              if (rootNavigation) {
                // Just switch to CompeteTab - user can click the tournament to see details
                rootNavigation.navigate('CompeteTab');
              }
            }, 400);
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
  emptyStateContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});