import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Text,
  Title,
  Card,
  FAB,
  Chip,
  ActivityIndicator,
  SegmentedButtons,
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { Tournament, TournamentStatus } from '../types';
import { getUserTournaments } from '../services/tournamentService';
import { COLORS, STATUS_COLORS, STATUS_LABELS } from '../constants';
import { formatMatchDate } from '../utils/matchUtils';

export const CompeteScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('ongoing');

  const loadTournaments = async () => {
    if (!user) return;

    try {
      const userTournaments = await getUserTournaments(user.id);
      setTournaments(userTournaments);
    } catch (error) {
      console.error('Error loading tournaments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTournaments();
  }, [user]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadTournaments();
    });

    return unsubscribe;
  }, [navigation]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTournaments();
  };

  const handleCreateTournament = () => {
    navigation.navigate('CreateTournament');
  };

  const filteredTournaments = tournaments.filter((tournament) => {
    if (selectedTab === 'ongoing') {
      return tournament.status !== TournamentStatus.COMPLETED;
    } else {
      return tournament.status === TournamentStatus.COMPLETED;
    }
  });

  const renderTournamentCard = (tournament: Tournament) => (
    <TouchableOpacity
      key={tournament.id}
      onPress={() =>
        navigation.navigate('TournamentDetail', {
          tournamentId: tournament.id,
        })
      }
    >
      <Card style={styles.tournamentCard}>
        <Card.Cover
          source={{ uri: tournament.photoURL }}
          style={styles.cardCover}
        />
        <Card.Content style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.tournamentName} numberOfLines={1}>
              {tournament.name}
            </Text>
            <Chip
              mode="flat"
              style={[
                styles.statusChip,
                { backgroundColor: STATUS_COLORS[tournament.status] },
              ]}
              textStyle={styles.statusChipText}
            >
              {STATUS_LABELS[tournament.status]}
            </Chip>
          </View>

          <View style={styles.tournamentInfo}>
            <Text style={styles.infoText}>📍 {tournament.location}</Text>
            <Text style={styles.infoText}>
              📅 {formatMatchDate(tournament.dateTime)}
            </Text>
            <Text style={styles.infoText}>
              👥 {tournament.numberOfTeams} Teams
            </Text>
          </View>
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
        <Title style={styles.headerTitle}>Compete</Title>
      </View>

      <View style={styles.segmentedControl}>
        <SegmentedButtons
          value={selectedTab}
          onValueChange={setSelectedTab}
          buttons={[
            { value: 'ongoing', label: 'Ongoing' },
            { value: 'completed', label: 'Completed' },
          ]}
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredTournaments.length > 0 ? (
          filteredTournaments.map(renderTournamentCard)
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                {selectedTab === 'ongoing'
                  ? 'No ongoing tournaments'
                  : 'No completed tournaments'}
              </Text>
              {selectedTab === 'ongoing' && (
                <Text style={styles.emptySubtext}>
                  Create a new tournament to get started!
                </Text>
              )}
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={handleCreateTournament}
        label="Create Tournament"
      />
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
  segmentedControl: {
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tournamentCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardCover: {
    height: 150,
  },
  cardContent: {
    paddingTop: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  tournamentName: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  statusChip: {
    height: 24,
  },
  statusChipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  tournamentInfo: {
    gap: 4,
  },
  infoText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  emptyCard: {
    elevation: 1,
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  emptySubtext: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 14,
    marginTop: 8,
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    backgroundColor: COLORS.primary,
  },
});
