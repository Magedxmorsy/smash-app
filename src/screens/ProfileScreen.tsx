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
  Avatar,
  Card,
  Button,
  SegmentedButtons,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import { Tournament, TournamentStatus } from '../types';
import { getUserTournaments } from '../services/tournamentService';
import { COLORS, STATUS_COLORS, STATUS_LABELS } from '../constants';
import { formatMatchDate } from '../utils/matchUtils';

export const ProfileScreen: React.FC<{ navigation: any }> = ({
  navigation,
}) => {
  const { user, logOut } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('joined');

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

  const onRefresh = () => {
    setRefreshing(true);
    loadTournaments();
  };

  const handleLogout = async () => {
    await logOut();
  };

  const createdTournaments = tournaments.filter(
    (t) => t.creatorId === user?.id
  );
  const joinedTournaments = tournaments;

  const displayTournaments =
    selectedTab === 'joined' ? joinedTournaments : createdTournaments;

  const renderTournamentItem = (tournament: Tournament) => (
    <TouchableOpacity
      key={tournament.id}
      onPress={() =>
        navigation.navigate('TournamentDetail', {
          tournamentId: tournament.id,
        })
      }
    >
      <Card style={styles.tournamentItem}>
        <Card.Content>
          <View style={styles.tournamentHeader}>
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
          <Text style={styles.tournamentDate}>
            {formatMatchDate(tournament.dateTime)}
          </Text>
          {tournament.status === TournamentStatus.COMPLETED &&
            tournament.winners && (
              <Text style={styles.resultText}>
                🥇 {tournament.winners.first.name}
              </Text>
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

  if (!user) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <Avatar.Text
            size={80}
            label={user.displayName.substring(0, 2).toUpperCase()}
            style={styles.avatar}
          />
          <Title style={styles.displayName}>{user.displayName}</Title>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.stats.tournamentsPlayed}</Text>
            <Text style={styles.statLabel}>Tournaments</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.stats.tournamentTrophies}</Text>
            <Text style={styles.statLabel}>Trophies 🏆</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.stats.matchesPlayed}</Text>
            <Text style={styles.statLabel}>Matches</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.stats.matchesWon}</Text>
            <Text style={styles.statLabel}>Won</Text>
          </View>
        </View>
      </View>

      <View style={styles.segmentedControl}>
        <SegmentedButtons
          value={selectedTab}
          onValueChange={setSelectedTab}
          buttons={[
            { value: 'joined', label: 'Joined' },
            { value: 'created', label: 'Created' },
          ]}
        />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {displayTournaments.length > 0 ? (
          displayTournaments.map(renderTournamentItem)
        ) : (
          <Card style={styles.emptyCard}>
            <Card.Content>
              <Text style={styles.emptyText}>
                {selectedTab === 'joined'
                  ? 'No tournaments joined yet'
                  : 'No tournaments created yet'}
              </Text>
            </Card.Content>
          </Card>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
        >
          Logout
        </Button>
      </View>
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
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  profileHeader: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  avatar: {
    backgroundColor: COLORS.primary,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
  },
  email: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  segmentedControl: {
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  tournamentItem: {
    marginBottom: 12,
    elevation: 1,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tournamentName: {
    fontSize: 16,
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
  tournamentDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  resultText: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 4,
    fontWeight: '600',
  },
  emptyCard: {
    elevation: 1,
    marginTop: 40,
  },
  emptyText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  footer: {
    padding: 16,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  logoutButton: {
    borderColor: COLORS.error,
  },
});
