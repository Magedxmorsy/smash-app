import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  Text,
  Chip,
  Button,
  Card,
  ActivityIndicator,
  SegmentedButtons,
  DataTable,
} from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import {
  Tournament,
  TournamentStatus,
  Team,
  Match,
  Group,
} from '../types';
import {
  getTournament,
  startTournament as startTournamentService,
} from '../services/tournamentService';
import { getTournamentTeams, createTeam, joinTeam as joinTeamService, isUserInTournament } from '../services/teamService';
import { getTournamentMatches } from '../services/matchService';
import { COLORS, STATUS_COLORS, STATUS_LABELS, TEAM_SIZE } from '../constants';
import { formatMatchDate, formatMatchTime } from '../utils/matchUtils';

export const TournamentDetailScreen: React.FC<{
  navigation: any;
  route: any;
}> = ({ navigation, route }) => {
  const { tournamentId } = route.params;
  const { user } = useAuth();
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('groups');
  const [userInTournament, setUserInTournament] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const loadTournamentData = async () => {
    try {
      const [tournamentData, teamsData, matchesData] = await Promise.all([
        getTournament(tournamentId),
        getTournamentTeams(tournamentId),
        getTournamentMatches(tournamentId),
      ]);

      if (tournamentData) {
        setTournament(tournamentData);
      }
      setTeams(teamsData);
      setMatches(matchesData);

      if (user) {
        const inTournament = await isUserInTournament(tournamentId, user.id);
        setUserInTournament(inTournament);
      }
    } catch (error) {
      console.error('Error loading tournament:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTournamentData();
  }, [tournamentId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadTournamentData();
  };

  const handleJoinTeam = async (teamId: string) => {
    if (!user) return;

    setActionLoading(true);
    try {
      await joinTeamService(teamId, {
        userId: user.id,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });

      Alert.alert('Success', 'You joined the team!');
      loadTournamentData();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCreateNewTeam = async () => {
    if (!user) return;

    setActionLoading(true);
    try {
      await createTeam(tournamentId, {
        userId: user.id,
        displayName: user.displayName,
        photoURL: user.photoURL,
      });

      Alert.alert('Success', 'You created a new team!');
      loadTournamentData();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStartTournament = () => {
    Alert.alert(
      'Start Tournament',
      'Generate matches and lock registration?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            setActionLoading(true);
            try {
              await startTournamentService(tournamentId);
              Alert.alert('Success', 'Tournament started!');
              loadTournamentData();
            } catch (error: any) {
              Alert.alert('Error', error.message);
            } finally {
              setActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderTeamCard = (team: Team) => {
    const isComplete = team.players.length === TEAM_SIZE;
    const canJoin = !userInTournament && !isComplete;

    return (
      <Card key={team.id} style={styles.teamCard}>
        <Card.Content>
          <View style={styles.teamHeader}>
            <Text style={styles.teamName}>{team.name}</Text>
            {isComplete && <Chip mode="flat" style={styles.readyChip}>Ready</Chip>}
          </View>

          {team.players.map((player, index) => (
            <View key={index} style={styles.playerRow}>
              <Text style={styles.playerName}>{player.displayName}</Text>
            </View>
          ))}

          {!isComplete && (
            <View style={styles.emptySlot}>
              {canJoin ? (
                <Button
                  mode="outlined"
                  onPress={() => handleJoinTeam(team.id)}
                  disabled={actionLoading}
                  compact
                >
                  Join Team
                </Button>
              ) : (
                <Text style={styles.emptySlotText}>Waiting for player...</Text>
              )}
            </View>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderGroupsTab = () => {
    if (tournament?.status === TournamentStatus.REGISTRATION_OPEN) {
      return (
        <View style={styles.teamsSection}>
          <Text style={styles.sectionTitle}>
            Teams: {teams.length} / {tournament.numberOfTeams}
          </Text>

          {teams.map(renderTeamCard)}

          {!userInTournament && teams.length < tournament.numberOfTeams && (
            <Button
              mode="contained"
              onPress={handleCreateNewTeam}
              style={styles.createTeamButton}
              disabled={actionLoading}
            >
              Create New Team
            </Button>
          )}

          {tournament.creatorId === user?.id &&
            teams.length === tournament.numberOfTeams &&
            teams.every((t) => t.players.length === TEAM_SIZE) && (
              <Button
                mode="contained"
                onPress={handleStartTournament}
                style={styles.startButton}
                disabled={actionLoading}
              >
                Start Tournament
              </Button>
            )}
        </View>
      );
    }

    // Group stage or later - show groups and standings
    return (
      <View style={styles.groupsSection}>
        {tournament?.groups?.map((groupId) => {
          const groupTeams = teams.filter((t) => t.groupId === groupId);
          return (
            <Card key={groupId} style={styles.groupCard}>
              <Card.Content>
                <Text style={styles.groupName}>Group {groupId.split('-')[1]}</Text>
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title>Team</DataTable.Title>
                    <DataTable.Title numeric>P</DataTable.Title>
                    <DataTable.Title numeric>W</DataTable.Title>
                    <DataTable.Title numeric>D</DataTable.Title>
                    <DataTable.Title numeric>L</DataTable.Title>
                    <DataTable.Title numeric>Pts</DataTable.Title>
                  </DataTable.Header>

                  {groupTeams
                    .sort((a, b) => (b.stats?.points || 0) - (a.stats?.points || 0))
                    .map((team) => (
                      <DataTable.Row key={team.id}>
                        <DataTable.Cell>{team.name}</DataTable.Cell>
                        <DataTable.Cell numeric>{team.stats?.played || 0}</DataTable.Cell>
                        <DataTable.Cell numeric>{team.stats?.won || 0}</DataTable.Cell>
                        <DataTable.Cell numeric>{team.stats?.drawn || 0}</DataTable.Cell>
                        <DataTable.Cell numeric>{team.stats?.lost || 0}</DataTable.Cell>
                        <DataTable.Cell numeric>
                          <Text style={styles.pointsText}>{team.stats?.points || 0}</Text>
                        </DataTable.Cell>
                      </DataTable.Row>
                    ))}
                </DataTable>
              </Card.Content>
            </Card>
          );
        })}
      </View>
    );
  };

  const renderMatchesTab = () => {
    const groupedMatches = matches.reduce((acc, match) => {
      const round = match.round;
      if (!acc[round]) {
        acc[round] = [];
      }
      acc[round].push(match);
      return acc;
    }, {} as Record<string, Match[]>);

    return (
      <View style={styles.matchesSection}>
        {Object.entries(groupedMatches).map(([round, roundMatches]) => (
          <View key={round} style={styles.roundSection}>
            <Text style={styles.roundTitle}>
              {round.replace(/_/g, ' ').toUpperCase()}
            </Text>
            {roundMatches.map((match) => (
              <Card key={match.id} style={styles.matchCard}>
                <Card.Content>
                  <View style={styles.matchTeams}>
                    <View style={styles.matchTeam}>
                      <Text style={styles.matchTeamName}>{match.teamA.name}</Text>
                      <Text style={styles.matchPlayers}>
                        {match.teamA.players.map((p) => p.displayName).join(', ')}
                      </Text>
                    </View>

                    {match.result ? (
                      <Text style={styles.matchScore}>
                        {match.result.teamAScore} - {match.result.teamBScore}
                      </Text>
                    ) : (
                      <Text style={styles.vs}>vs</Text>
                    )}

                    <View style={styles.matchTeam}>
                      <Text style={styles.matchTeamName}>{match.teamB.name}</Text>
                      <Text style={styles.matchPlayers}>
                        {match.teamB.players.map((p) => p.displayName).join(', ')}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.matchFooter}>
                    <Text style={styles.matchDateTime}>
                      {formatMatchDate(match.dateTime)} • {formatMatchTime(match.dateTime)}
                    </Text>
                    <Chip mode="flat" style={styles.matchStatusChip}>
                      {match.status.replace(/_/g, ' ').toUpperCase()}
                    </Chip>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        ))}
      </View>
    );
  };

  const renderDetailsTab = () => (
    <View style={styles.detailsSection}>
      <Card style={styles.infoCard}>
        <Card.Content>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Location:</Text>
            <Text style={styles.infoValue}>{tournament?.location}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date & Time:</Text>
            <Text style={styles.infoValue}>
              {tournament && formatMatchDate(tournament.dateTime)} •{' '}
              {tournament && formatMatchTime(tournament.dateTime)}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Format:</Text>
            <Text style={styles.infoValue}>{tournament?.format.replace(/_/g, ' ').toUpperCase()}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Teams:</Text>
            <Text style={styles.infoValue}>{tournament?.numberOfTeams}</Text>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.rulesTitle}>Rules</Text>
          <Text style={styles.rulesText}>{tournament?.rules}</Text>
        </Card.Content>
      </Card>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!tournament) {
    return (
      <View style={styles.centerContainer}>
        <Text>Tournament not found</Text>
      </View>
    );
  }

  const showTabs = tournament.status !== TournamentStatus.REGISTRATION_OPEN;

  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Tournament Header */}
        <Image source={{ uri: tournament.photoURL }} style={styles.coverImage} />

        <View style={styles.headerInfo}>
          <View style={styles.titleRow}>
            <Text style={styles.tournamentTitle}>{tournament.name}</Text>
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
        </View>

        {/* Tabs */}
        {showTabs && (
          <View style={styles.tabsContainer}>
            <SegmentedButtons
              value={selectedTab}
              onValueChange={setSelectedTab}
              buttons={[
                { value: 'groups', label: 'Groups' },
                { value: 'matches', label: 'Matches' },
                { value: 'details', label: 'Details' },
              ]}
            />
          </View>
        )}

        {/* Content */}
        <View style={styles.content}>
          {showTabs ? (
            <>
              {selectedTab === 'groups' && renderGroupsTab()}
              {selectedTab === 'matches' && renderMatchesTab()}
              {selectedTab === 'details' && renderDetailsTab()}
            </>
          ) : (
            <>
              {renderDetailsTab()}
              {renderGroupsTab()}
            </>
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
  coverImage: {
    width: '100%',
    height: 200,
  },
  headerInfo: {
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tournamentTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 12,
  },
  statusChip: {
    height: 28,
  },
  statusChipText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  tabsContainer: {
    padding: 16,
    backgroundColor: COLORS.surface,
  },
  content: {
    padding: 16,
  },
  teamsSection: {},
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  teamCard: {
    marginBottom: 12,
    elevation: 1,
  },
  teamHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  readyChip: {
    backgroundColor: COLORS.success,
  },
  playerRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  playerName: {
    fontSize: 14,
  },
  emptySlot: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptySlotText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  createTeamButton: {
    marginTop: 16,
  },
  startButton: {
    marginTop: 16,
    backgroundColor: COLORS.success,
  },
  groupsSection: {},
  groupCard: {
    marginBottom: 16,
    elevation: 1,
  },
  groupName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  pointsText: {
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  matchesSection: {},
  roundSection: {
    marginBottom: 24,
  },
  roundTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    color: COLORS.textSecondary,
  },
  matchCard: {
    marginBottom: 12,
    elevation: 1,
  },
  matchTeams: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  matchTeam: {
    flex: 1,
  },
  matchTeamName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  matchPlayers: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  vs: {
    fontSize: 12,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginHorizontal: 12,
  },
  matchScore: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 12,
  },
  matchFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  matchDateTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  matchStatusChip: {
    height: 24,
    backgroundColor: COLORS.info,
  },
  detailsSection: {},
  infoCard: {
    marginBottom: 16,
    elevation: 1,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.text,
  },
  rulesTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  rulesText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
});
