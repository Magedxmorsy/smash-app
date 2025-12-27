import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
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

export default function HomeScreen({ navigation, onCreateTournament }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [showRecordScoreModal, setShowRecordScoreModal] = useState(false);

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

  // Demo match data for next match (future)
  const nextMatch = {
    leftTeam: {
      player1: {
        firstName: 'Ahmed',
        lastName: 'Basyouni',
        avatarSource: require('../../../assets/avatars/ahmed.jpg'),
      },
      player2: {
        firstName: 'Leo',
        lastName: 'Miguele',
        avatarSource: require('../../../assets/avatars/leo.jpg'),
      },
    },
    rightTeam: {
      player1: {
        firstName: 'Omar',
        lastName: 'Ibrahim',
        avatarSource: require('../../../assets/avatars/omar.jpg'),
      },
      player2: {
        firstName: 'Karim',
        lastName: 'Omar',
        avatarSource: require('../../../assets/avatars/karim.jpg'),
      },
    },
    tournamentName: 'Amsterdam Spring Championship',
    status: 'GROUP STAGE',
    dateTime: new Date('2025-12-15T16:00:00'),
    location: 'Padeldam Amsterdam',
    address: 'Tom Schreursweg 16, 1067 MC Amsterdam, Netherlands',
    court: '5',
    rules: 'Best of 3 sets. Each set is played to 6 games with a 2-game advantage required.',
    isPast: false,
  };

  // Demo match data for last match (past)
  const [lastMatch, setLastMatch] = useState({
    leftTeam: {
      player1: {
        firstName: 'Ahmed',
        lastName: 'Basyouni',
        avatarSource: require('../../../assets/avatars/ahmed.jpg'),
      },
      player2: {
        firstName: 'Leo',
        lastName: 'Miguele',
        avatarSource: require('../../../assets/avatars/leo.jpg'),
      },
    },
    rightTeam: {
      player1: {
        firstName: 'Omar',
        lastName: 'Ibrahim',
        avatarSource: require('../../../assets/avatars/omar.jpg'),
      },
      player2: {
        firstName: 'Karim',
        lastName: 'Omar',
        avatarSource: require('../../../assets/avatars/karim.jpg'),
      },
    },
    tournamentName: 'Rotterdam Winter Cup',
    status: 'QUARTER FINALS',
    dateTime: new Date('2025-11-28T14:00:00'),
    location: 'PadelPoints Rotterdam',
    address: 'Sportlaan 50, 3071 AG Rotterdam, Netherlands',
    court: '3',
    rules: 'Best of 3 sets. Each set is played to 6 games with a 2-game advantage required.',
    isPast: true,
    scoreRecorded: false, // Score not yet recorded
  });

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
        {/* Next Match Section */}
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
          />
        </UpcomingMatchWrapper>

        {/* Last Match Section */}
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
        />
      </ScrollView>

      <CreateTournamentModal
        visible={modalVisible}
        onClose={handleCloseModal}
        onTournamentCreated={(tournament) => {
          // Could navigate to tournament or just show success
          console.log('Tournament created:', tournament);
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