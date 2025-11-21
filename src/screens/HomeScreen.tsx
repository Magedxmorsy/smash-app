import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Text, Title, Card, Chip, ActivityIndicator } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { Match } from '../types';
import {
  getUserUpcomingMatches,
  getUserRecentResults,
} from '../services/matchService';
import { COLORS } from '../constants';
import { formatMatchDate, formatMatchTime } from '../utils/matchUtils';

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth();
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [recentResults, setRecentResults] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    if (!user) return;

    try {
      const [upcoming, recent] = await Promise.all([
        getUserUpcomingMatches(user.id),
        getUserRecentResults(user.id),
      ]);

      setUpcomingMatches(upcoming);
      setRecentResults(recent);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const renderMatchCard = (match: Match, isResult: boolean = false) => (
    <TouchableOpacity
      key={match.id}
      onPress={() =>
        navigation.navigate('TournamentDetail', { tournamentId: match.tournamentId })
      }
    >
      <Card style={styles.matchCard}>
        <Card.Content>
          <View style={styles.matchHeader}>
            <Text style={styles.matchRound}>{match.round.replace(/_/g, ' ').toUpperCase()}</Text>
            {isResult && match.result && (
              <Chip
                mode="flat"
                style={styles.resultChip}
                textStyle={styles.resultChipText}
              >
                {match.result.winner === 'draw'
                  ? 'DRAW'
                  : match.result.winner === 'teamA'
                  ? 'WIN'
                  : 'LOSS'}
              </Chip>
            )}
          </View>

          <View style={styles.matchTeams}>
            <View style={styles.team}>
              <Text style={styles.teamName}>{match.teamA.name}</Text>
              <Text style={styles.players}>
                {match.teamA.players.map((p) => p.displayName).join(', ')}
              </Text>
            </View>

            <Text style={styles.vs}>vs</Text>

            <View style={styles.team}>
              <Text style={styles.teamName}>{match.teamB.name}</Text>
              <Text style={styles.players}>
                {match.teamB.players.map((p) => p.displayName).join(', ')}
              </Text>
            </View>
          </View>

          {isResult && match.result ? (
            <View style={styles.scoreContainer}>
              <Text style={styles.score}>
                {match.result.teamAScore} - {match.result.teamBScore}
              </Text>
            </View>
          ) : (
            <View style={styles.matchInfo}>
              <Text style={styles.matchDate}>{formatMatchDate(match.dateTime)}</Text>
              <Text style={styles.matchTime}>{formatMatchTime(match.dateTime)}</Text>
            </View>
          )}
        </Card.Content>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Title style={styles.headerTitle}>Home</Title>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Upcoming Matches */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Matches</Text>
          {upcomingMatches.length > 0 ? (
            upcomingMatches.slice(0, 3).map((match) => renderMatchCard(match))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>No upcoming matches</Text>
              </Card.Content>
            </Card>
          )}
        </View>

        {/* Recent Results */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Results</Text>
          {recentResults.length > 0 ? (
            recentResults.slice(0, 5).map((match) => renderMatchCard(match, true))
          ) : (
            <Card style={styles.emptyCard}>
              <Card.Content>
                <Text style={styles.emptyText}>No recent results</Text>
              </Card.Content>
            </Card>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: COLORS.surface,
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  matchCard: {
    marginBottom: 12,
    elevation: 2,
  },
  matchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  matchRound: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  resultChip: {
    backgroundColor: COLORS.primary,
  },
  resultChipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  team: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  players: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  vs: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginHorizontal: 12,
  },
  matchInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  matchDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  matchTime: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  scoreContainer: {
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  emptyCard: {
    elevation: 1,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
