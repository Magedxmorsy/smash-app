import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Colors } from '../../constants/Colors';
import { Typography } from '../../constants/Typography';
import { Spacing } from '../../constants/Spacing';
import { useAuth } from '../../contexts/AuthContext';
import { useTournaments } from '../../contexts/TournamentContext';
import { calculatePlayerStats } from '../../utils/statsCalculator';
import TournamentCard from '../../components/tournament/TournamentCard';
import MobileHeader from '../../components/ui/MobileHeader';
import TabSelector from '../../components/ui/TabSelector';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import EditProfileModal from '../../components/profile/EditProfileModal';
import SettingsIcon from '../../../assets/icons/settings.svg';
import EditIcon from '../../../assets/icons/edit.svg';

export default function ProfileScreen({ navigation, onCreateAccount }) {
  const { userData, isAuthenticated } = useAuth();
  const { tournaments: allTournaments, getHostedTournaments, getJoinedTournaments } = useTournaments();
  const [activeTab, setActiveTab] = useState('Hosted');
  const [showEditModal, setShowEditModal] = useState(false);

  // Calculate real player stats from tournaments
  const playerStats = useMemo(() => {
    if (!userData?.uid || !allTournaments) {
      return {
        tournamentsPlayed: 0,
        trophiesWon: 0,
        matchesWon: 0,
        matchesPlayed: 0,
      };
    }
    return calculatePlayerStats(allTournaments, userData.uid);
  }, [allTournaments, userData?.uid]);

  const stats = [
    { label: 'Tournaments played', value: playerStats.tournamentsPlayed.toString() },
    { label: 'Trophies won', value: playerStats.trophiesWon.toString() },
    { label: 'Matches won', value: playerStats.matchesWon.toString() },
    { label: 'Matches played', value: playerStats.matchesPlayed.toString() },
  ];

  const hostedTournaments = getHostedTournaments();
  const joinedTournaments = getJoinedTournaments();

  const displayedTournaments = activeTab === 'Hosted' ? hostedTournaments : joinedTournaments;

  const handleTournamentPress = (tournament) => {
    navigation.navigate('TournamentDetails', {
      tournament,
      onAuthRequired: onCreateAccount,
    });
  };

  // Empty state for non-authenticated users
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <MobileHeader
          title="Profile"
          rightIcon={false}
        />

        <View style={styles.emptyStateContainer}>
          <View style={styles.emptyStateContent}>
            <Image
              source={require('../../../assets/noplayer.png')}
              style={styles.emptyStateImage}
            />

            <Text style={styles.emptyStateTitle}>No Profile Yet</Text>
            <Text style={styles.emptyStateDescription}>
              Create an account to track your tournaments, stats, and compete with friends
            </Text>

            <Button
              title="Create account"
              onPress={onCreateAccount}
              variant="primary"
              fullWidth={false}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MobileHeader
        title="Profile"
        rightIcon={true}
        RightIconComponent={SettingsIcon}
        onRightPress={() => navigation.navigate('Settings')}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 60 + Spacing.space4 }]}
        showsVerticalScrollIndicator={false}
      >

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            {userData?.avatarUri ? (
              <Image
                source={{ uri: userData.avatarUri }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitials} allowFontScaling={false}>
                  {userData?.firstName?.[0]?.toUpperCase()}{userData?.lastName?.[0]?.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <Text style={styles.profileName}>
            {userData?.firstName} {userData?.lastName}
          </Text>

          <TouchableOpacity
            style={styles.editButton}
            onPress={() => setShowEditModal(true)}
          >
            <EditIcon width={20} height={20} color={Colors.neutral400} />
            <Text style={styles.editText}>Edit profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <View key={index} style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Tab Selector */}
        <View style={styles.tabSelectorContainer}>
          <TabSelector
            tabs={['Hosted', 'Joined']}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </View>

        {/* Tournaments List */}
        <View style={styles.tournamentsSection}>
          {displayedTournaments.map((tournament) => {
            const isHost = userData && tournament.hostId === userData.uid;
            // Check if user is in any of the teams
            const userJoined = tournament.teams?.some(team =>
              team.player1?.userId === userData?.uid ||
              team.player2?.userId === userData?.uid
            ) || false;

            // Extract avatars from teams (max 4 players)
            const avatars = [];
            // Calculate actual registered teams from teams array (more reliable than stored value)
            let actualRegisteredTeams = 0;

            if (tournament.teams && Array.isArray(tournament.teams)) {
              for (const team of tournament.teams) {
                // Count team as registered if it has both players
                if (team.player1 && team.player2) {
                  actualRegisteredTeams++;
                }

                if (team.player1 && avatars.length < 4) {
                  avatars.push(
                    <Avatar
                      key={`player1-${avatars.length}`}
                      size="small"
                      source={team.player1.avatarSource}
                      name={`${team.player1.firstName} ${team.player1.lastName}`}
                    />
                  );
                }
                if (team.player2 && avatars.length < 4) {
                  avatars.push(
                    <Avatar
                      key={`player2-${avatars.length}`}
                      size="small"
                      source={team.player2.avatarSource}
                      name={`${team.player2.firstName} ${team.player2.lastName}`}
                    />
                  );
                }
                if (avatars.length >= 4) break;
              }
            }

            return (
              <TournamentCard
                key={tournament.id}
                status={tournament.status}
                title={tournament.name}
                location={tournament.location}
                dateTime={tournament.dateTime}
                teamCount={tournament.teamCount}
                registeredCount={actualRegisteredTeams}
                avatars={avatars}
                onPress={() => handleTournamentPress(tournament)}
                onActionPress={() => handleTournamentPress(tournament)}
                isHost={isHost}
                userJoined={userJoined}
                hostId={tournament.hostId}
              />
            );
          })}
        </View>
      </ScrollView>

      {/* Edit Profile Modal */}
      <EditProfileModal
        visible={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Spacing.space4,
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: Spacing.space4,
    paddingTop: 0,
    marginBottom: Spacing.space6,
  },
  avatarContainer: {
    marginBottom: Spacing.space3,
    width: 120,
    height: 120,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.primary300,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: Colors.primary300,
  },
  avatarInitials: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: 40,
    fontWeight: '600',
    color: Colors.surface,
    textAlign: 'center',
  },
  profileName: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline200,
    color: Colors.primary300,
    marginBottom: Spacing.space2,
    textAlign: 'center',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.space1,
  },
  editText: {
    fontFamily: 'GeneralSans-semibold',
    fontSize: Typography.body200,
    color: Colors.neutral400,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.space4,
    justifyContent: 'space-between',
    marginBottom: Spacing.space4,
  },
  statCard: {
    width: '49%',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginBottom: Spacing.space2,
  },
  statValue: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.body100,
    color: Colors.primary300,
    marginBottom: Spacing.space1,
  },
  statLabel: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body300,
    color: Colors.primary300,
    lineHeight: Typography.body300 * 1.1,
  },
  tabSelectorContainer: {
    paddingHorizontal: Spacing.space4,
    marginBottom: Spacing.space2,
  },
  tournamentsSection: {
    paddingHorizontal: Spacing.space4,
    marginTop: Spacing.space0,
  },
  sectionTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
    marginBottom: Spacing.space4,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.space8,
  },
  emptyStateContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  emptyStateImage: {
    width: 214,
    height: 214,
    resizeMode: 'contain',
  },
  emptyStateTitle: {
    fontFamily: 'GeneralSans-Semibold',
    fontSize: Typography.headline100,
    color: Colors.primary300,
    marginTop: Spacing.space8,
    marginBottom: Spacing.space2,
    textAlign: 'center',
    lineHeight: Typography.headline100 * 1.18,
  },
  emptyStateDescription: {
    fontFamily: 'GeneralSans-Medium',
    fontSize: Typography.body200,
    color: Colors.primary300,
    textAlign: 'center',
    maxWidth: 252,
    lineHeight: Typography.body200 * 1.5,
    marginBottom: Spacing.space8,
  },
});
